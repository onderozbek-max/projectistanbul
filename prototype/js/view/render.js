// Canvas renderer for the run: camera transform, actors, pickups, effects, lighting (DS 6 hierarchy:
// player > telegraphs > enemies > pickups > player projectiles > environment). v0.2: sprite figures via P.Sprites.
P.Render = (function () {
  var R = { ctx: null, canvas: null, W: 390, H: 844, dpr: 1, ppm: 32.5, cam: null };
  var heroAnim = { x: 0, y: 0, walk: 0 };

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

  function knifeAngle(face) {
    var w = P.Fx.swings.filter(function (q) { return !q.back; }).pop();
    if (!w) return undefined;
    var a = Math.atan2(-w.ay, w.ax), half = w.arc * Math.PI / 360, p = 1 - w.t / w.T;
    return a + w.dir * (half - 2 * half * Math.min(1, p * 1.6));
  }

  function drawHero(s) {
    var h = s.hero, c = R.ctx, u = R.ppm, t = performance.now();
    heroAnim.walk += Math.hypot(h.x - heroAnim.x, h.y - heroAnim.y); heroAnim.x = h.x; heroAnim.y = h.y;
    var X = R.X(h.x), Y = R.Y(h.y - 0.25), face = h.fx >= 0 ? 1 : -1;
    c.setLineDash([3, 6]); circle(h.x, h.y, h.pickupRadius, null, 'rgba(61,220,255,0.45)', 1.2); c.setLineDash([]);
    var ring = 0.5 + 0.03 * Math.sin(t / 300);
    c.strokeStyle = '#14151F'; c.lineWidth = 6; c.beginPath(); c.ellipse(X, Y, ring * u, ring * 0.4 * u, 0, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = '#3DDCFF'; c.lineWidth = 3; c.stroke();
    if (h.regenOn) { c.strokeStyle = 'rgba(91,209,110,' + (0.5 + 0.3 * Math.sin(t / 150)) + ')'; c.lineWidth = 2; c.beginPath(); c.ellipse(X, Y, (ring + 0.12) * u, (ring + 0.12) * 0.4 * u, 0, 0, Math.PI * 2); c.stroke(); }
    c.globalAlpha = h.invuln > 0 && Math.floor(t / 70) % 2 ? 0.45 : 1;
    P.Sprites.person(c, X, Y, { u: u * 1.22, backHand: P.WFx.heroBackHand(s), face: face, phase: heroAnim.walk * 5, skin: '#E0AC80', shirt: '#D7263D', pants: '#2B3346', hair: '#1E1712',
      arms: P.ColdOpen.hasKnife() ? 'knife' : 'idle', knifeA: knifeAngle(face), still: !h.moving, flash: h.hitFlash || 0 });
    c.globalAlpha = 1;
  }

  function drawDrops(s) {
    var c = R.ctx, t = performance.now() / 1000, u = R.ppm;
    s.drops.forEach(function (d, i) {
      var X = R.X(d.x), Y = R.Y(d.y) - Math.sin(t * 4 + i) * 0.06 * u;
      if (d.kind === 'xp') {
        c.fillStyle = 'rgba(91,209,110,0.25)'; c.beginPath(); c.arc(X, Y, 0.22 * u, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#7CF08E'; c.strokeStyle = '#14151F'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(X, Y - 0.17 * u); c.lineTo(X + 0.1 * u, Y); c.lineTo(X, Y + 0.12 * u); c.lineTo(X - 0.1 * u, Y); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.moveTo(X, Y - 0.13 * u); c.lineTo(X + 0.04 * u, Y - 0.02 * u); c.lineTo(X, Y); c.fill();
      } else if (d.kind === 'jeton') {
        var sx = Math.abs(Math.cos(t * 5 + i));
        c.fillStyle = '#E9A23B'; c.strokeStyle = '#14151F'; c.lineWidth = 1.5;
        c.beginPath(); c.ellipse(X, Y, 0.15 * u * Math.max(0.2, sx), 0.15 * u, 0, 0, Math.PI * 2); c.fill(); c.stroke();
      } else if (d.kind === 'chest') {
        c.save(); c.globalCompositeOperation = 'lighter';
        var bg = c.createLinearGradient(X, Y, X, Y - 3 * u); bg.addColorStop(0, 'rgba(255,209,102,0.55)'); bg.addColorStop(1, 'rgba(255,209,102,0)');
        c.fillStyle = bg; c.fillRect(X - 0.35 * u, Y - 3 * u, 0.7 * u, 3 * u); c.restore();
        P.Screens.chestShape(c, X, Y - 0.1 * u, 0.55 * u, 0);
      } else {
        c.strokeStyle = '#14151F'; c.lineWidth = 0.14 * u; c.beginPath(); c.arc(X, Y, 0.2 * u, 0, Math.PI * 2); c.stroke();
        c.strokeStyle = '#D9A050'; c.lineWidth = 0.09 * u; c.stroke();
      }
    });
  }

  function drawZonesAndTelegraphs(s) {
    var c = R.ctx, t = performance.now() / 1000;
    s.zones.forEach(function (z) {
      var a = Math.min(1, z.t / 0.3);
      if (z.kind === 'fire') {
        circle(z.x, z.y, z.r, 'rgba(255,90,20,' + (0.28 * a) + ')');
        for (var i = 0; i < 6; i++) {
          var ang = i * 1.05 + t, rr = z.r * (0.3 + 0.5 * ((i * 0.37) % 1));
          circle(z.x + Math.cos(ang) * rr, z.y + Math.sin(ang) * rr * 0.6, 0.16 + 0.06 * Math.sin(t * 9 + i), 'rgba(255,190,60,' + (0.7 * a) + ')');
        }
      } else circle(z.x, z.y, z.r, 'rgba(181,101,29,' + (0.35 * a) + ')');
    });
    s.dir.telegraphs.forEach(function (tg) {
      var X = R.X(tg.x), Y = R.Y(tg.y), r = tg.r * R.ppm;
      c.save(); c.beginPath(); c.arc(X, Y, r, 0, Math.PI * 2); c.clip();
      c.fillStyle = 'rgba(255,77,46,0.18)'; c.fillRect(X - r, Y - r, 2 * r, 2 * r);
      c.strokeStyle = 'rgba(255,77,46,0.55)'; c.lineWidth = 3;
      for (var i = -2 * r; i < 2 * r; i += 8) { c.beginPath(); c.moveTo(X + i, Y - r); c.lineTo(X + i + 2 * r, Y + r); c.stroke(); }
      c.restore();
      c.setLineDash([10, 6]); c.strokeStyle = '#FF4D2E'; c.lineWidth = 3; c.beginPath(); c.arc(X, Y, r, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
      c.lineWidth = 5; c.beginPath(); c.arc(X, Y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (tg.t / tg.T)); c.stroke();
    });
  }

  function drawGround() {
    var c = R.ctx, u = R.ppm;
    P.Fx.parts.forEach(function (p) {
      var a = Math.min(1, p.t / p.T * 3);
      if (p.kind === 'splat') {
        c.fillStyle = 'rgba(' + P.goreRGB(0) + ',' + (0.6 * a) + ')';
        var X = R.X(p.x), Y = R.Y(p.y);
        c.beginPath(); c.ellipse(X, Y, p.r * u, p.r * 0.55 * u, p.a, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(X + Math.cos(p.a) * p.r * 1.3 * u, Y + Math.sin(p.a) * p.r * 0.6 * u, p.r * 0.25 * u, 0, Math.PI * 2); c.fill();
      } else if (p.kind === 'scorch') circle(p.x, p.y, p.r, 'rgba(20,21,31,' + (0.45 * a) + ')');
    });
  }

  function drawFx() {
    var c = R.ctx, F = P.Fx, u = R.ppm;
    F.parts.forEach(function (p) {
      var a = p.t / p.T;
      if (p.kind === 'corpse') P.Sprites.corpse(R, p);
      else if (p.kind === 'gib') circle(p.x, p.y, 0.07, 'rgba(' + P.goreRGB(1) + ',' + a + ')', '#14151F', 1);
      else if (p.kind === 'blood') circle(p.x, p.y, 0.05, 'rgba(' + P.goreRGB(2) + ',' + a + ')');
      else if (p.kind === 'spark' || p.kind === 'ember') circle(p.x, p.y, 0.07, p.kind === 'spark' ? 'rgba(255,201,60,' + a + ')' : 'rgba(255,110,30,' + a + ')');
      else if (p.kind === 'shard') circle(p.x, p.y, 0.06, 'rgba(244,235,221,' + a + ')');
      else if (p.kind === 'dust') circle(p.x, p.y, 0.5 * (1.5 - a), 'rgba(184,184,184,' + (0.5 * a) + ')');
      else if (p.kind === 'muzzle') circle(p.x, p.y, 0.22, 'rgba(255,230,150,' + a + ')');
      else if (p.kind === 'flash') circle(p.x, p.y, p.r * (1.1 - 0.3 * a), 'rgba(255,240,200,' + (0.8 * a) + ')');
    });
    F.swings.forEach(function (w) {
      var a = Math.atan2(-w.ay, w.ax), half = w.arc * Math.PI / 360, p = 1 - w.t / w.T, X = R.X(w.x), Y = R.Y(w.y);
      var sweep = Math.min(1, p * 1.7), s0 = a + w.dir * half, s1 = a + w.dir * (half - 2 * half * sweep);
      var lo = Math.min(s0, s1), hi = Math.max(s0, s1), r = w.range * u, alpha = 1 - Math.max(0, p - 0.45) / 0.55;
      var lead = w.dir > 0 ? Math.min(hi, lo + 1.2) : Math.max(lo, hi - 1.2);
      c.save();
      c.globalCompositeOperation = 'lighter';
      for (var k = 0; k < 3; k++) {
        var rin = r * (0.45 + k * 0.12);
        c.fillStyle = 'rgba(' + (k === 2 ? '255,255,255' : '190,230,255') + ',' + (alpha * (0.16 + k * 0.14)).toFixed(3) + ')';
        c.beginPath(); c.arc(X, Y, r * (1 - k * 0.04), lo, hi); c.arc(X, Y, rin, hi, lo, true); c.closePath(); c.fill();
      }
      c.restore();
      c.strokeStyle = 'rgba(255,255,255,' + alpha + ')'; c.lineWidth = 4; c.lineCap = 'round';
      c.beginPath(); c.arc(X, Y, r, w.dir > 0 ? lo : lead, w.dir > 0 ? lead : hi); c.stroke();
      c.strokeStyle = 'rgba(20,21,31,' + (0.5 * alpha) + ')'; c.lineWidth = 1.5;
      c.beginPath(); c.arc(X, Y, r + 3, lo, hi); c.stroke();
    });
    F.rings.forEach(function (g) {
      var f = 1 - g.t / g.T;
      c.globalAlpha = 1 - f; circle(g.x, g.y, g.r * (0.6 + 0.4 * f), null, g.color, 5); c.globalAlpha = 1;
    });
  }

  // Optional module hooks (workstreams E/F): obj[fn](R, s) if present.
  function hook(obj, fn, s) { if (obj && obj[fn]) obj[fn](R, s); }
  R.hook = hook;

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
    var L1 = !s.levelIndex || s.levelIndex === 1;
    if (L1 && y0 < 1) P.RenderWorld.drawRestaurant(R, s);
    P.Decor.drawStreet(R, s, y0, y1);
    P.RenderWorld.drawProps(R, s);
    drawGround();
    drawZonesAndTelegraphs(s);
    hook(P.WFx2, 'drawGround', s);
    drawDrops(s);
    var actors = s.enemies.filter(function (e) { return Math.abs(e.y - cam.y) < half; });
    actors.sort(function (a, b) { return b.y - a.y; });
    s.dir.civilians.forEach(function (v) { P.Sprites.civilian(R, v); });
    actors.forEach(function (e) { P.Sprites.enemy(R, e, s.hero); });
    if (extraDraw) extraDraw(R, s);
    drawFx();
    P.WFx.drawParts(R);
    hook(P.SkillsFx, 'drawUnder', s);
    drawHero(s);
    P.WFx.drawChain(R, s);
    P.WFx.drawProjectiles(R, s);
    hook(P.WFx2, 'drawAir', s);
    hook(P.SkillsFx, 'drawOver', s);
    if (L1 && y1 > 140 && y0 < 165) P.RenderWorld.drawTram(R, s);
    if (L1 && y1 > 222) P.RenderWorld.drawScaffold(R, s);
    P.RenderWorld.drawLights(R, s, y0, y1);
    P.Decor.drawOverhead(R, s, y0, y1);
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
      c.font = 'italic 900 ' + Math.round(size * sc) + 'px "Avenir Next Condensed", "Arial Narrow", system-ui';
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 3; c.strokeStyle = '#14151F';
      c.globalAlpha = n.t < 0.2 ? n.t / 0.2 : 1;
      var X = R.X(n.x), Y = R.Y(n.y + 0.5 + P.CFG.feel.dmgNumberRise * f), txt = String(Math.round(n.val));
      c.strokeText(txt, X, Y); c.fillStyle = n.crit ? '#E9A23B' : '#FFFFFF'; c.fillText(txt, X, Y);
      c.globalAlpha = 1;
    });
    P.Fx.letters.forEach(function (l) {
      c.font = 'italic 900 38px "Avenir Next Condensed", "Arial Narrow", system-ui'; c.textAlign = 'center'; c.lineWidth = 5;
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
    var c = R.ctx, W = R.W, H = R.H;
    var l = (s.levelIndex > 1 && P.RenderWorld.screenLight) ? P.RenderWorld.screenLight(s) : light(s.hero.y);
    if (P.Fx.flash > 0) { c.fillStyle = 'rgba(255,240,200,' + P.Fx.flash.toFixed(3) + ')'; c.fillRect(0, 0, W, H); }
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
    if (s.mode === 'play') P.WFx.drawCombo(R);
    if (P.SkillsFx && P.SkillsFx.screen) P.SkillsFx.screen(R, s);
  };
  return O;
})();
