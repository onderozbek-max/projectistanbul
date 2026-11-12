// R1-T3 ground kinds beyond stone paving and asphalt (lib.js): timber planks, grass, and colour helpers.
'use strict';
const { INK, rng, f, stone } = require('./lib.js');

// Mix a hex colour toward white (a > 0) or black (a < 0).
function shade(hex, a) {
  const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255], t = a < 0 ? 0 : 255, p = Math.abs(a);
  return '#' + c.map(v => ('0' + Math.round(v + (t - v) * p).toString(16)).slice(-2)).join('');
}
// Three stone tones from one theme colour, lifted a little so the ground reads against the sprites.
const tri = (hex, lift) => [shade(hex, lift || 0.06), shade(hex, (lift || 0.06) + 0.07), shade(hex, (lift || 0.06) + 0.14)];

// Boards running down the screen with staggered butt joints, so both axes repeat. o: boards (count across), tones, line, hi, lo, joint.
function planks(seed, W, H, o) {
  const r = rng(seed), cw = W / o.boards, g = 0.012; let body = '';
  for (let c = 0; c < o.boards; c++) {
    const n = 2 + Math.floor(r() * 2), cuts = [0, 1];
    for (let i = 1; i < n; i++) cuts.push(i / n + (r() - 0.5) * (0.5 / n));
    cuts.sort((a, b) => a - b);
    for (let i = 0; i < cuts.length - 1; i++) {
      const y0 = cuts[i] * H, y1 = cuts[i + 1] * H, x = c * cw + g;
      body += stone(r, x, y0 + g, cw - 2 * g, y1 - y0 - 2 * g, { jitter: 0.01, round: 0.05, line: o.line, tones: o.tones, hi: o.hi, lo: o.lo });
      [y0 + 0.1, y1 - 0.1].forEach(y => { body += `<circle cx="${f(x + 0.05)}" cy="${f(y)}" r="0.012" fill="${INK}" fill-opacity="0.7"/><circle cx="${f(x + cw - 0.05 - 2 * g)}" cy="${f(y)}" r="0.012" fill="${INK}" fill-opacity="0.7"/>`; });
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 100}" height="${H * 100}"><rect width="${W}" height="${H}" fill="${o.joint}"/>${body}</svg>`;
}

// Lawn: flat base, soft light and dark blotches (drawn again across the edges so the tile wraps), and small ink tufts.
function grass(seed, W, H, o) {
  const r = rng(seed); let b = `<rect width="${W}" height="${H}" fill="${o.base}"/>`;
  const wrap = (x, y, draw) => { for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) draw(x + dx * W, y + dy * H); };
  for (let i = 0; i < 34; i++) {
    const x = r() * W, y = r() * H, rx = 0.25 + r() * 0.45, ry = 0.2 + r() * 0.3, col = i % 2 ? o.light : o.dark;
    wrap(x, y, (px, py) => { if (px > -rx && px < W + rx && py > -ry && py < H + ry) b += `<ellipse cx="${f(px)}" cy="${f(py)}" rx="${f(rx)}" ry="${f(ry)}" fill="${col}" fill-opacity="0.38"/>`; });
  }
  for (let i = 0; i < 46; i++) {
    const x = r() * W, y = r() * H, h = 0.07 + r() * 0.06;
    wrap(x, y, (px, py) => { if (px > -0.1 && px < W + 0.1 && py > -0.1 && py < H + 0.1) b += `<path d="M${f(px - h * 0.5)} ${f(py)}L${f(px)} ${f(py - h)}L${f(px + h * 0.5)} ${f(py)}" fill="none" stroke="${o.tuft}" stroke-width="0.022" stroke-linecap="round" stroke-linejoin="round"/>`; });
  }
  (o.flowers || []).forEach(col => { for (let i = 0; i < 7; i++) b += `<circle cx="${f(r() * W)}" cy="${f(r() * H)}" r="0.028" fill="${col}" stroke="${INK}" stroke-width="0.012"/>`; });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 100}" height="${H * 100}">${b}</svg>`;
}

module.exports = { shade, tri, planks, grass };
