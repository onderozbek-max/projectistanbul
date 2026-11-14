// Hack zone, the "Link · hold" interaction (T4 part 10, view only). A terminal (ATM, traffic light, signal booster, shutter,
// car alarm, tram box) is linked in by standing in its ring until the rim fills; leaving the ring pauses it and it decays.
// Phases come from the sim's own state: idle (dashed blue), active (solid blue, the rim fills), paused (dashed grey with
// PAUSED, the rim holds its level as it decays), done (a completion pop, then the sim fades it). Off-screen terminals get an
// arrow at the screen edge. Drawn from events-fx.js (ground) and render.js (screen). The sim never reads this.
P.ConsumablesZone = (function () {
  var Z = {}, Z_C = P.CFG.hackZone, TAU = Math.PI * 2, INK = '#14151F', popAt = {};
  var RGB = { idle: '124,199,255', active: '124,199,255', paused: '154,166,178', done: '124,199,255' };
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function reduce() { return !!(P.Settings && (P.Settings.reduceMotion || P.Settings.reduceFlash)); }

  // The phase the sim is in (no timers of its own).
  Z.phase = function (H) {
    if (H.state === 'done') return 'done';
    if (H.state === 'active') return 'active';
    return H.prog > 0 ? 'paused' : 'idle';
  };

  // Ground draw for one terminal (called from events-fx.js in place of its old ring). t = wall seconds.
  Z.draw = function (R, H, t) {
    var c = R.ctx, X = R.X(H.x), Y = R.Y(H.y), r = P.CFG.hack.r * R.ppm, ph = Z.phase(H), rgb = RGB[ph], p = clamp01(H.prog);
    var still = reduce(), pulse = still || ph !== 'active' ? 1 : 1 + Z_C.pulseAmp * Math.sin(TAU * Z_C.pulseHz * t);
    var rimR = r * Z_C.rimFrac, rimW = Z_C.rimPx, ir = Math.max(Z_C.iconMinPx, r * Z_C.iconFrac), k, popR, a;
    if (ph === 'done' && popAt[H.id] === undefined) popAt[H.id] = t;
    c.beginPath(); c.arc(X, Y, r, 0, TAU);
    c.fillStyle = 'rgba(' + rgb + ',' + ((ph === 'active' ? 0.3 : ph === 'done' ? 0.12 : 0.16) * pulse).toFixed(3) + ')'; c.fill();
    c.setLineDash(ph === 'active' || ph === 'done' ? [] : [8, 6]);
    c.strokeStyle = 'rgba(' + rgb + ',0.9)'; c.lineWidth = 2.5; c.beginPath(); c.arc(X, Y, r, 0, TAU); c.stroke();
    c.setLineDash([]);
    c.lineWidth = rimW + 3; c.strokeStyle = INK; c.beginPath(); c.arc(X, Y, rimR, 0, TAU); c.stroke();
    if (p > 0) {
      c.lineWidth = rimW; c.strokeStyle = 'rgba(' + rgb + ',0.95)';
      c.beginPath(); c.arc(X, Y, rimR, -Math.PI / 2, -Math.PI / 2 + TAU * p); c.stroke();
    }
    P.ConsumablesIcons.draw(c, 'link', X, Y, ir, ph === 'paused' ? '#C8D0D8' : '#7CC7FF', INK);
    if (ph === 'paused') {
      c.font = '800 ' + Math.round(r * 0.22) + 'px "CM Bangers", Bangers, Impact, sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 3; c.strokeStyle = INK;
      c.strokeText(P.t('zone.paused'), X, Y + r + 10); c.fillStyle = '#E6F0FF'; c.fillText(P.t('zone.paused'), X, Y + r + 10);
    }
    if (ph === 'done' && t - popAt[H.id] < Z_C.popT) {   // completion pop: the ring grows and fades; no flash
      k = (t - popAt[H.id]) / Z_C.popT;
      popR = still ? r : r * (1 + (Z_C.popScale - 1) * k);
      a = 0.9 * (1 - k);
      c.beginPath(); c.arc(X, Y, popR, 0, TAU); c.lineWidth = 4; c.strokeStyle = 'rgba(' + RGB.done + ',' + a.toFixed(3) + ')'; c.stroke();
    }
  };

  // Screen draw: an arrow at the phone edge for each live terminal that is off screen. Logical px (390 x 844).
  Z.drawScreen = function (R, s) {
    if (!s || !s.hacks || !s.hacks.length) return;
    var c = R.ctx, W = R.W, Hh = R.H, m = Z_C.edgeInsetPx, cx = W / 2, cy = Hh / 2, i, H, sp, dx, dy, sc, ex, ey, ang, sz = Z_C.edgeArrowPx;
    c.save(); c.setTransform(R.dpr || 1, 0, 0, R.dpr || 1, 0, 0);
    for (i = 0; i < s.hacks.length; i++) {
      H = s.hacks[i];
      if (H.state === 'done') continue;
      sp = R.toScreen(H.x, H.y); dx = sp.x - cx; dy = sp.y - cy;
      if (Math.abs(dx) <= cx - m && Math.abs(dy) <= cy - m) continue;   // on screen: the ring is enough
      sc = Math.min(Math.abs(dx) > 0 ? (cx - m) / Math.abs(dx) : Infinity, Math.abs(dy) > 0 ? (cy - m) / Math.abs(dy) : Infinity);
      ex = cx + dx * sc; ey = cy + dy * sc; ang = Math.atan2(dy, dx);
      c.save(); c.translate(ex, ey); c.rotate(ang);
      c.beginPath(); c.moveTo(sz * 0.5, 0); c.lineTo(-sz * 0.5, -sz * 0.5); c.lineTo(-sz * 0.5, sz * 0.5); c.closePath();
      c.fillStyle = 'rgba(' + RGB.active + ',0.95)'; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
      c.restore();
    }
    c.restore();
  };

  return Z;
})();
