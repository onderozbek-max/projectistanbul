// Vehicles (view only, v0.9 animation pass). The tram is drawn as a car with height (raised roof, visible end face, cast shadow),
// cab glass, glowing lamps, a bellows joint and a rocking pantograph. Idle on level 1 (render-world drawTram) and at speed for the
// tram-box hack (events-fx 'tramRush'): the lane is swept, the screen jolts, rails spark and dust is thrown aside.
// The simulation never reads this. Numbers: P.CFG.feel2.tram (config-feel.js).
P.Vehicles = (function () {
  var V = {}, rush = null, INK = '#14151F';

  function C() { return P.CFG.feel2.tram; }
  function now() { return performance.now() / 1000; }
  function rm() { return !!(P.Settings && P.Settings.reduceMotion); }
  function rr(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
  }
  function inked(c, fill, lw) { c.fillStyle = fill; c.fill(); c.strokeStyle = INK; c.lineWidth = lw; c.stroke(); }
  function glow(R, x, y, r, col, a) {
    var c = R.ctx, g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(' + col + ',' + a.toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + col + ',0)');
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // A tram car from yR (rear, nearest the camera) to yF (front), centred on x. o: { alpha, lamp 'r,g,b', t (s), sway (px), speed (0..1) }.
  V.drawCar = function (R, x, yR, yF, w, o) {
    var c = R.ctx, u = R.ppm, k = C(), H = k.height * u, X0 = R.X(x - w / 2) + (o.sway || 0), W = w * u, Yf = R.Y(yF), Yr = R.Y(yR), L = Yr - Yf;
    var t = o.t || 0, mid = Yf + L / 2, i, n, px, py, flick, a;
    c.save(); c.globalAlpha = o.alpha === undefined ? 1 : o.alpha; c.lineJoin = 'round';
    rr(c, X0 + 0.28 * u, Yf + 0.12 * u, W, L, 0.2 * u); c.fillStyle = 'rgba(0,0,0,0.28)'; c.fill();            // cast shadow, lower right
    c.beginPath(); c.rect(X0, Yr - H, W, H); inked(c, '#8E2B20', 2);                                              // end face toward the camera
    c.fillStyle = '#7FB6D6'; c.fillRect(X0 + 0.18 * u, Yr - H + 0.08 * u, W - 0.36 * u, H * 0.5);                  // cab windscreen
    c.strokeStyle = INK; c.lineWidth = 1.2; c.strokeRect(X0 + 0.18 * u, Yr - H + 0.08 * u, W - 0.36 * u, H * 0.5);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(X0 + 0.24 * u, Yr - H + 0.12 * u, W * 0.22, H * 0.14);
    rr(c, X0, Yf - H, W, L, 0.22 * u); inked(c, '#C0392B', 3);                                                     // roof, raised by the car height
    rr(c, X0 + 0.22 * u, Yf - H + 0.3 * u, W - 0.44 * u, L - 0.6 * u, 0.12 * u); inked(c, '#F4EBDD', 1.5);
    c.fillStyle = 'rgba(20,21,31,0.16)'; c.fillRect(X0 + W / 2 - 1, Yf - H + 0.4 * u, 2, L - 0.8 * u);            // roof ridge
    for (i = 0; i < 2; i++) {                                                                                       // roof units, one per car
      py = Yf - H + L * (i ? 0.78 : 0.26);
      rr(c, X0 + W * 0.28, py - 0.3 * u, W * 0.44, 0.6 * u, 0.06 * u); inked(c, '#B8C0CA', 1.2);
      c.strokeStyle = 'rgba(20,21,31,0.4)'; c.lineWidth = 1;
      for (n = 1; n < 4; n++) { c.beginPath(); c.moveTo(X0 + W * 0.28, py - 0.3 * u + n * 0.15 * u); c.lineTo(X0 + W * 0.72, py - 0.3 * u + n * 0.15 * u); c.stroke(); }
    }
    rr(c, X0 + 0.12 * u, mid - H - 0.28 * u, W - 0.24 * u, 0.56 * u, 0.05 * u); inked(c, '#2B2B2B', 1.5);          // bellows joint
    c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 1;
    for (n = 1; n < 6; n++) { c.beginPath(); c.moveTo(X0 + 0.12 * u, mid - H - 0.28 * u + n * 0.093 * u); c.lineTo(X0 + W - 0.12 * u, mid - H - 0.28 * u + n * 0.093 * u); c.stroke(); }
    px = X0 + W / 2 + (rm() ? 0 : Math.sin(t * (o.speed ? 38 : 1.3)) * (o.speed ? 1.6 : 0.8)); py = Yf - H + L * 0.4;               // pantograph, rocking on its springs (no rock under Reduce motion)
    c.strokeStyle = INK; c.lineWidth = 2.4; c.beginPath(); c.moveTo(px - 0.35 * u, py + 0.3 * u); c.lineTo(px, py - 0.05 * u); c.lineTo(px + 0.35 * u, py + 0.3 * u); c.stroke();
    c.strokeStyle = '#7D848F'; c.lineWidth = 1.2; c.stroke();
    c.strokeStyle = INK; c.lineWidth = 3.2; c.beginPath(); c.moveTo(px - 0.5 * u, py - 0.05 * u); c.lineTo(px + 0.5 * u, py - 0.05 * u); c.stroke();
    flick = Math.sin(t * 2.1) * Math.sin(t * 5.3 + 1);                                                              // contact flash now and then
    if (!rm() && (o.speed || flick > 0.82)) { a = o.speed ? 0.8 : (flick - 0.82) * 5; c.globalCompositeOperation = 'lighter'; glow(R, px, py - 0.05 * u, 0.5 * u, '170,225,255', a); c.globalCompositeOperation = 'source-over'; }
    c.globalCompositeOperation = 'lighter';                                                                         // lamps on the end face
    glow(R, X0 + 0.32 * u, Yr - H * 0.2, 0.75 * u, o.lamp || '255,236,190', 0.55 + 0.1 * Math.sin(t * 3));
    glow(R, X0 + W - 0.32 * u, Yr - H * 0.2, 0.75 * u, o.lamp || '255,236,190', 0.55 + 0.1 * Math.sin(t * 3 + 1.5));
    c.globalCompositeOperation = 'source-over';
    c.restore();
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
    for (i = 0; i < 3; i++) {                                                                                       // speed streaks trailing the car
      R.ctx.fillStyle = 'rgba(255,255,255,' + (0.16 - i * 0.04) + ')';
      R.ctx.fillRect(R.X(r.x - r.w / 2 + 0.4 + i * (r.w - 0.8) / 2) - 1, R.Y(yR), 2, 4 * R.ppm);
    }
    V.drawCar(R, r.x, yR, yF, r.w, { t: t, speed: 1, lamp: '255,70,50', sway: rm() ? 0 : Math.sin(t * 60) * 1.2 });
  };

  return V;
})();
