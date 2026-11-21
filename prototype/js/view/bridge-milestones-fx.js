P.BridgeFx = (function () {
  var F = {}, C = P.CFG.levels.bridgeMilestones, INK = '#202933', BRASS = '#D9AC6A', STEEL = '#648086';

  function pct(p) { return P.t('milestone.percent', { n: Math.floor(p * 100) }); }
  function seconds(t) { return P.t('route.seconds', { n: Math.ceil(Math.max(0, t)) }); }
  function ease(p) { return p * p * (3 - 2 * p); }
  function clamp(p) { return Math.max(0, Math.min(1, p)); }
  F.status = function (s, m, out) {
    var p = P.BridgeTrial.station(m);
    if (m.kind === 'bridgeRescue' && m.line) {
      out.key = p.hauling ? 'bridgeHaul' : 'bridgeHaulReturn'; out.detail = pct(m.haul);
    } else if (m.kind === 'bridgeWave') {
      var approach = m.waves ? 'bridgeWaveNext' : 'bridgeWaveIn';
      out.key = m.warn || m.waves ? approach : 'bridgeWave';
      out.detail = m.waves + ' / ' + C.waveN;
      if (m.warn && m.wave < C.waveWarn) {
        if (p.bracing) out.key = 'bridgeBrace';
        out.detail += ' · ' + seconds(C.waveWarn - m.wave);
      } else if (m.warn && m.wave < C.waveWarn + C.waveT) out.key = 'bridgeWaveHit';
    } else if (p.active && p.progress < 1) {
      out.key += 'Use'; out.detail = pct(p.progress);
    }
    if (m.screens) {
      if (m.gust >= C.gustWarn) out.key = 'bridgeGust';
      out.detail = m.closed + ' / ' + m.screens.length + (out.detail ? ' · ' + out.detail : '');
    }
    return out;
  };

  F.camera = function (s, m) {
    if (m.open || m.kind !== 'bridgeRescue' && m.kind !== 'bridgeLift') return null;
    var p = m.point, near = clamp(1 - Math.hypot(s.hero.x - p.x, s.hero.y - p.y) / 5);
    var working = m.kind === 'bridgeRescue' ? m.line ? 1 - m.opening : 0 : m.opening;
    return { x: m.kind === 'bridgeRescue' ? 1.16 : 0, y: p.y + 1.5, zoom: .045, weight: ease(near * working) };
  };

  function box(c, x, y, w, h, fill) {
    c.fillStyle = fill; c.fillRect(x, y, w, h);
    c.lineWidth = 1.5; c.strokeStyle = INK; c.strokeRect(x, y, w, h);
  }
  function line(c, ax, ay, bx, by, color, width) {
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.strokeStyle = color; c.lineWidth = width; c.stroke();
  }
  function rivet(c, x, y, r, color) {
    c.fillStyle = color; c.beginPath(); c.arc(x, y, r, 0, 2 * Math.PI); c.fill();
  }
  function winch(R, p) {
    var c = R.ctx, u = R.ppm, x = R.X(p.x + .74), y = R.Y(p.y + .31);
    box(c, x - .27 * u, y - .51 * u, .54 * u, .64 * u, STEEL);
    rivet(c, x, y - .35 * u, .15 * u, INK); rivet(c, x, y - .35 * u, .119 * u, BRASS);
    var a = p.progress * Math.PI * 2.8;
    line(c, x, y - .35 * u, x + Math.cos(a) * .36 * u, y + (-.35 + Math.sin(a) * .24) * u, INK, .085 * u);
  }
  function rail(R, s, m) {
    var c = R.ctx, u = R.ppm, y = R.Y(m.y), x = R.X(0), fraction = 1 - ease(m.opening);
    var coast = P.BridgeWater && P.StreetArt && P.StreetArt.current();
    [-1, 1].forEach(function (side) {
      var limit = side < 0 ? -s.geo.xMin : s.geo.xMax;
      if (coast) limit = Math.min(limit, P.BridgeWater.shore(s, m.y, side));
      var edge = R.X(side * limit), end = edge + (x - edge) * fraction;
      if (Math.abs(end - edge) < 1) return;
      box(c, Math.min(edge, end), y - .16 * u, Math.abs(end - edge), .24 * u, STEEL);
      line(c, edge, y - .14 * u, end, y - .14 * u, '#ACBCAD', .05 * u);
    });
  }
  function rods(R, m) {
    var c = R.ctx, u = R.ppm, x = R.X(0), y = R.Y(m.y);
    box(c, x - 2.35 * u, y - .2 * u, .64 * u, .62 * u, '#6C5444');
    var clear = ease(m.opening);
    for (var i = 0; i < 4; i++) {
      var base = x + (-2.18 + i * .09) * u, end = x + (1.95 - clear * 3.87) * u;
      var tip = y + (-.65 + i * .47 - clear * 1.9) * u;
      c.beginPath(); c.moveTo(base, y); c.quadraticCurveTo((base + end) / 2, tip - .18 * u, end, tip);
      c.lineWidth = .10 * u; c.strokeStyle = INK; c.stroke();
      c.lineWidth = .044 * u; c.strokeStyle = i % 2 ? '#95ADB0' : BRASS; c.stroke();
      if (clear < .94) line(c, end, tip, end + (.5 - m.point.progress * .42) * u, tip + .85 * u, '#E6DDC1', .026 * u);
    }
  }

  function fisher(R, m) {
    var c = R.ctx, u = R.ppm, p = m.point, q = ease(m.haul);
    var x = R.X(C.rescueStartX + (C.rescueEndX - C.rescueStartX) * q), y = R.Y(p.y + .22 + m.opening * 1.45);
    if (m.line && !m.open) {
      var axis=P.WorkControls.axis(R,p);
      c.beginPath(); c.moveTo(axis.x,axis.y);
      c.quadraticCurveTo((x + axis.x) / 2, y + (.15 - q * .4) * u, x - .35 * u, y - .75 * u);
      c.lineWidth = .088 * u; c.strokeStyle = INK; c.stroke();
      c.lineWidth = .039 * u; c.strokeStyle = '#EAD8AF'; c.stroke();
    }
    var pose=m.haul<.65?0:m.haul<1?1:2;
    if(!P.WorkStages.helper(c,pose,x,y,u,1)) P.CivilianActing.draw(c,x,y,u*1.3,-1,m.haul*9,m.opening>0,!m.open);
  }

  function windscreen(R, s, p, i, m) {
    var u = R.ppm, c = R.ctx, x = R.X(p.x), y = R.Y(p.y + 1.14), side = i === 0 ? -1 : 1;
    var progress = p.closedAt === undefined ? 0 : clamp((s.t - p.closedAt) / .62);
    var back = x + side * .25 * u, edge = back + side * (0.56 + ease(progress) * 1.25) * u;
    if (!P.WorkStages.weather(c,progress===0?1:0,(back+edge)/2,y+.16*u,u,Math.abs(edge-back)/u,1.5)) {
      box(c, Math.min(back, edge), y - 1.23 * u, Math.abs(edge - back), .98 * u, '#486A75');
      for (var j = 0; j < 4; j++) line(c, back, y - (1.09 - j * .195) * u, edge, y - (1.09 - j * .195) * u, '#A1AD9E', .041 * u);
      box(c, back - .065 * u, y - 1.34 * u, .13 * u, 1.5 * u, '#807F68');
    }
    if (progress > 0) {
      c.save();
      c.globalAlpha = progress * .85;
      var lee = x - side * .84 * u;
      for (var stripe = 0; stripe < 4; stripe++) {
        var track = y + (.21 + stripe * .29) * u;
        line(c, lee - .29 * u, track, lee + .29 * u, track, '#A6D9C5', .037 * u);
      }
      c.restore();
    }
    if (p !== P.BridgeTrial.station(m) || !m.gust || m.opening > 0) return;
    var blow = m.gust >= C.gustWarn, alpha = blow ? .48 : .23;
    for (var k = 0; k < 5; k++) {
      var tail = ((m.gust * 1.65 + k * 1.31) % 6.0 - 3.0) * u;
      line(c, x - side * tail, y + (.42 + k * .39) * u, x - side * (tail + .65 * u), y + (.39 + k * .39) * u,
        'rgba(201,234,232,' + alpha + ')', .041 * u);
    }
  }

  function surf(R, s, m) {
    var c = R.ctx, u = R.ppm, y = R.Y(m.y), x = R.X(s.geo.xMin), w = (s.geo.xMax - s.geo.xMin) * u;
    var depth = (m.y - m.point.y + C.waveBack) * u;
    var sx = R.X(0), step = .30 * u;
    if (!P.WorkStages.draw(c,'stairs',sx,y+.10*u,u,3)) {
      box(c, sx - 1.5 * u, y - 1.80 * u, 3 * u, 1.68 * u, '#384754');
      for (var j = 0; j < 5; j++) {
        var ty = y - .17 * u - j * step, inset = j * .06 * u;
        line(c, sx - 1.37 * u + inset, ty, sx + 1.37 * u - inset, ty, j % 2 ? '#73898B' : '#91A4A0', .09 * u);
      }
    }
    if (m.warn && m.wave < C.waveWarn + C.waveT) {
      var age = clamp((m.wave - C.waveWarn) / C.waveT);
      c.fillStyle = m.wave < C.waveWarn ? 'rgba(72,141,163,.22)' : 'rgba(94,167,176,.45)';
      c.fillRect(x, y, w, depth);
      if (m.wave < C.waveWarn) c.setLineDash([.24 * u, .16 * u]);
      for (var i = 0; i < 3; i++) line(c, x, y + (age * .56 + i * .14) * depth, x + w,
        y + (age * .56 + i * .14) * depth, 'rgba(186,228,218,.66)', (i === 0 ? .075 : .036) * u);
      c.setLineDash([]);
    }
    m.braces.forEach(function (q) {
      var spot = R.X(q.x), base = R.Y(q.y), hot = m.point === q && !m.open;
      if (!P.WorkStages.weather(c,2,spot,base-.30*u,u,1.46)) {
        box(c, spot - .73 * u, base - .87 * u, 1.46 * u, .37 * u, hot ? '#AC885F' : '#655D61');
        line(c, spot - .68 * u, base - .82 * u, spot + .68 * u, base - .82 * u, hot ? BRASS : STEEL, .06 * u);
      }
    });
  }

  function lift(R, s, m) {
    var c = R.ctx, u = R.ppm, x = R.X(0), y = R.Y(m.y), p = ease(m.opening), half = C.liftHalf * u;
    c.fillStyle = '#293D47'; c.fillRect(R.X(s.geo.xMin), y - (C.liftDepth - .45) * u, (s.geo.xMax - s.geo.xMin) * u, C.liftDepth * u);
    if(P.WorkStages.landing(c,'gangway',x,y,u,C.liftHalf*2,p))return;
    box(c, x - half, y + (.40 - .22 * p - 1.40 * p) * u, half * 2, (.18 + p * 1.40) * u, '#7D8A81');
    for (var i = 0; i < 7; i++) {
      line(c, x + (i - 3) * .53 * u, y + (.38 - 1.58 * p) * u, x + (i - 3) * .53 * u,
        y + (.48 - .2 * p) * u, '#57656A', .047 * u);
    }
    [-1, 1].forEach(function (side) {
      var ax = x + side * half;
      box(c, ax - .12 * u, y - 1.42 * u, .24 * u, 2.27 * u, '#926C4E');
      rivet(c, ax, y - 1.18 * u, .078 * u, m.open ? '#9CD6B0' : BRASS);
    });
  }

  F.world = function (R, s, m) {
    var p = P.BridgeTrial.station(m), c = R.ctx;
    c.save();
    if (Math.abs(m.y - s.hero.y) < 24) {
      rail(R, s, m);
      if (m.kind === 'bridgeRods') rods(R, m);
      if (m.kind === 'bridgeRescue') {
        var x = R.X(P.CFG.layouts.waterfront.seaX), y = R.Y(p.y + .65), u = R.ppm;
        box(c, x - .09 * u, y - 1.4 * u, .16 * u, 2.9 * u, STEEL);
      }
      if (m.kind === 'bridgeWave') surf(R, s, m);
      if (m.kind === 'bridgeLift') lift(R, s, m);
    }
    if (m.screens) m.screens.forEach(function (q, i) { if (Math.abs(q.y - s.hero.y) < 20) windscreen(R, s, q, i, m); });
    if (Math.abs(p.y - s.hero.y) < 22) {
      if (m.kind !== 'bridgeWave' && !P.WorkControls.draw(R,p,m.kind,m.open)) winch(R, p);
      if (!m.open && !m.opening) {
        var r = m.line ? C.rescueR : p.r;
        var progress = m.line ? m.haul : p.bracing ? clamp(m.wave / C.waveWarn) : p.progress;
        P.MilestoneFx.ring(R, p, r, progress);
      }
    }
    c.restore();
  };

  F.air = function (R, s) {
    var m = s.milestone;
    if (m && m.kind === 'bridgeRescue' && Math.abs(s.hero.y - m.y) < 22) fisher(R, m);
  };

  F.tool = function (c, u, a) {
    if (a.p.bracing) { box(c, -.08 * u, -.072 * u, .23 * u, .14 * u, INK); return; }
    c.rotate(-.65 + ease(a.progress) * 1.26);
    line(c, -.07 * u, 0, .42 * u, -.23 * u, INK, .125 * u);
    line(c, -.06 * u, 0, .41 * u, -.22 * u, a.p.hauling ? '#E5D7B4' : BRASS, .05 * u);
  };
  return F;
})();
