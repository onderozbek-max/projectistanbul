// PNG and JPEG codecs used by the raster importer.
'use strict';
const zlib = require('zlib');
const { spawnSync } = require('child_process');

// ---------- PNG

const SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
let CRC_TABLE = null;
function crc32(buf) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC_TABLE[n] = c >>> 0;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}

function readPng(buf) {
  for (let i = 0; i < 8; i++) if (buf[i] !== SIG[i]) throw new Error('not a PNG file');
  let p = 8, ihdr = null, plte = null, trns = null;
  const idat = [];
  while (p + 8 <= buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString('latin1', p + 4, p + 8);
    const data = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') ihdr = { w: data.readUInt32BE(0), h: data.readUInt32BE(4), depth: data[8], ctype: data[9], interlace: data[12] };
    else if (type === 'PLTE') plte = data;
    else if (type === 'tRNS') trns = data;
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    p += 12 + len;
  }
  if (!ihdr) throw new Error('PNG has no IHDR');
  if (ihdr.depth !== 8) throw new Error('PNG bit depth ' + ihdr.depth + ' not supported (8 only)');
  if (ihdr.interlace !== 0) throw new Error('interlaced PNG not supported');
  const CH = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ihdr.ctype];
  if (!CH) throw new Error('PNG colour type ' + ihdr.ctype + ' not supported');
  const { w, h } = ihdr, stride = w * CH;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  if (raw.length !== h * (stride + 1)) throw new Error('PNG data length mismatch');
  const out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const ft = raw[y * (stride + 1)], src = y * (stride + 1) + 1, dst = y * stride, prev = dst - stride;
    if (ft === 0) raw.copy(out, dst, src, src + stride);
    else if (ft === 1) {
      for (let i = 0; i < stride; i++) out[dst + i] = (raw[src + i] + (i >= CH ? out[dst + i - CH] : 0)) & 255;
    } else if (ft === 2) {
      for (let i = 0; i < stride; i++) out[dst + i] = (raw[src + i] + (y > 0 ? out[prev + i] : 0)) & 255;
    } else if (ft === 3) {
      for (let i = 0; i < stride; i++) {
        const l = i >= CH ? out[dst + i - CH] : 0, u = y > 0 ? out[prev + i] : 0;
        out[dst + i] = (raw[src + i] + ((l + u) >> 1)) & 255;
      }
    } else if (ft === 4) {
      for (let i = 0; i < stride; i++) {
        const a = i >= CH ? out[dst + i - CH] : 0, b = y > 0 ? out[prev + i] : 0;
        const c = i >= CH && y > 0 ? out[prev + i - CH] : 0;
        const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
        const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        out[dst + i] = (raw[src + i] + pr) & 255;
      }
    } else throw new Error('bad PNG filter ' + ft);
  }
  const rgba = new Uint8Array(w * h * 4);
  const n = w * h;
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    if (ihdr.ctype === 6) { rgba[o] = out[i * 4]; rgba[o + 1] = out[i * 4 + 1]; rgba[o + 2] = out[i * 4 + 2]; rgba[o + 3] = out[i * 4 + 3]; }
    else if (ihdr.ctype === 2) { rgba[o] = out[i * 3]; rgba[o + 1] = out[i * 3 + 1]; rgba[o + 2] = out[i * 3 + 2]; rgba[o + 3] = 255; }
    else if (ihdr.ctype === 0) { const g = out[i]; rgba[o] = rgba[o + 1] = rgba[o + 2] = g; rgba[o + 3] = 255; }
    else if (ihdr.ctype === 4) { const g = out[i * 2]; rgba[o] = rgba[o + 1] = rgba[o + 2] = g; rgba[o + 3] = out[i * 2 + 1]; }
    else if (ihdr.ctype === 3) {
      const k = out[i];
      rgba[o] = plte[k * 3]; rgba[o + 1] = plte[k * 3 + 1]; rgba[o + 2] = plte[k * 3 + 2];
      rgba[o + 3] = trns && k < trns.length ? trns[k] : 255;
    }
  }
  return { w, h, rgba };
}

// Adaptive row filter choice (minimum sum of absolute residuals), then deflate level 9.
function encodePng(w, h, rgba) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  const cand = [0, 1, 2, 3, 4].map(() => new Uint8Array(stride));
  const prevRow = new Uint8Array(stride);
  for (let y = 0; y < h; y++) {
    const row = rgba.subarray(y * stride, (y + 1) * stride);
    let best = -1, bestSum = Infinity;
    for (let f = 0; f < 5; f++) {
      const c = cand[f];
      let sum = 0;
      for (let i = 0; i < stride; i++) {
        const x = row[i];
        const a = i >= 4 ? row[i - 4] : 0, b = y > 0 ? prevRow[i] : 0, cc = i >= 4 && y > 0 ? prevRow[i - 4] : 0;
        let r;
        if (f === 0) r = x;
        else if (f === 1) r = x - a;
        else if (f === 2) r = x - b;
        else if (f === 3) r = x - ((a + b) >> 1);
        else {
          const pa = Math.abs(b - cc), pb = Math.abs(a - cc), pc = Math.abs(a + b - 2 * cc);
          const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : cc;
          r = x - pr;
        }
        r &= 255;
        c[i] = r;
        sum += r < 128 ? r : 256 - r;
      }
      if (sum < bestSum) { bestSum = sum; best = f; }
    }
    raw[y * (stride + 1)] = best;
    raw.set(cand[best], y * (stride + 1) + 1);
    prevRow.set(row);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([SIG, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9, memLevel: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// ---------- palette PNG (colour type 3). Median cut in RGBA over the distinct colours, then nearest-colour remap.
// Returns { palette: [[r,g,b,a]], indices, err: { p99, max, mean } } where err is measured over pixels with alpha > 0.
function quantize(rgba, w, h, K) {
  const N = w * h, map = new Map();
  for (let i = 0; i < N; i++) {
    const o = i * 4, key = (rgba[o] | (rgba[o + 1] << 8) | (rgba[o + 2] << 16) | (rgba[o + 3] << 24)) >>> 0;
    map.set(key, (map.get(key) || 0) + 1);
  }
  const keys = [...map.keys()].sort((a, b) => a - b), n = keys.length;
  const cols = new Uint8Array(n * 4), cnts = new Float64Array(n);
  keys.forEach((k, i) => { cols[i * 4] = k & 255; cols[i * 4 + 1] = (k >>> 8) & 255; cols[i * 4 + 2] = (k >>> 16) & 255; cols[i * 4 + 3] = k >>> 24; cnts[i] = map.get(k); });
  let palette;
  if (n <= K) {
    palette = keys.map((k, i) => [cols[i * 4], cols[i * 4 + 1], cols[i * 4 + 2], cols[i * 4 + 3]]);
  } else {
    let boxes = [Int32Array.from({ length: n }, (_, i) => i)];
    while (boxes.length < K) {
      let best = -1, bestScore = -1, bestAxis = 0;
      boxes.forEach((idx, bi) => {
        if (idx.length < 2) return;
        const mn = [255, 255, 255, 255], mx = [0, 0, 0, 0];
        let tot = 0;
        for (const i of idx) {
          tot += cnts[i];
          for (let c = 0; c < 4; c++) { const v = cols[i * 4 + c]; if (v < mn[c]) mn[c] = v; if (v > mx[c]) mx[c] = v; }
        }
        let axis = 0;
        for (let c = 1; c < 4; c++) if (mx[c] - mn[c] > mx[axis] - mn[axis]) axis = c;
        const score = tot * (mx[axis] - mn[axis]);
        if (score > bestScore) { bestScore = score; best = bi; bestAxis = axis; }
      });
      if (best < 0 || bestScore <= 0) break;
      const idx = Array.from(boxes[best]).sort((a, b) => cols[a * 4 + bestAxis] - cols[b * 4 + bestAxis] || a - b);
      const total = idx.reduce((a, i) => a + cnts[i], 0);
      let acc = 0, cut = 1;
      for (let k = 0; k < idx.length - 1; k++) { acc += cnts[idx[k]]; if (acc >= total / 2) { cut = k + 1; break; } }
      cut = Math.min(Math.max(cut, 1), idx.length - 1);
      boxes.splice(best, 1, Int32Array.from(idx.slice(0, cut)), Int32Array.from(idx.slice(cut)));
    }
    palette = boxes.map(idx => {
      let tot = 0, r = 0, g = 0, b = 0, a = 0;
      for (const i of idx) { const c = cnts[i]; tot += c; r += cols[i * 4] * c; g += cols[i * 4 + 1] * c; b += cols[i * 4 + 2] * c; a += cols[i * 4 + 3] * c; }
      return [Math.round(r / tot), Math.round(g / tot), Math.round(b / tot), Math.round(a / tot)];
    });
  }
  // Lloyd refinement: nearest entry for each distinct colour, then each entry becomes the weighted mean of its colours.
  const near = new Int32Array(n);
  const assign = () => {
    for (let i = 0; i < n; i++) {
      let bd = Infinity, bj = 0;
      for (let j = 0; j < palette.length; j++) {
        const p = palette[j];
        const dr = cols[i * 4] - p[0], dg = cols[i * 4 + 1] - p[1], db = cols[i * 4 + 2] - p[2], da = cols[i * 4 + 3] - p[3];
        const d = dr * dr + dg * dg + db * db + da * da;
        if (d < bd) { bd = d; bj = j; }
      }
      near[i] = bj;
    }
  };
  if (n > K) {
    for (let it = 0; it < 3; it++) {
      assign();
      const acc = palette.map(() => [0, 0, 0, 0, 0]);
      for (let i = 0; i < n; i++) {
        const a = acc[near[i]], c = cnts[i];
        a[0] += cols[i * 4] * c; a[1] += cols[i * 4 + 1] * c; a[2] += cols[i * 4 + 2] * c; a[3] += cols[i * 4 + 3] * c; a[4] += c;
      }
      palette = palette.map((p, j) => acc[j][4] ? [Math.round(acc[j][0] / acc[j][4]), Math.round(acc[j][1] / acc[j][4]),
        Math.round(acc[j][2] / acc[j][4]), Math.round(acc[j][3] / acc[j][4])] : p);
    }
  }
  assign();
  const indexOf = new Map(keys.map((k, i) => [k, near[i]]));
  const indices = new Uint8Array(N);
  const errs = [];
  let maxE = 0, sumE = 0, cntE = 0;
  for (let i = 0; i < N; i++) {
    const o = i * 4, key = (rgba[o] | (rgba[o + 1] << 8) | (rgba[o + 2] << 16) | (rgba[o + 3] << 24)) >>> 0;
    const j = indexOf.get(key);
    indices[i] = j;
    const a = rgba[o + 3];
    if (a >= 128) {
      const p = palette[j];
      const e = Math.max(Math.abs(rgba[o] - p[0]), Math.abs(rgba[o + 1] - p[1]), Math.abs(rgba[o + 2] - p[2]));
      if (e > maxE) maxE = e;
      sumE += e; cntE++;
      errs.push(e);
    }
  }
  errs.sort((x, y) => x - y);
  const p99 = errs.length ? errs[Math.min(errs.length - 1, Math.floor(errs.length * 0.99))] : 0;
  const over8 = errs.length ? errs.filter(e => e > 8).length / errs.length : 0;
  return { palette, indices, colours: n, err: { p99, max: maxE, mean: cntE ? Math.round((sumE / cntE) * 100) / 100 : 0, over8: Math.round(over8 * 10000) / 10000 } };
}

// Colour type 3 PNG: PLTE and tRNS from the palette, one byte per pixel, adaptive filters with bpp 1.
function encodePngPalette(w, h, indices, palette) {
  const stride = w;
  const raw = Buffer.alloc((stride + 1) * h);
  const cand = [0, 1, 2, 3, 4].map(() => new Uint8Array(stride));
  const prev = new Uint8Array(stride);
  for (let y = 0; y < h; y++) {
    const row = indices.subarray(y * stride, (y + 1) * stride);
    let best = 0, bestSum = Infinity;
    for (let f = 0; f < 5; f++) {
      const c = cand[f];
      let sum = 0;
      for (let i = 0; i < stride; i++) {
        const x = row[i], a = i ? row[i - 1] : 0, b = y ? prev[i] : 0, cc = i && y ? prev[i - 1] : 0;
        let r;
        if (f === 0) r = x;
        else if (f === 1) r = x - a;
        else if (f === 2) r = x - b;
        else if (f === 3) r = x - ((a + b) >> 1);
        else { const pa = Math.abs(b - cc), pb = Math.abs(a - cc), pc = Math.abs(a + b - 2 * cc); r = x - (pa <= pb && pa <= pc ? a : pb <= pc ? b : cc); }
        r &= 255; c[i] = r; sum += r < 128 ? r : 256 - r;
      }
      if (sum < bestSum) { bestSum = sum; best = f; }
    }
    raw[y * (stride + 1)] = best;
    raw.set(cand[best], y * (stride + 1) + 1);
    prev.set(row);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 3;
  const plte = Buffer.alloc(palette.length * 3), trns = Buffer.alloc(palette.length);
  palette.forEach((p, i) => { plte[i * 3] = p[0]; plte[i * 3 + 1] = p[1]; plte[i * 3 + 2] = p[2]; trns[i] = p[3]; });
  return Buffer.concat([SIG, chunk('IHDR', ihdr), chunk('PLTE', plte), chunk('tRNS', trns),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9, memLevel: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// ---------- JPEG (ffmpeg mjpeg, bit-exact flags so the output is reproducible)

function encodeJpeg(w, h, rgb, q) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', w + 'x' + h, '-i', 'pipe:0',
    '-frames:v', '1', '-c:v', 'mjpeg', '-q:v', String(q), '-huffman', 'optimal', '-pix_fmt', 'yuvj420p',
    '-fflags', '+bitexact', '-flags:v', '+bitexact', '-f', 'image2pipe', 'pipe:1'], { input: Buffer.from(rgb.buffer, rgb.byteOffset, rgb.byteLength), maxBuffer: 1 << 28 });
  if (r.error || r.status !== 0 || !r.stdout || r.stdout.length < 100) throw new Error('ffmpeg mjpeg encode failed: ' + (r.stderr || r.error));
  return r.stdout;
}

// Decodes a JPEG to RGB through ffmpeg (for QA only).
function decodeJpegRgb(buf, w, h) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', 'pipe:0', '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], { input: buf, maxBuffer: 1 << 28 });
  if (r.status !== 0 || r.stdout.length !== w * h * 3) throw new Error('ffmpeg jpeg decode failed');
  return new Uint8Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length);
}

module.exports = { readPng, encodePng, encodePngPalette, quantize, encodeJpeg, decodeJpegRgb, crc32 };
