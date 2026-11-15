// Wave 1 skin behaviours (R1, owner decision 1; audit section 10). Extends P.CFG. Read only by the sim (sim/skins.js,
// sim/skins-fisher.js). A skin is a zombie outfit (journey.js hood.skins); a skin listed here gives its zombies a job.
// Caps: a behaviour is rolled once at spawn, with chance per eligible spawn and at most maxAlive live behaviour enemies
// of that skin, so a crowd of fishers never hooks all at once. minHood is the 0-based hood index it phases in at
// (the hoods that list the skin: fisher from Karaköy, musician from Galata (behaves from Karaköy, see below), hamal from Eminönü).
(function (C) {
  C.skins = {
    // Fisher (olta): casts a hook line at the hero from castRange when it has line of sight. The line is a 0.6 s lane
    // telegraph (thin, the shape of the hit). On a hit (the hero still inside the line, no dash, no wall) the hero is dragged
    // pullDist metres toward the fisher over pullT seconds, with no damage. Dash or a wall cancels it, and so does a boss
    // intro, a hack or a cinematic. pullDist 2.5 m is the middle of the owner's 2-3 m; 10 m/s drag reads as a yank.
    fisher: {
      types: ['walker'], minHood: 2, chance: 0.2, maxAlive: 2,
      castRange: 6.0, telegraph: 0.6, lineW: 0.3, pullDist: 2.5, pullT: 0.25,
      cooldown: 4.5, firstCd: 2.0,
    },
    // Musician (müzisyen): while it lives, walkers within radius move speedMul faster (flat: one buff, no stacking).
    // Radius 6 m is about the half-width of the 10 m view, so the buff reads as "the crowd around the musician".
    musician: {
      // minHood 2 (Karaköy), not 1 (Galata): with the buff on the Galata boss (L10) the bot's no-death rate fell 76% to 62%;
      // from hood 2 it is back at 76% (R1 review). The Galata musician is only a story skin until then.
      types: ['walker'], minHood: 2, chance: 0.2, maxAlive: 2,
      radius: 6.0, speedMul: 1.15,
    },
    // Hamal (porter, a crate on the back): walks speedMul of normal speed. A hit from behind (the hero in the back half-plane
    // of its heading, rearCos 0) does rearMul of its damage. On death it leaves a breakable crate (config-env.js crates,
    // 25 hp) that blocks walking for crateT seconds. headMin: below this speed (m/s) it has no heading, so no rear hit.
    hamal: {
      types: ['walker'], minHood: 4, chance: 0.2, maxAlive: 2,
      speedMul: 0.8, rearMul: 0.5, rearCos: 0, headMin: 0.2,
      crateKind: 'crates', crateW: 1.0, crateH: 1.0, crateT: 8.0, crateOffset: 1.0,
    },
  };
})(P.CFG);
