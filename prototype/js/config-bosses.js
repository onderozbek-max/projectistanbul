// Boss archetypes added in lane C (AUDIT-6 C4): taksici (taxi: charges leave an oil slick, a charge that hits a wall
// stalls it and opens a weak spot) and kasapBoss (butcher: three-swing cleaver combo with an apron weak spot after it,
// a thrown cleaver and a frenzy phase). Both have three phases (HP 100-66%, 66-33%, below 33%). Extends P.CFG.bosses.
// Hood -> archetype table (bossByHood): read by P.Bosses.archetype in bosses.js. journey.js holds the same boss per hood (check-hood-keys.js §8).
// Every telegraph keeps >= 0.8 s (DS 6). Numbers here; the sim reads only P.CFG.
(function (C) {
  C.bosses.taksici = {
    base: 'brute', hp: 1400, speed: 0.85, contact: 14, radius: 1.0, xp: 90, kbResist: 0.9,
    armour: 0.85, exposedArmour: 1.0, exposeT: 1.6,                       // weak spot: full damage while exposed
    windup: 1.0, laneLen: 8, laneW: 2.4, chargeSpeed: 9.5, chargeDmg: 16, chargeKb: 2.0,   // laneLen 8 m (was 10): charges end in view
    gap: 0.9, pause: 1.0,
    smash: { r: 2.6, reach: 2.6, windup: 1.0, dmg: 16, shove: 2.8 },      // hood smash: ring on the spot ahead of the car
    summon: { n: 3, windup: 0.9, r: 3 },                                  // honk: walkers from the car doors
    oil: { r: 1.3, t: 5, dps: 1.0, heroDps: 2.0 },                         // oil slick left where a charge ends
    stall: { T: 1.6 },                                                    // charge into a wall: stalled, exposed
    phaseAt: [0.66, 0.33],
    phases: [                                                              // seq = attack names (bosses.js), wm = windup mul, gapMul, spdMul
      { seq: ['charge', 'charge', 'charge', 'smash'], wm: 1.0, gapMul: 1.0, spdMul: 1.0 },
      { seq: ['charge', 'smash', 'charge', 'summon'], wm: 0.8, gapMul: 0.8, spdMul: 1.1 },
      { seq: ['charge', 'charge', 'smash', 'summon'], wm: 0.6, gapMul: 0.55, spdMul: 1.2 },
    ],
  };
  C.bosses.kasapBoss = {
    base: 'kasap', hp: 1500, speed: 0.7, contact: 16, radius: 1.0, xp: 90, kbResist: 1.0,
    armour: 0.6, exposedArmour: 1.0, exposeT: 1.6,                        // apron cut open after the combo: full damage
    gap: 0.9, pause: 1.0,
    swing: { r: 1.9, reach: 1.6, windup: [0.8, 0.8, 0.8], dmg: 16, kb: 0.8, recover: 0.3 },   // combo of three (each >= 0.8 s)
    throw: { r: 1.2, windup: 1.0, dmg: 14 },                              // thrown cleaver: ring on the hero, blade flies in
    frenzy: { n: 4, span: 3, windup: 0.8, r: 1.1, dmg: 12 },
    summon: { n: 3, windup: 0.9, r: 3 },
    phaseAt: [0.66, 0.33],
    phases: [
      { seq: ['combo', 'summon'], wm: 1.0, gapMul: 1.0, spdMul: 1.0 },
      { seq: ['combo', 'throw', 'summon'], wm: 0.85, gapMul: 0.8, spdMul: 1.1 },
      { seq: ['combo', 'frenzy', 'throw'], wm: 0.7, gapMul: 0.6, spdMul: 1.2 },
    ],
  };
  // v0.8 (D-060, kasapBoss shape, new tuning only): The Docent (saray, Topkapı Sarayı) and The Antiquarian (halic,
  // Haliç–Balat). The attack names are the kasapBoss ones (sim/bosses.js): 'combo' is the three-swing arc (the tour guide's
  // umbrella sweep, the antiquarian's lamp on a chain), 'throw' the ring telegraph and flying object (an audio guide, a vase),
  // 'summon' the walkers that file in (a rally call, customers), 'frenzy' the small drops (falling stock), and 'rally' the
  // Docent's second rally call (phase 3, replaces the old flag charge; own def block, same ring telegraph). Every windup is >= 0.8 s.
  C.bosses.tourGuide = {
    base: 'brute', hp: 1450, speed: 0.75, contact: 15, radius: 1.0, xp: 90, kbResist: 1.0,
    armour: 0.6, exposedArmour: 1.0, exposeT: 1.6,                        // umbrella down after the sweep: full damage
    gap: 1.0, pause: 1.0,
    swing: { r: 1.9, reach: 1.6, windup: [0.9, 0.9, 0.9], dmg: 16, kb: 0.8, recover: 0.3 },   // umbrella sweep: three arcs (kasap reach and damage, longer windups)
    throw: { r: 1.2, windup: 1.1, dmg: 14 },                              // thrown audio guide: ring on the hero, the box flies in
    summon: { n: 3, windup: 1.0, r: 3.5 },                                // rally call: a small tour group of walkers
    rally: { n: 4, windup: 1.0, r: 3.5 },                                 // second rally call (phase 3): a bigger group; boss adds stop at D-056's 220
    phaseAt: [0.66, 0.33],
    phases: [
      { seq: ['combo', 'summon'], wm: 1.0, gapMul: 1.0, spdMul: 1.0 },
      { seq: ['combo', 'throw', 'summon'], wm: 0.85, gapMul: 0.8, spdMul: 1.1 },
      { seq: ['combo', 'rally', 'throw'], wm: 0.7, gapMul: 0.6, spdMul: 1.2 },
    ],
  };
  C.bosses.antiquarian = {
    base: 'kasap', hp: 1400, speed: 0.65, contact: 15, radius: 1.0, xp: 90, kbResist: 1.0,
    armour: 0.6, exposedArmour: 1.0, exposeT: 1.6,                        // lamp spent after its chain swing: full damage
    gap: 0.9, pause: 1.0,
    swing: { r: 1.7, reach: 1.5, windup: [0.85, 0.85, 0.85], dmg: 15, kb: 0.9, recover: 0.35 },   // lamp on a chain: three swings
    throw: { r: 1.1, windup: 1.0, dmg: 13 },                              // thrown vase: ring on the hero, shards fly in
    frenzy: { n: 5, span: 3.5, windup: 0.8, r: 1.0, dmg: 11 },            // falling stock: five small drops on the hero's area
    summon: { n: 3, windup: 0.9, r: 3 },                                  // customers from the shop door
    phaseAt: [0.66, 0.33],
    phases: [
      { seq: ['combo', 'throw'], wm: 1.0, gapMul: 1.0, spdMul: 1.0 },
      { seq: ['combo', 'throw', 'summon'], wm: 0.85, gapMul: 0.8, spdMul: 1.1 },
      { seq: ['combo', 'frenzy', 'throw'], wm: 0.7, gapMul: 0.6, spdMul: 1.2 },
    ],
  };
  // Hood id -> boss archetype. Brute covers 5 hoods, taksici 4, kasapBoss 2, tourGuide 1 (saray), antiquarian 1 (halic);
  // bloater and spitter unchanged. journey.js holds the same boss per hood (check-hood-keys.js §8).
  C.bossByHood = {
    istiklal: 'brute', galata: 'brute', karakoy: 'brute', bridge: 'bloater', eminonu: 'taksici', sirkeci: 'kasapBoss',
    kapalicarsi: 'taksici', beyazit: 'spitter', saray: 'tourGuide', halic: 'antiquarian', kumkapi: 'bloater', yenikapi: 'taksici',
    samatya: 'spitter', yedikule: 'brute', zeytinburnu: 'bloater', kazlicesme: 'spitter', bakirkoy: 'taksici',
    bakirkoysahil: 'bloater', atakoysahil: 'kasapBoss', atakoy: 'brute',
  };
})(P.CFG);
