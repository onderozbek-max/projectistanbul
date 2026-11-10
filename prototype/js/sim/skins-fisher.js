// Fisher (olta, skin behaviour): casts a hook line at the hero when it is within castRange with line of sight. The line is
// a lane telegraph (then: 'hook'), thin, the shape of the hit. When it resolves, the hero is dragged pullDist metres toward
// the fisher over pullT seconds, unless it dashed, walked out of the line, is behind a wall, or a boss/hack/cinematic blocks
// it (P.Skins.blocked). No damage. Numbers: P.CFG.skins.fisher (config-skins.js).
(function () {
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  P.Skins.fisherInit = function (s, e) {
    e.hook = { m: 'idle', t: 0, cd: P.CFG.skins.fisher.firstCd, tx: 0, ty: 0 };
  };

  // Idle: count the cooldown down and cast when the hero is in range, in sight and the hero is free. Casting: stand still
  // (the windup pose) until the telegraph resolves (P.Skins.hookResolve, from enemies.js onTele).
  P.Skins.fisherThink = function (s, e, dt) {
    var a = e.hook, K = P.CFG.skins.fisher, h = s.hero;
    a.cd = Math.max(0, a.cd - dt);
    if (a.m === 'cast') {
      e.dvx = 0; e.dvy = 0; a.t += dt; e.windup = clamp01(a.t / K.telegraph);
      return true;
    }
    if (a.cd > 0 || s.skinPull || P.Skins.blocked(s) || dist(e, h) > K.castRange) return false;
    if (!P.Skins.losClear(s, e.x, e.y, h.x, h.y)) return false;
    startCast(s, e, a, K, h);
    return true;
  };

  function startCast(s, e, a, K, h) {
    var dx = h.x - e.x, dy = h.y - e.y, len = Math.hypot(dx, dy) || 1;
    a.m = 'cast'; a.t = 0; a.tx = h.x; a.ty = h.y; e.dvx = 0; e.dvy = 0;
    s.enemyTele.push({ kind: 'lane', x: e.x, y: e.y, dx: dx / len, dy: dy / len, len: len, w: K.lineW, t: 0, T: K.telegraph,
      then: 'hook', owner: e.id, src: e, col: 'danger' });
    s.events.push({ type: 'hookCast', id: e.id, x: e.x, y: e.y, tx: h.x, ty: h.y, T: K.telegraph });
  }

  // Resolution of the hook line: back to idle with the cooldown, then hit or miss.
  P.Skins.hookResolve = function (s, tg) {
    var e = tg.src, K = P.CFG.skins.fisher, h = s.hero, why = null, ux, uy, u;
    if (!e || e.dead || !e.hook) return;
    e.hook.m = 'idle'; e.hook.cd = K.cooldown;
    if (P.Skins.blocked(s)) why = 'blocked';
    else if (s.sk && s.sk.dash) why = 'dash';
    else if (laneDist(h, tg) > tg.w / 2 + P.CFG.hero.radius) why = 'out';
    else if (!P.Skins.losClear(s, tg.x, tg.y, h.x, h.y)) why = 'wall';
    if (why) { s.events.push({ type: 'hookMiss', id: e.id, x: h.x, y: h.y, why: why }); return; }
    ux = tg.x - h.x; uy = tg.y - h.y; u = Math.hypot(ux, uy) || 1;
    s.skinPull = { t: 0, T: K.pullT, dist: K.pullDist, ux: ux / u, uy: uy / u, fx: tg.x, fy: tg.y };   // fx, fy: the view draws the line
    s.events.push({ type: 'hookHit', id: e.id, x: tg.x, y: tg.y, hx: h.x, hy: h.y, T: K.pullT });
  };

  // Distance from the hero to the lane segment (tg.x, tg.y) + (tg.dx, tg.dy) * [0, tg.len].
  function laneDist(h, tg) {
    var px = h.x - tg.x, py = h.y - tg.y, t = px * tg.dx + py * tg.dy;
    t = Math.max(0, Math.min(tg.len, t));
    return Math.hypot(px - tg.dx * t, py - tg.dy * t);
  }

  // The drag, one step per frame. Stops early on a dash, a block, or a wall (the step moves less than asked).
  P.Skins.fisherFrame = function (s, dt) {
    var p = s.skinPull, h, step, dtUse, ox, oy;
    if (!p) return;
    if (P.Skins.blocked(s) || (s.sk && s.sk.dash)) {
      s.skinPull = null; s.events.push({ type: 'hookBreak', x: s.hero.x, y: s.hero.y });
      return;
    }
    h = s.hero; dtUse = Math.min(dt, p.T - p.t); step = p.dist * dtUse / p.T; ox = h.x; oy = h.y;
    h.x += p.ux * step; h.y += p.uy * step;
    P.World.clampHero(s, h);
    p.t += dt;
    if (Math.hypot(h.x - ox, h.y - oy) < step * 0.5 - 1e-9) { s.skinPull = null; s.events.push({ type: 'hookBreak', x: h.x, y: h.y }); return; }
    if (p.t >= p.T) s.skinPull = null;
  };
})();
