// WebAudio runtime for sound effects (workstream A, v0.5). Cues are rendered once into AudioBuffers by sfx-bank.js /
// sfx-bank2.js (lazily on first use; variant 0 of every cue is warmed in small steps after unlock). play() only starts
// buffer sources. Unknown cue names are a silent no-op.
// API: play(name, minGapMs, {pan, vol, rate, voice, kind, variant}) | unlock() | ambience(themeId|group|null)
//      | setVolume(bus, v) with bus sfx|ui|voice|ambience|music|master | duck(sec) | stopAll() | has(name)
// Mix: voice limits (per cue, global, priority), rate limits for impact cues (more than N starts per 100 ms are
// dropped, rapid repeats rise slightly in pitch), a ducking pass when a boss or comic-speech cue plays (ambience
// -6 dB, music via P.Music.duckFor, mid-priority SFX -3 dB), and a master limiter (DynamicsCompressor, ratio 12).
// Respects P.Settings.sound (the "Sound effects" toggle): when off, nothing plays. Music has its own switch.
// Generated files (D-063, proposed): sfx-gen.js decodes the owner's files from audio/sfx-gen/ready/. A cue with a ready
// file plays it (round robin, pitch jitter +-4%, design-level gain); any other cue plays the synthesized recipe.
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
  // Rate limits: most starts per 100 ms for each impact cue, and one shared cap for the whole impact family.
  var RATE = { hit: 4, splat: 3, stab: 3, swish: 3, tink: 6, nail: 4, chain: 3, spitHit: 3, click: 4, coin: 5, cleaver: 2, hammer: 2 };
  var IMPACT = { hit: 1, splat: 1, stab: 1, swish: 1, chain: 1, spitHit: 1, spearPin: 1, crit: 1, cleaver: 1, hammer: 1, nail: 1 };
  var IMPACT_MAX = 8, PITCH_UP = { hit: 1, splat: 1, stab: 1, tink: 1, coin: 1, nail: 1, click: 1 };
  // Ducking: cue -> seconds of duck. Boss cues duck the most; comic speech blips keep the duck alive while they play.
  var DUCK = { bossIntro: 2.4, bossDie: 2.2, bruteRoar: 1.7, speech: 0.35 };
  var DUCK_AMB = 0.5, DUCK_MID = 0.708, DUCK_MID_PRIO = 2;   // -6 dB ambience, -3 dB mid-priority SFX
  var ctx = null, comp = null, master = null, rev = null, bus = {}, vol = { sfx: 1, ui: 1, voice: 1, ambience: 1 }, mv = 1;
  var cache = {}, last = {}, lastVar = {}, active = [], amb = null, ambWant = null, warmed = false;
  var tink = { streak: 0, t: -1e9 }, hist = {}, impactHist = [], duckTimer = null, duckOn = false;
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
    comp = c.createDynamicsCompressor();   // master limiter: high ratio, fast attack
    comp.threshold.value = -4; comp.knee.value = 2; comp.ratio.value = 12; comp.attack.value = 0.003; comp.release.value = 0.12;
    master = c.createGain(); master.gain.value = 0.9 * mv;
    comp.connect(master); master.connect(c.destination);
    rev = c.createConvolver();
    rev.buffer = bufferOf(c, DSP.ir(c.sampleRate, 1.6, 0.35, DSP.rng(DSP.seed('reverb-ir'))));
    var ret = c.createGain(); ret.gain.value = 0.45; rev.connect(ret); ret.connect(comp);
    for (k in CATS) {
      if (!has(CATS, k)) continue;
      bus[k] = c.createGain(); bus[k].gain.value = CATS[k] * vol[k]; bus[k].connect(k === 'voice' ? bus.sfx : comp);   // voice (speech blips, groans) sits in the sfx bus: one Sound effects slider (T4 part 9)
    }
  }
  // Lazily creates the context and graph. Returns null where WebAudio is unavailable.
  function ensure() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext, c;
    if (!AC || !R || !DSP) return null;
    try { c = new AC(); buildGraph(c); ctx = c; } catch (e) { ctx = null; }
    if (ctx && P.SfxGen && P.SfxGen.attach) P.SfxGen.attach(ctx);   // generated files: decode on the live context if still pending
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
  // Starts within the last 100 ms for a name (also prunes the window). Returns the count before this start.
  function recent(list, now) {
    var i = 0;
    while (i < list.length && now - list[i] > 100) i++;
    if (i) list.splice(0, i);
    return list.length;
  }
  // Starts one voice: buffer -> gain (opts.vol, duck) -> optional panner (opts.pan) -> category bus, plus reverb send.
  // gen (optional) is the generated-file entry: its jitter (+-4%) and its design-level gain replace the synth defaults.
  function start(name, m, b, o, rate, ducked, gen) {
    var c = ctx, t = c.currentTime + 0.005, src = c.createBufferSource(), g = c.createGain(), out = g, pan = null, send = null;
    src.buffer = b;
    src.playbackRate.value = rate * (name === 'speech' ? 1 : 1 + (Math.random() * 2 - 1) * (gen ? gen.jitter : 0.015));
    g.gain.value = (typeof o.vol === 'number' ? clamp(o.vol, 0, 1) : 1) * (ducked ? DUCK_MID : 1) * (gen ? gen.gain : 1);
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
  // Ducking: ambience -6 dB, mid-priority voices start at -3 dB, and music ducks through P.Music.duckFor.
  function duck(sec) {
    var c = ctx, now, s = clamp(sec, 0, 6);
    if (!c || !soundOn()) return;
    now = c.currentTime;
    if (!duckOn) { duckOn = true; bus.ambience.gain.setTargetAtTime(CATS.ambience * vol.ambience * DUCK_AMB, now, 0.05); }
    clearTimeout(duckTimer);
    duckTimer = setTimeout(function () {
      duckOn = false;
      if (ctx) bus.ambience.gain.setTargetAtTime(CATS.ambience * vol.ambience, ctx.currentTime, 0.3);
    }, s * 1000);
    if (P.Music && P.Music.duckFor) P.Music.duckFor(s);
  }
  function play(name, minGap, opts) {
    if (!R || !R.has(name) || !soundOn()) return;
    var c = ensure(), o = opts || {}, m, now, gap, rate, v, b, who, nRate, ducked, gen;
    if (!c) return;
    if (c.state === 'suspended') { c.resume(); return; }
    m = R.meta[name];
    now = performance.now();
    gap = typeof minGap === 'number' ? minGap : m.g;
    if (last[name] !== undefined && now - last[name] < gap) return;
    if (!admit(name, m)) return;
    hist[name] = hist[name] || [];
    nRate = recent(hist[name], now);
    if (RATE[name] && nRate >= RATE[name]) return;
    if (IMPACT[name]) {
      if (recent(impactHist, now) >= IMPACT_MAX) return;
      impactHist.push(now);
    }
    hist[name].push(now);
    rate = typeof o.rate === 'number' ? o.rate : 1;
    if (name === 'tink') rate *= tinkRate(now);
    if (PITCH_UP[name]) rate *= 1 + 0.025 * Math.min(nRate, 4);
    who = o.voice || o.kind;
    gen = P.SfxGen ? P.SfxGen.pick(name, who) : null;   // a ready generated file for this cue, else null (synth recipe)
    if (gen) b = gen.buf;
    else {
      v = typeof o.variant === 'number' ? o.variant : pickVariant(name, m.v);
      b = cueBuffer(name, v, who);
    }
    if (!b) return;
    last[name] = now;
    ducked = duckOn && m.p <= DUCK_MID_PRIO;
    if (has(DUCK, name)) duck(DUCK[name]);
    if (!gen) { start(name, m, b, o, rate, ducked, null); return; }
    try { start(name, m, b, o, rate, ducked, gen); }
    catch (e) { P.SfxGen.drop(name, who); }   // a buffer the context refuses: this cue is synthesized from now on
  }
  // ---- Ambience beds: one seamless loop per group, crossfaded on theme change ----
  function ambBuffer(group) {
    var key = 'amb|' + group;
    if (!cache[key]) cache[key] = bufferOf(ctx, DSP.bed(group, AMB_SEC, ctx.sampleRate, DSP.rng(DSP.seed(key))));
    return cache[key];
  }
  // A generated bed (sfx-gen) starts when it has decoded; until then the previous bed has faded and nothing plays.
  // A missing or failed bed starts the synthesized one at once.
  function startBed(group) {
    var gb = P.SfxGen ? P.SfxGen.bed(group, function (buf) {
      if (ambWant === group && !amb && ctx && soundOn()) startBedWith(group, buf);
    }) : null;
    if (gb !== undefined) startBedWith(group, gb);
  }
  function startBedWith(group, gb) {
    var c = ctx, t = c.currentTime, src = c.createBufferSource(), gn = c.createGain();
    src.buffer = gb || ambBuffer(group); src.loop = true;
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
  // Renders variant 0 of every cue (both hit kinds and the speech presets are rendered on first use) and the beds
  // in small steps, so first plays do not stall.
  function warm() {
    var jobs = R.names.filter(function (n) { return !(P.SfxGen && P.SfxGen.has(n)); })   // covered by generated files: no synth render
      .map(function (n) { return function () { cueBuffer(n, 0, null); }; });
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
    duck: duck,
    setVolume: function (cat, v) {
      v = clamp(v, 0, 1);
      if (cat === 'music') { if (P.Music && P.Music.setVolume) P.Music.setVolume(v); return; }
      if (cat === 'master') {
        mv = v;
        if (ctx) master.gain.setTargetAtTime(0.9 * v, ctx.currentTime, 0.02);
        return;
      }
      if (!has(CATS, cat)) return;
      vol[cat] = v;
      if (ctx) bus[cat].gain.setTargetAtTime(CATS[cat] * (cat === 'ambience' && duckOn ? DUCK_AMB : 1) * v, ctx.currentTime, 0.02);
    },
    stopAll: function () { if (ctx) active.slice().forEach(stopVoice); },
    has: function (name) { return !!R && R.has(name); }
  };
})();
