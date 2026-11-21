// Local, material-specific environment impact. Effects use sim time and never alter damage or collision.
P.StreetImpactFx = (function () {
  var F = {}, run, beats = [], TAU = Math.PI * 2, INK = '#16141C';
  var PALETTE = {
    wood: ['#8A5134', '#EAB66F', '#FFD99A'], market: ['#B14A2D', '#FFD060', '#70B361'],
    tea: ['#9F6944', '#FECC8F', '#DAF0E9'], glass: ['#426D80', '#B7E3EF', '#F0FDFF'],
    foam: ['#CCD6DE', '#EDF9FE', '#FFFFFF'], car: ['#315354', '#CF552B', '#FFE6A1'],
    gas: ['#C43924', '#FFAB37', '#FFF1AA'], grill: ['#40333A', '#D94927', '#FFF092'],
    booth: ['#477467', '#D0A776', '#FFF0BB']
  };
  var BREAK = { simit: 'market', cart: 'market', cm_cart: 'market', cm_pyramid: 'market', lx_stall: 'market',
    cm_tea: 'tea', tavlatable: 'tea', tables: 'tea', extinguisher: 'foam' };
  function quiet() { return P.Settings && (P.Settings.reduceMotion || P.Settings.reduceFlash); }
  F.onEvent = function (ev, s) {
    var boom = ev.type === 'envExplode' || ev.type === 'explode' && !ev.streetBlast, k = ev.kind && ev.kind.replace(/\d+$/, '');
    if (!boom && ev.type !== 'envBreak' && ev.type !== 'propBreak') return;
    if (run !== s) { run = s; beats = []; }
    var form = boom ? (ev.src || 'gas') : BREAK[k] || (ev.mat === 'glass' ? 'glass' : 'wood');
    beats.push({ x: ev.x, y: ev.y, t: s.t, seed: (ev.x * 13 || 0) + (ev.y * 7 || 0), r: ev.r || 1, form: form, boom: boom });
    if (beats.length > 20) beats.shift();
  };
  function piece(c, x, y, w, h, angle, col, form, i) {
    c.save(); c.translate(x, y); c.rotate(angle); c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = 1.1; c.beginPath();
    if (form === 'market' && i % 3 === 0 || form === 'foam') c.ellipse(0, 0, w * .45, h * .65, 0, 0, TAU);
    else if (form === 'glass') { c.moveTo(-w * .5, h * .45); c.lineTo(w * .18, -h * .65); c.lineTo(w * .55, h * .24); c.closePath(); }
    else { c.moveTo(-w * .5, h * .5); c.lineTo(-w * .5, -h * .4); c.lineTo(w * .28, -h * .55); c.lineTo(w * .5, h * .3); c.closePath(); }
    c.fill(); if (form !== 'foam') c.stroke();
    c.restore();
  }
  function eject(c, b, X, Y, u, p, colors, still) {
    var count = b.boom ? 16 : b.form === 'foam' ? 12 : 10, range = b.boom ? b.r * .98 : 1.12;
    for (var i = 0; i < count; i++) {
      var a = b.seed + i * 2.399, v = (.48 + (i * 17 % 9) * .065), q = (1 - Math.pow(1 - p, 2)) * v;
      var travel = (still ? .65 : q) * range * u, h = Math.sin(Math.PI * p) * u * (b.boom ? .9 : .59) * v;
      var w = (b.boom && i % 4 === 0 ? .37 : .12 + i % 4 * .045) * u;
      c.globalAlpha = Math.min(1, (1 - p) * 3.5);
      piece(c, X + Math.cos(a) * travel, Y + Math.sin(a) * travel * .68 - (still ? 0 : h),
        w, w * (i % 2 ? .58 : .88), a + (still ? 0 : 5 * p), colors[i % 3], b.form, i);
    }
  }
  function blast(c, b, X, Y, u, p, colors) {
    var q = Math.min(1, p * 2.7), d = b.r * u * (.13 + q * .87);
    c.globalAlpha = Math.pow(1 - p, 1.7);
    c.strokeStyle = colors[2]; c.lineWidth = 1.5 + 4 * (1 - q);
    c.beginPath(); c.ellipse(X, Y, d, .61 * d, 0, 0, TAU); c.stroke();
    c.fillStyle = colors[1]; c.strokeStyle = INK; c.lineWidth = 2;
    c.beginPath();
    for (var i = 0; i < 24; i++) {
      var a = i * TAU / 24 + b.seed, w = u * (.3 + .79 * q) * (i % 2 ? .62 : 1.08);
      var x = X + Math.cos(a) * w, y = Y + Math.sin(a) * w * .72 - u * q * (b.form === 'gas' ? .8 : .38);
      if (i) c.lineTo(x, y); else c.moveTo(x, y);
    }
    c.closePath(); c.fill(); c.stroke();
  }
  F.air = function (R, s) {
    if (s !== run) return;
    var c = R.ctx, u = R.ppm, still = quiet();
    beats = beats.filter(function (b) { return s.t - b.t < (b.boom ? .95 : .66); });
    beats.forEach(function (b) {
      var p = Math.max(0, s.t - b.t) / (b.boom ? .95 : .66), X = R.X(b.x), Y = R.Y(b.y);
      if (Math.abs(X) > R.W / 2 + 3 * u || Math.abs(Y) > R.H / 2 + 3 * u) return;
      var colors = PALETTE[b.form] || PALETTE.gas;
      c.save();
      if (b.boom && !still) blast(c, b, X, Y, u, p, colors);
      eject(c, b, X, Y, u, p, colors, still);
      c.restore();
    });
  };
  return F;
})();
