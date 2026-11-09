// Launch effects, part 3 (view only, workstream W): fire, tick and per-pose overlays for the nine evolutions and the two
// active skills (the poses are in fire-anim-held3.js). Also X.event(F, ev), which FireAnim routes every non-wfire event
// to: the evolution events (stormZap, arcZap, netLink, lakeMerge, spitBlock, healPulse, envHit). Each fx is one-shot
// through k.f flags or rate-limited with F.chance, so no flash runs faster than 3 per second.
P.FireAnimFx = P.FireAnimFx || {};
(function (X) {
  var M = P.FireAnimPrim, TAU = Math.PI * 2, ARC_H = 1.6;
  X.flightOf = X.flightOf || {};
  function HELD() { return P.FireAnimHeld; }

  // Jagged arc between two world points: a bolt particle with six points, middle ones jittered across the line.
  function zig(F, x0, y0, x1, y1, T, col) {
    var p = F.spawn('bolt', x0, y0, T, 0.03, col), n = 6, j, t, o, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
    p.n = n;
    for (j = 0; j < n; j++) {
      t = j / (n - 1); o = j === 0 || j === n - 1 ? 0 : M.rnd(-0.12, 0.12) * L;
      p.pts[2 * j] = x0 + dx * t - dy / L * o; p.pts[2 * j + 1] = y0 + dy * t + dx / L * o;
    }
    return p;
  }
  function burst(F, x, y, n, col, r) {
    var i, p;
    for (i = 0; i < F.count(n); i++) {
      p = F.spawn('spark', x, y, 0.25 + M.rnd(0, 0.15), 0, col);
      p.vx = M.rnd(-r, r); p.vy = M.rnd(-r, r); p.grav = 1; p.vz = M.rnd(0.4, 1.6);
    }
  }
  function ringAt(F, x, y, T, r, col) { var p = F.spawn('ring', x, y, T, r, col); p.op = 0.8; return p; }

  // ---------- Blacksmith (Demirci Vuruşu): the head lands on the slam; sparks and a dust ring go out from the strike ----------
  X.blacksmith = {
    tick: function (F, G, k) {
      var q, x, y;
      if (k.f.slam || k.t < HELD().blacksmith.slam) return;
      k.f.slam = true; q = G.pt(3, 0, 1.2, 0, 0); x = q.x; y = q.y;
      burst(F, x, y, 10, '255,170,70', 1.2);
      ringAt(F, x, y, 0.3, 0.35, '255,190,110');
      var d = F.spawn('dust', x, y, 0.4, 0.12, '170,160,150'); d.op = 0.5;
    }
  };

  // ---------- Stormshield (Şimşek Kalkanı): a bolt from the coil ring to the target; crackle while it orbits ----------
  X.stormshield = {
    fire: function (F, G, k) {
      var o = G.pt(4, 2, 0.4, 0.1, -0.2), e = G.pt(5, 2, 2.2, 0.3, 0);
      zig(F, o.x, o.y, e.x, e.y, 0.14, '143,227,255');
    },
    tick: function (F, G, k, dt) {
      var q;
      if (F.chance(12, dt)) { q = G.pt(6, 2, 0.26, 0.3, -0.25); burst(F, q.x, q.y, 2, '143,227,255', 0.6); }
    }
  };

  // ---------- Foam storm (Köpük Fırtınası): a fan of white foam from the nozzle, thicker than the extinguisher ----------
  X.foamstorm = {
    fire: function (F, G, k) {
      var i, a, d, n = G.pt(4, 0, 0.36, 0, 0), p;
      for (i = 0; i < F.count(8); i++) {
        a = G.ang + M.rnd(-0.6, 0.6); d = M.rnd(0.6, 2.4);
        p = F.spawn('puff', n.x + Math.cos(a) * d * 0.4, n.y + Math.sin(a) * d * 0.4, 0.5, 0.15, '232,244,255');
        p.op = 0.5; p.vx = Math.cos(a) * 1.4; p.vy = Math.sin(a) * 1.4;
      }
    },
    tick: function (F, G, k, dt) {
      var n, p;
      if (F.chance(30, dt)) { n = G.pt(4, 0, 0.36, 0, 0); p = F.spawn('puff', n.x, n.y, 0.35, 0.05, '220,240,255'); p.op = 0.4; p.vx = G.ca * 0.8; p.vy = G.sa * 0.8; }
    }
  };

  // ---------- Netspear (Zıpkın Ağı): a ring flicks off the spear tip at release ----------
  X.netspear = {
    tick: function (F, G, k) {
      var q;
      if (k.f.net || k.t < HELD().netspear.rel) return;
      k.f.net = true; q = G.pt(5, 0, 0.5, 0, 0);
      ringAt(F, q.x, q.y, 0.25, 0.3, '230,211,163');
    }
  };

  // ---------- Lake bottle (Ateş Gölü): a splash where the bottle lands and drips while it tips ----------
  X.lake = {
    fire: function (F, G, k) {
      var q = G.pt(5, 0, 0.3, 0, 0), i, p;
      for (i = 0; i < F.count(6); i++) { p = F.spawn('puff', q.x, q.y, 0.4, 0.06, '150,210,235'); p.op = 0.5; p.vz = M.rnd(0.3, 0.8); p.vx = M.rnd(-0.4, 0.4); }
    },
    tick: function (F, G, k, dt) {
      var q, p, t = k.t;
      if (t < HELD().lake.rel || t > HELD().lake.rel + 0.15 || !F.chance(60, dt)) return;
      q = G.pt(5, 0, 0.36, -0.02, 0);
      p = F.spawn('spark', q.x, q.y, 0.3, 0, '63,167,214'); p.grav = 1; p.vz = -0.4; p.vx = 0; p.vy = 0;
    }
  };

  // ---------- Twin saw (İkiz Disk): a small spark pass at the catch; the discs fly on their overlay path ----------
  X.twinsaw = {
    tick: function (F, G, k) {
      var q;
      if (k.f.catch || k.t < HELD().twinsaw.back) return;
      k.f.catch = true; q = G.pt(3, 0, 0.3, 0, 0);
      burst(F, q.x, q.y, 6, '255,226,160', 0.8);
    }
  };

  // ---------- Fireball (Ateş Topu): a flame burst in the palm; the flasks carry a fireball glow (see track and draw) ----------
  X.fireball = {
    fire: function (F, G, k) {
      var q = G.pt(2, 0, 0.42, 0, 0), i, p;
      for (i = 0; i < F.count(8); i++) { p = F.spawn('flame', q.x, q.y, 0.2, 0.05, '255,140,50'); p.vx = M.rnd(-0.6, 0.6); p.vy = M.rnd(-0.6, 0.6); }
    }
  };

  // ---------- Arc chain (Elektrik Zinciri): a crackle from the first link at the swing; the arcs themselves are arcZap events ----------
  X.arcchain = {
    fire: function (F, G, k) {
      var q = G.pt(2, 0, 0.3, 0, 0);
      burst(F, q.x, q.y, 5, '143,227,255', 1);
    },
    tick: function (F, G, k, dt) {
      var q;
      if (F.chance(8, dt)) { q = G.pt(3, 0, 0.5, -0.1, 0); burst(F, q.x, q.y, 1, '143,227,255', 0.5); }
    }
  };

  // ---------- Canister bomb (Patlayan Araba Turu): the fuse spits sparks while it is carried and at the throw ----------
  X.carbomb = {
    fire: function (F, G, k) {
      var q = G.pt(4, 0, 0.1, 0.14, 0);
      burst(F, q.x, q.y, 5, '255,205,90', 0.8);
    },
    tick: function (F, G, k, dt) {
      var q;
      if (F.chance(35, dt)) { q = G.pt(4, 0, 0.05, 0.18, 0); burst(F, q.x, q.y, 1, '255,205,90', 0.4); }
    }
  };

  // ---------- Simit shield (Simit Kalkanı): a gold ring pulse as the ring comes up ----------
  X.skill_shield = {
    tick: function (F, G, k) {
      var q;
      if (k.f.ring || k.t < 0.2) return;
      k.f.ring = true; q = G.pt(2, 2, 0.55, 0.1, 0);
      ringAt(F, q.x, q.y, 0.3, 0.3, '255,209,102');
    }
  };

  // ---------- Tea glass (Çay Molası): steam curls up from the glass once it is lifted ----------
  X.skill_tea = {
    tick: function (F, G, k, dt) {
      var q, p;
      if (k.t < 0.3 || !F.chance(20, dt)) return;
      q = G.pt(3, 0, 0.1, 0.5, 0);
      p = F.spawn('puff', q.x, q.y, 0.6, 0.04, '235,235,230'); p.op = 0.35; p.vz = 0.35; p.vx = M.rnd(-0.05, 0.05);
    }
  };

  // ---------- Events from the evolutions and skills (routed by FireAnim.onEvent) ----------
  var EV = {
    healPulse: function (F, ev) {
      var i, p;
      for (i = 0; i < F.count(6); i++) { p = F.spawn('glint', ev.x + M.rnd(-0.4, 0.4), ev.y + M.rnd(0, 0.6), 0.5, 0.06, '160,255,190'); p.vz = 0.6; }
    },
    stormZap: function (F, ev) {
      zig(F, ev.x0, ev.y0, ev.x1, ev.y1, 0.16, '143,227,255');
      burst(F, ev.x1, ev.y1, 4, '143,227,255', 0.8);
    },
    arcZap: function (F, ev) {
      zig(F, ev.x0, ev.y0, ev.x1, ev.y1, 0.12, '143,227,255');
      burst(F, ev.x1, ev.y1, 3, '143,227,255', 0.6);
    },
    netLink: function (F, ev) {
      var T = P.CFG.evoFx ? P.CFG.evoFx.netLinkT : 0.2, f = F.launch('rope', F.sim.hero.x, F.sim.hero.y, 0, 0, T);
      f.x = ev.x; f.y = ev.y;
    },
    lakeMerge: function (F, ev) {
      var i, p;
      for (i = 0; i < F.count(6); i++) { p = F.spawn('puff', ev.x + M.rnd(-0.3, 0.3), ev.y + M.rnd(-0.3, 0.3), 0.5, 0.1, '150,210,235'); p.op = 0.45; }
      ringAt(F, ev.x, ev.y, 0.35, ev.r || 1, '150,210,235');
    },
    spitBlock: function (F, ev) {
      var i, p;
      for (i = 0; i < F.count(8); i++) { p = F.spawn('puff', ev.x + M.rnd(-0.3, 0.3), ev.y + M.rnd(-0.3, 0.3), 0.4, 0.12, '232,244,255'); p.op = 0.6; }
      ringAt(F, ev.x, ev.y, 0.25, 0.4, '232,244,255');
    },
    envHit: function (F, ev) {
      var p;
      if (ev.kind === 'gas') { p = F.spawn('puff', ev.x, ev.y, 0.5, 0.2, '150,220,120'); p.op = 0.5; }
      else if (ev.kind === 'wet') ringAt(F, ev.x, ev.y, 0.3, 0.3, '120,190,255');
      else if (ev.kind === 'car') burst(F, ev.x, ev.y, 4, '255,170,60', 0.8);
    }
  };

  // Non-wfire events. Unknown types are ignored.
  X.event = function (F, ev) {
    var fn = ev && EV[ev.type];
    if (fn && F.sim) fn(F, ev);
  };

  // Fireball flasks: flames trail the flask, and a glow sits under it (both read the sim flasks with src 'fireball').
  function flaskAt(p) {
    var q = p.t / p.T;
    return { x: p.x0 + (p.x1 - p.x0) * q, y: p.y0 + (p.y1 - p.y0) * q + ARC_H * 4 * q * (1 - q) + 0.12 };
  }
  function fireballs(s) {
    var st = P.Weapons && P.Weapons.state ? P.Weapons.state(s) : null;
    return (st && st.flasks ? st.flasks : []).filter(function (p) { return p.t < p.T && p.src === 'fireball'; });
  }
  var baseTrack = X.track, baseDraw = X.draw;
  X.track = function (F, s, dt) {
    var arr, i, q, fl;
    if (baseTrack) baseTrack(F, s, dt);
    arr = fireballs(s);
    for (i = 0; i < arr.length; i++) {
      if (!F.chance(70, dt)) continue;
      q = flaskAt(arr[i]);
      fl = F.spawn('flame', q.x, q.y, 0.22, 0.05, '255,120,40'); fl.vx = M.rnd(-0.4, 0.4); fl.vy = M.rnd(0.2, 0.6);
    }
  };
  X.draw = function (F, s) {
    var arr, i, q, c = F.c;
    if (baseDraw) baseDraw(F, s);
    arr = fireballs(s);
    for (i = 0; i < arr.length; i++) {
      q = flaskAt(arr[i]);
      M.begin(F, q.x, q.y, 0);
      c.save(); c.globalCompositeOperation = 'lighter';
      c.beginPath(); c.arc(0, 0, 0.22, 0, TAU); c.fillStyle = 'rgba(255,140,60,0.3)'; c.fill();
      c.restore();
      M.end(F);
    }
  };
})(P.FireAnimFx);
