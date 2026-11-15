// Ataköy street kit, authored (R1-T3, D-057): geranium planter box, courtyard bin, courtyard bench, parked car (two colours).
// Brief: docs/hood-visual-briefs.md (Ataköy). Colours: paper stucco #D8CBB6, bosphorus_blue shutters, tea_amber trim, night_ink roofs. Footprints: planter 1.2x1.2, bin 0.6x0.6, bench 0.6x1.8, car 1.9x4.2.
'use strict';
const L = require('./lib');
const { rect, ell, line, poly, path, box, drum, prop, rng, f, INK, LW } = L;

const STUCCO = '#D8CBB6', STUCCO_D = '#A99A82', BLUE = '#2F6F9F', BLUE_D = '#1E4A6E', AMBER = '#B5651D';

function planter() {
  const w = 1.1, d = 0.9, hg = 0.42, yb = d / 2, yt = yb - d - hg;
  let s = box(0, 0.02, w, d, hg, '#3A2A1C', STUCCO);
  s += rect(-w / 2, yb + 0.02 - hg, w, 0.06, AMBER, { lw: LW * 0.7 });
  s += rect(-w / 2 + 0.05, yt + 0.07, w - 0.1, d - 0.14, '#3A2A1C', { lw: LW * 0.8 });
  const r = rng(21);
  for (let i = 0; i < 14; i++) { const x = (r() - 0.5) * (w - 0.3), y = yt + 0.18 + r() * (d - 0.36); s += ell(x, y, 0.13, 0.095, i % 2 ? '#3E8A4F' : '#2E6E3F', { lw: LW * 0.8 }); }
  for (let i = 0; i < 9; i++) { const x = (r() - 0.5) * (w - 0.3), y = yt + 0.16 + r() * (d - 0.36); s += ell(x, y, 0.06, 0.045, i % 3 ? '#D7263D' : '#F2A0A8', { lw: LW * 0.6 }) + ell(x, y, 0.02, 0.015, '#FFF3C9', { ink: 0 }); }
  return prop('planter', 1.2, 1.2, [-0.6, yt - 0.04, 0.6, yb + 0.1], s);
}

function bin() {
  const r = 0.22, hg = 0.6, cy = 0.14;
  let s = ell(0, cy + 0.02, r * 1.2, 0.14, '#1E1F25', { ink: 0, op: 0.4 });
  s += drum(0, cy, r, 0.12, hg, '#33473B', '#4C7A5E');
  s += rect(-r, cy - hg * 0.55, r * 2, 0.06, '#F4EBDD', { lw: LW * 0.6, rx: 0.01 });
  s += ell(0, cy - hg, r * 0.55, 0.065, '#0F1713');
  s += path(`M${f(0.04)} ${f(cy - hg - 0.02)}L${f(0.1)} ${f(cy - hg - 0.15)}L${f(0.14)} ${f(cy - hg - 0.02)}Z`, '#E8DCC6', { lw: LW * 0.7 });
  return prop('bin', 0.6, 0.6, [-0.3, cy - hg - 0.2, 0.3, cy + 0.2], s);
}

function bench() {
  const w = 0.6, d = 1.8, hg = 0.32;
  let s = box(-0.27, 0, 0.07, d - 0.1, 0.6, '#3F82B4', BLUE_D);
  s += rect(-0.26, d / 2 - hg - 0.02, 0.08, hg + 0.04, '#1E1F25', { lw: LW * 0.7 }) + rect(0.2, d / 2 - hg - 0.02, 0.08, hg + 0.04, '#1E1F25', { lw: LW * 0.7 });
  s += box(0, 0, w, d, hg, '#5B9BC8', BLUE_D);
  for (let i = 1; i < 4; i++) s += line(-w / 2 + (w / 4) * i, -d / 2 - hg + 0.04, -w / 2 + (w / 4) * i, d / 2 - hg - 0.04, INK, 0.022);
  s += line(-w / 2 + 0.05, -d / 2 - hg + 0.1, -w / 2 + 0.05, d / 2 - hg - 0.1, '#fff', 0.02, { op: 0.4 });
  return prop('bench', 0.6, 1.8, [-0.36, -d / 2 - hg - 0.62, 0.36, d / 2 + 0.04], s);
}

// Parked hatchback seen from above and slightly forward: the nose faces the viewer (bottom of the screen), the tail is at the far edge.
function car(col, dark, roof) {
  const w = 1.9, d = 4.2, hg = 0.7, yb = d / 2, yt = yb - d - hg, T = y => yt + y;
  let s = ell(0, 0.1, 1.15, 2.0, '#1E1F25', { ink: 0, op: 0.35 });
  [-1, 1].forEach(sx => [-1.2, 1.3].forEach(y => { s += rect(sx * (w / 2) - (sx > 0 ? 0.02 : 0.18), y - 0.3 + 0.2, 0.2, 0.62, '#1E1F25', { rx: 0.06, lw: LW * 0.7 }); }));
  s += box(0, 0, w, d, hg, col, dark, { k: 1 });
  s += poly([[-w / 2 + 0.34, T(0.74)], [w / 2 - 0.34, T(0.74)], [w / 2 - 0.2, T(1.24)], [-w / 2 + 0.2, T(1.24)]], '#7FA7B8', { lw: LW * 0.9 });   // rear glass
  s += rect(-w / 2 + 0.2, T(1.24), w - 0.4, 1.12, roof, { lw: LW * 0.9 });   // roof
  s += poly([[-w / 2 + 0.2, T(2.36)], [w / 2 - 0.2, T(2.36)], [w / 2 - 0.34, T(2.96)], [-w / 2 + 0.34, T(2.96)]], '#9FC6D6', { lw: LW * 0.9 });   // windscreen
  s += path(`M${f(-w / 2 + 0.3)} ${f(T(3.02))}L${f(-w / 2 + 0.16)} ${f(T(4.1))}L${f(w / 2 - 0.16)} ${f(T(4.1))}L${f(w / 2 - 0.3)} ${f(T(3.02))}Z`, col, { lw: LW * 0.8, k: 1 });   // bonnet
  s += line(0, T(3.1), 0, T(4.05), INK, 0.02, { op: 0.35 });
  s += line(-w / 2 + 0.3, T(1.34), w / 2 - 0.3, T(1.34), '#fff', 0.025, { op: 0.45 });
  s += rect(-w / 2 + 0.12, yb - hg + 0.04, 0.4, 0.11, '#FFE9A8', { lw: LW * 0.7 }) + rect(w / 2 - 0.52, yb - hg + 0.04, 0.4, 0.11, '#FFE9A8', { lw: LW * 0.7 });   // headlights
  s += rect(-0.45, yb - hg + 0.06, 0.9, 0.08, '#2A2C31', { lw: LW * 0.6 }) + rect(-0.2, yb - 0.2, 0.4, 0.14, '#F4EBDD', { lw: LW * 0.7 });   // grille and plate
  s += rect(-w / 2 + 0.1, T(0.04), 0.3, 0.09, '#C0392B', { lw: LW * 0.6 }) + rect(w / 2 - 0.4, T(0.04), 0.3, 0.09, '#C0392B', { lw: LW * 0.6 });   // tail lights
  return prop('car', w, d, [-w / 2 - 0.12, yt - 0.04, w / 2 + 0.12, yb + 0.08], s);
}

module.exports = { planter: [planter()], bin: [bin()], bench: [bench()], car: [car('#4E7E9C', '#2F5670', '#6E97B0'), car('#D9D4C7', '#9B9486', '#EFEBE0')] };
