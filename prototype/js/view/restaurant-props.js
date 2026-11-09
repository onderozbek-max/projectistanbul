// Level 1 restaurant furniture (view only, LD 6, AUDIT-7 T3-9): the döner counter with its spit and grill glow, the
// drinks fridge, four round tables with chairs, a çay tray, napkin holders and bottles. Nothing here collides: the sim
// only clamps the room (sim/world.js), so furniture is drawn through the depth queue (R.depth) and the hero walks
// behind or in front of it. Layout data is in restaurant-art.js (P.RestaurantArt.LAYOUT). Projection `pr` = {X, Y, s}.
P.RestaurantProps = (function () {
  var F = {}, INK = '#14151F', TAU = Math.PI * 2;
  var WOOD = '#7A4E2D', WOOD_D = '#5A3920', CREAM = '#E6D7B9', RIM = '#B99A6E', STEEL = '#D9D4CA', TILE_W = '#F1EEE6';

  // ---------- primitives ----------
  function rect(c, pr, x0, y0, x1, y1, fill, stroke, lw) {
    c.beginPath(); c.rect(pr.X(x0), pr.Y(y1), pr.s(x1 - x0), pr.s(y1 - y0));
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1.5; c.stroke(); }
  }
  function disc(c, pr, x, y, r, fill, stroke, lw) {
    c.beginPath(); c.arc(pr.X(x), pr.Y(y), pr.s(r), 0, TAU);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1.5; c.stroke(); }
  }
  function bar(c, pr, x0, y0, x1, y1, col, w) {
    c.beginPath(); c.moveTo(pr.X(x0), pr.Y(y0)); c.lineTo(pr.X(x1), pr.Y(y1));
    c.strokeStyle = col; c.lineWidth = pr.s(w || 0.08); c.lineCap = 'round'; c.stroke();
  }
  // Soft shadow pad under a footprint (ground layer; the caller passes the static projection).
  F.shadowRect = function (c, pr, x0, y0, x1, y1, a) {
    c.fillStyle = 'rgba(12,8,6,' + (a || 0.28) + ')';
    c.fillRect(pr.X(x0 + 0.08), pr.Y(y1 - 0.1), pr.s(x1 - x0), pr.s(y1 - y0));
  };
  F.shadowDisc = function (c, pr, x, y, r, a) {
    c.fillStyle = 'rgba(12,8,6,' + (a || 0.26) + ')';
    c.beginPath(); c.arc(pr.X(x + 0.06), pr.Y(y - 0.08), pr.s(r), 0, TAU); c.fill();
  };

  // ---------- counter with the döner spit ----------
  F.counter = function (c, pr, k, t) {
    var x0 = k.x0, x1 = k.x1, y0 = k.y0, y1 = k.y1;
    rect(c, pr, x0, y0 - 0.28, x1, y0, WOOD, INK, 2);                       // south front (visible face)
    rect(c, pr, x0, y0 - 0.28, x1, y0, null, WOOD_D, 1);
    for (var i = 0; i < 4; i++) bar(c, pr, x0 + 0.2, y0 - 0.06 - i * 0.06, x1 - 0.2, y0 - 0.06 - i * 0.06, 'rgba(40,22,12,0.25)', 0.02);
    rect(c, pr, x0, y0, x1, y1, STEEL, INK, 2);                             // worktop
    rect(c, pr, x0 + 0.1, y0 + 0.1, x1 - 0.1, y1 - 0.1, null, 'rgba(255,255,255,0.45)', 1);
    // Cutting board, tomato and onion piles, lavaş stack, cash register, plates.
    rect(c, pr, x0 + 0.25, y0 + 0.2, x0 + 1.0, y0 + 0.62, '#C99A62', INK, 1);
    disc(c, pr, x0 + 0.5, y0 + 0.45, 0.07, '#D7263D'); disc(c, pr, x0 + 0.66, y0 + 0.42, 0.07, '#E8D9C2');
    disc(c, pr, x0 + 0.85, y0 + 0.5, 0.07, '#7CB342');
    disc(c, pr, x0 + 2.2, y0 + 0.5, 0.2, '#D6A560', INK, 1.5); disc(c, pr, x0 + 2.2, y0 + 0.5, 0.12, '#E9C27A');
    rect(c, pr, x1 - 0.9, y0 + 0.2, x1 - 0.2, y0 + 0.55, '#CFC6B2', INK, 1.5);   // cash register
    rect(c, pr, x1 - 0.8, y0 + 0.28, x1 - 0.42, y0 + 0.44, '#2B6F6F');
    disc(c, pr, x1 - 1.2, y0 + 0.45, 0.13, '#FFFFFF', INK, 1);
    disc(c, pr, x1 - 1.2, y0 + 0.45, 0.07, '#C9D7DE');
    F.spit(c, pr, k.spit.x, k.spit.y, t);
  };
  // The vertical spit: meat column (top view: radial gradient), rotating sear marks, heating element with a glow.
  F.spit = function (c, pr, x, y, t) {
    var r = 0.3, g = c.createRadialGradient(pr.X(x), pr.Y(y), pr.s(0.05), pr.X(x), pr.Y(y), pr.s(r));
    g.addColorStop(0, '#8A3E1E'); g.addColorStop(0.7, '#B8572A'); g.addColorStop(1, '#E08440');
    disc(c, pr, x, y, r, g, INK, 2);
    var a0 = (t / 1400) % TAU;
    for (var i = 0; i < 4; i++) {
      var a = a0 + i * TAU / 4;
      c.beginPath(); c.arc(pr.X(x), pr.Y(y), pr.s(r * 0.7), a, a + 0.5); c.strokeStyle = 'rgba(255,214,150,0.55)';
      c.lineWidth = pr.s(0.05); c.stroke();
    }
    disc(c, pr, x, y, 0.07, '#3A1A0E');                                    // spit rod
    rect(c, pr, x + 0.36, y - 0.3, x + 0.48, y + 0.3, '#3A2A1E', INK, 1);   // heating element
    var flick = 0.7 + 0.3 * Math.sin(t / 110);
    c.save(); c.globalCompositeOperation = 'lighter';
    var gg = c.createRadialGradient(pr.X(x + 0.45), pr.Y(y), 0, pr.X(x + 0.45), pr.Y(y), pr.s(0.85));
    gg.addColorStop(0, 'rgba(255,130,40,' + (0.5 * flick).toFixed(3) + ')'); gg.addColorStop(1, 'rgba(255,90,20,0)');
    c.fillStyle = gg; c.beginPath(); c.arc(pr.X(x + 0.45), pr.Y(y), pr.s(0.85), 0, TAU); c.fill();
    c.restore();
  };

  // ---------- drinks fridge (generic: no labels, no brands) ----------
  F.fridge = function (c, pr, k, t) {
    rect(c, pr, k.x0, k.y0 - 0.3, k.x1, k.y0, '#DDE3E8', INK, 2);          // south face: glass door band (depth base = y0 - 0.3)
    rect(c, pr, k.x0 + 0.08, k.y0 - 0.26, k.x1 - 0.08, k.y0 - 0.06, '#BFEBF3', INK, 1);
    var cols = ['#3E8E5A', '#C27B2A', '#3D6FA8', '#E8E2D0', '#7A5C9E', '#3E8E5A'], w = (k.x1 - k.x0 - 0.2) / cols.length;
    cols.forEach(function (col, i) { rect(c, pr, k.x0 + 0.1 + i * w + 0.02, k.y0 - 0.24, k.x0 + 0.1 + (i + 1) * w - 0.02, k.y0 - 0.1, col); });
    rect(c, pr, k.x0, k.y0, k.x1, k.y1, '#EEF1F4', INK, 2);                 // top
    rect(c, pr, k.x0 + 0.12, k.y0 + 0.15, k.x1 - 0.12, k.y1 - 0.12, null, 'rgba(120,130,140,0.45)', 1);
    rect(c, pr, k.x1 - 0.22, k.y0 - 0.22, k.x1 - 0.12, k.y0 - 0.06, '#9AA3AD');  // handle
    var glow = 0.35 + 0.1 * Math.sin(t / 700);
    c.save(); c.globalCompositeOperation = 'lighter';
    var g = c.createRadialGradient(pr.X((k.x0 + k.x1) / 2), pr.Y(k.y0 - 0.15), 0, pr.X((k.x0 + k.x1) / 2), pr.Y(k.y0 - 0.15), pr.s(1.1));
    g.addColorStop(0, 'rgba(160,230,255,' + glow.toFixed(3) + ')'); g.addColorStop(1, 'rgba(160,230,255,0)');
    c.fillStyle = g; c.beginPath(); c.arc(pr.X((k.x0 + k.x1) / 2), pr.Y(k.y0 - 0.15), pr.s(1.1), 0, TAU); c.fill();
    c.restore();
  };

  // ---------- tables and chairs ----------
  F.chair = function (c, pr, x, y, ang) {
    var cx = x + Math.cos(ang) * 0.82, cy = y + Math.sin(ang) * 0.82, s = 0.2;
    // Seat: a rounded-ish square on the chair's centre; the backrest is a bar on the outer side.
    c.save(); c.translate(pr.X(cx), pr.Y(cy)); c.rotate(-ang);
    c.fillStyle = WOOD; c.strokeStyle = INK; c.lineWidth = 1.5;
    c.beginPath(); c.rect(-pr.s(s), -pr.s(s), pr.s(2 * s), pr.s(2 * s)); c.fill(); c.stroke();
    c.fillStyle = WOOD_D; c.beginPath(); c.rect(pr.s(s) - pr.s(0.09), -pr.s(s) - 1, pr.s(0.09), pr.s(2 * s) + 2); c.fill();
    c.restore();
  };
  F.table = function (c, pr, k) {
    disc(c, pr, k.x, k.y, 0.55, CREAM, INK, 2);
    disc(c, pr, k.x, k.y, 0.46, null, RIM, 2);
    (k.chairs || []).forEach(function (a) { F.chair(c, pr, k.x, k.y, a); });   // chairs after the top: they sit outside it
    disc(c, pr, k.x, k.y, 0.55, null, INK, 2);
    if (k.cloth) disc(c, pr, k.x, k.y, 0.42, 'rgba(160,38,46,0.16)');
    if (k.tray) F.teaTray(c, pr, k.x, k.y);
    if (k.napkins) rect(c, pr, k.x + 0.12, k.y - 0.1, k.x + 0.22, k.y + 0.08, '#FFFFFF', INK, 1);
    if (k.ketchup) { disc(c, pr, k.x - 0.2, k.y + 0.22, 0.05, '#C0392B', INK, 1); }
    if (k.pepper) { disc(c, pr, k.x - 0.26, k.y - 0.14, 0.04, '#9B9B9B', INK, 1); }
  };
  // Çay tray: a round steel tray with five tulip glasses (amber).
  F.teaTray = function (c, pr, x, y) {
    disc(c, pr, x, y, 0.3, '#C9CED3', INK, 1.5);
    disc(c, pr, x, y, 0.22, null, 'rgba(255,255,255,0.6)', 1);
    for (var i = 0; i < 5; i++) {
      var a = i * TAU / 5 + 0.3, gx = x + Math.cos(a) * 0.14, gy = y + Math.sin(a) * 0.14;
      disc(c, pr, gx, gy, 0.05, '#E9A23B', INK, 1);
      disc(c, pr, gx, gy, 0.02, '#8E3B20');
    }
  };
  // Overturned chair: lying on its side, seat and one leg bar (ground item, so the hero walks over it).
  F.overturned = function (c, pr, x, y, a) {
    c.save(); c.translate(pr.X(x), pr.Y(y)); c.rotate(-a);
    c.fillStyle = WOOD; c.strokeStyle = INK; c.lineWidth = 1.5;
    c.beginPath(); c.rect(-pr.s(0.22), -pr.s(0.2), pr.s(0.44), pr.s(0.4)); c.fill(); c.stroke();
    c.fillStyle = WOOD_D; c.beginPath(); c.rect(-pr.s(0.05), pr.s(0.2), pr.s(0.1), pr.s(0.6)); c.fill(); c.stroke();
    c.restore();
  };
  // Broken plate, and the dürüm wrap that fell with it (ground item).
  F.spill = function (c, pr, x, y) {
    var k = [[0.12, 0.05, 0.1], [-0.1, 0.12, 0.08], [0.02, -0.14, 0.09], [-0.18, -0.06, 0.06]];
    k.forEach(function (s, i) { c.beginPath(); c.moveTo(pr.X(x + s[0]), pr.Y(y + s[1])); c.lineTo(pr.X(x + s[0] + s[2]), pr.Y(y + s[1] + 0.03));
      c.lineTo(pr.X(x + s[0] + 0.02), pr.Y(y + s[1] - 0.05 - i * 0.01)); c.closePath(); c.fillStyle = '#F7F4EE'; c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke(); });
    disc(c, pr, x - 0.02, y, 0.2, null, 'rgba(255,255,255,0.7)', 1.5);
    c.beginPath(); c.ellipse(pr.X(x + 0.3), pr.Y(y - 0.3), pr.s(0.2), pr.s(0.13), 0.5, 0, TAU);   // wrap paper
    c.fillStyle = '#E8C47A'; c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
    c.beginPath(); c.ellipse(pr.X(x + 0.3), pr.Y(y - 0.3), pr.s(0.09), pr.s(0.05), 0.5, 0, TAU); c.fillStyle = '#A9572B'; c.fill();
  };

  // ---------- wall-mounted: TV and menu board (back wall band, outside the walkable room) ----------
  F.tv = function (c, pr, k, t, lang) {
    rect(c, pr, k.x0, k.y0, k.x1, k.y1, '#202431', INK, 2);
    var flick = 0.7 + 0.3 * Math.sin(t / 90) * Math.sin(t / 530);
    rect(c, pr, k.x0 + 0.06, k.y0 + 0.16, k.x1 - 0.06, k.y1 - 0.06, 'rgba(61,139,255,' + (0.55 * flick).toFixed(3) + ')');
    rect(c, pr, k.x0 + 0.06, k.y0 + 0.02, k.x1 - 0.06, k.y0 + 0.14, '#C0392B');   // ticker band
    c.fillStyle = '#FFFFFF'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = 'bold ' + Math.max(7, Math.round(pr.s(0.14))) + 'px system-ui, sans-serif';
    c.fillText(lang === 'tr' ? 'SON DAKİKA' : 'BREAKING', pr.X((k.x0 + k.x1) / 2), pr.Y(k.y0 + 0.08));
    c.fillStyle = 'rgba(255,255,255,0.35)';
    c.fillRect(pr.X(k.x0 + 0.14), pr.Y(k.y1 - 0.26), pr.s(k.x1 - k.x0 - 0.28), pr.s(0.05));
  };
  F.menu = function (c, pr, k, lang) {
    rect(c, pr, k.x0, k.y0, k.x1, k.y1, '#20352B', '#8A6A4E', 4);            // dark green board, wooden frame
    c.textAlign = 'left'; c.textBaseline = 'middle';
    var rows = lang === 'tr'
      ? [['DÜRÜM', 'Tavuk · Adana · Kaşarlı'], ['ÇAY', 'İnce belli'], ['AYRAN', 'Gazoz · Su']]
      : [['DÜRÜM', 'Chicken · Adana · Cheese'], ['TEA', 'Tulip glass'], ['AYRAN', 'Gazoz · Water']];
    var rowH = (k.y1 - k.y0) / (rows.length + 0.6);
    rows.forEach(function (r, i) {
      var yy = k.y1 - rowH * (i + 0.9);
      c.fillStyle = '#F4EBDD'; c.font = 'bold ' + Math.max(8, Math.round(pr.s(rowH * 0.42))) + 'px system-ui, sans-serif';
      c.fillText(r[0], pr.X(k.x0 + 0.12), pr.Y(yy));
      c.fillStyle = '#E9C27A'; c.font = Math.max(7, Math.round(pr.s(rowH * 0.34))) + 'px system-ui, sans-serif';
      c.fillText(r[1], pr.X(k.x0 + 0.12) + pr.s(0.95), pr.Y(yy));
    });
  };

  F.rect = rect; F.disc = disc; F.bar = bar;
  return F;
})();
