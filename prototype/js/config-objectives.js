// Level objectives (lane P, AUDIT-6 P3; v0.8 lane L per-hood assignment). PURE DATA, no DOM.
// Every generated level (2..100) has one objective (P.Objectives.forLevel). Stage 5 is the boss.
// Stages 1-4 come from `assign` (one row per hood id, four entries): a kind, or kind.variant. A variant picks its
// strings (obj.<id>.*, id = kind.variant) and its numbers (types.<kind>.v.<variant>). Each row is chosen so that:
//   - the stage's objective fits the hood (journey.md §2 and the fact table in docs/hoods-bible.md): a tram wait only
//     where a T1 or İstiklal tram runs (journey.js vehicles), a ferry wait on a pier, a Marmaray wait at a station,
//     a boat wait on a fishing quay or marina, a minibus wait where the dolmuş stops;
//   - consecutive stages in a hood never share a kind (journey.md §4).
// Objectives never gate the exit. A done objective is a bonus goal: a results row and coins (P.Objectives.bonusFor).
// PROTO numbers until the bot table (tools/bot.js --levels) is accepted.
var P = (typeof globalThis !== 'undefined' ? globalThis : window).P || {};
(typeof globalThis !== 'undefined' ? globalThis : window).P = P;

P.CFG = P.CFG || {};
P.CFG.objectives = {
  bossType: 'boss',
  // Stage objectives by hood id (stages 1..4). Level 1 (H01 stage 1) has no objective.
  assign: {
    istiklal:      ['reach', 'survive.tram', 'defend.cart', 'collect.cut'],       // tram stop wait, Kestaneci cart, tram wires
    galata:        ['collect.lamp', 'escort', 'reach', 'hack.signal'],             // lanterns, the musician, the stairs, signal box
    karakoy:       ['survive.ferry', 'collect.crate', 'hack.street', 'reach'],     // pier ferry wait, café crates, traffic light
    bridge:        ['survive.boat', 'collect.cut', 'defend.booster', 'reach'],     // boats under the deck, fishing lines
    eminonu:       ['survive.ferry', 'collect.crate', 'hack.street', 'escort'],    // quay ferry wait, spice sacks
    sirkeci:       ['survive.marmaray', 'collect.crate', 'hack.gate', 'defend.booster'], // platform train, turnstile gates
    kapalicarsi:   ['collect.crate', 'escort', 'hack.gate', 'reach'],              // carpet rolls, shutters
    beyazit:       ['survive.tram', 'collect.crate', 'defend.booster', 'hack.street'], // T1 stop, book crates
    kumkapi:       ['collect.crate', 'escort', 'survive.boat', 'reach'],           // fish crates, fishing boat quay
    saray:         ['survive.tram', 'escort', 'collect.crate', 'reach'],           // Gülhane T1 stop at the gate, a tourist escort, ticket boxes, the gate (stage 4 as the old slot)
    halic:         ['survive.boat', 'escort', 'collect.crate', 'hack.gate'],       // fishing boats under the quay, grandmother, antique crates, garage shutter
    yenikapi:      ['survive.marmaray', 'hack.signal', 'collect.lamp', 'escort'],  // Marmaray, no signal underground, power cut
    samatya:       ['survive.boat', 'escort', 'defend.booster', 'collect.charcoal'], // fishing boats (no tram), granny, charcoal
    yedikule:      ['reach', 'hack.gate', 'collect.key', 'escort'],                // garden gates, three keys
    kazlicesme:    ['survive.marmaray', 'escort', 'defend.booster', 'reach'],      // Marmaray, jogger, sprinkler lawns
    zeytinburnu:   ['survive.tram', 'collect.crate', 'hack.gate', 'defend.booster'], // T1 stop, dye crates, factory shutter
    bakirkoy:      ['survive.dolmus', 'collect.crate', 'defend.bell', 'hack.gate'], // minibus stop, lockers, school bell, arcade gate
    bakirkoysahil: ['reach', 'defend.cart', 'escort', 'hack.street'],              // ice-cream cart, promenade walker, bike light
    atakoysahil:   ['survive.boat', 'collect.crate', 'hack.signal', 'escort'],     // marina boat, dock crates, pontoon signal
    atakoy:        ['reach.home', 'escort', 'hack.gate', 'collect.key'],           // the block, neighbour, car park gate, lobby keys
  },
  types: {
    reach: { par: [170, 200, 230, 260] },                  // seconds from the level start to the gate, stages 1..4 (PROTO)
    survive: { T: 75,                                      // seconds to hold out until the vehicle arrives (default)
      v: { tram: { T: 75 }, ferry: { T: 90 }, marmaray: { T: 60 }, dolmus: { T: 45 }, boat: { T: 90 } } },
    collect: { n: 5, r: 1.3, minY: 8, maxX: 3.5,           // supply items: count, pickup radius m, first item m ahead, |x| max
      v: { cut: { n: 4 }, lamp: { n: 4 }, key: { n: 3 }, charcoal: { n: 4 } } },   // cut = fishing lines or tram wires
    escort: { hp: 4, hitR: 0.6, follow: 1.8, speed: 3.8, start: 0.9 },     // civilian: seconds of contact before she dies,
                                                           // enemy reach m, follow gap m, walk speed m/s (above the hero's
                                                           // 3.2 so she keeps up), start offset m
    defend: { hp: 60, r: 4.0, uploadT: 20, hitR: 1.3, dps: 3, ahead: 14, standOff: 1.5,   // booster: hp, upload radius m,
                                                           // upload seconds, enemy reach m, damage/s per enemy, m ahead, stand-off m
      v: { booster: {}, cart: { hp: 45, uploadT: 16 }, bell: { hp: 60, uploadT: 8 } } },
    hack: { n: 3, kinds: ['atm', 'traffic', 'shutter'], ahead: 14, gap: 22, side: 4, behind: 6,   // terminals: count, default kinds
                                                           // (a variant overrides), first m ahead, spacing m, |x| m, and m behind
                                                           // the hero before an idle one is moved ahead
      v: { street: { kinds: ['atm', 'traffic'] }, signal: { kinds: ['cell'] }, gate: { kinds: ['shutter'] } } },
    boss: { par: 150 },                                    // seconds from the arena start to the boss kill (bonus)
  },
  // L1 idle start (P2): after `after` seconds without moving (before the first move), a runner pack enters from the right.
  idle: { after: 6, runners: 3, x: 6.4, gap: 1.2 },
  // Spot search for crates, terminals and the booster: offsets (m) tried in order around the chosen point.
  spot: { dx: [0, 1, -1, 2, -2, 3, -3, 4, -4], dy: [0, 1, -1] },
  // Coins for a done objective: base + perLevel x level index (P.Objectives.bonusFor).
  bonus: { base: 20, perLevel: 2 },
  // Star goals: 1 clear, 2 no revive, 3 the objective. Level 1 has no objective, so its third star keeps
  // the HP goal (the hero ends the level with at least `hp` of max HP).
  stars: { hp: 0.5 },
};
