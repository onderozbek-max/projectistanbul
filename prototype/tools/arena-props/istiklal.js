// İstiklal street kit, authored (R1-T3, D-057): café tables, simit cart, chestnut cart, bench, bin.
// Brief: docs/hood-visual-briefs.md (İstiklal). Footprints match config-levels.js kinds: tables 1.2x1.2, cart 1.4x0.9, bench 0.6x1.8, bin 0.6x0.6.
// Sign text is not baked in (language): a `label` tells the game where to write a P.t key.
'use strict';
const L = require('./lib');
const { rect, ell, line, poly, path, box, drum, wheel, simit, tea, prop, rng, f, INK, LW } = L;

const CLOTH = '<defs><pattern id="ck" width="0.12" height="0.12" patternUnits="userSpaceOnUse"><rect width="0.12" height="0.12" fill="#F4EBDD"/><rect width="0.06" height="0.12" fill="#C0392B" opacity="0.55"/><rect width="0.12" height="0.06" fill="#C0392B" opacity="0.55"/></pattern></defs>';

function table(cx, cy) {
  const th = 0.36, rx = 0.3, ry = 0.2;
  let s = ell(cx, cy + 0.03, rx * 0.95, ry * 0.8, '#1E1F25', { ink: 0, op: 0.4 });
  s += path(`M${f(cx - rx)} ${f(cy - th)}L${f(cx - rx * 0.92)} ${f(cy - th + 0.16)}Q${f(cx)} ${f(cy - th + 0.16 + ry * 1.2)} ${f(cx + rx * 0.92)} ${f(cy - th + 0.16)}L${f(cx + rx)} ${f(cy - th)}Z`, '#E8DCC6');
  s += ell(cx, cy - th, rx, ry, 'url(#ck)');
  s += `<path d="M${f(cx - rx * 0.8)} ${f(cy - th - 0.05)}A${f(rx)} ${f(ry)} 0 0 1 ${f(cx + rx * 0.1)} ${f(cy - th - ry * 0.95)}" fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="0.025" stroke-linecap="round"/>`;
  s += tea(cx - 0.1, cy - th - 0.02) + tea(cx + 0.12, cy - th + 0.05);
  return s;
}
function chair(cx, cy, back) {   // bentwood chair from above: round seat, arched back on the side given by back (-1 left, 1 right, 0 far)
  let s = ell(cx, cy + 0.02, 0.15, 0.09, '#1E1F25', { ink: 0, op: 0.35 });
  s += ell(cx, cy - 0.1, 0.14, 0.1, '#7A4A22') + ell(cx, cy - 0.1, 0.09, 0.062, '#C98A45', { lw: LW * 0.5 });
  if (back) s += path(`M${f(cx + back * 0.13)} ${f(cy - 0.2)}Q${f(cx + back * 0.2)} ${f(cy - 0.38)} ${f(cx + back * 0.09)} ${f(cy - 0.42)}`, null, { lw: LW * 1.8, ink: '#4B2B12' });
  else s += path(`M${f(cx - 0.12)} ${f(cy - 0.18)}Q${f(cx)} ${f(cy - 0.34)} ${f(cx + 0.12)} ${f(cy - 0.18)}`, null, { lw: LW * 1.8, ink: '#4B2B12' });
  return s;
}

function tables() {
  const a = [-0.34, -0.2], b = [0.32, 0.26];
  const body = CLOTH + chair(a[0] - 0.42, a[1] + 0.12, -1) + chair(a[0], a[1] - 0.3, 0) + table(a[0], a[1]) + chair(a[0] + 0.1, a[1] + 0.42, 0) +
    chair(b[0] + 0.44, b[1] + 0.02, 1) + chair(b[0] - 0.42, b[1] + 0.14, -1) + table(b[0], b[1]);
  return prop('tables', 1.2, 1.2, [-0.9, -1.0, 0.9, 0.68], body);
}

function simitCart() {
  const w = 1.4, d = 0.9, hg = 0.55, yb = d / 2, yt = yb - d - hg;
  let s = box(0, 0, w, d, hg, '#CFE6EE', '#B5401D');
  s += line(0, yb - 0.02, 0, yb + 0.34, INK, 0.08) + line(0, yb - 0.02, 0, yb + 0.34, '#8A8F98', 0.05) + wheel(-0.52, yb + 0.02, 0.15) + wheel(0.52, yb + 0.02, 0.15);
  s += rect(-w / 2, yb - hg, w, 0.05, '#E4A93B');
  s += line(-w / 2 + 0.05, yt + 0.05, w / 2 - 0.05, yt + 0.05, '#fff', 0.025, { op: 0.6 });
  for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) s += simit(-0.52 + c * 0.26 + (r ? 0.1 : 0), yt + 0.28 + r * 0.3, 0.1, 0.085);
  for (let c = -0.5; c <= 0.5; c += 0.25) s += simit(c, yt + 0.82, 0.07, 0.06).replace(/<circle[^>]*>/g, '');
  const cy0 = yt - 0.28, cy1 = yt + 0.3, sw = w / 8;
  s += line(-w / 2 + 0.05, yt + 0.3, -w / 2 + 0.05, yt + 0.02, INK, 0.04) + line(w / 2 - 0.05, yt + 0.3, w / 2 - 0.05, yt + 0.02, INK, 0.04);
  for (let i = 0; i < 8; i++) s += rect(-w / 2 + i * sw, cy0, sw, cy1 - cy0, i % 2 ? '#F4EBDD' : '#C0392B', { lw: LW * 0.6 });
  for (let i = 0; i < 8; i++) s += path(`M${f(-w / 2 + i * sw)} ${f(cy1)}Q${f(-w / 2 + (i + 0.5) * sw)} ${f(cy1 + 0.12)} ${f(-w / 2 + (i + 1) * sw)} ${f(cy1)}Z`, i % 2 ? '#F4EBDD' : '#C0392B', { lw: LW * 0.6 });
  s += L.edges(-w / 2, cy0, w, cy1 - cy0 + 0.1, { k: 0.8 });
  return prop('cart', 1.4, 0.9, [-0.76, cy0 - 0.02, 0.76, yb + 0.5], s, { label: { key: 'sign.simit', x: -0.5, y: yb - hg + 0.1, w: 1.0, h: 0.34, col: '#FFE2A8' } });
}

function chestnutCart() {
  const w = 1.4, d = 0.9, hg = 0.5, yb = d / 2, yt = yb - d - hg, mid = yt + d / 2;
  let s = box(0, 0, w, d, hg, '#6B4A2C', '#2E5D43');
  s += line(0, yb - 0.02, 0, yb + 0.34, INK, 0.08) + line(0, yb - 0.02, 0, yb + 0.34, '#7A5530', 0.05) + wheel(-0.52, yb + 0.02, 0.17) + wheel(0.52, yb + 0.02, 0.17);
  s += rect(-w / 2, yb - hg, w, 0.045, '#C9A24B');
  s += rect(0.1, yt + 0.12, 0.52, d - 0.24, '#8A6A44', { lw: LW * 0.8 });
  const r = rng(7);
  for (let i = 0; i < 16; i++) { const x = 0.17 + r() * 0.38, y = yt + 0.2 + r() * (d - 0.4); s += ell(x, y, 0.045, 0.034, '#7A3E1C', { lw: LW * 0.5 }) + `<path d="M${f(x - 0.02)} ${f(y - 0.01)}L${f(x + 0.015)} ${f(y - 0.012)}" stroke="#E7B77A" stroke-width="0.01"/>`; }
  s += ell(-0.38, mid + 0.08, 0.3, 0.12, '#14151F', { ink: 0, op: 0.35 });
  s += drum(-0.38, mid + 0.06, 0.26, 0.13, 0.28, '#C77B3A', '#A65F2A');
  s += ell(-0.38, mid - 0.22, 0.17, 0.085, '#FF8A3A', { lw: LW * 0.7 }) + ell(-0.38, mid - 0.22, 0.09, 0.045, '#FFD27A', { ink: 0 });
  s += drum(-0.14, mid - 0.2, 0.06, 0.03, 0.3, '#8A8F98', '#5A5F68', { lw: LW * 0.8 });
  s += `<circle cx="-0.14" cy="${f(mid - 0.62)}" r="0.07" fill="#fff" opacity="0.3"/><circle cx="-0.1" cy="${f(mid - 0.78)}" r="0.09" fill="#fff" opacity="0.22"/>`;
  s += poly([[0.66, yt + 0.22], [0.78, yt + 0.22], [0.72, yt + 0.02]], '#F4EBDD', { lw: LW * 0.7 });
  return prop('cart', 1.4, 0.9, [-0.76, mid - 0.9, 0.82, yb + 0.5], s, { label: { key: 'sign.kestane', x: -0.62, y: yb - hg + 0.07, w: 1.24, h: 0.32, col: '#F4EBDD' } });
}

function bench() {
  const w = 0.6, d = 1.8, hg = 0.32;
  let s = box(-0.27, 0, 0.07, d - 0.1, 0.6, '#B07A45', '#6A4524');
  s += rect(-0.26, d / 2 - hg - 0.02, 0.08, hg + 0.04, '#1E1F25', { lw: LW * 0.7 }) + rect(0.2, d / 2 - hg - 0.02, 0.08, hg + 0.04, '#1E1F25', { lw: LW * 0.7 });
  s += box(0, 0, w, d, hg, '#9B6B3E', '#5E3E22');
  for (let i = 1; i < 4; i++) s += line(-w / 2 + (w / 4) * i, -d / 2 - hg + 0.04, -w / 2 + (w / 4) * i, d / 2 - hg - 0.04, INK, 0.022);
  for (let i = 1; i < 6; i++) s += line(-w / 2 + 0.03, -d / 2 - hg + i * d / 6, w / 2 - 0.03, -d / 2 - hg + i * d / 6, INK, 0.014, { op: 0.45 });
  return prop('bench', 0.6, 1.8, [-0.36, -d / 2 - hg - 0.62, 0.36, d / 2 + 0.04], s);
}

function bin() {
  const r = 0.22, hg = 0.62, cy = 0.14;
  let s = ell(0, cy + 0.02, r * 1.2, 0.14, '#1E1F25', { ink: 0, op: 0.4 });
  s += drum(0, cy, r, 0.12, hg, '#27382F', '#3F6B52');
  s += rect(-r, cy - hg * 0.62, r * 2, 0.07, '#E4A93B', { lw: LW * 0.6, rx: 0.01 });
  s += ell(0, cy - hg, r * 0.55, 0.065, '#0F1713');
  s += path(`M${f(-0.06)} ${f(cy - hg - 0.03)}L${f(0.02)} ${f(cy - hg - 0.17)}L${f(0.09)} ${f(cy - hg - 0.04)}Z`, '#F4EBDD', { lw: LW * 0.7 });
  return prop('bin', 0.6, 0.6, [-0.3, cy - hg - 0.22, 0.3, cy + 0.2], s);
}

module.exports = { tables: [tables()], cart: [simitCart(), chestnutCart()], bench: [bench()], bin: [bin()] };
