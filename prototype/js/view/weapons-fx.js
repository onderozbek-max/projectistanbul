// Weapon visuals (view only). Each weapon has its own animation language (anticipation -> action -> impact -> follow-through):
// Knife = three swing variants (forehand crescent, wide backhand wind, short chop) + tip glint + slash marks.
// Nail Gun = held in the off hand, recoil kick, star muzzle flash, brass casings, tracer nails, white impact pings.
// Gas Canister / Molotov = overhead throw, spinning canister or bottle with trail, fireball + shock rings + debris.
// Bike Chain = a real link chain whirled from the hand with a spinning sprocket, motion-blur arc, sparks on hit.
// Dispatch: every event goes to P.WFx2 (sledge, molotov, fireworks, finale), P.WFx3 (cable, speargun,
// extinguisher, cleaver, cyclone, cluster) and P.SkillsFx (dash, ult, frenzy, evolve). Crit feel and P.HitStop live here.
P.WFx = (function () {
  var W = { gunA: 0, recoil: 0, sinceFire: 9, throwT: 0, throwKind: 'canister', parts: [], blastN: 0, hs: [], sim: null,
    combo: { n: 0, t: 0, best: 0 } };
  var INK = '#14151F', THROW_T = 0.32, MAX_PARTS = 700, HEAVY = { sledge: 1, canister: 1, cluster: 1, cleaver: 1, finale: 1 };
  // v0.7: streak milestones (25/50/100/200) keep their sound cue; the HUD streak meter shows the tier label.
  var MILESTONES = [25, 50, 100, 200];

  function mods() { return [P.WFx2, P.WFx3, P.WFx4, P.SkillsFx]; }

  W.reset = function () {
    W.gunA = 0; W.recoil = 0; W.sinceFire = 9; W.throwT = 0; W.parts = [];
    W.combo = { n: 0, t: 0, best: 0 };
    mods().forEach(function (m) { if (m && m.reset) m.reset(); });
  };

  W.add = function (p) { if (W.parts.length < MAX_PARTS) W.parts.push(p); };
  function add(p) { W.add(p); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  // Stereo pan from the screen position relative to Arda (-1 left .. 1 right).
  W.pan = function (s, x) { return Math.max(-1, Math.min(1, (x - s.hero.x) / (P.CFG.view.widthM / 2))); };
  W.gold = function () { return !!(W.sim && P.Skills.frenzyOn(W.sim)); };


  W.onEvent = function (ev, s) {
    var i, a;
    W.sim = s;
    mods().forEach(function (m) { if (m && m.onEvent) m.onEvent(ev, s); });
    switch (ev.type) {
      case 'nailFire': nailFire(ev, s); break;
      case 'canisterThrow': W.throwT = THROW_T; W.throwKind = 'canister'; break;
      case 'flaskThrow': W.throwT = THROW_T; W.throwKind = 'bottle'; break;
      case 'swing': knifeSwing(ev, s); break;
      case 'hit': hit(ev, s); break;
      case 'blast': blast(ev, s); break;
      case 'kill': comboKill(s); break;
      case 'critKill': P.Feel.hitStop('critKill'); break;
      case 'shockwave':
        add({ k: 'shock', x: ev.x, y: ev.y, r: ev.r * 1.3, t: 0.4, T: 0.4, col: '255,209,102' });
        for (i = 0; i < 16; i++) { a = i / 16 * Math.PI * 2; add({ k: 'ray', x: ev.x, y: ev.y, a: a, t: 0.5, T: 0.5 }); }
        break;
    }
  };

  function nailFire(ev, s) {
    var i, a = ev.a, stormy = ev.id === 'nailstorm', mx = s.hero.x + Math.cos(a) * 0.5, my = s.hero.y + Math.sin(a) * 0.5;
    W.gunA = a; W.recoil = stormy ? 0.6 : 1; W.sinceFire = 0;
    add({ k: 'mflash', x: mx, y: my, a: a, r: stormy ? 0.34 : 0.26, t: 0.07, T: 0.07 });
    add({ k: 'smoke', x: mx, y: my, z: 0.1, vz: 0.6, vx: Math.cos(a) * 0.3, vy: Math.sin(a) * 0.3, r: 0.12, t: 0.45, T: 0.45 });
    for (i = 0; i < 2; i++) add({ k: 'casing', x: s.hero.x, y: s.hero.y, z: 0.8, vx: -Math.cos(a) * rnd(1, 2) + rnd(-1, 1), vy: -Math.sin(a) * rnd(1, 2),
      vz: rnd(2, 4), rot: rnd(0, 6), vr: rnd(-18, 18), t: 0.5, T: 0.5 });
    P.Sfx.play(stormy ? 'nailStorm' : 'nail', stormy ? 40 : 70, { pan: W.pan(s, s.hero.x) });
  }

  function knifeSwing(ev, s) {
    var a = Math.atan2(ev.ay, ev.ax), v = ev.variant || 0, i, aa, rr;
    var half = ev.arcDeg * Math.PI / 360, dir = ev.dir || 1;
    for (i = 0; i < (v === 1 ? 6 : 4); i++) {
      aa = a + rnd(-0.6, 0.6); rr = ev.range * rnd(0.6, 1.1);
      add({ k: 'speed', x: ev.x + Math.cos(aa) * rr, y: ev.y + Math.sin(aa) * rr, a: aa + Math.PI / 2 * dir, len: rnd(0.4, 0.8), t: 0.14, T: 0.14, gold: W.gold() });
    }
    if (v === 1) add({ k: 'wind', x: ev.x, y: ev.y, r: ev.range, a0: a - dir * half, a1: a + dir * half, t: 0.22, T: 0.22, gold: W.gold() });
    if (v === 2) {
      add({ k: 'chop', x: ev.x + Math.cos(a) * ev.range * 0.8, y: ev.y + Math.sin(a) * ev.range * 0.8, a: a, t: 0.16, T: 0.16 });
      add({ k: 'puff', x: ev.x + Math.cos(a) * ev.range * 0.7, y: ev.y + Math.sin(a) * ev.range * 0.7, z: 0.2, vz: 0.4, vx: 0, vy: 0, r: 0.18, t: 0.3, T: 0.3 });
    }
    var ea = a - dir * half;
    add({ k: 'glint', x: ev.x + Math.cos(ea) * ev.range, y: ev.y + Math.sin(ea) * ev.range, t: 0.18, T: 0.18 });
    P.Sfx.play('swish', 90, { pan: W.pan(s, ev.x) });
  }

  function hit(ev, s) {
    var i, heavy = !!HEAVY[ev.src], pn = W.pan(s, ev.x);
    if (ev.crit) {
      add({ k: 'impact', x: ev.x, y: ev.y, t: 0.2, T: 0.2 });
      P.Sfx.play('crit', 60, { pan: pn });
    }
    if (ev.src === 'knife') add({ k: 'slash', x: ev.x, y: ev.y + 0.5, a: Math.atan2(ev.dy, ev.dx) + Math.PI / 2 + rnd(-0.3, 0.3), t: 0.12, T: 0.12 });
    else if (ev.src === 'nailgun' || ev.src === 'nailstorm') {
      add({ k: 'ping', x: ev.x - ev.dx * 0.3, y: ev.y - ev.dy * 0.3 + 0.4, t: 0.1, T: 0.1 });
      add({ k: 'stuck', x: ev.x, y: ev.y, ox: rnd(-0.15, 0.15), oz: rnd(0.4, 0.8), a: Math.atan2(ev.dy, ev.dx), id: ev.id, t: 0.6, T: 0.6 });
    } else if (ev.src === 'chain' || ev.src === 'cyclone' || ev.src === 'cable') {
      for (i = 0; i < 4; i++) add({ k: 'spark', x: ev.x, y: ev.y, z: 0.5, vx: rnd(-4, 4), vy: rnd(-4, 4), vz: rnd(1, 4), t: 0.3, T: 0.3 });
      add({ k: 'glint', x: ev.x, y: ev.y, t: 0.12, T: 0.12 });
      if (ev.src === 'chain') P.Sfx.play('chain', 60, { pan: pn });
    }
  }

  function blast(ev, s) {
    var i, a, sp, big = ev.r >= 1.5;
    W.blastN++;
    add({ k: 'shock', x: ev.x, y: ev.y, r: ev.r * 1.5, t: 0.22, T: 0.22, col: '255,255,255' });
    if (big) add({ k: 'shock', x: ev.x, y: ev.y, r: ev.r * 2.1, t: 0.4, T: 0.4, col: '255,170,70' });
    for (i = 0; i < 7; i++) add({ k: 'fire', x: ev.x + rnd(-0.4, 0.4) * ev.r, y: ev.y + rnd(-0.3, 0.3) * ev.r, r: ev.r * rnd(0.35, 0.6), t: rnd(0.25, 0.4), T: 0.4 });
    for (i = 0; i < 6; i++) add({ k: 'smoke', x: ev.x + rnd(-0.5, 0.5) * ev.r, y: ev.y + rnd(-0.3, 0.3) * ev.r, z: 0.3, vz: rnd(0.6, 1.4), vx: rnd(-0.4, 0.4), vy: 0, r: ev.r * rnd(0.3, 0.5), t: rnd(0.9, 1.4), T: 1.4 });
    for (i = 0; i < (big ? 12 : 8); i++) {
      a = rnd(0, Math.PI * 2); sp = rnd(3, 7);
      add({ k: 'debris', x: ev.x, y: ev.y, z: 0.2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: rnd(3, 7), rot: rnd(0, 6), vr: rnd(-15, 15), t: 0.8, T: 0.8 });
    }
    if (W.blastN % 3 === 1 && P.Fx) P.Fx.letter(ev.x, ev.y + 1.2, P.t('fx.boom'));
    P.Sfx.play(ev.id === 'cluster' ? 'cluster' : 'blast', 80, { pan: W.pan(s, ev.x) });
  }

  function comboKill(s) {
    var c = W.combo;
    c.n = c.t > 0 ? c.n + 1 : 1; c.t = 1.4; c.best = Math.max(c.best, c.n);
    if (MILESTONES.indexOf(c.n) >= 0) P.Sfx.play('combo', 200);
  }

  W.update = function (dt, s) {
    var i, p, c = W.combo;
    if (s) W.sim = s;
    W.recoil = Math.max(0, W.recoil - dt * 7); W.sinceFire += dt;
    W.throwT = Math.max(0, W.throwT - dt);
    c.t = Math.max(0, c.t - dt); if (c.t === 0) c.n = 0;
    if (s) s.projs.forEach(function (q) {
      if (Math.random() < 0.6) { var f = q.t / q.T; add({ k: 'puff', x: q.x0 + (q.x1 - q.x0) * f, y: q.y0 + (q.y1 - q.y0) * f, z: 4 * 1.6 * f * (1 - f), vx: rnd(-0.3, 0.3), vy: rnd(-0.3, 0.3), vz: 0.2, r: 0.12, t: 0.4, T: 0.4 }); }
    });
    for (i = W.parts.length - 1; i >= 0; i--) {
      p = W.parts[i];
      p.t -= dt;
      if (p.t <= 0) { W.parts.splice(i, 1); continue; }
      if (p.vx !== undefined) { p.x += p.vx * dt; p.y += p.vy * dt; }
      if (p.vz !== undefined) {
        p.z += p.vz * dt;
        if (p.k !== 'smoke' && p.k !== 'puff') { p.vz -= 18 * dt; if (p.z < 0) { p.z = 0; p.vz *= -0.35; p.vx *= 0.6; p.vy *= 0.6; } }
      }
      if (p.vr) p.rot += p.vr * dt;
    }
    mods().forEach(function (m) { if (m && m.update) m.update(dt, s); });
  };

  // ---------- hero hands ----------
  W.heroBackHand = function (s) {
    var h = s.hero;
    return function (c, sh, u, f, skin, sleeve) {
      if (W.throwT > 0) return throwArm(c, sh, u, f, skin, sleeve);
      if (P.WFx3 && P.WFx3.armPose && P.WFx3.armPose(c, sh, u, f, skin, sleeve)) return;
      if (h.weapons.nailgun || h.weapons.nailstorm) return gunArm(c, sh, u, f, skin, sleeve);
      limbI(c, sh.x, sh.y, sh.x - 0.03 * u * f, sh.y + 0.3 * u, sleeve, 0.09 * u);
      dot(c, sh.x - 0.03 * u * f, sh.y + 0.3 * u, 0.055 * u, skin);
    };
  };

  function limbI(c, x0, y0, x1, y1, col, w) {
    c.lineCap = 'round';
    c.strokeStyle = INK; c.lineWidth = w + 3; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  }
  function dot(c, x, y, r, col) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke(); }
  W.limbI = limbI;
  W.dot = dot;

  // Aim in screen radians (y down). Aiming up the screen the shot arm's hand would sit in front of the face, so it slides out past
  // the head, away from the body centre (the back shoulder sits at -f). Ramps smoothly from 17 to 60 degrees above horizontal.
  W.awayShift = function (aim, f, u) {
    var a = Math.max(0, Math.min(1, (-Math.sin(aim) - 0.3) / 0.5));
    return -f * 0.4 * u * a;
  };
  // The same ramp tilts the weapon outward (radians to add to the aim), so it leans away from the head instead of standing on it.
  W.awayTilt = function (aim, f) {
    var a = Math.max(0, Math.min(1, (-Math.sin(aim) - 0.3) / 0.5));
    return -f * 0.24 * a;
  };

  function gunArm(c, sh, u, f, skin, sleeve) {
    var aim = W.sinceFire < 1.2 ? -W.gunA : (f > 0 ? 0.35 : Math.PI - 0.35);
    var kick = W.recoil, side = Math.cos(aim) >= 0 ? 1 : -1, ang = aim - side * kick * 0.35;
    ang += W.awayTilt(ang, f);
    var reach = (0.32 - kick * 0.08) * u, hx = sh.x + Math.cos(ang) * reach + W.awayShift(ang, f, u), hy = sh.y + Math.sin(ang) * reach;
    limbI(c, sh.x, sh.y, hx, hy, sleeve, 0.09 * u);
    c.save(); c.translate(hx, hy); c.rotate(ang); if (side < 0) c.scale(1, -1);
    c.fillStyle = '#E9A23B'; c.strokeStyle = INK; c.lineWidth = 2;
    c.beginPath(); if (c.roundRect) c.roundRect(-0.06 * u, -0.1 * u, 0.42 * u, 0.13 * u, 0.04 * u); else c.rect(-0.06 * u, -0.1 * u, 0.42 * u, 0.13 * u); c.fill(); c.stroke();
    c.fillStyle = '#3A3A3A'; c.fillRect(0.02 * u, 0.02 * u, 0.09 * u, 0.13 * u); c.strokeRect(0.02 * u, 0.02 * u, 0.09 * u, 0.13 * u);
    c.fillStyle = '#B8C0CA'; c.fillRect(0.36 * u, -0.07 * u, 0.07 * u, 0.06 * u);
    c.fillStyle = '#C9A13B'; c.fillRect(0.14 * u, 0.03 * u, 0.16 * u, 0.04 * u);
    c.restore();
    dot(c, hx, hy, 0.055 * u, skin);
  }

  function throwArm(c, sh, u, f, skin, sleeve) {
    var p = 1 - W.throwT / THROW_T, start = -Math.PI / 2 - f * 1.3, end = f > 0 ? 0.2 : Math.PI - 0.2;
    var e = p < 0.5 ? p * 0.6 : 0.3 + (p - 0.5) * 1.4, ang = start + (end - start) * Math.min(1, e);
    var hx = sh.x + Math.cos(ang) * 0.34 * u, hy = sh.y + Math.sin(ang) * 0.34 * u;
    limbI(c, sh.x, sh.y, hx, hy, sleeve, 0.09 * u);
    if (p < 0.55) (W.throwKind === 'bottle' ? bottle : canisterShape)(c, hx, hy - 0.05 * u, u * 0.8, ang);
    dot(c, hx, hy, 0.055 * u, skin);
  }

  function canisterShape(c, X, Y, u, rot, tint) {
    c.save(); c.translate(X, Y); c.rotate(rot);
    c.fillStyle = tint || '#1B4965'; c.strokeStyle = INK; c.lineWidth = 2;
    c.beginPath(); if (c.roundRect) c.roundRect(-0.13 * u, -0.2 * u, 0.26 * u, 0.4 * u, 0.09 * u); else c.rect(-0.13 * u, -0.2 * u, 0.26 * u, 0.4 * u); c.fill(); c.stroke();
    c.fillStyle = '#D7263D'; c.fillRect(-0.13 * u, -0.04 * u, 0.26 * u, 0.08 * u);
    c.fillStyle = '#E9A23B'; c.fillRect(-0.05 * u, -0.29 * u, 0.1 * u, 0.09 * u); c.strokeRect(-0.05 * u, -0.29 * u, 0.1 * u, 0.09 * u);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(-0.09 * u, -0.16 * u, 0.04 * u, 0.3 * u);
    c.restore();
  }
  W.canister = canisterShape;

  // Molotov bottle: green glass, orange fuel, rag wick.
  function bottle(c, X, Y, u, rot) {
    c.save(); c.translate(X, Y); c.rotate(rot);
    c.fillStyle = 'rgba(120,220,140,0.85)'; c.strokeStyle = INK; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-0.07 * u, 0.2 * u); c.lineTo(-0.07 * u, -0.02 * u); c.lineTo(-0.025 * u, -0.12 * u); c.lineTo(-0.025 * u, -0.22 * u);
    c.lineTo(0.025 * u, -0.22 * u); c.lineTo(0.025 * u, -0.12 * u); c.lineTo(0.07 * u, -0.02 * u); c.lineTo(0.07 * u, 0.2 * u); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#E4572E'; c.fillRect(-0.07 * u, 0.02 * u, 0.14 * u, 0.1 * u);
    c.fillStyle = '#C9A13B'; c.fillRect(-0.035 * u, -0.27 * u, 0.07 * u, 0.06 * u); c.strokeRect(-0.035 * u, -0.27 * u, 0.07 * u, 0.06 * u);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(-0.05 * u, -0.08 * u, 0.024 * u, 0.22 * u);
    c.restore();
  }
  W.bottle = bottle;

  // ---------- weapons in the world ----------
  W.drawChain = function (R, s) {
    var h = s.hero, lvl = h.weapons.chain;
    if (!lvl) return;
    var c = R.ctx, lv = P.CFG.weapons.chain.levels[lvl - 1], u = R.ppm, t = performance.now() / 1000;
    var hx = h.x, hy = h.y + 0.55;
    for (var b = 0; b < lv.blades; b++) {
      var a = h.chainA + b * Math.PI * 2 / lv.blades, rad = lv.radius;
      var ex = h.x + Math.cos(a) * rad, ey = h.y + Math.sin(a) * rad;
      for (var k = 9; k >= 1; k--) {   // motion blur: fading arc behind each blade
        var ta = a - k * 0.09;
        c.strokeStyle = 'rgba(230,235,245,' + (0.32 * (1 - k / 10)).toFixed(3) + ')'; c.lineWidth = (0.36 - k * 0.025) * u; c.lineCap = 'round';
        c.beginPath(); c.arc(R.X(h.x), R.Y(h.y), rad * u, -ta, -(ta + 0.09), true); c.stroke();
      }
      var cx = h.x + Math.cos(a - 0.55) * rad * 0.6, cy = h.y + Math.sin(a - 0.55) * rad * 0.6, N = 14;
      for (var i = 1; i <= N; i++) {
        var q = i / N, mx = (1 - q) * (1 - q) * hx + 2 * (1 - q) * q * cx + q * q * ex, my = (1 - q) * (1 - q) * hy + 2 * (1 - q) * q * cy + q * q * ey;
        var tx = 2 * (1 - q) * (cx - hx) + 2 * q * (ex - cx), ty = 2 * (1 - q) * (cy - hy) + 2 * q * (ey - cy);
        c.save(); c.translate(R.X(mx), R.Y(my)); c.rotate(-Math.atan2(ty, tx));
        c.fillStyle = i % 2 ? '#C9CED6' : '#7D848F'; c.strokeStyle = INK; c.lineWidth = 1.4;
        c.beginPath(); c.ellipse(0, 0, 0.075 * u, 0.045 * u, 0, 0, Math.PI * 2); c.fill(); c.stroke();
        c.restore();
      }
      sprocket(c, R.X(ex), R.Y(ey), 0.2 * u, t * 14 + b);
    }
  };

  function sprocket(c, X, Y, r, rot) {
    c.save(); c.translate(X, Y); c.rotate(rot);
    c.fillStyle = '#E9A23B'; c.strokeStyle = INK; c.lineWidth = 2;
    c.beginPath();
    for (var i = 0; i < 20; i++) { var a = i / 20 * Math.PI * 2, rr = i % 2 ? r : r * 1.28; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#7D848F'; c.beginPath(); c.arc(0, 0, r * 0.55, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = INK; for (var k = 0; k < 4; k++) { c.beginPath(); c.arc(Math.cos(k * 1.57) * r * 0.3, Math.sin(k * 1.57) * r * 0.3, r * 0.1, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }
  W.sprocket = sprocket;

  W.drawProjectiles = function (R, s) {
    var c = R.ctx, u = R.ppm;
    c.save(); c.globalCompositeOperation = 'lighter';
    s.nails.forEach(function (n) {
      var sp = Math.hypot(n.vx, n.vy), dx = n.vx / sp, dy = n.vy / sp;
      var g = c.createLinearGradient(R.X(n.x - dx * 1.2), R.Y(n.y - dy * 1.2), R.X(n.x), R.Y(n.y));
      var hot = n.id === 'nailstorm' ? 'rgba(160,255,190,0.9)' : 'rgba(255,230,160,0.9)';
      g.addColorStop(0, 'rgba(255,200,90,0)'); g.addColorStop(1, hot);
      c.strokeStyle = g; c.lineWidth = 3.5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(R.X(n.x - dx * 1.2), R.Y(n.y - dy * 1.2)); c.lineTo(R.X(n.x), R.Y(n.y)); c.stroke();
    });
    c.restore();
    s.nails.forEach(function (n) {
      var sp = Math.hypot(n.vx, n.vy), dx = n.vx / sp, dy = n.vy / sp;
      c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(R.X(n.x - dx * 0.28), R.Y(n.y - dy * 0.28)); c.lineTo(R.X(n.x), R.Y(n.y)); c.stroke();
      c.strokeStyle = '#EEF2F6'; c.lineWidth = 2; c.stroke();
      c.fillStyle = '#EEF2F6'; c.beginPath(); c.arc(R.X(n.x - dx * 0.28), R.Y(n.y - dy * 0.28), 2.2, 0, Math.PI * 2); c.fill();
    });
    s.projs.forEach(function (p) {
      var f = p.t / p.T, x = p.x0 + (p.x1 - p.x0) * f, y = p.y0 + (p.y1 - p.y0) * f, z = 4 * 1.6 * f * (1 - f), tt = performance.now() / 1000;
      c.fillStyle = 'rgba(0,0,0,' + (0.15 + 0.2 * f) + ')'; c.beginPath(); c.ellipse(R.X(x), R.Y(y), 0.2 * u, 0.08 * u, 0, 0, Math.PI * 2); c.fill();
      var pulse = (P.Settings && P.Settings.reduceFlash) ? 0.5 : 0.5 + 0.5 * Math.sin(Math.floor(tt * 3) / 3 * 30);   // colour pulse held to 3 steps a second
      c.setLineDash([6, 5]); c.lineDashOffset = -tt * 30;
      c.strokeStyle = 'rgba(255,' + Math.round(120 + 80 * pulse) + ',60,' + (0.4 + 0.5 * f) + ')'; c.lineWidth = 2.5;
      c.beginPath(); c.arc(R.X(p.x1), R.Y(p.y1), p.lv.blast * u * (1.15 - 0.15 * f), 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
      c.fillStyle = 'rgba(255,77,46,' + (0.08 + 0.12 * f) + ')'; c.fill();
      canisterShape(c, R.X(x), R.Y(y + z), u, p.spin + f * 11, p.id === 'cluster' ? '#7A1E2E' : null);
    });
  };

  W.drawParts = function (R) {
    var c = R.ctx, u = R.ppm;
    W.parts.forEach(function (p) {
      var a = p.t / p.T, X = R.X(p.x), Y = R.Y(p.y + (p.z || 0));
      switch (p.k) {
        case 'speed':
          c.strokeStyle = p.gold ? 'rgba(255,209,102,' + a + ')' : 'rgba(255,255,255,' + a + ')'; c.lineWidth = 2;
          c.beginPath(); c.moveTo(X, Y); c.lineTo(X + Math.cos(-p.a) * p.len * u, Y + Math.sin(-p.a) * p.len * u); c.stroke(); break;
        case 'wind':
          c.strokeStyle = (p.gold ? 'rgba(255,209,102,' : 'rgba(220,240,255,') + (0.5 * a) + ')'; c.lineWidth = 2 + 6 * a;
          c.beginPath(); c.arc(X, Y, p.r * u * (1.2 - 0.2 * a), -p.a1, -p.a0, true); c.stroke(); break;
        case 'chop':
          c.strokeStyle = 'rgba(255,255,255,' + a + ')'; c.lineWidth = 3;
          for (var k = -1; k <= 1; k++) {
            var ox = Math.cos(p.a + Math.PI / 2) * k * 0.18 * u, oy = Math.sin(p.a + Math.PI / 2) * k * 0.18 * u;
            c.beginPath(); c.moveTo(X + ox - Math.cos(p.a) * 0.3 * u, Y + oy - Math.sin(p.a) * 0.3 * u); c.lineTo(X + ox + Math.cos(p.a) * 0.3 * u, Y + oy + Math.sin(p.a) * 0.3 * u); c.stroke();
          }
          break;
        case 'glint': star(c, X, Y, (0.35 * (1 - Math.abs(a - 0.5) * 2) + 0.05) * u, '#FFFFFF', 4); break;
        case 'impact':
          c.strokeStyle = 'rgba(255,190,60,' + a + ')'; c.lineWidth = 3;
          for (var r8 = 0; r8 < 8; r8++) { var ia = r8 * Math.PI / 4 + 0.2, il = (1 - a) * 0.5 * u + 0.25 * u; c.beginPath(); c.moveTo(X + Math.cos(ia) * 0.1 * u, Y + Math.sin(ia) * 0.1 * u); c.lineTo(X + Math.cos(ia) * il, Y + Math.sin(ia) * il); c.stroke(); }
          star(c, X, Y, 0.3 * u * (0.6 + a), 'rgba(255,220,120,' + a + ')', 5); break;
        case 'slash':
          c.strokeStyle = 'rgba(255,255,255,' + a + ')'; c.lineWidth = 4 * a + 1;
          c.beginPath(); c.moveTo(X - Math.cos(-p.a) * 0.35 * u, Y - Math.sin(-p.a) * 0.35 * u); c.lineTo(X + Math.cos(-p.a) * 0.35 * u, Y + Math.sin(-p.a) * 0.35 * u); c.stroke(); break;
        case 'ping': star(c, X, Y, 0.22 * u * (1.2 - a * 0.5), 'rgba(255,255,220,' + a + ')', 4); break;
        case 'stuck':
          c.strokeStyle = 'rgba(220,226,234,' + Math.min(1, a * 2) + ')'; c.lineWidth = 2;
          var sx = R.X(p.x + p.ox), sy = R.Y(p.y + p.oz);
          c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx - Math.cos(-p.a) * 0.15 * u, sy - Math.sin(-p.a) * 0.15 * u); c.stroke(); break;
        case 'mflash':
          c.save(); c.translate(X, Y); c.rotate(-p.a);
          c.fillStyle = 'rgba(255,240,170,' + a + ')'; c.beginPath();
          for (var m = 0; m < 10; m++) { var ma = m / 10 * Math.PI * 2, mr = (m % 2 ? 0.45 : 1) * p.r * u * (0.7 + 0.5 * a); c.lineTo(Math.cos(ma) * mr, Math.sin(ma) * mr * 0.6); }
          c.closePath(); c.fill(); c.restore(); break;
        case 'casing':
          c.save(); c.translate(X, Y); c.rotate(p.rot); c.fillStyle = '#D9A23B'; c.strokeStyle = INK; c.lineWidth = 1.2;
          c.fillRect(-0.05 * u, -0.025 * u, 0.1 * u, 0.05 * u); c.strokeRect(-0.05 * u, -0.025 * u, 0.1 * u, 0.05 * u); c.restore(); break;
        case 'fleck': c.fillStyle = 'rgba(233,162,59,' + a + ')'; c.fillRect(X - 1.5, Y - 1.5, 3, 3); break;
        case 'spark': c.strokeStyle = 'rgba(255,170,60,' + a + ')'; c.lineWidth = 2; c.beginPath(); c.moveTo(X, Y); c.lineTo(X - p.vx * 3, Y + p.vy * 3 - p.vz * 3); c.stroke(); break;
        case 'debris':
          c.save(); c.translate(X, Y); c.rotate(p.rot); c.fillStyle = '#2A2C35'; c.strokeStyle = INK; c.lineWidth = 1.5;
          c.fillRect(-0.06 * u, -0.04 * u, 0.12 * u, 0.08 * u); c.restore(); break;
        case 'smoke':
          c.fillStyle = 'rgba(70,72,82,' + (0.5 * a) + ')';
          c.beginPath(); c.arc(X, Y, p.r * u * (1.8 - a), 0, Math.PI * 2); c.fill(); break;
        case 'puff': c.fillStyle = 'rgba(235,240,245,' + (0.5 * a) + ')'; c.beginPath(); c.arc(X, Y, p.r * u * (1.6 - a), 0, Math.PI * 2); c.fill(); break;
      }
    });
    c.save(); c.globalCompositeOperation = 'lighter';
    W.parts.forEach(function (p) {
      var a = p.t / p.T, X = R.X(p.x), Y = R.Y(p.y);
      if (p.k === 'fire') {
        var g = c.createRadialGradient(X, Y, 0, X, Y, p.r * u * (1.6 - a * 0.6));
        g.addColorStop(0, 'rgba(255,250,200,' + a + ')'); g.addColorStop(0.4, 'rgba(255,170,40,' + (0.9 * a) + ')'); g.addColorStop(1, 'rgba(220,40,10,0)');
        c.fillStyle = g; c.beginPath(); c.arc(X, Y, p.r * u * (1.6 - a * 0.6), 0, Math.PI * 2); c.fill();
      } else if (p.k === 'shock') {
        c.strokeStyle = 'rgba(' + p.col + ',' + a + ')'; c.lineWidth = 2 + 8 * a;
        c.beginPath(); c.arc(X, Y, p.r * u * (1 - a * a), 0, Math.PI * 2); c.stroke();
      } else if (p.k === 'ray') {
        var len = (1 - a) * 4 * u, ang = -p.a + (1 - a) * 0.6;
        c.strokeStyle = 'rgba(255,220,130,' + (a * 0.7) + ')'; c.lineWidth = 6 * a;
        c.beginPath(); c.moveTo(X + Math.cos(ang) * len * 0.3, Y + Math.sin(ang) * len * 0.3); c.lineTo(X + Math.cos(ang) * len, Y + Math.sin(ang) * len); c.stroke();
      }
    });
    c.restore();
  };

  function star(c, X, Y, r, col, n) {
    c.fillStyle = col; c.beginPath();
    for (var i = 0; i < n * 2; i++) { var a = i / (n * 2) * Math.PI * 2 + Math.PI / 4, rr = i % 2 ? r * 0.22 : r; c.lineTo(X + Math.cos(a) * rr, Y + Math.sin(a) * rr); }
    c.closePath(); c.fill();
  }
  W.star = star;

  // Milestone / mode banner in screen space: pops in, holds, fades out. Shared with SkillsFx.
  W.banner = function (c, R, key, t, T, yFrac, col) {
    var k = 1 - t / T, sc = k < 0.15 ? 2.2 - k / 0.15 * 1.2 : 1, al = t < 0.3 ? t / 0.3 : 1;
    c.save(); c.translate(R.W / 2, R.H * yFrac); c.rotate(-0.08); c.scale(sc, sc); c.globalAlpha = al;
    c.font = 'italic 900 52px "CM Bangers", Bangers, Impact, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineWidth = 10; c.strokeStyle = INK; c.strokeText(P.t(key), 0, 0); c.fillStyle = col || '#FFD166'; c.fillText(P.t(key), 0, 0);
    c.restore();
  };

  // v0.7: the canvas combo counter and its milestone banners are gone (the HUD streak meter replaces them).
  // The function stays so existing callers keep working.
  W.drawCombo = function () {};

  return W;
})();
