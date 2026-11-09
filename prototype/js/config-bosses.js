// Boss archetypes added in lane C (AUDIT-6 C4): taksici (taxi: charges leave an oil slick, a charge that hits a wall
// stalls it and opens a weak spot) and kasapBoss (butcher: three-swing cleaver combo with an apron weak spot after it,
// a thrown cleaver and a frenzy phase). Both have three phases (HP 100-66%, 66-33%, below 33%). Extends P.CFG.bosses.
// Hood -> archetype table (bossByHood): read by P.Bosses.archetype in bosses.js, so journey.js and levels.js stay as they are.
// Every telegraph keeps >= 0.8 s (DS 6). Numbers here; the sim reads only P.CFG.
(function (C) {
  C.bosses.taksici = {
    base: 'brute', hp: 1400, speed: 0.85, contact: 14, radius: 1.0, xp: 90, kbResist: 0.9,
    armour: 0.85, exposedArmour: 1.0, exposeT: 1.6,                       // weak spot: full damage while exposed
    windup: 1.0, laneLen: 10, laneW: 2.4, chargeSpeed: 9.5, chargeDmg: 16, chargeKb: 2.0,
    gap: 0.9, pause: 1.0,
    smash: { r: 2.6, reach: 2.6, windup: 1.0, dmg: 16, shove: 2.8 },      // hood smash: ring on the spot ahead of the car
    summon: { n: 3, windup: 0.9, r: 3 },                                  // honk: walkers from the car doors
    oil: { r: 1.3, t: 5, dps: 1.0, heroDps: 2.0 },                         // oil slick left where a charge ends
    stall: { T: 1.6 },                                                    // charge into a wall: stalled, exposed
    phaseAt: [0.66, 0.33],
    phases: [                                                              // seq = attack names (bosses.js), wm = windup mul, gapMul, spdMul
      { seq: ['charge', 'smash'], wm: 1.0, gapMul: 1.0, spdMul: 1.0 },
      { seq: ['charge', 'smash', 'charge', 'summon'], wm: 0.8, gapMul: 0.8, spdMul: 1.1 },
      { seq: ['charge', 'charge', 'smash', 'summon'], wm: 0.6, gapMul: 0.55, spdMul: 1.2 },
    ],
  };
  C.bosses.kasapBoss = {
    base: 'kasap', hp: 1500, speed: 0.7, contact: 16, radius: 1.0, xp: 90, kbResist: 1.0,
    armour: 0.6, exposedArmour: 1.0, exposeT: 1.6,                        // apron cut open after the combo: full damage
    gap: 0.9, pause: 1.0,
    swing: { r: 1.9, reach: 1.6, windup: [0.8, 0.55, 0.55], dmg: 16, kb: 0.8, recover: 0.3 },   // combo of three
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
  // Hood id -> boss archetype. Brute now covers 6 hoods (was 13), taksici 4, kasapBoss 3; bloater and spitter unchanged.
  C.bossByHood = {
    istiklal: 'brute', galata: 'brute', karakoy: 'brute', bridge: 'bloater', eminonu: 'taksici', sirkeci: 'kasapBoss',
    kapalicarsi: 'taksici', beyazit: 'spitter', laleli: 'kasapBoss', aksaray: 'brute', kumkapi: 'bloater', yenikapi: 'taksici',
    samatya: 'spitter', yedikule: 'brute', zeytinburnu: 'bloater', kazlicesme: 'spitter', bakirkoy: 'taksici',
    bakirkoysahil: 'bloater', atakoysahil: 'kasapBoss', atakoy: 'brute',
  };
})(P.CFG);
