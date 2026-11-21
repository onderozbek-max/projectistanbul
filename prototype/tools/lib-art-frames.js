// Source selection, matte removal, frame pivots and RGBA atlas packing for prepare-art.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const L = require('./lib-art-image.js');
const ROOT = path.join(__dirname, '..', '..');

// All tunables. Changing any of them changes the recipe hash, so the cache rebuilds.
const C = {
  heightPx: { hero: 160, enemy: 128, boss: 256 },            // idle heights cover the largest expected phone backing-store sprites
  // Match head and body proportions between each boss's locomotion and action sheets.
  // One correction for the whole action sheet preserves its crouches, lunges and falls.
  bossActionScale: { boss_vatman: 1.13, boss_guide: 1.43, boss_bride: 1.38, boss_bloater: 1.47,
    boss_taksici: 1.36, boss_kasap: 1.57, boss_spitter: 1.49, boss_docent: 1.39,
    boss_antiquarian: 1.68, boss_keeper: 1.40, boss_bigbro: 1.24 },
  scale: { ground: 0.5, facade: 0.5, prop: 0.5, tier: 0.5, icon: 0.25, evo: 0.25, sprite: 0.5, vehicle: 0.5 },
  gutter: 2,                                                  // transparent px around every frame (edge-bled)
  figureAlpha: 24,                                            // alpha at or above this counts as figure for the box
  feetBand: 0.03,                                             // feet = the lowest 3% of the figure height
  jpegQ: 3,                                                   // ffmpeg mjpeg -q:v (about libjpeg 88)
  paletteMaxOver8: 0.12,                                      // palette PNG only when at most this share of solid px is off by > 8 levels
  seamPoor: 2.0,                                              // seam score above this is reported as poor
  lstarMin: 30, lstarMax: 75,                                 // readability floor for the mean L* of a tile
  upscaleWarn: 1.05,                                          // an entity enlarged by more than this is reported
  matteTol: 60,                                               // a sampled matte within this of the inventory key is accepted
  handwired: ['galata', 'bridge', 'saray'],                   // hoods with hand-wired atlases in prototype/assets/<hood>/
  transparentSheets: ['kumkapi'],                             // props from prop_<hood>_<item>_transparent.png (2x2 sheets)
  transparentFrames: ['atakoysahil'],                         // props from transparent/prop_<hood>_<item>_<suffix>.png (cells)
};
const KEY = { magenta: [255, 0, 255], cyan: [0, 255, 255] };
const KEY_NAMES = [['#FF00FF', KEY.magenta], ['#00FFFF', KEY.cyan]];

const round1 = v => Math.round(v * 10) / 10;
const round4 = v => Math.round(v * 10000) / 10000;
const relPath = p => path.relative(ROOT, p).split(path.sep).join('/');
class Reject extends Error {}
const reject = msg => { throw new Reject(msg); };

function calibrateBossFrames(id, frames) {
  const poseScale = C.bossActionScale[id];
  if (!Number.isFinite(poseScale) || poseScale <= 0) reject(`${id}: calibrate the action sheet against the idle drawing`);
  for (const pose of ['attack_windup', 'attack_hit', 'hurt', 'dead']) {
    if (!frames[pose]) reject(`${id}: missing ${pose} frame`);
    frames[pose].poseScale = poseScale;
  }
}

// ---------- source files and keying

// A -v2 file wins when it exists (the handoff's preferred vehicles and Beyazıt façades).
function srcFile(p) {
  const abs = path.isAbsolute(p.path) ? p.path : path.join(ROOT, p.path);
  const v2 = abs.replace(/\.png$/, '-v2.png');
  return fs.existsSync(v2) ? v2 : abs;
}
function readRgba(file) {
  if (!fs.existsSync(file)) reject('missing file ' + relPath(file));
  return L.readPng(fs.readFileSync(file));
}
function nearestKey(rgb) {
  let best = null;
  for (const [name, c] of KEY_NAMES) {
    const d = Math.sqrt(L.dist2(rgb[0], rgb[1], rgb[2], c));
    if (!best || d < best.d) best = { name, d, c };
  }
  return best;
}
// Loads a source and keys its matte out. Opaque sources: the matte is sampled from the frame border (the real colour, not the
// nominal one). Sources that already carry alpha (derivatives and frames): alpha-0 pixels are flattened onto the key first, so
// the same keyer gives them soft, despilled edges.
function loadKeyed(file, opts, ctx) {
  const img = readRgba(file);
  const target = opts.target || KEY.magenta;
  const info = {};
  let M;
  if (opts.transparent) {
    let flat = 0, notKey = 0;
    for (let i = 0; i < img.w * img.h; i++) {
      const o = i * 4;
      if (img.rgba[o + 3] !== 0) continue;
      flat++;
      if (L.dist2(img.rgba[o], img.rgba[o + 1], img.rgba[o + 2], target) > 60 * 60) notKey++;
      img.rgba[o] = target[0]; img.rgba[o + 1] = target[1]; img.rgba[o + 2] = target[2]; img.rgba[o + 3] = 255;
    }
    M = target;
    info.flattened = flat;
    info.notKeyShare = flat ? Math.round(notKey / flat * 100) / 100 : 0;
  } else {
    const s = L.sampleMatte(img, 3);
    M = s.rgb;
    info.coverage = s.coverage;
    if (s.coverage < 0.5) reject(`${path.basename(file)}: matte not found on the frame border (coverage ${s.coverage.toFixed(2)})`);
    const d = Math.sqrt(L.dist2(M[0], M[1], M[2], target));
    if (d > C.matteTol) {
      const near = nearestKey(M);
      if (near.d > C.matteTol) reject(`${path.basename(file)}: matte ${M.join(',')} matches neither key (target ${target.join(',')})`);
      ctx.warn(`${path.basename(file)}: matte is ${near.name} (sampled ${M.join(',')}), not the inventory key; used the sampled colour`);
    }
  }
  const k = L.keyMatte(img, M);
  info.matte = M;
  info.stats = k.stats;
  return { w: img.w, h: img.h, rgba: k.rgba, info };
}
function cellOf(img, rect) {
  const [x, y, w, h] = rect ? rect : [0, 0, img.w, img.h];
  if (x < 0 || y < 0 || x + w > img.w || y + h > img.h) reject(`cell ${[x, y, w, h].join(',')} lies outside a ${img.w}x${img.h} source`);
  const out = new Uint8Array(w * h * 4);
  for (let r = 0; r < h; r++) out.set(img.rgba.subarray(((y + r) * img.w + x) * 4, ((y + r) * img.w + x + w) * 4), r * w * 4);
  return { w, h, rgba: out };
}
function boxOrReject(cell, what) {
  const box = L.alphaBox(cell.rgba, cell.w, cell.h, C.figureAlpha);
  if (!box) reject(`${what}: no figure in the cell`);
  return box;
}

// ---------- frames and atlases

// One frame at scale s. The figure box is rendered at s; the pivot is in content pixels, relative to the content top-left.
//   feet / bottom: centre of the lowest 3% of the figure, on its bottom edge (ground contact)
//   body:          centre of the figure box (dead, down, flying)
//   centre:        the source cell centre (weapons, sprites): the same point in every cell of a sheet
function makeFrame(cell, box, s, anchor) {
  const content = L.renderRegion(cell, box, s);
  const bw = box.x1 - box.x0, bh = box.y1 - box.y0;
  let px, py;
  if (anchor === 'feet' || anchor === 'bottom') {
    const f = L.feetPivot(cell.rgba, cell.w, box, Math.max(3, Math.round(bh * C.feetBand)));
    px = (f.x - box.x0) * s; py = bh * s;
  } else if (anchor === 'body') {
    px = bw * s / 2; py = bh * s / 2;
  } else if (anchor === 'centre') {
    px = (cell.w / 2 - box.x0) * s; py = (cell.h / 2 - box.y0) * s;
  } else throw new Error('unknown anchor ' + anchor);
  const touches = box.x0 === 0 || box.y0 === 0 || box.x1 === cell.w || box.y1 === cell.h;
  return { content, px: round1(px), py: round1(py), anchor, touches };
}
// Packs frames into one atlas. Every frame gets C.gutter transparent px on each side, filled with bled colour.
// usePalette: try an 8-bit palette PNG (median cut, 256 entries, alpha in tRNS); kept only when its colour error is small.
function buildAtlas(frames, usePalette) {
  const g = C.gutter;
  const padded = frames.map(f => L.withGutter(f.content, g));
  const pk = L.packShelf(padded.map(p => ({ w: p.w, h: p.h })));
  const atlas = new Uint8Array(pk.width * pk.height * 4);
  const rects = {};
  frames.forEach((f, i) => {
    L.blit(atlas, pk.width, padded[i], pk.pos[i].x, pk.pos[i].y);
    rects[f.key] = { x: pk.pos[i].x + g, y: pk.pos[i].y + g, w: f.content.w, h: f.content.h, px: f.px, py: f.py, anchor: f.anchor };
  });
  if (usePalette) {
    const q = L.quantize(atlas, pk.width, pk.height, 256);
    if (q.err.over8 <= C.paletteMaxOver8) return { width: pk.width, height: pk.height, png: L.encodePngPalette(pk.width, pk.height, q.indices, q.palette), encoding: 'png8', err: q.err, rects };
    return { width: pk.width, height: pk.height, png: L.encodePng(pk.width, pk.height, atlas), encoding: 'png32', err: q.err, rects };
  }
  return { width: pk.width, height: pk.height, png: L.encodePng(pk.width, pk.height, atlas), encoding: 'png32', err: null, rects };
}

module.exports = { C, KEY, Reject, reject, relPath, round1, round4, srcFile, readRgba, loadKeyed, cellOf, boxOrReject, makeFrame, buildAtlas, calibrateBossFrames };
