// Replay tiers (R1-T4 part 18): Nightmare (same levels, harder, one signature per hood) and the Night Shift daily
// (one endless run). Config only: the sim reads s.runMode and s.diff (js/sim/modes.js); no magic numbers in sim.
// Loaded after config-levels.js. Numbers marked PROTO are tuned with tools/bot.js (--mode=nightmare|nightshift).
(function (C) {
  // ---- Nightmare: a per-hood tier, unlocked when the hood is cleared on Normal. Rewards come from play only.
  // Each stat multiplier = base + lin x k (k = journey index - 1), on top of the normal difficulty (levels.js diff).
  // Applied to s.diff in js/sim/modes.js; the horde director follows s.diff.spawn like the daily modifiers do.
  C.levels.nightmare = {
    hp:    { base: 1.05, lin: 0.004 },           // PROTO enemy hp multiplier (bosses follow it through s.diff.hp, see bossShare)
    dmg:   { base: 1.20, lin: 0.004 },           // PROTO enemy damage multiplier
    spawn: { base: 1.00, lin: 0.002, cap: 2.4 }, // PROTO spawn density multiplier (cap on the total, not on the base)
    heal:  0.9,                                  // PROTO drop-heal multiplier (combat.js dropHeal reads s.diff.heal)
    bossShare: 0.6,                              // PROTO share of the multipliers a boss takes (normal levels.diff.bossShare 0.3; bosses.js)
    bossHp: 1.3,                                 // PROTO extra boss hp multiplier after the share (boss stages only; bosses.js)
    l1Spawn: 1.10,                               // PROTO L1 (istiklal, scripted) spawn multiplier: L1 has no generator
    fourthHp: 0.4,                               // fourth star: clear, no revive, lowest run HP at or above this fraction
    // One signature change per hood, through existing levers. lever: 'elite' (an extra elite at fraction v of each
    // route stage 1-4; on L1 an echo of its scripted elite), 'roster' (adds enemy type v to the stage roster; no-op
    // if the hood already has it), 'hold' (gate hold length x v on stages 1-4). Keyed by hood id (journey.js).
    sig: {
      istiklal:      { lever: 'elite',  v: 0.50 },
      galata:        { lever: 'roster', v: 'hardhat' },
      karakoy:       { lever: 'hold',   v: 1.30 },
      bridge:        { lever: 'elite',  v: 0.80 },
      eminonu:       { lever: 'roster', v: 'parkur' },
      sirkeci:       { lever: 'hold',   v: 1.25 },
      kapalicarsi:   { lever: 'roster', v: 'kasap' },
      beyazit:       { lever: 'elite',  v: 0.30 },
      kumkapi:       { lever: 'roster', v: 'hardhat' },
      saray:         { lever: 'hold',   v: 1.30 },
      halic:         { lever: 'roster', v: 'zehirli' },
      yenikapi:      { lever: 'elite',  v: 0.65 },
      samatya:       { lever: 'roster', v: 'screamer' },
      yedikule:      { lever: 'hold',   v: 1.20 },
      kazlicesme:    { lever: 'elite',  v: 0.45 },
      zeytinburnu:   { lever: 'roster', v: 'screamer' },
      bakirkoy:      { lever: 'hold',   v: 1.30 },
      bakirkoysahil: { lever: 'elite',  v: 0.55 },
      atakoysahil:   { lever: 'roster', v: 'zehirli' },
      atakoy:        { lever: 'hold',   v: 1.25 },
    },
  };

  // ---- Nightmare rewards (meta layer: js/meta/meta-modes.js and meta-data.js). Numbers are the spec's.
  C.nightmare = {
    cred: 2,            // Street Cred multiplier on the first Nightmare clear of a level (x2)
    coins: 1.5,         // coin multiplier on every Nightmare clear (x1.5)
    titleAt: 3,         // hoods with a moon badge before the optional title 'Gece Nöbetçisi' (Night Watch) is granted
    starsMax: 4,        // results star row in Nightmare (Normal stays at 3)
  };

  // ---- Night Shift: one endless run per day, seeded by the date (js/meta/meta-nightshift.js). Ends on death (one
  // revive) or at the time cap. Score = survival seconds + kills x kill + Adrenalin x level; local best only.
  C.nightshift = {
    capS: 720,                    // 12 min: the run ends as a win (shift over) at this run time
    reviveN: 1,                   // revives allowed in one run (the normal revive offer, once)
    ramp: { perSec: 0.005, cap: 3.0 },  // PROTO spawn density ramp: x(1 + perSec x run seconds), capped (sim/modes.js spawnMul). Bot round r2 (REVIEW T4 part 18)
    score: { survive: 1, kill: 0.5, level: 10 },   // score per second alive, per kill, per Adrenalin level
    dayMods: 2,                   // daily modifiers shown on the entry card (the D.MODS pool minus 'iron')
    coins: 60,                    // coins paid by the first run of the day (fixed), plus the streak chest. Coins only: daily pay is never power (retention.md 3.6, D-065)
    streakCoins: 10,              // extra coins per streak day, capped at streakDaysMax
    streakDaysMax: 7,
    names: { adj: 8, noun: 8 },   // seed name word counts (strings-modes.js: ns.name.a0..a7, ns.name.n0..n7)
    leaderboardHook: 'nsi.nightshift.board',   // documented leaderboard hook: a later build posts the best score here
  };
})(P.CFG);
