// Istanbul pharmacy, tea kiosk, sidewalk vendors and bridge details.
(function () {
  var H = P.Props.h, ell = H.ell, rc = H.rc, poly = H.poly, ln = H.ln, shadow = H.shadow,
    teaGlass = H.teaGlass, reg = P.Props.reg, INK = '#14151F', TAU = Math.PI * 2;
  ['eczane', 'bufe'].forEach(function (kind) {
    reg(kind, function (c, X, Y, u, opts) { P.StreetServiceArt.heal(kind, c, X, Y, u, opts || {}); });
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
