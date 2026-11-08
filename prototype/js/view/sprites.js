// Procedural character sprites (view only): 3/4 top-down figures standing on their feet at (x, y).
// Comic-ink style per DS 6: #14151F outlines, flat fills, variants by skin/outfit, walk cycle from distance walked.
P.Sprites = (function () {
  var S = {}, INK = '#14151F';
  var SKIN = ['#F1C9A5', '#E0AC80', '#C68B5E', '#9C6B47'];
  var ZSKIN = ['#B4D08E', '#9FC27E', '#C2C98F', '#94B67A'];
  var SHIRT = ['#3D6E9E', '#B5442E', '#E2D6C0', '#4F7A4A', '#7A4F8C', '#C9A13B', '#2F3A4A', '#A8475F'];
  var ZSHIRT = ['#5B7A96', '#9A5440', '#BDB4A0', '#5E7A55', '#7A6088', '#A8924E', '#4A5468', '#8C5262'];
  var PANTS = ['#2B3346', '#3E3A35', '#4A5A6E', '#1E1E24'];
  var HAIR = ['#1E1712', '#3B2A1E', '#6B4A2E', '#14151F', '#8A8F98'];

  function limb(c, x0, y0, x1, y1, col, w) {
    c.lineCap = 'round';
    c.strokeStyle = INK; c.lineWidth = w + 3; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  }
  function blob(c, x, y, rx, ry, fill) {
    c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    c.fillStyle = fill; c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
  }
  function torso(c, x, y, w, h, fill, lean) {
    c.beginPath();
    if (c.roundRect) c.roundRect(x - w / 2 + lean, y - h, w, h, w * 0.35); else c.rect(x - w / 2 + lean, y - h, w, h);
    c.fillStyle = fill; c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
  }
  S.shadow = function (c, X, Y, u, k) {
    c.fillStyle = 'rgba(0,0,0,' + (0.32 * (k === undefined ? 1 : k)) + ')';
    c.beginPath(); c.ellipse(X, Y, 0.34 * u, 0.13 * u, 0, 0, Math.PI * 2); c.fill();
  };

  // o: { u, face(-1|1), phase, zombie, skin, shirt, pants, hair, arms('reach'|'pump'|'idle'|'knife'), lean, flash, eyes, hunch, blood, knifeA }
  S.person = function (c, X, Y, o) {
    var u = o.u, f = o.face || 1, ph = o.phase || 0, sw = Math.sin(ph), cw = Math.cos(ph);
    var lean = (o.lean || 0) * u * f, hunch = o.hunch ? 0.12 * u : 0, bob = Math.abs(cw) * 0.03 * u;
    var white = o.flash > 0, skin = white ? '#FFFFFF' : o.skin, shirt = white ? '#FFFFFF' : o.shirt, pants = white ? '#FFFFFF' : o.pants;
    var hipY = Y - 0.36 * u - bob, legW = 0.11 * u, stride = 0.13 * u * (o.still ? 0 : 1);
    limb(c, X - 0.07 * u, hipY, X - 0.07 * u + sw * stride * f, Y - 0.02 * u - Math.max(0, -cw) * 0.05 * u, pants, legW);
    limb(c, X + 0.07 * u, hipY, X + 0.07 * u - sw * stride * f, Y - 0.02 * u - Math.max(0, cw) * 0.05 * u, pants, legW);
    var top = hipY + 0.02 * u, shY = top - 0.40 * u + hunch, armW = 0.09 * u;
    var back = { x: X - 0.17 * u * f + lean, y: shY + 0.05 * u }, front = { x: X + 0.17 * u * f + lean, y: shY + 0.05 * u };
    var arms = o.arms || 'idle', ha, hb;
    if (arms === 'reach') { ha = { x: back.x + 0.40 * u * f, y: back.y + 0.02 * u + sw * 0.04 * u }; hb = { x: front.x + 0.42 * u * f, y: front.y - 0.02 * u - sw * 0.04 * u }; }
    else if (arms === 'pump') { ha = { x: back.x + sw * 0.18 * u * f, y: back.y + 0.24 * u }; hb = { x: front.x - sw * 0.18 * u * f, y: front.y + 0.24 * u }; }
    else if (arms === 'flail') { ha = { x: back.x - 0.1 * u * f, y: back.y - 0.3 * u - sw * 0.06 * u }; hb = { x: front.x + 0.1 * u * f, y: front.y - 0.3 * u + sw * 0.06 * u }; }
    else { ha = { x: back.x - 0.02 * u * f + sw * 0.05 * u * f, y: back.y + 0.30 * u }; hb = { x: front.x + 0.02 * u * f - sw * 0.05 * u * f, y: front.y + 0.30 * u }; }
    limb(c, back.x, back.y, ha.x, ha.y, shirt, armW);
    torso(c, X, top, 0.40 * u, 0.44 * u - hunch, shirt, lean);
    if (o.blood && !white) {
      c.fillStyle = 'rgba(110,18,24,0.75)';
      c.beginPath(); c.ellipse(X + lean + 0.06 * u * (o.blood - 2), top - 0.2 * u, 0.09 * u, 0.12 * u, 0.5, 0, Math.PI * 2); c.fill();
    }
    if (arms === 'knife') { S.knifeArm(c, front, u, f, o.knifeA, skin, shirt); }
    else limb(c, front.x, front.y, hb.x, hb.y, shirt, armW);
    if (arms !== 'knife') { blob(c, ha.x, ha.y, 0.055 * u, 0.055 * u, skin); blob(c, hb.x, hb.y, 0.055 * u, 0.055 * u, skin); }
    var hx = X + lean + 0.04 * u * f + (o.hunch ? 0.1 * u * f : 0), hy = shY - 0.17 * u;
    blob(c, hx, hy, 0.2 * u, 0.2 * u, skin);
    if (!white) {
      c.fillStyle = o.hair; c.beginPath(); c.arc(hx - 0.02 * u * f, hy - 0.03 * u, 0.2 * u, Math.PI * 1.05, Math.PI * 1.95); c.fill();
    }
    if (o.eyes) {
      c.fillStyle = o.eyes;
      c.beginPath(); c.arc(hx + 0.07 * u * f, hy + 0.01 * u, 0.035 * u, 0, Math.PI * 2); c.arc(hx + 0.15 * u * f, hy + 0.01 * u, 0.03 * u, 0, Math.PI * 2); c.fill();
    } else if (!white) {
      c.fillStyle = INK; c.beginPath(); c.arc(hx + 0.1 * u * f, hy + 0.01 * u, 0.025 * u, 0, Math.PI * 2); c.fill();
    }
    if (o.zombie && !white) {
      c.strokeStyle = 'rgba(20,21,31,0.5)'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(hx + 0.05 * u * f, hy + 0.1 * u); c.lineTo(hx + 0.15 * u * f, hy + 0.08 * u); c.stroke();
    }
  };

  // Knife arm: the hand orbits the shoulder by knifeA (radians, screen space). Blade points out from the hand.
  S.knifeArm = function (c, sh, u, f, a, skin, sleeve) {
    var ang = a === undefined ? (f > 0 ? 0.6 : Math.PI - 0.6) : a;
    var hx = sh.x + Math.cos(ang) * 0.28 * u, hy = sh.y + Math.sin(ang) * 0.28 * u;
    limb(c, sh.x, sh.y, hx, hy, sleeve, 0.09 * u);
    var bx = hx + Math.cos(ang) * 0.42 * u, by = hy + Math.sin(ang) * 0.42 * u, nx = -Math.sin(ang) * 0.06 * u, ny = Math.cos(ang) * 0.06 * u;
    c.beginPath(); c.moveTo(hx + nx, hy + ny); c.lineTo(bx, by); c.lineTo(hx - nx * 0.4, hy - ny * 0.4); c.closePath();
    c.fillStyle = '#E6EBF0'; c.fill(); c.strokeStyle = INK; c.lineWidth = 1.8; c.stroke();
    blob(c, hx, hy, 0.06 * u, 0.06 * u, skin);
  };

  S.crawler = function (c, X, Y, o) {
    var u = o.u, f = o.face || 1, sw = Math.sin(o.phase || 0), skin = o.flash > 0 ? '#FFFFFF' : o.skin, shirt = o.flash > 0 ? '#FFFFFF' : o.shirt;
    limb(c, X - 0.1 * u * f, Y - 0.12 * u, X + 0.45 * u * f, Y - 0.05 * u + sw * 0.08 * u, shirt, 0.09 * u);
    limb(c, X - 0.1 * u * f, Y - 0.22 * u, X + 0.5 * u * f, Y - 0.25 * u - sw * 0.08 * u, shirt, 0.09 * u);
    blob(c, X - 0.12 * u * f, Y - 0.17 * u, 0.36 * u, 0.17 * u, shirt);
    blob(c, X + 0.3 * u * f, Y - 0.2 * u, 0.17 * u, 0.16 * u, skin);
    if (o.flash <= 0) { c.fillStyle = '#E8FF6B'; c.beginPath(); c.arc(X + 0.38 * u * f, Y - 0.2 * u, 0.03 * u, 0, Math.PI * 2); c.fill(); }
  };

  S.palette = function (variant, zombie) {
    var v = variant || 0;
    return { skin: zombie ? ZSKIN[v % 4] : SKIN[v % 4], shirt: zombie ? ZSHIRT[v] : SHIRT[v], pants: PANTS[(v >> 1) % 4], hair: HAIR[(v * 3) % 5] };
  };

  // Enemy at world pos; R provides X/Y/ppm. Handles emerge, turning, runner hunch, crawler.
  S.enemy = function (R, e, hero) {
    var c = R.ctx, u = R.ppm, X = R.X(e.x), Y = R.Y(e.y - e.r * 0.6), face = hero.x >= e.x ? 1 : -1;
    var human = e.state === 'dormant' || ((e.civ || e.type === 'diner') && e.state === 'turning');
    var pal = S.palette(e.variant, !human), emerge = e.door ? Math.min(1, (e.age || 0) / 0.3) : 1;
    if (e.state === 'turning') X += (Math.random() - 0.5) * 3;
    c.save();
    if (emerge < 1) { c.globalAlpha = emerge; c.translate(X, Y); c.scale(0.7 + 0.3 * emerge, 0.7 + 0.3 * emerge); c.translate(-X, -Y); }
    S.shadow(c, X, Y, u * (e.type === 'crawler' ? 1.5 : 1.15));
    var o = { u: u * (e.type === 'runner' ? 1.08 : 1.14), face: face, phase: (e.walk || 0) * 5.5, zombie: !human, skin: pal.skin, shirt: pal.shirt,
              pants: pal.pants, hair: pal.hair, flash: e.flash, blood: human ? 0 : 1 + (e.variant % 3) };
    if (e.type === 'crawler') S.crawler(c, X, Y, o);
    else {
      o.arms = human ? (e.state === 'turning' ? 'flail' : 'idle') : e.type === 'runner' ? 'pump' : 'reach';
      o.eyes = human ? null : e.type === 'runner' ? '#FF5A3D' : '#DDF5D0';
      o.hunch = e.type === 'runner' && !human; o.lean = e.type === 'runner' ? 0.12 : 0.04;
      o.still = e.state === 'dormant';
      if (e.type === 'runner' && !human) o.phase *= 1.3;
      S.person(c, X, Y, o);
    }
    if (e.burn && e.burn.length) {
      var t = performance.now() / 90;
      c.fillStyle = 'rgba(255,140,40,0.75)';
      for (var i = 0; i < 3; i++) { c.beginPath(); c.ellipse(X + (i - 1) * 0.12 * u, Y - (0.5 + 0.15 * Math.sin(t + i)) * u, 0.06 * u, 0.13 * u, 0, 0, Math.PI * 2); c.fill(); }
    }
    c.restore();
  };

  S.corpse = function (R, p) {
    var c = R.ctx, u = R.ppm, X = R.X(p.x), Y = R.Y(p.y - 0.2), k = 1 - p.t / p.T, fall = Math.min(1, k / 0.45), face = p.dx >= 0 ? 1 : -1;
    var pal = S.palette(p.variant, true);
    c.save(); c.globalAlpha = k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4;
    c.translate(X + face * fall * 0.25 * u, Y); c.rotate(face * fall * Math.PI / 2 * 0.95); c.translate(-X, -Y);
    S.person(c, X, Y, { u: u, face: face, phase: 0, zombie: true, skin: pal.skin, shirt: pal.shirt, pants: pal.pants, hair: pal.hair, arms: 'flail', still: true, blood: 2 });
    c.restore();
  };

  S.civilian = function (R, v) {
    var c = R.ctx, u = R.ppm, X = R.X(v.x), Y = R.Y(v.y), pal = S.palette(v.variant, false);
    S.shadow(c, X, Y, u);
    S.person(c, X, Y, { u: u, face: v.drift >= 0 ? 1 : -1, phase: v.walk * 4.5, skin: pal.skin, shirt: pal.shirt, pants: pal.pants, hair: pal.hair, arms: 'pump', lean: 0.05 });
    if (v.scream > 0) {
      c.font = 'italic 900 ' + Math.round(0.5 * u) + 'px ' + 'system-ui'; c.textAlign = 'center'; c.lineWidth = 4; c.strokeStyle = INK; c.fillStyle = '#FFD166';
      c.strokeText('!', X + 0.25 * u, Y - 1.35 * u); c.fillText('!', X + 0.25 * u, Y - 1.35 * u);
    }
  };

  return S;
})();
