// Street Tree movement and aggression perks (R1-T5 step 2, D-059): pace.1 Quick Feet, pace.2 Slipstream, pace.3 Parkour,
// pace.4 Dolmus Rider, agg.1 Hot Streak, agg.2 Blood Rush (P.Skills.extendFrenzy), agg.4 Last Laugh. Each perk has a learned
// check and a not-learned check (the same scenario without the perk must give the base behaviour), plus a determinism digest.
// Headless: runs the sim from index.html's scripts (lib-load.js). Usage: node prototype/tools/test-perks-move.js
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { loadP, ROOT } = require('./lib-load.js');
const P = loadP();
const DT = 1 / 60;
const problems = [];
const check = (cond, msg) => { if (!cond) problems.push(msg); };
const near = (a, b, eps) => Math.abs(a - b) <= (eps === undefined ? 1e-9 : eps);

const DASH = P.CFG.skills.dash, FR = P.CFG.skills.frenzy, PERK = P.CFG.perks, TEA = P.CFG.enemies5.cayci;
const PUDDLE = P.CFG.env.puddle, RIGHT = { x: 1, y: 0 };

// A generated level with the walls cleared, no roster spawns, no random puddles, and the hero at (0, 5), invulnerable.
function sandbox(perks, seed) {
  const s = P.createSim(seed || 7, { levelIndex: 22, loadout: { perks: perks || [] } });
  s.mode = 'play'; s.hero.hp = s.hero.maxHp = 1e9; s.hero.invuln = 1e9;
  s.hero.x = 0; s.hero.y = 5;
  if (s.geo) s.geo.blocks.length = 0;
  s.enemies.length = 0; s.zones.length = 0;
  if (s.env) s.env.puddleT = 1e9;
  return s;
}
function drain(s) { const ev = s.events.slice(); s.events.length = 0; return ev; }
// Skill frames only (no director, no weapons): dash, kill and frenzy timers.
function skillFrames(s, n, input) {
  const seen = [];
  for (let i = 0; i < n; i++) { P.Skills.step(s, DT, input || null); seen.push(...drain(s)); }
  return seen;
}
// Run until the dash ends (its own frames), returning the events seen.
function finishDash(s) {
  const seen = [];
  for (let i = 0; i < 60 && P.Skills.dashing(s); i++) { P.Skills.step(s, DT, null); seen.push(...drain(s)); }
  return seen;
}
function dash(s, dir) {
  P.Skills.step(s, DT, { dash: true, x: dir.x, y: dir.y });
  const seen = drain(s);
  return seen.concat(finishDash(s));
}
// Kill n walkers in one step (the same frame, so the streak window never ends it).
function killBatch(s, n) {
  const list = [];
  for (let i = 0; i < n; i++) list.push(P.Combat.spawnEnemy(s, 'walker', 0, 20 + i * 0.1, {}));
  P.Skills.step(s, DT, null); drain(s);
  list.forEach(e => { e.dead = true; });
  P.Skills.step(s, DT, null);
  return drain(s);
}
function frenzyOn(s) { return P.Skills.frenzyOn(s); }
// Tea zone (the cayci puddle) on the hero, and a wet puddle on the hero (env zone), as in the sim.
function teaZone(s, r) { const z = { kind: 'tea', x: s.hero.x, y: s.hero.y, r: r, t: 99, T: 99, dps: 0, heroDps: 0, tick: 0, hit: {} }; s.zones.push(z); return z; }
function puddle(s, r) { return P.EnvZones.add(s, 'puddle', s.hero.x, s.hero.y, r, 99, 0); }
// Position the hero's zones: move a zone far away (outside) or back onto the hero (inside).
function far(z) { z.x = 400; }
function onHero(z, s) { z.x = s.hero.x; z.y = s.hero.y; }

// ---------- pace.1 Quick Feet: a dash clears the hero's slow; it stays clear while the hero is on that wet tile ----------
{
  // Tea: learned, the slow is cleared at dash start and does not come back while inside the zone.
  const s = sandbox(['pace.1']), z = teaZone(s, 5);
  P.Enemies4.frame(s, DT);
  check(near(P.Enemies4.heroMul(s), TEA.slow.m), 'pace.1 tea: the hero was not slowed in the tea before the dash');
  dash(s, RIGHT);
  check(P.Enemies4.heroMul(s) === 1 && s.tea.slowT === 0, 'pace.1 tea: a dash did not clear the tea slow (slowT ' + s.tea.slowT + ')');
  for (let i = 0; i < 30; i++) P.Enemies4.frame(s, DT);
  check(P.Enemies4.heroMul(s) === 1, 'pace.1 tea: the slow came back while the hero stayed on the tile');
  far(z); P.Enemies4.frame(s, DT); onHero(z, s); P.Enemies4.frame(s, DT);
  check(near(P.Enemies4.heroMul(s), TEA.slow.m), 'pace.1 tea: re-entering the tea did not slow the hero again');

  // Tea: not learned, the dash does not touch the slow.
  const n = sandbox([]); teaZone(n, 5);
  P.Enemies4.frame(n, DT);
  dash(n, RIGHT);
  P.Enemies4.frame(n, DT);
  check(near(P.Enemies4.heroMul(n), TEA.slow.m), 'pace.1 not learned: a dash changed the tea slow');

  // Puddle: learned, the dash clears it (dryPud) and it stays off on the same puddle.
  const p = sandbox(['pace.1']), pz = puddle(p, 5);
  P.EnvZones.step(p, DT);
  const slowed = 1 - PUDDLE.heroSlow;
  check(near(p.env.heroMul, slowed), 'pace.1 puddle: the hero was not slowed in the puddle before the dash');
  dash(p, RIGHT);
  P.EnvZones.step(p, DT);
  check(p.env.heroMul === 1, 'pace.1 puddle: a dash did not clear the puddle slow (' + p.env.heroMul + ')');
  far(pz); P.EnvZones.step(p, DT); onHero(pz, p); P.EnvZones.step(p, DT);
  check(near(p.env.heroMul, slowed), 'pace.1 puddle: re-entering the puddle did not slow the hero again');

  // Puddle: not learned, the slow stays through a dash.
  const pn = sandbox([]); puddle(pn, 5);
  P.EnvZones.step(pn, DT);
  dash(pn, RIGHT);
  P.EnvZones.step(pn, DT);
  check(near(pn.env.heroMul, slowed), 'pace.1 not learned: a dash changed the puddle slow (' + pn.env.heroMul + ')');
}

// ---------- pace.3 Parkour: puddles and tea never slow the hero ----------
{
  const s = sandbox(['pace.3']); teaZone(s, 5); puddle(s, 5);
  for (let i = 0; i < 5; i++) { P.Enemies4.frame(s, DT); P.EnvZones.step(s, DT); }
  check(P.Enemies4.heroMul(s) === 1 && s.tea.slowT === 0, 'pace.3: the tea slowed the hero');
  check(s.env.heroMul === 1, 'pace.3: the puddle slowed the hero (' + s.env.heroMul + ')');
  // Not learned, the same tiles slow the hero.
  const n = sandbox([]); teaZone(n, 5); puddle(n, 5);
  P.Enemies4.frame(n, DT); P.EnvZones.step(n, DT);
  check(near(P.Enemies4.heroMul(n), TEA.slow.m) && near(n.env.heroMul, 1 - PUDDLE.heroSlow), 'pace.3 not learned: tea or puddle no longer slows the hero');
}

// ---------- pace.2 Slipstream: n distinct enemies on the dash path refund refund x dash cooldown, once per dash ----------
// The enemies stand still on the path (x 0.5 .. 2.6, the dash runs 3.2 m); the learned and the not-learned sims differ
// only by the refund, so the cooldown difference is exactly refund x the dash cooldown.
function slipCd(perks, count) {
  const s = sandbox(perks);
  for (let i = 0; i < count; i++) P.Combat.spawnEnemy(s, 'walker', 0.5 + i * 0.5, 5, {});
  dash(s, RIGHT);
  return { cd: s.hero.dashCd, max: s.hero.dashCdMax };
}
{
  const N = PERK.slipstream.n, R = PERK.slipstream.refund;
  const base = slipCd([], N);
  const got = slipCd(['pace.2'], N);
  check(near(base.max, DASH.cooldown), 'pace.2 not learned: dash cooldown is not the base (' + base.max + ')');
  check(near(got.cd - base.cd, -R * base.max, 1e-9), 'pace.2: ' + N + ' enemies did not refund ' + R + ' of the cooldown (diff ' + (got.cd - base.cd).toFixed(4) + ')');
  const few = slipCd(['pace.2'], N - 1), fewBase = slipCd([], N - 1);
  check(near(few.cd, fewBase.cd, 1e-12), 'pace.2: ' + (N - 1) + ' enemies refunded the cooldown');
  const many = slipCd(['pace.2'], N + 3), manyBase = slipCd([], N + 3);
  check(near(many.cd - manyBase.cd, -R * manyBase.max, 1e-9), 'pace.2: more enemies refunded more than once per dash');
  // One enemy, touched over several frames, counts once.
  const one = sandbox(['pace.2']); P.Combat.spawnEnemy(one, 'walker', 1.2, 5, {}); dash(one, RIGHT);
  const oneBase = sandbox([]); P.Combat.spawnEnemy(oneBase, 'walker', 1.2, 5, {}); dash(oneBase, RIGHT);
  check(near(one.hero.dashCd, oneBase.hero.dashCd, 1e-12), 'pace.2: one enemy seen over several frames was counted more than once');
}

// ---------- pace.4 Dolmus Rider: the first dash of the run has no cooldown ----------
{
  const s = sandbox(['pace.4']);
  const first = dash(s, RIGHT);
  check(first.some(ev => ev.type === 'dash') && s.hero.dashCd === 0 && s.hero.dashCdMax === 0, 'pace.4: the first dash had a cooldown (' + s.hero.dashCd + ')');
  check(s.pk.dolmus === true, 'pace.4: the first dash did not set the once-per-run flag');
  const second = dash(s, RIGHT);
  check(second.some(ev => ev.type === 'dash'), 'pace.4: the second dash was blocked after the free first dash');
  check(s.hero.dashCd > 0 && near(s.hero.dashCdMax, DASH.cooldown), 'pace.4: the second dash had no normal cooldown');
  const n = sandbox([]);
  dash(n, RIGHT);
  check(n.hero.dashCd > 0 && near(n.hero.dashCdMax, DASH.cooldown), 'pace.4 not learned: the first dash had no cooldown');
  const blocked = dash(n, RIGHT);
  check(!blocked.some(ev => ev.type === 'dash'), 'pace.4 not learned: a dash inside the cooldown was allowed');
}

// ---------- agg.1 Hot Streak: frenzy at hotStreak.threshold kills, the base 60 without it ----------
{
  const T = PERK.hotStreak.threshold;
  const s = sandbox(['agg.1']);
  check(P.Skills.frenzyThreshold(s) === T && skillsHud(s).threshold === T, 'agg.1: threshold is not ' + T);
  killBatch(s, T - 1);
  check(!frenzyOn(s), 'agg.1: frenzy started before ' + T + ' kills');
  const ev = killBatch(s, 1);
  check(frenzyOn(s) && ev.some(e => e.type === 'frenzy' && e.on), 'agg.1: frenzy did not start at ' + T + ' kills');
  const n = sandbox([]);
  check(P.Skills.frenzyThreshold(n) === FR.threshold && skillsHud(n).threshold === FR.threshold, 'agg.1 not learned: threshold is not the base ' + FR.threshold);
  killBatch(n, T);
  check(!frenzyOn(n), 'agg.1 not learned: frenzy started at ' + T + ' kills');
  killBatch(n, FR.threshold - T);
  check(frenzyOn(n), 'agg.1 not learned: frenzy did not start at the base ' + FR.threshold + ' kills');
}
function skillsHud(s) { return P.Skills.hud(s); }

// ---------- agg.2 Blood Rush: P.Skills.extendFrenzy adds to an active frenzy, capped per frenzy ----------
{
  const B = PERK.bloodRush;
  const s = sandbox([]);
  P.Skills.extendFrenzy(s, 1, B.capT);
  check(!frenzyOn(s) && P.Skills.hud(s).frenzy === false, 'agg.2: extendFrenzy did something with no frenzy');
  killBatch(s, FR.threshold);
  const t0 = s.sk.frenzyT;   // the trigger step already ran one frame of the timer
  check(t0 <= FR.time && t0 > FR.time - 2 * DT, 'agg.2 not learned: frenzy is not the base ' + FR.time + ' s after the trigger (' + t0 + ')');
  for (let i = 0; i < 10; i++) P.Skills.extendFrenzy(s, B.ext, B.capT);
  check(near(s.sk.frenzyT, t0 + B.capT, 1e-9), 'agg.2: total extension is not capped at ' + B.capT + ' s (added ' + (s.sk.frenzyT - t0) + ')');
  check(near(s.pk.frenzyAdded, B.capT, 1e-9), 'agg.2: the added total is not tracked in s.pk (' + s.pk.frenzyAdded + ')');
  check(P.Skills.hud(s).frenzyFrac === 1, 'agg.2: the frenzy readout is not clamped at 1 (' + P.Skills.hud(s).frenzyFrac + ')');
  // Partial steps: the last one is cut to the room left.
  const p = sandbox([]);
  killBatch(p, FR.threshold);
  const p0 = p.sk.frenzyT;
  P.Skills.extendFrenzy(p, 3, 4); P.Skills.extendFrenzy(p, 3, 4);
  check(near(p.pk.frenzyAdded, 4, 1e-9) && near(p.sk.frenzyT, p0 + 4, 1e-9), 'agg.2: a partial step did not stop at the cap');
  // The extended frenzy ends after base + cap; a new frenzy starts with a fresh total.
  skillFrames(p, Math.ceil((FR.time + B.capT + 1) / DT));
  check(!frenzyOn(p), 'agg.2: frenzy did not end after its extended time');
  killBatch(p, FR.threshold);
  check(p.pk.frenzyAdded === 0, 'agg.2: a new frenzy did not reset the added total');
  P.Skills.extendFrenzy(p, 0.5, 4);
  check(near(p.pk.frenzyAdded, 0.5, 1e-9), 'agg.2: the new frenzy did not take a fresh extension');
}

// ---------- agg.4 Last Laugh: frenzy ending pushes enemies in the ring; not learned, nothing ----------
function frenzyEnd(perks) {
  const s = sandbox(perks);
  killBatch(s, FR.threshold);
  const near1 = P.Combat.spawnEnemy(s, 'walker', s.hero.x + 1, s.hero.y, {});
  const seen = skillFrames(s, Math.ceil((FR.time + 0.5) / DT));
  return { s: s, e: near1, seen: seen };
}
{
  const L = frenzyEnd(['agg.4']);
  const ring = L.seen.findIndex(ev => ev.type === 'perkRing');
  const off = L.seen.findIndex(ev => ev.type === 'frenzy' && ev.on === false);
  check(off >= 0 && ring === off + 1, 'agg.4: no perkRing right after frenzy ended');
  check(L.e.kbT > 0 && L.e.kbx > 0, 'agg.4: the enemy in the ring was not pushed away from the hero');
  const N = frenzyEnd([]);
  check(!N.seen.some(ev => ev.type === 'perkRing') && N.e.kbT === 0, 'agg.4 not learned: frenzy end pushed enemies');
  check(N.seen.some(ev => ev.type === 'frenzy' && ev.on === false), 'agg.4 not learned: frenzy did not end on its own');
}

// ---------- determinism: the same seed and inputs give the same digest, with and without the perks ----------
function digest(perks) {
  const s = P.createSim(11, { levelIndex: 22, loadout: { perks: perks } });
  s.mode = 'play'; s.hero.hp = s.hero.maxHp = 1e9; s.hero.invuln = 1e9;
  const h = crypto.createHash('sha256');
  for (let i = 0; i < 900; i++) {
    const ang = i / 60, input = { x: Math.cos(ang), y: Math.sin(ang), dash: i % 97 === 0, skill: false, ult: false };
    P.stepSim(s, DT, input);
    if (i % 30 === 0) h.update(JSON.stringify([s.hero.x, s.hero.y, s.hero.hp, s.hero.dashCd, s.enemies.length, s.kills, s.tea && s.tea.slowT]));
  }
  return h.digest('hex');
}
{
  const all = ['pace.1', 'pace.2', 'pace.3', 'pace.4', 'agg.1', 'agg.2', 'agg.4'];
  check(digest([]) === digest([]), 'determinism: two runs without perks differ');
  check(digest(all) === digest(all), 'determinism: two runs with the movement and aggression perks differ');
}

// ---------- static: the HUD reads the threshold from the sim, and the files stay under 600 lines (AGENTS.md) ----------
{
  const ui = fs.readFileSync(path.join(ROOT, 'js/view/ui.js'), 'utf8');
  check(ui.includes("'/' + k.threshold") && !ui.includes('F.threshold'), 'ui.js: the streak readout does not use the sim threshold');
  ['js/sim/skills.js', 'js/sim/env-zones.js', 'js/sim/enemies4.js', 'js/sim/enemies4-cayci.js', 'js/view/ui.js'].forEach(f => {
    const n = fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n').length;
    check(n <= 600, f + ' is ' + n + ' lines (over 600)');
  });
}

if (problems.length) { console.log('perks (movement and aggression): FAIL'); problems.forEach(p => console.log('  - ' + p)); process.exit(1); }
console.log('perks (movement and aggression): ok (quick feet, slipstream, parkour, dolmus rider, hot streak, blood rush, last laugh, determinism)');
