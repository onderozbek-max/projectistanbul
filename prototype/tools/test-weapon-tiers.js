// Weapon tier tests (view only; owner feedback: weapons look alike and do not grow visibly). Checks the table in
// js/config-weapon-tiers.js (every weapon and evolution: five levels, scale/count/glow/trail non-decreasing with a strict rise,
// distinct silhouettes, evolutions unlike their base, L1 vs L5 draw gain above a minimum), the density cap and impact cap,
// the Reduce motion and Reduce flashing paths, the flash budget (flashGo only), a no-throw draw of all 35 silhouettes on a stub
// canvas, the sim state hash with the tier visuals on and off (the sim never reads the view), and the file rules (sim files never
// reference the view; new view files create no elements or images; line counts).
// Usage: node prototype/tools/test-weapon-tiers.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const FILES = ['js/config.js', 'js/config-weapons.js', 'js/config-levels.js', 'js/config-layouts.js', 'js/config-enemies3.js', 'js/config-bosses.js',
  'js/config-enemies4.js', 'js/config-enemies5.js', 'js/config-skins.js', 'js/config-stats.js', 'js/config-weapons2.js', 'js/config-weapons3.js',
  'js/config-weapon-tiers.js', 'js/config-env.js', 'js/config-objectives.js', 'js/config-modifiers.js', 'js/config-horde.js',
  'js/strings.js', 'js/strings-progress.js', 'js/journey.js', 'js/strings-weapons.js', 'js/strings-weapons2.js', 'js/strings-weapons3.js', 'js/sim/rng.js', 'js/sim/world.js',
  'js/sim/combat.js', 'js/sim/weapons.js', 'js/sim/weapons2.js', 'js/sim/weapons3.js', 'js/sim/weapons4.js', 'js/sim/weapons5.js', 'js/sim/mastery.js',
  'js/sim/enemies.js', 'js/sim/enemies2.js', 'js/sim/skills.js', 'js/sim/bosses.js', 'js/sim/layouts.js', 'js/sim/levels.js', 'js/sim/enemies3.js',
  'js/sim/skins.js', 'js/sim/skins-fisher.js', 'js/sim/enemies4.js', 'js/sim/enemies4-marti.js', 'js/sim/enemies4-cayci.js', 'js/sim/events.js', 'js/sim/events-kinds.js',
  'js/sim/env.js', 'js/sim/env-kinds.js', 'js/sim/env-zones.js', 'js/sim/env-rules.js', 'js/sim/env-portal.js',
  'js/sim/hack.js', 'js/sim/modifiers.js', 'js/sim/objectives.js', 'js/sim/objectives-kinds.js',
  'js/sim/progression.js', 'js/sim/weapons6.js', 'js/sim/horde.js', 'js/sim/director.js', 'js/sim/sim.js'];
FILES.forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const VIEW = ['js/view/weapons-fx.js', 'js/view/weapons-fx2.js', 'js/view/weapons-fx3.js', 'js/view/weapons-fx4.js', 'js/view/fire-anim-prim.js',
  'js/view/fire-anim-held.js', 'js/view/fire-anim-held2.js', 'js/view/fire-anim-held3.js', 'js/view/fire-anim-held4.js', 'js/view/fire-anim-fx.js',
  'js/view/fire-anim-fx2.js', 'js/view/fire-anim-fx3.js', 'js/view/fire-anim-fx4.js', 'js/view/fire-anim.js', 'js/view/weapon-sil-prim.js',
  'js/view/weapon-sil.js', 'js/view/weapon-sil-evo.js', 'js/view/weapon-tiers.js'];
// Stand-ins for the browser-only globals the view reads (the test drives the tier layer directly, no page).
globalThis.performance = globalThis.performance || { now: () => Date.now() };
const P = globalThis.P;
P.Settings = { reduceMotion: false, reduceFlash: false };
const flashCalls = { n: 0, allow: true };
P.Fx = P.Fx || {};
P.Fx.flashGo = function (kind) { if (kind === 'hit') flashCalls.n++; return flashCalls.allow; };
VIEW.forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const T = P.WTier, C = P.CFG.wtier, DT = 1 / 60;

const fails = [], notes = [];
let checks = 0;
const check = (cond, msg) => { checks++; if (!cond) fails.push(msg); };

// ---------- the table ----------
const BASES = P.CFG.arsenal.weapons.slice();
const EVOS = Object.keys(P.CFG.evolutions);
const ALL = BASES.concat(EVOS);
check(BASES.length === 17, 'expected 17 base weapons, got ' + BASES.length);
check(EVOS.length === 18, 'expected 18 evolutions, got ' + EVOS.length);
const nonDec = (a) => a.every((v, i) => i === 0 || v >= a[i - 1]);
const strictRise = (a) => a.some((v, i) => i > 0 && v > a[i - 1]);
const rowOf = (id) => C.weapons[id] || C.evos[id];
ALL.forEach(id => {
  const r = rowOf(id);
  check(!!r, id + ': no tier row in config-weapon-tiers.js');
  if (!r) return;
  ['scale', 'count', 'glow', 'trail', 'edge', 'after', 'ring'].forEach(k => {
    check(Array.isArray(r[k]) && r[k].length === C.levels, id + ': ' + k + ' must have ' + C.levels + ' levels');
  });
  ['scale', 'count', 'glow', 'trail'].forEach(k => {
    check(nonDec(r[k]), id + ': ' + k + ' is not non-decreasing ' + JSON.stringify(r[k]));
  });
  ['scale', 'count', 'glow'].forEach(k => {
    check(strictRise(r[k]), id + ': ' + k + ' never rises ' + JSON.stringify(r[k]));
  });
  check(Array.isArray(r.ramp) && r.ramp.length === 3 && r.ramp.every(c => /^#[0-9A-Fa-f]{6}$/.test(c)), id + ': ramp needs 3 hex stops');
  check(!!C.impact[r.cls], id + ': unknown impact class ' + r.cls);
  check(!!P.WSil[r.sil], id + ': no silhouette drawer ' + r.sil);
});

// Distinct silhouette ids across the 35 entries, and each id's layer is declared.
const sils = ALL.map(id => rowOf(id).sil);
check(new Set(sils).size === sils.length, 'silhouette ids are not all distinct: ' + sils.filter((v, i) => sils.indexOf(v) !== i).join(','));
sils.forEach(sid => check(['ground', 'air', 'both'].includes(P.WSil.layer[sid]), 'no layer for silhouette ' + sid));

// Each evolution differs from its base: its own silhouette, and its colour ramp is not the base's.
EVOS.forEach(id => {
  const base = P.CFG.evolutions[id].from;
  check(rowOf(id).sil !== rowOf(base).sil, id + ' uses the same silhouette as its base ' + base);
  check(rowOf(id).ramp.join() !== rowOf(base).ramp.join(), id + ' has the same colour ramp as its base ' + base);
});

// L1 vs L5 gain: the draw parameters at level 5 are above level 1 by a defined minimum. Gain = the sum of the relative increases
// in scale and glow, plus half the relative increase in count and trail (the shape's size, reach and number of elements).
const MIN_GAIN = 1.0;
const gains = {};
ALL.forEach(id => {
  const a = T.params(id, 1, {}), b = T.params(id, 5, {});
  const rel = (x, y) => (y - x) / Math.max(1e-6, x);
  const g = rel(a.scale, b.scale) + rel(a.glow, b.glow) + 0.5 * rel(a.count, b.count) + 0.5 * rel(a.trail, b.trail);
  gains[id] = g;
  check(g >= MIN_GAIN, id + ': L1 to L5 gain ' + g.toFixed(2) + ' is below ' + MIN_GAIN);
  check(a.col !== b.col, id + ': colour ramp does not change between L1 and L5');
});
const gainList = Object.entries(gains).sort((x, y) => x[1] - y[1]);
notes.push('weakest L1-L5 gains: ' + gainList.slice(0, 3).map(([k, v]) => k + ' ' + v.toFixed(2)).join(', '));

// ---------- density, impacts and quality ----------
const cap = C.caps;
T.reset();
const hitEv = (src, crit, dmg) => ({ type: 'hit', id: 1, x: 0, y: 0, dmg: dmg || 5, crit: !!crit, src: src, dx: 1, dy: 0 });
const fakeSim = { hero: { x: 0, y: 0, hp: 10, weapons: { knife: 5, cable: 5 }, evolved: {}, revAng: 0, chainA: 0 } };
// The sim state needs P.Weapons.state for T.update; a bare hero is enough for the view with no lists.
P.Weapons.state(fakeSim);
T.update(DT, fakeSim);
const i0 = T.stats.impacts;
for (let i = 0; i < 60; i++) T.onHit(hitEv('knife', false), fakeSim);
const accepted = T.stats.impacts - i0;
check(accepted <= cap.maxImpactsPerFrame, 'impacts per frame ' + accepted + ' exceed the cap ' + cap.maxImpactsPerFrame);
T.update(DT, fakeSim);
for (let i = 0; i < 80; i++) { T.onHit(hitEv('sawblade', false), fakeSim); T.update(DT, fakeSim); }
check(T.counts().parts <= cap.maxParts, 'impact particles ' + T.counts().parts + ' exceed the cap ' + cap.maxParts);
// Density: above caps.effects the player's alpha drops and secondary particles stop.
T.setDense(true);
const dm = T.mods();
check(dm.alpha === cap.playerAlpha, 'dense alpha ' + dm.alpha + ' is not ' + cap.playerAlpha);
check(dm.secondary === false && dm.trailOn === false && dm.afterOn === false, 'dense frames must cull secondary, trails and afterimages');
const dp = T.params('knife', 5, { dense: true, alpha: cap.playerAlpha, secondary: false, trailOn: false, afterOn: false });
check(dp.trail === 0 && dp.after === 0 && dp.edge === 1 && dp.alpha === cap.playerAlpha, 'dense params not culled');
T.setDense(false);
check(T.mods().alpha === 1, 'alpha not restored after density');

// Reduce motion: shorter trails, half the particles, no afterimages.
const rm = T.params('nailgun', 5, { reduceMotion: true });
const rn = T.params('nailgun', 5, {});
check(rm.trail < rn.trail && rm.after === 0 && rm.count < rn.count, 'reduce motion did not shorten trails, halve counts and drop afterimages');
// Quality: tiers 1 and 2 drop trails and afterimages first.
const q2 = T.params('sawblade', 5, { tier: 2, trailOn: false, afterOn: false });
check(q2.trail === 0 && q2.after === 0, 'tier 2 did not drop trails and afterimages');

// Reduce flashing: no impact flash, and the flash budget only through P.Fx.flashGo.
T.reset();
P.Settings.reduceFlash = true;
flashCalls.n = 0;
for (let i = 0; i < 5; i++) T.onHit(hitEv('knife', true, 40), fakeSim);
check(flashCalls.n === 0, 'reduce flashing still asked for hit flashes (' + flashCalls.n + ')');
P.Settings.reduceFlash = false;
flashCalls.allow = false;
flashCalls.n = 0;
T.reset();
const fl0 = T.stats.flashes;
for (let i = 0; i < 5; i++) T.onHit(hitEv('cable', true, 40), fakeSim);
check(flashCalls.n === 5, 'flash gate not consulted for each crit hit (' + flashCalls.n + ')');
check(T.stats.flashes === fl0, 'a flash was drawn while the flash budget refused it');
flashCalls.allow = true;

// ---------- no-throw draw of every silhouette (stub canvas, both passes, both reduce settings) ----------
const stubCtx = new Proxy({}, {
  get(t, k) {
    if (k in t) return t[k];
    if (k === 'createRadialGradient') return () => ({ addColorStop() {} });
    return function () { return undefined; };
  },
  set(t, k, v) { t[k] = v; return true; },
});
const R = { ctx: stubCtx, X: x => x * 32, Y: y => -y * 32, ppm: 32, cam: { x: 0, y: 0 }, W: 390, H: 844 };
let drawErr = null;
const sils35 = Array.from(new Set(sils));
['ground', 'air'].forEach(layer => {
  sils35.forEach(sid => {
    [1, 5].forEach(lv => {
      const id = ALL.find(x => rowOf(x).sil === sid), lk = T.params(id, lv, {});
      const E = { x: 1, y: 2, a: 0.5, q: 0.4, t: 0.1, T: 0.5, age: 0.2, hist: [{ x: 0, y: 0 }, { x: 0.5, y: 1 }], seed: 3, hx: 0, hy: 0,
        key: 'k', now: 1.5, layer: layer, rad: 1.2, pullR: 3, half: 0.5, n: 4, idx: 0, range: 2, src: { x: 1, y: 1, x0: 0, y0: 0, x1: 2, y1: 1,
          a: 0.3, dx: 1, dy: 0, range: 2, arc: 60, radius: 1.5, r: 1.2, e: { x: 2, y: 2 }, px: 0, py: 0, spin: 1, lv: lv, t: 0.1, T: 0.5, dist: 1,
          left: 2, wait: 0, life: 1, seed: 3, hist: [] } };
      try { P.WSil[sid](stubCtx, R, E, lk); } catch (e) { drawErr = drawErr || (sid + ' ' + layer + ' L' + lv + ': ' + e.message); }
    });
  });
});
check(!drawErr, 'silhouette draw threw: ' + drawErr);

// ---------- sim state hash with tier visuals on and off ----------
function runSim(viewOn) {
  const seed = 4242;
  const s = P.createSim(seed, { levelIndex: 11, loadout: { mastery: { knife: 0, cable: 0, sawblade: 0 } } });
  s.mode = 'play';
  if (!s.sk) P.Skills.init(s);
  P.Progression.debugGrant(s, { weapons: { knife: 5, cable: 5, sawblade: 5 }, passives: {} });
  s.hero.hp = s.hero.maxHp = 1e9;
  let wfires = 0, hits = 0;
  for (let step = 0; step < 900; step++) {
    if (step % 30 === 0) for (let k = s.enemies.length; k < 40; k++) {
      const a = (k * 0.7) + step * 0.01, r = 2 + (k % 5) * 0.8;
      P.Combat.spawnEnemy(s, 'walker', s.hero.x + Math.cos(a) * r, s.hero.y + Math.sin(a) * r, { state: 'active' });
    }
    P.stepSim(s, DT, { x: Math.cos(step * 0.05), y: Math.sin(step * 0.05) });
    const evs = P.drainEvents(s);
    evs.forEach(ev => {
      if (ev.type === 'wfire') wfires++;
      if (ev.type === 'hit') hits++;
      if (viewOn) {
        if (ev.type === 'wfire') T.onWfire(ev, s);
        if (ev.type === 'hit') T.onHit(ev, s);
      }
    });
    if (viewOn) { T.update(DT, s); T.drawAir({ ...R, ctx: stubCtx }, s); T.drawGround({ ...R, ctx: stubCtx }, s); }
  }
  const W = P.Weapons.state(s);
  const snap = JSON.stringify({
    hero: [s.hero.x, s.hero.y, s.hero.hp], enemies: s.enemies.map(e => [e.x, e.y, e.hp, e.dead ? 1 : 0]),
    projs: (s.projs || []).map(p => [p.x0, p.y0, p.x1, p.y1, p.t]), lists: Object.keys(W).filter(k => Array.isArray(W[k])).map(k => [k, W[k].length]),
    score: s.score, kills: s.kills, t: s.t, wfires, hits,
  });
  return { hash: crypto.createHash('sha1').update(snap).digest('hex'), wfires, hits };
}
const off = runSim(false), on = runSim(true);
check(on.wfires > 0 && on.hits > 0, 'the state-hash run produced no wfire or hit events (' + on.wfires + ', ' + on.hits + ')');
check(off.hash === on.hash, 'sim state differs with tier visuals on (' + on.hash.slice(0, 8) + ') and off (' + off.hash.slice(0, 8) + ')');
notes.push('sim hash ' + on.hash.slice(0, 12) + ' with and without tier visuals; ' + on.wfires + ' wfire, ' + on.hits + ' hit events');

// ---------- file rules ----------
const simDir = path.join(ROOT, 'js/sim');
fs.readdirSync(simDir).filter(f => f.endsWith('.js')).forEach(f => {
  const src = fs.readFileSync(path.join(simDir, f), 'utf8');
  check(!/WTier|WSil|WFx|FireAnim|wtier|weapon-tiers/.test(src), 'sim file ' + f + ' references the view layer');
});
['js/view/weapon-tiers.js', 'js/view/weapon-sil-prim.js', 'js/view/weapon-sil.js', 'js/view/weapon-sil-evo.js', 'js/config-weapon-tiers.js'].forEach(f => {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  check(!/createElement|new Image\b|new OffscreenCanvas|document\./.test(src), f + ' creates elements or images');
  const lines = src.split('\n').length;
  check(lines <= 600, f + ' is ' + lines + ' lines (limit 600)');
});

// ---------- report ----------
notes.push('checks run: ' + checks);
console.log(notes.join('\n'));
if (fails.length) {
  console.log('FAIL test-weapon-tiers: ' + fails.length + ' failed');
  fails.forEach(f => console.log('  - ' + f));
  process.exitCode = 1;
} else {
  console.log('PASS test-weapon-tiers (' + checks + ' checks)');
}
