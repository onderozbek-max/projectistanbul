// Each encounter changes the bridge deck after the required work is done.
P.BridgeTrial = (function () {
  var B = {}, C = P.CFG.levels.bridgeMilestones, M = P.RouteMilestones;

  function point(x, y) { return { x: x, y: y, r: C.r, progress: 0 }; }
  function find(s, spec, ideal, min, max) {
    var y = Math.max(Math.ceil(min), Math.min(Math.floor(max), Math.round(ideal)));
    return M.clearLane(s, y, spec.gap, C.padY, C, min, max);
  }

  B.init = function (s) {
    var spec = P.CFG.levels.bridgeRoutes[s.levelIndex];
    var zone = s.geo.zones.find(function (z) {
      return z.kind === (spec.kind === 'bridgeRescue' ? 'waterfront' : 'bridge');
    });
    var ideal = spec.deckOffset && zone ? zone.y0 + spec.deckOffset : s.geo.holdY * spec.at;
    var y = find(s, spec, ideal, zone ? zone.y0 + 2 : 0, zone ? zone.y1 - spec.gap - 1 : Infinity);
    var m = { kind: spec.kind, bridge: true, point: point(0, y), y: y + spec.gap, open: false,
      opening: 0, useT: spec.useT, openT: spec.openT, pressure: spec.pressure };
    if (m.kind === 'bridgeRescue') m.haul = 0;
    if (m.kind === 'bridgeScreens') {
      var first = find(s, spec, zone ? zone.y0 + C.firstScreenDeck : y - C.screenSeparation * 2,
        zone ? zone.y0 + 2 : 0, y - C.screenSeparation);
      m.screens = [point(-0.8, first), point(0.8, y)]; m.closed = 0; m.gust = 0;
    }
    if (m.kind === 'bridgeWave') {
      m.waves = 0; m.wave = 0; m.warn = false;
      var firstSide = s.runMode === 'nightmare' ? 1 : -1;
      m.braces = [point(firstSide * C.waveSide, y), point(-firstSide * C.waveSide, y)];
      m.braces.forEach(function (p) { p.r = C.waveR; });
      m.point = m.braces[0];
    }
    if (m.kind === 'bridgeLift') {
      var edge = { yMin: m.y - .45, yMax: m.y + C.liftDepth - .45 };
      s.props.routeEdges = [
        Object.assign({ xMin: s.geo.xMin, xMax: -C.liftHalf }, edge),
        Object.assign({ xMin: C.liftHalf, xMax: s.geo.xMax }, edge),
      ];
    }
    s.milestone = m;
  };

  function event(s, m, p, suffix) {
    s.events.push({ type: 'routeBeat', phase: m.kind + '_' + suffix, x: p.x, y: p.y });
  }

  function rescue(s, m, dt) {
    var p = m.point;
    if (!M.hold(s, p, m.useT, dt)) return false;
    if (!m.line) { m.line = true; event(s, m, p, 'line'); }
    p.hauling = M.inRing(s, p, C.rescueR);
    if (p.hauling) m.haul = Math.min(1, m.haul + dt / C.rescueT);
    if (m.haul < 1) return false;
    P.Events.drop(s, 'simit', p.x, p.y + 0.64, C.rescueHeal);
    s.drops[s.drops.length-1].origin={x:C.rescueEndX-.45,y:p.y+.7};
    event(s, m, p, 'safe');
    return true;
  }

  function screens(s, m, dt) {
    var p = B.station(m), near = M.inRing(s, p, C.screenR);
    if (near) {
      m.gust += dt;
      if (m.gust >= C.gustWarn + C.gustT) m.gust = 0;
      if (m.gust > C.gustWarn) {
        s.hero.x += (m.closed === 0 ? 1 : -1) * C.gustPush * dt;
        P.World.clampHero(s, s.hero);
      }
    } else m.gust = 0;
    if (!M.hold(s, p, m.useT, dt)) return false;
    p.closedAt = s.t; m.closed++; m.gust = 0;
    event(s, m, p, 'closed');
    return m.closed === m.screens.length;
  }

  function wave(s, m, dt) {
    var p = m.point, since = m.wave;
    if (!m.warn && M.inRing(s, p, m.waveStarted ? C.waveRetry : C.waveArm)) {
      if (!m.waveStarted) {
        m.waveStarted = true;
        P.Events.drop(s, 'simit', p.x, p.y, C.waveHeal);
      }
      m.warn = true; event(s, m, p, 'warning');
    }
    if (!m.warn) return false;
    m.wave += dt;
    p.bracing = M.inRing(s, p, p.r);
    if (since < C.waveWarn && m.wave >= C.waveWarn) crest(s, m, p);
    if (m.wave < C.waveWarn + C.waveT) return false;
    if (m.waves >= C.waveN) return true;
    if (m.wave >= C.waveWarn + C.waveT + C.waveRest) {
      m.wave = 0; m.warn = false; m.point = m.braces[m.waves];
      if (m.waves) event(s, m, m.point, 'next');
    }
    return false;
  }

  function crest(s, m, p) {
    var back = p.y - C.waveBack;
    s.enemies.forEach(function (e) {
      if (!e.dead && !e.boss && e.y >= back && e.y <= m.y) {
        P.Combat.damageEnemy(s, e, C.waveEnemyDmg, 0, -1, C.waveEnemyPush, false, 'bridgeWave');
      }
    });
    s.zones = s.zones.filter(function (z) {
      return (z.kind !== 'acid' && z.kind !== 'toxic') || z.y < back || z.y > m.y;
    });
    if (p.bracing) { m.waves++; event(s, m, p, 'braced'); }
    else if (s.hero.y >= back && s.hero.y <= m.y && P.Combat.damageHero(s, C.waveDmg, 'bridgeWave') > 0) {
      P.Combat.pushHero(s, 0, -1, C.wavePush);
    }
  }

  B.station = function (m) { return m.screens && m.screens[m.closed] || m.point; };
  B.target = function (m) { var p = B.station(m); return [p.x, p.y]; };
  B.pressure = function (s, m) {
    return m.pressure * (!m.open && M.inRing(s, B.station(m), C.route.stationRadius) ? C.route.stationPressure : 1);
  };
  B.ready = function (s, m, dt) {
    if (m.kind === 'bridgeRescue') return rescue(s, m, dt);
    if (m.kind === 'bridgeScreens') return screens(s, m, dt);
    if (m.kind === 'bridgeWave') return wave(s, m, dt);
    return M.hold(s, m.point, m.useT, dt);
  };

  return B;
})();
