// Static environment drawing: street, facades, doors, restaurant, props (LD 3, 6; gameplay-peak.svg palette).
P.RenderWorld = (function () {
  var W = {}, L = function () { return P.CFG.level; };
  var SHOPS = [ { side: 1, y: 22, name: 'Pera Kitap' }, { side: -1, y: 44, name: 'Telefon Tamir' },
    { side: 1, y: 58, name: 'Çiçek Optik' }, { side: -1, y: 98, name: 'Pastane' },
    { side: 1, y: 122, name: 'Beyoğlu Plak' }, { side: -1, y: 196, name: 'Çiçekçi' } ];

  function rect(R, x0, y0, x1, y1, fill, stroke, lw) {
    var c = R.ctx, X = R.X(x0), Y = R.Y(y1), w = (x1 - x0) * R.ppm, h = (y1 - y0) * R.ppm;
    if (fill) { c.fillStyle = fill; c.fillRect(X, Y, w, h); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 2; c.strokeRect(X, Y, w, h); }
  }
  W.rect = rect;

  var cobble = { ppm: 0, pat: null };
  function cobblePattern(R) {
    var k = Math.round(R.ppm * 10) / 10;
    if (cobble.ppm === k && cobble.pat) return cobble.pat;
    var T = Math.max(8, Math.round(2 * k)), cv = document.createElement('canvas'), c = cv.getContext('2d');
    cv.width = cv.height = T;
    c.fillStyle = '#23252D'; c.fillRect(0, 0, T, T);
    var n = 5, st = T / n, seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var row = 0; row < n; row++) {
      var off = (row % 2) * st / 2;
      for (var col = -1; col < n + 1; col++) {
        var x = col * st + off, y = row * st, l = 58 + Math.floor(rnd() * 18);
        c.fillStyle = 'rgb(' + (l - 4) + ',' + l + ',' + (l + 8) + ')';
        c.beginPath(); if (c.roundRect) c.roundRect(x + 1, y + 1, st - 2, st - 2, st * 0.3); else c.rect(x + 1, y + 1, st - 2, st - 2); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(x + 2, y + 2, st - 5, 1.2);
      }
    }
    cobble.ppm = k; cobble.pat = R.ctx.createPattern(cv, 'repeat'); cobble.T = T;
    return cobble.pat;
  }

  function hash(n) { var x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); }

  W.drawGround = function (R, s, y0, y1) {
    ambience(s);
    if (!isL1(s)) { genGround(R, s, y0, y1); return; }
    var c = R.ctx, lv = L(), cor = lv.corridor, i;
    var ya = Math.max(0, y0), yb = Math.min(cor.yMax + 4, y1);
    var pat = cobblePattern(R);
    if (pat.setTransform && window.DOMMatrix) pat.setTransform(new DOMMatrix().translate(R.X(0), R.Y(0)).scale(2 * R.ppm / cobble.T));
    c.fillStyle = pat; c.fillRect(R.X(cor.xMin), R.Y(yb), (cor.xMax - cor.xMin) * R.ppm, (yb - ya) * R.ppm);
    rect(R, -1.6, ya, 1.6, yb, 'rgba(20,21,31,0.10)');
    lv.rails.forEach(function (rx) {
      c.strokeStyle = '#3E4148'; c.lineWidth = Math.max(3, 0.12 * R.ppm); c.beginPath(); c.moveTo(R.X(rx), R.Y(ya)); c.lineTo(R.X(rx), R.Y(yb)); c.stroke();
      c.strokeStyle = '#B9BEC6'; c.lineWidth = Math.max(1, 0.04 * R.ppm); c.stroke();
    });
    [-1, 1].forEach(function (sd) {
      var a0 = sd > 0 ? 4.6 : -7, a1 = sd > 0 ? 7 : -4.6;
      rect(R, a0, ya, a1, yb, '#4B4A50');
      c.strokeStyle = 'rgba(20,21,31,0.55)'; c.lineWidth = 1;
      c.beginPath();
      for (var sy = Math.ceil(ya / 1.2) * 1.2; sy < yb; sy += 1.2) { c.moveTo(R.X(a0), R.Y(sy)); c.lineTo(R.X(a1), R.Y(sy)); }
      c.moveTo(R.X((a0 + a1) / 2), R.Y(ya)); c.lineTo(R.X((a0 + a1) / 2), R.Y(yb));
      c.stroke();
      var cx = sd > 0 ? 4.6 : -4.6;
      c.strokeStyle = '#8A8F98'; c.lineWidth = Math.max(3, 0.12 * R.ppm); c.beginPath(); c.moveTo(R.X(cx), R.Y(ya)); c.lineTo(R.X(cx), R.Y(yb)); c.stroke();
      c.strokeStyle = '#14151F'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(R.X(cx - sd * 0.08), R.Y(ya)); c.lineTo(R.X(cx - sd * 0.08), R.Y(yb)); c.stroke();
    });
    for (var ly = Math.floor(ya); ly < yb; ly++) {
      var hv = hash(ly);
      if (hv < 0.06) {
        c.fillStyle = 'rgba(' + P.goreRGB(0) + ',0.45)'; c.beginPath(); c.ellipse(R.X(-4 + hash(ly + 9) * 8), R.Y(ly), (0.4 + hash(ly + 3)) * R.ppm, 0.25 * R.ppm, hash(ly + 5) * 3, 0, Math.PI * 2); c.fill();
      }
      if (hv > 0.7) {
        var lx = -6 + hash(ly + 0.5) * 12;
        c.save(); c.translate(R.X(lx), R.Y(ly)); c.rotate(hv * 6);
        c.fillStyle = hv > 0.93 ? '#C0392B' : '#E8E1D2'; c.fillRect(-0.12 * R.ppm, -0.08 * R.ppm, 0.24 * R.ppm, 0.16 * R.ppm); c.restore();
      }
    }
    for (i = -1; i <= 1; i += 2) drawFacade(R, i, y0, y1);
    P.World.doors().forEach(function (d) { if (d.y > y0 - 2 && d.y < y1 + 2) drawDoor(R, d); });
    drawShutter(R, s);
    for (var py = Math.ceil(y0 / 12) * 12; py < y1; py += 12) if (py > 4 && py < 228) { lamp(R, -4.85, py); lamp(R, 4.85, py + 6); }
  };

  function lamp(R, x, y) {
    var c = R.ctx, u = R.ppm;
    c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.ellipse(R.X(x), R.Y(y), 0.2 * u, 0.08 * u, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#14151F'; c.lineWidth = 0.14 * u; c.beginPath(); c.moveTo(R.X(x), R.Y(y)); c.lineTo(R.X(x), R.Y(y + 1.6)); c.stroke();
    c.fillStyle = '#FFE2A8'; c.strokeStyle = '#14151F'; c.lineWidth = 2;
    c.beginPath(); c.arc(R.X(x), R.Y(y + 1.7), 0.16 * u, 0, Math.PI * 2); c.fill(); c.stroke();
  }

  W.drawLights = function (R, s, y0, y1) {
    if (!isL1(s)) { genLights(R, s, y0, y1); return; }
    var c = R.ctx, u = R.ppm;
    c.save(); c.globalCompositeOperation = 'lighter';
    for (var py = Math.ceil((y0 - 6) / 12) * 12; py < y1 + 6; py += 12) {
      if (py <= 4 || py >= 228) continue;
      [[-4.85, py], [4.85, py + 6]].forEach(function (l) {
        var X = R.X(l[0]), Y = R.Y(l[1] + 0.6), g = c.createRadialGradient(X, Y, 0, X, Y, 3.6 * u);
        g.addColorStop(0, 'rgba(255,180,100,0.34)'); g.addColorStop(0.5, 'rgba(255,160,80,0.10)'); g.addColorStop(1, 'rgba(255,190,110,0)');
        c.fillStyle = g; c.fillRect(X - 3.6 * u, Y - 3.6 * u, 7.2 * u, 7.2 * u);
      });
    }
    c.restore();
  };

  var AWN = [['#C0392B', '#F4EBDD'], ['#1B4965', '#F4EBDD'], ['#2E7D4F', '#F4EBDD'], ['#E9A23B', '#3A2A1E'], ['#7A4F8C', '#F4EBDD']];
  function drawFacade(R, side, y0, y1) {
    var c = R.ctx, u = R.ppm, x0 = side > 0 ? 7 : -9.6, x1 = side > 0 ? 9.6 : -7, ys = Math.max(-0.2, y0), ye = Math.min(232, y1);
    rect(R, x0, ys, x1, ye, '#4A3E3A');
    for (var y = Math.max(6, Math.floor(ys / 6) * 6); y < ye; y += 6) {
      var h = hash(y * side + 3), aw = AWN[Math.floor(h * AWN.length)];
      rect(R, side > 0 ? 7.9 : -9.6, y + 0.3, side > 0 ? 9.6 : -7.9, y + 5.7, ['#8E7258', '#80605F', '#64788A', '#6E7F67', '#9C8A6E'][Math.floor(hash(y * 7 + side) * 5)], '#14151F', 2);
      var lit = hash(y + side * 11) > 0.35;
      rect(R, side > 0 ? 7.15 : -7.9, y + 0.8, side > 0 ? 7.9 : -7.15, y + 5.2, lit ? 'rgba(255,200,120,0.55)' : 'rgba(40,46,60,0.9)', '#14151F', 2);
      if (lit) rect(R, side > 0 ? 7.15 : -7.9, y + 3.6, side > 0 ? 7.9 : -7.15, y + 5.2, 'rgba(255,240,200,0.25)');
      for (var k = 0; k < 6; k++) {
        var ky = y + 0.4 + k * 0.88;
        rect(R, side > 0 ? 6.4 : -7, ky, side > 0 ? 7 : -6.4, ky + 0.88, k % 2 ? aw[1] : aw[0]);
      }
      c.strokeStyle = '#14151F'; c.lineWidth = 2;
      c.strokeRect(R.X(side > 0 ? 6.4 : -7), R.Y(y + 5.68), 0.6 * u, 5.28 * u);
      rect(R, side > 0 ? 6.25 : -6.4, y + 0.4, side > 0 ? 6.4 : -6.25, y + 5.68, 'rgba(0,0,0,0.25)');
    }
    c.font = 'italic 800 ' + Math.round(0.5 * u) + 'px "Avenir Next Condensed", "Arial Narrow", system-ui, sans-serif';
    SHOPS.forEach(function (sh) {
      if (sh.side !== side || sh.y < y0 - 4 || sh.y > y1 + 4) return;
      c.save(); c.translate(R.X(side > 0 ? 8.75 : -8.75), R.Y(sh.y)); c.rotate(side > 0 ? Math.PI / 2 : -Math.PI / 2);
      var w = c.measureText(sh.name).width + 14;
      c.fillStyle = '#14151F'; c.fillRect(-w / 2, -0.38 * u, w, 0.76 * u);
      c.fillStyle = '#FFD166'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(sh.name, 0, 0); c.restore();
    });
  }

  function drawDoor(R, d) {
    var x0 = d.side > 0 ? 7 : -8.33, x1 = d.side > 0 ? 8.33 : -7;
    rect(R, x0, d.y - 1, x1, d.y + 1, '#2A2C31', '#14151F', 2);
    var b = P.Fx.bursts.filter(function (q) { return q.x === d.x && q.y === d.y; })[0];
    if (b) rect(R, x0, d.y - 1, x1, d.y + 1, 'rgba(255,77,46,' + (0.5 * b.t / b.T) + ')');
  }

  function drawShutter(R, s) {
    var sh = L().shutter, open = s.props.shutter;
    rect(R, sh.xMin, sh.yMin, sh.xMax, sh.yMax, '#2A2C31');
    rect(R, sh.xMin, sh.yMin + (sh.yMax - sh.yMin) * open, sh.xMin + 0.35, sh.yMax, '#B8B8B8', '#3A3A3A', 1);
    if (open > 0 && open < 1) rect(R, sh.xMin - 0.2, sh.yMin, sh.xMin - 0.05, sh.yMin + (sh.yMax - sh.yMin) * open, '#E9A23B');
    if (s.props.shutterOpen) rect(R, sh.xMin + 0.4, sh.yMin + 0.4, sh.xMax - 0.2, sh.yMax - 0.4, 'rgba(255,209,102,0.35)');
  }

  W.drawRestaurant = function (R, s) {
    var c = R.ctx, rm = L().room, d = L().door;
    rect(R, rm.xMin, rm.yMin, rm.xMax, rm.yMax, '#6B4F3A');
    c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 1;
    for (var x = rm.xMin; x < rm.xMax; x += 1) { c.beginPath(); c.moveTo(R.X(x), R.Y(rm.yMin)); c.lineTo(R.X(x), R.Y(rm.yMax)); c.stroke(); }
    rect(R, -5.2, -9.8, -2.2, -8.9, '#3A2A1E', '#14151F', 2);
    [[-7.2, -6.2], [-4.4, -6.8], [-8.4, -3.2], [-3.8, -2.4]].forEach(function (t) {
      c.fillStyle = '#C9B79C'; c.strokeStyle = '#14151F'; c.lineWidth = 2;
      c.beginPath(); c.arc(R.X(t[0]), R.Y(t[1]), 0.55 * R.ppm, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillStyle = '#B5651D'; c.beginPath(); c.arc(R.X(t[0] + 0.15), R.Y(t[1] + 0.1), 0.12 * R.ppm, 0, Math.PI * 2); c.fill();
    });
    var flick = 0.55 + 0.25 * Math.sin(performance.now() / 180);
    rect(R, -9.95, -4.2, -9.7, -2.2, 'rgba(61,139,255,' + flick + ')', '#14151F', 2);
    c.lineWidth = Math.max(3, 0.25 * R.ppm); c.strokeStyle = '#14151F';
    c.beginPath();
    c.moveTo(R.X(rm.xMin), R.Y(rm.yMin)); c.lineTo(R.X(rm.xMin), R.Y(rm.yMax)); c.lineTo(R.X(d.xMin), R.Y(rm.yMax));
    c.moveTo(R.X(d.xMax), R.Y(rm.yMax)); c.lineTo(R.X(rm.xMax), R.Y(rm.yMax)); c.lineTo(R.X(rm.xMax), R.Y(rm.yMin)); c.lineTo(R.X(rm.xMin), R.Y(rm.yMin));
    c.stroke();
    if (!s.props.doorOpen) rect(R, d.xMin, -0.15, d.xMax, 0.15, '#8B5A2B', '#14151F', 2);
    c.save(); c.translate(R.X(-6), R.Y(0.75)); c.fillStyle = '#E9A23B'; c.font = 'bold ' + Math.round(0.45 * R.ppm) + 'px system-ui';
    c.textAlign = 'center'; c.fillText('Lezzet Dürüm Salonu', 0, 0); c.restore();
  };

  W.drawProps = function (R, s) {
    if (!isL1(s)) { genProps(R, s); return; }
    var c = R.ctx, lv = L(), t = performance.now() / 1000;
    c.fillStyle = '#3A3E45'; c.strokeStyle = '#14151F'; c.lineWidth = 2;
    c.beginPath(); c.arc(R.X(lv.manhole.x), R.Y(lv.manhole.y), 0.55 * R.ppm, 0, Math.PI * 2); c.fill(); c.stroke();
    if (!s.dir.flags.cat || s.dir.bubbles.length) {
      c.fillStyle = '#E9A23B'; c.beginPath(); c.ellipse(R.X(lv.cat.x), R.Y(lv.cat.y), 0.35 * R.ppm, 0.2 * R.ppm, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    }
    s.props.carts.forEach(function (k) {
      if (!k.alive) { rect(R, k.x - 0.7, k.y - 0.4, k.x + 0.7, k.y + 0.4, 'rgba(20,21,31,0.35)'); return; }
      var col = k.flash > 0 ? '#FFFFFF' : (k.kind === 'simit' ? '#C0392B' : '#3A2A1E');
      rect(R, k.x - 0.9, k.y - 0.6, k.x + 0.9, k.y + 0.6, col, '#14151F', 2);
      if (k.kind === 'simit') rect(R, k.x - 0.7, k.y - 0.1, k.x + 0.7, k.y + 0.5, 'rgba(255,255,255,0.45)', '#14151F', 1);
      else { c.fillStyle = 'rgba(255,120,40,' + (0.6 + 0.3 * Math.sin(t * 8)) + ')'; c.beginPath(); c.arc(R.X(k.x), R.Y(k.y + 0.1), 0.3 * R.ppm, 0, Math.PI * 2); c.fill(); }
    });
    s.props.canisters.forEach(function (k) {
      if (!k.alive) return;
      rect(R, k.x - 0.28, k.y - 0.43, k.x + 0.28, k.y + 0.43, k.flash > 0 ? '#FFFFFF' : '#C0392B', '#14151F', 2);
      rect(R, k.x - 0.12, k.y + 0.43, k.x + 0.12, k.y + 0.6, '#14151F');
      c.fillStyle = '#14151F'; c.font = 'bold ' + Math.round(0.28 * R.ppm) + 'px system-ui'; c.textAlign = 'center';
      c.fillText(P.lang === 'tr' ? 'TÜP' : 'GAS', R.X(k.x), R.Y(k.y - 0.75));
    });
  };

  W.drawTram = function (R, s) {
    var tr = L().tram, h = s.hero;
    var beside = Math.abs(h.y - (tr.yMin + tr.yMax) / 2) < 8 && Math.abs(h.x) < 5;
    R.ctx.globalAlpha = beside ? 0.3 : 1;
    rect(R, tr.xMin, tr.yMin, tr.xMax, tr.yMax, '#C0392B', '#14151F', 3);
    rect(R, tr.xMin + 0.25, tr.yMin + 0.4, tr.xMax - 0.25, tr.yMax - 0.4, '#F4EBDD', '#14151F', 1.5);
    for (var y = tr.yMin + 1; y < tr.yMax - 0.5; y += 1.6) rect(R, tr.xMin + 0.5, y, tr.xMax - 0.5, y + 0.9, '#C0392B');
    R.ctx.globalAlpha = 1;
  };

  W.drawScaffold = function (R, s) {
    var c = R.ctx, y = L().scaffoldY;
    if (!s.props.scaffoldDown) {
      c.globalAlpha = 0.55;
      rect(R, -7, y - 2.5, 7, y + 0.5, null, '#6E6E6E', 3);
      c.globalAlpha = 1;
      return;
    }
    rect(R, -7, y - 0.5, 7, y + 1.2, '#6E6E6E', '#3A3A3A', 2);
    c.strokeStyle = '#3A3A3A'; c.lineWidth = 4;
    for (var x = -7; x < 7; x += 1.2) { c.beginPath(); c.moveTo(R.X(x), R.Y(y - 0.5)); c.lineTo(R.X(x + 0.9), R.Y(y + 1.2)); c.stroke(); }
  };

  // ---------- generated levels (levelIndex > 1): theme ground, sides, water, blocks, landmarks, exit ----------
  // gate/arena landmarks from E2 are covered by the exit gate and the boss arena, so they are not drawn as landmarks.
  var CROSS = { gateArch: 1, vault: 1, exitGate: 1 }, SKIP_LM = { gate: 1, arena: 1 }, ambTheme = null, ferryCycle = {};
  function isL1(s) { return !s.levelIndex || s.levelIndex === 1; }
  function themeOf(s) { return P.Themes.get(s.theme || (s.levelInfo && s.levelInfo.hood && s.levelInfo.hood.theme) || 'istiklal'); }
  function hoodPos(s) {
    var li = s.levelInfo;
    if (li && li.hoodIndex !== undefined) return li.hoodIndex + ((li.stage || 1) - 1) / 5;
    return Math.max(0, ((s.levelIndex || 1) - 1) / 5);
  }
  function ambience(s) {
    var id = isL1(s) ? 'istiklal' : themeOf(s).id;
    if (id !== ambTheme) { ambTheme = id; if (P.Sfx && P.Sfx.ambience) P.Sfx.ambience(id); }
  }
  // Tile record for a theme role, pre-rendered per ppm step (P.Themes.tile). Its pattern is created once.
  function pattern(R, th, role) {
    var t = P.Themes.tile(th, role, Math.max(8, Math.round(R.ppm / 4) * 4));
    if (t && !t.pat) t.pat = R.ctx.createPattern(t.cv, 'repeat');
    return t;
  }
  // Fill world x0..x1 by y0..y1 with tile t, anchored at world (ox, 0); sx = -1 mirrors the tile on the left.
  function fillTile(R, t, x0, x1, y0, y1, ox, sx) {
    var c = R.ctx, m = R.ppm / t.k;
    if (t.pat.setTransform && window.DOMMatrix) t.pat.setTransform(new DOMMatrix().translate(R.X(ox), R.Y(0)).scale(sx * m, m));
    c.fillStyle = t.pat; c.fillRect(R.X(Math.min(x0, x1)), R.Y(y1), Math.abs(x1 - x0) * R.ppm, (y1 - y0) * R.ppm);
  }
  function darkFill(R, x0, x1, y0, y1, col) {
    R.ctx.fillStyle = col; R.ctx.fillRect(R.X(Math.min(x0, x1)), R.Y(y1), Math.abs(x1 - x0) * R.ppm, (y1 - y0) * R.ppm);
  }
  function genGround(R, s, y0, y1) {
    var th = themeOf(s), ya = y0 - 1, yb = y1 + 1, g = pattern(R, th, 'ground'), w = pattern(R, th, 'walk');
    if (g) fillTile(R, g, -4.6, 4.6, ya, yb, 0, 1);
    [-1, 1].forEach(function (sd) {
      if (w) fillTile(R, w, sd * 4.6, sd * 7, ya, yb, sd * 4.6, sd);
      sideGround(R, th, sd, ya, yb);
      kerb(R, sd, ya, yb, th);
    });
    if (th.tracks) tramRails(R, ya, yb);
  }
  function sideGround(R, th, sd, ya, yb) {
    var kind = sd > 0 ? th.R : th.L, t = pattern(R, th, sd > 0 ? 'R' : 'L');
    if (kind === 'water') return water(R, th, sd, ya, yb);
    if (kind === 'facade') {
      if (t) fillTile(R, t, sd * 6.2, sd * 9.6, ya, yb, sd * 6.2, sd);
      return darkFill(R, sd * 9.6, sd * 16, ya, yb, '#2A2C31');
    }
    if (t) fillTile(R, t, sd * 7, sd * (7 + t.w), ya, yb, sd * 7, sd);
    darkFill(R, sd * (7 + (t ? t.w : 0)), sd * 16, ya, yb, kind === 'grass' ? '#3F4A36' : '#2A2C31');
  }
  function water(R, th, sd, ya, yb) {
    var c = R.ctx, u = R.ppm, t = performance.now() / 1000, xa = sd > 0 ? 7 : -16, xb = sd > 0 ? 16 : -7, i;
    darkFill(R, xa, xb, ya, yb, th.wat);
    c.strokeStyle = 'rgba(190,220,230,0.2)'; c.lineWidth = 1.2;
    for (var wy = Math.floor(ya / 1.5) * 1.5; wy < yb; wy += 1.5) {
      c.beginPath();
      for (i = 0; i <= 8; i++) {
        var wx = xa + (xb - xa) * i / 8, yy = wy + 0.12 * Math.sin(t * 1.4 + wx * 1.3 + wy * 0.7);
        if (i) c.lineTo(R.X(wx), R.Y(yy)); else c.moveTo(R.X(wx), R.Y(yy));
      }
      c.stroke();
    }
    c.fillStyle = 'rgba(255,220,160,0.14)';
    for (i = 0; i < 4; i++) {
      var ry = ya + ((i * 13 + Math.floor(t * 0.5)) % 10);
      c.fillRect(R.X(sd * (7.4 + i * 0.2)), R.Y(ry + 1.4), 0.2 * u, 1.6 * u);
    }
  }
  function kerb(R, sd, ya, yb, th) {
    var c = R.ctx, u = R.ppm, X = R.X(sd * 4.6);
    c.strokeStyle = '#14151F'; c.lineWidth = 3; c.beginPath(); c.moveTo(X, R.Y(ya)); c.lineTo(X, R.Y(yb)); c.stroke();
    c.strokeStyle = '#8A8F98'; c.lineWidth = Math.max(1.5, 0.08 * u); c.beginPath(); c.moveTo(X - sd * 0.05 * u, R.Y(ya)); c.lineTo(X - sd * 0.05 * u, R.Y(yb)); c.stroke();
    if (th.rail && (sd > 0 ? th.R : th.L) === 'water') {
      var rx = R.X(sd * 6.9);
      c.strokeStyle = '#14151F'; c.lineWidth = Math.max(2, 0.08 * u); c.beginPath(); c.moveTo(rx, R.Y(ya)); c.lineTo(rx, R.Y(yb)); c.stroke();
      c.fillStyle = '#4E5560';
      for (var py = Math.ceil(ya / 1.2) * 1.2; py < yb; py += 1.2) c.fillRect(rx - 0.04 * u, R.Y(py) - 0.5 * u, 0.08 * u, 0.5 * u);
    }
  }
  function tramRails(R, ya, yb) {
    var c = R.ctx, u = R.ppm;
    [-0.7, 0.7].forEach(function (rx) {
      c.strokeStyle = '#3E4148'; c.lineWidth = Math.max(3, 0.12 * u); c.beginPath(); c.moveTo(R.X(rx), R.Y(ya)); c.lineTo(R.X(rx), R.Y(yb)); c.stroke();
      c.strokeStyle = '#B9BEC6'; c.lineWidth = Math.max(1, 0.04 * u); c.stroke();
    });
  }
  // Water-side craft: slotted boats plus one ferry that sails past on a timer (horn at each pass).
  function waterProps(R, th, cy, half, t) {
    var kinds = th.wprops.filter(function (k) { return k !== 'ferry'; }), span = 2 * half + 40;
    [-1, 1].forEach(function (sd) {
      if ((sd > 0 ? th.R : th.L) !== 'water') return;
      if (th.wprops.indexOf('ferry') >= 0) ferryPass(R, sd, cy, half, t, span, sd > 0 ? 0 : span / 2);
      if (!kinds.length) return;
      for (var y = Math.floor((cy - half) / 9) * 9; y < cy + half; y += 9) {
        var h = hash(y * 1.7 + sd * 3.1);
        if (h < 0.45) continue;
        P.Props.draw(kinds[Math.floor(hash(y * 5.3 + sd) * kinds.length)], R, sd * (8 + hash(y + 2) * 1.2), y + hash(y * 2.9) * 3, { k: Math.floor(h * 4) });
      }
    });
  }
  function ferryPass(R, sd, cy, half, t, span, ph) {
    var p = (t * 2.2 + ph) % span, cyc = Math.floor((t * 2.2 + ph) / span);
    if (ferryCycle[sd] !== cyc) { ferryCycle[sd] = cyc; if (P.Sfx && P.Sfx.play) P.Sfx.play('ferryHorn', 4000); }
    P.Props.draw('ferry', R, sd * 8.5, cy - half - 20 + p, { horn: p < 1.2 });
  }
  function genProps(R, s) {
    var th = themeOf(s), cy = R.cam.y, half = P.viewHalfH(R.cam.w), g = s.geo || {}, t = performance.now() / 1000;
    waterProps(R, th, cy, half, t);
    (g.blocks || []).filter(function (b) { return Math.abs(b.y - cy) < half + 3; })
      .sort(function (a, b) { return b.y - a.y; })
      .forEach(function (b) {
        var car = b.kind === 'car' || b.kind === 'taxi' || b.kind === 'dolmus';
        P.Props.draw(b.kind, R, b.x, b.y, { w: b.w, h: b.h, k: 0, alarm: car && hash(b.y * 3.7 + b.x) < 0.4 });
      });
    (g.landmarks || []).forEach(function (lm, i) {
      if (SKIP_LM[lm.kind] || Math.abs(lm.y - cy) > half + 6 || !P.Props.has(lm.kind)) return;
      var sd = lm.side ? lm.side : (hash(lm.y * 0.37 + i) < 0.5 ? -1 : 1);
      P.Props.draw(lm.kind, R, CROSS[lm.kind] ? 0 : sd * 5.9, lm.y, { style: th.exit, open: true, k: i, span: 9.2 });
    });
    if (typeof g.exitY === 'number' && Math.abs(g.exitY - cy) < half + 6) P.Props.draw('exitGate', R, 0, g.exitY, { style: th.exit, open: !!(s.props.shutterOpen || g.exitOpen) });
  }
  function genLights(R, s, y0, y1) {
    var c = R.ctx, th = themeOf(s), t = performance.now() / 1000, hp = hoodPos(s), u = R.ppm, i;
    c.save(); c.globalCompositeOperation = 'lighter';
    for (var y = Math.ceil((y0 - 3) / 6) * 6; y < y1 + 3 && th.shop > 0; y += 6) {
      [-1, 1].forEach(function (sd) {
        if ((sd > 0 ? th.R : th.L) === 'facade' && hash(y * 3.3 + sd * 7) < th.shop * 0.6) P.Props.h.glow(c, R.X(sd * 7.4), R.Y(y + 3.5), 1.8 * u, 0.14);
      });
    }
    if (hp >= 4 && hp <= 17) for (i = 0; i < 14; i++) {
      var ey = y0 + ((hash(i * 3.1) * (y1 - y0) + t * (0.6 + hash(i)) * 1.5) % (y1 - y0)), ex = Math.sin(t * 1.3 + i * 2.2) * 3.5;
      c.fillStyle = 'rgba(255,150,70,' + (0.5 + 0.5 * Math.sin(t * 6 + i)).toFixed(2) + ')';
      c.beginPath(); c.arc(R.X(ex), R.Y(ey), 0.05 * u, 0, Math.PI * 2); c.fill();
    }
    c.restore();
    if (th.fog && hp >= 6) for (i = 0; i < 4; i++) {
      c.fillStyle = 'rgba(170,182,198,0.07)'; c.beginPath();
      c.ellipse(R.X(Math.sin(t * 0.05 + i * 2.1) * 3), R.Y(y0 + ((i * 7.3 + t * 0.6) % (y1 - y0))), 5 * u, 2.5 * u, 0, 0, Math.PI * 2); c.fill();
    }
  }
  W.themeOf = themeOf; W.hoodPos = hoodPos;
  W.screenLight = function (s) { return P.Themes.tint(hoodPos(s)); };
  W.vignette = function (s) { return P.Themes.vignette(hoodPos(s)); };

  return W;
})();
