// Shared helpers for the sound tools (render-sfx.js, qa-sfx.js): loads the same DSP files the game uses (sfx-bank.js,
// sfx-bank2.js) into a sandbox, enumerates every cue variant, and reads/writes 16-bit mono WAV. No dependencies.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const FILES = ['js/view/sfx-bank.js', 'js/view/sfx-bank2.js'];
const VOICES = ['arda', 'anne', 'usta', 'friend', 'other'];
const SAMPLE_RATE = 44100;

// Runs the DSP files in a fresh sandbox and returns { P, R, D } (P.SfxRecipes and P.SfxDsp).
function loadSfx() {
  const P = {};
  const sandbox = { P, console };
  vm.createContext(sandbox);
  for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
  return { P, R: P.SfxRecipes, D: P.SfxDsp };
}

// Every rendered variant as { id, file, name, v, who, dur } where id is the stable file stem (e.g. hit_blade_0).
// hit gets one set per hit kind; speech gets one per voice preset; everything else one set per variant.
function variants(R) {
  const out = [];
  for (const name of R.names) {
    const m = R.meta[name];
    const whos = name === 'hit' ? R.HIT_KINDS : (name === 'speech' ? VOICES : ['']);
    for (const who of whos) {
      for (let v = 0; v < m.v; v++) {
        const id = [name, who, String(v)].filter(Boolean).join('_');
        out.push({ id, name, v, who, meta: m });
      }
    }
  }
  return out;
}

// Float32 array -> 16-bit mono PCM WAV (rounded, clamped). Returns the Buffer.
function wavBuffer(x, sr) {
  const n = x.length, data = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) {
    let s = Math.round(Math.max(-1, Math.min(1, x[i])) * 32767);
    data.writeInt16LE(s, i * 2);
  }
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(sr, 24); h.writeUInt32LE(sr * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

// Reads a 16-bit PCM mono WAV written by wavBuffer (or any plain 16-bit mono PCM). Returns { sr, x: Float32Array }.
function readWav(file) {
  const b = fs.readFileSync(file);
  let p = 12, sr = 0, ch = 1, bits = 16, data = null;
  while (p + 8 <= b.length) {
    const id = b.toString('ascii', p, p + 4), size = b.readUInt32LE(p + 4);
    if (id === 'fmt ') { ch = b.readUInt16LE(p + 10); sr = b.readUInt32LE(p + 12); bits = b.readUInt16LE(p + 22); }
    if (id === 'data') { data = b.subarray(p + 8, p + 8 + size); break; }
    p += 8 + size + (size & 1);
  }
  if (!data || bits !== 16) throw new Error('unsupported wav: ' + file);
  const frames = data.length / (2 * ch), x = new Float32Array(frames);
  for (let i = 0; i < frames; i++) x[i] = data.readInt16LE(i * 2 * ch) / 32768;
  return { sr, x };
}

module.exports = { ROOT, VOICES, SAMPLE_RATE, loadSfx, variants, wavBuffer, readWav };
