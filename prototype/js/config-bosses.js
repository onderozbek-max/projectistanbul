// Boss archetypes added in lane C (AUDIT-6 C4): taksici (taxi: charges leave an oil slick, a charge that hits a wall
// stalls it and opens a weak spot) and kasapBoss (butcher: three-swing cleaver combo with an apron weak spot after it,
// a thrown cleaver and a frenzy phase). Both have three phases (HP 100-66%, 66-33%, below 33%). Extends P.CFG.bosses.
// Hood -> archetype table (bossByHood): read by P.Bosses.archetype in bosses.js. journey.js holds the same boss per hood (check-hood-keys.js §8).
// Every telegraph keeps >= 0.8 s (DS 6). Numbers here; the sim reads only P.CFG.
(function (C) {
  // Deliberate movement and acting for the ten authored encounters. Environment attacks keep their authored axes.
  C.bossDirection = {
    cook: { settle: .15, grade: [154, 106, 73], cue: 'swish' },
    switchkeeper: { settle: .18, grade: [85, 132, 148], cue: 'rattle', flank: .31 },
    roaster: { settle: .25, grade: [168, 103, 77], cue: 'bruteStomp' },
    linekeeper: { settle: .11, grade: [99, 125, 155], cue: 'zap', flank: .30 },
    vatman: { settle: .30, grade: [169, 101, 72], cue: 'bell' },
    bellkeeper: { settle: .26, grade: [108, 129, 151], cue: 'bell', flank: .20 },
    dockBride: { settle: .12, grade: [79, 135, 146], cue: 'swish', flank: 1.02 },
    bigFisher: { settle: .22, grade: [80, 136, 154], cue: 'swish', flank: .27 },
    quayCaptain: { settle: .31, grade: [145, 111, 94], cue: 'hammer' },
    ticketMan: { settle: .13, grade: [97, 128, 157], cue: 'shutter', flank: .76 }
  };
  C.bosses.ticketMan = {
    base: 'brute', hp: 1100, speed: 1.16, contact: 13, radius: .94, xp: 95, kbResist: .94,
    armour: .79, exposedArmour: 1.29, exposeT: 2.35, gap: 1.1, pause: .72, keep: 2.6, band: .55, sideT: 1.35, phaseAt: [.62],
    introAdds: ['walker', 'runner', 'walker', 'runner'],
    phases: [{ seq: ['ticketPunch', 'stationSignal'], wm: 1, gapMul: 1, spdMul: 1 },
      { seq: ['stationSignal', 'ticketPunch'], wm: .90, gapMul: .87, spdMul: 1.12 }],
    punch: { reach: 2.0, r: 2.08, windup: 1.20, dmg: 17, kb: 1.65, reset: 1.30 },
    signals: { windup: 1.45, width: 1.90, spacing: 2.80, stagger: .46, dmg: 16, sparkT: .54, reset: .58, edge: 1.6 },
  };
  C.bosses.quayCaptain = {
    hp: 1060, speed: 1.08, contact: 13, radius: 0.97, xp: 90, kbResist: 0.94,
    armour: 0.82, exposedArmour: 1.25, exposeT: 2.0, gap: 1.14, pause: 0.75, phaseAt: [0.47],
    introAdds: ['walker', 'runner', 'walker', 'spitter'],
    phases: [{ seq: ['captainAnchor', 'captainSpice'], wm: 1, gapMul: 1, spdMul: 1 },
      { seq: ['captainSpice', 'captainAnchor', 'captainAnchor'], wm: 0.89, gapMul: 0.92, spdMul: 1.12 }],
    anchor: { windup: 1.32, reach: 8.2, extra: 1.65, min: 3.1, width: 2.04,
      throwT: 0.24, speed: 8.9, dmg: 16, kb: 1.15, reset: 1.15, stallD: 0.045 },
    spice: { windup: 1.31, between: 0.32, r: 1.3, stagger: 2.2, T: 3.1,
      hit: 9, dustDmg: 3.2, dustTick: 0.56, first: 2, last: 3 },
  };
  C.bosses.bigFisher = {
    hp: 1010, speed: 1.16, contact: 13, radius: 1, xp: 90, kbResist: 0.94,
    armour: 0.86, exposedArmour: 1.24, exposeT: 2.1, gap: 1.08, pause: 0.85, phaseAt: [0.48],
    introAdds: ['walker', 'runner', 'walker', 'spitter'],
    phases: [{ seq: ['bridgeCast', 'bridgeNet'], wm: 1, gapMul: 1, spdMul: 1 },
      { seq: ['bridgeNet', 'bridgeCast', 'bridgeCast'], wm: 0.86, gapMul: 0.91, spdMul: 1.14 }],
    cast: { windup: 1.32, reach: 12.8, w: 1.02, speed: 16, reel: 0.64, tug: 3.15,
      dmg: 13, stagger: 0.34, spread: 0.25, reset: 1.05, missReset: 1.65 },
    net: { windup: 1.38, r: 1.64, lastR: 2.24, stay: 2.55, slow: 0.55, dmg: 10 },
  };
  C.bosses.dockBride = {
    hp: 990, speed: 1.16, contact: 13, radius: 0.91, xp: 85, kbResist: 0.93,
    armour: 0.84, exposedArmour: 1.26, exposeT: 2.0, gap: 1.05, pause: 0.8, phaseAt: [0.49],
    keep: 2.45, band: 0.65, sideT: 1.2,
    phases: [{ seq: ['dockCarts', 'ropeSweep'], wm: 1, gapMul: 1, spdMul: 1 },
      { seq: ['ropeSweep', 'dockCarts', 'ropeSweep'], wm: 0.91, gapMul: 0.9, spdMul: 1.15 }],
    carts: { windup: 1.24, gap: 2.8, w: 1.8, depth: 1.3, len: 16.8, speed: 9, dmg: 16,
      crowdDmg: 40, crowdPush: 1.5, brideReset: 1.05, wreckT: .4 },
    rope: { windup: 1.28, r: 3.25, thickness: 0.54, first: 4.0, second: 6.28, T: 0.94,
      dmg: 18, reset: 1.12 },
  };
  C.bosses.bellkeeper = {
    hp: 970, speed: 1.05, contact: 13, radius: 0.98, xp: 85, kbResist: 0.93,
    armour: 0.79, exposedArmour: 1.22, exposeT: 2.35, gap: 1.24, pause: 0.80, phaseAt: [0.48],
    phases: [{ seq: ['counterweights', 'charge'], wm: 1, gapMul: 1, spdMul: 1 },
      { seq: ['counterweights', 'charge', 'counterweights'], wm: 0.93, gapMul: 0.9, spdMul: 1.07 }],
    windup: 1.15, laneLen: 7.3, laneW: 2.2, chargeSpeed: 8.4, chargeDmg: 15, chargeKb: 1.5, stall: { T: 1.28 },
    weights: { first: 2, second: 3, windup: 1.32, r: 1.15, spacing: 2.3, delay: 0.34, dmg: 15, kb: 1.05, reset: 1.65 },
  };
  C.bosses.cook = {
    base: 'kasap', hp: 450, speed: 1.03, contact: 8, radius: 0.86, xp: 20, kbResist: 0.90,
    armour: 0.68, exposedArmour: 1.25, exposeT: 1.3, gap: 1.18, pause: 0.65, phaseAt: [0.42], firstGap:.10,
    phases: [{ seq: ['combo', 'throw'], wm: 1, gapMul: 1, spdMul: 1 },
      { seq: ['throw', 'combo', 'throw'], wm: 1, gapMul: 0.85, spdMul: 1 }],
    swing: { r: 1.52, reach: 1.28, windup: [0.92, 0.84, 1.02], dmg: 8, kb: 0.55, recover: 0.32,
      approach: 2.65, stepSpeed: 3.1 },
    throw: { r: 1.08, windup: 1.05, dmg: 10, releaseAt: .48, recover: 1.30 },
  };
  C.bosses.roaster = {
    hp: 660, speed: 0.92, contact: 11, radius: 0.91, xp: 62, kbResist: 0.94,
    armour: 0.85, exposedArmour: 1.12, exposeT: 1.8, gap: 1.38, pause: 0.7, phaseAt: [0.5],
    phases: [{ seq: ['charge', 'roast'], wm: 1, gapMul: 1, spdMul: 1 },
      { seq: ['roast', 'charge', 'roast'], wm: 0.95, gapMul: 0.87, spdMul: 1.08 }],
    windup: 1.06, laneLen: 7.5, laneW: 2.38, chargeSpeed: 7.7, chargeDmg: 14, chargeKb: 1.8, stall: { T: 1.35 },
    roast: { windup: 1.18, r: 1.25, lead: 1.7, spacing: 2.15, dmg: 13 },
  };
  C.bosses.linekeeper = {
    hp: 580, speed: 2.0, contact: 10, radius: 0.86, xp: 64, kbResist: 0.93,
    armour: 0.85, exposedArmour: 1.25, exposeT: 2.05, gap: 1.16, pause: 0.85, phaseAt: [0.50], keep: 2.05, band: 0.35, sideT: 0.93, attackApproach:3.3,
    phases: [{ seq: ['arcRelay', 'arcKnot'], wm: 1, gapMul: 1, spdMul: 1 },
      { seq: ['arcKnot', 'arcRelay', 'arcKnot'], wm: 0.94, gapMul: 0.88, spdMul: 1.15 }],
    relay: { windup: 1.22, spacing: 2.65, w: 1.50, dmg: 14, sparkT: 0.50, reset: 0.60 },
    knot: { windup: 0.98, r: 2.0, dmg: 14, reset: 0.65 },
  };
  C.bosses.vatman = {
    hp: 1150, speed: 0.98, contact: 12, radius: 0.98, xp: 88, kbResist: 0.95,
    armour: 0.82, exposedArmour: 1.20, exposeT: 2.35, gap: 1.13, pause: 0.85, phaseAt: [0.52, 0.20],
    phases: [{ seq: ['districtTram', 'charge', 'vatmanBell'], wm: 1, gapMul: 1, spdMul: 1 },
      { seq: ['vatmanLever', 'charge', 'vatmanBell'], wm: 0.96, gapMul: 0.95, spdMul: 1.04 },
      { seq: ['charge', 'vatmanLever', 'charge'], wm: 0.89, gapMul: 0.85, spdMul: 1.12 }],
    windup: 1.08, laneLen: 6.4, laneW: 2.35, chargeSpeed: 9.0, chargeDmg: 16, chargeKb: 2.1, stall: { T: 2.35, coast: 2.35 },
    tram: { windup: 1.58, len: 17, w: 2.75, dmg: 19, frontLead: 3, sweep: 1.75,
      crowdDmg: 48, reset: 1.55 },
    bell: { windup: 1.18, r: 3.25, dmg: 15, reset: 1.45, approach: 4.5 }, lever: { windup: 0.94, r: 2.45, reach: 2.1, dmg: 17, reset: 0.74 },
  };
  C.bosses.switchkeeper = {
    hp: 545, speed: 1.4, contact: 10, radius: 0.9, xp: 65, kbResist: 0.95,
    armour: 0.68, exposedArmour: 1.16, exposeT: 2.05, gap: 1.12, pause: 0.65,
    sideT: 1.45, keep: 2.8, band: 0.6, phaseAt: [0.46],
    phases: [
      { seq: ['switchRails', 'switchHook'], wm: 1, gapMul: 1, spdMul: 1 },
      { seq: ['switchHook', 'switchRails', 'switchHook'], wm: 0.91, gapMul: 0.80, spdMul: 1.15 },
    ],
    hook: { reach: 2.0, r: 2.15, windup: 1.04, dmg: 13, kb: 1.3, reset: 0.72 },
    rails: { spacing: 3.1, w: 1.95, len: 16, windup: 1.38, dmg: 15, sparkT: 0.48, reset: 0.42, gap:.55 },
  };
  // The protected entrance already establishes the actor. Live combat starts with a tell, not another idle second.
  ['switchkeeper','roaster','linekeeper','vatman','bellkeeper','dockBride','bigFisher','quayCaptain','ticketMan'].forEach(function(id){
    C.bosses[id].firstGap=.10;
  });
  // Audit12: fixed encounter budgets, never inferred from the current player's build.
  var drama = {
    cook:{hp:2000,rate:0,cap:2,adds:[]}, switchkeeper:{hp:1400,rate:.13,cap:3,adds:['walker']},
    roaster:{hp:1300,rate:.14,cap:3,adds:['walker']}, linekeeper:{hp:1200,rate:.12,cap:3,adds:['runner']},
    vatman:{hp:1800,rate:.18,cap:4,adds:['walker','runner']}, bellkeeper:{hp:2300,rate:.16,cap:4,adds:['walker']},
    dockBride:{hp:2300,rate:.16,cap:4,adds:['walker','runner']}, bigFisher:{hp:1750,rate:.12,cap:3,adds:['walker']},
    quayCaptain:{hp:1700,rate:.14,cap:4,adds:['walker','runner']}, ticketMan:{hp:3000,rate:.18,cap:4,adds:['runner','walker']}
  };
  Object.keys(drama).forEach(function(id){var b=C.bosses[id],d=drama[id];b.hp=d.hp;b.encounter=d;b.introAdds=[];});
  var arrivals={switchkeeper:[-.8,5.2],roaster:[1.1,5.8],linekeeper:[1.6,4.8],vatman:[0,5.4],
    bellkeeper:[-.9,5.6],dockBride:[.6,5.5],bigFisher:[0,5.8],quayCaptain:[-1,6],ticketMan:[1.1,5.2]};
  Object.keys(arrivals).forEach(function(id){C.bosses[id].arrival={x:arrivals[id][0],ahead:arrivals[id][1]};});
  C.bosses.bigFisher.attackApproach=6.2;
  C.bosses.bigFisher.cast.missReset=2.2;
  C.bosses.ticketMan.exposedArmour=1.55;
  C.bossCrowd={peelT:5.5,peelRadius:9,side:4.8,back:3.4,near:7};
  C.bosses.cook.exposeT=2.0;
  C.bosses.cook.swing.recover=.40;
  C.bosses.cook.throw.recover=1.65;
  C.bosses.cook.pursueT=5.0;
  C.bosses.cook.pocket={lead:3.8,minY:206,maxY:220};
  C.bosses.cook.phases[1].seq=['combo','throw'];
  C.bosses.ticketMan.punch.reset=2.0;
  C.bosses.dockBride.carts.brideReset=2.25;
  C.bosses.dockBride.carts.sourceAhead=3.4;
  C.bosses.dockBride.carts.bridePush=8;
  C.bosses.dockBride.rope.approach=3.2;
  C.bosses.dockBride.rope.pursueT=4;
  C.bosses.dockBride.carts.reset=1.65;
  C.bosses.dockBride.rope.slackT=.8;
  C.bosses.dockBride.arrival.x=2.8;
  C.bosses.vatman.tram.alternate=[-2.4,2.4,0];
  C.bosses.quayCaptain.mooringShift=1.2;
  C.bosses.ticketMan.keep=1.9;
  C.bosses.ticketMan.band=.35;
  C.bosses.bellkeeper.weights.reset=2.25;
  C.bosses.roaster.stall.coast=1.9;
  C.bosses.roaster.exposeT=1.9;
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
    swing: { r: 1.9, reach: 1.6, windup: [0.8, 0.8, 0.8], dmg: 12, kb: 0.8, recover: 0.3 },   // combo of three (each >= 0.8 s); dmg 16 -> 12 (boss-arena pass)
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
