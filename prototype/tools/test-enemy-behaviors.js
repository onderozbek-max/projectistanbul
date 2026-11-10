// Wave 1 enemy checks (R1): skin behaviours (fisher pull, musician buff, hamal rear armour and crate), the marti (steal, return,
// escape, no contact damage), the cayci (tea puddle slows the hero and expires), telegraph floors, behaviour caps, and
// determinism. Headless: runs the sim from index.html's scripts (lib-load.js) and drives the enemy hooks step by step, so no
// roster spawns get in the way. Usage: node prototype/tools/test-enemy-behaviors.js
'use strict';
const crypto = require('crypto');
const { loadP } = require('./lib-load.js');
const P = loadP();
const DT = 1 / 60;
const problems = [], notes = [];
const check = (cond, msg) => { if (!cond) problems.push(msg); };

// A generated level with the walls cleared (the probes place enemies in open ground) and no roster spawns.
function sandbox(seed, levelIndex) {
  const s = P.createSim(seed || 5, { levelIndex: levelIndex || 22, loadout: null });
  s.mode = 'play';
  s.hero.hp = s.hero.maxHp = 1e9;
  s.hero.x = 0; s.hero.y = s.hero.y || 5;
  if (s.geo) s.geo.blocks.length = 0;
  s.enemies.length = 0;
  return s;
}
// One frame of the enemy pipeline (updateEnemies, frame, contact, removeDead), without the level's spawners.
function frame(s, n) {
  for (let i = 0; i < (n || 1); i++) {
    P.Combat.updateEnemies(s, DT);
    P.Enemies.frame(s, DT);
    P.Combat.contact(s);
    P.Combat.updateBurnAndZones(s, DT);
    P.Combat.removeDead(s);
    s.hero.invuln = 0;
  }
}
function run(s, secs, pred) {
  const seen = [];
  for (let i = 0; i < secs * 60; i++) {
    frame(s, 1);
    s.events.forEach(ev => seen.push(ev));
    s.events.length = 0;
    if (pred && pred(s)) break;
  }
  return seen;
}
const has = (list, type) => list.some(ev => ev.type === type);
function place(s, type, dx, dy, opts) {
  const e = P.Combat.spawnEnemy(s, type, s.hero.x + dx, s.hero.y + dy, opts || {});
  if (opts && opts.skinBeh) e.skinBeh = opts.skinBeh;
  return e;
}

// ---------- 1. fisher: cast, telegraph, pull distance, no pull in a boss intro, dash cancels ----------
{
  const s = sandbox(5, 22), h = s.hero, F = P.CFG.skins.fisher;
  const f = place(s, 'walker', 0, 4, { skin: 'fisher' });
  P.Skins.fisherInit(s, f); f.skinBeh = 'fisher';
  f.hook.cd = 0;
  const hx0 = h.x, hy0 = h.y;
  const evs = run(s, 4, st => !!st.skinPull);                // stops in the frame the hook hits
  const cast = evs.find(ev => ev.type === 'hookCast');
  check(!!cast, 'fisher: no hookCast within 4 s at 4 m with line of sight');
  check(!!cast && cast.T >= 0.5, 'fisher: hook telegraph shorter than 0.5 s (' + (cast && cast.T) + ')');
  check(evs.some(ev => ev.type === 'hookHit'), 'fisher: the hero standing in the line was not hooked');
  run(s, 1, st => !st.skinPull);                              // let the drag finish
  const d = Math.hypot(h.x - hx0, h.y - hy0);
  check(d >= 2 && d <= 3, 'fisher: pull distance ' + d.toFixed(2) + ' m is outside 2-3 m');
  check(f.hook.m === 'idle' && f.hook.cd > 0, 'fisher: not back to idle with a cooldown after the hit');
  // Boss intro: no cast and no drag while a boss is still in its intro (the boss is not stepped, only the gate is read).
  const s2 = sandbox(5, 22), g = place(s2, 'walker', 0, 4, { skin: 'fisher' });
  P.Skins.fisherInit(s2, g); g.skinBeh = 'fisher'; g.hook.cd = 0;
  const boss = P.Combat.spawnEnemy(s2, 'walker', 40, 40, {}); boss.boss = true; boss.state = 'turning';
  check(P.Skins.blocked(s2), 'fisher: a boss in its intro does not block the hook');
  let casts = 0;
  for (let i = 0; i < 180; i++) { if (P.Skins.fisherThink(s2, g, DT)) casts++; }
  check(casts === 0 && g.hook.m === 'idle', 'fisher: cast during a boss intro');
  s2.skinPull = { t: 0, T: 0.25, dist: 2.5, ux: 1, uy: 0 };
  const hx1 = s2.hero.x;
  P.Skins.fisherFrame(s2, DT);
  check(!s2.skinPull && s2.hero.x === hx1, 'fisher: hero dragged during a boss intro');
  // A dash cancels a drag that is under way.
  const s3 = sandbox(5, 22);
  s3.skinPull = { t: 0, T: 0.25, dist: 2.5, ux: 0, uy: 1 };
  s3.sk.dash = { t: 0, T: 1 };
  P.Skins.fisherFrame(s3, DT);
  check(!s3.skinPull, 'fisher: a dash did not cancel the drag');
}

// ---------- 2. musician: buff in radius, flat, ends on its death ----------
{
  const s = sandbox(5, 22), R = P.CFG.skins.musician.radius, S = P.CFG.skins.musician.speedMul;
  const m = place(s, 'walker', 0, 6, { skin: 'musician' }); m.skinBeh = 'musician'; m.buffMul = 1;
  const near = place(s, 'walker', 3, 6, {}), far = place(s, 'walker', 0, 6 + R + 3, {});
  frame(s, 1);
  check(Math.abs(near.buffMul - S) < 1e-9, 'musician: no buff inside radius (buffMul ' + near.buffMul + ')');
  check(far.buffMul === 1, 'musician: buff outside radius');
  check(m.buffMul === 1, 'musician buffs itself');
  // Speed: a lone walker chasing the hero covers speedMul x the distance of an unbuffed one.
  const a = place(s, 'walker', -4, 6, {}), b = place(s, 'walker', 4, 6, {});
  s.enemies.length = 0; s.enemies.push(a, b, m);
  const dx0 = a.x, dy0 = a.y, ex0 = b.x, ey0 = b.y;
  a.buffMul = S; b.buffMul = 1; m.skinBeh = 'musician';
  P.Combat.updateEnemies(s, 0.5);
  const ra = Math.hypot(a.x - dx0, a.y - dy0), rb = Math.hypot(b.x - ex0, b.y - ey0);
  check(rb > 0 && Math.abs(ra / rb - S) < 0.02, 'musician: buffed walker not ~' + S + 'x faster (' + (ra / rb).toFixed(3) + ')');
  // Killing the musician ends the buff in the same step.
  s.enemies.length = 0; s.enemies.push(near, m);
  P.Combat.killEnemy(s, m, false, 'knife');
  frame(s, 1);
  check(near.buffMul === 1, 'musician: buff did not end at its death');
}

// ---------- 3. hamal: rear armour, crate on death, crate expiry ----------
{
  const s = sandbox(5, 22), hm = place(s, 'walker', 0, 6, { skin: 'hamal' });
  hm.skinBeh = 'hamal'; hm.vx = 1; hm.vy = 0;
  s.hero.x = hm.x - 2; s.hero.y = hm.y;                       // hero behind (its heading is +x)
  const rear = P.Skins.hitMul(s, hm);
  s.hero.x = hm.x + 2;                                        // hero in front
  const fwd = P.Skins.hitMul(s, hm);
  check(Math.abs(rear - P.CFG.skins.hamal.rearMul) < 1e-9, 'hamal: rear hit multiplier is ' + rear);
  check(fwd === 1, 'hamal: front hit multiplier is ' + fwd);
  // The same hit from behind and from the front: the rear one takes rearMul of the front one (any might cancels out).
  hm.hp = hm.maxHp = 100; s.hero.x = hm.x - 2; s.hero.y = hm.y;
  P.Combat.damageEnemy(s, hm, 10, 0, 0, 0, false, 'knife');
  const rearHit = 100 - hm.hp;
  hm.hp = 100; s.hero.x = hm.x + 2;
  P.Combat.damageEnemy(s, hm, 10, 0, 0, 0, false, 'knife');
  const frontHit = 100 - hm.hp;
  check(frontHit > 0 && Math.abs(rearHit / frontHit - P.CFG.skins.hamal.rearMul) < 1e-6, 'hamal: rear hit ' + rearHit + ' vs front ' + frontHit);
  // Speed is slowed at the roll.
  check(P.CFG.skins.hamal.speedMul < 1, 'hamal: speedMul is not a slow');
  // Crate on death, then removal after crateT.
  s.hero.x = 0; s.hero.y = 5;
  const blocks0 = s.geo.blocks.length;
  s.enemies.length = 0; s.enemies.push(hm);
  P.Combat.killEnemy(s, hm, false, 'knife');
  const crate = s.geo.blocks.find(b => b.kind === P.CFG.skins.hamal.crateKind);
  check(!!crate && s.geo.blocks.length === blocks0 + 1, 'hamal: no crate block after the death');
  if (crate) check(Math.hypot(crate.x - hm.x, crate.y - hm.y) <= P.CFG.skins.hamal.crateOffset + 1e-6, 'hamal: crate far from the death spot');
  frame(s, Math.ceil(P.CFG.skins.hamal.crateT * 60) + 2);
  check(!s.geo.blocks.some(b => b.kind === P.CFG.skins.hamal.crateKind && b === crate), 'hamal: crate did not expire');
}

// ---------- 4. marti: steals the nearest XP, carries it, gives it back on death; escapes with it; no contact damage ----------
{
  const s = sandbox(5, 22), h = s.hero;
  const near = { kind: 'xp', value: 5, x: h.x + 2, y: h.y, mag: false, pop: 0 };
  const far = { kind: 'xp', value: 9, x: h.x + 3.5, y: h.y + 0.5, mag: false, pop: 0 };
  s.drops.push(far, near);
  const m = place(s, 'marti', 6, 0, {});
  const evs = run(s, 4, st => m.ai.carry > 0);
  check(has(evs, 'martiSteal'), 'marti: no steal within 4 s');
  check(!s.drops.includes(near) && s.drops.includes(far), 'marti: did not take the nearest drop');
  check(m.ai.carry === 5, 'marti: carries ' + m.ai.carry + ', not the nearest drop value 5');
  // Killed while carrying: the XP comes back as a drop, with bonus gold.
  const jet0 = s.drops.filter(d => d.kind === 'jeton').length;
  P.Combat.killEnemy(s, m, false, 'knife');
  const back = s.drops.filter(d => d.kind === 'xp' && d.value === 5);
  check(back.length === 1, 'marti: the carried XP did not come back on death');
  check(s.drops.filter(d => d.kind === 'jeton').length === jet0 + 1, 'marti: no bonus gold on death with a drop');
  // Escape: a marti carrying a drop that leaves the view is gone with it, no kill credit.
  const s2 = sandbox(5, 22), h2 = s2.hero;
  s2.drops.push({ kind: 'xp', value: 4, x: h2.x + 1, y: h2.y, mag: false, pop: 0 });
  const e = place(s2, 'marti', 3, 0, {});
  const kills0 = s2.kills;
  run(s2, 4, st => e.ai.carry > 0);
  e.x = h2.x + 40;                                            // far outside the frame
  const ev2 = run(s2, 0.1);
  const gone = ev2.some(ev => ev.type === 'martiGone') || (e.dead && e.escaped);
  check(gone, 'marti: a carrier that left the view was not removed');
  check(s2.kills === kills0 && !s2.drops.some(d => d.kind === 'xp' && d.value === 4), 'marti: escape gave kill credit or the XP back');
  // No contact damage: a marti on the hero does nothing.
  const s3 = sandbox(5, 22), h3 = s3.hero;
  h3.hp = 100; h3.maxHp = 100; s3.tally.dmgTaken = 0;
  const e3 = place(s3, 'marti', 0, 0, {});
  e3.x = h3.x; e3.y = h3.y;
  P.Combat.contact(s3);
  check(h3.hp === 100 && s3.tally.dmgTaken === 0, 'marti: contact damaged the hero');
}

// ---------- 5. cayci: windup telegraph, tea puddle slows the hero for 3 s after the last touch, puddle expires ----------
{
  const s = sandbox(5, 22), h = s.hero, C = P.CFG.enemies5.cayci;
  const c = place(s, 'cayci', 4.5, 0, {});
  c.ai.cd = 0;
  const evs = run(s, 4, st => st.zones.some(z => z.kind === 'tea'));
  const wind = evs.find(ev => ev.type === 'teaWindup');
  check(!!wind && wind.T >= 0.5, 'cayci: no windup with a telegraph of 0.5 s or more');
  check(has(evs, 'teaLand'), 'cayci: the tea glob did not land');
  const z = s.zones.find(q => q.kind === 'tea');
  check(!!z && z.T === C.glob.puddleT, 'cayci: puddle lifetime is ' + (z && z.T));
  check(s.tally.dmgTaken === 0, 'cayci: the tea glob or puddle damaged the hero');
  // Standing in it: slowed.
  h.x = z.x; h.y = z.y;
  frame(s, 1);
  check(Math.abs(P.Enemies4.heroMul(s) - C.slow.m) < 1e-9, 'cayci: not slowed in the puddle (' + P.Enemies4.heroMul(s) + ')');
  // Out of it: the slow lasts C.slow.t seconds after the last touch, then ends.
  h.x = z.x + z.r + 3; h.y = z.y;
  frame(s, 1);
  check(P.Enemies4.heroMul(s) === C.slow.m, 'cayci: slow ended at once after leaving the puddle');
  run(s, C.slow.t + 0.1);
  check(P.Enemies4.heroMul(s) === 1, 'cayci: slow did not expire after ' + C.slow.t + ' s');
  // The puddle expires on its own (the cayci is removed first, so no new puddle replaces it).
  s.enemies.length = 0;
  run(s, C.glob.puddleT + 0.2);
  check(!s.zones.some(q => q.kind === 'tea'), 'cayci: the puddle did not expire');
  // The slow moves the hero: two identical sims, one slowed, the same input: the step ratio is the slow multiplier.
  const a = sandbox(9, 22), b = sandbox(9, 22);
  b.tea = { slowT: 3 };
  const x0 = a.hero.x;
  [a, b].forEach(q => { q.hero.x = 0; q.hero.y = 5; });
  P.stepSim(a, DT, { x: 1, y: 0 }); P.stepSim(b, DT, { x: 1, y: 0 });
  const da = a.hero.x - 0, db = b.hero.x - 0;
  if (da > 1e-9) check(Math.abs(db / da - C.slow.m) < 1e-6, 'cayci: the slowed hero moved ' + (db / da).toFixed(3) + 'x');
  else notes.push('cayci speed ratio not measured (hero clamped)');
  void x0;
}

// ---------- 6. telegraph floors (design-system 6 rule 3: normal enemies >= 0.5 s) ----------
{
  check(P.CFG.enemies5.marti.diveT >= 0.5, 'marti dive shadow below 0.5 s');
  check(P.CFG.enemies5.cayci.windup >= 0.5, 'cayci windup below 0.5 s');
  check(P.CFG.skins.fisher.telegraph >= 0.5, 'fisher hook telegraph below 0.5 s');
}

// ---------- 7. caps and roll: per-skin live cap, the hood minimum, the chance ----------
{
  const s = sandbox(5, 22);
  s.rng.ai.chance = () => true;
  const K = P.CFG.skins.fisher;
  for (let i = 0; i < 6; i++) place(s, 'walker', 2 + i * 0.5, 9, { skin: 'fisher' });   // spawnEnemy rolls each one
  const live = s.enemies.filter(e => e.skinBeh === 'fisher').length;
  check(live === K.maxAlive, 'caps: ' + live + ' live fishers, cap is ' + K.maxAlive);
  const early = sandbox(5, 22); early.gen.info.hoodIndex = 0;
  const e0 = place(early, 'walker', 0, 9, { skin: 'fisher' }); e0.skin = 'fisher';
  early.rng.ai.chance = () => true;
  P.Skins.init(early, e0);
  check(!e0.skinBeh, 'caps: a fisher phased in before its hood minimum');
  const never = sandbox(5, 22); never.rng.ai.chance = () => false;
  const e1 = place(never, 'walker', 0, 9, { skin: 'fisher' }); P.Skins.init(never, e1);
  check(!e1.skinBeh, 'caps: a fisher rolled without the chance');
  // Types outside the table never get a skin behaviour.
  const t = sandbox(5, 22); t.rng.ai.chance = () => true;
  const e2 = place(t, 'runner', 0, 9, { skin: 'fisher' }); P.Skins.init(t, e2);
  check(!e2.skinBeh, 'caps: a runner got the fisher behaviour');
}

// ---------- 8. determinism: the same seed and the same inputs give the same digest; no settings in the sim ----------
function digest(seed, idx) {
  const s = P.createSim(seed, { levelIndex: idx, loadout: null });
  s.mode = 'play';
  const h = crypto.createHash('sha256');
  for (let i = 0; i < 1200; i++) {
    const inp = { x: Math.sin(i / 40), y: Math.cos(i / 55) * 0.5 };
    P.stepSim(s, DT, inp);
    if (i % 60 === 0) h.update([s.hero.x.toFixed(6), s.hero.y.toFixed(6), s.enemies.length, s.drops.length, s.kills, s.enemyTele.length].join('|'));
    if (s.mode !== 'play') break;
  }
  return h.digest('hex');
}
{
  const a = digest(21, 22), b = digest(21, 22);
  check(a === b, 'determinism: the same seed gave two digests');
  const fs = require('fs'), path = require('path');
  ['sim/skins.js', 'sim/skins-fisher.js', 'sim/enemies4.js', 'sim/enemies4-marti.js', 'sim/enemies4-cayci.js'].forEach(f => {
    const raw = fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8');
    const code = raw.split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n');
    check(!/P\.Settings|quality|P\.lang\b|P\.t\(/.test(code), f + ' reads settings, quality or language');
    check(raw.split('\n').length <= 300, f + ' is over 300 lines');
  });
}

if (problems.length) { console.log('enemy behaviours: FAIL'); problems.forEach(p => console.log('  - ' + p)); process.exit(1); }
console.log('enemy behaviours: ok (fisher pull, musician buff, hamal rear and crate, marti steal and return, cayci puddle, floors, caps, determinism)');
notes.forEach(n => console.log('note: ' + n));
