// Raster items tests (D-066; view only, URL flag ?art=raster). Node vm, no browser. Checks:
//  1. The manifest and the mapping agree: every view theme that is not handwired maps to a manifest hood, every mapped item,
//     vehicle, loot, passive and effect cell exists, and the unused manifest entries are the documented ones.
//  2. Flag off, and flag on with the manifest failing or pending: every hook returns false (or '') with no ctx call and no image
//     request, so the caller keeps its code art.
//  3. Ready: props draw from the hood atlas at the manifest cell, scale (cellPx x scale) and feet pivot; vehicles turn a quarter
//     turn with their length along the street; pickups, splats, chips and dust use their cells and sizes; the splat setting
//     keeps the ink splat; a card icon whose atlas is still decoding retries a bounded number of times and then shows the raster.
//  4. Weapon icons: every weapon in P.CFG.wtier.weapons at tiers 1..5, and every evolution in P.CFG.evolutions, resolves.
// Usage: node prototype/tools/test-art-raster-items.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/art/manifest.json'), 'utf8'));
const CONFIG_FILES = ['config.js', 'config-feel.js', 'config-env.js', 'config-weapons.js', 'config-weapons3.js', 'config-weapon-tiers.js', 'journey.js'];
const RASTER_FILES = ['view/art-raster.js', 'view/art-raster-items.js', 'view/vehicles.js', 'view/render-world.js', 'view/street-weapon-fx.js'];
// Documented, independent copies: a new unused entry, or a mapping that drops one, fails here.
const HANDWIRED = ['galata', 'bridge', 'saray'];
const UNUSED_VEHICLES = ['tram_red', 'scooter_kurye', 'truck_delivery'];
const USED_LOOT = ['simit', 'jeton', 'chest_closed', 'heal_cross', 'objective_pin'];
const UNUSED_DUST = ['smoke_a', 'smoke_b', 'ash_a', 'ash_b'];
const fails = [], passes = [];
function ok(cond, msg) { (cond ? passes : fails).push(msg); }
const near = (a, b) => typeof a === 'number' && Math.abs(a - b) < 1e-6;
const tick = async () => { for (let i = 0; i < 8; i++) await new Promise((r) => setImmediate(r)); };

// Recording 2D context: every call goes into log as {tag, name, args}; reads of unknown members return a logging function.
function recCtx(log, tag) {
  const st = { globalAlpha: 1, globalCompositeOperation: 'source-over', lineWidth: 1, lineCap: 'butt', font: '', textAlign: 'start', fillStyle: '#000', strokeStyle: '#000' };
  return new Proxy(st, {
    get(t, k) {
      if (k in t || typeof k !== 'string' || k === 'getTransform') return t[k];
      return (...args) => { log.push({ tag, name: k, args }); return k.indexOf('create') === 0 ? { addColorStop() {} } : undefined; };
    },
    set(t, k, v) { t[k] = v; log.push({ tag, name: 'set:' + k, args: [v] }); return true; },
  });
}

// A sandbox world with the config files, the raster runtime and the items module. o.raster: the flag. o.manifest: 'ok' serves the
// manifest, 'fail' rejects it, 'pending' never answers. o.images: 'load' (every image decodes at once) or 'defer' (the test does it).
function world(o) {
  const log = [], imgs = [], timers = [], canvases = [];
  const Img = function () { this.complete = false; this.naturalWidth = 0; imgs.push(this); };
  Object.defineProperty(Img.prototype, 'src', {
    get() { return this.__src; },
    set(v) { this.__src = v; if (o.images === 'load') { this.complete = true; this.naturalWidth = 256; } },
  });
  const canvas = () => {
    const cv = { width: 0, height: 0, getContext: () => recCtx(log, 'bake'), toDataURL: () => 'data:image/png;base64,stub' };
    canvases.push(cv); return cv;
  };
  const fetchStub = o.manifest === 'ok' ? () => Promise.resolve({ ok: true, json: () => Promise.resolve(MANIFEST) })
    : o.manifest === 'fail' ? () => Promise.reject(new Error('offline')) : () => new Promise(() => {});
  const sb = {
    console, Math, JSON, Array, Object, String, Number, Boolean, Set, Map, Proxy, Symbol, Error, Promise, URL, URLSearchParams,
    parseInt, parseFloat, isNaN, isFinite, Float32Array, Uint8Array, setImmediate,
    setTimeout: (fn) => { timers.push(fn); return timers.length; }, clearTimeout() {},
    performance: { now: () => 1000 }, location: { search: o.raster ? '?art=raster' : '?art=current', protocol: 'http:' },
    Image: Img, fetch: fetchStub,
    document: { currentScript: { src: 'http://127.0.0.1/js/view/art-raster.js' }, createElement: (tag) => (tag === 'canvas' ? canvas() : {}),
      addEventListener() {}, getElementById: () => null },
  };
  sb.window = sb; sb.self = sb; sb.globalThis = sb;
  sb.P = { Settings: {}, Icons: { svg: (id, px) => '<svg data-id="' + id + '" width="' + px + '"></svg>' } };
  vm.createContext(sb);
  CONFIG_FILES.concat(RASTER_FILES).forEach((f) => vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), sb, { filename: f }));
  return { P: sb.P, log, imgs, timers, canvases, ctx: () => recCtx(log, 'main') };
}
async function start(o) { const w = world(o); if (o.raster) { w.P.ArtRaster.prepare(); await tick(); } return w; }
// A recording render context with the game's scale (metres to px) and a fixed origin.
const rctx = (w) => ({ ctx: w.ctx(), ppm: 39, X: (x) => 100 + x * 39, Y: (y) => 200 - y * 39 });
const mainCalls = (log, from) => log.slice(from).filter((e) => e.tag === 'main');
const drawsOf = (log, from) => mainCalls(log, from).filter((e) => e.name === 'drawImage' && e.args[0] && e.args[0].__src);
const srcOf = (e) => String(e.args[0].__src);
const longest = (e) => Math.max(e.args[7], e.args[8]);
// The translate call before a drawImage: the point place() moved the origin to.
function translateBefore(log, e) {
  for (let j = log.indexOf(e); j >= 0; j--) if (log[j].tag === 'main' && log[j].name === 'translate') return log[j].args;
  return null;
}
const rectOf = (c) => [c.x, c.y, c.w, c.h];
const sameRect = (e, c) => { const r = [e.args[1], e.args[2], e.args[3], e.args[4]]; return rectOf(c).every((v, i) => v === r[i]); };

async function mappingPart() {
  const w = await start({ raster: false });
  const K = w.P.ArtRasterItems.config, hoods = Object.keys(MANIFEST.props);
  const mapped = Object.keys(K.themeHood).map((t) => K.themeHood[t]);
  ok(new Set(mapped).size === mapped.length, 'mapping: each view theme maps to a distinct hood');
  ok(mapped.every((h) => !!MANIFEST.props[h] && !!MANIFEST.props[h].items), 'mapping: every mapped hood exists in the manifest with items');
  const unmapped = hoods.filter((h) => HANDWIRED.indexOf(h) < 0 && mapped.indexOf(h) < 0);
  ok(unmapped.length === 0, 'mapping: every non-handwired manifest hood is mapped (' + unmapped.join(',') + ')');
  const themes = w.P.Journey.hoods.map((h) => h.theme);
  ok(Object.keys(K.themeHood).every((t) => themes.indexOf(t) >= 0), 'mapping: every mapped theme is a journey theme');
  ok(themes.filter((t) => !K.themeHood[t]).every((t) => HANDWIRED.indexOf(t) >= 0), 'mapping: every other journey theme is handwired');
  const names = new Set(); hoods.forEach((h) => Object.keys(MANIFEST.props[h].items || {}).forEach((n) => names.add(n)));
  const cands = [].concat(...Object.keys(K.propItems).map((k) => K.propItems[k]));
  const missing = cands.filter((n, i) => cands.indexOf(n) === i && !names.has(n));
  ok(missing.length === 0, 'mapping: every candidate prop item exists in some hood (missing: ' + missing.join(',') + ')');
  const vehUsed = Object.keys(K.vehicleOf).map((k) => K.vehicleOf[k]);
  ok(vehUsed.every((v) => !!MANIFEST.vehicles[v]), 'mapping: every mapped vehicle exists in the manifest');
  const vehUnused = Object.keys(MANIFEST.vehicles).filter((v) => vehUsed.indexOf(v) < 0);
  ok(JSON.stringify(vehUnused) === JSON.stringify(UNUSED_VEHICLES), 'mapping: unused vehicles are the documented ones (' + vehUnused.join(',') + ')');
  const loot = Object.keys(MANIFEST.pickups.pk_loot_consumables.cells);
  ok(USED_LOOT.every((n) => loot.indexOf(n) >= 0), 'mapping: the mapped consumables exist in pk_loot_consumables');
  ok(Object.keys(MANIFEST.pickups.pk_passive_icons.cells).length === 12, 'mapping: 12 passive icon cells (all used by the icon helper)');
  const dust = Object.keys(MANIFEST.effects.fx_dust_smoke.cells).filter((c) => ['dust_a', 'dust_b'].indexOf(c) < 0);
  ok(JSON.stringify(dust) === JSON.stringify(UNUSED_DUST), 'mapping: the dust cells used are dust_a and dust_b (smoke and ash unused)');
  ok(!!MANIFEST.effects.fx_hit_sparks, 'mapping: fx_hit_sparks exists and stays procedural (documented in the module header)');
  const wids = Object.keys(w.P.CFG.wtier.weapons);
  wids.forEach((id) => {
    const e = MANIFEST.weapons[id];
    ok(!!e && !!e.icon && [1, 2, 3, 4, 5].every((lv) => !!e.tiers['l' + lv]), 'icons: weapon ' + id + ' has its icon and tiers l1..l5');
  });
  Object.keys(w.P.CFG.evolutions).forEach((id) => {
    const from = w.P.CFG.evolutions[id].from, e = MANIFEST.weapons[from];
    ok(!!e && !!e.evolutions && !!e.evolutions[id] && !!e.evolutions[id].icon, 'icons: evolution ' + id + ' has an icon cell under ' + from);
  });
}

async function flagOffPart() {
  const w = await start({ raster: false });
  const I = w.P.ArtRasterItems, R0 = rctx(w), c = R0.ctx;
  const res = [I.block(R0, 'cart', 1, 2, { theme: 'istiklal', w: 1.6, h: 1.6 }), I.block(R0, 'car', 1, 2, { theme: 'istiklal', w: 1.8, h: 4.5 }),
    I.xp(c, 1, 1, 2, 39), I.pickup(c, 'simit', 1, 1, 24),
    I.fxPart(R0, { kind: 'splat', r: 0.5, x: 1, y: 1, seed: 0.2 }, 0.5), I.fxPart(R0, { kind: 'dust', x: 1, y: 1, ri: 0 }, 0.5)];
  ok(res.every((v) => v === false), 'flag off: every draw hook returns false');
  ok(w.log.length === 0 && w.imgs.length === 0, 'flag off: no ctx call and no image request');
  const box = { innerHTML: '', isConnected: true };
  I.iconInto(box, 'knife', 1, 40);
  ok(box.innerHTML === '<svg data-id="knife" width="40"></svg>' && w.timers.length === 0, 'flag off: the box shows the code icon and queues no retry');
  ok(I.icon('knife', 1, 40) === '' && I.itemOf('istiklal', 'cart') === false, 'flag off: icon() and itemOf() are empty');
}

async function notReadyPart() {
  for (const mode of ['fail', 'pending']) {
    const w = await start({ raster: true, manifest: mode });
    const I = w.P.ArtRasterItems, R0 = rctx(w), c = R0.ctx;
    const res = [I.block(R0, 'cart', 1, 2, { theme: 'istiklal', w: 1.6, h: 1.6 }), I.xp(c, 1, 1, 2, 39),
      I.pickup(c, 'simit', 1, 1, 24), I.fxPart(R0, { kind: 'splat', r: 0.5, x: 1, y: 1, seed: 0.2 }, 0.5)];
    ok(res.every((v) => v === false) && w.log.length === 0 && w.imgs.length === 0 && I.icon('knife', 1, 40) === '',
      'not ready (manifest ' + mode + '): hooks return false, no ctx call, no image request, empty icons');
  }
}

async function drawPart() {
  const w = await start({ raster: true, manifest: 'ok', images: 'load' });
  const I = w.P.ArtRasterItems, K = I.config, A = w.P.ArtRaster, R0 = rctx(w), c = R0.ctx;
  ok(A.ready('props') && A.ready('vehicles') && A.ready('pickups') && A.ready('effects') && A.ready('weapons'), 'ready: all categories load');
  // Props: the feet pivot lands on the footprint centre; scale is the hood's atlas pixels per metre.
  let from = w.log.length;
  ok(I.block(R0, 'cart', 1, 2, { theme: 'istiklal', w: 1.6, h: 1.6, k: 0 }), 'props: a cart in istiklal draws');
  const hood = MANIFEST.props.istiklal, cell = hood.items.simitcart.cells.a, s = R0.ppm / (hood.cellPx * hood.scale);
  const d = drawsOf(w.log, from)[0], t = d && translateBefore(w.log, d);
  ok(!!d && srcOf(d).endsWith('props/istiklal.png') && sameRect(d, cell), 'props: drawn from the hood atlas at the manifest cell a');
  ok(!!t && near(t[0], R0.X(1) - cell.px * s + cell.w * s / 2) && near(t[1], R0.Y(2) - cell.py * s + cell.h * s / 2),
    'props: the feet pivot (px, py) lands on the footprint centre');
  ok(!!d && near(d.args[7], cell.w * s) && near(d.args[8], cell.h * s), 'props: drawn at atlas px per metre (cellPx x scale)');
  // A stall uses the very same district image and variant while held and in flight.
  w.P.Themes = { get: id => ({ id }) };
  w.P.Props = { draw: (kind, R, x, y, o) => I.block(R, kind, x, y, o) };
  const b = { x: 2, y: 4, w: 1.8, h: 1.6, kind: 'lx_stall', v: .4 };
  const world = { theme: 'eminonu', hero: { x: 1, y: 4 }, streetWeapon: { phase: 'lift', t: .2, aim: 0, r: { b, x: b.x, y: b.y } } };
  const stallFrames = [() => w.P.RenderWorld.blockProp(R0, world, b, false), () => w.P.StreetWeaponFx.held(R0, world), () => {
    Object.assign(world.streetWeapon, { phase: 'flight', from: world.hero, to: { x: 0, y: 6 } });
    w.P.StreetWeaponFx.air(R0, world);
  }];
  for (const draw of stallFrames) {
    from = w.log.length;
    draw();
    const stall = drawsOf(w.log, from)[0];
    ok(!!stall && srcOf(stall).endsWith('props/eminonu.png') && sameRect(stall, MANIFEST.props.eminonu.items.spicestall.cells.b),
      'spice stall: grounded, held and flying share the same illustrated cell');
  }
  // Vehicles: the art is landscape; a quarter turn puts its length along the street, its breadth from K.across.
  from = w.log.length;
  ok(I.block(R0, 'car', 1, 2, { theme: 'istiklal', w: 1.8, h: 4.5 }), 'vehicles: a car draws from its frame');
  const cd = drawsOf(w.log, from)[0];
  ok(!!cd && near(cd.args[7], 4.5 * R0.ppm) && near(cd.args[8], 1.8 * R0.ppm / K.across), 'vehicles: length along the footprint, breadth from K.across');
  ok(mainCalls(w.log, from).some((e) => e.name === 'rotate' && near(e.args[0], Math.PI / 2)), 'vehicles: rotated a quarter turn');
  from = w.log.length;
  ok(I.block(R0, 'ferry', 1, 2, { theme: 'istiklal' }) && near(drawsOf(w.log, from)[0].args[7], MANIFEST.vehicles.ferry.metres.long * R0.ppm),
    'vehicles: a boat without a footprint takes the manifest metres');
  from = w.log.length;
  w.P.Vehicles.drawCar(R0, 0, 0, 12, 2.6);
  const tramDraw = mainCalls(w.log, from).find((e) => e.name === 'drawImage');
  ok(tramDraw && !tramDraw.args[0].__src && near(tramDraw.args[1], R0.X(-1.6)) && near(tramDraw.args[2], R0.Y(12.3)),
    'vehicles: roof-first tram uses a canvas aligned to the track');
  drawPickups(w, I, K, R0, c);
  drawEffects(w, I, K, R0, c);
}

function drawPickups(w, I, K, R0, c) {
  let from = w.log.length;
  ok(I.xp(c, 50, 60, 2, R0.ppm) && near(longest(drawsOf(w.log, from)[0]), K.xpM.small * R0.ppm), 'pickups: a small XP gem at its size');
  from = w.log.length;
  ok(I.xp(c, 50, 60, 14, R0.ppm) && near(longest(drawsOf(w.log, from)[0]), K.xpM.large * R0.ppm), 'pickups: a large XP gem at 14 XP');
  from = w.log.length;
  ok(I.pickup(c, 'simit', 50, 60, 24) && near(longest(drawsOf(w.log, from)[0]), 24) &&
    sameRect(drawsOf(w.log, from)[0], MANIFEST.pickups.pk_loot_consumables.cells.simit), 'pickups: simit at its cell, 24 px');
  ok(I.pickup(c, 'hurda', 1, 1, 24) === false, 'pickups: an unmapped consumable draws nothing');
}

function drawEffects(w, I, K, R0, c) {
  const splats = MANIFEST.effects.fx_blood_splats.cells, chips = MANIFEST.effects.fx_rubble_chips.cells;
  let from = w.log.length;
  ok(I.fxPart(R0, { kind: 'splat', r: 0.5, x: 1, y: 1, seed: 0.2 }, 0.5) && sameRect(drawsOf(w.log, from)[0], splats.medium_a),
    'effects: a 0.5 m splat uses the medium cell');
  from = w.log.length;
  ok(I.fxPart(R0, { kind: 'splat', r: 0.12, x: 1, y: 1, seed: 0.8 }, 0.5) && sameRect(drawsOf(w.log, from)[0], splats.small_b),
    'effects: a small splat uses the small b cell');
  w.P.Settings.blood = false;
  from = w.log.length;
  ok(I.fxPart(R0, { kind: 'splat', r: 0.5, x: 1, y: 1, seed: 0.2 }, 0.5) === false && drawsOf(w.log, from).length === 0,
    'effects: the ink setting keeps the code splat');
  w.P.Settings.blood = undefined;
  from = w.log.length;
  ok(I.fxPart(R0, { kind: 'shard', col: 'wood', x: 1, y: 1, ri: 0 }, 1) && sameRect(drawsOf(w.log, from)[0], chips.wood_a) &&
    near(longest(drawsOf(w.log, from)[0]), K.chipM * R0.ppm), 'effects: a wood chip at the chip size');
  from = w.log.length;
  ok(I.fxPart(R0, { kind: 'shard', col: 'glass', x: 1, y: 1, ri: 1 }, 1) && sameRect(drawsOf(w.log, from)[0], chips.plaster_b),
    'effects: a glass chip uses the plaster cell');
  from = w.log.length;
  ok(I.fxPart(R0, { kind: 'dust', x: 1, y: 1, ri: 0 }, 0.5) && sameRect(drawsOf(w.log, from)[0], MANIFEST.effects.fx_dust_smoke.cells.dust_a) &&
    near(longest(drawsOf(w.log, from)[0]), 0.5 * (1.5 - 0.5) * K.puffK * R0.ppm), 'effects: a dust puff at the render.js radius');
  ok(I.fxPart(R0, { kind: 'hit', x: 1, y: 1 }, 0.5) === false, 'effects: other particle kinds stay procedural');
}

async function iconPart() {
  const w = await start({ raster: true, manifest: 'ok', images: 'load' });
  const I = w.P.ArtRasterItems;
  const html = I.icon('knife', 1, 40);
  ok(html.indexOf('<img src="data:') === 0 && html.indexOf('width="40"') > 0, 'icons: a knife tier 1 card icon is an <img> at 40 px');
  const before = w.canvases.length;
  ok(I.icon('knife', 1, 40) === html && w.canvases.length === before, 'icons: the data URL is cached (no second canvas)');
  ok(I.icon('no_such_item', 0, 40) === '', 'icons: an unknown id is empty');
  const wids = Object.keys(w.P.CFG.wtier.weapons);
  const misses = [];
  wids.forEach((id) => [1, 2, 3, 4, 5].forEach((lv) => { if (!I.icon(id, lv, 40)) misses.push(id + ' L' + lv); }));
  ok(misses.length === 0, 'icons: every weapon at tiers 1..5 resolves (' + misses.join(',') + ')');
  const emiss = Object.keys(w.P.CFG.evolutions).filter((id) => !I.icon(id, 0, 40));
  ok(emiss.length === 0, 'icons: every evolution in P.CFG.evolutions resolves (' + emiss.join(',') + ')');
  const pmiss = Object.keys(MANIFEST.pickups.pk_passive_icons.cells).filter((id) => !I.icon(id, 0, 40));
  ok(pmiss.length === 0, 'icons: every passive icon cell resolves');
}

async function racePart() {
  const w = await start({ raster: true, manifest: 'ok', images: 'defer' });
  const I = w.P.ArtRasterItems;
  const box = { innerHTML: '', isConnected: true };
  I.iconInto(box, 'knife', 1, 40);
  ok(box.innerHTML.indexOf('<svg') < 0 && box.innerHTML.indexOf('<span') === 0 && w.timers.length === 1, 'race: decoding keeps a neutral slot instead of retired artwork and queues one retry');
  w.imgs.forEach((im) => { im.complete = true; im.naturalWidth = 256; });
  w.timers.shift()();
  ok(box.innerHTML.indexOf('<img src="data:') === 0, 'race: the retry swaps in the raster icon once the atlas has decoded');
  const wn = await start({ raster: true, manifest: 'ok', images: 'defer' });
  const b2 = { innerHTML: '', isConnected: true };
  wn.P.ArtRasterItems.iconInto(b2, 'knife', 1, 40);
  let pumps = 0;
  while (wn.timers.length && pumps < 1000) { wn.timers.shift()(); pumps++; }
  ok(pumps === wn.P.ArtRasterItems.config.iconRetry.max, 'race: the retry is bounded (' + pumps + ' retries)');
}

(async () => {
  await mappingPart();
  await flagOffPart();
  await notReadyPart();
  await drawPart();
  await iconPart();
  await racePart();
  console.log(fails.length ? fails.length + ' failure(s)' : 'test-art-raster-items: all pass (' + passes.length + ' checks)');
  fails.forEach((f) => console.log('FAIL ' + f));
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error('test-art-raster-items crashed:', e); process.exit(1); });
