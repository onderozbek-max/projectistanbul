// Raster character drawing (view only; D-066). Draws Arda, the enemy types, the bosses, corpses and the marti gull from the
// characters atlases (P.ArtRaster, assets/art/manifest.json), through the same hooks the code art uses (sprites.js S.hero,
// S.enemy, S.corpse; art-enemies4/6 for the vehicle and gull overlays). Every function returns false when it cannot draw,
// so callers can handle missing art. Sizes come from the code art's own unit (figUnit in sprites.js: rig scale,
// spriteScale, boss 2.2, elite 1.25), with the atlas's idle height as the reference for all poses.
// Frames come from fields the view already receives: walk phase (o.phase), stopped (o.stopped), hit flash (o.flash), wind-up
// (e.windup), the boss attack state (e.ai.m) and the breath clock. Walker outfits use the id hash of art-enemy-look.js.
P.ArtRasterChars = (function () {
  var C = {}, A = P.ArtRaster, EN = P.ArtEnemies, R = P.ArtRig, CH = P.ArtChars, LK = P.CFG.enemyLook, V = P.CFG.view, FEEL = P.CFG.feel;
  var CHAR = 'characters', HERO = 'hero_arda', TAU = R.TAU;
  // Enemy type -> atlas id (walker is chosen per id, see C.walkerAtlas). Types without an atlas are drawn by the code art.
  var TYPE_ATLAS = { runner: 'runner', crawler: 'crawler', diner: 'diner', spitter: 'spitter', screamer: 'screamer', bloater: 'bloater',
    hardhat: 'hardhat', copci: 'copci', kurye: 'kurye', brute: 'brute', cayci: 'cayci', parkur: 'parkur', kasap: 'kasap', zehirli: 'zehirli',
    marti: 'marti' };
  // Bosses: the hood's costume first (config-enemy-look bossCostumes, nameKey 'boss.<hood>'), then the archetype (e.type, bossByHood).
  var BOSS_ARCH = { brute: 'boss_vatman', bloater: 'boss_bloater', taksici: 'boss_taksici', kasapBoss: 'boss_kasap', spitter: 'boss_spitter',
    tourGuide: 'boss_docent', antiquarian: 'boss_antiquarian' };
  var BOSS_COSTUME = { vatman: 'boss_vatman', guide: 'boss_guide', bride: 'boss_bride', keeper: 'boss_keeper', bigbro: 'boss_bigbro' };
  var HERO_KEY = {}, OPTS = { mirror: false, rot: 0, sx: 1, sy: 1, alpha: undefined, flash: 0, outline: null, outlineW: 0, tint: null };
  var SQ = { sx: 1, sy: 1, rot: 0, ox: 0, skew: 0 };   // scratch, reused every frame (no per-frame allocation)
  var PREP = { switchHook: .24, switchRails: .10, roast: .30, arcRelay: .13, arcKnot: .24,
    districtTram: .14, vatmanLever: .31, vatmanBell: .12, counterweights: .32, ropeSweep: .25,
    ribbonSweep: .22, bridgeCast: .28, bridgeNet: .20 };
  // Left and right fist centres in atlas cell pixels, in idle then walk1..4 order. Recheck when replacing hero_arda.png.
  var HERO_HANDS = {
    side: [[8, 103, 54, 91], [8, 97, 77, 88], [7, 103, 57, 90], [17, 87, 69, 91], [8, 103, 48, 89]],
    front: [[8, 107, 70, 107], [19, 104, 72, 86], [8, 107, 70, 106], [7, 86, 60, 104], [8, 107, 70, 106]],
    back: [[8, 108, 63, 107], [8, 110, 66, 62], [7, 108, 70, 109], [8, 62, 66, 108], [8, 107, 70, 109]]
  };
  ['side', 'front', 'back'].forEach(function (v) {
    HERO_KEY[v] = ['idle', 'walk1', 'walk2', 'walk3', 'walk4'].map(function (pose) { return v + '.' + pose; });
  });

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function on() { return !!(A && A.enabled() && A.ready(CHAR)); }
  // Civilians before they turn (the code art draws them as people): not raster figures.
  function humanLook(e) { return e.state === 'dormant' || ((e.civ || e.type === 'diner') && e.state === 'turning'); }
  // The four walker outfits, picked by the enemy id exactly as art-enemy-look.js does (EN.variantOf).
  C.walkerAtlas = function (id) { return 'walker_' + LK.walkerVariants[EN.variantOf(id)].slice(5); };
  function bossAtlas(e) {
    if (e.bossPreset === 'switchkeeper' || e.bossPreset === 'ticketMan') return 'boss_keeper';
    if (e.bossPreset === 'roaster') return 'boss_bigbro';
    if (e.bossPreset === 'linekeeper') return 'hardhat';
    if (e.bossPreset === 'bellkeeper') return 'boss_keeper';
    var k = LK.bossCostumes[e.nameKey];
    return (k && BOSS_COSTUME[k.costume]) || BOSS_ARCH[e.type] || null;
  }
  function atlasOf(e) {
    if (e.boss) return bossAtlas(e);
    if (e.type === 'walker') return C.walkerAtlas(e.id);
    return TYPE_ATLAS[e.type] || null;
  }
  C.portrait = function (c, e, x, y, height) {
    if (!e) return false;
    if (e.bossPreset && portraitBoss(c, e, x, y, height)) return true;
    var id = on() && atlasOf(e), frame = id && A.rect(CHAR, id, 'idle');
    if (!frame) return false;
    var k = height / Math.max(frame.sw, frame.sh);
    c.drawImage(frame.img, frame.sx, frame.sy, frame.sw, frame.sh, x - frame.sw * k / 2, y - frame.sh * k, frame.sw * k, frame.sh * k);
    return true;
  };
  function portraitBoss(c, e, x, y, height) {
    var actor = Object.assign({ ai: { m: 'idle' } }, e), u = height / 2.68;
    if (P.BossPuppet && P.CFG.bossPerformance[e.bossPreset] && P.BossPuppet.draw(c, actor, { stopped:true }, x, y, height / P.CFG.bossPerformance[e.bossPreset].height, 1)) return true;
    if (P.BossActing && P.BossActing.draw(c, actor, { stopped: true }, x, y, u, 1)) return true;
    if (e.bossPreset === 'cook' && P.CookFx) return P.CookFx.bossBody(c, actor, {}, x, y, height / 2.25, 1);
    if (e.bossPreset === 'quayCaptain' && P.EminonuBossFx) return P.EminonuBossFx.bossBody(c, actor, {}, x, y, u, 1);
    return e.bossPreset === 'ticketMan' && P.SirkeciFx && P.SirkeciFx.bossBody(c, actor, {}, x, y, u, 1);
  }
  // True when the raster figure is drawn for this enemy, so the code's vehicle overlays (scooter, taxi) can step aside.
  C.covers = function (e) {
    var id = on() && !humanLook(e) ? atlasOf(e) : null;
    return !!id && !!A.rect(CHAR, id, 'idle');
  };

  // Walk frames: quarter(phase, n) is the n-step cycle of the walk phase (2 for enemies, 4 for Arda).
  function quarter(phase, n) { var t = (phase % TAU + TAU) % TAU; return Math.floor(t / TAU * n) % n; }
  function enemyFrame(e, o, moving) {
    if (e.boss) {
      if (e.bossPreset === 'cook') return moving ? (quarter(o.phase || 0, 2) ? 'walk2' : 'walk1') : 'idle';
      if ((e.windup || 0) > 0) return 'attack_windup';
      if (e.exposed) return 'hurt';
      if (e.ai && (e.ai.m === 'charge' || e.ai.m === 'switchRecover')) return 'attack_hit';
      if (o.flash > 0) return 'hurt';
    } else if (o.flash > 0) return 'hit';
    if (!moving) return 'idle';
    return quarter(o.phase || 0, 2) ? 'walk2' : 'walk1';
  }
  function animOf(def) {
    if (def._raster) return def._raster;
    var k = (def && def.animK) || {}, S = V.anim;
    return (def._raster = { stepWidth: S.stepWidth * (k.step || 1), squashWalk: S.squashWalk * (k.squash || 1), squashIdle: S.squashIdle * (k.squash || 1) });
  }
  // The code art's squash (sprites.js squash, drawFigure): walk stretch or idle breath, hit squash, hit spring and recoil.
  // Fills SQ and returns it.
  function squashOf(o, moving, anim, seed, uf) {
    var S = V.anim, hit = clamp01((o.flash || 0) / FEEL.hitFlash), w = moving ? Math.abs(Math.sin(o.phase || 0)) : 0;
    var breath = Math.floor(performance.now() / 260 + seed) % 4 * TAU / 4;
    SQ.sx = moving ? 1 + anim.stepWidth * w : 1;
    SQ.sy = moving ? 1 - anim.squashWalk * w : 1 + anim.squashIdle * Math.sin(breath);
    SQ.sx *= 1 + S.hitSquashX * hit; SQ.sy *= 1 - S.hitSquashY * hit;
    SQ.rot = 0; SQ.ox = (o.recoil || 0) * hit * uf;
    if (o.spring) { SQ.sx *= o.spring.x; SQ.sy *= o.spring.y; SQ.rot = o.spring.r || 0; SQ.ox += (o.spring.ox || 0) * uf; }
    return SQ;
  }
  // Shared draw options (reset on every call; the object is reused). alpha is optional (undefined = the context's alpha).
  function setOpts(f, flash, outlineCol, uf, alpha) {
    OPTS.mirror = f < 0; OPTS.rot = SQ.rot; OPTS.sx = SQ.sx; OPTS.sy = SQ.sy; OPTS.alpha = alpha; OPTS.skew = 0; OPTS.bands = null;
    OPTS.flash = flash ? 1 : 0; OPTS.outline = outlineCol || null; OPTS.outlineW = outlineCol ? V.eliteOutline.units * uf : 0; OPTS.tint = null;
    return OPTS;
  }

  function chargePose(e, id) {
    var ai = e.ai;
    if (e.bossPreset && ai && ai.dir && ai.act !== 'charge') {
      var prep = PREP[ai.act] || .12, angle = Math.abs(ai.dir.x) < .16 ? (ai.dir.y > 0 ? .22 : -.22) : ai.dir.x;
      if (ai.m === 'windup') return { lean: -prep * clamp01(e.windup || 0), dir: angle, face: ai.dir.x };
      if (ai.m === 'switchRecover') return { lean: prep * .64 * clamp01(ai.t || 0), dir: angle, face: ai.dir.x };
      if (ai.m === 'walk' && Math.abs(e.vx || 0) > .20) return { lean: .055, dir: Math.sign(e.vx) };
    }
    if (id !== 'boss_vatman' && e.bossPreset !== 'roaster' || !ai || ai.act !== 'charge' || !ai.dir) return null;
    if (ai.m === 'windup') return { lean: -0.15 * Math.min(1, (e.windup || 0) * 2), dir: ai.dir.x };
    if (ai.m === 'charge') return { lean: 0.2, dir: ai.dir.x };
    // After the lane ends the boss eases out of the forward lean on the existing attack cooldown.
    if (ai.m === 'walk' && e.type === 'brute' && ai.cd > 0) {
      var def = P.CFG.bosses.brute, gap = (ai.rageOn ? def.rageGap : def.gap) * ai.gapMul;
      var remaining = clamp01((ai.cd / gap - 0.78) / 0.22);
      if (remaining > 0) return { lean: 0.2 * remaining * remaining, dir: ai.dir.x };
    }
    return null;
  }

  // Enemy body (S.enemy, inside the code's transform stack). Elite outline here; the crown and the boss mark stay in sprites.js.
  C.enemy = function (c, e, o, X, Y, uf, f) {
    if (!on()) return false;
    if(P.CivilianActing&&P.CivilianActing.diner&&P.CivilianActing.diner(c,e,o,X,Y,uf/EN.defFor(e).scale,f))return true;
    if (humanLook(e) && P.CivilianActing) return P.CivilianActing.draw(c, X, Y,
      P.CivilianActing.height(uf/EN.defFor(e).scale/(V.spriteScale[e.type]||1)),f,o.phase||0,false,e.state==='turning',P.CivilianActing.look(e));
    var id = atlasOf(e), src = id && A.entry(CHAR, id), def = EN.defFor(e), moving = !o.stopped, frame;
    if (!src) return false;
    frame = enemyFrame(e, o, moving);
    squashOf(o, moving, animOf(def), (e.id || 0) % 4, uf);
    var charge = chargePose(e, id);
    if (charge) {
      var face = charge.face === undefined ? charge.dir : charge.face;
      if (Math.abs(face) > 0.12) f = face < 0 ? -1 : 1;
      var motion = (P.Settings && P.Settings.reduceMotion ? 0.35 : 1) * charge.lean;
      SQ.rot += motion * charge.dir;
    }
    if (e.boss) SQ.sy = Math.max(0.94, Math.min(1.06, SQ.sy));
    var opts = setOpts(f, o.flash > 0 && !o.noWhite, o.outline, uf), x = X + SQ.ox, scale = uf / src.heightPx;
    var y = Y + (o.spring && o.spring.oy || 0) * uf;
    var jointFrame = A.rect(CHAR, id, frame === 'idle' ? 'idle' : e.boss ? frame : 'idle');
    if (P.EnemyActing && jointFrame && !o.flash && !e.swingAir && P.EnemyActing.draw(c, jointFrame, e, o, x, y, scale, f)) return true;
    return A.draw(c, CHAR, id, frame, x, y, scale, opts) || (frame !== 'idle' && A.draw(c, CHAR, id, 'idle', x, y, scale, opts));
  };

  // The atlas already paints the hero’s arms. Attach props to the fists in the selected frame.
  function heroView(o) { return o.back ? 'back' : o.side ? 'side' : 'front'; }
  function attackView(angle) {
    return Math.abs(Math.cos(angle)) >= 0.58 ? 'side' : Math.sin(angle) > 0 ? 'back' : 'front';
  }
  var SIDE_ATTACK = { reach: 1, brace: 2, raise: 3, pull: 4 };
  function attackFrame(view, arm, hand) {
    if (view === 'side') return SIDE_ATTACK[arm] || 0;
    if (arm === 'raise' || arm === 'pull') return hand > 0 ? 1 : 3;
    return arm === 'brace' ? 2 : 0;
  }
  var HERO_DEF = {};
  C.hero = function (c, X, Y, o, f, look) {
    if (!on()) return false;
    look = look || {};
    var src = A.entry(CHAR, HERO), stance = o.attackStance, moving = !o.still, scale, r;
    if (!src) return false;
    if (o.defeat > 0 && A.rect(CHAR, HERO, 'poses.down')) {
      var fall = Math.min(1, o.defeat * 1.4), down = A.rect(CHAR, HERO, 'poses.down');
      var k = o.u / src.heightPx;
      c.save(); c.globalAlpha *= fall;
      c.drawImage(down.img, down.sx, down.sy, down.sw, down.sh, X - down.sw * k / 2, Y - down.sh * k * .4, down.sw * k, down.sh * k);
      c.restore();
      if (fall >= 1) return true;
      c.save(); c.translate(X, Y); c.rotate(f * fall * .7); c.globalAlpha *= 1 - fall;
      A.draw(c, CHAR, HERO, 'front.idle', 0, 0, k, {}); c.restore(); return true;
    }
    var attack = stance && stance.arm !== 'rest';
    var view = attack ? attackView(stance.aim) : heroView(o), keys = HERO_KEY[view];
    var walkFrame = moving ? 1 + quarter(o.phase || 0, 4) : 0;
    var i = attack && !o.workPoint ? attackFrame(view, stance.arm, o.attackHand) : walkFrame;
    r = A.rect(CHAR, HERO, keys[i]);
    if (!r && i) { i = 0; r = A.rect(CHAR, HERO, keys[0]); }
    if (!r && view !== 'front') {
      view = 'front'; keys = HERO_KEY.front; i = 0; r = A.rect(CHAR, HERO, keys[0]);
    }
    if (!r) return false;
    squashOf(o, moving && !attack, animOf(HERO_DEF), (X * 0.013) % 4, o.u);
    X += SQ.ox;
    scale = o.u / src.heightPx;
    var mirror = view === 'side' ? (attack ? (Math.cos(stance.aim) < 0 ? -1 : 1) : f) : 1;
    SQ.skew = 0;
    var bands;
    if (attack && stance.hip !== undefined) {
      bands = P.HeroBody.bands(r, view, i, stance);
      SQ.sx *= 1 + stance.spread * .53;
    } else if (stance) {
      SQ.rot += stance.roll;
      SQ.skew = -stance.lean * mirror * 0.68;
      SQ.sy *= 1 + stance.height + stance.depth * 0.10;
      SQ.sx *= 1 - stance.height * 0.32;
    }
    var rigged = P.ActorRig && P.CFG.experience && (moving || o.settling || o.workPoint || attack && o.attackId);
    if (look.halo) haloOf(c, X, Y, o.u, look.halo);
    if (rigged) {
      var lower = A.rect(CHAR, HERO, keys[walkFrame]);
      o.motion = o.motion || {};
      if (lower) o.motion.lowerBody = { rect: lower, cut: P.HeroBody.waist(view, walkFrame),
        hip: P.CFG.experience.heroPelvis[view][walkFrame], upperCut: P.HeroBody.waist(view, i), upperHip: P.CFG.experience.heroPelvis[view][i] };
      if (attack && P.HeroContact) P.HeroContact.apply(r,view,i,o,mirror,
        [[HERO_HANDS[view][i][0],HERO_HANDS[view][i][1]],[HERO_HANDS[view][i][2],HERO_HANDS[view][i][3]]]);
      if (o.workPoint) {
        o.motion = o.motion || {};
        var target = { x: (o.workPoint.x - X) / (scale * mirror) + r.px, y: (o.workPoint.y - Y) / scale + r.py };
        var side = (o.attackHand < 0) !== (mirror < 0) ? 'left' : 'right';
        o.motion.workTargets = {}; o.motion.workTargets[side] = target;
        o.motion.handPoints = [[HERO_HANDS[view][i][0],HERO_HANDS[view][i][1]],[HERO_HANDS[view][i][2],HERO_HANDS[view][i][3]]];
      }
      P.ActorRig.draw(c, r, X, Y, scale, mirror, view, o.phase || 0, o.gaitGain === undefined ? 1 : o.gaitGain, o.motion, stance);
      var left = P.ActorRig.hand(HERO_HANDS[view][i][0], HERO_HANDS[view][i][1]);
      var right = P.ActorRig.hand(HERO_HANDS[view][i][2], HERO_HANDS[view][i][3]);
      function grip(p) { return { x: X + (p.x - r.px) * scale * mirror, y: Y + (p.y - r.py) * scale }; }
      o.grips = { left: grip(mirror < 0 ? right : left), right: grip(mirror < 0 ? left : right) };
      if (o.weapons && !o.noArms) carry(c, o, f);
      return true;
    }
    if (o.weapons) {
      o.grips = gripsOf(X, Y, scale, r, HERO_HANDS[view][i], mirror, bands);
      if (!o.noArms) carry(c, o, f);
    }
    var opts = setOpts(mirror, false, null, o.u);
    if (o.flash > 0 && !o.noWhite) opts.flash = FEEL.heroFlashAlpha * clamp01(o.flash / FEEL.hitFlash);
    opts.skew = SQ.skew; opts.bands = bands;
    return A.draw(c, CHAR, HERO, keys[i], X, Y, scale, opts);
  };

  function gripsOf(X, Y, scale, r, points, mirror, bands) {
    var co = Math.cos(SQ.rot), si = Math.sin(SQ.rot);
    function at(i) {
      var mapped = bands && P.HeroBody.point(points[i], points[i + 1], bands);
      var py = (mapped ? mapped.y : points[i + 1]) - r.py;
      var x = ((mapped ? mapped.x : points[i]) - r.px + SQ.skew * py) * scale * SQ.sx * mirror, y = py * scale * SQ.sy;
      return { x: X + x * co - y * si, y: Y + x * si + y * co };
    }
    return { left: at(mirror < 0 ? 2 : 0), right: at(mirror < 0 ? 0 : 2) };
  }

  function carry(c, o, f) {
    var main = f > 0 ? o.grips.right : o.grips.left, off = f > 0 ? o.grips.left : o.grips.right;
    if (o.arms === 'knife') P.Sprites.knifeAt(c, main.x, main.y, o.u * 0.84, f > 0 ? 0.55 : Math.PI - 0.55);
    if (o.weapons.nailgun || o.weapons.nailstorm) P.WFx.gunAt(c, off.x, off.y, o.u * 0.8, f > 0 ? Math.PI - 0.48 : 0.48, f > 0);
  }

  // The warm ground halo of the code figure (same gradient and ellipse, in unit space).
  function haloOf(c, X, Y, u, col) {
    var y = Y - 0.02 * u, g = c.createRadialGradient(X, y, 0, X, y, 0.46 * u);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.save(); c.fillStyle = g; c.beginPath(); c.ellipse(X, y, 0.46 * u, 0.17 * u, 0, 0, TAU); c.fill(); c.restore();
  }
  // Corpse (S.corpse). The dead frame is lying down: it is drawn unrotated with its body centre on the death point. The standing
  // frame leans over as the figure falls (the code's fall angle) and cross-fades into the dead frame. Fling corpses spin in the air.
  // Owns its transform (the caller has saved the context). u = px per metre, scale = the type's rig scale (the code corpse unit).
  function corpseAtlas(p) {
    if (!p.etype || p.etype === 'walker') return p.id !== undefined ? C.walkerAtlas(p.id) : 'walker_' + LK.walkerVariants[(p.variant | 0) & 3].slice(5);
    return TYPE_ATLAS[p.etype] || null;
  }
  C.corpse = function (c, p, fall, f, X, Y, u, scale) {
    if (!on()) return false;
    if(P.CivilianActing&&P.CivilianActing.restaurantCorpse&&P.CivilianActing.restaurantCorpse(c,p,fall,f,X,Y,u))return true;
    var id = corpseAtlas(p), src = id && A.entry(CHAR, id), su = u * scale, k, el, zz, a, ang, sx = X, sy = Y;
    if (!src || !A.rect(CHAR, id, 'dead') || !A.rect(CHAR, id, 'idle')) return false;
    if (p.fling) {
      k = 1 - p.t / p.T; el = k * p.T; zz = Math.max(0, 6 * el - 10 * el * el);
      sx = X + p.dx * el * 0.25 * u; sy = Y - zz * u;
      SQ.sx = 1; SQ.sy = 1; SQ.rot = f * el * 9; SQ.ox = 0;
      return A.draw(c, CHAR, id, 'dead', sx, sy, su / src.heightPx, setOpts(f, false, null, su));
    }
    a = clamp01((fall - 0.4) / 0.4); ang = f * fall * Math.PI / 2 * 0.95;
    if (a < 1) {
      SQ.sx = 1; SQ.sy = 1; SQ.rot = ang; SQ.ox = 0;
      A.draw(c, CHAR, id, 'idle', X + f * fall * 0.25 * u, Y, su / src.heightPx, setOpts(f, false, null, su, 1 - a));
    }
    if (a > 0) {
      SQ.sx = 1; SQ.sy = 1; SQ.rot = 0; SQ.ox = 0;
      A.draw(c, CHAR, id, 'dead', X, Y, su / src.heightPx, setOpts(f, false, null, su, a));
    }
    return true;
  };

  // Marti, the seagull (art-enemies6 drawMarti). The body centre is the flight point; flap picks the wing frames.
  C.flier = function (c, X, Y, uf, f, flap) {
    if (!on()) return false;
    var src = A.entry(CHAR, 'marti'), frame = flap > 0.35 ? 'walk1' : flap < -0.35 ? 'walk2' : 'idle';
    if (!src) return false;
    if (!A.rect(CHAR, 'marti', frame)) frame = 'idle';
    SQ.sx = 1; SQ.sy = 1; SQ.rot = 0; SQ.ox = 0;
    return A.draw(c, CHAR, 'marti', frame, X, Y, uf / src.heightPx, setOpts(f, false, null, uf));
  };
  return C;
})();
