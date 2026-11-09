// Lane A (arena and environment) tuning: breakable cover, gas canisters, explosive cars, extinguishers, wet tiles and
// glass, live cables, door / window / manhole spawns and the weapon x terrain rules (AUDIT-6 A1-A5, W1 numbers).
// Extends P.CFG.env. Sim code (js/sim/env*.js) reads only these numbers. Times in s, distances in m, damage in hp.
(function (C) {
  C.env = {
    // ---- A1 · breakable cover: hp by block kind (levels.js kinds plus the env kinds). Dash contact hits once per dash. ----
    hp: { bin: 12, bench: 20, crates: 25, tables: 30, kiosk: 40, car: 60, taxi: 60, dolmus: 60, cart: 25, planter: 20,
      gascan: 10, extinguisher: 30 },
    dashDmg: 12,
    // Material: glass slicks (bins, kiosks, cars) and wood debris (benches, crates, tables, carts, planters).
    glassKinds: ['bin', 'kiosk', 'car', 'taxi', 'dolmus'],
    loot: { simitChance: 0.2, jetonChance: 0.5, jetonMin: 6, jetonMax: 12 },   // simit (20%) or jeton on break
    // Solid env props placed by P.Env.place (AABB, side lane only so the centre stays open).
    gas: { every: 26, chance: 0.5, w: 0.7, h: 0.7 },
    extinguisher: { every: 60, chance: 0.6, w: 0.8, h: 0.8 },
    bombShare: 0.15,                                  // share of cars that are yanan araba (burning explosive cars)
    sideMin: 1.8,                                     // env solid props sit at least this far from the centre line
    sideChance: 0.5,                                  // a solid prop lands on the left or right lane with this chance
    recPad: 0.3,                                      // breakable hit radius = half its short side + this (m)
    clashGap: 0.6, edgeGap: 0.5, endGap: 6, jitter: 2, // placement: clearance to blocks, to walls, to the gate (m)
    seedSalt: 0x51ED2701, seedStep: 40503,            // env RNG stream: seed ^ salt + level index x step
    pathCell: 0.5, pathStartY: 2,                     // path test grid (m) and the start row (y)

    // ---- A2 · explosions (gas canister, explosive car, fire, chains). Blast numbers match the L1 canister (60 / 15). ----
    fuse: { gas: 1.2, car: 1.5, fire: 0.9, chain: 0.3, ignite: 0.05 },   // telegraph before the blast (s)
    blast: { r: 2.2, enemyDmg: 60, heroDmg: 12, trauma: 0.3, kb: 1.0, fireR: 2.4, fireT: 3.5, fireDps: 4 },
    chainMargin: 0.6,                                 // a blast reaches props within r + this (m) + their half size
    cloud: { r: 1.6 },                                // gas cloud of a fusing canister (m); a molotov lights it

    // ---- A4 · wet tiles, glass and debris (slows). Hero slow is read by stepHero, enemy slow through P.Status. ----
    puddle: { r: 1.2, T: 12, heroSlow: 0.2, enemySlow: 0.25, every: 9, rMin: 2, rMax: 9, max: 4, nearCable: 0.4 },
    glass: { r: 1.4, T: 4, slow: 0.15 },
    debris: { r: 1.2, T: 3, slow: 0.15 },
    foam: { r: 2.6, T: 3, slow: 0.2, spray: 3.2 },    // extinguisher foam; spray = fire and fuse reach (m)
    slowHold: 0.3,                                    // each tick an enemy stays in a slow zone it keeps the slow this long

    // ---- W1 · weapon x terrain rules (A3). Emits envHit so weapon evolutions can read the rule. ----
    rules: {
      ignite: { r: 3, burn: 40, T: 2.5 },            // molotov onto a gas cloud: fireball, burn per enemy
      arc: { dmg: 6, n: 3, every: 0.3, range: 3.5, show: 0.4 }, // chain or sawblade over a wet tile: arcs to the nearest enemies
      lob: { r: 0.6, ids: ['canister', 'cluster'] },  // canister landing this close to an explosive car lights its fuse
    },

    // ---- A4 · live cable over a puddle: sparks telegraph a zap that shocks anyone standing in a linked puddle. ----
    cable: { chance: 0.5, len: 4, reach: 2.2, every: 3.5, telegraph: 0.8, show: 0.4, dmg: 8, stun: 0.35, heroDmg: 8, y0: 0.25, y1: 0.85,
      xMax: 3 },

    // ---- A5 · doors, windows and manholes: telegraph, then 2-4 enemies emerge within 0.6 m of the opening. ----
    portal: { telegraph: 0.6, gap: 0.2, nMin: 2, nMax: 4, ahead: 9, past: 2, behind: 12, maxActive: 2, chance: 0.6, tries: 3,
      offset: 0.6, manholeJit: 3, runnerShare: 0.3, windowEvery: 2, manholeEvery: 30, manholeX: 1.2, windowDy: 9, yStart: 8, yEnd: 10,
      doorX: 6.9, windowX: 6.6, manholeStart: 20 },
  };
})(P.CFG);
