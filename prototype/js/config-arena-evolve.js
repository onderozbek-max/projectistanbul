// Arena evolution tuning (view only; the simulation never reads these). The arena changes as a run goes on (the light drifts
// across a level, decals and rubble pile up, dressing escalates with the route and the horde, the boss stage gets its own
// mood) and each hood-level gets its own ground treatment. Every number is a taste dial. Sources: docs/hood-visual-briefs.md
// (the "Light" line per hood) and docs/design-system.md 3.1 and 6.4 (the floor stays mid-value, stone_grey range).
P.CFG = P.CFG || {};
P.CFG.arenaEvolve = {
  on: true,
  // Screen light at the END of a level, per hood (hood 0..19 in walk order): overlay colour [r, g, b], its alpha at the end, and the
  // lantern gain (shop and lantern pools at the end of the level; 1 = no change). The overlay eases in with route progress, so the
  // start of every level looks like the hood's own light and the end drifts toward this row. Night hoods are cool, dusk warm. The
  // colours are mid-light on purpose: the drift moves the hue and barely the value, so the floor stays mid-value (design-system 6.4).
  endLight: [
    [120, 140, 180, 0.16, 1.5], // 0 istiklal: warm evening into a cool night,
    [150, 110, 80, 0.10, 1.8],  // 1 galata: amber dusk, lanterns strengthen,
    [130, 140, 160, 0.12, 1.6], // 2 karakoy: dusk into fog and café lamps,
    [100, 120, 170, 0.16, 2.0], // 3 bridge: dusk into night, lantern strings,
    [120, 110, 150, 0.15, 2.2], // 4 eminonu: night, grill fire glow,
    [110, 135, 180, 0.14, 1.4], // 5 sirkeci: cold night under the glass,
    [150, 120, 90, 0.08, 2.2],  // 6 kapalicarsi: brass lanterns warm the vaults,
    [150, 125, 100, 0.10, 1.8], // 7 beyazit: book-lamp warmth,
    [150, 110, 120, 0.10, 2.2], // 8 kumkapi: meyhane lanterns,
    [200, 150, 100, 0.12, 1.2], // 9 saray: late gold into dusk,
    [100, 130, 180, 0.14, 2.0], // 10 halic: blue hour, window and café light,
    [90, 100, 130, 0.16, 2.4],  // 11 yenikapi: torch-lit blackout,
    [255, 200, 170, 0.10, 0.6], // 12 samatya: pre-dawn into sunrise over the sea,
    [255, 210, 170, 0.08, 0.7], // 13 yedikule: sunrise into morning,
    [255, 220, 170, 0.05, 0.8], // 14 kazlicesme: full day, warmer,
    [170, 176, 184, 0.08, 1.0], // 15 zeytinburnu: daylight haze and welder light,
    [255, 240, 200, 0.06, 0.8], // 16 bakirkoy: skylight morning,
    [255, 225, 225, 0.04, 0.8], // 17 sahil: late morning pastel,
    [255, 210, 150, 0.07, 0.8], // 18 marina: morning gold on the hulls,
    [255, 180, 140, 0.10, 0.9]  // 19 atakoy: morning, dawn at the boss
  ],
  // Ground tint per hood: a design-system token and its alpha over the authored tile (tokens: stone_grey, tea_amber, simit_gold,
  // bosphorus_blue, paper). Mid-value is kept by the test (floor luminance band below).
  ground: [
    ['#E9A23B', 0.06], ['#B5651D', 0.08], ['#F4EBDD', 0.06], ['#1B4965', 0.10], ['#B5651D', 0.10],
    ['#1B4965', 0.08], ['#B5651D', 0.12], ['#F4EBDD', 0.08], ['#B5651D', 0.08], ['#F4EBDD', 0.06],
    ['#1B4965', 0.06], ['#1B4965', 0.10], ['#B5651D', 0.08], ['#1B4965', 0.05], ['#E9A23B', 0.04],
    ['#F4EBDD', 0.03], ['#F4EBDD', 0.05], ['#1B4965', 0.05], ['#B5651D', 0.06], ['#F4EBDD', 0.05]
  ],
  // Per level (stage 1..5) of a hood: paving wear (share of the lane covered by walk-paving patches), tint strength, prop density
  // (sidewalk kept share = 0.6 x density, from istanbul.js) and the litter set offset. Level 5 is the boss stage. The mean density
  // over the five stages is at most 1.0 (the authored 0.6 share), so the sidewalk sprite count does not rise (frame time); the
  // stages differ by the weight mix instead. The boss stage is quieter so the telegraphs read.
  level: [
    { wear: 0.12, tint: 0.8, dens: 0.85, litter: 0 },
    { wear: 0.22, tint: 1.0, dens: 0.95, litter: 2 },
    { wear: 0.32, tint: 1.1, dens: 1.0, litter: 4 },
    { wear: 0.42, tint: 1.2, dens: 1.0, litter: 6 },
    { wear: 0.26, tint: 0.9, dens: 0.8, litter: 8 }
  ],
  // Litter kinds (flat, under the actors, never gold, red, green or blue: those are pickup or telegraph colours, design-system 3.2).
  litter: ['paper', 'cup', 'can', 'bag', 'cig', 'peel', 'bottle', 'rag', 'fish', 'leaf'],
  // Escalation: the ratchet (0..1, never falls) = max over the level of 0.5 x route progress + 0.2 x segment (A..D) + 0.3 x horde density.
  // Dressing items appear when the ratchet passes their threshold. Density is alive enemies over densRef.
  ratchet: { route: 0.5, seg: 0.2, horde: 0.3, densRef: 70 },
  dress: { litter: 80, bins: 6, lamps: 4, sheen: 10 },   // litter heaps follow the route (they build up behind the walk); see decals file
  // Caps by quality tier (quality.js: tier 0 full, 1 and 2 trade). Decals are blood, scorch and rubble; dressing is litter, bins and sheen.
  cap: { decal: [90, 50, 24], dressing: [110, 70, 46], lamps: [6, 3, 0] },
  // Cached decal layer: world bands of `h` metres, `w` metres wide (x -w/2..w/2), at most `maxBands` canvases (LRU), raster
  // scale clamped to kMin..kMax pixels a metre (the phone's device scale, quantised).
  band: { h: 8, w: 14, maxBands: 6, kMin: 16, kMax: 64 },
  // Boss intro: the grade and vignette ease in over `ramp` s (a slow ramp, never a flash) and stay for the fight.
  boss: { ramp: 1.2, vig: 0.22, grade: [120, 26, 30], gradeA: 0.10 },
  // Flickering lamps: alpha wobbles by `amp` at about `hz` (well under 3 Hz, design-system 11). Reduce motion holds them still.
  flicker: { hz: 0.7, amp: 0.22 }
};
