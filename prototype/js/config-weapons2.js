// Weapon mods, signature moves, mastery, the new weapons and passives (v0.5, workstream A). Extends P.CFG; pure data.
// Deviations from the first v0.5 pass (forced Turkish props replaced by credible improvised weapons) are in
// docs/weapons-skills.md. Every weapon has six mods: an L3 fork (A or B) and an L5 fork (A1/A2 under A, B1/B2 under B).
// Mastery rank 3 adds a third option, "usta" (generic). Mod effect keys are read by mastery.js (P.Mods) and by each
// weapon family: area, dmg, cd, life, knock, shards, chain, stick, echo, burn, pierce, count, crit, bounce, slow, pull,
// push, stun, cloud, reflect, root, spin, range, reel, douse.
(function (C) {
  C.modDefs = {};
  function md(id, fx) {
    var p = id.split('.'), slot = p[1];
    C.modDefs[id] = { id: id, fam: p[0], slot: slot, lv: slot.length === 1 ? 3 : 5, branch: slot.charAt(0), fx: fx };
  }

  // ---------- mods (fam.slot). Slots: A/B at L3; A1/A2 under A and B1/B2 under B at L5. ----------
  md('knife.A', { dmg: 1.35, knock: 0.3 });            md('knife.B', { crit: { p: 0.25, mul: 2 } });
  md('knife.A1', { shards: { n: 3, dmg: 0.4, pierce: 1 } }); md('knife.A2', { chain: { p: 0.3 } });
  md('knife.B1', { echo: { delay: 0.14, mult: 0.7 } });  md('knife.B2', { slow: { m: 0.45, t: 1.4 }, dmg: 1.1 });

  md('nailgun.A', { pierce: 2, dmg: 1.2 });            md('nailgun.B', { cd: 0.6, count: 1 });
  md('nailgun.A1', { burn: 2, dmg: 1.1 });             md('nailgun.A2', { count: 3, dmg: 0.7 });
  md('nailgun.B1', { crit: { p: 0.2, mul: 2 } });      md('nailgun.B2', { slow: { m: 0.5, t: 1.5 } });

  md('canister.A', { area: 1.6, knock: 0.6 });         md('canister.B', { shards: { n: 6, dmg: 0.5, pierce: 2 } });
  md('canister.A1', { echo: { delay: 0.45, mult: 0.6 } }); md('canister.A2', { chain: { p: 0.35 } });
  md('canister.B1', { cloud: { r: 1.6, t: 3, m: 0.4 } }); md('canister.B2', { stick: { delay: 0.9, mult: 1.6 } });

  md('chain.A', { area: 1.3, dmg: 1.1 });              md('chain.B', { burn: 1, dmg: 1.05 });
  md('chain.A1', { count: 2 });                        md('chain.A2', { chain: { p: 0.3 } });
  md('chain.B1', { spin: 1.4 });                       md('chain.B2', { knock: 0.25 });

  md('sledge.A', { dmg: 1.4, area: 1.2 });             md('sledge.B', { echo: { delay: 0.35, mult: 0.8 } });
  md('sledge.A1', { shards: { n: 4, dmg: 0.6, pierce: 2 } }); md('sledge.A2', { chain: { p: 0.4 } });
  md('sledge.B1', { cd: 0.75 });                       md('sledge.B2', { cloud: { r: 2.0, t: 2.5, m: 0.5 } });

  md('molotov.A', { area: 1.6, life: 1.4 });           md('molotov.B', { count: 1, cd: 0.85 });
  md('molotov.A1', { burn: 2 });                       md('molotov.A2', { echo: { delay: 0.7, mult: 0.5 } });
  md('molotov.B1', { cloud: { r: 1.6, t: 3, m: 0.4 } }); md('molotov.B2', { shards: { n: 5, dmg: 0.5, pierce: 1 } });

  md('fireworks.A', { area: 1.5 });                    md('fireworks.B', { count: 2, cd: 0.9 });
  md('fireworks.A1', { chain: { p: 0.3 } });           md('fireworks.A2', { shards: { n: 8, dmg: 0.3, pierce: 0 } });
  md('fireworks.B1', { echo: { delay: 0.5, mult: 0.5 } }); md('fireworks.B2', { pull: 1.2 });

  md('cable.A', { dmg: 1.35, knock: 0.2 });            md('cable.B', { range: 1.4, count: 1 });
  md('cable.A1', { crit: { p: 0.25, mul: 2 } });       md('cable.A2', { slow: { m: 0.4, t: 1.5 } });
  md('cable.B1', { chain: { p: 0.4 } });               md('cable.B2', { echo: { delay: 0.25, mult: 0.5 } });

  md('speargun.A', { dmg: 1.3, pierce: 1 });           md('speargun.B', { count: 1 });
  md('speargun.A1', { pull: 1.2 });                    md('speargun.A2', { burn: 2 });
  md('speargun.B1', { cd: 0.7 });                      md('speargun.B2', { root: 1.0 });

  md('extinguisher.A', { area: 1.4 });                 md('extinguisher.B', { slow: { m: 0.25, t: 1.0 } });
  md('extinguisher.A1', { push: 2.0, knock: 0.2 });    md('extinguisher.A2', { dmg: 1.2, douse: true });
  md('extinguisher.B1', { knock: 0.35 });              md('extinguisher.B2', { echo: { delay: 0.2, mult: 0.6 } });

  md('sawblade.A', { range: 1.4, area: 1.3 });         md('sawblade.B', { count: 3, dmg: 1.3 });
  md('sawblade.A1', { echo: { delay: 0.6, mult: 0.5 } }); md('sawblade.A2', { pierce: 2 });
  md('sawblade.B1', { burn: 2 });                      md('sawblade.B2', { slow: { m: 0.5, t: 2.0 } });

  md('manhole.A', { dmg: 1.3 });                       md('manhole.B', { bounce: 2 });
  md('manhole.A1', { shards: { n: 4, dmg: 0.35, pierce: 0 } }); md('manhole.A2', { knock: 0.25 });
  md('manhole.B1', { cd: 0.7 });                       md('manhole.B2', { stun: 0.6 });

  md('torch.A', { area: 1.5, life: 1.5 });             md('torch.B', { burn: 2, dmg: 1.2 });
  md('torch.A1', { echo: { delay: 0.5, mult: 0.6 } }); md('torch.A2', { cloud: { r: 1.4, t: 2.5, m: 0.45 } });
  md('torch.B1', { shards: { n: 4, dmg: 0.4, pierce: 1 } }); md('torch.B2', { crit: { p: 0.2, mul: 2 } });

  md('olta.A', { dmg: 1.3 });                          md('olta.B', { count: 1 });
  md('olta.A1', { reel: 1.5, knock: 0.5 });            md('olta.A2', { pull: 1.0 });
  md('olta.B1', { cd: 0.7 });                          md('olta.B2', { knock: 0.4 });

  md('cardoor.A', { area: 1.4 });                      md('cardoor.B', { life: 1.5, cd: 0.8 });
  md('cardoor.A1', { dmg: 1.5, reflect: { mul: 1.5 } }); md('cardoor.A2', { knock: 0.35 });
  md('cardoor.B1', { push: 1.5 });                     md('cardoor.B2', { shards: { n: 4, dmg: 0.4, pierce: 0 } });

  md('slingshot.A', { dmg: 1.3 });                     md('slingshot.B', { count: 1 });
  md('slingshot.A1', { crit: { p: 0.3, mul: 1.5 }, knock: 0.25 }); md('slingshot.A2', { bounce: 2 });
  md('slingshot.B1', { slow: { m: 0.5, t: 1.2 } });    md('slingshot.B2', { chain: { p: 0.3 } });

  md('chainsaw.A', { area: 1.3, dmg: 1.1 });           md('chainsaw.B', { burn: 1 });
  md('chainsaw.A1', { crit: { p: 0.2, mul: 2 } });     md('chainsaw.A2', { chain: { p: 0.3 } });
  md('chainsaw.B1', { cd: 0.7 });                      md('chainsaw.B2', { slow: { m: 0.4, t: 1.0 } });

  // Fork tables per family (built from the arsenal list). Usta is offered at rank 3+ on top of the two.
  C.mods = {};
  C.arsenal.weapons.forEach(function (f) {
    C.mods[f] = { L3: [f + '.A', f + '.B'],
      L5: { A: [f + '.A1', f + '.A2'], B: [f + '.B1', f + '.B2'], U: [f + '.A1', f + '.B1'] } };
  });
  C.usta = { every: 4, dmgMul: 2, areaMul: 1.3 };   // generic third option: every 4th action doubled, wider
  C.forkRoadBoost = 1.3;   // card weight for weapon upgrades to L2 and L3 (the road to the first fork)

  // ---------- signature mastery moves (rank 5): every sigEvery-th action of the family ----------
  C.sig = {
    knife: { area: 1.6, dmg: 2.0, extra: 'spin' },      canister: { area: 2.6, dmg: 2.5, extra: 'ring' },
    nailgun: { dmg: 1.6, extra: 'ring', n: 16 },        chain: { extra: 'boost', T: 2.5, spin: 2.5 },
    sledge: { area: 1.8, dmg: 1.5, stun: 2.0, extra: 'quake' }, molotov: { area: 2.2, life: 2.0, extra: 'lake' },
    fireworks: { extra: 'rain', n: 8 },                 cable: { extra: 'storm', jumps: 12, range: 10 },
    speargun: { extra: 'triple' },                      extinguisher: { extra: 'ring', arc: 360, push: 2.0 },
    sawblade: { extra: 'bladeRing', n: 12 },            manhole: { extra: 'swarm', n: 5 },
    torch: { area: 1.8, extra: 'inferno', arc: 150 },   olta: { extra: 'leviathan', dmg: 1.5 },
    cardoor: { extra: 'wall', T: 2.0 },                 slingshot: { extra: 'volley', n: 4 },
    chainsaw: { extra: 'rampage', arc: 360, area: 1.4, dmg: 1.3, revMul: 1.5 },
  };

  C.mastery = {
    need: [300, 1500, 6000, 12000, 20000],   // lifetime kills with the weapon: ranks 1..5 (dedicated player ~250 kills per run: rank 3 near hood 6, rank 5 late)
    dmgPerRank: 0.03, cdPerRank: 0.02, thirdOptionRank: 3, sigRank: 5, sigEvery: 5,
    chainCapFrame: 6, chainCapTotal: 40, chainMaxDepth: 2, chainR: 0.9, chainDmg: 0.5,
    shardCap: 60, shardSpeed: 9, shardLife: 0.35, shardHitR: 0.3, echoCap: 40, stickCap: 8, cloudCap: 12,
    sigSlowMo: 0.3,
  };

  // ---------- new weapons (v0.5 deviations: credible improvised weapons replace the forced Turkish props) ----------
  C.weapons.sawblade = {                 // Testere Diski: a circular saw blade thrown out and back; sparks burst where it is caught
    cooldown: 2.2, speed: 9.0, hitR: 0.45, sparkR: 0.8, sparkT: 0.5, slow: 0.25, slowT: 0.8,
    hitsOut: 4, catchR: 0.35, backMul: 1.2, hitKb: 0.2, blastKb: 0.3, sparkDmg: 0.6, ringR: 3.5,
    stagger: 0.06, ringStagger: 0.03,
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.range', 'range', 'm'], ['stat.sparks', 'sparks', 'n'], ['stat.rate', 'cdMult', 'rate']],
    levels: [
      { dmg: 12, range: 5.5, sparks: 3, cdMult: 1 }, { dmg: 14, range: 6.0, sparks: 3, cdMult: 1 },
      { dmg: 17, range: 6.0, sparks: 4, cdMult: 1, bend: 0.45 }, { dmg: 20, range: 6.5, sparks: 4, cdMult: 0.9, bend: 0.75, speedMul: 1.12 },
      { dmg: 26, range: 7.0, sparks: 5, cdMult: 0.9, bend: 1.28, speedMul: 1.35 },
    ],
    unlockLevel: 1,
  };
  C.weapons.manhole = {                  // Rögar Kapağı: a heavy iron cover flung like a frisbee; bounces enemy to enemy
    cooldown: 1.8, range: 4.5, speed: 8.0, hitR: 0.4, bounceR: 3.2, kb: 0.25, catchR: 0.4, backMul: 1.2, stagger: 0.12,
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.bounces', 'bounces', 'n'], ['stat.rate', 'cdMult', 'rate']],
    levels: [
      { dmg: 9, bounces: 2, cdMult: 1, speedMul: 0.82, impactR: 0.60 },
      { dmg: 11, bounces: 3, cdMult: 1, speedMul: 1.04, impactR: 0.88, impactMul: 0.22 },
      { dmg: 13, bounces: 3, cdMult: 1, speedMul: 1.18, impactR: 1.25, impactMul: 0.36 },
      { dmg: 15, bounces: 4, cdMult: 0.9, speedMul: 1.23, impactR: 1.26, impactMul: 0.36, craterR: 1.68 },
      { dmg: 18, bounces: 5, cdMult: 0.9, speedMul: 1.28, impactR: 1.34, impactMul: 0.38, craterR: 2.18 },
    ],
    unlockLevel: 2,
  };
  C.weapons.torch = {                    // Pürmüz: a short flame jet; the scorch it leaves on the ground keeps burning
    cooldown: 2.6, jetT: 0.5, stainR: 1.1, stainT: 2.0, tick: 0.25, ticks: 2, sigTicks: 4,
    stainAt: 0.6, lingerT: 0.3, jetKb: 0.15,
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.range', 'range', 'm'], ['stat.arc', 'arcDeg', 'deg'], ['stat.rate', 'cdMult', 'rate']],
    levels: [
      { dmg: 6, range: 2.5, arcDeg: 60, cdMult: 1 }, { dmg: 7, range: 2.7, arcDeg: 70, cdMult: 1 },
      { dmg: 8, range: 2.9, arcDeg: 66, cdMult: 1, sweep: 32 }, { dmg: 9, range: 3.1, arcDeg: 68, cdMult: 0.9, sweep: 47 },
      { dmg: 9, range: 3.6, arcDeg: 72, cdMult: 0.9, sweep: 78, ticks: 3 },
    ],
    unlockLevel: 1,
  };
  C.weapons.olta = {                     // Olta: hook sticks to the nearest, reels it in and slams it down
    cooldown: 2.8, range: 6.5, castSpeed: 22, reelT: 0.5, stagger: 0.3, hitR: 0.35, slamR: 0.6,
    minCastT: 0.15, reelStop: 0.8, reelEvT: 0.1, slamKb: 0.6, dragMul: 0.38, sigLineR: 0.9, sigDmg: 0.6, sigKb: 0.3,
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.reel', 'reel', 'm'], ['stat.rate', 'cdMult', 'rate']],
    levels: [
      { dmg: 14, reel: 2.0, cdMult: 1 }, { dmg: 16, reel: 2.2, cdMult: 1 },
      { dmg: 19, reel: 2.4, cdMult: 1, spinR: 1.9, spinT: 0.44, spinMul: 0.55 },
      { dmg: 22, reel: 2.6, cdMult: 0.9, spinR: 2.35, spinT: 0.59, spinMul: 0.62, turns: 1.25 },
      { dmg: 25, reel: 3.0, cdMult: 0.9, spinR: 2.95, spinT: 0.75, spinMul: 0.7, turns: 1.75, slamMul: 1.32 },
    ],
    unlockLevel: 8,
  };
  C.weapons.cardoor = {                  // Araba Kapısı: the swung panel strikes along its arc and deflects spit
    cooldown: 4.5, trigR: 3.5, reflectR: 0.9, reflectBlastR: 1.0, reflectT: 0.35, blastKb: 0.3,
    shove: 0.77, stun: 0.38, reflectDeg: 55, minArcDeg: 360, approachSlack: 0.52,
    startDeg: 65, windup: 0.17, recovery: 0.16, panelDepth: 0.16, reHitTurns: 0.91, repeatMul: 0.42,
    toss: { windup: 0.28, flight: 0.52, range: 7.5, missRange: 3.2, radius: 1.75, radiusPerRank: 0.13, damage: 0.78 },
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.radius', 'radius', 'm'], ['stat.arc', 'arcDeg', 'deg'], ['stat.lasts', 'openT', 's'], ['stat.rate', 'cdMult', 'rate']],
    levels: [
      { dmg: 10, radius: 1.64, arcDeg: 130, openT: 0.73, cdMult: 1 },
      { dmg: 12, radius: 1.76, arcDeg: 195, openT: 0.83, cdMult: 1 },
      { dmg: 14, radius: 1.91, arcDeg: 300, openT: 0.93, cdMult: 1 },
      { dmg: 17, radius: 2.08, arcDeg: 515, openT: 1.13, cdMult: 0.9 },
      { dmg: 20, radius: 2.31, arcDeg: 900, openT: 1.47, cdMult: 0.9 },
    ],
    unlockLevel: 9,
  };
  C.weapons.slingshot = {                // Sapan: steel marbles ricochet; two marbles on one enemy in one volley is a lucky shot
    cooldown: 1.6, speed: 12, hitR: 0.3, maxBounce: 5, bounces: 3, seekR: 6, bounceR: 3.5, luckyMul: 2,
    windup: 0.16, spacing: 0.08, kb: 0.25,
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.marbles', 'marbles', 'n'], ['stat.rate', 'cdMult', 'rate']],
    levels: [
      { dmg: 9, marbles: 2, cdMult: 1 }, { dmg: 10, marbles: 2, cdMult: 1 }, { dmg: 12, marbles: 2, cdMult: 1 },
      { dmg: 14, marbles: 3, cdMult: 0.9 },
      { dmg: 16, marbles: 3, cdMult: 0.9, split: 2, splitMul: 0.48, splitRadius: 2.5 },
    ],
    unlockLevel: 4,
  };
  C.weapons.chainsaw = {                 // Motorlu Testere: revs, sweeps a short arc at the nearest enemy, grinds in ticks
    cooldown: 1.4, range: 2.2, bladeHalfDeg: 28, kb: 0.12, stallCd: 0.8, grindEvT: 0.12,
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.arc', 'arcDeg', 'deg'], ['stat.rate', 'tickGap', 'rate']],
    levels: [
      { dmg: 5, arcDeg: 80, revT: 1.0, tickGap: 0.16, cdMult: 1 },  { dmg: 6, arcDeg: 90, revT: 1.1, tickGap: 0.16, cdMult: 1 },
      { dmg: 7, arcDeg: 100, revT: 1.2, tickGap: 0.14, cdMult: 1, turns: 2 }, { dmg: 8, arcDeg: 128, revT: 1.3, tickGap: 0.14, cdMult: 0.9, turns: 2 },
      { dmg: 9, arcDeg: 360, revT: 1.5, tickGap: 0.12, cdMult: 0.9, turns: 1, round: true },
    ],
    unlockLevel: 6,
  };

  // ---------- passives (five new; each changes behaviour) ----------
  C.passives.kolonya = { healBase: 6, healPerLevel: 4, radius: 3.0 };     // level-up: heal + douse fire near Arda
  C.passives.cay = { regenPerLevel: 0.8, delay: 0.3, deadzone: 0.2 };     // regen while standing still
  C.passives.lokum = { xpPerLevel: 0.10 };                                 // +10% XP per level
  C.passives.powerbank = { cdPerLevel: 0.05, dashPerLevel: 0.08 };         // weapon and dash cooldowns
  C.passives.kask = { minHit: 12, reducePerLevel: 2, minFrac: 0.5 };      // hard hat: less from big hits (never below half)

  // ---------- ultimates (chosen in meta via loadout.ult). Unlock = journey level index. ----------
  C.ultList = ['nazar', 'convoy', 'horn'];
  C.ults = {
    nazar: { unlock: 1 },
    convoy: { unlock: 6, T: 2.6, dmg: 40, laneW: 1.1, carLen: 1.6, lanes: [-2.2, 0, 2.2], push: 1.2, slowMo: 0.3 },
    horn: { unlock: 11, T: 1.2, dmg: 22, stun: 1.8, r: 8.0, push: 2.2, slowMo: 0.3 },
    // Tackle & Stab (Kaan bond 50, R1-T5 step 4): Kaan charges dist metres at the nearest enemy in T s (shove and stun, never a boss),
    // then a stab hits everything within stabR of where he lands. Journey level 21 = after Kaan joins (L20). PROPOSED numbers.
    tackle: { unlock: 21, bond: 50, T: 0.6, dist: 8, laneW: 1.6, push: 2.0, stun: 1.0, stabR: 3.5, stabDmg: 80, stabPush: 1.6, slowMo: 0.3 },
  };
  C.debugMastery = undefined;   // lead sets from ?mastery=N: every weapon treated as that rank
})(P.CFG);
