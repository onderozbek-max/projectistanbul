// Fire animation primitives (view only, workstream B). Shared by fire-anim.js, fire-anim-held*.js and fire-anim-fx*.js.
// F is the FireAnim instance: F.R (camera: X/Y in CSS px), F.c (canvas context), F.m (px per metre), F.q (density, 0.5
// under reduced motion), F.rm (reduced motion). World units are metres: x right, y up. Limbs are screen-space ink lines
// (bold ink outlines, DS 2); weapons use begin/end, a metre-scaled local frame (+x along the aim, +y screen-down at a = 0).
P.FireAnimPrim = (function () {
  var M = {}, TAU = Math.PI * 2, INK = '#14151F';
  M.INK = INK; M.SLEEVE = '#D7263D'; M.SKIN = '#E0AC80'; M.ARM_U = 0.165; M.ARM_F = 0.153;
  M.hx = 0; M.hy = 0;   // clamped hand from the last arm() call

  M.clamp01 = function (v) { return v < 0 ? 0 : (v > 1 ? 1 : v); };
  M.seg = function (t, a, b) { return M.clamp01((t - a) / (b - a)); };
  M.eo = function (t) { var u = 1 - t; return 1 - u * u * u; };
  M.ei = function (t) { return t * t * t; };
  M.lerp = function (a, b, t) { return a + (b - a) * t; };
  M.rnd = function (a, b) { return a + Math.random() * (b - a); };
  M.rgba = function (col, a) { return 'rgba(' + col + ',' + (a < 0 ? 0 : a > 1 ? 1 : a).toFixed(3) + ')'; };

  // Weapon-local frame: origin at world (x, y), units in metres. Pair every begin with end.
  M.begin = function (F, x, y, a) { var c = F.c; c.save(); c.translate(F.R.X(x), F.R.Y(y)); c.rotate(-a); c.scale(F.m, F.m); };
  M.end = function (F) { F.c.restore(); };
  // Fill (optional) then ink outline; px is the outline width in CSS pixels (converted to local metres).
  M.ink = function (F, fill, px) {
    var c = F.c;
    if (fill) { c.fillStyle = fill; c.fill(); }
    c.strokeStyle = INK; c.lineWidth = px / F.m; c.stroke();
  };
  M.rr = function (c, x, y, w, h, r) { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); };

  // Screen-space limb: ink under-stroke, then the colour. w in metres.
  M.limb = function (F, x0, y0, x1, y1, col, w) {
    var c = F.c, X0 = F.R.X(x0), Y0 = F.R.Y(y0), X1 = F.R.X(x1), Y1 = F.R.Y(y1), pw = w * F.m;
    c.lineCap = 'round';
    c.strokeStyle = INK; c.lineWidth = pw + 3; c.beginPath(); c.moveTo(X0, Y0); c.lineTo(X1, Y1); c.stroke();
    c.strokeStyle = col; c.lineWidth = pw; c.beginPath(); c.moveTo(X0, Y0); c.lineTo(X1, Y1); c.stroke();
  };
  // Two-bone arm from shoulder (sx, sy) toward hand (hx, hy), elbow bent toward `bend` (+1 or -1). Sets M.hx/M.hy to the
  // clamped hand. Draw the weapon, then M.hand on top.
  M.arm = function (F, sx, sy, hx, hy, bend, sleeve) {
    var U = M.ARM_U, Fo = M.ARM_F, L = U + Fo - 0.004;
    var dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy) || 1e-6, dd = Math.min(Math.max(d, 0.06), L);
    var ux = dx / d, uy = dy / d, a = (U * U - Fo * Fo + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(0, U * U - a * a));
    var px = -uy * bend, py = ux * bend, bx = sx + ux * dd, by = sy + uy * dd;
    var ex = sx + ux * a + px * h, ey = sy + uy * a + py * h;
    M.limb(F, sx, sy, ex, ey, sleeve || M.SLEEVE, 0.085);
    M.limb(F, ex, ey, bx, by, sleeve || M.SLEEVE, 0.078);
    M.hx = bx; M.hy = by;
  };
  M.hand = function (F, x, y) {
    var c = F.c;
    c.beginPath(); c.arc(F.R.X(x), F.R.Y(y), 0.056 * F.m, 0, TAU); c.fillStyle = M.SKIN; c.fill();
    c.strokeStyle = INK; c.lineWidth = 1.5; c.stroke();
  };
  // Five-point-ish star (glint) at a world point; r metres; col any CSS colour; a is a screen angle.
  M.star = function (F, x, y, r, col, a) {
    var c = F.c, X = F.R.X(x), Y = F.R.Y(y), R1 = r * F.m, R2 = R1 * 0.28, i, q, rr;
    c.beginPath();
    for (i = 0; i < 8; i++) { q = (a || 0) + i * Math.PI / 4; rr = i & 1 ? R2 : R1; c.lineTo(X + Math.cos(q) * rr, Y + Math.sin(q) * rr); }
    c.closePath(); c.fillStyle = col; c.fill();
  };

  // Particle drawing. pass 0 = normal blend, pass 1 = additive (kinds flagged add at spawn).
  M.drawParts = function (F, pass) {
    var c = F.c, R = F.R, m = F.m, pool = F.pool, i, p, f, al, X, Y, r, j, n, pts;
    for (i = 0; i < pool.length; i++) {
      p = pool[i];
      if (!p.alive || p.add !== (pass === 1)) continue;
      f = 1 - p.t / p.T; al = (1 - f) * p.op; X = R.X(p.x); Y = R.Y(p.y + p.z);
      if (p.jit && !F.rm && p.t > p.T - 0.15) { X += M.rnd(-2.5, 2.5); Y += M.rnd(-2.5, 2.5); }   // local quake, 0.15 s
      switch (p.k) {
        case 'spark':
          c.strokeStyle = M.rgba(p.col, al); c.lineWidth = 1.8; c.lineCap = 'round';
          c.beginPath(); c.moveTo(X, Y); c.lineTo(X - p.vx * 0.05 * m, Y + p.vy * 0.05 * m - p.vz * 0.05 * m); c.stroke(); break;
        case 'streak':
          c.strokeStyle = M.rgba(p.col, al); c.lineWidth = 2.2; c.lineCap = 'round';
          c.beginPath(); c.moveTo(X, Y); c.lineTo(X - p.vx * 0.04 * m, Y + p.vy * 0.04 * m); c.stroke(); break;
        case 'glint':
          M.star(F, p.x, p.y + p.z, p.r * (1 - 0.5 * f), M.rgba(p.col, al), p.a); break;
        case 'puff': case 'dust':
          r = p.r * m * (1 + 1.2 * f); c.fillStyle = M.rgba(p.col, al * 0.6 * (p.op || 1));
          c.beginPath(); c.arc(X, Y, r, 0, TAU); c.fill(); break;
        case 'flame':
          r = p.r * m * (1 - 0.5 * f) * (0.85 + 0.3 * Math.sin(p.a + f * 30));
          c.fillStyle = M.rgba(p.col, al); c.beginPath(); c.arc(X, Y, r, 0, TAU); c.fill(); break;
        case 'ring':
          r = p.r * m * (0.3 + 0.7 * f);
          c.strokeStyle = M.rgba(p.col, al); c.lineWidth = 0.5 + 2.5 * (1 - 0.5 * f);
          c.beginPath(); c.arc(X, Y, r, 0, TAU); c.stroke(); break;
        case 'arc':   // partial ring centred on screen angle p.a, half-span p.w
          r = p.r * m * (0.6 + 0.6 * f);
          c.strokeStyle = M.rgba(p.col, al); c.lineWidth = 1 + 3 * (1 - f); c.lineCap = 'round';
          c.beginPath(); c.arc(X, Y, r, p.a - p.w, p.a + p.w); c.stroke(); break;
        case 'chip':   // solid debris with ink edge, spins with p.a
          c.save(); c.translate(X, Y); c.rotate(p.a);
          c.fillStyle = 'rgb(' + p.col + ')'; c.strokeStyle = INK; c.lineWidth = 1;
          c.fillRect(-p.r * m, -p.r * m * 0.5, 2 * p.r * m, p.r * m); c.strokeRect(-p.r * m, -p.r * m * 0.5, 2 * p.r * m, p.r * m);
          c.restore(); break;
        case 'marble':
          r = p.r * m;
          c.beginPath(); c.arc(X, Y, r, 0, TAU); c.fillStyle = M.rgba(p.col, al); c.fill();
          c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
          c.beginPath(); c.arc(X - r * 0.35, Y - r * 0.35, r * 0.3, 0, TAU); c.fillStyle = 'rgba(255,255,255,' + (0.9 * al).toFixed(3) + ')'; c.fill();
          break;
        case 'bolt':   // jagged arc: wide soft glow then a white core; pts are world coordinates
          pts = p.pts; n = p.n;
          c.beginPath(); c.moveTo(R.X(pts[0]), R.Y(pts[1]));
          for (j = 1; j < n; j++) c.lineTo(R.X(pts[2 * j]), R.Y(pts[2 * j + 1]));
          c.lineCap = 'round'; c.strokeStyle = M.rgba(p.col, al * 0.4); c.lineWidth = p.r * m; c.stroke();
          c.strokeStyle = 'rgba(255,255,255,' + (al * 0.95).toFixed(3) + ')'; c.lineWidth = 1.4; c.stroke();
          break;
      }
    }
  };

  return M;
})();
