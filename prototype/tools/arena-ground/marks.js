// R1-T3 floor details: one small, sparse mark set per hood so neighbours with the same surface type still read differently.
// Each returns SVG for a W x H tile, given the tile's seeded rng. Marks stay clear of the tile edges (the tile repeats), are low
// contrast so sprites stay readable on top, and never draw a hatch, grate or cover (D-058: nothing in the floor opens).
'use strict';
const { INK, f } = require('./lib.js');

const el = (x, y, rx, ry, fill, op, rot) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}" fill-opacity="${op}"${rot ? ` transform="rotate(${rot} ${f(x)} ${f(y)})"` : ''}/>`;
const at = (r, W, H, pad) => [pad + r() * (W - 2 * pad), pad + r() * (H - 2 * pad)];
const line = (x0, y0, x1, y1, col, w, op, dash) => `<path d="M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-opacity="${op}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
const poly = (pts, fill, op) => `<path d="M${pts.map(p => f(p[0]) + ' ' + f(p[1])).join('L')}Z" fill="${fill}" fill-opacity="${op}" stroke="${INK}" stroke-width="0.025" stroke-opacity="0.7" stroke-linejoin="round"/>`;

// A wet patch: dark pool with a pale sheen on its upper left.
function puddle(r, W, H, tint) {
  const [x, y] = at(r, W, H, 0.6), rx = 0.3 + r() * 0.3, ry = rx * (0.4 + r() * 0.2);
  return el(x, y, rx, ry, '#0F1420', 0.3) + el(x, y, rx, ry, tint, 0.2) + el(x - rx * 0.25, y - ry * 0.3, rx * 0.45, ry * 0.3, '#E8F0F8', 0.22);
}
// Flattened cardboard scrap.
function carton(r, W, H) {
  const [x, y] = at(r, W, H, 0.5), w = 0.28 + r() * 0.2, h = 0.2 + r() * 0.15, a = r() * 3;
  const pts = [[-w, -h], [w, -h * 0.8], [w * 0.9, h], [-w * 0.8, h * 0.9]].map(p => [x + p[0] * Math.cos(a) - p[1] * Math.sin(a), y + p[0] * Math.sin(a) + p[1] * Math.cos(a)]);
  return poly(pts, '#A8845A', 0.85) + line(pts[0][0], pts[0][1], pts[2][0], pts[2][1], '#7A5A38', 0.02, 0.6);
}
// Plane-tree leaf.
function leaf(r, W, H, col) {
  const [x, y] = at(r, W, H, 0.4), s = 0.09 + r() * 0.05, a = r() * 360;
  return `<path transform="rotate(${a.toFixed(0)} ${f(x)} ${f(y)})" d="M${f(x - s)} ${f(y)}Q${f(x)} ${f(y - s * 0.9)} ${f(x + s)} ${f(y)}Q${f(x)} ${f(y + s * 0.9)} ${f(x - s)} ${f(y)}Z" fill="${col}" fill-opacity="0.85" stroke="${INK}" stroke-width="0.015" stroke-opacity="0.6"/>`;
}

const n = (W, H, per) => Math.max(1, Math.round(W * H / 16 * per));
const MARKS = {
  // Karaköy: two coral painted quay lines, dashed, and wet patches from the harbour.
  karakoy: (r, W, H) => { let b = line(W * 0.25, 0, W * 0.25, H, '#E07A5F', 0.07, 0.55, '0.5 0.35') + line(W * 0.75, 0, W * 0.75, H, '#E07A5F', 0.07, 0.55, '0.5 0.35'); for (let i = 0; i < n(W, H, 1.2); i++) b += puddle(r, W, H, '#3B6E8C'); return b; },
  // Laleli: cardboard scraps and tyre marks.
  laleli: (r, W, H) => { let b = ''; for (let i = 0; i < n(W, H, 1.1); i++) b += carton(r, W, H);
    for (let k = 0; k < n(W, H, 0.3); k++) { const x = 0.6 + r() * (W - 1.6), y = r() * (H - 3), bend = (r() - 0.5) * 0.8;
      b += `<path d="M${f(x)} ${f(y)}Q${f(x + bend)} ${f(y + 1.4)} ${f(x - bend * 0.3)} ${f(y + 3)}M${f(x + 0.32)} ${f(y)}Q${f(x + 0.32 + bend)} ${f(y + 1.4)} ${f(x + 0.32 - bend * 0.3)} ${f(y + 3)}" fill="none" stroke="${INK}" stroke-width="0.07" stroke-opacity="0.22" stroke-linecap="round"/>`; }
    return b; },
  // Yenikapı: yellow and ink hazard patches and timber offcuts, worksite debris.
  yenikapi: (r, W, H) => { let b = '';
    for (let k = 0; k < n(W, H, 0.45); k++) { const [x, y] = at(r, W, H, 1.0); b += `<g transform="translate(${f(x)} ${f(y)}) rotate(${(r() * 40 - 20).toFixed(0)})"><rect width="1.5" height="0.42" fill="#C9A227" fill-opacity="0.8" stroke="${INK}" stroke-width="0.03"/>`;
      for (let i = 0; i < 7; i++) b += `<path d="M${f(i * 0.22 + 0.02)} 0.42L${f(i * 0.22 + 0.2)} 0L${f(i * 0.22 + 0.3)} 0L${f(i * 0.22 + 0.12)} 0.42Z" fill="${INK}" fill-opacity="0.75"/>`; b += '</g>'; }
    for (let i = 0; i < n(W, H, 1.0); i++) { const [x, y] = at(r, W, H, 0.7); b += `<rect x="${f(x)}" y="${f(y)}" width="0.7" height="0.12" rx="0.02" fill="#8A6038" stroke="${INK}" stroke-width="0.025" transform="rotate(${(r() * 180).toFixed(0)} ${f(x)} ${f(y)})"/>`; }
    return b; },
  // Eminönü: wet patches and silver fish scales.
  eminonu: (r, W, H) => { let b = puddle(r, W, H, '#3B6E8C') + puddle(r, W, H, '#3B6E8C'); for (let i = 0; i < 16; i++) { const [x, y] = at(r, W, H, 0.3); b += el(x, y, 0.025, 0.014, '#DDE6EE', 0.8, (r() * 180) | 0); } return b; },
  // Samatya: a worn, lighter path down the lane and dawn-pink petals.
  samatya: (r, W, H) => { let b = `<rect x="1.3" y="0" width="1.4" height="${H}" fill="#E9DCC4" fill-opacity="0.07"/>`; for (let i = 0; i < 12; i++) { const [x, y] = at(r, W, H, 0.3); b += el(x, y, 0.045, 0.025, '#E7A6A0', 0.85, (r() * 180) | 0); } return b; },
  // Kumkapı: wet stone with lantern reflections (warm red and gold streaks) and melted-ice patches.
  kumkapi: (r, W, H) => { let b = puddle(r, W, H, '#3B6E8C') + puddle(r, W, H, '#3B6E8C'); for (let i = 0; i < 3; i++) { const [x, y] = at(r, W, H, 0.7); b += line(x, y, x + 0.04, y + 0.5, i % 2 ? '#C9A227' : '#B5372E', 0.05, 0.4); } return b; },
  // Beyazıt: plane leaves and a few pigeon feathers.
  beyazit: (r, W, H) => { let b = ''; for (let i = 0; i < 9; i++) b += leaf(r, W, H, i % 3 ? '#7A9A4A' : '#B08A3A'); for (let i = 0; i < 3; i++) { const [x, y] = at(r, W, H, 0.4); b += el(x, y, 0.1, 0.02, '#D8DCE2', 0.8, (r() * 180) | 0); } return b; },
  // Sirkeci: a yellow tactile guide strip, dotted, down the lane.
  sirkeci: (r, W, H) => { let b = `<rect x="1.85" y="0" width="0.3" height="${H}" fill="#C9A227" fill-opacity="0.6" stroke="${INK}" stroke-width="0.02" stroke-opacity="0.6"/>`; for (let y = 0.15; y < H; y += 0.3) for (let x = 1.93; x < 2.1; x += 0.12) b += `<circle cx="${f(x)}" cy="${f(y)}" r="0.025" fill="#F3DC8B" fill-opacity="0.8"/>`; return b; },
  // Bakırköy: school-yard hopscotch in chalk, and a chalk star.
  bakirkoy: (r, W, H) => { const C = '#F2EEE4', sq = (x, y) => `<rect x="${f(x)}" y="${f(y)}" width="0.42" height="0.42" fill="none" stroke="${C}" stroke-opacity="0.75" stroke-width="0.04" stroke-linejoin="round"/>`;
    const hop = (x, y) => sq(x, y) + sq(x - 0.4, y + 0.45) + sq(x + 0.4, y + 0.45) + sq(x, y + 0.9) + sq(x - 0.4, y + 1.35) + sq(x + 0.4, y + 1.35) + sq(x, y + 1.8);
    const star = (x, y) => `<path d="M${f(x)} ${f(y)}L${f(x + 0.07)} ${f(y + 0.18)}L${f(x + 0.27)} ${f(y + 0.2)}L${f(x + 0.11)} ${f(y + 0.32)}L${f(x + 0.17)} ${f(y + 0.52)}L${f(x)} ${f(y + 0.4)}L${f(x - 0.17)} ${f(y + 0.52)}L${f(x - 0.11)} ${f(y + 0.32)}L${f(x - 0.27)} ${f(y + 0.2)}L${f(x - 0.07)} ${f(y + 0.18)}Z" fill="none" stroke="${C}" stroke-opacity="0.75" stroke-width="0.035" stroke-linejoin="round"/>`;
    return hop(2.2, 2.2) + hop(9.6, 7.4) + star(3.6, 7.6) + star(8.2, 2.4) + `<circle cx="9.2" cy="10.4" r="0.22" fill="none" stroke="${C}" stroke-opacity="0.7" stroke-width="0.04"/>`; },
};
module.exports = MARKS;
