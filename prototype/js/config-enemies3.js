// v0.7 enemies (lane C, AUDIT-6 C2/C3) and view feel numbers. Extends P.CFG. Sim reads P.CFG.enemies (kurye, copci) and
// P.CFG.enemies3 (behaviour); view reads P.CFG.enemies3.feel and P.CFG.enemies3.deathPose.
// Roster adds (P.CFG.enemyRosterAdds) and the wave 2 numbers (crates, telegraph floor) are in config-enemies4.js.
(function (C) {
  // Kurye (scooter courier): fragile and quick. Every few seconds it telegraphs a diagonal lane across the street, then dashes.
  C.enemies.kurye = { hp: 4, speed: 2.5, contact: 6, radius: 0.36, xp: 2, kbResist: 0, budget: 2.0 };
  // Copci (street sweeper): a tank that pushes a wheelie bin at the hero. The bin rolls, shoves zombies, hits the hero
  // and leaves a trash slick where it stops.
  C.enemies.copci = { hp: 40, speed: 0.7, contact: 10, radius: 0.5, xp: 8, kbResist: 0.6, budget: 4.0 };

  C.enemies3 = {
    kurye: { sense: 9, minDash: 2.5, cd: 4.0, firstCd: 1.5, tele: 0.8, dashLen: 6, dashSpeed: 7, cross: 1.0, forward: 0.7, laneW: 0.9 },
    copci: { sense: 12, minDist: 2.6, pushCd: 6, firstCd: 2.5, pushWindup: 0.8, reach: 1.8, binR: 0.45,
      binSpeed: 1.6, binLife: 2.5, binDmg: 8, binKb: 1.0, binShove: 1.2, binHitCd: 0.6,
      trash: { r: 1.1, t: 6, dps: 2, heroDps: 3 } },
    // Spawn entrances (generated levels only). A spawn that lands off-screen (ahead or at a side wall) may move to an
    // on-screen feature ahead of the hero. Kinds are weighted; T is the rise or drop time (s). Nothing comes up from
    // below the ground (D-058); crawlers have no entrance and crawl in from the street edge.
    entrance: {
      chance: 0.15, aheadMin: 8, aheadMax: 11, sideX: 4.0, sideJit: 0.5, blockR: 0.5,
      kinds: {
        window: { w: 5, T: 0.6 }, balcony: { w: 2, T: 0.5, drop: 2.0 }, tram: { w: 1, T: 0.6 },
      },
    },
    // Death: the damage source (kill event src, weapon id) picks the pose. Unknown sources fall back to blunt.
    deathPose: {
      fire: ['torch', 'molotov', 'dot', 'burn', 'fire'],
      electric: ['cable', 'zap', 'shock'],
      blade: ['knife', 'cleaver', 'chainsaw', 'sawblade', 'speargun', 'olta', 'cyclone', 'chain'],
      explosion: ['canister', 'blast', 'bloater', 'patlayan', 'tram', 'cardoor'],
      blunt: ['sledge', 'manhole', 'extinguisher', 'nailgun', 'slingshot', 'helper', 'ult', 'kasap'],
      fallback: 'blunt',
      life: 6,                 // corpses stay this long (s, sim time)
      cap: 40,                 // oldest corpses drop out past this count
      slide: { walker: 0.25, runner: 0.7, default: 0.3 },
      fade: 1.6,               // last seconds of a corpse fade out
    },
    // View feel: hit flinch, wind-up lean, idle twitch, shamble, scale-in. Amounts in radians or unit fractions.
    feel: {
      flinchLean: 0.16, flinchT: 0.14, windupLean: 0.08, windupSquash: 0.08,
      twitchEvery: 3.1, twitchT: 0.16, twitchAmp: 0.07, shamble: 0.025, scaleIn: 0.15,
      crawlerScale: 1.0,
    },
  };

})(P.CFG);
