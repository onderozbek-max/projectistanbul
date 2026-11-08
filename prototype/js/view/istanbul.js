// İstiklal street life (view only, no collision): sidewalk vendors and café tables, hanging Turkish shop signs,
// overhead string lights, seagulls overhead, pigeons that scatter when Arda gets close. Generic, brand-free (guardrails).
P.Decor = (function () {
  var D = { pig: {}, gullCd: 6 }, INK = '#14151F';
  var KINDS = ['cafe', 'shoeshine', 'corn', 'flowers', 'nazar', 'lokum', 'carpet', 'books', 'pomegranate', 'cafe', 'tea'];
  var SIGNS_TR = ['LOKANTA', 'BÜFE', 'KURUYEMİŞ', 'ÇAY OCAĞI', 'LOKUMCU', 'SAHAF', 'BERBER', 'TERZİ', 'KUYUMCU', 'MİDYECİ', 'PLAK', 'BAKLAVA', 'KUNDURACI', 'ECZANE', 'DÖNER', 'ÇİÇEKÇİ'];
  var SIGN_COL = [['#14151F', '#FFD166'], ['#C0392B', '#F4EBDD'], ['#1B4965', '#F4EBDD'], ['#2E7D4F', '#FFE2A8'], ['#F4EBDD', '#14151F']];

  var glowCv = null;
  function glow() {
    if (glowCv) return glowCv;
    glowCv = document.createElement('canvas'); glowCv.width = glowCv.height = 64;
    var g2 = glowCv.getContext('2d'), gr = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,214,140,1)'); gr.addColorStop(1, 'rgba(255,190,100,0)');
    g2.fillStyle = gr; g2.fillRect(0, 0, 64, 64);
    return glowCv;
  }
  function hash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function ell(c, X, Y, rx, ry, fill, lw) { c.beginPath(); c.ellipse(X, Y, rx, ry, 0, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); if (lw !== 0) { c.strokeStyle = INK; c.lineWidth = lw || 1.6; c.stroke(); } }
  function box(c, X, Y, w, h, fill, lw) { c.fillStyle = fill; c.fillRect(X - w / 2, Y - h / 2, w, h); if (lw !== 0) { c.strokeStyle = INK; c.lineWidth = lw || 1.6; c.strokeRect(X - w / 2, Y - h / 2, w, h); } }

  function teaGlass(c, X, Y, u) {
    ell(c, X, Y + 0.02 * u, 0.09 * u, 0.04 * u, '#C0392B', 1);
    c.beginPath(); c.moveTo(X - 0.04 * u, Y); c.quadraticCurveTo(X - 0.015 * u, Y - 0.06 * u, X - 0.035 * u, Y - 0.13 * u);
    c.lineTo(X + 0.035 * u, Y - 0.13 * u); c.quadraticCurveTo(X + 0.015 * u, Y - 0.06 * u, X + 0.04 * u, Y); c.closePath();
    c.fillStyle = '#B5401D'; c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
  }

  var DRAW = {
    cafe: function (c, X, Y, u, h) {
      [[-0.6, 0.4], [0.5, -0.6]].forEach(function (o, i) {
        var tx = X + o[0] * u, ty = Y + o[1] * u;
        [[-0.45, 0], [0.45, 0]].forEach(function (st) { ell(c, tx + st[0] * u, ty + 0.05 * u, 0.15 * u, 0.1 * u, '#6B3E26'); });
        ell(c, tx, ty, 0.34 * u, 0.22 * u, '#E8E1D2');
        if (i === 0 && h > 0.5) { box(c, tx, ty - 0.02 * u, 0.32 * u, 0.2 * u, '#8B5A2B', 1.2); c.fillStyle = '#F4EBDD'; c.fillRect(tx - 0.01 * u, ty - 0.12 * u, 0.02 * u, 0.2 * u); }
        else { teaGlass(c, tx - 0.1 * u, ty, u); teaGlass(c, tx + 0.12 * u, ty + 0.03 * u, u); }
      });
    },
    shoeshine: function (c, X, Y, u) {
      box(c, X, Y, 0.6 * u, 0.36 * u, '#C9A13B');
      c.fillStyle = '#E9C46A'; c.beginPath(); c.arc(X, Y - 0.18 * u, 0.22 * u, Math.PI, 0); c.fill(); c.strokeStyle = INK; c.lineWidth = 1.6; c.stroke();
      c.fillStyle = '#FFF2C2'; for (var i = -1; i <= 1; i++) { c.beginPath(); c.arc(X + i * 0.16 * u, Y, 0.035 * u, 0, Math.PI * 2); c.fill(); }
      box(c, X + 0.1 * u, Y - 0.28 * u, 0.22 * u, 0.06 * u, '#3A2A1E', 1);
      ell(c, X - 0.55 * u, Y + 0.1 * u, 0.14 * u, 0.1 * u, '#6B3E26');
    },
    corn: function (c, X, Y, u) {
      box(c, X, Y, 0.9 * u, 0.55 * u, '#C0392B');
      for (var i = 0; i < 4; i++) { ell(c, X - 0.27 * u + i * 0.18 * u, Y - 0.05 * u, 0.06 * u, 0.15 * u, '#F2C14E', 1); }
      c.strokeStyle = '#B8B8B8'; c.lineWidth = 2; c.beginPath(); c.moveTo(X + 0.3 * u, Y); c.lineTo(X + 0.3 * u, Y - 0.9 * u); c.stroke();
      for (var k = 0; k < 8; k++) {
        c.beginPath(); c.moveTo(X + 0.3 * u, Y - 0.95 * u); c.arc(X + 0.3 * u, Y - 0.95 * u, 0.6 * u, k / 8 * Math.PI * 2, (k + 1) / 8 * Math.PI * 2); c.closePath();
        c.fillStyle = k % 2 ? '#F4EBDD' : '#D7263D'; c.fill();
      }
      c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.arc(X + 0.3 * u, Y - 0.95 * u, 0.6 * u, 0, Math.PI * 2); c.stroke();
    },
    flowers: function (c, X, Y, u, h) {
      var cols = ['#E63946', '#FFD166', '#F4A3C0', '#F4EBDD', '#9B5DE5', '#FF8C42'];
      for (var i = 0; i < 5; i++) {
        var bx = X - 0.6 * u + i * 0.3 * u, by = Y + (i % 2) * 0.18 * u;
        ell(c, bx, by, 0.13 * u, 0.09 * u, '#5E636B', 1.2);
        for (var k = 0; k < 6; k++) { c.fillStyle = cols[(i + Math.floor(h * 6)) % 6]; c.beginPath(); c.arc(bx + Math.cos(k) * 0.08 * u, by - 0.08 * u + Math.sin(k * 2) * 0.05 * u, 0.045 * u, 0, Math.PI * 2); c.fill(); }
      }
    },
    nazar: function (c, X, Y, u) {
      box(c, X, Y, 1.2 * u, 0.5 * u, '#6B3E26');
      for (var i = 0; i < 5; i++) for (var j = 0; j < 2; j++) {
        var bx = X - 0.48 * u + i * 0.24 * u, by = Y - 0.1 * u + j * 0.2 * u;
        ell(c, bx, by, 0.09 * u, 0.09 * u, '#1F4FB4', 1); ell(c, bx, by, 0.06 * u, 0.06 * u, '#FFFFFF', 0);
        ell(c, bx, by, 0.035 * u, 0.035 * u, '#7FC8F8', 0); ell(c, bx, by, 0.016 * u, 0.016 * u, INK, 0);
      }
    },
    lokum: function (c, X, Y, u) {
      box(c, X, Y, 1.1 * u, 0.5 * u, '#F4EBDD');
      var cols = ['#F7A1C4', '#B8E0A0', '#FFFFFF', '#FFD9A0'];
      for (var t = 0; t < 4; t++) {
        box(c, X - 0.4 * u + t * 0.27 * u, Y, 0.24 * u, 0.36 * u, '#B8B8B8', 1);
        for (var k = 0; k < 6; k++) box(c, X - 0.45 * u + t * 0.27 * u + (k % 2) * 0.1 * u, Y - 0.12 * u + Math.floor(k / 2) * 0.12 * u, 0.08 * u, 0.08 * u, cols[t], 0.8);
      }
    },
    carpet: function (c, X, Y, u, h) {
      var w = 1.3 * u, hh = 0.8 * u;
      box(c, X, Y, w, hh, h > 0.5 ? '#9E2B25' : '#1B4965', 2);
      box(c, X, Y, w * 0.82, hh * 0.72, '#F4EBDD', 0);
      box(c, X, Y, w * 0.72, hh * 0.58, h > 0.5 ? '#1B4965' : '#9E2B25', 0);
      c.fillStyle = '#E9A23B';
      for (var i = -1; i <= 1; i++) { var dx = X + i * 0.28 * u; c.beginPath(); c.moveTo(dx, Y - 0.16 * u); c.lineTo(dx + 0.1 * u, Y); c.lineTo(dx, Y + 0.16 * u); c.lineTo(dx - 0.1 * u, Y); c.closePath(); c.fill(); }
      ell(c, X + 0.85 * u, Y, 0.16 * u, 0.4 * u, '#7A3E1C');
    },
    books: function (c, X, Y, u) {
      var cols = ['#C0392B', '#1B4965', '#2E7D4F', '#E9A23B', '#7A4F8C', '#F4EBDD'];
      for (var b = 0; b < 2; b++) {
        box(c, X - 0.35 * u + b * 0.7 * u, Y, 0.6 * u, 0.4 * u, '#8B5A2B');
        for (var k = 0; k < 7; k++) { c.fillStyle = cols[(k + b) % 6]; c.fillRect(X - 0.62 * u + b * 0.7 * u + k * 0.075 * u, Y - 0.16 * u, 0.06 * u, 0.32 * u); }
      }
    },
    pomegranate: function (c, X, Y, u) {
      box(c, X, Y, 1.0 * u, 0.5 * u, '#F4EBDD');
      for (var i = 0; i < 9; i++) ell(c, X - 0.38 * u + (i % 5) * 0.19 * u, Y - 0.1 * u + Math.floor(i / 5) * 0.2 * u, 0.08 * u, 0.08 * u, '#B5162B', 1);
      box(c, X + 0.6 * u, Y - 0.1 * u, 0.2 * u, 0.36 * u, '#B8C0CA', 1.2);
      teaGlass(c, X + 0.6 * u, Y + 0.28 * u, u);
    },
    tea: function (c, X, Y, u) {
      box(c, X, Y, 0.8 * u, 0.5 * u, '#6B3E26');
      ell(c, X - 0.15 * u, Y - 0.05 * u, 0.2 * u, 0.15 * u, '#C87533'); ell(c, X - 0.15 * u, Y - 0.22 * u, 0.12 * u, 0.09 * u, '#D98A4A');
      teaGlass(c, X + 0.22 * u, Y, u); teaGlass(c, X + 0.22 * u, Y + 0.2 * u, u);
      c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 2; var tt = performance.now() / 600;
      c.beginPath(); c.moveTo(X - 0.15 * u, Y - 0.32 * u); c.quadraticCurveTo(X - 0.05 * u + Math.sin(tt) * 4, Y - 0.5 * u, X - 0.15 * u, Y - 0.7 * u); c.stroke();
    },
  };

  function blocks(y0, y1, fn) {
    for (var y = Math.max(8, Math.floor(y0 / 6) * 6); y < Math.min(226, y1 + 6); y += 6) {
      if (y > 140 && y < 162) continue;
      fn(y);
    }
  }

  D.drawStreet = function (R, s, y0, y1) {
    var c = R.ctx, u = R.ppm;
    blocks(y0 - 2, y1, function (y) {
      [-1, 1].forEach(function (side) {
        var h = hash(y * 3.1 + side * 7.7);
        if (h < 0.3) return;
        var kind = KINDS[Math.floor(hash(y + side * 13) * KINDS.length)];
        DRAW[kind](c, R.X(side * 5.5), R.Y(y + 3), u, h);
      });
    });
    pigeons(R, s, y0, y1);
    gullShadows(R, s);
  };

  // ---------- pigeons ----------
  function pigeons(R, s, y0, y1) {
    var c = R.ctx, u = R.ppm, now = performance.now() / 1000, h = s.hero;
    blocks(y0, y1, function (y) {
      if (hash(y * 5.3) < 0.55) return;
      var key = y, st = D.pig[key] || (D.pig[key] = { fly: 0 }), cx = -3 + hash(y * 2.2) * 6, cy = y + 1.5;
      if (!st.fly && Math.hypot(h.x - cx, h.y - cy) < 3.5) { st.fly = now; }
      for (var i = 0; i < 6; i++) {
        var px = cx + (hash(y + i) - 0.5) * 1.6, py = cy + (hash(y * 2 + i) - 0.5) * 1.0, z = 0, flap = 0;
        if (st.fly) {
          var el = now - st.fly; if (el > 2.5) continue;
          var dir = hash(y + i * 3) * Math.PI * 2; px += Math.cos(dir) * el * 4; py += Math.sin(dir) * el * 4 + el * 2; z = el * 3; flap = Math.sin(el * 40);
        }
        var X = R.X(px), Y = R.Y(py);
        c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(X, Y, 0.1 * u, 0.04 * u, 0, 0, Math.PI * 2); c.fill();
        var Yb = Y - z * u * 0.6 - (st.fly ? 0 : Math.abs(Math.sin(now * 3 + i)) * 0.03 * u);
        ell(c, X, Yb - 0.06 * u, 0.1 * u, 0.065 * u, '#8D96A6', 1.2);
        ell(c, X + 0.08 * u, Yb - 0.12 * u, 0.045 * u, 0.045 * u, '#6E7787', 1);
        if (st.fly) {
          c.strokeStyle = INK; c.fillStyle = '#A9B1BF'; c.lineWidth = 1.2;
          [-1, 1].forEach(function (sd) { c.beginPath(); c.moveTo(X, Yb - 0.06 * u); c.lineTo(X + sd * 0.2 * u, Yb - 0.06 * u - flap * 0.15 * u); c.lineTo(X + sd * 0.05 * u, Yb - 0.02 * u); c.closePath(); c.fill(); c.stroke(); });
        }
      }
    });
  }

  // ---------- seagulls ----------
  function gull(i, cam) {
    var t = performance.now() / 1000, speed = 1.6 + i * 0.4, span = 26;
    var x = ((t * speed + i * 9) % span) - span / 2, y = cam.y + 4 - i * 5 + Math.sin(t * 0.7 + i) * 1.5;
    return { x: (i % 2 ? -x : x), y: y, flap: Math.sin(t * 9 + i * 2), dir: i % 2 ? -1 : 1 };
  }
  function gullShadows(R) {
    var c = R.ctx, u = R.ppm;
    for (var i = 0; i < 3; i++) {
      var g = gull(i, R.cam);
      c.fillStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); c.ellipse(R.X(g.x + 1.2), R.Y(g.y - 2.2), 0.45 * u, 0.12 * u, 0, 0, Math.PI * 2); c.fill();
    }
  }

  D.drawOverhead = function (R, s, y0, y1) {
    var c = R.ctx, u = R.ppm, i;
    blocks(y0, y1, function (y) {
      [-1, 1].forEach(function (side) {
        if (hash(y * 1.7 + side) < 0.35) return;
        var txt = SIGNS_TR[Math.floor(hash(y * 9 + side * 3) * SIGNS_TR.length)], col = SIGN_COL[Math.floor(hash(y + side * 5) * SIGN_COL.length)];
        var X = R.X(side * 5.35), Y = R.Y(y + 1.2), w = 1.5 * u, hh = 0.55 * u;
        c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(R.X(side * 7.05), Y - hh * 0.6); c.lineTo(X - side * w * 0.45, Y - hh * 0.6); c.stroke();
        c.fillStyle = col[0]; c.fillRect(X - w / 2, Y - hh / 2, w, hh); c.strokeRect(X - w / 2, Y - hh / 2, w, hh);
        c.font = 'italic 900 ' + Math.round(0.26 * u) + 'px "Avenir Next Condensed", "Arial Narrow", system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillStyle = col[1]; c.fillText(txt, X, Y + 1, w - 6);
      });
    });
    var tt = performance.now() / 1000;
    for (var ly = Math.ceil((y0 - 2) / 10) * 10; ly < y1 + 2; ly += 10) {
      if (ly < 6 || ly > 226) continue;
      var Y0 = R.Y(ly + 2.4);
      c.strokeStyle = 'rgba(20,21,31,0.8)'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(R.X(-7.2), Y0); c.quadraticCurveTo(R.X(0), Y0 + 0.9 * u, R.X(7.2), Y0); c.stroke();
      c.save(); c.globalCompositeOperation = 'lighter';
      for (i = 0; i <= 18; i++) {
        var q = i / 18, bx = R.X(-7.2 + 14.4 * q), by = Y0 + 2 * q * (1 - q) * 0.9 * u, tw = 0.75 + 0.25 * Math.sin(tt * 3 + i * 1.7 + ly);
        c.globalAlpha = 0.55 * tw; c.drawImage(glow(), bx - 0.4 * u, by - 0.4 * u, 0.8 * u, 0.8 * u); c.globalAlpha = 1;
        c.fillStyle = 'rgba(255,240,200,' + tw + ')'; c.beginPath(); c.arc(bx, by + 2, 2.4, 0, Math.PI * 2); c.fill();
      }
      c.restore();
    }
    for (i = 0; i < 3; i++) {
      var gl = gull(i, R.cam), X = R.X(gl.x), Yg = R.Y(gl.y), wsp = 0.55 * u, fl = gl.flap * 0.25 * u;
      c.fillStyle = '#F4F6F8'; c.strokeStyle = INK; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(X - wsp, Yg - fl); c.quadraticCurveTo(X - wsp * 0.4, Yg - 0.2 * u - fl * 0.5, X, Yg); c.quadraticCurveTo(X + wsp * 0.4, Yg - 0.2 * u - fl * 0.5, X + wsp, Yg - fl);
      c.quadraticCurveTo(X + wsp * 0.4, Yg - 0.05 * u, X, Yg + 0.08 * u); c.quadraticCurveTo(X - wsp * 0.4, Yg - 0.05 * u, X - wsp, Yg - fl); c.fill(); c.stroke();
      c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(X + gl.dir * 0.08 * u, Yg + 0.02 * u, 0.03 * u, 0, Math.PI * 2); c.fill();
    }
    D.gullCd -= 1 / 60;
    if (D.gullCd <= 0 && s.mode === 'play') { D.gullCd = 14 + Math.random() * 10; if (P.Sfx) P.Sfx.play('gull'); }
  };

  return D;
})();
