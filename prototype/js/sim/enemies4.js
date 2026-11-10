// Wave 1 enemy types (R1, audit section 10): marti (seagull thief, enemies4-marti.js) and cayci (tea carrier,
// enemies4-cayci.js). This file: owns/init/think dispatch, contact, death hooks, the flyer clamp, and the tea puddle's
// hero slow (P.Enemies4.heroMul, read by sim.js stepHero). Defs: config-enemies5.js.
(function () {
  P.Enemies4 = {};
  var TYPES = ['marti', 'cayci'];

  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  P.Enemies4.owns = function (type) { return TYPES.indexOf(type) >= 0; };

  P.Enemies4.init = function (s, e) {
    if (e.type === 'marti') e.ai = { m: 'hover', t: 0, drop: null, carry: 0 };
    else e.ai = { m: 'walk', t: 0, cd: P.CFG.enemies5.cayci.firstCd, aimX: 0, aimY: 0 };
  };

  P.Enemies4.think = function (s, e, dt) {
    return e.type === 'cayci' ? P.Cayci.think(s, e, dt) : P.Marti.think(s, e, dt);
  };

  // Marti's bite does nothing (contact 0): it is handled here, so no hit is dealt. Cayci hits like a walker.
  P.Enemies4.onContact = function (s, e) {
    return e.type === 'marti';
  };

  // Death: a marti carrying a drop gives the XP back (and bonus gold). Cayci: nothing (its puddle stays).
  P.Enemies4.onDeath = function (s, e) {
    if (e.type === 'marti') P.Marti.onDeath(s, e);
  };

  // Flyers ignore walls: keep them inside the level's side walls and its length, nothing else.
  P.Enemies4.clampFly = function (s, e) {
    var g = s.geo, r = e.r;
    if (!g) return;
    e.x = Math.min(Math.max(e.x, g.xMin + r), g.xMax - r);
    e.y = Math.min(Math.max(e.y, r), g.length - r);
  };

  // Per-step frame (enemies.js frame): the hero's slow timer, refreshed while the hero stands in a tea puddle.
  P.Enemies4.frame = function (s, dt) {
    var T = s.tea || (s.tea = { slowT: 0 }), h = s.hero, i, z;
    for (i = 0; i < s.zones.length; i++) {
      z = s.zones[i];
      if (z.kind === 'tea' && dist(h, z) <= z.r + P.CFG.hero.radius) T.slowT = P.CFG.enemies5.cayci.slow.t;
    }
    T.slowT = Math.max(0, T.slowT - dt);
  };

  // Multiplier on the hero's move speed (sim.js stepHero): slow while the slow timer runs.
  P.Enemies4.heroMul = function (s) {
    return s.tea && s.tea.slowT > 0 ? P.CFG.enemies5.cayci.slow.m : 1;
  };

  // A tea glob landed (enemies.js landGlob): a puddle zone, no hero damage (the glob does none).
  P.Enemies4.teaPuddle = function (s, x, y, r, T) {
    s.zones.push({ kind: 'tea', x: x, y: y, r: r, t: T, T: T, dps: 0, heroDps: 0, tick: 0, hit: {} });
    s.events.push({ type: 'teaLand', x: x, y: y, r: r });
  };

  // Telegraph resolution for the marti's dive shadow (enemies.js onTele, then: 'swoop').
  P.Enemies4.onTele = function (s, tg) {
    if (tg.then === 'swoop') P.Marti.swoop(s, tg);
  };
})();
