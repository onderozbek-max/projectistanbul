// Human and hero figure parts (workstream B, view only): body proportions, outfits, tops, hair,
// faces, hats and hand props. All drawing is unit space (see art-rig.js). Generic, no brands.
P.ArtChars = (function () {
  var C = {}, R = P.ArtRig, LW = R.LW, INK = R.INK, TAU = R.TAU;
  var PI = Math.PI;

  function ext(base, over) { var o = {}, k; for (k in base) o[k] = base[k]; for (k in over) o[k] = over[k]; return o; }
  function sh(col) { return R.shade(col, 0.8); }
  function line(c, pts, w, col) {
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col || INK; c.lineWidth = w; c.stroke();
  }
  function poly(pts) { var p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); return p; }

  // ---- body proportions (1 unit = figure height) ----
  var HUMAN = {
    hipY: -0.31, hipX: 0.068, shY: -0.53, shX: 0.135, torsoTop: 0.15, torsoBot: 0.125,
    headC: [0, -0.715], headRx: 0.19, headRy: 0.2, thigh: 0.155, shin: 0.14, legR: 0.062, shinR: 0.05,
    upper: 0.135, fore: 0.125, armR: 0.05, foreR: 0.045, handR: 0.05, shoe: 0.09, stride: 0.13, lift: 0.07
  };
  C.BODY = {
    human: HUMAN,
    hero: ext(HUMAN, { headC: [0, -0.72], headRx: 0.205, headRy: 0.212, torsoTop: 0.156 }),
    slim: ext(HUMAN, { hipX: 0.06, shX: 0.11, torsoTop: 0.12, torsoBot: 0.1, headC: [0.02, -0.72], headRx: 0.175, headRy: 0.185,
      thigh: 0.17, shin: 0.155, legR: 0.05, shinR: 0.045, upper: 0.13, fore: 0.13, armR: 0.045, foreR: 0.04, handR: 0.045, shoe: 0.085 })
  };
  C.body = function (name) { return C.BODY[name] || HUMAN; };

  // ---- outfits: top kinds, colours, hair, hat, hand prop, back item, accessories ----
  // base = torso/arm colour when it differs from col; c2 = secondary (vest, apron, stripes, skirt).
  var OUT = {
    waiter: { top: 'vest', col: '#F4F1EA', c2: '#1E1E24', pants: '#2B2E3A', shoe: '#1A1A1E', hair: 'short', hc: '#2A1E16', acc: ['bowtie'], prop: 'tray', propC: '#C9CED6', propHand: 'L' },
    tourist: { top: 'tee', col: '#F2C14E', c2: '#3D8BFF', pants: '#8B7355', shorts: true, shoe: '#EDEDED', sleeve: 'short', hair: 'short', hc: '#6B4A2E', hat: 'straw', hatC: '#E8D7A8', prop: 'selfie', propC: '#1E1E24', propHand: 'R', back: 'backpack', bc: '#3D8BFF' },
    shopper: { top: 'cardigan', col: '#8E5BA8', c2: '#E9D9F0', pants: '#3A3F4C', shoe: '#6B4A2E', hair: 'bun', hc: '#3B2A1E', prop: 'bag', propC: '#E9E4D8', propHand: 'R' },
    student: { top: 'hoodie', col: '#4F7A4A', pants: '#2B3346', shoe: '#F4F1EA', hair: 'short', hc: '#1E1712', back: 'backpack', bc: '#3D6E9E' },
    musician: { top: 'jacket', col: '#2F3A4A', c2: '#B5651D', pants: '#1E1E24', shoe: '#1A1A1E', hair: 'long', hc: '#1E1712', hat: 'beret', hatC: '#7A1F2B', prop: 'case', propC: '#7A4A2A', propHand: 'L' },
    barista: { top: 'apron', col: '#E2D6C0', c2: '#2F5B4A', pants: '#2B2E3A', shoe: '#1A1A1E', hair: 'short', hc: '#3B2A1E', prop: 'mug', propC: '#F4F1EA', propHand: 'R' },
    fisher: { top: 'vest', col: '#C9A13B', c2: '#6B7A4A', pants: '#5A4A36', shoe: '#4A3A2A', hair: 'short', hc: '#6B4A2E', hat: 'bucket', hatC: '#8A7A4A', prop: 'rod', propC: '#8A5A34', propHand: 'R' },
    worker: { top: 'hivis', col: '#E8A33B', c2: '#C9CED6', pants: '#4A4F57', shoe: '#2A2A2A', hair: 'short', hc: '#2A1E16', hat: 'hardhat', hatC: '#F2D54B' },
    commuter: { top: 'suit', col: '#3B4048', base: '#E8E8E8', c2: '#7A2E2E', pants: '#3B4048', shoe: '#2A2A2A', hair: 'short', hc: '#1E1712', prop: 'briefcase', propC: '#6B4A2E', propHand: 'L' },
    vendor: { top: 'shirt', col: '#F4F1EA', pants: '#2F3A4A', shoe: '#2A2A2A', hair: 'short', hc: '#3B2A1E', hat: 'tray', hatC: '#9C6B3A' },
    hamal: { top: 'tank', col: '#A8475F', pants: '#4A4035', shoe: '#2A2A2A', hair: 'short', hc: '#2A1E16', back: 'frame', bc: '#8A5A34', sleeve: 'none' },
    conductor: { top: 'vest', col: '#E9E4D8', c2: '#5E2A3A', pants: '#2B2E3A', shoe: '#1A1A1E', hair: 'short', hc: '#2A1E16', hat: 'cap', hatC: '#5E2A3A', acc: ['pouch'] },
    shopkeeper: { top: 'apron', col: '#E9E4D8', c2: '#2F5B8A', pants: '#3E3A35', shoe: '#2A2A2A', hair: 'bald', hc: '#8A8F98', acc: ['moustache', 'glasses'] },
    pigeonman: { top: 'coat', col: '#6B5B45', pants: '#3E3A35', shoe: '#2A2A2A', hair: 'short', hc: '#8A8F98', hat: 'cap', hatC: '#5E5040', acc: ['moustache'], prop: 'sack', propC: '#D9C9A8', propHand: 'L' },
    driver: { top: 'jacket', col: '#5E3A23', c2: '#3A2A1E', pants: '#2B3346', shoe: '#2A2A2A', hair: 'short', hc: '#1E1712', hat: 'cap', hatC: '#2A2A2A' },
    granny: { top: 'dress', col: '#B9A7D9', c2: '#E9B3C0', pants: '#E9B3C0', shoe: '#3A2A2A', hair: 'bun', hc: '#A8A8B0', prop: 'handbag', propC: '#8A5A34', propHand: 'L', acc: ['glasses'] },
    gardener: { top: 'overall', col: '#4C6C8A', base: '#E6DCC4', pants: '#4C6C8A', shoe: '#4A3A2A', hair: 'short', hc: '#6B4A2E', hat: 'straw', hatC: '#D9B66A', prop: 'shovel', propC: '#8A8F98', propHand: 'R' },
    jogger: { top: 'tracksuit', col: '#2B2E3A', c2: '#F4F1EA', pants: '#2B2E3A', shoe: '#F4F1EA', hair: 'band', hc: '#1E1712', hatC: '#E9A23B' },
    picnicker: { top: 'gingham', col: '#5B8FA8', c2: '#F4F1EA', pants: '#E6DCC4', shoe: '#8A5A34', hair: 'bob', hc: '#6B4A2E', prop: 'basket', propC: '#C9A46A', propHand: 'L' },
    sailor: { top: 'stripe', col: '#2B4A6F', c2: '#F4F1EA', pants: '#F4F1EA', shoe: '#1A1A1E', hair: 'short', hc: '#2A1E16', hat: 'cap', hatC: '#2B4A6F' },
    neighbor: { top: 'robe', col: '#D9C9A8', c2: '#8A7E6B', pants: '#8A7E6B', shoe: '#8A5A34', hair: 'curl', hc: '#6B4A2E', prop: 'mug', propC: '#E9E4D8', propHand: 'R', acc: ['glasses'] },
    chef: { top: 'chef', col: '#F4F1EA', c2: '#2B2E3A', pants: '#2B2E3A', shoe: '#1A1A1E', hair: 'short', hc: '#2A1E16', hat: 'toque', hatC: '#F4F1EA', acc: ['moustache'] },
    hero: { top: 'hoodie', col: '#D7263D', pants: '#2B3A55', shoe: '#F4F1EA', hair: 'quiff', hc: '#2A1A12', acc: ['earbuds'] }
  };
  C.SKINS = ['waiter', 'tourist', 'shopper', 'student', 'musician', 'barista', 'fisher', 'worker', 'commuter', 'vendor', 'hamal',
    'conductor', 'shopkeeper', 'pigeonman', 'driver', 'granny', 'gardener', 'jogger', 'picnicker', 'sailor', 'neighbor', 'chef'];
  C.outfit = function (id) { return OUT[id] || OUT.shopper; };
  C.outfitIds = function () { return Object.keys(OUT); };

  // ---- torso ----
  function skirtPath(B, J, len, flare) {
    var bt = J.hipY + 0.06, bx = J.bcx, bw = B.torsoBot;
    return poly([[bx - bw, bt - 0.02], [bx + bw, bt - 0.02], [bx + bw * flare, bt + len], [bx - bw * flare, bt + len]]);
  }
  function collar(c, J, col) { var s = J.sx, t = J.shY; line(c, [[s - 0.05, t + 0.01], [s, t + 0.06], [s + 0.05, t + 0.01]], 0.014, col); }
  function buttons(c, x, y0, y1, n, col) {
    for (var i = 0; i < n; i++) { var y = y0 + (y1 - y0) * i / Math.max(1, n - 1); R.paint(c, R.ell(x, y, 0.016, 0.016), col || '#F4F1EA', null, 0.008); }
  }
  // Stripes or gingham clipped to the torso.
  function patterned(c, rc, J, kind, col, pathFn) {
    var p = R.torsoPath(rc, J);
    c.save(); c.clip(p); c.fillStyle = col; c.globalAlpha = 0.85;
    var x, y;
    if (kind === 'stripe') for (y = -1.0; y < 0.1; y += 0.085) c.fillRect(-0.5, y, 1.0, 0.04);
    else if (kind === 'gingham') {
      for (x = -0.4; x < 0.4; x += 0.1) c.fillRect(x, -1.0, 0.04, 1.0);
      for (y = -0.9; y < 0.1; y += 0.1) c.fillRect(-0.5, y, 1.0, 0.04);
    } else for (x = -0.3; x < 0.3; x += 0.1) for (y = -0.45; y < 0.1; y += 0.11) { c.beginPath(); c.arc(x + ((y * 10) % 1) * 0.03, y, 0.018, 0, TAU); c.fill(); }
    c.globalAlpha = 1; c.restore();
    if (pathFn) pathFn();
  }
  var TOPS = {
    shirt: function (c, rc, J, O, L) { R.paint(c, R.torsoPath(rc, J), L.shirt, L.shirtS); collar(c, J, L.shirtS); },
    tee: function (c, rc, J, O, L) {
      R.paint(c, R.torsoPath(rc, J), L.shirt, L.shirtS);
      line(c, [[J.sx - 0.06, J.shY + 0.005], [J.sx, J.shY + 0.05], [J.sx + 0.06, J.shY + 0.005]], 0.013, L.shirtS);
    },
    hoodie: function (c, rc, J, O, L) {
      R.paint(c, R.torsoPath(rc, J), L.shirt, L.shirtS);
      R.paint(c, R.rrect(J.sx - 0.09, J.hipY - 0.12, 0.18, 0.1, 0.03), L.shirtS, null, 0.012);
      line(c, [[J.sx - 0.035, J.shY + 0.05], [J.sx - 0.035, J.shY + 0.17]], 0.012, '#F4F1EA');
      line(c, [[J.sx + 0.035, J.shY + 0.05], [J.sx + 0.035, J.shY + 0.17]], 0.012, '#F4F1EA');
    },
    jacket: function (c, rc, J, O, L) {
      R.paint(c, R.torsoPath(rc, J), L.shirt, L.shirtS);
      line(c, [[J.sx, J.shY + 0.02], [J.sx, J.hipY + 0.05]], 0.012, L.shirtS);
      line(c, [[J.sx - 0.13, J.shY + 0.02], [J.sx - 0.03, J.shY + 0.16], [J.sx - 0.03, J.shY + 0.02]], 0.014, INK);
      line(c, [[J.sx + 0.13, J.shY + 0.02], [J.sx + 0.03, J.shY + 0.16], [J.sx + 0.03, J.shY + 0.02]], 0.014, INK);
    },
    cardigan: function (c, rc, J, O, L) {
      R.paint(c, R.torsoPath(rc, J), L.shirt, L.shirtS);
      line(c, [[J.sx, J.shY + 0.03], [J.sx, J.hipY + 0.05]], 0.01, L.shirtS);
      buttons(c, J.sx, J.shY + 0.12, J.hipY - 0.02, 4, O.c2);
    },
    vest: function (c, rc, J, O, L) {
      R.paint(c, R.torsoPath(rc, J), L.shirt, L.shirtS);
      var vp = R.rrect(J.sx - rc.B.torsoTop + 0.035, J.shY + 0.05, 2 * rc.B.torsoTop - 0.07, J.hipY - J.shY - 0.02, 0.04);
      R.paint(c, vp, O.c2, sh(O.c2), 0.012);
    },
    apron: function (c, rc, J, O, L) {
      R.paint(c, R.torsoPath(rc, J), L.shirt, L.shirtS); collar(c, J, L.shirtS);
      R.paint(c, R.rrect(J.bcx - 0.1, J.shY + 0.16, 0.2, J.hipY - J.shY + 0.14, 0.03), O.c2, sh(O.c2), 0.012);
      line(c, [[J.bcx - 0.1, J.shY + 0.2], [J.sx - 0.05, J.shY + 0.02]], 0.01, O.c2);
      line(c, [[J.bcx + 0.1, J.shY + 0.2], [J.sx + 0.05, J.shY + 0.02]], 0.01, O.c2);
    },
    overall: function (c, rc, J, O, L) {
      R.paint(c, R.torsoPath(rc, J), L.shirt, L.shirtS);
      R.paint(c, R.rrect(J.bcx - 0.11, J.shY + 0.1, 0.22, J.hipY - J.shY - 0.06, 0.03), O.col, sh(O.col), 0.012);
      line(c, [[J.bcx - 0.07, J.shY + 0.1], [J.sx - 0.09, J.shY - 0.02]], 0.02, O.col);
      line(c, [[J.bcx + 0.07, J.shY + 0.1], [J.sx + 0.09, J.shY - 0.02]], 0.02, O.col);
    },
    dress: function (c, rc, J, O, L) {
      R.paint(c, skirtPath(rc.B, J, 0.2, 1.45), O.c2, sh(O.c2), LW);
      R.paint(c, R.torsoPath(rc, J), L.shirt, L.shirtS); collar(c, J, L.shirtS);
    },
    coat: function (c, rc, J, O, L) {
      R.paint(c, R.union([R.torsoPath(rc, J), skirtPath(rc.B, J, 0.2, 1.1)]), L.shirt, L.shirtS);
      line(c, [[J.sx - 0.1, J.shY + 0.02], [J.sx, J.shY + 0.16], [J.sx + 0.1, J.shY + 0.02]], 0.014, L.shirtS);
      buttons(c, J.sx, J.shY + 0.2, J.hipY + 0.02, 3, '#2B2B2B');
    },
    hivis: function (c, rc, J, O, L) {
      R.paint(c, R.torsoPath(rc, J), O.c2, sh(O.c2));
      R.paint(c, R.rrect(J.sx - rc.B.torsoTop + 0.02, J.shY + 0.08, 2 * rc.B.torsoTop - 0.04, J.hipY - J.shY - 0.1, 0.03), L.shirt, L.shirtS, 0.012);
      line(c, [[J.sx - 0.15, J.hipY - 0.08], [J.sx + 0.15, J.hipY - 0.08]], 0.02, '#C9CED6');
      line(c, [[J.sx - 0.15, J.shY + 0.22], [J.sx + 0.15, J.shY + 0.22]], 0.02, '#C9CED6');
    },
    tank: function (c, rc, J, O, L) { R.paint(c, R.torsoPath(rc, J), L.shirt, L.shirtS); },
    tracksuit: function (c, rc, J, O, L) {
      R.paint(c, R.torsoPath(rc, J), L.shirt, L.shirtS);
      line(c, [[J.sx - 0.1, J.shY + 0.02], [J.sx - 0.09, J.hipY]], 0.016, O.c2);
      line(c, [[J.sx + 0.1, J.shY + 0.02], [J.sx + 0.09, J.hipY]], 0.016, O.c2);
      line(c, [[J.sx, J.shY + 0.02], [J.sx, J.hipY + 0.05]], 0.01, INK);
    },
    robe: function (c, rc, J, O, L) {
      R.paint(c, R.torsoPath(rc, J), L.shirt, L.shirtS);
      line(c, [[J.sx - 0.13, J.shY + 0.02], [J.sx, J.shY + 0.2], [J.sx + 0.13, J.shY + 0.02]], 0.02, O.c2);
      R.paint(c, R.rrect(J.bcx - 0.14, J.hipY - 0.04, 0.28, 0.035, 0.012), O.c2, sh(O.c2), 0.01);
    },
    chef: function (c, rc, J, O, L) {
      R.paint(c, R.torsoPath(rc, J), L.shirt, L.shirtS);
      line(c, [[J.sx, J.shY + 0.1], [J.sx, J.hipY + 0.05]], 0.01, L.shirtS);
      buttons(c, J.sx - 0.06, J.shY + 0.1, J.hipY - 0.02, 3, '#2B2B2B'); buttons(c, J.sx + 0.06, J.shY + 0.1, J.hipY - 0.02, 3, '#2B2B2B');
    },
    suit: function (c, rc, J, O, L) {
      R.paint(c, R.torsoPath(rc, J), L.shirt, L.shirtS);
      R.paint(c, poly([[J.sx - 0.05, J.shY], [J.sx + 0.05, J.shY], [J.sx, J.shY + 0.2]]), O.base || '#E8E8E8', null, 0.01);
      R.paint(c, poly([[J.sx - 0.03, J.shY + 0.04], [J.sx + 0.03, J.shY + 0.04], [J.sx + 0.02, J.shY + 0.3], [J.sx, J.shY + 0.34], [J.sx - 0.02, J.shY + 0.3]]), O.c2, sh(O.c2), 0.01);
    },
    stripe: function (c, rc, J, O, L) { R.paint(c, R.torsoPath(rc, J), L.shirt, L.shirtS); patterned(c, rc, J, 'stripe', O.c2); collar(c, J, O.c2); },
    gingham: function (c, rc, J, O, L) { R.paint(c, R.torsoPath(rc, J), L.shirt, L.shirtS); patterned(c, rc, J, 'gingham', O.c2); }
  };
  C.drawTop = function (c, rc, J) {
    var O = rc.outfit, L = rc.look, fn = TOPS[O.top] || TOPS.shirt;
    fn(c, rc, J, O, L);
    if (O.acc && O.acc.indexOf('bowtie') >= 0) { R.paint(c, poly([[J.sx - 0.05, J.shY + 0.05], [J.sx, J.shY + 0.08], [J.sx - 0.05, J.shY + 0.11]]), O.c2, null, 0.01); R.paint(c, poly([[J.sx + 0.05, J.shY + 0.05], [J.sx, J.shY + 0.08], [J.sx + 0.05, J.shY + 0.11]]), O.c2, null, 0.01); }
    if (O.tie) R.paint(c, poly([[J.sx - 0.025, J.shY + 0.03], [J.sx + 0.025, J.shY + 0.03], [J.sx + 0.015, J.shY + 0.28], [J.sx, J.shY + 0.31], [J.sx - 0.015, J.shY + 0.28]]), O.tie, null, 0.01);
    if (O.acc && O.acc.indexOf('pouch') >= 0) R.paint(c, R.rrect(J.sx + rc.B.torsoBot - 0.03, J.hipY - 0.08, 0.07, 0.1, 0.02), '#3A2A1E', null, 0.01);
  };

  // Back items sit behind the torso (after the back leg, before the torso).
  C.back = function (c, rc, J) {
    var O = rc.outfit, T = rc.B.torsoTop, bc = O.bc || '#3D6E9E';
    if (O.back === 'backpack') {
      R.paint(c, R.rrect(J.sx - T - 0.04, J.shY + 0.02, 2 * T + 0.08, J.hipY - J.shY - 0.02, 0.05), bc, sh(bc), LW);
    } else if (O.back === 'frame') {
      var wood = bc, ws = sh(bc);
      R.paint(c, R.rrect(J.sx - T - 0.07, J.shY - 0.22, 0.06, J.hipY - J.shY + 0.36, 0.015), wood, ws, 0.01);
      R.paint(c, R.rrect(J.sx + T + 0.01, J.shY - 0.22, 0.06, J.hipY - J.shY + 0.36, 0.015), wood, ws, 0.01);
      R.paint(c, R.rrect(J.sx - 0.27, J.shY - 0.28, 0.54, 0.22, 0.05), '#C9A46A', sh('#C9A46A'), 0.012);
      R.paint(c, R.rrect(J.sx - 0.2, J.shY - 0.36, 0.4, 0.12, 0.05), '#B99056', sh('#B99056'), 0.012);
    }
  };

  // Hand props (only for arms that are drawn in the cached layer).
  var PROPS = {
    bag: function (c, x, y, col) { line(c, [[x - 0.04, y - 0.02], [x - 0.02, y - 0.16], [x + 0.02, y - 0.16], [x + 0.04, y - 0.02]], 0.014, INK); R.paint(c, R.rrect(x - 0.07, y - 0.02, 0.14, 0.13, 0.015), col, sh(col), 0.011); },
    briefcase: function (c, x, y, col) { R.paint(c, R.rrect(x - 0.09, y - 0.02, 0.18, 0.12, 0.02), col, sh(col), 0.011); line(c, [[x - 0.03, y - 0.02], [x - 0.03, y - 0.05], [x + 0.03, y - 0.05], [x + 0.03, y - 0.02]], 0.012, INK); },
    case: function (c, x, y, col) { R.paint(c, R.rrect(x - 0.13, y - 0.02, 0.24, 0.17, 0.02), col, sh(col), 0.011); },
    basket: function (c, x, y, col) { R.paint(c, poly([[x - 0.1, y - 0.04], [x + 0.1, y - 0.04], [x + 0.08, y + 0.1], [x - 0.08, y + 0.1]]), col, sh(col), 0.011); line(c, [[x - 0.09, y + 0.01], [x + 0.09, y + 0.01]], 0.008, sh(col)); },
    selfie: function (c, x, y, col) { line(c, [[x, y], [x + 0.15, y - 0.42]], 0.012, col); R.paint(c, R.rrect(x + 0.12, y - 0.52, 0.07, 0.11, 0.015), col, '#2A3A4A', 0.01); },
    rod: function (c, x, y, col) { line(c, [[x, y], [x - 0.3, y - 0.6]], 0.012, col); line(c, [[x - 0.3, y - 0.6], [x - 0.36, y + 0.1]], 0.004, '#5E636B'); },
    shovel: function (c, x, y, col) { line(c, [[x, y], [x + 0.1, y + 0.48]], 0.02, col); R.paint(c, R.ell(x + 0.12, y + 0.52, 0.05, 0.08, 0.2), col, sh(col), 0.01); },
    mug: function (c, x, y, col) { R.paint(c, R.rrect(x - 0.05, y - 0.03, 0.1, 0.11, 0.02), col, sh(col), 0.01); line(c, [[x + 0.05, y - 0.005], [x + 0.09, y + 0.02], [x + 0.05, y + 0.05]], 0.01, INK); },
    handbag: function (c, x, y, col) { line(c, [[x - 0.05, y - 0.02], [x, y - 0.1], [x + 0.05, y - 0.02]], 0.012, INK); R.paint(c, R.rrect(x - 0.07, y - 0.02, 0.14, 0.1, 0.03), col, sh(col), 0.011); },
    tray: function (c, x, y, col) { R.paint(c, R.rrect(x - 0.14, y - 0.03, 0.28, 0.045, 0.02), col, sh(col), 0.01); R.paint(c, R.ell(x - 0.02, y - 0.06, 0.03, 0.02), '#F2E3C6', null, 0.006); },
    sack: function (c, x, y, col) { line(c, [[x - 0.02, y - 0.02], [x, y - 0.1], [x + 0.02, y - 0.02]], 0.01, INK); R.paint(c, R.ell(x, y + 0.08, 0.08, 0.11), col, sh(col), 0.011); }
  };
  C.props = function (c, rc, J) {
    var O = rc.outfit, live = rc.live || {}, side = O.propHand === 'L' ? 'L' : 'R';
    if (!O.prop || live[side === 'L' ? 'back' : 'front']) return;
    var w = J[side + 'W'], fn = PROPS[O.prop];
    if (fn) fn(c, w[0], w[1], O.propC || '#C9A46A');
  };

  // ---- head ----
  function capPath(hd, rx, ry, fr) {
    var x = hd[0], y = hd[1], Rx = rx * 1.04, Ry = ry * 1.05, p = new Path2D();
    p.moveTo(x - Rx, y + 0.02);
    p.ellipse(x, y + 0.01, Rx, Ry, 0, PI, 2 * PI);
    p.bezierCurveTo(x + Rx * 0.9, y - 0.04 + fr, x + 0.04, y - 0.06 + fr, x - 0.03, y - 0.08 + fr);
    p.bezierCurveTo(x - Rx * 0.6, y - 0.09 + fr, x - Rx * 0.9, y - 0.03, x - Rx, y + 0.02);
    p.closePath(); return p;
  }
  C.headBack = function (c, rc, J) {
    var B = rc.B, hd = J.hd, st = rc.hairStyle;
    if (st === 'long' || st === 'bob') R.paint(c, R.ell(hd[0], hd[1] + 0.1, B.headRx * 1.1, B.headRy * (st === 'long' ? 1.25 : 1.02)), rc.look.hair, rc.look.hairS, LW);
  };
  C.face = function (c, rc, J) {
    var B = rc.B, hd = J.hd, F = rc.face || {}, x = hd[0], y = hd[1], ex = 0.075, ey = y + 0.005;
    if (rc.back) return;
    R.paint(c, R.ell(x - B.headRx, y + 0.02, 0.035, 0.05), rc.look.skin, rc.look.skinS, 0.012);
    R.paint(c, R.ell(x + B.headRx, y + 0.02, 0.035, 0.05), rc.look.skin, rc.look.skinS, 0.012);
    if (F.sockets) for (var s = -1; s <= 1; s += 2) R.paint(c, R.ell(x + s * ex, ey + 0.005, 0.05, 0.058), '#2A2F22', null, 0.008);
    eyes(c, rc, x, ey, ex, F);
    brows(c, x, y, ex, F);
    mouth(c, rc, x, y + 0.11, F);
    if (F.blush) { c.globalAlpha = 0.35; R.paint(c, R.ell(x - 0.12, y + 0.07, 0.035, 0.022), '#E97A72', null, 0.004); R.paint(c, R.ell(x + 0.12, y + 0.07, 0.035, 0.022), '#E97A72', null, 0.004); c.globalAlpha = 1; }
    if (rc.acc && rc.acc.indexOf('moustache') >= 0) R.paint(c, R.smooth([[x - 0.08, y + 0.08], [x, y + 0.075], [x + 0.08, y + 0.08], [x + 0.06, y + 0.1], [x, y + 0.092], [x - 0.06, y + 0.1]]), rc.look.hair, rc.look.hairS, 0.01);
    if (rc.acc && rc.acc.indexOf('glasses') >= 0) glasses(c, x, ey, ex);
    if (rc.acc && rc.acc.indexOf('earbuds') >= 0) earbuds(c, rc, J, x, y);
  };
  function eyes(c, rc, x, y, ex, F) {
    var rx = F.big ? 0.04 : 0.034, ry = F.big ? 0.05 : 0.042, iris = F.eyes || INK, i, cx;
    for (i = -1; i <= 1; i += 2) {
      cx = x + i * ex;
      if (F.glow) {
        c.shadowColor = F.glow; c.shadowBlur = 0.07 * (rc.U || 40);
        R.paint(c, R.ell(cx, y, rx * 0.9, ry * 0.9), F.glow, null, 0.008);
        c.shadowBlur = 0; c.shadowColor = 'rgba(0,0,0,0)';
        continue;
      }
      R.paint(c, R.ell(cx, y, rx, ry), '#FFFFFF', null, 0.012);
      R.paint(c, R.ell(cx + 0.004, y + 0.004, rx * 0.62, ry * 0.7), iris, null, 0.006);
      R.paint(c, R.ell(cx - rx * 0.25, y - ry * 0.3, rx * 0.25, rx * 0.25), '#FFFFFF', null, 0.004);
    }
  }
  function brows(c, x, y, ex, F) {
    var b = F.brow || 'neutral', i, cx, yy = y - 0.075;
    for (i = -1; i <= 1; i += 2) {
      cx = x + i * ex;
      if (b === 'angry') line(c, [[cx - i * 0.03, yy - 0.02], [cx + i * 0.03, yy + 0.015]], 0.022);
      else if (b === 'worried') line(c, [[cx - i * 0.03, yy + 0.015], [cx + i * 0.03, yy - 0.02]], 0.02);
      else if (b === 'focus') line(c, [[cx - 0.03, yy + (i < 0 ? 0.005 : -0.005)], [cx + 0.03, yy + (i < 0 ? -0.01 : 0.01)]], 0.024);
      else line(c, [[cx - 0.03, yy], [cx + 0.03, yy - 0.012]], 0.02);
    }
  }
  function mouth(c, rc, x, y, F) {
    var m = F.mouth || 'smile';
    if (m === 'open' || m === 'scream') R.paint(c, R.ell(x, y + 0.01, m === 'scream' ? 0.03 : 0.045, m === 'scream' ? 0.045 : 0.035), '#3A1418', null, 0.01);
    else if (m === 'jaw') {
      R.paint(c, R.ell(x, y + 0.02, 0.055, 0.04), '#2A1216', null, 0.01);
      R.paint(c, R.rrect(x - 0.045, y - 0.005, 0.09, 0.02, 0.005), '#E8E4CC', null, 0.005);
    }
    else if (m === 'flat') line(c, [[x - 0.04, y], [x + 0.04, y]], 0.018);
    else if (m === 'frown') line(c, [[x - 0.045, y + 0.02], [x, y - 0.012], [x + 0.045, y + 0.02]], 0.02);
    else line(c, [[x - 0.05, y - 0.01], [x, y + 0.035], [x + 0.05, y - 0.01]], 0.02);
  }
  function glasses(c, x, y, ex) {
    var i, cx;
    for (i = -1; i <= 1; i += 2) { cx = x + i * ex; c.beginPath(); c.arc(cx, y, 0.05, 0, TAU); c.strokeStyle = INK; c.lineWidth = 0.014; c.stroke(); }
    line(c, [[x - ex + 0.05, y], [x + ex - 0.05, y]], 0.012);
  }
  function earbuds(c, rc, J, x, y) {
    var cord = [[x + rc.B.headRx * 0.9, y + 0.02], [x + 0.2, y + 0.22], [J.sx + 0.16, J.shY + 0.14], [J.sx + 0.14, J.shY + 0.3]];
    line(c, cord, 0.024, INK); line(c, cord, 0.01, '#F4F1EA');
    R.paint(c, R.ell(x + rc.B.headRx * 0.85, y + 0.03, 0.022, 0.026), '#F4F1EA', null, 0.006);
  }
  C.hair = function (c, rc, J) {
    var B = rc.B, hd = J.hd, st = rc.hairStyle || 'short', L = rc.look, x = hd[0], y = hd[1];
    if (rc.back) { R.paint(c, R.ell(x, y + 0.01, B.headRx * 1.03, B.headRy * 1.04), L.hair, L.hairS, LW); return; }
    if (st === 'bald') { R.paint(c, capPath(hd, B.headRx, B.headRy, -0.1), L.hair, L.hairS, 0.012); return; }
    var fr = st === 'bob' || st === 'long' ? -0.02 : -0.045;
    R.paint(c, capPath(hd, B.headRx, B.headRy, fr), L.hair, L.hairS, LW);
    if (st === 'bun') R.paint(c, R.ell(x - 0.02, y - B.headRy - 0.02, 0.085, 0.085), L.hair, L.hairS, 0.012);
    if (st === 'quiff') R.paint(c, R.smooth([[x - 0.06, y - 0.14], [x + 0.02, y - 0.3], [x + 0.14, y - 0.34], [x + 0.1, y - 0.24], [x + 0.13, y - 0.22], [x + 0.06, y - 0.12]]), L.hair, L.hairS, 0.014);
    if (st === 'curl') for (var i = -2; i <= 2; i++) R.paint(c, R.ell(x + i * 0.07, y - B.headRy * 0.95, 0.03, 0.03), '#D9C9A8', null, 0.006);
    if (st === 'band') line(c, [[x - B.headRx * 0.9, y - 0.09], [x + B.headRx * 0.9, y - 0.09]], 0.03, '#E9A23B');
  };
  C.hat = function (c, rc, J) {
    var O = rc.outfit, id = rc.hat !== undefined ? rc.hat : O.hat, B = rc.B, hd = J.hd, x = hd[0], y = hd[1], col = O.hatC || '#8A7A4A';
    if (!id) return;
    // Domes stop above the brows (fringe edge at hd.y - 0.2); brims sit on the dome edge.
    if (id === 'cap') { R.paint(c, capPath(hd, B.headRx * 1.06, B.headRy * 1.08, -0.1), col, sh(col), LW); R.paint(c, R.ell(x + 0.13, y - 0.19, 0.14, 0.035, -0.12), col, sh(col), 0.012); }
    else if (id === 'beret') R.paint(c, R.ell(x - 0.02, y - B.headRy * 0.9, 0.21, 0.08, -0.15), col, sh(col), LW);
    else if (id === 'straw') { R.paint(c, R.ell(x, y - 0.2, 0.37, 0.085), '#E8D7A8', sh('#E8D7A8'), LW); R.paint(c, capPath(hd, B.headRx, B.headRy * 1.1, -0.1), col, sh(col), 0.012); }
    else if (id === 'bucket') { R.paint(c, R.ell(x, y - 0.2, 0.3, 0.08), col, sh(col), LW); R.paint(c, capPath(hd, B.headRx * 1.02, B.headRy * 1.08, -0.1), col, sh(col), 0.012); }
    else if (id === 'hardhat') { R.paint(c, capPath(hd, B.headRx * 1.05, B.headRy * 1.1, -0.1), col, sh(col), LW); R.paint(c, R.rrect(x - 0.25, y - 0.21, 0.5, 0.05, 0.02), col, sh(col), 0.012); }
    else if (id === 'toque') { R.paint(c, R.rrect(x - 0.17, y - B.headRy - 0.27, 0.34, 0.28, 0.06), col, sh(col), LW); R.paint(c, R.rrect(x - 0.19, y - B.headRy - 0.04, 0.38, 0.07, 0.03), col, sh(col), 0.012); }
    else if (id === 'tray') { R.paint(c, R.ell(x, y - B.headRy - 0.14, 0.36, 0.07), col, sh(col), LW); for (var i = -1; i <= 1; i++) R.paint(c, R.ell(x + i * 0.12, y - B.headRy - 0.2, 0.06, 0.035), '#E9A23B', '#B5651D', 0.008); }
    else if (id === 'band') line(c, [[x - B.headRx * 0.95, y - 0.11], [x + B.headRx * 0.95, y - 0.11]], 0.03, col);
    else if (id === 'cap' || id === 'sailor') R.paint(c, R.ell(x, y - 0.1, B.headRx, B.headRy * 0.8), col, sh(col), LW);
  };
  C.heroFace = { eyes: '#1E1712', mouth: 'smile', brow: 'focus', blush: false, glow: false, big: true };
  return C;
})();
