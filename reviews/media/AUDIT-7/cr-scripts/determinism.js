// node /tmp/istanbul-review/determinism.js : same seed + same inputs => same state, also with another sim interleaved
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = require('path').join(__dirname, '../../../../prototype');
const NOT = /^js\/(view|story)\/|^js\/main\.js$|^js\/meta\/meta-(ui|map|hub|gear|stats|arsenal|collect|daily|save)\.js$/;
[...fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(f => !NOT.test(f))
  .forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const P = globalThis.P, DT = 1 / 60;
function mk(level, seed) { const s = P.createSim(seed, { levelIndex: level, loadout: P.Power.expectedLoadout(level) }); P.startPlay(s); return s; }
function tick(s, i) {
  s.hero.hp = s.hero.maxHp;
  while (s.pendingChests > 0) P.Progression.openChest(s, P.Progression.chestReward(s));
  while (s.pendingLevels > 0) P.Progression.choose(s, P.Progression.makeOffer(s).cards[0]);
  P.stepSim(s, DT, { x: 0.6 * Math.sin(i / 70), y: 0.9, dash: i % 400 === 0, skill: i % 900 === 0, ult: i % 1500 === 0 });
  return P.drainEvents(s).length;
}
function hash(s, evn) { return [s.hero.x.toFixed(6), s.hero.y.toFixed(6), s.kills, s.enemies.length, s.nextId, s.level, s.jeton, evn, s.mode].join(','); }
const STEPS = 60 * 90;
for (const L of [12, 25, 50, 63, 75, 100]) {
  const a = mk(L, 7); let ea = 0; for (let i = 0; i < STEPS; i++) ea += tick(a, i);
  const b = mk(L, 7), other = mk(L === 100 ? 99 : L + 1, 3); let eb = 0;
  for (let i = 0; i < STEPS; i++) { eb += tick(b, i); tick(other, i); }
  const ha = hash(a, ea), hb = hash(b, eb);
  console.log('L' + L, ha === hb ? 'SAME' : 'DIFF', ha, ha === hb ? '' : hb);
}
