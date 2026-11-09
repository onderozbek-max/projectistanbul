// Arsenal tests (workstream E1): unit checks, determinism replay, force-grant stress run, string/icon coverage.
// Usage: node prototype/tools/test-arsenal.js [--secs=60] [--enemies=120]
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const FILES = ['js/config.js', 'js/config-weapons.js', 'js/config-levels.js', 'js/strings.js', 'js/journey.js',
  'js/strings-weapons.js', 'js/sim/rng.js', 'js/sim/world.js', 'js/sim/combat.js', 'js/sim/weapons.js',
  'js/sim/weapons2.js', 'js/sim/weapons3.js', 'js/sim/enemies.js', 'js/sim/skills.js', 'js/sim/bosses.js',
  'js/sim/levels.js', 'js/sim/progression.js', 'js/sim/director.js', 'js/sim/sim.js'];
FILES.forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const VIEW = ['js/view/icons.js', 'js/view/weapons-fx.js', 'js/view/weapons-fx2.js', 'js/view/weapons-fx3.js',
  'js/view/skills-fx.js', 'js/view/input.js'];
VIEW.forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const P = globalThis.P;
if (!P.Enemies || !P.Enemies.frame) P.Enemies = { frame: function () {} };   // E2 stub fallback (test-only)
// Browser-only globals used by the view layer: no-op stand-ins for the draw smoke test.
if (!P.Sfx) P.Sfx = { play: function () {} };
if (!P.Fx) P.Fx = { addTrauma: function () {}, letter: function () {}, punch: function () {} };
if (!P.Sprites) P.Sprites = { person: function () {}, shadow: function () {} };

const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v === undefined ? true : v]));
const SECS = parseFloat(args.secs || '60'), WANT = parseInt(args.enemies || '120', 10), DT = 1 / 60;
const fails = [], notes = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };

const ALL_BASE = { knife: 5, nailgun: 5, canister: 5, chain: 5, sledge: 5, molotov: 5, fireworks: 5, cable: 5, speargun: 5, extinguisher: 5 };
const ALL_PASS = { shoes: 5, jacket: 5, gloves: 5, energy: 5, medkit: 5, nazar: 5, magnet: 5 };
const EVOS = { cleaver: 1, nailstorm: 1, cluster: 1, cyclone: 1, finale: 1 };

function newSim(seed, levelIndex) {
  const s = P.createSim(seed, { levelIndex: levelIndex || 1 });
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

// One simulated step with the same hook order as E2's stepSim (skills, weapons, status).
// Resolve pending chests and level-ups first (the bot's policy: take the first offered card).
function resolve(s) {
  while (s.pendingChests > 0) P.Progression.openChest(s, P.Progression.chestReward(s));
  while (s.pendingLevels > 0) P.Progression.choose(s, P.Progression.makeOffer(s).cards[0]);
}

function step(s, input) {
  s.hero.hp = s.hero.maxHp;   // keep the stress run alive
  resolve(s);
  P.stepSim(s, DT, input);
  return P.drainEvents(s);
}

function badNum(v) { return typeof v === 'number' && !isFinite(v); }
function scanNaN(s, where, bad) {
  const h = s.hero;
  ['x', 'y', 'hp', 'ult', 'dashCd', 'iframes', 'chainA', 'cleaA', 'cycA'].forEach(k => { if (badNum(h[k])) bad.push(where + ' hero.' + k); });
  s.enemies.forEach(e => { if (badNum(e.x) || badNum(e.y) || badNum(e.hp)) bad.push(where + ' enemy ' + e.type); });
  if (s.ws) Object.keys(s.ws).forEach(k => s.ws[k].forEach(o => { Object.keys(o).forEach(f => { if (badNum(o[f]) && f !== 'T') bad.push(where + ' ws.' + k + '.' + f); }); }));
}

// ---------- unit checks ----------
function unitTests() {
  const s = newSim(7, 1);
  P.Progression.debugGrant(s, { weapons: { knife: 1 }, passives: {} });
  let ids = P.Progression.candidates(s).map(c => c.id);
  check(ids.includes('w:sledge') && ids.includes('p:nazar'), 'L1 pool missing sledge or nazar');
  check(!ids.includes('w:molotov') && !ids.includes('w:cable'), 'L1 pool leaks later unlocks');
  s.levelIndex = 3; ids = P.Progression.candidates(s).map(c => c.id);
  check(ids.includes('w:molotov'), 'molotov not unlocked at L3');
  P.CFG.debugAllWeapons = true; s.levelIndex = 1; ids = P.Progression.candidates(s).map(c => c.id);
  check(ids.includes('w:cable') && ids.includes('w:finale') === false, 'debugAllWeapons does not unlock cable');
  P.CFG.debugAllWeapons = false;

  // Dash: exact 3.2 m along facing with no walking input, i-frames, cooldown.
  const d = newSim(8, 1), h = d.hero;
  h.x = 0; h.y = 50; h.fx = 1; h.fy = 0;
  step(d, { x: 0, y: 0, dash: true, ult: false });
  let moved = 0; for (let i = 0; i < 20; i++) step(d, { x: 0, y: 0 });
  moved = h.x;
  check(Math.abs(moved - 3.2) < 0.05, 'dash distance ' + moved.toFixed(3) + ' != 3.2');
  check(h.dashCd > 3.0 && h.dashCd <= 3.5, 'dash cooldown not set');
  step(d, { x: 0, y: 0, dash: true });
  check(!P.Skills.dashing(d), 'dash fired during cooldown');
  notes.push('dash moved ' + moved.toFixed(2) + ' m');

  // Ultimate: charge -> fire -> empowered state and kills.
  const u = newSim(9, 1), uh = u.hero;
  feed(u, 60);
  uh.ult = 1;
  const before = u.enemies.length;
  const ev = step(u, { x: 0, y: 0, ult: true });
  check(ev.some(e => e.type === 'ult'), 'ult event missing');
  check(uh.ult === 0 && P.Skills.powerMul(u) > 1, 'ult did not reset charge / empower');
  check(u.enemies.filter(e => !e.dead).length < before, 'ult killed nothing');
  notes.push('ult hit ' + ev.filter(e => e.type === 'ult').map(e => e.n)[0] + ' enemies');

  // Frenzy: 70 kills within one window -> frenzy on at the 60th.
  const f = newSim(10, 1);
  feed(f, 80);
  f.enemies.forEach(e => P.Combat.damageEnemy(f, e, 9999, 0, 0, 0, false, 'test'));
  let fev = step(f, { x: 0, y: 0 }).concat(step(f, { x: 0, y: 0 }));
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

  // Determinism: the same seed and inputs replay identically.
  const runA = replay(21), runB = replay(21);
  check(runA === runB, 'replay not deterministic: ' + runA + ' vs ' + runB);
  notes.push('replay ' + runA);
}

function replay(seed) {
  const s = newSim(seed, 1);
  P.Progression.debugGrant(s, { weapons: ALL_BASE, passives: ALL_PASS });
  feed(s, 60);
  for (let i = 0; i < 600; i++) step(s, { x: Math.sin(i / 40), y: Math.cos(i / 53) * 0.6, dash: i % 200 === 0 });
  return [s.hero.x.toFixed(6), s.hero.y.toFixed(6), s.kills, s.enemies.length].join(',');
}

// ---------- stress: all weapons at L5 (scenario A) and all evolutions (scenario B) for SECS seconds ----------
function stress(label, grant) {
  const s = newSim(31, 1);
  P.Progression.debugGrant(s, grant);
  const bad = [], counts = {};
  let peak = 0, steps = Math.round(SECS / DT), t0 = Date.now();
  for (let i = 0; i < steps; i++) {
    feed(s, WANT);
    const h = s.hero;
    const input = { x: Math.sin(i / 90), y: Math.cos(i / 70) * 0.8, dash: i % 220 === 0, ult: h.ult >= 1 && i % 30 === 0 };
    const ev = step(s, input);
    ev.forEach(x => {
      counts[x.type] = (counts[x.type] || 0) + 1;
      Object.keys(x).forEach(k => { if (badNum(x[k])) bad.push(label + ' event ' + x.type + '.' + k); });
    });
    peak = Math.max(peak, s.enemies.length);
    if (i % 60 === 0) scanNaN(s, label + ' step ' + i, bad);
  }
  const ms = (Date.now() - t0) / steps;
  check(bad.length === 0, label + ' NaN: ' + bad.slice(0, 5).join('; '));
  check(peak >= WANT, label + ' peak enemies only ' + peak);
  notes.push(label + ': ' + SECS + ' s, peak ' + peak + ' enemies, kills ' + s.kills + ', ' + ms.toFixed(2) + ' ms/step (sim only)');
  notes.push(label + ' events: ' + Object.keys(counts).sort().map(k => k + '=' + counts[k]).join(' '));
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
  ['dash', 'ult'].forEach(id => check(P.Icons.ids.includes(id), 'missing icon ' + id));
  // Card stat rows must render (no NaN / undefined) at every level, including evolutions.
  const cards = [];
  P.CFG.arsenal.weapons.forEach(id => { for (let n = 1; n <= 5; n++) cards.push({ id: 'w:' + id, item: id, next: n }); });
  Object.keys(P.CFG.evolutions).forEach(id => cards.push({ id: 'w:' + id, item: id, next: 5, evo: P.CFG.evolutions[id].from }));
  P.CFG.arsenal.passives.forEach(id => { for (let n = 1; n <= 5; n++) cards.push({ id: 'p:' + id, item: id, next: n }); });
  cards.forEach(c => P.Progression.statLines(c).forEach(r => {
    const txt = String(r.a) + String(r.b);
    check(!/NaN|undefined/.test(txt), 'stat row broken for ' + c.item + ' L' + c.next + ': ' + txt);
  }));
  const statKeys = new Set();
  ids.forEach(id => { const c = P.CFG.weapons[id]; if (c && c.stats) c.stats.forEach(st => statKeys.add(st[0])); });
  statKeys.forEach(k => { ['tr', 'en'].forEach(l => check(P.STR[l][k], 'missing ' + k + ' (' + l + ')')); });
  ['frenzy.on', 'nearMiss', 'evo.title', 'evo.label', 'dash.name', 'ult.name', 'nazar.dodge'].forEach(k => {
    ['tr', 'en'].forEach(l => check(P.STR[l][k], 'missing ' + k + ' (' + l + ')'));
  });
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

function drawSmoke(label, grant, frames) {
  const bad = [], ctx = stubCtx(bad), s = newSim(41, 1);
  P.Progression.debugGrant(s, grant);
  const ppm = 32.5, R = { ctx: ctx, W: 390, H: 844, ppm: ppm };
  R.X = x => (x - s.hero.x) * ppm + 195;
  R.Y = y => -(y - s.hero.y) * ppm + 422;
  const bh = P.WFx.heroBackHand(s);
  let drawMs = 0;
  for (let i = 0; i < frames; i++) {
    feed(s, WANT);
    const input = { x: Math.sin(i / 90), y: Math.cos(i / 70) * 0.8, dash: i % 220 === 0, ult: s.hero.ult >= 1 && i % 30 === 0 };
    const ev = step(s, input);
    ev.forEach(x => P.WFx.onEvent(x, s));
    P.WFx.update(DT, s);
    const t0 = performance.now();
    try {
      P.WFx2.drawGround(R, s); P.WFx.drawParts(R); P.SkillsFx.drawUnder(R, s);
      P.WFx.drawChain(R, s); P.WFx.drawProjectiles(R, s); P.WFx2.drawAir(R, s);
      P.SkillsFx.drawOver(R, s); P.WFx.drawCombo(R); P.SkillsFx.screen(R, s);
      bh(ctx, { x: 0, y: 0 }, 32, i % 2 ? 1 : -1, '#E0AC80', '#D7263D');
    } catch (err) { fails.push(label + ' draw threw at frame ' + i + ': ' + err.message); break; }
    drawMs += performance.now() - t0;
  }
  check(bad.length === 0, label + ' non-finite draw values: ' + [...new Set(bad)].slice(0, 6).join(', '));
  notes.push(label + ' draw smoke: ' + frames + ' frames, ' + (drawMs / frames).toFixed(3) + ' ms/frame (stub canvas, JS only)');
}

unitTests();
coverage();
stress('scenario A (all base weapons + passives at L5)', { weapons: ALL_BASE, passives: ALL_PASS });
stress('scenario B (all evolutions + sledge/molotov/cable/speargun/extinguisher)', {
  weapons: Object.assign({ sledge: 5, molotov: 5, cable: 5, speargun: 5, extinguisher: 5 }, EVOS), passives: ALL_PASS });
drawSmoke('draw A', { weapons: ALL_BASE, passives: ALL_PASS }, 900);
drawSmoke('draw B', { weapons: Object.assign({ sledge: 5, molotov: 5, cable: 5, speargun: 5, extinguisher: 5 }, EVOS), passives: ALL_PASS }, 900);
console.log(notes.join('\n'));
if (fails.length) { console.log('FAIL (' + fails.length + '):\n  ' + fails.join('\n  ')); process.exitCode = 1; }
else console.log('PASS');
