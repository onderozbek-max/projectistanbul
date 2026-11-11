// Local Istanbul prop library, part 1 (workstream F): registry, comic-ink helpers, vehicles, street blocks,
// food and tea vendors. Part 2 lives in istanbul-props2.js and registers into the same P.Props.
// Contract: P.Props.draw(kind, R, x, y, o) takes world metres. Each fn is fn(c, X, Y, s, o): X,Y = screen px of
// the footprint centre, s = px per metre, o = { w, h (metres, blocks), k (variant 0..3), alert, fly, open, ... }.
// Style: #14151F ink outlines, flat fills, soft ground shadow, 3/4 top-down. Blocks stay under hero height.
// Generic only: no brands, religious objects, flags, police or military. Sign words live in istanbul-themes.js.
P.Props = (function () {
  var REG = {}, M = {}, INK = '#14151F', TAU = Math.PI * 2, glowCv = null;
  function ell(c, X, Y, rx, ry, f, lw) {
    c.beginPath(); c.ellipse(X, Y, Math.max(0.3, rx), Math.max(0.3, ry), 0, 0, TAU);
    if (f) { c.fillStyle = f; c.fill(); }
    if (lw !== 0) { c.strokeStyle = INK; c.lineWidth = lw || 1.5; c.stroke(); }
  }
  function rc(c, X, Y, w, h, f, lw) {
    c.fillStyle = f; c.fillRect(X - w / 2, Y - h / 2, w, h);
    if (lw !== 0) { c.strokeStyle = INK; c.lineWidth = lw || 1.5; c.strokeRect(X - w / 2, Y - h / 2, w, h); }
  }
  function poly(c, p, f, lw) {
    c.beginPath(); c.moveTo(p[0][0], p[0][1]);
    for (var i = 1; i < p.length; i++) c.lineTo(p[i][0], p[i][1]);
    c.closePath();
    if (f) { c.fillStyle = f; c.fill(); }
    if (lw !== 0) { c.strokeStyle = INK; c.lineWidth = lw || 1.5; c.stroke(); }
  }
  function ln(c, x0, y0, x1, y1, col, w) {
    c.strokeStyle = col || INK; c.lineWidth = w || 1.5; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  }
  function shadow(c, X, Y, rx, ry) {
    c.fillStyle = 'rgba(0,0,0,0.26)'; c.beginPath(); c.ellipse(X, Y, rx, ry || rx * 0.45, 0, 0, TAU); c.fill();
  }
  // 3/4 block: footprint centred on (X,Y), w x d px, hgt px rising up the screen (top face + front face).
  function box(c, X, Y, w, d, hgt, top, side) {
    var x0 = X - w / 2, yb = Y + d / 2, yt = yb - d - hgt;
    c.fillStyle = side; c.fillRect(x0, yb - hgt, w, hgt);
    c.fillStyle = top; c.fillRect(x0, yt, w, d);
    c.strokeStyle = INK; c.lineWidth = 1.5; c.strokeRect(x0, yt, w, d + hgt);
    ln(c, x0, yb - hgt, x0 + w, yb - hgt, INK, 1.2);
  }
  // Warm additive-friendly glow from one cached sprite (same pattern as istanbul.js lamps).
  function glow(c, X, Y, r, a) {
    if (!glowCv) {
      glowCv = document.createElement('canvas'); glowCv.width = glowCv.height = 64;
      var g = glowCv.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,214,140,1)'); gr.addColorStop(1, 'rgba(255,190,100,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    }
    c.globalAlpha = a; c.drawImage(glowCv, X - r, Y - r, 2 * r, 2 * r); c.globalAlpha = 1;
  }
  function teaGlass(c, X, Y, s) {
    ell(c, X, Y + 0.02 * s, 0.09 * s, 0.04 * s, '#C0392B', 1);
    c.beginPath(); c.moveTo(X - 0.04 * s, Y); c.quadraticCurveTo(X - 0.015 * s, Y - 0.06 * s, X - 0.035 * s, Y - 0.13 * s);
    c.lineTo(X + 0.035 * s, Y - 0.13 * s); c.quadraticCurveTo(X + 0.015 * s, Y - 0.06 * s, X + 0.04 * s, Y); c.closePath();
    c.fillStyle = '#B5401D'; c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
  }

  // Generic vehicle. v: { w, len, hgt, top, side, glass, stripe, cracks, hazard } in metres. o.alarm blinks at 2.5 Hz.
  function vehicle(c, X, Y, s, o, v) {
    var w = (o.w || v.w) * s, d = (o.h || v.len) * s, hg = v.hgt * s, blink = Math.floor(performance.now() / 200) % 2;
    shadow(c, X, Y, w * 0.62, d * 0.5);
    [-1, 1].forEach(function (sx) { [-0.3, 0.3].forEach(function (sy) { ell(c, X + sx * w * 0.44, Y + sy * d, 0.07 * s, 0.14 * s, '#1E1F25', 1.2); }); });
    box(c, X, Y, w, d, hg, v.top, v.side);
    if (v.stripe) { c.fillStyle = v.stripe; c.fillRect(X - w / 2, Y + d / 2 - hg * 0.55, w, hg * 0.16); }
    var gy = Y - hg - d * 0.05, gh = d * 0.46;
    rc(c, X, gy, w * 0.76, gh, v.glass, 1.2);
    if (v.cracks) {
      ln(c, X - w * 0.2, gy - gh * 0.3, X + w * 0.1, gy + gh * 0.1, '#E8F0F8', 0.9);
      ln(c, X + w * 0.1, gy + gh * 0.1, X + w * 0.25, gy + gh * 0.4, '#E8F0F8', 0.9);
      ln(c, X + w * 0.1, gy + gh * 0.1, X - w * 0.15, gy + gh * 0.35, '#E8F0F8', 0.9);
    }
    if (o.alarm || v.hazard) {
      c.fillStyle = o.alarm && blink ? '#FFB020' : '#7A4A10';
      [-1, 1].forEach(function (sx) { c.beginPath(); c.arc(X + sx * w * 0.36, Y - d / 2 - hg + 0.06 * s, 0.07 * s, 0, TAU); c.fill(); });
    }
  }
  var CARS = {
    car: { w: 1.8, len: 4.2, hgt: 0.42, top: '#7D8B98', side: '#4A525C', glass: '#2A323C', cracks: true },
    taxi: { w: 1.8, len: 4.3, hgt: 0.42, top: '#E9B73B', side: '#B98B1E', glass: '#2A323C', cracks: true },
    dolmus: { w: 1.9, len: 4.6, hgt: 0.6, top: '#F4EBDD', side: '#C9C2B0', glass: '#2F3A46', stripe: '#1B4965', cracks: true },
    bus: { w: 2.5, len: 9, hgt: 0.7, top: '#F4EBDD', side: '#C0392B', glass: '#2A323C', stripe: '#F4EBDD', hazard: true }
  };
  Object.keys(CARS).forEach(function (k) { REG[k] = function (c, X, Y, s, o) { vehicle(c, X, Y, s, o, CARS[k]); }; });

  REG.barrier = function (c, X, Y, s, o) {
    var w = (o.w || 2) * s, d = (o.h || 0.6) * s, hg = 0.7 * s, yb = Y + d / 2;
    shadow(c, X, Y, w * 0.55, d * 0.6);
    box(c, X, Y, w, d, hg, '#D9D4C7', '#9D9A90');
    c.save(); c.beginPath(); c.rect(X - w / 2, yb - hg, w, hg); c.clip();
    for (var x = X - w / 2 - hg; x < X + w / 2; x += 0.45 * s) ln(c, x, yb, x + hg, yb - hg, '#E9A23B', 0.2 * s);
    c.restore();
  };
  REG.kiosk = function (c, X, Y, s, o) {
    var w = (o.w || 1.4) * s, d = (o.h || 1.1) * s, hg = 0.9 * s, top = Y - d / 2 - hg + d / 2;
    shadow(c, X, Y, w * 0.6, d * 0.5);
    box(c, X, Y, w, d, hg, '#2E5A4B', '#1F3D33');
    rc(c, X, Y + d / 2 - hg * 0.5, w * 0.6, hg * 0.4, '#FFE2A8', 1);
    for (var i = 0; i < 4; i++) rc(c, X, top - d * 0.3 + i * d * 0.2, w * 0.7, 0.05 * s, '#D9D4C7', 0);
  };
  REG.bench = function (c, X, Y, s, o) {
    var w = (o.w || 1.6) * s, d = (o.h || 0.5) * s, hg = 0.3 * s, top = Y - hg;
    shadow(c, X, Y, w * 0.55, d * 0.6);
    box(c, X, Y, w, d, hg, '#8B5A2B', '#5C3A1C');
    for (var i = 1; i < 4; i++) ln(c, X - w / 2 + i * w / 4, top - d / 2, X - w / 2 + i * w / 4, top + d / 2, '#5C3A1C', 1);
  };
  REG.bin = function (c, X, Y, s, o) {
    var r = (o.w || 0.5) * s * 0.5, hg = 0.8 * s;
    shadow(c, X, Y, r * 1.4, r * 0.8);
    rc(c, X, Y - hg / 2, r * 2, hg, '#3E5B4A', 1.5);
    ell(c, X, Y - hg, r, r * 0.5, '#2E4A3B', 1.5);
  };
  REG.planter = function (c, X, Y, s, o) {
    var w = (o.w || 1.2) * s, d = (o.h || 1.2) * s, hg = 0.45 * s, top = Y - hg;
    shadow(c, X, Y, w * 0.6, d * 0.5);
    box(c, X, Y, w, d, hg, '#5E4A3A', '#3D2F24');
    for (var i = 0; i < 5; i++) ell(c, X - w * 0.36 + i * w * 0.18, top + ((i % 2) - 0.5) * d * 0.3, 0.14 * s, 0.12 * s, i % 2 ? '#2E7D4F' : '#3E9A5E', 1.2);
  };
  REG.tree = function (c, X, Y, s, o) {
    var r = (o.w || 1) * s * 0.5;
    shadow(c, X, Y, r * 1.1, r * 0.55);
    rc(c, X, Y - 0.2 * s, 0.18 * s, 0.4 * s, '#5C3A1C', 1.2);
    ell(c, X, Y - 0.6 * s, r, r * 0.85, '#2E6B3E', 1.8);
    ell(c, X - r * 0.3, Y - 0.7 * s, r * 0.35, r * 0.3, '#4E9A5A', 0);
  };
  REG.crates = function (c, X, Y, s, o) {
    var w = (o.w || 1.2) * s, d = (o.h || 1.0) * s;
    shadow(c, X, Y, w * 0.6, d * 0.5);
    box(c, X - w * 0.15, Y + d * 0.1, w * 0.7, d * 0.5, 0.35 * s, '#B8864B', '#7A5530');
    box(c, X + w * 0.18, Y - d * 0.2, w * 0.6, d * 0.5, 0.35 * s, '#C9965A', '#8A5F34');
  };
  REG.tables = function (c, X, Y, s, o) {
    var w = (o.w || 1.6) * s, d = (o.h || 1.2) * s;
    shadow(c, X, Y, w * 0.6, d * 0.5);
    for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) {
      var tx = X + (i - 0.5) * w * 0.9, ty = Y + (j - 0.5) * d * 0.9;
      ell(c, tx + 0.22 * s, ty, 0.1 * s, 0.1 * s, '#6B3E26', 1.2);
      ell(c, tx, ty, 0.24 * s, 0.17 * s, '#E8E1D2', 1.5);
    }
  };
  REG.cart = function (c, X, Y, s, o) {
    var w = (o.w || 1.2) * s, d = (o.h || 0.8) * s, hg = 0.5 * s;
    shadow(c, X, Y, w * 0.6, d * 0.5);
    ln(c, X, Y + d / 2, X, Y + d / 2 + 0.6 * s, INK, 4);
    box(c, X, Y, w, d, hg, '#8A8F98', '#5A5F68');
    ell(c, X - w * 0.42, Y + d * 0.5, 0.12 * s, 0.12 * s, '#1E1F25', 1.2);
    ell(c, X + w * 0.42, Y + d * 0.5, 0.12 * s, 0.12 * s, '#1E1F25', 1.2);
  };
  REG.bollard = function (c, X, Y, s, o) {
    var r = (o.w || 0.4) * s * 0.5, hg = 0.7 * s;
    shadow(c, X, Y, r * 1.6, r * 0.8);
    rc(c, X, Y - hg / 2, r * 2, hg, '#D9D4C7', 1.5);
    ell(c, X, Y - hg, r, r * 0.6, '#E9A23B', 1.5);
  };
  REG.crate = function (c, X, Y, s, o) {
    var w = (o.w || 1) * s, d = (o.h || 1) * s;
    shadow(c, X, Y, w * 0.6, d * 0.5);
    box(c, X, Y, w, d, 0.6 * s, '#B8864B', '#7A5530');
  };

  // ---- food and tea vendors (sidewalk scale) ----
  REG.simit = function (c, X, Y, s) {
    var w = 1.3 * s, d = 0.9 * s, hg = 0.5 * s, top = Y - hg;
    shadow(c, X, Y + d * 0.25, w * 0.62, d * 0.5);
    box(c, X, Y, w, d, hg, '#C0392B', '#8E2A22');
    rc(c, X - w * 0.08, top, w * 0.8, d * 0.6, '#E9DCC4', 1.2);
    var px = X + w * 0.22, py = top + d * 0.2;
    ln(c, px, py, px, py - 1.5 * s, '#B8C0CA', 3);
    for (var i = 0; i < 6; i++) {
      var ry = py - 0.12 * s - i * 0.2 * s;
      ell(c, px, ry, 0.22 * s, 0.1 * s, '#D9A441', 1.2);
      ell(c, px, ry, 0.08 * s, 0.04 * s, '#F4EBDD', 0);
    }
  };
  REG.kestane = function (c, X, Y, s) {
    var w = 1.1 * s, d = 0.9 * s, hg = 0.5 * s, top = Y - hg, now = performance.now() / 1000;
    shadow(c, X, Y, w * 0.6, d * 0.5);
    box(c, X, Y, w, d, hg, '#3A2A1E', '#241A12');
    glow(c, X, top, 0.9 * s, 0.32 + 0.1 * Math.sin(now * 8));
    ell(c, X, top, w * 0.36, d * 0.3, '#2A1E16', 1.5);
    for (var i = 0; i < 6; i++) {
      var k = (now * 0.35 + i / 6) % 1, r = (0.12 + k * 0.22) * s;
      ell(c, X + Math.sin(i * 2.1 + now * 0.8) * 0.12 * s, top - 0.2 * s - k * 1.6 * s, r, r, 'rgba(200,200,200,' + (0.35 * (1 - k)).toFixed(3) + ')', 0);
    }
  };
  REG.midye = function (c, X, Y, s) {
    var w = 1.2 * s, d = 0.8 * s, hg = 0.45 * s, top = Y - hg;
    shadow(c, X, Y, w * 0.6, d * 0.5);
    box(c, X, Y, w, d, hg, '#8B5A2B', '#5C3A1C');
    for (var i = 0; i < 9; i++) {
      var mx = X - w * 0.36 + (i % 5) * w * 0.18, my = top - d * 0.2 + Math.floor(i / 5) * d * 0.36;
      ell(c, mx, my, 0.1 * s, 0.16 * s, '#24344D', 1.2);
      ell(c, mx, my, 0.05 * s, 0.09 * s, '#E9A23B', 0);
    }
    ell(c, X + w * 0.38, top - d * 0.25, 0.1 * s, 0.06 * s, '#F2C14E', 1.2);
  };
  REG.misir = function (c, X, Y, s) {
    var w = 1.2 * s, d = 0.8 * s, hg = 0.5 * s, top = Y - hg, now = performance.now() / 1000;
    shadow(c, X, Y, w * 0.6, d * 0.5);
    box(c, X, Y, w, d, hg, '#C0392B', '#8E2A22');
    ell(c, X, top, w * 0.36, d * 0.3, '#B8B8B8', 1.5);
    for (var i = 0; i < 4; i++) ell(c, X - w * 0.2 + i * w * 0.13, top, 0.07 * s, 0.11 * s, '#F2C14E', 1);
    for (var k = 0; k < 3; k++) ell(c, X + (k - 1) * 0.12 * s, top - 0.22 * s - ((now * 0.5 + k / 3) % 1) * 0.5 * s, 0.1 * s, 0.1 * s, 'rgba(255,255,255,0.3)', 0);
  };
  REG.cay = function (c, X, Y, s) {
    var w = 1.4 * s, d = 0.7 * s, hg = 0.8 * s, top = Y - hg;
    shadow(c, X, Y, w * 0.6, d * 0.5);
    box(c, X, Y, w, d, hg, '#6B3E26', '#4A2A18');
    rc(c, X - w * 0.2, top, w * 0.5, d * 0.6, '#B8B8B8', 1.2);
    for (var i = 0; i < 4; i++) teaGlass(c, X - w * 0.32 + i * w * 0.12, top + d * 0.1, s);
  };
  REG.samovar = function (c, X, Y, s) {
    shadow(c, X, Y, 0.4 * s, 0.18 * s);
    ell(c, X, Y - 0.35 * s, 0.32 * s, 0.36 * s, '#C9A13B', 1.5);
    ell(c, X, Y - 0.72 * s, 0.2 * s, 0.12 * s, '#E0B84F', 1.5);
    rc(c, X, Y - 0.95 * s, 0.08 * s, 0.3 * s, '#B08A2E', 1.2);
    ln(c, X + 0.3 * s, Y - 0.2 * s, X + 0.42 * s, Y - 0.05 * s, '#B08A2E', 2.5);
  };
  REG.dondurma = function (c, X, Y, s) {
    var w = 1.2 * s, d = 0.9 * s, hg = 0.7 * s, top = Y - hg;
    shadow(c, X, Y, w * 0.6, d * 0.5);
    box(c, X, Y, w, d, hg, '#F4EBDD', '#C0392B');
    ell(c, X, top, w * 0.33, d * 0.3, '#E8E1D2', 1.5);
    ell(c, X, top - d * 0.1, w * 0.25, d * 0.25, '#F7A1C4', 1.2);
    ln(c, X + w * 0.2, top + d * 0.3, X + w * 0.45, Y + d / 2 + 0.6 * s, '#B5651D', 3);
    ell(c, X + w * 0.45, Y + d / 2 + 0.7 * s, 0.14 * s, 0.2 * s, '#C9A13B', 1.5);
  };
  REG.balikekmek = function (c, X, Y, s, o, now) {
    var w = 1.6 * s, d = 0.9 * s;
    shadow(c, X, Y, w * 0.55, d * 0.4);
    poly(c, [[X - w * 0.5, Y - d * 0.1], [X - w * 0.4, Y - d * 0.45], [X + w * 0.4, Y - d * 0.45], [X + w * 0.5, Y - d * 0.1], [X + w * 0.35, Y + d * 0.4], [X - w * 0.35, Y + d * 0.4]], '#1B4965', 1.6);
    rc(c, X, Y - d * 0.02, w * 0.6, d * 0.45, '#3A3E45', 1.2);
    for (var i = -1; i <= 1; i++) ln(c, X - w * 0.3, Y + i * d * 0.12, X + w * 0.3, Y + i * d * 0.12, '#8A8F98', 1);
    ell(c, X - w * 0.12, Y, 0.16 * s, 0.07 * s, '#C9A13B', 1);
    ell(c, X + w * 0.14, Y + d * 0.1, 0.16 * s, 0.07 * s, '#C9A13B', 1);
    var t = performance.now() / 1000;
    ell(c, X + Math.sin(t) * 0.05 * s, Y - d * 0.5 - ((t * 0.6) % 1) * 0.6 * s, 0.12 * s, 0.12 * s, 'rgba(230,230,230,0.3)', 0);
  };
  REG.piyango = function (c, X, Y, s) {
    var w = 1.0 * s, d = 0.8 * s, hg = 1.1 * s, top = Y - hg;
    shadow(c, X, Y, w * 0.6, d * 0.5);
    box(c, X, Y, w, d, hg, '#F4EBDD', '#1B4965');
    for (var i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#E9A23B' : '#C0392B'; c.fillRect(X - w / 2 + i * w / 4, top - 0.12 * s, w / 4, 0.12 * s); }
    for (var k = 0; k < 6; k++) rc(c, X - w * 0.36 + k * w * 0.14, Y + d / 2 - hg * 0.55, w * 0.1, hg * 0.35, k % 2 ? '#E9A23B' : '#F2C14E', 0.8);
  };
  REG.cicek = function (c, X, Y, s, o) {
    var cols = ['#E63946', '#FFD166', '#F4A3C0', '#F4EBDD', '#9B5DE5', '#FF8C42'], kv = o.k || 0;
    shadow(c, X, Y, 0.9 * s, 0.45 * s);
    for (var i = 0; i < 4; i++) {
      var bx = X + (i - 1.5) * 0.36 * s, by = Y + (i % 2 ? 0.16 : -0.1) * s;
      rc(c, bx, by + 0.1 * s, 0.32 * s, 0.2 * s, '#5E636B', 1.5);
      for (var k = 0; k < 5; k++) ell(c, bx + (k - 2) * 0.07 * s, by - 0.2 * s - (k % 2) * 0.08 * s, 0.06 * s, 0.06 * s, cols[(i + k + kv) % 6], 1);
    }
  };
  REG.nar = function (c, X, Y, s) {
    var w = 1.3 * s, d = 0.8 * s, hg = 0.7 * s, top = Y - hg;
    shadow(c, X, Y, w * 0.6, d * 0.5);
    box(c, X - w * 0.15, Y - d * 0.1, w * 0.7, d * 0.8, hg, '#B8C0CA', '#7A8490');
    ell(c, X + w * 0.38, Y - d * 0.1, 0.12 * s, 0.2 * s, '#B8C0CA', 1.5);
    for (var i = 0; i < 7; i++) ell(c, X - w * 0.36 + (i % 4) * w * 0.2, Y + d * 0.3 + Math.floor(i / 4) * d * 0.2, 0.1 * s, 0.1 * s, '#B5162B', 1.2);
    glow(c, X - w * 0.1, top, 0.5 * s, 0.1);
  };
  REG.lokum = function (c, X, Y, s) {
    var w = 1.2 * s, d = 0.7 * s, hg = 0.5 * s, top = Y - hg;
    shadow(c, X, Y, w * 0.6, d * 0.5);
    box(c, X, Y, w, d, hg, '#F4EBDD', '#D9CBB0');
    var cols = ['#F7A1C4', '#B8E0A0', '#FFFFFF', '#FFD9A0'];
    for (var i = 0; i < 4; i++) for (var j = 0; j < 2; j++) rc(c, X - w * 0.36 + i * w * 0.24, top + d * 0.3 + j * d * 0.4, 0.13 * s, 0.13 * s, cols[i], 1);
  };
  REG.baharat = function (c, X, Y, s, o) {
    var cols = ['#E9A23B', '#C0392B', '#B5651D', '#2E7D4F', '#F2C14E', '#7A4F8C', '#8B3A1E'], kv = o.k || 0;
    shadow(c, X, Y, 1.0 * s, 0.45 * s);
    var pts = [[-0.4, 0.2], [0, 0.2], [0.4, 0.2], [-0.2, -0.15], [0.2, -0.15], [0, -0.45]];
    pts.forEach(function (p, i) {
      ell(c, X + p[0] * s, Y + p[1] * s, 0.24 * s, 0.2 * s, cols[(i + kv) % 7], 1.6);
      ell(c, X + p[0] * s - 0.05 * s, Y + p[1] * s - 0.06 * s, 0.07 * s, 0.05 * s, 'rgba(255,255,255,0.25)', 0);
    });
  };
  REG.hali = function (c, X, Y, s) {
    var w = 1.3 * s, d = 0.8 * s;
    shadow(c, X, Y, w * 0.6, d * 0.5);
    rc(c, X, Y, w, d, '#9E2B25', 2);
    rc(c, X, Y, w * 0.8, d * 0.7, '#F4EBDD', 0);
    rc(c, X, Y, w * 0.7, d * 0.6, '#1B4965', 0);
    for (var i = -1; i <= 1; i++) poly(c, [[X + i * 0.28 * s, Y - 0.16 * s], [X + i * 0.28 * s + 0.1 * s, Y], [X + i * 0.28 * s, Y + 0.16 * s], [X + i * 0.28 * s - 0.1 * s, Y]], '#E9A23B', 0);
    ell(c, X + w * 0.6, Y, 0.16 * s, d * 0.45, '#7A3E1C', 1.5);
  };
  REG.cini = function (c, X, Y, s) {
    var w = 1.3 * s, d = 0.8 * s, hg = 0.6 * s, top = Y - hg;
    shadow(c, X, Y, w * 0.6, d * 0.5);
    box(c, X, Y, w, d, hg, '#8B5A2B', '#5C3A1C');
    for (var i = 0; i < 3; i++) {
      var px = X - w * 0.3 + i * w * 0.3, py = top;
      ell(c, px, py, 0.22 * s, 0.16 * s, '#F4EBDD', 1.2);
      ell(c, px, py, 0.13 * s, 0.09 * s, '#2B5DA0', 1);
    }
    ell(c, X + w * 0.25, top + d * 0.2, 0.1 * s, 0.12 * s, '#2E7D4F', 1.2);
  };
  REG.veg = function (c, X, Y, s, o) {
    var cols = ['#2E7D4F', '#C0392B', '#F2C14E', '#7CB342', '#6D4C41'], kv = o.k || 0;
    shadow(c, X, Y, 1.0 * s, 0.5 * s);
    box(c, X - 0.2 * s, Y + 0.1 * s, 1.1 * s, 0.8 * s, 0.4 * s, '#B8864B', '#7A5530');
    box(c, X + 0.3 * s, Y - 0.2 * s, 0.9 * s, 0.8 * s, 0.4 * s, '#C9965A', '#8A5F34');
    for (var i = 0; i < 6; i++) ell(c, X - 0.4 * s + (i % 3) * 0.3 * s, Y - 0.2 * s + Math.floor(i / 3) * 0.22 * s, 0.1 * s, 0.1 * s, cols[(i + kv) % 5], 1.2);
  };
  REG.meyhane = function (c, X, Y, s) {
    shadow(c, X, Y, 0.7 * s, 0.35 * s);
    [-1, 1].forEach(function (sx) { ell(c, X + sx * 0.55 * s, Y + 0.25 * s, 0.16 * s, 0.16 * s, '#6B3E26', 1.2); });
    ell(c, X, Y, 0.45 * s, 0.36 * s, '#F4EBDD', 1.5);
    rc(c, X - 0.1 * s, Y - 0.05 * s, 0.08 * s, 0.22 * s, '#2E7D4F', 1);
    rc(c, X + 0.1 * s, Y + 0.02 * s, 0.08 * s, 0.22 * s, '#2E7D4F', 1);
    ell(c, X + 0.02 * s, Y + 0.14 * s, 0.1 * s, 0.07 * s, '#E9A23B', 1);
  };
  REG.mangal = function (c, X, Y, s) {
    var now = performance.now() / 1000;
    shadow(c, X, Y, 0.5 * s, 0.25 * s);
    ell(c, X, Y, 0.38 * s, 0.3 * s, '#3A3E45', 2);
    for (var i = -2; i <= 2; i++) ln(c, X - 0.32 * s, Y + i * 0.12 * s, X + 0.32 * s, Y + i * 0.12 * s, '#B8B8B8', 1.5);
    for (var k = 0; k < 4; k++) ell(c, X + Math.cos(k * 1.6) * 0.2 * s, Y + Math.sin(k * 2.3) * 0.12 * s, 0.04 * s, 0.04 * s, '#FF6A2A', 0);
    for (var j = 0; j < 3; j++) ell(c, X + (j - 1) * 0.1 * s, Y - 0.35 * s - ((now * 0.4 + j / 3) % 1) * 0.6 * s, 0.1 * s, 0.1 * s, 'rgba(180,180,180,0.35)', 0);
  };

  M.draw = function (kind, R, x, y, o) {
    if (o && o.theme && P.ArenaProps && P.ArenaProps.draw(R, x, y, o.theme, kind, o)) return;   // R1-T3: authored art for the hood's kit
    var f = REG[kind] || REG.crate;
    f(R.ctx, R.X(x), R.Y(y), R.ppm, o || {});
  };
  M.has = function (kind) { return !!REG[kind]; };
  M.reg = function (kind, fn) { REG[kind] = fn; };
  M.alias = function (kind, to) { if (REG[to]) REG[kind] = REG[to]; };
  M.kinds = function () { return Object.keys(REG); };
  M.h = { ell: ell, rc: rc, poly: poly, ln: ln, shadow: shadow, box: box, glow: glow, teaGlass: teaGlass };
  return M;
})();
