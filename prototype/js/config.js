// All gameplay numbers for the Level 1 browser prototype (v0.2).
// Sources: GD = docs/game-design.md, CC = docs/content-catalog.md, LD = docs/level-001-istiklal.md,
// DS = docs/design-system.md, CODE = game/ (implemented .tres/.gd win over docs).
// "V2" = changed in the v0.2 overhaul (owner feedback + reviews/AUDIT-2026-11-08.md); see prototype/README.md.
// "PROTO" = value the docs leave unspecified.
var P = (typeof globalThis !== 'undefined' ? globalThis : window).P || {};
(typeof globalThis !== 'undefined' ? globalThis : window).P = P;

P.CFG = {
  sim: { hz: 60, maxStepsPerFrame: 4 },                                   // ARCH 4.11
  view: {
    widthM: 10, holdWidthM: 12, zoomTime: 0.6,                            // V2: closer camera (GD 2 says 12/13.5)
    aspect: 844 / 390, lookAhead: 1.5, smoothing: 0.15,                   // GD 2, LD 11
    offscreenMargin: 1.0,                                                 // PROTO
    geoHeroHalfX: 4.6,                                                    // G1: generated levels keep the hero at |x| <= 4.6 m
                                                                          //     (half of 10 m visible, minus the 0.4 m hero radius)
    spriteScale: { hero: 1.22, walker: 1.15, runner: 1.15, elite: 1.25 }, // G2: draw scale on top of each rig's own scale
                                                                          //     (collision radii are never read here)
    anim: { bobWalk: 0.05, bobIdle: 0.012, squashWalk: 0.04, stepWidth: 0.02,   // walk cycle: body bob and squash (units)
            hitSquashX: 0.14, hitSquashY: 0.12 },                              // hit squash (fraction of the pose)
    blinkHz: 1.5, blinkMinAlpha: 0.6,                                     // G5: invulnerability pulse, never above 3 per s
    contactShadow: { alpha: 0.22, radius: 0.9, aspect: 0.36 },            // G4: enemy ground shadow (x body radius)
    heroShadow: { alpha: 0.34, radius: 0.5, aspect: 0.36 },               // soft contact shadow under the hero
    crowdRing: { spitter: '#C6F04A', bloater: '#FF8A3D' },                 // G4: coloured base ring for readable crowds
    eliteOutline: { color: '#FFC93C', units: 0.05 },                      // G4: gold outline on elites (units of figure height)
    ao: { spread: [0.34, 0.18, 0.05], alpha: [0.10, 0.13, 0.16], dx: 0.08, dy: -0.12 }, // ground AO under props (m)
  },
  hero: {
    maxHp: 100, speed: 3.2, pickupRadius: 1.5, critChance: 0.05, critMult: 1.5,  // GD 4.1, CC 1
    radius: 0.4,                                                          // PROTO
    iframeHitFrac: 0.10, iframeTime: 0.25,                                // GD 4.3
    secondWindInvuln: 2.0,                                                // GD 3
  },
  contactInterval: 0.5,                                                   // GD 4.3
  hpScalePerMinute: 0.08,                                                 // GD 4.6, CODE
  knockbackTime: 0.15,                                                    // DS 7
  enemies: {                                                              // CC 5, CODE enm_walker.tres
    walker:  { hp: 10, speed: 1.2, contact: 5, radius: 0.35, xp: 2, kbResist: 0 },
    runner:  { hp: 6,  speed: 2.9, contact: 4, radius: 0.32, xp: 3, kbResist: 0 },
    crawler: { hp: 14, speed: 1.0, contact: 6, radius: 0.42, xp: 4, kbResist: 0.5 },  // V2 hp/xp
    diner:   { hp: 6,  speed: 1.0, contact: 4, radius: 0.35, xp: 4, kbResist: 0 },    // V2 xp
  },
  elite: { hpMult: 4, dmgMult: 1.5, scale: 1.15, xpMult: 5, kbResist: 0.6 },     // CC 5 elite variant (V3: previewed in L1)
  levelUpShock: { radius: 3.0, knockback: 1.2 },                        // V3: level-up pushes the horde back (PROTO)
  separation: { strength: 2.0, maxNeighbors: 4 },                         // CODE swarm_default.tres
  xp: { base: 5, mult: 5, exp: 1.6, magnetSpeed: 8, collectDist: 0.5 },   // GD 4.5 (V3 exp 1.4 -> 1.6: 9 cards + 2 chests)
  drops: { jetonChance: 0.05, jetonMin: 1, jetonMax: 5, simitChance: 0.005, simitHeal: 25 }, // CC 8-9
  // V2 Level 1 kit (owner feedback: "ayran, tereyağ, çatal are meaningless"). Every weapon is a distinct verb.
  weapons: {
    knife: {                                                              // signature melee arc (replaces Fork)
      cooldown: 0.75, knockback: 0.6,
      levels: [
        { dmg: 14, range: 1.8, arcDeg: 100, back: false },
        { dmg: 19, range: 1.8, arcDeg: 100, back: false },
        { dmg: 19, range: 1.8, arcDeg: 100, back: true },
        { dmg: 19, range: 2.3, arcDeg: 120, back: true },
        { dmg: 30, range: 2.3, arcDeg: 170, back: true },
      ],
    },
    nailgun: {                                                            // auto-aim piercing shots (new)
      cooldown: 0.6, seekRange: 7.5, speed: 20, life: 0.5, spreadDeg: 9, knockback: 0.15,
      levels: [
        { dmg: 8,  shots: 1, pierce: 1, cdMult: 1 },
        { dmg: 8,  shots: 2, pierce: 1, cdMult: 1 },
        { dmg: 11, shots: 2, pierce: 2, cdMult: 1 },
        { dmg: 11, shots: 3, pierce: 2, cdMult: 1 },
        { dmg: 14, shots: 3, pierce: 3, cdMult: 0.7 },
      ],
    },
    canister: {                                                           // lobbed AoE (replaces Tea Glass)
      cooldown: 2.4, seekRange: 6.5, flightTime: 0.6, knockback: 1.0, fireTime: 2.5, fireDps: 10,
      levels: [
        { dmg: 24, proj: 1, blast: 1.5, fire: false },
        { dmg: 24, proj: 2, blast: 1.5, fire: false },
        { dmg: 24, proj: 2, blast: 1.9, fire: false },
        { dmg: 24, proj: 3, blast: 1.9, fire: false },
        { dmg: 34, proj: 3, blast: 1.9, fire: true },
      ],
    },
    chain: {                                                              // orbiting bike chain (new)
      hitInterval: 0.45, knockback: 0.35,
      levels: [
        { dmg: 9,  blades: 1, radius: 1.5, speed: 3.4 },
        { dmg: 9,  blades: 2, radius: 1.5, speed: 3.4 },
        { dmg: 9,  blades: 2, radius: 1.9, speed: 3.4 },
        { dmg: 9,  blades: 3, radius: 1.9, speed: 3.4 },
        { dmg: 15, blades: 3, radius: 1.9, speed: 4.4 },
      ],
    },
  },
  burn: { dps: 3, duration: 3, maxStacks: 3 },                            // GD 4.7
  passives: {                                                             // V2: each changes behavior, not just a number
    shoes:  { movePct: 0.10 },                                            // + speed trail when running
    jacket: { armorPerLevel: 1, armorCap: 3, hpFromLevel4: 15 },          // flat damage reduction, capped (audit P0-2)
    gloves: { might: 0.12, knockbackPct: 0.15 },                          // harder hits, more shove
    energy: { cdr: 0.08 },                                                // faster everything
    medkit: { healOnPick: 25, regenPerLevel: 0.6, regenDelay: 3 },        // heal now + regen when not hit for 3 s
  },
  maxItemLevel: 5,
  cards: {                                                                // GD 5.3, CODE card_offer.gd
    count: 3, wUpgradeWeapon: 3, wUpgradePassive: 3, wNewWeapon: 2.5, wNewPassive: 2,
    slotsWeapon: 6, slotsPassive: 6, fillerSimitHeal: 30, fillerJeton: 20, freeRerolls: 1,
  },
  pool: { weapons: ['knife', 'nailgun', 'canister', 'chain'], passives: ['shoes', 'jacket', 'gloves', 'energy', 'medkit'], signature: 'knife' },
  scriptedFirstCard: ['w:nailgun', 'w:knife', 'p:shoes'],                 // LD 5 t_card, V2 items
  props: {                                                                // LD 6-7
    cartHp: 30, cartRadius: 1.0, simitDrops: 2,
    chestnutBurn: { radius: 1.5, time: 5, dps: 6 },
    canister: { hp: 10, radius: 0.4, blast: 2.5, enemyDmg: 60, playerDmg: 15, trauma: 0.3 },
  },
  feel: {                                                                 // DS 6-7
    hitFlash: 0.06, hitStopCritKill: 0.05, hitStopMinGap: 0.25, stabHitStop: 0.08,
    traumaPlayerHit: 0.2, traumaDecay: 1.5, maxShakePx: 12, maxShakeDeg: 1,
    scaffoldTrauma: 0.4, levelUpSlowMo: 0.3, punchZoom: 0.03, punchTime: 0.12,
    dmgNumberLife: 0.7, dmgNumberRise: 0.6, dmgNumberMax: 40, dmgMerge: 0.2, lowHpFrac: 0.3,
    edgePulseFrac: 0.1, edgePulseAlpha: 0.25, edgePulseLife: 0.25, edgePulseGap: 0.5,  // G3: red edge pulse on a heavy hit
    heroFlashGap: 0.333,                                                  // G3: hero white flash at most 3 per s (60 ms each)
    hitSparks: 3,                                                         // G3: sparks per enemy hit (view only)
    partsMax: 500,                                                        // view: particle cap for big crowds
  },
  bark: { show: 2.5, cooldown: 14, queueExpire: 10 },                     // DS 9.3 (cooldown V2: 20 -> 14)
  rewards: { jetonBase: 40, jetonPerLevel: 6, hurdaBase: 5, firstClearMult: 2, loseKeep: 0.5 }, // GD 8.7, 3
  level: {                                                                // LD 6, design/lofi/level-001-map.svg
    corridor: { xMin: -7, xMax: 7, yMin: 0, yMax: 230 },
    room: { xMin: -10, xMax: -2, yMin: -10, yMax: 0, indoor: true },   // the restaurant interior (no gulls, no rain)
    door: { xMin: -6, xMax: -4 },
    tram: { xMin: -1.3, xMax: 1.3, yMin: 146, yMax: 158 },
    rails: [-0.7, 0.7],
    doorsRight: [15, 45, 75, 105, 135, 165, 195, 225],
    doorsLeft: [30, 60, 90, 120, 150, 180, 210],
    // indoor: B is the covered passage (pasaj), D the underpass (tünel). A and C are open street.
    segments: [ { id: 'A', y0: 0 }, { id: 'B', y0: 62, indoor: true }, { id: 'C', y0: 124 }, { id: 'D', y0: 194, indoor: true } ],
    heroStart: { x: -6.2, y: -6.5 },
    doner: { x: -3.2, y: -8.6 },                                          // V2: döner spit where Arda grabs the knife
    diners: [ { x: -4.6, y: -4.4, delay: 0 }, { x: -8.8, y: -8.6, delay: 2.5 } ],  // V2 delay 4 -> 2.5
    simitCart: { x: 5, y: 70 }, chestnutCart: { x: -4, y: 80 },
    canisters: [ { x: 4, y: 100 }, { x: -5, y: 210 }, { x: 3, y: 218 } ],
    elites: { firstY: 140, firstX: 3.5, holdT: 28 },                     // V3: one elite in C, one mid-hold, each drops a Mini Chest
    cat: { x: -6.5, y: 170 }, manhole: { x: -3, y: 176 }, catTriggerY: 165, crawlerTelegraph: 1.0,
    civilians: { groups: 4, perGroup: 3, fleeSpeed: 4.2, life: 7 },      // V2: fewer, real people (no "rain")
    grabY: 30, clusterY: 90, clusterDoorY: 105, clusterCount: 10,
    chestnutBarkY: 70,
    holdTriggerY: 200, holdTime: 60, spawnStopAt: 56, scaffoldBeat: 1.5, scaffoldY: 230,
    shutter: { xMin: 7, xMax: 8.67, yMin: 224, yMax: 228 },
    spawns: {                                                             // V2: denser, earlier, real climax
      A: { initial: 4, rate: 1.0, total: 30, packEvery: 0 },
      B: { rate: 1.6, total: 44 },
      C: { initialRunners: 3, rate: 2.2, total: 56, runnerShare: 0.25, behind: true },
      D: { phases: [ { until: 15, rate: 4.0, runner: 0.15 }, { until: 35, rate: 7.5, runner: 0.3 },
                     { until: 56, rate: 10.0, runner: 0.35 } ], visibleDoorShare: 0.5 },
      maxAheadM: 16, maxBehindM: 12, globalCap: 300,                     // GD 6
    },
    // v0.5 · level events and set pieces by hero y (or hold seconds `hold`). ev names: js/sim/events-kinds.js.
    // dy = offset from the hero's y at the moment the beat fires. Breathers scale A-D spawn rates (wave rhythm).
    beats: [
      { y: 22, ev: 'ambush', opts: { types: ['runner'], n: 5, x: 6.2 } },            // runner pack, early in A
      { y: 44, ev: 'loot' },                                                         // simit-tray runner in A
      { y: 50, ev: 'hack', opts: { kind: 'cell', x: -5.9, y: 66 } },                 // phone-shop booster (B)
      { y: 96, ev: 'set', opts: { type: 'bloater', x: 6.4, y: 112, label: 'bloater' } },   // Şişman Garson (B)
      { y: 118, ev: 'ambush', opts: { types: ['walker'], n: 7, x: -6.2 } },          // alley horde, arrow (B)
      { y: 132, ev: 'set', opts: { type: 'spitter', x: -6.0, y: 138, anchored: true, label: 'spitter' } }, // balcony (C)
      { y: 178, ev: 'blackout', opts: { T: 7 } },                                    // power cut (C)
      { y: 162, ev: 'set', opts: { type: 'hardhat', x: 5.6, dy: 5, label: 'hardhat' } },   // hardhat in C: helmet on the hero's side, flank it
      { hold: 18, ev: 'set', opts: { type: 'screamer', x: 5.8, dy: 6.5, label: 'screamer' } },   // screamer in D
    ],
    breathers: [{ from: 96, to: 104, mul: 0.4 }, { from: 124, to: 129, mul: 0.5 }, { from: 150, to: 158, mul: 0.7 }],
  },
};

P.xpNeed = function (level) {
  var c = P.CFG.xp;
  return Math.round(c.base + c.mult * Math.pow(level, c.exp));
};

P.viewHalfH = function (widthM) { return widthM * P.CFG.view.aspect / 2; };
