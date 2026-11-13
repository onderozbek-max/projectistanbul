// Horde density (lane H, WAVE3, AUDIT-7 G-1): on-screen targets for generated levels 2..100. Read by js/sim/horde.js
// (called from director.js). Extends P.CFG. The counts are enemies inside the camera frame (the view's frame; see
// tools/horde-probe.js for the measurement). k = index - 1 (0 on L1, 99 on L100). Targets are not caps: the cap is ctl.cap.
(function (C) {
  C.horde = {
    // Route: the on-screen target is min(cap, base + perLevel x k) x profile(p), p = hero y / hold y. profile: start, mid-route,
    // end. cap keeps the mid-level target in the brief's 30..60 band.
    on: { base: 28, perLevel: 0.6, cap: 60 },
    profile: [0.45, 1.0, 0.9],
    // Hold (the finale before the gate): base + perLevel x k, from `start` of that up to full by `ramp` of the hold time.
    hold: { base: 40, perLevel: 0.8, cap: 130, start: 0.6, ramp: 0.5 },
    // Boss arena: a stream of adds around the boss (the arena's own adds in levels.js stay on top). Boss-arena pass: 24/0.35/60 -> 12/0.15/30.
    arena: { base: 12, perLevel: 0.15, cap: 30 },
    // Controller: spawns come at min(max, gain x deficit) per second (holdMax in the finale), where deficit = target x
    // nearMul - (enemies in the frame, plus margin metres above and below it). nearMul is calibrated: measured on-screen
    // reaches about 0.85..0.95 of the route target on L2..L22 (the rest is spawns still walking in). Past about L40 the
    // rate hits max and on-screen stays near 0.6 of target (tools/horde-probe.js). burst caps the saved budget. Spawn spots: ahead or behind the
    // frame (aheadMin..aheadMax metres beyond it; behindShare, or behindHold in the hold and arena), or at the side walls
    // (sideShare of spots, at sideX). tries: spots tried per spawn. exitGap, minY, blockR: spot limits (m). cullBehind:
    // plain walkers left this far behind the frame are removed. cap: alive limit for horde spawns (levels.js caps route
    // spawns at 140).
    ctl: { max: 20, holdMax: 40, gain: 1.0, nearMul: 1.6, margin: 3, burst: 2, cullBehind: 12, cap: 200, tries: 6, exitGap: 1.5, minY: 0.5,
      blockR: 0.5, aheadMin: 1, aheadMax: 8, behindShare: 0.12, behindHold: 0.85, sideShare: 0.15, sideX: 6.3, runnerShare: 0.2 },
    // Fodder: weak, many. hpMul scales the walker/runner HP (after the level's HP curve), xpMul its XP.
    fodder: { hpMul: 0.6, xpMul: 1.3 },
    // Surges: a readable cause (scream, shop alarm or horn: a ring at the side edge, a sound and a call-out), then `n`
    // fodder from that side over `spread` seconds. Route surges sit at these fractions of the route; the hold gets one at
    // holdAt (fractions of the hold time). n = base + perLevel x k (max cap). The cue sits cueInset in from the frame's
    // side edge at cueY x half-height above the hero; cueR is its ring radius; spreadY is the arrival band (x half-height);
    // letterX, letterY place the arrival call-out.
    surge: { lead: 1.2, spread: 2.5, base: 14, perLevel: 0.5, cap: 60, marks: [0.3, 0.6], runnerShare: 0.3, holdAt: [0.05, 0.5],
      cueInset: 0.9, cueY: 0.3, cueR: 1.4, spreadY: [-0.7, 0.9], letterX: 4.2, letterY: 2 },
    // New enemy type met for the first time in a run: ambient spawns pause this long so it arrives on its own (s).
    debutHold: 3,
  };
})(P.CFG);
