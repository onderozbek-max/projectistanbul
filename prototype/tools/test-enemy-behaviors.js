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
  check(C.slow.m === 0.75, 'cayci: slow multiplier is ' + C.slow.m + ', expected 0.75 (audit 13, answer 2)');
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

// ---------- 9. thief look by geography, thief placement by hood (audit 13 answer 1; docs/journey.md §5.0) ----------
// The view files are not in lib-load (it runs the sim scripts only), so load the fauna view here, as a browser would.
function loadView(file) { vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'view', file), 'utf8'), { filename: file }); }
const fs = require('fs'), path = require('path'), vm = require('vm');
loadView('fauna-art.js'); loadView('fauna.js');
const SEA = ['galata', 'bridge', 'karakoy', 'eminonu', 'sirkeci', 'kumkapi', 'samatya', 'yedikule', 'kazlicesme', 'bakirkoysahil', 'atakoysahil', 'atakoy'];
const INLAND = ['istiklal', 'kapalicarsi', 'beyazit', 'laleli', 'aksaray', 'yenikapi', 'zeytinburnu', 'bakirkoy'];
{
  const ids = P.Journey.hoods.map(h => h.id);
  const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));
  check(sameSet(P.CFG.birdLook.seagull, SEA) && sameSet(P.CFG.birdLook.pigeon, INLAND), 'birdLook lists differ from the geography in the audit (13 answer 1)');
  check(ids.every(id => P.CFG.birdLook.seagull.includes(id) !== P.CFG.birdLook.pigeon.includes(id)), 'a hood is in neither or both bird look lists');
  check(ids.every(id => P.Fauna.lookFor(id) === (P.CFG.birdLook.pigeon.includes(id) ? 'pigeon' : 'seagull')), 'lookFor does not follow the lists');
  check(P.Fauna.lookFor('galata') === 'seagull' && P.Fauna.lookFor('beyazit') === 'pigeon', 'look: galata is not a seagull or beyazit is not a pigeon');
  // Thief: none in H01 to H04 (indexes 0..3), present from H05 (index 4) at stage 2 and later, in every later hood.
  const thief = ids.map((id, h) => { const s1 = P.createSim(3, { levelIndex: h * 5 + 2, loadout: null }); return s1.gen.roster.includes('marti'); });
  check(thief.slice(0, 4).every(x => !x), 'thief: present in H01 to H04 (' + thief.slice(0, 4) + ')');
  check(thief.slice(4).every(x => x), 'thief: missing from a hood from H05 on (' + thief.indexOf(false, 4) + ')');
  const early = P.createSim(3, { levelIndex: 4 * 5 + 1, loadout: null });   // H05 stage 1: no new types yet
  check(!early.gen.roster.includes('marti'), 'thief: present at stage 1');
  check(P.CFG.levels.thief.fromHood === 4 && P.CFG.levels.thief.type === 'marti', 'thief: config is not H05 (index 4) marti');
  check(!P.CFG.levels.schedule.some(sc => sc.type === 'marti'), 'thief: the schedule still lists marti by hood');
}

// ---------- 10. ambient fauna: view only (digest equal with fauna on and off), reduce-motion and placement ----------
// A stub canvas context: every method is a no-op, so the draw path runs headless.
const noop = () => {};
const ctxStub = new Proxy({}, { get: (t, k) => (k in t ? t[k] : k === 'createLinearGradient' ? () => ({ addColorStop: noop }) : noop),
  set: (t, k, v) => { t[k] = v; return true; } });
const Rstub = { ctx: ctxStub, ppm: 32.5, W: 390, H: 844, X: x => x * 32.5, Y: y => -y * 32.5, depth(y, fn) { fn(); } };
function digestFauna(seed, idx, withFauna, lookOverride) {
  const s = P.createSim(seed, { levelIndex: idx, loadout: null });
  s.mode = 'play';
  const h = crypto.createHash('sha256');
  const savedLook = P.Fauna.lookFor;
  if (lookOverride) P.Fauna.lookFor = lookOverride;
  let thiefSeen = 0;
  try {
    for (let i = 0; i < 1200; i++) {
      const inp = { x: Math.sin(i / 40), y: Math.cos(i / 55) * 0.5 };
      P.stepSim(s, DT, inp);
      if (withFauna) { P.Fauna.update(DT, s); P.Fauna.props(Rstub, s); }
      thiefSeen += s.enemies.filter(e => e.type === 'marti').length;
      if (i % 60 === 0) h.update([s.hero.x.toFixed(6), s.hero.y.toFixed(6), s.enemies.length, s.drops.length, s.kills, s.enemyTele.length].join('|'));
      if (s.mode !== 'play') break;
    }
  } finally { P.Fauna.lookFor = savedLook; }
  return { hex: h.digest('hex'), thiefSeen };
}
{
  const off = digestFauna(21, 22, false), on = digestFauna(21, 22, true);
  check(off.hex === on.hex, 'fauna: the sim digest changed with ambient fauna on (view only)');
  const pig = digestFauna(21, 22, false, () => 'pigeon'), sea = digestFauna(21, 22, false, () => 'seagull');
  check(pig.hex === sea.hex, 'looks: the seagull and pigeon thief gave different sim digests for the same seed');
  check(off.thiefSeen > 0, 'looks: the probe run had no thief (the look test is empty)');
  // Placement and motion: cats and birds on the level, never in the central lane, never in a street block, and cats never
  // step onto an enemy's or the hero's path as a sim object (they are not in s.enemies).
  const s = P.createSim(21, { levelIndex: 22, loadout: null });
  s.mode = 'play';
  for (let i = 0; i < 600; i++) { P.stepSim(s, DT, { x: 0, y: 1 }); P.Fauna.update(DT, s); }
  const cats = P.Fauna.cats(), birds = P.Fauna.birds();
  check(cats.length >= P.CFG.fauna.cats.perLevel[0] && cats.length <= P.CFG.fauna.cats.perLevel[1], 'fauna: ' + cats.length + ' cats on a level (1 to 3)');
  check(birds.length >= P.CFG.fauna.birds.perLevel[0] && birds.length <= P.CFG.fauna.birds.perLevel[1], 'fauna: ' + birds.length + ' birds on a level (2 to 4)');
  check([...cats, ...birds].every(a => Math.abs(a.home.x) >= P.CFG.fauna.sideMin), 'fauna: an animal spot is in the central lane');
  check(cats.every(c => !s.geo.blocks.some(b => Math.abs(b.x - c.home.x) < b.w / 2 && Math.abs(b.y - c.home.y) < b.h / 2)), 'fauna: a cat spot is inside a street block');
  check(s.enemies.every(e => e.type !== 'cat' && e.type !== 'bird' && e.type !== 'pigeon' && e.type !== 'seagull'), 'fauna: an animal became an enemy');
  // Reduce motion: no trot, no flight, no walk (the animals sit and peck).
  P.Settings = Object.assign(P.Settings || {}, { reduceMotion: true });
  const cat0 = cats[0], x0 = cat0.x, hx0 = s.hero.x, hy0 = s.hero.y;
  s.hero.x = cat0.x + 1; s.hero.y = cat0.y;                   // the hero right beside the cat
  for (let i = 0; i < 60; i++) P.Fauna.update(DT, s);
  check(cat0.st !== 'trot' && cat0.x === x0, 'reduce-motion: a cat trotted away');
  s.hero.x = hx0; s.hero.y = hy0;
  P.Settings.reduceMotion = false;
  s.hero.x = cat0.x + 1; s.hero.y = cat0.y; P.Fauna.update(DT, s);
  check(cat0.st === 'trot', 'shy: a cat did not trot away from the hero within shyR');
  s.hero.x = hx0; s.hero.y = hy0;
  // Hiss: an elite within hissR makes a cat stand, with no effect on the sim (checked by the digest above).
  const s2 = P.createSim(21, { levelIndex: 22, loadout: null }); s2.mode = 'play';
  P.stepSim(s2, DT, { x: 0, y: 0 }); P.Fauna.update(DT, s2);
  const c2 = P.Fauna.cats()[0];
  if (c2) {
    const boss = P.Combat.spawnEnemy(s2, 'walker', c2.x + 3, c2.y, {}); boss.elite = true; boss.state = 'active';
    P.Fauna.update(DT, s2);
    check(c2.st === 'stand' && c2.hiss > 0, 'hiss: a cat did not stand up for an elite within ' + P.CFG.fauna.cats.hissR + ' m');
  }
  // The camera shows 10 m of the 14 m corridor: every spot, in every hood and for several seeds, must be inside the view.
  const VIEW_HALF = 4.8;                                       // the camera shows |x| <= 5; keep the sprite inside
  let hidden = 0, spots = 0, undrawn = 0;
  for (let h = 0; h < 20; h++) for (let sd = 1; sd <= 4; sd++) {
    const sp = P.createSim(sd, { levelIndex: h * 5 + 2, loadout: null }); sp.mode = 'play';
    P.Fauna.update(DT, sp);
    [...P.Fauna.cats(), ...P.Fauna.birds()].forEach(a => {
      spots++; if (Math.abs(a.home.x) > VIEW_HALF) hidden++;
      // Drawn when in view: the camera 8 m behind the animal, centred on the lane (render.js R.X/R.Y are centre-relative).
      // Left, right, ahead and behind the hero are all inside the screen, so every animal must reach R.depth.
      const drawn = []; const cam = { x: 0, y: a.y - 8 };
      const R2 = { ctx: ctxStub, ppm: 39, W: 390, H: 844, X: x => (x - cam.x) * 39, Y: y => -(y - cam.y) * 39, depth(y, fn) { drawn.push(y); fn(); } };
      P.Fauna.props(R2, sp);
      if (!drawn.includes(a.y)) undrawn++;
    });
  }
  check(undrawn === 0, 'fauna: ' + undrawn + ' of ' + spots + ' animals in view were not drawn (the on-screen test uses the wrong origin)');
  check(spots > 0 && hidden === 0, 'fauna: ' + hidden + ' of ' + spots + ' animal spots are outside the camera view (|x| > ' + VIEW_HALF + ')');
}
// The new view files stay under the 600-line rule (AGENTS.md).
['view/fauna.js', 'view/fauna-art.js', 'config-fauna.js'].forEach(f => {
  const n = fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8').split('\n').length;
  check(n <= 600, f + ' is ' + n + ' lines (over 600)');
});

if (problems.length) { console.log('enemy behaviours: FAIL'); problems.forEach(p => console.log('  - ' + p)); process.exit(1); }
console.log('enemy behaviours: ok (fisher pull, musician buff, hamal rear and crate, marti steal and return, cayci puddle, floors, caps, determinism)');
notes.forEach(n => console.log('note: ' + n));
