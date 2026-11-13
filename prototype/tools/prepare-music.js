#!/usr/bin/env node
// Turns the owner's Suno exports into the eight files js/view/music.js plays.
//   in:  prototype/audio/music-suno/<id>.wav|flac|m4a|mp3   (one file per slot; subfolders are ignored)
//   out: prototype/audio/music/<id>.mp3                      (192 kbps CBR, 44.1 kHz, stereo)
//
// Loops (title, map, run_calm, run_intense, boss, comic) come out at an exact length. The source must hold
// that length plus XFADE seconds; the extra tail is blended into the head with an equal-power crossfade, so the
// wrap is continuous and the game can loop the file with no seam. Stingers (victory, defeat) are cut to length
// with a STINGER_FADE fade-out and are not looped. Every output is loudness-normalised to LUFS (ffmpeg loudnorm,
// two passes, true peak TRUE_PEAK). Node 18+, ffmpeg and ffprobe on PATH, no npm packages.
//
//   node prototype/tools/prepare-music.js [--src=DIR] [--dst=DIR] [--backup=DIR] [--only=id,id] [--dry-run]
//
// Placeholders: an MP3 in --dst that lacks this tool's comment tag is a render-music.js placeholder. The first run
// that writes anything copies those into --backup (default: music-procedural/ next to --dst). A backup is never
// overwritten. Partial uploads are fine: a slot without a source keeps whatever is already in --dst.
// Exit code: 0 when every present source was processed; 1 when a source was rejected or failed.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SR = 44100;
const XFADE = 1.5;           // loop crossfade, seconds (equal power)
const STINGER_FADE = 0.3;    // stinger fade-out, seconds
const LUFS = -16;            // integrated loudness target (EBU R128)
const TRUE_PEAK = -1.5;      // dBTP ceiling, leaves room for MP3 overs (the README asks for -1 dBTP or lower)
const BITRATE = '192k';
const TAG = 'istanbul prepare-music';
const EXTS = ['.wav', '.flac', '.m4a', '.mp3'];                // preference order when two files share a slot
const DEFAULT_SRC = path.join(__dirname, '..', 'audio', 'music-suno');
const DEFAULT_DST = path.join(__dirname, '..', 'audio', 'music');

// The slot list (the manifest). sec = bars * 4 * 60 / bpm, so every length is a whole number of bars.
// Both run layers must keep the same length and grid, which they do: both are exactly 180 s.
const SLOTS = [
  { id: 'title', kind: 'loop', bpm: 72, bars: 45 },
  { id: 'map', kind: 'loop', bpm: 96, bars: 60 },
  { id: 'run_calm', kind: 'loop', bpm: 112, bars: 84 },
  { id: 'run_intense', kind: 'loop', bpm: 112, bars: 84 },
  { id: 'boss', kind: 'loop', bpm: 128, bars: 96 },
  { id: 'comic', kind: 'loop', bpm: 80, bars: 40 },
  { id: 'victory', kind: 'stinger', bpm: 120, bars: 10 },
  { id: 'defeat', kind: 'stinger', bpm: 72, bars: 6 }
].map(s => Object.assign(s, { sec: s.bars * 4 * 60 / s.bpm }));

const fmt = s => { const m = Math.floor(s / 60); return m + ':' + (s - m * 60).toFixed(1).padStart(4, '0'); };
const rel = p => { const r = path.relative(process.cwd(), p); return r && !r.startsWith('..') ? r : p; };
const pad = (s, n) => String(s).padEnd(n);

// ---- ffmpeg helpers (argument arrays, no shell)

function ffprobe(file) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries',
    'format=duration:format_tags=comment:stream=codec_type,codec_name,sample_rate,channels',
    '-of', 'json', file], { encoding: 'utf8' });
  if (r.error || r.status !== 0) throw new Error('ffprobe cannot read it' + (r.stderr ? ': ' + r.stderr.trim().split('\n').pop() : ''));
  const j = JSON.parse(r.stdout || '{}'), fmtInfo = j.format || {};
  const a = (j.streams || []).find(s => s.codec_type === 'audio');
  if (!a) throw new Error('no audio stream');
  const duration = parseFloat(fmtInfo.duration);
  if (!(duration > 0)) throw new Error('unknown duration');
  return { duration, codec: a.codec_name, rate: Number(a.sample_rate), channels: a.channels, comment: (fmtInfo.tags || {}).comment || '' };
}

const isTool = file => { try { return ffprobe(file).comment.indexOf(TAG) === 0; } catch (e) { return false; } };

// Decodes up to `seconds` of audio to 44.1 kHz stereo float. Returns fewer frames if the file is shorter.
function decode(file, seconds) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-vn', '-map', '0:a:0', '-t', String(seconds),
    '-ac', '2', '-ar', String(SR), '-f', 'f32le', '-c:a', 'pcm_f32le', 'pipe:1'], { maxBuffer: 1 << 30 });
  if (r.error || r.status !== 0) throw new Error('decode failed');
  const b = r.stdout, f = new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length - (b.length % 8)));
  const frames = f.length >> 1, L = new Float32Array(frames), R = new Float32Array(frames);
  for (let i = 0; i < frames; i++) { L[i] = f[2 * i]; R[i] = f[2 * i + 1]; }
  return { L, R, frames };
}

// EBU R128 integrated loudness and true peak (ffmpeg ebur128). args = input options plus -i.
function loudness(args) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...args, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
    { encoding: 'utf8', maxBuffer: 1 << 26 });
  const s = r.stderr || '';
  const i = /Integrated loudness:\s*\n\s*I:\s+(-?[\d.]+|-inf) LUFS/.exec(s);
  const p = /True peak:\s*\n\s*Peak:\s+(-?[\d.]+) dBFS/.exec(s);
  if (!i || !p) throw new Error('loudness measurement failed');
  return { I: parseFloat(i[1]), TP: parseFloat(p[1]) };
}

function writeRaw(file, L, R) {
  const f = new Float32Array(L.length * 2);
  for (let i = 0; i < L.length; i++) { f[2 * i] = L[i]; f[2 * i + 1] = R[i]; }
  fs.writeFileSync(file, Buffer.from(f.buffer));
}
const RAW_IN = ['-f', 'f32le', '-ar', String(SR), '-ac', '2'];

// Pass 1 of loudnorm: measure the shaped audio.
function loudnormMeasure(raw) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...RAW_IN, '-i', raw,
    '-af', `loudnorm=I=${LUFS}:TP=${TRUE_PEAK}:LRA=11:print_format=json`, '-f', 'null', '-'], { encoding: 'utf8' });
  const m = /\{[^{}]*"input_i"[^{}]*\}/.exec(r.stderr || '');
  if (!m) throw new Error('loudnorm measurement failed');
  return JSON.parse(m[0]);
}

// Pass 2: apply the measured gain linearly (no dynamic gain riding) and encode MP3.
function encode(raw, meas, mp3, comment) {
  const af = `loudnorm=I=${LUFS}:TP=${TRUE_PEAK}:LRA=11:measured_I=${meas.input_i}:measured_TP=${meas.input_tp}` +
    `:measured_LRA=${meas.input_lra}:measured_thresh=${meas.input_thresh}:offset=${meas.target_offset}:linear=true`;
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...RAW_IN, '-i', raw, '-af', af, '-map_metadata', '-1',
    '-metadata', 'comment=' + comment, '-c:a', 'libmp3lame', '-b:a', BITRATE, '-id3v2_version', '3', '-f', 'mp3', mp3],
    { encoding: 'utf8' });
  if (r.error || r.status !== 0) throw new Error('encode failed' + (r.stderr ? ': ' + r.stderr.trim().split('\n').pop() : ''));
}

// ---- shaping

// Loop: the file keeps n samples. Samples [0, x) become a crossfade from the tail (src[n + i], the musical
// continuation of the loop end) into the head (src[i]). The weights are equal power (sin, cos). A tail that repeats
// the head is correlated with it, and equal power would then swell by up to 3 dB, so the blend is divided by
// sqrt(1 + rho * sin 2a), where rho is the head-tail correlation (0 to 1). rho 0 gives plain equal power; rho 1
// gives equal gain. The last sample (src[n-1]) is followed by out[0] = src[n], so the wrap is the source's own step.
function shapeLoop(src, n, x) {
  const L = new Float32Array(src.L.subarray(0, n)), R = new Float32Array(src.R.subarray(0, n));
  let hh = 0, tt = 0, ht = 0;
  for (let i = 0; i < x; i++) {
    const h = (src.L[i] + src.R[i]) / 2, t = (src.L[n + i] + src.R[n + i]) / 2;
    hh += h * h; tt += t * t; ht += h * t;
  }
  const rho = Math.min(1, Math.max(0, ht / Math.sqrt(hh * tt) || 0));
  for (let i = 0; i < x; i++) {
    const a = Math.PI / 2 * i / x, g = 1 / Math.sqrt(1 + rho * Math.sin(2 * a));
    L[i] = (src.L[i] * Math.sin(a) + src.L[n + i] * Math.cos(a)) * g;
    R[i] = (src.R[i] * Math.sin(a) + src.R[n + i] * Math.cos(a)) * g;
  }
  return { L, R, rho };
}

// Stinger: cut to n samples with a raised-cosine fade over the last f samples. Not looped.
function shapeStinger(src, n, f) {
  const L = new Float32Array(src.L.subarray(0, n)), R = new Float32Array(src.R.subarray(0, n));
  for (let k = 0; k < f; k++) {
    const g = 0.5 * (1 + Math.cos(Math.PI * k / f)), i = n - f + k;
    L[i] *= g; R[i] *= g;
  }
  return { L, R };
}

function rms(L, R, a, b) {
  let s = 0;
  for (let i = a; i < b; i++) { const m = (L[i] + R[i]) / 2; s += m * m; }
  return Math.sqrt(s / (b - a)) || 1e-12;
}

// Seam check: the wrap step (last to first sample, mono) against the 99th percentile of normal sample steps.
// A ratio near 1 is a clean join; several times the typical step is a click.
function seamCheck(L, R) {
  const n = L.length, d = new Float32Array(Math.max(0, n - 1));
  for (let i = 0; i < n - 1; i++) d[i] = Math.abs((L[i + 1] + R[i + 1]) - (L[i] + R[i])) / 2;
  d.sort();
  const typical = Math.max(d[Math.floor(d.length * 0.99)] || 0, 1e-4);
  const wrap = Math.abs((L[0] + R[0]) - (L[n - 1] + R[n - 1])) / 2;
  return { wrap, typical, ratio: wrap / typical };
}

// ---- per-slot work

function checkLength(slot, info) {
  const isLoop = slot.kind === 'loop', need = isLoop ? slot.sec + XFADE : slot.sec;
  if (info.duration < need - 0.001) {
    throw new Error(`too short: ${info.duration.toFixed(2)} s, needs ${need.toFixed(2)} s` +
      (isLoop ? ` (${fmt(slot.sec)} loop + ${XFADE} s crossfade tail)` : ` (${fmt(slot.sec)} stinger)`));
  }
  const extra = info.duration - need;
  return extra > 5 ? `trims ${extra.toFixed(1)} s` : '';
}

function render(slot, file, info) {
  const isLoop = slot.kind === 'loop', n = Math.round(slot.sec * SR), x = Math.round(XFADE * SR);
  const needSec = isLoop ? slot.sec + XFADE : slot.sec, needN = Math.round(needSec * SR), warn = [];
  const before = loudness(['-i', file]);
  const dec = decode(file, needSec);
  if (dec.frames < needN - 44) throw new Error('decoded fewer samples than the file header says');
  // Up to 1 ms short is padded with silence, so the shapers never read past the end.
  const src = { L: new Float32Array(needN), R: new Float32Array(needN) };
  src.L.set(dec.L.subarray(0, Math.min(dec.frames, needN)));
  src.R.set(dec.R.subarray(0, Math.min(dec.frames, needN)));
  const shaped = isLoop ? shapeLoop(src, n, x) : shapeStinger(src, n, Math.round(STINGER_FADE * SR));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'prepare-music-'));
  try {
    const raw = path.join(tmp, slot.id + '.f32'), mp3 = path.join(tmp, slot.id + '.mp3');
    writeRaw(raw, shaped.L, shaped.R);
    const meas = loudnormMeasure(raw);
    encode(raw, meas, mp3, `${TAG} ${slot.id} src=${path.basename(file)} sec=${slot.sec}`);
    const out = decode(mp3, slot.sec + 1), after = loudness(['-i', mp3]);
    const seam = isLoop ? seamCheck(out.L, out.R) : null;
    const bump = isLoop ? 20 * Math.log10(rms(shaped.L, shaped.R, 0, x) / rms(shaped.L, shaped.R, x, 2 * x)) : null;
    if (Math.abs(after.I - LUFS) > 1) warn.push(`loudness ${after.I.toFixed(1)} LUFS is off target`);
    if (after.TP > -1) warn.push(`true peak ${after.TP.toFixed(1)} dBTP is above -1 dBTP`);
    if (isLoop && seam.ratio > 4) warn.push(`seam step is ${seam.ratio.toFixed(1)}x the typical step: listen to the loop point`);
    if (isLoop && Math.abs(bump) > 2) warn.push(`crossfade level ${bump > 0 ? '+' : ''}${bump.toFixed(1)} dB: pick a cut with steadier energy`);
    if (Math.abs(out.frames - n) > 88) warn.push(`decoded length differs from ${slot.sec} s by ${out.frames - n} samples (gapless tag not honoured)`);
    return { mp3, before, after, seam, bump, rho: shaped.rho === undefined ? null : shaped.rho, outSec: out.frames / SR, warn, tmp };
  } catch (e) {
    fs.rmSync(tmp, { recursive: true, force: true });
    throw e;
  }
}

function place(from, to) {
  const part = path.join(path.dirname(to), '.' + path.basename(to) + '.partial');
  fs.copyFileSync(from, part);
  fs.renameSync(part, to);
}

// Copies untagged MP3s (render-music.js placeholders) into the backup folder, once per id.
function backupPlaceholders(dst, backupDir, dry) {
  const copied = [];
  for (const s of SLOTS) {
    const f = path.join(dst, s.id + '.mp3'), dest = path.join(backupDir, s.id + '.mp3');
    if (!fs.existsSync(f) || fs.existsSync(dest) || isTool(f)) continue;
    if (!dry) { fs.mkdirSync(backupDir, { recursive: true }); fs.copyFileSync(f, dest); }
    copied.push(s.id);
  }
  return copied;
}

// Picks one source per slot. Names must match a slot exactly (lower case); near misses are reported, not used.
function scanNames(src, notes) {
  const chosen = new Map();
  if (!fs.existsSync(src)) return chosen;
  const ids = SLOTS.map(s => s.id);
  const files = fs.readdirSync(src, { withFileTypes: true }).filter(e => e.isFile() && !e.name.startsWith('.'))
    .map(e => e.name).sort();
  for (const name of files) {
    const ext = path.extname(name), base = path.basename(name, ext);
    if (!EXTS.includes(ext.toLowerCase())) continue;             // README, provenance notes and so on
    if (!ids.includes(base) || ext !== ext.toLowerCase()) {
      const guess = ids.find(id => id === base.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''));
      notes.push(`ignored ${name}: ` + (guess ? `rename it to ${guess}${ext.toLowerCase()}` : `not a slot name (slots: ${ids.join(', ')})`));
      continue;
    }
    const prev = chosen.get(base);
    if (prev) {
      const keep = EXTS.indexOf(path.extname(prev)) <= EXTS.indexOf(ext) ? prev : name;
      notes.push(`${base}: two files, using ${keep}`);
      chosen.set(base, path.join(src, keep));
    } else chosen.set(base, path.join(src, name));
  }
  return chosen;
}

function describeDst(dst, id) {
  const f = path.join(dst, id + '.mp3');
  if (!fs.existsSync(f)) return { state: 'missing', sec: 0 };
  let info = null;
  try { info = ffprobe(f); } catch (e) { return { state: 'unreadable', sec: 0 }; }
  return { state: info.comment.indexOf(TAG) === 0 ? 'prepared' : 'placeholder', sec: info.duration };
}

// Warns when the two intensity layers are not the same length (they would drift apart in the game).
function runPairNote(dst) {
  const a = describeDst(dst, 'run_calm'), b = describeDst(dst, 'run_intense');
  if (a.state === 'missing' || b.state === 'missing') return null;
  if (Math.abs(a.sec - b.sec) < 0.01) return null;
  return `run_calm is ${fmt(a.sec)} (${a.state}) and run_intense is ${fmt(b.sec)} (${b.state}): the two layers will drift. ` +
    'Deliver both run tracks, then run this tool again.';
}

// ---- entry points

// Options: { src, dst, backup, only: [ids], dryRun }. Returns the report; writes nothing when dryRun is set.
function prepare(opts) {
  opts = opts || {};
  const src = path.resolve(opts.src || DEFAULT_SRC), dst = path.resolve(opts.dst || DEFAULT_DST);
  const backupDir = path.resolve(opts.backup || path.join(path.dirname(dst), 'music-procedural'));
  const dry = !!opts.dryRun, only = opts.only && opts.only.length ? new Set(opts.only) : null;
  const rep = { src, dst, backupDir, dryRun: dry, rows: [], notes: [], backedUp: [], runPair: null };
  const chosen = scanNames(src, rep.notes);
  const rows = SLOTS.filter(s => !only || only.has(s.id)).map(slot => {
    const row = { id: slot.id, slot, file: chosen.get(slot.id) || null, status: '', note: '', warn: [] };
    if (row.file) {
      try { row.info = ffprobe(row.file); row.note = checkLength(slot, row.info); row.status = 'ready'; }
      catch (e) { row.status = 'rejected'; row.note = e.message; }
    }
    return row;
  });
  const ready = rows.filter(r => r.status === 'ready');
  rep.backedUp = ready.length ? backupPlaceholders(dst, backupDir, dry) : [];
  if (dry) {
    ready.forEach(r => { r.status = 'would write'; });
  } else if (ready.length) {
    fs.mkdirSync(dst, { recursive: true });
    for (const row of ready) {
      let r = null;
      try {
        r = render(row.slot, row.file, row.info);
        place(r.mp3, path.join(dst, row.id + '.mp3'));
        Object.assign(row, { status: 'written', before: r.before, after: r.after, seam: r.seam, bump: r.bump, rho: r.rho, outSec: r.outSec });
        row.warn = r.warn;
      } catch (e) {
        row.status = 'failed'; row.note = e.message;
      } finally {
        if (r) fs.rmSync(r.tmp, { recursive: true, force: true });
      }
    }
  }
  for (const row of rows) {
    if (row.status === 'ready' || row.status === 'rejected' || row.status === 'failed' || row.status === 'written') continue;
    if (row.status === 'would write') continue;
    const d = describeDst(dst, row.id);
    row.status = d.state;
    row.outSec = d.sec;
    row.note = d.state === 'missing' ? 'no file: the game is silent for this slot'
      : d.state === 'placeholder' ? 'no source yet: procedural placeholder kept' : 'no source yet: previous prepared file kept';
  }
  rep.rows = rows;
  rep.runPair = dry ? null : runPairNote(dst);
  if (rep.runPair) rep.notes.push(rep.runPair);
  return rep;
}

function printReport(rep) {
  const lines = [];
  lines.push(`prepare-music  src=${rel(rep.src)}  dst=${rel(rep.dst)}${rep.dryRun ? '  (dry run, nothing written)' : ''}`);
  if (rep.backedUp.length) lines.push(`backup: ${rep.backedUp.length} procedural placeholder(s) ${rep.dryRun ? 'would be copied' : 'copied'} to ${rel(rep.backupDir)}: ${rep.backedUp.join(', ')}`);
  lines.push('');
  lines.push(pad('slot', 12) + pad('source', 22) + pad('status', 14) + pad('length in -> out', 30) + pad('LUFS before -> after', 24) + pad('TP after', 10) + 'notes');
  for (const r of rep.rows) {
    const src = r.file ? path.basename(r.file) : '-';
    let inOut = '-';
    if (r.status === 'rejected' || r.status === 'failed') inOut = `${fmt(r.info ? r.info.duration : 0)} -> no output`;
    else if (r.info) inOut = `${fmt(r.info.duration)} -> ${r.outSec !== undefined ? fmt(r.outSec) : fmt(r.slot.sec)}`;
    else if (r.outSec) inOut = fmt(r.outSec) + ' (kept)';
    const lufs = r.after ? `${r.before.I.toFixed(1)} -> ${r.after.I.toFixed(1)}` : '-';
    const tp = r.after ? r.after.TP.toFixed(1) : '-';
    const extra = [];
    if (r.seam) extra.push(`seam ${r.seam.ratio.toFixed(2)}x`);
    if (r.bump !== null && r.bump !== undefined) extra.push(`xfade ${r.bump >= 0 ? '+' : ''}${r.bump.toFixed(1)} dB, corr ${r.rho.toFixed(2)}`);
    if (r.slot.kind === 'stinger' && r.status === 'written') extra.push('fade 0.3 s, no loop');
    if (r.note) extra.push(r.note);
    lines.push(pad(r.id, 12) + pad(src, 22) + pad(r.status, 14) + pad(inOut, 30) + pad(lufs, 24) + pad(tp, 10) + extra.join('; '));
    r.warn.forEach(w => lines.push(pad('', 12) + 'WARN ' + w));
  }
  const count = s => rep.rows.filter(r => r.status === s).length;
  lines.push('');
  lines.push(`written ${count('written') + count('would write')}, placeholder or prepared kept ${rep.rows.filter(r => ['placeholder', 'prepared', 'missing', 'unreadable'].includes(r.status)).length}, ` +
    `rejected ${count('rejected') + count('failed')}`);
  rep.notes.forEach(n => lines.push('NOTE ' + n));
  return lines.join('\n');
}

function parseArgs(argv) {
  const o = { dryRun: false };
  for (const a of argv) {
    let m;
    if (a === '--dry-run') o.dryRun = true;
    else if ((m = /^--src=(.+)$/.exec(a))) o.src = m[1];
    else if ((m = /^--dst=(.+)$/.exec(a))) o.dst = m[1];
    else if ((m = /^--backup=(.+)$/.exec(a))) o.backup = m[1];
    else if ((m = /^--only=(.+)$/.exec(a))) o.only = m[1].split(',').map(s => s.trim()).filter(Boolean);
    else if (a === '--help' || a === '-h') o.help = true;
    else throw new Error('unknown option ' + a);
  }
  return o;
}

function main(argv) {
  let opts;
  try { opts = parseArgs(argv); } catch (e) { console.error(e.message); return 1; }
  if (opts.help) {
    console.log('Usage: node prototype/tools/prepare-music.js [--src=DIR] [--dst=DIR] [--backup=DIR] [--only=id,id] [--dry-run]');
    return 0;
  }
  for (const bin of ['ffmpeg', 'ffprobe']) {
    const r = spawnSync(bin, ['-version'], { encoding: 'utf8' });
    if (r.error) { console.error(`${bin} not found on PATH (macOS: brew install ffmpeg)`); return 1; }
  }
  const rep = prepare(opts);
  console.log(printReport(rep));
  return rep.rows.some(r => r.status === 'rejected' || r.status === 'failed') ? 1 : 0;
}

module.exports = { SLOTS, SR, XFADE, STINGER_FADE, LUFS, TRUE_PEAK, TAG, prepare, shapeLoop, shapeStinger, seamCheck, printReport, ffprobe };

if (require.main === module) process.exitCode = main(process.argv.slice(2));
