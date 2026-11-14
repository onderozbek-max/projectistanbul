'use strict';
// World art prompts for the ChatGPT image project: ground tiles, props, facades, vehicles, weapons, pickups and effects.
// Names, sizes, colours and counts come from the game: journey.js (hood order and vehicles), config-levels.js (kit footprints),
// config-env.js (breakable HP), config-weapon-tiers.js (five levels per weapon and evolution), config-weapons*.js (evolutions),
// config.js and config-feel.js (pickups), config-enemy-look.js (scooter accent), view/consumables*.js (icon classes), the shape
// notes in view/weapon-sil*.js, and docs/hood-visual-briefs.md (props, materials, light, signage and contrast per hood).
// Usage: node prototype/tools/gen-art-prompts-world.js
// Writes one prompt file per image under art/commission/chatgpt/prompts/<batch>/ and merges the rows into art/commission/TRACKER.csv.
// Shared pieces (STYLE, NEGATIVE, bgLine, the file writer, the tracker) come from tools/lib-art-prompts.js.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const L = require('./lib-art-prompts.js');

const ROOT = L.ROOT, PALETTE = L.PALETTE, OUT = L.OUT;
const PROTO = path.join(ROOT, 'prototype');
const BRIEF_MD = path.join(ROOT, 'docs', 'hood-visual-briefs.md');
const LAST = 'Generate the image now. Do not ask me questions.';

// ---------- 1. the game's own data (same files, same order as tools/test-weapon-tiers.js; no DOM needed) ----------
const CONFIG_FILES = ['js/config.js', 'js/config-weapons.js', 'js/config-levels.js', 'js/config-layouts.js', 'js/config-enemies3.js',
  'js/config-bosses.js', 'js/config-enemies4.js', 'js/config-enemies5.js', 'js/config-skins.js', 'js/config-stats.js',
  'js/config-weapons2.js', 'js/config-weapons3.js', 'js/config-weapon-tiers.js', 'js/config-env.js', 'js/config-objectives.js',
  'js/config-modifiers.js', 'js/config-horde.js', 'js/config-fauna.js', 'js/config-enemy-look.js', 'js/config-feel.js', 'js/journey.js'];
CONFIG_FILES.forEach(f => vm.runInThisContext(fs.readFileSync(path.join(PROTO, f), 'utf8'), { filename: f }));
const GAME = globalThis.P;
const CFG = GAME.CFG;
const HOODS = GAME.Journey.hoods;
const TIERS = CFG.wtier;
const LEVEL_WORDS = ['L1', 'L2', 'L3', 'L4', 'L5'];

// ---------- 2. text helpers ----------
const TOKEN = {
  stone_grey: ['stone grey', PALETTE.stoneGrey], night_ink: ['night ink', PALETTE.ink], tram_red: ['tram red', PALETTE.tramRed],
  simit_gold: ['simit gold', PALETTE.simitGold], tea_amber: ['tea amber', PALETTE.teaAmber],
  bosphorus_blue: ['bosphorus blue', PALETTE.bosphorusBlue], paper: ['paper cream', PALETTE.paper],
};
// Brief text to plain colour names with hex: `tea_amber` becomes "tea amber #B5651D"; `#2E7D4F` becomes "#2E7D4F".
function colour(s) {
  return String(s).replace(/`([a-z_]+)`/g, (m, t) => (TOKEN[t] ? TOKEN[t][0] + ' ' + TOKEN[t][1] : t))
    .replace(/`(#[0-9A-Fa-f]{6})`/g, '$1').replace(/`/g, '').replace(/\s+/g, ' ').trim();
}
const hexes = s => (String(s).match(/#[0-9A-Fa-f]{6}/g) || []).map(h => h.toUpperCase());
const hexOfRgb = s => '#' + s.split(',').map(n => (+n).toString(16).padStart(2, '0')).join('').toUpperCase();
const sentences = s => String(s).split(/(?<=\.)\s+/).map(x => x.trim()).filter(Boolean);
// Splits a brief line such as "Ground: ... Walls: ... Accent: ..." into { Ground: '...', Walls: '...', Accent: '...' }.
function segments(text) {
  const out = {};
  String(text).split(/\.\s+(?=[A-Z][A-Za-z0-9 ()–-]{1,34}:\s)/).forEach(seg => {
    const m = /^([A-Za-z0-9 ()–-]{1,34}):\s*([\s\S]*)$/.exec(seg.trim());
    if (m) out[m[1].trim()] = m[2].replace(/\.$/, '').trim();
  });
  return out;
}
const segGet = (seg, re) => { const k = Object.keys(seg).find(x => re.test(x)); return k ? seg[k] : ''; };
// The static light of a hood. Flicker, flash, stage and sound notes are gameplay or audio, so they are dropped from the art.
const lightText = light => sentences(light).filter(s => !/flash|flicker|Hz|sound|stage|strobe|welder/i.test(s)).map(colour).join(' ');
const plain = s => String(s).replace(/`/g, '');
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const join = list => list.filter(Boolean).join(' ');

// ---------- 3. the hood briefs (docs/hood-visual-briefs.md), one object per hood code ----------
function parseBriefs() {
  const md = fs.readFileSync(BRIEF_MD, 'utf8');
  const out = {};
  md.split(/\n(?=## H\d\d · )/).slice(1).forEach(sec => {
    const code = /`([a-z]+)`/.exec(sec)[1];
    const grab = lbl => { const i = sec.indexOf('**' + lbl + '**'); return i < 0 ? '' : sec.slice(i + lbl.length + 4).split('\n')[0].trim(); };
    out[code] = {
      code, full: sec, props: grab('Props (ground and street level):'), materials: grab('Materials:'), signage: grab('Signage and text:'),
      light: grab('Light:'), contrast: grab('Contrast with neighbours:'), reads: grab('Reads as Istanbul because:'),
    };
  });
  return out;
}
const BRIEF = parseBriefs();

// Props line items: "name (tags)" separated by semicolons. Trailing sentences without brackets are ignored.
function parseProps(line) {
  const items = [];
  const re = /([^;()]+?)\s*\(([^()]*)\)/g;
  let m;
  while ((m = re.exec(line))) {
    const tags = m[2].toLowerCase();
    let name = m[1].trim();
    const stage = /^Stage \d[^:]*:\s*/i.exec(name);
    if (stage) name = name.slice(stage[0].length);
    items.push({ name, tags, stageOnly: !!stage || /stages? \d/.test(tags), kind: /fauna/.test(tags) ? 'fauna' : /dressing/.test(tags) ? 'dressing'
      : /gameplay/.test(tags) ? 'gameplay' : 'solid', breakable: /breakable/.test(tags), overhead: /overhead|overhang/.test(tags) });
  }
  return items;
}
// Brief props that are not art on a prop sheet: ground (drawn by the ground tiles), fauna (characters, not props), and banned flags.
const PROP_SKIP_GROUND = /tram rail|cycle-lane marking|pontoon planks|rope and bollard marks|water band/i;
const PROP_SKIP_FAUNA = /\bcats?\b|pigeon|\bbirds?\b|flock/i;
// Ordered: the first match wins, so specific names come before generic ones (for example "gull perches on the bollards" before "bollards").
const PROP_RULES = [
  [/simit cart/i, 'simitcart'], [/chestnut cart/i, 'chestnutcart'], [/umbrella/i, 'umbrellatable'], [/café chairs and tables/i, 'cafeset'],
  [/pavement tables?|café terrace tables|student café tables|café tables?/i, 'cafetable'], [/shopfront awning/i, 'awning'],
  [/gull perch/i, 'gullperch'], [/stone bench/i, 'stonebench'], [/benches|bench/i, 'bench'], [/tavla/i, 'tavlatable'],
  [/flower pots?/i, 'flowerpot'], [/planters?/i, 'planter'], [/balcony lanterns?/i, 'balconylantern'], [/bollards?/i, 'bollard'],
  [/pastry stall/i, 'pastrystall'], [/lower-deck stairs/i, 'stairbarrier'], [/safety barriers?/i, 'safetybarrier'],
  [/tram-stop barrier/i, 'tramstopbarrier'], [/queue stanchion/i, 'stanchion'], [/gangway/i, 'gangway'],
  [/paper lanterns?/i, 'paperlantern'], [/rod holders?/i, 'rodholder'], [/fishing lines?/i, 'fishingline'], [/tackle crates?/i, 'tacklecrate'],
  [/lantern strings?/i, 'lanternstring'], [/spice sack/i, 'spicesacks'], [/boat rails?/i, 'boatrail'], [/corn cart/i, 'corncart'],
  [/fish-ice cart/i, 'fishicecart'], [/fish(ing)? crates?|fish crates/i, 'fishcrate'], [/spice stall/i, 'spicestall'],
  [/handrails?|stair rails?/i, 'stairrail'], [/station clock/i, 'stationclock'], [/platform edge/i, 'platformedge'],
  [/turnstile|ticket gates?/i, 'turnstile'], [/ticket kiosks?/i, 'ticketkiosk'], [/luggage cart/i, 'luggagecart'], [/suitcases/i, 'suitcases'],
  [/kilims?/i, 'kilim'], [/brass lanterns?/i, 'brasslantern'], [/shutter terminal/i, 'shutterterminal'],
  [/jeweller counters?/i, 'jewellercounter'], [/rolled carpets?/i, 'rolledcarpets'], [/tea-tray cart/i, 'teacart'], [/tea glasses/i, 'teaglasses'],
  [/tea-garden tables?|tea tables?/i, 'teatable'], [/book crates?/i, 'bookcrate'], [/bookstall/i, 'bookstall'], [/palm/i, 'palmtree'],
  [/plane trees?/i, 'planetree'], [/trees?/i, 'tree'], [/crumb tins?/i, 'crumbtin'], [/meze tables?/i, 'mezetable'],
  [/quay rods|rods on the quay wall/i, 'quayrods'], [/fishing rods on the rocks/i, 'rockrods'], [/moored fishing boat/i, 'fishingboat'],
  [/moored boat/i, 'mooredboat'], [/audio-guide carts?/i, 'audioguidecart'], [/bunting/i, 'bunting'], [/souvenir stands?/i, 'souvenirstand'],
  [/guide's flag poles?/i, 'flagpole'], [/tour-group flags/i, 'SKIP_FLAGS'], [/laundry lines?/i, 'laundryline'],
  [/antique stands?/i, 'antiquestand'], [/handcarts?/i, 'handcart'], [/festoon lights?/i, 'festoon'], [/stopped escalators?/i, 'escalator'],
  [/excavation trench/i, 'trench'], [/hull display panels?/i, 'hullpanel'], [/picnic blankets?/i, 'picnicblanket'],
  [/g[öo]zleme cart/i, 'gozlemecart'], [/garden cart/i, 'gardencart'], [/ivy/i, 'ivy'], [/vault torch/i, 'vaulttorch'],
  [/rusted gates?/i, 'rustedgate'], [/wall-walk parapet/i, 'parapet'], [/garden keys?/i, 'gardenkey'], [/sprinkler heads?/i, 'sprinkler'],
  [/rail sleepers?/i, 'railsleeper'], [/barbecue stands?/i, 'barbecue'], [/dye drums?/i, 'dyedrum'], [/bale stacks?/i, 'balestack'],
  [/conveyor belt/i, 'conveyor'], [/fabric carts?/i, 'fabriccart'], [/delivery truck/i, 'truck'], [/tost kiosk/i, 'tostkiosk'],
  [/fishing piers?/i, 'fishingpier'], [/school bell post/i, 'bellpost'], [/playground fence/i, 'fence'], [/shopping trolleys?/i, 'trolley'],
  [/börek counter|borek counter/i, 'boreckcounter'], [/ice-cream cart/i, 'icecreamcart'], [/lifeguard tower/i, 'lifeguardtower'],
  [/rope-net stacks?/i, 'netstack'], [/gear crates?/i, 'gearcrate'], [/masts? and halyards|masts?/i, 'mast'], [/booth light/i, 'boothlight'],
  [/parked cars?/i, 'parkedcar'], [/bread crates?/i, 'breadcrate'], [/\bbins?\b/i, 'bin'], [/barrier/i, 'barrier'], [/ticket kiosk|kiosk/i, 'ticketkiosk'],
  [/cart/i, 'cart'], [/crates?/i, 'crates'], [/tables?/i, 'table'], [/shutter/i, 'shutterterminal'],
];
function propKey(name) {
  const hit = PROP_RULES.find(([re]) => re.test(name));
  if (!hit) throw new Error('no prop spec for brief item: "' + name + '"');
  return hit[1];
}

// ---------- 4. hood records: journey order, brief text, colours, props ----------
function stoneKind(g) {
  const t = g.toLowerCase();
  if (/cobble/.test(t)) return 'irregular cobblestones (setts), each about 0.20 m across, set in a tight interlocking pattern';
  if (/sett/.test(t)) return 'small rectangular setts, each about 0.20 m by 0.10 m, laid in a running bond';
  if (/flag/.test(t)) return 'large flagstones, each about 0.60 m square';
  if (/tile|courtyard/.test(t)) return 'square floor tiles, each about 0.30 m, with a fine grout line';
  if (/concrete/.test(t)) return 'poured concrete slabs, each about 1.20 m square, with fine hairline cracks';
  if (/gravel/.test(t)) return 'a gravel path of flat stones, each about 0.05 m to 0.10 m across';
  return 'paving slabs, each about 0.60 m square, in a stretcher bond';
}
const HOOD = HOODS.map((j, idx) => {
  const b = BRIEF[j.id];
  if (!b) throw new Error('no hood brief for ' + j.id);
  const seg = segments(b.materials);
  const accentSeg = segGet(seg, /^Accents?$/);
  const accentHex = hexes(accentSeg)[0] || hexes(b.materials)[0] || PALETTE.teaAmber;
  const accentName = accentSeg ? plain(accentSeg).replace(accentHex, '').replace(/^and\s+/, '').split(/\s+and\s+/)[0].trim() : 'accent';
  const walls = segGet(seg, /^Walls?$/);
  const props = parseProps(b.props);
  const keys = [];
  const skipped = [];
  props.forEach(p => {
    if (PROP_SKIP_GROUND.test(p.name) || PROP_SKIP_FAUNA.test(p.name) || p.kind === 'fauna') { skipped.push(p.name); return; }
    const key = propKey(p.name);
    if (key === 'SKIP_FLAGS') { skipped.push(p.name + ' (flags are banned by style bible section 8)'); return; }
    if (keys.some(k => k.key === key)) return;   // same prop twice in one hood: draw it once
    keys.push({ key, name: p.name, kind: p.kind, breakable: p.breakable, overhead: p.overhead, stageOnly: p.stageOnly, tags: p.tags });
  });
  return {
    id: j.id, name: j.name, district: j.district, idx: idx + 1, theme: j.theme, vehicles: j.vehicles || [], kit: j.kit || [],
    brief: b, seg, ground: segGet(seg, /^Ground/), walls, awnings: segGet(seg, /^Awnings?$/), roof: segGet(seg, /^(Sawtooth )?roofs?$/i),
    shutters: segGet(seg, /^Shutters?$/), accent: { hex: accentHex, name: accentName }, light: lightText(b.light), rain: /rain/i.test(b.light),
    contrast: colour(b.contrast), reads: colour(b.reads), signage: plain(b.signage), props: keys, skipped,
    groundFile: 'gnd_' + j.id + '_a.png',
  };
});

// ---------- 5. style, background and negative blocks ----------
// Ground tiles: the figure sentences are removed and the ink joints and flat tones kept (the brief's rule for tiles).
const GROUND_STYLE = [
  ['bold comic-book ink outlines in near-black #14151F with the same line weight on every character (the outline is about 3% of the figure height), ',
    'joints and cracks are drawn with the same near-black ink line (#14151F, the same ink as the characters), '],
  ['no soft gradients on figures, no textures on figures, ', 'no soft gradients anywhere, '],
  ['warm amber key light from the upper left, cool blue shadow (#1B4965 at low strength) on the lower right, ', 'no light direction and no shadow painted on the tile, '],
  ['stylised readable proportions with a big head (about three heads tall), slightly exaggerated hands and feet, a clean outer silhouette that stays readable when the figure is 50 pixels tall.',
    'flat, calm stone shapes with no focal feature.'],
].reduce((s, [from, to]) => { if (!s.includes(from)) throw new Error('STYLE changed, update GROUND_STYLE: ' + from.slice(0, 30)); return s.replace(from, to); }, L.STYLE);
// Facades: buildings instead of figures, the same ink colour and light.
const FACADE_STYLE = [
  ['bold comic-book ink outlines in near-black #14151F with the same line weight on every character (the outline is about 3% of the figure height), ',
    'bold ink outlines in near-black #14151F on roof edges, window frames and awnings with the same line weight as the characters, '],
  ['stylised readable proportions with a big head (about three heads tall), slightly exaggerated hands and feet, a clean outer silhouette that stays readable when the figure is 50 pixels tall.',
    'stylised, readable building shapes with a clean outer silhouette that stays readable at phone size.'],
  ['no soft gradients on figures, no textures on figures,', 'no soft gradients on buildings, no textures on buildings,'],
].reduce((s, [from, to]) => { if (!s.includes(from)) throw new Error('STYLE changed, update FACADE_STYLE'); return s.replace(from, to); }, L.STYLE);
// Props, vehicles, weapons and pickups use the same style paragraph, with the figure-only proportion sentence replaced by object shapes.
const OBJECT_STYLE = [
  ['with the same line weight on every character (the outline is about 3% of the figure height)', 'with the same line weight on every object and character (the outline is about 3% of the object height)'],
  ['no soft gradients on figures, no textures on figures,', 'no soft gradients on objects, no textures on objects,'],
  ['stylised readable proportions with a big head (about three heads tall), slightly exaggerated hands and feet, a clean outer silhouette that stays readable when the figure is 50 pixels tall.',
    'stylised readable object shapes, a clean outer silhouette that stays readable at phone size, the same look as the characters.'],
].reduce((t, [from, to]) => { if (!t.includes(from)) throw new Error('STYLE changed, update OBJECT_STYLE'); return t.replace(from, to); }, L.STYLE);
const GROUND_NEGATIVE = 'Do not include: any text, letters, numbers, logos, real brand names, flags, religious symbols, people, animals, gore, blood, ' +
  'photorealism, painterly brush texture, a watermark, a signature, a border or frame, a vignette, a lighting gradient, a cast shadow, a glow, ' +
  'or any object on the tile (no props, furniture, vehicles, litter, leaves or a single focal stone).';
const FACADE_NEGATIVE = 'Do not include: any text, letters, numbers, shop names, logos, real brand names, flags, religious symbols, people, cars, animals, ' +
  'gore, blood, photorealism, painterly brush texture, a watermark, a signature, a border or frame, a vignette, a glow or halo, ' +
  'or any background scenery (no sky, no mountains, no other city behind the building).';
const SEAM = 'Tileability check: the left edge must continue exactly into the right edge, and the top edge into the bottom edge, with no visible seam and no mirror image.';

// Common message builder: paragraphs joined by blank lines.
const msg = (...parts) => parts.filter(Boolean).join('\n\n');

// ---------- 6. ground tiles ----------
const MOTIF = {
  istiklal: 'a short section of tram rail (two parallel steel rails about 1.0 m apart and 1.0 m long, night ink with a pale top edge) crossing the tile horizontally and set flush into the paving',
  galata: 'a small group of three larger cobbles in a slightly darker stone tone, set together in a triangle',
  karakoy: 'a faint pale painted pedestrian dash line (paper cream at low strength, 0.1 m wide and 1.0 m long) crossing the paving at a right angle',
  bridge: 'a plank joint motif: a row of three rivet dots in a darker grey along each plank seam',
  eminonu: 'a worn fan of four cobbles, each a little smoother and lighter than its neighbours',
  sirkeci: 'a square inlay of 0.6 m slabs in a slightly different grey with a night ink border',
  kapalicarsi: 'a small diamond inlay in tea amber dust (tea amber at low strength) at the centre of each 2 m square of flags',
  beyazit: 'a small herringbone group of four setts in a slightly darker tone',
  saray: 'a cross-shaped inset of four flagstones with slightly wider night ink joints',
  halic: 'a single kerb step band: a row of larger setts in a lighter stone grey',
  yenikapi: 'a square tile inlay in a slightly different grey with a night ink grout border',
  samatya: 'an expansion joint: one night ink line across the paving every 2 m',
  yedikule: 'a patch of small gravel stones (flat, 0.05 m to 0.10 m, stone grey and paper cream at low strength)',
  kazlicesme: 'a 1.0 m wide band of stone grey path paving across the lawn tone',
  zeytinburnu: 'a single forked hairline crack pattern in night ink, about 0.8 m long',
  bakirkoy: 'a small square tile inlay with paper cream grout',
  bakirkoysahil: 'a small diamond-shaped paving inlay in a slightly lighter grey',
  atakoysahil: 'a pale mooring-line stripe (paper cream at low strength) every 3 m',
  atakoy: 'a courtyard tile inlay: a square of four tiles in a slightly different grey',
};
// Ground tiles that are not plain paving. Each one is one extra image, named gnd_<hood>_<what>.
const GROUND_EXTRA = [
  { hood: 'istiklal', what: 'rails', text: 'two parallel tram rails running straight from the top edge to the bottom edge of the tile through its centre, about 1.0 m apart centre to centre; each rail is a flat steel band about 0.07 m wide in night ink with a paler stone grey top edge; the paving between and around the rails is the same stone grey paving as variant A with night ink joints. The rails must run exactly vertically so the tile joins seamlessly top to bottom and the rails line up when the tile repeats.' },
  { hood: 'galata', what: 'stairs', text: 'steep cobbled stair treads seen from above: horizontal bands about 0.30 m deep, each band a row of cobbles in stone grey and a darker tone (#7A7F88) at the nosing, each nosing a night ink line about 0.02 m wide. The bands run left to right and repeat from top to bottom, so the tile joins seamlessly top to bottom.' },
  { hood: 'karakoy', what: 'wateredge', text: 'a quay edge: on the left 70 percent, stone grey paving slabs about 0.6 m square with night ink joints (as variant A); on the right 30 percent, the Bosphorus water at the quay edge in bosphorus blue #1B4965, flat, with three flat paler bands (#2C5F82) for ripples, and a night ink edge line between quay and water. EXCEPTION: the water band is darker than the grey range on purpose; the paving stays mid grey. Joins seamlessly top to bottom.' },
  { hood: 'bridge', what: 'deck', text: 'the deck walkway of a steel-and-iron bridge seen from above: stone grey deck with long plank-like seams in night ink running left to right, each deck plank about 0.30 m wide and 2.0 m long, with a row of rivet dots every 0.5 m in a darker grey (#7A7F88) on alternating planks. No railings, no lights, no water.' },
  { hood: 'samatya', what: 'seawall', text: 'promenade paving (stone grey slabs about 0.6 m square, night ink joints) on the left 75 percent; on the right 25 percent, the top of a sea wall: a band of flat coping stones about 0.5 m wide in a lighter stone grey (#9AA0A8) with a night ink line along its outer edge. No water, no sea, no people.' },
  { hood: 'yedikule', what: 'zindan', text: 'flagstones of a vaulted underground corridor floor: stone grey flags about 0.5 m square with night ink joints, and wet patches: irregular darker patches (#6E747D, still above the mid-value floor) with one flat lighter sheen stripe per patch (#A4AAB2). No openings, no holes, no grates in the floor.' },
  { hood: 'zeytinburnu', what: 'quay', text: 'a wet concrete quay: poured concrete slabs about 1.2 m square in stone grey with night ink hairline cracks, darker wet patches (#6E747D), and rope and bollard marks as pairs of pale curved lines (paper cream at low strength, flat) about 1.0 m apart. No water band, no sea, no piers.' },
  { hood: 'atakoysahil', what: 'pontoon', text: 'pontoon decks: weathered timber planks in tea amber lightened to #C48A52 (lightened on purpose so the plank colour stays above the mid-value floor), each plank about 0.15 m wide and 2.0 m long, with night ink gaps between planks. The planks run left to right and the joins line up from top to bottom. No cleats, no ropes, no boats.' },
  { hood: 'kazlicesme', what: 'lawn', text: 'a lawn: mid-value grass green #6A9462 (lightened from the brief\'s #3F6B3A on purpose so the lawn stays above the mid-value floor), flat, with a fine pattern of darker mowing stripes in #5E8457 running left to right. No paths, no trees, no sprinklers.' },
  { hood: 'halic', what: 'steps', text: 'kerb steps of an uneven, damp cobble street seen from above: stone grey cobbles, with a kerb step band about every 0.4 m running left to right, each step band a row of larger setts in a lighter stone grey (#9AA0A8) with night ink joints. The steps repeat from top to bottom so the tile joins seamlessly top to bottom.' },
  { hood: 'bakirkoysahil', what: 'cyclelane', text: 'promenade paving (stone grey slabs about 0.6 m square, night ink joints) with a cycle lane: a strip about 1.2 m wide running top to bottom in bosphorus blue #1B4965 at about 40 percent strength over the paving, with dashed edge lines in paper cream #F4EBDD. EXCEPTION: the lane tint is darker than the grey range on purpose; the paving stays mid grey.' },
];
function motifFor(h) {
  return h.rain ? 'irregular wet patches: slightly darker mid-value stone with one flat lighter sheen stripe per patch (flat shapes, no gradient), each patch no bigger than 1.5 m across' : (MOTIF[h.id] || 'a small square inlay in a slightly different grey');
}
function groundMessage(h, v) {
  const g = colour(h.ground);
  const base = `${stoneKind(h.ground)}. Colours: ${g}${/night ink/i.test(g) ? '' : ', with night ink #14151F joints and cracks'}. Scale: 1 m is 256 px, so the stone pattern repeats about every 2 m.`;
  const variant = {
    A: `Variant A, the base image of this hood: ${base} Every stone is one of three tones of its colour (base, a slightly darker shadow tone, a slightly lighter highlight tone). Nothing else is on the tile.`,
    B: `Variant B, the worn version. Paving: ${base} It is the same paving as the attached variant A (same stones, joints and colours), with wear added: small chips on some stone edges, hairline cracks, dust in some joints and a few faint stains, spread evenly. No single damaged spot.`,
    C: `Variant C, the motif version. Paving: ${base} It is the same paving as the attached variant A, with one small repeating motif: ${motifFor(h)}, repeated on a regular grid about every 2 m (about 512 px) so it reads as a pattern, not as one object.`,
    D: `Variant D, the calmest version. Paving: ${base} It is the same paving as the attached variant A, with fewer joints (stones about 1.5 times larger), the lowest contrast between stones, no wear and no motif.`,
  }[v];
  return msg(
    `Context: the floor tile of the ${h.name} street (${h.district}) in Project Istanbul, a portrait phone game where a student walks home through a zombie-filled Istanbul. The tile is drawn under the whole fight and repeated hundreds of times, so it must have no strong focal feature, no big stone, no bright spot and no dark hole.`,
    `Deliverable: one square image, 1024 x 1024 pixels, a full picture with no border and no vignette, straight top-down (90 degrees, not three-quarter, no horizon, no perspective). ${SEAM}`,
    `Subject: ${variant}`,
    `Light: none. The tile has no light direction and no shadow; the game adds the light. Not present: objects, people, animals, text and litter.`,
    `Style: ${GROUND_STYLE}`,
    GROUND_NEGATIVE,
    v === 'A' ? 'Consistency: this is the first image of this hood, so it sets the paving for the others.'
      : `Consistency: the attached file gnd_${h.id}_a.png is the approved variant A. Keep its stones, joints, colours and scale exactly; change only what the variant names.`,
    LAST);
}
function groundExtraMessage(h, x) {
  return msg(
    `Context: a special floor tile for the ${h.name} street (${h.district}) in Project Istanbul, a portrait phone game where a student walks home through a zombie-filled Istanbul. It is drawn under the whole fight and repeated across the arena, so it must stay calm.`,
    `Deliverable: one square image, 1024 x 1024 pixels, a full picture with no border, straight top-down (90 degrees, no perspective). ${SEAM}`,
    `Subject: ${x.text} The paving base of this tile is ${stoneKind(h.ground)}. Colours: ${colour(h.ground)}. Scale: 1 m is 256 px. Hex colours: stone grey #8A8F98, night ink #14151F for joints and cracks, and the named tones only. Floor rule: the paving stays between 45 and 75 percent HSL lightness.`,
    `Not present: people, animals, text, objects beyond the ones named above, shadows, lighting gradient.`,
    `Style: ${GROUND_STYLE}`,
    GROUND_NEGATIVE,
    `Consistency: the attached file ${h.groundFile} is the approved variant A of this hood. Its stone size, joint colour and tone must match, and only the named feature changes.`,
    LAST);
}

// ---------- 7. props: one 2 x 2 sheet per brief prop ----------
// size: [width across the screen, depth, height] in metres. kit: the config-levels kind whose footprint is used (size is then that footprint).
// body: the intact look (variant A). {A} is the hood accent hex. vary: what changes in B and C. broken: the cell 4 state for breakable props.
const PROP = {
  simitcart: { label: 'simit cart', size: [1.4, 0.9, 1.1], kit: 'cart', body: 'a wooden street cart on two wheels with tram red #D7263D painted wheel rims, a tea amber #B5651D wooden body, a glass display case on top holding stacked sesame simit rings (simit gold #E9A23B bread with paper cream #F4EBDD sesame dots), a steel push handle at one end and a small striped canopy stub over the case in tram red and simit gold stripes', vary: 'A, B and C differ only in the canopy stripe count (A two stripes, B three, C four) and the number of simit rings in the case', broken: 'the glass case shattered into flat pale shards, the wooden planks split and scattered, one wheel off its axle and lying on its side, a few simit rings on the ground, tea amber wood chips', cue: 'the stacked simit rings and the red wheels say Istanbul street food' },
  chestnutcart: { label: 'chestnut cart', size: [1.4, 0.9, 1.1], kit: 'cart', body: 'a round-topped street cart with a squat iron drum brazier in night ink #14151F holding roasting chestnuts (tea amber and night ink), a tea amber #B5651D wooden frame, a short stove chimney, and two flat paper cream #F4EBDD steam curls rising from the brazier (flat shapes, no glow)', vary: 'A, B and C differ in the number of chestnuts in the brazier and the colour of the cart trim (A tram red, B simit gold, C bosphorus blue #1B4965)', broken: 'the brazier knocked over, the drum dented and split, hot chestnuts scattered on the ground as small tea amber dots, the wooden frame in pieces, tea amber wood chips', cue: 'the brazier and steam curls say roasted chestnuts on an Istanbul street' },
  cafetable: { label: 'pavement cafe table with two chairs', size: [1.2, 1.2, 0.8], kit: 'tables', body: 'a round pavement cafe table with a paper cream #F4EBDD top and a night ink #14151F iron stem and base, with two folding chairs of tea amber #B5651D wood tucked at opposite sides, a small glass of tea on the table as a flat shape', vary: 'A, B and C differ in the table top colour (A paper cream, B tea amber, C bosphorus blue #1B4965) and in the chair seat colour', broken: 'the table top cracked in two, one chair broken into planks, the iron base bent, tea amber wood chips scattered', cue: 'the small round tables and tea glasses say an Istanbul pavement cafe' },
  bin: { label: 'street litter bin', size: [0.6, 0.6, 1.0], kit: 'bin', body: 'a steel litter bin, a simple cylinder in bosphorus blue #1B4965 with a night ink #14151F lid and a paper cream #F4EBDD band, a small slot in the lid, no lettering', vary: 'A, B and C differ in the band colour (A paper cream, B simit gold #E9A23B, C tram red #D7263D) and the lid angle', broken: 'the bin tipped on its side with a dented body, the lid off and lying beside it, a few flat paper scraps (plain, no print) and small steel chips', cue: 'a plain municipal bin is what a city street has' },
  bench: { label: 'park bench', size: [1.8, 0.6, 0.9], kit: 'bench', body: 'a park bench seen from three-quarter top-down: a tea amber #B5651D wooden seat with five slats, a night ink #14151F iron frame with curled arm ends, 1.8 m long, 0.6 m deep, 0.9 m high', vary: 'A, B and C differ in the slat colour (A tea amber, B darker tea amber, C bosphorus blue #1B4965 painted slats) and the arm-end curl', broken: 'the seat split, two slats snapped and lying at an angle, the iron frame bent at one end, tea amber wood chips scattered', cue: 'curled iron arms and wooden slats say a city park bench' },
  stonebench: { label: 'stone bench', size: [1.8, 0.6, 0.5], body: 'a long stone bench of stone grey #8A8F98 blocks with a paper cream #F4EBDD top edge and night ink #14151F joints, 1.8 m long, 0.6 m deep, 0.5 m high, with two blocks as legs', vary: 'A, B and C differ in the block count (A three, B four, C two) and the top-edge colour (A paper cream, B tea amber, C stone grey light)', broken: 'a cracked block with a piece missing, the top slab tilted, chips of stone grey scattered', cue: 'a long plain stone bench of a palace or museum forecourt' },
  awning: { label: 'shopfront awning (flat canopy seen from above)', size: [3.0, 1.2, 2.6], body: 'a flat fabric canopy seen from above, 3.0 m wide and 1.2 m deep, with a scalloped front edge and stripes in {AW}; the canopy is an overhang at 2.6 m height and is drawn flat with a night ink #14151F edge line', vary: 'A, B and C differ in the stripe count and the stripe order only', broken: 'SECOND ANGLE, not broken: the same canopy seen from the front edge, flat, same stripes', cue: 'striped canopies over the shopfronts are how an Istanbul high street looks', overheadNote: true },
  gullperch: { label: 'gull perch on a bollard', size: [0.4, 0.4, 0.8], body: 'a short iron bollard in night ink #14151F with a flat tea amber #B5651D perch rail across its top, the perch 0.4 m long', vary: 'A, B and C differ in the perch rail length and the top colour (A tea amber, B paper cream, C bosphorus blue)', broken: 'SECOND ANGLE: the same bollard seen from the other side', cue: 'the perch on a quay bollard says a harbour' },
  tavlatable: { label: 'tavla (backgammon) table', size: [0.9, 0.9, 0.8], body: 'a square wooden backgammon (tavla) table: a tea amber #B5651D top with a folded board inlay of triangles in alternating paper cream #F4EBDD and tea amber, a night ink #14151F edge, and a small simit gold #E9A23B brass clasp at one side; a single white and a single tram red die as flat shapes (no numbers)', vary: 'A, B and C differ in the triangle colours (A paper cream and tea amber, B paper cream and bosphorus blue, C paper cream and tram red) and the dice position', broken: 'the table top split in two along a board fold, the legs off, the dice scattered, tea amber wood chips', cue: 'a folded backgammon board with dice is a Galata teahouse table' },
  planter: { label: 'stone planter with shrubs', size: [1.2, 1.2, 0.9], kit: 'planter', body: 'a square stone planter of stone grey #8A8F98 blocks with night ink #14151F joints, 1.2 m square and 0.9 m high, full of rounded green shrubs (plane green #4F7A3A with a lighter leaf edge #6A9462) and a few tram red #D7263D flowers as flat dots', vary: 'A, B and C differ in the shrub shape and the flower colour (A tram red, B simit gold #E9A23B, C paper cream)', broken: 'the stone planter cracked open with two blocks missing, soil and shrub stems spilled as flat tea amber shapes, stone grey chips', cue: 'a stone planter full of shrubs says an Istanbul square' },
  flowerpot: { label: 'terracotta flower pot', size: [0.5, 0.5, 0.5], body: 'a round terracotta pot in tea amber #B5651D with a paper cream #F4EBDD rim band, filled with red geranium flowers (tram red #D7263D petals as flat shapes) and green leaves (#4F7A3A)', vary: 'A, B and C differ in the flower colour (A tram red, B simit gold #E9A23B, C paper cream)', broken: 'SECOND ANGLE: the same pot seen from the top, with a small crack line', cue: 'terracotta pots of geraniums hang on Istanbul balconies' },
  stairrail: { label: 'steel handrail section on two posts', size: [2.0, 0.1, 0.9], body: 'a steel handrail section 2.0 m long on two posts, the rail a night ink #14151F painted iron bar with a tea amber #B5651D wooden cap, the posts 0.9 m high', vary: 'A, B and C differ in the post style and the cap colour (A tea amber, B paper cream, C bosphorus blue)', broken: 'SECOND ANGLE: the same rail section seen from the other end', cue: 'the iron rail and wood cap say a steep Istanbul stair' },
  bollard: { label: 'iron bollard', size: [0.35, 0.35, 0.9], kit: 'bollard', body: 'a short round iron bollard in night ink #14151F steel with a paper cream #F4EBDD top band, 0.35 m across and 0.9 m high', vary: 'A, B and C differ in the top band colour (A paper cream, B simit gold #E9A23B, C tram red #D7263D)', broken: 'SECOND ANGLE: the same bollard seen from the top with a small rope loop on it', cue: 'a short iron bollard by the water is a quay' },
  balconylantern: { label: 'brass balcony lantern', size: [0.4, 0.4, 0.6], overheadNote: true, body: 'a small brass-framed lantern with a warm glass pane in simit gold #E9A23B (flat, no halo) and a night ink #14151F hanging bracket, seen from above as a small square lantern, 0.4 m across', vary: 'A, B and C differ in the glass panel colour (A simit gold, B tea amber, C paper cream)', broken: 'SECOND ANGLE: the same lantern seen from the side', cue: 'a brass lantern on a balcony bracket says an old Beyoğlu lane' },
  pastrystall: { label: 'pastry stall', size: [1.8, 1.6, 1.2], kit: 'lx_stall', body: 'a pastry stall: a paper cream #F4EBDD counter with a glass case on top holding golden pastry shapes (simit gold #E9A23B) and a small tea amber #B5651D tray, with a flat striped canopy stub in tram red #D7263D', vary: 'A, B and C differ in the canopy stripe colour and the pastry count', broken: 'SECOND ANGLE: the same stall from the other side', cue: 'a glass case of pastries is a quay café row' },
  stairbarrier: { label: 'stair barrier', size: [3.0, 0.6, 1.0], kit: 'barrier', body: 'a metal crowd barrier 3.0 m long: a night ink #14151F steel frame with paper cream #F4EBDD painted panels and tram red #D7263D feet', vary: 'A, B and C differ in the panel colour (A paper cream, B tea amber, C simit gold)', broken: 'SECOND ANGLE: the same barrier seen from the end', cue: 'a steel barrier at a stair head' },
  safetybarrier: { label: 'safety barrier', size: [3.0, 0.6, 1.0], kit: 'barrier', body: 'a steel road barrier 3.0 m long with a night ink #14151F frame and two simit gold #E9A23B painted panels and paper cream #F4EBDD stripes', vary: 'A, B and C differ in the stripe count', broken: 'SECOND ANGLE: the same barrier seen from the end', cue: 'a striped steel barrier at a station platform' },
  tramstopbarrier: { label: 'tram-stop barrier', size: [3.0, 0.6, 1.0], kit: 'barrier', body: 'a tram-stop barrier 3.0 m long: a night ink #14151F steel frame with a tram red #D7263D painted panel and paper cream #F4EBDD rails, no lettering', vary: 'A, B and C differ in the panel colour (A tram red, B paper cream, C bosphorus blue)', broken: 'SECOND ANGLE: the same barrier seen from the end', cue: 'a red tram-stop barrier' },
  stanchion: { label: 'queue stanchion', size: [0.3, 0.3, 1.0], body: 'a queue stanchion: a night ink #14151F steel post 1.0 m high with a simit gold #E9A23B brass top ball and a tram red #D7263D velvet-look belt strap, 0.3 m across at the base', vary: 'A, B and C differ in the strap colour (A tram red, B bosphorus blue, C paper cream)', broken: 'the post bent over at the base, the belt off, the brass ball rolling (drawn beside it)', cue: 'brass-topped queue posts at a palace ticket line', breakable: true },
  gangway: { label: 'ferry gangway', size: [1.2, 4.0, 0.3], body: 'a steel boarding gangway lying flat, 1.2 m wide and 4.0 m long and 0.3 m high at most, a night ink #14151F steel frame with tea amber #B5651D wooden deck boards', vary: 'A, B and C differ in the board pattern and the handrail colour (A night ink, B paper cream, C tram red)', broken: 'SECOND ANGLE: the same gangway seen from the end', cue: 'a wood-boarded gangway to a ferry' },
  paperlantern: { label: 'round paper lantern', size: [0.5, 0.5, 0.6], overheadNote: true, body: 'a round paper lantern in {A} (the hood accent) with a night ink #14151F top cap and bottom ring, flat, seen from above as a circle 0.5 m across, no glow', vary: 'A, B and C differ in the lantern colour (A accent, B paper cream, C simit gold)', broken: 'SECOND ANGLE: the same lantern seen from the side', cue: 'paper lanterns on café terraces' },
  rodholder: { label: 'rod holder set on a rail', size: [0.3, 0.3, 1.0], body: 'three slanted fishing rod holders in night ink #14151F iron on a rail, each holding a long thin rod (tea amber #B5651D, 1.5 m long)', vary: 'A, B and C differ in the rod count (A three, B four, C two)', broken: 'SECOND ANGLE: the same holder set seen from the other end', cue: 'fishing rods on a bridge rail' },
  fishingline: { label: 'taut fishing line (a thin cord across the deck)', size: [0.2, 3.0, 0.1], body: 'taut monofilament fishing lines, paper cream #F4EBDD thin lines about 0.02 m thick, three across a 3.0 m deck with a tram red #D7263D float bead on each', vary: 'A, B and C differ in the number of lines (A three, B two, C four)', broken: 'SECOND ANGLE: the lines cut and hanging in loose curves', cue: 'lines across a bridge deck say an angler crowd', gameplayLine: true },
  tacklecrate: { label: 'tackle crate stack', size: [1.0, 1.0, 0.7], kit: 'crates', body: 'a stack of two plastic tackle crates, one bosphorus blue #1B4965 and one tram red #D7263D, with night ink #14151F handles and vents', vary: 'A, B and C differ in the crate colours (A blue over red, B red over blue, C two blue)', broken: 'the top crate cracked and split, fishing tackle (flat shapes) spilled on the ground', cue: 'fishing crates on a bridge deck' },
  lanternstring: { label: 'string of lanterns', size: [6.0, 0.3, 2.4], overheadNote: true, body: 'a string of paper lanterns strung between two poles, 6.0 m long, the lanterns in simit gold #E9A23B with night ink #14151F caps, the poles off the walkable area and 2.4 m high', vary: 'A, B and C differ in the lantern count and colour (A simit gold, B tram red, C mixed)', broken: 'SECOND ANGLE: the same string seen from the side', cue: 'a string of lanterns is the Eminönü and Kumkapı evening' },
  spicesacks: { label: 'pyramid of spice sacks', size: [1.0, 1.0, 1.0], kit: 'crates', body: 'a pyramid of burlap sacks in paper cream #F4EBDD jute with tea amber #B5651D tie strings, the sacks stained at their tops with sumac red #A8322D and simit gold #E9A23B (flat stains), it must look solid', vary: 'A, B and C differ in the stain colour (A sumac red, B simit gold, C tea amber)', broken: 'the top sacks torn open with spice shown as flat sumac red and simit gold piles, the lower sacks split', cue: 'a pyramid of spice sacks is the Mısır Çarşısı arcade' },
  boatrail: { label: 'wooden boat rail on the quay', size: [2.0, 0.3, 0.6], body: 'a wooden rail on the quay for tying small boats: a tea amber #B5651D timber rail 2.0 m long with night ink #14151F iron rings and posts', vary: 'A, B and C differ in the ring count', broken: 'SECOND ANGLE: the same rail seen from the other end', cue: 'a boat rail on an Eminönü quay' },
  corncart: { label: 'corn cart', size: [1.4, 0.9, 1.2], kit: 'cart', body: 'a corn-on-the-cob cart: a round grill brazier in night ink #14151F on a tea amber #B5651D wooden cart, a stack of yellow corn cobs in simit gold #E9A23B, and a small striped canopy stub in tram red', vary: 'A, B and C differ in the cob count and the canopy stripe colour', broken: 'the cart split, the grill knocked over, cobs spilled as small simit gold shapes, wood chips', cue: 'corn cobs on a brazier are Eminönü street food' },
  fishcrate: { label: 'fish crate', size: [1.0, 1.0, 0.7], kit: 'crates', body: 'a plastic fish crate in bosphorus blue #1B4965 with night ink #14151F handles and vents, holding silver fish (stone grey #8A8F98 with paper highlights)', vary: 'A, B and C differ in the crate colour (A bosphorus blue, B tram red, C tea amber) and the fish count', broken: 'the crate split open, fish spilled as flat shapes, one corner broken', cue: 'a fish crate on a quay', ice: true },
  fishicecart: { label: 'fish-and-ice cart', size: [1.4, 0.9, 1.0], kit: 'cart', body: 'a cart with a shallow ice bed in paper cream #F4EBDD flakes, a few silver fish on the ice (stone grey #8A8F98), a tea amber #B5651D frame and night ink #14151F wheels', vary: 'A, B and C differ in the fish count and the frame colour', broken: 'the ice bed spilled as flat paper shapes, the frame split, fish scattered', cue: 'ice and fish on a cart at a fish quay' },
  spicestall: { label: 'spice stall', size: [1.8, 1.6, 1.2], kit: 'lx_stall', body: 'a spice stall: a counter with open sacks of spice in sumac red #A8322D, tea amber #B5651D and simit gold #E9A23B, a paper cream #F4EBDD canopy stub, and a night ink #14151F scale', vary: 'A, B and C differ in the sack colours', broken: 'SECOND ANGLE: the same stall from the other side', cue: 'open spice sacks and a scale' },
  stationclock: { label: 'wall clock (tick marks only)', size: [0.9, 0.2, 0.9], overheadNote: true, body: 'a round wall clock in a night ink #14151F iron frame with a paper cream #F4EBDD face, drawn with tick marks only (no numerals, no letters) and two night ink hands', vary: 'A, B and C differ in the frame colour (A night ink, B tea amber, C stone grey)', broken: 'SECOND ANGLE: the clock seen from the side', cue: 'a station clock with tick marks only' },
  platformedge: { label: 'platform edge strip with rails', size: [6.0, 0.6, 0.1], body: 'a platform edge strip 6.0 m long: a simit gold #E9A23B tactile strip with night ink #14151F dots, beside two steel rails in night ink', vary: 'A, B and C differ in the dot pattern', broken: 'SECOND ANGLE: the same strip seen from the other side', cue: 'a tactile edge strip and rails at a station' },
  turnstile: { label: 'turnstile gate', size: [1.0, 0.4, 1.1], body: 'a steel turnstile gate, waist-high at 1.1 m, a night ink #14151F frame with three paper cream #F4EBDD arms and a small tram red #D7263D sensor panel, no numbers, no letters', vary: 'A, B and C differ in the arm count (A three, B four, C two)', broken: 'SECOND ANGLE: the gate seen from the front', cue: 'a steel gate and sensor panel at a station', gameplayLine: true },
  ticketkiosk: { label: 'ticket kiosk (booth, flat roof)', size: [1.6, 1.6, 1.2], kit: 'kiosk', body: 'a small ticket booth with a counter window, a flat paper cream #F4EBDD roof 1.2 m high, tea amber #B5651D walls, a night ink #14151F counter and a tram red #D7263D awning stub with no lettering', vary: 'A, B and C differ in the wall colour (A tea amber, B paper cream, C bosphorus blue)', broken: 'the window shattered and the roof panel bent, pieces on the ground', cue: 'a ticket booth with a counter window', breakable: true },
  luggagecart: { label: 'luggage cart', size: [1.4, 0.9, 1.0], kit: 'cart', body: 'a flat steel luggage trolley with two stacked brown suitcases in tea amber #B5651D, a night ink #14151F frame and two small wheels', vary: 'A, B and C differ in the suitcase colour (A tea amber, B bosphorus blue, C paper cream)', broken: 'the trolley bent at one corner, suitcases burst open with flat contents shapes, wheels off', cue: 'a luggage trolley at a railway station' },
  suitcases: { label: 'three suitcases on the platform', size: [1.0, 0.6, 0.4], body: 'three suitcases lying on the ground: tea amber #B5651D, bosphorus blue #1B4965 and paper cream #F4EBDD, with night ink #14151F handles and clasps, no tags, no labels', vary: 'A, B and C differ in the stacking and the colours', broken: 'SECOND ANGLE: the same suitcases from the other side', cue: 'suitcases on a platform' },
  kilim: { label: 'hanging kilim rug', size: [1.2, 0.1, 1.8], overheadNote: true, body: 'a hanging kilim rug seen from above, flat, 1.2 m wide and 1.8 m long, in kilim red #8E2B2B with bands of turquoise #2A7F80 and simit gold #E9A23B, geometric motifs as flat shapes (no letters), hung at 2.4 m', vary: 'A, B and C differ in the band pattern and the centre colour', broken: 'SECOND ANGLE: the same kilim seen from the side, hanging', cue: 'hanging kilims of the Grand Bazaar' },
  brasslantern: { label: 'brass lantern on a chain', size: [0.5, 0.5, 0.5], overheadNote: true, body: 'a brass lantern with a warm amber glass in simit gold #E9A23B, a night ink #14151F chain link at the top, seen from above as a round shape 0.5 m across (flat, no glow)', vary: 'A, B and C differ in the glass colour (A simit gold, B tea amber, C paper cream)', broken: 'SECOND ANGLE: the same lantern from the side', cue: 'brass lanterns of the bazaar' },
  shutterterminal: { label: 'roll-down shutter panel with a terminal box', size: [2.0, 0.4, 2.2], overheadNote: true, body: 'a steel roll-down shutter panel in stone grey #8A8F98 with horizontal night ink #14151F slats, and a wall-mounted terminal box beside it in night ink with a tram red #D7263D status light. The panel is blank: no numbers, no letters, no painted marks', vary: 'A, B and C differ in the terminal box colour (A night ink, B bosphorus blue, C tea amber)', broken: 'SECOND ANGLE: the shutter seen from the side, closed', cue: 'a closed steel shutter with a terminal box', gameplayLine: true },
  jewellercounter: { label: "jeweller's counter", size: [1.8, 1.6, 1.2], kit: 'lx_stall', body: "a jeweller's glass counter: a tea amber #B5651D wooden base, a paper cream #F4EBDD top with a glass-look panel (flat, no reflection), a simit gold #E9A23B brass rim and small simit gold dots for jewellery", vary: 'A, B and C differ in the base colour (A tea amber, B night ink, C bosphorus blue)', broken: 'SECOND ANGLE: the same counter from the front', cue: 'a brass-rimmed jeweller counter in the bazaar' },
  rolledcarpets: { label: 'stack of rolled carpets', size: [1.2, 1.2, 0.6], body: 'three rolled carpets stacked on a tea amber #B5651D trestle: one kilim red #8E2B2B, one turquoise #2A7F80, one simit gold #E9A23B with flat geometric bands, no letters', vary: 'A, B and C differ in the carpet colours (A red and turquoise, B turquoise and gold, C red and gold)', broken: 'the top roll unrolled across the ground, the trestle snapped', cue: 'rolled carpets of the Grand Bazaar', breakable: true },
  teacart: { label: 'tea-tray cart', size: [1.4, 0.9, 1.0], kit: 'cart', body: 'a tea-tray cart: a round brass tray in simit gold #E9A23B holding six tulip tea glasses (paper cream #F4EBDD rims, tea amber #B5651D tea), on a tea amber #B5651D frame with night ink #14151F wheels', vary: 'A, B and C differ in the glass count and the frame colour', broken: 'the tray tipped, glasses smashed as flat shards, the frame split', cue: 'tulip tea glasses on a brass tray' },
  teaglasses: { label: 'set of tea glasses on a tin tray', size: [0.8, 0.4, 0.2], body: 'six small tulip tea glasses on a round tin tray: paper cream #F4EBDD rims, tea amber #B5651D tea, the tray in simit gold #E9A23B', vary: 'A, B and C differ in the glass count (A six, B four, C eight)', broken: 'SECOND ANGLE: the same set seen from the side', cue: 'tulip tea glasses on a tray' },
  teatable: { label: 'round tea table with glasses', size: [1.2, 1.2, 0.8], kit: 'tables', body: 'a round tea table with a tea amber #B5651D top, four tulip tea glasses (paper cream rims, tea amber tea) and a sugar tin in paper cream, the iron stem in night ink #14151F', vary: 'A, B and C differ in the top colour (A tea amber, B paper cream, C bosphorus blue)', broken: 'the top cracked, the glasses broken as flat shards, the stem bent', cue: 'a small tea table by the sea', breakable: true },
  bookcrate: { label: 'crate of old books', size: [1.0, 1.0, 0.7], kit: 'crates', body: 'a wooden crate in tea amber #B5651D full of old books: book spines in night ink #14151F and paper cream #F4EBDD page edges, a few spines in tram red #D7263D', vary: 'A, B and C differ in the spine colours', broken: 'the crate split, books spilled as flat rectangles with paper edges', cue: 'a crate of second-hand books in a book street' },
  bookstall: { label: 'second-hand book stall', size: [1.8, 1.6, 1.2], kit: 'lx_stall', body: 'a second-hand book stall: a tea amber #B5651D wooden table with book piles (night ink spines, paper cream page edges), and a canvas awning in plane green #4F7A3A on two posts', vary: 'A, B and C differ in the book pile height and the awning colour (A plane green, B tram red, C bosphorus blue)', broken: 'SECOND ANGLE: the same stall from the other side', cue: 'book piles under a green awning' },
  palmtree: { label: 'palm tree', size: [0.8, 0.8, 3.5], kit: 'tree', body: 'a palm tree seen from above: a round trunk 0.5 m across in tea amber #B5651D with night ink rings, and a fan of palm fronds in plane green #4F7A3A (about 3.5 m across, overhead, flat shapes)', vary: 'A, B and C differ in the frond count (A six, B eight, C five)', broken: 'SECOND ANGLE: the same palm seen from the side, showing the tall trunk', cue: 'palms along a seafront promenade', overheadNote: true },
  planetree: { label: 'plane tree', size: [0.8, 0.8, 3.0], kit: 'tree', body: 'a plane tree seen from above: a trunk 0.8 m across in tea amber #B5651D with bark dapples in night ink, and a round canopy about 5 m across in plane green #4F7A3A with lighter leaf-tips #6A9462 (flat shapes, the canopy overhead)', vary: 'A, B and C differ in the canopy shape and leaf-tip count', broken: 'SECOND ANGLE: the same tree from the side, showing the trunk', cue: 'plane trees around a square in Istanbul', overheadNote: true },
  tree: { label: 'tree (trunk and canopy)', size: [0.8, 0.8, 3.0], kit: 'tree', body: 'a leafy tree seen from above: a trunk 0.8 m across in tea amber #B5651D, and a round canopy about 4 m across in green #4F7A3A with lighter tips #6A9462 (flat shapes, overhead)', vary: 'A, B and C differ in the canopy shape', broken: 'SECOND ANGLE: the same tree from the side', cue: 'trees along a garden path', overheadNote: true },
  crumbtin: { label: 'tin of bird seed', size: [0.3, 0.3, 0.2], body: 'a small tin of bird seed in paper cream #F4EBDD with a night ink #14151F lid and a tea amber #B5651D label band with no lettering', vary: 'A, B and C differ in the band colour', broken: 'SECOND ANGLE: the tin tipped over with seed as flat tea amber dots', cue: 'a tin of seed for the pigeons' },
  mezetable: { label: 'meze table with small plates', size: [1.2, 1.2, 0.8], kit: 'tables', body: 'a table with a tram red #D7263D tablecloth and small meze plates in paper cream #F4EBDD, each plate with a small salad shape in plane green #4F7A3A and simit gold #E9A23B', vary: 'A, B and C differ in the plate count (A four, B six, C five) and the cloth colour (A tram red, B bosphorus blue, C paper cream)', broken: 'the table tipped, plates smashed as flat shards, the cloth torn', cue: 'meze plates on a fish-restaurant table', breakable: true },
  audioguidecart: { label: 'audio-guide cart', size: [1.4, 0.9, 1.0], kit: 'cart', body: 'a cart with stacked grey audio-guide handsets in stone grey #8A8F98 and paper cream #F4EBDD headphones, on a tea amber #B5651D frame with night ink #14151F wheels; no logos, no numbers', vary: 'A, B and C differ in the handset count (A six, B four, C eight)', broken: 'the cart split, handsets smashed as flat shards, headphone cords tangled as night ink lines', cue: 'a guide-handset cart at a palace ticket queue', breakable: true },
  cafeset: { label: 'café table with two mismatched chairs', size: [1.2, 1.2, 0.9], kit: 'tables', body: 'a round café table with a tea amber #B5651D top and two mismatched chairs (one tea amber wood, one bosphorus blue #1B4965 painted metal) with night ink #14151F iron legs, and a small tea glass on the table', vary: 'A, B and C differ in the chair pair (A wood and blue, B two wood, C two blue)', broken: 'the table top cracked in two, one chair broken into pieces, the iron legs bent, wood chips scattered', cue: 'mismatched chairs around a small table in a Balat café', breakable: true },
  souvenirstand: { label: 'souvenir stand', size: [1.8, 1.6, 1.2], kit: 'lx_stall', body: 'a small wooden souvenir stand with a canvas awning stub in tram red #D7263D on two posts, shelves of small cups, magnets and tea glasses (flat shapes, no lettering) in tea amber #B5651D and paper cream #F4EBDD', vary: 'A, B and C differ in the awning colour (A tram red, B simit gold #E9A23B, C bosphorus blue #1B4965)', broken: 'the awning torn, the shelves collapsed, cups smashed as flat shards, tea amber wood chips', cue: 'a souvenir stand of cups and magnets at a palace gate', breakable: true },
  quayrods: { label: 'fishing rods leaning on a wall rack', size: [2.0, 0.3, 1.6], body: 'a wall rack of fishing rods: a tea amber #B5651D timber rack 2.0 m long with night ink #14151F iron hooks, and six long thin rods (tea amber, 1.5 m) leaning in it', vary: 'A, B and C differ in the rod count (A six, B four, C eight)', broken: 'SECOND ANGLE: the same rack seen from the other end', cue: 'fishing rods on a quay wall' },
  rockrods: { label: 'fishing rods planted on rocks', size: [1.2, 1.2, 1.5], body: 'three fishing rods planted in a cluster of grey rocks (stone grey #8A8F98 with night ink #14151F outlines), the rods tea amber and night ink, 1.5 m long', vary: 'A, B and C differ in the rock shape and the rod count', broken: 'SECOND ANGLE: the same cluster from the other side', cue: 'rods on a sea wall' },
  fishingboat: { label: 'moored fishing boat', size: [2.0, 4.5, 1.0], kit: 'lx_boat', body: 'a small moored fishing boat seen from above: a tea amber #B5651D timber hull with bosphorus blue #1B4965 hull stripe, a paper cream #F4EBDD cabin roof, and a night ink #14151F mast stub', vary: 'A, B and C differ in the hull stripe colour (A bosphorus blue, B tram red, C paper cream)', broken: 'SECOND ANGLE: the same boat from the bow', cue: 'a fishing boat tied at a quay', gameplayLine: true },
  mooredboat: { label: 'moored yacht', size: [2.4, 8.0, 1.2], kit: 'lx_boat', body: 'a moored white yacht seen from above: a paper cream #F4EBDD hull with a bosphorus blue #1B4965 waterline stripe, a teal #3B9C9C canopy roof and simit gold #E9A23B brass fittings', vary: 'A, B and C differ in the canopy colour (A teal, B paper cream, C bosphorus blue)', broken: 'SECOND ANGLE: the same yacht from the bow', cue: 'a white yacht in a marina', gameplayLine: true },
  flagpole: { label: 'flag pole WITHOUT any flag', size: [0.2, 0.2, 2.4], overheadNote: true, body: 'a tall steel pole 2.4 m high with a simit gold #E9A23B finial and a tram red #D7263D painted band near the top. NO FLAG, NO CLOTH, NO PENNANT: the pole only', vary: 'A, B and C differ in the band height', broken: 'SECOND ANGLE: the same pole seen from the base', cue: 'a plain pole at a palace gate, the flag itself is added by the game' },
  bunting: { label: 'overhead rope line with paper tokens (no flags)', size: [6.0, 0.2, 2.5], overheadNote: true, body: 'a taut rope strung between two poles, 6.0 m long at 2.5 m height, with small plain paper tokens in paper cream #F4EBDD and tram red #D7263D: round discs only, no triangles, no flags, no cloth, no letters', vary: 'A, B and C differ in the token count', broken: 'SECOND ANGLE: the same rope seen from the side', cue: 'a string of small paper discs over a souvenir stand' },
  laundryline: { label: 'laundry line with white cloth', size: [4.0, 0.2, 2.4], overheadNote: true, body: 'a taut laundry line across a courtyard, 4.0 m long at 2.4 m height, with white and paper cream #F4EBDD sheets and towels, one towel bosphorus blue #1B4965, the posts off the walkable area', vary: 'A, B and C differ in the cloth count and the one towel colour', broken: 'SECOND ANGLE: the same line seen from the side', cue: 'white laundry between balconies' },
  antiquestand: { label: 'antique stand', size: [1.6, 1.2, 1.2], kit: 'antique', body: 'an antique stand: a wooden stand in tea amber #B5651D with brass lamps (simit gold #E9A23B), an old clock frame in night ink #14151F, and old plates (paper cream), under an ochre #E3B04B canvas awning stub', vary: 'A, B and C differ in the awning colour (A ochre, B tram red, C bosphorus blue) and the object mix', broken: 'the stand split, the lamps and plates smashed as flat shapes, the awning torn', cue: 'old lamps and clock frames in a Balat shop', breakable: true },
  handcart: { label: 'two-wheeled handcart with crates', size: [1.4, 0.9, 1.0], kit: 'cart', body: 'a two-wheeled handcart with a tea amber #B5651D plank bed, a night ink #14151F iron frame and two wheels, carrying a stack of two crates in paper cream and bosphorus blue', vary: 'A, B and C differ in the crate colours', broken: 'the bed split, one wheel off, the crates spilled', cue: 'a handcart on cobbles', breakable: true },
  festoon: { label: 'festoon bulb string', size: [5.0, 0.2, 2.4], overheadNote: true, body: 'a string of festoon bulbs 5.0 m long at 2.4 m height: simit gold #E9A23B glass bulbs with night ink #14151F sockets on a thin night ink cable (flat, no halo)', vary: 'A, B and C differ in the bulb count', broken: 'SECOND ANGLE: the same string seen from the side', cue: 'festoon bulbs over a café' },
  escalator: { label: 'stopped escalator', size: [1.0, 6.0, 1.0], body: 'a stopped escalator seen from above: a sloped steel step band 1.0 m wide and 6.0 m long, the steps as parallel night ink #14151F lines on stone grey #8A8F98, with paper cream #F4EBDD side panels and a yellow-gold handrail (simit gold)', vary: 'A, B and C differ in the step count', broken: 'SECOND ANGLE: the same escalator seen from the top landing', cue: 'a stopped escalator in an underground station' },
  trench: { label: 'excavation trench section', size: [3.0, 2.0, 0.1], body: 'a trench section of an excavation: earth walls in tea amber #B5651D with stone grey #8A8F98 strata lines, shored up with timber planks in tea amber, the floor of the trench in night ink #14151F. No bones, no objects, no artefacts', vary: 'A, B and C differ in the strata colour and the shoring pattern', broken: 'SECOND ANGLE: the trench seen from the end', cue: 'an excavation trench with timber shoring', gameplayLine: true },
  hullpanel: { label: 'display panel with a timber hull drawing', size: [1.2, 0.1, 1.6], body: 'a display panel 1.2 m wide and 1.6 m high in paper cream #F4EBDD with a timber hull section drawn in flat planks of hull timber #7A5230 and a night ink #14151F frame. No letters, no numbers', vary: 'A, B and C differ in the plank pattern', broken: 'SECOND ANGLE: the panel seen from the side', cue: 'a timber hull section on display' },
  picnicblanket: { label: 'picnic blanket on the ground', size: [2.0, 1.5, 0.02], body: 'a picnic blanket lying flat on the ground, 2.0 m by 1.5 m, in blanket red #A8322D with a checked pattern of paper cream #F4EBDD squares (flat), no shadow, no bulge', vary: 'A, B and C differ in the check size and the blanket colour (A blanket red, B bosphorus blue, C paper cream)', broken: 'SECOND ANGLE: the blanket folded in half', cue: 'a picnic blanket by the sea wall', gameplayLine: true },
  gozlemecart: { label: 'gözleme griddle cart', size: [1.4, 0.9, 1.1], kit: 'cart', body: 'a gözleme griddle cart: a round iron griddle in night ink #14151F on a tea amber #B5651D cart with a short tea amber awning stub, and two flat wraps (paper cream #F4EBDD) on the griddle', vary: 'A, B and C differ in the awning colour (A tea amber, B tram red, C paper cream)', broken: 'the griddle tipped, the cart frame split, the wraps spilled', cue: 'a griddle cart selling gözleme', breakable: true },
  gardencart: { label: 'garden cart (green)', size: [1.4, 0.9, 1.0], kit: 'cart', body: 'a green-painted garden cart in ivy green #2E5E4E with a tea amber #B5651D plank bed, a night ink #14151F wheel and a bundle of green cuttings', vary: 'A, B and C differ in the cuttings and the plank count', broken: 'the bed split, the cuttings spilled, the wheel off', cue: 'a garden cart by the old walls', breakable: true },
  ivy: { label: 'ivy patch on a stone wall', size: [1.5, 0.3, 1.5], body: 'a patch of ivy on a stone wall face: ivy green #2E5E4E leaves as flat shapes with night ink #14151F stems, on stone grey #8A8F98 blocks', vary: 'A, B and C differ in the leaf density', broken: 'SECOND ANGLE: the same patch from the side', cue: 'ivy on the old city walls' },
  vaulttorch: { label: 'wall torch bracket', size: [0.4, 0.4, 0.8], overheadNote: true, body: 'a wall torch bracket in night ink #14151F iron with a flame shape in simit gold #E9A23B and tea amber #B5651D (flat shapes, no glow, no halo)', vary: 'A, B and C differ in the flame shape', broken: 'SECOND ANGLE: the same bracket from the side', cue: 'torch brackets in a vaulted corridor' },
  rustedgate: { label: 'rusted iron gate', size: [2.0, 0.3, 1.2], body: 'a rusted iron gate across a corridor 2.0 m wide and 1.2 m high, in night ink #14151F iron with tea amber #B5651D rust flecks (flat), two posts', vary: 'A, B and C differ in the bar pattern', broken: 'the gate bent open at one hinge', cue: 'rusted gates of the old walls', breakable: false },
  parapet: { label: 'stone parapet with crenellations', size: [6.0, 0.6, 1.0], body: 'a stone parapet 6.0 m long and 1.0 m high with crenellations, stone grey #8A8F98 blocks with night ink #14151F joints and a paper cream #F4EBDD coping', vary: 'A, B and C differ in the merlon count', broken: 'SECOND ANGLE: the same parapet seen from the end', cue: 'crenellated city walls' },
  gardenkey: { label: 'large iron garden key (pickup)', size: [0.3, 0.15, 0.02], body: 'a large iron key with a simit gold #E9A23B bow and a night ink #14151F bit and shaft, a bright single key shape, not dressing', vary: 'A, B and C differ in the bow shape', broken: 'SECOND ANGLE: the key seen end-on', cue: 'a gate key you pick up', gameplayLine: true },
  sprinkler: { label: 'lawn sprinkler head', size: [0.3, 0.3, 0.3], body: 'a lawn sprinkler head in night ink #14151F with a flat fan of spray in pale water blue #7FB8C9 and small paper droplets', vary: 'A, B and C differ in the spray fan size', broken: 'SECOND ANGLE: the same head from the side', cue: 'a sprinkler on a coast lawn', gameplayLine: true },
  railsleeper: { label: 'row of rail sleepers', size: [2.6, 0.3, 0.15], body: 'a row of rail sleepers, five timber beams of tea amber #B5651D, 2.6 m long in total, with two steel rails in night ink #14151F and rail clips', vary: 'A, B and C differ in the sleeper count', broken: 'SECOND ANGLE: the same row seen from the end', cue: 'old rail sleepers beside a coast path' },
  barbecue: { label: 'barbecue stand', size: [1.0, 0.6, 1.0], body: 'a barbecue stand: a night ink #14151F iron grill on a tea amber #B5651D stand, with flat charcoal shapes (night ink) and small ember dots in tram red #D7263D, no glow', vary: 'A, B and C differ in the ember dot count', broken: 'SECOND ANGLE: the same stand from the side', cue: 'a barbecue stand by the coast path' },
  dyedrum: { label: 'dye drum (200 litre)', size: [0.9, 0.9, 1.0], body: 'a steel 200-litre dye drum with night ink #14151F rims and seams, painted in dye teal #2A7F80, dye magenta #A8327D or simit gold #E9A23B (the colour is the variant), 0.9 m across and 1.0 m high', vary: 'A is dye teal, B is dye magenta, C is simit gold', broken: 'the drum dented and split along a seam, dye spilled as flat colour shapes', cue: 'dye drums of a textile yard', breakable: false },
  balestack: { label: 'stack of cotton bales', size: [1.0, 1.0, 1.0], kit: 'crates', body: 'a stack of cotton bales: paper cream #F4EBDD bales wrapped in tea amber #B5651D straps, stacked three high (1.0 m), flat shapes', vary: 'A, B and C differ in the bale count and strap pattern', broken: 'the top bale split open, cotton fibres as flat paper cream shapes', cue: 'cotton bales in a textile yard', breakable: true },
  conveyor: { label: 'conveyor belt', size: [0.8, 5.0, 0.9], body: 'a conveyor belt seen from above: a paper cream #F4EBDD belt 0.8 m wide and 5.0 m long between night ink #14151F steel side frames, with small roller ticks', vary: 'A, B and C differ in the roller tick count', broken: 'SECOND ANGLE: the same belt from the end', cue: 'a conveyor belt in a factory yard', gameplayLine: true },
  fabriccart: { label: 'fabric cart with bolts', size: [1.4, 0.9, 1.1], kit: 'cart', body: 'a steel fabric cart with rolled fabric bolts in dye teal #2A7F80, dye magenta #A8327D and paper cream #F4EBDD, on night ink #14151F wheels', vary: 'A, B and C differ in the bolt colours', broken: 'the cart bent, the bolts spilled as flat shapes', cue: 'fabric bolts on a cart', breakable: true },
  truck: { label: 'delivery truck (box van)', size: [2.2, 5.0, 2.6], kit: 'lx_truck', body: 'a delivery box van seen from above: a paper cream #F4EBDD box body, a bosphorus blue #1B4965 cab, night ink #14151F windows and wheels, no logos, no names', vary: 'A, B and C differ in the cab colour (A bosphorus blue, B tea amber, C tram red)', broken: 'SECOND ANGLE: the van seen from the rear', cue: 'a box delivery van in a yard' },
  tostkiosk: { label: 'toast (tost) grill kiosk', size: [1.6, 1.6, 1.2], kit: 'kiosk', body: 'a sandwich grill kiosk: a small steel booth with a tram red #D7263D painted hood, a night ink #14151F grill plate and a paper cream #F4EBDD counter, 1.6 m square and 1.2 m high, no lettering', vary: 'A, B and C differ in the hood colour (A tram red, B bosphorus blue, C simit gold)', broken: 'the hood bent and the grill tipped, a few paper cream crumb shapes on the ground', cue: 'a toasted sandwich kiosk', breakable: true },
  fishingpier: { label: 'concrete fishing pier section', size: [6.0, 1.2, 0.9], body: 'a concrete fishing pier section 6.0 m long and 1.2 m wide: stone grey #8A8F98 concrete with night ink #14151F hairline cracks, two iron bollards and rope marks', vary: 'A, B and C differ in the crack pattern', broken: 'SECOND ANGLE: the pier seen from the end', cue: 'a concrete fishing pier on a shore' },
  bellpost: { label: 'school bell post', size: [0.5, 0.5, 1.2], body: 'a short iron post 1.2 m high in night ink #14151F with a brass school bell in simit gold #E9A23B on an iron bracket, the bell as a round shape', vary: 'A, B and C differ in the bracket angle', broken: 'SECOND ANGLE: the bell seen from the side', cue: 'a school bell on a post', gameplayLine: true },
  fence: { label: 'playground fence panel', size: [6.0, 0.1, 1.1], body: 'a playground fence panel 6.0 m long and 1.1 m high: green mesh in school door green #4F7A62 with night ink #14151F posts', vary: 'A, B and C differ in the mesh colour (A school green, B paper cream, C bosphorus blue)', broken: 'SECOND ANGLE: the same panel seen from the end', cue: 'a green fence of a school playground' },
  trolley: { label: 'shopping trolley', size: [0.7, 1.2, 1.0], kit: 'crates', body: 'a steel shopping trolley: a night ink #14151F wire frame with a stone grey #8A8F98 handle and four small wheels, 0.7 m wide and 1.2 m long', vary: 'A, B and C differ in the basket fill (A empty, B with two bags, C with one box)', broken: 'the trolley bent, a wheel off', cue: 'a shopping trolley in an arcade', breakable: true },
  boreckcounter: { label: 'closed börek counter', size: [1.8, 1.6, 1.2], kit: 'lx_stall', body: 'a closed börek counter: a stone grey #8A8F98 steel roller shutter (blank, no numbers, no letters) on a paper cream #F4EBDD base, with a tea amber #B5651D counter top', vary: 'A, B and C differ in the base colour (A paper cream, B tea amber, C bosphorus blue)', broken: 'the shutter dented and torn at the bottom', cue: 'a closed pastry counter with its shutter down', breakable: true },
  icecreamcart: { label: 'ice-cream cart with umbrella', size: [1.4, 0.9, 1.5], kit: 'cart', body: 'a bicycle-type ice-cream cart: a pastel pink #F2B8C6 cart body, a striped umbrella in paper cream #F4EBDD and tram red #D7263D stripes, a small brass bell in simit gold #E9A23B, and night ink #14151F wheels', vary: 'A, B and C differ in the umbrella stripe count', broken: 'the umbrella bent, the cart body cracked, the wheels off', cue: 'a pink ice-cream cart with a bell on the seafront', breakable: true },
  lifeguardtower: { label: 'lifeguard tower (no official mark)', size: [1.6, 1.6, 2.4], overheadNote: true, body: 'a lifeguard tower: a raised platform 1.6 m square at 2.4 m height on four legs, paper cream #F4EBDD walls, a night ink #14151F ladder and a flat roof. NO EMBLEM, NO CROSS, NO SIGN, NO LETTERS', vary: 'A, B and C differ in the roof colour (A bosphorus blue, B tram red, C paper cream)', broken: 'SECOND ANGLE: the tower from the side', cue: 'a plain white lifeguard tower' },
  netstack: { label: 'stack of rope nets', size: [1.6, 1.2, 0.9], body: 'a stack of folded rope nets on a wooden pallet: paper cream #F4EBDD netting with a tea amber #B5651D pallet, 1.6 m by 1.2 m by 0.9 m', vary: 'A, B and C differ in the net colour (A paper cream, B bosphorus blue, C tram red)', broken: 'SECOND ANGLE: the stack seen from the other side', cue: 'folded rope nets on a marina', gameplayLine: true },
  gearcrate: { label: 'boat gear crate', size: [1.0, 1.0, 0.7], kit: 'crates', body: 'a boat gear crate in tram red #D7263D with night ink #14151F corner plates and a paper cream #F4EBDD lid', vary: 'A, B and C differ in the crate colour (A tram red, B bosphorus blue, C tea amber)', broken: 'the crate split, a few flat rope coils beside it', cue: 'gear crates on a marina quay', breakable: true },
  umbrellatable: { label: 'café table with a striped umbrella', size: [2.0, 2.0, 2.2], kit: 'tables', overheadNote: true, body: 'a round café table with a paper cream #F4EBDD top and a night ink #14151F stem, under a striped umbrella: a flat disc 2.0 m across at 2.2 m height in paper cream and bosphorus blue #1B4965 stripes', vary: 'A, B and C differ in the stripe count', broken: 'SECOND ANGLE: the table and umbrella from the side', cue: 'café umbrellas on a marina quay', breakable: true },
  mast: { label: 'mast seen from above (off the walkable area)', size: [0.2, 0.2, 9.0], overheadNote: true, body: 'a mast seen from above as a small round dot 0.2 m across in night ink #14151F, with a single halyard as a thin line in paper cream #F4EBDD running off the edge. The mast is 9 m high and off the walkable area', vary: 'A, B and C differ in the halyard angle', broken: 'SECOND ANGLE: the mast seen from the side at its base', cue: 'masts in a marina' },
  boothlight: { label: "caretaker's booth window with a warm lamp", size: [1.6, 1.6, 1.2], body: "a caretaker's booth 1.6 m square and 1.2 m high: tea amber #B5651D walls, a small window with a flat simit gold #E9A23B lamp shape (no halo), a night ink #14151F door and a paper cream #F4EBDD sill", vary: 'A, B and C differ in the door colour', broken: 'SECOND ANGLE: the booth from the side', cue: 'a caretaker booth in a block lobby' },
  parkedcar: { label: 'parked hatchback (generic, no brand)', size: [1.9, 4.2, 1.5], kit: 'car', body: 'a generic parked hatchback seen from above: dusty teal #3B9C9C body, a bosphorus blue #1B4965 roof, night ink #14151F windows and wheels, no brand, no badge, no number plate text', vary: 'A, B and C differ in the body colour (A dusty teal, B paper cream, C tram red)', broken: 'the windows smashed (flat night ink shards), a door open', cue: 'a parked hatchback at the kerb', breakable: true },
  breadcrate: { label: 'crate of bread loaves', size: [1.0, 1.0, 0.7], kit: 'crates', body: 'a wooden crate in tea amber #B5651D full of round bread loaves with a golden crust in simit gold #E9A23B and paper cream #F4EBDD flour shading', vary: 'A, B and C differ in the loaf count', broken: 'the crate split, the loaves spilled as flat crust shapes', cue: 'bread crates at a bakery door', breakable: true },
  barrier: { label: 'barrier', size: [3.0, 0.6, 1.0], kit: 'barrier', body: 'a steel barrier 3.0 m long with a night ink #14151F frame and paper cream #F4EBDD panels', vary: 'A, B and C differ in the panel colour', broken: 'SECOND ANGLE: the barrier seen from the end', cue: 'a steel barrier' },
  cart: { label: 'street cart', size: [1.4, 0.9, 1.0], kit: 'cart', body: 'a wooden street cart on two wheels with a tea amber #B5651D body, tram red #D7263D trim and a night ink #14151F handle', vary: 'A, B and C differ in the trim colour', broken: 'the cart split, the wheels off', cue: 'a street cart', breakable: true },
  crates: { label: 'wooden crate stack', size: [1.0, 1.0, 0.7], kit: 'crates', body: 'a stack of wooden crates in tea amber #B5651D with night ink #14151F corner plates', vary: 'A, B and C differ in the stack height', broken: 'the top crate split, planks scattered', cue: 'crates on a street', breakable: true },
  table: { label: 'table', size: [1.2, 1.2, 0.8], kit: 'tables', body: 'a table with a tea amber #B5651D top and a night ink #14151F iron stem', vary: 'A, B and C differ in the top colour', broken: 'the top cracked in two, the stem bent', cue: 'a street table', breakable: true },
};
// Heights above 1.2 m must be overhangs (drawn above 2.4 m); the prop keeps its own note for the overhead ones.
function propSpec(key) {
  const s = PROP[key];
  if (!s) throw new Error('no PROP spec for key ' + key);
  return s;
}

function propMessage(h, item) {
  const s = propSpec(item.key);
  const kitSize = s.kit && CFG.levels.kinds[s.kit];
  const size = kitSize ? [kitSize[0], kitSize[1], s.size[2]] : s.size;
  const breakable = !!(item.breakable || s.breakable) && !s.gameplayLine;
  const cell4 = breakable ? 'BROKEN state (rubble): ' + s.broken : 'a second angle, the same prop turned 90 degrees (not broken)';
  const body = s.body.replace(/\{A\}/g, h.accent.hex).replace(/\{AW\}/g, h.awnings ? colour(h.awnings) : 'tram red and simit gold stripes');
  const hexList = hexes(body).filter((v, i, a) => a.indexOf(v) === i);
  const height = s.overheadNote
    ? 'It is an overhead item: drawn flat from above, with the part above the floor higher than 2.4 m.'
    : 'Height rule: the solid part is no taller than the 1.2 m hero in the walkable area.';
  const message = msg(
    `Context: one ${s.label} for the ${h.name} street (${h.district}) in Project Istanbul, a portrait phone game where a student walks home through a zombie-filled Istanbul. The prop stands on the street and must read clearly at phone size.`,
    `Deliverable: one square image, 1024 x 1024 pixels, four equal cells in a 2 x 2 grid (512 x 512 pixels each, no lines between them). Cell 1 (top left): the ${s.label}, intact, variant A. Cell 2 (top right): the same, intact, variant B. Cell 3 (bottom left): the same, intact, variant C. Cell 4 (bottom right): ${cell4}. Same scale and camera in all four; each object centred with at least 10 percent margin, nothing cut off.`,
    `Subject, variant A: ${body}. Size in metres: ${size[0]} m across, ${size[1]} m deep, ${size[2]} m high (a person beside it is 1.2 m tall). ${height} ${s.vary}.`,
    `Recognisably Istanbul without any text: ${s.cue}. Hex colours: ${hexList.join(', ')}.`,
    `Not present: any writing, numbers, letters, logos, real brand names or colours, flags, people, animals, a floor or ground patch under the object, a cast shadow, a glow or halo.`,
    `Camera: three-quarter top-down, about 55 degrees, the top and one long side visible. A flat shadow tone (bosphorus blue #1B4965, low strength) only on the lower-right faces of the object; no cast shadow on the background.`,
    `Style: ${OBJECT_STYLE}`,
    L.bgLine('magenta'),
    L.NEGATIVE,
    `Consistency: the attached file ${h.groundFile} is the approved ground of this hood. Use its stone and wood colours for the prop's materials, but do not copy its paving: the sheet's background stays flat magenta. Keep the same outline weight, shading and palette in all four cells.`,
    LAST);
  return {
    message,
    size: '1024 x 1024 (2 x 2 cells)',
    refs: [h.groundFile],
    notes: `Source: ${h.brief.code} Props line item "${item.name}" (${item.tags}); size ${size.join(' x ')} m${kitSize ? ' (config-levels kit footprint for ' + s.kit + ')' : ''}.`,
    checks: [
      'Four cells in a 2 x 2 grid, the same object at the same scale in all four (footprint ' + size[0] + ' m by ' + size[1] + ' m).',
      'Cells 1, 2 and 3 are intact and differ only in the named detail; cell 4 is ' + (breakable ? 'the broken rubble state' : 'a second angle') + '.',
      'Flat magenta #FF00FF background over the whole image, no grid lines, no labels, no numbers, no arrows, and no magenta inside any object.',
      'Three-quarter top-down camera, one flat shadow tone on the lower-right faces only, and no cast shadow on the background.',
      'Outline in near-black #14151F with the same weight as the characters, two or three flat tones per colour, no gradients.',
      'The named hex colours are visible: ' + hexList.slice(0, 4).join(', ') + '.',
      'Recognisably Istanbul without any text: ' + s.cue + '.',
      'No text, numbers, letters, logos, flags or real brands anywhere (signs and panels are blank).',
      s.overheadNote ? 'The part above the floor sits above 2.4 m and is drawn flat, as an overhead item.' : 'The solid part is no taller than the 1.2 m hero in the walkable area.',
    ],
    fails: [
      'Reply: "The four cells are not the same scale. Redraw all four at the footprint of cell 1, same scale. Keep everything else identical."',
      'Reply: "The background is not flat magenta, or there are grid lines or labels. Remove them, flat #FF00FF only. Keep everything else identical."',
      'Reply: "There is text or a number on the prop. Remove it and leave the panel blank. Keep everything else identical."',
    ],
  };
}

// ---------- 8. facades: one left-lit image and one night image per hood ----------
const FACADE_OVERRIDE = {
  bridge: 'the parapet of a two-deck iron bridge, seen from above at a steep angle: painted iron in night ink #14151F with a lattice panel every 2.0 m, a rail cap in paper cream #F4EBDD, rod holders on the upper rail and, on the lower deck, a row of simit gold #E9A23B lantern-lit awnings. There are no houses: the bridge has no building fronts.',
  kazlicesme: 'no buildings: the side edge of a seaside coast path, seen from above at a steep angle: a low planted edge of plane green #4F7A3A bushes, then a timber rail-sleeper kerb in tea amber #B5651D with night ink #14151F rail clips, and small sprinkler posts in night ink. No walls, no houses, the sea is the edge.',
  atakoysahil: 'the hull sides of moored boats along a marina quay, seen from above at a steep angle: paper cream #F4EBDD hull sides with a bosphorus blue #1B4965 waterline stripe, a teal #3B9C9C rubbing strip, brass fittings in simit gold #E9A23B, and the quay edge in stone grey #8A8F98 at the bottom. No houses.',
  samatya: 'the row of timber houses behind a sea-wall promenade, seen from above at a steep angle: tea amber #B5651D weatherboard timber walls (the brief proposes timber houses here), paper cream #F4EBDD window frames, night ink #14151F roof edges, and a tea amber awning over a gözleme cart on the street side.',
};
function facadeBody(h) {
  if (FACADE_OVERRIDE[h.id]) return FACADE_OVERRIDE[h.id];
  const t = h.brief.full.toLowerCase();
  const feats = [];
  if (/shopfront|shop front|café front|cafe front|shopfronts|café fronts|shop-window|shop window|storefront/.test(t)) feats.push('ground-floor shopfronts with large glass panes and a blank fascia board in the accent colour (no letters)');
  if (/arcade|arches/.test(t)) feats.push('a ground-floor arcade of round arches on paper cream piers with tea amber trim');
  if (/balcon/.test(t)) feats.push('timber balconies with tea amber railings on the upper floors');
  if (/shutter/.test(t)) feats.push('shutters on the windows in the shutter colour');
  if (/awning|canopy/.test(t)) feats.push('striped awnings over the shopfronts');
  if (/laundry/.test(t)) feats.push('laundry lines strung between the balconies (white cloth only)');
  if (/tile band|tile/.test(t)) feats.push('tile bands along the lower walls');
  if (/sawtooth/.test(t)) feats.push('sawtooth roofs in night ink');
  if (/painted|faded|terracotta|colourful|colorful/.test(t)) feats.push('each house in a different painted colour from the brief list');
  if (/vault/.test(t)) feats.push('a vaulted arcade of night ink arches with a bosphorus blue #1B4965 tint under the vault');
  const walls = h.walls ? colour(h.walls) : 'paper cream #F4EBDD render (the brief gives no wall colour; this is the default)';
  const awn = h.awnings ? colour(h.awnings) : '';
  const shut = h.shutters ? colour(h.shutters) : '';
  const acc = h.accent.hex;
  return `a continuous row of buildings along the street, three storeys of 3.2 m each over a 0.6 m stone grey #8A8F98 plinth. Walls: ${walls}. Roof edge at the top in night ink #14151F${h.roof ? ' (' + colour(h.roof) + ')' : ''}. Accent (shutters, doors and painted panels): ${acc}${h.accent.name ? ' ' + h.accent.name : ''}. ${shut ? 'Shutters: ' + shut + '. ' : ''}${awn ? 'Awnings: ' + awn + '. ' : ''}Features: ${feats.length ? feats.join('; ') : 'tall windows with paper cream frames'}.`;
}
function facadeMessage(h, night) {
  const body = facadeBody(h);
  const lightLine = night
    ? 'Light: night. Walls go into deep bosphorus blue #1B4965 and night ink #14151F shadow tones; windows and shopfronts glow as flat simit gold #E9A23B shapes (no bloom, no halo); one warm lamp per storey; awnings at about 60 percent of their day value.'
    : `Light: key light from the upper left in warm amber, cool bosphorus blue #1B4965 shadow on the right-hand faces. The brief's light note for this hood: ${h.light}`;
  const consistency = night
    ? `Consistency: the attached file fac_${h.id}_left.png is the approved left-lit version. Keep the same building, layout, windows, awnings and colours; only the light changes.`
    : `Consistency: the attached file ${h.groundFile} shows this street's paving and palette; match its colours, but the facade is a wall, not a floor.`;
  return msg(
    `Context: the building wall lining the ${night ? 'side' : 'left side'} of the ${h.name} street (${h.district}) in Project Istanbul, a portrait phone game where a student walks home through a zombie-filled Istanbul. It is the backdrop of the fight, so it must stay calm and never compete with the figures.`,
    `Deliverable: one portrait image, 1024 x 1536 pixels, a full picture with no border and no background outside the building. Scale: 8 m wide and 12 m high (1 m is 128 px). Roof edge at the top, ground contact at the bottom. The left and right edges join seamlessly, because the strip repeats along the street.`,
    `Subject: ${body}`,
    `Camera: three-quarter top-down, about 55 degrees above the ground, the same camera as the characters: the facade wall seen from the street side, roof edge at the top of the picture.`,
    lightLine,
    `Not present: no text on any sign (every fascia is a blank board), no numbers, people, cars, flags, religious symbols or gore.${!night && h.signage ? ' Shop names from the brief are not drawn; every fascia stays blank.' : ''}`,
    `Style: ${FACADE_STYLE}`,
    FACADE_NEGATIVE,
    consistency,
    LAST);
}

// ---------- 9. vehicles (13-vehicles) ----------
const SCOOTER_ACCENT = (CFG.enemyLook && CFG.enemyLook.types.kurye && CFG.enemyLook.types.kurye.accent) || '#E8782A';
const VEHICLE = [
  { file: 'veh_tram_red', name: 'vintage red-and-cream Istanbul tram', size: [2.8, 12.0, 3.0], refs: [], what: 'a generic vintage tram, seen from above at a three-quarter angle: a long rectangular roof in cream #F4EBDD with a night ink #14151F roof-edge line and a low roof pole, the lower body in tram red #D7263D with a cream #F4EBDD band along the middle, a row of night ink window bars. No livery, no route board, no numbers, no text, no crest, no company colours beyond these two.', use: 'the İstiklal and Karaköy tram, a hazard that sweeps across one lane of the street', note: 'config-levels tram hazard: w 2.8 m, len 12 m (config-feel gives 9 m for the rushing car; this follows the hazard)' },
  { file: 'veh_taksici_yellow', name: 'generic yellow taxi', size: [1.9, 4.2, 1.5], refs: ['veh_tram_red.png'], what: 'a generic yellow saloon taxi in taxi yellow #F2C230 with a night ink #14151F roof sign that is a blank box (no text, no chequer pattern, no brand), night ink windows and wheels. Generic, no brand, no number.', use: 'the Taksici boss and the taxi kit kind (config-levels kinds taxi)', note: 'the brief calls taxis generic yellow; #F2C230 is not in design-system section 3 (proposal)' },
  { file: 'veh_dolmus', name: 'minibus (dolmuş)', size: [2.2, 5.0, 2.2], refs: ['veh_tram_red.png'], what: 'a boxy minibus seen from above: a paper cream #F4EBDD body with a bosphorus blue #1B4965 side stripe, a blank roof sign, night ink #14151F windows and wheels, no route text, no brand.', use: 'the dolmuş vehicle of several hoods (config-levels kinds dolmus)', note: '' },
  { file: 'veh_car_parked', name: 'parked hatchback', size: [1.9, 4.2, 1.5], refs: ['veh_tram_red.png'], what: 'a generic parked hatchback in dusty teal #3B9C9C, roof bosphorus blue #1B4965, night ink #14151F windows and wheels, no brand, no badge, no number plate text.', use: 'parked cars at the kerb (config-levels kinds car, Ataköy kit)', note: '' },
  { file: 'veh_scooter_kurye', name: 'delivery scooter (kurye)', size: [0.8, 1.9, 1.2], refs: ['veh_tram_red.png'], what: `a small delivery scooter seen from above in the courier accent ${SCOOTER_ACCENT} with a paper cream #F4EBDD delivery box on the rear rack (blank, no logo), night ink #14151F wheels, handlebars and seat. No brand, no text.`, use: 'the kurye (scooter courier) enemy vehicle', note: `config-enemy-look kurye accent ${SCOOTER_ACCENT}; the character brief (art/commission/BRIEF.md) describes a blue scooter; pick one colour before this image is made.` },
  { file: 'veh_ferry', name: 'Bosphorus ferry (vapur)', size: [6.0, 24.0, 6.0], refs: ['veh_tram_red.png'], what: 'a Bosphorus ferry seen from above: a dark bosphorus blue #1B4965 lower hull, a paper cream #F4EBDD upper deck and wheelhouse, a row of small round night ink #14151F windows as dots, a tea amber #B5651D rail along the deck. No names, no flags, no numbers, no crest.', use: 'the ferry pier wait (journey.js vehicles: ferry)', note: 'no size in config: 6 m by 24 m is an estimate; the lead should check it against the pier art' },
  { file: 'veh_boat_fishing', name: 'small fishing boat', size: [1.8, 3.4, 1.2], refs: ['veh_tram_red.png'], what: 'a small wooden fishing boat seen from above: a tea amber #B5651D timber hull with a bosphorus blue #1B4965 stripe, a paper cream #F4EBDD cabin roof, a night ink #14151F mast stub and a coil of rope.', use: 'the fishing boat (config-levels kinds lx_boat, journey.js vehicles: boat)', note: 'lx_boat footprint [1.8, 3.4] from config-layouts.js' },
  { file: 'veh_boat_yacht', name: 'white yacht', size: [2.4, 8.0, 3.0], refs: ['veh_tram_red.png'], what: 'a white yacht seen from above: a paper cream #F4EBDD hull with a bosphorus blue #1B4965 waterline stripe, a teal #3B9C9C canopy and simit gold #E9A23B brass fittings, night ink #14151F deck lines. No names, no flags.', use: 'the marina yachts (Ataköy Marina, boss the Yacht Owner)', note: 'the yacht size is an estimate (no config size)' },
  { file: 'veh_truck_delivery', name: 'delivery box truck', size: [2.2, 5.0, 2.6], refs: ['veh_tram_red.png'], what: 'a delivery box truck seen from above: a paper cream #F4EBDD box body, a bosphorus blue #1B4965 cab, night ink #14151F windows and wheels. No logos, no names.', use: 'the Zeytinburnu delivery truck (config-layouts lx_truck, a bloater kit piece)', note: 'lx_truck footprint [2.2, 5.0] from config-layouts.js' },
];
function vehicleMessage(v, i) {
  const deliverable = v.file === 'veh_tram_red'
    ? 'Deliverable: one landscape image, 1536 x 1024 pixels, one vehicle centred, filling about 80 percent of the width. Flat magenta #FF00FF background.'
    : 'Deliverable: one square image, 1024 x 1024 pixels, one vehicle centred, filling about 80 percent of its length. Flat magenta #FF00FF background.';
  const size = `Size in metres: ${v.size[0]} m wide and ${v.size[1]} m long, ${v.size[2]} m high (the hero beside it is 1.2 m tall).`;
  const refs = v.refs.length ? `Consistency: the attached file ${v.refs[0]} is the approved tram, the same camera, outline weight, shading and palette; match it.` : 'Consistency: this is the first vehicle, so it sets the look for the others (same camera, outline weight and palette).';
  return msg(
    `Context: a ${v.name} in Project Istanbul, a portrait phone game in which a student walks home through a zombie-filled Istanbul. The vehicle is drawn on top of the street. In the game it is used as ${v.use}.`,
    deliverable,
    `Subject: ${v.what} ${size}`,
    `Not present: no text, no numbers, no letters, no logos, no real brands, no flags, no people, no zombies, no shadow on the ground, no glow, no smoke.`,
    `Camera: three-quarter top-down, about 55 degrees above the ground: the roof and one long side visible, the ground plane not foreshortened. A flat shadow tone only on the lower-right faces of the vehicle itself.`,
    `Style: ${OBJECT_STYLE}`,
    L.bgLine('magenta'),
    L.NEGATIVE,
    refs,
    LAST,
  );
}

// ---------- 10. weapons (20-weapons): icon, five-level tier sheet, and evolution pair ----------
// icon: what the inventory icon shows. noun: what the count means in plain words (the level count of these).
const WEAPON = {
  knife: { name: 'kitchen knife', icon: 'a kitchen knife: a long steel blade (steel #D6DEE8 with a paper-white edge light) and a tea amber #B5651D wooden handle with two rivets, blade pointing up and to the right', noun: 'stacked crescents' },
  nailgun: { name: 'nail gun', icon: 'a nail gun: a short bosphorus blue #1B4965 body with a steel nose and three steel nails (#C9D2DC) fanned out in front', noun: 'nails' },
  canister: { name: 'gas canister', icon: 'a gas canister: a squat cylinder in tram red #D7263D with a stone grey #8A8F98 cap and valve and one simit gold #E9A23B band', noun: 'bands' },
  chain: { name: 'chain blade', icon: 'a chain blade: four steel links (#B8C2CC) in a short chain ending in a flat steel blade', noun: 'links' },
  sledge: { name: 'sledgehammer', icon: 'a sledgehammer: a steel head (stone grey #8A8F98 with night ink #14151F edges) on a tea amber #B5651D wooden handle, the head at the top', noun: 'bands' },
  molotov: { name: 'petrol bottle with a rag wick', icon: 'a glass bottle with a rag wick: green glass (#7FDB9A with a paper-white highlight), the rag in paper cream #F4EBDD, one small flame on the neck in simit gold #E9A23B and tea amber #B5651D', noun: 'flame tongues' },
  fireworks: { name: 'firework rocket', icon: 'a firework rocket: a paper-wrapped tube in tram red #D7263D and bosphorus blue #1B4965 with a spiral fuse tail and one small simit gold #E9A23B spark', noun: 'spiral turns' },
  cable: { name: 'electric cable coil', icon: 'an electric cable coil: a short bundle of night ink #14151F cable with a pale electric core (#BEF8FF) and a bare white terminal', noun: 'zigzag runs' },
  speargun: { name: 'harpoon', icon: 'a harpoon: a steel spear head with two barbs (#E9D8A6 pale steel) on a thin line', noun: 'barbs' },
  extinguisher: { name: 'fire extinguisher', icon: 'a fire extinguisher: a tram red #D7263D cylinder with a steel valve and a short black hose', noun: 'foam blobs' },
  sawblade: { name: 'circular saw blade', icon: 'a circular saw blade: a steel disc (#C8D0DA) with teeth round the rim and a dark hub', noun: 'teeth' },
  manhole: { name: 'manhole cover', icon: 'a manhole cover: a round iron cover (#5B6470) with a ring of holes and a raised rim', noun: 'rim holes' },
  torch: { name: 'blowtorch', icon: 'a handheld blowtorch: a steel body with a tea amber #B5651D grip and a nozzle with three flat orange flame tongues (#FF7A1F)', noun: 'flame tongues' },
  olta: { name: 'fishing hook on a line', icon: 'a fishing hook on a line: a curved steel hook with barbs (#E9D8A6) on a thin cord, with a tram red #D7263D float', noun: 'barbs' },
  cardoor: { name: 'car door panel', icon: 'a car door panel in tram red #D7263D with a paper cream #F4EBDD window bar and a night ink #14151F handle', noun: 'window bars' },
  slingshot: { name: 'slingshot', icon: 'a slingshot: a tea amber #B5651D wooden Y-frame with a night ink #14151F elastic and one steel marble (#D0D6DE)', noun: 'marbles' },
  chainsaw: { name: 'chainsaw bar', icon: 'a chainsaw bar: a long steel bar (#C8D0DA) with a chain of teeth on one edge and a night ink #14151F body end with a tea amber #B5651D grip', noun: 'teeth' },
};
const EVO = {
  cleaver: { name: 'cleaver', icon: 'a meat cleaver: a broad steel blade (#E6F3FF with a bright highlight line) and a dark wooden handle' },
  nailstorm: { name: 'nail spray', icon: 'a fan of thin steel nails with pale green tips (#9CFF8A) spraying outward like a burst' },
  cluster: { name: 'pod cluster', icon: 'a bundle of five small round pods in tram red #FF5A4E and simit gold #FFB347 tied together' },
  cyclone: { name: 'whirling blade ring', icon: 'three curved steel blades arranged in a circle round a centre, pale blue-white (#BDF0FF)' },
  finale: { name: 'sky rain of firework streaks', icon: 'several vertical streaks in simit gold and pink (#FF6AD5) falling onto one point' },
  forge: { name: 'forge jet', icon: 'two nested flame jets, orange (#FF9A3D) outside and white inside, from a steel nozzle' },
  grinder: { name: 'grinding wheel', icon: 'a round grinder disc in amber (#FFB347) with spokes and a steel hub' },
  hookpull: { name: 'set hook hauling strands', icon: 'a curved hook in teal steel (#7FD8C8) with strands trailing behind it' },
  minibus: { name: 'bus door', icon: 'a wide folding door in tram red (#E74C3C) with rib lines and a steel handle' },
  blacksmith: { name: 'anvil hammer', icon: 'a black iron anvil with a hammer head on top and an orange edge glow in flat shapes (#FF6A2A)' },
  stormshield: { name: 'shield orbit', icon: 'three curved shields in pale ice blue (#7FE7FF with a white rim) orbiting one centre, linked by electric zigzags' },
  foamstorm: { name: 'foam wall', icon: 'a wide wall of foam blobs (#E8F7FF) in two rows on an arc' },
  netspear: { name: 'spear with a net', icon: 'a spear (#F0E6C8) with a net of crossing strands at the tip' },
  lake: { name: 'fire lake', icon: 'a pool of orange flame ripples (#FF5A1F) on the ground, drawn as concentric ripple lines' },
  twinsaw: { name: 'twin saw discs', icon: 'two steel saw discs (#9FC4E8) side by side with teeth' },
  fireball: { name: 'fire orb', icon: 'a big round fire ball (#FF4D1A) with flame tongues and a white-hot centre' },
  arcchain: { name: 'arc links', icon: 'a glowing violet link (#B39DFF) and a jagged electric arc (#7FE7FF) from it' },
  carbomb: { name: 'car box', icon: 'a box-shaped car body seen from above in red (#FF3B30) with two window bars and tumbling debris bits' },
};
// The shape note of a silhouette, cleaned of code names, from the comment block in view/weapon-sil*.js.
function silNotes() {
  const map = {};
  ['js/view/weapon-sil.js', 'js/view/weapon-sil-evo.js'].forEach(f => {
    const lines = fs.readFileSync(path.join(PROTO, f), 'utf8').split('\n');
    lines.forEach((ln, i) => {
      const m = /^\s*\/\/ ([a-zA-Z]+) \(/.exec(ln);
      if (!m) return;
      let text = ln.replace(/^\s*\/\/ [a-zA-Z]+ /, '');
      for (let j = i + 1; j < lines.length; j++) {
        const nx = /^\s*\/\/(.*)$/.exec(lines[j]);
        if (!nx || /^\s*\/\/ [a-zA-Z]+ \(/.test(lines[j])) break;
        text += ' ' + nx[1].trim();
      }
      map[m[1]] = text;
    });
  });
  return map;
}
const SIL = silNotes();
function silText(sil) {
  let t = SIL[sil];
  if (!t) throw new Error('no shape note for silhouette ' + sil);
  t = t.replace(/^\([^)]*\):?\s*/, '').replace(/\bE\.[a-zA-Z]+\b/g, 'the hero').replace(/\bL\.count\b/g, 'the number of').replace(/\bL\.[a-zA-Z]+\b/g, 'the level')
    .replace(/\s*\((trail|after|ring|count|edge|glow|scale|live|src|sim|pass)[^)]*\)/g, '')
    .replace(/\s+/g, ' ').replace(/ ,/g, ',').replace(/\.\s*\./g, '.').trim();
  const parts = t.split(/(?<=\.)\s+/).filter(Boolean);
  let out = '';
  for (const p of parts) { if ((out + ' ' + p).length > 480) break; out = (out ? out + ' ' : '') + p; }
  if (out && !/[.!?]$/.test(out)) out += '.';
  out = out.replace(/(\.\s+)([a-z])/g, (m, a, b) => a + b.toUpperCase());
  return out;
}
// The tier table in plain words: the numbers of config-weapon-tiers.js, grouped where they stay equal.
function stepWords(arr, fmt) {
  const groups = [];
  arr.forEach((v, i) => {
    const last = groups[groups.length - 1];
    if (last && last.v === v) last.to = LEVEL_WORDS[i]; else groups.push({ v, from: LEVEL_WORDS[i], to: LEVEL_WORDS[i] });
  });
  return groups.map(g => (g.from === g.to ? fmt(g.v) + ' at ' + g.from : fmt(g.v) + ' at ' + g.from + ' to ' + g.to)).join(', ');
}
function tierWords(row, noun) {
  const ringAt = row.ring.findIndex(v => v > 0);
  const ringTxt = ringAt < 0 ? 'no shock ring at any level' : 'a shock ring appears at ' + LEVEL_WORDS[ringAt] + (row.ring[4] > 1 ? ', and at L5 there are ' + row.ring[4] + ' rings' : '');
  return [
    `Size (the base shape scaled): ${row.scale.map((s, i) => LEVEL_WORDS[i] + ' ' + Math.round(s * 100) + ' percent').join(', ')}.`,
    `Number of ${noun}: ${stepWords(row.count, n => String(n))}.`,
    `Glow radius around the shape: ${row.glow.map((g, i) => LEVEL_WORDS[i] + ' ' + g.toFixed(2) + ' m').join(', ')}.`,
    `Trail behind the shape (share of the shape length): ${row.trail.map((t, i) => LEVEL_WORDS[i] + ' ' + Math.round(t * 100) + ' percent').join(', ')}.`,
    `Afterimage copies: ${stepWords(row.after, n => String(n))}.`,
    `Shock ring: ${ringTxt}.`,
  ].join(' ');
}
// The config ramp uses #FFD166 as its mid tone, which the style bible reserves for healing: the art uses simit gold #E9A23B there.
function rampWords(row) {
  const r = row.ramp.map(c => (c.toUpperCase() === '#FFD166' ? PALETTE.simitGold : c.toUpperCase()));
  const mid = row.ramp[1].toUpperCase() === '#FFD166' ? 'simit gold ' + PALETTE.simitGold + ' (the warm mid tone)' : r[1] + ' (the mid tone)';
  return `Colour ramp: L1 ${r[0]} (the weapon's own start colour), L3 ${mid}, L5 ${r[2]} (the top, white-hot or the weapon's own end colour); the levels in between are blends of these three.`;
}
const WEAPON_ORDER = CFG.arsenal.weapons.slice();
const EVO_IDS = Object.keys(CFG.evolutions);
const EVO_BASE = Object.fromEntries(EVO_IDS.map(e => [e, CFG.evolutions[e].from]));
const FIRST_FIVE = ['knife', 'nailgun', 'canister', 'chain', 'sledge'];

// Weapon sheets draw a glow and a trail, so the background line says which glow is allowed: only the weapon's own, in its own colours.
const WEAPON_BG = "Background: one perfectly flat, uniform magenta (#FF00FF) colour over the whole image, with no gradient, no noise, no vignette and no lighting on it; nothing of that colour inside the weapon. The only glow allowed is the weapon's own, drawn as a flat, hard-edged band in the colours named above; no soft halo on the background.";
function weaponIconMessage(id, i) {
  const w = WEAPON[id];
  const row = TIERS.weapons[id];
  const refs = i === 0 ? [] : ['wpn_knife_icon.png'];
  return {
    message: msg(
      `Context: this is the inventory icon of the ${w.name} weapon in Project Istanbul, a portrait phone game in which a student walks home through a zombie-filled Istanbul; the icon sits in the weapon slot of the HUD and is read at 256 pixels.`,
      `Deliverable: one square image, 1024 x 1024 pixels, one object centred and filling about 80 percent of the canvas, flat magenta background. The game scales it down to 256 pixels.`,
      `Subject: ${w.icon}. It is the weapon itself, drawn as an inventory icon, with no hand, no arm and no character. The icon is not to scale: it shows the object's shape and colours only. The icon does not show impact sparks.`,
      `Not present: no hand, no arm, no person, no text, no numbers, no letters, no logos, no real brands, no second object, no shadow on the background, no glow, no sparks.`,
      `Camera: three-quarter view of the object from above, the object's own shading only; a flat shadow tone on the lower-right faces of the object.`,
      `Style: ${OBJECT_STYLE}`,
      L.bgLine('magenta'),
      L.NEGATIVE,
      refs.length ? `Consistency: the attached file wpn_knife_icon.png is the approved icon style: same outline weight, same light and same shading. Match it.` : 'Consistency: this is the first icon, so it sets the style for the others (outline, light, shading).',
      LAST,
    ),
    refs,
    notes: `Source: config-weapon-tiers.js weapons.${id} (cls ${row.cls}), arsenal weapon ${id}.`,
    checks: [
      'Square 1024 by 1024, one object centred and filling about 80 percent, still readable at 256 pixels.',
      'Bold near-black #14151F outline, two or three flat tones per colour, no gradient, no airbrush.',
      'No hand, no arm, no person: the weapon floats alone.',
      'Flat magenta #FF00FF background over the whole image; no magenta inside the object.',
      'No text, numbers, letters, logos or real brands.',
      'The named colours are the ones in the description, and none of the reserved colours (#3DDCFF, #FF4D2E, #FFD166) appear.',
      refs.length ? 'Same outline weight, light and shading as the attached wpn_knife_icon.png.' : 'It sets a style the other icons can match: outline weight, light and shading.',
    ],
    fails: [
      'Reply: "There is a hand or an arm holding the weapon. Remove them: the weapon floats alone. Keep everything else identical."',
      'Reply: "The object is not centred or fills too little of the canvas. Centre it and fill about 80 percent. Keep everything else identical."',
    ],
  };
}
function weaponTierMessage(id) {
  const w = WEAPON[id];
  const row = TIERS.weapons[id];
  return {
    message: msg(
      `Context: this is the in-world sprite of the ${w.name} weapon in Project Istanbul, a portrait phone game in which a student walks home through a zombie-filled Istanbul. The game draws this shape on the arena at five levels (L1 to L5), and each level shows the player that the weapon is growing stronger.`,
      `Deliverable: one landscape image, 1536 x 1024 pixels, a 3 x 2 grid of six equal cells (each 512 x 512 pixels, no lines between them). Top row, left to right: L1, L2, L3. Bottom row, left to right: L4, L5, and an EMPTY sixth cell (flat magenta only). Every level is the same object at the same camera. Nothing touches a cell edge.`,
      `Subject, the object: ${silText(row.sil)} It is the weapon itself, drawn as a projectile or a swing, with no hand, no arm and no character. Scale: the L1 shape is the base size; the tier numbers below scale it. The glow and trail numbers are metres at arena scale, so draw them in proportion to the L1 shape.`,
      `Tier table (the game's numbers, do not change them): ${tierWords(row, w.noun)}`,
      rampWords(row),
      `Each level must be visibly stronger than the one before: bigger, with more ${w.noun}, a wider glow and a longer trail. L5 is the strongest and the most elaborate. Do not change the silhouette between levels, only its size, count, glow, trail and colour. Impact sparks are not drawn in these cells; they are a separate effect sheet.`,
      `Camera: three-quarter top-down, about 55 degrees, the same camera as the characters. Outline in near-black #14151F on the solid parts. The glow and the trail are flat, hard-edged translucent bands in the weapon's own colours, not airbrushed.`,
      `Style: ${OBJECT_STYLE}`,
      WEAPON_BG,
      L.NEGATIVE,
      `Not present: no hand, no arm, no person, no text, no numbers, no letters, no logos, no impact sparks, no reserved colours (no #3DDCFF cyan, no #FF4D2E orange-red, no #FFD166 gold-yellow used as decoration).`,
      `Consistency: the attached file wpn_${id}_icon.png is the approved icon of this weapon. The in-world shape must read as the same object: same material colours, same outline weight.`,
      LAST,
    ),
    refs: [`wpn_${id}_icon.png`],
    notes: `Source: config-weapon-tiers.js weapons.${id} (sil ${row.sil}, cls ${row.cls}, live ${row.live}, life ${row.life} s). Save the sheet as wpn_${id}_tiers.png and crop cell 5 to wpn_${id}_t5.png for the evolution prompt.`,
    checks: [
      '1536 by 1024 landscape, a 3 by 2 grid: L1 L2 L3 on top, L4 L5 and an empty magenta cell at the bottom right.',
      'Each cell is strictly bigger and brighter than the one before, following the tier numbers (L1 to L5).',
      'L5 is the largest with the strongest glow, and the shock ring appears where the tier table says.',
      'The same object at every level: same silhouette, same material, only size, count, glow, trail and colour change.',
      'Flat magenta #FF00FF background, no magenta inside the shape, no grid lines, no labels, no numbers.',
      'No hand or arm; no text or logos anywhere; no impact sparks.',
      'Colour ramp from the start colour to white-hot, with the simit gold #E9A23B mid tone; no #FFD166 and no #3DDCFF.',
      'Matches the attached wpn_' + id + '_icon.png material colours.',
    ],
    fails: [
      'Reply: "Levels do not grow in order. Make L2 bigger than L1, L3 bigger than L2, and so on, as the numbers say. Keep the silhouette identical."',
      'Reply: "There is a hand or an arm in one of the cells. Remove it, keep everything else identical."',
      'Reply: "The empty sixth cell has something in it. Make it flat magenta only. Keep everything else identical."',
    ],
  };
}
function weaponEvoMessage(evo) {
  const base = EVO_BASE[evo];
  const row = TIERS.evos[evo];
  const e = EVO[evo];
  const bw = WEAPON[base];
  return {
    message: msg(
      `Context: this is the evolved form of the ${bw.name} (base weapon) called the ${e.name} in Project Istanbul, a portrait phone game in which a student walks home through a zombie-filled Istanbul. Evolving the weapon replaces the base weapon in its slot, so the player must see that the evolution is a different and bigger object.`,
      `Deliverable: one landscape image, 1536 x 1024 pixels, two equal cells side by side (each 768 x 1024 pixels, no lines between them). Left cell: the evolution's inventory icon, centred, square 512 pixels, the same icon style as the attached wpn_${base}_icon.png. Right cell: the in-world sprite of the evolution at its top level (L5), centred, the largest shape in this sheet. Flat magenta background over the whole image.`,
      `Subject, the evolution: ${e.icon}. The in-world shape: ${silText(row.sil)} It is a different object from the base weapon, bigger, with its own silhouette; it is not a recolour of the base. No hand, no arm, no character.`,
      `Tier table of the evolution (L1 to L5; the right cell shows the L5 look): ${tierWords(row, 'elements')} ${rampWords(row)}`,
      `Camera: three-quarter top-down for the sprite, about 55 degrees; a straight icon view for the left cell. Outline in near-black #14151F on the solid parts. The glow is a flat, hard-edged band in the evolution's own colours.`,
      `Style: ${OBJECT_STYLE}`,
      WEAPON_BG,
      L.NEGATIVE,
      `Not present: no hand, no arm, no person, no text, no numbers, no letters, no logos, no impact sparks, no reserved colours (no #3DDCFF, no #FF4D2E, no #FFD166 as decoration).`,
      `Consistency: the attached file wpn_${base}_icon.png is the approved base icon, and the attached file wpn_${base}_t5.png is the approved base weapon at its top level (L5). The evolution must match their outline weight and shading and must be clearly the bigger, different object.`,
      LAST,
    ),
    refs: [`wpn_${base}_icon.png`, `wpn_${base}_t5.png`],
    notes: `Source: config.js evolutions.${evo} (from ${base}${CFG.evolutions[evo].passive ? ', passive ' + CFG.evolutions[evo].passive : ', no passive: unlock ' + CFG.evolutions[evo].unlock}); config-weapon-tiers.js evos.${evo} (sil ${row.sil}, cls ${row.cls}).`,
    checks: [
      '1536 by 1024, two cells side by side: the icon on the left, the in-world L5 sprite on the right.',
      'The evolution is clearly a different and bigger object than the attached base L5 (wpn_' + base + '_t5.png), not a recolour of it.',
      'The icon matches the attached base icon in outline weight, light and shading.',
      'Flat magenta #FF00FF background; no magenta inside the objects; no grid lines or labels.',
      'No hand, no arm, no text, no numbers, no logos, no impact sparks.',
      'Colour ramp from the start colour to white-hot with the simit gold mid tone; no #FFD166 and no #3DDCFF.',
    ],
    fails: [
      'Reply: "The evolution looks like the base weapon, only recoloured. Redraw the in-world sprite as the bigger, different form in the subject (' + e.name + '). Keep the icon identical."',
      'Reply: "There is a hand or an arm. Remove it, the weapon floats alone. Keep everything else identical."',
    ],
  };
}

// ---------- 11. pickups, consumables and effects (21-pickups-effects) ----------
const PICKUP_SHEETS = [
  {
    file: 'pk_xp_droplets', size: '1536 x 1024 (3 x 2 cells)', refs: [],
    cells: 'Top row, left to right: small XP droplet (green), medium XP droplet (blue), large XP droplet (violet with a sparkle). Bottom row: the same three droplets in a second pose, tilted 20 degrees (variant B).',
    subject: 'XP droplets, the arena pickups the hero collects. Each is a droplet shape (a round bottom and a point at the top), outlined in night ink #14151F, flat cel shading with a base, a darker shadow tone and one highlight. Small: green #5BD16E, about 0.4 m across. Medium: blue #3D8BFF, about 0.8 m across. Large: violet #8E7CFF, about 1.3 m across, with a four-point white sparkle on its upper-left shoulder (flat, no glow). The three sizes keep the ratio 0.4 : 0.8 : 1.3 (small to large).',
    notes: 'config.js pickup radii r0 0.2 and r1 0.65 m; config-feel.js pickup glint size 0.13 and xp colour 124,240,142 (#7CF08E in config; the design-system token #5BD16E is used here).',
    checks: [
      'Three sizes, clearly different: small, medium and large in that order, left to right.',
      'Colours: small green #5BD16E, medium blue #3D8BFF, large violet #8E7CFF with a sparkle.',
      'Droplet shape with a round bottom and a point at the top; outline in near-black #14151F.',
      'Flat tones, no gradient, no glow, no halo: the sparkle is a flat four-point star.',
      'Flat magenta #FF00FF background, no magenta inside the drops, no grid lines or labels.',
      'No text, numbers or letters.',
    ],
    fails: ['Reply: "The droplets look like balls, not droplets. Make them droplet-shaped with a point at the top. Keep everything else identical."'],
  },
  {
    file: 'pk_loot_consumables', size: '1536 x 1024 (4 x 3 cells)', refs: ['pk_xp_droplets.png'],
    cells: 'Four cells per row, three rows, left to right, top to bottom: (1) heal cross, (2) power star, (3) objective pin, (4) jeton coin; (5) hurda scrap pile, (6) simit ring pickup, (7) chest closed, (8) chest open; (9) eczane heal-station sign, (10) büfe kiosk heal-station sign, (11) empty, (12) empty.',
    subject: 'Currency and loot icons, drawn as flat, outlined icons on the magenta: (1) heal cross: a green #2EBD6B plus sign with a night ink #14151F outline, the config heal icon. (2) power star: a five-point star in simit gold #E9A23B with a night ink outline. (3) objective pin: a map pin in blue #3D8BFF with a round hole. (4) jeton coin: a round coin in simit gold #E9A23B with an inner ring line (no numbers, no letters). (5) hurda scrap: a small pile of bent steel scraps in stone grey #8A8F98 and night ink. (6) simit ring: a bread ring in simit gold #E9A23B with paper cream #F4EBDD sesame dots. (7) chest closed: a small wooden chest in tea amber #B5651D with simit gold #E9A23B bands and a night ink lock, about 0.8 m wide. (8) chest open: the same chest with the lid up and a flat simit gold glint inside. (9) eczane sign: a cream plate with a green #2EBD6B cross. (10) büfe sign: a scalloped awning in tram red #D7263D and paper cream stripes over a tea glass in tea amber. (11) and (12): empty magenta cells. Sizes: each icon is about 0.8 m across at arena scale.',
    notes: 'view/consumables.js classes heal (cross, #2EBD6B), power (star), currency (coin), objective (pin, #3D8BFF); view/consumables-icons.js shapes; config-feel.js chest colour #FFD166 (reserved, not used here).',
    checks: [
      'Four columns and three rows, each icon in its own cell, the two empty cells are flat magenta.',
      'The heal cross is green #2EBD6B, the star and coin are simit gold #E9A23B, the objective pin is blue #3D8BFF.',
      'The chest is tea amber and simit gold, not #FFD166 (the reserved heal colour).',
      'Each icon has a near-black #14151F outline, flat tones, and no glow.',
      'The heal signs have no letters: the cross and the awning are symbols only.',
      'Flat magenta #FF00FF background, no grid lines, no labels, no numbers.',
    ],
    fails: ['Reply: "The chest is yellow-gold like the heal colour. Use tea amber and simit gold for the chest body, keep everything else identical."', 'Reply: "A sign has letters on it. Remove the letters and leave the plate blank. Keep everything else identical."'],
  },
  {
    file: 'pk_passive_icons', size: '1536 x 1024 (4 x 3 cells)', refs: ['pk_loot_consumables.png'],
    cells: 'Four cells per row, three rows, left to right, top to bottom: (1) nazar charm, (2) magnet, (3) shoes, (4) jacket; (5) gloves, (6) energy drink, (7) first-aid kit, (8) cologne bottle; (9) tea glass, (10) turkish delight box, (11) power bank, (12) helmet.',
    subject: 'Twelve passive upgrade icons, one per cell, drawn in the icon style of the attached pk_loot_consumables.png: (1) nazar charm: a blue glass eye bead in bosphorus blue #1B4965 with paper cream #F4EBDD rings and a night ink #14151F pupil. (2) magnet: a horseshoe magnet with tram red #D7263D and paper cream #F4EBDD ends. (3) shoes: a running shoe in paper cream #F4EBDD with a tram red #D7263D stripe. (4) jacket: a bomber jacket in bosphorus blue #1B4965 with a tea amber #B5651D cuff. (5) gloves: work gloves in tea amber #B5651D. (6) energy drink: a plain can in simit gold #E9A23B, no brand. (7) first-aid kit: a small case in paper cream #F4EBDD with a heal green #2EBD6B cross. (8) cologne bottle: a tea amber #B5651D glass bottle with a blank paper cream label. (9) tea glass: a tulip tea glass with tea amber tea and a simit gold rim. (10) turkish delight box: a box in paper cream with faded pink #D98BA0 cubes. (11) power bank: a night ink #14151F block with a simit gold #E9A23B bolt shape (a flat shape, not a letter). (12) helmet: a tram red #D7263D helmet. Each icon about 0.8 m across at arena scale.',
    notes: 'config.js passives list (12 ids: shoes, jacket, gloves, energy, medkit, nazar, magnet, kolonya, cay, lokum, powerbank, kask); the medkit uses the heal green.',
    checks: [
      'Twelve icons, one per cell in the order listed, the grid even and the cells equal.',
      'Each icon is recognisable at 256 pixels and has a near-black #14151F outline with flat tones.',
      'The nazar charm is the blue eye bead (no other icon uses bosphorus blue as its main colour except the jacket).',
      'No brand on the energy drink, no logo anywhere, no letters or numbers.',
      'The power bank bolt is a flat shape, not text.',
      'Flat magenta #FF00FF background, no grid lines, no labels.',
    ],
    fails: ['Reply: "The energy drink has a brand or letters. Make it a plain can with no lettering. Keep everything else identical."'],
  },
  {
    file: 'fx_hit_sparks', size: '1536 x 1024 (3 x 2 cells)', refs: [],
    cells: 'Six cells in a 3 x 2 grid, left to right, top to bottom: (1) slash crescent, (2) pierce spike, (3) blunt chip, (4) fire ember, (5) chemical bubble, (6) electric zig.',
    subject: `Six hit-spark shapes, one per damage class, each a single flat shape on the magenta (no outline needed, flat fill with one lighter core), about 0.3 m across at arena scale. ${Object.entries(TIERS.impact).map(([c, im]) => `(${c}) ${im.shape}: a flat ${im.shape === 'crescent' ? 'thin crescent arc of three strokes' : im.shape === 'spike' ? 'four-point thin spike' : im.shape === 'chip' ? 'small angular chip with three facets' : im.shape === 'ember' ? 'teardrop ember with a bright core' : im.shape === 'bubble' ? 'open ring bubble with a highlight dot' : 'zigzag bolt in two runs'} in ${hexOfRgb(im.col)}`).join('; ')}. The electric zig is pale ice, not the reserved cyan #3DDCFF.`,
    notes: 'config-weapon-tiers.js wtier.impact (shape, col per class). The cable weapon ramp uses the reserved #3DDCFF; the electric spark here is #BEF8FF, because the reserved cyan is not used for sparks.',
    checks: [
      'Six shapes in the stated order, one per cell, same size in each cell.',
      'Each shape matches its name: crescent, spike, chip, ember, bubble, zigzag.',
      'Colours: slash white #FFFFFF, pierce #FFF0BE, blunt #B0A69C, fire #FF8C28, chemical #E2F6FF, electric #BEF8FF.',
      'Flat fills, no glow, no halo, no gradient.',
      'Flat magenta background, no magenta inside the shapes, no text.',
    ],
    fails: ['Reply: "A shape has a glow or a gradient. Make it flat with one lighter core. Keep everything else identical."'],
  },
  {
    file: 'fx_blood_splats', size: '1536 x 1024 (3 x 2 cells)', refs: [],
    cells: 'Six cells in a 3 x 2 grid: top row small splat A, small splat B, medium splat A; bottom row medium splat B, large splat A, large splat B.',
    subject: 'Six flat blood splat shapes on the magenta, each one flat dark red #7A1F2B, a single splat shape with a few drops around it, no gradient, no highlight, no gore, no body parts: small about 0.15 m across, medium about 0.3 m, large about 0.5 m. The splats are hit feedback only: a small flat shape at most, never a pool.',
    notes: 'design-system section 2 (hits produce blood splats, red by default); style bible section 8 (no blood pools).',
    checks: [
      'Six splats in the stated order; sizes step from small to large.',
      'Flat dark red #7A1F2B only, no gradient, no highlight.',
      'No gore, no body parts, no blood pool, no organs.',
      'Flat magenta background, no magenta inside the splats, no text.',
    ],
    fails: ['Reply: "The splat looks like a pool or has gore. Make it a small flat splat shape only. Keep everything else identical."'],
  },
  {
    file: 'fx_dust_smoke', size: '1536 x 1024 (3 x 2 cells)', refs: [],
    cells: 'Six cells in a 3 x 2 grid: top row dust puff A, dust puff B, smoke wisp A; bottom row smoke wisp B, ash wisp A, ash wisp B.',
    subject: 'Six flat effect shapes on the magenta, each about 0.6 m across at arena scale: dust puffs (paper cream #F4EBDD and stone grey #8A8F98, two flat cloud-like circles, no outline), smoke wisps (stone grey #8A8F98 with a paler edge, flat curling shapes, no outline), ash wisps (the death dissolve, stone grey #8A8F98 at a low value, rising thin curls, flat). No fire, no sparks, no glow.',
    notes: 'design-system section 2 (deaths dissolve into ash-grey wisps); config.js wisp alpha 0.38 (the game sets the alpha in code).',
    checks: [
      'Six shapes in the stated order: two dust puffs, two smoke wisps, two ash wisps.',
      'Flat fills with no outline and no gradient; the shapes are soft-edged only by flat stepping.',
      'Colours: paper cream #F4EBDD and stone grey #8A8F98 only.',
      'No fire, no sparks, no glow.',
      'Flat magenta background, no text.',
    ],
    fails: ['Reply: "The wisps have a gradient or an airbrushed edge. Make them flat with a paler edge. Keep everything else identical."'],
  },
  {
    file: 'fx_rubble_chips', size: '1536 x 1024 (3 x 2 cells)', refs: [],
    cells: 'Six cells in a 3 x 2 grid: top row wood chips A, wood chips B, stone chips A; bottom row stone chips B, plaster chips A, plaster chips B.',
    subject: 'Six small rubble-chip groups on the magenta, each group of 3 to 5 chips about 0.2 m across at arena scale, flat shapes with a night ink #14151F edge line: wood chips in tea amber #B5651D (two tones), stone chips in stone grey #8A8F98 (two tones), plaster chips in paper cream #F4EBDD with a stone grey shadow tone on one face. No dust cloud, no fire, no gore.',
    notes: 'design-system section 2 (pavement pops and dust puffs only; no earthquake imagery).',
    checks: [
      'Six groups of chips in the stated order; each group is a small heap, not a single chip.',
      'Colours: tea amber wood, stone grey stone, paper cream plaster, each with a night ink edge line.',
      'No dust cloud, no fire, no gore, no earthquake imagery.',
      'Flat magenta background, no magenta inside the chips, no text.',
    ],
    fails: ['Reply: "The chips look like a crack in the ground or a crater. Draw them as separate small chips only. Keep everything else identical."'],
  },
];
function pickupMessage(s) {
  return {
    message: msg(
      `Context: this is an effect or pickup sheet for Project Istanbul, a portrait phone game in which a student walks home through a zombie-filled Istanbul. The sheet supplies small flat pictures that the game places on the arena and on the HUD.`,
      `Deliverable: one landscape image, ${s.size.split(' (')[0]} pixels, ${s.cells} Flat magenta #FF00FF background over the whole image; each cell has the same scale; nothing touches a cell edge; no grid lines, no labels, no numbers, no arrows.`,
      `Subject: ${s.subject}`,
      `Camera: straight from above for the flat icons (no perspective), and three-quarter top-down for any object with height. A flat shadow tone only on the lower-right faces of an object, no cast shadow on the magenta.`,
      `Style: ${OBJECT_STYLE}`,
      L.bgLine('magenta'),
      L.NEGATIVE,
      s.refs.length ? `Consistency: the attached file ${s.refs[0]} is the approved look of the pickup family; match its outline weight, flat tones and icon size.` : 'Consistency: this is the first sheet of its family, so it sets the look (outline weight, flat tones and size).',
      `Reserved colours that must not appear as decoration: cyan #3DDCFF (the player ring), orange-red #FF4D2E (enemy warnings), gold-yellow #FFD166 (healing).`,
      LAST,
    ),
    refs: s.refs,
    notes: s.notes,
    checks: s.checks,
    fails: s.fails,
  };
}

// ---------- 12. emit: one file per image, batch folders by kind ----------
function clearOwnBatches() {
  // Only the batch folders this generator owns; the character generator writes its own folders.
  const owned = /^(10-ground-|11-props-|12-facades-|13-vehicles$|20-weapons$|21-pickups-effects$)/;
  if (!fs.existsSync(OUT)) return;
  fs.readdirSync(OUT).filter(d => owned.test(d)).forEach(d => fs.rmSync(path.join(OUT, d), { recursive: true, force: true }));
}
function build() {
  const items = [];
  const add = (batch, file, kind, spec, extra = {}) => {
    items.push(Object.assign({ id: batch + '/' + file, file, batch, kind, bg: spec.bg || 'magenta', size: spec.size, refs: spec.refs || [],
      message: spec.message, checks: spec.checks || [], fails: spec.fails || [], notes: spec.notes || '' }, extra));
  };
  // 10-ground: four variants per hood, plus the special tiles.
  HOOD.forEach(h => {
    const batch = '10-ground-' + h.id;
    ['A', 'B', 'C', 'D'].forEach(v => {
      const file = 'gnd_' + h.id + '_' + v.toLowerCase();
      add(batch, file, 'ground', {
        bg: 'none', size: '1024 x 1024 (full picture, straight top-down)', refs: v === 'A' ? [] : [h.groundFile],
        message: groundMessage(h, v),
        checks: [
          'Seamless: place the image next to a copy of itself, left to right and top to bottom; no seam, no mirror, no repeated big shape at the join.',
          'Square 1024 by 1024, straight top-down (90 degrees, no horizon, no perspective).',
          'Mid value: the whole tile stays between 45 and 75 percent HSL lightness (stone grey #8A8F98 is 57 percent); no near-black or near-white areas apart from the joints.',
          'Joints and cracks are night ink #14151F; no other black.',
          'No objects, people, animals, litter, cast shadows, lighting gradient or text; puddles or wet patches only where variant C names them.',
          'No strong focal feature: no single big stone, bright spot or dark hole; the tile reads calm when repeated.',
          v === 'A' ? 'It is the base: even stones, even joints, no wear beyond the joints.' : v === 'B' ? 'Same paving as the attached variant A, with the wear added and nothing else.' : v === 'C' ? 'Same paving as the attached variant A, with the named motif on a regular rhythm.' : 'Same paving as the attached variant A, the calmest: fewer joints, lowest contrast, no motif.',
          'Palette: stone grey #8A8F98 and night ink #14151F, plus the tones named in the brief only (hood accent colours appear only where the brief names them).',
        ],
        fails: [
          'Reply: "The edges do not join. Redraw with the same stones so the left edge continues into the right edge and the top into the bottom. Keep everything else identical."',
          'Reply: "There is a focal stone, a light spot or a shadow on the tile. Remove it and spread the stones evenly. Keep everything else identical."',
        ],
        notes: `Source: ${h.brief.code} Materials line ("${colour(h.ground)}"), hood ${h.id} (journey.js order ${h.idx}).`,
      }, { ground: true });
    });
    GROUND_EXTRA.filter(x => x.hood === h.id).forEach(x => {
      const file = 'gnd_' + h.id + '_' + x.what;
      add(batch, file, 'ground', {
        bg: 'none', size: '1024 x 1024 (full picture, straight top-down)', refs: [h.groundFile],
        message: groundExtraMessage(h, x),
        checks: [
          'Seamless top to bottom and left to right: a copy placed beside it shows no seam.',
          'Straight top-down, square 1024 by 1024, no perspective.',
          `The feature named in the file name (${x.what}) is exactly as described in the subject, and it runs straight through the tile so that it joins.`,
          'Joints and cracks in night ink #14151F; the paving is mid-value stone grey #8A8F98 range, except the named exception.',
          'No objects, people, animals, text, shadows or lighting gradient.',
          'It matches the attached gnd_' + h.id + '_a.png paving (stone size, joint colour and tone).',
        ],
        fails: [
          'Reply: "The feature does not run straight through the tile, or the edges do not join. Redraw with the feature running exactly vertically or horizontally so it joins. Keep everything else identical."',
        ],
        notes: `Special ground for ${h.id}, from the ${h.brief.code} Materials and Reads lines in docs/hood-visual-briefs.md. ${x.text.includes('EXCEPTION') ? 'It has one named colour exception on purpose.' : 'Paving stays in the mid-value range.'}`,
      }, { ground: true });
    });
  });
  // 11-props: one 2 x 2 sheet per brief prop.
  HOOD.forEach(h => {
    const batch = '11-props-' + h.id;
    h.props.forEach(item => {
      const pm = propMessage(h, item);
      add(batch, 'prop_' + h.id + '_' + item.key, 'prop', {
        size: pm.size, refs: pm.refs, message: pm.message, checks: pm.checks, fails: pm.fails, notes: pm.notes,
      }, { prop: true });
    });
  });
  // 12-facades: a left-lit image and a night image per hood.
  HOOD.forEach(h => {
    const batch = '12-facades-' + h.id;
    add(batch, 'fac_' + h.id + '_left', 'facade', {
      bg: 'none', size: '1024 x 1536 (portrait, full picture)', refs: [h.groundFile],
      message: facadeMessage(h, false),
      checks: [
        'Portrait 1024 by 1536, a full picture with no border and no background outside the building.',
        'Three-quarter top-down, about 55 degrees: the roof edge is at the top, the ground contact at the bottom.',
        'The left and right edges join seamlessly: a copy placed beside it shows no seam.',
        'Windows, balconies, shutters and awnings in the named colours; every fascia board is blank (no letters, no numbers).',
        'The key light comes from the upper left (warm amber) with cool bosphorus blue shadow on the right faces, as the brief says.',
        'Outline in near-black #14151F on roof edges, window frames and awnings, the same weight as the characters.',
        'No people, cars, flags, religious symbols or gore.',
      ],
      fails: [
        'Reply: "There is text on a sign or a fascia. Leave every board blank and keep everything else identical."',
        'Reply: "The edges do not join or the roof is at the bottom. Redraw with the roof at the top and the left edge continuing into the right edge. Keep everything else identical."',
      ],
      notes: `Source: ${h.brief.code} Materials (walls, awnings, shutters, accent), Light and Reads lines. Signage in the brief is not drawn (${h.signage ? 'names kept out of the art' : 'none'}).`,
    }, { facade: true });
    add(batch, 'fac_' + h.id + '_night', 'facade', {
      bg: 'none', size: '1024 x 1536 (portrait, full picture)', refs: ['fac_' + h.id + '_left.png'],
      message: facadeMessage(h, true),
      checks: [
        'Same building as the attached fac_' + h.id + '_left.png: same layout, windows, awnings and colours; only the light changes.',
        'Darker night tones in bosphorus blue #1B4965 and night ink #14151F; windows and shopfronts warm simit gold #E9A23B as flat shapes.',
        'No bloom, no halo, no glow outside the windows.',
        'Portrait 1024 by 1536, full picture, roof edge at the top, ground contact at the bottom, edges join seamlessly.',
        'No text on any board, no people, cars or flags.',
      ],
      fails: [
        'Reply: "The night version has a glow or bloom around the lamps. Make the lights flat shapes only. Keep everything else identical."',
        'Reply: "The building changed shape between the day and night versions. Redraw the night version from the attached file exactly, changing only the light. Keep everything else identical."',
      ],
      notes: `Night variant of fac_${h.id}_left (same building, darker light).`,
    }, { facade: true });
  });
  // 13-vehicles
  VEHICLE.forEach((v, i) => {
    add('13-vehicles', v.file, 'vehicle', {
      bg: 'magenta', size: v.file === 'veh_tram_red' ? '1536 x 1024 (landscape, one vehicle)' : '1024 x 1024 (one vehicle)', refs: v.refs,
      message: vehicleMessage(v, i),
      checks: [
        'One vehicle, centred, about 80 percent of its length in the frame; flat magenta #FF00FF background, no grid lines.',
        'Three-quarter top-down: the roof and one long side visible; the ground not foreshortened.',
        'Outline in near-black #14151F, the same weight as the characters; two or three flat tones per colour.',
        'The named hex colours are visible; no brand, no logo, no route text, no number plate text.',
        'No people, no zombies, no flags, no smoke, no glow, no shadow on the background.',
        v.file === 'veh_tram_red' ? 'The tram: long rectangular roof in cream, lower body tram red, no livery and no text.' : 'Proportions match the size in metres: ' + v.size[0] + ' m wide by ' + v.size[1] + ' m long.',
      ],
      fails: [
        'Reply: "The vehicle has a logo or lettering. Remove all lettering and marks, keep everything else identical."',
        'Reply: "The vehicle is in perspective, or the roof is hidden. Redraw at the three-quarter top-down camera, keep everything else identical."',
      ],
      notes: `Vehicle source: ${v.use}. ${v.note}`.trim(),
    }, { vehicle: true });
  });
  // 20-weapons: icon, tier sheet, and evolution pair.
  WEAPON_ORDER.forEach((id, i) => {
    const ic = weaponIconMessage(id, i);
    add('20-weapons', 'wpn_' + id + '_icon', 'weapon-icon', { size: '1024 x 1024 (one icon)', refs: ic.refs, message: ic.message, checks: ic.checks, fails: ic.fails, notes: ic.notes }, { weapon: true });
    const tm = weaponTierMessage(id);
    add('20-weapons', 'wpn_' + id + '_tiers', 'weapon-tiers', { size: '1536 x 1024 (3 x 2 cells, L1 to L5 and an empty cell)', refs: tm.refs, message: tm.message, checks: tm.checks, fails: tm.fails, notes: tm.notes }, { weapon: true });
  });
  EVO_IDS.forEach(evo => {
    const em = weaponEvoMessage(evo);
    add('20-weapons', 'wpn_evo_' + evo, 'weapon-evolution', { size: '1536 x 1024 (2 cells: icon and in-world sprite)', refs: em.refs, message: em.message, checks: em.checks, fails: em.fails, notes: em.notes }, { weapon: true });
  });
  // 21-pickups-effects
  PICKUP_SHEETS.forEach(s => {
    const pm = pickupMessage(s);
    add('21-pickups-effects', s.file, s.file.startsWith('fx_') ? 'effect' : 'pickup', { size: s.size, refs: pm.refs, message: pm.message, checks: pm.checks, fails: pm.fails, notes: pm.notes }, { pickup: true });
  });
  return items;
}

// ---------- 13. run order: prompts/ORDER-world.md (generated, so its counts match the files) ----------
const PHASE1_HOODS = ['istiklal', 'galata'];
const PHASE1_WEAPONS = ['knife', 'nailgun', 'canister', 'chain', 'sledge'];
const PHASE1_EVOS = ['cleaver', 'nailstorm', 'cluster', 'cyclone', 'blacksmith'];
function phase1(a) {
  const hood = /^(?:10-ground|11-props|12-facades)-(.+)$/.exec(a.batch);
  if (hood) return PHASE1_HOODS.includes(hood[1]);
  if (a.batch === '13-vehicles') return a.file === 'veh_tram_red';
  if (a.batch === '20-weapons') {
    const w = /^wpn_([a-z]+)_(icon|tiers)$/.exec(a.file);
    if (w) return PHASE1_WEAPONS.includes(w[1]);
    const e = /^wpn_evo_([a-z]+)$/.exec(a.file);
    return !!e && PHASE1_EVOS.includes(e[1]);
  }
  if (a.batch === '21-pickups-effects') return a.file === 'pk_xp_droplets';
  return false;
}
function orderText(ordered) {
  const count = re => ordered.filter(a => re.test(a.batch)).length;
  const hrs = n => (n * 3 / 60).toFixed(1);
  const p1 = ordered.filter(phase1);
  const rest = ordered.filter(a => !phase1(a));
  const restOf = batch => rest.filter(a => a.batch === batch).length;
  const out = [];
  out.push('# World art: run order', '');
  out.push('Generated by `node prototype/tools/gen-art-prompts-world.js`; change the generator and run it again rather than editing this file.', '');
  out.push(`Total: ${ordered.length} images (ground ${count(/^10-/)}, props ${count(/^11-/)}, facades ${count(/^12-/)}, vehicles ${count(/^13-/)}, weapons ${count(/^20-/)}, pickups and effects ${count(/^21-/)}). At about 3 minutes per image that is about ${hrs(ordered.length)} hours of generation, before your review.`, '');
  out.push('## How to run one image', '');
  out.push('1. Open the prompt file and start a new chat in the "Istanbul Art" Project.');
  out.push('2. Attach the files under "Attach these files to the message", in the order listed.');
  out.push('3. Paste the block under "Paste this into ChatGPT" and send it.');
  out.push('4. Save the image at the path in the file header (art/commission/in/<batch>/<file>.png).');
  out.push('5. Tick the "Accept the image only if" list. If one item fails, send the matching line under "If it fails" in the same chat.', '');
  out.push(`## Phase 1: the first 10 levels (Istiklal and Galata), do these first (${p1.length} images, about ${hrs(p1.length)} hours)`, '');
  out.push("Order matters: a hood's ground A tile is the reference for its props and facades, and each base weapon's icon and tier sheet comes before its evolution (the evolution attaches the L5 crop).", '');
  p1.forEach((a, i) => out.push(`${i + 1}. ${a.batch}/${String(a.order).padStart(3, '0')}_${a.file}.md`));
  out.push('', '## Later batches (LATER), in this order', '');
  out.push('Hoods follow the journey order in journey.js. For each hood, ground comes first, then its props, then its facades.', '');
  HOOD.forEach(h => {
    if (PHASE1_HOODS.includes(h.id)) return;
    const g = restOf('10-ground-' + h.id), pr = restOf('11-props-' + h.id), f = restOf('12-facades-' + h.id);
    out.push(`- LATER, hood ${h.idx}, ${h.name} (${h.district}): ground ${g}, props ${pr}, facades ${f}, ${g + pr + f} images.`);
  });
  out.push(`- LATER, vehicles: ${restOf('13-vehicles')} more (the tram is in phase 1).`);
  out.push(`- LATER, weapons: ${restOf('20-weapons')} more (remaining base icons and tier sheets, then the other evolutions; each evolution after its base tier sheet).`);
  out.push(`- LATER, pickups and effects: ${restOf('21-pickups-effects')} more sheets.`, '');
  out.push('## Notes', '');
  out.push('- The ground A tile of each hood is the first file of its batch; props, facades and the other ground variants attach it, so save it first.');
  out.push('- The character batches (00-style, 01-hero, 02-enemies, 03-bosses) are not in this order.');
  out.push('- Status for every file is kept in art/commission/TRACKER.csv (every row starts as todo).', '');
  return out.join('\n');
}
function main() {
  const items = build();
  clearOwnBatches();
  // Number each image within its batch, then write the files, the run order and the tracker rows (emit() is in the shared lib).
  const byBatch = {};
  items.forEach(a => { (byBatch[a.batch] = byBatch[a.batch] || []).push(a); });
  const ordered = [];
  Object.keys(byBatch).forEach(b => byBatch[b].forEach((a, i) => ordered.push(Object.assign({}, a, { order: i + 1 }))));
  Object.keys(byBatch).forEach(b => L.emit(ordered.filter(a => a.batch === b)));
  fs.writeFileSync(path.join(OUT, 'ORDER-world.md'), orderText(ordered));
  const rows = L.track();
  const counts = Object.keys(byBatch).sort().map(b => [b, byBatch[b].length]);
  const total = items.length;
  const perBatch = (re) => items.filter(a => re.test(a.batch)).length;
  console.log('Wrote ' + total + ' prompt files under ' + path.relative(ROOT, OUT) + ' (tracker rows merged: ' + rows + ')');
  counts.forEach(([b, n]) => console.log('  ' + b.padEnd(24) + n));
  console.log('Totals: ground ' + perBatch(/^10-ground/) + ', props ' + perBatch(/^11-props/) + ', facades ' + perBatch(/^12-facades/) +
    ', vehicles ' + perBatch(/^13-vehicles/) + ', weapons ' + perBatch(/^20-weapons/) + ', pickups and effects ' + perBatch(/^21-pickups/));
  console.log('Phase 1 (first 10 levels): ' + ordered.filter(phase1).length + ' images; later: ' + ordered.filter(a => !phase1(a)).length + '.');
  console.log('Time at about 3 minutes per image: ' + Math.round(total * 3 / 60) + ' hours.');
}
main();
main();
