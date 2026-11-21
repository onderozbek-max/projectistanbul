// One-use street prop. Contact times, aim and flight drive both damage and the view.
P.StreetWeapon = (function () {
  var W = {}, C = P.CFG.env.streetWeapon, TAU = Math.PI * 2;

  W.eligible = function (s, r) {
    return !!(r && r.alive && !r.bomb && !r.fuseT && !(r.gripAfter > s.t) && r.b && !r.b.station &&
      (!r.street || !r.street.spent && r.street.remaining > 0 && s.t >= r.street.regrip) &&
      C.portable.indexOf(r.kind) !== -1 && P.Env.streetSized(r.b) &&
      (s.routeTrial || s.weaponLab && s.weaponLab.street));
  };

  function gap(h, r) {
    var b = r.b.rc;
    return Math.hypot(Math.max(b.xMin - h.x, h.x - b.xMax, 0), Math.max(b.yMin - h.y, h.y - b.yMax, 0));
  }

  W.candidate = function (s, reach) {
    var best = null, distance = reach + P.CFG.hero.radius;
    s.env.recs.forEach(function (r) {
      if (!W.eligible(s, r)) return;
      var d = gap(s.hero, r);
      if (d < distance) { best = r; distance = d; }
    });
    return best;
  };
  function role(r) { return r.street && C.roles[r.street.role]; }
  W.moveMul = function (s) {
    var R = s.streetWeapon && role(s.streetWeapon.r);
    return R ? R.move : C.move;
  };
  W.reach = function (w) { return C.swingR[w.swing] * (role(w.r) ? role(w.r).reach : 1); };
  W.progress = function (s, r) {
    var g = s.streetGrab;
    return g && g.r === r ? Math.min(1, g.t / C.hold) : null;
  };

  function emit(s, name, x, y, more) {
    s.events.push(Object.assign({ type: 'streetWeapon', beat: name, x: x, y: y }, more));
  }

  function aim(s, radius) {
    var h = s.hero, target = P.Weapons.nearestEnemy(s, h.x, h.y, radius);
    return target ? Math.atan2(target.y - h.y, target.x - h.x) : Math.atan2(h.fy, h.fx);
  }

  function gather(s, dt) {
    var h = s.hero, r = s.streetGrab && W.eligible(s, s.streetGrab.r) && gap(h, s.streetGrab.r) <= C.reach + P.CFG.hero.radius ? s.streetGrab.r : W.candidate(s, C.reach);
    if (!r || h.moving || h.dashing || h.sinceHit < P.CFG.env.propIntent.hitCancel || s.activeHack || s.milestone && (s.milestone.carry || s.milestone.carrying && !s.milestone.open)) { s.streetGrab = null; return; }
    var g = s.streetGrab && s.streetGrab.r === r ? s.streetGrab : { r: r, t: 0 };
    s.streetGrab = g; g.t += dt;
    if (g.t < C.hold) return;
    P.Env.liftCover(s, r);
    h.streetHolding = true; s.streetGrab = null;
    s.streetWeapon = { r: r, phase: 'lift', t: 0, swing: r.street ? r.street.wear : 0, aim: Math.atan2(r.y - h.y, r.x - h.x) };
    emit(s, 'lift', r.x, r.y);
  }

  W.dashDrop = function (s, dx, dy) {
    s.streetGrab = null;
    var w = s.streetWeapon;
    if (!w || w.phase === 'flight' || !w.r.street && w.phase !== 'carry') return;
    var h = s.hero, r = w.r, state = r.street;
    var offset = Math.hypot(r.b.w, r.b.h) / 2 + P.CFG.hero.radius;
    if (dx === undefined) { dx = h.fx; dy = h.fy; }
    var home = state ? state.home : r;
    if (!P.Env.returnCover(s, r, h.x - dx * offset, h.y - dy * offset)) P.Env.returnCover(s, r, home.x, home.y);
    if (state) state.regrip = s.t + C.regripT;
    else r.gripAfter = s.t + C.regripT;
    if (s.streetSite) s.streetSite.fill = 0;
    if (r.alive) emit(s, 'drop', r.x, r.y);
    s.streetWeapon = null; h.streetHolding = false;
  };

  function swingStart(s, w) {
    if (w.phase !== 'swing') w.fromAngle = w.aim;
    w.phase = 'swing'; w.t = 0; w.hit = {}; w.aim = aim(s, C.threat);
  }

  W.angle = function (w, at) {
    var arc = (w.swing === 1 ? -1 : 1) * C.arcs[w.swing];
    if (at < C.windup) {
      var start = w.aim - arc / 2, turn = Math.atan2(Math.sin(start - w.fromAngle), Math.cos(start - w.fromAngle));
      return w.fromAngle + turn * (at / C.windup);
    }
    var p = Math.max(0, Math.min(1, (at - C.windup) / C.strike));
    return w.aim + arc * (p * p * (3 - 2 * p) - 0.5);
  };

  function sweep(s, w, before) {
    var a = W.angle(w, before), b = W.angle(w, w.t), h = s.hero, r = W.reach(w), R = role(w.r);
    var half = Math.abs(b - a) / 2, mid = (a + b) / 2, count = 0;
    s.enemies.forEach(function (e) {
      if (w.hit[e.id] || e.dead || e.state !== 'active') return;
      var x = e.x - h.x, y = e.y - h.y, d = Math.hypot(x, y);
      if (d > r + e.r) return;
      var delta = (Math.atan2(y, x) - mid + 3 * Math.PI) % TAU - Math.PI;
      if (Math.abs(delta) > half + Math.atan2(e.r + 0.22, d)) return;
      w.hit[e.id] = true; count++;
      P.Combat.swingLift(s, e, x / (d || 1), y / (d || 1), (w.swing + 1) / C.arcs.length);
      P.Combat.damageEnemy(s, e, C.swingDmg[w.swing] * (R ? R.power : 1), x / (d || 1), y / (d || 1), C.knockback, false, 'streetCart');
    });
    if (count && !w.impact) {
      w.impact = true;
      if (R) { w.r.street.wear = w.swing + 1; P.LocalChoices.prop(s, w.r, 'offense'); }
      emit(s, 'contact', h.x, h.y, { swing: w.swing, targets: count });
    }
  }

  function swingStep(s, w, before) {
    var h = s.hero;
    if (before < C.windup && w.t >= C.windup) emit(s, 'swing', h.x, h.y, { swing: w.swing });
    if (w.t >= C.windup && before <= C.windup + C.strike) sweep(s, w, Math.max(before, C.windup));
    if (w.t < C.windup + C.strike + C.settle) return;
    var ready = !w.r.street || w.impact;
    w.fromAngle = W.angle(w, w.t); if (ready) w.swing++; w.impact = false;
    if (w.swing >= C.arcs.length) heft(s, w);
    else if (w.r.street) { w.phase = 'carry'; w.t = 0; }
    else swingStart(s, w);
  }

  function aimThrow(s, w) {
    var h = s.hero, target = P.Weapons.pickClusters(s, C.reachThrow, C.landR, 1, C.flight)[0];
    if (!target) target = { x: h.x + Math.cos(w.aim) * 3.2, y: h.y + Math.sin(w.aim) * 3.2 };
    P.World.clampWalk(target, P.CFG.hero.radius, s.props);
    if (s.milestone && !s.milestone.open) target.y = Math.min(target.y, s.milestone.y - P.CFG.hero.radius);
    w.to = target;
    w.aim = Math.atan2(target.y - h.y, target.x - h.x);
  }

  function heft(s, w) { aimThrow(s, w); w.phase = 'heft'; w.t = 0; }

  function launch(s, w) {
    var h = s.hero;
    if (!w.to) aimThrow(s, w);
    w.from = { x: h.x, y: h.y };
    w.phase = 'flight'; w.t = 0;
    emit(s, 'throw', h.x, h.y);
  }

  function land(s, w) {
    var p = w.to, count = 0;
    s.enemies.forEach(function (e) {
      if (e.dead || e.state !== 'active') return;
      var dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy);
      if (d > C.landR + e.r) return;
      var R = role(w.r);
      P.Combat.damageEnemy(s, e, C.landDmg * (R ? R.power : 1), dx / (d || 1), dy / (d || 1), C.knockback, false, 'streetCart');
      count++;
    });
    if(P.DramaSpace)P.DramaSpace.impact(s,w);
    w.r.x = p.x; w.r.y = p.y;
    P.Env.broke(s, w.r, 'blunt');
    s.streetImpact = { x: p.x, y: p.y, at: s.t, r: C.landR };
    emit(s, 'land', p.x, p.y, { targets: count, r: C.landR });
    s.streetWeapon = null;
  }

  W.step = function (s, dt) {
    var w = s.streetWeapon;
    P.StreetPlaces.expire(s);
    if (!w) { gather(s, dt); return; }
    var before = w.t;
    w.t += dt;
    if (w.r.street && w.phase !== 'flight') {
      w.r.street.remaining = Math.max(0, w.r.street.remaining - dt);
      if (!w.r.street.remaining) { W.dashDrop(s); return; }
    }
    if (w.phase === 'lift' && w.t >= C.lift) {
      if (w.swing >= C.arcs.length) heft(s, w);
      else { w.phase = 'carry'; w.t = 0; }
    } else if (w.phase === 'carry') {
      if (!(w.r.street && P.StreetPlaces.step(s, w, dt)) && P.Weapons.nearestEnemy(s, s.hero.x, s.hero.y, W.reach(w))) swingStart(s, w);
    }
    else if (w.phase === 'swing') swingStep(s, w, before);
    else if (w.phase === 'heft' && w.t >= C.heft) launch(s, w);
    else if (w.phase === 'flight') {
      if (w.t >= C.settle) s.hero.streetHolding = false;
      if (w.t >= C.flight) land(s, w);
    }
  };
  return W;
})();
