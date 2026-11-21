// The quay, ferry, tram switch, market and loading dock each open their own passage.
P.KarakoyTrial = (function () {
  var K = {}, C = P.CFG.levels.karakoyMilestones, M = P.RouteMilestones;

  function point(x, y) { return { x: x, y: y, r: C.r, progress: 0 }; }
  function lane(s, spec, at, behind, min, max) {
    return M.clearLane(s, Math.round(s.geo.holdY * at), spec.gap, behind, C, min, max);
  }

  K.init = function (s) {
    var spec = P.CFG.levels.karakoyRoutes[s.levelIndex], kind = spec.kind;
    var y = lane(s, spec, spec.at, kind === 'cargoHook' ? C.hookBack : C.padY, 0, Infinity);
    var m = { kind: kind, karakoy: true, point: point(0, y), y: y + spec.gap,
      useT: spec.useT, openT: spec.openT, open: false, opening: 0, openedAt: null };
    s.milestone = m;
    if (kind === 'cargoHook') m.align = point(-1.25, y - C.hookBack);
    if (kind === 'ferryMooring') { m.wait = 0; m.packs = 0; }
    if (kind === 'fishShutters') initShutters(s, m, spec);
    if (kind === 'dockRamp' || kind === 'ferryMooring') {
      var edge = { yMin: m.y - 0.44, yMax: m.y + 1.15 };
      s.props.routeEdges = [
        Object.assign({ xMin: s.geo.xMin, xMax: -C.clearX }, edge),
        Object.assign({ xMin: C.clearX, xMax: s.geo.xMax }, edge),
      ];
    }
  };

  function initShutters(s, m, spec) {
    var a = lane(s, spec, C.shutterAt[0], C.padY, 0, m.point.y - C.shutterSpacing * 2);
    var b = lane(s, spec, C.shutterAt[1], C.padY, a + C.shutterSpacing, m.point.y - C.shutterSpacing);
    m.shutters = [sidePoint(s,-1,a),sidePoint(s,1,b),m.point];
    m.raised = 0;
  }

  function sidePoint(s,side,y){
    for(var d=0;d<=C.shutterSeek;d+=C.padY)for(var i=0;i<C.shutterSides.length;i++){
      var x=side*C.shutterSide*C.shutterSides[i],ys=[y+d,y-d];
      for(var j=0;j<ys.length;j++)if(!P.Events.blocked(s,x,ys[j]))return point(x,ys[j]);
    }
    return point(side*C.shutterSide*C.shutterSides[C.shutterSides.length-1],y);
  }

  function signal(s, m, p, action) {
    s.events.push({ type: 'routeBeat', phase: 'karakoy_' + m.kind + '_' + action, x: p.x, y: p.y });
  }

  function pack(s, types, y, skin) {
    return types.map(function (type, i) {
      var x = (i - (types.length - 1) * 0.5) * C.pack.spacing;
      var p = { x: x, y: y + (i % 2) * C.pack.spacing };
      P.World.clampGeo(p, P.CFG.enemies[type].radius || P.CFG.hero.radius, s.props);
      return P.Events.spawn(s, null, type, p.x, p.y, { skin: skin });
    }).filter(Boolean);
  }

  function ferry(s, m, dt) {
    if (!M.hold(s, m.point, m.useT, dt)) return false;
    if (m.packs === 0) {
      pack(s, C.pack.ferry, m.point.y - C.pack.back, 'tourist'); m.packs++;
      signal(s, m, m.point, 'line_out');
    }
    // Once the mooring is secured the boat docks independently; Arda may evade on the pier.
    m.wait = Math.min(C.ferryT, m.wait + dt);
    if (m.packs === 1 && m.wait >= C.secondPackAt) {
      pack(s, C.pack.ferry, m.point.y + C.pack.ferryAhead, 'worker'); m.packs++;
    }
    return m.wait >= C.ferryT;
  }

  function dock(s, m, dt) {
    if (!m.guards && s.hero.y >= m.point.y - C.approach) {
      m.guards = pack(s, C.pack.dock, m.point.y + C.pack.dockAhead, 'worker');
      m.guards.forEach(function (e) { e.routeGuard = true; });
    }
    if (!m.guards || m.guards.some(function (e) { return !e.dead; })) return false;
    return M.hold(s, m.point, m.useT, dt);
  }

  K.station = function (m) {
    if (m.align && m.align.progress < 1) return m.align;
    if (m.shutters) return m.shutters[m.raised] || m.point;
    return m.point;
  };
  K.target = function (m) { var p = K.station(m); return [p.x, p.y]; };
  K.pressure = function (s) {
    var m = s.milestone, rate = P.CFG.levels.karakoyRoutes[s.levelIndex].pressure;
    if (m.open || !M.inRing(s, K.station(m), C.route.stationRadius)) return rate;
    return rate * C.route.stationPressure;
  };

  function distract(s, p) {
    if (!p.x) return;
    var L = C.shutterLure, x = Math.sign(p.x) * L.x, y = p.y - L.back;
    if (P.Events.blocked(s, x, y)) return;
    var count = 0;
    P.Events.near(s, p.x, p.y, L.radius).forEach(function (e) {
      if (e.boss || e.elite) return;
      e.lure = { x: x, y: y, t: L.time };
      count++;
    });
    if (count) p.divertUntil = s.t + L.time;
  }

  K.ready = function (s, m, dt) {
    if (m.kind === 'ferryMooring') return ferry(s, m, dt);
    if (m.kind === 'dockRamp') return dock(s, m, dt);
    var p = K.station(m);
    var useT=m.useT*(p===m.align?C.hookGrabMul:m.shutters?C.shutterReleaseMul[m.raised]:1);
    if (!M.hold(s, p, useT, dt)) return false;
    if (p === m.align) { signal(s, m, p, 'aligned'); return false; }
    if (!m.shutters) return true;
    p.raisedAt = s.t;
    distract(s, p);
    m.raised++;
    signal(s, m, p, 'shutter_up');
    return m.raised === m.shutters.length;
  };

  return K;
})();
