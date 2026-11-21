// Kaan covers a shared task, then follows one later Dash while that task still needs him.
P.KaanSupport = (function () {
  var A = {}, K = P.CFG.bond.kaan.support;

  function inReach(e, point) {
    return !e.dead && !e.boss && e.state === 'active' && Math.hypot(e.x - point.x, e.y - point.y) <= K.radius;
  }
  function enemies(s, point) {
    return s.enemies.filter(function (e) { return inReach(e, point); }).sort(function (a, b) {
      return Math.hypot(a.x - point.x, a.y - point.y) - Math.hypot(b.x - point.x, b.y - point.y);
    }).slice(0, K.maxTargets);
  }

  function ready(s) {
    var m = s.milestone, boss = s.gen && s.gen.boss;
    if(s.levelIndex===20&&boss&&boss.dead&&s.companion&&s.companion.joined)return true;
    if (s.routeTrial === 'sirkeci-stationPoints') return boss && !boss.dead && boss.phase >= K.bossPhase;
    if (!m || m.open) return false;
    if(m.work&&m.work.active)return false;
    if (m.carry) return true;
    if (m.cart) return m.cart.started && P.RouteMilestones.inRing(s, m.cart, K.radius);
    if (m.guide) return m.guide.joined && P.RouteMilestones.inRing(s, m.guide, K.radius);
    return m.point && m.point.active;
  }

  function canFollow(s, a) {
    return a.hit && a.uses < K.maxUses && s.t - a.start >= K.repeatAfter && ready(s);
  }

  A.canFollow = function (s) {
    return !!(s.kaanSupport && s.hero.dashCd <= 0 && canFollow(s, s.kaanSupport) &&
      s.enemies.some(function (e) { return inReach(e, s.hero); }));
  };

  function sweep(s, a) {
    var crowd = enemies(s, a);
    crowd.forEach(function (e) {
      var dx = e.x - a.x, dy = e.y - a.y, distance = Math.hypot(dx, dy) || 1;
      P.Status.apply(e, 'stun', K.stun, 1);
      P.Combat.shove(e, dx / distance, dy / distance, K.shove, true);
    });
    a.hit = true;
    if (crowd.length) {
      s.kaanCovered = true;
      if (s.levelIndex === K.repay.level && !a.followDash) a.repayUntil = s.t + K.repay.window;
    }
    s.events.push({ type: 'kaanSupport', x: a.x, y: a.y, count: crowd.length, followDash: a.followDash });
  }

  function canRepay(s, a) {
    return a && a.repayUntil > s.t && a.repaidAt === undefined;
  }

  function threatens(e, a) {
    return inReach(e, a) && Math.hypot(e.x - a.x, e.y - a.y) <= K.repay.radius;
  }

  A.canRepay = function (s) {
    var a = s.kaanSupport;
    return canRepay(s, a) && s.hero.dashCd <= 0 && s.enemies.some(function (e) { return threatens(e, a); });
  };

  A.dashPast = function (s, x, y) {
    var a = s.kaanSupport, h = s.hero, dx = h.x - x, dy = h.y - y, d2 = dx * dx + dy * dy, hit = 0;
    if (!d2 || !canRepay(s, a)) return;
    s.enemies.forEach(function (e) {
      if (!threatens(e, a)) return;
      var t = Math.max(0, Math.min(1, ((e.x - x) * dx + (e.y - y) * dy) / d2));
      if (Math.hypot(e.x - x - t * dx, e.y - y - t * dy) > K.repay.sweep + e.r) return;
      var ex = e.x - a.x, ey = e.y - a.y, d = Math.hypot(ex, ey) || 1;
      P.Status.apply(e, 'stun', K.repay.stun, 1);
      P.Combat.shove(e, ex / d, ey / d, K.repay.shove, true);
      hit++;
    });
    if (hit) repay(s, a, hit);
  };

  function repay(s, a, hit) {
    a.repaidAt = s.t;
    s.kaanRepay = true;
    s.events.push({ type: 'routeBeat', phase: 'kaan_covered_by_arda', x: a.x, y: a.y, targets: hit });
  }

  A.coverWithProp = function (s, point) {
    var a = s.kaanSupport;
    if (!canRepay(s, a) || Math.hypot(point.x - a.x, point.y - a.y) > K.repay.radius) return;
    var pressure = s.enemies.filter(function (e) { return threatens(e, a); });
    if (!pressure.length) return;
    pressure.forEach(function (e) { e.lure = { x: point.x, y: point.y, t: K.repay.relief }; });
    repay(s, a, pressure.length);
  };

  A.step = function (s) {
    var localJoin=s.levelIndex===20&&s.companion&&s.companion.joined&&s.gen.boss&&s.gen.boss.dead;
    if (!s.routeTrial || (!localJoin&&(!s.loadout || !s.loadout.kaanJoined || s.levelIndex < K.first))) return;
    var h = s.hero, a = s.kaanSupport;
    var dash = s.sk && s.sk.dash, freshDash = dash && dash !== s.kaanSupportDash;
    s.kaanSupportDash = dash;
    if (a) {
      if(s.companion){a.x=s.companion.x;a.y=s.companion.y;}
      if (!a.hit && s.t - a.start >= K.windup && (!s.companion||!s.companion.path.length)) sweep(s, a);
      if (!freshDash || !canFollow(s, a)) return;
    }
    if (!ready(s)) return;
    var closest = enemies(s, h)[0];
    if (!closest) return;
    var facing = closest.x >= h.x ? 1 : -1;
    var p = { x: h.x + facing * 0.7, y: h.y + 0.48 };
    P.World.clampGeo(p, P.CFG.hero.radius, s.props);
    var actor=s.companion&&P.Companion.intercept(s,p);
    if(s.companion&&!actor)return;
    s.kaanSupport = { x: actor?actor.x:p.x, y: actor?actor.y:p.y, fromX: actor?actor.x:h.x, fromY: actor?actor.y:h.y - 0.65, facing: facing, start: s.t,
      hit: false, uses: a ? a.uses + 1 : 1, followDash: !!a };
  };

  return A;
})();
