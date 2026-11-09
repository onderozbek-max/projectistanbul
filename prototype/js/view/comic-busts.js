// Comic busts for story panels and Mom's call card (view only; A.bust and A.contact in comic-art.js call this).
// Unit space: a bust is h px tall. The crown is at y = -1, the layout's base (panel bottom) at y = 0, and the torso runs
// past the base so the panel border crops the shoulders like a comic close-up. Proportions: head (crown to chin) ~0.4 h,
// shoulders ~2.4 head widths, neck visible. Every silhouette gets a bold ink outline (LW), a paper halo outside it
// (figure-ground against any scene), a two-tone cel shade from the upper left and a soft spot behind the head.
// Moods set brows, eyes, mouth and comic extras; talk opens the mouth. Costume, hair and facial hair per character are
// in comic-busts-cast.js (P.ComicCast). Ops are cached per (who, mood, talk step) because they do not depend on h.
P.ComicBusts = (function () {
  var B = {}, INK = '#14151F', PAPER = '#F4EBDD', TAU = Math.PI * 2;
  var LW = 0.022, LWD = 0.013, HALO = 0.06, CACHE_MAX = 300;
  var PAL = { arda: '#3D8BFF', anne: '#E9A23B', baba: '#5C6B7A', usta: '#F4EBDD', friend: '#D7263D', shopkeeper: '#8A8F98',
              news: '#1B4965', stranger: '#2C2F42', zombie: '#7D8B6A' };
  // Moods: brow [inner dy, outer dy] (negative = up), lid (eye height), mouth (smile +, frown -), open (mouth 0..1).
  var MOOD = {
    neutral: { brow: [0, 0], lid: 1, mouth: 0.1, open: 0 },
    scared: { brow: [-0.045, -0.01], lid: 1.12, mouth: -0.16, open: 0.1, worried: true, sweat: true },
    happy: { brow: [-0.01, -0.02], lid: 1, mouth: 0.5, open: 0.55, grin: true, arcs: true, blush: true },
    shout: { brow: [-0.03, -0.045], lid: 1.1, mouth: 0, open: 0.9, teeth: true, burst: '#FFD166' },
    determined: { brow: [0.035, 0], lid: 0.72, mouth: 0, open: 0, line: true },
    sad: { brow: [-0.04, 0.02], lid: 0.82, mouth: -0.3, open: 0, tear: true },
    angry: { brow: [0.05, -0.005], lid: 0.7, mouth: -0.2, open: 0, teeth: true, vein: true },
    hurt: { brow: [0, 0.03], lid: 1, mouth: -0.2, open: 0, closed: true, stars: true }
  };
  MOOD.worried = MOOD.scared; MOOD.grin = MOOD.happy;

  // ---------- path helpers (unit space) ----------
  // Closed smooth outline through pts (Catmull-Rom to Bezier); open = a smooth stroke through pts.
  function smooth(pts, open) {
    var p = new Path2D(), n = pts.length, last = open ? n - 1 : n, i, a, b, c, d;
    p.moveTo(pts[0][0], pts[0][1]);
    for (i = 0; i < last; i++) {
      if (open) { a = pts[Math.max(0, i - 1)]; b = pts[i]; c = pts[i + 1]; d = pts[Math.min(n - 1, i + 2)]; }
      else { a = pts[(i - 1 + n) % n]; b = pts[i]; c = pts[(i + 1) % n]; d = pts[(i + 2) % n]; }
      p.bezierCurveTo(b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6, c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6, c[0], c[1]);
    }
    if (!open) p.closePath();
    return p;
  }
  function poly(pts) { var p = new Path2D(), i; p.moveTo(pts[0][0], pts[0][1]); for (i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); return p; }
  function ell(x, y, rx, ry) { var p = new Path2D(); p.ellipse(x, y, rx, ry, 0, 0, TAU); return p; }
  function rct(x, y, w, h) { var p = new Path2D(); p.rect(x, y, w, h); return p; }
  function seg(pts) { return smooth(pts, true); }

  // Op kit for comic-busts-cast.js. F: filled shape with ink outline and halo (o.s = shade colour, o.dx = shade width,
  // o.ink = outline width, 0 for none, o.halo = false to skip the paper halo). L: stroke line (colour, width).
  var K = {
    F: function (ops, p, col, o) {
      o = o || {};
      ops.push({ t: 'fill', p: p, c: col, s: o.s || null, dx: o.dx == null ? 0.025 : o.dx,
                 ink: o.ink == null ? LW : o.ink, halo: o.halo !== false });
    },
    L: function (ops, p, col, w) { ops.push({ t: 'line', p: p, c: col, w: w || LWD }); },
    smooth: smooth, poly: poly, ell: ell, rct: rct, seg: seg, LW: LW, LWD: LWD
  };
  B.kit = K;

  // ---------- drawing ----------
  function drawOp(c, op) {
    if (op.t === 'fn') { op.f(c); return; }
    if (op.t === 'line') { c.strokeStyle = op.c; c.lineWidth = op.w; c.stroke(op.p); return; }
    c.save();
    if (op.s) { c.clip(op.p); c.fillStyle = op.s; c.fill(op.p); c.translate(-op.dx, 0); }   // cel shade: right-hand crescent
    c.fillStyle = op.c; c.fill(op.p);
    c.restore();
    if (op.ink) { c.strokeStyle = INK; c.lineWidth = op.ink; c.stroke(op.p); }
  }
  function render(c, ops) {
    var i;
    for (i = 0; i < ops.length; i++) {   // paper halo first, under every fill: it only shows on the background
      if (ops[i].t === 'fill' && ops[i].halo) { c.strokeStyle = PAPER; c.lineWidth = HALO; c.stroke(ops[i].p); }
    }
    for (i = 0; i < ops.length; i++) drawOp(c, ops[i]);
  }

  // ---------- head and face ----------
  function headPts(fw) {
    return [[0, -0.95], [0.09 * fw, -0.94], [0.13 * fw, -0.88], [0.14 * fw, -0.8], [0.13 * fw, -0.72], [0.11 * fw, -0.66],
            [0.06 * fw, -0.61], [0, -0.6], [-0.06 * fw, -0.61], [-0.11 * fw, -0.66], [-0.13 * fw, -0.72], [-0.14 * fw, -0.8],
            [-0.13 * fw, -0.88], [-0.09 * fw, -0.94]];
  }
  function head(ops, S) {
    var fw = S.fw || 1;
    [-1, 1].forEach(function (s) { K.F(ops, ell(s * 0.138 * fw, -0.75, 0.032, 0.046), S.skin, { s: S.skinS }); });
    K.F(ops, smooth(headPts(fw)), S.skin, { s: S.skinS });
  }
  function neck(ops, S) {
    K.F(ops, smooth([[-0.068, -0.7], [-0.07, -0.5], [-0.085, -0.43], [0.085, -0.43], [0.07, -0.5], [0.068, -0.7]]), S.skin, { s: S.skinS, dx: 0.018 });
  }
  function eyes(ops, S, m) {
    var ey = -0.775, rx = 0.031, ry = 0.024 * m.lid, pr = m.worried ? 0.011 : 0.016;
    [-1, 1].forEach(function (s) {
      var cx = s * 0.058;
      if (S.zombie) {
        K.F(ops, ell(cx, ey, 0.04, 0.034), '#2A2F22', { ink: LWD, halo: false });
        K.F(ops, ell(cx, ey, 0.02, 0.02), '#E8FF6B', { ink: 0, halo: false });
        return;
      }
      if (m.closed) { K.L(ops, seg([[cx + s * 0.025, ey - 0.02], [cx - s * 0.01, ey], [cx + s * 0.025, ey + 0.02]]), INK, LW * 0.9); return; }
      if (m.arcs) { K.L(ops, seg([[cx - rx, ey + 0.01], [cx, ey - 0.03], [cx + rx, ey + 0.01]]), INK, LW * 0.9); return; }
      K.F(ops, ell(cx, ey, rx, ry), '#FFFFFF', { ink: LWD, halo: false });
      K.F(ops, ell(cx, ey + 0.002, pr, Math.min(pr, ry)), S.eyes || INK, { ink: 0, halo: false });
      K.F(ops, ell(cx - pr * 0.35, ey - pr * 0.35, pr * 0.3, pr * 0.3), '#FFFFFF', { ink: 0, halo: false });
      K.L(ops, seg([[cx - rx, ey - ry * 0.25], [cx, ey - ry * 1.2], [cx + rx, ey - ry * 0.25]]), INK, LWD * (m.line ? 2.4 : 1.6));
    });
  }
  function brows(ops, S, m) {
    var by = -0.835, col = S.brow || INK;
    [-1, 1].forEach(function (s) {
      K.L(ops, seg([[s * 0.03, by + m.brow[0]], [s * 0.078, by + (m.brow[0] + m.brow[1]) / 2], [s * 0.125, by + m.brow[1]]]), col, LW * 0.95);
    });
  }
  function mouth(ops, S, m, open) {
    var my = -0.672, w = 0.05, c = m.mouth || 0, ox, oy;
    if (open > 0.12) {
      ox = w * (0.75 + 0.45 * open); oy = 0.012 + 0.036 * open;
      K.F(ops, smooth([[-ox, my], [0, my - 0.004], [ox, my], [ox * 0.7, my + oy], [0, my + oy * 1.25], [-ox * 0.7, my + oy]]),
          '#3A1418', { ink: LWD, halo: false });
      if (m.teeth || open > 0.45) K.F(ops, rct(-ox * 0.8, my - 0.002, ox * 1.6, 0.014), '#F4F1EA', { ink: 0, halo: false });
      return;
    }
    if (m.teeth) K.F(ops, rct(-w * 0.8, my - 0.01, w * 1.6, 0.018), '#F4F1EA', { ink: LWD * 0.8, halo: false });
    if (m.closed) { K.L(ops, seg([[-w, my], [-w / 2, my + 0.02], [0, my], [w / 2, my + 0.02], [w, my]]), INK, LW * 0.8); return; }
    K.L(ops, seg([[-w, my - 0.004], [0, my + c * 0.12], [w, my - 0.004]]), INK, LW * 0.85);
  }
  function face(ops, S, m, talk) {
    var open = Math.max(m.open || 0, talk * 0.55);
    if (S.zombie) open = Math.max(open, 0.6);
    K.L(ops, seg([[0, -0.765], [0.016, -0.728], [0.003, -0.712]]), S.skinS, LWD);
    eyes(ops, S, m);
    brows(ops, S, m);
    mouth(ops, S, m, open);
    if (S.lines) [-1, 1].forEach(function (s) { K.L(ops, seg([[s * 0.085, -0.7], [s * 0.1, -0.65]]), S.skinS, LWD * 0.9); });
    if (m.blush) [-1, 1].forEach(function (s) { K.F(ops, ell(s * 0.095, -0.7, 0.022, 0.012), '#F2A08C', { ink: 0, halo: false }); });
  }
  // Comic extras: sweat, tear, vein, stars. Drawn last, over the head.
  function drop(ops, x, y, col) {
    K.F(ops, smooth([[x, y - 0.03], [x + 0.02, y + 0.005], [x, y + 0.02], [x - 0.02, y + 0.005]]), col, { ink: LWD, halo: false });
  }
  function star(ops, x, y, r) {
    var pts = [], i;
    for (i = 0; i < 8; i++) pts.push([x + Math.cos(i * Math.PI / 4) * (i % 2 ? r * 0.4 : r), y + Math.sin(i * Math.PI / 4) * (i % 2 ? r * 0.4 : r)]);
    K.F(ops, poly(pts), '#FFD166', { ink: LWD, halo: false });
  }
  function extras(ops, m) {
    if (m.sweat) drop(ops, 0.165, -0.86, '#CFEFFF');
    if (m.tear) drop(ops, -0.062, -0.715, '#9FE3FF');
    if (m.vein) K.L(ops, seg([[0.115, -0.87], [0.14, -0.845], [0.12, -0.82]]), '#8A2A2A', LWD);
    if (m.stars) { star(ops, -0.2, -0.99, 0.05); star(ops, 0.2, -0.97, 0.045); star(ops, 0, -1.04, 0.04); }
  }
  // Light spot behind the head: lifts dark scenes so the figure separates; invisible on light ones.
  function spot() {
    return { t: 'fn', f: function (c) {
      var g = c.createRadialGradient(0, -0.74, 0.04, 0, -0.74, 0.8);
      g.addColorStop(0, 'rgba(255,244,214,0.34)'); g.addColorStop(1, 'rgba(255,244,214,0)');
      c.fillStyle = g; c.fillRect(-1, -1.6, 2, 2.7);   // covers the whole gradient (radius 0.8) so no edge shows
    } };
  }
  function burst(col) {
    return { t: 'fn', f: function (c) {
      var i, a, r;
      c.save(); c.globalAlpha = 0.6; c.fillStyle = col; c.beginPath();
      for (i = 0; i < 28; i++) { a = i * TAU / 28; r = i % 2 ? 0.5 : 0.78; c.lineTo(Math.cos(a) * r, -0.74 + Math.sin(a) * r); }
      c.closePath(); c.fill(); c.restore();
    } };
  }

  // Ops for one bust: back hair, torso, neck, front (collars, zip, strap), head, hair, facial hair, face, over-pieces, extras.
  function build(who, mood, talk) {
    var C = P.ComicCast, S = C.spec(who), m = MOOD[mood] || MOOD.neutral, ops = [spot()];
    if (m.burst) ops.push(burst(m.burst));
    C.back(ops, S);
    C.torso(ops, S);
    neck(ops, S);
    C.front(ops, S);
    head(ops, S);
    C.hair(ops, S);
    C.facial(ops, S, m);
    face(ops, S, m, talk);
    C.over(ops, S, m);
    extras(ops, m);
    return ops;
  }
  var cache = {}, cacheN = 0;
  function opsFor(who, mood, talk) {
    var step = Math.round(talk * 8) / 8, key = who + '|' + mood + '|' + step, e = cache[key];
    if (e) return e;
    if (cacheN >= CACHE_MAX) { cache = {}; cacheN = 0; }
    e = build(who, mood, step); cache[key] = e; cacheN++;
    return e;
  }

  // Draws a bust bottom-centred at (x, y) with total height h. o: {flip, talk 0..1, alpha}.
  B.draw = function (c, who, mood, x, y, h, o) {
    o = o || {};
    c.save();
    c.globalAlpha = o.alpha == null ? 1 : o.alpha;
    c.translate(x, y); c.scale(o.flip ? -h : h, h);
    c.lineJoin = 'round'; c.lineCap = 'round';
    render(c, opsFor(who, mood || 'neutral', o.talk || 0));
    c.restore();
  };
  // Square contact photo for the call card: the bust fills the square from the top edge to the bottom edge.
  B.canvas = function (who, mood, size, dpr) {
    var d = dpr || 1, cv = document.createElement('canvas'), c;
    cv.width = Math.round(size * d); cv.height = Math.round(size * d);
    c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0);
    c.fillStyle = PAL[who] || '#888'; c.fillRect(0, 0, size, size);
    B.draw(c, who, mood || 'neutral', size / 2, size, size * 0.92, {});
    return cv;
  };
  return B;
})();
