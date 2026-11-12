// Street Tree combat perks (R1-T5 step 2, D-059): str.1 Heavy Hands, str.2 Cart Shover, str.3 Shockwave, str.4 Wall Breaker,
// agg.2 Blood Rush, agg.3 Finisher, grit.1 Thick Skin, grit.3 Iron Stomach, grit.4 Stubborn (low-HP pull of healing drops). Each perk has a learned check and a
// not-learned check (behaviour unchanged). Also: with no perks the perk paths never run, a seeded run repeats, and every perk
// learned runs cleanly. Headless: runs the sim from index.html's scripts (lib-load.js). Usage: node prototype/tools/test-perks-combat.js
'use strict';
const crypto = require('crypto');
const { loadP } = require('./lib-load.js');
const P = loadP();
const DT = 1 / 60;
const problems = [];
const check = (cond, msg) => { if (!cond) problems.push(msg); };
const near = (a, b) => Math.abs(a - b) < 1e-9;
const C = P.CFG.perks, T = P.CFG.knockbackTime;

// A generated level with no walls, props, canisters, drops or roster spawns. The hero sits at the origin with plenty of HP.
function sandbox(perks, seed) {
  const s = P.createSim(seed || 7, { levelIndex: 22, loadout: { perks: perks || [] } });
  s.mode = 'play';
  s.hero.x = 0; s.hero.y = 0; s.hero.hp = s.hero.maxHp = 1e9; s.hero.invuln = 0;
  if (s.geo) s.geo.blocks.length = 0;
  s.enemies.length = 0; s.props.canisters.length = 0; s.drops.length = 0;
  return s;
}
// A walker at (x, y). Its HP is raised so ordinary hits do not kill it.
function foe(s, x, y) {
  const e = P.Combat.spawnEnemy(s, 'walker', x, y, {});
  e.hp = e.maxHp = 1e9;
  return e;
}
// Metres a knockback still has to carry the enemy (its push decays linearly over kbT).
const travel = e => ({ x: e.kbT > 0 ? e.kbx * e.kbT * e.kbT / (2 * T) : 0, y: e.kbT > 0 ? e.kby * e.kbT * e.kbT / (2 * T) : 0 });
const stunOf = e => (e.st && e.st.stun) || 0;
const rings = s => s.events.filter(ev => ev.type === 'perkRing').length;

{ // str.1 Heavy Hands: a heavy hit adds heavyShove metres of push on top of its own; a light hit and an unlearned perk do not
  const hit = (perks, src) => {
    const s = sandbox(perks), e = foe(s, 2, 0);
    P.Combat.damageEnemy(s, e, 10, 1, 0, 1.0, false, src);
    return { s, e, x: travel(e).x };
  };
  const base = hit([], 'sledge'), heavy = hit(['str.1'], 'sledge');
  const f = 1 - base.e.kbResist;
  check(near(heavy.x - base.x, C.heavyShove * f), 'Heavy Hands: a heavy hit did not add heavyShove metres (' + (heavy.x - base.x) + ')');
  check(near(base.x, 1 * (1 + base.s.fx.knockbackPct) * f), 'not learned: a heavy hit no longer pushes its normal distance');
  check(near(hit(['str.1'], 'knife').x, hit([], 'knife').x), 'Heavy Hands: a light (knife) hit was pushed further');
}

{ // str.3 Shockwave: every 8th heavy hit sends one ring from the hero; light hits never count; not learned: no ring
  const run = (perks, src, n) => {
    const s = sandbox(perks), near1 = foe(s, 1, 0), dummy = foe(s, 0, 4);
    for (let i = 0; i < n; i++) P.Combat.damageEnemy(s, dummy, 1, 0, 1, 0, false, src);
    return { s, near1 };
  };
  const seven = run(['str.3'], 'sledge', 7);
  check(rings(seven.s) === 0 && seven.near1.kbT === 0, 'Shockwave: a ring fired before the 8th heavy hit');
  const eight = run(['str.3'], 'sledge', 8);
  check(rings(eight.s) === 1, 'Shockwave: 8 heavy hits gave ' + rings(eight.s) + ' rings, expected 1');
  check(near1Pushed(eight), 'Shockwave: the ring did not push an enemy 1 m from the hero');
  const ev = eight.s.events.find(ev => ev.type === 'perkRing');
  check(ev && ev.x === 0 && ev.y === 0 && ev.r === C.ring.r, 'Shockwave: ring event is not at the hero with ring.r');
  check(rings(run(['str.3'], 'sledge', 16).s) === 2, 'Shockwave: 16 heavy hits did not give 2 rings');
  check(rings(run(['str.3'], 'knife', 16).s) === 0, 'Shockwave: light hits sent rings');
  check(rings(run([], 'sledge', 16).s) === 0, 'not learned: heavy hits sent rings');
}
function near1Pushed(r) { return r.near1.kbT > 0 && travel(r.near1).x !== 0; }

{ // str.4 Wall Breaker: a heavy hit stuns an armoured enemy for wallBreakerStun seconds; not an unarmoured one, not a light hit
  const s = sandbox(['str.4']), armd = foe(s, 2, 0), soft = foe(s, -2, 0);
  armd.armour = 0.5;
  P.Combat.damageEnemy(s, armd, 10, 1, 0, 0, false, 'sledge');
  P.Combat.damageEnemy(s, soft, 10, -1, 0, 0, false, 'sledge');
  check(stunOf(armd) === C.wallBreakerStun, 'Wall Breaker: armoured enemy stun is ' + stunOf(armd) + ', expected ' + C.wallBreakerStun);
  check(stunOf(soft) === 0, 'Wall Breaker: an unarmoured enemy was stunned');
  const s2 = sandbox(['str.4']), a2 = foe(s2, 2, 0);
  a2.armour = 0.5;
  P.Combat.damageEnemy(s2, a2, 10, 1, 0, 0, false, 'knife');
  check(stunOf(a2) === 0, 'Wall Breaker: a light hit stunned an armoured enemy');
  const s3 = sandbox([]), a3 = foe(s3, 2, 0);
  a3.armour = 0.5;
  P.Combat.damageEnemy(s3, a3, 10, 1, 0, 0, false, 'sledge');
  check(stunOf(a3) === 0, 'not learned: a heavy hit stunned an armoured enemy');
}

{ // agg.2 Blood Rush: a boss hit during frenzy calls extendFrenzy with the config numbers; other hits and no perk do not
  const real = P.Skills.extendFrenzy, calls = [];
  P.Skills.extendFrenzy = function (s, ext, cap) { calls.push([ext, cap]); };
  const bossHit = (perks, frenzy, boss) => {
    const s = sandbox(perks), e = foe(s, 2, 0);
    e.boss = !!boss;
    P.Skills.frenzyOn(s);
    s.sk.frenzyT = frenzy ? 3 : 0;
    calls.length = 0;
    P.Combat.damageEnemy(s, e, 10, 1, 0, 0, false, 'knife');
    return calls.slice();
  };
  try {
    const want = JSON.stringify([[C.bloodRush.ext, C.bloodRush.capT]]);
    check(JSON.stringify(bossHit(['agg.2'], true, true)) === want, 'Blood Rush: a boss hit in frenzy did not extend it with ext/capT');
    check(bossHit(['agg.2'], false, true).length === 0, 'Blood Rush: a boss hit outside frenzy extended nothing');
    check(bossHit(['agg.2'], true, false).length === 0, 'Blood Rush: a normal hit in frenzy extended it');
    check(bossHit([], true, true).length === 0, 'not learned: a boss hit in frenzy extended it');
  } finally { P.Skills.extendFrenzy = real; }
}

{ // agg.3 Finisher: a crit kill slows enemies within r of the victim; adds no XP and no drops; not learned: no slow
  const run = (perks, crit) => {
    const s = sandbox(perks, 9);
    if (crit) s.fx.critPct = 1;   // the crit roll always hits
    const victim = foe(s, 5, 0), nearE = foe(s, 5, 1), farE = foe(s, 5, 4);
    victim.hp = 1;
    P.Combat.damageEnemy(s, victim, 1, 1, 0, 0, !!crit, 'knife');
    return { s, victim, nearE, farE };
  };
  const on = run(['agg.3'], true), off = run([], true);
  check(on.victim.dead && on.s.events.some(ev => ev.type === 'critKill'), 'Finisher: the crit did not kill');
  check(on.nearE.st && near(on.nearE.st.slow.m, 1 - C.finisher.slowMul) && on.nearE.st.slow.t === C.finisher.slowT,
    'Finisher: the enemy 1 m from the victim was not slowed to slowMul for slowT');
  check(near(P.Status.speedMul(on.nearE), C.finisher.slowMul), 'Finisher: speed multiplier is not slowMul');
  check(!(on.farE.st && on.farE.st.slow), 'Finisher: an enemy beyond r was slowed');
  check(!(off.nearE.st && off.nearE.st.slow), 'not learned: a crit kill slowed a nearby enemy');
  check(JSON.stringify(on.s.drops) === JSON.stringify(off.s.drops) && on.s.xp === off.s.xp, 'Finisher: a crit kill changed XP or drops');
  const plain = run(['agg.3'], false);
  check(!(plain.nearE.st && plain.nearE.st.slow), 'Finisher: a non-crit kill slowed a nearby enemy');
}

{ // grit.1 Thick Skin: the first melee hit that lands stuns its attacker; ignored hits and later hits do not; damage is unchanged
  const run = perks => {
    const s = sandbox(perks, 11), e = foe(s, 0, 0);
    s.hero.invuln = 5; P.Combat.contact(s);          // i-frames: no damage
    const ignoredHp = s.hero.hp, stunIgnored = stunOf(e);
    s.hero.invuln = 0; e.contactCd = 0; P.Combat.contact(s);   // the first hit that lands
    const hp1 = s.hero.hp, stun1 = stunOf(e);
    e.contactCd = 0; if (e.st) e.st.stun = 0; P.Combat.contact(s);   // a later hit
    return { s, ignoredHp, stunIgnored, hp1, stun1, hp2: s.hero.hp, stun2: stunOf(e) };
  };
  const on = run(['grit.1']), off = run([]);
  check(on.ignoredHp === 1e9 && on.stunIgnored === 0, 'Thick Skin: an i-frame hit stunned its attacker');
  check(on.stun1 === C.thickSkin.stunT, 'Thick Skin: first hit stun is ' + on.stun1 + ', expected ' + C.thickSkin.stunT);
  check(on.stun2 === 0 && on.s.pk.thick === true, 'Thick Skin: a second hit stunned again in the same run');
  check(on.hp1 === off.hp1 && on.hp2 === off.hp2 && on.hp1 < 1e9, 'Thick Skin: the damage taken changed');
  check(off.stun1 === 0 && !off.s.pk.thick, 'not learned: the first hit stunned its attacker');
}

{ // grit.3 Iron Stomach: a simit heals simitHeal more, capped at max HP; not learned: the base heal only
  const heal = (perks, hp) => {
    const s = sandbox(perks);
    s.hero.maxHp = 100; s.hero.hp = hp;
    s.drops.push({ kind: 'simit', value: P.CFG.drops.simitHeal, x: 0, y: 0, mag: false, pop: 0 });
    P.Combat.updateDrops(s, DT);
    return s.hero.hp;
  };
  check(heal([], 40) === 40 + P.CFG.drops.simitHeal, 'not learned: simit heal changed');
  check(heal(['grit.3'], 40) === 40 + P.CFG.drops.simitHeal + C.ironStomach.simitHeal, 'Iron Stomach: simit did not heal simitHeal more');
  check(heal(['grit.3'], 97) === 100, 'Iron Stomach: the heal went past max HP');
}

{ // grit.4 Stubborn: at or below hpFrac of max HP healing drops are pulled from pullR metres; damage is never changed
  const S = C.stubborn;
  const pull = (perks, hp, kind, dist) => {
    const s = sandbox(perks);
    s.hero.maxHp = 100; s.hero.hp = hp;
    s.drops.push({ kind, value: 5, x: dist, y: 0, mag: false, pop: 0 });
    P.Combat.updateDrops(s, DT);
    return s.drops[0];
  };
  const far = S.pullR - 0.5, past = S.pullR + 0.5;
  check(pull(['grit.4'], 20, 'simit', far) && pull(['grit.4'], 20, 'simit', far).mag === true, 'Stubborn: at the threshold a simit inside pullR was not pulled');
  check(pull(['grit.4'], 21, 'simit', far).mag === false, 'Stubborn: above the threshold a simit was pulled');
  check(pull(['grit.4'], 20, 'simit', past).mag === false, 'Stubborn: a simit beyond pullR was pulled');
  check(pull([], 20, 'simit', far).mag === false, 'not learned: a simit was pulled');
  ['xp', 'jeton'].forEach(kind => check(pull(['grit.4'], 20, kind, far).mag === false, 'Stubborn: a ' + kind + ' drop was pulled (only healing drops are)'));
  check(pull(['grit.4'], 20, 'chest', past).mag === pull([], 20, 'chest', past).mag, 'Stubborn: a chest was pulled by the perk (chests keep their own 6 m rule)');
  const hurt = (perks, hp, raw) => {
    const s = sandbox(perks);
    s.hero.maxHp = 100; s.hero.hp = hp;
    P.Combat.damageHero(s, raw, 'walker');
    return s;
  };
  check(near(hurt(['grit.4'], 10, 4).hero.hp, hurt([], 10, 4).hero.hp), 'Stubborn: the damage taken changed (it must not)');
  const lethal = hurt(['grit.4'], 3, 5);
  check(lethal.mode === 'dead' && lethal.hero.hp === 0 && lethal.deathCause === hurt([], 3, 5).deathCause, 'Stubborn: the death path changed');
}

{ // str.2 Cart Shover: enemies just outside a canister blast (within blastShove.r of its edge) are pushed kb away from the centre
  const B = P.CFG.props.canister.blast, cx = 30, r = P.CFG.enemies.walker.radius;
  const blast = perks => {
    const s = sandbox(perks, 13);
    const inside = foe(s, cx + 0.5, 0), ringE = foe(s, cx + B + r + 1.0, 0), beyond = foe(s, cx + B + r + C.blastShove.r + 1.0, 0);
    P.Combat.explodeCanister(s, { x: cx, y: 0, alive: true, hp: 1 });
    return { s, inside, ringE, beyond };
  };
  const on = blast(['str.2']), off = blast([]);
  check(on.ringE.kbT === T && on.ringE.kbx > 0, 'Cart Shover: the enemy just outside the blast was not pushed away');
  check(near(travel(on.ringE).x, C.blastShove.kb * (1 - on.ringE.kbResist)), 'Cart Shover: push is not blastShove.kb metres');
  check(off.ringE.kbT === 0, 'not learned: the enemy outside the blast was pushed');
  check(on.beyond.kbT === 0, 'Cart Shover: an enemy beyond blastShove.r was pushed');
  check(on.inside.kbx === off.inside.kbx && on.inside.kbT === off.inside.kbT, 'Cart Shover: an enemy inside the blast got a different push');
}

{ // no perk learned: the perk paths never run (no perk state, rings, extensions or stacked pushes), and a seeded run repeats
  const spy = { ring: 0, extend: 0, stacked: 0 };
  const realRing = P.Perks.ring, realExt = P.Skills.extendFrenzy, realShove = P.Combat.shove;
  P.Perks.ring = function () { spy.ring++; return realRing.apply(this, arguments); };
  P.Skills.extendFrenzy = function () { spy.extend++; if (realExt) return realExt.apply(this, arguments); };
  P.Combat.shove = function (e, dx, dy, k, add) { if (add) spy.stacked++; return realShove.apply(this, arguments); };
  try {
    const a = seededRun({ startWeapon: 'sledge', perks: [] }, 1200), b = seededRun({ startWeapon: 'sledge', perks: [] }, 1200);
    check(a.hex === b.hex, 'determinism: the same seed and loadout gave two different digests');
    check(Object.keys(a.s.pk).length === 0, 'no perks: s.pk was written (' + Object.keys(a.s.pk).join(',') + ')');
    check(spy.ring === 0 && spy.extend === 0 && spy.stacked === 0,
      'no perks: perk paths ran (ring ' + spy.ring + ', extendFrenzy ' + spy.extend + ', stacked pushes ' + spy.stacked + ')');
  } finally {
    P.Perks.ring = realRing; P.Skills.extendFrenzy = realExt; P.Combat.shove = realShove;
  }
}

// Seeded run of the real sim (same inputs as test-enemy-behaviors.js). Returns the final sim and a digest of its trace.
function seededRun(loadout, frames, levelIndex) {
  const s = P.createSim(31, { levelIndex: levelIndex || 22, loadout: loadout });
  s.mode = 'play';
  const h = crypto.createHash('sha256');
  for (let i = 0; i < frames; i++) {
    P.stepSim(s, DT, { x: Math.sin(i / 40), y: Math.cos(i / 55) * 0.5 });
    if (i % 30 === 0) h.update([s.hero.x.toFixed(6), s.hero.y.toFixed(6), s.hero.hp, s.enemies.length, s.kills, s.drops.length].join('|'));
    if (s.mode !== 'play') break;
  }
  return { s, hex: h.digest('hex') };
}

{ // every perk learned: a seeded run on a boss level and a generated level runs without errors and stays finite
  [10, 22].forEach(lv => {
    let threw = null, out = null;
    try { out = seededRun({ startWeapon: 'sledge', perks: P.Tree.ids() }, 3600, lv); } catch (e) { threw = e; }
    check(!threw, 'all perks: level ' + lv + ' threw: ' + (threw && threw.message));
    if (!out) return;
    check(Number.isFinite(out.s.hero.hp) && out.s.enemies.every(e => Number.isFinite(e.x) && Number.isFinite(e.y)),
      'all perks: level ' + lv + ' produced a non-finite position or HP');
  });
}

if (problems.length) { console.log('perks-combat: FAIL'); problems.forEach(p => console.log('  - ' + p)); process.exit(1); }
console.log('perks-combat: ok (str.1-4, agg.2-3, grit.1/3/4 learned and not-learned checks; no-perk runs never enter the perk paths)');
