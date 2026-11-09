// Launch effects, part 2 (view only, workstream B): extinguisher spray, sawblade boomerang, manhole discus, blowtorch
// jet, olta splash, cardoor shove, slingshot marbles, chainsaw rev and cut. Same contract as fire-anim-fx.js; flights
// added here: 'marble' (slingshot) and 'disc' (manhole). The sawblade's flying disc is drawn on its analytic out-and-back
// path (the sim's body, if any, is separate).
P.FireAnimFx = P.FireAnimFx || {};
(function (X) {
  var M = P.FireAnimPrim, TAU = Math.PI * 2, WHITE = '255,255,255';
  function H() { return P.FireAnimHeld; }
  X.flightOf = X.flightOf || {};

  // Boomerang path of the sawblade: out to D and back over the release point; f = 0 at release, 1 at the catch.
  function sawPos(G, t, lv, out) {
    var o = G.pt(14, 0, 0.3, 0, 0), f = (t - H().sawblade.rel) / (H().sawblade.back - H().sawblade.rel), D = 2.6 + 0.2 * lv;
    var s = Math.sin(Math.PI * M.clamp01(f)), w = 0.35 * Math.sin(2 * Math.PI * M.clamp01(f));
    out.x = o.x + G.ca * D * s - G.sa * w; out.y = o.y + G.sa * D * s + G.ca * w;
    return out;
  }
  var SP = { x: 0, y: 0 }, MN = { x: 0, y: 0 };

  // ---------- Extinguisher (Yangın Tüpü): mist cone from the nozzle, pressure kick in the pose ----------
  X.extinguisher = {
    tick: function (F, G, k, dt) {
      var t = k.t, n, i, q, sp, p;
      if (t > 0.02 && t < 0.24) {
        n = G.pt(7, 0, 0.46, -0.02, 0);
        for (i = 0; i < F.count(2); i++) {
          q = G.ang + M.rnd(-0.3, 0.3); sp = M.rnd(2.2, 3.6);
          p = F.spawn('puff', n.x, n.y, M.rnd(0.3, 0.45), M.rnd(0.05, 0.08), '236,246,255');
          p.op = 0.55; p.vx = Math.cos(q) * sp; p.vy = Math.sin(q) * sp; p.drag = 2.2;
        }
      }
    },
    draw: function (F, G, k) {
      var t = k.t, n, c = F.c, a, A, B, al;
      if (t < 0.02 || t > 0.36) return;
      al = 0.12 * (1 - M.seg(t, 0.2, 0.36));
      n = G.pt(7, 0, 0.46, -0.02, 0);
      A = { x: n.x + Math.cos(G.ang - 0.3) * 1.4, y: n.y + Math.sin(G.ang - 0.3) * 1.4 };
      B = { x: n.x + Math.cos(G.ang + 0.3) * 1.4, y: n.y + Math.sin(G.ang + 0.3) * 1.4 };
      a = F.R;
      c.beginPath(); c.moveTo(a.X(n.x), a.Y(n.y)); c.lineTo(a.X(A.x), a.Y(A.y)); c.lineTo(a.X(B.x), a.Y(B.y)); c.closePath();
      c.fillStyle = 'rgba(230,245,255,' + al.toFixed(3) + ')'; c.fill();
    }
  };

  // ---------- Sawblade (Testere Diski): spark trail on the boomerang path, the disc is drawn on it ----------
  X.sawblade = {
    tick: function (F, G, k, dt) {
      var t = k.t, f = k.f, p, s, o;
      if (!f.rel && t >= H().sawblade.rel) {
        f.rel = true;
        o = G.pt(14, 0, 0.3, 0, 0);
        p = F.spawn('arc', o.x, o.y, 0.18, 0.5, WHITE); p.a = -G.ang; p.w = 0.8; p.op = 0.8;
      }
    }
  };

  // ---------- Manhole cover (Rögar Kapağı): dull clang rings at release; the cover flies on as a flight ----------
  X.manhole = {
    tick: function (F, G, k) {
      var f = k.f, o, p;
      if (!f.rel && k.t >= 0.3) {
        f.rel = true;
        o = G.pt(3, 2, 0.42, 0, 0);
        p = F.spawn('ring', o.x, o.y, 0.3, 0.3, '120,126,136'); p.op = 0.8;
        p = F.spawn('ring', o.x, o.y, 0.22, 0.2, '90,96,106'); p.op = 0.7;
      }
    }
  };
  X.flightOf.disc = {
    step: function (F, f, dt) {
      var p;
      if (F.chance(50, dt)) { p = F.spawn('streak', f.x, f.y, 0.14, 0, '60,64,72'); p.vx = Math.cos(f.ang) * 0.5; p.vy = Math.sin(f.ang) * 0.5; p.op = 0.7; }
      if (F.chance(12, dt)) { p = F.spawn('arc', f.x, f.y, 0.16, 0.2, '90,96,106'); p.a = -f.ang; p.w = 0.5; p.op = 0.6; }
    },
    end: function (F, f) {
      var p = F.spawn('ring', f.x, f.y, 0.4, 0.35, '110,116,126'); p.op = 0.8;
      p = F.spawn('ring', f.x, f.y, 0.3, 0.2, '90,96,106'); p.op = 0.6;
    }
  };

  // ---------- Blowtorch (Pürmüz): ignition sparks, a steady ember stream from the jet ----------
  X.torch = {
    fire: function (F, G, k) {
      var n = G.pt(7, 0, 0.42, 0, 0), i, q, p;
      for (i = 0; i < F.count(6); i++) {
        q = G.ang + M.rnd(-0.6, 0.6);
        p = F.spawn('spark', n.x, n.y, 0.18, 0, '255,200,90'); p.vx = Math.cos(q) * M.rnd(2, 4); p.vy = Math.sin(q) * M.rnd(2, 4);
      }
    },
    tick: function (F, G, k, dt) {
      var t = k.t, n, L, p, q;
      if (t < 0.05) return;
      n = G.pt(7, 0, 0.42, 0, 0);
      if (F.chance(55, dt)) {
        L = 0.42 * M.rnd(0.2, 1); q = G.ang + M.rnd(-0.12, 0.12);
        p = F.spawn('spark', n.x + Math.cos(q) * L * 0.3, n.y + Math.sin(q) * L * 0.3, 0.3, 0, '255,150,50');
        p.vx = M.rnd(-0.3, 0.3); p.vy = M.rnd(-0.3, 0.3); p.vz = M.rnd(0.4, 1.0); p.grav = 1;
      }
      if (F.chance(60, dt)) { p = F.spawn('flame', n.x, n.y, 0.08, 0.03, '127,216,255'); p.vx = Math.cos(G.ang) * 0.5; p.vy = Math.sin(G.ang) * 0.5; }
    }
  };

  // ---------- Fishing rod (Olta): the cast swish, then the splash where the lure lands ----------
  X.olta = {
    tick: function (F, G, k) {
      var f = k.f, hm, p, land;
      if (!f.cast && k.t >= 0.16) {
        f.cast = true; hm = G.pt(0, 0, 0.12, -0.02, 0);
        p = F.spawn('arc', hm.x, hm.y, 0.2, 0.6, WHITE); p.a = -G.ang; p.w = 0.9; p.op = 0.7;
      }
      if (!f.splash && k.t >= 0.44) {
        f.splash = true; hm = G.pt(0, 0, 0.12, -0.02, 0);
        land = { x: hm.x + Math.cos(G.ang) * (0.6 + 2.4 + 0.2 * k.lv), y: hm.y + Math.sin(G.ang) * (0.6 + 2.4 + 0.2 * k.lv) };
        p = F.spawn('ring', land.x, land.y, 0.45, 0.4, '210,235,250'); p.op = 0.9;
        p = F.spawn('ring', land.x, land.y, 0.3, 0.2, '240,250,255'); p.op = 0.9;
        for (var i = 0; i < F.count(6); i++) {
          p = F.spawn('spark', land.x, land.y, 0.3, 0, '200,240,255');
          p.vx = M.rnd(-0.8, 0.8); p.vy = M.rnd(-0.8, 0.8); p.vz = M.rnd(1, 2); p.grav = 1;
        }
      }
    }
  };

  // ---------- Car door (Araba Kapısı): a shove wave and flecks off the door face ----------
  X.cardoor = {
    tick: function (F, G, k) {
      var f = k.f, face, i, p;
      if (!f.shove && k.t >= 0.2) {
        f.shove = true;
        face = G.pt(16, 2, 0.6, 0, 0);
        p = F.spawn('arc', face.x, face.y, 0.22, 0.8, WHITE); p.a = -G.ang; p.w = 0.55; p.op = 0.85;
        for (i = 0; i < F.count(8); i++) {
          p = F.spawn('spark', face.x, face.y + M.rnd(-0.2, 0.2), 0.2, 0, '244,235,221');
          p.vx = G.ca * M.rnd(1.5, 3); p.vy = G.sa * M.rnd(1.5, 3) + M.rnd(-0.5, 0.5); p.vz = M.rnd(0, 0.6); p.grav = 1;
        }
      }
    }
  };

  // ---------- Slingshot (Sapan): at the snap the marbles fly in a fan ----------
  X.slingshot = {
    tick: function (F, G, k) {
      var f = k.f, po, n, i, q, p, fork;
      if (!f.snap && k.t >= 0.2) {
        f.snap = true;
        po = G.pt(17, 2, H().slingshot.pouch(0.2), 0, -0.06);
        n = Math.min(6, Math.max(1, k.n));
        fork = G.pt(18, 2, 0.36, 0.02, 0);
        p = F.spawn('ring', fork.x, fork.y, 0.14, 0.12, WHITE); p.op = 0.8;
      }
    }
  };
  X.flightOf.marble = {
    step: function (F, f, dt) {
      var p;
      if (F.chance(60, dt)) { p = F.spawn('streak', f.x, f.y, 0.12, 0, '170,226,255'); p.vx = Math.cos(f.ang) * 6; p.vy = Math.sin(f.ang) * 6; p.op = 0.8; }
    },
    end: function (F, f) { var p = F.spawn('glint', f.x, f.y, 0.12, 0.05, WHITE); p.a = f.ang; }
  };

  // ---------- Chainsaw (Motorlu Testere): smoke from the exhaust and sparks at the bar tip while revving ----------
  X.chainsaw = {
    fire: function (F, G, k) {
      var tip = G.pt(20, 2, 0.12 + 0.42, -0.03, 0.04), h = G.pt(21, 2, 0.12, -0.03, 0.04), i, q, p;
      p = F.spawn('arc', h.x, h.y, 0.14, 0.4, '220,230,240'); p.a = -G.ang; p.w = 0.5; p.op = 0.6;
      for (i = 0; i < F.count(6); i++) {
        q = G.ang + M.rnd(-0.8, 0.8);
        p = F.spawn('spark', tip.x, tip.y, 0.14, 0, '255,170,60'); p.vx = Math.cos(q) * M.rnd(1.5, 3); p.vy = Math.sin(q) * M.rnd(1.5, 3);
      }
    },
    revTick: function (F, G, dt) {
      var ex = G.pt(22, 2, 0.04, 0.02, 0.04), tip = G.pt(23, 2, 0.12 + 0.42, -0.03, 0.04), p, q;
      if (F.chance(12, dt)) {
        p = F.spawn('puff', ex.x, ex.y, 0.6, 0.05, '70,72,80'); p.op = 0.6; p.vz = 0.7; p.vx = M.rnd(-0.2, 0.2); p.vy = M.rnd(-0.1, 0.1);
      }
      if (F.chance(15, dt)) {
        q = G.ang + Math.PI + M.rnd(-0.6, 0.6);
        p = F.spawn('spark', tip.x, tip.y, 0.12, 0, '255,170,60'); p.vx = Math.cos(q) * M.rnd(0.8, 1.6); p.vy = Math.sin(q) * M.rnd(0.8, 1.6); p.vz = M.rnd(0, 0.8); p.grav = 1;
      }
    }
  };

  // ---------- Flight draws: the marble and the disc (the sawblade is drawn in its tick/draw path) ----------
  var baseDraw = X.draw;
  X.draw = function (F, s) {
    var i, f, c = F.c, R = F.R;
    if (baseDraw) baseDraw(F, s);
    for (i = 0; i < F.flights.length; i++) {
      f = F.flights[i];
      if (!f.on) continue;
      if (f.k === 'marble') {
        c.beginPath(); c.arc(R.X(f.x), R.Y(f.y), 0.035 * F.m, 0, TAU);
        c.fillStyle = 'rgba(143,216,245,0.95)'; c.fill(); c.strokeStyle = '#14151F'; c.lineWidth = 1.2; c.stroke();
        c.beginPath(); c.arc(R.X(f.x) - 0.012 * F.m, R.Y(f.y) - 0.012 * F.m, 0.01 * F.m, 0, TAU); c.fillStyle = '#FFFFFF'; c.fill();
      } else if (f.k === 'disc') {
        var spin = f.t * 26;
        H().sawDisc(F, f.x, f.y, 0, spin, 0.2, 0.5);
      }
    }
  };
})(P.FireAnimFx);
