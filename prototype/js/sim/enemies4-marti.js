// Marti (martı, seagull thief). Flies (no walls), hovers near the hero, no contact damage. When a loose XP drop lies within
// stealR of the hero it shows a dive shadow on the drop (a 0.5 s ring telegraph, then 'swoop'), dives, takes the drop and
// flees away from the hero at fleeSpeed. Killed while carrying it: the XP comes back with bonus gold. Off-screen with it:
// the XP is gone and the marti is removed without kill credit. Numbers: P.CFG.enemies5.marti (config-enemies5.js).
(function () {
  P.Marti = {};

  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function unit(dx, dy) { var d = Math.hypot(dx, dy) || 1; return { x: dx / d, y: dy / d }; }
  function still(e) { e.dvx = 0; e.dvy = 0; return true; }

  P.Marti.think = function (s, e, dt) {
    var a = e.ai, M = P.CFG.enemies5.marti, h = s.hero, d;
    if (a.carry > 0 && offScreen(s, e)) return gone(s, e, a);
    if (a.m === 'flee') return flee(e, a, M, h);
    if (a.m === 'dive') return dive(s, e, a, M);
    if (a.m === 'shadow') return still(e);
    d = nearestLoot(s, h, M.stealR);
    if (d) return shadow(s, e, a, d, M);
    return hover(e, h, M);
  };

  function hover(e, h, M) {
    var u = unit(h.x - e.x, h.y - e.y);
    if (dist(e, h) > M.hoverR) { e.dvx = u.x * e.speed; e.dvy = u.y * e.speed; return true; }
    return still(e);
  }

  // The loose XP drop nearest to the hero, within R.
  function nearestLoot(s, h, R) {
    var best = null, bd = R, i, d, k;
    for (i = 0; i < s.drops.length; i++) {
      d = s.drops[i];
      if (d.kind !== 'xp') continue;
      k = dist(d, h);
      if (k <= bd) { bd = k; best = d; }
    }
    return best;
  }

  // Dive shadow on the drop: a ring telegraph (then 'swoop' resolves it into the dive, sim/enemies.js onTele).
  function shadow(s, e, a, d, M) {
    a.m = 'shadow'; a.drop = d;
    s.enemyTele.push({ kind: 'ring', x: d.x, y: d.y, r: M.shadowR, t: 0, T: M.diveT, then: 'swoop', owner: e.id, src: e,
      col: 'danger', drop: d });
    s.events.push({ type: 'martiShadow', id: e.id, x: d.x, y: d.y, T: M.diveT });
    return still(e);
  }

  // The shadow resolved: dive if the drop is still loose, else hover again.
  P.Marti.swoop = function (s, tg) {
    var e = tg.src, a = e && e.ai;
    if (!e || e.dead || !a || a.m !== 'shadow') return;
    if (tg.drop && s.drops.indexOf(tg.drop) >= 0) { a.m = 'dive'; a.drop = tg.drop; }
    else { a.m = 'hover'; a.drop = null; }
  };

  function dive(s, e, a, M) {
    var d = a.drop, u;
    if (!d || s.drops.indexOf(d) < 0) { a.m = 'hover'; a.drop = null; return still(e); }
    if (dist(e, d) <= M.grabR) { steal(s, e, a, d); return still(e); }
    u = unit(d.x - e.x, d.y - e.y);
    e.dvx = u.x * M.diveSpeed; e.dvy = u.y * M.diveSpeed;
    return true;
  }

  function steal(s, e, a, d) {
    s.drops.splice(s.drops.indexOf(d), 1);
    a.carry = d.value; a.m = 'flee'; a.drop = null;
    s.events.push({ type: 'martiSteal', id: e.id, x: d.x, y: d.y, value: d.value });
  }

  function flee(e, a, M, h) {
    var u = unit(e.x - h.x, e.y - h.y);
    e.dvx = u.x * M.fleeSpeed; e.dvy = u.y * M.fleeSpeed;
    return true;
  }

  // Outside the frame (the hold zoom widens it), by the view's off-screen margin.
  function offScreen(s, e) {
    var V = P.CFG.view, W = s.dir && s.dir.zoomOut ? V.holdWidthM : V.widthM, h = s.hero;
    return Math.abs(e.x - h.x) > W / 2 + V.offscreenMargin || Math.abs(e.y - h.y) > P.viewHalfH(W) + V.offscreenMargin;
  }

  function gone(s, e, a) {
    s.events.push({ type: 'martiGone', id: e.id, x: e.x, y: e.y, value: a.carry });
    a.carry = 0; e.escaped = true; e.dead = true;
    return still(e);
  }

  // Killed (enemies4.js onDeath): cancel its shadow; a carried drop comes back as XP, with bonus gold.
  P.Marti.onDeath = function (s, e) {
    var a = e.ai, M = P.CFG.enemies5.marti, xp, jt;
    s.enemyTele = s.enemyTele.filter(function (t) { return t.owner !== e.id; });
    if (!a || !(a.carry > 0)) return;
    xp = { kind: 'xp', value: a.carry, x: e.x, y: e.y, mag: false, pop: 0.25 };
    jt = { kind: 'jeton', value: M.bonusJeton, x: e.x - 0.2, y: e.y, mag: false, pop: 0.25 };
    s.drops.push(xp, jt);
    P.Combat.keepInReach(s, xp); P.Combat.keepInReach(s, jt);
    s.events.push({ type: 'martiReturn', id: e.id, x: e.x, y: e.y, value: xp.value });
    a.carry = 0;
  };
})();
