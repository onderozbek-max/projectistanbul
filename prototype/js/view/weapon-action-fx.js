// Clear silhouettes for active attacks. Every path reads the same live entity that deals the hit.
(function (W) {
  var M = W.prim, TAU = M.TAU;
  var INK = '19,25,38', ICE = '165,231,255', PAPER = '255,248,219', BRASS = '255,183,84';
  var SKY = ['255,102,147', '255,207,85', '88,231,170', '96,211,255', '190,137,255', '255,151,75'];

  function fade(q) { return Math.min(1, 6 * (1 - q)); }
  function offset(x, y, a, d) { return [x + Math.cos(a) * d, y + Math.sin(a) * d]; }

  function flame(c, R, x, y, a, reach, width, bend, color) {
    var p = M.local([[0, 0], [reach * 0.20, width * 0.42], [reach * 0.64, width + bend],
      [reach * 0.86, width * 0.96 + bend], [reach, bend], [reach * 0.69, bend - width * 0.65],
      [reach * 0.37, width * -0.34]], x, y, a);
    c.beginPath(); c.moveTo(R.X(p[0][0]), R.Y(p[0][1]));
    c.quadraticCurveTo(R.X(p[1][0]), R.Y(p[1][1]), R.X(p[2][0]), R.Y(p[2][1]));
    c.quadraticCurveTo(R.X(p[3][0]), R.Y(p[3][1]), R.X(p[4][0]), R.Y(p[4][1]));
    c.quadraticCurveTo(R.X(p[5][0]), R.Y(p[5][1]), R.X(p[6][0]), R.Y(p[6][1]));
    c.closePath(); c.fillStyle = M.rgba(color, 0.48); c.fill();c.strokeStyle=M.rgba(color,.88);c.lineWidth=1.5;c.stroke();
  }

  W.flameJet = function (c, R, E, L) {
    var s = E.src;
    if (s.done) return;
    var grade = L.id === 'forge' ? 6 : L.lv, t = s.t || 0, length = (s.range || 2.5) * Math.min(1, 0.53 + t * 8);
    var a = s.a || 0, p = offset(E.hx, E.hy + 0.29, a, 0.34);
    var width = grade < 3 ? 0.16 : 0.26, q = grade >= 5 ? 0.32 : 0.18;
    flame(c, R, p[0], p[1], a, length * 0.88, width, 0.07, grade >= 5 ? '250,98,35' : '233,114,49');
    flame(c, R, p[0], p[1], a, length * (grade >= 5 ? 0.72 : 0.55), width * 0.65, 0.03, '255,204,97');
    flame(c, R, p[0], p[1], a, length * 0.32, width * 0.44, 0, '142,229,255');
    if (grade >= 3) flame(c, R, p[0], p[1], a - q, length * 0.92, width * 0.55, -0.10, '255,159,65');
    if (grade >= 5) flame(c, R, p[0], p[1], a + q, length * 0.98, width * 0.50, 0.13, grade === 6 ? '255,224,116' : '241,114,52');
    if (grade === 6) flame(c, R, p[0], p[1], a + q * 0.53, length * 0.63, 0.075, 0.07, '255,238,169');
  };

  W.revBar = function (c, R, E, L) {
    var s = E.src, a = E.a, q = M.clamp((s.t || 0) / (s.T || 1)), alpha = fade(q), r = s.range || 2.2;
    var grinder = L.id === 'grinder', color = grinder ? '255,138,84' : BRASS;
    var direction = (s.turns > 1 && Math.floor(q * s.turns) % 2) ? -1 : 1;
    var span = s.round || s.sig ? Math.min(TAU * q + 0.20, 1.9) : s.turns > 1 ? 0.74 : 0.31;
    var from = direction > 0 ? a - span : a, to = direction > 0 ? a : a + span, x = E.hx, y = E.hy + 0.20;
    M.arc(c, R, x, y, r * 0.88, from, to, color, alpha * 0.88, s.round ? 6 : 3.3);
    M.arc(c, R, x, y, r * 0.86, a - 0.14, a + 0.08, PAPER, alpha * 0.94, 2.4);
    if (s.turns > 1 || s.round) M.arc(c, R, x, y, r * 0.66, from + 0.04, to + 0.04, color, alpha * 0.7, 2.2);
    if (s.round || grinder) {
      var n = grinder ? 5 : 4;
      for (var i = 1; i <= n; i++) {
        var tt = a - direction * (i / n) * span;
        M.poly(c, R, M.local([[r * 0.75, 0], [r * 0.92, 0.05], [r * 1.02, 0.24 * direction]], x, y, tt),
          i % 2 ? color : PAPER, alpha * (1 - i / (n + 2)), 2.4, false);
      }
    }
  };

  function tangentTrail(c, R, E, L, color, curve) {
    var hist = E.hist;
    if (curve && hist.length > 1) M.trail(c, R, hist, color, L.alpha * 0.92, 3.4, 1);
    else M.trail(c, R, hist, color, L.alpha * 0.68, 1.6, L.trail);
  }

  W.sawDisc = function (c, R, E, L) {
    var s = E.src, curved = !!s.bend, x = E.x, y = E.y, rank = L.id === 'twinsaw' ? 6 : L.lv;
    var color = s.phase === 'back' ? ICE : PAPER;
    tangentTrail(c, R, E, L, color, curved && L.trail > 0);
    var rot = E.now * (6.6 + rank * 1.6), r = 0.39 + rank * 0.051, teeth = [], n = rank >= 4 ? 20 : 16;
    for (var i = 0; i < n; i++) {
      var d = i % 2 ? r * 0.75 : r;
      teeth.push(offset(x, y, rot + i * TAU / n, d));
    }
    M.fill(c, R, teeth, s.bend < 0 ? '133,216,238' : '209,211,211', L.alpha);
    M.ring(c, R, x, y, r * 0.60, INK, L.alpha, 2);
    M.disc(c, R, x, y, r * 0.24, INK, L.alpha);
    M.arc(c, R, x, y, r * 1.23, rot, rot + 1.3 + rank * 0.41, color, L.alpha * 0.94, 2.4 + rank * 0.53);
    if (rank >= 3) M.arc(c, R, x, y, r * 1.41, rot - 0.34, rot + 0.8 + rank * 0.38, s.phase === 'back' ? '72,143,220' : BRASS, L.alpha * 0.74, 2.2);
  };

  W.rocketSpiral = function (c, R, E, L) {
    var s = E.src, color = SKY[(s.col || 0) % SKY.length], a = s.a || 0;
    var tail = s.trail || E.hist, x = E.x, y = E.y + 0.24;
    M.trail(c, R, tail, color, 0.87, 2.9, 1);
    M.fill(c, R, M.local([[-0.23, -0.057], [0.13, -0.05], [0.24, 0], [0.13, 0.05], [-0.23, 0.057]], x, y, a), color, 1);
    M.poly(c, R, M.local([[-0.29, -0.045], [-0.53, 0], [-0.29, 0.048]], x, y, a), PAPER, 0.87, 1.5, false);
    if (L.lv >= 3) M.poly(c, R, M.local([[-0.55, 0.15], [-0.37, 0.19], [-0.20, 0.12]], x, y, a), color, 0.85, 1.7, false);
    if (L.lv >= 5) M.poly(c, R, M.local([[-0.65, -0.16], [-0.39, -0.20], [-0.18, -0.10]], x, y, a), SKY[((s.col || 0) + 2) % SKY.length], 0.90, 1.9, false);
  };

  W.boltCoil = function (c, R, E, L) {
    var s = E.src, q = E.q, a = Math.atan2(s.y1 - s.y0, s.x1 - s.x0);
    var d = Math.hypot(s.x1 - s.x0, s.y1 - s.y0), pts = [[0, 0]];
    for (var i = 1; i < 6; i++) pts.push([i * d / 6, (i % 2 ? 1 : -1) * (0.10 + M.noise(s.seed || 0, i) * 0.18)]);
    pts.push([d, 0]);
    var path = M.local(pts, s.x0, s.y0 + 0.37, a), alpha = Math.max(0, 1 - q);
    M.poly(c, R, path, '29,55,96', alpha, 5 + L.lv * 0.77, false);
    M.poly(c, R, path, L.lv >= 5 ? '153,174,255' : ICE, alpha, 2.4 + L.lv * 0.51, false);
    M.poly(c, R, path, PAPER, alpha, 1.3, false);
    M.poly(c, R, M.local([[d, 0], [d + 0.19, 0.22], [d + 0.08, 0.13], [d + 0.24, 0.40]], s.x0, s.y0 + 0.37, a), ICE, alpha, 2.1, false);
  };

  W.forgeJet = W.flameJet; W.grindWheel = W.revBar; W.twinDisc = W.sawDisc;
  Object.assign(W.layer, { flameJet: 'air', forgeJet: 'air' });

  // Each rank adds reach or another delayed layer. At the top, the outer comets branch into smaller stars.
  W.drawFirework = function (c, R, f) {
    var q = 1 - f.t / f.T, alpha = Math.pow(1 - q, 0.54), r = f.r * (1.10 + f.grade * 0.091);
    var ranges = f.grade >= 5 ? [1, 0.78, 0.53, 0.33] : f.grade >= 3 ? [1, 0.67, 0.42] : [1, 0.61];
    var still = !!(P.Settings && P.Settings.reduceMotion), n = still ? 9 : 10 + f.grade;
    for (var j = 0; j < ranges.length; j++) {
      var t = M.clamp((q - j * 0.12) / (1 - j * 0.12));
      if (t <= 0) continue;
      var spread = r * ranges[j] * (0.13 + 1.29 * (1 - Math.pow(1 - t, 2)));
      var color = SKY[(f.col + j * 2) % SKY.length], fall = still ? 0 : t * t * (j + 1) * 0.28;
      for (var i = 0; i < n - j * 2; i++) {
        var angle = (i + j * 0.45) * TAU / (n - j * 2), d = (i % 2 && j === 1 ? 0.72 : 1) * spread;
        var originX = f.x, originY = f.y + 0.69 + f.grade * 0.08 - fall;
        var p = offset(originX, originY, angle, d), tail = offset(originX, originY + 0.11 * t, angle, d * (0.64 + 0.17 * t));
        M.poly(c, R, [tail, p], color, alpha, j ? 2.5 : 3.6, false);
        M.disc(c, R, p[0], p[1], j ? 0.055 : 0.077, i % 3 === 0 ? PAPER : color, alpha);
        if (f.grade >= 5 && j === 0 && i % 2 === 0 && t > 0.34) {
          var side = (q - 0.34) * r * 0.43, gold = SKY[(f.col + i + 1) % SKY.length];
          M.poly(c, R, [p, offset(p[0], p[1], angle + 0.97, side)], gold, alpha * 0.88, 2, false);
          M.poly(c, R, [p, offset(p[0], p[1], angle - 0.76, side)], PAPER, alpha * 0.81, 1.9, false);
        }
      }
    }
  };

  W.drawHammer = function (c, R, f) {
    var q = 1 - f.t / f.T, x = f.x, y = f.y, r = f.r, a = 1 - q, n = 3 + f.grade;
    var color = f.grade === 6 ? '255,163,81' : ICE;
    var rise = Math.min(1, q * 4);
    for (var i = 0; i < n; i++) {
      var turn = (i + 0.13) * TAU / n, reach = r * (0.48 + (0.41 + f.grade * 0.079) * rise);
      var strike = M.local([[reach * 0.18, 0], [reach * 0.52, 0.095], [reach * 0.65, -0.06], [reach, 0.07]], x, y, turn);
      M.poly(c, R, strike, INK, a * 0.81, 5.9, false);
      M.poly(c, R, strike, i % 2 ? color : PAPER, a, 2.65 + f.grade * 0.51, false);
    }
    M.arc(c, R, x, y, r * (0.30 + 0.72 * q), 0, TAU, color, a * 0.81, 3.4 + f.grade * 0.38);
    if (f.grade >= 4) M.arc(c, R, x, y, r * (0.36 + q * 1.13), 0, TAU, PAPER, a * 0.78, 2.6);
    if (q < 0.62) hammerBolt(c, R, x, y, f.grade, 1 - q / 0.62, color);
    // The held head strikes at the real source; distant effects show propagated force, never a second floating hammer.
  };

  function hammerBolt(c, R, x, y, grade, a, color) {
    var h = 1.83 + grade * 0.34, w = 0.50 + grade * 0.081;
    var spine = [[x,y],[x - w * 0.32,y + h * 0.24],[x + w * 0.25,y + h * 0.45],
      [x - w * 0.49,y + h * 0.50],[x + w * 0.53,y + h * 0.80],[x + w * 0.73,y + h]];
    M.poly(c, R, spine, '27,71,127', a * 0.96, 11.4 + grade * 1.25, false);
    M.poly(c, R, spine, color, a, 7.5 + grade * 0.66, false);
    M.poly(c, R, spine, PAPER, a, 3.1 + grade * 0.42, false);
    for (var i = 0; i < (grade >= 4 ? 4 : 2); i++) {
      var from = spine[i + 1], side = i % 2 ? -1 : 1, width = w * (0.83 + i * 0.14);
      var fork = [from,[from[0] + side * width * 0.44,from[1] + h * 0.11],
        [from[0] + side * width * 0.51,from[1] + h * 0.05],[from[0] + side * width,from[1] + h * 0.17]];
      M.poly(c, R, fork, color, a, 5.5, false);
      M.poly(c, R, fork, PAPER, a * 0.92, 2, false);
    }
  }

  function hammerEcho(c, R, f, q) {
    var a = 1 - q / 0.43, size = 0.83 + f.grade * 0.15, ang = 0.16 - q * 1.1;
    var x = f.x, y = f.y + 0.16 + q * 0.78;
    var handle = [[-0.065,-0.04],[0.065,-0.02],[0.29,0.91 * size],[0.18,1.01 * size]];
    var head = [[-0.49 * size,-0.10],[-0.39*size,0.24],[0.43*size,0.28],[0.51*size,0.14],[0.49*size,-0.12]];
    M.fill(c, R, M.local(handle, x, y, ang), '114,76,54', a);
    M.fill(c, R, M.local(head, x, y, ang), '34,48,69', a);
    M.fill(c, R, M.local([[-0.39*size,0.03],[-0.33*size,0.17],[0.36*size,0.21],[0.43*size,0.13],[0.38*size,0]],
      x, y, ang), f.grade === 6 ? '231,153,78' : '156,212,238', a * 0.96);
  }
})(P.WSil);
