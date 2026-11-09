// Launch effects, part 4 (view only, workstream W): forge jet embers, grinder sparks, hookpull splash and reel spray, minibus
// air rush, and four new sim events: forgeStain (scorch patch and embers), grinderStack (sparks, larger per stack), oltaHaul
// (ripple ring and hauled streaks) and doorSlam (dust ring and paving chips). The events are chained onto P.FireAnimFx.event,
// so the fx3 events still reach their handlers. Each fx is one-shot (k.f flags) or rate limited with F.chance. No camera
// shake, no quake imagery, no flash faster than 3 per second. Poses are in fire-anim-held4.js; loads after fire-anim-fx3.js.
P.FireAnimFx = P.FireAnimFx || {};
(function (X) {
  var M = P.FireAnimPrim, TAU = Math.PI * 2, SCORCH_MAX = 4, SCORCH_T = 2, WHITE = '255,255,255';
  var scorch = [];   // forge stain patches: { x, y, r, t } in world metres, fading over SCORCH_T seconds
  function HELD() { return P.FireAnimHeld; }
  // World point of local (lx, ly) in a frame at (x, y) aimed at a (same mapping as M.begin).
  function local(x, y, a, lx, ly) {
    return { x: x + Math.cos(a) * lx + Math.sin(a) * ly, y: y + Math.sin(a) * lx - Math.cos(a) * ly };
  }
  function aimUp(G, tilt) { return G.ang + G.side * tilt; }
  function clampN(v, lo, hi) { v = v | 0; return v < lo ? lo : v > hi ? hi : v; }
  // Sparks that fly out and fall (additive kind 'spark'). spd is the horizontal speed cap, lift the vertical one (m/s).
  function sparks(F, x, y, n, col, spd, lift) {
    var i, p;
    for (i = 0; i < F.count(n); i++) {
      p = F.spawn('spark', x + M.rnd(-0.1, 0.1), y + M.rnd(-0.05, 0.05), M.rnd(0.2, 0.35), 0, col);
      p.vx = M.rnd(-spd, spd); p.vy = M.rnd(-spd * 0.5, spd * 0.5); p.vz = M.rnd(0.2, lift); p.grav = 1;
    }
  }
  function ring(F, x, y, T, r, col) { var p = F.spawn('ring', x, y, T, r, col); p.op = 0.8; return p; }

  // ---------- Forge (Ocak Ağzı): a flame puff and sparks at the ignition; embers ride the jet while it burns ----------
  X.forge = {
    tick: function (F, G, k, dt) {
      var t = k.t, s, hm, q, a, p, i;
      if (t < 0.12) return;
      s = HELD().forge.state(t); a = aimUp(G, s.tilt);
      hm = G.pt(0, 0, s.hf, s.hu, 0); q = local(hm.x, hm.y, a, 0.25, 0);
      if (!k.f.light) {
        k.f.light = true;
        for (i = 0; i < F.count(8); i++) { p = F.spawn('flame', q.x, q.y, 0.25, 0.06, '255,130,40'); p.vx = M.rnd(-0.6, 0.6); p.vy = M.rnd(-0.4, 0.6); }
        sparks(F, q.x, q.y, 6, '255,200,90', 1.5, 1);
      }
      if (t > 0.5 || !F.chance(45, dt)) return;
      p = F.spawn('flame', q.x, q.y, 0.2, 0.05, '255,120,30');
      p.vx = Math.cos(a) * 1.2 + M.rnd(-0.2, 0.2); p.vy = Math.sin(a) * 1.2 + M.rnd(-0.2, 0.2);
      if (F.chance(12, dt)) sparks(F, q.x, q.y, 1, '255,160,60', 0.8, 0.8);
    }
  };

  // ---------- Grinder (Öğütücü): the wheel bites at the start of the cut, then sparks spray while it grinds ----------
  function wheelAt(G, t) {
    var s = HELD().grinder.state(t), hm = G.pt(0, 0, s.mf, s.mu, 0);
    return local(hm.x, hm.y, G.ang, 0.36, 0.08);
  }
  X.grinder = {
    tick: function (F, G, k, dt) {
      var t = k.t, q;
      if (t < 0.3 || t > 0.5) return;
      q = wheelAt(G, t);
      if (!k.f.bite) { k.f.bite = true; sparks(F, q.x, q.y, 8, '255,200,110', 2, 1.2); return; }
      if (F.chance(50, dt)) sparks(F, q.x, q.y, 1, '255,170,70', 1.6, 0.8);
    }
  };

  // ---------- Hookpull (Çeki Halatı): a swish at the throw, a white twang ring when the line goes taut, then water spray on the reel-in ----------
  X.hookpull = {
    tick: function (F, G, k, dt) {
      var t = k.t, s, p;
      if (!k.f.cast && t >= 0.16) {
        k.f.cast = true; s = HELD().hookpull.at(G, t, k.lv);
        p = F.spawn('arc', s.hand.x, s.hand.y, 0.2, 0.6, WHITE); p.a = -G.ang; p.w = 0.9; p.op = 0.7;
      }
      if (!k.f.taut && t >= 0.3) {
        k.f.taut = true; s = HELD().hookpull.at(G, t, k.lv);
        ring(F, s.hook.x, s.hook.y, 0.2, 0.25, '230,240,255');
      }
      if (t >= 0.42 && t < 0.6 && F.chance(30, dt)) {
        s = HELD().hookpull.at(G, t, k.lv);
        sparks(F, s.hook.x, s.hook.y, 1, '63,167,214', 0.8, 0.6);
      }
    }
  };

  // ---------- Minibus door (Minibüs Kapısı): an air rush up past the door as it drops; the landing is the doorSlam event ----------
  X.minibus = {
    tick: function (F, G, k, dt) {
      var t = k.t, s, C, cx, cy, p;
      if (t < 0.32 || t > 0.44 || !F.chance(40, dt)) return;
      s = HELD().minibus.state(t); C = G.pt(4, 2, s.fwd, s.up, 0); cx = C.x; cy = C.y;
      p = F.spawn('streak', cx + M.rnd(-0.2, 0.2), cy + M.rnd(-0.1, 0.25), 0.12, 0, '230,240,250');
      p.vx = 0; p.vy = 2.5; p.op = 0.5;
    }
  };

  // ---------- Events (routed from FireAnim.onEvent through P.FireAnimFx.event) ----------
  var mine = {
    forgeStain: function (F, ev) {
      var n = clampN(ev.n, 0, 6);
      if (scorch.length >= SCORCH_MAX) scorch.shift();
      scorch.push({ x: ev.x, y: ev.y, r: ev.r > 0 ? ev.r : 0.6, t: SCORCH_T });
      sparks(F, ev.x, ev.y, 4 + n, '255,140,60', 1.6, 1.4);
    },
    grinderStack: function (F, ev) {
      var n = clampN(ev.n, 1, 3);
      sparks(F, ev.x, ev.y, 3 + 3 * n, '255,200,110', 0.8 + 0.5 * n, 0.8 + 0.4 * n);
    },
    oltaHaul: function (F, ev) {
      var r = ev.r > 0 ? ev.r : 1, n = clampN(ev.n, 0, 4), i, a, p;
      ring(F, ev.x, ev.y, 0.3, r, '200,240,255');                              // taut ripple, expanding from the hook
      for (i = 0; i < F.count(3 * n + 2); i++) {                               // hauled enemies, as streaks sliding in
        a = M.rnd(0, TAU);
        p = F.spawn('streak', ev.x + Math.cos(a) * r, ev.y + Math.sin(a) * r, 0.3, 0, '230,240,250');
        p.vx = -Math.cos(a) * r / 0.3; p.vy = -Math.sin(a) * r / 0.3; p.op = 0.6;
      }
    },
    doorSlam: function (F, ev) {
      var r = ev.r > 0 ? ev.r : 1.2, n = clampN(ev.n, 0, 6), cnt = F.count(10), i, a, p;
      for (i = 0; i < cnt; i++) {                                              // dust ring on the ground (squashed)
        a = i / cnt * TAU;
        p = F.spawn('dust', ev.x + Math.cos(a) * r * 0.9, ev.y + Math.sin(a) * r * 0.9 * 0.35, 0.45, 0.14, '170,160,150');
        p.op = 0.5; p.vx = Math.cos(a) * 0.6; p.vy = Math.sin(a) * 0.2;
      }
      for (i = 0; i < Math.min(6, 2 + n); i++) {                               // a few paving chips, no cracks
        p = F.spawn('chip', ev.x + M.rnd(-0.4, 0.4) * r, ev.y + 0.05, 0.6, 0.07, '150,146,140');
        p.grav = 1; p.bounce = true; p.vx = M.rnd(-1.4, 1.4); p.vy = M.rnd(-0.2, 0.2); p.vz = M.rnd(1.2, 2.2);
        p.a = M.rnd(0, TAU); p.va = M.rnd(-8, 8);
      }
    }
  };

  // Non-wfire events: ours first, then whatever was routed before this file (fx3's evolution events).
  var prev = P.FireAnimFx.event;
  P.FireAnimFx.event = function (F, ev) {
    if (Object.prototype.hasOwnProperty.call(mine, ev.type)) mine[ev.type](F, ev);
    else if (prev) prev(F, ev);
  };

  // Forge scorch patches: they age in track and draw as dark ground ellipses (flattened for the 3/4 view).
  var prevTrack = X.track, prevDraw = X.draw;
  X.track = function (F, s, dt) {
    var i;
    if (prevTrack) prevTrack(F, s, dt);
    for (i = scorch.length - 1; i >= 0; i--) { scorch[i].t -= dt; if (scorch[i].t <= 0) scorch.splice(i, 1); }
  };
  X.draw = function (F, s) {
    var i, sc, c = F.c;
    if (prevDraw) prevDraw(F, s);
    for (i = 0; i < scorch.length; i++) {
      sc = scorch[i];
      M.begin(F, sc.x, sc.y, 0);
      c.beginPath(); c.ellipse(0, 0, sc.r, sc.r * 0.35, 0, 0, TAU);
      c.fillStyle = M.rgba('40,26,18', 0.55 * Math.min(1, sc.t / 0.5)); c.fill();
      M.end(F);
    }
  };
})(P.FireAnimFx);
