'use strict';
// Shared figure camera, outfit descriptions and palette from the game's source.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const A = require('./lib-art-prompts.js');
const { loadP } = require('./lib-load.js');

const P = loadP();
const CFG = P.CFG, LOOK = CFG.enemyLook;
const VIEW = path.join(A.ROOT, 'prototype', 'js', 'view');
const viewSrc = f => fs.readFileSync(path.join(VIEW, f), 'utf8');
const HEX = /^#[0-9A-Fa-f]{6}$/;
const need = (cond, msg) => { if (!cond) throw new Error('gen-art-prompts-characters: ' + msg); };

// ---------- sources ----------
function parseTable(src, re, what) {
  const m = re.exec(src);
  need(m, what + ' not found (the view file changed: update the pattern in this generator)');
  return vm.runInNewContext('(' + m[1] + ')', {});
}
const NEW = parseTable(viewSrc('art-enemy-look.js'), /var NEW = (\{[\s\S]*?\n {2}\});/, 'outfit table (var NEW) in art-enemy-look.js');
const HERO = parseTable(viewSrc('art-characters.js'), /\n\s+hero: (\{[^}]*\})/, 'hero outfit in art-characters.js');
const sourceHas = (f, hex) => viewSrc(f).toUpperCase().includes(hex.toUpperCase());
need(HERO.col === '#D7263D' && sourceHas('art-characters.js', HERO.pants), 'the in-run hero colours changed: update the hero prompts');
need(LOOK.types && LOOK.bossCostumes && CFG.bossByHood && CFG.bosses, 'config is missing enemyLook, bossCostumes, bossByHood or bosses');

// ---------- colour names (nearest in this list; a far match prints a warning) ----------
const NAMED = [
  ['#14151F', 'near-black ink'], ['#1A1A1E', 'near-black'], ['#2A2A2A', 'charcoal'], ['#2A2D38', 'dark slate'], ['#1E1712', 'dark brown-black'],
  ['#2A1E16', 'dark brown'], ['#2A1A12', 'dark brown'], ['#3B2A1E', 'dark brown'], ['#3A2A2A', 'dark brown'], ['#6B4A2E', 'brown'],
  ['#6B3E24', 'warm brown'], ['#5E4628', 'wood brown'], ['#8B6B3E', 'wood brown'], ['#8B7355', 'khaki'], ['#7A4A3A', 'brick brown'],
  ['#8A5A34', 'tea brown'], ['#8B5A2B', 'tea brown'], ['#B8733A', 'copper'], ['#B5651D', 'tea amber'], ['#E8782A', 'orange'],
  ['#D98C2B', 'ochre'], ['#E9A23B', 'simit gold'], ['#D9B25A', 'brass'], ['#C9A13B', 'brass'], ['#F2D54B', 'hi-vis yellow'],
  ['#FFC93C', 'taxi yellow'], ['#D7263D', 'tram red'], ['#B5453A', 'brick red'], ['#A81E30', 'deep red'], ['#D9708F', 'rose pink'],
  ['#D9749B', 'rose pink'], ['#C77DA0', 'dusty pink'], ['#C240B7', 'magenta-violet'], ['#6B4FA0', 'violet'], ['#4B3778', 'dark violet'],
  ['#7A5AA6', 'purple'], ['#1F4E79', 'navy blue'], ['#17334F', 'dark navy'], ['#1B4965', 'bosphorus blue'], ['#2B3A55', 'dark navy'],
  ['#2B3346', 'slate navy'], ['#2B2E3A', 'dark slate'], ['#3A3F4C', 'slate'], ['#3A3F4D', 'slate'], ['#2F3440', 'dark slate'],
  ['#1E2330', 'midnight navy'], ['#2E6F7E', 'teal blue'], ['#2FA59A', 'teal'], ['#4FC48A', 'sea green'], ['#76E340', 'bright green'],
  ['#B9D636', 'lime green'], ['#C5D92E', 'hi-vis lime'], ['#D6E84A', 'bright lime'], ['#5E6670', 'grey-green slate'], ['#5E6878', 'slate grey'],
  ['#7E8A9A', 'slate grey'], ['#8A8F98', 'stone grey'], ['#7C8590', 'grey'], ['#9EA4AD', 'light grey'], ['#B7C3CF', 'pale grey-blue'],
  ['#8E9BAA', 'grey-blue'], ['#3D4450', 'dark slate'], ['#4A4F57', 'dark grey'], ['#5E636B', 'dark grey'], ['#3E3A35', 'dark taupe'],
  ['#4A4035', 'dark taupe'], ['#B8A98A', 'tan'], ['#EFE7DA', 'cream'], ['#F4EBDD', 'paper cream'], ['#EDE6D6', 'cream'],
  ['#E9E6DE', 'off-white'], ['#E9E4D8', 'cream'], ['#F4F1EA', 'off-white'], ['#F3F5F7', 'white'], ['#EDEDED', 'light grey'],
  ['#FFFFFF', 'white'], ['#E4F0A8', 'pale yellow-green'], ['#7D8B6A', 'zombie olive'], ['#E3B088', 'light tan'], ['#D9DEE5', 'steel'],
  ['#FF4D2E', 'danger red-orange'], ['#5BD16E', 'green'], ['#3DDCFF', 'cyan'], ['#FFD166', 'gold-yellow'], ['#E040FB', 'magenta-violet'],
  ['#D9CFBE', 'warm grey'], ['#FFB23F', 'gold'], ['#8B1E1E', 'dark red'], ['#C9CED6', 'silver grey'], ['#FFD27A', 'amber glass'],
  ['#E9B93A', 'gold'], ['#4F7A4A', 'green'], ['#9BD3E8', 'light blue'], ['#FFF3C4', 'pale yellow'], ['#D7F25A', 'lime'],
];
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function nameOf(h) {
  const [r, g, b] = rgb(h);
  let best = '?', bd = Infinity;
  NAMED.forEach(([hx, n]) => { const [x, y, z] = rgb(hx), d = (x - r) ** 2 + (y - g) ** 2 + (z - b) ** 2; if (d < bd) { bd = d; best = n; } });
  if (bd > 1600) console.warn('gen-art-prompts-characters: no close colour name for ' + h + ' (nearest: ' + best + ')');
  return best;
}
const col = h => { need(HEX.test(h), 'not a hex colour: ' + h); return nameOf(h) + ' ' + h.toUpperCase(); };
// Magenta or pink (hue 290 to 348 degrees, saturation 0.25 or more) takes the cyan key colour: magenta would vanish into it.
function magentaish(h) {
  const [r, g, b] = rgb(h).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (!d || d / mx < 0.25) return false;
  let hh = mx === r ? 60 * (((g - b) / d) % 6) : mx === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
  hh = (hh + 360) % 360;
  return hh >= 290 && hh < 348;
}
function hexesIn(o, out = []) {
  if (typeof o === 'string' && HEX.test(o)) out.push(o);
  else if (o && typeof o === 'object') Object.keys(o).forEach(k => hexesIn(o[k], out));
  return out;
}
const bgFor = hexes => (hexes.some(magentaish) ? 'cyan' : 'magenta');

// ---------- garments (from the outfit tables) ----------
const TOP = {
  suit: o => 'a suit jacket in ' + col(o.col) + ' over a white shirt front in ' + col(o.base) + (o.tie ? ' and a tie in ' + col(o.tie) : ''),
  hoodie: o => 'a pullover hoodie in ' + col(o.col) + ', hood down, white drawstrings',
  cardigan: o => 'an open cardigan in ' + col(o.col) + ' with ' + col(o.c2) + ' buttons',
  tee: o => 'a ' + (o.sleeve === 'short' ? 'short-sleeved' : 'long-sleeved') + ' t-shirt in ' + col(o.col),
  jacket: o => 'a zip jacket in ' + col(o.col) + (o.c2 ? ' with ' + col(o.c2) + ' trim' : ''),
  tracksuit: o => 'a tracksuit top in ' + col(o.col) + ' with ' + col(o.c2) + ' side stripes',
  apron: o => 'a shirt in ' + col(o.col) + ' with a clean ' + col(o.c2) + ' apron tied at the waist',
  vest: o => 'a ' + col(o.c2) + ' vest over a ' + col(o.col) + ' shirt',
  overall: o => 'bib overalls in ' + col(o.col) + ' over a ' + col(o.base || o.col) + ' shirt',
  dress: o => 'a long dress in ' + col(o.c2 || o.col),
  hivis: o => 'a hi-vis vest mostly ' + col(o.col) + ' with thin ' + col(o.c2) + ' edges and two silver reflective bands',
  tank: o => 'a ' + (o.sleeve === 'none' ? 'sleeveless ' : '') + 'tank top in ' + col(o.col),
  stripe: o => 'a striped shirt in ' + col(o.col) + ' with ' + col(o.c2) + ' stripes and collar',
  shirt: o => 'a buttoned shirt in ' + col(o.col),
};
const HAIR = {
  short: o => 'short ' + col(o.hc) + ' hair',
  bun: o => col(o.hc) + ' hair tied in a bun',
  long: o => 'long loose ' + col(o.hc) + ' hair past the shoulders',
  bald: o => 'a bald head with a fringe of ' + col(o.hc) + ' hair at the sides',
};
const HAT = { cap: o => 'a ' + col(o.hatC) + ' cap', hardhat: o => 'a ' + col(o.hatC) + ' hard hat' };
const ACC = { glasses: 'round wire glasses', moustache: 'a thick moustache', earbuds: 'white earbuds' };
const PROP = { briefcase: 'a briefcase', bag: 'a shopping tote bag', case: 'a metal tool case', handbag: 'a handbag' };
const HAND = { L: 'in its left hand (the far hand, the one away from the viewer in side view)', R: 'in its right hand (the near hand)' };
function garments(o) {
  const parts = [TOP[o.top] ? TOP[o.top](o) : 'a top in ' + col(o.col)];
  if (o.back === 'backpack') parts.push('a backpack in ' + col(o.bc) + ' on the back');
  parts.push((o.shorts ? 'shorts' : 'trousers') + ' in ' + col(o.pants) + ', shoes in ' + col(o.shoe));
  if (o.hair) parts.push(HAIR[o.hair](o));
  if (o.hat) parts.push(HAT[o.hat](o));
  (o.acc || []).forEach(a => { if (ACC[a]) parts.push(ACC[a]); });
  if (o.prop) parts.push(PROP[o.prop] + ' in ' + col(o.propC) + ' held ' + HAND[o.propHand]);
  return parts.join('; ');
}

// ---------- shared prompt text ----------
const GAME = 'Project Istanbul is a portrait, one-thumb survivor game: Arda, a 20-year-old student, walks home through a zombie-overrun Istanbul while dozens of zombies crowd the phone screen.';
const CAM = A.CAMERA_CHAR;
const FACE_RIGHT = A.FACING;
const FACE_VIEWER = 'The figure faces the viewer (the camera, at the bottom of the picture) in the same three-quarter top-down camera; the figure\'s left is on the right of the picture.';
const FACE_AWAY = 'The figure faces away from the viewer toward the top of the picture, in the same three-quarter top-down camera; the figure\'s left is on the left of the picture.';
const NEG_EXTRA = ' No watermark, no numbers, no arrows, no labels.';
const WALK_LEGEND = 'Walk cycle: walk1 puts the LEFT foot forward (heel on the paving, knee straight) with the right foot behind on its toes; walk2 is the mirror, RIGHT foot forward. Arms swing opposite to the legs. The body keeps the same height in walk1 and walk2.';
const HERO_LEGEND = 'The four walk frames loop: walk1 and walk3 are the CONTACT poses (left, then right foot forward), walk2 and walk4 the PASSING poses between them. The arms swing opposite the legs in every frame.';
const SHEET_3x2 = 'Deliverable: one image, 1536 x 1024 pixels, landscape: a grid of 3 columns and 2 rows, six equal cells of 512 x 512 pixels. Each figure is centred in its cell with at least 60 pixels of empty background around it.';
const CONSISTENCY_SHEET = file => 'Consistency: the attached file ' + file + ' is the approved design. Every cell shows the same character: same outfit, colours, hair, face, proportions and line weight. Change only the pose.';
const SUB = 'Generate the image now. Do not ask me questions.';
const join = arr => arr.filter(Boolean).join('\n\n');
// One self-contained message: game context, deliverable, subject, poses, camera, facing, style, background, negative, consistency, last line.
function figureMsg(o) {
  return join([o.game, o.deliverable, o.subject, o.poses, o.legend, o.camera || CAM, o.facing, A.STYLE, o.bg,
    A.NEGATIVE + (o.negExtra || NEG_EXTRA), o.consistency, SUB]);
}

module.exports = { P, CFG, LOOK, HEX, need, NEW, col, hexesIn, bgFor, garments, GAME, CAM, FACE_RIGHT, FACE_VIEWER, FACE_AWAY,
  NEG_EXTRA, WALK_LEGEND, HERO_LEGEND, SHEET_3x2, CONSISTENCY_SHEET, SUB, join, figureMsg };
