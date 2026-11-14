// Music checks that run without a browser.
//  1. The player (js/view/music.js) in a vm sandbox with a fake Audio, AudioContext, clock, timers and document:
//     the slot manifest in prepare-music.js (ids, loop vs one-shot, the per-track gain, replay of a finished stinger, no
//     restart of a finished stinger on tap or on show, no seek of a track still fading out), the iOS route (every track
//     through Web Audio, gains that really change, one source per element), the file:// fallback, the scene sequence
//     (title, map, run, boss, results, rapid repeats, hide and show, stop), and the regressions: a layer that stopped
//     while its calm track went on (drift), a track interrupted while loading (AbortError), a start the browser blocked.
//  2. Names and lengths: the files in prototype/audio/music/ (prepared files must have the exact slot length;
//     placeholders are reported, not failed) and the owner's drop folder README.
//  3. prepare-music.js on synthetic sine input in the OS temp folder: a loop and a stinger are written at exact
//     lengths and -16 LUFS, a short file is rejected, a placeholder is backed up once. Skipped with --quick or
//     when ffmpeg is missing (tens of seconds).
// Usage: node prototype/tools/test-music.js [--quick]
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), vm = require('vm');
const { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const prep = require('./prepare-music.js');

let fails = 0, warns = 0;
function ok(c, m) { if (!c) { fails++; console.log('FAIL ' + m); } }
function warn(m) { warns++; console.log('WARN ' + m); }
const hasFfmpeg = spawnSync('ffmpeg', ['-version']).status === 0 && spawnSync('ffprobe', ['-version']).status === 0;
const quick = process.argv.includes('--quick');
const TICK_MS = 50, FADE_MS = 1200, SLACK_MS = 100;   // the player's tick, its crossfade length, and the timing slack
const VOL = 0.7;                                      // the player's default music level (before settings)

// ---- 1. player behaviour in a sandbox

// A fake page. opts.route: the SFX mixer exists (P.Sfx.mixInput) and the page is http, so the player routes every
// track through a fake AudioContext (one MediaElementAudioSourceNode per element -> GainNode -> limiter). The audible
// level of a track is then its gain node's value; without the route it is the element volume.
// opts.file: the page is file://. opts.moving: a playing element's playhead moves with the clock.
// flags.block: play() is refused (NotAllowedError). flags.slow: play() is left loading; pause() rejects it with
// AbortError, as the spec says. opts.iosVolume: writes to element volume are ignored and it reads 1 (iOS Safari).
function loadPlayer(opts) {
  opts = opts || {};
  let clock = 1000;
  const timers = [], timeouts = [], docListeners = {}, watchers = [], made = [];
  const flags = { block: false, slow: false };
  const doc = { currentScript: null, hidden: false, addEventListener: (ev, fn) => { docListeners[ev] = fn; } };
  class FakeAudio {
    constructor(src) {
      this.src = src; this.loop = false; this._vol = 1; this.currentTime = 0;
      this.paused = true; this.ended = false; this.plays = 0; this._rej = null;
      made.push(this);
    }
    get volume() { return this._vol; }
    set volume(v) { if (!opts.iosVolume) this._vol = v; }
    play() {
      this.plays++;
      if (flags.block) return Promise.reject(Object.assign(new Error('blocked'), { name: 'NotAllowedError' }));
      this.paused = false; this.ended = false;
      if (flags.slow) return new Promise((res, rej) => { this._rej = rej; });
      return Promise.resolve();
    }
    pause() {
      this.paused = true;
      if (this._rej) { const rej = this._rej; this._rej = null; rej(Object.assign(new Error('interrupted by pause()'), { name: 'AbortError' })); }
    }
    addEventListener() {}
  }
  class Param { constructor(v) { this.value = v; } setValueAtTime() {} linearRampToValueAtTime() {} setTargetAtTime() {} cancelScheduledValues() {} }
  class Node { constructor(c) { this.context = c; this.outs = []; } connect(n) { this.outs.push(n); return n; } disconnect() {} }
  const actx = { state: 'running', currentTime: 0, resumes: 0, sources: 0, dupes: 0 };
  actx.createGain = () => { const g = new Node(actx); g.gain = new Param(1); return g; };
  actx.createMediaElementSource = el => {
    if (el.__src) { actx.dupes++; throw new Error('InvalidStateError: this element already has a source node'); }
    const n = new Node(actx); n.el = el; el.__src = n; actx.sources++; return n;
  };
  actx.resume = () => { actx.resumes++; actx.state = 'running'; return Promise.resolve(); };
  const limiter = new Node(actx), destination = new Node(actx);
  limiter.connect(destination);
  const P = { Settings: {} };
  if (opts.route) P.Sfx = { mixInput: () => limiter };
  const ctx = {
    P, Audio: FakeAudio, performance: { now: () => clock },
    setInterval: fn => { timers.push(fn); return timers.length; }, clearInterval: () => {},
    setTimeout: (fn, ms) => { timeouts.push({ at: clock + (ms || 0), fn, done: false }); return timeouts.length; },
    clearTimeout: id => { if (timeouts[id - 1]) timeouts[id - 1].done = true; },
    document: doc, location: { protocol: opts.file ? 'file:' : 'http:' }
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/view/music.js'), 'utf8'), ctx, { filename: 'js/view/music.js' });
  const fire = ev => { if (docListeners[ev]) docListeners[ev](); };
  const heard = el => {
    if (el.paused || el.ended) return 0;
    return el.__src ? el.__src.outs[0].gain.value : el.volume;
  };
  function advance(sec) {
    const n = Math.round(sec * 1000 / TICK_MS);
    for (let i = 0; i < n; i++) {
      clock += TICK_MS;
      actx.currentTime = clock / 1000;
      if (opts.moving) made.forEach(e => { if (!e.paused && !e.ended) e.currentTime += TICK_MS / 1000; });
      timeouts.forEach(x => { if (!x.done && x.at <= clock) { x.done = true; x.fn(); } });
      timers.slice().forEach(fn => fn());
      watchers.slice().forEach(fn => fn());
    }
  }
  return {
    M: ctx.P.Music, P, made, actx, flags, doc, heard, advance, fire,
    tap: () => fire('pointerdown'),
    el: id => made.find(e => e.src.endsWith('/' + id + '.mp3')),
    setHidden: v => { doc.hidden = v; fire('visibilitychange'); },
    watch: fn => { watchers.push(fn); },
    now: () => clock
  };
}
const idOf = e => e.src.split('/').pop().replace(/\.mp3$/, '');
const songOf = id => (id === 'run_calm' || id === 'run_intense') ? 'run' : id;

const manifest = prep.SLOTS;
const musicSrc = fs.readFileSync(path.join(ROOT, 'js/view/music.js'), 'utf8');
ok(!/\bfetch\s*\(|decodeAudioData/.test(musicSrc), 'music.js uses no fetch or decodeAudioData (must work over file://)');

{
  const p = loadPlayer();
  const ids = manifest.map(s => s.id).sort().join(',');
  ok(p.M.ids.slice().sort().join(',') === ids, 'music.js ids match prepare-music.js SLOTS (' + p.M.ids.join(',') + ')');
  for (const s of manifest) {
    const q = loadPlayer();
    q.M.play(s.id);
    const e = q.el(s.id);
    ok(!!e, s.id + ': play() creates ' + s.id + '.mp3');
    ok(e && e.loop === (s.kind === 'loop'), s.id + ': loop=' + (s.kind === 'loop') + ' (' + s.kind + ')');
  }
  const r = loadPlayer();
  r.M.play('run_calm');
  ok(r.el('run_intense') && r.el('run_intense').loop === true, 'run_intense layer loops with run_calm');
}

{ // stinger: replay after it has finished, and no restart on tap
  const p = loadPlayer();
  p.M.unlock();                                    // attaches the tap listeners, as main.js does on the first gesture
  p.M.play('victory');
  const v = p.el('victory');
  p.advance(2);
  ok(p.heard(v) > 0.6, 'victory fades in');
  v.ended = true; v.paused = true;                 // the browser reached the end of a one-shot
  p.tap();
  ok(v.plays === 1, 'a tap does not restart a finished one-shot (plays=' + v.plays + ')');
  p.M.play('victory');
  ok(v.plays === 2 && v.currentTime === 0, 'play() replays a finished one-shot from the start');
}

{ // a looping track that the browser blocked is still retried by a tap
  const p = loadPlayer();
  p.M.unlock();
  p.M.play('title');
  const t = p.el('title');
  t.paused = true; t.plays = 0;
  p.tap();
  ok(t.plays === 1, 'a tap retries a blocked loop');
}

for (const route of [false, true]) { // per-track gain: comic sits at -2 dB, the others at unity (both routes)
  const tag = route ? ' (Web Audio route)' : ' (element volume)';
  const p = loadPlayer({ route });
  p.M.play('comic'); p.advance(3);
  const c = p.heard(p.el('comic')), g = Math.pow(10, -2 / 20);
  ok(Math.abs(c - VOL * g) < 0.005, 'comic is trimmed -2 dB' + tag + ' (' + c.toFixed(3) + ', want ' + (VOL * g).toFixed(3) + ')');
  const q = loadPlayer({ route });
  q.M.play('title'); q.advance(3);
  ok(Math.abs(q.heard(q.el('title')) - VOL) < 0.005, 'title has no trim' + tag + ' (' + q.heard(q.el('title')).toFixed(3) + ')');
}

{ // a track still fading out is not rewound when it is played again
  const p = loadPlayer();
  p.M.play('title'); p.advance(3);
  const t = p.el('title'); t.currentTime = 42;
  p.M.play('map'); p.advance(0.2);
  p.M.play('title');
  ok(t.currentTime === 42, 'a replayed track still fading out keeps its position (' + t.currentTime + ')');
}

// ---- 1b. the iOS route: element volume is not used, gains are real

{
  const h = loadPlayer({ route: true }), M = h.M;
  M.play('title');
  const t = h.el('title');
  ok(t.__src && t.__src.outs[0] && t.__src.outs[0].gain, 'route: title is a Web Audio source feeding a gain node');
  ok(t.volume === 1, 'route: the element volume is left at 1 (iOS ignores writes to it)');
  ok(h.heard(t) === 0 || h.heard(t) < 0.01, 'route: a track starts silent and fades in');
  h.advance(2);
  ok(Math.abs(h.heard(t) - VOL) < 0.005, 'route: the fade-in reaches the music level (' + h.heard(t).toFixed(3) + ')');
  ok(h.actx.sources === 1 && h.actx.dupes === 0, 'route: one source node per element');
}

{ // the run pair on the route: at intensity 0 the layer is silent, at 1 the calm stem is silent, the power sum is constant
  const h = loadPlayer({ route: true }), M = h.M;
  M.play('run_calm'); h.advance(2.5);
  const c = h.el('run_calm'), i = h.el('run_intense');
  ok(h.heard(c) > 0.69 && h.heard(i) < 0.001, 'route: at intensity 0 only calm is audible (calm ' + h.heard(c).toFixed(3) + ', intense ' + h.heard(i).toFixed(3) + ')');
  for (const x of [0.5, 1]) {
    M.intensity(x); h.advance(2.6);
    const sum = h.heard(c) ** 2 + h.heard(i) ** 2;
    ok(Math.abs(sum - VOL * VOL) < 0.01, 'route: equal power at intensity ' + x + ' (sum ' + sum.toFixed(3) + ')');
  }
  ok(h.heard(c) < 0.001 && Math.abs(h.heard(i) - VOL) < 0.005, 'route: at intensity 1 only intense is audible');
  ok(h.actx.sources === 2, 'route: the pair has two source nodes, one each');
}

{ // ducking reaches the gain on the route (the element volume would be ignored on iOS)
  const h = loadPlayer({ route: true }), M = h.M;
  M.play('title'); h.advance(2.5);
  const before = h.heard(h.el('title'));
  M.duckFor(1.5); h.advance(1.0);
  const during = h.heard(h.el('title'));
  h.advance(3.0);
  const after = h.heard(h.el('title'));
  ok(during < before * 0.5, 'route: duckFor drops the music (' + during.toFixed(3) + ' from ' + before.toFixed(3) + ')');
  ok(Math.abs(after - before) < 0.01, 'route: the duck is released (' + after.toFixed(3) + ')');
}

{ // file:// keeps the element volume and makes no source nodes (a file:// media source is silent for Web Audio)
  const h = loadPlayer({ route: true, file: true }), M = h.M;
  M.play('title'); h.advance(2.5);
  ok(h.actx.sources === 0, 'file://: no media source nodes');
  ok(Math.abs(h.el('title').volume - VOL) < 0.005, 'file://: element volume carries the level (' + h.el('title').volume.toFixed(3) + ')');
}

{ // SFX and music share one limiter on the way to the speakers, with the real sfx.js and music.js
  const timers = [], made = [], starts = [];
  let clock = 1000;
  class Param { constructor(v) { this.value = v; } setValueAtTime() {} linearRampToValueAtTime() {} setTargetAtTime() {} cancelScheduledValues() {} exponentialRampToValueAtTime() {} }
  class Node { constructor(c) { this.context = c; this.outs = []; } connect(n) { this.outs.push(n); return n; } disconnect() {} }
  class Buf { constructor(n, sr) { this.length = n; this.sampleRate = sr; this.duration = n / sr; this.d = new Float32Array(n); } getChannelData() { return this.d; } }
  const c = { state: 'running', sampleRate: 48000, nodes: [] };
  Object.defineProperty(c, 'currentTime', { get: () => clock / 1000 });
  c.destination = new Node(c);
  const mk = extra => { const n = Object.assign(new Node(c), extra); c.nodes.push(n); return n; };
  c.createGain = () => mk({ gain: new Param(1) });
  c.createDynamicsCompressor = () => mk({ threshold: new Param(0), knee: new Param(0), ratio: new Param(0), attack: new Param(0), release: new Param(0), isLimiter: true });
  c.createConvolver = () => mk({ buffer: null });
  c.createStereoPanner = () => mk({ pan: new Param(0) });
  c.createBuffer = (ch, n, sr) => new Buf(n, sr);
  c.createBufferSource = () => { const s = mk({ buffer: null, loop: false, playbackRate: new Param(1), onended: null }); s.start = () => starts.push(s); s.stop = () => {}; return s; };
  c.createMediaElementSource = el => { const n = mk({ el }); el.__src = n; return n; };
  c.resume = () => Promise.resolve();
  class SAudio { constructor(src) { this.src = src; this.paused = true; this.ended = false; this.volume = 1; this.currentTime = 0; made.push(this); } play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; } addEventListener() {} }
  const doc = { currentScript: null, hidden: false, addEventListener() {} };
  const sbx = { P: { Settings: {} }, window: { AudioContext: function () { return c; } }, performance: { now: () => clock },
    setInterval: fn => { timers.push(fn); return timers.length; }, clearInterval() {}, setTimeout: () => 0, clearTimeout() {},
    document: doc, location: { protocol: 'http:' }, Audio: SAudio };
  vm.createContext(sbx);
  for (const f of ['js/view/sfx-bank.js', 'js/view/sfx-bank2.js', 'js/view/sfx.js', 'js/view/music.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sbx, { filename: f });
  }
  const P = sbx.P;
  P.Music.unlock(); P.Music.play('title');
  for (let i = 0; i < 40; i++) { clock += TICK_MS; timers.forEach(fn => fn()); }
  P.Sfx.play('splat', 0, {});
  const sfxSrc = starts[starts.length - 1];
  const limiter = c.nodes.find(n => n.isLimiter);
  const reaches = (from, to) => {
    if (!from || !to) return false;
    const seen = new Set(), q = [from];
    while (q.length) { const n = q.shift(); if (n === to) return true; if (seen.has(n)) continue; seen.add(n); (n.outs || []).forEach(x => q.push(x)); }
    return false;
  };
  const titleEl = made.find(e => /title\.mp3$/.test(e.src)), musicNode = titleEl && titleEl.__src;
  ok(!!sfxSrc && !!limiter, 'sfx+music: an effect and the limiter exist');
  ok(sfxSrc && reaches(sfxSrc, c.destination) && reaches(sfxSrc, limiter), 'sfx+music: an effect reaches the speakers through the limiter while music plays');
  ok(reaches(musicNode, limiter) && reaches(musicNode, c.destination), 'sfx+music: the music track reaches the speakers through the same limiter');
  const settings = fs.readFileSync(path.join(ROOT, 'js/view/settings.js'), 'utf8');
  const base = /MUSIC_BASE\s*=\s*([0-9.]+)/.exec(settings);
  if (base && Number(base[1]) > 0.5) warn('settings.js MUSIC_BASE = ' + base[1] + ': at 100% the music sits close to the sound effects; 0.5 keeps effects clearly above it (proposed)');
}

// ---- 1c. the scene sequence, on both routes and with a moving playhead

function sequence(name, o) {
  const h = loadPlayer(o), M = h.M;
  M.unlock();                                             // main.js calls unlock() on Start: this attaches the tap and show listeners
  let lastChange = -1e9, overlap = null;
  const audibleSongs = () => {
    const s = new Set();
    h.made.forEach(e => { if (h.heard(e) > 0.001) s.add(songOf(idOf(e))); });
    return s;
  };
  // At most one song is audible, except during the FADE seconds after a change of track.
  h.watch(() => {
    const songs = audibleSongs(), since = h.now() - lastChange;
    if (songs.size > 1 && since > FADE_MS + SLACK_MS && !overlap) overlap = [...songs].join(' + ') + ' audible ' + (since / 1000).toFixed(2) + ' s after the last change';
  });
  // A change of track. The outgoing tracks must fade, not cut: half way through the crossfade each is quieter than it was.
  // quick: no wait (for rapid changes, which are measured by the overlap check only).
  const change = (fn, quick) => {
    const before = h.made.filter(e => h.heard(e) > 0.1).map(e => ({ id: idOf(e), g: h.heard(e) }));
    lastChange = h.now(); fn();
    if (quick) return;
    h.advance(0.6);
    before.forEach(b => {
      if (songOf(b.id) === songOf(M.current() || '')) return;
      const g = h.heard(h.el(b.id));
      ok(g < 0.8 * b.g, name + ': ' + b.id + ' fades out after a change (' + g.toFixed(3) + ' from ' + b.g.toFixed(3) + ')');
    });
  };
  const running = () => h.made.filter(e => !e.paused && !e.ended).map(idOf).sort();
  // Settles, then checks the current track and that exactly the expected elements run (a run is two stems of one song).
  function settle(label, current, want, sec) {
    h.advance(sec || FADE_MS / 1000 + 0.6);
    const got = running(), wantSorted = want.slice().sort();
    ok(M.current() === current, name + '/' + label + ': current is ' + current + ' (got ' + M.current() + ')');
    ok(JSON.stringify(got) === JSON.stringify(wantSorted), name + '/' + label + ': running ' + JSON.stringify(got) + ', want ' + JSON.stringify(wantSorted));
    if (want.length === 2) {
      const a = h.el('run_calm'), b = h.el('run_intense');
      ok(Math.abs(a.currentTime - b.currentTime) < 0.1, name + '/' + label + ': the run stems are in step (' + a.currentTime.toFixed(2) + ', ' + b.currentTime.toFixed(2) + ')');
      const sum = h.heard(a) ** 2 + h.heard(b) ** 2;
      ok(Math.abs(sum - VOL * VOL) < 0.01, name + '/' + label + ': the run stems keep equal power (' + sum.toFixed(3) + ')');
    }
  }
  const endStinger = id => { const e = h.el(id); e.ended = true; e.paused = true; };

  change(() => M.play('title'));                          settle('title', 'title', ['title'], 2.5);
  change(() => M.play('map'));                            settle('map', 'map', ['map']);
  change(() => M.play('run_calm'));                       settle('run', 'run_calm', ['run_calm', 'run_intense']);
  M.intensity(0.8);                                       settle('run, intensity 0.8', 'run_calm', ['run_calm', 'run_intense'], 2.6);
  change(() => M.play('boss'));                           settle('boss', 'boss', ['boss']);
  change(() => M.play('run_calm'));                       settle('run after boss', 'run_calm', ['run_calm', 'run_intense']);
  change(() => { M.play('run_calm'); M.play('run_calm'); M.play('run_calm'); });
                                                          settle('repeated play', 'run_calm', ['run_calm', 'run_intense']);
  change(() => M.play('map'), true); h.advance(0.2);
  change(() => M.play('run_calm'), true); h.advance(0.2);
  change(() => M.play('map'), true); h.advance(0.2);
  change(() => M.play('boss'), true);                     settle('rapid changes', 'boss', ['boss']);
  change(() => M.play('victory')); h.advance(1.0); endStinger('victory');
                                                          settle('victory', 'victory', []);
  h.setHidden(true); h.advance(2);                        settle('hidden after the stinger', 'victory', []);
  h.setHidden(false);                                     settle('shown again: a finished stinger stays finished', 'victory', []);
  change(() => M.play('map'));                            settle('results to map', 'map', ['map']);
  change(() => M.play('run_calm'));                       settle('map to run', 'run_calm', ['run_calm', 'run_intense']);
  h.setHidden(true); h.advance(3);                        settle('hidden mid-run: silent', 'run_calm', []);
  h.setHidden(false);                                     settle('shown mid-run: the pair resumes in step', 'run_calm', ['run_calm', 'run_intense']);
  change(() => M.play('defeat')); h.advance(1.0); endStinger('defeat');
                                                          settle('defeat', 'defeat', []);
  change(() => M.play('comic'));                          settle('comic', 'comic', ['comic']);
  change(() => M.stop());                                 settle('stop', null, []);
  change(() => M.play('title'));                          settle('title again', 'title', ['title']);

  ok(overlap === null, name + ': one song at a time outside the crossfade (' + (overlap || 'no overlap') + ')');
  ok(new Set(h.made.map(idOf)).size === h.made.length, name + ': one element per track id');
  if (o.route) {
    ok(h.actx.dupes === 0, name + ': no element gets a second source node');
    ok(h.actx.sources === h.made.length, name + ': every track is routed (' + h.actx.sources + ' of ' + h.made.length + ')');
    ok(h.made.every(e => e.volume === 1), name + ': the element volume stays at 1 on the route');
  } else {
    ok(h.actx.sources === 0, name + ': no source nodes without the route');
  }
}
sequence('element volume', { route: false, moving: true });
sequence('web audio route', { route: true, moving: true });
sequence('web audio route, iOS ignores element volume', { route: true, moving: true, iosVolume: true });

{ // regression: the layer stopped while its calm track went on; a restart must not leave the stems apart
  const h = loadPlayer({ route: true, moving: true }), M = h.M;
  M.play('run_calm'); h.advance(3);          // intensity 0: the layer sits at zero and is not running on its own
  M.play('boss'); h.advance(0.5);
  M.play('run_calm'); h.advance(0.3);
  const d = Math.abs(h.el('run_calm').currentTime - h.el('run_intense').currentTime);
  ok(d < 0.1, 'a run restarted within the crossfade keeps both stems at one position (apart by ' + d.toFixed(2) + ' s)');
}

// The browser reports a rejected play() a microtask later, so this one waits for the promise callbacks to run.
const pending = [];
const microtasks = async () => { for (let i = 0; i < 5; i++) await Promise.resolve(); };
pending.push((async () => { // regression: a track interrupted while loading (pause() during play()) is not written off as missing
  const h = loadPlayer(), M = h.M;
  h.flags.slow = true;
  M.play('map'); h.advance(0.5);
  M.play('title'); h.advance(2);             // the map fades out and is paused while its play() is still pending
  await microtasks();
  h.flags.slow = false;
  M.play('map'); h.advance(0.1);
  ok(M.current() === 'map' && !h.el('map').paused, 'a track interrupted while loading plays again later');
})());

{ // regression: a start the browser blocked is retried by the player, a tap is not needed
  const h = loadPlayer({ route: true }), M = h.M;
  h.flags.block = true;
  M.play('run_calm'); h.advance(0.2);
  ok(h.el('run_calm').paused && h.el('run_intense').paused, 'blocked: both stems wait for a gesture');
  h.flags.block = false;
  h.advance(0.7);
  ok(!h.el('run_calm').paused && !h.el('run_intense').paused, 'blocked: both stems start once the browser allows playback, without a tap');
}

{ // the context is resumed when iOS interrupts it, on a tap
  const h = loadPlayer({ route: true }), M = h.M;
  M.unlock();
  M.play('title'); h.advance(0.1);
  h.actx.state = 'interrupted';
  h.tap();
  ok(h.actx.resumes > 0 && h.actx.state === 'running', 'an interrupted context is resumed on a tap');
}

// ---- 2. files and the drop folder

const musicDir = path.join(ROOT, 'audio', 'music'), dropDir = path.join(ROOT, 'audio', 'music-suno');
const dropReadme = path.join(dropDir, 'README.md');
ok(fs.existsSync(dropReadme), 'audio/music-suno/README.md exists');
if (fs.existsSync(dropReadme)) {
  const txt = fs.readFileSync(dropReadme, 'utf8');
  for (const s of manifest) ok(txt.indexOf(s.id + '.wav') >= 0 || txt.indexOf(s.id + '.mp3') >= 0, 'drop README names ' + s.id + '.wav or .mp3');
}
const musicReadme = fs.readFileSync(path.join(musicDir, 'README.md'), 'utf8');
for (const s of manifest) ok(musicReadme.indexOf('`' + s.id + '.mp3`') >= 0, 'audio/music/README.md lists ' + s.id + '.mp3');

if (hasFfmpeg) {
  const lens = {};
  for (const s of manifest) {
    const f = path.join(musicDir, s.id + '.mp3');
    if (!fs.existsSync(f)) { warn('audio/music/' + s.id + '.mp3 is missing (the game is silent for this slot)'); continue; }
    const info = prep.ffprobe(f);
    lens[s.id] = info.duration;
    if (info.comment.indexOf(prep.TAG) === 0) {
      ok(Math.abs(info.duration - s.sec) < 0.005, s.id + '.mp3 (prepared) is ' + info.duration.toFixed(3) + ' s, slot needs ' + s.sec + ' s');
    } else if (Math.abs(info.duration - s.sec) > 0.5) {
      console.log('note ' + s.id + '.mp3 is a placeholder (' + info.duration.toFixed(1) + ' s, slot target ' + s.sec + ' s)');
    }
  }
  if (lens.run_calm !== undefined && lens.run_intense !== undefined && Math.abs(lens.run_calm - lens.run_intense) > 0.01) {
    warn('run_calm (' + lens.run_calm.toFixed(3) + ' s) and run_intense (' + lens.run_intense.toFixed(3) + ' s) differ: the layers will drift');
  }
}

// ---- 3. the tool on synthetic input in the temp folder

function synth(file, sec, rate, freq) {
  const expr = `0.25*sin(2*PI*${freq}*t)*(0.6+0.4*sin(2*PI*0.5*t))+0.1*sin(2*PI*${freq * 3.01}*t)`;
  // No shell here, so no quotes around the expression: they would reach ffmpeg as part of the filter.
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', `aevalsrc=${expr}|${expr}:s=${rate}:d=${sec}`, file]);
  if (r.status !== 0) throw new Error('synth failed');
}

if (hasFfmpeg && !quick) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'test-music-'));
  try {
    const src = path.join(tmp, 'src'), dst = path.join(tmp, 'music'), backup = path.join(tmp, 'music-procedural');
    fs.mkdirSync(src); fs.mkdirSync(dst);
    synth(path.join(src, 'comic.wav'), 121.5, 48000, 220.3);      // exactly target + crossfade, 48 kHz source
    synth(path.join(src, 'victory.mp3'), 22, 44100, 330.7);       // longer than 20 s: trimmed
    synth(path.join(src, 'map.wav'), 100, 44100, 110.1);          // too short for a 150 s loop
    synth(path.join(src, 'Title.wav'), 10, 44100, 220.1);         // wrong case: ignored with a note
    synth(path.join(dst, 'boss.mp3'), 3, 44100, 150.2);           // an untagged placeholder to back up (the shipped boss.mp3 is prepared now)
    const rep = prep.prepare({ src, dst, backup, only: ['comic', 'victory', 'map', 'boss'] });
    const row = id => rep.rows.find(r => r.id === id);
    ok(row('comic') && row('comic').status === 'written', 'comic is written from a 121.5 s source');
    ok(row('victory') && row('victory').status === 'written', 'victory is written and trimmed');
    ok(row('map') && row('map').status === 'rejected' && /too short/.test(row('map').note), 'map (100 s) is rejected as too short');
    ok(row('boss') && row('boss').status === 'placeholder', 'boss with no source is left as the placeholder');
    ok(rep.notes.some(n => /ignored Title\.wav/.test(n)), 'Title.wav is ignored with a rename note');
    ok(fs.existsSync(path.join(backup, 'boss.mp3')), 'the first run backs up the placeholder');
    if (row('comic') && row('comic').status === 'written') {
      const c = prep.ffprobe(path.join(dst, 'comic.mp3'));
      ok(Math.abs(c.duration - 120) < 0.002, 'comic output is 120.000 s (' + c.duration.toFixed(4) + ')');
      ok(c.comment.indexOf(prep.TAG) === 0, 'comic output carries the prepared tag');
      ok(Math.abs(row('comic').after.I + 16) < 0.5, 'comic is -16 LUFS +/- 0.5 (' + row('comic').after.I.toFixed(2) + ')');
      ok(row('comic').after.TP <= -1, 'comic true peak is at or below -1 dBTP');
      ok(row('comic').seam.ratio < 4, 'comic loop point has no click (seam ' + row('comic').seam.ratio.toFixed(2) + 'x)');
    }
    if (row('victory') && row('victory').status === 'written') {
      const v = prep.ffprobe(path.join(dst, 'victory.mp3'));
      ok(Math.abs(v.duration - 20) < 0.002, 'victory output is 20.000 s (' + v.duration.toFixed(4) + ')');
    }
    const again = prep.prepare({ src, dst, backup, only: ['victory'] });
    ok(again.backedUp.length === 0, 'a second run does not back up prepared files or overwrite the backup');
    ok(fs.readdirSync(backup).length === 1, 'the backup folder still holds only the one placeholder');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
} else {
  console.log(hasFfmpeg ? 'skip: tool self-test (--quick)' : 'skip: tool self-test (ffmpeg not found)');
}

Promise.all(pending).then(() => {
  console.log(fails ? fails + ' failure(s), ' + warns + ' warning(s)' : 'test-music: all pass' + (warns ? ' (' + warns + ' warning(s))' : ''));
  process.exit(fails ? 1 : 0);
});
