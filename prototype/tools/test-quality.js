// Quality and frame-cadence checks (T4 part 12; docs/architecture.md 4.17, docs/design-system.md 7 and 11).
// Static: the sim never references P.Quality, view.maxDpr or view.quality; quality.js is a view file loaded before render.js;
// the world canvas asks P.Quality for its DPR cap and uses an opaque context; the bake cache is LRU under a byte budget; the
// loop caps work at 60 Hz, runs frozen menus at view.quality.menuFps, feeds the governor and does nothing while hidden.
// Runtime (vm sandboxes, fake clock): the governor steps down after a sustained slow EMA, steps back up only after a long
// calm, holds in between, ignores frames that are not live, and locks with ?quality; the real render.js sizes the canvas to
// the capped DPR at each tier; the real main.js loop runs 60 times a second in play, 30 in a frozen menu, not while hidden,
// and the governor steps the tier down from a slow loop. It cannot measure device frame time or heat (see the playtest guide).
// Usage: node prototype/tools/test-quality.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"])\/\/.*$/gm, '$1');
let passes = 0; const fails = [];
function ok(c, m) { if (c) passes++; else fails.push(m); }

// ---------- static ----------
const simFiles = fs.readdirSync(path.join(ROOT, 'js/sim')).filter((f) => f.endsWith('.js'));
simFiles.forEach((f) => {
  const src = stripComments(read('js/sim/' + f));
  ok(!/P\.Quality|maxDpr|view\.quality|\bquality\b/.test(src), 'js/sim/' + f + ' references the quality settings (P.Quality, maxDpr or view.quality)');
});
const html = read('index.html');
const order = (f) => html.indexOf('src="' + f + '"');
ok(order('js/view/quality.js') > 0 && order('js/view/quality.js') < order('js/view/render.js'), 'index.html loads js/view/quality.js before js/view/render.js');
const render = read('js/view/render.js');
ok(/P\.Quality\.dprCap\(\)/.test(render) && /getContext\('2d', \{ alpha: false \}\)/.test(render), 'render.js: the canvas DPR comes from P.Quality.dprCap and the context is opaque');
const qsrc = read('js/view/quality.js');
ok(!/setInterval|setTimeout/.test(qsrc), 'quality.js runs no timers (the governor is driven by the loop)');
const rig = read('js/view/art-rig.js');
ok(/new Map\(\)/.test(rig) && /cache\.delete\(k\); cache\.set\(k, e\)/.test(rig) && /spriteCacheMB/.test(rig), 'art-rig.js: bake cache is LRU under the spriteCacheMB budget');
ok(!/cacheN\s*>\s*MAX|Object\.keys\(cache\)/.test(rig), 'art-rig.js: the old count-based eviction is gone');
const sprites = read('js/view/sprites.js');
ok(/function enemyRc\(/.test(sprites) && /function poseMemo\(/.test(sprites), 'sprites.js: enemy recipes and joint solves are memoised');
const main = read('js/main.js');
ok(/if \(!document\.hidden\) tick\(ts\)/.test(main), 'main.js: nothing runs while the page is hidden');
ok(/RUN_MS = 1000 \/ 60/.test(main) && /MENU_RUN_MS = 1000 \/ P\.CFG\.view\.quality\.menuFps/.test(main), 'main.js: logic and world draw capped at 60 Hz, menus at menuFps');
ok(/P\.Quality\.feed\(gap/.test(main) && /P\.Quality\.onChange\(function \(\) \{ P\.Render\.resize\(scale\); \}\)/.test(main), 'main.js: the governor is fed from the loop and a tier step re-sizes the canvas');
ok(/visibilitychange', function \(\) \{ if \(document\.hidden\) pause\(\); \}/.test(main), 'main.js: hiding the page still pauses the run');
const cfgSrc = read('js/config.js');
ok(/maxDpr: 2,/.test(cfgSrc) && /menuFps: 30/.test(cfgSrc), 'config.js: view.maxDpr and view.quality.menuFps are set');

// ---------- runtime: governor under a fake clock ----------
function loadQuality(lock) {
  const P = { CFG: { view: { maxDpr: 2, quality: { emaS: 2, downMs: 20, downHoldS: 4, upMs: 13, upHoldS: 30, menuFps: 30, spriteCacheMB: 64 } } } };
  const ctx = { P, Math, console, URLSearchParams, location: { search: lock || '' } };
  vm.createContext(ctx);
  vm.runInContext(qsrc, ctx, { filename: 'js/view/quality.js' });
  return P.Quality;
}
function drive(Q, seconds, dtMs, live = true) {
  let t = 0; const log = [];
  while (t < seconds * 1000) { const before = Q.tier; Q.feed(dtMs, live); if (Q.tier !== before) log.push({ t: +(t / 1000).toFixed(2), to: Q.tier }); t += dtMs; }
  return log;
}
{
  const Q = loadQuality();
  ok(Q.tier === 0, 'governor starts at tier 0');
  ok(drive(Q, 60, 16.7).length === 0 && Q.tier === 0, 'steady 60 fps (16.7 ms) keeps tier 0');
  ok(drive(Q, 60, 15).length === 0 && Q.tier === 0, 'a 15 ms frame time (between the thresholds) holds tier 0');
  const Q2 = loadQuality();
  let log = drive(Q2, 3, 25);
  ok(log.length === 0 && Q2.tier === 0, 'slow frames (25 ms) for 3 s: no step yet (the EMA starts at the first frame, and the 4 s hold has not finished)');
  log = drive(Q2, 4, 25);
  const stepAt = log.length ? 3 + log[0].t : -1;   // seconds from the first slow frame
  ok(Q2.tier === 1 && log.length === 1 && stepAt > 3.5 && stepAt < 4.5, 'slow frames step down to tier 1 once, after the 4 s hold (at ' + stepAt.toFixed(2) + ' s)');
  log = drive(Q2, 8, 25);
  ok(Q2.tier === 2 && log.length === 1, 'slow frames keep going: tier 2 after the next hold, and no further (max tier 2)');
  drive(Q2, 20, 25);
  ok(Q2.tier === 2, 'tier 2 is the floor of the ladder (no tier 3)');
  // calm: the EMA falls below upMs, then upHoldS of calm steps back up one tier at a time
  let calmStart = null, upAt = null, tierBefore = Q2.tier;
  for (let t = 0; t < 120000 && Q2.tier > 0; t += 10) {
    const before = Q2.tier; Q2.feed(10, true);
    if (calmStart === null && Q2.ema() !== null && Q2.ema() < 13) calmStart = t;
    if (Q2.tier !== before && upAt === null) upAt = t;
  }
  ok(tierBefore === 2 && Q2.tier === 0, 'calm frames (10 ms) step back up to tier 0 one tier at a time');
  ok(calmStart !== null && upAt !== null && upAt - calmStart >= 30000 - 50 && upAt - calmStart <= 30000 + 300, 'the step up waits about upHoldS (30 s) after the EMA is calm');
  // not live frames (menus, pause, cards) do not feed the governor; a long stall restarts it
  const Q3 = loadQuality();
  drive(Q3, 60, 40, false);
  ok(Q3.tier === 0 && Q3.ema() === null, 'frames that are not live (menus, pause) do not move the governor');
  drive(Q3, 3, 25); drive(Q3, 0.1, 400);
  ok(Q3.ema() === null && Q3.tier === 0, 'a 400 ms stall restarts the measurement (the hold timer starts again)');
  // lock (?quality=N): the governor does nothing while locked
  const Q4 = loadQuality('?quality=0');
  ok(Q4.locked() && Q4.tier === 0, '?quality=0 locks tier 0');
  ok(drive(Q4, 30, 40).length === 0 && Q4.tier === 0, 'a locked tier does not step down on slow frames');
  Q4.unlock(); drive(Q4, 6, 40);
  ok(Q4.tier === 1, 'after unlock the governor steps down again');
  const Q5 = loadQuality('?quality=2');
  ok(Q5.tier === 2 && Q5.locked(), '?quality=2 starts locked at tier 2');
  // DPR cap per tier, glow and particle rules
  const Q6 = loadQuality();
  ok(Q6.dprCap(0) === 2 && Q6.dprCap(1) === 1.5 && Q6.dprCap(2) === 1.25, 'DPR cap by tier: 2, 1.5, 1.25 (view.maxDpr = 2)');
  const Q7 = loadQuality();
  Q7.set(1);
  ok(Q7.dprCap() === 1.5 && Q7.partStep() === 2 && !Q7.glows() && Q7.fog() && Q7.ambientOcclusion(), 'tier 1: DPR 1.5, 1 in 2 optional particles, no shop glows, fog and AO kept');
  Q7.set(2);
  ok(Q7.dprCap() === 1.25 && Q7.partStep() === 3 && !Q7.fog() && !Q7.ambientOcclusion(), 'tier 2: DPR 1.25, 1 in 3 particles, weather and AO dropped');
  let changes = 0; Q7.onChange(() => changes++); Q7.set(1); Q7.set(1);
  ok(changes === 1, 'onChange fires once per real tier step');
  const Q8 = loadQuality();
  ok(Q8.dprCap(0) === 2, 'tier 0 is view.maxDpr');
}

// ---------- runtime: render.js sizes the canvas to the capped DPR, opaque context ----------
function fakeEl() {
  const t = function () {};
  return new Proxy(t, {
    get(tg, k) { if (k === Symbol.toPrimitive) return () => 0; if (k === 'then' || typeof k === 'symbol') return undefined; if (!(k in tg)) tg[k] = fakeEl(); return tg[k]; },
    set(tg, k, v) { tg[k] = v; return true; }, apply() { return fakeEl(); },
  });
}
{
  const canvas = { width: 0, height: 0, ctxArgs: null, getContext(type, opts) { this.ctxArgs = [type, opts]; return fakeEl(); } };
  const P = { CFG: { view: { maxDpr: 2, quality: { emaS: 2, downMs: 20, downHoldS: 4, upMs: 13, upHoldS: 30, menuFps: 30, spriteCacheMB: 64 } } } };
  const ctx = { P, Math, console, URLSearchParams, location: { search: '' }, window: { devicePixelRatio: 3 } };
  vm.createContext(ctx);
  vm.runInContext(qsrc, ctx, { filename: 'js/view/quality.js' });
  vm.runInContext(read('js/view/render.js'), ctx, { filename: 'js/view/render.js' });
  const R = P.Render;
  R.init(canvas);
  ok(canvas.ctxArgs && canvas.ctxArgs[1] && canvas.ctxArgs[1].alpha === false, 'render.js: the world context is opaque (alpha false)');
  R.resize(1);
  ok(canvas.width === 780 && canvas.height === 1688, 'DPR 3 device is capped at 2: backing store 780 x 1688 (was 1170 x 2532)');
  P.Quality.onChange(() => R.resize(1));
  P.Quality.set(1);
  ok(canvas.width === 585 && canvas.height === 1266, 'tier 1 re-sizes the canvas to DPR 1.5 (585 x 1266)');
  P.Quality.set(2);
  ok(canvas.width === Math.round(390 * 1.25) && R.dpr === 1.25, 'tier 2 re-sizes the canvas to DPR 1.25');
  P.Quality.set(0);
  ok(canvas.width === 780, 'back to tier 0 restores DPR 2');
}

// ---------- runtime: the real main.js loop (fake rAF queue, fake clock, DOM stub) ----------
{
  const store = {};
  const queue = [];
  let clock = 1000;
  const document = { hidden: false, body: fakeEl(), documentElement: fakeEl(), head: fakeEl(), createElement: () => fakeEl(),
    getElementById: (id) => (els[id] || (els[id] = fakeEl())), querySelectorAll: () => [], querySelector: () => fakeEl(), addEventListener() {}, removeEventListener() {} };
  const els = { game: { width: 0, height: 0, getContext: () => fakeEl(), style: {} } };
  class Path2D { constructor() {} }
  ['moveTo', 'lineTo', 'arc', 'arcTo', 'ellipse', 'closePath', 'bezierCurveTo', 'quadraticCurveTo', 'addPath', 'rect', 'roundRect'].forEach((m) => { Path2D.prototype[m] = function () {}; });
  class DOMMatrix { constructor() { this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0; } translate() { return this; } scale() { return this; } }
  const ctx = { console: { log() {}, warn() {}, error() {} }, Math, Object, Array, Float32Array, Uint8ClampedArray, WeakMap, Set, Map, JSON, Number, String, Boolean, Date, Error, RegExp,
    parseInt, parseFloat, isNaN, isFinite, Symbol, Promise, Infinity, NaN, undefined,
    performance: { now: () => clock }, document, Path2D, DOMMatrix, navigator: { userAgent: 'test' },
    localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
    Image: class {}, AudioContext: class {}, webkitAudioContext: class {},
    requestAnimationFrame: (fn) => { queue.push(fn); return queue.length; }, cancelAnimationFrame() {}, setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    URLSearchParams, location: { search: '?skipintro=1' }, devicePixelRatio: 3, innerWidth: 390, innerHeight: 844, addEventListener() {}, removeEventListener() {},
    };
  ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx; ctx.P = {};
  vm.createContext(ctx);
  const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]).filter((f) => fs.existsSync(path.join(ROOT, f)));
  const loadErrs = [];
  srcs.forEach((f) => { try { vm.runInContext(read(f), ctx, { filename: f }); } catch (e) { loadErrs.push(f + ': ' + e.message); } });
  const P = ctx.P;
  ok(loadErrs.length === 0, 'the game scripts load in the test sandbox: ' + loadErrs.slice(0, 2).join(' | '));
  let renders = 0; const realFrame = P.Render.frame;
  P.Render.frame = function () { renders++; return realFrame.apply(this, arguments); };
  // Run queued callbacks at a fixed interval for `ms` of fake time; returns the number of world draws.
  function flush(ms, step) {
    const end = clock + ms, before = renders;
    while (clock < end) {
      clock += step;
      const q = queue.splice(0, queue.length);
      q.forEach((fn) => fn(clock));
    }
    return renders - before;
  }
  // The queue keeps main.js's own pending frame callback (clearing it would stop the loop), so the run starts from the real boot.
  P.debug.playLevel(1, {});
  flush(200, 8.333);   // settle the first frames
  ok(P.debug.state === 'play', 'the test run reaches play');
  const n120 = flush(1000, 8.333);
  ok(n120 >= 58 && n120 <= 62, 'play on a 120 Hz display draws the world about 60 times a second (got ' + n120 + ')');
  const n60 = flush(1000, 16.667);
  ok(n60 >= 58 && n60 <= 62, 'play on a 60 Hz display draws the world about 60 times a second (got ' + n60 + ')');
  P.Input.onPause();
  ok(P.debug.state === 'paused', 'the pause path puts the run in the paused state');
  flush(100, 8.333);
  const nPaused = flush(1000, 8.333);
  ok(nPaused >= 28 && nPaused <= 32, 'a frozen menu (paused) draws the world about 30 times a second (got ' + nPaused + ')');
  document.hidden = true;
  const nHidden = flush(500, 16.667);
  ok(nHidden === 0, 'a hidden page draws nothing (got ' + nHidden + ')');
  document.hidden = false;
  flush(100, 16.667);
  P.Quality.set(0);
  // A slow loop (about 33 ms per run) in play steps the governor down and re-sizes the canvas.
  P.debug.playLevel(1, {});   // a fresh run (main.js resets the cadence through its own tick)
  flush(200, 8.333);
  const startTier = P.Quality.tier;
  flush(12000, 33.33);
  ok(startTier === 0 && P.Quality.tier >= 1, 'a loop that runs at about 30 fps steps the quality tier down (tier ' + P.Quality.tier + ')');
  // 12 s of slow frames: one step after the first hold (tier 1), a second after the next (tier 2, the floor). The canvas follows the tier.
  const dprOfTier = [2, 1.5, 1.25][P.Quality.tier];
  ok(P.Quality.tier === 2 && els.game.width === Math.round(390 * dprOfTier), 'the canvas follows the tier after the steps (tier ' + P.Quality.tier + ', width ' + els.game.width + ')');
}

if (fails.length) { console.log('test-quality: ' + fails.length + ' failure(s)'); fails.forEach((m) => console.log('FAIL ' + m)); process.exit(1); }
console.log('test-quality: all pass (' + passes + ' checks)');
