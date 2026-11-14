// Player-skill visuals (workstream E1): dash afterimages and speed lines, the dash-through callout (SIYRILDI!), the
// cooldown ring; the ultimate "Evil-Eye Burst" (giant eye, area outline, rays); the Nazar charm dodge eye; the
// frenzy aura and gold trail; the magnet vacuum ring; near-miss letters; and the 1.6 s evolution cutscene.
// v0.7: no screen flashes and no random speed streaks. The frenzy trail only forms while the hero moves. Banners go
// through P.Speech (the arbiter), with a local fallback when speech.js is absent (tests).
P.SkillsFx = (function () {
  var F = {}, INK = '#14151F', GOLD = '255,209,102', BLUE = '150,220,255';
  var MAX_GHOSTS = 8, MAX_TRAIL = 14, GHOST_GAP = 0.03, SLIP_R = 0.7, SLIP_N = 3;
  var BUBBLE_R = 0.9, POP_T = 0.3;   // simit shield bubble radius and block pop time (view only, m and s)
  var pops = [];
  var ghosts = [], trail = [], ult = null, eye = null, banner = null, evo = null, vac = null, ghostT = 0, icons = {},
    slipSeen = [], slipDone = false,
    kit = { convoy: null, horn: null, tackle: null };   // latest v0.5 ult payloads (lanes, car size, horn radius)
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function noop() {}

  F.reset = function () {
    ghosts = []; trail = []; ult = null; eye = null; banner = null; evo = null; vac = null; ghostT = 0; pops = [];
    slipSeen = []; slipDone = false;
  };

  // Banner through the arbiter; the local banner is only the fallback when P.Speech is not loaded.
  function showBanner(key, T) {
    if (P.Speech && P.Speech.banner) P.Speech.banner(key, T, 0.3, '#FFD166');
    else banner = { key: key, t: T, T: T };
  }

  F.onEvent = function (ev, s) {
    var h = s.hero, pn = P.WFx.pan(s, ev.x !== undefined ? ev.x : h.x);
    switch (ev.type) {
      case 'dash': dashStart(ev, s, pn); break;
      case 'nearMiss':
        P.Fx.letter(ev.x, ev.y + 1.2, P.t('nearMiss'));
        P.WFx.add({ k: 'shock', x: ev.x, y: ev.y, r: 0.9, t: 0.3, T: 0.3, col: BLUE });
        P.Sfx.play('nearMiss', 150, { pan: pn });
        break;
      case 'ult': if (ev.id === 'convoy' || ev.id === 'horn' || ev.id === 'tackle') startSweep(ev); else startUlt(ev); break;
      case 'tackleStab': stabFx(ev, pn); break;
      case 'ultReady': P.Fx.letter(h.x, h.y + 1.4, P.t('ult.ready')); P.Sfx.play('ultReady', 300); break;
      case 'frenzy': if (ev.on) { showBanner('frenzy.on', 1.2); P.Sfx.play('frenzy', 300); } break;
      case 'nazarDodge':
        eye = { t: 0.35, T: 0.35 };
        P.Fx.letter(h.x, h.y + 1.3, P.t('nazar.dodge'));
        P.Sfx.play('nazar', 120, { pan: pn });
        break;
      case 'vacuum': vac = { x: ev.x, y: ev.y, r: ev.r, t: 0.45, T: 0.45 }; P.Sfx.play('magnet', 200, { pan: pn }); break;
      case 'evolve': evo = { from: ev.from, to: ev.to, t: ev.T, T: ev.T }; P.Sfx.play('evolve'); P.Fx.addTrauma(0.3); break;
      // W2 active skills: the cast banner and cue, the bubble pop when the shield takes a hit.
      case 'skillUsed':
        showBanner('skill.' + ev.id, 1.0);
        P.Sfx.play(ev.id === 'tea' ? 'heal' : 'nazar', 200, { pan: pn });
        break;
      case 'shieldBlock':
        pops.push({ x: ev.x, y: ev.y, t: POP_T, T: POP_T });
        P.Fx.letter(ev.x, ev.y + 1.2, P.t('shield.block'));
        P.Sfx.play('nazar', 150, { pan: pn });
        break;
    }
  };

  function dashStart(ev, s, pn) {
    var h = s.hero, tr = Math.atan2(ev.ay, ev.ax), px = -Math.sin(tr), py = Math.cos(tr), i, off, back;
    slipSeen = []; slipDone = false;
    for (i = 0; i < 8; i++) {
      off = (i / 7 - 0.5) * 0.8; back = rnd(0.2, 0.9);
      P.WFx.add({ k: 'speed', x: h.x - Math.cos(tr) * back + px * off, y: h.y - Math.sin(tr) * back + py * off,
        a: tr, len: rnd(0.5, 1), t: 0.2, T: 0.2, gold: P.Skills.frenzyOn(s) });
    }
    ghosts.push({ x: h.x, y: h.y, fx: h.fx, t: 0.35, T: 0.35 });
    P.Sfx.play('dash', 50, { pan: pn });
  }

  function startUlt(ev) {
    ult = { x: ev.x, y: ev.y, hw: ev.hw, hh: ev.hh, n: ev.n, t: ev.T, T: ev.T };
    showBanner('ult.name', 1.2);
    P.Fx.addTrauma(0.5);
    P.Sfx.play('ult');
  }

  // Convoy and horn (v0.5): a banner, a small shake and a cue. The sweep itself is drawn from sk.sweeps in drawUnder.
  function startSweep(ev) {
    kit[ev.id] = ev;
    showBanner('ult.' + ev.id, 1.2);
    P.Fx.addTrauma(ev.id === 'horn' ? 0.25 : 0.3);
    P.Sfx.play('ult');
    P.Sfx.play(ev.id === 'horn' ? 'ferryHorn' : 'bell', 300);
  }

  // Tackle & Stab: a gold ring and a shake where the stab lands (the sim fires tackleStab once, at the end of Kaan's charge).
  function stabFx(ev, pn) {
    P.WFx.add({ k: 'shock', x: ev.x, y: ev.y, r: ev.r, t: 0.35, T: 0.35, col: GOLD });
    P.Fx.addTrauma(0.4);
    P.Sfx.play('hit', 100, { pan: pn });
  }

  // Dash-through: each enemy the dash passes within SLIP_R gets an afterimage at the contact; the third one
  // shouts SIYRILDI! once per dash. The cause is visible (the hero goes through the crowd, and the enemies live).
  function slipCheck(s) {
    var h = s.hero, list = s.enemies || [], i, e;
    for (i = 0; i < list.length; i++) {
      e = list[i];
      if (e.dead || e.state === 'dormant' || slipSeen.indexOf(e) >= 0) continue;
      if (Math.hypot(e.x - h.x, e.y - h.y) > SLIP_R) continue;
      slipSeen.push(e);
      if (ghosts.length < MAX_GHOSTS) ghosts.push({ x: h.x, y: h.y, fx: h.fx, t: 0.3, T: 0.3 });
    }
    if (!slipDone && slipSeen.length >= SLIP_N) { slipDone = true; P.Fx.letter(h.x, h.y + 1.3, P.t('fx.slip')); }
  }

  // ---------- per-frame timers and trails ----------
  F.update = function (dt, s) {
    var dash = s && P.Skills.dashing(s), frenzy = s && P.Skills.frenzyOn(s);
    ghosts.forEach(function (g) { g.t -= dt; });
    ghosts = ghosts.filter(function (g) { return g.t > 0; });
    if (dash) {
      ghostT -= dt;
      if (ghostT <= 0 && ghosts.length < MAX_GHOSTS) { ghostT = GHOST_GAP; ghosts.push({ x: s.hero.x, y: s.hero.y, fx: s.hero.fx, t: 0.35, T: 0.35 }); }
    } else ghostT = 0;
    // The gold trail follows the hero's path only while it moves; standing still it fades out.
    if (frenzy && s && s.hero.moving) {
      trail.push({ x: s.hero.x, y: s.hero.y });
      if (trail.length > MAX_TRAIL) trail.shift();
    } else if (trail.length) trail.shift();
    if (dash) slipCheck(s); else { slipSeen = []; slipDone = false; }
    if (eye) { eye.t -= dt; if (eye.t <= 0) eye = null; }
    if (ult) { ult.t -= dt; if (ult.t <= 0) ult = null; }
    if (banner) { banner.t -= dt; if (banner.t <= 0) banner = null; }
    if (vac) { vac.t -= dt; if (vac.t <= 0) vac = null; }
    if (evo) { evo.t -= dt; if (evo.t <= 0) evo = null; }
    pops.forEach(function (q) { q.t -= dt; });
    pops = pops.filter(function (q) { return q.t > 0; });
    if (s && P.SkillButton) P.SkillButton.sync(s);
  };

  // ---------- under the hero: afterimages, frenzy trail, cooldown ring ----------
  F.drawUnder = function (R, s) {
    var c = R.ctx, u = R.ppm, h = s.hero, X = R.X(h.x), Y = R.Y(h.y);
    c.save();
    ghosts.forEach(function (g) { drawGhost(c, R, g, u); });
    trail.forEach(function (q, k) {
      var a = (k + 1) / trail.length;
      c.fillStyle = 'rgba(' + GOLD + ',' + (0.5 * a).toFixed(3) + ')';
      c.beginPath(); c.arc(R.X(q.x), R.Y(q.y), (0.12 + 0.18 * a) * u, 0, Math.PI * 2); c.fill();
    });
    drawSweeps(c, R, s);
    if (h.dashCd > 0) {
      var prog = 1 - h.dashCd / P.CFG.skills.dash.cooldown;
      c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 3;
      c.beginPath(); c.ellipse(X, Y, 0.55 * u, 0.22 * u, 0, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2); c.stroke();
    }
    c.restore();
  };

  // Afterimage: the hero sprite re-drawn with a blue palette at low alpha.
  function drawGhost(c, R, g, u) {
    c.globalAlpha = Math.max(0, g.t / g.T) * 0.4;
    P.Sprites.person(c, R.X(g.x), R.Y(g.y - 0.25), { u: u * 1.22, face: g.fx >= 0 ? 1 : -1, phase: 0, skin: '#9FD8FF',
      shirt: '#2E6BD9', pants: '#1B2A44', hair: '#1B2A44', still: true, flash: 0, arms: 'idle', backHand: noop });
    c.globalAlpha = 1;
  }

  // ---------- ultimate sweeps (v0.5): convoy lanes and the horn ring, from the sim's own sweep state ----------
  function drawSweeps(c, R, s) {
    var list = (s.sk && s.sk.sweeps) || [], i;
    for (i = 0; i < list.length; i++) {
      if (list[i].kind === 'convoy') drawConvoy(c, R, list[i]);
      else if (list[i].kind === 'horn') drawHorn(c, R, list[i]);
      else if (list[i].kind === 'tackle') drawTackle(c, R, list[i]);
    }
  }

  // Kaan's charge: a dashed lane from Arda to the landing point and Kaan himself running along it (view only; the sim owns the hit).
  function drawTackle(c, R, w) {
    var u = R.ppm, C = kit.tackle || P.CFG.ults.tackle, p = Math.min(1, w.t / w.T), hx = w.x0 + w.dx * C.dist * p, hy = w.y0 + w.dy * C.dist * p;
    c.setLineDash([8, 8]); c.strokeStyle = 'rgba(' + GOLD + ',0.45)'; c.lineWidth = C.laneW * u * 0.5;
    c.beginPath(); c.moveTo(R.X(w.x0), R.Y(w.y0)); c.lineTo(R.X(hx), R.Y(hy)); c.stroke();
    c.setLineDash([]);
    P.Sprites.person(c, R.X(hx), R.Y(hy - 0.25), { u: u * 1.22, face: w.dx >= 0 ? 1 : -1, phase: w.t * 14, skin: '#C98E6B', shirt: '#2F6B4F',
      pants: '#22242E', hair: '#1B1B22', still: false, flash: 0, arms: 'idle', backHand: noop });
  }

  // Cars drive up the screen (world +y) from y0 to y0 + 2hh; the swept band stays behind each car.
  function drawConvoy(c, R, w) {
    var u = R.ppm, C = kit.convoy || P.CFG.ults.convoy, lanes = C.lanes, p = Math.min(1, w.t / w.T), car = w.y0 + p * 2 * w.hh,
      yBot = R.Y(w.y0), yTop = R.Y(w.y0 + 2 * w.hh), cy = R.Y(car), k, X;
    c.setLineDash([8, 8]); c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 2;
    for (k = 0; k < lanes.length; k++) { X = R.X(w.x0 + lanes[k]); c.beginPath(); c.moveTo(X, yBot); c.lineTo(X, yTop); c.stroke(); }
    c.setLineDash([]);
    for (k = 0; k < lanes.length; k++) {
      X = R.X(w.x0 + lanes[k]);
      c.fillStyle = 'rgba(' + GOLD + ',0.12)'; c.fillRect(X - C.laneW * u / 2, cy, C.laneW * u, yBot - cy);
    }
    for (k = 0; k < lanes.length; k++) {
      X = R.X(w.x0 + lanes[k]);
      c.fillStyle = '#F4EBDD'; c.strokeStyle = INK; c.lineWidth = 2;
      c.fillRect(X - C.laneW * u / 2, cy - C.carLen * u / 2, C.laneW * u, C.carLen * u);
      c.strokeRect(X - C.laneW * u / 2, cy - C.carLen * u / 2, C.laneW * u, C.carLen * u);
    }
  }

  // The horn ring grows from Arda to r * min(1, t/T), the same radius the sim uses for its stun wave.
  function drawHorn(c, R, w) {
    var u = R.ppm, p = Math.min(1, w.t / w.T), r = ((kit.horn && kit.horn.r) || P.CFG.ults.horn.r) * p, X = R.X(w.x0), Y = R.Y(w.y0), rr = r * u, k, g;
    c.strokeStyle = 'rgba(' + GOLD + ',' + (0.8 * (1 - 0.5 * p)).toFixed(3) + ')'; c.lineWidth = 6;
    c.beginPath(); c.arc(X, Y, rr, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 2; c.beginPath();
    for (k = 0; k < 8; k++) {
      g = k * Math.PI / 4 + p * 0.5;
      c.moveTo(X + Math.cos(g) * rr * 0.8, Y + Math.sin(g) * rr * 0.8); c.lineTo(X + Math.cos(g) * rr, Y + Math.sin(g) * rr);
    }
    c.stroke();
  }

  // ---------- over the hero: ultimate eye, nazar dodge eye, frenzy aura, vacuum ring ----------
  F.drawOver = function (R, s) {
    var c = R.ctx, u = R.ppm, h = s.hero, t = performance.now() / 1000;
    c.save();
    if (ult) drawUlt(c, R, u, t);
    if (eye) drawEye(c, R.X(h.x), R.Y(h.y) - 1.1 * u, 0.35 * u, 1, 0.55 * (eye.t / eye.T));
    drawActive(c, R, s, u, t);
    if (P.Skills.frenzyOn(s)) {
      c.strokeStyle = 'rgba(' + GOLD + ',' + (0.28 + 0.08 * Math.sin(t * 3)).toFixed(3) + ')'; c.lineWidth = 3;
      c.beginPath(); c.ellipse(R.X(h.x), R.Y(h.y), 0.6 * u, 0.25 * u, 0, 0, Math.PI * 2); c.stroke();
    }
    if (vac) {
      var p = 1 - vac.t / vac.T;
      c.strokeStyle = 'rgba(' + BLUE + ',' + (0.6 * (1 - p)).toFixed(3) + ')'; c.lineWidth = 3;
      c.beginPath(); c.arc(R.X(vac.x), R.Y(vac.y), vac.r * u * (1 - p * 0.5), 0, Math.PI * 2); c.stroke();
    }
    c.restore();
  };

  // W2 active skills: the simit bubble while the shield is up (a pop ring on each block), the dashed tea aura while the
  // tea is steeping. The aura radius is the sim's slow radius, so what you see is what slows.
  function drawActive(c, R, s, u, t) {
    var a = P.Skills.hud(s).active, h = s.hero, X = R.X(h.x), Y = R.Y(h.y), q, p;
    if (a && a.on && a.id === 'shield') {
      c.fillStyle = 'rgba(' + GOLD + ',0.12)';
      c.strokeStyle = 'rgba(' + GOLD + ',' + (0.55 + 0.15 * Math.sin(t * 4)).toFixed(3) + ')'; c.lineWidth = 3;
      c.beginPath(); c.arc(X, Y, BUBBLE_R * u, 0, Math.PI * 2); c.fill(); c.stroke();
    }
    if (a && a.on && a.id === 'tea') {
      c.setLineDash([8, 8]);
      c.strokeStyle = 'rgba(160,230,150,' + (0.45 + 0.1 * Math.sin(t * 3)).toFixed(3) + ')'; c.lineWidth = 2;
      c.beginPath(); c.arc(X, Y, P.CFG.skills.active.tea.slowR * u, 0, Math.PI * 2); c.stroke();
      c.setLineDash([]);
    }
    for (q = 0; q < pops.length; q++) {
      p = 1 - pops[q].t / pops[q].T;
      c.strokeStyle = 'rgba(' + GOLD + ',' + (0.8 * (1 - p)).toFixed(3) + ')'; c.lineWidth = 3;
      c.beginPath(); c.arc(R.X(pops[q].x), R.Y(pops[q].y), BUBBLE_R * u * (1 + 0.4 * p), 0, Math.PI * 2); c.stroke();
    }
  }

  // Ultimate: dashed damage area, blue-white rays and the giant eye that opens in the first 12% of its time.
  function drawUlt(c, R, u, t) {
    var p = 1 - ult.t / ult.T, X = R.X(ult.x), Y = R.Y(ult.y), open = Math.min(1, p / 0.12), a = open * Math.min(1, (1 - p) * 4);
    var w = ult.hw * 2 * u, hgt = ult.hh * 2 * u, eyeR = ult.hw * u * 0.5 * open, k, ang, L;
    c.strokeStyle = 'rgba(' + BLUE + ',' + (0.5 * a).toFixed(3) + ')'; c.lineWidth = 3;
    c.setLineDash([10, 8]); c.lineDashOffset = -t * 40;
    c.strokeRect(X - w / 2, Y - hgt / 2, w, hgt); c.setLineDash([]);
    c.save(); c.globalCompositeOperation = 'lighter';
    for (k = 0; k < 12; k++) {
      ang = k * Math.PI / 6 + t * 0.4; L = (0.6 + 0.4 * Math.sin(t * 5 + k)) * ult.hw * u;
      c.strokeStyle = 'rgba(' + BLUE + ',' + (0.35 * a).toFixed(3) + ')'; c.lineWidth = 6;
      c.beginPath(); c.moveTo(X + Math.cos(ang) * eyeR * 0.9, Y + Math.sin(ang) * eyeR * 0.9); c.lineTo(X + Math.cos(ang) * L, Y + Math.sin(ang) * L); c.stroke();
    }
    c.restore();
    drawEye(c, X, Y, eyeR, open, a);
  }

  // Almond eye with iris and pupil. open in [0,1] scales the lid height and iris.
  function drawEye(c, X, Y, r, open, a) {
    if (r <= 0 || a <= 0) return;
    var ah = r * 0.9 * open, ir = Math.min(ah * 0.7, r * 0.45);
    c.save(); c.globalAlpha = Math.min(1, a);
    c.beginPath(); c.moveTo(X - r, Y); c.quadraticCurveTo(X, Y - 2 * ah, X + r, Y); c.quadraticCurveTo(X, Y + 2 * ah, X - r, Y); c.closePath();
    c.fillStyle = '#F4FAFF'; c.fill(); c.strokeStyle = INK; c.lineWidth = Math.max(2, r * 0.05); c.stroke();
    var g = c.createRadialGradient(X, Y, 0, X, Y, ir);
    g.addColorStop(0, '#E6F8FF'); g.addColorStop(1, '#2A7FD6');
    c.beginPath(); c.arc(X, Y, ir, 0, Math.PI * 2); c.fillStyle = g; c.fill(); c.stroke();
    c.beginPath(); c.arc(X, Y, ir * 0.4, 0, Math.PI * 2); c.fillStyle = INK; c.fill();
    c.beginPath(); c.arc(X - ir * 0.3, Y - ir * 0.3, ir * 0.18, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,0.9)'; c.fill();
    c.restore();
  }

  // ---------- screen layer: fallback banner (only without P.Speech), evolve cutscene ----------
  F.screen = function (R, s) {
    var c = R.ctx;
    if (banner && !(P.Speech && P.Speech.banner)) P.WFx.banner(c, R, banner.key, banner.t, banner.T, 0.3, '#FFD166');
    if (evo) drawEvo(c, R, evo);
  };

  // 1.6 s: fade in the dark vignette, ink rays spin, the new weapon icon pops on a badge, then the names.
  function drawEvo(c, R, e) {
    var p = 1 - e.t / e.T, W = R.W, H = R.H, cx = W / 2, cy = H * 0.44, k, sc, sz, im;
    var dark = Math.min(1, p / 0.15) * (p > 0.85 ? (1 - p) / 0.15 : 1);
    c.save();
    c.fillStyle = 'rgba(8,9,16,' + (0.82 * dark).toFixed(3) + ')'; c.fillRect(0, 0, W, H);
    c.save(); c.translate(cx, cy); c.rotate(p * 0.8);
    c.fillStyle = 'rgba(' + GOLD + ',' + (0.22 * dark).toFixed(3) + ')';
    for (k = 0; k < 14; k++) {
      c.rotate(Math.PI * 2 / 14);
      c.beginPath(); c.moveTo(0, 0); c.lineTo(-W * 0.05, -H); c.lineTo(W * 0.05, -H); c.closePath(); c.fill();
    }
    c.restore();
    if (p > 0.2) {
      sc = 0.6 + 0.6 * Math.min(1, (p - 0.2) / 0.4); sz = 150 * sc;
      c.globalAlpha = dark;
      c.fillStyle = '#FFF4D6'; c.strokeStyle = INK; c.lineWidth = 6;
      c.beginPath(); c.arc(cx, cy, sz * 0.62, 0, Math.PI * 2); c.fill(); c.stroke();
      im = icon(e.to);
      if (im && im.complete) c.drawImage(im, cx - sz / 2, cy - sz / 2, sz, sz);
      c.globalAlpha = 1;
    }
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    c.font = 'italic 900 ' + Math.round(H * 0.06) + 'px "CM Bangers", Bangers, Impact, sans-serif';
    c.lineWidth = 8; c.strokeStyle = INK; c.fillStyle = '#FFD166';
    c.strokeText(P.t('evo.title'), cx, H * 0.2); c.fillText(P.t('evo.title'), cx, H * 0.2);
    c.font = 'italic 900 ' + Math.round(H * 0.045) + 'px "CM Bangers", Bangers, Impact, sans-serif';
    c.lineWidth = 6; c.strokeText(P.t('item.' + e.to), cx, H * 0.66); c.fillStyle = '#FFFFFF'; c.fillText(P.t('item.' + e.to), cx, H * 0.66);
    c.font = '600 16px "CM Comic Relief", "Comic Relief", "Comic Sans MS", sans-serif'; c.lineWidth = 3;
    var line = P.t('evo.from', { from: P.t('item.' + e.from), to: P.t('item.' + e.to) });
    c.strokeText(line, cx, H * 0.73); c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillText(line, cx, H * 0.73);
    c.restore();
  }

  function icon(id) {
    if (!icons[id] && typeof Image !== 'undefined' && P.Icons) {
      var im = new Image();
      im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(P.Icons.svg(id, 256));
      icons[id] = im;
    }
    return icons[id];
  }

  return F;
})();
