// Level objectives (lane P, AUDIT-6 P3 + owner ask "what makes the player come back"). PURE DATA, no DOM.
// Every generated level (2..100) has one objective (P.Objectives.forLevel). Stage 5 is the boss. Stages 1-4 cycle
// the route list: index (hoodIndex + stage) % route.length, so consecutive stages never repeat a type (journey.md 4).
// Objectives never gate the exit. A done objective is a bonus goal: a results row and coins (P.Objectives.bonusFor).
// PROTO numbers until the bot table (tools/bot.js --levels) is accepted.
var P = (typeof globalThis !== 'undefined' ? globalThis : window).P || {};
(typeof globalThis !== 'undefined' ? globalThis : window).P = P;

P.CFG = P.CFG || {};
P.CFG.objectives = {
  route: ['reach', 'collect', 'escort', 'survive', 'hack', 'defend'],
  bossType: 'boss',
  types: {
    reach: { par: [170, 200, 230, 260] },                  // seconds from the level start to the gate, stages 1..4 (bot median 140-250 s)
    survive: { T: 75 },                                    // seconds to hold out until the tram arrives
    collect: { n: 5, r: 1.3, minY: 8, maxX: 3.5 },         // supply crates: count, pickup radius m, first crate m ahead, |x| max
    escort: { hp: 4, hitR: 0.6, follow: 1.8, speed: 3.8, start: 0.9 },     // civilian: seconds of contact before she dies,
                                                           // enemy reach m, follow gap m, walk speed m/s (above the hero's
                                                           // 3.2 so she keeps up), start offset m
    defend: { hp: 60, r: 4.0, uploadT: 20, hitR: 1.3, dps: 3, ahead: 14, standOff: 1.5 },   // booster: hp, upload radius m,
                                                           // upload seconds, enemy reach m, damage/s per enemy, m ahead, stand-off m
    hack: { n: 3, kinds: ['atm', 'traffic', 'shutter'], ahead: 14, gap: 22, side: 4, behind: 6 },   // terminals: count, kinds
                                                           // (no car: its alarm blast can hit the hero), first m ahead, spacing m,
                                                           // |x| m, and m behind the hero before an idle one is moved ahead
    boss: { par: 150 },                                    // seconds from the arena start to the boss kill (bonus)
  },
  // L1 idle start (P2): after `after` seconds without moving (before the first move), a runner pack enters from the right.
  idle: { after: 6, runners: 3, x: 6.4, gap: 1.2 },
  // Spot search for crates, terminals and the booster: offsets (m) tried in order around the chosen point.
  spot: { dx: [0, 1, -1, 2, -2, 3, -3, 4, -4], dy: [0, 1, -1] },
  // Coins for a done objective: base + perLevel x level index (the clear reward scales the same way).
  bonus: { base: 20, perLevel: 2 },
  // Star goals (owner ask): 1 clear, 2 no revive, 3 the objective. Level 1 has no objective, so its third star keeps
  // the HP goal (the hero ends the level with at least `hp` of max HP).
  stars: { hp: 0.5 },
};
