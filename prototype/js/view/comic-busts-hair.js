// Comic bust hair, beards and moustaches (view only; used by comic-busts-cast.js). Shapes are authored for a head of half
// width 0.14 and scaled in x by k = 1.25 * fw so they follow the rounder v0.9 head (K.HW = 0.175). Hair sits a little proud of the
// skull on purpose: volume reads as warmth. Highlights (hairHi) are a single shine stroke, the cheapest way to look cared for.
P.ComicHair = (function () {
  var K = P.ComicBusts.kit, F = K.F, L = K.L, smooth = K.smooth, seg = K.seg, ell = K.ell;
  var H = {};
  function kOf(S) { return 1.25 * (S.fw || 1); }
  function sc(pts, k) { return pts.map(function (p) { return [p[0] * k, p[1]]; }); }
  function mirror(pts) { return pts.map(function (p) { return [-p[0], p[1]]; }); }
  function shine(ops, x, y) { F(ops, ell(x, y, 0.05, 0.02), 'rgba(255,255,255,0.22)', { ink: 0, halo: false }); }

  // ---------- behind the head and body ----------
  H.back = function (ops, S) {
    var k = kOf(S), st = S.style, side;
    if (st === 'softbob') {
      // A soft bell of hair that frames the face and curls out at the ends (no side strands, which read as pigtails).
      side = [[-0.2, -0.93], [-0.25, -0.78], [-0.262, -0.65], [-0.24, -0.575], [-0.185, -0.55], [-0.15, -0.6], [0, -0.62]];
      F(ops, smooth(side.concat(mirror(side).reverse())), S.hairS, { dx: 0.03 });
    } else if (st === 'ada') {
      side = [[-0.2, -0.92], [-0.235, -0.78], [-0.228, -0.65], [-0.2, -0.595], [-0.155, -0.6], [-0.14, -0.64], [0, -0.62]];
      F(ops, smooth(side.concat(mirror(side).reverse())), S.hairS, { dx: 0.03 });
    } else if (st === 'ponytail') {
      F(ops, smooth([[0.1, -0.97], [0.2, -1.05], [0.32, -1.02], [0.37, -0.9], [0.35, -0.74], [0.3, -0.66], [0.285, -0.77], [0.25, -0.86], [0.17, -0.9]]), S.hairS, { dx: 0.03 });
      L(ops, seg([[0.2, -0.99], [0.3, -0.96], [0.32, -0.86]]), S.hairHi || S.hair, K.LWD * 1.3);
    } else if (st === 'matted') {
      F(ops, smooth([[-0.2, -0.85], [-0.25, -0.66], [-0.21, -0.5], [-0.12, -0.56], [0, -0.5], [0.12, -0.56], [0.21, -0.5],
                     [0.25, -0.66], [0.2, -0.85], [0, -1.0]]), S.hairS, { dx: 0.03 });
    }
  };

  // ---------- hair cap over the skull ----------
  H.hair = function (ops, S) {
    var st = S.style, k = kOf(S), c = S.hair, hi = S.hairHi || S.hair, cap, fr;
    if (st === 'quiff') {
      cap = [[-0.155, -0.8], [-0.15, -0.9], [-0.1, -0.955], [0, -0.975], [0.1, -0.955], [0.15, -0.9], [0.155, -0.8],
             [0.12, -0.84], [0.06, -0.87], [0, -0.885], [-0.07, -0.87], [-0.12, -0.84]];
      F(ops, smooth(sc(cap, k)), c, { dx: 0.03 });
      F(ops, smooth(sc([[-0.05, -0.9], [-0.01, -0.97], [0.05, -1.02], [0.13, -1.04], [0.19, -0.99], [0.17, -0.92], [0.1, -0.9], [0.04, -0.89]], k)), c, { dx: 0.03 });
      L(ops, seg(sc([[-0.07, -0.935], [0, -0.985], [0.1, -1.0]], k)), hi, K.LWD * 1.8);
      L(ops, seg(sc([[0.15, -0.99], [0.2, -0.95]], k)), S.hairS, K.LWD);
      L(ops, seg(sc([[-0.1, -0.88], [-0.06, -0.89]], k)), S.hairS, K.LWD);
    } else if (st === 'side') {
      F(ops, smooth(sc([[-0.15, -0.78], [-0.155, -0.9], [-0.1, -0.975], [0, -0.995], [0.1, -0.975], [0.15, -0.9], [0.15, -0.78],
                        [0.12, -0.85], [0.06, -0.875], [0, -0.85], [-0.06, -0.885], [-0.12, -0.84]], k)), c, { dx: 0.03 });
      L(ops, seg(sc([[-0.035, -0.995], [-0.02, -0.94], [0, -0.9]], k)), S.hairS, K.LWD);
      L(ops, seg(sc([[0.02, -0.96], [0.07, -0.94], [0.1, -0.9]], k)), hi, K.LWD * 1.4);
      if (S.grey) {
        F(ops, smooth(sc([[-0.15, -0.8], [-0.152, -0.86], [-0.12, -0.89], [-0.1, -0.84]], k)), S.grey, { dx: 0.01, ink: K.LWD });
        F(ops, smooth(sc([[0.15, -0.8], [0.152, -0.86], [0.12, -0.89], [0.1, -0.84]], k)), S.grey, { dx: 0.01, ink: K.LWD });
      }
    } else if (st === 'softbob') {
      F(ops, smooth(sc([[-0.16, -0.76], [-0.165, -0.93], [-0.1, -1.0], [0, -1.01], [0.1, -1.0], [0.165, -0.93], [0.17, -0.76],
                        [0.13, -0.84], [0.06, -0.9], [-0.02, -0.9], [-0.1, -0.86], [-0.14, -0.8]], k)), c, { dx: 0.03 });
      L(ops, seg(sc([[-0.1, -0.96], [-0.04, -0.99], [0.04, -0.98]], k)), hi, K.LWD * 1.8);
      L(ops, seg(sc([[-0.02, -0.99], [0.0, -0.93], [0.03, -0.9]], k)), S.grey || hi, K.LWD * 1.6);
      L(ops, seg(sc([[0.04, -0.985], [0.07, -0.935]], k)), S.grey || hi, K.LWD);
    } else if (st === 'ponytail') {
      F(ops, smooth(sc([[-0.15, -0.8], [-0.155, -0.92], [-0.1, -0.985], [0, -1.0], [0.1, -0.985], [0.155, -0.92], [0.15, -0.8],
                        [0.11, -0.86], [0.02, -0.9], [-0.06, -0.895], [-0.12, -0.85]], k)), c, { dx: 0.03 });
      L(ops, seg(sc([[-0.1, -0.95], [-0.02, -0.985], [0.08, -0.975]], k)), hi, K.LWD * 1.8);
    } else if (st === 'ada') {
      // Blunt bangs: the lower edge scallops just above the brows.
      F(ops, smooth(sc([[-0.16, -0.7], [-0.165, -0.93], [-0.1, -1.0], [0, -1.01], [0.1, -1.0], [0.165, -0.93], [0.16, -0.7],
                        [0.13, -0.82], [0.1, -0.88], [0.05, -0.865], [0, -0.885], [-0.05, -0.865], [-0.1, -0.88], [-0.13, -0.82]], k)), c, { dx: 0.03 });
      L(ops, seg(sc([[-0.08, -0.965], [-0.02, -0.99], [0.06, -0.98]], k)), hi, K.LWD * 1.8);
      L(ops, seg(sc([[-0.04, -0.93], [-0.03, -0.885]], k)), S.hairS, K.LWD);
      L(ops, seg(sc([[0.04, -0.93], [0.05, -0.88]], k)), S.hairS, K.LWD);
    } else if (st === 'bald' || st === 'ring') {
      fr = [[0.15, -0.78], [0.17, -0.87], [0.14, -0.92], [0.1, -0.9], [0.12, -0.8]];
      F(ops, smooth(sc(fr, k)), c, { dx: 0.02 });
      F(ops, smooth(sc(mirror(fr), k)), c, { dx: 0.02 });
      shine(ops, -0.06, -0.93);
    } else if (st === 'buzz') {
      F(ops, smooth(sc([[-0.14, -0.8], [-0.15, -0.9], [-0.1, -0.96], [0, -0.98], [0.1, -0.96], [0.15, -0.9], [0.14, -0.8],
                        [0.1, -0.85], [0, -0.87], [-0.1, -0.85]], k)), c, { dx: 0.02 });
      L(ops, seg(sc([[-0.08, -0.945], [0, -0.965], [0.08, -0.945]], k)), S.hairHi || c, K.LWD * 1.2);
    } else if (st === 'crop') {
      // Short textured crop with a fringe swept up and to the side: boyish, sun-bleached, a little messy.
      F(ops, smooth(sc([[-0.15, -0.8], [-0.155, -0.91], [-0.1, -0.965], [0, -0.985], [0.1, -0.965], [0.155, -0.91], [0.15, -0.8],
                        [0.12, -0.85], [0.07, -0.875], [0, -0.87], [-0.07, -0.88], [-0.12, -0.85]], k)), c, { dx: 0.03 });
      F(ops, smooth(sc([[-0.1, -0.9], [-0.06, -0.97], [0.01, -1.015], [0.1, -1.03], [0.17, -1.0], [0.15, -0.945], [0.08, -0.915], [0.0, -0.9]], k)), c, { dx: 0.03 });
      L(ops, seg(sc([[-0.06, -0.94], [0.0, -0.99], [0.1, -1.01]], k)), hi, K.LWD * 1.8);
      L(ops, seg(sc([[0.04, -0.925], [0.1, -0.96], [0.15, -0.97]], k)), S.hairS, K.LWD);
      L(ops, seg(sc([[-0.1, -0.88], [-0.07, -0.9]], k)), S.hairS, K.LWD);
    } else if (st === 'beanie') {
      F(ops, smooth(sc([[-0.17, -0.8], [-0.175, -0.93], [-0.11, -1.01], [0, -1.02], [0.11, -1.01], [0.175, -0.93], [0.17, -0.8], [0, -0.83]], k)), S.beanie, { dx: 0.03 });
      F(ops, smooth(sc([[-0.17, -0.85], [0, -0.88], [0.17, -0.85], [0.165, -0.78], [0, -0.81], [-0.165, -0.78]], k)), S.beanieS, { dx: 0.02, ink: K.LWD });
      F(ops, ell(0, -1.03, 0.04, 0.025), S.beanieS, { dx: 0.01, ink: K.LWD });
    } else if (st === 'matted') {
      F(ops, smooth(sc([[-0.15, -0.8], [-0.16, -0.92], [-0.08, -0.99], [0.02, -0.98], [0.11, -0.95], [0.15, -0.86], [0.15, -0.8],
                        [0.05, -0.84], [-0.05, -0.84], [-0.12, -0.82]], k)), c, { dx: 0.03 });
      L(ops, seg(sc([[-0.1, -0.9], [-0.05, -0.94], [0.03, -0.93]], k)), hi, K.LWD);
      L(ops, seg(sc([[0.06, -0.92], [0.11, -0.88]], k)), hi, K.LWD);
    }
  };

  // ---------- facial hair ----------
  H.facial = function (ops, S) {
    var k = kOf(S);
    if (S.beard) {
      F(ops, smooth(sc([[-0.14, -0.77], [-0.135, -0.66], [-0.09, -0.575], [0, -0.545], [0.09, -0.575], [0.135, -0.66], [0.14, -0.77],
                        [0.105, -0.7], [0.06, -0.625], [0, -0.612], [-0.06, -0.625], [-0.105, -0.7]], k)), S.beard, { ink: K.LWD * 0.8, halo: false, dx: 0.02 });
    }
    if (S.moustache) {
      F(ops, smooth([[-0.075, -0.665], [-0.035, -0.692], [0, -0.68], [0.035, -0.692], [0.075, -0.665], [0.035, -0.65], [0, -0.658], [-0.035, -0.65]]),
        S.moustache, { ink: K.LWD, halo: false });
      if (S.big) [-1, 1].forEach(function (s) { F(ops, ell(s * 0.085, -0.662, 0.022, 0.015), S.moustache, { ink: K.LWD, halo: false }); });
    }
  };
  return H;
})();
