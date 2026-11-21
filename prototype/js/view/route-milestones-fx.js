// Required encounters sit in the live world and read progress from the simulation.
P.MilestoneFx = (function () {
  var F = {}, K = P.CFG.levels.routeMilestones, GOLD = '#FFD166', BLUE = '#8DEBFF', INK = '#14151F';

  F.crossingStatus = function (s) {
    var g = s.gen, H = g && g.crossingControl, y = s.hero.y, margin = P.CFG.levels.tramCrossing.reserve;
    if (!H) return null;
    var p = H.crossing && H.crossing.pass;
    if (p && y >= p.y0 - margin && y <= p.y1 + margin) return { key: 'tramLive', scene: true };
    var outcome = g.crossingOutcome;
    if (y < H.y - margin || y > H.y + margin + (outcome ? P.CFG.levels.tramCrossing.len : 0)) return null;
    if (outcome && s.t < outcome.until) return { key: outcome.kills ? 'tramLured' : 'tramEmpty',
      detail: outcome.kills ? P.t('milestone.tramSwept', { n: outcome.kills }) : '', scene: true };
    if (H.state === 'done') return null;
    return { key: H.state === 'active' ? 'tramArm' : 'tramLure', scene: true,
      detail: H.state === 'active' ? pct(H.prog) : P.t('obj.tag') };
  };

  F.status = function (s) {
    var m = s.milestone, h = s.hero;
    if (!m) {
      if (s.routeTrial !== 'restaurant-escape' || !s.dir.hold.active || s.props.shutterOpen) return null;
      var cook = s.dir.trialBoss;
      if (!cook) return { key: 'shutter' };
      if (cook.exposed) return { key: 'cookOpen' };
      if (cook.ai.m === 'windup') return { key: cook.ai.act === 'throw' ? 'cookThrow' : 'cookCombo' };
      return { key: 'cook' };
    }
    if(m.open&&m.clockGate&&!m.clockGate.passed)return{key:m.clockGate.opening<.55?'stationClockWait':'stationClockCross',open:m.clockGate.opening>=.55};
    if (m.open) return s.t - m.openedAt < K.noticeT || m.eminonu && P.RouteMilestones.target(s) ? { key: 'open.' + m.kind, open: true } : null;
    var p = P.RouteMilestones.target(s), d = p && Math.hypot(h.x - p[0], h.y - p[1]);
    var out = { key: m.kind, detail: d >= 2 ? P.t('obj.marker.m', { n: Math.ceil(d) }) : '' };
    if (m.opening > 0) return { key: 'opening.' + m.kind };
    if (m.sirkeci) return P.SirkeciFx.status(s, m, out);
    if (m.eminonu) return P.EminonuFx.status(s, m, out);
    if (m.bridge) return P.BridgeFx.status(s, m, out);
    if (m.galata) return P.GalataFx.status(s, m, out);
    if (m.karakoy) return P.KarakoyFx.status(s, m, out);
    if (m.kind === 'tram') {
      var H = s.gen.tramControl;
      if (H && H.tram) return { key: 'watchTram', scene: true };
      else if (H && H.state === 'active' && P.RouteMilestones.inRing(s, H, H.r)) { out.key = 'switch'; out.detail = pct(H.prog); }
    } else if (m.kind === 'wires') {
      out.detail = s.obj.prog + ' / ' + s.obj.n;
      var it = P.RouteMilestones.nextWire(s);
      if (it && P.RouteMilestones.inRing(s, it, K.ringR)) out.key = 'snip';
      if(it)out.detail=P.t('reset.wire.'+s.obj.items.indexOf(it))+' · '+out.detail;
    } else if (m.kind === 'cart' && d < K.cart.ringR) {
      out.key = s.obj.b.contested ? 'cartThreat' : 'cartCall'; out.detail = pct(s.obj.b.up);
    } else if (m.kind === 'depot' && m.point.active) {
      out.key = 'crank'; out.detail = pct(m.point.progress);
    }
    return out;
  };
  function pct(v) { return P.t('milestone.percent', { n: Math.floor(v * 100) }); }
  F.focus = function (s) {
    var m = s.milestone;
    if (!m) return false;
    if ((m.karakoy || m.bridge || m.eminonu || m.sirkeci) && s.gen.boss && !s.gen.boss.dead) return true;
    if (P.Hack.tramScene(s)) return true;
    var p = P.RouteMilestones.target(s);
    return !!(m.opening > 0 && !m.open || m.open && s.t - m.openedAt < K.noticeT ||
      p && Math.hypot(s.hero.x - p[0], s.hero.y - p[1]) < 9);
  };
  F.markers = function (s, fallback) {
    var m = s.milestone;
    if (!m) return fallback;
    if(m.open&&m.clockGate&&!m.clockGate.passed)return[{x:0,y:m.y,label:'exit',required:true}];
    if (P.Hack.tramScene(s)) return [];
    var p = P.RouteMilestones.target(s);
    if (m.open && !p) return fallback;
    if (!p || !m.open && (m.opening > 0 || m.signalT > 0 || m.train && m.train.t > 0)) return [];
    return [{ x: p[0], y: p[1], label: m.kind === 'wires' ? 'wire' : 'terminal', required: true }];
  };

  function ease(v) {
    var p = Math.max(0, Math.min(1, v));
    return p * p * (3 - 2 * p);
  }
  function wireInHand(s) {
    if (!s.milestone || s.milestone.kind !== 'wires' || s.hero.moving) return null;
    return s.obj.items.find(function (it) {
      return !it.got && it.progress > 0 || it.got && s.t - it.cutAt < K.wires.readT;
    });
  }
  function actionFrame(s) {
    var m=s.milestone,h=s.hero,p=P.RouteMilestones&&P.RouteMilestones.target(s);
    if(!m||!p||m.opening>0||P.Speech&&P.Speech.warningNear(s))return null;
    var distance=Math.hypot(h.x-p[0],h.y-p[1]);
    if(distance>8)return null;
    // Compose the actor with the real destination/changed route while steering remains live.
    var destination=m.carry?m.pallet:m.weight&&!m.carrying?m.weight:m.cart||m.guide||{x:p[0],y:Math.min(m.y,h.y+6)};
    return{x:Math.max(h.x-2,Math.min(h.x+2,(h.x+destination.x)/2)),y:(h.y+Math.max(h.y-4,Math.min(h.y+6,destination.y)))/2,
      zoom:.035,weight:.35*ease(Math.max(0,1-distance/8))};
  }
  F.camera = function (s) {
    var scene = P.Hack.tramScene(s);
    if (scene) {
      var t = scene.pass.elapsed, C = P.CFG.levels.tramStop;
      var weight = ease(Math.min(t / K.tram.cameraIn, (C.gatherT + C.sweepT + C.returnT - t) / C.returnT));
      var close = ease((t - C.gatherT + K.tram.zoomLead) / K.tram.zoomLead);
      return { x: scene.pass.x, y: scene.pass.y0 + K.tram.cameraAhead, zoom: K.tram.cameraZoom * close, weight: weight };
    }
    var crossing = s.gen && s.gen.crossingControl && s.gen.crossingControl.crossing;
    if (crossing && crossing.travel > 0 && Math.abs(s.hero.y - s.gen.crossingControl.y) <= P.CFG.levels.tramCrossing.reserve) {
      return { x: crossing.pass.x, y: s.hero.y, zoom: K.tram.cameraZoom * .35,
        weight: .25 * ease(Math.min(crossing.travel, Math.max(0, crossing.pass.sweep - crossing.travel)) * 3) };
    }
    var wire = wireInHand(s);
    var m = s.milestone;
    if (m && m.sirkeci) return P.SirkeciFx.camera(s, m)||actionFrame(s);
    if (m && m.eminonu) return P.EminonuFx.camera(s, m)||actionFrame(s);
    if (m && m.bridge) return P.BridgeFx.camera(s, m)||actionFrame(s);
    if (m && m.karakoy) return P.KarakoyFx.camera(s, m)||actionFrame(s);
    if (m && m.galata && m.point.active && !s.hero.moving) {
      return { x: m.point.x, y: m.point.y + .40, zoom: .08, weight: ease(m.point.progress * 3) };
    }
    var boss = s.dir.trialBoss;
    if (boss && !boss.dead && boss.bossPreset === 'cook' && P.CookFx) return P.CookFx.camera(s, boss);
    if (!wire) return actionFrame(s);
    var w = wire.got ? ease(1 - (s.t - wire.cutAt) / K.wires.readT) : ease(wire.progress * 2.8);
    return { x: (wire.x + s.hero.x) / 2, y: (wire.y + s.hero.y) / 2 + .35, zoom: K.wires.cameraZoom, weight: w };
  };

  function ring(R, p, r, progress) {
    var c = R.ctx, x = R.X(p.x), y = R.Y(p.y), u = R.ppm;
    c.beginPath(); c.arc(x, y, r * u, 0, 2 * Math.PI);
    c.lineWidth = 5; c.strokeStyle = INK; c.stroke(); c.lineWidth = 2; c.strokeStyle = GOLD; c.stroke();
    if (!progress) return;
    c.beginPath(); c.arc(x, y, r * u, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * progress);
    c.lineWidth = 4; c.strokeStyle = BLUE; c.stroke();
  }
  F.ring = ring;
  function post(c, x, y, u, open) {
    c.fillStyle = INK; c.fillRect(x - .14 * u, y - .61 * u, .28 * u, .8 * u);
    c.fillStyle = '#827967'; c.fillRect(x - .08 * u, y - .55 * u, .16 * u, .69 * u);
    c.beginPath(); c.arc(x, y - .48 * u, .085 * u, 0, 2 * Math.PI);
    c.fillStyle = open ? '#95D59F' : '#FFAD68'; c.fill();
  }
  function gate(R, s, m) {
    var c = R.ctx, Y = R.Y(m.y), u = R.ppm, a = R.X(s.geo.xMin), b = R.X(s.geo.xMax), p = m.opening;
    var screenY = R.toScreen(0, m.y).y;
    if (screenY < -3 * u || screenY > R.H + 3 * u) return;
    if (m.kind === 'tram') {
      if (m.open) return;
      plank(c, a, a + 4.9 * u, Y, u, '#BE744D'); plank(c, b - 4.9 * u, b, Y, u, '#BE744D');
      return;
    }
    post(c, a + .34 * u, Y, u, m.open); post(c, b - .34 * u, Y, u, m.open);
    if (m.kind === 'depot') {
      // Slats roll up inside the depot lintel, leaving the track visible below.
      var h = u * 1.18 * (1 - p);
      for (var y = Y - 1.18 * u; y < Y - 1.18 * u + h; y += .19 * u) {
        plank(c, a, b, y, u, '#68848A');
      }
      plank(c, a, b, Y - 1.35 * u, u * 1.35, '#AD9075');
    } else {
      var distance = (b - a) * .5 * (1 - p);
      if (distance < 1) return;
      var paint = m.kind === 'wires' ? '#489BA8' : '#C69960';
      plank(c, a, a + distance, Y, u, paint); plank(c, b - distance, b, Y, u, paint);
    }
  }
  function plank(c, a, b, y, u, paint) {
    c.fillStyle = '#262A32'; c.fillRect(a, y - .09 * u, b - a, .24 * u);
    c.fillStyle = paint; c.fillRect(a, y - .06 * u, b - a, .12 * u);
    c.fillStyle = '#E6BD7F';
    for (var x = a + .24 * u; x + .33 * u < b; x += .72 * u) c.fillRect(x, y - .06 * u, .32 * u, .12 * u);
  }

  function wires(R, s) {
    var c = R.ctx, u = R.ppm;
    s.obj.items.forEach(function (it) {
      var y = R.Y(it.y), x = R.X(it.x);
      var screenY = R.toScreen(it.x, it.y).y;
      if (screenY < -2 * u || screenY > R.H + 2 * u) return;
      if (!it.got) ring(R, it, K.ringR, it.progress);
      if (!it.got && it.progress > 0 && !s.hero.moving) return;
      var gap = it.got ? .14 : 0;
      cable(c, x - .92 * u, y - .31 * u, x - gap * u, y, u, it.got);
      cable(c, x + gap * u, y, x + .83 * u, y - .39 * u, u, it.got);
      if (!it.got) post(c, x + .85 * u, y - .36 * u, u * .85, false);
    });
  }
  function cable(c, x, y, toX, toY, u, cut) {
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo((x + toX) / 2, (y + toY) / 2 + .28 * u, toX, toY);
    c.lineWidth = Math.max(4, .14 * u); c.strokeStyle = INK; c.stroke();
    c.lineWidth = Math.max(2, .06 * u); c.strokeStyle = cut ? '#789C9D' : BLUE; c.stroke();
  }
  function callRings(R, s, m) {
    var b = s.obj.b, age = m.open ? s.t - m.openedAt : m.opening * K.openT, c = R.ctx;
    if (!age || age > 1.1) return;
    c.strokeStyle = 'rgba(161,237,246,' + (1 - age / 1.1) * .9 + ')'; c.lineWidth = 2;
    for (var i = 0; i < 3; i++) {
      c.beginPath(); c.arc(R.X(b.x), R.Y(b.y) - .9 * R.ppm, (.4 + i * .31 + age * 1.2) * R.ppm, Math.PI * 1.2, Math.PI * 1.8); c.stroke();
    }
  }
  F.drawGround = function (R, s) {
    var m = s.milestone;
    if (!m) return;
    if (m.sirkeci) { P.SirkeciFx.world(R, s, m); return; }
    if (m.eminonu) { P.EminonuFx.world(R, s, m); return; }
    if (m.bridge) { P.BridgeFx.world(R, s, m); return; }
    if (m.galata) { P.GalataFx.world(R, s, m); return; }
    if (m.karakoy) { P.KarakoyFx.world(R, s, m); return; }
    gate(R, s, m);
    if(m.wireScreens)m.wireScreens.forEach(function(q){var it=q.source,b=q.box,cut=it.cutAt!==undefined;
      if(cut&&s.t-it.cutAt>1)return;var drop=cut?Math.min(1,s.t-it.cutAt):0;
      cable(R.ctx,R.X(b.xMin),R.Y(b.yMin)+drop*.25*R.ppm,R.X(b.xMax),R.Y(b.yMin)+drop*.25*R.ppm,R.ppm,cut);
      if(!cut)cable(R.ctx,R.X(it.x),R.Y(it.y),R.X(it.x<0?b.xMin:b.xMax),R.Y(b.yMin),R.ppm,false);});
    if (m.kind === 'wires') wires(R, s);
    if (m.kind === 'cart') callRings(R, s, m);
    if (m.kind === 'depot' && m.point.progress < 1 && Math.abs(m.point.y - s.hero.y) < 24) {
      ring(R, m.point, m.point.r, m.point.progress);
      post(R.ctx, R.X(m.point.x), R.Y(m.point.y), R.ppm, m.point.active);
    }
  };

  F.action = function (s, o) {
    var m = s.milestone, p, progress;
    if (!m || m.open) return null;
    if (m.kind === 'wires') {
      p = wireInHand(s);
      if (p) progress = p.progress;
    } else if (m.kind === 'depot' && m.point.active) { p = m.point; progress = p.progress; }
    else if (m.galata && m.point.active) { p = m.point; progress = p.progress; }
    else if (m.karakoy) { p = P.KarakoyTrial.station(m); if (!p.active || p.progress >= 1) return null; progress = p.progress; }
    else if (m.eminonu && m.point.active && m.point.progress < 1) { p = m.point; progress = p.progress; }
    else if (m.sirkeci) { p = P.SirkeciTrial.station(m); if (!p.active || p.progress >= 1) return null; progress = p.progress; }
    else if (m.bridge) {
      p = P.BridgeTrial.station(m);
      if (!p.active && !p.hauling && !p.bracing) return null;
      progress = p.hauling ? m.haul : p.bracing ? 0.6 : p.progress;
    }
    if (!p) return null;
    var direction = p.hauling ? 0 : Math.atan2(p.y - s.hero.y + .24, p.x - s.hero.x);
    o.noArms = true; o.attackHand = direction > -Math.PI / 2 && direction < Math.PI / 2 ? 1 : -1;
    var lean = m.kind === 'wires' || m.karakoy ? ease(progress * 2) : .5;
    o.attackStance = { arm: 'reach', aim: direction, lean: .12 + .14 * lean, depth: .08, height: -.07 - .10 * lean, roll: .04 + .06 * lean };
    return { kind: m.kind, aim: direction, progress: progress, p: p };
  };
  F.tool = function (R, s, action, grips) {
    if (P.WorkControls && P.WorkControls.has(action.kind)) { P.WorkControls.tool(R,s,action,grips); return; }
    var u = R.ppm, c = R.ctx, x = R.X(s.hero.x), y = R.Y(s.hero.y - .25) - .55 * u;
    var g = grips && (Math.cos(action.aim) < 0 ? grips.left : grips.right);
    x = g ? g.x : x; y = g ? g.y : y;
    var a = -action.aim * .83;
    if (action.kind === 'wires' && !action.p.got) {
      var wx = R.X(action.p.x), wy = R.Y(action.p.y), tipX = x + Math.cos(a) * u * .41, tipY = y + Math.sin(a) * u * .41;
      cable(c, wx - .92 * u, wy - .31 * u, tipX, tipY, u, false);
      cable(c, wx + .83 * u, wy - .39 * u, tipX, tipY, u, false);
    }
    c.save(); c.translate(x, y); c.rotate(a);
    if (action.kind === 'wires') pliers(c, u, action.progress);
    else if (s.milestone.sirkeci) P.SirkeciFx.tool(c, u, action);
    else if (s.milestone.eminonu) P.EminonuFx.tool(c, u, action);
    else if (s.milestone.bridge) P.BridgeFx.tool(c, u, action);
    else if (s.milestone.karakoy) P.KarakoyFx.tool(c, u, action);
    else if (action.kind === 'bell') pull(c, u, action.progress);
    else crank(c, u, action.progress);
    c.restore();
  };
  function pliers(c, u, progress) {
    var t = .06 + .46 * (1 - ease((progress - .57) / .43));
    c.lineCap = 'round'; c.lineJoin = 'round';
    [-1, 1].forEach(function (side) {
      c.save(); c.rotate(side * t);
      c.beginPath(); c.moveTo(-.16 * u, 0); c.lineTo(.32 * u, 0); c.lineTo(.43 * u, side * .045 * u);
      c.strokeStyle = INK; c.lineWidth = .13 * u; c.stroke();
      c.strokeStyle = '#D0E2E6'; c.lineWidth = .065 * u; c.stroke();
      c.beginPath(); c.moveTo(-.16 * u, 0); c.lineTo(.07 * u, 0);
      c.strokeStyle = '#ED845A'; c.lineWidth = .095 * u; c.stroke(); c.restore();
    });
  }
  function crank(c, u, progress) {
    c.rotate(progress * 4 * Math.PI);
    c.beginPath(); c.moveTo(-.16 * u, 0); c.lineTo(.24 * u, 0); c.lineTo(.24 * u, -.18 * u);
    c.lineWidth = .12 * u; c.strokeStyle = INK; c.stroke();
    c.strokeStyle = GOLD; c.lineWidth = .06 * u; c.stroke();
  }
  function pull(c, u, progress) {
    c.beginPath(); c.moveTo(-.06 * u, .15 * u); c.quadraticCurveTo(.33 * u, 0, .49 * u, -.45 * u + progress * .18 * u);
    c.lineWidth = .10 * u; c.strokeStyle = INK; c.stroke();
    c.lineWidth = .043 * u; c.strokeStyle = GOLD; c.stroke();
  }
  return F;
})();
