// Visuals for the v0.5 arsenal depth (workstream A). Tea tray: a flying brass disc with glasses, glass burst on catch.
// Simit tray: spinning sesame rings. Cezve: steam cone, stain sizzle. Olta: hook line, reel puffs, slam.
// Umbrella: canopy sector, shove flecks, spit reflect. Tavla: ricocheting chips, doubles flash. Kestane: ember
// warnings that shrink onto the landing point, falling embers, landings. Mod pops (usta, shards, chain, stick,
// echo, cloud). Mastery moves: screen lettering plus one shape per family (ring, spin, quake, lake, triple, boil,
// leviathan, doubles, boost on the ground; rain, storm, shower, swarm, dome in the air).
// Reads P.Weapons.state(s) every frame; events only start one-shot effects. Shared particles: P.WFx.add.
// Own timed effects (fx): sizzle, cloud, mastery. Called from P.WFx2.drawGround / drawAir (world space).
P.WFx4 = (function () {
  var M = {}, INK = '#14151F', TAU = Math.PI * 2, MAX_FX = 40, MAX_WARN = 8, MAX_CHIP = 6, MAX_SIMIT = 6;
  var GOLD = '255,209,102', BLUE = '200,240,255', ROSE = '255,110,90', VIOLET = '179,136,255';
  var fx = [], banner = null;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function add(p) { if (fx.length < MAX_FX) fx.push(p); }
  function part(p) { P.WFx.add(p); }
  function ring(x, y, r, col, t) { part({ k: 'shock', x: x, y: y, r: r, t: t, T: t, col: col }); }
  function puff(x, y, r, t, vx, vy) { part({ k: 'puff', x: x, y: y, z: 0.2, vx: vx || 0, vy: vy || 0, vz: 0.2, r: r, t: t, T: t }); }
  function pop(r, col, t) { return function (ev) { ring(ev.x, ev.y, r || ev.r, col, t); }; }
  function shake(a) { if (P.Fx && P.Fx.addTrauma) P.Fx.addTrauma(a); }
  function letter(x, y, text) { if (P.Fx && P.Fx.letter) P.Fx.letter(x, y, text); }
  function cue(name, gap, s, x) { P.Sfx.play(name, gap, { pan: x === undefined ? 0 : P.WFx.pan(s, x) }); }
  // Sparks from (x, y): a full burst, or a cone of half-width spread around angle a.
  function sparks(x, y, n, sp, t, a, spread) {
    var i, th;
    for (i = 0; i < n; i++) {
      th = spread === undefined ? rnd(0, TAU) : a + rnd(-spread, spread);
      part({ k: 'spark', x: x, y: y, z: 0.3, vx: Math.cos(th) * sp, vy: Math.sin(th) * sp, vz: rnd(1, 3), t: t, T: t });
    }
  }

  M.reset = function () { fx = []; banner = null; };

  M.update = function (dt) {
    fx.forEach(function (f) { f.t -= dt; });
    fx = fx.filter(function (f) { return f.t > 0; });
    if (banner) { banner.t -= dt; if (banner.t <= 0) banner = null; }
  };

  // ---------- events (one-shot effects; state is read in the draw calls) ----------
  function trayThrow(ev, s) {
    var i, d;
    cue('swish', 90, s, ev.x);
    for (i = 1; i <= 4; i++) {
      d = ev.range * i / 5;
      part({ k: 'speed', x: ev.x + Math.cos(ev.a) * d, y: ev.y + Math.sin(ev.a) * d, a: ev.a, len: 0.5, t: 0.18, T: 0.18 });
    }
  }
  function trayCatch(ev, s) {
    cue('tink', 60, s, ev.x);
    ring(ev.x, ev.y, 0.5, BLUE, 0.2);
    sparks(ev.x, ev.y, 4, 2.5, 0.3);
  }
  function glassBurst(ev, s) {
    var i, a, rr;
    cue('glass', 80, s, ev.x);
    ring(ev.x, ev.y, ev.r, BLUE, 0.3);
    for (i = 0; i < 6; i++) {
      a = rnd(0, TAU); rr = ev.r * rnd(0.2, 0.9);
      part({ k: 'fleck', x: ev.x + Math.cos(a) * rr, y: ev.y + Math.sin(a) * rr, z: 0.3, vx: Math.cos(a) * 2, vy: Math.sin(a) * 2, vz: rnd(2, 4), t: 0.5, T: 0.5 });
    }
  }
  function simitBounce(ev, s) { cue('click', 40, s, ev.x); ring(ev.x, ev.y, 0.4, '255,255,255', 0.2); }
  function cezvePour(ev, s) {
    var i, th, d, half = ev.arc * Math.PI / 360;
    cue('hiss', 120, s, ev.x);
    for (i = 0; i < 5; i++) {
      th = ev.a + rnd(-half, half); d = ev.range * rnd(0.3, 0.9);
      puff(ev.x + Math.cos(th) * d * 0.3, ev.y + Math.sin(th) * d * 0.3, 0.22, 0.45, Math.cos(th) * 1.2, Math.sin(th) * 1.2);
    }
  }
  function stainSizzle(ev, s) { cue('hiss', 150, s, ev.x); add({ k: 'sizzle', x: ev.x, y: ev.y, r: ev.r, t: ev.T, T: ev.T }); }
  function oltaCast(ev, s) {
    var a = Math.atan2(ev.ty - ev.y, ev.tx - ev.x), i, d;
    cue('swish', 90, s, ev.x);
    for (i = 0; i < 3; i++) {
      d = 0.6 + i * 0.5;
      part({ k: 'speed', x: ev.x + Math.cos(a) * d, y: ev.y + Math.sin(a) * d, a: a, len: 0.6, t: 0.15, T: 0.15 });
    }
  }
  function oltaSlam(ev, s) {
    var i, a, sp;
    cue('slam', 60, s, ev.x);
    shake(ev.sig ? 0.3 : 0.2);
    ring(ev.x, ev.y, ev.r * 1.2, GOLD, 0.35);
    for (i = 0; i < 6; i++) {
      a = i / 6 * TAU;
      puff(ev.x + Math.cos(a) * ev.r * 0.5, ev.y + Math.sin(a) * ev.r * 0.5, 0.25, rnd(0.5, 0.8), Math.cos(a) * 1.2, Math.sin(a) * 1.2);
    }
    for (i = 0; i < 4; i++) {
      a = rnd(0, TAU); sp = rnd(3, 5);
      part({ k: 'debris', x: ev.x, y: ev.y, z: 0.1, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: rnd(3, 5), rot: rnd(0, 6), vr: rnd(-14, 14), t: 0.7, T: 0.7 });
    }
  }
  function umbrellaOpen(ev, s) { cue('swish', 120, s, ev.x); ring(ev.x, ev.y, ev.radius * 0.9, '255,255,255', 0.25); }
  function umbrellaShove(ev) {
    var dx = ev.x - ev.hx, dy = ev.y - ev.hy, d = Math.hypot(dx, dy) || 1;
    part({ k: 'fleck', x: ev.x, y: ev.y, z: 0.3, vx: dx / d * 2.5, vy: dy / d * 2.5, vz: 2, t: 0.25, T: 0.25 });
  }
  function umbrellaClose(ev, s) { cue('swish', 200, s, ev.x); puff(ev.x, ev.y, 0.2, 0.3); }
  function spitReflect(ev, s) {
    cue('spitHit', 80, s, ev.x);
    ring(ev.x, ev.y, 0.45, '255,230,160', 0.25);
    sparks(ev.x, ev.y, 4, 3, 0.3, Math.atan2(ev.y0 - ev.y, ev.x0 - ev.x), 0.4);
  }
  function tavlaRoll(ev, s) {
    cue('click', 60, s, ev.x);
    letter(ev.x, ev.y + 1.1, ev.d1 + ' + ' + ev.d2);
    if (ev.dbl) ring(ev.x, ev.y, 1.2, GOLD, 0.35);
  }
  function tavlaHit(ev, s) {
    cue('tink', 50, s, ev.x);
    ring(ev.x, ev.y, ev.dbl ? 0.6 : 0.3, ev.dbl ? GOLD : '255,255,255', 0.2);
  }
  function emberThrow(ev, s) {
    var i;
    cue('lob', 90, s, ev.x);
    for (i = 0; i < 3; i++) puff(ev.x + rnd(-0.2, 0.2), ev.y + rnd(-0.2, 0.2), 0.15, 0.35, rnd(-0.3, 0.3), rnd(0.3, 0.6));
  }
  function emberLand(ev, s) {
    var i, a;
    cue('boom', 120, s, ev.x);
    ring(ev.x, ev.y, ev.r * 1.1, '255,140,60', 0.3);
    part({ k: 'fire', x: ev.x, y: ev.y, r: ev.r * 0.5, t: 0.35, T: 0.4 });
    for (i = 0; i < 3; i++) {
      a = rnd(0, TAU);
      part({ k: 'debris', x: ev.x, y: ev.y, z: 0.1, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, vz: rnd(2, 4), rot: rnd(0, 6), vr: rnd(-12, 12), t: 0.6, T: 0.6 });
    }
  }
  // Mastery move: the family's lettering (screen centre, 1.2 s), a family shape at the point (1 s), a small shake.
  function masteryMove(ev, s) {
    cue('finale', 300, s, ev.x);
    shake(0.2);
    banner = { key: 'sig.' + ev.weapon, t: 1.2, T: 1.2 };
    add({ k: 'mastery', x: ev.x, y: ev.y, r: ev.r > 0 ? ev.r : 1.5, extra: ev.extra, t: 1.0, T: 1.0 });
  }
  function modUsta(ev) { letter(ev.x, ev.y + 1.0, '2x'); ring(ev.x, ev.y, 0.6, GOLD, 0.3); }
  function modShards(ev) {
    var n = Math.min(6, ev.n || 4), i, a;
    for (i = 0; i < n; i++) {
      a = i / n * TAU + rnd(-0.2, 0.2);
      part({ k: 'fleck', x: ev.x, y: ev.y, z: 0.2, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, vz: rnd(1, 2), t: 0.3, T: 0.3 });
    }
  }
  function modCloud(ev) { add({ k: 'cloud', x: ev.x, y: ev.y, r: ev.r, t: 0.8, T: 0.8 }); }
  function trayReturn(ev) { ring(ev.x, ev.y, 0.2, BLUE, 0.2); }
  function simitThrow(ev) { puff(ev.x, ev.y, 0.2, 0.3); }
  function oltaReel(ev) { puff(ev.x, ev.y, 0.15, 0.3); }

  var EV = {
    trayThrow: trayThrow, trayReturn: trayReturn, trayCatch: trayCatch, glassBurst: glassBurst,
    simitThrow: simitThrow, simitBounce: simitBounce, cezvePour: cezvePour, stainSizzle: stainSizzle,
    oltaCast: oltaCast, oltaSet: pop(0.35, '255,230,160', 0.2), oltaReel: oltaReel, oltaSlam: oltaSlam,
    umbrellaOpen: umbrellaOpen, umbrellaShove: umbrellaShove, umbrellaClose: umbrellaClose, spitReflect: spitReflect,
    tavlaRoll: tavlaRoll, tavlaHit: tavlaHit, emberThrow: emberThrow, emberLand: emberLand,
    masteryMove: masteryMove, modUsta: modUsta, modShards: modShards, modCloud: modCloud,
    modChain: pop(0, ROSE, 0.25), modStick: pop(0.5, VIOLET, 0.2), modStickBoom: pop(0, '255,170,70', 0.3),
    modEcho: pop(0.5, VIOLET, 0.3)
  };

  M.onEvent = function (ev, s) {
    if (Object.prototype.hasOwnProperty.call(EV, ev.type)) EV[ev.type](ev, s);
  };

  // ---------- ground layer: warnings, steam, stains, clouds, mastery shapes ----------
  M.drawGround = function (R, s) {
    var c = R.ctx, W = P.Weapons.state(s), t = performance.now() / 1000;
    c.save();
    fx.forEach(function (f) { groundFx(c, R, f, t); });
    warnings(c, R, W.embers || [], 'ember', 'rgba(255,130,60,0.75)');
    warnings(c, R, W.embers || [], 'reflect', 'rgba(255,230,160,0.75)');
    (W.boils || []).forEach(function (bo) { steam(c, R, s, bo); });
    c.restore();
  };

  function groundFx(c, R, f, t) {
    if (f.k === 'sizzle') sizzle(c, R, f, t);
    else if (f.k === 'cloud') cloud(c, R, f);
    else if (f.k === 'mastery') groundMove(c, R, f);
  }

  // Warnings: a ring that shrinks onto the landing point over the flight time (one stroke per kind).
  function warnings(c, R, list, kind, col) {
    var u = R.ppm, n = 0;
    c.strokeStyle = col; c.lineWidth = 2; c.beginPath();
    list.forEach(function (q) {
      if (q.kind !== kind || q.t < 0 || q.t >= q.T || n >= MAX_WARN) return;
      var p = q.t / q.T, rr = q.r * u * (1 + 0.6 * (1 - p)), X = R.X(q.x), Y = R.Y(q.y);
      n++;
      c.moveTo(X + rr, Y); c.ellipse(X, Y, rr, rr * 0.5, 0, 0, TAU);
    });
    c.stroke();
  }

  // Steam: a fading cone from Arda while the pour runs and for a moment after (cezve pourT + 0.3 s).
  function steam(c, R, s, bo) {
    var C = (P.CFG.weapons && P.CFG.weapons.cezve) || {}, life = (C.pourT || 0.5) + 0.3, h = s.hero, al, X, Y, rr, half, base;
    if (bo.t > life) return;
    al = Math.min(1, (life - bo.t) / 0.3);
    X = R.X(h.x); Y = R.Y(h.y); rr = bo.range * R.ppm; half = bo.arc * Math.PI / 360; base = -bo.a;
    c.fillStyle = 'rgba(220,240,255,' + (0.24 * al).toFixed(3) + ')';
    c.beginPath(); c.moveTo(X, Y); c.arc(X, Y, rr, base - half, base + half); c.closePath(); c.fill();
  }

  // Stain: a ring on the ground and two wisps that rise while it burns.
  function sizzle(c, R, f, t) {
    var u = R.ppm, X = R.X(f.x), Y = R.Y(f.y), rr = f.r * u, a = Math.min(1, f.t / 0.4), k, wy;
    c.strokeStyle = 'rgba(255,255,255,' + (0.45 * a).toFixed(3) + ')'; c.lineWidth = 2;
    c.beginPath(); c.ellipse(X, Y, rr, rr * 0.5, 0, 0, TAU); c.stroke();
    c.fillStyle = 'rgba(235,245,255,' + (0.6 * a).toFixed(3) + ')'; c.beginPath();
    for (k = 0; k < 2; k++) {
      wy = ((t * 1.3 + k * 0.5) % 1) * 0.6 * rr;
      c.moveTo(X + (k ? 1 : -1) * rr * 0.4 + 0.08 * u, Y - wy);
      c.arc(X + (k ? 1 : -1) * rr * 0.4, Y - wy, 0.08 * u, 0, TAU);
    }
    c.fill();
  }

  function cloud(c, R, f) {
    var a = Math.min(1, f.t / f.T), X = R.X(f.x), Y = R.Y(f.y), rr = f.r * R.ppm;
    c.fillStyle = 'rgba(190,230,255,' + (0.22 * a).toFixed(3) + ')';
    c.beginPath(); c.ellipse(X, Y, rr, rr * 0.5, 0, 0, TAU); c.fill();
  }

  // One ground shape per mastery family (1 s). Air families are drawn by airMove.
  function groundMove(c, R, f) {
    var q = 1 - f.t / f.T, X = R.X(f.x), Y = R.Y(f.y), rr = f.r * R.ppm;
    switch (f.extra) {
      case 'spin': spin(c, X, Y, rr, q); break;
      case 'quake': cracks(c, X, Y, rr * q, q); break;
      case 'lake': disc(c, X, Y, rr * (0.5 + 0.5 * q), 0.35 * (1 - q)); break;
      case 'triple': rings(c, X, Y, rr, q, 3); break;
      case 'doubles': rings(c, X, Y, rr, q, 2); break;
      case 'boost': spin(c, X, Y, rr, q); rings(c, X, Y, rr, q, 1); break;
      case 'boil': bubbles(c, X, Y, rr, q); break;
      case 'leviathan': wave(c, X, Y, rr, q); break;
      default: rings(c, X, Y, rr, q, 1); break;
    }
  }

  function rings(c, X, Y, rr, q, n) {
    var k, p;
    c.lineWidth = 5;
    for (k = 0; k < n; k++) {
      p = Math.max(0.2, Math.min(1, q * 1.3 - k * 0.2));
      c.strokeStyle = 'rgba(255,240,190,' + ((1 - q) * 0.8).toFixed(3) + ')';
      c.beginPath(); c.ellipse(X, Y, rr * p, rr * 0.5 * p, 0, 0, TAU); c.stroke();
    }
  }
  function spin(c, X, Y, rr, q) {
    c.strokeStyle = 'rgba(' + GOLD + ',' + ((1 - q * 0.5) * 0.8).toFixed(3) + ')'; c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath(); c.ellipse(X, Y, rr * 0.9, rr * 0.45, 0, q * 12, q * 12 + 1.3); c.stroke();
  }
  function cracks(c, X, Y, L, q) {
    var k, a;
    c.strokeStyle = 'rgba(20,21,31,' + ((1 - q) * 0.8 + 0.2).toFixed(3) + ')'; c.lineWidth = 3;
    c.beginPath();
    for (k = 0; k < 3; k++) {
      a = k * 2.094 + 0.4;
      c.moveTo(X, Y); c.lineTo(X + Math.cos(a) * L * 0.5, Y + Math.sin(a) * L * 0.25);
      c.lineTo(X + Math.cos(a + 0.15) * L, Y + Math.sin(a + 0.15) * L * 0.5);
    }
    c.stroke();
  }
  function disc(c, X, Y, rr, al) {
    c.fillStyle = 'rgba(255,170,60,' + al.toFixed(3) + ')';
    c.beginPath(); c.ellipse(X, Y, rr, rr * 0.5, 0, 0, TAU); c.fill();
  }
  function bubbles(c, X, Y, rr, q) {
    var k, bx, by, br = Math.max(2, rr * 0.06);
    c.fillStyle = 'rgba(220,245,255,0.7)'; c.beginPath();
    for (k = 0; k < 5; k++) {
      bx = X + Math.cos(k * 1.3) * rr * 0.7; by = Y - ((q + k * 0.2) % 1) * rr * 0.5;
      c.moveTo(bx + br, by); c.arc(bx, by, br, 0, TAU);
    }
    c.fill();
  }
  function wave(c, X, Y, rr, q) {
    c.strokeStyle = 'rgba(180,230,255,' + ((1 - q) * 0.8).toFixed(3) + ')'; c.lineWidth = 8;
    c.setLineDash([14, 8]); c.lineDashOffset = -q * 60;
    c.beginPath(); c.ellipse(X, Y, rr * (0.4 + 0.6 * q), rr * 0.5 * (0.4 + 0.6 * q), 0, 0, TAU); c.stroke();
    c.setLineDash([]); c.lineDashOffset = 0;
  }

  // ---------- air layer: tea tray, simit rings, olta line, umbrella canopy, tavla chips, falling embers ----------
  M.drawAir = function (R, s) {
    var c = R.ctx, W = P.Weapons.state(s), t = performance.now() / 1000;
    c.save();
    (W.trays || []).forEach(function (tr) { tray(c, R, tr); });
    simits(c, R, W.simits || [], t);
    (W.hooks || []).forEach(function (hk) { hook(c, R, s, hk); });
    (W.umbrellas || []).forEach(function (up) { canopy(c, R, s, up); });
    chips(c, R, W.tavla || [], false, '#F4EBDD');
    chips(c, R, W.tavla || [], true, '#FFD166');
    falling(c, R, W.embers || [], t);
    fx.forEach(function (f) { if (f.k === 'mastery') airMove(c, R, f, t); });
    c.restore();
    bannerDraw(c, R);
  };

  // Tea tray: a brass disc with a glass stack on it; a faint line back to the throw point while it is out.
  function tray(c, R, tr) {
    var u = R.ppm, X = R.X(tr.x), Y = R.Y(tr.y), rr = 0.3 * u;
    if (tr.phase === 'out') {
      c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(R.X(tr.ox), R.Y(tr.oy)); c.lineTo(X, Y); c.stroke();
    }
    c.beginPath(); c.arc(X, Y, rr, 0, TAU); c.fillStyle = '#B7784A'; c.fill();
    c.strokeStyle = INK; c.lineWidth = 3; c.stroke();
    c.beginPath(); c.arc(X, Y, rr * 0.45, 0, TAU); c.fillStyle = 'rgba(214,240,255,0.95)'; c.fill();
  }

  // Simit rings: a sesame ring per simit (dashes slide to read as spinning), batched into two strokes.
  function simits(c, R, list, t) {
    var n = 0, r = 0.22 * R.ppm;
    c.lineCap = 'round'; c.beginPath();
    list.forEach(function (sm) {
      if (sm.t < sm.delay || n >= MAX_SIMIT) return;
      n++;
      c.moveTo(R.X(sm.x) + r, R.Y(sm.y)); c.arc(R.X(sm.x), R.Y(sm.y), r, 0, TAU);
    });
    if (!n) return;
    c.strokeStyle = INK; c.lineWidth = 6; c.stroke();
    c.strokeStyle = '#E9A23B'; c.lineWidth = 3; c.setLineDash([5, 4]); c.lineDashOffset = -t * 40;
    c.stroke(); c.setLineDash([]); c.lineDashOffset = 0;
  }

  // Olta: a taut line from Arda to the hook; during the cast the line runs out to the target.
  function hook(c, R, s, hk) {
    var h = s.hero, e = hk.e, p = Math.min(1, hk.t / (hk.T || 1)), sx = R.X(h.x), sy = R.Y(h.y + 0.3), ex = R.X(e.x), ey = R.Y(e.y), hx = ex, hy = ey;
    if (hk.phase === 'cast') { hx = sx + (ex - sx) * p; hy = sy + (ey - sy) * p; }
    c.lineCap = 'round'; c.beginPath(); c.moveTo(sx, sy); c.lineTo(hx, hy);
    c.strokeStyle = INK; c.lineWidth = 4; c.stroke();
    c.strokeStyle = '#E9D8A6'; c.lineWidth = 2; c.stroke();
    c.beginPath(); c.arc(hx, hy, 0.1 * R.ppm, 0, TAU); c.fillStyle = '#A7AFBB'; c.fill();
    c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
  }

  // Umbrella canopy over Arda: a sector (a full circle for the signature); opens in 0.15 s, shuts in 0.2 s.
  function canopy(c, R, s, up) {
    var h = s.hero, rr = up.radius * R.ppm, X = R.X(h.x), Y = R.Y(h.y + 0.2), half = up.arc * Math.PI / 360, base = -up.a,
      a = Math.max(0, Math.min(1, up.t / 0.15, (up.T - up.t) / 0.2));
    c.beginPath(); c.moveTo(X, Y); c.arc(X, Y, rr, base - half, base + half); c.closePath();
    c.fillStyle = 'rgba(255,255,255,' + (0.2 * a).toFixed(3) + ')'; c.fill();
    c.strokeStyle = 'rgba(255,255,255,' + (0.7 * a).toFixed(3) + ')'; c.lineWidth = 4; c.stroke();
  }

  // Tavla chips: small squares that ricochet (doubles are gold); one fill per chip, capped.
  function chips(c, R, list, dbl, col) {
    var n = 0, r = 0.09 * R.ppm;
    c.fillStyle = col;
    list.forEach(function (p) {
      if (!!p.dbl !== dbl || p.t < p.delay || n >= MAX_CHIP) return;
      n++;
      c.fillRect(R.X(p.x) - r, R.Y(p.y) - r, 2 * r, 2 * r);
    });
  }

  // Embers, reflected spit and glass: a square dot per flying item, falling onto its landing point.
  function falling(c, R, list, t) {
    dots(c, R, list, 'ember', 'rgb(255,138,61)', t);
    dots(c, R, list, 'reflect', 'rgb(255,230,160)', t);
    dots(c, R, list, 'glass', 'rgba(230,248,255,0.9)', t);
  }
  function dots(c, R, list, kind, col, t) {
    var u = R.ppm, n = 0;
    c.fillStyle = col;
    list.forEach(function (q) {
      if (q.kind !== kind || q.t < 0 || q.t >= q.T || n >= MAX_WARN) return;
      var p = q.t / q.T, X = R.X(q.x), Y = R.Y(q.y + 3 * (1 - p)), d = 0.07 * u;
      n++;
      if (kind === 'glass') { X += Math.cos(t * 6 + q.x * 4) * 0.2 * u; Y += Math.sin(t * 6 + q.x * 4) * 0.1 * u; }
      c.fillRect(X - d, Y - d, 2 * d, 2 * d);
    });
  }

  // Air shapes for mastery moves: falling streaks (rain, shower), storm bolts, a swarm, a dome over the point.
  function airMove(c, R, f, t) {
    var q = 1 - f.t / f.T, X = R.X(f.x), Y = R.Y(f.y), rr = f.r * R.ppm;
    switch (f.extra) {
      case 'rain': streaks(c, X, Y, rr, q, 'rgba(255,230,160,0.85)'); break;
      case 'shower': streaks(c, X, Y, rr, q, 'rgba(220,245,255,0.85)'); break;
      case 'storm': bolts(c, X, Y, rr, t); break;
      case 'swarm': swarm(c, X, Y, rr, t); break;
      case 'dome': dome(c, X, Y, rr, q); break;
    }
  }
  function streaks(c, X, Y, rr, q, col) {
    var k, xx, yy;
    c.strokeStyle = col; c.lineWidth = 2; c.beginPath();
    for (k = 0; k < 6; k++) {
      xx = X + Math.cos(k * 2.4) * rr * 0.8;
      yy = Y - rr * 0.9 + ((q * 1.5 + k * 0.17) % 1) * rr * 1.2;
      c.moveTo(xx, yy); c.lineTo(xx, yy + rr * 0.25);
    }
    c.stroke();
  }
  // Two jagged bolts out from Arda, re-rolled at 12 Hz (seeded by the frame, so no strobing).
  function bolts(c, X, Y, rr, t) {
    var fr = Math.floor(t * 12), b, k, a, j;
    c.strokeStyle = 'rgba(200,240,255,0.9)'; c.lineWidth = 2; c.lineJoin = 'round'; c.beginPath();
    for (b = 0; b < 2; b++) {
      a = b * Math.PI + 0.5 * Math.sin(fr * 3.7 + b);
      c.moveTo(X, Y);
      for (k = 1; k <= 4; k++) {
        j = Math.sin(fr * 5.3 + b * 2.9 + k * 1.7) * 0.25 * rr;
        c.lineTo(X + Math.cos(a) * rr * k / 4 + j, Y + Math.sin(a) * rr * k / 4 - j);
      }
    }
    c.stroke();
  }
  function swarm(c, X, Y, rr, t) {
    var k, a, sx, sy, br = Math.max(3, rr * 0.05);
    c.fillStyle = 'rgba(255,230,160,0.9)'; c.beginPath();
    for (k = 0; k < 5; k++) {
      a = t * 4 + k * TAU / 5;
      sx = X + Math.cos(a) * rr * 0.8; sy = Y + Math.sin(a) * rr * 0.4;
      c.moveTo(sx + br, sy); c.arc(sx, sy, br, 0, TAU);
    }
    c.fill();
  }
  function dome(c, X, Y, rr, q) {
    var a = (1 - q) * 0.6;
    c.fillStyle = 'rgba(255,255,255,' + (a * 0.25).toFixed(3) + ')';
    c.strokeStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')'; c.lineWidth = 3;
    c.beginPath(); c.ellipse(X, Y, rr, rr * 0.8, 0, Math.PI, TAU); c.fill(); c.stroke();
  }

  // Mastery lettering in screen space: the banner is drawn at device pixels, then the world transform is restored.
  function bannerDraw(c, R) {
    if (!banner) return;
    c.save(); c.setTransform(R.dpr, 0, 0, R.dpr, 0, 0);
    P.WFx.banner(c, R, banner.key, banner.t, banner.T, 0.45, '#FFD166');
    c.restore();
  }

  return M;
})();
