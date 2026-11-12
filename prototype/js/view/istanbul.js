// İstiklal street life (view only, no collision): sidewalk vendors and café tables, hanging Turkish shop signs,
// overhead string lights, seagulls overhead, pigeons that scatter when Arda gets close. Generic, brand-free (guardrails).
// v0.7: no gulls, gull calls or pigeons under a roof (P.Indoor); the gulls fade out as Arda goes in. Shop signs fade
// under bubbles (P.Speech.label) and never move.
P.Decor = (function () {
  var D = { pig: {}, gullCd: 6, gullA: 1, gullT: 0 }, INK = '#14151F';
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
    if (isGen(s)) { genStreet(R, s, y0, y1); gullShadows(R, s); return; }
    l1Extras(R, s, y0, y1);
    l1Street(R, s, y0, y1);
  };
  function l1Street(R, s, y0, y1) {
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
      if (P.Indoor && P.Indoor.at(s, y)) return;
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
  // Seagull visibility: 1 outdoors, 0 under a roof (P.Indoor.near), eased over about 0.2 s of real time.
  function gullFade(s) {
    var now = performance.now() / 1000, dt = Math.min(0.1, Math.max(0, now - D.gullT)), target = P.Indoor && P.Indoor.near(s) ? 0 : 1;
    D.gullT = now;
    D.gullA += (target - D.gullA) * (1 - Math.exp(-dt / 0.2));
    return D.gullA;
  }
  // World signs fade under a placed bubble (P.Speech.label); they never move.
  function signAlpha(key, X, Y, w, hh) { return P.Speech ? P.Speech.label(key, X - w / 2, Y - hh / 2, w, hh) : 1; }
  function gullShadows(R, s) {
    var c = R.ctx, u = R.ppm, a = gullFade(s), i;
    if (a < 0.02) return;
    c.save(); c.globalAlpha = a;
    for (i = 0; i < 3; i++) {
      var g = gull(i, R.cam);
      c.fillStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); c.ellipse(R.X(g.x + 1.2), R.Y(g.y - 2.2), 0.45 * u, 0.12 * u, 0, 0, Math.PI * 2); c.fill();
    }
    c.restore();
  }

  D.drawOverhead = function (R, s, y0, y1) {
    if (isGen(s)) { genOverhead(R, s, y0, y1); gullsDraw(R, s); return; }
    L1Over(R, y0, y1);
    l1Overhead(R, s, y0, y1);
  };
  function l1Overhead(R, s, y0, y1) {
    var c = R.ctx, u = R.ppm, i;
    blocks(y0, y1, function (y) {
      [-1, 1].forEach(function (side) {
        if (hash(y * 1.7 + side) < 0.35) return;
        var txt = SIGNS_TR[Math.floor(hash(y * 9 + side * 3) * SIGNS_TR.length)], col = SIGN_COL[Math.floor(hash(y + side * 5) * SIGN_COL.length)];
        var X = R.X(side * 5.35), Y = R.Y(y + 1.2), w = 1.5 * u, hh = 0.55 * u, la = signAlpha('sign' + side + ':' + y, X, Y, w, hh);
        c.save(); c.globalAlpha = la;
        c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(R.X(side * 7.05), Y - hh * 0.6); c.lineTo(X - side * w * 0.45, Y - hh * 0.6); c.stroke();
        c.fillStyle = col[0]; c.fillRect(X - w / 2, Y - hh / 2, w, hh); c.strokeRect(X - w / 2, Y - hh / 2, w, hh);
        c.font = 'italic 900 ' + Math.round(0.26 * u) + 'px "Avenir Next Condensed", "Arial Narrow", system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillStyle = col[1]; c.fillText(txt, X, Y + 1, w - 6);
        c.restore();
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
    gullsDraw(R, s);
  };
  function gullsDraw(R, s) {
    var c = R.ctx, u = R.ppm, i, a = gullFade(s);
    if (a >= 0.02) {
      c.save(); c.globalAlpha = a;
      for (i = 0; i < 3; i++) {
        var gl = gull(i, R.cam), X = R.X(gl.x), Yg = R.Y(gl.y), wsp = 0.55 * u, fl = gl.flap * 0.25 * u;
        c.fillStyle = '#F4F6F8'; c.strokeStyle = INK; c.lineWidth = 1.6;
        c.beginPath(); c.moveTo(X - wsp, Yg - fl); c.quadraticCurveTo(X - wsp * 0.4, Yg - 0.2 * u - fl * 0.5, X, Yg); c.quadraticCurveTo(X + wsp * 0.4, Yg - 0.2 * u - fl * 0.5, X + wsp, Yg - fl);
        c.quadraticCurveTo(X + wsp * 0.4, Yg - 0.05 * u, X, Yg + 0.08 * u); c.quadraticCurveTo(X - wsp * 0.4, Yg - 0.05 * u, X - wsp, Yg - fl); c.fill(); c.stroke();
        c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(X + gl.dir * 0.08 * u, Yg + 0.02 * u, 0.03 * u, 0, Math.PI * 2); c.fill();
      }
      c.restore();
    }
    D.gullCd -= 1 / 60;
    if (D.gullCd <= 0 && s.mode === 'play') { D.gullCd = 14 + Math.random() * 10; if (P.Sfx && a > 0.5) P.Sfx.play('gull'); }
  };

  // ---------- L1 enrichment: a few local props at fixed, unscripted spots (non-colliding, outside beats) ----------
  var L1_PROPS = [ ['catbox', -5.9, 3.6, { k: 1 }], ['bags', -5.4, 52, { k: 0 }], ['spill', 5.9, 77, { k: 0 }],
    ['dog', 5.6, 150, { k: 1 }], ['geranium', -5.7, 112, {}], ['phones', 5.2, 40, { k: 1 }], ['blood', -5.6, 38, { n: 6, dir: 1, k: 0 }],
    ['devrik', 5.0, 128, { k: 0 }], ['durak', -5.7, 137, {}] ];
  var L1_OVER = [ ['laundry', 0, 40, {}], ['laundry', 0, 112, { k: 2 }], ['laundry', 0, 190, { k: 4 }],
    ['cumba', -7.6, 18, {}], ['cumba', 7.6, 108, {}], ['cumba', -7.6, 176, {}] ];
  function listDraw(R, list, y0, y1) { list.forEach(function (p) { if (p[2] > y0 - 4 && p[2] < y1 + 4) P.Props.draw(p[0], R, p[1], p[2], p[3]); }); }
  function l1Extras(R, s, y0, y1) { listDraw(R, L1_PROPS, y0, y1); }
  function L1Over(R, y0, y1) { listDraw(R, L1_OVER, y0, y1); }

  // ---------- generated levels (levelIndex > 1): sidewalk props from theme weights, hashed per (level, slot) ----------
  var SLOT = 4.5, BIG = { cinar: 1, palm: 1, playground: 1, shelter: 1, kiosk: 1, iskele: 1, tower: 1 };
  function isGen(s) { return s.levelIndex > 1; }
  function pick(w, h) {
    var keys = Object.keys(w), tot = 0, i, r;
    for (i = 0; i < keys.length; i++) tot += w[keys[i]];
    r = h * tot;
    for (i = 0; i < keys.length; i++) { r -= w[keys[i]]; if (r < 0) return keys[i]; }
    return keys[keys.length - 1];
  }
  // Pigeons burst up when Arda comes within 3.5 m; the flock returns after 20 s.
  function flyFor(key, x, y, s) {
    var st = D.pig[key] || (D.pig[key] = { t: 0 }), now = performance.now() / 1000;
    if (!st.t && Math.hypot(s.hero.x - x, s.hero.y - y) < 3.5) st.t = now;
    if (st.t && now - st.t > 20) st.t = 0;
    return st.t ? now - st.t : 0;
  }
  function genStreet(R, s, y0, y1) {
    var th = P.RenderWorld.themeOf(s), seed = s.levelIndex * 131, h = s.hero, covered = !!(P.Indoor && P.Indoor.level(s));
    var props = P.Themes.propsFor(th, P.Themes.subOf(th, P.Themes.subIndex(s)));
    if (!props || !Object.keys(props).length) return;
    for (var y = Math.floor(y0 / SLOT) * SLOT; y < y1; y += SLOT) [-1, 1].forEach(function (sd) {
      if (hash(seed + y * 3.1 + sd * 7.7) < 0.4) return;
      var kind = pick(props, hash(seed + y * 5.3 + sd * 2.1)), x = sd * (BIG[kind] ? 6.2 : 5.3 + hash(y * 2.3 + sd));
      if (covered && (kind === 'gull' || kind === 'pigeon')) return;   // no birds under a roof
      var yy = y + hash(y * 4.7 + sd) * 2.5, o = { k: Math.floor(hash(y * 9.1 + sd) * 4) };
      if (kind === 'cat' || kind === 'catbox') o.alert = Math.hypot(h.x - x, h.y - yy) < 2.2;
      if (kind === 'pigeon') o.fly = flyFor(seed + ':' + y + ':' + sd, x, yy, s);
      P.Props.draw(kind, R, x, yy, o);
    });
  }
  function genOverhead(R, s, y0, y1) {
    var th = P.RenderWorld.themeOf(s), rig = th.overhead, hp = P.RenderWorld.hoodPos(s), t = performance.now() / 1000;
    for (var y = Math.ceil(y0 / 12) * 12; y < y1 && rig !== 'none'; y += 12) {
      var ry = rig === 'laundry' ? y + 3 : y;
      if (P.ArenaOverhead && P.ArenaOverhead.draw(R, s, th.id, rig, 0, ry, { v: hash(y * 0.37) })) continue;   // R1-T3: authored rig, fades under the player
      if (rig === 'strings') P.Props.draw('strings', R, 0, y, {});
      else if (rig === 'lanterns') P.Props.draw('lanterns', R, 0, y, { n: 12 });
      else if (rig === 'laundry') P.Props.draw('laundry', R, 0, y + 3, { k: Math.floor(hash(y) * 6) });
      else if (rig === 'vault') P.Props.draw('vault', R, 0, y, {});
      else if (rig === 'lamps') { P.Props.draw('lamp', R, 6.4, y, {}); P.Props.draw('lamp', R, -6.4, y + 6, {}); }
    }
    if (rig !== 'none' && P.ArenaOverhead && P.ArenaOverhead.has(th.id, 'canopy')) for (var ty = Math.ceil(y0 / 18) * 18; ty < y1; ty += 18) {   // street trees reaching over the lane edge (Ataköy)
      P.ArenaOverhead.draw(R, s, th.id, 'canopy', 0, ty + 2, { v: hash(ty * 0.11) < 0.5 ? 0 : 0.99 });
    }
    if (hp >= 5 && hp <= 17) for (var q = Math.floor(y0 / 40) * 40; q < y1; q += 40) {
      if (hash(q * 0.7) < 0.5) P.Props.draw('smoke', R, (hash(q) < 0.5 ? -1 : 1) * 8.6, q, { n: 6, a: 0.22 });
    }
    genSigns(R, th, y0, y1, t);
  }
  // Hanging shop signs from the theme's word list; a few flicker (no neon).
  function genSigns(R, th, y0, y1, t) {
    var c = R.ctx, u = R.ppm, n = th.sign.length;
    for (var y = Math.floor(y0 / 6) * 6; y < y1; y += 6) [-1, 1].forEach(function (side) {
      if (hash(y * 1.7 + side) < 0.45) return;
      var txt = th.sign[Math.floor(hash(y * 9 + side * 3) * n)], col = SIGN_COL[Math.floor(hash(y + side * 5) * SIGN_COL.length)];
      var X = R.X(side * 5.35), Y = R.Y(y + 1.2), w = 1.5 * u, hh = 0.55 * u;
      var flick = hash(y * 4.4 + side) < 0.2 && Math.sin(t * 6 + y) > 0.2 && !(P.Settings && P.Settings.reduceFlash) ? 0.25 : 1;   // about 1 flicker a second: under the 3 flashes a second limit (design-system 11)
      c.globalAlpha = flick * signAlpha('sign' + side + ':' + y, X, Y, w, hh);
      c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(R.X(side * 7.05), Y - hh * 0.6); c.lineTo(X - side * w * 0.45, Y - hh * 0.6); c.stroke();
      c.fillStyle = col[0]; c.fillRect(X - w / 2, Y - hh / 2, w, hh); c.strokeRect(X - w / 2, Y - hh / 2, w, hh);
      c.font = 'italic 900 ' + Math.round(0.26 * u) + 'px "Avenir Next Condensed", "Arial Narrow", system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = col[1]; c.fillText(txt, X, Y + 1, w - 6);
      c.globalAlpha = 1;
    });
  }

  return D;
})();
