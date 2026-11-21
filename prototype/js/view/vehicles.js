// Vehicles (view only). One tram drawing, used three ways: the idle car on level 1 (render-world drawTram), the car rushing
// through the tram-box lane (events-fx 'tramRush', drawAir) and the tram landmark in generated hoods (istanbul-landmarks.js).
// Look: Istanbul nostalgic tram. Red body with a broad cream roof, shallow red sides, a dark windscreen,
// a headlamp, a route plate and a brass bell at the front, a rear end face with two lamps, bogies and wheels at the sides,
// a soft shadow and a pantograph on the roof. Roof-first overhead view: the roof is raised by the car height, so the rear end face shows
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

  // Local metres: the front roof edge is the origin and the tracks run down the canvas.
  function paintCar(c, w, L, hg) {
    c.lineJoin = 'round';
    rrect(c, 0.13, hg + 0.12, w + 0.18, L + 0.1, 0.45); c.fillStyle = 'rgba(20,21,31,0.19)'; c.fill();
    rrect(c, 0.09, hg + 0.04, w + 0.09, L + 0.04, 0.4); c.fillStyle = 'rgba(20,21,31,0.22)'; c.fill();
    for (var i = 0; i < 2; i++) {
      var y = L * (i ? 0.78 : 0.22) + hg;
      fillRr(c, -0.08, y - 0.35, w + 0.16, 0.7, 0.16, INK, 0);
    }
    fillRr(c, 0, 0, w, L + hg, 0.39, RED_DARK, 0.055);
    fillRr(c, 0.1, L + hg - 0.12, w - 0.2, 0.12, 0.05, INK, 0.015);
    fillRr(c, 0, 0, w, L + hg * 0.55, 0.39, RED, 0.04);
    var roof = c.createLinearGradient(0, 0, w, 0);
    roof.addColorStop(0, '#A78F79');
    roof.addColorStop(0.26, CREAM);
    roof.addColorStop(0.62, '#EFE5D1');
    roof.addColorStop(1, '#977D6C');
    fillRr(c, 0.12, 0.55, w - 0.24, L - 1.1, 0.3, roof, 0.045);
    fillRr(c, 0.38, 0.67, 0.045, L - 1.35, 0.02, 'rgba(255,255,255,0.48)', 0);
    [0.18, 0.43, 0.68, 0.86].forEach(function (pos) {
      c.fillStyle = 'rgba(105,82,65,0.24)'; c.fillRect(0.24, L * pos, w - 0.48, 0.022);
      c.fillStyle = 'rgba(255,255,255,0.34)'; c.fillRect(0.24, L * pos + 0.022, w - 0.48, 0.035);
    });
    [0.24, 0.57, 0.75].forEach(function (pos) {
      fillRr(c, w / 2 - 0.27, L * pos, 0.54, 0.37, 0.07, '#B09B83', 0.026);
      fillRr(c, w / 2 - 0.21, L * pos + 0.06, 0.42, 0.055, 0.03, '#EDE0C9', 0);
    });
    cab(c, w, L, hg);
  }

  function cab(c, w, L, hg) {
    fillRr(c, 0.21, 0.13, w - 0.42, 0.51, 0.13, CREAM, 0.026);
    fillRr(c, 0.21, L - 0.64, w - 0.42, 0.56, 0.13, CREAM, 0.026);
    fillRr(c, 0.27, 0.16, w - 0.54, 0.45, 0.12, GLASS, 0.03);
    fillRr(c, 0.27, L - 0.6, w - 0.54, 0.48, 0.12, GLASS, 0.035);
    [0.23, L - 0.53].forEach(function (y) {
      c.fillStyle = 'rgba(210,228,241,0.25)';
      c.beginPath(); c.moveTo(0.47, y); c.lineTo(0.92, y); c.lineTo(0.62, y + 0.28); c.lineTo(0.42, y + 0.28); c.fill();
      fillRr(c, w / 2 - 0.035, y - 0.03, 0.07, 0.39, 0.025, CREAM, 0);
    });
    dot(c, w / 2, 0.11, 0.1, '#FFE9AF', 0.025);
    dot(c, w / 2 + 0.38, 0.09, 0.065, BRASS, 0.018);
    [0.32, w - 0.32].forEach(function (x) { dot(c, x, L + hg * 0.38, 0.084, '#FF8E76', 0.02); });
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
  function live(R, x, yF, L, o) {
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
    o = o || {};
    var c = R.ctx, L = yF - yR, u = R.ppm, sway = o.sway || 0;
    c.save(); c.globalAlpha = 1;
    if (P.StreetArt && P.StreetArt.tram(c, R.X(x) + sway, R.Y((yR + yF) / 2), w * u, L * u, o.heading)) {
      c.globalCompositeOperation = 'lighter';
      var a = o.heading || 0, front = L * u / 2;
      glow(c, R.X(x) + sway + Math.sin(a) * front, R.Y((yR + yF) / 2) - Math.cos(a) * front,
        .66 * u, o.lamp || '255,236,190', .52);
    } else {
      var k = bucket(u), cv = bodyCanvas(w, L, k), scale = u / k;
      c.drawImage(cv, R.X(x - w / 2 - PAD) + sway, R.Y(yF + PAD), cv.width * scale, cv.height * scale);
      live(R, x, yF, L, o);
    }
    c.restore();
  };
  // The same car as a landmark painter: fills a w x h metre canvas (top = front), used by istanbul-landmarks tramP.
  V.paintBox = function (c, w, h) {
    if (P.StreetArt && P.StreetArt.tram(c, w / 2, h / 2, w, h)) return;
    c.save(); c.translate(PAD, PAD); paintCar(c, w - 2 * PAD, h - HGT() - 2 * PAD, HGT()); c.restore();
  };

  // ---------- the tram-box rush ----------
  V.reset = function () { rush = null; };

  var FIGURES = ['walker_student', 'walker_shopper', 'runner', 'walker_office', 'crawler', 'walker_tourist'];
  var WALK = ['walk1', 'walk2'];
  function sceneAge(s, pass) { return pass.elapsed + (pass.endedAt === undefined ? 0 : s.t - pass.endedAt); }
  function drawCrowd(R, s, crowd) {
    var t = sceneAge(s, crowd), c = R.ctx, C = P.CFG.levels.tramStop;
    var sweep = t - C.gatherT, end = C.sweepT + C.returnT + 0.3;
    if (sweep >= end) return;
    var speed = (crowd.y1 - crowd.y0 + C.frontLead) / C.sweepT;
    for (var row = 7; row >= 0; row--) {
      for (var col = 0; col < 4; col++) {
        var i = row * 4 + col, id = FIGURES[(i + row * 3) % FIGURES.length], sign = col < 2 ? -1 : 1;
        var delay = (row % 4) * 0.14 + (col % 2) * 0.08;
        var walk = t - delay;
        if (walk < 0) continue;
        var p = Math.min(1, walk / (C.gatherT - delay - 0.12)), left = 1 - p * p * (3 - 2 * p);
        var side = col === 0 || col === 3, dx = sign * (side ? 7.4 + (row % 3) * 0.34 : 2.1), dy = (col === 1 ? 1 : -1);
        var wiggle = rm() ? 0 : (0.07 + left * 0.07) * Math.sin(t * 3 + i);
        var x = crowd.x + (col - 1.5) * crowd.w * 0.23 + dx * left + wiggle;
        var y = crowd.y0 + 1.35 + row * 1.04 + Math.sin(i * 3) * 0.20;
        var entryY = side ? y + (row % 2 ? 1.4 : -1.6) : crowd.y0 + (dy > 0 ? 22 : -13);
        y += (entryY - y) * left;
        var impact = sweep - (y - crowd.y0 + C.frontLead) / speed;
        var dead = impact >= 0, q = Math.min(1, Math.max(0, impact / 0.44));
        if (dead) { x += sign * (0.18 + (1 - (1 - q) * (1 - q)) * 1.25); y -= Math.sin(q * Math.PI) * 0.33; }
        var alpha = dead ? Math.min(0.95, (end - sweep) * 1.1) : 1;
        var screen = R.toScreen(x, y);
        if (screen.x < -R.ppm || screen.x > R.W + R.ppm || screen.y < -R.ppm || screen.y > R.H + R.ppm) continue;
        crowdFigure(c, R, id, x, y, i, t, dead, sign, alpha);
      }
    }
  }

  function crowdFigure(c, R, id, x, y, i, t, dead, sign, alpha) {
    var art = P.ArtRaster, frame = dead ? 'dead' : rm() ? 'idle' : WALK[Math.floor(t * 9 + i * 0.7) % WALK.length];
    var sprite = art && art.entry('characters', id), u = R.ppm;
    var X = R.X(x), Y = R.Y(y);
    c.save(); c.globalAlpha = alpha;
    c.beginPath(); c.ellipse(X, Y, u * 0.25, u * 0.13, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(22,25,31,.42)'; c.fill();
    if (!sprite || !art.draw(c, 'characters', id, frame, X, Y, u * (0.81 + (i % 3) * 0.08) / sprite.heightPx,
      { mirror: sign < 0, rot: dead ? sign * 0.30 : 0, alpha: alpha })) {
      c.beginPath(); c.ellipse(X, Y - (dead ? 0.05 : 0.27) * u, u * (dead ? 0.32 : 0.17), u * (dead ? 0.12 : 0.37), 0, 0, Math.PI * 2);
      c.fillStyle = i % 2 ? '#A9A572' : '#787655'; c.fill();
    }
    c.restore();
  }
  V.rush = function (ev) {
    var k = C();
    rush = { x: ev.x, y0: ev.y0, y1: ev.y1, w: (ev.w || 2.8) + 0.4, at: ev.simTime === undefined ? now() : ev.simTime,
      scene: ev.staged ? ev : null, timed: ev.staged || ev.simTime !== undefined, T: ev.sweep || k.sweepT, lead: ev.frontLead || 3 };
    if (P.Feel) P.Feel.kick(1, 0, ev.sweep ? k.kick * 0.42 : k.kick);
  };

  V.drawAir = function (R, s) {
    var r = rush, k = C(), t = now(), el, yF, yR, i, sx;
    var H = s.gen && s.gen.tramControl;
    if (H && H.crowd) drawCrowd(R, s, H.crowd);
    if (!r) return;
    el = r.scene ? sceneAge(s, r.scene) - P.CFG.levels.tramStop.gatherT : (r.timed ? s.t : t) - r.at;
    yF = r.y0 - r.lead + (r.y1 - r.y0 + (r.timed ? r.lead : 0)) * el / r.T; yR = yF - k.len;
    if (yR > r.y1 + 8 || el > r.T + 2.5) { rush = null; return; }
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
    for (i = 0; !r.timed && i < 3; i++) {                                                            // speed streaks trailing the car
      R.ctx.fillStyle = 'rgba(255,255,255,' + (0.16 - i * 0.04) + ')';
      R.ctx.fillRect(R.X(r.x - r.w / 2 + 0.4 + i * (r.w - 0.8) / 2) - 1, R.Y(yR), 2, 4 * R.ppm);
    }
    V.drawCar(R, r.x, yR, yF, r.w, { t: t, speed: r.timed ? 0 : 1, lamp: r.timed ? '255,223,170' : '255,70,50', sway: rm() || r.timed ? 0 : Math.sin(t * 60) * 1.2 });
  };

  return V;
})();
