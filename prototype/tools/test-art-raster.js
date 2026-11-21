// Raster art runtime tests (D-066; view only, URL flag ?art=raster). Two parts:
//  1. Node, no browser: the sprite scripts run in a vm sandbox with stub DOM, Image and fetch (the art-raster files are loaded
//     only where a case needs them). Checks: the manifest has what the view asks for (every configured enemy type, every boss
//     archetype and costume, the hero views), each figure draws from its manifest atlas and the frame the view picks has the
//     manifest rect, A.draw mirror and pivot math, the walker outfit rule for ids 1..400, and call-log equality between flag off,
//     flag on with missing art. The player build never paints the retired Arda.
//  2. Headless Chrome over CDP (skipped with a note when Chrome is not found): ?art=raster starts level 1, the screenshot goes to
//     /tmp/art_check/raster/, no thrown errors, no 404 for an atlas; the flag-off page never requests assets/art/.
// Usage: node prototype/tools/test-art-raster.js [--no-chrome]
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), http = require('http'), net = require('net'), os = require('os');
const { spawn } = require('child_process');
const ROOT = path.join(__dirname, '..'), OUT = '/tmp/art_check/raster', CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/art/manifest.json'), 'utf8'));
const CHAR = MANIFEST.characters;
const SPRITE_SCRIPTS = ['config.js', 'config-weapons.js', 'config-weapons2.js', 'config-weapons3.js', 'config-levels.js', 'config-layouts.js', 'config-enemies3.js', 'config-bosses.js',
  'config-enemies4.js', 'config-enemies5.js', 'config-feel.js', 'config-enemy-look.js', 'view/art-rig.js', 'view/art-characters.js',
  'view/art-enemies.js', 'view/sprites.js', 'view/art-enemies3.js', 'view/art-enemies4.js', 'view/art-enemies5.js', 'view/art-enemies6.js',
  'view/art-bosses.js', 'view/art-enemy-look.js', 'view/art-enemy-bosses.js', 'view/feel.js'];
const RASTER_SCRIPTS = ['view/art-raster.js', 'view/hero-body.js', 'view/art-raster-chars.js', 'view/fire-anim-prim.js', 'view/fire-anim-held.js', 'view/fire-anim-held2.js',
  'view/fire-anim-fx.js', 'view/hero-footwork.js', 'view/hero-attacks.js', 'view/fire-anim.js'];
// The boss archetype -> atlas map and the costume naming, as the view intends them (an independent copy: drift fails the test).
const BOSS_ARCH = { brute: 'boss_vatman', bloater: 'boss_bloater', taksici: 'boss_taksici', kasapBoss: 'boss_kasap', spitter: 'boss_spitter',
  tourGuide: 'boss_docent', antiquarian: 'boss_antiquarian' };
const ENEMY_FRAMES = ['idle', 'walk1', 'walk2', 'hit', 'dead'], BOSS_FRAMES = ['idle', 'walk1', 'walk2', 'attack_windup', 'attack_hit', 'hurt', 'dead'];
const fails = [], passes = [];
function ok(cond, msg) { (cond ? passes : fails).push(msg); }
const tick = async () => { for (let i = 0; i < 6; i++) await new Promise((r) => setImmediate(r)); };

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
function fmtArg(v) {
  if (typeof v === 'number') return String(Math.round(v * 1e6) / 1e6);
  if (v && typeof v === 'object' && v.__src !== undefined) return 'img:' + v.__src;
  if (v && typeof v === 'object') return v.constructor === Object ? JSON.stringify(v) : 'obj';
  return String(v);
}
const lineOf = (e) => e.tag + '.' + e.name + '(' + e.args.map(fmtArg).join(',') + ')';

// A sandbox world: the sprite scripts (and the raster files when asked) run in a fresh vm context.
function makeWorld(o) {
  const log = [], images = [];
  const Img = function () { this.complete = false; this.naturalWidth = 0; this.__src = null; };
  Object.defineProperty(Img.prototype, 'src', {
    get() { return this.__src; },
    set(v) { this.__src = v; images.push(v); if (o.images === 'load') { this.complete = true; this.naturalWidth = 256; } },
  });
  const canvas = () => ({ width: 0, height: 0, getContext: () => recCtx(log, 'bake') });
  const sb = {
    console, Math, JSON, Array, Object, String, Number, Boolean, Date, Set, Map, Proxy, Symbol, Error, TypeError, Promise, URL, URLSearchParams,
    setTimeout, clearTimeout, setImmediate, parseInt, parseFloat, isNaN, isFinite, Float32Array, Uint8Array,
    Path2D: function () { return new Proxy({}, { get: () => () => undefined }); },
    performance: { now: () => 1000 },
    location: { search: o.search || '', protocol: 'http:' },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    Image: Img,
    fetch: o.manifest ? () => Promise.resolve({ ok: true, json: () => Promise.resolve(MANIFEST) }) : () => Promise.reject(new Error('no network')),
    document: { currentScript: { src: 'http://127.0.0.1/js/view/art-raster.js' }, createElement: (tag) => (tag === 'canvas' ? canvas() : {}),
      addEventListener() {}, getElementById: () => null },
  };
  sb.window = sb; sb.self = sb; sb.globalThis = sb; sb.P = { Settings: {}, goreRGB: () => '60,40,40' };
  vm.createContext(sb);
  const files = SPRITE_SCRIPTS.concat(o.raster ? RASTER_SCRIPTS : []);
  files.forEach((f) => vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), sb, { filename: f }));
  return { P: sb.P, log, images, ctx: () => recCtx(log, 'main') };
}
async function world(o) {
  const w = makeWorld(o);
  if (o.raster) { w.P.ArtRaster.prepare(); await tick(); }
  return w;
}
// The enemy used by the scene: a fixed field set, so two worlds draw exactly the same figure.
function enemy(type, extra) {
  return Object.assign({ id: 1, type, x: 0, y: 0.2, r: 0.35, walk: 0, vx: 0, vy: 0, hp: 1, maxHp: 1, variant: 0, skin: null, state: 'walk',
    age: 1, flash: 0, elite: false, boss: false, nameKey: null, windup: 0, swell: 0, ai: null }, extra || {});
}
function rd(w, ctx) { return { ctx, ppm: 39, noGround: true, X: (x) => 100 + x * 39, Y: (y) => 200 - y * 39 }; }
// The ctx calls of a fixed scene: every enemy type in several states, the bosses, the hero and two corpses.
function scene(w, includeHero = true) {
  const log = w.log, c = w.ctx(), S = w.P.Sprites, out = [];
  const starts = [{}, { flash: 0.05 }, { elite: true }, { vx: 1.2, walk: 0.3 }];
  Object.keys(w.P.CFG.enemies).forEach((t) => starts.forEach((s) => S.enemy(rd(w, c), enemy(t, s), { x: s.vx ? 1 : -1, y: 0 })));
  Object.keys(BOSS_ARCH).concat(['brute']).forEach((t) => S.enemy(rd(w, c), enemy(t, { boss: true, nameKey: 'boss.test', windup: 0.4 }), { x: 1, y: 0 }));
  if (includeHero) S.hero(c, 100, 200, { u: 40, phase: 0.5, still: false, flash: 0, arms: 'idle', face: 1, skin: '#E0AC80', shirt: '#D7263D', pants: '#2B3346', hair: '#1E1712' });
  S.corpse(rd(w, c), { x: 0, y: 0.2, dx: 1, dy: 0, etype: 'brute', variant: 0, skin: null, id: 1, fling: false, t: 0, T: 1, pose: 'blunt', fall: 1, alpha: 1 });
  S.corpse(rd(w, c), { x: 0, y: 0.2, dx: -1, dy: 0, etype: 'walker', variant: 2, skin: null, id: 7, fling: false, t: 0.5, T: 1, pose: 'fire', fall: 0.5, alpha: 1 });
  return log.map(lineOf);
}
// The drawImage calls of the main ctx that draw from atlases (name, source rect and image src).
const atlasDraws = (log) => log.filter((e) => e.tag === 'main' && e.name === 'drawImage' && e.args[0] && e.args[0].__src).map((e) => ({
  src: e.args[0].__src, sx: e.args[1], sy: e.args[2], sw: e.args[3], sh: e.args[4] }));

async function bossScale() {
  const w = await world({ raster: true, search: '?art=raster', manifest: true, images: 'load' });
  const c = w.ctx();
  for (const [id, entry] of Object.entries(CHAR)) {
    if (entry.kind !== 'boss') continue;
    for (const role of BOSS_FRAMES) {
      const frame = entry.frames[role], correction = frame.poseScale || 1;
      w.log.length = 0;
      w.P.ArtRaster.draw(c, 'characters', id, role, 100, 200, 0.5);
      const draw = w.log.find(e => e.name === 'drawImage');
      ok(draw && Math.abs(draw.args[8] - frame.h * .5 * correction) < .001 &&
        Math.abs(draw.args[6] + frame.py * .5 * correction - 200) < .001, id + ': ' + role + ' draws at its calibrated scale about its pivot');
    }
  }
  for (const reduceMotion of [false, true]) {
    w.P.Settings.reduceMotion = reduceMotion;
    for (const t of [1.5, Infinity]) {
      w.log.length = 0;
      const e = enemy('kasapBoss', { boss: true, bossPreset: 'bigFisher', ai: { m: 'switchRecover', act: 'bridgeCast', dir: { x: 1, y: 0 }, t } });
      w.P.Sprites.enemy(rd(w, c), e, { x: 1, y: 0 });
      const scale = w.log.find(e => e.name === 'scale'), rotate = w.log.find(e => e.name === 'rotate');
      const nd = w.log.find(e => e.name === 'drawImage');
      ok(nd && scale && scale.args[1] >= .94 && scale.args[1] <= 1.06 && rotate && Math.abs(rotate.args[0]) <= .18,
        'boss recovery at ' + t + 's has a bounded lean and scale (reduce motion ' + reduceMotion + ')');
    }
  }
}

async function heroGrips() {
  const w = await world({ raster: true, search: '?art=raster', manifest: true, images: 'load' });
  const c = w.ctx(), R = rd(w, c), S = w.P.Sprites;
  const carried = [];
  w.P.WFx = { gunAt: (_, x, y) => carried.push({ x, y }) };
  const hero = { u: 40, face: 1, still: true, arms: 'knife', weapons: { nailgun: 1 },
    backHand: () => { throw Error('Raster hero must use the painted arms'); } };
  S.hero(c, 100, 200, hero);
  const front = CHAR.hero_arda.views.front.frames.idle;
  const near = (a, b) => Math.abs(a - b) < 0.01;
  ok(carried.length === 1 && near(carried[0].x, 100 + (8 - front.px) / 4) &&
    near(carried[0].y, hero.grips.left.y), 'hero: the resting nail gun attaches to the painted left hand');
  const hitAlpha = (flash) => {
    c.globalAlpha = 1;
    w.log.length = 0;
    S.hero(c, 100, 200, { ...hero, flash });
    return w.log.find(e => e.tag === 'main' && e.name === 'set:globalAlpha').args[0];
  };
  const feel = w.P.CFG.feel, fullHit = hitAlpha(feel.hitFlash);
  ok(fullHit > 0 && fullHit < 0.5 && near(hitAlpha(feel.hitFlash / 2), fullHit / 2),
    'hero: damage tint leaves the illustrated hero visible and fades out');
  c.globalAlpha = 1;
  const side = { u: 40, side: true, still: false, phase: 0.1, weapons: {}, face: 1 };
  S.hero(c, 100, 200, side);
  const left = side.grips.left.x, right = side.grips.right.x;
  side.face = -1;
  S.hero(c, 100, 200, side);
  ok(near(side.grips.left.x, 200 - right) && near(side.grips.right.x, 200 - left),
    'hero: mirroring a walking frame mirrors and swaps the painted grip positions');
  const fire = w.P.FireAnim, s = { hero: { x: 0, y: 0, fx: 1 } };
  fire.onEvent({ type: 'wfire', w: 'nailgun', ang: 0, lv: 1, n: 1 }, s);
  const calls = () => w.log.map(e => e.name);
  w.log.length = 0;
  fire.drawHeld(R, s, hero.grips);
  const translations = w.log.filter(e => e.name === 'translate').map(e => e.args);
  ok(translations.length === 2 && near(translations[0][0] + translations[1][0], hero.grips.right.x) &&
    near(translations[0][1] + translations[1][1], hero.grips.right.y) && !calls().includes('arc'),
    'hero: firing attaches the gun to the painted hand without drawing extra hands');
  const flash = fire.pool.find(p => p.alive && p.k === 'glint');
  ok(flash && near(R.X(flash.x), hero.grips.right.x + 0.31 * R.ppm) && near(R.Y(flash.y), hero.grips.right.y),
    'hero: the muzzle flash starts at the gun attached to the painted hand');
  w.log.length = 0;
  fire.drawHeld(R, s);
  ok(calls().includes('arc'), 'hero: procedural fallback still draws its animated hands after the raster pose');

  const firePose = weapon => {
    fire.reset(s);
    fire.onEvent({ type: 'wfire', w: weapon, ang: 0, lv: 1, n: 1 }, s);
    const opts = { ...hero, grips: null };
    fire.heroOpts(s, opts);
    w.log.length = 0;
    S.hero(c, 100, 200, opts);
    return { parts: w.log.filter(e => e.name === 'transform').map(e => e.args), art: atlasDraws(w.log)[0], opts };
  };
  const cut = firePose('knife'), recoil = firePose('nailgun');
  ok(cut.parts.length === 3 && recoil.parts.length === 3 && cut.parts[0][2] < 0 && recoil.parts[0][2] > 0 &&
    cut.parts[2][3] === 1 && recoil.parts[2][3] === 1 && cut.art.sx === CHAR.hero_arda.views.side.frames.walk1.x,
    'hero: torso leans toward a cut and away from recoil while the shoes stay flat');
  fire.reset(s);
  fire.onEvent({ type: 'wfire', w: 'knife', ang: 0 }, s);
  fire.onEvent({ type: 'swing', dir: -1, arcDeg: 90, back: false }, s);
  fire.onEvent({ type: 'swing', dir: 1, arcDeg: 180, back: true }, s);
  ok(fire.pose.f.dir === -1 && near(fire.pose.f.arc, Math.PI / 4), 'hero: the knife follows the actual primary swing, even on a back-swing upgrade');

  fire.reset(s);
  fire.onEvent({ type: 'wfire', w: 'sledge', ang: 0 }, s);
  fire.update(w.P.CFG.weapons.sledge.windup, s);
  const windup = {};
  fire.heroOpts(s, windup);
  ok(windup.attackMotion < 0 && windup.attack.f.impactAt === undefined, 'hero: the hammer stays braced until its actual impact event');
  fire.onEvent({ type: 'sledgeGroundStrike' }, s);
  const impact = {};
  fire.heroOpts(s, impact);
  ok(impact.attackMotion > 0 && near(impact.attack.f.impactAt, fire.pose.t), 'hero: the hammer follows through on actual impact');
  fire.update(0.19, s);
  ok(!fire.pose.on, 'hero: the hammer pose ends after its recovery');

  fire.reset(s);
  fire.onEvent({ type: 'wfire', w: 'sawblade', ang: 0, lv: 5 }, s);
  fire.update(1.2, s);
  fire.onEvent({ type: 'sawCatch', x: 0.5, y: 0 }, s);
  ok(fire.pose.id === 'sawblade' && fire.pose.f.catchDisc && fire.pose.lv === 5,
    'hero: the real disc catch starts a fresh rank-five pose after the throw animation ends');

  fire.reset(s);
  fire.onEvent({ type: 'wfire', w: 'canister', ang: 0, lv: 5 }, s);
  fire.onEvent({ type: 'wfire', w: 'nailgun', ang: Math.PI, lv: 5 }, s);
  ok(fire.pose.id === 'canister' && fire.pool.some(p => p.alive && p.k === 'glint'),
    'hero: a lighter shot still cues through a committed two-handed throw');
  fire.update(.111, s);
  ok(fire.pose.id === 'nailgun' && fire.pose.t >= .11, 'hero: the overlapping nail shot takes over with the remaining recoil, not a late second shot');

  fire.reset(s); s.hero.revving = 0.8; s.hero.revAng = 0;
  fire.onEvent({ type: 'wfire', w: 'chainsaw', ang: 0, lv: 2 }, s);
  fire.onEvent({ type: 'wfire', w: 'nailgun', ang: 0, lv: 1 }, s);
  const stacked = {};
  fire.heroOpts(s, stacked);
  w.log.length = 0;
  fire.drawHeld(R, s, hero.grips);
  ok(stacked.noArms && stacked.attackStance && w.log.some(e => e.name === 'set:fillStyle' && e.args[0] === '#E8662C') &&
    fire.pool.some(p => p.alive && p.k === 'glint'), 'hero: a nail shot still cues while the active chainsaw remains visible');
  fire.update(.111, s);
  const shot = {};
  fire.heroOpts(s, shot);
  ok(shot.attack?.id === 'nailgun', 'hero: a revving chainsaw yields the body to a fresh nail gun pose');

  fire.reset(s); s.hero.revving = 0;
  fire.onEvent({ type: 'wfire', w: 'sledge', ang: 0 }, s);
  fire.onEvent({ type: 'wfire', w: 'canister', ang: 0 }, s);
  fire.update(.12, s);
  ok(fire.pose.id === 'canister', 'hero: a heavy windup leaves a window for a competing throw');
  fire.onEvent({ type: 'sledgeGroundStrike' }, s);
  const slam = {};
  fire.heroOpts(s, slam);
  ok(slam.attack?.id === 'sledge' && slam.attackStance.bend > .2, 'hero: the real hammer impact takes back the planted pose');
}

async function attackStances() {
  const w = await world({ raster: true, search: '?art=raster', manifest: true, images: 'load' });
  const P = w.P, A = P.HeroAttacks, samples = new Set();
  function pose(id, lv, t, reduce) {
    const f = { windup: 0.5 };
    if (id === 'sledge' && t >= f.windup) f.impactAt = f.windup;
    return A.sample({ id, lv, p: t, t, T: 1, ang: 0, f }, reduce, {});
  }
  const magnitude = s => Math.hypot(s.lean, s.depth, s.height);
  for (const id of P.CFG.arsenal.weapons) {
    const style = A.style(id), at = style.beats[1][0];
    const one = pose(id, 1, at, false), five = pose(id, 5, at, false), reduced = pose(id, 5, at, true);
    samples.add(JSON.stringify(style.beats));
    ok(magnitude(five) > magnitude(one) * 1.45, id + ': rank five moves further through the same attack');
    ok(magnitude(reduced) < magnitude(one), id + ': reduced motion softens the rank-five body motion');
    const turns = Array.from({ length: 18 }, (_, n) => {
      const low = pose(id, 1, (n + 1) / 20, false), high = pose(id, 5, (n + 1) / 20, false);
      return Math.hypot(low.lean * high.depth - low.depth * high.lean, low.lean * high.height - low.height * high.lean);
    });
    ok(turns.some(n => n > 0.001), id + ': the high-rank recovery changes direction, independent of pose size');
  }
  ok(samples.size === P.CFG.arsenal.weapons.length, 'hero: each base weapon has its own body motion track');
  const distinct = Object.keys(P.CFG.evolutions).filter(id => A.style(id) !== A.style(P.CFG.evolutions[id].from));
  ok(distinct.length === Object.keys(P.CFG.evolutions).length && new Set(distinct.map(id => A.style(id))).size === distinct.length,
    'hero: every evolution has a separate body motion');
  const fire = P.FireAnim, sim = { hero: { x: 0, y: 0, fx: 1 } };
  fire.onEvent({ type: 'wfire', w: 'canister', variant: 'cluster', ang: 0 }, sim);
  const o = {};
  fire.heroOpts(sim, o);
  ok(fire.pose.id === 'cluster' && o.attackStance.arm === 'pull',
    'hero: an evolution can use its separate motion with a shared held tool');
  fire.reset(sim);
  fire.onEvent({ type: 'wfire', w: 'knife', variant: 'cleaver', ang: 0 }, sim);
  fire.drawHeld(rd(w, w.ctx()), sim);
  ok(fire.pose.id === 'cleaver' && w.log.some(e => e.name === 'set:fillStyle' && e.args[0] === '#AABCC7'),
    'hero: the cleaver renders its wide steel blade through the real held hook');
}

async function nodePart() {
  // 1. Manifest: schema, categories, and every configured type, archetype and costume resolves to an atlas with the frames the view uses.
  const m = MANIFEST;
  ok(m.schema === 1, 'manifest: schema 1');
  ['characters', 'ground', 'facades', 'props', 'weapons', 'pickups', 'effects', 'vehicles'].forEach((k) => ok(!!m[k], 'manifest: category ' + k + ' present'));
  const w0 = makeWorld({ raster: true, search: '?art=raster', manifest: true, images: 'load' });
  const types = Object.keys(w0.P.CFG.enemies).filter((t) => t !== 'walker');
  types.forEach((t) => {
    const e = CHAR[t];
    ok(!!e && ENEMY_FRAMES.every((f) => !!e.frames[f]), 'manifest: enemy ' + t + ' has frames ' + ENEMY_FRAMES.join('/'));
  });
  ['walk_office', 'walk_student', 'walk_shopper', 'walk_tourist'].forEach((v) => {
    const n = 'walker_' + v.slice(5);
    ok(!!CHAR[n] && ENEMY_FRAMES.every((f) => !!CHAR[n].frames[f]), 'manifest: walker outfit ' + n + ' has frames');
  });
  Object.keys(BOSS_ARCH).forEach((t) => ok(!!CHAR[BOSS_ARCH[t]] && BOSS_FRAMES.every((f) => !!CHAR[BOSS_ARCH[t]].frames[f]),
    'manifest: boss archetype ' + t + ' -> ' + BOSS_ARCH[t] + ' has the boss frames'));
  Object.keys(w0.P.CFG.enemyLook.bossCostumes).forEach((k) => {
    const n = 'boss_' + w0.P.CFG.enemyLook.bossCostumes[k].costume;
    ok(!!CHAR[n] && BOSS_FRAMES.every((f) => !!CHAR[n].frames[f]), 'manifest: boss costume ' + k + ' -> ' + n + ' has the boss frames');
  });
  const hv = CHAR.hero_arda && CHAR.hero_arda.views;
  ok(!!hv && ['side', 'front', 'back'].every((v) => !!hv[v] && hv[v].frames && hv[v].frames.idle && hv[v].frames.walk4), 'manifest: hero views side/front/back have idle and walk1-4');

  // 2. Frame choice and atlas per figure, from the view's own fields (flash, walk, stopped, windup, ai.m), with the manifest rect.
  const rec = (w, t, e, f) => { w.P.Sprites.enemy(rd(w, w.ctx()), e, f || { x: 1, y: 0 }); return atlasDraws(w.log); };
  const rect = (name, frame) => { const r = CHAR[name].frames[frame]; return { x: r.x, y: r.y, w: r.w, h: r.h }; };
  const same = (d, name, frame) => { const r = rect(name, frame); return !!d && d.src.indexOf('/' + name + '.png') >= 0 && d.sx === r.x && d.sy === r.y && d.sw === r.w && d.sh === r.h; };
  let w = await world({ raster: true, search: '?art=raster', manifest: true, images: 'load' });
  let d = rec(w, 'brute', enemy('brute', { vx: 0 }));
  ok(same(d[0], 'brute', 'idle'), 'frames: a stopped brute draws the idle rect from characters/brute.png');
  w = await world({ raster: true, search: '?art=raster', manifest: true, images: 'load' });
  d = rec(w, 'brute', enemy('brute', { flash: 0.05, vx: 0 }));
  ok(same(d[0], 'brute', 'hit'), 'frames: a hit brute draws the hit rect');
  const walkSeen = new Set();
  for (let i = 0; i <= 10; i++) {
    w = await world({ raster: true, search: '?art=raster', manifest: true, images: 'load' });
    d = rec(w, 'brute', enemy('brute', { vx: 1.2, walk: i * 0.1 }));
    ['walk1', 'walk2'].forEach((f) => { if (same(d[0], 'brute', f)) walkSeen.add(f); });
  }
  ok(walkSeen.size === 2, 'frames: a walking brute cycles walk1 and walk2 (' + [...walkSeen].join('/') + ')');
  w = await world({ raster: true, search: '?art=raster', manifest: true, images: 'load' });
  d = rec(w, 'boss', enemy('brute', { boss: true, nameKey: 'boss.test', windup: 0.4 }));
  ok(same(d[0], 'boss_vatman', 'attack_windup'), 'frames: a boss in wind-up draws attack_windup from boss_vatman');
  w = await world({ raster: true, search: '?art=raster', manifest: true, images: 'load' });
  d = rec(w, 'boss', enemy('brute', { boss: true, nameKey: 'boss.test', ai: { m: 'charge' } }));
  ok(same(d[0], 'boss_vatman', 'attack_hit'), 'frames: a charging boss draws attack_hit');
  w = await world({ raster: true, search: '?art=raster', manifest: true, images: 'load' });
  d = rec(w, 'boss', enemy('brute', { boss: true, nameKey: 'boss.test', flash: 0.05, vx: 0 }));
  ok(same(d[0], 'boss_vatman', 'hurt'), 'frames: a boss hit draws hurt');
  w = await world({ raster: true, search: '?art=raster', manifest: true, images: 'load' });
  const cw = [];
  w.P.Sprites.corpse(rd(w, w.ctx()), { x: 0, y: 0.2, dx: 1, dy: 0, etype: 'brute', variant: 0, skin: null, id: 1, fling: false, t: 0, T: 1, pose: 'blunt', fall: 1, alpha: 1 });
  cw.push(...atlasDraws(w.log));
  ok(cw.length === 1 && same(cw[0], 'brute', 'dead'), 'frames: a fallen brute draws only the dead rect');
  // Every configured archetype and costume resolves to its atlas (the draw path, not the manifest alone).
  for (const t of Object.keys(BOSS_ARCH)) {
    const ww = await world({ raster: true, search: '?art=raster', manifest: true, images: 'load' });
    const dd = atlasDraws((ww.P.Sprites.enemy(rd(ww, ww.ctx()), enemy(t, { boss: true, nameKey: 'boss.test' }), { x: 1, y: 0 }), ww.log));
    ok(dd.length > 0 && dd[0].src.indexOf('/' + BOSS_ARCH[t] + '.png') >= 0, 'bosses: archetype ' + t + ' draws from ' + BOSS_ARCH[t] + '.png');
  }
  for (const k of Object.keys(w0.P.CFG.enemyLook.bossCostumes)) {
    const ww = await world({ raster: true, search: '?art=raster', manifest: true, images: 'load' });
    const dd = atlasDraws((ww.P.Sprites.enemy(rd(ww, ww.ctx()), enemy('brute', { boss: true, nameKey: k }), { x: 1, y: 0 }), ww.log));
    const want = 'boss_' + w0.P.CFG.enemyLook.bossCostumes[k].costume;
    ok(dd.length > 0 && dd[0].src.indexOf('/' + want + '.png') >= 0, 'bosses: costume ' + k + ' draws from ' + want + '.png');
  }
  for (const t of types) {
    const ww = await world({ raster: true, search: '?art=raster', manifest: true, images: 'load' });
    const dd = atlasDraws((ww.P.Sprites.enemy(rd(ww, ww.ctx()), enemy(t), { x: 1, y: 0 }), ww.log));
    ok(dd.length > 0 && dd[0].src.indexOf('/' + t + '.png') >= 0, 'enemies: ' + t + ' draws from characters/' + t + '.png');
  }

  // 3. Walker outfit rule: the same id hash as test-enemy-silhouettes.js (Math.imul((id|0)+1, 0x9E3779B1) >>> 30).
  const spec = (id) => Math.imul((id | 0) + 1, 0x9E3779B1) >>> 30;
  const ww = await world({ raster: true, search: '?art=raster', manifest: true, images: 'load' });
  const LK = ww.P.CFG.enemyLook.walkerVariants;
  let walkerOk = true, used = new Set();
  for (let id = 1; id <= 400; id++) {
    const dd = atlasDraws((ww.P.Sprites.enemy(rd(ww, ww.ctx()), enemy('walker', { id }), { x: 1, y: 0 }), ww.log));
    const want = 'walker_' + LK[spec(id)].slice(5);
    if (!dd.length || dd[0].src.indexOf('/' + want + '.png') < 0) walkerOk = false;
    used.add(spec(id));
    ww.log.length = 0;
  }
  ok(walkerOk, 'walker outfits: ids 1..400 draw the outfit the id hash picks');
  ok(used.size === 4, 'walker outfits: all four outfits are picked by ids 1..400');

  // 4. Mirror and pivot math on A.draw (flip about the pivot, pivot at (x, y), scale from the caller).
  const a = await world({ raster: true, search: '?art=raster', manifest: true, images: 'load' });
  const brute = CHAR.brute.frames.idle, cl = [];
  a.P.ArtRaster.draw(recCtx(cl, 'm'), 'characters', 'brute', 'idle', 100, 200, 0.5, { mirror: true });
  const tr = cl.find((e) => e.name === 'translate'), sc = cl.find((e) => e.name === 'scale'), di = cl.find((e) => e.name === 'drawImage');
  ok(tr && tr.args[0] === 100 && tr.args[1] === 200, 'mirror: the pivot is moved to (x, y)');
  ok(sc && sc.args[0] === -1 && sc.args[1] === 1, 'mirror: scale(-1, 1) flips about the pivot');
  ok(di && di.args[5] === -brute.px * 0.5 && di.args[6] === -brute.py * 0.5, 'anchor: the drawn origin is -px*scale, -py*scale');
  ok(di && di.args[7] === brute.w * 0.5 && di.args[8] === brute.h * 0.5, 'anchor: the drawn size is the rect size times scale');
  const cl2 = [];
  a.P.ArtRaster.draw(recCtx(cl2, 'm'), 'characters', 'brute', 'idle', 100, 200, 0.5, { sx: 1.2, sy: 0.9 });
  const direct = cl2[0] && cl2[0].args;
  ok(cl2.length === 1 && cl2[0].name === 'drawImage' && direct[5] === 100 - brute.px * 0.5 * 1.2 &&
    direct[6] === 200 - brute.py * 0.5 * 0.9 && direct[7] === brute.w * 0.5 * 1.2 && direct[8] === brute.h * 0.5 * 0.9,
    'mirror off: a direct draw keeps the same pivot and squash');

  // 5. Call-log equality: flag off = no raster files at all; flag on with no images; flag on with the manifest failing.
  const plain = scene(makeWorld({ raster: false, search: '' }));
  const off = scene(makeWorld({ raster: true, search: '?art=current', manifest: true, images: 'load' }));
  const noImageFigures = scene(await world({ raster: true, search: '?art=raster', manifest: true, images: 'none' }), false);
  const noManifestFigures = scene(await world({ raster: true, search: '?art=raster', manifest: false, images: 'load' }), false);
  const fallbackNoImages = scene(await world({ raster: true, search: '?art=raster', manifest: true, images: 'none' }));
  const fallbackNoManifest = scene(await world({ raster: true, search: '?art=raster', manifest: false, images: 'load' }));
  ok(plain.length > 100 && plain.length === off.length && plain.every((l, i) => l === off[i]), 'flag off: the ctx calls match a run with no raster files (' + plain.length + ' calls)');
  ok(noImageFigures.length === fallbackNoImages.length && noImageFigures.every((l, i) => l === fallbackNoImages[i]), 'flag on, no images: no retired hero is drawn');
  ok(noManifestFigures.length === fallbackNoManifest.length && noManifestFigures.every((l, i) => l === fallbackNoManifest[i]), 'flag on, manifest fails: no retired hero is drawn');
  ok(!fallbackNoImages.some(l => l.includes('bezierCurveTo')), 'missing enemy art uses neutral footprints rather than retired body drawings');
  const onLog = scene(await world({ raster: true, search: '?art=raster', manifest: true, images: 'load' }));
  ok(onLog.some((l) => l.indexOf('img:') >= 0), 'flag on with images: the figures draw from atlases (the call log differs from the code art)');
  ok(onLog.length !== plain.length || onLog.some((l, i) => l !== plain[i]), 'flag on with images differs from the code art');
}

function chromePart() {
  return new Promise((resolve, reject) => {
    if (process.argv.indexOf('--no-chrome') >= 0 || !fs.existsSync(CHROME)) { console.log('note: headless Chrome not found or --no-chrome; Chrome smoke skipped'); resolve(); return; }
    fs.mkdirSync(OUT, { recursive: true });
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.jpg': 'image/jpeg' };
    const bad = [];
    let heroResponse, releaseHero;
    const srv = http.createServer((req, res) => {
      const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html', file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { if (!/favicon/.test(rel)) bad.push('404 ' + rel); res.writeHead(404); res.end(); return; }
      function stream() {
        res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        fs.createReadStream(file).pipe(res);
      }
      if (rel === 'assets/art/characters/hero_arda.png') {
        if (heroResponse === 'hold') { releaseHero = stream; return; }
        if (heroResponse === 'missing') { res.writeHead(404); res.end(); return; }
      }
      stream();
    });
    srv.listen(0, '127.0.0.1', async () => {
      let dir, proc, ws, failure;
      try {
        const base = 'http://127.0.0.1:' + srv.address().port;
        const port = await new Promise((r) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
        dir = fs.mkdtempSync(path.join(os.tmpdir(), 'raster-test-'));
        proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--disk-cache-size=1', '--media-cache-size=1', 'about:blank'], { stdio: 'ignore' });
        let wsUrl = null;
        for (let i = 0; i < 150 && !wsUrl; i++) { try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); const pg = l.find((x) => x.type === 'page'); if (pg) wsUrl = pg.webSocketDebuggerUrl; } catch (e) {} if (!wsUrl) await new Promise((r) => setTimeout(r, 100)); }
        ws = new WebSocket(wsUrl); let id = 0; const pend = new Map(), listeners = [];
        await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
        ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); p(m.result); } else if (m.method) listeners.forEach((f) => f(m)); };
        const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
        const errors = [], assetReq = [];
        listeners.push((m) => {
          if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; errors.push('exception: ' + ((d.exception && d.exception.description) || d.text).split('\n')[0]); }
          if (m.method === 'Network.requestWillBeSent' && /\/assets\/art\//.test(m.params.request.url)) {
            assetReq.push({ loader: m.params.loaderId, url: m.params.request.url });
          }
          if (m.method === 'Network.responseReceived' && m.params.response.status >= 400 && !/favicon/.test(m.params.response.url)) bad.push(m.params.response.status + ' ' + m.params.response.url);
        });
        const ev = async (e, userGesture = false) => (await send('Runtime.evaluate', { expression: e, returnByValue: true, userGesture })).result.value;
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
        await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
        const run = async (query) => {
          const page = await send('Page.navigate', { url: `${base}/index.html?${query}` });
          let started = false;
          for (let i = 0; i < 140; i++) {
            const state = await ev(`location.search === ${JSON.stringify('?' + query)} && window.P && P.debug && P.debug.state`);
            if (state === 'play') return page.loaderId;
            if (state === 'title' && !started) {
              await ev("document.getElementById('btn-start').click()", true);
              started = true;
            }
            await sleep(200);
          }
          throw new Error('Chrome did not enter play for ' + query + ' (state: ' + await ev("window.P && P.debug && P.debug.state") + ')');
        };
        // Raster on: a level starts, atlases load, no thrown errors, no atlas 404, screenshot saved.
        errors.length = 0; bad.length = 0; assetReq.length = 0;
        await run('level=1&skipintro=1&seed=42');
        for (let i = 0; i < 60; i++) { const st = JSON.parse((await ev('JSON.stringify(P.ArtRaster.status())')) || '{}'); if (st.loaded >= 1 || st.failed.length) break; await sleep(200); }
        const st = JSON.parse(await ev('JSON.stringify(P.ArtRaster.status())'));
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(OUT, 'smoke_art_raster_level1.png'), Buffer.from(shot.data, 'base64'));
        ok(errors.length === 0, 'chrome, default art: no thrown errors (' + errors.slice(0, 3).join('; ') + ')');
        ok(!bad.some((b) => /assets\/art\//.test(b)) && !st.failed.some((f) => /characters\//.test(f)), 'chrome, default art: no 404 for an atlas');
        ok(st.loaded >= 1, 'chrome, default art: at least one atlas loaded (' + st.loaded + ' of ' + st.atlases + ')');
        // Raster off: the page never asks for the art assets, and it plays with no errors.
        errors.length = 0; bad.length = 0; assetReq.length = 0;
        const off = await run('art=current&level=1&skipintro=1&seed=42');
        const offRequests = assetReq.filter(req => req.loader === off).map(req => req.url);
        ok(!!off && offRequests.length === 0, 'chrome, flag off: the page requests no assets/art/ file (' + offRequests.join(', ') + ')');
        ok(errors.length === 0, 'chrome, flag off: no thrown errors');

        const until = async (expression) => {
          for (let i = 0; i < 120; i++) {
            if (await ev(expression)) return true;
            await sleep(50);
          }
          return false;
        };
        const openTitle = async (mode, level) => {
          heroResponse = mode;
          await send('Page.navigate', { url: `${base}/index.html?level=${level}&skipintro=1&seed=42&lang=en` });
          if (!await until("window.P && P.debug?.state === 'title' && location.search.includes('level=" + level + "')")) throw new Error('title did not load');
          await ev(`(() => {
            const draw = P.ArtRasterChars.hero;
            P.ArtRasterChars.hero = function () {
              const result = draw.apply(this, arguments);
              if (window.firstHero === undefined) window.firstHero = result;
              return result;
            };
            document.getElementById('btn-start').click();
          })()`, true);
        };
        await openTitle('hold', 1);
        ok(await until("document.getElementById('btn-start').disabled"), 'chrome, slow hero image: Start shows loading');
        ok(await ev("P.debug.state === 'title' && P.debug.sim === null && window.firstHero === undefined"),
          'chrome, slow hero image: the run waits before its first frame');
        if (!releaseHero) throw new Error('expected the hero atlas request');
        releaseHero();
        ok(await until("P.debug.state === 'play' && window.firstHero === true"), 'chrome, slow hero image: current Arda draws on the first frame');

        await openTitle('missing', 29);
        ok(await until("document.getElementById('btn-start').textContent === 'Try again' && P.debug.state === 'title'"),
          'chrome, missing hero image: the title offers a retry');
        ok(await ev("P.debug.sim === null && window.firstHero === undefined"), 'chrome, missing hero image: no run or legacy frame');
        heroResponse = 'normal';
        await ev("document.getElementById('btn-start').click()", true);
        ok(await until("P.debug.state === 'play' && P.debug.sim.levelIndex === 29 && window.firstHero === true"),
          'chrome, repaired hero image: retry enters the intended level with current Arda');
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
      if (failure) reject(failure);
      else resolve();
    });
  });
}

(async () => {
  await bossScale();
  await heroGrips();
  await attackStances();
  await nodePart();
  await chromePart();
  console.log(fails.length ? fails.length + ' failure(s)' : 'test-art-raster: all pass (' + passes.length + ' checks)');
  fails.forEach((f) => console.log('FAIL ' + f));
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error('test-art-raster crashed:', e); process.exit(1); });
