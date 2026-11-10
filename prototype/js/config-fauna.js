// Thief looks and ambient fauna (R1 birds-cats, audit section 13 answer 1). View only: the simulation never reads these numbers
// (config-feel.js is the same kind of file). Looks follow hood geography: seaside hoods get the seagull, inland hoods the pigeon.
// Every hood id (js/journey.js) is in exactly one list; tools/test-enemy-behaviors.js checks it. Ambient birds and cats are
// in every hood, cosmetic only: never enemies, never damage, never in the sim state. Taste dials, not gameplay values.
(function (C) {
  C.birdLook = {
    seagull: ['galata', 'bridge', 'karakoy', 'eminonu', 'sirkeci', 'kumkapi', 'samatya', 'yedikule', 'kazlicesme',
      'bakirkoysahil', 'atakoysahil', 'atakoy'],
    pigeon: ['istiklal', 'kapalicarsi', 'beyazit', 'laleli', 'aksaray', 'yenikapi', 'zeytinburnu', 'bakirkoy'],
  };
  C.fauna = {
    cats: {
      perLevel: [1, 3],              // stray cats per level, at fixed spots drawn from the level seed
      coats: ['mixed', 'orange', 'brown'],
      size: 0.7,                     // body length (m); bigger than life so the cat reads at phone size
      shyR: 3.0,                     // the hero this close (m): the cat trots away
      trotT: 2.0, trotSpeed: 2.2,    // trot away for trotT s at trotSpeed m/s
      walkSpeed: 0.5, homeR: 1.5,    // slow walk (m/s); a cat that drifts beyond homeR (m) walks back to its spot
      idleT: [3, 7],                 // sits, idles and flicks its tail for a random time in this range (s)
      hissR: 10,                     // an elite or boss this close (m): the cat stands and hisses (no gameplay effect)
      hissHold: 2.0,                 // keeps hissing this long after the threat leaves that radius (s)
    },
    birds: {
      perLevel: [2, 4],              // ambient birds per level: seagulls by the sea, pigeons inland
      flushR: 2.5,                   // the hero or an enemy this close (m): the bird takes off
      flyT: 2.2, flyH: 1.0,          // flight time (s) and peak height (m); it lands near its spot
      flySpeed: 3.0,                 // flight speed away from the threat (m/s)
      pecks: [2, 5],                 // pecks on the ground between flights (s)
      flapHz: 8,                     // wing beats per second in flight
      size: 0.5,                     // body length (m)
    },
    sideMin: 2.0,                    // cats and birds stay outside the central lane (|x| below this, m)
    spawnFromY: 8,                   // no fauna before this distance down the route (m)
    spawnToHold: 4,                  // and none within this many m of the hold or boss approach
    calmIdleMul: 2,                  // reduce-motion on: no trots, walks or flights; sits last this many times longer
  };
})(P.CFG);
