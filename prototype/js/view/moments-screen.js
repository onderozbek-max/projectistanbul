// Signature moments, screen layer (T4 part 13): the ink wipe and the streak word, the dash tear, the ground-shock lens, the
// last-stand grey veil, the level-clear confetti and the hood ribbon. View only: the sim never reads this file. Numbers: P.CFG.moments.
// Drawn from RenderOverlay.screen (render.js) after the world and the lighting, under the HUD. The device-pixel passes (the lens and
// the tear) save and restore their transform. Every bright start was granted by the budget (P.Fx.flashGo) in moments.js or here.
P.MomentsScreen = (function () {
  var S = { t: 0, W: 390, H: 844, tearOn: false, tearAge: 0, wipe: null, word: null, pending: null, ribbon: null, pieces: [],
    veilA: 0, veilG: null, veilC: null, lens: null, lensC: null };
  var TAU = Math.PI * 2, INK = '20,21,31', GOLD = '255,209,102', PIECES = 40;
  var JAG = [0.4, -0.6, 0.9, -0.2, 0.7, -0.8, 0.3, -0.4];                                     // ink wipe edge (unit jitter)
  var BLOB = [1, 0.86, 1.08, 0.92, 1.12, 0.88, 1, 0.9, 1.1, 0.84, 1.06, 0.94, 0.98, 1.04];     // ink splash outline (unit jitter)
  function C() { return P.CFG.moments; }
  function rm() { return !!(P.Settings && P.Settings.reduceMotion); }
  function rf() { return !!(P.Settings && P.Settings.reduceFlash); }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(v) { v = clamp01(v); return 1 - (1 - v) * (1 - v); }
  function go() { return !P.Fx || !P.Fx.flashGo || P.Fx.flashGo('moment'); }   // the moments pool (T4 part 15)
  function hash1(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function font(px) { return 'italic 900 ' + px + 'px "CM Bangers", Bangers, Impact, sans-serif'; }

  S.reset = function () {
    S.t = 0; S.tearOn = false; S.tearAge = 0; S.wipe = null; S.word = null; S.pending = null; S.ribbon = null; S.veilA = 0;
    S.pieces.forEach(function (p) { p.on = false; });
  };

  // ---------- events from moments.js ----------
  // The dash tear takes one budget slot; without one the ghosts still show.
  S.tear = function () { if (go()) { S.tearOn = true; S.tearAge = 0; } };

  function showStreak(n, wipe) {
    var k = C().streak;
    S.word = { key: 'mo.streak' + n, age: 0, T: k.bannerT };
    S.pending = null;
    if (wipe && !rm()) S.wipe = { age: 0, T: k.wipeT };
  }
  // A kill-streak mark. The ink wipe and the word are bright starts: one budget slot. With none free the word waits up to queueT s
  // for one. Under Reduce flashing the word shows steady, with no wipe and no pop.
  S.streak = function (n) {
    if (rf()) { showStreak(n, false); return; }
    if (go()) showStreak(n, true);
    else S.pending = { n: n, until: S.t + C().streak.queueT };
  };

  S.clear = function (s) {
    var k = C().clear, i, p, n = rm() ? 0 : k.n, lv = s && s.levelInfo, name = lv && lv.hood ? lv.hood.name : '';
    if (!S.pieces.length) for (i = 0; i < PIECES; i++) S.pieces.push({ on: false, fx: 0, y: 0, vx: 0, vy: 0, a: 0, va: 0, fp: 0, fv: 0, kind: 0, sz: 0, age: 0, T: 1 });
    for (i = 0; i < S.pieces.length; i++) {
      p = S.pieces[i]; p.on = i < n;
      if (!p.on) continue;
      p.fx = Math.random(); p.y = -12 - Math.random() * 90; p.vx = (Math.random() - 0.5) * 2 * k.drift; p.vy = 30 + Math.random() * 50;
      p.a = Math.random() * TAU; p.va = (Math.random() - 0.5) * 2 * k.spin; p.fp = Math.random() * TAU; p.fv = 1.2 + Math.random();
      p.kind = i % 2; p.sz = k.size * (0.8 + 0.4 * Math.random()); p.age = 0; p.T = k.life * (0.8 + 0.4 * Math.random());
    }
    S.ribbon = { name: name || '', age: 0, T: k.ribbonT };
  };

  // ---------- per frame ----------
  S.update = function (dt, s) {
    var k = C(), i, p, lo = P.Moments && P.Moments.lowOn, target, step;
    S.t += dt;
    if (S.tearOn && (S.tearAge += dt) >= k.dash.tearT) S.tearOn = false;
    if (S.wipe && (S.wipe.age += dt) >= S.wipe.T) S.wipe = null;
    if (S.word && (S.word.age += dt) >= S.word.T) S.word = null;
    if (S.pending) {
      if (S.t > S.pending.until) S.pending = null;
      else if (go()) showStreak(S.pending.n, true);
    }
    if (S.ribbon && (S.ribbon.age += dt) >= S.ribbon.T) S.ribbon = null;
    target = lo ? 1 : 0; step = Math.min(1, dt / k.low.veilIn);
    S.veilA += (target - S.veilA) * step;
    for (i = 0; i < S.pieces.length; i++) {
      p = S.pieces[i]; if (!p.on) continue;
      if ((p.age += dt) >= p.T) { p.on = false; continue; }
      p.vy = Math.min(k.clear.vmax, p.vy + k.clear.grav * dt);
      p.y += p.vy * dt; p.fx += p.vx * dt / S.W; p.a += p.va * dt;
    }
  };

  // ---------- drawing ----------
  S.draw = function (R, s) {
    var c = R.ctx;
    S.W = R.W; S.H = R.H;
    drawLens(c, R);
    drawTear(c, R, s);
    drawVeil(c, R);
    drawWipe(c, R);
    drawWord(c, R);
    drawConfetti(c, R);
    drawRibbon(c, R);
    c.globalAlpha = 1;
  };

  // Ground-shock lens: the picture inside a ring's band is copied and drawn back magnified about the centre, so the ground and the
  // crowd bulge outward for the ring's life. Device pixels; one copy of a small box per active ring. No colour change.
  function drawLens(c, R) {
    var k = C().shock, cv = c.canvas, dpr = R.dpr || 1, list = P.Moments ? P.Moments.shocks : [], i, o, f, rr, bw, sc, p, X, Y,
      outer, inner, x0, y0, w, h, lc, lx;
    if (rm() || !list.length) return;
    for (i = 0; i < list.length; i++) {
      o = list[i]; if (!o.on) continue;
      f = o.age / o.T;
      rr = (k.r0 + (o.r1 - k.r0) * ease(f)) * R.ppm * dpr;
      bw = rr * k.band; sc = 1 + k.zoom * (1 - f);
      p = R.toScreen(o.x, o.y); X = p.x * dpr; Y = p.y * dpr;
      outer = rr + bw / 2; inner = Math.max(0, rr - bw / 2);
      x0 = Math.max(0, Math.floor(X - outer - 2)); y0 = Math.max(0, Math.floor(Y - outer - 2));
      w = Math.min(cv.width, Math.ceil(X + outer + 2)) - x0; h = Math.min(cv.height, Math.ceil(Y + outer + 2)) - y0;
      if (w <= 0 || h <= 0) continue;
      if (!S.lens) { S.lens = document.createElement('canvas'); S.lensC = S.lens.getContext('2d'); }
      if (S.lens.width < w || S.lens.height < h) { S.lens.width = Math.max(S.lens.width, w); S.lens.height = Math.max(S.lens.height, h); }
      lc = S.lensC; lc.setTransform(1, 0, 0, 1, 0, 0); lc.drawImage(cv, x0, y0, w, h, 0, 0, w, h);
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
      c.beginPath(); c.arc(X, Y, outer, 0, TAU); c.arc(X, Y, inner, 0, TAU, true); c.clip();
      c.translate(X, Y); c.scale(sc, sc); c.translate(-X, -Y);
      c.drawImage(S.lens, 0, 0, w, h, x0, y0, w, h);
      c.restore();
    }
  }

  // Dash tear: bands of the picture across the hero's row shift sideways, a red and a cyan fringe at each band edge. The band
  // positions move `tearRate` times a second (quantised), for `tearT` s.
  function drawTear(c, R, s) {
    var k = C().dash, cv = c.canvas, dpr = R.dpr || 1, step, i, y, hh, dx, cy, span, sh, fw;
    if (!S.tearOn || !s || !s.hero) return;
    cy = R.toScreen(s.hero.x, s.hero.y).y * dpr; span = k.tearSpan * dpr; sh = k.tearShift * dpr; fw = 3 * dpr;
    step = Math.floor(S.tearAge * k.tearRate);
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
    for (i = 0; i < k.tearBands; i++) {
      y = cy - span + hash1(step * 3.1 + i * 7.7) * 2 * span; hh = (8 + hash1(step * 5.3 + i) * 26) * dpr;
      dx = (hash1(step * 2.9 + i * 1.3) - 0.5) * 2 * sh;
      c.drawImage(cv, 0, y, cv.width, hh, dx, y, cv.width, hh);
      c.fillStyle = 'rgba(255,50,90,' + k.fringe + ')'; c.fillRect(dx > 0 ? dx - fw : cv.width + dx, y, fw, hh);
      c.fillStyle = 'rgba(60,220,255,' + k.fringe + ')'; c.fillRect(dx > 0 ? dx : cv.width + dx - fw, y, fw, hh);
    }
    c.restore();
  }

  // Last stand: the screen edges grey in under a veil. It holds steady (no pulse); the heartbeat stays in render.js.
  function drawVeil(c, R) {
    var k = C().low;
    if (S.veilA < 0.005) return;
    if (!S.veilG || S.veilC !== c) {
      S.veilG = c.createRadialGradient(R.W / 2, R.H / 2, R.H * 0.36, R.W / 2, R.H / 2, R.H * 0.75);
      S.veilG.addColorStop(0, 'rgba(128,128,128,0)'); S.veilG.addColorStop(1, 'rgba(128,128,128,1)'); S.veilC = c;
    }
    c.globalAlpha = S.veilA * k.veil; c.fillStyle = S.veilG; c.fillRect(0, 0, R.W, R.H); c.globalAlpha = 1;
  }

  // Ink wipe: two dark bands run in from the left and right edges, meet the middle, and run back out (edges are ragged).
  function drawWipe(c, R) {
    var w = S.wipe, k = C().streak, t, inn, W = R.W, H = R.H, wd, i, n = JAG.length;
    if (!w) return;
    t = w.age / w.T;
    inn = t < 0.5 ? ease(t * 2) : ease((1 - t) * 2);
    if (inn <= 0) return;
    wd = k.wipeFrac * W * inn;
    c.globalAlpha = k.wipeA; c.fillStyle = 'rgb(' + INK + ')';
    c.beginPath(); c.moveTo(0, 0);
    for (i = 0; i < n; i++) c.lineTo(wd + JAG[i] * k.wipeJag, i * H / (n - 1));
    c.lineTo(0, H); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(W, 0);
    for (i = 0; i < n; i++) c.lineTo(W - wd - JAG[i] * k.wipeJag, i * H / (n - 1));
    c.lineTo(W, H); c.closePath(); c.fill();
    c.globalAlpha = 1;
  }

  // Streak word: an ink splash (a wide blob, pops in with an overshoot) with the gold word on it. Steady under Reduce flashing and
  // Reduce motion (no pop).
  function drawWord(c, R) {
    var w = S.word, k = C().streak, a, sc, t, rr = k.splashR * R.W, i, n = BLOB.length, ang, x, y, txt, fit;
    if (!w) return;
    t = w.age / k.popIn;
    sc = rm() || rf() ? 1 : (t < 1 ? clamp01(t) * 1.12 : 1.12 - 0.12 * clamp01((w.age - k.popIn) / 0.12));
    a = clamp01((w.T - w.age) / k.fadeT);
    c.globalAlpha = a;
    c.save(); c.translate(R.W / 2, R.H * k.wordY); c.scale(sc, sc);
    c.beginPath();
    for (i = 0; i <= n; i++) {
      ang = (i % n) / n * TAU; x = Math.cos(ang) * rr * BLOB[i % n]; y = Math.sin(ang) * rr * 0.3 * BLOB[i % n];
      if (i) c.lineTo(x, y); else c.moveTo(x, y);
    }
    c.closePath(); c.fillStyle = 'rgba(' + INK + ',' + k.inkA + ')'; c.fill();
    c.font = font(k.fontPx); c.textAlign = 'center'; c.textBaseline = 'middle';
    txt = P.t(w.key); fit = Math.min(1, rr * 1.6 / Math.max(1, c.measureText(txt).width));
    c.scale(fit, fit);
    c.lineWidth = 6; c.strokeStyle = 'rgb(' + INK + ')'; c.fillStyle = 'rgb(' + GOLD + ')';
    c.strokeText(txt, 0, 0); c.fillText(txt, 0, 0);
    c.restore(); c.globalAlpha = 1;
  }

  // Level clear: paper simit rings and tulip tea glasses falling past the screen (screen pixels, spin and a flip that changes width).
  function drawConfetti(c, R) {
    var k = C().clear, W = R.W, i, p, a, x, sx, s0;
    for (i = 0; i < S.pieces.length; i++) {
      p = S.pieces[i]; if (!p.on) continue;
      a = clamp01((p.T - p.age) / k.fadeT);
      x = p.fx * W; sx = 0.25 + 0.75 * Math.abs(Math.cos(p.fp + p.age * p.fv)); s0 = p.sz;
      c.globalAlpha = a;
      c.save(); c.translate(x, p.y); c.rotate(p.a); c.scale(sx, 1);
      if (p.kind === 0) {                                     // paper simit: a ring with sesame seeds
        c.strokeStyle = 'rgb(201,138,69)'; c.lineWidth = s0 * 0.5;
        c.beginPath(); c.arc(0, 0, s0 * 0.7, 0, TAU); c.stroke();
        c.fillStyle = 'rgb(244,235,221)'; c.beginPath(); c.arc(s0 * 0.7, 0, s0 * 0.14, 0, TAU); c.fill();
      } else {                                                // tulip tea glass: bowl, stem and foot
        c.fillStyle = 'rgb(233,162,59)'; c.strokeStyle = 'rgb(' + INK + ')'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(-0.5 * s0, -s0); c.lineTo(0.5 * s0, -s0);
        c.quadraticCurveTo(0.5 * s0, 0.2 * s0, 0, 0.35 * s0); c.quadraticCurveTo(-0.5 * s0, 0.2 * s0, -0.5 * s0, -s0);
        c.closePath(); c.fill(); c.stroke();
        c.fillRect(-0.08 * s0, 0.35 * s0, 0.16 * s0, 0.5 * s0);
        c.fillRect(-0.35 * s0, 0.85 * s0, 0.7 * s0, 0.15 * s0);
      }
      c.restore();
    }
    c.globalAlpha = 1;
  }

  // Hood ribbon: the hood name bounces in (a damped spring) and fades in its last `ribbonFade` s. Static under Reduce motion.
  function drawRibbon(c, R) {
    var r = S.ribbon, k = C().clear, t, sc, a, txt, w, hh = k.h, cx = R.W / 2, cy = R.H * 0.3;
    if (!r) return;
    t = r.age;
    sc = rm() ? 1 : Math.max(0, 1 - Math.exp(-k.bounceK * t) * Math.cos(TAU * k.bounceHz * t));
    a = clamp01((r.T - t) / k.ribbonFade);
    txt = P.upper ? P.upper(r.name) : r.name;
    c.font = font(k.fontPx); c.textAlign = 'center'; c.textBaseline = 'middle';
    w = c.measureText(txt).width + 64;
    c.globalAlpha = a;
    c.save(); c.translate(cx, cy); c.scale(sc, sc);
    c.beginPath(); c.moveTo(-w / 2, -hh / 2); c.lineTo(w / 2, -hh / 2); c.lineTo(w / 2 - 14, 0); c.lineTo(w / 2, hh / 2);
    c.lineTo(-w / 2, hh / 2); c.lineTo(-w / 2 + 14, 0); c.closePath();
    c.fillStyle = 'rgb(' + GOLD + ')'; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgb(' + INK + ')'; c.stroke();
    c.fillStyle = 'rgb(' + INK + ')'; c.fillText(txt, 0, 1);
    c.restore(); c.globalAlpha = 1;
  }

  // Read-only state for the tests and the moments harness (nothing in the game reads it).
  S.active = function () {
    var i, n = 0;
    for (i = 0; i < S.pieces.length; i++) if (S.pieces[i].on) n++;
    return { pieces: n, tear: S.tearOn, wipe: !!S.wipe, word: S.word ? S.word.key : '', ribbon: S.ribbon ? S.ribbon.name : null,
      pending: !!S.pending, veil: S.veilA };
  };

  return S;
})();
