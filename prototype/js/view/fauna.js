// Ambient fauna (R1 birds-cats, view only): stray cats and ambient birds (seagulls by the sea, pigeons inland) in every hood,
// and the thief's look per hood (P.Fauna.lookFor; read by art-enemies6.js and story/barks.js). Fixed spots come from a view RNG
// seeded by the level (never the sim RNG). P.Fauna.update(dt, s) runs once a frame (main.js) and only reads the sim. Each animal
// queues itself with R.depth in P.EnvFx.drawProps (wrapped below), so it sorts with the actors. Art: view/fauna-art.js.
// Numbers: config-fauna.js (C.fauna, C.birdLook). Nothing here writes sim state or draws a sim random number.
(function () {
  var CF = P.CFG.fauna, LOOK = P.CFG.birdLook, F = P.Fauna = {};
  var st = { run: null, cats: [], birds: [], hood: null, r: null, sawCat: false };
  var TAU = Math.PI * 2, EDGE = 0.4;

  F.lookFor = function (hoodId) { return LOOK.pigeon.indexOf(hoodId) >= 0 ? 'pigeon' : 'seagull'; };
  F.thiefLook = function () { return F.lookFor(st.hood); };
  F.cats = function () { return st.cats; };
  F.birds = function () { return st.birds; };

  // Small seeded generator (mulberry32) for the view only. rr: float in [a, b); ri: int in [a, b].
  function mulberry(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function rr(r, a, b) { return a + (b - a) * r(); }
  function ri(r, a, b) { return Math.floor(rr(r, a, b + 1)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
  function corridorX(x) { var G = P.CFG.level.corridor; return clamp(x, G.xMin + EDGE, G.xMax - EDGE); }
  // Cats and birds keep to their side of the central lane: side +1 is |x| >= sideMin on the right, -1 on the left.
  function sideX(x, side) {
    var G = P.CFG.level.corridor;
    return side > 0 ? clamp(x, CF.sideMin, G.xMax - EDGE) : clamp(x, G.xMin + EDGE, -CF.sideMin);
  }

  // ---------- placement ----------
  function blocked(geo, x, y) {
    var bl = geo.blocks || [], i, b;
    for (i = 0; i < bl.length; i++) {
      b = bl[i];
      if (Math.abs(b.x - x) < b.w / 2 + 0.5 && Math.abs(b.y - y) < b.h / 2 + 0.5) return true;
    }
    return false;
  }
  // A spot outside the central lane, off the street blocks, between the start and the hold (or boss approach).
  function freeSpot(s, r) {
    var G = P.CFG.level.corridor, geo = s.geo || {}, y0 = CF.spawnFromY;
    var y1 = Math.max(y0 + 1, (geo.holdY || G.yMax) - CF.spawnToHold), tries, x, y;
    for (tries = 0; tries < 12; tries++) {
      x = rr(r, G.xMin + 0.6, G.xMax - 0.6);
      y = rr(r, y0, y1);
      if (Math.abs(x) < CF.sideMin || blocked(geo, x, y)) continue;
      return { x: x, y: y };
    }
    return null;
  }
  function newCat(p, r) {
    var C = CF.cats;
    return { home: p, x: p.x, y: p.y, st: 'idle', t: rr(r, C.idleT[0], C.idleT[1]), tx: p.x, ty: p.y, face: 1,
      coat: C.coats[ri(r, 0, C.coats.length - 1)], phase: r() * TAU, hiss: 0, speed: 0 };
  }
  function newBird(p, r, look) {
    return { home: p, x: p.x, y: p.y, z: 0, st: 'peck', t: rr(r, CF.birds.pecks[0], CF.birds.pecks[1]), fx: p.x, fy: p.y,
      tx: p.x, ty: p.y, face: 1, look: look, phase: r() * TAU };
  }
  function plan(s) {
    var info = s.levelInfo || {}, hid = info.hood ? info.hood.id : null, look = F.lookFor(hid), r, n, i, p;
    r = mulberry((Number(s.seed) || 1) * 7919 + (info.index || 0) * 104729 + 17);
    st.run = s; st.cats = []; st.birds = []; st.sawCat = false; st.hood = hid; st.r = r;
    n = ri(r, CF.cats.perLevel[0], CF.cats.perLevel[1]);
    for (i = 0; i < n; i++) { p = freeSpot(s, r); if (p) st.cats.push(newCat(p, r)); }
    n = ri(r, CF.birds.perLevel[0], CF.birds.perLevel[1]);
    for (i = 0; i < n; i++) { p = freeSpot(s, r); if (p) st.birds.push(newBird(p, r, look)); }
  }

  // ---------- the sim, read only ----------
  // The nearest active enemy within R m of (x, y), or null. pred (optional) filters the enemies.
  function nearestEnemy(s, x, y, R, pred) {
    var list = s.enemies || [], best = null, bd = R, i, e, d;
    for (i = 0; i < list.length; i++) {
      e = list[i];
      if (e.dead || e.state !== 'active' || (pred && !pred(e))) continue;
      d = dist(e.x, e.y, x, y);
      if (d <= bd) { bd = d; best = e; }
    }
    return best;
  }
  function bigThreat(e) { return !!(e.elite || e.boss); }
  // Unit vector from (fx, fy) to (x, y); a random direction when they coincide (the RNG is the view's).
  function unit(dx, dy) {
    var d = Math.hypot(dx, dy);
    if (d < 1e-6) return { x: Math.cos(st.r() * TAU), y: Math.sin(st.r() * TAU) };
    return { x: dx / d, y: dy / d };
  }
  // Moves o toward (tx, ty) at speed m/s; true when it arrives this step. Sets the facing.
  function stepTo(o, tx, ty, speed, dt) {
    var dx = tx - o.x, dy = ty - o.y, d = Math.hypot(dx, dy), k = Math.min(1, speed * dt / Math.max(d, 1e-6));
    o.x += dx * k; o.y += dy * k;
    if (Math.abs(dx) > 1e-6) o.face = dx < 0 ? -1 : 1;
    return d <= speed * dt;
  }
  function idleTime(range) { return rr(st.r, range[0], range[1]); }

  // Cats: hiss at a big threat within hissR (stands, no walk), trot away from the hero within shyR, walk about its spot, sit.
  function stepCat(c, dt, s, calm) {
    var h = s.hero, C = CF.cats, big = nearestEnemy(s, c.x, c.y, C.hissR, bigThreat), d = dist(c.x, c.y, h.x, h.y);
    c.hiss = big ? C.hissHold : Math.max(0, c.hiss - dt);
    if (c.hiss > 0) { c.st = 'stand'; c.speed = 0; c.face = big && big.x < c.x ? -1 : 1; return; }
    if (c.st === 'stand') { c.st = 'idle'; c.t = 0.5; }
    if (c.st === 'trot') return trot(c, dt);
    if (!calm && d < C.shyR) return startTrot(c, unit(c.x - h.x, c.y - h.y));
    if (c.st === 'walk') return walk(c, dt);
    c.t -= dt;
    if (c.t > 0) return;
    c.t = idleTime(C.idleT) * (calm ? CF.calmIdleMul : 1);
    if (!calm && st.r() < 0.5) pickWalk(c);
  }
  function startTrot(c, u) {
    var C = CF.cats, len = C.trotSpeed * C.trotT * 0.6;
    c.st = 'trot'; c.t = C.trotT;
    c.tx = sideX(c.x + u.x * len, c.x >= 0 ? 1 : -1); c.ty = c.y + u.y * len;
  }
  function trot(c, dt) {
    var arrived;
    c.t -= dt;
    arrived = stepTo(c, c.tx, c.ty, CF.cats.trotSpeed, dt);
    c.speed = CF.cats.trotSpeed;
    if (arrived || c.t <= 0) { c.st = 'idle'; c.t = idleTime(CF.cats.idleT); c.speed = 0; }
  }
  // Walks back to the spot when it has drifted past homeR, else to a point near the spot.
  function pickWalk(c) {
    var C = CF.cats, a = st.r() * TAU, rad = C.homeR * st.r();
    c.st = 'walk';
    if (dist(c.x, c.y, c.home.x, c.home.y) > C.homeR) { c.tx = c.home.x; c.ty = c.home.y; return; }
    c.tx = sideX(c.home.x + Math.cos(a) * rad, c.home.x >= 0 ? 1 : -1); c.ty = c.home.y + Math.sin(a) * rad;
  }
  function walk(c, dt) {
    var arrived = stepTo(c, c.tx, c.ty, CF.cats.walkSpeed, dt);
    c.speed = CF.cats.walkSpeed;
    if (arrived) { c.st = 'idle'; c.t = idleTime(CF.cats.idleT); c.speed = 0; }
  }

  // Birds: peck on the ground; take off when the hero or an enemy comes within flushR, fly away from it, land nearby.
  function stepBird(b, dt, s, calm) {
    var B = CF.birds, h = s.hero, thr = nearestEnemy(s, b.x, b.y, B.flushR), near = dist(b.x, b.y, h.x, h.y) <= B.flushR;
    if (b.st === 'fly') return flight(b, dt);
    if (!calm && (near || thr)) {
      var from = near ? h : thr;
      return takeOff(b, unit(b.x - from.x, b.y - from.y));
    }
    b.t -= dt;
    if (b.t <= 0) b.t = idleTime(B.pecks);
  }
  function takeOff(b, u) {
    var B = CF.birds, len = B.flySpeed * B.flyT * 0.7;
    b.st = 'fly'; b.t = B.flyT; b.fx = b.x; b.fy = b.y;
    b.tx = corridorX(b.x + u.x * len);
    b.ty = b.y + u.y * len;
    b.face = u.x < 0 ? -1 : 1;
  }
  // Height follows a half sine (up and down); the bird lands where it ends up.
  function flight(b, dt) {
    var B = CF.birds, prog;
    b.t -= dt;
    prog = clamp(1 - b.t / B.flyT, 0, 1);
    b.x = b.fx + (b.tx - b.fx) * prog; b.y = b.fy + (b.ty - b.fy) * prog;
    b.z = B.flyH * Math.sin(Math.PI * prog);
    if (b.t > 0) return;
    b.st = 'peck'; b.z = 0; b.t = idleTime(B.pecks);
  }

  F.update = function (dt, s) {
    var calm, i;
    if (!s || !s.hero || !s.levelInfo) return;
    if (st.run !== s) plan(s);
    calm = !!(P.Settings && P.Settings.reduceMotion);
    dt = clamp(dt || 0, 0, 0.1);
    st.hood = s.levelInfo.hood ? s.levelInfo.hood.id : st.hood;
    for (i = 0; i < st.cats.length; i++) stepCat(st.cats[i], dt, s, calm);
    for (i = 0; i < st.birds.length; i++) stepBird(st.birds[i], dt, s, calm);
  };

  // ---------- draw (queued with R.depth, from the props pass) ----------
  function onScreen(R, x, y) {
    var X = R.X(x), Y = R.Y(y);
    return X > -60 && X < R.W + 60 && Y > -80 && Y < R.H + 80;
  }
  F.props = function (R, s) {
    var FA = P.FaunaArt, calm = !!(P.Settings && P.Settings.reduceMotion), i, c, b, seen = false;
    if (!FA || !st.run || st.run !== s) return;
    for (i = 0; i < st.cats.length; i++) {
      c = st.cats[i];
      if (!onScreen(R, c.x, c.y)) continue;
      seen = true;
      R.depth(c.y, drawFn(FA.cat, R, c, CF.cats.size, calm), false);
    }
    for (i = 0; i < st.birds.length; i++) {
      b = st.birds[i];
      if (onScreen(R, b.x, b.y)) R.depth(b.y, drawFn(FA.bird, R, b, CF.birds.size, calm), false);
    }
    // The first cat in view this run gets its line (barks: the fk pool, once per run, like the sightings).
    if (seen && !st.sawCat) { st.sawCat = true; if (P.Barks && P.Barks.fauna) P.Barks.fauna('kedi'); }
  };
  function drawFn(fn, R, o, size, calm) { return function () { fn(R, o, size, calm); }; }

  // Wrap the props pass (render.js calls hook(P.EnvFx, 'drawProps') before the depth flush). Guarded: no EnvFx, no fauna.
  if (P.EnvFx && P.EnvFx.drawProps) {
    var prevProps = P.EnvFx.drawProps;
    P.EnvFx.drawProps = function (R, s) { if (prevProps) prevProps(R, s); F.props(R, s); };
  }
})();
