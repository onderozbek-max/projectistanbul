// Music player for audio/music/<id>.mp3. HTMLAudioElement only: works over file://, no fetch, no decode.
// A missing file fails silently. Files resolve from this script's own URL (override with P.Music.base).
// The shipped files are procedural placeholders from tools/render-music.js. The owner's Suno exports replace them
// under the same names via tools/prepare-music.js (loops: exact length, seamless; stingers: not looped). No code change.
// API: play(id, {fade}) | stop(fade) | duck(on) | duckFor(seconds) | intensity(0..1) | setVolume(0..1) | unlock() | current() | ids
// run_calm + run_intense play together (same length and tempo) and crossfade with equal power.
// Music has its own switch: P.Settings.music === false mutes it (the "Sound effects" toggle does not).
P.Music = (function () {
  var IDS = ['title', 'map', 'run_calm', 'run_intense', 'boss', 'comic', 'victory', 'defeat'];
  var LAYER = { run_calm: 'run_intense' }, ONE_SHOT = { victory: 1, defeat: 1 }, DUCK = 0.355, TICK = 50, FADE = 1.2, INTENSITY_FADE = 2;
  // Per-track trim (linear, at most 1 because the element volume cannot go above 1). The tool masters every
  // file to -16 LUFS; comic is a dialogue bed and sits at the -18 LUFS of docs/audio-cue-sheet.md (-2 dB).
  var GAIN = { comic: Math.pow(10, -2 / 20) };
  var slots = {}, missing = {}, main = null, layer = null, vol = 0.7, duckOn = false, duckCur = 1, xI = 0, duckTimer = null;
  var timer = null, listening = false;
  function now() { return performance.now() / 1000; }
  function clamp01(v) { v = Number(v); return v !== v ? 0 : (v < 0 ? 0 : (v > 1 ? 1 : v)); }
  function resolveBase() {
    var here = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : '';
    try { return here ? new URL('../../audio/music/', here).href : 'audio/music/'; } catch (e) { return 'audio/music/'; }
  }
  // Volume a slot should have now, from its fade ramp.
  function level(s, t) {
    var u = s.dur > 0 ? clamp01((t - s.t0) / s.dur) : 1;
    return s.from + (s.to - s.from) * u;
  }
  // Only a stopped element is rewound. A track still fading out keeps its place, so a quick replay does not cut its wave.
  function stopped(s) { return s.el.paused || s.el.ended; }
  function fadeTo(s, target, sec) {
    var t = now();
    if (Math.abs(s.to - target) < 0.005) return;
    s.from = level(s, t); s.to = target; s.t0 = t; s.dur = Math.max(0.01, sec || 0);
  }
  function sync() {
    var t = now(), on = P.Settings && P.Settings.music === false ? 0 : 1, id, s, v;
    duckCur += ((duckOn ? DUCK : 1) - duckCur) * 0.15;
    for (id in slots) {
      if (!Object.prototype.hasOwnProperty.call(slots, id)) continue;
      s = slots[id];
      if (s.dead) continue;
      v = clamp01(level(s, t)) * vol * duckCur * on * (GAIN[s.id] || 1);
      if (Math.abs(s.el.volume - v) > 0.001) s.el.volume = clamp01(v);
      // Pause only outgoing tracks; the active pair keeps running at zero volume so it can rise again.
      if (s.to === 0 && s !== main && s !== layer && t >= s.t0 + s.dur && !s.el.paused) s.el.pause();
    }
  }
  function startTick() {
    if (!timer && typeof setInterval === 'function') timer = setInterval(sync, TICK);
  }
  function dropSlot(s) {
    s.dead = true;
    try { s.el.pause(); } catch (e) { /* ignore */ }
    if (main === s) main = null;
    if (layer === s) layer = null;
  }
  function playEl(s) {
    var p;
    try { p = s.el.play(); } catch (e) { p = null; }
    if (p && p.catch) {
      p.catch(function (e) {
        if (e && e.name === 'NotAllowedError') return;      // blocked until the next gesture (kick)
        missing[s.id] = true; dropSlot(s); balance(0.3);
      });
    }
  }
  function slot(id) {
    if (missing[id]) return null;
    if (slots[id]) return slots[id];
    if (typeof Audio === 'undefined') return null;
    var el = new Audio(api.base + id + '.mp3'), s = { id: id, el: el, from: 0, to: 0, t0: 0, dur: 0.01, dead: false };
    el.loop = !ONE_SHOT[id]; el.preload = 'auto'; el.volume = 0;
    el.addEventListener('error', function () { missing[id] = true; dropSlot(s); balance(0.3); });
    slots[id] = s;
    startTick();
    return s;
  }
  // Equal-power split between calm and intense; calm returns to full when the intense layer is missing.
  function balance(sec) {
    if (!main || main.dead) return;
    if (layer && !layer.dead) {
      fadeTo(main, Math.cos(xI * Math.PI / 2), sec);
      fadeTo(layer, Math.sin(xI * Math.PI / 2), sec);
    } else {
      fadeTo(main, 1, sec);
    }
  }
  function fadeOutAll(sec) {
    var id;
    for (id in slots) {
      if (Object.prototype.hasOwnProperty.call(slots, id) && !slots[id].dead) fadeTo(slots[id], 0, sec);
    }
  }
  // Retries playback that the browser blocked before a user gesture.
  // A finished one-shot stays "wanted" until the next play(), so it must not be restarted by every tap.
  function kick() {
    var id, s;
    for (id in slots) {
      if (!Object.prototype.hasOwnProperty.call(slots, id)) continue;
      s = slots[id];
      if (!s.dead && s.to > 0 && s.el.paused && !(ONE_SHOT[id] && s.el.ended)) playEl(s);
    }
  }
  var api = {
    base: resolveBase(),
    play: function (id, opts) {
      var fade = opts && typeof opts.fade === 'number' ? opts.fade : FADE, s;
      // A finished one-shot may be played again; a looping track that is already the main one is left alone.
      if (main && main.id === id && !main.dead && !(ONE_SHOT[id] && main.el.ended)) return;
      fadeOutAll(fade);
      main = null; layer = null;
      s = slot(id);
      if (!s) return;
      main = s;
      if (stopped(s)) s.el.currentTime = 0;
      fadeTo(s, 1, fade);
      playEl(s);
      if (LAYER[id] && slot(LAYER[id])) {
        layer = slots[LAYER[id]];
        if (stopped(layer)) layer.el.currentTime = 0;
        balance(fade);
        playEl(layer);
      }
    },
    stop: function (fade) {
      fadeOutAll(typeof fade === 'number' ? fade : FADE);
      main = null; layer = null;
    },
    duck: function (on) { clearTimeout(duckTimer); duckTimer = null; duckOn = !!on; },
    // Ducks to the DUCK level for `sec` seconds, then releases with the same ramp as duck(false).
    duckFor: function (sec) {
      api.duck(true);
      duckTimer = setTimeout(function () { duckTimer = null; api.duck(false); }, Math.max(0, Number(sec) || 0) * 1000);
    },
    intensity: function (x) {
      xI = clamp01(x);
      if (main && main.id === 'run_calm') balance(INTENSITY_FADE);
    },
    setVolume: function (v) { vol = clamp01(v); },
    unlock: function () {
      startTick();
      if (!listening && typeof document !== 'undefined') {
        listening = true;
        ['pointerdown', 'keydown', 'touchend'].forEach(function (ev) { document.addEventListener(ev, kick, { passive: true }); });
      }
      kick();
    },
    current: function () { return main && !main.dead ? main.id : null; },
    ids: IDS
  };
  return api;
})();
