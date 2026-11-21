// Required street encounters. The road opens after the payoff finishes.
P.RouteMilestones = (function () {
  var M = {}, K = P.CFG.levels.routeMilestones;

  M.init = function (s) {
    if (P.CFG.levels.sirkeciRoutes[s.levelIndex]) { P.SirkeciTrial.init(s); return; }
    if (P.CFG.levels.eminonuRoutes[s.levelIndex]) { P.EminonuTrial.init(s); return; }
    if (P.CFG.levels.bridgeRoutes[s.levelIndex]) { P.BridgeTrial.init(s); return; }
    if (P.CFG.levels.karakoyRoutes[s.levelIndex]) { P.KarakoyTrial.init(s); return; }
    if (P.CFG.levels.galataRoutes[s.levelIndex]) { P.GalataTrial.init(s); return; }
    var kind = { 'tram-stop': 'tram', 'tram-crossing': 'cart', 'live-wires': 'wires', vatman: 'depot' }[s.routeTrial];
    if (!kind) return;
    var G = s.geo, C = P.CFG.levels, point, y;
    if (kind === 'tram') y = C.tramStop.y + K.tram.gateAhead;
    if (kind === 'cart') y = s.obj.b.y + K.cart.gateAhead;
    if (kind === 'wires') y = G.holdY - K.wires.gateBefore;
    if (kind === 'depot') {
      point = { x: K.depot.x, y: G.holdY - K.depot.before, r: K.ringR, progress: 0 };
      if (P.Events.blocked(s, point.x, point.y)) point.x = 0;
      y = point.y + K.depot.gateAhead;
    }
    s.milestone = { kind: kind, y: y, point: point, open: false, opening: 0, openedAt: null };
    if(kind==='wires'){s.milestone.wireScreens=s.obj.items.slice(0,2).map(function(it,i){return{source:it,box:{xMin:i?-K.wires.flankX:s.geo.xMin,xMax:i?s.geo.xMax:K.wires.flankX,yMin:it.y+K.wires.laneAhead,yMax:it.y+K.wires.laneAhead+K.wires.screenDepth}};});M.wireEdges(s);}
  };

  M.wireEdges=function(s){var m=s.milestone;if(!m||!m.wireScreens)return;
    s.props.routeEdges=m.wireScreens.filter(function(q){return q.source.cutAt===undefined;}).map(function(q){return q.box;});};

  M.clamp = function (s, h) {
    var m = s.milestone, r = P.CFG.hero.radius;
    if (!m.open) h.y = Math.min(h.y, m.y - r);
  };

  function opened(s, m) {
    P.LocalChoices.resolve(s);
    m.open = true; m.openedAt = s.t;
    s.routeReliefUntil = s.t + P.CFG.levels.encounterPace.reliefT;
    s.events.push({ type: 'routeBeat', phase: 'milestone_' + m.kind + '_open', x: 0, y: m.y, aftercare: P.LocalChoices.aftercare(s) });
  }

  M.step = function (s, dt) {
    var m = s.milestone;
    if(m && m.sirkeci && P.SirkeciTrial.post)P.SirkeciTrial.post(s,m,dt);
    if (!m || m.open) return;
    P.LocalChoices.step(s, dt);
    if (m.kind === 'tram') {
      var H = s.gen.tramControl;
      if (H && H.state === 'done' && !H.tram) opened(s, m);
      return;
    }
    if (m.kind === 'depot') {
      var p = m.point;
      p.active = M.inRing(s, p, p.r) && p.progress < 1;
      if (p.active) p.progress = Math.min(1, p.progress + dt / K.depot.crankT);
    }
    if (m.opening === 0 && !ready(s, m, dt)) return;
    if (m.opening === 0) s.events.push({ type: 'milestoneLift', kind: m.kind, x: 0, y: m.y });
    m.opening = Math.min(1, m.opening + dt / (m.openT || K.openT));
    if (m.opening >= 1) opened(s, m);
  };

  function ready(s, m, dt) {
    if (m.sirkeci) return P.SirkeciTrial.ready(s, m, dt);
    if (m.eminonu) return P.EminonuTrial.ready(s, m, dt);
    if (m.bridge) return P.BridgeTrial.ready(s, m, dt);
    if (m.karakoy) return P.KarakoyTrial.ready(s, m, dt);
    if (m.galata) return P.GalataTrial.ready(s, m, dt);
    return m.kind === 'depot' ? m.point.progress >= 1 : s.obj.state === 'done';
  }

  M.inRing = function (s, p, radius) { return Math.hypot(s.hero.x - p.x, s.hero.y - p.y) <= radius; };
  M.pastClosedGate = function (s, y) { return !!(s.milestone && !s.milestone.open && y > s.milestone.y); };
  M.pace = function (s) {
    var m = s.milestone, C = P.CFG.levels;
    return m && (m.sirkeci ? C.sirkeciMilestones.route : m.eminonu ? C.eminonuMilestones.route :
      m.karakoy ? C.karakoyMilestones.route : m.bridge ? C.bridgeMilestones.route : m.galata ? C.galataMilestones.route : null);
  };
  M.pressure = function (s) {
    var m = s.milestone;
    if (m && m.sirkeci) return P.SirkeciTrial.pressure(s, m);
    if (m && m.galata) {
      var K = P.CFG.levels.galataMilestones.route, p = m.guide || m.point;
      return !m.open && M.inRing(s, p, K.stationRadius) ? K.stationPressure : K.travelPressure;
    }
    if (m && m.eminonu) return P.EminonuTrial.pressure(s, m);
    return m && m.karakoy ? P.KarakoyTrial.pressure(s) : m && m.bridge ? P.BridgeTrial.pressure(s, m) : 1;
  };
  M.hold = function (s, p, seconds, dt) {
    p.active = M.inRing(s, p, p.r) && p.progress < 1;
    if (p.active) p.progress = Math.min(1, p.progress + dt / seconds);
    return p.progress >= 1;
  };

  M.clearLane = function (s, ideal, gap, behind, C, minY, maxY) {
    for (var d = 0; d <= C.seekY; d += C.stepY) {
      var ys = [ideal + d, ideal - d];
      for (var i = 0; i < ys.length; i++) {
        var y = ys[i];
        if (y < minY || y > maxY || y - behind < C.padY || y + gap >= s.geo.holdY - C.padY) continue;
        var blocked = s.geo.blocks.some(function (b) {
          return b.rc.xMax > -C.clearX && b.rc.xMin < C.clearX &&
            b.rc.yMax > y - behind - C.padY && b.rc.yMin < y + gap + C.padY;
        });
        if (!blocked) return y;
      }
    }
    return ideal;
  };

  M.nextWire = function (s) {
    var h = s.hero, best, bestD = Infinity;
    s.obj.items.forEach(function (it) {
      var d = Math.hypot(h.x - it.x, h.y - it.y);
      if (!it.got && d < bestD) { best = it; bestD = d; }
    });
    return best;
  };

  M.cut = function (s, it, dt) {
    if (!M.inRing(s, it, K.ringR)) { it.progress = 0; return false; }
    if (s.hero.moving) return false;
    it.progress = Math.min(1, (it.progress || 0) + dt / K.wires.cutT);
    if (it.progress < 1) return false;
    it.cutAt = s.t;
    P.IstiklalTrial.wire(s, it);
    M.wireEdges(s);
    return true;
  };

  M.target = function (s) {
    var m = s.milestone;
    if (m && m.sirkeci) return P.SirkeciTrial.target(s, m);
    if (m && m.eminonu) return P.EminonuTrial.target(s, m);
    if (!m || m.open) return null;
    if (m.bridge) return P.BridgeTrial.target(m);
    if (m.karakoy) return P.KarakoyTrial.target(m);
    if (m.galata) return P.GalataTrial.target(s, m);
    if (m.kind === 'depot') return [m.point.x, m.point.y];
    if (m.kind === 'wires') {
      var it = M.nextWire(s);
      return it ? [it.x, it.y] : null;
    }
    return P.Objectives.botTarget(s);
  };

  return M;
})();
