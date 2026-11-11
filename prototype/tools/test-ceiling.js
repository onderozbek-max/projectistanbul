// D-056 hard enemy ceiling (config-levels.js levels.ceiling): Combat.spawnEnemy refuses past `hard` (200), a boss always spawns,
// a boss's scripted adds may go to `boss` (220), and every caller that uses the result survives a refusal.
// Usage: node prototype/tools/test-ceiling.js
'use strict';
const { loadP } = require('./lib-load.js');
const P = loadP();
const DT = 1 / 60;
const problems = [];
const check = (cond, msg) => { if (!cond) problems.push(msg); };
const CE = P.CFG.levels.ceiling;

function fresh(level) {
  const s = P.createSim(5, { levelIndex: level, loadout: null });
  s.mode = 'play'; s.hero.invuln = 1e9;
  return s;
}
function fill(s, n) {
  while (s.enemies.length < n) {
    const e = P.Combat.spawnEnemy(s, 'walker', (s.enemies.length % 9) - 4, s.hero.y + 20 + (s.enemies.length % 40), { state: 'dormant', boss: true });
    e.boss = false;
  }
}

check(CE && CE.hard === 200 && CE.boss === 220, 'config: ceiling is { hard: 200, boss: 220 } (D-056)');

{ // plain spawns stop at the hard ceiling and are counted
  const s = fresh(22);
  fill(s, CE.hard);
  const before = s.enemies.length;
  const e = P.Combat.spawnEnemy(s, 'walker', 0, 50, {});
  check(e === null && s.enemies.length === before, 'a plain spawn at the ceiling was not refused');
  check(s.ceilingHits === 1, 'a refused spawn was not counted (ceilingHits ' + s.ceilingHits + ')');
  check(P.Combat.spawnEnemy(s, 'walker', 0, 50, { elite: true }) === null, 'an elite spawn at the ceiling was not refused');
}
{ // a boss always spawns; its adds may use the boss ceiling
  const s = fresh(22);
  fill(s, CE.hard);
  let adds = 0;
  while (adds < 1000 && P.Combat.spawnEnemy(s, 'walker', 0, 60, { bossAdd: true })) adds++;
  check(s.enemies.length === CE.boss, 'boss adds stopped at ' + s.enemies.length + ', expected ' + CE.boss);
  check(adds === CE.boss - CE.hard, 'boss adds spawned ' + adds + ', expected ' + (CE.boss - CE.hard));
  const boss = P.Combat.spawnEnemy(s, 'walker', 0, 70, { boss: true });
  check(boss && s.enemies.length === CE.boss + 1, 'the boss itself was refused at the boss ceiling');
}
{ // below the ceiling nothing changes
  const s = fresh(22);
  fill(s, CE.hard - 1);
  check(P.Combat.spawnEnemy(s, 'walker', 0, 50, {}) !== null && !s.ceilingHits, 'a spawn just below the ceiling was refused');
}
{ // every caller that uses the result survives a full field: events, summons, route, horde and the level step
  [['loot', {}], ['chest', {}], ['ambush', {}], ['pier', {}]].forEach(([kind, o]) => {
    const s = fresh(22);
    fill(s, CE.hard);
    let threw = null;
    try { P.Events.start(s, kind, o); } catch (e) { threw = e; }
    check(!threw, 'Events.start(' + kind + ') threw on a full field: ' + (threw && threw.message));
    check(s.enemies.length <= CE.hard, 'Events.start(' + kind + ') pushed past the ceiling');
  });
  [22, 37, 43, 50, 60].forEach(lv => {
    const s = fresh(lv);
    fill(s, CE.hard);
    let threw = null;
    try { for (let i = 0; i < 60 * 40; i++) { P.stepSim(s, DT, { x: 0, y: 1 }); } } catch (e) { threw = e; }
    check(!threw, 'level ' + lv + ' threw with a full field: ' + (threw && threw.message));
    check(s.enemies.length <= CE.boss + 1, 'level ' + lv + ' ended with ' + s.enemies.length + ' enemies, past the boss ceiling');
  });
}
{ // a boss level at a full field: the boss spawns and the intro adds stay under the boss ceiling
  const s = fresh(10);
  let threw = null, peak = 0;
  try { for (let i = 0; i < 60 * 60; i++) { P.stepSim(s, DT, { x: 0, y: 1 }); peak = Math.max(peak, s.enemies.length); } } catch (e) { threw = e; }
  check(!threw, 'boss level threw: ' + (threw && threw.message));
  check(peak <= CE.boss + 1, 'boss level peaked at ' + peak + ', past the boss ceiling');
}

if (problems.length) { console.log('ceiling: FAIL'); problems.forEach(p => console.log('  - ' + p)); process.exit(1); }
console.log('ceiling: ok (hard ' + CE.hard + ', boss adds ' + CE.boss + ', boss exempt, callers survive a full field)');
