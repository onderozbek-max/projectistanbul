// v0.8 boss art (D-060, view only). The Docent (saray) and the Antiquarian (halic) get their own bodies (unique names, so the
// bake cache never mixes them with the crowd) and hand props, drawn in the baked low layer through the accent hook:
// the Docent's open red umbrella (right hand) and a teal tour flag on a pole (left hand), the Antiquarian's brass lamp on a chain.
// The thrown objects are drawn live by enemies-fx2.js (drawBlade, via P.ArtBosses.drawThrown), keyed by the boss kind the sim
// tags on the throw: the Docent's audio guide (a boxy handheld with a headset cable, a slow wobble) and the Antiquarian's
// terracotta vase (spins). kasapBoss returns false and keeps the cleaver. Reduce motion turns the spin into a slow sway.
// Nothing here flashes: the lamp glow is static. Bake box limits (art-rig.js LOW_BOX): x in [-0.55, 0.55], y in [-1.12, 0.14].
(function () {
  var EN = P.ArtEnemies, R = P.ArtRig, CH = P.ArtChars;
  if (!EN || !R || !CH || !P.Sprites) return;
  var H = CH.BODY.human, INK = R.INK, TAU = R.TAU;
  var RED = '#B5453A', RED_S = R.shade(RED, 0.8), WOOD = '#5E4628', BRASS = '#C9A13B', BRASS_S = R.shade(BRASS, 0.75);
  var TEAL = '#2E6F7E', CREAM = '#F4EBDD', GOLD = '#D4A23A', GLASS = '#FFD27A', BOX = '#2F4858', SCREEN = '#9BD3E8';
  var TERRA = '#B8562F', TERRA_S = R.shade(TERRA, 0.75), CLAY_BAND = '#EBD3B0', CLAY_DARK = '#5E2A1A';

  function ext(base, over) { var o = {}, k; for (k in base) o[k] = base[k]; for (k in over) o[k] = over[k]; return o; }
  function stroke(c, pts, w, col) {
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col; c.lineWidth = w; c.stroke();
  }

  // Bodies: a broader Docent and a slighter, stooped Antiquarian (same rig, own names).
  EN.BODY.docent = ext(H, { hipX: 0.075, shX: 0.15, torsoTop: 0.17, torsoBot: 0.14, headC: [0, -0.72], headRx: 0.2, headRy: 0.21 });
  EN.BODY.antiquarian = ext(H, { hipX: 0.06, shX: 0.12, torsoTop: 0.125, torsoBot: 0.11, headC: [0.02, -0.7], headRx: 0.18, headRy: 0.195 });

  // Umbrella: the shaft runs from the right hand up and back to the hub; the canopy is the upper half of an ellipse whose top is the hub.
  function umbrella(c, w) {
    var a = -0.21, up = [Math.sin(a), -Math.cos(a)], n = [Math.cos(a), Math.sin(a)];
    var hub = [w[0] - 0.13, w[1] - 0.6], Hc = [hub[0] - up[0] * 0.12, hub[1] - up[1] * 0.12];
    stroke(c, [[w[0] - up[0] * 0.04, w[1] - up[1] * 0.04], hub], 0.022, WOOD);
    var p = new Path2D();
    p.ellipse(Hc[0], Hc[1], 0.24, 0.12, a, Math.PI, 2 * Math.PI); p.closePath();
    R.paint(c, p, RED, RED_S, 0.012);
    [Math.PI, 1.25 * Math.PI, 1.75 * Math.PI, 2 * Math.PI].forEach(function (t) {          // ribs: hub to the hem
      var rx = 0.24 * Math.cos(t), ry = 0.12 * Math.sin(t);
      stroke(c, [hub, [Hc[0] + n[0] * rx - up[0] * ry, Hc[1] + n[1] * rx - up[1] * ry]], 0.008, RED_S);
    });
    c.beginPath(); c.arc(hub[0], hub[1], 0.025, 0, TAU); c.fillStyle = GOLD; c.fill();
    c.strokeStyle = INK; c.lineWidth = 0.01; c.stroke();
  }

  // Tour flag: a teal pennant with a cream stripe on a pole, held in the left hand and leaning back over the head.
  function tourFlag(c, w) {
    var top = [w[0] - 0.1, w[1] - 0.7], B = [top[0] - 0.356, top[1] + 0.036];
    var quad = [top, B, [B[0], B[1] + 0.2], [top[0], top[1] + 0.2]];
    stroke(c, [w, top], 0.022, WOOD);
    c.beginPath(); c.moveTo(quad[0][0], quad[0][1]);
    for (var i = 1; i < 4; i++) c.lineTo(quad[i][0], quad[i][1]);
    c.closePath(); c.fillStyle = TEAL; c.fill(); c.strokeStyle = INK; c.lineWidth = 0.01; c.stroke();
    stroke(c, [[top[0], top[1] + 0.1], [B[0], B[1] + 0.1]], 0.03, CREAM);
    c.beginPath(); c.arc(top[0], top[1], 0.03, 0, TAU); c.fillStyle = GOLD; c.fill();
    c.strokeStyle = INK; c.lineWidth = 0.01; c.stroke();
  }

  // Brass lamp on a chain, hanging from the right hand. The glow is a fixed warm pool (no flicker).
  function lamp(c, w) {
    var x = w[0], y = w[1], g = c.createRadialGradient(x, y + 0.3, 0.02, x, y + 0.3, 0.32);
    g.addColorStop(0, 'rgba(255,210,120,0.4)'); g.addColorStop(1, 'rgba(255,210,120,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y + 0.3, 0.32, 0, TAU); c.fill();
    stroke(c, [[x, y], [x, y + 0.12]], 0.034, INK); stroke(c, [[x, y], [x, y + 0.12]], 0.014, BRASS);
    c.beginPath(); c.arc(x, y + 0.13, 0.02, 0, TAU); c.strokeStyle = INK; c.lineWidth = 0.012; c.stroke();
    R.paint(c, R.rrect(x - 0.06, y + 0.15, 0.12, 0.03, 0.01), BRASS, BRASS_S, 0.01);
    R.paint(c, R.ell(x, y + 0.27, 0.085, 0.1), BRASS, BRASS_S, 0.012);
    R.paint(c, R.ell(x, y + 0.27, 0.042, 0.06), GLASS, R.shade(GLASS, 0.8), 0.006);
    R.paint(c, R.rrect(x - 0.07, y + 0.36, 0.14, 0.04, 0.012), BRASS, BRASS_S, 0.01);
  }

  // Accessories through the accent hook: layer 'low' only (the hands are in the cached low layer).
  var PROPS = {
    docent: function (c, J) { umbrella(c, J.RW); tourFlag(c, J.LW); },
    antiquarian: function (c, J) { lamp(c, J.RW); }
  };
  var prevAccent = EN.accent;
  EN.accent = function (c, rc, J, layer) {
    prevAccent(c, rc, J, layer);
    var k = (rc.mot || {}).bossProp;
    if (layer === 'low' && k && PROPS[k]) PROPS[k](c, J);
  };

  // ---- thrown objects (screen space, metres scaled by u = px per metre) ----
  // Audio guide: a boxy handheld (0.26 x 0.18 m) with a screen, a speaker grille and a button. Its headset cable trails back
  // along the flight with a slack wobble; the whole box tumbles a little.
  function guide(c, u, X, Y, b, calm) {
    var dx = b.x1 - b.x0, dy = b.y1 - b.y0, L = Math.hypot(dx, dy) || 1;
    var rot = calm ? 0 : Math.sin(b.t * 7) * 0.45, cr = Math.cos(rot), sr = Math.sin(rot);
    var tx = -dx / L, ty = dy / L;                                      // trail in screen space (y is flipped)
    var lx = tx * cr + ty * sr, ly = -tx * sr + ty * cr;                // the same trail in the box's own frame
    var px = -ly, py = lx, wob = calm ? 0.01 : 0.035 * Math.sin(b.t * 11);
    var ax = 0.1, ay = -0.09, ex = ax + lx * 0.34, ey = ay + ly * 0.34;
    c.save(); c.translate(X, Y); c.rotate(rot); c.scale(u, u);
    c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo(ax + lx * 0.17 + px * wob, ay + ly * 0.17 + py * wob, ex, ey);
    c.strokeStyle = INK; c.lineWidth = 0.04; c.lineCap = 'round'; c.stroke();
    c.strokeStyle = '#3A3F4D'; c.lineWidth = 0.018; c.stroke();
    [[0, 0], [0.02, 0.03]].forEach(function (o) {                       // the two ear pieces
      c.beginPath(); c.arc(ex + o[0], ey + o[1], 0.022, 0, TAU); c.fillStyle = CREAM; c.fill();
      c.strokeStyle = INK; c.lineWidth = 0.008; c.stroke();
    });
    c.beginPath(); c.roundRect ? c.roundRect(-0.13, -0.09, 0.26, 0.18, 0.03) : c.rect(-0.13, -0.09, 0.26, 0.18);
    c.fillStyle = BOX; c.fill(); c.strokeStyle = INK; c.lineWidth = 0.01; c.stroke();
    c.fillStyle = SCREEN; c.fillRect(-0.1, -0.06, 0.13, 0.08);
    c.strokeStyle = INK; c.lineWidth = 0.008;
    [0.03, 0.06, 0.09].forEach(function (yy) { c.beginPath(); c.moveTo(-0.1, yy); c.lineTo(0.08, yy); c.stroke(); });
    c.beginPath(); c.arc(0.085, -0.03, 0.02, 0, TAU); c.fillStyle = '#F2C14E'; c.fill(); c.stroke();
    c.restore();
  }

  // Terracotta amphora (0.44 m): foot, full belly, narrow neck, lip and two handles, with a cream band. Spins about its centre.
  var VASE_OUTLINE = [[0.05, 0.22], [0.09, 0.16], [0.12, 0.04], [0.1, -0.07], [0.05, -0.14], [0.055, -0.2], [0.075, -0.215],
    [-0.075, -0.215], [-0.055, -0.2], [-0.05, -0.14], [-0.1, -0.07], [-0.12, 0.04], [-0.09, 0.16], [-0.05, 0.22]];
  function vase(c, u, X, Y, b, calm) {
    var rot = calm ? 0.35 * Math.sin(b.t * 4) : b.t * 9, body = R.smooth(VASE_OUTLINE);
    c.save(); c.translate(X, Y); c.rotate(rot); c.scale(u, u);
    stroke(c, [[0.06, -0.16], [0.14, -0.1], [0.12, 0.0]], 0.03, INK); stroke(c, [[0.06, -0.16], [0.14, -0.1], [0.12, 0.0]], 0.014, TERRA);
    stroke(c, [[-0.06, -0.16], [-0.14, -0.1], [-0.12, 0.0]], 0.03, INK); stroke(c, [[-0.06, -0.16], [-0.14, -0.1], [-0.12, 0.0]], 0.014, TERRA);
    R.paint(c, body, TERRA, TERRA_S, 0.012);
    c.save(); c.clip(body);
    c.fillStyle = CLAY_BAND; c.fillRect(-0.2, 0.06, 0.4, 0.035);
    c.fillStyle = CLAY_DARK; c.fillRect(-0.2, -0.1, 0.4, 0.02);
    for (var i = -2; i <= 2; i++) { c.beginPath(); c.arc(i * 0.045, 0.078, 0.012, 0, TAU); c.fill(); }
    c.restore();
    c.restore();
  }

  var THROWN = { tourGuide: guide, antiquarian: vase };
  P.ArtBosses = {
    // Draws the boss's own thrown object into the air layer. Returns false for any other kind (the caller draws the cleaver).
    drawThrown: function (c, u, X, Y, b) {
      var fn = THROWN[b.kind];
      if (!fn) return false;
      fn(c, u, X, Y, b, !!(P.Settings && P.Settings.reduceMotion));
      return true;
    }
  };
})();
