// Shared cutout-figure rig (workstream B, view only). Figures are authored in unit space:
// 1 unit = figure height, feet at y = 0, up is -y, facing right (+x). Each (recipe, layer, pose)
// is pre-rendered once per device-scale bucket to an offscreen canvas and placed with drawImage.
// Weapon arms are live hooks drawn between the cached 'low' and 'high' layers (z-order kept).
P.ArtRig = (function () {
  var R = {}, TAU = Math.PI * 2, INK = '#14151F', LW = 0.028;
  var LOW_BOX = [-0.55, 0.55, -1.12, 0.14], HIGH_BOX = [-0.38, 0.38, -1.34, -0.38];
  var memo = {};
  R.INK = INK; R.LW = LW; R.TAU = TAU; R.LOW_BOX = LOW_BOX; R.HIGH_BOX = HIGH_BOX;

  R.clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };

  // ---- colour ----
  function rgb(h) { var n = parseInt(h.charAt(0) === '#' ? h.slice(1) : h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function hx(v) { var s = Math.round(R.clamp(v, 0, 255)).toString(16); return s.length < 2 ? '0' + s : s; }
  function toHex(a) { return '#' + hx(a[0]) + hx(a[1]) + hx(a[2]); }
  R.mix = function (a, b, t) { var A = rgb(a), B = rgb(b); return toHex([0, 1, 2].map(function (i) { return A[i] + (B[i] - A[i]) * t; })); };
  R.shade = function (a, k) {
    var m = 's' + a + k; if (memo[m]) return memo[m];
    var A = rgb(a); return (memo[m] = toHex([A[0] * k, A[1] * k, A[2] * k]));
  };
  // Zombie colour: desaturate, pull toward grey-green (#7D8B6A), then a small green shift.
  R.tint = function (a) {
    var m = 'z' + a; if (memo[m]) return memo[m];
    var v = rgb(a), l = 0.3 * v[0] + 0.59 * v[1] + 0.11 * v[2], Z = [125, 139, 106], o = [];
    for (var i = 0; i < 3; i++) o[i] = (v[i] + (l - v[i]) * 0.7) * 0.55 + Z[i] * 0.45;
    return (memo[m] = toHex([o[0] * 0.97, o[1] * 1.06, o[2] * 0.9]));
  };

  // ---- paths (unit space) ----
  R.ell = function (x, y, rx, ry, rot) { var p = new Path2D(); p.ellipse(x, y, rx, ry, rot || 0, 0, TAU); return p; };
  R.rrect = function (x, y, w, h, r) {
    var p = new Path2D(); r = Math.min(r, w / 2, h / 2);
    p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r);
    p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); return p;
  };
  // Tapered limb: union of two circles plus their outer tangents.
  R.capsule = function (x0, y0, r0, x1, y1, r1) {
    var dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1e-6, a = Math.atan2(dy, dx);
    var b = Math.acos(R.clamp((r0 - r1) / L, -1, 1)), p = new Path2D();
    p.arc(x0, y0, r0, a + b, a + TAU - b); p.arc(x1, y1, r1, a - b, a + b); p.closePath();
    return p;
  };
  // Closed smooth curve through points (Catmull-Rom to cubic Bezier).
  R.smooth = function (pts) {
    var p = new Path2D(), n = pts.length, i, p0, p1, p2, p3;
    p.moveTo(pts[0][0], pts[0][1]);
    for (i = 0; i < n; i++) {
      p0 = pts[(i - 1 + n) % n]; p1 = pts[i]; p2 = pts[(i + 1) % n]; p3 = pts[(i + 2) % n];
      p.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
        p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
    }
    p.closePath(); return p;
  };
  R.union = function (list) { var p = new Path2D(); list.forEach(function (q) { p.addPath(q); }); return p; };

  // Ink outline (stroke, half hidden by the fill) plus cel shade: base colour shifted up-left
  // over a shade fill leaves a crescent of shade on the lower-right edge.
  R.paint = function (c, path, col, shade, lw, sh) {
    var s = sh === undefined ? 0.035 : sh;
    c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = 2 * (lw || LW); c.stroke(path);
    c.fillStyle = shade || col; c.fill(path);
    if (shade) { c.save(); c.clip(path); c.fillStyle = col; c.translate(-s, -s); c.fill(path); c.restore(); }
  };
  R.disc = function (c, x, y, r, col, shade, lw) { R.paint(c, R.ell(x, y, r, r), col, shade, lw, r * 0.3); };

  // ---- skeleton solver ----
  // B: body proportions. p: pose { walk, breath, gait, arms, bob, crouch, lean, hunch, strideK, liftK, limp }.
  function footFor(B, p, side) {
    var L = side === 'L', s = L ? -1 : 1, th = (p.walk || 0) + (L ? 0 : Math.PI);
    var st = B.stride * (p.strideK || 1), lf = B.lift * (p.liftK || 1);
    if (p.gait === 'still') return [s * B.hipX, 0];
    if (p.limp && L) { st *= 0.4; lf *= 0.25; th += 0.5; }
    return [s * B.hipX + st * Math.sin(th), -lf * Math.max(0, Math.cos(th))];
  }
  // Two-bone knee: the knee bends forward (+x).
  function knee(H, F, L1, L2) {
    var dx = F[0] - H[0], dy = F[1] - H[1], len = Math.hypot(dx, dy) || 1e-4;
    var d = R.clamp(len, Math.abs(L1 - L2) + 1e-3, L1 + L2 - 1e-3), ux = dx / len, uy = dy / len;
    var a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    var px = -uy, py = ux; if (px < 0) { px = -px; py = -py; }
    return [H[0] + ux * a + px * h, H[1] + uy * a + py * h];
  }
  // Arm angles, measured from straight down toward +x (forward). Back arm (L) is opposite the back leg.
  function armAngles(p, side) {
    var L = side === 'L', k = L ? -1 : 1, ph = p.walk || 0, th = ph + (L ? Math.PI : 0), br = p.breath || 0;
    switch (p.arms) {
      case 'swing': { var w = k * 0.1 + 0.45 * Math.sin(th); return { u: w, f: w + 0.25 }; }
      // Zombie walk: arms still reach forward (about 57 degrees) but swing in opposite phase, +/-0.45 rad (was a static reach).
      case 'zswing': { var zs = 1.0 + 0.45 * Math.sin(th); return { u: zs, f: zs + 0.2 }; }
      case 'run': case 'pump': { var r = k * 0.2 + 0.95 * Math.sin(th); return { u: r, f: r + 1.45 }; }
      case 'reach': { var q = (L ? 1.12 : 1.3) + 0.07 * Math.sin(ph + (L ? 0 : 1.7)); return { u: q, f: q + 0.2 }; }
      case 'panic': { var z = (L ? -2.5 : 2.5) + 0.25 * Math.sin(th); return { u: z, f: z + (L ? -0.35 : 0.35) }; }
      case 'flail': { var v = Math.sin(ph * 1.3 + (L ? 0 : 2.1)); return { u: k * 1.4 + 0.8 * v, f: k * 2.4 + 0.5 * v }; }
      case 'hold': return { u: 0.55 + 0.05 * k, f: 1.35 };
      case 'drag': { var d = 0.12 * Math.sin(th); return { u: 0.17 + k * 0.02 + d, f: 0.08 + d }; }
      default: { var b = Math.sin(br) * 0.03; return { u: k * 0.1 + b, f: k * 0.1 + 0.25 + b }; }
    }
  }
  function arm(J, B, p, side) {
    var a = armAngles(p, side), sh = J['s' + side];
    var el = [sh[0] + Math.sin(a.u) * B.upper, sh[1] + Math.cos(a.u) * B.upper];
    J[side + 'E'] = el; J[side + 'W'] = [el[0] + Math.sin(a.f) * B.fore, el[1] + Math.cos(a.f) * B.fore];
  }
  R.solve = function (B, p) {
    var bob = p.bob || 0, cr = p.crouch || 0, lean = p.lean || 0, hun = p.hunch || 0;
    var hipY = B.hipY + bob * 0.5 - cr * 0.08, shY = B.shY + bob - cr * 0.12 + hun * 0.03, sx = lean + hun * 0.05;
    var J = { hipY: hipY, shY: shY, sx: sx, bcx: lean * 0.3, bob: bob };
    J.hL = [-B.hipX, hipY]; J.hR = [B.hipX, hipY];
    J.fL = footFor(B, p, 'L'); J.fR = footFor(B, p, 'R');
    J.kL = knee(J.hL, J.fL, B.thigh, B.shin); J.kR = knee(J.hR, J.fR, B.thigh, B.shin);
    J.sL = [-B.shX + sx, shY]; J.sR = [B.shX + sx, shY];
    arm(J, B, p, 'L'); arm(J, B, p, 'R');
    J.hd = [B.headC[0] + sx * 1.1 + hun * 0.05, B.headC[1] + bob * 1.1 - cr * 0.12 + hun * 0.05];
    return J;
  };

  // ---- body parts ----
  R.torsoPath = function (rc, J) {
    var B = rc.B, sw = rc.swell || 0, t, bt, cx = J.sx, bx = J.bcx, tw = B.torsoTop, bw = B.torsoBot, p;
    if (B.belly) { var b = B.belly, k = 1 + 0.2 * sw; return R.ell(bx, b.y + (J.bob || 0), b.rx * k, b.ry * (1 + 0.1 * sw)); }
    t = J.shY; bt = J.hipY + 0.06; p = new Path2D();
    p.moveTo(cx - tw + 0.03, t + 0.01);
    p.quadraticCurveTo(cx, t - 0.035, cx + tw - 0.03, t + 0.01);
    p.bezierCurveTo(cx + tw + 0.01, t + 0.07, bx + bw, bt - 0.08, bx + bw, bt);
    p.quadraticCurveTo(bx, bt + 0.02, bx - bw, bt);
    p.bezierCurveTo(bx - bw, bt - 0.08, cx - tw - 0.01, t + 0.07, cx - tw + 0.03, t + 0.01);
    p.closePath(); return p;
  };
  function legPath(B, J, side) {
    var H = J['h' + side], K = J['k' + side], F = J['f' + side];
    return R.union([R.capsule(H[0], H[1], B.legR, K[0], K[1], B.legR * 0.9), R.capsule(K[0], K[1], B.legR * 0.9, F[0], F[1] - 0.05, B.shinR)]);
  }
  function drawLeg(c, rc, J, side) {
    var B = rc.B, L = rc.look, F = J['f' + side], K = J['k' + side], H = J['h' + side];
    if (rc.outfit && rc.outfit.shorts) {
      R.paint(c, R.capsule(H[0], H[1], B.legR, K[0], K[1], B.legR * 0.9), L.pants, L.pantsS);
      R.paint(c, R.capsule(K[0], K[1], B.legR * 0.9, F[0], F[1] - 0.05, B.shinR), L.skin, L.skinS);
    } else R.paint(c, legPath(B, J, side), L.pants, L.pantsS);
    R.paint(c, R.ell(F[0] + 0.022, F[1] - 0.032, B.shoe, 0.045), L.shoe, L.shoeS, LW, 0.01);
  }
  function drawArm(c, rc, J, side) {
    var B = rc.B, L = rc.look, O = rc.outfit || {}, sh = J['s' + side], el = J[side + 'E'], wr = J[side + 'W'];
    var up = R.capsule(sh[0], sh[1], B.armR, el[0], el[1], B.armR * 0.9), fo = R.capsule(el[0], el[1], B.armR * 0.9, wr[0], wr[1], B.foreR);
    if (O.sleeve === 'none') R.paint(c, R.union([up, fo]), L.skin, L.skinS);
    else if (O.sleeve === 'short') { R.paint(c, up, L.shirt, L.shirtS); R.paint(c, fo, L.skin, L.skinS); }
    else R.paint(c, R.union([up, fo]), L.shirt, L.shirtS);
    R.disc(c, wr[0], wr[1], B.handR, L.skin, L.skinS, LW * 0.8);
  }
  function headBase(c, rc, J) {
    var B = rc.B, L = rc.look, h = J.hd;
    R.paint(c, R.ell(h[0], h[1], B.headRx, B.headRy), L.skin, L.skinS, LW);
  }
  function halo(c, rc) {
    if (!rc.halo) return;
    var g = c.createRadialGradient(0, -0.02, 0, 0, -0.02, 0.46);
    g.addColorStop(0, rc.halo); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.beginPath(); c.ellipse(0, -0.02, 0.46, 0.17, 0, 0, TAU); c.fill();
  }
  function call(obj, fn, args) { if (obj && obj[fn]) return obj[fn].apply(obj, args); }

  // Low layer: halo, legs, back arm, back items, torso and outfit, front arm, hand props, hook.
  R.drawLow = function (c, rc, J, p) {
    var ch = P.ArtChars || {}, live = rc.live || {};
    halo(c, rc);
    drawLeg(c, rc, J, 'L'); drawLeg(c, rc, J, 'R');
    if (!live.back) drawArm(c, rc, J, 'L');
    call(ch, 'back', [c, rc, J]);
    call(ch, 'drawTop', [c, rc, J]);
    if (!live.front) drawArm(c, rc, J, 'R');
    call(ch, 'props', [c, rc, J]);
    if (rc.hook) rc.hook(c, rc, J, 'low');
  };
  // High layer (rendered at the reference head pose; the head offset is applied at draw time).
  R.drawHigh = function (c, rc, J) {
    var ch = P.ArtChars || {};
    call(ch, 'headBack', [c, rc, J]);
    headBase(c, rc, J);
    call(ch, 'face', [c, rc, J]);
    call(ch, 'hair', [c, rc, J]);
    call(ch, 'hat', [c, rc, J]);
    if (rc.hook) rc.hook(c, rc, J, 'high');
  };

  // ---- pre-render cache ----
  // Bucketed device scale: sprites are baked at the nearest 4% step so zoom pulses do not thrash.
  R.bucket = function (px) { var s = Math.log(1.04); return Math.exp(Math.round(Math.log(Math.max(4, px)) / s) * s); };
  // Least recently used under a byte budget (view.quality.spriteCacheMB). A hit moves the entry to the back; a bake that takes the
  // total over the budget drops the front (least recent) entries. The old rule dropped half the entries by count at 700, and a
  // crowd whose walk poses cycle needs more layers than that, so it rebaked dozens of canvases every frame (T4 part 12).
  var cache = new Map(), cacheBytes = 0;
  function budget() { return (P.CFG.view.quality ? P.CFG.view.quality.spriteCacheMB : 64) * 1048576; }
  function trim() {
    var lim = budget(), k, old;
    while (cacheBytes > lim && cache.size > 1) {
      k = cache.keys().next().value; old = cache.get(k);
      cacheBytes -= old.bytes; old.live = false; cache.delete(k);
    }
  }
  // Bake draw(ctx) in unit space into a canvas covering box [l, r, t, b]. Returns an entry.
  R.bake = function (key, U, box, draw) {
    var k = key + '@' + U.toFixed(1), e = cache.get(k), cv, g;
    if (e) { cache.delete(k); cache.set(k, e); return e; }
    cv = document.createElement('canvas');
    cv.width = Math.max(2, Math.ceil((box[1] - box[0]) * U)); cv.height = Math.max(2, Math.ceil((box[3] - box[2]) * U));
    g = cv.getContext('2d');
    g.setTransform(U, 0, 0, U, -box[0] * U, -box[2] * U);
    draw(g);
    e = { cv: cv, ax: -box[0] * U, ay: -box[2] * U, U: U, white: null, bytes: cv.width * cv.height * 4, live: true };
    cache.set(k, e); cacheBytes += e.bytes; trim();
    return e;
  };
  // White silhouette of an entry (hit flash), built once and cached on the entry. Its bytes count against the budget too.
  R.white = function (e) {
    if (e.white) return e.white;
    var cv = document.createElement('canvas'), g;
    cv.width = e.cv.width; cv.height = e.cv.height; g = cv.getContext('2d');
    g.drawImage(e.cv, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, cv.width, cv.height);
    e.white = { cv: cv, ax: e.ax, ay: e.ay, U: e.U, white: null, bytes: 0, live: false };
    if (e.live) { e.bytes += cv.width * cv.height * 4; cacheBytes += cv.width * cv.height * 4; }
    return e.white;
  };
  // Draw an entry feet-anchored at (X, Y) in CSS px. u = CSS px per unit, f = facing (+1/-1),
  // sq = {x, y} squash, ox/oy = recoil in CSS px, dx/dy = unit offset inside the figure (mirrors with f).
  // One setTransform-style call (translate, rotate about the feet, then scale) instead of three.
  R.blit = function (c, e, X, Y, u, f, sq, ox, oy, dx, dy) {
    var k = u / e.U, sx = sq ? sq.x : 1, sy = sq ? sq.y : 1, sx2 = f * sx, r = sq && sq.r ? sq.r : 0, co = Math.cos(r), si = Math.sin(r);
    c.save(); c.transform(co * sx2, si * sx2, -si * sy, co * sy, X + (ox || 0), Y + (oy || 0));   // sq.r: tilt about the feet (screen space)
    c.drawImage(e.cv, (dx || 0) * u - e.ax * k, (dy || 0) * u - e.ay * k, e.cv.width * k, e.cv.height * k);
    c.restore();
  };
  R.cacheSize = function () { return cache.size; };
  R.cacheBytes = function () { return cacheBytes; };
  return R;
})();
