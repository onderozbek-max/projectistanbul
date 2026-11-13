// Arsenal tests (workstream E1, extended by A for v0.5): unit checks (forks, mods, mastery, ults, passives), every
// weapon x every mod path x mastery 0 and 5 for PATH_SECS seconds with WANT enemies (no NaN, no exceptions), stress
// scenarios, determinism replay, L1 variety, string and icon coverage, and a stub-canvas draw smoke for every hook.
// Usage: node prototype/tools/test-arsenal.js [--secs=60] [--paths-secs=60] [--enemies=120] [--quick]
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const FILES = ['js/config.js', 'js/config-weapons.js', 'js/config-levels.js', 'js/config-layouts.js', 'js/config-enemies3.js', 'js/config-bosses.js', 'js/config-enemies4.js', 'js/config-enemies5.js', 'js/config-skins.js','js/config-stats.js', 'js/config-weapons2.js', 'js/config-weapons3.js', 'js/config-env.js',
  'js/config-objectives.js', 'js/config-modifiers.js', 'js/config-horde.js',
  'js/strings.js', 'js/strings-progress.js', 'js/journey.js', 'js/strings-weapons.js', 'js/strings-weapons2.js', 'js/strings-weapons3.js', 'js/sim/rng.js', 'js/sim/world.js',
  'js/sim/combat.js', 'js/sim/weapons.js', 'js/sim/weapons2.js', 'js/sim/weapons3.js', 'js/sim/weapons4.js', 'js/sim/weapons5.js', 'js/sim/mastery.js',
  'js/sim/enemies.js', 'js/sim/enemies2.js', 'js/sim/skills.js', 'js/sim/bosses.js', 'js/sim/layouts.js', 'js/sim/levels.js', 'js/sim/enemies3.js', 'js/sim/skins.js', 'js/sim/skins-fisher.js', 'js/sim/enemies4.js', 'js/sim/enemies4-marti.js', 'js/sim/enemies4-cayci.js','js/sim/events.js', 'js/sim/events-kinds.js',
  'js/sim/env.js', 'js/sim/env-kinds.js', 'js/sim/env-zones.js', 'js/sim/env-rules.js', 'js/sim/env-portal.js',
  'js/sim/hack.js', 'js/sim/modifiers.js', 'js/sim/objectives.js', 'js/sim/objectives-kinds.js',
  'js/sim/progression.js', 'js/sim/weapons6.js', 'js/sim/horde.js', 'js/sim/director.js', 'js/sim/sim.js'];
FILES.forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const VIEW = ['js/view/icons.js', 'js/view/icons-evo.js', 'js/view/weapons-fx.js', 'js/view/weapons-fx2.js', 'js/view/weapons-fx3.js',
  'js/view/weapons-fx4.js', 'js/view/fire-anim-prim.js', 'js/view/fire-anim-held.js', 'js/view/fire-anim-held2.js', 'js/view/fire-anim-held3.js',
  'js/view/fire-anim-held4.js', 'js/view/fire-anim-fx.js', 'js/view/fire-anim-fx2.js', 'js/view/fire-anim-fx3.js', 'js/view/fire-anim-fx4.js',
  'js/view/fire-anim.js', 'js/view/skills-fx.js', 'js/view/skill-button.js', 'js/view/input.js'];
VIEW.forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const P = globalThis.P;
if (!P.Enemies || !P.Enemies.frame) P.Enemies = { frame: function () {} };   // E2 stub fallback (test-only)
// Browser-only globals used by the view layer: no-op stand-ins for the draw smoke test.
if (!P.Sfx) P.Sfx = { play: function () {} };
if (!P.Fx) P.Fx = { addTrauma: function () {}, letter: function () {}, punch: function () {}, flashGo: function () { return true; } };
if (!P.Sprites) P.Sprites = { person: function () {}, shadow: function () {} };
if (!P.Feel) P.Feel = { hitStop: function () {} };   // T4: weapons-fx.js asks Feel for hit-stop (feel.js is not loaded here)

const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v === undefined ? true : v]));
const SECS = parseFloat(args.secs || (args.quick ? '10' : '60')), PATH_SECS = parseFloat(args['paths-secs'] || (args.quick ? '4' : '60'));
const WANT = parseInt(args.enemies || '120', 10), DT = 1 / 60;
const fails = [], notes = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };
const med = a => { const b = a.slice().sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };

const ALL_PASS = { shoes: 5, jacket: 5, gloves: 5, energy: 5, medkit: 5, nazar: 5, magnet: 5, kolonya: 5, cay: 5, lokum: 5, powerbank: 5, kask: 5 };
const ALL_W = P.CFG.arsenal.weapons.slice();
const ALL_W_L5 = Object.fromEntries(ALL_W.map(id => [id, 5]));
// One evolution per base weapon in EVOS (scenario B). The terrain evolutions share bases with EVOS, so they run in TERRAIN_EVOS.
const EVOS = { cleaver: 1, nailstorm: 1, cluster: 1, cyclone: 1, finale: 1, blacksmith: 1, stormshield: 1, foamstorm: 1,
  netspear: 1, lake: 1, twinsaw: 1, forge: 1, grinder: 1, hookpull: 1, minibus: 1 };
const TERRAIN_EVOS = { fireball: 1, arcchain: 1, carbomb: 1 };
// Weapon ids for the fire-animation draw smoke (new names, workstream A renames; old names alias in fire-anim.js).
const FIRE_IDS = ['knife', 'nailgun', 'canister', 'chain', 'sledge', 'molotov', 'fireworks', 'cable', 'speargun', 'extinguisher',
  'sawblade', 'manhole', 'torch', 'olta', 'cardoor', 'slingshot', 'chainsaw',
  'blacksmith', 'stormshield', 'foamstorm', 'netspear', 'lake', 'twinsaw', 'fireball', 'arcchain', 'carbomb',
  'skill_shield', 'skill_tea', 'forge', 'grinder', 'hookpull', 'minibus'];

function newSim(seed, levelIndex, loadout) {
  const s = P.createSim(seed, { levelIndex: levelIndex || 1, loadout: loadout || null });
  s.mode = 'play';
  if (!s.sk) P.Skills.init(s);   // only if E2's createSim hook is absent
  return s;
}

// Spawn walkers in the corridor around the hero so the swarm stays dense.
function feed(s, n) {
  const h = s.hero;
  for (let i = s.enemies.length; i < n; i++) {
    const a = s.rng.ai.range(0, Math.PI * 2), r = s.rng.ai.range(2, 7);
    const x = Math.max(-6.5, Math.min(6.5, h.x + Math.cos(a) * r)), y = Math.max(1, h.y + Math.sin(a) * r);
    P.Combat.spawnEnemy(s, s.rng.ai.chance(0.2) ? 'runner' : 'walker', x, y, { state: 'active' });
  }
}

// Resolve pending chests and level-ups first (the bot's policy: take the first offered card).
function resolve(s) {
  while (s.pendingChests > 0) P.Progression.openChest(s, P.Progression.chestReward(s));
  while (s.pendingLevels > 0) P.Progression.choose(s, P.Progression.makeOffer(s).cards[0]);
}

// Like step() but keeps hit points as they are (for tests that measure regeneration or pauses).
function stepRaw(s, input) {
  resolve(s);
  P.stepSim(s, DT, input);
  return P.drainEvents(s);
}

function step(s, input) {
  s.hero.hp = s.hero.maxHp;   // keep the stress runs alive
  resolve(s);
  P.stepSim(s, DT, input);
  return P.drainEvents(s);
}

function badNum(v) { return typeof v === 'number' && !isFinite(v); }
function scanNaN(s, where, bad) {
  const h = s.hero;
  ['x', 'y', 'hp', 'ult', 'dashCd', 'iframes'].forEach(k => { if (badNum(h[k])) bad.push(where + ' hero.' + k); });
  s.enemies.forEach(e => { if (badNum(e.x) || badNum(e.y) || badNum(e.hp)) bad.push(where + ' enemy ' + e.type); });
  if (s.ws) Object.keys(s.ws).forEach(k => {
    const v = s.ws[k];
    if (badNum(v)) bad.push(where + ' ws.' + k);
    if (Array.isArray(v)) v.forEach(o => { Object.keys(o).forEach(f => { if (badNum(o[f]) && f !== 'T') bad.push(where + ' ws.' + k + '.' + f); }); });
  });
  if (s.sk && s.sk.sweeps) s.sk.sweeps.forEach(w => { Object.keys(w).forEach(f => { if (badNum(w[f])) bad.push(where + ' sweep.' + f); }); });
}

// Mod paths per family: L3 pick (A or B) then an L5 pick under it, plus usta as the L3 or L5 third option (8 paths).
function modPaths(f) {
  const L5 = P.CFG.mods[f].L5, paths = [];
  [f + '.A', f + '.B'].forEach(l3 => {
    L5[l3.split('.')[1]].forEach(o => paths.push([l3, o]));
    paths.push([l3, 'usta']);
  });
  L5.U.forEach(o => paths.push(['usta', o]));
  return paths;
}

// ---------- unit checks ----------
function unitTests() {
  const s = newSim(7, 1);
  P.Progression.debugGrant(s, { weapons: { knife: 1 }, passives: {} });
  let ids = P.Progression.candidates(s).map(c => c.id);
  check(ids.includes('w:sledge') && ids.includes('p:nazar'), 'L1 pool missing sledge or nazar');
  check(!ids.includes('w:molotov') && !ids.includes('w:cable'), 'L1 pool leaks later unlocks');
  check(ids.includes('w:sawblade') && ids.includes('w:torch') && ids.includes('p:kolonya') && ids.includes('p:lokum'), 'L1 pool missing new L1 items');
  s.levelIndex = 3; ids = P.Progression.candidates(s).map(c => c.id);
  check(ids.includes('w:molotov'), 'molotov not unlocked at L3');
  P.CFG.debugAllWeapons = true; s.levelIndex = 1; ids = P.Progression.candidates(s).map(c => c.id);
  check(ids.includes('w:cable') && ids.includes('w:finale') === false, 'debugAllWeapons does not unlock cable');
  P.CFG.debugAllWeapons = false;

  // Dash: exact 3.2 m along facing with no walking input, i-frames, cooldown.
  const d = newSim(8, 1), h = d.hero;
  h.x = 0; h.y = 50; h.fx = 1; h.fy = 0;
  step(d, { x: 0, y: 0, dash: true, ult: false });
  for (let i = 0; i < 20; i++) step(d, { x: 0, y: 0 });
  const moved = h.x;
  check(Math.abs(moved - 3.2) < 0.05, 'dash distance ' + moved.toFixed(3) + ' != 3.2');
  check(h.dashCd > 3.0 && h.dashCd <= 3.5, 'dash cooldown not set');
  step(d, { x: 0, y: 0, dash: true });
  check(!P.Skills.dashing(d), 'dash fired during cooldown');
  notes.push('dash moved ' + moved.toFixed(2) + ' m');

  // Ultimate (Nazar, the default): charge -> fire -> empowered state and kills.
  const u = newSim(9, 1), uh = u.hero;
  feed(u, 60);
  uh.ult = 1;
  const before = u.enemies.length;
  const ev = step(u, { x: 0, y: 0, ult: true });
  check(ev.some(e => e.type === 'ult' && e.id === 'nazar'), 'nazar ult event missing');
  check(ev.some(e => e.type === 'ultUsed' && e.id === 'nazar'), 'ultUsed telemetry missing');
  check(uh.ult === 0 && P.Skills.powerMul(u) > 1, 'ult did not reset charge / empower');
  check(u.enemies.filter(e => !e.dead).length < before, 'ult killed nothing');
  notes.push('nazar ult hit ' + ev.filter(e => e.type === 'ult').map(e => e.n)[0] + ' enemies');
  ultUnits();

  // Frenzy: 70 kills within one window -> frenzy on at the 60th.
  const f = newSim(10, 1);
  feed(f, 80);
  f.enemies.forEach(e => P.Combat.damageEnemy(f, e, 9999, 0, 0, 0, false, 'test'));
  const fev = step(f, { x: 0, y: 0 }).concat(step(f, { x: 0, y: 0 }));
  check(fev.some(e => e.type === 'frenzy' && e.on), 'frenzy did not start after 60 kills');
  check(P.Skills.frenzyOn(f), 'frenzyOn false after streak');

  // Status: slow strongest-wins, root / stun, boss stagger.
  const st = { id: 1, hp: 1, st: null, boss: false };
  P.Status.apply(st, 'slow', 1, 0.4); P.Status.apply(st, 'slow', 1, 0.2);
  check(Math.abs(P.Status.speedMul(st) - 0.6) < 1e-9, 'slow should be strongest-wins');
  P.Status.apply(st, 'stun', 0.5, 1); check(P.Status.rooted(st), 'stun should root');
  const bo = { id: 2, hp: 1, boss: true }; P.Status.apply(bo, 'stun', 2, 1);
  check(bo.st.stun === undefined && Math.abs(bo.st.root - P.CFG.status.staggerBoss) < 1e-9, 'boss should only stagger');

  // Evolution: knife L5 + gloves -> cleaver through a chest; base removed; event emitted.
  const e = newSim(11, 1);
  P.Progression.debugGrant(e, { weapons: { knife: 5 }, passives: { gloves: 1 } });
  const ec = P.Progression.chestReward(e);
  check(ec.evo === 'knife' && ec.item === 'cleaver', 'chest did not offer cleaver');
  e.pendingChests = 1;
  P.Progression.openChest(e, ec);
  check(!e.hero.weapons.knife && e.hero.weapons.cleaver === 1, 'evolution did not swap weapon');
  check(P.drainEvents(e).some(x => x.type === 'evolve' && x.from === 'knife' && x.to === 'cleaver'), 'evolve event missing');
  ids = P.Progression.candidates(e).map(c => c.id);
  check(!ids.includes('w:knife') && !ids.includes('w:cleaver'), 'evolved base re-offered');

  // Passive magnet: pickup radius grows and a vacuum pulse fires.
  const m = newSim(12, 1), r0 = m.hero.pickupRadius;
  P.Progression.debugGrant(m, { passives: { magnet: 3 } });
  let vac = false;
  for (let i = 0; i < 60 * 20 && !vac; i++) vac = step(m, { x: 0, y: 0 }).some(x => x.type === 'vacuum');
  check(m.hero.pickupRadius > r0 + 1, 'magnet did not widen pickup radius');
  check(vac, 'magnet vacuum pulse never fired');

  // Nazar: crit chance rises with level; dodge is a boolean.
  const n = newSim(13, 1);
  P.Progression.debugGrant(n, { passives: { nazar: 5 } });
  check(P.Skills.critChance(n) > P.CFG.hero.critChance, 'nazar did not raise crit');
  check(typeof P.Skills.tryDodge(n, 10, 'walker') === 'boolean', 'tryDodge not boolean');
  forkUnits();
  modUnits();
  passiveUnits();
  dropReachUnits();

  // Determinism: the same seed and inputs replay identically.
  const runA = replay(21), runB = replay(21);
  check(runA === runB, 'replay not deterministic: ' + runA + ' vs ' + runB);
  notes.push('replay ' + runA);
}

// v0.5 improvised weapons: chainsaw rev (hit vs stall), slingshot lucky shot, manhole stun mod, torch scorch, and the
// wfire contract (every arsenal weapon pushes wfire with w, x, y, ang, lv, n when it fires; workstream B reads these).
function weaponUnits() {
  const cs = newSim(90, 1);
  P.Progression.debugGrant(cs, { weapons: { chainsaw: 1 }, passives: {} });
  delete cs.hero.weapons.knife;   // the starting knife would kill the target first; onAcquire also adds a 0.2 s wait
  cs.enemies = [];
  const ch = cs.hero;
  P.Combat.spawnEnemy(cs, 'walker', ch.x + 1, ch.y, { state: 'active' });
  let ev = [];
  for (let i = 0; i < 60 && !ev.some(e => e.type === 'sawRev'); i++) ev = ev.concat(step(cs, { x: 0, y: 0 }));
  check(ev.some(e => e.type === 'sawRev'), 'chainsaw did not rev on an enemy in reach');
  check(ev.some(e => e.type === 'wfire' && e.w === 'chainsaw' && e.lv === 1 && e.n === 1), 'chainsaw wfire missing or malformed');
  check(ch.revving > 0 && Number.isFinite(ch.revAng), 'chainsaw did not set revving / revAng');
  let hit = null;
  for (let i = 0; i < 180 && !hit; i++) hit = step(cs, { x: 0, y: 0 }).find(e => e.type === 'sawStall') || null;
  check(hit && hit.stalled === false && hit.hits > 0, 'chainsaw rev that hit did not end in a clean sawStall');
  check(ch.revving === 0 && !P.Weapons.state(cs).rev, 'chainsaw rev did not clear');

  // A rev that hits nothing stalls: the first tick misses (small target, narrow start of the sweep), then it goes dormant.
  const cs2 = newSim(91, 1);
  P.Progression.debugGrant(cs2, { weapons: { chainsaw: 1 }, passives: {} });
  delete cs2.hero.weapons.knife;
  cs2.enemies = [];
  const miss = P.Combat.spawnEnemy(cs2, 'walker', cs2.hero.x + 1, cs2.hero.y, { state: 'active' });
  miss.r = 0.05;
  let ev2 = [];
  for (let i = 0; i < 60 && !ev2.some(e => e.type === 'sawRev'); i++) ev2 = ev2.concat(step(cs2, { x: 0, y: 0 }));
  check(ev2.some(e => e.type === 'sawRev'), 'chainsaw stall case did not rev');
  miss.state = 'dormant';
  let stall = null;
  for (let i = 0; i < 180 && !stall; i++) stall = step(cs2, { x: 0, y: 0 }).find(e => e.type === 'sawStall') || null;
  check(stall && stall.stalled === true && stall.hits === 0, 'chainsaw rev that hit nothing did not stall');
  check(cs2.hero.cds.chainsaw > P.CFG.weapons.chainsaw.stallCd, 'chainsaw stall cooldown not added');

  // Slingshot: two marbles on one enemy in one volley make a lucky shot; the first hit is plain.
  const sl = newSim(92, 1);
  P.Progression.debugGrant(sl, { weapons: { slingshot: 1 }, passives: {} });
  sl.enemies = [];
  P.Combat.spawnEnemy(sl, 'walker', sl.hero.x + 2, sl.hero.y, { state: 'active' }).hp = 1e6;
  let plain = false, lucky = false;
  for (let i = 0; i < 300 && !lucky; i++) {
    step(sl, { x: 0, y: 0 }).forEach(x => { if (x.type === 'marbleHit') { if (x.lucky) lucky = true; else plain = true; } });
  }
  check(plain && lucky, 'slingshot lucky shot not reached (plain ' + plain + ', lucky ' + lucky + ')');

  // Manhole: the B2 mod is a stun (the old heal is gone); a bounce stuns the enemy it hits.
  const mo = newSim(93, 1);
  mo.hero.mods = { manhole: ['manhole.B', 'manhole.B2'] };
  const MM = P.Mods.of(mo, 'manhole');
  check(Math.abs(MM.stun - 0.6) < 1e-9 && MM.heal === undefined, 'manhole B2 stun mod');
  const mn = newSim(94, 1);
  P.Progression.debugGrant(mn, { weapons: { manhole: 5 }, passives: {}, mods: { manhole: ['manhole.B', 'manhole.B2'] } });
  mn.enemies = [];
  const mt = P.Combat.spawnEnemy(mn, 'walker', mn.hero.x + 2, mn.hero.y, { state: 'active' });
  mt.hp = 1e6;
  let bounced = false;
  for (let i = 0; i < 240 && !bounced; i++) bounced = step(mn, { x: 0, y: 0 }).some(x => x.type === 'manholeBounce');
  check(bounced && P.Status.rooted(mt), 'manhole bounce did not stun the enemy it hit');

  // Blowtorch: the jet ends in a scorch zone that burns.
  const tc = newSim(95, 1);
  P.Progression.debugGrant(tc, { weapons: { torch: 1 }, passives: {} });
  tc.enemies = [];
  P.Combat.spawnEnemy(tc, 'walker', tc.hero.x + 1, tc.hero.y, { state: 'active' }).hp = 1e6;
  let scorched = false;
  for (let i = 0; i < 240 && !scorched; i++) { step(tc, { x: 0, y: 0 }); scorched = tc.zones.some(z => z.kind === 'scorch'); }
  check(scorched, 'torch never left a scorch zone');

  // wfire contract: every arsenal weapon at L5 with enemies around pushes wfire, and each one carries the fields the view reads.
  ALL_W.forEach(id => {
    const wf = newSim(96, 11);
    P.Progression.debugGrant(wf, { weapons: { [id]: 5 }, passives: {} });
    feed(wf, 40);
    const shots = [];
    for (let i = 0; i < 240; i++) step(wf, { x: 0, y: 0 }).forEach(x => { if (x.type === 'wfire') shots.push(x); });
    check(shots.some(x => x.w === id), 'no wfire from ' + id);
    check(shots.every(x => [x.x, x.y, x.ang].every(Number.isFinite) && x.lv >= 1 && x.n >= 1), 'malformed wfire from ' + id);
  });
}

// W lane tests (AUDIT-6 W1-W3, depth pass) live in test-arsenal-w.js.
const W = require('./test-arsenal-w.js')({ P, newSim, step, feed, check, notes, DT, ALL_W, ALL_W_L5, ALL_PASS, modPaths });

// Ults chosen in meta: locked ults fall back to Nazar; convoy and horn fire and emit ids.
function ultUnits() {
  const k = newSim(73, 1, { ult: 'convoy' });
  check(P.Skills.ultId(k) === 'nazar', 'convoy not locked at L1');
  k.levelIndex = 6;
  check(P.Skills.ultId(k) === 'convoy', 'convoy not selected at L6');
  feed(k, 60); k.hero.ult = 1;
  const kev = step(k, { x: 0, y: 0, ult: true });
  check(kev.some(e => e.type === 'ult' && e.id === 'convoy'), 'convoy ult event missing');
  check(kev.some(e => e.type === 'ultUsed' && e.id === 'convoy'), 'convoy ultUsed missing');
  check(k.sk.sweeps.length === 1 && k.sk.sweeps[0].kind === 'convoy', 'convoy sweep not started');
  for (let i = 0; i < 200; i++) step(k, { x: 0, y: 0 });
  check(k.sk.sweeps.length === 0, 'convoy sweep did not end');

  const hz = newSim(74, 11, { ult: 'horn' });
  check(P.Skills.ultId(hz) === 'horn', 'horn not selected at L11');
  feed(hz, 60); hz.hero.ult = 1;
  const hev = step(hz, { x: 0, y: 0, ult: true });
  check(hev.some(e => e.type === 'ult' && e.id === 'horn'), 'horn ult event missing');
  const wave = hz.sk.sweeps[0];
  for (let i = 0; i < 90; i++) stepRaw(hz, { x: 0, y: 0 });
  check(!!wave && Object.keys(wave.hit).length > 0, 'horn hit nothing');
}

// Forks: L3 offers two mods; the pick is stored and announced; L5 follows the first branch; rank 3 adds usta.
function forkUnits() {
  const f = newSim(71, 3);
  P.Progression.debugGrant(f, { weapons: { sawblade: 2 }, passives: {} });
  let cs = P.Progression.candidates(f).filter(c => c.item === 'sawblade');
  check(cs.length === 1 && cs[0].next === 3 && cs[0].fork === 'L3' && cs[0].mods.length === 2, 'sawblade L3 fork card');
  P.Progression.choose(f, Object.assign(cs[0], { pick: 1 }));
  check(f.hero.mods && f.hero.mods.sawblade && f.hero.mods.sawblade[0] === 'sawblade.B', 'fork pick not stored');
  check(P.drainEvents(f).some(e => e.type === 'modChosen' && e.mod === 'sawblade.B'), 'modChosen missing');
  P.Progression.debugGrant(f, { weapons: { sawblade: 4 }, mods: { sawblade: ['sawblade.B'] } });
  cs = P.Progression.candidates(f).filter(c => c.item === 'sawblade');
  check(cs.length === 1 && cs[0].fork === 'L5' && cs[0].mods.join() === 'sawblade.B1,sawblade.B2', 'L5 follows branch B');
  const r3 = newSim(72, 3, { mastery: { sawblade: 3 } });
  P.Progression.debugGrant(r3, { weapons: { sawblade: 2 } });
  cs = P.Progression.candidates(r3).filter(c => c.item === 'sawblade');
  check(cs[0].mods.indexOf('usta') >= 0 && cs[0].mods.length === 3, 'rank 3 did not add usta');
}

function modUnits() {
  const mo = newSim(80, 1);
  mo.hero.mods = { canister: ['canister.A', 'canister.A1'] };
  const M = P.Mods.of(mo, 'canister');
  check(Math.abs(M.area - 1.6) < 1e-9 && M.echo && M.echo.delay === 0.45, 'mod composition (canister A + A1)');
  mo.hero.mods = { knife: ['usta'] };
  check(P.Mods.of(mo, 'knife').usta === true, 'usta flag');
  const need = P.CFG.mastery.need;
  check(P.Mastery.rank('knife', need[0] - 1) === 0 && P.Mastery.rank('knife', need[0]) === 1 && P.Mastery.rank('knife', need[4]) === 5, 'mastery ranks');
  check(P.Mastery.srcToWeapon('cleaver') === 'knife' && P.Mastery.srcToWeapon('sawblade') === 'sawblade', 'source map');
  mo.loadout = { mastery: { knife: 5 } };
  const b = P.Mastery.bonus(mo, 'knife');
  check(Math.abs(b.dmg - 1.15) < 1e-9 && Math.abs(b.cd - 0.9) < 1e-9, 'rank 5 bonus');
  mo.loadout = { mastery: { canister: 5 } }; mo.hero.mods = {};
  let A = null;
  for (let i = 0; i < 5; i++) A = P.Mods.act(mo, 'canister');
  check(!!A.sig, 'rank 5 signature on the 5th action');
  P.CFG.debugMastery = 5;
  check(P.Mastery.runRank(mo, 'anything') === 5, 'debugMastery override');
  P.CFG.debugMastery = undefined;
}

// Passives: kask caps big hits, lokum scales XP, kolonya heals on level-up, powerbank shortens dash, çay regenerates.
function passiveUnits() {
  const q = newSim(75, 1);
  q.hero.passives.kask = 2;
  check(P.Skills.hitReduce(q, 20, 'walker') === 16 && P.Skills.hitReduce(q, 10, 'walker') === 10, 'kask reduction');
  q.hero.passives.kask = 5;
  check(P.Skills.hitReduce(q, 20, 'walker') === 10, 'kask never below half');
  const l = newSim(76, 1);
  l.hero.passives.lokum = 2; l.xp = 0; l.enemies = [];   // no crowd cost (xp.crowd): these tests check the passives only
  P.Progression.addXp(l, 1);
  check(l.level === 1 && Math.abs(l.xp - 1.2) < 1e-9, 'lokum XP scaling');
  const kk = newSim(77, 1);
  kk.hero.passives.kolonya = 1; kk.hero.hp = 10; kk.enemies = [];
  P.Progression.addXp(kk, P.xpNeed(kk.level));
  check(P.drainEvents(kk).some(e => e.type === 'kolonya') && kk.hero.hp > 10, 'kolonya heal on level-up');
  const pb = newSim(78, 1);
  pb.hero.passives.powerbank = 5;
  step(pb, { x: 0, y: 0, dash: true });
  check(Math.abs(pb.hero.dashCd - P.CFG.skills.dash.cooldown * (1 - 5 * P.CFG.passives.powerbank.dashPerLevel)) < 1e-6, 'powerbank dash cooldown');
  const c = newSim(79, 1);
  c.hero.passives.cay = 2; c.hero.hp = 50;
  for (let i = 0; i < 120; i++) stepRaw(c, { x: 0, y: 0 });
  check(c.hero.hp > 50, 'cay regen while still');
}

// Side-kill gems stay inside the hero's reach (view.heroClampX) and get picked up (AUDIT-7 L22 seed 10 stall).
function dropReachUnits() {
  const hx = P.CFG.view.heroClampX;
  for (const side of [1, -1]) {
    const q = newSim(79 + side, 22);
    q.hero.x = side * hx; q.hero.y = 52;
    P.Combat.killEnemy(q, P.Combat.spawnEnemy(q, 'walker', side * 6.4, 52, { state: 'active' }), false, 'test');
    const gems = q.drops.filter(d => d.kind === 'xp');
    check(gems.length === 1 && Math.abs(gems[0].x) <= hx + 1e-9, 'XP gem from a side kill stays in hero reach');
    for (let i = 0; i < 120; i++) stepRaw(q, { x: 0, y: 0 });
    check(gems.every(g => !q.drops.includes(g)), 'XP gem from a side kill is collected');
  }
}

function replay(seed) {
  const s = newSim(seed, 1);
  P.Progression.debugGrant(s, { weapons: ALL_W_L5, passives: ALL_PASS, mods: Object.fromEntries(ALL_W.map(f => [f, modPaths(f)[0]])) });
  feed(s, 60);
  for (let i = 0; i < 600; i++) step(s, { x: Math.sin(i / 40), y: Math.cos(i / 53) * 0.6, dash: i % 200 === 0 });
  return [s.hero.x.toFixed(6), s.hero.y.toFixed(6), s.kills, s.enemies.length].join(',');
}

// ---------- every weapon x every mod path x mastery 0 and 5 (PATH_SECS seconds, WANT enemies) ----------
function pathRuns() {
  let runs = 0, t0 = Date.now(), sigMiss = [];
  ALL_W.forEach(fam => {
    modPaths(fam).forEach(picks => {
      [0, 5].forEach(rank => {
        const label = fam + ' [' + picks.join(' > ') + '] m' + rank;
        const got = runPath(label, fam, picks, rank);
        runs++;
        if (rank === 5 && P.CFG.sig[fam] && PATH_SECS >= 20 && !got.sig) sigMiss.push(label);
      });
    });
  });
  const ms = (Date.now() - t0) / Math.max(1, runs);
  notes.push('path runs: ' + runs + ' (' + ALL_W.length + ' weapons x 8 mod paths x mastery 0/5), ' + PATH_SECS + ' s each, ' + ms.toFixed(0) + ' ms wall per run');
  check(sigMiss.length === 0, 'rank 5 signature never fired for: ' + sigMiss.slice(0, 6).join('; '));
}

function runPath(label, fam, picks, rank) {
  const s = newSim(61, 11, { mastery: { [fam]: rank } });
  P.Progression.debugGrant(s, { weapons: { [fam]: 5 }, passives: ALL_PASS, mods: { [fam]: picks } });
  const bad = [], got = { sig: 0 };
  const steps = Math.round(PATH_SECS / DT);
  for (let i = 0; i < steps; i++) {
    feed(s, WANT);
    const input = { x: Math.sin(i / 90), y: Math.cos(i / 70) * 0.8, dash: i % 220 === 0, ult: s.hero.ult >= 1 && i % 30 === 0 };
    const ev = step(s, input);
    ev.forEach(x => {
      if (x.type === 'masteryMove' && x.weapon === fam) got.sig++;
      Object.keys(x).forEach(k => { if (badNum(x[k])) bad.push(label + ' event ' + x.type + '.' + k); });
    });
    if (i % 60 === 0) scanNaN(s, label + ' step ' + i, bad);
  }
  check(bad.length === 0, label + ' NaN: ' + bad.slice(0, 3).join('; '));
  check(s.hero.weapons[fam] === 5 || (s.hero.evolved && s.hero.evolved[fam]), label + ' weapon lost');
  return got;
}

// ---------- stress: all weapons at L5 for SECS seconds ----------
function stress(label, grant) {
  const s = newSim(31, 1);
  P.Progression.debugGrant(s, grant);
  const bad = [], counts = {};
  let peak = 0, steps = Math.round(SECS / DT), t0 = Date.now(), simMs = 0;
  for (let i = 0; i < steps; i++) {
    feed(s, WANT);
    const h = s.hero;
    const input = { x: Math.sin(i / 90), y: Math.cos(i / 70) * 0.8, dash: i % 220 === 0, ult: h.ult >= 1 && i % 30 === 0 };
    const t1 = Date.now();
    const ev = step(s, input);
    simMs += Date.now() - t1;
    ev.forEach(x => {
      counts[x.type] = (counts[x.type] || 0) + 1;
      Object.keys(x).forEach(k => { if (badNum(x[k])) bad.push(label + ' event ' + x.type + '.' + k); });
    });
    peak = Math.max(peak, s.enemies.length);
    if (i % 60 === 0) scanNaN(s, label + ' step ' + i, bad);
  }
  check(bad.length === 0, label + ' NaN: ' + bad.slice(0, 5).join('; '));
  check(peak >= WANT, label + ' peak enemies only ' + peak);
  notes.push(label + ': ' + SECS + ' s, peak ' + peak + ' enemies, kills ' + s.kills + ', ' + (simMs / steps).toFixed(3) + ' ms/step (step + events, ' + ((Date.now() - t0) / steps).toFixed(3) + ' ms with feed)');
  notes.push(label + ' events: ' + Object.keys(counts).sort().map(k => k + '=' + counts[k]).join(' '));
}

// ---------- L1 variety: 30 seeds, 10 level-ups, the first card is taken each time (as the bot does) ----------
function variety() {
  const offered = [], picked = [], forks = [], forkOffered = [];
  for (let seed = 1; seed <= 30; seed++) {
    const s = newSim(100 + seed, 1), off = new Set(), pk = new Set();
    let f = 0, fo = 0;
    for (let k = 0; k < 10; k++) {
      const offer = P.Progression.makeOffer(s);
      offer.cards.forEach(c => off.add(c.item));
      if (offer.cards.some(c => c.fork)) fo++;
      const card = offer.cards[0];
      pk.add(card.item);
      if (card.fork) f++;
      P.Progression.choose(s, card);
    }
    offered.push(off.size); picked.push(pk.size); forks.push(f); forkOffered.push(fo);
  }
  notes.push('L1 variety (30 seeds, 10 level-ups): distinct items offered median ' + med(offered) + ', picked median ' + med(picked) +
    '; forks picked per run median ' + med(forks) + ' (runs with one ' + forks.filter(x => x > 0).length + '/30); ' +
    'runs offered a fork card ' + forkOffered.filter(x => x > 0).length + '/30');
}

// ---------- strings and icons for every new id ----------
function coverage() {
  const ids = P.CFG.arsenal.weapons.concat(P.CFG.arsenal.passives, Object.keys(P.CFG.evolutions));
  ids.forEach(id => {
    ['tr', 'en'].forEach(lang => {
      check(P.STR[lang]['item.' + id], 'missing item.' + id + ' (' + lang + ')');
      check(P.STR[lang]['desc.' + id], 'missing desc.' + id + ' (' + lang + ')');
    });
    if (P.CFG.arsenal.weapons.includes(id)) {
      ['tr', 'en'].forEach(lang => check(P.STR[lang]['desc.' + id + '.up'], 'missing desc.' + id + '.up (' + lang + ')'));
    }
    check(P.Icons.ids.includes(id), 'missing icon ' + id);
  });
  const keys = [];
  Object.keys(P.CFG.modDefs).concat(['usta']).forEach(id => keys.push('mod.' + id, 'moddesc.' + id));
  P.CFG.arsenal.weapons.forEach(f => keys.push('sig.' + f));
  ['mastery.chip', 'mastery.rank.1', 'mastery.rank.2', 'mastery.rank.3', 'mastery.rank.4', 'mastery.rank.5', 'mastery.bonus',
    'fork.pick', 'card.mod', 'ult.convoy.name', 'ult.convoy.desc', 'ult.horn.name', 'ult.horn.desc',
    'frenzy.on', 'nearMiss', 'evo.title', 'evo.label', 'dash.name', 'ult.name', 'nazar.dodge'].forEach(k => keys.push(k));
  keys.forEach(k => ['tr', 'en'].forEach(l => check(P.STR[l][k], 'missing ' + k + ' (' + l + ')')));
  ['fork', 'mastery', 'usta', 'convoy', 'horn', 'dash', 'ult'].forEach(id => check(P.Icons.ids.includes(id), 'missing icon ' + id));
  // Card stat rows must render (no NaN / undefined) at every level, including evolutions.
  const cards = [];
  P.CFG.arsenal.weapons.forEach(id => { for (let n = 1; n <= 5; n++) cards.push({ id: 'w:' + id, item: id, next: n }); });
  Object.keys(P.CFG.evolutions).forEach(id => cards.push({ id: 'w:' + id, item: id, next: 5, evo: P.CFG.evolutions[id].from }));
  P.CFG.arsenal.passives.forEach(id => { for (let n = 1; n <= 5; n++) cards.push({ id: 'p:' + id, item: id, next: n }); });
  cards.forEach(c => P.Progression.statLines(c).forEach(r => {
    const txt = String(r.a) + String(r.b);
    check(!/NaN|undefined/.test(txt), 'stat row broken for ' + c.item + ' L' + c.next + ': ' + txt);
    check(P.STR.tr[r.k] && P.STR.en[r.k], 'missing stat key ' + r.k);
  }));
}

// ---------- draw smoke: every render hook against a stub canvas; flags non-finite numbers passed to draw calls ----------
function stubCtx(bad) {
  const t = {}, gradient = { addColorStop() {} };
  const proxy = new Proxy(t, {
    get(obj, k) {
      if (k in obj || typeof k !== 'string') return obj[k];
      if (k === 'createRadialGradient' || k === 'createLinearGradient') return (...a) => { chk(k, a); return gradient; };
      if (k === 'roundRect') return undefined;   // exercise the rect() fallback
      return (...a) => { chk(k, a); return proxy; };
    },
    set(obj, k, v) { if (typeof v === 'number' && !isFinite(v)) bad.push('prop ' + String(k)); obj[k] = v; return true; },
  });
  function chk(k, a) { a.forEach(v => { if (typeof v === 'number' && !isFinite(v)) bad.push('call ' + k); }); }
  return proxy;
}

function drawSmoke(label, grant, frames, opts) {
  const bad = [], ctx = stubCtx(bad), o = opts || {};
  const s = newSim(41, o.levelIndex || 1, { ult: o.ult || 'nazar' });
  P.Progression.debugGrant(s, grant);
  const ppm = 32.5, R = { ctx: ctx, W: 390, H: 844, ppm: ppm };
  R.X = x => (x - s.hero.x) * ppm + 195;
  R.Y = y => -(y - s.hero.y) * ppm + 422;
  const bh = P.WFx.heroBackHand(s);
  let drawMs = 0, fireMs = 0;
  for (let i = 0; i < frames; i++) {
    feed(s, WANT);
    const input = { x: Math.sin(i / 90), y: Math.cos(i / 70) * 0.8, dash: i % 220 === 0, ult: s.hero.ult >= 1 && i % 30 === 0 };
    if (o.ult && i % 120 === 0) s.hero.ult = 1;
    const ev = step(s, input);
    ev.forEach(x => P.WFx.onEvent(x, s));
    P.WFx.update(DT, s);
    // Fire animation (workstream B): synthetic wfire events cycle the 17 weapons (the sim emits them once A lands).
    if (P.FireAnim) {
      if (i % 7 === 0) P.FireAnim.onEvent({ type: 'wfire', w: FIRE_IDS[(i / 7 | 0) % FIRE_IDS.length], ang: (i * 0.37) % 6.28, lv: 1 + (i % 5), n: 1 + (i % 4) }, s);
      if (i % 90 === 45) { s.hero.revving = 0.9; s.hero.revAng = 0.4; }
      P.FireAnim.update(DT, s);
    }
    const t0 = performance.now();
    try {
      P.WFx2.drawGround(R, s); P.WFx.drawParts(R); P.SkillsFx.drawUnder(R, s);
      P.WFx.drawChain(R, s); P.WFx.drawProjectiles(R, s); P.WFx2.drawAir(R, s);
      P.SkillsFx.drawOver(R, s); P.WFx.drawCombo(R); P.SkillsFx.screen(R, s);
      bh(ctx, { x: 0, y: 0 }, 32, i % 2 ? 1 : -1, '#E0AC80', '#D7263D');
    } catch (err) { fails.push(label + ' draw threw at frame ' + i + ': ' + err.message); break; }
    drawMs += performance.now() - t0;
    if (P.FireAnim) {
      const t1 = performance.now();
      try {
        const ho = { u: 1 }; P.FireAnim.heroOpts(s, ho); P.FireAnim.drawHeld(R, s); P.FireAnim.drawFx(R, s);
      } catch (err) { fails.push(label + ' fire anim threw at frame ' + i + ': ' + err.stack.split('\n').slice(0, 3).join(' | ')); break; }
      fireMs += performance.now() - t1;
    }
    if (s.hero) s.hero.revving = Math.max(0, (s.hero.revving || 0) - DT);
  }
  check(bad.length === 0, label + ' non-finite draw values: ' + [...new Set(bad)].slice(0, 6).join(', '));
  notes.push(label + ' draw smoke: ' + frames + ' frames, ' + (drawMs / frames).toFixed(3) + ' ms/frame (stub canvas, JS only)');
  if (P.FireAnim) notes.push(label + ' fire anim draw: ' + (fireMs / frames).toFixed(3) + ' ms/frame (held + fx, stub canvas)');
}

// Bases at L5 with their evolutions (each base appears once). Terrain grant: the three terrain evolutions, one per base.
const EVOLVED_GRANT = { weapons: Object.assign({ sledge: 5, molotov: 5, cable: 5, speargun: 5, extinguisher: 5, torch: 5, chainsaw: 5,
  olta: 5, cardoor: 5, sawblade: 5 }, EVOS), passives: ALL_PASS };
const TERRAIN_GRANT = { weapons: Object.assign({ molotov: 5, chain: 5, canister: 5 }, TERRAIN_EVOS), passives: ALL_PASS };
const MODS_L3A = Object.fromEntries(ALL_W.map(f => [f, modPaths(f)[modPaths(f).length - 1]]));
unitTests();
weaponUnits();
W.terrainUnits();
W.depthUnits();
W.skillUnits();
W.inputUnits();
W.tagUnits();
coverage();
variety();
pathRuns();
stress('scenario A (all 17 weapons at L5, mods on)', { weapons: ALL_W_L5, passives: ALL_PASS, mods: MODS_L3A });
stress('scenario B (all evolutions + evolvable base weapons)', EVOLVED_GRANT);
stress('scenario C (terrain evolutions)', TERRAIN_GRANT);
drawSmoke('draw A', { weapons: ALL_W_L5, passives: ALL_PASS, mods: MODS_L3A }, 900);
drawSmoke('draw B', EVOLVED_GRANT, 900);
drawSmoke('draw E (terrain evolutions)', TERRAIN_GRANT, 600);
drawSmoke('draw C (convoy ult)', { weapons: ALL_W_L5, passives: ALL_PASS, mods: MODS_L3A }, 600, { ult: 'convoy', levelIndex: 11 });
drawSmoke('draw D (horn ult)', { weapons: ALL_W_L5, passives: ALL_PASS, mods: MODS_L3A }, 600, { ult: 'horn', levelIndex: 11 });
console.log(notes.join('\n'));
if (fails.length) { console.log('FAIL (' + fails.length + '):\n  ' + fails.join('\n  ')); process.exitCode = 1; }
else console.log('PASS');
