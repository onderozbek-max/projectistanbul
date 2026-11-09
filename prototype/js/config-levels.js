// Defs for journey levels 2..100 (workstream E2): new enemy types, bosses, generator and difficulty.
// Extends P.CFG. Sources: CC = docs/content-catalog.md (brute, spitter), GD = docs/game-design.md.
// "PROTO" = value the docs leave unspecified (tuned with tools/bot.js).
(function (C) {
  var E = C.enemies;

  // ---- regular enemies (budget = spawn-director cost, CC 5) ----
  E.spitter = {                                                          // CC 5: keeps 5 m, spit every 3 s
    hp: 15, speed: 1.1, contact: 4, radius: 0.42, xp: 4, kbResist: 0, budget: 3.0,
    keep: 5.5, band: 1.0, minRange: 3.5, range: 9, strafeMul: 0.9, strafeTime: 2.2,
    cd: 3.0, windup: 0.7, flight: 0.9,
    glob: { dmg: 4, r: 1.0, puddleT: 3.0, puddleDps: 1.5 },              // acid puddle: 3 s (task brief)
  };
  E.brute = {                                                            // CC 5: slow tank, charge + telegraph
    hp: 80, speed: 0.9, contact: 15, radius: 0.5, xp: 10, kbResist: 0.8, budget: 8.0,
    sense: 7, windup: 0.8, chargeDist: 8, chargeSpeed: 7.5, chargeCd: 6, chargeDmg: 14, chargeKb: 2.0, laneW: 1.6,
    shove: 3.0, recover: 0.6,
    stompRange: 2.6, stompCd: 5, stompR: 2.4, stompDmg: 14, stompWindup: 0.8, stompKb: 1.2,
  };
  E.bloater = {                                                          // PROTO: swells, bursts, chains
    hp: 24, speed: 0.75, contact: 0, radius: 0.5, xp: 5, kbResist: 0.3, budget: 3.0,
    swellFrom: 3.5, burstR: 2.2, heroDmg: 22, enemyDmg: 30, shove: 1.2,
    cloud: { r: 1.8, t: 3.0, dps: 4.0, heroDps: 2.0 },
    mini: { hp: 14, radius: 0.36, burstR: 1.4, heroDmg: 12, enemyDmg: 18, xp: 2 },
  };

  // ---- bosses (one per hood type; scaled by hood and difficulty in levels.js) ----
  C.bosses = {
    brute: {                                                             // CC 6 style: charges, stomps, summons
      hp: 1400, speed: 0.8, contact: 14, radius: 0.9, xp: 80, kbResist: 0.95,
      windup: 0.9, laneLen: 12, laneW: 2.4, chargeSpeed: 9, chargeDmg: 18, chargeKb: 2.0,
      stomp: { r: 3.4, dmg: 16, windup: 1.0 }, summon: { n: 4, windup: 0.8, r: 3 },
      gap: 0.8, rageGap: 0.5, pause: 1.2, rageAt: 0.5, rageSpeed: 1.3, rageWindup: 0.6,
    },
    bloater: {                                                           // toxic pools, mini bloaters, belly slam
      hp: 1300, speed: 0.55, contact: 18, radius: 0.9, xp: 80, kbResist: 0.9,
      pools: { n: 3, r: 2.0, windup: 1.0, t: 6, dps: 4, span: 6 }, minis: { n: 3, windup: 0.9, r: 2.2 },
      slam: { r: 3.5, windup: 1.1, dmg: 20, shove: 2.5 }, burst: { r: 4.0, enemyDmg: 60, heroDmg: 22, cloudT: 4 },
      gap: 0.8, rageGap: 0.5, pause: 1.0, rageAt: 0.5,
    },
    spitter: {                                                           // fan spray of 5, acid rain
      hp: 1100, speed: 0.7, contact: 14, radius: 0.8, xp: 80, kbResist: 0.9,
      keep: 6, band: 1.0, gap: 0.8, rageGap: 0.5, pause: 0.8, rageAt: 0.5,
      fan: { n: 5, spread: 60, rangeMin: 4, rangeMax: 8, windup: 0.8, flight: 0.9, dmg: 6, puddleT: 3, puddleDps: 3, r: 1.1 },
      rain: { n: 8, span: 9, windup: 1.0, r: 1.2, t: 4, dps: 3 },
    },
  };

  // ---- level generator (journey levels 2..100) ----
  C.levels = {
    // Difficulty per global index k = index-1 (gentle early, steeper late). hp = 1 + lin*k + quad*k^2.
    diff: { hpLin: 0.03, hpQuad: 0.0002, dmgLin: 0.006, spawnLin: 0.005, spawnCap: 2.0, xpLin: 0.04, bossHoodMul: 0.03, bossShare: 0.3 },
    // Stages 1..5 (stage 5 = boss arena). len = exit gate distance (m); holdT escalates (s).
    stages: [
      { id: 1, len: 170, rate: 1.2, holdT: 40, behind: 0.00, newShare: 0.25, elites: [], ambush: false, intro: true },
      { id: 2, len: 200, rate: 1.5, holdT: 50, behind: 0.10, newShare: 0.40, elites: [0.45], ambush: false },
      { id: 3, len: 230, rate: 1.7, holdT: 60, behind: 0.15, newShare: 0.55, elites: [0.60], ambush: true },
      { id: 4, len: 260, rate: 1.6, holdT: 70, behind: 0.15, newShare: 0.60, elites: [0.35], ambush: false },
      { id: 5, len: 160, rate: 0.9, behind: 0.20, newShare: 0.20, boss: true, approach: 100 },
    ],
    holdDepth: 12,                     // hold zone = last 12 m before the exit gate (PROTO)
    segRate: [0.8, 1.0, 1.2, 1.1],     // route quarters A..D spawn-rate multipliers
    holdRate: [1.6, 2.6, 3.4],         // hold phases (until 15 s, 30 s, then): rate multipliers
    holdPhaseT: [15, 30],
    holdStopBefore: 6,                 // no spawns in the last 6 s of a hold
    bossAddRate: 0.6,                  // boss-fight adds: share of stage rate
    bossAddStart: 6,                   // adds around the boss on intro
    cap: 140,                          // max alive (perf and readability)
    spawnAhead: { gap: 0.5, depth: 7 }, spawnBehind: { gap: 1.0, depth: 6 }, sideX: 6.2,
    ambush: { walkers: 8, runners: 4, x: 5.6, yMin: 2, yMax: 5 },
    introCount: 3, eliteLead: 8, crawlerTelegraph: 1.0, arenaBossAhead: 13, bossIntro: 1.6,
    civilians: { groups: 2, perGroup: 3, fleeSpeed: 4.0, life: 8 },
    // Blocks: AABB obstacles, central lane |x| < laneClear stays open for pathing.
    block: { laneClear: 1.6, sideMin: 2.2, sideMax: 6.6, slot: 9, startClear: 8, sideChance: 0.75 },
    kinds: {                       // kind -> size [w (x), h (y)] in m (F renders by kind)
      car: [1.9, 4.2], taxi: [1.9, 4.2], dolmus: [2.2, 5.0], bus: [2.6, 9.0], barrier: [3.0, 0.6],
      kiosk: [1.6, 1.6], bench: [0.6, 1.8], bin: [0.6, 0.6], planter: [1.2, 1.2], crates: [1.0, 1.0],
      tables: [1.2, 1.2], cart: [1.4, 0.9], tree: [0.8, 0.8], bollard: [0.35, 0.35],
    },
    wideKinds: ['car', 'taxi', 'dolmus', 'bus', 'kiosk', 'planter', 'crates', 'tables', 'cart'],
    smallKinds: ['bench', 'bin', 'tree', 'bollard'],
    landmarks: ['shopfront', 'cafe', 'tram_stop', 'fountain', 'lamp_row', 'bus_stop', 'kebab', 'flower_stand', 'billboard', 'tea_garden'],
    // Boss name keys per hood (strings go in strings.js; fallbacks below are used if a key is missing).
    names: {
      'boss.istiklal': { tr: 'Hamal Dev', en: 'Giant Porter' },
      'boss.galata': { tr: 'Kasap Hasan', en: 'Butcher Hasan' },
      'boss.karakoy': { tr: 'Pehlivan', en: 'The Wrestler' },
      'boss.bridge': { tr: 'Balon Adam', en: 'Balloon Man' },
      'boss.eminonu': { tr: 'Demirci Kemal', en: 'Blacksmith Kemal' },
      'boss.sirkeci': { tr: 'Tokmakçı', en: 'The Sledgehammer' },
      'boss.kapalicarsi': { tr: 'Tellal Nuri', en: 'Auctioneer Nuri' },
      'boss.beyazit': { tr: 'Güvercin Amca', en: 'Uncle Pigeon' },
      'boss.laleli': { tr: 'Valiz Ahmet', en: 'Suitcase Ahmet' },
      'boss.aksaray': { tr: 'Şoför Rıza', en: 'Driver Rıza' },
      'boss.kumkapi': { tr: 'Tuzlu Ağa', en: 'Salty Lord' },
      'boss.yenikapi': { tr: 'Limancı Ali', en: 'Harbor Ali' },
      'boss.samatya': { tr: 'Teyze Zehra', en: 'Auntie Zehra' },
      'boss.yedikule': { tr: 'Bahçıvan Kadir', en: 'Gardener Kadir' },
      'boss.zeytinburnu': { tr: 'Kazan Hüseyin', en: 'Cauldron Hüseyin' },
      'boss.kazlicesme': { tr: 'Mangal Fatma', en: 'Grill Fatma' },
      'boss.bakirkoy': { tr: 'Manav Ramazan', en: 'Greengrocer Ramazan' },
      'boss.bakirkoysahil': { tr: 'Şişme Can', en: 'Inflatable Can' },
      'boss.atakoysahil': { tr: 'Kaptan Osman', en: 'Captain Osman' },
      'boss.atakoy': { tr: 'Muhtar Sadık', en: 'Headman Sadık' },
    },
  };
  // Spawn-director budget cost for types without a `budget` field (walker, runner, crawler: CC 5).
  C.budgetOf = { walker: 1.0, runner: 1.5, crawler: 1.5 };
})(P.CFG);
