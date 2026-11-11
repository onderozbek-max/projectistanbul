// Held poses, part 2 (view only, workstream B): extinguisher, sawblade, manhole, torch, olta, cardoor, slingshot,
// chainsaw (rev and cut). Same contract as fire-anim-held.js: { T, held(F, G, k), rev?, and helpers used by fx }.
P.FireAnimHeld = P.FireAnimHeld || {};
(function (H) {
  var M = P.FireAnimPrim, INK = '#14151F', TAU = Math.PI * 2, HK = { mx: 0, my: 0, ox: 0, oy: 0 };

  function arms(F, G, hm, ho) {
    M.arm(F, G.mx, G.my, hm.x, hm.y, G.side, M.SLEEVE); HK.mx = M.hx; HK.my = M.hy;
    M.arm(F, G.ox, G.oy, ho.x, ho.y, -G.side, M.SLEEVE); HK.ox = M.hx; HK.oy = M.hy;
  }
  function hands(F) { M.hand(F, HK.mx, HK.my); M.hand(F, HK.ox, HK.oy); }
  function lstar(c, x, y, r, col) {
    c.beginPath();
    for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4 + 0.3, rr = i & 1 ? r * 0.28 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath(); c.fillStyle = col; c.fill();
  }
  // Flat disc (saw blade or manhole rim) in the aim frame, squashed for the 3/4 view, teeth turning with spin.
  function sawDisc(F, x, y, a, spin, r, sq) {
    var c = F.c, i, q, rr;
    M.begin(F, x, y, a);
    c.scale(1, sq); c.rotate(spin);
    c.beginPath();
    for (i = 0; i < 16; i++) { q = i / 16 * TAU; rr = i & 1 ? r * 0.84 : r; c.lineTo(Math.cos(q) * rr, Math.sin(q) * rr); }
    c.closePath(); M.ink(F, '#9AA3AE', 1.4);
    c.beginPath(); c.arc(0, 0, r * 0.5, 0, TAU); c.strokeStyle = '#E9A23B'; c.lineWidth = 1.2 / F.m; c.stroke();
    c.beginPath(); c.arc(0, 0, r * 0.2, 0, TAU); c.fillStyle = '#3A3F47'; c.fill();
    M.end(F);
  }

  // ---------- Fire extinguisher (Yangın Tüpü): held horizontal, nozzle forward, pressure kick ----------
  H.extinguisher = { T: 0.3, held: function (F, G, k) {
    var t = k.t, kick = 0.085 * Math.exp(-t / 0.07), wob = 0.14 * Math.sin(t * 40) * Math.exp(-t / 0.12), c;
    arms(F, G, G.pt(0, 0, 0.2 - kick, -0.02, 0), G.pt(1, 2, 0.14 - kick, -0.07, -0.02));
    c = F.c; M.begin(F, HK.mx, HK.my, G.ang); c.rotate(wob);
    M.rr(c, -0.13, -0.05, 0.26, 0.1, 0.05); M.ink(F, '#D7263D', 1.6);
    c.fillStyle = '#F4F1EA'; c.fillRect(-0.02, -0.05, 0.04, 0.1);
    c.beginPath(); c.arc(-0.07, -0.035, 0.013, 0, TAU); c.fillStyle = '#F4F1EA'; c.fill();
    M.rr(c, -0.16, -0.065, 0.05, 0.13, 0.02); M.ink(F, '#2B2B2B', 1.4);
    c.beginPath(); c.moveTo(0.13, -0.02); c.lineTo(0.22, -0.03); c.lineTo(0.27, 0); c.lineTo(0.22, 0.03); c.lineTo(0.13, 0.02); c.closePath();
    M.ink(F, '#2B2B2B', 1.4);
    M.end(F); hands(F);
  } };

  // ---------- Sawblade (Testere Diski): sidearm frisbee throw, catch pose on return ----------
  var SAW_REL = 0.18, SAW_BACK = 0.68;
  H.sawblade = { T: 0.8, rel: SAW_REL, back: SAW_BACK, held: function (F, G, k) {
    var t = k.t, fwd, lat, up = 0, spin = t * 10, inHand = t < SAW_REL || t >= SAW_BACK;
    if (t < 0.1) { fwd = M.lerp(0.1, -0.2, M.eo(t / 0.1)); lat = M.lerp(0, -0.22, M.eo(t / 0.1)); }
    else if (t < SAW_REL) { var r = M.ei((t - 0.1) / 0.08); fwd = M.lerp(-0.2, 0.3, r); lat = M.lerp(-0.22, 0, r); spin = 6; }
    else if (t < 0.3) { var f1 = M.seg(t, SAW_REL, 0.3); fwd = M.lerp(0.3, 0.2, f1); lat = M.lerp(0, 0.12, f1); }
    else if (t < SAW_BACK) { fwd = 0.2; lat = 0.12; up = -0.1; }
    else { var q = M.seg(t, SAW_BACK, 0.8); fwd = M.lerp(0.2, 0.26, q); lat = 0.12 - 0.04 * q; up = M.lerp(-0.1, 0.02, q); spin = (t - SAW_BACK) * -6 + 3; }
    arms(F, G, G.pt(0, 0, fwd, up, lat), G.pt(1, 2, 0.1, -0.2, -0.06));
    if (inHand) {
      var d = G.pt(3, 0, fwd + 0.05, up, lat);
      sawDisc(F, d.x, d.y, G.ang, spin, 0.19, 0.6);
    }
    hands(F);
  } };

  // ---------- Manhole cover (Rögar Kapağı): heavy two-hand discus, twist then release, strain marks ----------
  H.manhole = { T: 0.5, held: function (F, G, k) {
    var t = k.t, fc, lc, w = M.seg(t, 0, 0.22), r = M.seg(t, 0.22, 0.3), c, i, hd, ang;
    if (t < 0.22) { fc = M.lerp(0.22, -0.02, M.eo(w)); lc = M.lerp(0, -0.2, M.eo(w)); }
    else if (t < 0.3) { fc = M.lerp(-0.02, 0.42, M.ei(r)); lc = M.lerp(-0.2, 0, M.ei(r)); }
    else { fc = M.lerp(0.42, 0.3, M.seg(t, 0.3, 0.5)); lc = 0; }
    arms(F, G, G.pt(0, 2, fc, 0, lc + 0.18), G.pt(1, 2, fc, 0, lc - 0.18));
    if (t < 0.3) {
      var cc = G.pt(3, 2, fc, 0, lc), spin = t * 18;
      c = F.c;
      M.begin(F, cc.x, cc.y, G.ang + Math.PI / 2);
      c.beginPath(); c.ellipse(0, 0, 0.19, 0.1, 0, 0, TAU); M.ink(F, '#3F434D', 1.8);
      c.strokeStyle = '#5A606C'; c.lineWidth = 2.5 / F.m;
      for (i = 0; i < 4; i++) { ang = spin + i * Math.PI / 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(ang) * 0.15, Math.sin(ang) * 0.075); c.stroke(); }
      M.end(F);
    }
    hands(F);
    if (t > 0.12 && t < 0.48) {                          // comic strain marks above the head
      hd = G.pt(4, 2, 0.02, 0.6, 0); c = F.c;
      c.strokeStyle = INK; c.lineWidth = 2.2; c.lineCap = 'round';
      for (i = -1; i <= 1; i++) {
        ang = -Math.PI / 2 + i * 0.7;
        c.beginPath();
        c.moveTo(F.R.X(hd.x) + Math.cos(ang) * 0.05 * F.m, F.R.Y(hd.y) + Math.sin(ang) * 0.05 * F.m);
        c.lineTo(F.R.X(hd.x) + Math.cos(ang) * (0.1 + 0.02 * Math.sin(t * 30)) * F.m, F.R.Y(hd.y) + Math.sin(ang) * (0.1 + 0.02 * Math.sin(t * 30)) * F.m);
        c.stroke();
      }
    }
  } };

  // ---------- Blowtorch (Pürmüz): ignite, then a blue core with an orange jet and heat shimmer ----------
  H.torch = { T: 0.4, held: function (F, G, k) {
    var t = k.t, ign = M.seg(t, 0, 0.05), flick = 0.92 + 0.08 * Math.sin(t * 60), L = 0.42 * flick * M.seg(t, 0.04, 0.12), c, j, i;
    var pb = t < 0.05 ? 0.05 * M.eo(t / 0.05) : 0.05 * Math.exp(-(t - 0.05) / 0.09);   // draw back to ignite, then the jet pushes the hand forward
    arms(F, G, G.pt(0, 0, 0.2 - pb, 0, 0), G.pt(1, 2, 0.14 - pb * 0.6, -0.08, 0.02));
    c = F.c; M.begin(F, HK.mx, HK.my, G.ang);
    M.rr(c, -0.1, -0.045, 0.2, 0.09, 0.03); M.ink(F, '#4A6FA5', 1.6);
    M.rr(c, -0.13, 0.02, 0.1, 0.07, 0.02); M.ink(F, '#E4572E', 1.4);
    c.beginPath(); c.rect(0.1, -0.02, 0.1, 0.04); M.ink(F, '#B8C0CA', 1.2);
    c.fillStyle = '#7D848F'; c.fillRect(0.19, -0.025, 0.02, 0.05);
    if (L > 0.01) {
      c.beginPath(); c.moveTo(0.21, -0.03 * ign); c.quadraticCurveTo(0.21 + L * 0.5, -0.07, 0.21 + L, 0);
      c.quadraticCurveTo(0.21 + L * 0.5, 0.07, 0.21, 0.03 * ign); c.closePath();
      c.fillStyle = 'rgba(255,138,31,0.88)'; c.fill();
      c.beginPath(); c.moveTo(0.21, -0.018); c.quadraticCurveTo(0.21 + L * 0.3, -0.03, 0.21 + L * 0.42, 0);
      c.quadraticCurveTo(0.21 + L * 0.3, 0.03, 0.21, 0.018); c.closePath();
      c.fillStyle = 'rgba(127,216,255,0.95)'; c.fill();
      c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.arc(0.22, 0, 0.012, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,240,200,0.22)'; c.lineWidth = 1.5 / F.m;
      for (j = 0; j < 3; j++) {
        c.beginPath();
        for (i = 0; i < 9; i++) {
          var x = 0.3 + i * 0.05 * (L / 0.42), y = (-0.06 + j * 0.06) + 0.012 * Math.sin(i * 1.3 + t * 18 + j);
          if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.stroke();
      }
    }
    M.end(F); hands(F);
  } };

  // ---------- Fishing rod (Olta): overhead cast, the lure arcs out and splashes, then the reel winds in ----------
  H.olta = { T: 0.6, held: function (F, G, k) {
    var t = k.t, phi, hm, A, tipx, tipy, D = 2.4 + 0.2 * k.lv, lf = M.seg(t, 0.2, 0.44), reel = M.seg(t, 0.46, 0.6), dist, lx, ly, c, cr;
    if (t < 0.16) phi = M.lerp(0, 3.4, M.eo(t / 0.16));
    else if (t < 0.28) phi = M.lerp(3.4, -0.1, M.ei((t - 0.16) / 0.12));
    else phi = M.lerp(-0.1, 0, M.seg(t, 0.28, 0.4));
    hm = G.pt(0, 0, 0.12, -0.02, 0);
    A = G.ang + phi; tipx = hm.x + Math.cos(A) * 0.6; tipy = hm.y + Math.sin(A) * 0.6;
    arms(F, G, hm, G.pt(1, 2, 0.14, -0.12, -0.04));
    c = F.c;
    M.limb(F, hm.x, hm.y, tipx, tipy, '#4B3621', 0.02);
    if (t >= 0.2) {
      dist = D * M.eo(lf) * (1 - 0.35 * reel);
      lx = tipx + Math.cos(G.ang) * dist; ly = tipy + Math.sin(G.ang) * dist + 0.35 * Math.sin(Math.PI * lf) * (1 - reel);
      c.beginPath(); c.moveTo(F.R.X(tipx), F.R.Y(tipy));
      c.quadraticCurveTo(F.R.X((tipx + lx) / 2), F.R.Y((tipy + ly) / 2 - 0.06 * (1 - reel)), F.R.X(lx), F.R.Y(ly));
      c.strokeStyle = 'rgba(238,242,246,0.95)'; c.lineWidth = 1.2; c.lineCap = 'round'; c.stroke();
      M.begin(F, lx, ly, 0); c.beginPath(); c.arc(0, 0, 0.028, 0, TAU); M.ink(F, '#E9A23B', 1.4);
      c.save(); c.rotate(t * 40); c.beginPath(); c.ellipse(0, 0, 0.05, 0.012, 0, 0, TAU); c.fillStyle = '#C9CED6'; c.fill(); c.restore();
      M.end(F);
    }
    M.begin(F, hm.x, hm.y, 0); c.beginPath(); c.arc(0, 0, 0.035, 0, TAU); M.ink(F, '#B8C0CA', 1.4);
    cr = t > 0.46 ? (t - 0.46) * 20 : 0;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(cr) * 0.045, Math.sin(cr) * 0.045); c.strokeStyle = INK; c.lineWidth = 2 / F.m; c.stroke();
    M.end(F);
    hands(F);
  } };

  // ---------- Car door shield (Araba Kapısı): raise, then shove forward ----------
  H.cardoor = { T: 0.4, held: function (F, G, k) {
    var t = k.t, dfwd, dup, c, C, g, al;
    if (t < 0.14) { dfwd = 0.12; dup = M.lerp(-0.25, 0.1, M.eo(t / 0.14)); }
    else if (t < 0.22) { var s = M.ei((t - 0.14) / 0.08); dfwd = M.lerp(0.12, 0.5, s); dup = 0.1 - 0.02 * s; }
    else { var r = M.eo(M.seg(t, 0.22, 0.4)); dfwd = M.lerp(0.5, 0.2, r); dup = M.lerp(0.08, 0, r); }
    C = G.pt(4, 2, dfwd, dup, 0);
    arms(F, G, G.pt(0, 2, dfwd, dup, 0.17), G.pt(1, 2, dfwd, dup, -0.17));
    c = F.c;
    if (t > 0.14 && t < 0.26) {                           // motion echo while shoving
      for (g = 1; g <= 2; g++) {
        al = g === 1 ? 0.25 : 0.12;
        var E = G.pt(5, 2, dfwd - g * 0.13, dup, 0);
        M.begin(F, E.x, E.y, 0); c.globalAlpha = al;
        M.rr(c, -0.2, -0.3, 0.4, 0.6, 0.05); c.fillStyle = '#7D9BB0'; c.fill();
        c.globalAlpha = 1; M.end(F);
      }
    }
    M.begin(F, C.x, C.y, 0); c.rotate(-G.sa * 0.2);
    M.rr(c, -0.2, -0.3, 0.4, 0.6, 0.05); M.ink(F, '#7D9BB0', 1.8);
    M.rr(c, -0.16, -0.27, 0.32, 0.2, 0.03); M.ink(F, '#BFE3F0', 1.1);   // window band across the top (local -y is up)
    c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(-0.12, -0.24, 0.05, 0.1);
    c.fillStyle = '#2B2B2B'; c.fillRect(0.05, -0.02, 0.12, 0.03);        // door handle
    c.fillStyle = '#2B2B2B'; c.fillRect(-0.2, 0.2, 0.4, 0.035);          // sill
    M.rr(c, -0.3, -0.24, 0.1, 0.06, 0.02); M.ink(F, '#7D9BB0', 1.4);    // side mirror
    M.end(F);
    hands(F);
  } };

  // ---------- Slingshot (Sapan): pull the pouch back, the bands snap, marbles fly ----------
  function pouchAt(t) {
    return t < 0.2 ? M.lerp(0.26, -0.1, M.eo(t / 0.2)) : M.lerp(-0.1, 0.4, M.ei(M.seg(t, 0.2, 0.24)));
  }
  H.slingshot = { T: 0.4, pouch: pouchAt, held: function (F, G, k) {
    var t = k.t, hm = G.pt(0, 2, 0.26, -0.02, 0), J = G.pt(1, 2, 0.36, 0.02, 0), tA = G.pt(2, 2, 0.44, 0.02, 0.14), tB = G.pt(3, 2, 0.44, 0.02, -0.14);
    var PO = G.pt(4, 2, pouchAt(t), 0.0, -0.06), c, stretch, ps;
    var holdPouch = t < 0.24;
    arms(F, G, hm, holdPouch ? PO : G.pt(5, 1, 0.02, -0.3, -0.02));
    c = F.c;
    stretch = holdPouch ? M.clamp01((0.26 - pouchAt(t)) / 0.36) : 0;
    ps = F.R;
    c.lineCap = 'round';
    c.beginPath(); c.moveTo(ps.X(tA.x), ps.Y(tA.y)); c.lineTo(ps.X(holdPouch ? PO.x : J.x), ps.Y(holdPouch ? PO.y : J.y)); c.lineTo(ps.X(tB.x), ps.Y(tB.y));
    c.strokeStyle = 'rgba(43,43,43,' + (0.8 + 0.2 * stretch).toFixed(3) + ')'; c.lineWidth = 1.4 + 1.6 * stretch; c.stroke();
    M.limb(F, hm.x, hm.y, J.x, J.y, '#4A2E15', 0.036);
    M.limb(F, J.x, J.y, tA.x, tA.y, '#4A2E15', 0.03);
    M.limb(F, J.x, J.y, tB.x, tB.y, '#4A2E15', 0.03);
    if (holdPouch) {
      M.begin(F, PO.x, PO.y, G.ang); M.rr(c, -0.045, -0.035, 0.09, 0.07, 0.025); M.ink(F, '#C9A36B', 1.4); M.end(F);
    }
    hands(F);
  } };

  // ---------- Chainsaw (Motorlu Testere): rev vibration, cut thrust; `rev` is the idle revving pose ----------
  function saw(F, G, k, rev) {
    var t = k.t, kick = 0, vib = rev && !F.rm ? 0.012 : 0;
    if (!rev) {                                          // wind back, thrust through the cut, ease home
      if (t < 0.05) kick = -0.06 * M.eo(t / 0.05);
      else if (t < 0.12) kick = M.lerp(-0.06, 0.1, M.ei((t - 0.05) / 0.07));
      else kick = M.lerp(0.1, 0, M.eo(M.seg(t, 0.12, 0.3)));
    }
    var vx = vib ? M.rnd(-vib, vib) : 0, vy = vib ? M.rnd(-vib, vib) : 0, c, ph = rev ? (t * 3.7) % 1 : (t * 2) % 1, i;
    arms(F, G, G.pt(0, 2, 0.1 + kick + vx, -0.03 + vy, 0.04), G.pt(1, 2, 0.2 + kick + vx, -0.03 + vy, -0.04));
    c = F.c; M.begin(F, HK.mx, HK.my, G.ang);
    M.rr(c, -0.26, -0.075, 0.28, 0.15, 0.04); M.ink(F, '#E8662C', 1.8);
    c.fillStyle = '#2B2B2B'; c.fillRect(-0.3, -0.03, 0.05, 0.06); c.fillRect(-0.12, -0.1, 0.05, 0.03);
    c.beginPath(); c.rect(0.02, -0.015, 0.4, 0.03); M.ink(F, '#B8C0CA', 1.4);
    c.beginPath(); c.arc(0.42, 0, 0.016, 0, TAU); M.ink(F, '#B8C0CA', 1.2);
    if (rev) { c.fillStyle = 'rgba(200,210,220,0.22)'; c.fillRect(0.02, -0.035, 0.4, 0.07); }
    c.fillStyle = '#2B2B2B';
    for (i = 0; i < 10; i++) c.fillRect(0.02 + ((i / 10 + ph) % 1) * 0.4, -0.024, 0.014, 0.01);
    M.end(F);
    if (rev && !F.rm) {                                  // vibration ticks beside the housing
      c.strokeStyle = INK; c.lineWidth = 1.8; c.lineCap = 'round';
      for (i = 0; i < 3; i++) {
        var px = F.R.X(HK.mx) + (i - 1) * 4 - 6, py = F.R.Y(HK.my) - 9 - i * 2;
        c.beginPath(); c.moveTo(px, py); c.lineTo(px - 3, py - 3); c.stroke();
      }
    }
    hands(F);
  }
  H.chainsaw = { T: 0.3, held: function (F, G, k) { saw(F, G, k, false); }, rev: function (F, G, k) { saw(F, G, k, true); } };

  H.sawDisc = sawDisc;
})(P.FireAnimHeld);
