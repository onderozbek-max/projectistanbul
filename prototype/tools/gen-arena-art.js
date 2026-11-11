// R1-T3 arena tiles (D-057): seamless ground and walk tiles as SVG, drawn with night_ink joints, three stone tones, a warm
// highlight on the top-left of each stone and a cool shade on the bottom-right. Seeded, so output is stable.
// Writes art/arenas/<hood>-<role>.svg (review copies) and js/view/arena-art-data.js (what the game loads; SVG as strings,
// so it works from file://). Units are metres; the game rasterizes at its own px per metre.
// Usage: node prototype/tools/gen-arena-art.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const INK = '#14151F', WARM = '#E9C88B', COOL = '#2B3050';

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const f = n => (Math.round(n * 1000) / 1000).toString();

// A stone: jittered quad with softened corners, drawn at the cell and again offset by the tile size so the wrap is seamless.
function stone(r, x, y, w, h, o) {
  const j = o.jitter, q = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(p => [p[0] + (r() - 0.5) * j, p[1] + (r() - 0.5) * j]);
  const k = o.round, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const pull = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  let d = '';
  for (let i = 0; i < 4; i++) {
    const p = q[i], n = q[(i + 1) % 4], pr = q[(i + 3) % 4];
    const a = pull(p, pr, k), b = pull(p, n, k);
    d += (i ? 'L' : 'M') + f(a[0]) + ' ' + f(a[1]) + 'Q' + f(p[0]) + ' ' + f(p[1]) + ' ' + f(b[0]) + ' ' + f(b[1]);
  }
  d += 'Z';
  const tone = o.tones[Math.floor(r() * o.tones.length)];
  let s = `<path d="${d}" fill="${tone}" stroke="${INK}" stroke-width="${o.line}" stroke-linejoin="round"/>`;
  const hl = `M${f(q[3][0] + w * 0.12)} ${f(q[3][1] - h * 0.12)}L${f(q[0][0] + w * 0.12)} ${f(q[0][1] + h * 0.14)}L${f(q[1][0] - w * 0.18)} ${f(q[1][1] + h * 0.14)}`;
  const sd = `M${f(q[1][0] - w * 0.1)} ${f(q[1][1] + h * 0.3)}L${f(q[2][0] - w * 0.1)} ${f(q[2][1] - h * 0.14)}L${f(q[3][0] + w * 0.22)} ${f(q[3][1] - h * 0.14)}`;
  s += `<path d="${hl}" fill="none" stroke="${WARM}" stroke-opacity="${o.hi}" stroke-width="${o.line * 0.9}" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="${sd}" fill="none" stroke="${COOL}" stroke-opacity="${o.lo}" stroke-width="${o.line * 1.5}" stroke-linecap="round" stroke-linejoin="round"/>`;
  return s;
}
// Rows of stones. Row heights are equal and stone widths in a row sum to the tile width, so both axes repeat.
function paving(seed, W, H, o) {
  const r = rng(seed), rows = o.rows, rh = H / rows; let body = '';
  for (let i = 0; i < rows; i++) {
    let n = o.cols[0] + Math.floor(r() * (o.cols[1] - o.cols[0] + 1)), cuts = [0];
    for (let c = 1; c < n; c++) cuts.push(c / n + (r() - 0.5) * (0.5 / n));
    cuts.push(1); cuts.sort((a, b) => a - b);
    for (let c = 0; c < cuts.length - 1; c++) {
      const x0 = cuts[c] * W, x1 = cuts[c + 1] * W, g = o.gap;
      body += stone(r, x0 + g, i * rh + g, x1 - x0 - 2 * g, rh - 2 * g, o);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 100}" height="${H * 100}"><rect width="${W}" height="${H}" fill="${o.joint || INK}"/>${body}${o.extra ? o.extra(rng(seed + 99), W, H) : ''}</svg>`;
}
// Asphalt: a flat dark base, sparse grit, hand-inked cracks and a couple of repair patches.
function asphalt(seed, W, H, o) {
  const r = rng(seed); let b = `<rect width="${W}" height="${H}" fill="${o.base}"/>`;
  for (let i = 0; i < 90; i++) b += `<ellipse cx="${f(r() * W)}" cy="${f(r() * H)}" rx="${f(0.02 + r() * 0.05)}" ry="${f(0.015 + r() * 0.03)}" fill="${r() < 0.5 ? o.light : o.dark}" opacity="0.7"/>`;
  for (let i = 0; i < 2; i++) {
    const x = r() * (W - 1.4), y = r() * (H - 1), w = 0.9 + r() * 0.6, h = 0.5 + r() * 0.5;
    b += `<path d="M${f(x)} ${f(y + 0.05)}L${f(x + w)} ${f(y)}L${f(x + w - 0.04)} ${f(y + h)}L${f(x + 0.03)} ${f(y + h - 0.05)}Z" fill="${o.patch}" stroke="${INK}" stroke-width="0.035" stroke-linejoin="round"/>`;
    b += `<path d="M${f(x + 0.08)} ${f(y + h - 0.1)}L${f(x + w - 0.1)} ${f(y + h - 0.08)}" stroke="${COOL}" stroke-opacity="0.5" stroke-width="0.05" stroke-linecap="round"/>`;
  }
  for (let i = 0; i < 4; i++) {
    let x = r() * W, y = r() * H, d = `M${f(x)} ${f(y)}`;
    for (let k = 0; k < 5; k++) { x += (r() - 0.35) * 0.35; y += 0.18 + r() * 0.2; d += `L${f(x)} ${f(y)}`; }
    b += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="0.03" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 100}" height="${H * 100}">${b}</svg>`;
}
// Tram rails set in the road: two steel rails, a dark groove either side, bolts. Transparent, drawn over the ground.
function rails() {
  const W = 2.4, H = 2; let b = '';
  [-0.7, 0.7].forEach(x => {
    const cx = W / 2 + x;
    b += `<rect x="${f(cx - 0.2)}" y="0" width="0.4" height="${H}" fill="${INK}" opacity="0.6"/>`;
    b += `<rect x="${f(cx - 0.1)}" y="0" width="0.2" height="${H}" fill="#8B93A3" stroke="${INK}" stroke-width="0.035"/>`;
    b += `<rect x="${f(cx - 0.07)}" y="0" width="0.05" height="${H}" fill="#E4E9F1"/>`;
    for (let y = 0.25; y < H; y += 0.5) b += `<circle cx="${f(cx + 0.15)}" cy="${y}" r="0.035" fill="${INK}"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 100}" height="${H * 100}">${b}</svg>`;
}

const SETT = ['#5F6370', '#686C79', '#71757F'];
const FLAG = ['#6A5645', '#74604C', '#7F6A55'];
const SLAB = ['#7D7B78', '#87847F', '#908D86'];
const PAVE = ['#6A6C78', '#747684', '#7E808C'];
const DUST = (r, W, H) => { let b = ''; for (let i = 0; i < 26; i++) b += `<circle cx="${f(r() * W)}" cy="${f(r() * H)}" r="0.02" fill="#B5651D" opacity="0.55"/>`; return b; };

const TILES = {
  istiklal: {
    ground: paving(11, 4, 4, { rows: 9, cols: [7, 9], gap: 0.012, jitter: 0.04, round: 0.26, line: 0.03, tones: SETT, hi: 0.38, lo: 0.42, joint: '#2A2C38' }),
    walk: paving(12, 2, 2, { rows: 3, cols: [2, 3], gap: 0.014, jitter: 0.03, round: 0.12, line: 0.04, tones: SLAB, hi: 0.5, lo: 0.4 }),
  },
  bazaar: {
    ground: paving(21, 4, 4, { rows: 6, cols: [4, 6], gap: 0.018, jitter: 0.06, round: 0.16, line: 0.04, tones: FLAG, hi: 0.45, lo: 0.5, joint: '#2A1F18', extra: DUST }),
    walk: paving(22, 2, 2, { rows: 3, cols: [2, 3], gap: 0.016, jitter: 0.05, round: 0.14, line: 0.04, tones: FLAG, hi: 0.45, lo: 0.45, joint: '#2A1F18', extra: DUST }),
  },
  atakoy: {
    ground: asphalt(31, 4, 4, { base: '#585B64', light: '#6E727C', dark: '#454851', patch: '#4B4E57' }),
    walk: paving(32, 2, 2, { rows: 3, cols: [2, 3], gap: 0.014, jitter: 0.03, round: 0.1, line: 0.04, tones: PAVE, hi: 0.5, lo: 0.4 }),
  },
  common: { rails: rails() },
};

const dir = path.join(ROOT, 'art', 'arenas'); fs.mkdirSync(dir, { recursive: true });
const data = {};
Object.keys(TILES).forEach(id => Object.keys(TILES[id]).forEach(role => {
  const svg = TILES[id][role], m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  fs.writeFileSync(path.join(dir, id + '-' + role + '.svg'), svg);
  (data[id] = data[id] || {})[role] = { w: parseFloat(m[1]), h: parseFloat(m[2]), svg };
}));
const out = '// GENERATED by tools/gen-arena-art.js (R1-T3, D-057). Do not edit by hand. Source: art/arenas/*.svg.\n' +
  'P.ArenaArtData = ' + JSON.stringify(data) + ';\n';
fs.writeFileSync(path.join(ROOT, 'prototype', 'js', 'view', 'arena-art-data.js'), out);
console.log('arena art: ' + Object.keys(data).map(k => k + '[' + Object.keys(data[k]).join(',') + ']').join(' ') + ', ' + (out.length / 1024).toFixed(0) + ' KB');
