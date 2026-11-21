// Pixel processing and atlas packing for prepare-art.js.
//   readPng(buf) -> { w, h, rgba }           8-bit gray, gray+alpha, RGB, RGBA and palette, non-interlaced
//   encodePng(w, h, rgba) -> Buffer           RGBA8, adaptive row filters, zlib level 9
//   encodeJpeg(w, h, rgb, q) -> Buffer        ffmpeg mjpeg (q is -q:v: 2 is high quality)
//   sampleMatte(img) -> { rgb, coverage, ... } the real key colour from the border ring
//   keyMatte(img, matte) -> { rgba, stats }    border flood + edge unmixing (alpha and despill) on the 1-px and 2-px rings
//   renderRegion(img, box, s) -> { w, h, rgba } area-average resample of a source box at s output px per source px (premultiplied)
//   bleed(rgba, w, h, passes)                   colour under zero alpha copied outward from opaque pixels (no alpha change)
//   packShelf(sizes) -> { width, height, pos } deterministic shelf packing, width chosen to minimise area
//   seamScore(lum, n) and lstarMean(rgb, n)    tile metrics
'use strict';
const { readPng, encodePng, encodePngPalette, quantize, encodeJpeg, decodeJpegRgb, crc32 } = require('./lib-art-codecs');

// ---------- colour helpers

function dist2(r, g, b, M) { const dr = r - M[0], dg = g - M[1], db = b - M[2]; return dr * dr + dg * dg + db * db; }

// Samples the real matte from the outer ring (ringPx wide). Returns the colour of the most common quantised bin, refined to
// its mean, plus the share of ring pixels that really are matte (coverage < 1 means something touches the frame edge).
function sampleMatte(img, ringPx) {
  const { w, h, rgba } = img;
  const ring = Math.max(1, Math.min(ringPx || 3, Math.floor(Math.min(w, h) / 8)));
  const hist = new Uint32Array(32768);
  const bin = (r, g, b) => ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
  const onRing = (x, y) => x < ring || y < ring || x >= w - ring || y >= h - ring;
  let n = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!onRing(x, y)) continue;
    const o = (y * w + x) * 4;
    hist[bin(rgba[o], rgba[o + 1], rgba[o + 2])]++;
    n++;
  }
  let best = 0;
  for (let k = 1; k < hist.length; k++) if (hist[k] > hist[best]) best = k;
  const br = ((best >> 10) << 3) + 4, bg = (((best >> 5) & 31) << 3) + 4, bb = ((best & 31) << 3) + 4;
  let sr = 0, sg = 0, sb = 0, c = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!onRing(x, y)) continue;
    const o = (y * w + x) * 4, r = rgba[o], g = rgba[o + 1], b = rgba[o + 2];
    if (dist2(r, g, b, [br, bg, bb]) <= 24 * 24) { sr += r; sg += g; sb += b; c++; }
  }
  const M = c ? [Math.round(sr / c), Math.round(sg / c), Math.round(sb / c)] : [br, bg, bb];
  let within = 0, spread = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!onRing(x, y)) continue;
    const o = (y * w + x) * 4;
    const d2 = dist2(rgba[o], rgba[o + 1], rgba[o + 2], M);
    if (d2 <= 44 * 44) within++;
    if (d2 <= 60 * 60 && Math.sqrt(d2) > spread) spread = Math.sqrt(d2);
  }
  return { rgb: M, ringPx: n, coverage: n ? within / n : 0, spread: Math.round(spread * 10) / 10 };
}

function cornerMeans(img, k) {
  const { w, h, rgba } = img, s = Math.min(k || 12, Math.floor(Math.min(w, h) / 4));
  const boxes = [[0, 0], [w - s, 0], [0, h - s], [w - s, h - s]];
  return boxes.map(([x0, y0]) => {
    let r = 0, g = 0, b = 0, c = 0;
    for (let y = y0; y < y0 + s; y++) for (let x = x0; x < x0 + s; x++) {
      const o = (y * w + x) * 4; r += rgba[o]; g += rgba[o + 1]; b += rgba[o + 2]; c++;
    }
    return [Math.round(r / c), Math.round(g / c), Math.round(b / c)];
  });
}

// Keys the matte out of an opaque image. Background = matte-coloured pixels connected to the frame border (flood, 4-way).
// Pixels of the same colour enclosed by the figure are kept. The 1-px ring next to the background gets alpha from unmixing
// the blend p = a*F + (1-a)*M, where F is the nearby figure colour (so the edge keeps its line colour and loses the matte);
// the 2-px ring gets colour-only unmixing. Returns RGBA with alpha; RGB under alpha 0 is left at 0 (bleed() fills it later).
function keyMatte(img, M, opt) {
  const T = (opt && opt.tolerance) || 44, T2 = T * T;
  const { w, h, rgba: src } = img, N = w * h;
  const bg = new Uint8Array(N), q = new Int32Array(N);
  let qh = 0, qt = 0;
  const near = i => { const o = i * 4; return dist2(src[o], src[o + 1], src[o + 2], M) <= T2; };
  const seed = i => { if (!bg[i] && near(i)) { bg[i] = 1; q[qt++] = i; } };
  for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { seed(y * w); seed(y * w + w - 1); }
  while (qh < qt) {
    const i = q[qh++], x = i % w, y = (i - x) / w;
    if (x > 0) seed(i - 1);
    if (x < w - 1) seed(i + 1);
    if (y > 0) seed(i - w);
    if (y < h - 1) seed(i + w);
  }
  // Enclosed pockets: matte-coloured regions sealed inside the figure (a gap between arm and body, or a hole through a broken
  // prop). The brief forbids the matte colour inside any figure, so these are cleared. Only exact-matte colour counts (within 20),
  // so pinks and purples stay. A region over 35% of the sheet would be a background, and stays and is reported as kept.
  const POCKET_TOL2 = 20 * 20, POCKET_MAX = Math.round(N * 0.35);
  let pockets = 0, keptEnclosed = 0;
  const seen = new Uint8Array(N), comp = new Int32Array(N);
  const tight = i => { const o = i * 4; return dist2(src[o], src[o + 1], src[o + 2], M) <= POCKET_TOL2; };
  for (let i0 = 0; i0 < N; i0++) {
    if (bg[i0] || seen[i0] || !tight(i0)) continue;
    let n = 0, head = 0;
    comp[n++] = i0; seen[i0] = 1;
    while (head < n) {
      const i = comp[head++], x = i % w, y = (i - x) / w;
      const nb = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1];
      for (const j of nb) if (j >= 0 && !seen[j] && !bg[j] && tight(j)) { seen[j] = 1; comp[n++] = j; }
      if (n > POCKET_MAX) break;
    }
    if (n <= POCKET_MAX) { for (let k = 0; k < n; k++) bg[comp[k]] = 1; pockets += n; }
    else keptEnclosed++;
  }
  const band = new Uint8Array(N);                       // 1: figure pixel touching the matte (4-way); 2: one further out
  let touchesEdge = 0, bgCount = 0;
  for (let i = 0; i < N; i++) if (bg[i]) bgCount++;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (bg[i]) continue;
    if ((x === 0 || y === 0 || x === w - 1 || y === h - 1)) touchesEdge++;
    if ((x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) || (y > 0 && bg[i - w]) || (y < h - 1 && bg[i + w])) band[i] = 1;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (bg[i] || band[i]) continue;
    if ((x > 0 && band[i - 1] === 1) || (x < w - 1 && band[i + 1] === 1) || (y > 0 && band[i - w] === 1) || (y < h - 1 && band[i + w] === 1)) band[i] = 2;
  }
  let enclosed = 0;
  for (let i = 0; i < N; i++) if (!bg[i] && !band[i] && near(i)) enclosed++;

  const out = new Uint8Array(N * 4);
  const F = [0, 0, 0];
  const estimateF = (x, y) => {
    for (const R of [2, 4]) {
      let r = 0, g = 0, b = 0, c = 0;
      for (let yy = Math.max(0, y - R); yy <= Math.min(h - 1, y + R); yy++) for (let xx = Math.max(0, x - R); xx <= Math.min(w - 1, x + R); xx++) {
        const j = yy * w + xx;
        if (bg[j] || band[j]) continue;
        const o = j * 4; r += src[o]; g += src[o + 1]; b += src[o + 2]; c++;
      }
      if (c) { F[0] = r / c; F[1] = g / c; F[2] = b / c; return true; }
    }
    return false;
  };
  // Solves p = a*F + (1-a)*M for a; returns null when the pixel is not explained by that blend.
  const unmix = (pr, pg, pb) => {
    const dR = F[0] - M[0], dG = F[1] - M[1], dB = F[2] - M[2];
    const dd = dR * dR + dG * dG + dB * dB;
    if (dd < 60 * 60) return null;
    let a = ((pr - M[0]) * dR + (pg - M[1]) * dG + (pb - M[2]) * dB) / dd;
    a = a < 0 ? 0 : a > 1 ? 1 : a;
    const er = pr - (M[0] + a * dR), eg = pg - (M[1] + a * dG), eb = pb - (M[2] + a * dB);
    if (Math.sqrt(er * er + eg * eg + eb * eb) > 48) return null;
    return a;
  };
  const stats = { bg: bgCount, band1: 0, band2: 0, pockets, keptEnclosed, enclosed, touchesEdge, fringe: 0 };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, o = i * 4;
    if (bg[i]) continue;                                 // alpha 0, colour bled later
    const pr = src[o], pg = src[o + 1], pb = src[o + 2];
    if (band[i] === 1) {
      stats.band1++;
      let a = 1;
      if (estimateF(x, y)) { const u = unmix(pr, pg, pb); if (u !== null) a = u; }
      if (a < 0.04) continue;                            // matte-coloured halo: transparent
      let cr = pr, cg = pg, cb = pb;
      if (a < 1) {
        cr = (pr - (1 - a) * M[0]) / a; cg = (pg - (1 - a) * M[1]) / a; cb = (pb - (1 - a) * M[2]) / a;
      }
      out[o] = clamp8(cr); out[o + 1] = clamp8(cg); out[o + 2] = clamp8(cb); out[o + 3] = Math.round(a * 255);
    } else {
      out[o] = pr; out[o + 1] = pg; out[o + 2] = pb; out[o + 3] = 255;
      if (band[i] === 2) {
        stats.band2++;
        if (estimateF(x, y)) {
          const u = unmix(pr, pg, pb);
          if (u !== null && u < 0.9) {
            const a = Math.max(u, 0.05);
            out[o] = clamp8((pr - (1 - a) * M[0]) / a); out[o + 1] = clamp8((pg - (1 - a) * M[1]) / a); out[o + 2] = clamp8((pb - (1 - a) * M[2]) / a);
          }
        }
      }
    }
  }
  // Despill fallback: an opaque edge pixel that is still matte-coloured takes the mean of its nearby figure colours
  // (or goes transparent when it has none). Only applied to pixels next to transparency, so interior colours are untouched.
  const fringeIdx = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, o = i * 4;
    if (out[o + 3] !== 255 || !nextToClear(out, w, h, x, y)) continue;
    if (dist2(out[o], out[o + 1], out[o + 2], M) <= 90 * 90) fringeIdx.push(i);
  }
  stats.fringe = fringeIdx.length;
  for (const i of fringeIdx) {
    const x = i % w, y = (i - x) / w;
    let r = 0, g = 0, b = 0, c = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy;
      if ((!dx && !dy) || xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
      const o2 = (yy * w + xx) * 4;
      if (out[o2 + 3] !== 255 || dist2(out[o2], out[o2 + 1], out[o2 + 2], M) <= 110 * 110) continue;
      r += out[o2]; g += out[o2 + 1]; b += out[o2 + 2]; c++;
    }
    const o = i * 4;
    if (c) { out[o] = Math.round(r / c); out[o + 1] = Math.round(g / c); out[o + 2] = Math.round(b / c); }
    else out[o + 3] = 0;
  }
  stats.fringeFixed = fringeIdx.length;
  return { rgba: out, w, h, stats };
}
function clamp8(v) { return v <= 0 ? 0 : v >= 255 ? 255 : Math.round(v); }
function nextToClear(a, w, h, x, y) {
  return (x > 0 && a[(y * w + x - 1) * 4 + 3] === 0) || (x < w - 1 && a[(y * w + x + 1) * 4 + 3] === 0) ||
    (y > 0 && a[((y - 1) * w + x) * 4 + 3] === 0) || (y < h - 1 && a[((y + 1) * w + x) * 4 + 3] === 0);
}

// Fringe count with a plain neighbour test (4-way), used by QA on keyed output.
function fringeCount(rgba, w, h, M) {
  let n = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = (y * w + x) * 4;
    if (rgba[o + 3] !== 255) continue;
    const near0 = (x > 0 && rgba[o - 1] === 0) || (x < w - 1 && rgba[o + 7] === 0) || (y > 0 && rgba[o - w * 4 + 3] === 0) || (y < h - 1 && rgba[o + w * 4 + 3] === 0);
    if (!near0) continue;
    if (dist2(rgba[o], rgba[o + 1], rgba[o + 2], M) <= 90 * 90) n++;
  }
  return n;
}

// Alpha bounding box with a threshold (alpha >= thr). Returns null when empty.
function alphaBox(rgba, w, h, thr) {
  const t = thr || 24;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    let row = false;
    for (let x = 0; x < w; x++) {
      if (rgba[(y * w + x) * 4 + 3] >= t) { row = true; if (x < x0) x0 = x; if (x > x1) x1 = x; }
    }
    if (row) { if (y < y0) y0 = y; y1 = y; }
  }
  if (x1 < 0) return null;
  return { x0, y0, x1: x1 + 1, y1: y1 + 1 };
}

// Lowest opaque row and the horizontal centre of the feet (the opaque extent of the lowest `band` rows).
function feetPivot(rgba, w, box, band) {
  const h = box.y1 - box.y0;
  const yb = box.y1 - 1;
  const top = Math.max(box.y0, yb - Math.max(3, Math.round(band)));
  let xmin = Infinity, xmax = -Infinity;
  for (let y = top; y <= yb; y++) for (let x = box.x0; x < box.x1; x++) {
    if (rgba[(y * w + x) * 4 + 3] >= 128) { if (x < xmin) xmin = x; if (x > xmax) xmax = x; }
  }
  if (xmin === Infinity) { xmin = box.x0; xmax = box.x1 - 1; }
  return { x: (xmin + xmax + 1) / 2, y: yb + 1, feetH: h };
}

// ---------- resampling

function axisWeights(n, s, d) {
  // dest j covers source [j/s, (j+1)/s) in box coordinates, clipped to [0, n); weights normalised to 1
  const idx = [], wt = [], start = new Int32Array(d + 1), cnt = new Int32Array(d);
  for (let j = 0; j < d; j++) {
    const a = j / s, b = Math.min((j + 1) / s, n);
    start[j] = idx.length;
    let tot = 0;
    const from = Math.floor(a), to = Math.max(from + 1, Math.ceil(b));
    for (let i = from; i < to && i < n; i++) {
      const ov = Math.min(b, i + 1) - Math.max(a, i);
      if (ov > 0) { idx.push(i); wt.push(ov); tot += ov; }
    }
    if (tot <= 0) { idx.push(Math.max(0, Math.min(n - 1, from))); wt.push(1); tot = 1; }   // past the source edge: repeat the last pixel
    for (let k = start[j]; k < idx.length; k++) wt[k] /= tot;
    cnt[j] = idx.length - start[j];
  }
  start[d] = idx.length;
  return { idx: Int32Array.from(idx), wt: Float64Array.from(wt), start, d };
}

// Area-average the box of img at scale s. Premultiplied so transparent colour never bleeds into edges.
function renderRegion(img, box, s) {
  const { w: sw, rgba } = img;
  const bw = box.x1 - box.x0, bh = box.y1 - box.y0;
  const dw = Math.max(1, Math.round(bw * s)), dh = Math.max(1, Math.round(bh * s));
  const ax = axisWeights(bw, s, dw), ay = axisWeights(bh, s, dh);
  const out = new Uint8Array(dw * dh * 4);
  for (let jy = 0; jy < dh; jy++) {
    for (let jx = 0; jx < dw; jx++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let ky = ay.start[jy]; ky < ay.start[jy + 1]; ky++) {
        const sy = box.y0 + ay.idx[ky], wy = ay.wt[ky];
        for (let kx = ax.start[jx]; kx < ax.start[jx + 1]; kx++) {
          const sx = box.x0 + ax.idx[kx], wgt = wy * ax.wt[kx];
          const o = (sy * sw + sx) * 4, al = rgba[o + 3] * wgt;
          r += rgba[o] * al; g += rgba[o + 1] * al; b += rgba[o + 2] * al; a += al;
        }
      }
      const d = (jy * dw + jx) * 4;
      if (a > 0) { out[d] = clamp8(r / a); out[d + 1] = clamp8(g / a); out[d + 2] = clamp8(b / a); }
      out[d + 3] = clamp8(a);
    }
  }
  return { w: dw, h: dh, rgba: out };
}

// Same as renderRegion for opaque images (alpha ignored, all output opaque).
function renderOpaque(img, box, s) {
  const { w: sw, rgba } = img;
  const bw = box.x1 - box.x0, bh = box.y1 - box.y0;
  const dw = Math.max(1, Math.round(bw * s)), dh = Math.max(1, Math.round(bh * s));
  const ax = axisWeights(bw, s, dw), ay = axisWeights(bh, s, dh);
  const out = new Uint8Array(dw * dh * 4);
  for (let jy = 0; jy < dh; jy++) for (let jx = 0; jx < dw; jx++) {
    let r = 0, g = 0, b = 0, t = 0;
    for (let ky = ay.start[jy]; ky < ay.start[jy + 1]; ky++) {
      const sy = box.y0 + ay.idx[ky], wy = ay.wt[ky];
      for (let kx = ax.start[jx]; kx < ax.start[jx + 1]; kx++) {
        const sx = box.x0 + ax.idx[kx], wgt = wy * ax.wt[kx];
        const o = (sy * sw + sx) * 4;
        r += rgba[o] * wgt; g += rgba[o + 1] * wgt; b += rgba[o + 2] * wgt; t += wgt;
      }
    }
    const d = (jy * dw + jx) * 4;
    out[d] = clamp8(r / t); out[d + 1] = clamp8(g / t); out[d + 2] = clamp8(b / t); out[d + 3] = 255;
  }
  return { w: dw, h: dh, rgba: out };
}

// Copies colour outward into zero-alpha pixels (passes steps). Alpha is never changed.
function bleed(rgba, w, h, passes) {
  const filled = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) if (rgba[i * 4 + 3] > 0) filled[i] = 1;
  for (let p = 0; p < passes; p++) {
    const todo = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (filled[i]) continue;
      let r = 0, g = 0, b = 0, c = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const j = yy * w + xx;
        if (!filled[j]) continue;
        const o = j * 4; r += rgba[o]; g += rgba[o + 1]; b += rgba[o + 2]; c++;
      }
      if (c) todo.push(i, Math.round(r / c), Math.round(g / c), Math.round(b / c));
    }
    for (let k = 0; k < todo.length; k += 4) {
      const i = todo[k], o = i * 4;
      rgba[o] = todo[k + 1]; rgba[o + 1] = todo[k + 2]; rgba[o + 2] = todo[k + 3]; filled[i] = 1;
    }
    if (!todo.length) break;
  }
  return rgba;
}

// Copies a frame into a new RGBA with a gutter of zero alpha on each side, colour bled into the gutter.
function withGutter(img, g) {
  const w = img.w + 2 * g, h = img.h + 2 * g;
  const out = new Uint8Array(w * h * 4);
  for (let y = 0; y < img.h; y++) out.set(img.rgba.subarray(y * img.w * 4, (y + 1) * img.w * 4), ((y + g) * w + g) * 4);
  bleed(out, w, h, g + 2);
  return { w, h, rgba: out };
}

// Shelf packing. sizes: [{w,h}]. Tries widths from the widest item upwards and keeps the one with the smallest area.
function packShelf(sizes) {
  const order = sizes.map((s, i) => i).sort((a, b) => sizes[b].h - sizes[a].h || sizes[b].w - sizes[a].w || a - b);
  const maxW = Math.max(...sizes.map(s => s.w));
  let best = null;
  for (let W = maxW; W <= maxW + 1536; W += 16) {
    const pos = new Array(sizes.length);
    let x = 0, y = 0, rowH = 0, H = 0;
    for (const i of order) {
      const s = sizes[i];
      if (x + s.w > W) { y += rowH; x = 0; rowH = 0; }
      pos[i] = { x, y };
      x += s.w; if (s.h > rowH) rowH = s.h;
      if (y + rowH > H) H = y + rowH;
    }
    const area = W * H;
    if (!best || area < best.area) best = { width: W, height: H, pos, area };
  }
  return { width: best.width, height: best.height, pos: best.pos };
}

// Pastes a padded frame into an atlas (in place).
function blit(atlas, aw, src, dx, dy) {
  for (let y = 0; y < src.h; y++) atlas.set(src.rgba.subarray(y * src.w * 4, (y + 1) * src.w * 4), ((dy + y) * aw + dx) * 4);
}

// ---------- metrics

function lumaOf(rgb, n) {
  const Y = new Float32Array(n);
  for (let i = 0; i < n; i++) Y[i] = 0.2126 * rgb[i * 3] + 0.7152 * rgb[i * 3 + 1] + 0.0722 * rgb[i * 3 + 2];
  return Y;
}
// Seam score for a square tile: mean |opposite edge| difference over mean |adjacent interior| difference. About 1 for a
// seamless texture (the wrap is just another neighbour step); well above 1 when the wrap shows a seam.
function seamScore(rgb, n) {
  const Y = lumaOf(rgb, n * n);
  let eH = 0, eV = 0, iH = 0, iV = 0;
  for (let y = 0; y < n; y++) {
    eH += Math.abs(Y[y * n + n - 1] - Y[y * n]);
    for (let x = 0; x < n - 1; x++) iH += Math.abs(Y[y * n + x + 1] - Y[y * n + x]);
  }
  for (let x = 0; x < n; x++) {
    eV += Math.abs(Y[(n - 1) * n + x] - Y[x]);
    for (let y = 0; y < n - 1; y++) iV += Math.abs(Y[(y + 1) * n + x] - Y[y * n + x]);
  }
  const E = (eH + eV) / (2 * n), I = (iH + iV) / (2 * n * (n - 1));
  return Math.round((E / Math.max(I, 0.5)) * 100) / 100;
}
function lstar(v) { const t = v / 255; const lin = t <= 0.04045 ? t / 12.92 : Math.pow((t + 0.055) / 1.055, 2.4); return lin; }
function lstarMean(rgb, n) {
  let s = 0;
  for (let i = 0; i < n; i++) {
    const Y = 0.2126 * lstar(rgb[i * 3]) + 0.7152 * lstar(rgb[i * 3 + 1]) + 0.0722 * lstar(rgb[i * 3 + 2]);
    s += Y > 0.008856 ? 116 * Math.cbrt(Y) - 16 : 903.3 * Y;
  }
  return Math.round((s / n) * 10) / 10;
}

// Reads an image file as RGBA (RGB sources get alpha 255).
function loadRgba(buf) { return readPng(buf); }

module.exports = {
  readPng, encodePng, encodePngPalette, quantize, encodeJpeg, decodeJpegRgb, crc32, sampleMatte, cornerMeans, keyMatte, fringeCount, alphaBox,
  feetPivot, renderRegion, renderOpaque, bleed, withGutter, packShelf, blit, seamScore, lstarMean, loadRgba, dist2,
};
