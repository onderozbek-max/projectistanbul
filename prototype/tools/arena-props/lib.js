// R1-T3 authored props (D-057): small SVG toolkit shared by the per-hood prop files.
// Units are metres. A prop is drawn in a local frame whose origin is the footprint centre (x right, y down the screen),
// in the same 3/4 view as the game's blocks: the top face sits hg above the footprint, the front face fills the gap below it.
// Style matches the authored ground: night_ink outlines, a warm highlight on the top-left edges, a cool shade on the bottom-right.
'use strict';
const INK = '#14151F', WARM = '#E9C88B', COOL = '#2B3050', LW = 0.03;
const f = n => (Math.round(n * 1000) / 1000).toString();

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const st = (fill, o) => `fill="${fill || 'none'}"` + (o && o.ink === 0 ? '' : ` stroke="${(o && o.ink) || INK}" stroke-width="${f((o && o.lw) || LW)}" stroke-linejoin="round" stroke-linecap="round"`) + (o && o.op ? ` opacity="${o.op}"` : '');
const rect = (x, y, w, h, fill, o) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"${o && o.rx ? ` rx="${f(o.rx)}"` : ''} ${st(fill, o)}/>`;
const ell = (cx, cy, rx, ry, fill, o) => `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" ${st(fill, o)}/>`;
const line = (x0, y0, x1, y1, col, w, o) => `<path d="M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}" fill="none" stroke="${col || INK}" stroke-width="${f(w || LW)}" stroke-linecap="round"${o && o.op ? ` opacity="${o.op}"` : ''}/>`;
const poly = (pts, fill, o) => `<path d="M${pts.map(p => f(p[0]) + ' ' + f(p[1])).join('L')}Z" ${st(fill, o)}/>`;
const path = (d, fill, o) => `<path d="${d}" ${st(fill, o)}/>`;

// Top-left highlight and bottom-right shade on a rectangle (x, y, w, h).
function edges(x, y, w, h, o) {
  const k = (o && o.k) || 1, i = LW * 0.9;
  return `<path d="M${f(x + i)} ${f(y + h - i)}L${f(x + i)} ${f(y + i)}L${f(x + w - i)} ${f(y + i)}" fill="none" stroke="${WARM}" stroke-opacity="${0.55 * k}" stroke-width="${f(LW * 1.1)}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="M${f(x + w - i)} ${f(y + i * 2)}L${f(x + w - i)} ${f(y + h - i)}L${f(x + i * 2)} ${f(y + h - i)}" fill="none" stroke="${COOL}" stroke-opacity="${0.5 * k}" stroke-width="${f(LW * 1.5)}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// 3/4 block at footprint centre (cx, cy): front face under the top face, as P.Props.h.box.
function box(cx, cy, w, d, hg, top, front, o) {
  const x0 = cx - w / 2, yb = cy + d / 2, yt = yb - d - hg;
  return rect(x0, yb - hg, w, hg, front, o) + rect(x0, yt, w, d, top, o) + edges(x0, yt, w, d + hg, o);
}

// Upright cylinder at footprint centre: body, base arc, top ellipse.
function drum(cx, cy, r, ry, hg, top, side, o) {
  const yb = cy, yt = cy - hg;
  return `<path d="M${f(cx - r)} ${f(yt)}L${f(cx - r)} ${f(yb)}A${f(r)} ${f(ry)} 0 0 0 ${f(cx + r)} ${f(yb)}L${f(cx + r)} ${f(yt)}Z" ${st(side, o)}/>` +
    ell(cx, yt, r, ry, top, o) +
    `<path d="M${f(cx - r * 0.72)} ${f(yt + ry * 0.55)}A${f(r * 0.8)} ${f(ry * 0.8)} 0 0 1 ${f(cx + r * 0.1)} ${f(yt - ry * 0.8)}" fill="none" stroke="${WARM}" stroke-opacity="0.5" stroke-width="${f(LW)}" stroke-linecap="round"/>`;
}

// A wheel seen from above and slightly forward: dark tyre with a pale hub.
const wheel = (cx, cy, r) => ell(cx, cy, r * 0.55, r, '#1E1F25') + ell(cx, cy, r * 0.2, r * 0.4, '#8B93A3', { lw: LW * 0.6 });

// Simit ring from above: gold ring with a darker hole and sesame dots.
function simit(cx, cy, r, r2) {
  const ry = r2 || r * 0.8;
  let s = ell(cx, cy, r, ry, '#E4A93B') + ell(cx, cy, r * 0.38, ry * 0.38, '#7A4A1C', { lw: LW * 0.6 });
  for (let i = 0; i < 5; i++) { const a = i * 1.26 + cx * 9; s += `<circle cx="${f(cx + Math.cos(a) * r * 0.7)}" cy="${f(cy + Math.sin(a) * ry * 0.7)}" r="0.012" fill="#FFF3C9"/>`; }
  return s;
}

// A short tea glass (tulip): saucer, amber glass, bright rim.
const tea = (cx, cy) => ell(cx, cy + 0.015, 0.07, 0.035, '#C0392B', { lw: LW * 0.7 }) + path(`M${f(cx - 0.035)} ${f(cy)}Q${f(cx - 0.012)} ${f(cy - 0.05)} ${f(cx - 0.03)} ${f(cy - 0.1)}L${f(cx + 0.03)} ${f(cy - 0.1)}Q${f(cx + 0.012)} ${f(cy - 0.05)} ${f(cx + 0.035)} ${f(cy)}Z`, '#B5401D', { lw: LW * 0.7 }) + line(cx - 0.03, cy - 0.1, cx + 0.03, cy - 0.1, '#FFE2A8', LW);

// Build one prop. bb = [x0, y0, x1, y1] metres around the footprint centre; body = SVG in the local frame.
function prop(kind, fw, fd, bb, body, extra) {
  const pad = 0.05, x0 = bb[0] - pad, y0 = bb[1] - pad, w = bb[2] - bb[0] + 2 * pad, h = bb[3] - bb[1] + 2 * pad;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f(x0)} ${f(y0)} ${f(w)} ${f(h)}" width="${f(w * 100)}" height="${f(h * 100)}">${body}</svg>`;
  return Object.assign({ kind, fw, fd, w: +f(w), h: +f(h), ax: +f(-x0), ay: +f(-y0), svg }, extra || {});
}

module.exports = { INK, WARM, COOL, LW, f, rng, rect, ell, line, poly, path, edges, box, drum, wheel, simit, tea, prop };
