#!/usr/bin/env node
// render-music.js: procedural placeholder music for Project Istanbul (prototype/audio/music/<id>.mp3).
//
// Method: every sound is synthesized here from first principles: Karplus-Strong plucks (lute-like,
// two detuned strings), band-limited wavetable pads and drones, sine-sweep drums with noise slaps,
// inharmonic bells, a Schroeder reverb. No samples, no third-party audio. A seeded PRNG makes every
// run byte-identical. Each track is a stereo float buffer on an exact bar grid. Looping tracks wrap
// notes, reverb and the limiter around the loop (reverb and limiter run over two copies of the loop
// and keep the second). The rendered content does not match exactly across the loop point (not yet traced
// to a source; steps of up to 0.18 of full scale were measured), so each loop end gets a 10 ms fade-out and
// a 2 ms fade-in (loopEdges): the join becomes a short dip, not a waveform step. Then: 16-bit WAV in
// os.tmpdir()/istanbul-music, ffmpeg libmp3lame at 128 kbps, LUFS and true peak via ffmpeg ebur128,
// and a decode-back check of the seam and length.
//
// Regenerate: node prototype/tools/render-music.js        (optional: pass one id to render only that track)
// Needs ffmpeg (/opt/homebrew/bin/ffmpeg or on PATH) with libmp3lame. Node 18+, no npm packages.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SR = 44100, TAU = Math.PI * 2, TBL = 2048;
const FFMPEG = fs.existsSync('/opt/homebrew/bin/ffmpeg') ? '/opt/homebrew/bin/ffmpeg' : 'ffmpeg';
const OUT_DIR = path.join(__dirname, '..', 'audio', 'music');
const TMP_DIR = path.join(os.tmpdir(), 'istanbul-music');
const CEIL = 0.75;  // sample ceiling after the limiter (about -2.5 dBFS): keeps true peaks under -1.5 dBTP

// ---- seeded PRNG (mulberry32). Reseeded per track, so each track does not depend on render order.
let seedState = 1, hitCache = {};
function seed(n) { seedState = n >>> 0; }
function rnd() {
  seedState = (seedState + 0x6D2B79F5) >>> 0;
  let t = seedState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// ---- pitch helpers. Modes are cents above the tonic within one octave; degrees may run past 6 or below 0.
const MODES = {
  hijaz: [0, 100, 400, 500, 700, 800, 1000],   // Hicaz/Hijaz: augmented second between degrees 1 and 2
  rast: [0, 204, 351, 498, 702, 849, 996],     // Rast: neutral third
  kurdi: [0, 100, 300, 500, 700, 800, 1000],   // Kurdi / Phrygian
  major: [0, 200, 400, 500, 700, 900, 1100]
};
const mhz = (m) => 440 * Math.pow(2, (m - 69) / 12);     // MIDI note (fractional allowed) to Hz
function degHz(tonic, mode, d) {                          // scale degree of a mode to Hz
  const oct = Math.floor(d / 7), k = d - oct * 7;
  return mhz(tonic + oct * 12 + MODES[mode][k] / 100);
}

// ---- band-limited wavetables: harmonics below Nyquist for the given count, cached by (kind, count).
const tblCache = {};
function table(kind, K) {
  const key = kind + K;
  if (tblCache[key]) return tblCache[key];
  const t = new Float64Array(TBL + 1);
  for (let k = 1; k <= K; k++) {
    let a = 0;
    if (kind === 'saw') a = 1 / k;
    else if (kind === 'sine') a = k === 1 ? 1 : 0;
    else if (k % 2) a = (((k - 1) / 2) % 2 ? -1 : 1) / (k * k);   // triangle
    if (!a) continue;
    for (let i = 0; i <= TBL; i++) t[i] += a * Math.sin(TAU * k * i / TBL);
  }
  let m = 0;
  for (let i = 0; i < TBL; i++) m = Math.max(m, Math.abs(t[i]));
  for (let i = 0; i <= TBL; i++) t[i] /= m || 1;
  tblCache[key] = t;
  return t;
}
// Oscillator of n samples at f Hz. The harmonic count follows f, so high notes have no aliasing.
function osc(kind, f, n) {
  const K = Math.max(1, Math.min(160, Math.floor((SR / 2 - 300) / f)));
  const t = table(kind, K), out = new Float64Array(n), inc = f * TBL / SR;
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const i0 = Math.floor(ph), j = i0 % TBL, fr = ph - i0;
    out[i] = t[j] + (t[j + 1] - t[j]) * fr;
    ph += inc;
    if (ph >= TBL) ph -= TBL;
  }
  return out;
}
// Fade the last ms of a buffer to zero (keeps truncated notes from clicking).
function tailFade(x, ms) {
  const n = x.length, f = Math.min(n, Math.round(ms * SR / 1000));
  for (let i = 0; i < f; i++) x[n - 1 - i] *= i / f;
  return x;
}

// ---- voices. All return mono Float64Array, already scaled by amp.
// Karplus-Strong plucked string (lute-like): noise excitation, two-tap loss filter, two detuned strings.
// t60 = seconds to fall 60 dB. The loop length is corrected for the averaging filter's half-sample delay.
function pluck(f, sec, amp, t60) {
  const n = Math.floor(sec * SR), out = new Float64Array(n);
  for (const det of [-0.0012, 0.0012]) {
    const D = SR / (f * (1 + det)) - 0.5;
    const M = Math.ceil(D) + 2, buf = new Float64Array(M);
    for (let i = 0; i < M; i++) buf[i] = rnd() * 2 - 1;
    for (let i = 1; i < M; i++) buf[i] = 0.5 * (buf[i] + buf[i - 1]);   // softer pick
    const g = Math.pow(10, -3 * D / (SR * t60));
    let w = 0, vPrev = 0;
    for (let i = 0; i < n; i++) {
      let rp = w - D;
      if (rp < 0) rp += M;
      const i0 = Math.floor(rp), fr = rp - i0;
      const v = buf[i0] + (buf[(i0 + 1) % M] - buf[i0]) * fr;
      out[i] += 0.5 * v;
      buf[w] = g * 0.5 * (v + vPrev);
      vPrev = v;
      w = w + 1 === M ? 0 : w + 1;
    }
  }
  for (let i = 0; i < n; i++) out[i] *= amp;
  return tailFade(out, 30);
}
// Pad: 4 detuned triangle oscillators per chord tone, through a slow one-pole low-pass, with attack and release.
function pad(midis, sec, amp, o) {
  const n = Math.floor(sec * SR), out = new Float64Array(n), opt = o || {};
  const det = [-0.0021, -0.0007, 0.0008, 0.0022];
  const att = Math.min(sec / 2, opt.att || 0.6), rel = Math.min(sec / 2, opt.rel || 0.9);
  for (const m of midis) for (const d of det) {
    const v = osc('tri', mhz(m) * (1 + d), n);
    for (let i = 0; i < n; i++) out[i] += v[i] * 0.25;
  }
  const c0 = 1 - Math.exp(-TAU * (opt.cut || 900) / SR);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    lp += c0 * (out[i] - lp);
    const t = i / SR, e = Math.min(1, t / att) * Math.min(1, (sec - t) / rel);
    out[i] = lp * e * amp;
  }
  return out;
}
// Drum: sine with an exponential pitch drop (frame drum, daf, darbuka doum, kick) plus a high-passed noise slap.
function drum(o) {
  const n = Math.floor(o.len || o.decay * 6 * SR), out = new Float64Array(n);
  const sw = o.sweep || 0.05, f0 = o.f0, f1 = o.f1 || o.f0;
  const cn = 1 - Math.exp(-TAU * (o.nFc || 3000) / SR), nd = o.nDecay || 0.02;
  let ph = 0, lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, f = f1 + (f0 - f1) * Math.exp(-t / sw);
    ph += TAU * f / SR;
    let slap = 0;
    if (o.nAmp) {
      const r = rnd() * 2 - 1;
      lp += cn * (r - lp);
      slap = o.nAmp * Math.exp(-t / nd) * (r - lp);
    }
    out[i] = o.amp * Math.exp(-t / o.decay) * Math.sin(ph) + slap;
  }
  return tailFade(out, 10);
}
// Same drum from a per-track cache, so repeated hits reuse one noise sample.
function hit(name, o) { return hitCache[name] || (hitCache[name] = drum(o)); }
// Hi-hat: noise through a one-pole high-pass, closed or open.
function hat(open) {
  const dur = open ? 0.16 : 0.035, n = Math.floor(dur * 6 * SR), out = new Float64Array(n);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const r = rnd() * 2 - 1;
    lp += 0.5 * (r - lp);
    out[i] = (r - lp) * Math.exp(-i / SR / dur) * 0.5;
  }
  return out;
}
// Inharmonic bell (tram-bell or dissonant hint): partials at non-integer ratios with separate decays.
function bell(f, sec, amp) {
  const n = Math.floor(sec * SR), out = new Float64Array(n);
  const R = [1, 2.76, 5.4, 8.93], A = [1, 0.45, 0.22, 0.1], D = [3.2, 1.6, 0.8, 0.4];
  for (let p = 0; p < R.length; p++) {
    const w = TAU * f * R[p] / SR;
    for (let i = 0; i < n; i++) out[i] += A[p] * Math.exp(-i / SR / D[p]) * Math.sin(w * i);
  }
  for (let i = 0; i < n; i++) out[i] *= amp;
  return tailFade(out, 40);
}

// ---- bus: stereo float buffers on the bar grid. Loops wrap every write modulo the loop length.
function makeBus(spec) {
  const sec = spec.bars * 4 * 60 / spec.bpm, N = Math.round(sec * SR);
  const len = spec.loop ? N : N + Math.round((spec.tail || 0) * SR);
  return { bpm: spec.bpm, bars: spec.bars, loop: !!spec.loop, sec, N, len, L: new Float64Array(len), R: new Float64Array(len) };
}
const T = (bs, beat) => Math.round(beat * 60 / bs.bpm * SR);   // beat (quarter notes from the start) to sample
function place(bs, src, start, gain, pan) {
  const p = ((pan || 0) + 1) * Math.PI / 4, gl = gain * Math.cos(p), gr = gain * Math.sin(p);
  for (let i = 0; i < src.length; i++) {
    let k = start + i;
    if (bs.loop) k %= bs.len;
    else if (k >= bs.len) break;
    bs.L[k] += src[i] * gl;
    bs.R[k] += src[i] * gr;
  }
}
// Place a voice at a beat position.
const at = (bs, beat, src, gain, pan) => place(bs, src, T(bs, beat), gain === undefined ? 1 : gain, pan);
// Sustained drone over the whole bus. f is snapped to whole cycles so a loop joins exactly.
// kind 'saw' with a periodic low-pass sweep (lfo cycles per loop, cutoff between cutLo and cutHi Hz).
function drone(bs, f, amp, kind, lfo, cutLo, cutHi) {
  const n = bs.N, cyc = Math.max(1, Math.round(f * bs.sec)), fa = cyc / bs.sec;
  const src = osc(kind === 'saw' ? 'saw' : 'sine', fa, n);
  const out = new Float64Array(n);
  if (!cutLo) {
    for (let i = 0; i < n; i++) out[i] = src[i] * amp;
    return out;
  }
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const cut = cutLo + (cutHi - cutLo) * 0.5 * (1 + Math.sin(TAU * lfo * i / n));
    lp += (1 - Math.exp(-TAU * cut / SR)) * (src[i] - lp);
    out[i] = lp * amp;
  }
  return out;
}
// ---- space and level. Reverb and limiter are linear filters over one buffer; loops pass two copies.
// Schroeder reverb: 4 damped combs into 2 allpasses. k scales the delays (stereo spread).
function reverbLine(x, k) {
  const y = new Float64Array(x.length);
  const cb = [29.7, 37.1, 41.1, 43.7].map((ms) => ({ d: Math.round(ms * k * SR / 1000), st: 0, i: 0 }));
  const ab = [5.0, 1.7].map((ms) => ({ d: Math.round(ms * k * SR / 1000), i: 0 }));
  for (const c of cb) c.buf = new Float64Array(c.d);
  for (const a of ab) a.buf = new Float64Array(a.d);
  for (let n = 0; n < x.length; n++) {
    let s = 0;
    for (const c of cb) {
      const o = c.buf[c.i];
      c.st = o * 0.8 + c.st * 0.2;
      c.buf[c.i] = x[n] * 0.25 + c.st * 0.78;
      c.i = c.i + 1 === c.d ? 0 : c.i + 1;
      s += o;
    }
    let v = s * 0.25;
    for (const a of ab) {
      const bo = a.buf[a.i];
      a.buf[a.i] = v + bo * 0.5;
      a.i = a.i + 1 === a.d ? 0 : a.i + 1;
      v = -v + bo;
    }
    y[n] = v;
  }
  return y;
}
// Adds wet reverb to both channels. Loops: run over two copies and keep the second, so the tail wraps.
function addReverb(bs, wet, room) {
  for (const ch of ['L', 'R']) {
    const k = ch === 'L' ? room : room * 1.07, x = bs[ch], n = bs.len;
    let y;
    if (bs.loop) {
      const xx = new Float64Array(n * 2);
      xx.set(x, 0);
      xx.set(x, n);
      y = reverbLine(xx, k).subarray(n);
    } else {
      y = reverbLine(x, k);
    }
    for (let i = 0; i < n; i++) x[i] += wet * y[i];
  }
}
// Peak limiter: instant attack, 80 ms release, gain linked across channels. Loops run twice (second copy kept).
function limit(L, R, ceil, loop) {
  const n = L.length, m = loop ? 2 * n : n, oL = new Float64Array(n), oR = new Float64Array(n);
  const rel = 1 - Math.exp(-1 / (0.08 * SR));
  let g = 1;
  for (let i = 0; i < m; i++) {
    const k = i % n, a = Math.max(Math.abs(L[k]), Math.abs(R[k]));
    const need = a > ceil ? ceil / a : 1;
    if (need < g) g = need;
    else g += (need - g) * rel;
    const o = i - (loop ? n : 0);
    if (o >= 0) { oL[o] = L[k] * g; oR[o] = R[k] * g; }
  }
  return [oL, oR];
}

// ---- ffmpeg helpers
function ff(args, input) {
  const r = spawnSync(FFMPEG, ['-hide_banner', ...args], { input, maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error('ffmpeg failed: ' + args.join(' ') + '\n' + String(r.stderr));
  return r;
}
// Integrated loudness (LUFS) and true peak (dBTP) of stereo float samples, via ffmpeg ebur128.
function measure(L, R) {
  const il = new Float32Array(L.length * 2);
  for (let i = 0; i < L.length; i++) { il[2 * i] = L[i]; il[2 * i + 1] = R[i]; }
  const r = ff(['-f', 'f32le', '-ar', String(SR), '-ac', '2', '-i', 'pipe:0', '-filter_complex', 'ebur128=peak=true', '-f', 'null', '-'], Buffer.from(il.buffer));
  const txt = String(r.stderr);
  const I = /Integrated loudness:\s*\n\s*I:\s*(-?[\d.]+|-inf) LUFS/.exec(txt);
  const P = /True peak:\s*\n\s*Peak:\s*(-?[\d.]+|-inf) dBFS/.exec(txt);
  return { I: I ? parseFloat(I[1]) : NaN, tp: P ? parseFloat(P[1]) : NaN };
}
function q16(x) { const v = Math.round(x * 32767); return v > 32767 ? 32767 : (v < -32768 ? -32768 : v); }
function writeWav(file, L, R) {
  const n = L.length, b = Buffer.alloc(44 + n * 4);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 4, 4); b.write('WAVE', 8);
  b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    b.writeInt16LE(q16(L[i]), 44 + i * 4);
    b.writeInt16LE(q16(R[i]), 46 + i * 4);
  }
  fs.writeFileSync(file, b);
}
function encodeMp3(wav, out) {
  ff(['-y', '-loglevel', 'error', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '128k', '-ac', '2', '-ar', String(SR), '-map_metadata', '-1', out]);
}
// Decodes the MP3 back to float stereo: this is what the game will play (what the seam check must see).
function decode(file) {
  const r = ff(['-i', file, '-f', 'f32le', '-ac', '2', '-ar', String(SR), '-']);
  const f = new Float32Array(r.stdout.buffer.slice(r.stdout.byteOffset, r.stdout.byteOffset + r.stdout.length));
  const n = f.length >> 1, L = new Float64Array(n), R = new Float64Array(n);
  for (let i = 0; i < n; i++) { L[i] = f[2 * i]; R[i] = f[2 * i + 1]; }
  return { L, R };
}

// ---- mastering: gain is refined until the limited output measures within 0.05 LU of the target.
// Loop edges: a 10 ms cosine fade-out at the end and a 2 ms fade-in at the start. Without them the WAV steps at the
// loop point (measured: boss 0.154, title 0.103, map 0.129 of full scale, against a median sample step of about
// 0.003). With them the WAV seam step is 0.008 or less on every loop. The fades make a short dip once per loop
// instead of a click.
function loopEdges(L, R) {
  const n = L.length, fo = Math.round(0.010 * SR), fi = Math.round(0.002 * SR);
  for (let i = 0; i < fo; i++) { const w = Math.cos(0.5 * Math.PI * (i + 1) / fo); L[n - fo + i] *= w; R[n - fo + i] *= w; }
  for (let i = 0; i < fi; i++) { const w = Math.sin(0.5 * Math.PI * i / fi); L[i] *= w; R[i] *= w; }
}
function master(bs, target) {
  let gdb = 0, res = null;
  for (let it = 0; it < 6; it++) {
    const g = Math.pow(10, gdb / 20);
    const [L, R] = limit(bs.L.map((v) => v * g), bs.R.map((v) => v * g), CEIL, bs.loop);
    if (bs.loop) loopEdges(L, R);
    const m = measure(L, R);
    res = { L, R, I: m.I };
    const err = target - m.I;
    if (!isFinite(err) || Math.abs(err) < 0.05) break;
    gdb += err;
  }
  return res;
}
// ---- checks on the decoded MP3
const rmsOf = (x, a, b) => { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return Math.sqrt(s / Math.max(1, b - a)); };
const db = (v) => 20 * Math.log10(Math.max(v, 1e-9));
function seamStats(d) {
  const n = d.L.length, w = Math.round(0.025 * SR);
  const jump = Math.max(Math.abs(d.L[n - 1] - d.L[0]), Math.abs(d.R[n - 1] - d.R[0]));
  let step = 0, sq = 0;
  for (let i = 1; i < n; i++) {
    const df = d.L[i] - d.L[i - 1];
    step = Math.max(step, Math.abs(df));
    sq += df * df;
  }
  const rstep = Math.sqrt(sq / (n - 1));
  const all = rmsOf(d.L, 0, n);
  const seam = Math.sqrt((rmsOf(d.L, n - w, n) ** 2 + rmsOf(d.L, 0, w) ** 2) / 2);
  const win2 = 2 * SR;   // 2 s windows at each end: the musical level step across the loop point
  const edge = db(rmsOf(d.L, 0, win2)) - db(rmsOf(d.L, n - win2, n));
  // share of energy in 1-3 kHz (one-pole low-passes, difference): a rough check that the band stays clear
  let lo = 0, hi = 0, bp = 0;
  const a1 = 1 - Math.exp(-TAU * 1000 / SR), a3 = 1 - Math.exp(-TAU * 3000 / SR);
  for (let i = 0; i < n; i++) {
    const x = d.L[i];
    lo += a1 * (x - lo); hi += a3 * (x - hi);
    bp += (hi - lo) * (hi - lo);
  }
  const band = db(Math.sqrt(bp / n) / Math.max(all, 1e-9));
  return { jump, step, rstep, seamDb: db(seam) - db(all), edge, band };
}

// ---- tracks. Each builder fills the bus with the score. Beats are quarter notes from the start.
const cached = (name, fn) => hitCache[name] || (hitCache[name] = fn());
const DOUM = { f0: 150, f1: 70, sweep: 0.05, decay: 0.3, amp: 0.5, nAmp: 0.12, nDecay: 0.02, nFc: 1500 };
const TEK = { f0: 360, f1: 280, sweep: 0.02, decay: 0.08, amp: 0.2, nAmp: 0.35, nDecay: 0.015, nFc: 4000 };
const KICK = { f0: 120, f1: 40, sweep: 0.05, decay: 0.45, amp: 0.85 };
const RIM = { f0: 1700, f1: 1500, sweep: 0.003, decay: 0.012, amp: 0.12, nAmp: 0.2, nDecay: 0.006, nFc: 6000 };
const DAF = { f0: 105, f1: 62, sweep: 0.035, decay: 0.2, amp: 0.6, nAmp: 0.35, nDecay: 0.025, nFc: 1600 };
const bassDrum = (midi) => ({ f0: mhz(midi) * 1.01, f1: mhz(midi), sweep: 0.02, decay: 0.3, amp: 0.35 });

function buildTitle(bs) {
  const bsec = 60 / bs.bpm;
  const CH = [[62, 65, 69], [58, 62, 65], [55, 58, 62], [57, 61, 64]];        // Dm, Bb, Gm, A
  for (let c = 0; c < 9; c++) at(bs, c * 8, pad(CH[c % 4], 8 * bsec + 1, 0.10));
  const MOT = [[[0, 0], [1, 2], [2, 4], [3, 1]], [[0, 5], [1.5, 4], [2.5, 2], [3, 0]],
    [[0, 3], [1, 4], [2, 5], [3, 3]], [[0, 4], [2, 2], [3, 0]]];
  for (let b = 0; b < bs.bars; b++) {
    for (const [q, d] of MOT[b % 4]) at(bs, b * 4 + q, pluck(degHz(62, 'hijaz', d), 3.0, 0.22, 1.6), 1, b % 2 ? 0.3 : -0.3);
  }
  for (let b = 4; b < bs.bars; b++) {          // muted heartbeat after the intro
    for (const q of [0, 2]) at(bs, b * 4 + q, hit('heart', { f0: 110, f1: 70, sweep: 0.04, decay: 0.12, amp: 0.22, nAmp: 0.05, nDecay: 0.01, nFc: 900 }));
  }
  at(bs, 7 * 4 + 2, bell(mhz(74), 3.5, 0.10), 1, 0.4);
  at(bs, 15 * 4, bell(mhz(74), 3.5, 0.10), 1, -0.4);
  place(bs, drone(bs, mhz(38), 0.14, 'sine'), 0, 1, 0);
}

function buildMap(bs) {
  const bsec = 60 / bs.bpm;
  const CH = [[62, 65, 69], [60, 64, 67], [58, 62, 65], [57, 61, 64]];         // Dm, C, Bb, A
  const ROOT = [38, 36, 34, 33];
  for (let c = 0; c < 12; c++) at(bs, c * 8, pad(CH[c % 4], 8 * bsec + 1, 0.085));
  const MOT = [[[0, 0], [1, 2], [2, 4], [3, 2]], [[0, 3], [1.5, 2], [2.5, 1], [3.5, 0]],
    [[0, 4], [1, 5], [2, 4], [3, 2]], [[0, 1], [2, 0], [3, -1]]];
  for (let b = 0; b < bs.bars; b++) {
    for (const [q, d] of MOT[b % 4]) at(bs, b * 4 + q, pluck(degHz(62, 'rast', d), 2.5, 0.2, 1.8), 1, b % 2 ? 0.25 : -0.25);
    const rt = ROOT[Math.floor(b / 2) % 4];
    for (const q of [0, 2]) at(bs, b * 4 + q, hit('bass' + rt, bassDrum(rt)));
    for (const e of [0, 2, 4, 7]) at(bs, b * 4 + e * 0.5, hit('doum', DOUM), 0.9);     // 2-2-3 accent
    for (const e of [1, 3, 5, 6]) at(bs, b * 4 + e * 0.5, hit('tek', TEK), 0.8);
    for (let e = 0; e < 8; e++) at(bs, b * 4 + e * 0.5, cached('hatc', () => hat(false)), 0.5, e % 2 ? 0.4 : -0.4);
  }
  place(bs, drone(bs, mhz(38), 0.05, 'sine'), 0, 1, 0);
}

// Run pair: intense = calm plus extra layers. Shared parts are built first, so both use the same seeded noise.
function buildRun(bs, intense) {
  const bsec = 60 / bs.bpm;
  const CH = [[57, 60, 64], [50, 53, 57], [57, 60, 64], [52, 56, 59]];         // Am, Dm, Am, E (2 bars each)
  const ROOT = [45, 38, 45, 40];
  const OST = [0, 0, 12, 0, 7, 0, 12, 5];                                       // bass ostinato, eighths
  const LEAD = [[0, 0], [1, 2], [2, 4], [3, 2], [4, 1], [5, 3], [6, 2], [7, 0]];  // 2-bar phrase, A Hicaz
  for (let blk = 0; blk < 16; blk++) at(bs, blk * 8, pad(CH[blk % 4], 8 * bsec + 1, 0.085, { cut: 800 }));
  for (let b = 0; b < 32; b++) {
    const c = Math.floor(b / 2) % 4, rt = ROOT[c];
    for (let e = 0; e < 8; e++) at(bs, b * 4 + e * 0.5, hit('b' + (rt + OST[e]), bassDrum(rt + OST[e])), 0.9);
    for (const q of [0, 2]) at(bs, b * 4 + q, hit('doum', DOUM), 0.7);
    for (const q of [0.5, 1.5, 2.5, 3.5]) at(bs, b * 4 + q, hit('tek', TEK), 0.5);
    for (let q = 0; q < 4; q++) at(bs, b * 4 + q + 0.5, pluck(mhz(CH[c][q % 3] + 12), 0.9, 0.09, 0.45), 1, q % 2 ? 0.35 : -0.35);
    if (b % 4 === 0) {
      for (const [p, d] of LEAD) {
        at(bs, b * 4 + p, pluck(degHz(69, 'hijaz', d), 1.8, 0.16, 1.5), 1, -0.2);
        if (intense) at(bs, b * 4 + p, pluck(degHz(81, 'hijaz', d), 1.8, 0.07, 1.2), 1, 0.2);
      }
    }
  }
  if (!intense) return;
  // intense extras: 16th hats, open hats, trap kicks, rim clicks, eighth-note string ostinato, a riser into bar 28
  for (let b = 0; b < 32; b++) {
    const c = Math.floor(b / 2) % 4;
    for (let s = 0; s < 16; s++) at(bs, b * 4 + s * 0.25, cached('hatc', () => hat(false)), 0.5, s % 2 ? 0.3 : -0.3);
    if (b % 2 === 1) at(bs, b * 4 + 3.5, cached('hato', () => hat(true)), 0.4, 0.2);
    if (b % 4 === 3) for (let k = 0; k < 8; k++) at(bs, b * 4 + 3 + k / 8, cached('hatc', () => hat(false)), 0.35);
    for (const q of [0, 2, 2.75]) at(bs, b * 4 + q, hit('kick', KICK), 0.9);
    for (const q of [1, 3]) at(bs, b * 4 + q, hit('rim', RIM), 0.6);
    for (let e = 0; e < 8; e++) at(bs, b * 4 + e * 0.5, pluck(mhz(CH[c][e % 3] + 12), 0.4, 0.05, 0.2), 1, e % 2 ? 0.3 : -0.3);
  }
  const rn = Math.round(16 * bsec * SR), rs = new Float64Array(rn);
  let lp = 0;
  for (let i = 0; i < rn; i++) {
    const u = i / rn;
    lp += (1 - Math.exp(-TAU * (300 + 6000 * u * u) / SR)) * (rnd() * 2 - 1 - lp);
    rs[i] = lp * 0.12 * u;
  }
  at(bs, 28 * 4, rs);
}

function buildBoss(bs) {
  const bsec = 60 / bs.bpm;
  place(bs, drone(bs, mhz(42), 0.10, 'saw', 6, 180, 1100), 0, 1, 0);      // F#2 saw, slow filter sweep
  place(bs, drone(bs, mhz(30), 0.16, 'sine'), 0, 1, 0);                    // F#1 sub
  for (let b = 0; b < bs.bars; b++) {
    const sec = Math.floor(b / 12), div = [1, 2, 4, 4][sec];               // daf pulse builds: quarters, eighths, 16ths
    for (let s = 0; s < 4 * div; s++) {
      if (sec === 0 && s % 2) continue;
      at(bs, b * 4 + s / div, hit('daf', DAF), s % div === 0 ? 1 : 0.6);
    }
    if (sec >= 2) for (const q of [0, 2]) at(bs, b * 4 + q, hit('kick', KICK), 0.8);
    if (sec === 3) at(bs, b * 4 + 1.5, hit('kick', KICK), 0.6);
    if (b % 8 < 4) {                                                       // Kurdi phrase (F#3 Phrygian)
      const P = [[[0, 0], [1.5, 1], [2, 0], [3, -2]], [[0, -1], [1, -2], [2.5, 0], [3.5, 1]],
        [[0, 2], [1, 1], [2, 0], [3, -1]], [[0, -2], [2, -3], [3, -2]]];
      for (const [q, d] of P[b % 4]) at(bs, b * 4 + q, pluck(degHz(54, 'kurdi', d), 1.6, 0.18, 1.3), 1, b % 2 ? 0.3 : -0.3);
    }
    if (b >= 24) {                                                         // kanun tremolo with a minor-second tension
      for (let s = 0; s < 16; s++) at(bs, b * 4 + s / 4, pluck(mhz([54, 57, 61, 55][s % 4]), 0.5, 0.05, 0.6), 1, s % 2 ? 0.4 : -0.4);
    }
    if (b >= 24 && b % 4 === 0) at(bs, b * 4, pad([54, 55, 61], 16 * bsec + 1, 0.05, { cut: 1400, att: 2, rel: 2 }));
  }
  for (const b of [8, 20, 30, 42]) at(bs, b * 4 + 3, bell(mhz(67), 3.0, 0.10), 1, b % 2 ? -0.3 : 0.3);
}

function buildComic(bs) {
  const bsec = 60 / bs.bpm;
  const CH = [[52, 55, 59], [48, 52, 55], [55, 59, 62], [50, 54, 57]];        // Em, C, G, D
  for (let blk = 0; blk < 15; blk++) at(bs, blk * 8, pad(CH[blk % 4], 8 * bsec + 1.5, 0.07, { cut: 700, att: 1.2, rel: 1.4 }));
  const PH = [[0, 0], [1.5, 2], [3, 1], [4.5, 0]];                             // sparse ney-like phrase, E Hijaz
  for (let b = 0; b < bs.bars; b++) {
    if (b % 4 === 0) for (const [p, d] of PH) at(bs, b * 4 + p, pluck(degHz(64, 'hijaz', d), 2.4, 0.14, 2.0), 1, -0.25);
    if (b % 4 === 2) for (const [p, d] of PH) at(bs, b * 4 + p, pluck(degHz(64, 'hijaz', d + 2), 2.4, 0.12, 2.0), 1, 0.25);
    if (b % 2 === 1) {
      const c = Math.floor(b / 2) % 4;
      at(bs, b * 4 + 0.5, pluck(mhz(CH[c][1] + 12), 1.0, 0.05, 0.6), 1, -0.3);
      at(bs, b * 4 + 2.5, pluck(mhz(CH[c][2] + 12), 1.0, 0.05, 0.6), 1, 0.3);
    }
    if (b % 8 === 0) at(bs, b * 4, hit('tap', { f0: 110, f1: 70, sweep: 0.04, decay: 0.12, amp: 0.12 }));
  }
}

function buildVictory(bs) {
  for (let k = 0; k < 32; k++) at(bs, k * 0.25, hit('tek', TEK), 0.25 + 0.6 * k / 31);   // darbuka roll, bars 0-1
  for (let b = 0; b < 12; b++) if (b >= 2) at(bs, b * 4, hit('doum', DOUM), 0.8);
  const STRUM = { 2: [50, 54, 57, 62], 4: [55, 59, 62, 67], 6: [57, 61, 64, 69], 8: [50, 54, 57, 62], 10: [50, 54, 57, 62] };
  for (const b of [2, 4, 6, 8, 10]) {
    STRUM[b].forEach((m, j) => at(bs, b * 4 + j * 0.06, pluck(mhz(m + 12), 1.6, 0.10, 1.2), 1, (j - 1.5) / 2));
  }
  const MEL = [[0, 2, 4, 2], [5, 4, 2, 0], [3, 4, 6, 4], [5, 3, 1, 0], [0, 2, 4, 2], [5, 4, 2, 0], [1, 2, 4, 6], [7, 6, 4, 2]];
  for (let i = 0; i < 8; i++) MEL[i].forEach((d, q) => at(bs, (i + 2) * 4 + q, pluck(degHz(62, 'rast', d), 1.3, 0.2, 1.2), 1, 0.15));
  at(bs, 2 * 4, bell(mhz(74), 4, 0.14), 1, 0.4);
  at(bs, 6 * 4, bell(mhz(74), 4, 0.14), 1, -0.4);
  at(bs, 10 * 4, bell(mhz(74), 4.5, 0.14));
  at(bs, 10 * 4, pad([50, 54, 57, 62], 5.5, 0.11, { att: 0.05, rel: 2.5, cut: 1500 }));
  at(bs, 10 * 4, pluck(degHz(62, 'rast', 0), 5, 0.12, 3.0), 1, 0);
}

function buildDefeat(bs) {
  const FALL = [[[0, 4], [1, 3], [2, 2], [3, 1]], [[0, 0], [2, -1], [3, -2]]];   // falling ney phrase, D Kurdi
  for (let b = 0; b < 2; b++) for (const [q, d] of FALL[b]) at(bs, b * 4 + q, pluck(degHz(62, 'kurdi', d), 2.6, 0.2, 2.2), 1, -0.2);
  const ARP = [74, 72, 69, 65, 62, 57, 53, 50];                                   // descending kanun arpeggio, D minor
  for (let b = 3; b < 5; b++) for (let e = 0; e < 8; e++) at(bs, b * 4 + e * 0.5, pluck(mhz(ARP[e]), 1.4, 0.09, 1.0), 1, 0.2);
  const dr = drone(bs, mhz(38), 0.16, 'sine');
  for (let i = 0; i < bs.N; i++) dr[i] *= Math.min(1, Math.max(0, (24 - i / SR) / 6));   // fades to zero at 24 s
  place(bs, dr, 0, 1, 0);
  at(bs, 5 * 4, pad([50, 53, 57, 62], 9.5, 0.12, { att: 1.0, rel: 3.5, cut: 800 }));
}

const TRACKS = [
  { id: 'title', bpm: 72, bars: 18, loop: true, wet: 0.30, room: 1.0, target: -16, seed: 101, build: buildTitle },
  { id: 'map', bpm: 96, bars: 24, loop: true, wet: 0.25, room: 1.0, target: -16, seed: 102, build: buildMap },
  { id: 'run_calm', bpm: 112, bars: 32, loop: true, wet: 0.14, room: 0.9, target: -16, seed: 103, build: (bs) => buildRun(bs, false) },
  { id: 'run_intense', bpm: 112, bars: 32, loop: true, wet: 0.14, room: 0.9, target: -16, seed: 103, build: (bs) => buildRun(bs, true) },
  { id: 'boss', bpm: 128, bars: 48, loop: true, wet: 0.30, room: 1.1, target: -16, seed: 104, build: buildBoss },
  { id: 'comic', bpm: 80, bars: 30, loop: true, wet: 0.35, room: 1.0, target: -18, seed: 105, build: buildComic },
  { id: 'victory', bpm: 120, bars: 12, loop: false, tail: 3, wet: 0.30, room: 1.0, target: -15, seed: 106, build: buildVictory },
  { id: 'defeat', bpm: 80, bars: 8, loop: false, tail: 3, wet: 0.40, room: 1.1, target: -15, seed: 107, build: buildDefeat }
];

// ---- render one track: score -> reverb -> loudness and limiter -> WAV -> MP3 -> decode and check
function renderTrack(spec) {
  seed(spec.seed);
  hitCache = {};
  const bs = makeBus(spec);
  spec.build(bs);
  addReverb(bs, spec.wet, spec.room);
  if (!bs.loop) {
    bs.L = bs.L.slice(0, bs.N); bs.R = bs.R.slice(0, bs.N); bs.len = bs.N;
    tailFade(bs.L, 1500); tailFade(bs.R, 1500);
  }
  const wav = path.join(TMP_DIR, spec.id + '.wav'), mp3 = path.join(OUT_DIR, spec.id + '.mp3');
  let tgt = spec.target, d, fin;
  for (let pass = 0; pass < 3; pass++) {       // trim so the decoded MP3 (not the WAV) lands on the target
    const m = master(bs, tgt);
    writeWav(wav, m.L, m.R);
    encodeMp3(wav, mp3);
    d = decode(mp3);
    fin = measure(d.L, d.R);
    if (Math.abs(fin.I - spec.target) < 0.1) break;
    tgt += spec.target - fin.I;
  }
  const s = seamStats(d);
  let pk = 0;
  for (let i = 0; i < d.L.length; i++) pk = Math.max(pk, Math.abs(d.L[i]), Math.abs(d.R[i]));
  const expect = bs.N, got = d.L.length, kb = Math.round(fs.statSync(mp3).size / 1024);
  const head = `${spec.id.padEnd(12)} ${(got / SR).toFixed(3)} s (${got - expect >= 0 ? '+' : ''}${got - expect} samples)  ` +
    `${fin.I.toFixed(2)} LUFS  TP ${fin.tp.toFixed(2)} dBTP  peak ${db(pk).toFixed(2)} dBFS  1-3k ${s.band.toFixed(1)} dB  ${kb} KB`;
  const seam = spec.loop
    ? `             seam: join jump ${s.jump.toFixed(4)} = ${(s.jump / s.rstep).toFixed(1)}x the rms sample step (max step ${s.step.toFixed(3)}), seam RMS vs track ${s.seamDb.toFixed(2)} dB, edge 2 s-RMS diff ${s.edge.toFixed(2)} dB`
    : `             one-shot: no loop seam (ends with 1.5 s fade)`;
  return head + '\n' + seam;
}

function main() {
  fs.mkdirSync(TMP_DIR, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const only = process.argv[2], t0 = Date.now();
  for (const spec of TRACKS) {
    if (only && spec.id !== only) continue;
    console.log(renderTrack(spec));
  }
  console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)} s; wrote ${OUT_DIR}`);
}

main();
