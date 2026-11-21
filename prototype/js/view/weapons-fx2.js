// Heavy, fire and sky visuals (workstream E1). Sledgehammer: target reticle, crater cracks, shock rings,
// dust and debris. Molotov: arcing bottle, glass burst, fire pools with
// flicker and embers. Fireworks: homing rocket trails and coloured bursts. Wedding Finale: falling rockets over a
// gold zone. Reads P.Weapons.state(s) every frame; events only start one-shot effects. Shared particles: P.WFx.add.
// Sledge windup and fire pools are drawn here; WFx3 (cable, spear, extinguisher, cleaver, cyclone) draws through
// drawGround / drawAir below.
P.WFx2 = (function () {
  var M = {}, cracks = [], sparks = [], fireworks = [], zones = [];
  var INK = '#14151F', RGB = ['255,77,109', '255,209,102', '6,214,160', '76,201,240', '179,136,255', '255,158,0'];
  var MAX_SPARKS = 220, MAX_CRACKS = 24, MAX_BURSTS = 12;
  function rnd(a, b) { return a + Math.random() * (b - a); }

  M.reset = function () { cracks = []; sparks = []; fireworks = []; zones = []; };

  function spark(p) {
    if (sparks.length >= MAX_SPARKS) sparks.shift();
    p.g = p.g === undefined ? 9 : p.g; p.z = p.z || 0; p.vz = p.vz || 0;
    sparks.push(p);
  }
  function burstSparks(x, y, n, speed, rgb, life, up) {
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2 + rnd(-0.12, 0.12), sp = rnd(speed * 0.5, speed);
      spark({ x: x, y: y, z: 0, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: up ? rnd(0, up) : 0, t: life * rnd(0.7, 1), T: life, rgb: rgb });
    }
  }
  function flaskPos(f) {
    var q = Math.min(1, f.t / f.T);
    return { q: q, x: f.x0 + (f.x1 - f.x0) * q, y: f.y0 + (f.y1 - f.y0) * q, z: 4 * 2.2 * q * (1 - q) };
  }

  // ---------- events ----------
  M.onEvent = function (ev, s) {
    var pn = P.WFx.pan(s, ev.x !== undefined ? ev.x : s.hero.x);
    switch (ev.type) {
      case 'sledgeSlam': slam(ev, pn, s); break;
      case 'flaskThrow': P.Sfx.play('molotovThrow', 90, { pan: pn }); break;
      case 'flaskShatter': shatter(ev, pn); break;
      case 'poolBurn': burstSparks(ev.x, ev.y, 3, 1.5, '255,170,60', 0.6, 2); P.Sfx.play('burn', 200, { pan: pn }); break;
      case 'rocketLaunch':
        P.Sfx.play('rocketLaunch', 60, { pan: pn }); P.Sfx.play('rocketWhistle', 150, { pan: pn });
        break;
      case 'rocketBurst': burst(ev, pn); break;
      case 'finaleStart': startFinale(ev, s); break;
    }
  };

  function slam(ev, pn, s) {
    var i, a, sp;
    var grade = ev.variant === 'blacksmith' ? 6 : s.hero.weapons.sledge || 1;
    cracks.push({ x: ev.x, y: ev.y, r: ev.r, a: rnd(0, 6), t: 6, T: 6, swingLife: 0.36 + grade * 0.066, grade: grade });
    if (cracks.length > MAX_CRACKS) cracks.shift();
    for (i = 0; i < 8; i++) {
      a = rnd(0, Math.PI * 2); sp = rnd(3, 6);
      P.WFx.add({ k: 'debris', x: ev.x, y: ev.y, z: 0.1, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: rnd(4, 7),
        rot: rnd(0, 6), vr: rnd(-16, 16), t: 0.8, T: 0.8 });
    }
    burstSparks(ev.x, ev.y, 10, 4, '255,209,102', 0.45, 3);
    P.Fx.addTrauma(ev.heavy ? 0.45 : 0.25);
    P.Sfx.play('hammer', 60, { pan: pn });
  }

  function shatter(ev, pn) {
    var i, a, sp;
    P.WFx.add({ k: 'shock', x: ev.x, y: ev.y, r: ev.r * 0.9, t: 0.3, T: 0.3, col: '255,140,60' });
    for (i = 0; i < 4; i++) {
      P.WFx.add({ k: 'fire', x: ev.x + rnd(-0.5, 0.5) * ev.r, y: ev.y + rnd(-0.5, 0.5) * ev.r, r: ev.r * rnd(0.4, 0.6), t: rnd(0.3, 0.5), T: 0.5 });
    }
    for (i = 0; i < 12; i++) {
      a = rnd(0, Math.PI * 2); sp = rnd(2, 5);
      P.WFx.add({ k: i % 3 ? 'fleck' : 'debris', x: ev.x, y: ev.y, z: 0.3, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        vz: rnd(3, 6), rot: rnd(0, 6), vr: rnd(-20, 20), t: 0.6, T: 0.6 });
    }
    P.Sfx.play('molotovBurst', 80, { pan: pn });
  }

  function burst(ev, pn) {
    var big = !!ev.big, grade = big ? 6 : ev.stage || 1, life = 0.47 + grade * 0.083;
    fireworks.push({ x: ev.x, y: ev.y, r: ev.r, col: ev.col || 0, grade: grade, t: life, T: life });
    if (fireworks.length > MAX_BURSTS) fireworks.shift();
    P.Sfx.play('rocketBoom', 50, { pan: pn });
    if (big) P.Fx.addTrauma(0.35);
  }

  function startFinale(ev, s) {
    var L = P.Weapons.level(s.hero, 'finale') || { spanX: 0, spanY: 0 };
    zones.push({ x: s.hero.x, y: s.hero.y, sx: ev.spanX !== undefined ? ev.spanX : L.spanX,
      sy: ev.spanY !== undefined ? ev.spanY : L.spanY, t: ev.T, T: ev.T });
    if (zones.length > 4) zones.shift();
    P.Sfx.play('finale', 300);
  }

  // ---------- per-frame state and emitters ----------
  M.update = function (dt, s) {
    var i;
    for (i = sparks.length - 1; i >= 0; i--) {
      var p = sparks[i];
      p.t -= dt;
      if (p.t <= 0) { sparks.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vz -= p.g * dt;
      if (p.z < 0) { p.z = 0; p.vz = 0; p.vx *= 0.5; p.vy *= 0.5; }
    }
    fireworks.forEach(function (f) { f.t -= dt; });
    fireworks = fireworks.filter(function (f) { return f.t > 0; });
    cracks.forEach(function (k) { k.t -= dt; });
    cracks = cracks.filter(function (k) { return k.t > 0; });
    zones.forEach(function (z) { z.t -= dt; });
    zones = zones.filter(function (z) { return z.t > 0; });
    if (s) emit(dt, s);
  };

  function emit(dt, s) {
    var st = P.Weapons.state(s);
    st.pools.forEach(function (q) {
      if (Math.random() < dt * 9) spark({ x: q.x + rnd(-q.r, q.r) * 0.7, y: q.y + rnd(-q.r, q.r) * 0.7, z: 0.2,
        vx: rnd(-0.2, 0.2), vy: rnd(-0.2, 0.2), vz: rnd(1.2, 2.2), g: 1.2, t: rnd(0.6, 1), T: 1, rgb: '255,170,60' });
    });
    st.flasks.forEach(function (f) {
      if (Math.random() < dt * 30) { var fp = flaskPos(f); spark({ x: fp.x, y: fp.y, z: fp.z, vx: 0, vy: 0, vz: 0.4, g: 0, t: 0.3, T: 0.3, rgb: '255,140,40' }); }
    });
    st.rockets.forEach(function (r) {
      if (Math.random() < dt * 40) spark({ x: r.x, y: r.y, z: 0, vx: rnd(-0.6, 0.6), vy: rnd(-0.6, 0.6), vz: rnd(-0.3, 0.6), g: 2, t: 0.4, T: 0.4, rgb: RGB[r.col % RGB.length] });
    });
    st.finale.forEach(function (f) {
      if (f.t >= 0 && Math.random() < dt * 30) spark({ x: f.x, y: f.y, z: 9 * (1 - f.t / f.T), vx: 0, vy: 0, vz: 0.5, g: 1, t: 0.35, T: 0.35, rgb: RGB[f.col % RGB.length] });
    });
  }

  // ---------- ground layer: reticles, cracks, fire pools, finale zone ----------
  M.drawGround = function (R, s) {
    var c = R.ctx, u = R.ppm, t = performance.now() / 1000, st = P.Weapons.state(s);
    c.save();
    zones.forEach(function (z) { drawZone(c, R, z, u, t); });
    cracks.forEach(function (k) { drawCrack(c, R, k, u); });
    st.pools.forEach(function (q) { drawPool(c, R, q, u, t); });
    st.slams.forEach(function (sl) {
      if(sl.ground)groundPulse(c,R,sl,u);
      else if (sl.src !== 'sledge' || !P.WTier || !P.WTier.enabled) drawReticle(c, R, sl, u);
    });
    c.restore();
    if (P.WFx3 && P.WFx3.drawGround) P.WFx3.drawGround(R, s);
    if (P.WFx4 && P.WFx4.drawGround) P.WFx4.drawGround(R, s);
    if (P.WTier) P.WTier.drawGround(R, s);
  };

  function groundPulse(c,R,sl,u){
    var p=Math.max(0,Math.min(1,1-sl.t/(sl.T||1))),g=sl.ground,dx=sl.x-g.x,dy=sl.y-g.y;
    var x=g.x+dx*p,y=g.y+dy*p,a=Math.atan2(dy,dx),width=.14+(sl.lv.r||1)*.09;
    c.save();c.lineCap='round';c.beginPath();
    for(var i=0;i<7;i++){var t=Math.max(0,p-i*.032),j=(i%2?1:-1)*.055;
      var px=R.X(g.x+dx*t-Math.sin(a)*j),py=R.Y(g.y+dy*t+Math.cos(a)*j);if(!i)c.moveTo(px,py);else c.lineTo(px,py);}
    c.strokeStyle='#332C35';c.lineWidth=.16*u;c.stroke();c.strokeStyle='#F9D990';c.lineWidth=.065*u;c.stroke();
    c.beginPath();c.ellipse(R.X(x),R.Y(y),width*u,width*.44*u,-a,0,Math.PI*2);
    c.strokeStyle='#FFF0C6';c.lineWidth=.07*u;c.stroke();c.restore();
  }

  function drawZone(c, R, z, u, t) {
    var a = Math.min(1, z.t / z.T * 3) * 0.7;
    c.strokeStyle = 'rgba(255,209,102,' + a.toFixed(3) + ')'; c.lineWidth = 2; c.setLineDash([8, 6]); c.lineDashOffset = -t * 20;
    c.strokeRect(R.X(z.x - z.sx), R.Y(z.y + z.sy), (2 * z.sx) * u, (1.4 * z.sy) * u);
    c.setLineDash([]);
  }

  function drawCrack(c, R, k, u) {
    var X = R.X(k.x), Y = R.Y(k.y), a = Math.min(1, k.t) * 0.6, i, ang, len;
    var phase = (k.T - k.t) / 0.38;
    if (phase < 1) {
      var r = k.r * u * (0.46 + phase * 0.63);
      c.strokeStyle = 'rgba(203,161,105,' + ((1 - phase) * 0.64).toFixed(3) + ')'; c.lineWidth = 2;
      c.beginPath(); c.ellipse(X, Y, r, 0.55 * r, 0, 0, Math.PI * 2); c.stroke();
    }
    c.strokeStyle = 'rgba(20,21,31,' + a.toFixed(3) + ')'; c.lineWidth = 2;
    c.beginPath();
    for (i = 0; i < 6; i++) {
      ang = k.a + i * Math.PI / 3; len = k.r * u * (0.6 + 0.4 * ((i * 7) % 3) / 2);
      c.moveTo(X, Y); c.lineTo(X + Math.cos(ang) * len * 0.5, Y + Math.sin(ang) * len * 0.25);
      c.lineTo(X + Math.cos(ang + 0.2) * len, Y + Math.sin(ang + 0.2) * len * 0.5);
    }
    c.stroke();
  }

  function drawPool(c, R, q, u, t) {
    var X = R.X(q.x), Y = R.Y(q.y), rr = q.r * u, life = Math.min(1, q.t / 0.8);
    var still = P.Settings && (P.Settings.reduceMotion || P.Settings.reduceFlash);
    var count = q.r > 2.5 ? 8 : 5, i, x, y, h, w, bend;
    if (still) t = 0;
    c.save(); c.globalAlpha *= life;
    c.beginPath(); c.ellipse(X, Y, rr, rr * 0.48, 0, 0, Math.PI * 2);
    c.fillStyle = 'rgba(86,29,27,0.45)'; c.fill(); c.strokeStyle = 'rgba(251,95,39,0.7)'; c.lineWidth = 2; c.stroke();
    for (i = 0; i < count; i++) {
      x = X + rr * (i / (count - 1) - 0.5) * 1.45;
      y = Y + rr * (0.13 + 0.14 * Math.sin(i * 5));
      h = rr * (0.26 + 0.11 * Math.sin(t * 4 + i * 2.1)); w = rr * 0.11;
      bend = w * Math.sin(t * 3 + i * 2.6);
      c.fillStyle = '#E94C28'; P.FireAnimPrim.tongue(c, x, y, w, h, bend);
      c.fillStyle = '#FFB74A'; P.FireAnimPrim.tongue(c, x, y, w * 0.62, h * 0.66, bend * 0.55);
      c.fillStyle = '#FFE3A0'; P.FireAnimPrim.tongue(c, x, y, w * 0.28, h * 0.31, bend * 0.25);
    }
    c.restore();
  }

  function drawReticle(c, R, sl, u) {
    var X = R.X(sl.x), Y = R.Y(sl.y), p = 1 - sl.t / sl.T, rr = sl.lv.r * u, shrink = rr * (1 + 1.4 * (1 - p));
    c.fillStyle = 'rgba(215,38,61,' + (0.12 + 0.18 * p).toFixed(3) + ')';
    c.beginPath(); c.ellipse(X, Y, rr, rr * 0.5, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(255,90,80,' + (0.5 + 0.4 * p).toFixed(3) + ')'; c.lineWidth = 3; c.setLineDash([6, 5]);
    c.beginPath(); c.ellipse(X, Y, rr, rr * 0.5, 0, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
    c.lineWidth = 2; c.beginPath(); c.ellipse(X, Y, shrink, shrink * 0.5, 0, 0, Math.PI * 2); c.stroke();
  }

  // ---------- air layer: hammer, bottles, rockets, finale barrage, sparks ----------
  M.drawAir = function (R, s) {
    var c = R.ctx, u = R.ppm, t = performance.now() / 1000, st = P.Weapons.state(s);
    st.flasks.forEach(function (f) { drawFlask(c, R, f, u, t); });
    if (!P.WTier || !P.WTier.enabled) st.rockets.forEach(function (r) { drawRocket(c, R, r, u); });
    st.finale.forEach(function (f) { drawSkyRocket(c, R, f, u); });
    c.save();
    if (P.WSil && P.WSil.drawFirework) fireworks.forEach(function (f) { P.WSil.drawFirework(c, R, f); });
    if (P.WSil && P.WSil.drawHammer) cracks.forEach(function (k) {
      var remaining = k.t - (k.T - k.swingLife);
      if (remaining > 0) P.WSil.drawHammer(c, R, { x: k.x, y: k.y, r: k.r, grade: k.grade, t: remaining, T: k.swingLife });
    });
    c.globalCompositeOperation = 'lighter';
    sparks.forEach(function (p) { drawSpark(c, R, p, u); });
    c.restore();
    if (P.WTier) P.WTier.drawAir(R, s);
    if (P.WFx3 && P.WFx3.drawAir) P.WFx3.drawAir(R, s);
    if (P.WFx4 && P.WFx4.drawAir) P.WFx4.drawAir(R, s);
    if (P.WAttackCues) P.WAttackCues.drawAir(R);
  };

  function drawFlask(c, R, f, u, t) {
    var pos = flaskPos(f), X = R.X(pos.x), Y = R.Y(pos.y), fl = 0.5 + 0.5 * Math.sin(Math.floor(t * 3) / 3 * 40);   // flame flicker held to 3 steps a second
    c.fillStyle = 'rgba(0,0,0,' + (0.15 + 0.2 * pos.q).toFixed(3) + ')';
    c.beginPath(); c.ellipse(X, Y, 0.2 * u, 0.08 * u, 0, 0, Math.PI * 2); c.fill();
    var by = R.Y(pos.y + pos.z);
    P.WFx.bottle(c, X, by, u, f.spin + pos.q * 12);
    c.fillStyle = 'rgba(255,170,60,' + (0.7 + 0.3 * fl).toFixed(3) + ')';
    c.beginPath(); c.moveTo(X - 0.05 * u, by - 0.3 * u); c.quadraticCurveTo(X, by - (0.4 + 0.12 * fl) * u, X + 0.05 * u, by - 0.3 * u); c.fill();
  }

  function drawRocket(c, R, r, u) {
    var rgb = RGB[r.col % RGB.length], i, q, n = r.trail.length, X = R.X(r.x), Y = R.Y(r.y);
    c.save(); c.globalCompositeOperation = 'lighter';
    for (i = 0; i < n; i++) {
      q = r.trail[i]; c.fillStyle = 'rgba(' + rgb + ',' + ((i + 1) / n * 0.6).toFixed(3) + ')';
      c.beginPath(); c.arc(R.X(q.x), R.Y(q.y), (0.05 + 0.1 * (i + 1) / n) * u, 0, Math.PI * 2); c.fill();
    }
    var g = c.createRadialGradient(X, Y, 0, X, Y, 0.35 * u);
    g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.3, 'rgba(' + rgb + ',0.7)'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
    c.fillStyle = g; c.beginPath(); c.arc(X, Y, 0.35 * u, 0, Math.PI * 2); c.fill();
    c.restore();
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(X, Y); c.lineTo(X - Math.cos(r.a) * 0.3 * u, Y + Math.sin(r.a) * 0.3 * u); c.stroke();
  }

  // Finale rocket: falls from above (z = 9 * remaining), trail stacks upward, shadow grows as it lands.
  function drawSkyRocket(c, R, f, u) {
    if (f.t < 0) return;
    var q = Math.min(1, f.t / f.T), z = 9 * (1 - q), X = R.X(f.x), Y = R.Y(f.y), rgb = RGB[f.col % RGB.length], k;
    c.fillStyle = 'rgba(0,0,0,' + (0.12 + 0.25 * q).toFixed(3) + ')';
    c.beginPath(); c.ellipse(X, Y, (0.25 + 0.2 * q) * u, (0.1 + 0.08 * q) * u, 0, 0, Math.PI * 2); c.fill();
    c.save(); c.globalCompositeOperation = 'lighter';
    for (k = 1; k <= 5; k++) {
      c.fillStyle = 'rgba(' + rgb + ',' + ((1 - k / 6) * 0.5).toFixed(3) + ')';
      c.beginPath(); c.arc(X, R.Y(f.y + z + k * 0.5), (0.22 - k * 0.03) * u, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = 'rgba(255,255,255,0.95)'; c.beginPath(); c.arc(X, R.Y(f.y + z), 0.12 * u, 0, Math.PI * 2); c.fill();
    c.restore();
  }

  function drawSpark(c, R, p, u) {
    var a = Math.min(1, p.t / p.T), X = R.X(p.x), Y = R.Y(p.y + p.z);
    c.strokeStyle = 'rgba(' + p.rgb + ',' + (a * 0.9).toFixed(3) + ')'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(X, Y); c.lineTo(X - p.vx * 0.05 * u, Y + (p.vy + p.vz) * 0.05 * u); c.stroke();
  }

  return M;
})();
