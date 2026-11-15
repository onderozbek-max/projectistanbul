'use strict';
// Character prompts for ChatGPT (Ink & Tea): 00-style (F1 to F3), 01-hero (Arda), 02-enemies (16 types, walker in four outfits),
// 03-bosses (11 designs). Numbers come from the game at run time: P.CFG (config-enemy-look.js, config-bosses.js, config-enemies*.js,
// config-levels.js and journey.js, loaded by lib-load.js like tools/bot.js does) and the outfit tables in js/view/, which are parsed
// as data and never run. Anything the view draws but config does not set is marked DESIGN CHOICE in the prompt's notes.
// Run: node prototype/tools/gen-art-prompts-characters.js   (writes art/commission/chatgpt/prompts/<batch>/ and TRACKER.csv)
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

// ---------- 00-style ----------
function styleItems() {
  return [
    { id: 'style-F1', file: 'F1', size: '1024 x 1536 pixels, portrait (2:3)', kind: 'style: key art', bg: 'none', order: 1, refs: [],
      message: join([
        GAME + ' This is the key art: Arda on Istanbul\'s Istiklal Avenue at dusk.',
        'Deliverable: one full painted scene, 1024 x 1536 pixels, portrait. Arda stands in the lower third, slightly left of centre, full body, about 45% of the picture height, facing right toward the zombies. On the tram rails up the middle of the avenue, a red-and-cream vintage tram (tram red #D7263D body, paper cream #F4EBDD roof and window band) fills the middle distance, with no text and no livery. Neoclassical facades (generic, unnamed, with no signs and no letters) line both sides and narrow toward the top. In the mid-ground 8 to 12 zombies shamble toward him: desaturated olive skin #7D8B6A, pale glowing eyes, everyday clothes in muted colours (office shirt, student hoodie, shopper cardigan), torn at the hems. The sky is dusk: bosphorus blue #1B4965 at the top, simit gold #E9A23B glow at the horizon.',
        'Arda: a 20-year-old Turkish university student, wiry, short dark-brown wavy hair swept up into a quiff, light stubble, expressive eyebrows, big brown eyes; a red pullover hoodie (tram red #D7263D) with the hood down and a light grey t-shirt collar (#9EA4AD) showing; dark navy jeans (#2B3A55); white sneakers (#F4F1EA) with grey soles (#8A8F98); white earbuds on a cable round his neck. He holds a silver table fork (steel #D9DEE5 tines, dark handle) in his right hand like a short weapon, tines forward.',
        CAM + ' Light: warm amber from the upper left, cool blue shadow on the lower right.',
        A.STYLE,
        'Background: this is a full painted scene, not a cut-out, so no key colour is used anywhere. Keep the sky and the avenue as flat, clean shapes.',
        A.NEGATIVE + NEG_EXTRA + ' No people other than Arda and the zombies, no real shop names, no religious buildings.',
        SUB,
      ]),
      checks: [
        'Arda is in the lower third, full body, facing right, with a fork in his right hand and the red hoodie with the hood down.',
        'A red-and-cream tram with no text or livery stands behind him on the rails, in the middle distance.',
        'Eight or more zombies approach from the middle distance: olive skin, pale glowing eyes, torn everyday clothes, no gore.',
        'The sky is bosphorus blue at the top and simit gold at the horizon.',
        'Figures have a bold near-black #14151F outline and flat cel shading (two or three tones), no airbrush, no photo look.',
        'No text, letters, signs with writing, logos, flags or religious buildings anywhere.',
        'The image is portrait, 1024 x 1536.',
      ],
      fails: [
        'Lettering on a shop, the tram or a sign: "Remove all lettering: every sign is blank. Keep everything else identical."',
        'Photographic or painterly: "Redo in flat cel shading with bold #14151F ink outlines and two tones per colour. Keep the composition and the outfit identical."',
        'Arda without the fork or in the wrong hoodie: "Arda holds a silver fork in his right hand and wears a tram-red hoodie (#D7263D) with the hood down. Change only that."',
      ],
      notes: 'Full scene, so no key colour (the cut-out rule does not apply). DESIGN CHOICE: Arda holds a silver fork here; every other hero image has empty hands. Owner to decide. Save the chosen image as F1.png.' },
    { id: 'style-F2', file: 'F2', size: '1024 x 1536 pixels, portrait (2:3)', kind: 'style: gameplay frame', bg: 'none', order: 2,
      refs: ['ref_current_gameplay_still_eminonu.png (in art/commission/refs/): the composition reference.'],
      message: join([
        GAME + ' This is the gameplay readability test: one frame of the real game as a finished picture.',
        'Deliverable: one full picture, 1024 x 1536 pixels, portrait, with the same composition as the attached reference ref_current_gameplay_still_eminonu.png: the hero low and central, the tram rails and paving in the same places, the zombies spread around him. Top-down three-quarter view of a wide pedestrian avenue, seen from above.',
        'Hero: Arda, a 20-year-old Turkish student with a short dark-brown quiff, a red pullover hoodie (tram red #D7263D) with the hood down, dark navy jeans (#2B3A55), white sneakers (#F4F1EA), hands empty. He stands at the lower centre, with a bright cyan ring (#3DDCFF) glowing on the ground at his feet, drawn on top of the zombies.',
        'Zombies: about sixty shambling zombies (desaturated olive skin #7D8B6A, pale glowing eyes, torn everyday clothes) spread around the hero: office workers, students, shoppers, each a readable black-outlined silhouette, none larger than the hero.',
        'Ground: grey stone paving (stone grey #8A8F98, mid value) with two parallel tram rails running vertically through the centre, subtle wear, no shadows under the figures. Scatter about 12 small glowing green droplets (#5BD16E) on the paving. Exactly one red hatched warning circle (#FF4D2E hatch lines) on the paving, to the right of the hero: the only red shape on the ground.',
        CAM + ' Light: warm amber from the upper left, cool blue shadow on the lower right of each figure.',
        A.STYLE,
        'Background: this is a full picture, not a cut-out, so no key colour is used. The paving is the whole background, flat and mid-grey.',
        A.NEGATIVE + NEG_EXTRA + ' No HUD, no numbers, no health bars, no text.',
        SUB,
      ]),
      checks: [
        'The hero is at the lower centre, the cyan ring under his feet is visible, and the red hoodie reads at phone size.',
        'About sixty zombies surround him, each a readable black-outlined silhouette.',
        'Exactly one red hatched warning circle on the ground, and about a dozen small green droplets.',
        'Paving is flat mid-grey (#8A8F98 family) with two tram rails through the centre and no shadows under figures.',
        'Bold near-black outlines on every figure, one line weight, flat two-tone shading.',
        'The layout follows the attached ref_current_gameplay_still_eminonu.png (hero low and central, rails in the same place).',
        'No HUD, numbers, text or logos.',
      ],
      fails: [
        'Gradient, vignette or shadows on the paving: "Make the paving one flat mid-grey (#8A8F98) with no gradient, no vignette and no shadows under the figures. Keep everything else identical."',
        'Zombies without outlines or with soft edges: "Give every figure a bold near-black #14151F outline of one weight. Keep the layout identical."',
        'Far too few zombies (under forty): "Add zombies until there are about sixty around the hero, in the same style. Keep the hero and the layout identical."',
      ],
      notes: 'Save the chosen image as F2.png. The reference is the current game (eminonu): keep its layout, not its rendering.' },
    { id: 'style-F3', file: 'F3', size: '1536 x 1024 pixels, landscape (3:2)', kind: 'style: hero turnaround sheet', bg: 'none', order: 3, refs: [],
      message: join([
        GAME + ' This is the character turnaround: the master design of Arda that every later hero image must match.',
        'Deliverable: one sheet, 1536 x 1024 pixels, landscape, on a plain light grey background (#D9DCE0), flat, no gradient. Two rows of three equal cells. Top row, left to right: (1) front view, facing the viewer; (2) side view, facing RIGHT; (3) back view, facing away. Bottom row, left to right: (4) head and shoulders, determined face; (5) head and shoulders, scared face; (6) head and shoulders, grinning face. Each full-body figure has the same height, feet on one baseline, about 80% of its cell height, with a margin round it. No labels, numbers, arrows or grid lines.',
        'Arda, the same character in all six cells: a 20-year-old Turkish university student, medium height and wiry, about three heads tall (big head, short torso, slightly large hands and feet). Head: round warm face, light tan skin (#E3B088) with a warm shade (#C98F66), big brown eyes, thick expressive eyebrows, light stubble on the jaw. Hair: short dark-brown (#2A1A12) wavy hair swept up into a quiff at the front. Outfit: a red pullover hoodie (tram red #D7263D, shade #A81E30) with the hood down and a light grey t-shirt collar (#9EA4AD) showing at the neck; dark navy jeans (#2B3A55); white sneakers (#F4F1EA) with grey soles (#8A8F98); white earbuds on a cable round his neck. Hands bare and empty in every cell.',
        'Camera: the full-body cells use the three-quarter top-down view, about 55 degrees above the ground, the ground not foreshortened. The head cells are straight-on, head and shoulders, same colours. Light: warm amber from the upper left, cool blue shadow on the lower right.',
        A.STYLE,
        'Background: one flat light grey (#D9DCE0) over the whole sheet; no shadow under the figures, no floor, nothing else on the background.',
        A.NEGATIVE + NEG_EXTRA,
        SUB,
      ]),
      checks: [
        'Six cells in the layout: front, side (facing right) and back on top; determined, scared and grinning below.',
        'The same person in all six: same face, quiff, hoodie with hood down, grey collar, navy jeans, white sneakers, earbud cable.',
        'Every full-body figure is the same height, feet on one baseline, nothing touching a cell edge.',
        'Bold near-black #14151F outlines of one weight everywhere, flat two-tone cel shading.',
        'Hands empty in every cell.',
        'Flat light grey background (#D9DCE0), no gradient, no labels, no numbers, no arrows.',
      ],
      fails: [
        'Face or hair changes between cells: "Keep the same face and hair in every cell: light tan face, dark-brown quiff. Change only the pose and the expression."',
        'Labels, numbers or arrows added: "Remove all labels, numbers and arrows. Keep everything else identical."',
        'Photoreal or airbrushed look: "Redo in flat cel shading with bold near-black outlines, no airbrush. Keep the sheet layout identical."',
      ],
      notes: 'Pass or fail test: run this prompt three times in one chat, save the runs as F3_run1.png, F3_run2.png and F3_run3.png in art/commission/in/00-style/, and copy the run that holds the same face best to F3.png. The hero prompts attach F3.png. Light grey (#D9DCE0) is the F3 spec; the magenta cut-out rule does not apply to this reference sheet.' },
  ];
}

// ---------- 01-hero: Arda ----------
const HERO_SUBJECT = 'Arda, a 20-year-old Turkish university student, wiry, about three heads tall (big head, short torso, slightly large hands and feet). Head: round warm face, light tan skin (#E3B088, shade #C98F66), big brown eyes, thick expressive eyebrows, light stubble, a sheepish half-grin. Hair: short dark-brown (#2A1A12) wavy hair swept up into a quiff at the front, one cowlick at the crown. Outfit: a red pullover hoodie in tram red (#D7263D, shade #A81E30) with the hood down and a light grey t-shirt collar (#9EA4AD) showing at the neck; dark navy jeans (#2B3A55); white sneakers (#F4F1EA) with grey soles (#8A8F98); white earbuds on a cable hanging round his neck. Hands bare and empty: no weapon, no bag.';
const HERO_REF = 'F3.png (in art/commission/in/00-style/): the approved turnaround of the same character.';
const HERO_BASE_REF = 'hero_arda_base.png (in art/commission/in/01-hero/): the approved master design.';
const HERO_SHEET_POSES = {
  side: [
    ['idle', 'as the base image: side view, standing relaxed'],
    ['walk1', 'CONTACT, LEFT foot forward: the left heel on the paving with the leg almost straight, the right foot behind on its toes, the right leg straight back, hips at the lowest point; the right arm (near) swings back, the left arm forward with a loose fist'],
    ['walk2', 'PASSING: the right leg swings forward under the body past the left leg, the right knee bent and the right foot lifted clear of the paving, the left leg straight under the hips, hips at the highest point; both arms hang near the hips'],
    ['walk3', 'CONTACT, RIGHT foot forward: the mirror of walk1, the right heel on the paving and the left foot behind on its toes; the left arm swings back, the right arm forward'],
    ['walk4', 'PASSING: the left leg swings forward under the body past the right (the mirror of walk2), the left foot lifted clear of the paving, hips at the highest point'],
  ],
  front: [
    ['idle', 'as the base image, facing the viewer, standing relaxed, head level'],
    ['walk1', 'CONTACT, LEFT foot forward: the left foot planted toward the viewer, heel down, knee straight; the right foot behind it with its toes just lifting and the right knee bent; hips low; the right arm swings forward (hand open), the left arm back'],
    ['walk2', 'PASSING: the right leg swings forward past the left, the right foot lifted clear of the paving, the left leg straight under the hips, hips high; both arms hang near the hips'],
    ['walk3', 'CONTACT, RIGHT foot forward: the mirror of walk1, the right foot planted toward the viewer and the left foot behind; the left arm swings forward'],
    ['walk4', 'PASSING: the left leg swings forward past the right (the mirror of walk2), the left foot lifted clear of the paving'],
  ],
  back: [
    ['idle', 'as the base image, facing away from the viewer, standing relaxed; the hood is down and the quiff shows from behind'],
    ['walk1', 'CONTACT, LEFT foot forward: the left foot planted away from the viewer, heel down, knee straight; the right foot behind it with its toes lifting, the right knee bent; hips low; the right arm swings forward, the left arm back'],
    ['walk2', 'PASSING: the right leg swings forward past the left, the right foot lifted clear of the paving, the left leg straight under the hips, hips high; both arms hang near the hips'],
    ['walk3', 'CONTACT, RIGHT foot forward: the mirror of walk1, the right foot planted and the left foot behind; the left arm swings forward'],
    ['walk4', 'PASSING: the left leg swings forward past the right (the mirror of walk2)'],
  ],
};
const HERO_EXTRA_POSES = [
  ['hurt', 'flinching from a hit, facing right in side three-quarter view: torso leaning back, head tilted back, eyes squeezed, the far arm (left) raised across the face with the hand open, the near arm (right) bent back, weight on the back foot, knees soft'],
  ['down', 'collapsed on the paving: lying flat on his back, seen straight from above, the arms loose and open, the legs bent and the sneakers pointing outward; no blood, no injury marks'],
  ['victory', 'arms raised straight up above the head in a V with both hands open, a big grin with the eyes creased, chest out, one foot forward; the hands are empty'],
];
function heroItems() {
  const base = {
    id: 'hero-base', file: 'hero_arda_base', size: '1024 x 1024 pixels, square', kind: 'hero: base design (Step A)', bg: 'magenta', order: 1,
    refs: [HERO_REF],
    message: figureMsg({
      game: GAME + ' Arda is the player: this image is the one master design of Arda that every later Arda image copies.',
      deliverable: 'Deliverable: one image, 1024 x 1024 pixels, square. One full-body figure in one idle pose, centred, feet on the bottom centre, the figure about 80% of the picture height, an even margin all round, nothing touching the edge.',
      subject: 'Subject: ' + HERO_SUBJECT,
      poses: 'Pose (idle, side-facing three-quarter): standing relaxed, weight on the back foot, the front knee soft, head level, facing right; his near arm (right) hangs at his side with the hand open, his far arm (left) bent slightly at the elbow, hand open.',
      facing: FACE_RIGHT,
      bg: A.bgLine('magenta'),
      consistency: 'Consistency: the attached file F3.png is the approved turnaround. Match its face, hair, outfit colours and proportions exactly; this image is the single master pose for the rest of the set.',
    }),
    checks: [
      'One figure, idle, facing right in side three-quarter view, feet on the bottom centre, about 80% of the picture height.',
      'Dark-brown quiff; red hoodie with the hood down and a grey collar; navy jeans; white sneakers with grey soles; earbud cable round the neck.',
      'Hands empty: no fork, no bag, no phone.',
      'Four-heads proportions: a big head, short torso, slightly large hands and feet (not a slim adult).',
      'Bold near-black #14151F outline of one weight, flat two or three tone cel shading, no airbrush.',
      'Background is one flat #FF00FF magenta: no gradient, no floor, no shadow under the feet.',
      'Face and outfit match the attached F3.png (same person).',
    ],
    fails: [
      'Gradient or shadow behind the figure: "Make the background one perfectly flat #FF00FF with no gradient and no shadow under the feet. Keep everything else identical."',
      'Wrong outfit colours (a navy hoodie, a green shirt): "Repaint only the outfit: hoodie tram red #D7263D with the hood down, jeans navy #2B3A55, sneakers off-white #F4F1EA. Keep the pose and the face identical."',
      'Something in the hands: "Remove everything from the hands; both hands are bare and empty. Keep everything else identical."',
    ],
    notes: 'This image becomes THE reference: save it as hero_arda_base.png in art/commission/in/01-hero/ and attach it to every later hero prompt. DESIGN CHOICE: the grey t-shirt collar and the earbuds round the neck follow the style bible and F3. docs/characters.md says a navy tee and one earbud in the ear (its hoodie is #E0323F). Decide before batch 2.',
  };
  const sheets = Object.keys(HERO_SHEET_POSES).map((v, i) => {
    const poses = HERO_SHEET_POSES[v];
    const facing = v === 'side' ? FACE_RIGHT : v === 'front' ? FACE_VIEWER : FACE_AWAY;
    const cells = poses.map((p, k) => '(' + (k + 1) + ') ' + p[0] + ': ' + p[1] + '.').concat(['(6) EMPTY: the bottom-right cell has only the flat background, no figure.']).join(' ');
    return {
      id: 'hero-' + v + '-sheet', file: 'hero_arda_' + v + '_sheet', size: '1536 x 1024 pixels, landscape, 3 x 2 grid', kind: 'hero: ' + v + ' view sheet', bg: 'magenta', order: i + 2,
      refs: [HERO_BASE_REF, HERO_REF],
      message: figureMsg({
        game: GAME + ' Arda is the player: this sheet is the animation frames for one view of his walk.',
        deliverable: SHEET_3x2 + ' Cell order, left to right and top to bottom: top row (1) idle, (2) walk1, (3) walk2; bottom row (4) walk3, (5) walk4, (6) EMPTY. Figures are the same size in every cell, feet on one baseline in each row, nothing touching a cell edge. No labels, numbers or arrows.',
        subject: 'Subject (identical in every cell): ' + HERO_SUBJECT,
        poses: 'Poses: ' + cells,
        legend: HERO_LEGEND,
        facing,
        bg: A.bgLine('magenta') + ' The flat background fills the whole sheet, including the empty margins between cells.',
        consistency: CONSISTENCY_SHEET('hero_arda_base.png') + ' Also attached: F3.png, the approved turnaround, for the face.',
      }),
      checks: [
        'Six cells in the layout, bottom-right cell empty (flat magenta only).',
        'The same Arda in every cell: quiff, hoodie with hood down, grey collar, navy jeans, white sneakers, earbud cable.',
        'walk1 and walk3 are mirror images (left foot forward, then right); walk2 and walk4 are the passing frames.',
        'Every figure is the same height; feet on one baseline per row; nothing touches a cell edge.',
        'Hands empty in every cell.',
        'Bold near-black #14151F outlines of one weight, flat two-tone cel shading, flat #FF00FF background with gaps between cells.',
      ],
      fails: [
        'walk1 and walk3 look the same: "Make walk3 the mirror of walk1: the right foot forward this time. Keep everything else identical."',
        'Figure touching a cell edge or a different size: "Shrink every figure so it sits inside its cell with a clear margin, all the same scale. Keep the poses identical."',
        'Outfit or face drift: "Match the attached hero_arda_base.png exactly: same face, quiff, red hoodie with the hood down, navy jeans. Change only the pose."',
      ],
      notes: v === 'side' ? 'Side view faces RIGHT. The game mirrors it for the left.' : 'The game uses the side view mirrored; this sheet is still needed for the front and back views.',
    };
  });
  const extra = {
    id: 'hero-hurt-down-victory-sheet', file: 'hero_arda_hurt_down_victory_sheet', size: '1536 x 1024 pixels, landscape, one row of three cells', kind: 'hero: hurt, down, victory sheet', bg: 'magenta', order: 5,
    refs: [HERO_BASE_REF, HERO_REF],
    message: figureMsg({
      game: GAME + ' Arda is the player: this sheet gives three story and feedback poses.',
      deliverable: 'Deliverable: one image, 1536 x 1024 pixels, landscape: one row of three equal cells (512 x 1024 pixels each), each figure centred with a margin round it, feet (or the body on the paving) on one baseline. Left to right: (1) hurt, (2) down, (3) victory. No labels, numbers or arrows.',
      subject: 'Subject (identical in all three cells): ' + HERO_SUBJECT,
      poses: 'Poses: (1) hurt: ' + HERO_EXTRA_POSES[0][1] + '. (2) down: ' + HERO_EXTRA_POSES[1][1] + '. (3) victory: ' + HERO_EXTRA_POSES[2][1] + '.',
      facing: FACE_RIGHT + ' The down cell is seen from above, the same top-down angle as the sheet.',
      bg: A.bgLine('magenta') + ' The flat background fills the whole sheet, including the margins between cells.',
      consistency: CONSISTENCY_SHEET('hero_arda_base.png') + ' Also attached: F3.png, the approved turnaround, for the face.',
    }),
    checks: [
      'Three cells in one row, hurt, down, victory, each the same scale.',
      'Hurt: a clear flinch back with the head tilted back and one arm across the face; the hands empty.',
      'Down: collapsed flat on the paving, no blood, no injury marks.',
      'Victory: both arms up in a V, a big grin, the hands empty.',
      'The same Arda in all three cells, with the same hoodie, jeans and sneakers as the base.',
      'Bold near-black outline of one weight, flat cel shading, flat #FF00FF background.',
    ],
    fails: [
      'Blood or wounds in the down cell: "Remove every mark of injury from the down cell: a flat collapsed figure only. Keep everything else identical."',
      'Something held in the hands: "Both hands are empty in all three cells. Remove the object. Keep everything else identical."',
      'Different outfit: "Match the attached hero_arda_base.png exactly: red hoodie, navy jeans, white sneakers. Change only the pose."',
    ],
    notes: 'Hurt and victory face right; the down cell is seen from above.',
  };
  return [base, ...sheets, extra];
}

// ---------- 02-enemies ----------
const EYES = 'pale glowing eyes (#E4F0A8 with a black pupil)';
// Per-type figure text. Colours and features come from config and the outfit table; this is the pose and set-up text.
const E = {
  runner: { build: 'lean, long-limbed, forward-leaning sprinter', head: 'narrow head, the violet hood up and the short hair tucked under it', face: 'mouth open in a shout, teeth showing, angry brows, ' + EYES,
    outfit: 'runner', accentAt: 'the violet hood and the whole tracksuit top',
    idle: 'crouched forward into a sprint start: weight on the front foot, the front arm pumped forward with the fist at chin height, the back arm bent behind',
    walk1: 'mid-sprint: the left leg reaches forward heel-first, knee nearly straight; the right leg kicks back with the heel toward the buttocks; the right arm pumps forward, the left arm back; torso leaning forward 20 degrees',
    walk2: 'mid-sprint with the legs and arms swapped: the right leg reaches forward, the left kicks back, the left arm pumps forward',
    hit: 'knocked back on its heels, torso upright, head snapped back, both arms flung out to the sides',
    dead: 'sprawled flat on the paving, limbs spread loosely, face turned to one side' },
  crawler: { build: 'no walking legs: a slumped torso propped on both elbows, the lower body a torn trouser stump dragging flat behind on the paving', head: 'head up, a few strands of dark hair', face: 'mouth open, teeth showing, ' + EYES,
    custom: { garments: 'a torn stone-grey coat (#8A8F98, darker folds #5E636B) with ragged sleeves and hem, and dark grey torn trousers (#5E636B) dragging behind, shoes in charcoal (#2A2A2A)', accentAt: 'the stone-grey torn coat (the whole torso)' },
    idle: 'elbows planted on the paving, torso low and slumped, head up, the trouser stump trailing flat',
    walk1: 'arm pull, phase A: the right arm stretched forward with the hand flat on the paving and the elbow bent, the left arm pulled back under the torso, the torso lifted a little, the trouser stump kicks once',
    walk2: 'arm pull, phase B: the mirror image, the left arm stretched forward with the hand flat on the paving and the right arm pulled back',
    hit: 'the torso jerks up off the elbows, head snapped back, one arm raised across the face',
    dead: 'flat sprawled on the paving, arms out to the sides, the coat spread',
    legend: 'Crawler walk cycle: walk1 is arm pull A and walk2 is arm pull B (the mirror). It has no walking legs: the body stays low in every walk frame.' },
  diner: { build: 'squat and broad, short legs, a wide round belly', head: 'round head', face: 'worried brows, ' + EYES,
    outfit: 'diner', accentAt: 'the cream apron', prop: 'a flat paper-white plate (#F4F1EA) held level at the waist in both hands, elbows bent',
    idle: 'standing squat with the plate held level at the waist in both hands',
    walk1: 'shuffling step: the left foot forward heel-down, the right behind on its toes; the plate stays level; torso tilted 8 degrees forward',
    walk2: 'shuffling step: the right foot forward, the left behind; the plate stays level',
    hit: 'staggers back, the plate tilted, head snapped back',
    dead: 'collapsed flat on its back on the paving, the plate lying face up beside the body' },
  kurye: { build: 'slim rider hunched over a small scooter', head: 'small head, the face angled down toward the handlebar', face: 'angry brows, mouth open, ' + EYES,
    outfit: 'kurye', accentAt: 'the orange jacket and the orange delivery box',
    prop: 'a small blue scooter (deck #3D6E9E, dark wheels #2A2D38) under the rider, with an orange delivery box (#E8782A) mounted over the rear wheel; the rider sits on the scooter and leans into the box, both hands on the handlebar in front of the chest; the scooter is part of the figure',
    idle: 'sitting on the scooter, leaning forward into the box, both hands on the handlebar, the scooter standing on both wheels',
    walk1: 'scooter rolling: the left foot pushing against the paving and the right foot on the deck; rider leaning forward, head low',
    walk2: 'scooter rolling: the right foot pushing and the left foot on the deck; rider leaning forward, head low',
    hit: 'scooter slewing sideways, rider thrown back against the handlebar, one arm up',
    dead: 'scooter lying on its side and the rider sprawled beside it' },
  copci: { build: 'broad and short, hunched, very wide shoulders, short thick legs', head: 'broad head, the face angled down', face: 'worried brows, mouth open, ' + EYES,
    outfit: 'copci', accentAt: 'the lime hi-vis vest front panel', negExtra: ' No municipal insignia, no badges, no patches, no text on the vest.',
    prop: 'a long wooden broom (handle #8B6B3E) held out in front in both hands at waist height, its brass-yellow brush head (#C9A13B) resting on the paving',
    idle: 'hunched, both hands on the broom handle held out in front at waist height, the brush head on the paving',
    walk1: 'plodding: the left foot forward heel-down, the broom sweeps forward across the paving in front, torso leaning forward',
    walk2: 'plodding: the right foot forward, the broom sweeps back across the paving',
    hit: 'staggers back, the broom raised across the body, head snapped back',
    dead: 'face down on the paving, the broom lying beside the body' },
  marti: { gull: true, build: 'a plump white seagull in flight, long pointed wings, seen from above and a little to the side, no legs visible', head: 'a small round head with a black eye', face: 'a black eye (#14151F) and a short gold beak (#FFB23F)',
    custom: { garments: 'no clothes: a white body (#F3F5F7), a far wing in grey-blue (#8E9BAA), a near wing in pale grey-blue (#B7C3CF) with black wingtips (#14151F), and a gold beak (#FFB23F)', accentAt: 'the white body and the gold beak' },
    idle: 'both wings raised high in an upstroke, above the body',
    walk1: 'wings mid-stroke, level with the body; the body stays at the same height as in idle',
    walk2: 'wings down in a downstroke, below the body; the body stays at the same height',
    hit: 'tumbling sideways, wings splayed wide, the beak pointing down',
    dead: 'fallen bird lying on its side on the paving, wings spread loosely, beak pointing sideways',
    legend: 'Gull wing cycle: idle is wings up, walk1 is wings mid-stroke, walk2 is wings down. The body stays in the same place in every cell.',
    negExtra: ' No ground shadow under the bird.' },
  cayci: { build: 'average build with a slight stoop', head: 'round head', face: 'worried brows, ' + EYES,
    outfit: 'cayci', accentAt: 'the teal vest', prop: 'a copper tray (#B8733A) with a teal cloth (#2FA59A) and three amber glasses (#E9A23B) on it, held out in front at chest height in both hands',
    idle: 'tray held out in front at chest height, both hands under it, elbows bent',
    walk1: 'walking with the tray held level: the left foot forward heel-down, the right behind; arms steady',
    walk2: 'walking with the tray held level: the right foot forward, the left behind',
    hit: 'staggers back, the tray tilted, one glass sliding',
    dead: 'lying face up on the paving, the tray flat beside the body, the glasses on the cloth' },
  spitter: { build: 'hunched forward, average height, thick neck', head: 'thick neck, the head sunk forward', face: 'angry brows, mouth closed around a swollen throat, ' + EYES,
    outfit: 'spitter', accentAt: 'the throat sac under the chin (sea green #4FC48A)',
    idle: 'hunched, forearms held forward at waist height, fists closed, the throat sac medium size',
    walk1: 'shambling: the left foot forward heel-down, the right behind; forearms held forward',
    walk2: 'shambling: the right foot forward, the left behind; forearms held forward',
    hit: 'head snapped back, the throat sac squashed flat, one arm up',
    dead: 'collapsed flat on the paving, face to one side, the sac deflated' },
  zehirli: { build: 'tall and upright, a spray tank on the back', head: 'upright head', face: 'a grey gas respirator over the lower face with a bright green filter cap, ' + EYES + ' above it',
    outfit: 'zehirli', accentAt: 'the bright green (#76E340) filter cap and the stripe on the spray tank',
    prop: 'a tall spray tank on the back (lime #D6E84A with a pale stripe #F4F1EA), a short hose to a spray wand in the right hand',
    idle: 'upright, hands held out in front at waist height, the spray wand in the right hand',
    walk1: 'upright shamble: the left foot forward heel-down, the right behind; hands held forward',
    walk2: 'upright shamble: the right foot forward, the left behind; hands held forward',
    hit: 'staggers back, the tank tilted, head snapped back',
    dead: 'lying on its back, the tank beside the body' },
  brute: { build: 'huge shoulders and a very broad chest, short thick legs, the largest body in the roster', head: 'small head sunk into the shoulders', face: 'an angry brow, ' + EYES,
    outfit: 'brute', accentAt: 'the slate boiler suit (the whole body)',
    idle: 'broad stance, arms hanging down past the knees with the knuckles near the paving',
    walk1: 'heavy stomp: the left foot forward heel-down, the right behind; arms dragging',
    walk2: 'heavy stomp: the right foot forward, the left behind; arms dragging',
    hit: 'staggers back on its heels, arms flung out to the sides',
    dead: 'face down, flat on the paving, the arms spread' },
  bloater: { build: 'round swollen belly, short legs, waddles', head: 'small head on a short neck', face: 'worried brows, puffed cheeks, ' + EYES,
    outfit: 'bloater', accentAt: 'the rose-pink belly area and the dusty-pink shirt',
    idle: 'belly pushed out, arms held out to the sides and bent at the elbows, weight on the short legs',
    walk1: 'waddle: the left foot forward heel-down, the belly rolling forward; arms out to the sides',
    walk2: 'waddle: the right foot forward, the belly rolling back',
    hit: 'body tilted back, the belly jiggling, arms flung out',
    dead: 'flat on its back on the paving, the belly up',
    swollen: 'the belly fully swollen, round and tight, the shirt stretched taut over it, arms held away from the sides; no bursting, no fluid, no gore' },
  screamer: { build: 'gaunt and thin, long neck, narrow shoulders', head: 'gaunt narrow head', face: 'mouth wide open in a scream (the mouth a dark ink shape), ' + EYES,
    outfit: 'screamer', accentAt: 'the cream dress (the whole figure)',
    idle: 'arms raised above the head with clenched fists, mouth wide open screaming, a slight backward lean',
    walk1: 'running stride with the arms up: the left foot forward, the elbows bent and the fists high',
    walk2: 'running stride with the arms up: the right foot forward, the fists high',
    hit: 'recoils violently backward, arms up, hair flying',
    dead: 'lying flat, hair spread on the paving, arms thrown up' },
  hardhat: { build: 'bulky and square, very broad body, short legs', head: 'broad square head', face: 'angry brows, mouth open, ' + EYES,
    outfit: 'hardhat', accentAt: 'the yellow hard hat and the yellow vest panel',
    idle: 'feet apart, arms bent at the elbows and raised slightly, fists in front',
    walk1: 'stomp: the left foot forward heel-down, the right behind; the arms swing',
    walk2: 'stomp: the right foot forward, the left behind; the arms swing',
    hit: 'helmet knocked sideways, staggers back',
    dead: 'flat on the paving, the helmet rolled off to one side' },
  kasap: { build: 'broad and heavy, a big belly, slow', head: 'broad head, heavy jowls', face: 'angry brows, mouth closed, ' + EYES,
    outfit: 'kasap', accentAt: 'the cream apron (#EDE6D6), clean with no stains', prop: 'a steel cleaver (blade #D9DEE5, handle #6B4A2E) held out in the right hand at waist height, blade forward',
    idle: 'slow wall stance, the cleaver held out in front at waist height',
    walk1: 'slow stomp: the left foot forward heel-down, the right behind; the cleaver held out',
    walk2: 'slow stomp: the right foot forward, the left behind; the cleaver held out',
    hit: 'staggers back, the cleaver held low',
    dead: 'flat on the paving, the cleaver beside the body' },
  parkur: { build: 'slim and wiry, low centre of gravity', head: 'a magenta-violet bandana (#C240B7) tied across the forehead, its tail trailing back', face: 'focused brows, mouth closed, ' + EYES,
    outfit: 'parkur', accentAt: 'the bandana and its tail (magenta-violet #C240B7)',
    idle: 'crouched low, knees bent deep, arms bent in front, ready to leap',
    walk1: 'bounding stride: the left knee bent and the left foot forward, the right foot pushing off behind on its toes; arms swinging',
    walk2: 'bounding stride: the right knee bent and the right foot forward, the left pushing off behind',
    hit: 'flung back, arms wide, one leg off the paving',
    dead: 'sprawled flat, limbs spread' },
};
const WALKER = {
  office: { outfit: 'walk_office', label: 'walker v0', accent: LOOK.types.walker.accent, accentAt: 'the navy suit jacket (the whole torso)', extra: '' },
  student: { outfit: 'walk_student', label: 'walker v1', accent: NEW.walk_student.bc, accentAt: 'the simit-gold backpack on the back', extra: '' },
  shopper: { outfit: 'walk_shopper', label: 'walker v2', accent: NEW.walk_shopper.propC, accentAt: 'the purple tote bag in the right hand', extra: '' },
  tourist: { outfit: 'walk_tourist', label: 'walker v3', accent: NEW.walk_tourist.col, accentAt: 'the teal t-shirt and the teal band of the sun hat', extra: 'a paper sun hat (paper cream #F4EBDD) with a teal band, a small camera (body #2A2D38, lens #8A8F98) on a strap at the chest' },
};
const WALKER_BASE = { build: 'average build, hunched, shambling', head: 'head tilted to one side', face: 'slack open mouth, ' + EYES,
  idle: 'hunched, head tilted, arms hanging forward with loose hands',
  walk1: 'shambling: the left foot forward heel-down, the right behind on its toes; the arm on the back-foot side swings forward',
  walk2: 'shambling: the right foot forward, the left behind on its toes; the mirror arm swings forward',
  hit: 'staggers back, head snapped back, one arm raised across the face',
  dead: 'collapsed flat on the paving, limbs loose' };
// Enemy order = first appearance in the levels, using the sim's own roster rules (sim/levels.js rosterOf, enemyRosterAdds).
function firstLevels() {
  const C = CFG.levels, H = P.Journey.hoods, first = {};
  const roster = (hood, stage, hi) => {
    const out = hood.enemies.filter(t => t !== 'diner');
    const push = t => { if (out.indexOf(t) < 0) out.push(t); };
    if (stage >= C.extraFrom) {
      (C.hoodExtras[hood.id] || []).forEach(push);
      C.schedule.forEach(sc => { if (sc.hood === hood.id && stage >= sc.from) push(sc.type); });
      if (C.thief && hi >= C.thief.fromHood && stage >= C.thief.from) push(C.thief.type);
    }
    ((CFG.enemyRosterAdds || {})[hood.id] || []).forEach(push);
    return out;
  };
  let lvl = 0;
  for (let h = 0; h < H.length; h++) for (let s = 1; s <= P.Journey.levelsPerHood; s++) {
    lvl++;
    H[h].enemies.concat(roster(H[h], s, h)).forEach(t => { if (first[t] === undefined) first[t] = lvl; });
  }
  return first;
}
const FIRST = firstLevels();
const ENEMY_ORDER = Object.keys(E).concat(['walker']).sort((a, b) => {
  const fa = a === 'walker' ? 1 : FIRST[a], fb = b === 'walker' ? 1 : FIRST[b];
  return fa - fb || (a === 'walker' ? -1 : b === 'walker' ? 1 : 0);
});
const ENEMY_NOTES = {
  walker: 'DESIGN CHOICE: config gives the walker one accent (#1F4E79, the office suit). It stays on the office outfit; the student, shopper and tourist use their own outfit colour as the accent (named in the prompt).',
  crawler: 'DESIGN CHOICE: the game draws a random civilian outfit on the crawler (sprites.js crawlerRc). The stone-grey coat is the config accent #8A8F98, which is also the paving colour: check it on the phone, it may read weak on the ground.',
  kasap: 'DESIGN CHOICE: the view draws dark blood stains on the apron (art-enemies3.js). They are dropped to keep to the no-gore rule.',
  parkur: 'CONFIG CONFLICT: config accent is magenta-violet #C240B7, but the view draws the bandana in orange #D98C2B. This prompt follows config. Magenta-violet is close to the elite marker #E040FB, which is reserved.',
  marti: 'Config feature is a gull in flight. The pigeon look is for inland hoods (P.CFG.birdLook: istiklal, kapalicarsi, beyazit, saray, yenikapi, zeytinburnu, bakirkoy). This batch makes only the gull; the pigeon is a later variant (ask the owner). No ground shadow in the art: the view draws one.',
  copci: 'CONFIG CONFLICT: the brief said the copci pushes a bin shield, but config and the view give it a broom. This prompt follows config (broom).',
  bloater: 'The swollen pose fills the sixth cell (bottom-right). Belly swelling is not gore: no fluid, no bursting.',
  zehirli: 'CONFIG NOTE: accent is bright green #76E340; the view draws the spray tank lime #D6E84A. The prompt puts the accent on the filter cap and the tank stripe.',
};
function enemyDesigns() {
  const out = [];
  ENEMY_ORDER.forEach(key => {
    if (key !== 'walker') { out.push({ key, variant: null, spec: E[key] }); return; }
    Object.keys(WALKER).forEach(v => out.push({ key: 'walker', variant: v, spec: WALKER_BASE, w: WALKER[v] }));
  });
  return out;
}
// Resolves one enemy design: config feature and accent, outfit colours and the file names.
function enemyOf(d) {
  const isW = d.key === 'walker', s = d.spec, w = d.w;
  const t = LOOK.types[d.key];
  need(t && HEX.test(t.accent) && t.feature, 'config-enemy-look.js has no accent or feature for ' + d.key);
  const outfit = s.custom ? null : NEW[isW ? w.outfit : s.outfit];
  need(s.custom || outfit, 'no outfit for ' + d.key);
  const accent = isW ? w.accent : t.accent;
  const hexes = [accent, ...hexesIn(outfit || {}), ...((s.prop || '').match(/#[0-9A-Fa-f]{6}/g) || [])];
  return {
    file: 'enm_' + d.key + (d.variant ? '_' + d.variant : ''), name: isW ? 'walker, ' + d.variant + ' outfit' : d.key, key: d.key,
    feature: t.feature, accent, accentAt: isW ? w.accentAt : (s.custom ? s.custom.accentAt : s.accentAt),
    garmentText: s.custom ? s.custom.garments : garments(outfit), spec: s, extra: isW ? w.extra : '',
    lineup: isW ? w.label : d.key, bg: bgFor(hexes), gull: !!s.gull, note: ENEMY_NOTES[isW ? 'walker' : d.key] || '',
  };
}
function enemyItems() {
  const items = [];
  enemyDesigns().forEach((d, i) => {
    const e = enemyOf(d), s = e.spec, bgl = A.bgLine(e.bg), prop = s.prop ? ' Props: ' + s.prop + '.' : '';
    const order = i * 2 + 1, sheetOrder = i * 2 + 2;
    const figure = e.gull ? 'gull' : 'zombie';
    const neg = NEG_EXTRA + (s.negExtra || '');
    const baseMsg = figureMsg({
      game: GAME + ' This is the enemy design "' + e.name + '" (' + e.feature + '), one of the zombies that crowd the screen. This image is its single base design; later pose sheets copy it.',
      deliverable: 'Deliverable: one image, 1024 x 1024 pixels, square. One full-body ' + figure + ', idle, centred, ' + (e.gull ? 'body centre at the middle of the picture, no feet' : 'feet on the bottom centre') + ', about 80% of the picture height, an even margin all round, nothing touching the edge.',
      subject: 'Subject: ' + s.build + '. Head: ' + s.head + '. Face: ' + s.face + '. ' + (s.custom ? 'Body and clothing: ' : 'Clothing: ') + e.garmentText + '.' + prop +
        ' Accent colour ' + col(e.accent) + ' on ' + e.accentAt + '. Silhouette feature, which must read as a solid black shape at 48 px: ' + e.feature + '.' + (e.extra ? ' Extra: ' + e.extra + '.' : ''),
      poses: 'Pose (idle): ' + s.idle + '.',
      facing: FACE_RIGHT,
      bg: bgl,
      negExtra: neg,
      consistency: 'Consistency: the attached file ref_current_enemy_lineup_2x.png is a rough design reference only. Copy the silhouette feature and the colour accents of the figure named "' + e.lineup + '" from this reference sheet, but redraw it in the Ink & Tea style described; do not copy its rendering.',
    });
    items.push({ id: 'enm-' + e.file.slice(4) + '-base', file: e.file + '_base', size: '1024 x 1024 pixels, square', kind: 'enemy: base design (Step A)', bg: e.bg, order,
      refs: ['ref_current_enemy_lineup_2x.png (in art/commission/refs/): rough reference only, for the silhouette feature and accents.'],
      message: baseMsg,
      checks: [
        'The silhouette feature is present and reads as a solid black shape: ' + e.feature + '.',
        'The accent colour ' + col(e.accent) + ' is on ' + e.accentAt + ', and nowhere else as a big area.',
        'Outfit and colours match the lineup figure named "' + e.lineup + '" (same garments, not its rendering).',
        'Bold near-black #14151F outline of one weight, flat two or three tone cel shading.',
        'Pale glowing eyes (no red or orange eyes); desaturated olive skin; no gore, no blood pools.',
        'One figure, idle, facing right, centred, ' + (e.gull ? 'no feet, no ground shadow' : 'feet on the bottom centre') + ', about 80% of the picture height.',
        'Background is one flat ' + (e.bg === 'cyan' ? '#00FFFF cyan' : '#FF00FF magenta') + ': no gradient, no floor, no shadow.',
      ],
      fails: [
        'Background gradient or shadow: "Make the background one perfectly flat ' + (e.bg === 'cyan' ? '#00FFFF cyan' : '#FF00FF magenta') + ' with no gradient and no ground shadow. Keep everything else identical."',
        'Wrong silhouette feature or accent: "Keep the ' + e.feature + ' silhouette and make the accent ' + col(e.accent) + ' on ' + e.accentAt + '. Keep everything else identical."',
        'Photographic or airbrushed look: "Redo in flat cel shading with bold near-black #14151F outlines and no airbrush. Keep the pose and the outfit identical."',
      ],
      notes: [e.note, 'Save the chosen image as ' + e.file + '_base.png in art/commission/in/02-enemies/. Sheet ' + sheetOrder + ' attaches it.'].filter(Boolean).join(' ') });
    const cells = [['idle', s.idle], ['walk1', s.walk1], ['walk2', s.walk2], ['hit', s.hit], ['dead', s.dead]];
    const sixth = s.swollen ? ['swollen', s.swollen] : null;
    const cellText = cells.map((c, k) => '(' + (k + 1) + ') ' + c[0] + ': ' + c[1] + (c[0] === 'dead' ? ' (seen straight from above)' : '') + '.')
      .concat([sixth ? '(6) swollen: ' + sixth[1] + '.' : '(6) EMPTY: the bottom-right cell has only the flat background, no figure.']);
    const sheetMsg = figureMsg({
      game: GAME + ' This sheet gives the animation frames of one zombie design.',
      deliverable: SHEET_3x2 + ' Cell order, left to right and top to bottom: top row (1) idle, (2) walk1, (3) walk2; bottom row (4) hit, (5) dead, (6) ' + (sixth ? 'swollen' : 'EMPTY') + '. Each figure is the same zombie at the same scale, its feet (or the body on the paving) on one baseline in each row, about 70% of its cell height. No labels, numbers, arrows or grid lines.',
      subject: 'Subject (identical in every cell' + (sixth ? ' except the belly size in cell 6' : '') + '): ' + s.build + '. Head: ' + s.head + '. Face: ' + s.face + '. ' + (s.custom ? 'Body and clothing: ' : 'Clothing: ') + e.garmentText + '.' + prop + ' Accent ' + col(e.accent) + ' on ' + e.accentAt + '. Silhouette feature: ' + e.feature + '.' + (e.extra ? ' Extra: ' + e.extra + '.' : ''),
      poses: 'Poses: ' + cellText.join(' '),
      legend: s.legend || (e.gull ? 'Gull wing cycle: idle is wings up, walk1 mid-stroke, walk2 wings down; the body stays in one place.' : WALK_LEGEND),
      facing: FACE_RIGHT + ' Only the dead cell is seen straight from above.',
      bg: bgl + ' The flat background fills the whole sheet, including the empty margins between cells.',
      negExtra: neg,
      consistency: CONSISTENCY_SHEET(e.file + '_base.png') + ' Also: ref_current_enemy_lineup_2x.png is only a rough reference; ignore its rendering.',
    });
    items.push({ id: 'enm-' + e.file.slice(4) + '-sheet', file: e.file + '_sheet', size: '1536 x 1024 pixels, landscape, 3 x 2 grid', kind: 'enemy: pose sheet (Step B)', bg: e.bg, order: sheetOrder,
      refs: [e.file + '_base.png (in art/commission/in/02-enemies/): the approved base design.'],
      message: sheetMsg,
      checks: [
        'Six cells: idle, walk1, walk2 on top; hit, dead, ' + (sixth ? 'swollen' : 'an empty cell') + ' on the bottom.',
        'Every cell is the same zombie as the attached base: same outfit, colours, hair, accent and silhouette feature.',
        walkCheck(e),
        'Dead is collapsed flat and seen from above; hit is a clear flinch back with one arm raised.',
        'Every figure has the same scale; feet or body on one baseline per row; nothing touches a cell edge.',
        'Bold near-black outlines of one weight, flat cel shading; the background is flat ' + (e.bg === 'cyan' ? 'cyan #00FFFF' : 'magenta #FF00FF') + ' with clear gaps between cells.',
        sixth ? 'The sixth cell is the swollen belly, the same figure, not a burst or a new colour.' : 'The bottom-right cell is empty (flat background only).',
      ],
      fails: [
        'Cells differ in outfit or colour: "Match the attached ' + e.file + '_base.png exactly: same outfit, colours and hair in every cell. Change only the pose."',
        'Walk frames look the same: "Make walk2 the mirror of walk1: the right foot forward this time. Keep everything else identical."',
        'Figure touching a cell edge or the wrong scale: "Shrink every figure to sit inside its cell with a clear margin, all at the same scale. Keep the poses identical."',
      ],
      notes: e.note || '' });
  });
  return items;
}
function walkCheck(e) {
  if (e.key === 'crawler') return 'walk1 and walk2 are the two arm-pull poses (mirror images); the body stays low in every frame.';
  if (e.gull) return 'Wings: idle up, walk1 mid, walk2 down; the body stays in the same place.';
  return 'walk1 and walk2 are mirror images (left foot forward, then right), the same body height.';
}

// ---------- 03-bosses ----------
// Hood -> boss design. The five brute-type bosses are costumes of one body (config bossCostumes); the rest are archetypes.
const BOSS_COSTUME = { 'boss.istiklal': 'vatman', 'boss.galata': 'guide', 'boss.karakoy': 'bride', 'boss.yedikule': 'keeper', 'boss.atakoy': 'bigbro' };
const COSTUME_OUTFIT = { vatman: 'boss_vatman', guide: 'boss_guide', bride: 'boss_bride', keeper: 'boss_keeper', bigbro: 'boss_bigbro' };
const BOSS_SIZE = 'Build: bigger and broader than an ordinary zombie of its type, with the same three-heads proportions and a larger body, never a taller head.';
const COSTUME_PROP = {
  vatman: 'a long tram hook (steel #8A8F98 hook on a wood pole #5E4628) held out in the right hand at shoulder height, pointing forward; brass buttons (#D9B25A) down the front of the jacket',
  guide: 'a gold megaphone (#E9A23B) held in the right hand at hip height; a teal lanyard badge (#2E6F7E) with a paper-white card (#F4F1EA) hanging on the chest',
  bride: 'a long A-line white gown (#F4EBDD, shade #D9CFBE) to the floor with a veil trailing behind; a bouquet in the right hand: rose-pink flowers (#D9708F) on green stems (#4F7A4A)',
  keeper: 'a ring of brass keys (#C9A13B) hanging from the belt at the hip; a long brass key (#C9A13B) held in the left hand, hanging down',
  bigbro: 'a gold chain (#E9B93A) across the chest with a round pendant; dark sunglasses (#14151F) across the eyes with a small white glint',
};
const COSTUME_ACCENT_AT = { vatman: 'the tram-red zip jacket (the whole torso)', guide: 'the gold visor cap and the gold megaphone', bride: 'the long white gown', keeper: 'the grey coveralls (the whole body)', bigbro: 'the blue track pants (the lower body)' };
const COSTUME_POSE = {
  vatman: { idle: 'planted wide, the tram hook held out in the right arm at shoulder height, the left fist on the hip', windup: 'the right arm pulls the tram hook back over the right shoulder, the body coiled, weight on the back foot, knees bent', attack: 'the hook swung forward in a wide arc at the hit moment, the hook head at knee height in front of the body, the body leaning in', hurt: 'staggering back, the hook dropped and dragging, head snapped back, one hand raised', dead: 'collapsed flat on the ground, face down, the peaked cap rolled away, the hook lying beside the body' },
  guide: { idle: 'standing upright, the megaphone held at the hip in the right hand, pointing forward', windup: 'megaphone raised to mouth height, the left hand raised as if calling out, chest out', attack: 'megaphone swung in a wide overhead arc at the hit moment, the body twisting', hurt: 'staggering back, the megaphone falling from the hand, cap askew', dead: 'flat on the ground, the cap a few steps away, the megaphone beside the body' },
  bride: { idle: 'standing tall, the bouquet held at the waist in the right hand, the veil trailing behind', windup: 'the bouquet pulled back over the right shoulder, the body bent back, the veil fanned out', attack: 'the bouquet swept forward in a wide sweep at the hit moment, the gown flaring', hurt: 'staggering back, the bouquet dropped, the veil tangled round the legs', dead: 'lying flat, the gown spread round the body, the veil fanned out' },
  keeper: { idle: 'standing with weight on both feet, the long brass key hanging from the left hand, the key ring at the hip', windup: 'the long key swung back and up behind the body, knees bent', attack: 'the key swung down and forward in a heavy arc at the hit moment, the key ring flying out', hurt: 'staggering, the key dropping from the hand', dead: 'flat on the ground, the key ring spilled beside the body' },
  bigbro: { idle: 'arms spread wide at the shoulders, chest out, chin up, the gold chain catching the light', windup: 'both arms flung back and out, chest thrust forward', attack: 'both arms flung forward and wide in a two-armed sweep at the hit moment, the body twisted', hurt: 'staggering back, the sunglasses knocked askew', dead: 'collapsed flat, arms spread, the sunglasses lying on the ground' },
};
const WALK_BOSS = {
  walk1: 'slow, heavy step: the left foot forward heel-down, the right behind on its toes; the arms swing slowly',
  walk2: 'slow, heavy step: the right foot forward, the left behind on its toes',
};
const BOSS_NAMES = { vatman: 'Vatman (tram conductor)', guide: 'Tour Guide', bride: 'Bride', keeper: 'Key Keeper', bigbro: 'Big Bro' };
// Designs that are not costumes: body from the archetype's enemy type, plus the props and clothes the view draws.
const BOSS_ARCH = {
  bloater: { title: 'the bloater boss: the bloater zombie, bigger', base: 'bloater', hexesExtra: [] },
  spitter: { title: 'the spitter boss: the spitter zombie, bigger', base: 'spitter', hexesExtra: [] },
  kasapBoss: { title: 'the butcher boss: the kasap butcher, bigger', base: 'kasap', hexesExtra: [] },
  taksici: { title: 'the taxi boss: a yellow taxi with its driver', base: null, hexesExtra: ['#FFC93C', '#9BD3E8', '#1B1D26'] },
  tourGuide: { title: 'the Docent (saray, Topkapi district): a broad tour guide with an umbrella', base: 'brute', hexesExtra: ['#B5453A', '#2E6F7E', '#D4A23A'] },
  antiquarian: { title: 'the Antiquarian (halic): a stooped bookseller with a brass lamp', base: 'kasap', hexesExtra: ['#C9A13B', '#FFD27A', '#B8562F'] },
};
const TAXI_TEXT = {
  build: 'a yellow taxi car seen from above at a three-quarter angle, with its driver standing up through the open roof; the car is the boss body',
  garments: 'a stocky driver in a dark slate shirt (#3A3F4D) and a peaked cap (#1B1D26)',
  prop: 'the car: a yellow body (#FFC93C) with dark trim (#1B1D26), a light blue windscreen (#9BD3E8) and pale headlights (#FFF3C4); a small roof sign with no text',
  accentAt: 'the yellow car body', accent: '#FFC93C',
  poses: { idle: 'the car idling on its wheels with the driver standing up through the roof, arms resting on the roof edge', windup: 'the car reversing back on its wheels, the nose raised a little, the driver leaning back', attack: 'the car charging forward, the nose down, the driver leaning out and honking (two small flat honk lines, no text)', hurt: 'the car spinning, the wheels angled, the driver thrown back in the seat', dead: 'the car stopped at an angle with a dent in the bonnet, the driver slumped in the seat, seen from above' },
  walk1: 'the car rolling forward on its wheels, the front wheels turned slightly, the driver upright', walk2: 'the car rolling forward, the front wheels turned the other way, the driver upright',
};
const DOCENT_TEXT = {
  build: 'a broad, heavy man with a wide chest and hips, standing tall; the body is wider than an ordinary zombie',
  garments: 'a navy blazer (#1B4965) over a cream shirt (#F4EBDD), dark slate trousers (#2B2E3A), brown shoes (#6B4A2E)',
  prop: 'an open red umbrella (#B5453A) with ribs and a brass hub (#D4A23A), its dark wood shaft (#5E4628) resting over the right shoulder; a teal tour flag (#2E6F7E) with a cream stripe (#F4EBDD) on a wooden pole in the left hand, leaning back',
  accentAt: 'the red umbrella (#B5453A)', accent: '#B5453A',
};
const ANTIQ_TEXT = {
  build: 'a slight man, stooped forward, shoulders rounded, narrower than an ordinary zombie of its size',
  garments: 'a tea-brown cardigan (#8B5A2B) over a cream shirt (#F4EBDD), dark grey trousers (#3E3A35), black shoes (#2A2A2A)',
  prop: 'a brass lamp (#C9A13B) with an amber glass (#FFD27A) hanging from the right hand on a short brass chain, the lamp at knee height',
  accentAt: 'the brass lamp (#C9A13B)', accent: '#C9A13B',
};
// Poses for the archetype bosses (bigger versions of a zombie type): explicit, not derived from the zombie's hit pose.
const BOSS_ARCH_POSE = {
  bloater: { idle: 'belly pushed out to boss size, arms held out to the sides and bent at the elbows, weight on the short legs', windup: 'belly pulled in and the body leaning back, arms raised, knees bent', attack: 'the body rocks forward onto the front foot with the arms swung out, the belly pushed forward at the hit moment', hurt: 'the belly sways, the body tilted back, arms flung out', dead: 'flat on its back, the belly up, seen from above' },
  spitter: { idle: 'hunched forward, the large throat sac under the chin (sea green #4FC48A), forearms held forward', windup: 'head pulled back, the throat sac swelled to full size', attack: 'head jerked forward at the hit moment, a small green blob of spit flying out in front (no gore)', hurt: 'head snapped back, the sac squashed flat', dead: 'collapsed flat, face to one side, the sac deflated' },
  kasap: { idle: 'slow wall stance, the cleaver held out in front at waist height', windup: 'the cleaver raised high over the right shoulder, the body twisted back', attack: 'the cleaver swung down and forward in a wide arc at the hit moment, the body leaning in', hurt: 'staggering back, the cleaver held low', dead: 'flat on the paving, the cleaver beside the body, seen from above' },
};
const BOSS_LABEL = { bloater: 'bloater boss', spitter: 'spitter boss', kasapBoss: 'butcher boss (kasapBoss)', taksici: 'taxi boss (taksici)', tourGuide: 'Docent (tourGuide, saray)', antiquarian: 'Antiquarian (halic)' };
const BOSS_SLUG = { kasapBoss: 'kasap', tourGuide: 'docent', taksici: 'taksici', antiquarian: 'antiquarian', bloater: 'bloater', spitter: 'spitter' };
function bossDesigns() {
  const seen = {}, order = [];
  Object.keys(CFG.bossByHood).forEach(hood => {
    const arch = CFG.bossByHood[hood], k = LOOK.bossCostumes['boss.' + hood] ? BOSS_COSTUME['boss.' + hood] : arch;
    const level = (P.Journey.hoods.findIndex(h => h.id === hood) + 1) * P.Journey.levelsPerHood;
    if (seen[k] === undefined) { seen[k] = { key: k, hood, level, hoods: [] }; order.push(k); }
    seen[k].hoods.push(hood);
  });
  return order.map(k => seen[k]).sort((a, b) => a.level - b.level);
}
function bossItems() {
  const items = [];
  bossDesigns().forEach((d, i) => {
    const isCostume = !!BOSS_COSTUME['boss.' + d.hood];
    const k = d.key;
    let subj, accent, accentAt, feature, lineup, baseFile, base, hexes, poses, walk, label, costumeText, outfitText, negExtra = '';
    if (isCostume) {
      const K = LOOK.bossCostumes['boss.' + d.hood];
      const outfit = NEW[COSTUME_OUTFIT[k]];
      need(outfit, 'no outfit for boss ' + k);
      label = BOSS_NAMES[k];
      accent = K.accent; accentAt = COSTUME_ACCENT_AT[k]; feature = K.feature;
      outfitText = garments(outfit); costumeText = COSTUME_PROP[k]; poses = COSTUME_POSE[k];
      base = 'brute'; baseFile = 'enm_brute_base.png (in art/commission/in/02-enemies/)'; lineup = d.hood;
      hexes = [accent, ...hexesIn(outfit), ...(k === 'bride' ? ['#D9708F'] : [])];
      walk = WALK_BOSS;
      negExtra = ' No real company logos, no transit livery, no caricature of any ethnic group, no religious dress or symbols, no gore.';
      subj = 'a huge broad brute body with the large shoulders of the brute type and a wide stance';
    } else if (BOSS_ARCH[k]) {
      const A2 = BOSS_ARCH[k];
      label = BOSS_LABEL[k];
      const T = A2.base ? LOOK.types[A2.base] : null;
      if (k === 'taksici') {
        accent = TAXI_TEXT.accent; accentAt = TAXI_TEXT.accentAt; feature = 'a yellow taxi with its driver: the car is the silhouette';
        outfitText = TAXI_TEXT.garments; costumeText = TAXI_TEXT.prop; poses = TAXI_TEXT.poses; walk = { walk1: TAXI_TEXT.walk1, walk2: TAXI_TEXT.walk2 };
        subj = TAXI_TEXT.build; lineup = 'eminonu'; base = null; baseFile = null; negExtra = ' No taxi company livery, no text, no roof-sign lettering, no numbers.';
      } else if (k === 'tourGuide') {
        accent = DOCENT_TEXT.accent; accentAt = DOCENT_TEXT.accentAt; feature = 'open red umbrella and a teal tour flag';
        outfitText = DOCENT_TEXT.garments; costumeText = DOCENT_TEXT.prop; poses = { idle: 'standing tall, the red umbrella open and resting on the right shoulder, the teal tour flag held in the left hand leaning back', windup: 'the umbrella pulled back over the right shoulder, the body coiled', attack: 'the umbrella swept forward in a wide arc at the hit moment, the flag swinging', hurt: 'the umbrella flung open and tilted, staggering back', dead: 'flat on the ground, the closed umbrella beside the body and the flag on the ground' };
        subj = DOCENT_TEXT.build; lineup = null; base = 'brute'; baseFile = 'enm_brute_base.png (in art/commission/in/02-enemies/)'; walk = WALK_BOSS;
        negExtra = ' No religious dress or symbols, no real palace text or emblems, no gore.';
      } else if (k === 'antiquarian') {
        accent = ANTIQ_TEXT.accent; accentAt = ANTIQ_TEXT.accentAt; feature = 'stooped bookseller with a swinging brass lamp on a chain';
        outfitText = ANTIQ_TEXT.garments; costumeText = ANTIQ_TEXT.prop; poses = { idle: 'stooped forward, the brass lamp hanging from the right hand on its chain at knee height', windup: 'the lamp swung back and up behind the head on its chain, the body bent back', attack: 'the lamp swung in a wide arc forward at the hit moment, the chain stretched taut', hurt: 'staggering back, the lamp swinging wildly', dead: 'flat on its side on the ground, the lamp lying nearby' };
        subj = ANTIQ_TEXT.build; lineup = null; base = 'kasap'; baseFile = 'enm_kasap_base.png (in art/commission/in/02-enemies/)'; walk = WALK_BOSS;
        negExtra = ' No real shop names, no lettering on the lamp or the books, no gore.';
      } else {
        const et = LOOK.types[A2.base], ee = E[A2.base];
        accent = et.accent; accentAt = ee.accentAt; feature = et.feature;
        outfitText = garments(NEW[A2.base]); costumeText = ee.prop || 'no props'; poses = BOSS_ARCH_POSE[A2.base];
        subj = ee.build + '; the same body as the zombie of this type, scaled up'; lineup = A2.base; base = A2.base; baseFile = 'enm_' + A2.base + '_base.png (in art/commission/in/02-enemies/)'; walk = { walk1: ee.walk1, walk2: ee.walk2 };
      }
      hexes = [accent, ...(A2.hexesExtra || []), ...hexesIn(NEW[A2.base] || {})];
      if (k === 'bloater' || k === 'spitter') negExtra = ' No gore, no fluid, no bursting.';
      if (k === 'kasapBoss') negExtra = ' No blood, no stains on the apron, no gore.';
    }
    const bg = bgFor(hexes), bgl = A.bgLine(bg);
    const fileName = 'boss_' + (BOSS_SLUG[k] || k.replace(/^boss\./, ''));
    const posesText = poses;
    const hoodsText = d.hoods.join(', ');
    const baseMsg = figureMsg({
      game: GAME + ' This is the boss "' + label + '", the big fight at the end of a district (' + hoodsText + '). This image is its single base design.',
      deliverable: 'Deliverable: one image, 1024 x 1024 pixels, square. One full-body boss, idle, centred, feet on the bottom centre, the figure about 80% of the picture height, an even margin all round, nothing touching the edge.',
      subject: 'Subject: ' + subj + '. ' + BOSS_SIZE + ' Head: ' + (isCostume ? 'the brute head, sunk into the shoulders' : k === 'taksici' ? 'the head of the driver above the open roof' : 'as the zombie of this type') + '. Clothing: ' + outfitText + '. Costume and props: ' + costumeText + '. Accent colour ' + col(accent) + ' on ' + accentAt + '. Silhouette feature, which must read as a solid black shape: ' + feature + '.',
      poses: 'Pose (idle): ' + posesText.idle + '.',
      facing: FACE_RIGHT,
      bg: bgl,
      negExtra: NEG_EXTRA + negExtra,
      consistency: base
        ? 'Consistency: the attached file ' + baseFile.split(' ')[0] + ' is the approved base of the zombie type this boss is built from: keep its body, outfit colours and proportions, only bigger and with the costume above. ' + (lineup ? 'Also attached: ref_current_enemy_lineup_2x.png, a rough reference: copy the silhouette feature and the colour accents of the figure named "' + lineup + '" from this reference sheet, but redraw it in the Ink & Tea style described; do not copy its rendering.' : '')
        : 'Consistency: no earlier image exists for this boss. Use the attached ref_current_enemy_lineup_2x.png only as a rough reference for the silhouette feature (figure named "' + lineup + '"), redraw it in the Ink & Tea style described, and do not copy its rendering.',
    });
    const refs = [];
    if (baseFile) refs.push(baseFile);
    refs.push(isCostume || lineup ? 'ref_current_enemy_lineup_2x.png (in art/commission/refs/): rough reference only.' : null);
    items.push({ id: 'boss-' + k.replace(/^boss\./, '') + '-base', file: fileName + '_base', size: '1024 x 1024 pixels, square', kind: 'boss: base design (Step A)', bg, order: i * 3 + 1,
      refs: refs.filter(Boolean), message: baseMsg,
      checks: [
        'One boss figure, idle, facing right, centred, feet on the bottom centre, about 80% of the picture height.',
        'Silhouette feature present and readable as a solid black shape: ' + feature + '.',
        'Accent ' + col(accent) + ' on ' + accentAt + '.',
        'Four-heads proportions with a larger body: not a taller, thinner adult.',
        'Bold near-black #14151F outline of one weight, flat two or three tone cel shading, no airbrush.',
        'Background is one flat ' + (bg === 'cyan' ? '#00FFFF cyan' : '#FF00FF magenta') + ': no gradient, no floor, no shadow.',
        'No text, logos, real brands, flags, religious dress or gore.',
      ],
      fails: [
        'Background gradient or shadow: "Make the background one perfectly flat ' + (bg === 'cyan' ? '#00FFFF cyan' : '#FF00FF magenta') + ' with no gradient and no ground shadow. Keep everything else identical."',
        'Feature missing or not the same: "Keep the ' + feature + ' and the accent ' + col(accent) + '. Keep everything else identical."',
        'Caricature or gore: "Remove the caricature: keep the boss comic and respectful, no gore, no blood. Keep the pose and outfit identical."',
      ],
      notes: [label + '. Used in: ' + hoodsText + ' (level ' + d.level + ' of the journey, first boss of this design). Scale: the game draws bosses about 2.2 times their zombie type; the picture is framed like every other figure, so the scale is applied in the game, not in the art.',
        isCostume ? 'Costume from config bossCostumes (boss.' + d.hood + ') and the outfit boss_' + COSTUME_OUTFIT[k].slice(5) + ' in art-enemy-look.js.' : 'Body from the zombie type "' + base + '" (config bosses.' + k + ').',
        k === 'tourGuide' ? 'DESIGN CHOICE: the Docent has no clothes or accent in config. The navy blazer and the red umbrella (from art-bosses.js) are proposals.' : '',
        k === 'antiquarian' ? 'DESIGN CHOICE: no clothes or accent in config; the bookseller look is proposed (art-characters.js sahaf).' : '',
        k === 'taksici' ? 'CONFIG GAP: taksici has no enemyLook entry (no accent, no feature). The yellow car #FFC93C is from art-enemies4.js taxiCar; the driver\'s clothes are proposed.' : '',
        'Save as ' + fileName + '_base.png in art/commission/in/03-bosses/. Sheets attach it.'].filter(Boolean).join(' ') });
    // Sheet 1: idle, walk1, walk2 in a row.
    const s1 = figureMsg({
      game: GAME + ' This sheet is the walk frames of the boss "' + label + '".',
      deliverable: 'Deliverable: one image, 1536 x 1024 pixels, landscape: three equal cells side by side in one row (512 x 1024 pixels each). Each boss centred in its cell, the feet (or wheels) on one baseline, about 60% of the cell height (the stance must fit the 512-pixel cell width), at least 40 pixels of empty background round it. Left to right: (1) idle, (2) walk1, (3) walk2. No labels, numbers, arrows or grid lines.',
      subject: 'Subject (identical in all three cells): ' + subj + '. ' + BOSS_SIZE + ' Clothing: ' + outfitText + '. Costume and props: ' + costumeText + '. Accent ' + col(accent) + ' on ' + accentAt + '. Silhouette feature: ' + feature + '.',
      poses: 'Poses: (1) idle: ' + posesText.idle + '. (2) walk1: ' + walk.walk1 + '. (3) walk2: ' + walk.walk2 + '.',
      legend: 'The walk frames are the two contact steps of one cycle: walk1 left foot forward, walk2 right foot forward, the same body height.',
      facing: FACE_RIGHT,
      bg: bgl + ' The flat background fills the whole sheet, including the gaps between the cells.',
      negExtra: NEG_EXTRA + negExtra,
      consistency: CONSISTENCY_SHEET(fileName + '_base.png') + (base ? ' The attached zombie base is the source of the body.' : ''),
    });
    items.push({ id: 'boss-' + k.replace(/^boss\./, '') + '-sheet1', file: fileName + '_sheet1', size: '1536 x 1024 pixels, landscape, three cells in a row', kind: 'boss: sheet 1, idle and walk', bg, order: i * 3 + 2,
      refs: [fileName + '_base.png (in art/commission/in/03-bosses/): the approved base design.'], message: s1,
      checks: [
        'Three cells in one row: idle, walk1, walk2, each the same boss at the same scale.',
        'Same outfit, costume and silhouette feature in all three cells as the attached base.',
        'walk1 and walk2 are the two contact steps of one cycle, the same body height.',
        'Feet (or wheels) on one baseline; nothing touches a cell edge.',
        'Flat ' + (bg === 'cyan' ? 'cyan #00FFFF' : 'magenta #FF00FF') + ' background with the gaps between cells; no labels.',
      ],
      fails: [
        'Costume or outfit changed between cells: "Match the attached ' + fileName + '_base.png exactly. Change only the pose."',
        'Cell touched by the figure: "Shrink the boss to sit inside its cell with a clear margin, all three at the same scale."',
        'A label or number in the image: "Remove every label and number. Keep everything else identical."',
      ],
      notes: '' });
    // Sheet 2: windup, attack, hurt, dead in a 2 x 2 grid.
    const s2 = figureMsg({
      game: GAME + ' This sheet is the attack and hit frames of the boss "' + label + '". The windup must read by itself, without any ground warning.',
      deliverable: 'Deliverable: one image, 1536 x 1024 pixels, landscape: a grid of 2 columns and 2 rows of four equal cells (768 x 512 pixels each). Each boss centred in its cell, feet (or wheels) on one baseline per row, about 70% of the cell height, at least 50 pixels of empty background round it. Top row, left to right: (1) windup, (2) attack. Bottom row, left to right: (3) hurt, (4) dead. No labels, numbers, arrows or grid lines.',
      subject: 'Subject (identical in every cell): ' + subj + '. ' + BOSS_SIZE + ' Clothing: ' + outfitText + '. Costume and props: ' + costumeText + '. Accent ' + col(accent) + ' on ' + accentAt + '. Silhouette feature: ' + feature + '.',
      poses: 'Poses: (1) windup: ' + posesText.windup + ', an anticipation pose that reads without any warning circle on the ground. (2) attack: ' + posesText.attack + ', the hit moment with the signature prop. (3) hurt: ' + posesText.hurt + '. (4) dead: ' + posesText.dead + ', seen straight from above (the one cell without the three-quarter camera).',
      facing: FACE_RIGHT + ' The dead cell is seen from above.',
      bg: bgl + ' The flat background fills the whole sheet, including the gaps between the cells.',
      negExtra: NEG_EXTRA + negExtra,
      consistency: CONSISTENCY_SHEET(fileName + '_base.png') + ' Also attached: ' + fileName + '_sheet1.png, for the walk frames.',
    });
    items.push({ id: 'boss-' + k.replace(/^boss\./, '') + '-sheet2', file: fileName + '_sheet2', size: '1536 x 1024 pixels, landscape, 2 x 2 grid', kind: 'boss: sheet 2, windup, attack, hurt, dead', bg, order: i * 3 + 3,
      refs: [fileName + '_base.png (in art/commission/in/03-bosses/): the approved base design.', fileName + '_sheet1.png (in art/commission/in/03-bosses/): the approved walk sheet.'], message: s2,
      checks: [
        'Four cells in a 2 x 2 grid: windup and attack on top, hurt and dead below.',
        'Windup reads on its own (the body coiled, the prop pulled back), without any ground warning.',
        'Attack shows the hit moment with the signature prop: ' + posesText.attack.split(',')[0] + '.',
        'Dead is flat and seen from above; hurt is a clear stagger.',
        'Same boss, same outfit and costume in every cell; same scale; nothing touching a cell edge.',
        'Flat ' + (bg === 'cyan' ? 'cyan #00FFFF' : 'magenta #FF00FF') + ' background, no gore, no labels.',
      ],
      fails: [
        'The windup looks like idle: "Make the windup clearly coiled: the prop pulled back and the weight on the back foot. Keep everything else identical."',
        'Gore or blood in the dead cell: "Remove any blood or injury marks from the dead cell. Keep everything else identical."',
        'Costume changed: "Match the attached ' + fileName + '_base.png exactly. Change only the pose."',
      ],
      notes: '' });
  });
  return items;
}

// ---------- build, emit, track ----------
const batches = {
  '00-style': styleItems(),
  '01-hero': heroItems(),
  '02-enemies': enemyItems(),
  '03-bosses': bossItems(),
};
Object.keys(batches).forEach(b => batches[b].forEach(it => { it.batch = b; }));
Object.keys(batches).forEach(b => A.emit(batches[b]));
const tracked = A.track();
const counts = Object.keys(batches).map(b => b + ': ' + batches[b].length);
console.log('characters: wrote ' + Object.values(batches).reduce((n, a) => n + a.length, 0) + ' prompt files (' + counts.join(', ') + ')');
console.log('TRACKER.csv rows merged: ' + tracked);
console.log('enemy order (first level in the journey): ' + ENEMY_ORDER.map(k => k + '@' + (k === 'walker' ? 1 : FIRST[k])).join(' '));
console.log('cyan key (magenta or pink figures): ' + Object.values(batches).flat().filter(it => it.bg === 'cyan').map(it => it.file).join(', '));
// ---------- ORDER file: counts, time, run order and the owner's decisions ----------
function writeOrder() {
  const DECISIONS = [
    'Hero collar and earbuds: the grey t-shirt collar and the earbuds round the neck follow the style bible and F3. docs/characters.md says a navy tee with one earbud in the ear. Pick one before the hero batch.',
    'Hero hands: F1 shows Arda holding a silver fork. Every other hero image has empty hands. Decide whether the fork belongs in the hero art.',
    'Walker accent: config gives one accent (office navy #1F4E79). Only the office outfit uses it; the student, shopper and tourist use their own colour as the accent.',
    'Crawler: its stone-grey coat (#8A8F98) is the paving colour, so it may read weak on the ground. Check it on the phone.',
    'Config conflicts (the prompts follow config): parkur bandana magenta-violet #C240B7 (the view draws orange); copci broom (the brief said a bin shield); zehirli accent #76E340 (the view draws the tank lime #D6E84A).',
    'No clothes in config: the Docent, the Antiquarian and the taxi driver. The prompts use proposals from the view code. taksici has no enemyLook entry at all.',
    'Marti is the gull only. The pigeon for the inland hoods is a later variant.',
    'Eyes: the prompts ask for pale glowing eyes (style bible). Config gives some types red or orange eyes (runner, brute, screamer).',
    'Proportions: the style bible asks for about three heads tall (a readable big head); the rig (art-characters.js) draws about 2.3 and design-system 1:4.5. The prompts ask for three.',
  ];
  const BOSS_LEVEL = {};
  bossDesigns().forEach(d => { BOSS_LEVEL['boss_' + (BOSS_SLUG[d.key] || d.key.replace(/^boss\./, ''))] = d.level; });
  const levelOf = it => {
    if (it.batch === '02-enemies') { const key = it.file.replace(/_(base|sheet)$/, '').replace(/^enm_/, '').split('_')[0]; return key === 'walker' ? 1 : FIRST[key]; }
    if (it.batch === '03-bosses') return BOSS_LEVEL[it.file.replace(/_(base|sheet1|sheet2)$/, '')];
    return null;
  };
  const per = Object.keys(batches).map(b => [b, batches[b].length]);
  const total = per.reduce((n, p) => n + p[1], 0);
  const early = ENEMY_ORDER.filter(k => (k === 'walker' ? 1 : FIRST[k]) <= 10).join(', ');
  const L = [];
  L.push('# Run order: characters (' + total + ' prompts)', '');
  L.push('Generated by prototype/tools/gen-art-prompts-characters.js. Paste one prompt per ChatGPT chat, in the order below. Save each chosen image to its "Save as" path and attach only the files that prompt names.', '');
  L.push('## Counts and time', '', '| Batch | Prompts |', '|---|---|');
  per.forEach(p => L.push('| ' + p[0] + ' | ' + p[1] + ' |'));
  L.push('| Total | ' + total + ' |', '');
  L.push('Time: about 3 minutes per image, so about ' + Math.round(total * 3 / 60) + ' hours for one clean pass (' + total * 3 + ' minutes). Budget extra time for the re-runs listed under "If it fails" in each file.', '');
  L.push('## Order', '');
  L.push('1. 00-style first: F3 is attached to every hero prompt. F1 and F2 check the look and the layout.');
  L.push('2. 01-hero next: the base first, then the sheets (they attach the base).');
  L.push('3. 02-enemies in order of first appearance in the levels: the types first seen by level 10 come first (' + early + '). Each design: base, then its pose sheet.');
  L.push('4. 03-bosses in level order: the Istiklal Vatman and the Galata guide come first. Each design: base, then sheet 1 (walk), then sheet 2 (attack and hit).', '');
  L.push('## Decisions the owner should make before the run', '');
  DECISIONS.forEach((t, i) => L.push((i + 1) + '. ' + t));
  L.push('', '## Run order, one line per prompt', '');
  per.forEach(p => {
    L.push('### ' + p[0], '');
    batches[p[0]].slice().sort((x, y) => x.order - y.order).forEach(it => {
      const lv = levelOf(it);
      L.push('- ' + it.order + '. `' + String(it.order).padStart(3, '0') + '_' + it.file + '.md` (save as `art/commission/in/' + it.batch + '/' + it.file + '.png`)' + (lv ? ', first appears at level ' + lv : '') + '; ' + it.kind);
    });
    L.push('');
  });
  fs.writeFileSync(path.join(A.OUT, 'ORDER-characters.md'), L.join('\n'));
}
writeOrder();
console.log('ORDER file: prompts/ORDER-characters.md');
module.exports = { batches, FIRST, ENEMY_ORDER, bossDesigns };
