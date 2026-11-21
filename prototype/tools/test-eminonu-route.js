'use strict';
const assert = require('node:assert/strict');
const P = require('./lib-load').loadP();
const L = P.CFG.levels, E = L.eminonuMilestones, K = P.CFG.bosses.quayCaptain, M = P.RouteMilestones;
const dt = 1 / P.CFG.sim.hz;

function make(levelIndex, seed = 42) {
  const s = P.createSim(seed, { levelIndex, tramRhythm: true });
  P.startPlay(s);
  return s;
}
const move = (s, p) => Object.assign(s.hero, { x: p.x, y: p.y });
function run(s, t) { for (let i = 0; i < Math.ceil(t / dt); i++) M.step(s, dt); }

for (const level of Object.keys(L.eminonuRoutes).map(Number)) {
  const s = make(level), m = s.milestone;
  assert.equal(m.kind, L.eminonuRoutes[level].kind);
  assert.ok(!P.createSim(42, { levelIndex: level }).milestone, 'the regular route is unchanged');
  s.hero.y = s.geo.holdY;
  P.World.clampHero(s, s.hero);
  assert.ok(s.hero.y < m.y && m.y < s.geo.holdY);
  P.Levels.step(s, dt);
  assert.ok(!s.props.shutterOpen && !s.gen.boss);
  for (let seed = 1; seed <= 150; seed++) {
    const test = make(level, seed), task = test.milestone;
    const points = task.sacks ? task.sacks.concat(task.pallet) : [task.point];
    assert.ok(points.every(p => p.y < task.y && !P.Events.blocked(test, p.x, p.y)),
      `must have clear pavement for level ${level}, seed ${seed}`);
    if (task.cart) assert.ok(!P.Events.blocked(test, task.cart.x, task.y - E.cart.loadingGap));
    if (task.sacks && test.obj.hacks) {
      assert.ok(test.obj.hacks.every(h => Math.abs(h.x) < P.CFG.view.heroClampX));
    }
  }
}

const quay = make(21), shade = quay.milestone;
move(quay, shade.point);
run(quay, shade.useT + dt);
assert.ok(shade.opening > 0 && !shade.open);
run(quay, shade.openT);
assert.ok(shade.open);
const lane = { x: E.awning.x, y: shade.y + 0.14 }, other = { x: -0.7, y: shade.y + 0.14 };
P.World.clampHero(quay, lane);
P.World.clampHero(quay, other);
assert.ok(lane.y > shade.y && other.y < shade.y, 'only the side passage opens');
assert.equal(M.target(quay)[0], E.awning.x);
quay.hero.y = quay.geo.holdY;
P.Levels.step(quay, dt);
assert.ok(quay.props.shutterOpen && !quay.dir.hold.active);

const market = make(22), delivery = market.milestone;
move(market, delivery.cart);
const blocker = P.Combat.spawnEnemy(market, 'walker', delivery.cart.x, delivery.cart.y + 0.3);
run(market, 0.5);
assert.ok(delivery.cart.started && delivery.cart.jammed && delivery.cart.y === delivery.point.y);
blocker.dead = true;
run(market, 0.5);
assert.ok(delivery.cart.walking && delivery.cart.y > delivery.point.y);
const before = delivery.cart.y;
move(market, { x: 0, y: before - E.cart.followR - 1 });
run(market, 0.8);
assert.equal(delivery.cart.y, before);
for (let i = 0; i < 300 && !delivery.open; i++) {
  move(market, delivery.cart);
  M.step(market, 0.1);
}
assert.ok(delivery.open && delivery.cart.second);
assert.equal(market.enemies.length, 1 + E.cart.packs.reduce((n, group) => n + group.length, 0));

const spice = make(23), loads = spice.milestone;
for (const q of loads.sacks) {
  move(spice, q);
  M.step(spice, dt);
  assert.equal(loads.carry, q);
  assert.deepEqual(M.target(spice), [loads.pallet.x, loads.pallet.y]);
  move(spice, loads.pallet);
  M.step(spice, dt);
  assert.ok(q.delivered && !loads.carry);
}
assert.equal(loads.delivered, 3);
assert.ok(loads.opening > 0 && !loads.open);
run(spice, loads.openT);
assert.ok(loads.open);

const freight = make(24), signal = freight.milestone, C = E.signal.cart;
move(freight, signal.point);
run(freight, signal.useT + 0.15);
assert.ok(signal.signalT > 0 && signal.signalT < C.lead);
assert.equal(P.EminonuTrial.trolleyX(signal.signalT), C.from);
const hp = freight.hero.hp;
move(freight, { x: 0, y: signal.y - C.yBack });
run(freight, C.T + C.lead);
assert.ok(signal.trolleyHit && freight.hero.hp < hp && signal.opening > 0 && !signal.open);
run(freight, signal.openT);
assert.ok(signal.open);

const yard = make(25), gate = yard.milestone;
move(yard, gate.point);
run(yard, gate.useT + dt);
assert.ok(gate.opening > 0 && !gate.open);
run(yard, gate.openT);
assert.ok(gate.open);
yard.hero.y = yard.geo.holdY;
P.Levels.step(yard, dt);
const captain = yard.gen.boss, hero = yard.hero;
assert.equal(captain.nameKey, 'boss.eminonu');
assert.equal(captain.bossPreset, 'quayCaptain');
assert.equal(captain.type, 'brute', 'the Captain is on foot');
captain.ai.cd = 0;
hero.x=captain.x;hero.y=captain.y-K.anchor.reach-1;
P.Bosses.think(yard, captain, dt);
assert.equal(captain.ai.m, 'walk', 'First anchor waits for the Captain to come into range');
hero.y = captain.y - K.anchor.reach + .4;
P.Bosses.think(yard, captain, dt);
const tow = captain.captainTow, y = captain.y, startHp = hero.hp;
assert.ok(tow.phase === 'aim' && yard.enemyTele.some(t => t.kind === 'lane' && t.owner === captain.id));
move(yard, { x: 3.5, y: tow.ty });
P.Bosses.think(yard, captain, captain.ai.W + dt);
const inPath = { x: (captain.x + tow.tx) / 2, y: (captain.y + tow.ty) / 2, r: .6, t: 5 };
const outside = { x: inPath.x + 4, y: inPath.y, r: .6, t: 5 };
captain.captainDust = [inPath, outside];
P.EminonuBoss.step(yard, captain, K.anchor.throwT + 0.1);
assert.ok(tow.phase === 'pull' && Math.abs(captain.y - y) > 0.5 && hero.hp === startHp);
P.EminonuBoss.step(yard, captain, 2);
assert.ok(!captain.captainTow && captain.exposed);
assert(!captain.captainDust.includes(inPath) && captain.captainDust.includes(outside), 'the anchor clears only the spice clouds in its path');
captain.hp = captain.maxHp * 0.4;
P.Bosses.think(yard, captain, dt);
assert.equal(captain.phase, 2);
P.EminonuBoss.attack(yard, captain, captain.ai, 'captainSpice', n => n);
const warnings = yard.enemyTele.filter(t => t.then === 'captainSpice');
assert.equal(warnings.length, K.spice.last);
assert.ok(warnings[1].T > warnings[0].T);
move(yard, warnings[0]);
P.EminonuBoss.land(yard, warnings[0]);
const dustHp = hero.hp;
hero.invuln = 0;
P.EminonuBoss.step(yard, captain, K.spice.dustTick);
assert.ok(hero.hp < dustHp);
move(yard, { x: 0, y: warnings[0].y - 9 });
const clearHp = hero.hp;
P.EminonuBoss.step(yard, captain, K.spice.dustTick);
assert.equal(hero.hp, clearHp);
captain.dead = true;
P.Bosses.onDeath(yard, captain);
P.EminonuBoss.step(yard, captain, dt);
assert.ok(!captain.captainDust && !yard.enemyTele.some(t => t.owner === captain.id));
console.log('Eminönü route: 750 layouts, five gated objectives, and a two-phase Captain with working counterplay');
