// Game feel (view only, v0.9 animation pass): the small motions that make hits and steps read.
//  - Hit spring: a struck enemy squashes, wobbles, tilts away and is shoved, instead of a 60 ms flash.
//  - Hit-stop: a few frames of frozen simulation on heavy or critical hits (rate limited, off under Reduce motion).
//  - Camera kick: the screen leans into the player's own big actions (swing, heavy hit, dash, ult).
//  - Arcing blood and gibs with fake height (z), a ground shadow and a tiny decal where they land.
//  - Footfall dust, hero forward lean by speed, start stretch and stop settle.
//  - Knife arm with anticipation, overshoot and follow-through.
// The simulation never reads anything here. Numbers: P.CFG.feel2 (config-feel.js).
P.Feel = (function () {
  var F = {}, HEAVY = { sledge: 1, canister: 1, cluster: 1, cleaver: 1, finale: 1, chainsaw: 1 }, TAU = Math.PI * 2;
  var hurtMap = {}, hurtN = 0, parts = [], hsLast = -9, ringAt = -9, wispLeft = 0, hero = { x: 0, y: 0, dist: 0, step: 0, v: 0, moving: false, was: false, at: -9, kind: 0, a: 0, mul: 1 };
  var fxLeft = 0, HS = { x: 1, y: 1, ox: 0, r: 0 }, HERO = { x: 1, y: 1, lean: 0.03, r: 0 }, knifeLast = { a: 0, t: -9 };
  var fidgetAt = -9, fidgetNext = -1, fidgetSide = 1;

  function C() { return P.CFG.feel2; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function now() { return performance.now() / 1000; }
  function rm() { return !!(P.Settings && P.Settings.reduceMotion); }
  function ease(t) { return t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t); }

  F.reset = function () { hurtMap = {}; hurtN = 0; parts.length = 0; hsLast = -9; hero.dist = 0; hero.step = 0; hero.was = false; hero.at = -9; knifeLast.t = -9; fidgetNext = -1; fidgetAt = -9; };

  // ---------- hit spring ----------
  function startHurt(ev) {
    var k = C().spring, st = hurtMap[ev.id], amp = ev.boss ? k.boss : 1;
    if (HEAVY[ev.src]) amp *= k.heavy;
    if (ev.crit) amp *= k.crit;
    if (!st) { if (hurtN > k.max) { hurtMap = {}; hurtN = 0; } st = hurtMap[ev.id] = { at: 0, amp: 0, dx: 0 }; hurtN++; }
    st.amp = Math.max(amp, F.hurtAmp(st) * 0.8);
    st.at = now(); st.dx = ev.dx || 0;
  }
  F.hurtAmp = function (st) {
    var age = now() - st.at, k = C().spring;
    return age > k.life ? 0 : st.amp * Math.exp(-age / k.tau);
  };
  // Transform for an enemy this frame, or null when it is not reacting. The returned object is reused: read it at once.
  F.hurt = function (e) {
    var st = hurtMap[e.id], k = C().spring, age, a, osc;
    if (!st) return null;
    age = now() - st.at;
    if (age > k.life) { delete hurtMap[e.id]; hurtN--; return null; }
    a = st.amp; osc = Math.exp(-age / k.tau) * Math.cos(k.omega * age);
    HS.y = 1 - k.squashY * a * osc; HS.x = 1 + k.squashX * a * osc;
    HS.r = (st.dx >= 0 ? 1 : -1) * k.tiltRad * a * Math.exp(-age / k.tiltTau);
    HS.ox = (st.dx >= 0 ? 1 : -1) * k.shoveU * a * Math.exp(-age / k.shoveTau);
    return HS;
  };
  // True when a walker is not advancing (windup, root, stagger, blocked): it should breathe, not freeze mid-stride.
  F.stopped = function (e) { return Math.hypot(e.vx || 0, e.vy || 0) < C().idle.speedEps && !(e.kbT > 0); };

  // ---------- hit-stop and camera kick ----------
  // kind: 'heavy' | 'boss' | 'critKill'. One limiter for every source (this and weapons-fx critKill both come through here).
  F.hitStop = function (kind) {
    var k = C().hitStop, t = now();
    if (t - hsLast < k.minGap) return;
    hsLast = t;
    P.HitStop = Math.max(P.HitStop || 0, k[kind] || k.heavy);
  };
  F.kick = function (dx, dy, px) {
    var c = P.Fx.cam, m = Math.hypot(dx, dy) || 1;
    if (rm()) return;
    var mx = C().fire.max;
    c.kx = Math.max(-mx, Math.min(mx, (c.kx || 0) + dx / m * px)); c.ky = Math.max(-mx, Math.min(mx, (c.ky || 0) - dy / m * px));   // world +y is up the screen
  };
  F.decayKick = function (dt) {
    var c = P.Fx.cam, d = Math.exp(-C().kick.decay * dt);
    c.kx = rm() ? 0 : (c.kx || 0) * d; c.ky = rm() ? 0 : (c.ky || 0) * d;
    if (Math.abs(c.kx) < 0.01) c.kx = 0;   // snap: exponential decay otherwise ends in denormal floats
    if (Math.abs(c.ky) < 0.01) c.ky = 0;
  };

  // ---------- particles with fake height ----------
  function add(p) { if (parts.length < C().drops.max) parts.push(p); }
  function drops(x, y, dx, dy, n, big) {
    var k = C().drops, a0 = Math.atan2(dy || 0, dx || 0), i, a, sp;
    for (i = 0; i < n; i++) {
      a = a0 + rnd(-0.9, 0.9); sp = rnd(k.speedMin, k.speedMax) * (big ? 1.4 : 1);
      add({ k: big ? 'gib' : 'drop', x: x, y: y, z: rnd(0.2, 0.7), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: rnd(k.vzMin, k.vzMax) * (big ? 1.2 : 1),
            r: big ? rnd(0.05, 0.09) : rnd(0.025, 0.05), t: rnd(0.6, 1) * k.life, T: k.life, bounced: 0 });
    }
  }
  function wisps(x, y) {
    var w = C().wisp, i;
    if (rm() || wispLeft <= 0) return;
    for (i = 0; i < w.n; i++, wispLeft--) add({ k: 'wisp', x: x + rnd(-0.15, 0.15), y: y, z: 0.15, vx: rnd(-0.2, 0.2), vy: rnd(-0.05, 0.1), vz: w.rise * rnd(0.7, 1.2), r: w.size * rnd(0.8, 1.3), t: w.life * rnd(0.8, 1.1), T: w.life });
  }
  function dust(x, y, n, size, spread) {
    var d = C().dust, i;
    for (i = 0; i < n; i++) add({ k: 'dust', x: x + rnd(-spread, spread), y: y, z: 0.03, vx: rnd(-0.5, 0.5), vy: rnd(-0.2, 0.3), vz: rnd(0.2, 0.5) * d.rise,
      r: size * rnd(0.7, 1.2), t: d.life * rnd(0.8, 1.2), T: d.life });
  }
  // Other view modules (vehicles) add their own fake-height particles: { k, x, y, z, vx, vy, vz, r, t, T, col? }.
  F.emit = function (p) { if (p.bounced === undefined) p.bounced = 0; add(p); };
  // Element sparks at a weapon hit (embers, zaps, steel, foam, grit). Source ids that are not weapons are ignored.
  function tagFx(ev) {
    var tg = P.CFG.tags, tag = tg && tg[ev.src], hf = C().hitFx, d = tag && hf[tag], n, i, a0, a, sp;
    if (!d || fxLeft <= 0) return;
    n = rm() ? 1 : d.n; fxLeft -= n; a0 = Math.atan2(ev.dy || 0, ev.dx || 0);
    for (i = 0; i < n; i++) {
      a = a0 + rnd(-1.3, 1.3); sp = d.sp * rnd(0.6, 1.2);
      add({ k: d.k, col: d.col, x: ev.x, y: ev.y, z: rnd(0.2, 0.6), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: d.vz * rnd(0.5, 1),
            r: d.r * rnd(0.8, 1.3), t: d.life * rnd(0.7, 1), T: d.life, bounced: 0 });
    }
  }
  function land(p) {
    var k = C().drops, F2 = P.Fx;
    if (p.k === 'drop' && Math.random() < k.landSplat && F2.parts.length < P.CFG.feel.partsMax * 0.8) {
      F2.parts.push({ kind: 'splat', x: p.x, y: p.y, r: 0.07 + Math.random() * 0.07, t: 4, T: 4, a: Math.random() * 6, seed: Math.random() });
    }
  }

  // ---------- events ----------
  F.onEvent = function (ev, s) {
    var k = C(), heavy, px;
    switch (ev.type) {
      case 'hit':
        heavy = !!HEAVY[ev.src] || ev.boss;
        startHurt(ev);
        drops(ev.x, ev.y, ev.dx, ev.dy, k.drops.perHit, false);
        tagFx(ev);
        if (heavy || ev.crit) { if (heavy) F.hitStop(ev.boss ? 'boss' : 'heavy'); F.kick(ev.dx || 0, ev.dy || 0, heavy ? k.kick.heavy : k.kick.hit * 1.5); }
        else if (ev.src === 'knife') F.kick(ev.dx || 0, ev.dy || 0, k.kick.hit);
        break;
      case 'kill':
        wisps(ev.x, ev.y);
        drops(ev.x, ev.y, ev.dx, ev.dy, k.drops.perKill, true);
        break;
      case 'pickup':
        px = k.pickup;
        if (!rm() && now() - ringAt >= px.gap) {
          ringAt = now();
          add({ k: 'ring', x: s.hero.x, y: s.hero.y - 0.2, z: 0, vx: 0, vy: 0, vz: 0, r: 0, t: px.life, T: px.life, col: px.col[ev.kind] || px.col.simit });
        }
        break;
      case 'swing': F.kick(ev.ax || 0, ev.ay || 0, k.kick.knife); break;
      case 'wfire':   // weapon recoil: the view jolts back from the muzzle; the heaviest shots also squash the hero
        if (ev.w === 'knife') break;
        px = k.fire.byId[ev.variant]; if (px === undefined) px = k.fire.byId[ev.w];
        if (px === undefined) px = k.fire.byTag[ev.tag];
        if (px === undefined) px = k.fire.base;
        F.kick(-Math.cos(ev.ang || 0), -Math.sin(ev.ang || 0), px);
        if (px >= k.fire.squashAt) heroSpring(2);
        break;
      case 'heroHit':   // light hits squash the hero; a heavy one (10% of max HP or more, as the edge pulse) squashes harder and kicks harder
        heavy = ev.dmg >= P.CFG.feel.edgePulseFrac * s.hero.maxHp;
        heroSpring(2, heavy ? k.hero.heavyMul : 1);
        F.kick(rnd(-1, 1), rnd(-1, 1), k.kick.hero * (heavy ? 1.5 : 1));
        break;
      case 'dash':
        F.kick(-(ev.ax || 0), -(ev.ay || 0), k.kick.dash); heroSpring(1, 0);
        dust(s.hero.x, s.hero.y - 0.25, 6, 0.22, 0.25);
        break;
      case 'ult': F.kick(0, 1, k.kick.ult); if (P.Fx.punch) P.Fx.punch(); break;
      case 'evolve': if (P.Fx.punch) P.Fx.punch(); break;
    }
  };

  // ---------- hero body language ----------
  // kind: 1 stretch (start / dash), 2 squash (hit / stop).
  // mul scales a squash (a heavy hit squashes hero.heavyMul times as far as a light one). Stretch (kind 1) ignores it.
  function heroSpring(kind, mul) { hero.kind = kind; hero.at = now(); hero.mul = mul || 1; }
  function heroBand(v) {
    var k = C().hero;
    return v >= k.runSpeed ? k.leanRun : v >= k.walkSpeed ? k.leanWalk : k.leanIdle;
  }
  // Idle fidget: while the hero stands still, a stretch and a neck roll every fidget.every s (random in the range). Off under
  // Reduce motion. Only the sprite changes (squash and roll); the sim does not know about it.
  function fidget(t, fd) {
    if (rm() || hero.v > C().idle.speedEps) return;
    if (fidgetNext < 0) fidgetNext = t + rnd(fd.every[0], fd.every[1]);
    if (t >= fidgetNext) { fidgetAt = t; fidgetSide = Math.random() < 0.5 ? -1 : 1; fidgetNext = t + rnd(fd.every[0], fd.every[1]); }
    var age = t - fidgetAt, env;
    if (age >= fd.t) return;
    env = Math.sin(Math.PI * age / fd.t);
    HERO.y *= 1 + fd.amp * env; HERO.x *= 1 - fd.amp * 0.5 * env; HERO.r = fidgetSide * fd.rot * env;
  }
  // Called once per frame before drawing the hero. Returns { x, y, lean, r }: sprite squash, lean and roll (reused object).
  F.hero = function () {
    var k = C().hero, t = now(), age = t - hero.at, amp = 0, osc;
    HERO.lean = heroBand(hero.v); HERO.x = 1; HERO.y = 1; HERO.r = 0;
    if (age < k.springLife) {
      osc = Math.exp(-age / k.springTau) * Math.cos(k.springOmega * age);
      amp = hero.kind === 1 ? k.startStretch : -k.stopSquash * hero.mul;
      HERO.y = 1 + amp * osc; HERO.x = 1 - amp * 0.7 * osc;
    }
    fidget(t, k.fidget);
    return HERO;
  };

  F.update = function (dt, s) {
    var h = s.hero, d = C().dust, i, p, dist, phase, step, k = C().drops;
    fxLeft = C().hitFx.perFrame; wispLeft = C().wisp.perFrame;
    if (dt > 0) {
      dist = Math.hypot(h.x - hero.x, h.y - hero.y);
      if (dist > 2) dist = 0;   // teleport or first frame
      hero.v += (dist / dt - hero.v) * Math.min(1, dt * 14);
      hero.x = h.x; hero.y = h.y;
      if (h.moving && !hero.was) heroSpring(1);
      else if (!h.moving && hero.was && hero.v < 99) heroSpring(2);
      hero.was = h.moving;
      if (h.moving && hero.v > d.minSpeed) {
        hero.dist += dist; phase = hero.dist * 5; step = Math.floor((phase + Math.PI / 2) / Math.PI);
        if (step !== hero.step) { hero.step = step; dust(h.x + (step % 2 ? 0.1 : -0.1), h.y - 0.28, d.count, d.size, 0.06); }
      }
    }
    for (i = parts.length - 1; i >= 0; i--) {
      p = parts[i]; p.t -= dt;
      if (p.t <= 0) { if (p.k === 'drop' || p.k === 'gib') land(p); parts.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (p.k === 'ring') continue;
      if (p.k === 'dust' || p.k === 'foam' || p.k === 'wisp') { p.vx *= 0.94; p.vy *= 0.94; if (p.k === 'foam') p.vz *= 0.92; continue; }
      p.vz -= k.gravity * dt;
      if (p.z <= 0) {
        p.z = 0;
        if (p.k === 'drop' || p.k === 'spark' || p.bounced > 0) { land(p); parts.splice(i, 1); continue; }
        p.bounced++; p.vz *= -k.bounce; p.vx *= 0.5; p.vy *= 0.5;
      }
    }
  };

  // Drawn after the particle layer: ground shadow under anything airborne, then the particle at its height.
  F.draw = function (R) {
    var c = R.ctx, u = R.ppm, i, p, a, X, Y, ringR, d = C().dust, rgbB = P.goreRGB(2), rgbG = P.goreRGB(1);
    for (i = 0; i < parts.length; i++) {
      p = parts[i]; a = Math.min(1, p.t / p.T * 2);
      X = R.X(p.x); Y = R.Y(p.y + p.z);
      if (p.k === 'dust') {
        c.fillStyle = 'rgba(176,164,146,' + (d.alpha * p.t / p.T).toFixed(3) + ')';
        c.beginPath(); c.ellipse(X, Y, p.r * u * (1.6 - p.t / p.T * 0.6), p.r * u * 0.6 * (1.6 - p.t / p.T * 0.6), 0, 0, TAU); c.fill();
        continue;
      }
      if (p.k === 'wisp') {
        c.fillStyle = 'rgba(150,146,140,' + (C().wisp.alpha * p.t / p.T).toFixed(3) + ')';
        c.beginPath(); c.ellipse(X, Y, p.r * u * (1 + (1 - p.t / p.T) * 0.9), p.r * u * 0.8 * (1 + (1 - p.t / p.T) * 0.9), 0, 0, TAU); c.fill();
        continue;
      }
      if (p.k === 'ring') {
        a = p.t / p.T; ringR = C().pickup;
        c.strokeStyle = 'rgba(' + p.col + ',' + (0.8 * a).toFixed(3) + ')'; c.lineWidth = 2;
        c.beginPath(); c.ellipse(X, Y, (ringR.r0 + (ringR.r1 - ringR.r0) * (1 - a)) * u, (ringR.r0 + (ringR.r1 - ringR.r0) * (1 - a)) * u * 0.45, 0, 0, TAU); c.stroke();
        continue;
      }
      if (p.k === 'spark') {
        c.strokeStyle = 'rgba(' + p.col + ',' + a.toFixed(3) + ')'; c.lineWidth = 1.7; c.lineCap = 'round';
        c.beginPath(); c.moveTo(X, Y); c.lineTo(X - p.vx * 0.035 * u, Y + (p.vy + p.vz) * 0.035 * u); c.stroke();
        continue;
      }
      if (p.k === 'foam') {
        c.fillStyle = 'rgba(' + p.col + ',' + (0.6 * p.t / p.T).toFixed(3) + ')';
        c.beginPath(); c.arc(X, Y, p.r * u * (0.8 + (1 - p.t / p.T) * 1.4), 0, TAU); c.fill();
        continue;
      }
      if (p.z > 0.04) { c.fillStyle = 'rgba(0,0,0,' + (0.16 * a).toFixed(3) + ')'; c.beginPath(); c.ellipse(R.X(p.x), R.Y(p.y), p.r * u * 0.9, p.r * u * 0.4, 0, 0, TAU); c.fill(); }
      if (p.k === 'drop') { c.fillStyle = 'rgba(' + rgbB + ',' + a.toFixed(3) + ')'; c.beginPath(); c.ellipse(X, Y, p.r * u, p.r * u * (1 + Math.min(0.8, Math.abs(p.vz) * 0.1)), 0, 0, TAU); c.fill(); }
      else { c.fillStyle = 'rgba(' + rgbG + ',' + a.toFixed(3) + ')'; c.strokeStyle = 'rgba(20,21,31,' + a.toFixed(3) + ')'; c.lineWidth = 1.2; c.beginPath(); c.arc(X, Y, p.r * u, 0, TAU); c.fill(); c.stroke(); }
    }
  };

  // ---------- knife arm: anticipation, overshoot, follow-through ----------
  // w: the active swing (P.Fx.swings entry) or undefined. Returns the hand angle in screen space, or undefined for the default pose.
  F.knifeAngle = function (w, face) {
    var kk = C().knife, t = now(), a, half, p, q, ang, rest, d, u;
    if (w) {
      a = Math.atan2(-w.ay, w.ax); half = w.arc * Math.PI / 360; p = 1 - w.t / w.T;
      if (p < 0.12) q = -kk.anticip * Math.sin(p / 0.12 * Math.PI / 2);
      else if (p < 0.5) q = -kk.anticip + (1 + kk.anticip + kk.overshoot) * ease((p - 0.12) / 0.38);
      else q = 1 + kk.overshoot * (1 - ease((p - 0.5) / 0.3));
      ang = a + w.dir * (half - 2 * half * q);
      knifeLast.a = ang; knifeLast.t = t;
      return ang;
    }
    if (t - knifeLast.t < kk.settle) {
      rest = face > 0 ? 0.6 : Math.PI - 0.6; u = ease((t - knifeLast.t) / kk.settle);
      d = rest - knifeLast.a; d = Math.atan2(Math.sin(d), Math.cos(d));
      return knifeLast.a + d * u;
    }
    return undefined;
  };

  return F;
})();
