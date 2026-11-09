// Environment tests (lane A, AUDIT-6 A1-A5 and the A3 rules): headless, seeded, no DOM. Covers cover breaking and the
// knife rule, gas canister chains, fire and extinguisher interplay, molotov ignition, the chain/sawblade arc, the canister
// and bomb-car rule, wet tiles and glass slows, the live cable shock, door/window/manhole spawn distances, the path test,
// L1 isolation, determinism, and a numeric-literal lint for the sim files (numbers live in config-env.js).
// Usage: node prototype/tools/test-env.js [--quick]
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
// Same module list as bot.js: index.html's sim scripts (view, story and flow files excluded).
const NOT_SIM = /^js\/(view|story)\/|^js\/main\.js$|^js\/meta\/meta-(ui|map|hub|gear|stats|arsenal|collect|daily|save)\.js$/;
const FILES = [...fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)]
  .map(m => m[1]).filter(f => !NOT_SIM.test(f));
FILES.forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const P = globalThis.P;
// Test-only fallback while lane B's layouts are not yet wired into index.html (generated levels call P.Layouts.plan).
if (!P.Layouts) P.Layouts = { plan: function () { return null; }, marks: function () { return []; }, slots: function () {} };

const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v === undefined ? true : v]));
const DT = 1 / 60, fails = [], notes = [];
let passes = 0;
function check(cond, msg) { if (cond) passes++; else fails.push(msg); }
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function mk(seed, idx) { return P.createSim(seed, { levelIndex: idx }); }

// Empty the level so each scenario controls what is on the street.
function clean(s, hy) {
  s.geo.blocks.length = 0; s.enemies.length = 0; s.zones.length = 0; s.events.length = 0;
  s.env.recs.length = 0; s.env.zones.length = 0; s.env.portals.length = 0; s.env.cables.length = 0; s.env.arcs.length = 0;
  s.hero.x = 0; s.hero.y = hy || 30; s.hero.invuln = 0; s.hero.hp = s.hero.maxHp; s.hero.iframes = 0;
  s.mode = 'play';   // damageHero and stepSim only act in play
}
function addBlock(s, kind, x, y, w, h) {
  var b = { kind: kind, x: x, y: y, w: w, h: h, rc: { xMin: x - w / 2, xMax: x + w / 2, yMin: y - h / 2, yMax: y + h / 2 } };
  s.geo.blocks.push(b);
  if (P.CFG.env.hp[kind] !== undefined) P.Env.adopt(s, b, kind);
  return b.rec;
}
// door: marks the walker as already placed, so lane C's entrance logic (enemies3.entrance) does not move it to a spot
// ahead of the hero. Scenario walkers are placed where the check needs them.
function walker(s, x, y) { return P.Combat.spawnEnemy(s, 'walker', x, y, { door: { x: x, y: y } }); }
function ring(s, cx, cy, r, n) { var out = []; for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2; out.push(walker(s, cx + Math.cos(a) * r, cy + Math.sin(a) * r)); } return out; }
function run(s, secs) {
  var n = Math.round(secs / DT);
  for (var i = 0; i < n; i++) { P.Env.step(s, DT); P.Combat.updateBurnAndZones(s, DT); P.Combat.removeDead(s); }
}
const count = (s, type) => s.events.filter(e => e.type === type).length;
const alive = list => list.filter(e => !e.dead).length;

// ---------- L1 isolation ----------
(function () {
  var s = mk(3, 1);
  check(!s.env, 'L1: no env state');
  check(!s.geo && s.props && s.props.carts.length === 2, 'L1: scripted props untouched');
})();

// ---------- placement: idempotent, deterministic, path open ----------
(function () {
  var a = mk(11, 2), b = mk(11, 2), c = P.Env.place(a, a.levelInfo);
  check(c === a.env && P.Env.place(a, a.levelInfo) === a.env, 'place: idempotent');
  var ka = JSON.stringify(a.env.recs.map(r => [r.kind, +r.x.toFixed(3), +r.y.toFixed(3), r.bomb])), kb = JSON.stringify(b.env.recs.map(r => [r.kind, +r.x.toFixed(3), +r.y.toFixed(3), r.bomb]));
  check(ka === kb, 'place: same seed, same props');
  check(a.env.recs.length > 0 && a.env.portals.length > 0, 'place: props and openings exist on a generated level');
  var bombs = a.env.recs.filter(r => r.bomb).length, cars = a.env.recs.filter(r => P.Env.isCar(r.kind)).length;
  notes.push('L2 seed 11: cover ' + a.env.recs.length + ' (cars ' + cars + ', bombs ' + bombs + '), portals ' + a.env.portals.length + ', cables ' + a.env.cables.length);
  var seeds = args.quick ? 3 : 8, lv = [2, 3, 5, 8, 12, 20, 30];
  lv.forEach(function (idx) {
    for (var sd = 1; sd <= seeds; sd++) {
      var s = mk(sd * 7 + idx, idx);
      check(P.Env.pathOpen(s), 'path: L' + idx + ' seed ' + sd + ' stays passable');
    }
  });
})();

// ---------- A1 cover: three hits remove crates; the knife does not auto-aim at cover ----------
(function () {
  var s = mk(5, 2); clean(s, 30);
  var r = addBlock(s, 'crates', 2.5, 45, 1, 1);
  check(!P.Combat.nearestProp(s, 6) || !P.Combat.nearestProp(s, 6).env, 'knife: no auto-aim at cover');
  var hits = 0;
  P.Combat.forEachProp(s, function (p) { if (p === r) { P.Combat.damageProp(s, p, 10); hits++; } });
  P.Combat.forEachProp(s, function (p) { if (p === r) P.Combat.damageProp(s, p, 10); });
  check(r.alive && r.hp === 5, 'cover: two hits leave crates standing');
  P.Combat.forEachProp(s, function (p) { if (p === r) P.Combat.damageProp(s, p, 10); });
  check(!r.alive && s.geo.blocks.indexOf(r.b) < 0, 'cover: third hit removes crates from the geometry');
  check(count(s, 'envBreak') === 1, 'cover: envBreak once');
  check(s.env.zones.some(z => z.kind === 'debris'), 'cover: wood debris slows (zone)');
  // Dash contact: once per dash, through the same damage path.
  clean(s, 30); var c2 = addBlock(s, 'bin', 0, 40, 0.6, 0.6); s.sk = s.sk || {}; s.sk.dash = { t: 0 }; s.hero.dashing = true; s.hero.x = 0.3; s.hero.y = 40;
  P.Env.stepDash(s); P.Env.stepDash(s);
  check(c2.hp === P.CFG.env.hp.bin - P.CFG.env.dashDmg, 'dash: contact hits cover once per dash');
  s.hero.dashing = false;
})();

// ---------- A2 chain: two canisters, the first one's blast lights the second; each blast kills walkers ----------
(function () {
  var s = mk(9, 2); clean(s, 20);
  var A = addBlock(s, 'gascan', 3, 40, 0.7, 0.7), B = addBlock(s, 'gascan', 3, 42.5, 0.7, 0.7);
  var wa = ring(s, 3, 40, 1.4, 6), wb = ring(s, 3, 42.5, 1.4, 6);
  var k0 = s.kills;
  P.Env.hitProp(s, A, P.CFG.env.hp.gascan);
  check(A.fuseT > 0 && count(s, 'envLeak') === 1, 'canister: destroyed canister hisses (leak telegraph)');
  run(s, 1.3);
  check(!A.alive, 'canister: first blast after the fuse');
  check(count(s, 'envChain') >= 1, 'chain: the blast lights the second canister (envChain)');
  check(count(s, 'envExplode') >= 2 || count(s, 'envExplode') >= 1, 'chain: explode events');
  run(s, 0.6);
  var killed = s.kills - k0;
  check(killed >= 6, 'chain: two canisters kill at least six walkers (got ' + killed + ')');
  check(!B.alive || B.fuseT === 0, 'chain: second canister detonated');
  check(alive(wa.concat(wb)) <= 12 - 6, 'chain: walkers around both canisters are dead');
  notes.push('chain: kills ' + killed + ' of 12 walkers');
})();

// ---------- A2 fire + canister, and extinguisher puts out fire and vents fuses ----------
(function () {
  var s = mk(13, 2); clean(s, 20);
  var G = addBlock(s, 'gascan', -3, 40, 0.7, 0.7);
  s.zones.push({ kind: 'fire', x: -3.6, y: 40, r: 0.8, t: 2, T: 2, dps: 4 });
  run(s, 0.05);
  check(G.fuseT > 0 && count(s, 'envFuse') >= 1, 'fire: a fire next to a canister lights its fuse');
  clean(s, 20);
  var X = addBlock(s, 'extinguisher', 3, 50, 0.8, 0.8), G2 = addBlock(s, 'gascan', 3.8, 50.2, 0.7, 0.7);
  P.Env.fuse(s, G2, 'hit', P.CFG.env.fuse.gas);
  s.zones.push({ kind: 'fire', x: 3.2, y: 50, r: 0.9, t: 5, T: 5, dps: 4 });
  P.Env.hitProp(s, X, P.CFG.env.hp.extinguisher);
  check(!s.zones.some(z => z.kind === 'fire'), 'extinguisher: fire within reach is put out');
  check(count(s, 'envExtinguish') === 1 && !G2.alive, 'extinguisher: live canister fuse vented, no blast');
  run(s, 1.5);
  check(count(s, 'envExplode') === 0, 'extinguisher: no explosion after venting');
})();

// ---------- A3 rule 1: molotov onto a gas cloud ignites it; burn 40 per enemy; the canister blows ----------
(function () {
  var s = mk(15, 2); clean(s, 20);
  var G = addBlock(s, 'gascan', -2, 50, 0.7, 0.7);
  P.Env.fuse(s, G, 'hit', P.CFG.env.fuse.gas);
  var e = walker(s, -2 + 2.6, 50);     // outside the blast (2.2 m) but inside the fireball (3 m)
  s.events.length = 0;
  s.events.push({ type: 'flaskShatter', x: -2.2, y: 50, r: 1, life: 2, spin: 0 });
  run(s, 0.1);                         // ignite fuse is 0.05 s: the canister blows within 0.1 s
  check(count(s, 'envIgnite') === 1, 'molotov: envIgnite on a gas cloud');
  check(!G.alive, 'molotov: the canister in the cloud blows at once');
  check(e.dotAcc >= P.CFG.env.rules.ignite.burn - 1e-6 || e.dead, 'molotov: 40 burn per enemy in the fireball');
  check(count(s, 'envHit') >= 1, 'molotov: envHit for weapon evolutions');
  // A molotov away from any cloud does nothing.
  clean(s, 20); s.events.push({ type: 'flaskShatter', x: 0, y: 40, r: 1, life: 2, spin: 0 }); run(s, 0.05);
  check(count(s, 'envIgnite') === 0, 'molotov: no cloud, no ignition');
})();

// ---------- A3 rule 2: a chain blade or sawblade over a wet tile arcs 6 damage to the nearest three, every 0.3 s ----------
(function () {
  var s = mk(17, 2); clean(s, 30);
  s.hero.weapons.chain = 1; s.hero.chainA = 0;
  var lv = P.Weapons.level(s.hero, 'chain'), bx = s.hero.x + Math.cos(0) * lv.radius, by = s.hero.y + Math.sin(0) * lv.radius;
  P.EnvZones.add(s, 'puddle', bx, by, P.CFG.env.puddle.r, 12, 0.25);
  var es = [walker(s, bx + 0.3, by), walker(s, bx - 0.3, by + 0.4), walker(s, bx, by - 0.5), walker(s, bx + 0.6, by + 0.6)];
  var hp0 = es.map(e => e.hp);
  run(s, 0.05);
  var hit = es.filter((e, i) => e.hp < hp0[i] - 1e-6).length;
  check(count(s, 'envArc') === 1 && hit === 3, 'arc: chain over a puddle arcs to three (hit ' + hit + ')');
  run(s, 0.1);
  check(count(s, 'envArc') === 1, 'arc: cooldown holds for 0.3 s');
  run(s, 0.3);
  check(count(s, 'envArc') >= 2, 'arc: the next arc after 0.3 s');
  // Sawblade in flight over a puddle.
  clean(s, 30); s.hero.weapons = {};
  var W = P.Weapons.state(s);
  W.blades.push({ x: 2, y: 60, ox: 2, oy: 60, a: 0, d: 0, out: 3, phase: 'out', hit: [], lv: null, A: null, left: 1 });
  P.EnvZones.add(s, 'puddle', 2, 60, 1.2, 12, 0.25);
  walker(s, 2.4, 60); run(s, 0.05);
  check(s.events.some(e => e.type === 'envArc' && e.src === 'sawblade'), 'arc: sawblade crossing a puddle arcs');
  W.blades.length = 0;
})();

// ---------- A3 rule 3: a canister landing next to an explosive car lights its fuse ----------
(function () {
  var s = mk(19, 2); clean(s, 20);
  var car = addBlock(s, 'car', 3, 50, 1.9, 4.2); car.bomb = true;
  var quiet = addBlock(s, 'car', -3, 50, 1.9, 4.2);
  s.events.push({ type: 'blast', x: 3, y: 51, r: 2.2, small: true, id: 'canister', src: 'canister' });
  s.events.push({ type: 'blast', x: -3, y: 51, r: 2.2, small: true, id: 'knife', src: 'knife' });
  run(s, 0.05);
  check(car.fuseT > 0 && car.fuseVia === 'canister', 'lob: canister on an explosive car lights its fuse');
  check(quiet.fuseT === 0 && quiet.alive, 'lob: a plain car and other weapons do nothing');
  run(s, 1.6);
  check(!car.alive && count(s, 'envExplode') >= 1, 'lob: the car blows after its fuse');
})();

// ---------- A2: a bomb car hit by a weapon starts its fuse; hits during the fuse are ignored ----------
(function () {
  var s = mk(21, 2); clean(s, 20);
  var car = addBlock(s, 'car', 0, 60, 1.9, 4.2); car.bomb = true;
  var z = ring(s, 0, 60, 2, 3);
  P.Combat.forEachProp(s, function (p) { if (p === car) P.Combat.damageProp(s, p, 20); });
  check(car.fuseT > 0 && car.hp === P.CFG.env.hp.car - 20, 'bomb car: first hit lights the fuse, hp still counts');
  var before = car.hp;
  P.Combat.forEachProp(s, function (p) { if (p === car) P.Combat.damageProp(s, p, 20); });
  check(car.hp === before, 'bomb car: hits during the fuse are ignored');
  run(s, P.CFG.env.fuse.car + 0.1);
  check(!car.alive && alive(z) === 0, 'bomb car: blasts after the fuse and kills the ring');
  check(count(s, 'envFuse') >= 1, 'bomb car: envFuse event');
})();

// ---------- A4 wet tiles and glass: the hero slows 20% in a puddle; enemies slow 25%; glass slows 15% ----------
(function () {
  var s = mk(23, 2); clean(s, 30);
  P.EnvZones.add(s, 'puddle', 0, 30, P.CFG.env.puddle.r, 12, P.CFG.env.puddle.enemySlow);
  var e = walker(s, 0.8, 30.6);
  run(s, 0.05);
  check(Math.abs(P.Env.heroMul(s) - (1 - P.CFG.env.puddle.heroSlow)) < 1e-9, 'puddle: hero slowed by 20%');
  check(Math.abs(P.Status.speedMul(e) - (1 - P.CFG.env.puddle.enemySlow)) < 1e-9, 'puddle: enemy slowed by 25%');
  // The hero's real speed drops through stepHero (open lane, no input noise).
  clean(s, 30); var x0 = s.hero.x, y0 = s.hero.y;
  P.stepSim(s, DT, { x: 0, y: 1 }); var free = Math.hypot(s.hero.x - x0, s.hero.y - y0);
  clean(s, 30); P.EnvZones.add(s, 'puddle', 0, 30, 1.2, 12, 0.25); P.Env.step(s, 0);
  x0 = s.hero.x; y0 = s.hero.y; P.stepSim(s, DT, { x: 0, y: 1 }); var wet = Math.hypot(s.hero.x - x0, s.hero.y - y0);
  check(free > 0 && Math.abs(wet / free - (1 - P.CFG.env.puddle.heroSlow)) < 0.02, 'puddle: stepHero moves 20% less in water (ratio ' + (wet / free).toFixed(3) + ')');
  clean(s, 30); var g = walker(s, 2, 40);
  P.EnvZones.add(s, 'glass', 2, 40, P.CFG.env.glass.r, P.CFG.env.glass.T, P.CFG.env.glass.slow);
  run(s, 0.05);
  check(Math.abs(P.Status.speedMul(g) - (1 - P.CFG.env.glass.slow)) < 1e-9, 'glass: enemy slowed by 15%');
  run(s, P.CFG.env.glass.T + 0.2);
  check(P.Status.speedMul(g) === 1 || g.st.slow.t <= 0, 'glass: slow ends after its time');
})();

// ---------- A4 live cable over a puddle: the zap shocks enemies (damage, stun) and the hero standing in it ----------
(function () {
  var s = mk(25, 2); clean(s, 60);
  var c = { x: -2, y: 60, len: 4, zapT: 0.01, arcing: false };
  s.env.cables.push(c);
  P.EnvZones.add(s, 'puddle', -2, 60.4, P.CFG.env.puddle.r, 12, 0.25);
  var e = walker(s, -2.2, 60.2), hp0 = e.hp;
  run(s, 0.05);
  check(count(s, 'envShock') === 1 && e.hp <= hp0 - P.CFG.env.cable.dmg + 1e-6 && e.st && e.st.stun > 0, 'cable: zap damages and stuns an enemy in a linked puddle');
  clean(s, 60); s.env.cables.push({ x: -2, y: 60, len: 4, zapT: 0.01, arcing: false }); P.EnvZones.add(s, 'puddle', -2, 60, 1.2, 12, 0.25);
  s.hero.x = -2; s.hero.y = 60; run(s, 0.05);
  check(s.hero.hp <= s.hero.maxHp - P.CFG.env.cable.heroDmg + 1e-6, 'cable: the hero in the puddle takes the shock');
  clean(s, 60); s.env.cables.push({ x: -2, y: 60, len: 4, zapT: 0.01, arcing: false }); run(s, 0.05);
  check(count(s, 'envShock') === 0, 'cable: no puddle, no zap');
})();

// ---------- A5 doors, windows, manholes: telegraph, 2-4 spawns, every spawn within 1 m of its opening ----------
(function () {
  var s = mk(27, 4);
  var Cn = P.CFG.env.portal, saved = Cn.chance;
  Cn.chance = 1;   // every opening fires once in this check (the real rate is config)
  var total = 0, far = 0, tele = 0, spawnsEv = 0, ok = true, idx, p, pe, n0, n1;
  for (idx = 0; idx < s.env.portals.length; idx++) {
    p = s.env.portals[idx];
    clean(s, p.y - 4); s.env.portals.length = 0; s.env.portals.push(p); p.state = 'idle'; p.passed = false;
    var lastId = P.Combat.spawnEnemy(s, 'walker', 0, 0, {}).id; s.enemies.length = 0; n0 = lastId;
    s.events.length = 0;
    run(s, Cn.telegraph + Cn.gap * Cn.nMax + 0.3);
    tele += count(s, 'envPortal');
    s.enemies.forEach(function (e) { if (e.id > n0) { total++; if (dist(e, p) > 1) far++; } });
    spawnsEv += count(s, 'envSpawn');
  }
  Cn.chance = saved;
  check(tele === s.env.portals.length, 'portal: every opening telegraphs once (' + tele + ')');
  check(total >= 2 * s.env.portals.length, 'portal: 2+ enemies per opening (' + total + ')');
  check(far === 0, 'portal: no spawn further than 1 m from its opening (' + far + ' too far)');
  check(spawnsEv === s.env.portals.length, 'portal: one envSpawn per opening');
  notes.push('portals: ' + s.env.portals.length + ', spawned ' + total + ', telegraphs ' + tele);
})();

// ---------- sim isolation and lint ----------
(function () {
  var files = ['js/sim/env.js', 'js/sim/env-kinds.js', 'js/sim/env-zones.js', 'js/sim/env-rules.js', 'js/sim/env-portal.js'];
  var bad = [];
  files.forEach(function (f) {
    var src = fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\/.*$/gm, '').replace(/'[^'\n]*'/g, "''");
    var m = src.match(/\b\d+\.\d+|\b\d+e-\d+|0x[0-9a-fA-F]+/g) || [];
    if (m.length) bad.push(f + ': ' + m.join(' '));
    if (/P\.Settings|quality|QualityProfile/.test(src)) bad.push(f + ': reads a setting');
  });
  check(bad.length === 0, 'lint: sim numbers live in config-env.js (' + bad.join(' | ') + ')');
})();

console.log('env tests: ' + passes + ' checks passed, ' + fails.length + ' failed');
notes.forEach(n => console.log('  note: ' + n));
fails.forEach(f => console.log('  FAIL ' + f));
process.exitCode = fails.length ? 1 : 0;
