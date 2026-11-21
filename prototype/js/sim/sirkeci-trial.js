// Sirkeci's required route actions and their finite encounter waves.
P.SirkeciTrial = (function () {
  var S = {}, C = P.CFG.levels.sirkeciMilestones, M = P.RouteMilestones;
  function point(x, y, r) { return { x: x, y: y, r: r || C.r, progress: 0 }; }
  function beat(s, m, phase, p) {
    s.events.push({ type: 'routeBeat', phase: m.kind + '_' + phase, x: p.x, y: p.y });
  }

  S.init = function (s) {
    var spec = P.CFG.levels.sirkeciRoutes[s.levelIndex], kind = spec.kind;
    var behind = kind === 'stationClock' ? C.clock.fuseBehind : C.padY;
    var y = M.clearLane(s, Math.round(s.geo.holdY * spec.at), spec.gap, behind, C, 0, Infinity);
    var x = kind === 'stationDeparture' || kind === 'stationClock' ? -C.side : kind === 'stationPoints' ? C.side : 0;
    var m = { kind: kind, sirkeci: true, y: y + spec.gap, point: point(x, y), pressure: spec.pressure,
      useT: spec.useT, openT: spec.openT, opening: 0, open: false };
    s.milestone = m;
    if (kind === 'stationDeparture') {
      var d = C.departure;
      m.train = { t: 0, front: m.y + d.front, solid: { xMin: d.x - d.width / 2, xMax: d.x + d.width / 2 } };
      positionTrain(m, m.train.front);
      s.props.routeEdges = [m.train.solid];
    }
    if (kind === 'stationGuide') m.guide = point(0, y);
    if (kind === 'stationClock') { m.fuse = point(C.side, y - behind, C.clock.fuseR); m.clockGate={opening:0,t:0}; }
    if (kind === 'stationLights') {
      var side = s.runMode === 'nightmare' ? -1 : 1;
      m.lights = { on: false, passed: 0, steps: C.lights.steps.map(function (d) {
        return point(x + d[0] * side, y + d[1], C.lights.stepRadius);
      }) };
    }
  };

  function spawn(s, types, y) {
    types.forEach(function (type, i) {
      var q = { x: i - (types.length - 1) / 2, y: y + i * C.padY };
      P.World.clampGeo(q, P.CFG.enemies[type].radius, s.props);
      P.Events.spawn(s, null, type, q.x, q.y, { skin: 'commuter' });
    });
  }

  function positionTrain(m, front) {
    m.train.front = front;
    m.train.solid.yMax = front;
    m.train.solid.yMin = front - C.departure.length;
  }

  function departure(s, m, dt) {
    if (!M.hold(s, m.point, m.useT, dt)) return false;
    var K = C.departure, q = m.train;
    if (q.t === 0) beat(s, m, 'bell', m.point);
    q.t = Math.min(K.bellT + K.T, q.t + dt);
    var p = Math.max(0, (q.t - K.bellT) / K.T);
    positionTrain(m, m.y + K.front + K.travel * p * p);
    if (p >= 1) s.props.routeEdges = [];
    return p >= 1;
  }

  function escort(s, m, dt) {
    var K = C.guide, q = m.guide;
    if (!q.joined && M.inRing(s, q, q.r)) {
      q.joined = true; beat(s, m, 'joined', q);
      spawn(s, K.waves[0], q.y - C.lights.waveBack);
    }
    if (!q.joined) return false;
    q.pinned = P.Events.near(s, q.x, q.y, K.coverR).some(function (e) { return e.state === 'active'; });
    q.walking = !q.pinned && M.inRing(s, q, K.followR);
    if (q.walking) q.y = Math.min(m.y - K.stopBefore, q.y + K.speed * dt * P.LocalChoices.guide(s, q, dt));
    if (!q.wave && q.y >= m.point.y + K.waitAt) {
      q.wave = true; spawn(s, K.waves[1], m.y + C.lights.waveAhead);
    }
    return q.y >= m.y - K.stopBefore && M.hold(s, q, m.useT, dt);
  }

  function clock(s, m, dt) {
    if (!m.fuse.collected && M.inRing(s, m.fuse, m.fuse.r)) {
      m.fuse.collected = true; beat(s, m, 'fuse', m.fuse);
    }
    if (!m.fuse.collected || !M.hold(s, m.point, m.useT, dt)) return false;
    m.clockLiveAt = s.t;
    beat(s, m, 'live', m.point);
    return true;
  }

  S.post=function(s,m,dt) {
    var q=m.clockGate,K=C.clock;if(!q||!m.open)return;
    var h=s.hero,near=Math.abs(h.y-m.y)<K.safePad+P.CFG.hero.radius;
    if(h.y>m.y+K.safePad+P.CFG.hero.radius){q.passed=true;s.props.routeEdges=[];return;}
    if(q.passed)return;
    var total=K.openT+K.closeT+K.closedT+K.liftT,t=q.t%total;
    if(t<K.openT)q.opening=1;
    else if(t<K.openT+K.closeT)q.opening=1-(t-K.openT)/K.closeT;
    else if(t<K.openT+K.closeT+K.closedT)q.opening=0;
    else q.opening=(t-K.openT-K.closeT-K.closedT)/K.liftT;
    // A closing gate waits for a body in its threshold; it never crushes or teleports either companion.
    var companion=s.companion;
    if(near||companion&&Math.abs(companion.y-m.y)<K.safePad){q.opening=1;s.props.routeEdges=[];return;}
    q.t+=dt;
    s.props.routeEdges=q.opening<.55?[{xMin:s.geo.xMin,xMax:s.geo.xMax,
      yMin:m.y-K.depth/2,yMax:m.y+K.depth/2}]:[];
  };

  function lights(s, m, dt) {
    var K = C.lights, q = m.lights, p = m.point;
    if (!q.on && M.hold(s, p, m.useT, dt)) {
      q.on = true; beat(s, m, 'on', p); spawn(s, K.waves[0], p.y - K.waveBack);
      if (s.localChoice === 'lure') P.StreetPlaces.repel(s, p, P.CFG.env.streetWeapon.opportunity.x, p.y - K.waveBack);
    }
    if (!q.on) return false;
    var next = q.steps[q.passed];
    if (next && s.hero.y>=next.y && Math.abs(s.hero.x-next.x)<=next.r) {
      q.passed++; beat(s, m, 'step', next);
      if (q.passed === 1) spawn(s, K.waves[1], m.y + K.waveAhead);
    }
    return q.passed === q.steps.length;
  }

  S.station = function (m) {
    if (m.guide) return m.guide;
    if (m.fuse && !m.fuse.collected) return m.fuse;
    if (m.lights && m.lights.on) return m.lights.steps[m.lights.passed] || m.lights.steps[m.lights.steps.length - 1];
    return m.point;
  };
  S.target = function (s, m) {
    if (m.open) return null;
    var p = S.station(m), q = m.guide, K = C.guide;
    if (q && q.walking && s.hero.y + q.r >= q.y) return [q.x, Math.min(m.y - K.stopBefore, q.y + q.r)];
    return [p.x, p.y];
  };
  S.pressure = function (s, m) {
    return m.pressure * (!m.open && M.inRing(s, S.station(m), C.route.stationRadius) ? C.route.stationPressure : 1);
  };
  S.ready = function (s, m, dt) {
    if (m.train) return departure(s, m, dt);
    if (m.guide) return escort(s, m, dt);
    if (m.fuse) return clock(s, m, dt);
    if (m.lights) return lights(s, m, dt);
    return M.hold(s, m.point, m.useT, dt);
  };
  return S;
})();
