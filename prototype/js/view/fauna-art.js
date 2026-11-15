// Ambient fauna art (R1 birds-cats, view only): stray cats in three coats (white-and-brown mixed, orange, brown) and ambient
// birds (a seagull by the sea, a pigeon inland). Drawn at the animal's ground point with R.X, R.Y and R.ppm (render.js); the
// state comes from view/fauna.js (c.st, c.face, c.speed, c.hiss; b.st, b.z, b.look). Poses: cat sit, walk and trot (legs swing
// while c.speed > 0), hiss (back up, ears flat, mouth open, puffed tail); bird peck, fly (wings beat). No text, no flashing.
(function () {
  var TAU = Math.PI * 2, INK = '#14151F', EYE = '#D9C36A', HISS = '#7A1F1F';
  var COATS = {
    mixed: { base: '#F4F0E8', patch: '#8A5A34', chest: null, stripe: null },
    orange: { base: '#E38B3A', patch: null, chest: '#F2B872', stripe: '#A85A22' },
    brown: { base: '#7B4B2B', patch: null, chest: '#9B6A44', stripe: '#5A3520' },
  };
  var BIRDS = {
    seagull: { body: '#F3F5F7', wing: '#B7C3CF', tip: INK, beak: '#FFB23F', neck: null, head: '#F3F5F7' },
    pigeon: { body: '#8C9AAE', wing: '#7A889C', tip: '#2B2F3A', beak: '#3A3F4B', neck: ['#3E9C7F', '#7B4FA0'], head: '#8C9AAE' },
  };
  P.FaunaArt = { cat: drawCat, bird: drawBird, COATS: COATS, BIRDS: BIRDS };

  function ell(x, cx, cy, rx, ry, fill, lw, stroke) {
    x.beginPath(); x.ellipse(cx, cy, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, TAU);
    if (fill) { x.fillStyle = fill; x.fill(); }
    if (stroke) { x.lineWidth = lw; x.strokeStyle = stroke; x.stroke(); }
  }
  function poly(x, pts, fill, lw) {
    var i;
    x.beginPath(); x.moveTo(pts[0], pts[1]);
    for (i = 2; i < pts.length; i += 2) x.lineTo(pts[i], pts[i + 1]);
    x.closePath();
    x.fillStyle = fill; x.fill();
    if (lw) { x.lineWidth = lw; x.strokeStyle = INK; x.stroke(); }
  }
  function now() { return performance.now() / 1000; }

  // ---------- cats ----------
  // L is the body length in px. Everything hangs off the ground point (X, G).
  function drawCat(R, c, size, calm) {
    var x = R.ctx, L = size * R.ppm, X = R.X(c.x), G = R.Y(c.y), f = c.face < 0 ? -1 : 1;
    var K = COATS[c.coat] || COATS.brown, hiss = c.st === 'stand', t = now();
    var sw = c.speed > 0 && !calm ? Math.sin(t * (6 + c.speed * 3) + c.phase) : 0, lw = Math.max(1, L * 0.04);
    x.save();
    ell(x, X, G, L * 0.45, L * 0.1, 'rgba(20,21,31,0.22)');
    catTail(x, X, G, L, f, K, t, hiss, calm, c.phase, lw);
    catLegs(x, X, G, L, f, K, sw, lw);
    catBody(x, X, G, L, f, K, hiss, lw);
    catHead(x, X, G, L, f, K, hiss, lw, t, c.phase);
    x.restore();
  }
  function catTail(x, X, G, L, f, K, t, hiss, calm, phase, lw) {
    var bx = X - f * L * 0.4, by = G - L * 0.3, flick = calm || hiss ? 0 : Math.sin(t * 2.2 + phase) * L * 0.14;
    var tipX = hiss ? X - f * L * 0.62 : X - f * L * 0.6, tipY = hiss ? G - L * 0.82 : G - L * 0.5 + flick;
    var cx = X - f * L * 0.7, cy = hiss ? G - L * 0.4 : G - L * 0.25 + flick * 0.5, wid = hiss ? L * 0.13 : L * 0.08;
    x.beginPath(); x.moveTo(bx, by); x.quadraticCurveTo(cx, cy, tipX, tipY);
    x.lineCap = 'round'; x.strokeStyle = INK; x.lineWidth = wid + lw * 1.5; x.stroke();
    x.strokeStyle = K.base; x.lineWidth = wid; x.stroke();
  }
  function catLegs(x, X, G, L, f, K, sw, lw) {
    var top = G - L * 0.14, legs = [[0.3, sw * 0.05], [0.14, -sw * 0.05], [-0.16, -sw * 0.05], [-0.3, sw * 0.05]], i, lx, lift;
    for (i = 0; i < legs.length; i++) {
      lx = X + f * L * legs[i][0];
      lift = legs[i][1] * L;
      x.fillStyle = K.base; x.strokeStyle = INK; x.lineWidth = lw;
      x.fillRect(lx - L * 0.04, top, L * 0.08, G - top + lift);
      x.strokeRect(lx - L * 0.04, top, L * 0.08, G - top + lift);
    }
  }
  function catBody(x, X, G, L, f, K, hiss, lw) {
    var bx = X, by = G - L * (hiss ? 0.36 : 0.3), rx = L * 0.42, ry = L * (hiss ? 0.24 : 0.2);
    ell(x, bx, by, rx, ry, K.base, lw, INK);
    if (K.patch) ell(x, bx - f * L * 0.1, by - L * 0.06, L * 0.2, L * 0.13, K.patch);
    if (K.chest) ell(x, bx + f * L * 0.3, by + L * 0.05, L * 0.13, L * 0.14, K.chest);
    if (K.stripe) {
      x.strokeStyle = K.stripe; x.lineWidth = Math.max(1, L * 0.05);
      [-0.16, 0, 0.16].forEach(function (d) {
        x.beginPath(); x.moveTo(bx + d * L - f * L * 0.04, by - ry * 0.9); x.lineTo(bx + d * L + f * L * 0.04, by - ry * 0.1); x.stroke();
      });
    }
  }
  function catHead(x, X, G, L, f, K, hiss, lw, t, phase) {
    var hx = X + f * L * 0.42, hy = G - L * (hiss ? 0.58 : 0.5), hr = L * 0.2, ear = hiss ? 0.9 : 1.45, i, ex;
    ell(x, hx, hy, hr, hr * 0.92, K.base, lw, INK);
    if (K.patch) ell(x, hx - f * hr * 0.4, hy - hr * 0.4, hr * 0.55, hr * 0.45, K.patch);
    for (i = -1; i <= 1; i += 2) {
      ex = hx + i * hr * 0.55;
      poly(x, [ex - hr * 0.3, hy - hr * 0.5, ex + i * hr * 0.05, hy - hr * ear, ex + hr * 0.3, hy - hr * 0.6], K.base, lw);
    }
    if (hiss) hissMouth(x, hx, hy, hr, f, t, phase); else ell(x, hx + f * hr * 0.45, hy - hr * 0.1, Math.max(1, hr * 0.2), Math.max(1, hr * 0.18), EYE);
  }
  // Hiss: open mouth and two short breath marks in front of the head.
  function hissMouth(x, hx, hy, hr, f, t, phase) {
    var pulse = 0.5 + 0.5 * Math.sin(t * 9 + phase);
    poly(x, [hx + f * hr * 0.2, hy + hr * 0.3, hx + f * hr * 0.95, hy + hr * 0.25, hx + f * hr * 0.6, hy + hr * 0.65], HISS, 0);
    x.strokeStyle = 'rgba(255,255,255,0.9)'; x.lineWidth = Math.max(1, hr * 0.14); x.lineCap = 'round';
    x.beginPath(); x.moveTo(hx + f * hr * 1.25, hy - hr * 0.3); x.lineTo(hx + f * (hr * 1.5 + pulse * hr * 0.2), hy - hr * 0.5); x.stroke();
    x.beginPath(); x.moveTo(hx + f * hr * 1.25, hy + hr * 0.1); x.lineTo(hx + f * (hr * 1.55 + pulse * hr * 0.2), hy + hr * 0.1); x.stroke();
    ell(x, hx + f * hr * 0.45, hy - hr * 0.2, Math.max(1, hr * 0.2), Math.max(1, hr * 0.12), EYE);
  }

  // ---------- birds ----------
  // size is the body length in m. Ground birds peck (head down); flying birds lift by b.z and beat their wings.
  function drawBird(R, b, size, calm) {
    var x = R.ctx, sz = size * R.ppm, X = R.X(b.x), G = R.Y(b.y), f = b.face < 0 ? -1 : 1;
    var K = BIRDS[b.look] || BIRDS.seagull, flying = b.st === 'fly', t = now();
    var lift = flying ? b.z * R.ppm : 0, by = G - lift - sz * (flying ? 0.7 : 0.3);
    var flap = flying ? (calm ? 0.3 : Math.sin(t * TAU * 8 + b.phase)) : 0;
    x.save();
    ell(x, X, G, sz * (flying ? 0.35 : 0.42), sz * 0.1, 'rgba(20,21,31,' + (flying ? 0.12 : 0.22) + ')');
    if (flying) flyingBird(x, X, by, sz, f, K, flap); else pecking(x, X, G, sz, f, K, calm ? 0 : Math.sin(t * 2 + b.phase) * 0.04);
    x.restore();
  }
  function pecking(x, X, G, sz, f, K, bob) {
    var bx = X, by = G - sz * 0.3, hx = X + f * sz * 0.42, hy = G - sz * 0.12 + bob * sz, hr = sz * 0.17;
    ell(x, bx, by, sz * 0.45, sz * 0.26, K.body, Math.max(1, sz * 0.05), INK);
    ell(x, bx - f * sz * 0.05, by - sz * 0.02, sz * 0.3, sz * 0.16, K.wing);
    neckPatch(x, hx - f * hr * 0.2, hy - hr * 0.6, hr, K);
    ell(x, hx, hy, hr, hr * 0.9, K.head, Math.max(1, sz * 0.05), INK);
    poly(x, [hx + f * hr * 0.8, hy - hr * 0.1, hx + f * hr * 1.9, hy + hr * 0.6, hx + f * hr * 0.8, hy + hr * 0.5], K.beak, 0);
    ell(x, hx + f * hr * 0.35, hy - hr * 0.2, Math.max(1, hr * 0.2), Math.max(1, hr * 0.2), INK);
  }
  function flyingBird(x, X, by, sz, f, K, flap) {
    var hx = X + f * sz * 0.5, hy = by - sz * 0.12, hr = sz * 0.17;
    wing(x, X, by, sz, f, flap, K.wing, K.tip, false);
    ell(x, X, by, sz * 0.42, sz * 0.2, K.body, Math.max(1, sz * 0.05), INK);
    neckPatch(x, hx - f * hr * 0.2, hy + hr * 0.55, hr, K);
    ell(x, hx, hy, hr, hr * 0.9, K.head, Math.max(1, sz * 0.05), INK);
    poly(x, [hx + f * hr * 0.8, hy - hr * 0.1, hx + f * hr * 1.8, hy + hr * 0.2, hx + f * hr * 0.8, hy + hr * 0.4], K.beak, 0);
    wing(x, X, by, sz, f, flap, K.wing, K.tip, true);
  }
  // One wing: rises and falls with flap (-1..1); a dark tip on the near wing (K.tip).
  function wing(x, X, by, sz, f, flap, col, tip, near) {
    var ty = by - sz * (0.25 + 0.35 * flap), tx = X - f * sz * 0.6;
    poly(x, [X - f * sz * 0.05, by - sz * 0.05, tx, ty, X - f * sz * 0.2, by + sz * 0.08], col, Math.max(1, sz * 0.04));
    if (near) ell(x, tx, ty, sz * 0.07, sz * 0.07, tip);
  }
  // The pigeon's iridescent neck patch: a teal-to-violet ellipse. Seagulls have none (K.neck null).
  function neckPatch(x, cx, cy, hr, K) {
    var g;
    if (!K.neck) return;
    g = x.createLinearGradient(cx - hr, cy, cx + hr, cy);
    g.addColorStop(0, K.neck[0]); g.addColorStop(1, K.neck[1]);
    ell(x, cx, cy, hr * 0.7, hr * 0.5, g);
  }
})();
