// Input: floating one-thumb joystick in the lower 60% of the screen (GD 2, DS 13) + WASD/arrows.
// Dash (workstream E1): flick (finger moves >= flickPx within flickMs; the flick is the dash direction),
// double-tap (two taps within tapMs and tapPx; dash follows the stick or facing), Space or Shift.
// Ultimate: Q or P.Input.requestUlt() (the ULT button). get() returns {x, y, dash, ult}; dash and ult are
// one-shot and are cleared by get() and reset().
P.Input = (function () {
  var I = { enabled: false, vec: { x: 0, y: 0 }, keys: {}, onPause: null, onAnyTap: null,
    dashReq: false, ultReq: false, dashDir: null };
  var joy, phone, pid = null, base = null, RADIUS = 31, DEAD = 0.08;
  var trail = null, lastTap = null;

  I.init = function (phoneEl, toLocal) {
    phone = phoneEl; joy = document.getElementById('joy');
    phone.addEventListener('pointerdown', function (e) {
      var p = toLocal(e), now = performance.now();
      trail = { id: e.pointerId, pts: [{ x: p.x, y: p.y, t: now }] };
      if (I.onAnyTap) I.onAnyTap(e);
      if (!I.enabled || e.target.closest('button')) return;
      tapCheck(p, now);
      if (pid !== null || p.y < 0.4 * 844) return;
      pid = e.pointerId; base = p;
      try { phone.setPointerCapture(pid); } catch (err) { /* synthetic events */ }
      joy.style.left = p.x + 'px'; joy.style.top = p.y + 'px';
      joy.classList.remove('hidden');
      setKnob(0, 0);
    });
    phone.addEventListener('pointermove', function (e) {
      var p = toLocal(e);
      if (trail && e.pointerId === trail.id && I.enabled) flickCheck(p, performance.now());
      if (e.pointerId !== pid) return;
      var dx = p.x - base.x, dy = p.y - base.y, d = Math.hypot(dx, dy);
      var k = d > RADIUS ? RADIUS / d : 1;
      setKnob(dx * k, dy * k);
      var m = Math.min(1, d / RADIUS);
      if (m < DEAD) { I.vec.x = 0; I.vec.y = 0; return; }
      I.vec.x = dx / d * m; I.vec.y = -dy / d * m;
    });
    function end(e) {
      if (trail && e.pointerId === trail.id) trail = null;
      if (e.pointerId !== pid) return;
      pid = null; I.vec.x = 0; I.vec.y = 0;
      joy.classList.add('hidden');
    }
    phone.addEventListener('pointerup', end);
    phone.addEventListener('pointercancel', end);
    window.addEventListener('keydown', function (e) {
      I.keys[e.key.toLowerCase()] = true;
      if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && I.onPause) I.onPause();
      if (!I.enabled || e.repeat) return;
      if (e.key === ' ' || e.key === 'Shift') { I.dashReq = true; I.dashDir = null; e.preventDefault(); }
      if (e.key === 'q' || e.key === 'Q') I.ultReq = true;
    });
    window.addEventListener('keyup', function (e) { I.keys[e.key.toLowerCase()] = false; });
    window.addEventListener('blur', function () { I.keys = {}; if (I.onPause && I.enabled) I.onPause(); });
  };

  function setKnob(x, y) { joy.firstElementChild.style.transform = 'translate(' + x + 'px,' + y + 'px)'; }

  // Two taps close in time and space = dash.
  function tapCheck(p, now) {
    var D = P.CFG.skills.dash;
    if (lastTap && now - lastTap.t <= D.tapMs && Math.hypot(p.x - lastTap.x, p.y - lastTap.y) <= D.tapPx) {
      I.dashReq = true; I.dashDir = null; lastTap = null;
      return;
    }
    lastTap = { x: p.x, y: p.y, t: now };
  }

  // Fast drag: the oldest sample inside flickMs must be at least flickPx away. Direction is the flick.
  function flickCheck(p, now) {
    var D = P.CFG.skills.dash, pts = trail.pts, o, dx, dy, d;
    pts.push({ x: p.x, y: p.y, t: now });
    while (pts.length > 1 && now - pts[0].t > D.flickMs) pts.shift();
    o = pts[0];
    dx = p.x - o.x; dy = p.y - o.y; d = Math.hypot(dx, dy);
    if (d < D.flickPx) return;
    I.dashReq = true; I.dashDir = { x: dx / d, y: -dy / d };
    pts.length = 0; pts.push({ x: p.x, y: p.y, t: now });
  }

  I.requestUlt = function () { if (I.enabled) I.ultReq = true; };

  I.reset = function () {
    pid = null; I.vec.x = 0; I.vec.y = 0; joy && joy.classList.add('hidden');
    I.dashReq = false; I.ultReq = false; I.dashDir = null; trail = null; lastTap = null;
  };

  I.get = function () {
    var k = I.keys, x = 0, y = 0, out, dash = I.dashReq, ult = I.ultReq, dir = I.dashDir;
    I.dashReq = false; I.ultReq = false; I.dashDir = null;
    if (!I.enabled) return { x: 0, y: 0, dash: false, ult: false };
    if (k.a || k.arrowleft) x -= 1; if (k.d || k.arrowright) x += 1;
    if (k.w || k.arrowup) y += 1; if (k.s || k.arrowdown) y -= 1;
    if (x || y) { var m = Math.hypot(x, y); out = { x: x / m, y: y / m }; }
    else out = { x: I.vec.x, y: I.vec.y };
    if (dash && dir) out = dir;
    return { x: out.x, y: out.y, dash: dash, ult: ult };
  };
  return I;
})();
