// R1-T3 skyline silhouettes (D-057, owner decision: side-edge peeks): distant landmarks seen from above as roof-level elevations.
// Units are metres, origin = the middle of the base, the shape rises into negative y. Same style as the rest of the arena art
// (night_ink outline, warm highlight top-left, cool shade bottom-right) but pulled toward a haze colour so it reads as far away.
// Religious buildings are background only and never shown damaged (narrative.md guardrails). Each builder returns
// { w, h, ax, ay, svg } with the inner edge fading out (see wrap) so a peek never ends in a hard cut over the lane.
'use strict';
const { INK, WARM, COOL, f, rect, ell, line, poly, path, edges } = require('../arena-props/lib.js');

const HAZE = '#9FB0C6';
// Mix a colour toward the haze; k = how far (0 = none).
function hz(hex, k) {
  const a = parseInt(hex.slice(1), 16), b = parseInt(HAZE.slice(1), 16), m = i => Math.round(((a >> i) & 255) * (1 - k) + ((b >> i) & 255) * k);
  return '#' + [16, 8, 0].map(i => ('0' + m(i).toString(16)).slice(-2)).join('');
}
const LW = 0.045;
const body = (x0, y0, w, h, col, o) => rect(x0, y0, w, h, col, Object.assign({ lw: LW }, o || {})) + edges(x0, y0, w, h, { k: 0.8 });

function wrap(bb, inner, side) {
  const pad = 0.15, x0 = bb[0] - pad, y0 = bb[1] - pad, w = bb[2] - bb[0] + 2 * pad, h = bb[3] - bb[1] + 2 * pad;
  // inner edge = the side facing the lane (x towards 0). side 1 = right-hand peek, its inner edge is on the left.
  const g = side > 0 ? [0, 1] : [1, 0];
  const mask = `<linearGradient id="m" x1="${g[0]}" y1="0" x2="${g[1]}" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.3" stop-color="#fff" stop-opacity="1"/></linearGradient><mask id="k" maskUnits="userSpaceOnUse" x="${f(x0)}" y="${f(y0)}" width="${f(w)}" height="${f(h)}"><rect x="${f(x0)}" y="${f(y0)}" width="${f(w)}" height="${f(h)}" fill="url(#m)"/></mask>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f(x0)} ${f(y0)} ${f(w)} ${f(h)}" width="${f(w * 100)}" height="${f(h * 100)}"><defs>${mask}</defs><g mask="url(#k)">${inner}</g></svg>`;
  return { w: +f(w), h: +f(h), ax: +f(-x0), ay: +f(-y0), svg };
}

const SHAPES = {
  // Galata Tower: stone cylinder, gallery with arched windows, conical lead cap.
  galata: () => {
    const st = hz('#BDAE90', 0.15), cap = hz('#4A5A6A', 0.2);
    let s = body(-0.85, -4.6, 1.7, 4.6, st) + body(-1.0, -5.2, 2.0, 0.6, hz('#A99A7C', 0.15)) + body(-0.9, -6.1, 1.8, 0.9, st);
    for (let i = 0; i < 4; i++) s += path(`M${f(-0.7 + i * 0.4)} -5.35L${f(-0.7 + i * 0.4)} -5.75Q${f(-0.5 + i * 0.4)} -5.95 ${f(-0.3 + i * 0.4)} -5.75L${f(-0.3 + i * 0.4)} -5.35Z`, '#2A3040', { lw: 0.025 });
    for (let i = 0; i < 3; i++) s += rect(-0.08, -3.9 + i * 1.2, 0.16, 0.5, '#2A3040', { lw: 0.02 });
    s += poly([[-1.05, -6.1], [1.05, -6.1], [0, -8.2]], cap, { lw: LW }) + line(0, -8.2, 0, -8.6, INK, 0.04);
    s += `<path d="M-0.4 -6.15L-0.05 -8.0" stroke="${WARM}" stroke-opacity="0.5" stroke-width="0.05" stroke-linecap="round"/>`;
    return wrap([-1.1, -8.7, 1.1, 0], s, 1);
  },
  // Mosque in the background: lead dome with a half dome, two slim minarets with pointed caps.
  dome: () => {
    const wall = hz('#CFC3A8', 0.18), lead = hz('#7C8794', 0.2);
    let s = body(-1.4, -1.5, 2.8, 1.5, wall) + path(`M-1.2 -1.5A1.2 1.0 0 0 1 1.2 -1.5Z`, lead, { lw: LW }) + path(`M-0.7 -2.4A0.7 0.55 0 0 1 0.7 -2.4Z`, lead, { lw: LW }) + line(0, -2.95, 0, -3.3, INK, 0.04);
    [-1.45, 1.45].forEach(x => { s += body(x - 0.14, -4.2, 0.28, 4.2, wall) + body(x - 0.2, -3.3, 0.4, 0.14, hz('#B6A98C', 0.18)) + poly([[x - 0.2, -4.2], [x + 0.2, -4.2], [x, -5.4]], lead, { lw: 0.04 }); });
    for (let i = 0; i < 4; i++) s += path(`M${f(-1.05 + i * 0.7)} -0.2L${f(-1.05 + i * 0.7)} -0.8Q${f(-0.85 + i * 0.7)} -1.05 ${f(-0.65 + i * 0.7)} -0.8L${f(-0.65 + i * 0.7)} -0.2Z`, '#2A3040', { lw: 0.02 });
    return wrap([-1.8, -5.5, 1.8, 0], s, 1);
  },
  // A lone minaret pair stands in for the many small mosques of the old city.
  minaret: () => {
    const wall = hz('#D3C8AE', 0.18), lead = hz('#7C8794', 0.2);
    let s = '';
    [-0.55, 0.55].forEach((x, i) => { const h = 4.6 + i * 0.9; s += body(x - 0.17, -h, 0.34, h, wall) + body(x - 0.26, -h * 0.72, 0.52, 0.16, hz('#B6A98C', 0.18)) + poly([[x - 0.26, -h], [x + 0.26, -h], [x, -h - 1.3]], lead, { lw: 0.04 }) + ell(x, -h - 1.35, 0.05, 0.05, '#C9A227', { lw: 0.015 }); });
    return wrap([-1.0, -6.9, 1.0, 0], s, 1);
  },
  // Station or clock tower (Sirkeci): square stone shaft, clock face, small hipped roof.
  clock: () => {
    const st = hz('#B7A68A', 0.18);
    let s = body(-0.8, -4.4, 1.6, 4.4, st) + body(-0.95, -4.7, 1.9, 0.3, hz('#A18F72', 0.18)) + poly([[-1.0, -4.7], [1.0, -4.7], [0, -5.9]], hz('#5A4A44', 0.2), { lw: LW });
    s += ell(0, -3.5, 0.45, 0.45, '#F1EBDD', { lw: 0.04 }) + line(0, -3.5, 0, -3.8, INK, 0.035) + line(0, -3.5, 0.2, -3.4, INK, 0.035);
    for (let i = 0; i < 3; i++) s += rect(-0.1, -2.6 + i * 0.9, 0.2, 0.4, '#2A3040', { lw: 0.02 });
    return wrap([-1.0, -5.9, 1.0, 0], s, 1);
  },
  // Beyazıt fire tower: tall stone tower with a gallery and a pointed roof.
  firetower: () => {
    const st = hz('#C4B496', 0.15);
    let s = body(-0.6, -6.2, 1.2, 6.2, st) + body(-0.85, -6.8, 1.7, 0.55, hz('#AD9C7E', 0.15)) + body(-0.7, -7.6, 1.4, 0.8, st) + poly([[-0.8, -7.6], [0.8, -7.6], [0, -9.0]], hz('#4A5A6A', 0.2), { lw: LW });
    for (let i = 0; i < 5; i++) s += rect(-0.07, -5.6 + i * 1.0, 0.14, 0.45, '#2A3040', { lw: 0.02 });
    return wrap([-0.9, -9.0, 0.9, 0], s, 1);
  },
  // City-wall tower (Yedikule, Samatya): round stone tower with battlements and an arrow slit.
  wallTower: () => {
    const st = hz('#A89878', 0.15);
    let s = body(-1.0, -3.6, 2.0, 3.6, st) + body(-1.15, -4.1, 2.3, 0.5, hz('#968764', 0.15));
    for (let i = 0; i < 4; i++) s += body(-1.15 + i * 0.62, -4.5, 0.48, 0.42, st, { lw: 0.035 });
    s += rect(-0.07, -3.0, 0.14, 0.7, '#2A3040', { lw: 0.02 }) + rect(0.45, -2.0, 0.14, 0.6, '#2A3040', { lw: 0.02 }) + body(-1.3, -1.2, 2.6, 1.2, hz('#968764', 0.15));
    return wrap([-1.35, -4.6, 1.35, 0], s, 1);
  },
  // Factory chimney stack with a banded top, and a sawtooth roof base (Zeytinburnu, Kazlıçeşme).
  chimney: () => {
    const br = hz('#8A5A44', 0.2);
    let s = poly([[-1.5, 0], [-1.5, -1.0], [-0.9, -1.4], [-0.9, -1.0], [-0.3, -1.4], [-0.3, 0]], hz('#7A7068', 0.2), { lw: LW });
    s += path(`M0.1 0L0.35 -6.2L0.7 -6.2L0.95 0Z`, br, { lw: LW }) + rect(0.2, -6.6, 0.6, 0.4, hz('#A0745A', 0.2), { lw: 0.04 }) + rect(0.33, -5.2, 0.34, 0.1, WARM, { ink: 0 }).replace('/>', ' fill-opacity="0.6"/>') + rect(0.28, -4.0, 0.46, 0.1, INK, { ink: 0 }).replace('/>', ' fill-opacity="0.4"/>');
    s += poly([[1.0, 0], [1.0, -1.2], [1.6, -1.6], [1.6, -1.2], [2.2, -1.6], [2.2, 0]], hz('#7A7068', 0.2), { lw: LW });
    return wrap([-1.6, -6.8, 2.3, 0], s, 1);
  },
  // Excavation crane at the Yenikapı dig: lattice mast and jib.
  crane: () => {
    const y = hz('#C9A227', 0.2);
    let s = poly([[-0.25, 0], [0.25, 0], [0.15, -6.0], [-0.15, -6.0]], y, { lw: 0.035 }) + poly([[-1.8, -6.0], [2.2, -6.0], [2.2, -6.3], [-1.8, -6.3]], y, { lw: 0.035 });
    for (let i = 0; i < 6; i++) s += line(i % 2 ? -0.2 : 0.2, -i, i % 2 ? 0.2 : -0.2, -i - 1, INK, 0.025);
    s += line(2.0, -6.3, 2.0, -4.6, INK, 0.03) + rect(1.85, -4.6, 0.3, 0.3, hz('#8B93A3', 0.1), { lw: 0.03 }) + rect(-0.5, -0.8, 1.0, 0.8, hz('#6E7378', 0.2), { lw: 0.04 });
    return wrap([-1.9, -6.4, 2.3, 0], s, 1);
  },
  // Masts and a furled sail (Marina): three tall masts with halyards and small flags.
  mast: () => {
    let s = '';
    [[-0.9, 5.6], [0, 7.0], [0.9, 5.0]].forEach(m => { s += rect(m[0] - 0.045, -m[1], 0.09, m[1], hz('#E8E4D8', 0.2), { lw: 0.025 }) + line(m[0], -m[1] + 0.3, m[0] + 0.5, -0.4, INK, 0.015) + poly([[m[0] + 0.05, -m[1]], [m[0] + 0.45, -m[1] + 0.12], [m[0] + 0.05, -m[1] + 0.24]], hz('#3B9C9C', 0.15), { lw: 0.02 }); });
    s += poly([[-1.3, 0], [1.3, 0], [1.0, -0.5], [-1.0, -0.5]], hz('#F4F1E8', 0.2), { lw: 0.04 }) + `<path d="M-1.2 -0.25L1.2 -0.25" stroke="${hz('#3B9C9C', 0.1)}" stroke-width="0.1"/>`;
    return wrap([-1.4, -7.1, 1.4, 0], s, 1);
  },
  // Beige apartment block with rows of balconies and blue shutters (Ataköy, Bakırköy, Aksaray).
  block: () => {
    const wall = hz('#D8CBB6', 0.15);
    let s = body(-1.2, -5.0, 2.4, 5.0, wall) + rect(-1.3, -5.2, 2.6, 0.22, hz('#6E7378', 0.2), { lw: 0.035 });
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) {
      s += rect(-0.9 + c * 0.7, -4.5 + r * 0.95, 0.38, 0.5, hz('#3A4A66', 0.25), { lw: 0.02 }) + rect(-0.95 + c * 0.7, -3.95 + r * 0.95, 0.48, 0.12, hz('#B6A98C', 0.15), { lw: 0.02 });
      if ((r + c) % 2 === 0) s += rect(-0.93 + c * 0.7, -4.52 + r * 0.95, 0.07, 0.54, hz('#2F6AA8', 0.25), { lw: 0.012 });
    }
    return wrap([-1.3, -5.3, 1.3, 0], s, 1);
  },
  // D-060 Topkapı palace kitchens: a row of lead domes on a stone base, each with a tall conical chimney.
  kitchens: () => {
    const wall = hz('#CDBE9F', 0.18), lead = hz('#6F8A86', 0.2), cone = hz('#A99878', 0.2);
    let s = body(-1.6, -1.2, 3.2, 1.2, wall) + body(-1.7, -1.35, 3.4, 0.2, hz('#A18F72', 0.15));
    [[-1.1, 0.5], [0, 0.6], [1.1, 0.5]].forEach(([x, r]) => {
      s += path(`M${f(x - r)} -1.35A${f(r)} ${f(r * 0.8)} 0 0 1 ${f(x + r)} -1.35Z`, lead, { lw: LW });
      s += poly([[x - 0.1, -1.8], [x + 0.1, -1.8], [x + 0.03, -3.1], [x - 0.03, -3.1]], cone, { lw: 0.03 }) + rect(x - 0.06, -3.14, 0.12, 0.06, INK, { ink: 0, op: 0.6 });
    });
    for (let i = 0; i < 5; i++) s += rect(-1.4 + i * 0.6, -0.8, 0.22, 0.4, '#2A3040', { lw: 0.02 });
    return wrap([-1.8, -3.3, 1.8, 0], s, 1);
  },
  // D-060 Topkapı gate tower: a square stone tower with a crenellated parapet, a round-arched gate at its foot and a red tour flag.
  gate: () => {
    const st = hz('#D3C3A0', 0.16), dk = '#2A3040';
    let s = body(-0.9, -6.0, 1.8, 6.0, st) + body(-1.05, -6.4, 2.1, 0.5, hz('#B7A67F', 0.15));
    for (let i = 0; i < 5; i++) s += rect(-1.0 + i * 0.42, -6.95, 0.26, 0.55, st, { lw: 0.03 });
    s += path(`M-0.3 0L-0.3 -1.6A0.3 0.3 0 0 1 0.3 -1.6L0.3 0Z`, dk, { lw: 0.02 }) + rect(-0.08, -4.6, 0.16, 0.5, dk, { lw: 0.02 });
    s += line(0, -6.95, 0, -7.6, INK, 0.03) + poly([[0, -7.6], [0.5, -7.45], [0, -7.3]], hz('#B5453A', 0.1), { lw: 0.02 });
    return wrap([-1.1, -7.7, 1.1, 0], s, 1);
  },
  // D-060 hilltop school: a red-brick block on a green hill with a gable roof and a small bell turret. Generic, no name.
  hillschool: () => {
    const brick = hz('#C8553D', 0.25), roof = hz('#4A3A36', 0.2), hill = hz('#7E8A6A', 0.3);
    let s = path(`M-2.0 0Q-1.2 -1.5 0 -1.6Q1.3 -1.5 2.0 0Z`, hill, { lw: LW });
    s += body(-1.4, -3.0, 2.8, 1.8, brick) + poly([[-1.55, -3.0], [1.55, -3.0], [0, -3.9]], roof, { lw: LW });
    for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) s += rect(-1.1 + c * 0.5, -2.7 + r * 0.7, 0.24, 0.36, (r + c) % 3 ? '#2A3040' : '#F2C46D', { lw: 0.02 });
    s += body(-0.22, -4.9, 0.44, 1.0, brick) + poly([[-0.28, -4.9], [0.28, -4.9], [0, -5.6]], roof, { lw: LW }) + ell(0, -4.4, 0.07, 0.07, '#F4EBDD', { lw: 0.02 });
    return wrap([-2.1, -5.7, 2.1, 0], s, 1);
  },
  // Tall stone pine or palm for the leafy and seaside hoods.
  tree: () => {
    let s = path(`M-0.12 0L-0.08 -3.4L0.1 -3.4L0.14 0Z`, hz('#5A4230', 0.15), { lw: 0.035 });
    [[0, -4.2, 1.0], [-0.7, -3.7, 0.7], [0.7, -3.8, 0.75], [0, -5.0, 0.7]].forEach((b, i) => { s += ell(b[0], b[1], b[2], b[2] * 0.85, hz(['#3F6B3A', '#4F7F45', '#5C8A48', '#4A7A40'][i], 0.2), { lw: 0.035 }); });
    return wrap([-1.5, -5.8, 1.5, 0], s, 1);
  },
};
// Shapes are drawn for the right-hand side (fade on the left). The renderer flips them for the left-hand side.
module.exports = { SHAPES, hz };
