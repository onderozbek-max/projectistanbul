// Boss costumes (view only, procedural art). The five brute-type bosses (config-bosses.js bossByHood: istiklal, galata, karakoy,
// yedikule, atakoy) share the brute body and rig. Each gets its own outfit (art-enemy-look.js, boss_*), a costume prop or layer
// drawn through the accent hook, and its own def in EN.bossDefs keyed by the hood nameKey ('boss.<hood>', the story names are
// spk.b.* in js/story/strings-story.js). Config: P.CFG.enemyLook.bossCostumes. No real brands, no religious dress, no gore.
(function () {
  var EN = P.ArtEnemies, R = P.ArtRig, CH = P.ArtChars, LK = P.CFG.enemyLook;
  if (!EN || !R || !CH || !LK || !P.ArtEnemyLook) return;
  var INK = R.INK, TAU = R.TAU;
  function ext(base, over) { var o = {}, k; for (k in base) o[k] = base[k]; for (k in over) o[k] = over[k]; return o; }
  function line(c, pts, w, col) {
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col || INK; c.lineWidth = w; c.stroke();
  }
  var COSTUME_OUTFIT = { vatman: 'boss_vatman', guide: 'boss_guide', bride: 'boss_bride', keeper: 'boss_keeper', bigbro: 'boss_bigbro' };
  // Arm pose per costume: the boss's silhouette cue besides its prop (vatman holds the hook out, guide swings the megaphone,
  // bride's gown drags, keeper's keys hang, big bro spreads his arms).
  var COSTUME_ARMS = { vatman: 'hold', guide: 'swing', bride: 'drag', keeper: 'zswing', bigbro: 'flail' };

  // One boss def per hood nameKey: the brute def with its costume and outfit. The brute body, scale and motion are unchanged.
  Object.keys(LK.bossCostumes).forEach(function (nk) {
    var K = LK.bossCostumes[nk];
    EN.bossDefs[nk] = ext(EN.DEFS.brute, { costume: K.costume, outfit: COSTUME_OUTFIT[K.costume], arms: COSTUME_ARMS[K.costume], accent: K.accent,
      feature: K.feature, animK: { bob: 0.5, squash: 1.3, step: 0.5 } });
  });

  // Costume layers in the low layer (after the torso and the hand props' arms) and the high layer (after the face).
  var COSTUME_LOW = {
    // Tram conductor: brass buttons down the jacket and a long tram hook in the right hand.
    vatman: function (c, rc, J) {
      var x = J.sx, y = J.shY + 0.1, i;
      for (i = 0; i < 4; i++) R.paint(c, R.ell(x, y + i * 0.08, 0.012, 0.012), '#D9B25A', '#8A6A2A', 0.004);
      var hx = J.RW[0], hy = J.RW[1];
      line(c, [[hx, hy], [hx + 0.03, hy - 0.62]], 0.04, '#5E4628');
      line(c, [[hx + 0.03, hy - 0.62], [hx + 0.14, hy - 0.7], [hx + 0.16, hy - 0.6]], 0.03, '#8A8F98');
    },
    // Tour guide: a megaphone in the right hand and a lanyard badge on the chest.
    guide: function (c, rc, J) {
      var x = J.RW[0], y = J.RW[1], fx = J.LW[0], fy = J.LW[1];
      line(c, [[fx, fy], [fx + 0.02, fy - 0.55]], 0.03, '#5E4628');
      R.paint(c, R.rrect(fx + 0.02, fy - 0.55, 0.24, 0.16, 0.02), '#2E6F7E', R.shade('#2E6F7E', 0.8), 0.008);
      R.paint(c, R.rrect(fx + 0.06, fy - 0.5, 0.16, 0.03, 0.01), '#F4EBDD', null, 0.004);
      c.beginPath(); c.moveTo(x, y - 0.04); c.lineTo(x + 0.28, y - 0.18); c.lineTo(x + 0.28, y + 0.05); c.lineTo(x, y + 0.02); c.closePath();
      c.fillStyle = '#E9A23B'; c.fill(); c.strokeStyle = INK; c.lineWidth = 0.01; c.stroke();
      R.paint(c, R.rrect(x - 0.02, y - 0.04, 0.05, 0.05, 0.01), '#F4F1EA', '#D9D2C0', 0.005);
      line(c, [[J.sx - 0.03, J.shY + 0.02], [J.sx, J.shY + 0.2], [J.sx + 0.03, J.shY + 0.02]], 0.012, '#1B4965');
      R.paint(c, R.rrect(J.sx - 0.04, J.shY + 0.18, 0.08, 0.1, 0.012), '#F4F1EA', '#D9D2C0', 0.008);
    },
    // Bride: a long A-line gown to the ground, and a bouquet in the right hand.
    bride: function (c, rc, J) {
      var bx = J.bcx, hy = J.hipY + 0.02, ground = -0.02;
      R.paint(c, R.smooth([[bx - 0.13, hy], [bx + 0.13, hy], [bx + 0.3, ground], [bx - 0.3, ground]]), '#F4EBDD', '#D9CFBE', 0.01);
      line(c, [[bx - 0.15, hy + 0.12], [bx + 0.15, hy + 0.12]], 0.008, '#D9CFBE');
      var hx = J.RW[0], hy2 = J.RW[1], i;
      line(c, [[hx, hy2], [hx, hy2 + 0.14]], 0.012, '#4F7A4A');
      for (i = -1; i <= 1; i++) R.paint(c, R.ell(hx + i * 0.03, hy2 - 0.02 + Math.abs(i) * 0.01, 0.03, 0.028), '#D9708F', '#A84D68', 0.005);
    },
    // Key keeper: a ring of brass keys hanging from the belt, and a long key in the left hand.
    keeper: function (c, rc, J) {
      var x = J.bcx - 0.14, y = J.hipY - 0.02, i;
      c.beginPath(); c.ellipse(x, y, 0.09, 0.13, 0.2, 0, TAU); c.strokeStyle = '#C9A13B'; c.lineWidth = 0.02; c.stroke();
      c.strokeStyle = INK; c.lineWidth = 0.006; c.stroke();
      for (i = 0; i < 5; i++) {
        var a = -1.2 + i * 0.45, kx = x + Math.cos(a) * 0.09, ky = y + Math.sin(a) * 0.13;
        line(c, [[kx, ky], [kx + (i - 2) * 0.02, ky + 0.2 + (i % 2) * 0.04]], 0.012, '#C9A13B');
        R.paint(c, R.ell(kx + (i - 2) * 0.02, ky + 0.21 + (i % 2) * 0.04, 0.02, 0.026), '#C9A13B', '#8A6A2A', 0.004);
      }
      var lx = J.LW[0], ly = J.LW[1];
      line(c, [[lx, ly], [lx - 0.04, ly + 0.36]], 0.018, '#C9A13B');
      R.paint(c, R.ell(lx - 0.04, ly - 0.02, 0.045, 0.045), '#C9A13B', '#8A6A2A', 0.006);
    },
    // Big Bro: a gold chain across the chest.
    bigbro: function (c, rc, J) {
      c.beginPath(); c.moveTo(J.sx - 0.1, J.shY + 0.03); c.quadraticCurveTo(J.bcx, J.shY + 0.27, J.sx + 0.1, J.shY + 0.03);
      c.strokeStyle = INK; c.lineWidth = 0.028; c.stroke();
      c.strokeStyle = '#E9B93A'; c.lineWidth = 0.014; c.stroke();
      R.paint(c, R.ell(J.bcx, J.shY + 0.2, 0.03, 0.03), '#E9B93A', '#8A6A2A', 0.006);
    }
  };
  var COSTUME_HIGH = {
    // Tram conductor: a wide peaked cap, the brim far wider than the head.
    vatman: function (c, rc, J) {
      var B = rc.B, x = J.hd[0], y = J.hd[1];
      R.paint(c, R.ell(x, y - B.headRy * 0.95, B.headRx * 1.7, 0.045), '#14151F', '#000000', 0.008);
      R.paint(c, R.ell(x, y - B.headRy * 1.15, B.headRx * 1.0, B.headRy * 0.62), '#14151F', '#000000', 0.008);
      line(c, [[x - B.headRx * 0.95, y - B.headRy * 1.0], [x + B.headRx * 0.95, y - B.headRy * 1.0]], 0.02, '#D7263D');
    },
    // Big Bro: dark sunglasses across the eyes.
    bigbro: function (c, rc, J) {
      var x = J.hd[0], y = J.hd[1] + 0.005;
      R.paint(c, R.rrect(x - 0.15, y - 0.035, 0.3, 0.06, 0.02), '#14151F', '#000000', 0.006);
      c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(x - 0.12, y - 0.025, 0.05, 0.012);
    }
  };

  var prevAccent = EN.accent;
  EN.accent = function (c, rc, J, layer) {
    prevAccent(c, rc, J, layer);
    var k = (rc.mot || {}).costume;
    if (!k) return;
    if (layer === 'low' && COSTUME_LOW[k]) COSTUME_LOW[k](c, rc, J);
    else if (layer === 'high' && !rc.back && COSTUME_HIGH[k]) COSTUME_HIGH[k](c, rc, J);
  };
  // The bride's veil trails behind the body (drawn before the torso, through the back-item hook).
  var prevBack = CH.back;
  CH.back = function (c, rc, J) {
    if ((rc.mot || {}).costume === 'bride') {
      var hd = J.hd, x = hd[0];
      R.paint(c, R.smooth([[x - 0.12, hd[1] - 0.2], [x + 0.14, hd[1] - 0.22], [x + 0.36, J.hipY + 0.2], [x + 0.2, -0.02], [x - 0.12, -0.02], [x - 0.18, J.hipY]]),
        '#F4EBDD', '#D9CFBE', 0.008);
    }
    prevBack(c, rc, J);
  };
})();
