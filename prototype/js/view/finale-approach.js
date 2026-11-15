// Chapter 1 arrival, the approach (L100 win, view only): a short walk up the Ataköy street to the apartment block. The
// player drags to walk; with no input the hero keeps walking, so the approach always ends. The balcony light (Mom's, on
// the third floor) and the bakery window show over the street; the kapıcı booth is empty. The km bar fills 16.2 -> 17.0
// and bursts at the door. Drawn on the game canvas by render.js (R.frame hook); updated from main.js (tick hook).
// The sim is not involved: the level is over. Start: P.FinaleApproach.start(onDone). Ends by calling onDone once.
P.FinaleApproach = (function () {
  var F = {}, K = { ppm: 46, camBack: 3.2, facadeY: 14, arriveY: 12.6, startY: 1.0, kmFrom: 16.2, kmTo: 17.0,
    floorPx: 62, groundPx: 92, booth: { x0: -2.6, x1: -1.7 }, door: { x0: -0.7, x1: 0.7 }, hintT: 4.5, endT: 1.2 };
  var INK = '#14151F', TAU = Math.PI * 2;
  var on = false, arrived = false, t = 0, arrivedT = 0, hero = { x: 0, y: 1 }, walk = 0, done = null, hintT = 0;

  F.active = function () { return on; };
  F.start = function (onDone) {
    on = true; arrived = false; t = 0; arrivedT = 0; walk = 0; hintT = K.hintT; done = onDone || function () {};
    hero = { x: 0, y: K.startY };
    P.Input.reset(); P.Input.enabled = true;
  };
  // Input: the drag vector (y up is forward). Idle: a steady walk toward the door, centred on the street.
  F.update = function (dt) {
    if (!on) return;
    t += dt; hintT = Math.max(0, hintT - dt);
    if (arrived) { arrivedT += dt; if (arrivedT >= K.endT) finish(); return; }
    var v = P.Input.get ? P.Input.get() : { x: 0, y: 0 }, mag = Math.hypot(v.x || 0, v.y || 0);
    if (mag > 0.2) {
      hero.x += (v.x / Math.max(1, mag)) * 2.2 * dt; hero.y += (v.y / Math.max(1, mag)) * 2.4 * dt;
      walk += 2.4 * dt;
    } else {
      hero.x += (0 - hero.x) * Math.min(1, dt * 1.5); hero.y += 1.5 * dt; walk += 1.5 * dt;
    }
    hero.x = Math.max(-2.2, Math.min(2.2, hero.x));
    hero.y = Math.max(K.startY, hero.y);
    if (hero.y >= K.arriveY) { hero.y = K.arriveY; arrived = true; P.Input.enabled = false; P.Input.reset(); }
  };
  function finish() {
    on = false; P.Input.enabled = false;
    var cb = done; done = null; if (cb) cb();
  }
  // km progress from the hero's distance up the street.
  function km() {
    var f = Math.max(0, Math.min(1, (hero.y - K.startY) / (K.arriveY - K.startY)));
    return K.kmFrom + (K.kmTo - K.kmFrom) * f;
  }

  // ---------- drawing ----------
  function fmt(v, lang) { var s = v.toFixed(1); return lang === 'tr' ? s.replace('.', ',') : s; }
  function rr(c, x, y, w, h, fill, stroke) { c.fillStyle = fill; c.fillRect(x, y, w, h); if (stroke) { c.strokeStyle = stroke; c.lineWidth = 2; c.strokeRect(x, y, w, h); } }
  function glow(c, x, y, r, col) {
    var g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  }

  // Projection: world (x metres, y north) to CSS px. The camera follows the hero from behind.
  function proj(R) {
    var camY = hero.y - K.camBack, base = R.H * 0.66;
    return { sx: function (x) { return R.W / 2 + x * K.ppm; }, sy: function (y) { return base - (y - camY) * K.ppm; } };
  }

  function drawSky(c, W, H) { var g = c.createLinearGradient(0, 0, 0, H * 0.6); g.addColorStop(0, '#2B3B57'); g.addColorStop(1, '#F2B39B'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  function drawGround(c, P2, W, H) {
    var yb = K.facadeY, yTop = yb - 4, y, k;
    rr(c, 0, P2.sy(yTop), W, H, '#A59A86');
    c.strokeStyle = 'rgba(20,21,31,0.22)'; c.lineWidth = 1;
    for (y = Math.ceil((hero.y - K.camBack - 2) / 1.5) * 1.5; y < yb; y += 1.5) { c.beginPath(); c.moveTo(0, P2.sy(y)); c.lineTo(W, P2.sy(y)); c.stroke(); }
    [-2.8, 2.8].forEach(function (x) { c.strokeStyle = '#6B6F78'; c.lineWidth = 3; c.beginPath(); c.moveTo(P2.sx(x), 0); c.lineTo(P2.sx(x), H); c.stroke(); });
    // The kerb walks: sidewalks are the lighter strips beyond the curbs.
    rr(c, 0, P2.sy(yb), W, H, '#B9A98E');
  }
  function drawLaundry(c, P2, W, y) {
    var yy = P2.sy(y) - 150, x0 = P2.sx(-4.4), x1 = P2.sx(4.4);
    c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0, yy); c.quadraticCurveTo(W / 2, yy + 22, x1, yy + 4); c.stroke();
    ['#E9EEF4', '#3D8BFF', '#FFD166', '#D7263D', '#E9EEF4'].forEach(function (col, i) { rr(c, W * (0.14 + i * 0.16), yy + 10 + (i % 2) * 6, 18, 24, col, INK); });
  }
  function drawFacade(c, P2, W, t0) {
    var yb = K.facadeY, base = P2.sy(yb), top = base - 6 * K.floorPx - K.groundPx, f, i, x, fy, lit = 0.6 + 0.4 * Math.sin(t0 / 700);
    rr(c, 0, top, W, base - top + 0, '#E9D6B4');
    c.strokeStyle = 'rgba(20,21,31,0.28)'; c.lineWidth = 1;
    for (f = 0; f <= 6; f++) { var ly = base - K.groundPx - (f - 1) * K.floorPx; if (f === 0) ly = base - K.groundPx; c.beginPath(); c.moveTo(0, ly); c.lineTo(W, ly); c.stroke(); }
    // Windows and blue shutters, floors 1 to 5, three per floor, centre bay omitted at the door.
    for (f = 1; f <= 5; f++) for (i = -1; i <= 1; i++) {
      x = P2.sx(i * 2.4) ; if (Math.abs(i) === 0 && f === 3) continue;
      fy = base - K.groundPx - (f - 1) * K.floorPx - K.floorPx * 0.82;
      rr(c, x - 22, fy - 3, 48, 46, '#2F6F9F', INK); rr(c, x - 16, fy, 36, 40, f === 3 && i !== 0 ? '#3A4A60' : '#4A5A6E', INK);
    }
    // Third floor: the balcony and Mom's light. The lit window glows and pulses; the glow spills down to the street.
    var bx = P2.sx(-0.9), bw = P2.sx(0.9) - bx, by = base - K.groundPx - 2 * K.floorPx - K.floorPx * 0.25;
    glow(c, P2.sx(0), by + 20, 160, 'rgba(255,217,138,' + (0.18 * lit).toFixed(3) + ')');
    rr(c, P2.sx(-0.5), by - 56, P2.sx(0.5) - P2.sx(-0.5), 56, '#FFD98A', INK);    // lit window behind the balcony door
    rr(c, bx, by, bw, 6, '#5A3920', INK);                                          // balcony slab
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(bx, by - 22); c.lineTo(bx + bw, by - 22); c.stroke();
    for (i = 0; i <= 6; i++) { var px = bx + bw * i / 6; c.beginPath(); c.moveTo(px, by - 22); c.lineTo(px, by); c.stroke(); }
    c.fillStyle = '#4E7D4E'; c.beginPath(); c.arc(bx + 10, by - 2, 9, 0, TAU); c.arc(bx + bw - 10, by - 2, 9, 0, TAU); c.fill();
  }
  function drawGroundFloor(c, P2, t0) {
    var base = P2.sy(K.facadeY), gh = K.groundPx, dx0 = P2.sx(K.door.x0), dx1 = P2.sx(K.door.x1), bo0 = P2.sx(K.booth.x0), bo1 = P2.sx(K.booth.x1);
    // Bakery window (left): warm, with a sign.
    rr(c, P2.sx(-3.9), base - gh + 14, P2.sx(-2.9) - P2.sx(-3.9), gh - 34, '#FFD98A', INK);
    rr(c, P2.sx(-3.9), base - gh + 2, P2.sx(-2.9) - P2.sx(-3.9), 12, '#1F4D3A', INK);
    c.fillStyle = '#F4EBDD'; c.font = 'bold 9px "CM Comic Relief", "Comic Relief", "Comic Sans MS", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(P.lang === 'tr' ? 'FIRIN' : 'BAKERY', P2.sx(-3.4), base - gh + 8);
    // Kapıcı booth, seen through the lobby glass: an empty stool, the keys on the hook, an empty bread basket.
    rr(c, bo0, base - gh + 16, bo1 - bo0, gh - 38, '#D9C3A0', INK);
    rr(c, bo0 + 4, base - gh + 22, bo1 - bo0 - 8, gh - 48, '#3E3428');
    c.fillStyle = '#8B5E34'; c.beginPath(); c.ellipse((bo0 + bo1) / 2, base - 40, (bo1 - bo0) * 0.36, 7, 0, 0, TAU); c.fill(); c.strokeStyle = INK; c.stroke();
    // Lobby door: frosted glass, warm light, a brass handle; the glow grows once the hero is at the door.
    var lit = arrived ? 1 : 0.7 + 0.3 * Math.sin(t0 / 500);
    rr(c, dx0, base - gh, dx1 - dx0, gh, '#6B4226', INK);
    rr(c, dx0 + 6, base - gh + 8, dx1 - dx0 - 12, gh * 0.55, 'rgba(255,217,138,' + lit.toFixed(2) + ')', INK);
    rr(c, dx1 - 10, base - gh * 0.42, 4, 8, '#E9C27A');
    rr(c, dx0 - 8, base - 2, dx1 - dx0 + 16, 5, '#8E6B3E');                       // step
    if (arrived) glow(c, (dx0 + dx1) / 2, base - gh / 2, 120, 'rgba(255,217,138,' + Math.min(0.5, arrivedT * 0.6).toFixed(2) + ')');
  }
  function drawHero(R, P2) {
    var c = R.ctx, X = P2.sx(hero.x), Y = P2.sy(hero.y - 0.25), u = 37.6 * P.CFG.view.spriteScale.hero, moving = !arrived;
    P.Sprites.contact(c, X, Y + 2, 0.5 * K.ppm, 0.34, 0.36);
    var so = { u: u, back: moving, face: 1, phase: walk * 5, skin: '#E0AC80', shirt: '#D7263D', pants: '#2B3346', hair: '#1E1712',
      arms: 'idle', still: !moving, flash: 0 };
    P.Sprites.hero(c, X, Y, so);
  }
  function drawBar(c, W, lang) {
    var f = Math.max(0, Math.min(1, (km() - K.kmFrom) / (K.kmTo - K.kmFrom)));
    var x = 14, y = 74, w = W - 28, h = 56;
    rr(c, x, y, w, h, '#F4EBDD', INK);
    c.fillStyle = INK; c.textAlign = 'left'; c.textBaseline = 'middle'; c.font = '900 17px "CM Bangers", Bangers, Impact, sans-serif';
    c.fillText(P.t('fin.approach.title'), x + 12, y + 16);
    c.textAlign = 'right'; c.fillText(P.t('fin.approach.km', { a: fmt(km(), lang), b: fmt(K.kmTo, lang) }), x + w - 12, y + 16);
    rr(c, x + 12, y + 36, w - 24, 10, '#D8CBB4', INK);
    rr(c, x + 12, y + 36, (w - 24) * f, 10, arrived ? '#FFD166' : '#E9A23B');
    if (arrived && arrivedT < 0.6) { c.globalAlpha = 1 - arrivedT / 0.6; glow(c, x + w - 20, y + 40, 60 * (0.4 + arrivedT), 'rgba(255,209,102,0.9)'); c.globalAlpha = 1; }
  }
  function drawHint(c, W, H, lang) {
    if (hintT <= 0 || arrived) return;
    var a = Math.min(1, hintT / 1.0);
    c.globalAlpha = a; c.fillStyle = 'rgba(20,21,31,0.7)'; c.fillRect(0, H * 0.84, W, 44);
    c.fillStyle = '#F4EBDD'; c.font = '700 16px "CM Comic Relief", "Comic Relief", "Comic Sans MS", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(P.t('fin.approach.hint'), W / 2, H * 0.84 + 22); c.globalAlpha = 1;
  }

  // R.frame hook: draws the approach instead of the sim's world. Returns true when it drew.
  F.draw = function (R) {
    if (!on) return false;
    var c = R.ctx, W = R.W, H = R.H, P2 = proj(R), lang = P.lang;
    c.setTransform(R.dpr || 1, 0, 0, R.dpr || 1, 0, 0);
    drawSky(c, W, H);
    drawGround(c, P2, W, H);
    drawLaundry(c, P2, W, 9.5);
    drawFacade(c, P2, W, t * 1000);
    drawGroundFloor(c, P2, t * 1000);
    drawLaundry(c, P2, W, 12.2);
    drawHero(R, P2);
    var v = c.createRadialGradient(W / 2, H * 0.55, H * 0.25, W / 2, H * 0.55, H * 0.8);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(14,20,40,0.45)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
    drawBar(c, W, lang);
    drawHint(c, W, H, lang);
    return true;
  };
  return F;
})();
