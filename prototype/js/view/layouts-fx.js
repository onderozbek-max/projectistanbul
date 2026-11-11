// Layout zones for generated levels (AUDIT-6 B2): zone floors, the lx_* block painters and the door, window and manhole
// marks at the spawn points. The sim decides where things go (js/sim/layouts.js, numbers in js/config-layouts.js).
// Two entry points: P.LayoutFx.floor runs from istanbul-landmarks.js L.draw (under the street items, so arches and
// billboards in a zone still show); P.LayoutFx.drawGround is the render hook (render.js, over the street, under decals).
// Floors take a tint from the hood's theme, so a plaza in Samatya reads differently from one in Laleli.
// Painters register into P.Props (kinds lx_*); contract as istanbul-props.js: fn(c, X, Y, s, o), s = px per metre.
P.LayoutFx = (function () {
  var H = P.Props.h, INK = '#14151F', LINE = 'rgba(0,0,0,0.13)';
  var FLOOR = { plaza: '#CDBFA6', market: '#B59A78', chicane: '#A39C8F', waterfront: '#B8AD96', bridge: '#8D877C', arena: '#7C7467' };
  var STEP = { plaza: 3, market: 2, chicane: 2.5, waterfront: 6, bridge: 1.5, arena: 4 };
  var AWN = ['#B5401D', '#2E6E8E', '#C9A227', '#2E7D4F'];
  var ART_WASH = 0.42;                               // share of the zone colour over an authored paving tile
  var TINT = 0.45;                                   // share of the hood's walk colour in a zone floor
  var MARK = { doorW: 0.9, doorD: 0.4, winW: 1.2, winD: 0.35 };   // spawn marks (m)
  var cache = {};

  function rgb(hex) { var n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function hex(v) { return '#' + v.map(function (k) { return ('0' + Math.round(k).toString(16)).slice(-2); }).join(''); }
  // Floor colour for a zone kind in a hood: the kind's paving mixed with the hood's walk colour.
  function floorOf(kind, theme) {
    var key = kind + '|' + theme;
    if (!cache[key]) {
      var th = P.Themes.get(theme), base = rgb(FLOOR[kind] || FLOOR.plaza), wc = rgb(th.wc || FLOOR[kind] || '#8A8A8A');
      cache[key] = hex(base.map(function (v, i) { return v * (1 - TINT) + wc[i] * TINT; }));
    }
    return cache[key];
  }
  function themeOf(s) { return (s.levelInfo && s.levelInfo.hood && s.levelInfo.hood.theme) || s.theme || 'istiklal'; }

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

  // Zone floors for every zone that overlaps the visible window [y0, y1]. Under the street items (L.draw).
  function floor(R, s, y0, y1) {
    var G = s && s.geo, c = R.ctx, theme = themeOf(s);
    if (!G || !G.zones) return;
    G.zones.forEach(function (z) {
      if (z.y1 < y0 || z.y0 > y1) return;
      var a = Math.max(z.y0, y0), b = Math.min(z.y1, y1), x0 = G.xMin, x1 = G.xMax;
      var art = P.RenderWorld && P.RenderWorld.artTile ? P.RenderWorld.artTile(R, theme, 'walk') : null;
      if (art) {   // R1-T3: the hood's authored paving, washed with the zone's own colour so plaza, market and arena stay distinct
        P.RenderWorld.fillTile(R, art, x0, x1, a, b, 0, 1);
        c.save(); c.globalAlpha = ART_WASH; c.fillStyle = FLOOR[z.kind] || FLOOR.plaza;
        c.fillRect(R.X(x0), R.Y(b), (x1 - x0) * R.ppm, (b - a) * R.ppm); c.restore();
        return;
      }
      c.fillStyle = floorOf(z.kind, theme);
      c.fillRect(R.X(x0), R.Y(b), (x1 - x0) * R.ppm, (b - a) * R.ppm);
      lines(R, z, a, b, x0, x1);
    });
  }

  // Spawn marks: a door (dark wood with a threshold), and a window (pale glass with a sill).
  // Drawn at the facade line the sim published (s.layout.spawns), so the player can see where zombies come from.
  function mark(c, R, p) {
    var X = R.X(p.x), Y = R.Y(p.y), u = R.ppm, w, d;
    w = (p.kind === 'door' ? MARK.doorW : MARK.winW) * u; d = (p.kind === 'door' ? MARK.doorD : MARK.winD) * u;
    if (p.kind === 'door') {
      H.rc(c, X, Y, d, w, '#5A3B25', 1.2);
      H.rc(c, X, Y, d * 0.5, w * 0.8, '#2B1C12', 0);
    } else {
      H.rc(c, X, Y, d, w, '#9FC6D6', 1.2);
      H.ln(c, X - d * 0.5, Y, X + d * 0.5, Y, '#3A3E45', Math.max(1, 0.08 * u));
    }
  }
  function marks(R, s, y0, y1) {
    var L = s && s.layout, c = R.ctx;
    if (!L || !L.spawns) return;
    L.spawns.forEach(function (p) {
      if (p.y < y0 - 1 || p.y > y1 + 1) return;
      mark(c, R, p);
    });
  }
  // Render hook: the spawn marks over the street (the floors were laid in L.draw, under the items).
  function drawGround(R, s) {
    var cam = R.cam, half, y0, y1;
    if (!s || !s.layout || !cam) return;
    half = P.viewHalfH(cam.w) + 3; y0 = cam.y - half; y1 = cam.y + half;
    marks(R, s, y0, y1);
  }

  // lx_pillar: stone column with a capital (plaza, arena cover, chicane pier).
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
  return { floor: floor, drawGround: drawGround, floorOf: floorOf };
})();
