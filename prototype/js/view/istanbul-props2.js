// Local Istanbul prop library, part 2 (workstream F): leisure, street furniture, residential, animals, water craft,
// apocalypse dressing, landmarks, exit gates and overhead rigs. Registers into P.Props (istanbul-props.js).
// Same contract as part 1: fn(c, X, Y, s, o); s = px per metre; overhead rigs take the ground Y and rise above it.
// Animals never harmed (cats flee or hiss, dogs sleep). No flags, religious objects, police or military.
(function () {
  var H = P.Props.h, ell = H.ell, rc = H.rc, poly = H.poly, ln = H.ln, shadow = H.shadow, box = H.box,
    glow = H.glow, teaGlass = H.teaGlass, reg = P.Props.reg, INK = '#14151F', TAU = Math.PI * 2;
  var GOLD = '#E9A23B', CREAM = '#F4EBDD';
  function smoke(c, X, Y, s, n, t, a) {
    for (var i = 0; i < n; i++) {
      var k = (t * 0.3 + i / n) % 1, r = (0.15 + k * 0.45) * s;
      ell(c, X + Math.sin(i * 2.7 + t * 0.5) * 0.15 * s * k, Y - k * 2.2 * s, r, r * 0.8, 'rgba(70,70,76,' + ((a || 0.35) * (1 - k)).toFixed(3) + ')', 0);
    }
  }
  function chair(c, X, Y, s, ang) {
    c.save(); c.translate(X, Y); c.rotate(ang);
    rc(c, 0, 0, 0.42 * s, 0.42 * s, '#8B5A2B', 1.5); rc(c, 0, -0.24 * s, 0.42 * s, 0.08 * s, '#5C3A1C', 1.2);
    c.restore();
  }
  function catBody(c, X, Y, s, o, boxed) {
    var t = performance.now() / 1000, col = ['#8A8F98', GOLD, '#3A3E45', CREAM][(o.k || 0) % 4], base = Y;
    shadow(c, X, Y, 0.35 * s, 0.15 * s);
    if (boxed) { box(c, X, Y, 0.7 * s, 0.6 * s, 0.25 * s, '#B8864B', '#7A5530'); base = Y - 0.25 * s; }
    var hy = base - (o.alert ? 0.1 : 0) * s;
    ln(c, X - 0.2 * s, base, X - 0.4 * s, base + (o.alert ? 0 : 0.1) * s + Math.sin(t * 2) * 0.03 * s, INK, 3);
    ell(c, X, base - 0.04 * s, 0.2 * s, 0.12 * s, col, 1.4);
    ell(c, X + 0.2 * s, hy - 0.08 * s, 0.1 * s, 0.1 * s, col, 1.4);
    poly(c, [[X + 0.14 * s, hy - 0.14 * s], [X + 0.16 * s, hy - 0.26 * s], [X + 0.24 * s, hy - 0.14 * s]], col, 1.2);
    if (o.alert) ell(c, X + 0.24 * s, hy - 0.08 * s, 0.025 * s, 0.025 * s, '#FFE27A', 0);
  }

  // ---- leisure and street furniture ----
  reg('cafe', function (c, X, Y, s) {
    [[-0.6, 0.4, 0], [0.5, -0.6, 1]].forEach(function (p) {
      var tx = X + p[0] * s, ty = Y + p[1] * s;
      [[-0.45, 0], [0.45, 0]].forEach(function (q) { ell(c, tx + q[0] * s, ty + 0.05 * s, 0.15 * s, 0.1 * s, '#6B3E26', 1.2); });
      ell(c, tx, ty, 0.34 * s, 0.22 * s, '#E8E1D2', 1.5);
      if (p[2] === 0) rc(c, tx, ty - 0.02 * s, 0.32 * s, 0.2 * s, '#8B5A2B', 1.2);
      else { teaGlass(c, tx - 0.1 * s, ty, s); teaGlass(c, tx + 0.12 * s, ty + 0.03 * s, s); }
    });
  });
  reg('tavla', function (c, X, Y, s) {
    var w = 1.2 * s, d = 0.8 * s, hg = 0.35 * s, cy = Y - hg;
    shadow(c, X, Y, w * 0.6, d * 0.5);
    box(c, X, Y, w, d, hg, '#8B5A2B', '#5C3A1C');
    for (var i = 0; i < 6; i++) {
      var x0 = X - w * 0.45 + i * w * 0.15;
      poly(c, [[x0, cy - d * 0.42], [x0 + w * 0.075, cy], [x0 + w * 0.15, cy - d * 0.42]], i % 2 ? CREAM : '#C0392B', 0.8);
      poly(c, [[x0, cy + d * 0.42], [x0 + w * 0.075, cy], [x0 + w * 0.15, cy + d * 0.42]], i % 2 ? '#C0392B' : CREAM, 0.8);
    }
    rc(c, X + w * 0.3, cy, 0.12 * s, 0.12 * s, CREAM, 1.2); rc(c, X + w * 0.38, cy + 0.1 * s, 0.12 * s, 0.12 * s, CREAM, 1.2);
  });
  reg('chairs', function (c, X, Y, s) {
    shadow(c, X, Y, 0.7 * s, 0.35 * s);
    chair(c, X - 0.45 * s, Y + 0.1 * s, s, 0.5); chair(c, X + 0.45 * s, Y - 0.1 * s, s, -0.5);
  });
  reg('music', function (c, X, Y, s) {
    var w = 1.3 * s, d = 0.8 * s, hg = 0.7 * s, cy = Y - hg;
    shadow(c, X, Y, w * 0.6, d * 0.5);
    box(c, X, Y, w, d, hg, '#6B3E26', '#4A2A18');
    ell(c, X - w * 0.2, cy, 0.3 * s, 0.22 * s, '#C0392B', 1.5);
    ell(c, X - w * 0.2, cy, 0.2 * s, 0.14 * s, CREAM, 1);
    ell(c, X + w * 0.25, cy + d * 0.15, 0.2 * s, 0.26 * s, '#B5651D', 1.5);
    ln(c, X + w * 0.25, cy - d * 0.1, X + w * 0.3, cy - d * 0.45, '#3A2A1E', 3);
  });
  reg('books', function (c, X, Y, s, o) {
    var cols = ['#C0392B', '#1B4965', '#2E7D4F', GOLD, '#7A4F8C', CREAM], kv = o.k || 0, w = 1.4 * s, d = 0.7 * s, hg = 0.5 * s, cy = Y - hg;
    shadow(c, X, Y, w * 0.6, d * 0.5);
    box(c, X, Y, w, d, hg, '#8B5A2B', '#5C3A1C');
    for (var b = 0; b < 4; b++) for (var k = 0; k < 4; k++) rc(c, X - w * 0.36 + b * w * 0.24, cy + d * 0.1 - k * 0.08 * s, 0.18 * s, 0.06 * s, cols[(k + b + kv) % 6], 0.8);
  });
  reg('durak', function (c, X, Y, s) {
    shadow(c, X, Y, 0.3 * s, 0.15 * s);
    ln(c, X, Y, X, Y - 2.0 * s, '#8A8F98', 3);
    rc(c, X, Y - 2.2 * s, 0.7 * s, 0.7 * s, '#1B4965', 2);
    rc(c, X, Y - 2.2 * s, 0.4 * s, 0.3 * s, CREAM, 1);
    rc(c, X - 0.1 * s, Y - 2.25 * s, 0.1 * s, 0.08 * s, '#1B4965', 0); rc(c, X + 0.1 * s, Y - 2.25 * s, 0.1 * s, 0.08 * s, '#1B4965', 0);
  });
  reg('plaque', function (c, X, Y, s, o) {
    rc(c, X, Y - 0.8 * s, 0.9 * s, 0.28 * s, '#2B5DA0', 2);
    c.strokeStyle = CREAM; c.lineWidth = 1; c.strokeRect(X - 0.4 * s, Y - 0.8 * s - 0.11 * s, 0.8 * s, 0.22 * s);
    c.fillStyle = CREAM; c.font = 'bold ' + Math.round(0.14 * s) + 'px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(o.name || '', X, Y - 0.8 * s);
  });
  reg('parkmetre', function (c, X, Y, s) {
    shadow(c, X, Y, 0.2 * s, 0.1 * s);
    ln(c, X, Y, X, Y - 1.1 * s, '#4A525C', 3);
    rc(c, X, Y - 1.25 * s, 0.32 * s, 0.4 * s, '#8A8F98', 1.5);
    rc(c, X, Y - 1.28 * s, 0.2 * s, 0.12 * s, '#2E7D4F', 1);
  });
  reg('shelter', function (c, X, Y, s) {
    var w = 2.2 * s, d = 0.9 * s;
    shadow(c, X, Y, w * 0.6, d * 0.5);
    rc(c, X, Y - 0.6 * s, w * 0.9, 0.5 * s, 'rgba(160,200,215,0.45)', 1.2);
    ln(c, X - w / 2, Y - 1.9 * s, X - w / 2, Y, INK, 3); ln(c, X + w / 2, Y - 1.9 * s, X + w / 2, Y, INK, 3);
    rc(c, X, Y - 1.95 * s, w + 0.2 * s, d * 0.9, '#2F3A46', 2);
  });
  reg('saat', function (c, X, Y, s) {
    shadow(c, X, Y, 0.35 * s, 0.18 * s);
    ln(c, X, Y, X, Y - 2.4 * s, '#3A3E45', 4);
    var cy = Y - 2.6 * s, r = 0.42 * s, t = performance.now() / 1000 * 0.2;
    ell(c, X, cy, r, r, CREAM, 2);
    ln(c, X, cy, X + Math.sin(t) * r * 0.7, cy - Math.cos(t) * r * 0.7, INK, 2);
    ln(c, X, cy, X + Math.sin(t / 12) * r * 0.45, cy - Math.cos(t / 12) * r * 0.45, INK, 2.5);
  });
  reg('pillar', function (c, X, Y, s, o) {
    var r = (o.w || 0.9) * s * 0.5, hg = 3.2 * s;
    shadow(c, X, Y, r * 1.5, r * 0.8);
    rc(c, X, Y - hg / 2, r * 2, hg, '#8A8F98', 2);
    ell(c, X, Y - hg, r * 1.4, r * 0.7, '#B9BEC6', 2);
  });
  reg('iskele', function (c, X, Y, s, o) {
    var w = (o.w || 1.4) * s, d = (o.h || 2.4) * s;
    shadow(c, X, Y, w * 0.6, d * 0.5);
    box(c, X, Y, w, d, 0.25 * s, '#8A8F98', '#5A5F68');
    for (var i = 1; i < 4; i++) ln(c, X - w / 2 + i * w / 4, Y - d / 2 - 0.25 * s, X - w / 2 + i * w / 4, Y + d / 2 - 0.25 * s, '#3A3A3A', 1.5);
  });
  reg('vinc', function (c, X, Y, s) {
    shadow(c, X, Y, 1.4 * s, 0.7 * s);
    rc(c, X, Y, 1.4 * s, 1.4 * s, '#B8B8B8', 2);
    ln(c, X, Y, X, Y - 6 * s, GOLD, 4);
    ln(c, X - 4 * s, Y - 6 * s, X + 6 * s, Y - 6 * s, GOLD, 3);
    ln(c, X + 4.5 * s, Y - 6 * s, X + 4.5 * s, Y - 3.5 * s, INK, 1.2);
    rc(c, X + 4.5 * s, Y - 3.4 * s, 0.2 * s, 0.2 * s, INK, 0);
  });
  reg('lamp', function (c, X, Y, s, o) {
    // Flickering lamp: its state steps 3 times a second at most (design-system 11; it used to change up to ~7 times a second over a
    // 2.6 m glow). Steady on under Reduce flashing.
    var t = Math.floor(performance.now() / 1000 * 3) / 3, on = o.flick && !(P.Settings && P.Settings.reduceFlash) ? (Math.sin(t * 23) * Math.sin(t * 5.3) > 0.2 ? 0.25 : 1) : 1;
    shadow(c, X, Y, 0.2 * s, 0.1 * s);
    ln(c, X, Y, X, Y - 2.2 * s, INK, 3);
    glow(c, X, Y - 2.2 * s, 2.6 * s, 0.4 * on);
    ell(c, X, Y - 2.2 * s, 0.16 * s, 0.16 * s, '#FFE2A8', 2);
  });
  reg('handtruck', function (c, X, Y, s) {
    shadow(c, X, Y, 0.4 * s, 0.25 * s);
    ln(c, X - 0.2 * s, Y, X - 0.25 * s, Y - 1.1 * s, INK, 3); ln(c, X + 0.2 * s, Y, X + 0.25 * s, Y - 1.1 * s, INK, 3);
    box(c, X, Y - 0.1 * s, 0.7 * s, 0.6 * s, 0.4 * s, '#B5651D', '#7A4A1C');
    ell(c, X, Y + 0.05 * s, 0.1 * s, 0.1 * s, '#1E1F25', 1.2);
  });
  reg('manken', function (c, X, Y, s, o) {
    var cols = ['#7A4F8C', GOLD, '#1B4965', CREAM], kv = o.k || 0;
    shadow(c, X, Y, 0.3 * s, 0.14 * s);
    poly(c, [[X - 0.22 * s, Y - 0.1 * s], [X + 0.22 * s, Y - 0.1 * s], [X + 0.15 * s, Y - 1.0 * s], [X - 0.15 * s, Y - 1.0 * s]], cols[kv % 4], 1.5);
    ln(c, X - 0.16 * s, Y - 0.95 * s, X - 0.3 * s, Y - 0.6 * s, cols[kv % 4], 4);
    ell(c, X, Y - 1.2 * s, 0.12 * s, 0.14 * s, '#E8E1D2', 1.5);
  });
  reg('deri', function (c, X, Y, s) {
    shadow(c, X, Y, 0.9 * s, 0.4 * s);
    ln(c, X - 0.8 * s, Y - 1.3 * s, X + 0.8 * s, Y - 1.3 * s, '#8A8F98', 3);
    ln(c, X - 0.8 * s, Y, X - 0.8 * s, Y - 1.3 * s, '#8A8F98', 2); ln(c, X + 0.8 * s, Y, X + 0.8 * s, Y - 1.3 * s, '#8A8F98', 2);
    for (var i = 0; i < 4; i++) {
      var jx = X - 0.6 * s + i * 0.4 * s;
      poly(c, [[jx - 0.14 * s, Y - 1.25 * s], [jx + 0.14 * s, Y - 1.25 * s], [jx + 0.2 * s, Y - 0.7 * s], [jx - 0.2 * s, Y - 0.7 * s]], i % 2 ? '#3A2A1E' : '#1E1712', 1.2);
    }
  });
  reg('kumas', function (c, X, Y, s, o) {
    var cols = ['#C0392B', '#1B4965', GOLD, '#2E7D4F', '#7A4F8C', CREAM], kv = o.k || 0;
    shadow(c, X, Y, 0.8 * s, 0.4 * s);
    for (var i = 0; i < 6; i++) ell(c, X - 0.5 * s + (i % 3) * 0.5 * s, Y - 0.1 * s + Math.floor(i / 3) * 0.4 * s, 0.22 * s, 0.13 * s, cols[(i + kv) % 6], 1.5);
  });
  reg('fisher', function (c, X, Y, s) {
    shadow(c, X, Y, 0.35 * s, 0.18 * s);
    ln(c, X + 0.2 * s, Y - 0.3 * s, X + 1.8 * s, Y - 2.6 * s, '#3A2A1E', 2);
    poly(c, [[X - 0.18 * s, Y - 0.2 * s], [X + 0.18 * s, Y - 0.2 * s], [X + 0.14 * s, Y - 0.9 * s], [X - 0.14 * s, Y - 0.9 * s]], '#3D6E9E', 1.5);
    ell(c, X, Y - 1.0 * s, 0.13 * s, 0.13 * s, '#C68B5E', 1.5);
    rc(c, X - 0.5 * s, Y - 0.1 * s, 0.25 * s, 0.25 * s, '#5E636B', 1.5);
  });
  reg('rods', function (c, X, Y, s) {
    shadow(c, X, Y, 0.5 * s, 0.3 * s);
    for (var i = 0; i < 3; i++) ln(c, X + i * 0.2 * s, Y + 0.4 * s, X + 0.5 * s + i * 0.2 * s, Y - 1.8 * s, '#3A2A1E', 2);
    rc(c, X - 0.3 * s, Y + 0.2 * s, 0.25 * s, 0.25 * s, '#5E636B', 1.5);
  });
  reg('phones', function (c, X, Y, s, o) {
    var kv = o.k || 0, t = performance.now() / 1000;
    for (var i = 0; i < 5; i++) {
      var px = X + Math.sin(i * 2.7 + kv) * 0.6 * s, py = Y + Math.cos(i * 1.9 + kv) * 0.5 * s;
      c.save(); c.translate(px, py); c.rotate((i * 0.9 + kv) % 3);
      rc(c, 0, 0, 0.14 * s, 0.26 * s, INK, 1);
      rc(c, 0, 0, 0.1 * s, 0.2 * s, (i === 0 && !(P.Settings && P.Settings.reduceFlash) && Math.floor(t * 2) % 2) ? '#7FC8F8' : '#2A3550', 0);
      c.restore();
    }
  });
  reg('glass', function (c, X, Y, s, o) {
    var kv = o.k || 0;
    for (var i = 0; i < 9; i++) {
      var px = X + Math.sin(i * 3.1 + kv) * 0.8 * s, py = Y + Math.cos(i * 2.3 + kv) * 0.6 * s, r = (0.08 + (i * 0.37 % 0.1)) * s, a = i * 1.3 + kv;
      poly(c, [[px + Math.cos(a) * r, py + Math.sin(a) * r], [px + Math.cos(a + 2.1) * r * 0.7, py + Math.sin(a + 2.1) * r * 0.7], [px + Math.cos(a + 4) * r * 0.8, py + Math.sin(a + 4) * r * 0.8]], i % 3 ? 'rgba(220,235,245,0.8)' : 'rgba(150,190,210,0.7)', 0.8);
    }
  });
  reg('cumba', function (c, X, Y, s) {
    var w = 1.6 * s, d = 0.7 * s;
    box(c, X, Y, w, d, 1.0 * s, '#8E7258', '#5C4A3A');
    for (var i = 0; i < 3; i++) rc(c, X - w * 0.33 + i * w * 0.33, Y + d / 2 - 0.5 * s, w * 0.26, 0.6 * s, 'rgba(255,220,160,0.6)', 1);
  });
  reg('geranium', function (c, X, Y, s) {
    shadow(c, X, Y, 0.3 * s, 0.15 * s);
    rc(c, X, Y - 0.15 * s, 0.34 * s, 0.3 * s, '#B5651D', 1.5);
    for (var i = 0; i < 7; i++) ell(c, X + Math.cos(i * 0.9) * 0.2 * s, Y - 0.4 * s + Math.sin(i * 1.7) * 0.12 * s, 0.07 * s, 0.07 * s, i % 3 ? '#D7263D' : '#F4A3C0', 1.2);
    for (var k = 0; k < 3; k++) ell(c, X + (k - 1) * 0.12 * s, Y - 0.3 * s, 0.1 * s, 0.07 * s, '#2E7D4F', 1);
  });
  reg('dish', function (c, X, Y, s) {
    shadow(c, X, Y, 0.5 * s, 0.25 * s);
    ln(c, X, Y, X, Y - 0.6 * s, '#8A8F98', 3);
    ell(c, X, Y - 0.8 * s, 0.45 * s, 0.3 * s, '#D9D4C7', 1.8);
    ell(c, X, Y - 0.8 * s, 0.12 * s, 0.08 * s, '#5E636B', 1.2);
  });
  reg('wood', function (c, X, Y, s, o) {
    var w = 2.4 * s, d = 2.6 * s, hg = 3.0 * s, cols = ['#8A5A3C', '#6B4A36', '#A07850'], kv = o.k || 0;
    box(c, X, Y, w, d, hg, cols[kv % 3], '#4A3322');
    rc(c, X, Y - d / 2 - hg - 0.1 * s, w * 1.2, 0.3 * s, '#5C3A1C', 1.5);
    for (var i = 0; i < 2; i++) rc(c, X - w * 0.25 + i * w * 0.5, Y + d / 2 - hg * 0.55, w * 0.28, hg * 0.3, '#FFE2A8', 1.2);
  });
  reg('wall', function (c, X, Y, s, o) {
    var len = (o.len || 8) * s, th = 1.4 * s, hg = 2.4 * s, yt = Y - len / 2 - hg;
    shadow(c, X, Y, th * 0.6, len * 0.12);
    box(c, X, Y, th, len, hg, '#A39878', '#6E6252');
    for (var i = 0; i < 6; i++) rc(c, X, yt + (i + 0.5) * len / 6, th * 0.6, len / 12, '#B5AB92', 1.2);
  });
  reg('mural', function (c, X, Y, s, o) {
    var w = 2.8 * s, h = 2.6 * s, cols = [GOLD, '#1B4965', '#C0392B', '#2E7D4F', CREAM, '#7A4F8C'], kv = o.k || 0;
    rc(c, X, Y - h / 2, w, h, '#2A2C31', 1.5);
    ell(c, X - w * 0.2, Y - h * 0.4, 0.5 * s, 0.5 * s, cols[kv % 6], 1.5);
    poly(c, [[X + w * 0.1, Y - h * 0.1], [X + w * 0.4, Y - h * 0.9], [X + w * 0.45, Y - h * 0.1]], cols[(kv + 2) % 6], 1.5);
    rc(c, X, Y - h * 0.75, w * 0.5, 0.2 * s, cols[(kv + 4) % 6], 1.2);
  });
  reg('cinar', function (c, X, Y, s) {
    var r = 1.5 * s;
    shadow(c, X, Y + 0.2 * s, r * 0.9, r * 0.45);
    rc(c, X, Y - 0.4 * s, 0.25 * s, 0.9 * s, '#7A6A58', 1.2);
    ell(c, X, Y - 1.4 * s, r, r * 0.8, '#3E7A4A', 1.8);
    ell(c, X - r * 0.3, Y - 1.5 * s, r * 0.4, r * 0.3, '#6BA36A', 0);
    ell(c, X + r * 0.35, Y - 1.2 * s, r * 0.3, r * 0.25, '#8C8A6A', 0);
  });
  reg('palm', function (c, X, Y, s) {
    var cx = X + 0.3 * s, cy = Y - 2.0 * s;
    shadow(c, X, Y, 0.8 * s, 0.4 * s);
    ln(c, X, Y, cx, cy, '#7A5C3A', 4);
    for (var i = 0; i < 7; i++) {
      var a = i * TAU / 7 + 0.3, tx = cx + Math.cos(a) * 1.1 * s, ty = cy + Math.sin(a) * 0.5 * s - 0.2 * s;
      poly(c, [[cx, cy], [tx - Math.sin(a) * 0.15 * s, ty + Math.cos(a) * 0.15 * s], [tx + Math.sin(a) * 0.15 * s, ty - Math.cos(a) * 0.15 * s]], '#2E7D4F', 1.2);
    }
  });
  reg('playground', function (c, X, Y, s) {
    shadow(c, X, Y, 1.4 * s, 0.9 * s);
    ell(c, X, Y, 1.2 * s, 0.8 * s, '#C9A66B', 2);
    rc(c, X + 0.7 * s, Y, 0.5 * s, 1.0 * s, '#E63946', 1.5);
    ln(c, X - 0.6 * s, Y - 0.6 * s, X - 0.6 * s, Y + 0.3 * s, '#1B4965', 3); ln(c, X - 0.2 * s, Y - 0.6 * s, X - 0.2 * s, Y + 0.3 * s, '#1B4965', 3);
    rc(c, X - 0.4 * s, Y - 0.1 * s, 0.5 * s, 0.1 * s, '#F2C14E', 1);
  });
  reg('pier', function (c, X, Y, s, o) {
    var len = (o.len || 6) * s, w = 1.4 * s;
    rc(c, X, Y, w, len, '#7A5C3A', 1.5);
    for (var i = 1; i < 6; i++) ln(c, X - w / 2, Y - len / 2 + i * len / 6, X + w / 2, Y - len / 2 + i * len / 6, '#4A3722', 1);
  });
  reg('tower', function (c, X, Y, s) {
    var r = 1.6 * s, hh = 5.5 * s;
    shadow(c, X, Y, r * 1.2, r * 0.6);
    c.fillStyle = '#8E8470'; c.fillRect(X - r, Y - hh, 2 * r, hh); c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(X - r, Y - hh, 2 * r, hh);
    ell(c, X, Y, r, r * 0.5, '#6E6252', 1.5);
    ell(c, X, Y - hh, r, r * 0.5, '#A39878', 1.5);
    for (var i = 0; i < 5; i++) rc(c, X - r * 0.7 + i * r * 0.35, Y - hh - 0.12 * s, r * 0.2, 0.25 * s, '#A39878', 1.2);
    for (var k = 0; k < 4; k++) rc(c, X, Y - hh * (0.25 + k * 0.2), r * 0.3, hh * 0.08, k % 2 ? '#2A2C31' : '#FFD166', 0);
  });
  reg('gateArch', function (c, X, Y, s, o) { REG_EXIT(c, X, Y, s, { style: o.style || 'gate', open: true, alpha: 0.6 }); });

  // ---- exit gates (across the corridor; style from the theme; open or closed) ----
  var GATE = { arch: ['#B7AF9F', '#7A7265'], gate: ['#8B5A2B', '#5C3A1C'], bridge: ['#8A8F98', '#4A4F57'],
    wall: ['#8E8470', '#6A6252'], station: ['#6B6F78', '#43464D'], home: ['#D8CBB6', '#8E8270'] };
  function REG_EXIT(c, X, Y, s, o) {
    var st = GATE[o.style] || GATE.arch, open = !!o.open, hw = 4.6 * s, hh = 2.2 * s, pw = 0.7 * s;
    c.globalAlpha = o.alpha || 1;
    if (open) glow(c, X, Y - hh * 0.4, 2.2 * s, 0.22);
    [-1, 1].forEach(function (sd) { box(c, X + sd * (hw - pw / 2), Y, pw, pw, hh, st[0], st[1]); });
    rc(c, X, Y - hh, hw * 2, 0.5 * s, st[0], 1.5);
    if (o.style === 'wall' || o.style === 'gate') for (var i = -4; i <= 4; i++) rc(c, X + i * hw / 4.5, Y - hh - 0.3 * s, 0.3 * s, 0.3 * s, st[0], 1.2);
    if (o.style === 'bridge') [-1, 1].forEach(function (sd) { glow(c, X + sd * (hw - pw / 2), Y - hh, 0.9 * s, 0.4); });
    if (!open) for (var j = -4; j <= 4; j++) ln(c, X + j * hw / 4.5, Y - hh + 0.25 * s, X + j * hw / 4.5, Y, '#3A3E45', 2);
    if (o.style === 'home') { rc(c, X, Y - hh * 0.55, 0.9 * s, 0.7 * s, '#FFD27A', 1.5); glow(c, X, Y - hh * 0.55, 1.8 * s, 0.35); }
    c.globalAlpha = 1;
  }
  reg('exitGate', function (c, X, Y, s, o) { REG_EXIT(c, X, Y, s, o); });

  // ---- overhead rigs (drawn after actors; semi-transparent so they never hide enemies) ----
  reg('laundry', function (c, X, Y, s, o) {
    var span = (o.span || 9.2) * s, h = 2.2 * s, cols = ['#C0392B', '#1B4965', GOLD, CREAM, '#2E7D4F', '#7A4F8C'], kv = o.k || 0;
    c.globalAlpha = 0.7;
    [-1, 1].forEach(function (sd) { ln(c, X + sd * span / 2, Y, X + sd * span / 2, Y - h, INK, 2.5); });
    c.strokeStyle = INK; c.lineWidth = 1.2; c.beginPath(); c.moveTo(X - span / 2, Y - h); c.quadraticCurveTo(X, Y - h + 0.5 * s, X + span / 2, Y - h); c.stroke();
    for (var i = 0; i < 6; i++) {
      var t = (i + 0.5) / 6, px = X - span / 2 + t * span, py = Y - h + 4 * t * (1 - t) * 0.5 * s;
      rc(c, px, py + 0.2 * s, 0.18 * s, 0.4 * s, cols[(i + kv) % 6], 1);
    }
    c.globalAlpha = 1;
  });
  reg('vault', function (c, X, Y, s, o) {
    var span = (o.span || 12) * s, h = 2.6 * s, t = performance.now() / 1000;
    c.globalAlpha = 0.45; c.strokeStyle = INK; c.lineWidth = 3;
    c.beginPath(); c.ellipse(X, Y, span / 2, h, 0, Math.PI, 0); c.stroke();
    for (var i = -2; i <= 2; i++) {
      var lx = X + i * span / 5, ly = Y - h * Math.sqrt(Math.max(0, 1 - Math.pow(i / 2.5, 2))) + 0.6 * s;
      ln(c, lx, ly - 0.6 * s, lx, ly, INK, 1.2);
      ell(c, lx, ly + 0.1 * s, 0.14 * s, 0.14 * s, '#FFE2A8', 1.5);
      glow(c, lx, ly + 0.1 * s, 1.2 * s, 0.4 + 0.1 * Math.sin(t * 3 + i));
    }
    c.globalAlpha = 1;
  });
  function stringRig(c, X, Y, s, o) {
    var span = 14.4 * s, t = performance.now() / 1000, col = o.col || '#FFE2A8', n = o.n || 16, Yl = Y - 1.5 * s;
    c.globalAlpha = 0.8; c.strokeStyle = INK; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(X - span / 2, Yl); c.quadraticCurveTo(X, Yl + 0.9 * s, X + span / 2, Yl); c.stroke();
    c.globalAlpha = 1; c.save(); c.globalCompositeOperation = 'lighter';
    for (var i = 0; i <= n; i++) {
      var q = i / n, bx = X - span / 2 + span * q, by = Yl + 2 * q * (1 - q) * 0.9 * s, tw = 0.75 + 0.25 * Math.sin(t * 3 + i * 1.7 + Y);
      glow(c, bx, by, 0.5 * s, 0.5 * tw);
      c.fillStyle = col; c.globalAlpha = tw; c.beginPath(); c.arc(bx, by + 2, 2.4, 0, TAU); c.fill(); c.globalAlpha = 1;
    }
    c.restore();
  }
  reg('strings', stringRig);
  reg('lanterns', function (c, X, Y, s, o) { stringRig(c, X, Y, s, { n: o.n, col: '#E63946' }); });

  // ---- residential and animals ----
  reg('cat', function (c, X, Y, s, o) { catBody(c, X, Y, s, o, false); });
  reg('catbox', function (c, X, Y, s, o) { catBody(c, X, Y, s, o, true); });
  reg('dog', function (c, X, Y, s, o) {
    var col = ['#B5651D', '#8B5A2B', '#D9A441'][(o.k || 0) % 3];
    shadow(c, X, Y, 0.5 * s, 0.2 * s);
    ln(c, X - 0.45 * s, Y - 0.05 * s, X - 0.62 * s, Y - 0.14 * s, INK, 4);
    ell(c, X, Y - 0.05 * s, 0.45 * s, 0.2 * s, col, 1.5);
    ell(c, X + 0.42 * s, Y - 0.08 * s, 0.18 * s, 0.15 * s, col, 1.5);
    rc(c, X + 0.42 * s, Y - 0.26 * s, 0.09 * s, 0.07 * s, '#E9C46A', 1);
  });
  // One ambient pigeon (fauna role), top-down 3/4, head up the screen, tail down. Plain blue-grey: no gold dot and no dark tip bar,
  // because those marks are the marti thief's (config-fauna birdLook) and must not read as an enemy on the pavement. o: { fly (s
  // since take-off, 0 on the ground), z (m, height in flight), k (variant) }. The footprint shadow stays on the ground.
  // Pigeon in side profile. Baked once per size, facing and peck phase on a 2x canvas, so each bird is one drawImage
  // per frame (the path version cost about 48 canvas calls per bird). The footprint shadow is drawn live on the ground.
  var BIRD_SS = 2, birdCache = {}, birdCount = 0;
  function birdPaint(c, s, peck) {
    poly(c, [[-0.1 * s, -0.035 * s], [-0.1 * s, 0.035 * s], [-0.165 * s, 0.065 * s], [-0.165 * s, -0.065 * s]], '#5E6676', 1);   // tail fan
    ell(c, 0, 0, 0.12 * s, 0.065 * s, '#A9B1BF', 1.3);                                                                 // body, side profile
    poly(c, [[-0.1 * s, -0.05 * s], [0.05 * s, -0.05 * s], [0.07 * s, 0.01 * s], [-0.12 * s, 0.03 * s]], '#7E8798', 1.1);   // folded wing
    c.strokeStyle = '#3F4656'; c.lineWidth = 1; c.beginPath(); c.moveTo(-0.06 * s, -0.035 * s); c.lineTo(-0.01 * s, 0.035 * s); c.stroke();   // wing mark (dark, not white)
    ell(c, 0.11 * s, -0.03 * s + peck, 0.05 * s, 0.05 * s, '#A9B1BF', 1.1);                                              // head, pecks down
    poly(c, [[0.15 * s, -0.04 * s + peck], [0.2 * s, -0.025 * s + peck], [0.15 * s, -0.01 * s + peck]], '#2E2A28', 0.8);   // beak
    ell(c, 0.125 * s, -0.04 * s + peck, 0.012 * s, 0.012 * s, '#7A3B1E', 0);                                              // eye
    ell(c, -0.02 * s, 0.05 * s, 0.035 * s, 0.012 * s, 'rgba(94,143,134,0.5)', 0);                                       // neck sheen
  }
  function birdSprite(s, face, peckOn) {
    var key = Math.round(s * 4) + '|' + face + '|' + peckOn, cv = birdCache[key];
    if (cv) return cv;
    var W = Math.ceil(0.5 * s) + 6, H = Math.ceil(0.3 * s) + 6;
    cv = document.createElement('canvas'); cv.width = W * BIRD_SS; cv.height = H * BIRD_SS;
    var c2 = cv.getContext('2d');
    c2.setTransform(BIRD_SS, 0, 0, BIRD_SS, 0, 0); c2.clearRect(0, 0, W, H);
    c2.translate(W / 2, H / 2); c2.scale(face, 1);
    birdPaint(c2, s, peckOn ? 0.03 * s : 0);
    if (birdCount > 240) { birdCache = {}; birdCount = 0; }
    birdCache[key] = cv; birdCount++;
    return cv;
  }
  function bird(c, X, Y, s0, o) {
    var s = s0 * 1.15, fly = o.fly || 0, z = o.z || 0, k = o.k || 0, t = performance.now() / 1000;
    var peckOn = fly <= 0 && !(P.Settings && P.Settings.reduceMotion) && Math.sin(t * 2.6 + k) > 0.5;
    c.fillStyle = 'rgba(0,0,0,' + Math.max(0.1, 0.26 - 0.06 * z).toFixed(3) + ')';
    c.beginPath(); c.ellipse(X, Y, 0.09 * s, 0.045 * s, 0, 0, TAU); c.fill();
    var cv = birdSprite(s, k % 2 ? -1 : 1, peckOn);
    c.drawImage(cv, X - cv.width / BIRD_SS / 2, Y - z * s - cv.height / BIRD_SS / 2, cv.width / BIRD_SS, cv.height / BIRD_SS);
  }
  P.Props.bird = bird;
  reg('pigeon', function (c, X, Y, s, o) {
    var fly = o.fly || 0;
    for (var i = 0; i < 4; i++) {
      var dir = i * 2.4 + (o.k || 0), px = X + Math.sin(i * 2.1) * 0.5 * s, py = Y + Math.cos(i * 1.3) * 0.4 * s, z = 0;
      if (fly > 0) {
        if (fly > 2.5) continue;
        px += Math.cos(dir) * fly * 1.6 * s; py += Math.sin(dir) * fly * 1.6 * s + fly * 0.8 * s; z = fly * 1.2;
      }
      bird(c, px, py, s, { fly: fly, z: z, k: i + (o.k || 0) });
    }
  });
  reg('gull', function (c, X, Y, s) {
    shadow(c, X, Y, 0.2 * s, 0.08 * s);
    ell(c, X, Y - 0.12 * s, 0.14 * s, 0.1 * s, '#F4F6F8', 1.5);
    ell(c, X + 0.12 * s, Y - 0.2 * s, 0.08 * s, 0.08 * s, '#F4F6F8', 1.5);
    poly(c, [[X + 0.18 * s, Y - 0.2 * s], [X + 0.28 * s, Y - 0.18 * s], [X + 0.18 * s, Y - 0.16 * s]], '#F2C14E', 1);
  });

  // ---- water craft (drawn on the water side) ----
  reg('ferry', function (c, X, Y, s, o) {
    var L = 10 * s, W = 3.2 * s, t = performance.now() / 1000;
    shadow(c, X, Y, W * 0.6, L * 0.3);
    poly(c, [[X, Y - L / 2], [X + W / 2, Y - L / 2 + 1.4 * s], [X + W / 2, Y + L / 2], [X - W / 2, Y + L / 2], [X - W / 2, Y - L / 2 + 1.4 * s]], CREAM, 2);
    c.fillStyle = '#C0392B'; c.fillRect(X - W / 2, Y + L * 0.1, W, 0.25 * s);
    rc(c, X, Y + 0.4 * s, W * 0.7, L * 0.35, '#E9DCC4', 1);
    rc(c, X, Y + 0.4 * s, 0.5 * s, 0.9 * s, '#1B4965', 1.5);
    if (o.horn) smoke(c, X, Y - 0.2 * s, s, 4, t, 0.5);
  });
  reg('rowboat', function (c, X, Y, s) {
    shadow(c, X, Y, 0.9 * s, 0.4 * s);
    ell(c, X, Y, 0.6 * s, 1.2 * s, '#8B5A2B', 2);
    ell(c, X, Y, 0.45 * s, 1.0 * s, '#A0683A', 0);
    ln(c, X - 0.5 * s, Y, X + 0.5 * s, Y, '#5C3A1C', 2);
  });
  reg('yacht', function (c, X, Y, s) {
    var L = 4.5 * s, W = 1.6 * s;
    shadow(c, X, Y, W * 0.7, L * 0.3);
    poly(c, [[X, Y - L / 2], [X + W / 2, Y - L / 4], [X + W / 2, Y + L / 2], [X - W / 2, Y + L / 2], [X - W / 2, Y - L / 4]], CREAM, 2);
    rc(c, X, Y + 0.3 * s, W * 0.6, L * 0.3, '#1B4965', 1);
    ell(c, X, Y - 0.2 * s, 0.1 * s, 0.1 * s, INK, 0);
  });
  reg('buoy', function (c, X, Y, s) {
    shadow(c, X, Y, 0.25 * s, 0.12 * s);
    ell(c, X, Y, 0.22 * s, 0.22 * s, '#C0392B', 1.5);
    ell(c, X, Y, 0.1 * s, 0.1 * s, CREAM, 1);
  });
  reg('lifering', function (c, X, Y, s) {
    ell(c, X, Y, 0.3 * s, 0.3 * s, '#E63946', 1.8);
    ell(c, X, Y, 0.15 * s, 0.15 * s, '#2C4658', 1.2);
  });

  // ---- apocalypse dressing (sparse; never on the playable line) ----
  reg('bags', function (c, X, Y, s, o) {
    var cols = [CREAM, '#C0392B', '#1B4965'], kv = o.k || 0;
    for (var i = 0; i < 3; i++) {
      var bx = X + (i - 1) * 0.4 * s + Math.sin(i + kv) * 0.1 * s, by = Y + Math.cos(i * 2 + kv) * 0.2 * s;
      shadow(c, bx, by, 0.22 * s, 0.12 * s);
      rc(c, bx, by - 0.12 * s, 0.36 * s, 0.4 * s, cols[(i + kv) % 3], 1.5);
      c.strokeStyle = INK; c.lineWidth = 1.2; c.beginPath(); c.arc(bx, by - 0.4 * s, 0.14 * s, Math.PI * 0.1, Math.PI * 0.9); c.stroke();
    }
  });
  reg('spill', function (c, X, Y, s, o) {
    var kv = o.k || 0;
    for (var i = 0; i < 6; i++) {
      var px = X + Math.sin(i * 2.3 + kv) * 0.7 * s, py = Y + Math.cos(i * 1.7 + kv) * 0.5 * s;
      ell(c, px, py, 0.16 * s, 0.1 * s, '#5B4632', 0);     // a dark wet patch (it was gold dots, which read as coins)
    }
  });
  reg('barrel', function (c, X, Y, s, o) {
    var t = performance.now() / 1000, kv = o.k || 0;
    shadow(c, X, Y, 0.35 * s, 0.18 * s);
    rc(c, X, Y - 0.4 * s, 0.7 * s, 0.8 * s, '#5A3E2A', 2);
    ell(c, X, Y - 0.8 * s, 0.35 * s, 0.16 * s, '#2A1E16', 1.5);
    glow(c, X, Y - 1.1 * s, 1.6 * s, 0.45 + 0.1 * Math.sin(t * 9 + kv));
    for (var i = 0; i < 4; i++) {
      var fx = X + Math.sin(t * 6 + i * 1.9) * 0.12 * s, fh = (0.35 + 0.15 * Math.sin(t * 11 + i)) * s;
      poly(c, [[fx - 0.1 * s, Y - 0.8 * s], [fx, Y - 0.8 * s - fh], [fx + 0.1 * s, Y - 0.8 * s]], i % 2 ? '#FF9A2A' : '#FFD166', 0);
    }
    smoke(c, X, Y - 0.9 * s, s, 4, t, 0.3);
  });
  reg('devrik', function (c, X, Y, s, o) {
    c.save(); c.translate(X, Y); c.rotate(0.9 + (o.k || 0) * 0.4);
    rc(c, 0, 0, 0.42 * s, 0.42 * s, '#8B5A2B', 1.5);
    rc(c, 0, -0.24 * s, 0.42 * s, 0.08 * s, '#5C3A1C', 1.2);
    c.restore();
  });
  reg('blood', function (c, X, Y, s, o) {
    var n = o.n || 7, kv = o.k || 0, dy = o.dir || 1;
    for (var i = 0; i < n; i++) {
      var px = X + Math.sin(i * 1.9 + kv) * 0.25 * s, py = Y + i * 0.45 * s * dy;
      ell(c, px, py, (0.18 + (i % 3) * 0.06) * s, (0.12 + (i % 2) * 0.05) * s, 'rgba(' + P.goreRGB(i % 3) + ',0.7)', 0);
    }
  });
  reg('hazard', function (c, X, Y, s, o) {
    var len = (o.len || 2.2) * s, w = 0.35 * s;
    shadow(c, X, Y, w * 0.8, len * 0.1);
    c.save(); c.beginPath(); c.rect(X - w / 2, Y - len / 2, w, len); c.clip();
    rc(c, X, Y, w, len, GOLD, 1.2);
    for (var y = Y - len / 2 - w; y < Y + len / 2; y += w) ln(c, X - w / 2, y + w, X + w / 2, y, INK, w * 0.35);
    c.restore();
  });
  reg('smoke', function (c, X, Y, s, o) { smoke(c, X, Y, s, o.n || 6, performance.now() / 1000, o.a || 0.3); });

  reg('fountain', function (c, X, Y, s, o) {
    var r = (o.w || 2.4) * s * 0.5, ry = r * 0.55, t = performance.now() / 1000, i, a;
    shadow(c, X, Y, r * 1.05, ry * 1.05);
    ell(c, X, Y, r, ry, '#5E7F8A', 0);
    ell(c, X, Y, r * 0.78, ry * 0.78, '#9BC1C6', 0);
    ln(c, X, Y, X, Y - 0.9 * s, '#D8E8EA', 0.12 * s);
    for (i = 0; i < 4; i++) {
      a = t * 2.4 + i * TAU / 4;
      ell(c, X + Math.cos(a) * 0.35 * s, Y - 0.9 * s + Math.sin(a) * 0.07 * s, 0.07 * s, 0.07 * s, '#D8E8EA', 0);
    }
  });
  reg('lamp_row', function (c, X, Y, s, o) {
    var span = o.span || 9, n = Math.max(2, Math.round(span / 2.5)), i;
    var R = { ctx: c, X: function (x) { return X + x * s; }, Y: function (y) { return Y - y * s; }, ppm: s };
    for (i = 0; i < n; i++) P.Props.draw('lamp', R, 0, -span / 2 + (i + 0.5) * span / n, o);
  });

  // ---- eczane (pharmacy), T4 part 10: the heal-station look. A cream booth under a green cross sign. o.state: 'usable' (the sign
  // glows, pulsing unless Reduce motion), 'empty' (grey cross and an EMPTY label) or 'idle'. The state is read from the sim by
  // render-world.js (P.Consumables.stationState, from P.Eczane.state); the heal itself is sim/eczane.js (R1-T4 part 14).
  reg('eczane', function (c, X, Y, s, o) {
    var w = ((o && o.w) || 1.4) * s, d = ((o && o.h) || 1.0) * s, hg = 0.9 * s, top = Y - hg;
    shadow(c, X, Y, w * 0.6, d * 0.5);
    box(c, X, Y, w, d, hg, '#F4F1E8', '#B9B4A6');
    rc(c, X, Y + d / 2 - hg * 0.5, w * 0.5, hg * 0.4, '#2E5A4B', 1);
    P.Consumables.stationSign(c, X, top - 0.32 * s, s, (o && o.state) || 'idle', performance.now() / 1000, !(P.Settings && P.Settings.reduceMotion));
  });

  // ---- L1 sidewalk vendors (T4 part 11: moved here from istanbul.js so they share the role grammar; dressing role) ----
  // Top-down and flat. The nazar beads have no pupils (they read as eyes), the shoe-shine stand shows its footrests and brush,
  // and the flower pots are pots with leaves and one bloom each (the old rows of dots read as pickups).
  reg('shoeshine', function (c, X, Y, s) {
    shadow(c, X, Y, 0.42 * s, 0.26 * s);
    rc(c, X, Y, 0.6 * s, 0.4 * s, '#8A5A2B', 1.5);                                   // box
    rc(c, X, Y - 0.02 * s, 0.46 * s, 0.26 * s, '#A8743F', 0);                        // lid
    ell(c, X - 0.2 * s, Y - 0.26 * s, 0.17 * s, 0.12 * s, '#3A2A1E', 1.4);           // footrests
    ell(c, X + 0.2 * s, Y - 0.26 * s, 0.17 * s, 0.12 * s, '#3A2A1E', 1.4);
    ell(c, X + 0.2 * s, Y + 0.26 * s, 0.11 * s, 0.09 * s, '#1E1F25', 1.2);           // brush
    ell(c, X - 0.22 * s, Y + 0.26 * s, 0.06 * s, 0.06 * s, '#C0392B', 1);            // tin of polish
  });
  reg('flowers', function (c, X, Y, s, o) {
    var cols = ['#E63946', '#FFD166', '#F4A3C0', '#F4EBDD', '#9B5DE5'], kv = o.k || 0, i, bx, by;
    shadow(c, X, Y, 0.8 * s, 0.3 * s);
    for (i = 0; i < 4; i++) {
      bx = X + (i - 1.5) * 0.3 * s; by = Y + (i % 2 ? 0.1 : -0.08) * s;
      ell(c, bx, by + 0.02 * s, 0.13 * s, 0.1 * s, '#B5651D', 1.4);                  // terracotta rim
      ell(c, bx, by + 0.02 * s, 0.1 * s, 0.075 * s, '#4A3322', 0);                    // soil
      ell(c, bx - 0.05 * s, by - 0.07 * s, 0.07 * s, 0.045 * s, '#2E7D4F', 1);       // leaves
      ell(c, bx + 0.05 * s, by - 0.08 * s, 0.07 * s, 0.045 * s, '#3E9A5E', 1);
      ell(c, bx, by - 0.12 * s, 0.05 * s, 0.05 * s, cols[(i + kv) % 5], 1);          // bloom
    }
  });
  reg('nazar', function (c, X, Y, s) {
    rc(c, X, Y, 1.0 * s, 0.46 * s, '#6B3E26', 1.5);                                  // tray
    for (var j = 0; j < 2; j++) for (var i = 0; i < 4; i++) {
      var bx = X - 0.36 * s + i * 0.24 * s, by = Y - 0.1 * s + j * 0.2 * s;
      ell(c, bx, by, 0.085 * s, 0.085 * s, '#1F4FB4', 1);
      ell(c, bx - 0.025 * s, by - 0.025 * s, 0.025 * s, 0.02 * s, '#BFE3FF', 0);     // glint
    }
  });
  reg('carpet', function (c, X, Y, s, o) {
    var w = 1.3 * s, hh = 0.8 * s, h = o.h || 0, i, dx;
    shadow(c, X, Y, w * 0.5, hh * 0.45);
    rc(c, X, Y, w, hh, h > 0.5 ? '#9E2B25' : '#1B4965', 2);
    rc(c, X, Y, w * 0.82, hh * 0.72, '#F4EBDD', 0);
    rc(c, X, Y, w * 0.72, hh * 0.58, h > 0.5 ? '#1B4965' : '#9E2B25', 0);
    for (i = -1; i <= 1; i++) { dx = X + i * 0.28 * s; poly(c, [[dx, Y - 0.16 * s], [dx + 0.1 * s, Y], [dx, Y + 0.16 * s], [dx - 0.1 * s, Y]], '#E9A23B', 0); }
    ell(c, X + 0.85 * s, Y, 0.16 * s, 0.4 * s, '#7A3E1C', 1.4);                     // rolled end
  });
  reg('corn', function (c, X, Y, s) {
    var i, k;
    rc(c, X, Y, 0.9 * s, 0.55 * s, '#C0392B', 1.5);                                  // cart
    for (i = 0; i < 4; i++) ell(c, X - 0.27 * s + i * 0.18 * s, Y - 0.05 * s, 0.06 * s, 0.15 * s, '#F2C14E', 1);   // cobs
    ln(c, X + 0.3 * s, Y, X + 0.3 * s, Y - 0.9 * s, '#B8B8B8', 2);                   // pole
    for (k = 0; k < 8; k++) {                                                        // striped umbrella from above
      c.beginPath(); c.moveTo(X + 0.3 * s, Y - 0.95 * s); c.arc(X + 0.3 * s, Y - 0.95 * s, 0.6 * s, k / 8 * TAU, (k + 1) / 8 * TAU); c.closePath();
      c.fillStyle = P.Props.dressFill(k % 2 ? '#F4EBDD' : '#D7263D'); c.fill();
    }
    c.strokeStyle = P.Props.ink(); c.lineWidth = 1.6; c.beginPath(); c.arc(X + 0.3 * s, Y - 0.95 * s, 0.6 * s, 0, TAU); c.stroke();
  });
  reg('pomegranate', function (c, X, Y, s) {
    var i;
    rc(c, X, Y, 1.0 * s, 0.5 * s, '#F4EBDD', 1.5);                                   // counter
    for (i = 0; i < 9; i++) ell(c, X - 0.38 * s + (i % 5) * 0.19 * s, Y - 0.1 * s + Math.floor(i / 5) * 0.2 * s, 0.08 * s, 0.08 * s, '#B5162B', 1);
    rc(c, X + 0.6 * s, Y - 0.1 * s, 0.2 * s, 0.36 * s, '#B8C0CA', 1.2);
    teaGlass(c, X + 0.6 * s, Y + 0.28 * s, s);
  });
  reg('tea', function (c, X, Y, s) {
    var tt = performance.now() / 600;
    rc(c, X, Y, 0.8 * s, 0.5 * s, '#6B3E26', 1.5);                                   // tray
    ell(c, X - 0.15 * s, Y - 0.05 * s, 0.2 * s, 0.15 * s, '#C87533', 1.2);           // kettle
    ell(c, X - 0.15 * s, Y - 0.22 * s, 0.12 * s, 0.09 * s, '#D98A4A', 1.2);
    teaGlass(c, X + 0.22 * s, Y, s); teaGlass(c, X + 0.22 * s, Y + 0.2 * s, s);
    c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 2;                        // steam
    c.beginPath(); c.moveTo(X - 0.15 * s, Y - 0.32 * s); c.quadraticCurveTo(X - 0.05 * s + Math.sin(tt) * 4, Y - 0.5 * s, X - 0.15 * s, Y - 0.7 * s); c.stroke();
  });

  // ---- aliases so generated levels can use the landmark vocabulary from E2 / sim ----
  P.Props.alias('clock', 'saat');
  P.Props.alias('crane', 'vinc');
  P.Props.alias('wallSection', 'wall');
  P.Props.alias('gazete', 'kiosk');
  // E2 landmark kinds (P.CFG.levels.landmarks) mapped onto existing props.
  P.Props.alias('shopfront', 'cafe');
  P.Props.alias('tea_garden', 'chairs');
  P.Props.alias('kebab', 'mangal');
  P.Props.alias('flower_stand', 'cicek');
  P.Props.alias('billboard', 'mural');
  P.Props.alias('bus_stop', 'shelter');
  P.Props.alias('tram_stop', 'shelter');
})();
