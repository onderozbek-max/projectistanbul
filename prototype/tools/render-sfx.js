#!/usr/bin/env node
// Renders every sound cue variant from the game's own DSP code (js/view/sfx-bank.js, sfx-bank2.js) to 44.1 kHz, 16-bit
// mono WAV, masters each file with ffmpeg (alimiter ceiling and PCM format), measures it with ffmpeg loudnorm (EBU R128
// integrated loudness and true peak, for cues of 0.4 s and longer), and writes manifest.json next to the files.
// Level: the DSP already sets every cue to its design level (loudest 50 ms RMS = db in the recipe meta, peak capped), so
// ffmpeg does not re-level the files. A single LUFS target would rebalance cues against that design (a blast measures
// about -27 LUFS against its -15 dB design level, and a true-peak cap stops impulsive cues reaching a LUFS target).
// The runtime (sfx.js) still synthesizes live in the browser; these files are for QA, loudness checks and a Godot import.
//
//   node prototype/tools/render-sfx.js                 render and master into prototype/audio/sfx/
//   node prototype/tools/render-sfx.js --no-master     raw DSP output only (fast)
//   node prototype/tools/render-sfx.js --only=tink,hit --out=/tmp/sfx
//
// Regenerate after any change to js/view/sfx-*.js. Output is deterministic (seeded RNG).
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const L = require('./lib-sfx.js');

const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const LONG_SEC = 0.4;          // EBU R128 integrated loudness needs at least one 400 ms gating block
const ALIM = 0.84;             // alimiter ceiling, linear (about -1.5 dBFS): a safety net, the DSP peak cap is the same

function arg(name, dflt) {
  const a = process.argv.find(s => s.startsWith('--' + name + '='));
  return a ? a.slice(name.length + 3) : dflt;
}
const has = name => process.argv.includes('--' + name);
function ff(args) {
  const r = cp.spawnSync(FFMPEG, ['-hide_banner', '-nostats', ...args], { encoding: 'utf8', maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error('ffmpeg failed: ' + args.join(' ') + '\n' + String(r.stderr).slice(-400));
  return String(r.stderr);
}
// Measure-only loudnorm pass: returns { lufs, truePeakDb, lra } from its JSON report.
function measure(src) {
  const err = ff(['-i', src, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-']);
  const j = JSON.parse(err.slice(err.lastIndexOf('{'), err.lastIndexOf('}') + 1));
  return { lufs: +j.input_i, truePeakDb: +j.input_tp, lra: +j.input_lra };
}
// Node-side level figures (exact): sample peak, RMS and the loudest 50 ms RMS, all in dBFS.
function levels(x, sr) {
  let pk = 0, s = 0, i, w = Math.max(1, Math.round(sr * 0.05)), run = 0, best = 0;
  for (i = 0; i < x.length; i++) {
    const v = x[i], a = Math.abs(v);
    if (a > pk) pk = a;
    s += v * v; run += v * v; if (i >= w) run -= x[i - w] * x[i - w];
    if (i >= w - 1 && run > best) best = run;
  }
  const db = q => (q > 0 ? 20 * Math.log10(q) : -200);
  return { peakDb: db(pk), rmsDb: db(Math.sqrt(s / Math.max(1, x.length))), loudest50Db: db(Math.sqrt(best / w)) };
}

function main() {
  const outDir = arg('out', path.join(L.ROOT, 'audio', 'sfx'));
  const only = arg('only', '') ? arg('only', '').split(',') : null;
  const master = !has('no-master');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'istanbul-sfx-'));
  fs.mkdirSync(outDir, { recursive: true });
  const { R } = L.loadSfx();
  const sr = L.SAMPLE_RATE;
  const manifest = { generator: 'prototype/tools/render-sfx.js', sampleRate: sr, format: 'wav s16 mono',
    master: master ? 'ffmpeg alimiter (ceiling -1.5 dBFS) + pcm_s16le; levels = DSP design (loudest 50 ms RMS = db); loudnorm measured, not applied' : 'none (raw DSP)',
    cues: [], files: [] };
  const started = Date.now(), vs = L.variants(R).filter(v => !only || only.includes(v.name));
  let bytes = 0, n = 0;
  for (const v of vs) {
    const x = R.render(v.name, sr, v.v, v.who);
    if (!x) continue;
    const raw = path.join(tmp, v.id + '.wav'), dst = path.join(outDir, v.id + '.wav');
    fs.writeFileSync(raw, L.wavBuffer(x, sr));
    const sec = x.length / sr;
    if (master) ff(['-y', '-i', raw, '-af', `alimiter=limit=${ALIM}:attack=1:release=30:level=disabled`, '-ac', '1', '-ar', String(sr), '-c:a', 'pcm_s16le', dst]);
    else fs.copyFileSync(raw, dst);
    const lv = levels(x, sr), lu = master && sec >= LONG_SEC ? measure(dst) : null;
    bytes += fs.statSync(dst).size; n++;
    manifest.files.push({ file: v.id + '.wav', cue: v.name, variant: v.v, who: v.who || null, seconds: +sec.toFixed(4),
      designRmsDb: v.meta.db, loudest50msDb: +lv.loudest50Db.toFixed(2), peakDb: +lv.peakDb.toFixed(2),
      lufs: lu ? +lu.lufs.toFixed(2) : null, truePeakDb: lu ? +lu.truePeakDb.toFixed(2) : null });
  }
  for (const name of R.names) {
    const m = R.meta[name];
    manifest.cues.push({ cue: name, bus: m.c, priority: m.p, maxConcurrent: m.m, minGapMs: m.g, designRmsDb: m.db, peakCeilingDb: m.pk,
      variants: m.v, reverbSend: m.r, whos: name === 'hit' ? R.HIT_KINDS : (name === 'speech' ? L.VOICES : null) });
  }
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`render-sfx: ${n} files, ${(bytes / 1048576).toFixed(2)} MiB, ${((Date.now() - started) / 1000).toFixed(1)} s -> ${outDir}`);
}
main();
