// Street Tree tests (R1-T5 step 1, D-059): perk costs and rank gates, learn and respec, the Street Cred spend rule
// (SC pays perks only, attribute ranks use READY points only), and the save migration v2 -> v3. Headless, no DOM.
// Usage: node prototype/tools/test-tree.js
'use strict';
const { loadP } = require('./lib-load.js');
const P = loadP(), T = P.Tree, S = P.Stats, M = P.Meta;
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.log('FAIL ' + m); } };
const section = (name, fn) => { try { fn(); } catch (e) { fails++; console.log('FAIL ' + name + ' threw: ' + (e && e.stack || e)); } };
const prog = (attr, sc) => { const p = S.newProgress(); Object.assign(p.attr, attr || {}); p.sc = sc || 0; return p; };

section('shape and budget', () => {
  const ids = T.ids(), costs = ids.map(id => T.node(id).cost);
  ok(ids.length === 24 && new Set(ids).size === 24, 'six branches x four tiers = 24 distinct perk ids');
  ok(T.node('str.1').gate === 1 && T.node('str.2').gate === 2 && T.node('str.3').gate === 4 && T.node('str.4').gate === 6, 'tier gates are ranks 1, 2, 4, 6');
  ok(costs.reduce((a, b) => a + b, 0) === 60, 'the Ch1 tree costs 60 Street Cred in total');
  ok(['str', 'pace', 'agg', 'int', 'cha', 'grit'].every(a => [1, 2, 3, 4].reduce((s, t) => s + T.node(a + '.' + t).cost, 0) === 10), 'a full branch costs 10');
  ok(P.CFG.tree.tiers[3].gate === P.CFG.stats.max || P.CFG.tree.tiers[3].gate <= 6, 'the top Ch1 tier does not need more than the Ch1 attribute cap (6)');
  ['', 'x', 'str', 'str.0', 'str.5', 'luck.1', 'str.1.1', null, undefined, 4].forEach(id => ok(T.node(id) === null, 'unknown perk id rejected: ' + String(id)));
  // Budget assumption from docs/skill-tree.md 4.4: about 32 SC at 50,000 lifetime kills.
  const n = S.scAt(50000);
  ok(n >= 30 && n <= 35, 'Street Cred milestones at 50k lifetime kills are about 32 (got ' + n + ')');
});

section('rank is the lock, Street Cred is the key', () => {
  const t = T.newState();
  ok(T.canLearn(prog({}, 99), t, 'str.1').why === 'rank', 'rank 0 cannot learn tier 1, however much SC');
  ok(T.canLearn(prog({ str: 1 }, 0), t, 'str.1').why === 'sc', 'rank 1 with no SC cannot learn');
  ok(T.canLearn(prog({ str: 1 }, 1), t, 'str.1').ok, 'rank 1 with 1 SC can learn tier 1');
  ok(T.canLearn(prog({ str: 1 }, 99), t, 'str.2').why === 'rank', 'rank 1 cannot learn tier 2');
  ok(T.canLearn(prog({ str: 3 }, 99), t, 'str.3').why === 'rank', 'rank 3 cannot learn tier 3 (needs 4)');
  ok(T.canLearn(prog({ str: 4 }, 3), t, 'str.3').ok, 'rank 4 with 3 SC can learn tier 3');
  ok(T.canLearn(prog({ str: 6 }, 4), t, 'str.4').ok, 'rank 6 with 4 SC can learn tier 4');
  ok(T.canLearn(prog({ pace: 6 }, 99), t, 'str.1').why === 'rank', 'another attribute rank does not open this branch');
  const p = prog({ str: 0 }, 99); p.ready.str = 5;
  ok(T.canLearn(p, t, 'str.1').why === 'rank', 'READY (unspent) points do not count as rank');
  ok(T.canLearn(prog({ str: 1 }, 1), t, 'nope').why === 'unknown', 'unknown id reports unknown');
});

section('learn', () => {
  const p0 = prog({ str: 4, agg: 2 }, 10), t0 = T.newState(), snap = JSON.stringify([p0, t0]);
  const r = T.learn(p0, t0, 'str.3');
  ok(r && r.prog.sc === 7 && r.tree.learned['str.3'] === 1, 'learning str.3 costs 3 and is recorded');
  ok(JSON.stringify([p0, t0]) === snap, 'learn does not mutate its inputs');
  ok(T.learn(r.prog, r.tree, 'str.3') === null, 'a perk cannot be learned twice');
  ok(T.canLearn(r.prog, r.tree, 'str.3').why === 'owned', 'owned perk reports owned');
  const r2 = T.learn(r.prog, r.tree, 'agg.2');
  ok(r2 && r2.prog.sc === 5 && T.spent(r2.tree) === 5, 'two perks: SC 10 - 3 - 2 = 5 and spent = 5');
  ok(T.learn(prog({ str: 4 }, 2), T.newState(), 'str.3') === null, 'learn returns null when SC is short');
  ok(T.learn(prog({ str: 1 }, 99), T.newState(), 'str.2') === null, 'learn returns null when rank is short');
  ok(T.learn(prog({ str: 1 }, 1), T.newState(), 'bogus') === null, 'learn returns null for an unknown id');
  ok(r.prog.attr.str === 4, 'learning never changes attribute ranks');
});

section('respec', () => {
  let p = prog({ str: 6, agg: 2 }, 20), t = T.newState(), r;
  [['str.1'], ['str.2'], ['str.3'], ['agg.2']].forEach(([id]) => { r = T.learn(p, t, id); p = r.prog; t = r.tree; });
  ok(p.sc === 20 - 1 - 2 - 3 - 2, 'four perks cost 8 SC');
  const rs = T.respec(p, t, 1);
  ok(rs && rs.refunded === 8 && rs.prog.sc === 20 && Object.keys(rs.tree.learned).length === 0, 'respec refunds all 8 SC and clears the tree');
  ok(rs.prog.attr.str === 6 && rs.prog.attr.agg === 2, 'respec never touches attribute ranks');
  ok(T.respec(rs.prog, rs.tree, 1) === null, 'nothing to respec after a respec');
  let r2 = T.learn(rs.prog, rs.tree, 'str.1');
  ok(T.respec(r2.prog, r2.tree, 1) === null, 'the second respec in the same chapter is refused');
  const nextCh = T.respec(r2.prog, r2.tree, 2);
  ok(nextCh && nextCh.refunded === 1, 'a new chapter has its own free respec');
  ok(T.respec(prog({}, 5), T.newState(), 1) === null, 'respec with an empty tree is refused and costs no use');
});

section('Street Cred spends on perks only; attribute ranks use READY points only', () => {
  const p = prog({}, 50);
  ok(S.allocate(p, { str: 1 }) === null, 'allocate refuses an attribute point paid with Street Cred');
  ok(S.spendable(p) === 0, 'spendable ignores Street Cred');
  p.ready.str = 2; p.ready.pace = 1;
  ok(S.spendable(p) === 3, 'spendable is the READY points on all six');
  const a = S.allocate(p, { str: 2, pace: 1 });
  ok(a && a.attr.str === 2 && a.attr.pace === 1 && a.ready.str === 0 && a.sc === 50, 'allocate spends READY points and leaves Street Cred alone');
  ok(S.allocate(p, { str: 3 }) === null, 'allocate refuses more points than READY on that attribute');
  ok(S.allocate(p, { agg: 1 }) === null, 'READY on one attribute cannot be moved to another');
  ok(S.scNeeded === undefined, 'scNeeded is gone with the rule that needed it');
});

section('save migration v2 -> v3', () => {
  const store = {}, st = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
  const v2 = { v: 2, unlocked: 9, coins: 321, stars: { 1: 3, 2: 2 }, mastery: { knife: 400 }, counters: { kills: 777 },
    heroes: { arda: { stats: { attr: { str: 4 }, sc: 6, kills: 777 }, ult: 'nazar' } }, streak: { n: 3, last: '2026-11-10', best: 5 } };
  store[M.Save.KEY_V2] = JSON.stringify(v2);
  const s = M.Save.read(st, 1000);
  ok(M.Save.VERSION === 3 && M.Save.KEY === 'nsi.meta.v3' && s.v === 3, 'save version and key are v3');
  ok(s.unlocked === 9 && s.coins === 321 && s.stars[1] === 3 && s.mastery.knife === 400 && s.counters.kills === 777, 'v2 progress survives the migration');
  ok(s.heroes.arda.stats.attr.str === 4 && s.heroes.arda.stats.sc === 6, 'v2 attribute ranks and Street Cred survive');
  ok(s.streak.n === 3 && s.streak.best === 5, 'v2 streak survives');
  ok(JSON.stringify(s.tree) === JSON.stringify({ learned: {}, respecs: {} }), 'a migrated save starts with an empty tree');
  ok(JSON.stringify(s.bonds) === JSON.stringify({ kaan: 0, mila: 0, ada: 0 }), 'a migrated save starts with bonds at 0');
  ok(store[M.Save.KEY_V2] === JSON.stringify(v2), 'the v2 key is kept untouched as a backup');
  M.Save.write(s, st);
  const again = M.Save.read(st, 2000);
  ok(JSON.stringify(again.tree) === JSON.stringify(s.tree) && again.coins === 321, 'a v3 save reads back the same');
  const r = T.learn(again.heroes.arda.stats, again.tree, 'str.3');
  again.heroes.arda.stats = r.prog; again.tree = r.tree; again.bonds.kaan = 40;
  M.Save.write(again, st);
  const back = M.Save.read(st, 3000);
  ok(back.tree.learned['str.3'] === 1 && back.heroes.arda.stats.sc === 3 && back.bonds.kaan === 40, 'learned perks, Street Cred and bonds persist through a reload');
  const bad = M.Save.normalize({ tree: { learned: { 'str.1': 1, 'zzz.9': 1, 'agg.2': 0, 'cha.4': 'yes' }, respecs: { 1: -4, 2: '3', 3: 'x' } },
    bonds: { kaan: 250, mila: -5, ada: 'abc', extra: 9 } });
  ok(bad.tree.learned['str.1'] === 1 && bad.tree.learned['cha.4'] === 1 && !('zzz.9' in bad.tree.learned) && !('agg.2' in bad.tree.learned), 'damaged tree: unknown and falsy perks are dropped');
  ok(bad.tree.respecs[1] === 0 && bad.tree.respecs[2] === 3 && bad.tree.respecs[3] === 0, 'damaged respec counts become whole numbers >= 0');
  ok(bad.bonds.kaan === 100 && bad.bonds.mila === 0 && bad.bonds.ada === 0 && !('extra' in bad.bonds), 'damaged bonds are clamped to 0..100 and unknown meters dropped');
  [null, 5, 'x', [], { tree: 7, bonds: 'no' }].forEach(raw => {
    const n = M.Save.normalize(raw);
    ok(n.v === 3 && n.tree && n.tree.learned && n.bonds && n.bonds.kaan === 0, 'normalize survives ' + JSON.stringify(raw));
  });
  M.Save.wipe(st);
  ok(Object.keys(store).length === 0, 'wipe removes the v3, v2 and v1 keys');
});

section('persistence API used by the Street Tree screen', () => {
  const s = M.state();
  s.heroes.arda.stats.attr.str = 2; s.heroes.arda.stats.attr.agg = 1; s.heroes.arda.stats.sc = 5; s.tree = T.newState(); M.save();
  ok(!M.treeLearn('str.3') && !M.treeLearn('nope') && M.treeState().sc === 5, 'a rank-locked or unknown perk is refused and costs nothing');
  ok(M.treeLearn('str.1') && M.treeLearn('str.2'), 'learn persists two perks the hero can afford');
  let st = M.treeState();
  ok(st.sc === 2 && st.learned['str.1'] === 1 && st.learned['str.2'] === 1 && st.spent === 3 && !st.respecUsed, 'Street Cred drops by the cost and the state reports what was learned');
  ok(!M.treeLearn('str.2') && M.treeState().sc === 2, 'learning an owned perk again is refused');
  ok(M.loadout().perks.slice().sort().join() === 'str.1,str.2', 'the run loadout carries the learned perks');
  ok(M.treeRespec() === 3, 'respec refunds every perk');
  st = M.treeState();
  ok(st.sc === 5 && st.spent === 0 && st.respecUsed && Object.keys(st.learned).length === 0, 'after respec the tree is empty, the Street Cred is back and the chapter respec is used');
  M.treeLearn('agg.1');
  ok(M.treeRespec() === 0 && M.treeState().learned['agg.1'] === 1 && M.treeState().sc === 4, 'a second respec in the same chapter is refused and changes nothing');
  M.state().tree = T.newState(); M.save();
  ok(M.treeRespec() === 0 && !M.treeState().respecUsed, 'respec with nothing learned does nothing and does not burn the free respec');
});

section('screen strings: every perk and screen key has EN and TR text', () => {
  const keys = [];
  T.ids().forEach(id => keys.push('tree.' + id + '.name', 'tree.' + id + '.desc'));
  ['title', 'page.fight', 'page.street', 'page.bond', 'sc', 'needs', 'learn', 'learned', 'respec', 'respecUsed', 'hint', 'tier', 'short', 'respecConfirm', 'bond.locked', 'pick']
    .forEach(k => keys.push('tree.' + k));
  keys.push('tab.tree');
  keys.forEach(k => ok(P.STR.tr[k] && P.STR.en[k], 'TR and EN text for ' + k));
  T.ids().forEach(id => ok(P.STR.tr['tree.' + id + '.name'].length <= 20 && P.STR.en['tree.' + id + '.name'].length <= 20, 'perk name fits a node: ' + id));
});

console.log(fails ? 'test-tree: ' + fails + ' failure(s), ' + passes + ' passed' : 'test-tree: all ' + passes + ' checks pass');
process.exit(fails ? 1 : 0);
