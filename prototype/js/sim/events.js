// Level events core (v0.5, workstream B): lifecycle, tags, spawn helpers, helpers (rescued civilians), rewards.
// Event kinds live in events-kinds.js: P.EventKinds[kind] = { start(s, ev, o), step(s, ev, dt), onKill?(s, ev, e) }.
// Events are objects in s.ev.list. Emits eventStart / eventEnd {kind, id, ...}. Pure sim: no DOM, no Math.random.
P.Events = {};

P.Events.init = function (s) {
  s.ev = { list: [], nextId: 1, helpers: [] };
  s.hacks = [];
  s.tally.events = s.tally.events || 0;
};

P.Events.byId = function (s, id) {
  for (var i = 0; i < s.ev.list.length; i++) if (s.ev.list[i].id === id && !s.ev.list[i].done) return s.ev.list[i];
  return null;
};

// Start an event of `kind` with options o (kind-specific). Returns the event object (or null if unknown).
P.Events.start = function (s, kind, o) {
  var K = P.EventKinds && P.EventKinds[kind];
  if (!K) return null;
  var ev = { id: s.ev.nextId++, kind: kind, x: s.hero.x, y: s.hero.y, t: 0, T: 0, done: false, result: null, sub: (o && o.sub) || null };
  s.ev.list.push(ev);
  s.tally.events++;
  K.start(s, ev, o || {});
  if (!ev.done) s.events.push({ type: 'eventStart', kind: kind, id: ev.id, x: ev.x, y: ev.y, sub: ev.sub });
  return ev;
};

// End an event. result: 'done' | 'caught' | 'escaped' | 'freed' | 'failed' | 'held' | 'expired' | 'blast' | ...
P.Events.end = function (s, ev, result) {
  if (ev.done) return;
  ev.done = true; ev.result = result;
  s.events.push({ type: 'eventEnd', kind: ev.kind, id: ev.id, result: result, x: ev.x, y: ev.y });
};

P.Events.step = function (s, dt) {
  var L = s.ev.list, i;
  for (i = 0; i < L.length; i++) {
    var ev = L[i];
    if (ev.done) continue;
    ev.t += dt;
    P.EventKinds[ev.kind].step(s, ev, dt);
  }
  s.ev.list = s.ev.list.filter(function (e) { return !e.done; });
  stepHelpers(s, dt);
};

// Called from combat.js when a tagged enemy dies (loot runner, chest guard).
P.Events.onKill = function (s, e) {
  var ev = P.Events.byId(s, e.evId);
  if (!ev) return;
  var K = P.EventKinds[ev.kind];
  if (K && K.onKill) K.onKill(s, ev, e);
};

// Blackout (and any kind with ev.mul) raises the spawn rate while it is active.
P.Events.spawnMul = function (s) {
  var m = 1, L = s.ev ? s.ev.list : [];
  for (var i = 0; i < L.length; i++) if (!L[i].done && L[i].mul && L[i].mul > m) m = L[i].mul;
  return m;
};

P.Events.blackoutOn = function (s) { return P.Events.spawnMul(s) > 1; };

// ---------- geometry and spawn helpers (L1 and generated levels) ----------
P.Events.bounds = function (s) {
  if (s.geo) return { xMin: s.geo.xMin, xMax: s.geo.xMax, yMin: 1, yMax: s.geo.exitY - 2 };
  var c = P.CFG.level.corridor;
  return { xMin: c.xMin, xMax: c.xMax, yMin: 1, yMax: c.yMax - 1 };
};

P.Events.clampX = function (s, x) {
  var B = P.Events.bounds(s), m = P.CFG.ev.edge;
  return Math.min(Math.max(x, B.xMin + m), B.xMax - m);
};

P.Events.clampY = function (s, y) {
  var B = P.Events.bounds(s);
  return Math.min(Math.max(y, B.yMin), B.yMax);
};

P.Events.blocked = function (s, x, y) {
  if (!s.geo) return false;
  var bl = s.geo.blocks;
  for (var i = 0; i < bl.length; i++) {
    var rc = bl[i].rc, m = P.CFG.ev.edge;
    if (x > rc.xMin - m && x < rc.xMax + m && y > rc.yMin - m && y < rc.yMax + m) return true;
  }
  return false;
};

// A random point at distance [rMin, rMax] from (cx, cy). Off the hero's view unless visible is true.
P.Events.farSpot = function (s, cx, cy, rMin, rMax, visible) {
  var rng = s.rng.spawn, h = s.hero, V = P.CFG.view, m = V.offscreenMargin;
  var halfH = P.viewHalfH(V.widthM) + m, halfW = V.widthM / 2 + m;
  for (var k = 0; k < 8; k++) {
    var a = rng.range(0, Math.PI * 2), r = rng.range(rMin, rMax);
    var x = P.Events.clampX(s, cx + Math.cos(a) * r), y = P.Events.clampY(s, cy + Math.sin(a) * r);
    if (P.Events.blocked(s, x, y)) continue;
    if (!visible && Math.abs(x - h.x) < halfW && Math.abs(y - h.y) < halfH) continue;
    return { x: x, y: y };
  }
  return null;
};

P.Events.skin = function (s) {
  var sk = s.gen && s.gen.skins;
  return sk && sk.length ? sk[s.rng.spawn.int(0, sk.length - 1)] : null;
};

// Spawn an enemy tagged with the event (so onKill / countTagged can find it).
P.Events.spawn = function (s, ev, type, x, y, o) {
  var opts = Object.assign({ ev: ev ? ev.id : 0, skin: P.Events.skin(s) }, o || {});
  return P.Combat.spawnEnemy(s, type, x, y, opts);
};

P.Events.countTagged = function (s, id) {
  var n = 0;
  for (var i = 0; i < s.enemies.length; i++) if (s.enemies[i].evId === id && !s.enemies[i].dead) n++;
  return n;
};

// Live enemies within r of (x, y) (excludes dormant and dead).
P.Events.near = function (s, x, y, r) {
  var out = [];
  for (var i = 0; i < s.enemies.length; i++) {
    var e = s.enemies[i];
    if (e.dead || e.state === 'dormant') continue;
    if (Math.hypot(e.x - x, e.y - y) <= r) out.push(e);
  }
  return out;
};

// ---------- rewards ----------
P.Events.drop = function (s, kind, x, y, value, pop) {
  s.drops.push({ kind: kind, value: value, x: x, y: y, mag: false, pop: pop === undefined ? P.CFG.ev.dropPop : pop });
};

// Jeton burst around (x, y): n coins of value v (coinPct from attributes).
P.Events.coins = function (s, x, y, n, v) {
  var K = P.CFG.ev.coin, rng = s.rng.loot, val = Math.max(1, Math.round(v * (1 + s.fx.coinPct)));
  for (var i = 0; i < n; i++) {
    var a = rng.range(0, Math.PI * 2), r = rng.range(K.rMin, K.rMax);
    P.Events.drop(s, "jeton", x + Math.cos(a) * r, y + Math.sin(a) * r, val, K.pop + K.popStep * i);
  }
  s.events.push({ type: 'coinBurst', x: x, y: y, n: n });
};

// ---------- helpers: a rescued civilian throws things at zombies for a while (civHelpPct high enough) ----------
P.Events.addHelper = function (s, x, y) {
  var R = P.CFG.ev.rescue;
  s.ev.helpers.push({ x: x, y: y, t: R.helperT, cd: R.helperEvery });
  s.events.push({ type: 'helperStart', x: x, y: y, t: R.helperT });
};

function stepHelpers(s, dt) {
  var R = P.CFG.ev.rescue, H = s.ev.helpers;
  for (var i = H.length - 1; i >= 0; i--) {
    var hp = H[i];
    hp.t -= dt; hp.cd -= dt;
    if (hp.t <= 0) { H.splice(i, 1); continue; }
    if (hp.cd > 0) continue;
    hp.cd = R.helperEvery;
    throwAt(s, hp, R);
  }
}

function throwAt(s, hp, R) {
  var best = null, bd = R.helperRange;
  for (var i = 0; i < s.enemies.length; i++) {
    var e = s.enemies[i];
    if (e.dead || e.state !== 'active') continue;
    var d = Math.hypot(e.x - hp.x, e.y - hp.y);
    if (d < bd) { bd = d; best = e; }
  }
  if (!best) return;
  var dx = best.x - hp.x, dy = best.y - hp.y, dd = Math.hypot(dx, dy) || 1;
  s.events.push({ type: 'helperThrow', x: hp.x, y: hp.y, tx: best.x, ty: best.y });
  P.Combat.damageEnemy(s, best, R.helperDmg, dx / dd, dy / dd, R.helperKb, false, "helper");
}
