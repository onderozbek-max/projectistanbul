#!/usr/bin/env node
// Turns the owner's AI-generated sound effects into the files the game plays (D-063, proposed). Mirrors prepare-music.js.
//   in:  prototype/audio/sfx-gen/<id>.<wav|mp3|ogg|m4a>          the first take of a cue
//        prototype/audio/sfx-gen/<id>_2.<ext> .. <id>_4.<ext>   takes 2 to 4 (same extensions)
//        prototype/audio/sfx-gen/amb_<group>.<ext>              an ambience bed (8 to 20 s, a loop)
//   out: prototype/audio/sfx-gen/ready/<file>.mp3              mono, 44.1 kHz, 128 kbps
//        prototype/audio/sfx-gen/ready/manifest.json           what the game loads (sfx-gen.js)
// Cues: silence is trimmed at both ends, the tail gets a 5 ms fade, the level is set to the class target (loudest 50 ms
// RMS, the synth's design metric) and the peak is capped at -1.5 dBFS. Beds: nothing is trimmed; the last 0.5 s is blended
// into the head (equal power, corrected for correlation) so the loop is seamless and the output is 0.5 s shorter than the
// source; the level is -26 dBFS RMS with a -4 dBFS peak. Checks: clipping, silence, length, long tails, similar takes,
// MP3 leading silence and true peak. A cue with no source keeps its file and manifest entry (partial uploads are fine).
// Node 18+, ffmpeg and ffprobe on PATH, no npm packages.
//   node prototype/tools/prepare-sfx.js [--dry-run] [--only=id,id] [--src=DIR] [--dst=DIR] [--list]
// Exit code: 0 when every present source was processed; 1 when a source was rejected or failed.
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const { spawnSync } = require('child_process');
const L = require('./lib-sfx.js');

const SR = 44100;                       // analysis and output rate
const DECODE_RATE = 48000;              // the runtime budget rate (sfx-gen.js DECODE_SR)
const CUE_CAP = 15500000;               // sfx-gen.js CUE_CAP, bytes of decoded cue audio
const TRIM_DB = -50, FADE_SEC = 0.005, PEAK_DB = -1.5, BED_PEAK_DB = -4, BED_RMS_DB = -26, BED_BLEND = 0.5;
const MIN_SEC = 0.03, MAX_SEC = 3.0, REPEAT_MAX_SEC = 0.8, SIMILAR = 0.98, BED_MIN = 8, BED_MAX = 20;
const BITRATE = '128k', TAG = 'istanbul prepare-sfx';
const EXTS = ['.wav', '.mp3', '.m4a', '.ogg'];                  // preference when two sources share a take
const BEDS = ['street', 'waterfront', 'bazaar', 'wind', 'night'];
const TARGET_DB = { hit: -17, impact: -16, ui: -22, voice: -18, boss: -14, bed: BED_RMS_DB };
const CLASS = {};                                              // cue -> loudness class (default: impact)
[['hit', 'splat stab swish nail hammer cleaver crit spearPin spitHit chain'],
 ['voice', 'hurt groan snarl zombieDie cat elite crowdScream'],
 ['boss', 'bossIntro bossDie bruteRoar level levelClear levelFail finale evolve ult shock ferryHorn rocketLaunch'],
 ['ui', 'uiTap uiBack uiOpen comicPop comicPage nodeUnlock gearEquip pick mapWalk phoneBuzz hoodIntro nosignal footstep star coin tink magnet heal slam']
].forEach(([c, list]) => list.split(' ').forEach(n => { CLASS[n] = c; }));
// Frequent cues: their takes must be short (0.8 s or less).
const REPEATERS = new Set(('hit_body hit_blade hit_blunt hit_pierce hit_chain splat swish nail hammer stab crit dash footstep ' +
  'uiTap uiBack uiOpen nazar spitHit spearPin lob chestDrop glass zombieDie groan hurt cleaver snarl').split(' '));
const DEFAULT_SRC = path.join(__dirname, '..', 'audio', 'sfx-gen');

let VALID = null;
// Every id a file may use: each synthesized cue except speech (syllable blips stay synthesized), hit split into its kinds
// (hit_body ...), and the five beds (amb_<group>).
function validIds() {
  if (VALID) return VALID;
  const { R } = L.loadSfx(), ids = [];
  for (const n of R.names) {
    if (n === 'speech') continue;
    if (n === 'hit') R.HIT_KINDS.forEach(k => ids.push('hit_' + k));
    else ids.push(n);
  }
  BEDS.forEach(g => ids.push('amb_' + g));
  VALID = { ids, meta: R.meta, set: new Set(ids) };
  return VALID;
}
function classOf(id) {
  if (id.indexOf('amb_') === 0) return 'bed';
  if (id.indexOf('hit_') === 0) return 'hit';
  return CLASS[id] || 'impact';
}
function outName(id, variant) { return variant === 0 ? id + '.mp3' : id + '_' + (variant + 1) + '.mp3'; }

// ---- ffmpeg helpers (argument arrays, no shell)

function probe(file) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,codec_name,sample_rate,channels',
    '-of', 'json', file], { encoding: 'utf8' });
  if (r.error || r.status !== 0) throw new Error('ffprobe cannot read it');
  const j = JSON.parse(r.stdout || '{}'), a = (j.streams || []).find(s => s.codec_type === 'audio');
  if (!a) throw new Error('no audio stream');
  const duration = parseFloat((j.format || {}).duration);
  if (!(duration > 0)) throw new Error('unknown duration');
  return { duration, codec: a.codec_name, rate: Number(a.sample_rate), channels: a.channels };
}
// Decodes up to maxSec of the first audio stream to mono float at SR.
function decodeMono(file, maxSec) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-vn', '-map', '0:a:0', '-t', String(maxSec), '-ac', '1', '-ar', String(SR),
    '-f', 'f32le', '-c:a', 'pcm_f32le', 'pipe:1'], { maxBuffer: 1 << 30 });
  if (r.error || r.status !== 0) throw new Error('decode failed');
  const b = r.stdout;
  return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length - (b.length % 4)));
}
// EBU R128 true peak (dBTP) of an encoded file.
function truePeak(file) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 26 });
  const p = /True peak:\s*\n\s*Peak:\s+(-?[\d.]+) dBFS/.exec(r.stderr || '');
  if (!p) throw new Error('true peak measurement failed');
  return parseFloat(p[1]);
}

// ---- signal helpers

const db = q => (q > 0 ? 20 * Math.log10(q) : -200);
// Peak, RMS and clipped-sample count (|x| at 0.999 or more, the 16-bit full scale).
function levels(x) {
  let pk = 0, s = 0, clip = 0;
  for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); if (a > pk) pk = a; if (a >= 0.999) clip++; s += x[i] * x[i]; }
  return { peakDb: db(pk), rmsDb: db(Math.sqrt(s / Math.max(1, x.length))), clipped: clip };
}
// Loudest 50 ms RMS in dBFS: the design metric the synth uses (db in sfx-bank2.js).
function loud50(x) {
  const w = Math.max(1, Math.round(0.05 * SR));
  if (x.length <= w) return db(Math.sqrt(x.reduce((s, v) => s + v * v, 0) / Math.max(1, x.length)));
  let run = 0, best = 0;
  for (let i = 0; i < x.length; i++) { run += x[i] * x[i]; if (i >= w) run -= x[i - w] * x[i - w]; if (i >= w - 1 && run > best) best = run; }
  return db(Math.sqrt(best / w));
}
// First and past-last sample at or above the trim threshold; a >= b means silent.
function activeBounds(x, th) {
  let a = 0, b = x.length;
  while (a < x.length && Math.abs(x[a]) < th) a++;
  while (b > a && Math.abs(x[b - 1]) < th) b--;
  return [a, b];
}
// Seconds from the peak until the signal last sits above -30 dB of the peak (a long reverb tail shows here).
function tailSec(x) {
  let p = 0;
  for (let i = 1; i < x.length; i++) if (Math.abs(x[i]) > Math.abs(x[p])) p = i;
  const lim = Math.abs(x[p]) * Math.pow(10, -30 / 20);
  let last = p;
  for (let i = p; i < x.length; i++) if (Math.abs(x[i]) >= lim) last = i;
  return (last - p) / SR;
}
// Beds: the last BED_BLEND seconds are blended into the head with equal power. Output length is N - blend.
function loopBlend(x) {
  const X = Math.round(BED_BLEND * SR), n = x.length - X;
  let hh = 0, tt = 0, ht = 0;
  for (let i = 0; i < X; i++) { const h = x[i], t = x[n + i]; hh += h * h; tt += t * t; ht += h * t; }
  const rho = Math.min(1, Math.max(0, ht / Math.sqrt(hh * tt) || 0));
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = x[i];
  for (let i = 0; i < X; i++) {
    const a = Math.PI / 2 * i / X, g = 1 / Math.sqrt(1 + rho * Math.sin(2 * a));
    out[i] = (x[i] * Math.sin(a) + x[n + i] * Math.cos(a)) * g;
  }
  return { out, rho };
}
// Normalised correlation at zero lag over the shorter length (same measure as qa-sfx.js).
function corr(a, b) {
  const n = Math.min(a.length, b.length);
  let ab = 0, aa = 0, bb = 0;
  for (let i = 0; i < n; i++) { ab += a[i] * b[i]; aa += a[i] * a[i]; bb += b[i] * b[i]; }
  return aa > 0 && bb > 0 ? ab / Math.sqrt(aa * bb) : 0;
}

// ---- sources

// Picks one source per take. Returns Map<'id|variant', {id, variant, src, name}> and notes for everything else.
function scan(src, notes) {
  const chosen = new Map(), { ids, set } = validIds();
  if (!fs.existsSync(src)) return chosen;
  const byLower = new Map(ids.map(id => [id.toLowerCase(), id]));
  const files = fs.readdirSync(src, { withFileTypes: true }).filter(e => e.isFile() && !e.name.startsWith('.')).map(e => e.name).sort();
  for (const name of files) {
    const ext = path.extname(name), stem = path.basename(name, ext), low = ext.toLowerCase();
    if (!EXTS.includes(low)) continue;                                 // README, BRIEF and notes are not sources
    let base = stem, variant = 0;
    const m = /^(.+)_([0-9]+)$/.exec(stem);
    if (m && !set.has(stem)) {
      base = m[1];
      const k = Number(m[2]);
      if (k === 1) variant = 0;
      else if (k >= 2 && k <= 4) variant = k - 1;
      else { notes.push(`ignored ${name}: takes run from ${base}${low} to ${base}_4${low} (four takes at most)`); continue; }
    }
    if (!set.has(base)) {
      if (stem === 'hit') notes.push(`ignored ${name}: 'hit' is played per kind, use hit_body, hit_blade, hit_blunt, hit_pierce or hit_chain`);
      else if (stem.indexOf('speech') === 0) notes.push(`ignored ${name}: speech stays synthesized`);
      else {
        const g = byLower.get(base.toLowerCase());
        notes.push(`ignored ${name}: ` + (g ? `not an exact id, rename it to ${g}${low}` : 'not a cue id (run --list)'));
      }
      continue;
    }
    if (base.indexOf('amb_') === 0 && variant !== 0) { notes.push(`ignored ${name}: a bed has one file`); continue; }
    const key = base + '|' + variant, prev = chosen.get(key);
    if (prev) {
      const keep = EXTS.indexOf(path.extname(prev.src).toLowerCase()) <= EXTS.indexOf(low) ? prev : null;
      notes.push(`${base} take ${variant + 1}: two sources, using ${keep ? path.basename(keep.src) : name}`);
      if (keep) continue;
    }
    chosen.set(key, { id: base, variant, src: path.join(src, name), name });
  }
  return chosen;
}

// Shapes one source. Returns { x (final samples), sec, db, peak, warn[], note } or throws with the reason.
function shape(id, file, warn) {
  const cls = classOf(id), bed = cls === 'bed', info = probe(file);
  if (bed && (info.duration < BED_MIN + BED_BLEND - 0.01 || info.duration > BED_MAX + BED_BLEND + 0.5)) {
    throw new Error(`a bed must run ${BED_MIN} to ${BED_MAX} s plus ${BED_BLEND} s for the blend (this one is ${info.duration.toFixed(2)} s)`);
  }
  let x = decodeMono(file, bed ? BED_MAX + BED_BLEND + 1 : 30);
  if (!(x.length > 0)) throw new Error('no samples');
  const pre = levels(x);
  if (pre.clipped > 0) warn.push(`source clips: ${pre.clipped} samples at full scale (choose a take without clipping)`);
  if (bed) {
    if (pre.rmsDb < -60) throw new Error('silent (below -60 dBFS RMS)');
    const l = loopBlend(x);
    x = l.out;
    if (l.rho > 0.5) warn.push(`loop blend correlated ${l.rho.toFixed(2)}: the bed may sound like it repeats`);
    scale(x, Math.pow(10, (BED_RMS_DB - levels(x).rmsDb) / 20));
    const pk = levels(x).peakDb;
    if (pk > BED_PEAK_DB) {
      scale(x, Math.pow(10, (BED_PEAK_DB - pk) / 20));
      warn.push(`peak-limited: the bed is quieter than the ${BED_RMS_DB} dBFS RMS target`);
    }
    return { x, sec: x.length / SR, db: levels(x).rmsDb, peak: levels(x).peakDb, warn, note: `loop, ${BED_BLEND} s blend` };
  }
  const [a, b] = activeBounds(x, Math.pow(10, TRIM_DB / 20));
  if (b - a < Math.round(MIN_SEC * SR)) throw new Error('silent or almost silent (nothing above -50 dBFS)');
  const s0 = Math.max(0, a - Math.round(0.002 * SR)), s1 = Math.min(x.length, b + Math.round(FADE_SEC * SR));
  x = Float32Array.from(x.subarray(s0, s1));
  const nf = Math.round(FADE_SEC * SR);
  for (let k = 0; k < nf && k < x.length; k++) x[x.length - 1 - k] *= 0.5 * (1 - Math.cos(Math.PI * k / nf));
  const sec = x.length / SR;
  if (sec > MAX_SEC) throw new Error(`too long: ${sec.toFixed(2)} s, limit ${MAX_SEC} s`);
  if (REPEATERS.has(id) && sec > REPEAT_MAX_SEC) warn.push(`${sec.toFixed(2)} s is long for a frequent cue (aim for ${REPEAT_MAX_SEC} s or less)`);
  const tail = tailSec(x);
  if (REPEATERS.has(id) && tail > 0.8) warn.push(`tail above -30 dB for ${tail.toFixed(2)} s: pick a drier take`);
  const target = TARGET_DB[cls], l50 = loud50(x);
  let g = Math.pow(10, (target - l50) / 20);
  const pk0 = levels(x).peakDb, room = PEAK_DB - (pk0 + 20 * Math.log10(g));
  if (room < 0) { g *= Math.pow(10, room / 20); warn.push(`peak-limited: ${(-room).toFixed(1)} dB under the ${target} dBFS class target`); }
  scale(x, g);
  const after = levels(x);
  if (after.peakDb > PEAK_DB + 0.05) throw new Error('peak above the ceiling after leveling');
  if (loud50(x) < -45) warn.push(`very quiet (${loud50(x).toFixed(1)} dBFS loudest 50 ms): check the take`);
  return { x, sec, db: loud50(x), peak: after.peakDb, warn, note: '' };
}
function scale(x, g) { for (let i = 0; i < x.length; i++) x[i] *= g; }

// Encodes mono float to MP3 through a temp file, then moves it into place.
function encode(x, mp3, comment) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'prepare-sfx-'));
  try {
    const raw = path.join(tmp, 'x.f32'), out = path.join(tmp, 'x.mp3');
    fs.writeFileSync(raw, Buffer.from(x.buffer, x.byteOffset, x.byteLength));
    const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'f32le', '-ar', String(SR), '-ac', '1', '-i', raw, '-c:a', 'libmp3lame',
      '-b:a', BITRATE, '-id3v2_version', '3', '-map_metadata', '-1', '-metadata', 'comment=' + comment, '-f', 'mp3', out], { encoding: 'utf8' });
    if (r.error || r.status !== 0) throw new Error('encode failed' + (r.stderr ? ': ' + r.stderr.trim().split('\n').pop() : ''));
    const part = mp3 + '.partial';
    fs.copyFileSync(out, part);
    fs.renameSync(part, mp3);
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}
// Decodes the MP3 back (ffmpeg honours the LAME delay) and reports the leading silence and the true peak.
function checkMp3(mp3, warn) {
  const y = decodeMono(mp3, 40), th = Math.pow(10, TRIM_DB / 20);
  let lead = 0;
  while (lead < y.length && Math.abs(y[lead]) < th) lead++;
  const leadMs = lead * 1000 / SR, tp = truePeak(mp3);
  if (leadMs > 5) warn.push(`${leadMs.toFixed(1)} ms of silence at the start after MP3 encoding`);
  if (tp > -1) warn.push(`true peak ${tp.toFixed(1)} dBTP after MP3 encoding (ceiling -1.5)`);
  return { tp, leadMs };
}

// ---- entry points

// Reads the existing manifest (if any) so a partial run keeps the other files.
function readManifest(dst) {
  const f = path.join(dst, 'manifest.json');
  if (!fs.existsSync(f)) return null;
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; }
}
// Options: { src, dst, only: [ids], dryRun }. Returns the report; writes nothing when dryRun is set.
function prepare(opts) {
  opts = opts || {};
  const src = path.resolve(opts.src || DEFAULT_SRC), dst = path.resolve(opts.dst || path.join(DEFAULT_SRC, 'ready'));
  const dry = !!opts.dryRun, only = opts.only && opts.only.length ? new Set(opts.only) : null;
  const rep = { src, dst, dryRun: dry, rows: [], notes: [], manifest: null };
  const chosen = scan(src, rep.notes), rows = [];
  const order = [...chosen.values()].sort((p, q) => (p.id < q.id ? -1 : p.id > q.id ? 1 : p.variant - q.variant));
  if (!dry) fs.mkdirSync(dst, { recursive: true });
  for (const c of order) {
    if (only && !only.has(c.id)) continue;
    const row = { id: c.id, variant: c.variant, source: c.name, file: outName(c.id, c.variant), status: '', note: '', warn: [], sec: 0 };
    rows.push(row);
    try {
      if (dry) { row.sec = probe(c.src).duration; row.status = 'would write'; continue; }
      const s = shape(c.id, c.src, row.warn);
      row.sec = s.sec; row.db = s.db; row.peak = s.peak; row.note = s.note; row._x = s.x;
      encode(s.x, path.join(dst, row.file), `${TAG} ${c.id} src=${c.name} class=${classOf(c.id)}`);
      const m = checkMp3(path.join(dst, row.file), row.warn);
      row.tp = m.tp; row.leadMs = m.leadMs; row.status = 'written';
    } catch (e) {
      row.status = 'rejected'; row.note = e.message;
    }
  }
  // Similar takes of one cue are a warning on both rows (qa-sfx uses the same measure).
  for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) {
    if (rows[i].id !== rows[j].id || !rows[i]._x || !rows[j]._x) continue;
    const r = corr(rows[i]._x, rows[j]._x);
    if (r > SIMILAR) { rows[i].warn.push(`take ${rows[i].variant + 1} and take ${rows[j].variant + 1} are nearly identical (r ${r.toFixed(3)})`); }
  }
  rows.forEach(r => { delete r._x; });
  rep.rows = rows;
  if (!dry) rep.manifest = writeManifest(dst, rows, rep);
  return rep;
}

// Rebuilds ready/manifest.json: entries of files that are still in ready/ and were not rewritten this run are kept.
function writeManifest(dst, rows, rep) {
  const { set } = validIds(), prev = readManifest(dst) || {};
  const cues = {}, beds = {};
  const fresh = new Map(rows.filter(r => r.status === 'written').map(r => [r.file, r]));
  const entry = (r) => r.id.indexOf('amb_') === 0
    ? { file: r.file, seconds: round(r.sec), rmsDb: round(r.db), peak: round(r.peak), bytes: size(path.join(dst, r.file)), source: r.source }
    : { file: r.file, variant: r.variant, seconds: round(r.sec), db: round(r.db), peak: round(r.peak), bytes: size(path.join(dst, r.file)), source: r.source };
  const keepOld = (id, f) => set.has(id) && !fresh.has(f) && fs.existsSync(path.join(dst, f));
  for (const [id, list] of Object.entries(prev.cues || {})) for (const e of list) {
    if (keepOld(id, e.file)) (cues[id] = cues[id] || []).push(e);
  }
  for (const [g, e] of Object.entries(prev.beds || {})) if (keepOld('amb_' + g, e.file)) beds[g] = e;
  for (const r of fresh.values()) {
    if (r.id.indexOf('amb_') === 0) beds[r.id.slice(4)] = entry(r);
    else (cues[r.id] = cues[r.id] || []).push(entry(r));
  }
  for (const id of Object.keys(cues)) cues[id].sort((a, b) => a.variant - b.variant);
  const cueBytes = Object.values(cues).reduce((s, l) => s + l.reduce((t, e) => t + e.seconds * DECODE_RATE * 4, 0), 0);
  const bedBytes = Object.values(beds).reduce((s, e) => s + e.seconds * DECODE_RATE * 4, 0);
  const manifest = { tool: 'prototype/tools/prepare-sfx.js', version: 1, generated: new Date().toISOString(), format: 'mp3',
    sampleRate: SR, channels: 1, bitrate: BITRATE, decodeRate: DECODE_RATE,
    budget: { cueCapBytes: CUE_CAP, cueEstimateBytes: Math.round(cueBytes), bedMaxBytes: Math.round(BED_MAX * DECODE_RATE * 4), bedEstimateBytes: Math.round(bedBytes) },
    cues, beds };
  if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
  const part = path.join(dst, '.manifest.json.partial');
  fs.writeFileSync(part, JSON.stringify(manifest, null, 1) + '\n');
  fs.renameSync(part, path.join(dst, 'manifest.json'));
  rep.budget = manifest.budget;
  return manifest;
}
const round = v => (typeof v === 'number' && isFinite(v) ? Math.round(v * 100) / 100 : null);
const size = f => (fs.existsSync(f) ? fs.statSync(f).size : 0);

function printReport(rep) {
  const rel = p => { const r = path.relative(process.cwd(), p); return r && !r.startsWith('..') ? r : p; };
  const pad = (s, n) => String(s).padEnd(n), lines = [];
  lines.push(`prepare-sfx  src=${rel(rep.src)}  dst=${rel(rep.dst)}${rep.dryRun ? '  (dry run, nothing written)' : ''}`);
  lines.push('');
  lines.push(pad('id', 15) + pad('take', 6) + pad('source', 24) + pad('status', 13) + pad('sec', 7) + pad('level', 9) + pad('peak', 8) + 'notes');
  for (const r of rep.rows) {
    const lvl = r.db === undefined ? '-' : r.db.toFixed(1);
    const pk = r.peak === undefined ? '-' : r.peak.toFixed(1);
    lines.push(pad(r.id, 15) + pad(r.variant + 1, 6) + pad(r.source, 24) + pad(r.status, 13) + pad(r.sec ? r.sec.toFixed(2) : '-', 7) +
      pad(lvl, 9) + pad(pk, 8) + (r.note || r.error || ''));
    r.warn.forEach(w => lines.push(pad('', 15) + 'WARN ' + w));
  }
  const n = s => rep.rows.filter(r => r.status === s).length;
  lines.push('');
  lines.push(`written ${n('written') + n('would write')}, rejected ${n('rejected')}`);
  if (rep.manifest) {
    const ids = Object.keys(rep.manifest.cues).length, files = Object.values(rep.manifest.cues).reduce((s, l) => s + l.length, 0);
    const b = rep.manifest.budget;
    lines.push(`ready: ${files} cue file(s) for ${ids} cue id(s), ${Object.keys(rep.manifest.beds).length} bed(s); ` +
      `decoded estimate ${(b.cueEstimateBytes / 1e6).toFixed(2)} MB of cues (cap ${(b.cueCapBytes / 1e6).toFixed(1)} MB at 48 kHz), beds ${(b.bedEstimateBytes / 1e6).toFixed(2)} MB`);
    if (b.cueEstimateBytes > b.cueCapBytes) lines.push('NOTE the cue files are over the cap: the longest will fall back to the synth recipe in the game');
  }
  rep.notes.forEach(x => lines.push('NOTE ' + x));
  return lines.join('\n');
}

function parseArgs(argv) {
  const o = { dryRun: false };
  for (const a of argv) {
    let m;
    if (a === '--dry-run') o.dryRun = true;
    else if (a === '--list') o.list = true;
    else if ((m = /^--src=(.+)$/.exec(a))) o.src = m[1];
    else if ((m = /^--dst=(.+)$/.exec(a))) o.dst = m[1];
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
    console.log('Usage: node prototype/tools/prepare-sfx.js [--dry-run] [--only=id,id] [--src=DIR] [--dst=DIR] [--list]');
    return 0;
  }
  if (opts.list) {
    const { ids } = validIds();
    ids.forEach(id => console.log(`${id.padEnd(16)} ${classOf(id).padEnd(7)} ${id.indexOf('amb_') === 0 ? 'bed' : (REPEATERS.has(id) ? 'frequent' : '')}`));
    console.log(`${ids.length} ids (speech is not a file id; hit is played per kind)`);
    return 0;
  }
  for (const bin of ['ffmpeg', 'ffprobe']) {
    const r = spawnSync(bin, ['-version'], { encoding: 'utf8' });
    if (r.error) { console.error(`${bin} not found on PATH (macOS: brew install ffmpeg)`); return 1; }
  }
  const rep = prepare(opts);
  console.log(printReport(rep));
  return rep.rows.some(r => r.status === 'rejected') ? 1 : 0;
}

module.exports = { validIds, classOf, outName, scan, shape, loopBlend, activeBounds, tailSec, loud50, prepare, printReport,
  readManifest, CUE_CAP, DECODE_RATE, BEDS };

if (require.main === module) process.exitCode = main(process.argv.slice(2));
