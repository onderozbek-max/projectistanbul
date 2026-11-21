// Held tools and their live projectiles. The opaque forms carry through from launch to contact.
(function (W) {
  var M = W.prim, TAU = M.TAU, DEG = Math.PI / 180;
  var INK = '23,28,39', STEEL = '181,193,207', PAPER = '255,248,222', GOLD = '255,190,89', MINT = '98,224,206';

  function point(x, y, a, r) { return [x + Math.cos(a) * r, y + Math.sin(a) * r]; }
  function shape(c, p, color, stroke) {
    c.beginPath(); c.moveTo(p[0][0], p[0][1]);
    for (var i = 1; i < p.length; i++) c.lineTo(p[i][0], p[i][1]);
    c.closePath(); c.fillStyle = color; c.fill();
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 0.042; c.stroke(); }
  }

  // The detached front door keeps the window frame, wing mirror, handle and exposed hinge plates.
  function panel(c, R, x, y, tilt, front, bus, alpha, depth) {
    c.save(); c.translate(R.X(x), R.Y(y)); c.rotate(tilt);
    c.scale(R.ppm * front, R.ppm * (depth || 1)); c.globalAlpha *= alpha; c.lineJoin = 'round';
    if (bus) c.scale(1.25, 1.08);
    var red = bus ? '#31809A' : '#D44439', shadow = bus ? '#24546A' : '#9E2B35';
    shape(c, [[-0.72,-0.10],[-0.53,-0.51],[0.25,-0.53],[0.61,-0.31],[0.70,-0.04],[0.60,0.44],
      [0.48,0.54],[-0.59,0.48],[-0.68,0.36]], red, '#191D2C');
    shape(c, [[-0.62,0.21],[0.65,0.17],[0.60,0.44],[0.48,0.54],[-0.59,0.48]], shadow, null);
    shape(c, [[-0.57,-0.10],[-0.44,-0.41],[0.23,-0.43],[0.51,-0.26],[0.56,-0.11]], '#315566', '#191D2C');
    shape(c, [[-0.45,-0.13],[-0.40,-0.33],[0.20,-0.37],[0.40,-0.24],[0.47,-0.15]], '#91DAE6', null);
    shape(c, [[-0.16,-0.35],[0.03,-0.36],[-0.17,-0.15],[-0.34,-0.14]], '#D5F5EB', null);
    shape(c, [[0.48,-0.20],[0.71,-0.29],[0.84,-0.23],[0.81,-0.14],[0.56,-0.11]], shadow, '#191D2C');
    if (bus) shape(c, [[0.00,-0.41],[0.06,-0.41],[0.10,-0.12],[0.01,-0.12]], '#243748', null);
    shape(c, [[-0.43,0.01],[-0.18,0.00],[-0.16,0.08],[-0.42,0.10]], '#F8D0AC', '#522F38');
    shape(c, [[0.57,0.27],[0.74,0.27],[0.73,0.37],[0.55,0.39]], '#91A5AC', '#303442');
    shape(c, [[-0.60,0.15],[0.60,0.11],[0.58,0.18],[-0.61,0.21]], bus ? '#F1D478' : '#F68867', null);
    c.restore();
  }

  W.doorShield = function (c, R, E, L) {
    var s = E.src, grade = s.grade || L.lv, a = s.a || 0, r = s.radius || 1.6, travel = s.travel || 0;
    if (!travel) return;
    var bus = L.id === 'minibus', calm = P.Settings && P.Settings.reduceMotion, y = E.hy + 0.28;
    var span = Math.min(travel, 0.89 + grade * 0.49), f = s.swing ? 1 : Math.min(1, (1 - E.q) * 5);
    var paint = bus ? '77,181,217' : '226,77,60', edge = bus ? '183,243,255' : '255,169,103';
    M.arc(c, R, E.hx, y, r * 0.86, a - span, a, paint, 0.88 * f, 5.2 + grade * 0.95);
    M.arc(c, R, E.hx, y + 0.05, r * 0.96, a - span * 0.76, a + 0.12, edge, 0.97 * f, 2.65 + grade * 0.26);
    if (grade >= 3 && !calm) M.arc(c, R, E.hx, y + 0.22, r * 0.68, a - span, a - 0.15, '255,212,129', 0.73 * f, 2.3);
    if (grade >= 5 && !calm && travel > 1) {
      var tail = Math.min(TAU - 0.35, travel);
      M.arc(c, R, E.hx, y + 0.37, r * 0.60, a - tail, a - 0.32, paint, 0.55 * f, 3.8);
      M.arc(c, R, E.hx, y + 0.51, r * 0.43, a - tail * 0.79, a - 0.09, edge, 0.69 * f, 2.9);
    }
  };

  // This panel is drawn by the hero renderer from the very same angle driving the swept hit.
  W.drawHeldDoor = function (R, h, s, grip, free) {
    var c = R.ctx, a = s.a, u = R.ppm, front = Math.cos(a) < 0 ? -1 : 1, bus = s.id === 'minibus';
    var heave = s.heave || 0;
    var reach = s.radius * (s.swing ? 0.55 : 0.48), pos = point(h.x, h.y + 0.40 + heave * .63, a, reach);
    var tilt = -0.34 * Math.sin(a) - heave * 0.53 * front, width = front * (0.59 + 0.47 * Math.abs(Math.cos(a)));
    if (free) { panel(c, R, pos[0], pos[1], tilt, width, bus, 1); return; }
    var hx = grip ? grip.x : R.X(h.x), hy = grip ? grip.y : R.Y(h.y + 0.36);
    var handleX = -0.27 * width * u * (bus ? 1.25 : 1), handleY = 0.055 * u * (bus ? 1.08 : 1);
    var tx = R.X(pos[0]) + handleX * Math.cos(tilt) - handleY * Math.sin(tilt);
    var ty = R.Y(pos[1]) + handleX * Math.sin(tilt) + handleY * Math.cos(tilt);
    c.save();
    c.lineCap = 'round'; c.beginPath(); c.moveTo(hx, hy); c.lineTo(tx, ty);
    c.strokeStyle = '#232032'; c.lineWidth = 0.14 * u; c.stroke();
    c.strokeStyle = '#C93543'; c.lineWidth = 0.082 * u; c.stroke();
    panel(c, R, pos[0], pos[1], tilt, width, bus, 1);
    c.fillStyle = '#E9BA94'; c.strokeStyle = '#252237'; c.lineWidth = 1.3;
    c.beginPath(); c.arc(tx, ty, 0.066 * u, 0, TAU); c.fill(); c.stroke();
    c.restore();
  };

  W.drawDoorTosses = function (R, s) {
    if (!s.ws || !s.ws.doorTosses) return;
    var c = R.ctx, calm = P.Settings && P.Settings.reduceMotion;
    var rest = s.ws.doorRest, age = rest && s.t - rest.at;
    if (rest && age <= .48) {
      var q = age / .48, bounce = calm ? 0 : Math.sin(Math.PI * Math.min(1, q * 3)) * .20 * (1 - q);
      M.disc(c, R, rest.x, rest.y, .36, INK, .27 * (1 - q));
      panel(c, R, rest.x, rest.y + bounce, -rest.a + (calm ? .22 : .66 + .28 * q), .92,
        rest.id === 'minibus', Math.min(1, (1 - q) * 3), .57 + bounce);
    }
    s.ws.doorTosses.forEach(function (d) {
      var p = Math.min(1, d.t / d.T), x = d.x0 + (d.target.x - d.x0) * p, y = d.y0 + (d.target.y - d.y0) * p;
      var height = 1.03 * (1 - p) + Math.sin(Math.PI * p) * (.85 + d.grade * .095);
      M.disc(c, R, x, y, .32 + d.grade * .038, INK, .32 - .16 * Math.sin(Math.PI * p));
      var rot = -d.a + p * (calm ? .32 : 6.8 + d.grade * .25);
      var width = calm ? .96 : .94 * Math.cos(p * TAU * 1.25);
      if (!calm && p > .08) {
        var b = Math.max(0, p - .18), backX = d.x0 + (d.target.x - d.x0) * b;
        var backY = d.y0 + (d.target.y - d.y0) * b + 1.03 * (1 - b) + Math.sin(Math.PI * b) * (.85 + d.grade * .095);
        M.poly(c, R, [[backX, backY], [x,y + height]], d.grade === 6 ? '125,210,231' : '255,157,121',
          .46 * (1 - p), 3 + d.grade * .34, false);
      }
      panel(c, R, x, y + height, rot, Math.abs(width) < .24 ? Math.sign(width || 1) * .24 : width, d.id === 'minibus', 1);
    });
  };

  // Soft CO2 vapour starts at the nozzle. A stretch along the jet gives the white cloud direction.
  function sprayPuff(c, R, x, y, a, r, alpha) {
    c.beginPath(); c.ellipse(R.X(x), R.Y(y), r * R.ppm * 1.31, r * R.ppm, -a, 0, TAU);
    c.fillStyle = M.rgba('255,255,250', alpha); c.fill();
  }

  W.foamCone = function (c, R, E, L) {
    var s = E.src, a = s.a || 0, range = s.range || 2.5, age = Math.max(0, s.t || 0);
    if (s.wait > 0 || age > 0.62) return;
    var grade = L.id === 'foamstorm' ? 6 : L.lv, half = (s.arc || 72) * DEG / 2;
    var nozzle = point(E.hx, E.hy + 0.39, a, 0.39), calm = P.Settings && P.Settings.reduceMotion;
    var front = Math.min(1, 0.28 + age * 3.4), fade = Math.min(1, (0.62 - age) * 4.2);
    var spread = 0.37 + grade * 0.057, n = calm ? 13 : 14 + 4 * grade;
    for (var i = n - 1; i >= 0; i--) {
      var f = (i + 0.6) / n, side = (i % 2 ? 1 : -1) * M.noise(i + 2, 1.6), sin = Math.sin(f * Math.PI);
      var distance = range * front * f * (0.83 + 0.17 * M.noise(7 + i, 2));
      var direction = a + side * half * spread * f * (0.40 + 0.59 * front);
      var p = point(nozzle[0], nozzle[1], direction, distance);
      var radius = 0.061 + (0.12 + grade * 0.038) * sin + front * (0.022 + grade * 0.018) * f;
      sprayPuff(c, R, p[0], p[1], direction, radius, fade * (0.26 + 0.49 * (1 - f)));
      if (grade >= 4 && i % 3 === 0) {
        var wing = point(nozzle[0], nozzle[1], a + side * half * (0.50 + 0.39 * f), distance * 1.13);
        sprayPuff(c, R, wing[0], wing[1], direction, radius * 1.04, fade * (grade === 6 ? 0.69 : 0.48));
      }
    }
    var stop = point(nozzle[0], nozzle[1], a, range * 0.29 * front);
    M.poly(c, R, [nozzle, stop], '255,255,255', 0.92 * fade, 2.1 + grade * 0.39, false);
  };

  // Lift, bank and fall within each real segment, with a shadow locked to the hit plane.
  W.coverFrisbee = function (c, R, E, L) {
    var s = E.src, grade = s.grade || L.lv, tgt = s.phase === 'back' ? { x: E.hx, y: E.hy } : s.target;
    var x0 = s.legX === undefined ? E.hx : s.legX, y0 = s.legY === undefined ? E.hy : s.legY;
    var d = Math.hypot(E.x - x0, E.y - y0), left = tgt ? Math.hypot(tgt.x - E.x, tgt.y - E.y) : 0.3;
    var q = M.clamp(d / Math.max(0.2, d + left - 0.28)), r = 0.40 + grade * 0.07;
    var heavy = s.lv.craterR && !s.hit.length && s.phase !== 'back';
    if (heavy) r += (grade - 3) * 0.15;
    var lift = 0.19 + Math.sin(Math.PI * q) * (0.36 + grade * 0.081), x = E.x, y = E.y + lift;
    var rot = (s.t || 0) * (5 + grade * 0.96), color = grade >= 4 ? GOLD : '165,208,231';
    if (heavy) {
      y += Math.sin(Math.PI * q) * (grade - 3) * 0.29;
      M.arc(c, R, x, y, r * 1.28, rot - 3.8, rot - 0.24, GOLD, 0.93, 4.7);
      M.arc(c, R, x, y + 0.10, r * 1.44, rot - 2.60, rot, PAPER, 0.91, 2.3);
    }
    M.disc(c, R, x, E.y, 0.15 + grade * 0.024, INK, 0.28);
    var launch = point(x0, y0 + 0.21, Math.atan2(y - y0, x - x0), Math.min(d * 0.64, 0.95));
    M.poly(c, R, [launch, [x, y]], color, 0.24 + grade * 0.095, 2.3 + grade * 0.67, false);
    c.save(); c.translate(R.X(x), R.Y(y)); c.rotate(rot * 0.25); c.scale(R.ppm, R.ppm * (0.5 + 0.28 * Math.sin(Math.PI * q)));
    c.beginPath(); c.arc(0, 0.085, r, 0, TAU); c.fillStyle = '#3E475A'; c.fill(); c.lineWidth = 0.071; c.strokeStyle = '#171C29'; c.stroke();
    c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fillStyle = '#8797A3'; c.fill(); c.stroke();
    c.beginPath(); c.arc(0, 0, r * 0.83, 0, TAU); c.lineWidth = 0.058; c.strokeStyle = '#EBE4CE'; c.stroke();
    c.rotate(rot); c.beginPath();
    for (var i = -2; i <= 2; i++) {
      var z = i * r * 0.22, lim = Math.sqrt(r * r * 0.5 - z * z);
      c.moveTo(-lim, z); c.lineTo(lim, z); c.moveTo(z, -lim); c.lineTo(z, lim);
    }
    c.strokeStyle = '#313C4D'; c.lineWidth = 0.046; c.stroke(); c.restore();
  };

  // An inked steel shot and a tapered trail for each bank. Split shots have their own brass colour.
  W.marbleFan = function (c, R, E, L) {
    var s = E.src, grade = s.grade || L.lv, r = 0.115 + grade * 0.021;
    var x = E.x, y = E.y + 0.20, ox = s.sx === undefined ? E.hx : s.sx, oy = (s.sy === undefined ? E.hy : s.sy) + 0.19;
    var a = Math.atan2(y - oy, x - ox), d = Math.hypot(y - oy, x - ox), tail = Math.min(0.61 + 0.15 * grade, d);
    var color = s.splitShot ? GOLD : grade >= 3 ? MINT : '186,232,241';
    M.fill(c, R, M.local([[-tail, 0], [-0.15, r * 0.64], [0, 0], [-0.15, -r * 0.64]], x, y, a), color, 0.78);
    M.disc(c, R, x, y, r * 1.15, INK, 1);
    M.disc(c, R, x, y, r * 0.84, color, 1);
    M.disc(c, R, x - r * 0.22, y + r * 0.32, r * 0.37, PAPER, 0.96);
    if (grade >= 4) M.arc(c, R, x, y, r * 1.75, a - 1.18, a + 1.05, color, 0.91, 2.8);
  };

  W.hookLine = function (c, R, E, L) {
    var s = E.src, target = s.e;
    if (!target) return;
    var q = s.phase === 'cast' ? M.clamp(E.q) : 1, spinning = s.phase === 'spin', grade = L.id === 'hookpull' ? 6 : L.lv;
    var x = E.hx, y = E.hy + 0.38, ex = x + (target.x - x) * q, ey = y + (target.y + 0.31 - y) * q;
    var a = Math.atan2(ey - y, ex - x), bend = s.phase === 'cast' ? Math.sin(Math.PI * q) * (0.27 + grade * 0.1) : 0.05;
    var color = grade === 6 ? '143,223,255' : MINT, start = point(x, y, a, 0.23), end = [ex, ey];
    var line = [start, [(start[0] + ex) * 0.5, (start[1] + ey) * 0.5 + bend], end];
    M.poly(c, R, line, INK, 0.9, 4.4 + grade * 0.72, false);
    M.poly(c, R, line, color, 0.95, 2 + grade * 0.32, false);
    M.arc(c, R, ex, ey, 0.21 + grade * 0.027, a - 1.25, a + 2.22, PAPER, 0.94, 2.7 + grade * 0.48);
    if (spinning) spinWake(c, R, x, y, a, Math.hypot(ex - x, ey - y), grade, E.q, color);
  };

  function spinWake(c, R, x, y, a, reach, grade, q, color) {
    var r = Math.max(0.38, reach), span = Math.min(1.45 + grade * 0.54, 0.5 + TAU * q * 1.7);
    M.arc(c, R, x, y, r, a - span, a, color, 0.94, 2.6 + grade);
    M.arc(c, R, x, y, r * 0.87, a - span * 0.74, a + 0.16, PAPER, 0.86, 2 + grade * 0.42);
    if (grade >= 4) M.arc(c, R, x, y, r * 1.09, a - span * 0.88, a - 0.08, '37,112,151', 0.83, 2.9);
    if (grade >= 5) {
      for (var i = 0; i < 4; i++) {
        var angle = a - span * (i + 0.2) / 4;
        M.poly(c, R, M.local([[r * 0.92, 0], [r * 1.04, -0.12], [r * 1.14, -0.28]], x, y, angle), PAPER, 0.87, 2.5, false);
      }
    }
  }

  W.harpoonLine = function (c, R, E, L) {
    var s = E.src, stuck = s.phase === 'stuck', tip = stuck && s.last && !s.last.dead ? s.last : s;
    var grade = L.id === 'netspear' ? 6 : L.lv, aim = s.a, x = tip.x, y = tip.y + 0.34;
    var opacity = stuck ? Math.max(0, 1 - Math.max(0, E.q - 0.46) * 1.83) : 1;
    var len = (0.79 + grade * 0.13) * (s.primary ? 1 : 0.78);
    if (!stuck) waterWake(c, R, x, y, aim, Math.min(s.dist + 0.42, len * (1.8 + grade * 0.21)), grade, s.primary);
    var prongs = [[-0.91,0],[-0.20,0],[0.24,0],[-0.20,0],[-0.29,0.23],[0.15,0.28],
      [-0.29,0.23],[-0.20,0],[-0.29,-0.23],[0.15,-0.28]];
    var path = M.local(prongs.map(function (p) { return [p[0] * len, p[1] * len]; }), x, y, aim);
    M.poly(c, R, path, INK, opacity, 6.5 + grade * 0.62, false);
    M.poly(c, R, path, s.primary ? GOLD : MINT, opacity, 3.6 + grade * 0.51, false);
    M.poly(c, R, path, PAPER, opacity * 0.92, 1.45 + grade * 0.19, false);
  };

  function waterWake(c, R, x, y, aim, len, grade, primary) {
    var w = (0.27 + grade * 0.085) * (primary ? 1 : 0.69);
    var blade = [[-len,0],[-len * 0.75,-w * 0.14],[-len * 0.45,-w],[-len * 0.17,-w * 0.75],
      [0.32,0],[-len * 0.15,w * 0.73],[-len * 0.44,w * 0.87],[-len * 0.68,w * 0.45],[-len * 0.49,w * 0.39]];
    M.fill(c, R, M.local(blade, x, y, aim), '24,94,138', 0.90);
    for (var side = -1; side <= 1; side += 2) {
      var crest = [[-len * 0.89,w * side * 0.13],[-len * 0.54,w * side * 0.76],
        [-len * 0.32,w * side],[-len * 0.15,w * side * 0.77],[0.14,w * side * 0.32]];
      var wave = M.local(crest, x, y, aim);
      c.beginPath(); c.moveTo(R.X(wave[0][0]), R.Y(wave[0][1]));
      c.bezierCurveTo(R.X(wave[1][0]), R.Y(wave[1][1]), R.X(wave[2][0]), R.Y(wave[2][1]),
        R.X(wave[4][0]), R.Y(wave[4][1]));
      c.lineCap = 'round'; c.lineWidth = 6.6 + grade * 0.7; c.strokeStyle = '#39B5C3'; c.stroke();
      c.lineWidth = 2.6 + grade * 0.39; c.strokeStyle = '#D0FFF1'; c.stroke();
      if (grade >= 3) M.disc(c, R, wave[3][0], wave[3][1], 0.071 + grade * 0.011, PAPER, 0.89);
    }
  }

  function drawCord(c, R, p, b, end, color, alpha, grade) {
    c.beginPath(); c.moveTo(R.X(p[0]), R.Y(p[1])); c.quadraticCurveTo(R.X(b[0]), R.Y(b[1]), R.X(end[0]), R.Y(end[1]));
    c.lineCap = 'round'; c.strokeStyle = M.rgba(INK, alpha); c.lineWidth = 4.6 + grade * 0.23; c.stroke();
    c.strokeStyle = M.rgba(color, alpha); c.lineWidth = 2 + grade * 0.19; c.stroke();
    c.setLineDash([3, 5]); c.strokeStyle = M.rgba(PAPER, alpha * 0.63); c.lineWidth = 1.15; c.stroke(); c.setLineDash([]);
  }

  W.netMesh = W.harpoonLine;

  W.drawBoundNet = function (c, R, groups) {
    var remaining = 18;
    groups.forEach(function (net) {
      var center = net.members[0], opacity = 0.91 * Math.min(1, (net.T - net.t) * 4);
      net.members.forEach(function (e) {
        if (e === center || e.dead || remaining <= 0) return;
        remaining--;
        var a = Math.atan2(e.y - center.y, e.x - center.x), p = [center.x, center.y + 0.36], end = [e.x, e.y + 0.33];
        drawCord(c, R, p, [(p[0]+end[0])*0.5, (p[1]+end[1])*0.5 - 0.24], end, MINT, opacity, 2);
        M.arc(c, R, e.x, e.y + 0.32, e.r * 0.74, a + 0.62, a + 4.7, PAPER, opacity, 2.2);
      });
    });
  };

  W.slamDoor = W.doorShield;
  W.foamWall = W.foamCone;
  W.hookHaul = W.hookLine;
  Object.assign(W.layer, { foamCone: 'air', foamWall: 'air', slamDoor: 'air' });
})(P.WSil);
