// Run modifiers (lane P, AUDIT-6 P4): "a hood feels different tonight". PURE DATA, no DOM.
// A modifier applies to one generated level, chosen by hood and stage (P.Modifiers.forLevel). Stage 1 and the boss
// stage never have one. Effects are sim numbers: moveMul (hero speed), spawnMul (route spawn rate), xpMul (XP per
// kill, which is the XP gem value), dark (view only: the night tint in objectives-hud.js).
// Name keys: hmod.<id>.name and hmod.<id>.desc (strings-progress.js).
var P = (typeof globalThis !== 'undefined' ? globalThis : window).P || {};
(typeof globalThis !== 'undefined' ? globalThis : window).P = P;

P.CFG = P.CFG || {};
P.CFG.modifiers = {
  defs: {
    rain: { moveMul: 0.9, spawnMul: 1, xpMul: 1.15, dark: false },   // Yağmur: -10% speed, +15% XP
    crowd: { moveMul: 1, spawnMul: 1.5, xpMul: 1.3, dark: false },   // Kalabalık: +50% spawns, +30% XP
    quiet: { moveMul: 1, spawnMul: 1, xpMul: 1.25, dark: true },     // Sessiz gece: dark street, +25% XP (gems)
  },
  // A rule applies when stage matches and hoodIndex % every === rem (hoodIndex 0..19). This is a walk-position cadence,
  // not hood content (v0.8 check: the cadence was kept when Kumkapı and Zeytinburnu moved; it is not re-keyed by id).
  rules: [
    { stage: 2, id: 'rain', every: 3, rem: 1 },
    { stage: 3, id: 'quiet', every: 2, rem: 0 },
    { stage: 4, id: 'crowd', every: 2, rem: 1 },
  ],
  // Daily modifiers (meta-daily.js; their effects arrive in loadout.modifiers, see sim/modifiers.js). Elite night: each
  // route elite brings (eliteMult - 1) more, eliteGapM further up a generated route, or echoSideM / echoAheadM beside
  // the scripted L1 elite. Every daily multiplier is clamped to [clampMin, clampMax] so a damaged save cannot zero or
  // explode a run.
  daily: { eliteGapM: 4, echoSideM: 1.6, echoAheadM: 1, clampMin: 0.1, clampMax: 5 },
};
