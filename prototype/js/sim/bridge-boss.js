// A caught line reels Arda in. A net slows movement until he gets out.
P.BridgeBoss = (function () {
  var B = {}, C = P.CFG.bosses.bigFisher;

  function cast(s, e, a) {
    var K = C.cast, aim = Math.atan2(a.dir.y, a.dir.x), spread = e.phase > 1 ? [0, K.spread * a.side] : [0];
    e.bridgeCast = { left: spread.length, lines: [], caught: false };
    spread.forEach(function (offset, i) {
      var t = P.Enemies.lane(s, e.x, e.y, Math.cos(aim + offset), Math.sin(aim + offset), K.reach, K.w, a.W + i * K.stagger);
      t.owner = e.id; t.then = 'bridgeCast'; t.dmg = P.Enemies.dmgOf(s, e, K.dmg);
    });
  }

  B.attack = function (s, e, a, name, minimum) {
    if (name === 'bridgeCast') { a.W = minimum(C.cast.windup * a.wm); cast(s, e, a); return true; }
    if (name !== 'bridgeNet') return false;
    var K = C.net, h = s.hero, r = e.phase === 1 ? K.r : K.lastR;
    a.W = minimum(K.windup * a.wm);
    P.Enemies.ring(s, h.x, h.y, r, a.W, 'bridgeNet', 'danger',
      { owner: e.id, sx: e.x, sy: e.y, dmg: P.Enemies.dmgOf(s, e, K.dmg) });
    return true;
  };

  B.resolve = function (s, tele) {
    var e = s.gen && s.gen.boss;
    if (!e || e.dead || e.id !== tele.owner) return;
    if (tele.then === 'bridgeCast') {
      e.bridgeCast.left--;
      e.bridgeCast.lines.push({ x: tele.x, y: tele.y, dx: tele.dx, dy: tele.dy, len: tele.len,
        dmg: tele.dmg, dist: 0, reel: C.cast.reel, caught: false });
    } else {
      e.bridgeNet = { x: tele.x, y: tele.y, r: tele.r, t: C.net.stay };
      if (inside(s, e.bridgeNet)) P.Combat.damageHero(s, tele.dmg, 'bigFisher');
    }
  };

  function inside(s, q) { return Math.hypot(s.hero.x - q.x, s.hero.y - q.y) <= q.r + P.CFG.hero.radius; }

  function line(s, e, q, dt) {
    var K = C.cast, h = s.hero, hr = P.CFG.hero.radius;
    if (q.dist < q.len && !q.caught) {
      var prev = q.dist, x = h.x - q.x, y = h.y - q.y, foot = x * q.dx + y * q.dy;
      q.dist = Math.min(q.len, q.dist + K.speed * dt);
      if (foot >= prev - hr && foot <= q.dist + hr && Math.abs(x * q.dy - y * q.dx) <= K.w / 2 + hr) {
        q.caught = P.Combat.damageHero(s, q.dmg, 'bigFisher') > 0;
      }
    } else {
      q.reel -= dt;
      if (q.caught) {
        var d = Math.hypot(e.x - h.x, e.y - h.y), move = Math.min(K.tug * dt, Math.max(0, d - e.r - hr));
        if (move > 0) { h.x += (e.x - h.x) / d * move; h.y += (e.y - h.y) / d * move; P.World.clampHero(s, h); }
      }
    }
    return q.reel > 0;
  }

  B.step = function (s, e, dt) {
    if (e.dead) { e.bridgeCast = null; e.bridgeNet = null; return; }
    if (e.bridgeNet && (e.bridgeNet.t -= dt) <= 0) e.bridgeNet = null;
    var cast = e.bridgeCast;
    if (!cast) return;
    cast.lines = cast.lines.filter(function (q) {
      var live = line(s, e, q, dt);
      cast.caught = cast.caught || q.caught;
      return live;
    });
    if (!cast.left && !cast.lines.length) {
      e.bridgeCast = null;
      P.Bosses.exposeFor(s, e, cast.caught ? C.cast.reset : C.cast.missReset);
      if (!cast.caught) {
        e.ai.exposeT += C.cast.missReset - C.cast.reset;
        e.ai.cd = e.ai.exposeT;
      }
    }
  };

  B.heroMul = function (s) {
    var e = s.gen && s.gen.boss;
    return e && !e.dead && e.bridgeNet && inside(s, e.bridgeNet) ? C.net.slow : 1;
  };
  return B;
})();
