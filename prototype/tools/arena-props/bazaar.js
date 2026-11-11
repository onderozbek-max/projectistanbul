// Kapalıçarşı street kit, authored (R1-T3, D-057): jeweller counter (lx_stall), rolled carpets (crates), tea-tray cart, turquoise pot (planter).
// Brief: docs/hood-visual-briefs.md (Kapalıçarşı). Colours: kilim red #8E2B2B, turquoise #2A7F80, brass, tea_amber. Footprints: stall 1.8x1.6, crates 1.0x1.0, cart 1.4x0.9, planter 1.2x1.2.
// Sign text is not baked in (language): a `label` tells the game where to write a P.t key.
'use strict';
const L = require('./lib');
const { rect, ell, line, poly, path, box, drum, wheel, tea, prop, rng, f, INK, LW } = L;

const BRASS = '#D9A441', BRASS_D = '#9C6B1E', KILIM = '#8E2B2B', TURQ = '#2A7F80';

function jewellerStall() {
  const w = 1.8, d = 1.6, hg = 0.85, yb = d / 2, yt = yb - d - hg;
  let s = box(0, 0, w, d, hg, '#3B2A3A', '#5B3A24');
  s += rect(-w / 2 + 0.08, yt + 0.08, w - 0.16, d - 0.16, '#6E4E7A', { lw: LW * 0.8 });   // velvet top
  s += rect(-w / 2 + 0.14, yt + 0.14, w - 0.28, d * 0.55, '#CFE6EE', { lw: LW * 0.8, op: 0.9 });   // glass case
  const r = rng(11);
  for (let i = 0; i < 9; i++) {
    const x = -w / 2 + 0.28 + (i % 5) * 0.3 + (i > 4 ? 0.15 : 0), y = yt + 0.3 + Math.floor(i / 5) * 0.34;
    s += ell(x, y, 0.07, 0.052, BRASS, { lw: LW * 0.7 }) + ell(x, y, 0.028, 0.02, i % 3 ? '#C0392B' : '#2A7F80', { lw: LW * 0.5 });
  }
  for (let i = 0; i < 3; i++) s += path(`M${f(-0.55 + i * 0.55)} ${f(yt + d - 0.5)}q0.1 0.18 0.22 0`, null, { ink: BRASS, lw: LW * 1.3 });
  s += rect(-w / 2, yb - hg, w, 0.06, BRASS, { lw: LW * 0.7 });
  const cy0 = yt - 0.46, sw = w / 7;   // striped awning over the back half
  for (let i = 0; i < 7; i++) s += rect(-w / 2 + i * sw, cy0, sw, 0.62, i % 2 ? '#F4EBDD' : KILIM, { lw: LW * 0.6 });
  for (let i = 0; i < 7; i++) s += path(`M${f(-w / 2 + i * sw)} ${f(cy0 + 0.62)}Q${f(-w / 2 + (i + 0.5) * sw)} ${f(cy0 + 0.78)} ${f(-w / 2 + (i + 1) * sw)} ${f(cy0 + 0.62)}Z`, i % 2 ? '#F4EBDD' : KILIM, { lw: LW * 0.6 });
  s += L.edges(-w / 2, cy0, w, 0.7, { k: 0.8 });
  s += ell(0.7, yt + 0.9, 0.05, 0.04, '#FFD27A', { lw: LW * 0.5 });
  return prop('lx_stall', w, d, [-w / 2 - 0.05, cy0 - 0.02, w / 2 + 0.05, yb + 0.06], s, { label: { key: 'sign.kuyumcu', text: 'Nazlı Kuyumcu', x: -0.8, y: yb - hg + 0.1, w: 1.6, h: 0.5, col: '#FFE2A8' } });
}

// Rolled carpets: a pile of kilim rolls, ends showing their pattern.
function roll(cx, cy, len, col, band) {
  const r = 0.15;
  let s = rect(cx - len / 2, cy - r, len, r * 2, col, { rx: r * 0.9 });
  for (let x = cx - len / 2 + 0.2; x < cx + len / 2 - 0.12; x += 0.16) s += poly([[x, cy], [x + 0.06, cy - r * 0.62], [x + 0.12, cy], [x + 0.06, cy + r * 0.62]], band, { ink: 0, op: 0.95 });
  s += rect(cx - len / 2 + 0.09, cy - r, 0.04, r * 2, band, { ink: 0, op: 0.9 }) + rect(cx + len / 2 - 0.13, cy - r, 0.04, r * 2, band, { ink: 0, op: 0.9 });
  s += ell(cx - len / 2 + 0.01, cy, r * 0.5, r, band, { lw: LW * 0.8 }) + ell(cx - len / 2 + 0.01, cy, r * 0.2, r * 0.4, col, { lw: LW * 0.6 }) + ell(cx - len / 2 + 0.01, cy, r * 0.08, r * 0.16, band, { ink: 0 });
  s += line(cx - len / 2 + 0.14, cy - r + 0.035, cx + len / 2 - 0.1, cy - r + 0.035, '#fff', 0.022, { op: 0.4 });
  return s;
}
function carpets() {
  const rows = [[-0.12, -0.36, 0.96, KILIM, '#E4A93B'], [0.1, -0.1, 0.98, TURQ, '#F4EBDD'], [-0.1, 0.14, 0.94, '#B5651D', '#2B3050'], [0.18, 0.38, 0.7, '#2B3050', '#E4A93B']];
  let s = ell(0, -0.02, 0.58, 0.4, '#1E1F25', { ink: 0, op: 0.35 });
  rows.forEach(r => { s += roll(r[0], r[1], r[2], r[3], r[4]); });
  s += rect(-0.62, 0.3, 0.34, 0.12, '#F4EBDD', { rx: 0.02, lw: LW * 0.7 }) + line(-0.57, 0.36, -0.33, 0.36, KILIM, 0.025);
  return prop('crates', 1.0, 1.0, [-0.72, -0.56, 0.72, 0.56], s);
}

function teaCart() {
  const w = 1.4, d = 0.9, hg = 0.5, yb = d / 2, yt = yb - d - hg, mid = yt + d / 2;
  let s = box(0, 0, w, d, hg, '#7A4A22', '#4B2B12');
  s += line(0, yb - 0.02, 0, yb + 0.34, INK, 0.08) + line(0, yb - 0.02, 0, yb + 0.34, '#B07A45', 0.05) + wheel(-0.52, yb + 0.02, 0.17) + wheel(0.52, yb + 0.02, 0.17);
  s += rect(-w / 2, yb - hg, w, 0.05, BRASS, { lw: LW * 0.7 });
  s += ell(0.18, mid, 0.5, 0.3, BRASS, { lw: LW * 0.9 }) + ell(0.18, mid, 0.42, 0.24, '#E8BE63', { lw: LW * 0.5 });
  for (let i = 0; i < 7; i++) { const a = i * Math.PI * 2 / 7; s += tea(0.18 + Math.cos(a) * 0.3, mid + Math.sin(a) * 0.14 + 0.05); }
  s += drum(-0.46, mid + 0.12, 0.19, 0.095, 0.4, '#E8BE63', BRASS_D);
  s += drum(-0.46, mid - 0.2, 0.1, 0.05, 0.12, BRASS, BRASS_D, { lw: LW * 0.8 });
  s += `<circle cx="-0.46" cy="${f(mid - 0.55)}" r="0.07" fill="#fff" opacity="0.3"/><circle cx="-0.42" cy="${f(mid - 0.7)}" r="0.09" fill="#fff" opacity="0.2"/>`;
  return prop('cart', 1.4, 0.9, [-0.76, mid - 0.82, 0.76, yb + 0.5], s, { label: { key: 'sign.kahveci', text: 'Kahveci Sadık', x: -0.62, y: yb - hg + 0.07, w: 1.24, h: 0.32, col: '#FFE2A8' } });
}

// Turquoise glazed pot with a small bush.
function pot() {
  const r = 0.46, hg = 0.5, cy = 0.2;
  let s = ell(0, cy + 0.05, r * 1.15, 0.3, '#1E1F25', { ink: 0, op: 0.4 });
  s += drum(0, cy, r, 0.26, hg, '#1F5E5F', TURQ);
  s += `<path d="M${f(-r * 0.9)} ${f(cy - hg * 0.55)}Q0 ${f(cy - hg * 0.35)} ${f(r * 0.9)} ${f(cy - hg * 0.55)}" fill="none" stroke="#F4EBDD" stroke-width="0.035" stroke-linecap="round"/>`;
  for (let i = 0; i < 6; i++) s += ell(-0.34 + i * 0.14, cy - hg * 0.28, 0.025, 0.02, '#E4A93B', { lw: LW * 0.4 });
  s += ell(0, cy - hg, r * 0.84, 0.2, '#3A2A1C', { lw: LW * 0.8 });
  const r2 = rng(5);
  for (let i = 0; i < 9; i++) { const a = r2() * 6.28, rr = r2() * 0.35; s += ell(Math.cos(a) * rr, cy - hg - 0.14 - r2() * 0.18 + Math.sin(a) * 0.08, 0.15, 0.11, i % 2 ? '#3E8A4F' : '#2E6E3F', { lw: LW * 0.8 }); }
  s += ell(0.1, cy - hg - 0.3, 0.05, 0.04, '#C0392B', { lw: LW * 0.5 }) + ell(-0.16, cy - hg - 0.24, 0.045, 0.035, '#E4A93B', { lw: LW * 0.5 });
  return prop('planter', 1.2, 1.2, [-0.62, cy - hg - 0.55, 0.62, cy + 0.34], s);
}

module.exports = { lx_stall: [jewellerStall()], crates: [carpets()], cart: [teaCart()], planter: [pot()] };
