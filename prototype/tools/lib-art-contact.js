// Optional visual QA sheets for the character importer.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const L = require('./lib-art-image.js');

// Contact sheets for the characters: each entity in light and dark rows, a red cross at the pivot.
function writeContactSheets(dir, dst, characters) {
  fs.mkdirSync(dir, { recursive: true });
  const bgs = [[244, 235, 221], [20, 21, 31]];
  const entities = Object.values(characters);
  const cell = 260, pad = 10, perRow = 9;
  for (let i = 0; i < entities.length; i += 3) {
    const group = entities.slice(i, i + 3).map(e => {
      const img = L.readPng(fs.readFileSync(path.join(dst, e.atlas)));
      const fr = e.views ? [...Object.values(e.views).flatMap(v => Object.values(v.frames)), ...Object.values(e.poses)] : Object.values(e.frames);
      // Keep every pose of a boss at the same preview magnification so scale errors show up here.
      const bossZoom = e.kind === 'boss' ? (cell - 24) / Math.max(...fr.map(f =>
        Math.max(2 * f.px, 2 * (f.w - f.px), f.h) * (f.poseScale || 1))) : null;
      return { img, fr, bossZoom };
    });
    const rowsOf = g => Math.ceil(g.fr.length / perRow) * 2;
    const H = pad + group.reduce((a, g) => a + rowsOf(g) * (cell + pad) + 30, 0) + pad;
    const W = pad + perRow * (cell + pad);
    const canvas = new Uint8Array(W * H * 4);
    for (let p = 0; p < W * H; p++) canvas.set([40, 42, 52, 255], p * 4);
    let y = pad;
    for (const g of group) {
      y += 22;
      const chunks = Math.ceil(g.fr.length / perRow);
      for (let c = 0; c < chunks; c++) {
        for (let b = 0; b < 2; b++) {
          const rowY = y + (c * 2 + b) * (cell + pad);
          g.fr.slice(c * perRow, c * perRow + perRow).forEach((f, k) => paintFrame(canvas, W, g.img, f, pad + k * (cell + pad), rowY, cell, bgs[b], g.bossZoom));
        }
      }
      y += rowsOf(g) * (cell + pad) + 8;
    }
    fs.writeFileSync(path.join(dir, `characters_${String(i / 3 + 1).padStart(2, '0')}.png`), L.encodePng(W, H, canvas));
  }
}
function paintFrame(canvas, W, img, fr, x0, y0, cell, bg, bossZoom) {
  for (let y = 0; y < cell; y++) for (let x = 0; x < cell; x++) {
    const o = ((y0 + y) * W + x0 + x) * 4;
    canvas[o] = bg[0]; canvas[o + 1] = bg[1]; canvas[o + 2] = bg[2]; canvas[o + 3] = 255;
  }
  const sc = bossZoom ? bossZoom * (fr.poseScale || 1) : Math.min(1, (cell - 24) / Math.max(fr.w, fr.h));
  const dw = Math.max(1, Math.round(fr.w * sc)), dh = Math.max(1, Math.round(fr.h * sc));
  const ox = x0 + Math.round(bossZoom ? cell / 2 - fr.px * sc : (cell - dw) / 2), oy = y0 + cell - 12 - dh;
  for (let y = 0; y < dh; y++) for (let x = 0; x < dw; x++) {
    const si = ((fr.y + Math.min(fr.h - 1, Math.floor(y / sc))) * img.w + fr.x + Math.min(fr.w - 1, Math.floor(x / sc))) * 4;
    const a = img.rgba[si + 3] / 255, o = ((oy + y) * W + ox + x) * 4;
    for (let c = 0; c < 3; c++) canvas[o + c] = Math.round(img.rgba[si + c] * a + canvas[o + c] * (1 - a));
  }
  const px = ox + Math.round(fr.px * sc), py = oy + Math.round(fr.py * sc);
  for (let d = -7; d <= 7; d++) { setPx(canvas, W, px + d, py, [255, 60, 60]); setPx(canvas, W, px, py + d, [255, 60, 60]); }
  const gy = oy + dh;
  for (let x = ox - 4; x < ox + dw + 4; x++) setPx(canvas, W, x, gy, [255, 210, 80]);
}
function setPx(c, W, x, y, rgb) {
  if (x < 0 || y < 0 || x >= W) return;
  const o = (y * W + x) * 4;
  if (o + 3 < c.length) { c[o] = rgb[0]; c[o + 1] = rgb[1]; c[o + 2] = rgb[2]; c[o + 3] = 255; }
}

module.exports = { writeContactSheets };
