// Layout zones for generated levels (AUDIT-6 B2): zone floors and the lx_* block painters. The sim decides where they
// go (js/sim/layouts.js, numbers in js/config-layouts.js). P.LayoutsFx.ground runs from istanbul-landmarks.js L.draw,
// after the street ground, so each zone floor covers the corridor; solids are drawn by the props pass as usual.
// Painters register into P.Props (kinds lx_*); contract as istanbul-props.js: fn(c, X, Y, s, o), s = px per metre.
P.LayoutsFx = (function () {
  var H = P.Props.h, INK = '#14151F', LINE = 'rgba(0,0,0,0.13)';
  var FLOOR = { plaza: '#CDBFA6', market: '#B59A78', chicane: '#A39C8F', waterfront: '#B8AD96', bridge: '#8D877C', arena: '#7C7467' };
  var STEP = { plaza: 3, market: 2, chicane: 2.5, waterfront: 6, bridge: 1.5, arena: 4 };
  var AWN = ['#B5401D', '#2E6E8E', '#C9A227', '#2E7D4F'];

  // Paving lines across a zone: plaza and arena grids, market and chicane cobbles, bridge planks, waterfront quay joints.
  function lines(R, z, a, b, x0, x1) {
    var c = R.ctx, step = STEP[z.kind] || 3, y, x;
    for (y = Math.ceil(a / step) * step; y < b; y += step) H.ln(c, R.X(x0), R.Y(y), R.X(x1), R.Y(y), LINE, 1);
    if (z.kind === 'plaza' || z.kind === 'arena') {
      for (x = -6; x <= 6; x += 3) H.ln(c, R.X(x), R.Y(a), R.X(x), R.Y(b), LINE, 1);
    }
    if (z.kind === 'arena') {   // the clear centre lane the boss room keeps open
      var lane = P.CFG.layouts.arena.lane;
      c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(R.X(-lane), R.Y(b), 2 * lane * R.ppm, (b - a) * R.ppm);
    }
  }

  // Floor for every zone that overlaps the visible window [y0, y1].
  function ground(R, s, y0, y1) {
    var G = s && s.geo, c = R.ctx;
    if (!G || !G.zones) return;
    G.zones.forEach(function (z) {
      if (z.y1 < y0 || z.y0 > y1) return;
      var a = Math.max(z.y0, y0), b = Math.min(z.y1, y1), x0 = G.xMin, x1 = G.xMax;
      c.fillStyle = FLOOR[z.kind] || FLOOR.plaza;
      c.fillRect(R.X(x0), R.Y(b), (x1 - x0) * R.ppm, (b - a) * R.ppm);
      lines(R, z, a, b, x0, x1);
    });
  }

  // lx_pillar: stone column with a capital (plaza, arena cover).
  function pillar(c, X, Y, s, o) {
    var w = (o.w || 1.2) * s, d = (o.h || 1.2) * s, hg = 1.0 * s;
    H.shadow(c, X, Y, w * 0.7, d * 0.5);
    H.box(c, X, Y, w, d, hg, '#E3DACB', '#9B9385');
    H.box(c, X, Y - hg, w * 1.2, d * 1.2, 0.12 * s, '#F3EDE0', '#B9B0A0');
  }

  // lx_stall: market stall with a striped awning on its top face (k picks the awning colour).
  function stall(c, X, Y, s, o) {
    var w = (o.w || 1.8) * s, d = (o.h || 1.6) * s, hg = 0.9 * s, k = (o.k || 0) % AWN.length, i, n = 3;
    H.shadow(c, X, Y, w * 0.6, d * 0.5);
    H.box(c, X, Y, w, d, hg, '#E8DCC6', '#8A6A4A');
    for (i = 0; i < n; i++) H.rc(c, X - w / 2 + (i + 0.5) * w / n, Y - d / 2 - hg + d * 0.22, w / n, d * 0.36, i % 2 ? '#F4EBDD' : AWN[k], 1);
  }

  // lx_wall: shop frontage along the chicane, with dark shop windows and coloured fascia strips.
  function wall(c, X, Y, s, o) {
    var w = (o.w || 11.4) * s, d = (o.h || 1.2) * s, hg = 1.0 * s, n = Math.max(2, Math.round(w / (2.5 * s))), i, wx;
    H.box(c, X, Y, w, d, hg, '#D8CFC0', '#A99E8C');
    for (i = 0; i < n; i++) {
      wx = X - w / 2 + (i + 0.5) * w / n;
      H.rc(c, wx, Y + d / 2 - hg / 2, w / n * 0.5, hg * 0.5, '#3B3A40', 1);
      H.rc(c, wx, Y + d / 2 - hg * 0.9, w / n * 0.7, hg * 0.1, AWN[(i + (o.k || 0)) % AWN.length], 0);
    }
  }

  // lx_sea: open water with wave lines and a pale quay edge on both sides (waterfront and bridge).
  function sea(c, X, Y, s, o) {
    var w = (o.w || 3.6) * s, d = (o.h || 8) * s, j;
    H.rc(c, X, Y, w, d, '#2D6C8C', 0);
    for (j = -3; j <= 3; j++) H.ln(c, X - w * 0.35, Y + j * d / 8, X + w * 0.25, Y + j * d / 8, 'rgba(255,255,255,0.22)', 1);
    H.ln(c, X - w / 2, Y - d / 2, X - w / 2, Y + d / 2, '#D9CBB0', 2);
    H.ln(c, X + w / 2, Y - d / 2, X + w / 2, Y + d / 2, '#D9CBB0', 2);
  }

  // lx_truck: container lorry with a cab at the top of the screen (bloater arena cover, Laleli and Zeytinburnu kits).
  function truck(c, X, Y, s, o) {
    var w = (o.w || 2.2) * s, d = (o.h || 5.0) * s, hg = 0.9 * s;
    H.shadow(c, X, Y, w * 0.62, d * 0.5);
    [-1, 1].forEach(function (sx) { [-0.3, 0.3].forEach(function (sy) { H.ell(c, X + sx * w * 0.44, Y + sy * d, 0.07 * s, 0.14 * s, '#1E1F25', 1.2); }); });
    H.box(c, X, Y + d * 0.08, w, d * 0.8, hg, '#E9E5D8', '#3E6A8A');
    H.box(c, X, Y - d * 0.36, w, d * 0.26, hg * 0.7, '#D0583A', '#8A3520');
    H.rc(c, X, Y - d * 0.36 - hg * 0.2, w * 0.7, d * 0.12, '#2F3A46', 1.2);
  }

  // lx_boat: a moored boat from above, hull with a blue waterline stripe and a cabin (waterfront, marina, kit boats).
  function boat(c, X, Y, s, o) {
    var w = (o.w || 1.8) * s, d = (o.h || 3.4) * s;
    H.shadow(c, X, Y, w * 0.7, d * 0.5);
    H.poly(c, [[X, Y - d / 2], [X + w / 2, Y - d * 0.2], [X + w / 2, Y + d / 2], [X - w / 2, Y + d / 2], [X - w / 2, Y - d * 0.2]], '#F4EBDD', 1.5);
    H.rc(c, X, Y + d * 0.12, w * 0.9, d * 0.08, '#1B4965', 0);
    H.rc(c, X, Y + d * 0.08, w * 0.5, d * 0.28, '#D9CBB0', 1.2);
  }

  P.Props.reg('lx_pillar', pillar);
  P.Props.reg('lx_stall', stall);
  P.Props.reg('lx_wall', wall);
  P.Props.reg('lx_sea', sea);
  P.Props.reg('lx_truck', truck);
  P.Props.reg('lx_boat', boat);
  return { ground: ground };
})();
