// Objective kinds (lane P; v0.8 lane L variants). Each kind has: init(s, o), step(s, o, dt), won(s, o) (checked at the win),
// status(s, o) -> { line, vars, frac, hp }, items(s, o) -> HUD markers, target(s, o) -> bot waypoint or null.
// o.kind is the kind of the id ('survive') and o.v its variant ('tram' for 'survive.tram'; undefined for a bare kind).
// Numbers come from config-objectives.js: types.<kind>.<key>, overridden by types.<kind>.v.<variant>.<key> when set.
// Status line keys are 'obj.<id>.line' (id = the full dotted id), so each variant has its own text.
// Kinds never draw; objectives-hud.js (view) does.
P.ObjKinds = (function () {
  var K = {};
  var T = function () { return P.CFG.objectives.types; };
  var dist = function (a, b) { return Math.hypot(a.x - b.x, a.y - b.y); };
  var clock = function (t) { return P.Objectives.clock(t); };
  var noItems = function () { return []; };
  var noTarget = function () { return null; };
  var lineKey = function (o) { return 'obj.' + o.id + '.line'; };

  // The value of `key` for this objective: its variant's override, else the kind's base value.
  function vnum(o, kind, key) {
    var base = T()[kind], v = base.v && o.v && base.v[o.v];
    return v && v[key] !== undefined ? v[key] : base[key];
  }

  // Enemies that can hit a point (active, alive).
  function enemiesNear(s, x, y, r) {
    var n = 0;
    s.enemies.forEach(function (e) { if (!e.dead && e.state === 'active' && Math.hypot(e.x - x, e.y - y) <= r) n++; });
    return n;
  }

  // A spot off the blocks (side AABBs and layout walls): the first free point of a small grid around (x, y), else the
  // spot as given. The grid offsets come from config-objectives.js (spot).
  function freeSpot(s, x, y) {
    var G = P.CFG.objectives.spot, i, j, px, py;
    for (i = 0; i < G.dy.length; i++) {
      for (j = 0; j < G.dx.length; j++) {
        px = clampX(s, x + G.dx[j]); py = y + G.dy[i];
        if (!P.Events.blocked(s, px, py)) return { x: px, y: py };
      }
    }
    return { x: clampX(s, x), y: y };
  }
  function clampX(s, x) { return Math.max(s.geo.xMin + 1, Math.min(s.geo.xMax - 1, x)); }

  // Nearest layout chokepoint ahead of the hero (s.layout.chokes from layouts.js), as a bot waypoint, or null. A chicane
  // wall has its gap on the far side, so a route that heads straight for the centre line stalls against the wall.
  function nextChoke(s) {
    var h = s.hero, best = null, bd = Infinity, maxW = P.CFG.layouts.maxChoke;
    ((s.layout && s.layout.chokes) || []).forEach(function (c) {
      var d = c.y - h.y;
      if (c.w <= maxW && d > 0.5 && d < bd) { bd = d; best = c; }
    });
    return best ? [best.x, best.y] : null;
  }

  // Reach the gate within the par time (bonus for speed). Judged at the win. Also the home gate (reach.home).
  K.reach = {
    init: function (s, o) { o.par = T().reach.par[Math.min(o.stage, T().reach.par.length) - 1]; },
    step: function () {},
    won: function (s, o) { return o.t <= o.par; },
    status: function (s, o) {
      return { line: lineKey(o), vars: { t: clock(o.t), par: clock(o.par) }, frac: Math.min(1, s.hero.y / s.geo.exitY) };
    },
    items: noItems,
    target: noTarget,
  };

  // Hold out until the vehicle arrives (a timer; the vehicle sets T per variant). Done when it runs out with the hero alive.
  K.survive = {
    init: function (s, o) { o.T = vnum(o, 'survive', 'T'); },
    step: function (s, o) { if (o.t >= o.T) P.Objectives.resolve(s, o, true); },
    won: function () { return false; },
    status: function (s, o) {
      return { line: lineKey(o), vars: { t: clock(o.T - o.t) }, frac: Math.min(1, o.t / o.T) };
    },
    items: noItems,
    target: noTarget,
  };

  // Supply items spread along the route (crate, cut, lamp, key, charcoal by variant). Walk over each to take it.
  K.collect = {
    init: function (s, o) {
      // Items sit before the hold (holdY), so the route can still reach them: the hold and the gate end the chase.
      var C = T().collect, rng = s.rng.level, n = vnum(o, 'collect', 'n'), lo = s.hero.y + C.minY, hi = (s.geo.holdY || s.geo.exitY) - C.minY, i, y, p;
      o.items = [];
      for (i = 0; i < n; i++) {
        y = lo + (hi - lo) * (i + 0.5) / n;
        p = freeSpot(s, rng.range(-C.maxX, C.maxX), y);
        o.items.push({ x: p.x, y: p.y, got: false });
      }
      o.n = n;
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
    status: function (s, o) { return { line: lineKey(o), vars: { n: o.prog, of: o.n }, frac: o.prog / o.n }; },
    items: function (s, o) {
      return o.items.map(function (it) { return { x: it.x, y: it.y, kind: 'crate', label: o.v || 'crate', done: it.got, frac: it.got ? 1 : 0 }; });
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
      return { line: o.civ.alive ? lineKey(o) : 'obj.' + o.id + '.lost', vars: {}, frac: o.civ.hp / o.civ.max, hp: o.civ.hp / o.civ.max };
    },
    items: function (s, o) { return [{ x: o.civ.x, y: o.civ.y, kind: 'civ', done: !o.civ.alive, frac: o.civ.hp / o.civ.max }]; },
    target: function (s) { return nextChoke(s); },   // bot: through the next gap, so she can follow
  };

  // Signal booster (or the cart or bell by variant): stand within reach while Mom's message uploads. Zombies near it wear
  // it down. Hp and upload time come from the variant.
  K.defend = {
    init: function (s, o) {
      var C = T().defend, hp = vnum(o, 'defend', 'hp'), p = freeSpot(s, 0, Math.min(s.geo.exitY - 6, s.hero.y + C.ahead));
      o.b = { x: p.x, y: p.y, hp: hp, max: hp, up: 0, uploading: false };
    },
    step: function (s, o, dt) {
      var C = T().defend, b = o.b;
      if (b.hp <= 0 || b.up >= 1) return;
      b.hp = Math.max(0, b.hp - enemiesNear(s, b.x, b.y, C.hitR) * C.dps * dt);
      b.uploading = dist(s.hero, b) <= C.r;
      if (b.uploading) b.up = Math.min(1, b.up + dt / vnum(o, 'defend', 'uploadT'));
      if (b.hp <= 0) P.Objectives.resolve(s, o, false);
      else if (b.up >= 1) P.Objectives.resolve(s, o, true);
    },
    won: function () { return false; },
    status: function (s, o) {
      var b = o.b;
      return b.up > 0
        ? { line: 'obj.' + o.id + '.upload', vars: { n: Math.round(b.up * 100) }, frac: b.up, hp: b.hp / b.max }
        : { line: 'obj.' + o.id + '.go', vars: {}, frac: b.up, hp: b.hp / b.max };
    },
    items: function (s, o) { return [{ x: o.b.x, y: o.b.y, kind: 'booster', label: o.v || 'booster', done: o.b.up >= 1, frac: o.b.up }]; },
    target: function (s, o) {
      var b = o.b;
      return b.up < 1 && b.hp > 0 ? [b.x, b.y - T().defend.standOff] : null;
    },
  };

  // Hack the terminals ahead (street, signal or gate by variant). The hack system (sim/hack.js) does the work; this counts
  // the finished ones. An idle terminal the hero has walked more than `behind` m past is moved ahead again, so no terminal
  // is left behind the route.
  K.hack = {
    init: function (s, o) {
      var C = T().hack, kinds = vnum(o, 'hack', 'kinds'), rng = s.rng.level, i, y, p;
      o.hacks = [];
      for (i = 0; i < C.n; i++) {
        y = Math.min(s.geo.exitY - 4, s.hero.y + C.ahead + i * C.gap);
        p = freeSpot(s, (i % 2 ? -1 : 1) * C.side + rng.range(-0.6, 0.6), y);
        o.hacks.push(P.Hack.place(s, kinds[i % kinds.length], p.x, p.y));
      }
      o.n = C.n;
    },
    step: function (s, o) {
      var C = T().hack, h = s.hero, lim = s.geo.exitY - 4, moved = 0;
      o.hacks.forEach(function (H) {
        if (H.state !== 'idle' || h.y - H.y <= C.behind || h.y >= lim) return;
        var p = freeSpot(s, H.x, Math.min(lim, h.y + C.ahead + moved * C.gap));
        H.x = p.x; H.y = p.y; moved++;
      });
      o.prog = o.hacks.filter(function (H) { return H.state === 'done'; }).length;
      if (o.prog >= o.n) P.Objectives.resolve(s, o, true);
    },
    won: function () { return false; },
    status: function (s, o) { return { line: lineKey(o), vars: { n: o.prog, of: o.n }, frac: o.prog / o.n }; },
    items: function (s, o) {
      return o.hacks.map(function (H) { return { x: H.x, y: H.y, kind: 'terminal', label: o.v || 'terminal', done: H.state === 'done', frac: H.prog }; });
    },
    // Nearest unfinished terminal ahead of the hero (or level with him); a terminal just behind is the fallback.
    target: function (s, o) {
      var h = s.hero, ahead = null, ad = Infinity, back = null, bd = Infinity;
      o.hacks.forEach(function (H) {
        var d = dist(H, h);
        if (H.state === 'done') return;
        if (H.y >= h.y - 1) { if (d < ad) { ad = d; ahead = H; } }
        else if (d < bd) { bd = d; back = H; }
      });
      var best = ahead || back;
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
      return { line: lineKey(o), vars: { t: clock(o.par - el) }, frac: b ? 1 - b.hp / b.maxHp : 0 };
    },
    items: noItems,
    target: noTarget,
  };

  return K;
})();
