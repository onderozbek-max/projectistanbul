// R1-T3 ground toolkit (D-057): seamless SVG tile builders shared by the per-hood ground table (hoods.js).
// Units are metres. Stones carry night_ink joints, a warm highlight top-left and a cool shade bottom-right. Seeded, so output is stable.
'use strict';
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
    let n = o.exact ? o.cols[0] : o.cols[0] + Math.floor(r() * (o.cols[1] - o.cols[0] + 1)), cuts = [0];
    for (let c = 1; c < n; c++) cuts.push(c / n + (o.exact ? 0 : (r() - 0.5) * (0.5 / n)));
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
  const r = rng(seed), sc = o.scale || 1; let b = `<rect width="${W}" height="${H}" fill="${o.base}"/>`;
  const gw = o.pattern ? 4 : W, gh = o.pattern ? 4 : H, gn = o.pattern ? 90 : Math.round(90 * sc); let grit = '';
  for (let i = 0; i < gn; i++) grit += `<ellipse cx="${f(r() * gw)}" cy="${f(r() * gh)}" rx="${f(0.02 + r() * 0.05)}" ry="${f(0.015 + r() * 0.03)}" fill="${r() < 0.5 ? o.light : o.dark}" opacity="0.7"/>`;
  b += o.pattern ? `<defs><pattern id="g" width="4" height="4" patternUnits="userSpaceOnUse">${grit}</pattern></defs><rect width="${W}" height="${H}" fill="url(#g)"/>` : grit;
  for (let i = 0; i < (o.pattern ? 3 : Math.round((o.quiet ? 1 : 2) * sc)); i++) {
    const x = r() * (W - 1.4), y = r() * (H - 1), w = 0.9 + r() * 0.6, h = 0.5 + r() * 0.5;
    b += `<path d="M${f(x)} ${f(y + 0.05)}L${f(x + w)} ${f(y)}L${f(x + w - 0.04)} ${f(y + h)}L${f(x + 0.03)} ${f(y + h - 0.05)}Z" fill="${o.patch}" stroke="${INK}" stroke-width="0.035" stroke-linejoin="round"${o.quiet ? ' stroke-opacity="0.35"' : ''}/>`;
    if (!o.quiet) b += `<path d="M${f(x + 0.08)} ${f(y + h - 0.1)}L${f(x + w - 0.1)} ${f(y + h - 0.08)}" stroke="${COOL}" stroke-opacity="0.5" stroke-width="0.05" stroke-linecap="round"/>`;
  }
  for (let i = 0; i < (o.pattern ? 12 : Math.round(4 * sc)); i++) {
    let x = r() * W, y = r() * H, d = `M${f(x)} ${f(y)}`;
    for (let k = 0; k < 5; k++) { x += (r() - 0.35) * 0.35; y += 0.18 + r() * 0.2; d += `L${f(x)} ${f(y)}`; }
    b += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="0.03" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`;
  }
  b += asphaltMarks(seed, W, H, o);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 100}" height="${H * 100}">${b}</svg>`;
}
// Optional road marks and stains, from a separate seed so the base asphalt (and the hoods already authored) never changes.
function asphaltMarks(seed, W, H, o) {
  const r = rng(seed + 500); let b = '';
  if (o.lanes) for (let y = 0.2; y < H; y += 2) b += `<rect x="${f(W / 2 - 0.04)}" y="${f(y)}" width="0.08" height="1.1" rx="0.02" fill="#E6E2D2" fill-opacity="0.7" stroke="${INK}" stroke-width="0.02"/>`;
  if (o.jog) b += `<rect x="1" y="0" width="1" height="${H}" fill="${o.jog}"/><path d="M0.97 0V${H}M2.03 0V${H}" stroke="#E6E2D2" stroke-opacity="0.65" stroke-width="0.05"/>`;
  if (o.marks) b += o.marks(r, W, H);
  (o.stains || []).forEach(col => { for (let i = 0; i < 2; i++) b += `<ellipse cx="${f(r() * W)}" cy="${f(r() * H)}" rx="${f(0.18 + r() * 0.3)}" ry="${f(0.1 + r() * 0.2)}" fill="${col}" fill-opacity="0.2"/>`; });
  return b;
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

// A big tile made of a small seamless one repeated by an SVG pattern, with extra marks on top. Keeps the data small when the marks
// need a long period so they do not repeat like wallpaper. Only works for tiles whose size divides W and H.
function tiledUp(small, W, H, marks) {
  const m = small.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"[^>]*>([\s\S]*)<\/svg>$/), tw = +m[1], th = +m[2];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 100}" height="${H * 100}"><defs><pattern id="t" width="${tw}" height="${th}" patternUnits="userSpaceOnUse">${m[3]}</pattern></defs><rect width="${W}" height="${H}" fill="url(#t)"/>${marks}</svg>`;
}
module.exports = { INK, WARM, COOL, rng, f, stone, paving, asphalt, rails, tiledUp };
