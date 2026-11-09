// v0.7 death poses (lane C C1, view only). Each kill picks a pose by the damage source (kill event src -> weapon id, from
// P.CFG.enemies3.deathPose): fire (charred, curled, embers), electric (twitch, sparks), blunt (head snap), blade (slump,
// spray), explosion (launched, spun, charred). Poses are the base corpse (sprites.js, lying) plus extra transforms, so the
// figure art stays one code path. Owned corpses (fx2 list, 6 s) are drawn on the ground layer; P.Sprites.corpse skips them.
(function () {
  var R = P.ArtRig, S = P.Sprites, POSE = P.CFG.enemies3.deathPose;
  if (!R || !S || !S.corpse) return;
  var baseCorpse = S.corpse;

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  // Pose for a damage source id. Unknown sources fall back to POSE.fallback (blunt).
  function poseFor(src) {
    var keys = ['fire', 'electric', 'blade', 'explosion', 'blunt'], i, list;
    for (i = 0; i < keys.length; i++) {
      list = POSE[keys[i]] || [];
      if (src && list.indexOf(src) >= 0) return keys[i];
    }
    return POSE.fallback;
  }

  // Extra transform for a pose at age a (s), facing f (+1 right). Returns {dx, dy (px-free: metres), rot (rad), char}.
  function extraOf(pose, a, f, etype) {
    var e = Math.exp;
    if (pose === 'fire') return { dx: 0, dy: -0.05 * e(-a * 5), rot: f * 0.18 * Math.sin(a * 7) * e(-a * 3), char: true };
    if (pose === 'electric') return { dx: Math.sin(a * 64) * 0.07 * e(-a * 7), dy: 0, rot: Math.sin(a * 52) * 0.12 * e(-a * 7), char: false };
    if (pose === 'blade') return { dx: f * 0.35 * clamp01(a / 0.25), dy: 0, rot: f * 0.12 * clamp01(a / 0.25), char: false };
    if (pose === 'explosion') {
      var el = Math.min(a, 0.55), zz = Math.max(0, 6 * el - 10 * el * el);
      return { dx: f * el * 0.25, dy: -zz * 0.5, rot: f * Math.min(a, 0.6) * 9, char: true };
    }
    // blunt (default): the head snaps back on impact and the body slides a little.
    var slide = (POSE.slide[etype] !== undefined ? POSE.slide[etype] : POSE.slide.default) * clamp01(a / 0.2);
    return { dx: f * slide, dy: 0, rot: -f * 0.35 * e(-a * 16), char: false };
  }

  // Draw one owned corpse at sim age a (s). Base lying pose with t set so the fall is complete; fades in its last seconds.
  function draw(Rd, rec, a) {
    var c = Rd.ctx, u = Rd.ppm, f = rec.dx >= 0 ? 1 : -1, X = Rd.X(rec.x), Y = Rd.Y(rec.y - 0.2);
    var fade = clamp01((a - (rec.dur - POSE.fade)) / POSE.fade), k = 0.5 + 0.5 * fade, x = extraOf(rec.pose, a, f, rec.etype);
    c.save();
    c.translate(X + x.dx * u, Y + x.dy * u); c.rotate(x.rot); c.translate(-X, -Y);
    baseCorpse(Rd, { x: rec.x, y: rec.y, dx: rec.dx, dy: rec.dy, etype: rec.etype, variant: rec.variant, skin: rec.skin,
      fling: false, t: 1 - k, T: 1, pose: rec.pose });
    if (x.char) charred(c, X, Y, u, 0.5 * (1 - fade) + 0.25);
    c.restore();
  }

  // Scorch over the corpse only: source-atop paints where the body already has pixels, so the ground stays put.
  function charred(c, X, Y, u, a) {
    c.save(); c.globalCompositeOperation = 'source-atop'; c.fillStyle = 'rgba(16,10,8,' + a.toFixed(3) + ')';
    c.fillRect(X - 1.3 * u, Y - 0.9 * u, 2.6 * u, 1.1 * u); c.restore();
  }

  // Corpses that fx2 owns are drawn by drawUnder; the fx.js particle draws nothing for them.
  P.Sprites.corpse = function (Rd, p) {
    if (P.EnemiesFx2 && P.EnemiesFx2.ownsCorpse(p)) return;
    baseCorpse(Rd, p);
  };

  P.ArtDeath = { draw: draw, poseFor: poseFor, extraOf: extraOf };
})();
