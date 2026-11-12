// R1-T3 authored overhead rigs (D-057): string lights, paper lanterns, bunting, laundry lines and the bazaar vault.
// Units are metres, origin = the point the game anchors the rig to (world x 0, the rig's y), x right, y down the screen, so the
// wire hangs at about y = -1.5 like the procedural rigs in istanbul-props2.js. Same style as the ground and props: night_ink
// outlines, warm highlight top-left, cool shade bottom-right. Each builder returns { w, h, ax, ay, svg, glows, alpha }:
// glows are [x, y, radius, colour] points the renderer lights up (and twinkles) at runtime; alpha is the base opacity.
'use strict';
const { INK, WARM, COOL, f, rng, rect, ell, line, poly, path } = require('../arena-props/lib.js');

function rig(bb, body, extra) {
  const pad = 0.1, x0 = bb[0] - pad, y0 = bb[1] - pad, w = bb[2] - bb[0] + 2 * pad, h = bb[3] - bb[1] + 2 * pad;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f(x0)} ${f(y0)} ${f(w)} ${f(h)}" width="${f(w * 100)}" height="${f(h * 100)}">${body}</svg>`;
  return Object.assign({ w: +f(w), h: +f(h), ax: +f(-x0), ay: +f(-y0), svg, glows: [], alpha: 1 }, extra || {});
}
// A point on the sagging wire at fraction q (quadratic, as the procedural rig).
const wireAt = (span, y0, sag, q) => [-span / 2 + span * q, y0 + 2 * q * (1 - q) * sag];
const wirePath = (span, y0, sag) => `<path d="M${f(-span / 2)} ${f(y0)}Q0 ${f(y0 + sag)} ${f(span / 2)} ${f(y0)}" fill="none" stroke="${INK}" stroke-width="0.045" stroke-linecap="round"/>`;

const bulb = (x, y, col) => rect(x - 0.03, y, 0.06, 0.08, '#2A2C34', { lw: 0.018 }) + path(`M${f(x - 0.035)} ${f(y + 0.08)}Q${f(x - 0.11)} ${f(y + 0.2)} ${f(x)} ${f(y + 0.27)}Q${f(x + 0.11)} ${f(y + 0.2)} ${f(x + 0.035)} ${f(y + 0.08)}Z`, col, { lw: 0.022 }) + ell(x - 0.03, y + 0.15, 0.02, 0.035, '#FFFFFF', { ink: 0 }).replace('/>', ' fill-opacity="0.7"/>');
const paper = (x, y, col, rib) => line(x, y, x, y + 0.12, INK, 0.025) + ell(x, y + 0.32, 0.17, 0.2, col, { lw: 0.025 }) + `<path d="M${f(x - 0.09)} ${f(y + 0.16)}Q${f(x - 0.15)} ${f(y + 0.32)} ${f(x - 0.09)} ${f(y + 0.48)}M${f(x + 0.09)} ${f(y + 0.16)}Q${f(x + 0.15)} ${f(y + 0.32)} ${f(x + 0.09)} ${f(y + 0.48)}" fill="none" stroke="${rib || INK}" stroke-opacity="0.55" stroke-width="0.02"/>` + rect(x - 0.05, y + 0.1, 0.1, 0.05, '#2A2C34', { lw: 0.015 }) + rect(x - 0.05, y + 0.5, 0.1, 0.04, '#2A2C34', { lw: 0.015 }) + line(x, y + 0.54, x, y + 0.7, '#C9A227', 0.02) + ell(x, y + 0.71, 0.03, 0.04, '#C9A227', { lw: 0.012 }) + ell(x - 0.06, y + 0.25, 0.04, 0.07, '#FFFFFF', { ink: 0 }).replace('/>', ' fill-opacity="0.3"/>');
const leaf = (x, y, a, col) => `<path transform="rotate(${a} ${f(x)} ${f(y)})" d="M${f(x - 0.12)} ${f(y)}Q${f(x)} ${f(y - 0.1)} ${f(x + 0.12)} ${f(y)}Q${f(x)} ${f(y + 0.1)} ${f(x - 0.12)} ${f(y)}Z" fill="${col}" stroke="${INK}" stroke-width="0.016"/>`;

// Strings of lights. style: bulbs | paper | bunting | festoon. cols: colours cycled along the wire. span 14.4 m like the procedural rig.
function strings(o) {
  const span = 14.4, y0 = -1.5, sag = 0.9, n = o.n || 16, r = rng(o.seed || 1), cols = o.cols;
  let body = '', glows = [];
  if (o.style === 'bunting') {
    for (let i = 0; i < n; i++) {
      const a = wireAt(span, y0, sag, i / n), b = wireAt(span, y0, sag, (i + 1) / n), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + 0.34;
      body += poly([[a[0] + 0.03, a[1]], [b[0] - 0.03, b[1]], [mx, my]], cols[i % cols.length], { lw: 0.022 }) + line(a[0] + 0.1, a[1] + 0.06, mx - 0.02, my - 0.08, COOL, 0.02, { ink: 0 }).replace('/>', ' stroke-opacity="0.35"/>');
    }
    body = wirePath(span, y0, sag) + body;
    for (let i = 0; i <= n; i += 4) { const p = wireAt(span, y0, sag, i / n); body += rect(p[0] - 0.04, p[1] + 0.02, 0.08, 0.11, '#C9A227', { lw: 0.018 }); glows.push([p[0], p[1] + 0.1, 0.35, '#FFD98A']); }
  } else {
    body = wirePath(span, y0, sag);
    for (let i = 0; i <= n; i++) {
      const p = wireAt(span, y0, sag, i / n), col = cols[i % cols.length];
      if (o.style === 'festoon' && i < n) { const q = wireAt(span, y0, sag, (i + 0.5) / n); body += leaf(q[0], q[1] + 0.06, Math.round(r() * 60 - 30), o.leaf || '#7A9A4A'); }
      if (o.style === 'paper') { body += paper(p[0], p[1], col, o.rib); glows.push([p[0], p[1] + 0.32, 0.55, o.glow || col]); }
      else { body += bulb(p[0], p[1] + 0.02, col); glows.push([p[0], p[1] + 0.16, 0.5, o.glow || col]); }
    }
  }
  return rig([-span / 2, y0 - 0.1, span / 2, y0 + sag / 2 + 0.95], body, { glows, alpha: 0.9 });
}

// One hanging garment: kind tee | towel | sheet | pair (socks). Hangs from (x, y) on the line, w and h in metres.
function cloth(kind, x, y, col, shade) {
  let s = '';
  const peg = (px) => rect(px - 0.025, y - 0.04, 0.05, 0.12, '#8A6038', { lw: 0.015 });
  if (kind === 'tee') {
    const w = 0.34, h = 0.62;
    s += path(`M${f(x - w * 0.5)} ${f(y)}L${f(x - w * 0.5 - 0.2)} ${f(y + 0.2)}L${f(x - w * 0.5 - 0.1)} ${f(y + 0.32)}L${f(x - w * 0.5)} ${f(y + 0.27)}L${f(x - w * 0.5)} ${f(y + h)}L${f(x + w * 0.5)} ${f(y + h)}L${f(x + w * 0.5)} ${f(y + 0.27)}L${f(x + w * 0.5 + 0.1)} ${f(y + 0.32)}L${f(x + w * 0.5 + 0.2)} ${f(y + 0.2)}L${f(x + w * 0.5)} ${f(y)}Q${f(x)} ${f(y + 0.1)} ${f(x - w * 0.5)} ${f(y)}Z`, col, { lw: 0.022 });
    s += `<path d="M${f(x + w * 0.5 - 0.04)} ${f(y + 0.3)}L${f(x + w * 0.5 - 0.04)} ${f(y + h - 0.03)}L${f(x - w * 0.2)} ${f(y + h - 0.03)}" fill="none" stroke="${shade}" stroke-opacity="0.5" stroke-width="0.05" stroke-linecap="round"/>` + peg(x - w * 0.5) + peg(x + w * 0.5);
  } else if (kind === 'towel' || kind === 'sheet') {
    const w = kind === 'sheet' ? 0.95 : 0.42, h = kind === 'sheet' ? 0.95 : 0.8;
    s += path(`M${f(x - w / 2)} ${f(y)}L${f(x + w / 2)} ${f(y)}L${f(x + w / 2 - 0.02)} ${f(y + h)}Q${f(x)} ${f(y + h + 0.06)} ${f(x - w / 2 + 0.02)} ${f(y + h)}Z`, col, { lw: 0.022 });
    s += `<path d="M${f(x - w / 2 + 0.05)} ${f(y + h * 0.3)}L${f(x + w / 2 - 0.05)} ${f(y + h * 0.3)}M${f(x - w / 2 + 0.05)} ${f(y + h * 0.36)}L${f(x + w / 2 - 0.05)} ${f(y + h * 0.36)}" fill="none" stroke="${shade}" stroke-opacity="0.45" stroke-width="0.02"/>`;
    s += `<path d="M${f(x + w / 2 - 0.05)} ${f(y + 0.05)}L${f(x + w / 2 - 0.07)} ${f(y + h - 0.04)}" fill="none" stroke="${COOL}" stroke-opacity="0.4" stroke-width="0.05" stroke-linecap="round"/>` + peg(x - w / 2 + 0.06) + peg(x + w / 2 - 0.06);
  } else {
    [-0.07, 0.07].forEach(d => { s += path(`M${f(x + d - 0.05)} ${f(y)}L${f(x + d + 0.05)} ${f(y)}L${f(x + d + 0.05)} ${f(y + 0.2)}L${f(x + d + 0.12)} ${f(y + 0.3)}L${f(x + d + 0.02)} ${f(y + 0.34)}L${f(x + d - 0.05)} ${f(y + 0.2)}Z`, col, { lw: 0.018 }); });
    s += peg(x - 0.07) + peg(x + 0.07);
  }
  return s;
}

// A laundry line between two posts 9.2 m apart (as the procedural rig). o.items: [kind, colour] list; o.shade: fold colour.
function laundry(o) {
  const span = 9.2, h = 2.2, sag = 0.5, items = o.items;
  let body = `<ellipse cx="${f(-span / 2)}" cy="0" rx="0.18" ry="0.07" fill="#000" fill-opacity="0.25"/><ellipse cx="${f(span / 2)}" cy="0" rx="0.18" ry="0.07" fill="#000" fill-opacity="0.25"/>`;
  [-1, 1].forEach(sd => { body += line(sd * span / 2, 0, sd * span / 2, -h, INK, 0.1) + line(sd * span / 2 - 0.01, 0, sd * span / 2 - 0.01, -h, '#6B6E78', 0.045); });
  body += `<path d="M${f(-span / 2)} ${f(-h)}Q0 ${f(-h + sag * 2)} ${f(span / 2)} ${f(-h)}" fill="none" stroke="${INK}" stroke-width="0.04" stroke-linecap="round"/>`;
  items.forEach((it, i) => { const q = (i + 0.5) / items.length, p = wireAt(span, -h, sag * 2, q); body += cloth(it[0], p[0], p[1], it[1], o.shade || COOL); });
  return rig([-span / 2 - 0.3, -h - 0.1, span / 2 + 0.3, 0.1], body, { alpha: 0.85 });
}

// Woven kilim hanging from the vault: diamond pattern, fringe along the bottom edge.
function kilim(x, y, w, h, base, alt, line1) {
  let s = rect(x - w / 2, y, w, h, base, { lw: 0.025 });
  for (let k = 0; k < 3; k++) {
    const cy = y + h * (0.22 + k * 0.28), rx = w * 0.32, ry = h * 0.13;
    s += poly([[x, cy - ry], [x + rx, cy], [x, cy + ry], [x - rx, cy]], k % 2 ? line1 : alt, { lw: 0.016 });
  }
  s += rect(x - w / 2 + 0.03, y + 0.04, w - 0.06, 0.05, alt, { ink: 0 });
  for (let i = 0; i <= 8; i++) s += line(x - w / 2 + 0.02 + i * (w - 0.04) / 8, y + h, x - w / 2 + 0.02 + i * (w - 0.04) / 8, y + h + 0.11, base, 0.018);
  return s + `<path d="M${f(x + w / 2 - 0.05)} ${f(y + 0.05)}L${f(x + w / 2 - 0.05)} ${f(y + h)}" stroke="${COOL}" stroke-opacity="0.35" stroke-width="0.06" fill="none"/>`;
}
// Brass lantern on a chain: cap, glass body, finial.
const lantern = (x, y, len) => line(x, y, x, y + len, '#6A5A2A', 0.03) + path(`M${f(x - 0.1)} ${f(y + len + 0.1)}L${f(x)} ${f(y + len)}L${f(x + 0.1)} ${f(y + len + 0.1)}Z`, '#C9A227', { lw: 0.02 }) +
  path(`M${f(x - 0.1)} ${f(y + len + 0.1)}L${f(x - 0.13)} ${f(y + len + 0.4)}L${f(x + 0.13)} ${f(y + len + 0.4)}L${f(x + 0.1)} ${f(y + len + 0.1)}Z`, '#FFD98A', { lw: 0.022 }) +
  line(x, y + len + 0.1, x, y + len + 0.4, '#8A6A1A', 0.02) + path(`M${f(x - 0.13)} ${f(y + len + 0.4)}L${f(x)} ${f(y + len + 0.5)}L${f(x + 0.13)} ${f(y + len + 0.4)}Z`, '#C9A227', { lw: 0.02 });

// The bazaar vault: a stone arch band with a blue underside, brass lanterns and kilims. span 12, rise 2.6 as the procedural vault.
function vault(o) {
  const span = 12, h = 2.6, K = o.kilims;
  const archY = x => -h * Math.sqrt(Math.max(0, 1 - Math.pow(x / (span / 2), 2)));
  let body = `<path d="M${f(-span / 2)} 0A${span / 2} ${h} 0 0 1 ${f(span / 2)} 0" fill="none" stroke="#2A7F9F" stroke-opacity="0.4" stroke-width="0.36" stroke-linecap="round"/>`;
  body += `<path d="M${f(-span / 2)} 0A${span / 2} ${h} 0 0 1 ${f(span / 2)} 0" fill="none" stroke="${INK}" stroke-width="0.12" stroke-linecap="round"/>`;
  body += `<path d="M${f(-span / 2)} -0.04A${span / 2} ${h} 0 0 1 ${f(span / 2)} -0.04" fill="none" stroke="${WARM}" stroke-opacity="0.45" stroke-width="0.04" stroke-linecap="round"/>`;
  for (let i = -2; i <= 2; i++) { const x = i * span / 5, y = archY(x) + 0.06; body += line(x, y - 0.1, x, y + 0.1, INK, 0.06); }
  [-3.6, -1.2, 1.2, 3.6].forEach((x, i) => { body += kilim(x, archY(x) + 0.12, 0.9, 1.25, K[i % K.length][0], K[i % K.length][1], K[i % K.length][2]); });
  const glows = [];
  for (let i = -2; i <= 2; i++) { const x = i * span / 5, y = archY(x) + 0.1; body += lantern(x, y, 0.35 + (i % 2 ? 0.12 : 0)); glows.push([x, y + 0.7, 1.0, '#FFD98A']); }
  return rig([-span / 2 - 0.2, -h - 0.2, span / 2 + 0.2, 0.3], body, { glows, alpha: 0.78 });
}

// A street tree's canopy reaching in over the lane edge from one side (side -1 left, 1 right): branch, leaf mass in three greens, light gaps.
function canopy(o) {
  const r = rng(o.seed || 1), sd = o.side, cx = sd * 4.6, cy = -0.7, tones = o.tones;
  let body = `<path d="M${f(sd * 6.4)} ${f(cy + 0.5)}Q${f(sd * 5.4)} ${f(cy + 0.9)} ${f(cx)} ${f(cy + 0.2)}" fill="none" stroke="${INK}" stroke-width="0.34" stroke-linecap="round"/><path d="M${f(sd * 6.4)} ${f(cy + 0.5)}Q${f(sd * 5.4)} ${f(cy + 0.9)} ${f(cx)} ${f(cy + 0.2)}" fill="none" stroke="#5A4230" stroke-width="0.26" stroke-linecap="round"/>`;
  const blobs = [];
  for (let i = 0; i < 22; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()); blobs.push([cx + Math.cos(a) * d * 1.7 * 0.95, cy + Math.sin(a) * d * 1.45, 0.5 + r() * 0.45]); }
  blobs.sort((p, q) => p[1] - q[1]);
  blobs.forEach((b, i) => {
    const t = tones[Math.min(2, Math.floor((b[1] - (cy - 1.45)) / 2.9 * 3))];
    body += ell(b[0], b[1], b[2], b[2] * 0.88, t, { lw: 0.03 });
    body += `<path d="M${f(b[0] - b[2] * 0.6)} ${f(b[1] - b[2] * 0.1)}Q${f(b[0] - b[2] * 0.4)} ${f(b[1] - b[2] * 0.7)} ${f(b[0] + b[2] * 0.1)} ${f(b[1] - b[2] * 0.75)}" fill="none" stroke="${WARM}" stroke-opacity="0.4" stroke-width="0.04" stroke-linecap="round"/>`;
  });
  for (let i = 0; i < 6; i++) body += ell(cx + (r() - 0.5) * 2.6, cy + (r() - 0.5) * 2.2, 0.06 + r() * 0.05, 0.05, '#FFE9A8', { ink: 0 }).replace('/>', ' fill-opacity="0.8"/>');
  return rig([Math.min(cx - 2.2, sd * 6.5), cy - 1.8, Math.max(cx + 2.2, sd * 6.5), cy + 1.9], body, { alpha: 0.92 });
}

module.exports = { strings, laundry, vault, canopy };
