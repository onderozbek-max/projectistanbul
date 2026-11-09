// Enemy behaviour visuals (workstream E2): charge lanes and telegraph rings, acid globs and puddles,
// toxic clouds, bloater swell and burst, boss banner and HP bar, exit arrow (generated levels), cues.
// Lifetimes use sim time (s.t) so pause and card screens freeze them. Hooks: drawGround, drawAir, screen.
P.EnemyFx = (function () {
  var EF = { rings: [], puffs: [], splats: [], banner: null, nowT: 0 };
  var DANGER = '#FF4D2E', ACID = '#7CF08E', TOXIC = '#B5E655', SLAM = '#FF8A3D', SUMMON = '#B07CFF';
  var COL = { danger: DANGER, acid: ACID, toxic: TOXIC, slam: SLAM, summon: SUMMON };
  var clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };

  EF.reset = function () {
    EF.rings = []; EF.puffs = []; EF.splats = []; EF.banner = null;
    EF.hitX = {}; EF.hitN = 0; EF.letterT = -1e9;
    if (P.EnemiesFx2 && P.EnemiesFx2.reset) P.EnemiesFx2.reset();
  };
  // Last hit's x direction per enemy id (flinch lean, art-enemies4.js). Capped so it never grows with the run.
  EF.hitX = {}; EF.hitN = 0; EF.letterT = -1e9;

  function age(item, s) { return s.t - item.t0; }
  function prune(list, s) { for (var i = list.length - 1; i >= 0; i--) if (age(list[i], s) > list[i].dur) list.splice(i, 1); }
  // Boss banner name: boss.<hood> (strings-journey.js copies the narrative spk.b.<hood> names). One set, no table.
  function nameOf(key) {
    var v = P.t(key);
    if (v !== key) return v;
    var alt = key.replace(/^boss\./, 'spk.b.'), w = P.t(alt);
    return w !== alt ? w : key;
  }
  function label(key, tr, en) { var v = P.t(key); return v !== key ? v : (P.lang === 'tr' ? tr : en); }
  function pan(s, x) { return Math.max(-1, Math.min(1, (x - s.hero.x) / 6)); }
  function sfx(name, gap, s, x) { P.Sfx.play(name, gap || 0, { pan: x === undefined ? 0 : pan(s, x) }); }

  // ---------- world-space ground: under enemies ----------
  EF.drawGround = function (R, s) {
    var t = performance.now() / 1000;
    s.zones.forEach(function (z) {
      if (z.kind === 'toxic') drawToxic(R, z, t);
      else if (z.kind === 'acid') drawAcid(R, z, t);
    });
    s.enemyTele.forEach(function (tg) {
      if (tg.kind === 'lane') drawLane(R, tg, s, t);
      else if (tg.kind === 'ring') drawRing(R, tg);
    });
    s.enemies.forEach(function (e) { if (e.type === 'bloater' && e.swell > 0) drawSwell(R, e, t); });
    s.enemies.forEach(function (e) { if (e.type === 'hardhat' && e.helmet) drawHelmet(R, e); if (e.anchored) drawBalcony(R, e); });
    drawSplats(R, s);
  };

  function drawToxic(R, z, t) {
    var c = R.ctx, a = Math.min(1, z.t / 0.4) * 0.5, X = R.X(z.x), Y = R.Y(z.y), r = z.r * R.ppm;
    var g = c.createRadialGradient(X, Y, 0, X, Y, r);
    g.addColorStop(0, 'rgba(181,230,85,' + a + ')'); g.addColorStop(1, 'rgba(181,230,85,0)');
    c.fillStyle = g; c.beginPath(); c.arc(X, Y, r, 0, Math.PI * 2); c.fill();
    for (var i = 0; i < 4; i++) {
      var ang = t * 0.9 + i * 1.6, rr = z.r * (0.35 + 0.25 * ((i * 0.37) % 1));
      c.fillStyle = 'rgba(214,255,150,' + (a * 0.7) + ')';
      c.beginPath(); c.arc(R.X(z.x + Math.cos(ang) * rr), R.Y(z.y + Math.sin(ang) * rr * 0.6), 0.2 * R.ppm, 0, Math.PI * 2); c.fill();
    }
  }

  function drawAcid(R, z, t) {
    var c = R.ctx, a = Math.min(1, z.t / 0.3), X = R.X(z.x), Y = R.Y(z.y), u = R.ppm;
    // Acid green by default; taxi oil is a dark slick with a sheen, the bin's trash is a brown-green stain.
    var base = z.oil ? 'rgba(24,26,34,' : z.trash ? 'rgba(120,132,58,' : 'rgba(124,240,142,';
    c.fillStyle = base + (z.oil ? 0.7 : 0.32) * a + ')'; c.strokeStyle = 'rgba(20,21,31,' + (0.5 * a) + ')'; c.lineWidth = 2;
    c.beginPath(); c.ellipse(X, Y, z.r * u, z.r * 0.7 * u, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    if (z.oil) {
      c.strokeStyle = 'rgba(255,120,200,' + (0.35 * a) + ')'; c.lineWidth = 3;
      c.beginPath(); c.ellipse(X + 0.2 * u, Y - 0.1 * u, z.r * 0.6 * u, z.r * 0.3 * u, 0.4, 0.2, 2.6); c.stroke();
      c.strokeStyle = 'rgba(120,230,255,' + (0.3 * a) + ')';
      c.beginPath(); c.ellipse(X - 0.15 * u, Y + 0.1 * u, z.r * 0.45 * u, z.r * 0.25 * u, -0.3, 0.6, 3.0); c.stroke();
      return;
    }
    for (var i = 0; i < 3; i++) {
      var ph = (t * 1.7 + i * 0.33) % 1, bx = Math.cos(i * 2.1) * z.r * 0.5, by = Math.sin(i * 2.7) * z.r * 0.35;
      c.fillStyle = 'rgba(230,255,220,' + (a * (1 - ph) * 0.8) + ')';
      c.beginPath(); c.arc(R.X(z.x + bx), R.Y(z.y + by) - ph * 0.3 * u, (0.06 + 0.06 * ph) * u, 0, Math.PI * 2); c.fill();
    }
  }

  // Charge lane: red translucent rectangle, fills along its length during the windup, chevrons flow.
  function drawLane(R, tg, s, t) {
    var c = R.ctx, p = clamp01(tg.t / tg.T), hw = tg.w / 2, nx = -tg.dy * hw, ny = tg.dx * hw;
    var L = tg.len, cx = [tg.x + nx, tg.x - nx, tg.x - nx + tg.dx * L, tg.x + nx + tg.dx * L];
    var cy = [tg.y + ny, tg.y - ny, tg.y - ny + tg.dy * L, tg.y + ny + tg.dy * L];
    c.beginPath(); c.moveTo(R.X(cx[0]), R.Y(cy[0]));
    for (var k = 1; k < 4; k++) c.lineTo(R.X(cx[k]), R.Y(cy[k]));
    c.closePath(); c.fillStyle = 'rgba(255,77,46,0.16)'; c.fill();
    c.setLineDash([10, 6]); c.strokeStyle = DANGER; c.lineWidth = 2; c.stroke(); c.setLineDash([]);
    var fill = L * p;
    c.beginPath();
    c.moveTo(R.X(tg.x + nx), R.Y(tg.y + ny)); c.lineTo(R.X(tg.x - nx), R.Y(tg.y - ny));
    c.lineTo(R.X(tg.x - nx + tg.dx * fill), R.Y(tg.y - ny + tg.dy * fill)); c.lineTo(R.X(tg.x + nx + tg.dx * fill), R.Y(tg.y + ny + tg.dy * fill));
    c.closePath(); c.fillStyle = 'rgba(255,77,46,0.34)'; c.fill();
    c.strokeStyle = 'rgba(255,240,200,0.8)'; c.lineWidth = 2.5;
    for (var d = 1.2 - (t * 3) % 1.2; d < L; d += 1.2) {
      var px = tg.x + tg.dx * d, py = tg.y + tg.dy * d, sz = 0.35;
      c.beginPath(); c.moveTo(R.X(px - tg.dx * sz + nx * 0.6), R.Y(py - tg.dy * sz + ny * 0.6));
      c.lineTo(R.X(px), R.Y(py)); c.lineTo(R.X(px - tg.dx * sz - nx * 0.6), R.Y(py - tg.dy * sz - ny * 0.6)); c.stroke();
    }
  }

  // Telegraph ring: hatched fill, dashed outline, progress arc (matches render.js for stomp rings).
  function drawRing(R, tg) {
    var c = R.ctx, X = R.X(tg.x), Y = R.Y(tg.y), r = tg.r * R.ppm, p = clamp01(tg.t / tg.T), col = COL[tg.col] || DANGER;
    c.beginPath(); c.arc(X, Y, r, 0, Math.PI * 2); c.fillStyle = hexA(col, 0.16); c.fill();
    c.setLineDash([8, 6]); c.strokeStyle = col; c.lineWidth = 2.5; c.beginPath(); c.arc(X, Y, r, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
    c.lineWidth = 5; c.beginPath(); c.arc(X, Y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); c.stroke();
  }

  // Hardhat: a yellow helmet arc on the side it faces (world angle faceA; screen Y is flipped).
  function drawHelmet(R, e) {
    var c = R.ctx, X = R.X(e.x), Y = R.Y(e.y), r = (e.r + 0.12) * R.ppm, a = -(e.faceA || 0);
    c.strokeStyle = 'rgba(255,209,102,0.95)'; c.lineWidth = 4;
    c.beginPath(); c.arc(X, Y, r, a - 0.9, a + 0.9); c.stroke();
  }

  // Balcony spitter (anchored set piece): a small balcony ledge under it.
  function drawBalcony(R, e) {
    var c = R.ctx, u = R.ppm;
    c.fillStyle = 'rgba(120,110,100,0.9)';
    c.fillRect(R.X(e.x) - 0.7 * u, R.Y(e.y) + 0.35 * u, 1.4 * u, 0.2 * u);
  }

  function hexA(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  // Bloater swell: a pulsing green glow that grows and quickens as it closes in.
  function drawSwell(R, e, t) {
    var c = R.ctx, X = R.X(e.x), Y = R.Y(e.y), sw = e.swell, pulse = 0.5 + 0.5 * Math.sin(t * (6 + 14 * sw));
    var r = (e.r + 0.3 + 0.6 * sw) * R.ppm;
    var g = c.createRadialGradient(X, Y, r * 0.2, X, Y, r);
    g.addColorStop(0, 'rgba(181,230,85,' + (0.35 * sw * pulse) + ')'); g.addColorStop(1, 'rgba(181,230,85,0)');
    c.fillStyle = g; c.beginPath(); c.arc(X, Y, r, 0, Math.PI * 2); c.fill();
    if (sw > 0.5) { c.strokeStyle = 'rgba(214,255,150,' + (0.6 * pulse) + ')'; c.lineWidth = 2; c.beginPath(); c.arc(X, Y, r * 0.8, 0, Math.PI * 2); c.stroke(); }
  }

  function drawSplats(R, s) {
    var c = R.ctx;
    EF.splats.forEach(function (p) {
      var a = 1 - age(p, s) / p.dur;
      c.fillStyle = hexA(p.col, 0.55 * a);
      c.beginPath(); c.ellipse(R.X(p.x), R.Y(p.y), p.r * R.ppm, p.r * 0.6 * R.ppm, p.a, 0, Math.PI * 2); c.fill();
    });
  }

  // ---------- world-space air: over projectiles ----------
  EF.drawAir = function (R, s) {
    var c = R.ctx, u = R.ppm;
    prune(EF.rings, s); prune(EF.puffs, s); prune(EF.splats, s);
    s.enemyShots.forEach(function (q) {
      var f = Math.min(1, q.t / q.dur), h = Math.sin(Math.PI * f) * 1.4;
      c.fillStyle = 'rgba(20,21,31,0.3)'; c.beginPath(); c.ellipse(R.X(q.x), R.Y(q.y), 0.25 * u, 0.12 * u, 0, 0, Math.PI * 2); c.fill();
      var X = R.X(q.x), Y = R.Y(q.y) - h * u;
      c.fillStyle = 'rgba(124,240,142,0.95)'; c.strokeStyle = '#14151F'; c.lineWidth = 2;
      c.beginPath(); c.arc(X, Y, 0.24 * u, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.arc(X - 0.08 * u, Y - 0.09 * u, 0.06 * u, 0, Math.PI * 2); c.fill();
    });
    EF.rings.forEach(function (g) {
      var f = Math.min(1, age(g, s) / g.dur);
      c.globalAlpha = 1 - f; c.strokeStyle = g.col; c.lineWidth = 5;
      c.beginPath(); c.arc(R.X(g.x), R.Y(g.y), g.r * (0.6 + 0.4 * f) * u, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
    });
    EF.puffs.forEach(function (p) {
      var f = age(p, s) / p.dur;
      c.fillStyle = hexA(p.col, 0.6 * (1 - f));
      c.beginPath(); c.arc(R.X(p.x + p.vx * age(p, s)), R.Y(p.y + p.vy * age(p, s)), p.r * (1 + f) * u, 0, Math.PI * 2); c.fill();
    });
    drawExitArrow(R, s);
  };

  // Gameplay arrow to the exit once the gate is open (F draws the gate landmark itself).
  function drawExitArrow(R, s) {
    if (!s.geo || !s.props.shutterOpen || s.mode !== 'play') return;
    var h = s.hero, c = R.ctx, tx = 0, ty = s.geo.exitY + 1.5, dx = tx - h.x, dy = ty - h.y, d = Math.hypot(dx, dy);
    if (d < 3) return;
    var ux = dx / d, uy = dy / d, sx = h.x + ux * 1.6, sy = h.y + uy * 1.6, ex = h.x + ux * 2.9, ey = h.y + uy * 2.9;
    c.strokeStyle = '#FFD166'; c.fillStyle = '#FFD166'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(R.X(sx), R.Y(sy)); c.lineTo(R.X(ex), R.Y(ey)); c.stroke();
    var a = Math.atan2(-uy, ux);
    c.beginPath(); c.moveTo(R.X(ex) + Math.cos(a) * 10, R.Y(ey) + Math.sin(a) * 10);
    c.lineTo(R.X(ex) + Math.cos(a + 2.4) * 10, R.Y(ey) + Math.sin(a + 2.4) * 10);
    c.lineTo(R.X(ex) + Math.cos(a - 2.4) * 10, R.Y(ey) + Math.sin(a - 2.4) * 10); c.fill();
  }

  // ---------- screen space: boss banner and boss bar ----------
  EF.screen = function (R, s) {
    drawBanner(R, s);
    drawBossBar(R, s);
  };

  var BANNER_T = 1.5;
  function drawBanner(R, s) {
    var b = EF.banner;
    if (!b) return;
    var a = age(b, s), c = R.ctx, W = R.W, H = R.H;
    if (a > BANNER_T) { EF.banner = null; return; }
    var bar = Math.min(1, a / 0.25) * Math.min(1, (BANNER_T - a) / 0.25), bh = 96 * bar;
    c.fillStyle = 'rgba(0,0,0,0.92)'; c.fillRect(0, 0, W, bh); c.fillRect(0, H - bh, W, bh);
    if (bar < 0.6) return;
    var k = Math.min(1, Math.max(0, (a - 0.2) / 0.3)), sc = 1.35 - 0.35 * k;
    c.save(); c.translate(W / 2, H / 2); c.globalAlpha = k;
    c.font = 'italic 900 16px "Avenir Next Condensed", "Arial Narrow", system-ui';
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 4; c.strokeStyle = '#14151F'; c.fillStyle = '#FFD166';
    c.strokeText(b.label, 0, -34); c.fillText(b.label, 0, -34);
    c.font = 'italic 900 42px "Avenir Next Condensed", "Arial Narrow", system-ui';
    var fit = Math.min(sc, (W - 40) / Math.max(1, c.measureText(b.name).width));
    c.scale(fit, fit); c.lineWidth = 9; c.strokeText(b.name, 0, 0);
    c.fillStyle = '#F4EBDD'; c.fillText(b.name, 0, 0);
    c.restore();
  }

  function drawBossBar(R, s) {
    var boss = null;
    for (var i = 0; i < s.enemies.length; i++) if (s.enemies[i].boss && !s.enemies[i].dead) { boss = s.enemies[i]; break; }
    if (!boss) return;
    var c = R.ctx, x0 = 42, w = 306, y0 = 132, bh = 12, f = clamp01(boss.hp / boss.maxHp), name = nameOf(boss.nameKey);
    c.font = 'italic 900 15px "Avenir Next Condensed", "Arial Narrow", system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineWidth = 3; c.strokeStyle = '#14151F'; c.fillStyle = '#F4EBDD';
    c.strokeText(name, R.W / 2, y0 - 10); c.fillText(name, R.W / 2, y0 - 10);
    c.fillStyle = '#14151F'; c.fillRect(x0 - 2, y0 - 2, w + 4, bh + 4);
    var g = c.createLinearGradient(x0, 0, x0 + w, 0); g.addColorStop(0, DANGER); g.addColorStop(1, '#FFC93C');
    c.fillStyle = g; c.fillRect(x0, y0, w * f, bh);
    c.fillStyle = '#F4EBDD'; c.fillRect(x0 + w * 0.5 - 1, y0 - 3, 2, bh + 6);
    if (boss.ai && boss.ai.rageOn) { c.strokeStyle = 'rgba(255,77,46,' + (0.5 + 0.4 * Math.sin(performance.now() / 120)) + ')'; c.lineWidth = 3; c.strokeRect(x0 - 3, y0 - 3, w + 6, bh + 6); }
  }

  // ---------- events -> visuals and cues ----------
  EF.onEvent = function (ev, s) {
    switch (ev.type) {
      case 'spit': sfx('spit', 180, s, ev.x); break;
      case 'spitLand': EF.splats.push({ x: ev.x, y: ev.y, r: ev.r * 0.8, col: ACID, t0: s.t, dur: 1.2, a: 0 }); sfx('spitHit', 120, s, ev.x); break;
      case 'spitWindup': break;
      case 'bruteRoar': sfx('bruteRoar', 250, s, ev.x); break;
      case 'bruteCharge': sfx('bruteCharge', 250, s, ev.x); break;
      case 'bruteStomp':
        EF.rings.push({ x: ev.x, y: ev.y, r: ev.r, col: SLAM, t0: s.t, dur: 0.45 });
        sfx('bruteStomp', 200, s, ev.x); break;
      case 'bloaterSwell': sfx('bloaterSwell', 300, s, ev.x); break;
      case 'bloaterPop': burst(s, ev); break;
      case 'bossIntro':
        EF.banner = { name: nameOf(ev.nameKey), label: label('boss.intro', 'PATRON', 'BOSS'), t0: s.t, dur: BANNER_T };
        sfx('bossIntro', 0, s); break;
      case 'bossRage': P.Fx.letter(ev.x, ev.y + 2, label('boss.rage', 'ÖFKE!', 'RAGE!')); sfx('snarl', 0, s, ev.x); break;
      case 'bossDie': bossDie(s, ev); break;
      case 'bossSlam': EF.rings.push({ x: ev.x, y: ev.y, r: ev.r, col: SLAM, t0: s.t, dur: 0.5 }); sfx('bruteStomp', 0, s, ev.x); break;
      case 'toxicPool': EF.rings.push({ x: ev.x, y: ev.y, r: ev.r, col: TOXIC, t0: s.t, dur: 0.4 }); break;
      case 'emerge': sfx('rattle', 200, s, ev.x); break;
      case 'summon': sfx('snarl', 300, s, ev.x); break;
      case 'ambush': P.Fx.letter(s.hero.x, s.hero.y + 2, '!'); sfx('crowdScream', 0, s); break;
      case 'groan': sfx('groan', 400, s, ev.x); break;
      case 'holdStart': P.Fx.letter(s.hero.x, s.hero.y + 2, P.t('ui.hud.hold')); break;
      case 'screamStart': sfx('groan', 300, s, ev.x); break;
      case 'scream':
        EF.rings.push({ x: ev.x, y: ev.y, r: P.CFG.enemies.screamer.callR, col: SUMMON, t0: s.t, dur: 0.5 });
        P.Fx.letter(ev.x, ev.y + 1, label('ev.scream', 'ÇIĞLIK!', 'SCREAM!')); sfx('snarl', 0, s, ev.x); break;
      case 'screamCut': P.Fx.letter(ev.x, ev.y + 1, label('ev.silenced', 'Sustu!', 'Silenced!')); sfx('tink', 0, s, ev.x); break;
      case 'helmetBlock': sfx('tink', 120, s, ev.x); break;
      case 'helmetOff': P.Fx.letter(ev.x, ev.y + 1.2, label('ev.helmet', 'Kask düştü!', 'Helmet off!')); sfx('tink', 0, s, ev.x); break;
      case 'kill':
        if (['bloater', 'spitter', 'brute', 'screamer', 'hardhat', 'kurye', 'copci'].indexOf(ev.enemy) >= 0) killFx(s, ev);
        if (P.EnemiesFx2) P.EnemiesFx2.onKill(s, ev);      // v0.7: death pose and the 6 s corpse
        break;
      case 'hit':
        if (ev.id !== undefined) { if (++EF.hitN > 600) { EF.hitX = {}; EF.hitN = 0; } EF.hitX[ev.id] = ev.dx || 0; }
        break;
      // v0.7 (lane C): spawn entrances, kurye and copci, boss phases, weak spots and attack cues.
      case 'enemyEnter': entranceFx(s, ev); break;
      case 'kuryeDash': sfx('swish', 200, s, ev.x); break;
      case 'copciPush': sfx('groan', 500, s, ev.x); break;
      case 'binDrop': EF.splats.push({ x: ev.x, y: ev.y, r: ev.r * 0.9, col: TOXIC, t0: s.t, dur: 6, a: 0 }); sfx('splat', 120, s, ev.x); break;
      case 'bossPhase':
        P.Fx.letter(ev.x, ev.y + 2.6, P.t('ev.phase' + ev.phase)); sfx('bruteRoar', 0, s, ev.x); break;
      case 'bossStall': P.Fx.letter(ev.x, ev.y + 2.2, label('ev.exposed', 'Açık nokta!', 'Weak spot!')); sfx('hiss', 0, s, ev.x); break;
      case 'bossWindup': sfx('swish', 300, s, ev.x); break;
      case 'bossSwing': case 'bossSmash':
        EF.rings.push({ x: ev.x, y: ev.y, r: ev.r, col: SLAM, t0: s.t, dur: 0.45 });
        sfx(ev.type === 'bossSmash' ? 'slam' : 'hammer', 150, s, ev.x); break;
    }
  };

  // Spawn entrance: a cue sound, and a call-out at most every 4 s so a horde does not flood the screen.
  function entranceFx(s, ev) {
    var key = 'ev.' + ev.kind;
    sfx(ev.kind === 'manhole' ? 'rattle' : 'doorSlam', 200, s, ev.x);
    if (s.t - EF.letterT < 4 || P.t(key) === key) return;
    EF.letterT = s.t;
    P.Fx.letter(ev.x, ev.y + 1.4, P.t(key));
  }

  function burst(s, ev) {
    EF.rings.push({ x: ev.x, y: ev.y, r: ev.r, col: TOXIC, t0: s.t, dur: 0.55 });
    EF.rings.push({ x: ev.x, y: ev.y, r: ev.r * 0.55, col: ACID, t0: s.t, dur: 0.35 });
    for (var i = 0; i < 16; i++) {
      var a = i / 16 * Math.PI * 2 + (i % 3) * 0.2, sp = 2 + (i % 5) * 0.6;
      EF.puffs.push({ x: ev.x, y: ev.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 0.35 + (i % 4) * 0.12, col: TOXIC, t0: s.t, dur: 0.7 });
    }
    sfx('bloaterPop', 0, s, ev.x);
  }

  function killFx(s, ev) {
    EF.splats.push({ x: ev.x, y: ev.y, r: ev.enemy === 'brute' ? 0.9 : 0.5, col: ev.enemy === 'bloater' ? TOXIC : ACID, t0: s.t, dur: 6, a: 0 });
    if (ev.enemy === 'brute') sfx('zombieDie', 120, s, ev.x);
  }

  // v0.7 distinct deaths: the taxi blows up (fireball rings, black smoke, shards); the butcher folds over the cleaver.
  function bossDie(s, ev) {
    if (ev.boss === 'taksici') return taxiDie(s, ev);
    if (ev.boss === 'kasapBoss') return butcherDie(s, ev);
    EF.rings.push({ x: ev.x, y: ev.y, r: 4, col: TOXIC, t0: s.t, dur: 0.8 });
    EF.rings.push({ x: ev.x, y: ev.y, r: 2.2, col: '#FFD166', t0: s.t, dur: 0.6 });
    for (var i = 0; i < 24; i++) {
      var a = i / 24 * Math.PI * 2;
      EF.puffs.push({ x: ev.x, y: ev.y, vx: Math.cos(a) * 3.5, vy: Math.sin(a) * 3.5, r: 0.5, col: TOXIC, t0: s.t, dur: 1.1 });
    }
    EF.splats.push({ x: ev.x, y: ev.y, r: 1.6, col: ACID, t0: s.t, dur: 8, a: 0 });
    sfx('bossDie', 0, s);
  }

  function taxiDie(s, ev) {
    EF.rings.push({ x: ev.x, y: ev.y, r: 3.6, col: '#FF8A3D', t0: s.t, dur: 0.6 });
    EF.rings.push({ x: ev.x, y: ev.y, r: 2.0, col: '#FFD166', t0: s.t, dur: 0.4 });
    for (var i = 0; i < 18; i++) {                        // black smoke, slow and wide
      var a = i / 18 * Math.PI * 2 + (i % 4) * 0.15, sp = 1.2 + (i % 3) * 0.7;
      EF.puffs.push({ x: ev.x, y: ev.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 0.45 + (i % 3) * 0.15, col: '#2A2B31', t0: s.t, dur: 1.6 });
    }
    for (var k = 0; k < 6; k++) {                         // yellow shards
      var b = k / 6 * Math.PI * 2;
      EF.puffs.push({ x: ev.x, y: ev.y, vx: Math.cos(b) * 4, vy: Math.sin(b) * 4, r: 0.18, col: '#FFC93C', t0: s.t, dur: 0.9 });
    }
    EF.splats.push({ x: ev.x, y: ev.y, r: 2.0, col: '#1B1D26', t0: s.t, dur: 8, a: 0 });
    P.Fx.letter(ev.x, ev.y + 2.4, label('cause.taksici', 'Taksici', 'Taxi driver'));
    sfx('boom', 0, s, ev.x);
  }

  // The butcher folds forward: a low red spray and a cleaver clatter. Quieter than the taxi, longer on the ground.
  function butcherDie(s, ev) {
    EF.rings.push({ x: ev.x, y: ev.y, r: 1.6, col: '#B5361F', t0: s.t, dur: 0.5 });
    for (var i = 0; i < 14; i++) {
      var a = i / 14 * Math.PI * 2;
      EF.puffs.push({ x: ev.x, y: ev.y, vx: Math.cos(a) * 2.2, vy: Math.sin(a) * 2.2, r: 0.25, col: '#8B1E1E', t0: s.t, dur: 0.9 });
    }
    EF.splats.push({ x: ev.x, y: ev.y, r: 1.8, col: '#7A1518', t0: s.t, dur: 8, a: 0.4 });
    sfx('tink', 0, s, ev.x); sfx('zombieDie', 0, s, ev.x);
  }

  return EF;
})();
