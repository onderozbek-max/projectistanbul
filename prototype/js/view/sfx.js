// WebAudio runtime for sound effects (workstream A, v0.4). Cues are rendered once into AudioBuffers by
// sfx-bank.js / sfx-bank2.js (lazily on first use; variant 0 of every cue is warmed in small steps after
// unlock). play() only starts buffer sources. Unknown cue names are a silent no-op.
// API: play(name, minGapMs, {pan, vol, rate, voice, variant}) | unlock() | ambience(themeId|group|null)
//      | setVolume(category, v) with category sfx|ui|voice|ambience|master | stopAll() | has(name)
// Respects P.Settings.sound (the "Sound effects" toggle): when off, nothing plays.
P.Sfx = (function () {
  var R = P.SfxRecipes, DSP = P.SfxDsp;
  var CATS = { sfx: 0.85, ui: 0.8, voice: 0.95, ambience: 0.5 };   // bus base gains, linear
  var AMB_SEC = 8, MAX_VOICES = 20, BUSY = 12, FADE = 1.5, AMB_GROUPS = ['street', 'waterfront', 'bazaar', 'wind', 'night'];
  // Journey theme id -> ambience group (journey.js). 'bridge' is the Galata Köprüsü wind bed.
  var GROUP_OF = {
    istiklal: 'street', galata: 'street', eminonu: 'street', sirkeci: 'street', beyazit: 'street', saray: 'street',
    yedikule: 'street', bakirkoy: 'street', zeytinburnu: 'street',
    karakoy: 'waterfront', kumkapi: 'waterfront', yenikapi: 'waterfront', samatya: 'waterfront', kazlicesme: 'waterfront',
    sahil: 'waterfront', marina: 'waterfront', halic: 'waterfront', bazaar: 'bazaar', bridge: 'wind', atakoy: 'night'
  };
  var ctx = null, comp = null, master = null, rev = null, bus = {}, vol = { sfx: 1, ui: 1, voice: 1, ambience: 1 }, mv = 1;
  var cache = {}, last = {}, lastVar = {}, active = [], amb = null, ambWant = null, warmed = false;
  var tink = { streak: 0, t: -1e9 };
  function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function clamp(v, a, b) { v = Number(v); return v !== v ? a : (v < a ? a : (v > b ? b : v)); }
  function soundOn() { return !P.Settings || P.Settings.sound !== false; }
  function bufferOf(c, x) {
    var b = c.createBuffer(1, x.length, c.sampleRate);
    b.getChannelData(0).set(x);
    return b;
  }
  function buildGraph(c) {
    var k;
    comp = c.createDynamicsCompressor();
    comp.threshold.value = -12; comp.knee.value = 8; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
    master = c.createGain(); master.gain.value = 0.9 * mv;
    comp.connect(master); master.connect(c.destination);
    rev = c.createConvolver();
    rev.buffer = bufferOf(c, DSP.ir(c.sampleRate, 1.6, 0.35, DSP.rng(DSP.seed('reverb-ir'))));
    var ret = c.createGain(); ret.gain.value = 0.45; rev.connect(ret); ret.connect(comp);
    for (k in CATS) {
      if (!has(CATS, k)) continue;
      bus[k] = c.createGain(); bus[k].gain.value = CATS[k] * vol[k]; bus[k].connect(comp);
    }
  }
  // Lazily creates the context and graph. Returns null where WebAudio is unavailable.
  function ensure() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext, c;
    if (!AC || !R || !DSP) return null;
    try { c = new AC(); buildGraph(c); ctx = c; } catch (e) { ctx = null; }
    return ctx;
  }
  function cueBuffer(name, v, who) {
    var key = name + '|' + v + '|' + (who || ''), b = cache[key], x;
    if (b === undefined) {
      x = R.render(name, ctx.sampleRate, v, who);
      b = cache[key] = x ? bufferOf(ctx, x) : null;
    }
    return b;
  }
  function pickVariant(name, n) {
    var v = Math.floor(Math.random() * n);
    if (n > 1 && v === lastVar[name]) v = (v + 1) % n;
    lastVar[name] = v;
    return v;
  }
  function prune(now) { active = active.filter(function (a) { return a.end > now; }); }
  function stopVoice(a) {
    var t = ctx.currentTime;
    try { a.g.gain.cancelScheduledValues(t); a.g.gain.setTargetAtTime(0, t, 0.01); a.src.stop(t + 0.06); } catch (e) { /* already ended */ }
    active = active.filter(function (x) { return x !== a; });
  }
  // Voice limiting: per-cue cap, global cap, drop low-priority cues when busy, steal a lower-priority voice when full.
  function admit(name, m) {
    var i, same = 0, low = null;
    prune(ctx.currentTime);
    for (i = 0; i < active.length; i++) {
      if (active[i].name === name) same++;
      if (!low || active[i].prio < low.prio) low = active[i];
    }
    if (same >= m.m) return false;
    if (active.length >= BUSY && m.p <= 1) return false;
    if (active.length >= MAX_VOICES) {
      if (!low || low.prio >= m.p) return false;
      stopVoice(low);
    }
    return true;
  }
  function tinkRate(now) {
    tink.streak = now - tink.t < 400 ? Math.min(tink.streak + 1, 12) : 0;
    tink.t = now;
    return 1 + tink.streak * 0.035;
  }
  // Starts one voice: buffer -> gain (opts.vol) -> optional panner (opts.pan) -> category bus, plus reverb send.
  function start(name, m, b, o, rate) {
    var c = ctx, t = c.currentTime + 0.005, src = c.createBufferSource(), g = c.createGain(), out = g, pan = null, send = null;
    src.buffer = b;
    src.playbackRate.value = rate * (name === 'speech' ? 1 : 1 + (Math.random() * 2 - 1) * 0.015);
    g.gain.value = typeof o.vol === 'number' ? clamp(o.vol, 0, 1) : 1;
    src.connect(g);
    if (typeof o.pan === 'number' && c.createStereoPanner) {
      pan = c.createStereoPanner(); pan.pan.value = clamp(o.pan, -1, 1); g.connect(pan); out = pan;
    }
    out.connect(bus[m.c] || bus.sfx);
    if (m.r > 0) { send = c.createGain(); send.gain.value = m.r; out.connect(send); send.connect(rev); }
    var rec = { name: name, prio: m.p, g: g, src: src, end: t + b.duration / src.playbackRate.value + 0.05 };
    src.onended = function () {
      active = active.filter(function (x) { return x !== rec; });
      try { src.disconnect(); g.disconnect(); if (pan) pan.disconnect(); if (send) send.disconnect(); } catch (e) { /* ignore */ }
    };
    active.push(rec);
    src.start(t);
  }
  function play(name, minGap, opts) {
    if (!R || !R.has(name) || !soundOn()) return;
    var c = ensure(), o = opts || {}, m, now, gap, rate, v, b;
    if (!c) return;
    if (c.state === 'suspended') { c.resume(); return; }
    m = R.meta[name];
    now = performance.now();
    gap = typeof minGap === 'number' ? minGap : m.g;
    if (last[name] !== undefined && now - last[name] < gap) return;
    if (!admit(name, m)) return;
    rate = typeof o.rate === 'number' ? o.rate : 1;
    if (name === 'tink') rate *= tinkRate(now);
    v = typeof o.variant === 'number' ? o.variant : pickVariant(name, m.v);
    b = cueBuffer(name, v, o.voice);
    if (!b) return;
    last[name] = now;
    start(name, m, b, o, rate);
  }
  // ---- Ambience beds: one seamless loop per group, crossfaded on theme change ----
  function ambBuffer(group) {
    var key = 'amb|' + group;
    if (!cache[key]) cache[key] = bufferOf(ctx, DSP.bed(group, AMB_SEC, ctx.sampleRate, DSP.rng(DSP.seed(key))));
    return cache[key];
  }
  function startBed(group) {
    var c = ctx, t = c.currentTime, src = c.createBufferSource(), gn = c.createGain();
    src.buffer = ambBuffer(group); src.loop = true;
    gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(1, t + FADE);
    src.connect(gn); gn.connect(bus.ambience); src.start(t);
    amb = { src: src, g: gn };
  }
  function fadeBed(sec) {
    if (!amb || !ctx) return;
    var a = amb, t = ctx.currentTime;
    amb = null;
    a.g.gain.cancelScheduledValues(t);
    a.g.gain.setValueAtTime(Math.max(a.g.gain.value, 0.0001), t);
    a.g.gain.exponentialRampToValueAtTime(0.0001, t + sec);
    a.src.onended = function () { try { a.src.disconnect(); a.g.disconnect(); } catch (e) { /* ignore */ } };
    a.src.stop(t + sec + 0.05);
  }
  function groupOf(theme) {
    if (theme === null || theme === undefined) return null;
    if (AMB_GROUPS.indexOf(theme) >= 0) return theme;
    return has(GROUP_OF, theme) ? GROUP_OF[theme] : null;
  }
  function ambience(theme) {
    var g = groupOf(theme);
    if (g === ambWant) return;
    ambWant = g;
    if (!ctx) return;   // not unlocked yet: unlock() starts the wanted bed
    fadeBed(1.2);
    if (g && soundOn()) startBed(g);
  }
  // Renders variant 0 of every cue and the beds in small steps, so first plays do not stall.
  function warm() {
    var jobs = R.names.map(function (n) { return function () { cueBuffer(n, 0, null); }; });
    AMB_GROUPS.forEach(function (g) { jobs.push(function () { ambBuffer(g); }); });
    (function next() {
      var job = jobs.shift();
      if (!job) return;
      try { job(); } catch (e) { /* ignore: a failed warm just renders lazily later */ }
      setTimeout(next, 30);
    })();
  }
  return {
    play: play,
    unlock: function () {
      var c = ensure();
      if (!c) return;
      if (c.state === 'suspended') c.resume();
      if (!warmed) { warmed = true; warm(); }
      if (ambWant && !amb && soundOn()) startBed(ambWant);
    },
    ambience: ambience,
    setVolume: function (cat, v) {
      v = clamp(v, 0, 1);
      if (cat === 'master') {
        mv = v;
        if (ctx) master.gain.setTargetAtTime(0.9 * v, ctx.currentTime, 0.02);
        return;
      }
      if (!has(CATS, cat)) return;
      vol[cat] = v;
      if (ctx) bus[cat].gain.setTargetAtTime(CATS[cat] * v, ctx.currentTime, 0.02);
    },
    stopAll: function () { if (ctx) active.slice().forEach(stopVoice); },
    has: function (name) { return !!R && R.has(name); }
  };
})();
