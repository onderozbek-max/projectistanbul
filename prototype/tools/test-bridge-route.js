'use strict';
const assert = require('node:assert/strict');
const P = require('./lib-load').loadP();
const C = P.CFG.levels, B = C.bridgeMilestones, K = P.CFG.bosses.bigFisher, M = P.RouteMilestones;
const dt = 1 / P.CFG.sim.hz;

function make(levelIndex, seed = 42) {
  const s = P.createSim(seed, { levelIndex, tramRhythm: true });
  P.startPlay(s);
  return s;
}
function move(s, p) { Object.assign(s.hero, { x: p.x, y: p.y }); }
function run(s, seconds) { for (let i = 0; i < Math.ceil(seconds / dt); i++) M.step(s, dt); }

for (const i of Object.keys(C.bridgeRoutes).map(Number)) {
  const s = make(i), m = s.milestone;
  assert.equal(m.kind, C.bridgeRoutes[i].kind);
  assert.ok(!P.createSim(42, { levelIndex: i }).milestone);
  s.hero.y = s.geo.holdY;
  P.World.clampHero(s, s.hero);
  assert.ok(s.hero.y < m.y && m.y < s.geo.holdY);
  P.Levels.step(s, dt);
  assert.ok(!s.props.shutterOpen && !s.gen.boss);
  for (let seed = 1; seed <= 150; seed++) {
    const test = make(i, seed), mm = test.milestone;
    const points = mm.screens || [mm.point];
    assert.ok(points.every((p, k) => !P.Events.blocked(test, p.x, p.y) && p.y < mm.y &&
      (k === 0 || p.y > points[k - 1].y)), `station clear on level ${i} seed ${seed}`);
    if (i < 20) assert.ok(test.geo.zones.some(z => points.every(p => p.y > z.y0) && mm.y < z.y1),
      `encounter stays on its deck, level ${i} seed ${seed}`);
    if (i === 17) {
      const coast = test.geo.zones.find(z => z.kind === 'waterfront');
      assert(coast.moored.length && coast.moored.every(y => y > coast.y0 && y < coast.y1), 'Moored boats stay in the waterfront');
      assert(!test.geo.blocks.some(b => b.kind === 'lx_boat'), 'Moored boats never obstruct the bridge deck');
    }
  }
}

const span = make(16), rack = span.milestone;
move(span, rack.point);
run(span, rack.useT / 2);
assert.equal(rack.opening, 0);
run(span, rack.useT);
assert.ok(rack.opening > 0 && !rack.open);
run(span, rack.openT);
assert.ok(rack.open);
span.hero.y = span.geo.holdY;
P.Levels.step(span, dt);
assert.ok(span.props.shutterOpen && !span.dir.hold.active);

const bank = make(17), rescue = bank.milestone;
move(bank, rescue.point);
run(bank, rescue.useT + 0.6);
assert.ok(rescue.line && rescue.haul > 0 && !rescue.opening);
const frac = rescue.haul;
bank.hero.y -= B.rescueR + 1;
run(bank, 1);
assert.equal(rescue.haul, frac);
move(bank, rescue.point);
run(bank, B.rescueT + rescue.openT);
assert.ok(rescue.open && bank.drops.some(d => d.kind === 'simit' && d.value === B.rescueHeal));

const deck = make(18), shutters = deck.milestone;
move(deck, shutters.screens[1]);
run(deck, 2);
assert.equal(shutters.closed, 0);
for (const [index, p] of shutters.screens.entries()) {
  move(deck, p);
  run(deck, shutters.useT + dt);
  assert.equal(shutters.closed, index + 1);
  assert.equal(shutters.opening > 0, index === 1);
}
run(deck, shutters.openT);
assert.ok(shutters.open);

const stairs = make(19), wave = stairs.milestone, p = wave.point;
move(stairs, { x: 2, y: p.y });
const hp = stairs.hero.hp;
run(stairs, B.waveWarn + dt);
assert.ok(stairs.hero.hp < hp && wave.waves === 0);
run(stairs, B.waveT + B.waveRest + dt);
move(stairs, p);
const enemy = P.Combat.spawnEnemy(stairs, 'walker', p.x, p.y + 0.3);
const enemyHp = enemy.hp, hpBeforeBrace = stairs.hero.hp;
run(stairs, B.waveWarn + dt);
assert.ok(wave.waves === 1 && enemy.hp < enemyHp && stairs.hero.hp === hpBeforeBrace);
run(stairs, B.waveT + B.waveRest + dt);
assert.notEqual(wave.point, p);
move(stairs, p); run(stairs, B.waveWarn + dt);
assert.equal(wave.waves, 1, 'The old brace does not protect the player from the second wave');
run(stairs, B.waveT + B.waveRest + dt);
move(stairs, wave.point);
run(stairs, B.waveWarn + B.waveT + wave.openT + 2 * dt);
assert.equal(wave.waves, B.waveN);
assert.ok(wave.open && stairs.drops.filter(d => d.kind === 'simit' && d.value === B.waveHeal).length === 1);

const pier = make(20), lift = pier.milestone;
move(pier, lift.point);
run(pier, lift.useT + dt);
assert.ok(lift.opening > 0 && !lift.open);
run(pier, lift.openT);
assert.ok(lift.open);
pier.hero.y = pier.geo.holdY;
P.Levels.step(pier, dt);
const boss = pier.gen.boss, hero = pier.hero;
assert.equal(boss.bossPreset, 'bigFisher');
boss.ai.cd = 0;
P.Bosses.think(pier, boss, dt);
const first = pier.enemyTele.find(t => t.then === 'bridgeCast');
assert.ok(first && first.T >= P.CFG.enemies4.telegraphMin);
P.BridgeBoss.resolve(pier, first);
move(pier, { x: first.x + first.dx * 2 + first.dy * 3, y: first.y + first.dy * 2 - first.dx * 3 });
const hpSafe = hero.hp;
P.BridgeBoss.step(pier, boss, 0.1);
assert.equal(hero.hp, hpSafe);
move(pier, { x: first.x + first.dx * 2.15, y: first.y + first.dy * 2.15 });
P.BridgeBoss.step(pier, boss, 0.1);
assert.ok(hero.hp < hpSafe && boss.bridgeCast.lines[0].caught);
const beforeReel = Math.hypot(hero.x - boss.x, hero.y - boss.y);
P.BridgeBoss.step(pier, boss, 0.1);
assert.ok(Math.hypot(hero.x - boss.x, hero.y - boss.y) < beforeReel);
P.BridgeBoss.step(pier, boss, K.cast.reel);
assert.ok(boss.exposed && !boss.bridgeCast);

boss.hp = boss.maxHp * 0.4;
P.Bosses.think(pier, boss, dt);
assert.equal(boss.phase, 2);
P.BridgeBoss.attack(pier, boss, boss.ai, 'bridgeNet', n => n);
const net = pier.enemyTele.find(t => t.then === 'bridgeNet');
assert.equal(net.r, K.net.lastR);
P.BridgeBoss.resolve(pier, net);
assert.equal(P.BridgeBoss.heroMul(pier), K.net.slow);
hero.x += net.r + 1;
assert.equal(P.BridgeBoss.heroMul(pier), 1);
const length = pier.enemyTele.length;
P.BridgeBoss.attack(pier, boss, boss.ai, 'bridgeCast', n => n);
assert.equal(pier.enemyTele.length - length, 2);
assert.ok(Math.abs(pier.enemyTele[length + 1].T - pier.enemyTele[length].T - K.cast.stagger) < dt);
boss.dead = true;
P.Bosses.onDeath(pier, boss);
P.BridgeBoss.step(pier, boss, dt);
assert.ok(!boss.bridgeCast && !boss.bridgeNet && !pier.enemyTele.some(t => t.owner === boss.id));
console.log('Galata Bridge route: 750 seeded layouts, five gated objectives, wave shelter, reel and net effects, and two boss phases');
