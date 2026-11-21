// Music player for audio/music/<id>.mp3: one streamed HTMLAudioElement per track (no fetch, no decode).
// iOS Safari ignores HTMLMediaElement.volume (it reads 1 and writes do nothing), so over http(s) every track is routed
// through Web Audio: MediaElementAudioSourceNode -> per-track GainNode -> the SFX master limiter (P.Sfx.mixInput()).
// Fades, the comic trim and the duck are then real gains on the phone. Over file:// (Chromium
// silences a file:// media source for Web Audio) and without Web Audio, the element volume is used, as before.
// A missing file fails silently. Files resolve from this script's own URL (override with P.Music.base).
// Music uses the owner's eight prepared MP3s. tools/prepare-music.js keeps the player IDs and exact loop lengths.
// API: play(id, {fade}) | stop(fade) | duck(on) | duckFor(seconds) | setVolume(0..1) | unlock() | current() | ids
// A scene change silences the outgoing track before starting the next.
// Music has its own switch: P.Settings.music === false mutes it (the "Sound effects" toggle does not).
// A hidden page pauses the music; a shown page starts the tracks that should be playing.
P.Music = (function () {
  var IDS = ['title', 'map', 'run_calm', 'run_intense', 'boss', 'comic', 'victory', 'defeat'];
  var ONE_SHOT = { victory: 1, defeat: 1 }, DUCK = 0.355, TICK = 50, FADE = 1.2, RETRY = 0.5;
  // Per-track trim (linear). The tool masters every file to -16 LUFS; comic is a dialogue bed and sits at the -18 LUFS of
  // docs/audio-cue-sheet.md (-2 dB).
  var GAIN = { comic: Math.pow(10, -2 / 20) };
  var slots = {}, missing = {}, main = null, vol = 0.7, duckOn = false, duckCur = 1, duckTimer = null;
  var scoreRun = null, scoreAge = 0, sampleIn = 0, dangerFor = 0, quietFor = 0;
  var timer = null, listening = false, hidden = false, graph, lastMix = '';   // graph: undefined until the first track, then {ctx, out} or null
  function now() { return performance.now() / 1000; }
  function clamp01(v) { v = Number(v); return v !== v ? 0 : (v < 0 ? 0 : (v > 1 ? 1 : v)); }
  function resolveBase() {
    var here = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : '';
    try { return here ? new URL('../../audio/music/', here).href : 'audio/music/'; } catch (e) { return 'audio/music/'; }
  }
  function fileOrigin() { return typeof location !== 'undefined' && !!location && location.protocol === 'file:'; }
  // The Web Audio route, decided once at the first track. Null means element volume (file://, no Web Audio, no mixer).
  function route() {
    var out = null, c;
    if (graph !== undefined) return graph;
    graph = null;
    try { out = P.Sfx && P.Sfx.mixInput ? P.Sfx.mixInput() : null; } catch (e) { out = null; }
    c = out && out.context;
    if (c && !fileOrigin() && typeof c.createMediaElementSource === 'function' && typeof c.createGain === 'function') graph = { ctx: c, out: out };
    return graph;
  }
  // Routes one track: element -> source node -> gain (the track's level) -> limiter. A failure keeps the track on element volume.
  function wire(s) {
    var g = route(), c;
    if (!g) return;
    try {
      c = g.ctx;
      s.src = c.createMediaElementSource(s.el);
      s.g = c.createGain(); s.g.gain.value = 0;
      s.src.connect(s.g); s.g.connect(g.out);
      s.el.volume = 1;   // the element is only the source now
    } catch (e) { s.src = null; s.g = null; }
  }
  // Volume a slot should have now, from its fade ramp.
  function level(s, t) {
    var u = s.dur > 0 ? clamp01((t - s.t0) / s.dur) : 1;
    return s.from + (s.to - s.from) * u;
  }
  function active(s) { return s === main && !s.dead && !(ONE_SHOT[s.id] && s.el.ended); }
  function fadeTo(s, target, sec) {
    var t = now();
    if (Math.abs(s.to - target) < 0.005) return;
    s.from = level(s, t); s.to = target; s.t0 = t; s.dur = Math.max(0.01, sec || 0);
  }
  function each(fn) {
    for (var id in slots) if (Object.prototype.hasOwnProperty.call(slots, id)) fn(slots[id]);
  }
  // The output of a track: its gain node when routed, else the element volume.
  function setOut(s, v) {
    if (s.g) { if (s.g.gain.value !== v) s.g.gain.value = v; }
    else if (Math.abs(s.el.volume - v) > 0.001) s.el.volume = v;
  }
  function sync() {
    var t = now(), on = P.Settings && P.Settings.music === false ? 0 : 1;
    duckCur += ((duckOn ? DUCK : 1) - duckCur) * 0.15;
    each(function (s) {
      if (s.dead || (s.priming && s !== main)) return;
      setOut(s, clamp01(level(s, t)) * vol * duckCur * on * (GAIN[s.id] || 1));
      retry(s, t);
      if (!s.priming && s !== main && t >= s.t0 + s.dur && !s.el.paused) s.el.pause();
    });
    if (P.Tel && P.Tel.log) observeMix();
  }

  function observeMix() {
    var tracks = api.audibleTracks(), wanted = api.current(), output = graph ? graph.ctx.state : 'media', key = wanted + '|' + output + '|' + tracks.join(',');
    if (lastMix === key) return;
    lastMix = key;
    P.Tel.log('music_state', { requested: wanted, audio_context: output, audible: tracks });
  }
  function startTick() {
    if (!timer && typeof setInterval === 'function') timer = setInterval(sync, TICK);
  }
  function dropSlot(s) {
    s.dead = true;
    try { s.el.pause(); } catch (e) { /* ignore */ }
    if (main === s) main = null;
  }
  // The context feeds every routed track, so it has to run. One made before a gesture, or interrupted by the phone, is resumed here.
  function resumeCtx() {
    var p;
    if (!graph) return;
    try { p = graph.ctx.resume(); if (p && p.catch) p.catch(function () { /* blocked until a gesture */ }); } catch (e) { /* ignore */ }
  }
  function playEl(s) {
    var p;
    if (hidden) return;   // a hidden page starts nothing; showing it does (kick)
    if (s.g && graph && graph.ctx.state !== 'running') resumeCtx();
    try { p = s.el.play(); } catch (e) { p = null; }
    if (p && p.catch) {
      p.catch(function (e) {
        var n = e && e.name;
        if (n === 'NotAllowedError' || n === 'AbortError') return;   // blocked until a gesture; or paused while it was loading
        missing[s.id] = true; dropSlot(s);             // NotSupportedError: the file is missing or unplayable
      });
    }
  }
  // Retry a start the browser blocked while waiting for a gesture.
  function retry(s, t) {
    if (!active(s) || !s.el.paused || t < s.retryAt) return;
    s.retryAt = t + RETRY;
    playEl(s);
  }
  function slot(id) {
    var el, s;
    if (missing[id]) return null;
    if (slots[id]) return slots[id];
    if (typeof Audio === 'undefined') return null;
    el = new Audio(api.base + id + '.mp3');
    s = { id: id, el: el, from: 0, to: 0, t0: 0, dur: 0.01, dead: false, src: null, g: null, retryAt: 0 };
    el.loop = !ONE_SHOT[id]; el.preload = 'auto'; el.volume = 0;
    el.addEventListener('error', function () { missing[id] = true; dropSlot(s); });
    wire(s);
    slots[id] = s;
    startTick();
    return s;
  }
  function silence(s) {
    if (s.dead) return;
    s.from = s.to = s.dur = 0;
    setOut(s, 0);
    if (!s.priming && !s.el.paused) s.el.pause();
  }
  // Retries playback that the browser blocked before a user gesture (and resumes the context). A finished one-shot stays
  // "wanted" until the next play(), so it must not be restarted by every tap.
  function kick() {
    if (graph && graph.ctx.state !== 'running') resumeCtx();
    each(function (s) { if (active(s) && s.el.paused) playEl(s); });
  }
  function prime(id) {
    var s = slot(id), pending;
    if (!s || !s.g || s.g.gain.value !== 0 || level(s, now()) > 0 || s.primed || s.priming || active(s)) return;
    try { pending = s.el.play(); } catch (e) { return; }
    function park() {
      s.priming = false; s.primed = true;
      if (active(s)) return;
      s.el.pause();
      try { s.el.currentTime = 0; } catch (e) { /* metadata still loading */ }
    }
    if (pending && pending.then) {
      s.priming = true;
      pending.then(park, function () { s.priming = false; });
    } else park();
  }
  function gesture() {
    // WebKit grants playback per element. Warm the two in-run transitions silently during a gesture.
    if (!hidden && typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent || '') && route()) {
      prime('boss');
      prime('run_intense');
    }
    kick();
  }
  function pressure(s) {
    if (s.sk && s.sk.frenzyT > 0) return 14;
    var h = s.hero, n = 0;
    for (var i = 0; i < s.enemies.length && n < 14; i++) {
      var e = s.enemies[i], dx = h.x - e.x, dy = h.y - e.y;
      if (!e.dead && e.state === 'active' && dx * dx + dy * dy < 64) n++;
    }
    return n;
  }
  function score(s, dt) {
    if (s !== scoreRun) { scoreRun = s; scoreAge = sampleIn = dangerFor = quietFor = 0; }
    var cue = api.current();
    if (cue !== 'run_calm' && cue !== 'run_intense') return;
    scoreAge += dt; sampleIn += dt;
    if (sampleIn < 0.5) return;
    var n = pressure(s), step = sampleIn;
    sampleIn = 0;
    dangerFor = n >= 14 ? dangerFor + step : 0;
    quietFor = n <= 6 ? quietFor + step : 0;
    if (cue === 'run_calm' && dangerFor >= 4 || cue === 'run_intense' && scoreAge >= 12 && quietFor >= 8) {
      api.play(cue === 'run_calm' ? 'run_intense' : 'run_calm', { resume: true });
      scoreAge = dangerFor = quietFor = 0;
    }
  }
  // A hidden page pauses every track, as the game does. A shown page starts the tracks that should be audible.
  function onVisibility() {
    hidden = typeof document !== 'undefined' && !!document.hidden;
    if (!hidden) { kick(); return; }
    each(function (s) { if (!s.el.paused) s.el.pause(); });
  }
  var api = {
    base: resolveBase(),
    play: function (id, opts) {
      var fade = opts && typeof opts.fade === 'number' ? opts.fade : FADE, s;
      if (id !== 'run_calm' && id !== 'run_intense') scoreRun = null;
      // A finished one-shot may be played again; a looping track that is already the main one is left alone.
      if (main && main.id === id && !main.dead && !(ONE_SHOT[id] && main.el.ended)) return;
      each(silence);
      main = s = slot(id);
      if (!s) return;
      if (!opts || !opts.resume || ONE_SHOT[id]) s.el.currentTime = 0;
      fadeTo(s, 1, fade);
      playEl(s);
    },
    stop: function (fade) {
      each(function (s) { if (!s.dead) fadeTo(s, 0, typeof fade === 'number' ? fade : FADE); });
      main = null;
    },
    duck: function (on) { clearTimeout(duckTimer); duckTimer = null; duckOn = !!on; },
    // Ducks to the DUCK level for `sec` seconds, then releases with the same ramp as duck(false).
    duckFor: function (sec) {
      api.duck(true);
      duckTimer = setTimeout(function () { duckTimer = null; api.duck(false); }, Math.max(0, Number(sec) || 0) * 1000);
    },
    setVolume: function (v) { vol = clamp01(v); },
    score: score,
    unlock: function () {
      startTick();
      if (!listening && typeof document !== 'undefined') {
        listening = true;
        ['pointerdown', 'keydown', 'touchend'].forEach(function (ev) { document.addEventListener(ev, gesture, { passive: true }); });
        document.addEventListener('visibilitychange', onVisibility);
      }
      gesture();
    },
    current: function () { return main && !main.dead ? main.id : null; },
    playing: function () { return !!(main && !main.dead && !main.el.paused && !main.el.ended && main.el.currentTime > 0); },
    audibleTracks: function () {
      var tracks = [];
      each(function (s) {
        if (s.dead || s.el.paused || s.el.ended || !s.el.currentTime) return;
        if (s.g ? graph.ctx.state === 'running' && s.g.gain.value > 0 : s.el.volume > 0) tracks.push(s.id);
      });
      return tracks;
    },
    ids: IDS
  };
  return api;
})();
