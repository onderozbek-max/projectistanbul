#!/usr/bin/env node
// QA for every sound cue variant. Renders from the game's DSP code (same path as the runtime) or, with --masters,
// measures the mastered WAVs in prototype/audio/sfx/ (what render-sfx.js wrote).
// Per variant: duration, sample peak, RMS, loudest 50 ms RMS (the design level), DC offset, clipped samples (16-bit
// full scale), NaN/Inf, silence, spectral centroid, attack time (10% to peak), EBU R128 integrated loudness (ffmpeg
// ebur128, cues of 0.4 s and longer). Per cue: variants must differ (correlation below 0.98).
// FAIL (exit 1): NaN/Inf, clipped samples, silent cue (peak below -60 dBFS), duration outside limits, identical variants.
// WARN: DC offset above 0.005, peak below -40 dBFS, near-identical variants (0.98 to 0.995 is fine, above 0.995 fails).
//
//   node prototype/tools/qa-sfx.js                  QA on the DSP render (default)
//   node prototype/tools/qa-sfx.js --masters        QA on prototype/audio/sfx/*.wav
//   node prototype/tools/qa-sfx.js --only=tink      one cue
//   node prototype/tools/qa-sfx.js --quiet          summary only
//
// Writes reports/sfx-qa.json (reports/** is git-ignored). Exit code 1 on any FAIL.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const L = require('./lib-sfx.js');

const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const SR = L.SAMPLE_RATE, LONG_SEC = 0.4, DUR_MAX = 3.0;
const DUR_LIMIT = { phoneRing: 5.0, crowdScream: 2.7, bossDie: 2.3, bossIntro: 2.5, finale: 2.7, levelClear: 2.5, levelFail: 2.1, evolve: 2.5 };
const CORR_FAIL = 0.995, CORR_WARN = 0.98;

function arg(name, dflt) {
  const a = process.argv.find(s => s.startsWith('--' + name + '='));
  return a ? a.slice(name.length + 3) : dflt;
}
const has = name => process.argv.includes('--' + name);
const db = q => (q > 0 ? 20 * Math.log10(q) : -200);

// Iterative radix-2 FFT (in place on re/im arrays of length n, a power of two).
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
  }
  for (let size = 2; size <= n; size <<= 1) {
    const ang = -2 * Math.PI / size, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += size) {
      let cr = 1, ci = 0;
      for (let k = 0; k < size / 2; k++) {
        const a = i + k, b = a + size / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
      }
    }
  }
}
// Magnitude-weighted mean frequency (Hz) over Hann-windowed frames (2048, hop 1024).
function centroid(x, sr) {
  const N = 2048, H = 1024, win = new Float64Array(N);
  for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1));
  let num = 0, den = 0;
  for (let s = 0; s < Math.max(1, x.length - N + 1); s += H) {
    const re = new Float64Array(N), im = new Float64Array(N);
    for (let i = 0; i < N && s + i < x.length; i++) re[i] = x[s + i] * win[i];
    fft(re, im);
    for (let k = 1; k < N / 2; k++) { const m = Math.hypot(re[k], im[k]); num += m * k * sr / N; den += m; }
    if (x.length < N) break;
  }
  return den > 0 ? num / den : 0;
}
// Time from the first sample above 10% of the peak to the peak itself (ms).
function attackMs(x, sr) {
  let pk = 0, at = 0, i;
  for (i = 0; i < x.length; i++) if (Math.abs(x[i]) > pk) { pk = Math.abs(x[i]); at = i; }
  if (pk < 1e-9) return 0;
  let start = 0;
  for (i = 0; i <= at; i++) if (Math.abs(x[i]) >= 0.1 * pk) { start = i; break; }
  return (at - start) * 1000 / sr;
}
// Integrated loudness via ffmpeg ebur128 (LUFS) and sample peak (dBFS), for files of 0.4 s and longer.
function ebur(file) {
  const r = cp.spawnSync(FFMPEG, ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128=peak=sample', '-f', 'null', '-'], { encoding: 'utf8' });
  const t = String(r.stderr), I = [...t.matchAll(/I:\s+(-?\d+\.\d+) LUFS/g)], P = [...t.matchAll(/Peak:\s+(-?\d+\.\d+) dBFS/g)];
  return { lufs: I.length ? +I[I.length - 1][1] : null, peakDb: P.length ? +P[P.length - 1][1] : null };
}
// Normalised correlation at zero lag over the shorter length.
function corr(a, b) {
  const n = Math.min(a.length, b.length);
  let ab = 0, aa = 0, bb = 0;
  for (let i = 0; i < n; i++) { ab += a[i] * b[i]; aa += a[i] * a[i]; bb += b[i] * b[i]; }
  return aa > 0 && bb > 0 ? ab / Math.sqrt(aa * bb) : 0;
}

function measure(x, sr, file) {
  let pk = 0, s = 0, dc = 0, clip = 0, nan = 0, i, v, w = Math.max(1, Math.round(sr * 0.05)), run = 0, best = 0;
  for (i = 0; i < x.length; i++) {
    v = x[i];
    if (!Number.isFinite(v)) { nan++; continue; }
    const a = Math.abs(v);
    if (a > pk) pk = a;
    if (Math.round(Math.max(-1, Math.min(1, v)) * 32767) >= 32767 || Math.round(v * 32767) <= -32768 || a >= 0.999) clip++;
    s += v * v; dc += v;
    run += v * v; if (i >= w) run -= x[i - w] * x[i - w];
    if (i >= w - 1 && run > best) best = run;
  }
  const n = Math.max(1, x.length), sec = x.length / sr;
  const out = { sec: +sec.toFixed(4), peakDb: +db(pk).toFixed(2), rmsDb: +db(Math.sqrt(s / n)).toFixed(2), loudest50Db: +db(Math.sqrt(best / w)).toFixed(2),
    dc: +(dc / n).toFixed(5), clipped: clip, nan, centroidHz: Math.round(centroid(x, sr)), attackMs: +attackMs(x, sr).toFixed(2), lufs: null };
  if (file && sec >= LONG_SEC) out.lufs = ebur(file).lufs;
  return out;
}

function main() {
  const onlyArg = arg('only', ''), only = onlyArg ? onlyArg.split(',') : null, quiet = has('quiet'), fromMasters = has('masters');
  const { R } = L.loadSfx();
  const dir = path.join(L.ROOT, 'audio', 'sfx');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'istanbul-qa-'));
  const vs = L.variants(R).filter(v => !only || only.includes(v.name));
  const rows = [], fails = [], warns = [], byCue = {};
  for (const v of vs) {
    let x, file = null, sr = SR;
    if (fromMasters) {
      const f = path.join(dir, v.id + '.wav');
      if (!fs.existsSync(f)) { fails.push(`${v.id}: master missing (run render-sfx.js)`); continue; }
      ({ sr, x } = L.readWav(f)); file = f;
    } else {
      x = R.render(v.name, SR, v.v, v.who);
      if (!x) { fails.push(`${v.id}: render returned null`); continue; }
      file = path.join(tmp, v.id + '.wav');
      fs.writeFileSync(file, L.wavBuffer(x, SR));
    }
    const m = measure(x, sr, file);
    const row = Object.assign({ id: v.id, cue: v.name, who: v.who || null, variant: v.v }, m);
    const lim = DUR_LIMIT[v.name] || DUR_MAX;
    if (m.nan) fails.push(`${v.id}: ${m.nan} NaN/Inf samples`);
    if (m.clipped) fails.push(`${v.id}: ${m.clipped} clipped samples`);
    if (m.peakDb < -60 || m.rmsDb < -70) fails.push(`${v.id}: silent (peak ${m.peakDb} dBFS)`);
    if (m.sec < 0.02 || m.sec > lim) fails.push(`${v.id}: duration ${m.sec}s outside 0.02 to ${lim} s`);
    if (Math.abs(m.dc) > 0.005) warns.push(`${v.id}: DC offset ${m.dc}`);
    if (m.peakDb < -40 && m.peakDb >= -60) warns.push(`${v.id}: very quiet (peak ${m.peakDb} dBFS)`);
    (byCue[v.name] = byCue[v.name] || []).push({ x, id: v.id });
    rows.push(row);
    if (!quiet) console.log([v.id.padEnd(22), String(m.sec).padStart(6) + 's', 'pk ' + String(m.peakDb).padStart(7), 'rms ' + String(m.rmsDb).padStart(7),
      '50ms ' + String(m.loudest50Db).padStart(7), 'ctr ' + String(m.centroidHz).padStart(5), 'att ' + String(m.attackMs).padStart(6) + 'ms',
      m.lufs === null ? 'LUFS   n/a' : 'LUFS ' + String(m.lufs).padStart(7)].join('  '));
  }
  // Variants of one cue must differ (different seeds), and hit kinds must differ from each other.
  for (const name of Object.keys(byCue)) {
    const list = byCue[name];
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const c = corr(list[i].x, list[j].x);
      if (c > CORR_FAIL) fails.push(`${list[i].id} vs ${list[j].id}: correlation ${c.toFixed(4)} (identical)`);
      else if (c > CORR_WARN) warns.push(`${list[i].id} vs ${list[j].id}: correlation ${c.toFixed(3)} (very similar)`);
    }
  }
  const kinds = (byCue.hit || []).filter(e => e.id.endsWith('_0'));
  for (let i = 0; i < kinds.length; i++) for (let j = i + 1; j < kinds.length; j++) {
    const c = corr(kinds[i].x, kinds[j].x);
    if (c > 0.9) warns.push(`hit kinds ${kinds[i].id} and ${kinds[j].id} are alike (${c.toFixed(2)})`);
  }
  // Summary per cue
  const names = [...new Set(rows.map(r => r.cue))];
  const maxPk = Math.max(...rows.map(r => r.peakDb)), minPk = Math.min(...rows.map(r => r.peakDb));
  console.log(`\nsfx QA (${fromMasters ? 'masters' : 'DSP render'}): ${rows.length} variants, ${names.length} cues, peak range ${minPk} to ${maxPk} dBFS`);
  console.log(`fails ${fails.length}, warns ${warns.length}`);
  fails.forEach(f => console.log('FAIL ' + f));
  warns.slice(0, 40).forEach(w => console.log('warn ' + w));
  if (warns.length > 40) console.log(`warn ... ${warns.length - 40} more in reports/sfx-qa.json`);
  const reportDir = path.join(L.ROOT, '..', 'reports');
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(path.join(reportDir, 'sfx-qa.json'), JSON.stringify({ generated: new Date().toISOString(), source: fromMasters ? 'masters' : 'dsp',
    fails, warns, rows }, null, 1) + '\n');
  fs.rmSync(tmp, { recursive: true, force: true });
  process.exitCode = fails.length ? 1 : 0;
}
main();
