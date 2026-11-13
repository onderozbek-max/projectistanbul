// Vehicles (view only). One tram drawing, used three ways: the idle car on level 1 (render-world drawTram), the car rushing
// through the tram-box lane (events-fx 'tramRush', drawAir) and the tram landmark in generated hoods (istanbul-landmarks.js).
// Look: Istanbul nostalgic tram. Red body with a cream roof stripe, a row of windows down each side, a dark windscreen,
// a headlamp, a route plate and a brass bell at the front, a rear end face with two lamps, bogies and wheels at the sides,
// a soft shadow and a pantograph on the roof. Top-down 3/4: the roof is raised by the car height, so the rear end face shows
// under it. The body is painted once per size and scale (paintCar, cached); the pantograph, the lamps and the sway are live.
//
// OPACITY RULES (T4 part 11). The tram vehicle is always fully opaque (alpha 1):
//   - it is not an overhang, so the overhang fade (design-system 6.5: awnings and tram roofs fade to 30% over the player)
//     never applies to it. drawCar ignores o.alpha on purpose;
//   - it is drawn on the ground layer, before the actors (render.js), so Arda and the enemies draw over it and stay findable;
//   - only the hazard telegraph is translucent: the tram-box lane (events-fx drawHack -> tramLane). The rushing car is opaque
//     while it passes, and the lane under it is the only translucent thing.
// The simulation never reads this. Numbers: P.CFG.feel2.tram (config-feel.js).
P.Vehicles = (function () {
  var V = {}, rush = null, INK = '#14151F', PAD = 0.3, CACHE = {}, CACHE_N = 0, GLOW = {};
  var RED = '#C0392B', RED_DARK = '#8E2B20', CREAM = '#F4EBDD', GLASS = '#2A3445', BRASS = '#E9A23B';

  function C() { return P.CFG.feel2.tram; }
  function HGT() { return C().height; }
  function now() { return performance.now() / 1000; }
  function rm() { return !!(P.Settings && P.Settings.reduceMotion); }
  function bucket(ppm) { return Math.max(16, Math.round(ppm / 4) * 4); }

  // Rounded rectangle in the current user units (metres inside paintCar).
  function rrect(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function fillRr(c, x, y, w, h, r, fill, line) {
    rrect(c, x, y, w, h, r); c.fillStyle = fill; c.fill();
    if (line) { c.strokeStyle = INK; c.lineWidth = line; c.stroke(); }
  }
  function dot(c, x, y, r, fill, line) {
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = fill; c.fill();
    if (line) { c.strokeStyle = INK; c.lineWidth = line; c.stroke(); }
  }

  // The car in metres: origin at the roof's top-left (the front of the car is the top edge, the rear end face is the bottom),
  // w wide, L long (roof), hg the car height (the rear end face and the ground sit hg below the roof). Paints into a context
  // whose transform already maps metres to pixels; line widths are in metres.
  function paintCar(c, w, L, hg) {
    var i, y;
    c.lineJoin = 'round';
    // soft shadow on the ground, offset to the lower right (light from the upper left)
    rrect(c, 0.2, hg + 0.16, w + 0.22, L + 0.12, 0.45); c.fillStyle = 'rgba(0,0,0,0.16)'; c.fill();
    rrect(c, 0.1, hg + 0.06, w + 0.12, L + 0.04, 0.4); c.fillStyle = 'rgba(0,0,0,0.22)'; c.fill();
    // bogies: two per side, four wheels each, sticking out past the body at ground level
    for (i = 0; i < 2; i++) {
      y = L * (i ? 0.78 : 0.22) + hg;
      [-0.2, w + 0.08].forEach(function (x) {
        [-0.36, 0.36].forEach(function (dy) { fillRr(c, x, y + dy - 0.23, 0.14, 0.46, 0.04, '#1E1F25', 0.012); });
      });
    }
    // body: rear end face and sides in the dark red, then the roof on top (the extrusion is the band from roof to ground)
    fillRr(c, 0, 0, w, L + hg, 0.34, RED_DARK, 0.045);
    fillRr(c, 0.14, L + hg - 0.13, w - 0.28, 0.09, 0.04, '#2B2B2B', 0);                         // rear bumper
    dot(c, 0.32, L + hg * 0.45, 0.085, '#E0523A', 0.02); dot(c, w - 0.32, L + hg * 0.45, 0.085, '#E0523A', 0.02);
    dot(c, 0.3, L + hg * 0.45 - 0.02, 0.03, '#FFD6C8', 0); dot(c, w - 0.34, L + hg * 0.45 - 0.02, 0.03, '#FFD6C8', 0);
    fillRr(c, 0, 0, w, L, 0.34, RED, 0.05);                                                       // roof and upper body
    fillRr(c, w / 2 - 0.15, 0.55, 0.3, L - 1.1, 0.04, CREAM, 0.022);                               // cream roof stripe
    c.fillStyle = 'rgba(20,21,31,0.18)'; c.fillRect(w / 2 - 0.15, 0.55, 0.012, L - 1.1); c.fillRect(w / 2 + 0.14, 0.55, 0.012, L - 1.1);
    c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(0.05, 0.1, 0.06, L - 0.2);                  // light from the left
    c.fillStyle = 'rgba(20,21,31,0.2)'; c.fillRect(w - 0.12, 0.1, 0.1, L - 0.2);                  // shade on the right
    // windows: a row of bays down each side (dark glass, a light glint)
    var n = Math.max(4, Math.floor((L - 1.4) / 1.0));
    for (i = 0; i < n; i++) {
      y = 0.9 + i * ((L - 1.8) / n);
      [0.1, w - 0.27].forEach(function (x) {
        fillRr(c, x, y, 0.17, (L - 1.8) / n - 0.2, 0.03, GLASS, 0.018);
        c.fillStyle = 'rgba(160,200,220,0.5)'; c.fillRect(x + 0.03, y + 0.06, 0.04, 0.22);
      });
    }
    // bellows joint across the middle
    fillRr(c, 0.14, L * 0.5 - 0.1, w - 0.28, 0.2, 0.03, '#2B2B2B', 0.012);
    // front: windscreen with a glint, a headlamp in the nose, the route plate and a brass bell
    fillRr(c, 0.32, 0.16, w - 0.64, 0.4, 0.1, GLASS, 0.03);
    c.fillStyle = 'rgba(255,255,255,0.22)';
    c.beginPath(); c.moveTo(0.5, 0.22); c.lineTo(0.85, 0.22); c.lineTo(0.62, 0.5); c.lineTo(0.42, 0.5); c.closePath(); c.fill();
    dot(c, w / 2, 0.07, 0.1, '#FFF1C4', 0.025);
    fillRr(c, w / 2 - 0.22, 0.64, 0.44, 0.14, 0.02, CREAM, 0.018);
    [-0.12, 0, 0.12].forEach(function (dx) { dot(c, w / 2 + dx, 0.71, 0.03, INK, 0); });
    dot(c, w - 0.22, 0.7, 0.08, BRASS, 0.02);
  }

  // Bake cache: one canvas per car size and scale, with PAD of margin on every side (the shadow and the wheels).
  function bodyCanvas(w, L, k) {
    var key = w.toFixed(2) + '|' + L.toFixed(2) + '|' + k, cv = CACHE[key], c;
    if (cv) return cv;
    if (CACHE_N > 12) { CACHE = {}; CACHE_N = 0; }
    cv = document.createElement('canvas');
    cv.width = Math.ceil((w + 2 * PAD) * k); cv.height = Math.ceil((L + HGT() + 2 * PAD) * k);
    c = cv.getContext('2d'); c.setTransform(k, 0, 0, k, PAD * k, PAD * k);
    paintCar(c, w, L, HGT());
    CACHE[key] = cv; CACHE_N++;
    return cv;
  }
  // A soft radial glow sprite per colour (cached; drawn with drawImage instead of a gradient every frame).
  function glowSprite(col) {
    var g = GLOW[col], c, gr;
    if (g) return g;
    g = document.createElement('canvas'); g.width = g.height = 64; c = g.getContext('2d');
    gr = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(' + col + ',1)'); gr.addColorStop(1, 'rgba(' + col + ',0)');
    c.fillStyle = gr; c.fillRect(0, 0, 64, 64);
    GLOW[col] = g;
    return g;
  }
  function glow(c, x, y, r, col, a) {
    c.globalAlpha = a; c.drawImage(glowSprite(col), x - r, y - r, 2 * r, 2 * r); c.globalAlpha = 1;
  }

  // Live parts: the pantograph (rocks on its springs; still under Reduce motion), a contact flash, and the head lamp glow.
  function live(R, x, yF, L, w, o) {
    var c = R.ctx, u = R.ppm, t = o.t || 0, sway = o.sway || 0, cx = R.X(x) + sway, px, py, flick, a;
    px = cx + (rm() ? 0 : Math.sin(t * (o.speed ? 38 : 1.3)) * (o.speed ? 1.6 : 0.8)); py = R.Y(yF - L * 0.35);
    c.strokeStyle = INK; c.lineWidth = 2.4; c.beginPath(); c.moveTo(px - 0.35 * u, py + 0.3 * u); c.lineTo(px, py - 0.05 * u); c.lineTo(px + 0.35 * u, py + 0.3 * u); c.stroke();
    c.strokeStyle = '#7D848F'; c.lineWidth = 1.2; c.stroke();
    c.strokeStyle = INK; c.lineWidth = 3.2; c.beginPath(); c.moveTo(px - 0.5 * u, py - 0.05 * u); c.lineTo(px + 0.5 * u, py - 0.05 * u); c.stroke();
    flick = Math.sin(t * 2.1) * Math.sin(t * 5.3 + 1);                                             // contact flash now and then
    c.globalCompositeOperation = 'lighter';
    if (!rm() && (o.speed || flick > 0.82)) { a = o.speed ? 0.8 : (flick - 0.82) * 5; glow(c, px, py - 0.05 * u, 0.5 * u, '170,225,255', a); }
    glow(c, cx, R.Y(yF) + 0.1 * u, 0.9 * u, o.lamp || '255,236,190', 0.55 + 0.1 * Math.sin(t * 3));   // headlamp
    c.globalCompositeOperation = 'source-over';
  }

  // A tram car from yR (rear, the lower edge on screen) to yF (front, the upper edge), centred on x, w wide.
  // o: { t (s), sway (px), speed (0..1), lamp 'r,g,b' }. Always opaque (see the header).
  V.drawCar = function (R, x, yR, yF, w, o) {
    var c = R.ctx, k = bucket(R.ppm), L = yF - yR, cv = bodyCanvas(w, L, k), s = R.ppm / k, sway = (o && o.sway) || 0;
    c.save(); c.globalAlpha = 1;
    c.drawImage(cv, R.X(x - w / 2 - PAD) + sway, R.Y(yF + PAD), cv.width * s, cv.height * s);
    live(R, x, yF, L, w, o || {});
    c.restore();
  };
  // The same car as a landmark painter: fills a w x h metre canvas (top = front), used by istanbul-landmarks tramP.
  V.paintBox = function (c, w, h) {
    c.save(); c.translate(PAD, PAD); paintCar(c, w - 2 * PAD, h - HGT() - 2 * PAD, HGT()); c.restore();
  };

  // ---------- the tram-box rush ----------
  V.reset = function () { rush = null; };
  V.rush = function (ev) {
    var k = C();
    rush = { x: ev.x, y0: ev.y0, y1: ev.y1, w: (ev.w || 2.8) + 0.4, at: now() };
    if (P.Feel) P.Feel.kick(1, 0, k.kick);
  };
  function frontAt(r, el) { return r.y0 - 3 + (r.y1 - r.y0) / C().sweepT * el; }

  V.drawAir = function (R, s) {
    var r = rush, k = C(), t = now(), el, yF, yR, i, sx;
    if (!r) return;
    el = t - r.at; yF = frontAt(r, el); yR = yF - k.len;
    if (yR > r.y1 + 8 || el > 2) { rush = null; return; }
    if (P.Feel && !rm()) {
      for (i = 0; i < k.sparkN; i++) {
        sx = r.x + (i & 1 ? 1 : -1) * (r.w / 2 - 0.35);
        P.Feel.emit({ k: 'spark', col: '255,214,130', x: sx, y: yR + 0.5 + Math.random() * 3, z: 0.05, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 3 - 1, vz: 1 + Math.random() * 2.5, r: 0.03, t: 0.3, T: 0.3 });
      }
      for (i = 0; i < k.dustN; i++) {
        sx = (i & 1 ? 1 : -1);
        P.Feel.emit({ k: 'dust', x: r.x + sx * (r.w / 2 + 0.1), y: yF - Math.random() * k.len, z: 0.05, vx: sx * (2 + Math.random() * 2), vy: 0, vz: 0.3, r: 0.22, t: 0.5, T: 0.5 });
      }
    }
    for (i = 0; i < 3; i++) {                                                                       // speed streaks trailing the car
      R.ctx.fillStyle = 'rgba(255,255,255,' + (0.16 - i * 0.04) + ')';
      R.ctx.fillRect(R.X(r.x - r.w / 2 + 0.4 + i * (r.w - 0.8) / 2) - 1, R.Y(yR), 2, 4 * R.ppm);
    }
    V.drawCar(R, r.x, yR, yF, r.w, { t: t, speed: 1, lamp: '255,70,50', sway: rm() ? 0 : Math.sin(t * 60) * 1.2 });
  };

  return V;
})();
