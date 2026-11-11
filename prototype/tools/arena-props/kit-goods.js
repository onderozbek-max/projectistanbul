// Parametric street kit, part 2 (R1-T3, D-057): cart, crates, kiosk, market stall. Configs come from tools/arena-props/hoods.js.
// A `label` { key, text, col } tells the game where to write a sign word (P.t key); the SVG holds no words.
'use strict';
const L = require('./lib');
const { rect, ell, line, poly, path, box, drum, wheel, tea, prop, rng, f, INK, LW } = L;

function stripes(x0, y0, w, h, n, a, b, scallop) {
  const sw = w / n; let s = '';
  for (let i = 0; i < n; i++) s += rect(x0 + i * sw, y0, sw, h, i % 2 ? b : a, { lw: LW * 0.6 });
  if (scallop) for (let i = 0; i < n; i++) s += path(`M${f(x0 + i * sw)} ${f(y0 + h)}Q${f(x0 + (i + 0.5) * sw)} ${f(y0 + h + 0.12)} ${f(x0 + (i + 1) * sw)} ${f(y0 + h)}Z`, i % 2 ? b : a, { lw: LW * 0.6 });
  return s + L.edges(x0, y0, w, h + 0.08, { k: 0.8 });
}
const lbl = (c, x, y, w, h) => c.label ? { label: { key: c.label.key, text: c.label.text, col: c.label.col || '#F4EBDD', x, y, w, h } } : {};

// ---- cart: cfg { kind: 'corn' | 'fabric' | 'garden' | 'ice' | 'hand', body, trim, a, b, label } ; 1.4 x 0.9 ----
function cart(c) {
  const w = 1.4, d = 0.9, hg = 0.5, yb = d / 2, yt = yb - d - hg, mid = yt + d / 2, r = rng(c.seed || 9);
  let s = box(0, 0, w, d, hg, c.top || c.body, c.body);
  s += line(0, yb - 0.02, 0, yb + 0.34, INK, 0.08) + line(0, yb - 0.02, 0, yb + 0.34, '#8A8F98', 0.05) + wheel(-0.52, yb + 0.02, 0.17) + wheel(0.52, yb + 0.02, 0.17);
  s += rect(-w / 2, yb - hg, w, 0.045, c.trim, { lw: LW * 0.7 });
  let top = mid - 0.3;
  if (c.kind === 'corn') {
    s += drum(-0.34, mid + 0.1, 0.27, 0.13, 0.3, '#C9CED6', '#8A8F98') + ell(-0.34, mid - 0.2, 0.2, 0.1, '#6B6F78', { lw: LW * 0.8 });
    for (let i = 0; i < 6; i++) s += ell(-0.34 + (i % 3 - 1) * 0.1, mid - 0.22 + Math.floor(i / 3) * 0.05, 0.075, 0.034, '#F2C94C', { lw: LW * 0.6 });
    for (let i = 0; i < 5; i++) s += ell(0.18 + i * 0.1, mid + 0.02, 0.05, 0.12, '#F2C94C', { lw: LW * 0.7 }) + ell(0.18 + i * 0.1, mid - 0.08, 0.05, 0.03, '#6FA15A', { lw: LW * 0.5 });
    s += `<circle cx="-0.34" cy="${f(mid - 0.6)}" r="0.08" fill="#fff" opacity="0.3"/><circle cx="-0.3" cy="${f(mid - 0.78)}" r="0.1" fill="#fff" opacity="0.2"/>`;
    top = mid - 0.9;
  } else if (c.kind === 'fabric') {
    const cols = c.cols || [c.a, c.b, '#F4EBDD', '#2B3050'];
    for (let i = 0; i < 4; i++) { const x = -0.45 + i * 0.3; s += rect(x - 0.12, mid - 0.3, 0.24, 0.62, cols[i % cols.length], { rx: 0.12 }) + ell(x, mid - 0.3, 0.12, 0.06, cols[(i + 1) % cols.length], { lw: LW * 0.8 }) + ell(x, mid - 0.3, 0.04, 0.02, '#14151F', { ink: 0 }); }
    top = mid - 0.4;
  } else if (c.kind === 'garden') {
    s += rect(-0.6, mid - 0.32, 1.2, 0.66, '#6B4A2C', { lw: LW * 0.8 });
    for (let i = 0; i < 14; i++) s += ell(-0.5 + r() * 1.0, mid - 0.24 + r() * 0.5, 0.075, 0.06, [c.a, c.b, '#3E8A4F', '#2E6E3F'][i % 4], { lw: LW * 0.6 });
    top = mid - 0.4;
  } else if (c.kind === 'ice') {
    for (let i = 0; i < 3; i++) s += ell(-0.45 + i * 0.3, mid + 0.02, 0.1, 0.07, [c.a, c.b, '#F4EBDD'][i], { lw: LW * 0.8 });
    for (let i = 0; i < 3; i++) { const x = 0.28 + i * 0.12; s += poly([[x - 0.04, mid - 0.05], [x + 0.04, mid - 0.05], [x, mid + 0.14]], '#D9A441', { lw: LW * 0.6 }) + ell(x, mid - 0.06, 0.06, 0.045, [c.a, c.b, '#F4EBDD'][i], { lw: LW * 0.6 }); }
    const y = mid - 0.58, R = 0.7;   // pastel umbrella
    s += line(0, mid - 0.1, 0, y, INK, 0.04);
    for (let i = 0; i < 8; i++) { const a0 = i * Math.PI / 4, a1 = (i + 1) * Math.PI / 4; s += path(`M0 ${f(y)}L${f(Math.cos(a0) * R)} ${f(y + Math.sin(a0) * R * 0.5)}A${f(R)} ${f(R * 0.5)} 0 0 1 ${f(Math.cos(a1) * R)} ${f(y + Math.sin(a1) * R * 0.5)}Z`, i % 2 ? '#F4EBDD' : c.a, { lw: LW * 0.7 }); }
    top = y - R * 0.5;
  } else {   // hand cart: stacked cartons and a bag
    for (let i = 0; i < 3; i++) s += box(-0.38 + i * 0.4, mid + 0.08, 0.34, 0.3, 0.2, c.a, c.b, { k: 0.8 }) + line(-0.38 + i * 0.4, mid - 0.4, -0.38 + i * 0.4, mid - 0.15, '#F4EBDD', 0.03, { op: 0.8 });
    s += box(-0.2, mid - 0.2, 0.34, 0.3, 0.2, c.a, c.b, { k: 0.8 }) + ell(0.34, mid - 0.12, 0.17, 0.12, '#CFC6B4', { lw: LW * 0.8 });
    top = mid - 0.7;
  }
  return prop('cart', w, d, [-0.76, Math.min(top, yt) - 0.04, 0.76, yb + 0.5], s, lbl(c, -0.62, yb - hg + 0.07, 1.24, 0.32));
}

// ---- crates: cfg { kind: 'fish' | 'spice' | 'books' | 'cartons' | 'bales' | 'gear', crate, a, b } ; 1.0 x 1.0 ----
function crates(c) {
  const r = rng(c.seed || 13), crate = c.crate || '#B8864B', dk = '#7A5530';
  let s = ell(0, 0.02, 0.62, 0.42, '#1E1F25', { ink: 0, op: 0.35 }), top = -0.6;
  if (c.kind === 'books') {
    for (let i = 0; i < 3; i++) s += box(-0.28 + i * 0.28, 0.2, 0.26, 0.3, 0.2, '#F4EBDD', c.a, { k: 0.8 });
    s += box(-0.1, -0.1, 0.5, 0.32, 0.3, crate, dk) + rect(-0.34, -0.5, 0.48, 0.1, c.a, { rx: 0.02 }) + rect(-0.32, -0.6, 0.44, 0.1, c.b, { rx: 0.02 }) + rect(-0.3, -0.7, 0.4, 0.1, '#2B3050', { rx: 0.02 });
    return prop('crates', 1.0, 1.0, [-0.72, -0.8, 0.72, 0.5], s);
  }
  s += box(-0.12, 0.2, 0.7, 0.5, 0.3, crate, dk) + box(0.12, -0.1, 0.62, 0.46, 0.3, c.crate2 || crate, dk);
  if (c.kind === 'fish') {
    s += rect(-0.4, -0.38, 0.62, 0.34, '#DDEAF2', { lw: LW * 0.8, rx: 0.04 });
    for (let i = 0; i < 6; i++) { const x = -0.34 + (i % 3) * 0.19, y = -0.3 + Math.floor(i / 3) * 0.14; s += path(`M${f(x)} ${f(y)}Q${f(x + 0.08)} ${f(y - 0.06)} ${f(x + 0.16)} ${f(y)}Q${f(x + 0.08)} ${f(y + 0.05)} ${f(x)} ${f(y)}Z`, '#B9C6D2', { lw: LW * 0.6 }) + `<circle cx="${f(x + 0.04)}" cy="${f(y - 0.01)}" r="0.01" fill="#14151F"/>`; }
    top = -0.6;
  } else if (c.kind === 'spice') {
    [[-0.3, c.a], [-0.04, c.b], [0.22, '#E4A93B'], [0.46, '#4F7A3A']].forEach((m, i) => { s += ell(m[0], -0.28 - (i % 2) * 0.1, 0.17, 0.12, '#CFC6B4', { lw: LW * 0.8 }) + path(`M${f(m[0] - 0.14)} ${f(-0.28 - (i % 2) * 0.1)}Q${f(m[0])} ${f(-0.62 - (i % 2) * 0.1)} ${f(m[0] + 0.14)} ${f(-0.28 - (i % 2) * 0.1)}Z`, m[1], { lw: LW * 0.8 }); });
    top = -0.74;
  } else if (c.kind === 'cartons') {
    s += box(-0.14, -0.22, 0.4, 0.3, 0.26, '#C9A66B', '#8B6B4A', { k: 0.8 }) + box(0.26, -0.3, 0.32, 0.28, 0.22, '#D8B77A', '#8B6B4A', { k: 0.8 }) + line(-0.14, -0.62, -0.14, -0.36, '#F4EBDD', 0.035, { op: 0.8 }) + box(0.0, -0.55, 0.3, 0.26, 0.2, '#C9A66B', '#8B6B4A', { k: 0.8 });
    top = -0.9;
  } else if (c.kind === 'bales') {
    [[-0.22, c.a], [0.2, c.b]].forEach(m => { s += rect(m[0] - 0.22, -0.55, 0.44, 0.4, m[1], { rx: 0.05 }) + line(m[0] - 0.08, -0.55, m[0] - 0.08, -0.15, '#14151F', 0.03, { op: 0.7 }) + line(m[0] + 0.1, -0.55, m[0] + 0.1, -0.15, '#14151F', 0.03, { op: 0.7 }) + L.edges(m[0] - 0.22, -0.55, 0.44, 0.4, { k: 0.8 }); });
    top = -0.6;
  } else {   // gear: rope coil and floats
    s += ell(-0.2, -0.3, 0.26, 0.16, '#D9C9A1', { lw: LW * 0.8 }) + ell(-0.2, -0.3, 0.14, 0.08, '#8A7A55', { lw: LW * 0.6 }) + ell(-0.2, -0.3, 0.06, 0.035, '#14151F', { ink: 0 });
    s += ell(0.28, -0.22, 0.1, 0.1, c.a, { lw: LW * 0.8 }) + ell(0.38, -0.36, 0.09, 0.09, c.b, { lw: LW * 0.8 }) + ell(0.2, -0.42, 0.085, 0.085, c.a, { lw: LW * 0.8 });
    top = -0.55;
  }
  return prop('crates', 1.0, 1.0, [-0.72, top - 0.1, 0.72, 0.5], s);
}

// ---- kiosk: cfg { body, hatch, a, b, label } ; 1.6 x 1.6 ----
function kiosk(c) {
  const w = 1.6, d = 1.6, hg = 0.95, yb = d / 2, yt = yb - d - hg;
  let s = ell(0, 0.05, 1.0, 0.7, '#1E1F25', { ink: 0, op: 0.35 }) + box(0, 0, w, d, hg, c.roof || c.body, c.body);
  s += rect(-0.55, yb - hg + 0.14, 1.1, 0.5, c.hatch || '#F2C46D', { lw: LW * 0.9 }) + rect(-0.5, yb - hg + 0.5, 1.0, 0.08, '#14151F', { ink: 0, op: 0.45 }) + L.edges(-w / 2, yt, w, d + hg, { k: 0.7 });
  s += rect(-w / 2, yb - hg, w, 0.05, c.b, { lw: LW * 0.7 });
  s += stripes(-w / 2 - 0.05, yt - 0.3, w + 0.1, 0.5, 8, c.a, c.b, true);
  s += rect(-0.1, yt + 0.6, 0.2, 0.5, '#E8DCC6', { lw: LW * 0.7 });
  return prop('kiosk', w, d, [-w / 2 - 0.1, yt - 0.34, w / 2 + 0.1, yb + 0.06], s, lbl(c, -0.7, yb - hg + 0.74, 1.4, 0.2));
}

// ---- stall (lx_stall): cfg { body, top, a, b, goods: 'pastry' | 'spice' | 'lokum' | 'books', label } ; 1.8 x 1.6 ----
function stall(c) {
  const w = 1.8, d = 1.6, hg = 0.85, yb = d / 2, yt = yb - d - hg, cy0 = yt - 0.46;
  let s = box(0, 0, w, d, hg, c.top || '#E8DCC6', c.body);
  s += rect(-w / 2 + 0.1, yt + 0.1, w - 0.2, d - 0.2, c.mat || '#F4EBDD', { lw: LW * 0.8 });
  for (let i = 0; i < 9; i++) {
    const x = -w / 2 + 0.3 + (i % 5) * 0.3 + (i > 4 ? 0.15 : 0), y = yt + 0.4 + Math.floor(i / 5) * 0.36;
    if (c.goods === 'spice') s += path(`M${f(x - 0.12)} ${f(y + 0.06)}Q${f(x)} ${f(y - 0.26)} ${f(x + 0.12)} ${f(y + 0.06)}Z`, [c.a, c.b, '#E4A93B', '#4F7A3A', '#8A3A1C'][i % 5], { lw: LW * 0.7 }) + ell(x, y + 0.06, 0.12, 0.05, '#CFC6B4', { lw: LW * 0.6 });
    else if (c.goods === 'books') s += rect(x - 0.1, y - 0.07, 0.2, 0.14, [c.a, c.b, '#F4EBDD', '#2B3050'][i % 4], { lw: LW * 0.6 });
    else s += ell(x, y, 0.1, 0.075, [c.a, '#D9A441', c.b][i % 3], { lw: LW * 0.7 }) + ell(x, y, 0.04, 0.03, '#F4EBDD', { ink: 0, op: 0.8 });
  }
  s += rect(-w / 2, yb - hg, w, 0.06, c.trim || c.b, { lw: LW * 0.7 });
  s += stripes(-w / 2, cy0, w, 0.62, 7, c.a, '#F4EBDD', true);
  return prop('lx_stall', w, d, [-w / 2 - 0.05, cy0 - 0.02, w / 2 + 0.05, yb + 0.06], s, lbl(c, -0.8, yb - hg + 0.1, 1.6, 0.5));
}

module.exports = { cart, crates, kiosk, stall };
