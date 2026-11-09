// App flow + loop: title -> (first time) L1 cold open | journey map -> level (intro comic) -> run
// (cards / chest / pause / down / story pages) -> exit beat -> end comic -> results -> map.
// Review shortcuts: ?skipintro=1  ?seg=B|C|D (L1 jump with a typical build)  ?seed=123  ?level=N (play journey
// level N directly)  ?map=1 (title opens the map)  ?arsenal=1 (all weapons in the card pool)  ?meta=unlockall
// ?mastery=0..5 (treat every weapon as that mastery rank)
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var phone = $('phone'), params = new URLSearchParams(location.search);
  var scale = 1, sim = null, state = 'title', acc = 0, last = 0, timeScale = 1, slowMo = -1, hitStop = 0;
  var offer = null, settingsReturn = null, exitT = 0, perf = { t: 0, frames: [] }, rerolled = false;
  var levelIndex = 1, runOpts = {}, fxSlow = { t: 0, T: 1, k: 1 };
  var STEP = 1 / P.CFG.sim.hz, SEG_TEL = { A: 'seg_a', B: 'seg_b', C: 'seg_c', D: 'seg_d' };
  var FROZEN = { paused: 1, cards: 1, down: 1, chest: 1, story: 1, storyRun: 1, storyEnd: 1 };
  var music = function (id) { if (P.Music) P.Music.play(id); };
  var DEATH_BEAT = 0.8, dyingT = 0, dyingNext = null, frameErrs = 0;   // AUDIT-6 F4: hit-stop before the down screen

  // Fail-soft flow (AUDIT-6 F2): a failing step is logged, shows a toast and falls back to the title, so Start never
  // dies silently. Errors inside the frame loop are logged and the loop keeps running.
  function guard(where, fn) {
    return function () {
      try { return fn.apply(this, arguments); } catch (e) {
        P.UI.bootError(where, e && e.stack ? e.stack.split('\n').slice(0, 2).join(' | ') : e);
        toTitle(); P.UI.toast(P.t('ui.boot.fail'), null, 2.5);
        return undefined;
      }
    };
  }
  // Short vibration on a heavy hit or a frenzy start, only when the player has haptics on (AUDIT-6 F5).
  function buzz(pattern) { if (P.Settings.haptics && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern); }

  if (params.get('arsenal')) P.CFG.debugAllWeapons = true;
  if (params.get('meta') === 'unlockall' && P.Meta) P.Meta.debugUnlockAll();
  if (params.get('mastery') !== null) P.CFG.debugMastery = parseInt(params.get('mastery'), 10) || 0;

  function fit() {
    scale = Math.min(window.innerWidth / 390, window.innerHeight / 844);
    phone.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
    P.Render.resize(scale);
  }
  function toLocal(e) { var r = phone.getBoundingClientRect(); return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale }; }

  // opts (from the map / daily): {daily, modifiers, seed}. Kept for retries of the same run.
  function newRun(idx, opts) {
    if (idx) { levelIndex = idx; runOpts = opts || {}; }
    var seed = runOpts.seed || (params.get('seed') ? parseInt(params.get('seed'), 10) : (Date.now() % 100000));
    sim = P.createSim(seed, { levelIndex: levelIndex, loadout: P.Meta ? P.Meta.loadout(runOpts) : null });
    if (P.Barks && P.Barks.reset) P.Barks.reset(seed);
    P.Fx.reset(sim); P.Tel.setSeed(seed);
    acc = 0; timeScale = 1; slowMo = -1; hitStop = 0; rerolled = false; fxSlow.t = 0; P.HitStop = 0;
    dyingNext = null; dyingT = 0; phone.classList.remove('dying');
    if (P.Comic) P.Comic.clearPops();
    if (P.Speech) P.Speech.reset();
    P.Tel.log('level_start', { level_type: levelIndex === 1 ? 'route' : 'journey', level_id: sim.levelInfo.id,
      hero_ids: ['arda'], hero_levels: [1], gear_power: 0 });
  }

  function startGame() {
    P.Sfx.unlock(); if (P.Music) P.Music.unlock();
    var direct = parseInt(params.get('level') || '0', 10);
    if (direct > 0) { playLevel(direct); return; }
    if (P.Meta && (P.Settings.l1Cleared || params.get('map')) && !params.get('seg')) { openMap(); return; }
    playLevel(1);
  }

  // ---------- journey map ----------
  function openMap() {
    if (!P.Meta) { toTitle(); return; }
    state = 'map'; P.UI.showHud(false); P.Input.enabled = false; P.Screens.hideAll();
    if (P.Comic) P.Comic.clearPops();
    if (P.Sfx.ambience) P.Sfx.ambience(null);
    music('map');
    P.Meta.open(playG);
  }

  function playLevel(i, opts) {
    if (P.Meta && P.Meta.isOpen()) P.Meta.close();
    newRun(i, opts);
    P.Screens.hideAll(); P.UI.showHud(false);
    if (levelIndex === 1) { coldOpenOrPlay(); return; }
    state = 'story';
    hoodCard(function () { if (P.Story) P.Story.play(levelIndex, 'intro', beginPlay); else beginPlay(); });
  }

  // Neighbourhood postcard (stage 1) or a small sub-location banner (stages 2-5).
  function hoodCard(next) {
    if (!P.HoodCard || params.get('skipintro')) { next(); return; }
    P.HoodCard.show(sim.levelInfo, { big: sim.levelInfo.stage === 1 }, next);
  }

  function coldOpenOrPlay() {
    if (params.get('skipintro') || params.get('seg')) { beginPlay(); return; }
    state = 'cold'; P.Screens.show('scr-cold');
    P.ColdOpen.start(sim, function (skipped, t) {
      P.Tel.log('cinematic', { id: 'l1_cold_open', action: skipped ? 'skip' : 'complete', t_s: +t.toFixed(1) });
      P.Settings.coldOpenSeen = true; P.saveSettings();
      state = 'story'; hoodCard(beginPlay);
    });
  }

  function beginPlay() {
    P.Screens.hideAll(); P.UI.showHud(true);
    P.startPlay(sim);
    if (levelIndex === 1 && params.get('seg')) jumpTo(params.get('seg').toUpperCase());
    P.Tel.log('segment_reached', { segment_id: 'restaurant', t_s: 0 });
    state = 'play'; P.Input.enabled = true; last = performance.now();
    music('run_calm');
    handleEvents();
  }

  function jumpTo(seg) {
    var y0 = { A: 1, B: 63, C: 125, D: 195 }[seg];
    if (y0 === undefined) return;
    var builds = { A: [{ knife: 1 }, {}, 1], B: [{ knife: 1, nailgun: 2 }, { shoes: 1 }, 4],
                   C: [{ knife: 2, nailgun: 3, canister: 1 }, { shoes: 1, gloves: 1 }, 8],
                   D: [{ knife: 3, nailgun: 3, canister: 2, chain: 1 }, { shoes: 2, gloves: 1, jacket: 1 }, 12] }[seg];
    sim.enemies = []; sim.props.doorOpen = true; sim.hero.x = 0; sim.hero.y = y0;
    sim.hero.weapons = builds[0]; sim.hero.passives = builds[1]; sim.level = builds[2];
    sim.cardPicks = builds[2] - 1;
    ['t_move', 't_attack', 't_xp', 't_card', 't_env'].forEach(function (id) { sim.dir.tut.done[id] = true; });
    sim.dir.tut.active = null; sim.dir.tut.queue = [];
    if (sim.cardPicks > 0) { sim.dir.call.active = true; sim.dir.call.bars = seg === 'C' ? 2 : 3; }
    P.CFG.level.segments.forEach(function (s) { if (s.y0 < y0 - 1 && s.id !== seg) sim.dir.reached[s.id] = true; });
    P.Fx.reset(sim);
  }

  // ---------- events -> feel, audio, telemetry (weapon/enemy sounds are played by their view modules) ----------
  function slow(T, k) { if (P.Settings.reduceMotion || !T) return; fxSlow = { t: T, T: T, k: k }; }

  function handleEvents() {
    P.drainEvents(sim).forEach(function (ev) {
      P.Fx.onEvent(ev, sim);
      if (P.Barks && P.Barks.onEvent) P.Barks.onEvent(ev, sim);
      if (P.FireAnim) P.FireAnim.onEvent(ev, sim);
      if (P.EnvFx && P.EnvFx.onEvent) P.EnvFx.onEvent(ev, sim);   // lane A: env sfx, shards and labels
      switch (ev.type) {
        case 'kill': P.Sfx.play('splat', 45); break;
        case 'pickup': P.Sfx.play(ev.kind === 'xp' ? 'tink' : 'click', 30); break;
        case 'shockwave': P.Sfx.play('shock'); break;
        case 'eliteSpawn': P.Sfx.play('elite'); P.Tel.log('elite_spawn', { t_s: +sim.runT.toFixed(1) }); break;
        case 'explode': P.Sfx.play('boom'); break;
        case 'heroHit':
          P.Sfx.play('hurt', 120);
          if (ev.dmg >= 0.1 * sim.hero.maxHp) { buzz(12); P.Tel.log('player_hit', { source_id: ev.cause, damage: ev.dmg, hp_after: ev.hp }); }
          break;
        case 'frenzy': if (ev.on) buzz([18, 40, 18]); break;
        case 'levelup':
          P.Tel.log('level_up', { run_level: ev.level, t_s: +sim.runT.toFixed(1) });
          if (slowMo < 0) { slowMo = 0; P.Sfx.play('level'); }
          break;
        case 'ult': slow(ev.slowMo || 0.3, 0.25); P.Tel.log('ult_used', { t_s: +sim.runT.toFixed(1) }); break;
        case 'masteryMove': slow(ev.slowMo || 0.4, 0.25); P.Tel.log('mastery_move', { weapon: ev.weapon }); break;
        case 'modChosen': P.Tel.log('mod_chosen', { weapon: ev.weapon, mod: ev.mod }); break;
        case 'hackDone': P.Tel.log('hack_done', { kind: ev.kind, t_s: +sim.runT.toFixed(1) }); break;
        case 'evolve': slow(ev.T || 1.6, 0.2); P.Tel.log('evolve', { from: ev.from, to: ev.to }); break;
        case 'bossIntro': music('boss'); P.Tel.log('boss_intro', { boss: ev.nameKey, t_s: +sim.runT.toFixed(1) }); break;
        case 'bossDie': music('run_calm'); break;
        case 'story': storyBeat(ev.when); break;
        case 'segment': P.Tel.log('segment_reached', { segment_id: SEG_TEL[ev.id] || ev.id, t_s: +sim.runT.toFixed(1) }); break;
        case 'tutorial': P.Tel.log('tutorial_step', { step_id: ev.id, t_s: +sim.runT.toFixed(1) }); break;
        case 'catHiss': P.Sfx.play('hiss'); P.Sfx.play('rattle'); break;
        case 'scaffold': P.Sfx.play('boom'); break;
        case 'holdStart': P.Sfx.play('shutter'); break;
        case 'shutterOpen': P.Sfx.play(levelIndex === 1 ? 'bell' : 'doorSlam'); break;
        case 'doorOpen': P.Sfx.play('click'); break;
        case 'propBreak': P.Sfx.play('glass'); break;
        case 'death': onDeath(); break;
        case 'win': onWin(); break;
      }
    });
  }

  // Mid-run story beats: pops and calls run over play; a comic page pauses the run until it closes.
  function storyBeat(when) {
    if (!P.Story || when === 'end') return;
    var opened = P.Story.play(levelIndex, when, function () {
      if (state === 'storyRun') { P.Screens.hideAll(); state = 'play'; P.Input.enabled = true; last = performance.now(); }
    });
    if (opened && state === 'play') { state = 'storyRun'; P.Input.reset(); P.Input.enabled = false; }
  }

  // ---------- level-up cards ----------
  function openCards() {
    slowMo = -1; timeScale = 1; state = 'cards';
    P.Input.reset(); P.Input.enabled = false;
    offer = P.Progression.makeOffer(sim); rerolled = false;
    P.Tel.log('card_offered', { cards: offer.cards.map(function (c) { return c.id; }), scripted: offer.scripted });
    P.Screens.showCards(sim, offer, pickCard, reroll);
  }
  function pickCard(card) {
    P.Tel.log('card_chosen', { cards: offer.cards.map(function (c) { return c.id; }), chosen: card.id, rerolled: rerolled });
    P.Progression.choose(sim, card);
    handleEvents();
    if (sim.pendingLevels > 0) { openCards(); return; }
    if (sim.pendingChests > 0) { openChest(); return; }
    P.Screens.hideAll(); state = 'play'; P.Input.enabled = true;
  }

  // ---------- chest ----------
  function openChest() {
    state = 'chest'; P.Input.reset(); P.Input.enabled = false;
    var card = P.Progression.chestReward(sim);
    P.Screens.showChest(sim, card, function (c) {
      P.Progression.openChest(sim, c);
      P.Tel.log('chest_opened', { item: c.id, level: c.next, evo: !!c.evo, t_s: +sim.runT.toFixed(1) });
      handleEvents();
      if (sim.pendingChests > 0) { openChest(); return; }
      if (sim.pendingLevels > 0) { openCards(); return; }
      P.Screens.hideAll(); state = 'play'; P.Input.enabled = true;
    });
  }
  function reroll() {
    if (sim.rerolls <= 0) return;
    sim.rerolls--; rerolled = true;
    offer = P.Progression.makeOffer(sim);
    P.Screens.showCards(sim, offer, pickCard, reroll);
  }

  // ---------- pause / settings ----------
  function pause() {
    if (state !== 'play') return;
    state = 'paused'; P.Input.reset(); P.Input.enabled = false;
    P.Screens.showPause(sim);
  }
  function resume() { P.Screens.hideAll(); state = 'play'; P.Input.enabled = true; last = performance.now(); }
  function openSettings(from) {
    settingsReturn = from;
    if (from === 'map' && P.Meta) P.Meta.close();
    P.Screens.showSettings(function () {
      if (settingsReturn === 'pause') P.Screens.showPause(sim);
      else if (settingsReturn === 'map') openMap();
      else P.Screens.show('scr-title');
    }, function () { P.UI.applyI18n(); });
  }

  // ---------- death / revive / end ----------
  function onDeath() {
    P.Input.reset(); P.Input.enabled = false;
    P.Tel.log('death', { cause_id: sim.deathCause, t_s: +sim.runT.toFixed(1), run_level: sim.level, build: Object.keys(sim.hero.weapons).concat(Object.keys(sim.hero.passives)) });
    if (!P.Settings.firstRunDone && !sim.secondWindUsed) {
      P.revive(sim, 'secondWind');
      P.Tel.log('revive_used', { method: 'second_wind' });
      P.UI.toast(P.t('ui.secondWind'), P.t('ui.secondWindSub'), 2.5);
      P.Input.enabled = true; handleEvents();
      return;
    }
    // Death beat (AUDIT-6 F4): the world freezes and desaturates for 0.8 s, then the down screen (or results).
    state = 'dying'; dyingT = P.Settings.reduceMotion ? 0 : DEATH_BEAT;
    phone.classList.add('dying');
    dyingNext = sim.reviveUsed ? function () { endRun(false); } : showDown;
  }

  function showDown() {
    phone.classList.remove('dying');
    state = 'down';
    P.Tel.log('revive_offer', { methods: ['ad', 'altin'] });
    P.Screens.showDown(sim, {
      revive: function (kind) {
        P.revive(sim, kind); P.Tel.log('revive_used', { method: kind === 'ad' ? 'ad_stub' : 'altin_stub' });
        handleEvents(); P.Screens.hideAll(); state = 'play'; P.Input.enabled = true;
      },
      giveUp: function () { endRun(false); },
    });
  }

  function onWin() {
    state = 'exit'; exitT = 0; P.Input.reset(); P.Input.enabled = false;
    P.Tel.log('segment_reached', { segment_id: 'exit', t_s: +sim.runT.toFixed(1) });
    if (P.Comic) P.Comic.clearPops();
    if (levelIndex === 1) { P.Sfx.play('slam'); sim.props.shutterOpen = false; sim.props.shutter = 0; return; }
    P.Sfx.play('levelClear'); music('victory');
    P.UI.toast(P.t('ui.res.clear'), P.upper(sim.levelInfo.hood.name), 1.6);
  }

  // L1 keeps its scripted "no signal" exit; journey levels get a short clear beat. Both end on the 'end' story beat.
  function updateExit(dt) {
    var before = exitT; exitT += dt;
    var at = function (t) { return before < t && exitT >= t; };
    if (levelIndex !== 1) { if (at(1.6)) finishWin(); return; }
    P.Combat.updateEnemies(sim, dt);
    if (at(0.6)) { sim.dir.call.sub = { id: 'exit1', t: 2.0 }; sim.dir.call.bars = 0; P.Sfx.play('nosignal'); }
    if (at(2.6)) sim.dir.call.sub = { id: 'exit2', t: 2.0 };
    if (at(4.8)) { P.UI.showHud(false); P.Screens.show('scr-slam'); P.Sfx.play('slam'); }
    if (at(7.8)) finishWin();
    if (sim.dir.call.sub) { sim.dir.call.sub.t -= dt; if (sim.dir.call.sub.t <= 0) sim.dir.call.sub = null; }
  }

  function finishWin() {
    state = 'storyEnd'; P.UI.showHud(false);
    if (P.Story) P.Story.play(levelIndex, 'end', function () { endRun(true); }); else endRun(true);
  }

  function endRun(win) {
    var C = P.CFG.rewards, h = sim.hero, L = sim.levelInfo;
    var stars = win ? [true, !sim.reviveUsed, h.hp / h.maxHp >= 0.5] : [false, false, false];
    var nStars = stars.filter(Boolean).length, first = win && !P.Settings.l1Cleared && levelIndex === 1;
    var jeton = win ? (C.jetonBase + C.jetonPerLevel * levelIndex) * (first ? C.firstClearMult : 1) + sim.jeton : Math.floor(sim.jeton * C.loseKeep);
    var km = 0;
    if (P.Meta) {
      var pend = P.Meta.onResults({ levelIndex: levelIndex, won: win, stars: nStars, coins: sim.jeton, kills: sim.kills, timeS: sim.runT,
        tally: sim.tally, reviveUsed: !!sim.reviveUsed, daily: !!runOpts.daily, hero: 'arda' });
      if (pend && pend.reward) { jeton = pend.reward.total; first = pend.reward.first; }
      km = P.Meta.progress().kmWalked;
    }
    var r = { win: win, stars: stars, jeton: jeton, hurda: C.hurdaBase * (first ? C.firstClearMult : 1), kills: sim.kills, firstClear: first,
              time: sim.runT, level: sim.level, hpPct: Math.round(h.hp / h.maxHp * 100),
              hood: L.hood.name, hoodN: L.hoodIndex + 1, stage: L.stage, km: (+km || 0).toFixed(1), hasNext: levelIndex < P.Journey.count() };
    P.Tel.log('level_end', { result: win ? 'win' : 'lose', level_id: L.id, t_s: +sim.runT.toFixed(1), stars: nStars, kills: sim.kills, rewards: { jeton: jeton, hurda: win ? r.hurda : 0 } });
    P.Settings.firstRunDone = true; if (win && levelIndex === 1) P.Settings.l1Cleared = true; P.saveSettings();
    state = 'results'; P.UI.showHud(false);
    if (P.Comic) P.Comic.clearPops();
    if (P.Sfx.ambience) P.Sfx.ambience(null);
    music(win ? 'victory' : 'defeat'); P.Sfx.play(win ? 'star' : 'levelFail');
    P.Screens.showResults(r);
  }

  function toTitle() { state = 'title'; P.UI.showHud(false); P.Input.enabled = false; P.Screens.show('scr-title'); music('title'); }
  function quitToMap() { P.Tel.log('level_end', { result: 'quit', t_s: +sim.runT.toFixed(1) }); openMap(); }

  // ---------- loop ----------
  function perfSample(dt) {
    perf.t += dt; perf.frames.push(dt * 1000);
    if (perf.t < 10) return;
    var f = perf.frames.slice().sort(function (a, b) { return a - b; });
    P.Tel.log('perf_sample', { fps_avg: Math.round(f.length / perf.t), frame_p95_ms: +f[Math.floor(f.length * 0.95)].toFixed(1), enemies_alive: sim.enemies.length });
    perf.t = 0; perf.frames = [];
  }

  // Extra time scaling from feel systems: near-miss/ult/evolve slow-mo, boss-death beat, important story pops.
  function feelScale(dt) {
    var k = 1;
    if (fxSlow.t > 0) { fxSlow.t -= dt; k *= 1 - (1 - fxSlow.k) * Math.min(1, Math.max(0, fxSlow.t / fxSlow.T) * 1.6); }
    if (P.Fx.timeScale) k *= P.Fx.timeScale();
    if (P.Comic && P.Comic.timeScale) k *= P.Comic.timeScale();
    return k;
  }

  function stepPlay(dt) {
    if (sim.pendingChests > 0 && slowMo < 0 && sim.pendingLevels === 0) { openChest(); return; }
    if (slowMo >= 0) {
      slowMo += dt;
      var T = P.Settings.reduceMotion ? 0 : P.CFG.feel.levelUpSlowMo;
      timeScale = T > 0 ? Math.max(0, 1 - slowMo / T) : 0;
      if (slowMo >= T) { openCards(); return; }
    }
    if (P.HitStop > 0) { if (!P.Settings.reduceMotion) hitStop = Math.max(hitStop, P.HitStop); P.HitStop = 0; }
    if (hitStop > 0) { hitStop -= dt; return; }
    acc += dt * timeScale * feelScale(dt);
    var steps = 0;
    while (acc >= STEP && steps < P.CFG.sim.maxStepsPerFrame) {
      P.stepSim(sim, STEP, P.Input.get());
      handleEvents();
      acc -= STEP; steps++;
      if (state !== 'play' || slowMo >= 0) break;
    }
    if (steps === P.CFG.sim.maxStepsPerFrame) acc = 0;
    if (P.Music && P.Music.intensity) P.Music.intensity(Math.min(1, sim.enemies.length / 90));
    if (P.Barks && P.Barks.update) P.Barks.update(dt, sim);
    perfSample(dt);
  }

  // The loop always re-arms itself: an error in one frame is logged (every 60th) and the next frame still runs.
  function frame(ts) {
    try { tick(ts); } catch (e) {
      if (frameErrs++ % 60 === 0) P.UI.bootError('frame', e && e.stack ? e.stack.split('\n').slice(0, 2).join(' | ') : e);
    }
    requestAnimationFrame(frame);
  }

  function tick(ts) {
    var dt = Math.min(0.1, (ts - (last || ts)) / 1000);
    last = ts;
    if (state === 'cold') P.ColdOpen.update(dt);
    if (state === 'play') stepPlay(dt);
    if (state === 'exit') updateExit(dt);
    if (state === 'dying' && (dyingT -= dt) <= 0 && dyingNext) { var next = dyingNext; dyingNext = null; next(); }
    if (sim && state !== 'title' && state !== 'results' && state !== 'map') {
      P.Fx.update(sim, FROZEN[state] ? 0 : dt);
      if (P.FireAnim) P.FireAnim.update(FROZEN[state] ? 0 : dt * (P.Fx.timeScale ? P.Fx.timeScale() : 1), sim);
      P.Render.frame(sim, levelIndex === 1 ? P.ColdOpen.draw : null);
      if (state === 'play' || state === 'exit') P.UI.update(sim); else document.getElementById('prompt').classList.add('hidden');
    }
    P.UI.tick(dt);
    if (P.Speech) P.Speech.tick(dt);
  }

  // ---------- wiring ----------
  function on(id, fn) { $(id).addEventListener('click', function (e) { e.stopPropagation(); fn(e); }); }
  P.Render.init($('game')); P.UI.init(); fit(); window.addEventListener('resize', fit);
  P.Input.init(phone, toLocal); P.Input.onPause = pause;
  P.UI.applyI18n(); P.Screens.drawKeyArt($('keyart'));
  if (P.applySettings) P.applySettings();
  $('btn-title-settings').innerHTML = P.Icons.svg('gear', 30);
  if (P.Meta) P.Meta.onSettings = function () { openSettings('map'); };
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { P.lang = P.Settings.lang = b.getAttribute('data-lang'); P.saveSettings(); P.UI.applyI18n(); });
  });
  // Guarded entry points (AUDIT-6 F2): the map and the buttons call these, never the raw flow functions.
  var startG = guard('startGame', startGame), playG = guard('playLevel', playLevel);
  on('btn-start', startG);
  on('btn-title-settings', function () { openSettings('title'); });
  on('btn-pause', pause);
  on('btn-ult', function () { if (state === 'play' && P.Input.requestUlt) P.Input.requestUlt(); });
  on('btn-resume', resume);
  on('btn-pause-settings', function () { openSettings('pause'); });
  on('btn-restart', function () { P.Tel.log('level_end', { result: 'quit', t_s: +sim.runT.toFixed(1) }); newRun(); beginPlay(); });
  on('btn-quit', function () { if (P.Meta) quitToMap(); else toTitle(); });
  on('btn-export', function () { P.Tel.exportJsonl(); });
  on('btn-next', function () { playG(levelIndex + 1, {}); });
  on('btn-retry', function () { newRun(); beginPlay(); });
  on('btn-to-title', function () { if (P.Meta) openMap(); else toTitle(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); });
  P.Screens.show('scr-title');
  requestAnimationFrame(frame);
  P.debug = { get sim() { return sim; }, get state() { return state; }, playLevel: playG, openMap: openMap };
})();
