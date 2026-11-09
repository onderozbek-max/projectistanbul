// Usage: node /tmp/istanbul-review/bench.js <enemies> <levelIndex> <secs>
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = require('path').join(__dirname, '../../../../prototype');
const src = fs.readFileSync(path.join(ROOT, 'tools/test-arsenal.js'), 'utf8');
const FILES = eval(src.match(/const FILES = (\[[\s\S]*?\]);/)[1]);
FILES.forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const P = globalThis.P;
if (!P.Enemies.frame) P.Enemies.frame = function () {};
const N = +process.argv[2] || 150, LV = +process.argv[3] || 1, SECS = +process.argv[4] || 10, DT = 1 / 60;
const T = {};
function wrap(obj, name, label) {
  const f = obj[name]; T[label] = 0;
  obj[name] = function () { const t0 = process.hrtime.bigint(); try { return f.apply(this, arguments); } finally { T[label] += Number(process.hrtime.bigint() - t0) / 1e6; } };
}
wrap(P.Combat, 'updateEnemies', 'Combat.updateEnemies');
wrap(P.Weapons, 'step', 'Weapons.step');
wrap(P.Combat, 'updateBurnAndZones', 'Combat.updateBurnAndZones');
wrap(P.Enemies, 'frame', 'Enemies.frame');
wrap(P.Director, 'step', 'Director.step');
if (P.Env && P.Env.step) wrap(P.Env, 'step', 'Env.step');
wrap(P.Events, 'step', 'Events.step');
wrap(P.Skills, 'step', 'Skills.step');
wrap(P.Weapons, 'densest', 'Weapons.densest(ext calls)');
const s = P.createSim(1234, { levelIndex: LV, loadout: null });
s.mode = 'play';
const W = P.CFG.arsenal.weapons.slice();
P.Progression.debugGrant(s, { weapons: Object.fromEntries(W.map(id => [id, 5])), passives: { shoes: 5, gloves: 5 } });
function feed(n) { const h = s.hero; for (let i = s.enemies.length; i < n; i++) { const a = s.rng.ai.range(0, 6.283), r = s.rng.ai.range(2, 9);
  P.Combat.spawnEnemy(s, s.rng.ai.chance(0.2) ? 'runner' : 'walker', Math.max(-6.5, Math.min(6.5, h.x + Math.cos(a) * r)), Math.max(1, h.y + Math.sin(a) * r), { state: 'active' }); } }
const steps = Math.round(SECS / DT); let tot = 0, alive = 0, maxStep = 0;
for (let i = 0; i < steps; i++) {
  s.hero.hp = s.hero.maxHp;
  while (s.pendingChests > 0) P.Progression.openChest(s, P.Progression.chestReward(s));
  while (s.pendingLevels > 0) P.Progression.choose(s, P.Progression.makeOffer(s).cards[0]);
  feed(N); alive += s.enemies.length;
  const t0 = process.hrtime.bigint();
  P.stepSim(s, DT, { x: Math.sin(i / 90), y: Math.cos(i / 130) });
  P.drainEvents(s);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6; tot += ms; if (i > 60) maxStep = Math.max(maxStep, ms);
}
console.log(`N=${N} L=${LV} steps=${steps} avg alive=${(alive / steps).toFixed(0)} avg ms/step=${(tot / steps).toFixed(3)} max=${maxStep.toFixed(2)}`);
Object.keys(T).forEach(k => console.log(`  ${k}: ${(T[k] / steps).toFixed(3)} ms/step`));
