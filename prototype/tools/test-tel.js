// Meta telemetry tests (R1-T5 step 5, game-design 10): perk_learned, perk_respec, bond_threshold, meta_upgrade and the Street Cred
// currency_flow events. Checks the fields, that balance_after always matches the saved balance, that a refused action logs nothing,
// and that hooking telemetry up does not change the save. Headless, no DOM. Usage: node prototype/tools/test-tel.js
'use strict';
const { loadP } = require('./lib-load.js');
const P = loadP(), M = P.Meta, K = P.CFG.bond.kaan;
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.log('FAIL ' + m); } };
const section = (name, fn) => { try { fn(); } catch (e) { fails++; console.log('FAIL ' + name + ' threw: ' + (e && e.stack || e)); } };

let log = [];
M.onTel = (event, fields) => log.push(Object.assign({ event }, fields));
const take = () => { const out = log; log = []; return out; };
const of = (list, name) => list.filter(e => e.event === name);
const sc = () => M.heroStats('arda').sc;
const seed = (attr, credit) => { const s = M.state(); Object.assign(s.heroes.arda.stats.attr, attr); s.heroes.arda.stats.sc = credit; s.tree = P.Tree.newState(); M.save(); take(); };
const result = (levelIndex, stars, won, kills) => M.onResults({ levelIndex, won: won !== false, stars, coins: 10, kills: kills || 100, tally: Object.assign(P.Tally.create(), { kills: kills || 100 }) });

section('perk_learned and the Street Cred spend', () => {
  seed({ str: 2 }, 5);
  ok(M.treeLearn('str.2'), 'learn works');
  const ev = take();
  ok(of(ev, 'perk_learned').length === 1 && of(ev, 'currency_flow').length === 1 && ev.length === 2, 'one learn logs perk_learned and one currency_flow');
  const pl = of(ev, 'perk_learned')[0], cf = of(ev, 'currency_flow')[0];
  ok(pl.perk_id === 'str.2' && pl.cost === 2 && pl.attr_rank === 2 && pl.sc_after === 3, 'perk_learned carries the perk, cost, attribute rank and balance');
  ok(cf.currency === 'street_cred' && cf.delta === -2 && cf.source_or_sink === 'perk_learned' && cf.balance_after === sc(), 'the spend is a negative currency_flow whose balance matches the save');
  ok(!M.treeLearn('str.2') && !M.treeLearn('str.3') && !M.treeLearn('nope') && take().length === 0, 'a refused learn (owned, rank-locked, unknown) logs nothing');
});

section('perk_respec and the refund', () => {
  seed({ str: 2 }, 5);
  M.treeLearn('str.1'); M.treeLearn('str.2'); take();
  ok(M.treeRespec() === 3, 'respec refunds');
  const ev = take(), rs = of(ev, 'perk_respec')[0], cf = of(ev, 'currency_flow')[0];
  ok(ev.length === 2 && rs && rs.refunded === 3 && rs.perks_cleared === 2 && rs.chapter === P.CFG.tree.chapter && rs.sc_after === 5, 'perk_respec carries the refund, the perks cleared, the chapter and the balance');
  ok(cf.delta === 3 && cf.source_or_sink === 'respec_refund' && cf.balance_after === sc() && cf.balance_after === 5, 'the refund is a positive currency_flow that matches the save');
  M.treeLearn('str.1'); take();
  ok(M.treeRespec() === 0 && take().length === 0, 'a refused respec (used this chapter) logs nothing');
});

section('level end: Street Cred earned and bond thresholds', () => {
  seed({}, 0);
  const s = M.state(); s.bonds.kaan = 0; s.stars = {}; M.save(); take();
  result(20, 2, true, 3000);
  let ev = take();
  const flows = of(ev, 'currency_flow');
  ok(flows.length === 1 && flows[0].currency === 'street_cred' && flows[0].delta > 0 && flows[0].source_or_sink === 'level_end' && flows[0].balance_after === sc(),
    'a level that crosses a Street Cred milestone logs one earn that matches the save');
  ok(of(ev, 'bond_threshold').length === 0, 'the join (bond 5) crosses no threshold');
  M.state().bonds.kaan = 22; M.save(); take();
  result(21, 2, true, 100);
  ev = take();
  const bt = of(ev, 'bond_threshold');
  ok(bt.length === 1 && bt[0].companion === 'kaan' && bt[0].threshold === 25 && bt[0].value === 26 && bt[0].level_id === 21, 'crossing 25 logs bond_threshold with the new value and level');
  result(21, 2, true, 100);
  ok(of(take(), 'bond_threshold').length === 0, 'a repeat clear past the threshold logs none');
  M.state().bonds.kaan = 49; M.save(); take();
  result(22, 3, true, 100);
  ok(of(take(), 'bond_threshold').map(e => e.threshold).join() === '50', 'crossing 50 logs bond_threshold 50');
  result(22, 0, false, 100);
  ok(of(take(), 'currency_flow').every(e => e.delta !== 0), 'no zero-value flows are logged');
});

section('attribute spend', () => {
  seed({ str: 1 }, 0);
  const st = M.state(); st.heroes.arda.stats.ready.str = 2; M.save(); take();
  ok(M.allocate({ str: 1 }) && of(take(), 'meta_upgrade').length === 1, 'raising an attribute logs one meta_upgrade');
  const ev = M.allocate({ str: 1 }) ? take() : [];
  ok(ev[0] && ev[0].type === 'attribute' && ev[0].id === 'str' && ev[0].cost === 0 && ev[0].rank_after === 3, 'meta_upgrade carries the attribute, a zero cost and the new rank');
  ok(!M.allocate({ str: 1 }) && take().length === 0, 'a refused allocation (no ready point) logs nothing');
});

section('telemetry never changes the save', () => {
  const run = hook => {
    M.onTel = hook;
    M.reset();
    seed({ str: 2, agg: 1 }, 6);
    const s = M.state(); s.stars = {}; s.bonds.kaan = 0; M.save();
    M.treeLearn('str.1'); M.treeLearn('agg.1'); result(20, 2, true, 3000); result(21, 3, true, 500); M.treeRespec();
    const st = JSON.parse(JSON.stringify(M.state()));
    delete st.lastPlayed;   // a wall-clock stamp
    return JSON.stringify(st);
  };
  const withHook = run((e, f) => log.push(Object.assign({ event: e }, f)));
  const without = run(null);
  ok(withHook === without, 'the saved state is identical with and without the telemetry hook');
  M.onTel = (event, fields) => log.push(Object.assign({ event }, fields));
});

console.log(fails ? 'test-tel: ' + fails + ' failure(s), ' + passes + ' passed' : 'test-tel: all ' + passes + ' checks pass');
process.exit(fails ? 1 : 0);
