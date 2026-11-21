// One marked use per authored object. All clearances use the same solid placement as street props.
P.StreetPlaces = (function () {
  var S = {}, C = P.CFG.env.streetWeapon;

  function protectsRoute(m, x, y, w, h) {
    var points = [m.point, m.pallet, m.cart, m.align, m.fuse, m.weight, m.guide].concat(m.sacks || [], m.shutters || [],m.screens||[],m.braces||[],m.bellPosts||[],m.lights&&m.lights.steps||[]);
    var margin = P.CFG.ev.edge + P.CFG.hero.radius;
    return points.some(function (p) { return p && Math.abs(p.x - x) < w / 2 + margin && Math.abs(p.y - y) < h / 2 + margin; });
  }
  S.reserved=protectsRoute;

  function placement(s, x, y, w, h) {
    var m = s.milestone, task = m.point, gap = task && task.y - y;
    var offsets = gap > 5 ? [gap - 3, gap - 4, 4, 5, 3, 6] : [4, 5, 3, 6];
    var lanes = [x, x - Math.sign(x), x + Math.sign(x)];
    for (var i = 0; i < offsets.length; i++) for (var j = 0; j < lanes.length; j++) {
      var sx = lanes[j], sy = y + offsets[i];
      if (sy + C.placementR >= m.y || !P.Env.coverFits(s, sx, sy, w, h) ||
          protectsRoute(m, sx, sy, w, h) || !clearApproach(s, x, y - h / 2 - P.CFG.hero.radius, sx, sy - 1)) continue;
      return { x: sx, y: sy, gripY: sy - 1 };
    }
    return null;
  }

  function clearApproach(s, x, y, endX, endY) {
    var dx = endX - x, dy = endY - y, n = Math.ceil(Math.hypot(dx, dy) / P.CFG.hero.radius);
    for (var i = 0; i <= n; i++) {
      if (P.Events.blocked(s, x + dx * i / n, y + dy * i / n)) return false;
    }
    return true;
  }

  S.init = function (s) {
    var setup = s.routeTrial && C.setups[s.levelIndex];
    if (!setup || !s.env || !s.milestone) return;
    var y = setup.afterTram ? P.CFG.levels.istiklalRoute.tramY + setup.afterTram : s.milestone.y - setup.before;
    var role = C.roles[setup.role], sides = [-1.9, 1.9, -2.8, 2.8], tries = [0, -2, 2, -4, 4, -6, -8, -10, -12];
    for (var i = 0; i < tries.length; i++) for (var j = 0; j < sides.length; j++) {
      var x = sides[j], yy = y + tries[i];
      var w = setup.role === 'lure' ? .72 : 1.3, h = .7;
      if (protectsRoute(s.milestone, x, yy, w, h)) continue;
      var site = !setup.attackOnly && placement(s, x, yy, w, h);
      if (!setup.attackOnly && !site) continue;
      if (!P.Env.addSolid(s, role.kind, x, yy, w, h)) continue;
      var r = s.env.recs[s.env.recs.length - 1];
      r.street = { role: setup.role, home: { x: x, y: yy }, wear: 0, remaining: C.carryT, regrip: 0 };
      if (site) s.streetSite = Object.assign(site, { role: setup.role, prop: r, fill: 0 });
      return;
    }
  };

  S.repel = function (s, p, x, y) {
    s.enemies.forEach(function (e) {
      if (e.dead || e.boss || e.elite || e.anchored || e.state !== 'active' || Math.hypot(e.x - p.x, e.y - p.y) > C.lureR) return;
      e.lure = { x: x, y: y, t: C.lureT };
    });
  };

  S.step = function (s, w, dt) {
    var p = s.streetSite, h = s.hero;
    if (!p || p.used || p.prop !== w.r) return false;
    if (h.moving || h.dashing || Math.hypot(h.x - p.x, h.y - p.gripY) > C.placementR) { p.fill = 0; return false; }
    p.fill = Math.min(1, p.fill + dt / C.placementT);
    if (p.fill < 1) return true;
    if (!P.Env.returnCover(s, w.r, p.x, p.y)) { p.failed = p.used = true; return false; }
    p.used = true; p.until = s.t + C.coverT; w.r.street.spent = true;
    if (p.role === 'lure') S.repel(s, p, p.x, p.y);
    P.LocalChoices.prop(s, w.r, 'place');
    if (P.KaanSupport) P.KaanSupport.coverWithProp(s, p);
    s.events.push({ type: 'streetWeapon', beat: p.role, x: p.x, y: p.y });
    s.streetWeapon = null; h.streetHolding = false;
    return true;
  };

  S.expire = function (s) {
    var p = s.streetSite;
    if (p && p.until && s.t >= p.until) { if (p.prop.alive) P.Env.expireCover(s, p.prop); p.until = 0; }
  };
  return S;
})();
