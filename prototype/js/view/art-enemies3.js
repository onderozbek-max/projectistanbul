// v0.6 enemy art (workstream D, view only): kasap (butcher: broad, cream apron with blood, cleaver), parkur
// (free-runner: lean slim build, arms pumped) and zehirli (toxic spitter: yellow-green sac). Affix marks are drawn over
// the figure: hizli (speed streaks), zirhli (armour ring at the feet), patlayan (slow pulsing ring). Read by P.Sprites.
// Hooks: P.ArtEnemies.BODY/DEFS (new keys), P.ArtEnemies.accent (wrapped for apron, cleaver, toxic sac), P.Sprites.enemy
// (wrapped for the affix marks). Body names are unique so the bake cache never mixes these with the old types.
(function () {
  var EN = P.ArtEnemies, R = P.ArtRig, CH = P.ArtChars;
  if (!EN || !R || !CH || !P.Sprites) return;
  var H = CH.BODY.human, TAU = R.TAU;
  function ext(base, over) { var o = {}, k; for (k in base) o[k] = base[k]; for (k in over) o[k] = over[k]; return o; }

  // Bodies. kasap is the bulkiest zombie in the game; parkur is slimmer than the runner; zehirli keeps the spit rig.
  EN.BODY.kasap = ext(H, { hipY: -0.34, hipX: 0.13, shY: -0.6, shX: 0.27, torsoTop: 0.25, torsoBot: 0.23, headC: [0.02, -0.84],
    headRx: 0.14, headRy: 0.15, thigh: 0.2, shin: 0.18, legR: 0.1, shinR: 0.085, upper: 0.24, fore: 0.24, armR: 0.1,
    foreR: 0.085, handR: 0.09, shoe: 0.12, stride: 0.12, lift: 0.05 });
  EN.BODY.parkur = ext(H, { hipY: -0.3, hipX: 0.07, shY: -0.56, shX: 0.12, torsoTop: 0.12, torsoBot: 0.1, headC: [0.03, -0.75],
    headRx: 0.16, headRy: 0.18, thigh: 0.2, shin: 0.18, legR: 0.05, shinR: 0.045, upper: 0.17, fore: 0.16, armR: 0.042,
    foreR: 0.038, handR: 0.045, shoe: 0.085, stride: 0.2, lift: 0.1 });
  EN.BODY.zehirli = ext(EN.BODY.spit || H, { headC: [0.06, -0.69], torsoTop: 0.15, torsoBot: 0.13 });

  // Per-type motion. kasap: slow stomp, arms held out with the cleaver; parkur: running pump, big lean; zehirli: spit.
  EN.DEFS.kasap = { body: 'kasap', gait: 'stomp', arms: 'hold', scale: 1.5, strideK: 0.5, liftK: 0.35, lean: 0.03, hunch: 0.06,
    sway: 0.02, eyes: '#FF5A3D', brow: 'angry', torn: true, wounds: 2, apron: true, cleaver: true };
  EN.DEFS.parkur = { body: 'parkur', gait: 'run', arms: 'pump', scale: 1.05, strideK: 1.7, liftK: 1.6, lean: 0.16, hunch: 0.03,
    sway: 0.03, eyes: '#FFD27A', brow: 'angry', torn: true, wounds: 1 };
  EN.DEFS.zehirli = { body: 'zehirli', gait: 'shamble', arms: 'hold', scale: 1.14, strideK: 0.7, liftK: 0.6, lean: 0.08, hunch: 0.12,
    sway: 0.02, eyes: '#E6FF3A', brow: 'angry', throat: true, torn: true, toxicSac: true };

  // Accessories, layered on the existing accent hook (EN.accent already draws the common zombie parts).
  var prevAccent = EN.accent;
  EN.accent = function (c, rc, J, layer) {
    prevAccent(c, rc, J, layer);
    var m = rc.mot || {};
    if (layer === 'low') {
      if (m.apron) apron(c, rc, J);
      if (m.cleaver) cleaver(c, rc, J);
    } else if (m.toxicSac) toxicBubbles(c, rc, J);
  };
  // Butcher's apron: cream cloth over the torso with dark blood stains (civilian work apron, no insignia).
  function apron(c, rc, J) {
    var sx = J.sx, t = J.shY + 0.06, w = rc.B.torsoBot + 0.01;
    R.paint(c, R.rrect(sx - w, t, 2 * w, J.hipY - t - 0.04, 0.03), '#EDE6D6', '#B9B09A', 0.01);
    [[-0.06, 0.02, 0.05], [0.08, -0.06, 0.035], [0.02, 0.2, 0.04]].forEach(function (p) {
      R.paint(c, R.ell(sx + p[0], J.hipY + p[1] + 0.04, p[2], p[2] * 0.7), '#8B1E1E', '#5A1212', 0.004);
    });
  }
  // Cleaver held in the right hand (wrist joint from art-rig arm solver).
  function cleaver(c, rc, J) {
    var wx = J.RW[0], wy = J.RW[1];
    R.paint(c, R.rrect(wx - 0.02, wy - 0.12, 0.13, 0.15, 0.02), '#D9DEE5', '#7A808A', 0.008);
    R.paint(c, R.rrect(wx - 0.035, wy - 0.02, 0.05, 0.13, 0.015), '#6B4A2E', '#3A2A1E', 0.006);
  }
  // Zehirli: two green bubbles at the mouth, the sign of a toxic cloud about to come.
  function toxicBubbles(c, rc, J) {
    var x = J.hd[0] + 0.1, y = J.hd[1] + 0.18, k = 0.03 + 0.01 * (rc.windup || 0);
    R.paint(c, R.ell(x, y, k, k), '#D7F25A', '#9BBE2E', 0.006);
    R.paint(c, R.ell(x + 0.06, y + 0.07, k * 0.7, k * 0.7), '#D7F25A', '#9BBE2E', 0.006);
  }

  // Affix marks over the enemy (world-space, after the figure). Slow pulses only (no flashing).
  var prevEnemy = P.Sprites.enemy;
  P.Sprites.enemy = function (Rd, e, hero) {
    prevEnemy(Rd, e, hero);
    if (e.affix && P.CFG.affix.list[e.affix]) affixMarks(Rd, e, hero);
  };
  function affixMarks(Rd, e, hero) {
    var c = Rd.ctx, u = Rd.ppm, X = Rd.X(e.x), Y = Rd.Y(e.y - e.r * 0.6), def = EN.def(e.type);
    var uf = u * def.scale * (e.elite ? 1.25 : 1), A = P.CFG.affix.list[e.affix], t = performance.now() / 1000;
    var top = Y - uf * 1.45, back = (e.vx || 0) > 0 ? -1 : 1;
    c.save();
    c.strokeStyle = A.col; c.fillStyle = A.col; c.lineWidth = Math.max(1, uf * 0.045); c.globalAlpha = 0.9;
    if (e.affix === 'hizli') {
      [0.2, 0.42, 0.64].forEach(function (k, i) {
        c.beginPath(); c.moveTo(X + back * uf * (0.45 + i * 0.1), Y - uf * (0.3 - k * 0.5));
        c.lineTo(X + back * uf * (0.8 + i * 0.12), Y - uf * (0.3 - k * 0.5)); c.stroke();
      });
    } else if (e.affix === 'zirhli') {
      c.beginPath(); c.ellipse(X, Y + uf * 0.08, uf * 0.5, uf * 0.12, 0, 0, TAU); c.stroke();
    } else if (e.affix === 'patlayan') {
      var p = 0.5 + 0.5 * Math.sin(t * 2.1);
      c.globalAlpha = 0.35 + 0.4 * p;
      c.beginPath(); c.ellipse(X, Y + uf * 0.08, uf * (0.5 + 0.12 * p), uf * (0.14 + 0.04 * p), 0, 0, TAU); c.stroke();
    }
    badge(c, X, top, uf * 0.16, e.affix, A.col);
    c.restore();
  }
  // Small badge above the head: a shape per affix (no text, so it reads without the font).
  function badge(c, x, y, r, id, col) {
    c.globalAlpha = 0.95;
    c.beginPath(); c.arc(x, y, r * 1.25, 0, TAU); c.fillStyle = '#14151F'; c.fill();
    c.fillStyle = col; c.strokeStyle = col; c.lineWidth = Math.max(1, r * 0.4);
    if (id === 'hizli') {
      c.beginPath(); c.moveTo(x - r * 0.6, y - r * 0.5); c.lineTo(x, y); c.lineTo(x - r * 0.6, y + r * 0.5);
      c.moveTo(x + r * 0.1, y - r * 0.5); c.lineTo(x + r * 0.7, y); c.lineTo(x + r * 0.1, y + r * 0.5); c.stroke();
    } else if (id === 'zirhli') {
      c.fillRect(x - r * 0.55, y - r * 0.6, r * 1.1, r * 1.2);
    } else {
      c.beginPath();
      for (var i = 0; i < 10; i++) {
        var ang = i * TAU / 10 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r * 0.9;
        c.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr);
      }
      c.closePath(); c.fill();
    }
  }
})();
