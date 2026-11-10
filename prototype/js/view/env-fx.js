// Environment view (lane A, AUDIT-6 A1-A5): ground decals (wet tiles, glass and debris slicks, foam, gas clouds,
// manhole lids), prop overlays (cover cracks, fuse glow and canister hiss, door and window openings), air telegraphs
// (cable sparks, chain arcs) and the sfx and floating labels for env events. Read-only on the sim: it reads s.env,
// s.geo and s.ev, and writes only its own state and the existing P.Fx particle and letter lists. Hooks: render.js
// calls drawGround, drawProps and drawAir (guarded). Every flash here stays under 3 per second: fuses and telegraphs
// ramp or breathe, and the blast flash is the existing one.
(function () {
  var F = {}, TAU = Math.PI * 2;
  function inView(R, y, pad) { return Math.abs(y - R.cam.y) < P.viewHalfH(R.cam.w) + pad; }
  function ell(c, X, Y, rx, ry, fill) { c.beginPath(); c.ellipse(X, Y, Math.max(0.3, rx), Math.max(0.3, ry), 0, 0, TAU); c.fillStyle = fill; c.fill(); }
  // Deterministic jagged line for the arc shapes; the seed changes at a fixed rate (<= 3 shape changes per second).
  function jag(c, X0, Y0, X1, Y1, seed, amp) {
    var n = 5, i, t, nx = -(Y1 - Y0), ny = X1 - X0, L = Math.hypot(nx, ny) || 1;
    c.beginPath(); c.moveTo(X0, Y0);
    for (i = 1; i < n; i++) {
      t = i / n; var o = (Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453) % 1;
      var k = (o - 0.5) * amp;
      c.lineTo(X0 + (X1 - X0) * t + nx / L * k, Y0 + (Y1 - Y0) * t + ny / L * k);
    }
    c.lineTo(X1, Y1); c.stroke();
  }
  function shapeSeed(t, rate) { return Math.floor(t * rate) + 1; }

  // ---------- ground ----------
  function puddle(R, z, t) {
    var c = R.ctx, u = R.ppm, X = R.X(z.x), Y = R.Y(z.y), rx = z.r * u, ry = z.r * 0.55 * u, k, f;
    var fade = Math.min(1, z.t / 1.5);
    ell(c, X, Y, rx, ry, 'rgba(70,120,160,' + (0.42 * fade).toFixed(3) + ')');
    c.strokeStyle = 'rgba(190,225,240,' + (0.5 * fade).toFixed(3) + ')'; c.lineWidth = 1.5;
    c.beginPath(); c.ellipse(X, Y, rx, ry, 0, 0, TAU); c.stroke();
    for (k = 0; k < 2; k++) {
      f = (t * 0.7 + k * 0.5 + z.x * 0.13) % 1;
      c.strokeStyle = 'rgba(220,240,250,' + (0.5 * (1 - f) * fade).toFixed(3) + ')';
      c.beginPath(); c.ellipse(X, Y, rx * f, ry * f, 0, 0, TAU); c.stroke();
    }
    if (z.live > 0) crackle(R, z, t);
  }
  function crackle(R, z, t) {
    var c = R.ctx, u = R.ppm, X = R.X(z.x), Y = R.Y(z.y), s = shapeSeed(t, 3), i;
    c.strokeStyle = 'rgba(160,235,255,0.9)'; c.lineWidth = 1.6;
    for (i = 0; i < 3; i++) {
      var a = (i / 3) * TAU + s * 0.7, r = z.r * 0.7 * u;
      jag(c, X, Y, X + Math.cos(a) * r, Y + Math.sin(a) * r * 0.55, s * 3 + i, 0.25 * u);
    }
  }
  function slick(R, z, col, glint) {
    var c = R.ctx, u = R.ppm, X = R.X(z.x), Y = R.Y(z.y), a = Math.min(1, z.t / z.T * 2);
    ell(c, X, Y, z.r * u, z.r * 0.6 * u, col.replace('A', (0.22 * a).toFixed(3)));
    c.strokeStyle = glint.replace('A', (0.6 * a).toFixed(3)); c.lineWidth = 1.2;
    for (var i = -2; i <= 2; i++) {
      var x = z.x + i * z.r * 0.3;
      c.beginPath(); c.moveTo(R.X(x - 0.2), R.Y(z.y - 0.15)); c.lineTo(R.X(x + 0.2), R.Y(z.y + 0.15)); c.stroke();
    }
  }
  function foam(R, z, t) {
    var c = R.ctx, u = R.ppm, X = R.X(z.x), Y = R.Y(z.y), p = 1 - z.t / z.T, i;
    ell(c, X, Y, z.r * u * (0.7 + 0.3 * p), z.r * 0.6 * u * (0.7 + 0.3 * p), 'rgba(240,246,250,' + (0.45 * (1 - p * 0.5)).toFixed(3) + ')');
    for (i = 0; i < 6; i++) {
      var a = i * 1.05 + z.x, rr = z.r * (0.3 + 0.6 * ((p + i * 0.17) % 1));
      ell(c, R.X(z.x + Math.cos(a) * rr), R.Y(z.y + Math.sin(a) * rr * 0.6), 0.12 * u, 0.12 * u, 'rgba(255,255,255,0.7)');
    }
  }
  function gasCloud(R, z, t) {
    var c = R.ctx, u = R.ppm, X = R.X(z.x), Y = R.Y(z.y), k, a, rr;
    ell(c, X, Y, z.r * u, z.r * 0.7 * u, 'rgba(170,205,120,0.26)');
    for (k = 0; k < 4; k++) {
      a = k * 1.6 + t * 0.9; rr = z.r * (0.4 + 0.3 * ((k * 0.31) % 1));
      ell(c, R.X(z.x + Math.cos(a) * rr), R.Y(z.y + Math.sin(a) * rr * 0.6), 0.2 * u, 0.2 * u, 'rgba(200,230,150,0.3)');
    }
  }
  function manhole(R, p, t) {
    var c = R.ctx, u = R.ppm, X = R.X(p.x), Y = R.Y(p.y), glow = p.state === 'open' ? 0.2 + 0.5 * Math.min(1, p.t / p.T) : 0;
    ell(c, X, Y, 0.5 * u, 0.28 * u, '#2A2C31');
    c.strokeStyle = '#14151F'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(X - 0.35 * u, Y); c.lineTo(X + 0.35 * u, Y); c.stroke();
    if (glow) ell(c, X, Y, 0.55 * u, 0.32 * u, 'rgba(255,170,80,' + glow.toFixed(3) + ')');
  }

  F.drawGround = function (R, s) {
    var E = s.env, t = performance.now() / 1000, i, z;
    if (!E) return;
    for (i = 0; i < E.zones.length; i++) {
      z = E.zones[i];
      if (!inView(R, z.y, z.r + 2)) continue;
      if (z.kind === 'puddle') puddle(R, z, t);
      else if (z.kind === 'glass') slick(R, z, 'rgba(200,220,230,A)', 'rgba(235,248,255,A)');
      else if (z.kind === 'debris') slick(R, z, 'rgba(150,110,70,A)', 'rgba(230,200,150,A)');
      else if (z.kind === 'foam') foam(R, z, t);
      else if (z.gas) gasCloud(R, z, t);
    }
    for (i = 0; i < E.portals.length; i++) {
      if (E.portals[i].kind === 'manhole' && inView(R, E.portals[i].y, 2)) manhole(R, E.portals[i], t);
    }
  };

  // ---------- props: cover cracks, bomb glow, canister hiss, door and window openings, hazard car fuse ----------
  function cracks(R, r) {
    var c = R.ctx, u = R.ppm, X = R.X(r.x), Y = R.Y(r.y), dmg = 1 - Math.max(0, r.hp) / r.max, w = r.b.w * u, h = r.b.h * u, i;
    if (dmg <= 0) return;
    c.strokeStyle = 'rgba(20,21,31,' + (0.25 + 0.5 * dmg).toFixed(3) + ')'; c.lineWidth = 1.2;
    for (i = 0; i < 3; i++) {
      var a = i * 2.1 + r.x, len = 0.45 * u * dmg;
      jag(c, X + Math.cos(a) * w * 0.1, Y + Math.sin(a) * h * 0.1, X + Math.cos(a) * (w * 0.4 + len), Y + Math.sin(a) * (h * 0.4 + len), i + 1, 0.12 * u);
    }
  }
  // Queue a draw at depth y (render.js R.depth); a renderer without the queue draws it at once.
  function queue(R, y, fn, occ) { if (R.depth) R.depth(y, fn, occ); else fn(); }
  function glowAt(R, x, y, r, a) { P.Props.h.glow(R.ctx, R.X(x), R.Y(y), r, a); }
  function canisterSteam(R, r, t, p) {
    var c = R.ctx, u = R.ppm, k, f, a, rr;
    for (k = 0; k < 4; k++) {
      f = (t * 1.2 + k * 0.25) % 1;
      a = (1 - f) * (0.25 + 0.45 * p);
      c.fillStyle = 'rgba(235,240,245,' + a.toFixed(3) + ')';
      rr = (0.16 + 0.28 * f) * u;
      c.beginPath(); c.arc(R.X(r.x + Math.sin(k * 2.3) * 0.2), R.Y(r.y) - (0.4 + 0.9 * f) * u, rr, 0, TAU); c.fill();
    }
  }
  function fusedProgress(r) { return r.fuseMax > 0 ? Math.min(1, 1 - r.fuseT / r.fuseMax) : 0; }
  function recOverlay(R, r, t) {
    if (r.kind === 'gascan') {
      if (r.fuseT > 0) { var p = fusedProgress(r); glowAt(R, r.x, r.y, 1.1 * R.ppm, 0.25 + 0.5 * p); canisterSteam(R, r, t, p); }
      else glowAt(R, r.x, r.y, 0.7 * R.ppm, 0.1);
    } else if (r.bomb) {
      if (r.fuseT > 0) glowAt(R, r.x, r.y, 1.6 * R.ppm, 0.3 + 0.55 * fusedProgress(r));
      else glowAt(R, r.x, r.y, 1.2 * R.ppm, 0.16 + 0.04 * Math.sin(t * TAU * 0.5));   // breathing, not strobing
    }
    if (r.hp < r.max) cracks(R, r);
  }
  function openingOverlay(R, p) {
    var c = R.ctx, u = R.ppm, X = R.X(p.x), Y = R.Y(p.y), w = (p.kind === 'door' ? 1.1 : 1.0) * u, h = (p.kind === 'door' ? 2.0 : 0.8) * u;
    var a = p.state === 'open' ? 0.2 + 0.6 * Math.min(1, p.t / p.T) : p.state === 'spill' ? Math.max(0.2, 0.8 - p.t) : 0;
    if (!a || p.kind === 'manhole') return;
    c.fillStyle = 'rgba(255,190,90,' + a.toFixed(3) + ')'; c.fillRect(X - w / 2, Y - h / 2, w, h);
    c.strokeStyle = 'rgba(20,21,31,0.8)'; c.lineWidth = 2; c.strokeRect(X - w / 2, Y - h / 2, w, h);
  }
  function hazardCarGlow(R, s) {
    var L = s.ev ? s.ev.list : [], i, ev;
    for (i = 0; i < L.length; i++) {
      ev = L[i];
      if (ev.done || ev.kind !== 'hazard' || ev.sub !== 'car' || !ev.T) continue;
      glowAt(R, ev.x, ev.y, 1.6 * R.ppm, 0.3 + 0.55 * Math.min(1, ev.t / ev.T));
    }
  }

  // Block overlays go through the depth queue (render.js R.depth) at the block's base edge, nudged nearer so they draw
  // after the block itself. Wall openings queue as non-occluding decals.
  F.drawProps = function (R, s) {
    var E = s.env, t = performance.now() / 1000, i, r, p;
    if (!E) return;
    for (i = 0; i < E.recs.length; i++) {
      r = E.recs[i];
      if (!r.alive || !inView(R, r.y, 3)) continue;
      queue(R, r.y - r.b.h / 2 - 0.01, (function (rr) { return function () { recOverlay(R, rr, t); }; })(r), true);
    }
    for (i = 0; i < E.portals.length; i++) {
      p = E.portals[i];
      if (p.kind !== 'manhole' && inView(R, p.y, 3)) queue(R, p.y, (function (pp) { return function () { openingOverlay(R, pp); }; })(p), false);
    }
    hazardCarGlow(R, s);
  };

  // ---------- air: cable sparks and chain arcs ----------
  function cable(R, c, t) {
    var x0 = R.X(c.x - c.len / 2), x1 = R.X(c.x + c.len / 2), y = R.Y(c.y), g = R.ctx, s = shapeSeed(t, 3);
    g.strokeStyle = '#14151F'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
    g.strokeStyle = '#E9A23B'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
    if (!c.arcing) return;
    g.strokeStyle = 'rgba(160,235,255,0.95)'; g.lineWidth = 1.6;
    jag(g, x0, y, x0 + (x1 - x0) * 0.33, y - 0.35 * R.ppm, s, 0.3 * R.ppm);
    jag(g, x0 + (x1 - x0) * 0.5, y, x1, y + 0.3 * R.ppm, s + 1, 0.3 * R.ppm);
  }
  function arcs(R, E) {
    var g = R.ctx, i, a, k;
    for (i = 0; i < E.arcs.length; i++) {
      a = E.arcs[i];
      k = Math.min(1, a.t / a.T);
      g.strokeStyle = 'rgba(170,240,255,' + (0.9 * k).toFixed(3) + ')'; g.lineWidth = 2;
      jag(g, R.X(a.x0), R.Y(a.y0), R.X(a.x1), R.Y(a.y1), i + shapeSeed(a.T - a.t, 3), 0.5 * R.ppm);
    }
  }

  F.drawAir = function (R, s) {
    var E = s.env, t = performance.now() / 1000, i;
    if (!E) return;
    for (i = 0; i < E.cables.length; i++) if (inView(R, E.cables[i].y, 2)) cable(R, E.cables[i], t);
    arcs(R, E);
  };

  // ---------- events: sfx, particles, floating labels ----------
  function shards(x, y, col, n) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * TAU, v = 1.5 + Math.random() * 3;
      P.Fx.parts.push({ kind: 'shard', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0.45, T: 0.45, col: col });
    }
  }
  var SFX = { envBreak: null, envFuse: null, envChain: 'click', envIgnite: 'zap', envArc: 'zap', envShock: 'shock',
    envExtinguish: 'hiss', envPortal: 'click', envSpawn: 'doorSlam' };
  var GAP = { envChain: 120, envArc: 200, envShock: 300, envPortal: 200, envSpawn: 150, envIgnite: 200, envExtinguish: 300 };
  var LABEL = { envChain: 'env.chain', envIgnite: 'env.ignite', envExtinguish: 'env.extinguish' };

  // Env events that get a bark (beats BK.env.* in js/dialogue/). P.Barks.say checks the distance to Arda.
  var BARK = { envExplode: 'BK.env.explode', envChain: 'BK.env.chain', envShock: 'BK.env.shock', envSpawn: 'BK.env.door',
    envExtinguish: 'BK.env.extinguish', envFuse: 'BK.env.fuse', envBreak: 'BK.env.break' };

  F.onEvent = function (ev) {
    if (BARK[ev.type] && P.Barks && P.Barks.say && (ev.type !== 'envFuse' || ev.kind === 'car')) P.Barks.say(BARK[ev.type], 1, 'env', ev.x, ev.y);
    if (!P.Fx || !P.Sfx) return;
    if (ev.type === 'envBreak') {
      shards(ev.x, ev.y, ev.mat === 'glass' ? 'glass' : 'wood', ev.tag === 'blunt' ? 12 : 8);
      P.Sfx.play(ev.mat === 'glass' ? 'glass' : 'click', 60);
      if (ev.mat === 'glass') P.Fx.letter(ev.x, ev.y + 1, P.t('env.break'));
      return;
    }
    if (ev.type === 'envFuse') {
      if (ev.kind === 'gas') P.Sfx.play('hiss', 200);
      else P.Sfx.play('zap', 200);
      P.Fx.letter(ev.x, ev.y + 1.2, P.t('env.fuse'));
      return;
    }
    if (ev.type === 'envPortal') {
      P.Fx.letter(ev.x, ev.y + 1.4, P.t(ev.kind === 'door' ? 'env.door' : ev.kind === 'window' ? 'env.window' : 'env.manhole'));
    }
    if (ev.type === 'envShock') P.Fx.letter(ev.x, ev.y + 0.8, P.t('env.live'));
    if (SFX[ev.type]) P.Sfx.play(SFX[ev.type], GAP[ev.type] || 100);
    if (LABEL[ev.type]) P.Fx.letter(ev.x, ev.y + 1, P.t(LABEL[ev.type]));
  };

  P.EnvFx = F;
})();
