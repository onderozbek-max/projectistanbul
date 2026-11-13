// First-time hints, core (T4 part 10, view only). The first time an interaction type is in view, ever, the game shows one
// 2 s callout (P.Hints). Callouts queue and start at least 4 s apart, one at a time. They never pause the game and never read
// anything but the sim's public state. A type that has shown (or was tapped away) is stored and never shows again (per store).
// The presenter (hints-view.js) draws the callout; detectors (hints-detect.js) say what is in view. Tokens: hints-config.js.
P.Hints = (function () {
  var H = {}, C = P.CFG.hints, ORDER = ['heal', 'currency', 'objective', 'chest', 'explosive', 'cover', 'link', 'tram', 'door', 'dash', 'call'];
  var seen = {}, loaded = false, store = null, queue = [], active = null, nextAt = 0, now = 0, lastSim = null;
  H.ORDER = ORDER;

  function defaultStore() { return typeof localStorage !== 'undefined' ? localStorage : null; }
  // Read the seen list from a store (localStorage in the game; an object with getItem and setItem in tests).
  H.setStore = function (st) {
    store = st === undefined ? defaultStore() : st;
    seen = {}; loaded = true;
    try { seen = JSON.parse((store && store.getItem(C.storeKey)) || '{}') || {}; } catch (e) { seen = {}; }
  };
  function ensure() { if (!loaded) H.setStore(); }
  function save() { try { if (store) store.setItem(C.storeKey, JSON.stringify(seen)); } catch (e) { /* private mode: keep in memory */ } }
  H.isSeen = function (type) { ensure(); return !!seen[type]; };
  H.seenList = function () { ensure(); return Object.keys(seen).filter(function (k) { return seen[k]; }); };

  // A hint whose scripted L1 step is not done yet waits (it is not marked seen). See hints-config.js, hintGates.
  function gateOpen(s, type) {
    var tut = s.dir && s.dir.tut, g = P.CFG.hintGates[type];
    if (!tut || !g) return true;
    if (g.level !== undefined && s.levelIndex !== g.level) return true;
    return !!tut.done[g.step];
  }

  // Shows a callout now: marks the type seen (and stores it), and sets the next start time.
  function start(item) {
    active = { type: item.type, x: item.x, y: item.y, hud: item.hud || null, t: 0 };
    nextAt = now + C.gapS;
    seen[item.type] = true;
    save();
  }

  // What the detectors and the presenter need from render.js: phone size, world-to-phone mapping, the hero's phone point.
  H.context = function (s) {
    var R = P.Render, W = (R && R.W) || 390, Hh = (R && R.H) || 844;
    return {
      W: W, H: Hh, hudBottom: C.hudBottomPx,
      toScreen: function (x, y) { return R.toScreen(x, y); },
      inView: function (x, y) { var p = R.toScreen(x, y); return p.x >= 0 && p.x <= W && p.y >= 0 && p.y <= Hh; },
      heroScreen: s && s.hero ? R.toScreen(s.hero.x, s.hero.y) : { x: W / 2, y: Hh / 2 }
    };
  };

  // Called every frame in play (main.js tick, after the frame is drawn) with the sim, or null when the game is not playing
  // (the callout hides and the queue waits). dt is game time, so a pause stops the timers.
  H.update = function (s, dt) {
    ensure();
    if (!s || !P.Render || !P.Render.cam) { active = null; if (H.view) H.view.render(null, null, s); return; }   // paused or not in a run
    var ctx = H.context(s);
    if (s !== lastSim) { lastSim = s; queue = []; active = null; }
    now += dt || 0;
    if (active) { active.t += dt || 0; if (active.t >= C.showS) active = null; }
    var found = P.HintsDetect ? P.HintsDetect.scan(s, ctx) : {}, i, type, f, q;
    for (i = 0; i < ORDER.length; i++) {
      type = ORDER[i]; f = found[type];
      if (!f || seen[type] || !gateOpen(s, type)) continue;
      if (active && active.type === type) { active.x = f.x; active.y = f.y; active.hud = f.hud || null; continue; }
      q = queue.filter(function (it) { return it.type === type; })[0];
      if (q) { q.x = f.x; q.y = f.y; q.hud = f.hud || null; }
      else queue.push({ type: type, x: f.x, y: f.y, hud: f.hud || null });
    }
    if (!active && queue.length && now >= nextAt && !(s.dir && s.dir.tut && s.dir.tut.active)) start(queue.shift());
    if (H.view) H.view.render(active, ctx, s);
  };

  // A tap on the callout: it goes away at once and the type stays seen.
  H.skip = function () { active = null; };
  H.current = function () { return active; };
  H.queued = function () { return queue.map(function (q) { return q.type; }); };
  H.reset = function () { seen = {}; queue = []; active = null; nextAt = 0; now = 0; lastSim = null; save(); };   // tests only
  return H;
})();
