// Motorlu Testere (v0.5 deviation, workstream A): the chainsaw, a melee weapon. Arda revs it and sweeps a short frontal
// arc at the nearest enemy; while revving the blade bites in ticks (dmg per tick, tickGap apart). A rev that hits
// nothing stalls (extra cooldown). Signature "rampage": a 360 degree spin that grinds everything in reach.
// Öğütücü (grinder, W depth pass): the owned evolution never stalls, and each bite on the same target adds a grind stack
// (lv.stackStep more damage per stack, up to lv.stackMax). Stacks belong to one rev.
// Events: sawRev (once per rev), sawGrind (per hit, rate-limited), sawStall (rev end; stalled when nothing was hit),
// grinderStack (a target gained a stack, rate-limited). Each rev also pushes the generic wfire event.
// Hero fields for the view: revving (seconds left, 0 when idle), revAng. All numbers come from P.CFG.weapons.<id>.
P.Weapons5 = {};
(function () {
  var DEG = Math.PI / 180, TAU = Math.PI * 2;

  // Rev start: the nearest enemy in reach sets the aim. The cooldown runs from the start, so it ends right after the rev.
  function fireChainsaw(s, dt) {
    var h = s.hero, id = P.Weapons.variantOf(h, 'chainsaw'), cfg = P.CFG.weapons[id], lv = P.Weapons.level(h, id), W = P.Weapons.state(s);
    if (!lv || !P.Weapons.ready(h, id, dt) || W.rev) return;
    var M = P.Mods.of(s, 'chainsaw'), t = P.Weapons.nearestEnemy(s, h.x, h.y, cfg.range * M.area);
    if (!t) return;
    var A = P.Mods.act(s, 'chainsaw'), a = Math.atan2(t.y - h.y, t.x - h.x), T = lv.revT * (A.sig ? A.sig.revMul : 1);
    h.cds[id] = T + cfg.cooldown * (lv.cdMult || 1) * A.cd * P.Weapons.cdMult(s, 'chainsaw');
    W.rev = { id: id, a0: a, t: 0, T: T, tickT: 0, tickGap: lv.tickGap, dmg: P.Weapons.dmgFor(s, 'chainsaw', lv.dmg) * A.dmg,
      arc: A.sig ? A.sig.arc : lv.arcDeg, range: cfg.range * A.area, A: A, sig: !!A.sig, hits: 0, grindT: 0, stkT: 0,
      stacks: {}, stackStep: lv.stackStep || 0, stackMax: lv.stackMax || 0, noStall: !!lv.noStall };
    h.revving = T; h.revAng = a;
    s.events.push({ type: 'sawRev', x: h.x, y: h.y, a: a, range: W.rev.range, arc: W.rev.arc, T: T, sig: !!A.sig, tag: 'blade', variant: id });
    P.Weapons.fired(s, 'chainsaw', a, 1, id);
    P.Mods.announce(s, A, h.x, h.y, W.rev.range);
  }

  // The blade sweeps across the arc during the rev (a full turn under rampage); a tick fires every tickGap seconds.
  function updateRev(s, dt) {
    var h = s.hero, r = P.Weapons.state(s).rev;
    if (!r) { h.revving = 0; return; }
    var f = Math.min(1, r.t / r.T), ang = r.sig ? r.a0 + f * TAU : r.a0 + (f - 0.5) * r.arc * DEG;
    r.t += dt; r.tickT -= dt; r.grindT -= dt; r.stkT -= dt;
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
      var n = r.stacks[e.id] || 0;   // grinder: stacks already on this target in this rev (0 for the base saw)
      P.Mods.hit(s, e, r.dmg * (1 + n * r.stackStep), dx / d, dy / d, kb, 'chainsaw', r.A);
      r.hits++;
      if (r.stackMax && n < r.stackMax) {
        r.stacks[e.id] = n + 1;
        if (r.stkT <= 0) { r.stkT = cfg.grindEvT; s.events.push({ type: 'grinderStack', x: e.x, y: e.y, n: n + 1, tag: 'blade' }); }
      }
      if (r.grindT <= 0) { r.grindT = cfg.grindEvT; s.events.push({ type: 'sawGrind', x: e.x, y: e.y, a: ang, n: r.hits, tag: 'blade' }); }
    }
  }

  // Rev end: a rev that hit nothing stalls and waits out the extra cooldown (the grinder never stalls).
  function finishRev(s, r) {
    var h = s.hero, cfg = P.CFG.weapons[r.id], W = P.Weapons.state(s), stalled = r.hits === 0 && !r.noStall;
    W.rev = null; h.revving = 0;
    if (stalled) h.cds[r.id] = (h.cds[r.id] || 0) + cfg.stallCd;
    s.events.push({ type: 'sawStall', x: h.x, y: h.y, hits: r.hits, stalled: stalled, tag: 'blade' });
  }

  P.Weapons5.step = function (s, dt) { fireChainsaw(s, dt); updateRev(s, dt); };
})();
