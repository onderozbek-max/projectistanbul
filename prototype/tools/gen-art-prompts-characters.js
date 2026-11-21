'use strict';
// Character prompts for ChatGPT (Ink & Tea): 00-style (F1 to F3), 01-hero (Arda), 02-enemies (16 types, walker in four outfits),
// 03-bosses (11 designs). Numbers come from the game at run time: P.CFG (config-enemy-look.js, config-bosses.js, config-enemies*.js,
// config-levels.js and journey.js, loaded by lib-load.js like tools/bot.js does) and the outfit tables in js/view/, which are parsed
// as data and never run. Anything the view draws but config does not set is marked DESIGN CHOICE in the prompt's notes.
// Run: node prototype/tools/gen-art-prompts-characters.js   (writes art/commission/chatgpt/prompts/<batch>/ and TRACKER.csv)
const fs = require('fs');
const path = require('path');
const A = require('./lib-art-prompts.js');
const { GAME, CAM, FACE_RIGHT, FACE_VIEWER, FACE_AWAY, NEG_EXTRA, HERO_LEGEND, SHEET_3x2, CONSISTENCY_SHEET, SUB, join, figureMsg } =
  require('./lib-art-prompts-figure.js');
const { FIRST, ENEMY_ORDER, enemyItems, bossDesigns, bossFilename, bossItems } = require('./lib-art-prompts-enemies.js');

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
  bossDesigns().forEach(d => { BOSS_LEVEL[bossFilename(d.key)] = d.level; });
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
