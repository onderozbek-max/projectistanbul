// Game-feel tuning (view only; the simulation never reads these). v0.9 animation pass: hit springs, camera kick, hit-stop,
// arcing blood and gibs, footfall dust, hero lean. Every number here is a taste dial, not a gameplay value.
P.CFG = P.CFG || {};
P.CFG.feel2 = {
  // Damped spring on a struck enemy: squash, a short wobble back to rest, a tilt away from the hit and a small shove (px = unit fractions).
  spring: { tau: 0.085, omega: 38, squashY: 0.24, squashX: 0.18, tiltRad: 0.2, tiltTau: 0.12, shoveU: 0.13, shoveTau: 0.1,
            heavy: 1.6, crit: 1.35, boss: 0.5, life: 0.45, max: 400 },
  // Hit-stop: a short freeze of the simulation (the view keeps animating). Off under Reduce motion (main.js).
  hitStop: { normal: 0.014, heavy: 0.034, minGap: 0.15, perSec: 5 },
  // Camera kick in screen px, opposite or along the action; decays exponentially.
  kick: { knife: 2.0, hit: 1.4, heavy: 6.0, hero: 4.0, dash: 5.0, ult: 7.0, decay: 12 },
  // Arcing drops (fake height): blood per hit, gibs per kill. Gravity matches weapons-fx debris.
  drops: { perHit: 3, perKill: 6, gravity: 18, vzMin: 1.8, vzMax: 4.6, speedMin: 1.2, speedMax: 3.6, life: 0.8, bounce: 0.3,
           landSplat: 0.4, max: 260 },
  // Blackout as a power glitch instead of darkness. Every `period` s the grid stutters for `burst` s: the picture tears into shifted
  // bands (updated `rate` times a second; spatial, not a brightness strobe) and the lamps dip once. Between bursts the lamps hum at
  // `lampBase`. At most one dip per period (0.6 per second), well under the 3 per second flash rule. Reduce motion: a steady soft dim.
  glitch: { period: 1.7, burst: 0.4, rate: 14, baseDim: 0.12, dipDim: 0.2, bands: 3, lampBase: 0.8, lampDip: 0.55, steadyDim: 0.28 },
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
  hero: { leanIdle: 0.03, leanWalk: 0.08, leanRun: 0.12, runSpeed: 3.0, walkSpeed: 0.6,
          startStretch: 0.07, stopSquash: 0.08, springLife: 0.28, springOmega: 30, springTau: 0.1 },
  // Zombies that stop (windup, root, stagger, crowded) breathe in place instead of freezing mid-stride.
  idle: { speedEps: 0.15 },
  // Knife follow-through: after the swing ends the hand eases back to rest over this long (s).
  knife: { settle: 0.22, anticip: 0.18, overshoot: 0.1 }
};
