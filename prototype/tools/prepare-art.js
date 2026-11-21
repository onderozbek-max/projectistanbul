#!/usr/bin/env node
// Turns the owner's ChatGPT art (art/commission/in/<batch>/, the 419 prompt outputs listed in art/commission/asset-inventory.json)
// into the runtime assets under prototype/assets/art/, and writes prototype/assets/art/manifest.json, which names every frame,
// pivot and scale. Rules and the manifest schema: art/commission/IMPORTER.md.
//   characters  hero, enemies and bosses: sheets sliced by the inventory cell map, keyed, one scale per entity, pivot at the feet
//   ground      1024 -> 512 JPEG tiles; seam score and mean L* reported
//   facades     1024x1536 -> 512x768 JPEG
//   props       per hood: 2x2 cells keyed and trimmed, pivot at the footprint, one atlas per hood (hand-wired hoods are listed only)
//   weapons     icon, tiers and evolution sheets per base weapon, one atlas each
//   sprites     pickups and effects (transparent derivatives, re-keyed so the edges are soft), one atlas per sheet
//   vehicles    the -v2 vehicles, keyed and trimmed, pivot at the bottom centre
//   node prototype/tools/prepare-art.js [--dry-run] [--only=batch,...] [--list] [--force] [--dst=DIR] [--sheets=DIR]
// --only takes batch names (01-hero, 11-props-eminonu, ...) or unit ids; units outside it reuse the cache.
// --force ignores the cache. --sheets writes contact sheets (PNG) of the characters to DIR.
// Node 18+, ffmpeg on PATH (JPEG only), no npm packages. Cache: <dst>/.cache.json keyed by source sha256 and the recipe hash.
// Exit code: 0 when every source is used or deliberately skipped; 1 when a source is rejected or fails.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const L = require('./lib-art-image.js');
const { C, KEY, Reject, reject, relPath, round1, round4, srcFile, readRgba, loadKeyed, cellOf, boxOrReject, makeFrame, buildAtlas } = require('./lib-art-frames.js');
const { calibrateBossFrames } = require('./lib-art-frames.js');
const { writeContactSheets } = require('./lib-art-contact.js');

const ROOT = path.join(__dirname, '..', '..');
const COMM = path.join(ROOT, 'art', 'commission');
const INVENTORY = path.join(COMM, 'asset-inventory.json');
const DEFAULT_DST = path.join(ROOT, 'prototype', 'assets', 'art');
const MB = 1024 * 1024;
const BUDGET_BYTES = 60 * MB, GOAL_BYTES = [30 * MB, 40 * MB];

// Evolution sheet -> base weapon (handoff; the test checks each pair against the game config).
const EVO_BASE = {
  cleaver: 'knife', nailstorm: 'nailgun', cluster: 'canister', carbomb: 'canister', cyclone: 'chain', arcchain: 'chain',
  blacksmith: 'sledge', lake: 'molotov', fireball: 'molotov', finale: 'fireworks', stormshield: 'cable', netspear: 'speargun',
  foamstorm: 'extinguisher', twinsaw: 'sawblade', forge: 'torch', hookpull: 'olta', minibus: 'cardoor', grinder: 'chainsaw',
};
const ENEMY_ROLES = new Set(['idle', 'walk1', 'walk2', 'hit', 'dead', 'swollen']);
const HERO_VIEWS = { side: 'right', front: 'down', back: 'up' };   // facing: side faces right; front faces the camera; back away
const WALKER_OUTFITS = ['office', 'student', 'shopper', 'tourist'];  // handoff and art-enemy-look.js: index = variantOf(id)
const HINT_WORDS = ['overhead', 'canopy', 'string', 'hang', 'solid', 'decorative', 'footprint', 'objective', 'sign', 'ground', 'flat'];

const sha256 = buf => crypto.createHash('sha256').update(buf).digest('hex');

// ---------- processors: each returns { parts, outputs } or throws Reject

function procCharacter(unit, ctx) {
  const cells = [];
  for (const sh of unit.sheets) {
    const img = loadKeyed(srcFile(sh.src), { target: sh.target }, ctx);
    ctx.note(sh.src.id, img.info);
    for (const c of sh.cells) {
      if (c.role === 'empty') continue;
      const cell = cellOf(img, c.rect);
      const box = boxOrReject(cell, `${sh.src.id} ${c.role}`);
      cells.push({ key: sh.view ? `${sh.view}.${c.role}` : c.role, role: c.role, view: sh.view, cell, box });
    }
  }
  const idleKey = unit.sheets[0].view ? 'side.idle' : 'idle';
  const idle = cells.find(c => c.key === idleKey);
  if (!idle) reject('no idle frame');
  const idleH = idle.box.y1 - idle.box.y0;
  if (idleH < 40) reject(`idle figure only ${idleH} px tall`);
  const s = C.heightPx[unit.kind] / idleH;                  // one scale for every frame of the entity
  if (s > C.upscaleWarn) ctx.warn(`scale ${round4(s)} enlarges the source (idle ${idleH} px to ${C.heightPx[unit.kind]} px)`);
  const frames = cells.map(c => {
    const anchor = unit.flying || c.role === 'dead' || c.role === 'down' ? 'body' : 'feet';
    const f = makeFrame(c.cell, c.box, s, anchor);
    if (f.touches) ctx.warn(`${unit.id} ${c.key}: figure touches the cell edge`);
    return { key: c.key, content: f.content, px: f.px, py: f.py, anchor };
  });
  const atlas = buildAtlas(frames, true);
  const file = `characters/${unit.artId}.png`;
  const entry = { kind: unit.kind, atlas: file, scale: round4(s), srcHeightPx: idleH, heightPx: round1(idleH * s), facing: 'right' };
  const R = atlas.rects;
  if (unit.kind === 'hero') {
    entry.views = {};
    for (const v of Object.keys(HERO_VIEWS)) {
      const fr = {};
      for (const role of ['idle', 'walk1', 'walk2', 'walk3', 'walk4']) if (R[`${v}.${role}`]) fr[role] = R[`${v}.${role}`];
      entry.views[v] = { facing: HERO_VIEWS[v], frames: fr };
    }
    entry.poses = {};
    for (const role of ['hurt', 'down', 'victory']) if (R[role]) entry.poses[role] = R[role];
  } else {
    entry.flying = !!unit.flying;
    if (unit.group) { entry.group = unit.group; entry.outfit = unit.outfit; }
    entry.frames = {};
    for (const c of cells) entry.frames[c.role] = R[c.key];
    if (unit.kind === 'boss') calibrateBossFrames(unit.artId, entry.frames);
  }
  return { parts: { characters: { [unit.artId]: entry } }, outputs: [{ file, buf: atlas.png, encoding: atlas.encoding, err: atlas.err }] };
}

function rgbOf(r) {
  const n = r.w * r.h, rgb = new Uint8Array(n * 3);
  for (let i = 0; i < n; i++) { rgb[i * 3] = r.rgba[i * 4]; rgb[i * 3 + 1] = r.rgba[i * 4 + 1]; rgb[i * 3 + 2] = r.rgba[i * 4 + 2]; }
  return rgb;
}
function procGround(unit, ctx) {
  const img = readRgba(srcFile(unit.src));
  if (img.w !== 1024 || img.h !== 1024) reject(`${unit.id}: ${img.w}x${img.h}, expected 1024x1024`);
  const r = L.renderOpaque(img, { x0: 0, y0: 0, x1: img.w, y1: img.h }, C.scale.ground);
  const rgb = rgbOf(r);
  const seam = L.seamScore(rgb, r.w), lstar = L.lstarMean(rgb, r.w * r.h);
  if (seam > C.seamPoor && unit.variant.length === 1) ctx.warn(`seam score ${seam} (wrap edge differs about ${seam}x a neighbour step)`);
  if (lstar < C.lstarMin || lstar > C.lstarMax) ctx.warn(`mean L* ${lstar} outside ${C.lstarMin}-${C.lstarMax}`);
  const file = `ground/${unit.hood}/${unit.variant}.jpg`;
  const flags = [];
  if (seam < 0.3) flags.push('seamless');                    // wrap edges are pixel-identical: the tile repeats with no seam
  if (seam > C.seamPoor) flags.push('seam-poor');
  if (lstar < C.lstarMin || lstar > C.lstarMax) flags.push('lstar-outside');
  if (unit.variant.length > 1) flags.push('special');        // rails, stairs, shore bands: placed at a transition, not repeated
  const entry = { id: unit.id, hood: unit.hood, variant: unit.variant, feature: unit.variant.length > 1 ? unit.variant : null,
    file, w: r.w, h: r.h, seamScore: seam, lstar, flags, source: unit.src.path };
  return { parts: { ground: { [unit.id]: entry } }, outputs: [{ file, buf: L.encodeJpeg(r.w, r.h, rgb, C.jpegQ) }] };
}

function procFacade(unit, ctx) {
  const img = readRgba(srcFile(unit.src));
  if (img.w !== 1024 || img.h !== 1536) reject(`${unit.id}: ${img.w}x${img.h}, expected 1024x1536`);
  const r = L.renderOpaque(img, { x0: 0, y0: 0, x1: img.w, y1: img.h }, C.scale.facade);
  const file = `facades/${unit.hood}/${unit.variant}.jpg`;
  const entry = { id: unit.id, hood: unit.hood, variant: unit.variant, file, w: r.w, h: r.h, source: relPath(srcFile(unit.src)) };
  return { parts: { facades: { [unit.id]: entry } }, outputs: [{ file, buf: L.encodeJpeg(r.w, r.h, rgbOf(r), C.jpegQ) }] };
}

function procProps(unit, ctx) {
  const frames = [], items = {}, keyed = new Map();
  for (const it of unit.items) {
    const slots = {};
    for (const cl of it.cells) {
      const id = cl.file + (cl.transparent ? '#t' : '');
      if (!keyed.has(id)) keyed.set(id, loadKeyed(cl.file, { target: KEY.magenta, transparent: cl.transparent }, ctx));
      const img = keyed.get(id);
      if (!slots.__noted) { ctx.note(cl.sheet, img.info); slots.__noted = true; }
      const cell = cellOf(img, cl.rect);
      const box = boxOrReject(cell, `${unit.id} ${it.name} slot ${cl.slot}`);
      const f = makeFrame(cell, box, C.scale.prop, 'feet');
      if (f.touches) ctx.warn(`${unit.id} ${it.name} slot ${cl.slot}: figure touches the cell edge`);
      const key = `${it.name}.${cl.name}`;
      frames.push({ key, content: f.content, px: f.px, py: f.py, anchor: 'feet' });
      slots[cl.name] = key;
    }
    delete slots.__noted;
    items[it.name] = { slot4: it.slot4, hints: it.hints, keys: slots };
  }
  const atlas = buildAtlas(frames, true);
  const file = `props/${unit.hood}.png`;
  const out = {};
  for (const [name, it] of Object.entries(items)) {
    out[name] = { slot4: it.slot4, hints: it.hints, cells: Object.fromEntries(Object.entries(it.keys).map(([k, v]) => [k, atlas.rects[v]])) };
  }
  return { parts: { props: { [unit.hood]: { handwired: false, atlas: file, scale: C.scale.prop, cellPx: 256, items: out } } },
    outputs: [{ file, buf: atlas.png, encoding: atlas.encoding, err: atlas.err }] };
}

function procVehicle(unit, ctx) {
  const img = loadKeyed(srcFile(unit.src), { target: unit.target }, ctx);
  ctx.note(unit.id, img.info);
  const cell = cellOf(img, null);
  const box = boxOrReject(cell, unit.id);
  const f = makeFrame(cell, box, C.scale.vehicle, 'feet');
  const atlas = buildAtlas([{ key: unit.id, content: f.content, px: f.px, py: f.py, anchor: 'bottom' }], true);
  const file = `vehicles/${unit.id}.png`;
  const m = /Size in metres:\s*([\d.]+) m wide and ([\d.]+) m long(?:, ([\d.]+) m high)?/.exec(unit.src.world_spec_from_prompt || '');
  const metres = m ? { wide: +m[1], long: +m[2], high: m[3] ? +m[3] : null } : null;
  return { parts: { vehicles: { [unit.id]: { atlas: file, scale: C.scale.vehicle, frame: atlas.rects[unit.id], metres, source: relPath(srcFile(unit.src)) } } },
    outputs: [{ file, buf: atlas.png, encoding: atlas.encoding, err: atlas.err }] };
}

function procWeapon(unit, ctx) {
  const frames = [];
  const file = `weapons/${unit.base}.png`;
  const part = { atlas: file, base: unit.base, scale: { icon: C.scale.icon, tier: C.scale.tier, evo: C.scale.evo }, tiers: {}, evolutions: {} };
  if (unit.icon) {
    const img = loadKeyed(srcFile(unit.icon), { target: KEY.magenta }, ctx);
    const cell = cellOf(img, null);
    const f = makeFrame(cell, boxOrReject(cell, unit.icon.id), C.scale.icon, 'centre');
    frames.push({ key: 'icon', content: f.content, px: f.px, py: f.py, anchor: 'centre' });
  }
  if (unit.tiers) {
    const img = loadKeyed(srcFile(unit.tiers.src), { target: KEY.magenta }, ctx);
    ctx.note(unit.tiers.src.id, img.info);
    for (const c of unit.tiers.cells) {
      if (c.role === 'empty') continue;
      const cell = cellOf(img, c.rect);
      const f = makeFrame(cell, boxOrReject(cell, `${unit.tiers.src.id} ${c.role}`), C.scale.tier, 'centre');
      frames.push({ key: c.role, content: f.content, px: f.px, py: f.py, anchor: 'centre' });
    }
  }
  for (const evo of unit.evos) {
    const img = loadKeyed(srcFile(evo.src), { target: KEY.magenta }, ctx);
    ctx.note(evo.src.id, img.info);
    for (const c of evo.cells) {
      const cell = cellOf(img, c.rect);
      const f = makeFrame(cell, boxOrReject(cell, `${evo.src.id} ${c.part}`), C.scale.evo, 'centre');
      frames.push({ key: `evo.${evo.name}.${c.part}`, content: f.content, px: f.px, py: f.py, anchor: 'centre' });
    }
  }
  const atlas = buildAtlas(frames, true);
  const R = atlas.rects;
  if (unit.icon) part.icon = R.icon;
  for (const l of ['l1', 'l2', 'l3', 'l4', 'l5']) if (R[l]) part.tiers[l] = R[l];
  for (const evo of unit.evos) part.evolutions[evo.name] = { icon: R[`evo.${evo.name}.icon`], world: R[`evo.${evo.name}.world`] };
  return { parts: { weapons: { [unit.base]: part } }, outputs: [{ file, buf: atlas.png, encoding: atlas.encoding, err: atlas.err }] };
}

function procSprite(unit, ctx) {
  const img = loadKeyed(unit.file, { target: KEY.magenta, transparent: true }, ctx);
  ctx.note(unit.id, img.info);
  const frames = [];
  for (const c of unit.cells) {
    if (c.role === 'empty') continue;
    const cell = cellOf(img, c.rect);
    const f = makeFrame(cell, boxOrReject(cell, `${unit.id} ${c.role}`), C.scale.sprite, 'centre');
    frames.push({ key: c.role, content: f.content, px: f.px, py: f.py, anchor: 'centre' });
  }
  const atlas = buildAtlas(frames, true);
  const dir = unit.id.startsWith('pk_') ? 'pickups' : 'effects';
  const file = `${dir}/${unit.id}.png`;
  const part = { atlas: file, scale: C.scale.sprite, cells: atlas.rects, source: relPath(unit.file) };
  return { parts: { [dir]: { [unit.id]: part } }, outputs: [{ file, buf: atlas.png, encoding: atlas.encoding, err: atlas.err }] };
}

// ---------- plan: units from the inventory

// Looks up a prompt output by id; the inventory is the contract, so a missing id is a bug.
function need(byId, id) { const p = byId.get(id); if (!p) throw new Error('inventory has no ' + id); return p; }
function cellsFrom(p, roleMap) {
  return (p.nominal_cells || []).map(c => ({ role: roleMap ? roleMap(c.role) : c.role, rect: c.rect_xywh }));
}
function targetOf(p) { return /00ffff/i.test(p.target_key || '') ? KEY.cyan : KEY.magenta; }
function slotName(i, role) { return i < 3 ? ['a', 'b', 'c'][i] : (/broken/.test(role) ? 'broken' : 'alt90'); }
function slot4Of(p) { const r = (p.nominal_cells || [])[3]; return r && /broken/.test(r.role) ? 'broken' : 'alt90'; }
function hintsOf(p) {
  const t = (p.prompt_notes || '') + ' ' + (p.deliverable_from_prompt || '');
  return HINT_WORDS.filter(w => new RegExp('\\b' + w, 'i').test(t));
}

// Units to build, and the status of every prompt output (used, or skipped with a reason).
function plan(inv) {
  const outs = inv.prompt_outputs, byId = new Map(outs.map(p => [p.id, p]));
  const units = [], status = new Map();
  const mark = (p, st, extra) => status.set(p.id, Object.assign({ status: st }, extra || {}));
  const skip = (p, reason) => mark(p, 'skipped', { reason });
  const DESIGN = 'design master (Step A): runtime frames come from the pose sheets';

  // hero
  const heroIds = ['hero_arda_side_sheet', 'hero_arda_front_sheet', 'hero_arda_back_sheet', 'hero_arda_hurt_down_victory_sheet'];
  const heroSheets = heroIds.map(id => {
    const p = need(byId, id), v = id.split('_')[2];
    return { src: p, view: ['side', 'front', 'back'].includes(v) ? v : null, cells: cellsFrom(p), target: targetOf(p) };
  });
  units.push({ id: 'hero_arda', artId: 'hero_arda', kind: 'hero', batch: '01-hero', sheets: heroSheets, prompts: heroIds });
  heroIds.forEach(id => mark(need(byId, id), 'used', { unit: 'hero_arda' }));
  skip(need(byId, 'hero_arda_base'), DESIGN);

  // enemies and bosses
  const bossGroups = new Map();
  for (const p of outs) {
    if (p.batch === '02-enemies' && /^enm_.+_sheet$/.test(p.id)) {
      const art = p.id.replace(/^enm_/, '').replace(/_sheet$/, '');
      const walker = /^walker_/.test(art);
      const cells = cellsFrom(p, r => (art === 'bloater' && r === 'unused_extra_pose') ? 'swollen' : r).filter(c => ENEMY_ROLES.has(c.role));
      const unit = { id: 'enemy_' + art, artId: art, kind: 'enemy', batch: '02-enemies', flying: art === 'marti',
        sheets: [{ src: p, view: null, cells, target: targetOf(p) }], prompts: [p.id],
        group: walker ? 'walker' : undefined, outfit: walker ? WALKER_OUTFITS[WALKER_OUTFITS.indexOf(art.replace('walker_', ''))] : undefined };
      units.push(unit);
      mark(p, 'used', { unit: unit.id });
      skip(need(byId, `enm_${art}_base`), DESIGN);
    } else if (p.batch === '03-bosses' && /^boss_.+_sheet[12]$/.test(p.id)) {
      const name = p.id.replace(/^boss_/, '').replace(/_sheet[12]$/, '');
      if (!bossGroups.has(name)) bossGroups.set(name, []);
      bossGroups.get(name).push(p);
    }
  }
  for (const [name, ps] of bossGroups) {
    const sheets = ps.map(p => {
      const cells = cellsFrom(p);
      const keep = /_sheet1$/.test(p.id) ? ['idle', 'walk1', 'walk2'] : ['attack_windup', 'attack_hit', 'hurt', 'dead'];
      return { src: p, view: null, cells: cells.filter(c => keep.includes(c.role)), target: targetOf(p) };
    });
    const unit = { id: 'boss_' + name, artId: 'boss_' + name, kind: 'boss', batch: '03-bosses', sheets, prompts: ps.map(p => p.id) };
    units.push(unit);
    ps.forEach(p => mark(p, 'used', { unit: unit.id }));
    skip(need(byId, `boss_${name}_base`), DESIGN);
  }

  // ground and façades
  for (const p of outs) {
    if (p.batch.startsWith('10-ground-')) {
      const hood = p.batch.slice('10-ground-'.length);
      units.push({ id: p.id, kind: 'ground', batch: p.batch, hood, variant: p.id.slice(`gnd_${hood}_`.length), src: p, prompts: [p.id] });
      mark(p, 'used', { unit: p.id });
    } else if (p.batch.startsWith('12-facades-')) {
      const hood = p.batch.slice('12-facades-'.length);
      units.push({ id: p.id, kind: 'facade', batch: p.batch, hood, variant: p.id.slice(`fac_${hood}_`.length), src: p, prompts: [p.id] });
      mark(p, 'used', { unit: p.id });
    }
  }

  // props, per hood
  const hoods = [...new Set(outs.filter(p => p.batch.startsWith('11-props-')).map(p => p.batch.slice('11-props-'.length)))];
  for (const hood of hoods) {
    const batch = '11-props-' + hood, sheets = outs.filter(p => p.batch === batch), unitId = 'props_' + hood;
    if (C.handwired.includes(hood)) {
      units.push({ id: unitId, kind: 'props', batch, hood, handwired: true, items: sheets.map(p => p.id.slice(`prop_${hood}_`.length)), prompts: sheets.map(p => p.id) });
      sheets.forEach(p => mark(p, 'skipped', { unit: unitId, reason: `hand-wired atlas (prototype/assets/${hood}/, js/view/${hood}-props.js); listed with handwired: true` }));
      continue;
    }
    const items = [], prompts = [];
    for (const p of sheets) {
      const name = p.id.slice(`prop_${hood}_`.length);
      const cellsOf = [];
      if (C.transparentSheets.includes(hood)) {
        const file = path.join(COMM, 'in', batch, `prop_${hood}_${name}_transparent.png`);
        if (!fs.existsSync(file)) reject(`missing transparent derivative ${relPath(file)}`);
        cellsFrom(p).slice(0, 4).forEach((c, i) => cellsOf.push({ slot: i + 1, name: slotName(i, c.role), file, rect: c.rect, transparent: true, sheet: p.id }));
        mark(p, 'used', { unit: unitId, via: relPath(file) });
      } else if (C.transparentFrames.includes(hood)) {
        cellsFrom(p).slice(0, 4).forEach((c, i) => {
          const suffix = i < 3 ? ['a', 'b', 'c'][i] : (/broken/.test(c.role) ? 'broken' : 'angle');
          const file = path.join(COMM, 'in', batch, 'transparent', `prop_${hood}_${name}_${suffix}.png`);
          if (!fs.existsSync(file)) reject(`missing transparent frame ${relPath(file)}`);
          cellsOf.push({ slot: i + 1, name: slotName(i, c.role), file, rect: null, transparent: true, sheet: p.id });
        });
        mark(p, 'used', { unit: unitId, via: 'transparent/ frames' });
      } else {
        cellsFrom(p).slice(0, 4).forEach((c, i) => cellsOf.push({ slot: i + 1, name: slotName(i, c.role), file: srcFile(p), rect: c.rect, transparent: false, sheet: p.id }));
        mark(p, 'used', { unit: unitId });
      }
      items.push({ name, slot4: slot4Of(p), hints: hintsOf(p), cells: cellsOf });
      prompts.push(p.id);
    }
    units.push({ id: unitId, kind: 'props', batch, hood, items, prompts });
  }

  // vehicles
  for (const p of outs.filter(q => q.batch === '13-vehicles')) {
    const id = p.id.replace(/^veh_/, '');
    units.push({ id, kind: 'vehicle', batch: p.batch, src: p, target: targetOf(p), prompts: [p.id] });
    mark(p, 'used', { unit: id });
  }

  // weapons: one unit per base weapon (icon, tiers and every evolution that comes from it)
  const bases = new Map();
  const base = name => { if (!bases.has(name)) bases.set(name, { base: name, icon: null, tiers: null, evos: [] }); return bases.get(name); };
  for (const p of outs.filter(q => q.batch === '20-weapons')) {
    let m;
    if ((m = /^wpn_(.+)_icon$/.exec(p.id))) { base(m[1]).icon = p; mark(p, 'used', { unit: 'weapon_' + m[1] }); }
    else if ((m = /^wpn_(.+)_tiers$/.exec(p.id))) { base(m[1]).tiers = p; mark(p, 'used', { unit: 'weapon_' + m[1] }); }
    else if ((m = /^wpn_evo_(.+)$/.exec(p.id))) {
      const b = EVO_BASE[m[1]];
      if (!b) reject(`evolution ${m[1]} has no base weapon in EVO_BASE`);
      base(b).evos.push({ name: m[1], src: p, cells: [{ part: 'icon', rect: p.nominal_cells[0].rect_xywh }, { part: 'world', rect: p.nominal_cells[1].rect_xywh }] });
      mark(p, 'used', { unit: 'weapon_' + b });
    } else reject('unrecognised weapon source ' + p.id);
  }
  for (const w of bases.values()) {
    units.push({ id: 'weapon_' + w.base, kind: 'weapon', batch: '20-weapons', base: w.base, icon: w.icon,
      tiers: w.tiers ? { src: w.tiers, cells: cellsFrom(w.tiers, r => (/^l[1-5]$/.test(r) ? r : 'empty')) } : null,
      evos: w.evos, prompts: [w.icon, w.tiers, ...w.evos.map(e => e.src)].filter(Boolean).map(p => p.id) });
  }

  // pickups and effects, from the transparent derivatives
  for (const p of outs.filter(q => q.batch === '21-pickups-effects')) {
    const file = path.join(COMM, 'in', '21-pickups-effects-transparent', p.id + '.png');
    if (!fs.existsSync(file)) reject(`missing transparent derivative ${relPath(file)}`);
    units.push({ id: p.id, kind: 'sprite', batch: p.batch, file, cells: cellsFrom(p), prompts: [p.id] });
    mark(p, 'used', { unit: p.id, via: relPath(file) });
  }

  for (const p of outs) {
    if (status.has(p.id)) continue;
    if (p.batch === '00-style') skip(p, 'style reference (art direction), not a runtime asset');
    else throw new Error('no rule for prompt output ' + p.id);
  }
  return { units, status };
}

// Source files a unit depends on (hashed for the cache).
function sourceFiles(u) {
  if (u.kind === 'hero' || u.kind === 'enemy' || u.kind === 'boss') return u.sheets.map(s => srcFile(s.src));
  if (u.kind === 'ground' || u.kind === 'facade') return [srcFile(u.src)];
  if (u.kind === 'vehicle') return [srcFile(u.src)];
  if (u.kind === 'props') return u.handwired ? [] : u.items.flatMap(it => it.cells.map(c => c.file));
  if (u.kind === 'weapon') return [u.icon && srcFile(u.icon), u.tiers && srcFile(u.tiers.src), ...u.evos.map(e => srcFile(e.src))].filter(Boolean);
  if (u.kind === 'sprite') return [u.file];
  return [];
}

// ---------- recipe, cache, run

let RECIPE = null;
function recipeHash() {
  if (!RECIPE) {
    RECIPE = crypto.createHash('sha256')
      .update(fs.readFileSync(__filename)).update(fs.readFileSync(path.join(__dirname, 'lib-art-image.js')))
      .update(fs.readFileSync(path.join(__dirname, 'lib-art-frames.js'))).update(JSON.stringify(EVO_BASE)).digest('hex');
  }
  return RECIPE;
}
function loadCache(dst) {
  const f = path.join(dst, '.cache.json');
  if (!fs.existsSync(f)) return {};
  try { const j = JSON.parse(fs.readFileSync(f, 'utf8')); return j.recipe === recipeHash() ? (j.units || {}) : {}; } catch (e) { return {}; }
}
function writeFileSafe(full, buf) { fs.mkdirSync(path.dirname(full), { recursive: true }); fs.writeFileSync(full, buf); }

// Builds (or reuses) every unit. Returns the plan, the per-unit results and the report lists.
function run(opts) {
  const inv = JSON.parse(fs.readFileSync(INVENTORY, 'utf8'));
  const { units, status } = plan(inv);
  const cache = opts.force ? {} : loadCache(opts.dst);
  const rep = { built: 0, reused: 0, notBuilt: 0, rejected: [], warnings: [], list: [] };
  const results = new Map();
  for (const u of units) {
    const srcInfo = sourceFiles(u).filter(f => fs.existsSync(f)).map(f => ({ path: relPath(f), sha256: sha256(fs.readFileSync(f)) }));
    u.sig = sha256(Buffer.from(recipeHash() + JSON.stringify({ id: u.id, kind: u.kind, srcInfo, items: u.items ? u.items.map(i => i.name) : null, target: u.target ? u.target.join(',') : null })));
    if (opts.list) { rep.list.push(`${u.id.padEnd(30)} ${u.kind.padEnd(8)} ${u.batch.padEnd(24)} ${srcInfo.length} source file(s)`); continue; }
    if (u.handwired) { results.set(u.id, { status: 'handwired', part: { props: { [u.hood]: { handwired: true, items: u.items } } }, files: [], warnings: [] }); continue; }
    const hit = cache[u.id];
    const fresh = hit && hit.sig === u.sig && (hit.files || []).every(f => fs.existsSync(path.join(opts.dst, f.file)) && fs.statSync(path.join(opts.dst, f.file)).size === f.bytes);
    if (fresh) { results.set(u.id, Object.assign({ fromCache: true }, hit)); rep.reused++; continue; }
    if (opts.only && !(opts.only.includes(u.batch) || opts.only.includes(u.id))) { results.set(u.id, { status: 'not-built' }); rep.notBuilt++; continue; }
    const warnings = [], notes = [];
    const ctx = { warn: m => warnings.push(m), note: (who, info) => notes.push({ who, info }) };
    try {
      const r = u.kind === 'ground' ? procGround(u, ctx) : u.kind === 'facade' ? procFacade(u, ctx) : u.kind === 'props' ? procProps(u, ctx) :
        u.kind === 'vehicle' ? procVehicle(u, ctx) : u.kind === 'weapon' ? procWeapon(u, ctx) : u.kind === 'sprite' ? procSprite(u, ctx) :
        procCharacter(u, ctx);
      for (const n of notes) {
        const st = n.info && n.info.stats;
        if (st && st.keptEnclosed) warnings.push(`${n.who}: ${st.keptEnclosed} enclosed matte region(s) too large to clear, kept`);
      }
      const holes = notes.reduce((a, n) => a + ((n.info && n.info.stats && n.info.stats.pockets) || 0), 0);
      const fringe = notes.reduce((a, n) => a + ((n.info && n.info.stats && n.info.stats.fringeFixed) || 0), 0);
      results.set(u.id, { status: 'ok', sig: u.sig, files: r.outputs.map(o => ({ file: o.file, bytes: o.buf.length, sha256: sha256(o.buf), encoding: o.encoding || null, err: o.err || null })),
        part: r.parts, warnings, outputs: r.outputs, holes, fringe });
      rep.built++;
    } catch (e) {
      if (!(e instanceof Reject)) throw e;
      results.set(u.id, { status: 'rejected', sig: u.sig, reason: e.message, files: [], warnings });
    }
  }
  for (const u of units) {
    const r = results.get(u.id);
    if (!r) continue;
    if (r.status === 'rejected') rep.rejected.push(`${u.id}: ${r.reason}`);
    for (const w of r.warnings || []) rep.warnings.push(`${u.id}: ${w}`);
  }
  return { units, status, results, rep, inv };
}

// Builds the manifest from the unit results and the inventory.
function assemble(R) {
  const { units, status, results, inv } = R;
  const m = {
    schema: 1, tool: 'prototype/tools/prepare-art.js', recipe: recipeHash().slice(0, 16), root: 'prototype/assets/art/',
    inventory: { file: 'art/commission/asset-inventory.json', repositoryHead: inv.repository_head, auditDate: inv.audit_date },
    conventions: {
      px: 'pivot in atlas pixels, relative to the frame rect top-left (x, y). Draw at (dx - px, dy - py). The rect is the content only; the gutter lies outside it.',
      anchors: { feet: 'ground contact: bottom centre of the lowest 3% of the figure', body: 'centre of the figure box (dead, down, flying)',
        bottom: 'bottom centre of the vehicle', centre: 'source cell centre (weapons, pickups, effects)' },
      scale: 'atlas px per source px. The display scale is based on idle heightPx. Boss action frames include poseScale to match the body scale of the locomotion sheet.',
      facing: 'side views face right; mirror at runtime for left. The hero front view faces the camera (down), back away (up).',
      encoding: `png8 = 256-colour palette PNG, chosen when colourError.over8 <= ${C.paletteMaxOver8}; png32 = RGBA. colourError is measured on alpha >= 128 pixels: over8 is the share off by more than 8 levels in any channel.` },
    characters: {}, ground: {}, facades: {}, props: {}, weapons: {}, pickups: {}, effects: {}, vehicles: {},
  };
  const files = {};
  for (const u of units) {
    const r = results.get(u.id);
    if (!r || !r.part) continue;
    for (const [cat, entries] of Object.entries(r.part)) for (const [k, v] of Object.entries(entries)) m[cat][k] = v;
    for (const f of r.files || []) files[f.file] = { bytes: f.bytes, sha256: f.sha256, ...(f.encoding ? { encoding: f.encoding } : {}),
      ...(f.err ? { colourError: { over8: f.err.over8, p99: f.err.p99, max: f.err.max } } : {}) };
  }
  const sources = [];
  for (const p of inv.prompt_outputs) {
    const st = status.get(p.id) || { status: 'missing' };
    const r = st.unit ? results.get(st.unit) : null;
    let s = st.status === 'used' ? (r ? (r.status === 'ok' || r.status === 'rejected' ? (r.status === 'ok' ? 'used' : 'rejected') : (r.status === 'handwired' ? 'skipped' : 'not-built')) : 'not-built') : st.status;
    if (st.status === 'used' && r && r.status === 'ok' && (!r.files || !r.files.length)) s = 'used';
    sources.push({ id: p.id, batch: p.batch, path: p.path, status: s, unit: st.unit || null, via: st.via || null,
      reason: s === 'skipped' ? st.reason : s === 'rejected' ? r.reason : s === 'not-built' ? 'outside --only and not cached' : null });
  }
  m.sources = sources;
  m.files = Object.fromEntries(Object.keys(files).sort().map(k => [k, files[k]]));
  const categoryBytes = {};
  for (const f of Object.keys(m.files)) categoryBytes[cat3(f)] = (categoryBytes[cat3(f)] || 0) + m.files[f].bytes;
  const totalBytes = Object.values(categoryBytes).reduce((a, b) => a + b, 0);
  m.budget = { limitBytes: BUDGET_BYTES, goalBytes: GOAL_BYTES, totalBytes, categoryBytes };
  return m;
}
function cat3(file) { return file.split('/')[0]; }

function summary(a) {
  const v = a.filter(x => typeof x === 'number' && isFinite(x)).sort((x, y) => x - y);
  if (!v.length) return '-';
  const q = p => v[Math.min(v.length - 1, Math.floor(p * (v.length - 1)))];
  return `min ${q(0)} / median ${q(0.5)} / max ${q(1)}`;
}
function printReport(R, m) {
  const lines = [];
  const count = st => m.sources.filter(s => s.status === st).length;
  lines.push(`prepare-art: ${m.sources.length} prompt outputs: ${count('used')} used, ${count('skipped')} skipped, ${count('rejected')} rejected, ${count('not-built')} not built`);
  lines.push(`units: ${R.rep.built} built, ${R.rep.reused} reused from cache, ${R.rep.notBuilt} not built`);
  lines.push('');
  lines.push('category     files        size');
  const cats = ['characters', 'ground', 'facades', 'props', 'weapons', 'pickups', 'effects', 'vehicles'];
  for (const c of cats) {
    const fl = Object.keys(m.files).filter(f => cat3(f) === c);
    const bytes = fl.reduce((a, f) => a + m.files[f].bytes, 0);
    lines.push(`${c.padEnd(12)} ${String(fl.length).padStart(5)}  ${(bytes / MB).toFixed(2).padStart(9)} MiB`);
  }
  const over = m.budget.totalBytes > BUDGET_BYTES;
  lines.push(`${'total'.padEnd(12)} ${String(Object.keys(m.files).length).padStart(5)}  ${(m.budget.totalBytes / MB).toFixed(2).padStart(9)} MiB` +
    `   (limit 60 MiB, goal 30-40 MiB${over ? ', OVER BUDGET' : ''})`);
  lines.push('');
  const ch = Object.values(m.characters);
  if (ch.length) lines.push(`characters: ${ch.length} entities; heightPx ${summary(ch.map(c => c.heightPx))}; scale ${summary(ch.map(c => c.scale))}`);
  const g = Object.values(m.ground);
  if (g.length) {
    lines.push(`ground: ${g.length} tiles; seam score ${summary(g.map(t => t.seamScore))}; mean L* ${summary(g.map(t => t.lstar))}`);
    const flagged = g.filter(t => t.seamScore > C.seamPoor || t.lstar < C.lstarMin || t.lstar > C.lstarMax);
    flagged.forEach(t => lines.push(`  flagged ${t.id}: seam ${t.seamScore}, L* ${t.lstar}`));
  }
  const handwired = Object.entries(m.props).filter(([, v]) => v.handwired).map(([k]) => k);
  if (handwired.length) lines.push(`props: hand-wired (not emitted): ${handwired.join(', ')}`);
  if (R.rep.rejected.length) { lines.push(`REJECTED (${R.rep.rejected.length}):`); R.rep.rejected.forEach(r => lines.push('  ' + r)); }
  if (R.rep.warnings.length) { lines.push(`warnings (${R.rep.warnings.length}):`); R.rep.warnings.forEach(w => lines.push('  ' + w)); }
  return lines.join('\n');
}

function removeStale(dst, oldManifest, files) {
  if (!oldManifest || !oldManifest.files) return [];
  const gone = Object.keys(oldManifest.files).filter(f => !files[f]);
  for (const f of gone) { const p = path.join(dst, f); if (fs.existsSync(p)) fs.unlinkSync(p); }
  return gone;
}

function parseArgs(argv) {
  const o = { dryRun: false, force: false, dst: DEFAULT_DST, only: null };
  for (const a of argv) {
    let m;
    if (a === '--dry-run') o.dryRun = true;
    else if (a === '--list') o.list = true;
    else if (a === '--force') o.force = true;
    else if ((m = /^--dst=(.+)$/.exec(a))) o.dst = path.resolve(m[1]);
    else if ((m = /^--sheets=(.+)$/.exec(a))) o.sheets = path.resolve(m[1]);
    else if ((m = /^--only=(.+)$/.exec(a))) o.only = m[1].split(',').map(s => s.trim()).filter(Boolean);
    else if (a === '--help' || a === '-h') o.help = true;
    else throw new Error('unknown option ' + a);
  }
  return o;
}

function main(argv) {
  let opts;
  try { opts = parseArgs(argv); } catch (e) { console.error(e.message); return 1; }
  if (opts.help) {
    console.log('Usage: node prototype/tools/prepare-art.js [--dry-run] [--only=batch,...] [--list] [--force] [--dst=DIR] [--sheets=DIR]');
    return 0;
  }
  const R = run(opts);
  if (opts.list) { console.log(R.rep.list.join('\n')); console.log(`${R.units.length} units`); return 0; }
  const manifestFile = path.join(opts.dst, 'manifest.json');
  const oldManifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : null;
  const m = assemble(R);
  if (!opts.dryRun) {
    for (const r of R.results.values()) if (r.status === 'ok' && r.outputs) for (const o of r.outputs) writeFileSafe(path.join(opts.dst, o.file), o.buf);
    removeStale(opts.dst, oldManifest, m.files);
    writeFileSafe(path.join(opts.dst, '.gitignore'), '.cache.json\n');
    writeFileSafe(manifestFile, JSON.stringify(m, null, 1) + '\n');
    writeFileSafe(path.join(opts.dst, 'manifest-local.js'), require('./art-manifest-local')(m));
    const units = {};
    for (const u of R.units) {
      const r = R.results.get(u.id);
      if (!r || r.status === 'not-built' || r.status === 'handwired') continue;
      units[u.id] = { sig: r.sig || u.sig, status: r.status, reason: r.reason || null, files: r.files || [], part: r.part || null, warnings: r.warnings || [] };
    }
    writeFileSafe(path.join(opts.dst, '.cache.json'), JSON.stringify({ recipe: recipeHash(), units }) + '\n');
    if (opts.sheets) writeContactSheets(opts.sheets, opts.dst, m.characters);
  }
  console.log(printReport(R, m));
  if (opts.dryRun) console.log('(dry run: nothing written)');
  return R.rep.rejected.length ? 1 : 0;
}

module.exports = { plan, procCharacter, procGround, procProps, makeFrame, buildAtlas, loadKeyed, cellOf, srcFile, EVO_BASE, C, assemble, run, recipeHash, summary };

if (require.main === module) process.exitCode = main(process.argv.slice(2));
