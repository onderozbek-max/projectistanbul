// Weapon-specific contact shapes. World position is taken from the hit event, in the existing tier-effects pool.
P.WeaponImpacts = (function () {
  var I = {}, C = P.CFG.wtier.contact, TAU = Math.PI * 2, INK = '#25232B', CORE = '#FFF0D2';
  var forms = {}, followThrough = {};
  var rankFive = {
    knife: 'crosscut', nailgun: 'rivets', chain: 'chainSnap', fireworks: 'comets', cable: 'surge',
    speargun: 'barbs', extinguisher: 'foamWake', sawblade: 'returnCut', manhole: 'ironSkip',
    torch: 'blueFlame', olta: 'reel', cardoor: 'doorShove', slingshot: 'rebound', chainsaw: 'sawBite'
  };
  var evolutions = {
    cleaver: 'cleaverDrop', nailstorm: 'nailFan', cluster: 'blastPods', cyclone: 'chainVortex',
    blacksmith: 'anvil', stormshield: 'shieldCircuit', foamstorm: 'foamVortex', netspear: 'net',
    twinsaw: 'twinEdges', fireball: 'fireCrown', forge: 'moltenSeam', grinder: 'grindingWheel',
    hookpull: 'winch', minibus: 'bumper',
    arcchain: 'arcClosure', carbomb: 'carBackblast', lake: 'lakeBanks', finale: 'finaleCanopy'
  };

  I.weapon = function (s, src) {
    if (!src || !Object.prototype.hasOwnProperty.call(C.weapons, src)) return null;
    var h = s && s.hero, variant = h && h.evolved && h.evolved[src];
    return variant && h.weapons && h.weapons[variant] && C.weapons[variant] ? variant : src;
  };
  I.profile = function (id) { return C.weapons[id]; };

  I.make = function (id, ev, lv, compact) {
    var row = C.weapons[id], rank = lv - 1;
    var angle = Math.atan2(-(ev.dy || 0), ev.dx || 0);
    var dur = row[3] * C.life[rank], reach = row[2] * C.size[rank];
    if (id === 'knife' && !compact) { reach *= 1.38; dur *= 1.26; }
    var evo = evolutions[id], climax = rank === 4 && rankFive[id], detail = !compact && (evo || climax);
    var form = detail || row[0];
    if (compact) { reach *= 0.72; dur *= 0.74; }
    if (detail && evo) { dur *= 1.26; reach *= 1.22; }
    else if (detail) dur *= 1.17;
    var follow = !compact && !evo && !climax && rank > 0 && followThrough[id];
    return { k: 'contact', id: id, x: ev.x, y: ev.y, a: angle, w: reach, t: dur, T: dur,
      beats: compact ? 1 : C.beats[rank], form: form, follow: follow || null, rank: lv,
      detail: !!(detail || follow), col: 'rgb(' + row[1] + ')', layer: row[6] };
  };

  function trace(c, points) {
    c.beginPath(); c.moveTo(points[0], points[1]);
    for (var i = 2; i < points.length; i += 2) c.lineTo(points[i], points[i + 1]);
  }
  function edge(c, col, width) {
    c.lineWidth = width + 0.062; c.strokeStyle = INK; c.stroke();
    c.lineWidth = width; c.strokeStyle = col; c.stroke();
  }
  function line(c, points, col, width) { trace(c, points); edge(c, col, width); }
  function arc(c, x, y, rx, ry, from, to, col, width) {
    c.beginPath(); c.ellipse(x, y, rx, ry, 0, from, to); edge(c, col, width);
  }
  function dot(c, x, y, size, col) {
    c.fillStyle = col;
    c.beginPath(); c.arc(x, y, size, 0, TAU); c.fill();
  }
  function echo(c, alpha, draw) {
    c.save(); c.globalAlpha *= alpha; draw(); c.restore();
  }

  // The bright leading edge of a cut peels apart from its dark trailing edge.
  forms.slice = function (c, col, q, n) {
    c.rotate(-0.73 + 1.08 * q);
    for (var i = n - 1; i >= 0; i--) {
      var x = i * 0.22 - 0.18, y = i * -0.23 + 0.10, len = 1 - i * 0.19;
      c.beginPath(); c.moveTo(x - len, y + 0.31);
      c.quadraticCurveTo(x - 0.12, y - 0.65, x + len, y - 0.36);
      c.quadraticCurveTo(x + 0.28, y - 0.05, x - len, y + 0.31); c.closePath();
      c.fillStyle = i ? col : CORE; c.fill(); edge(c, col, 0.040);
      c.beginPath(); c.moveTo(x - len * .60, y + .17);
      c.quadraticCurveTo(x, y - .36, x + len * .78, y - .35); edge(c, CORE, .042);
    }
  };

  // A nail prints a short, straight puncture with a forked tail.
  forms.pin = function (c, col, q, n) {
    for (var i = 0; i < n; i++) {
      var x = 0.25 + 0.4 * q - i * 0.22, y = i % 2 ? -i * 0.16 : i * 0.16;
      line(c, [x - 0.72, y + 0.22, x, y, x - 0.72, y - 0.22], col, 0.075);
      line(c, [x - 0.23, y, x + 0.4, y], CORE, 0.057);
    }
  };

  forms.blast = function (c, col, q, n) {
    var r = 0.44 + 0.44 * q, turn = q * 0.18;
    for (var i = 0; i < n + 2; i++) {
      var a = turn + i * TAU / (n + 2);
      arc(c, 0, 0, r, r * 0.6, a, a + 0.92, col, 0.14 - q * 0.073);
    }
    echo(c, 0.44, function () { arc(c, 0, 0, r * 0.58, r * 0.34, 0, TAU, '#E1B892', 0.17); });
  };

  forms.links = function (c, col, q, n) {
    for (var i = 0; i < n + 1; i++) {
      c.save(); c.translate((i - n / 2) * 0.37 + q * 0.4, Math.sin(i * 1.1) * 0.25);
      c.rotate(i % 2 ? -0.8 : 0.55);
      arc(c, 0, 0, 0.28, 0.13, 0, TAU, i % 2 ? CORE : col, 0.07);
      c.restore();
    }
  };

  forms.quake = function (c, col, q, n) {
    for (var i = 0; i < n + 2; i++) {
      c.save(); c.rotate(-0.23 + i * TAU / (n + 2));
      var tip = 0.66 + q * 0.54;
      line(c, [0, 0, 0.34, -0.06, 0.45, 0.12, tip, 0.03], col, 0.07);
      if (n > 1) line(c, [0.45, 0.12, 0.53, 0.31, tip * 0.83, 0.42], '#ECD099', 0.035);
      c.restore();
    }
    arc(c, 0, 0, 0.28 + q * 0.3, 0.14 + q * 0.12, 0, TAU, CORE, 0.048);
  };

  forms.splash = function (c, col, q, n) {
    var r = 0.46 + q * 0.42;
    arc(c, 0, 0, r, r * 0.52, 0.1, 3.02, col, 0.14);
    for (var i = 0; i < n + 2; i++) {
      var x = (i / (n + 1) - 0.5) * r * 1.9, y = -0.42 + Math.sin(i * 3) * 0.13;
      c.beginPath(); c.moveTo(x * 0.65, 0);
      c.quadraticCurveTo(x, y, x * 1.34, y - q * 0.43); edge(c, i % 2 ? CORE : col, 0.064);
      if (n > 1) dot(c, x * 1.4, y - 0.23 - q * 0.45, 0.05, col);
    }
  };

  forms.burst = function (c, col, q, n) {
    var reach = 0.54 + 0.47 * q;
    for (var i = 0; i < 4 + 2 * n; i++) {
      c.save(); c.rotate(0.17 + i * TAU / (4 + 2 * n));
      line(c, [reach * 0.45, 0, reach, 0], i % 2 ? col : CORE, 0.068);
      if (n > 1) dot(c, reach * 1.19, Math.sin(i) * 0.16, 0.048, i % 2 ? '#A2D7EE' : CORE);
      c.restore();
    }
  };

  forms.fork = function (c, col, q, n) {
    var x = 0.1 + 0.15 * q;
    line(c, [-0.88, 0.22, -0.43, -0.2, -0.25, 0.11, x, -0.18, 0.4, 0.07, 0.82, -0.24], CORE, 0.084);
    for (var i = 0; i < n + 1; i++) {
      var sign = i % 2 ? 1 : -1;
      line(c, [x - i * 0.24, 0.04, x + 0.23, sign * 0.28, x - 0.12 - i * 0.14, sign * (0.56 + q * 0.14)], col, 0.050);
    }
  };

  forms.tether = function (c, col, q, n) {
    var x = 0.18 + q * 0.5;
    c.beginPath(); c.moveTo(-1.11, 0.12); c.quadraticCurveTo(-0.7, 0.37 - q * 0.26, x, 0); edge(c, col, 0.071);
    line(c, [x - 0.37, -0.31, x, 0, x - 0.37, 0.31], CORE, 0.077);
    for (var i = 1; i < n; i++) line(c, [x - 0.35 * i, 0, x - 0.53 * i, i % 2 ? 0.28 : -0.28], col, 0.06);
  };

  forms.foam = function (c, col, q, n) {
    for (var i = 0; i < n + 2; i++) {
      var x = (i - 1) * 0.28 + 0.21 * q, y = Math.sin(i * 2.4) * 0.35 - 0.19 * q;
      var r = 0.13 + 0.12 * q + (i % 3) * 0.04;
      c.beginPath(); c.arc(x, y, r, 0, TAU);
      c.fillStyle = '#C4DDE7'; c.fill(); edge(c, col, 0.04);
      dot(c, x - r * 0.27, y - r * 0.39, r * 0.25, '#FCF8EA');
    }
  };

  forms.teeth = function (c, col, q, n) {
    var teeth = 5 + 2 * n, angle = -1.12 + q * 0.78;
    for (var i = 0; i < teeth; i++) {
      var a = angle + i * 0.27;
      line(c, [Math.cos(a) * 0.61, Math.sin(a) * 0.61, Math.cos(a + 0.19) * 0.93, Math.sin(a + 0.19) * 0.93,
        Math.cos(a + 0.27) * 0.63, Math.sin(a + 0.27) * 0.63], i % 2 ? col : CORE, 0.065);
    }
  };

  forms.ricochet = function (c, col, q, n) {
    for (var i = 0; i < n + 1; i++) {
      var x = i * 0.39 + q * 0.32 - 0.42, r = 0.35 - 0.05 * i;
      arc(c, x, 0.08 + i * 0.13, r, r * 0.50, 0.1, 2.91, i ? col : CORE, 0.089);
    }
  };

  forms.sear = function (c, col, q, n) {
    for (var i = 0; i < n + 1; i++) {
      var x = 0.08 + i * 0.24 + q * 0.22, len = 0.74 - i * 0.12;
      c.fillStyle = col;
      P.FireAnimPrim.tongue(c, x, 0.3, 0.16, len, 0.34);
      c.fillStyle = CORE;
      P.FireAnimPrim.tongue(c, x + 0.025, 0.3, 0.065, len * 0.54, 0.17);
    }
  };

  forms.hook = function (c, col, q, n) {
    var back = 0.38 * q;
    c.beginPath(); c.moveTo(-0.8 + back, -0.44);
    c.bezierCurveTo(0.9 - back, -0.58, 0.81 - back, 0.7, 0.22 - back, 0.22);
    edge(c, CORE, 0.085);
    for (var i = 0; i < n; i++) arc(c, -0.18 - i * 0.19 - back, 0.13 + i * 0.18, 0.34, 0.21, 0.3, 2.7, col, 0.065);
  };

  forms.panel = function (c, col, q, n) {
    var reach = q * 0.54;
    for (var i = 0; i < n; i++) {
      var x = reach - 0.20 * i;
      line(c, [x - 0.53, -0.49, x - 0.11, -0.49, x + 0.25, 0, x - 0.09, 0.56, x - 0.55, 0.56], i ? col : CORE, 0.126);
    }
    dot(c, reach + 0.55, -0.32, 0.075, col);
    dot(c, reach + 0.71, 0.27, 0.058, col);
  };

  forms.skip = function (c, col, q, n) {
    for (var i = 0; i < n + 1; i++) {
      var x = i * 0.29 + q * 0.4 - 0.15, y = Math.cos(i * 2) * 0.24, r = 0.09 - i * 0.009;
      arc(c, x, y, r + 0.11, r + 0.07, -1.3, 1.5, col, 0.064);
      dot(c, x, y, r, CORE);
    }
  };

  forms.grind = function (c, col, q, n) {
    for (var i = 0; i < n + 3; i++) {
      var y = (i - (n + 2) / 2) * 0.16, x = Math.sin(i * 2) * 0.13 + 0.35 * q;
      line(c, [x - 0.49, y + 0.15, x + 0.21, y, x + 0.60, y - 0.28], i % 2 ? col : CORE, 0.056);
    }
  };

  // Highest-rank accents use a different shape and timing from the ordinary contact.
  forms.crosscut = function (c, col, q) {
    forms.slice(c, col, q * 0.65, 1);
    c.rotate(1.35);
    echo(c, q, function () { forms.slice(c, col, q, 2); });
  };
  forms.rivets = function (c, col, q, n) {
    line(c, [-1.05, 0, 1.05 - 0.30 * q, 0], CORE, 0.065);
    for (var i = 0; i <= n; i++) {
      var x = 0.83 - i * (0.43 - q * 0.08), r = 0.28 + q * 0.12;
      arc(c, x, 0, 0.11, r, -1.22, 1.32, i ? col : CORE, 0.067);
    }
  };
  forms.chainSnap = function (c, col, q) {
    c.beginPath(); c.moveTo(-1.08, 0.24);
    c.bezierCurveTo(-0.60, -0.96 * q, 0.28, 0.84 * q, 0.97, -0.17);
    edge(c, col, 0.14);
    forms.links(c, col, q * 0.7, 2);
  };
  forms.comets = function (c, col, q, n) {
    for (var i = 0; i < n + 2; i++) {
      c.save(); c.rotate(i * TAU / (n + 2) + q * 0.34);
      var x = 0.41 + q * 0.65;
      c.beginPath(); c.moveTo(0.22, -0.12); c.quadraticCurveTo(x * 0.67, -0.28, x, 0.02); edge(c, col, 0.10);
      dot(c, x, 0.02, 0.09, i % 2 ? '#A2D7EE' : CORE);
      c.restore();
    }
  };
  forms.surge = function (c, col, q) {
    forms.fork(c, col, q, 2);
    arc(c, -0.50 + 0.94 * q, 0, 0.20, 0.44, -1.5, 1.5, CORE, 0.087);
  };
  forms.barbs = function (c, col, q) {
    var x = 0.52 + q * 0.37;
    line(c, [-1.04, 0, x, 0], CORE, 0.07);
    line(c, [-0.36, -0.47, x, 0, -0.36, 0.47, -0.18, 0], col, 0.10);
    line(c, [-0.78, -0.22, -0.54, 0, -0.78, 0.22], col, 0.06);
  };
  forms.foamWake = function (c, col, q) {
    c.beginPath(); c.moveTo(-1.03, 0.30); c.quadraticCurveTo(-0.1, 0.25, 0.70 + 0.22 * q, -0.41); edge(c, CORE, 0.12);
    forms.foam(c, col, q, 2);
  };
  forms.returnCut = function (c, col, q) {
    c.translate(q * 0.48 - 0.23, 0);
    arc(c, 0, 0, 0.68, 0.48, -2.8, 1.3, col, 0.09);
    forms.teeth(c, CORE, q, 2);
  };
  forms.ironSkip = function (c, col, q, n) {
    for (var i = 0; i < n; i++) {
      var x = (i - 1) * 0.48 + q * 0.32, r = 0.35 + 0.06 * i;
      arc(c, x, 0.28 - i * 0.18, r, r * 0.55, 0, TAU, i ? col : CORE, 0.076);
      line(c, [x, 0.10 - i * 0.18, x + 0.25, 0.43 - i * 0.18], col, 0.036);
    }
  };
  forms.blueFlame = function (c, col, q) {
    c.rotate(1.05);
    forms.sear(c, col, q, 2);
    c.fillStyle = '#A6ECFC'; P.FireAnimPrim.tongue(c, 0.22 + q * 0.2, 0.26, 0.10, 0.60, 0.23);
  };
  forms.reel = function (c, col, q) {
    c.beginPath(); c.moveTo(-1.03, -0.22); c.quadraticCurveTo(-0.08, -0.55 * (1 - q), 0.74 - 0.47 * q, 0); edge(c, col, 0.066);
    forms.hook(c, col, Math.min(1, q * 1.6), 2);
  };
  forms.doorShove = function (c, col, q) {
    forms.panel(c, col, q, 1);
    for (var i = -1; i <= 1; i++) line(c, [0.25, i * 0.18, 0.97, i * (0.27 + q * 0.21)], i ? col : CORE, 0.066);
  };
  forms.rebound = function (c, col, q) {
    line(c, [-1.02, -0.30, -0.41, 0.16, 0.12, -0.18, 0.86 + 0.21 * q, 0.41], col, 0.083);
    dot(c, -0.41, 0.16, 0.12, CORE); dot(c, 0.12, -0.18, 0.09 + q * 0.045, CORE);
  };
  forms.sawBite = function (c, col, q) {
    line(c, [-0.88, 0.42, -0.42, -0.28, -0.14, 0.23, 0.15, -0.36, 0.43, 0.12, 0.91, -0.46], CORE, 0.085);
    echo(c, 0.65, function () { c.translate(0.14 * q, 0.14); forms.grind(c, col, q, 2); });
  };

  // Evolved contacts resolve into their own second beat rather than repeating the base mark.
  forms.cleaverDrop = function (c, col, q) {
    var y = -0.45 + Math.min(1, q * 2) * 0.62;
    c.beginPath(); c.moveTo(-0.76, y - 0.58); c.lineTo(0.41, y - 0.48);
    c.quadraticCurveTo(0.89, y - 0.10, 0.43, y + 0.10); c.lineTo(-0.88, y - 0.11); c.closePath();
    c.fillStyle = CORE; c.fill(); edge(c, col, 0.10);
    echo(c, q, function () { arc(c, 0, y + 0.18, 0.93 + q * 0.25, 0.38, 0.14, 2.98, col, 0.11); });
  };
  forms.nailFan = function (c, col, q, n) {
    for (var i = -n; i <= n; i++) {
      c.save(); c.rotate(i * 0.21);
      var x = 0.94 - Math.abs(i) * 0.12 + q * 0.29;
      line(c, [-0.82, 0, x, 0, x - 0.17, -0.11], i % 2 ? col : CORE, 0.051);
      line(c, [x - 0.3, -0.14, x - 0.3, 0.14], col, 0.041); c.restore();
    }
  };
  forms.blastPods = function (c, col, q) {
    var spread = 0.25 + q * 0.78;
    for (var i = 0; i < 3; i++) {
      c.save(); c.rotate(i * TAU / 3);
      arc(c, spread, 0, 0.28 + q * 0.19, 0.21 + q * 0.10, 0, TAU, col, 0.10);
      line(c, [0.16, 0, spread - 0.12, 0], CORE, 0.048); c.restore();
    }
  };
  forms.chainVortex = function (c, col, q, n) {
    for (var i = 0; i < n + 1; i++) {
      var a = i * TAU / (n + 1) + q * 1.8, r = 1.25 - q * 0.75;
      c.save(); c.rotate(a);
      c.beginPath(); c.moveTo(-r, -0.21); c.quadraticCurveTo(-r * 0.74, 0.78, -0.18, 0.06); edge(c, col, 0.092);
      c.translate(-r * 0.82, 0.33); c.rotate(0.28);
      arc(c, 0, 0, 0.24, 0.13, 0, TAU, CORE, 0.060); c.restore();
    }
  };
  forms.anvil = function (c, col, q) {
    var y = -0.64 + Math.min(1, q * 3) * 0.55;
    line(c, [-1.13, y, 0.97, y, 0.65, y + 0.32, 0.27, y + 0.32, 0.41, y + 0.69,
      -0.43, y + 0.69, -0.25, y + 0.35, -0.58, y + 0.28, -1.13, y], CORE, 0.105);
    for (var i = -2; i <= 2; i++) line(c, [i * 0.15, y + 0.52, i * (0.34 + 0.16 * q), y + 0.81], col, 0.053);
  };
  forms.shieldCircuit = function (c, col, q) {
    var r = 0.52 + q * 0.54;
    for (var i = 0; i < 6; i++) {
      c.save(); c.rotate(i * TAU / 6 + q * 0.36);
      line(c, [r * 0.50, -r * 0.62, r, -r * 0.27, r, r * 0.22], i % 2 ? col : CORE, 0.089);
      dot(c, r, r * 0.29, 0.065, col); c.restore();
    }
  };
  forms.foamVortex = function (c, col, q, n) {
    for (var i = 0; i < n + 2; i++) {
      var r = 1.16 - i * 0.19 - q * 0.37, angle = i * 0.76 + q * 1.45;
      arc(c, 0, 0, r, r * 0.71, angle, angle + 1.12, i % 2 ? col : CORE, 0.13);
      dot(c, Math.cos(angle) * r, Math.sin(angle) * r * 0.71, 0.10, col);
    }
  };
  forms.net = function (c, col, q) {
    var squash = 1 - 0.52 * q;
    for (var i = -2; i <= 2; i++) for (var sd = -1; sd <= 1; sd += 2) {
      var y = (i * 0.25 - 0.46 * sd) * squash;
      line(c, [-0.99, y, -0.19, y + 0.22 * sd, 0.95, y + 0.7 * sd * squash], i === 0 ? CORE : col, 0.043);
    }
    arc(c, 0, 0, 1.01, 0.72 * squash, 0, TAU, col, 0.075);
  };
  forms.twinEdges = function (c, col, q) {
    for (var sd = -1; sd <= 1; sd += 2) {
      c.save(); c.translate(sd * (0.47 + q * 0.29), sd * 0.26); c.rotate(sd * q * 2.4); c.scale(0.72, 0.72);
      forms.teeth(c, sd > 0 ? col : CORE, q, 3); c.restore();
    }
    line(c, [-0.55 - q * 0.35, 0.3, 0, 0, 0.55 + q * 0.35, -0.3], CORE, 0.056);
  };
  forms.fireCrown = function (c, col, q, n) {
    var r = 0.49 + q * 0.68;
    arc(c, 0, 0, r, 0.63 * r, 0.2, 6.08, '#FBAF62', 0.14);
    for (var i = 0; i < n + 3; i++) {
      var a = i * TAU / (n + 3);
      c.fillStyle = i % 2 ? col : CORE;
      P.FireAnimPrim.tongue(c, Math.cos(a) * r, Math.sin(a) * r * 0.63, 0.12, 0.34 + q * 0.32, Math.cos(a) * 0.22);
    }
  };
  forms.moltenSeam = function (c, col, q) {
    line(c, [-1.16, 0.2, -0.65, -0.17, -0.32, 0.10, 0.09, -0.12, 0.52, 0.06, 1.12, -0.32], '#F68A53', 0.16);
    for (var i = 0; i < 4; i++) {
      var x = -0.65 + i * 0.46;
      c.fillStyle = i % 2 ? CORE : col;
      P.FireAnimPrim.tongue(c, x, 0.1, 0.095, 0.39 + q * (i % 2 ? 0.57 : 0.16), 0.19);
    }
  };
  forms.grindingWheel = function (c, col, q, n) {
    var r = 0.80 + q * 0.29;
    for (var i = 0; i < n + 3; i++) {
      c.save(); c.rotate(i * TAU / (n + 3) + q * 3.6);
      line(c, [r * 0.50, -0.16, r, -0.10, r + q * 0.30, 0.22], i % 2 ? col : CORE, 0.11);
      c.restore();
    }
    arc(c, 0, 0, 0.45 - q * 0.13, 0.45 - q * 0.13, 0, TAU, col, 0.070);
  };
  forms.winch = function (c, col, q) {
    var x = 0.85 - q * 1.42;
    line(c, [-1.20, -0.25, x, -0.07, x + 0.28, 0.15, x - 0.02, 0.40, x - 0.28, 0.22], CORE, 0.086);
    line(c, [-1.20, 0.34, x, 0.10], col, 0.066);
    for (var i = 0; i < 3; i++) arc(c, x - i * 0.15, 0.02, 0.11 + q * 0.13, 0.39, 1.4, 4.8, col, 0.050);
  };
  forms.bumper = function (c, col, q) {
    var x = 0.18 + q * 0.62;
    for (var sd = -1; sd <= 1; sd += 2) {
      var y = sd * 0.42;
      line(c, [-1.18, y * 1.3, -0.60, y, x, y], col, 0.14);
      line(c, [x - 0.19, y, x, y * 0.7, x + q * 0.41, y * 1.45], CORE, 0.08);
    }
    line(c, [x - 0.07, -0.49, x + 0.18, -0.22, x + 0.18, 0.22, x - 0.07, 0.49], CORE, 0.16);
  };

  // Rank two adds a material cue, three develops it, four resolves it in a second direction or beat.
  // These marks run only on the leading contact of a burst. Rank five has its own shape or final beat.
  followThrough.knife = function (c, col, q, rank) {
    var x = 0.48 + q * 0.43;
    line(c, [x - 0.28, -0.39, x + 0.25, -0.59], CORE, 0.055);
    if (rank >= 3) arc(c, -0.38, 0.36, 0.68, 0.32, 2.0, 3.25, col, 0.05);
    if (rank >= 4) line(c, [-1.06, 0.52, -0.45, 0.30, -0.63, 0.66], col, 0.064);
  };
  followThrough.nailgun = function (c, col, q, rank) {
    var x = 0.54 + q * 0.42;
    line(c, [x - 0.14, -0.30, x, -0.14], col, 0.070);
    if (rank >= 3) line(c, [x - 0.25, 0.36, x + 0.10, 0.19], CORE, 0.054);
    if (rank >= 4) line(c, [x - 0.08, -0.52, x + 0.10, -0.37, x + 0.18, -0.13, x + 0.30, -0.05], col, 0.041);
  };
  followThrough.canister = function (c, col, q, rank) {
    var r = 0.65 + q * 0.68;
    arc(c, 0, 0, r, r * 0.59, 0.08, 1.44, CORE, 0.065);
    if (rank >= 3) arc(c, -0.18, -0.05, r, r * 0.56, 2.24, 3.74, col, 0.12);
    if (rank >= 4) line(c, [-r, -0.11, -0.50, 0.04, -0.71, 0.23, -r * 1.10, 0.35], col, 0.075);
    if (rank >= 5) line(c, [0.43, -0.24, 0.76, -0.43, 0.87, -0.69, r, -0.84], CORE, 0.062);
  };
  followThrough.chain = function (c, col, q, rank) {
    var x = -0.86 + q * 0.55;
    arc(c, x, 0.35, 0.34, 0.17, 0.75, 4.05, col, 0.08);
    if (rank >= 3) arc(c, x - 0.30, 0.20, 0.27, 0.12, 2.5, 5.5, CORE, 0.057);
    if (rank >= 4) line(c, [x - 0.61, 0.03, x - 0.39, 0.40, x - 0.18, 0.47, x + 0.13, 0.33], col, 0.045);
  };
  followThrough.sledge = function (c, col, q, rank) {
    var d = 0.93 + q * 0.49;
    line(c, [0.12, 0.23, 0.35, 0.35, 0.33, 0.57, d * 0.63, 0.62], CORE, 0.07);
    if (rank >= 3) line(c, [-0.20, -0.11, -0.38, -0.35, -0.63, -0.31, -d, -0.57], col, 0.067);
    if (rank >= 4) line(c, [-0.06, 0.2, -0.42, 0.18, -0.66, 0.39, -d, 0.41], col, 0.09);
    if (rank >= 5) arc(c, 0, 0.17, d, d * 0.46, 0.04, 2.97, CORE, 0.064);
  };
  followThrough.molotov = function (c, col, q, rank) {
    var x = 0.45 + q * 0.58, h = 0.16 + q * 0.52;
    c.fillStyle = col;
    P.FireAnimPrim.tongue(c, x, 0.25, 0.09, h, 0.17);
    if (rank >= 3) P.FireAnimPrim.tongue(c, -x, 0.12, 0.105, h * 1.25, -0.18);
    if (rank >= 4) arc(c, -0.10, 0.31, x + 0.21, 0.31, 0.27, 2.68, '#ED763C', 0.10);
    if (rank >= 5) P.FireAnimPrim.tongue(c, -0.15, -0.06, 0.14, h * 1.8, -0.20);
  };
  followThrough.fireworks = function (c, col, q, rank) {
    var y = -0.40 - q * 0.66;
    line(c, [-0.78, y + 0.52, -0.66, y + 0.10, -0.46, y], '#8FE8E5', 0.056);
    if (rank >= 3) line(c, [0.51, y + 0.57, 0.73, y + 0.21, 0.91, y + 0.13], '#FFD892', 0.072);
    if (rank >= 4) line(c, [0.20, y - 0.05, 0.31, y - 0.26, 0.37, y + 0.02], col, 0.051);
  };
  followThrough.cable = function (c, col, q, rank) {
    var x = 0.3 + q * 0.46;
    line(c, [0.16, -0.22, x, -0.55, x + 0.19, -0.45], CORE, 0.057);
    if (rank >= 3) line(c, [-0.24, 0.14, -x, 0.52, -x - 0.19, 0.44], col, 0.063);
    if (rank >= 4) line(c, [x + 0.02, -0.55, x + 0.24, -0.77, x + 0.46, -0.63, x + 0.63, -0.73], col, 0.048);
  };
  followThrough.speargun = function (c, col, q, rank) {
    var x = 0.53 + q * 0.48;
    line(c, [-1.02, 0.29, -0.52, 0.19, x, 0.13], col, 0.048);
    if (rank >= 3) line(c, [x - 0.27, -0.33, x, -0.06, x - 0.16, 0.17], CORE, 0.05);
    if (rank >= 4) arc(c, -x, 0.02, 0.21, 0.43, 1.0, 4.7, col, 0.052);
  };
  followThrough.extinguisher = function (c, col, q, rank) {
    var x = 0.48 + q * 0.47;
    arc(c, x, -0.39, 0.18, 0.105, -2.4, 2.5, col, 0.06);
    if (rank >= 3) arc(c, x + 0.16, 0.39, 0.20, 0.12, -0.7, 4.8, CORE, 0.054);
    if (rank >= 4) arc(c, x - 0.18, 0.09, 0.51, 0.49, -1.02, 0.91, col, 0.065);
  };
  followThrough.sawblade = function (c, col, q, rank) {
    var y = -0.45 - q * 0.20;
    line(c, [-0.83, y + 0.24, -0.68, y, -0.46, y + 0.05], CORE, 0.068);
    if (rank >= 3) arc(c, -0.25, 0.07, 0.85, 0.60, 0.50, 1.87, col, 0.053);
    if (rank >= 4) line(c, [0.47, 0.42, 0.72, 0.29, 0.92, 0.32, 1.07, 0.13], col, 0.072);
  };
  followThrough.manhole = function (c, col, q, rank) {
    var x = 0.62 + q * 0.43;
    line(c, [x - 0.35, 0.11, x, 0.34, x + 0.20, 0.10], col, 0.084);
    if (rank >= 3) arc(c, -0.68, 0.36, 0.32, 0.13, 0.4, 2.85, CORE, 0.066);
    if (rank >= 4) line(c, [x, 0.49, x + 0.17, 0.65, x + 0.43, 0.56], col, 0.09);
  };
  followThrough.torch = function (c, col, q, rank) {
    var x = 0.48 + q * 0.38;
    c.fillStyle = CORE;
    P.FireAnimPrim.tongue(c, x, 0.19, 0.083, 0.22 + q * 0.42, 0.19);
    if (rank >= 3) line(c, [-0.98, 0.27, -0.45, 0.22, -0.12, 0.34, x, 0.19], '#CD6946', 0.076);
    if (rank >= 4) {
      c.fillStyle = '#79CBFF';
      P.FireAnimPrim.tongue(c, x - 0.53, 0.18, 0.09, 0.17 + q * 0.34, 0.20);
    }
  };
  followThrough.olta = function (c, col, q, rank) {
    var x = 0.66 - q * 0.44;
    arc(c, x, 0.21, 0.31, 0.17, 0.10, 2.60, col, 0.057);
    if (rank >= 3) line(c, [x + 0.13, -0.06, -0.32, -0.16, -1.02, -0.30], CORE, 0.045);
    if (rank >= 4) arc(c, x - 0.18, 0.19, 0.52, 0.28, 0.28, 3.17, col, 0.052);
  };
  followThrough.cardoor = function (c, col, q, rank) {
    var x = 0.27 + q * 0.51;
    line(c, [x - 0.69, 0.43, x + 0.33, 0.42, x + 0.59, 0.27], col, 0.077);
    if (rank >= 3) line(c, [x - 1.12, -0.43, x - 0.29, -0.44], '#BFE9EF', 0.066);
    if (rank >= 4) line(c, [x + 0.28, -0.31, x + 0.65, -0.45, x + 0.60, -0.11, x + 0.91, 0.07], CORE, 0.068);
  };
  followThrough.slingshot = function (c, col, q, rank) {
    var x = 0.58 + q * 0.57, y = 0.36 - Math.sin(q * Math.PI) * 0.38;
    dot(c, x, y, 0.083, CORE);
    if (rank >= 3) arc(c, x - 0.48, -0.22, 0.48, 0.28, 2.83, 4.88, col, 0.046);
    if (rank >= 4) line(c, [x - 0.21, y + 0.26, x, y + 0.32, x + 0.28, y + 0.08], col, 0.07);
  };
  followThrough.chainsaw = function (c, col, q, rank) {
    var x = 0.54 + q * 0.46;
    line(c, [x - 0.64, -0.29, x, -0.47, x + 0.17, -0.40], '#F3A952', 0.076);
    if (rank >= 3) line(c, [x - 0.48, 0.33, x + 0.02, 0.43, x + 0.25, 0.35], CORE, 0.07);
    if (rank >= 4) line(c, [x - 0.78, -0.58, x - 0.46, -0.73, x - 0.12, -0.64, x + 0.27, -0.82], '#F3A952', 0.054);
  };

  // Keep the established evolution centrepiece and give each a different exit motion.
  forms.arcClosure = function (c, col, q) {
    forms.links(c, col, q, 3);
    var d = 1.1 - 0.47 * q;
    line(c, [-d, 0.44, -0.31, 0.60, 0.03, 0.39, 0.45, 0.56, d, 0.20], '#B9F5FF', 0.078);
  };
  forms.carBackblast = function (c, col, q) {
    forms.blast(c, col, q, 3);
    var d = 0.58 + 0.66 * q;
    line(c, [-d, -0.36, -d * 0.68, -0.31, -d * 0.84, 0.31, -d * 1.08, 0.42], CORE, 0.11);
    line(c, [d * 0.72, -0.39, d * 0.56, -0.02, d * 0.86, 0.30, d * 1.12, 0.33], col, 0.09);
  };
  forms.lakeBanks = function (c, col, q) {
    forms.splash(c, col, q, 3);
    var d = 0.64 + 0.52 * q;
    arc(c, 0, 0.12, d, d * 0.47, 0.30, 2.75, '#BAE9F4', 0.082);
    arc(c, 0, -0.14, d, d * 0.44, 3.28, 5.97, '#64ABC7', 0.072);
  };
  forms.finaleCanopy = function (c, col, q) {
    forms.burst(c, col, q, 3);
    for (var i = -1; i <= 1; i++) {
      var x = i * (0.41 + q * 0.38), y = -0.55 + 0.71 * q * q;
      line(c, [x * 0.63, y - 0.48, x, y - 0.27, x + i * 0.13, y], i ? '#ED9CBF' : CORE, 0.065);
    }
  };

  I.draw = function (c, R, p, settings) {
    var q = 1 - p.t / p.T, size = p.w * R.ppm, still = settings.reduceMotion;
    var wy = p.y + (p.layer === 'air' ? 0.49 : 0), x = R.X(p.x), y = R.Y(wy);
    if (R.toScreen) {
      var screen = R.toScreen(p.x, wy), pad = size * 1.7;
      if (screen.x < -pad || screen.x > R.W + pad || screen.y < -pad || screen.y > R.H + pad) return;
    }
    var phase = still ? 0.35 : q;
    var s = size * (0.74 + 0.26 * (1 - Math.pow(1 - phase, 3)));
    c.save();
    c.globalAlpha = Math.min(1, (1 - q) * 1.75) * (settings.dense ? 0.82 : 1);
    c.translate(x, y); c.rotate(p.a); c.scale(s, s);
    c.lineJoin = 'round'; c.lineCap = 'round';
    if (p.follow) echo(c, 0.84, function () { p.follow(c, p.col, phase, p.rank); });
    forms[p.form](c, p.col, phase, settings.dense ? Math.min(2, p.beats) : p.beats);
    c.restore();
  };

  return I;
})();
