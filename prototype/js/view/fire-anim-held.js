// Held poses, part 1 (view only, workstream B): knife, nailgun, canister, chain, sledge, molotov, fireworks, cable,
// speargun. Each entry: { T (pose seconds, or fn(lv, n)), held(F, G, k) } with k = { t, p, T, lv, n, ang, id, f }.
// Hands are world metres from Arda's shoulders (G.pt bases: 0 main, 1 off, 2 midline). Arms are IK ink limbs drawn
// for the procedural sprite. On the raster sprite the weapon follows the painted grip. Timelines are seconds from the shot.
P.FireAnimHeld = P.FireAnimHeld || {};
(function (H) {
  var M = P.FireAnimPrim, INK = '#14151F', HK = { mx: 0, my: 0, ox: 0, oy: 0 };

  // Both arms to the main hand hm and off hand ho (world points). Clamped hands go to HK for hands().
  function arms(F, G, hm, ho) {
    M.arm(F, G.mx, G.my, hm.x, hm.y, G.side, M.SLEEVE); HK.mx = M.hx; HK.my = M.hy;
    M.arm(F, G.ox, G.oy, ho.x, ho.y, -G.side, M.SLEEVE); HK.ox = M.hx; HK.oy = M.hy;
  }
  function hands(F) { M.hand(F, HK.mx, HK.my); M.hand(F, HK.ox, HK.oy); }
  // Local star inside a begin() frame (metres).
  function lstar(c, x, y, r, col) {
    c.beginPath();
    for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4 + 0.3, rr = i & 1 ? r * 0.28 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath(); c.fillStyle = col; c.fill();
  }
  function restOff(G) { return G.pt(1, 1, 0.02, -0.3, -0.02); }   // hanging hand

  // Knife contact lands on the firing tick. The wrist cuts through and settles on the same path as the swing trail.
  function knifeFwd(t) {
    return M.lerp(0.32, 0.16, M.eo(M.seg(t, 0.065, 0.24)));
  }
  H.knife = { T: 0.24, held: function (F, G, k) {
    var t = k.t, c = F.c, sweep = M.eo(M.seg(t, 0, 0.075)), recover = M.eo(M.seg(t, 0.095, 0.24));
    var action=F.sim.ws&&F.sim.ws.knifeSwing;
    var blade = Math.max(.48, (action?action.range:k.f.range||1.4) - .40);
    var dir = k.f.dir || 1, arc = k.f.arc || 0.65;
    var cut = dir * arc * (0.7 - 1.7 * sweep) * (1 - 0.88 * recover);
    arms(F, G, G.pt(0, 0, knifeFwd(t), -0.02 - 0.06 * sweep, -0.10 * dir * sweep), G.pt(1, 1, -0.08, -0.18, 0.02));
    M.begin(F, HK.mx, HK.my, action?action.angle:G.ang-cut);
    M.rr(c, -0.04, -0.02, 0.12, 0.04, 0.015); M.ink(F, '#5B3A1E', 1.6);
    c.beginPath(); c.rect(0.06, -0.035, 0.02, 0.07); M.ink(F, '#B8C0CA', 1.4);
    c.beginPath(); c.moveTo(0.08, -0.072); c.lineTo(blade * .81, -0.058); c.lineTo(blade, -0.01);
    c.quadraticCurveTo(blade * .83, 0.068, 0.08, 0.064); c.closePath();
    M.ink(F, '#E6EBF0', 1.5);
    c.strokeStyle = '#91A9B9'; c.lineWidth = 0.024;
    c.beginPath(); c.moveTo(0.12, 0.021); c.lineTo(0.35, 0.015); c.stroke();
    M.end(F);
    hands(F);
  } };

  H.cleaver = { T: 0.56, held: function (F, G, k) {
    var action=F.sim.ws&&F.sim.ws.cleaverSwing,K=P.CFG.weapons.cleaver;
    var c = F.c, cut = M.seg(k.t,K.load,K.load+K.cut), a = action?action.angle:G.ang+G.side*M.lerp(-K.arc*Math.PI/360,K.arc*Math.PI/360,cut);
    arms(F, G, G.pt(0, 0, 0.13 + cut * 0.18, 0.12 - cut * 0.24, 0), restOff(G));
    M.begin(F, HK.mx, HK.my, a);
    if(action)c.scale(Math.max(1,(action.range-.45)/.60),1.18);
    M.rr(c, -0.10, -0.036, 0.20, 0.072, 0.025); M.ink(F, '#453126', 1.8);
    c.beginPath(); c.moveTo(0.07, -0.17); c.lineTo(0.54, -0.18); c.quadraticCurveTo(0.67, -0.05, 0.51, 0.13);
    c.lineTo(0.10, 0.105); c.closePath(); M.ink(F, '#AABCC7', 1.8);
    c.fillStyle = '#EEF4F5'; c.beginPath(); c.moveTo(0.10, 0.065); c.lineTo(0.55, 0.06); c.lineTo(0.51, 0.13);
    c.lineTo(0.10, 0.105); c.closePath(); c.fill();
    c.fillStyle = '#28333D'; c.beginPath(); c.arc(0.50, -0.11, 0.028, 0, Math.PI * 2); c.fill();
    M.end(F); hands(F);
  } };

  // ---------- Nail gun (Çivi Tabancası): staccato recoil, the barrel snaps back then settles ----------
  H.nailgun = { T: 0.20, held: function (F, G, k) {
    var c, fan = k.id === 'nailstorm', kick = (fan ? 0.12 : 0.08) * Math.exp(-k.t / 0.035);
    arms(F, G, G.pt(0, 0, 0.24 - kick, -0.02, 0), G.pt(1, 2, 0.14 - kick, -0.12, 0.06));
    if (!k.f.muzzle && P.FireAnimFx && P.FireAnimFx.nailgun) {
      var mx = HK.mx, my = HK.my;
      if (F.grip) {
        mx += (F.grip.x - F.R.X(mx)) / F.m;
        my -= (F.grip.y - F.R.Y(my)) / F.m;
      }
      P.FireAnimFx.nailgun.muzzle(F, G, mx, my, k.lv, fan);
      k.f.muzzle = true;
    }
    c = F.c; M.begin(F, HK.mx, HK.my, G.ang);
    c.beginPath(); c.rect(-0.04, 0.0, 0.06, 0.13); M.ink(F, '#2B2B2B', 1.4);
    M.rr(c, -0.05, -0.05, 0.19, 0.1, 0.02); M.ink(F, fan ? '#769B50' : '#E9A23B', 1.6);
    M.rr(c, 0.1, -0.03, 0.22, 0.05, 0.01); M.ink(F, '#3A3A3A', 1.4);
    c.beginPath(); c.rect(0.28, -0.028, 0.03, 0.046); M.ink(F, '#B8C0CA', 1.2);
    if (fan) {
      M.rr(c, -0.02, 0.042, 0.14, 0.14, 0.026); M.ink(F, '#B4CC90', 1.4);
      for (var sd = -1; sd <= 1; sd += 2) {
        c.save(); c.rotate(sd * 0.17);
        M.rr(c, 0.14, sd * 0.045 - 0.016, 0.19, 0.032, 0.008); M.ink(F, '#D4DADD', 1.1); c.restore();
      }
    }
    M.end(F); hands(F);
  } };

  // ---------- Gas canister (Piknik Tüpü): two-handed overhead lob ----------
  var CP = { f: 0, u: 0 };
  function canisterAt(t) {
    if (t < 0.16) { var w = M.eo(t / 0.16); CP.f = M.lerp(0.2, 0, w); CP.u = M.lerp(-0.02, 0.42, w); }
    else if (t < 0.26) { var r = M.ei((t - 0.16) / 0.1); CP.f = M.lerp(0, 0.34, r); CP.u = M.lerp(0.42, 0.12, r); }
    else { var q = M.eo(M.seg(t, 0.26, 0.42)); CP.f = M.lerp(0.34, 0.2, q); CP.u = M.lerp(0.12, -0.02, q); }
    return CP;
  }
  H.canister = { T: 0.42, at: canisterAt, held: function (F, G, k) {
    var p = canisterAt(k.t), cen = G.pt(5, 2, p.f, p.u, 0), c;
    arms(F, G, G.pt(0, 2, p.f, p.u, 0.075), G.pt(1, 2, p.f, p.u, -0.075));
    if (k.t < 0.2) {
      c = F.c; M.begin(F, cen.x, cen.y, 0);
      M.rr(c, -0.05, -0.15, 0.1, 0.3, 0.03); M.ink(F, '#1B4965', 1.8);
      c.fillStyle = '#D7263D'; c.fillRect(-0.05, -0.03, 0.1, 0.05);
      c.beginPath(); c.rect(-0.02, -0.19, 0.04, 0.05); M.ink(F, '#E9A23B', 1.4);
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(-0.036, -0.12, 0.016, 0.22);
      M.end(F);
    }
    hands(F);
  } };

  // ---------- Bike chain (Bisiklet Zinciri): whip-swing arc, ghost links for motion blur ----------
  // The world chain owns every link and real orbiting weight. This layer owns
  // the grip/body action only, avoiding a second decorative chain with fake contact.
  H.chain = { T: 0.3, held: function (F, G, k) {
    var hub = G.pt(0, 0, 0.14, 0, 0);
    arms(F, G, hub, G.pt(1, 2, 0.12, -0.2, -0.04));
    M.begin(F, hub.x, hub.y, G.ang);
    M.rr(F.c, -0.05, -0.025, 0.1, 0.05, 0.02); M.ink(F, '#2B2B2B', 1.6); M.end(F);
    hands(F);
  } };

  // ---------- Sledge (Varyoz): big overhead wind-up, slam ----------
  var sledgeWindup = P.CFG.weapons.sledge.windup;
  H.sledge = { T: sledgeWindup + 0.45, held: function (F, G, k) {
    var rank = k.lv - 1, L = 0.72 + 0.025 * rank, edge = 0.15 + 0.01 * rank;
    var psi, cp, sp, gc, head, hm, ho, ha, c = F.c;
    if (k.f.impactAt === undefined) {
      var windup = k.f.windup || sledgeWindup, loaded = M.eo(M.seg(k.t, 0, windup * 0.62));
      var swing = M.ei(M.seg(k.t, windup * 0.8, windup));
      psi = M.lerp(M.lerp(-0.5, 2.5, loaded), 0.32, swing);
    } else psi = M.lerp(-0.55, -0.35, M.seg(k.t, k.f.impactAt, k.T));
    cp = Math.cos(psi); sp = Math.sin(psi);
    gc = G.pt(0, 2, 0.14, 0, 0);
    head = G.pt(1, 2, 0.14 + cp * L, sp * L, 0);
    hm = G.pt(2, 2, 0.14 + cp * 0.2, sp * 0.2, 0.05); ho = G.pt(3, 2, 0.14 + cp * 0.36, sp * 0.36, -0.05);
    arms(F, G, hm, ho);
    M.limb(F, gc.x, gc.y, head.x, head.y, '#BC8046', 0.045);
    ha = Math.atan2(head.y - gc.y, head.x - gc.x);
    M.begin(F, head.x, head.y, ha + Math.PI / 2);
    M.rr(c, -edge, -0.072, edge * 2, 0.16, 0.025); M.ink(F, '#596879', 2);
    c.fillStyle = '#B5C6CC'; c.fillRect(-edge + 0.025, -0.051, edge * 2 - 0.05, 0.031);
    M.end(F);
    hands(F);
  } };

  // ---------- Molotov (Ateş Şişesi): light the rag, overhand throw, the bottle spins ----------
  H.molotov = { T: 0.36, held: function (F, G, k) {
    var t = k.t, fwd, up, rot = 0, thrown = t > 0.24, c, fl;
    if (t < 0.1) { fwd = 0.22; up = -0.02; }
    else if (t < 0.22) { var w = M.eo((t - 0.1) / 0.12); fwd = M.lerp(0.22, -0.12, w); up = M.lerp(-0.02, 0.45, w); rot = (t - 0.1) * 6; }
    else if (t < 0.3) { var r = M.ei((t - 0.22) / 0.08); fwd = M.lerp(-0.12, 0.36, r); up = M.lerp(0.45, -0.02, r); rot = 2.2 + (t - 0.22) * 14; }
    else { fwd = M.lerp(0.36, 0.3, M.seg(t, 0.3, 0.36)); up = -0.02; }
    arms(F, G, G.pt(0, 0, fwd, up, 0.02), t < 0.1 ? G.pt(1, 2, 0.24, 0.06, 0.02) : G.pt(1, 2, 0.1, -0.12, -0.05));
    if (!thrown) {
      c = F.c; M.begin(F, HK.mx, HK.my, 0); c.rotate(rot); c.scale(1.45, 1.45);
      c.beginPath(); c.moveTo(-0.035, 0.09); c.lineTo(-0.035, -0.02); c.lineTo(-0.012, -0.05); c.lineTo(-0.012, -0.1);
      c.lineTo(0.012, -0.1); c.lineTo(0.012, -0.05); c.lineTo(0.035, -0.02); c.lineTo(0.035, 0.09); c.closePath();
      M.ink(F, 'rgba(120,220,140,0.92)', 1.6);
      c.fillStyle = '#2E8B57'; c.fillRect(-0.034, 0.0, 0.068, 0.09);
      c.fillStyle = '#EDE2C8'; c.fillRect(-0.034, 0.02, 0.068, 0.035);
      M.rr(c, -0.015, -0.13, 0.03, 0.04, 0.01); M.ink(F, '#EDE2C8', 1.2);
      fl = 0.85 + 0.3 * Math.sin(Math.floor(t * 3) / 3 * 52);   // flame flicker held to 3 steps a second (design-system 11)
      c.fillStyle = 'rgba(255,140,40,0.9)'; c.beginPath(); c.arc(0, -0.15, 0.04 * fl, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(255,230,140,0.95)'; c.beginPath(); c.arc(0, -0.16, 0.02 * fl, 0, Math.PI * 2); c.fill();
      M.end(F);
    }
    hands(F);
  } };

  // ---------- Fireworks (Havai Fişek): hold the tube, back-blast, the rocket goes ----------
  H.fireworks = { T: 0.34, held: function (F, G, k) {
    var t = k.t, kick = t > 0.12 ? 0.11 * Math.exp(-(t - 0.12) / 0.06) : 0, c, aim = t < 0.12 ? 0.025 * M.eo(t / 0.12) : 0;   // lift the tube to aim, then the launch slams back
    arms(F, G, G.pt(0, 0, 0.12 - kick, -0.02 + aim - kick * 0.25, 0), G.pt(1, 2, 0.3 - kick * 0.5, -0.04 + aim, 0.04));
    c = F.c; M.begin(F, HK.mx, HK.my, G.ang);
    M.rr(c, -0.1, -0.04, 0.42, 0.08, 0.03); M.ink(F, '#D7263D', 1.6);
    c.fillStyle = '#E9A23B'; c.fillRect(-0.02, -0.042, 0.05, 0.084);
    c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(0.1, -0.03, 0.05, 0.02);
    c.beginPath(); c.ellipse(0.32, 0, 0.012, 0.04, 0, 0, Math.PI * 2); c.fillStyle = '#2B2B2B'; c.fill();
    c.beginPath(); c.rect(-0.13, -0.012, 0.04, 0.024); M.ink(F, '#C9A13B', 1.2);
    if (t < 0.12) lstar(c, -0.15, 0, 0.03 + 0.012 * Math.sin(Math.floor(t * 3) / 3 * 90), 'rgba(255,220,120,0.95)');
    M.end(F);
    hands(F);
  } };

  // ---------- Live cable (Canlı Kablo): jittering hand, crackling arc toward the target ----------
  function bolt(F, f, hx, hy, ang, len, tk) {
    var i, s, lat, j, pts = f.pts;
    pts[0] = hx; pts[1] = hy;
    for (i = 1; i < 6; i++) {
      s = i / 6; lat = (i & 1 ? 1 : -1) * M.rnd(0.02, 0.07);
      pts[2 * i] = hx + Math.cos(ang) * len * s - Math.sin(ang) * lat; pts[2 * i + 1] = hy + Math.sin(ang) * len * s + Math.cos(ang) * lat;
    }
    j = 6; pts[2 * j] = hx + Math.cos(ang) * len; pts[2 * j + 1] = hy + Math.sin(ang) * len; f.n = 7; f.tk = tk;
  }
  H.cable = { T: 0.3, held: function (F, G, k) {
    var c = F.c, jx = F.rm ? 0 : M.rnd(-0.02, 0.02), jy = F.rm ? 0 : M.rnd(-0.02, 0.02), f = k.f, tk = Math.floor(k.t / 0.05), hm, tail, i;
    hm = G.pt(0, 0, 0.3 + jx - 0.09 * Math.exp(-k.t / 0.06), 0.02 + jy + 0.03 * Math.exp(-k.t / 0.08), 0);   // the discharge snaps the hand back
    arms(F, G, hm, G.pt(1, 2, 0.02, -0.2, -0.08));
    tail = G.pt(2, 2, 0.02, -0.25, 0.06);
    var mx = (HK.mx + tail.x) / 2, my = (HK.my + tail.y) / 2 - 0.06;
    c.beginPath(); c.moveTo(F.R.X(HK.mx), F.R.Y(HK.my)); c.quadraticCurveTo(F.R.X(mx), F.R.Y(my), F.R.X(tail.x), F.R.Y(tail.y));
    c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 0.03 * F.m + 2.5; c.stroke();
    c.strokeStyle = '#2B2B2B'; c.lineWidth = 0.03 * F.m; c.stroke();
    if (!f.pts) f.pts = new Float32Array(16);
    if (f.tk !== tk || f.pts === null) bolt(F, f, HK.mx, HK.my, G.ang, 0.85 + 0.1 * k.lv, tk);
    c.save(); c.globalCompositeOperation = 'lighter';
    c.beginPath(); c.moveTo(F.R.X(f.pts[0]), F.R.Y(f.pts[1]));
    for (i = 1; i < f.n; i++) c.lineTo(F.R.X(f.pts[2 * i]), F.R.Y(f.pts[2 * i + 1]));
    c.lineCap = 'round'; c.strokeStyle = 'rgba(61,220,255,0.35)'; c.lineWidth = 7; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 1.5; c.stroke();
    c.restore();
    for (i = 0; i < 3; i++) {
      if (F.rm) break;
      c.fillStyle = 'rgba(61,220,255,0.9)'; c.beginPath();
      c.arc(F.R.X(HK.mx + M.rnd(-0.1, 0.1)), F.R.Y(HK.my + M.rnd(-0.1, 0.1)), 0.02 * F.m, 0, Math.PI * 2); c.fill();
    }
    hands(F);
  } };

  // ---------- Speargun (Zıpkın): brace, snap recoil; the spear leaves the rail ----------
  H.speargun = { T: 0.34, held: function (F, G, k) {
    var t = k.t, pull = t < 0.12 ? M.eo(t / 0.12) : 1, kick = t > 0.12 ? 0.08 * Math.exp(-(t - 0.12) / 0.06) : 0, c;
    arms(F, G, G.pt(0, 2, M.lerp(0.22, 0.12, pull) - kick, -0.1, 0.05), G.pt(1, 2, 0.36 - kick * 0.6, -0.12, -0.02));
    c = F.c; M.begin(F, HK.mx, HK.my, G.ang);
    M.rr(c, -0.14, -0.035, 0.16, 0.07, 0.03); M.ink(F, '#8B5A2B', 1.6);
    c.beginPath(); c.rect(0.02, -0.014, 0.44, 0.028); M.ink(F, '#B8C0CA', 1.4);
    c.beginPath(); c.arc(0.16, 0, 0.04, 0, Math.PI * 2); M.ink(F, '#7D848F', 1.4);
    if (t < 0.12) {
      c.beginPath(); c.moveTo(0.04, 0); c.lineTo(0.5, 0); c.strokeStyle = '#EEF2F6'; c.lineWidth = 1.6 / F.m; c.stroke();
      c.beginPath(); c.moveTo(0.48, -0.025); c.lineTo(0.58, 0); c.lineTo(0.48, 0.025); c.closePath(); M.ink(F, '#EEF2F6', 1.2);
    }
    M.end(F); hands(F);
  } };

  H.restOff = restOff;
})(P.FireAnimHeld);
