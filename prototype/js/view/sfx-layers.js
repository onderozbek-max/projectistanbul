// Layer helpers (P.SfxFx): composed building blocks shared by the cue recipes in sfx-bank2.js.
// clanks/clankAt/scatter return [atSec, samples, gain] mix parts; the others return sample buffers.
P.SfxFx = (function () {
  var D = P.SfxDsp, TAU = Math.PI * 2;
  var len = D.len, mix = D.mix, mul = D.mul, env = D.env, adsr = D.adsr, white = D.white, filt = D.filt;
  var modal = D.modal, thump = D.thump, pw = D.pw, snap = D.snap;
  // Band-passed noise sweep f0 -> f1 (Hz), rising to peak at pk (fraction of sec), then decaying.
  function whoosh(r, sr, sec, f0, f1, q, pk, amp) {
    var n = len(sec, sr), e = D.gen(n, sr, function (t) {
      var u = t / sec;
      return u < pk ? Math.pow(u / pk, 2) : Math.pow(Math.max(0, 1 - u) / (1 - pk), 1.5);
    });
    var s = filt(white(n, r), sr, 'bp', function (t) { return f0 + (f1 - f0) * Math.min(1, t / sec); }, q);
    return mul(mul(s, e), amp);
  }
  // Metal clank as a mix part [at, samples, gain].
  function clankAt(r, sr, at, f, a, tau) {
    return [at, modal(len(tau * 6, sr), sr, f, [[1, a, tau], [2.32, a * 0.45, tau * 0.5], [4.13, a * 0.2, tau * 0.3]], r, 0.01), 1];
  }
  // Clanks at the given times, pitched around f0 (span = random +/- fraction).
  function clanks(r, sr, times, f0, span, tau, amp) {
    return times.map(function (t) {
      return clankAt(r, sr, t, f0 * (1 + (r() * 2 - 1) * span), amp * (0.6 + 0.4 * r()), tau);
    });
  }
  // Pneumatic nail shot: air puff, the clack of the nose, and a short thunk into the wood.
  function nailShot(r, sr, k) {
    var n = len(0.1, sr);
    return mix(sr, 0.1, [
      [0, snap(n, sr, r, 5200 * k, 0.7, 0.004), 0.5],
      [0, filt(mul(white(n, r), env(n, sr, 0.001, 0.02)), sr, 'hp', 3800 * k, 0.8), 0.4],
      [0.01, modal(n, sr, 2300 * k, [[1, 1, 0.012], [1.5, 0.5, 0.008], [2.7, 0.35, 0.006]], r, 0.02), 0.5],
      [0, thump(n, sr, 260 * k, 90, 0.02, 0.035), 0.9]
    ]);
  }
  // Footstep on stone: heel tick, grit and a short tuned knock. g = gain.
  function step(r, sr, k, g) {
    var n = len(0.12, sr);
    return mix(sr, 0.12, [
      [0, snap(n, sr, r, 2000 * k, 1.6, 0.012), 0.8 * g],
      [0, filt(mul(white(n, r), env(n, sr, 0.0005, 0.006)), sr, 'hp', 3000, 0.7), 0.25 * g],
      [0, modal(n, sr, 540 * k, [[1, 0.5, 0.02], [1.9, 0.25, 0.012], [3.1, 0.12, 0.008]], r, 0.02), 0.35 * g],
      [0, thump(n, sr, 110 * k, 58, 0.02, 0.03), 0.3 * g]
    ]);
  }
  // Soft wooden tap at pitch f (UI): modal wood body, a 3.8 kHz tick and a short low thump.
  function tap(r, sr, f) {
    var n = len(0.06, sr);
    return mix(sr, 0.06, [
      [0, modal(n, sr, f, [[1, 1, 0.02], [2.32, 0.3, 0.01]], r, 0.01), 0.7],
      [0, snap(n, sr, r, 3800, 1.5, 0.003), 0.5],
      [0, thump(n, sr, 240, 150, 0.01, 0.012), 0.25]
    ]);
  }
  // Melee strike layers: click (transient), body (pitch-dropping thump), crack, wet squelch (AM noise) and ring.
  // o keys (all optional, amplitudes): click, clickFc, body, f0, f1, tau, ampTau, crack, crackFc, wet, wetFc, wetTau, ring, ringF.
  function strike(r, sr, sec, k, o) {
    var n = len(sec, sr), parts = [];
    if (o.click) parts.push([0, snap(n, sr, r, o.clickFc || 4200, 0.9, 0.0025), o.click]);
    if (o.body) parts.push([0, thump(n, sr, (o.f0 || 170) * k, o.f1 || 60, o.tau || 0.03, o.ampTau || 0.08), o.body]);
    if (o.crack) parts.push([0, snap(n, sr, r, (o.crackFc || 2400) * k, 0.8, 0.006), o.crack]);
    if (o.wet) parts.push([0.003, mul(D.am(filt(white(n, r), sr, 'bp', (o.wetFc || 500) * k, 2), sr, 30, 0.5), env(n, sr, 0.003, o.wetTau || 0.07)), o.wet]);
    if (o.ring) parts.push([0, modal(n, sr, (o.ringF || 1800) * k, [[1, 1, o.ringTau || 0.05], [2.76, 0.4, 0.03], [5.4, 0.2, 0.015]], r, 0.01), o.ring]);
    return mix(sr, sec, parts);
  }
  // Flesh impact: dull body thud plus wet squelch. amp = gain.
  function flesh(r, sr, sec, k, amp) {
    return strike(r, sr, sec, k, { body: 0.9 * amp, f0: 170, f1: 55, tau: 0.03, ampTau: 0.09, wet: 0.7 * amp, wetFc: 520, wetTau: 0.06 });
  }
  // Explosion: sub boom with a pitch drop, a bang, a brown-noise air blast, grit and debris clanks. drop = boom decay (s).
  function boom(r, sr, k, sec, drop) {
    var n = len(sec, sr);
    return mix(sr, sec, [
      [0, thump(n, sr, 110 * k, 28, 0.1, drop), 1],
      [0, snap(n, sr, r, 2200 * k, 0.7, 0.012), 0.55],
      [0.004, mul(filt(D.brown(n, r), sr, 'lp', 380, 0.6), env(n, sr, 0.004, sec * 0.3)), 0.7],
      [0, mul(D.crackle(n, sr, 180, 0.9, r), env(n, sr, 0, sec * 0.35)), 0.35],
      [0.02, mul(filt(white(n, r), sr, 'lp', 800, 0.6), env(n, sr, 0.01, sec * 0.45)), 0.25]
    ].concat(clanks(r, sr, [0.05, 0.12, 0.2, 0.31, 0.44], 620 * k, 0.5, 0.03, 0.3)));
  }
  // Glass break: a crunch, a main ring and a scatter of shard tinks thinning out over sec.
  function glassBreak(r, sr, k, sec) {
    var n = len(sec, sr), parts = [], i, t;
    parts.push([0, mul(filt(white(len(0.25, sr), r), sr, 'bp', 3500 * k, 0.9), env(len(0.25, sr), sr, 0.0008, 0.02)), 0.6]);
    parts.push([0, D.glass(len(0.5, sr), sr, 3300 * k, r, 0.5, 0.09), 0.6]);
    for (i = 0; i < 22; i++) {
      t = Math.pow(r(), 1.5) * sec * 0.9;
      parts.push([t, D.glass(len(0.12, sr), sr, (2600 + r() * 4200) * k, r, 0.35 * (1 - t / sec) + 0.06, 0.03 + r() * 0.03), 1]);
    }
    return mix(sr, sec, parts);
  }
  // Fire: sparse crackle over a low rumble. rate = clicks per second.
  function fire(r, sr, sec, rate, amp) {
    var n = len(sec, sr);
    return mix(sr, sec, [
      [0, D.crackle(n, sr, rate, amp, r), 1],
      [0, mul(filt(white(n, r), sr, 'lp', 220, 0.6), env(n, sr, 0.05, sec * 0.6)), 0.6]
    ]);
  }
  // Soft triangle tone with a short envelope (phone, chimes). a = gain.
  function tone(sr, f, sec, a) {
    var n = len(sec, sr);
    return mul(mul(D.osc(n, sr, 'tri', f), adsr(n, sr, 0.004, 0.02, 0.9, 0.02)), a);
  }
  // Ney-like breathy note with vibrato (story stings). f in Hz.
  function ney(r, sr, f, sec) {
    var n = len(sec, sr), vb = function (t) { return 1 + 0.012 * Math.sin(TAU * 5 * t); }, i;
    var s = D.osc(n, sr, 'sine', function (t) { return f * vb(t); });
    var h = D.osc(n, sr, 'sine', function (t) { return 2 * f * vb(t); });
    var br = mul(filt(white(n, r), sr, 'bp', f * 3, 2), env(n, sr, 0.15, sec * 0.5));
    for (i = 0; i < n; i++) s[i] += 0.3 * h[i] + 0.05 * br[i];
    return mul(s, adsr(n, sr, 0.12, 0.1, 0.9, 0.3));
  }
  // Synthetic brass note: two detuned band-limited saws through a low-pass that opens on the attack, with a
  // slow vibrato that fades in. o: c0, c1 (cutoff Hz), open (s), att, rel, sec is the length.
  function brass(r, sr, f, sec, o) {
    var n = len(sec, sr), nh = Math.max(4, Math.min(20, Math.floor(0.42 * sr / (f * 1.01)))), i, s = new Float32Array(n);
    var hA = new Float32Array(n), hB = new Float32Array(n), t, vb;
    for (i = 0; i < n; i++) {
      t = i / sr; vb = 1 + 0.005 * Math.min(1, t / 0.4) * Math.sin(TAU * 5.2 * t);
      hA[i] = f * vb; hB[i] = f * 1.006 * vb;
    }
    var a = D.bsawArr(n, sr, hA, nh), b = D.bsawArr(n, sr, hB, nh);
    for (i = 0; i < n; i++) s[i] = 0.5 * (a[i] + b[i]);
    var c0 = o.c0 || 500, c1 = o.c1 || 2400, op = o.open || 0.06;
    var lp = filt(s, sr, 'lp', function (t) { return c0 + (c1 - c0) * (1 - Math.exp(-t / op)); }, 0.8);
    return mul(lp, adsr(n, sr, o.att || 0.03, 0.15, 0.85, o.rel || 0.15));
  }
  // Ferry horn: a low detuned pair of band-limited saws with a nasal formant, slow onset and a soft release.
  function horn(r, sr, f, sec) {
    var n = len(sec, sr), nh = 12, i, s = new Float32Array(n), a, b;
    a = D.bsaw(n, sr, f, nh); b = D.bsaw(n, sr, f * 1.005, nh);
    for (i = 0; i < n; i++) s[i] = 0.5 * (a[i] + b[i]);
    var body = filt(s, sr, 'lp', 900, 0.7), nasal = filt(s, sr, 'bp', 380, 1.2);
    var breathN = mul(filt(white(n, r), sr, 'bp', 300, 1.2), env(n, sr, 0.1, sec * 0.5));
    for (i = 0; i < n; i++) body[i] = 0.7 * body[i] + 0.5 * nasal[i] + 0.04 * breathN[i];
    return mul(body, adsr(n, sr, 0.14, 0.1, 0.95, 0.5));
  }
  // Clanks/knocks that are scattered at random times (rattle, debris).
  function scatter(r, sr, sec, count, f0, span, tau, amp) {
    var times = [], i;
    for (i = 0; i < count; i++) times.push(Math.pow(r(), 1.3) * sec * 0.85);
    return clanks(r, sr, times, f0, span, tau, amp);
  }
  // Darbuka roll: n hits from tek (accelerating), optional doum at the end.
  function roll(r, sr, k, count, gap0, doumAt) {
    var parts = [], t = 0, g = gap0, i;
    for (i = 0; i < count; i++) { parts.push([t, D.tek(sr, r, k * (0.96 + r() * 0.08)), 0.3 + 0.5 * i / count]); t += g; g *= 0.92; }
    if (doumAt !== undefined) parts.push([doumAt, D.doum(sr, r, k), 0.9]);
    return parts;
  }
  // Formant vocal from a preset. over = voice() overrides (absolute Hz); envFn(n) -> envelope array.
  function vocal(r, sr, sec, who, k, over, envFn) {
    var n = len(sec, sr);
    return mul(D.voice(n, sr, D.who(who, k, over), r), envFn(n));
  }
  return {
    whoosh: whoosh, clankAt: clankAt, clanks: clanks, nailShot: nailShot, step: step, tap: tap, strike: strike,
    flesh: flesh, boom: boom, glassBreak: glassBreak, fire: fire, tone: tone, ney: ney, brass: brass, horn: horn,
    vocal: vocal, scatter: scatter, roll: roll
  };
})();
