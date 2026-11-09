// Arsenal config (workstream E1): six new weapons, five evolutions, two passives, player skills.
// Extends P.CFG. PROTO starting numbers, tuned with tools/bot.js and tools/test-arsenal.js.
// Stat formats (progression.js): n plain, m metres, s seconds, ms m/s, deg degrees, pct percent,
// bool tick/cross, rate = ref/value (fire rate), ratio = value/ref (spin speed).
(function (C) {
  C.arsenal = {
    weapons: ['knife', 'nailgun', 'canister', 'chain', 'sledge', 'molotov', 'fireworks', 'cable', 'speargun', 'extinguisher'],
    passives: ['shoes', 'jacket', 'gloves', 'energy', 'medkit', 'nazar', 'magnet'],
  };
  C.pool.weapons = C.arsenal.weapons.slice();   // config.js pool kept in sync for old readers
  C.pool.passives = C.arsenal.passives.slice();

  // Journey level index (1..100) at which an item enters the level-up card pool.
  C.unlock = {
    weapons: { knife: 1, nailgun: 1, canister: 1, chain: 1, sledge: 1, molotov: 3, extinguisher: 6, speargun: 11,
               fireworks: 16, cable: 21 },
    passives: { shoes: 1, jacket: 1, gloves: 1, energy: 1, medkit: 1, nazar: 1, magnet: 8 },
  };
  C.debugAllWeapons = false;   // lead sets true from ?arsenal=1: every item unlocked

  // Existing four: stat rows for the card UI (behaviour stays in config.js).
  C.weapons.knife.stats = [['stat.dmg', 'dmg', 'n'], ['stat.range', 'range', 'm'], ['stat.arc', 'arcDeg', 'deg'], ['stat.back', 'back', 'bool']];
  C.weapons.nailgun.stats = [['stat.dmg', 'dmg', 'n'], ['stat.shots', 'shots', 'n'], ['stat.pierce', 'pierce', 'n'], ['stat.rate', 'cdMult', 'rate']];
  C.weapons.canister.stats = [['stat.dmg', 'dmg', 'n'], ['stat.proj', 'proj', 'n'], ['stat.blast', 'blast', 'm'], ['stat.fire', 'fire', 'bool']];
  C.weapons.chain.stats = [['stat.dmg', 'dmg', 'n'], ['stat.blades', 'blades', 'n'], ['stat.radius', 'radius', 'm'], ['stat.spin', 'speed', 'ratio']];
  C.weapons.knife.heavy = false; C.weapons.canister.heavy = true;
  C.weapons.knife.unlockLevel = 1; C.weapons.nailgun.unlockLevel = 1; C.weapons.canister.unlockLevel = 1; C.weapons.chain.unlockLevel = 1;

  // ---------- new base weapons ----------
  C.weapons.sledge = {                        // Balyoz: periodic overhead slam at the best cluster
    heavy: true, cooldown: 2.8, windup: 0.5, range: 6.0, clusterR: 1.6, slamGap: 0.45,
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.radius', 'r', 'm'], ['stat.stun', 'stun', 's'], ['stat.slams', 'slams', 'n'], ['stat.rate', 'cdMult', 'rate']],
    levels: [
      { dmg: 30, r: 1.5, stun: 0.5, kb: 1.2, slams: 1, cdMult: 1 },
      { dmg: 40, r: 1.6, stun: 0.6, kb: 1.4, slams: 1, cdMult: 1 },
      { dmg: 48, r: 1.8, stun: 0.7, kb: 1.6, slams: 1, cdMult: 0.9 },
      { dmg: 56, r: 2.0, stun: 0.8, kb: 1.8, slams: 2, cdMult: 0.9 },
      { dmg: 72, r: 2.3, stun: 1.0, kb: 2.2, slams: 2, cdMult: 0.8 },
    ],
    unlockLevel: 1,
  };
  C.weapons.molotov = {                       // arcing bottle -> burning fire pool that applies Burn
    cooldown: 2.4, flight: 0.7, range: 6.5, clusterR: 1.4, burnTick: 0.5,
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.pool', 'r', 'm'], ['stat.lasts', 'life', 's'], ['stat.bottles', 'bottles', 'n'], ['stat.rate', 'cdMult', 'rate']],
    levels: [
      { dmg: 10, r: 1.3, life: 3.5, bottles: 1, cdMult: 1 },
      { dmg: 12, r: 1.4, life: 4.0, bottles: 1, cdMult: 1 },
      { dmg: 14, r: 1.6, life: 4.5, bottles: 2, cdMult: 1 },
      { dmg: 16, r: 1.8, life: 5.0, bottles: 2, cdMult: 0.9 },
      { dmg: 20, r: 2.1, life: 6.0, bottles: 3, cdMult: 0.9 },
    ],
    unlockLevel: 3,
  };
  C.weapons.fireworks = {                     // homing rockets, colourful burst AoE
    cooldown: 1.5, speed: 9, turn: 5.0, life: 2.2, seekRange: 7.5,
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.rockets', 'rockets', 'n'], ['stat.blast', 'r', 'm'], ['stat.rate', 'cdMult', 'rate']],
    levels: [
      { dmg: 12, r: 0.9, rockets: 1, cdMult: 1 },
      { dmg: 14, r: 1.0, rockets: 2, cdMult: 1 },
      { dmg: 17, r: 1.1, rockets: 2, cdMult: 1 },
      { dmg: 20, r: 1.2, rockets: 3, cdMult: 1 },
      { dmg: 26, r: 1.4, rockets: 3, cdMult: 0.85 },
    ],
    unlockLevel: 16,
  };
  C.weapons.cable = {                         // live cable: chain lightning between enemies
    cooldown: 1.6, range: 6.0, jumpR: 3.2, stunT: 0.25, boltLife: 0.18,
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.targets', 'jumps', 'n'], ['stat.stun', 'stun', 's'], ['stat.rate', 'cdMult', 'rate']],
    levels: [
      { dmg: 11, jumps: 3, stun: 0.25, cdMult: 1 },
      { dmg: 13, jumps: 4, stun: 0.25, cdMult: 1 },
      { dmg: 15, jumps: 5, stun: 0.3, cdMult: 1 },
      { dmg: 17, jumps: 6, stun: 0.3, cdMult: 0.9 },
      { dmg: 22, jumps: 8, stun: 0.35, cdMult: 0.85 },
    ],
    unlockLevel: 21,
  };
  C.weapons.speargun = {                      // harpoon: pierces in a line, pins the last one, pulls the rest
    cooldown: 2.6, range: 7.5, speed: 24, hitR: 0.35, pullM: 0.9, pinPull: 1.8, pinPullM: 0.6,
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.pierce', 'pierce', 'n'], ['stat.root', 'root', 's'], ['stat.rate', 'cdMult', 'rate']],
    levels: [
      { dmg: 14, pierce: 2, root: 1.0, cdMult: 1 },
      { dmg: 18, pierce: 2, root: 1.2, cdMult: 1 },
      { dmg: 22, pierce: 3, root: 1.4, cdMult: 1 },
      { dmg: 28, pierce: 3, root: 1.6, cdMult: 0.9 },
      { dmg: 36, pierce: 4, root: 2.0, cdMult: 0.9 },
    ],
    unlockLevel: 11,
  };
  C.weapons.extinguisher = {                  // CO2/foam cone: slows and pushes back
    cooldown: 1.7, ticks: 3, tickGap: 0.15, foamT: 1.2,
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.range', 'range', 'm'], ['stat.push', 'push', 'm'], ['stat.slow', 'slow', 'pct']],
    levels: [
      { dmg: 4, range: 2.4, arcDeg: 70, push: 1.2, slow: 0.4, slowT: 1.2, cdMult: 1 },
      { dmg: 5, range: 2.6, arcDeg: 80, push: 1.4, slow: 0.45, slowT: 1.4, cdMult: 1 },
      { dmg: 6, range: 2.9, arcDeg: 90, push: 1.6, slow: 0.5, slowT: 1.6, cdMult: 1 },
      { dmg: 8, range: 3.2, arcDeg: 100, push: 1.8, slow: 0.55, slowT: 1.8, cdMult: 0.9 },
      { dmg: 10, range: 3.6, arcDeg: 110, push: 2.2, slow: 0.65, slowT: 2.2, cdMult: 0.9 },
    ],
    unlockLevel: 6,
  };

  // ---------- evolutions (single stage; replace the base weapon in its slot) ----------
  C.evolutions = {
    cleaver:   { from: 'knife', passive: 'gloves', name: 'cleaver' },
    nailstorm: { from: 'nailgun', passive: 'energy', name: 'nailstorm' },
    cluster:   { from: 'canister', passive: 'jacket', name: 'cluster' },
    cyclone:   { from: 'chain', passive: 'shoes', name: 'cyclone' },
    finale:    { from: 'fireworks', passive: 'magnet', name: 'finale' },
  };
  C.weapons.cleaver = {                       // 360 spinning meat-cleaver cleave
    evo: true, heavy: true, from: 'knife', hitGap: 0.45,
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.radius', 'radius', 'm'], ['stat.spin', 'spinT', 's']],
    levels: [{ dmg: 34, radius: 2.4, spinT: 1.0 }],
  };
  C.weapons.nailstorm = {                     // bullet-hell fan spray
    evo: true, from: 'nailgun', cooldown: 0.24, speed: 22, life: 0.55,
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.nails', 'shots', 'n'], ['stat.arc', 'spreadDeg', 'deg'], ['stat.pierce', 'pierce', 'n']],
    levels: [{ dmg: 9, shots: 9, spreadDeg: 80, pierce: 2, kb: 0.1 }],
  };
  C.weapons.cluster = {                       // canister that splits into 3 secondary blasts
    evo: true, heavy: true, from: 'canister', cooldown: 2.2, flight: 0.6, range: 6.5, subDelay: 0.3, subR: 1.1,
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.subs', 'subs', 'n'], ['stat.blast', 'blast', 'm']],
    levels: [{ dmg: 22, proj: 2, blast: 1.6, subs: 3, subDmg: 14, subBlast: 1.0, kb: 1.0 }],
  };
  C.weapons.cyclone = {                       // wider, faster chain that drags enemies inward
    evo: true, from: 'chain', hitInterval: 0.3,
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.blades', 'blades', 'n'], ['stat.radius', 'radius', 'm'], ['stat.pull', 'pullSpeed', 'ms']],
    levels: [{ dmg: 11, blades: 4, radius: 2.3, speed: 7.0, kb: 0.3, pullR: 3.2, pullSpeed: 1.8 }],
  };
  C.weapons.finale = {                        // sky barrage of rockets raining over the screen
    evo: true, heavy: true, from: 'fireworks', cooldown: 3.0, fall: 0.7, gap: 0.09,
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.rockets', 'rockets', 'n'], ['stat.blast', 'r', 'm'], ['stat.area', 'spanX', 'm']],
    levels: [{ dmg: 22, r: 1.3, rockets: 9, spanX: 4.4, spanY: 6.2 }],
  };

  // ---------- passives ----------
  C.passives.nazar = { critPerLevel: 0.04, dodgePerLevel: 0.03, dodgeCap: 0.2 };        // crit + dodge (eye flash)
  C.passives.magnet = { radiusPerLevel: 0.6, pulseBase: 14, pulsePerLevel: 1.5, pulseMin: 6 };   // pickup radius + vacuum pulse

  // ---------- player skills ----------
  C.skills = {
    dash: { dist: 3.2, time: 0.16, iframes: 0.3, cooldown: 3.5, flickPx: 40, flickMs: 200,
            tapMs: 280, tapPx: 40, nearMissR: 0.2, nearSlowMo: 0.25 },
    ult: { perKill: 0.004, perElite: 0.03, damage: 60, push: 2.5, time: 2.0, powerMul: 1.5, cdMul: 0.6,
           padM: 1.0, slowMo: 0.25 },
    frenzy: { threshold: 60, window: 1.5, time: 6, attackSpeed: 0.4 },
    crit: { hitStop: 0.035, perSec: 4 },
  };
  C.evoCutsceneT = 1.6;
})(P.CFG);
(function (C) {
  C.status = { staggerBoss: 0.3 };   // bosses take a short stagger instead of stun/root (GD 4.7)
  C.caps = { cdr: 0.6 };             // cooldown reduction cap (GD 4.4)
})(P.CFG);
