// Input: floating one-thumb joystick in the lower 60% of the screen (GD 2, DS 13) + WASD/arrows.
P.Input = (function () {
  var I = { enabled: false, vec: { x: 0, y: 0 }, keys: {}, onPause: null, onAnyTap: null, onSwipe: null };
  var joy, phone, pid = null, base = null, down = null, RADIUS = 31, DEAD = 0.08;

  I.init = function (phoneEl, toLocal) {
    phone = phoneEl; joy = document.getElementById('joy');
    phone.addEventListener('pointerdown', function (e) {
      var p = toLocal(e);
      down = { x: p.x, y: p.y, t: performance.now() };
      if (I.onAnyTap) I.onAnyTap(e);
      if (!I.enabled || pid !== null || e.target.closest('button')) return;
      if (p.y < 0.4 * 844) return;
      pid = e.pointerId; base = p;
      try { phone.setPointerCapture(pid); } catch (err) { /* synthetic events */ }
      joy.style.left = p.x + 'px'; joy.style.top = p.y + 'px';
      joy.classList.remove('hidden');
      setKnob(0, 0);
    });
    phone.addEventListener('pointermove', function (e) {
      var p = toLocal(e);
      if (down && I.onSwipe && Math.hypot(p.x - down.x, p.y - down.y) > 30) { var cb = I.onSwipe; down = null; cb(); }
      if (e.pointerId !== pid) return;
      var dx = p.x - base.x, dy = p.y - base.y, d = Math.hypot(dx, dy);
      var k = d > RADIUS ? RADIUS / d : 1;
      setKnob(dx * k, dy * k);
      var m = Math.min(1, d / RADIUS);
      if (m < DEAD) { I.vec.x = 0; I.vec.y = 0; return; }
      I.vec.x = dx / d * m; I.vec.y = -dy / d * m;
    });
    function end(e) {
      down = null;
      if (e.pointerId !== pid) return;
      pid = null; I.vec.x = 0; I.vec.y = 0;
      joy.classList.add('hidden');
    }
    phone.addEventListener('pointerup', end);
    phone.addEventListener('pointercancel', end);
    window.addEventListener('keydown', function (e) {
      I.keys[e.key.toLowerCase()] = true;
      if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && I.onPause) I.onPause();
    });
    window.addEventListener('keyup', function (e) { I.keys[e.key.toLowerCase()] = false; });
    window.addEventListener('blur', function () { I.keys = {}; if (I.onPause && I.enabled) I.onPause(); });
  };

  function setKnob(x, y) { joy.firstElementChild.style.transform = 'translate(' + x + 'px,' + y + 'px)'; }

  I.reset = function () { pid = null; I.vec.x = 0; I.vec.y = 0; joy && joy.classList.add('hidden'); };

  I.get = function () {
    var k = I.keys, x = 0, y = 0;
    if (k.a || k.arrowleft) x -= 1; if (k.d || k.arrowright) x += 1;
    if (k.w || k.arrowup) y += 1; if (k.s || k.arrowdown) y -= 1;
    if (x || y) { var m = Math.hypot(x, y); return { x: x / m, y: y / m }; }
    return I.enabled ? { x: I.vec.x, y: I.vec.y } : { x: 0, y: 0 };
  };
  return I;
})();
