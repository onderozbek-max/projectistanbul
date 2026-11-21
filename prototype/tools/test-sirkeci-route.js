'use strict';
const assert = require('node:assert/strict');
const P = require('./lib-load').loadP();
const C = P.CFG.levels.sirkeciMilestones, B = P.CFG.bosses.ticketMan, M = P.RouteMilestones;
const dt = 1 / P.CFG.sim.hz;
function make(levelIndex, seed = 42) {
  const s = P.createSim(seed, { levelIndex, tramRhythm: true });
  P.startPlay(s);
  return s;
}
const move = (s, p) => Object.assign(s.hero, { x: p.x, y: p.y });
function run(s, t) { for (let i = 0; i < Math.ceil(t/dt); i++) M.step(s, dt); }

for (let level = 26; level <= 30; level++) {
  for (let seed = 1; seed <= 150; seed++) {
    const s = make(level, seed), m = s.milestone;
    assert.ok(m.sirkeci && m.y < s.geo.holdY);
    const lightSteps = m.lights ? m.lights.steps : [];
    for (const p of [m.point, m.fuse, m.guide].filter(Boolean).concat(lightSteps)) {
      assert.ok(!P.Events.blocked(s, p.x, p.y), `station clear in level ${level} seed ${seed}`);
    }
    move(s, { x: 0, y: s.geo.holdY }); P.World.clampHero(s, s.hero);
    assert.ok(s.hero.y < m.y);
  }
}

const service = make(26), departure = service.milestone, train = departure.train;
const front = train.front;
move(service, departure.point); run(service, departure.useT + C.departure.bellT / 2);
assert.equal(train.front, front, 'the bell precedes movement');
run(service, C.departure.bellT + C.departure.T/2);
assert.ok(train.front > front && !departure.open, 'the gate waits for the train');
assert.equal(train.solid.yMax, train.front);
run(service, C.departure.T + departure.openT);
assert.ok(departure.open && train.solid.yMin > departure.y);
assert.equal(service.props.routeEdges.length, 0, 'the departed car leaves the lane clear');

// The quiet transition must affect live arrivals, not just hide a frenzy headline.
const quiet = make(26), qm = quiet.milestone;
const survivor = P.Combat.spawnEnemy(quiet, 'walker', quiet.hero.x + 3, quiet.hero.y + 2);
const initialHp = survivor.hp;
for (let i = 0; i < 600; i++) { quiet.t += dt; quiet.runT += dt; P.Levels.step(quiet, dt); P.Horde.step(quiet, dt); }
assert.equal(quiet.gen.routeSpent || 0, 0, 'No recurring route arrivals before the service-car passage');
assert.equal(quiet.horde.spawned, 0, 'No ambient refill during the physical breathing space');
assert(!quiet.events.some(e => e.type === 'hordeSurge'), 'No early surge queues behind the quiet scene');
assert(!survivor.dead && survivor.hp === initialHp && quiet.enemies.includes(survivor), 'Existing threats are preserved, not deleted');
move(quiet, qm.point); run(quiet, qm.useT + C.departure.bellT + C.departure.T + qm.openT + .1);
assert(qm.open, 'The actual service-car action still clears its real collision');
move(quiet, { x: 0, y: qm.y + C.departure.reliefAhead + .2 });
for (let i = 0; i < 360; i++) { quiet.t += dt; quiet.runT += dt; P.Levels.step(quiet, dt); P.Horde.step(quiet, dt); }
assert((quiet.gen.routeSpent || 0) > 0 || quiet.horde.spawned > 0, 'Normal arrivals resume beyond the car aperture');
assert(quiet.enemies.includes(survivor), 'The original actor identity survives the transition');

const tunnel = make(27), chase = tunnel.milestone, guide = chase.guide;
const xd = guide.y;
run(tunnel, .3); assert.equal(guide.y, xd);
const blocker = P.Combat.spawnEnemy(tunnel, 'walker', guide.x, guide.y + .3);
blocker.state = 'active'; move(tunnel, guide); run(tunnel, .3);
assert.ok(guide.joined && guide.pinned && guide.y === xd);
blocker.dead = true;
for (let i = 0; i < 220 && !chase.open; i++) { move(tunnel, guide); M.step(tunnel, .1); }
assert.ok(chase.open && guide.wave, 'guide reaches and unlocks the staff gate');

const hall = make(28), clock = hall.milestone;
move(hall, clock.point); run(hall, clock.useT + .5);
assert.equal(clock.point.progress, 0, 'clock requires fuse');
move(hall, clock.fuse); run(hall, dt);
assert.ok(clock.fuse.collected);
move(hall, clock.point); run(hall, clock.useT + clock.openT + .1);
assert.ok(clock.open);
assert.ok(Number.isFinite(clock.clockLiveAt));
assert.equal(hall.events.filter(e => e.phase === 'stationClock_live').length, 1);

const platform = make(29), defense = platform.milestone;
move(platform, defense.point); run(platform, defense.useT + .2);
assert.ok(defense.lights.on && defense.lights.passed === 0);
move(platform, defense.lights.steps[1]); run(platform, 1);
assert.equal(defense.lights.passed, 0, 'The next light must be reached in order');
defense.lights.steps.forEach((step, i) => {
  assert.deepEqual(M.target(platform), [step.x, step.y]);
  move(platform, step); run(platform, dt);
  assert.equal(defense.lights.passed, i + 1);
});
run(platform, defense.openT);
assert.ok(defense.open);

const end = make(30), points = end.milestone;
move(end, points.point); run(end, points.useT + points.openT + .1);
assert.ok(points.open);
end.hero.y = end.geo.holdY; P.Levels.step(end, dt);
const boss = end.gen.boss;
assert.equal(boss.bossPreset, 'ticketMan');
boss.ai.cd = 0;
P.Bosses.think(end, boss, dt);
assert.equal(boss.ai.act,null,'Ticket Man approaches instead of punching empty distant ground');
assert(Math.hypot(boss.dvx,boss.dvy)>0,'The approach has real velocity');
end.hero.x=boss.x;end.hero.y=boss.y-2;
P.Bosses.think(end,boss,0);
assert.equal(boss.ai.act, 'ticketPunch');
assert.ok(end.enemyTele.some(t => t.owner === boss.id && t.cause === 'ticketMan' && t.kind === 'ring'));
P.Bosses.think(end, boss, B.punch.windup + .1);
assert.ok(boss.exposed && boss.armour === B.exposedArmour);
boss.hp = boss.maxHp * .4;
end.enemyTele = [];
for (let i = 0; i < 300 && !end.enemyTele.some(t => t.then === 'switchRails'); i++) P.Bosses.think(end, boss, dt);
const rails = end.enemyTele.filter(t => t.then === 'switchRails');
assert.equal(rails.length, 2);
assert.ok(rails.every(t => t.dx === 1 && t.dy === 0) && rails[1].T > rails[0].T);
P.Bosses.think(end, boss, boss.ai.W + dt);
end.hero.y = Math.min(rails[0].y, rails[1].y) - 3;
P.Bosses.hitRails(end, rails[0]);
assert(!boss.exposed, 'The second rail still has to fire');
P.Bosses.hitRails(end, rails[1]);
assert(boss.exposed, 'Leaving both live lanes allows a counterattack');
console.log('Sirkeci: 750 layouts, five required encounters, solid train, ticket punch recovery and two-phase rail lanes');
