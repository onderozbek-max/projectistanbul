// Enemy looks (view only, procedural art): the walker's four outfits (office, student, shopper, tourist), one designed outfit per
// other type, the type accessories (runner hood, shopper's second bag, tourist camera and sun hat, diner plate, zehirli respirator,
// parkur bandana), two extra bodies (squat for the diner, copci for the street sweeper), and the lookups sprites.js calls:
// EN.variantOf, EN.outfitFor, EN.lookKey, EN.defFor. Numbers and accents: P.CFG.enemyLook (js/config-enemy-look.js).
// Walker variants come from the enemy id by a multiplicative hash (never the sim's RNG). Behaviour skins (fisher, musician,
// hamal: sim/skins.js) keep their own outfit so their rod, note and crate still read.
// keep: the torso and legs keep their colour (sprites.js does not desaturate them), so the accent reads at phone scale.
P.ArtEnemyLook = (function () {
  var EN = P.ArtEnemies, R = P.ArtRig, CH = P.ArtChars, LK = P.CFG.enemyLook;
  if (!EN || !R || !CH || !LK) return null;
  var INK = R.INK, TAU = R.TAU, H = CH.BODY.human;
  function ext(base, over) { var o = {}, k; for (k in base) o[k] = base[k]; for (k in over) o[k] = over[k]; return o; }

  // Two bodies of their own: the diner is squat and broad, the copci is broad, hunched and short-legged.
  EN.BODY.squat = ext(H, { hipY: -0.27, hipX: 0.085, shY: -0.5, shX: 0.19, torsoTop: 0.17, torsoBot: 0.16, headC: [0.03, -0.66],
    headRx: 0.17, headRy: 0.18, thigh: 0.13, shin: 0.12, legR: 0.06, shinR: 0.05, upper: 0.13, fore: 0.12, armR: 0.05, foreR: 0.045,
    handR: 0.05, shoe: 0.09, stride: 0.1, lift: 0.06 });
  EN.BODY.copci = ext(H, { hipY: -0.3, hipX: 0.1, shY: -0.56, shX: 0.2, torsoTop: 0.2, torsoBot: 0.17, headC: [0.04, -0.74],
    headRx: 0.165, headRy: 0.175, thigh: 0.15, shin: 0.13, legR: 0.075, shinR: 0.06, upper: 0.14, fore: 0.13, armR: 0.06, foreR: 0.05,
    handR: 0.055, shoe: 0.1, stride: 0.1, lift: 0.05 });

  // Outfits. look: the id the accessory hooks read. Walker variants first, then one per type, then the five bosses.
  var NEW = {
    walk_office: { top: 'suit', col: '#1F4E79', keep: true, base: '#E9E6DE', c2: '#B5651D', pants: '#17334F', shoe: '#1A1A1E',
      hair: 'short', hc: '#2A1E16', acc: ['glasses'], tie: '#B5651D', prop: 'briefcase', propC: '#6B4A2E', propHand: 'L' },
    walk_student: { top: 'hoodie', col: '#7C8590', pants: '#2B3346', shoe: '#F4F1EA', hair: 'short', hc: '#1E1712', back: 'backpack', bc: '#E9A23B' },
    walk_shopper: { top: 'cardigan', col: '#E9E4D8', c2: '#7A5AA6', pants: '#3A3F4C', shoe: '#6B4A2E', hair: 'bun', hc: '#3B2A1E',
      prop: 'bag', propC: '#7A5AA6', propHand: 'R' },
    walk_tourist: { top: 'tee', col: '#2FA59A', keep: true, c2: '#F4EBDD', pants: '#8B7355', shoe: '#EDEDED', sleeve: 'short', hair: 'short', hc: '#6B4A2E' },
    runner: { top: 'tracksuit', col: '#6B4FA0', keep: true, c2: '#F4EBDD', pants: '#4B3778', shoe: '#F4F1EA', hair: 'short', hc: '#1E1712' },
    diner: { top: 'apron', col: '#8A5A34', keep: true, c2: '#F4EBDD', pants: '#4A4035', shoe: '#2A2A2A', hair: 'short', hc: '#2A1E16', acc: ['moustache'] },
    kurye: { top: 'jacket', col: '#E8782A', keep: true, pants: '#2B3346', shoe: '#2A2A2A', hair: 'short', hc: '#1E1712', hat: 'cap', hatC: '#F4EBDD' },
    copci: { top: 'hivis', col: '#C5D92E', keep: true, c2: '#3D4450', pants: '#4A4F57', shoe: '#2A2A2A', hair: 'short', hc: '#2A1E16', hat: 'cap', hatC: '#3D4450' },
    cayci: { top: 'vest', col: '#F4EBDD', c2: '#2FA59A', pants: '#2B2E3A', shoe: '#1A1A1E', hair: 'short', hc: '#2A1E16', acc: ['moustache'] },
    spitter: { top: 'shirt', col: '#B8A98A', pants: '#3E3A35', shoe: '#2A2A2A', hair: 'bald', hc: '#8A8F98' },
    zehirli: { top: 'overall', col: '#5E6670', keep: true, base: '#5E6670', pants: '#5E6670', shoe: '#2A2A2A', hair: 'short', hc: '#2A1E16' },
    brute: { top: 'overall', col: '#3A3F4D', keep: true, base: '#3A3F4D', pants: '#2F3440', shoe: '#1A1A1E', hair: 'short', hc: '#1E1712' },
    bloater: { top: 'shirt', col: '#C77DA0', keep: true, pants: '#3E3A35', shoe: '#2A2A2A', hair: 'short', hc: '#2A1E16' },
    screamer: { top: 'dress', col: '#EFE7DA', keep: true, c2: '#EFE7DA', pants: '#EFE7DA', shoe: '#3A2A2A', hair: 'long', hc: '#1E1712' },
    hardhat: { top: 'hivis', col: '#F2D54B', keep: true, c2: '#3D4450', pants: '#4A4F57', shoe: '#2A2A2A', hair: 'short', hc: '#2A1E16', hat: 'hardhat', hatC: '#F2D54B' },
    kasap: { top: 'apron', col: '#7A4A3A', keep: true, c2: '#EDE6D6', pants: '#3E3A35', shoe: '#2A2A2A', hair: 'bald', hc: '#8A8F98' },
    parkur: { top: 'tank', col: '#F4EBDD', keep: true, pants: '#2B2E3A', shorts: true, shoe: '#F4F1EA', hair: 'short', hc: '#1E1712', sleeve: 'none' },
    boss_vatman: { top: 'jacket', col: '#D7263D', keep: true, c2: '#14151F', pants: '#1E2330', shoe: '#14151F', hair: 'short', hc: '#2A1E16', hat: 'cap', hatC: '#14151F' },
    boss_guide: { top: 'stripe', col: '#F4EBDD', keep: true, c2: '#1B4965', pants: '#2B3346', shoe: '#F4F1EA', hair: 'short', hc: '#2A1E16', hat: 'cap', hatC: '#E9A23B', acc: ['glasses'] },
    boss_bride: { top: 'dress', col: '#F4EBDD', keep: true, c2: '#F4EBDD', pants: '#F4EBDD', shoe: '#F4EBDD', hair: 'long', hc: '#6B4A2E' },
    boss_keeper: { top: 'overall', col: '#7E8A9A', keep: true, base: '#7E8A9A', pants: '#5E6878', shoe: '#2A2A2A', hair: 'short', hc: '#2A1E16', hat: 'cap', hatC: '#5E6878' },
    boss_bigbro: { top: 'tank', col: '#F4F1EA', keep: true, pants: '#1B4965', shoe: '#F4F1EA', hair: 'bald', hc: '#2A1E16', sleeve: 'none' }
  };
  Object.keys(NEW).forEach(function (k) { NEW[k].look = k; });
  var baseOutfit = CH.outfit;
  CH.outfit = function (id) { return NEW[id] || baseOutfit(id); };

  // Per-type outfit (non-walker types). Walkers use the four variants; bosses name their own outfit in EN.bossDefs.
  var TYPE_OUTFIT = { runner: 'runner', diner: 'diner', kurye: 'kurye', copci: 'copci', cayci: 'cayci', spitter: 'spitter', zehirli: 'zehirli',
    brute: 'brute', bloater: 'bloater', screamer: 'screamer', hardhat: 'hardhat', kasap: 'kasap', parkur: 'parkur' };
  var TYPE_BODY = { diner: 'squat', copci: 'copci' };
  var BEHAVIOUR = { fisher: true, musician: true, hamal: true };
  var SHOPPER_BAG = '#7A5AA6', RESP = '#D6E84A', BANDANA = '#D98C2B';

  // Merge the config into the rig defs (view only). Existing keys (scale, body, gait, eyes, broom, car ...) stay unless named here.
  Object.keys(LK.types).forEach(function (t) {
    var d = EN.DEFS[t], L = LK.types[t];
    if (!d) return;
    d.accent = L.accent; d.feature = L.feature; d.animK = L.animK || {};
    if (L.flinchK !== undefined) d.flinchK = L.flinchK;
    if (L.windupK !== undefined) d.windupK = L.windupK;
    if (L.slideK !== undefined) d.slideK = L.slideK;
    if (L.hunch !== undefined) d.hunch = L.hunch;
    if (L.lean !== undefined) d.lean = L.lean;
    if (t === 'walker') d.variants = true;
    else { d.outfit = TYPE_OUTFIT[t] || d.outfit; if (TYPE_BODY[t]) d.body = TYPE_BODY[t]; }
  });
  if (EN.DEFS.diner) EN.DEFS.diner.bib = false;     // the diner's bib is part of its apron now

  // ---- lookups (sprites.js) ----
  function variantOf(id) { return Math.imul((id | 0) + 1, 0x9E3779B1) >>> 30; }   // 0..3 from the enemy id, view only
  EN.variantOf = variantOf;
  EN.outfitFor = function (e, def, v) {
    if (e.skin && BEHAVIOUR[e.skin]) return e.skin;
    if (def.outfit) return def.outfit;
    if (def.variants) return LK.walkerVariants[variantOf(e.id)];
    return e.skin || def.skin || EN.L1[v];
  };
  // The recipe cache key part for the outfit: exact, so two enemies with the same key get identical pixels.
  EN.lookKey = function (e, def) {
    if (e.skin && BEHAVIOUR[e.skin]) return e.skin;
    if (def.outfit) return def.outfit;
    if (def.variants) return 'w' + variantOf(e.id);
    return e.skin || '';
  };
  EN.bossDefs = {};                                  // filled by art-enemy-bosses.js, keyed by the hood nameKey
  EN.defFor = function (e) { return (e.boss && e.nameKey && EN.bossDefs[e.nameKey]) || EN.def(e.type); };

  // ---- accessories through the accent hook (layer 'low' after the torso, 'high' after the face) ----
  var prevAccent = EN.accent;
  EN.accent = function (c, rc, J, layer) {
    prevAccent(c, rc, J, layer);
    var k = (rc.outfit || {}).look;
    if (!k) return;
    if (layer === 'low') {
      if (k === 'walk_tourist') camera(c, J);
      else if (k === 'walk_shopper') bagAt(c, J.LW[0], J.LW[1], SHOPPER_BAG);
      else if (k === 'runner') hood(c, rc, J);
      else if (k === 'diner') plate(c, J);
    } else if (!rc.back) {
      if (k === 'walk_tourist') sunHat(c, rc, J);
      else if (k === 'zehirli') respirator(c, rc, J);
      else if (k === 'parkur') bandana(c, rc, J);
    }
  };
  // Tourist: a compact camera on a strap at the chest.
  function camera(c, J) {
    var x = J.sx - 0.02, y = J.shY + 0.17;
    c.beginPath(); c.moveTo(J.sx - 0.09, J.shY + 0.01); c.lineTo(x, y); c.strokeStyle = INK; c.lineWidth = 0.014; c.stroke();
    R.paint(c, R.rrect(x - 0.06, y - 0.03, 0.12, 0.085, 0.015), '#2A2D38', '#1A1C24', 0.008);
    R.paint(c, R.ell(x, y + 0.012, 0.03, 0.03), '#8A8F98', '#5E636B', 0.006);
  }
  // A carrier bag hanging from a hand (the shopper's second bag; the first is the outfit prop).
  function bagAt(c, x, y, col) {
    c.beginPath(); c.moveTo(x - 0.04, y - 0.02); c.lineTo(x - 0.02, y - 0.16); c.lineTo(x + 0.02, y - 0.16); c.lineTo(x + 0.04, y - 0.02);
    c.strokeStyle = INK; c.lineWidth = 0.014; c.stroke();
    R.paint(c, R.rrect(x - 0.07, y - 0.02, 0.14, 0.13, 0.015), col, R.shade(col, 0.8), 0.011);
  }
  // Runner: the hood up, a rim behind the head (the head and hair are drawn over it).
  function hood(c, rc, J) {
    var B = rc.B, hd = J.hd;
    R.paint(c, R.ell(hd[0] - 0.01, hd[1] - 0.005, B.headRx * 1.22, B.headRy * 1.18), rc.outfit.col, R.shade(rc.outfit.col, 0.8), 0.01);
  }
  // Diner: a plate held out at the waist, between the two wrists.
  function plate(c, J) {
    var mx = (J.LW[0] + J.RW[0]) / 2, my = (J.LW[1] + J.RW[1]) / 2 + 0.01;
    R.paint(c, R.ell(mx, my, 0.2, 0.05), '#F4F1EA', '#D9D2C0', 0.008);
    R.paint(c, R.ell(mx, my - 0.005, 0.12, 0.028), '#E9E4D8', null, 0.004);
  }
  // Tourist: a wide-brimmed sun hat (the brim is wider than the head, so the silhouette reads from above).
  function sunHat(c, rc, J) {
    var B = rc.B, x = J.hd[0], y = J.hd[1];
    R.paint(c, R.ell(x, y - B.headRy * 0.82, B.headRx * 1.75, 0.045), '#F4EBDD', '#D9CFBE', 0.01);
    R.paint(c, R.ell(x, y - B.headRy * 1.02, B.headRx * 0.98, B.headRy * 0.55), '#F4EBDD', '#D9CFBE', 0.01);
    line(c, [[x - B.headRx * 0.98, y - B.headRy * 0.9], [x + B.headRx * 0.98, y - B.headRy * 0.9]], 0.02, '#2FA59A');
  }
  // Zehirli: a grey respirator canister on the lower face, with an accent-coloured filter cap.
  function respirator(c, rc, J) {
    var x = J.hd[0], y = J.hd[1] + 0.1;
    line(c, [[x - 0.13, y - 0.06], [x - 0.08, y + 0.01]], 0.012, INK);
    line(c, [[x + 0.13, y - 0.06], [x + 0.08, y + 0.01]], 0.012, INK);
    R.paint(c, R.rrect(x - 0.075, y - 0.005, 0.15, 0.07, 0.025), '#5E6670', '#3A4048', 0.008);
    R.paint(c, R.rrect(x - 0.045, y + 0.06, 0.09, 0.05, 0.015), RESP, '#A8B43A', 0.008);
  }
  // Parkur: a bandana across the forehead with a tail at the back.
  function bandana(c, rc, J) {
    var B = rc.B, x = J.hd[0], y = J.hd[1];
    R.paint(c, R.rrect(x - B.headRx * 0.98, y - B.headRy * 0.62, B.headRx * 1.96, 0.05, 0.02), BANDANA, R.shade(BANDANA, 0.8), 0.008);
    R.paint(c, R.smooth([[x - B.headRx * 0.98, y - B.headRy * 0.6], [x - B.headRx * 1.4, y - B.headRy * 0.5], [x - B.headRx * 1.25, y - B.headRy * 0.2]]),
      BANDANA, R.shade(BANDANA, 0.8), 0.006);
  }
  function line(c, pts, w, col) {
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); c.lineTo(pts[1][0], pts[1][1]);
    c.strokeStyle = col || INK; c.lineWidth = w; c.stroke();
  }

  // Back items, drawn before the torso: the student's wide pack (bulges past the shoulders) and the zehirli spray tank (tall, on the back).
  var prevBack = CH.back;
  CH.back = function (c, rc, J) {
    var k = (rc.outfit || {}).look, T = rc.B.torsoTop;
    if (k === 'walk_student') {
      R.paint(c, R.rrect(J.sx - T - 0.1, J.shY - 0.04, 2 * T + 0.2, J.hipY - J.shY + 0.05, 0.07), '#E9A23B', R.shade('#E9A23B', 0.8), 0.01);
    } else if (k === 'zehirli') {
      var tx = J.sx - T - 0.1;      // on the back side, beside the torso, below the head: it shows in the silhouette
      R.paint(c, R.rrect(tx, J.shY - 0.06, 0.16, 0.46, 0.07), RESP, '#A8B43A', 0.01);
      R.paint(c, R.rrect(tx + 0.03, J.shY - 0.02, 0.03, 0.38, 0.012), '#F4F1EA', null, 0.004);
    }
    prevBack(c, rc, J);
  };

  return { variantOf: variantOf, outfits: NEW, types: TYPE_OUTFIT };
})();
