// Meta and daily tests (lane T0, AUDIT-7 CR-1, CR-4, CR-5 and the daily retry): headless, seeded, no DOM.
// Covers each daily modifier's effect in the sim (horde, glass skin, elite night, no dash, coin rush, iron), the daily flow
// from launch to the sim, a retry that earns nothing, damaged daily and save values, flawless counts surviving a save and
// reload, and settings.js with damaged stored values. Each section runs on its own: a throw is a failure of that section.
// Usage: node prototype/tools/test-meta.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
// The sim files plus the meta data, daily, hub, collect and save modules. Views, story and the meta UI panels are left out.
const NOT_LOADED = /^js\/(view|story)\/|^js\/main\.js$|^js\/meta\/meta-(ui|map|gear|stats|arsenal)\.js$/;

// A node-side localStorage, installed before the meta modules load (meta-save.js reads it at call time).
const store = {};
globalThis.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; },
};
const FILES = [...fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)]
  .map(m => m[1]).filter(f => !NOT_LOADED.test(f));
FILES.forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const P = globalThis.P, M = P.Meta, D = M.Daily;

const DT = 1 / 60, fails = [];
let passes = 0;
function check(cond, msg) { if (cond) passes++; else fails.push(msg); }
function section(name, fn) { try { fn(); } catch (e) { fails.push(name + ' threw: ' + (e && e.message)); } }
const near = (a, b, eps) => Math.abs(a - b) <= (eps === undefined ? 1e-9 : eps);
const today = () => D.dayKey(new Date());
const modsOf = ids => D.resolve(ids.map(id => ({ id: id })));
const freshSave = () => { M.reset(); M.debugUnlockAll(); };
const result = (over) => Object.assign({ levelIndex: 1, won: true, stars: 1, coins: 0, kills: 0, tally: P.Tally.create(), reviveUsed: false }, over);

// Sim helpers: a run on a level with optional resolved daily modifiers, started as in main.js.
function mkSim(seed, idx, mods) {
  const lo = mods ? { modifiers: mods, daily: true, seed: seed } : { modifiers: [] };
  const s = P.createSim(seed, { levelIndex: idx, loadout: lo });
  P.startPlay(s);
  return s;
}
// Hero walks north for `steps` ticks, invulnerable, with the same level-up and chest handling as the bot.
function walk(s, steps) {
  for (let i = 0; i < steps; i++) {
    s.hero.hp = s.hero.maxHp;
    while (s.pendingChests > 0) P.Progression.openChest(s, P.Progression.chestReward(s));
    while (s.pendingLevels > 0) P.Progression.choose(s, P.Progression.makeOffer(s).cards[0]);
    P.stepSim(s, DT, { x: 0, y: 1 });
    P.drainEvents(s);
  }
  return s;
}
const spawnedTotal = s => Object.keys(s.dir.spawned).reduce((a, k) => a + s.dir.spawned[k], 0);

// ---------- every daily modifier has an effect (CR-1) ----------
section('effects', () => {
  M.Daily.MODS.forEach(m => {
    const f = P.Modifiers.dailyFold([m]);
    check(f.spawnMult !== 1 || f.enemyHpMult !== 1 || f.eliteMult !== 1 || f.coinMult !== 1 || f.noDash || f.noRevive,
      'daily modifier has no effect in the sim: ' + m.id);
  });
});

// Horde: generated levels scale the route spawn rate (s.diff.spawn); the L1 script scales its rate and its totals.
section('horde', () => {
  const base = mkSim(42, 12, null), horde = mkSim(42, 12, modsOf(['horde']));
  check(near(horde.diff.spawn / base.diff.spawn, 1.35), 'horde: generated spawn rate not x1.35');
  // L1 starts in the restaurant behind its walls: as main.js jumpTo does, open the door and stand in the street first.
  const street = (mods) => { const s = mkSim(3, 1, mods); s.props.doorOpen = true; s.hero.x = 0; s.hero.y = 5; return s; };
  const b1 = walk(street(null), 3600), h1 = walk(street(modsOf(['horde'])), 3600);
  check(spawnedTotal(h1) > spawnedTotal(b1) * 1.2, 'horde: L1 script spawns not more (' + spawnedTotal(h1) + ' vs ' + spawnedTotal(b1) + ')');
});

// Glass skin: enemy HP x0.75 (spawned at the same run time in both sims, so the level scale cancels out).
section('glass', () => {
  [12, 1].forEach(idx => {
    const base = mkSim(5, idx, null), glass = mkSim(5, idx, modsOf(['glass']));
    const eb = P.Combat.spawnEnemy(base, 'walker', 0, 30, {}), eg = P.Combat.spawnEnemy(glass, 'walker', 0, 30, {});
    check(near(eg.hp / eb.hp, 0.75), 'glass skin: enemy HP not x0.75 on level ' + idx);
  });
});

// Elite night: each generated elite mark is doubled; on L1 the scripted elite brings one more beside it.
section('elite', () => {
  const base = mkSim(8, 12, null), elite = mkSim(8, 12, modsOf(['elite']));
  const nb = base.gen.marks.filter(m => m.kind === 'elite').length, ne = elite.gen.marks.filter(m => m.kind === 'elite').length;
  check(nb > 0 && ne === 2 * nb, 'elite night: elite marks ' + nb + ' -> ' + ne + ' (want x2)');
  const count = s => { s.hero.y = P.CFG.level.elites.firstY - 10.5; P.stepSim(s, DT, { x: 0, y: 0 }); return s.enemies.filter(e => e.elite).length; };
  const l1b = count(mkSim(8, 1, null)), l1e = count(mkSim(8, 1, modsOf(['elite'])));
  check(l1b === 1 && l1e === 2, 'elite night: L1 scripted elites ' + l1b + ' -> ' + l1e + ' (want 1 -> 2)');
});

// No dash: the dash input does nothing and the HUD shows no dash ready.
section('nodash', () => {
  const dash = s => { P.stepSim(s, DT, { x: 1, y: 0, dash: true }); return P.drainEvents(s).filter(e => e.type === 'dash').length; };
  const free = mkSim(9, 12, null), blocked = mkSim(9, 12, modsOf(['nodash']));
  const readyFree = P.Skills.hud(free).dashReady, readyBlocked = P.Skills.hud(blocked).dashReady;
  check(readyFree === true && dash(free) === 1, 'dash: a normal run does not dash');
  check(readyBlocked === false && dash(blocked) === 0, 'no dash: the dash still fires or the HUD shows it ready');
  // The HUD hides the chip through this guard (view/ui.js), so it must match the sim's own block.
  check(P.Modifiers.dashBlocked(blocked) === true && P.Modifiers.dashBlocked(free) === false, 'no dash: the chip guard does not match the sim');
});

// Iron (no revive): no revive of either kind; a normal run still revives.
section('iron', () => {
  const iron = mkSim(11, 12, modsOf(['iron'])), free = mkSim(11, 12, null);
  iron.hero.hp = 1; P.revive(iron, 'ad'); P.revive(iron, 'secondWind');
  check(P.Modifiers.reviveBlocked(iron) && !iron.reviveUsed && !iron.secondWindUsed && iron.hero.hp === 1, 'iron: a revive went through');
  free.hero.hp = 1; P.revive(free, 'ad');
  check(free.reviveUsed === true && free.hero.hp === free.hero.maxHp, 'iron: a normal run lost its revive');
  // The down screen hides its revive choices through this guard (view/screens.js), and main.js skips the revive offer.
  check(P.Modifiers.reviveBlocked(iron) === true && P.Modifiers.reviveBlocked(free) === false, 'iron: the down-screen guard does not match the sim');
});

// Coin rush: the run reward x1.5 (meta), against the same win with no modifier.
section('coinrush', () => {
  freshSave();
  const plain = M.onResults(result({ levelIndex: 6, coins: 300, daily: true, modifiers: [] })).reward.total;
  freshSave();
  const rush = M.onResults(result({ levelIndex: 6, coins: 300, daily: true, modifiers: modsOf(['coinrush']) })).reward.total;
  check(Math.abs(rush - plain * 1.5) <= 1, 'coin rush: reward ' + rush + ' is not x1.5 of ' + plain);
});

// Daily flow: launch -> loadout -> sim carries the picked modifiers; one attempt per day.
section('flow', () => {
  freshSave();
  const L = M.dailyLaunch();
  check(!!L && L.opts.daily === true && L.opts.modifiers.length === 2, 'daily: launch did not return two modifiers');
  check(M.dailyLaunch() === null, 'daily: a second launch on the same day was allowed');
  if (L) {
    const lo = M.loadout(L.opts), s = P.createSim(L.opts.seed, { levelIndex: L.level, loadout: lo });
    check(s.dailyMods && s.dailyMods.ids.join() === L.opts.modifiers.map(m => m.id).join(), 'daily: the sim did not get the picked modifiers');
  }
});

// Retry: the results screen replays the same daily. Only the first finished run counts (streak, chest, dailies).
section('retry', () => {
  freshSave();
  const L = M.dailyLaunch(), mods = L.opts.modifiers;
  const lost = M.onResults(result({ levelIndex: L.level, won: false, daily: true, modifiers: mods, stars: 0 }));
  const retryWin = M.onResults(result({ levelIndex: L.level, won: true, daily: true, modifiers: mods }));
  const st = M.state();
  check(lost.daily && lost.daily.won === false, 'retry: the first (lost) run did not count');
  check(retryWin.daily === null && D.status(st.daily, today()) === 'used', 'retry: a retry of a lost daily earned a win');
  check(st.streak.n === 0 && st.counters.dailies === 0, 'retry: a retry changed the streak or the dailies counter');
});
section('retry-win', () => {
  freshSave();
  const L = M.dailyLaunch(), mods = L.opts.modifiers;
  const first = M.onResults(result({ levelIndex: L.level, daily: true, modifiers: mods }));
  const again = M.onResults(result({ levelIndex: L.level, daily: true, modifiers: mods }));
  const st = M.state();
  check(first.daily && first.daily.streak === 1 && again.daily === null, 'retry: the first win did not count once');
  check(st.streak.n === 1 && st.counters.dailies === 1 && D.status(st.daily, today()) === 'done', 'retry: a won retry added streak or dailies');
});

// Damaged daily and save values never add an effect or throw.
section('damaged', () => {
  const r = D.resolve([{ id: 'iron', noRevive: false }, { id: 'bogus', spawnMult: 50 }, null, 7]);
  check(r.length === 1 && r[0].id === 'iron' && r[0].noRevive === true, 'damaged daily: resolve kept a foreign entry');
  check(M.Save.normalize({ daily: { mods: [{ id: 'bogus' }] } }).daily.mods.length === 0, 'damaged save: unknown daily mod kept');
  const f = P.Modifiers.dailyFold([{ id: 'x', spawnMult: 'abc' }, { id: 'y', spawnMult: 1e9 }, { id: 'z', enemyHpMult: -3 }]);
  check(f.spawnMult === P.CFG.modifiers.daily.clampMax && f.enemyHpMult === P.CFG.modifiers.daily.clampMin, 'damaged mods: multipliers not clamped');
  check(f.ids.join() === 'x,y,z', 'damaged mods: ids dropped');
  check(P.Modifiers.dailyFold(null).ids.length === 0, 'damaged mods: null list not neutral');
});

// Determinism: the same daily (seed and modifiers) gives the same run.
section('determinism', () => {
  const mods = modsOf(['horde', 'glass', 'elite']);
  const a = walk(mkSim(21, 12, mods), 900), b = walk(mkSim(21, 12, mods), 900);
  check(a.hero.x === b.hero.x && a.hero.y === b.hero.y && a.enemies.length === b.enemies.length && spawnedTotal(a) === spawnedTotal(b),
    'determinism: the same daily gave two different runs');
});

// Flawless (CR-5): per-hood counts and the achievement survive a save and a reload.
section('flawless', () => {
  freshSave();
  const hood = M.level(11).hood.id;
  check(hood === 'karakoy', 'flawless: level 11 is not in karakoy (' + hood + ')');
  for (let k = 0; k < 5; k++) M.onResults(result({ levelIndex: 11, reviveUsed: false }));
  const back = M.Save.read();   // what the next load reads from storage
  check(back.counters.flawless.karakoy === 5, 'flawless: per-hood count lost on reload (' + JSON.stringify(back.counters.flawless) + ')');
  check(back.achievements.a_karakoy === 1, 'flawless: a_karakoy not kept on reload');
  check(back.counters.flawlessTotal === 5, 'flawless: flawlessTotal not kept on reload');
  M.onResults(result({ levelIndex: 11, reviveUsed: true }));
  check(M.state().counters.flawless.karakoy === 5, 'flawless: a revived clear counted as flawless');
  check(M.Save.normalize({ flawless: { karakoy: 2 } }).counters.flawless.karakoy === 2, 'flawless: older top-level flawless not read');
});

// Hood clears (AUDIT-7 CR-8): a hood adds one to counters.hoodsCleared the first time all its levels have stars; a replay
// or a lost run adds nothing, and twenty clears earn the walk achievement. The debug unlock keeps the counter in step.
section('hoodclear', () => {
  M.reset();
  const clearHood = h => { for (let k = 1; k <= P.Journey.levelsPerHood; k++) M.onResults(result({ levelIndex: M.levelAt(h, k) })); };
  const cleared = () => M.state().counters.hoodsCleared;
  for (let k = 1; k <= 4; k++) M.onResults(result({ levelIndex: k }));
  check(cleared() === 0, 'hood clear: a partly cleared hood counted (' + cleared() + ')');
  M.onResults(result({ levelIndex: 5 }));
  check(cleared() === 1, 'hood clear: the first hood not counted once (' + cleared() + ')');
  M.onResults(result({ levelIndex: 5 }));
  M.onResults(result({ levelIndex: 3, won: false, stars: 0 }));
  check(cleared() === 1, 'hood clear: a replay or a lost run counted again (' + cleared() + ')');
  for (let h = 1; h < P.Journey.hoods.length; h++) clearHood(h);
  check(cleared() === P.Journey.hoods.length, 'hood clear: ' + cleared() + ' counted for ' + P.Journey.hoods.length + ' hoods');
  check(M.Save.read().counters.hoodsCleared === P.Journey.hoods.length, 'hood clear: the count was lost on reload');
  check(M.state().achievements.a_walk17 === 1, 'hood clear: the walk achievement not earned after every hood');
  M.reset(); M.debugUnlockAll();
  check(cleared() === P.Journey.hoods.length, 'hood clear: the debug unlock left the walk counter at ' + cleared());
});

// Dad's letters: letter 1 closes Chapter 1 (L100); letters 2 and 3 are Chapter 2 and 3 gates (L190, L300) by canon.
// Letters on the current walk are earned by winning that level only.
section('letters', () => {
  const N = P.Journey.count();
  check(M.Collect.LETTERS.some(l => l.level === N), 'letters: no letter closes the walk');
  M.reset();
  M.Collect.LETTERS.filter(l => l.level <= N).forEach(l => {
    M.onResults(result({ levelIndex: l.level, won: false, stars: 0 }));
    check(!M.state().collection[l.id], 'letters: ' + l.id + ' earned on a lost run');
    M.onResults(result({ levelIndex: l.level }));
    check(M.state().collection[l.id] === 1, 'letters: ' + l.id + ' not earned on its level');
  });
});

// Settings (CR-4): damaged stored values load with defaults; reduced motion from the OS still applies.
section('settings', () => {
  const src = fs.readFileSync(path.join(ROOT, 'js/view/settings.js'), 'utf8');
  const BOOLS = ['sound', 'subs', 'reduceMotion', 'dmgNumbers', 'blood', 'firstRunDone', 'l1Cleared', 'coldOpenSeen', 'haptics', 'reduceFlash', 'devTools'];
  const load = (stored, reduce) => {
    const ctx = { P: {}, Math, JSON, Object, Array, localStorage: { getItem: () => stored, setItem: () => {} }, matchMedia: () => ({ matches: reduce }) };
    ctx.window = ctx; vm.createContext(ctx);
    vm.runInContext(src, ctx);
    return ctx.P;
  };
  const cases = ['null', '5', '"x"', '[]', '{}', '{"lang":"de","installId":7,"musicVol":"abc","sound":"yes","joySide":3}',
    '{"reduceMotion":"maybe","blood":0,"shake":"50"}'];
  cases.forEach(stored => [false, true].forEach(reduce => {
    let S = null, err = null;
    try { S = load(stored, reduce).Settings; } catch (e) { err = e.message; }
    const tag = stored + ' reduce=' + reduce;
    check(!err && S, 'settings: startup threw on ' + tag + ' (' + err + ')');
    if (!S) return;
    check(S.lang === 'tr' || S.lang === 'en', 'settings: bad lang kept on ' + tag);
    check(BOOLS.every(k => typeof S[k] === 'boolean'), 'settings: a flag is not a boolean on ' + tag);
    check(typeof S.installId === 'string' && S.installId.length > 0, 'settings: installId missing on ' + tag);
    check([0, 25, 50, 75, 100].indexOf(S.musicVol) >= 0 && [0, 50, 100].indexOf(S.shake) >= 0, 'settings: bad steps kept on ' + tag);
  }));
  check(load('null', true).Settings.reduceMotion === true, 'settings: OS reduced motion ignored after a null save');
  check(load('{"reduceMotion":"maybe"}', true).Settings.reduceMotion === false, 'settings: a stored non-boolean reduceMotion was overridden by the OS');
  check(typeof load('null', false).applySettings === 'function', 'settings: applySettings not defined after a null save');
});

console.log('meta tests: ' + passes + ' checks passed, ' + fails.length + ' failed');
fails.forEach(f => console.log('  FAIL ' + f));
process.exitCode = fails.length ? 1 : 0;
