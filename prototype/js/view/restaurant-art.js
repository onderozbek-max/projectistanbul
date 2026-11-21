// Level 1 restaurant art pass (AUDIT-7 T3-9; view only): "Lezzet Dürüm Salonu", the first room the player sees.
// Static layer (tiled floor, tiled and plaster walls, shadows, light pools, menu board, shopfront sign, floor litter)
// is painted once per zoom and language into a cached canvas. Dynamic layer per frame: the tram passing the window,
// the TV's breaking-news glow, the open or closed door. Furniture goes through the depth queue (depthProps), so the hero
// walks behind or in front of it. Walls sit outside the sim's walkable clamp (x -9.6..-2.4, y -9.6..-0.4), so the play
// space stays clear. Layout is data here; drawing helpers are in restaurant-props.js.
P.RestaurantArt = (function () {
  var A = {}, PR = P.RestaurantProps, INK = '#14151F', TAU = Math.PI * 2;
  // Interior x -10..-2, y -10..0. The entrance wall is projected from y=0, with a door gap at x -6..-4.
  A.LAYOUT = {
    box: { x0: -10.9, x1: -1.2, y0: -11.1, y1: 1.2 },
    room: { x0: -10, x1: -2, y0: -10, y1: 0 },
    door: { x0: P.CFG.level.door.xMin, x1: P.CFG.level.door.xMax },
    neighbor: { x0: -10.7, x1: -7, y: 2.8, end: 9.8, repeatY: 11.1 },
    window: { x0: -3.81, x1: -2.51, y0: 0.19, y1: 0.46 },
    tv: { x0: -9.5, x1: -7.7, y0: -10.9, y1: -10.2 },
    menu: { x0: -7.4, x1: -5.4, y0: -10.9, y1: -10.1 },
    sign: { x0: -6.82, x1: -4.46, y0: 0.72, y1: 1.04 },
    counter: { x0: -7.75, x1: -3.36, y0: -9.82, y1: -8.31, spit: { x: -5.92, y: -8.94 }, knife: { x: -5.25, y: -9.55 } },
    fridge: { x0: -9.6, x1: -8.3, y0: -1.8, y1: -1.1 },
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
  var L = A.LAYOUT, cache = null, cacheKey = '', outsideCache = null, outsideScale = 0;
  var floor = null;
  A.illustrated = !!(P.StreetArt && P.StreetArt.current());
  var HEIGHT_X = -P.CFG.view.istiklalWall.depth, HEIGHT_Y = P.CFG.view.istiklalWall.rise;
  var STONE = '#B8AA95', STONE_TOP = '#D9C9AD', STONE_BASE = '#766856';
  var neighborBounds = { x0: L.neighbor.x0 + HEIGHT_X - 0.12, x1: L.neighbor.x1 + 0.25, y0: 0, y1: L.neighbor.repeatY };

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
  // Glazed wall tiles with a white diamond in each cell (Iznik-style, generic).
  function wallTiles(c, pr, x0, y0, x1, y1, cell) {
    PR.rect(c, pr, x0, y0, x1, y1, A.illustrated ? '#345248' : '#2F6F9F');
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
  function shopSign(c, pr) {
    var s = L.sign;
    PR.rect(c, pr, s.x0 + 0.035, s.y0 - 0.042, s.x1 + 0.035, s.y1 - 0.03, 'rgba(39,27,21,0.38)');
    PR.rect(c, pr, s.x0, s.y0, s.x1, s.y1, '#24483C', '#494034', pr.s(0.055));
    PR.rect(c, pr, s.x0 + 0.065, s.y0 + 0.044, s.x1 - 0.065, s.y1 - 0.044, null, '#A6926E', pr.s(0.025));
    var txt = P.upper(P.t('world.restaurant.name')), px = pr.s(0.198);
    c.font = 'bold ' + Math.round(px) + 'px "CM Comic Relief", "Comic Relief", "Comic Sans MS", sans-serif';
    while (c.measureText(txt).width > pr.s(s.x1 - s.x0 - 0.3) && px > 6) { px -= 1; c.font = 'bold ' + Math.round(px) + 'px "CM Comic Relief", "Comic Relief", "Comic Sans MS", sans-serif'; }
    c.fillStyle = '#F4EBDD'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(txt, pr.X((s.x0 + s.x1) / 2), pr.Y((s.y0 + s.y1) / 2));
  }
  // Draw a wall from its ground line. Height uses the same uphill-left projection around both buildings.
  function wall(c, pr, x, y, dx, dy, span, h, shade, detail) {
    var u = pr.s(1);
    c.save();
    c.translate(pr.X(x), pr.Y(y));
    c.transform(u * dx, -u * dy, u * HEIGHT_X, -u * HEIGHT_Y, 0, 0);
    c.fillStyle = shade; c.fillRect(0, 0, span, h);
    c.fillStyle = STONE_BASE; c.fillRect(0, 0, span, 0.08);
    c.fillStyle = STONE_TOP; c.fillRect(0, h - 0.055, span, 0.055);
    c.fillStyle = 'rgba(83,64,51,0.25)'; c.fillRect(0, h - 0.11, span, 0.025);
    for (var i = 0.56; i < span; i += 0.56) c.fillRect(i, 0.08, 0.024, 0.125);
    if (detail) detail(c, span, h);
    c.restore();
  }

  function cutawayFace(c, pr, x0, x1, windows) {
    PR.rect(c, pr, x0, -0.165, x1, 0, 'rgba(55,40,31,0.26)');
    wall(c, pr, x0, 0, 1, 0, x1 - x0, 0.74, STONE, function (g, width) {
      g.fillStyle = '#264A50'; g.fillRect(0.08, 0.09, width - 0.16, 0.11);
      g.fillStyle = '#8E7E68'; g.fillRect(0.09, 0.22, 0.09, 0.43);
      g.fillRect(width - 0.18, 0.22, 0.09, 0.43);
      if (windows) {
        g.fillStyle = '#435A51'; g.fillRect(0.38, 0.27, width - 0.76, 0.31);
        g.fillStyle = '#6D8881'; g.fillRect(0.45, 0.32, width - 0.90, 0.21);
        g.fillStyle = '#4B6356'; g.fillRect(width / 2 - 0.026, 0.27, 0.052, 0.31);
      }
    });
    // The visible end of this low section shows the thickness of the cut wall at the doorway.
    wall(c, pr, x1, 0, 0, -1, 0.17, 0.74, '#8A7763');
  }

  function entrance(c, pr) {
    var d = A.LAYOUT.door, r = A.LAYOUT.room;
    cutawayFace(c, pr, r.x0, d.x0, true);
    cutawayFace(c, pr, d.x1, r.x1, false);
    PR.rect(c, pr, d.x0, -0.47, d.x1, 0.06, '#A39884');
    PR.rect(c, pr, d.x0, -0.15, d.x1, 0.04, '#C8BEAB', '#796B5C', pr.s(0.027));
    PR.rect(c, pr, d.x0 + 0.14, -0.47, d.x1 - 0.14, -0.19, '#615B4D', '#514236', pr.s(0.022));
    PR.rect(c, pr, d.x0 + 0.22, -0.40, d.x1 - 0.22, -0.26, '#817862');
    wall(c, pr, d.x0 - 0.14, 0, 1, 0, 0.14, 0.86, '#9B896E');
    wall(c, pr, d.x1, 0, 1, 0, 0.14, 0.86, '#9B896E');
    wall(c, pr, d.x1, 0, 0, 1, 0.18, 0.74, '#8A7763');
    // A lintel joins the projected tops of both wall sections and carries the sign.
    PR.rect(c, pr, -6.76, 0.61, -4.54, 0.78, '#8D7B63', '#675944', pr.s(0.037));
    shopSign(c, pr);
  }

  function shopWindows(c, span, h) {
    var bays = Math.max(2, Math.round(span / 1.75)), w = span / bays;
    for (var i = 0; i < bays; i++) {
      var x = i * w + 0.20, y = 0.23, size = w - 0.4;
      c.fillStyle = '#73614E'; c.fillRect(x - 0.055, y - 0.035, size + 0.11, h - 0.36);
      c.fillStyle = '#263E3B'; c.fillRect(x, y, size, h - 0.43);
      c.fillStyle = '#557370'; c.fillRect(x + 0.06, y + 0.055, size - 0.12, h - 0.52);
      c.fillStyle = '#75908A'; c.fillRect(x + 0.06, y + 0.27, size - 0.12, 0.08);
      c.fillStyle = '#304D43'; c.fillRect(x + size * 0.5 - 0.027, y, 0.054, h - 0.43);
      c.fillStyle = '#D3B890'; c.fillRect(x - 0.10, y - 0.04, size + 0.20, 0.055);
    }
  }

  function roof(c, pr, n) {
    var a = n.x0 + HEIGHT_X, b = n.x1 + HEIGHT_X, y = n.y + HEIGHT_Y, end = n.end + HEIGHT_Y;
    PR.rect(c, pr, a, y, b, end, '#514F52', '#373338', pr.s(0.05));
    // Slate courses and staggered joints are drawn in roof space, at the scale of the paved ground.
    for (var j = 0; y + j * 0.36 < end - 0.17; j++) {
      var row = y + 0.14 + j * 0.36;
      PR.rect(c, pr, a + 0.09, row, b - 0.09, row + 0.03, '#3F3D41');
      for (var x = a + 0.25 + (j % 2) * 0.25; x < b - 0.15; x += 0.51) {
        PR.rect(c, pr, x, row, x + 0.024, Math.min(row + 0.36, end - 0.08), '#696365');
      }
    }
    PR.rect(c, pr, a, y, b, y + 0.12, '#80736D', '#40383A', pr.s(0.036));
    PR.rect(c, pr, b - 0.10, y, b, end, '#766965');
    PR.rect(c, pr, a + 0.98, y + 1.42, a + 1.62, y + 1.99, '#373338');
    PR.rect(c, pr, a + 0.87, y + 1.56, a + 1.53, y + 2.06, '#9C7F6C', '#635248', pr.s(0.05));
    PR.rect(c, pr, a + 1.00, y + 1.67, a + 1.39, y + 1.93, '#51464A');
  }

  function outside(c, pr) {
    var n = L.neighbor;
    PR.rect(c, pr, n.x0, n.y - 0.16, n.x1 + 0.16, n.end, 'rgba(31,29,27,0.22)');
    wall(c, pr, n.x1, n.y, 0, 1, n.end - n.y, 1, '#A18E77', shopWindows);
    wall(c, pr, n.x0, n.y, 1, 0, n.x1 - n.x0, 1, STONE, shopWindows);
    roof(c, pr, n);
    // Raised bed in the paved setback.
    PR.shadowRect(c, pr, -9.89, 0.57, -8.8, 1.53, 0.26);
    PR.rect(c, pr, -9.91, 0.57, -8.86, 1.53, STONE_BASE, '#55483E', pr.s(0.04));
    PR.rect(c, pr, -9.98, 0.73, -8.94, 1.61, STONE, '#65564E', pr.s(0.04));
    PR.rect(c, pr, -9.87, 0.81, -9.05, 1.54, '#4D4938');
    for (var i = 0; i < 5; i++) {
      var px = -9.47 + Math.cos(i * 1.26) * 0.18, py = 1.19 + Math.sin(i * 1.26) * 0.15;
      PR.disc(c, pr, px, py, 0.19, i % 2 ? '#425B47' : '#607957', '#3B4D3C', pr.s(0.022));
    }
  }

  A.outside = function (R) {
    var scale = artScale(R);
    if (!outsideCache || outsideScale !== scale) {
      outsideCache = bake(outsideCache, neighborBounds, scale, outside);
      outsideScale = scale;
    }
    drawBake(R, neighborBounds, outsideCache);
  };

  function paintStatic(c, pr, lang) {
    var r = L.room;
    if (floor) paintFloor(c, pr, r);
    else if (A.illustrated) PR.rect(c, pr, r.x0, r.y0, r.x1, r.y1, '#795940');
    else tileField(c, pr, r.x0, r.y0, r.x1, r.y1, 0.6, '#AE784E', '#A5724D', 'rgba(60,38,27,0.23)');
    warmPool(c, pr, -5.1, -.42, 3.6, .24);
    warmPool(c, pr, -5.2, -8.8, 3.2, .25);
    L.lamps.slice(0, 4).forEach(function (p) { warmPool(c, pr, p[0], p[1], 1.45, 0.15); });
    L.tables.forEach(function (k) { PR.shadowDisc(c, pr, k.x, k.y - 0.02, 0.55, 0.22); });
    PR.shadowRect(c, pr, L.counter.x0, L.counter.y0 - 0.28, L.counter.x1, L.counter.y1, 0.3);
    PR.shadowRect(c, pr, L.fridge.x0, L.fridge.y0 - 0.3, L.fridge.x1, L.fridge.y1, 0.26);
    // Walls: left and back are outside the room; right too. Top is inside with the door gap.
    wallTiles(c, pr, -10.5, -10.9, -1.5, -10.0, 0.22);                          // back wall: tiles (TV and menu hang on it)
    wallTiles(c, pr, -10.5, -10.0, -10.0, -0.60, 0.22);                         // left wall: tiled dado along the room
    PR.rect(c, pr, -10.5, -0.6, -10.0, 0, '#BEB4A2', '#4E4843', pr.s(0.04));      // exposed entrance corner
    plaster(c, pr, -2.0, -10.0, -1.5, 0.0);
    PR.rect(c, pr, -1.76, -10.0, -1.5, 0, '#BAAD9A');
    entrance(c, pr);
    PR.menu(c, pr, L.menu, lang);
    // Floor litter (ground items, under the hero): an overturned chair, a broken plate and a dropped dürüm wrap.
    PR.spill(c, pr, L.spill.x, L.spill.y);
    // Room outline: the walkable edge reads as a wall.
    c.strokeStyle = INK; c.lineWidth = 3;
    c.beginPath(); c.moveTo(pr.X(r.x0), pr.Y(r.y1)); c.lineTo(pr.X(r.x0), pr.Y(r.y0)); c.lineTo(pr.X(r.x1), pr.Y(r.y0)); c.lineTo(pr.X(r.x1), pr.Y(r.y1));
    c.lineTo(pr.X(L.door.x1), pr.Y(r.y1)); c.moveTo(pr.X(L.door.x0), pr.Y(r.y1)); c.lineTo(pr.X(r.x0), pr.Y(r.y1)); c.stroke();
  }

  function paintFloor(c, pr, r) {
    var w = floor.naturalWidth, h = floor.naturalHeight, strip = Math.round(h * .054), depth = (r.y1 - r.y0) * strip / h;
    var y = pr.Y(r.y1), inset = pr.s(depth);
    c.drawImage(floor, 0, strip, w, h - strip, pr.X(r.x0), y + inset, pr.s(r.x1 - r.x0), pr.s(r.y1 - r.y0) - inset);
    // The painted threshold is aligned with the actual collision opening.
    var src = [0, Math.round(w * .35), Math.round(w * .65), w], edges = [r.x0, L.door.x0, L.door.x1, r.x1];
    for (var i = 0; i < 3; i++) {
      c.drawImage(floor, src[i], 0, src[i + 1] - src[i], strip, pr.X(edges[i]), y, pr.s(edges[i + 1] - edges[i]), inset);
    }
    var shade = c.createLinearGradient(0, y, 0, pr.Y(r.y0));
    shade.addColorStop(0, 'rgba(44,51,40,.14)'); shade.addColorStop(.35, 'rgba(44,51,40,0)');
    shade.addColorStop(.77, 'rgba(83,47,26,0)'); shade.addColorStop(1, 'rgba(62,38,31,.38)');
    PR.rect(c, pr, r.x0, r.y0, r.x1, r.y1, shade);
  }

  function artScale(R) { return Math.max(2, Math.round(R.ppm * (R.dpr || 1) / 2) * 2); }

  function bake(canvas, b, scale, paint, lang) {
    canvas = canvas || document.createElement('canvas');
    canvas.width = Math.ceil((b.x1 - b.x0) * scale);
    canvas.height = Math.ceil((b.y1 - b.y0) * scale);
    var pr = { X: function (x) { return (x - b.x0) * scale; }, Y: function (y) { return (b.y1 - y) * scale; },
      s: function (m) { return m * scale; } };
    paint(canvas.getContext('2d'), pr, lang);
    return canvas;
  }

  function drawBake(R, b, canvas) {
    R.ctx.drawImage(canvas, R.X(b.x0), R.Y(b.y1), (b.x1 - b.x0) * R.ppm, (b.y1 - b.y0) * R.ppm);
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
    PR.rect(c, pr, tx, w.y0 + 0.055, tx + 2.6, w.y1 - 0.08, '#C0392B', INK, 1.5);             // tram body, red and cream, generic
    PR.rect(c, pr, tx + 0.2, w.y0 + 0.10, tx + 2.4, w.y1 - 0.10, '#F4EBDD');
    for (var i = 0; i < 4; i++) PR.rect(c, pr, tx + 0.3 + i * 0.52, w.y0 + 0.105, tx + 0.6 + i * 0.52, w.y1 - 0.105, '#FFD98A');
    c.restore();
    // Frame and mullions over the glass.
    PR.rect(c, pr, w.x0, w.y0, w.x1, w.y1, null, '#514538', pr.s(0.072));
    c.strokeStyle = '#514538'; c.lineWidth = pr.s(0.048);
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
    wall(c, pr, L.door.x0, 0, 1, 0, L.door.x1 - L.door.x0, 0.61, '#73543A', function (g, width) {
      g.fillStyle = '#A57B52'; g.fillRect(0.13, 0.12, width - 0.26, 0.34);
      g.fillStyle = '#614832'; g.fillRect(width / 2 - 0.025, 0.08, 0.05, 0.49);
      g.fillStyle = '#D9AF64'; g.fillRect(width / 2 + 0.09, 0.27, 0.055, 0.079);
    });
  }
  function dynamic(R, s) {
    var c = R.ctx, t = performance.now(), pr = { X: R.X, Y: R.Y, s: function (m) { return m * R.ppm; } };
    tvGlow(c, pr, t);
    PR.overturned(c, pr, L.overturned.x, L.overturned.y, L.overturned.a);
    window_(c, pr, t);
    door(c, pr, !!(s.props && s.props.doorOpen));
    // The TV itself: a flickering screen with a red ticker. Drawn last in the ground pass.
    PR.tv(c, pr, L.tv, t, P.lang);
  }

  // ---------- public ----------
  // Ground pass: the static cutaway sits over the street at the threshold.
  A.draw = function (R, s) {
    floor = A.illustrated ? P.StreetArt.image('restaurant-floor') : null;
    var B = L.box, scale = artScale(R), key = scale + '|' + P.lang + '|' + (floor && floor.naturalWidth);
    if (key !== cacheKey || !cache) {
      cache = bake(cache, B, scale, paintStatic, P.lang);
      cacheKey = key;
    }
    drawBake(R, B, cache);
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
  A.reset = function () { cache = outsideCache = null; cacheKey = ''; };
  return A;
})();
