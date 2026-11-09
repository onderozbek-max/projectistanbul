// Power lever (workstream D, AUDIT-5 F-2, owner 2026-11-08: "I want the player stronger"). PURE DATA, no DOM.
// The walk makes Arda stronger in four persistent ways. All four live in the meta layer (js/meta/meta-power.js),
// so the real game (P.Meta.loadout) and the headless bot (P.Power.expectedLoadout) read the same numbers.
//  1. Hood rank: +1 for every fully cleared hood. Derived from stars, so the save needs no new field.
//  2. Attributes: the config-stats.js layer. The expected rank grows with hoods cleared (expect.attrPerHood).
//  3. Gear: the four base items come with the walk (unlockAt in meta-data.js). Upgrades track hoods cleared.
//  4. Mastery: the main weapons gain rank per hood (expect.masteryPerHood). The effect is A's P.CFG.mastery.
// Enemy growth stays on the E2 curve (config-levels.js diff). New enemy types carry the rest (config-levels.js).
// Numbers are PROTO until the bot run in tools/bot.js is accepted (see docs/attributes.md section 7).
P.CFG = P.CFG || {};
P.CFG.power = {
  hoodRank: {
    max: 20,                    // one rank per hood (journey: 20 hoods)
    mightPct: 0.016,            // per rank: damage (multiplies every weapon, like gloves)
    maxHpPct: 0.014,             // per rank: max HP
    cooldownPct: 0.004,         // per rank: weapon cooldown reduction (sum with gear, capped by the sim)
  },
  expect: {                     // the typical player at level N, from hoods cleared before N's hood
    attrPerHood: 0.3,           // attribute rank per hood (all six attributes spread evenly)
    attrMax: 20,                // config-stats.js max
    gearPerHood: 0.6,           // gear upgrade level per hood (1..10, meta-data.js gear.maxLevel)
    masteryPerHood: 0.2,       // weapon mastery rank per hood (0..5, config-weapons2.js mastery.need)
    masteryWeapons: ['knife', 'nailgun'],   // the L1 kit weapons that the typical player levels
    ult: 'nazar',               // the ultimate the expected player brings
  },
};
