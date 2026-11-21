'use strict';
const assert = require('node:assert/strict');
const P = require('./lib-load').loadP();
const C = P.CFG.levels, K = C.galataMilestones, dt = 1 / P.CFG.sim.hz;
const make = levelIndex => {
  const s = P.createSim(42, { levelIndex, tramRhythm: true });
  P.startPlay(s);
  return s;
};
const move = (s, point) => Object.assign(s.hero, { x: point.x, y: point.y });

for (const i of Object.keys(C.galataRoutes).map(Number)) {
  const s = make(i), m = s.milestone, c = P.createSim(42, { levelIndex: i });
  assert.equal(m.kind, C.galataRoutes[i].kind);
  assert.ok(!c.milestone, 'regular levels keep their existing goals');
  s.hero.y = s.geo.holdY;
  P.World.clampHero(s, s.hero);
  assert.ok(s.hero.y < m.y && m.y < s.geo.holdY);
  P.Levels.step(s, dt);
  assert.ok(!s.dir.hold.active && !s.gen.boss, 'the final encounter is beyond the route gate');
  assert.ok(!P.Events.blocked(s, m.point.x, m.point.y));
}

const hoist = make(6), lift = hoist.milestone;
move(hoist, lift.point);
P.RouteMilestones.step(hoist, lift.useT - dt);
assert.equal(lift.opening, 0);
P.RouteMilestones.step(hoist, 2 * dt);
assert.ok(lift.opening > 0 && !lift.open, 'the hoist is still moving');
P.RouteMilestones.step(hoist, lift.openT);
assert.ok(lift.open);
hoist.hero.y = hoist.geo.holdY;
P.Levels.step(hoist, dt);
assert.equal(hoist.dir.hold.T, C.galataRoutes[6].finishT);
P.Levels.step(hoist, hoist.geo.holdT);
hoist.hero.y = hoist.geo.exitY + 1;
P.Levels.step(hoist, dt);
assert.equal(hoist.mode, 'won', 'the generated hold opens the final gate');

const escort = make(7), entry = escort.milestone, guide = entry.guide;
const startY = guide.y;
P.RouteMilestones.step(escort, 1);
assert.equal(guide.y, startY, 'the musician waits until met');
move(escort, guide);
const blocker = P.Combat.spawnEnemy(escort, 'walker', guide.x, guide.y + 0.4);
blocker.state = 'active';
P.RouteMilestones.step(escort, 1);
assert.ok(guide.joined && guide.pinned);
assert.equal(guide.y, startY);
blocker.dead = true;
for (let i = 0; i < 18 && !entry.open; i++) {
  move(escort, guide);
  P.RouteMilestones.step(escort, 0.5);
}
assert.ok(entry.open && escort.obj.state === 'done' && guide.alive);

const bells = make(8), steps = bells.milestone;
move(bells, steps.point);
P.RouteMilestones.step(bells, dt);
const pack = bells.enemies.slice();
assert.equal(pack.length, K.bell.n);
P.RouteMilestones.step(bells, steps.useT);
assert.ok(pack.every(e => e.lure && e.lure.x === steps.point.x && e.lure.y === steps.point.y),'The group follows the real chosen bell source');
assert.equal(steps.opening, 0);
bells.t += K.bell.clearT;
P.RouteMilestones.step(bells, steps.openT);
assert.ok(steps.open);
assert.equal(bells.events.filter(e => e.phase === 'galata_bell_rang').length, 1);

const crossing = make(9), bridge = crossing.milestone;
move(crossing, bridge.point);
P.RouteMilestones.step(crossing, 3);
assert.equal(bridge.point.progress, 0, 'the winch needs the matching counterweight');
move(crossing, bridge.weight);
P.RouteMilestones.step(crossing, dt);
assert.ok(bridge.carrying);
move(crossing, bridge.point);
P.RouteMilestones.step(crossing, bridge.useT);
assert.ok(!bridge.open);
P.RouteMilestones.step(crossing, bridge.openT);
const deck = { x: 0, y: bridge.y + dt }, pit = { x: 3, y: bridge.y + dt };
P.World.clampHero(crossing, deck);
P.World.clampHero(crossing, pit);
assert.ok(deck.y > bridge.y && pit.y < bridge.y, 'only the deck crosses the gap');

const tower = make(10), gate = tower.milestone;
move(tower, gate.point);
P.RouteMilestones.step(tower, gate.useT);
P.RouteMilestones.step(tower, gate.openT);
tower.hero.y = tower.geo.holdY;
P.Levels.step(tower, dt);
const boss = tower.gen.boss;
boss.state = 'active'; boss.ai.cd = 0;
P.Bosses.think(tower, boss, dt);
assert.equal(boss.bossPreset, 'bellkeeper');
const loads = tower.enemyTele.filter(t => t.counterweight);
assert.equal(loads.length, P.CFG.bosses.bellkeeper.weights.first);
assert.ok(loads[1].T > loads[0].T, 'the marked weights drop in sequence');
P.Bosses.think(tower, boss, boss.ai.W + dt);
P.Enemies.onTele(tower, loads[0]);
assert(!boss.exposed);
P.Enemies.onTele(tower, loads[1]);
assert(boss.exposed, 'the Bellkeeper opens up once all the weights land');

for (const index of [1, 2, 9]) {
  const signal = make(index);
  if (index === 1) { signal.dir.call.active = true; signal.dir.call.bars = 0; }
  P.Hack.place(signal, 'cell', signal.hero.x, signal.hero.y);
  P.Hack.step(signal, 24);
  const s = signal.events.find(ev => ev.type === 'signalRestored');
  assert.equal(s.mom, index === 1, 'only the authored opening phone call resumes');
  assert.deepEqual(signal.dir.call.queue, index === 1 ? ['callHack1', 'callHack2'] : []);
}
console.log('Galata route: five required actions, matching release animations, counterweight attacks and explicit phone state');
