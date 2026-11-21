// Synthesized cue recipes for dialogue, menus and run outcomes. Registers in the game's cue order.
P.SfxUiCues = function (def, K, pl, gl) {
  var D = P.SfxDsp, FX = P.SfxFx;
  var len = D.len, mix = D.mix, mul = D.mul, env = D.env, adsr = D.adsr, white = D.white, filt = D.filt;
  var pw = D.pw, snap = D.snap, thump = D.thump;
  var whoosh = FX.whoosh, clanks = FX.clanks, tap = FX.tap, tone = FX.tone, ney = FX.ney;
  var brass = FX.brass, vocal = FX.vocal, roll = FX.roll;
  // The descending final note leaves room for the next line of dialogue.
  function homeMotif(r, sr, shift, spacing) {
    return mix(sr, 1.95, [329.63, 392, 293.66].map(function (f, i) {
      return [i * spacing, pl(r, sr, f * shift, i === 2 ? 1.05 : .72, .9983), i === 0 ? .8 : .65];
    }));
  }
  def('homeMotif', { c: 'ui', p: 2, m: 1, g: 1200, db: -26, v: 1, r: .13 }, function (r, sr) { return homeMotif(r, sr, 1, .26); });
  def('farewellMotif', { c: 'ui', p: 2, m: 1, g: 1200, db: -28, v: 1, r: .18 }, function (r, sr) { return homeMotif(r, sr, .75, .33); });
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
};
