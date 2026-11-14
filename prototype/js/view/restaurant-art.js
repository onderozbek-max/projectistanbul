// Level 1 restaurant art pass (AUDIT-7 T3-9; view only): "Lezzet Dürüm Salonu", the first room the player sees.
// Static layer (tiled floor, tiled and plaster walls, shadows, light pools, menu board, shopfront sign, floor litter)
// is painted once per zoom and language into a cached canvas. Dynamic layer per frame: the tram passing the window,
// the TV's breaking-news glow, the open or closed door. Furniture goes through the depth queue (depthProps), so the hero
// walks behind or in front of it. Walls sit outside the sim's walkable clamp (x -9.6..-2.4, y -9.6..-0.4), so the play
// space stays clear. Layout is data here; drawing helpers are in restaurant-props.js.
P.RestaurantArt = (function () {
  var A = {}, PR = P.RestaurantProps, INK = '#14151F', TAU = Math.PI * 2;
  // World layout, metres. Interior x -10..-2, y -10..0. Left, back and right walls are outside the interior; the top
  // wall is inside (y -0.55..0) with the door gap x -6..-4 and the window x -3.6..-2.6.
  A.LAYOUT = {
    box: { x0: -10.9, x1: -1.2, y0: -11.1, y1: 1.2 },
    room: { x0: -10, x1: -2, y0: -10, y1: 0 },
    door: { x0: -6, x1: -4 },
    window: { x0: -3.6, x1: -2.6, y0: -0.5, y1: -0.1 },
    tv: { x0: -9.5, x1: -7.7, y0: -10.9, y1: -10.2 },
    menu: { x0: -7.4, x1: -5.4, y0: -10.9, y1: -10.1 },
    sign: { x0: -6.8, x1: -3.2, y0: 0.3, y1: 0.95 },
    counter: { x0: -6.8, x1: -3.7, y0: -9.9, y1: -8.6, spit: { x: -5.3, y: -9.1 } },   // 1.2 m west: clear of the ult button (HUD)
    fridge: { x0: -9.6, x1: -8.3, y0: -9.2, y1: -8.5 },
    tables: [
      { x: -8.0, y: -6.2, chairs: [0.6, 3.7], tray: true, napkins: true, ketchup: true },
      { x: -4.6, y: -6.9, chairs: [1.4, 4.6], cloth: true, napkins: true, pepper: true },
      { x: -8.3, y: -3.0, chairs: [2.4, 5.5], napkins: true, cloth: true },
      { x: -3.2, y: -3.0, chairs: [0.2, 3.3], cloth: true, ketchup: true }
    ],
    lamps: [ [-8.0, -6.2], [-4.6, -6.9], [-8.3, -3.0], [-3.2, -3.0], [-6.0, -8.8] ],
    overturned: { x: -7.4, y: -4.4, a: 1.25 },
    spill: { x: -7.0, y: -5.3 }
  };
  var L = A.LAYOUT, cache = null, cacheKey = '';

  // ---------- static layer ----------
  function tileField(c, pr, x0, y0, x1, y1, size, colA, colB, grout) {
    var i, j, x, y, nx = Math.ceil((x1 - x0) / size), ny = Math.ceil((y1 - y0) / size);
    for (i = 0; i < nx; i++) for (j = 0; j < ny; j++) {
      x = x0 + i * size; y = y0 + j * size;
      var xe = Math.min(x + size, x1), ye = Math.min(y + size, y1);
      c.fillStyle = (i + j) % 2 ? colB : colA;
      c.fillRect(pr.X(x), pr.Y(ye), pr.s(xe - x), pr.s(ye - y));
      if (grout) { c.strokeStyle = grout; c.lineWidth = 1; c.strokeRect(pr.X(x) + 0.5, pr.Y(ye) + 0.5, pr.s(xe - x) - 1, pr.s(ye - y) - 1); }
    }
  }
  // Blue wall tiles with a white diamond in each cell (Iznik-style, generic).
  function blueTiles(c, pr, x0, y0, x1, y1, cell) {
    PR.rect(c, pr, x0, y0, x1, y1, '#2F6F9F');
    var i, j, cx, cy;
    c.fillStyle = '#E9F1F5';
    for (i = 0; i * cell < x1 - x0; i++) for (j = 0; j * cell < y1 - y0; j++) {
      cx = x0 + (i + 0.5) * cell; cy = y0 + (j + 0.5) * cell;
      if (cx > x1 || cy > y1) continue;
      c.beginPath(); c.moveTo(pr.X(cx), pr.Y(cy + cell * 0.22)); c.lineTo(pr.X(cx + cell * 0.22), pr.Y(cy));
      c.lineTo(pr.X(cx), pr.Y(cy - cell * 0.22)); c.lineTo(pr.X(cx - cell * 0.22), pr.Y(cy)); c.closePath(); c.fill();
    }
  }
  function plaster(c, pr, x0, y0, x1, y1) { PR.rect(c, pr, x0, y0, x1, y1, '#EADCC2'); }
  function warmPool(c, pr, x, y, r, a) {
    var g = c.createRadialGradient(pr.X(x), pr.Y(y), 0, pr.X(x), pr.Y(y), pr.s(r));
    g.addColorStop(0, 'rgba(255,214,140,' + a + ')'); g.addColorStop(1, 'rgba(255,214,140,0)');
    c.fillStyle = g; c.beginPath(); c.arc(pr.X(x), pr.Y(y), pr.s(r), 0, TAU); c.fill();
  }
  function shopSign(c, pr, lang) {
    var s = L.sign;
    PR.rect(c, pr, s.x0, s.y0, s.x1, s.y1, '#1F4D3A', '#8A6A4E', 4);
    var txt = 'LEZZET DÜRÜM SALONU', px = pr.s(0.26);
    c.font = 'bold ' + Math.round(px) + 'px "CM Comic Relief", "Comic Relief", "Comic Sans MS", sans-serif';
    while (c.measureText(txt).width > pr.s(s.x1 - s.x0 - 0.3) && px > 6) { px -= 1; c.font = 'bold ' + Math.round(px) + 'px "CM Comic Relief", "Comic Relief", "Comic Sans MS", sans-serif'; }
    c.fillStyle = '#F4EBDD'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(txt, pr.X((s.x0 + s.x1) / 2), pr.Y((s.y0 + s.y1) / 2));
  }
  function paintStatic(c, pr, lang) {
    var r = L.room;
    tileField(c, pr, r.x0, r.y0, r.x1, r.y1, 0.6, '#B8703F', '#A8643A', 'rgba(60,30,18,0.35)');
    // Light pools first, then shadows, so furniture sits in a warm room.
    L.lamps.forEach(function (p) { warmPool(c, pr, p[0], p[1], 2.1, 0.22); });
    L.tables.forEach(function (k) { PR.shadowDisc(c, pr, k.x, k.y - 0.02, 0.55, 0.22); });
    PR.shadowRect(c, pr, L.counter.x0, L.counter.y0 - 0.28, L.counter.x1, L.counter.y1, 0.3);
    PR.shadowRect(c, pr, L.fridge.x0, L.fridge.y0 - 0.3, L.fridge.x1, L.fridge.y1, 0.26);
    // Walls: left and back are outside the room; right too. Top is inside with the door gap.
    blueTiles(c, pr, -10.5, -10.9, -1.5, -10.0, 0.22);                          // back wall: tiles (TV and menu hang on it)
    blueTiles(c, pr, -10.5, -10.0, -10.0, -0.6, 0.22);                          // left wall: tiled dado along the room
    plaster(c, pr, -2.0, -10.0, -1.5, 0.0);                                      // right wall outside
    plaster(c, pr, -10.0, -0.55, -6.25, 0.0);
    plaster(c, pr, -3.75, -0.55, -2.0, 0.0);
    PR.rect(c, pr, -10.0, -0.12, -6.25, 0.0, '#2F6F9F');                         // tiled top band strip, either side of the door
    PR.rect(c, pr, -3.75, -0.12, -2.0, 0.0, '#2F6F9F');
    PR.rect(c, pr, -6.25, -0.55, -6.0, 0.05, '#6B4226', INK, 1.5);               // door posts
    PR.rect(c, pr, -4.0, -0.55, -3.75, 0.05, '#6B4226', INK, 1.5);
    PR.rect(c, pr, -6.25, -0.6, -3.75, -0.5, '#6B4226', INK, 1.5);             // lintel
    shopSign(c, pr, lang);
    PR.menu(c, pr, L.menu, lang);
    // Floor litter (ground items, under the hero): an overturned chair, a broken plate and a dropped dürüm wrap.
    PR.overturned(c, pr, L.overturned.x, L.overturned.y, L.overturned.a);
    PR.spill(c, pr, L.spill.x, L.spill.y);
    // Room outline: the walkable edge reads as a wall.
    c.strokeStyle = INK; c.lineWidth = 3;
    c.beginPath(); c.moveTo(pr.X(r.x0), pr.Y(r.y1)); c.lineTo(pr.X(r.x0), pr.Y(r.y0)); c.lineTo(pr.X(r.x1), pr.Y(r.y0)); c.lineTo(pr.X(r.x1), pr.Y(r.y1));
    c.lineTo(pr.X(L.door.x1), pr.Y(r.y1)); c.moveTo(pr.X(L.door.x0), pr.Y(r.y1)); c.lineTo(pr.X(r.x0), pr.Y(r.y1)); c.stroke();
  }

  function buildCache(ppm, dpr, lang) {
    var B = L.box, S = ppm * dpr, w = Math.ceil((B.x1 - B.x0) * S), h = Math.ceil((B.y1 - B.y0) * S);
    if (!cache) cache = document.createElement('canvas');
    cache.width = w; cache.height = h;
    var c = cache.getContext('2d');
    var pr = { X: function (x) { return (x - B.x0) * S; }, Y: function (y) { return (B.y1 - y) * S; }, s: function (m) { return m * S; } };
    paintStatic(c, pr, lang);
    cacheKey = ppm.toFixed(2) + '|' + dpr + '|' + lang;
  }

  // ---------- per-frame layers ----------
  // The tram passes the window in a 9 s loop, one way, clipped to the glass. A quiet street glow sits behind it.
  function window_(c, pr, t) {
    var w = L.window, p = (t % 9000) / 9000, tx = -7 + p * 9.5, cx = (w.x0 + w.x1) / 2;
    c.save();
    c.beginPath(); c.rect(pr.X(w.x0), pr.Y(w.y1), pr.s(w.x1 - w.x0), pr.s(w.y1 - w.y0)); c.clip();
    var g = c.createLinearGradient(0, pr.Y(w.y1), 0, pr.Y(w.y0));
    g.addColorStop(0, '#F2B39B'); g.addColorStop(1, '#2B3B57');
    c.fillStyle = g; c.fillRect(pr.X(w.x0), pr.Y(w.y1), pr.s(w.x1 - w.x0), pr.s(w.y1 - w.y0));
    PR.rect(c, pr, tx, -0.44, tx + 2.6, -0.2, '#C0392B', INK, 1.5);             // tram body, red and cream, generic
    PR.rect(c, pr, tx + 0.2, -0.38, tx + 2.4, -0.27, '#F4EBDD');
    for (var i = 0; i < 4; i++) PR.rect(c, pr, tx + 0.3 + i * 0.52, -0.37, tx + 0.6 + i * 0.52, -0.28, '#FFD98A');
    c.restore();
    // Frame and mullions over the glass.
    PR.rect(c, pr, w.x0, w.y0, w.x1, w.y1, null, '#6B4226', 3);
    c.strokeStyle = '#6B4226'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(pr.X(cx), pr.Y(w.y1)); c.lineTo(pr.X(cx), pr.Y(w.y0)); c.stroke();
  }
  function tvGlow(c, pr, t) {
    var k = L.tv, flick = 0.8 + 0.2 * Math.sin(t / 130) * Math.sin(t / 610);
    var g = c.createRadialGradient(pr.X(-8.6), pr.Y(-9.6), 0, pr.X(-8.6), pr.Y(-9.6), pr.s(2.6));
    g.addColorStop(0, 'rgba(61,139,255,' + (0.16 * flick).toFixed(3) + ')'); g.addColorStop(1, 'rgba(61,139,255,0)');
    c.save(); c.globalCompositeOperation = 'lighter';
    c.fillStyle = g; c.beginPath(); c.arc(pr.X(-8.6), pr.Y(-9.6), pr.s(2.6), 0, TAU); c.fill(); c.restore();
  }
  function door(c, pr, open) {
    if (open) return;
    PR.rect(c, pr, L.door.x0, -0.12, L.door.x1, 0.03, '#8B5A2B', INK, 2);       // closed door slab across the gap
    PR.rect(c, pr, L.door.x0 + 0.2, -0.08, L.door.x1 - 0.2, 0.0, 'rgba(190,230,255,0.45)');
  }
  function dynamic(R, s) {
    var c = R.ctx, t = performance.now(), pr = { X: R.X, Y: R.Y, s: function (m) { return m * R.ppm; } };
    tvGlow(c, pr, t);
    window_(c, pr, t);
    door(c, pr, !!(s.props && s.props.doorOpen));
    // The TV itself: a flickering screen with a red ticker. Drawn last in the ground pass.
    PR.tv(c, pr, L.tv, t, P.lang);
  }

  // ---------- public ----------
  // Ground pass (render.js calls this before the street): cached static layer, then the dynamic layer.
  A.draw = function (R, s) {
    var c = R.ctx, B = L.box, key = R.ppm.toFixed(2) + '|' + (R.dpr || 1) + '|' + P.lang;
    if (key !== cacheKey || !cache) buildCache(R.ppm, R.dpr || 1, P.lang);
    c.drawImage(cache, R.X(B.x0), R.Y(B.y1), (B.x1 - B.x0) * R.ppm, (B.y1 - B.y0) * R.ppm);
    dynamic(R, s);
  };
  // Depth pass (render.js, props stage): counter with spit and steam, fridge, four tables with chairs. Each item's
  // base is its south edge, so the hero walks behind or in front of furniture as in the rest of the room.
  A.depthProps = function (R, s) {
    var c = R.ctx, t = performance.now(), pr = { X: R.X, Y: R.Y, s: function (m) { return m * R.ppm; } }, k = L.counter;
    R.depth(k.y0 - 0.28, function () {
      PR.counter(c, pr, k, t);
      steam(c, pr, k.spit, t);
    });
    R.depth(L.fridge.y0 - 0.3, function () { PR.fridge(c, pr, L.fridge, t); });
    L.tables.forEach(function (tb) {
      R.depth(tb.y - 0.55, function () { PR.table(c, pr, tb); });
    });
  };
  // Three rising wisps off the spit (view only).
  function steam(c, pr, sp, t) {
    var i, ph, x, y, a;
    c.save(); c.globalCompositeOperation = 'source-over';
    for (i = 0; i < 3; i++) {
      ph = ((t / 2200) + i / 3) % 1; x = sp.x + 0.14 * Math.sin(ph * 6 + i); y = sp.y + 0.2 + ph * 1.5; a = (1 - ph) * 0.22;
      c.fillStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')';
      c.beginPath(); c.arc(pr.X(x), pr.Y(y), pr.s(0.1 + 0.12 * ph), 0, TAU); c.fill();
    }
    c.restore();
  }
  A.reset = function () { cache = null; cacheKey = ''; };
  return A;
})();
