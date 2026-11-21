'use strict';
// Prompt text for weapons, upgrades, pickups and effects.
const fs = require('fs');
const path = require('path');
const L = require('./lib-art-prompts.js');
const { PROTO, CFG, LAST, colour, plain, cap, join, msg, OBJECT_STYLE } = require('./lib-art-prompts-streets.js');
const PALETTE = L.PALETTE;
const TIERS = CFG.wtier;
const LEVEL_WORDS = ['L1', 'L2', 'L3', 'L4', 'L5'];
const hexOfRgb = s => '#' + s.split(',').map(n => (+n).toString(16).padStart(2, '0')).join('').toUpperCase();

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

module.exports = { WEAPON_ORDER, EVO_IDS, weaponIconMessage, weaponTierMessage, weaponEvoMessage, PICKUP_SHEETS, pickupMessage };
