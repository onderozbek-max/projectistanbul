// v0.7 wave 2 (lane C, AUDIT-6 C1-C4): the numbers that are not enemy defs. Extends P.CFG. Read by the sim
// (enemies3.js, bosses.js) and by the view only through the sim's events. Enemy defs stay in config-enemies3.js.
(function (C) {
  C.enemies4 = {
    telegraphMin: 0.8,       // every boss attack and new-enemy windup telegraphs at least this long (DS 6, bosses.js tele())
    portalRise: 0.6,         // A5 openings (door, window, manhole from env-portal.js): rise time from the opening (C2)
    openReach: 4,            // a layout opening counts as ahead of the hero up to aheadMax + openReach metres (enemies3.js)
    entrance: {              // route spawns that may move to a feature (enemies3.js E3.entrance)
      aheadY: 3,             // "ahead" = more than aheadY metres in front of the hero
      edgeX: 4,              // "edge" = beyond edgeX metres from the centre line (the side walls)
      exitGap: 2,            // no feature closer than exitGap metres to the exit gate
    },
    crate: {                 // copci crates: every crateEvery-th push is a wooden crate, heavier than a bin, shorter-lived
      every: 2, binR: 0.5, binSpeed: 1.2, binLife: 2.0, binDmg: 12, binKb: 1.4, binShove: 1.6, binHitCd: 0.6,
      trash: { r: 1.2, t: 5, dps: 2.5, heroDps: 3.5 },
    },
  };

  // Roster adds (AUDIT-6 C3): hood index (0-based, 3 = H04 Galata Köprüsü) -> new types. Read by enemies3.js
  // augmentRoster from stage enemyRosterFrom on, for generated levels only. Stage gate: 1 = from the hood's first stage.
  C.enemyRosterFrom = 1;
  C.enemyRosterAdds = {
    3: ['copci'], 4: ['kurye'], 5: ['kurye'], 6: ['kurye', 'copci'], 7: ['kurye'], 8: ['copci'], 9: ['kurye'],
    10: ['copci'], 11: ['kurye', 'copci'], 12: ['copci'], 13: ['kurye'], 14: ['copci'], 15: ['kurye'],
    16: ['copci', 'kurye'], 17: ['kurye'], 18: ['copci'], 19: ['kurye', 'copci'],
  };
})(P.CFG);
