// UI motion helpers (docs/design-system.md 7, 11, 13). The durations are the --m-* tokens in css/motion.css; this file reads
// them, so the JS waits and the CSS animations come from one set. Everything here is cosmetic: no tap waits for a motion.
P.UIMotion = (function () {
  var U = {}, pending = [], tapBound = false;

  U.reduced = function () { return !!(P.Settings && P.Settings.reduceMotion); };
  // A token's value in ms (a time token such as 220ms; seconds are converted). Without a document (node tests) it reads 0: nothing waits.
  U.ms = function (name) {
    if (typeof document === 'undefined' || !window.getComputedStyle) return 0;
    var v = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim(), n = parseFloat(v);
    if (isNaN(n)) return 0;
    return /ms$/.test(v) ? n : n * 1000;
  };
  // The wait before a beat runs: none under Reduce motion, the token's time otherwise.
  U.wait = function (name) { return U.reduced() ? 0 : U.ms(name); };
  // Delay in ms for item i of a row: cards deal in one after another, --m-stagger apart.
  U.stagger = function (i) { return U.reduced() ? 0 : i * U.ms('--m-stagger'); };

  // Shows or hides a screen. Hiding keeps it up for --m-exit as a fade, with pointer-events off, so taps reach what is
  // under it at once; then it gets the hidden class. Showing cancels a pending hide. Reduce motion hides at once.
  U.screen = function (node, on) {
    if (!node) return;
    if (on) {
      clearTimeout(node._leave); node._leave = 0;
      node.classList.remove('is-leaving', 'hidden');
      return;
    }
    if (node.classList.contains('hidden') || node._leave) return;
    if (U.reduced()) { node.classList.add('hidden'); return; }
    node.classList.add('is-leaving');
    node._leave = setTimeout(function () {
      node._leave = 0;
      node.classList.remove('is-leaving');
      node.classList.add('hidden');
    }, U.ms('--m-exit'));
  };

  // Counts a number up from 0 to `to` over --m-count, ease-out. fmt(v) gives the text. A tap anywhere on the phone
  // finishes every running count at once; under Reduce motion the final value shows straight away.
  U.countUp = function (node, to, fmt) {
    if (!node) return;
    var total = U.wait('--m-count'), target = Math.round(to), t0 = -1, id = 0, off = false;
    function show(v) { node.textContent = fmt(v); }
    if (total <= 0) { show(target); return; }
    function finish() { if (off) return; off = true; cancelAnimationFrame(id); show(target); }
    function step(now) {
      if (off) return;
      if (t0 < 0) t0 = now;
      var t = Math.min(1, (now - t0) / total), e = 1 - Math.pow(1 - t, 3);
      show(Math.round(target * e));
      if (t < 1) id = requestAnimationFrame(step); else off = true;
    }
    show(0);
    pending.push(finish);
    bindTap();
    id = requestAnimationFrame(step);
  };
  function finishAll() {
    var list = pending;
    pending = [];
    list.forEach(function (f) { f(); });
  }
  function bindTap() {
    var ph = document.getElementById('phone');
    if (tapBound || !ph) return;
    tapBound = true;
    ph.addEventListener('pointerdown', finishAll);
  }
  U.finishAll = finishAll;

  // Exit for a node that is going (a toast, a panel): cls starts the fade and slide that css/ gives it over --m-exit, and
  // done() runs when that has run (the caller removes or hides the node there). Under Reduce motion done() runs at once.
  // Returns the timer id (0 when done ran at once), so a pending exit can be cancelled.
  U.leave = function (node, cls, done) {
    if (!node || U.reduced()) { if (done) done(); return 0; }
    node.classList.add(cls);
    return setTimeout(done, U.ms('--m-exit'));
  };
  // Meta panels (docs/design-system.md 7, 13): panelHide slides the panel out (class is-out), then sets meta-hidden;
  // panelShow cancels a pending exit and shows the panel; panelOpen is true only for a shown panel that is not leaving.
  U.panelHide = function (node) {
    if (!node || node._leave || node.classList.contains('meta-hidden')) return;
    node._leave = U.leave(node, 'is-out', function () { node._leave = 0; node.classList.remove('is-out'); node.classList.add('meta-hidden'); });
  };
  U.panelShow = function (node) {
    if (!node) return;
    clearTimeout(node._leave); node._leave = 0;
    node.classList.remove('is-out', 'meta-hidden');
  };
  U.panelOpen = function (node) { return !!node && !node.classList.contains('meta-hidden') && !node.classList.contains('is-out'); };

  return U;
})();
