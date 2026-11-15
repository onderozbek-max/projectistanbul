// Sound design DSP (workstream A, v0.5). Pure sample-domain generators: no WebAudio, no DOM, so the same code runs in
// the browser and in Node (tools/render-sfx.js, tools/qa-sfx.js). Mono Float32Array out. Times in seconds. Frequencies
// in Hz or fn(t) -> Hz. Loaded before sfx-bank2.js (cue recipes) and sfx.js (runtime).
// Globals: P.SfxDsp (primitives, voice engine, world sounds, darbuka, ambience beds via .bed) and P.SfxFx (layers).
// v0.5: glass rings with beating pairs, a real-looking voice engine (glottal pulses, jitter, shimmer, breath,
// throat drive, parallel formants), band-limited saws for brass and horns, transient "snap" clicks, a layered boom.
P.SfxDsp = (function () {
  var TAU = Math.PI * 2;
  function len(sec, sr) { return Math.max(1, Math.round(sec * sr)); }
  function buf(sec, sr) { return new Float32Array(len(sec, sr)); }
  function fn(v) { return typeof v === 'function' ? v : function () { return v; }; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function seed(str) {
    var h = 2166136261, i;
    for (i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  // mulberry32: seeded uniform [0, 1).
  function rng(s) {
    var a = s >>> 0;
    return function () {
      var t;
      a = (a + 0x6D2B79F5) >>> 0; t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Per-sample generator f(t, i), t in seconds.
  function gen(n, sr, f) { var y = new Float32Array(n), i; for (i = 0; i < n; i++) y[i] = f(i / sr, i); return y; }
  function white(n, r) { var y = new Float32Array(n), i; for (i = 0; i < n; i++) y[i] = r() * 2 - 1; return y; }
  // Pink-ish noise (Paul Kellet economy filter).
  function pink(n, r) {
    var y = new Float32Array(n), b0 = 0, b1 = 0, b2 = 0, i, w;
    for (i = 0; i < n; i++) {
      w = r() * 2 - 1;
      b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913;
      y[i] = (b0 + b1 + b2 + w * 0.1848) * 0.25;
    }
    return y;
  }
  // Brown (red) noise, normalised to peak 1.
  function brown(n, r) {
    var y = new Float32Array(n), v = 0, pk = 0, i;
    for (i = 0; i < n; i++) { v = v * 0.997 + (r() * 2 - 1) * 0.08; y[i] = v; if (Math.abs(v) > pk) pk = Math.abs(v); }
    if (pk > 1e-9) for (i = 0; i < n; i++) y[i] /= pk;
    return y;
  }
  // RBJ biquad, direct form II transposed. type 'lp' | 'hp' | 'bp' (0 dB peak). f: Hz or fn(t). Refreshed every 32 samples.
  function filt(x, sr, type, f, q) {
    var n = x.length, y = new Float32Array(n), fq = fn(f), z1 = 0, z2 = 0;
    var b0 = 0, b1 = 0, b2 = 0, a1 = 0, a2 = 0, i, w, c, al, a0, v;
    for (i = 0; i < n; i++) {
      if ((i & 31) === 0) {
        w = TAU * clamp(fq(i / sr), 20, sr * 0.45) / sr; c = Math.cos(w); al = Math.sin(w) / (2 * q); a0 = 1 + al;
        if (type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; }
        else if (type === 'hp') { b0 = (1 + c) / 2; b1 = -1 - c; b2 = b0; }
        else { b0 = al; b1 = 0; b2 = -al; }
        b0 /= a0; b1 /= a0; b2 /= a0; a1 = -2 * c / a0; a2 = (1 - al) / a0;
      }
      v = x[i] * b0 + z1; z1 = x[i] * b1 - a1 * v + z2; z2 = x[i] * b2 - a2 * v; y[i] = v;
    }
    return y;
  }
  // One-pole low-pass (smooth tails, air).
  function lp1(x, sr, fc) {
    var a = 1 - Math.exp(-TAU * fc / sr), y = new Float32Array(x.length), v = 0, i;
    for (i = 0; i < x.length; i++) { v += a * (x[i] - v); y[i] = v; }
    return y;
  }
  function wave(k, ph, d) {
    if (k === 'saw') return 2 * ph - 1;
    if (k === 'tri') return 4 * Math.abs(ph - 0.5) - 1;
    if (k === 'pulse') return ph < (d || 0.5) ? 1 : -1;
    return Math.sin(TAU * ph);
  }
  // Phase-accumulating oscillator (naive waveforms; use bsaw for saws that must not alias). f: Hz or fn(t).
  function osc(n, sr, kind, f, duty) {
    var y = new Float32Array(n), fq = fn(f), ph = 0, i;
    for (i = 0; i < n; i++) { ph += fq(i / sr) / sr; ph -= Math.floor(ph); y[i] = wave(kind, ph, duty); }
    return y;
  }
  // Band-limited saw by wavetable: nh harmonics (1/k), linear interpolation. f: Hz or fn(t). Choose nh so nh*fmax < 0.45 sr.
  // Tables are cached per nh (they do not depend on the sample rate).
  var SAW = {};
  function sawTable(nh) {
    var N = 4096, T, j, k, x;
    if (SAW[nh]) return SAW[nh];
    T = new Float32Array(N + 1);
    for (j = 0; j <= N; j++) { x = 0; for (k = 1; k <= nh; k++) x += Math.sin(TAU * k * j / N) / k; T[j] = x * (2 / Math.PI); }
    SAW[nh] = T;
    return T;
  }
  function bsaw(n, sr, f, nh) {
    var hz = new Float32Array(n), fq = fn(f), i;
    for (i = 0; i < n; i++) hz[i] = fq(i / sr);
    return bsawArr(n, sr, hz, nh);
  }
  // Band-limited saw with a per-sample frequency array hz (Hz). Same table as bsaw; no closures in the loop.
  function bsawArr(n, sr, hz, nh) {
    var N = 4096, T = sawTable(nh), y = new Float32Array(n), ph = 0, i, p, m, x;
    for (i = 0; i < n; i++) {
      ph += hz[i] / sr; ph -= Math.floor(ph);
      p = ph * N; m = Math.floor(p); x = p - m;
      y[i] = T[m] + (T[m + 1] - T[m]) * x;
    }
    return y;
  }
  // FM sine: carrier fc (Hz|fn), modulator mh (Hz|fn), index ix (number|fn).
  function fm(n, sr, fc, mh, ix) {
    var y = new Float32Array(n), fq = fn(fc), mq = fn(mh), fi = fn(ix), pc = 0, pm = 0, i, t;
    for (i = 0; i < n; i++) {
      t = i / sr; pc += fq(t) / sr; pm += mq(t) / sr;
      y[i] = Math.sin(TAU * pc + fi(t) * Math.sin(TAU * pm));
    }
    return y;
  }
  // Linear attack atk (s), then exponential decay with time constant tau (s).
  function env(n, sr, atk, tau) {
    return gen(n, sr, function (t) { return (atk > 0 && t < atk ? t / atk : 1) * Math.exp(-t / tau); });
  }
  // Linear ADSR; rel = release length at the end (s).
  function adsr(n, sr, a, d, s, rel) {
    var N = n / sr;
    return gen(n, sr, function (t) {
      var v = a > 0 && t < a ? t / a : (t < a + d ? 1 + (s - 1) * ((t - a) / d) : s), tr = N - t;
      return tr < rel ? v * Math.max(0, tr / rel) : v;
    });
  }
  // 1 inside [start, end] spans (s), with linear ramps of `ramp` seconds (vibration buzz, gates).
  function gate(n, sr, spans, ramp) {
    return gen(n, sr, function (t) {
      for (var j = 0; j < spans.length; j++) {
        if (t >= spans[j][0] && t <= spans[j][1]) return Math.max(0, Math.min(1, (t - spans[j][0]) / ramp, (spans[j][1] - t) / ramp));
      }
      return 0;
    });
  }
  // Multiply x by e (array or number), in place.
  function mul(x, e) {
    var num = typeof e === 'number', i;
    for (i = 0; i < x.length; i++) x[i] *= num ? e : e[i];
    return x;
  }
  // Amplitude modulation, in place. depth 0..1 at hz.
  function am(x, sr, hz, depth) {
    for (var i = 0; i < x.length; i++) x[i] *= 1 - depth * 0.5 * (1 + Math.sin(TAU * hz * i / sr));
    return x;
  }
  // Piecewise-linear curve through [[t, v], ...]; clamped outside the range.
  function pw(pts) {
    return function (t) {
      var i, a, b, u;
      if (t <= pts[0][0]) return pts[0][1];
      for (i = 1; i < pts.length; i++) {
        if (t <= pts[i][0]) { a = pts[i - 1]; b = pts[i]; u = (t - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * u; }
      }
      return pts[pts.length - 1][1];
    };
  }
  // Sums parts [[atSec, samples, gain], ...] into a fresh buffer of sec seconds.
  function mix(sr, sec, parts) {
    var y = buf(sec, sr), p, x, g, at, i;
    for (p = 0; p < parts.length; p++) {
      x = parts[p][1]; g = parts[p][2] === undefined ? 1 : parts[p][2]; at = Math.round(parts[p][0] * sr);
      for (i = 0; i < x.length && at + i < y.length; i++) if (at + i >= 0) y[at + i] += x[i] * g;
    }
    return y;
  }
  // Adds x into y at sample offset `at`, scaled by g. In place.
  function addAt(y, at, x, g) {
    for (var i = 0; i < x.length && at + i < y.length; i++) if (at + i >= 0) y[at + i] += x[i] * g;
    return y;
  }
  // Short fades (ms) at both ends, in place.
  function fade(x, sr, inMs, outMs) {
    var n = x.length, a = Math.min(n >> 1, Math.round(inMs * sr / 1000)), b = Math.min(n >> 1, Math.round(outMs * sr / 1000)), i;
    for (i = 0; i < a; i++) x[i] *= i / a;
    for (i = 0; i < b; i++) x[n - 1 - i] *= i / b;
    return x;
  }
  // Scale to an RMS target (dBFS), capped so the peak stays under peakDb. Silence stays silent. In place.
  function norm(x, rmsDb, peakDb) {
    var n = x.length, s = 0, pk = 0, i, v, g;
    for (i = 0; i < n; i++) { v = Math.abs(x[i]); s += v * v; if (v > pk) pk = v; }
    if (pk < 1e-9) return x;
    g = Math.min(Math.pow(10, rmsDb / 20) / Math.sqrt(s / n), Math.pow(10, peakDb / 20) / pk);
    for (i = 0; i < n; i++) x[i] *= g;
    return x;
  }
  // Perceptual level: scales so the loudest 50 ms RMS reaches dB (impulsive and sustained cues then sound
  // equally loud). Capped at peakDb. In place.
  function loud(x, sr, dB, peakDb) {
    var w = Math.max(1, Math.round(sr * 0.05)), n = x.length, s = 0, best = 0, pk = 0, i, g, v;
    for (i = 0; i < n; i++) {
      v = x[i];
      s += v * v; if (i >= w) s -= x[i - w] * x[i - w];
      if (i >= w - 1 && s > best) best = s;
      if (Math.abs(v) > pk) pk = Math.abs(v);
    }
    if (pk < 1e-9) return x;
    g = Math.min(Math.pow(10, dB / 20) / Math.sqrt(Math.max(best / w, 1e-12)), Math.pow(10, peakDb / 20) / pk);
    for (i = 0; i < n; i++) x[i] *= g;
    return x;
  }
  // Soft saturation (tanh), in place. Adds odd harmonics; the caller normalises the level afterwards.
  function sat(x, drive) {
    var d = Math.tanh(drive), i;
    for (i = 0; i < x.length; i++) x[i] = Math.tanh(drive * x[i]) / d;
    return x;
  }
  // Feedback echo, in place (tail truncated to the buffer).
  function echo(x, sr, dSec, fb) {
    var d = Math.round(dSec * sr), i;
    for (i = d; i < x.length; i++) x[i] += x[i - d] * fb;
    return x;
  }
  // Modal synthesis: sum of exponentially decaying partials. modes = [[ratio, amp, tauSec], ...].
  // jit = random detune per partial (fraction) so repeated hits never sound identical.
  function modal(n, sr, f0, modes, r, jit) {
    var y = new Float32Array(n), m, hz, w, d, c, s, re, im, nr, a, i;
    for (m = 0; m < modes.length; m++) {
      hz = f0 * modes[m][0] * (1 + (jit ? (r() * 2 - 1) * jit : 0));
      w = TAU * hz / sr; d = Math.exp(-1 / (modes[m][2] * sr));
      c = Math.cos(w) * d; s = Math.sin(w) * d; re = 1; im = 0; a = modes[m][1];
      for (i = 0; i < n; i++) { y[i] += a * re; nr = re * c - im * s; im = re * s + im * c; re = nr; }
    }
    return y;
  }
  // Transient click: band-passed noise with an immediate decay (tau s). Used for strikes, latches and ticks.
  function snap(n, sr, r, fc, q, tau) { return mul(filt(white(n, r), sr, 'bp', fc, q), env(n, sr, 0, tau)); }
  // Glass or small-bell ring: inharmonic partials plus a beating twin (+0.35%), so the ring shimmers.
  // tau = fundamental decay (s). amp = gain.
  var GLASS = [[1, 1, 0.05], [2.32, 0.5, 0.03], [4.25, 0.25, 0.02], [6.63, 0.12, 0.012]];
  function glass(n, sr, f, r, amp, tau) {
    var k = (tau || 0.05) / 0.05, modes = GLASS.map(function (m) { return [m[0], m[1] * amp * 0.5, m[2] * k]; });
    var a = modal(n, sr, f, modes, r, 0.002), b = modal(n, sr, f * 1.0035, modes, r, 0.002), i;
    for (i = 0; i < n; i++) a[i] += b[i];
    return a;
  }
  // Karplus-Strong plucked string. damp ~0.9975 = ~0.5 s ring at 660 Hz; ~0.9985 = ~1 s.
  function pluck(n, sr, hz, damp, r) {
    var L = Math.max(2, Math.round(sr / hz)), d = new Float32Array(L), y = new Float32Array(n), p = 0, i, k;
    for (i = 0; i < L; i++) d[i] = r() * 2 - 1;
    for (i = 0; i < L; i++) d[i] = 0.5 * (d[i] + d[(i + 1) % L]);
    for (i = 0; i < n; i++) { k = (p + 1) % L; y[i] = d[p]; d[p] = damp * 0.5 * (d[p] + d[k]); p = k; }
    return dcBlock(y);
  }
  // DC blocker (about 15 Hz), in place: removes the offset that random excitations and averaging filters leave behind.
  function dcBlock(y) {
    var x1 = 0, y1 = 0, i, x0;
    for (i = 0; i < y.length; i++) { x0 = y[i]; y1 = x0 - x1 + 0.9994 * y1; x1 = x0; y[i] = y1; }
    return y;
  }
  // Pitch-dropping sine body (kick, thud): frequency falls f0 -> f1 (time constant tau); amplitude decays with ampTau.
  function thump(n, sr, f0, f1, tau, ampTau) {
    var ph = 0;
    return gen(n, sr, function (t) {
      ph += (f1 + (f0 - f1) * Math.exp(-t / tau)) / sr;
      return Math.sin(TAU * ph) * Math.exp(-t / ampTau);
    });
  }
  // Sparse random clicks (fire, electric crackle): rate per second, high-passed for snap.
  function crackle(n, sr, rate, amp, r) {
    var y = new Float32Array(n), p = rate / sr, i;
    for (i = 0; i < n; i++) if (r() < p) y[i] = (r() * 2 - 1) * amp;
    return filt(y, sr, 'hp', 1400, 0.7);
  }
  // Bronze bell (church-ish, long): inharmonic partials, ring length sec, lvl 0..1.
  var BELL = [[0.5, 0.5, 2.6], [1, 1, 2.2], [1.19, 0.6, 1.6], [1.5, 0.45, 1.2], [2.0, 0.35, 0.9], [2.74, 0.3, 0.6], [3.0, 0.2, 0.4], [4.07, 0.15, 0.25]];
  function bell(sr, f0, sec, r, lvl) {
    var k = sec / 2.2, modes = BELL.map(function (m) { return [m[0], m[1] * lvl, m[2] * k]; });
    return fade(modal(len(sec, sr), sr, f0, modes, r, 0.002), sr, 1, 150);
  }
  // ---- Voice engine (v0.5) ----
  // Glottal source: Rosenberg pulses (open quotient oq) with period jitter, shimmer, optional creak and growl AM,
  // then a radiation pre-emphasis. Optional throat drive (tanh) adds rasp. Breath is band-passed noise mixed in.
  // Formants are parallel band-passes (Q = centre / bandwidth); A sets each formant's level.
  // o: f0 (Hz|fn), F [Hz|fn], Q [], A [], growl (Hz), depth 0..1, jit 0..1, shim 0..1, creak 0..1, breath 0..1,
  // drive (>= 0), oq (0.4..0.8), vib (Hz), vibD (fraction).
  function voice(n, sr, o, r) {
    var f0 = fn(o.f0), jit = o.jit === undefined ? 0.4 : o.jit, shim = o.shim === undefined ? 0.04 : o.shim;
    var growl = o.growl || 30, depth = o.depth || 0, vib = o.vib === undefined ? 5 : o.vib, vibD = o.vibD === undefined ? 0.008 : o.vibD;
    var creak = o.creak || 0, oq = o.oq || 0.6, drive = o.drive || 0, breath = o.breath === undefined ? 0.04 : o.breath;
    var tilt = o.tilt === undefined ? 0.6 : o.tilt;
    var tp = oq * 0.4, tn = oq * 0.16, src = new Float32Array(n), out = new Float32Array(n), wob = 0, ph = 0, per = 1, amp = 1, dl = 0;
    var i, t, hz, g, v, k, b, d, F, Q, A, rs = (r() * 4294967296) >>> 0, u;
    for (i = 0; i < n; i++) {
      t = i / sr;
      rs = (Math.imul(rs, 1664525) + 1013904223) >>> 0; u = rs / 2147483648 - 1;
      wob = wob * 0.9995 + u * 0.0004 * (0.5 + jit);
      hz = f0(t) * (1 + wob + vibD * Math.sin(TAU * vib * t)) * per;
      ph += hz / sr;
      if (ph >= 1) {
        ph -= Math.floor(ph);
        per = 1 + (r() * 2 - 1) * 0.02 * jit;
        amp = (1 + (r() * 2 - 1) * shim) * (r() < creak ? 0.25 + 0.5 * r() : 1);
      }
      if (ph < tp) v = 0.5 * (1 - Math.cos(Math.PI * ph / tp));
      else if (ph < tp + tn) v = Math.cos(0.5 * Math.PI * (ph - tp) / tn);
      else v = 0;
      v *= amp;
      g = 1 - depth * 0.5 * (1 + Math.sin(TAU * growl * t));
      src[i] = (v - tilt * dl) * g; dl = v;
    }
    if (drive > 0) sat(src, drive);
    F = o.F || [700, 1200, 2600]; Q = o.Q || []; A = o.A || [1, 0.5, 0.25];
    for (k = 0; k < F.length; k++) {
      b = filt(src, sr, 'bp', F[k], Q[k] || 5);
      d = A[k] === undefined ? 1 : A[k];
      for (i = 0; i < n; i++) out[i] += d * b[i];
    }
    if (breath > 0) {   // aspiration: band-passed noise, then low-passed so it rolls off above about 2.6 kHz
      b = filt(filt(white(n, r), sr, 'bp', o.breathFc || 1500, 0.7), sr, 'lp', 2600, 0.7);
      for (i = 0; i < n; i++) out[i] += breath * 1.5 * b[i];
    }
    return out;
  }
  // Voice presets (speech, grunts, zombies). f0 is the base pitch; recipes scale it.
  var WHO = {
    arda: { f0: 165, F: [700, 1250, 2550], Q: [5, 6, 7], breath: 0.05, shim: 0.05 },
    anne: { f0: 230, F: [520, 1500, 2700], Q: [5, 6, 7], breath: 0.06 },
    usta: { f0: 112, F: [600, 950, 2400], Q: [4, 5, 6], growl: 22, depth: 0.5, drive: 2.2, breath: 0.1 },
    friend: { f0: 205, F: [800, 1800, 2900], Q: [6, 7, 8] },
    other: { f0: 180, F: [560, 1150, 2400], Q: [5, 6, 7], breath: 0.06 }
  };
  function preset(name) { return WHO[name] || WHO.other; }
  // voice() options from a preset. k scales the base f0; `over` overrides keys (give absolute Hz there).
  function who(name, k, over) {
    var w = preset(name), o = { f0: w.f0 * k, F: w.F, Q: w.Q, A: [1, 0.55, 0.25], growl: w.growl || 0, depth: w.depth || 0,
      jit: 0.6, shim: w.shim || 0.05, vib: 5.5, vibD: 0.008, breath: w.breath === undefined ? 0.04 : w.breath, drive: w.drive || 0 }, key;
    if (over) for (key in over) if (Object.prototype.hasOwnProperty.call(over, key)) o[key] = over[key];
    return o;
  }
  // Darbuka: doum = low membrane with a pitch drop, tek = sharp rim. Full-length hits.
  function doum(sr, r, k) {
    var n = len(0.42, sr), y = thump(n, sr, 150 * k, 55 * k, 0.05, 0.16);
    var th = filt(mul(white(n, r), env(n, sr, 0, 0.008)), sr, 'lp', 900, 0.7);
    return mix(sr, 0.42, [[0, y, 0.9], [0, th, 0.45]]);
  }
  function tek(sr, r, k) {
    var n = len(0.15, sr), y = thump(n, sr, 1050 * k, 700 * k, 0.012, 0.035);
    var s = filt(mul(white(n, r), env(n, sr, 0, 0.012)), sr, 'bp', 3200 * k, 1.2);
    return mix(sr, 0.15, [[0, y, 0.7], [0, s, 0.6]]);
  }
  // Seagull call: FM "kee-ah" with two humps and a nasal lift. k = pitch scale.
  function gull(sr, r, k) {
    var kk = k || 1, n = len(0.55, sr), s, e, lift;
    var p = pw([[0, 1250 * kk], [0.12, 1950 * kk], [0.2, 1650 * kk], [0.42, 1250 * kk], [0.55, 1100 * kk]]);
    s = fm(n, sr, p, 38, function (t) { return 1.6 + 1.2 * Math.exp(-Math.pow((t - 0.12) / 0.07, 2)); });
    e = gen(n, sr, function (t) { return Math.exp(-Math.pow((t - 0.11) / 0.07, 2)) + 0.9 * Math.exp(-Math.pow((t - 0.36) / 0.1, 2)); });
    lift = filt(s, sr, 'bp', 2300 * kk, 1.1);
    mul(s, e); mul(lift, e);
    return fade(mix(sr, 0.55, [[0, s, 0.6], [0, lift, 0.8]]), sr, 6, 60);
  }
  // Dog bark: short formant burst with a fast decay. k = pitch scale.
  function bark(sr, r, k) {
    var kk = k || 1, n = len(0.3, sr);
    var v = voice(n, sr, { f0: pw([[0, 520 * kk], [0.05, 470 * kk], [0.3, 330 * kk]]), F: [900, 1700, 2600], Q: [4, 5, 6],
      A: [1, 0.6, 0.3], depth: 0, jit: 0.5, vib: 0, vibD: 0, breath: 0.12 }, r);
    return fade(mul(v, env(n, sr, 0.004, 0.07)), sr, 1, 30);
  }
  // Single metal tick (hallway / bazaar clink). k = pitch scale.
  function clink(sr, r, k) {
    return modal(len(0.3, sr), sr, 1900 * (k || 1), [[1, 1, 0.05], [2.76, 0.4, 0.03]], r, 0.01);
  }
  // Wet blops: short falling sines at random times in [0, sec].
  function bubbles(sr, r, sec, count, f0) {
    var parts = [], i;
    for (i = 0; i < count; i++) {
      parts.push([r() * sec * 0.85, thump(len(0.05, sr), sr, f0 * (0.8 + r() * 0.4) * 1.6, f0 * 0.9, 0.012, 0.02), 0.5 + r() * 0.5]);
    }
    return mix(sr, sec, parts);
  }
  // Synthetic room impulse for the reverb send: darkening decaying noise. Convolver normalises the level.
  function ir(sr, sec, tau, r) {
    var n = len(sec, sr), y = new Float32Array(n), lp = 0, i, t;
    for (i = 0; i < n; i++) {
      t = i / sr;
      lp += ((r() * 2 - 1) * Math.exp(-t / tau) - lp) * (0.08 + 0.6 * Math.exp(-t / 0.25));
      y[i] = lp;
    }
    return y;
  }
  // ---- Ambience beds. Each builder renders L+F samples (L = loop length, F = crossfade tail).
  // Tonal LFOs are periodic in L so the loop is seamless; events stay inside [F, L-F].
  function addSlot(y, L, F, r, x, g) {
    return addAt(y, F + Math.floor(r() * Math.max(1, L - 2 * F - x.length)), x, g);
  }
  function bedStreet(L, F, sr, r) {
    var N = L + F, x = filt(pink(N, r), sr, 'lp', 1300, 0.7), tr = filt(pink(N, r), sr, 'lp', 260, 0.6), y = new Float32Array(N), i, j;
    for (i = 0; i < N; i++) y[i] = x[i] * (0.55 + 0.2 * Math.sin(TAU * 3 * i / L) + 0.2 * Math.sin(TAU * 7 * i / L + 1.3)) + 0.25 * tr[i];
    for (j = 0; j < 2; j++) addSlot(y, L, F, r, gull(sr, r, 0.9 + r() * 0.2), 0.2);
    for (j = 0; j < 2; j++) addSlot(y, L, F, r, bark(sr, r, 0.9 + r() * 0.2), 0.16);
    return y;
  }
  function bedWater(L, F, sr, r) {
    var N = L + F, x = filt(pink(N, r), sr, 'lp', 900, 0.6), rip = filt(white(N, r), sr, 'bp', 4500, 0.7), y = new Float32Array(N), i, j;
    for (i = 0; i < N; i++) y[i] = x[i] * (0.45 + 0.35 * Math.sin(TAU * 2 * i / L) + 0.2 * Math.sin(TAU * 3 * i / L + 0.6)) + 0.05 * rip[i];
    for (j = 0; j < 3; j++) addSlot(y, L, F, r, gull(sr, r, 1.05 + r() * 0.15), 0.22);
    return y;
  }
  function bedBazaar(L, F, sr, r) {
    var N = L + F, x = filt(pink(N, r), sr, 'bp', 900, 0.5), y = new Float32Array(N), i, j;
    for (i = 0; i < N; i++) y[i] = x[i] * (0.6 + 0.25 * Math.sin(TAU * 4 * i / L) + 0.15 * Math.sin(TAU * 9 * i / L));
    for (j = 0; j < 4; j++) addSlot(y, L, F, r, clink(sr, r, 0.9 + r() * 0.25), 0.3);
    return echo(y, sr, 0.23, 0.38);
  }
  function bedWind(L, F, sr, r) {
    var N = L + F, T = L / sr, g = filt(pink(N, r), sr, 'lp', 420, 0.6), y = new Float32Array(N), i, q = Math.round(92 * T) / T;
    var whistle = filt(white(N, r), sr, 'bp', function (t) { return 900 + 250 * Math.sin(TAU * t / T); }, 9);
    var hum = osc(N, sr, 'sine', q);
    for (i = 0; i < N; i++) {
      y[i] = g[i] * (0.6 + 0.4 * Math.sin(TAU * i / L)) + 0.08 * whistle[i] * (0.5 + 0.5 * Math.sin(TAU * 2 * i / L)) + 0.02 * hum[i];
    }
    addSlot(y, L, F, r, gull(sr, r, 1.1), 0.12);
    return y;
  }
  function bedNight(L, F, sr, r) {
    var N = L + F, T = L / sr, y = new Float32Array(N), i, j, cl = len(1.4, sr);
    var h1 = Math.round(50 * T) / T, h2 = Math.round(100 * T) / T, tv = filt(pink(N, r), sr, 'bp', 1100, 0.9);
    var o1 = osc(N, sr, 'sine', h1), o2 = osc(N, sr, 'sine', h2);
    for (i = 0; i < N; i++) y[i] = 0.05 * o1[i] + 0.02 * o2[i] + 0.04 * tv[i] * (0.5 + 0.5 * Math.sin(TAU * 2 * i / L));
    for (j = 0; j < 2; j++) addSlot(y, L, F, r, bark(sr, r, 0.7 + r() * 0.1), 0.08);
    addSlot(y, L, F, r, mul(filt(white(cl, r), sr, 'bp', function (t) { return 1400 - 1100 * (t / 1.4); }, 1.5), adsr(cl, sr, 0.5, 0.2, 0.8, 0.5)), 0.14);
    return y;
  }
  var BEDS = { street: bedStreet, waterfront: bedWater, bazaar: bedBazaar, wind: bedWind, night: bedNight };
  // Seamless loop: the F-sample tail is crossfaded into the head, so y[0] continues from y[L-1].
  function bedLoop(sec, sr, r, build) {
    var F = len(0.5, sr), L = len(sec, sr), x = build(L, F, sr, r), y = new Float32Array(L), i;
    for (i = 0; i < L; i++) y[i] = i < F ? x[i] * (i / F) + x[L + i] * (1 - i / F) : x[i];
    return norm(y, -26, -4);
  }
  // Ambience bed for a group ('street' | 'waterfront' | 'bazaar' | 'wind' | 'night'); null if unknown.
  function bed(group, sec, sr, r) {
    return Object.prototype.hasOwnProperty.call(BEDS, group) ? bedLoop(sec, sr, r, BEDS[group]) : null;
  }
  return {
    len: len, buf: buf, seed: seed, rng: rng, gen: gen, white: white, pink: pink, brown: brown, filt: filt, lp1: lp1,
    osc: osc, bsaw: bsaw, bsawArr: bsawArr, fm: fm, env: env, adsr: adsr, gate: gate, mul: mul, am: am, pw: pw, mix: mix, addAt: addAt,
    fade: fade, norm: norm, loud: loud, sat: sat, echo: echo, modal: modal, snap: snap, glass: glass, pluck: pluck,
    thump: thump, crackle: crackle, bell: bell, voice: voice, dcBlock: dcBlock, preset: preset, who: who, doum: doum, tek: tek,
    gull: gull, bark: bark, clink: clink, bubbles: bubbles, ir: ir, bed: bed, clamp: clamp
  };
})();

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
