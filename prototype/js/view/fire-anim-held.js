// Held poses, part 1 (view only, workstream B): knife, nailgun, canister, chain, sledge, molotov, fireworks, cable,
// speargun. Each entry: { T (pose seconds, or fn(lv, n)), held(F, G, k) } with k = { t, p, T, lv, n, ang, id, f }.
// Hands are world metres from Arda's shoulders (G.pt bases: 0 main, 1 off, 2 midline). Arms are IK ink limbs drawn
// over the sprite (the sprite's own arms are hidden while a pose runs). Timelines are in seconds from the shot.
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

  // ---------- Knife (Döner Bıçağı): fast flick, the blade spins and flashes at the tip ----------
  function knifeFwd(t) {
    if (t < 0.09) return M.lerp(0.2, 0.0, M.eo(t / 0.09));
    if (t < 0.16) return M.lerp(0.0, 0.36, M.ei((t - 0.09) / 0.07));
    return M.lerp(0.36, 0.3, M.seg(t, 0.16, 0.26));
  }
  H.knife = { T: 0.26, fwd: knifeFwd, held: function (F, G, k) {
    var t = k.t, lat = 0, up = 0.02, spin = 0, cs, hw, c = F.c;
    if (t < 0.09) { lat = 0.12 * M.eo(t / 0.09); up = 0.04 * M.eo(t / 0.09); }
    else if (t < 0.16) { var q = M.ei((t - 0.09) / 0.07); lat = M.lerp(0.12, 0, q); up = 0.04 * (1 - q); spin = (t - 0.09) * 42; }
    arms(F, G, G.pt(0, 0, knifeFwd(t), up, lat), G.pt(1, 1, 0.12, -0.12, 0.03));
    cs = Math.cos(spin); hw = 0.03 * Math.max(0.2, Math.abs(cs));
    M.begin(F, HK.mx, HK.my, G.ang);
    M.rr(c, -0.04, -0.02, 0.12, 0.04, 0.015); M.ink(F, '#5B3A1E', 1.6);
    c.beginPath(); c.rect(0.06, -0.035, 0.02, 0.07); M.ink(F, '#B8C0CA', 1.4);
    c.beginPath(); c.moveTo(0.08, -hw); c.lineTo(0.36, -hw * 1.1); c.lineTo(0.44, 0); c.lineTo(0.36, hw * 1.1); c.lineTo(0.08, hw); c.closePath();
    M.ink(F, '#E6EBF0', 1.5);
    if (t > 0.09 && t < 0.16 && Math.abs(cs) > 0.75) lstar(c, 0.44, 0, 0.08, '#FFFFFF');
    M.end(F);
    hands(F);
  } };

  // ---------- Nail gun (Çivi Tabancası): staccato recoil, the barrel snaps back then settles ----------
  H.nailgun = { T: 0.14, held: function (F, G, k) {
    var c, kick = 0.055 * Math.exp(-k.t / 0.04);
    arms(F, G, G.pt(0, 0, 0.24 - kick, -0.02, 0), G.pt(1, 2, 0.14 - kick, -0.12, 0.06));
    c = F.c; M.begin(F, HK.mx, HK.my, G.ang);
    c.beginPath(); c.rect(-0.04, 0.0, 0.06, 0.13); M.ink(F, '#2B2B2B', 1.4);
    M.rr(c, -0.05, -0.05, 0.19, 0.1, 0.02); M.ink(F, '#E9A23B', 1.6);
    M.rr(c, 0.1, -0.03, 0.22, 0.05, 0.01); M.ink(F, '#3A3A3A', 1.4);
    c.beginPath(); c.rect(0.28, -0.028, 0.03, 0.046); M.ink(F, '#B8C0CA', 1.2);
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
  function chainTh(t) { return t < 0.18 ? M.lerp(-1.25, 0.25, M.eo(t / 0.18)) : M.lerp(0.25, 0.35, M.seg(t, 0.18, 0.3)); }
  function link(c, F, hx, hy, a, r, i, alpha) {
    var x = hx + Math.cos(a) * r, y = hy + Math.sin(a) * r, X = F.R.X(x), Y = F.R.Y(y), m = F.m;
    c.save(); c.translate(X, Y); c.rotate(-(a + Math.PI / 2));
    c.globalAlpha = alpha; c.fillStyle = i & 1 ? '#C9CED6' : '#7D848F';
    c.beginPath(); c.ellipse(0, 0, 0.05 * m, 0.028 * m, 0, 0, Math.PI * 2); c.fill();
    if (alpha >= 1) { c.strokeStyle = INK; c.lineWidth = 1.4; c.stroke(); }
    c.restore();
  }
  H.chain = { T: 0.3, held: function (F, G, k) {
    var c = F.c, t = k.t, hub = G.pt(0, 0, 0.14, 0, 0), i, a0, r;
    arms(F, G, hub, G.pt(1, 2, 0.12, -0.2, -0.04));
    for (i = 0; i < 8; i++) {                       // ghost links: earlier positions of the whip
      if (i === 0) continue;
      link(c, F, hub.x, hub.y, G.ang + chainTh(t - 0.07) - i * 0.02, 0.22 + i * 0.07, i, 0.14);
      link(c, F, hub.x, hub.y, G.ang + chainTh(t - 0.035) - i * 0.015, 0.22 + i * 0.07, i, 0.3);
    }
    for (i = 0; i < 8; i++) {
      a0 = G.ang + chainTh(t - i * 0.012); r = 0.22 + i * 0.07;
      link(c, F, hub.x, hub.y, a0, r, i, 1);
    }
    a0 = G.ang + chainTh(t);
    var tx = hub.x + Math.cos(a0) * 0.8, ty = hub.y + Math.sin(a0) * 0.8;
    c.save(); c.translate(F.R.X(tx), F.R.Y(ty)); c.rotate(t * 30);
    c.fillStyle = '#E9A23B'; c.strokeStyle = INK; c.lineWidth = 1.8; c.beginPath();
    for (i = 0; i < 20; i++) { var q = i / 20 * Math.PI * 2, rr = i & 1 ? 0.06 : 0.075; c.lineTo(Math.cos(q) * rr * F.m, Math.sin(q) * rr * F.m); }
    c.closePath(); c.fill(); c.stroke(); c.restore();
    M.begin(F, hub.x, hub.y, G.ang); M.rr(F.c, -0.05, -0.025, 0.1, 0.05, 0.02); M.ink(F, '#2B2B2B', 1.6); M.end(F);
    hands(F);
  } };

  // ---------- Sledge (Varyoz): big overhead wind-up, slam ----------
  H.sledge = { T: 0.5, held: function (F, G, k) {
    var t = k.t, psi, cp, sp, L = 0.62, gc, head, hm, ho, ha, c = F.c;
    if (t < 0.25) psi = M.lerp(-0.5, 2.5, M.eo(t / 0.25));
    else if (t < 0.34) psi = M.lerp(2.5, -0.5, M.ei((t - 0.25) / 0.09));
    else psi = M.lerp(-0.5, -0.35, M.seg(t, 0.34, 0.5));
    cp = Math.cos(psi); sp = Math.sin(psi);
    gc = G.pt(0, 2, 0.14, 0, 0);
    head = G.pt(1, 2, 0.14 + cp * L, sp * L, 0);
    hm = G.pt(2, 2, 0.14 + cp * 0.2, sp * 0.2, 0.05); ho = G.pt(3, 2, 0.14 + cp * 0.36, sp * 0.36, -0.05);
    arms(F, G, hm, ho);
    M.limb(F, gc.x, gc.y, head.x, head.y, '#B5651D', 0.035);
    ha = Math.atan2(head.y - gc.y, head.x - gc.x);
    M.begin(F, head.x, head.y, ha + Math.PI / 2);
    M.rr(c, -0.1, -0.05, 0.2, 0.12, 0.02); M.ink(F, '#6B7280', 1.8);
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(-0.08, -0.04, 0.16, 0.02);
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
