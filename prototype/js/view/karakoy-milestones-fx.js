// Dock hardware and controls draw from the live progress of each required encounter.
P.KarakoyFx = (function () {
  var F = {}, C = P.CFG.levels.karakoyMilestones, INK = '#22262D';
  var GOLD = '#FFD166', CORAL = '#C46D52', GREEN = '#9CE7B5';

  F.status = function (s, m, out) {
    var p = P.KarakoyTrial.station(m);
    var last = m.shutters && m.shutters[m.raised - 1];
    if (m.shutters) out.detail = m.raised + ' / ' + m.shutters.length + (out.detail ? ' · ' + out.detail : '');
    if (last && last.divertUntil > s.t && !p.active) {
      out.key = last.x < 0 ? 'shutterSlipRight' : 'shutterSlipLeft';
      return out;
    }
    if (m.align && p !== m.align) out.key = 'cargoSecure';
    if (m.guards && m.guards.some(function (e) { return !e.dead; })) {
      out.key = 'dockClear';
      out.detail = m.guards.filter(function (e) { return e.dead; }).length + ' / ' + m.guards.length;
    } else if (m.guards) out.key = 'dockLever';
    if (m.kind === 'ferryMooring' && p.progress >= 1) {
      out.key = 'ferryHold';
      out.detail = P.t('route.seconds', { n: Math.ceil(C.ferryT - m.wait) });
    } else if (p.active && p.progress < 1) {
      out.key += 'Use';
      var progress = P.t('milestone.percent', { n: Math.floor(p.progress * 100) });
      out.detail = m.shutters ? out.detail + ' · ' + progress : progress;
    }
    return out;
  };

  function smooth(t) { return t * t * (3 - 2 * t); }
  F.camera = function (s, m) {
    if (m.open || m.kind !== 'ferryMooring' && m.kind !== 'tramPoints') return null;
    var near = Math.max(0, 1 - Math.hypot(s.hero.x - m.point.x, s.hero.y - m.point.y) / 5);
    var payoff = m.kind === 'ferryMooring' ? Math.min(1, m.wait / 2) : Math.min(1, m.opening * 5);
    return { x: m.kind === 'ferryMooring' ? 1.05 : 0, y: m.point.y + 3, zoom: 0, weight: smooth(near * payoff) };
  };
  function box(c, x, y, w, h, color) {
    c.fillStyle = color; c.fillRect(x, y, w, h);
    c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(x, y, w, h);
  }
  function line(c, x, y, x1, y1, width, color) {
    c.strokeStyle = color; c.lineWidth = width;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x1, y1); c.stroke();
  }
  function control(R, x, y, progress, ready) {
    var c = R.ctx, u = R.ppm;
    box(c, x - .25 * u, y - .55 * u, .50 * u, .62 * u, '#4A5E65');
    line(c, x, y - .27 * u, x + (.25 - .5 * progress) * u, y - .76 * u, .10 * u, INK);
    c.fillStyle = ready ? GREEN : GOLD;
    c.beginPath(); c.arc(x + (.25 - .5 * progress) * u, y - .76 * u, .104 * u, 0, Math.PI * 2); c.fill();
  }

  function gate(R, s, m) {
    var c = R.ctx, x = R.X(0), y = R.Y(m.y), u = R.ppm;
    var edges = [R.X(s.geo.xMin), R.X(s.geo.xMax)];
    edges.forEach(function (edge, i) {
      var end = edge + (x - edge) * (1 - smooth(m.opening));
      if (Math.abs(edge - end) > 1) {
        box(c, Math.min(edge, end), y - .15 * u, Math.abs(edge - end), .30 * u, '#7F6450');
        for (var bx = Math.min(edge, end) + .22 * u; bx + .26 * u < Math.max(edge, end); bx += .62 * u) {
          line(c, bx, y + .06 * u, bx + .23 * u, y - .06 * u, .09 * u, '#E3B57C');
        }
      }
      control(R, edge + (i ? -.25 : .25) * u, y + .22 * u, 0, m.open);
    });
  }

  function passage(R, s, m) {
    var right = s.geo.xMax;
    if (P.StreetArt && P.StreetArt.current() && P.BridgeWater) right = Math.min(right, P.BridgeWater.shore(s, m.y, 1));
    var c = R.ctx, u = R.ppm, y = R.Y(m.y), w = (right - s.geo.xMin) * u;
    var left = R.X(s.geo.xMin), half = C.clearX * u, mid = R.X(0), h = 1.46 * u;
    box(c, left, y - h, w, h + .45 * u, '#415963');
    line(c, left, y - .84 * u, left + w, y - .84 * u, .038 * u, '#8CAFAF');
    if (P.WorkStages.landing(c,m.kind==='dockRamp'?'ramp':'gangway',mid,y+.26*u,u,C.clearX*2,smooth(m.opening))) return;
    var length = (.15 + smooth(m.opening) * 1.76) * u, width = half * 2;
    box(c, mid - half, y + .44 * u - length, width, length, m.kind === 'dockRamp' ? '#A17A55' : '#738180');
    for (var q = .22 * u; q < length; q += .28 * u) {
      line(c, mid - half + .10 * u, y + .44 * u - q, mid + half - .10 * u, y + .44 * u - q, .042 * u, '#30383D');
    }
    [-1, 1].forEach(function (side) {
      var x = mid + side * half;
      line(c, x, y + .43 * u, x, y + .44 * u - length, .12 * u, '#D3B28A');
    });
  }

  function gantry(c, x, top, u, hook) {
    var modern = P.StreetArt && P.StreetArt.current();
    if (modern && P.StreetArt.part(c, 'dock-crane', x - 3.47 * u, top - .03 * u, 5.35 * u, 3.51 * u)) {
      box(c, hook - .16 * u, top + .29 * u, .32 * u, .22 * u, '#8F6948');
      return top + .50 * u;
    }
    box(c, x - 3.31 * u, top, .26 * u, 3.45 * u, modern ? '#4F5153' : '#9A663E');
    box(c, x - 3.39 * u, top, 5.24 * u, .21 * u, modern ? '#4F5153' : '#C49755');
    return top + .15 * u;
  }

  function crane(R, m) {
    var c = R.ctx, u = R.ppm, x = R.X(0), y = R.Y(m.y);
    var lift = smooth(m.opening), hook = x + (-1.8 + 1.8 * smooth(m.align.progress) - 2.6 * lift) * u;
    var base = y - lift * 1.48 * u, cx = x - 2.6 * lift * u;
    var ropeTop = gantry(c, x, y - 3.25 * u, u, hook);
    var end = Math.max(ropeTop + .05 * u, base - 1.31 * u);
    line(c, hook, ropeTop, hook, end, .055 * u, '#3A393C');
    c.beginPath(); c.arc(hook + .12 * u, end, .12 * u, 0, Math.PI * 1.5);
    c.strokeStyle = GOLD; c.lineWidth = .076 * u; c.stroke();
    cargo(c, cx, base, u);
    if (m.point.progress > 0) {
      line(c, hook + .1 * u, end + .1 * u, cx - .60 * u, base - .96 * u, .033 * u, GOLD);
      line(c, hook + .1 * u, end + .1 * u, cx + .60 * u, base - .96 * u, .033 * u, GOLD);
    }
  }

  function cargo(c, x, y, u) {
    if (P.StreetArt && P.StreetArt.current()) {
      if (!P.StreetArt.part(c, 'dock-crate', x - .80 * u, y - 1.02 * u, 1.6 * u, 1.13 * u)) {
        box(c, x - .80 * u, y - 1.02 * u, 1.60 * u, 1.13 * u, '#564C44');
      }
      return;
    }
    box(c, x - .80 * u, y - .65 * u, 1.60 * u, .76 * u, '#9E7556');
    box(c, x - .80 * u, y - 1.02 * u, 1.60 * u, .37 * u, '#C49C73');
    line(c, x - .72 * u, y + .05 * u, x + .72 * u, y - .55 * u, .10 * u, '#DAAD7B');
  }

  function ferry(R, s, m) {
    if (P.StreetArt && P.StreetArt.current()) {
      var zone = s.geo.zones.find(function (z) { return z.kind === 'waterfront'; });
      if (!zone) return;
      var quay = P.CFG.layouts.waterfront.seaX, beam = 1.65, len = 5.8;
      var end = Math.max(zone.y0 + 11, Math.min(zone.y1 - len / 2, m.y));
      var meters = 7 * (1 - smooth(m.wait / C.ferryT)), y = end - meters, x = quay + beam / 2 + .22;
      P.StreetArt.hull(R, 'ferry', x, y, beam, len, false);
      if (m.point.progress >= 1) {
        line(R.ctx, R.X(quay - .08), R.Y(end - .6), R.X(x - .55), R.Y(y - .6), .044 * R.ppm, '#DDCFAB');
        if (m.open && s.localChoice === 'place') {
          line(R.ctx, R.X(quay - .08), R.Y(end + 1.1), R.X(x - .48), R.Y(y + 1.1), .044 * R.ppm, '#DDCFAB');
        }
      }
      return;
    }
    legacyFerry(R, m);
  }

  function legacyFerry(R, m) {
    var c = R.ctx, u = R.ppm, y = R.Y(m.y) - 1.97 * u;
    var x = R.X(1.95 + (1 - smooth(m.wait / C.ferryT)) * 8.7);
    c.save(); c.translate(x, y); c.scale(u, u);
    c.fillStyle = '#5F8E95'; c.beginPath(); c.ellipse(.30, .37, 3.17, .52, 0, 0, 2 * Math.PI); c.fill();
    c.beginPath(); c.moveTo(-2.75, -.23); c.lineTo(2.75, -.23); c.quadraticCurveTo(2.47, .57, 1.83, .65);
    c.lineTo(-1.82, .65); c.quadraticCurveTo(-2.47, .52, -2.75, -.23); c.fillStyle = '#9B493E'; c.fill();
    c.strokeStyle = INK; c.lineWidth = .06; c.stroke();
    c.fillStyle = '#E9CDA1'; c.fillRect(-2.32, -.34, 4.55, .27);
    c.fillStyle = '#F2DFB6'; c.fillRect(-1.65, -.92, 3.47, .62);
    c.fillStyle = '#598589'; c.fillRect(-1.75, -1.05, 3.65, .20);
    for (var i = 0; i < 6; i++) { c.fillStyle = '#374C59'; c.fillRect(-1.47 + i * .53, -.77, .32, .26); }
    c.fillStyle = '#B46147'; c.fillRect(.28, -1.42, .27, .43);
    c.restore();
    if (m.point.progress >= 1) {
      c.beginPath(); c.moveTo(R.X(1.43), R.Y(m.y) + .28 * u);
      c.quadraticCurveTo(x - 2.3 * u, y + 1.38 * u, x - 2.16 * u, y + .27 * u);
      c.strokeStyle = '#CCD4AD'; c.lineWidth = .07 * u; c.stroke();
    }
  }

  function shutter(R, s, p, i) {
    var x = R.X(p.x), y = R.Y(p.y) - .55 * R.ppm, u = R.ppm, c = R.ctx;
    var raised = p.raisedAt === undefined ? 0 : Math.min(1, (s.t - p.raisedAt) / .63);
    var col = [CORAL, '#679B91', '#C89859'][i];
    if (P.WorkStages.draw(c,'stall',x,y+.07*u,u,2.02)) {
      if(raised<1){c.save();c.beginPath();c.rect(x-.72*u,y-.94*u,1.44*u,(1-raised)*.61*u);c.clip();
        var im=P.StreetArt.image('work-stages-audit8');if(im)c.drawImage(im,47,350,153,30,x-.72*u,y-.94*u,1.44*u,.61*u);c.restore();}
      P.WorkControls.draw(R,p,'fishShutters',raised>0);return;
    }
    box(c, x - .91 * u, y - .90 * u, 1.82 * u, .97 * u, '#3F5553');
    for (var k = 0; k < 3; k++) fish(c, x + (k - 1) * .5 * u, y - .29 * u, u, k);
    for (var h = 0; h < 1 - raised - .01; h += .17) {
      c.fillStyle = h % .34 < .16 ? '#A39C87' : '#807D72';
      c.fillRect(x - .85 * u, y + (-.89 + h * .95) * u, 1.7 * u, .13 * u);
    }
    box(c, x - 1.01 * u, y - 1.03 * u, 2.02 * u, .20 * u, col);
    P.WorkControls.draw(R,p,'fishShutters',raised>0);
  }

  function fish(c, x, y, u, i) {
    c.fillStyle = ['#A8C6BD', '#DDC29F', '#92A9AC'][i];
    c.beginPath(); c.ellipse(x, y, .16 * u, .063 * u, -.16, 0, 2 * Math.PI); c.fill();
    c.beginPath(); c.moveTo(x - .12 * u, y);
    c.lineTo(x - .24 * u, y - .056 * u); c.lineTo(x - .23 * u, y + .085 * u); c.closePath(); c.fill();
    c.fillStyle = INK; c.beginPath(); c.arc(x + .09 * u, y - .02 * u, .018 * u, 0, 2 * Math.PI); c.fill();
  }

  function railX(d) { return 2.5 * smooth(Math.max(0, Math.min(1, (d - 2) / 9))); }
  function tram(R, s, m) {
    var c = R.ctx, u = R.ppm, p = m.opening, len = 6.2;
    [-.40, .40].forEach(function (side) {
      c.beginPath(); c.moveTo(R.X(side), R.Y(m.y - 1.45));
      for (var d = 0; d <= 24; d += .5) c.lineTo(R.X(railX(d) + side), R.Y(m.y + d));
      c.strokeStyle = '#4D575A'; c.lineWidth = .09 * u; c.stroke();
    });
    if (m.open) return;
    var center = .15 + len / 2 + p * 19, rear = m.y + center - len / 2;
    var rearX = railX(center - len / 2), frontX = railX(center + len / 2);
    P.Vehicles.drawCar(R, (rearX + frontX) / 2, rear, rear + len, 1.78,
      { t: s.t, speed: p > 0 ? .8 : 0, heading: Math.atan2(frontX - rearX, len) });
  }

  F.world = function (R, s, m) {
    var p = P.KarakoyTrial.station(m), c = R.ctx;
    c.save();
    if (Math.abs(m.y - s.hero.y) < 29) {
      if (m.kind === 'dockRamp' || m.kind === 'ferryMooring') passage(R, s, m);
      else gate(R, s, m);
    }
    if (m.shutters) m.shutters.forEach(function (q, i) { if (Math.abs(q.y - s.hero.y) < 20) shutter(R, s, q, i); });
    else if (Math.abs(p.y - s.hero.y) < 22) P.WorkControls.draw(R,p,m.kind,m.open);
    if (!m.open && m.opening === 0 && Math.abs(p.y - s.hero.y) < 23) {
      if(m.kind!=='ferryMooring'||p.progress<1)P.MilestoneFx.ring(R,p,p.r,p.progress);
    }
    c.restore();
  };

  F.air = function (R, s) {
    var m = s.milestone;
    if (!m || !m.karakoy || Math.abs(m.y - s.hero.y) > 27) return;
    R.ctx.save();
    if (m.kind === 'cargoHook') crane(R, m);
    if (m.kind === 'tramPoints') tram(R, s, m);
    if (m.kind === 'ferryMooring') ferry(R, s, m);
    R.ctx.restore();
  };

  F.tool = function (c, u, a) {
    c.rotate(-.58 + smooth(a.progress) * 1.3);
    line(c, -.12 * u, .03 * u, .48 * u, 0, .15 * u, INK);
    line(c, -.10 * u, .03 * u, .39 * u, 0, .07 * u, a.kind === 'ferryMooring' ? '#D9C99C' : GOLD);
    if (a.kind === 'ferryMooring') {
      c.beginPath(); c.ellipse(.48 * u, 0, .15 * u, .085 * u, 0, 0, 2 * Math.PI);
      c.strokeStyle = '#D9C99C'; c.lineWidth = .052 * u; c.stroke();
    }
  };
  return F;
})();
