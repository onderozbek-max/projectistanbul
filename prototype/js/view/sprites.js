// Procedural character sprites (view only): public API over the figure rig (art-rig.js, art-characters.js,
// art-enemies.js). Callers keep the original names and params: person, hero, enemy, civilian, corpse,
// crawler, knifeArm, palette, shadow. Figures are pre-rendered per recipe, layer and pose, then drawImage'd.
P.Sprites = (function () {
  var S = {}, R = P.ArtRig, CH = P.ArtChars, EN = P.ArtEnemies, TAU = R.TAU, INK = R.INK;
  var SKIN = ['#F1C9A5', '#E0AC80', '#C68B5E', '#9C6B47'];
  var ZSKIN = ['#B4D08E', '#9FC27E', '#C2C98F', '#94B67A'];
  var SHIRT = ['#3D6E9E', '#B5442E', '#E2D6C0', '#4F7A4A', '#7A4F8C', '#C9A13B', '#2F3A4A', '#A8475F'];
  var ZSHIRT = ['#5B7A96', '#9A5440', '#BDB4A0', '#5E7A55', '#7A6088', '#A8924E', '#4A5468', '#8C5262'];
  var PANTS = ['#2B3346', '#3E3A35', '#4A5A6E', '#1E1E24'];
  var HAIR = ['#1E1712', '#3B2A1E', '#6B4A2E', '#14151F', '#8A8F98'];
  var ELITE_GLOW = 'rgba(224,64,251,0.9)', BOSS_GLOW = 'rgba(255,70,50,0.85)';

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function limb(c, x0, y0, x1, y1, col, w) {
    c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = w + 3; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  }
  function blob(c, x, y, rx, ry, fill) { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fillStyle = fill; c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke(); }

  S.shadow = function (c, X, Y, u, k) {
    c.fillStyle = 'rgba(0,0,0,' + (0.32 * (k === undefined ? 1 : k)) + ')';
    c.beginPath(); c.ellipse(X, Y, 0.34 * u, 0.13 * u, 0, 0, TAU); c.fill();
  };
  S.palette = function (variant, zombie) {
    var v = variant || 0;
    return { skin: zombie ? ZSKIN[v % 4] : SKIN[v % 4], shirt: zombie ? ZSHIRT[v % 8] : SHIRT[v % 8], pants: PANTS[(v >> 1) % 4], hair: HAIR[(v * 3) % 5] };
  };

  // Device pixels per CSS px for the current context (works for DPR scaling and camera transforms).
  function devScale(c) {
    var m = c.getTransform ? c.getTransform() : null;
    return m ? (Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) || 1) : (window.devicePixelRatio || 1);
  }
  function lookOf(skin, shirt, pants, hair, shoe) {
    return { skin: skin, skinS: R.shade(skin, 0.82), shirt: shirt, shirtS: R.shade(shirt, 0.8), pants: pants, pantsS: R.shade(pants, 0.8),
      shoe: shoe, shoeS: R.shade(shoe, 0.75), hair: hair, hairS: R.shade(hair, 0.8) };
  }
  function faceKey(F) { return [F.eyes, F.glow, F.mouth, F.brow, F.big, F.blush, F.sockets].join(','); }

  // Recipe: everything that changes the baked pixels. p.key is the cache identity (plus pose key).
  function buildRc(p) {
    var O = p.O, rc = {
      B: p.B, outfit: O, look: lookOf(p.skin, p.shirt, p.pants, p.hair, p.shoe),
      hairStyle: p.hairStyle || O.hair || 'short', hat: p.hat !== undefined ? p.hat : O.hat, acc: O.acc || [],
      face: p.face || {}, live: p.live || {}, hook: p.hook || null, halo: p.halo || null, glow: p.glow || null,
      bib: !!p.bib, torn: !!p.torn, wounds: p.wounds || 0, pust: !!p.pust, throat: !!p.throat,
      windup: p.windup || 0, swell: p.swell || 0, crouch: p.crouch || 0, lean: p.lean || 0, hunch: p.hunch || 0,
      arms: p.arms, still: !!p.still, seed: p.seed || 0, back: !!p.back, mot: p.mot || {}, custom: !!p.custom, eyes: p.eyes
    };
    rc.key = [p.tag, p.oid, p.bname, rc.look.skin, rc.look.shirt, rc.look.pants, rc.look.hair, rc.look.shoe, rc.hairStyle,
      rc.hat, rc.acc.join(','), faceKey(rc.face), (rc.live.front ? 'f' : '') + (rc.live.back ? 'b' : ''), rc.halo, rc.glow,
      rc.bib ? 1 : 0, rc.torn ? 1 : 0, rc.wounds, rc.pust ? 1 : 0, rc.throat ? 1 : 0,
      rc.back ? 1 : 0, rc.custom ? 1 : 0, rc.eyes || '', rc.arms, rc.still ? 1 : 0, rc.crouch, rc.lean, rc.hunch].join('|');
    return rc;
  }
  function customOutfit(shirt, pants, hair) {
    return { top: 'shirt', col: shirt, pants: pants, shoe: '#2A2A2A', hair: 'short', hc: hair, sleeve: 'long', acc: [] };
  }
  // Pose: walk frames (8) or breath frames (4) so the cache stays small.
  function poseOf(rc, o, moving, t) {
    var m = rc.mot, p = { gait: 'still', arms: rc.arms || 'idle', lean: rc.lean, hunch: rc.hunch, crouch: rc.crouch,
      strideK: m.strideK || 1, liftK: m.liftK || 1, limp: !!m.limp, bob: 0, walk: 0, breath: 0, back: rc.back }, bi, wi;
    if (!moving) {
      bi = Math.floor(t / 260 + rc.seed) % 4; p.breath = bi * TAU / 4; p.bob = -0.012 * (1 + Math.sin(p.breath)) * 0.5;
      if (p.arms === 'swing' || p.arms === 'run' || p.arms === 'pump') p.arms = 'idle';
      p.key = 'b' + bi;
    } else {
      wi = Math.round((((o.phase || 0) % TAU) + TAU) % TAU / TAU * 8) % 8;
      p.gait = m.gait || 'walk'; p.walk = wi * TAU / 8; p.bob = -0.022 * Math.abs(Math.cos(p.walk));
      p.lean += (m.sway || 0) * Math.sin(p.walk);
      if (p.arms === 'idle') p.arms = 'swing';
      p.key = 'w' + wi;
    }
    return p;
  }
  function squash(pose, moving, hit) {
    var sy = moving ? 1 - 0.03 * Math.abs(Math.sin(pose.walk)) : 1 + 0.008 * Math.sin(pose.breath);
    var sx = moving ? 1 + 0.015 * Math.abs(Math.sin(pose.walk)) : 1;
    return { x: sx * (1 + 0.14 * hit), y: sy * (1 - 0.12 * hit) };
  }
  function bakeGlow(g, rc, U) {
    if (rc.glow) { g.shadowColor = rc.glow; g.shadowBlur = 0.09 * U; } else { g.shadowBlur = 0; g.shadowColor = 'rgba(0,0,0,0)'; }
  }
  // Point in CSS px for a unit-space joint, given the sprite's feet anchor and squash.
  function anchor(X, Y, f, sq, ox, oy, u, p) { return { x: X + ox + f * sq.x * p[0] * u, y: Y + oy + sq.y * p[1] * u }; }

  // Draw one figure: cached low layer, live knife, cached head, live back-hand weapon (original z-order).
  function drawFigure(c, X, Y, u, f, rc, o, t) {
    var U = R.bucket(u * devScale(c)), moving = !rc.still, pose = poseOf(rc, o, moving, t), J = R.solve(rc.B, pose);
    var refJ = R.solve(rc.B, { lean: rc.lean, hunch: rc.hunch, crouch: rc.crouch, arms: 'idle' });
    var hit = clamp((o.flash || 0) / 0.06, 0, 1), sq = squash(pose, moving, hit), ox = (o.recoil || 0) * hit * u, oy = 0;
    var white = (o.flash || 0) > 0, low, high, dx, dy;
    rc.U = U;
    if (rc.custom) {
      low = R.bake(rc.key + '|C' + pose.key, U, EN.CRAWL_BOX, function (g) { bakeGlow(g, rc, U); EN.crawlerDraw(g, rc, pose.walk); bakeGlow(g, {}, U); });
      R.blit(c, white ? R.white(low) : low, X, Y, u, f, sq, ox, oy, 0, 0);
      return;
    }
    // Low layer depends on pose and swell; head layer depends on windup (spitter throat) only.
    low = R.bake(rc.key + '|L|' + pose.key + '|s' + rc.swell, U, R.LOW_BOX, function (g) { bakeGlow(g, rc, U); R.drawLow(g, rc, J, pose); bakeGlow(g, {}, U); });
    high = R.bake(rc.key + '|H|w' + rc.windup, U, R.HIGH_BOX, function (g) { bakeGlow(g, rc, U); R.drawHigh(g, rc, refJ); bakeGlow(g, {}, U); });
    dx = J.hd[0] - refJ.hd[0]; dy = J.hd[1] - refJ.hd[1];
    R.blit(c, white ? R.white(low) : low, X, Y, u, f, sq, ox, oy, 0, 0);
    if (rc.live.front) S.knifeArm(c, anchor(X, Y, f, sq, ox, oy, u, J.sR), u, f, o.knifeA, rc.look.skin, rc.look.shirt);
    R.blit(c, white ? R.white(high) : high, X, Y, u, f, sq, ox, oy, dx, dy);
    if (o.backHand) o.backHand(c, anchor(X, Y, f, sq, ox, oy, u, J.sL), u, f, rc.look.skin, rc.look.shirt);
  }

  // Generic human/zombie from explicit colours (key art, cold open). Original params honoured.
  S.person = function (c, X, Y, o) {
    var z = !!o.zombie, f = o.face === -1 ? -1 : 1, O = o.outfit ? CH.outfit(o.outfit) : customOutfit(o.shirt || SHIRT[0], o.pants || PANTS[0], o.hair || HAIR[0]);
    var face = z ? { eyes: o.eyes || '#DDF5D0', glow: o.eyes || '#DDF5D0', mouth: 'jaw', brow: 'neutral', sockets: true }
      : { eyes: o.eyes || null, mouth: o.scream ? 'scream' : 'smile', brow: 'neutral', blush: true };
    var rc = buildRc({ tag: z ? 'z' : 'h', oid: o.outfit || 'custom', bname: o.body || 'human', B: CH.body(o.body || 'human'), O: O,
      skin: o.skin || SKIN[0], shirt: o.shirt || O.col || SHIRT[0], pants: o.pants || O.pants || PANTS[0], hair: o.hair || O.hc || HAIR[0],
      shoe: O.shoe, face: face, arms: o.arms === 'pump' ? 'run' : o.arms === 'knife' ? 'idle' : o.arms, still: !!o.still,
      seed: (X * 0.013) % 4, back: !!o.back, lean: o.lean || 0, hunch: o.hunch ? 0.12 : 0, live: { front: o.arms === 'knife', back: !!o.backHand },
      hook: EN.accent, torn: z, wounds: o.blood ? 1 + (o.blood % 2) : 0, halo: o.halo || null, glow: o.glow || null,
      mot: { strideK: 1, liftK: 1 }, hat: O.hat });
    drawFigure(c, X, Y, o.u, f, rc, o, performance.now());
  };

  // Arda: the hero. Red hoodie, quiff, earbuds, warm rim glow, ground halo. Same params as person().
  S.hero = function (c, X, Y, o) {
    var O = CH.outfit('hero'), f = o.face === -1 ? -1 : 1;
    var rc = buildRc({ tag: 'hero', oid: 'hero', bname: 'hero', B: CH.body('hero'), O: O, skin: o.skin || '#E0AC80',
      shirt: o.shirt || O.col, pants: o.pants || O.pants, hair: o.hair || O.hc, shoe: O.shoe, face: CH.heroFace, arms: 'run',
      still: !!o.still, seed: (X * 0.013) % 4, back: !!o.back, lean: 0.03, live: { front: o.arms === 'knife', back: !!o.backHand },
      mot: { gait: 'walk', strideK: 1.35, liftK: 1.2, bob: 0.02 }, halo: 'rgba(255,214,150,0.32)', glow: 'rgba(255,226,170,0.6)', hook: null });
    drawFigure(c, X, Y, o.u, f, rc, o, performance.now());
  };

  // Enemy at world pos; Rd is P.Render (X/Y/ppm/ctx). Handles emerge, turning, elite, boss, crawler.
  S.enemy = function (Rd, e, hero) {
    var c = Rd.ctx, u = Rd.ppm, X = Rd.X(e.x), Y = Rd.Y(e.y - e.r * 0.6), f = hero.x >= e.x ? 1 : -1;
    var human = e.state === 'dormant' || ((e.civ || e.type === 'diner') && e.state === 'turning');
    var def = EN.def(e.type), uf = u * def.scale * (e.boss ? 2.2 : 1) * (e.elite ? 1.25 : 1);
    var emerge = e.door ? Math.min(1, (e.age || 0) / 0.3) : 1;
    if (e.state === 'turning') X += (Math.random() - 0.5) * 3;
    c.save();
    if (emerge < 1) { c.globalAlpha = emerge; c.translate(X, Y); c.scale(0.7 + 0.3 * emerge, 0.7 + 0.3 * emerge); c.translate(-X, -Y); }
    if (e.elite) eliteAura(c, X, Y, u, e);
    if (e.boss) bossAura(c, X, Y, uf);
    S.shadow(c, X, Y, uf, e.type === 'crawler' ? 1.3 : 1);
    var rc = def.custom ? crawlerRc(e) : zombieRc(e, def, human, f);
    var o = { flash: e.flash, phase: (e.walk || 0) * 5.5, recoil: e.kbx > 0 ? 0.1 : e.kbx < 0 ? -0.1 : 0 };
    drawFigure(c, X, Y, uf, f, rc, o, performance.now());
    if (e.elite) eliteMarks(c, X, Y, uf, e);
    if (e.boss) bossMark(c, X, Y, uf);
    if (e.burn && e.burn.length) {
      var t = performance.now() / 90;
      c.fillStyle = 'rgba(255,140,40,0.75)';
      for (var i = 0; i < 3; i++) { c.beginPath(); c.ellipse(X + (i - 1) * 0.12 * uf, Y - (0.5 + 0.15 * Math.sin(t + i)) * uf, 0.06 * uf, 0.13 * uf, 0, 0, TAU); c.fill(); }
    }
    c.restore();
  };

  // Zombie recipe. Outfit from e.skin, else the L1 crowd by variant. Colours are desaturated for zombies.
  function zombieRc(e, def, human, f) {
    var v = (e.variant | 0) & 7, skinId = e.skin || def.skin || EN.L1[v], O = CH.outfit(skinId), T = human ? function (x) { return x; } : R.tint;
    var sc = O.top === 'overall' ? O.base : O.col, windupQ = Math.round(clamp(e.windup || 0, 0, 1) * 3) / 3, swellQ = Math.round(clamp(e.swell || 0, 0, 1) * 4) / 4;
    // Brutes keep dull eyes until the wind-up turns them red.
    var eyeC = def.body === 'brute' && windupQ <= 0 ? '#A8382C' : def.eyes;
    var face = human ? { mouth: 'smile', brow: 'neutral', blush: false } : { eyes: eyeC, glow: eyeC, mouth: 'jaw', brow: def.brow, sockets: true };
    var z = !human;
    return buildRc({ tag: human ? 'h' : 'z', oid: skinId, bname: def.body, B: EN.body(def.body), O: O,
      skin: T(SKIN[v & 3]), shirt: T(sc), pants: T(O.pants), hair: T(O.hc || HAIR[v % 5]), shoe: T(O.shoe || '#2A2A2A'),
      face: face, arms: human && e.state === 'turning' ? 'flail' : def.arms, still: human, seed: (e.id || 0) % 4,
      back: !human && e.vy > 0.35, lean: def.lean, hunch: def.hunch, crouch: (def.body === 'brute' ? 0.18 * windupQ : 0),
      windup: windupQ, swell: swellQ, mot: def, hook: EN.accent, bib: def.bib, torn: z && def.torn, wounds: z ? def.wounds || 0 : 0,
      pust: z && def.pust, throat: z && def.throat, eyes: def.eyes,
      glow: e.elite ? ELITE_GLOW : e.boss ? BOSS_GLOW : null, halo: null });
  }
  function crawlerRc(e) {
    var v = (e.variant | 0) & 7, O = CH.outfit(e.skin || EN.L1[v]), T = R.tint, def = EN.def('crawler');
    return buildRc({ tag: 'c', oid: 'crawl', bname: 'human', B: CH.body('human'), O: O, skin: T(SKIN[v & 3]), shirt: T(O.col),
      pants: T(O.pants), hair: T(O.hc || HAIR[1]), shoe: T(O.shoe || '#2A2A2A'), face: {}, custom: true, eyes: def.eyes,
      still: false, seed: 0, mot: {}, glow: e.elite ? ELITE_GLOW : null });
  }

  // Civilians fleeing: varied living humans, arms up, running. v = {x, y, drift, walk, scream, variant, skin?}.
  S.civilian = function (Rd, v) {
    var c = Rd.ctx, u = Rd.ppm, X = Rd.X(v.x), Y = Rd.Y(v.y), vv = (v.variant | 0) & 7, id = v.skin || EN.CIV[vv], O = CH.outfit(id);
    S.shadow(c, X, Y, u);
    var rc = buildRc({ tag: 'h', oid: id, bname: 'human', B: CH.body('human'), O: O, skin: SKIN[vv & 3], shirt: O.top === 'overall' ? O.base : O.col,
      pants: O.pants, hair: O.hc || HAIR[1], shoe: O.shoe || '#2A2A2A', face: { mouth: v.scream > 0 ? 'scream' : 'open', brow: 'worried', blush: false },
      arms: 'panic', still: false, seed: (v.x * 0.37) % 4, mot: { gait: 'walk', strideK: 1.4, liftK: 1.3, sway: 0.02 }, hook: EN.accent });
    drawFigure(c, X, Y, u, v.drift >= 0 ? 1 : -1, rc, { phase: v.walk * 4.5, flash: 0 }, 0);
    if (v.scream > 0) {
      c.font = 'italic 900 ' + Math.round(0.5 * u) + 'px ' + 'system-ui'; c.textAlign = 'center'; c.lineWidth = 4; c.strokeStyle = INK; c.fillStyle = '#FFD166';
      c.strokeText('!', X + 0.25 * u, Y - 1.35 * u); c.fillText('!', X + 0.25 * u, Y - 1.35 * u);
    }
  };

  // Corpse per type (still pose, flail arms). p.fling = charred canister variant. Keeps the original fall/spin.
  S.corpse = function (Rd, p) {
    var c = Rd.ctx, u = Rd.ppm, X = Rd.X(p.x), Y = Rd.Y(p.y - 0.2), k = 1 - p.t / p.T, fall = Math.min(1, k / 0.45), f = p.dx >= 0 ? 1 : -1;
    var def = EN.def(p.etype || 'walker'), v = (p.variant | 0) & 7, O = CH.outfit(p.skin || EN.L1[v]), ch = !!p.fling, rc;
    c.save(); c.globalAlpha = k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4;
    if (p.fling) {
      var el = k * p.T, zz = Math.max(0, 6 * el - 10 * el * el);
      X += p.dx * el * 0.25 * u; Y -= zz * u;
      c.translate(X, Y); c.rotate(f * el * 9); c.translate(-X, -Y);
    } else { c.translate(X + f * fall * 0.25 * u, Y); c.rotate(f * fall * Math.PI / 2 * 0.95); c.translate(-X, -Y); }
    rc = buildRc({ tag: ch ? 'x' : 'k', oid: p.skin || EN.L1[v], bname: def.body || 'human', B: def.custom ? CH.body('human') : EN.body(def.body),
      O: O, skin: ch ? '#3A3833' : R.tint(SKIN[v & 3]), shirt: ch ? '#26262B' : R.tint(O.top === 'overall' ? O.base : O.col),
      pants: ch ? '#1A1A1E' : R.tint(O.pants), hair: ch ? '#111111' : R.tint(O.hc || HAIR[1]), shoe: ch ? '#111111' : R.tint(O.shoe || '#2A2A2A'),
      face: { eyes: null, mouth: 'jaw', sockets: true, brow: 'neutral' }, arms: 'flail', still: true, seed: 0, hook: EN.accent,
      torn: !ch, wounds: ch ? 0 : 2, custom: !!def.custom, eyes: def.eyes, mot: {} });
    drawFigure(c, X, Y, u * def.scale, f, rc, { flash: 0, phase: 0 }, 0);
    c.restore();
  };

  // Legacy crawler call: legless figure at (X, Y) with o.u, o.skin, o.shirt, o.phase, o.flash.
  S.crawler = function (c, X, Y, o) {
    var v = 0, O = CH.outfit(o.outfit || EN.L1[v]), def = EN.def('crawler');
    var rc = buildRc({ tag: 'c', oid: 'crawl', bname: 'human', B: CH.body('human'), O: O, skin: o.skin || SKIN[0], shirt: o.shirt || O.col,
      pants: O.pants, hair: HAIR[1], shoe: '#2A2A2A', face: {}, custom: true, eyes: def.eyes, still: false, seed: 0, mot: {} });
    drawFigure(c, X, Y, o.u, o.face === -1 ? -1 : 1, rc, { phase: o.phase || 0, flash: o.flash || 0 }, 0);
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

  function eliteAura(c, X, Y, u, e) {
    var pt = performance.now() / 1000;
    c.fillStyle = 'rgba(224,64,251,' + (0.25 + 0.12 * Math.sin(pt * 6)) + ')';
    c.beginPath(); c.ellipse(X, Y, 0.7 * u, 0.28 * u, 0, 0, TAU); c.fill();
    c.strokeStyle = '#E040FB'; c.lineWidth = 3; c.stroke();
  }
  // Elite: crown marker above the head and a purple HP bar.
  function eliteMarks(c, X, Y, u, e) {
    var top = Y - 1.22 * u;
    c.fillStyle = '#E040FB'; c.strokeStyle = INK; c.lineWidth = 2;
    c.beginPath(); c.moveTo(X - 0.18 * u, top); c.lineTo(X - 0.18 * u, top - 0.16 * u); c.lineTo(X - 0.09 * u, top - 0.07 * u);
    c.lineTo(X, top - 0.2 * u); c.lineTo(X + 0.09 * u, top - 0.07 * u); c.lineTo(X + 0.18 * u, top - 0.16 * u); c.lineTo(X + 0.18 * u, top); c.closePath(); c.fill(); c.stroke();
    var w = 0.9 * u, f = Math.max(0, e.hp / e.maxHp);
    c.fillStyle = INK; c.fillRect(X - w / 2 - 2, top + 4, w + 4, 8);
    c.fillStyle = '#E040FB'; c.fillRect(X - w / 2, top + 6, w * f, 4);
  }
  // Boss: menacing red ground aura, and a jagged danger marker above the head (no religious symbols).
  function bossAura(c, X, Y, u) {
    var g = c.createRadialGradient(X, Y, 0, X, Y, 0.9 * u);
    g.addColorStop(0, 'rgba(255,77,46,0.35)'); g.addColorStop(1, 'rgba(255,77,46,0)');
    c.fillStyle = g; c.beginPath(); c.ellipse(X, Y, 0.9 * u, 0.36 * u, 0, 0, TAU); c.fill();
  }
  function bossMark(c, X, Y, u) {
    var t = performance.now() / 1000, s = 1 + 0.08 * Math.sin(t * 5), cx = X, cy = Y - 1.42 * u, i, a, r;
    c.beginPath();
    for (i = 0; i < 12; i++) { a = i * Math.PI / 6 - Math.PI / 2; r = (i % 2 ? 0.06 : 0.15) * u * s; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
    c.closePath(); c.fillStyle = '#FFC93C'; c.fill(); c.strokeStyle = '#FF4D2E'; c.lineWidth = 2.5; c.stroke();
  }

  return S;
})();
