// Sound cues (workstream A, v0.5): one recipe per cue name, all built from P.SfxDsp and P.SfxFx (sfx-bank.js).
// Recipe: f(r, sr, o) -> Float32Array. r = seeded RNG (differs per variant), o = {v, voice, kind}. `who` (opts.voice
// for speech and voice cues, opts.kind for hit) selects a preset or a hit class.
// def() meta: c = bus (sfx | ui | voice), p = priority 0..4 (higher wins when busy), m = max concurrent,
// g = default minGap ms, db = RMS target dBFS (loudest 50 ms), v = variant count, r = reverb send 0..1, pk = peak ceiling.
// P.SfxRecipes.render(name, sr, v, who) -> loudness-normalised, edge-faded samples, or null for unknown names.
// v0.5 notes: gem removed (no producer in the sim); hit added (kinds body | blade | blunt | pierce | chain).
P.SfxRecipes = (function () {
  var D = P.SfxDsp, FX = P.SfxFx, TAU = Math.PI * 2, FN = {}, META = {}, NAMES = [];
  var len = D.len, mix = D.mix, mul = D.mul, env = D.env, adsr = D.adsr, white = D.white, filt = D.filt;
  var modal = D.modal, thump = D.thump, pw = D.pw, snap = D.snap;
  var whoosh = FX.whoosh, clanks = FX.clanks, nailShot = FX.nailShot, step = FX.step, tap = FX.tap, strike = FX.strike,
    flesh = FX.flesh, boom = FX.boom, glassBreak = FX.glassBreak, fire = FX.fire, tone = FX.tone, ney = FX.ney,
    brass = FX.brass, horn = FX.horn, vocal = FX.vocal, scatter = FX.scatter, roll = FX.roll;
  function def(name, o, f) {
    FN[name] = f; NAMES.push(name);
    META[name] = { c: o.c || 'sfx', p: o.p === undefined ? 2 : o.p, m: o.m || 4, g: o.g === undefined ? 60 : o.g,
      db: o.db === undefined ? -16 : o.db, v: o.v || 4, r: o.r === undefined ? 0.08 : o.r,
      pk: o.pk === undefined ? -1.5 : o.pk };
  }
  function K(r) { return 0.94 + r() * 0.12; }   // +/-6% pitch wobble per variant
  function pl(r, sr, hz, sec, damp) { return D.pluck(len(sec, sr), sr, hz, damp || 0.9975, r); }
  // Glass or small-bell ring (inharmonic, beating pair). f in Hz, sec = buffer length, amp, tau = fundamental decay.
  function gl(r, sr, f, sec, amp, tau) { return D.glass(len(sec, sr), sr, f, r, amp, tau); }
  // Mallet tone (marimba / glockenspiel): hard attack, short inharmonic body.
  function glock(r, sr, f, sec, amp) {
    var n = len(sec, sr);
    return mix(sr, sec, [
      [0, modal(n, sr, f, [[1, amp, 0.45], [2.76, amp * 0.35, 0.12], [5.4, amp * 0.12, 0.04]], r, 0.002), 1],
      [0, snap(len(0.01, sr), sr, r, 4000, 0.9, 0.002), amp * 0.3]
    ]);
  }
  // ---- Core hits and combat feedback ----
  def('click', { p: 1, m: 4, g: 30, db: -22, v: 4, r: 0.02 }, function (r, sr) {
    var k = K(r), n = len(0.09, sr);
    return mix(sr, 0.09, [
      [0, snap(n, sr, r, 3400, 1.2, 0.0025), 0.5],
      [0, modal(n, sr, 2100 * k, [[1, 1, 0.012], [1.52, 0.5, 0.008], [2.4, 0.3, 0.005]], r, 0), 0.55],
      [0, thump(n, sr, 260 * k, 140, 0.01, 0.012), 0.3]
    ]);
  });
  // The hero takes damage: a flesh thud, then Arda's "agh": a breathy, rough grunt with a drop at the end.
  def('hurt', { p: 4, m: 2, g: 120, db: -14, v: 4, r: 0.06 }, function (r, sr) {
    var k = K(r);
    return mix(sr, 0.42, [
      [0, flesh(r, sr, 0.22, k, 1), 1],
      [0.015, vocal(r, sr, 0.3, 'arda', k, { f0: pw([[0, 230 * k], [0.3, 150 * k]]), F: [pw([[0, 800], [0.3, 650]]), 1250, 2550],
        Q: [4, 6, 7], breath: 0.14, drive: 1.6, shim: 0.08, creak: 0.2 },
        function (n) { return adsr(n, sr, 0.012, 0.08, 0.7, 0.12); }), 0.8]
    ]);
  });
  // Zombie killed: a wet thump, a squelch with AM bubbling, a spray tick and falling bubble blops.
  def('splat', { p: 2, m: 6, g: 45, db: -18, v: 5, r: 0.06 }, function (r, sr) {
    var k = K(r), n = len(0.3, sr);
    return mix(sr, 0.3, [
      [0, thump(n, sr, 140 * k, 55, 0.02, 0.05), 0.75],
      [0, mul(D.am(filt(white(n, r), sr, 'bp', 420 * k, 2.2), sr, 34, 0.6), env(n, sr, 0.004, 0.08)), 0.8],
      [0, snap(n, sr, r, 6000, 0.7, 0.02), 0.2],
      [0.02, D.bubbles(sr, r, 0.28, 4, 900 * k), 0.5]
    ]);
  });
  // Impact on an enemy. opts.kind picks the weapon class; the default (body) is the tackle and stab hit.
  var HIT = {
    body: function (r, sr, k) { return strike(r, sr, 0.24, k, { click: 0.3, clickFc: 2600, body: 0.9, f0: 150, f1: 50, tau: 0.04, ampTau: 0.09,
      wet: 0.55, wetFc: 520, wetTau: 0.08, crack: 0.25, crackFc: 2400 }); },
    blade: function (r, sr, k) { return strike(r, sr, 0.18, k, { click: 0.6, clickFc: 5200, body: 0.45, f0: 200, f1: 90, tau: 0.02,
      ampTau: 0.04, wet: 0.5, wetFc: 600, wetTau: 0.05 }); },
    blunt: function (r, sr, k) { return strike(r, sr, 0.3, k, { click: 0.2, clickFc: 1600, body: 1, f0: 120, f1: 40, tau: 0.05,
      ampTau: 0.12, crack: 0.6, crackFc: 1800, wet: 0.3, wetFc: 900, wetTau: 0.04 }); },
    pierce: function (r, sr, k) { return strike(r, sr, 0.2, k, { click: 0.7, clickFc: 3200, body: 0.5, f0: 240, f1: 120, tau: 0.015,
      ampTau: 0.04, ring: 0.25, ringF: 2200, ringTau: 0.02, wet: 0.35, wetFc: 700, wetTau: 0.05 }); },
    chain: function (r, sr, k) {
      var n = len(0.2, sr);
      return mix(sr, 0.2, [
        [0, modal(n, sr, 1750 * k, [[1, 0.6, 0.03], [2.76, 0.35, 0.015], [5.4, 0.15, 0.008]], r, 0.02), 1],
        [0, thump(n, sr, 180 * k, 90, 0.02, 0.03), 0.35],
        [0, snap(n, sr, r, 3600, 1.2, 0.004), 0.3]
      ]);
    }
  };
  def('hit', { p: 2, m: 6, g: 35, db: -17, v: 4, r: 0.06 }, function (r, sr, o) {
    var k = K(r), kind = HIT[o.kind] ? o.kind : (HIT[o.voice] ? o.voice : 'body');
    return HIT[kind](r, sr, k);
  });
  def('combo', { p: 2, m: 1, g: 350, db: -16, v: 4, r: 0.1 }, function (r, sr) {
    var k = K(r);
    return mix(sr, 0.7, [
      [0, D.tek(sr, r, k), 0.8],
      [0.08, D.tek(sr, r, k * 1.04), 0.6],
      [0.16, D.doum(sr, r, k), 0.9],
      [0.16, pl(r, sr, 660 * k, 0.7, 0.997), 0.35]
    ]);
  });
  // ---- Player skills ----
  def('dash', { p: 2, m: 2, g: 150, db: -17, v: 4, r: 0.06 }, function (r, sr) {
    var k = K(r);
    return mix(sr, 0.26, [
      [0, whoosh(r, sr, 0.22, 2800 * k, 500 * k, 1.0, 0.25, 0.7), 0.9],
      [0, thump(len(0.14, sr), sr, 120 * k, 50, 0.02, 0.02), 0.35],
      [0, vocal(r, sr, 0.14, 'arda', k, { f0: pw([[0, 260 * k], [0.14, 190 * k]]), breath: 0.18, Q: [4, 5, 6] },
        function (n) { return adsr(n, sr, 0.006, 0.03, 0.6, 0.06); }), 0.9]
    ]);
  });
  def('nearMiss', { p: 2, m: 2, g: 200, db: -19, v: 4, r: 0.1 }, function (r, sr) {
    var k = K(r), n = len(0.22, sr);
    return mix(sr, 0.3, [
      [0, whoosh(r, sr, 0.3, 3800 * k, 900 * k, 2.0, 0.2, 1), 0.9],
      [0, mul(D.osc(n, sr, 'sine', pw([[0, 1800 * k], [0.22, 950 * k]])), env(n, sr, 0.002, 0.07)), 0.25],
      [0, snap(len(0.02, sr), sr, r, 5000, 0.8, 0.003), 0.3]
    ]);
  });
  def('ultReady', { p: 2, m: 1, g: 800, db: -17, v: 3, r: 0.1 }, function (r, sr) {
    var k = K(r), parts = [], i;
    for (i = 0; i < 4; i++) parts.push([0.09 * i, pl(r, sr, [587.3, 740, 880, 1174.7][i] * k, 0.8), 0.6]);
    parts.push([0.36, gl(r, sr, 1760 * k, 0.9, 0.25, 0.25), 0.5]);
    return mix(sr, 1.1, parts);
  });
  def('ult', { p: 3, m: 1, g: 500, db: -15, v: 3, r: 0.15 }, function (r, sr) {
    var k = K(r);
    return mix(sr, 1.0, [
      [0, whoosh(r, sr, 0.8, 300 * k, 3000 * k, 0.9, 0.85, 1), 0.7],
      [0, thump(len(1.0, sr), sr, 70 * k, 35, 0.2, 0.5), 0.9],
      [0.3, brass(r, sr, 293.7 * k, 0.7, { c0: 400, c1: 2600, open: 0.08, att: 0.02, rel: 0.25 }), 0.4],
      [0.35, gl(r, sr, 880 * k, 1.2, 0.3, 0.2), 0.4]
    ]);
  });
  def('frenzy', { p: 2, m: 1, g: 900, db: -15, v: 3, r: 0.1 }, function (r, sr) {
    var k = K(r);
    return mix(sr, 1.2, roll(r, sr, k, 7, 0.11, 0.66).concat([
      [0, vocal(r, sr, 1.1, 'other', k, { f0: pw([[0, 150 * k], [1.1, 120 * k]]), growl: 14, depth: 0.5, drive: 1.5, breath: 0.12 },
        function (n) { return adsr(n, sr, 0.15, 0.2, 0.5, 0.3); }), 0.25]
    ]));
  });
  def('evolve', { p: 3, m: 1, g: 800, db: -15, v: 3, r: 0.2 }, function (r, sr) {
    var k = K(r), parts = [], i;
    for (i = 0; i < 7; i++) parts.push([0.05 * i, gl(r, sr, (392 + i * 70) * k, 0.5, 0.35, 0.12), 0.5]);
    parts.push([0.5, D.bell(sr, 98 * k, 2.2, r, 0.8), 0.9]);
    return mix(sr, 2.4, parts);
  });
  // Critical hit: a bright click, a ring and a low thump.
  def('crit', { p: 2, m: 4, g: 40, db: -16, v: 4, r: 0.1 }, function (r, sr) {
    var k = K(r);
    return strike(r, sr, 0.3, k, { click: 0.7, clickFc: 2500, ring: 0.35, ringF: 1900, ringTau: 0.09, body: 0.6, f0: 230, f1: 90, tau: 0.02, ampTau: 0.04 });
  });
  // ---- Weapons ----
  def('swish', { p: 2, m: 4, g: 60, db: -17, v: 4 }, function (r, sr) {
    var k = K(r);
    return mix(sr, 0.2, [
      [0, whoosh(r, sr, 0.16, 1300 * k, 3600 * k, 1.1, 0.35, 0.22), 1],
      [0.05, modal(len(0.12, sr), sr, 2400 * k, [[1, 1, 0.03], [2.76, 0.5, 0.02], [5.4, 0.25, 0.01]], r, 0.01), 0.25],
      [0, snap(len(0.02, sr), sr, r, 7000, 0.8, 0.002), 0.25]
    ]);
  });
  // Knife into flesh (cold open, Döner Knife stab).
  def('stab', { p: 2, m: 6, g: 50, db: -17, v: 4 }, function (r, sr) {
    var k = K(r);
    return strike(r, sr, 0.16, k, { click: 0.5, clickFc: 4200, body: 0.9, f0: 210, f1: 70, tau: 0.02, ampTau: 0.05, wet: 0.7, wetFc: 480, wetTau: 0.06 });
  });
  def('nail', { p: 2, m: 4, g: 70, db: -16, v: 4 }, function (r, sr) { return nailShot(r, sr, K(r)); });
  def('nailStorm', { p: 2, m: 2, g: 80, db: -17, v: 4 }, function (r, sr) {
    var k = K(r), parts = [], i;
    for (i = 0; i < 6; i++) parts.push([0.042 * i + r() * 0.008, nailShot(r, sr, k * (0.95 + r() * 0.1)), 0.6 + 0.05 * (i % 2)]);
    return mix(sr, 0.3, parts);
  });
  def('lob', { p: 2, m: 3, g: 100, db: -17, v: 4 }, function (r, sr) {
    var k = K(r);
    return mix(sr, 0.5, [[0, whoosh(r, sr, 0.42, 420 * k, 1500 * k, 1.0, 0.3, 0.6), 1]]
      .concat(clanks(r, sr, [0.02, 0.08, 0.14, 0.2, 0.26, 0.32, 0.38, 0.44], 620 * k, 0.1, 0.02, 0.35)));
  });
  def('blast', { p: 3, m: 3, g: 80, db: -15, v: 4, r: 0.14 }, function (r, sr) { return boom(r, sr, K(r), 0.9, 0.3); });
  def('chain', { p: 2, m: 3, g: 60, db: -18, v: 4 }, function (r, sr) {
    var k = K(r), n = len(0.35, sr);
    var whirl = mul(filt(white(n, r), sr, 'bp', 2600 * k, 4), D.gen(n, sr, function (t) { return 0.5 + 0.5 * Math.sin(TAU * 38 * t); }));
    return mix(sr, 0.35, [[0, whirl, 0.4]].concat(clanks(r, sr, [0.1, 0.125, 0.15, 0.19, 0.22, 0.25, 0.27, 0.31], 1750 * k, 0.2, 0.02, 0.5)));
  });
  def('cleaver', { p: 2, m: 2, g: 120, db: -15, v: 4, r: 0.1 }, function (r, sr) {
    var k = K(r);
    return mix(sr, 0.5, [
      [0, whoosh(r, sr, 0.2, 600 * k, 2600 * k, 1.1, 0.3, 0.7), 0.8],
      [0.16, modal(len(0.5, sr), sr, 520 * k, [[1, 0.9, 0.1], [2.76, 0.4, 0.05], [5.1, 0.2, 0.02]], r, 0.01), 0.5],
      [0.16, modal(len(0.2, sr), sr, 340 * k, [[1, 0.7, 0.05], [2.32, 0.35, 0.02], [4.25, 0.15, 0.01]], r, 0.01), 0.5],
      [0.17, flesh(r, sr, 0.25, k, 0.9), 1]
    ]);
  });
  // Blunt hammer: a heavy body, a crunch, a crack and a wood knock.
  def('hammer', { p: 2, m: 4, g: 80, db: -14, v: 4, r: 0.06 }, function (r, sr) {
    var k = K(r), n = len(0.4, sr);
    return mix(sr, 0.4, [
      [0, thump(n, sr, 125 * k, 40, 0.05, 0.14), 1],
      [0, snap(n, sr, r, 3000, 0.8, 0.006), 0.5],
      [0, mul(filt(white(n, r), sr, 'bp', 900 * k, 1.1), env(n, sr, 0.001, 0.05)), 0.6],
      [0, mul(D.crackle(n, sr, 120, 0.6, r), env(n, sr, 0, 0.08)), 0.4],
      [0, modal(n, sr, 180 * k, [[1, 0.4, 0.06], [2.32, 0.2, 0.03], [4.25, 0.1, 0.015]], r, 0.01), 0.35]
    ]);
  });
  def('molotovThrow', { p: 2, m: 2, g: 120, db: -17, v: 4, r: 0.08 }, function (r, sr) {
    var k = K(r);
    return mix(sr, 0.4, [
      [0, whoosh(r, sr, 0.35, 300 * k, 1400 * k, 0.9, 0.3, 0.6), 1],
      [0.02, modal(len(0.1, sr), sr, 3000 * k, [[1, 0.6, 0.02], [1.6, 0.3, 0.015], [2.4, 0.2, 0.01]], r, 0.02), 0.35]
    ]);
  });
  def('molotovBurst', { p: 3, m: 2, g: 200, db: -14, v: 4, r: 0.14 }, function (r, sr) {
    var k = K(r);
    return mix(sr, 0.9, [
      [0, glassBreak(r, sr, k, 0.5), 0.9],
      [0.02, thump(len(0.6, sr), sr, 100 * k, 40, 0.1, 0.35), 1],
      [0.05, fire(r, sr, 0.8, 140, 0.12), 0.7]
    ]);
  });
  def('burn', { c: 'sfx', p: 1, m: 3, g: 200, db: -22, v: 4, r: 0.05, pk: -6 }, function (r, sr) { return fire(r, sr, 0.5, 180, 0.5); });
  def('rocketLaunch', { p: 3, m: 1, g: 500, db: -14, v: 3, r: 0.18 }, function (r, sr) {
    var k = K(r), n = len(1.4, sr);
    return mix(sr, 1.4, [
      [0, mul(filt(white(n, r), sr, 'lp', pw([[0, 380 * k], [0.5, 900 * k], [1.4, 700 * k]]), 0.7), env(n, sr, 0.15, 1.0)), 0.9],
      [0, mul(filt(white(n, r), sr, 'bp', 2500, 0.8), env(n, sr, 0.05, 0.6)), 0.35],
      [0, thump(n, sr, 90 * k, 35, 0.15, 0.25), 0.6]
    ]);
  });
  def('rocketWhistle', { p: 2, m: 1, g: 900, db: -19, v: 3, r: 0.1 }, function (r, sr) {
    var k = K(r), n = len(1.0, sr);
    var wh = D.fm(n, sr, pw([[0, 900 * k], [0.8, 2100 * k], [1.0, 2000 * k]]), 16, 0.6);
    return mix(sr, 1.0, [
      [0, mul(wh, 0.25), 1],
      [0, mul(filt(white(n, r), sr, 'bp', 3000, 0.9), D.am(env(n, sr, 0.1, 0.8), sr, 14, 0.5)), 0.35]
    ]);
  });
  def('rocketBoom', { p: 3, m: 2, g: 200, db: -14, v: 4, r: 0.16 }, function (r, sr) { return boom(r, sr, K(r) * 0.92, 1.3, 0.4); });
  // Cable zap: a band-limited saw buzz with a wobble, and electrical crackle.
  def('zap', { p: 2, m: 3, g: 80, db: -17, v: 4, r: 0.1, pk: -4 }, function (r, sr) {
    var k = K(r), n = len(0.35, sr);
    var buz = mul(filt(D.bsaw(n, sr, function (t) { return 118 * k * (1 + 0.01 * Math.sin(TAU * 9 * t)); }, 16), sr, 'bp', 1400, 0.8),
      env(n, sr, 0.002, 0.12));
    return mix(sr, 0.35, [[0, buz, 0.5], [0, mul(D.crackle(n, sr, 500, 0.8, r), env(n, sr, 0, 0.15)), 0.6]]);
  });
  def('spear', { p: 2, m: 3, g: 80, db: -18, v: 4, r: 0.08 }, function (r, sr) {
    var k = K(r);
    return mix(sr, 0.3, [
      [0, whoosh(r, sr, 0.25, 700 * k, 2400 * k, 1.3, 0.2, 0.8), 1],
      [0, modal(len(0.12, sr), sr, 1800 * k, [[1, 0.6, 0.03], [2.4, 0.4, 0.02], [3.7, 0.2, 0.01]], r, 0.02), 0.3]
    ]);
  });
  def('spearPin', { p: 2, m: 4, g: 80, db: -16, v: 4, r: 0.06 }, function (r, sr) {
    var k = K(r), n = len(0.25, sr);
    return mix(sr, 0.25, [
      [0, snap(n, sr, r, 2200 * k, 1.2, 0.012), 0.6],
      [0, flesh(r, sr, 0.2, k * 0.9, 0.9), 1],
      [0.02, modal(n, sr, 1200 * k, [[1, 0.5, 0.05], [2.2, 0.3, 0.02]], r, 0.01), 0.35]
    ]);
  });
  def('extinguisher', { p: 1, m: 1, g: 300, db: -17, v: 3, r: 0.04, pk: -4 }, function (r, sr) {
    var k = K(r), n = len(1.0, sr);
    var hiss = filt(white(n, r), sr, 'bp', pw([[0, 1400 * k], [0.3, 2800 * k], [1.0, 1600 * k]]), 0.9);
    return mix(sr, 1.0, [
      [0, mul(D.am(hiss, sr, 14, 0.5), env(n, sr, 0.03, 0.5)), 0.9],
      [0, D.crackle(n, sr, 60, 0.3, r), 0.4]
    ]);
  });
  def('cyclone', { p: 2, m: 1, g: 800, db: -18, v: 3, r: 0.2 }, function (r, sr) {
    var k = K(r), n = len(1.2, sr), e = adsr(n, sr, 0.2, 0.2, 0.85, 0.4);
    var wind = D.am(filt(white(n, r), sr, 'bp', pw([[0, 400 * k], [0.6, 1800 * k], [1.2, 500 * k]]), 1.2), sr, 6, 0.35);
    var whoo = D.fm(n, sr, pw([[0, 160 * k], [0.6, 260 * k], [1.2, 140 * k]]), 5, 2.0);
    return mix(sr, 1.2, [[0, mul(wind, e), 0.8], [0, mul(whoo, e), 0.3]]);
  });
  def('cluster', { p: 3, m: 2, g: 200, db: -14, v: 4, r: 0.12 }, function (r, sr) {
    var k = K(r), n = len(0.9, sr), parts = [], i;
    for (i = 0; i < 5; i++) parts.push([0.07 * i + r() * 0.06, thump(len(0.22, sr), sr, (150 + r() * 60) * k, 50, 0.05, 0.08), 0.5 + r() * 0.3]);
    parts.push([0, mul(D.crackle(n, sr, 300, 0.7, r), env(n, sr, 0, 0.4)), 0.6]);
    return mix(sr, 0.9, parts.concat(clanks(r, sr, [0.04, 0.2, 0.36], 700 * k, 0.4, 0.03, 0.25)));
  });
  // ---- Impacts and world ----
  def('boom', { p: 3, m: 2, g: 150, db: -14, v: 4, r: 0.14 }, function (r, sr) { return boom(r, sr, K(r), 1.2, 0.45); });
  def('slam', { c: 'ui', p: 2, m: 2, g: 200, db: -14, v: 3, r: 0.1 }, function (r, sr) {
    var k = K(r), n = len(0.9, sr);
    return mix(sr, 0.9, [
      [0, thump(n, sr, 120 * k, 38, 0.09, 0.32), 1],
      [0, filt(mul(white(n, r), env(n, sr, 0, 0.004)), sr, 'hp', 1800, 0.7), 0.5],
      [0, mul(filt(white(n, r), sr, 'lp', 520, 0.6), env(n, sr, 0.005, 0.35)), 0.55],
      [0.01, modal(n, sr, 1180 * k, [[1, 0.5, 0.25], [1.52, 0.3, 0.18], [2.67, 0.2, 0.1]], r, 0.01), 0.12]
    ]);
  });
  def('shock', { p: 3, m: 2, g: 300, db: -14, v: 3, r: 0.12 }, function (r, sr) {
    var k = K(r);
    return mix(sr, 0.8, [
      [0, thump(len(0.8, sr), sr, 110 * k, 42, 0.14, 0.32), 1],
      [0, whoosh(r, sr, 0.6, 250, 2200 * k, 0.8, 0.5, 1), 0.45]
    ]);
  });
  // Roller shutter: a run of slat clacks with a low rumble underneath.
  def('shutter', { p: 1, m: 2, g: 400, db: -16, v: 3, r: 0.05 }, function (r, sr) {
    var n = len(1.25, sr);
    var roll2 = mul(filt(white(n, r), sr, 'bp', 700, 2.5), D.gen(n, sr, function (t) { return 0.6 + 0.4 * Math.sin(TAU * 16 * t); }));
    return mix(sr, 1.25, scatter(r, sr, 1.1, 16, 780, 0.6, 0.02, 0.8).concat([[0, roll2, 0.4]]));
  });
  def('rattle', { p: 1, m: 2, g: 200, db: -18, v: 4, r: 0.05 }, function (r, sr) {
    var n = len(0.7, sr);
    return mix(sr, 0.7, scatter(r, sr, 0.6, 7, 600, 0.8, 0.04, 0.8).concat([
      [0, mul(filt(white(n, r), sr, 'bp', 2400, 1.5), env(n, sr, 0.02, 0.2)), 0.2]
    ]));
  });
  // Story sting: a cheap speaker losing signal (saturated tones over static).
  def('nosignal', { c: 'ui', p: 3, m: 1, g: 700, db: -18, v: 3, r: 0.04 }, function (r, sr) {
    var k = K(r), parts = [], st = len(1.6, sr);
    [950, 1400, 1800].forEach(function (f, j) { parts.push([j * 0.3, D.sat(tone(sr, f * k, 0.26, 0.9), 1.6), 1]); });
    parts.push([0.95, D.sat(tone(sr, 425 * k, 0.6, 0.6), 1.6), 1]);
    parts.push([0, mul(filt(white(st, r), sr, 'bp', 3000, 0.6), env(st, sr, 0.05, 1.2)), 0.12]);
    parts.push([0, mul(D.crackle(len(0.2, sr), sr, 300, 0.25, r), env(len(0.2, sr), sr, 0, 0.1)), 0.4]);
    return mix(sr, 1.6, parts);
  });
  def('hiss', { p: 3, m: 1, g: 600, db: -19, v: 3, r: 0.04 }, function (r, sr) {
    var k = K(r), n = len(0.9, sr);
    return mix(sr, 0.9, [
      [0, mul(D.am(filt(white(n, r), sr, 'bp', pw([[0, 5200 * k], [0.3, 6800 * k], [0.9, 4300 * k]]), 2.2), sr, 23, 0.35), adsr(n, sr, 0.05, 0.1, 0.9, 0.3)), 0.8],
      [0, mul(filt(white(n, r), sr, 'hp', 2000, 0.7), env(n, sr, 0.002, 0.05)), 0.6]
    ]);
  });
  def('gull', { c: 'sfx', p: 0, m: 2, g: 1500, db: -20, v: 4, r: 0.12 }, function (r, sr) { return D.gull(sr, r, K(r)); });
  def('glass', { p: 2, m: 3, g: 120, db: -17, v: 4, r: 0.12 }, function (r, sr) { return glassBreak(r, sr, K(r), 0.5); });
  // Tram bell: a small bronze bell struck twice, with a click on each strike.
  def('bell', { p: 1, m: 2, g: 300, db: -18, v: 3, r: 0.2 }, function (r, sr) {
    var k = K(r), n = len(1.4, sr), T = [1, 2.42, 3.85, 5.93], A = [1, 0.45, 0.3, 0.2], D1 = [0.9, 0.45, 0.28, 0.16];
    var m1 = T.map(function (q, i) { return [q, A[i], D1[i]]; });
    return mix(sr, 1.6, [
      [0, modal(n, sr, 1240 * k, m1, r, 0.003), 0.8],
      [0, snap(len(0.01, sr), sr, r, 4500, 0.8, 0.002), 0.4],
      [0.36, modal(n, sr, 1240 * k * 1.01, m1, r, 0.003), 0.65],
      [0.36, snap(len(0.01, sr), sr, r, 4500, 0.8, 0.002), 0.3]
    ]);
  });
  def('doorSlam', { p: 2, m: 2, g: 200, db: -15, v: 3, r: 0.14 }, function (r, sr) {
    var k = K(r), n = len(0.9, sr);
    return mix(sr, 0.9, [
      [0, modal(n, sr, 120 * k, [[1, 1, 0.05], [1.6, 0.7, 0.035], [2.9, 0.45, 0.02], [4.4, 0.2, 0.01]], r, 0.02), 0.7],
      [0, thump(n, sr, 110 * k, 45, 0.03, 0.07), 0.8],
      [0.11, modal(len(0.1, sr), sr, 2600 * k, [[1, 0.6, 0.02]], r, 0.02), 0.4],
      [0, mul(filt(white(n, r), sr, 'lp', 700, 0.6), env(n, sr, 0.01, 0.25)), 0.25]
    ]);
  });
  // Chest parts: a wood drop, a shake of coins, and an opening creak with glass sparkles.
  def('chestDrop', { p: 2, m: 2, g: 100, db: -15, v: 4, r: 0.1 }, function (r, sr) {
    var k = K(r), n = len(0.5, sr);
    return mix(sr, 0.5, [
      [0, modal(n, sr, 150 * k, [[1, 1, 0.09], [2.32, 0.5, 0.05], [4.25, 0.25, 0.025]], r, 0.01), 0.7],
      [0, thump(n, sr, 110 * k, 48, 0.05, 0.12), 0.8],
      [0, mul(filt(white(n, r), sr, 'bp', 420 * k, 1.5), env(n, sr, 0.002, 0.03)), 0.4]
    ]);
  });
  def('chestShake', { p: 2, m: 2, g: 200, db: -17, v: 4, r: 0.06 }, function (r, sr) {
    var k = K(r), n = len(0.45, sr);
    return mix(sr, 0.45, clanks(r, sr, [0, 0.05, 0.09, 0.16, 0.2, 0.27, 0.31, 0.37, 0.42], 1300 * k, 0.12, 0.018, 0.55)
      .concat([[0, D.am(filt(white(n, r), sr, 'bp', 2300 * k, 3), sr, 10, 0.6), 0.25]]));
  });
  def('chestOpen', { p: 2, m: 1, g: 500, db: -16, v: 3, r: 0.12 }, function (r, sr) {
    var k = K(r), n = len(0.55, sr), parts = [], i;
    var creak = mul(filt(D.bsaw(n, sr, pw([[0, 120 * k], [0.3, 190 * k], [0.55, 140 * k]]), 10), sr, 'bp', pw([[0, 450], [0.3, 800], [0.55, 400]]), 3),
      D.am(env(n, sr, 0.05, 0.5), sr, 7, 0.6));
    parts.push([0, creak, 0.6], [0, modal(len(0.1, sr), sr, 180 * k, [[1, 0.5, 0.05], [2.32, 0.25, 0.03]], r, 0.01), 0.5]);
    for (i = 0; i < 8; i++) parts.push([0.3 + i * 0.045 + r() * 0.02, gl(r, sr, (2400 + i * 280 + r() * 200) * k, 0.3, 0.12, 0.06), 0.8]);
    return mix(sr, 0.9, parts);
  });
  // ---- Pickups and rewards ----
  // Coin: a plate ring (inharmonic 1 : 1.59 : 2.14 : 2.30 : 2.92) with a click and a short bounce.
  def('coin', { p: 0, m: 4, g: 40, db: -21, v: 4, r: 0.06 }, function (r, sr) {
    var k = K(r), n = len(0.4, sr), m = [[1, 1, 0.16], [1.593, 0.55, 0.1], [2.136, 0.4, 0.07], [2.296, 0.35, 0.06], [2.917, 0.25, 0.04]];
    return mix(sr, 0.4, [
      [0, snap(len(0.004, sr), sr, r, 3800, 0.9, 0.002), 0.35],
      [0, modal(n, sr, 1900 * k, m, r, 0.004), 0.6],
      [0.06, modal(n, sr, 2150 * k, m, r, 0.004), 0.35]
    ]);
  });
  // XP pickup: a tea-glass tink. The runtime raises the pitch on streaks (sfx.js).
  def('tink', { p: 0, m: 4, g: 25, db: -21, v: 5, r: 0.06 }, function (r, sr) {
    var k = K(r), n = len(0.26, sr);
    return mix(sr, 0.26, [
      [0, snap(len(0.003, sr), sr, r, 6000, 0.8, 0.0015), 0.45],
      [0, gl(r, sr, 2900 * k, 0.26, 0.6, 0.075), 0.9]
    ]);
  });
  def('pick', { c: 'ui', p: 1, m: 3, g: 60, db: -19, v: 4, r: 0.06 }, function (r, sr) {
    var k = K(r);
    return mix(sr, 0.6, [
      [0, gl(r, sr, 1046 * k, 0.45, 0.6, 0.12), 1],
      [0.07, gl(r, sr, 1568 * k, 0.5, 0.45, 0.12), 0.8],
      [0, tap(r, sr, 900 * k), 0.5]
    ]);
  });
  // Star collectible: a rising glockenspiel run and a shimmer on top.
  def('star', { c: 'ui', p: 2, m: 2, g: 200, db: -18, v: 3, r: 0.12 }, function (r, sr) {
    var k = K(r), parts = [], i;
    for (i = 0; i < 4; i++) parts.push([0.07 * i, glock(r, sr, [784, 988, 1175, 1568][i] * k, 0.7, 0.6), 0.7]);
    parts.push([0.22, gl(r, sr, 3136 * k, 0.5, 0.2, 0.1), 0.6]);
    return mix(sr, 0.9, parts);
  });
  // Heal (tea): a warm rising marimba arpeggio, a soft triangle pad and an airy sparkle.
  def('heal', { p: 1, m: 2, g: 300, db: -19, v: 3, r: 0.12 }, function (r, sr) {
    var k = K(r), parts = [], i;
    for (i = 0; i < 3; i++) parts.push([0.08 * i, glock(r, sr, [523.25, 659.25, 783.99][i] * k, 0.8, 0.6), 0.9]);
    parts.push([0, mul(D.osc(len(0.9, sr), sr, 'tri', 523.25 * k), adsr(len(0.9, sr), sr, 0.25, 0.2, 0.6, 0.4)), 0.2]);
    parts.push([0.05, mul(filt(white(len(0.5, sr), r), sr, 'hp', 7000, 0.7), env(len(0.5, sr), sr, 0.1, 0.15)), 0.08]);
    return mix(sr, 0.9, parts);
  });
  // XP magnet: a rising band-limited saw whirr through a sweeping low-pass, AM ripple and a small tick on arrival.
  def('magnet', { p: 1, m: 1, g: 500, db: -22, v: 3, r: 0.05 }, function (r, sr) {
    var k = K(r), n = len(0.45, sr);
    var sw = filt(D.bsaw(n, sr, pw([[0, 180 * k], [0.3, 900 * k], [0.45, 700 * k]]), 14), sr, 'lp', pw([[0, 300], [0.3, 2600], [0.45, 1800]]), 0.9);
    return mix(sr, 0.45, [
      [0, mul(D.am(sw, sr, 26, 0.4), adsr(n, sr, 0.02, 0.1, 0.8, 0.12)), 0.45],
      [0, mul(filt(white(n, r), sr, 'bp', pw([[0, 600], [0.4, 2000]]), 2), env(n, sr, 0.05, 0.3)), 0.3],
      [0.4, snap(len(0.02, sr), sr, r, 2400 * k, 1.5, 0.02), 0.3]
    ]);
  });
  def('footstep', { p: 0, m: 2, g: 170, db: -24, v: 5, r: 0.04 }, function (r, sr) { return step(r, sr, K(r), 1); });
  def('mapWalk', { c: 'ui', p: 0, m: 2, g: 200, db: -25, v: 5, r: 0.02 }, function (r, sr) { return step(r, sr, K(r) * 1.2, 0.6); });
  // ---- Enemies ----
  def('elite', { c: 'voice', p: 3, m: 1, g: 1200, db: -14, v: 3, r: 0.14 }, function (r, sr) {
    var k = K(r), n = len(1.0, sr);
    return mix(sr, 1.0, [
      [0, vocal(r, sr, 1.0, 'other', k, { f0: pw([[0, 130 * k], [0.25, 165 * k], [1.0, 85 * k]]), F: [620, 1080, 2550], Q: [4, 5, 6],
        A: [1, 0.55, 0.3], growl: 26, depth: 0.7, jit: 0.8, drive: 2.4, breath: 0.12, creak: 0.15 },
        function (m) { return adsr(m, sr, 0.06, 0.2, 0.8, 0.3); }), 0.9],
      [0, thump(n, sr, 80 * k, 36, 0.12, 0.25), 1]
    ]);
  });
  def('spit', { p: 1, m: 3, g: 200, db: -18, v: 4, r: 0.06 }, function (r, sr) {
    var k = K(r), n = len(0.45, sr);
    return mix(sr, 0.45, [
      [0, mul(D.fm(n, sr, pw([[0, 220 * k], [0.15, 150 * k], [0.45, 260 * k]]), 9, 1.5), env(n, sr, 0.02, 0.3)), 0.6],
      [0, D.bubbles(sr, r, 0.4, 5, 380 * k), 0.5],
      [0.08, mul(filt(white(n, r), sr, 'bp', 1500 * k, 1.4), env(n, sr, 0.002, 0.08)), 0.9]
    ]);
  });
  def('spitHit', { p: 2, m: 3, g: 120, db: -17, v: 4, r: 0.1 }, function (r, sr) {
    var k = K(r), n = len(0.35, sr);
    return mix(sr, 0.35, [
      [0, mul(filt(white(n, r), sr, 'lp', 1800 * k, 0.7), env(n, sr, 0.002, 0.05)), 0.9],
      [0, mul(filt(white(n, r), sr, 'hp', 5200, 0.7), env(n, sr, 0.01, 0.16)), 0.35],
      [0.03, D.bubbles(sr, r, 0.3, 3, 700 * k), 0.4]
    ]);
  });
  def('bruteRoar', { c: 'voice', p: 3, m: 1, g: 1500, db: -13, v: 3, r: 0.18 }, function (r, sr) {
    var k = K(r), n = len(1.7, sr);
    var v = D.voice(n, sr, { f0: pw([[0, 88 * k], [0.4, 118 * k], [1.2, 96 * k], [1.7, 70 * k]]), F: [pw([[0, 520], [0.5, 700], [1.7, 430]]),
      pw([[0, 980], [0.5, 1200], [1.7, 800]]), 2500], Q: [4, 5, 6], A: [1, 0.6, 0.25], growl: 22, depth: 0.8, jit: 0.9, shim: 0.08,
      drive: 3.2, breath: 0.12, vib: 4.5, vibD: 0.015 }, r);
    var e = adsr(n, sr, 0.12, 0.3, 0.9, 0.5);
    return mix(sr, 1.7, [
      [0, mul(v, e), 1],
      [0, mul(filt(white(n, r), sr, 'bp', 1200, 0.8), e), 0.25],
      [0, thump(n, sr, 60 * k, 34, 0.4, 0.9), 0.7]
    ]);
  });
  def('bruteStomp', { p: 3, m: 2, g: 300, db: -14, v: 4, r: 0.12 }, function (r, sr) {
    var k = K(r), n = len(0.8, sr);
    return mix(sr, 0.8, [
      [0, thump(n, sr, 85 * k, 28, 0.15, 0.3), 1],
      [0, mul(filt(white(n, r), sr, 'lp', 800, 0.7), env(n, sr, 0.005, 0.2)), 0.6]
    ].concat(scatter(r, sr, 0.6, 7, 1500, 0.4, 0.012, 0.25).map(function (p) { p[0] += 0.04; return p; })));
  });
  def('bruteCharge', { p: 2, m: 1, g: 800, db: -16, v: 3, r: 0.1 }, function (r, sr) {
    var k = K(r), n = len(1.0, sr), parts = [], i;
    for (i = 0; i < 4; i++) parts.push([0.12 + i * 0.2, thump(len(0.22, sr), sr, 90 * k, 34, 0.05, 0.08), 0.6 + 0.1 * i]);
    parts.push([0, mul(filt(white(n, r), sr, 'lp', 140, 0.7), adsr(n, sr, 0.3, 0.2, 0.7, 0.4)), 0.8]);
    parts.push([0, vocal(r, sr, 1.0, 'usta', k, { f0: pw([[0, 110 * k], [1.0, 90 * k]]), growl: 18, depth: 0.8, drive: 2.6, creak: 0.1 },
      function (m) { return adsr(m, sr, 0.2, 0.2, 0.6, 0.3); }), 0.35]);
    return mix(sr, 1.0, parts);
  });
  def('bloaterSwell', { p: 2, m: 2, g: 400, db: -17, v: 4, r: 0.1 }, function (r, sr) {
    var k = K(r), n = len(0.9, sr);
    var sw = D.osc(n, sr, 'tri', pw([[0, 70 * k], [0.9, 150 * k]]));
    return mix(sr, 0.9, [
      [0, mul(sw, D.gen(n, sr, function (t) { return Math.min(1, t / 0.8); })), 0.8],
      [0, D.bubbles(sr, r, 0.9, 9, 260 * k), 0.5],
      [0, mul(filt(white(n, r), sr, 'bp', 700, 1.2), D.gen(n, sr, function (t) { return 0.3 * Math.min(1, t / 0.9); })), 0.25]
    ]);
  });
  def('bloaterPop', { p: 3, m: 2, g: 200, db: -15, v: 4, r: 0.1 }, function (r, sr) {
    var k = K(r), n = len(0.9, sr);
    return mix(sr, 0.9, [
      [0, thump(len(0.14, sr), sr, 260 * k, 70, 0.02, 0.05), 1],
      [0, mul(filt(white(n, r), sr, 'bp', 1400 * k, 0.8), env(n, sr, 0.003, 0.12)), 0.5],
      [0.01, mul(filt(white(n, r), sr, 'hp', 2400, 0.7), env(n, sr, 0.05, 0.35)), 0.35],
      [0, D.bubbles(sr, r, 0.3, 6, 520 * k), 0.4]
    ]);
  });
  // Boss enters: a band-limited saw drone with a sub, three doum, a tek, a doum and two dissonant bells.
  def('bossIntro', { p: 3, m: 1, g: 2000, db: -13, v: 3, r: 0.2 }, function (r, sr) {
    var k = K(r), L = 2.4, n = len(L, sr);
    var drone = mul(filt(D.bsaw(n, sr, 55 * k, 12), sr, 'lp', pw([[0, 250], [1.2, 700], [2.4, 300]]), 1.2), adsr(n, sr, 0.5, 0.3, 0.9, 0.8));
    var sub = mul(D.osc(n, sr, 'sine', 27.5 * k), adsr(n, sr, 0.6, 0.3, 0.9, 0.8));
    var parts = [[0, drone, 0.6], [0, sub, 0.5]];
    [[0, 1], [0.5, 1], [1.0, 1]].forEach(function (p) { parts.push([p[0], D.doum(sr, r, k), 0.8]); });
    parts.push([1.35, D.tek(sr, r, k), 0.5], [1.5, D.doum(sr, r, k), 0.9]);
    parts.push([0.9, D.bell(sr, 233 * k, 1.6, r, 0.35), 0.5], [0.9, D.bell(sr, 277 * k, 1.6, r, 0.35), 0.4]);
    return mix(sr, L, parts);
  });
  def('bossDie', { c: 'voice', p: 3, m: 1, g: 1500, db: -13, v: 3, r: 0.2 }, function (r, sr) {
    var k = K(r), L = 2.2;
    var groan = vocal(r, sr, L, 'usta', k, { f0: pw([[0, 120 * k], [1.2, 70 * k], [2.2, 50 * k]]), F: [pw([[0, 600], [1.2, 380], [2.2, 300]]),
      pw([[0, 1100], [1.2, 700], [2.2, 600]]), 2400], Q: [4, 5, 5], A: [1, 0.6, 0.2], growl: 12, depth: 0.6, jit: 1, shim: 0.08, vib: 3.5,
      vibD: 0.02, drive: 3, breath: 0.14, creak: 0.25 }, function (m) { return adsr(m, sr, 0.25, 0.6, 0.8, 0.9); });
    return mix(sr, L, [[0, groan, 0.9], [0.8, thump(len(1.3, sr), sr, 80 * k, 30, 0.3, 0.6), 1]]
      .concat(scatter(r, sr, 0.8, 8, 900, 0.5, 0.03, 0.3).map(function (p) { p[0] += 0.8; return p; })));
  });
  // Zombie groan: a rough "oo" that opens to "ah" and sinks, with exhale breath and a creaky end.
  def('groan', { c: 'voice', p: 1, m: 6, g: 350, db: -19, v: 5, r: 0.1 }, function (r, sr) {
    var k = K(r);
    var v = vocal(r, sr, 0.95, 'other', k, { f0: pw([[0, 118 * k], [0.35, 104 * k], [0.95, 92 * k]]),
      F: [pw([[0, 350], [0.4, 600], [0.95, 330]]), pw([[0, 700], [0.4, 1100], [0.95, 650]]), 2500], Q: [4, 5, 5], A: [1, 0.55, 0.2],
      growl: 19, depth: 0.55, jit: 1.0, shim: 0.08, vib: 4.8, vibD: 0.012, drive: 2.4, breath: 0.14, creak: 0.25 },
      function (m) { return adsr(m, sr, 0.12, 0.3, 0.85, 0.3); });
    return mix(sr, 0.95, [[0, v, 1]]);
  });
  // Snarl: a trilled, growled "rrr" with a hard breath edge.
  def('snarl', { c: 'voice', p: 2, m: 4, g: 300, db: -16, v: 4, r: 0.08 }, function (r, sr) {
    var k = K(r), n = len(0.65, sr);
    var v = vocal(r, sr, 0.65, 'other', k, { f0: pw([[0, 160 * k], [0.25, 140 * k], [0.65, 120 * k]]),
      F: [pw([[0, 500], [0.2, 820], [0.65, 420]]), pw([[0, 1400], [0.2, 1600], [0.65, 1000]]), 2800], Q: [3.5, 4.5, 5], A: [1, 0.6, 0.3],
      growl: 28, depth: 0.85, jit: 1.2, shim: 0.08, vib: 7, vibD: 0.01, drive: 2.4, breath: 0.1 },
      function (m) { return adsr(m, sr, 0.02, 0.15, 0.8, 0.25); });
    return mix(sr, 0.65, [[0, v, 1], [0, mul(filt(white(n, r), sr, 'bp', 2200, 0.7), env(n, sr, 0.02, 0.2)), 0.12]]);
  });
  // Zombie death: a falling, creaky "uh" with a breath edge, then wet bubbles.
  def('zombieDie', { c: 'voice', p: 1, m: 4, g: 150, db: -18, v: 4, r: 0.08 }, function (r, sr) {
    var k = K(r);
    var v = vocal(r, sr, 0.7, 'other', k, { f0: pw([[0, 200 * k], [0.5, 110 * k], [0.7, 80 * k]]),
      F: [pw([[0, 420], [0.5, 350], [0.7, 320]]), pw([[0, 900], [0.5, 800], [0.7, 650]]), 2400], Q: [4, 5, 5], growl: 14, depth: 0.4,
      creak: 0.35, drive: 2.2, breath: 0.22, jit: 1.1 }, function (m) { return adsr(m, sr, 0.01, 0.2, 0.5, 0.25); });
    return mix(sr, 0.7, [[0, v, 0.9], [0.3, D.bubbles(sr, r, 0.5, 6, 240 * k), 0.8]]);
  });
  // ---- Story and UI ----
  // Cat: a "mi-ow" with the vowel gliding from "ee" to "ah" and back.
  def('cat', { c: 'voice', p: 2, m: 2, g: 200, db: -18, v: 4, r: 0.1 }, function (r, sr) {
    var k = K(r), n = len(0.6, sr);
    var v = D.voice(n, sr, { f0: pw([[0, 520 * k], [0.12, 700 * k], [0.35, 560 * k], [0.6, 430 * k]]),
      F: [pw([[0, 300], [0.2, 720], [0.6, 450]]), pw([[0, 2300], [0.25, 1100], [0.6, 1700]]), 3300], Q: [4, 5, 6], A: [1, 0.7, 0.3],
      growl: 6, depth: 0.2, jit: 0.4, shim: 0.06, breath: 0.12, vib: 6, vibD: 0.02 }, r);
    return mix(sr, 0.6, [[0, mul(v, adsr(n, sr, 0.05, 0.2, 0.8, 0.2)), 1]]);
  });
  def('hoodIntro', { c: 'ui', p: 2, m: 1, g: 1000, db: -16, v: 3, r: 0.12 }, function (r, sr) {
    var k = K(r), parts = [];
    parts.push([0, D.doum(sr, r, k), 0.9], [0.25, D.tek(sr, r, k), 0.5], [0.38, D.tek(sr, r, k * 1.05), 0.5], [0.5, D.doum(sr, r, k), 0.8]);
    [392, 523.25, 587.3, 784].forEach(function (f, j) { parts.push([0.2 + 0.07 * j, pl(r, sr, f * k, 1.0, 0.998), 0.4]); });
    parts.push([0.9, D.bell(sr, 1240 * k, 1.6, r, 0.4), 0.7]);
    return mix(sr, 1.8, parts);
  });
  def('uiTap', { c: 'ui', p: 1, m: 3, g: 40, db: -23, v: 4, r: 0.02 }, function (r, sr) { return tap(r, sr, 880 * K(r)); });
  def('uiBack', { c: 'ui', p: 1, m: 3, g: 50, db: -24, v: 3, r: 0.02 }, function (r, sr) {
    var k = K(r);
    return mix(sr, 0.16, [[0, tap(r, sr, 660 * k), 1], [0.05, tap(r, sr, 470 * k), 0.7]]);
  });
  def('uiOpen', { c: 'ui', p: 1, m: 2, g: 100, db: -23, v: 3, r: 0.04 }, function (r, sr) {
    var k = K(r), n = len(0.22, sr);
    return mix(sr, 0.22, [
      [0, whoosh(r, sr, 0.22, 500 * k, 1800 * k, 1.0, 0.45, 0.5), 0.8],
      [0, D.am(filt(white(n, r), sr, 'bp', 3500, 1), sr, 60, 0.6), 0.25],
      [0.19, tap(r, sr, 1200 * k), 0.35]
    ]);
  });
  def('nodeUnlock', { c: 'ui', p: 1, m: 2, g: 200, db: -19, v: 3, r: 0.1 }, function (r, sr) {
    var k = K(r);
    return mix(sr, 0.9, clanks(r, sr, [0, 0.12], 1450 * k, 0.1, 0.02, 0.6).concat([[0.22, gl(r, sr, 1318 * k, 0.8, 0.35, 0.2), 0.7]]));
  });
  def('gearEquip', { c: 'ui', p: 1, m: 2, g: 120, db: -21, v: 3, r: 0.05 }, function (r, sr) {
    var k = K(r), n = len(0.2, sr);
    return mix(sr, 0.2, [
      [0, snap(len(0.05, sr), sr, r, 1900 * k, 1.2, 0.012), 0.6],
      [0, mul(filt(white(n, r), sr, 'bp', 1600, 0.7), env(n, sr, 0.03, 0.07)), 0.35],
      [0.08, snap(len(0.08, sr), sr, r, 2600 * k, 1.5, 0.015), 0.4]
    ]);
  });
  def('comicPop', { c: 'ui', p: 1, m: 3, g: 80, db: -23, v: 3, r: 0.04 }, function (r, sr) {
    var k = K(r);
    return mix(sr, 0.14, [
      [0, whoosh(r, sr, 0.1, 2000 * k, 5000 * k, 1.0, 0.2, 0.4), 0.6],
      [0.06, thump(len(0.06, sr), sr, 220 * k, 120, 0.02, 0.03), 0.6]
    ]);
  });
  def('comicPage', { c: 'ui', p: 1, m: 2, g: 300, db: -22, v: 3, r: 0.04 }, function (r, sr) {
    var k = K(r), n = len(0.5, sr);
    return mix(sr, 0.5, [
      [0, mul(D.am(filt(white(n, r), sr, 'bp', 2600 * k, 0.9), sr, 42, 0.7), env(n, sr, 0.08, 0.25)), 0.8],
      [0.36, thump(len(0.1, sr), sr, 180 * k, 80, 0.02, 0.04), 0.25]
    ]);
  });
  // Comic speech blip (one syllable of a voice preset; opts.voice picks the preset).
  def('speech', { c: 'voice', p: 1, m: 2, g: 60, db: -21, v: 5, r: 0.03 }, function (r, sr, o) {
    var who = o.voice || 'other', w = D.preset(who), k = K(r), a = 0.9 + r() * 0.2, b = 0.9 + r() * 0.2, n = len(0.1, sr);
    var F = w.F.map(function (f) { return f * (0.94 + r() * 0.12); });
    var v = D.voice(n, sr, D.who(who, 1, { f0: pw([[0, w.f0 * k * a], [0.1, w.f0 * k * b]]), F: F }), r);
    var cons = filt(mul(white(n, r), env(n, sr, 0.001, 0.004)), sr, 'bp', 2600, 1.0);
    return mix(sr, 0.1, [[0, mul(v, adsr(n, sr, 0.008, 0.02, 0.75, 0.035)), 1], [0, cons, 0.25]]);
  });
  // Phone ringtone: an original ten-note phrase, two passes, in soft triangle tones.
  def('phoneRing', { c: 'sfx', p: 3, m: 1, g: 2600, db: -17, v: 2, r: 0.04 }, function (r, sr) {
    var k = K(r), seq = [[784, 0.16], [880, 0.16], [659, 0.16], [784, 0.16], [988, 0.3], [0, 0.12], [880, 0.16], [784, 0.16], [587, 0.16], [659, 0.4]];
    var parts = [], t = 0, rep, j;
    for (rep = 0; rep < 2; rep++) {
      for (j = 0; j < seq.length; j++) {
        if (seq[j][0] > 0) parts.push([t, tone(sr, seq[j][0] * k, seq[j][1] * 0.92, 0.5), 1]);
        t += seq[j][1];
      }
      t += 0.3;
    }
    return mix(sr, t, parts);
  });
  def('phoneBuzz', { c: 'ui', p: 2, m: 1, g: 500, db: -20, v: 3, r: 0 }, function (r, sr) {
    var k = K(r), n = len(0.95, sr), gt = D.gate(n, sr, [[0, 0.4], [0.5, 0.9]], 0.01);
    var m = D.osc(n, sr, 'tri', 170 * k), rum = filt(white(n, r), sr, 'lp', 300, 0.7);
    return mix(sr, 0.95, [[0, mul(mul(m, gt), 0.8), 1], [0, mul(mul(rum, gt), 0.6), 1]]);
  });
  // ---- Flow ----
  // Stage clear: a darbuka roll, a brass chord (D Rast) under a bell shimmer, and a ney tail.
  def('levelClear', { p: 3, m: 1, g: 1500, db: -14, v: 3, r: 0.16 }, function (r, sr) {
    var k = K(r), parts = roll(r, sr, k, 8, 0.04, 0.36);
    parts.push([0.42, D.doum(sr, r, k), 0.4]);
    [293.7, 370, 440].forEach(function (f, j) { parts.push([0.42, brass(r, sr, f * k, 1.7, { c0: 500, c1: 2200, open: 0.08, att: 0.02, rel: 0.4 }), 0.3 - 0.04 * j]); });
    parts.push([0.42, gl(r, sr, 1174 * k, 1.5, 0.25, 0.25), 0.5]);
    parts.push([0.7, ney(r, sr, 587.3 * k, 1.1), 0.35]);
    return mix(sr, 2.4, parts);
  });
  // Level failed: three falling brass notes, dark and short, over a low sub thump.
  def('levelFail', { p: 3, m: 1, g: 1500, db: -14, v: 3, r: 0.12 }, function (r, sr) {
    var k = K(r), o = { c0: 300, c1: 900, open: 0.1, att: 0.04, rel: 0.25 };
    return mix(sr, 2.0, [
      [0, brass(r, sr, 440 * k, 0.6, o), 0.5],
      [0.55, brass(r, sr, 392 * k, 0.6, o), 0.5],
      [1.1, brass(r, sr, 293.7 * k, 0.9, o), 0.55],
      [1.1, thump(len(0.8, sr), sr, 90 * k, 40, 0.3, 0.5), 0.8]
    ]);
  });
  // Level up: a rising D-G-A brass fanfare with the doum and tek taps and a bell.
  def('level', { p: 3, m: 1, g: 1000, db: -15, v: 3, r: 0.12 }, function (r, sr) {
    var k = K(r), o = { c0: 500, c1: 2400, open: 0.05, att: 0.02, rel: 0.2 };
    return mix(sr, 1.7, [
      [0, D.doum(sr, r, k), 0.7], [0.44, D.tek(sr, r, k), 0.5], [0.66, D.tek(sr, r, k), 0.5],
      [0, brass(r, sr, 293.7 * k, 0.45, o), 0.42],
      [0.11, brass(r, sr, 440 * k, 0.45, o), 0.42],
      [0.22, brass(r, sr, 587.3 * k, 1.45, o), 0.45],
      [0.5, D.bell(sr, 587.3 * k, 1.2, r, 0.5), 0.6]
    ]);
  });
  // Crowd scream: three high formant voices, staggered, with breath and a roar underneath.
  def('crowdScream', { c: 'voice', p: 2, m: 1, g: 2000, db: -19, v: 3, r: 0.25 }, function (r, sr) {
    var k = K(r), L = 2.6, n = len(L, sr), parts = [], j, f;
    for (j = 0; j < 3; j++) {
      f = (260 + r() * 260) * k;
      parts.push([r() * 0.3, vocal(r, sr, L, 'other', 1, { f0: pw([[0, f], [0.6, f * 1.25], [1.6, f * 1.1], [2.6, f * 0.9]]),
        F: [pw([[0, 800], [0.8, 1100], [2.6, 700]]), pw([[0, 1800], [1.2, 2200], [2.6, 1500]]), 3000], A: [1, 0.5, 0.25], Q: [3.5, 4, 5],
        growl: 9 + r() * 6, depth: 0.5, jit: 1.2, shim: 0.08, vib: 6, vibD: 0.02, drive: 1.8, breath: 0.25 },
        function (m) { return adsr(m, sr, 0.25, 0.4, 0.85, 0.8); }), 0.35]);
    }
    parts.push([0, mul(filt(white(n, r), sr, 'bp', 2200, 0.6), adsr(n, sr, 0.5, 0.3, 0.6, 0.8)), 0.15]);
    return mix(sr, L, parts);
  });
  // Evolution finisher: a darbuka roll, a rising bell, a D minor brass chord and a high wash.
  def('finale', { p: 3, m: 1, g: 1500, db: -13, v: 3, r: 0.22 }, function (r, sr) {
    var k = K(r), parts = roll(r, sr, k, 10, 0.05, 0.55), n = len(1.4, sr), o = { c0: 600, c1: 2800, open: 0.07, att: 0.03, rel: 0.5 };
    parts.push([0.55, D.bell(sr, 1174 * k, 2.0, r, 0.5), 0.5]);
    [293.7, 370, 440, 587.3].forEach(function (f, j) { parts.push([0.6 + 0.05 * j, brass(r, sr, f * k, 1.6, o), 0.25]); });
    parts.push([0.7, mul(filt(white(n, r), sr, 'hp', 6000, 0.7), env(n, sr, 0.01, 0.5)), 0.35]);
    return mix(sr, 2.6, parts);
  });
  // ---- Lead additions: nazar dodge shimmer, ferry horn ----
  def('nazar', { p: 2, m: 2, g: 250, db: -17, v: 3, r: 0.2 }, function (r, sr) { return gl(r, sr, 1568 * K(r), 0.9, 0.5, 0.12); });
  def('ferryHorn', { c: 'sfx', p: 0, m: 1, g: 6000, db: -20, v: 2, r: 0.3 }, function (r, sr) { return horn(r, sr, 98 * K(r), 2.4); });
  // ---- Render ----
  // Renders one variant: recipe -> loudness-normalised (META.db = loudest 50 ms RMS, peak <= pk), edge-faded samples.
  // who is the speech preset or hit kind (empty for the rest). Returns null for unknown names.
  function render(name, sr, v, who) {
    if (!Object.prototype.hasOwnProperty.call(FN, name)) return null;
    var m = META[name], vi = ((Math.floor(v) || 0) % m.v + m.v) % m.v, key = name + '|' + vi + '|' + (who || '');
    var x = FN[name](D.rng(D.seed(key)), sr, { v: vi, voice: who || 'other', kind: who || '' });
    D.loud(x, sr, m.db, m.pk);
    return D.fade(x, sr, 1, 5);
  }
  return { meta: META, names: NAMES, has: function (n) { return Object.prototype.hasOwnProperty.call(FN, n); }, render: render,
    HIT_KINDS: Object.keys(HIT) };
})();
