// Zombie types and accents (workstream B, view only; screamer and hardhat added by workstream F).
// Walker, runner, diner, spitter, brute, bloater use the shared human rig with zombie colours (R.tint) and accents;
// crawler has its own legless layer; screamer (gaunt, open mouth) and hardhat (bulky, yellow helmet, hi-vis) use
// their own bodies. Accents read def flags (rc.mot) so sprites.js needs no change.
P.ArtEnemies = (function () {
  var E = {}, R = P.ArtRig, CH = P.ArtChars, LW = R.LW, INK = R.INK, TAU = R.TAU;
  var H = CH.BODY.human;
  function ext(base, over) { var o = {}, k; for (k in base) o[k] = base[k]; for (k in over) o[k] = over[k]; return o; }
  function gore(a) { return 'rgba(' + P.goreRGB(a || 0) + ',0.95)'; }
  function flag(rc, k) { return !!((rc.mot && rc.mot[k]) || (rc.def && rc.def[k])); }

  E.BODY = {
    brute: ext(H, { hipY: -0.36, hipX: 0.13, shY: -0.58, shX: 0.24, torsoTop: 0.29, torsoBot: 0.2, headC: [0.02, -0.8],
      headRx: 0.12, headRy: 0.13, thigh: 0.2, shin: 0.18, legR: 0.1, shinR: 0.085, upper: 0.25, fore: 0.25, armR: 0.1,
      foreR: 0.085, handR: 0.085, shoe: 0.12, stride: 0.13, lift: 0.05 }),
    bloat: ext(H, { hipY: -0.2, hipX: 0.1, shY: -0.6, shX: 0.2, torsoTop: 0.26, torsoBot: 0.26, belly: { y: -0.42, rx: 0.3, ry: 0.26 },
      headC: [0.02, -0.84], headRx: 0.15, headRy: 0.16, thigh: 0.12, shin: 0.12, legR: 0.07, shinR: 0.06, upper: 0.12, fore: 0.12,
      armR: 0.045, foreR: 0.04, handR: 0.045, shoe: 0.09, stride: 0.1, lift: 0.05 }),
    spit: ext(H, { headC: [0.06, -0.69], torsoTop: 0.14, torsoBot: 0.12 }),
    // Gaunt, long-limbed body for the screamer.
    scream: ext(H, { hipY: -0.31, hipX: 0.06, shY: -0.55, shX: 0.11, torsoTop: 0.12, torsoBot: 0.1, headC: [0.02, -0.74],
      headRx: 0.165, headRy: 0.19, thigh: 0.17, shin: 0.16, legR: 0.05, shinR: 0.045, upper: 0.15, fore: 0.14, armR: 0.042,
      foreR: 0.038, handR: 0.045, shoe: 0.085, stride: 0.16, lift: 0.08 }),
    // Heavy build for the hardhat worker.
    bulky: ext(H, { hipY: -0.3, hipX: 0.09, shY: -0.52, shX: 0.19, torsoTop: 0.19, torsoBot: 0.17, headC: [0, -0.7],
      headRx: 0.17, headRy: 0.18, thigh: 0.18, shin: 0.15, legR: 0.085, shinR: 0.07, upper: 0.15, fore: 0.14, armR: 0.07,
      foreR: 0.06, handR: 0.065, shoe: 0.11, stride: 0.12, lift: 0.05 })
  };

  // Per-type rig and motion. scale multiplies the caller's unit; crouch/hunch/lean are base pose values.
  E.DEFS = {
    walker: { body: 'human', gait: 'shamble', arms: 'zswing', scale: 1.12, limp: true, strideK: 0.8, liftK: 0.6, lean: 0.03, hunch: 0.05, sway: 0.03, eyes: '#DDF5D0', brow: 'neutral', torn: true, wounds: 1 },
    runner: { body: 'slim', gait: 'run', arms: 'pump', scale: 1.08, strideK: 1.5, liftK: 1.4, lean: 0.1, hunch: 0.06, sway: 0.02, eyes: '#FF5A3D', brow: 'angry', torn: true, wounds: 1 },
    diner: { body: 'human', gait: 'shamble', arms: 'swing', scale: 1.12, strideK: 0.9, liftK: 0.8, lean: 0.02, eyes: '#DDF5D0', brow: 'worried', bib: true, wounds: 1 },
    spitter: { body: 'spit', gait: 'shamble', arms: 'hold', scale: 1.12, strideK: 0.7, liftK: 0.6, lean: 0.08, hunch: 0.12, sway: 0.02, eyes: '#B8FF5A', brow: 'angry', throat: true, torn: true },
    brute: { body: 'brute', gait: 'stomp', arms: 'drag', scale: 1.6, strideK: 0.5, liftK: 0.35, lean: 0.06, hunch: 0.08, sway: 0.02, eyes: '#FF3B2E', brow: 'angry', torn: true, wounds: 2 },
    bloater: { body: 'bloat', gait: 'waddle', arms: 'zswing', scale: 1.2, strideK: 0.45, liftK: 0.4, sway: 0.06, eyes: '#B8FF5A', brow: 'worried', pust: true, wounds: 1 },
    screamer: { body: 'scream', gait: 'run', arms: 'panic', scale: 1.1, strideK: 1.4, liftK: 1.2, lean: 0.14, hunch: 0.02, sway: 0.03, eyes: '#FF3B2E', brow: 'worried', torn: true, wounds: 1, mouthScream: true },
    hardhat: { body: 'bulky', gait: 'stomp', arms: 'zswing', scale: 1.22, strideK: 0.6, liftK: 0.45, lean: 0.03, hunch: 0.04, sway: 0.02, eyes: '#FFD27A', brow: 'angry', torn: true, wounds: 1, helmet: true, vest: true },
    crawler: { custom: true, scale: 1.0, eyes: '#E8FF6B' },
    // D-060 boss bodies (config-bosses.js). Own body names keep their bakes apart from the crowd; bossProp picks the hand
    // props (art-bosses.js: umbrella and tour flag, brass lamp on a chain).
    tourGuide: { body: 'docent', bossProp: 'docent', gait: 'shamble', arms: 'hold', scale: 1.5, strideK: 0.6, liftK: 0.5, lean: 0.04, hunch: 0.04, sway: 0.02, eyes: '#FFD27A', brow: 'angry', torn: true, wounds: 1 },
    antiquarian: { body: 'antiquarian', bossProp: 'antiquarian', gait: 'shamble', arms: 'swing', scale: 1.5, strideK: 0.6, liftK: 0.5, lean: 0.03, hunch: 0.1, sway: 0.03, eyes: '#FFD27A', brow: 'worried', torn: true, wounds: 1 }
  };
  E.def = function (type) { return E.DEFS[type] || E.DEFS.walker; };
  E.body = function (name) { return E.BODY[name] || CH.body(name); };
  // Used when an enemy has no e.skin: map variant to the L1 crowd (keeps the L1 variety).
  E.L1 = ['waiter', 'tourist', 'shopper', 'student', 'chef', 'commuter', 'jogger', 'worker'];
  // Civilians fleeing: varied living humans.
  E.CIV = ['tourist', 'shopper', 'student', 'commuter', 'granny', 'jogger', 'picnicker', 'sailor'];
  E.CRAWL_BOX = [-0.62, 0.62, -0.52, 0.14];
  // Zombie outfits per hood (workstream F), keyed by P.Journey hood id. Six each, all in ArtChars.SKINS.
  E.hoodSkins = {
    istiklal: ['waiter', 'tourist', 'shopper', 'student', 'musician', 'barista'],
    galata: ['musician', 'tourist', 'student', 'shopper', 'teyze', 'dondurmaci'],
    karakoy: ['barista', 'fisher', 'worker', 'tourist', 'dondurmaci', 'mudur'],
    bridge: ['fisher', 'balikci', 'commuter', 'vendor', 'vapurcu', 'simitci'],
    eminonu: ['simitci', 'midyeci', 'vendor', 'hamal', 'balikci', 'shopper'],
    sirkeci: ['commuter', 'conductor', 'tourist', 'vapurcu', 'mudur', 'vendor'],
    kapalicarsi: ['shopkeeper', 'kuyumcu', 'halici', 'hamal', 'tourist', 'sahaf'],
    beyazit: ['student', 'sahaf', 'pigeonman', 'vendor', 'kapici', 'dondurmaci'],
    saray: ['conductor', 'tourist', 'vendor', 'student', 'shopper', 'granny'],
    halic: ['halici', 'shopkeeper', 'fisher', 'teyze', 'sahaf', 'barista'],
    kumkapi: ['waiter', 'faslci', 'balikci', 'midyeci', 'musician', 'kapici'],
    yenikapi: ['arkeolog', 'worker', 'commuter', 'vapurcu', 'conductor', 'driver'],
    samatya: ['granny', 'teyze', 'kapici', 'simitci', 'dondurmaci', 'balikci'],
    yedikule: ['gardener', 'worker', 'granny', 'teyze', 'derici', 'kapici'],
    zeytinburnu: ['worker', 'derici', 'shopper', 'student', 'hamal', 'driver'],
    kazlicesme: ['jogger', 'picnicker', 'fisher', 'dondurmaci', 'tourist', 'student'],
    bakirkoy: ['shopper', 'student', 'shopkeeper', 'kuyumcu', 'teyze', 'dondurmaci'],
    bakirkoysahil: ['jogger', 'picnicker', 'fisher', 'dondurmaci', 'granny', 'tourist'],
    atakoysahil: ['sailor', 'jogger', 'shopper', 'yatci', 'mudur', 'tourist'],
    atakoy: ['neighbor', 'granny', 'jogger', 'student', 'kapici', 'teyze']
  };
  E.skinsFor = function (hoodId) { return E.hoodSkins[hoodId] || E.L1; };

  // Zombie accents, drawn by the rig through rc.hook (layer 'low' after the torso, 'high' after the face).
  E.accent = function (c, rc, J, layer) {
    if (layer === 'low') lowAccent(c, rc, J); else highAccent(c, rc, J);
  };
  function lowAccent(c, rc, J) {
    if (rc.bib) bib(c, J);
    if (rc.torn) torn(c, rc, J);
    if (rc.wounds) wounds(c, rc, J);
    if (rc.pust) pustules(c, rc, J);
    if (flag(rc, 'vest')) hiVis(c, rc, J);
  }
  function bib(c, J) {
    var sx = J.sx, t = J.shY;
    R.paint(c, R.smooth([[sx - 0.09, t + 0.04], [sx + 0.09, t + 0.04], [sx + 0.1, J.hipY - 0.04], [sx - 0.1, J.hipY - 0.04]]), '#F4F1EA', '#D9D2C0', 0.01);
    c.beginPath(); c.moveTo(sx - 0.09, t + 0.05); c.lineTo(sx - 0.04, t - 0.03); c.moveTo(sx + 0.09, t + 0.05); c.lineTo(sx + 0.04, t - 0.03);
    c.strokeStyle = INK; c.lineWidth = 0.01; c.stroke();
  }
  // Torn hem: dark notches cut into the bottom edge of the torso.
  function torn(c, rc, J) {
    var B = rc.B, bt = J.hipY + 0.06, bx = J.bcx, bw = B.torsoBot, n = 5, i, x0, x1, xm;
    c.fillStyle = 'rgba(20,21,31,0.85)';
    for (i = 0; i < n; i++) {
      x0 = bx - bw + (2 * bw) * i / n; x1 = x0 + (2 * bw) / n; xm = (x0 + x1) / 2;
      c.beginPath(); c.moveTo(x0, bt + 0.005); c.lineTo(xm, bt - 0.04 - 0.02 * ((i * 3) % 2)); c.lineTo(x1, bt + 0.005); c.closePath(); c.fill();
    }
  }
  function wounds(c, rc, J) {
    var n = rc.wounds, k, x, y;
    for (k = 0; k < n; k++) {
      x = J.sx + (k ? -0.07 : 0.08); y = J.shY + 0.2 + k * 0.12;
      R.paint(c, R.ell(x, y, 0.035, 0.02, 0.5 * k + 0.3), gore(rc.gore), null, 0.007);
    }
  }
  function pustules(c, rc, J) {
    var b = rc.B.belly, k = 1 + 0.2 * (rc.swell || 0), i, px, py, glow = rc.glowGreen || '#B8FF5A';
    if (!b) return;
    for (i = 0; i < 5; i++) {
      px = J.bcx + (i - 2) * 0.12 * k + (i % 2) * 0.03; py = b.y + (J.bob || 0) + ((i * 7) % 3 - 1) * 0.08 * k;
      c.shadowColor = glow; c.shadowBlur = 0.05 * (rc.U || 40);
      R.paint(c, R.ell(px, py, 0.03, 0.03), '#C2E86A', '#8DB040', 0.006);
      c.shadowBlur = 0; c.shadowColor = 'rgba(0,0,0,0)';
    }
  }
  // Hi-vis vest over the torso with two reflective bands (hardhat).
  function hiVis(c, rc, J) {
    var w = rc.B.torsoTop, sx = J.sx, t = J.shY;
    R.paint(c, R.rrect(sx - w + 0.02, t + 0.05, 2 * w - 0.04, J.hipY - t - 0.06, 0.03), '#F28C28', '#B5561A', 0.01);
    line(c, [[sx - w, t + 0.2], [sx + w, t + 0.2]], '#D9DEE5', 0.022);
    line(c, [[sx - w, J.hipY - 0.1], [sx + w, J.hipY - 0.1]], '#D9DEE5', 0.022);
  }
  function line(c, pts, col, lw) {
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); c.lineTo(pts[1][0], pts[1][1]);
    c.strokeStyle = col; c.lineWidth = lw; c.stroke();
  }
  function highAccent(c, rc, J) {
    if (rc.back) return;
    if (rc.throat) throatSac(c, rc, J);
    if (rc.jawDrool !== false && rc.face && rc.face.mouth === 'jaw') drool(c, rc, J);
    if (flag(rc, 'mouthScream')) screamMouth(c, rc, J);
    if (flag(rc, 'helmet')) helmet(c, rc, J);
  }
  function drool(c, rc, J) {
    var x = J.hd[0] + 0.03, y = J.hd[1] + 0.12;
    R.paint(c, R.capsule(x, y, 0.012, x + 0.01, y + 0.07, 0.016), '#DDF5D0', '#B8D8A8', 0.006);
    R.paint(c, R.ell(x + 0.012, y + 0.08, 0.02, 0.024), '#DDF5D0', '#B8D8A8', 0.006);
  }
  // Screamer: a wide dark mouth with a row of teeth over the jaw.
  function screamMouth(c, rc, J) {
    var x = J.hd[0], y = J.hd[1] + 0.12;
    R.paint(c, R.ell(x, y + 0.01, 0.042, 0.06), '#2A0A0E', '#120406', 0.008);
    R.paint(c, R.rrect(x - 0.03, y - 0.03, 0.06, 0.018, 0.005), '#E8E4CC', null, 0.004);
  }
  // Hardhat: yellow dome over the head with a brim.
  function helmet(c, rc, J) {
    var B = rc.B, hd = J.hd, x = hd[0], y = hd[1], col = '#F2D54B';
    R.paint(c, R.ell(x, y - 0.1, B.headRx * 1.12, B.headRy * 0.9), col, R.shade(col, 0.8), 0.012);
    R.paint(c, R.rrect(x - 0.22, y - 0.12, 0.44, 0.04, 0.015), col, R.shade(col, 0.8), 0.01);
  }
  // Spitter throat: swells with e.windup (0..1) and drips acid.
  function throatSac(c, rc, J) {
    var w = rc.windup || 0, x = J.hd[0] + 0.09, y = J.hd[1] + 0.2;
    R.paint(c, R.ell(x, y, 0.07 + 0.06 * w, 0.075 + 0.07 * w), '#7FB35A', '#557A3A', 0.01);
    R.paint(c, R.ell(x - 0.02, y - 0.02, 0.02 + 0.02 * w, 0.02 + 0.02 * w), '#C2E86A', null, 0.004);
    c.fillStyle = '#B8FF5A';
    c.beginPath(); c.arc(x - 0.05, y + 0.1 + 0.03 * w, 0.014, 0, TAU); c.fill();
    c.beginPath(); c.arc(x + 0.04, y + 0.12 + 0.03 * w, 0.011, 0, TAU); c.fill();
  }

  // Crawler: legless, torso slumped on the ground, arms pulling. ph = walk phase. The legs kick and the arms pull in
  // opposite phase, and the torso heaves a little (amplitudes in units; were 0.03 and 0.05).
  E.crawlerDraw = function (c, rc, ph) {
    var L = rc.look, s = Math.sin(ph), h = Math.sin(ph + Math.PI / 2);
    R.paint(c, R.capsule(-0.3, -0.1, 0.07, -0.5, -0.06 + 0.1 * s, 0.05), L.pants, L.pantsS, LW);
    R.paint(c, R.capsule(-0.28, -0.13, 0.07, -0.46, -0.14 - 0.1 * s, 0.05), L.pants, L.pantsS, LW);
    R.paint(c, R.smooth([[-0.28, -0.2 - 0.02 * h], [-0.05, -0.27], [0.18, -0.24 - 0.02 * h], [0.22, -0.13], [0.1, -0.02], [-0.1, -0.04], [-0.28, -0.1]]), L.shirt, L.shirtS, LW);
    R.paint(c, R.capsule(-0.06, -0.18, 0.045, -0.12 + 0.12 * s, -0.04, 0.04), L.skin, L.skinS, LW);
    R.paint(c, R.union([R.capsule(0.12, -0.18, 0.045, 0.3, -0.1 + 0.07 * s, 0.04), R.capsule(0.3, -0.1 + 0.07 * s, 0.04, 0.42, -0.08 + 0.07 * s, 0.035)]), L.skin, L.skinS, LW);
    R.paint(c, R.ell(0.3, -0.12, 0.12, 0.11), L.skin, L.skinS, LW);
    R.paint(c, R.ell(0.26, -0.18, 0.1, 0.07, 0.2), L.hair, L.hairS, 0.012);
    c.shadowColor = rc.eyes; c.shadowBlur = 0.05 * (rc.U || 40);
    R.paint(c, R.ell(0.37, -0.15, 0.02, 0.02), rc.eyes, null, 0.005);
    c.shadowBlur = 0; c.shadowColor = 'rgba(0,0,0,0)';
  };
  return E;
})();
