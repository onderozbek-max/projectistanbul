// Comic bust cast (view only): costume, hair and facial hair per character, drawn with the kit from comic-busts.js.
// Hooks called by P.ComicBusts: back (behind the body), torso, front (collars, zip, strap, drawn over the neck), hair
// (cap over the skull), facial (beard, moustache), over (headwear, glasses, earbuds, earrings). Coordinates are unit
// space (see comic-busts.js). Arda: 20, red hoodie over a dark tee, backpack strap, earbud cable, quiff.
P.ComicCast = (function () {
  var K = P.ComicBusts.kit, F = K.F, L = K.L, smooth = K.smooth, poly = K.poly, ell = K.ell, rct = K.rct, seg = K.seg;
  var C = {}, DET = { ink: K.LWD, halo: false }, PAPER_BTN = '#F4F1EA';
  // Per character: skin, hair, costume colours; style (hair shape), top (costume), fw (head width) and sw (shoulder width).
  var SPEC = {
    arda: { skin: '#E0AC80', skinS: '#C48A5E', hair: '#2A1A12', hairS: '#15100B', hairHi: '#5A3A2A', brow: '#2A1A12',
            eyes: '#1E1712', style: 'quiff', top: 'hoodie', topC: '#D7263D', topS: '#9E1B2C', tee: '#262B3F',
            strap: '#1E2233', buds: true, fw: 1, sw: 1 },
    anne: { skin: '#E8B894', skinS: '#C8906A', hair: '#4A3428', hairS: '#2B1E16', hairHi: '#6A4E3C', grey: '#B9B4AE',
            brow: '#4A3428', eyes: '#3A2A20', style: 'wavy', top: 'cardigan', topC: '#3A7C7A', topS: '#245B59',
            blouse: '#F4EBDD', earring: '#E9A23B', lines: true, fw: 0.96, sw: 0.96 },
    baba: { skin: '#C68B5E', skinS: '#A06B45', hair: '#3B3B40', hairS: '#222226', grey: '#9AA0A8', brow: '#3B3B40',
            eyes: '#1E1712', style: 'side', top: 'shirt', topC: '#9EC3DE', topS: '#7AA3C0', tie: '#2B3346',
            glasses: true, moustache: '#2A2A2E', lines: true, fw: 1, sw: 1 },
    usta: { skin: '#B88455', skinS: '#946338', hair: '#D9D9D9', hairS: '#AEAEAE', brow: '#D9D9D9', eyes: '#2A1E16',
            style: 'bald', top: 'chef', topC: '#F4F1EA', topS: '#CFC9BC', buttons: '#3B3B40', moustache: '#E4E4E4',
            big: true, lines: true, fw: 1.04, sw: 1.04 },
    friend: { skin: '#C68B5E', skinS: '#9E6A40', hair: '#1E1712', hairS: '#0E0A07', brow: '#1E1712', eyes: '#1E1712',
              style: 'buzz', beard: '#3A2E26', top: 'jacket', topC: '#6B7A4A', topS: '#4E5A33', under: PAPER_BTN,
              fw: 1.1, sw: 1.1 },
    shopkeeper: { skin: '#D9A77C', skinS: '#B9825A', hair: '#8A8F98', hairS: '#66707A', brow: '#66707A', eyes: '#2A2420',
                  style: 'bald', cap: '#5E5040', capS: '#40372B', top: 'apron', topC: '#E9E4D8', topS: '#CFC6B4',
                  apron: '#2F5B8A', moustache: '#3B3B40', fw: 1, sw: 1 },
    news: { skin: '#F1C9A5', skinS: '#D4A07A', hair: '#14151F', hairS: '#0A0A10', brow: '#14151F', eyes: '#1E1712',
            style: 'side', top: 'suit', topC: '#2B3346', topS: '#1B2030', shirt: PAPER_BTN, tie: '#7A2E2E', fw: 1, sw: 1 },
    stranger: { skin: '#9C6B47', skinS: '#7A4F32', hair: '#2A2420', hairS: '#16120F', brow: '#2A2420', eyes: '#1E1712',
                style: 'beanie', beanie: '#3D6E9E', beanieS: '#2B4A6F', beard: '#2A2420', top: 'jacket', topC: '#4F7A4A',
                topS: '#38573A', under: '#8A8F98', fw: 1, sw: 1 },
    zombie: { skin: '#9EAB7F', skinS: '#7A8A60', hair: '#3B3B2A', hairS: '#23231A', brow: '#23231A', eyes: '#2A2F22',
              style: 'matted', top: 'torn', topC: '#5B6E7E', topS: '#44535F', zombie: true, fw: 1.02, sw: 1 }
  };
  C.spec = function (who) { return SPEC[who] || SPEC.stranger; };

  // Shoulders and chest. The neck covers the middle top edge; the torso runs past the base and is cropped there.
  function torsoPts(sw) {
    return [[-0.09, -0.46], [-0.2, -0.43], [-0.28 * sw, -0.39], [-0.32 * sw, -0.3], [-0.335 * sw, -0.16], [-0.34 * sw, 0.12],
            [-0.36 * sw, 0.62], [0.36 * sw, 0.62], [0.34 * sw, 0.12], [0.335 * sw, -0.16], [0.32 * sw, -0.3],
            [0.28 * sw, -0.39], [0.2, -0.43], [0.09, -0.46], [0, -0.42]];
  }
  var TORN = [[-0.36, 0.62], [-0.37, 0.2], [-0.35, -0.04], [-0.31, -0.2], [-0.28, -0.34], [-0.2, -0.4], [-0.11, -0.46],
              [-0.05, -0.42], [0, -0.5], [0.05, -0.43], [0.12, -0.46], [0.2, -0.41], [0.29, -0.36], [0.31, -0.22],
              [0.36, -0.04], [0.37, 0.2], [0.36, 0.62]];
  function mirror(pts) { return pts.map(function (p) { return [-p[0], p[1]]; }); }

  // ---------- behind the body ----------
  C.back = function (ops, S) {
    if (S.style === 'wavy') {
      var side = [[0.15, -0.84], [0.2, -0.7], [0.235, -0.55], [0.25, -0.42], [0.19, -0.4], [0.15, -0.5], [0.13, -0.7]];
      F(ops, smooth(side), S.hairS, { dx: 0.03 });
      F(ops, smooth(mirror(side)), S.hairS, { dx: 0.03 });
    }
    if (S.style === 'matted') {
      F(ops, smooth([[-0.16, -0.85], [-0.2, -0.66], [-0.17, -0.5], [-0.1, -0.56], [0, -0.5], [0.1, -0.56], [0.17, -0.5],
                     [0.2, -0.66], [0.16, -0.85], [0, -1.0]]), S.hairS, { dx: 0.03 });
    }
  };

  // ---------- body ----------
  C.torso = function (ops, S) {
    var t = S.top, col = S.topC, sh = S.topS;
    if (t === 'torn') { F(ops, poly(TORN), col, { s: sh, dx: 0.04 }); return; }
    F(ops, smooth(torsoPts(S.sw || 1)), col, { s: sh, dx: 0.045 });
    if (t === 'hoodie') F(ops, smooth([[-0.17, -0.43], [-0.11, -0.52], [0, -0.55], [0.11, -0.52], [0.17, -0.43], [0, -0.4]]), sh, { dx: 0.02 });
  };
  // Drawn after the neck: the neckline, collars, zip, strap, lapels, buttons.
  C.front = function (ops, S) {
    var t = S.top, sh = S.topS;
    if (t === 'hoodie') {
      F(ops, poly([[-0.095, -0.47], [0.095, -0.47], [0, -0.2]]), S.tee, DET);                    // dark tee in the hood's V
      L(ops, seg([[0, -0.2], [0, 0.62]]), '#C9CED8', 0.011);                                     // zip
      L(ops, seg([[-0.29, -0.36], [-0.32, -0.1], [-0.33, 0.25]]), sh, 0.016);                    // sleeve seams
      L(ops, seg([[0.29, -0.36], [0.32, -0.1], [0.33, 0.25]]), sh, 0.016);
      L(ops, seg([[-0.2, 0.0], [-0.13, 0.14], [-0.17, 0.28]]), sh, 0.012);                        // cloth folds
      L(ops, seg([[0.2, 0.1], [0.14, 0.24], [0.2, 0.4]]), sh, 0.012);
      F(ops, poly([[-0.27, -0.44], [-0.15, -0.47], [0.22, 0.62], [0.1, 0.62]]), S.strap, DET);   // backpack strap
      L(ops, seg([[-0.25, -0.4], [-0.1, -0.44]]), '#4A5068', 0.01);
    }
    if (t === 'cardigan') {
      F(ops, poly([[-0.1, -0.47], [0.1, -0.47], [0, -0.1]]), S.blouse, DET);
      L(ops, seg([[-0.1, -0.47], [-0.045, -0.25], [0, -0.1]]), sh, K.LWD);
      L(ops, seg([[0.1, -0.47], [0.045, -0.25], [0, -0.1]]), sh, K.LWD);
      L(ops, seg([[0, -0.1], [0, 0.62]]), sh, K.LWD);
      [0.1, 0.32, 0.54].forEach(function (y) { F(ops, ell(0, y, 0.014, 0.014), '#1B2B2A', { ink: 0, halo: false }); });
    }
    if (t === 'shirt') {
      F(ops, poly([[-0.095, -0.47], [-0.02, -0.36], [-0.13, -0.37]]), PAPER_BTN, DET);
      F(ops, poly([[0.095, -0.47], [0.02, -0.36], [0.13, -0.37]]), PAPER_BTN, DET);
      F(ops, poly([[-0.03, -0.42], [0.03, -0.42], [0.045, -0.2], [0, -0.14], [-0.045, -0.2]]), S.tie, DET);
    }
    if (t === 'chef') {
      F(ops, poly([[-0.1, -0.47], [0, -0.35], [0.1, -0.47]]), sh, DET);
      L(ops, seg([[0, -0.35], [0, 0.62]]), sh, K.LWD);
      [[-0.07, -0.2], [0.07, -0.2], [-0.07, 0.1], [0.07, 0.1]].forEach(function (p) { F(ops, ell(p[0], p[1], 0.014, 0.014), S.buttons, { ink: 0, halo: false }); });
    }
    if (t === 'jacket') {
      if (S.under) F(ops, poly([[-0.1, -0.47], [0.1, -0.47], [0, -0.14]]), S.under, DET);
      L(ops, seg([[-0.1, -0.47], [-0.05, -0.27], [-0.02, -0.14]]), sh, K.LWD);
      L(ops, seg([[0.1, -0.47], [0.05, -0.27], [0.02, -0.14]]), sh, K.LWD);
      L(ops, seg([[0, -0.14], [0, 0.62]]), '#2A2F1A', 0.011);
    }
    if (t === 'apron') {
      F(ops, poly([[-0.095, -0.47], [0, -0.35], [0.095, -0.47]]), PAPER_BTN, DET);
      F(ops, rct(-0.2, -0.3, 0.4, 0.92), S.apron, DET);
      L(ops, seg([[-0.13, -0.44], [-0.2, -0.3]]), S.apron, 0.02);
      L(ops, seg([[0.13, -0.44], [0.2, -0.3]]), S.apron, 0.02);
    }
    if (t === 'suit') {
      F(ops, poly([[-0.095, -0.47], [0, -0.22], [0.095, -0.47]]), S.shirt, DET);
      F(ops, poly([[-0.1, -0.47], [-0.03, -0.22], [-0.2, -0.3]]), sh, DET);
      F(ops, poly([[0.1, -0.47], [0.03, -0.22], [0.2, -0.3]]), sh, DET);
      F(ops, poly([[-0.025, -0.44], [0.025, -0.44], [0.035, -0.26], [0, -0.2], [-0.035, -0.26]]), S.tie, DET);
    }
    if (t === 'torn') {
      F(ops, poly([[0.14, 0.02], [0.22, 0.0], [0.2, 0.1], [0.13, 0.11]]), '#2B3640', DET);
      F(ops, poly([[-0.24, 0.3], [-0.18, 0.28], [-0.2, 0.4]]), '#2B3640', DET);
    }
  };

  // ---------- hair (cap over the skull) ----------
  C.hair = function (ops, S) {
    var st = S.style, c = S.hair, hi = S.hairHi || S.hair, cap;
    if (st === 'quiff') {
      // Short back and sides, a swept quiff rising off the front (top held at the crown line, y = -1).
      cap = [[-0.155, -0.8], [-0.15, -0.9], [-0.1, -0.95], [0, -0.97], [0.1, -0.95], [0.15, -0.9], [0.155, -0.8],
             [0.12, -0.84], [0.06, -0.87], [0, -0.885], [-0.07, -0.87], [-0.12, -0.84]];
      F(ops, smooth(cap), c, { dx: 0.03 });
      F(ops, smooth([[-0.04, -0.9], [0, -0.96], [0.05, -0.995], [0.12, -1.0], [0.17, -0.96], [0.16, -0.9], [0.1, -0.9], [0.04, -0.89]]), c, { dx: 0.03 });
      L(ops, seg([[-0.06, -0.93], [0, -0.97], [0.08, -0.975]]), hi, K.LWD * 1.5);
      L(ops, seg([[-0.1, -0.88], [-0.06, -0.89]]), S.hairS, K.LWD);
    } else if (st === 'side') {
      // Side part with a swept fringe; grey temples so it does not read as a cap.
      F(ops, smooth([[-0.15, -0.78], [-0.155, -0.9], [-0.1, -0.97], [0.0, -0.99], [0.1, -0.97], [0.15, -0.9], [0.15, -0.78],
                     [0.12, -0.85], [0.06, -0.87], [0.0, -0.84], [-0.06, -0.88], [-0.12, -0.84]]), c, { dx: 0.03 });
      L(ops, seg([[-0.035, -0.99], [-0.02, -0.94], [0.0, -0.9]]), S.hairS, K.LWD);
      L(ops, seg([[0.02, -0.955], [0.07, -0.93], [0.1, -0.9]]), hi, K.LWD);
      if (S.grey) {
        F(ops, smooth([[-0.15, -0.8], [-0.152, -0.86], [-0.12, -0.885], [-0.1, -0.84]]), S.grey, { dx: 0.01, ink: K.LWD });
        F(ops, smooth([[0.15, -0.8], [0.152, -0.86], [0.12, -0.885], [0.1, -0.84]]), S.grey, { dx: 0.01, ink: K.LWD });
      }
    } else if (st === 'wavy') {
      F(ops, smooth([[-0.16, -0.8], [-0.16, -0.93], [-0.1, -1.0], [0, -1.0], [0.1, -0.99], [0.16, -0.92], [0.165, -0.8],
                     [0.12, -0.85], [0.05, -0.9], [-0.04, -0.9], [-0.12, -0.85]]), c, { dx: 0.03 });
      L(ops, seg([[-0.09, -0.95], [-0.04, -0.975], [0.02, -0.96]]), S.grey || hi, K.LWD);
      L(ops, seg([[0.05, -0.95], [0.1, -0.93]]), S.grey || hi, K.LWD);
    } else if (st === 'bald') {
      var fringe = [[0.15, -0.78], [0.165, -0.86], [0.13, -0.9], [0.1, -0.88], [0.12, -0.8]];
      F(ops, smooth(fringe), c, { dx: 0.02 });
      F(ops, smooth(mirror(fringe)), c, { dx: 0.02 });
    } else if (st === 'buzz') {
      F(ops, smooth([[-0.14, -0.8], [-0.15, -0.9], [-0.1, -0.95], [0, -0.97], [0.1, -0.95], [0.15, -0.9], [0.14, -0.8],
                     [0.1, -0.84], [0, -0.86], [-0.1, -0.84]]), c, { dx: 0.02 });
    } else if (st === 'beanie') {
      F(ops, smooth([[-0.17, -0.8], [-0.175, -0.92], [-0.11, -1.0], [0, -1.0], [0.11, -1.0], [0.175, -0.92], [0.17, -0.8], [0, -0.83]]), S.beanie, { dx: 0.03 });
      F(ops, smooth([[-0.17, -0.84], [0, -0.87], [0.17, -0.84], [0.165, -0.78], [0, -0.81], [-0.165, -0.78]]), S.beanieS, { dx: 0.02, ink: K.LWD });
    } else if (st === 'matted') {
      F(ops, smooth([[-0.15, -0.8], [-0.16, -0.92], [-0.08, -0.99], [0.02, -0.98], [0.11, -0.95], [0.15, -0.86], [0.15, -0.8],
                     [0.05, -0.84], [-0.05, -0.84], [-0.12, -0.82]]), c, { dx: 0.03 });
      L(ops, seg([[-0.1, -0.9], [-0.05, -0.94], [0.03, -0.93]]), hi, K.LWD);
      L(ops, seg([[0.06, -0.92], [0.11, -0.88]]), hi, K.LWD);
    }
  };

  // ---------- facial hair ----------
  C.facial = function (ops, S) {
    if (S.beard) F(ops, smooth([[-0.14, -0.76], [-0.13, -0.68], [-0.08, -0.6], [0, -0.585], [0.08, -0.6], [0.13, -0.68], [0.14, -0.76],
                               [0.1, -0.7], [0.05, -0.66], [0, -0.655], [-0.05, -0.66], [-0.1, -0.7]]), S.beard, { ink: K.LWD * 0.8, halo: false, dx: 0.02 });
    if (S.moustache) {
      F(ops, smooth([[-0.07, -0.7], [-0.03, -0.725], [0, -0.715], [0.03, -0.725], [0.07, -0.7], [0.03, -0.69], [0, -0.695], [-0.03, -0.69]]),
        S.moustache, DET);
      if (S.big) [-1, 1].forEach(function (s) { F(ops, ell(s * 0.08, -0.71, 0.02, 0.014), S.moustache, DET); });
    }
  };

  // ---------- over the face: headwear, glasses, earbuds, earrings ----------
  C.over = function (ops, S) {
    if (S.cap) {
      F(ops, smooth([[-0.16, -0.84], [-0.165, -0.94], [-0.08, -1.0], [0.08, -1.0], [0.165, -0.94], [0.16, -0.84], [0, -0.86]]), S.cap, { dx: 0.03 });
      F(ops, smooth([[0.1, -0.86], [0.24, -0.85], [0.31, -0.8], [0.18, -0.8], [0.1, -0.82]]), S.capS, { dx: 0.02 });
    }
    if (S.glasses) {
      [-1, 1].forEach(function (s) { F(ops, rct(s * 0.058 - 0.03, -0.8, 0.06, 0.05), 'rgba(190,230,255,0.35)', DET); });
      L(ops, seg([[-0.028, -0.78], [0.028, -0.78]]), '#14151F', K.LWD);
    }
    if (S.buds) {
      L(ops, seg([[0.15, -0.7], [0.14, -0.6], [0.115, -0.5], [0.1, -0.43]]), '#14151F', 0.022);
      L(ops, seg([[0.15, -0.7], [0.14, -0.6], [0.115, -0.5], [0.1, -0.43]]), PAPER_BTN, 0.009);
      F(ops, ell(0.15, -0.73, 0.016, 0.024), '#FFFFFF', DET);
    }
    if (S.earring) F(ops, ell(-0.14, -0.67, 0.014, 0.014), S.earring, DET);
  };

  return C;
})();
