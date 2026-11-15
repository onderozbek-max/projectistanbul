// Evolution silhouettes (18; the sil ids in config-weapon-tiers.js evos). Each is a clearly different form from its base (the base is
// the weapon it evolves from): a ring of blades, a nail fan of dashes, a pod cluster, a whirling blade ring, sky rain streaks, an
// anvil, a shield orbit, a foam wall, a net, a lake of ripples, twin discs, a fire orb, arc links, a car box, a forge jet, a grinder
// wheel, a hook haul, a bus door. Same drawer signature and table row as weapon-sil.js (see there).
(function () {
  var M = P.WSil.prim, TAU = M.TAU, W = P.WSil, DEG = Math.PI / 180;
  function ease(q) { return 1 - Math.pow(1 - M.clamp(q), 2); }

  // cleaverRing (cleaver, a hero ring): L.count cleaver blades evenly round the ring at E.rad, a sweep arc trailing the spin (trail),
  // ghost rings (after) and a pulse ring (ring). Drawn on the ground pass so the hero stands over it.
  W.cleaverRing = function (c, R, E, L) {
    var A = L.alpha, rad = E.rad || 2.4, S = L.scale, k, a, j, n = Math.max(2, L.count);
    M.arc(c, R, E.hx, E.hy, rad, 0, TAU, L.col, 0.12 * A, 5 * S);
    if (L.trail > 0) M.arc(c, R, E.hx, E.hy, rad * 0.9, E.a - 1.4 * L.trail, E.a, L.col, 0.35 * A, 3 + S);
    for (j = 1; j <= L.after; j++) M.arc(c, R, E.hx, E.hy, rad * (1 + 0.12 * j), E.a - 0.9, E.a - 0.4, L.col, 0.2 * A / j, 2);
    for (k = 0; k < n; k++) {
      a = E.a + k * TAU / n;
      M.arc(c, R, E.hx, E.hy, rad, a - 0.2, a + 0.2, L.col, 0.95 * A, 2 + 1.5 * S);
    }
    if (L.ring > 0) M.ring(c, R, E.hx, E.hy, rad * (1.02 + 0.08 * ((E.now * 2) % 1)), '255,255,255', 0.25 * A, 1.2);
  };

  // nailSpray (nailstorm, shot): a wide fan of dashes (count) across E.half either side of E.a at staggered reach, a bullet-hell
  // spray. Afterimages (after) and a muzzle ring (ring) on the top level.
  W.nailSpray = function (c, R, E, L) {
    var A = L.alpha, q = M.clamp(E.q), n = Math.max(2, L.count), S = L.scale, k, a, r, j, f, cs, sn;
    M.glow(c, R, E.hx, E.hy, L.glow * 0.6, L.col, 0.3 * A * (1 - q));
    for (k = 0; k < n; k++) {
      a = E.a - E.half + 2 * E.half * k / (n - 1); cs = Math.cos(a); sn = Math.sin(a);
      f = 0.6 + 0.4 * ((k * 7) % 5) / 5;
      r = 0.5 + 3.0 * S * q * f;
      for (j = 1; j <= L.after; j++) M.seg(c, R, E.hx + cs * (r - 0.5 * j), E.hy + sn * (r - 0.5 * j), E.hx + cs * (r - 0.5 * j - 0.4 * S), E.hy + sn * (r - 0.5 * j - 0.4 * S), L.col, 0.2 * A / j, 1.2);
      M.seg(c, R, E.hx + cs * (r - 0.4 * S), E.hy + sn * (r - 0.4 * S), E.hx + cs * r, E.hy + sn * r, L.col, 0.95 * A * (1 - 0.5 * q), 1.4 + 0.4 * S);
    }
    if (L.ring > 0 && q < 0.5) M.ring(c, R, E.hx, E.hy, 0.3 + 1.4 * q, L.col, 0.5 * A * (1 - 2 * q), 1.8);
  };

  // podCluster (cluster canister): the canister's flight as a lift arc; L.count pods orbit the centre at 0.22 scale metres. The
  // ground pass shows nothing (the lob's shadow is the canister's).
  W.podCluster = function (c, R, E, L) {
    var A = L.alpha, q = M.clamp(E.q), S = L.scale, p = M.pos(E.src, q), lift = 1.2 * Math.sin(Math.PI * q) * (0.6 + 0.4 * S), k, a, n = Math.max(2, L.count);
    if (E.layer === 'ground') return;
    M.trail(c, R, E.hist, L.col, 0.4 * A, 2, L.trail);
    M.glow(c, R, p.x, p.y + lift, L.glow, L.col, 0.4 * A);
    M.disc(c, R, p.x, p.y + lift, 0.1 * S, '255,240,200', 0.95 * A);
    for (k = 0; k < n; k++) {
      a = E.now * 6 + k * TAU / n;
      M.disc(c, R, p.x + Math.cos(a) * 0.22 * S, p.y + lift + Math.sin(a) * 0.22 * S * 0.5, 0.07 * S, L.col, 0.95 * A);
    }
  };

  // bladeWhirl (cyclone, one blade per ring slot): a curved blade at E.rad with a bright head, a trail behind it, ghost copies, and
  // a faint pull ring (pullR) drawn once on the first blade.
  W.bladeWhirl = function (c, R, E, L) {
    var A = L.alpha, S = L.scale, rad = E.rad || 2.3, a = E.a, j;
    if (E.idx === 0 && E.pullR) M.ring(c, R, E.hx, E.hy, E.pullR, L.col, 0.14 * A, 1.2);
    if (L.trail > 0) M.arc(c, R, E.hx, E.hy, rad, a - 0.9 * L.trail, a, L.col, 0.5 * A, 3 + S);
    for (j = 1; j <= L.after; j++) M.arc(c, R, E.hx, E.hy, rad, a - 0.5 - 0.12 * j, a - 0.3 - 0.12 * j, L.col, 0.25 * A / j, 2);
    M.arc(c, R, E.hx, E.hy, rad, a - 0.5, a, L.col, 0.95 * A, 2 + 1.4 * S);
    M.disc(c, R, E.hx + Math.cos(a) * rad, E.hy + Math.sin(a) * rad, 0.08 * S, '255,255,255', 0.95 * A);
    M.glow(c, R, E.hx + Math.cos(a) * rad, E.hy + Math.sin(a) * rad, L.glow * 0.6, L.col, 0.3 * A);
  };

  // skyRain (finale): L.count vertical streaks falling onto the strike point from above, each with a bright head, the level adding
  // streaks and a landing ring (ring).
  W.skyRain = function (c, R, E, L) {
    var A = L.alpha, q = M.clamp(E.q), S = L.scale, k, dx, top, n = Math.max(3, L.count), col = L.col;
    M.glow(c, R, E.x, E.y, L.glow * (0.5 + 0.5 * q), col, 0.25 * A * q);
    for (k = 0; k < n; k++) {
      dx = Math.cos(k * 2.399) * 1.1 * S * M.noise(E.seed + k, 0.3);
      top = E.y + 3.2 * S * (1 - q) + 0.8 * S;
      M.seg(c, R, E.x + dx, top, E.x + dx, top - 0.9 * S, col, 0.85 * A * (0.5 + 0.5 * q), 1.5 + 0.4 * S);
      M.disc(c, R, E.x + dx, top - 0.9 * S, 0.04 * S, '255,255,255', 0.95 * A);
    }
    if (L.ring > 0 && q > 0.9) M.ring(c, R, E.x, E.y, 0.4 + 1.2 * (q - 0.9) * 10, col, 0.6 * A * (1 - (q - 0.9) * 10), 1.6);
  };

  // anvilHammer (blacksmith slam; E.q rises from the windup start to the drop): a warning ground circle; the anvil drops onto it with
  // the sparks (count, ring) radiating at the strike.
  W.anvilHammer = function (c, R, E, L) {
    var A = L.alpha, q = M.clamp(E.q), S = L.scale, rr = 1.2 * S, drop = 2.6 * (1 - q) * S + 0.25, k, a, n = Math.max(3, L.count), hx = E.x, hy = E.y + drop;
    if (E.layer === 'ground') {
      M.disc(c, R, E.x, E.y, rr * q, L.col, 0.2 * A);
      M.ring(c, R, E.x, E.y, rr, L.col, 0.75 * A, 1.6 + S);
      if (q > 0.92) for (k = 0; k < n; k++) {
        a = k * TAU / n; M.seg(c, R, E.x + Math.cos(a) * rr * 0.6, E.y + Math.sin(a) * rr * 0.6, E.x + Math.cos(a) * rr * 1.1, E.y + Math.sin(a) * rr * 1.1, L.col, 0.8 * A, 2);
      }
      return;
    }
    M.fill(c, R, [[hx - 0.45 * S, hy - 0.22 * S], [hx + 0.45 * S, hy - 0.22 * S], [hx + 0.45 * S, hy - 0.1 * S], [hx + 0.22 * S, hy - 0.04 * S],
      [hx + 0.2 * S, hy + 0.12 * S], [hx + 0.34 * S, hy + 0.2 * S], [hx - 0.34 * S, hy + 0.2 * S], [hx - 0.2 * S, hy + 0.12 * S],
      [hx - 0.22 * S, hy - 0.04 * S], [hx - 0.45 * S, hy - 0.1 * S]], L.col, 0.95 * A);
    if (q > 0.92) for (k = 0; k < n; k++) {
      a = k * TAU / n; M.disc(c, R, hx + Math.cos(a) * 0.5 * S, hy + Math.sin(a) * 0.5 * S, 0.04 * S, '255,220,140', 0.9 * A);
    }
  };

  // shieldOrbit (stormshield, a hero ring): L.count shield arcs orbiting at E.rad (the orbit radius, spinning with the clock), a jagged
  // electric link between each pair (not under Reduce flashing).
  W.shieldOrbit = function (c, R, E, L) {
    var A = L.alpha, rad = E.rad || 1.1, n = Math.max(2, L.count), step = TAU / n, k, a, b, i, zig = [], r;
    for (k = 0; k < n; k++) {
      a = E.a + k * step;
      M.arc(c, R, E.hx, E.hy, rad, a - 0.3, a + 0.3, L.col, 0.95 * A, 2.5 + L.scale);
      if (L.reduceFlash) continue;
      b = a + step;
      zig = [];
      for (i = 0; i <= 4; i++) {
        r = rad * (1 + 0.12 * (i % 2 ? 1 : -1) * M.noise(E.seed + k * 5 + i, E.now * 20));
        zig.push([E.hx + Math.cos(a + 0.3 + (b - a - 0.6) * i / 4) * r, E.hy + Math.sin(a + 0.3 + (b - a - 0.6) * i / 4) * r]);
      }
      M.poly(c, R, zig, '255,255,255', 0.6 * A, 1.2, false);
    }
    M.ring(c, R, E.hx, E.hy, rad, L.col, 0.12 * A, 1);
  };

  // foamWall (foamstorm): a wide wall of foam, two rows of blobs (count) on an arc across the aim, the arc width from the shot (src.arc
  // in degrees), the wall pushing out with the spray.
  W.foamWall = function (c, R, E, L) {
    var A = L.alpha, s0 = E.src, half = (s0.arc || 120) * DEG / 2, range = s0.range || 3, grow = M.clamp(E.age / 0.3), n = Math.max(3, L.count), k, a, d, row;
    M.glow(c, R, E.hx, E.hy, L.glow * 0.7, '232,247,255', 0.16 * A);
    for (row = 0; row < 2; row++) for (k = 0; k < n; k++) {
      a = s0.a - half + 2 * half * (k + 0.5) / n;
      d = range * (0.55 + 0.25 * row) * grow * (0.9 + 0.2 * M.noise(E.seed + k + row * 9, 0.7));
      M.disc(c, R, E.hx + Math.cos(a) * d, E.hy + Math.sin(a) * d, (0.18 + 0.08 * L.scale) * (1 - 0.3 * row), L.col, 0.6 * A * (1 - 0.4 * E.q));
    }
  };

  // netMesh (netspear, a spear with a net): the tether, and a net patch at the tip with L.count strands crossing.
  W.netMesh = function (c, R, E, L) {
    var A = L.alpha, s0 = E.src, S = L.scale, ang = Math.atan2(s0.dy, s0.dx), n = Math.max(2, L.count), i, t, px = -Math.sin(ang), py = Math.cos(ang), cx = s0.x, cy = s0.y;
    M.seg(c, R, E.hx, E.hy, cx, cy, '230,216,180', 0.5 * A, 1);
    M.glow(c, R, cx, cy, L.glow, L.col, 0.3 * A);
    for (i = 0; i < n; i++) {
      t = -0.45 * S + 0.9 * S * i / (n - 1);
      M.seg(c, R, cx + Math.cos(ang) * t + px * 0.45 * S, cy + Math.sin(ang) * t + py * 0.45 * S, cx + Math.cos(ang) * t - px * 0.45 * S, cy + Math.sin(ang) * t - py * 0.45 * S, L.col, 0.75 * A, 1.1);
      M.seg(c, R, cx + px * t * 0.8 - Math.cos(ang) * 0.45 * S, cy + py * t * 0.8 - Math.sin(ang) * 0.45 * S, cx + px * t * 0.8 + Math.cos(ang) * 0.45 * S, cy + py * t * 0.8 + Math.sin(ang) * 0.45 * S, L.col, 0.6 * A, 1);
    }
  };

  // lakeRipple (lake, the molotov evolution): the pool's ripples (count) spreading out over its life, a faint fill, its radius from
  // the sim (src.r) times the scale. Ground pass.
  W.lakeRipple = function (c, R, E, L) {
    var A = L.alpha, s0 = E.src, r0 = (s0.r || 1.5) * L.scale * 0.8, q = M.clamp(E.q), k, f;
    if (E.layer !== 'ground') return;
    M.disc(c, R, E.x, E.y, r0, L.col, 0.12 * A * (1 - 0.5 * q));
    for (k = 0; k < L.count; k++) {
      f = ((k + 1) / L.count) * (0.5 + 0.5 * q) + 0.1 * ((E.now * 0.7 + k * 0.37) % 1);
      if (f > 1) continue;
      M.ring(c, R, E.x, E.y, r0 * f, L.col, 0.55 * A * (1 - f), 1.4 + L.scale);
    }
  };

  // twinDisc (twinsaw): L.count saw discs side by side across the direction of travel, each with 10 teeth spinning.
  W.twinDisc = function (c, R, E, L) {
    var A = L.alpha, S = L.scale, a = E.src.a || 0, px = -Math.sin(a), py = Math.cos(a), n = Math.max(2, L.count), k, off, cx, cy, i, pts, rr;
    M.trail(c, R, E.hist, L.col, 0.3 * A, 2, L.trail);
    M.glow(c, R, E.x, E.y, L.glow, L.col, 0.3 * A);
    for (k = 0; k < n; k++) {
      off = (k - (n - 1) / 2) * 0.55 * S; cx = E.x + px * off; cy = E.y + py * off;
      pts = [];
      for (i = 0; i < 20; i++) { rr = i % 2 ? 0.2 * S : 0.3 * S; pts.push([cx + rr * Math.cos(E.now * 9 + k + i * Math.PI / 10), cy + rr * Math.sin(E.now * 9 + k + i * Math.PI / 10)]); }
      M.fill(c, R, pts, L.col, 0.9 * A);
      M.disc(c, R, cx, cy, 0.07 * S, '30,40,52', 0.9 * A);
    }
  };

  // fireOrb (fireball): a big orb with L.count flame tongues round it, flickering, on its lob (the same flight as the bottle).
  W.fireOrb = function (c, R, E, L) {
    var A = L.alpha, q = M.clamp(E.q), S = L.scale, p = M.pos(E.src, q), lift = 1.2 * Math.sin(Math.PI * q), x = p.x, y = p.y + lift, k, a, tl, n = Math.max(3, L.count);
    if (E.layer === 'ground') { M.disc(c, R, p.x, p.y, 0.2 * S, '0,0,0', 0.2 * A); return; }
    M.trail(c, R, E.hist, L.col, 0.45 * A, 3 + S, L.trail);
    M.glow(c, R, x, y, L.glow, L.col, 0.5 * A);
    M.disc(c, R, x, y, 0.22 * S, L.col, 0.95 * A);
    M.disc(c, R, x, y, 0.12 * S, '255,255,255', 0.85 * A);
    for (k = 0; k < n; k++) {
      a = k * TAU / n + E.now * 2; tl = (0.2 + 0.12 * M.noise(E.seed + k, E.now * 10)) * S;
      M.fill(c, R, [[x + Math.cos(a - 0.2) * 0.2 * S, y + Math.sin(a - 0.2) * 0.2 * S], [x + Math.cos(a + 0.2) * 0.2 * S, y + Math.sin(a + 0.2) * 0.2 * S],
        [x + Math.cos(a) * (0.2 * S + tl), y + Math.sin(a) * (0.2 * S + tl)]], L.col, 0.75 * A);
    }
  };

  // arcLinks (arc chain): a glowing link at the blade's ring slot and a jagged electric arc from it to the next slot (E.n blades), with
  // L.count points in the arc.
  W.arcLinks = function (c, R, E, L) {
    var A = L.alpha, rad = E.rad || 1.5, a = E.a, n = Math.max(2, E.n || 2), step = TAU / n, pts = [], i, r, x, y, link = W.ell(0.1 * L.scale, 0.05 * L.scale, 8);
    M.poly(c, R, M.local(link, E.hx + Math.cos(a) * rad, E.hy + Math.sin(a) * rad, a + Math.PI / 2), L.col, 0.95 * A, 1.6, true);
    if (L.reduceFlash) return;
    for (i = 0; i <= L.count; i++) {
      r = rad * (1 + 0.14 * (i % 2 ? 1 : -1) * M.noise(E.seed + i, E.now * 25));
      x = E.hx + Math.cos(a + step * i / L.count) * r; y = E.hy + Math.sin(a + step * i / L.count) * r;
      pts.push([x, y]);
    }
    M.poly(c, R, pts, '255,255,255', 0.7 * A, 1.3, false);
    M.poly(c, R, pts, L.col, 0.35 * A, 4, false);
  };

  // carBox (car bomb, lobbed): a car body on the lob (a box with two window bars), oriented along its flight; shadow on the ground pass;
  // L.count debris bits tumbling behind (trail).
  W.carBox = function (c, R, E, L) {
    var A = L.alpha, q = M.clamp(E.q), S = L.scale, s0 = E.src, p = M.pos(s0, q), lift = 1.2 * Math.sin(Math.PI * q) * (0.6 + 0.4 * S),
      a = Math.atan2(s0.y1 - s0.y0, s0.x1 - s0.x0), k, d;
    if (E.layer === 'ground') { M.disc(c, R, p.x, p.y, 0.3 * S, '0,0,0', 0.2 * A); return; }
    for (k = 1; k <= L.count; k++) {
      d = M.pos(s0, Math.max(0, q - 0.04 * k));
      M.disc(c, R, d.x, d.y + 1.2 * Math.sin(Math.PI * Math.max(0, q - 0.04 * k)) * (0.6 + 0.4 * S), 0.04 * S * (1 - k / (L.count + 1)), '255,160,60', 0.55 * A * (1 - k / (L.count + 1)));
    }
    M.glow(c, R, p.x, p.y + lift, L.glow, L.col, 0.45 * A);
    M.fill(c, R, M.local([[-0.26 * S, -0.13 * S], [0.26 * S, -0.13 * S], [0.26 * S, 0.13 * S], [-0.26 * S, 0.13 * S]], p.x, p.y + lift, a), L.col, 0.95 * A);
    M.fill(c, R, M.local([[-0.12 * S, 0.02 * S], [0.1 * S, 0.02 * S], [0.1 * S, 0.12 * S], [-0.12 * S, 0.12 * S]], p.x, p.y + lift, a), '40,20,20', 0.7 * A);
  };

  // forgeJet (forge torch): two nested flame jets (orange outside, white inside) of L.count tongues, reach from the shot, and sparks.
  W.forgeJet = function (c, R, E, L) {
    var A = L.alpha, s0 = E.src, range = s0.range || 2.5, half = (s0.arc || 60) * DEG / 2, i, f, a, d;
    if (E.layer !== 'ground') return;
    M.glow(c, R, E.hx, E.hy, L.glow * 0.8, L.col, 0.25 * A);
    for (i = 0; i < L.count; i++) {
      f = (i + 0.5) / L.count; a = s0.a + (M.noise(E.seed + i, E.now * 6) - 0.5) * 2 * half * 0.6; d = range * (0.4 + 0.6 * f);
      M.fill(c, R, [[E.hx + Math.cos(a - 0.12) * 0.25, E.hy + Math.sin(a - 0.12) * 0.25], [E.hx + Math.cos(a + 0.12) * 0.25, E.hy + Math.sin(a + 0.12) * 0.25],
        [E.hx + Math.cos(a) * d, E.hy + Math.sin(a) * d]], L.col, 0.5 * A * (1 - 0.3 * f));
      M.disc(c, R, E.hx + Math.cos(a) * d * 0.7, E.hy + Math.sin(a) * d * 0.7, 0.05 * L.scale, '255,255,255', 0.7 * A);
    }
  };

  // grindWheel (grinder, the revving evolution): a spinning wheel with L.count spokes at the hero's hand, sparks off its rim.
  W.grindWheel = function (c, R, E, L) {
    var A = L.alpha, S = L.scale, a = E.a, cx = E.hx + Math.cos(a) * 0.5, cy = E.hy + Math.sin(a) * 0.5, rot = E.now * 20, k, b, n = Math.max(3, L.count);
    M.glow(c, R, cx, cy, L.glow, L.col, 0.35 * A);
    M.ring(c, R, cx, cy, 0.4 * S, L.col, 0.9 * A, 2 + S);
    for (k = 0; k < n; k++) {
      b = rot + k * TAU / n;
      M.seg(c, R, cx, cy, cx + Math.cos(b) * 0.4 * S, cy + Math.sin(b) * 0.4 * S, L.col, 0.6 * A, 1.4);
      M.disc(c, R, cx + Math.cos(b * 1.7) * 0.42 * S, cy + Math.sin(b * 1.7) * 0.42 * S, 0.025 * S, '255,220,140', 0.8 * A);
    }
    M.disc(c, R, cx, cy, 0.07 * S, '60,64,72', 0.95 * A);
  };

  // hookHaul (hookpull): the hook as on the olta, plus L.count strands from the target back to the hero (the haul).
  W.hookHaul = function (c, R, E, L) {
    var A = L.alpha, s0 = E.src, tg = s0.e, S = L.scale, i, tx = E.hx, ty = E.hy, k, off;
    if (tg && tg.x !== undefined) { tx = tg.x; ty = tg.y; }
    for (k = 0; k < L.count; k++) {
      off = (k - (L.count - 1) / 2) * 0.1 * S;
      M.seg(c, R, E.hx + off, E.hy, tx + off, ty, L.col, 0.55 * A, 1.1);
    }
    M.glow(c, R, tx, ty, L.glow, L.col, 0.35 * A);
    M.arc(c, R, tx, ty, 0.2 * S, -Math.PI / 2, Math.PI / 2, L.col, 0.95 * A, 2.5 + S);
  };

  // slamDoor (minibus): a wide bus door swung round the hero on its radius, with L.count ribs and speed lines behind it.
  W.slamDoor = function (c, R, E, L) {
    var A = L.alpha, s0 = E.src, rad = s0.radius || 1.8, th = s0.a + (E.q - 0.5) * (s0.arc || 90) * DEG, S = L.scale, i, dx, dy, k, bx, by;
    for (k = 1; k <= 3; k++) {
      bx = E.hx + Math.cos(th - 0.2 * k) * (rad - 0.3 * k); by = E.hy + Math.sin(th - 0.2 * k) * (rad - 0.3 * k);
      M.seg(c, R, bx, by, bx - Math.cos(th) * 0.4 * S, by - Math.sin(th) * 0.4 * S, L.col, 0.45 * A * (1 - k / 4), 1.5);
    }
    dx = E.hx + Math.cos(th) * rad; dy = E.hy + Math.sin(th) * rad;
    M.glow(c, R, dx, dy, L.glow, L.col, 0.3 * A);
    M.fill(c, R, M.local([[-0.45 * S, -0.14 * S], [0.45 * S, -0.14 * S], [0.45 * S, 0.14 * S], [-0.45 * S, 0.14 * S]], dx, dy, th + Math.PI / 2), L.col, 0.92 * A);
    for (i = 1; i <= L.count; i++) M.seg(c, R, dx - Math.sin(th) * 0.0 + Math.cos(th + Math.PI / 2) * (-0.45 * S + 0.9 * S * i / (L.count + 1)),
      dy + Math.sin(th + Math.PI / 2) * (-0.45 * S + 0.9 * S * i / (L.count + 1)), dx + Math.cos(th + Math.PI / 2) * (-0.45 * S + 0.9 * S * i / (L.count + 1)),
      dy + Math.sin(th + Math.PI / 2) * (-0.45 * S + 0.9 * S * i / (L.count + 1)) + 0.25 * S, '60,20,20', 0.55 * A, 1.1);
  };

  Object.assign(W.layer, {
    cleaverRing: 'ground', nailSpray: 'air', podCluster: 'air', bladeWhirl: 'air', skyRain: 'air', anvilHammer: 'both', shieldOrbit: 'air',
    foamWall: 'ground', netMesh: 'air', lakeRipple: 'ground', twinDisc: 'air', fireOrb: 'both', arcLinks: 'air', carBox: 'both',
    forgeJet: 'ground', grindWheel: 'air', hookHaul: 'air', slamDoor: 'air',
  });
})();
