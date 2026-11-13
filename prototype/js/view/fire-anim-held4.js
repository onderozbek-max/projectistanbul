// Held poses, part 4 (view only, workstream W): four evolutions that come from base weapons. Forge (Ocak Ağzı, from the
// blowtorch), grinder (Öğütücü, from the chainsaw), hookpull (Çeki Halatı, from the fishing rod) and minibus (Minibüs Kapısı,
// from the car door). Same contract as fire-anim-held3.js: { T, held(F, G, k), rev?, over?(F, G, k) }. Each pose also has a
// state helper (state(t), or at(G, t, lv) for hookpull) that fire-anim-fx4.js reads, so the launch effects sit on the points
// the held parts draw. Geometry: G.pt(slot, base, fwd, up, lat) in metres; M.begin(F, x, y, a) for an aimed frame (+x forward).
P.FireAnimHeld = P.FireAnimHeld || {};
(function (H) {
  var M = P.FireAnimPrim, TAU = Math.PI * 2, INK = M.INK, FIRE = '255,140,60', HK = { mx: 0, my: 0, ox: 0, oy: 0 };
  var FORGE_TILT = 0.3, HOOK_LEN = 0.75;

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
  // World point of local (lx, ly) in a frame at (x, y) aimed at a: the same mapping as M.begin (+x forward, +y screen-down).
  function local(x, y, a, lx, ly) {
    return { x: x + Math.cos(a) * lx + Math.sin(a) * ly, y: y + Math.sin(a) * lx - Math.cos(a) * ly };
  }
  // Aim angle lifted by tilt toward world up, whichever way Arda faces (G.side is +1 or -1).
  function aimUp(G, tilt) { return G.ang + G.side * tilt; }
  // Curved limb in screen space (ink under-stroke, then colour), bent through control q; wm in metres.
  function bent(F, p0, q, p1, col, wm) {
    var c = F.c, R = F.R;
    c.lineCap = 'round';
    c.beginPath(); c.moveTo(R.X(p0.x), R.Y(p0.y)); c.quadraticCurveTo(R.X(q.x), R.Y(q.y), R.X(p1.x), R.Y(p1.y));
    c.strokeStyle = INK; c.lineWidth = wm * F.m + 3; c.stroke();
    c.strokeStyle = col; c.lineWidth = wm * F.m; c.stroke();
  }

  // ---------- Forge (Ocak Ağzı): two hands on the torch, nozzle lifted; a longer, wider, hotter jet than the blowtorch ----------
  function forgeState(t) {
    var pull = M.eo(M.clamp01(t / 0.12));
    return { tilt: t < 0.12 ? FORGE_TILT * pull : FORGE_TILT * (1 - M.seg(t, 0.5, 0.6)), hf: M.lerp(0.2, 0.16, pull),
      hu: M.lerp(-0.02, 0.02, pull), L: 0.62 * (0.94 + 0.06 * Math.sin(Math.floor(t * 3) / 3 * 60)) * M.seg(t, 0.12, 0.26) * (1 - M.seg(t, 0.5, 0.6)),
      ign: M.seg(t, 0.12, 0.17) };
  }
  H.forge = { T: 0.6, state: forgeState, held: function (F, G, k) {
    var t = k.t, s = forgeState(t), a = aimUp(G, s.tilt), c = F.c, o = 0.25, L = s.L, i, j, x, y, g;
    arms(F, G, G.pt(0, 0, s.hf, s.hu, 0), G.pt(1, 2, 0.3, s.hu - 0.1, 0.02));
    M.begin(F, HK.mx, HK.my, a);
    M.rr(c, -0.14, -0.06, 0.24, 0.12, 0.04); M.ink(F, '#3E5C8A', 1.6);        // tank
    M.rr(c, -0.06, -0.07, 0.05, 0.14, 0.01); M.ink(F, '#B5651D', 1.3);       // copper collar
    c.beginPath(); c.rect(0.1, -0.03, 0.12, 0.06); M.ink(F, '#B8C0CA', 1.2);  // nozzle tube
    c.fillStyle = '#7D848F'; c.fillRect(0.22, -0.04, 0.03, 0.08);            // nozzle tip
    if (L > 0.01) {
      c.beginPath(); c.moveTo(o, -0.05 * s.ign); c.quadraticCurveTo(o + L * 0.5, -0.14, o + L, 0);
      c.quadraticCurveTo(o + L * 0.5, 0.14, o, 0.05 * s.ign); c.closePath();
      c.fillStyle = 'rgba(255,110,30,0.9)'; c.fill();
      c.beginPath(); c.moveTo(o, -0.03 * s.ign); c.quadraticCurveTo(o + L * 0.32, -0.05, o + L * 0.48, 0);
      c.quadraticCurveTo(o + L * 0.32, 0.05, o, 0.03 * s.ign); c.closePath();
      c.fillStyle = 'rgba(127,216,255,0.95)'; c.fill();
      c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.arc(o + 0.02, 0, 0.014, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,240,200,0.22)'; c.lineWidth = 1.5 / F.m;
      for (j = 0; j < 4; j++) {                                              // heat shimmer lines
        c.beginPath();
        for (i = 0; i < 9; i++) {
          x = o + 0.04 + i * 0.07 * (L / 0.62); y = -0.09 + j * 0.06 + 0.014 * Math.sin(i * 1.3 + t * 18 + j);
          if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.stroke();
      }
    }
    M.end(F);
    if (L > 0.01) { g = local(HK.mx, HK.my, a, o, 0); glow(F, g.x, g.y, 0.14, FIRE, 0.35); }
    hands(F);
  } };

  // ---------- Grinder (Öğütücü): a heavy bar with a wheel guard, braced low on both hands; a short cut with sparks ----------
  function grinderState(t) {
    var brace = M.eo(M.clamp01(t / 0.15)),
      th = t < 0.15 ? 0 : t < 0.3 ? M.eo(M.seg(t, 0.15, 0.3)) : t < 0.5 ? 1 : 1 - M.eo(M.seg(t, 0.5, 0.7));
    return { brace: brace, th: th, mf: 0.12 + 0.1 * th, mu: -0.12 * brace, of: 0.24 + 0.1 * th, ou: -0.22 * brace };
  }
  H.grinder = { T: 0.7, state: grinderState, held: function (F, G, k) {
    var t = k.t, s = grinderState(t), vib = t > 0.3 && t < 0.5 && !(P.Settings && P.Settings.reduceMotion) ? 0.008 * Math.sin(t * 90) : 0, c = F.c, spin = t * 40, i, a;   // the grinder's shake is off under Reduce motion
    arms(F, G, G.pt(0, 0, s.mf + vib, s.mu, 0), G.pt(1, 2, s.of + vib, s.ou, -0.05));
    M.begin(F, HK.mx, HK.my, G.ang);
    M.rr(c, -0.26, -0.1, 0.3, 0.2, 0.05); M.ink(F, '#5A606C', 1.8);            // heavy housing
    c.fillStyle = '#E9A23B'; c.fillRect(-0.2, -0.13, 0.14, 0.04);             // amber cap
    M.rr(c, -0.12, 0.1, 0.07, 0.1, 0.02); M.ink(F, '#2B2B2B', 1.2);           // trigger grip
    c.beginPath(); c.rect(0.04, -0.03, 0.2, 0.06); M.ink(F, '#B8C0CA', 1.4);   // thick bar
    c.beginPath(); c.ellipse(0.36, 0, 0.15, 0.08, 0, 0, TAU); M.ink(F, '#9AA3AE', 1.4);   // wheel
    c.strokeStyle = '#3A3F47'; c.lineWidth = 2 / F.m;
    for (i = 0; i < 4; i++) { a = spin + i * Math.PI / 2; c.beginPath(); c.moveTo(0.36, 0); c.lineTo(0.36 + Math.cos(a) * 0.15, Math.sin(a) * 0.08); c.stroke(); }
    c.beginPath(); c.arc(0.36, 0, 0.17, Math.PI * 1.1, Math.PI * 1.9); c.strokeStyle = INK; c.lineWidth = 4.5 / F.m; c.stroke();
    c.strokeStyle = '#E9A23B'; c.lineWidth = 2.4 / F.m; c.stroke();            // wheel guard over the top
    c.beginPath(); c.arc(0.36, 0, 0.03, 0, TAU); c.fillStyle = '#3A3F47'; c.fill();
    M.end(F); hands(F);
  } };

  // ---------- Fishing rod, hookpull (Çeki Halatı): the lure is thrown, the line goes taut, the rod bends back, then a hard reel-in ----------
  // Returns the hand, rod tip, hook and bend points (world metres) for time t; held and fx4 both read it.
  function hookAt(G, t, lv) {
    var w = M.eo(M.clamp01(t / 0.16)), q = M.eo(M.seg(t, 0.16, 0.3)), pull = M.seg(t, 0.3, 0.42), reel = M.eo(M.seg(t, 0.42, 0.6)),
      relax = M.seg(t, 0.55, 0.7), D = 2.4 + 0.2 * (lv || 1), hf, hu, phi, dist, bow, sag, h0, hand, A, tip, hook, drop, mid;
    if (t < 0.16) { hf = M.lerp(0.14, -0.02, w); hu = M.lerp(-0.02, -0.12, w); phi = M.lerp(0.2, 0.9, w); dist = 0; bow = 0.05 * w; sag = 0; }
    else if (t < 0.3) { hf = M.lerp(-0.02, 0.3, q); hu = M.lerp(-0.12, -0.02, q); phi = M.lerp(0.9, 0.5, q); dist = D * q; bow = M.lerp(0.05, 0.1, q); sag = 0.25 * (1 - q); }
    else if (t < 0.42) { hf = M.lerp(0.3, 0.12, pull); hu = -0.02; phi = 0.5; dist = D; bow = M.lerp(0.1, 0.3, pull); sag = 0; }
    else { hf = M.lerp(0.12, 0.02, reel); hu = -0.02; phi = 0.5; dist = D * M.lerp(1, 0.45, reel); bow = 0.3 * (1 - 0.6 * relax); sag = 0; }
    h0 = G.pt(0, 0, hf, hu, 0); hand = { x: h0.x, y: h0.y };
    A = aimUp(G, phi);
    tip = { x: hand.x + Math.cos(A) * HOOK_LEN, y: hand.y + Math.sin(A) * HOOK_LEN };
    drop = 0.1 * Math.min(1, dist / 0.5);
    hook = { x: tip.x + G.ca * dist, y: tip.y + G.sa * dist - drop };
    mid = { x: (hand.x + tip.x) / 2, y: (hand.y + tip.y) / 2 };
    return { hf: hf, hu: hu, cr: t > 0.42 ? (t - 0.42) * 40 : 0, hand: hand, tip: tip, hook: hook,
      bend: { x: mid.x - G.ca * 2 * bow, y: mid.y - G.sa * 2 * bow },
      lineQ: { x: (tip.x + hook.x) / 2, y: (tip.y + hook.y) / 2 - 2 * sag } };
  }
  H.hookpull = { T: 0.7, at: hookAt, held: function (F, G, k) {
    var s = hookAt(G, k.t, k.lv), c = F.c;
    arms(F, G, G.pt(0, 0, s.hf, s.hu, 0), G.pt(1, 2, s.hf + 0.1, s.hu - 0.1, -0.06));
    c.beginPath(); c.moveTo(F.R.X(s.tip.x), F.R.Y(s.tip.y));                 // taut line (straight once the hook is out)
    c.quadraticCurveTo(F.R.X(s.lineQ.x), F.R.Y(s.lineQ.y), F.R.X(s.hook.x), F.R.Y(s.hook.y));
    c.strokeStyle = 'rgba(238,242,246,0.95)'; c.lineWidth = 1.2; c.lineCap = 'round'; c.stroke();
    bent(F, s.hand, s.bend, s.tip, '#4B3621', 0.022);                         // rod, bowed back under load
    M.begin(F, s.hand.x, s.hand.y, 0);                                        // reel with a turning crank
    c.beginPath(); c.arc(0, 0, 0.035, 0, TAU); M.ink(F, '#B8C0CA', 1.4);
    c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(s.cr) * 0.045, Math.sin(s.cr) * 0.045); c.strokeStyle = INK; c.lineWidth = 2 / F.m; c.stroke();
    M.end(F);
    M.begin(F, s.hook.x, s.hook.y, 0);                                        // lure head and barb
    c.beginPath(); c.arc(0, 0, 0.025, 0, TAU); M.ink(F, '#E9A23B', 1.4);
    c.beginPath(); c.arc(0.012, 0.02, 0.022, Math.PI * 0.1, Math.PI * 1.1); c.strokeStyle = '#C9CED6'; c.lineWidth = 1.6 / F.m; c.stroke();
    M.end(F);
    hands(F);
  } };

  // ---------- Minibus door (Minibüs Kapısı): a plain van door held overhead, then slammed forward and down ----------
  function minibusState(t) {
    var lift = M.eo(M.clamp01(t / 0.2)), drop = M.ei(M.seg(t, 0.32, 0.42)), settle = M.seg(t, 0.42, 0.6), up, fwd, rot;
    if (t < 0.2) { up = M.lerp(0, 0.55, lift); fwd = M.lerp(0.1, 0.06, lift); rot = 0; }
    else if (t < 0.32) { up = 0.55; fwd = 0.06; rot = 0; }
    else if (t < 0.42) { up = M.lerp(0.55, -0.2, drop); fwd = M.lerp(0.06, 0.4, drop); rot = Math.PI / 2 * drop; }
    else { up = -0.2 + 0.05 * Math.sin(settle * Math.PI) * (1 - settle); fwd = 0.4; rot = Math.PI / 2; }
    return { up: up, fwd: fwd, rot: rot };
  }
  // World offset of a door-local point (lx, ly; ly is down, as on the canvas) after the door turns by th (canvas radians).
  function doorPt(lx, ly, th) {
    var wy = -ly;
    return { x: lx * Math.cos(th) + wy * Math.sin(th), y: -lx * Math.sin(th) + wy * Math.cos(th) };
  }
  H.minibus = { T: 0.6, state: minibusState, held: function (F, G, k) {
    var s = minibusState(k.t), C = G.pt(4, 2, s.fwd, s.up, 0), cx = C.x, cy = C.y, th = G.side * s.rot, c = F.c, mh, oh;
    mh = doorPt(-0.14 * G.side, 0.3, th); oh = doorPt(0.14 * G.side, 0.3, th);   // grips on the door's bottom corners
    arms(F, G, { x: cx + mh.x, y: cy + mh.y }, { x: cx + oh.x, y: cy + oh.y });
    M.begin(F, cx, cy, 0); c.rotate(th);
    M.rr(c, -0.2, -0.3, 0.4, 0.6, 0.05); M.ink(F, '#DDE3E8', 1.8);            // plain panel, no livery
    M.rr(c, -0.15, -0.26, 0.3, 0.2, 0.03); M.ink(F, '#8FB3C7', 1.1);          // window band
    c.beginPath(); c.moveTo(-0.15, 0.08); c.lineTo(0.15, 0.08); c.strokeStyle = INK; c.lineWidth = 1.1 / F.m; c.stroke();   // rib
    c.fillStyle = '#2B2B2B'; c.fillRect(0.05, 0.12, 0.1, 0.03);               // handle
    c.fillStyle = '#8A8F98'; c.fillRect(-0.2, -0.3, 0.03, 0.6);               // hinge edge
    M.end(F); hands(F);
  } };
})(P.FireAnimHeld);
