// Short action accents tied to the simulation's release, confirmed hit or pin events.
P.WAttackCues = (function () {
  var A = {}, M = P.WSil.prim, TAU = M.TAU;
  var CREAM = '255,239,188', INK = '23,29,40', GOLD = '247,170,84', TEAL = '110,231,212', BLUE = '113,211,255';
  var marks = [], electros = {}, MAX = 44;
  var lives = { propStrike: .26, doorBash: 0.40, doorSlam: 0.46, manholeThrow: 0.27, manholeBounce: 0.43, slingPull: 0.33,
    marbleHit: 0.34, marbleFork: 0.45, spearFire: 0.28, spearHit: 0.32, spearPin: 0.61, oltaSlam: 0.38, cableArc: 0.58, stormZap: 0.62 };

  A.reset = function () { marks.length = 0; electros = {}; };
  function forget(m) { if (electros[m.targetId] === m) delete electros[m.targetId]; }
  A.onEvent = function (ev, s) {
    if (!Object.prototype.hasOwnProperty.call(lives, ev.type)) return;
    if (ev.type === 'doorBash' && !ev.first && marks.some(function (p) {
      return p.k === ev.type && p.age < .14 && Math.hypot(p.x - ev.x, p.y - ev.y) < .80;
    })) return;
    var zap = ev.type === 'cableArc' || ev.type === 'stormZap';
    if (zap && electros[ev.targetId]) return;
    if (marks.length === MAX) forget(marks.shift());
    var mark = { k: ev.type, age: 0, T: ev.crater ? 0.64 : lives[ev.type], grade: ev.grade || 1, a: ev.a || 0, r: ev.r || 0,
      x: zap ? ev.x1 : ev.x, y: zap ? ev.y1 : ev.y, branch: !!ev.branch, lucky: !!ev.lucky, crater: !!ev.crater };
    if (zap) {
      mark.target = (s.enemies || []).find(function (e) { return ev.targetId === e.id; });
      mark.r = ev.targetR || 0.38; mark.targetId = ev.targetId;
      if (ev.targetId !== undefined) electros[ev.targetId] = mark;
    }
    marks.push(mark);
  };
  A.update = function (dt) {
    for (var i = marks.length - 1; i >= 0; i--) {
      marks[i].age += dt;
      if (marks[i].age >= marks[i].T) forget(marks.splice(i, 1)[0]);
    }
  };

  function flare(c, R, x, y, a, r, n, color, fade) {
    for (var i = 0; i < n; i++) {
      var th = a + TAU * i / n, tip = r * (i % 2 ? 0.72 : 1.1);
      M.fill(c, R, M.local([[r * 0.21, -r * 0.06], [r * 0.53, -r * 0.09], [tip, 0], [r * 0.54, r * 0.065]], x, y, th), color, fade);
    }
  }

  function groundRing(c, R, m, q, radius, col, wide) {
    var r = radius * R.ppm, x = R.X(m.x), y = R.Y(m.y);
    c.beginPath(); c.ellipse(x, y, r, r * 0.57, 0, 0, TAU);
    c.lineWidth = wide + 2.3; c.strokeStyle = M.rgba(INK, 0.46 * (1 - q)); c.stroke();
    c.lineWidth = wide; c.strokeStyle = M.rgba(col, 0.92 * (1 - q)); c.stroke();
  }

  function metal(c, R, m, q) {
    var radius = m.r || 0.56, alpha = 1 - q, sign = m.grade >= 4 ? 1.1 : 0.94;
    groundRing(c, R, m, q, radius * (0.40 + 0.60 * q) * sign, CREAM, 2.7 + m.grade * 0.36);
    if (m.grade >= 4) groundRing(c, R, m, q, radius * (0.27 + q * 0.53), CREAM, 2.1);
    flare(c, R, m.x, m.y + 0.19, m.a, 0.54 + q * radius * 0.70, 4 + Math.floor(m.grade / 2), CREAM, alpha);
    for (var i = 0; i < 3 + m.grade; i++) {
      var a = m.a + i * 2.4, r = radius * (0.4 + q) * (0.58 + (i % 3) * 0.2);
      var p = M.local([[r, -0.08], [r + 0.12, 0.01], [r - 0.03, 0.09]], m.x, m.y + 0.20 + q * (1 - q) * 1.35, a);
      M.fill(c, R, p, i % 2 ? '159,152,132' : CREAM, 0.90 * alpha);
    }
  }

  function coverImpact(c, R, m, q) {
    metal(c, R, m, q);
    if (!m.crater) return;
    var r = m.r * (0.65 + q * 0.46), fade = 1 - q;
    groundRing(c, R, m, q, r, GOLD, 6.1 + m.grade * 0.52);
    for (var i = 0; i < m.grade + 2; i++) {
      var a = m.a + TAU * i / (m.grade + 2), w = r * (i % 2 ? 0.79 : 1);
      var fault = M.local([[0.15,0],[w * 0.39,0.12],[w * 0.56,-0.04],[w * 0.76,0.10],[w,0]], m.x, m.y, a);
      M.poly(c, R, fault, INK, fade * 0.96, 6.7, false);
      M.poly(c, R, fault, GOLD, fade, 2.8, false);
      var slab = M.local([[w * 0.75,-0.13],[w,0.02],[w * 0.82,0.19],[w * 0.64,0.06]],
        m.x, m.y + Math.sin(Math.PI * q) * (0.31 + 0.16 * (i % 3)), a);
      M.fill(c, R, slab, '88,78,72', fade);
      M.poly(c, R, slab.slice(0, 3), CREAM, fade, 2.8, false);
    }
  }

  function release(c, R, m, q) {
    var fade = 1 - q, a = m.a, x = m.x, y = m.y + 0.34;
    if (m.k === 'manholeThrow') {
      M.arc(c, R, x, y, 0.30 + q * 0.73, a - 1.55, a + 1.03, CREAM, fade, 2.5 + m.grade * 0.41);
      return;
    }
    var span = 0.24 + m.grade * 0.037, stretch = 0.53 * Math.min(1, q * 4.5);
    M.poly(c, R, M.local([[0.35, -span], [0.18 - stretch, 0], [0.35, span]], x, y, a), INK, 0.90 * fade, 5.4, false);
    M.poly(c, R, M.local([[0.35, -span], [0.18 - stretch, 0], [0.35, span]], x, y, a), GOLD, 0.92 * fade, 2.5 + m.grade * 0.42, false);
  }

  function ricochet(c, R, m, q) {
    var color = m.branch || m.lucky ? GOLD : TEAL, r = (0.37 + m.grade * 0.058) * (1 + q * 0.64), y = m.y + 0.35;
    var p = M.local([[-r, 0.04], [-r * 0.44, 0], [0, 0], [r * 0.27, r * 0.55], [r, r * 0.79]], m.x, y, m.a);
    M.poly(c, R, p, INK, 0.82 * (1 - q), 5.5, false);
    M.poly(c, R, p, color, 0.95 * (1 - q), 2.6 + m.grade * 0.29, false);
    flare(c, R, m.x, y, m.a, r * 0.73, m.lucky ? 6 : 4, CREAM, 0.92 * (1 - q));
  }

  function spearLock(c, R, m, q) {
    var r = Math.max(0.69, m.r * (0.48 + 0.45 * (1 - q))), fade = 1 - q * q;
    var n = m.grade >= 4 ? 3 : 2, spin = (P.Settings || {}).reduceMotion ? 0 : q * 3.3;
    M.disc(c, R, m.x, m.y, r * 0.79, '13,74,110', 0.77 * fade);
    for (var i = 0; i < n; i++) {
      var turn = m.a + i * TAU / n + spin;
      M.arc(c, R, m.x, m.y, r * (1 - i * 0.19), turn, turn + 2.7, '40,153,179', fade, 8.3 + m.grade * 0.75);
      M.arc(c, R, m.x, m.y + 0.06, r * (1 - i * 0.19), turn + 0.35, turn + 2.6, '205,255,244', fade, 3.0);
    }
  }

  function spearSplash(c, R, m, q) {
    var launch = m.k === 'spearFire', r = (0.57 + m.grade * 0.11) * (0.65 + q * 0.51), fade = 1 - q;
    var x = m.x, y = m.y + 0.36;
    M.arc(c, R, x, y, r, m.a - 1.09, m.a + 1.16, '41,158,200', 0.93 * fade, 7.6 + m.grade * 0.69);
    M.arc(c, R, x, y + 0.06, r * 1.04, m.a - 0.84, m.a + 0.91, '210,255,250', fade, 3.1 + m.grade * 0.32);
    for (var i = -2; i <= 2; i++) {
      var angle = m.a + i * 0.49, d = r * (0.8 + q * 0.81);
      var p = M.local([[d,0],[d - 0.21,-0.07],[d - 0.27,0],[d - 0.21,0.065]], x, y + (launch ? 0.1 : q * 0.40), angle);
      M.fill(c, R, p, i % 2 ? BLUE : '213,255,251', fade);
    }
  }

  // Replace the entire actor for a single held reaction, so no living sprite shows through the bones.
  A.drawElectro = function (R, e) {
    var m = electros[e.id];
    if (!m || m.age >= m.T * 0.79) return false;
    shockedActor(R.ctx, R, m, e.x, e.y);
    return true;
  };

  function shockedActor(c, R, m, x, y) {
    var cfg = P.Settings || {}, q = cfg.reduceMotion ? 0.4 : Math.min(1, m.age / (m.T * 0.79));
    var r = Math.max(0.33, Math.min(0.56, m.r)), u = R.ppm * r * 1.37;
    c.save(); c.translate(R.X(x), R.Y(y - r * 0.36)); c.scale(u, u);
    c.rotate((q - 0.5) * (cfg.reduceMotion ? 0 : 0.26));
    drawSkeleton(c, q, cfg.reduceFlash ? '#DDB16F' : m.grade >= 4 ? '#FFCB57' : '#F5B946', m.grade);
    c.restore();
  }

  function zap(c, R, m, q) {
    var e = m.target, live = e && !e.dead && e.state === 'active';
    var x = live ? e.x : m.x, y = live ? e.y : m.y, r = Math.max(0.30, Math.min(0.63, m.r));
    if (!live && q < 0.79) shockedActor(c, R, m, x, y);
    var grade = m.grade, n = 3 + Math.floor(grade * 0.62), d = r * (1.7 + (1.1 + grade * 0.24) * q);
    for (var i = 0; i < n; i++) {
      var local = [[d * 0.39, 0], [d * 0.57, 0.14], [d * 0.68, -0.10], [d, 0.11]];
      M.poly(c, R, M.local(local, x, y + r * 1.53, i * TAU / n + 0.18), i % 2 ? '253,183,83' : BLUE,
        (1 - q) * 0.9, 2.3 + grade * 0.33, false);
    }
  }

  function burstEdge(c, y, xR, yR, n, color) {
    c.beginPath();
    for (var i = 0; i < n * 2; i++) {
      var a = i * Math.PI / n, r = i % 2 ? 0.83 : (i % 4 ? 1.24 : 1.04);
      c.lineTo(Math.cos(a) * xR * r, y + Math.sin(a) * yR * r);
    }
    c.closePath(); c.fillStyle = color; c.fill();
  }

  function drawSkeleton(c, q, charge, grade) {
    var spread = 0.97 + 0.26 * q, pose = 0.18 * Math.sin(q * Math.PI);
    var arms = [[-spread - 0.12,-1.54 + pose],[-0.67,-1.44],[0,-1.68],[0.67,-1.64],[spread + 0.04,-2.02 - pose]];
    var legs = [[-0.68,-0.04],[-0.42,-0.43],[0,-0.84],[0.45,-0.49],[0.81,-0.16]];
    c.lineJoin = 'round'; c.lineCap = 'round';
    burstEdge(c, -1.40, 1.09 + grade * 0.045, 1.47 + grade * 0.057, 15, charge);
    bones(c, arms, charge, 0.59); bones(c, legs, charge, 0.56);
    bones(c, arms, '#171829', 0.35); bones(c, legs, '#171829', 0.34);
    c.beginPath(); c.ellipse(0,-1.28,0.49,0.64,0,0,TAU); c.fillStyle = '#171829'; c.fill();
    bones(c, arms, '#FFF8E4', 0.105); bones(c, legs, '#FFF8E4', 0.111);
    bones(c, [[0,-0.95],[0,-1.92]], '#FFF8E4', 0.095);
    for (var i = 0; i < 4; i++) {
      var y = -1.64 + i * 0.17;
      bones(c, [[-0.32,y],[0,y + 0.07],[0.32,y - 0.025]], '#FFF8E4', 0.082);
    }
    skull(c, q);
  }

  function skull(c, q) {
    c.fillStyle = '#171829'; c.beginPath(); c.ellipse(-0.03,-2.25,0.55,0.53,0.12,0,TAU); c.fill();
    c.fillStyle = '#FFF8E4'; c.beginPath(); c.ellipse(-0.04,-2.27,0.43,0.39,0.12,0,TAU); c.fill();
    c.fillRect(-0.24,-2.08,0.39,0.22);
    c.fillStyle = '#171829'; c.beginPath();
    c.ellipse(-0.23,-2.33,0.105,0.135,0.30,0,TAU); c.fill();
    c.beginPath(); c.ellipse(0.13,-2.34,0.102,0.132,-0.30,0,TAU); c.fill();
    c.beginPath(); c.ellipse(-0.035,-2.00,0.102,0.074 + q * 0.02,0.09,0,TAU); c.fill();
  }

  function bones(c, pts, color, w) {
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.strokeStyle = color; c.lineWidth = w; c.stroke();
  }

  function doorContact(c, R, m, q) {
    var width = .36 + m.grade * .075, travel = .34 + q * (.83 + m.grade * .12), fade = Math.pow(1 - q, .7);
    var front = M.local([[travel - .56,-width], [travel - .16,-width * .57], [travel,0],
      [travel - .16,width * .57], [travel - .56,width]], m.x, m.y + .25, m.a);
    M.poly(c, R, front, INK, fade, 7 + m.grade, false);
    M.poly(c, R, front, m.grade >= 4 ? '255,137,99' : GOLD, fade, 4 + m.grade * .65, false);
    M.poly(c, R, front.slice(1, 4), CREAM, fade, 2.6, false);
    if (q < .66) flare(c, R, m.x, m.y + .26, m.a + .3, .50 + q * .51, 5, CREAM, fade);
  }

  var draw = {
    propStrike: function (c, R, m, q) { flare(c, R, m.x, m.y + .35, m.a, .46 + .34 * q, 5, GOLD, 1 - q); },
    doorBash: doorContact,
    doorSlam: metal,
    manholeThrow: release, manholeBounce: coverImpact,
    slingPull: release, marbleHit: ricochet, marbleFork: function (c, R, m, q) {
      flare(c, R, m.x, m.y + 0.25, 0, (0.31 + q * 0.83) * (1 + m.grade * 0.11), 6, GOLD, 1 - q);
    },
    spearFire: spearSplash, spearHit: spearSplash,
    spearPin: spearLock, oltaSlam: function (c, R, m, q) {
      groundRing(c, R, m, q, m.r * (0.5 + q * 0.73), TEAL, 2.1 + m.grade * 0.58);
      if (m.grade >= 4) flare(c, R, m.x, m.y, 0.25, m.r * (0.67 + q * 0.94), 6, CREAM, 1 - q);
    },
    cableArc: zap, stormZap: zap
  };

  A.drawAir = function (R) {
    var c = R.ctx;
    c.save();
    for (var i = 0; i < marks.length; i++) {
      var m = marks[i], p = R.toScreen && R.toScreen(m.x, m.y), pad = R.ppm * 3;
      if (p && (p.x < -pad || p.x > R.W + pad || p.y < -pad || p.y > R.H + pad)) continue;
      draw[m.k](c, R, m, m.age / m.T);
    }
    c.restore();
  };

  return A;
})();
