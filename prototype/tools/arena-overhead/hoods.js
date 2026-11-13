// R1-T3 overhead table: which rig each hood hangs over its street (istanbul-themes.js `overhead`) and how it is dressed.
// Colours come from docs/hood-visual-briefs.md accents. Rigs the themes name but that this pass does not author (`lamps`, `none`)
// are left to the procedural code. Keys: hood theme id => rig kind => array of variants (the renderer picks one by position).
// D-060: a 'hood.sN' key (N = 1-based stage) is stage-keyed: its kind replaces the hood's `overhead` on that stage (arena-overhead.js).
'use strict';
const R = require('./rigs.js');

const WARM_BULB = '#FFE2A8';
const TERRA = '#C8553D', OCHRE = '#E3B04B', BLUE = '#4F8FAE', PINK = '#D98BA0', RED = '#B5453A', CREAM = '#F4EBDD';
const tee = c => ['tee', c], towel = c => ['towel', c], sheet = c => ['sheet', c], socks = c => ['pair', c];
// Three arrangements of the same seven garments per hood, so neighbouring lines along a street do not repeat. opt.festoon adds café lights.
const wash = (A, B, C, shade, opt) => {
  const base = [tee(A), towel(B), sheet(C), socks(A), tee(C), towel(A), socks(B)];
  return [0, 2, 4].map(k => R.laundry({ shade, items: base.slice(k).concat(base.slice(0, k)), festoon: !!(opt && opt.festoon) }));
};

module.exports = {
  istiklal: { strings: [R.strings({ seed: 11, style: 'bulbs', cols: [WARM_BULB], glow: '#FFD98A' })] },
  karakoy: { strings: [R.strings({ seed: 12, style: 'paper', cols: ['#E07A5F', '#F4EBDD'], glow: '#FFB89C', rib: '#8A3A28', n: 12 })] },
  eminonu: { strings: [R.strings({ seed: 13, style: 'bulbs', cols: ['#FFC25A', '#E5733A', WARM_BULB], glow: '#FFB45A' })] },
  beyazit: { strings: [R.strings({ seed: 14, style: 'festoon', cols: [WARM_BULB], leaf: '#6E9A48', glow: '#FFE2A8' })] },
  kazlicesme: { strings: [R.strings({ seed: 15, style: 'festoon', cols: ['#FFD98A', '#FFB45A'], leaf: '#7A9A4A', glow: '#FFB45A' })] },
  bakirkoy: { strings: [R.strings({ seed: 16, style: 'bunting', cols: ['#4F7A62', '#F4EBDD', '#E5C02A'] })] },
  marina: { strings: [R.strings({ seed: 17, style: 'bunting', cols: ['#3B9C9C', '#F4F1E8', '#C9A227', '#F4F1E8'] })] },
  kumkapi: { lanterns: [R.strings({ seed: 18, style: 'paper', cols: ['#B5372E', '#C9A227'], glow: '#FF8A5A', rib: '#5A1A14', n: 12 })] },
  bazaar: { vault: [R.vault({ kilims: [['#8E2B2B', '#E9C88B', '#2A7F80'], ['#2A7F80', '#E9C88B', '#8E2B2B'], ['#7A3B2A', '#D9A441', '#2A7F80']] })] },
  // D-060 Topkapı Sarayı: bunting from the souvenir stands, with one rig of tour-group flags on poles.
  saray: { strings: [R.strings({ seed: 19, style: 'flags', cols: [RED, CREAM, OCHRE, CREAM], flag: RED, glow: '#FFD98A', n: 16 })] },
  galata: { laundry: wash('#2F5F8A', '#F4EBDD', '#3F7A5E', '#14151F') },
  // D-060 Haliç–Balat: the laundry rig in three arrangements, with café festoon lights on a wire above it.
  halic: { laundry: wash(TERRA, PINK, OCHRE, '#14151F', { festoon: true }) },
  samatya: { laundry: wash('#A8322D', '#E7A6A0', '#F4EBDD', '#14151F') },
  // D-060 Yedikule Zindanlar (stage 2): the Kapalıçarşı vault without kilims, torches instead of lanterns, a dark stone band.
  'yedikule.s2': { vault: [R.vault({ kilims: [], band: '#3B3A36', bandOp: 0.7, torch: true, alpha: 0.85 })] },
  atakoy: {
    laundry: wash('#F4EBDD', '#D8CBB6', '#9FC4D8', '#2B3050'),
    canopy: [-1, 1].map(side => R.canopy({ seed: 41 + side, side, tones: ['#2F5A33', '#3F6B3A', '#5C8A48'] })),   // street trees: left variant, then right
  },
};
