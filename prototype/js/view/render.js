// Canvas renderer for the run: camera transform, actors, pickups, effects, lighting (DS 6 hierarchy:
// player > telegraphs > enemies > pickups > player projectiles > environment).
P.Render = (function () {
  var R = { ctx: null, canvas: null, W: 390, H: 844, dpr: 1, ppm: 32.5, cam: null };
  var COL = { walker: '#4E5A44', runner: '#6E7D5C', crawler: '#3C4535', diner: '#4E5A44', outline: '#20251C', eye: '#DDF5D0' };

  R.init = function (canvas) { R.canvas = canvas; R.ctx = canvas.getContext('2d'); };
  R.resize = function (scale) {
    R.dpr = Math.min(window.devicePixelRatio || 1, 3) * scale;
    R.canvas.width = Math.round(R.W * R.dpr); R.canvas.height = Math.round(R.H * R.dpr);
  };
  R.X = function (x) { return (x - R.cam.x) * R.ppm; };
  R.Y = function (y) { return -(y - R.cam.y) * R.ppm; };
  R.toScreen = function (x, y) {
    return { x: R.W / 2 + R.cam.ox + R.X(x), y: R.H / 2 + R.cam.oy + R.Y(y) };
  };

  function circle(x, y, r, fill, stroke, lw) {
    var c = R.ctx;
    c.beginPath(); c.arc(R.X(x), R.Y(y), r * R.ppm, 0, Math.PI * 2);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 2; c.stroke(); }
  }

  function drawEnemy(e, hero) {
    var c = R.ctx, x = e.x, y = e.y, r = e.r, jit = 0;
    if (e.state === 'turning') jit = (Math.random() - 0.5) * 0.08;
    c.fillStyle = 'rgba(0,0,0,0.25)';
    c.beginPath(); c.ellipse(R.X(x), R.Y(y - r * 0.55), r * 1.05 * R.ppm, r * 0.45 * R.ppm, 0, 0, Math.PI * 2); c.fill();
    var human = e.state === 'dormant' || ((e.civ || e.type === 'diner') && e.state === 'turning');
    var fill = e.flash > 0 ? '#FFFFFF' : human ? '#C9A27E' : COL[e.type];
    if (e.type === 'crawler') {
      c.fillStyle = fill; c.strokeStyle = COL.outline; c.lineWidth = 2;
      c.beginPath(); c.ellipse(R.X(x), R.Y(y), r * 1.3 * R.ppm, r * 0.7 * R.ppm, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    } else {
      circle(x + jit, y, r, fill, COL.outline, 2);
      if (human) circle(x + jit, y + r * 0.9, r * 0.55, '#F4EBDD', COL.outline, 2);
    }
    if (!human) {
      var dx = hero.x - x, dy = hero.y - y, d = Math.hypot(dx, dy) || 1, ex = dx / d * r * 0.45, ey = dy / d * r * 0.45;
      var px = -dy / d * r * 0.3, py = dx / d * r * 0.3;
      circle(x + ex + px, y + ey + py, 0.05, COL.eye); circle(x + ex - px, y + ey - py, 0.05, COL.eye);
    }
    if (e.type === 'runner' && e.state === 'active') {
      c.strokeStyle = 'rgba(244,235,221,0.5)'; c.lineWidth = 2;
      var dx2 = hero.x - x, dy2 = hero.y - y, d2 = Math.hypot(dx2, dy2) || 1;
      c.beginPath(); c.moveTo(R.X(x - dx2 / d2 * r * 1.2), R.Y(y - dy2 / d2 * r * 1.2)); c.lineTo(R.X(x - dx2 / d2 * r * 2.4), R.Y(y - dy2 / d2 * r * 2.4)); c.stroke();
    }
    if (e.burn && e.burn.length) circle(x, y, r * 0.5, 'rgba(255,140,40,0.6)');
  }

  function drawHero(s) {
    var h = s.hero, c = R.ctx, ring = 0.68 + 0.04 * Math.sin(performance.now() / 300);
    c.setLineDash([3, 5]); circle(h.x, h.y, h.pickupRadius, null, 'rgba(61,220,255,0.8)', 1.2); c.setLineDash([]);
    c.strokeStyle = '#3DDCFF'; c.lineWidth = 3.5;
    c.beginPath(); c.ellipse(R.X(h.x), R.Y(h.y - 0.25), ring * R.ppm, ring * 0.41 * R.ppm, 0, 0, Math.PI * 2); c.stroke();
    c.globalAlpha = h.invuln > 0 ? 0.6 : 1;
    circle(h.x, h.y, 0.37, '#D7263D', '#14151F', 3);
    circle(h.x + h.fx * 0.08, h.y + 0.43, 0.22, '#F4EBDD', '#14151F', 3);
    c.globalAlpha = 1;
  }

  function drawDrops(s) {
    var c = R.ctx;
    s.drops.forEach(function (d) {
      var X = R.X(d.x), Y = R.Y(d.y), k = R.ppm;
      if (d.kind === 'xp') {
        c.fillStyle = '#5BD16E'; c.strokeStyle = '#14151F'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(X, Y - 0.2 * k); c.quadraticCurveTo(X + 0.14 * k, Y, X, Y + 0.1 * k); c.quadraticCurveTo(X - 0.14 * k, Y, X, Y - 0.2 * k); c.fill(); c.stroke();
      } else if (d.kind === 'jeton') { circle(d.x, d.y, 0.14, '#E9A23B', '#14151F', 1.5); }
      else { circle(d.x, d.y, 0.2, null, '#C98A3A', 0.12 * k); circle(d.x, d.y, 0.2, null, '#14151F', 1); }
    });
  }

  function drawProjectiles(s) {
    s.projs.forEach(function (p) {
      var f = p.t / p.T, x = p.x0 + (p.x1 - p.x0) * f, y = p.y0 + (p.y1 - p.y0) * f, z = 4 * 1.4 * f * (1 - f);
      circle(x, y, 0.12, 'rgba(0,0,0,0.25)');
      R.ctx.fillStyle = '#B5651D'; R.ctx.strokeStyle = '#F4EBDD'; R.ctx.lineWidth = 2;
      R.ctx.fillRect(R.X(x) - 4, R.Y(y + z) - 6, 8, 12); R.ctx.strokeRect(R.X(x) - 4, R.Y(y + z) - 6, 8, 12);
    });
  }

  function drawZonesAndTelegraphs(s) {
    var c = R.ctx;
    s.zones.forEach(function (z) {
      var a = Math.min(1, z.t / 0.3);
      circle(z.x, z.y, z.r, z.kind === 'fire' ? 'rgba(255,110,30,' + (0.35 * a) + ')' : 'rgba(181,101,29,' + (0.35 * a) + ')');
    });
    s.dir.telegraphs.forEach(function (t) {
      var X = R.X(t.x), Y = R.Y(t.y), r = t.r * R.ppm;
      c.save(); c.beginPath(); c.arc(X, Y, r, 0, Math.PI * 2); c.clip();
      c.fillStyle = 'rgba(255,77,46,0.18)'; c.fillRect(X - r, Y - r, 2 * r, 2 * r);
      c.strokeStyle = 'rgba(255,77,46,0.55)'; c.lineWidth = 3;
      for (var i = -2 * r; i < 2 * r; i += 8) { c.beginPath(); c.moveTo(X + i, Y - r); c.lineTo(X + i + 2 * r, Y + r); c.stroke(); }
      c.restore();
      c.setLineDash([10, 6]); c.strokeStyle = '#FF4D2E'; c.lineWidth = 3; c.beginPath(); c.arc(X, Y, r, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
      c.lineWidth = 5; c.beginPath(); c.arc(X, Y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (t.t / t.T)); c.stroke();
    });
  }

  function drawSplats() {
    P.Fx.parts.forEach(function (p) {
      if (p.kind === 'splat') circle(p.x, p.y, p.r, 'rgba(20,21,31,' + (0.45 * Math.min(1, p.t / p.T * 3)) + ')');
    });
  }

  function drawFx() {
    var c = R.ctx, F = P.Fx;
    F.parts.forEach(function (p) {
      var a = p.t / p.T;
      if (p.kind === 'ash') circle(p.x, p.y, p.r * (1.6 - a), 'rgba(220,220,210,' + (0.5 * a) + ')');
      else if (p.kind === 'spark' || p.kind === 'ember') circle(p.x, p.y, 0.07, p.kind === 'spark' ? 'rgba(255,201,60,' + a + ')' : 'rgba(255,110,30,' + a + ')');
      else if (p.kind === 'shard') circle(p.x, p.y, 0.06, 'rgba(244,235,221,' + a + ')');
      else if (p.kind === 'dust') circle(p.x, p.y, 0.5 * (1.5 - a), 'rgba(184,184,184,' + (0.5 * a) + ')');
    });
    F.swings.forEach(function (w) {
      var a = Math.atan2(-w.ay, w.ax), half = w.arc * Math.PI / 360;
      c.fillStyle = 'rgba(255,255,255,' + (0.45 * w.t / w.T) + ')';
      c.beginPath(); c.moveTo(R.X(w.x), R.Y(w.y)); c.arc(R.X(w.x), R.Y(w.y), w.range * R.ppm, a - half, a + half); c.closePath(); c.fill();
    });
    F.rings.forEach(function (g) {
      var f = 1 - g.t / g.T;
      c.globalAlpha = 1 - f; circle(g.x, g.y, g.r * (0.6 + 0.4 * f), null, g.color, 4); c.globalAlpha = 1;
    });
  }

  R.frame = function (s, extraDraw) {
    var c = R.ctx, cam = P.Fx.cam;
    R.cam = cam;
    R.ppm = R.W / cam.w * cam.zoom;
    c.setTransform(R.dpr, 0, 0, R.dpr, 0, 0);
    c.fillStyle = '#14151F'; c.fillRect(0, 0, R.W, R.H);
    c.save();
    c.translate(R.W / 2 + cam.ox, R.H / 2 + cam.oy); c.rotate(cam.rot);
    var half = P.viewHalfH(cam.w) + 3, y0 = cam.y - half, y1 = cam.y + half;
    P.RenderWorld.drawGround(R, s, y0, y1);
    if (y0 < 1) P.RenderWorld.drawRestaurant(R, s);
    P.RenderWorld.drawProps(R, s);
    drawZonesAndTelegraphs(s);
    drawSplats();
    drawDrops(s);
    s.dir.civilians.forEach(function (v) { circle(v.x, v.y, 0.3, '#C9A27E', '#14151F', 1.5); circle(v.x, v.y + 0.3, 0.17, '#F4EBDD', '#14151F', 1.5); });
    s.enemies.forEach(function (e) { if (Math.abs(e.y - cam.y) < half) drawEnemy(e, s.hero); });
    if (extraDraw) extraDraw(R, s);
    drawFx();
    drawHero(s);
    drawProjectiles(s);
    if (y1 > 140 && y0 < 165) P.RenderWorld.drawTram(R, s);
    if (y1 > 222) P.RenderWorld.drawScaffold(R, s);
    P.RenderOverlay.worldText(R, s);
    c.restore();
    P.RenderOverlay.screen(R, s);
  };

  R.circle = circle;
  return R;
})();

// World-space text (bubbles, damage numbers, lettering, prompt arrows) and screen-space lighting.
P.RenderOverlay = (function () {
  var O = {};
  function bubble(R, x, y, text, maxW) {
    var c = R.ctx; c.font = '600 14px system-ui, sans-serif';
    var words = text.split(' '), lines = [], cur = '';
    words.forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
    lines.push(cur);
    var w = Math.max.apply(null, lines.map(function (l) { return c.measureText(l).width; })) + 16, h = lines.length * 18 + 10;
    var X = R.X(x) - w / 2, Y = R.Y(y) - h - 10;
    c.fillStyle = '#FFFFFF'; c.strokeStyle = '#14151F'; c.lineWidth = 2;
    c.beginPath(); c.roundRect ? c.roundRect(X, Y, w, h, 10) : c.rect(X, Y, w, h); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(R.X(x) - 6, Y + h); c.lineTo(R.X(x), Y + h + 9); c.lineTo(R.X(x) + 6, Y + h); c.fill();
    c.fillStyle = '#14151F'; c.textAlign = 'center'; c.textBaseline = 'top';
    lines.forEach(function (l, i) { c.fillText(l, R.X(x), Y + 6 + i * 18); });
  }

  O.worldText = function (R, s) {
    var c = R.ctx, b = s.dir.barks.cur;
    s.dir.bubbles.forEach(function (q) { bubble(R, q.x, q.y + 0.3, q.text, 60); });
    if (b) {
      var who = b.who === 'shop' ? { x: 6.4, y: 226 } : { x: s.hero.x, y: s.hero.y + 0.8 };
      bubble(R, who.x, who.y, P.line(b.id).text, 230);
    }
    P.Fx.nums.forEach(function (n) {
      var f = 1 - n.t / n.T, size = n.crit ? 18 : 14, sc = f < 0.15 ? 1.2 - f / 0.15 * 0.2 : 1;
      c.font = '900 ' + Math.round(size * sc) + 'px "Barlow Condensed", "Arial Narrow", system-ui';
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 3; c.strokeStyle = '#14151F';
      c.globalAlpha = n.t < 0.2 ? n.t / 0.2 : 1;
      var X = R.X(n.x), Y = R.Y(n.y + 0.5 + P.CFG.feel.dmgNumberRise * f), txt = String(Math.round(n.val));
      c.strokeText(txt, X, Y); c.fillStyle = n.crit ? '#E9A23B' : '#FFFFFF'; c.fillText(txt, X, Y);
      c.globalAlpha = 1;
    });
    P.Fx.letters.forEach(function (l) {
      c.font = '900 34px "Barlow Condensed", "Arial Narrow", system-ui'; c.textAlign = 'center'; c.lineWidth = 5;
      c.strokeStyle = '#14151F'; c.fillStyle = '#F4EBDD'; c.globalAlpha = Math.min(1, l.t / 0.3);
      c.strokeText(l.text, R.X(l.x), R.Y(l.y)); c.fillText(l.text, R.X(l.x), R.Y(l.y)); c.globalAlpha = 1;
    });
    var pr = s.dir.tut.active;
    if (pr && pr.target) arrow(R, s.hero, pr.target);
  };

  function arrow(R, h, t) {
    var c = R.ctx, dx = t.x - h.x, dy = t.y - h.y, d = Math.hypot(dx, dy);
    if (d < 1.2) return;
    var ux = dx / d, uy = dy / d, sx = h.x + ux * 1.0, sy = h.y + uy * 1.0, ex = h.x + ux * Math.min(d - 0.4, 2.4), ey = h.y + uy * Math.min(d - 0.4, 2.4);
    c.strokeStyle = '#FFFFFF'; c.fillStyle = '#FFFFFF'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(R.X(sx), R.Y(sy)); c.lineTo(R.X(ex), R.Y(ey)); c.stroke();
    var a = Math.atan2(-(uy), ux);
    c.beginPath(); c.moveTo(R.X(ex) + Math.cos(a) * 10, R.Y(ey) + Math.sin(a) * 10);
    c.lineTo(R.X(ex) + Math.cos(a + 2.4) * 10, R.Y(ey) + Math.sin(a + 2.4) * 10);
    c.lineTo(R.X(ex) + Math.cos(a - 2.4) * 10, R.Y(ey) + Math.sin(a - 2.4) * 10); c.fill();
  }

  var LIGHT = [ { y: -5, c: [255, 181, 102, 0.10] }, { y: 30, c: [233, 162, 59, 0.08] }, { y: 95, c: [233, 140, 59, 0.13] },
                { y: 160, c: [255, 111, 168, 0.10] }, { y: 205, c: [27, 73, 101, 0.30] } ];
  function light(y) {
    if (y <= LIGHT[0].y) return LIGHT[0].c;
    for (var i = 1; i < LIGHT.length; i++) {
      if (y <= LIGHT[i].y) {
        var a = LIGHT[i - 1], b = LIGHT[i], f = (y - a.y) / (b.y - a.y);
        return a.c.map(function (v, k) { return v + (b.c[k] - v) * f; });
      }
    }
    return LIGHT[LIGHT.length - 1].c;
  }

  O.screen = function (R, s) {
    var c = R.ctx, W = R.W, H = R.H, l = light(s.hero.y);
    c.fillStyle = 'rgba(' + Math.round(l[0]) + ',' + Math.round(l[1]) + ',' + Math.round(l[2]) + ',' + l[3].toFixed(3) + ')';
    c.fillRect(0, 0, W, H);
    var g = c.createRadialGradient(W / 2, H * 0.65, 0, W / 2, H * 0.65, H * 0.75);
    g.addColorStop(0.6, 'rgba(27,73,101,0)'); g.addColorStop(1, 'rgba(27,73,101,0.45)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    if (s.hero.hp / s.hero.maxHp < P.CFG.feel.lowHpFrac && s.mode === 'play') {
      var p = 0.2 + 0.15 * Math.sin(performance.now() / 1000 * Math.PI * 2);
      var g2 = c.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.7);
      g2.addColorStop(0, 'rgba(215,38,61,0)'); g2.addColorStop(1, 'rgba(215,38,61,' + p.toFixed(3) + ')');
      c.fillStyle = g2; c.fillRect(0, 0, W, H);
    }
  };
  return O;
})();
