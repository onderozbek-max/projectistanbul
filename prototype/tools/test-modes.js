// Replay tier tests (R1-T4 part 18): Nightmare (per-hood unlock, multipliers only in Nightmare, one signature per hood, the
// fourth star, moon and title, reward rules) and the Night Shift daily (seed determinism, one paid run per day, streak,
// endless run to the 12-minute cap). Also: the save's additive modes block survives damaged values, normal levels are
// unchanged (golden trace), the sim reads no settings, and the strings and ids the new code uses exist.
// Usage: node prototype/tools/test-modes.js
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { loadP, ROOT } = require('./lib-load.js');
const P = loadP(), M = P.Meta, C = P.CFG;
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.log('FAIL ' + m); } };
const section = (name, fn) => { try { fn(); } catch (e) { fails++; console.log('FAIL ' + name + ' threw: ' + (e && e.stack || e)); } };
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const J = P.Journey;

// Clock for the Night Shift tests: Date.now is swapped for the duration of one call.
function atTime(ms, fn) { const real = Date.now; Date.now = () => ms; try { return fn(); } finally { Date.now = real; } }
const at = (y, mo, d, h) => new Date(y, mo - 1, d, h || 10).getTime();
function freshSave() { M.reset(); return M.state(); }

section('config shape', () => {
  const sig = C.levels.nightmare.sig, hoods = J.hoods.map(h => h.id);
  ok(Object.keys(sig).length === 20 && hoods.every(id => sig[id]), 'one nightmare signature per hood (20 hoods)');
  ok(hoods.every(id => ['elite', 'roster', 'hold'].indexOf(sig[id].lever) >= 0), 'every signature uses an existing lever (elite, roster, hold)');
  ok(C.nightmare.cred === 2 && C.nightmare.coins === 1.5 && C.nightmare.starsMax === 4 && C.nightmare.titleAt === 3, 'reward numbers: cred x2, coins x1.5, four stars, title at 3 moons');
  ok(C.nightshift.capS === 720 && C.nightshift.reviveN === 1 && C.nightshift.cred === undefined && C.nightshift.coins > 0, 'Night Shift: 12-minute cap, one revive, fixed coin pay and no Street Cred');
  ok(!C.nightshift.names || C.nightshift.names.adj * C.nightshift.names.noun >= 16, 'seed name has at least 16 combinations');
});

section('multipliers only in Nightmare', () => {
  const N = C.levels.nightmare;
  for (let i = 2; i <= 100; i++) {
    const base = P.Levels.difficulty(i), nd = P.Modes.nightmareDiff(i, base);
    ok(nd.hp > base.hp && nd.dmg > base.dmg, 'nightmare hp and damage are above normal at index ' + i);
    if (nd.spawn > N.spawn.cap + 1e-9) ok(false, 'spawn cap held at index ' + i);
  }
  const k = 4, base = P.Levels.difficulty(5), nd = P.Modes.nightmareDiff(5, base);
  ok(Math.abs(nd.hp - base.hp * (N.hp.base + N.hp.lin * k)) < 1e-9, 'nightmare hp = normal x (base + lin x k) at L5');
  let s = P.createSim(7, { levelIndex: 5, loadout: { gear: {}, stats: {}, mode: 'normal' } });
  ok(s.runMode === 'normal' && s.diff.hp === base.hp && s.diff.spawn === base.spawn, 'a normal run keeps the normal difficulty');
  s = P.createSim(7, { levelIndex: 5, loadout: { gear: {}, stats: {} } });
  ok(s.runMode === 'normal' && s.diff.hp === base.hp, 'no mode in the loadout means normal');
  s = P.createSim(7, { levelIndex: 5, loadout: { gear: {}, stats: {}, mode: 'nightmare' } });
  ok(s.runMode === 'nightmare' && Math.abs(s.diff.hp - nd.hp) < 1e-9 && s.diff.heal === N.heal, 'a Nightmare run carries the nightmare diff and heal');
  ok(s.minHpFrac === 1 && s.sig && s.sig.lever === P.CFG.levels.nightmare.sig[J.level(5).hood.id].lever, 'a Nightmare run carries its signature and a min HP tracker');
  const l1 = P.createSim(3, { levelIndex: 1, loadout: { gear: {}, stats: {}, mode: 'nightmare' } });
  ok(Math.abs(l1.diff.hp - N.hp.base) < 1e-9 && l1.diff.spawn === 1 && P.Modes.l1Spawn(l1) === N.l1Spawn, 'L1 (scripted) gets the Nightmare hp and its own spawn multiplier');
  ok(P.Modes.l1Spawn(P.createSim(3, { levelIndex: 1, loadout: { gear: {}, stats: {} } })) === 1, 'L1 normal spawn multiplier is 1');
});

section('one signature per hood changes the route', () => {
  const sig = C.levels.nightmare.sig;
  J.hoods.forEach((hd, h) => {
    const idx = h * J.levelsPerHood + 2;   // stage 2 (a route stage: marks, roster and hold all apply)
    const nrm = P.createSim(9, { levelIndex: idx, loadout: { gear: {}, stats: {} } });
    const nm = P.createSim(9, { levelIndex: idx, loadout: { gear: {}, stats: {}, mode: 'nightmare' } });
    const S = sig[hd.id];
    if (S.lever === 'elite') ok(nm.gen.marks.filter(m => m.kind === 'elite').length === nrm.gen.marks.filter(m => m.kind === 'elite').length + 1, hd.id + ': elite mark added');
    if (S.lever === 'roster') ok(nm.gen.roster.indexOf(S.v) >= 0 && nrm.gen.roster.indexOf(S.v) < 0 || (nm.gen.roster.length > nrm.gen.roster.length), hd.id + ': roster type ' + S.v + ' added');
    if (S.lever === 'hold') ok(Math.abs(nm.geo.holdT - nrm.geo.holdT * S.v) < 1e-9, hd.id + ': gate hold x' + S.v);
  });
  const bossIdx = 5;   // stage 5 of hood 1: the boss arena keeps its route
  const bn = P.createSim(9, { levelIndex: bossIdx, loadout: { gear: {}, stats: {} } }), bm = P.createSim(9, { levelIndex: bossIdx, loadout: { gear: {}, stats: {}, mode: 'nightmare' } });
  ok(bn.geo.boss && bm.geo.boss && bn.gen.marks.length === bm.gen.marks.length && bm.gen.roster.length === bn.gen.roster.length, 'boss arena marks and roster unchanged by the signature');
});

section('unlock rule', () => {
  freshSave();
  ok(!M.Modes.unlocked(0) && !M.Modes.unlockedLevel(3), 'a new save has no Nightmare');
  const s = M.state();
  for (let k = 1; k <= 5; k++) s.stars[k] = 1;
  M.save();
  ok(M.Modes.unlocked(0) && !M.Modes.unlocked(1), 'clearing every level of hood 0 on Normal unlocks hood 0 only');
  ok(M.Modes.nextMode('nightmare', 2, 3) === 'nightmare' && M.Modes.nextMode('nightmare', 5, 6) === 'normal' && M.Modes.nextMode('normal', 2, 3) === 'normal',
    'Nightmare carries on inside the same hood only');
  ok(M.Modes.nextMode('nightmare', 5, 101) === 'normal', 'no next level past the route is Nightmare');
  freshSave();
});

section('Nightmare rewards, moon and title', () => {
  freshSave();
  const s = M.state();
  for (let k = 1; k <= 5; k++) s.stars[k] = 1;
  M.save();
  const tally = P.Tally.create();
  // First Nightmare clear of level 2: Street Cred x2 (the extra equals the normal gain), flagged first.
  const pre = M.state().heroes.arda.stats;
  const expectSc = P.Stats.applyLevel(pre, tally, true).gains.sc;
  const p1 = M.onResults({ levelIndex: 2, won: true, stars: 4, coins: 100, kills: 10, tally: tally, mode: 'nightmare' });
  ok(p1.nightmare.first === true && p1.statGains.gains.sc === expectSc * C.nightmare.cred, 'first Nightmare clear pays Street Cred x2');
  ok(M.Modes.stars(2) === 4 && M.state().stars[2] === 1, 'Nightmare stars are kept apart from the Normal stars');
  const p2 = M.onResults({ levelIndex: 2, won: true, stars: 3, coins: 100, kills: 10, tally: tally, mode: 'nightmare' });
  ok(p2.nightmare.first === false && M.Modes.stars(2) === 4, 'a repeat Nightmare clear is not first and keeps the best stars');
  // Coins x1.5 on a Nightmare loss, against the same Normal loss.
  const lossN = M.onResults({ levelIndex: 3, won: false, stars: 0, coins: 80, kills: 2, tally: tally, mode: 'nightmare' });
  const lossR = M.onResults({ levelIndex: 3, won: false, stars: 0, coins: 80, kills: 2, tally: tally, mode: 'normal' });
  ok(Math.abs(lossN.reward.total - lossR.reward.total * C.nightmare.coins) <= 1, 'Nightmare coins are x1.5 of the Normal run');
  // Moon after all five levels on Nightmare; title after three moons.
  let moonAt = -1;
  for (let k = 1; k <= 5; k++) { const p = M.onResults({ levelIndex: k, won: true, stars: 2, coins: 10, kills: 1, tally: tally, mode: 'nightmare' }); if (p.nightmare.moon) moonAt = k; }
  ok(moonAt === 5 && M.Modes.moon(0) && M.Modes.moonCount() === 1, 'the hood moon is earned on its fifth Nightmare clear');
  ok(!M.Modes.title(), 'no title with one moon');
  for (let k = 6; k <= 15; k++) M.onResults({ levelIndex: k, won: true, stars: 1, coins: 0, kills: 0, tally: tally, mode: 'nightmare' });
  ok(M.Modes.moonCount() >= 3 && M.Modes.title(), 'the optional title is earned at the third moon');
  freshSave();
});

section('fourth star', () => {
  const sim = { runMode: 'nightmare', minHpFrac: 0.5 };
  ok(P.Modes.fourthStar(sim, true, false), 'Nightmare clear, no revive, lowest HP 50%: fourth star');
  ok(!P.Modes.fourthStar(Object.assign({}, sim, { minHpFrac: 0.3 }), true, false), 'lowest HP under 40%: no fourth star');
  ok(!P.Modes.fourthStar(sim, true, true), 'a revive costs the fourth star');
  ok(!P.Modes.fourthStar(sim, false, false), 'a loss has no fourth star');
  ok(!P.Modes.fourthStar(Object.assign({}, sim, { runMode: 'normal' }), true, false), 'Normal runs have no fourth star');
});

section('Night Shift: seed and plan', () => {
  const day = '2026-11-13';
  const a = M.NightShift.plan(day, 100), b = M.NightShift.plan(day, 100);
  ok(JSON.stringify(a) === JSON.stringify(b), 'the same day gives the same plan');
  ok(a.seed === M.NightShift.seedOf(day) && a.seed !== M.Daily.seedOf(day), 'the Night Shift seed is the day seed with its own salt');
  ok(a.level >= 2 && a.level <= 100 && J.level(a.level).stage < J.levelsPerHood, 'the level is a stage 1-4 route (not L1, not a boss arena)');
  ok(a.mods.length === C.nightshift.dayMods && a.mods.every(m => m.id !== 'iron'), 'two rules, never iron (it blocks the revive)');
  const levels = new Set(), names = new Set();
  for (let d = 1; d <= 30; d++) { const p = M.NightShift.plan('2026-11-' + String(d).padStart(2, '0'), 100); levels.add(p.level); names.add(p.name.a + ':' + p.name.n); }
  ok(levels.size >= 15, 'the route rotates: 30 days give at least 15 different levels (got ' + levels.size + ')');
  ok(names.size >= 15, 'seed names vary across the month');
  ok(M.NightShift.plan(day, 1).level === 0 && M.NightShift.candidates(1).length === 0, 'Night Shift is closed until level 2 is open');
  ok(M.NightShift.candidates(100).every(i => J.level(i).stage < J.levelsPerHood && i >= 2), 'candidates exclude L1 and boss arenas');
});

section('Night Shift: one paid run per day, streak, best', () => {
  const s = M.Save.defaults();
  const r = score => ({ score: score });
  const d1 = at(2026, 11, 13, 9), d1b = at(2026, 11, 13, 18), d2 = at(2026, 11, 14, 9), d4 = at(2026, 11, 16, 9);
  const a = M.NightShift.settle(s, r(3000), d1);
  ok(a.first && a.pay && a.pay.cred === undefined && a.pay.coins >= C.nightshift.coins, 'the first run of the day pays coins and no Street Cred');
  ok(a.streak === 1 && s.modes.ns.paid === '2026-11-13', 'the first run starts the streak and marks the day paid');
  const b = M.NightShift.settle(s, r(1500), d1b);
  ok(!b.first && b.pay === null && b.dayBest === 3000 && b.best === 3000, 'a second run the same day pays nothing and keeps the day and local best');
  const c = M.NightShift.settle(s, r(4200), d2);
  ok(c.first && c.streak === 2 && c.dayBest === 4200 && c.best === 4200 && c.newBest, 'the next day continues the streak and resets today best');
  const e = M.NightShift.settle(s, r(900), d4);
  ok(e.streak === 1, 'a missed day resets the streak to 1');
  ok(M.Daily.liveStreak(s.modes.ns.streak, '2026-11-16') === 1, 'the entry card shows the live streak');
});

section('Night Shift: results do not touch the Normal progress', () => {
  freshSave();
  const before = JSON.stringify(M.state().stars), unl = M.state().unlocked;
  const p = atTime(at(2026, 11, 13, 10), () => M.onResults({ levelIndex: 12, won: true, stars: 3, coins: 50, kills: 30, tally: P.Tally.create(), mode: 'nightshift', score: 2500, time: 300 }));
  ok(p.nightshift && p.nightshift.first && p.nightshift.score === 2500, 'the Night Shift pending result carries score and first-run pay');
  ok(JSON.stringify(M.state().stars) === before && M.state().unlocked === unl, 'a Night Shift run sets no stars and unlocks nothing');
  ok(p.reward.total >= 50 + C.nightshift.coins, 'the run coins and the first-run coins are both paid');
  const p2 = atTime(at(2026, 11, 13, 11), () => M.onResults({ levelIndex: 12, won: false, stars: 0, coins: 20, kills: 4, tally: P.Tally.create(), mode: 'nightshift', score: 800, time: 90 }));
  ok(p2.nightshift && !p2.nightshift.first && p2.reward.total === 20, 'a later run the same day pays only its own coins (full on a death)');
  freshSave();
});

section('Night Shift: endless run to the cap', () => {
  const sim = P.createSim(11, { levelIndex: 12, loadout: { gear: {}, stats: {}, mode: 'nightshift', modifiers: [] } });
  ok(sim.geo.endless === true && sim.runMode === 'nightshift', 'a Night Shift sim is endless');
  ok(P.Modes.spawnMul(sim) === 1, 'the spawn ramp starts at 1');
  P.startPlay(sim);
  const step = (input) => {
    sim.hero.invuln = 2;   // harness only: the scripted hero does not fight, so it is kept alive to test the route and the cap
    P.stepSim(sim, 1 / 60, input);
    P.drainEvents(sim);
    while (sim.pendingChests > 0) P.Progression.openChest(sim, P.Progression.chestReward(sim));
    if (sim.pendingLevels > 0) P.Progression.choose(sim, P.Progression.makeOffer(sim).cards[0]);
  };
  let gateSeen = false;
  while (sim.runT < 300 && !sim.dir.hold.active && sim.mode === 'play') step({ x: 0, y: 1 });
  ok(sim.dir.hold.active, 'the route reaches the hold (no boss arena in a Night Shift route)');
  const holdT0 = sim.runT;
  let maxEnemies = sim.enemies.length;
  while (sim.runT < holdT0 + 30 && sim.mode === 'play') {
    step({ x: 0, y: 0 });
    if (sim.props.shutterOpen) gateSeen = true;
    if (sim.enemies.length > maxEnemies) maxEnemies = sim.enemies.length;
  }
  ok(!gateSeen && sim.mode === 'play' && sim.dir.hold.active, 'the hold never ends: the gate stays shut for the whole shift');
  ok(sim.gen.won !== true, 'a Night Shift is not won at the gate');
  ok(P.Modes.spawnMul(sim) > 1, 'the spawn ramp rises with run time');
  ok(P.Modes.nightScore(sim) >= Math.floor(sim.runT) * C.nightshift.score.survive, 'the score counts survival seconds');
  ok(maxEnemies > 0, 'enemies spawn while the gate is held shut (the hold keeps the horde coming)');
  while (sim.runT < C.nightshift.capS + 0.1 && sim.mode === 'play') step({ x: 0, y: 0 });
  ok(sim.mode === 'won' && sim.nsEnd === 'clock', 'the run ends at the 12-minute cap as a win');
});

section('save: additive modes block, damaged values', () => {
  const d = M.Save.defaults();
  ok(d.v === 3 && d.modes && Object.keys(d.modes.nm).length === 0 && d.modes.title === 0 && d.modes.ns.day === '', 'defaults carry an empty modes block (schema v3)');
  ok(M.Save.VERSION === 3 && M.Save.KEY === 'nsi.meta.v3', 'the version and key are unchanged');
  const old = M.Save.normalize({ v: 3, unlocked: 4, stars: { 1: 2 }, coins: 90 });
  ok(old.modes && old.stars[1] === 2 && old.unlocked === 4, 'a v3 save without the block migrates with no loss');
  const bad = M.Save.normalize({ modes: { nm: { '1': { stars: 99 }, x: { stars: 2 }, '0': { stars: 3 }, '5000': { stars: 2 }, '2': 'junk' },
    moon: { '-1': 1, '99': 1, '2': 'yes', '3': true }, title: 'yes',
    ns: { best: -5, dayBest: 'NaN', runs: -2, streak: { n: -3, last: 7 } } } });
  ok(bad.modes.nm[1].stars === C.nightmare.starsMax, 'stars are clamped to the four-star maximum');
  ok(bad.modes.nm.x === undefined && bad.modes.nm[0] === undefined && bad.modes.nm[5000] === undefined && bad.modes.nm[2] === undefined, 'bad level keys and values are dropped');
  ok(Object.keys(bad.modes.moon).length === 0, 'a stored moon flag without its five Nightmare clears grants nothing');
  ok(bad.modes.title === 0, 'a title flag without three moons grants nothing');
  ok(bad.modes.ns.best === 0 && bad.modes.ns.dayBest === 0 && bad.modes.ns.runs === 0 && bad.modes.ns.streak.n === 0, 'negative and NaN Night Shift values clamp to zero');
  const junk = M.Save.normalize({ modes: 'garbage' }), nul = M.Save.normalize({ modes: null }), arr = M.Save.normalize({ modes: [1, 2] });
  ok(junk.modes.title === 0 && nul.modes.title === 0 && arr.modes.title === 0, 'a non-object modes block is replaced by the default');
  const fullNm = {}; for (let k = 1; k <= 5; k++) fullNm[k] = { stars: 2 };
  const full = M.Save.normalize({ modes: { nm: fullNm, moon: {}, title: 1 } });
  ok(full.modes.moon[0] === 1 && full.modes.title === 0, 'five Nightmare clears derive the moon; the title still needs three');
  const store = { getItem: k => (k === 'nsi.meta.v3' ? JSON.stringify({ v: 3, modes: { nm: { '1': { stars: 'x' } }, title: 1 } }) : null), setItem() {}, removeItem() {} };
  const read = M.Save.read(store);
  ok(read.modes && read.modes.nm[1] === undefined && read.modes.title === 0, 'a damaged v3 save reads without throwing and grants nothing');
});

section('golden: normal runs are unchanged', () => {
  // Pinned on the pre-change tree (snapshot before part 18): L1, L5, L12, L30, L50 run 40 to 60 s with fixed input.
  const want = { 'L1-s7': '18c940bb021e6a4a', 'L5-s7': 'f25b4700017d61bb', 'L5-s3': 'ea13259351c379e1', 'L12-s9': 'b24c061a71dccb40',
    'L30-s4': '0a7419f646563b7b', 'L50-s2': '6336cec22c9ede5e' };
  const got = {};
  [[1, 7, 40, false], [5, 7, 60, true], [5, 3, 60, true], [12, 9, 60, true], [30, 4, 50, true], [50, 2, 50, true]].forEach(([i, sd, secs, ex]) => {
    const lo = ex ? P.Power.expectedLoadout(i) : { gear: {}, stats: {} };
    const s = P.createSim(sd, { levelIndex: i, loadout: lo });
    P.startPlay(s);
    let n = 0;
    while (s.runT < secs && s.mode === 'play') {
      P.stepSim(s, 1 / 60, { x: Math.sin(n / 37) * 0.6, y: -1 });
      P.drainEvents(s);
      if (s.pendingLevels > 0) P.Progression.choose(s, P.Progression.makeOffer(s).cards[0]);
      while (s.pendingChests > 0) P.Progression.openChest(s, P.Progression.chestReward(s));
      n++;
    }
    const snap = { t: s.runT, hp: s.hero.hp, x: s.hero.x, y: s.hero.y, kills: s.kills, mode: s.mode, xp: s.xp, level: s.level,
      enemies: s.enemies.map(e => [e.type, +e.x.toFixed(6), +e.y.toFixed(6), +e.hp.toFixed(6)]), drops: s.drops.length,
      hold: s.dir.hold.t, gateOpen: s.props.shutterOpen, marks: s.gen ? s.gen.marks.length : 0, roster: s.gen ? s.gen.roster : null,
      diff: s.diff || null, tally: s.tally.kills };
    got['L' + i + '-s' + sd] = crypto.createHash('sha256').update(JSON.stringify(snap)).digest('hex').slice(0, 16);
  });
  Object.keys(want).forEach(k => ok(got[k] === want[k], 'normal trace ' + k + ' matches the pre-part-18 build (' + got[k] + ')'));
});

section('the sim reads no settings or clock', () => {
  const files = ['js/sim/modes.js', 'js/config-modes.js'];
  files.forEach(f => {
    const src = read(f);
    ok(!/P\.Settings|reduceMotion|quality|localStorage|Date\.now|Math\.random|new Date/.test(src), f + ' reads no settings, storage or clock');
  });
  ok(/P\.Modes\.apply\(s\)/.test(read('js/sim/sim.js')) && /P\.Modes\.step\(s\)/.test(read('js/sim/sim.js')), 'sim.js calls the mode hooks');
});

section('wiring: telemetry, ids, strings, css', () => {
  const main = read('js/main.js');
  ok(/level_start[\s\S]{0,260}mode: sim\.runMode/.test(main), 'level_start carries the mode');
  ok(/level_end', \{[^}]*mode: mode/.test(main), 'level_end carries the mode');
  const html = read('index.html');
  ok(/id="hud-moon"/.test(html) && /id="mode-vignette"/.test(html), 'index.html has the HUD moon and the vignette');
  ok(/css\/modes\.css/.test(html) && /js\/strings-modes\.js/.test(html) && /js\/sim\/modes\.js/.test(html), 'index.html loads modes.css, strings-modes.js and sim/modes.js');
  const tr = {}, en = {};
  Object.assign(tr, P.STR.tr); Object.assign(en, P.STR.en);
  const used = new Set();
  ['js/meta/meta-modes.js', 'js/meta/meta-nightshift.js', 'js/view/modes-ui.js', 'js/meta/meta-hub.js', 'js/meta/meta-ui.js', 'js/view/hood-card.js', 'js/view/screens.js', 'js/meta/meta-map.js'].forEach(f => {
    const src = read(f);
    (src.match(/'(mode\.|ns\.|res\.nm\.|res\.ns\.|res\.star4|toast\.moon|toast\.title|ui\.ns\.)[a-zA-Z0-9.]*'/g) || []).forEach(k => { if (!/\.[an]$/.test(k.slice(1, -1))) used.add(k.slice(1, -1)); });
  });
  for (let a = 0; a < 8; a++) { used.add('ns.name.a' + a); used.add('ns.name.n' + a); }
  used.forEach(k => ok(tr[k] !== undefined && en[k] !== undefined, 'string ' + k + ' exists in TR and EN'));
  ok(read('js/strings-modes.js').split('\n').filter(l => /^  '/.test(l) && /TR owner check/.test(l)).length >= 20, 'the Turkish mode names and seed words carry the owner-check tag');
  ok(!/%\{/.test(read('js/strings-modes.js')), 'placeholders use the P.t syntax {name}, not %{name} (the % would render literally)');
  ok(P.STR.en['res.star4'].split('{n}').join('40') === 'Nightmare: no revive and lowest HP at 40% or more', 'the fourth-star criterion renders as 40% in EN');
  const cssNoComments = read('css/modes.css').replace(/\/\*[\s\S]*?\*\//g, '');
  ok(/\.meta-moon-mk/.test(cssNoComments) && !/animation/.test(cssNoComments), 'modes.css: moon mark styled, no animation (reduce-motion safe)');
  const hc = read('js/view/hood-card.js');
  ok(/hc-mode/.test(hc) && /curMode === 'nightmare'/.test(hc), 'the hood card shows the Nightmare line');
});

console.log('replay tier tests: ' + passes + ' checks passed, ' + fails + ' failed');
if (fails) process.exit(1);
