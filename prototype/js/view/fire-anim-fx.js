// Launch effects, part 1 (view only, workstream B): muzzle, trail and projectile overlays for knife, nailgun, canister,
// chain, sledge, molotov, fireworks, cable and speargun. Each entry has optional fire(F, G, k) (once, at the shot),
// tick(F, G, k, dt) (while the pose runs), revTick (chainsaw idle rev) and draw(F, G, k). Shared hooks:
//   track(F, s, dt)  sim-tracked projectiles (canister fuse, molotov wick), every frame
//   flight(F, f, dt) / landed(F, f) dispatch to flightOf[kind].step / .end for effects that outlive the pose
//   draw(F, s)       overlays for sim projectiles and rope flights
// Spawning uses F.spawn and F.chance (half density under reduced motion). Flags for one-shot events live in k.f.
P.FireAnimFx = P.FireAnimFx || {};
(function (X) {
  var M = P.FireAnimPrim, TAU = Math.PI * 2, WHITE = '255,255,255', GOLD = '255,209,102', ROCKET = ['255,209,102', '255,120,90', '179,136,255', '120,220,255'];
  function H() { return P.FireAnimHeld; }
  function pick(list) { return list[(Math.random() * list.length) | 0]; }
  function fly(F, x, y, vx, vy, T, r, col, add) {
    var p = F.spawn(add ? 'spark' : 'streak', x, y, T, r, col); p.vx = vx; p.vy = vy; return p;
  }

  X.flightOf = X.flightOf || {};

  // ---------- Knife (Döner Bıçağı): şak swish arc at the hand, glints at the blade tip while it spins ----------
  X.knife = {
    fire: function (F, G, k) {
      var h = G.pt(6, 0, 0.36, 0, 0), i, q, t, a;
      a = F.spawn('arc', h.x, h.y, 0.16, 0.5, WHITE); a.a = -G.ang; a.w = 0.75;
      for (i = 0; i < 3; i++) {
        q = G.ang + M.rnd(-0.25, 0.25);
        t = G.pt(7, 0, 0.44 + i * 0.05, 0, M.rnd(-0.04, 0.04));
        fly(F, t.x, t.y, Math.cos(q) * 6, Math.sin(q) * 6, 0.12, 0, WHITE, false);
      }
    },
    tick: function (F, G, k, dt) {
      var t = k.t, tip;
      if (t > 0.09 && t < 0.17 && F.chance(55, dt)) {
        tip = G.pt(7, 0, H().knife.fwd(t) + 0.44, 0, 0);
        var p = F.spawn('glint', tip.x, tip.y, 0.1, 0.07, WHITE); p.a = Math.random() * 6;
      }
    }
  };

  // ---------- Nail gun (Çivi Tabancası): muzzle star, spark spray, two ejected casing bits ----------
  X.nailgun = {
    fire: function (F, G, k) {
      var m = G.pt(7, 0, 0.5, -0.02, 0), i, q, p, e = G.pt(8, 0, 0.14, -0.04, 0.06);
      p = F.spawn('glint', m.x, m.y, 0.07, 0.11, '255,236,160'); p.a = G.ang;
      for (i = 0; i < F.count(5); i++) {
        q = G.ang + M.rnd(-0.5, 0.5);
        p = fly(F, m.x, m.y, Math.cos(q) * M.rnd(3, 5), Math.sin(q) * M.rnd(3, 5), 0.14, 0, '255,190,80', true);
      }
      for (i = 0; i < 2; i++) {
        p = F.spawn('chip', e.x, e.y, 0.5, 0.012, '217,162,59');
        p.z = 0.03; p.vz = M.rnd(1.2, 1.8); p.grav = 1; p.bounce = true;
        p.vx = -G.sa * M.rnd(0.8, 1.4) + G.ca * M.rnd(-0.3, 0.3); p.vy = G.ca * M.rnd(0.8, 1.4) + G.sa * M.rnd(-0.3, 0.3);
        p.a = M.rnd(0, 6); p.va = M.rnd(-14, 14);
      }
    }
  };

  // ---------- Gas canister (Piknik Tüpü): hissing valve puffs while wound up; the fuse sparkles in flight (track) ----------
  X.canister = {
    tick: function (F, G, k, dt) {
      var c, v, p, t = k.t;
      if (t > 0.08 && t < 0.22 && F.chance(40, dt)) {
        c = H().canister.at(t); v = G.pt(9, 2, c.f, c.u + 0.19, 0);
        p = F.spawn('puff', v.x, v.y, 0.36, 0.05, '236,242,246'); p.op = 0.7; p.vz = 0.5; p.vx = M.rnd(-0.25, 0.25); p.vy = M.rnd(-0.25, 0.25);
      }
    }
  };

  // ---------- Bike chain (Bisiklet Zinciri): streaks from the whip at release ----------
  X.chain = {
    fire: function (F, G, k) {
      var hub = G.pt(10, 0, 0.14, 0, 0), i, q, p;
      for (i = 0; i < 3; i++) {
        q = G.ang + M.rnd(-0.3, 0.3);
        p = fly(F, hub.x + Math.cos(q) * 0.5, hub.y + Math.sin(q) * 0.5, Math.cos(q) * 8, Math.sin(q) * 8, 0.12, 0, '220,226,236', false);
        p.op = 0.7;
      }
      p = F.spawn('arc', hub.x, hub.y, 0.2, 0.7, WHITE); p.a = -G.ang; p.w = 0.55; p.op = 0.6;
    }
  };

  // ---------- Sledge (Varyoz): swoosh on the drop, then the dust ring, debris and local quake at impact ----------
  X.sledge = {
    tick: function (F, G, k) {
      var f = k.f, hit, i, q, p, rad;
      if (!f.swing && k.t >= 0.25) {
        f.swing = true;
        p = F.spawn('arc', G.cx, G.cy, 0.16, 0.7, WHITE); p.a = -G.ang; p.w = 0.6; p.op = 0.7;
      }
      if (!f.hit && k.t >= 0.34) {
        f.hit = true;
        hit = G.pt(11, 2, 0.68, -0.647, 0);
        p = F.spawn('ring', hit.x, hit.y, 0.36, 0.9, '150,140,128'); p.jit = true;
        for (i = 0; i < F.count(8); i++) {
          q = M.rnd(0, TAU); rad = M.rnd(0.2, 0.5);
          p = F.spawn('dust', hit.x + Math.cos(q) * 0.15, hit.y + Math.sin(q) * 0.15, 0.5, 0.18, '176,166,156');
          p.op = 0.7; p.vx = Math.cos(q) * rad * 2.2; p.vy = Math.sin(q) * rad * 2.2; p.vz = M.rnd(0.3, 0.6); p.jit = true;
        }
        for (i = 0; i < F.count(6); i++) {
          q = M.rnd(0, TAU);
          p = F.spawn('chip', hit.x, hit.y, 0.45, 0.03, '52,48,46');
          p.z = 0.04; p.vz = M.rnd(1, 2); p.grav = 1; p.bounce = true; p.vx = Math.cos(q) * M.rnd(1, 2); p.vy = Math.sin(q) * M.rnd(1, 2);
          p.a = M.rnd(0, 6); p.va = M.rnd(-12, 12); p.jit = true;
        }
      }
    }
  };

  // ---------- Molotov (Ateş Şişesi): the rag catches (flame and embers) while lit; the wick trails in flight ----------
  X.molotov = {
    tick: function (F, G, k, dt) {
      var t = k.t, n, p;
      if (t > 0.02 && t < 0.12 && F.chance(70, dt)) {
        n = G.pt(11, 0, 0.22, 0.12, 0.02);
        p = F.spawn('flame', n.x, n.y, 0.14, 0.03, '255,150,40'); p.vz = 0.7; p.vx = M.rnd(-0.1, 0.1); p.a = Math.random() * 6;
        p = F.spawn('puff', n.x, n.y, 0.3, 0.02, '120,120,120'); p.op = 0.35; p.vz = 0.4;
      }
    }
  };

  // ---------- Fireworks (Havai Fişek): fuse sparks, back-blast at the launch, then the rocket trail ----------
  X.fireworks = {
    tick: function (F, G, k, dt) {
      var t = k.t, f = k.f, tail, tip, i, p, q;
      if (t < 0.12 && F.chance(50, dt)) {
        tail = G.pt(12, 0, -0.14, 0, 0);
        p = F.spawn('spark', tail.x, tail.y, 0.16, 0, '255,190,80'); p.vx = M.rnd(-0.4, 0.4); p.vy = M.rnd(-0.4, 0.4); p.vz = M.rnd(0.2, 0.8); p.grav = 1;
      }
      if (!f.launch && t >= 0.12) {
        f.launch = true; tail = G.pt(12, 0, -0.14, 0, 0); tip = G.pt(13, 0, 0.36, 0, 0);
        p = F.spawn('glint', tip.x, tip.y, 0.08, 0.15, '255,240,200'); p.a = G.ang;
        for (i = 0; i < F.count(6); i++) {
          q = M.rnd(0, TAU);
          p = F.spawn('puff', tail.x + M.rnd(-0.05, 0.05), tail.y + M.rnd(-0.05, 0.05), 0.7, 0.14, '70,72,82');
          p.op = 0.8; p.vx = -G.ca * M.rnd(0.5, 1.2) + Math.cos(q) * 0.2; p.vy = -G.sa * M.rnd(0.5, 1.2) + Math.sin(q) * 0.2; p.vz = M.rnd(0.2, 0.5);
        }
        for (i = 0; i < F.count(4); i++) {
          p = F.spawn('flame', tail.x, tail.y, 0.12, 0.07, '255,170,60');
          p.vx = -G.ca * M.rnd(1, 2); p.vy = -G.sa * M.rnd(1, 2);
        }
        F.launch('rocket', tip.x, tip.y, G.ang, 7.5, 0.55).w = k.lv;
      }
    }
  };

  // ---------- Live cable (Canlı Kablo): an electric flash at the hand, then sparks while it crackles ----------
  X.cable = {
    fire: function (F, G, k) {
      var h = G.pt(0, 0, 0.3, 0.02, 0), i, p;
      p = F.spawn('ring', h.x, h.y, 0.14, 0.22, '61,220,255');
      for (i = 0; i < F.count(6); i++) {
        p = F.spawn('spark', h.x, h.y, 0.2, 0, '190,248,255'); p.vx = M.rnd(-2.5, 2.5); p.vy = M.rnd(-2.5, 2.5); p.vz = M.rnd(0, 1);
      }
    },
    tick: function (F, G, k, dt) {
      var h, p;
      if (F.chance(30, dt)) {
        h = G.pt(0, 0, 0.3, 0.02, 0);
        p = F.spawn('spark', h.x, h.y, 0.12, 0, '180,245,255'); p.vx = M.rnd(-1, 1); p.vy = M.rnd(-1, 1);
      }
    }
  };

  // ---------- Speargun (Zıpkın): smoke at the rail, the spear launches at the snap and drags its rope ----------
  X.speargun = {
    fire: function (F, G, k) {
      var m = G.pt(15, 2, 0.62, 0, 0), p;
      p = F.spawn('puff', m.x, m.y, 0.4, 0.07, '230,236,240'); p.op = 0.6; p.vz = 0.3;
    },
    tick: function (F, G, k) {
      var f = k.f, m;
      if (!f.spear && k.t >= 0.12) {
        f.spear = true; m = G.pt(15, 2, 0.62, 0, 0);
        F.launch('rope', m.x, m.y, G.ang, 16, 0.5);
      }
    }
  };

  // ---------- Flights that outlive the pose (kinds: rocket, rope here; marble, disc in fire-anim-fx2.js) ----------
  X.flightOf.rocket = {
    step: function (F, f, dt) {
      var p;
      if (F.chance(70, dt)) { p = F.spawn('glint', f.x, f.y, 0.22, 0.05, pick(ROCKET)); p.a = Math.random() * 6; }
      if (F.chance(30, dt)) { p = F.spawn('puff', f.x, f.y, 0.55, 0.07, '190,192,200'); p.op = 0.45; p.vz = 0.25; }
      if (F.chance(60, dt)) { p = F.spawn('spark', f.x, f.y, 0.2, 0, GOLD); p.vx = M.rnd(-1.2, 1.2); p.vy = M.rnd(-1.2, 1.2); p.vz = M.rnd(0, 1.5); p.grav = 1; }
    },
    end: function (F, f) {
      var i, q, p;
      for (i = 0; i < F.count(10); i++) {
        q = i / 10 * TAU + M.rnd(-0.1, 0.1);
        p = F.spawn('spark', f.x, f.y, 0.45, 0, pick(ROCKET)); p.vx = Math.cos(q) * 2.2; p.vy = Math.sin(q) * 2.2; p.drag = 0;
      }
      p = F.spawn('ring', f.x, f.y, 0.25, 0.5, '255,220,150');
    }
  };
  X.flightOf.rope = { step: function () {}, end: function () {} };

  X.flight = function (F, f, dt) { var fo = X.flightOf[f.k]; if (fo && fo.step) fo.step(F, f, dt); };
  X.landed = function (F, f) { var fo = X.flightOf[f.k]; if (fo && fo.end) fo.end(F, f); };

  // Sim-tracked projectiles: canister lobs (fuse sparkle) and molotov flasks (wick flame). Reads s only.
  X.track = function (F, s, dt) {
    var i, p, q, z, x, y, st, arr;
    arr = s.projs || [];
    for (i = 0; i < arr.length; i++) {
      p = arr[i];
      if (p.t >= p.T || !(p.id === 'canister' || p.id === 'cluster')) continue;
      q = p.t / p.T; z = 4 * 1.6 * q * (1 - q);
      x = p.x0 + (p.x1 - p.x0) * q; y = p.y0 + (p.y1 - p.y0) * q + z + 0.2;
      if (F.chance(45, dt)) { var sp = F.spawn('spark', x, y, 0.22, 0, '255,205,90'); sp.vx = M.rnd(-0.6, 0.6); sp.vy = M.rnd(0.2, 0.8); }
    }
    st = P.Weapons && P.Weapons.state ? P.Weapons.state(s) : null;
    arr = st && st.flasks ? st.flasks : [];
    for (i = 0; i < arr.length; i++) {
      p = arr[i];
      if (p.t >= p.T) continue;
      q = p.t / p.T;
      x = p.x0 + (p.x1 - p.x0) * q; y = p.y0 + (p.y1 - p.y0) * q + 4 * 1.6 * q * (1 - q) + 0.12;
      if (F.chance(55, dt)) { var fl = F.spawn('flame', x, y, 0.16, 0.035, '255,160,60'); fl.vx = M.rnd(-0.3, 0.3); fl.vy = M.rnd(-0.3, 0.3); }
      if (F.chance(10, dt)) { var sm = F.spawn('puff', x, y, 0.45, 0.04, '110,110,116'); sm.op = 0.4; sm.vz = 0.3; }
    }
  };

  // Overlays for sim projectiles: glow and star on each canister fuse; rope for flights of kind 'rope'.
  X.draw = function (F, s) {
    var c = F.c, R = F.R, i, p, q, x, y, z, arr, j, f, sag;
    arr = s.projs || [];
    for (i = 0; i < arr.length; i++) {
      p = arr[i];
      if (p.t >= p.T || !(p.id === 'canister' || p.id === 'cluster')) continue;
      q = p.t / p.T; z = 4 * 1.6 * q * (1 - q);
      x = p.x0 + (p.x1 - p.x0) * q; y = p.y0 + (p.y1 - p.y0) * q + z + 0.2;
      M.begin(F, x, y, 0);
      c.globalCompositeOperation = 'lighter';
      c.beginPath(); c.arc(0, 0, 0.09, 0, TAU); c.fillStyle = 'rgba(255,200,80,0.28)'; c.fill();
      c.globalCompositeOperation = 'source-over';
      M.end(F);
      M.star(F, x, y, 0.05 + 0.02 * Math.sin(p.t * 60), 'rgba(255,250,220,0.95)', p.t * 40);
    }
    for (j = 0; j < F.flights.length; j++) {
      f = F.flights[j];
      if (!f.on || f.k !== 'rope') continue;
      sag = 0.12 * (1 - f.t / f.T);
      c.beginPath(); c.moveTo(R.X(f.ox), R.Y(f.oy));
      c.quadraticCurveTo(R.X((f.ox + f.x) / 2), R.Y((f.oy + f.y) / 2 - sag), R.X(f.x), R.Y(f.y));
      c.lineCap = 'round'; c.strokeStyle = '#14151F'; c.lineWidth = 3.4; c.stroke();
      c.strokeStyle = '#E6D3A3'; c.lineWidth = 1.6; c.stroke();
    }
  };
})(P.FireAnimFx);
