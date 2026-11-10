// Defs for journey levels 2..100 (workstream E2) plus the v0.5 level events, hacking and new enemies
// (workstream B). Extends P.CFG. Sources: CC = docs/content-catalog.md, GD = docs/game-design.md.
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
  // v0.5 · Screamer (çığlıkçı): walks in, stops and screams. A ring telegraphs the call (windup); if it is still
  // alive when the windup ends, a horde of `call` walkers comes from off-screen. Killing it in the windup cancels it.
  E.screamer = {
    hp: 22, speed: 0.9, contact: 4, radius: 0.4, xp: 6, kbResist: 0.2, budget: 2.5,
    sense: 6.5, cd: 9, firstCd: 0.5, windup: 1.4, ringR: 6.0, call: 4, callR: 9, shove: 0.6,
  };
  // v0.5 · Hardhat (baretli): the helmet cuts frontal damage (hero in front of its facing); a frontal hit shoves
  // it back. Flank it (it turns slowly) or hit it from behind. The helmet falls off below helmetOffAt.
  E.hardhat = {
    hp: 42, speed: 0.95, contact: 8, radius: 0.42, xp: 6, kbResist: 0.3, budget: 2.2,
    frontalCos: 0.5, frontalMul: 0.4, frontalShove: 1.0, helmetOffAt: 0.4, turnRate: 2.5,
  };
  // v0.6 · Kasap (butcher, apron and cleaver): a slow wall. Armour cuts every hit (armour = damage multiplier).
  // Close in (within sense) it winds up a cleaver ring on the hero's spot, then swings. Never a boss add (noAdd).
  E.kasap = {
    hp: 150, speed: 0.8, contact: 16, radius: 0.55, xp: 14, kbResist: 1.0, budget: 6.0, noAdd: true, armour: 0.75,
    sense: 3.0, swingCd: 3.0, swingWindup: 0.9, swingR: 2.0, swingDmg: 18, swingKb: 0.8,
  };
  // v0.6 · Parkurcu (free-runner): fast and fragile. Crouches on a ring at the hero's spot, then leaps there.
  E.parkur = {
    hp: 16, speed: 2.6, contact: 6, radius: 0.36, xp: 5, kbResist: 0.1, budget: 2.0,
    leapMin: 2.6, leapMax: 7.0, leapCd: 2.2, windup: 0.5, leapT: 0.42, leapR: 1.0, leapDmg: 12, leapKb: 1.2,
  };
  // v0.6 · Zehirli tükürükçü (toxic spitter): the spitter's rules, but the glob bursts into a long toxic cloud.
  E.zehirli = Object.assign({}, E.spitter, {
    hp: 18, xp: 6, budget: 3.5, col: 'toxic', glob: { dmg: 4, r: 1.3, puddleT: 6.0, puddleDps: 4.0, zone: 'toxic' },
  });

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
      pools: { n: 3, r: 2.0, windup: 1.0, t: 6, dps: 3, span: 6 }, minis: { n: 3, windup: 0.9, r: 2.2 },   // pool dps 3 (was 4)
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
    bossAddRate: 1.08,                 // boss-fight adds: share of stage rate (AUDIT-6 B4: x1.8 from 0.6 for arena density)
    bossAddStart: 6,                   // adds around the boss on intro
    cap: 140,                          // max alive (perf and readability)
    spawnAhead: { gap: 0.5, depth: 7 }, spawnBehind: { gap: 1.0, depth: 6 }, sideX: 6.2,
    ambush: { walkers: 8, runners: 4, x: 5.6, yMin: 2, yMax: 5 },
    introCount: 3, eliteLead: 8, crawlerTelegraph: 1.0, arenaBossAhead: 13, bossIntro: 1.6,
    civilians: { groups: 2, perGroup: 3, fleeSpeed: 4.0, life: 8 },
    // Blocks: AABB obstacles, central lane |x| < laneClear stays open for pathing.
    block: { laneClear: 1.6, sideMin: 2.2, sideMax: 6.6, slot: 9, startClear: 8, sideChance: 0.75,
      slotJit: 6, endClear: 6, yJit: 1, sideJit: 0.8, wallEdge: 0.5 },   // street blocks: spacing and placement jitter (m)
    kinds: {                       // kind -> size [w (x), h (y)] in m (F renders by kind)
      car: [1.9, 4.2], taxi: [1.9, 4.2], dolmus: [2.2, 5.0], bus: [2.6, 9.0], barrier: [3.0, 0.6],
      kiosk: [1.6, 1.6], bench: [0.6, 1.8], bin: [0.6, 0.6], planter: [1.2, 1.2], crates: [1.0, 1.0],
      tables: [1.2, 1.2], cart: [1.4, 0.9], tree: [0.8, 0.8], bollard: [0.35, 0.35],
    },
    // v0.5 · extra roster types per hood id (added from stage 2), weight = extraShare x segment share.
    hoodExtras: {
      galata: ['screamer'], karakoy: ['hardhat'], bridge: ['screamer'], eminonu: ['hardhat'], kapalicarsi: ['screamer'],
      laleli: ['hardhat'], aksaray: ['screamer'], yenikapi: ['hardhat'], zeytinburnu: ['hardhat'],
      bakirkoy: ['screamer'], atakoy: ['screamer', 'hardhat'],
    },
    extraFrom: 2, extraShare: 0.5,
    // v0.6 · schedule: new enemy types by hood id, from stage `from` on. They join the route mix like extras.
    // Tier curve (docs/journey.md §5.1): tier 1 = H01-H04 (no new type), tier 2 = H05-H10, tier 3 = H11-H15, tier 4 = H16-H20.
    schedule: [
      { hood: 'eminonu', type: 'parkur', from: 3 }, { hood: 'kapalicarsi', type: 'kasap', from: 3 },
      { hood: 'beyazit', type: 'parkur', from: 4 }, { hood: 'aksaray', type: 'zehirli', from: 3 },
      { hood: 'samatya', type: 'kasap', from: 3 }, { hood: 'zeytinburnu', type: 'zehirli', from: 2 },
      { hood: 'yedikule', type: 'zehirli', from: 4 }, { hood: 'kumkapi', type: 'kasap', from: 4 },
      { hood: 'kazlicesme', type: 'parkur', from: 3 }, { hood: 'bakirkoy', type: 'kasap', from: 4 },
      { hood: 'bakirkoysahil', type: 'parkur', from: 2 }, { hood: 'atakoysahil', type: 'kasap', from: 2 },
      { hood: 'atakoy', type: 'parkur', from: 2 }, { hood: 'atakoy', type: 'zehirli', from: 3 }, { hood: 'atakoy', type: 'kasap', from: 4 },
      // Wave 1 (R1, audit section 10): marti (seagull thief) on the waterfront, cayci (tea carrier) in the old city, from stage 2.
      { hood: 'galata', type: 'marti', from: 2 }, { hood: 'bridge', type: 'marti', from: 2 }, { hood: 'eminonu', type: 'marti', from: 2 },
      { hood: 'kumkapi', type: 'marti', from: 2 }, { hood: 'samatya', type: 'marti', from: 2 }, { hood: 'bakirkoysahil', type: 'marti', from: 2 },
      { hood: 'atakoysahil', type: 'marti', from: 2 }, { hood: 'atakoy', type: 'marti', from: 2 },
      { hood: 'eminonu', type: 'cayci', from: 2 }, { hood: 'sirkeci', type: 'cayci', from: 2 }, { hood: 'beyazit', type: 'cayci', from: 2 },
      { hood: 'kapalicarsi', type: 'cayci', from: 2 }, { hood: 'laleli', type: 'cayci', from: 2 }, { hood: 'aksaray', type: 'cayci', from: 2 },
    ],
    extraTypes: ['screamer', 'hardhat'],   // weight extraShare x segment share
    newTypes: ['parkur', 'kasap', 'zehirli', 'marti', 'cayci'], newGrow: 0.1,   // v0.6 types (+ wave 1): same weight, times (1 + newGrow x hood index)
    // Boss names are NOT here (AUDIT-5 D-8/H2, owner 2026-11-08): one set lives in js/story/strings-story.js (spk.b.*,
    // Turkish title + canon English gloss). js/strings-journey.js copies it to boss.<hood> for the boss banner.
  };
  // Spawn-director budget cost for types without a `budget` field (walker, runner, crawler: CC 5).
  C.budgetOf = { walker: 1.0, runner: 1.5, crawler: 1.5 };

  // ---- v0.6 · affixes (js/sim/enemies2.js). Rolled on each regular generated-level spawn of a listed type, from hood
  // index `from` (0-based: 10 = H11). Rolls use the spawn stream, so hoods before `from` play exactly as before.
  C.affix = {
    list: {
      hizli: { speedMul: 1.35, col: '#5BE7FF' },                            // fast: +35% speed
      zirhli: { armour: 0.7, kbResist: 0.3, col: '#C7D0DA' },              // armoured: 30% less damage taken
      patlayan: { blastR: 1.6, heroDmg: 10, enemyDmg: 18, col: '#FF8A3D' }, // volatile: bursts on death
    },
    schedule: [
      { id: 'hizli', from: 10, chance: 0.10, types: ['walker', 'runner', 'parkur'] },
      { id: 'zirhli', from: 11, chance: 0.12, types: ['walker', 'runner', 'crawler'] },
      { id: 'patlayan', from: 15, chance: 0.10, types: ['walker', 'runner', 'crawler'] },
    ],
  };

  // ---- v0.5 level events (js/sim/events.js, events-kinds.js). Lifetimes in s, distances in m. ----
  C.ev = {
    edge: 0.6,                                         // spawn/event margin from the corridor walls and blocks (m)
    dropPop: 0.3,                                      // drop pop-in time (s)
    streakWin: 6,                                      // kills closer than this (s) keep the kill streak going
    span: [0.12, 0.82],                                // event marks spread over this fraction of the route
    hackSpot: { xMin: 3.2, xMax: 5.6, ahead: 5, jit: 3, tries: 6 },   // hack terminal beside the route (generated levels)
    coin: { rMin: 0.3, rMax: 1.2, pop: 0.2, popStep: 0.05 },   // jeton burst spread and pop timing
    telegraphT: 1.2,                                   // ambush / pier / set arrow lead time (s)
    ambush: { n: 7, x: 6.2, lead: 6, jit: 2.0, spacing: 0.45 },   // alley horde from a side street, ahead of the hero
    pier: { n: 6, x: 6.4, lead: 7, jit: 1.0, spacing: 0.5 },      // ferry arrival (Eminönü flavour)
    loot: { hp: 14, speed: 2.7, life: 16, spawnAhead: 9, xMin: 1.5, xMax: 4.5, jeton: 14, runAway: 0.7, wobbleRate: 2.5 },
    rescue: { trappers: 6, ringR: 3.2, angJit: 0.4, holdR: 2.0, holdT: 2.5, timeout: 45, jeton: 25, heal: 25,
      helperMin: 0.15, helperT: 20, helperEvery: 1.1, helperDmg: 12, helperRange: 6.5, helperKb: 0.2, xRange: 3.5, ahead: 11, simitDx: 0.3 },
    blackout: { T: 9, spawnMul: 1.25, glowR: 9 },
    car: { fuse: 4.5, blastR: 2.8, enemyDmg: 45, heroDmg: 14, fireT: 4, fireDps: 4, fireR: 2.4, trauma: 0.3, kb: 1.0, xRange: 3.5, ahead: 9 },
    gas: { r: 2.2, t: 8, dps: 4, heroDps: 3 },
    hazard: { xRange: 3.5, ahead: 9 },
    stampede: { n: 8, T: 5, speed: 3.6, lane: 6.4, pushR: 0.45, shove: 0.5, yAhead: 8.5, yJit: 3.0, vJit: 0.15 },
    barricade: { w: 12.4, h: 0.8, cx: -0.8, breakT: 3.0, holdR: 1.4, decay: 0.5, ahead: 10, exitGap: 6 },   // breakT = s of contact
    chest: { guardDist: 2.5, drop: 1, pop: 0.5, xRange: 3.0, ahead: 10 },           // guard = elite next to a chest box
    defend: { r: 2.6, T: 22, every: 4, n: 3, ringR: 7.5, expire: 40, jeton: 20, decay: 0.5, xRange: 3.0, ahead: 9, chestDx: 0.4 },
    set: { telegraphT: 1.0 },                                              // single special spawn (shop door, balcony)
    // Stage menus (generated levels). kinds: [{k, w}] picked without repeats; `pick` events per stage,
    // plus one flavour event for the hood theme from stage 2. 'hack' uses hackKinds[stage].
    mix: [
      { stage: 1, pick: 2, kinds: [{ k: 'loot', w: 3 }, { k: 'hack', w: 3 }, { k: 'chest', w: 1 }] },
      { stage: 2, pick: 2, kinds: [{ k: 'rescue', w: 3 }, { k: 'defend', w: 2 }, { k: 'stampede', w: 2 }, { k: 'hack', w: 2 }, { k: 'chest', w: 1 }] },
      { stage: 3, pick: 1, forced: ['ambush'], kinds: [{ k: 'hazard', w: 2 }, { k: 'blackout', w: 2 }, { k: 'barricade', w: 1 }, { k: 'hack', w: 2 }] },
      { stage: 4, pick: 2, kinds: [{ k: 'blackout', w: 2 }, { k: 'stampede', w: 2 }, { k: 'barricade', w: 2 }, { k: 'hazard', w: 2 }, { k: 'rescue', w: 2 }, { k: 'hack', w: 2 }] },
      { stage: 5, pick: 0, forced: ['chest'], kinds: [] },    // boss stage: the guard chest only
    ],
    // Hood flavour (one extra event from stage 2, by theme). Themes not listed get none. An entry is a name or { k, o }.
    // Each fits its hood: pier = the ferry arrival (Eminönü has a ferry pier); zeytinburnu's dye works leak gas (no car).
    // 'hack' and 'hazard' in the mix are cut down per hood in sim/levels.js (hood.hack; hazards on no-car hoods are gas).
    flavour: { bridge: 'stampede', eminonu: 'pier', bazaar: 'barricade', sahil: 'defend', zeytinburnu: { k: 'hazard', o: { sub: 'gas' } },
      yenikapi: 'blackout', kazlicesme: 'rescue', marina: 'loot', samatya: 'defend' },
    // Hack kinds per stage (generated levels). Tram and shutter are the later kinds.
    hackKinds: [['atm', 'traffic'], ['cell', 'atm', 'traffic'], ['car', 'traffic'], ['shutter', 'tram'], []],
  };

  // ---- v0.5 hacking (js/sim/hack.js). INT (hackSpeedPct) speeds it and adds bonuses from bonusAt. ----
  C.hack = {
    r: 2.4, T: 6, slowR: 3.4, slowPer: 0.35, slowMin: 0.25, decay: 0.5, tick: 0.25, bonusAt: 0.25, fadeT: 1.0,
    noise: { wave: 3, spawnMin: 9, spawnMax: 13, lureR: 12, lureT: 4 },   // hacking attracts and spawns a small wave
    atm: { coins: 8, bonus: 8, coinV: 3 },
    traffic: { r: 7, stunT: 2.5, bonusT: 1.0 },
    cell: { bars: 3 },
    shutter: { chest: 1, shortR: 4, spread: 0.4, pop: 0.5 },
    car: { lureR: 16, lureT: 6, minLured: 3, nearR: 3.5 },   // the car blows up when it ends with enough zombies near
    tram: { w: 2.8, len: 12, back: 1, dmg: 999, kb: 2.0, rushT: 0.8 },
  };

  // ---- v0.5 strings (merged into P.STR by js/view/events-fx.js; strings load later) and call subtitle times. ----
  C.levelStrings = {
    'prompt.hack': { tr: 'Bağlan · basılı tut', en: 'Link · hold' },
    'prompt.rescue': { tr: 'Kafesin yanında dur', en: 'Stay by the cage' },
    'prompt.break': { tr: 'Kır!', en: 'Smash it!' },
    'prompt.defend': { tr: 'Bölgede kal', en: 'Hold the zone' },
    'hack.atm': { tr: 'ATM', en: 'ATM' },
    'hack.traffic': { tr: 'Trafik ışığı', en: 'Traffic light' },
    'hack.cell': { tr: 'Sinyal anteni', en: 'Signal booster' },
    'hack.shutter': { tr: 'Elektrikli kepenk', en: 'Electric shutter' },
    'hack.car': { tr: 'Araba alarmı', en: 'Car alarm' },
    'hack.tram': { tr: 'Tram kumandası', en: 'Tram control' },
    'hack.done': { tr: 'BAĞLANDI', en: 'LINKED' },
    'hack.lost': { tr: 'KESİLDİ', en: 'LOST' },
    'ev.ambush': { tr: 'PUSU!', en: 'AMBUSH!' },
    'ev.loot': { tr: 'Tepsiyi yakala!', en: 'Catch the tray!' },
    'ev.rescue': { tr: 'Birini kurtar!', en: 'Rescue someone!' },
    'ev.freed': { tr: 'Kurtuldu!', en: 'Freed!' },
    'ev.blackout': { tr: 'ELEKTRİKLER GİTTİ', en: 'POWER OUT' },
    'ev.fuse': { tr: 'PATLAYACAK!', en: 'FUSE!' },
    'ev.gas': { tr: 'GAZ KAÇAĞI', en: 'GAS LEAK' },
    'ev.stampede': { tr: 'KAÇIŞ!', en: 'STAMPEDE!' },
    'ev.barricade': { tr: 'Barikatı kır', en: 'Break the barricade' },
    'ev.guard': { tr: 'Muhafızı yen', en: 'Beat the guard' },
    'ev.scream': { tr: 'ÇIĞLIK!', en: 'SCREAM!' },
    'ev.silenced': { tr: 'Sustu!', en: 'Silenced!' },
    'ev.helmet': { tr: 'Kask düştü!', en: 'Helmet off!' },
    'ev.helper': { tr: 'Yardımcı!', en: 'Helper!' },
    'ev.signal': { tr: 'SİNYAL GERİ', en: 'SIGNAL BACK' },
    'ev.tram': { tr: 'TRAM!', en: 'TRAM!' },
    'ev.ferry': { tr: 'VAPUR!', en: 'FERRY!' },
    'ev.defend': { tr: 'Dayan!', en: 'Hold!' },
    'set.bloater': { tr: 'Dombili', en: 'Bloated Waiter' },
    'set.spitter': { tr: 'Balkon tükürükçüsü', en: 'Balcony spitter' },
    'set.screamer': { tr: 'Çığlıkçı', en: 'Screamer' },
    'set.hardhat': { tr: 'Baretli', en: 'Hardhat' },
    'enemy.screamer': { tr: 'Çığlıkçı', en: 'Screamer' },
    'enemy.hardhat': { tr: 'Baretli', en: 'Hardhat' },
    'enemy.kasap': { tr: 'Kasap', en: 'Butcher' },
    'enemy.parkur': { tr: 'Parkurcu', en: 'Free-runner' },
    'enemy.zehirli': { tr: 'Zehirli tükürükçü', en: 'Toxic spitter' },
    'aff.hizli': { tr: 'Hızlı', en: 'Fast' },
    'aff.zirhli': { tr: 'Zırhlı', en: 'Armoured' },
    'aff.patlayan': { tr: 'Patlayan', en: 'Volatile' },
  };
  // Seconds a call subtitle stays up, by call id (Phase 3 rule: min(4.5, max(2.2, 0.4 + 0.058 per character of the longer of the two lines))). Fixed numbers, so
  // the timer is the same in every language and the sim never reads text. The call lines are the beats of the same id in js/dialogue/.
  C.callDurDefault = 2.6;
  C.callDur = { callA1: 3.416, callA2: 2.72, callA3: 3.996, callB1: 3.3, callB2: 3.184, callB3: 4.228, callB4: 4.5, callC1: 2.836, callC2: 4.5, callD1: 2.952, callHack1: 2.778, callHack2: 3.648 };
})(P.CFG);
