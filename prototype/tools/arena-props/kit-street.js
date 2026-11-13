// Parametric street kit, part 1 (R1-T3, D-057): tables, bench, bin, planter, bollard, barrier, tree. Each builder takes a small config
// (colours and a variant) so every hood gets its own palette from tools/arena-props/hoods.js. Footprints match config-levels.js kinds.
'use strict';
const L = require('./lib');
const { rect, ell, line, poly, path, box, drum, tea, prop, rng, f, INK, LW } = L;

// ---- tables: cfg { shape: 'round' | 'tavla' | 'parasol', cloth: 'check' | 'solid', a, b, items: 'tea' | 'plates', chair } ----
function clothDefs(c) {
  return `<defs><pattern id="ck" width="0.12" height="0.12" patternUnits="userSpaceOnUse"><rect width="0.12" height="0.12" fill="${c.b || '#F4EBDD'}"/><rect width="0.06" height="0.12" fill="${c.a}" opacity="0.55"/><rect width="0.12" height="0.06" fill="${c.a}" opacity="0.55"/></pattern></defs>`;
}
function plate(cx, cy) { return ell(cx, cy, 0.075, 0.04, '#F4EBDD', { lw: LW * 0.7 }) + ell(cx, cy - 0.01, 0.04, 0.022, '#C9743A', { ink: 0 }); }
function round(cx, cy, c) {
  const th = 0.36, rx = 0.3, ry = 0.2, top = c.cloth === 'check' ? 'url(#ck)' : (c.a || '#F4EBDD');
  let s = ell(cx, cy + 0.03, rx * 0.95, ry * 0.8, '#1E1F25', { ink: 0, op: 0.4 });
  s += path(`M${f(cx - rx)} ${f(cy - th)}L${f(cx - rx * 0.92)} ${f(cy - th + 0.16)}Q${f(cx)} ${f(cy - th + 0.16 + ry * 1.2)} ${f(cx + rx * 0.92)} ${f(cy - th + 0.16)}L${f(cx + rx)} ${f(cy - th)}Z`, c.skirt || '#E8DCC6');
  s += ell(cx, cy - th, rx, ry, top);
  s += `<path d="M${f(cx - rx * 0.8)} ${f(cy - th - 0.05)}A${f(rx)} ${f(ry)} 0 0 1 ${f(cx + rx * 0.1)} ${f(cy - th - ry * 0.95)}" fill="none" stroke="#fff" stroke-opacity="0.6" stroke-width="0.025" stroke-linecap="round"/>`;
  s += c.items === 'plates' ? plate(cx - 0.1, cy - th - 0.02) + plate(cx + 0.12, cy - th + 0.05) + ell(cx + 0.02, cy - th - 0.1, 0.03, 0.02, '#2E5E4E', { lw: LW * 0.6 }) : tea(cx - 0.1, cy - th - 0.02) + tea(cx + 0.12, cy - th + 0.05);
  return s;
}
function chair(cx, cy, back, col) {
  const dk = col || '#7A4A22';
  let s = ell(cx, cy + 0.02, 0.15, 0.09, '#1E1F25', { ink: 0, op: 0.35 });
  s += ell(cx, cy - 0.1, 0.14, 0.1, dk) + ell(cx, cy - 0.1, 0.09, 0.062, '#C98A45', { lw: LW * 0.5, op: 0.9 });
  s += back ? path(`M${f(cx + back * 0.13)} ${f(cy - 0.2)}Q${f(cx + back * 0.2)} ${f(cy - 0.38)} ${f(cx + back * 0.09)} ${f(cy - 0.42)}`, null, { lw: LW * 1.8, ink: '#4B2B12' })
    : path(`M${f(cx - 0.12)} ${f(cy - 0.18)}Q${f(cx)} ${f(cy - 0.34)} ${f(cx + 0.12)} ${f(cy - 0.18)}`, null, { lw: LW * 1.8, ink: '#4B2B12' });
  return s;
}
function board(cx, cy) {   // backgammon table: dark wood, a board with triangles, stools
  const w = 0.62, d = 0.62, hg = 0.34, yt = cy + d / 2 - d - hg;
  let s = ell(cx, cy + 0.04, 0.4, 0.25, '#1E1F25', { ink: 0, op: 0.4 }) + box(cx, cy, w, d, hg, '#8A5A30', '#5A3A20');
  s += rect(cx - 0.25, yt + 0.06, 0.5, d - 0.12, '#D9B77A', { lw: LW * 0.8 });
  for (let i = 0; i < 6; i++) s += poly([[cx - 0.24 + i * 0.08, yt + 0.07], [cx - 0.16 + i * 0.08, yt + 0.07], [cx - 0.2 + i * 0.08, yt + 0.27]], i % 2 ? '#5A3A20' : '#A8322D', { ink: 0 }) + poly([[cx - 0.24 + i * 0.08, yt + d - 0.07], [cx - 0.16 + i * 0.08, yt + d - 0.07], [cx - 0.2 + i * 0.08, yt + d - 0.27]], i % 2 ? '#A8322D' : '#5A3A20', { ink: 0 });
  s += ell(cx - 0.14, yt + 0.31, 0.03, 0.022, '#F4EBDD', { lw: LW * 0.5 }) + ell(cx + 0.1, yt + 0.34, 0.03, 0.022, '#14151F', { lw: LW * 0.5 });
  return s;
}
function parasol(cx, cy, a, b) {   // striped canopy above a table
  const r = 0.62, y = cy - 0.78;
  let s = line(cx, cy - 0.3, cx, y, INK, 0.04) + ell(cx, y + 0.06, r, r * 0.55, '#1E1F25', { ink: 0, op: 0.2 });
  for (let i = 0; i < 8; i++) { const a0 = i * Math.PI / 4, a1 = (i + 1) * Math.PI / 4; s += path(`M${f(cx)} ${f(y)}L${f(cx + Math.cos(a0) * r)} ${f(y + Math.sin(a0) * r * 0.55)}A${f(r)} ${f(r * 0.55)} 0 0 1 ${f(cx + Math.cos(a1) * r)} ${f(y + Math.sin(a1) * r * 0.55)}Z`, i % 2 ? b : a, { lw: LW * 0.7 }); }
  return s + ell(cx, y, 0.04, 0.025, INK);
}
function tables(c) {
  let body = clothDefs(c);
  if (c.shape === 'tavla') {
    body += chair(-0.52, -0.1, -1, c.chair) + chair(0.55, 0.32, 1, c.chair) + board(-0.2, -0.12) + board(0.28, 0.34);
    return prop('tables', 1.2, 1.2, [-0.85, -0.9, 0.85, 0.7], body);
  }
  if (c.shape === 'parasol') {
    body += chair(-0.5, 0.18, -1, c.chair) + chair(0.5, 0.2, 1, c.chair) + chair(0, 0.55, 0, c.chair) + round(0, 0.1, c) + parasol(0, 0.1, c.a, c.b || '#F4EBDD');
    return prop('tables', 1.2, 1.2, [-0.7, -1.5, 0.7, 0.72], body);
  }
  const a = [-0.34, -0.2], b = [0.32, 0.26];
  body += chair(a[0] - 0.42, a[1] + 0.12, -1, c.chair) + chair(a[0], a[1] - 0.3, 0, c.chair) + round(a[0], a[1], c) + chair(a[0] + 0.1, a[1] + 0.42, 0, c.chair) +
    chair(b[0] + 0.44, b[1] + 0.02, 1, c.chair) + chair(b[0] - 0.42, b[1] + 0.14, -1, c.chair) + round(b[0], b[1], c);
  return prop('tables', 1.2, 1.2, [-0.9, -1.0, 0.9, 0.68], body);
}

// ---- bench: cfg { top, side, back, leg } ----
function bench(c) {
  const w = 0.6, d = 1.8, hg = 0.32;
  let s = box(-0.27, 0, 0.07, d - 0.1, 0.6, c.back, c.side);
  s += rect(-0.26, d / 2 - hg - 0.02, 0.08, hg + 0.04, c.leg || '#1E1F25', { lw: LW * 0.7 }) + rect(0.2, d / 2 - hg - 0.02, 0.08, hg + 0.04, c.leg || '#1E1F25', { lw: LW * 0.7 });
  s += box(0, 0, w, d, hg, c.top, c.side);
  for (let i = 1; i < 4; i++) s += line(-w / 2 + (w / 4) * i, -d / 2 - hg + 0.04, -w / 2 + (w / 4) * i, d / 2 - hg - 0.04, INK, 0.022);
  s += line(-w / 2 + 0.05, -d / 2 - hg + 0.1, -w / 2 + 0.05, d / 2 - hg - 0.1, '#fff', 0.02, { op: 0.4 });
  return prop('bench', 0.6, 1.8, [-0.36, -d / 2 - hg - 0.62, 0.36, d / 2 + 0.04], s);
}

// ---- bin: cfg { top, side, band } ----
function bin(c) {
  const r = 0.22, hg = 0.6, cy = 0.14;
  let s = ell(0, cy + 0.02, r * 1.2, 0.14, '#1E1F25', { ink: 0, op: 0.4 }) + drum(0, cy, r, 0.12, hg, c.top, c.side);
  s += rect(-r, cy - hg * 0.58, r * 2, 0.065, c.band, { lw: LW * 0.6, rx: 0.01 }) + ell(0, cy - hg, r * 0.55, 0.065, '#0F1713');
  s += path(`M${f(0.04)} ${f(cy - hg - 0.02)}L${f(0.1)} ${f(cy - hg - 0.15)}L${f(0.14)} ${f(cy - hg - 0.02)}Z`, '#E8DCC6', { lw: LW * 0.7 });
  return prop('bin', 0.6, 0.6, [-0.3, cy - hg - 0.2, 0.3, cy + 0.2], s);
}

// ---- planter: cfg { shape: 'box' | 'pot', box, rim, leaf: [a, b], flower: [a, b] } ----
function planter(c) {
  const r = rng(c.seed || 21);
  let s = '', top;
  if (c.shape === 'pot') {
    const R = 0.46, hg = 0.5, cy = 0.2; top = cy - hg;
    s += ell(0, cy + 0.05, R * 1.15, 0.3, '#1E1F25', { ink: 0, op: 0.4 }) + drum(0, cy, R, 0.26, hg, c.rim || c.box, c.box) + ell(0, top, R * 0.84, 0.2, '#3A2A1C', { lw: LW * 0.8 });
    for (let i = 0; i < 9; i++) { const a = r() * 6.28, rr = r() * 0.35; s += ell(Math.cos(a) * rr, top - 0.14 - r() * 0.18 + Math.sin(a) * 0.08, 0.15, 0.11, c.leaf[i % 2], { lw: LW * 0.8 }); }
    s += ell(0.1, top - 0.3, 0.05, 0.04, c.flower[0], { lw: LW * 0.5 }) + ell(-0.16, top - 0.24, 0.045, 0.035, c.flower[1], { lw: LW * 0.5 });
    return prop('planter', 1.2, 1.2, [-0.62, top - 0.55, 0.62, cy + 0.34], s);
  }
  const w = 1.1, d = 0.9, hg = 0.42, yb = d / 2, yt = yb - d - hg; top = yt;
  s += box(0, 0.02, w, d, hg, '#3A2A1C', c.box) + rect(-w / 2, yb + 0.02 - hg, w, 0.06, c.rim, { lw: LW * 0.7 }) + rect(-w / 2 + 0.05, yt + 0.07, w - 0.1, d - 0.14, '#3A2A1C', { lw: LW * 0.8 });
  for (let i = 0; i < 14; i++) s += ell((r() - 0.5) * (w - 0.3), yt + 0.18 + r() * (d - 0.36), 0.13, 0.095, c.leaf[i % 2], { lw: LW * 0.8 });
  for (let i = 0; i < 9; i++) { const x = (r() - 0.5) * (w - 0.3), y = yt + 0.16 + r() * (d - 0.36); s += ell(x, y, 0.06, 0.045, c.flower[i % 3 ? 0 : 1], { lw: LW * 0.6 }) + ell(x, y, 0.02, 0.015, '#FFF3C9', { ink: 0 }); }
  return prop('planter', 1.2, 1.2, [-0.6, yt - 0.04, 0.6, yb + 0.1], s);
}

// ---- bollard: cfg { kind: 'post' | 'mooring', body, cap } ----
function bollard(c) {
  let s = ell(0, 0.06, 0.22, 0.12, '#1E1F25', { ink: 0, op: 0.4 });
  if (c.kind === 'mooring') {
    s += drum(0, 0.05, 0.12, 0.065, 0.3, c.body, c.cap) + ell(0, -0.25, 0.2, 0.1, c.body) + ell(0, -0.25, 0.08, 0.04, '#14151F', { ink: 0 });
    return prop('bollard', 0.35, 0.35, [-0.24, -0.4, 0.24, 0.16], s);
  }
  s += drum(0, 0.06, 0.13, 0.07, 0.5, c.cap, c.body) + rect(-0.13, -0.28, 0.26, 0.05, c.cap, { lw: LW * 0.6 });
  return prop('bollard', 0.35, 0.35, [-0.2, -0.56, 0.2, 0.16], s);
}

// ---- barrier: cfg { a, b, rail } ; 3.0 x 0.6, striped panels on a low block ----
function barrier(c) {
  const w = 3.0, d = 0.6, hg = 0.55, yb = d / 2, yt = yb - d - hg;
  let s = ell(0, 0.05, 1.5, 0.28, '#1E1F25', { ink: 0, op: 0.35 }) + box(0, 0, w, d, hg, c.rail || '#C9C4B8', c.b);
  const n = 12, sw = (w - 0.1) / n;
  for (let i = 0; i < n; i++) s += poly([[-w / 2 + 0.05 + i * sw, yb], [-w / 2 + 0.05 + i * sw + sw * 0.5, yb], [-w / 2 + 0.05 + i * sw + sw * 0.5 + 0.12, yb - hg], [-w / 2 + 0.05 + i * sw + 0.12, yb - hg]], c.a, { ink: 0, op: 0.9 });
  s += line(-w / 2, yb - hg, w / 2, yb - hg, INK, 0.03) + rect(-w / 2 + 0.1, yt + 0.06, w - 0.2, 0.05, '#fff', { ink: 0, op: 0.35 });
  s += rect(-w / 2 + 0.1, yb - 0.02, 0.1, 0.1, '#1E1F25', { lw: LW * 0.6 }) + rect(w / 2 - 0.2, yb - 0.02, 0.1, 0.1, '#1E1F25', { lw: LW * 0.6 });
  return prop('barrier', w, d, [-w / 2 - 0.05, yt - 0.04, w / 2 + 0.05, yb + 0.1], s);
}

// ---- stanchion (queue barrier: posts and a rope, D-060 Topkapı): cfg { post, cap, rope } ; 3.0 x 0.6 like the config 'barrier' footprint ----
function stanchion(c) {
  const hw = 1.45, top = -0.8, xs = [-hw, 0, hw];
  let s = ell(0, 0.04, 1.6, 0.22, '#1E1F25', { ink: 0, op: 0.35 });
  xs.forEach(x => { s += drum(x, 0.1, 0.06, 0.035, 0.9, c.cap || '#C9A227', c.post || '#2A2C31'); });
  const rope = `M${f(-hw)} ${f(top + 0.02)}Q${f(-hw / 2)} ${f(top + 0.32)} 0 ${f(top + 0.02)}Q${f(hw / 2)} ${f(top + 0.32)} ${f(hw)} ${f(top + 0.02)}`;
  s += `<path d="${rope}" fill="none" stroke="${c.rope || '#B5453A'}" stroke-width="0.07" stroke-linecap="round"/>`;
  s += `<path d="${rope}" fill="none" stroke="#F4EBDD" stroke-opacity="0.35" stroke-width="0.02" stroke-linecap="round"/>`;
  return prop('barrier', 3.0, 0.6, [-hw - 0.15, top - 0.1, hw + 0.15, 0.2], s);
}

// ---- tree: cfg { kind: 'plane' | 'palm', leaf: [a, b], trunk } ; footprint 0.8 x 0.8, canopy overhangs ----
function tree(c) {
  const r = rng(c.seed || 3);
  let s = ell(0, 0.08, 0.4, 0.22, '#1E1F25', { ink: 0, op: 0.4 });
  s += rect(-0.1, -1.0, 0.2, 1.05, c.trunk || '#6B4A2C', { lw: LW });
  if (c.kind === 'palm') {
    const cy = -1.15;
    for (let i = 0; i < 9; i++) { const a = i * Math.PI * 2 / 9 + 0.2, len = 0.85; s += path(`M0 ${f(cy)}Q${f(Math.cos(a) * len * 0.5)} ${f(cy + Math.sin(a) * len * 0.25 - 0.28)} ${f(Math.cos(a) * len)} ${f(cy + Math.sin(a) * len * 0.5)}Q${f(Math.cos(a) * len * 0.5)} ${f(cy + Math.sin(a) * len * 0.25 - 0.1)} 0 ${f(cy)}Z`, c.leaf[i % 2], { lw: LW * 0.8 }); }
    s += ell(0, cy, 0.09, 0.07, '#5A3A20', { lw: LW * 0.7 });
    return prop('tree', 0.8, 0.8, [-0.95, -1.7, 0.95, 0.2], s);
  }
  for (let i = 0; i < 12; i++) { const a = r() * 6.28, rr = 0.2 + r() * 0.5; s += ell(Math.cos(a) * rr, -1.15 + Math.sin(a) * rr * 0.6, 0.38, 0.3, c.leaf[i % 2], { lw: LW * 0.9 }); }
  s += ell(-0.18, -1.35, 0.3, 0.2, c.leaf[1], { ink: 0, op: 0.55 });
  return prop('tree', 0.8, 0.8, [-1.05, -1.75, 1.05, 0.2], s);
}

module.exports = { tables, bench, bin, planter, bollard, barrier, stanchion, tree };
