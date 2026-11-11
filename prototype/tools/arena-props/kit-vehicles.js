// Parametric street kit, part 3 (R1-T3, D-057): taxi, dolmuş, moored boat, delivery truck. Configs come from tools/arena-props/hoods.js.
// Cars face the viewer (nose at the bottom of the screen); the truck has its cab at the top; boats have their bow at the top.
'use strict';
const L = require('./lib');
const { rect, ell, line, poly, path, box, prop, rng, f, INK, LW } = L;

// ---- road vehicle: cfg { kind: 'taxi' | 'dolmus' | 'car', body, dark, roof, stripe, sign } ----
function vehicle(c) {
  const mini = c.kind === 'dolmus', w = mini ? 2.2 : 1.9, d = mini ? 5.0 : 4.2, hg = mini ? 0.95 : 0.7, yb = d / 2, yt = yb - d - hg, T = y => yt + y, k = d / 4.2;
  let s = ell(0, 0.1, w * 0.6, d * 0.47, '#1E1F25', { ink: 0, op: 0.35 });
  [-1, 1].forEach(sx => [-d * 0.29, d * 0.31].forEach(y => { s += rect(sx * (w / 2) - (sx > 0 ? 0.02 : 0.18), y - 0.1, 0.2, 0.62, '#1E1F25', { rx: 0.06, lw: LW * 0.7 }); }));
  s += box(0, 0, w, d, hg, c.body, c.dark, { k: 1 });
  if (c.stripe) s += rect(-w / 2, yb - hg * 0.55, w, 0.1, c.stripe, { lw: LW * 0.6 }) + rect(-0.12, T(0.4), 0.24, d - 0.8, c.stripe, { ink: 0, op: 0.55 });
  s += poly([[-w / 2 + 0.34, T(0.74 * k)], [w / 2 - 0.34, T(0.74 * k)], [w / 2 - 0.2, T(1.24 * k)], [-w / 2 + 0.2, T(1.24 * k)]], '#7FA7B8', { lw: LW * 0.9 });
  s += rect(-w / 2 + 0.2, T(1.24 * k), w - 0.4, (mini ? 2.0 : 1.12), c.roof, { lw: LW * 0.9 });
  const w0 = T(1.24 * k + (mini ? 2.0 : 1.12));
  s += poly([[-w / 2 + 0.2, w0], [w / 2 - 0.2, w0], [w / 2 - 0.34, w0 + 0.6], [-w / 2 + 0.34, w0 + 0.6]], '#9FC6D6', { lw: LW * 0.9 });
  s += path(`M${f(-w / 2 + 0.3)} ${f(w0 + 0.66)}L${f(-w / 2 + 0.16)} ${f(T(d - 0.1))}L${f(w / 2 - 0.16)} ${f(T(d - 0.1))}L${f(w / 2 - 0.3)} ${f(w0 + 0.66)}Z`, c.body, { lw: LW * 0.8, k: 1 });
  s += line(0, w0 + 0.74, 0, T(d - 0.15), INK, 0.02, { op: 0.35 }) + line(-w / 2 + 0.3, T(1.34 * k), w / 2 - 0.3, T(1.34 * k), '#fff', 0.025, { op: 0.4 });
  if (c.sign) s += rect(-0.2, T(1.24 * k) + 0.4, 0.4, 0.16, c.sign, { rx: 0.03, lw: LW * 0.8 }) + ell(0, T(1.24 * k) + 0.48, 0.05, 0.03, '#fff', { ink: 0, op: 0.7 });
  s += rect(-w / 2 + 0.12, yb - hg + 0.04, 0.4, 0.11, '#FFE9A8', { lw: LW * 0.7 }) + rect(w / 2 - 0.52, yb - hg + 0.04, 0.4, 0.11, '#FFE9A8', { lw: LW * 0.7 });
  s += rect(-0.45, yb - hg + 0.06, 0.9, 0.08, '#2A2C31', { lw: LW * 0.6 }) + rect(-0.2, yb - 0.2, 0.4, 0.14, '#F4EBDD', { lw: LW * 0.7 });
  s += rect(-w / 2 + 0.1, T(0.04), 0.3, 0.09, '#C0392B', { lw: LW * 0.6 }) + rect(w / 2 - 0.4, T(0.04), 0.3, 0.09, '#C0392B', { lw: LW * 0.6 });
  return prop(c.kind === 'dolmus' ? 'dolmus' : c.kind === 'taxi' ? 'taxi' : 'car', w, d, [-w / 2 - 0.12, yt - 0.04, w / 2 + 0.12, yb + 0.08], s);
}

// ---- moored boat: cfg { kind: 'fishing' | 'yacht', hull, deck, stripe, cabin } ; 1.8 x 3.4, bow up ----
function boat(c) {
  const w = 1.8, d = 3.4, h = d / 2, hull = pts => poly(pts, c.hull, { lw: LW * 1.2 });
  let s = ell(0.05, 0.05, w * 0.62, d * 0.5, '#0E2A38', { ink: 0, op: 0.35 });
  s += hull([[0, -h], [w * 0.36, -h * 0.55], [w * 0.5, -h * 0.1], [w * 0.5, h], [-w * 0.5, h], [-w * 0.5, -h * 0.1], [-w * 0.36, -h * 0.55]]);
  s += poly([[0, -h + 0.14], [w * 0.3, -h * 0.55], [w * 0.42, -h * 0.1], [w * 0.42, h - 0.1], [-w * 0.42, h - 0.1], [-w * 0.42, -h * 0.1], [-w * 0.3, -h * 0.55]], c.deck, { lw: LW * 0.9 });
  s += path(`M${f(-w * 0.5)} ${f(h * 0.1)}L${f(-w * 0.5)} ${f(h)}`, null, { ink: c.stripe, lw: 0.07 }) + path(`M${f(w * 0.5)} ${f(h * 0.1)}L${f(w * 0.5)} ${f(h)}`, null, { ink: c.stripe, lw: 0.07 });
  s += line(-w * 0.4, -h * 0.3, -w * 0.15, -h * 0.55, '#fff', 0.025, { op: 0.4 });
  if (c.kind === 'fishing') {
    s += box(0, h * 0.25, 0.9, 0.9, 0.55, c.cabin, '#6B4A2C') + rect(-0.3, h * 0.25 - 0.55 - 0.45 + 0.18, 0.6, 0.18, '#9FC6D6', { lw: LW * 0.7 });
    s += ell(-0.4, -h * 0.1, 0.22, 0.14, '#D9C9A1', { lw: LW * 0.8 }) + ell(0.42, -h * 0.2, 0.1, 0.1, '#D9663A', { lw: LW * 0.8 }) + ell(0.32, -h * 0.08, 0.09, 0.09, '#F2C94C', { lw: LW * 0.8 });
  } else {
    s += box(0, h * 0.2, 1.0, 1.1, 0.5, c.cabin, '#CFD6DC') + rect(-0.42, h * 0.2 - 0.5 - 0.55 + 0.2, 0.84, 0.22, '#7FA7B8', { lw: LW * 0.7 });
    s += line(0, -h * 0.2, 0, h * 0.2 - 0.9, INK, 0.04) + ell(0, -h * 0.2, 0.05, 0.035, '#C9A227', { lw: LW * 0.6 });
  }
  s += rect(-0.3, h - 0.13, 0.6, 0.07, '#14151F', { ink: 0, op: 0.35 });
  return prop('lx_boat', w, d, [-w * 0.5 - 0.1, -h - 0.08, w * 0.5 + 0.1, h + 0.1], s);
}

// ---- delivery truck: cfg { box, cab, stripe, ribs } ; 2.2 x 5.0, cab at the top ----
function truck(c) {
  const w = 2.2, d = 5.0, hg = 0.95, yb = d / 2, yt = yb - d - hg;
  let s = ell(0, 0.1, w * 0.62, d * 0.48, '#1E1F25', { ink: 0, op: 0.35 });
  [-1, 1].forEach(sx => [-1.7, 1.2, 1.9].forEach(y => { s += rect(sx * (w / 2) - (sx > 0 ? 0.02 : 0.2), y - 0.1, 0.22, 0.66, '#1E1F25', { rx: 0.06, lw: LW * 0.7 }); }));
  s += box(0, -d * 0.36, w, d * 0.26, hg * 0.7, c.cab, c.cab, { k: 1 }) + rect(-0.8, -d * 0.36 - hg * 0.7 + 0.1, 1.6, 0.34, '#2F3A46', { lw: LW * 0.9 });
  s += rect(-w / 2 - 0.1, -d * 0.36 - 0.1, 0.1, 0.22, '#1E1F25', { lw: LW * 0.6 }) + rect(w / 2, -d * 0.36 - 0.1, 0.1, 0.22, '#1E1F25', { lw: LW * 0.6 });
  s += rect(-w / 2 + 0.12, -d * 0.36 + (d * 0.26) / 2 - hg * 0.7 + 0.04, 0.3, 0.09, '#FFE9A8', { lw: LW * 0.6 }) + rect(w / 2 - 0.42, -d * 0.36 + (d * 0.26) / 2 - hg * 0.7 + 0.04, 0.3, 0.09, '#FFE9A8', { lw: LW * 0.6 });
  s += box(0, 0.4, w, d * 0.74, hg, c.box, c.stripe || '#3E6A8A');
  const by0 = 0.4 + (d * 0.74) / 2 - d * 0.74 - hg;
  for (let i = 1; i < 6; i++) s += line(-w / 2 + 0.06, by0 + i * (d * 0.74) / 6, w / 2 - 0.06, by0 + i * (d * 0.74) / 6, INK, 0.025, { op: 0.45 });
  s += rect(-w / 2 + 0.1, by0 + 0.1, 0.07, d * 0.74 - 0.2, '#fff', { ink: 0, op: 0.25 });
  return prop('lx_truck', w, d, [-w / 2 - 0.14, -d * 0.36 - (d * 0.26) / 2 - hg * 0.7 - 0.04, w / 2 + 0.14, yb + 0.08], s);
}

module.exports = { vehicle, boat, truck };
