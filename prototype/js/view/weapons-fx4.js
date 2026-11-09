// Visuals for the v0.5 improvised weapons (workstream A). Saw blade: a spinning steel disc out and back, sparks where it is
// caught. Manhole cover: a disc that bounces enemy to enemy. Blowtorch: a flame cone while it ticks, then a scorch that
// burns. Olta: hook line, reel puffs, slam. Car door: a red panel that raises as a shield, flings spit back, shoves.
// Slingshot: steel marbles, a gold ring on a lucky shot. Chainsaw: a held bar, a faint sector of the sweep while revving.
// Mod pops (usta, shards, chain, stick, echo, cloud). Mastery moves: screen lettering plus one shape per family (ground:
// spin, quake, lake, triple, boost, leviathan, blade ring, inferno, wall, rampage; air: rain, storm, swarm, volley).
// Reads P.Weapons.state(s) every frame; events only start one-shot effects. Shared particles: P.WFx.add.
// Own timed effects (fx): sizzle, cloud, mastery. Called from P.WFx2.drawGround / drawAir (world space).
P.WFx4 = (function () {
  var M = {}, INK = '#14151F', TAU = Math.PI * 2, MAX_FX = 40, MAX_WARN = 12;
  var GOLD = '255,209,102', BLUE = '200,240,255', ROSE = '255,110,90', VIOLET = '179,136,255';
  var STEEL = '#B8C2CC', DSTEEL = '#5B6470', DOOR = '192,57,43', GLASS = '127,219,255';
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
  function sawThrow(ev, s) {
    var i, d;
    cue('swish', 90, s, ev.x);
    for (i = 1; i <= 4; i++) {
      d = ev.range * i / 5;
      part({ k: 'speed', x: ev.x + Math.cos(ev.a) * d, y: ev.y + Math.sin(ev.a) * d, a: ev.a, len: 0.5, t: 0.18, T: 0.18 });
    }
  }
  function sawReturn(ev) { ring(ev.x, ev.y, 0.2, BLUE, 0.2); }
  function sawCatch(ev, s) {
    cue('tink', 60, s, ev.x);
    ring(ev.x, ev.y, 0.5, BLUE, 0.2);
    sparks(ev.x, ev.y, 4, 2.5, 0.3);
  }
  function sparkBurst(ev, s) {
    cue('zap', 60, s, ev.x);
    ring(ev.x, ev.y, ev.r, GOLD, 0.25);
    sparks(ev.x, ev.y, 6, 3, 0.35);
  }
  function manholeThrow(ev, s) {
    var i;
    cue('lob', 90, s, ev.x);
    for (i = 0; i < 3; i++) puff(ev.x + rnd(-0.2, 0.2), ev.y + rnd(-0.2, 0.2), 0.15, 0.35, rnd(-0.3, 0.3), rnd(0.3, 0.6));
  }
  function manholeBounce(ev, s) {
    cue('click', 40, s, ev.x);
    ring(ev.x, ev.y, 0.4, '255,255,255', 0.2);
    sparks(ev.x, ev.y, 2, 2, 0.2);
  }
  function torchJet(ev, s) {
    var i, half = ev.arc * Math.PI / 360, th;
    cue('burn', 150, s, ev.x);
    for (i = 0; i < 3; i++) {
      th = ev.a + rnd(-half, half);
      part({ k: 'fire', x: ev.x + Math.cos(th) * 0.5, y: ev.y + Math.sin(th) * 0.5, r: 0.25, t: 0.3, T: 0.35 });
    }
  }
  function scorchSizzle(ev, s) { cue('hiss', 150, s, ev.x); add({ k: 'sizzle', x: ev.x, y: ev.y, r: ev.r, t: ev.T, T: ev.T }); }
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
  function doorRaise(ev, s) { cue('swish', 120, s, ev.x); ring(ev.x, ev.y, ev.radius * 0.9, '255,255,255', 0.25); }
  function doorShove(ev) {
    var dx = ev.x - ev.hx, dy = ev.y - ev.hy, d = Math.hypot(dx, dy) || 1;
    part({ k: 'fleck', x: ev.x, y: ev.y, z: 0.3, vx: dx / d * 2.5, vy: dy / d * 2.5, vz: 2, t: 0.25, T: 0.25 });
  }
  function doorDrop(ev, s) { cue('doorSlam', 200, s, ev.x); puff(ev.x, ev.y, 0.2, 0.3); }
  function spitReflect(ev, s) {
    cue('spitHit', 80, s, ev.x);
    ring(ev.x, ev.y, 0.45, '255,230,160', 0.25);
    sparks(ev.x, ev.y, 4, 3, 0.3, Math.atan2(ev.y0 - ev.y, ev.x0 - ev.x), 0.4);
  }
  function slingPull(ev, s) {
    var i;
    cue('swish', 90, s, ev.x);
    for (i = 1; i <= 3; i++) puff(ev.x - Math.cos(ev.a) * 0.15 * i, ev.y - Math.sin(ev.a) * 0.15 * i, 0.12, 0.25);
  }
  // A lucky shot (two marbles on one enemy in a volley) flashes gold; a plain hit is a small tink.
  function marbleHit(ev, s) {
    if (ev.lucky) {
      cue('crit', 50, s, ev.x);
      ring(ev.x, ev.y, 0.6, GOLD, 0.3);
      sparks(ev.x, ev.y, 5, 3, 0.3);
      return;
    }
    cue('tink', 50, s, ev.x);
    ring(ev.x, ev.y, 0.3, '255,255,255', 0.2);
  }
  function sawRev(ev, s) { cue('chain', 200, s, ev.x); shake(ev.sig ? 0.25 : 0.1); sparks(ev.x, ev.y, 3, 2, 0.25, ev.a, 0.6); }
  function sawGrind(ev, s) { cue('cleaver', 60, s, ev.x); sparks(ev.x, ev.y, 3, 2.5, 0.25, ev.a, 0.9); }
  // A rev that hit nothing sputters: a hiss and a puff from Arda. A rev that hit stays quiet here.
  function sawStall(ev, s) {
    if (!ev.stalled) return;
    cue('hiss', 120, s, ev.x);
    puff(ev.x, ev.y, 0.25, 0.4);
  }
  // Mastery move: the family's lettering (screen centre, 1.2 s), a family shape at the point (1 s), a small shake.
  function masteryMove(ev, s) {
    cue('finale', 300, s, ev.x);
    shake(0.2);
    // Lettering goes through the arbiter (one banner slot, never over a bark or a pop); the local banner is the fallback.
    if (P.Speech && P.Speech.banner) P.Speech.banner('sig.' + ev.weapon, 1.2, 0.45, '#FFD166');
    else banner = { key: 'sig.' + ev.weapon, t: 1.2, T: 1.2 };
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
  function oltaReel(ev) { puff(ev.x, ev.y, 0.15, 0.3); }

  var EV = {
    sawThrow: sawThrow, sawReturn: sawReturn, sawCatch: sawCatch, sparkBurst: sparkBurst,
    sawRev: sawRev, sawGrind: sawGrind, sawStall: sawStall,
    manholeThrow: manholeThrow, manholeBounce: manholeBounce, torchJet: torchJet, scorchSizzle: scorchSizzle,
    oltaCast: oltaCast, oltaSet: pop(0.35, '255,230,160', 0.2), oltaReel: oltaReel, oltaSlam: oltaSlam,
    doorRaise: doorRaise, doorShove: doorShove, doorDrop: doorDrop, spitReflect: spitReflect,
    slingPull: slingPull, marbleHit: marbleHit,
    masteryMove: masteryMove, modUsta: modUsta, modShards: modShards, modCloud: modCloud,
    modChain: pop(0, ROSE, 0.25), modStick: pop(0.5, VIOLET, 0.2), modStickBoom: pop(0, '255,170,70', 0.3),
    modEcho: pop(0.5, VIOLET, 0.3)
  };

  M.onEvent = function (ev, s) {
    if (Object.prototype.hasOwnProperty.call(EV, ev.type)) EV[ev.type](ev, s);
  };

  // ---------- ground layer: warnings, scorches, sweep sector, clouds, sizzles, mastery shapes ----------
  M.drawGround = function (R, s) {
    var c = R.ctx, W = P.Weapons.state(s), t = performance.now() / 1000;
    c.save();
    fx.forEach(function (f) { groundFx(c, R, f, t); });
    (s.zones || []).forEach(function (z) { if (z.kind === 'scorch') char(c, R, z, t); });
    warnings(c, R, W.landings || [], 'sparks', 'rgba(255,209,102,0.75)');
    warnings(c, R, W.landings || [], 'reflect', 'rgba(255,230,160,0.75)');
    if (W.rev) revSector(c, R, s, W.rev);
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

  // Chainsaw rev: a faint sector of the sweep (a full ring under rampage), fading in over the first 0.1 s.
  function revSector(c, R, s, r) {
    var h = s.hero, rr = r.range * R.ppm, X = R.X(h.x), Y = R.Y(h.y + 0.2), half = r.sig ? Math.PI : r.arc * Math.PI / 360,
      base = -r.a0, a = Math.min(1, r.t / 0.1);
    c.beginPath(); c.moveTo(X, Y); c.arc(X, Y, rr, base - half, base + half); c.closePath();
    c.fillStyle = 'rgba(255,140,60,' + (0.14 * a).toFixed(3) + ')'; c.fill();
    c.strokeStyle = 'rgba(255,140,60,' + (0.5 * a).toFixed(3) + ')'; c.lineWidth = 2; c.stroke();
  }

  // Scorch: a charred patch that fades over its last 0.6 s, with three embers that flicker in place.
  function char(c, R, z, t) {
    var u = R.ppm, X = R.X(z.x), Y = R.Y(z.y), rr = z.r * u, a = Math.min(1, z.t / 0.6), k, ex, ey;
    c.fillStyle = 'rgba(20,21,31,' + (0.45 * a).toFixed(3) + ')';
    c.beginPath(); c.ellipse(X, Y, rr, rr * 0.5, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(' + GOLD + ',' + (a * (0.5 + 0.5 * Math.sin(t * 9 + z.x))).toFixed(3) + ')';
    c.beginPath();
    for (k = 0; k < 3; k++) {
      ex = X + Math.cos(k * 2.1) * rr * 0.5; ey = Y + Math.sin(k * 2.1) * rr * 0.25;
      c.moveTo(ex + 0.06 * u, ey); c.arc(ex, ey, 0.06 * u, 0, TAU);
    }
    c.fill();
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
      case 'rampage': spin(c, X, Y, rr, q); rings(c, X, Y, rr, q, 1); break;
      case 'quake': cracks(c, X, Y, rr * q, q); break;
      case 'lake': disc(c, X, Y, rr * (0.5 + 0.5 * q), 0.35 * (1 - q)); break;
      case 'triple': rings(c, X, Y, rr, q, 3); break;
      case 'boost': spin(c, X, Y, rr, q); rings(c, X, Y, rr, q, 1); break;
      case 'leviathan': wave(c, X, Y, rr, q); break;
      case 'bladeRing': spokes(c, X, Y, rr, q, 12); break;
      case 'inferno': flames(c, X, Y, rr, q, 7); break;
      case 'wall': wallPanels(c, X, Y, rr, q, 10); break;
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
  // Blade ring: teeth spinning out from the point and fading (the signature ring of blades around Arda).
  function spokes(c, X, Y, rr, q, n) {
    var k, a;
    c.strokeStyle = 'rgba(' + GOLD + ',' + ((1 - q) * 0.9).toFixed(3) + ')'; c.lineWidth = 3; c.lineCap = 'butt';
    c.beginPath();
    for (k = 0; k < n; k++) {
      a = k * TAU / n + q * 4;
      c.moveTo(X + Math.cos(a) * rr * 0.45, Y + Math.sin(a) * rr * 0.225);
      c.lineTo(X + Math.cos(a) * rr * 0.7, Y + Math.sin(a) * rr * 0.35);
    }
    c.stroke();
  }
  // Inferno: flame tongues fanning out from the point, flickering as the move plays out.
  function flames(c, X, Y, rr, q, n) {
    var k, a, L, bx, by;
    c.fillStyle = 'rgba(255,140,60,' + ((1 - q) * 0.8).toFixed(3) + ')'; c.beginPath();
    for (k = 0; k < n; k++) {
      a = k * TAU / n;
      L = rr * (0.35 + 0.15 * Math.sin(k * 1.7 + q * 9)) * (1 - q * 0.5);
      bx = X + Math.cos(a) * rr * 0.35; by = Y + Math.sin(a) * rr * 0.175;
      c.moveTo(bx - 0.12 * rr, by);
      c.lineTo(bx + Math.cos(a) * L, by + Math.sin(a) * L * 0.5);
      c.lineTo(bx + 0.12 * rr, by);
    }
    c.fill();
  }
  // Door wall: a ring of short red panels standing around the point; they swell and fade.
  function wallPanels(c, X, Y, rr, q, n) {
    var k, a, r0 = rr * (0.5 + 0.3 * q);
    c.strokeStyle = 'rgba(' + DOOR + ',' + ((1 - q) * 0.85).toFixed(3) + ')'; c.lineWidth = 6; c.lineCap = 'butt';
    c.beginPath();
    for (k = 0; k < n; k++) {
      a = k * TAU / n;
      c.moveTo(X + Math.cos(a) * r0 * 0.85, Y + Math.sin(a) * r0 * 0.425);
      c.lineTo(X + Math.cos(a) * r0 * 1.15, Y + Math.sin(a) * r0 * 0.575);
    }
    c.stroke();
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
  function wave(c, X, Y, rr, q) {
    c.strokeStyle = 'rgba(180,230,255,' + ((1 - q) * 0.8).toFixed(3) + ')'; c.lineWidth = 8;
    c.setLineDash([14, 8]); c.lineDashOffset = -q * 60;
    c.beginPath(); c.ellipse(X, Y, rr * (0.4 + 0.6 * q), rr * 0.5 * (0.4 + 0.6 * q), 0, 0, TAU); c.stroke();
    c.setLineDash([]); c.lineDashOffset = 0;
  }

  // ---------- air layer: saw blade, manhole, marbles, torch jet, olta line, car door, held chainsaw, falling sparks ----------
  M.drawAir = function (R, s) {
    var c = R.ctx, W = P.Weapons.state(s), t = performance.now() / 1000;
    c.save();
    (W.blades || []).forEach(function (bl) { blade(c, R, bl, t); });
    (W.manholes || []).forEach(function (mh) { manhole(c, R, mh, t); });
    (W.torches || []).forEach(function (bo) { flameJet(c, R, s, bo, t); });
    (W.hooks || []).forEach(function (hk) { hook(c, R, s, hk); });
    (W.doors || []).forEach(function (u) { door(c, R, s, u); });
    (W.marbles || []).forEach(function (p) { marble(c, R, p); });
    if (W.rev) held(c, R, s, W.rev, t);
    falling(c, R, W.landings || []);
    fx.forEach(function (f) { if (f.k === 'mastery') airMove(c, R, f, t); });
    c.restore();
    bannerDraw(c, R);
  };

  // Saw blade: a steel disc with 24 teeth, spun by the frame clock; a faint line back to the throw point while it is out.
  function blade(c, R, bl, t) {
    var u = R.ppm, X = R.X(bl.x), Y = R.Y(bl.y), rr = 0.3 * u, rot = t * 4, k, th, rk;
    if (bl.phase === 'out') {
      c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(R.X(bl.ox), R.Y(bl.oy)); c.lineTo(X, Y); c.stroke();
    }
    c.beginPath();
    for (k = 0; k < 24; k++) {
      th = rot + k * TAU / 24; rk = k % 2 ? rr * 0.82 : rr;
      if (k === 0) c.moveTo(X + Math.cos(th) * rk, Y + Math.sin(th) * rk);
      else c.lineTo(X + Math.cos(th) * rk, Y + Math.sin(th) * rk);
    }
    c.closePath(); c.fillStyle = STEEL; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.5; c.stroke();
    c.beginPath(); c.arc(X, Y, rr * 0.25, 0, TAU); c.fillStyle = DSTEEL; c.fill();
    c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
  }

  // Manhole cover: a dark steel disc with two crossing bars and an inner ring; the bars turn while it flies.
  function manhole(c, R, mh, t) {
    var u = R.ppm, rr = 0.3 * u, X, Y, rot, k, a;
    if (mh.t < mh.delay) return;
    X = R.X(mh.x); Y = R.Y(mh.y); rot = t * 6;
    c.beginPath(); c.arc(X, Y, rr, 0, TAU); c.fillStyle = DSTEEL; c.fill();
    c.strokeStyle = INK; c.lineWidth = 3; c.stroke();
    c.strokeStyle = 'rgba(20,21,31,0.8)'; c.lineWidth = 2; c.beginPath();
    for (k = 0; k < 2; k++) {
      a = rot + k * Math.PI / 2;
      c.moveTo(X + Math.cos(a) * rr * 0.85, Y + Math.sin(a) * rr * 0.85);
      c.lineTo(X - Math.cos(a) * rr * 0.85, Y - Math.sin(a) * rr * 0.85);
    }
    c.moveTo(X + rr * 0.45, Y); c.arc(X, Y, rr * 0.45, 0, TAU);
    c.stroke();
  }

  // Steel marble: a small ball with a highlight, drawn while it flies (after its stagger delay).
  function marble(c, R, p) {
    var rr = 0.12 * R.ppm, X, Y;
    if (p.phase !== 'fly' || p.t < p.delay) return;
    X = R.X(p.x); Y = R.Y(p.y);
    c.beginPath(); c.arc(X, Y, rr, 0, TAU); c.fillStyle = STEEL; c.fill();
    c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
    c.beginPath(); c.arc(X, Y, rr * 0.5, -2.4, -0.9); c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 1.5; c.stroke();
  }

  // Blowtorch: while the jet ticks, a flame cone from Arda (orange outer, pale core), breathing by 5 percent.
  function flameJet(c, R, s, bo, t) {
    var h = s.hero, rr = bo.range * R.ppm, X = R.X(h.x), Y = R.Y(h.y + 0.2), half = bo.arc * Math.PI / 360, base = -bo.a,
      k = 1 + 0.05 * Math.sin(t * 30);
    if (bo.done) return;
    c.beginPath(); c.moveTo(X, Y); c.arc(X, Y, rr * k, base - half, base + half); c.closePath();
    c.fillStyle = 'rgba(255,120,30,0.35)'; c.fill();
    c.beginPath(); c.moveTo(X, Y); c.arc(X, Y, rr * 0.6 * k, base - half * 0.7, base + half * 0.7); c.closePath();
    c.fillStyle = 'rgba(255,220,120,0.5)'; c.fill();
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

  // Car door: a red panel on an arc with a cyan window and a steel handle; a faint shield sector behind it.
  // It opens in 0.15 s and shuts in 0.2 s. The signature (wall) makes it a full ring.
  function door(c, R, s, u) {
    var h = s.hero, rr = u.radius * R.ppm, X = R.X(h.x), Y = R.Y(h.y + 0.2), half = u.arc * Math.PI / 360, base = -u.a,
      a = Math.max(0, Math.min(1, u.t / 0.15, (u.T - u.t) / 0.2)), pr = rr * 0.8, th = Math.max(4, 0.14 * R.ppm), hx, hy;
    c.beginPath(); c.moveTo(X, Y); c.arc(X, Y, rr, base - half, base + half); c.closePath();
    c.fillStyle = 'rgba(255,255,255,' + (0.1 * a).toFixed(3) + ')'; c.fill();
    c.beginPath(); c.arc(X, Y, pr, base - half, base + half);
    c.strokeStyle = 'rgba(20,21,31,' + a.toFixed(3) + ')'; c.lineWidth = th + 4; c.stroke();
    c.strokeStyle = 'rgba(' + DOOR + ',' + a.toFixed(3) + ')'; c.lineWidth = th; c.stroke();
    c.beginPath(); c.arc(X, Y, pr, base - half * 0.5, base + half * 0.5);
    c.strokeStyle = 'rgba(' + GLASS + ',' + (0.8 * a).toFixed(3) + ')'; c.lineWidth = Math.max(2, th * 0.4); c.stroke();
    hx = X + Math.cos(base) * pr; hy = Y + Math.sin(base) * pr;
    c.beginPath(); c.arc(hx, hy, th * 0.6, 0, TAU); c.fillStyle = 'rgba(91,100,112,' + a.toFixed(3) + ')'; c.fill();
  }

  // Chainsaw held: a steel guide bar from Arda along the blade angle, with a dashed chain that runs along it.
  // While the rev is hitting, a gold star sits at the tip. The bar reaches 80 percent of the rev range.
  function held(c, R, s, r, t) {
    var h = s.hero, u = R.ppm, X = R.X(h.x), Y = R.Y(h.y + 0.2), L = 0.8 * r.range * u, ang = -h.revAng,
      tx = X + Math.cos(ang) * L, ty = Y + Math.sin(ang) * L, k, a;
    c.lineCap = 'round'; c.beginPath(); c.moveTo(X, Y); c.lineTo(tx, ty);
    c.strokeStyle = INK; c.lineWidth = 9; c.stroke();
    c.strokeStyle = STEEL; c.lineWidth = 5; c.stroke();
    c.setLineDash([6, 4]); c.lineDashOffset = -t * 40;
    c.strokeStyle = '#E9A23B'; c.lineWidth = 3; c.stroke();
    c.setLineDash([]); c.lineDashOffset = 0;
    if (r.hits > 0) {
      c.beginPath();
      for (k = 0; k < 6; k++) {
        a = k * TAU / 6;
        c.moveTo(tx + Math.cos(a) * 0.2 * u, ty + Math.sin(a) * 0.2 * u);
        c.lineTo(tx + Math.cos(a + Math.PI / 6) * 0.1 * u, ty + Math.sin(a + Math.PI / 6) * 0.1 * u);
      }
      c.strokeStyle = 'rgb(' + GOLD + ')'; c.lineWidth = 3; c.stroke();
    }
  }

  // Timed landings (sparks, reflected spit): a dot per flying item, falling onto its landing point.
  function falling(c, R, list) {
    dots(c, R, list, 'sparks', 'rgb(255,209,102)');
    dots(c, R, list, 'reflect', 'rgb(255,230,160)');
  }
  function dots(c, R, list, kind, col) {
    var u = R.ppm, n = 0;
    c.fillStyle = col;
    list.forEach(function (q) {
      if (q.kind !== kind || q.t < 0 || q.t >= q.T || n >= MAX_WARN) return;
      var p = q.t / q.T, X = R.X(q.x), Y = R.Y(q.y + 3 * (1 - p)), d = 0.07 * u;
      n++;
      c.fillRect(X - d, Y - d, 2 * d, 2 * d);
    });
  }

  // Air shapes for mastery moves: falling streaks (rain), storm bolts, a swarm, a fan of marbles (volley).
  function airMove(c, R, f, t) {
    var q = 1 - f.t / f.T, X = R.X(f.x), Y = R.Y(f.y), rr = f.r * R.ppm;
    switch (f.extra) {
      case 'rain': streaks(c, X, Y, rr, q, 'rgba(255,230,160,0.85)'); break;
      case 'storm': bolts(c, X, Y, rr, t); break;
      case 'swarm': swarm(c, X, Y, rr, t); break;
      case 'volley': volley(c, X, Y, rr, q, 4); break;
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
  // Marble volley: steel dots fanning out from the point, each with a short trail; they fade as the move ends.
  function volley(c, X, Y, rr, q, n) {
    var k, a, d = rr * (0.3 + 0.6 * q), x, y;
    c.strokeStyle = 'rgba(200,210,220,' + ((1 - q) * 0.7).toFixed(3) + ')'; c.lineWidth = 2; c.beginPath();
    for (k = 0; k < n; k++) {
      a = k * TAU / n + 0.3;
      c.moveTo(X + Math.cos(a) * d * 0.5, Y + Math.sin(a) * d * 0.25);
      c.lineTo(X + Math.cos(a) * d, Y + Math.sin(a) * d * 0.5);
    }
    c.stroke();
    c.fillStyle = STEEL; c.beginPath();
    for (k = 0; k < n; k++) {
      a = k * TAU / n + 0.3; x = X + Math.cos(a) * d; y = Y + Math.sin(a) * d * 0.5;
      c.moveTo(x + 0.08 * rr, y); c.arc(x, y, 0.08 * rr, 0, TAU);
    }
    c.fill();
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
