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
const L = require('./lib-art-prompts.js');
const { ROOT, OUT } = L;
const { HOOD, GROUND_EXTRA, groundMessage, groundExtraMessage, propMessage, facadeMessage, VEHICLE, vehicleMessage, colour } =
  require('./lib-art-prompts-streets.js');
const { WEAPON_ORDER, EVO_IDS, weaponIconMessage, weaponTierMessage, weaponEvoMessage, PICKUP_SHEETS, pickupMessage } =
  require('./lib-art-prompts-items.js');

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
