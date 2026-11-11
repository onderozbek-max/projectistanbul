// Comic bust cast (view only): looks and costumes per character, drawn with the kit from comic-busts.js. Hair, beards and
// moustaches live in comic-busts-hair.js. Hooks called by P.ComicBusts: back (behind the body), torso, front (collars, zip,
// strap, drawn over the neck), hair, facial, over (headwear, glasses, earbuds, earrings). Unit space: see comic-busts.js.
// Character notes (who they are, why they look this way): docs/characters.md. Design rules for this file: warm saturated
// shade colours (never grey-brown), one memorable silhouette cue per character, one colour family each so a cropped
// panel still tells them apart: Arda red, Mom teal, Dad blue, Kaan navy+towel red, Mila gold, Ada ash-grey, Dede cream+navy.
P.ComicCast = (function () {
  var K = P.ComicBusts.kit, F = K.F, L = K.L, smooth = K.smooth, poly = K.poly, ell = K.ell, rct = K.rct, seg = K.seg;
  var C = {}, DET = { ink: K.LWD, halo: false }, PAPER_BTN = '#F4F1EA', INK = '#14151F', HW = K.HW;
  // Per character: skin, hair, costume colours; style (hair shape), top (costume), fw (head width), sw (shoulder width),
  // eyeK (eye size), lash (lashes), lines (laugh lines), browK (brow thickness), jw (jaw width), neckK (neck width).
  var SPEC = {
    arda: { skin: '#E3B088', skinS: '#C97F5A', hair: '#2B1A12', hairS: '#160F0A', hairHi: '#7A4A33', brow: '#2B1A12',
            eyes: '#6B3E24', style: 'quiff', top: 'hoodie', topC: '#E0323F', topS: '#A81E30', tee: '#262B3F',
            strap: '#1E2233', buds: true, fw: 1, sw: 1 },
    anne: { skin: '#EBBE9B', skinS: '#D18E6C', hair: '#5A3A2A', hairS: '#38231A', hairHi: '#93664A', grey: '#D2CBC3',
            brow: '#5A3A2A', eyes: '#6A4430', style: 'softbob', top: 'cardigan', topC: '#3F8C86', topS: '#27625E',
            blouse: '#F7EEDC', earring: '#F0B33C', lines: true, lash: true, eyeK: 1.05, fw: 0.98, sw: 0.96 },
    baba: { skin: '#C98F62', skinS: '#A86C45', hair: '#3E3E44', hairS: '#232328', hairHi: '#6A6A72', grey: '#A5ABB3',
            brow: '#34343A', browK: 1.25, eyes: '#3A2A1E', style: 'side', top: 'shirt', topC: '#9EC3DE', topS: '#76A3C4',
            tie: '#2B3346', glasses: true, moustache: '#2B2B30', lines: true, fw: 1, sw: 1.02 },
    usta: { skin: '#C28A5A', skinS: '#9C6638', hair: '#EDEDED', hairS: '#BDBDBD', brow: '#EDEDED', browK: 1.7, eyes: '#3A2A1C',
            style: 'bald', top: 'chef', topC: '#F4F1EA', topS: '#CFC9BC', buttons: '#3B3B40', moustache: '#EDEDED',
            big: true, lines: true, fw: 1.06, sw: 1.14, neckK: 1.2 },
    kaan: { skin: '#F0C9A2', skinS: '#D8946C', hair: '#E4B95C', hairS: '#B98A33', hairHi: '#F8E0A0', brow: '#B58A38', browK: 1.15,
            eyes: '#3C8DE0', style: 'crop', top: 'tee', topC: '#F4F1EA', topS: '#CFC9BC', stripe: '#1F3E6B',
            towel: '#D7263D', stud: '#F0B33C', fw: 1.1, jw: 1.1, sw: 1.3, neckK: 1.3 },
    mila: { skin: '#DBA277', skinS: '#B97A52', hair: '#1F1410', hairS: '#0E0806', hairHi: '#93563A', brow: '#2A1A12',
            eyes: '#5C7A3E', style: 'ponytail', top: 'track', topC: '#F2B632', topS: '#C4881A', under: '#262B3F', stripe: '#FFFFFF',
            scrunchie: '#D7263D', stud: '#FFD166', mole: [0.062, -0.642], lash: true, eyeK: 1.04, fw: 0.97, jw: 0.95, sw: 0.96 },
    ada: { skin: '#F1D4BE', skinS: '#D79E86', hair: '#CDC3B8', hairS: '#9C9088', hairHi: '#F1ECE4', brow: '#8A8078',
           eyes: '#5FCFC5', style: 'ada', top: 'sweat', topC: '#9AA3AD', topS: '#727C87', cord: '#F4F1EA', lash: true,
           eyeK: 1.22, fw: 0.95, jw: 0.9, sw: 0.94, neckK: 0.85 },
    dede: { skin: '#C08A66', skinS: '#9B6648', hair: '#F2F2F2', hairS: '#BEBEBE', brow: '#F2F2F2', browK: 1.9, eyes: '#2F3A44',
            style: 'tufts', cap: '#2F4358', capS: '#1F2E3E', capFlat: true, top: 'knit', topC: '#E9DFC8', topS: '#C2B493',
            moustache: '#F6F6F6', big: true, lines: true, fw: 1.06, sw: 1.12, neckK: 1.15 },
    ahmet: { skin: '#CE9A70', skinS: '#A9704B', hair: '#C4C7CC', hairS: '#8D9198', hairHi: '#EDEFF2', brow: '#9EA3AB', browK: 1.4,
             eyes: '#4A3426', style: 'ring', top: 'cardigan', topC: '#8A5A34', topS: '#5E3B20', blouse: '#EDE6D6',
             moustache: '#A8ADB4', big: true, lines: true, fw: 1.05, sw: 1.04 },
    shopkeeper: { skin: '#D9A77C', skinS: '#B9724A', hair: '#8A8F98', hairS: '#66707A', brow: '#66707A', eyes: '#2A2420',
                  style: 'bald', cap: '#5E5040', capS: '#40372B', capFlat: true, top: 'apron', topC: '#E9E4D8', topS: '#CFC6B4',
                  apron: '#2F5B8A', moustache: '#3B3B40', lines: true, fw: 1.02, sw: 1.02 },
    news: { skin: '#F1C9A5', skinS: '#D4906A', hair: '#14151F', hairS: '#0A0A10', hairHi: '#4A4D66', brow: '#14151F', eyes: '#2A1E16',
            style: 'side', top: 'suit', topC: '#2B3346', topS: '#1B2030', shirt: PAPER_BTN, tie: '#7A2E2E', fw: 1, sw: 1 },
    stranger: { skin: '#A06F4B', skinS: '#7E4A2C', hair: '#2A2420', hairS: '#16120F', brow: '#2A2420', browK: 1.2, eyes: '#2A1A10',
                style: 'beanie', beanie: '#2E8B8B', beanieS: '#1F6767', beard: '#2A2420', top: 'jacket', topC: '#4F7A4A',
                topS: '#38573A', under: '#8A8F98', strap: '#8A5A34', fw: 1.02, sw: 1 },
    zombie: { skin: '#9EAB7F', skinS: '#7A8A60', hair: '#3B3B2A', hairS: '#23231A', brow: '#23231A', eyes: '#2A2F22',
              style: 'matted', top: 'torn', topC: '#5B6E7E', topS: '#44535F', zombie: true, fw: 1.02, sw: 1 }
  };
  SPEC.friend = SPEC.kaan;
  C.spec = function (who) { return SPEC[who] || SPEC.stranger; };
  C.ids = function () { return Object.keys(SPEC); };

  // Shoulders and chest. The neck covers the middle top edge; the torso runs past the base and is cropped there.
  function torsoPts(sw) {
    return [[-0.09, -0.46], [-0.2, -0.43], [-0.28 * sw, -0.39], [-0.32 * sw, -0.3], [-0.335 * sw, -0.16], [-0.34 * sw, 0.12],
            [-0.36 * sw, 0.62], [0.36 * sw, 0.62], [0.34 * sw, 0.12], [0.335 * sw, -0.16], [0.32 * sw, -0.3],
            [0.28 * sw, -0.39], [0.2, -0.43], [0.09, -0.46], [0, -0.42]];
  }
  var TORN = [[-0.36, 0.62], [-0.37, 0.2], [-0.35, -0.04], [-0.31, -0.2], [-0.28, -0.34], [-0.2, -0.4], [-0.11, -0.46],
              [-0.05, -0.42], [0, -0.5], [0.05, -0.43], [0.12, -0.46], [0.2, -0.41], [0.29, -0.36], [0.31, -0.22],
              [0.36, -0.04], [0.37, 0.2], [0.36, 0.62]];

  // ---------- behind the body ----------
  C.back = function (ops, S) { P.ComicHair.back(ops, S); };

  // ---------- body ----------
  C.torso = function (ops, S) {
    var t = S.top, col = S.topC, sh = S.topS, path;
    if (t === 'torn') { F(ops, poly(TORN), col, { s: sh, dx: 0.04 }); return; }
    path = smooth(torsoPts(S.sw || 1));
    F(ops, path, col, { s: sh, dx: 0.045 });
    if (t === 'hoodie' || t === 'sweat') F(ops, smooth([[-0.19, -0.43], [-0.12, -0.53], [0, -0.56], [0.12, -0.53], [0.19, -0.43], [0, -0.4]]), sh, { dx: 0.02 });
    if (t === 'tee') {
      ops.push({ t: 'fn', f: function (c) {
        var y;
        c.save(); c.clip(path); c.fillStyle = S.stripe;
        for (y = -0.4; y < 0.65; y += 0.15) c.fillRect(-0.5, y, 1, 0.07);
        c.restore(); c.strokeStyle = INK; c.lineWidth = K.LW; c.stroke(path);
      } });
    }
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
      [0.1, 0.32, 0.54].forEach(function (y) { F(ops, ell(0, y, 0.016, 0.016), '#1B2B2A', { ink: 0, halo: false }); });
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
    if (t === 'tee') front2(ops, S);
    if (t === 'track' || t === 'sweat' || t === 'knit') front3(ops, S);
    if (S.strap && t !== 'hoodie') {
      F(ops, poly([[-0.27, -0.44], [-0.15, -0.47], [0.22, 0.62], [0.1, 0.62]]), S.strap, DET);   // guitar strap
      L(ops, seg([[-0.21, -0.42], [0.16, 0.42]]), 'rgba(255,255,255,0.25)', 0.01);
    }
  };
  // Kaan: crew neck and the kitchen towel over the shoulder (checks drawn as two crossing stripe sets).
  function front2(ops, S) {
    L(ops, seg([[-0.11, -0.465], [0, -0.385], [0.11, -0.465]]), S.stripe, 0.024);
    F(ops, poly([[0.1, -0.46], [0.25, -0.41], [0.34, 0.1], [0.2, 0.14], [0.14, -0.12]]), S.towel, { s: '#A31C2E', dx: 0.02, ink: K.LWD * 1.3, halo: false });
    [0.0, 0.07].forEach(function (d) { L(ops, seg([[0.17 + d, -0.44 + d * 0.6], [0.26 + d, 0.0 + d * 0.5]]), 'rgba(255,255,255,0.6)', 0.012); });
    [-0.3, -0.12].forEach(function (y) { L(ops, seg([[0.15, y + 0.02], [0.3, y + 0.0]]), 'rgba(255,255,255,0.45)', 0.01); });
  }
  // Mila's track jacket, Ada's oversized hoodie strings, Dede's roll-neck and cables.
  function front3(ops, S) {
    var t = S.top, sh = S.topS;
    if (t === 'track') {
      F(ops, poly([[-0.1, -0.47], [0.1, -0.47], [0, -0.24]]), S.under, DET);
      F(ops, smooth([[-0.115, -0.47], [-0.09, -0.55], [-0.03, -0.53], [-0.02, -0.4], [-0.03, -0.3]]), S.topC, { s: sh, dx: 0.015, ink: K.LWD, halo: false });
      F(ops, smooth([[0.115, -0.47], [0.09, -0.55], [0.03, -0.53], [0.02, -0.4], [0.03, -0.3]]), S.topC, { s: sh, dx: 0.015, ink: K.LWD, halo: false });
      L(ops, seg([[0, -0.3], [0, 0.62]]), '#E9EBEF', 0.011);
      L(ops, seg([[-0.29, -0.37], [-0.31, -0.1], [-0.32, 0.25]]), S.stripe, 0.03);
      L(ops, seg([[0.29, -0.37], [0.31, -0.1], [0.32, 0.25]]), S.stripe, 0.03);
    } else if (t === 'sweat') {
      L(ops, seg([[-0.045, -0.4], [-0.05, -0.2], [-0.06, -0.08]]), S.cord, 0.016);
      L(ops, seg([[0.045, -0.4], [0.055, -0.22], [0.06, -0.1]]), S.cord, 0.016);
      [[-0.06, -0.06], [0.06, -0.08]].forEach(function (p) { F(ops, ell(p[0], p[1], 0.013, 0.013), S.cord, DET); });
      L(ops, seg([[-0.2, 0.05], [-0.13, 0.2], [-0.18, 0.34]]), sh, 0.012);
      L(ops, seg([[0.22, 0.12], [0.14, 0.26], [0.2, 0.42]]), sh, 0.012);
    } else if (t === 'knit') {
      F(ops, smooth([[-0.1, -0.6], [0.1, -0.6], [0.125, -0.47], [0, -0.42], [-0.125, -0.47]]), S.topC, { s: sh, dx: 0.015, ink: K.LW, halo: false });
      [-0.12, 0, 0.12].forEach(function (x) { L(ops, seg([[x, -0.3], [x * 1.05, 0.0], [x * 1.1, 0.62]]), sh, 0.014); });
      [-0.06, 0.06].forEach(function (x) { L(ops, seg([[x, -0.3], [x - 0.02, -0.1], [x + 0.02, 0.1], [x - 0.02, 0.3], [x, 0.5]]), sh, 0.01); });
    }
  }

  // ---------- hair and facial hair ----------
  C.hair = function (ops, S) { P.ComicHair.hair(ops, S); };
  C.facial = function (ops, S) { P.ComicHair.facial(ops, S); };

  // ---------- over the face: headwear, glasses, earbuds, earrings, scrunchie ----------
  C.over = function (ops, S) {
    var fw = S.fw || 1, k = 1.25 * fw, ex = 0.082 * fw, ear = HW * fw * 0.99;
    if (S.style === 'tufts') {
      [-1, 1].forEach(function (s) { F(ops, smooth([[s * ear * 0.95, -0.84], [s * (ear + 0.05), -0.82], [s * (ear + 0.055), -0.74], [s * ear * 0.98, -0.72], [s * ear * 0.96, -0.78]]), S.hair, { dx: 0.01, ink: K.LWD, halo: false }); });
    }
    if (S.cap) {
      F(ops, smooth([[-0.2 * fw, -0.885], [-0.215 * fw, -0.95], [-0.13 * fw, -1.005], [0.1 * fw, -1.015], [0.22 * fw, -0.98], [0.245 * fw, -0.9], [0, -0.88]]), S.cap, { s: S.capS, dx: 0.035 });
      F(ops, smooth([[0.08, -0.905], [0.24 * fw, -0.9], [0.33 * fw, -0.865], [0.18, -0.85], [0.08, -0.865]]), S.capS, { dx: 0.015 });
    }
    if (S.glasses) {
      [-1, 1].forEach(function (s) { F(ops, ell(s * ex, -0.742, 0.054, 0.05), 'rgba(190,230,255,0.28)', { ink: K.LWD * 1.4, halo: false }); });
      L(ops, seg([[-ex + 0.054, -0.745], [ex - 0.054, -0.745]]), INK, K.LWD);
      [-1, 1].forEach(function (s) { L(ops, seg([[s * (ex + 0.054), -0.75], [s * ear, -0.752]]), INK, K.LWD); });
    }
    if (S.buds) {
      L(ops, seg([[ear + 0.004, -0.73], [ear - 0.005, -0.6], [0.125, -0.5], [0.1, -0.43]]), INK, 0.022);
      L(ops, seg([[ear + 0.004, -0.73], [ear - 0.005, -0.6], [0.125, -0.5], [0.1, -0.43]]), PAPER_BTN, 0.009);
      F(ops, ell(ear + 0.004, -0.755, 0.017, 0.026), '#FFFFFF', DET);
    }
    if (S.earring) { F(ops, ell(-ear - 0.003, -0.708, 0.016, 0.016), S.earring, DET); L(ops, seg([[-ear - 0.003, -0.694], [-ear - 0.003, -0.668]]), S.earring, 0.008); }
    if (S.stud) F(ops, ell(ear + 0.003, -0.715, 0.012, 0.012), S.stud, DET);
    if (S.scrunchie) F(ops, ell(0.145 * k / 1.25 + 0.0, -0.975, 0.04, 0.03, 0), S.scrunchie, { s: '#9E1B2C', dx: 0.012, ink: K.LWD, halo: false });
  };

  return C;
})();
