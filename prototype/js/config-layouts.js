// Level layouts (workstream B, AUDIT-6 B1-B4). Generated levels 2..100 only; L1 is hand-built and untouched.
// Read by js/sim/layouts.js (zones, chokepoints, centre landmarks, slots), js/sim/levels.js (block kit, boss cover)
// and the view files js/view/layouts-fx.js and js/view/layouts-centre.js. Metres unless marked. Extends P.CFG.
// Templates: plaza (open square, centre landmark, pillars), market (stall rows, alley chokepoints), chicane (shop walls
// with 2.6 m gaps), waterfront (sea on one side), bridge (narrow deck over water), arena (boss cover, per boss type).
// Each hood picks one template per stage (journey.js `layouts`, stage 5 is always the arena).
(function (C) {
  C.layouts = {
    routeFrom: 12,        // a route zone starts no earlier than this (m up the route; the hero starts at y 2)
    routeGap: 14,         // a route zone ends this far before the hold zone (m)
    maxChoke: 3,          // a chokepoint is a gap this wide or narrower (m)
    minChokes: 2,         // every route template leaves at least this many
    clear: 0.6,           // clearance kept between a new solid and the existing ones (m)
    plaza: { len: 24, pillarX: 4.0, pillarW: 1.2, pillarAt: [0.25, 0.75], landmark: 3 },
    market: { len: 40, inset: 2, row: 4.0, frontX: 6.1, unitW: 1.8, unitD: 1.6, pieceX: 0.9, pieceW: 1.4 },
    // chicane: a shop wall from the corridor edge (outer) to the gap, and a stone pier that closes the gap on the far side.
    // The pier's inner edge sits at the hero's reach (view.geoHeroHalfX 4.6 m), so the 2.6 m gap is always walkable.
    chicane: { len: 66, every: 22, outer: 7, gap: 2.6, wallT: 1.2, pierX: 5.2, pierW: 1.2 },
    waterfront: { len: 50, seaX: 3.4, reach: 7, seaSeg: 8, bollardX: 2.6, bollardW: 0.35, bollardEvery: 6,
      kioskX: -5.8, kioskW: 2.2, kioskD: 1.6, kioskEvery: 14, boatX: -0.6, boatW: 1.8, boatL: 3.4, boatAt: [0.25, 0.75] },
    bridge: { len: 50, deckHalf: 3.2, reach: 7, seaSeg: 8, postX: 1.6, postW: 0.6, postAt: [10, 28, 44] },
    // Boss arena: cover columns beside a clear centre lane (|x| < lane). n = pieces, rows of two (one per side).
    arena: { pad: 4, lane: 2.4, cover: {
      brute: { kind: 'lx_pillar', n: 6, x: 3.8 }, bloater: { kind: 'lx_truck', n: 4, x: 4.6 }, spitter: { kind: 'tables', n: 6, x: 3.2 } } },
    // Centre landmarks (3 x 3 m) on the street part of a route: one chance every `every` m, beside the centre lane.
    centre: { from: 12, every: 30, jitter: 8, chance: 0.6, offAxis: 2.6, holdGap: 8, zoneGap: 3, size: 3,
      events: [{ k: 'ambush', w: 2 }, { k: 'loot', w: 1 }, { k: 'hack', w: 2 }], hack: ['atm', 'cell', 'traffic'] },
    // Free floor spots for env props (Lane A), along the route, both sidewalks, kept clear of solids.
    slot: { every: 6, side: 5.8, clear: 1.0, max: 120 },
    // Door and window spawn points (s.layout.spawns, Lane A portals). Doors at the facade line (sideX, just beyond the
    // visible half-width), windows on the opposite side winOff m further up.
    spawn: { from: 10, every: 16, endGap: 6, sideX: 5.4, winOff: 8, clear: 0.8 },
    // Bot route hint (tools/bot.js targetOf): walk to the next chokepoint within `look` m; a choke counts as passed `passed` m past it.
    route: { look: 30, passed: 0.6 },
  };
  // Block kinds added for the layouts (sizes in metres: [w across, h along]). Same table as the street kinds.
  C.levels.kinds = Object.assign(C.levels.kinds, { lx_stall: [1.8, 1.6], lx_truck: [2.2, 5.0], lx_boat: [1.8, 3.4], lx_pillar: [1.2, 1.2] });
  C.levels.defaultKit = ['bin', 'bench', 'planter', 'crates'];   // used when a hood has no kit
})(P.CFG);
