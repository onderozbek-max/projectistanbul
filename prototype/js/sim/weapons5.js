// Motorlu Testere (v0.5 deviation, workstream A): the chainsaw, a melee weapon. Arda revs it and sweeps a short frontal
// arc at the nearest enemy; while revving the blade bites in ticks (dmg per tick, tickGap apart). A rev that hits
// nothing stalls (extra cooldown). Signature "rampage": a 360 degree spin that grinds everything in reach.
// Events: sawRev (once per rev), sawGrind (per hit, rate-limited), sawStall (rev end; stalled when nothing was hit).
// Each rev also pushes the generic wfire event. Hero fields for the view: revving (seconds left, 0 when idle), revAng.
// All numbers come from P.CFG.weapons.chainsaw and P.CFG.sig.chainsaw.
P.Weapons5 = {};
(function () {
  var DEG = Math.PI / 180, TAU = Math.PI * 2;

  // Rev start: the nearest enemy in reach sets the aim. The cooldown runs from the start, so it ends right after the rev.
  function fireChainsaw(s, dt) {
    var h = s.hero, cfg = P.CFG.weapons.chainsaw, lv = P.Weapons.level(h, 'chainsaw'), W = P.Weapons.state(s);
    if (!lv || !P.Weapons.ready(h, 'chainsaw', dt) || W.rev) return;
    var M = P.Mods.of(s, 'chainsaw'), t = P.Weapons.nearestEnemy(s, h.x, h.y, cfg.range * M.area);
    if (!t) return;
    var A = P.Mods.act(s, 'chainsaw'), a = Math.atan2(t.y - h.y, t.x - h.x), T = lv.revT * (A.sig ? A.sig.revMul : 1);
    h.cds.chainsaw = T + cfg.cooldown * (lv.cdMult || 1) * A.cd * P.Weapons.cdMult(s, 'chainsaw');
    W.rev = { a0: a, t: 0, T: T, tickT: 0, tickGap: lv.tickGap, dmg: P.Weapons.dmgFor(s, 'chainsaw', lv.dmg) * A.dmg,
      arc: A.sig ? A.sig.arc : lv.arcDeg, range: cfg.range * A.area, A: A, sig: !!A.sig, hits: 0, grindT: 0 };
    h.revving = T; h.revAng = a;
    s.events.push({ type: 'sawRev', x: h.x, y: h.y, a: a, range: W.rev.range, arc: W.rev.arc, T: T, sig: !!A.sig });
    P.Weapons.fired(s, 'chainsaw', a, 1);
    P.Mods.announce(s, A, h.x, h.y, W.rev.range);
  }

  // The blade sweeps across the arc during the rev (a full turn under rampage); a tick fires every tickGap seconds.
  function updateRev(s, dt) {
    var h = s.hero, r = P.Weapons.state(s).rev;
    if (!r) { h.revving = 0; return; }
    var f = Math.min(1, r.t / r.T), ang = r.sig ? r.a0 + f * TAU : r.a0 + (f - 0.5) * r.arc * DEG;
    r.t += dt; r.tickT -= dt; r.grindT -= dt;
    h.revAng = ang; h.revving = Math.max(0, r.T - r.t);
    if (r.tickT <= 0) { r.tickT += r.tickGap; tick(s, r, ang); }
    if (r.t >= r.T) finishRev(s, r);
  }

  // One bite: every live enemy in reach and inside the blade's sector takes the tick (the whole reach under rampage).
  function tick(s, r, ang) {
    var h = s.hero, cfg = P.CFG.weapons.chainsaw, half = cfg.bladeHalfDeg * DEG, kb = cfg.kb * P.Weapons.kbMult(s);
    for (var i = 0; i < s.enemies.length; i++) {
      var e = s.enemies[i], dx = e.x - h.x, dy = e.y - h.y, d = Math.hypot(dx, dy) || 1;
      if (e.dead || e.state !== 'active' || d - e.r > r.range) continue;
      if (!r.sig) {
        var diff = Math.atan2(Math.sin(Math.atan2(dy, dx) - ang), Math.cos(Math.atan2(dy, dx) - ang));
        if (Math.abs(diff) > half + Math.asin(Math.min(1, e.r / d))) continue;
      }
      P.Mods.hit(s, e, r.dmg, dx / d, dy / d, kb, 'chainsaw', r.A);
      r.hits++;
      if (r.grindT <= 0) { r.grindT = cfg.grindEvT; s.events.push({ type: 'sawGrind', x: e.x, y: e.y, a: ang, n: r.hits }); }
    }
  }

  // Rev end: a rev that hit nothing stalls and waits out the extra cooldown.
  function finishRev(s, r) {
    var h = s.hero, cfg = P.CFG.weapons.chainsaw, W = P.Weapons.state(s), stalled = r.hits === 0;
    W.rev = null; h.revving = 0;
    if (stalled) h.cds.chainsaw = (h.cds.chainsaw || 0) + cfg.stallCd;
    s.events.push({ type: 'sawStall', x: h.x, y: h.y, hits: r.hits, stalled: stalled });
  }

  P.Weapons5.step = function (s, dt) { fireChainsaw(s, dt); updateRev(s, dt); };
})();
