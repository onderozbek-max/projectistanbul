// All gameplay numbers for the Level 1 browser prototype.
// Sources: GD = docs/game-design.md, CC = docs/content-catalog.md, LD = docs/level-001-istiklal.md,
// DS = docs/design-system.md, CODE = game/ (implemented .tres/.gd win over docs).
// "PROTO" marks a value the docs leave unspecified; it is a prototype choice, listed in prototype/README.md.
var P = (typeof globalThis !== 'undefined' ? globalThis : window).P || {};
(typeof globalThis !== 'undefined' ? globalThis : window).P = P;

P.CFG = {
  sim: { hz: 60, maxStepsPerFrame: 4 },                                   // ARCH 4.11
  view: {
    widthM: 12, holdWidthM: 13.5, zoomTime: 0.6,                          // GD 2, LD 7
    aspect: 844 / 390, lookAhead: 1.5, smoothing: 0.15,                   // GD 2, LD 11
    offscreenMargin: 1.0,                                                 // PROTO
  },
  hero: {
    maxHp: 100, speed: 3.2, pickupRadius: 1.5, critChance: 0.05, critMult: 1.5,  // GD 4.1, CC 1
    radius: 0.4,                                                          // PROTO (bench value)
    iframeHitFrac: 0.10, iframeTime: 0.25,                                // GD 4.3
    secondWindInvuln: 2.0,                                                // GD 3
  },
  contactInterval: 0.5,                                                   // GD 4.3
  hpScalePerMinute: 0.08,                                                 // GD 4.6, CODE
  knockbackTime: 0.15,                                                    // DS 7
  enemies: {                                                              // CC 5, CODE enm_walker.tres
    walker:  { hp: 10, speed: 1.2, contact: 5, radius: 0.35, xp: 2, kbResist: 0 },
    runner:  { hp: 6,  speed: 2.9, contact: 4, radius: 0.30, xp: 3, kbResist: 0 },  // radius PROTO
    crawler: { hp: 8,  speed: 1.0, contact: 6, radius: 0.40, xp: 2, kbResist: 0.5 }, // radius PROTO
    diner:   { hp: 6,  speed: 1.0, contact: 4, radius: 0.35, xp: 3, kbResist: 0 },   // LD 7 (hp); rest PROTO
  },
  separation: { strength: 2.0, maxNeighbors: 4 },                         // CODE swarm_default.tres
  xp: { base: 5, mult: 5, exp: 1.4, magnetSpeed: 8, collectDist: 0.5 },   // GD 4.5; magnet/collect PROTO
  drops: { jetonChance: 0.05, jetonMin: 1, jetonMax: 5, simitChance: 0.005, simitHeal: 25 }, // CC 8-9
  weapons: {
    fork: {                                                               // CC 2, GD 5.2
      cooldown: 0.8, knockback: 0.6,                                      // knockback PROTO
      levels: [
        { dmg: 12, range: 1.6, arcDeg: 60, back: false },
        { dmg: 16, range: 1.6, arcDeg: 60, back: false },
        { dmg: 16, range: 1.6, arcDeg: 60, back: true },                  // back-thrust size PROTO (mirrors front)
        { dmg: 16, range: 2.0, arcDeg: 60, back: true },
        { dmg: 24, range: 2.0, arcDeg: 120, back: true },
      ],
    },
    tea: {                                                                // CC 2
      cooldown: 2.0, seekRange: 6, flightTime: 0.55, knockback: 0.3,     // flight/knockback PROTO
      scaldTime: 1.0,
      levels: [
        { dmg: 18, proj: 1, splash: 1.2, scald: false },
        { dmg: 18, proj: 2, splash: 1.2, scald: false },
        { dmg: 18, proj: 2, splash: 1.5, scald: false },
        { dmg: 18, proj: 3, splash: 1.5, scald: false },
        { dmg: 28, proj: 3, splash: 1.5, scald: true },
      ],
    },
  },
  burn: { dps: 3, duration: 3, maxStacks: 3 },                            // GD 4.7
  passives: { sneakers: { movePct: 0.08 }, ayran: { regen: 0.3 }, butter: { might: 0.10 } }, // CC 3
  maxItemLevel: 5,
  cards: {                                                                // GD 5.3, CODE card_offer.gd
    count: 3, wUpgradeWeapon: 3, wUpgradePassive: 3, wNewWeapon: 2, wNewPassive: 2,
    slotsWeapon: 6, slotsPassive: 6, fillerSimitHeal: 30, fillerJeton: 20, freeRerolls: 1,
  },
  pool: { weapons: ['fork', 'tea'], passives: ['sneakers', 'ayran', 'butter'], signature: 'fork' }, // LD 2
  scriptedFirstCard: ['w:tea', 'w:fork', 'p:sneakers'],                   // LD 5 (t_card)
  props: {                                                                // LD 6-7
    cartHp: 30, cartRadius: 1.0, simitDrops: 2,                           // radius PROTO
    chestnutBurn: { radius: 1.5, time: 5, dps: 6 },
    canister: { hp: 10, radius: 0.4, blast: 2.5, enemyDmg: 60, playerDmg: 15, trauma: 0.3 },
  },
  feel: {                                                                 // DS 6-7
    hitFlash: 0.06, hitStopCritKill: 0.06, hitStopMinGap: 0.25, stabHitStop: 0.06,
    traumaPlayerHit: 0.2, traumaDecay: 1.5, maxShakePx: 12, maxShakeDeg: 1,
    scaffoldTrauma: 0.4, levelUpSlowMo: 0.3, punchZoom: 0.03, punchTime: 0.12,
    dmgNumberLife: 0.7, dmgNumberRise: 0.6, dmgNumberMax: 40, dmgMerge: 0.2, lowHpFrac: 0.3,
    hpTrail: 0.4,
  },
  bark: { show: 2.5, cooldown: 20, queueExpire: 10 },                     // DS 9.3; queueExpire PROTO
  rewards: { jetonBase: 40, jetonPerLevel: 6, hurdaBase: 5, firstClearMult: 2, loseKeep: 0.5 }, // GD 8.7, 3
  level: {                                                                // LD 6, design/lofi/level-001-map.svg
    corridor: { xMin: -7, xMax: 7, yMin: 0, yMax: 230 },
    room: { xMin: -10, xMax: -2, yMin: -10, yMax: 0 },
    door: { xMin: -6, xMax: -4 },
    tram: { xMin: -1.3, xMax: 1.3, yMin: 146, yMax: 158 },
    rails: [-0.7, 0.7],
    doorsRight: [15, 45, 75, 105, 135, 165, 195, 225],
    doorsLeft: [30, 60, 90, 120, 150, 180, 210],
    segments: [ { id: 'A', y0: 0 }, { id: 'B', y0: 62 }, { id: 'C', y0: 124 }, { id: 'D', y0: 194 } ],
    heroStart: { x: -6.2, y: -6.5 },
    diners: [ { x: -4.6, y: -4.4, delay: 0 }, { x: -8.8, y: -8.6, delay: 4 } ],
    simitCart: { x: 5, y: 70 }, chestnutCart: { x: -4, y: 80 },
    canisters: [ { x: 4, y: 100 }, { x: -5, y: 210 }, { x: 3, y: 218 } ],
    cat: { x: -6.5, y: 170 }, manhole: { x: -3, y: 176 }, catTriggerY: 165, crawlerTelegraph: 1.0,
    civilians: { count: 26, fleeSpeed: 4.5, life: 10 },
    grabY: 40, clusterY: 90, clusterDoorY: 105, clusterCount: 8,
    chestnutBarkY: 70,
    holdTriggerY: 200, holdTime: 60, spawnStopAt: 56, scaffoldBeat: 1.5, scaffoldY: 230,
    shutter: { xMin: 7, xMax: 8.67, yMin: 224, yMax: 228 },
    spawns: {
      A: { initial: 2, rate: 0.5, total: 16 },
      B: { rate: 1.2, total: 25 },
      C: { initialRunners: 2, rate: 1.8, total: 38, runnerShare: 8 / 38, behind: true },
      D: { phases: [ { until: 20, rate: 1.5, runner: 0 }, { until: 40, rate: 2.5, runner: 0.3 },
                     { until: 56, rate: 3.5, runner: 0.3 } ], visibleDoorShare: 0.5 },  // visibleDoorShare PROTO
      maxAheadM: 16, maxBehindM: 12, globalCap: 300,                     // GD 6; distances PROTO
    },
  },
};

P.xpNeed = function (level) {
  var c = P.CFG.xp;
  return Math.round(c.base + c.mult * Math.pow(level, c.exp));
};

P.viewHalfH = function (widthM) { return widthM * P.CFG.view.aspect / 2; };
