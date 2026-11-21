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

section('run outcomes survive replay and storage recovery', () => {
  M.reset();
  const win = { runId: 'test-win', outcome: 'win', won: true, levelIndex: 1, stars: 2, coins: 20, tally: {} };
  const original = M.onResults(win), paid = M.state().coins;
  ok(M.Save.read().pending.runId === win.runId && M.Save.read().unlocked === 2, 'win and unlock are saved with the recap');
  const scrap = P.CFG.rewards.hurdaBase * P.CFG.rewards.firstClearMult;
  ok(original.reward.hurda === scrap && M.Save.read().hurda === scrap, 'the saved Hurda payout matches the first-clear recap');
  ok(M.onResults(win).reward.total === original.reward.total && M.state().coins === paid,
    'a duplicate win callback pays once');
  M.takePending();
  const quit = { runId: 'test-quit', outcome: 'quit', levelIndex: 2, coins: 37, tally: { kills: 20 } };
  M.onResults(quit);
  const retained = Math.floor(37 * P.CFG.rewards.loseKeep);
  ok(M.Save.read().coins === paid + retained && !M.Save.read().pending, 'quit keeps the amount promised by the pause menu');
  M.onResults({ runId: 'test-restart', outcome: 'restart', levelIndex: 2, coins: 91 });
  M.onResults(win);
  M.onResults(quit);
  ok(M.state().coins === paid + retained && M.state().hurda === scrap, 'restart discards its loot and replaying earlier outcomes adds nothing');
  localStorage.setItem(M.Save.KEY, '{invalid');
  const recovered = M.Save.read();
  ok(recovered.unlocked === 2 && recovered.coins === paid + retained, 'a damaged primary save recovers the previous valid save');
});

section('page exit telemetry distinguishes finished and interrupted runs', () => {
  const fs = require('node:fs'), vm = require('node:vm'), store = new Map(), page = {};
  const sandbox = { P: { Settings: { installId: 'test-install' } },
    window: { addEventListener: (event, handler) => { page[event] = handler; } },
    document: { addEventListener() {} }, setTimeout, clearTimeout,
    localStorage: { getItem: id => store.get(id), setItem: (id, text) => store.set(id, text) } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../js/view/telemetry.js'), 'utf8'), sandbox);
  const T = sandbox.P.Tel, level = { id: 'H01-L1' }, saved = () => JSON.parse(store.get('nsi.tel.v1'));
  const finished = T.startRun(1, level, 'normal');
  T.log('level_start'); T.log('level_end', { result: 'win' });
  ok(saved().length === 2, 'terminal events are saved immediately');
  page.pagehide({ persisted: false });
  ok(!saved().some(e => e.event === 'run_interrupted'), 'leaving after a finished run never records an interruption');
  const live = T.startRun(1, level, 'normal');
  T.log('level_start');
  page.pagehide({ persisted: true });
  ok(!saved().some(e => e.event === 'run_interrupted'), 'moving an open run to the browser back cache keeps it open');
  page.pagehide({ persisted: false });
  const rows = saved();
  ok(finished !== live && rows.at(-1).event === 'run_interrupted' && rows.at(-1).run_id === live &&
    new Set(rows.map(e => e.event_id)).size === rows.length, 'exiting the live run records an identifiable interruption once');
});

section('playtest report groups gameplay and ignores repeat downloads', () => {
  const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
  const { execFileSync } = require('node:child_process');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'istanbul-playtest-'));
  try {
    const input = path.join(dir, 'fixture.jsonl');
    const run = { run_id: 'sample-attempt', build: 'fixture', level: 1, level_id: 'H01-L1', install_id: 'test-install', session_id: 'sample-session' };
    const rows = [
      { ...run, event: 'level_start' }, { ...run, event: 'first_move' },
      { ...run, event: 'card_offered', cards: ['w:knife', 'w:nailgun'] }, { ...run, event: 'card_chosen', chosen: 'w:knife', t_s: 12 },
      { ...run, event: 'level_end', result: 'win' },
      { ...run, run_id: 'sample-next', level: 2, level_id: 'H01-L2', event: 'level_start' },
      { ...run, run_id: 'sample-next', level: 2, level_id: 'H01-L2', event: 'run_interrupted' },
      { event: 'bench_result', session_id: 'bench-private', build: 'fixture', art: 'raster', scene: 'crowd',
        frame_ms: { p50: 22, p95: 39 }, cap_frame_ms: { p95: 39 }, peak_enemies_drawn: 200, enemy_cap: 200,
        memory: { estimated_graphics_peak_bytes: 24 * 1024 * 1024 }, audio: [{ audible: ['run_calm', 'boss'] }] },
    ].map((event, i) => ({ ...event, event_id: String(i), ts: new Date(i * 1000).toISOString() }));
    fs.writeFileSync(input, rows.map(row => JSON.stringify(row)).join('\n') + '\n{bad\n');
    const report = execFileSync(process.execPath, [require.resolve('./playtest-report.js'), input, input], { encoding: 'utf8' });
    ok(/8 unique records.*8 duplicates and 2 unreadable/.test(report) && /separate: 1 scene results/.test(report), 'reports deduplicate copied records and separate benchmarks');
    ok(/2\. Older or partial/.test(report) && /including 1 who started L2/.test(report), 'level outcomes keep progression linked within a session');
    ok(/Median active play time to first L1 pick: 12\.0s/.test(report) && /\| w:knife \| 1 \| 1 \|/.test(report) &&
      /\| H01-L2 \| normal \| 1 \| 0 \| 0 \| 0 \| 0 \| 1 \| 0 \|/.test(report), 'reports use offered cards, observed time and the recorded page exit');
    ok(!report.includes(run.install_id) && !report.includes(run.run_id), 'report output omits individual install and run IDs');
    ok(report.includes('| 1 | fixture | raster | crowd | 22 / 39 | 39 | 200 / 200 | 24.0 | Tracks overlapped |') &&
      !report.includes('bench-private'), 'benchmark rows show the load, frame times and sampled music without printing session IDs');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

console.log(fails ? 'test-tel: ' + fails + ' failure(s), ' + passes + ' passed' : 'test-tel: all ' + passes + ' checks pass');
process.exit(fails ? 1 : 0);
