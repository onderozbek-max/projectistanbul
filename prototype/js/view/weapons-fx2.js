// Heavy, fire and sky visuals (workstream E1). Sledgehammer: target reticle + hammer arc (anticipation, swing,
// impact), crater cracks, shock rings, dust and debris. Molotov: arcing bottle, glass burst, fire pools with
// flicker and embers. Fireworks: homing rocket trails and coloured bursts. Wedding Finale: falling rockets over a
// gold zone. Reads P.Weapons.state(s) every frame; events only start one-shot effects. Shared particles: P.WFx.add.
// Sledge windup and fire pools are drawn here; WFx3 (cable, spear, extinguisher, cleaver, cyclone) draws through
// drawGround / drawAir below.
P.WFx2 = (function () {
  var M = {}, cracks = [], sparks = [], flashes = [], zones = [];
  var INK = '#14151F', RGB = ['255,77,109', '255,209,102', '6,214,160', '76,201,240', '179,136,255', '255,158,0'];
  var MAX_SPARKS = 220, MAX_CRACKS = 24, MAX_FLASH = 12;
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function ease(q) { return 1 - Math.pow(1 - q, 3); }

  M.reset = function () { cracks = []; sparks = []; flashes = []; zones = []; };

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
      case 'sledgeSlam': slam(ev, pn); break;
      case 'flaskThrow': P.Sfx.play('molotovThrow', 90, { pan: pn }); break;
      case 'flaskShatter': shatter(ev, pn); break;
      case 'poolBurn': burstSparks(ev.x, ev.y, 3, 1.5, '255,170,60', 0.6, 2); P.Sfx.play('burn', 200, { pan: pn }); break;
      case 'rocketLaunch':
        P.WFx.add({ k: 'puff', x: ev.x, y: ev.y, z: 0.1, vz: 0.8, vx: 0, vy: 0, r: 0.2, t: 0.4, T: 0.4 });
        P.Sfx.play('rocketLaunch', 60, { pan: pn }); P.Sfx.play('rocketWhistle', 150, { pan: pn });
        break;
      case 'rocketBurst': burst(ev, pn); break;
      case 'finaleStart': startFinale(ev, s); break;
    }
  };

  function slam(ev, pn) {
    var i, a, sp;
    cracks.push({ x: ev.x, y: ev.y, r: ev.r, a: rnd(0, 6), t: 6, T: 6 });
    if (cracks.length > MAX_CRACKS) cracks.shift();
    P.WFx.add({ k: 'shock', x: ev.x, y: ev.y, r: ev.r * 1.3, t: 0.35, T: 0.35, col: '255,255,255' });
    P.WFx.add({ k: 'shock', x: ev.x, y: ev.y, r: ev.r * 1.9, t: 0.5, T: 0.5, col: '255,170,70' });
    for (i = 0; i < 8; i++) {
      a = rnd(0, Math.PI * 2);
      P.WFx.add({ k: 'puff', x: ev.x + Math.cos(a) * ev.r * 0.5, y: ev.y + Math.sin(a) * ev.r * 0.5, z: 0.2,
        vx: Math.cos(a) * 1.2, vy: Math.sin(a) * 1.2, vz: rnd(0.5, 1.2), r: rnd(0.2, 0.34), t: rnd(0.6, 1), T: 1 });
    }
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
    var big = !!ev.big, rgb = RGB[(ev.col || 0) % RGB.length];
    flashes.push({ x: ev.x, y: ev.y, r: ev.r * (big ? 2.4 : 1.6), rgb: rgb, t: big ? 0.3 : 0.18, T: big ? 0.3 : 0.18 });
    if (flashes.length > MAX_FLASH) flashes.shift();
    burstSparks(ev.x, ev.y, big ? 28 : 14, big ? 6 : 4, rgb, big ? 0.9 : 0.6, big ? 2 : 1);
    P.WFx.add({ k: 'shock', x: ev.x, y: ev.y, r: ev.r * 1.1, t: 0.3, T: 0.3, col: rgb });
    P.Sfx.play('rocketBoom', 50, { pan: pn });
    if (big) P.Fx.addTrauma(0.35);
  }

  function startFinale(ev, s) {
    var L = P.Weapons.level(s.hero, 'finale') || { spanX: 0, spanY: 0 };
    zones.push({ x: s.hero.x, y: s.hero.y, sx: L.spanX, sy: L.spanY, t: ev.T, T: ev.T });
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
    flashes.forEach(function (f) { f.t -= dt; });
    flashes = flashes.filter(function (f) { return f.t > 0; });
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
    st.slams.forEach(function (sl) { drawReticle(c, R, sl, u); });
    c.restore();
    if (P.WFx3 && P.WFx3.drawGround) P.WFx3.drawGround(R, s);
  };

  function drawZone(c, R, z, u, t) {
    var a = Math.min(1, z.t / z.T * 3) * 0.7;
    c.strokeStyle = 'rgba(255,209,102,' + a.toFixed(3) + ')'; c.lineWidth = 2; c.setLineDash([8, 6]); c.lineDashOffset = -t * 20;
    c.strokeRect(R.X(z.x - z.sx), R.Y(z.y + z.sy), (2 * z.sx) * u, (1.4 * z.sy) * u);
    c.setLineDash([]);
  }

  function drawCrack(c, R, k, u) {
    var X = R.X(k.x), Y = R.Y(k.y), a = Math.min(1, k.t) * 0.6, i, ang, len;
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
    var X = R.X(q.x), Y = R.Y(q.y), rr = q.r * u, life = Math.min(1, q.t / 0.8), k, N = 7, ang, d, fx, fy, h, w;
    var g = c.createRadialGradient(X, Y, 0, X, Y, rr);
    g.addColorStop(0, 'rgba(255,150,40,' + (0.45 * life).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,60,10,0)');
    c.fillStyle = g; c.beginPath(); c.ellipse(X, Y, rr, rr * 0.5, 0, 0, Math.PI * 2); c.fill();
    c.globalCompositeOperation = 'lighter';
    for (k = 0; k < N; k++) {
      ang = k / N * Math.PI * 2 + t * 0.6; d = rr * (0.3 + 0.35 * ((k * 0.37) % 1));
      fx = X + Math.cos(ang) * d; fy = Y + Math.sin(ang) * d * 0.5;
      h = rr * (0.32 + 0.12 * Math.sin(t * 11 + k * 2.1)); w = rr * 0.12;
      c.fillStyle = 'rgba(255,140,40,' + (0.85 * life).toFixed(3) + ')';
      c.beginPath(); c.moveTo(fx - w, fy); c.quadraticCurveTo(fx, fy - h * 1.3, fx, fy - h);
      c.quadraticCurveTo(fx + w * 0.4, fy - h * 0.4, fx + w, fy); c.fill();
    }
    c.globalCompositeOperation = 'source-over';
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
    st.slams.forEach(function (sl) { drawHammer(c, R, s, sl, u); });
    st.flasks.forEach(function (f) { drawFlask(c, R, f, u, t); });
    st.rockets.forEach(function (r) { drawRocket(c, R, r, u); });
    st.finale.forEach(function (f) { drawSkyRocket(c, R, f, u); });
    c.save(); c.globalCompositeOperation = 'lighter';
    flashes.forEach(function (f) { drawFlash(c, R, f, u); });
    sparks.forEach(function (p) { drawSpark(c, R, p, u); });
    c.restore();
    if (P.WFx3 && P.WFx3.drawAir) P.WFx3.drawAir(R, s);
  };

  // Anticipation (0-0.7: raise the head back), then the swing (0.7-1: forward to the impact point).
  function drawHammer(c, R, s, sl, u) {
    var h = s.hero, p = Math.min(1, 1 - sl.t / sl.T), aim = Math.atan2(sl.y - h.y, sl.x - h.x), off, L = 0.95;
    off = p < 0.7 ? -2.6 * ease(p / 0.7) : -2.6 * (1 - ease((p - 0.7) / 0.3));
    var th = aim + off, sx = R.X(h.x), sy = R.Y(h.y + 0.2), hx = R.X(h.x + Math.cos(th) * L), hy = R.Y(h.y + 0.2 + Math.sin(th) * L);
    if (p > 0.7) {
      c.strokeStyle = 'rgba(255,255,255,' + (0.5 * (p - 0.7) / 0.3).toFixed(3) + ')'; c.lineWidth = 6;
      c.beginPath(); c.arc(sx, sy, L * u, -th, -th + 0.8, false); c.stroke();
    }
    c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(sx, sy); c.lineTo(hx, hy); c.stroke();
    c.strokeStyle = '#7A5230'; c.lineWidth = 3; c.stroke();
    c.save(); c.translate(hx, hy); c.rotate(-th);
    c.fillStyle = '#4A4F59'; c.strokeStyle = INK; c.lineWidth = 2.5;
    c.fillRect(-0.12 * u, -0.22 * u, 0.24 * u, 0.44 * u); c.strokeRect(-0.12 * u, -0.22 * u, 0.24 * u, 0.44 * u);
    c.fillStyle = '#A7AFBB'; c.fillRect(-0.08 * u, -0.18 * u, 0.06 * u, 0.36 * u);
    c.restore();
  }

  function drawFlask(c, R, f, u, t) {
    var pos = flaskPos(f), X = R.X(pos.x), Y = R.Y(pos.y), fl = 0.5 + 0.5 * Math.sin(t * 40);
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

  function drawFlash(c, R, f, u) {
    var a = f.t / f.T, X = R.X(f.x), Y = R.Y(f.y), rr = f.r * u * (1.2 - 0.2 * a);
    var g = c.createRadialGradient(X, Y, 0, X, Y, rr);
    g.addColorStop(0, 'rgba(255,255,255,' + (0.55 * a).toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + f.rgb + ',0)');
    c.fillStyle = g; c.beginPath(); c.arc(X, Y, rr, 0, Math.PI * 2); c.fill();
  }

  function drawSpark(c, R, p, u) {
    var a = Math.min(1, p.t / p.T), X = R.X(p.x), Y = R.Y(p.y + p.z);
    c.strokeStyle = 'rgba(' + p.rgb + ',' + (a * 0.9).toFixed(3) + ')'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(X, Y); c.lineTo(X - p.vx * 0.05 * u, Y + (p.vy + p.vz) * 0.05 * u); c.stroke();
  }

  return M;
})();
