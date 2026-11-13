// Music checks that run without a browser.
//  1. The slot manifest in prepare-music.js matches js/view/music.js: ids, loop vs one-shot, the per-track gain,
//     replay of a finished stinger, no restart of a finished stinger on tap, no seek of a track still fading out.
//     js/view/music.js is run in a vm sandbox with a fake Audio, clock and timer.
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

// ---- 1. player behaviour in a sandbox

function loadPlayer() {
  let clock = 1000;
  const timers = [], docListeners = {};
  const made = [];
  class FakeAudio {
    constructor(src) {
      this.src = src; this.loop = false; this.volume = 0; this.currentTime = 0;
      this.paused = true; this.ended = false; this.plays = 0;
      made.push(this);
    }
    play() { this.plays++; this.paused = false; this.ended = false; return Promise.resolve(); }
    pause() { this.paused = true; }
    addEventListener() {}
  }
  const ctx = {
    P: { Settings: {} }, Audio: FakeAudio, performance: { now: () => clock },
    setInterval: fn => { timers.push(fn); return timers.length; }, clearInterval: () => {},
    setTimeout: () => 0, clearTimeout: () => {},
    document: { currentScript: null, addEventListener: (ev, fn) => { docListeners[ev] = fn; } }
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/view/music.js'), 'utf8'), ctx, { filename: 'js/view/music.js' });
  return {
    M: ctx.P.Music, made,
    el: id => made.find(e => e.src.endsWith('/' + id + '.mp3') || e.src.endsWith(id + '.mp3')),
    advance: sec => { clock += sec * 1000; timers.forEach(fn => fn()); },
    tap: () => { if (docListeners.pointerdown) docListeners.pointerdown(); }
  };
}

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
  ok(v.volume > 0.6, 'victory fades in');
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

{ // per-track gain: comic sits at -2 dB, the others at unity
  const p = loadPlayer();
  p.M.play('comic'); p.advance(3);
  const c = p.el('comic').volume, g = Math.pow(10, -2 / 20);
  ok(Math.abs(c - 0.7 * g) < 0.005, 'comic is trimmed -2 dB (volume ' + c.toFixed(3) + ', want ' + (0.7 * g).toFixed(3) + ')');
  const q = loadPlayer();
  q.M.play('title'); q.advance(3);
  ok(Math.abs(q.el('title').volume - 0.7) < 0.005, 'title has no trim (volume ' + q.el('title').volume.toFixed(3) + ')');
}

{ // a track still fading out is not rewound when it is played again
  const p = loadPlayer();
  p.M.play('title'); p.advance(3);
  const t = p.el('title'); t.currentTime = 42;
  p.M.play('map'); p.advance(0.2);
  p.M.play('title');
  ok(t.currentTime === 42, 'a replayed track still fading out keeps its position (' + t.currentTime + ')');
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
    fs.copyFileSync(path.join(musicDir, 'boss.mp3'), path.join(dst, 'boss.mp3'));   // a placeholder to back up
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

console.log(fails ? fails + ' failure(s), ' + warns + ' warning(s)' : 'test-music: all pass' + (warns ? ' (' + warns + ' warning(s))' : ''));
process.exit(fails ? 1 : 0);
