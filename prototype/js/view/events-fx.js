// Visuals for level events and hack terminals (v0.5, workstream B). Draws from s.ev.list, s.hacks and sim events.
// Merges the config strings (C.levelStrings -> P.STR) at load.
P.EventsFx = (function () {
  var EV = {}, C = P.CFG;
  var DANGER = 'rgba(255,77,46,', GOLD = 'rgba(255,209,102,', SIGNAL = 'rgba(124,199,255,', CAGE = 'rgba(181,230,85,';
  var clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };

  Object.keys(C.levelStrings || {}).forEach(function (k) {
    P.STR.tr[k] = C.levelStrings[k].tr; P.STR.en[k] = C.levelStrings[k].en;
  });

  EV.reset = function () {};
  function label(key) { return P.t(key); }
  function sfx(name, gap, s, x) { P.Sfx.play(name, gap || 0, { pan: x === undefined ? 0 : Math.max(-1, Math.min(1, (x - s.hero.x) / 6)) }); }

  // World rectangle [x0..x1] x [y0..y1] as a canvas rect (Y may flip, so take min/max).
  function rectWorld(R, x0, x1, y0, y1, fill) {
    var X0 = R.X(x0), X1 = R.X(x1), Y0 = R.Y(y0), Y1 = R.Y(y1);
    R.ctx.fillStyle = fill;
    R.ctx.fillRect(Math.min(X0, X1), Math.min(Y0, Y1), Math.abs(X1 - X0), Math.abs(Y1 - Y0));
  }

  // ---------- world ground: telegraphs, zones, cages, terminals ----------
  EV.drawGround = function (R, s) {
    var t = performance.now() / 1000;
    (s.ev ? s.ev.list : []).forEach(function (ev) { drawEvent(R, s, ev, t); });
    s.hacks.forEach(function (H) { drawHack(R, H, t); });
  };

  function drawEvent(R, s, ev, t) {
    switch (ev.kind) {
      case 'ambush': case 'pier': telegraph(R, ev, DANGER); break;
      case 'set': telegraph(R, ev, DANGER); break;
      case 'barricade': drawBarricade(R, ev); break;
      case 'defend': drawZone(R, ev, C.ev.defend.r, GOLD); break;
      case 'rescue': drawCage(R, ev); break;
      case 'chest': drawChest(R, ev); break;
      case 'hazard': if (ev.sub === 'car') drawFuse(R, ev, t); break;
      case 'stampede': drawStampede(R, ev); break;
      case 'loot': drawLoot(R, ev, t); break;
    }
  }

  // Warning marker at a spawn point, fills in over the telegraph time T.
  function telegraph(R, ev, col) {
    var c = R.ctx, p = clamp01(ev.t / ev.T), X = R.X(ev.x), Y = R.Y(ev.y), r = 0.7 * R.ppm;
    c.fillStyle = col + (0.35 + 0.5 * p) + ')';
    c.beginPath(); c.moveTo(X, Y - r); c.lineTo(X - r * 0.8, Y + r * 0.6); c.lineTo(X + r * 0.8, Y + r * 0.6); c.closePath(); c.fill();
  }

  function drawBarricade(R, ev) {
    var rc = ev.blk.rc, p = clamp01(ev.prog / C.ev.barricade.breakT);
    rectWorld(R, rc.xMin, rc.xMax, rc.yMin, rc.yMax, 'rgba(176,120,70,0.85)');
    if (p > 0) rectWorld(R, rc.xMin, rc.xMin + (rc.xMax - rc.xMin) * p, rc.yMin, rc.yMax, DANGER + '0.6)');
  }

  // Zone ring with a progress arc (defend point).
  function drawZone(R, ev, r, col) {
    var c = R.ctx, X = R.X(ev.x), Y = R.Y(ev.y), rr = r * R.ppm, p = clamp01(ev.prog || 0);
    c.beginPath(); c.arc(X, Y, rr, 0, Math.PI * 2); c.fillStyle = col + (ev.inside ? '0.22)' : '0.1)'); c.fill();
    c.setLineDash([8, 6]); c.strokeStyle = col + '0.9)'; c.lineWidth = 2.5; c.beginPath(); c.arc(X, Y, rr, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
    c.lineWidth = 5; c.beginPath(); c.arc(X, Y, rr * 0.8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); c.stroke();
  }

  // Rescue cage: bars around the civilian; the arc fills while the hero holds by it.
  function drawCage(R, ev) {
    var c = R.ctx, X = R.X(ev.x), Y = R.Y(ev.y), r = C.ev.rescue.holdR * R.ppm, p = clamp01(ev.hold / C.ev.rescue.holdT);
    c.strokeStyle = CAGE + '0.8)'; c.lineWidth = 2;
    for (var i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(X + i * r * 0.4, Y - r); c.lineTo(X + i * r * 0.4, Y + r); c.stroke(); }
    c.lineWidth = 5; c.strokeStyle = CAGE + '0.9)';
    c.beginPath(); c.arc(X, Y, r * 0.9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); c.stroke();
  }

  // Guarded chest box (the guard is an elite enemy next to it).
  function drawChest(R, ev) {
    if (!ev.guard || ev.guard.dead) return;
    var X = R.X(ev.x), Y = R.Y(ev.y), w = 0.45 * R.ppm;
    R.ctx.fillStyle = 'rgba(150,96,50,0.95)'; R.ctx.fillRect(X - w, Y - w * 0.6, w * 2, w * 1.2);
    R.ctx.strokeStyle = GOLD + '0.9)'; R.ctx.lineWidth = 2; R.ctx.strokeRect(X - w, Y - w * 0.6, w * 2, w * 1.2);
  }

  // Burning car: a blinking marker whose rate rises as the fuse runs down.
  function drawFuse(R, ev, t) {
    var c = R.ctx, X = R.X(ev.x), Y = R.Y(ev.y), left = clamp01((ev.T - ev.t) / ev.T), f = 2 + 6 * (1 - left);
    c.fillStyle = DANGER + (0.4 + 0.5 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2 * f))) + ')';
    c.beginPath(); c.arc(X, Y, 0.9 * R.ppm, 0, Math.PI * 2); c.fill();
  }

  function drawStampede(R, ev) {
    var c = R.ctx;
    ev.civs.forEach(function (k) {
      c.fillStyle = 'rgba(230,220,200,0.9)';
      c.beginPath(); c.ellipse(R.X(k.x), R.Y(k.y), 0.3 * R.ppm, 0.4 * R.ppm, 0, 0, Math.PI * 2); c.fill();
    });
  }

  // Loot runner: a pulsing gold ring around the fleeing enemy.
  function drawLoot(R, ev, t) {
    if (!ev.e || ev.e.dead) return;
    var c = R.ctx, X = R.X(ev.e.x), Y = R.Y(ev.e.y);
    c.strokeStyle = GOLD + (0.5 + 0.4 * Math.sin(t * 6)) + ')'; c.lineWidth = 3;
    c.beginPath(); c.arc(X, Y, 0.8 * R.ppm, 0, Math.PI * 2); c.stroke();
  }

  // Hack terminal: idle dashed ring, active solid ring with a progress arc, done faded; alarm pulse; tram box.
  function drawHack(R, H, t) {
    var c = R.ctx, X = R.X(H.x), Y = R.Y(H.y), r = C.hack.r * R.ppm, p = clamp01(H.prog), done = H.state === 'done';
    var a = done ? 0.25 : H.state === 'active' ? 0.8 : 0.45 + 0.1 * Math.sin(t * 3);
    c.beginPath(); c.arc(X, Y, r, 0, Math.PI * 2); c.fillStyle = SIGNAL + (a * 0.25) + ')'; c.fill();
    c.setLineDash(H.state === 'active' ? [] : [8, 6]); c.strokeStyle = SIGNAL + a + ')'; c.lineWidth = 2.5;
    c.beginPath(); c.arc(X, Y, r, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
    if (H.state === 'active' || (!done && p > 0)) {   // an idle terminal with progress is a Second Look (int.2) terminal
      c.lineWidth = 6; c.beginPath(); c.arc(X, Y, r * 0.8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); c.stroke();
    }
    if (H.alarm > 0) { c.strokeStyle = DANGER + (0.5 + 0.4 * Math.sin(t * 9)) + ')'; c.lineWidth = 4; c.beginPath(); c.arc(X, Y, r * 1.1, 0, Math.PI * 2); c.stroke(); }
    if (H.rush > 0) {
      var T = C.hack.tram;
      rectWorld(R, H.x - T.w / 2, H.x + T.w / 2, H.y - T.back, H.y + (H.lane || T.len), DANGER + '0.3)');
    }
  }

  // ---------- world air: labels, progress bars, helpers, blackout glow ----------
  EV.drawAir = function (R, s) {
    var c = R.ctx, u = R.ppm;
    s.hacks.forEach(function (H) {
      if (H.state === 'done' && H.doneT >= C.hack.fadeT) return;
      var X = R.X(H.x), Y = R.Y(H.y) - C.hack.r * u - 0.4 * u;
      c.font = Math.round(0.42 * u) + 'px sans-serif'; c.textAlign = 'center'; c.fillStyle = 'rgba(230,240,255,0.95)';
      c.fillText(label('hack.' + H.kind), X, Y);
      if (H.state === 'active') {
        c.fillStyle = 'rgba(20,21,31,0.6)'; c.fillRect(X - 1.2 * u, Y + 0.15 * u, 2.4 * u, 0.2 * u);
        c.fillStyle = SIGNAL + '0.95)'; c.fillRect(X - 1.2 * u, Y + 0.15 * u, 2.4 * u * clamp01(H.prog), 0.2 * u);
      }
    });
    (s.ev ? s.ev.helpers : []).forEach(function (hp) {
      c.fillStyle = CAGE + '0.95)'; var X = R.X(hp.x), Y = R.Y(hp.y) - 0.9 * u;
      c.fillRect(X - 0.04 * u, Y - 0.16 * u, 0.08 * u, 0.32 * u); c.fillRect(X - 0.16 * u, Y - 0.04 * u, 0.32 * u, 0.08 * u);
    });
    var bo = s.ev && s.ev.list.filter(function (e) { return e.kind === 'blackout' && !e.done; })[0];
    if (bo) glowEyes(R, s, bo.glowR);
  };

  // Blackout: enemies in glow range get two red eyes.
  function glowEyes(R, s, glowR) {
    var c = R.ctx, u = R.ppm;
    s.enemies.forEach(function (e) {
      if (e.dead || e.state === 'dormant' || Math.hypot(e.x - s.hero.x, e.y - s.hero.y) > glowR) return;
      c.fillStyle = DANGER + '0.95)';
      c.beginPath(); c.arc(R.X(e.x) - 0.1 * u, R.Y(e.y) - 0.45 * u, 0.05 * u, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(R.X(e.x) + 0.1 * u, R.Y(e.y) - 0.45 * u, 0.05 * u, 0, Math.PI * 2); c.fill();
    });
  }

  // Blackout is a power glitch, not darkness (config-feel.js glitch): the city stays readable, the grid stutters. G is the shared
  // state read by the screen pass here and by the lamp pools (EV.lightK). Brightness changes at most once per burst.
  var G = { on: false, dip: 0, burst: false, t: 0, a: 0 };
  function glitchState(s) {
    var bo = s.ev && s.ev.list.filter(function (e) { return e.kind === 'blackout' && !e.done; })[0], k, p;
    if (!bo) { G.on = false; G.dip = 0; G.burst = false; return G; }
    k = P.CFG.feel2.glitch; p = bo.t % k.period;
    G.on = true; G.t = bo.t; G.a = clamp01((bo.T - bo.t) / 0.5);
    G.burst = !(P.Settings && P.Settings.reduceMotion) && p < k.burst;
    G.dip = G.burst ? Math.sin(Math.PI * p / k.burst) : 0;
    return G;
  }
  function hash1(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  // Multiplier for lamp and window light pools: 1 normally; during a blackout they hum low and dip once per burst.
  EV.lightK = function (s) {
    var g = glitchState(s), k = P.CFG.feel2.glitch;
    if (!g.on) return 1;
    if (P.Settings && P.Settings.reduceMotion) return k.lampBase;
    return 1 - (1 - k.lampBase * (1 - k.lampDip * g.dip)) * g.a;
  };
  EV.screen = function (R, s) {
    var g = glitchState(s), k = P.CFG.feel2.glitch, c = R.ctx, cv = c.canvas, kk, step, i, y, h, dx, rm = !!(P.Settings && P.Settings.reduceMotion);
    if (!g.on) return;
    c.fillStyle = 'rgba(5,6,12,' + ((rm ? k.steadyDim : k.baseDim + k.dipDim * g.dip) * g.a).toFixed(3) + ')'; c.fillRect(0, 0, R.W, R.H);
    if (!g.burst) return;
    kk = cv.width / R.W; step = Math.floor(g.t * k.rate);
    for (i = 0; i < k.bands; i++) {                       // the picture tears into shifted bands, with a red and a cyan fringe
      y = hash1(step * 3.1 + i * 7.7) * R.H; h = 8 + hash1(step * 5.3 + i) * 34; dx = (hash1(step * 2.9 + i * 1.3) - 0.5) * 2 * (10 + 16 * g.dip);
      c.drawImage(cv, 0, y * kk, cv.width, h * kk, dx, y, R.W, h);
      c.fillStyle = 'rgba(255,50,90,0.16)'; c.fillRect(dx > 0 ? dx - 3 : R.W + dx, y, 3, h);
      c.fillStyle = 'rgba(60,220,255,0.16)'; c.fillRect(dx > 0 ? dx : R.W + dx - 3, y, 3, h);
    }
  };

  // ---------- events -> letters and cues ----------
  EV.onEvent = function (ev, s) {
    switch (ev.type) {
      case 'eventStart': startLetter(s, ev); break;
      case 'hackStart': sfx('tink', 300, s, ev.x); break;
      case 'hackDone': P.Fx.letter(ev.x, ev.y + 1.2, label('hack.done')); sfx('bell', 0, s, ev.x); break;
      case 'hackFail': P.Fx.letter(ev.x, ev.y + 1.2, label(ev.kept ? 'hack.weak' : 'hack.lost')); break;
      case 'signalRestored': P.Fx.letter(s.hero.x, s.hero.y + 2, label('ev.signal')); sfx('bell', 0, s); break;
      case 'signalLost': P.Fx.letter(s.hero.x, s.hero.y + 2, label('hack.lost')); sfx('phoneBuzz', 0, s); break;
      case 'stunWave': sfx('shock', 0, s, ev.x); break;
      case 'shortcut': sfx('shutter', 0, s, ev.x); break;
      case 'carAlarm': sfx('rattle', 0, s, ev.x); break;
      case 'carFuse': P.Fx.letter(ev.x, ev.y + 1, label('ev.fuse')); sfx('hiss', 0, s, ev.x); break;
      case 'gasLeak': P.Fx.letter(ev.x, ev.y + 1, label('ev.gas')); sfx('hiss', 0, s, ev.x); break;
      case 'blackoutStart': P.Fx.letter(s.hero.x, s.hero.y + 2, label('ev.blackout')); sfx('hiss', 0, s); break;
      case 'stampedeStart': P.Fx.letter(s.hero.x, s.hero.y + 2, label('ev.stampede')); sfx('crowdScream', 0, s); break;
      case 'barricadeStart': P.Fx.letter(ev.x, ev.y + 1, label('ev.barricade')); break;
      case 'barricadeBroken': sfx('slam', 0, s, ev.x); break;
      case 'chestGuard': P.Fx.letter(ev.x, ev.y + 1.5, label('ev.guard')); sfx('chestShake', 0, s, ev.x); break;
      case 'lootCaught': P.Fx.letter(ev.x, ev.y + 1, label('ev.freed')); sfx('coin', 0, s, ev.x); break;
      case 'coinBurst': sfx('coin', 80, s, ev.x); break;
      case 'rescueDone': P.Fx.letter(ev.x, ev.y + 1, label('ev.freed')); sfx('bell', 0, s, ev.x); break;
      case 'civDied': sfx('groan', 0, s, ev.x); break;
      case 'helperStart': P.Fx.letter(ev.x, ev.y + 1, label('ev.helper')); break;
      case 'helperThrow': sfx('lob', 200, s, ev.x); break;
      case 'defendHeld': sfx('bell', 0, s, ev.x); break;
      case 'tramRush': P.Fx.letter(ev.x, ev.y0 + 1, label('ev.tram')); sfx('ferryHorn', 0, s, ev.x); if (P.Vehicles) P.Vehicles.rush(ev); break;
    }
  };

  function startLetter(s, ev) {
    var E = P.Events.byId(s, ev.id) || {};
    if (ev.kind === 'set') P.Fx.letter(ev.x, ev.y + 1.3, label('set.' + E.label));
    else if (ev.kind === 'loot') P.Fx.letter(ev.x, ev.y + 1.5, label('ev.loot'));
    else if (ev.kind === 'rescue') P.Fx.letter(ev.x, ev.y + 2, label('ev.rescue'));
    else if (ev.kind === 'defend') P.Fx.letter(ev.x, ev.y + 1.2, label('prompt.defend'));
  }

  return EV;
})();
