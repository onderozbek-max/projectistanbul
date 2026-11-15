// Raster character drawing (view only; D-066). Draws Arda, the enemy types, the bosses, corpses and the marti gull from the
// characters atlases (P.ArtRaster, assets/art/manifest.json), through the same hooks the code art uses (sprites.js S.hero,
// S.enemy, S.corpse; art-enemies4/6 for the vehicle and gull overlays). Every function returns false when it cannot draw,
// so the caller keeps the code-drawn art: the flag is off, the manifest or the atlas is not ready, the figure is a dormant or
// turning civilian, or the type has no atlas. Sizes come from the code art's own unit (figUnit in sprites.js: rig scale,
// spriteScale, boss 2.2, elite 1.25), so a raster figure stands where the code figure stands; one atlas height = one unit.
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
  var SQ = { sx: 1, sy: 1, rot: 0, ox: 0 };   // scratch, reused every frame (no per-frame allocation)
  ['side', 'front', 'back'].forEach(function (v) {
    HERO_KEY[v] = { idle: v + '.idle' };
    for (var i = 1; i <= 4; i++) HERO_KEY[v]['walk' + i] = v + '.walk' + i;
  });

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function on() { return !!(A && A.enabled() && A.ready(CHAR)); }
  // Civilians before they turn (the code art draws them as people): not raster figures.
  function humanLook(e) { return e.state === 'dormant' || ((e.civ || e.type === 'diner') && e.state === 'turning'); }
  // The four walker outfits, picked by the enemy id exactly as art-enemy-look.js does (EN.variantOf).
  C.walkerAtlas = function (id) { return 'walker_' + LK.walkerVariants[EN.variantOf(id)].slice(5); };
  function bossAtlas(e) {
    var k = LK.bossCostumes[e.nameKey];
    return (k && BOSS_COSTUME[k.costume]) || BOSS_ARCH[e.type] || null;
  }
  function atlasOf(e) {
    if (e.boss) return bossAtlas(e);
    if (e.type === 'walker') return C.walkerAtlas(e.id);
    return TYPE_ATLAS[e.type] || null;
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
      if ((e.windup || 0) > 0) return 'attack_windup';
      if (e.ai && e.ai.m === 'charge') return 'attack_hit';
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
    OPTS.mirror = f < 0; OPTS.rot = SQ.rot; OPTS.sx = SQ.sx; OPTS.sy = SQ.sy; OPTS.alpha = alpha;
    OPTS.flash = flash ? 1 : 0; OPTS.outline = outlineCol || null; OPTS.outlineW = outlineCol ? V.eliteOutline.units * uf : 0; OPTS.tint = null;
    return OPTS;
  }

  // Enemy body (S.enemy, inside the code's transform stack). Elite outline here; the crown and the boss mark stay in sprites.js.
  C.enemy = function (c, e, o, X, Y, uf, f) {
    if (!on() || humanLook(e)) return false;
    var id = atlasOf(e), src = id && A.entry(CHAR, id), def = EN.defFor(e), moving = !o.stopped, frame;
    if (!src) return false;
    frame = enemyFrame(e, o, moving);
    if (!A.rect(CHAR, id, frame)) frame = 'idle';
    if (!A.rect(CHAR, id, frame)) return false;
    squashOf(o, moving, animOf(def), (e.id || 0) % 4, uf);
    return A.draw(c, CHAR, id, frame, X + SQ.ox, Y, uf / src.heightPx, setOpts(f, o.flash > 0 && !o.noWhite, o.outline, uf));
  };

  // Arda (S.hero). The view is back when moving away, side when moving across (o.side), front otherwise. Side faces right: mirror
  // for left. Knife and back-hand weapons are still drawn live at the rig's shoulders, as before, until the weapon art lands.
  function heroView(o) { return o.back ? 'back' : o.side ? 'side' : 'front'; }
  var HERO_DEF = {};   // Arda has no entry in EN.DEFS: his squash is the plain view.anim (no per-type gait)
  C.hero = function (c, X, Y, o, f, look) {
    if (!on()) return false;
    look = look || {};
    var src = A.entry(CHAR, HERO), view = heroView(o), moving = !o.still, keys = HERO_KEY[view], frame, ok;
    if (!src) return false;
    frame = moving ? keys['walk' + (quarter(o.phase || 0, 4) + 1)] : keys.idle;
    if (!A.rect(CHAR, HERO, frame)) frame = keys.idle;
    if (!A.rect(CHAR, HERO, frame)) return false;
    squashOf(o, moving, animOf(HERO_DEF), (X * 0.013) % 4, o.u);
    if (look.halo) haloOf(c, X + SQ.ox, Y, o.u, look.halo);
    handsOf(c, X, Y, o, f, look);     // under the body: the atlas torso and sleeves cover the arm roots, the blade and gun stay out front
    ok = A.draw(c, CHAR, HERO, frame, X + SQ.ox, Y, o.u / src.heightPx, setOpts(view === 'side' ? f : 1, o.flash > 0 && !o.noWhite, null, o.u));
    return ok;
  };
  // The warm ground halo of the code figure (same gradient and ellipse, in unit space).
  function haloOf(c, X, Y, u, col) {
    var y = Y - 0.02 * u, g = c.createRadialGradient(X, y, 0, X, y, 0.46 * u);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.save(); c.fillStyle = g; c.beginPath(); c.ellipse(X, y, 0.46 * u, 0.17 * u, 0, 0, TAU); c.fill(); c.restore();
  }
  // Live hand props on top of the raster body, at the rig's shoulder points (the same anchors as the code figure, scaled by the squash).
  function handsOf(c, X, Y, o, f, look) {
    var B = CH.body('hero'), u = o.u, ax = X + SQ.ox, ay = Y + SQ.sy * B.shY * u;
    if (o.arms === 'knife' && !o.noArms) P.Sprites.knifeArm(c, { x: ax + f * SQ.sx * B.shX * u, y: ay }, u, f, o.knifeA, look.skin, look.shirt);
    if (o.backHand) o.backHand(c, { x: ax - f * SQ.sx * B.shX * u, y: ay }, u, f, look.skin, look.shirt);
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
