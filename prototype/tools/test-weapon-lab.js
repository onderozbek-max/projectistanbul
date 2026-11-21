// The comparison must start each build with the same crowd and use the actual movement and weapon simulation.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadP, ROOT } = require('./lib-load');
const P = loadP();
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'js/view/weapon-lab.js'), 'utf8'), { filename: 'weapon-lab.js' });
const lab = P.WeaponLab, C = lab.config, dt = 1 / P.CFG.sim.hz;

function start(id, rank) {
  const s = P.createSim(C.seed, { levelIndex: C.level });
  lab.setup(s, id, rank);
  P.startPlay(s);
  assert.equal(s.enemies.length, C.crowd);
  assert.equal(s.hero.y, C.startY);
  assert.equal(s.hero.invuln, Infinity);
  assert.deepEqual(Object.keys(s.hero.weapons), [id]);
  return s;
}
const crowd = s => JSON.stringify(s.enemies.map(e => [e.type, e.x, e.y, e.hp, e.variant]));
const reference = crowd(start('knife', 1));
for (const id of P.CFG.arsenal.weapons) {
  for (const rank of [1, 2, 3, 4, 5]) {
    const s = start(id, rank);
    assert.equal(s.hero.weapons[id], rank);
    assert.equal(crowd(s), reference, id + ' at rank ' + rank);
    verifyAttack(s, id, rank);
  }
}
for (const [id, variant] of Object.entries(P.CFG.evolutions)) {
  const s = start(id, 1);
  assert.equal(P.Weapons.variantOf(s.hero, variant.from), id);
  assert.equal(crowd(s), reference);
  verifyAttack(s, id, 1);
}
function verifyAttack(s, id, rank) {
  const family = P.CFG.evolutions[id]?.from || id;
  s.env.recs.length = 0; // A terrain explosion reports its own damage source, independent of the equipped weapon.
  s.env.cables.length = 0;
  let fires = 0, hits = 0;
  for (let i = 0; i < 330; i++) {
    lab.step(s, dt, { x: 0, y: 0 });
    for (const event of P.drainEvents(s)) {
      if (event.type === 'wfire') {
        assert.equal(event.variant, id, 'unrelated weapon fired in solo ' + id);
        assert.equal(event.lv, rank, 'wrong rank fired in solo ' + id);
        fires++;
      }
      if (event.type === 'nailFire') assert.equal(family, 'nailgun', 'nails from solo ' + id);
      if (event.type === 'hit' && event.id != null && P.CFG.weapons[event.src]) {
        assert.ok([id, family].includes(event.src), event.src + ' dealt damage in solo ' + id);
        hits++;
      }
    }
  }
  assert.ok(fires > 0, id + ' never fired at rank ' + rank);
  assert.ok(hits > 0 || s.kills > 0, id + ' did not reach the crowd at rank ' + rank);
}
const s = start('sledge', 5);
let hits = 0;
for (let i = 0; i < 900; i++) {
  lab.step(s, dt, { x: 0.4, y: 1, ult: true, skill: true });
  for (const e of P.drainEvents(s)) {
    if (e.type === 'hit' && e.src === 'sledge') hits++;
    assert.ok(!['levelup', 'win', 'death', 'frenzy', 'ult', 'skillUsed'].includes(e.type), e.type);
  }
  assert.ok(s.hero.y <= C.startY + C.walkHalf);
  assert.ok(s.enemies.length <= C.crowd);
}
assert.ok(hits > 0 && s.hero.y > C.startY && s.kills > 0);
assert.deepEqual(s.hero.weapons, { sledge: 5 });
assert.equal(s.xp, 0);
assert.equal(s.level, 1);
assert.equal(s.mode, 'play');

function exercise(id, rank) {
  const sim = start(id, rank), events = [];
  let spin = false, round = false, curve = false, sweep = false;
  let doorTravel = 0;
  for (let i = 0; i < 330; i++) {
    lab.step(sim, dt, { x: 0, y: 0 });
    const w = P.Weapons.state(sim);
    events.push(...P.drainEvents(sim));
    spin ||= w.hooks.some(hook => hook.phase === 'spin');
    round ||= !!(w.rev && w.rev.round);
    curve ||= w.blades.some(b => Math.abs((b.x - b.ox) * Math.sin(b.a) - (b.y - b.oy) * Math.cos(b.a)) > 0.35);
    sweep ||= w.torches.some(jet => Math.abs(jet.a - jet.a0) > 0.25);
    if (w.doors.length) doorTravel = Math.max(doorTravel, w.doors[0].travel);
  }
  return { events, spin, round, curve, sweep, doorTravel };
}
const actions = { olta: 'spin', chainsaw: 'round', sawblade: 'curve', torch: 'sweep' };
for (const id of ['sledge', 'torch']) {
  const mixed = P.createSim(C.seed, { levelIndex: C.level });
  lab.setup(mixed, id, 5, true);
  assert.ok(mixed.hero.weapons.nailgun, 'The optional mixed loadout includes nails');
}
const street = P.createSim(C.seed, { levelIndex: C.level });
lab.setup(street, 'streetCart', 1);
P.startPlay(street);
const cart = street.env.recs.find(r => r.kind === 'cart' && r.y === C.startY);
assert(cart && P.StreetWeapon.eligible(street, cart) && !Object.keys(street.hero.weapons).length);
const startX = street.hero.x;
street.hero.x = cart.b.rc.xMin;
P.StreetWeapon.step(street, .25);
assert(P.StreetWeapon.progress(street, cart) > 0 && !street.streetWeapon);
street.hero.moving = true;
P.StreetWeapon.step(street, .25);
assert.equal(P.StreetWeapon.progress(street, cart), null);
assert(cart.alive && !street.hero.streetHolding, 'Moving during the pickup hold leaves the cart in place');
street.hero.x = startX;
street.hero.moving = false;
const beats = [];
for (let i = 0; i < 260; i++) {
  lab.step(street, dt, { x: i < 14 ? 1 : 0, y: 0 });
  beats.push(...P.drainEvents(street).filter(event => event.type === 'streetWeapon'));
}
assert.deepEqual(beats.filter(e => e.beat !== 'contact').map(e => e.beat), ['lift', 'swing', 'swing', 'swing', 'throw', 'land']);
assert.ok(beats.some(e => e.beat === 'land' && e.targets > 0), 'The throw lands in a real crowd');
assert.ok(!street.streetWeapon && !street.hero.streetHolding && !street.geo.blocks.includes(cart.b));
const cartConfig = P.CFG.env.streetWeapon;
street.geo.blocks.length = 0;
street.enemies.length = 0;
street.hero.x = 0; street.hero.y = C.startY;
P.Combat.spawnEnemy(street, 'walker', 2, C.startY, {});
for (const x of [-.4, 0, .4]) P.Combat.spawnEnemy(street, 'walker', x, C.startY + 4.4, {});
street.streetWeapon = { r: cart, phase: 'heft', t: cartConfig.heft, aim: 0 };
P.StreetWeapon.step(street, dt);
assert.equal(street.streetWeapon.phase, 'flight');
assert.ok(street.streetWeapon.to.y > C.startY + 3, 'The launch picks the farther cluster over the nearer lone zombie');

const market = P.createSim(C.seed, { levelIndex: C.level });
lab.setup(market, 'streetStall', 1);
P.startPlay(market);
const stall = market.env.recs.find(r => r.kind === 'lx_stall' && r.y === C.startY + cartConfig.labStallAhead);
assert.ok(stall && P.StreetWeapon.eligible(market, stall));
assert.equal(market.theme, 'eminonu');
market.hero.x = stall.b.rc.xMin - P.CFG.hero.radius;
const marketEvents = [];
for (let i = 0; i < 260; i++) {
  lab.step(market, dt, { x: 0, y: 0 });
  marketEvents.push(...P.drainEvents(market));
}
assert.deepEqual(marketEvents.filter(e => e.type === 'streetWeapon' && e.beat !== 'contact').map(e => e.beat),
  ['lift', 'swing', 'swing', 'swing', 'throw', 'land']);
assert.ok(marketEvents.some(e => e.type === 'streetWeapon' && e.beat === 'land' && e.targets > 0));
assert.equal(marketEvents.filter(e => e.type === 'envBreak' && e.kind === 'lx_stall').length, 1);
assert.ok(!market.hero.streetHolding && !market.geo.blocks.includes(stall.b));

const route = P.createSim(C.seed, { levelIndex: 23, tramRhythm: true });
const routeStalls = route.geo.blocks.filter(b => b.kind === 'lx_stall' && b.w <= 1.8 && b.h <= 1.8);
assert.ok(routeStalls.length && routeStalls.every(b => P.StreetWeapon.eligible(route, b.rec)), 'Eminönü uses throwable spice stalls outside the lab');
function portable(kind, w, h, block = {}, prop = {}) {
  return P.StreetWeapon.eligible(route, { alive: true, kind, b: { w, h, ...block }, ...prop });
}
for (const kind of ['cart', 'bench', 'bin', 'crates', 'tables', 'tavlatable', 'antique']) {
  assert.ok(portable(kind, 1.5, 1), kind);
}
assert.ok(portable('lx_stall', 1.8, 1.8));
assert.ok(!portable('lx_stall', 1.81, 1.6));
assert.ok(!portable('lx_stall', 1.6, 1.81));
assert.ok(!portable('cm_pyramid', 3, 3));
assert.ok(!portable('cart', 1.1, .75, { station: true }));
assert.ok(!portable('cart', 1.1, .75, {}, { bomb: true }));
for (const kind of ['planter', 'tree', 'car', 'gascan', 'kiosk']) assert.ok(!portable(kind, 1, 1), kind);

for (const [id, action] of Object.entries(actions)) {
  assert.equal(exercise(id, 1)[action], false, id + ' at rank one');
  assert.equal(exercise(id, 5)[action], true, id + ' at rank five');
}
assert.ok(exercise('hookpull', 1).spin, 'the evolution carries through to its own spin');
assert.ok(exercise('olta', 3).spin, 'rank three introduces the full turn');
for (const [rank, turns] of [[1, 130 / 360], [3, 300 / 360], [5, 2.5]]) {
  const test = exercise('cardoor', rank);
  const strikes = test.events.filter(e => e.type === 'doorBash');
  assert.ok(Math.abs(test.doorTravel / (Math.PI * 2) - turns) < 0.001, 'door sweep at rank ' + rank);
  assert.ok(strikes.length > 0 && strikes.every(e => e.enemyId > 0 && e.travel > 0 && e.travel <= test.doorTravel));
  const launch = test.events.findIndex(e => e.type === 'doorThrow');
  const impact = test.events.findIndex(e => e.type === 'doorSlam');
  assert.ok(launch >= 0 && impact > launch && test.events[impact].n > 0, 'the panel releases and lands in a real crowd');
  if (rank === 5) assert.ok(strikes.some(e => e.travel > Math.PI * 2), 'the door continues to hit on subsequent turns');
}
const door = start('cardoor', 1);
const [ahead, behind] = door.enemies;
door.enemies = [ahead, behind];
Object.assign(ahead, { x: door.hero.x + 1.2, y: door.hero.y, state: 'active' });
Object.assign(behind, { x: door.hero.x - 1.3, y: door.hero.y, state: 'active' });
for (let i = 0; i < 8; i++) P.Weapons4.step(door, dt);
assert.ok(!P.drainEvents(door).some(e => e.type === 'doorBash'), 'winding up does not hit');
for (let i = 8; i < 48; i++) P.Weapons4.step(door, dt);
assert.deepEqual(P.drainEvents(door).filter(e => e.type === 'doorBash').map(e => e.enemyId), [ahead.id],
  'the first sweep only hits the enemy the panel crosses');
assert.ok(exercise('minibus', 1).events.some(e => e.type === 'doorSlam' && e.grade === 6), 'minibus finishes with a real slam');
const toss = start('cardoor', 1);
toss.enemies.length = 0; toss.geo.blocks.length = 0;
function walker(x, y) { return P.Combat.spawnEnemy(toss, 'walker', x, y, { state: 'active' }); }
const near = walker(1.3, C.startY);
for (const x of [-.3, 0, .3]) walker(x, C.startY + 4.2);
near.hp = 1;
const doorEvents = [];
for (let i = 0; i < 120; i++) {
  toss.t += dt;
  P.Weapons4.step(toss, dt);
  doorEvents.push(...P.drainEvents(toss));
}
const carried = doorEvents.find(e => e.type === 'kill' && e.id === near.id);
assert.ok(carried.swingAir?.end, 'a fatal sweep carries the same launch into the death pose');
assert.ok(doorEvents.some(e => e.type === 'doorSlam' && e.y > C.startY + 3.9 && e.n === 3),
  'the door chooses the farther cluster and damages it only where the panel lands');
assert.ok(exercise('twinsaw', 1).curve, 'both evolved blades follow a curve');
const arcs = rank => exercise('cable', rank).events.filter(e => e.type === 'cableZap').map(e => e.n);
assert.ok(Math.max(...arcs(5)) > Math.max(...arcs(1)), 'rank-five cable reaches more targets');
assert.ok(exercise('cable', 1).events.filter(e => e.type === 'cableArc').every(e => e.targetId > 0 && e.targetR > 0),
  'electrocution is attached to the struck enemy');
const volley = rank => exercise('speargun', rank).events.find(e => e.type === 'wfire' && e.w === 'speargun').n;
assert.equal(volley(1), 1);
assert.equal(volley(5), 3);
const bounce = rank => exercise('manhole', rank).events.find(e => e.type === 'manholeBounce');
assert.ok(bounce(1).r > 0);
assert.equal(bounce(3).crater, false);
assert.ok(bounce(5).crater && bounce(5).r >= bounce(3).r * 1.5);
assert.ok(exercise('slingshot', 5).events.some(e => e.type === 'marbleFork'));
assert.ok(exercise('fireworks', 5).events.some(e => e.type === 'rocketBurst' && e.stage === 5));
assert.ok(exercise('foamstorm', 1).events.some(e => e.type === 'extTick' && e.stage === 6));
console.log('weapon lab: identical 96-zombie starting crowd, all weapons and evolutions, movement, combat and isolated progression');
