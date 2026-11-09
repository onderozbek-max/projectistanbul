// Held poses, part 3 (view only, workstream W): the nine evolutions and the two active skills. Blacksmith hammer, stormshield
// coil and orbiting arc, foam nozzle, netspear, lake bottle, twin saw, fireball orb, arc chain, canister bomb, simit shield
// and tea glass. Same contract as fire-anim-held*.js: { T, held(F, G, k), rev?, over?(F, G, k) }. over draws after the
// sprite, for parts that fly away from the hand. Geometry: G.pt(slot, base, fwd, up, lat) in metres. Upright items use
// M.begin(F, x, y, 0) (local +y is down); aimed items use M.begin(F, x, y, G.ang) (local +x forward).
P.FireAnimHeld = P.FireAnimHeld || {};
(function (H) {
  var M = P.FireAnimPrim, TAU = Math.PI * 2, HK = { mx: 0, my: 0, ox: 0, oy: 0 };
  var C = { wood: '#8B5E3C', steel: '#4A4F5A', tank: '#2F8F6B', rope: '#E6D3A3', arc: '#8FE3FF', fire: '255,140,60',
    gold: '#C9873A', sesame: '#F4E6C2', tea: '#B5571F', glass: '#F3E3C0', water: '#3FA7D6', canister: '#7F8C8D', ink: '#14151F' };

  function arms(F, G, hm, ho) {
    M.arm(F, G.mx, G.my, hm.x, hm.y, G.side, M.SLEEVE); HK.mx = M.hx; HK.my = M.hy;
    M.arm(F, G.ox, G.oy, ho.x, ho.y, -G.side, M.SLEEVE); HK.ox = M.hx; HK.oy = M.hy;
  }
  function hands(F) { M.hand(F, HK.mx, HK.my); M.hand(F, HK.ox, HK.oy); }
  // Soft glow disc in world metres (additive); col is 'r,g,b'.
  function glow(F, x, y, r, col, a) {
    var c = F.c;
    c.save(); c.globalCompositeOperation = 'lighter';
    c.beginPath(); c.arc(F.R.X(x), F.R.Y(y), r * F.m, 0, TAU); c.fillStyle = M.rgba(col, a); c.fill();
    c.restore();
  }
  // Thin flat disc in the aim frame (saw blade), squashed for the 3/4 view.
  function disc(F, x, y, a, spin, r, sq) {
    var c = F.c, i, q, rr;
    M.begin(F, x, y, a); c.scale(1, sq); c.rotate(spin);
    c.beginPath();
    for (i = 0; i < 16; i++) { q = i / 16 * TAU; rr = i & 1 ? r * 0.84 : r; c.lineTo(Math.cos(q) * rr, Math.sin(q) * rr); }
    c.closePath(); M.ink(F, '#9AA3AE', 1.4);
    c.beginPath(); c.arc(0, 0, r * 0.2, 0, TAU); c.fillStyle = '#3A3F47'; c.fill();
    M.end(F);
  }

  // ---------- Blacksmith (Demirci Vuruşu): two-hand overhead hammer; the head glows and drops on the slam ----------
  H.blacksmith = { T: 0.8, slam: 0.5, held: function (F, G, k) {
    var t = k.t, lift, th, hf, hu, hm, ho, hd, mx, my, dx, dy, L, px, py;
    lift = t < 0.35 ? M.eo(t / 0.35) : t < H.blacksmith.slam ? 1 - M.ei((t - 0.35) / 0.15) : M.lerp(0, 0.3, M.seg(t, H.blacksmith.slam, 0.8));
    th = M.lerp(-0.4, Math.PI / 2, lift);
    hf = M.lerp(0.22, 0.12, lift); hu = M.lerp(-0.1, 0.12, lift);
    hm = G.pt(0, 0, hf, hu, 0);
    ho = G.pt(1, 2, hf + 0.06 * Math.cos(th), hu + 0.06 * Math.sin(th), -0.03);
    arms(F, G, hm, ho);
    mx = (HK.mx + HK.ox) / 2; my = (HK.my + HK.oy) / 2;
    hd = G.pt(2, 2, hf + 0.45 * Math.cos(th), hu + 0.45 * Math.sin(th), 0);
    M.limb(F, mx, my, hd.x, hd.y, C.wood, 0.05);
    dx = hd.x - mx; dy = hd.y - my; L = Math.hypot(dx, dy) || 1; px = -dy / L * 0.12; py = dx / L * 0.12;
    M.limb(F, hd.x - px, hd.y - py, hd.x + px, hd.y + py, C.steel, 0.2);
    if (lift < 0.5) glow(F, hd.x, hd.y, 0.2, C.fire, 0.3 * (0.5 + 0.5 * Math.sin(t * 9)));
    hands(F);
  } };

  // ---------- Stormshield (Şimşek Kalkanı): cable reel in the main hand, off arm raised, an arc orbits the ring ----------
  H.stormshield = { T: 0.5, held: function (F, G, k) {
    var t = k.t, sw = M.eo(M.clamp01(t / 0.2)), c = F.c, i, a, r = 0.3, p, q, j, b, step = Math.floor(t * 10);
    arms(F, G, G.pt(0, 0, 0.3, 0.02, 0), G.pt(1, 2, 0.26 * sw, 0.1 + 0.2 * sw, -0.2 * sw));
    p = { x: HK.ox, y: HK.oy };
    M.begin(F, p.x, p.y, 0); c.beginPath(); c.arc(0, 0, r, 0, TAU);
    c.strokeStyle = M.rgba('143,227,255', 0.55); c.lineWidth = 2.4 / F.m; c.stroke(); M.end(F);
    for (i = 0; i < 3; i++) {
      a = t * 9 + i * TAU / 3; q = { x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r };
      b = { x: p.x + Math.cos(a + 0.5) * r * 0.82, y: p.y + Math.sin(a + 0.5) * r * 0.82 };
      j = (step * 7 + i * 3) % 5 - 2;   // the zig stays put for 0.1 s at a time, so it reads as a crackle, not a strobe
      M.limb(F, q.x, q.y, (q.x + b.x) / 2 + j * 0.03 * Math.cos(a), (q.y + b.y) / 2 + j * 0.03 * Math.sin(a), C.arc, 0.03);
      M.limb(F, (q.x + b.x) / 2, (q.y + b.y) / 2, b.x, b.y, C.arc, 0.03);
    }
    M.begin(F, HK.mx, HK.my, 0); c.beginPath(); c.arc(0, 0, 0.1, 0, TAU); M.ink(F, C.steel, 1.4);
    c.beginPath(); c.arc(0, 0, 0.04, 0, TAU); c.fillStyle = C.rope; c.fill(); M.end(F);
    hands(F);
  } };

  // ---------- Foam storm (Köpük Fırtınası): the extinguisher with a flared, wide nozzle ----------
  H.foamstorm = { T: 0.3, held: function (F, G, k) {
    var t = k.t, kick = 0.05 * Math.exp(-t / 0.06), wob = 0.1 * Math.sin(t * 40) * Math.exp(-t / 0.1), c;
    arms(F, G, G.pt(0, 0, 0.2 - kick, -0.02, 0), G.pt(1, 2, 0.14 - kick, -0.07, -0.02));
    c = F.c; M.begin(F, HK.mx, HK.my, G.ang); c.rotate(wob);
    M.rr(c, -0.13, -0.05, 0.22, 0.1, 0.05); M.ink(F, C.tank, 1.6);
    c.beginPath(); c.moveTo(0.09, -0.04); c.lineTo(0.22, -0.14); c.lineTo(0.3, 0.14); c.lineTo(0.09, 0.04); c.closePath();
    M.ink(F, C.glass, 1.4);
    c.beginPath(); c.arc(0.27, 0, 0.03, 0, TAU); c.fillStyle = '#D6E8FF'; c.fill();
    M.end(F); hands(F);
  } };

  // ---------- Netspear (Zıpkın Ağı): the speargun with a rope coil on the off hand; a net flies off the tip ----------
  H.netspear = { T: 0.45, rel: 0.2, held: function (F, G, k) {
    var t = k.t, pull = t < H.netspear.rel ? M.eo(t / H.netspear.rel) : 1, c = F.c;
    arms(F, G, G.pt(0, 0, 0.16 - 0.06 * (1 - pull), 0, 0), G.pt(1, 2, 0.04, -0.1, -0.1));
    M.begin(F, HK.mx, HK.my, G.ang);
    if (t < H.netspear.rel) {
      M.rr(c, -0.1, -0.035, 0.22, 0.07, 0.03); M.ink(F, C.wood, 1.5);
      c.beginPath(); c.moveTo(0.12, 0); c.lineTo(0.5, 0); c.strokeStyle = C.steel; c.lineWidth = 1.8 / F.m; c.stroke();
      c.beginPath(); c.arc(0.5, 0, 0.02, 0, TAU); c.fillStyle = C.steel; c.fill();
    } else {
      M.rr(c, -0.1, -0.035, 0.22, 0.07, 0.03); M.ink(F, C.wood, 1.5);
    }
    M.end(F);
    M.begin(F, HK.ox, HK.oy, 0); c.beginPath(); c.arc(0, 0, 0.08, 0, TAU); c.strokeStyle = C.rope; c.lineWidth = 2.2 / F.m; c.stroke(); M.end(F);
    hands(F);
  }, over: function (F, G, k) {
    var t = k.t, c = F.c, q, r, a, i, o = G.pt(4, 0, 0.5, 0, 0);
    if (t < H.netspear.rel) return;
    q = M.seg(t, H.netspear.rel, H.netspear.T);
    r = 0.25 + 0.3 * M.eo(q);
    M.begin(F, o.x + G.ca * 2.2 * q, o.y + G.sa * 2.2 * q, 0);
    c.globalAlpha = 1 - 0.6 * q;
    c.beginPath(); c.arc(0, 0, r, 0, TAU); c.strokeStyle = C.rope; c.lineWidth = 1.2 / F.m; c.stroke();
    c.beginPath();
    for (i = 0; i < 6; i++) { a = i * TAU / 6; c.moveTo(0, 0); c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    c.stroke();
    c.globalAlpha = 1; M.end(F);
  } };

  // ---------- Lake bottle (Ateş Gölü): underhand lob; the bottle tips and its water spills at release ----------
  H.lake = { T: 0.45, rel: 0.3, held: function (F, G, k) {
    var t = k.t, lean = t < H.lake.rel ? 0 : M.seg(t, H.lake.rel, 0.42) * 1.2, back = t < 0.15 ? M.eo(t / 0.15) : 1,
      hf, hu, hm, ho, c = F.c;
    hf = t < H.lake.rel ? M.lerp(-0.08, 0.3, M.seg(t, 0.15, H.lake.rel)) : M.lerp(0.3, 0.36, M.seg(t, H.lake.rel, 0.45));
    hu = t < H.lake.rel ? M.lerp(-0.2, -0.05, back) : -0.1;
    hm = G.pt(0, 0, hf, hu, 0); ho = G.pt(1, 2, hf - 0.1, hu + 0.03, -0.05);
    arms(F, G, hm, ho);
    M.begin(F, HK.mx, HK.my, 0); c.rotate(-lean * 0.9);
    c.beginPath(); c.arc(0, -0.02, 0.055, 0, TAU); c.fillStyle = 'rgba(63,167,214,0.85)'; c.fill();
    c.beginPath(); c.arc(0, -0.02, 0.055, 0, TAU); M.ink(F, null, 1.4);
    M.rr(c, -0.022, -0.13, 0.044, 0.08, 0.01); M.ink(F, '#E9ECEF', 1.3);
    c.fillStyle = '#B23A2E'; c.fillRect(-0.026, -0.15, 0.052, 0.025);
    M.end(F); hands(F);
  } };

  // ---------- Twin saw (İkiz Disk): two discs side by side, thrown together, caught back in the hand ----------
  var TW_REL = 0.2, TW_BACK = 0.7, TW_LAT = 0.11;
  H.twinsaw = { T: 0.9, rel: TW_REL, back: TW_BACK, lat: TW_LAT, held: function (F, G, k) {
    var t = k.t, fwd, lat, up = 0, spin = t * 10, inHand = t < TW_REL || t >= TW_BACK, i, s, d, q;
    if (t < 0.1) { fwd = M.lerp(0.1, -0.2, M.eo(t / 0.1)); lat = M.lerp(0, -0.22, M.eo(t / 0.1)); }
    else if (t < TW_REL) { q = M.ei((t - 0.1) / 0.1); fwd = M.lerp(-0.2, 0.3, q); lat = M.lerp(-0.22, 0, q); spin = 6; }
    else if (t < TW_BACK) { fwd = 0.2; lat = 0.12; up = -0.1; }
    else { q = M.seg(t, TW_BACK, H.twinsaw.T); fwd = M.lerp(0.2, 0.26, q); lat = 0.12 - 0.04 * q; up = M.lerp(-0.1, 0.02, q); spin = (t - TW_BACK) * -6 + 3; }
    arms(F, G, G.pt(0, 0, fwd, up, lat), G.pt(1, 2, 0.1, -0.2, -0.06));
    if (inHand) {
      for (i = -1; i <= 1; i += 2) {
        s = G.pt(3 + (i > 0 ? 1 : 0), 0, fwd + 0.05, up, lat + i * TW_LAT);
        disc(F, s.x, s.y, G.ang, spin, 0.17, 0.6);
      }
    }
    hands(F);
  }, over: function (F, G, k) {
    var t = k.t, i, f, o, sp, lat, d;
    if (t < TW_REL || t >= TW_BACK) return;
    f = M.seg(t, TW_REL, TW_BACK);
    d = 2.6 + 0.2 * (k.lv || 1);
    o = G.pt(14, 0, 0.3, 0, 0);
    for (i = -1; i <= 1; i += 2) {
      lat = i * TW_LAT * (1 + 0.6 * Math.sin(Math.PI * f));
      sp = Math.sin(Math.PI * f) * d;
      disc(F, o.x + G.ca * sp - G.sa * lat, o.y + G.sa * sp + G.ca * lat, G.ang, t * 26 + i, 0.17, 0.6);
    }
  } };

  // ---------- Fireball (Ateş Topu): a glowing orb sits in the palm, then flies from the hand ----------
  H.fireball = { T: 0.4, rel: 0.25, held: function (F, G, k) {
    var t = k.t, reach = t < H.fireball.rel ? M.eo(t / H.fireball.rel) : 1, hm, ho, o, pulse = 0.5 + 0.5 * Math.sin(t * 18);
    hm = G.pt(0, 0, M.lerp(0.05, 0.42, reach), M.lerp(-0.15, 0.02, reach), 0);
    ho = G.pt(1, 2, 0.1, -0.1, -0.12);
    arms(F, G, hm, ho);
    if (t < H.fireball.rel) {
      o = G.pt(2, 0, M.lerp(0.05, 0.42, reach) + 0.02, M.lerp(-0.15, 0.02, reach) + 0.04, 0);
      glow(F, o.x, o.y, 0.16 + 0.03 * pulse, C.fire, 0.45);
      glow(F, o.x, o.y, 0.07, '255,210,122', 0.8);
    }
    hands(F);
  } };

  // ---------- Arc chain (Elektrik Zinciri): the chain hangs from the hand in a loop, links crackle between swings ----------
  H.arcchain = { T: 0.45, held: function (F, G, k) {
    var t = k.t, sw = Math.sin(t * 16), c = F.c, i, p, pr, f;
    arms(F, G, G.pt(0, 0, 0.2, 0.04 + 0.04 * sw, 0), G.pt(1, 2, 0.14, -0.12, -0.12));
    for (i = 0; i < 6; i++) {
      f = i / 5;
      p = G.pt(2 + (i & 1), 0, 0.28 + 0.38 * f, -0.06 - 0.16 * Math.sin(f * Math.PI) + 0.03 * Math.sin(t * 20 + i), 0.02 * Math.sin(t * 14 + i));
      M.begin(F, p.x, p.y, 0); c.beginPath(); c.ellipse(0, 0, 0.03, 0.018, i & 1 ? 0 : Math.PI / 2, 0, TAU);
      c.lineWidth = 1.6 / F.m; c.strokeStyle = C.steel; c.stroke(); M.end(F);
    }
    hands(F);
  } };

  // ---------- Canister bomb (Patlayan Araba Turu): the canister with a lit fuse, lobbed underhand ----------
  H.carbomb = { T: 0.5, held: function (F, G, k) {
    var t = k.t, lob = t < 0.2 ? M.eo(t / 0.2) : 1, hf, hu, hm, ho, c = F.c, pulse = 0.5 + 0.5 * Math.sin(t * 22);
    hf = M.lerp(-0.1, 0.32, lob); hu = M.lerp(-0.22, -0.02, lob);
    hm = G.pt(0, 0, hf, hu, 0); ho = G.pt(1, 2, hf - 0.1, hu + 0.04, -0.06);
    arms(F, G, hm, ho);
    M.begin(F, HK.mx, HK.my, 0);
    M.rr(c, -0.07, -0.1, 0.14, 0.18, 0.03); M.ink(F, C.canister, 1.5);
    c.fillStyle = '#B5562E'; c.fillRect(-0.07, -0.02, 0.14, 0.04);
    c.beginPath(); c.moveTo(0, -0.1); c.lineTo(0, -0.15); c.strokeStyle = C.ink; c.lineWidth = 1.4 / F.m; c.stroke();
    M.end(F);
    glow(F, HK.mx, HK.my + 0.15, 0.04 + 0.02 * pulse, '255,205,90', 0.6);
    hands(F);
  } };

  // ---------- Simit shield (Simit Kalkanı): the ring of bread held out in front, sesame catches the light ----------
  H.skill_shield = { T: 0.5, held: function (F, G, k) {
    var t = k.t, raise = M.eo(M.clamp01(t / 0.25)), c = F.c, ring, i, a, s;
    arms(F, G, G.pt(0, 0, 0.3, 0.02 + 0.06 * raise, 0.1), G.pt(1, 2, 0.34 * raise + 0.1, 0.1, -0.05));
    ring = G.pt(2, 2, 0.5 * raise + 0.05, 0.1, 0);
    M.begin(F, ring.x, ring.y, G.ang); c.scale(1, 0.6);
    c.beginPath(); c.arc(0, 0, 0.2, 0, TAU); c.lineWidth = 0.09; c.strokeStyle = C.gold; c.stroke();
    c.lineWidth = 0.02; c.strokeStyle = C.ink; c.beginPath(); c.arc(0, 0, 0.245, 0, TAU); c.stroke();
    c.beginPath(); c.arc(0, 0, 0.155, 0, TAU); c.stroke();
    for (i = 0; i < 8; i++) { a = i / 8 * TAU + t * 0.6; s = Math.sin(a); c.beginPath(); c.ellipse(Math.cos(a) * 0.2, s * 0.2, 0.017, 0.011, a, 0, TAU); c.fillStyle = C.sesame; c.fill(); }
    M.end(F);
    hands(F);
  } };

  // ---------- Tea glass (Çay Molası): the tulip glass lifted to the mouth, one sip, then lowered ----------
  H.skill_tea = { T: 1.0, held: function (F, G, k) {
    var t = k.t, lift = t < 0.45 ? M.eo(t / 0.45) : t < 0.7 ? 1 : 1 - M.seg(t, 0.7, 1.0) * 0.8, c = F.c, hm, ho;
    hm = G.pt(0, 0, M.lerp(0.25, 0.08, lift), M.lerp(-0.05, 0.42, lift), 0);
    ho = G.pt(1, 2, 0.14, M.lerp(-0.1, 0.22, lift), -0.1);
    arms(F, G, hm, ho);
    M.begin(F, HK.mx, HK.my, 0);
    c.beginPath(); c.moveTo(-0.035, 0.04); c.lineTo(0.035, 0.04); c.lineTo(0.05, -0.07); c.lineTo(-0.05, -0.07); c.closePath();
    M.ink(F, C.glass, 1.4);
    c.beginPath(); c.moveTo(-0.027, 0.03); c.lineTo(0.027, 0.03); c.lineTo(0.038, -0.05); c.lineTo(-0.038, -0.05); c.closePath();
    c.fillStyle = C.tea; c.fill();
    c.fillStyle = C.glass; c.fillRect(-0.05, -0.08, 0.1, 0.012);
    M.end(F); hands(F);
  } };
})(P.FireAnimHeld);
