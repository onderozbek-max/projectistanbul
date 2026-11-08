// App flow + loop: title -> cold open -> run (cards / pause / down) -> exit beat -> title slam -> results.
// Review shortcuts: ?skipintro=1  ?seg=B|C|D (jump with a typical build)  ?seed=123
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var phone = $('phone'), params = new URLSearchParams(location.search);
  var scale = 1, sim = null, state = 'title', acc = 0, last = 0, timeScale = 1, slowMo = -1, hitStop = 0, lastHitStop = -9;
  var offer = null, settingsReturn = null, exitT = 0, perf = { t: 0, frames: [] }, rerolled = false;
  var STEP = 1 / P.CFG.sim.hz, SEG_TEL = { A: 'seg_a', B: 'seg_b', C: 'seg_c', D: 'seg_d' };

  function fit() {
    scale = Math.min(window.innerWidth / 390, window.innerHeight / 844);
    phone.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
    P.Render.resize(scale);
  }
  function toLocal(e) { var r = phone.getBoundingClientRect(); return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale }; }

  function newRun() {
    var seed = params.get('seed') ? parseInt(params.get('seed'), 10) : (Date.now() % 100000);
    sim = P.createSim(seed); P.Fx.reset(sim); P.Tel.setSeed(seed);
    acc = 0; timeScale = 1; slowMo = -1; hitStop = 0; rerolled = false;
    P.Tel.log('level_start', { level_type: 'route', hero_ids: ['arda'], hero_levels: [1], gear_power: 0 });
  }

  function startGame() {
    P.Sfx.unlock(); newRun();
    if (params.get('skipintro') || params.get('seg')) { beginPlay(); return; }
    state = 'cold'; P.Screens.show('scr-cold'); P.UI.showHud(false);
    P.ColdOpen.start(sim, function (skipped, t) {
      P.Tel.log('cinematic', { id: 'l1_cold_open', action: skipped ? 'skip' : 'complete', t_s: +t.toFixed(1) });
      P.Settings.coldOpenSeen = true; P.saveSettings();
      beginPlay();
    });
  }

  function beginPlay() {
    P.Screens.hideAll(); P.UI.showHud(true);
    P.startPlay(sim);
    if (params.get('seg')) jumpTo(params.get('seg').toUpperCase());
    P.Tel.log('segment_reached', { segment_id: 'restaurant', t_s: 0 });
    state = 'play'; P.Input.enabled = true;
    handleEvents();
  }

  function jumpTo(seg) {
    var y0 = { A: 1, B: 63, C: 125, D: 195 }[seg];
    if (y0 === undefined) return;
    var builds = { A: [{}, {}, 1], B: [{ fork: 1, tea: 1 }, {}, 3], C: [{ fork: 2, tea: 2 }, { sneakers: 1 }, 5], D: [{ fork: 2, tea: 2 }, { sneakers: 1, ayran: 1 }, 6] }[seg];
    sim.enemies = []; sim.props.doorOpen = true; sim.hero.x = 0; sim.hero.y = y0;
    sim.hero.weapons = builds[0].fork ? builds[0] : { fork: 1 }; sim.hero.passives = builds[1]; sim.level = builds[2];
    sim.cardPicks = builds[2] - 1;
    ['t_move', 't_attack', 't_xp', 't_card', 't_env'].forEach(function (id) { sim.dir.tut.done[id] = true; });
    sim.dir.tut.active = null; sim.dir.tut.queue = [];
    if (sim.cardPicks > 0) { sim.dir.call.active = true; sim.dir.call.bars = seg === 'C' ? 2 : 3; }
    P.CFG.level.segments.forEach(function (s) { if (s.y0 < y0 - 1 && s.id !== seg) sim.dir.reached[s.id] = true; });
    P.Fx.reset(sim);
  }

  // ---------- events -> feel, audio, telemetry ----------
  function handleEvents() {
    P.drainEvents(sim).forEach(function (ev) {
      P.Fx.onEvent(ev, sim);
      switch (ev.type) {
        case 'swing': P.Sfx.play('stab', 90); break;
        case 'teaThrow': break;
        case 'teaLand': P.Sfx.play('glass', 60); break;
        case 'pickup': P.Sfx.play(ev.kind === 'xp' ? 'tink' : 'click', 30); break;
        case 'explode': P.Sfx.play('boom'); break;
        case 'heroHit':
          P.Sfx.play('hurt', 120);
          if (ev.dmg >= 0.1 * sim.hero.maxHp) P.Tel.log('player_hit', { source_id: ev.cause, damage: ev.dmg, hp_after: ev.hp });
          break;
        case 'critKill':
          if (!P.Settings.reduceMotion && sim.t - lastHitStop >= P.CFG.feel.hitStopMinGap) { hitStop = P.CFG.feel.hitStopCritKill; lastHitStop = sim.t; }
          break;
        case 'levelup':
          P.Tel.log('level_up', { run_level: ev.level, t_s: +sim.runT.toFixed(1) });
          if (slowMo < 0) { slowMo = 0; P.Sfx.play('level'); }
          break;
        case 'segment': P.Tel.log('segment_reached', { segment_id: SEG_TEL[ev.id], t_s: +sim.runT.toFixed(1) }); break;
        case 'tutorial': P.Tel.log('tutorial_step', { step_id: ev.id, t_s: +sim.runT.toFixed(1) }); break;
        case 'catHiss': P.Sfx.play('hiss'); P.Sfx.play('rattle'); break;
        case 'scaffold': P.Sfx.play('boom'); break;
        case 'holdStart': P.Sfx.play('shutter'); break;
        case 'shutterOpen': P.Sfx.play('bell'); break;
        case 'doorOpen': P.Sfx.play('click'); break;
        case 'propBreak': P.Sfx.play('glass'); break;
        case 'death': onDeath(); break;
        case 'win': onWin(); break;
      }
    });
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
    P.Screens.hideAll(); state = 'play'; P.Input.enabled = true;
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
    P.Screens.showSettings(function () {
      if (settingsReturn === 'pause') P.Screens.showPause(sim); else P.Screens.show('scr-title');
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
    if (sim.reviveUsed) { endRun(false); return; }
    state = 'down';
    P.Tel.log('revive_offer', { methods: ['ad', 'altin'] });
    P.Screens.showDown(sim, Math.floor(sim.jeton * P.CFG.rewards.loseKeep), {
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
    P.Sfx.play('slam');
    sim.props.shutterOpen = false; sim.props.shutter = 0;
  }

  function updateExit(dt) {
    var before = exitT; exitT += dt;
    P.Combat.updateEnemies(sim, dt);
    var at = function (t) { return before < t && exitT >= t; };
    if (at(0.6)) { sim.dir.call.sub = { id: 'exit1', t: 2.0 }; sim.dir.call.bars = 0; P.Sfx.play('nosignal'); }
    if (at(2.6)) sim.dir.call.sub = { id: 'exit2', t: 2.0 };
    if (at(4.8)) { P.UI.showHud(false); P.Screens.show('scr-slam'); P.Sfx.play('slam'); }
    if (at(7.8)) endRun(true);
    if (sim.dir.call.sub) { sim.dir.call.sub.t -= dt; if (sim.dir.call.sub.t <= 0) sim.dir.call.sub = null; }
  }

  function endRun(win) {
    var C = P.CFG.rewards, h = sim.hero, first = win && !P.Settings.l1Cleared, mult = first ? C.firstClearMult : 1;
    var stars = win ? [true, !sim.reviveUsed, h.hp / h.maxHp >= 0.5] : [false, false, false];
    var jeton = win ? (C.jetonBase + C.jetonPerLevel * 1) * mult + sim.jeton : Math.floor(sim.jeton * C.loseKeep);
    var r = { win: win, stars: stars, jeton: jeton, hurda: C.hurdaBase * mult, kills: sim.kills, firstClear: first,
              time: sim.runT, level: sim.level, hpPct: Math.round(h.hp / h.maxHp * 100) };
    P.Tel.log('level_end', { result: win ? 'win' : 'lose', t_s: +sim.runT.toFixed(1), stars: stars.filter(Boolean).length, kills: sim.kills, rewards: { jeton: jeton, hurda: win ? r.hurda : 0 } });
    P.Settings.firstRunDone = true; if (win) P.Settings.l1Cleared = true; P.saveSettings();
    state = 'results'; P.UI.showHud(false);
    P.Screens.showResults(r);
  }

  function toTitle() { state = 'title'; P.UI.showHud(false); P.Input.enabled = false; P.Screens.show('scr-title'); }

  // ---------- loop ----------
  function perfSample(dt) {
    perf.t += dt; perf.frames.push(dt * 1000);
    if (perf.t < 10) return;
    var f = perf.frames.slice().sort(function (a, b) { return a - b; });
    P.Tel.log('perf_sample', { fps_avg: Math.round(f.length / perf.t), frame_p95_ms: +f[Math.floor(f.length * 0.95)].toFixed(1), enemies_alive: sim.enemies.length });
    perf.t = 0; perf.frames = [];
  }

  function stepPlay(dt) {
    if (slowMo >= 0) {
      slowMo += dt;
      var T = P.Settings.reduceMotion ? 0 : P.CFG.feel.levelUpSlowMo;
      timeScale = T > 0 ? Math.max(0, 1 - slowMo / T) : 0;
      if (slowMo >= T) { openCards(); return; }
    }
    if (hitStop > 0) { hitStop -= dt; return; }
    acc += dt * timeScale;
    var steps = 0;
    while (acc >= STEP && steps < P.CFG.sim.maxStepsPerFrame) {
      P.stepSim(sim, STEP, P.Input.get());
      handleEvents();
      acc -= STEP; steps++;
      if (state !== 'play' || slowMo >= 0) break;
    }
    if (steps === P.CFG.sim.maxStepsPerFrame) acc = 0;
    perfSample(dt);
  }

  function frame(ts) {
    var dt = Math.min(0.1, (ts - (last || ts)) / 1000);
    last = ts;
    if (state === 'cold') P.ColdOpen.update(dt);
    if (state === 'play') stepPlay(dt);
    if (state === 'exit') updateExit(dt);
    if (sim && state !== 'title' && state !== 'results') {
      P.Fx.update(sim, state === 'paused' || state === 'cards' || state === 'down' ? 0 : dt);
      P.Render.frame(sim, P.ColdOpen.draw);
      if (state === 'play' || state === 'exit') P.UI.update(sim); else document.getElementById('prompt').classList.add('hidden');
    }
    P.UI.tick(dt);
    requestAnimationFrame(frame);
  }

  // ---------- wiring ----------
  function on(id, fn) { $(id).addEventListener('click', function (e) { e.stopPropagation(); fn(e); }); }
  P.Render.init($('game')); P.UI.init(); fit(); window.addEventListener('resize', fit);
  P.Input.init(phone, toLocal); P.Input.onPause = pause;
  P.UI.applyI18n(); P.Screens.drawKeyArt($('keyart'));
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { P.lang = P.Settings.lang = b.getAttribute('data-lang'); P.saveSettings(); P.UI.applyI18n(); });
  });
  on('btn-start', startGame);
  on('btn-title-settings', function () { openSettings('title'); });
  on('btn-pause', pause);
  on('btn-resume', resume);
  on('btn-pause-settings', function () { openSettings('pause'); });
  on('btn-restart', function () { P.Tel.log('level_end', { result: 'quit', t_s: +sim.runT.toFixed(1) }); newRun(); beginPlay(); });
  on('btn-quit', function () { P.Tel.log('level_end', { result: 'quit', t_s: +sim.runT.toFixed(1) }); toTitle(); });
  on('btn-export', function () { P.Tel.exportJsonl(); });
  on('btn-retry', function () { newRun(); beginPlay(); });
  on('btn-to-title', toTitle);
  document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); });
  P.Screens.show('scr-title');
  requestAnimationFrame(frame);
  P.debug = { get sim() { return sim; }, get state() { return state; } };
})();
