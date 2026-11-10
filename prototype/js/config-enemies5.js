// Wave 1 enemy types (R1, audit section 10): marti (seagull thief) and cayci (tea carrier). Extends P.CFG. Defs go in
// P.CFG.enemies (budget = spawn-director cost, like the other types); the behaviour numbers are in P.CFG.enemies5.
// Sim: sim/enemies4.js (dispatch), sim/enemies4-marti.js, sim/enemies4-cayci.js. Roster: schedule in config-levels.js.
(function (C) {
  // Marti (martı): smallest and fastest, flies over walls (flyer), no contact damage. Hp 5 (owner: 4-6).
  C.enemies.marti = { hp: 5, speed: 3.6, contact: 0, radius: 0.28, xp: 3, kbResist: 0.2, budget: 1.5, flyer: true };
  // Cayci (çaycı): medium, walks with a tray and keeps about 4.5 m. Its hot tea glob lands as a slowing puddle (no damage).
  C.enemies.cayci = { hp: 28, speed: 0.9, contact: 6, radius: 0.42, xp: 6, kbResist: 0.2, budget: 3.0 };

  C.enemies5 = {
    marti: {
      stealR: 4.5,       // a loose XP drop this close to the hero is a steal target (m)
      shadowR: 0.7,      // dive shadow radius on the ground (m)
      diveT: 0.5,        // dive shadow telegraph (s): design-system 6 rule 3 floor for normal enemies
      diveSpeed: 9.0,    // dive speed to the drop (m/s)
      grabR: 0.5,        // distance at which the drop is taken (m)
      fleeSpeed: 5.0,    // flight speed away from the hero while it carries a drop (m/s); faster than the hero
      hoverR: 2.0,       // with no drop it hovers this close to the hero (m)
      bonusJeton: 6,     // gold dropped with the XP when it dies carrying a drop (CC 8-9 jeton scale)
    },
    cayci: {
      keep: 4.5, band: 0.8,           // keeps about 4.5 m from the hero (radial band 0.8 m either side)
      range: 5.0, minRange: 2.5,      // throws from 2.5 to 5 m (design: range ~5 m)
      cd: 4.0, firstCd: 1.5,          // seconds between throws, and before the first
      windup: 0.7, flight: 0.7,       // windup 0.7 s (the ground circle, the telegraph), glob flight 0.7 s
      // The glob reuses the spitter machinery (enemies.js lob, landGlob): zone 'tea' lands as a slowing puddle, no damage.
      glob: { r: 1.0, puddleT: 6.0, puddleDps: 0, zone: 'tea' },
      slow: { m: 0.65, t: 3.0 },      // hero speed x0.65 (35% slower); lasts 3 s after the last touch of the puddle
    },
  };
})(P.CFG);
