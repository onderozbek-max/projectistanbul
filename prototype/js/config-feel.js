// Game-feel tuning (view only; the simulation never reads these). v0.9 animation pass: hit springs, camera kick, hit-stop,
// arcing blood and gibs, footfall dust, hero lean. Every number here is a taste dial, not a gameplay value.
P.CFG = P.CFG || {};
P.CFG.feel2 = {
  // Damped spring on a struck enemy: squash, a short wobble back to rest, a tilt away from the hit and a small shove (px = unit fractions).
  spring: { tau: 0.085, omega: 38, squashY: 0.24, squashX: 0.18, tiltRad: 0.2, tiltTau: 0.12, shoveU: 0.13, shoveTau: 0.1,
            heavy: 1.6, crit: 1.35, boss: 0.5, life: 0.45, max: 400 },
  // Hit-stop (design-system.md section 7): a short freeze of the simulation (the view keeps animating). Heavy hits 40 ms, boss hits and crit kills 60 ms,
  // never for ordinary swarm hits, at most one per minGap s across every source (feel.js owns the limiter). Off under Reduce motion (main.js).
  hitStop: { heavy: 0.04, boss: 0.06, critKill: 0.06, minGap: 0.25 },
  // Pickup: a small ring pings at the hero when a drop is collected (one per `gap` s; a fast stream of XP is about 11 a second). Each ring is at most
  // 26 px across on a phone, far under the WCAG 2.3.1 flash area (about 150 by 150 px), so it is not rate-capped; open question for the owner
  // in reviews/A11Y-CHECKLIST-R1.md; `trail` is the length (m) of the streak behind a drop that is flying to the hero;
  // `lift` is the height (m) of the arc a drop pops out on while it holds (sim `pop`, `popT` is the longest hold we scale by).
  // glint: a 4-point sparkle on each XP gem (size in m, spin rad/s, pulse Hz of a smooth swell; never a hard on/off). bob: gem hover (m).
  pickup: { gap: 0.09, life: 0.22, r0: 0.2, r1: 0.65, trail: 0.4, lift: 0.4, popT: 0.25, bob: 0.08, glint: { size: 0.13, spin: 0.9, pulse: 0.5 },
            col: { xp: '124,240,142', jeton: '233,162,59', simit: '217,160,80', chest: '255,209,102' } },
  // Ash wisps: a kill lets go of a few grey wisps that rise and thin out (design-system.md section 7, death dissolve). Crowd budget `perFrame`.
  wisp: { n: 2, life: 0.6, rise: 0.9, size: 0.12, alpha: 0.38, perFrame: 6 },
  // Camera kick in screen px, opposite or along the action; decays exponentially.
  kick: { knife: 2.0, hit: 1.4, heavy: 6.0, hero: 4.0, dash: 5.0, ult: 7.0, decay: 12 },
  // Arcing drops (fake height): blood per hit, gibs per kill. Gravity matches weapons-fx debris.
  drops: { perHit: 3, perKill: 6, gravity: 18, vzMin: 1.8, vzMax: 4.6, speedMin: 1.2, speedMax: 3.6, life: 0.8, bounce: 0.3,
           landSplat: 0.4, max: 260 },
  // Blackout as a power glitch instead of darkness. Every `period` s the grid stutters for `burst` s: the picture tears into shifted
  // bands (updated `rate` times a second, 3 at most; it was 14, a strobe, design-system 11) and the lamps dip once. Between bursts the lamps hum at
  // `lampBase`. At most one dip per period (0.6 per second). Reduce flashing: the tear holds still. Reduce motion: a steady soft dim.
  glitch: { period: 1.7, burst: 0.4, rate: 3, baseDim: 0.12, dipDim: 0.2, bands: 3, lampBase: 0.8, lampDip: 0.55, steadyDim: 0.28 },
  // 2.5D cues: ground light pools squash to this height ratio; contact shadows shift by this share of their radii (x right, y down).
  light: { squash: 0.62 },
  shadow: { x: 0.22, y: 0.3 },
  // Tram: car height (m) for the raised roof, length of the rushing car, time to sweep the lane (the sim kills the lane at once),
  // camera jolt (px) and the dust and spark budget per frame while it passes.
  tram: { height: 0.55, len: 9, sweepT: 0.32, kick: 6, dustN: 2, sparkN: 2 },
  // Weapon recoil (camera px opposite the aim, per shot). byId wins over byTag (the synergy element in config-weapons3), then base.
  fire: { base: 1.2, max: 8, squashAt: 2.4,
          byTag: { fire: 0.6, electric: 0.9, water: 1.6, blade: 1.6, blunt: 3.2, gas: 2.4 },
          byId: { chainsaw: 2.4, grinder: 2.6, extinguisher: 1.8, fireworks: 3.0, finale: 3.6, speargun: 2.6, nailgun: 1.8, torch: 0.5 } },
  // Weapon hit sparks by element: n particles per hit, at most perFrame in total so an area weapon on a crowd stays cheap.
  hitFx: { perFrame: 10,
           fire:     { k: 'spark', n: 3, col: '255,150,60',  sp: 2.0, vz: 2.6, r: 0.03, life: 0.45 },
           electric: { k: 'spark', n: 4, col: '170,235,255', sp: 3.0, vz: 2.0, r: 0.03, life: 0.3 },
           blade:    { k: 'spark', n: 2, col: '255,238,170', sp: 3.2, vz: 1.6, r: 0.03, life: 0.28 },
           water:    { k: 'foam',  n: 2, col: '236,246,255', sp: 1.0, vz: 1.2, r: 0.07, life: 0.5 },
           gas:      { k: 'foam',  n: 2, col: '200,230,150', sp: 1.0, vz: 1.0, r: 0.07, life: 0.5 },
           blunt:    { k: 'foam',  n: 2, col: '196,182,156', sp: 1.6, vz: 1.4, r: 0.06, life: 0.4 } },
  // Footfall dust: one puff per heel strike while moving faster than minSpeed (m/s).
  dust: { minSpeed: 1.4, count: 2, life: 0.4, size: 0.15, rise: 0.5, alpha: 0.34, max: 80 },
  // Hero body language: forward lean by speed band (quantised to keep the sprite cache small), start stretch, stop settle.
  // heavyMul: a heavy hit squashes the hero this much more than a light one. fidget: an idle personality beat (a stretch and a
  // neck roll) every `every` seconds (random in the range), `t` long, `amp` tall (fraction), `rot` radians of roll.
  hero: { leanIdle: 0.03, leanWalk: 0.08, leanRun: 0.12, runSpeed: 3.0, walkSpeed: 0.6,
          startStretch: 0.12, stopSquash: 0.14, heavyMul: 1.8, springLife: 0.28, springOmega: 30, springTau: 0.1,
          fidget: { every: [6, 10], t: 0.6, amp: 0.05, rot: 0.04 } },
  // Zombies that stop (windup, root, stagger, crowded) breathe in place instead of freezing mid-stride.
  idle: { speedEps: 0.15 },
  // Walkers: lean toward the hero while moving (rad at full lean); phaseStep spreads the walk cycles of a crowd (rad per id, golden
  // angle-ish) so no two walkers march in step; spawn puff: a few dust puffs as an ordinary spawn comes up (count, life s, radius m).
  walk: { lean: 0.07, phaseStep: 2.4, spawnPuffN: 5, spawnPuffLife: 0.45, spawnPuffR: 0.18 },
  // Knife follow-through: after the swing ends the hand eases back to rest over this long (s).
  knife: { settle: 0.22, anticip: 0.18, overshoot: 0.1 }
};

// Signature moments (T4 part 13; view only, js/view/moments*.js). Each moment is cause-tied and short. Every bright start takes a
// slot from the screen flash budget (P.Fx.flashGo, at most 3 a second) or is dropped; Reduce motion and Reduce flashing turn the
// moving or bright parts off (rows in reviews/A11Y-CHECKLIST-R1.md). Times in s, distances in m, sizes in px unless noted.
P.CFG.moments = {
  // 1. Dash glitch: a red and a cyan ghost pair at each of `ghostN` points along the dash (`ghostLife` s, `ghostOff` m apart),
  //    and a tear of `tearBands` horizontal bands across the hero's row (`tearSpan` px either side). The tear is `tearShift` px
  //    wide, updated `tearRate` times a second (quantised) for `tearT` s, and needs a budget slot. One dash, one tear (cooldown 3.5 s).
  dash: { ghostN: 3, ghostLife: 0.24, ghostOff: 0.06, tearT: 0.14, tearRate: 3, tearBands: 3, tearShift: 12, tearSpan: 120, fringe: 0.16 },
  // 2. Ground shock: a ring grows from an explosion or a ground slam (to at least the event's radius, `r1` m at least) and magnifies
  //    the picture inside its band (`band` of the radius wide) by up to `zoom`, for `life` s. No colour change. Up to `max` at once.
  //    A boss slam and a brute stomp also push the picture down once: `slamKick` and `stompKick` px (the shake setting scales them).
  shock: { max: 2, life: 0.3, r0: 0.5, r1: 2.4, band: 0.35, zoom: 0.08, slamKick: 3.0, stompKick: 1.5, gap: 0.34 },   // one ring per gap s
  // 3. Kill streak ladder: when a kill streak (the frenzy window of skills.frenzy) reaches a mark, an ink splash shows the word for it
  //    for `bannerT` s (pops in over `popIn` s, splash radius `splashR` of the screen width), and an ink wipe runs in from both
  //    screen edges (`wipeFrac` of the width each side, `wipeT` s) if a budget slot is free. The word sits at `wordY` of the height.
  streak: { marks: [10, 25, 50], wipeT: 0.34, wipeFrac: 0.22, wipeJag: 12, wipeA: 0.94, bannerT: 1.1, popIn: 0.12, fadeT: 0.3, splashR: 0.42,
            wordY: 0.36, inkA: 0.92, fontPx: 40, queueT: 0.5 },
  // 4. Crit kill: a halftone burst of gold dots (a `grid` by `grid` lattice, `step` m apart, dot radius up to `dot` m). It holds for
  //    `hold` s (two frames) at radius r0, then grows to r1 and fades over `life` s. One burst at most every `gap` s. Crit kills keep
  //    their 60 ms hit-stop (feel.js), so this adds no second freeze.
  crit: { max: 2, gap: 0.34, hold: 0.034, life: 0.34, r0: 0.25, r1: 1.1, grid: 5, step: 0.15, dot: 0.085, col: '255,209,102' },
  // 5. Near miss: a slow ripple ring (`life` s, from r0 to r1 m) that wobbles `wobbleAmp` m at `wobbleHz`, with a red and a cyan
  //    fringe `fringe` m to either side (not under Reduce flashing). The near miss comes once per dash (sim nearMissDone).
  ripple: { max: 2, life: 0.6, r0: 0.9, r1: 2.6, wobbleAmp: 0.05, wobbleHz: 1.5, fringe: 0.06, col: '61,220,255' },
  // 6. Level clear (journey levels): `n` paper simit rings and tulip tea glasses fall past the screen for `life` s (about `size` px,
  //    `drift` px/s sideways, `grav` px/s2, spin `spin` rad/s max). The hood name bounces in on a ribbon for `ribbonT` s (a damped
  //    spring of `bounceHz` Hz, decay `bounceK`). Under Reduce motion the pieces are not spawned.
  clear: { n: 36, life: 1.8, grav: 420, vmax: 260, drift: 60, spin: 2.2, size: 9, fadeT: 0.4, ribbonT: 1.6, ribbonFade: 0.35, h: 38,
           fontPx: 18, bounceHz: 2, bounceK: 5 },
  // 7. Last stand: each enemy within `radius` m of the hero (at most `max`) gets a red ring on its feet. The ring swells at `pulseHz`
  //    (0.5 Hz: one smooth cycle every 2 s between `alpha` levels). Each cycle takes one budget slot (with none free, the ring holds at the upper level that cycle). Under Reduce flashing the ring
  //    holds at the upper level. The edges of the screen grey in under a veil of alpha `veil` (`veilIn` s to reach it).
  low: { radius: 3.2, max: 10, pulseHz: 0.5, ring: 0.14, alpha: [0.3, 0.8], veil: 0.26, veilIn: 0.4, col: '215,38,61' },
  // 8. Heavy hit (a heavy weapon or a boss): an ink starburst of `spikes` points (outer `r` m, inner `inner` m) with a gold core, held
  //    for `hold` s (two frames), then gone over `life` s. Budget slot and at most one every `gap` s, per `max` at once.
  impact: { max: 2, gap: 0.34, hold: 0.034, life: 0.12, r: 0.6, inner: 0.3, spikes: 12, ink: '20,21,31', core: '255,209,102' }
};
