// Drawing primitives for the weapon tier silhouettes (view only; owner feedback: weapons look alike). Coordinates are world metres
// in, canvas pixels out (R.X / R.Y / R.ppm). World angles: x right, y up, so world angle a points at screen (cos a, -sin a).
// The silhouette drawers (weapon-sil.js, weapon-sil-evo.js) build on these; each draw is a few canvas calls.
P.WSil = P.WSil || {};
P.WSil.layer = P.WSil.layer || {};   // silhouette id -> 'ground' (under Arda), 'air' (over Arda) or 'both'
P.WSil.prim = (function () {
  var TAU = Math.PI * 2, M = {};
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  M.TAU = TAU;
  M.clamp = clamp;
  M.rgba = function (col, a) { return 'rgba(' + col + ',' + clamp(a).toFixed(3) + ')'; };
  // Soft disc of radius rm metres that fades to nothing at its edge (a glow).
  M.glow = function (c, R, x, y, rm, col, a) {
    if (!(rm > 0) || !(a > 0)) return;
    var X = R.X(x), Y = R.Y(y), r = rm * R.ppm, g = c.createRadialGradient(X, Y, 0, X, Y, r);
    g.addColorStop(0, M.rgba(col, a * 0.7)); g.addColorStop(1, M.rgba(col, 0));
    c.fillStyle = g; c.beginPath(); c.arc(X, Y, r, 0, TAU); c.fill();
  };
  M.disc = function (c, R, x, y, rm, col, a) {
    c.fillStyle = M.rgba(col, a); c.beginPath(); c.arc(R.X(x), R.Y(y), Math.max(0.5, rm * R.ppm), 0, TAU); c.fill();
  };
  M.ring = function (c, R, x, y, rm, col, a, w) {
    c.strokeStyle = M.rgba(col, a); c.lineWidth = w; c.beginPath(); c.arc(R.X(x), R.Y(y), Math.max(0.5, rm * R.ppm), 0, TAU); c.stroke();
  };
  // Stroke a polyline of [x, y] metre points (closed = join the ends).
  M.poly = function (c, R, pts, col, a, w, closed) {
    if (pts.length < 2) return;
    var i;
    c.lineJoin = 'round'; c.lineCap = 'round';
    if (w >= 1.8 && a > 0.2) {   // dark underlay for bright lines (see M.arc)
      c.strokeStyle = M.rgba('16,20,28', a * 0.45); c.lineWidth = w + 1.6;
      c.beginPath(); c.moveTo(R.X(pts[0][0]), R.Y(pts[0][1]));
      for (i = 1; i < pts.length; i++) c.lineTo(R.X(pts[i][0]), R.Y(pts[i][1]));
      if (closed) c.closePath();
      c.stroke();
    }
    c.strokeStyle = M.rgba(col, a); c.lineWidth = w;
    c.beginPath(); c.moveTo(R.X(pts[0][0]), R.Y(pts[0][1]));
    for (i = 1; i < pts.length; i++) c.lineTo(R.X(pts[i][0]), R.Y(pts[i][1]));
    if (closed) c.closePath();
    c.stroke();
  };
  // Filled polygon with a thin dark edge, so the silhouette reads on grey and on light ground.
  M.fill = function (c, R, pts, col, a) {
    if (pts.length < 3) return;
    c.beginPath(); c.moveTo(R.X(pts[0][0]), R.Y(pts[0][1]));
    for (var i = 1; i < pts.length; i++) c.lineTo(R.X(pts[i][0]), R.Y(pts[i][1]));
    c.closePath();
    c.fillStyle = M.rgba(col, a); c.fill();
    if (a > 0.3) { c.strokeStyle = M.rgba('16,20,28', a * 0.4); c.lineWidth = 1.1; c.stroke(); }
  };
  M.seg = function (c, R, x0, y0, x1, y1, col, a, w) { M.poly(c, R, [[x0, y0], [x1, y1]], col, a, w, false); };
  // Arc of radius rm around (x, y) from world angle a0 to a1 (a1 >= a0). Screen angles are negated, so the sweep is -a1 .. -a0.
  // Bright strokes (w >= 1.8) get a dark underlay first, so steel and white edges read on grey and on light ground alike.
  M.arc = function (c, R, x, y, rm, a0, a1, col, a, w) {
    var X = R.X(x), Y = R.Y(y), r = Math.max(0.5, rm * R.ppm);
    c.lineCap = 'round';
    if (w >= 1.8 && a > 0.2) {
      c.strokeStyle = M.rgba('16,20,28', a * 0.45); c.lineWidth = w + 1.6;
      c.beginPath(); c.arc(X, Y, r, -a1, -a0, false); c.stroke();
    }
    c.strokeStyle = M.rgba(col, a); c.lineWidth = w;
    c.beginPath(); c.arc(X, Y, r, -a1, -a0, false); c.stroke();
  };
  // Local shape points (metres, relative to the origin) turned by angle a and moved to (x, y).
  M.local = function (pts, x, y, a) {
    var cs = Math.cos(a), sn = Math.sin(a);
    return pts.map(function (p) { return [x + p[0] * cs - p[1] * sn, y + p[0] * sn + p[1] * cs]; });
  };
  // A fading ribbon through the recent positions (hist: [{x, y}], oldest first). frac is the share of samples used (0..1).
  M.trail = function (c, R, hist, col, a, w, frac) {
    var n = Math.round(hist.length * clamp(frac)), i, k;
    if (n < 2) return;
    c.lineCap = 'round';
    for (i = hist.length - n + 1, k = 1; i < hist.length; i++, k++) {
      c.strokeStyle = M.rgba(col, a * k / n); c.lineWidth = w;
      c.beginPath(); c.moveTo(R.X(hist[i - 1].x), R.Y(hist[i - 1].y)); c.lineTo(R.X(hist[i].x), R.Y(hist[i].y)); c.stroke();
    }
  };
  // Position of a live entity in metres: its own x/y, or along x0,y0 -> x1,y1 at progress q (lobbed and flying shots).
  M.pos = function (e, q) {
    if (e.x !== undefined) return { x: e.x, y: e.y };
    return { x: e.x0 + (e.x1 - e.x0) * q, y: e.y0 + (e.y1 - e.y0) * q };
  };
  // Tiny deterministic noise in 0..1 from a seed and a time (flicker without Math.random).
  M.noise = function (seed, t) { var v = Math.sin(seed * 12.9898 + t * 7.233) * 43758.5453; return Math.abs(v % 1); };
  return M;
})();
