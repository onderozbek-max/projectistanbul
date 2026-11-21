// Base weapon silhouettes (17; the sil ids in config-weapon-tiers.js). Each drawer is (c, R, E, L): E = the live entity (metres,
// E.a angle, E.q progress 0..1, E.age seconds alive, E.hist recent positions, E.seed, E.hx/E.hy the hero, E.layer the pass,
// E.src the sim entity, E.now the clock) and L = the table row after the frame modifiers (scale, count, trail, glow metres,
// after, ring, col, alpha). Each shape is its own form, so no two base weapons read alike; the level only changes the numbers.
(function () {
  var M = P.WSil.prim, TAU = M.TAU, W = P.WSil;
  function ease(q) { return 1 - Math.pow(1 - M.clamp(q), 2); }
  // Ellipse outline (local metres) with n points.
  function ell(rx, ry, n) {
    var out = [], i;
    for (i = 0; i < n; i++) out.push([rx * Math.cos(TAU * i / n), ry * Math.sin(TAU * i / n)]);
    return out;
  }
  // knifeArc (melee swing): a crescent sweeping across E.half either side of E.a. L.count stacked crescents, a bright tail behind
  // the head (trail), ghost copies (after), and a shock ring at the tip on the top level (ring).
  W.knifeArc = function (c, R, E, L) {
    if(R.sim && P.Weapons.state(R.sim).knifeSwing)return;
    var q = M.clamp(E.q), grip = R.heroGrips && (Math.cos(E.a) < 0 ? R.heroGrips.left : R.heroGrips.right);
    if (!grip || q > .62) return;
    var x = E.hx + (grip.x - R.X(E.hx)) / R.ppm, y = E.hy - (grip.y - R.Y(E.hy)) / R.ppm;
    var reach = Math.min(1.18, Math.max(.48, (E.range || 1.4) - .57));
    var angle = E.a + E.half * (.7 - 1.7 * ease(q));
    M.arc(c, R, x, y, reach, angle - .26, angle + .08, '46,42,47', .86 * L.alpha * (1 - q), 4.2);
    M.arc(c, R, x, y, reach, angle - .26, angle + .08, '255,245,218', .88 * L.alpha * (1 - q), 2.4);
    if (L.lv >= 4) M.arc(c, R, x, y, reach * .96, angle - .40, angle -.10, L.col, .32 * L.alpha, 1.2);
  };

  // nailBurst (nailgun): L.count thin nails fanned across E.half either side of E.a, each a shaft with a head, flying out with the
  // shot. Ghost copies (after) and a muzzle ring (ring) on the top level.
  W.nailBurst = function (c, R, E, L) {
    var grade = L.lv, q = M.clamp(E.q), fade = L.alpha * (1 - q), n = Math.max(1, E.n || 1);
    var xo = E.hx, yo = E.hy + 0.34, travel = 0.45 + q * (1.96 + grade * 0.30), length = 0.44 + grade * 0.128;
    for (var j = 0; j < n; j++) {
      var a = n === 1 ? E.a : E.a + (j / (n - 1) * 2 - 1) * E.half;
      var x = xo + Math.cos(a) * travel, y = yo + Math.sin(a) * travel;
      M.poly(c, R, M.local([[-length, 0], [0, 0]], x, y, a), '65,59,53', 0.81 * fade, 5.2 + grade * 0.44, false);
      M.poly(c, R, M.local([[-length * 0.78,-0.08], [-length * 0.78,0.08], [-length * 0.78,0], [0.12,0]], x, y, a),
        grade >= 4 ? '255,195,117' : L.col, 0.94 * fade, 2.1 + grade * 0.40, false);
      if (grade >= 3) M.poly(c, R, M.local([[-length * 1.27, -0.09], [-0.27, -0.05]], x, y, a), '244,231,187', 0.81 * fade, 1.7, false);
    }
    if (grade >= 4 && q < 0.6) {
      M.arc(c, R, xo, yo, 0.31 + q * 1.11, E.a - 0.48, E.a + 0.48, '255,196,115', fade * 0.92, 2.6);
      if (grade >= 5) M.arc(c, R, xo, yo, 0.48 + q * 1.02, E.a - 0.64, E.a + 0.64, '241,231,203', fade * 0.76, 2.1);
    }
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

  // The sledge is drawn in Arda's hands. Its landing spot fills in over the actual damage footprint.
  W.overheadSlam = function (c, R, E, L) {
    if (E.layer !== 'ground') return;
    var hit = E.src, q = M.clamp(E.q), r = ((hit.lv && hit.lv.r) || L.scale) * ((hit.A && hit.A.area) || 1) * R.ppm;
    var x = R.X(E.x), y = R.Y(E.y);
    c.beginPath(); c.ellipse(x, y, r, r * 0.55, 0, 0, TAU);
    c.fillStyle = 'rgba(149,98,57,' + (0.17 * q * L.alpha).toFixed(3) + ')'; c.fill();
    c.strokeStyle = 'rgba(39,28,28,0.78)'; c.lineWidth = 3; c.stroke();
    c.beginPath(); c.ellipse(x, y, r, r * 0.55, 0, -Math.PI / 2, -Math.PI / 2 + TAU * q);
    c.strokeStyle = 'rgba(231,174,108,' + (0.82 * L.alpha).toFixed(3) + ')'; c.lineWidth = 2; c.stroke();
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
      c.fillStyle = 'rgba(' + L.col + ',' + (0.85 * A).toFixed(3) + ')';
      P.FireAnimPrim.tongue(c, R.X(x + off), R.Y(y + 0.22 * S), 0.05 * S * R.ppm, tl * R.ppm, Math.sin(ang) * tl * R.ppm);
    }
  };

  // rocketSpiral (fireworks): a rocket with a spiral tail of L.count turns behind it, the spiral widening with the level.


  // boltCoil (cable): a lightning bolt from the source to the target, zigzagging in L.count pairs of runs, flickering with its seed.


  // harpoonLine (speargun): a taut line from the hero to the spear tip, a barbed head with L.count barbs, a trail of the tip's path.


  // foamCone (extinguisher): L.count foam blobs in the cone from the hero (E.src.a, arc in degrees, range in metres), spreading out
  // over the first moments of the spray.


  // sawDisc (sawblade): a spinning disc with L.count teeth (2 x count points), a dark hub, a trail behind it.


  // coverFrisbee (manhole cover): a flat disc spinning in flight with L.count rim holes and a trail. The steel-to-ember ramp is its
  // colour at higher levels.


  // Embers mark where the jet reaches the ground. The jet itself is drawn once, in weapons-fx4.js.


  // hookLine (olta): a cord from the hero to the hook tip, the tip on its cast toward the target (progress E.q), a curved hook with
  // L.count barbs. The target is the sim's hooked enemy when there is one.


  // doorShield (cardoor): a car door swinging round the hero on its radius (src.radius), its angle the shot's aim plus the swing;
  // L.count window bars; a swing arc behind it (trail).


  // marbleFan (slingshot): the marble with up to L.count copies of its path behind it, shrinking and fading.


  // revBar (chainsaw): a bar out of the hero's hand (0.35 m), 1.3 scale metres long, L.count teeth, buzzing with a small jitter.


  Object.assign(W.layer, {
    knifeArc: 'air', nailBurst: 'air', lobArc: 'both', linkWhip: 'air', overheadSlam: 'ground', bottleFlame: 'both', rocketSpiral: 'air',
    boltCoil: 'air', harpoonLine: 'air', foamCone: 'ground', sawDisc: 'air', coverFrisbee: 'air', flameJet: 'ground', hookLine: 'air',
    doorShield: 'air', marbleFan: 'air', revBar: 'air',
  });
  W.ell = ell;
})();
