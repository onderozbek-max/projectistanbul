// R1-T3 ground table for the 17 hoods after İstiklal, Kapalıçarşı and Ataköy (those three stay bespoke in gen-arena-art.js).
// Each hood gets a `ground` tile (4 x 4 m) and a `walk` tile (2 x 2 m) in the kind its theme names (istanbul-themes.js),
// coloured from the theme's own ground colours so the zone washes and the hood-to-hood tint order stay as they were.
// Hood id => theme id. Seeds are fixed, so output is stable.
'use strict';
const { COOL, paving, asphalt, tiledUp, rng } = require('./lib.js');
const { shade, tri, planks, grass, pavers } = require('./kinds.js');
const MK = require('./marks.js');

const stones = (seed, W, o) => paving(seed, W, W, Object.assign({ gap: 0.012, jitter: 0.04, round: 0.26, line: 0.03, hi: 0.38, lo: 0.42 }, o));
const slab = (seed, wc, o) => paving(seed, 2, 2, Object.assign({ rows: 3, cols: [2, 3], gap: 0.014, jitter: 0.03, round: 0.12, line: 0.04, tones: tri(wc), hi: 0.5, lo: 0.4 }, o));
const road = (seed, gc, o) => asphalt(seed, (o && o.W) || 4, (o && o.H) || 4, Object.assign({ base: shade(gc, 0.08), light: shade(gc, 0.2), dark: shade(gc, -0.12), patch: shade(gc, 0.03), quiet: true, pattern: ((o && o.W) || 4) > 4, scale: ((o && o.W) || 4) * ((o && o.H) || 4) / 16 }, o));
const cobble = (seed, gc, gj, o) => stones(seed, 4, Object.assign({ rows: 10, cols: [6, 7], tones: tri(gc, 0.07), joint: gj, round: 0.3, line: 0.025 }, o));
const tiles = (seed, W, n, base, joint, o) => paving(seed, W, W, Object.assign({ rows: n, cols: [n, n], exact: true, gap: 0.014, jitter: 0, round: 0.05, line: 0.035, tones: tri(base, 0.05), hi: 0.5, lo: 0.4, joint }, o));
const RISER = (r, W, H) => { let b = ''; const rh = H / 12; for (let i = 0; i < 12; i++) b += `<rect x="0" y="${(i + 1) * rh - 0.08}" width="${W}" height="0.07" fill="${COOL}" fill-opacity="0.38"/>`; return b; };
const MOSS = (r, W, H) => { let b = ''; for (let i = 0; i < 40; i++) b += `<circle cx="${(r() * W).toFixed(2)}" cy="${(r() * H).toFixed(2)}" r="${(0.02 + r() * 0.03).toFixed(3)}" fill="#5E7A4A" opacity="0.6"/>`; return b; };

// Ataköy is a modern neighbourhood with street trees: clean courtyard slabs under dappled shade, interlocking pavers on the walk.
const atakoySlabs = paving(31, 4, 4, { rows: 2, cols: [2, 2], exact: true, gap: 0.014, jitter: 0, round: 0.03, line: 0.025, tones: ['#7A7C82', '#808288', '#868890'], hi: 0.35, lo: 0.3, joint: '#3A3C44' });

module.exports = {
  atakoy: {
    ground: tiledUp(atakoySlabs, 12, 12, MK.atakoy(rng(32), 12, 12)),
    walk: pavers(33, 2, 2, { cw: 0.4, rh: 0.2, tones: ['#B7A98E', '#BEB095', '#C6B89D'], joint: '#4A4438' }),
  },
  galata: {
    ground: stones(41, 4, { rows: 12, cols: [1, 2], jitter: 0.02, round: 0.05, line: 0.035, tones: tri('#45474F', 0.1), hi: 0.5, lo: 0.4, joint: '#2F3138', extra: RISER }),
    walk: slab(42, '#55575E'),
  },
  karakoy: { ground: road(51, '#3F4248', { marks: MK.karakoy, W: 9.2, H: 12 }), walk: slab(52, '#55575E', { rows: 2, cols: [2, 2], round: 0.1 }) },
  bridge: {
    ground: planks(61, 4, 4, { boards: 13, tones: tri('#5A4E44', 0.05), line: 0.025, hi: 0.4, lo: 0.4, joint: '#3D342C' }),
    walk: planks(62, 2, 2, { boards: 9, tones: tri('#6A5D50', 0.05), line: 0.025, hi: 0.4, lo: 0.4, joint: '#3D342C' }),
  },
  eminonu: { ground: cobble(71, '#5D5246', '#48403A', { extra: MK.eminonu }), walk: slab(72, '#6A5E50') },
  sirkeci: { ground: tiles(81, 4, 6, '#5E6068', '#2A2C34', { extra: MK.sirkeci }), walk: tiles(82, 2, 4, '#6F7178', '#2A2C34', { tones: tri('#6F7178', 0.08) }) },
  beyazit: { ground: stones(91, 4, { rows: 8, cols: [6, 7], tones: tri('#5C5E62', 0.07), joint: '#4A4C50', extra: MK.beyazit }), walk: slab(92, '#6A6C70') },
  laleli: { ground: road(101, '#44474E', { stains: ['#8B6B4A'], marks: MK.laleli, W: 9.2, H: 12 }), walk: tiles(102, 2, 4, '#55585F', '#2E3036') },
  aksaray: { ground: road(111, '#3A3D44', { lanes: true }), walk: slab(112, '#5A5E66') },
  kumkapi: { ground: cobble(121, '#55504A', '#403B36', { tones: tri('#55504A', 0.14), extra: MK.kumkapi }), walk: slab(122, '#66615A') },
  yenikapi: { ground: road(131, '#4B4D52', { stains: ['#7A5230'], marks: MK.yenikapi, W: 9.2, H: 12 }), walk: slab(132, '#5A5C60') },
  samatya: { ground: cobble(141, '#5B5044', '#463C32', { rows: 9, cols: [6, 7], tones: tri('#5B5044', 0.12), extra: MK.samatya }), walk: slab(142, '#6A5E50') },
  yedikule: {
    ground: cobble(151, '#5A5448', '#48433A', { rows: 8, cols: [5, 6], extra: MOSS }),
    walk: grass(152, 2, 2, { base: '#5E6A45', light: '#79895A', dark: '#48553A', tuft: '#2F3B26' }),
  },
  zeytinburnu: { ground: road(161, '#4A4742', { stains: ['#2A7F80', '#A8327D'] }), walk: slab(162, '#57534D') },
  kazlicesme: {
    ground: grass(171, 4, 4, { base: '#44603E', light: '#587A4C', dark: '#34502F', tuft: '#223A22', flowers: ['#E9DCC4'] }),
    walk: tiles(172, 2, 4, '#8A8B84', '#2E3036', { tones: tri('#8A8B84', 0.02) }),
  },
  bakirkoy: { ground: tiledUp(tiles(181, 4, 6, '#6A6B70', '#CFC6B3', { gap: 0.03 }), 12, 12, MK.bakirkoy(rng(182), 12, 12)), walk: tiles(182, 2, 4, '#7A7B80', '#CFC6B3', { gap: 0.03 }) },
  sahil: { ground: road(191, '#70736F', { jog: '#4E7A5A', base: '#7C7F7A', light: '#908F89', dark: '#656864', patch: '#72756F' }), walk: tiles(192, 2, 4, '#8A8B84', '#2E3036', { tones: tri('#8A8B84', 0.02) }) },
  marina: {
    ground: planks(201, 4, 4, { boards: 13, tones: tri('#7A6A58', 0.06), line: 0.025, hi: 0.5, lo: 0.4, joint: '#5B4E42' }),
    walk: planks(202, 2, 2, { boards: 7, tones: tri('#8C7B66', 0.05), line: 0.025, hi: 0.5, lo: 0.4, joint: '#5B4E42' }),
  },
};
