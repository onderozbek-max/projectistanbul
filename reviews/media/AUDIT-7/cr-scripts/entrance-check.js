// node /tmp/istanbul-review/entrance-check.js : are event/scripted spawns relocated by Enemies3.entrance?
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = require('path').join(__dirname, '../../../../prototype');
const NOT = /^js\/(view|story)\/|^js\/main\.js$|^js\/meta\/meta-(ui|map|hub|gear|stats|arsenal|collect|daily|save)\.js$/;
[...fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(f => !NOT.test(f))
  .forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const P = globalThis.P;
let moved = { rescue: 0, set: 0, chest: 0 }, total = { rescue: 0, set: 0, chest: 0 };
for (let seed = 1; seed <= 40; seed++) {
  const s = P.createSim(seed, { levelIndex: 13 }); P.startPlay(s); s.hero.y = 20;
  const r = P.Events.start(s, 'rescue', {});
  const R = P.CFG.ev.rescue;
  s.enemies.filter(e => e.evId === r.id).forEach(e => { total.rescue++; if (Math.hypot(e.x - r.x, e.y - r.y) > R.ringR + 0.6) moved.rescue++; });
  const st = P.Events.start(s, 'set', { type: 'spitter', x: 5.5, y: 32, anchored: true });
  st.t = 99; P.EventKinds.set.step(s, st);
  s.enemies.filter(e => e.evId === st.id).forEach(e => { total.set++; if (Math.hypot(e.x - st.x, e.y - st.y) > 0.6) moved.set++; });
  const ch = P.Events.start(s, 'chest', {});
  total.chest++; if (Math.hypot(ch.guard.x - ch.x, ch.guard.y - ch.y) > P.CFG.ev.chest.guardDist + 0.6) moved.chest++;
}
console.log('relocated away from their event spot:', JSON.stringify(moved), 'of', JSON.stringify(total));
