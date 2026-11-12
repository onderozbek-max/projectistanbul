// Kaan bond tests (R1-T5 step 4, D-059 section 6): the meter maths (config-bond.js), the meta save integration (join on the L20 clear,
// gains per level, the 25 aura, the 50 ultimate unlock), the Tackle & Stab ultimate in the sim, and the Bond page strings.
// Headless, no DOM. Usage: node prototype/tools/test-bond.js
'use strict';
const { loadP } = require('./lib-load.js');
const P = loadP(), B = P.Bond, K = P.CFG.bond.kaan, M = P.Meta;
const DT = 1 / 60;
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.log('FAIL ' + m); } };
const section = (name, fn) => { try { fn(); } catch (e) { fails++; console.log('FAIL ' + name + ' threw: ' + (e && e.stack || e)); } };

section('meter maths', () => {
  const g = (before, r) => B.gain(before, r);
  ok(g(0, { levelIndex: 19, won: true, stars: 3, prevStars: 0 }).gain === 0, 'before the join level nothing is earned');
  ok(g(0, { levelIndex: 20, won: false, stars: 0, prevStars: 0 }).gain === 0, 'a loss earns nothing');
  ok(g(0, { levelIndex: 20, won: true, stars: 1, prevStars: 0 }).gain === K.join, 'the first L20 clear gives the join bonus');
  ok(g(5, { levelIndex: 20, won: true, stars: 3, prevStars: 2 }).gain === K.replay, 'a repeat L20 clear gives the replay amount');
  ok(g(5, { levelIndex: 21, won: true, stars: 2, prevStars: 0 }).gain === K.win, 'a first clear after the join gives the base amount');
  ok(g(5, { levelIndex: 21, won: true, stars: 3, prevStars: 0 }).gain === K.win + K.star3, 'a 3-star first clear adds the star bonus');
  ok(g(5, { levelIndex: 25, won: true, stars: 2, prevStars: 0 }).gain === K.win + K.boss, 'a boss level first clear adds the boss bonus');
  ok(g(5, { levelIndex: 25, won: true, stars: 3, prevStars: 0 }).gain === K.win + K.star3 + K.boss, 'bonuses stack');
  ok(g(5, { levelIndex: 22, won: true, stars: 3, prevStars: 1 }).gain === K.replay, 'replaying an earlier level gives the replay amount, stars or not');
  const cap = g(99, { levelIndex: 26, won: true, stars: 3, prevStars: 0 });
  ok(cap.gain === 1, 'the meter stops at the maximum (gain is what fits)');
  ok(g(23, { levelIndex: 26, won: true, stars: 2, prevStars: 0 }).crossed.join() === '25', 'crossing 25 is reported once');
  ok(g(48, { levelIndex: 26, won: true, stars: 3, prevStars: 0 }).crossed.join() === '50', 'crossing 50 is reported');
  ok(g(25, { levelIndex: 26, won: true, stars: 2, prevStars: 0 }).crossed.length === 0, 'a meter already past a threshold reports nothing');
  ok([0, 24, 25, 49, 50, 74, 75, 99, 100].map(B.tier).join() === '0,0,1,1,2,2,3,3,4', 'tier counts the thresholds reached');
  ok(!B.joined({}) && !B.joined({ 20: 0 }) && B.joined({ 20: 1 }), 'Kaan joined only after a clear of the join level');
  // The slice path: first clears of L20 to L30 at 2 stars reach 49, at 3 stars 59, so 50 needs one star or one replay.
  let v = 0, v3 = 0, lv;
  for (lv = 20; lv <= 30; lv++) { v += B.gain(v, { levelIndex: lv, won: true, stars: 2, prevStars: 0 }).gain; v3 += B.gain(v3, { levelIndex: lv, won: true, stars: 3, prevStars: 0 }).gain; }
  ok(v === 49 && v3 === 59, 'first clears of L20 to L30 add up to 49 (2 stars) and 59 (3 stars), got ' + v + ' and ' + v3);
});

section('meta save: join, gains, aura, ultimate', () => {
  const res = (levelIndex, stars, won) => M.onResults({ levelIndex, won: won !== false, stars, coins: 10, kills: 100, tally: P.Tally.create() });
  let r = res(20, 2);
  ok(r.bond.kaan.gain === K.join && r.bond.kaan.joined && M.bondState().kaan.joined, 'the first L20 clear joins Kaan and shows in the result');
  ok(M.bondState().kaan.value === 5 && M.bondState().kaan.tier === 0, 'the meter starts at the join bonus');
  r = res(20, 2);
  ok(!r.bond.kaan.joined && r.bond.kaan.gain === K.replay, 'a repeat of L20 does not join him again');
  r = res(21, 3);
  ok(r.bond.kaan.gain === K.win + K.star3 && M.bondState().kaan.value === 5 + K.replay + K.win + K.star3, 'a level after the join adds to the saved meter');
  ok(M.loadout().bondHpPct === 0, 'under 25 there is no aura');
  const s = M.state(); s.bonds.kaan = 25; M.save();
  ok(Math.abs(M.loadout().bondHpPct - K.auraHpPct) < 1e-12 && M.loadout().bonds.kaan === 25, 'at 25 the loadout carries the aura and the bond');
  const u = () => M.ults().filter(x => x.id === 'tackle')[0];
  ok(u() && !u().unlocked && u().needBond === 50, 'Tackle & Stab is locked under bond 50 and says what it needs');
  ok(!M.setUlt('tackle'), 'a locked bond ultimate cannot be equipped');
  s.bonds.kaan = 50; M.save();
  ok(u().unlocked && M.setUlt('tackle') && M.loadout().ult === 'tackle', 'at 50 it unlocks and the loadout carries it');
  const nz = M.ults().filter(x => x.id === 'horn')[0];
  ok(nz && nz.needBond === undefined, 'the other ultimates still unlock by kills');
  res(20, 3, false);
  ok(M.bondState().kaan.value === 50, 'a lost run changes nothing');
  s.stars[20] = 0; s.bonds.kaan = 60; M.save();
  ok(M.loadout().bondHpPct === 0 && M.loadout().bonds.kaan === 0, 'before Kaan joins the loadout carries no bond, whatever the saved meter says');
});

function sandbox(loadout, lv) {
  const s = P.createSim(7, { levelIndex: lv || 22, loadout: loadout });
  s.mode = 'play';
  s.hero.x = 0; s.hero.y = 0; s.hero.hp = s.hero.maxHp = 1e9; s.hero.invuln = 0;
  if (s.geo) s.geo.blocks.length = 0;
  s.enemies.length = 0; s.props.canisters.length = 0; s.drops.length = 0;
  return s;
}
const foe = (s, x, y) => { const e = P.Combat.spawnEnemy(s, 'walker', x, y, {}); e.hp = e.maxHp = 1e4; return e; };
const run = (s, secs, fire) => {
  for (let i = 0; i < Math.round(secs / DT); i++) P.stepSim(s, DT, { x: 0, y: 0, dash: false, skill: false, ult: fire && i === 0 });
};

section('Tackle & Stab in the sim', () => {
  const C = P.CFG.ults.tackle;
  const cast = (loadout, setup) => {
    const s = sandbox(loadout), e = setup(s);
    s.hero.ult = 1;
    run(s, C.T + 0.1, true);
    return { s, e };
  };
  const full = { ult: 'tackle', bonds: { kaan: 50 } };
  let { s, e } = cast(full, s => foe(s, 0, 4));
  ok(s.hero.ult === 0, 'the ultimate spent the charge');
  ok(e.hp < e.maxHp, 'the enemy in the lane took the stab (hp ' + e.hp + ')');
  const inLane = e;
  ok(inLane.y > 4, 'the charge shoves an enemy along its path (y ' + inLane.y.toFixed(2) + ')');
  // Halfway through the charge (before the stab): an enemy in the lane is stunned, a boss is shoved but never stunned.
  const mid = setup => { const s = sandbox(full), e = setup(s); s.hero.ult = 1; run(s, C.T * 0.5, true); return e; };
  const stunOf = e => (e.st && e.st.stun) || 0;
  ok(stunOf(mid(s => foe(s, 0, 2))) > 0, 'an enemy caught in the lane is stunned');
  const bossMid = mid(s => { const b = foe(s, 0, 2); b.boss = true; return b; });
  ok(stunOf(bossMid) === 0 && bossMid.y > 2, 'a boss in the lane is shoved but never stunned');
  ok(stunOf(mid(s => foe(s, 14, 0))) === 0, 'an enemy outside the lane is not stunned');
  const side = cast(full, s => foe(s, 14, 0));
  ok(side.e.hp === side.e.maxHp || side.e.x < 14 + 1e-9, 'an enemy far from the lane and the landing point is not stabbed');
  const stab = cast(full, s => foe(s, 0, C.dist + 0.5));
  ok(stab.e.hp <= stab.e.maxHp - C.stabDmg * 0.6, 'an enemy at the landing point takes about the stab damage (hp ' + stab.e.hp + ')');
  ok(P.Skills.ultId(sandbox({ ult: 'tackle', bonds: { kaan: 49 } })) === 'nazar', 'under bond 50 the sim falls back to Nazar');
  ok(P.Skills.ultId(sandbox({ ult: 'tackle', bonds: { kaan: 50 } }, 20)) === 'nazar', 'before journey level 21 the sim falls back to Nazar');
  ok(P.Skills.ultId(sandbox(full)) === 'tackle', 'at bond 50 on level 22 the sim fires Tackle & Stab');
  const a = P.createSim(7, { levelIndex: 22, loadout: { bondHpPct: K.auraHpPct } }), b = P.createSim(7, { levelIndex: 22, loadout: {} });
  ok(Math.abs(a.hero.maxHp / b.hero.maxHp - (1 + K.auraHpPct) / 1) < 1e-9, 'the bond 25 aura adds its percent to max HP');
});

section('Bond page strings: EN and TR for every key', () => {
  const keys = ['tree.page.bondOn', 'bond.kaan', 'bond.mila', 'bond.ada', 'bond.soon', 'bond.meter', 'bond.t25.name', 'bond.t25.desc', 'bond.t50.name',
    'bond.t50.desc', 'bond.later.name', 'bond.later.desc', 'bond.hint', 'bond.joined', 'bond.gain', 'bond.reached', 'ars.ultNeedBond', 'ult.tackle',
    'ult.tackle.name', 'ult.tackle.desc', 'ult.tackle.hud'];
  keys.forEach(k => ok(P.STR.tr[k] && P.STR.en[k], 'TR and EN text for ' + k));
});

console.log(fails ? 'test-bond: ' + fails + ' failure(s), ' + passes + ' passed' : 'test-bond: all ' + passes + ' checks pass');
process.exit(fails ? 1 : 0);
