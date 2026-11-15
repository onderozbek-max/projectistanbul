// Base weapon silhouettes (17; the sil ids in config-weapon-tiers.js). Each drawer is (c, R, E, L): E = the live entity (metres,
// E.a angle, E.q progress 0..1, E.age seconds alive, E.hist recent positions, E.seed, E.hx/E.hy the hero, E.layer the pass,
// E.src the sim entity, E.now the clock) and L = the table row after the frame modifiers (scale, count, trail, glow metres,
// after, ring, col, alpha). Each shape is its own form, so no two base weapons read alike; the level only changes the numbers.
(function () {
  var M = P.WSil.prim, TAU = M.TAU, W = P.WSil, DEG = Math.PI / 180;
  function ease(q) { return 1 - Math.pow(1 - M.clamp(q), 2); }
  // Ellipse outline (local metres) with n points.
  function ell(rx, ry, n) {
    var out = [], i;
    for (i = 0; i < n; i++) out.push([rx * Math.cos(TAU * i / n), ry * Math.sin(TAU * i / n)]);
    return out;
  }
  // Half-arc of a shot in radians from its src (arcDeg or spreadDeg in the sim config), else a default.
  function srcHalf(E, dflt) { return E.src && E.src.arc ? E.src.arc * DEG / 2 : dflt; }

  // knifeArc (melee swing): a crescent sweeping across E.half either side of E.a. L.count stacked crescents, a bright tail behind
  // the head (trail), ghost copies (after), and a shock ring at the tip on the top level (ring).
  W.knifeArc = function (c, R, E, L) {
    var A = L.alpha, q = M.clamp(E.q), r = (E.range || 1.3) * (0.85 + 0.05 * L.scale), a0 = E.a - E.half, a1 = a0 + 2 * E.half * ease(q), j, k;
    M.glow(c, R, E.hx, E.hy, L.glow, L.col, 0.3 * A * (1 - q));
    for (j = 1; j <= L.after; j++) M.arc(c, R, E.hx, E.hy, r, a0 + 0.1 * j, a1 - 0.08 * j, L.col, 0.22 * A / j * (1 - q), 2 + L.scale);
    for (k = 0; k < L.count; k++) {
      M.arc(c, R, E.hx, E.hy, r * (1 - 0.07 * k), a0, a1, L.col, 0.95 * A * (1 - 0.6 * q), (2.4 + 1.2 * L.scale) * (1 - 0.2 * k));
      if (L.trail > 0) M.arc(c, R, E.hx, E.hy, r * (1 - 0.07 * k), Math.max(a0, a1 - 2 * E.half * L.trail), a1, '255,255,255', 0.7 * A * (1 - q), 1.4);
    }
    if (L.ring > 0 && q > 0.15) M.ring(c, R, E.hx + Math.cos(a1) * r, E.hy + Math.sin(a1) * r, 0.25 + 0.5 * q, L.col, 0.6 * A * (1 - q), 1.5);
  };

  // nailBurst (nailgun): L.count thin nails fanned across E.half either side of E.a, each a shaft with a head, flying out with the
  // shot. Ghost copies (after) and a muzzle ring (ring) on the top level.
  W.nailBurst = function (c, R, E, L) {
    var A = L.alpha, q = M.clamp(E.q), n = Math.max(1, L.count), len = 0.5 + 0.35 * L.scale, k, j, a, r, cs, sn;
    M.glow(c, R, E.hx, E.hy, L.glow * 0.7, L.col, 0.25 * A * (1 - q));
    for (k = 0; k < n; k++) {
      a = n === 1 ? E.a : E.a - E.half + 2 * E.half * k / (n - 1);
      cs = Math.cos(a); sn = Math.sin(a); r = 0.6 + 2.2 * L.scale * q;
      for (j = 1; j <= L.after; j++) M.seg(c, R, E.hx + cs * (r - 0.4 * j), E.hy + sn * (r - 0.4 * j), E.hx + cs * (r - 0.4 * j - len), E.hy + sn * (r - 0.4 * j - len), L.col, 0.25 * A / j, 1.5);
      M.seg(c, R, E.hx + cs * (r - len), E.hy + sn * (r - len), E.hx + cs * r, E.hy + sn * r, L.col, 0.95 * A * (1 - 0.5 * q), 1.4 + 0.5 * L.scale);
      M.disc(c, R, E.hx + cs * r, E.hy + sn * r, 0.05 * L.scale, '255,255,255', 0.9 * A * (1 - q));
    }
    if (L.ring > 0 && q < 0.5) M.ring(c, R, E.hx, E.hy, 0.3 + 1.2 * q, L.col, 0.5 * A * (1 - 2 * q), 1.5);
  };

  // lobArc (canister): a canister on a high arc from the hero to the landing spot. Its shadow is on the ground pass; the body is in
  // the air pass with L.count bands; a dotted arc trails behind (trail).
  W.lobArc = function (c, R, E, L) {
    var A = L.alpha, q = M.clamp(E.q), S = L.scale, p = M.pos(E.src, q), lift = 1.4 * Math.sin(Math.PI * q) * (0.6 + 0.4 * S), k, pq, n, i;
    if (E.layer === 'ground') { M.disc(c, R, p.x, p.y, 0.2 * S, '0,0,0', 0.2 * A); return; }
    n = Math.round(L.trail * 14);
    for (k = 1; k <= n; k++) {
      pq = q - k * 0.035; if (pq < 0) break;
      p = M.pos(E.src, pq);
      M.disc(c, R, p.x, p.y + 1.4 * Math.sin(Math.PI * pq) * (0.6 + 0.4 * S), 0.035 * S * (1 - k / (n + 1)), L.col, 0.6 * A * (1 - k / (n + 1)));
    }
    p = M.pos(E.src, q);
    M.glow(c, R, p.x, p.y + lift, L.glow * 0.5, L.col, 0.4 * A);
    M.disc(c, R, p.x, p.y + lift, 0.16 * S, '70,74,82', 0.95 * A);
    M.disc(c, R, p.x, p.y + lift, 0.1 * S, L.col, 0.95 * A);
    for (i = 0; i < L.count; i++) M.seg(c, R, p.x - 0.14 * S, p.y + lift + (i - (L.count - 1) / 2) * 0.07 * S, p.x + 0.14 * S, p.y + lift + (i - (L.count - 1) / 2) * 0.07 * S, '60,20,10', 0.5 * A, 1);
  };

  // linkWhip (chain blade): a run of L.count chain links along the ring at the blade's angle, with a faint ring arc behind (trail).
  W.linkWhip = function (c, R, E, L) {
    var A = L.alpha, rad = E.rad || 1.5, span = 0.14 * L.scale / rad, k, a, x, y, link = ell(0.1 * L.scale, 0.05 * L.scale, 8);
    if (L.trail > 0) M.arc(c, R, E.hx, E.hy, rad, E.a - 1.1 * L.trail, E.a, L.col, 0.45 * A, 2 + L.scale);
    for (k = 0; k < L.count; k++) {
      a = E.a - k * span;
      x = E.hx + Math.cos(a) * rad; y = E.hy + Math.sin(a) * rad;
      M.poly(c, R, M.local(link, x, y, a + Math.PI / 2), L.col, 0.95 * A * (1 - 0.04 * k), 1.5 + 0.4 * L.scale, true);
    }
    M.glow(c, R, E.hx + Math.cos(E.a) * rad, E.hy + Math.sin(E.a) * rad, L.glow * 0.6, L.col, 0.25 * A);
    if (L.after > 0) M.arc(c, R, E.hx, E.hy, rad, E.a - 0.25, E.a - 0.1, L.col, 0.25 * A, 2);
  };

  // overheadSlam (sledgehammer; slams run DOWN, so E.q rises from the windup start to the drop): a warning disc on the ground,
  // the head coming down from above with L.count bands, and shock rings on the drop (ring).
  W.overheadSlam = function (c, R, E, L) {
    var A = L.alpha, q = M.clamp(E.q), rr = 1.1 * L.scale, drop = 1.4 * (1 - q) * L.scale + 0.2, k, i, hx = E.x, hy = E.y + drop;
    if (E.layer === 'ground') {
      M.disc(c, R, E.x, E.y, rr * q, L.col, 0.2 * A);
      M.ring(c, R, E.x, E.y, rr, L.col, 0.7 * A, 1.4 + L.scale);
      for (k = 0; k < L.ring && q > 0.92; k++) M.ring(c, R, E.x, E.y, rr * (0.8 + 0.5 * (q - 0.92) * 12 + 0.25 * k), L.col, 0.5 * A * (1 - (q - 0.92) * 12), 2);
      return;
    }
    M.seg(c, R, hx, hy, hx, hy + 1.1 * L.scale, '70,60,50', 0.9 * A, 2 + L.scale);
    M.fill(c, R, [[hx - 0.5 * L.scale, hy - 0.2 * L.scale], [hx + 0.5 * L.scale, hy - 0.2 * L.scale], [hx + 0.5 * L.scale, hy + 0.22 * L.scale], [hx - 0.5 * L.scale, hy + 0.22 * L.scale]], '58,62,70', 0.95 * A);
    M.seg(c, R, hx - 0.5 * L.scale, hy + 0.22 * L.scale, hx + 0.5 * L.scale, hy + 0.22 * L.scale, L.col, 0.95 * A, 2.5);
    for (i = 1; i < L.count; i++) M.seg(c, R, hx - 0.5 * L.scale + i * (L.scale / L.count), hy - 0.2 * L.scale, hx - 0.5 * L.scale + i * (L.scale / L.count), hy + 0.22 * L.scale, '40,30,20', 0.35 * A, 1);
  };

  // bottleFlame (molotov): a bottle flying on its arc with L.count flame tongues from the neck and a green-to-orange glow.
  W.bottleFlame = function (c, R, E, L) {
    var A = L.alpha, q = M.clamp(E.q), S = L.scale, p = M.pos(E.src, q), lift = 1.2 * Math.sin(Math.PI * q), x = p.x, y = p.y + lift, i, tl, off, ang;
    if (E.layer === 'ground') { M.disc(c, R, p.x, p.y, 0.18 * S, '0,0,0', 0.18 * A); return; }
    M.trail(c, R, E.hist, L.col, 0.5 * A, 2 + S, L.trail);
    M.glow(c, R, x, y, L.glow, L.col, 0.4 * A);
    M.fill(c, R, M.local([[-0.11 * S, -0.1 * S], [0.11 * S, -0.1 * S], [0.11 * S, 0.12 * S], [-0.11 * S, 0.12 * S]], x, y, E.a), '64,88,70', 0.9 * A);
    M.fill(c, R, M.local([[-0.05 * S, 0.12 * S], [0.05 * S, 0.12 * S], [0.04 * S, 0.22 * S], [-0.04 * S, 0.22 * S]], x, y, E.a), '64,88,70', 0.9 * A);
    for (i = 0; i < L.count; i++) {
      off = (i - (L.count - 1) / 2) * 0.09 * S; ang = (i - (L.count - 1) / 2) * 0.25;
      tl = (0.16 + 0.1 * M.noise(E.seed + i, E.now * 9)) * S;
      M.fill(c, R, [[x + off - 0.05 * S, y + 0.22 * S], [x + off + 0.05 * S, y + 0.22 * S], [x + off + Math.sin(ang) * tl, y + 0.22 * S + tl]], L.col, 0.85 * A);
    }
  };

  // rocketSpiral (fireworks): a rocket with a spiral tail of L.count turns behind it, the spiral widening with the level.
  W.rocketSpiral = function (c, R, E, L) {
    var A = L.alpha, e = E.src, n = Math.max(6, L.count * 4), pts = [], k, f, amp, bx, by, px, py, cs = Math.cos(e.a || 0), sn = Math.sin(e.a || 0);
    for (k = 0; k <= n; k++) {
      f = k / n; amp = 0.12 * L.scale * f * Math.sin(f * L.count * TAU) * 2;
      bx = e.x - cs * 1.3 * L.scale * f * (1 - E.q * 0.5); by = e.y - sn * 1.3 * L.scale * f * (1 - E.q * 0.5);
      px = -sn * amp; py = cs * amp;
      pts.push([bx + px, by + py]);
    }
    M.glow(c, R, e.x, e.y, L.glow, L.col, 0.4 * A);
    M.poly(c, R, pts, L.col, 0.6 * A * (1 - 0.3 * E.q), 1.5 + L.scale, false);
    M.disc(c, R, e.x, e.y, 0.07 * L.scale, '255,255,255', 0.95 * A);
  };

  // boltCoil (cable): a lightning bolt from the source to the target, zigzagging in L.count pairs of runs, flickering with its seed.
  W.boltCoil = function (c, R, E, L) {
    var A = L.alpha, s0 = E.src, fade = 1 - M.clamp(E.q), n = Math.max(3, L.count * 3), pts = [], i, f, amp, dx = s0.x1 - s0.x0, dy = s0.y1 - s0.y0,
      len = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / len, ny = dx / len;
    for (i = 0; i <= n; i++) {
      f = i / n; amp = (i % 2 ? 1 : -1) * 0.16 * L.scale * (i === 0 || i === n ? 0 : 1) * (0.6 + 0.4 * M.noise(E.seed + i, E.now * 30));
      pts.push([s0.x0 + dx * f + nx * amp, s0.y0 + dy * f + ny * amp]);
    }
    M.glow(c, R, s0.x1, s0.y1, L.glow, L.col, 0.35 * A * fade);
    M.poly(c, R, pts, L.col, 0.4 * A * fade, 5 + 2 * L.scale, false);
    M.poly(c, R, pts, '255,255,255', 0.95 * A * fade, 1.2 + 0.5 * L.scale, false);
    if (L.ring > 0) M.ring(c, R, s0.x1, s0.y1, 0.2 + 0.35 * E.q, L.col, 0.7 * A * fade, 1.5);
  };

  // harpoonLine (speargun): a taut line from the hero to the spear tip, a barbed head with L.count barbs, a trail of the tip's path.
  W.harpoonLine = function (c, R, E, L) {
    var A = L.alpha, s0 = E.src, S = L.scale, ang = Math.atan2(s0.dy, s0.dx), i, bx, head = [[-0.6 * S, 0], [0.25 * S, 0]];
    M.seg(c, R, E.hx, E.hy, s0.x, s0.y, '210,210,210', 0.5 * A, 1.1);
    M.trail(c, R, E.hist, L.col, 0.5 * A, 2.5, L.trail);
    M.glow(c, R, s0.x, s0.y, L.glow, L.col, 0.35 * A);
    M.poly(c, R, M.local(head, s0.x, s0.y, ang), L.col, 0.95 * A, 2 + S, false);
    for (i = 0; i < L.count; i++) {
      bx = -0.35 * S + i * 0.1 * S;
      M.poly(c, R, M.local([[bx, 0], [bx - 0.12 * S, 0.12 * S]], s0.x, s0.y, ang), L.col, 0.9 * A, 1.4, false);
      M.poly(c, R, M.local([[bx, 0], [bx - 0.12 * S, -0.12 * S]], s0.x, s0.y, ang), L.col, 0.9 * A, 1.4, false);
    }
  };

  // foamCone (extinguisher): L.count foam blobs in the cone from the hero (E.src.a, arc in degrees, range in metres), spreading out
  // over the first moments of the spray.
  W.foamCone = function (c, R, E, L) {
    var A = L.alpha, s0 = E.src, range = (s0.range || 2.5), half = srcHalf(E, 0.9), grow = M.clamp(E.age / 0.25), i, f, a, d, r;
    M.glow(c, R, E.hx, E.hy, L.glow * 0.8, '226,246,255', 0.18 * A);
    for (i = 0; i < L.count; i++) {
      f = (i + 0.5) / L.count; a = s0.a - half + 2 * half * f;
      d = range * (0.35 + 0.65 * M.noise(E.seed + i, E.age * 4)) * grow;
      r = (0.1 + 0.05 * L.scale) * (0.7 + 0.5 * M.noise(i, E.seed));
      M.disc(c, R, E.hx + Math.cos(a) * d, E.hy + Math.sin(a) * d, r, L.col, 0.6 * A * (1 - 0.5 * E.q));
    }
  };

  // sawDisc (sawblade): a spinning disc with L.count teeth (2 x count points), a dark hub, a trail behind it.
  W.sawDisc = function (c, R, E, L) {
    var A = L.alpha, S = L.scale, spin = E.now * 9 + E.seed, pts = [], i, rr, n = Math.max(3, L.count);
    M.trail(c, R, E.hist, L.col, 0.4 * A, 2, L.trail);
    M.glow(c, R, E.x, E.y, L.glow, L.col, 0.35 * A);
    for (i = 0; i < 2 * n; i++) {
      rr = i % 2 ? 0.3 * S : 0.4 * S;
      pts.push([rr * Math.cos(spin + i * Math.PI / n), rr * Math.sin(spin + i * Math.PI / n)]);
    }
    M.fill(c, R, pts.map(function (p) { return [E.x + p[0], E.y + p[1]]; }), L.col, 0.9 * A);
    M.disc(c, R, E.x, E.y, 0.1 * S, '40,46,56', 0.9 * A);
  };

  // coverFrisbee (manhole cover): a flat disc spinning in flight with L.count rim holes and a trail. The steel-to-ember ramp is its
  // colour at higher levels.
  W.coverFrisbee = function (c, R, E, L) {
    var A = L.alpha, S = L.scale, k, a, n = Math.max(2, L.count);
    M.trail(c, R, E.hist, L.col, 0.4 * A, 2, L.trail);
    M.glow(c, R, E.x, E.y, L.glow, L.col, 0.3 * A);
    M.disc(c, R, E.x, E.y, 0.28 * S, L.col, 0.9 * A);
    M.ring(c, R, E.x, E.y, 0.28 * S, '20,24,30', 0.7 * A, 1.5);
    for (k = 0; k < n; k++) {
      a = E.now * 8 + k * TAU / n;
      M.disc(c, R, E.x + Math.cos(a) * 0.18 * S, E.y + Math.sin(a) * 0.18 * S, 0.045 * S, '20,24,30', 0.8 * A);
    }
  };

  // flameJet (torch): L.count flame tongues along the jet from the hero, its reach (range) and width (arc) from the shot, on the
  // ground pass so the hero is drawn over it.
  W.flameJet = function (c, R, E, L) {
    var A = L.alpha, s0 = E.src, range = s0.range || 2.5, half = srcHalf(E, 0.6), i, f, a, d, tipX, tipY, bx, by;
    M.glow(c, R, E.hx, E.hy, L.glow * 0.8, L.col, 0.22 * A);
    for (i = 0; i < L.count; i++) {
      f = (i + 0.5) / L.count; a = s0.a + (M.noise(E.seed + i, E.now * 5) - 0.5) * 2 * half * (0.4 + 0.6 * f);
      d = range * (0.35 + 0.65 * f) * (0.85 + 0.15 * M.noise(i, E.now * 11));
      bx = E.hx + Math.cos(a) * 0.3; by = E.hy + Math.sin(a) * 0.3; tipX = E.hx + Math.cos(a) * d; tipY = E.hy + Math.sin(a) * d;
      M.fill(c, R, [[bx - Math.sin(a) * 0.1 * L.scale, by + Math.cos(a) * 0.1 * L.scale], [bx + Math.sin(a) * 0.1 * L.scale, by - Math.cos(a) * 0.1 * L.scale], [tipX, tipY]], L.col, 0.55 * A * (1 - 0.4 * f));
    }
  };

  // hookLine (olta): a cord from the hero to the hook tip, the tip on its cast toward the target (progress E.q), a curved hook with
  // L.count barbs. The target is the sim's hooked enemy when there is one.
  W.hookLine = function (c, R, E, L) {
    var A = L.alpha, s0 = E.src, tg = s0.e, q = M.clamp(E.q), tx = E.hx, ty = E.hy, S = L.scale, i;
    if (tg && tg.x !== undefined) { tx = E.hx + (tg.x - E.hx) * q; ty = E.hy + (tg.y - E.hy) * q; }
    M.seg(c, R, E.hx, E.hy, tx, ty, '230,220,190', 0.55 * A, 1.1);
    M.glow(c, R, tx, ty, L.glow, L.col, 0.3 * A);
    M.arc(c, R, tx, ty, 0.14 * S, -Math.PI / 2, Math.PI / 2, L.col, 0.95 * A, 2 + S);
    for (i = 0; i < L.count; i++) M.disc(c, R, tx + 0.16 * S * Math.cos(i * 2.1), ty + 0.16 * S * Math.sin(i * 2.1), 0.03 * S, L.col, 0.8 * A);
  };

  // doorShield (cardoor): a car door swinging round the hero on its radius (src.radius), its angle the shot's aim plus the swing;
  // L.count window bars; a swing arc behind it (trail).
  W.doorShield = function (c, R, E, L) {
    var A = L.alpha, s0 = E.src, rad = s0.radius || 1.6, th = s0.a + (E.q - 0.5) * (s0.arc || 90) * DEG, S = L.scale, i, dx, dy, pts;
    if (L.trail > 0) M.arc(c, R, E.hx, E.hy, rad, th - 0.9 * L.trail, th, L.col, 0.4 * A, 2);
    dx = E.hx + Math.cos(th) * rad; dy = E.hy + Math.sin(th) * rad;
    M.glow(c, R, dx, dy, L.glow, L.col, 0.3 * A);
    pts = M.local([[-0.26 * S, -0.1 * S], [0.26 * S, -0.1 * S], [0.26 * S, 0.1 * S], [-0.26 * S, 0.1 * S]], dx, dy, th + Math.PI / 2);
    M.fill(c, R, pts, L.col, 0.92 * A);
    for (i = 1; i <= L.count; i++) M.seg(c, R, dx + Math.cos(th + Math.PI / 2) * (-0.26 * S + 0.52 * S * i / (L.count + 1)) + Math.cos(th) * 0.05 * S, dy + Math.sin(th + Math.PI / 2) * (-0.26 * S + 0.52 * S * i / (L.count + 1)) + Math.sin(th) * 0.05 * S,
      dx + Math.cos(th + Math.PI / 2) * (-0.26 * S + 0.52 * S * i / (L.count + 1)) + Math.cos(th) * 0.13 * S, dy + Math.sin(th + Math.PI / 2) * (-0.26 * S + 0.52 * S * i / (L.count + 1)) + Math.sin(th) * 0.13 * S, '40,20,20', 0.6 * A, 1.2);
  };

  // marbleFan (slingshot): the marble with up to L.count copies of its path behind it, shrinking and fading.
  W.marbleFan = function (c, R, E, L) {
    var A = L.alpha, S = L.scale, h = E.hist, i, p;
    M.glow(c, R, E.x, E.y, L.glow, L.col, 0.3 * A);
    for (i = 0; i < L.count && i < h.length; i++) {
      p = h[h.length - 1 - i];
      M.disc(c, R, p.x, p.y, 0.09 * S * (1 - 0.12 * i), L.col, 0.7 * A * (1 - 0.14 * i));
    }
    M.disc(c, R, E.x, E.y, 0.1 * S, '255,255,255', 0.95 * A);
    M.disc(c, R, E.x, E.y, 0.07 * S, L.col, 0.95 * A);
  };

  // revBar (chainsaw): a bar out of the hero's hand (0.35 m), 1.3 scale metres long, L.count teeth, buzzing with a small jitter.
  W.revBar = function (c, R, E, L) {
    var A = L.alpha, S = L.scale, a = E.a, cs = Math.cos(a), sn = Math.sin(a), px = -sn, py = cs, len = 1.3 * S, buzz = Math.sin(E.now * 60) * 0.02, i, f, bx, by, k;
    var x0 = E.hx + cs * 0.35 + px * buzz, y0 = E.hy + sn * 0.35 + py * buzz;
    M.glow(c, R, x0 + cs * len * 0.5, y0 + sn * len * 0.5, L.glow, L.col, 0.3 * A);
    M.fill(c, R, [[x0 + px * 0.05 * S, y0 + py * 0.05 * S], [x0 + cs * len + px * 0.05 * S, y0 + sn * len + py * 0.05 * S],
      [x0 + cs * len - px * 0.05 * S, y0 + sn * len - py * 0.05 * S], [x0 - px * 0.05 * S, y0 - py * 0.05 * S]], '70,74,82', 0.95 * A);
    for (i = 0; i < L.count; i++) {
      f = (i + 0.5) / L.count; bx = x0 + cs * len * f; by = y0 + sn * len * f; k = i % 2 ? 1 : -1;
      M.seg(c, R, bx, by, bx + px * 0.08 * S * k, by + py * 0.08 * S * k, L.col, 0.9 * A, 1.6);
    }
  };

  Object.assign(W.layer, {
    knifeArc: 'air', nailBurst: 'air', lobArc: 'both', linkWhip: 'air', overheadSlam: 'both', bottleFlame: 'both', rocketSpiral: 'air',
    boltCoil: 'air', harpoonLine: 'air', foamCone: 'ground', sawDisc: 'air', coverFrisbee: 'air', flameJet: 'ground', hookLine: 'air',
    doorShield: 'air', marbleFan: 'air', revBar: 'air',
  });
  W.ell = ell;
})();
