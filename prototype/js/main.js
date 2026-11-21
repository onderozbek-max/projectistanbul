(function () {
  var $ = function (id) { return document.getElementById(id); };
  var phone = $('phone'), params = new URLSearchParams(location.search);
  var bench = params.get('bench') === '1' ? P.Bench : null;
  var lab = !bench && params.get('weaponlab') === '1' ? P.WeaponLab : null;
  var routePreview = params.get('rhythm') === '1';
  var scale = 1, sim = null, state = 'title', acc = 0, last = 0, timeScale = 1, slowMo = -1, hitStop = 0;
  var offer = null, settingsReturn = null, exitT = 0, perf = { t: 0, frames: [] }, rerolled = false;
  var levelIndex = 1, runOpts = {}, fxSlow = { t: 0, T: 1, k: 1 };
  var runId = null, settlement = null, firstMove = false;
  var STEP = 1 / P.CFG.sim.hz, SEG_TEL = { A: 'seg_a', B: 'seg_b', C: 'seg_c', D: 'seg_d' };
  var FROZEN = { paused: 1, cards: 1, down: 1, chest: 1, story: 1, storyRun: 1, storyEnd: 1 };
  var music = function (id) { if (P.Music) P.Music.play(id); };
  var DEATH_BEAT = 0.8, dyingT = 0, dyingNext = null, frameErrs = 0;   // AUDIT-6 F4: hit-stop before the down screen
  if (P.Meta) P.Meta.onTel = function (event, fields) { P.Tel.log(event, fields); };
  function guard(where, fn) {
    return function () {
      try { return fn.apply(this, arguments); } catch (e) {
        P.UI.bootError(where, e && e.stack ? e.stack.split('\n').slice(0, 2).join(' | ') : e);
        if (bench) bench.interrupt('start_error');
        else if (lab) stopLab();
        else { toTitle(); P.UI.toast(P.t('ui.boot.fail'), null, 2.5); }
        return undefined;
      }
    };
  }
  function buzz(pattern) { if (P.Settings.haptics && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern); }
  if (!bench && !lab) {
    if (params.get('thief') === '0') P.CFG.levels.thief = { type: 'marti', fromHood: 999, from: 999 };
    if (params.get('arsenal')) P.CFG.debugAllWeapons = true;
    if (params.get('meta') === 'unlockall' && P.Meta) P.Meta.debugUnlockAll();
    if (params.get('mastery') !== null) P.CFG.debugMastery = parseInt(params.get('mastery'), 10) || 0;
  }
  function fit() {
    scale = Math.min(window.innerWidth / 390, window.innerHeight / 844);
    phone.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
    P.Render.resize(scale);
  }
  function toLocal(e) { var r = phone.getBoundingClientRect(); return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale }; }
  function newRun(idx, opts) {
    if (idx) { levelIndex = idx; runOpts = opts || {}; }
    var seed = runOpts.seed || (params.get('seed') ? parseInt(params.get('seed'), 10) : (Date.now() % 100000));
    sim = P.createSim(seed, { levelIndex: levelIndex, loadout: !bench && !lab && P.Meta ? P.Meta.loadout(runOpts) : null,
      sarayRaster: !!(P.SarayProps && P.SarayProps.ready()), tramRhythm: !bench && !lab && !params.has('seg') && params.get('rhythm') !== '0' });
    if (bench) P.BenchScenes.setup(sim, bench.scene());
    if (lab) lab.setup(sim, runOpts.weapon, runOpts.rank);
    else runId = P.Tel.startRun(levelIndex, sim.levelInfo, sim.runMode);
    settlement = null; firstMove = false; perf.t = 0; perf.frames.length = 0;
    P.SceneFlow.reset();
    if (P.Barks && P.Barks.reset) P.Barks.reset(seed);
    P.Fx.reset(sim); P.Tel.setSeed(seed);
    acc = 0; timeScale = 1; slowMo = -1; hitStop = 0; rerolled = false; fxSlow.t = 0; P.HitStop = 0;
    dyingNext = null; dyingT = 0; phone.classList.remove('dying');
    if (P.Comic) P.Comic.clearRunDialogue();
    if (P.Speech) P.Speech.reset();
    P.Tel.log('level_start', { level_type: levelIndex === 1 ? 'route' : 'journey', level_id: sim.levelInfo.id, mode: sim.runMode,
      route_trial: sim.routeTrial, route_trial_revision: sim.routeTrial ? P.CFG.levels.routeRevision : undefined,
      route_preview: routePreview || undefined, hero_ids: ['arda'], hero_levels: [1], gear_power: 0 });
  }

  document.addEventListener('pointerdown', function () { if (P.Sfx && P.Sfx.unlock) P.Sfx.unlock(); if (P.Music && P.Music.unlock) P.Music.unlock(); }, { passive: true });
  function startGame() {
    P.Sfx.unlock(); if (P.Music) P.Music.unlock();
    if (bench) { bench.start(); return; }
    if (!P.UI.awaitHero(function () { if (state === 'title') startG(); })) return;
    var direct = parseInt(params.get('level') || '0', 10);
    if (direct > 0) { playLevel(direct); return; }
    if (P.Meta && (P.Settings.l1Cleared || P.Meta.unlockedLevel() > 1 || params.get('map')) && !params.get('seg')) { openMap(); return; }
    playLevel(1);
  }
  function startBenchScene(scene, seed) {
    if (!P.Quality.locked()) { P.Quality.set(0); P.Quality.feed(0, false); }
    newRun(scene.level, { seed: seed });
    beginPlay();
  }
  function stopBench() {
    state = 'bench'; sim = null;
    P.UI.showHud(false);
    if (P.Comic) P.Comic.clearRunDialogue();
    if (P.Sfx.ambience) P.Sfx.ambience(null);
    P.Sfx.stopAll();
    if (P.Music) P.Music.stop();
  }
  function startLab(weapon, rank) {
    P.Sfx.stopAll(); P.Sfx.unlock(); if (P.Music) P.Music.unlock();
    P.Input.reset();
    newRun(lab.config.level, { seed: lab.config.seed, weapon: weapon, rank: rank });
    beginPlay(); lab.setRunning(true);
  }
  function stopLab() {
    state = 'lab'; sim = null; P.Input.reset(); P.Input.enabled = false;
    P.Sfx.stopAll(); if (P.Music) P.Music.stop();
    lab.setRunning(false);
  }

  function openMap(growth) {
    if (!P.Meta) { toTitle(); return; }
    state = 'map'; P.UI.showHud(false); P.Input.enabled = false; P.Screens.hideAll();
    P.Tel.log('journey_opened', { after_result: settlement && settlement.outcome });
    P.Tel.clearRun();
    if (P.Comic) P.Comic.clearRunDialogue();
    if (P.Sfx.ambience) P.Sfx.ambience(null);
    music('map');
    P.Meta.open(playG, growth === true || typeof growth === 'string' ? growth : false);
  }

  function playLevel(i, opts) {
    if (i > P.CFG.experience.through) { openMap(); return; }
    if (P.Meta && P.Meta.isOpen()) P.Meta.close();
    newRun(i, opts);
    P.Screens.hideAll(); P.UI.showHud(false);
    state = 'story';
    if (levelIndex === 1) {
      var run = sim;
      if (!P.StreetArt.awaitOpening(function (ready) {
        if (sim !== run || state !== 'story') return;
        if (ready) coldOpenOrPlay();
        else { toTitle(); P.UI.toast(P.t('ui.art.openingFail'), null, 4); }
      })) return;
      coldOpenOrPlay(); return;
    }
    hoodCard(function () { if (P.Story) P.Story.play(levelIndex, 'intro', beginPlay); else beginPlay(); });
  }
  function hoodCard(next) {
    if (!P.HoodCard || params.get('skipintro')) { next(); return; }
    P.HoodCard.show(sim.levelInfo, { big: sim.levelInfo.stage === 1, mode: sim.runMode }, next);
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
    state = 'story'; P.Input.enabled = false;
    var run = sim, atlas = P.BossActing.wrapAtlas(levelIndex === 25 ? P.EminonuBossFx : sim.milestone && sim.milestone.sirkeci ? P.SirkeciFx : P.BossActing);
    if (atlas && !atlas.awaitArt(function (ready) {
      if (sim !== run || state !== 'story' && state !== 'results') return;
      if (ready) beginPlay();
      else { if (bench) { bench.interrupt('art_failure'); return; } toTitle(); P.UI.toast(P.t(atlas.base === P.BossActing ? 'ui.art.bossFail' : atlas.base === P.SirkeciFx ? 'ui.art.stationFail' : 'ui.art.captainFail'), null, 4); }
    }, levelIndex)) return;
    P.Screens.hideAll(); P.UI.showHud(!lab);
    P.startPlay(sim);
    P.Tel.log('play_started');
    if (!bench && levelIndex === 1 && params.get('seg')) jumpTo(params.get('seg').toUpperCase());
    if (levelIndex === 1) P.Tel.log('segment_reached', { segment_id: 'restaurant', t_s: 0 });
    state = 'play'; P.Input.enabled = !bench; last = performance.now();
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
  function slow(T, k) { if (P.Settings.reduceMotion || !T) return;var next=P.PresentationBudget.slow(T,k);if(next)fxSlow=next; }

  function handleEvents() {
    P.drainEvents(sim).forEach(function (ev) {
      if (!bench && !lab) P.SceneFlow.event(ev, sim);
      P.Fx.onEvent(ev, sim);
      if (P.Consumables) P.Consumables.onEvent(ev, sim);   // T4 part 10: use bursts, floating amounts and the class cue
      if (!lab && P.Barks && P.Barks.onEvent) P.Barks.onEvent(ev, sim);
      if (P.FireAnim) P.FireAnim.onEvent(ev, sim);
      if (P.EnvFx && P.EnvFx.onEvent) P.EnvFx.onEvent(ev, sim);   // lane A: env sfx, shards and labels
      if (lab && (ev.type === 'death' || ev.type === 'win' || ev.type === 'levelup' || ev.type === 'story')) return;
      switch (ev.type) {
        case 'pickup': if (!(P.Consumables && P.Consumables.handles(ev.kind))) P.Sfx.play(ev.kind === 'xp' ? 'tink' : 'click', 30); break;
        case 'shockwave': P.Sfx.play('shock'); break;
        case 'eliteSpawn': P.Sfx.play('elite'); P.Tel.log('elite_spawn', { t_s: +sim.runT.toFixed(1) }); break;
        case 'explode': P.Sfx.play('boom'); break;
        case 'heroHit':
          P.Sfx.play(ev.dmg>=.1*sim.hero.maxHp?'heroHeavy':'heroHurt', 350, {vol:.84});
          if (ev.dmg >= 0.1 * sim.hero.maxHp) { buzz(12); P.Tel.log('player_hit', { source_id: ev.cause, damage: ev.dmg, hp_after: ev.hp }); }
          break;
        case 'frenzy': if (ev.on) buzz([18, 40, 18]); break;
        case 'routeBeat':
          if (ev.phase === 'frenzy_warning' || ev.phase === 'galata_bell_rang' || ev.phase === 'bridgeWave_warning' || ev.phase === 'marketSignal_armed' || ev.phase === 'stationDeparture_bell' || ev.phase === 'stationClock_live') P.Sfx.play('bell');
          else if (ev.phase === 'karakoy_ferryMooring_line_out') P.Sfx.play('ferryHorn');
          else if (ev.phase === 'karakoy_fishShutters_shutter_up' || ev.phase === 'bridgeScreens_closed') P.Sfx.play('shutter');
          else if (ev.phase === 'galata_musician_joined' || ev.phase === 'galata_footbridge_picked_up' || ev.phase === 'karakoy_cargoHook_aligned' || ev.phase === 'marketSacks_delivered') P.Sfx.play('pick');
          else if (ev.phase === 'frenzy_start') P.Sfx.play('snarl');
          else if (ev.phase === 'stationClock_fuse' || ev.phase === 'stationGuide_joined') P.Sfx.play('pick');
          else if (ev.phase === 'stationLights_on') P.Sfx.play('shock');
          if (!lab && !bench && ev.aftercare) P.Comic.pop(ev.aftercare, { important: true });
          P.Tel.log('route_beat', { phase: ev.phase, kills: ev.kills, targets: ev.targets, hero_hit: ev.hitHero, t_s: +sim.runT.toFixed(1) }); break;
        case 'kaanSupport': P.Sfx.play('shock'); P.Tel.log('kaan_support', { count: ev.count, follow_dash: ev.followDash, t_s: +sim.runT.toFixed(1) }); break;
        case 'milestoneLift': P.Sfx.play(ev.kind === 'cart' ? 'pick' : 'shutter'); break;
        case 'tramSceneStart':
          P.Input.reset(); P.Input.enabled = false;
          break;
        case 'tramSceneEnd':
          P.Input.reset(); P.Input.enabled = state === 'play';
          break;
        case 'levelup':
          P.Tel.log('level_up', { run_level: ev.level, t_s: +sim.runT.toFixed(1) });
          if (slowMo < 0) { if (!bench && !(sim.dir.trialBoss || sim.gen && sim.gen.arena)) slowMo = 0; P.Sfx.play('level'); }
          break;
        case 'ult': slow(ev.slowMo || 0.3, 0.25); P.Tel.log('ult_used', { t_s: +sim.runT.toFixed(1) }); break;
        case 'masteryMove': slow(ev.slowMo || 0.4, 0.25); P.Tel.log('mastery_move', { weapon: ev.weapon }); break;
        case 'modChosen': P.Tel.log('mod_chosen', { weapon: ev.weapon, mod: ev.mod }); break;
        case 'signalRestored':
          if (!bench && ev.source === 'hack') P.UI.toast(P.t(ev.mom ? 'zone.momRestored' : 'zone.connected'), null, 3.5);
          break;
        case 'hackStart': case 'hackFail': case 'hackDone':
          var terminal = sim.gen && sim.gen.tramControl && sim.gen.tramControl.id === ev.id ||
            sim.obj && sim.obj.hacks && sim.obj.hacks.some(function (h) { return h.id === ev.id; });
          P.Tel.log(ev.type === 'hackStart' ? 'hack_start' : ev.type === 'hackDone' ? 'hack_done' : 'hack_reset',
            { terminal_id: ev.id, objective_terminal: !!terminal, kind: ev.kind, kept: !!ev.kept, t_s: +sim.runT.toFixed(1) }); break;
        case 'evolve': P.Tel.log('evolve', { from: ev.from, to: ev.to, t_s: +sim.runT.toFixed(1) }); break;
        case 'bossIntro': music('boss'); P.Tel.log('boss_intro', { boss: ev.nameKey, t_s: +sim.runT.toFixed(1) }); break;
        case 'bossDie': if (P.Music) P.Music.stop(0.55); break;
        case 'story': if (!bench) storyBeat(ev.when); break;
        case 'segment': P.Tel.log('segment_reached', { segment_id: SEG_TEL[ev.id] || ev.id, t_s: +sim.runT.toFixed(1) }); break;
        case 'objStart': case 'objDone': case 'objFail':
          if (!bench && ev.type === 'objDone' && ev.id.indexOf('defend.') === 0) {
            P.Sfx.play('pick'); P.UI.toast(P.t('zone.message'), P.t('zone.bonus'), 3.5);
          }
          P.Tel.log('objective', { objective_id: ev.id, action: ev.type === 'objStart' ? 'start' : ev.type === 'objDone' ? 'done' : 'missed', t_s: +sim.runT.toFixed(1) }); break;
        case 'tutorial': P.Tel.log('tutorial_step', { step_id: ev.id, t_s: +sim.runT.toFixed(1) }); break;
        case 'catHiss': P.Sfx.play('hiss'); P.Sfx.play('rattle'); break;
        case 'scaffold': P.Sfx.play('boom'); break;
        case 'holdStart': P.Sfx.play('shutter'); break;
        case 'shutterOpen': P.Sfx.play(levelIndex === 1 ? 'bell' : 'doorSlam'); break;
        case 'doorOpen': P.Sfx.play('click'); break;
        case 'propBreak': P.Sfx.play(ev.kind === 'simit' ? 'rattle' : 'glass'); break;
        case 'death': if (!bench) onDeath(); break;
        case 'win': if (!bench) onWin(); break;
      }
    });
  }

  function storyBeat(when) {
    if (!P.Story || when === 'end') return;
    var opened = P.Story.play(levelIndex, when, function () {
      if (state === 'storyRun') { P.Screens.hideAll(); state = 'play'; P.Input.enabled = true; last = performance.now(); }
    });
    if (opened && state === 'play') { state = 'storyRun'; P.Input.reset(); P.Input.enabled = false; }
  }
  function openCards() {
    slowMo = -1; timeScale = 1; state = 'cards';
    P.Input.reset(); P.Input.enabled = false;
    offer = P.Progression.makeOffer(sim); rerolled = false;
    P.Tel.log('card_offered', { cards: offer.cards.map(function (c) { return c.id; }), scripted: offer.scripted, recipe_offer: recipeOffer(), recipe: P.Progression.buildState(sim), t_s: +sim.runT.toFixed(1) });
    P.Screens.showCards(sim, offer, pickCard, reroll);
  }
  function pickCard(card) {
    P.Tel.log('card_chosen', { cards: offer.cards.map(function (c) { return c.id; }), chosen: card.id,
      rank: card.next, fork_id: card.mods && card.mods[card.pick], recipe_choice: !!card.recipe, rerolled: rerolled, t_s: +sim.runT.toFixed(1) });
    P.Progression.choose(sim, card);
    if (P.UIProgress) P.UIProgress.queueLevelUp(sim, card);   // the 1.2 s banner, shown in play once no overlay is up
    handleEvents();
    continueRewards();
  }

  function openChest() {
    state = 'chest'; P.Input.reset(); P.Input.enabled = false;
    var card = P.Progression.chestReward(sim);
    P.Tel.log('chest_shown', { item: card.id, evo: !!card.evo, fork: !!card.fork, recipe: P.Progression.buildState(sim), t_s: +sim.runT.toFixed(1) });
    P.Screens.showChest(sim, card, function (c) {
      P.Progression.openChest(sim, c);
      P.Tel.log('chest_opened', { item: c.id, level: c.next, evo: !!c.evo, t_s: +sim.runT.toFixed(1) });
      handleEvents();
      continueRewards();
    });
  }
  function continueRewards() {
    if(P.SkillsFx.evolutionActive()){state='reveal';P.Screens.hideAll();P.Input.reset();P.Input.enabled=false;return;}
    if(sim.pendingLevels>0){openCards();return;}
    if(sim.pendingChests>0){openChest();return;}
    P.Screens.hideAll();state='play';P.Input.enabled=true;last=performance.now();
  }
  function reroll(focus) {
    if (sim.rerolls <= 0 || (focus && focus !== P.Progression.rerollFocus(sim))) return;
    sim.rerolls--; rerolled = true;
    offer = P.Progression.makeOffer(sim, focus);
    P.Tel.log('card_offered', { cards: offer.cards.map(function (c) { return c.id; }), scripted: offer.scripted, rerolled: true, focus: focus || undefined, recipe_offer: recipeOffer(), recipe: P.Progression.buildState(sim), t_s: +sim.runT.toFixed(1) });
    P.Screens.showCards(sim, offer, pickCard, reroll);
  }
  function recipeOffer() { var card = offer.cards.find(function (c) { return c.recipe; }); return card ? card.id : null; }
  function pause() {
    if(state==='reveal'){P.SceneFlow.background('story');P.SceneFlow.foreground();return;}
    if (state !== 'play') return;
    if (P.SceneFlow.running(sim)) { P.SceneFlow.background('story'); P.SceneFlow.foreground(); return; }
    if (bench) { bench.interrupt(document.hidden ? 'hidden' : 'paused'); return; }
    if (lab) { P.Input.reset(); return; }
    state = 'paused'; P.Input.reset(); P.Input.enabled = false;
    P.Screens.showPause(sim);
  }
  function resume() { P.Screens.hideAll(); state = 'play'; P.Input.enabled = !P.Hack.tramScene(sim); last = performance.now(); }
  function openSettings(from) {
    settingsReturn = from;
    if (from === 'map' && P.Meta) P.Meta.close();
    P.Screens.showSettings(function () {
      if (settingsReturn === 'pause') { P.Screens.showPause(sim); $('btn-pause-settings').focus({ preventScroll: true }); }
      else if (settingsReturn === 'map') openMap();
      else { P.Screens.show('scr-title'); $('btn-title-settings').focus({ preventScroll: true }); }
    }, function () { P.UI.applyI18n(); });
    $('btn-settings-back').focus({ preventScroll: true });
  }

  // ---------- death / revive / end ----------
  function onDeath() {
    P.Input.reset(); P.Input.enabled = false;
    P.Tel.log('death', { cause_id: sim.deathCause, t_s: +sim.runT.toFixed(1), run_level: sim.level, build: Object.keys(sim.hero.weapons).concat(Object.keys(sim.hero.passives)) });
    // Daily Iron (no revive): no second wind; the down screen still shows, without the revive choices (AUDIT-7 CR-1).
    var noRevive = !!(P.Modifiers && P.Modifiers.reviveBlocked && P.Modifiers.reviveBlocked(sim));
    if (!noRevive && !P.Settings.firstRunDone && !sim.secondWindUsed) {
      P.revive(sim, 'secondWind');
      P.Tel.log('revive_used', { method: 'second_wind' });
      P.UI.toast(P.t('ui.secondWind'), P.t('ui.secondWindSub'), 2.5);
      P.Input.enabled = true; handleEvents();
      return;
    }
    // Death beat (AUDIT-6 F4): the world freezes and desaturates for 0.8 s, then the down screen (or results).
    state = 'dying'; dyingT = P.Settings.reduceMotion ? 0 : DEATH_BEAT;
    if (P.DeathBeat) P.DeathBeat.focus(sim);   // the zoom's origin, set before the class starts the transition (view only)
    phone.classList.add('dying');
    dyingNext = sim.reviveUsed ? function () { endRun(false); } : showDown;
  }

  function showDown() {
    phone.classList.remove('dying');
    state = 'down';
    if (!(P.Modifiers && P.Modifiers.reviveBlocked && P.Modifiers.reviveBlocked(sim))) P.Tel.log('revive_offer', { methods: ['playtest'] });
    P.Screens.showDown(sim, {
      revive: function () {
        if (state !== 'down') return;
        P.revive(sim, 'playtest'); P.Tel.log('revive_used', { method: 'playtest' });
        handleEvents(); P.Screens.hideAll(); state = 'play'; P.Input.enabled = true;
      },
      giveUp: function () { endRun(false); },
    });
  }

  function onWin() {
    if (settlement) return;
    state = 'exit'; exitT = 0; P.Input.reset(); P.Input.enabled = false;
    P.Tel.log('segment_reached', { segment_id: 'exit', t_s: +sim.runT.toFixed(1) });
    settleRun('win');
    if (P.Comic) P.Comic.clearRunDialogue();
    if (levelIndex === 1) { P.Sfx.play('slam'); sim.props.shutterOpen = false; sim.props.shutter = 0; return; }
    if (!sim.geo || !sim.geo.boss) P.Sfx.play('levelClear');
    P.UI.toast(P.t('ui.res.clear'), P.upper(sim.levelInfo.hood.name), 1.6);
  }

  // L1 keeps its scripted "no signal" exit; journey levels get a short clear beat. Both end on the 'end' story beat.
  function updateExit(dt) {
    if (P.SceneFlow.running(sim)) return;
    var before = exitT; exitT += dt;
    var at = function (t) { return before < t && exitT >= t; };
    if (levelIndex !== 1) { if (at(1.6)) finishWin(); return; }
    if (at(0.6)) { sim.dir.call.sub = { id: 'exit1', t: 2.0 }; sim.dir.call.bars = 0; P.Sfx.play('nosignal'); }
    if (at(2.6)) sim.dir.call.sub = { id: 'exit2', t: 2.0 };
    if (at(4.8)) { P.UI.showHud(false); P.Screens.show('scr-slam'); P.Sfx.play('slam'); }
    if (at(7.8)) finishWin();
    if (sim.dir.call.sub) { sim.dir.call.sub.t -= dt; if (sim.dir.call.sub.t <= 0) sim.dir.call.sub = null; }
  }

  function finishWin() {
    var completed = sim, remaining = 2;
    function showResults() { if (--remaining === 0 && sim === completed && state === 'storyEnd') endRun(true); }
    state = 'storyEnd'; P.UI.showHud(false);
    if (P.Finale && P.Finale.start && P.Finale.start(levelIndex, sim, function () { remaining = 1; showResults(); })) return;
    if (!P.SceneFlow.result(sim, showResults)) showResults();
    if (P.Story && !P.SceneFlow.endingShown(sim)) P.Story.play(levelIndex, 'end', showResults, sim); else showResults();
  }

  function settleRun(outcome) {
    if (settlement) return settlement;
    var win = outcome === 'win', preview = routePreview && !!sim.routeTrial;
    var C = P.CFG.rewards, h = sim.hero, L = sim.levelInfo;
    // Star goals (lane P, objectives.js): clear, no revive, objective bonus. A loss earns no stars; the labels stay.
    var mode = sim.runMode || 'normal', ns = mode === 'nightshift', score = ns ? P.Modes.nightScore(sim) : 0;
    var goals = P.Objectives && P.Objectives.goals && !ns ? P.Objectives.goals(sim, win).map(function (g) { return Object.assign({}, g, { on: win && g.on }); }) : null;
    var stars = goals ? goals.map(function (g) { return g.on; }) : win ? [true, !sim.reviveUsed, h.hp / h.maxHp >= 0.5] : [false, false, false];
    if (mode === 'nightmare') {   // R1-T4 part 18: the fourth star (clear, no revive, lowest HP at or above config fourthHp)
      var fourth = P.Modes.fourthStar(sim, win, sim.reviveUsed);
      stars.push(fourth);
      if (goals) goals.push({ key: 'res.star4', vars: { n: Math.round(P.CFG.levels.nightmare.fourthHp * 100) }, on: fourth, hp: false });
    }
    if (ns) stars = [];   // Night Shift has no stars: its results show score and time
    var nStars = stars.filter(Boolean).length, first = win && !P.Settings.l1Cleared && levelIndex === 1;
    var jeton = win ? (C.jetonBase + C.jetonPerLevel * levelIndex) * (first ? C.firstClearMult : 1) + sim.jeton : Math.floor(sim.jeton * C.loseKeep);
    var km = 0, hurda = win && !ns ? C.hurdaBase * (first ? C.firstClearMult : 1) : 0;
    if (preview) { jeton = 0; hurda = 0; }
    if (P.Meta && !preview) {
      var pend = P.Meta.onResults({ runId: runId, outcome: outcome, levelIndex: levelIndex, won: win, stars: nStars, coins: sim.jeton, kills: sim.kills, timeS: sim.runT,
        tally: sim.tally, reviveUsed: !!sim.reviveUsed, daily: !!runOpts.daily, modifiers: runOpts.modifiers || null, hero: 'arda',
        mode: mode, score: score, marketCover: !!sim.kaanRepay, localChoice: P.LocalChoices.record(sim) });
      if (pend && pend.reward) { jeton = pend.reward.total; hurda = pend.reward.hurda || 0; first = pend.reward.first; }
      km = P.Meta.progress().kmShown;   // the walk toward the next hood, partial (saved km is unchanged)
    }
    var r = { outcome: outcome, win: win, stars: stars, goals: goals, jeton: jeton, hurda: hurda, kills: sim.kills, firstClear: first,
              time: sim.runT, level: sim.level, streak: sim.tally.maxStreak | 0, hpPct: Math.round(h.hp / h.maxHp * 100),
              hood: L.hood.name, hoodN: L.hoodIndex + 1, stage: L.stage, km: (+km || 0).toFixed(1),
              hasNext: levelIndex < P.CFG.experience.through && !ns,
              mode: mode, score: score, meta: pend || null, recipe: P.Progression.buildState(sim), deathCause: sim.deathCause };
    var bonus = P.Objectives.results(sim); settlement = r;
    P.Tel.log('level_end', { result: outcome, mode: mode, t_s: +sim.runT.toFixed(1), stars: nStars, kills: sim.kills,
      route_clear: win, bonus_id: bonus ? bonus.id : null, bonus_result: bonus ? bonus.state : null, rewards: { jeton: jeton, hurda: hurda },
      recipe: r.recipe, chests_opened: sim.chestsOpened, evolution_combat: sim.evolutionUse, evolved_use_s: sim.evolvedAt == null ? null : +(sim.runT - sim.evolvedAt).toFixed(1) });
    if (!preview && (win || outcome === 'lose')) {
      P.Settings.firstRunDone = true;
      if (win && levelIndex === 1) P.Settings.l1Cleared = true;
      P.saveSettings();
    }
    return r;
  }
  function endRun(win) {
    if (state === 'results') return;
    var r = settleRun(win ? 'win' : 'lose');
    state = 'results'; P.UI.showHud(false);
    if (P.Comic) P.Comic.clearRunDialogue();
    if (P.Sfx.ambience) P.Sfx.ambience(null);
    music(win ? 'victory' : 'defeat'); P.Sfx.play(win ? 'star' : 'levelFail');
    P.Screens.showResults(r);
  }

  function toTitle() {
    if (P.Meta && P.Meta.isOpen && P.Meta.isOpen()) P.Meta.close();
    if (P.Comic) P.Comic.clearRunDialogue();
    state = 'title'; P.UI.showHud(false); P.Input.enabled = false; P.Screens.show('scr-title'); music('title');
  }
  function quitToMap() {
    if (state !== 'paused') return;
    settleRun('quit');
    if (P.Meta) openMap(); else toTitle();
  }

  function perfSample(dt) {
    perf.t += dt; perf.frames.push(dt * 1000);
    if (perf.t < 10) return;
    var f = perf.frames.slice().sort(function (a, b) { return a - b; }), h = sim.hero, hp = h.hp / h.maxHp;
    P.Tel.log('perf_sample', { fps_avg: Math.round(f.length / perf.t), frame_p95_ms: +f[Math.floor(f.length * 0.95)].toFixed(1), enemies_alive: sim.enemies.length,
      t_s: +sim.runT.toFixed(1), hp_pct: Math.round(hp * 100), low_hp: hp < P.CFG.feel.lowHpFrac });
    perf.t = 0; perf.frames = [];
  }

  function feelScale(dt) {
    var k = 1;
    if (fxSlow.t > 0) { fxSlow.t -= dt; k *= 1 - (1 - fxSlow.k) * Math.min(1, Math.max(0, fxSlow.t / fxSlow.T) * 1.6); }
    if (P.Fx.timeScale) k *= P.Fx.timeScale();
    if (P.Comic && P.Comic.timeScale) k *= P.Comic.timeScale();
    return k;
  }

  function stepPlay(dt) {
    // The finishing beat owns the scene before rewards or new actions can cover it.
    if (P.SceneFlow.running(sim) || P.BossDefeatFx && P.BossDefeatFx.running(sim)) { acc = 0; return; }
    if (slowMo < 0 && P.SceneFlow.choiceReady(sim,dt)) { if(sim.pendingLevels>0)openCards();else openChest();return; }
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
      if (bench) P.BenchScenes.step(sim, STEP, bench.scene());
      else if (lab) lab.step(sim, STEP, P.Input.get());
      else {
        var input = P.Input.get(), moved = sim.hero.moved;
        if (input.dash) input.dash = P.UI.abilityVisible(sim, 'dash');
        if (input.skill) input.skill = P.UI.abilityVisible(sim, 'skill');
        if (input.ult) input.ult = P.UI.abilityVisible(sim, 'ult');
        P.stepSim(sim, STEP, input);
        if (!firstMove && (input.x || input.y || input.dash) && sim.hero.moved > moved) {
          firstMove = true; P.Tel.log('first_move', { t_s: +sim.runT.toFixed(1) });
        }
      }
      handleEvents();
      if (bench && sim.mode !== 'play') { bench.interrupt(sim.mode); return; }
      acc -= STEP; steps++;
      if (state !== 'play' || slowMo >= 0 || P.SceneFlow.running(sim) || (P.BossDefeatFx && P.BossDefeatFx.running(sim))) break;
    }
    if (steps === P.CFG.sim.maxStepsPerFrame) acc = 0;
    if (!lab && P.Barks && P.Barks.update) P.Barks.update(dt, sim);
    if (P.Fauna && P.Fauna.update) P.Fauna.update(dt, sim);   // R1: ambient cats and birds (view only, reads the sim)
    if (!bench && !lab && state === 'play') { perfSample(dt); if (P.Music) P.Music.score(sim, dt); }
  }
  // Frame cadence (T4 part 12; view only). The logic and the world draw run at most 60 times a second, so a 120 Hz display runs
  // every second callback. While the world is frozen behind an overlay (pause, cards, chest, down, story pages) they run at
  // view.quality.menuFps (30). The sim keeps its fixed 60 Hz step, and dt is the real time since the last run, so nothing slows down.
  // A hidden page runs nothing (the browser also stops the callbacks; pause() already ran on visibilitychange).
  var RUN_MS = 1000 / 60, MENU_RUN_MS = 1000 / P.CFG.view.quality.menuFps, lastRun = -1e9;
  var LIVE = { play: 1, exit: 1, dying: 1, cold: 1 };   // states where the sim runs: their frame interval is what the governor measures
  function frame(ts) {
    try { if (!document.hidden) tick(ts); } catch (e) {
      if (frameErrs++ % 60 === 0) P.UI.bootError('frame', e && e.stack ? e.stack.split('\n').slice(0, 2).join(' | ') : e);
      if (bench) bench.interrupt('frame_error');
    }
    requestAnimationFrame(frame);
  }

  function tick(ts) {
    if (P.SceneFlow.suspended()) { last = ts; return; }
    var gap = ts - lastRun, want = FROZEN[state] ? MENU_RUN_MS : RUN_MS;
    if (gap < want - 2) return;   // not due yet (2 ms of slack for display jitter)
    var workStart = bench ? performance.now() : 0, drawn = 0;
    lastRun = ts;
    var dt = Math.min(0.1, (ts - (last || ts)) / 1000);
    last = ts;
    if (!FROZEN[state]) P.SceneFlow.step(sim, dt);
    if (state === 'storyEnd') P.SceneFlow.step(sim, dt);
    if (state === 'cold') P.ColdOpen.update(dt);
    if (state === 'play') stepPlay(dt);
    if (state === 'exit') updateExit(dt);
    if (state === 'storyEnd' && P.Finale && P.Finale.tick) P.Finale.tick(dt);
    if (state === 'dying' && (dyingT -= dt) <= 0 && dyingNext) { var next = dyingNext; dyingNext = null; next(); }
    if(P.Quality)P.Quality.feed(gap,!!LIVE[state]);
    if (sim && state !== 'title' && state !== 'results' && state !== 'map') {
      P.Fx.update(sim, FROZEN[state] || P.SceneFlow.running(sim) ? 0 : dt);
      if (P.FireAnim) P.FireAnim.update(FROZEN[state] || P.SceneFlow.running(sim) ? 0 : dt * (P.Fx.timeScale ? P.Fx.timeScale() : 1), sim);
      drawn = P.Render.frame(sim, levelIndex === 1 && !bench ? P.ColdOpen.draw : null);
      if (!lab && (state === 'play' || state === 'exit')) P.UI.update(sim); else document.getElementById('prompt').classList.add('hidden');
      if (!bench && !lab && P.Hints) P.Hints.update(state === 'play' && !(P.BossDefeatFx && P.BossDefeatFx.running(sim)) ? sim : null, dt);   // T4 part 10: first-time callouts (never pauses the game)
    }
    if(state==='reveal'&&!P.SkillsFx.evolutionActive())continueRewards();
    P.UI.tick(dt);
    if (P.Speech) P.Speech.tick(dt);
    if (P.Quality) {
      if (P.Quality.debugFps) P.Quality.debugText(ts, $('game'), P.Render.dpr);
    }
    if (bench && sim && state === 'play') bench.observe(ts, gap, performance.now() - workStart, sim, drawn);
  }

  function on(id, fn) { $(id).addEventListener('click', function (e) { e.stopPropagation(); fn(e); }); }
  if (P.SarayProps) P.SarayProps.prepare();
  if (P.ArtRaster) P.ArtRaster.prepare();
  P.Render.init($('game')); P.UI.init(); fit(); window.addEventListener('resize', fit);
  P.Input.init(phone, toLocal); P.Input.onPause = pause;
  if (P.Quality) { P.Quality.onChange(function () { P.Render.resize(scale); }); if (P.Quality.debugFps) P.Quality.showFps(phone); }   // T4 part 12
  P.UI.applyI18n(); if (!bench && !lab) $('keyart').src = $('keyart').dataset.src;
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
  function requestDash() { if (state === 'play' && P.Skills.hud(sim).dashReady) P.Input.requestDash(); }
  on('dash-chip', requestDash);
  $('dash-chip').addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'touch') return;
    e.preventDefault(); e.stopPropagation(); requestDash();
  });
  on('btn-ult', function () { if (state === 'play' && P.Input.requestUlt) P.Input.requestUlt(); });
  on('btn-resume', resume);
  on('btn-pause-settings', function () { openSettings('pause'); });
  on('btn-restart', function () {
    if (state !== 'paused') return;
    settleRun('restart'); newRun(); beginPlay();
  });
  on('btn-quit', quitToMap);
  on('btn-export', function () { P.Tel.exportJsonl(); });
  on('btn-settings-export', function () { P.Tel.exportJsonl(); });
  // Next level: Nightmare carries on only inside the same hood (meta-modes.js nextMode); otherwise Normal.
  on('btn-next', function () {
    var nx = levelIndex + 1, m = P.Meta && P.Meta.Modes ? P.Meta.Modes.nextMode(sim.runMode, levelIndex, nx) : 'normal';
    playG(nx, m === 'nightmare' ? { mode: m } : {});
  });
  on('btn-retry', function () { if (state === 'results') { newRun(); beginPlay(); } });
  on('btn-res-growth', function () { if (state === 'results') openMap($('btn-res-growth').dataset.stat || true); }); on('btn-res-experiment', function(){if(state==='results')openMap($('btn-res-experiment').dataset.target);});
  on('btn-to-title', function () { if (P.Meta) openMap(); else toTitle(); });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { P.SceneFlow.background(state); if (!P.SceneFlow.running(sim)) pause(); P.Input.reset(); } else P.SceneFlow.foreground();
  });
  if (bench) {
    phone.classList.add('bench-mode'); P.Screens.hideAll(); state = 'bench';
    bench.mount(startG, startBenchScene, stopBench);
  } else if (lab) {
    P.Screens.hideAll(); state = 'lab'; lab.mount(guard('weaponLab', startLab));
  } else P.Screens.show('scr-title');
  P.Tel.log('app_open');
  requestAnimationFrame(frame);
  P.debug = { get sim() { return sim; }, get state() { return state; }, playLevel: playG, openMap: openMap };
})();
