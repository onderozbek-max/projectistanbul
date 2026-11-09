// Signature landmarks per hood (workstream F, view only, no collision). Metre-space painters are cached as
// offscreen canvases per kind, text and device-scale bucket. Across items (arches, overpass) span the corridor;
// billboards sit on the sidewalk/edge; tram sits on the tracks. L1 (İstiklal) uses fixed beats and segment washes.
// API: P.Landmarks.draw(R, s, y0, y1) (ground layer), weather(R, s, y0, y1), card(c, w, h, th, idx), clearCache().
P.Landmarks = (function () {
  var L = {}, CACHE = {}, CACHE_N = 0, PLAN = {};
  var INK = '#14151F', CREAM = '#F4EBDD', GOLD = '#E9A23B', TAU = Math.PI * 2;
  var FONT = 'italic 900 %Ppx "Avenir Next Condensed", "Arial Narrow", system-ui, sans-serif';

  function hs(n) { var x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }
  function isL1(s) { return !s.levelIndex || s.levelIndex === 1; }
  function R_(c, x, y, w, h, f, st, lw) {
    if (f) { c.fillStyle = f; c.fillRect(x, y, w, h); }
    if (st) { c.strokeStyle = st; c.lineWidth = lw || 0.04; c.strokeRect(x, y, w, h); }
  }
  function E_(c, x, y, rx, ry, f, st, lw) {
    c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU);
    if (f) { c.fillStyle = f; c.fill(); }
    if (st) { c.strokeStyle = st; c.lineWidth = lw || 0.04; c.stroke(); }
  }
  function txt(c, s, x, y, size, col, maxW) {
    c.fillStyle = col; c.font = FONT.replace('%P', size); c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(s, x, y, maxW || 1e6);
  }
  function plaque(c, x, y, w, h, s) {
    if (!s) return;
    R_(c, x, y, w, h, '#1F4E8C', CREAM, 0.04); txt(c, s, x + w / 2, y + h / 2, h * 0.6, CREAM, w * 0.9);
  }
  function line(c, pts, col, lw) {
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.stroke();
  }

  // ---- across items (w 14, h 3): ARCH styles and overpass ----
  var ARCH = {
    stone: function (c, w, h, t) {
      R_(c, 0, 0, 0.9, h, '#8E7F6A', INK); R_(c, w - 0.9, 0, 0.9, h, '#8E7F6A', INK);
      R_(c, 0, 0, w, 0.7, '#B5A88A', INK); plaque(c, w / 2 - 2.2, 0.08, 4.4, 0.54, t);
    },
    glass: function (c, w, h, t) {
      R_(c, 0.9, 0.25, w - 1.8, h - 0.25, 'rgba(190,225,235,0.28)');
      for (var x = 0.9; x < w - 0.9; x += 1.2) { R_(c, x, 0, 0.06, h, '#2B3A44'); R_(c, x + 0.4, h * 0.45, 0.25, 0.3, 'rgba(255,214,140,0.85)'); }
      R_(c, 0, 0, w, 0.25, '#2B3A44'); R_(c, 0, 0, 0.9, h, '#8E8A80', INK); R_(c, w - 0.9, 0, 0.9, h, '#8E8A80', INK);
      plaque(c, w / 2 - 1.5, 0.35, 3, 0.5, t);
    },
    classical: function (c, w, h, t) {
      [1.0, 1.5, w - 1.8, w - 1.3].forEach(function (x) { R_(c, x, 0.6, 0.3, h - 0.6, CREAM, INK, 0.03); });
      c.beginPath(); c.moveTo(w / 2 - 2.5, 0.8); c.lineTo(w / 2, 0); c.lineTo(w / 2 + 2.5, 0.8); c.closePath();
      c.fillStyle = CREAM; c.fill(); c.strokeStyle = INK; c.lineWidth = 0.04; c.stroke();
      plaque(c, w / 2 - 2, 0.85, 4, 0.5, t);
    },
    tunnel: function (c, w, h, t) {
      R_(c, 0, 0, w / 2 - 2.2, h, '#6B5A4A', INK, 0.04); R_(c, w / 2 + 2.2, 0, w / 2 - 2.2, h, '#6B5A4A', INK, 0.04);
      c.beginPath(); c.moveTo(w / 2 - 2.2, h); c.lineTo(w / 2 - 2.2, 2.2); c.arc(w / 2, 2.2, 2.2, Math.PI, 0); c.lineTo(w / 2 + 2.2, h); c.closePath();
      c.fillStyle = INK; c.fill();
      R_(c, w / 2 - 1.2, h - 0.8, 2.4, 0.8, 'rgba(255,190,110,0.5)');
      plaque(c, 0.6, 0.6, w / 2 - 3, 0.6, t); plaque(c, w / 2 + 2.4, 0.6, w / 2 - 3, 0.6, t);
    },
    metro: function (c, w, h, t) {
      R_(c, 0, 0, w, 0.35, '#7CC6D9', INK, 0.04); R_(c, w / 2 - 1.4, 0.35, 2.8, h - 0.35, '#0F3B4D', INK, 0.05);
      for (var y = 0.9; y < h; y += 0.4) R_(c, w / 2 - 1.2, y, 2.4, 0.05, '#3E6E80');
      txt(c, t || '', w / 2, 0.18, 0.28, '#0F3B4D', 4);
    },
    street: function (c, w, h, t) {
      R_(c, 0, 0, 0.3, h, '#2A2C31'); R_(c, w - 0.3, 0, 0.3, h, '#2A2C31');
      line(c, [[0.3, 0.5], [w / 2, 1.1], [w - 0.3, 0.5]], '#2A2C31', 0.04);
      for (var x = 0.6; x < w - 0.5; x += 0.5) E_(c, x, 0.5 + 0.6 * Math.sin((x - 0.3) / (w - 0.6) * Math.PI), 0.07, 0.07, (x * 2) % 1 < 0.5 ? '#FFD27A' : CREAM);
      plaque(c, w / 2 - 2.2, 1.4, 4.4, 0.5, t);
    },
    vault: function (c, w, h, t) {
      R_(c, 0, 0, w, h, '#5B4A3A');
      for (var x = 0; x < w; x += 2) { c.beginPath(); c.arc(x + 1, h, 1, Math.PI, TAU); c.strokeStyle = '#8A7A62'; c.lineWidth = 0.12; c.stroke(); }
      for (var q = 1; q < w; q += 2.5) E_(c, q, h * 0.4, 0.12, 0.12, '#FFD27A');
      plaque(c, w / 2 - 2.2, 0.3, 4.4, 0.5, t);
    }
  };
  function archP(c, w, h, st, t) { (ARCH[st] || ARCH.stone)(c, w, h, t); }
  function overpassP(c, w, h) {
    R_(c, 0, 0, w, h * 0.45, '#8F9396', INK, 0.04);
    R_(c, 0.3, h * 0.45, 0.5, h * 0.55, '#7F8B93'); R_(c, w - 0.8, h * 0.45, 0.5, h * 0.55, '#7F8B93');
  }

  // ---- billboards: facades (3.1 x 9) ----
  var FAC = {
    bay: function (c, w, h) {
      R_(c, 0, 0, w, h, '#8E7258');
      for (var y = 0; y < h; y += 0.45) R_(c, 0, y, w, 0.03, 'rgba(0,0,0,0.18)');
      for (var by = 1.0; by + 1.6 < h; by += 3.0) { R_(c, 0.3, by, w - 0.6, 1.6, '#C9B99A', INK, 0.04); R_(c, 0.6, by + 0.25, w - 1.2, 1.1, '#2A3445'); }
    },
    glass: function (c, w, h) {
      R_(c, 0, 0, w, h, '#6F9DB0');
      for (var x = 0; x < w; x += 0.8) R_(c, x, 0, 0.04, h, '#DDE8EE');
      for (var y = 0; y < h; y += 1.5) R_(c, 0, y, w, 0.04, '#DDE8EE');
      R_(c, 0, 0, w, 0.6, '#2C3E50');
    },
    brick: function (c, w, h) {
      R_(c, 0, 0, w, h, '#7A4A3A');
      for (var y = 0; y < h; y += 0.25) for (var x = (Math.floor(y / 0.25) % 2) * 0.3; x < w; x += 0.6)
        R_(c, x + 0.02, y + 0.02, 0.56, 0.2, ['#7A4A3A', '#6B3F31', '#8A5A44'][Math.floor(hs(x * 5 + y * 9) * 3)]);
      for (var wy = 1.0; wy + 1.2 < h; wy += 2.4) for (var wx = 0.6; wx + 0.8 < w; wx += 1.6) { R_(c, wx, wy, 0.8, 1.2, '#2A3445', INK, 0.03); R_(c, wx - 0.05, wy + 1.2, 0.9, 0.08, '#C9B99A'); }
    },
    wood: function (c, w, h) {
      R_(c, 0, 0, w, h, '#8A5A3C');
      for (var y = 0; y < h; y += 0.25) R_(c, 0, y, w, 0.03, 'rgba(60,30,15,0.35)');
      for (var wy = 1.2; wy + 1.5 < h; wy += 2.8) {
        for (var wx = 0.4; wx + 0.9 < w; wx += 1.3) R_(c, wx, wy, 0.9, 1.3, '#2A3445', CREAM, 0.06);
        R_(c, 0.1, wy + 1.5, w - 0.2, 0.14, '#5E4632');
      }
    },
    stone: function (c, w, h) {
      R_(c, 0, 0, w, h, '#7E7668');
      for (var y = 0; y < h; y += 0.6) R_(c, 0, y, w, 0.03, 'rgba(0,0,0,0.2)');
      for (var wy = 1.0; wy + 1.4 < h; wy += 2.6) R_(c, 0.8, wy, w - 1.6, 1.4, '#2A3445', CREAM, 0.05);
    },
    station: function (c, w, h) {
      R_(c, 0, 0, w, h, '#8C8A84'); R_(c, 0, 0, w, 0.5, '#5A5E64');
      c.beginPath(); c.arc(w / 2, 1.7, 0.75, 0, TAU); c.fillStyle = CREAM; c.fill(); c.strokeStyle = INK; c.lineWidth = 0.05; c.stroke();
      line(c, [[w / 2, 1.7], [w / 2, 1.2]], INK, 0.05); line(c, [[w / 2, 1.7], [w / 2 + 0.45, 1.7]], INK, 0.05);
      R_(c, w / 2 - 0.8, h - 2.4, 1.6, 2.4, '#2A2C31'); c.beginPath(); c.arc(w / 2, h - 2.4, 0.8, Math.PI, 0); c.fill();
      for (var x = 0.4; x + 0.6 < w; x += 1.0) if (Math.abs(x + 0.3 - w / 2) > 1) R_(c, x, 3.2, 0.6, 1.2, '#2A3445', INK, 0.03);
    },
    block: function (c, w, h) {
      R_(c, 0, 0, w, h, '#B5AA96');
      for (var y = 0.6; y + 1 < h; y += 1.5) { R_(c, 0, y + 0.8, w, 0.12, '#8F9396'); for (var x = 0.3; x + 0.8 < w; x += 1.0) R_(c, x, y, 0.7, 0.8, '#2A3445', INK, 0.03); }
    },
    estate: function (c, w, h) {
      R_(c, 0, 0, w, h, '#D8CBB6');
      for (var y = 0.4; y + 1.4 < h; y += 1.9) {
        R_(c, 0, y, w, 0.12, '#7A6A58');
        for (var x = 0.3; x + 0.8 < w; x += 1.0) R_(c, x, y + 0.2, 0.7, 0.8, '#2A3445', INK, 0.03);
        line(c, [[0.2, y + 1.2], [w - 0.2, y + 1.2]], '#5E5E62', 0.02);
        R_(c, 0.5, y + 1.22, 0.4, 0.3, ['#E9A23B', '#C0392B', '#B8C4C8'][Math.floor(hs(y) * 3)]);
      }
      R_(c, w - 1.0, 4.4, 0.7, 0.8, 'rgba(255,210,122,0.95)', INK, 0.03);
    },
    mural: function (c, w, h) {
      R_(c, 0, 0, w, h, '#E9DCC4');
      var cols = ['#C0392B', '#1B4965', '#E9A23B', '#2E7D4F', '#7A4F8C'];
      for (var i = 0; i < 12; i++) E_(c, hs(i) * w, hs(i + 7) * h, 0.2 + hs(i + 3) * 0.5, 0.2 + hs(i + 5) * 0.5, cols[i % 5]);
    }
  };
  function facadeP(c, w, h, st) { (FAC[st] || FAC.stone)(c, w, h); }
  function towerP(c, w, h) {
    c.beginPath(); c.moveTo(w * 0.15, h * 0.3); c.lineTo(w * 0.1, h); c.lineTo(w * 0.9, h); c.lineTo(w * 0.85, h * 0.3); c.closePath();
    c.fillStyle = '#CFC5B4'; c.fill(); c.strokeStyle = INK; c.lineWidth = 0.05; c.stroke();
    c.beginPath(); c.moveTo(w * 0.1, h * 0.3); c.lineTo(w / 2, 0); c.lineTo(w * 0.9, h * 0.3); c.closePath();
    c.fillStyle = '#5A4A3A'; c.fill();
    for (var y = h * 0.45; y < h * 0.8; y += h * 0.15) R_(c, w * 0.08, y, w * 0.84, 0.12, '#A59A88');
    for (var x = w * 0.3; x < w * 0.7; x += w * 0.2) R_(c, x, h * 0.55, 0.15, 0.4, '#2A3445');
  }

  // ---- shopfronts (3.2 x 6): awning, back wall, counter and hanging goods by style ----
  var ITEM = {
    music: function (c, w, h) {
      for (var i = 0; i < 3; i++) { var x = 0.6 + i * 1.0; E_(c, x, 3.0, 0.42, 0.55, '#B5651D', INK, 0.02); R_(c, x - 0.05, 1.6, 0.1, 1.5, '#3A2A1E'); }
    },
    lamp: function (c, w, h) {
      for (var i = 0; i < 3; i++) {
        var x = 0.7 + i * 0.9;
        c.beginPath(); c.moveTo(x, 1.2); c.lineTo(x - 0.35, 2.0); c.lineTo(x + 0.35, 2.0); c.closePath(); c.fillStyle = GOLD; c.fill(); c.strokeStyle = INK; c.lineWidth = 0.03; c.stroke();
        E_(c, x, 2.1, 0.3, 0.15, 'rgba(255,214,140,0.8)');
      }
    },
    carpet: function (c, w, h) {
      for (var i = 0; i < 3; i++) { R_(c, 0.2 + i * 1.0, 1.3, 0.75, 2.1, '#9E2B25', INK, 0.03); R_(c, 0.35 + i * 1.0, 1.5, 0.45, 1.7, '#1B4965'); }
    },
    textile: function (c, w, h) {
      var cols = ['#C0392B', '#1B4965', GOLD, '#2E7D4F', '#7A4F8C'];
      for (var i = 0; i < 5; i++) R_(c, 0.2 + i * 0.6, 1.4 + (i % 2) * 0.5, 0.45, 1.6, cols[i], INK, 0.02);
    },
    leather: function (c, w, h) {
      for (var i = 0; i < 4; i++) R_(c, 0.25 + i * 0.75, 1.3, 0.5, 2.0, '#7A4A2A', INK, 0.03);
    },
    book: function (c, w, h) {
      var cols = ['#C0392B', '#1B4965', '#2E7D4F', GOLD, '#7A4F8C', CREAM];
      for (var r = 0; r < 3; r++) { R_(c, 0.1, 1.4 + r * 1.1, w - 0.2, 0.05, '#3A2A1E'); for (var k = 0; k < 10; k++) R_(c, 0.2 + k * 0.27, 1.05 + r * 1.1, 0.2, 0.33, cols[(k + r) % 6]); }
    },
    fish: function (c, w, h) {
      R_(c, 0.2, h - 2.2, w - 0.4, 0.8, '#B8E0F0', INK, 0.03);
      for (var i = 0; i < 3; i++) E_(c, 0.7 + i * 0.9, h - 1.8, 0.3, 0.12, '#8A9AA8');
    },
    spice: function (c, w, h) {
      var cols = ['#C0392B', GOLD, '#8A5A34', '#F2C14E', '#B5651D'];
      for (var i = 0; i < 5; i++) E_(c, 0.5 + i * 0.6, h - 1.6, 0.32, 0.22, cols[i]);
    },
    fasil: function (c, w, h) {
      R_(c, 0.1, h - 2.4, w - 0.2, 1.1, '#6B4A2E', INK, 0.03); R_(c, 0.6, 1.5, 0.05, 1.7, '#C9A46A');
      E_(c, 1.5, 3.4, 0.3, 0.35, '#8A5A34', INK, 0.03);
      c.beginPath(); c.moveTo(1.9, 2.2); c.lineTo(2.6, 2.2); c.lineTo(2.8, 3.4); c.lineTo(1.7, 3.4); c.closePath(); c.fillStyle = '#9E7A4A'; c.fill();
    }
  };
  function stallP(c, w, h, st, t) {
    for (var k = 0; k < 6; k++) R_(c, k * w / 6, 0, w / 6, 0.9, k % 2 ? CREAM : '#2E7D4F');
    R_(c, 0, 0.9, w, h - 2.2, '#2A3445'); R_(c, 0, h - 1.3, w, 1.3, '#6B4A2E', INK, 0.04);
    (ITEM[st] || ITEM.music)(c, w, h);
    plaque(c, 0.3, 1.0, w - 0.6, 0.45, t);
  }

  // ---- park and water-edge set pieces (4 x 8) ----
  var PARK = {
    plane: function (c, w, h) {
      R_(c, w / 2 - 0.12, h * 0.45, 0.24, h * 0.55, '#8A7A62');
      var cols = ['#5E8A4A', '#6F9A56', '#4E7A42', '#7DA45F'];
      for (var i = 0; i < 7; i++) E_(c, w * (0.25 + 0.5 * hs(i)), h * (0.2 + 0.4 * hs(i + 9)), 1.0, 0.9, cols[i % 4]);
      for (var k = 0; k < 6; k++) R_(c, w * hs(k + 20), h * hs(k + 30) * 0.5, 0.15, 0.08, '#C9BBA0');
    },
    palm: function (c, w, h) {
      R_(c, 0, 0, w, h, '#4F6A46');
      line(c, [[w / 2, h], [w / 2 + 0.3, h * 0.35]], '#8A6A4A', 0.22);
      for (var a = 0; a < 6; a++) { var ang = a * Math.PI / 3 + 0.3; line(c, [[w / 2 + 0.3, h * 0.35], [w / 2 + 0.3 + Math.cos(ang) * 1.2, h * 0.35 + Math.sin(ang) * 0.8]], '#3E8A4A', 0.25); }
    },
    bostan: function (c, w, h) {
      for (var r = 0; r < h; r += 1.1) {
        R_(c, 0.2, r + 0.15, w - 0.4, 0.8, '#5A3E2A');
        for (var k = 0; k < 6; k++) E_(c, 0.5 + k * 0.5, r + 0.55, 0.15, 0.15, '#3E8A4A');
      }
      R_(c, 0.3, h - 0.9, 0.7, 0.5, '#8A8F98', INK, 0.02);
    },
    coast: function (c, w, h) {
      R_(c, 0, 0, w, h, '#4F6A46'); R_(c, 0, 0, w, 1.1, '#2C4658');
      for (var y = 2; y < h; y += 2.4) R_(c, 0.4, y, w - 0.8, 0.25, '#8A5A34', INK, 0.02);
    },
    square: function (c, w, h) {
      R_(c, 0, 0, w, h, '#8A8074');
      for (var y = 0; y < h; y += 1.0) R_(c, 0, y, w, 0.03, 'rgba(0,0,0,0.2)');
      E_(c, w * 0.35, h * 0.4, 0.35, 0.35, CREAM, INK, 0.02); E_(c, w * 0.7, h * 0.7, 0.35, 0.35, CREAM, INK, 0.02);
      for (var p = 0; p < 6; p++) E_(c, w * hs(p + 3), h * hs(p + 11), 0.1, 0.07, '#9A9A9E');
    },
    grill: function (c, w, h) {
      R_(c, 0, 0, w, h, '#55602F');
      R_(c, w / 2 - 0.6, h * 0.45, 1.2, 0.7, '#2A2C31', INK, 0.03); E_(c, w / 2, h * 0.45 + 0.35, 0.5, 0.15, '#FF6A2A');
      for (var i = 0; i < 4; i++) E_(c, w / 2 + 0.2 * Math.sin(i), h * 0.4 - i * 0.9, 0.25 + i * 0.08, 0.2, 'rgba(200,200,200,0.25)');
    },
    sprinkler: function (c, w, h) {
      R_(c, 0, 0, w, h, '#5E8A4A');
      for (var i = 0; i < 3; i++) { var x = w * (0.25 + 0.25 * i), y = h * (0.3 + 0.2 * i); E_(c, x, y, 0.7, 0.7, null, 'rgba(190,225,240,0.6)', 0.05); }
    }
  };
  function parkP(c, w, h, st) { (PARK[st] || PARK.plane)(c, w, h); }

  var PIER = {
    pier: function (c, w, h) {
      R_(c, 0, 0, w, h, '#2C4658'); R_(c, 0.4, 0, w - 0.8, h, '#6B5D4F', INK, 0.03);
      for (var y = 0; y < h; y += 0.6) R_(c, 0.4, y, w - 0.8, 0.03, 'rgba(0,0,0,0.25)');
      for (var b = 1; b < h; b += 2.5) { E_(c, 0.25, b, 0.12, 0.12, '#3A3A3A'); E_(c, w - 0.25, b, 0.12, 0.12, '#3A3A3A'); }
    },
    deck: function (c, w, h) {
      R_(c, 0, 0, w, h, '#5A4E44'); R_(c, 0.1, 0, 0.08, h, INK); R_(c, w - 0.18, 0, 0.08, h, INK);
      for (var y = 0.6; y + 1.8 < h; y += 2.4) { R_(c, 0.4, y, w - 0.8, 0.5, y % 2 ? '#C0392B' : CREAM, INK, 0.02); R_(c, 0.4, y + 1.0, w - 0.8, 0.4, '#3A2A1E'); }
    },
    boat: function (c, w, h, st, t) {
      c.beginPath(); c.moveTo(0.4, h * 0.45); c.lineTo(w - 0.4, h * 0.45); c.lineTo(w - 0.9, h * 0.7); c.lineTo(0.9, h * 0.7); c.closePath();
      c.fillStyle = '#E9E4D8'; c.fill(); c.strokeStyle = INK; c.lineWidth = 0.04; c.stroke();
      R_(c, w * 0.3, h * 0.22, w * 0.4, h * 0.25, '#C0392B', INK, 0.03); plaque(c, w * 0.2, h * 0.02, w * 0.6, h * 0.16, t);
    },
    terminal: function (c, w, h) {
      R_(c, 0, 0, w, h, '#2C4658'); R_(c, 0, 0, w, 0.7, '#9AA3AB', INK, 0.03);
      R_(c, 0.6, 0.7, w - 1.2, h - 1.4, 'rgba(170,205,220,0.4)', INK, 0.03);
      R_(c, 0.6, 0.7, 0.3, h - 1.4, '#7A828A'); R_(c, w - 0.9, 0.7, 0.3, h - 1.4, '#7A828A');
    },
    promenade: function (c, w, h) {
      R_(c, 0, 0, w - 1.2, h, '#8A8B84'); R_(c, w - 1.2, 0, 1.2, h, '#2C4658'); R_(c, w - 1.3, 0, 0.06, h, '#4E5560');
      for (var y = 0; y < h; y += 1.2) R_(c, w - 1.36, y, 0.14, 0.06, '#4E5560');
    },
    yachts: function (c, w, h) {
      R_(c, 0, 0, w, h, '#2C4658');
      for (var y = 1; y < h - 1; y += 2.8) {
        c.beginPath(); c.moveTo(0.6, y); c.lineTo(w - 0.6, y); c.lineTo(w - 1.0, y + 0.7); c.lineTo(1.0, y + 0.7); c.closePath();
        c.fillStyle = '#F4F1EA'; c.fill(); c.strokeStyle = INK; c.lineWidth = 0.03; c.stroke();
        R_(c, w / 2 - 0.03, y - 2.4, 0.06, 2.4, '#2A2A2A');
      }
    },
    boardwalk: function (c, w, h) {
      R_(c, 0, 0, w, h, '#8C7B66');
      for (var y = 0; y < h; y += 0.3) R_(c, 0, y, w, 0.03, 'rgba(60,40,20,0.35)');
      R_(c, 0.2, 0, 0.1, h, '#5E4E3C'); R_(c, w - 0.3, 0, 0.1, h, '#5E4E3C');
    }
  };
  function pierP(c, w, h, st, t) { (PIER[st] || PIER.pier)(c, w, h, st, t); }

  var BOARD_TXT = { kadikoy: 'KADIKÖY', uskudar: 'ÜSKÜDAR', aksaray: 'AKSARAY', bilet: 'BİLET', durak: 'DURAK' };
  var ARCH_TXT = { 'arch:glass': 'PASAJ', 'arch:tunnel': 'TÜNEL', 'arch:metro': 'METRO', 'arch:street': 'ÇARŞI', 'arch:vault': 'ÇARŞI' };
  function boardP(c, w, h, st, t) {
    R_(c, w / 2 - 0.05, 0.9, 0.1, h - 0.9, '#3A3A3A'); R_(c, 0, 0, w, 0.9, '#1B4965', INK, 0.04);
    txt(c, t || '', w / 2, 0.45, 0.42, CREAM, w * 0.9);
  }
  function craneP(c, w, h) {
    for (var y = 0; y < h; y += 0.8) { line(c, [[w / 2 - 0.5, y], [w / 2 + 0.5, y + 0.8]], '#E9A23B', 0.06); line(c, [[w / 2 + 0.5, y], [w / 2 - 0.5, y + 0.8]], '#E9A23B', 0.06); }
    R_(c, 0, 0, w, 0.35, GOLD, INK, 0.03); R_(c, 0, 0, w * 0.25, 0.8, '#5A5E64');
  }
  function digP(c, w, h) {
    R_(c, 0, 0, w, h, '#8A6A4A');
    for (var y = 0.5; y < h; y += 0.7) R_(c, 0, y, w, 0.05, 'rgba(60,40,20,0.35)');
    R_(c, 0, 0, w, 0.3, '#3A5A7A', INK, 0.03);
    for (var i = 1; i <= 3; i++) { c.beginPath(); c.arc(w / 2, h, w * 0.2 * i, Math.PI, TAU); c.strokeStyle = '#6B4A2E'; c.lineWidth = 0.12; c.stroke(); }
  }
  function minibusP(c, w, h) {
    R_(c, 0, 0, w, h, '#F4F1EA', INK, 0.05); R_(c, 0, h * 0.45, w, 0.25, '#1B4965');
    R_(c, 0.2, 0.4, w - 0.4, 1.2, '#2A3445', INK, 0.03); R_(c, 0.2, h - 0.9, w - 0.4, 0.5, GOLD);
    E_(c, 0.5, h - 0.15, 0.25, 0.2, INK); E_(c, w - 0.5, h - 0.15, 0.25, 0.2, INK);
  }
  function stepsP(c, w, h) {
    R_(c, 0, 0, w, h, '#8E8674');
    for (var y = 0.3; y < h; y += 0.5) R_(c, 0.3, y, w - 0.6, 0.42, Math.floor(y / 0.5) % 2 ? '#7A7262' : '#968E7C', INK, 0.02);
    R_(c, 0.1, 0, 0.07, h, '#2A2C31'); R_(c, w - 0.17, 0, 0.07, h, '#2A2C31');
    E_(c, w / 2, 0.4, 0.15, 0.15, '#FFE2A8', INK, 0.02);
  }
  function wallP(c, w, h, st) {
    if (st === 'tower') {
      E_(c, w / 2, h / 2, w * 0.45, h * 0.48, '#7E7460', INK, 0.04); R_(c, w / 2 - 0.05, h * 0.3, 0.1, 0.6, INK);
      for (var x = 0.3; x < w - 0.2; x += 0.6) R_(c, x, 0, 0.3, 0.4, '#7E7460', INK, 0.03);
      return;
    }
    R_(c, 0, 0, w, h, '#7E7460');
    for (var y = 0.5; y < h; y += 0.5) R_(c, 0, y, w, 0.04, '#4E4838');
    for (var cx = 0; cx < w; cx += 0.6) R_(c, cx, 0, 0.3, 0.4, '#7E7460', INK, 0.03);
  }
  function tramP(c, w, h) {
    R_(c, 0, 0, w, h, '#C0392B', INK, 0.06); R_(c, 0.2, 0.5, w - 0.4, h - 1, CREAM, INK, 0.03);
    for (var y = 1; y < h - 0.5; y += 1.6) R_(c, 0.5, y, w - 1.0, 0.9, '#C0392B');
  }

  // Painter families: "family:style" kinds. Kinds without a painter fall back to P.Props (e.g. playground).
  var FAM = { tram: tramP, arch: archP, overpass: overpassP, facade: facadeP, tower: towerP, stall: stallP, park: parkP,
    pier: pierP, board: boardP, crane: craneP, dig: digP, minibus: minibusP, steps: stepsP, wall: wallP };
  var SIZE = { tram: [1.8, 9], board: [1.6, 2.4], stall: [3.2, 6], park: [4, 8], pier: [4, 8], tower: [4, 10], crane: [3, 10],
    dig: [6, 5], steps: [4, 9], wall: [3.2, 9], minibus: [2.2, 5], facade: [3.1, 9], overpass: [14, 3], arch: [14, 3] };
  function paint(c, kind, w, h, t) {
    var f = kind.split(':'), fn = FAM[f[0]];
    if (fn) fn(c, w, h, f[1], t);
  }
  function textFor(kind, sub) {
    var fam = kind.split(':')[0];
    if (fam === 'arch') return ARCH_TXT[kind] || sub.tr;
    if (fam === 'board') return BOARD_TXT[kind.split(':')[1]] || '';
    return null;
  }
  // Plan item: top-left at (x0, y0 + h) in world metres; across items span the corridor, billboards sit at the edges.
  function item(kind, side, y, t) {
    var fam = kind.split(':')[0], sz = SIZE[fam] || [3.1, 9], it = { kind: kind, t: t, w: sz[0], h: sz[1], y0: y, side: side || 1 };
    it.prop = !FAM[fam];
    if (fam === 'arch' || fam === 'overpass') it.x0 = -7;
    else if (fam === 'tram') it.x0 = -0.9;
    else if (fam === 'dig') it.x0 = -3;
    else if (fam === 'minibus') it.x0 = side > 0 ? 0.6 : -2.8;
    else if (fam === 'board') it.x0 = side > 0 ? 4.9 : -6.5;
    else it.x0 = side > 0 ? 3.4 : -3.4 - it.w;
    return it;
  }
  function isAcross(kind) { var f = kind.split(':')[0]; return f === 'arch' || f === 'overpass'; }

  // Level-1 beats (fixed, scripted corridor). Segments: A 0-62 restaurant, B 62-124 passage, C 124-194 tram stop, D 194-230 Tünel.
  var L1_ITEMS = [
    item('facade:bay', -1, 24, null), item('arch:street', 0, 36, 'LEZZET'), item('arch:glass', 0, 84, 'PASAJ'),
    item('stall:book', -1, 66, 'SAHAF'), item('stall:music', 1, 104, 'MÜZİK'), item('board:durak', -1, 134, 'DURAK'),
    item('facade:brick', 1, 196, null), item('arch:tunnel', 0, 212, 'TÜNEL')
  ];
  var L1_WASH = [[0, 62, [233, 162, 59], 0.07], [62, 124, [120, 160, 200], 0.06], [124, 194, [90, 100, 110], 0.1], [194, 230, [150, 40, 30], 0.12]];

  // Generated level plan: start arch (sub name), mid across arch, then billboards every 24 m alternating sides.
  function genPlan(s, sub) {
    var len = Math.max(40, (s.geo && s.geo.length) || 230), across = [], bill = [], seed = (s.levelIndex || 1) * 37, out = [], k, side;
    sub.lm.forEach(function (kind) { (isAcross(kind) ? across : bill).push(kind); });
    var startK = across[0] || 'arch:stone', midK = across[1] || across[0] || 'arch:vault';
    out.push(item(startK, 1, 6, textFor(startK, sub)));
    out.push(item(midK, 1, len * 0.5, textFor(midK, sub)));
    if (!bill.length) return out;
    for (k = 0; 16 + k * 24 < len - 12; k++) {
      var kind = bill[(k + seed) % bill.length];
      side = hs(seed + k * 7.1) < 0.5 ? -1 : 1;
      out.push(item(kind, side, 16 + k * 24, textFor(kind, sub)));
    }
    return out;
  }
  function planFor(s) {
    var th = P.RenderWorld.themeOf(s), idx = P.Themes.subIndex(s), sub = P.Themes.subOf(th, idx);
    var key = (s.levelIndex || 0) + ':' + th.id + ':' + idx + ':' + ((s.geo && s.geo.length) || 0);
    if (!PLAN[key]) { if (Object.keys(PLAN).length > 12) PLAN = {}; PLAN[key] = genPlan(s, sub); }
    return { items: PLAN[key], th: th, sub: sub, idx: idx };
  }

  function image(it, R) {
    var k = Math.max(12, Math.round(R.ppm / 4) * 4), key = it.kind + '|' + (it.t || '') + '|' + it.w + 'x' + it.h + '|' + k, cv = CACHE[key];
    if (cv) return cv;
    if (CACHE_N > 160) { CACHE = {}; CACHE_N = 0; }
    cv = document.createElement('canvas'); cv.width = Math.ceil(it.w * k); cv.height = Math.ceil(it.h * k);
    var c = cv.getContext('2d'); c.setTransform(k, 0, 0, k, 0, 0); paint(c, it.kind, it.w, it.h, it.t);
    CACHE[key] = cv; CACHE_N++;
    return cv;
  }
  function drawItems(R, items, y0, y1, s) {
    var c = R.ctx, hero = s.hero || { x: 0, y: -999 };
    items.forEach(function (it) {
      if (it.y0 > y1 + 1 || it.y0 + it.h < y0 - 1) return;
      if (it.prop) { if (P.Props && P.Props.has(it.kind)) P.Props.draw(it.kind, R, it.side * 5.9, it.y0, { k: 0 }); return; }
      var near = it.kind.indexOf('tram') === 0 && Math.abs(hero.y - (it.y0 + it.h / 2)) < 9 && Math.abs(hero.x) < 3;
      c.globalAlpha = near ? 0.35 : 1;
      c.drawImage(image(it, R), R.X(it.x0), R.Y(it.y0 + it.h), it.w * R.ppm, it.h * R.ppm);
      c.globalAlpha = 1;
    });
  }
  function washL1(R, y0, y1) {
    var c = R.ctx;
    L1_WASH.forEach(function (sg) {
      if (sg[1] < y0 || sg[0] > y1) return;
      var g = c.createLinearGradient(0, R.Y(sg[0]), 0, R.Y(sg[1])), col = sg[2].join(',');
      g.addColorStop(0, 'rgba(' + col + ',0)'); g.addColorStop(0.12, 'rgba(' + col + ',' + sg[3] + ')');
      g.addColorStop(0.88, 'rgba(' + col + ',' + sg[3] + ')'); g.addColorStop(1, 'rgba(' + col + ',0)');
      c.fillStyle = g; c.fillRect(R.X(-7), R.Y(sg[1]), 14 * R.ppm, (sg[1] - sg[0]) * R.ppm);
    });
  }

  L.draw = function (R, s, y0, y1) {
    if (isL1(s)) { washL1(R, y0, y1); drawItems(R, L1_ITEMS, y0, y1, s); return; }
    if (P.LayoutsFx) P.LayoutsFx.ground(R, s, y0, y1);   // layout zone floors (AUDIT-6 B2), under the street items
    drawItems(R, planFor(s).items, y0, y1, s);
  };
  // Weather for generated levels: rain streaks, brazier fire glow on the sidewalks, fog bands.
  L.weather = function (R, s, y0, y1) {
    if (isL1(s)) return;
    var sub = P.Themes.subOf(P.RenderWorld.themeOf(s), P.Themes.subIndex(s)), t = performance.now() / 1000;
    var covered = !!(P.Indoor && P.Indoor.level(s));   // rain and fog stay outside; braziers may burn indoors
    if (sub.wx === 'rain' && !covered) rain(R, y0, y1, t);
    else if (sub.wx === 'fire') fires(R, y0, y1, t);
    else if (sub.wx === 'fog' && !covered) fog(R, y0, y1, t);
  };
  function rain(R, y0, y1, t) {
    var c = R.ctx, span = y1 - y0 + 1;
    c.save(); c.strokeStyle = 'rgba(200,220,255,0.35)'; c.lineWidth = 1; c.beginPath();
    for (var i = 0; i < 36; i++) {
      var x = -5 + 10 * hs(i * 1.7), y = y0 + ((hs(i * 3.3) * span - t * (14 + 6 * hs(i))) % span + span) % span;
      c.moveTo(R.X(x), R.Y(y)); c.lineTo(R.X(x - 0.12), R.Y(y - 0.6));
    }
    c.stroke(); c.restore();
  }
  function fires(R, y0, y1, t) {
    var c = R.ctx, u = R.ppm;
    c.save(); c.globalCompositeOperation = 'lighter';
    for (var k = 0; k < 6; k++) {
      var y = y0 + hs(k * 2.9 + Math.floor(t * 0.3)) * (y1 - y0), x = k % 2 ? 4.8 : -4.8, a = 0.3 + 0.15 * Math.sin(t * 9 + k);
      var g = c.createRadialGradient(R.X(x), R.Y(y), 0, R.X(x), R.Y(y), 2.2 * u);
      g.addColorStop(0, 'rgba(255,140,60,' + a.toFixed(2) + ')'); g.addColorStop(1, 'rgba(255,120,40,0)');
      c.fillStyle = g; c.fillRect(R.X(x) - 2.2 * u, R.Y(y) - 2.2 * u, 4.4 * u, 4.4 * u);
    }
    c.restore();
  }
  function fog(R, y0, y1, t) {
    var c = R.ctx, u = R.ppm;
    for (var i = 0; i < 3; i++) {
      c.fillStyle = 'rgba(190,200,210,0.09)'; c.beginPath();
      c.ellipse(R.X(Math.sin(t * 0.05 + i * 2.1) * 3), R.Y(y0 + ((i * 9.1 + t * 0.8) % (y1 - y0))), 6 * u, 2.4 * u, 0, 0, TAU); c.fill();
    }
  }

  // Postcard vignette (hood card): the sub's first landmark, fitted to the w x h canvas context.
  L.card = function (c, w, h, th, idx) {
    var sub = P.Themes.subOf(th, idx || 0), kind = sub.lm[0] || 'arch:stone', fam = kind.split(':')[0];
    var sz = SIZE[fam] || [3.1, 9], k = Math.min(w / sz[0], h / sz[1]) * 0.9;
    c.save(); c.translate(w / 2 - sz[0] * k / 2, h / 2 - sz[1] * k / 2); c.scale(k, k);
    if (FAM[fam]) paint(c, kind, sz[0], sz[1], textFor(kind, sub));
    c.restore();
  };
  L.clearCache = function () { CACHE = {}; CACHE_N = 0; PLAN = {}; };
  return L;
})();
