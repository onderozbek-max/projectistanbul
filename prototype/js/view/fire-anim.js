// Weapon fire animation core (view only, workstream B). A 'wfire' event starts that weapon's held pose on Arda (the
// most recent shot is the dominant pose) and its launch effect. Contract (sim, workstream A):
//   { type: 'wfire', w: weaponId, x, y, ang (world radians toward the target), lv 1..5, n projectile count }
//   s.hero.revving (seconds left, > 0) and s.hero.revAng (world radians) while the chainsaw revs.
// Data: fire-anim-held*.js (poses: T, held, rev), fire-anim-fx*.js (fire, tick, revTick, flight, track, draw).
// Drawing helpers: fire-anim-prim.js. Geometry is world metres (1 m = F.m px); pools are fixed size.
// Hooks: render.js calls heroOpts before the hero sprite, drawHeld after it, drawFx after projectiles;
// main.js calls onEvent from handleEvents and update in the frame loop.
P.FireAnim = (function () {
  var MAX = 220, MAX_FLY = 12, SHX_MAIN = 0.2, SHX_OFF = -0.128, SHY = 0.397;
  // Shoulders from Arda's centre (sprites.js: 0.165 and -0.105 figure units at shoulder height 0.53 units above the feet).
  var ALIAS = { tray: 'sawblade', simittray: 'manhole', cezve: 'torch', semsiye: 'cardoor', tavla: 'slingshot',
    kestane: 'chainsaw', cleaver: 'knife', nailstorm: 'nailgun', cluster: 'canister', cyclone: 'chain', finale: 'fireworks' };
  var cache = {};

  function defOf(id) {
    if (cache[id] !== undefined) return cache[id];
    var H = P.FireAnimHeld && P.FireAnimHeld[id], E = P.FireAnimFx && P.FireAnimFx[id];
    return (cache[id] = H ? { T: H.T, held: H.held, rev: H.rev, over: H.over, fire: E && E.fire, tick: E && E.tick, revTick: E && E.revTick, draw: E && E.draw } : null);
  }

  function makeGeom() {
    var G = { hx: 0, hy: 0, ang: 0, ca: 1, sa: 0, side: 1, mx: 0, my: 0, ox: 0, oy: 0, cx: 0, cy: 0, ext: 0, dx: 0, P: [] };
    for (var i = 0; i < 24; i++) G.P.push({ x: 0, y: 0 });
    // Point (fwd, up, lat) metres from a base: 0 = main shoulder, 1 = off shoulder, 2 = midline. Writes slot i.
    G.pt = function (i, base, fwd, up, lat) {
      var bx = base === 0 ? G.mx : base === 1 ? G.ox : G.cx, by = base === 0 ? G.my : base === 1 ? G.oy : G.cy, o = G.P[i];
      o.x = bx + G.ca * (fwd + G.ext) - G.sa * lat + G.dx; o.y = by + G.sa * (fwd + G.ext) + G.ca * lat + up; return o;
    };
    return G;
  }

  // The main hand is the shoulder on the aim side, so the shot arm always reaches outward.
  // Shoulder side with hysteresis: it flips only once the aim is clearly on the other side, so a target almost straight above or
  // below no longer swaps the shot arm (and teleports the weapon) from one shot to the next.
  // Aiming away from the camera (up the screen) the weapon would be painted across the face, so the whole grip slides out to the
  // aim side by `dx` and reaches a little further (`ext`); `away` ramps smoothly with the aim angle, so nothing pops.
  function setGeom(F, h, ang) {
    var G = F.G, cs = Math.cos(ang), sn = Math.sin(ang), away = Math.max(0, Math.min(1, (sn - 0.3) / 0.5)), side;
    // Aiming away from the camera the shot arm is the sprite's back arm (the side opposite its facing), the same one the resting
    // arm uses between shots (weapons-fx.js awayShift), so the weapon stays on one side of the head from shot to rest and back.
    if (F.awayMode ? away < 0.25 : away > 0.5) F.awayMode = !F.awayMode;
    if (F.awayMode) F.side = h.fx >= 0 ? -1 : 1;
    else if (cs > 0.22) F.side = 1; else if (cs < -0.22) F.side = -1; else if (!F.side) F.side = cs >= 0 ? 1 : -1;
    side = F.side;
    G.hx = h.x; G.hy = h.y; G.ang = ang; G.ca = cs; G.sa = sn; G.side = side;
    G.mx = h.x + side * SHX_MAIN; G.my = h.y + SHY; G.ox = h.x + side * SHX_OFF; G.oy = G.my;
    G.cx = h.x; G.cy = G.my;
    G.ext = 0.12 * away; G.dx = side * 0.26 * away;
    return G;
  }

  function lvOf(v) { v = v | 0; return v < 1 ? 1 : v > 5 ? 5 : v; }

  function create() {
    var F = { sim: null, R: null, c: null, m: 40, q: 1, rm: false, cur: 0, fcur: 0, G: makeGeom(), pool: [], flights: [],
      pose: { id: '', def: null, t: 0, T: 0, ang: 0, lv: 1, n: 1, on: false, f: {} }, kk: { t: 0, p: 0, T: 0, lv: 1, n: 1, ang: 0, id: '', f: null, rev: false }, rf: {} };
    var i;
    for (i = 0; i < MAX; i++) F.pool.push({ alive: false, k: '', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, t: 0, T: 1, r: 0, a: 0, va: 0, w: 0,
      op: 1, grav: 0, bounce: false, jit: false, add: false, col: '255,255,255', n: 0, pts: new Float32Array(16) });
    for (i = 0; i < MAX_FLY; i++) F.flights.push({ on: false, k: '', x: 0, y: 0, ox: 0, oy: 0, ang: 0, sp: 0, t: 0, T: 1, a: 0, w: 0, n: 0, f: null });

    F.reset = function (s) {
      var j; F.sim = s; F.pose.on = false;
      for (j = 0; j < MAX; j++) F.pool[j].alive = false;
      for (j = 0; j < MAX_FLY; j++) F.flights[j].on = false;
    };
    // Particle from the ring pool (oldest is recycled when full). Callers set motion fields after spawning.
    F.spawn = function (k, x, y, T, r, col) {
      var p = F.pool[F.cur];
      F.cur = (F.cur + 1) % MAX;
      p.alive = true; p.k = k; p.x = x; p.y = y; p.z = 0; p.vx = 0; p.vy = 0; p.vz = 0; p.t = T; p.T = T; p.r = r; p.a = 0; p.va = 0;
      p.op = 1; p.grav = 0; p.bounce = false; p.jit = false; p.w = 0;
      p.add = k === 'spark' || k === 'glint' || k === 'flame' || k === 'bolt';
      p.col = col || '255,255,255';
      return p;
    };
    // Moving projectile for effects that outlive the pose (rocket, marbles, discus). Trails come from fx.flight.
    F.launch = function (k, x, y, ang, sp, T) {
      var f = F.flights[F.fcur];
      F.fcur = (F.fcur + 1) % MAX_FLY;
      f.on = true; f.k = k; f.x = x; f.y = y; f.ox = x; f.oy = y; f.ang = ang; f.sp = sp; f.t = 0; f.T = T; f.a = 0; f.w = 0; f.n = 0; f.f = null;
      return f;
    };
    // Particle count and chance scaled by reduced motion (half density).
    F.count = function (n) { return Math.round(n * F.q); };
    F.chance = function (hz, dt) { return Math.random() < hz * dt * F.q; };

    function kOf(p) {
      var k = F.kk;
      k.t = p.t; k.T = p.T; k.p = p.T > 0 ? Math.min(1, p.t / p.T) : 1; k.lv = p.lv; k.n = p.n; k.ang = p.ang; k.id = p.id; k.f = p.f; k.rev = false;
      return k;
    }
    function revK(h) {
      var k = F.kk;
      k.t = performance.now() / 1000; k.T = 1e9; k.p = 0; k.lv = 5; k.n = 1; k.ang = +h.revAng || 0; k.id = 'chainsaw'; k.f = F.rf; k.rev = true;
      return k;
    }

    // wfire: the owned variant's own pose when it has one (evolutions), else the base family (ALIAS for old names).
    // skillUsed starts the skill's held pose ('skill_<id>'). Every other event goes to FireAnimFx.event (W3 evolution visuals).
    F.onEvent = function (ev, s) {
      if (!ev) return;
      if (s && s !== F.sim) F.reset(s);
      if (!F.sim) return;
      if (ev.type === 'skillUsed') ev = { type: 'wfire', w: 'skill_' + ev.id, ang: F.lastAng || 0, lv: 1, n: 1 };
      else if (ev.type !== 'wfire') { if (P.FireAnimFx && P.FireAnimFx.event) P.FireAnimFx.event(F, ev); return; }
      else F.lastAng = +ev.ang || 0;
      var id = ev.variant && defOf(ev.variant) ? ev.variant : ALIAS[ev.w] || ev.w || '', def = defOf(id), p = F.pose;
      if (!def) return;
      p.id = id; p.def = def; p.ang = +ev.ang || 0; p.lv = lvOf(ev.lv); p.n = Math.max(1, ev.n | 0);
      p.T = typeof def.T === 'function' ? def.T(p.lv, p.n) : def.T;
      p.t = 0; p.on = true; p.f = {};
      if (def.fire) def.fire(F, setGeom(F, F.sim.hero, p.ang), kOf(p));
    };

    F.update = function (dt, s) {
      s = s || F.sim;
      if (!s) return;
      if (s !== F.sim) F.reset(s);
      F.rm = !!(P.Settings && P.Settings.reduceMotion); F.q = F.rm ? 0.5 : 1;
      var p = F.pose, h = s.hero;
      if (p.on) {
        p.t += dt;
        if (p.t >= p.T) p.on = false;
        else if (p.def.tick) p.def.tick(F, setGeom(F, h, p.ang), kOf(p), dt);
      }
      if (h.revving > 0) {
        var cs = defOf('chainsaw');
        if (cs && cs.revTick) cs.revTick(F, setGeom(F, h, +h.revAng || 0), dt);
      }
      if (P.FireAnimFx && P.FireAnimFx.track) P.FireAnimFx.track(F, s, dt);
      age(F, dt);
    };

    function age(F2, dt) {
      var i2, p2, f2;
      for (i2 = 0; i2 < MAX; i2++) {
        p2 = F2.pool[i2];
        if (!p2.alive) continue;
        p2.t -= dt;
        if (p2.t <= 0) { p2.alive = false; continue; }
        p2.x += p2.vx * dt; p2.y += p2.vy * dt; p2.a += p2.va * dt;
        if (p2.vz || p2.z > 0) {
          if (p2.grav) p2.vz -= 9.8 * dt;
          p2.z += p2.vz * dt;
          if (p2.z <= 0) { p2.z = 0; if (p2.bounce && p2.vz < -0.6) { p2.vz = -p2.vz * 0.35; p2.vx *= 0.6; p2.vy *= 0.6; } else p2.vz = 0; }
        }
      }
      for (i2 = 0; i2 < MAX_FLY; i2++) {
        f2 = F2.flights[i2];
        if (!f2.on) continue;
        f2.t += dt;
        if (f2.t >= f2.T) { f2.on = false; if (P.FireAnimFx && P.FireAnimFx.landed) P.FireAnimFx.landed(F2, f2); continue; }
        f2.x += Math.cos(f2.ang) * f2.sp * dt; f2.y += Math.sin(f2.ang) * f2.sp * dt;
        if (P.FireAnimFx && P.FireAnimFx.flight) P.FireAnimFx.flight(F2, f2, dt);
      }
    }

    // Arms: while a pose (or the chainsaw rev) owns them, the sprite draws no arms; drawHeld draws them.
    F.heroOpts = function (s, o) {
      o.noArms = !!(F.sim === s && (F.pose.on || s.hero.revving > 0));
      if (o.noArms) o.backHand = null;
    };

    function setCtx(R) { F.R = R; F.c = R.ctx; F.m = R.ppm; }

    F.drawHeld = function (R, s) {
      if (F.sim !== s) return;
      var h = s.hero, p = F.pose;
      if (p.on) { setCtx(R); var G = setGeom(F, h, p.ang); p.def.held(F, G, kOf(p)); if (P.WTier) P.WTier.heldGlow(F, G, p.id, s); return; }
      if (h.revving > 0) {
        var cs = defOf('chainsaw');
        if (cs && cs.rev) { setCtx(R); cs.rev(F, setGeom(F, h, +h.revAng || 0), revK(h)); }
      }
    };

    F.drawFx = function (R, s) {
      if (F.sim !== s) return;
      var c = R.ctx, p = F.pose;
      setCtx(R);
      P.FireAnimPrim.drawParts(F, 0);
      if (P.FireAnimFx && P.FireAnimFx.draw) P.FireAnimFx.draw(F, s);
      if (p.on && p.def.draw) p.def.draw(F, setGeom(F, s.hero, p.ang), kOf(p));
      if (p.on && p.def.over) p.def.over(F, setGeom(F, s.hero, p.ang), kOf(p));
      c.save(); c.globalCompositeOperation = 'lighter';
      P.FireAnimPrim.drawParts(F, 1);
      c.restore();
    };

    return F;
  }

  var api = create();
  api.create = create;
  return api;
})();
