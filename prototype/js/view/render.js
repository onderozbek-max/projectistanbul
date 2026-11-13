// Canvas renderer for the run: camera transform, actors, pickups, effects, lighting (DS 6 hierarchy:
// player > telegraphs > enemies > pickups > player projectiles > environment). v0.2: sprite figures via P.Sprites.
P.Render = (function () {
  var R = { ctx: null, canvas: null, W: 390, H: 844, dpr: 1, ppm: 32.5, cam: null };
  var heroAnim = { x: 0, y: 0, walk: 0 };

  // alpha:false: every frame starts with a full-canvas fill (or the finale sky), so the backing store is opaque and cheaper to composite.
  R.init = function (canvas) { R.canvas = canvas; R.ctx = canvas.getContext('2d', { alpha: false }); };
  // The world canvas uses min(devicePixelRatio, view.maxDpr), lower on the governor's tiers (quality.js). Changing it re-allocates
  // the backing store, so it only happens on a window resize or a tier step.
  R.resize = function (scale) {
    R.dpr = Math.min(window.devicePixelRatio || 1, P.Quality ? P.Quality.dprCap() : 3) * scale;
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

  // 4-point sparkle centred at (x, y), outer radius r, turned by a (rad). Alpha is multiplied in through globalAlpha (no string per call).
  function glint(c, x, y, r, a, alpha) {
    var j, rr, aa, prev = c.globalAlpha;
    c.globalAlpha = prev * alpha; c.fillStyle = '#FFFFFF';
    c.beginPath();
    for (j = 0; j < 8; j++) { rr = j % 2 ? r * 0.28 : r; aa = a + j * Math.PI / 4; c.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr); }
    c.closePath(); c.fill();
    c.globalAlpha = prev;
  }

  function knifeAngle(face) {
    var w = P.Fx.swings.filter(function (q) { return !q.back; }).pop();
    if (P.Feel) return P.Feel.knifeAngle(w, face);   // v0.9: anticipation, overshoot and a settle back to rest
    if (!w) return undefined;
    var a = Math.atan2(-w.ay, w.ax), half = w.arc * Math.PI / 360, p = 1 - w.t / w.T;
    return a + w.dir * (half - 2 * half * Math.min(1, p * 1.6));
  }

  // Invulnerability blink (G5): a 1.5 Hz alpha pulse between 0.6 and 1.0, never a fast toggle. Off under "reduce flashes".
  function blinkAlpha(h, t) {
    if (!(h.invuln > 0) || (P.Settings && P.Settings.reduceFlash)) return 1;
    var V = P.CFG.view, mid = (1 + V.blinkMinAlpha) / 2, amp = (1 - V.blinkMinAlpha) / 2;
    return mid + amp * Math.sin(t / 1000 * Math.PI * 2 * V.blinkHz);
  }

  // Hero contact shadow. It is drawn on the ground layer (frame), before any figure, never over a neighbour.
  function drawHeroShadow(s) {
    var h = s.hero, V = P.CFG.view;
    P.Sprites.contact(R.ctx, R.X(h.x), R.Y(h.y - 0.25), V.heroShadow.radius * R.ppm, V.heroShadow.alpha, V.heroShadow.aspect);
  }

  function drawHero(s) {
    var h = s.hero, c = R.ctx, u = R.ppm, t = performance.now(), V = P.CFG.view;
    heroAnim.walk += Math.hypot(h.x - heroAnim.x, h.y - heroAnim.y); heroAnim.x = h.x; heroAnim.y = h.y;
    var X = R.X(h.x), Y = R.Y(h.y - 0.25), face = h.fx >= 0 ? 1 : -1;
    c.setLineDash([3, 6]); circle(h.x, h.y, h.pickupRadius, null, 'rgba(61,220,255,0.45)', 1.2); c.setLineDash([]);
    var ring = 0.5 + 0.03 * Math.sin(t / 300);
    c.strokeStyle = '#14151F'; c.lineWidth = 6; c.beginPath(); c.ellipse(X, Y, ring * u, ring * 0.4 * u, 0, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = '#3DDCFF'; c.lineWidth = 3; c.stroke();
    if (h.regenOn) { c.strokeStyle = 'rgba(91,209,110,' + (0.5 + 0.3 * Math.sin(t / 150)) + ')'; c.lineWidth = 2; c.beginPath(); c.ellipse(X, Y, (ring + 0.12) * u, (ring + 0.12) * 0.4 * u, 0, 0, Math.PI * 2); c.stroke(); }
    c.globalAlpha = blinkAlpha(h, t);
    var so = { u: u * V.spriteScale.hero, back: h.moving && h.fy > 0.4, backHand: P.WFx.heroBackHand(s), face: face, phase: heroAnim.walk * 5, skin: '#E0AC80', shirt: '#D7263D', pants: '#2B3346', hair: '#1E1712',
      arms: (s.levelIndex > 1 ? !!(h.weapons.knife || h.weapons.cleaver) : P.ColdOpen.hasKnife()) ? 'knife' : 'idle', knifeA: knifeAngle(face), still: !h.moving,
      flash: P.Fx.heroFlash ? P.Fx.heroFlash() : 0 };   // the white hit flash is gated to 3 per second in fx.js (G3)
    if (P.Feel) { var fh = P.Feel.hero(); so.lean = fh.lean; so.spring = { x: fh.x, y: fh.y, r: fh.r, ox: 0 }; }
    if (P.FireAnim) P.FireAnim.heroOpts(s, so);   // a shot's pose (or the chainsaw rev) draws the arms itself
    P.Sprites.hero(c, X, Y, so);
    c.globalAlpha = 1;
    hook(P.FireAnim, 'drawHeld', s);
  }

  function drawDrops(s) {
    var c = R.ctx, t = performance.now() / 1000, u = R.ppm, pk = P.CFG.feel2.pickup, hero = s.hero;
    s.drops.forEach(function (d, i) {
      if (P.Consumables && P.Consumables.handles(d.kind)) return;   // heal, power and currency drops: the overlay pass (T4 part 10)
      var X = R.X(d.x), Y = R.Y(d.y) - Math.sin(t * 3 + i) * pk.bob * u, lift = 0, hd, tx, ty, gl, g;
      if (d.pop > 0 && d.pop <= pk.popT && !(P.Settings && P.Settings.reduceMotion)) {   // pops out on a small arc (the sim holds it for `pop` s)
        lift = Math.sin(Math.PI * (1 - d.pop / pk.popT)) * pk.lift;
        c.fillStyle = 'rgba(0,0,0,0.2)'; c.beginPath(); c.ellipse(X, Y, 0.14 * u, 0.06 * u, 0, 0, Math.PI * 2); c.fill();
        Y -= lift * u;
      } else if (d.mag && d.kind !== 'chest' && !(P.Settings && P.Settings.reduceMotion)) {   // flying to the hero: a streak behind it
        hd = Math.hypot(hero.x - d.x, hero.y - d.y) || 1;
        tx = R.X(d.x - (hero.x - d.x) / hd * pk.trail); ty = R.Y(d.y - (hero.y - d.y) / hd * pk.trail);
        c.strokeStyle = 'rgba(' + (pk.col[d.kind] || pk.col.simit) + ',0.45)'; c.lineWidth = 0.1 * u; c.lineCap = 'round';
        c.beginPath(); c.moveTo(tx, ty); c.lineTo(X, Y); c.stroke();
      }
      if (d.kind === 'xp') {
        c.fillStyle = 'rgba(91,209,110,0.25)'; c.beginPath(); c.arc(X, Y, 0.22 * u, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#7CF08E'; c.strokeStyle = '#14151F'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(X, Y - 0.17 * u); c.lineTo(X + 0.1 * u, Y); c.lineTo(X, Y + 0.12 * u); c.lineTo(X - 0.1 * u, Y); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.moveTo(X, Y - 0.13 * u); c.lineTo(X + 0.04 * u, Y - 0.02 * u); c.lineTo(X, Y); c.fill();
        // Glint: a tiny 4-point sparkle that turns slowly and swells on a smooth beat (pk.glint). Alpha moves continuously, never on/off.
        gl = pk.glint; g = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * gl.pulse + i);
        glint(c, X + 0.13 * u, Y - 0.16 * u, gl.size * u * (0.6 + 0.4 * g), t * gl.spin + i, 0.3 + 0.5 * g);
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

  // Optional particles (gibs, blood, sparks, embers, shards, dust) are drawn 1 in k at the governor's tiers (quality.js);
  // corpses, muzzle flashes and the rest always draw.
  var PART_OPTIONAL = { gib: 1, blood: 1, spark: 1, ember: 1, shard: 1, dust: 1 };
  function drawFx() {
    var c = R.ctx, F = P.Fx, u = R.ppm, k = P.Quality ? P.Quality.partStep() : 1;
    F.parts.forEach(function (p, pi) {
      if (k > 1 && PART_OPTIONAL[p.kind] && pi % k) return;
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
        c.fillStyle = 'rgba(' + (k === 2 ? '255,255,255' : '190,230,255') + ',' + (alpha * (0.24 + k * 0.2)).toFixed(3) + ')';
        c.beginPath(); c.arc(X, Y, r * (1 - k * 0.04), lo, hi); c.arc(X, Y, rin, hi, lo, true); c.closePath(); c.fill();
      }
      c.restore();
      c.strokeStyle = 'rgba(255,255,255,' + alpha + ')'; c.lineWidth = 5; c.lineCap = 'round';
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

  // Depth queue (rebuilt each frame). R.depth(y, fn, occludes): y = base (south) edge in metres; larger y is farther
  // and drawn first. occludes (default true) marks scenery that can hide the hero: it is drawn after him when its base
  // is in front of him. Actors pass false, so the hero stays above the crowd (DS 6.2).
  var depthQ = [];
  R.depth = function (y, fn, occludes) { depthQ.push({ y: y, fn: fn, occ: occludes !== false }); };
  function byDepth(a, b) { return b.y - a.y; }
  function runDepth(list) { for (var i = 0; i < list.length; i++) list[i].fn(); }

  R.frame = function (s, extraDraw) {
    if (P.FinaleApproach && P.FinaleApproach.active && P.FinaleApproach.active()) { P.FinaleApproach.draw(R); return; }
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
    hook(P.LayoutFx, 'drawGround', s);           // lane B: layout zone floors (plaza, market, bridge), over the street, under decals
    hook(P.EnvFx, 'drawGround', s);              // lane A: floor decals (puddles, glass, debris), after the floor, before shadows
    P.RenderWorld.drawShadows(R, s, y0, y1);      // ground ambient occlusion under carts, canisters and blocks
    drawGround();
    drawZonesAndTelegraphs(s);
    hook(P.WFx2, 'drawGround', s);
    hook(P.EnemyFx, 'drawGround', s);
    hook(P.EventsFx, 'drawGround', s);
    if (L1 && y1 > 140 && y0 < 165) P.RenderWorld.drawTram(R, s);   // T4 part 11: the idle tram is on the ground, opaque, under the actors
    // Ground layer for actors: contact shadows, base rings and auras sit under every figure, so no shadow lands on a
    // neighbour's legs (G4). Figures then draw through RF, which skips their ground.
    // Actors outside the screen sideways are not drawn (48 px of margin for the shadow, recoil and the knife).
    var hw = (R.W / 2 + Math.abs(cam.ox || 0) + 48) / R.ppm;
    var actors = s.enemies.filter(function (e) { return Math.abs(e.y - cam.y) < half && Math.abs(e.x - cam.x) < hw; }), RF = Object.create(R);
    RF.noGround = true;
    actors.forEach(function (e) { P.Sprites.groundEnemy(R, e); });
    s.dir.civilians.forEach(function (v) { P.Sprites.groundCivilian(R, v); });
    drawHeroShadow(s);
    drawDrops(s);
    hook(P.EnemiesFx2, 'drawUnder', s);           // lane C: decals under the crowd
    // Depth pass: props, actors and civilians queue themselves, then flush far to near (see R.depth).
    depthQ.length = 0;
    hook(P.EnvFx, 'drawProps', s);                // lane A: props (call R.depth(y, fn) to sort them with the actors)
    P.RenderWorld.drawProps(R, s);
    s.dir.civilians.forEach(function (v) { R.depth(v.y, function () { P.Sprites.civilian(RF, v); }, false); });
    actors.forEach(function (e) { R.depth(e.y, function () { P.Sprites.enemy(RF, e, s.hero); }, false); });
    var hy = s.hero.y, pre = [], post = [];
    depthQ.forEach(function (d) { (d.occ && d.y <= hy ? post : pre).push(d); });   // props in front of the hero come after him
    pre.sort(byDepth); post.sort(byDepth);
    depthQ.length = 0;
    runDepth(pre);
    hook(P.EnemiesFx2, 'drawOver', s);            // lane C: decals and marks over the crowd, under the hero
    if (extraDraw) extraDraw(R, s);
    drawFx();
    P.WFx.drawParts(R);
    hook(P.Feel, 'draw', s);                      // v0.9: arcing blood and gibs, footfall dust
    hook(P.SkillsFx, 'drawUnder', s);
    drawHero(s);
    runDepth(post);
    hook(P.Consumables, 'drawOver', s);            // T4 part 10: consumables above the actors, so no zombie hides one
    P.WFx.drawChain(R, s);
    P.WFx.drawProjectiles(R, s);
    hook(P.FireAnim, 'drawFx', s);
    hook(P.WFx2, 'drawAir', s);
    hook(P.EnemyFx, 'drawAir', s);
    hook(P.EventsFx, 'drawAir', s);
    hook(P.Vehicles, 'drawAir', s);
    hook(P.EnvFx, 'drawAir', s);                  // lane A: airborne env (debris, smoke, gulls) after the crowd
    hook(P.SkillsFx, 'drawOver', s);
    if (L1 && y1 > 222) P.RenderWorld.drawScaffold(R, s);
    P.RenderWorld.drawLights(R, s, y0, y1);
    P.Decor.drawOverhead(R, s, y0, y1);
    if (P.Speech) P.Speech.resolve(R, s);   // every bubble is placed here, after the signs (which fade under them)
    P.RenderOverlay.worldText(R, s);
    hook(P.Barks, 'draw', s);
    c.restore();
    P.RenderOverlay.screen(R, s);
    hook(P.ConsumablesZone, 'drawScreen', s);      // T4 part 10: edge arrows for off-screen link terminals
  };

  R.circle = circle;
  R.drawDrops = drawDrops;   // exported for the animation harness (filmstrips and the draw-cost check)
  return R;
})();

// World-space text (bubbles, damage numbers, lettering, prompt arrows) and screen-space lighting.
P.RenderOverlay = (function () {
  var O = {}, legacy = [];
  // Arbiter provider for the L1 director bubbles: Arda's legacy bark (over him, or over the shop) and the cat's '!'.
  // They keep their old wording and box; the arbiter decides where they sit.
  function offerLegacy(R, s) {
    var b = s.dir.barks.cur, c = R.ctx, a, who, list = [];
    legacy = [];
    if (b) {
      who = b.who === 'shop' ? { x: 6.4, y: 226 } : { x: s.hero.x, y: s.hero.y + 0.8 };
      a = R.toScreen(who.x, who.y);
      list.push({ id: 'legacy:' + b.id, text: P.Dialogue.text(b.id), kind: 'legacy', prio: P.Speech.PRIO.legacy, ax: a.x, ay: a.y, lift: 58, maxW: 230 });
    }
    s.dir.bubbles.forEach(function (q, i) {
      a = R.toScreen(q.x, q.y + 0.3);
      list.push({ id: 'cat:' + i, text: q.text, kind: 'cat', prio: P.Speech.PRIO.cat, ax: a.x, ay: a.y, lift: 30, maxW: 60 });
    });
    list.forEach(function (it) {
      var m = P.Speech.measurePlain(c, it.text, it.maxW), e = { lines: m.lines, rect: null };
      legacy.push(e);
      P.Speech.offer({ id: it.id, kind: it.kind, prio: it.prio, w: m.w, h: m.h, ax: it.ax, ay: it.ay, lift: it.lift,
        place: function (slot) {
          if (!slot) { e.rect = null; return; }
          var tt = P.Speech.tailTarget(slot, it.lift);
          e.rect = { x: slot.x, y: slot.y, w: m.w, h: m.h, tx: tt.tx, ty: tt.ty };
        } });
    });
  }
  function drawLegacy(R) {
    var c = R.ctx;
    legacy.forEach(function (e) {
      if (!e.rect) return;
      c.save(); c.setTransform(R.dpr || 1, 0, 0, R.dpr || 1, 0, 0);
      P.Speech.drawPlain(c, e.rect, e.lines);
      c.restore();
    });
  }
  if (P.Speech) P.Speech.provider(offerLegacy);

  // Floating callouts (event letters) are world labels: they fade while a bubble covers them.
  function labelAlpha(R, key, x, y, w, h) {
    if (!P.Speech) return 1;
    var sp = R.toScreen(x, y);
    return P.Speech.label(key, sp.x - w / 2, sp.y - h / 2, w, h);
  }

  O.worldText = function (R, s) {
    var c = R.ctx;
    drawLegacy(R);
    P.Fx.nums.forEach(function (n) {
      // Pop: the number starts at dmgPop times its size and settles to 1 over dmgPopT seconds of its life (view only).
      var f = 1 - n.t / n.T, size = n.crit ? 24 : 14, el = n.T - n.t, pT = P.CFG.feel.dmgPopT, sc = el < pT ? 1 + (P.CFG.feel.dmgPop - 1) * (1 - el / pT) : 1;
      c.font = 'italic 900 ' + Math.round(size * sc) + 'px "Avenir Next Condensed", "Arial Narrow", system-ui';
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 3; c.strokeStyle = '#14151F';
      c.globalAlpha = n.t < 0.2 ? n.t / 0.2 : 1;
      var X = R.X(n.x), Y = R.Y(n.y + 0.5 + P.CFG.feel.dmgNumberRise * f), txt = String(Math.round(n.val));
      c.strokeText(txt, X, Y); c.fillStyle = n.crit ? '#E9A23B' : '#FFFFFF'; c.fillText(txt, X, Y);
      c.globalAlpha = 1;
    });
    P.Fx.letters.forEach(function (l) {
      c.font = 'italic 900 38px "Avenir Next Condensed", "Arial Narrow", system-ui'; c.textAlign = 'center'; c.lineWidth = 5;
      c.strokeStyle = '#14151F'; c.fillStyle = '#F4EBDD';
      c.globalAlpha = Math.min(1, l.t / 0.3) * labelAlpha(R, P.Speech ? P.Speech.labelKey(l) : 'letter', l.x, l.y, 150, 44);
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

  // The low-HP heartbeat is one flash per beat; it is counted against the screen flash budget (sprites.js flashForce).
  var heartN = -1;
  function countHeartbeat(now) {
    var n = Math.floor(now / P.Fx.heartPeriod);
    if (n !== heartN && P.Sprites && P.Sprites.flashForce) { heartN = n; P.Sprites.flashForce(now); }
  }
  // The edge vignette is the same radial gradient on every frame of a level, so it is rasterised once per colour, alpha and
  // device scale and then drawn as one image. A gradient fill over the whole screen is a per-pixel evaluation each frame.
  var vig = { key: '', cv: null };
  function vignetteImage(R, vc, a) {
    var key = vc + '|' + a + '|' + R.dpr, W = R.W, H = R.H, g2, g;
    if (vig.key !== key) {
      if (!vig.cv) vig.cv = document.createElement('canvas');
      vig.cv.width = Math.round(W * R.dpr); vig.cv.height = Math.round(H * R.dpr);
      g2 = vig.cv.getContext('2d'); g2.setTransform(R.dpr, 0, 0, R.dpr, 0, 0);
      g = g2.createRadialGradient(W / 2, H * 0.65, 0, W / 2, H * 0.65, H * 0.75);
      g.addColorStop(0.6, 'rgba(' + vc + ',0)'); g.addColorStop(1, 'rgba(' + vc + ',' + a + ')');
      g2.fillStyle = g; g2.fillRect(0, 0, W, H);
      vig.key = key;
    }
    return vig.cv;
  }
  O.screen = function (R, s) {
    var c = R.ctx, W = R.W, H = R.H;
    var l = (s.levelIndex > 1 && P.RenderWorld.screenLight) ? P.RenderWorld.screenLight(s) : light(s.hero.y);
    // No full-screen flash here (v0.7 removed the level-up and bloater flashes). Light, vignette and the low-HP beat only.
    c.fillStyle = 'rgba(' + Math.round(l[0]) + ',' + Math.round(l[1]) + ',' + Math.round(l[2]) + ',' + l[3].toFixed(3) + ')';
    c.fillRect(0, 0, W, H);
    var vg = (s.levelIndex > 1 && P.RenderWorld.vignette) ? P.RenderWorld.vignette(s) : [27, 73, 101, 0.45];
    var vc = Math.round(vg[0]) + ',' + Math.round(vg[1]) + ',' + Math.round(vg[2]);
    c.drawImage(vignetteImage(R, vc, vg[3].toFixed(3)), 0, 0, W, H);   // cached image; the transform here is the device-scale one
    if (s.hero.hp / s.hero.maxHp < P.CFG.feel.lowHpFrac && s.mode === 'play') {
      // Last stand: a dark red vignette that beats like a heart (two beats per cycle, never a flash).
      var beat = (P.Settings && P.Settings.reduceFlash) ? 0.5 : (P.Fx.heart ? P.Fx.heart(performance.now() / 1000) : 0.5);
      if (!(P.Settings && P.Settings.reduceFlash) && P.Fx.heartPeriod) countHeartbeat(performance.now() / 1000);
      var p = 0.12 + 0.3 * beat;
      var g2 = c.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.7);
      g2.addColorStop(0, 'rgba(215,38,61,0)'); g2.addColorStop(1, 'rgba(215,38,61,' + p.toFixed(3) + ')');
      c.fillStyle = g2; c.fillRect(0, 0, W, H);
    }
    // G3: a red wash at the screen edge on a heavy hit (fx.js gates it to once per 0.5 s and decays it in 0.25 s).
    var ea = P.Fx.edgeAlpha ? P.Fx.edgeAlpha() : 0;
    if (ea > 0) {
      var ge = c.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.72);
      ge.addColorStop(0, 'rgba(215,38,61,0)'); ge.addColorStop(1, 'rgba(215,38,61,' + ea.toFixed(3) + ')');
      c.fillStyle = ge; c.fillRect(0, 0, W, H);
    }
    if (P.Speech) P.Speech.drawBanners(c, R);
    if (P.EnemyFx && P.EnemyFx.screen) P.EnemyFx.screen(R, s);
    if (P.EventsFx && P.EventsFx.screen) P.EventsFx.screen(R, s);
    if (P.SkillsFx && P.SkillsFx.screen) P.SkillsFx.screen(R, s);
    if (P.MomentsScreen && P.MomentsScreen.draw) P.MomentsScreen.draw(R, s);   // T4 part 13: signature moments, screen layer
  };
  return O;
})();
