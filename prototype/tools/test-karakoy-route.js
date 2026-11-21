'use strict';
const assert = require('node:assert/strict');
const P = require('./lib-load').loadP();
const C = P.CFG.levels, K = C.karakoyMilestones, B = P.CFG.bosses.dockBride, M = P.RouteMilestones;
const dt = 1 / P.CFG.sim.hz;

function make(levelIndex, seed = 42) {
  const s = P.createSim(seed, { levelIndex, tramRhythm: true });
  P.startPlay(s);
  return s;
}
function use(s, p, time) {
  Object.assign(s.hero, { x: p.x, y: p.y });
  M.step(s, time);
}

for (const level of Object.keys(C.karakoyRoutes).map(Number)) {
  const s = make(level), m = s.milestone;
  assert.equal(m.kind, C.karakoyRoutes[level].kind);
  assert.ok(!P.createSim(42, { levelIndex: level }).milestone);
  s.hero.y = s.geo.holdY;
  P.World.clampHero(s, s.hero);
  assert.ok(s.hero.y < m.y && m.y < s.geo.holdY);
  P.Levels.step(s, dt);
  assert.ok(!s.dir.hold.active && !s.gen.boss);
  for (let seed = 1; seed <= 150; seed++) {
    const test = make(level, seed), spot = test.milestone;
    const points = spot.shutters || [spot.align, spot.point].filter(Boolean);
    assert.ok(points.every(p => !P.Events.blocked(test, p.x, p.y)), `level ${level}, seed ${seed}, station blocked`);
    assert.ok(points.every((p, i) => p.y < spot.y && (i === 0 || p.y > points[i - 1].y)));
  }
}

const quay = make(11), hook = quay.milestone;
use(quay, hook.point, 3);
assert.equal(hook.point.progress, 0, 'sling waits for the hook');
use(quay, hook.align, hook.useT);
assert.deepEqual(M.target(quay), [hook.point.x, hook.point.y]);
use(quay, hook.point, hook.useT);
assert.ok(hook.opening > 0 && !hook.open);
M.step(quay, hook.openT);
assert.ok(hook.open);
quay.hero.y = quay.geo.holdY;
P.Levels.step(quay, dt);
assert.ok(quay.props.shutterOpen && !quay.dir.hold.active, 'the crane is the required encounter, with no second wait at the exit');

const idle = make(11);
idle.hero.invuln = Infinity;
for (let i = 0; i < P.CFG.sim.hz * 90; i++) {
  idle.enemies.length = 0;
  P.stepSim(idle, dt, { x: 0, y: 0 });
}
assert.equal(idle.gen.routeFront, 2);
assert.ok(idle.gen.routeSpent > 0 && idle.gen.routeSpent <= K.route.startBudget);
assert.equal(idle.horde.spawned, K.route.ambientStart, 'ambient reinforcements stop if Arda stays put');

const pier = make(12), ferry = pier.milestone;
use(pier, ferry.point, ferry.useT);
const first = pier.enemies.length, wait = ferry.wait;
assert.equal(first, K.pack.ferry.length);
use(pier, { x: ferry.point.x, y: ferry.point.y - K.ferryR - 1 }, 2);
assert.ok(ferry.wait>wait, 'secured mooring docks independently while Arda evades');
use(pier, ferry.point, K.ferryT);
assert.equal(pier.enemies.length, first * 2);
assert.equal(pier.events.filter(e => e.phase === 'karakoy_ferryMooring_line_out').length, 1);
M.step(pier, ferry.openT);
assert.ok(ferry.open);

const rails = make(13), tram = rails.milestone;
use(rails, tram.point, tram.useT);
assert.ok(tram.opening > 0 && !tram.open, 'gate stays shut while the tram moves');
M.step(rails, tram.openT);
assert.ok(tram.open);

const market = make(14), stalls = market.milestone;
use(market, stalls.shutters[2], 3);
assert.equal(stalls.raised, 0);
stalls.shutters.forEach((p, index) => {
  const nearby = P.Combat.spawnEnemy(market, 'walker', p.x, p.y + 1.5, {});
  use(market, p, stalls.useT);
  assert.equal(stalls.raised, index + 1);
  assert.equal(stalls.opening > 0, index === 2);
  assert.equal(nearby.lure && Math.sign(nearby.lure.x), index < 2 ? Math.sign(p.x) : null);
});
M.step(market, stalls.openT);
assert.ok(stalls.open);

const dock = make(15), ramp = dock.milestone;
use(dock, ramp.point, ramp.useT);
assert.equal(ramp.guards.length, K.pack.dock.length);
assert.equal(ramp.point.progress, 0);
ramp.guards.forEach(e => { e.dead = true; });
use(dock, ramp.point, ramp.useT);
M.step(dock, ramp.openT);
assert.ok(ramp.open);
dock.hero.y = dock.geo.holdY;
P.Levels.step(dock, dt);
const bride = dock.gen.boss;
assert.equal(bride.nameKey, 'boss.karakoy');
assert.equal(bride.bossPreset, 'dockBride');
bride.state = 'active';
bride.ai.cd = 0;
P.Bosses.think(dock, bride, dt);
const cartWarning = dock.enemyTele.find(t => t.then === 'dockCarts');
assert.ok(cartWarning && cartWarning.T >= P.CFG.enemies4.telegraphMin);
P.Enemies.onTele(dock, cartWarning);
const cart = bride.dockCarts[0];
dock.hero.x = cart.x + B.carts.w;
dock.hero.y = cart.y - 1;
const hp = dock.hero.hp;
P.KarakoyBoss.step(dock, bride, 0.1);
assert.equal(dock.hero.hp, hp);
dock.hero.x = cart.x;
dock.hero.invuln = 0;
P.KarakoyBoss.step(dock, bride, 0.1);
assert.ok(dock.hero.hp < hp && cart.hit);

P.Enemies.onTele(dock, cartWarning);
const secondCart = bride.dockCarts.at(-1);
bride.ai.m = 'walk';
bride.x = secondCart.x; bride.y = secondCart.y - B.carts.speed * .11;
dock.hero.x = secondCart.x + B.carts.w;
const cargoVictim = P.Combat.spawnEnemy(dock, 'walker', bride.x, bride.y, { state: 'active' });
const cargoHp = cargoVictim.hp;
P.KarakoyBoss.step(dock, bride, 0.11);
assert(bride.exposed && bride.cartOpening && secondCart.wreck > 0 && cargoVictim.hp < cargoHp,
  'the cart mows through its lane and can knock the Bride off balance');
bride.exposed = false;
bride.ai.m = 'walk'; bride.ai.cd = 0;
P.Bosses.think(dock, bride, dt);
const rope = bride.dockRope;
assert.ok(rope.t < 0);
bride.ai.m = 'switchRecover';
const a = rope.start + rope.span * 0.12;
dock.hero.x = rope.x;
dock.hero.y = rope.y;
P.KarakoyBoss.step(dock, bride, rope.T * 0.04);
assert.ok(!rope.hit, 'the inner space is safe');
dock.hero.x = rope.x + Math.cos(a) * rope.r;
dock.hero.y = rope.y + Math.sin(a) * rope.r;
P.KarakoyBoss.step(dock, bride, rope.T * 0.16);
assert.ok(rope.hit, 'the moving end of the rope hits on contact');
P.KarakoyBoss.step(dock, bride, rope.T);
assert.ok(!bride.dockRope && bride.exposed);
bride.hp = bride.maxHp * 0.4;
P.Bosses.think(dock, bride, dt);
assert.equal(bride.phase, 2);
P.KarakoyBoss.attack(dock, bride, bride.ai, 'ropeSweep', t => t);
assert.equal(Math.abs(bride.dockRope.span), B.rope.second);
const before = dock.enemyTele.length;
P.KarakoyBoss.attack(dock, bride, bride.ai, 'dockCarts', t => t);
assert.equal(dock.enemyTele.length - before, 2);
bride.dead = true;
P.Bosses.onDeath(dock, bride);
P.KarakoyBoss.step(dock, bride, dt);
assert.ok(!bride.dockRope && bride.dockCarts.length === 0 && !dock.enemyTele.some(t => t.owner === bride.id));
console.log('Karaköy route: 750 seeded layouts, five required encounters, two Bride phases and safe dodge windows');
