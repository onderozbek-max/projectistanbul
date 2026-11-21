// Raster ground tiles and facades (D-066; view only, URL flag ?art=raster; js/view/art-raster-world.js, hooks in render-world.js).
// Two parts:
//  1. Node, no browser: the arena scripts run in a vm sandbox with a recording 2D context and stub DOM, Image and fetch. Checks: every
//     hood and stage (20 x 5) maps to manifest tiles that exist; the paving cell rule has matching edges (mirror repeat); the variant
//     hash is deterministic; each manifest ground and facade entry is referenced by a hood-stage or listed as deliberately unused;
//     placements resolve with the flag on and images loaded, and fall back to null with the flag off, while the manifest is not ready,
//     or when it fails; the draw-call log of render-world.drawGround is identical with the flag off to the HEAD render-world, and with
//     the flag on but not ready; the arena-evolve treatment still runs on a raster road; the sim never reads the view; no Math.random.
//  2. Headless Chrome over CDP (skipped with a note when Chrome is not found or --no-chrome): ?art=raster starts levels from six hoods,
//     no thrown errors, no 404, screenshots to /tmp/art_check/world/chrome/.
// Usage: node prototype/tools/test-art-raster-world.js [--no-chrome]
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), http = require('http'), net = require('net'), os = require('os');
const { spawn, execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..'), REPO = path.join(ROOT, '..'), OUT = '/tmp/art_check/world/chrome';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/art/manifest.json'), 'utf8'));
const GROUND = MANIFEST.ground, FACADES = MANIFEST.facades;
// Scripts the world needs: the themes and arena art (paving fallback), the evolve treatment, the sprite budget, the raster runtime.
const BASE = ['config.js', 'journey.js', 'config-arena-evolve.js', 'view/istanbul-themes.js', 'view/arena-art-data.js', 'view/arena-art.js',
  'view/arena-evolve.js', 'view/art-rig.js'];
const RASTER = ['view/art-raster.js', 'view/art-raster-world.js'];
const HOODS = ['istiklal', 'galata', 'karakoy', 'bridge', 'eminonu', 'sirkeci', 'kapalicarsi', 'beyazit', 'kumkapi', 'saray', 'halic',
  'yenikapi', 'samatya', 'yedikule', 'kazlicesme', 'zeytinburnu', 'bakirkoy', 'bakirkoysahil', 'atakoysahil', 'atakoy'];
const STAGES = [1, 2, 3, 4, 5];
const fails = [], passes = [], notes = [];
function ok(cond, msg) { (cond ? passes : fails).push(msg); }
const tick = async () => { for (let i = 0; i < 6; i++) await new Promise((r) => setImmediate(r)); };

// Recording 2D context (as in test-art-raster.js): every call goes into log as {tag, name, args}.
function recCtx(log, tag) {
  const st = { globalAlpha: 1, globalCompositeOperation: 'source-over', lineWidth: 1, lineCap: 'butt', font: '', textAlign: 'start', textBaseline: 'alphabetic',
    fillStyle: '#000', strokeStyle: '#000', imageSmoothingEnabled: true, imageSmoothingQuality: 'low' };
  return new Proxy(st, {
    get(t, k) {
      if (k in t || typeof k !== 'string' || k === 'getTransform') return t[k];
      return (...args) => { log.push({ tag, name: k, args }); return k.indexOf('create') === 0 ? { addColorStop() {} } : undefined; };
    },
    set(t, k, v) { t[k] = v; log.push({ tag, name: 'set:' + k, args: [v] }); return true; },
  });
}
function fmtArg(v) {
  if (typeof v === 'number') return String(Math.round(v * 1e6) / 1e6);
  if (v && typeof v === 'object' && v.__src !== undefined) return 'img:' + v.__src;
  if (v && typeof v === 'object') return v.constructor === Object ? JSON.stringify(v) : 'obj';
  return String(v);
}
const lineOf = (e) => e.tag + '.' + e.name + '(' + e.args.map(fmtArg).join(',') + ')';

// A sandbox: the world scripts in a fresh vm context. o.raster loads the raster files; o.manifest (fetch works) and o.images ('load' or
// 'none') decide readiness; o.search is the page query; o.renderSrc replaces render-world.js (the HEAD copy for the baseline).
function makeWorld(o) {
  const log = [], images = [];
  const Img = function () { this.complete = false; this.naturalWidth = 0; this.__src = null; this.onload = null; this.onerror = null; };
  Object.defineProperty(Img.prototype, 'src', {
    get() { return this.__src; },
    set(v) { this.__src = v; images.push(v); if (o.images === 'load') { this.complete = true; this.naturalWidth = 512; } },
  });
  const canvas = () => ({ width: 0, height: 0, getContext: () => recCtx(log, 'bake') });
  const sb = {
    console, Math, JSON, Array, Object, String, Number, Boolean, Date, Set, Map, Proxy, Symbol, Error, TypeError, Promise, URL, URLSearchParams,
    setTimeout, clearTimeout, setImmediate, parseInt, parseFloat, isNaN, isFinite, Float32Array, Uint8Array, WeakMap,
    Path2D: function () { return new Proxy({}, { get: () => () => undefined }); },
    performance: { now: () => 1000 },
    location: { search: o.search || '', protocol: 'http:' },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    Image: Img,
    fetch: o.manifest ? () => Promise.resolve({ ok: true, json: () => Promise.resolve(MANIFEST) }) : () => Promise.reject(new Error('no network')),
    document: { currentScript: { src: 'http://127.0.0.1/js/view/art-raster.js' }, createElement: (tag) => (tag === 'canvas' ? canvas() : {}),
      addEventListener() {}, getElementById: () => null },
  };
  sb.window = sb; sb.self = sb; sb.globalThis = sb; sb.P = { Settings: {}, goreRGB: () => '60,40,40', Landmarks: { draw() {} }, Sfx: {} };
  vm.createContext(sb);
  const files = BASE.concat(o.raster ? RASTER : []);
  files.forEach((f) => vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), sb, { filename: f }));
  vm.runInContext(o.renderSrc || fs.readFileSync(path.join(ROOT, 'js/view/render-world.js'), 'utf8'), sb, { filename: 'render-world.js' });
  return { P: sb.P, log, images, ctx: () => recCtx(log, 'main') };
}
async function world(o) {
  const w = makeWorld(o);
  if (o.raster && o.manifest) { w.P.ArtRaster.prepare(); await tick(); }
  return w;
}
const RAS = { raster: true, search: '?art=raster', manifest: true, images: 'load' };
// The sim the view reads for a generated level: the level's info, its hood's theme, and the fields the arena code reads.
function simOf(P, idx) {
  const li = P.Journey.level(idx);
  return { levelIndex: idx, levelInfo: li, theme: li.hood.theme, geo: {}, props: { shutter: 0 }, enemies: [] };
}
function rd(w, ctx) { const cam = { x: 0, y: 0, w: 10 }, ppm = 39; return { ctx, ppm, dpr: 1, cam, X: (x) => (x - cam.x) * ppm, Y: (y) => -(y - cam.y) * ppm }; }
// The draw-call log of drawGround over a level's visible window: the same calls every run when the view is the same.
function groundLog(w, idx) {
  const c = w.ctx(), R = rd(w, c);
  w.log.length = 0;
  w.P.RenderWorld.drawGround(R, simOf(w.P, idx), -12, 30);
  return w.log.map(lineOf);
}
const sameLog = (a, b) => a.length === b.length && a.every((l, i) => l === b[i]);

// The cell rule: neighbouring cells in a row (or column) of N cells meet with the same edge pixel. Uses the baker's own cell rule (W.cell).
// A flipped cell shows its last column on its left and its first column on its right.
function edgesMatch(W, N) {
  for (let i = 0; i < N; i++) {
    const f = W.cell(i, 0, 5, ['a']).fx, g = W.cell((i + 1) % N, 0, 5, ['a']).fx, fy = W.cell(0, i, 5, ['a']).fy, gy = W.cell(0, (i + 1) % N, 5, ['a']).fy;
    if ((f ? 'first' : 'last') !== (g ? 'last' : 'first')) return false;
    if ((fy ? 'first' : 'last') !== (gy ? 'last' : 'first')) return false;
  }
  return true;
}

async function nodePart() {
  // 1. The manifest has what the hood map asks for. Every hood-stage's ids exist; the paving pool has the four variants.
  const w0 = await world({ raster: true, search: '?art=raster', manifest: true, images: 'load' });
  const W = w0.P.ArtRasterWorld;
  ok(!!W && typeof W.place === 'function' && typeof W.spec === 'function', 'world: P.ArtRasterWorld exposes place, spec, cell, hash');
  ok(HOODS.length === 20 && w0.P.Journey.hoods.length === 20 && HOODS.every((h, i) => w0.P.Journey.hoods[i].id === h), 'world: the 20 hoods are the journey order');
  const refs = new Map(), bad = [];
  for (const h of HOODS) for (const st of STAGES) {
    const idx = HOODS.indexOf(h) * 5 + st, s = simOf(w0.P, idx), sp = W.spec(s);
    if (sp.pool.length !== 4) bad.push(h + st + ' pool ' + sp.pool.length);
    W.idsOf(sp).forEach((id) => {
      const cat = id.indexOf('fac_') === 0 ? 'facades' : 'ground';
      if (!(cat === 'facades' ? FACADES : GROUND)[id]) bad.push(id); else refs.set(id, (refs.get(id) || 0) + 1);
    });
  }
  ok(bad.length === 0, 'hoods: every hood-stage maps to manifest tiles that exist (' + bad.slice(0, 4).join(', ') + ')');
  ok(HOODS.every((h) => ['a', 'b', 'c', 'd'].every((v) => !!GROUND['gnd_' + h + '_' + v])), 'hoods: each hood has paving variants a to d in the manifest');
  // Hoods use more than one variant across their stages (variety at each level), and the features sit where the map says.
  const varietyOk = HOODS.every((h) => { const seen = new Set(); STAGES.forEach((st) => { const sp = W.spec(simOf(w0.P, HOODS.indexOf(h) * 5 + st)); seen.add(W.cell(0, 0, sp.seed, sp.pool).v); }); return seen.size >= 2; });
  ok(varietyOk, 'hoods: each hood draws at least two paving variants across its five stages');
  const feat = Object.keys(W.FEATURE).reduce((n, h) => n + W.FEATURE[h].length, 0);
  ok(feat === 11, 'features: the eleven feature tiles of the importer are mapped (' + feat + ')');
  const featIds = [].concat.apply([], Object.keys(W.FEATURE).map((h) => W.FEATURE[h].map((f) => 'gnd_' + h + '_' + f.id)));
  ok(featIds.every((id) => !!GROUND[id]), 'features: every mapped feature exists in the manifest');
  const special = [];
  for (const h of HOODS) for (const st of STAGES) { const sp = W.spec(simOf(w0.P, HOODS.indexOf(h) * 5 + st)); if (sp.road) special.push(sp.road.id); }
  ok(special.length > 0 && special.every((id) => GROUND[id] && (GROUND[id].flags || []).indexOf('special') >= 0), 'features: every road feature is a special tile in the manifest');

  // 2. Coverage: every manifest ground and facade entry is referenced by a hood-stage or deliberately unused. The unused are listed.
  const DELIBERATE_UNUSED = [];   // ids the walk never shows (the lighting never picks them); extend only with a reason
  const unusedG = Object.keys(GROUND).filter((id) => !refs.has(id)), unusedF = Object.keys(FACADES).filter((id) => !refs.has(id));
  ok(unusedG.every((id) => DELIBERATE_UNUSED.indexOf(id) >= 0), 'coverage: every ground entry is referenced (unused: ' + (unusedG.join(', ') || 'none') + ')');
  // A facade is deliberately unused when its hood's lighting picks the other variant at every stage (day hoods never show night, night hoods never show left).
  const lighting = unusedF.every((id) => refs.has(id.replace(/_(left|night)$/, (m) => (m === '_left' ? '_night' : '_left'))) || DELIBERATE_UNUSED.indexOf(id) >= 0);
  ok(lighting, 'coverage: every facade entry is referenced or unused only because its hood\'s lighting picks the other variant (unused: ' + (unusedF.join(', ') || 'none') + ')');
  notes.push('coverage: ground referenced ' + (Object.keys(GROUND).length - unusedG.length) + ' of ' + Object.keys(GROUND).length + '; facades referenced ' +
    (Object.keys(FACADES).length - unusedF.length) + ' of ' + Object.keys(FACADES).length + '. Unused facades: ' + (unusedF.join(', ') || 'none') + '.');

  // 3. The paving cell rule: mirror repeat has matching edges in both axes, and the variant hash is deterministic and spread.
  ok(edgesMatch(W, 4) && !edgesMatch(W, 3), 'seams: the cell flips match neighbouring edges in x and y (even cell count; odd would not)');
  const pool = ['a', 'b', 'c', 'd'];
  const c1 = W.cell(1, 2, 77, pool), c2 = W.cell(1, 2, 77, pool), c3 = W.cell(3, 0, 77, pool);
  ok(c1.v === c2.v && c1.fx === c2.fx && c1.fy === c2.fy && c1.fx === 1 && c1.fy === 0 && c3.fx === 1, 'cells: the same coordinates give the same cell (flips from parity)');
  const v4 = new Set(); for (let s = 0; s < 40; s++) v4.add(W.cell(0, 0, s, pool).v);
  ok(v4.size === 4, 'cells: the hash reaches all four variants across levels');
  const hv = [W.hash(0, 0, 1), W.hash(1, 0, 1), W.hash(0, 1, 1), W.hash(7, 3, 99)];
  ok(hv[0] === W.hash(0, 0, 1) && hv[3] === W.hash(7, 3, 99) && hv[0] !== hv[1] && hv[1] !== hv[2], 'hash: deterministic and spreads neighbours');
  ok(hv.every((x) => Number.isInteger(x) && x >= 0 && x <= 0xFFFFFFFF), 'hash: a uint32 (no Math.random)');

  // 4. Placement geometry and the flag. Flag off, manifest not ready, images not ready: null for every slot (the code art draws).
  const cnv = { ctx: w0.ctx(), ppm: 39, dpr: 1, cam: { x: 0, y: 0 }, X: (x) => x * 39, Y: (y) => -y * 39 };
  const off = await world({ raster: false, search: '' });
  ok(!off.P.ArtRasterWorld, 'flag off: the raster world file is not loaded');
  const offR = await world({ raster: true, search: '?art=current', manifest: true, images: 'load' });
  ok(offR.P.ArtRasterWorld.place(cnv, simOf(offR.P, 6), 'road', 0) === null, 'flag off: place() is null for the road with raster files loaded');
  const noMan = await world({ raster: true, search: '?art=raster', manifest: false, images: 'load' });
  ok(noMan.P.ArtRasterWorld.place(cnv, simOf(noMan.P, 6), 'road', 0) === null, 'not ready: a failed manifest gives null (fallback)');
  const noImg = await world({ raster: true, search: '?art=raster', manifest: true, images: 'none' });
  ok(noImg.P.ArtRasterWorld.place(cnv, simOf(noImg.P, 6), 'road', 0) === null, 'not ready: images still decoding give null (fallback)');
  const on = w0;
  const slots = [['road', 0], ['walk', -1], ['walk', 1], ['facade', -1], ['facade', 1]];
  let allOn = true;
  for (const h of HOODS) { const s = simOf(on.P, HOODS.indexOf(h) * 5 + 1); slots.forEach(([k, sd]) => { if (!on.P.ArtRasterWorld.place(cnv, s, k, sd)) allOn = false; }); }
  ok(allOn, 'flag on, images loaded: road, both walks and both facades resolve for every hood');
  const p1 = on.P.ArtRasterWorld.place(cnv, simOf(on.P, 6), 'walk', 1), p2 = on.P.ArtRasterWorld.place(cnv, simOf(on.P, 6), 'walk', 1);
  ok(p1 && p1 === p2 && p1.t.cv && p1.t.k > 0, 'placements: the same object on repeat calls (cached per level, no per-frame allocation)');
  const fac = on.P.ArtRasterWorld.place(cnv, simOf(on.P, 6), 'facade', 1), facL = on.P.ArtRasterWorld.place(cnv, simOf(on.P, 6), 'facade', -1);
  ok(fac.projected && facL.projected && fac.x0 === 7 && facL.x0 === -7 && fac.ox === 7 && fac.sx === 1 && facL.sx === -1,
    'facades: Galata fronts align with the outside of the sidewalk and face in from both sides');
  ok(Math.abs(fac.t.w - 3.3) < 1e-9 && fac.t.h === 16 && on.log.some((e) => e.tag === 'bake' && e.name === 'transform' && e.args[0] === 0 && e.args[2] === -1),
    'facades: artwork follows the street axis, with room for an outward roof edge');
  const first = await world(RAS), corner = first.P.CFG.view.istiklalWall;
  const street = first.P.ArtRasterWorld.place(cnv, simOf(first.P, 1), 'facade', -1);
  ok(street.wall === corner && first.log.some(e => e.tag === 'bake' && e.name === 'transform' &&
    e.args[2] === -1 && e.args[3] === corner.rise / corner.depth && e.args[4] === corner.depth),
    'facades: İstiklal illustrations use the same roof-to-pavement angle as the restaurant corner');
  const endY = 11, endView = { ctx: first.ctx(), ppm: 1, X: x => x, Y: y => -y };
  first.P.ArtRasterWorld.drawEnd(endView, street, endY);
  ok(first.log.some(e => e.tag === 'main' && e.name === 'transform' &&
    e.args[2] === corner.depth && e.args[3] === corner.rise &&
    e.args[4] === street.x1 && e.args[5] === -(endY + corner.rise)),
    'facades: the illustrated end wall starts at the roof corner and reaches the same ground line');
  const lateFac = on.P.ArtRasterWorld.place(cnv, simOf(on.P, 31), 'facade', 1);
  ok(!lateFac.projected && lateFac.x0 === 6.2 && lateFac.t.h === 10.2, 'facades: later hoods keep the original treatment');
  const rails = on.P.ArtRasterWorld.place(cnv, simOf(on.P, 1), 'rails', 0);
  ok(rails && rails.ox === -2 && rails.x0 === -1.2 && rails.x1 === 1.2, 'rails: the istiklal tram tile is centred so its rails sit on x = 0 +- 0.5 m');
  const shore = on.P.ArtRasterWorld.place(cnv, simOf(on.P, 11), 'walk', 1);
  ok(shore && shore.ox === 3 && shore.x0 === 4.6 && shore.x1 === 7 && shore.sx === 1, 'shore: karakoy wateredge ends its water band at x = 7 (origin 3 m)');
  const lawn = on.P.ArtRasterWorld.place(cnv, simOf(on.P, 71), 'lawn', -1);
  ok(lawn && lawn.x0 === -7 && lawn.x1 === -16 && lawn.sx === -1, 'lawn: kazlicesme grass sides run from x 7 to 16 (mirrored on the left)');
  const roadW = on.P.ArtRasterWorld.place(cnv, simOf(on.P, 16), 'road', 0);
  ok(roadW && roadW.t.e && roadW.t.raster === true && roadW.x0 === -4.6 && roadW.x1 === 4.6, 'road: bridge deck feature fills the lane (raster record, marked raster)');
  // Night facades follow the time-of-day tint: blue (night) from Kapalıçarşı to Samatya and at Haliç, warm or clear by day.
  const nightAt = (h, st) => on.P.ArtRasterWorld.spec(simOf(on.P, HOODS.indexOf(h) * 5 + st)).facade.indexOf('night') >= 0;
  ok(nightAt('halic', 1) && nightAt('kapalicarsi', 3) && !nightAt('istiklal', 1) && !nightAt('saray', 3) && !nightAt('atakoy', 5), 'facades: night where the tint is blue (Haliç, Kapalıçarşı), day elsewhere (Saray keeps its warm tod)');
  const onOff = new Set(); for (const h of HOODS) for (const st of STAGES) onOff.add(on.P.ArtRasterWorld.spec(simOf(on.P, HOODS.indexOf(h) * 5 + st)).facade);
  notes.push('facades used by the walk: ' + [...onOff].sort().join(', '));

  // 5. Draw-call log. Flag off equals the HEAD render-world (before this change); flag on but not ready equals flag off.
  let headSrc = null;
  try { headSrc = execFileSync('git', ['-C', REPO, 'show', 'HEAD:prototype/js/view/render-world.js'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { headSrc = null; }
  const LEVELS = [6, 11, 31, 51, 66, 71, 16];
  if (headSrc) {
    const before = await world({ raster: false, search: '', renderSrc: headSrc });
    const after = await world({ raster: false, search: '' });
    const baseline = LEVELS.map((l) => groundLog(before, l));
    const now = LEVELS.map((l) => groundLog(after, l));
    ok(LEVELS.every((l, i) => sameLog(baseline[i], now[i]) && baseline[i].length > 50), 'flag off: drawGround draw-call log equals the HEAD render-world (' + baseline.map((b) => b.length).join('/') + ' calls)');
    const withFiles = await world({ raster: true, search: '?art=current', manifest: true, images: 'load' });
    ok(LEVELS.every((l, i) => sameLog(groundLog(withFiles, l), now[i])), 'flag off with raster files loaded: the same log as with no raster files');
  } else notes.push('flag-off baseline: git HEAD not available, the HEAD comparison is skipped');
  const logsOf = async (o) => { const out = []; for (const l of LEVELS) out.push(groundLog(await world(o), l)); return out; };
  const plainLogs = await logsOf({ raster: false, search: '' });
  const noImgLogs = await logsOf({ raster: true, search: '?art=raster', manifest: true, images: 'none' });
  const noManLogs = await logsOf({ raster: true, search: '?art=raster', manifest: false, images: 'load' });
  ok(LEVELS.every((l, i) => sameLog(plainLogs[i], noImgLogs[i])), 'not ready (images decoding): drawGround falls back to the code art, call for call');
  ok(LEVELS.every((l, i) => sameLog(plainLogs[i], noManLogs[i])), 'not ready (manifest failed): drawGround falls back to the code art, call for call');
  const rasterLog = groundLog(await world(RAS), 6);
  ok(rasterLog.some((l) => l.indexOf('img:') >= 0 && /ground\/galata\//.test(l)), 'flag on, images loaded: the galata level bakes its ground from ground/galata/ tiles');
  ok(!sameLog(plainLogs[0], rasterLog), 'flag on, images loaded: the draw-call log differs from the code art');
  const hoodLogs = [];
  for (const h of ['sirkeci', 'halic', 'samatya']) hoodLogs.push(groundLog(await world(RAS), HOODS.indexOf(h) * 5 + 2));
  ok(hoodLogs.every((l) => l.length > 50), 'flag on: stage 2 levels of three more hoods draw');

  // 6. Arena evolve still acts on a raster road (its composite of the raster record, and the treatment key).
  const ev = await world(RAS);
  const roadRec = ev.P.ArtRasterWorld.place(cnv, simOf(ev.P, 1), 'road', 0);
  const treated = ev.P.ArenaEvolve.ground(cnv, ev.P.Themes.get('istiklal'), simOf(ev.P, 1), roadRec.t);
  ok(!!treated && typeof treated.treated === 'string' && treated.raster !== true && treated.cv && treated.cv.width === roadRec.t.cv.width, 'evolve: the raster road is treated (tint, wear and mirror) on top of the raster tile');

  // 7. The view only: the sim never reads it; no Math.random in the world file; no P.Quality reads.
  const src = fs.readFileSync(path.join(ROOT, 'js/view/art-raster-world.js'), 'utf8').replace(/\/\/.*$/mg, '');   // code only, not the comments
  ok(!/Math\.random/.test(src) && !/P\.Quality/.test(src) && !/P\.sim\b/.test(src), 'world file: no Math.random, no P.Quality, no sim reads (code, not comments)');
  const simDir = path.join(ROOT, 'js/sim');
  const simHits = fs.readdirSync(simDir).filter((f) => /ArtRaster|ArtRasterWorld|art-raster/.test(fs.readFileSync(path.join(simDir, f), 'utf8')));
  ok(simHits.length === 0, 'sim: no js/sim file references the raster or arena view code');
  const rwSrc = fs.readFileSync(path.join(ROOT, 'js/view/render-world.js'), 'utf8');
  ok(/rasterPlace\(R, s,/.test(rwSrc) && !/P\.Sim|P\.sim\b/.test(rwSrc), 'render-world: raster hooks take the view state only');
}

// Chrome part: the flag on, levels from six hoods start, no thrown errors, no 404, screenshots kept.
function chromePart() {
  return new Promise((resolve, reject) => {
    if (process.argv.indexOf('--no-chrome') >= 0 || !fs.existsSync(CHROME)) { notes.push('headless Chrome not found or --no-chrome: Chrome part skipped'); resolve(); return; }
    fs.mkdirSync(OUT, { recursive: true });
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.jpg': 'image/jpeg' };
    const bad = [];
    const srv = http.createServer((req, res) => {
      const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html', file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { if (!/favicon/.test(rel)) bad.push('404 ' + rel); res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res);
    });
    srv.listen(0, '127.0.0.1', async () => {
      let dir, proc, ws, failure;
      const screenshots = [];
      try {
        const base = 'http://127.0.0.1:' + srv.address().port;
        const port = await new Promise((r) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
        dir = fs.mkdtempSync(path.join(os.tmpdir(), 'raster-world-test-'));
        proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`,
          '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--disk-cache-size=1', '--media-cache-size=1', 'about:blank'],
        { stdio: 'ignore' });
        let wsUrl = null;
        for (let i = 0; i < 150 && !wsUrl; i++) { try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); const pg = l.find((x) => x.type === 'page'); if (pg) wsUrl = pg.webSocketDebuggerUrl; } catch (e) {} if (!wsUrl) await new Promise((r) => setTimeout(r, 100)); }
        ws = new WebSocket(wsUrl); let id = 0; const pend = new Map(), listeners = [];
        await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
        ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); p(m.result); } else if (m.method) listeners.forEach((f) => f(m)); };
        const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
        const errors = [];
        listeners.push((m) => {
          if (m.method === 'Runtime.exceptionThrown') {
            const d = m.params.exceptionDetails, msg = ((d.exception && d.exception.description) || d.text).split('\n')[0];
            errors.push('exception: ' + msg);
          }
          if (m.method === 'Network.responseReceived' && m.params.response.status >= 400 && !/favicon/.test(m.params.response.url)) bad.push(m.params.response.status + ' ' + m.params.response.url);
        });
        const ev = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true })).result.value;
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
        await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
        const picks = [6, 11, 16, 21, 26, 30];   // active first-30 districts; production beyond L30 is gated
        const placed = [];
        for (const lv of picks) {
          errors.length = 0;
          await send('Page.navigate', { url: `${base}/index.html?art=raster&level=${lv}&skipintro=1&seed=42` });
          for (let i = 0; i < 240; i++) {
            if (await ev("!!window.P?.ArtRaster && P.ArtRaster.heroState() === 'ready'")) break;
            await sleep(250);
          }
          await ev("if (P.Story) P.Story.play = function (l, w, done) { if (done) done(false); return true; };");
          await ev("document.getElementById('btn-start').click()");
          for (let i = 0; i < 60; i++) {
            if ((await ev('P.debug && P.debug.state')) === 'play') break;
            if (i === 5 || i === 20) await ev("var b = document.getElementById('btn-start'); if (b && (!P.debug || !P.debug.sim)) b.click();");
            if (i % 3 === 2) for (const t of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type: t, x: 195, y: 500, button: 'left', clickCount: 1 });
            await sleep(250);
          }
          for (let i = 0; i < 60; i++) { const st = JSON.parse((await ev('JSON.stringify(P.ArtRaster.status())')) || '{}'); if (st.loaded >= 2 || (st.failed || []).length) break; await sleep(200); }
          await sleep(1500);
          const got = await ev("(function(){ try { var s = P.debug.sim, R = { ctx: document.createElement('canvas').getContext('2d'), ppm: 32, dpr: 2 }; return ['road', 'walk', 'facade'].map(function (k) { return P.ArtRasterWorld.place(R, s, k, 1) ? 1 : 0; }).join(''); } catch (e) { return 'none:' + e.message + ':' + P.debug.state; } })()") || 'none';
          placed.push(lv + ':' + got + ':' + errors.length);
          const shot = await send('Page.captureScreenshot', { format: 'png' });
          screenshots.push([path.join(OUT, 'L' + lv + '.png'), Buffer.from(shot.data, 'base64')]);
          ok(errors.length === 0, 'chrome, level ' + lv + ': no thrown errors (' + errors.slice(0, 2).join('; ') + ')');
        }
        ok(placed.every((p) => /:111:/.test(p)), 'chrome: road, walk and facade resolve on each of six hoods (' + placed.join(' ') + ')');
        ok(!bad.some((b) => /assets\/art\//.test(b)), 'chrome: no 404 for a tile');
      } catch (err) {
        failure = err;
      } finally {
        if (ws) ws.close();
        if (proc) proc.kill();
        srv.close();
        if (dir) {
          await new Promise((r) => setTimeout(r, 250));
          try { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch (e) {}
        }
      }
      if (failure) { reject(failure); return; }
      // Write the QA copies once Chrome's temporary profile has been released.
      try {
        screenshots.forEach(([file, bytes]) => fs.writeFileSync(file, bytes));
        resolve();
      } catch (err) { reject(err); }
    });
  });
}

(async () => {
  await nodePart();
  if (process.argv.indexOf('--no-chrome') < 0) await chromePart();
  notes.forEach((n) => console.log('note: ' + n));
  console.log(fails.length ? fails.length + ' failure(s)' : 'test-art-raster-world: all pass (' + passes.length + ' checks)');
  fails.forEach((f) => console.log('FAIL ' + f));
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error('test-art-raster-world crashed:', e); process.exit(1); });
