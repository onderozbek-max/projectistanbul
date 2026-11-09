// Objective kinds (lane P). Each kind has: init(s, o), step(s, o, dt), won(s, o) (checked at the win),
// status(s, o) -> { line, vars, frac, hp }, items(s, o) -> HUD markers, target(s, o) -> bot waypoint or null.
// Numbers come from config-objectives.js (types). Kinds never draw; objectives-hud.js (view) does.
P.ObjKinds = (function () {
  var K = {};
  var T = function () { return P.CFG.objectives.types; };
  var dist = function (a, b) { return Math.hypot(a.x - b.x, a.y - b.y); };
  var clock = function (t) { return P.Objectives.clock(t); };
  var noItems = function () { return []; };
  var noTarget = function () { return null; };

  // Enemies that can hit a point (active, alive).
  function enemiesNear(s, x, y, r) {
    var n = 0;
    s.enemies.forEach(function (e) { if (!e.dead && e.state === 'active' && Math.hypot(e.x - x, e.y - y) <= r) n++; });
    return n;
  }

  // A spot off the side blocks: tries small sideways nudges, else the spot as given.
  function freeSpot(s, x, y) {
    var nudge = [0, 1.5, -1.5, 3, -3], i;
    for (i = 0; i < nudge.length; i++) {
      if (!P.Events.blocked(s, x + nudge[i], y)) return { x: clampX(s, x + nudge[i]), y: y };
    }
    return { x: clampX(s, x), y: y };
  }
  function clampX(s, x) { return Math.max(s.geo.xMin + 1, Math.min(s.geo.xMax - 1, x)); }

  // Reach the gate within the par time (bonus for speed). Judged at the win.
  K.reach = {
    init: function (s, o) { o.par = T().reach.par[Math.min(o.stage, T().reach.par.length) - 1]; },
    step: function () {},
    won: function (s, o) { return o.t <= o.par; },
    status: function (s, o) {
      return { line: 'obj.reach.line', vars: { t: clock(o.t), par: clock(o.par) }, frac: Math.min(1, s.hero.y / s.geo.exitY) };
    },
    items: noItems,
    target: noTarget,
  };

  // Hold out until the tram arrives (a timer). Done when it runs out with the hero still alive.
  K.survive = {
    init: function (s, o) { o.T = T().survive.T; },
    step: function (s, o) { if (o.t >= o.T) P.Objectives.resolve(s, o, true); },
    won: function () { return false; },
    status: function (s, o) {
      return { line: 'obj.survive.line', vars: { t: clock(o.T - o.t) }, frac: Math.min(1, o.t / o.T) };
    },
    items: noItems,
    target: noTarget,
  };

  // Supply crates spread along the route. Walk over each to take it.
  K.collect = {
    init: function (s, o) {
      var C = T().collect, rng = s.rng.level, lo = s.hero.y + C.minY, hi = s.geo.exitY - C.minY, i, y, p;
      o.items = [];
      for (i = 0; i < C.n; i++) {
        y = lo + (hi - lo) * (i + 0.5) / C.n;
        p = freeSpot(s, rng.range(-C.maxX, C.maxX), y);
        o.items.push({ x: p.x, y: p.y, got: false });
      }
      o.n = C.n;
    },
    step: function (s, o) {
      var r = T().collect.r, h = s.hero;
      o.items.forEach(function (it) {
        if (it.got || dist(it, h) > r) return;
        it.got = true; o.prog++;
        s.events.push({ type: 'objPickup', id: 'collect' });
      });
      if (o.prog >= o.n) P.Objectives.resolve(s, o, true);
    },
    won: function () { return false; },
    status: function (s, o) { return { line: 'obj.collect.line', vars: { n: o.prog, of: o.n }, frac: o.prog / o.n }; },
    items: function (s, o) {
      return o.items.map(function (it) { return { x: it.x, y: it.y, kind: 'crate', done: it.got, frac: it.got ? 1 : 0 }; });
    },
    target: function (s, o) {
      var h = s.hero, best = null, bd = Infinity;
      o.items.forEach(function (it) {
        var d = dist(it, h);
        if (!it.got && it.y > h.y - 1 && d < bd) { bd = d; best = it; }
      });
      return best ? [best.x, best.y] : null;
    },
  };

  // Escort a civilian to the gate. She follows the hero and takes damage from zombies that reach her.
  K.escort = {
    init: function (s, o) {
      var C = T().escort, h = s.hero, side = s.rng.level.chance(0.5) ? 1 : -1;
      o.civ = { x: clampX(s, h.x + side * C.start), y: h.y + 0.4, hp: C.hp, max: C.hp, alive: true };
    },
    step: function (s, o, dt) {
      var C = T().escort, c = o.civ, h = s.hero, d = dist(c, h), step;
      if (!c.alive) return;
      if (d > C.follow) {
        step = Math.min(d - C.follow, C.speed * dt);
        c.x += (h.x - c.x) / d * step; c.y += (h.y - c.y) / d * step;
      }
      c.hp -= enemiesNear(s, c.x, c.y, C.hitR) * dt;
      if (c.hp <= 0) { c.hp = 0; c.alive = false; P.Objectives.resolve(s, o, false); }
    },
    won: function (s, o) { return o.civ.alive; },
    status: function (s, o) {
      return { line: o.civ.alive ? 'obj.escort.line' : 'obj.escort.lost', vars: {}, frac: o.civ.hp / o.civ.max, hp: o.civ.hp / o.civ.max };
    },
    items: function (s, o) { return [{ x: o.civ.x, y: o.civ.y, kind: 'civ', done: !o.civ.alive, frac: o.civ.hp / o.civ.max }]; },
    target: noTarget,
  };

  // Signal booster: stand within reach while Mom's message uploads. Zombies near it wear it down.
  K.defend = {
    init: function (s, o) {
      var C = T().defend, p = freeSpot(s, 0, Math.min(s.geo.exitY - 6, s.hero.y + C.ahead));
      o.b = { x: p.x, y: p.y, hp: C.hp, max: C.hp, up: 0, uploading: false };
    },
    step: function (s, o, dt) {
      var C = T().defend, b = o.b;
      if (b.hp <= 0 || b.up >= 1) return;
      b.hp = Math.max(0, b.hp - enemiesNear(s, b.x, b.y, C.hitR) * C.dps * dt);
      b.uploading = dist(s.hero, b) <= C.r;
      if (b.uploading) b.up = Math.min(1, b.up + dt / C.uploadT);
      if (b.hp <= 0) P.Objectives.resolve(s, o, false);
      else if (b.up >= 1) P.Objectives.resolve(s, o, true);
    },
    won: function () { return false; },
    status: function (s, o) {
      var b = o.b;
      return b.up > 0
        ? { line: 'obj.defend.upload', vars: { n: Math.round(b.up * 100) }, frac: b.up, hp: b.hp / b.max }
        : { line: 'obj.defend.go', vars: {}, frac: b.up, hp: b.hp / b.max };
    },
    items: function (s, o) { return [{ x: o.b.x, y: o.b.y, kind: 'booster', done: o.b.up >= 1, frac: o.b.up }]; },
    target: function (s, o) {
      var b = o.b;
      return b.up < 1 && b.hp > 0 ? [b.x, b.y - T().defend.standOff] : null;
    },
  };

  // Hack the terminals ahead. The hack system (sim/hack.js) does the work; this counts the finished ones.
  K.hack = {
    init: function (s, o) {
      var C = T().hack, rng = s.rng.level, i, y, p;
      o.hacks = [];
      for (i = 0; i < C.n; i++) {
        y = Math.min(s.geo.exitY - 4, s.hero.y + C.ahead + i * C.gap);
        p = freeSpot(s, (i % 2 ? -1 : 1) * C.side + rng.range(-0.6, 0.6), y);
        o.hacks.push(P.Hack.place(s, C.kinds[i % C.kinds.length], p.x, p.y));
      }
      o.n = C.n;
    },
    step: function (s, o) {
      o.prog = o.hacks.filter(function (H) { return H.state === 'done'; }).length;
      if (o.prog >= o.n) P.Objectives.resolve(s, o, true);
    },
    won: function () { return false; },
    status: function (s, o) { return { line: 'obj.hack.line', vars: { n: o.prog, of: o.n }, frac: o.prog / o.n }; },
    items: function (s, o) {
      return o.hacks.map(function (H) { return { x: H.x, y: H.y, kind: 'terminal', done: H.state === 'done', frac: H.prog }; });
    },
    target: function (s, o) {
      var h = s.hero, best = null, bd = Infinity;
      o.hacks.forEach(function (H) {
        var d = dist(H, h);
        if (H.state !== 'done' && d < bd) { bd = d; best = H; }
      });
      return best ? [best.x, best.y] : null;
    },
  };

  // Kill the boss within the par time from the arena start. Judged on the kill.
  K.boss = {
    init: function (s, o) { o.par = T().boss.par; o.t0 = null; },
    step: function (s, o) {
      var g = s.gen, b = g && g.boss, el;
      if (o.t0 === null && g && g.arena) o.t0 = o.t;
      if (o.t0 === null) return;
      el = o.t - o.t0;
      if (b && b.dead) P.Objectives.resolve(s, o, el <= o.par);
      else if (el > o.par) P.Objectives.resolve(s, o, false);
    },
    won: function (s, o) { return !!(s.gen && s.gen.boss && s.gen.boss.dead) && o.t0 !== null && o.t - o.t0 <= o.par; },
    status: function (s, o) {
      var b = s.gen && s.gen.boss, el = o.t0 === null ? 0 : o.t - o.t0;
      return { line: 'obj.boss.line', vars: { t: clock(o.par - el) }, frac: b ? 1 - b.hp / b.maxHp : 0 };
    },
    items: noItems,
    target: noTarget,
  };

  return K;
})();
