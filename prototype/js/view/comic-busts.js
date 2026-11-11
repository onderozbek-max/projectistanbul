// Comic busts for story panels and Mom's call card (view only; A.bust and A.contact in comic-art.js call this).
// Unit space: a bust is h px tall. The crown is at y = -1, the layout's base (panel bottom) at y = 0, and the torso runs
// past the base so the panel border crops the shoulders like a comic close-up. Charm rules (v0.9 redesign): a round head
// (width about 0.9 of its height, head about 0.39 h), big low-set eyes with two highlights, a short neck, a tiny nose and
// always-on soft cheeks. Every silhouette gets a bold ink outline (LW), a paper halo outside it (figure-ground against any
// scene), a two-tone cel shade from the upper left and a soft spot behind the head.
// Moods set brows, eyes, mouth and comic extras; talk opens the mouth. Costume, hair and facial hair per character are
// in comic-busts-cast.js (P.ComicCast, looks) and comic-busts-hair.js (P.ComicHair, hair shapes). Ops are cached per
// (who, mood, talk step) because they do not depend on h.
P.ComicBusts = (function () {
  var B = {}, INK = '#14151F', PAPER = '#F4EBDD', TAU = Math.PI * 2;
  var LW = 0.022, LWD = 0.013, HALO = 0.06, CACHE_MAX = 300, HW = 0.175;
  var PAL = { arda: '#3D8BFF', anne: '#E9A23B', baba: '#5C6B7A', usta: '#F4EBDD', friend: '#D7263D', kaan: '#D7263D',
              mila: '#F2B632', ada: '#7FC8C0', dede: '#4E6A84', ahmet: '#B98A5A', shopkeeper: '#8A8F98', news: '#1B4965',
              stranger: '#2C2F42', zombie: '#7D8B6A' };
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

  // Op kit for comic-busts-cast.js and comic-busts-hair.js. F: filled shape with ink outline and halo (o.s = shade colour,
  // o.dx = shade width, o.ink = outline width, 0 for none, o.halo = false to skip the paper halo). L: stroke line.
  var K = {
    F: function (ops, p, col, o) {
      o = o || {};
      ops.push({ t: 'fill', p: p, c: col, s: o.s || null, dx: o.dx == null ? 0.025 : o.dx,
                 ink: o.ink == null ? LW : o.ink, halo: o.halo !== false });
    },
    L: function (ops, p, col, w) { ops.push({ t: 'line', p: p, c: col, w: w || LWD }); },
    smooth: smooth, poly: poly, ell: ell, rct: rct, seg: seg, LW: LW, LWD: LWD, HW: HW
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
  function headPts(fw, jw) {
    var w = HW * fw, j = jw || 1;
    return [[0, -0.965], [0.55 * w, -0.95], [0.92 * w, -0.89], [w, -0.805], [0.97 * w, -0.725], [0.82 * w * j, -0.65], [0.5 * w * j, -0.597],
            [0, -0.575], [-0.5 * w * j, -0.597], [-0.82 * w * j, -0.65], [-0.97 * w, -0.725], [-w, -0.805], [-0.92 * w, -0.89], [-0.55 * w, -0.95]];
  }
  function head(ops, S) {
    var fw = S.fw || 1, w = HW * fw;
    [-1, 1].forEach(function (s) { K.F(ops, ell(s * w * 0.99, -0.76, 0.03, 0.043), S.skin, { s: S.skinS }); });
    K.F(ops, smooth(headPts(fw, S.jw)), S.skin, { s: S.skinS, dx: 0.03 });
  }
  function neck(ops, S) {
    var nw = 0.074 * (S.neckK || 1);
    K.F(ops, smooth([[-nw, -0.64], [-nw * 1.05, -0.52], [-0.095, -0.43], [0.095, -0.43], [nw * 1.05, -0.52], [nw, -0.64]]), S.skin, { s: S.skinS, dx: 0.02 });
  }
  function eyes(ops, S, m) {
    var fw = S.fw || 1, ek = S.eyeK || 1, ex = 0.082 * fw, ey = -0.742, rx = 0.037 * ek, ry = 0.046 * ek * m.lid;
    var pr = (m.worried ? 0.021 : 0.027) * ek;
    [-1, 1].forEach(function (s) {
      var cx = s * ex;
      if (S.zombie) {
        K.F(ops, ell(cx, ey, 0.042, 0.038), '#2A2F22', { ink: LWD, halo: false });
        K.F(ops, ell(cx, ey, 0.021, 0.021), '#E8FF6B', { ink: 0, halo: false });
        return;
      }
      if (m.closed) { K.L(ops, seg([[cx + s * 0.028, ey - 0.02], [cx - s * 0.01, ey + 0.004], [cx + s * 0.028, ey + 0.024]]), INK, LW * 0.9); return; }
      if (m.arcs) { K.L(ops, seg([[cx - rx, ey + 0.012], [cx, ey - 0.034], [cx + rx, ey + 0.012]]), INK, LW); return; }
      K.F(ops, ell(cx, ey, rx, ry), '#FFFFFF', { ink: LWD, halo: false });
      K.F(ops, ell(cx, ey + 0.004, pr, Math.min(pr * 1.15, ry * 0.92)), S.eyes || INK, { ink: 0, halo: false });
      K.F(ops, ell(cx, ey + 0.006, pr * 0.52, Math.min(pr * 0.6, ry * 0.5)), INK, { ink: 0, halo: false });
      K.F(ops, ell(cx - pr * 0.4, ey - pr * 0.42, pr * 0.36, pr * 0.36), '#FFFFFF', { ink: 0, halo: false });
      K.F(ops, ell(cx + pr * 0.42, ey + pr * 0.4, pr * 0.17, pr * 0.17), '#FFFFFF', { ink: 0, halo: false });
      K.L(ops, seg([[cx - rx * 1.05, ey - ry * 0.1], [cx - rx * 0.4, ey - ry * 1.12], [cx + rx * 0.4, ey - ry * 1.12], [cx + rx * 1.05, ey - ry * 0.1]]), INK, LWD * (m.line ? 2.6 : 2.0));
      if (S.lash) {
        K.L(ops, seg([[cx + s * rx * 0.95, ey - ry * 0.55], [cx + s * (rx + 0.016), ey - ry * 0.95], [cx + s * (rx + 0.024), ey - ry * 1.15]]), INK, LWD * 1.3);
        K.L(ops, seg([[cx + s * rx * 0.7, ey - ry * 0.9], [cx + s * (rx + 0.004), ey - ry * 1.4]]), INK, LWD * 1.1);
      }
    });
  }
  function brows(ops, S, m) {
    var fw = S.fw || 1, by = -0.838, col = S.brow || INK, th = S.browK || 1;
    [-1, 1].forEach(function (s) {
      K.L(ops, seg([[s * 0.034 * fw, by + m.brow[0]], [s * 0.086 * fw, by + (m.brow[0] + m.brow[1]) / 2 - 0.006], [s * 0.138 * fw, by + m.brow[1] + 0.008]]), col, LW * 1.1 * th);
    });
  }
  function nose(ops, S) {
    K.L(ops, seg([[-0.012, -0.705], [0.002, -0.678], [0.024, -0.684]]), S.skinS, LWD * 1.1);
    K.F(ops, ell(0.004, -0.683, 0.011, 0.007), 'rgba(255,255,255,0.28)', { ink: 0, halo: false });
  }
  function mouth(ops, S, m, open) {
    var my = -0.628, w = 0.05, c = m.mouth || 0, ox, oy;
    if (open > 0.12) {
      ox = w * (0.75 + 0.45 * open); oy = 0.014 + 0.04 * open;
      K.F(ops, smooth([[-ox, my], [0, my - 0.005], [ox, my], [ox * 0.7, my + oy], [0, my + oy * 1.25], [-ox * 0.7, my + oy]]),
          '#3A1418', { ink: LWD, halo: false });
      if (open > 0.3) K.F(ops, ell(0, my + oy * 0.95, ox * 0.5, oy * 0.3), '#E0707A', { ink: 0, halo: false });
      if (m.teeth || open > 0.45) K.F(ops, rct(-ox * 0.8, my - 0.003, ox * 1.6, 0.015), '#F4F1EA', { ink: 0, halo: false });
      return;
    }
    if (m.teeth) K.F(ops, rct(-w * 0.8, my - 0.01, w * 1.6, 0.018), '#F4F1EA', { ink: LWD * 0.8, halo: false });
    if (m.closed) { K.L(ops, seg([[-w, my], [-w / 2, my + 0.02], [0, my], [w / 2, my + 0.02], [w, my]]), INK, LW * 0.8); return; }
    K.L(ops, seg([[-w, my - 0.006], [0, my + c * 0.16], [w, my - 0.006]]), INK, LW * 0.9);
    if (c > 0.08) [-1, 1].forEach(function (s) { K.L(ops, seg([[s * w, my - 0.006], [s * (w + 0.012), my - 0.016]]), INK, LWD * 0.9); });
  }
  function face(ops, S, m, talk) {
    var open = Math.max(m.open || 0, talk * 0.55), fw = S.fw || 1;
    if (S.zombie) open = Math.max(open, 0.6);
    else {
      [-1, 1].forEach(function (s) {
        K.F(ops, ell(s * 0.112 * fw, -0.668, 0.03, 0.017), m.blush ? 'rgba(240,100,95,0.6)' : 'rgba(240,120,110,0.34)', { ink: 0, halo: false });
      });
      nose(ops, S);
    }
    eyes(ops, S, m);
    brows(ops, S, m);
    mouth(ops, S, m, open);
    if (S.lines) [-1, 1].forEach(function (s) { K.L(ops, seg([[s * 0.062 * fw, -0.69], [s * 0.088 * fw, -0.655], [s * 0.082 * fw, -0.625]]), 'rgba(150,84,62,0.4)', LWD * 0.8); });
    if (S.mole) K.F(ops, ell(S.mole[0], S.mole[1], 0.008, 0.008), INK, { ink: 0, halo: false });
    if (S.freckles) {
      [[-0.1, -0.69], [-0.075, -0.678], [-0.12, -0.675], [0.1, -0.69], [0.075, -0.678], [0.12, -0.675]].forEach(function (p) {
        K.F(ops, ell(p[0], p[1], 0.006, 0.006), S.skinS, { ink: 0, halo: false });
      });
    }
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
    if (m.sweat) drop(ops, 0.2, -0.9, '#CFEFFF');
    if (m.tear) drop(ops, -0.09, -0.7, '#9FE3FF');
    if (m.vein) K.L(ops, seg([[0.12, -0.92], [0.148, -0.89], [0.128, -0.86]]), '#8A2A2A', LWD);
    if (m.stars) { star(ops, -0.22, -1.0, 0.05); star(ops, 0.22, -0.98, 0.045); star(ops, 0, -1.05, 0.04); }
  }
  // Light spot behind the head: lifts dark scenes so the figure separates; invisible on light ones.
  function spot() {
    return { t: 'fn', f: function (c) {
      var g = c.createRadialGradient(0, -0.77, 0.04, 0, -0.77, 0.8);
      g.addColorStop(0, 'rgba(255,244,214,0.38)'); g.addColorStop(1, 'rgba(255,244,214,0)');
      c.fillStyle = g; c.fillRect(-1, -1.6, 2, 2.7);   // covers the whole gradient (radius 0.8) so no edge shows
    } };
  }
  function burst(col) {
    return { t: 'fn', f: function (c) {
      var i, a, r;
      c.save(); c.globalAlpha = 0.6; c.fillStyle = col; c.beginPath();
      for (i = 0; i < 28; i++) { a = i * TAU / 28; r = i % 2 ? 0.5 : 0.78; c.lineTo(Math.cos(a) * r, -0.77 + Math.sin(a) * r); }
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
