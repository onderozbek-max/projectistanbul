// Camera + game feel (DS 7): look-ahead, zoom, trauma shake, camera punch, damage numbers, particles.
// v0.7: the camera moves only for a visible cause. Ultimates, evolutions, the first knife stab and the boss finisher
// punch or zoom; level-up and bloater pops no longer punch or flash. Finisher: a kill-cam on the boss's last stand
// (zoom on the spot, 1.2 s slow, a FINISHER callout). Chain reactions (canisters, bloaters) get a callout and a rumble
// that lands 0.3 s after the blast. Last stand: the low-HP vignette beats like a heart (F.heart).
P.Fx = (function () {
  var F = { cam: null, nums: [], parts: [], swings: [], rings: [], bursts: [], letters: [] };
  var CHAIN_WIN = 0.35, CHAIN_R = 6, FINISH_T = 1.2;
  var SWING_T = 0.2;   // weapon swing arc and trail, seconds (was 0.16): a bit longer, drawn brighter in render.js

  F.reset = function (s) {
    var w = P.CFG.view.widthM;
    F.cam = { x: s.geo ? 0 : -6, y: s.hero.y, w: w, trauma: 0, punchT: 0, ox: 0, oy: 0, rot: 0, zoom: 1, kx: 0, ky: 0 };
    F.cam.y = targetY(s, w);
    F.nums = []; F.parts = []; F.swings = []; F.rings = []; F.bursts = []; F.letters = []; F.beat = null;
    F.focus = null; F.later = []; F.clock = 0; F.recent = []; F.lowArmed = true; F.chainCd = 0;
    F.edge = null; F.edgeAt = -1e9; F.heroFlashT = 0; F.heroFlashAt = -1e9;
    P.WFx.reset();
    if (P.Feel) P.Feel.reset();
    if (P.Vehicles) P.Vehicles.reset();
    if (P.EnemyFx && P.EnemyFx.reset) P.EnemyFx.reset();
    if (P.EventsFx && P.EventsFx.reset) P.EventsFx.reset();
    if (P.RenderWorld && P.RenderWorld.resetAmbience) P.RenderWorld.resetAmbience();
    if (P.Moments && P.Moments.reset) P.Moments.reset(s);   // T4 part 13: signature moments (moments.js) start clean each run
  };

  // Generated levels clamp the camera to the corridor (s.geo); L1 keeps its street walls and the restaurant.
  function targetX(s, w) {
    var h = s.hero, look = h.moving ? h.fx * P.CFG.view.lookAhead : 0;
    // G1: generated levels keep the camera centred. The hero clamp (|x| <= view.heroClampX) keeps him in the frame.
    if (s.geo) return 0;
    if (h.y < 0) return -6;
    var lim = Math.max(0, 7 - w / 2) + 1.2;
    return Math.min(lim, Math.max(-lim, h.x + look));
  }
  function targetY(s, w) {
    var h = s.hero, half = P.viewHalfH(w), look = h.moving ? h.fy * P.CFG.view.lookAhead : 0;
    if (s.mode === 'cutscene') return -5.2;
    var y = h.y + look;
    if (s.geo) return Math.min(Math.max(y, half - 3), s.geo.length + 2 - half);
    y = Math.max(y, -10 + half - 2.5);
    return Math.min(y, P.CFG.level.scaffoldY + 2 - half);
  }

  // Boss death beat: visuals (camera, particles, rings) run at k = 0.3 for 1.2 s. The sim keeps its rate;
  // main.js may also use F.timeScale() to slow the simulation. Off under Reduce motion.
  F.timeScale = function () { return F.beat && F.beat.t > 0 ? F.beat.k : 1; };
  // Last-stand heartbeat: 72 beats a minute, one soft pulse per beat (1.2 a second); 0..1, never a hard flash. The old
  // lub-dub had two peaks 0.15 s apart and reached four peaks in one second, over the 3 a second limit.
  F.heartPeriod = 60 / 72;
  F.heart = function (t) {
    var p = (t % F.heartPeriod) / F.heartPeriod, q = (1 + Math.cos(2 * Math.PI * p)) / 2;
    return q * q;
  };

  // Hero hit feedback (G3). The white flash is the view's own 60 ms; the edge pulse is a red wash at the screen edge that
  // decays in 0.25 s and comes at most once every 0.55 s. Both take a slot from the screen-wide flash budget (sprites.js
  // flashOk, at most 3 starts a second), so a crowd of hits cannot stack flashes. Both are off under F5's "reduce flashes"
  // ((P.Settings && P.Settings.reduceFlash), read only here).
  F.heroFlash = function () { return (P.Settings && P.Settings.reduceFlash) ? 0 : (F.heroFlashT || 0); };
  F.edgeAlpha = function () {
    if (!F.edge || (P.Settings && P.Settings.reduceFlash)) return 0;
    return P.CFG.feel.edgePulseAlpha * Math.max(0, F.edge.t / F.edge.T);
  };
  // A flash may start only when the screen budget grants a slot (sprites.js). No sprites module, no budget to apply.
  function flashGo() { var now = performance.now() / 1000; return !P.Sprites || !P.Sprites.flashOk || P.Sprites.flashOk(now); }
  F.flashGo = flashGo;
  function heroHit(ev, s) {
    var fe = P.CFG.feel, maxHp = s.hero.maxHp;
    if (F.clock - F.heroFlashAt >= fe.heroFlashGap && flashGo()) { F.heroFlashT = fe.hitFlash; F.heroFlashAt = F.clock; }
    if (ev.dmg >= fe.edgePulseFrac * maxHp && F.clock - F.edgeAt >= fe.edgePulseGap && flashGo()) {
      F.edge = { t: fe.edgePulseLife, T: fe.edgePulseLife }; F.edgeAt = F.clock;
    }
  }

  F.update = function (s, dt) {
    var c = F.cam, v = P.CFG.view, fe = P.CFG.feel, rm = (P.Settings && P.Settings.reduceMotion), rdt = dt;
    F.clock += rdt;
    F.chainCd = Math.max(0, (F.chainCd || 0) - rdt);
    F.heroFlashT = Math.max(0, (F.heroFlashT || 0) - rdt);
    if (F.edge) { F.edge.t -= rdt; if (F.edge.t <= 0) F.edge = null; }
    if (F.beat && F.beat.t > 0) { F.beat.t -= rdt; dt *= F.beat.k; }
    var wT = s.dir.zoomOut ? v.holdWidthM : v.widthM, tx = targetX(s, c.w), ty = targetY(s, c.w), wf = 0;
    if (F.focus && F.focus.t > 0 && !rm) {                       // finisher kill-cam: ease in, hold, ease out
      F.focus.t -= rdt;
      wf = Math.sin(Math.PI * Math.max(0, Math.min(1, 1 - F.focus.t / F.focus.T)));
      if (!s.geo) { tx += (F.focus.x - tx) * 0.6 * wf; wT *= 1 - 0.18 * wf; }   // generated levels: no x pan or zoom
      ty += (F.focus.y - ty) * 0.6 * wf;
    }
    if (F.focus && F.focus.t <= 0) F.focus = null;
    var dw = (v.holdWidthM - v.widthM) / v.zoomTime * dt;
    c.w = c.w < wT ? Math.min(wT, c.w + dw) : Math.max(wT, c.w - dw);
    var k = 1 - Math.exp(-dt / v.smoothing);
    c.x += (tx - c.x) * k;
    c.y += (ty - c.y) * k;
    c.trauma = Math.max(0, c.trauma - fe.traumaDecay * dt);
    // AUDIT-6 F5: the shake setting (0, 50, 100%) scales the view shake only. The sim never reads it.
    var shk = P.Settings && P.Settings.shake != null ? P.Settings.shake / 100 : 1;
    var sh = rm ? 0 : c.trauma * c.trauma * shk;
    c.ox = fe.maxShakePx * sh * (Math.random() * 2 - 1);
    c.oy = fe.maxShakePx * sh * (Math.random() * 2 - 1);
    c.rot = fe.maxShakeDeg * Math.PI / 180 * sh * (Math.random() * 2 - 1);
    if (P.Feel) { P.Feel.decayKick(rdt); c.ox += (c.kx || 0) * shk; c.oy += (c.ky || 0) * shk; }   // v0.9: kick leans the view into the player's big actions; the shake setting scales it too (0 = no lean)
    if (c.punchT > 0) c.punchT = Math.max(0, c.punchT - dt);
    var pp = c.punchT > 0 ? Math.sin((1 - c.punchT / (fe.punchTime * 2)) * Math.PI) : 0;
    c.zoom = 1 + (rm ? 0 : fe.punchZoom * pp * shk);   // the punch follows the shake setting (0 = none); Reduce motion zeroes it
    P.WFx.update(dt, s);
    if (P.Feel) P.Feel.update(dt, s);
    if (P.Moments && P.Moments.update) P.Moments.update(rdt, s);   // signature moments run on unscaled time (moments.js)
    ageList(F.nums, dt); ageList(F.swings, dt); ageList(F.rings, dt); ageList(F.bursts, dt); ageList(F.letters, dt);
    F.parts.forEach(function (p) { p.t -= dt; p.x += (p.vx || 0) * dt; p.y += (p.vy || 0) * dt; });
    F.parts = F.parts.filter(function (p) { return p.t > 0; });
    if (F.parts.length > fe.partsMax) F.parts.splice(0, F.parts.length - fe.partsMax);   // crowd cap: oldest go first
    F.later = F.later.filter(function (q) { q.t -= rdt; if (q.t > 0) return true; q.fn(); return false; });
    F.recent = F.recent.filter(function (r) { return F.clock - r.t < CHAIN_WIN * 4; });
  };

  function ageList(list, dt) {
    for (var i = list.length - 1; i >= 0; i--) { list[i].t -= dt; if (list[i].t <= 0) list.splice(i, 1); }
  }

  F.addTrauma = function (a) { F.cam.trauma = Math.min(1, F.cam.trauma + a); };
  F.punch = function () { F.cam.punchT = P.CFG.feel.punchTime * 2; };
  F.letter = function (x, y, text) { F.letters.push({ x: x, y: y, text: text, t: 0.8, T: 0.8 }); };
  // Runs fn after t seconds of play (pauses with the game, not with wall time).
  F.after = function (t, fn) { F.later.push({ t: t, fn: fn }); };

  F.number = function (id, x, y, val, crit) {
    if (!P.Settings.dmgNumbers) return;
    var fe = P.CFG.feel;
    for (var i = F.nums.length - 1; i >= 0; i--) {
      var n = F.nums[i];
      if (n.id === id && n.T - n.t < fe.dmgMerge) { n.val += val; n.crit = n.crit || crit; return; }
    }
    if (F.nums.length >= fe.dmgNumberMax) F.nums.shift();
    F.nums.push({ id: id, x: x + (Math.random() - 0.5) * 0.3, y: y, val: val, crit: crit, t: fe.dmgNumberLife, T: fe.dmgNumberLife });
  };

  // Chain reactions: two blasts within a fraction of a second and a few metres of each other (a canister setting off
  // the next, or a bloater's chain). The second one shouts CHAIN and its rumble lands 0.3 s later.
  function chainStep(x, y) {
    var n = 0, i;
    F.recent.push({ x: x, y: y, t: F.clock });
    for (i = 0; i < F.recent.length; i++) {
      var r = F.recent[i];
      if (F.clock - r.t <= CHAIN_WIN && Math.hypot(r.x - x, r.y - y) <= CHAIN_R) n++;
    }
    if (n >= 2 && !F.chainCd) {
      F.chainCd = 0.8;
      F.letter(x, y + 1.6, P.t('fx.chain'));
      F.after(0.3, function () { if (P.Sfx) P.Sfx.play('boom', 0, { vol: 0.9 }); F.addTrauma(0.3); });
    }
  }

  // Kill-cam for the boss's last stand. Respects Reduce motion (the callout stays).
  function finisher(ev) {
    F.addTrauma(0.6);
    F.letter(ev.x, ev.y + 1.8, P.t('fx.finisher'));
    if ((P.Settings && P.Settings.reduceMotion)) return;
    F.beat = { t: FINISH_T, T: FINISH_T, k: 0.3 };
    F.focus = { x: ev.x, y: ev.y, t: FINISH_T, T: FINISH_T };
  }

  F.onEvent = function (ev, s) {
    P.WFx.onEvent(ev, s);
    if (P.Feel) P.Feel.onEvent(ev, s);
    if (P.EnemyFx && P.EnemyFx.onEvent) P.EnemyFx.onEvent(ev, s);
    if (P.EventsFx && P.EventsFx.onEvent) P.EventsFx.onEvent(ev, s);
    if (P.Moments && P.Moments.onEvent) P.Moments.onEvent(ev, s);   // T4 part 13: signature moments (moments.js)
    switch (ev.type) {
      case 'shockwave': break;                             // level-up ring only: the card pick is the cause
      case 'bloaterPop':                                    // a burst of the pop itself, no camera move
        F.addTrauma(ev.boss ? 0.5 : 0.2);
        chainStep(ev.x, ev.y);
        break;
      case 'bossDie': finisher(ev); break;
      case 'bossSlam': F.addTrauma(0.5); break;
      case 'bruteStomp': F.addTrauma(0.35); break;
      case 'eliteSpawn': F.bursts.push({ x: ev.x, y: ev.y, t: 0.5, T: 0.5 }); break;
      case 'hit':
        F.number(ev.id, ev.x, ev.y, ev.dmg, ev.crit);
        for (var h = 0; h < (P.Feel ? 0 : 3); h++) {
          var ha = Math.atan2(ev.dy || 0, ev.dx || 0) + (Math.random() - 0.5) * 1.6, hs = 3 + Math.random() * 4;
          F.parts.push({ kind: 'blood', x: ev.x, y: ev.y, vx: Math.cos(ha) * hs, vy: Math.sin(ha) * hs, t: 0.25, T: 0.25 });
        }
        for (var sp = 0; sp < P.CFG.feel.hitSparks; sp++) {       // G3: a few sparks so each hit reads in a crowd
          var sa = Math.random() * Math.PI * 2, ss = 2 + Math.random() * 3;
          F.parts.push({ kind: 'spark', x: ev.x, y: ev.y, vx: Math.cos(sa) * ss, vy: Math.sin(sa) * ss, t: 0.2, T: 0.2 });
        }
        break;
      case 'kill':
        F.parts.push({ kind: 'splat', x: ev.x + (ev.dx || 0) * 0.3, y: ev.y + (ev.dy || 0) * 0.3, r: 0.4 + Math.random() * 0.25, t: 10, T: 10, a: Math.random() * 6, seed: Math.random() });
        var fl = ev.src === 'canister';
        F.parts.push({ kind: 'corpse', x: ev.x, y: ev.y, dx: ev.dx || 0, dy: ev.dy || 1, etype: ev.enemy || 'walker', variant: ev.variant || 0, skin: ev.skin, fling: fl, t: fl ? 0.7 : 0.55, T: fl ? 0.7 : 0.55 });
        if (ev.elite) { F.addTrauma(0.35); F.letter(ev.x, ev.y + 1.6, P.t('fx.thud')); }
        for (var g = 0; g < (P.Feel ? 0 : 6); g++) {
          var ga = Math.atan2(ev.dy || 0, ev.dx || 0) + (Math.random() - 0.5) * 2.2, gs = 2 + Math.random() * 5;
          F.parts.push({ kind: 'gib', x: ev.x, y: ev.y, vx: Math.cos(ga) * gs, vy: Math.sin(ga) * gs, t: 0.35 + Math.random() * 0.2, T: 0.5 });
        }
        break;
      case 'swing': F.swings.push({ x: ev.x, y: ev.y, ax: ev.ax, ay: ev.ay, range: ev.range, arc: ev.arcDeg, dir: ev.dir || 1, t: SWING_T, T: SWING_T }); break;
      case 'nailFire': F.parts.push({ kind: 'muzzle', x: ev.x + Math.cos(ev.a) * 0.5, y: ev.y + Math.sin(ev.a) * 0.5, t: 0.06, T: 0.06 }); break;
      case 'blast':
        F.rings.push({ x: ev.x, y: ev.y, r: ev.r, t: 0.35, T: 0.35, color: '#FFC93C' });
        if (flashGo()) F.parts.push({ kind: 'flash', x: ev.x, y: ev.y, r: ev.r, t: 0.12, T: 0.12 });   // the bright disc takes a flash slot
        F.parts.push({ kind: 'scorch', x: ev.x, y: ev.y, r: ev.r * 0.7, t: 6, T: 6 });
        for (var b = 0; b < 10; b++) {
          var ba = Math.random() * Math.PI * 2, bs = 2 + Math.random() * 4;
          F.parts.push({ kind: 'spark', x: ev.x, y: ev.y, vx: Math.cos(ba) * bs, vy: Math.sin(ba) * bs, t: 0.35, T: 0.35 });
        }
        F.addTrauma(0.08);
        break;
      case 'explode':
        F.rings.push({ x: ev.x, y: ev.y, r: ev.r, t: 0.45, T: 0.45, color: '#FF4D2E' });
        for (var i = 0; i < 14; i++) {
          var a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 5;
          F.parts.push({ kind: 'spark', x: ev.x, y: ev.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, t: 0.4, T: 0.4 });
        }
        F.addTrauma(ev.trauma); F.letter(ev.x, ev.y + 1, P.t('fx.boom'));
        chainStep(ev.x, ev.y);
        break;
      case 'heroHit':
        heroHit(ev, s);
        if (ev.dmg >= 0.1 * s.hero.maxHp || ev.cause !== 'canister') F.addTrauma(P.CFG.feel.traumaPlayerHit * (ev.dmg >= 10 ? 1 : 0.4));
        if (s.hero.hp / s.hero.maxHp < P.CFG.feel.lowHpFrac && F.lowArmed) {
          F.lowArmed = false; F.letter(s.hero.x, s.hero.y + 1.3, P.t('fx.lastBreath'));
        } else if (s.hero.hp / s.hero.maxHp > 0.5) F.lowArmed = true;
        break;
      case 'scaffold':
        F.addTrauma(ev.trauma);
        for (var j = 0; j < 20; j++) F.parts.push({ kind: 'dust', x: -6 + Math.random() * 12, y: 229 + Math.random() * 2, vx: (Math.random() - 0.5), vy: -Math.random() * 2, t: 1.5, T: 1.5 });
        break;
      case 'doorBurst': F.bursts.push({ x: ev.x, y: ev.y, t: 0.5, T: 0.5 }); break;
      case 'propBreak':
        for (var k = 0; k < 10; k++) F.parts.push({ kind: ev.kind === 'chestnut' ? 'ember' : 'shard', x: ev.x, y: ev.y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, t: 0.6, T: 0.6 });
        break;
    }
  };

  return F;
})();
