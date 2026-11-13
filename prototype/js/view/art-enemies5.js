// v0.7 death poses (lane C C1, view only). Each kill picks a pose by the damage source (kill event src -> weapon id, from
// P.CFG.enemies3.deathPose): fire (charred, curled, embers), electric (twitch, sparks), blunt (head snap), blade (slump,
// spray), explosion (launched, spun, charred). Poses are the base corpse (sprites.js, lying) plus extra transforms, so the
// figure art stays one code path. Owned corpses (fx2 list, 6 s) are drawn on the ground layer; P.Sprites.corpse skips them.
(function () {
  var R = P.ArtRig, S = P.Sprites, POSE = P.CFG.enemies3.deathPose;
  if (!R || !S || !S.corpse) return;
  var baseCorpse = S.corpse;

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  // Synergy tag (config-weapons3.js C.tags, via P.Weapons.tagOf) -> pose, for a source the lists do not name.
  var TAG_POSE = { fire: 'fire', electric: 'electric', blade: 'blade', gas: 'explosion', blunt: 'blunt', water: 'blunt' };

  // Pose for a damage source id: the named lists first, then its synergy tag, else POSE.fallback (blunt).
  function poseFor(src) {
    var keys = ['fire', 'electric', 'blade', 'explosion', 'blunt'], i, list, tag;
    for (i = 0; i < keys.length; i++) {
      list = POSE[keys[i]] || [];
      if (src && list.indexOf(src) >= 0) return keys[i];
    }
    tag = src && P.Weapons && P.Weapons.tagOf ? P.Weapons.tagOf(src) : null;
    return TAG_POSE[tag] || POSE.fallback;
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

  // Death collapse, shared by every pose (design-system 7: a short fall, then the ash). Corpse age a in s, 0.45 s in all:
  // 1 hit-back: the body squashes and is shoved along the blow; 2 knees buckle: it folds forward (ease-in) and drops;
  // 3 settle: a landing squash and a small bounce; 4 shadow: the contact shadow shrinks as it folds, then holds.
  // Returns fall (0..1, the lying angle), sx, sy (squash about the feet), push (m along the blow), lift (m up), shadow (0..1).
  var CO = { hit: 0.08, fallEnd: 0.3, end: 0.45 };
  function collapseOf(a) {
    var r = { fall: 1, sx: 1, sy: 1, push: 0, lift: 0, shadow: 0.7 }, q;
    if (a < CO.hit) {
      q = a / CO.hit;
      r.fall = 0; r.shadow = 1;
      r.sy = 1 - 0.16 * Math.sin(Math.PI * q); r.sx = 1 + 0.1 * Math.sin(Math.PI * q); r.push = 0.06 * Math.sin(Math.PI / 2 * q);
    } else if (a < CO.fallEnd) {
      q = (a - CO.hit) / (CO.fallEnd - CO.hit);
      r.fall = q * q; r.shadow = 1 - 0.3 * q; r.push = 0.06 * (1 - q);
      r.lift = -0.06 * q; r.sy = 1 - 0.08 * q; r.sx = 1 + 0.04 * q;
    } else if (a < CO.end) {
      q = (a - CO.fallEnd) / (CO.end - CO.fallEnd);
      r.lift = -0.06 * (1 - q) + 0.05 * Math.sin(Math.PI * q) * (1 - q);
      r.sy = 0.92 + 0.08 * q; r.sx = 1.04 - 0.04 * q;
    }
    return r;
  }
  // Pose transform about the feet (X, Y, screen): the collapse squash and push, then the pose extras (x.dx, x.dy, x.rot).
  function applyPose(c, X, Y, u, f, x, st) {
    c.translate(X + (x.dx + st.push * f) * u, Y + (x.dy - st.lift) * u);
    c.scale(st.sx, st.sy); c.rotate(x.rot); c.translate(-X, -Y);
  }
  // Contact shadow under the corpse: shrinks with the collapse, then holds at 70%, and fades with the corpse.
  function shadowOf(Rd, rec, X, Y, u, k) {
    var cs = P.CFG.view.contactShadow, def = P.CFG.enemies[rec.etype] || {}, r = def.radius || 0.35;
    P.Sprites.contact(Rd.ctx, X, Y, cs.radius * r * u, cs.alpha * k, cs.aspect);
  }

  // Draw one owned corpse at sim age a (s): the collapse, then the lying pose with the weapon's extras. Fades in its last seconds.
  function draw(Rd, rec, a) {
    var c = Rd.ctx, u = Rd.ppm, f = rec.dx >= 0 ? 1 : -1, X = Rd.X(rec.x), Y = Rd.Y(rec.y - 0.2);
    var fade = clamp01((a - (rec.dur - POSE.fade)) / POSE.fade), k = 0.5 + 0.5 * fade, x = extraOf(rec.pose, a, f, rec.etype), st = collapseOf(a);
    var alpha = k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4;
    var p = { x: rec.x, y: rec.y, dx: rec.dx, dy: rec.dy, etype: rec.etype, variant: rec.variant, skin: rec.skin, fling: false, t: 0, T: 1,
      pose: rec.pose, fall: st.fall, alpha: alpha };
    shadowOf(Rd, rec, X, Y, u, st.shadow * alpha);
    if (x.char && charredBody(Rd, p, fade, x, st, f, X, Y, u)) return;
    c.save(); applyPose(c, X, Y, u, f, x, st);
    baseCorpse(Rd, p);
    c.restore();
  }

  // Charred pose (fire, explosion): the body is drawn into a small scratch canvas, scorched there, then blitted. source-atop
  // on the live canvas would darken the ground too; on the scratch canvas it only paints where the body has pixels.
  // Returns false when the live transform is not readable, and the caller draws the plain body instead.
  var scratch = null, sctx = null, BOX_W = 3.6, BOX_H = 3.0, PAD = 4;
  function charredBody(Rd, p, fade, x, st, f, X, Y, u) {
    var c = Rd.ctx, M = c.getTransform ? c.getTransform() : null;
    if (!M) return false;
    var cx = M.a * X + M.c * Y + M.e, cy = M.b * X + M.d * Y + M.f;       // device centre of the body
    var bw = Math.ceil(BOX_W * u * Math.abs(M.a)) + PAD, bh = Math.ceil(BOX_H * u * Math.abs(M.d)) + PAD;
    var ox = Math.round(cx - bw / 2), oy = Math.round(cy - bh * 0.7);
    if (!scratch) { scratch = document.createElement('canvas'); sctx = scratch.getContext('2d'); }
    if (scratch.width < bw) scratch.width = bw;
    if (scratch.height < bh) scratch.height = bh;
    sctx.setTransform(1, 0, 0, 1, 0, 0); sctx.clearRect(0, 0, bw, bh);
    // Same matrix as the live canvas, shifted so the buffer's corner sits at (ox, oy) in device pixels.
    sctx.setTransform(M.a, M.b, M.c, M.d, M.e - ox, M.f - oy);
    var R2 = Object.create(Rd); R2.ctx = sctx;
    sctx.save(); applyPose(sctx, X, Y, u, f, x, st);
    baseCorpse(R2, p);
    sctx.restore();
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.globalCompositeOperation = 'source-atop';
    sctx.fillStyle = 'rgba(16,10,8,' + (0.5 * (1 - fade) + 0.25).toFixed(3) + ')';
    sctx.fillRect(0, 0, bw, bh);
    sctx.globalCompositeOperation = 'source-over';
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
    c.drawImage(scratch, 0, 0, bw, bh, ox, oy, bw, bh);
    c.restore();
    return true;
  }

  // Corpses that fx2 owns are drawn by drawUnder; the fx.js particle draws nothing for them.
  P.Sprites.corpse = function (Rd, p) {
    if (P.EnemiesFx2 && P.EnemiesFx2.ownsCorpse(p)) return;
    baseCorpse(Rd, p);
  };

  P.ArtDeath = { draw: draw, poseFor: poseFor, extraOf: extraOf, collapseOf: collapseOf, collapseEnd: CO.end };
})();
