// Signature moments (T4 part 13): short, cause-tied flourishes for the dash, kill streaks, crit kills, near misses, ground shocks,
// heavy hits and the last stand. View only: the sim never reads this file. Numbers: P.CFG.moments (config-feel.js).
// This file owns the state, the events and the world layer (drawn from P.Feel.draw, under the hero). The screen layer (ink wipe,
// streak word, tear, lens, grey veil, confetti, ribbon) is in moments-screen.js (P.MomentsScreen).
// Flash rule: each bright start takes a slot from the screen budget (P.Fx.flashGo) or is dropped; the last-stand ring counts each
// pulse takes one slot per 2 s cycle (or holds high that cycle). Nothing here flickers faster than 3 times a second.
P.Moments = (function () {
  var M = { t: 0, shocks: [], streakN: 0, streakAt: -1e9, wordAt: -1e9, critAt: -1e9, impactAt: -1e9, lowOn: false, lowCycle: -1, pulse: 0 };
  var TAU = Math.PI * 2, ghosts = [], ripples = [], crits = [], impacts = [], near = [], nearD = [], star = null;
  function C() { return P.CFG.moments; }
  function rm() { return !!(P.Settings && P.Settings.reduceMotion); }
  function rf() { return !!(P.Settings && P.Settings.reduceFlash); }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(v) { v = clamp01(v); return 1 - (1 - v) * (1 - v); }
  // A bright start asks the screen budget (sprites.js flashOk through P.Fx.flashGo) from the moments pool, which has a slot reserved
  // each second (T4 part 15). With no budget module it is granted.
  function go() { return !P.Fx || !P.Fx.flashGo || P.Fx.flashGo('moment'); }
  function screen() { return P.MomentsScreen; }
  function pool(n) { var a = [], i; for (i = 0; i < n; i++) a.push({ on: false, age: 0, T: 1 }); return a; }
  // The first free slot, else the oldest (largest age). Slots are reused, so nothing is allocated per event.
  function take(list) {
    var i, best = null;
    for (i = 0; i < list.length; i++) { if (!list[i].on) return list[i]; if (!best || list[i].age > best.age) best = list[i]; }
    return best;
  }
  function start(o, props) { o.on = true; o.age = 0; for (var k in props) o[k] = props[k]; return o; }
  function ageAll(list, dt) { for (var i = 0; i < list.length; i++) { var o = list[i]; if (o.on && (o.age += dt) >= o.T) o.on = false; } }
  function heavy(src) { var w = src && P.CFG.weapons ? P.CFG.weapons[src] : null; return !!(w && w.heavy); }

  M.reset = function () {
    var c = C();
    M.t = 0; M.streakN = 0; M.streakAt = -1e9; M.wordAt = -1e9; M.critAt = -1e9; M.impactAt = -1e9; M.shockAt = -1e9; M.lowOn = false; M.lowCycle = -1; M.lowGranted = false; M.pulse = 0;
    M.starts = { dash: 0, crit: 0, ripple: 0, impact: 0, shock: 0, low: 0 };   // cumulative starts, for the tests (read-only)
    M.shocks = pool(c.shock.max); ghosts = pool(c.dash.ghostN); ripples = pool(c.ripple.max); crits = pool(c.crit.max);
    impacts = pool(c.impact.max);
    if (screen() && screen().reset) screen().reset();
  };

  // ---------- events ----------
  M.onEvent = function (ev, s) {
    switch (ev.type) {
      case 'dash': dash(ev); break;
      case 'kill': streakCount(s); if (ev.crit) crit(ev); break;
      case 'frenzy': if (ev.on) M.streakN = 0; break;      // the sim restarts its streak when frenzy starts
      case 'nearMiss': ripple(ev); break;
      case 'explode': shock(ev, 0); break;
      case 'bruteStomp': shock(ev, C().shock.stompKick); break;
      case 'bossSlam': shock(ev, C().shock.slamKick); break;
      case 'hit': if (ev.boss || heavy(ev.src)) impact(ev); break;
      case 'win': if (s.levelIndex > 1 && screen()) screen().clear(s); break;   // level clear on journey levels (L1 has its own exit)
    }
  };

  // Kill streak: the same window as the sim's frenzy streak (skills.frenzy.window), counted here from the kill events.
  function streakCount(s) {
    var t = s.t || 0, marks = C().streak.marks;
    if (t - M.streakAt > P.CFG.skills.frenzy.window) M.streakN = 0;
    M.streakN++; M.streakAt = t;
    // Phone playtest: the words came too often. At most one streak word per gapT seconds (about a third of the old rate).
    if (marks.indexOf(M.streakN) >= 0 && t - M.wordAt >= C().streak.gapT && screen()) { M.wordAt = t; screen().streak(M.streakN); }
  }

  // Dash: a red and a cyan ghost pair along the dash line, then the screen tear (screen layer, one budget slot).
  // Off under Reduce motion and Reduce flashing (the existing afterimages stay).
  function dash(ev) {
    var k = C().dash, i, f, ax = ev.ax || 0, ay = ev.ay || 0, d = ev.dist || 3;
    if (rm() || rf()) return;
    M.starts.dash++;
    for (i = 0; i < ghosts.length; i++) {
      f = (i + 1) / (ghosts.length + 1);
      start(ghosts[i], { x: ev.x + ax * d * f, y: ev.y + ay * d * f, T: k.ghostLife });
    }
    if (screen()) screen().tear();
  }

  // Crit kill: a halftone burst. Off under Reduce motion and Reduce flashing; one budget slot and at most one per gap.
  function crit(ev) {
    var k = C().crit;
    if (rm() || rf() || M.t - M.critAt < k.gap || !go()) return;
    M.critAt = M.t; M.starts.crit++;
    start(take(crits), { x: ev.x, y: ev.y, T: k.hold + k.life });
  }

  // Near miss: a slow ripple ring. Off under Reduce motion; one budget slot (the ring is thin, but it is a bright start).
  function ripple(ev) {
    if (rm() || !go()) return;
    M.starts.ripple++;
    start(take(ripples), { x: ev.x, y: ev.y, T: C().ripple.life });
  }

  // Ground shock: a ring that magnifies the picture (screen layer lens) and, for a slam, one downward jolt (F.kick is off under
  // Reduce motion and scaled by the shake setting). The ring is a motion effect, so Reduce motion drops it.
  function shock(ev, kick) {
    var k = C().shock;
    if (kick && P.Feel && P.Feel.kick) P.Feel.kick(0, -1, kick);
    if (rm() || M.t - M.shockAt < k.gap) return;      // one ring per gap, so a chain of blasts does not zoom more than about 3 times a second
    M.shockAt = M.t; M.starts.shock++;
    start(take(M.shocks), { x: ev.x, y: ev.y, r1: Math.max(k.r1, ev.r || 0), T: k.life });
  }

  // Heavy hit or boss hit: an ink starburst for two frames. Off under Reduce motion and Reduce flashing.
  function impact(ev) {
    var k = C().impact;
    if (rm() || rf() || M.t - M.impactAt < k.gap || !go()) return;
    M.impactAt = M.t; M.starts.impact++;
    start(take(impacts), { x: ev.x, y: ev.y, a: (ev.id || 0) * 0.7, T: k.hold + k.life });
  }

  // ---------- per frame ----------
  M.update = function (dt, s) {
    var k = C().low, n;
    M.t += dt;
    ageAll(ghosts, dt); ageAll(ripples, dt); ageAll(crits, dt); ageAll(impacts, dt); ageAll(M.shocks, dt);
    M.lowOn = !!(s && s.hero) && s.mode === 'play' && s.hero.hp / s.hero.maxHp < P.CFG.feel.lowHpFrac;
    M.pulse = 0.5 + 0.5 * Math.sin(M.t * TAU * k.pulseHz);   // smooth swell, 0.5 Hz (a flash is a rise and a fall)
    if (M.lowOn && !rf()) {                                  // one budget slot per pulse cycle; with none free the ring holds high that cycle
      n = Math.floor(M.t * k.pulseHz);
      if (n !== M.lowCycle) { M.lowCycle = n; M.lowGranted = go(); if (M.lowGranted) M.starts.low++; }
      if (!M.lowGranted) M.pulse = 1;
    }
    if (screen()) screen().update(dt, s);
  };

  // World layer, drawn from P.Feel.draw (after the crowd, under the hero). R.X and R.Y are the camera mapping.
  M.draw = function (R, s) {
    var c = R.ctx;
    if (!s) return;
    drawGhosts(c, R);
    drawRipples(c, R);
    drawCrits(c, R);
    drawImpacts(c, R);
    if (M.lowOn) drawLow(c, R, s);
    c.globalAlpha = 1;
  };

  function drawGhosts(c, R) {
    var k = C().dash, u = R.ppm, i, g, X, Y, off = k.ghostOff * u;
    for (i = 0; i < ghosts.length; i++) {
      g = ghosts[i]; if (!g.on) continue;
      X = R.X(g.x); Y = R.Y(g.y - 0.2);
      c.globalAlpha = (1 - g.age / g.T) * 0.55;
      c.fillStyle = '#FF3D6A'; c.beginPath(); c.ellipse(X - off, Y, 0.26 * u, 0.36 * u, 0, 0, TAU); c.fill();
      c.fillStyle = '#3DDCFF'; c.beginPath(); c.ellipse(X + off, Y, 0.26 * u, 0.36 * u, 0, 0, TAU); c.fill();
    }
  }

  function drawRipples(c, R) {
    var k = C().ripple, u = R.ppm, i, o, f, r, X, Y, fr = rf() ? 0 : k.fringe * u, col;
    for (i = 0; i < ripples.length; i++) {
      o = ripples[i]; if (!o.on) continue;
      col = 'rgb(' + k.col + ')';
      f = o.age / o.T;
      r = (k.r0 + (k.r1 - k.r0) * ease(f) + k.wobbleAmp * Math.sin(o.age * TAU * k.wobbleHz) * (1 - f)) * u;
      X = R.X(o.x); Y = R.Y(o.y - 0.2);
      c.lineWidth = Math.max(1.5, 0.07 * u);
      c.globalAlpha = (1 - f) * 0.85;
      c.strokeStyle = '#FF3D6A'; c.beginPath(); c.arc(X - fr, Y, r, 0, TAU); c.stroke();          // red fringe, left
      c.strokeStyle = '#3DDCFF'; c.beginPath(); c.arc(X + fr, Y, r, 0, TAU); c.stroke();          // cyan fringe, right
      c.strokeStyle = col; c.globalAlpha *= 0.6; c.beginPath(); c.arc(X, Y, r * 0.96, 0, TAU); c.stroke();
    }
  }

  // Halftone burst: a lattice of gold dots, larger toward the centre. The first `hold` seconds stay at r0 (two frames).
  function drawCrits(c, R) {
    var k = C().crit, u = R.ppm, i, o, f, r, a, n = k.grid, j, q, p, rr, d, dr, X, Y;
    for (i = 0; i < crits.length; i++) {
      o = crits[i]; if (!o.on) continue;
      f = o.age < k.hold ? 0 : ease((o.age - k.hold) / (o.T - k.hold));
      r = k.r0 + (k.r1 - k.r0) * f;
      a = o.age < o.T * 0.6 ? 1 : clamp01(1 - (o.age - o.T * 0.6) / (o.T * 0.4));
      X = R.X(o.x); Y = R.Y(o.y - 0.2);
      c.globalAlpha = a; c.fillStyle = 'rgb(' + k.col + ')';
      c.beginPath();
      for (j = -n; j <= n; j++) {
        for (q = -n; q <= n; q++) {
          p = j * k.step; rr = q * k.step; d = Math.sqrt(p * p + rr * rr);
          if (d > r) continue;
          dr = k.dot * (0.35 + 0.65 * (1 - d / r));
          c.moveTo(X + (p + dr) * u, Y + rr * u); c.arc(X + p * u, Y + rr * u, dr * u, 0, TAU);
        }
      }
      c.fill();
    }
  }

  // Unit starburst (outer radius 1, inner radius inner / r), built once.
  function starVerts() {
    var k = C().impact, n = k.spikes, ratio = k.inner / k.r, i, a, rr;
    if (star && star.n === n) return star;
    star = { n: n, v: new Float32Array(4 * n) };
    for (i = 0; i < 2 * n; i++) { a = i * Math.PI / n; rr = i % 2 ? ratio : 1; star.v[2 * i] = Math.cos(a) * rr; star.v[2 * i + 1] = Math.sin(a) * rr; }
    return star;
  }
  function drawImpacts(c, R) {
    var k = C().impact, u = R.ppm, i, o, a, S, j, X, Y, R0 = k.r * u, cr = k.inner * 0.55 / k.r;
    for (i = 0; i < impacts.length; i++) {
      o = impacts[i]; if (!o.on) continue;
      a = o.age <= k.hold ? 1 : clamp01(1 - (o.age - k.hold) / k.life);
      S = starVerts(); X = R.X(o.x); Y = R.Y(o.y - 0.2);
      c.globalAlpha = a;
      c.save(); c.translate(X, Y); c.rotate(o.a); c.scale(R0, R0);
      c.beginPath(); c.moveTo(S.v[0], S.v[1]);
      for (j = 1; j < 2 * S.n; j++) c.lineTo(S.v[2 * j], S.v[2 * j + 1]);
      c.closePath(); c.fillStyle = 'rgb(' + k.ink + ')'; c.fill();
      c.beginPath(); c.arc(0, 0, cr, 0, TAU); c.fillStyle = 'rgb(' + k.core + ')'; c.fill();
      c.restore();
    }
  }

  // Last stand: a red ring on the feet of the nearest enemies inside `radius`, swelling with M.pulse (0.5 Hz). Steady under Reduce
  // flashing at the upper alpha.
  function drawLow(c, R, s) {
    var k = C().low, u = R.ppm, h = s.hero, i, e, d, j, far, rr, a;
    near.length = 0; nearD.length = 0;
    for (i = 0; i < s.enemies.length; i++) {
      e = s.enemies[i];
      if (e.dead || e.state === 'dormant') continue;
      d = Math.hypot(e.x - h.x, e.y - h.y);
      if (d > k.radius) continue;
      if (near.length < k.max) { near.push(e); nearD.push(d); continue; }
      far = 0;
      for (j = 1; j < near.length; j++) if (nearD[j] > nearD[far]) far = j;
      if (d < nearD[far]) { near[far] = e; nearD[far] = d; }
    }
    c.strokeStyle = 'rgb(' + k.col + ')';
    c.lineWidth = Math.max(2, 0.06 * u);
    for (j = 0; j < near.length; j++) {
      e = near[j];
      rr = ((e.r || 0.35) * 1.25 + k.ring) * u;
      a = rf() ? k.alpha[1] : k.alpha[0] + (k.alpha[1] - k.alpha[0]) * M.pulse;
      c.globalAlpha = a;
      c.beginPath(); c.ellipse(R.X(e.x), R.Y(e.y), rr, rr * 0.42, 0, 0, TAU); c.stroke();
    }
  }

  // Read-only counts of live effects (tests and the moments harness; nothing in the game reads it).
  M.active = function () {
    function n(l) { var k = 0, i; for (i = 0; i < l.length; i++) if (l[i].on) k++; return k; }
    return { ghosts: n(ghosts), ripples: n(ripples), crits: n(crits), impacts: n(impacts), shocks: n(M.shocks), lowRings: near.length,
      starts: M.starts };
  };

  if (P.CFG && P.CFG.moments) M.reset();
  return M;
})();
