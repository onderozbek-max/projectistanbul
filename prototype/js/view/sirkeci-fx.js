P.SirkeciFx = (function () {
  var F = {}, C = P.CFG.levels.sirkeciMilestones, images = {}, loading = {}, started = false;
  var frames = { lever: [97,23,337,467], clock: [613,10,296,497], fuseBox: [1076,12,340,461],
    signal: [127,525,308,485], gate: [560,528,393,462], fuse: [1047,549,423,436] };
  var cast = [[111,6,329,495,.49],[528,8,428,493,.53],[1030,97,435,415,.50],
    [139,514,223,497,.51],[606,518,279,489,.52],[1097,512,285,504,.49]];
  var root = document.currentScript && document.currentScript.src || document.baseURI;
  function prepare() {
    if (started) return;
    started = true;
    ['station', 'railcar', 'cast'].forEach(function (key) { load(key, false); });
  }
  function load(key, retry) {
    var img = new Image(), url = new URL('../../assets/landmarks/sirkeci-' + key + '.webp', root);
    loading[key] = img;
    img.onload = function () { if (loading[key] === img) { images[key] = img; loading[key] = null; } };
    img.onerror = function () { if (loading[key] === img) loading[key] = null; };
    if (retry) url.searchParams.set('retry', String(Date.now()));
    img.src = url.href;
  }
  F.awaitArt = function (done, index) {
    var keys = ['station'], initial = !started;
    if (index === 26) keys.push('railcar');
    if (index === 27 || index === 30) keys.push('cast');
    if (initial) prepare();
    else keys.forEach(function (key) { if (!images[key] && !loading[key]) load(key, true); });
    function ready() { return keys.every(function (key) { return !!images[key]; }); }
    if (ready()) return true;
    var deadline = performance.now() + 4500;
    var dismiss = P.UI.toast(P.t('ui.art.stationWait'), null, 3.5);
    function check() {
      if (ready()) { if (dismiss) dismiss(); done(true); return; }
      if (performance.now() >= deadline || keys.some(function (key) { return !images[key] && !loading[key]; })) {
        keys.forEach(function (key) { if (!images[key]) loading[key] = null; });
        if (dismiss) dismiss();
        done(false); return;
      }
      setTimeout(check, 80);
    }
    setTimeout(check, 80);
    return false;
  };
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function pct(v) { return P.t('milestone.percent', { n: Math.floor(clamp(v) * 100) }); }

  F.status = function (s, m, out) {
    var q = m.guide, L = m.lights, p = m.point;
    if (m.train && m.train.t > 0) out.key = 'stationLeaving';
    else if (q && q.joined) {
      out.key = q.pinned ? 'stationGuideClear' : q.active ? 'stationGuideUnlock' : q.walking ? 'stationGuideWalk' : 'stationGuideWait';
      out.detail = pct(q.active ? q.progress : (q.y - p.y) / (m.y - p.y - C.guide.stopBefore));
    } else if (L && L.on) {
      out.key = 'stationLightsFollow';
      out.detail = L.passed + '/' + L.steps.length;
    } else if (m.fuse && !m.fuse.collected) out.key = 'stationFuse';
    else if (p.active) { out.key += 'Use'; out.detail = pct(p.progress); }
    return out;
  };

  function guideFootprint(R, q, destination) {
    var c=R.ctx,u=R.ppm,x=R.X(q.x),y=R.Y(q.y);
    c.save();c.strokeStyle=destination?'#E5C68B':'#B4E2D6';c.lineWidth=2;
    c.beginPath();c.ellipse(x,y,.48*u,.19*u,0,0,Math.PI*2);c.stroke();
    // The follow radius is a simulation tolerance, not a giant work ring.
    // Small forward chevrons point along the actual guided passage.
    for(var i=0;i<2;i++){
      var ahead=y-(.72+i*.56)*u;
      c.beginPath();c.moveTo(x-.16*u,ahead+.12*u);c.lineTo(x,ahead);c.lineTo(x+.16*u,ahead+.12*u);c.stroke();
    }
    c.restore();
  }
  F.camera = function (s, m) {
    if (m.open) return null;
    var q = m.train, p = m.point, K = C.departure;
    var active = q ? .88 * clamp(q.t / K.bellT) * clamp((K.T + K.bellT - q.t) / 1.35) : m.opening;
    if (!active) return null;
    return { x: 0, y: q ? Math.min(m.y + 8, q.front - K.length / 2) : m.y - 1.2, zoom: q ? -.055 : .035,
      weight: active * clamp(1 - Math.max(0, Math.hypot(s.hero.x - p.x, s.hero.y - p.y) - 2) / 6) };
  };

  function draw(R, key, x, y, height) {
    var img = images.station, f = frames[key];
    if (!img) return;
    var h = R.ppm * height, w = h * f[2] / f[3];
    R.ctx.drawImage(img, f[0], f[1], f[2], f[3], R.X(x) - w / 2, R.Y(y) - h, w, h);
  }
  function figure(c, i, x, y, scale, facing) {
    var im = images.cast, f = cast[i];
    if (!im) return false;
    c.save(); c.translate(x, y); c.scale(facing, 1);
    c.drawImage(im, f[0], f[1], f[2], f[3], -f[2]*f[4]*scale, -f[3]*scale, f[2]*scale, f[3]*scale);
    c.restore(); return true;
  }
  function clockHand(R, x, y, height, elapsed) {
    if (!images.station) return;
    var K=C.clock,cycle=K.openT+K.closeT+K.closedT+K.liftT;
    var c = R.ctx, k = R.ppm * height / frames.clock[3], a = -.06 + elapsed/cycle*Math.PI*2;
    var cx = R.X(x) + (784 - 761) * k, cy = R.Y(y) + (236 - 507) * k;
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(a) * 67 * k, cy - Math.cos(a) * 75 * k);
    c.lineWidth = 5 * k; c.strokeStyle = '#3B2D25'; c.stroke();
    c.lineWidth = 2 * k; c.strokeStyle = '#B74C35'; c.stroke();
  }
  F.bossBody = function (c, e, o, x, y, u, facing) {
    if (e.bossPreset !== 'ticketMan') return false;
    var a = e.ai, cfg = P.CFG.bosses.ticketMan;
    var winding = a.m === 'windup' && a.act === 'ticketPunch';
    var landing = a.m === 'switchRecover' && a.act === 'ticketPunch' && a.t >= cfg.punch.reset * .7;
    var frame = o.sceneEntry !== undefined && o.sceneEntry > .7 ? 1 : landing ? 2 : winding ? 1 : 0;
    var side = frame ? (a.dir.x >= 0 ? 1 : -1) : facing, k = u * .00545;
    if (!images.cast) return true;
    if(a.act==='stationSignal'&&P.TicketActing){c.save();c.translate(x,y);c.scale(a.dir.x<0?-1:1,1);
      var signaled=P.TicketActing.signal(c,images.cast,cast[0],k,e);c.restore();if(signaled)return true;}
    if (frame || o.stopped || o.sceneEntry === undefined && (a.m !== 'walk' || Math.hypot(e.dvx || 0, e.dvy || 0) < .08)) {
      var shot=cast[frame], load=winding?clamp(e.windup || 0):e.exposed?.5:landing?.7:0;
      c.save(); c.translate(x,y); c.scale(side,1);
      P.BossJoints.draw(c,images.cast,shot,[shot[2]*shot[4],shot[3]],k,
        {roll:(winding?-.07:landing?.08:.035)*load,load:load});
      c.restore(); return true;
    }
    var f = cast[0];
    c.save(); c.translate(x, y); c.scale(side, 1);
    P.BossFootwork.stride(c, images.cast, f, f[2] * f[4], f[3], [0.76, 0.49], k, o.sceneEntry !== undefined ? o.phase : (e.walk || 0) * 9.7);
    c.restore();
    return true;
  };
  function rails(R, x, y0, y1, bend) {
    var c = R.ctx, u = R.ppm, start = R.Y(y0), end = R.Y(y1);
    c.fillStyle = 'rgba(26,44,58,.57)'; c.fillRect(R.X(x)-.88*u, end, 1.76*u, start-end);
    c.fillStyle = '#6F7D78';
    for (var y = y0; y < y1; y += .69) c.fillRect(R.X(x)-.77*u, R.Y(y), 1.54*u, .10*u);
    [-1, 1].forEach(function (side) {
      var edge = R.X(x + side*.52);
      c.beginPath(); c.moveTo(edge, start); c.lineTo(edge, end);
      if (bend) { c.moveTo(edge, start-.5*u); c.quadraticCurveTo(edge, start-3*u, edge+bend*1.65*u, end); }
      c.lineWidth = .066*u; c.strokeStyle = '#ADC5CB'; c.stroke();
    });
  }
  function light(R, x, y, r, color) {
    var c = R.ctx, u = R.ppm, a = R.X(x), b = R.Y(y), g = c.createRadialGradient(a,b,0,a,b,r*u);
    g.addColorStop(0, color); g.addColorStop(1,'rgba(255,218,150,0)');
    c.fillStyle = g; c.fillRect(a-r*u,b-r*u,2*r*u,2*r*u);
  }
  function gates(R, m) {
    var opening=m.clockGate&&m.open&&!m.clockGate.passed?m.clockGate.opening:m.opening;
    var count = 4, of = 1 - opening;
    for (var i = 0; i < count && of > 0; i++) {
      var x = (i - (count - 1) / 2) * 2.13 + (i < count/2 ? -1 : 1) * opening * 4.1;
      draw(R, 'gate', x, m.y, 2.52);
    }
    draw(R,'signal', -3.8,m.y+.38,1.47); draw(R,'signal',3.8,m.y+.38,1.47);
    var pass=m.clockGate?opening>=.55:m.open;
    light(R,-3.8,m.y+1.28,.52,pass ? 'rgba(118,242,165,.5)' : 'rgba(240,128,69,.45)');
    light(R,3.8,m.y+1.28,.52,pass ? 'rgba(118,242,165,.5)' : 'rgba(240,128,69,.45)');
  }
  F.world = function (R, s, m) {
    if (m.kind==='stationPoints' && m.open) servicePath(R,s,m);
    var h = s.hero, p = m.point, q = P.SirkeciTrial.station(m);
    if (Math.abs(m.y - h.y) > 27) return;
    var c = R.ctx;
    c.save();
    if (m.train) rails(R, C.departure.x, m.y-5.5, m.y+C.departure.travel+C.departure.front+.5);
    if (m.kind === 'stationPoints') rails(R, 0, m.y-7.7, m.y+2, m.opening || -.6);
    if (m.lights && (m.lights.on || s.localChoice === 'lit')) {
      if (m.lights.on) light(R,p.x,p.y,4.2,'rgba(255,218,150,.58)');
      m.lights.steps.forEach(function (step, i) {
        var state = !m.lights.on ? 'rgba(250,218,154,.38)' : i < m.lights.passed ? 'rgba(106,236,204,.54)' : i === m.lights.passed ? 'rgba(255,212,121,.76)' : 'rgba(201,185,145,.21)';
        light(R, step.x, step.y, 1.5, state);
        if(m.lights.on&&i===m.lights.passed){
          var from=i?m.lights.steps[i-1]:p;
          c.beginPath();c.moveTo(R.X(from.x),R.Y(from.y));c.lineTo(R.X(step.x),R.Y(step.y));
          c.strokeStyle='rgba(255,226,158,.54)';c.lineWidth=.72*R.ppm;c.stroke();
        }
      });
    }
    if (m.guide && s.localChoice === 'lit' && Math.abs(s.hero.y - m.guide.y) < 9) {
      light(R, m.guide.laneX, m.guide.y + 1.45, 1.9, 'rgba(255,210,123,.34)');
      var stop = { x: m.guide.laneX, y: m.y - C.guide.stopBefore };
      if (!m.guide.wave && m.guide.joined) {
        light(R, 0, m.y + C.lights.waveAhead, 2.6, 'rgba(249,158,91,.43)');
        guideFootprint(R, stop, true);
      }
    }
    if (!m.open && !m.opening && (!m.lights || !m.lights.on) && (!m.train || m.train.t <= 0)) {
      if (m.guide && m.guide.walking) guideFootprint(R, q, false);
      else P.MilestoneFx.ring(R,q,q.r,q.progress);
    }
    if (m.fuse) {
      if (!m.fuse.collected) draw(R,'fuse',m.fuse.x,m.fuse.y,.71);
      else if (!m.open && m.point.progress<1) {
        var insert=m.point.active && m.point.progress>.65;
        draw(R,'fuse',insert?p.x-.62:h.x+.28,insert?p.y+.30:h.y+.30,.40);
      }
      draw(R,'clock',1.55,m.y-.2,2.35);
      if (m.clockLiveAt !== undefined) clockHand(R, 1.55, m.y - .2, 2.35, m.clockGate.t);
      if (m.opening) light(R,1.55,m.y+1.36,1.4,'rgba(255,209,123,.55)');
      draw(R,'fuseBox',p.x-.67,p.y+.22,1.08);
      if (m.point.progress>=1) light(R,p.x-.67,p.y+.52,.23,'rgba(129,235,171,.7)');
    } else if (!m.guide) draw(R,m.lights ? 'fuseBox' : 'lever',p.x-.52,p.y+.25,1.14);
    c.restore();
  };
  function servicePath(R,s,m) {
    // The operated points and the real walkable exit share one continuous service track.
    var from=m.point.y-1,to=s.geo.exitY, dead=s.gen.boss && s.gen.boss.dead;
    rails(R,0,Math.max(from,s.hero.y-23),Math.min(to,s.hero.y+23));
    for (var y=m.point.y+3;y<=to;y+=7) {
      if (Math.abs(y-s.hero.y)>22) continue;
      draw(R,'signal',-1.8,y,1.10);
      if(dead)light(R,-1.8,y+.6,.68,'rgba(126,221,192,.45)');
    }
  }
  F.props = function (R, s) {
    var m = s.milestone, c = R.ctx, u = R.ppm;
    if (!m || !m.sirkeci) return;
    prepare();
    if (Math.abs(m.y - s.hero.y) < 25) R.depth(m.y, function () { gates(R, m); });
    if (m.guide && images.cast && Math.abs(s.hero.y-m.guide.y) < 15) {
      var q = m.guide;
      R.depth(q.y, function () {
        var i = q.walking ? 4 + (Math.floor(q.y * 3) & 1) : 3;
        P.Sprites.groundCivilian(R, q);
        figure(c,i,R.X(q.x),R.Y(q.y),u*.0035,1);
      }, false);
    }
    if (m.train && images.railcar && s.props.routeEdges.length && Math.abs(s.hero.y-m.train.front) < 24) {
      var K = C.departure, t = m.train;
      R.depth(t.solid.yMin, function () { c.drawImage(images.railcar,R.X(t.solid.xMin),R.Y(t.front),K.width*u,K.length*u); });
    }
  };

  F.instruction = function (s, e) {
    if (e.exposed) return 'ticketOpen';
    if (s.enemyTele.some(function (t) { return t.owner === e.id && t.then === 'switchRails'; })) return 'ticketSignal';
    return e.ai.m === 'windup' && e.ai.act === 'ticketPunch' ? 'ticketPunch' : 'ticketMan';
  };
  F.tool = function (c,u,a) {
    c.rotate(-.52 + a.progress * .89);
    c.fillStyle = '#263643'; c.fillRect(-.06*u,-.08*u,.48*u,.16*u);
    c.fillStyle = '#E4B26D'; c.fillRect(.20*u,-.06*u,.19*u,.12*u);
  };
  return F;
})();
