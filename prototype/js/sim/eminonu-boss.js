// The anchor moves the Captain. The spice sacks force Arda to choose fresh ground.
P.EminonuBoss = (function () {
  var B = {}, C = P.CFG.bosses.quayCaptain;

  function anchor(s, e, a) {
    var K = C.anchor, h = s.hero, r = e.r, x = e.x, y = e.y;
    var far = Math.min(K.reach, Math.max(K.min, Math.hypot(h.x - x, h.y - y) + K.extra));
    var dist = 0, ux = a.dir.x, uy = a.dir.y, p = { x: x, y: y };
    for (var d = 0.25; d <= far; d += 0.25) {
      p.x = x + ux * d; p.y = y + uy * d;
      P.World.clampGeo(p, r, s.props);
      if (Math.hypot(p.x - x - ux * d, p.y - y - uy * d) > K.stallD) break;
      dist = d;
    }
    e.captainTow = { tx: x + ux * dist, ty: y + uy * dist, phase: 'aim', time: 0, hit: false, distance:dist,
      dmg: P.Enemies.dmgOf(s, e, K.dmg) };
    if (dist > 0) P.Enemies.lane(s, x, y, ux, uy, dist, K.width, a.W + K.throwT).owner = e.id;
  }

  function spice(s, e, a) {
    var K = C.spice, h = s.hero, g = s.geo, first = e.phase < 2, n = first ? K.first : K.last;
    var x = Math.max(g.xMin + K.r, Math.min(g.xMax - K.r, h.x));
    var y = Math.max(g.holdY - 3, Math.min(g.exitY - 1, h.y));
    var side = x >= 0 ? -1 : 1;
    for (var i = 0; i < n; i++) {
      var ix = i === 2 ? -side : i * side;
      var tx = Math.max(g.xMin + K.r, Math.min(g.xMax - K.r, x + ix * K.stagger));
      P.Enemies.ring(s, tx, Math.min(g.exitY - 1, y + i * K.stagger), K.r, a.W + i * K.between,
        'captainSpice', 'danger', { owner: e.id, sx: e.x, sy: e.y, dmg: P.Enemies.dmgOf(s, e, K.hit) });
    }
  }

  B.attack = function (s, e, a, name, minimum) {
    if (name === 'captainAnchor') {
      a.W = minimum(C.anchor.windup * a.wm); anchor(s, e, a); return true;
    }
    if (name !== 'captainSpice') return false;
    a.W = minimum(C.spice.windup * a.wm); spice(s, e, a); return true;
  };

  B.launch = function (e) {
    e.ai.m = 'captainTow'; e.captainTow.phase = 'throw'; e.captainTow.time = 0;
  };

  function tow(s, e, q, dt) {
    var K = C.anchor;
    if (q.phase === 'aim') return;
    q.time += dt;
    if (q.time < K.throwT) return;
    q.phase = 'pull';
    var dx = q.tx - e.x, dy = q.ty - e.y, dist = Math.hypot(dx, dy);
    var ux = dx / (dist || 1), uy = dy / (dist || 1), step = Math.min(dist, K.speed * dt);
    var x = e.x, y = e.y;
    e.x += ux * step; e.y += uy * step;
    P.World.clampGeo(e, e.r, s.props);
    var h = s.hero, len = Math.hypot(e.x - x, e.y - y), f = Math.max(0, Math.min(len, (h.x - x) * ux + (h.y - y) * uy));
    e.walk += len;
    if (len && e.captainDust) e.captainDust = e.captainDust.filter(function (cloud) {
      var t = Math.max(0, Math.min(len, (cloud.x - x) * ux + (cloud.y - y) * uy));
      return Math.hypot(cloud.x - x - t * ux, cloud.y - y - t * uy) > K.width / 2 + cloud.r;
    });
    if (!q.hit && Math.hypot(h.x - x - ux * f, h.y - y - uy * f) <= K.width / 2 + P.CFG.hero.radius) {
      q.hit = P.Combat.damageHero(s, q.dmg, 'quayCaptain') > 0;
      if (q.hit) P.Combat.pushHero(s, ux, uy, K.kb);
    }
    if (dist > step && len > K.stallD) return;
    e.captainTow = null;
    P.Bosses.exposeFor(s, e, K.reset);
  }

  B.land = function (s, t) {
    var e = s.gen && s.gen.boss;
    if (!e || e.dead || e.id !== t.owner) return;
    var K = C.spice, cloud = { x: t.x, y: t.y, r: t.r, t: K.T };
    (e.captainDust || (e.captainDust = [])).push(cloud);
    if (inside(s, cloud)) P.Combat.damageHero(s, t.dmg, 'quayCaptain');
  };
  function inside(s, q) { return Math.hypot(s.hero.x - q.x, s.hero.y - q.y) <= q.r + P.CFG.hero.radius; }

  B.step = function (s, e, dt) {
    if (e.dead) { e.captainDust = null; e.captainTow = null; return; }
    if (e.captainTow) tow(s, e, e.captainTow, dt);
    if (!e.captainDust) return;
    e.captainDust = e.captainDust.filter(function (q) { return (q.t -= dt) > 0; });
    var cloud = e.captainDust.find(function (q) { return inside(s, q); });
    if (!cloud) { e.captainDustTick = 0; return; }
    e.captainDustTick = (e.captainDustTick || 0) + dt;
    if (e.captainDustTick >= C.spice.dustTick) {
      e.captainDustTick = 0;
      P.Combat.damageHero(s, C.spice.dustDmg, 'quayCaptain');
    }
  };
  return B;
})();
