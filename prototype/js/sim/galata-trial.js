// Authored Galata encounters reuse the route barrier and the same street simulation.
P.GalataTrial = (function () {
  var G = {}, C = P.CFG.levels.galataMilestones;

  function openLane(s, ideal, spec) {
    var behind = spec.kind === 'footbridge' ? C.weight.back : spec.kind === 'bell' ? C.bell.divertBack : C.padY;
    return P.RouteMilestones.clearLane(s, ideal, spec.gap, behind, C, 0, Infinity);
  }

  G.init = function (s) {
    var spec = P.CFG.levels.galataRoutes[s.levelIndex];
    var y = openLane(s, spec.before ? s.geo.holdY - spec.before : Math.round(s.geo.holdY * spec.at), spec);
    var p = { x: 0, y: y, r: C.r, progress: 0 };
    var m = { kind: spec.kind, galata: true, y: y + spec.gap, point: p, open: false, opening: 0,
      openedAt: null, openT: spec.openT, useT: spec.useT };
    s.milestone = m;
    if(spec.kind==='bell'){
      m.bellPosts=[-1,1].map(function(side){var at=P.WalkPath.nearest(s,{x:side*C.bell.side,y:y},P.CFG.hero.radius,function(q){return q.x*side<C.bell.minSide;});
        return{x:at?at.x:side*C.bell.side,y:at?at.y:y,r:C.r,progress:0};});m.point=m.bellPosts[0];
    }
    var walk = C.passages[m.kind];
    if (walk) s.props.routeEdges = [{ xMin: s.geo.xMin, xMax: -walk.half, yMin: m.y - walk.back, yMax: m.y + walk.ahead },
      { xMin: walk.half, xMax: s.geo.xMax, yMin: m.y - walk.back, yMax: m.y + walk.ahead }];
    if (spec.finishT) s.geo.holdT = spec.finishT;
    if (spec.kind === 'musician') {
      m.guide = s.obj.civ;
      m.guide.x = p.x; m.guide.y = p.y;
    }
    if (spec.kind === 'footbridge') {
      m.weight = { x: C.weight.x, y: p.y - C.weight.back };
      if (P.Events.blocked(s, m.weight.x, m.weight.y)) m.weight.x = 0;
    }
  };

  function signal(s, m, suffix, position) {
    s.events.push({ type: 'routeBeat', phase: 'galata_' + m.kind + '_' + suffix, x: position.x, y: position.y });
  }

  function guide(s, m, dt) {
    var c = m.guide, K = C.guide;
    if (!c.joined && P.RouteMilestones.inRing(s, c, K.meetR)) { c.joined = true; signal(s, m, 'joined', c); }
    c.pinned = P.Events.near(s, c.x, c.y, K.waitR).some(function (e) { return e.state === 'active'; });
    c.walking = c.joined && !c.pinned && P.RouteMilestones.inRing(s, c, K.followR);
    if (c.walking) c.y = Math.min(m.y - K.unlockAhead, c.y + K.speed * dt * P.LocalChoices.guide(s, c, dt));
    if (c.y < m.y - K.unlockAhead) return false;
    P.Objectives.resolve(s, s.obj, true);
    return true;
  }

  function bell(s, m, dt) {
    chooseBell(s,m);var p = m.point, K = C.bell;
    if (!m.arrived && s.hero.y >= p.y - K.approach) {
      m.arrived = true; m.bellGroup=[];
      for (var i = 0; i < K.n; i++) {
        var x = K.width * ((i % 3) - 1) * 0.46, y = m.y + K.arrivalAhead + Math.floor(i / 3) * 0.75;
        var at=P.WalkPath.nearest(s,{x:x,y:y},P.CFG.enemies.walker.radius);if(!at)continue;x=at.x;y=at.y;
        var e=P.Events.spawn(s, null, 'walker', x, y, { state: 'turning', stateT: P.CFG.levels.bossIntro, skin: 'musician' });
        if(e)m.bellGroup.push(e);
      }
    }
    if (!P.RouteMilestones.hold(s, p, m.useT, dt)) return false;
    if (m.rungAt === undefined) {
      m.rungAt = s.t;
      var x0=p.x;
      m.lure = { x: x0, y: p.y };
      (m.bellGroup||[]).forEach(function (e) {
        if (!e.boss&&!e.dead) e.lure = { x: x0, y: p.y, t: K.lureT };
      });
      signal(s, m, 'rang', p);
    }
    return s.t - m.rungAt >= K.clearT;
  }
  function chooseBell(s,m){
    if(!m.bellPosts||m.rungAt!==undefined)return;
    m.point=m.bellPosts.reduce(function(a,b){return Math.hypot(s.hero.x-a.x,s.hero.y-a.y)<=Math.hypot(s.hero.x-b.x,s.hero.y-b.y)?a:b;});
  }

  G.ready = function (s, m, dt) {
    if (m.kind === 'musician') return guide(s, m, dt);
    if (m.kind === 'bell') return bell(s, m, dt);
    if (m.weight && !m.carrying) {
      if (s.hero.streetHolding || !P.RouteMilestones.inRing(s, m.weight, C.weight.pickupR)) return false;
      m.carrying = true;
      signal(s, m, 'picked_up', m.weight);
    }
    return P.RouteMilestones.hold(s, m.point, m.useT, dt);
  };

  G.target = function (s, m) {
    chooseBell(s,m);
    if (m.weight && !m.carrying) return [m.weight.x, m.weight.y];
    if (m.kind === 'musician') {
      var c = m.guide;
      if (!c.joined || c.pinned || !P.RouteMilestones.inRing(s, c, C.guide.followR)) return [c.x, c.y];
      return [c.x, m.y - C.guide.unlockAhead];
    }
    return [m.point.x, m.point.y];
  };

  G.attack = function (s, e, a, def, name, tele) {
    if (name !== 'counterweights') return false;
    var K = def.weights, h = s.hero, count = e.phase === 1 ? K.first : K.second;
    a.W = tele(K.windup * a.wm);
    a.weightsLeft = count;
    for (var i = 0; i < count; i++) {
      var side = a.dir.x >= 0 ? 1 : -1, spread = i * K.spacing;
      var x = Math.max(s.geo.xMin + 1, Math.min(s.geo.xMax - 1, h.x + spread * a.dir.y * side));
      var y = Math.max(s.geo.holdY - 4, Math.min(s.geo.exitY - 1, h.y - spread * a.dir.x * side));
      var warning = P.Enemies.ring(s, x, y, K.r, a.W + i * K.delay, 'galataWeight', 'slam',
        { owner: e.id, cause: 'bellkeeper', dmg: P.Enemies.dmgOf(s, e, K.dmg), kb: K.kb });
      warning.counterweight = true;
    }
    return true;
  };

  G.dropWeight = function (s, tg) {
    var h = s.hero, e = s.gen && s.gen.boss;
    if (!e || e.dead || e.id !== tg.owner) return;
    var dx = h.x - tg.x, dy = h.y - tg.y;
    if (Math.hypot(dx, dy) <= tg.r + P.CFG.hero.radius) {
      P.Combat.damageHero(s, tg.dmg, tg.cause);
      P.Combat.pushHero(s, dx, dy, tg.kb);
    }
    s.events.push({ type: 'bruteStomp', x: tg.x, y: tg.y, r: tg.r });
    if (--e.ai.weightsLeft === 0) P.Bosses.exposeFor(s, e, P.CFG.bosses.bellkeeper.weights.reset);
  };

  return G;
})();
