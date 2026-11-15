// Street Tree perk effects (R1-T5 step 2, D-059). PURE: numbers only, no DOM. Read by js/sim/perks.js and the sim hooks.
// Perk ids and costs are in config-tree.js; this file holds what each learned perk DOES. All numbers are PROPOSED.
// Rule 2 (owner, 2026-11-12): the half-an-attribute-rank cap applies to PERCENT STAT BONUSES only. Times and counts are
// exempt. Perks are utility and sidegrades, never XP or coin changes, never a revive. Base values the perks change live in
// the files named in each comment (code wins over the docs).
var P = (typeof globalThis !== 'undefined' ? globalThis : window).P || {};
(typeof globalThis !== 'undefined' ? globalThis : window).P = P;

P.CFG = P.CFG || {};
P.CFG.perks = {
  // STR
  heavyShove: 1.0,                      // str.1 Heavy Hands: extra metres a heavy-weapon hit pushes its target (weapons flagged heavy:true)
  blastShove: { r: 2.0, kb: 1.5 },      // str.2 Cart Shover: enemies within r metres OUTSIDE a canister or cart blast ring are pushed kb metres
  shockwave: { every: 8 },              // str.3 Shockwave: every Nth heavy hit sends a shove ring (ring below)
  wallBreakerStun: 0.5,                 // str.4 Wall Breaker: seconds a heavy hit stuns an armored enemy (e.armour < 1)
  // shared shove ring (str.3, agg.4): instant, no damage, no telegraph
  ring: { r: 2.2, kb: 1.5 },            // radius and push in metres
  // PACE
  slipstream: { n: 3, refund: 0.25 },   // pace.2: a dash through n or more enemies refunds this fraction of the dash cooldown, once per dash
  // pace.1 Quick Feet (a dash clears any slow on the hero), pace.3 Parkour (puddles and tea never slow the hero),
  // pace.4 Dolmus Rider (the first dash each stage has no cooldown): no numbers.
  // AGG
  hotStreak: { threshold: 50 },         // agg.1: frenzy kill streak with the perk (base 60 in config-weapons.js frenzy)
  bloodRush: { ext: 0.5, capT: 4 },     // agg.2: seconds a boss hit adds to an active frenzy; the total added per frenzy is capped
  finisher: { r: 1.5, slowT: 1.5, slowMul: 0.6 },   // agg.3: a crit kill slows enemies within r metres (speed x slowMul for slowT seconds)
  // agg.4 Last Laugh: when frenzy ends, one shove ring (ring above) at the hero.
  // INT
  // int.1 Quick Fingers: hacks are quiet (no noise wave on a started hack). int.2 Second Look: the first failed hack per run keeps its progress.
  signalBoost: { markT: 10 },           // int.3: seconds the next terminal stays marked after a cell booster
  backdoor: { mul: 1.5 },               // int.4: multiplier on the traffic-light stun and the tram crush lane length (config-levels.js hack)
  // CHA
  goodName: { holdT: 2.0 },             // cha.1: rescue hold seconds (base 2.5 in config-levels.js)
  friendlyFaces: { escortT: 5 },        // cha.2: escort contact HP seconds (base 4 in config-objectives.js)
  regular: { rerolls: 1 },              // cha.3: extra free card rerolls per run (base cards.freeRerolls in config.js)
  neighbourhood: { helpT: 10 },         // cha.4: every rescue gets a helper for this many seconds, even below the civHelpPct gate
  // GRIT
  thickSkin: { stunT: 0.5 },            // grit.1: the first contact hit per run stuns its attacker this many seconds
  teaBreak: { delay: 2 },               // grit.2: medkit regen delay in seconds (base 3 in config.js medkit regenDelay)
  ironStomach: { simitHeal: 5 },        // grit.3: extra HP per simit (base simitHeal 25 in config.js)
  stubborn: { hpFrac: 0.2, pullR: 5 },  // grit.4: at or below hpFrac of max HP, healing drops are pulled to the hero from pullR metres (base pickup radius 1.5 m). Never a revive.
  C_mark: { ringMul: 1.35, lineW: 3, arrowH: 0.6, arrowW: 0.5, col: 'rgba(255,255,255,', a: 0.95 },   // int.3 marker (view/perk-mark.js): ring = hack.r x ringMul; lineW px; arrow in m
};
