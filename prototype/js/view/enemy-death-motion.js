// Six readable body reactions from the finishing blow, in world metres. No lighting strobe.
P.EnemyDeathMotion = (function () {
  var M = {}, PI = Math.PI, TAU = PI * 2;
  function unit(x) { return Math.max(0, Math.min(1, x)); }
  function smooth(x) { x = unit(x); return x * x * (3 - 2 * x); }
  var C = {
    blade: [.11, .35, .42], electric: [.25, .49, .14], fire: [.15, .54, .09],
    explosion: [.14, .68, 1.12], blunt: [.05, .34, .60], water: [.12, .52, .82]
  };
  function reduced() { return P.Settings && P.Settings.reduceMotion; }
  M.swing = function (air, age) {
    var K = P.CFG.swingImpact, p = unit(age / air.T), arc = Math.sin(PI * p), calm = reduced() ? .3 : 1;
    var side = air.x < 0 || air.x === 0 && air.y < 0 ? -1 : 1;
    return { height: arc * (K.height + K.extraHeight * air.strength) * calm,
      roll: side * arc * (K.roll + K.extraRoll * air.strength) * calm };
  };
  M.swungBody = function (rec, age) {
    var w = rec.swingAir, t0 = rec.t0 - w.at, left = Math.max(0, w.T - t0), motion = M.swing(w, age + t0);
    var p = left ? unit(age / left) : 1;
    var x = (w.end.x - rec.x) * p, y = (rec.y - w.end.y) * p;
    var fall = smooth((age - left + .1) / .24);
    return { shape: { sx: 1 + .14 * fall, sy: 1 - .13 * fall, fall: fall, shadow: 1 - .30 * fall, push: 0, lift: 0 },
      extra: { dx: x, dy: y - motion.height, rot: motion.roll, char: false },
      groundY: y, landing: age - left };
  };
  M.groundBurst = function (c, x, y, u, age, strength) {
    if (age < 0 || age > .25) return;
    var p = age / .25, r = u * (.19 + p * (.49 + strength * .24));
    c.save(); c.translate(x, y); c.scale(1, .61); c.globalAlpha *= (1 - p) * .78;
    c.strokeStyle = '#D5AE80'; c.lineWidth = 2;
    c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke();
    c.strokeStyle = '#FFF0CF'; c.beginPath();
    for (var i = 0; i < 5; i++) {
      var a = (i + .2) * TAU / 5, cx = Math.cos(a), cy = Math.sin(a);
      c.moveTo(cx * r * .65, cy * r * .65); c.lineTo(cx * r * 1.16, cy * r * 1.16);
    }
    c.stroke(); c.restore();
  };
  M.pose = function (source, fallback) { return source === 'extinguisher' || source === 'speargun' ? 'water' : fallback; };
  M.body = function (kind, a, f) {
    var m = C[kind] || C.blunt, travel = smooth(a / m[1]), drop = smooth((a - m[0]) / (m[1] - m[0]));
    var thump = Math.max(0, 1 - a / .16), air = Math.sin(PI * unit(a / m[1])), x = f * m[2] * travel;
    var y = 0, rot = 0, sx = 1, sy = 1;
    if (kind === 'blade') { rot = -.25 * f * thump; sy -= .16 * air; }
    else if (kind === 'electric') { y = -.17 * air; sx += .13 * air; sy += .22 * air; rot = f * (a < .18 ? -.12 : .19) * air; }
    else if (kind === 'fire') { sx += .24 * drop; sy -= .31 * air; rot = Math.sin(8 * a) * f * .24 * air; }
    else if (kind === 'explosion') { y = -1.23 * air; rot = f * .97 * travel; drop = smooth((a - .35) / .28); }
    else if (kind === 'water') { y = -.10 * air; sx += .14 * air; sy -= .18 * air; rot = f * .25 * travel; }
    else { rot = -f * thump * .56; sx += .28 * thump; sy -= .27 * thump; y = -.30 * air; }
    var still = P.Settings && P.Settings.reduceMotion ? .35 : 1;
    return {
      shape: { sx: 1 + (sx - 1) * still, sy: 1 + (sy - 1) * still, fall: drop, shadow: 1 - .27 * drop, push: 0, lift: 0 },
      extra: { dx: x * still, dy: y * still, rot: rot * still, char: kind === 'fire' || kind === 'explosion' }
    };
  };
  M.accent = function (c, kind, a, X, Y, u, f) {
    var lifetime = kind === 'electric' ? .31 : .24, p = a / lifetime, i;
    if (p < 0 || p >= 1) return;
    c.save(); c.globalAlpha *= 1 - p; c.translate(X, Y - .38 * u); c.scale(f, 1);
    c.lineWidth = Math.max(1.5, .052 * u); c.lineJoin = 'round'; c.lineCap = 'round';
    if (kind === 'blade' || kind === 'water') {
      c.strokeStyle = kind === 'water' ? '#BBF8FF' : '#FFF0D3';
      c.beginPath(); c.moveTo(-.44*u, .18*u); c.quadraticCurveTo(.04*u, -.39*u, u*(.52 + p*.27), -.23*u); c.stroke();
    } else if (kind === 'electric') {
      c.strokeStyle = '#ACF3FF'; c.beginPath();
      for (i = 0; i < 4; i++) {
        var x = u * (i < 2 ? -.35 : .35), y = u * (i % 2 ? -.41 : .12);
        c.moveTo(x, y); c.lineTo(x * 1.48, y - .09 * u); c.lineTo(x * 1.25, y - .19 * u); c.lineTo(x * 1.84, y - .29 * u);
      } c.stroke();
    } else {
      c.strokeStyle = kind === 'fire' || kind === 'explosion' ? '#FFC26F' : '#FFF1BC';
      c.beginPath();
      for (i = 0; i < (kind === 'explosion' ? 8 : 4); i++) {
        var angle = i * (kind === 'explosion' ? TAU / 8 : .72) - 2.5, d = u * (.22 + p * .42);
        c.moveTo(Math.cos(angle) * d, Math.sin(angle) * d);
        c.lineTo(Math.cos(angle) * (d + .17*u), Math.sin(angle) * (d + .17*u));
      } c.stroke();
    }
    c.restore();
  };
  return M;
})();
