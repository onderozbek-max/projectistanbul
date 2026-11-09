// node /tmp/istanbul-review/meta-check.js : save round-trip + daily retry checks (no repo writes)
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = require('path').join(__dirname, '../../../../prototype');
const NOT = /^js\/(view|story)\/|^js\/main\.js$|^js\/meta\/meta-(ui|map|hub|gear|stats|arsenal)\.js$/;
const FILES = [...fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(f => !NOT.test(f));
globalThis.localStorage = (() => { const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; }, _m: m }; })();
FILES.forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const P = globalThis.P, M = P.Meta;
// 1. flawless per-hood counter survives a save/load?
const s = M.Save.defaults(); s.counters.flawless.karakoy = 4; s.counters.flawlessTotal = 4;
const back = M.Save.normalize(JSON.parse(JSON.stringify(s)));
console.log('flawless.karakoy before', s.counters.flawless.karakoy, 'after normalize', back.counters.flawless.karakoy);
// 2. unreachable collection / achievements
console.log('levelCount', M.CFG.levelCount, 'letters', M.Collect.LETTERS.map(l => l.id + '@' + l.level).join(' '));
console.log('hoodsCleared counter bumped anywhere in bump()?', /hoodsCleared/.test(M.Collect.bump.toString()));
// 3. daily modifiers: does any sim code read them?
const lo = M.loadout({ daily: true, modifiers: [{ id: 'horde', spawnMult: 1.35 }, { id: 'glass', enemyHpMult: 0.75 }], seed: 42 });
const a = P.createSim(42, { levelIndex: 12, loadout: lo }), b = P.createSim(42, { levelIndex: 12, loadout: Object.assign({}, lo, { modifiers: [] }) });
console.log('diff with daily mods', JSON.stringify(a.diff), 'without', JSON.stringify(b.diff));
// 4. old v1 save with odd shapes
['5', '"x"', '[]', '{"v":1,"unlocked":"12","stars":{"3":"2"},"coins":"abc","heroes":{"arda":{"stats":null}}}', '{"v":2,"pending":{"reward":1},"flags":[1,2]}'].forEach(raw => {
  try { const r = M.Save.migrate(JSON.parse(raw), 1); console.log('migrate', raw.slice(0, 40), '-> ok unlocked', r.unlocked, 'pending', JSON.stringify(r.pending), 'flags isArray', Array.isArray(r.flags)); }
  catch (e) { console.log('migrate', raw, 'THREW', e.message); }
});
