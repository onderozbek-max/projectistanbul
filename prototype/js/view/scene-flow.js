// A presentation owns its lock, never campaign outcomes. LIVE task actions keep the simulation running.
P.SceneFlow = (function () {
  var S = {}, C = P.CFG.experience.scenes, active = null, pending = null, endingRun = null, held = false, cover, skipButton, entry = null, choiceWait = 0;
  var seen = P.Settings.sceneSeen || (P.Settings.sceneSeen = {});
  function resetInput(enabled) { if (P.Input) { P.Input.reset(); P.Input.enabled = !!enabled; } }
  function mark(id) { seen[id] = true; if (P.saveSettings) P.saveSettings(); }
  function button() {
    if (skipButton) return skipButton;
    skipButton = document.createElement('button'); skipButton.className = 'scene-skip';
    skipButton.setAttribute('aria-label', P.t('ui.skip')); skipButton.textContent = P.t('ui.skip');
    skipButton.onpointerdown = function (e) { e.stopPropagation(); if (active) active.holding = true; };
    skipButton.onpointerup = skipButton.onpointerleave = skipButton.onpointercancel = function () {
      if (active) { active.holding = false; active.hold = 0; }
    };
    document.getElementById('phone').appendChild(skipButton);
    return skipButton;
  }
  function begin(s, kind, id, duration, actor, done) {
    if (active) return false;
    active = { run: s, kind: kind, id: id, t: 0, T: seen[id] ? C.retryT : duration, actor: actor,
      done: done, holding: false, hold: 0, repeated: !!seen[id] };
    if (P.SceneActing) P.SceneActing.prepare(active);
    resetInput(false);
    if (typeof document !== 'undefined') { button().hidden = false; document.getElementById('phone').classList.add('protected-scene');
      document.getElementById('phone').classList.toggle('world-aftermath', kind !== 'entry'); }
    if (P.Music) { P.Music.duck(true); if (kind === 'farewell') P.Music.play('comic', { fade: 1.1 }); }
    if (P.Tel) P.Tel.log('scene_start', { scene_id: id, mode: 'protected', repeated: active.repeated, t_s: s.runT });
    return true;
  }
  S.reset = function () {
    active = null; pending = null; endingRun = null; held = false; entry = null; choiceWait = 0;
    if (skipButton) skipButton.hidden = true;
    if (cover) cover.hidden = true;
    if (typeof document !== 'undefined') document.getElementById('phone').classList.remove('protected-scene', 'world-aftermath');
  };
  S.running = function (s) { return !!active && active.run === s; };
  S.current = function () { return active; };
  S.presentingWorld = function () { return !!active && active.kind !== 'entry' && !active.reading && active.t < active.T; };
  S.endingShown = function (s) { return endingRun === s; };
  S.suspended = function () { return held || typeof document !== 'undefined' && document.hidden; };
  S.event = function (ev, s) {
    if (s.weaponLab || s.levelIndex > P.CFG.experience.through) return;
    if (ev.type === 'bossDie') {
      if (P.Barks) P.Barks.clear();
      if (P.Comic) P.Comic.clearPops();
      if ([20,25,30].indexOf(s.levelIndex) >= 0) pending = { run: s, actor: ev.body || s.gen && s.gen.boss };
      return;
    }
    if (ev.type !== 'bossIntro') return;
    var e = s.dir.trialBoss || s.gen && s.gen.boss;
    if (!e || e.dead) return;
    if(s.pendingLevels||s.pendingChests){entry={s:s,e:e};return;}
    begin(s, 'entry', 'E05-L' + s.levelIndex + '-' + e.bossPreset, C.entryT, e);
  };
  S.result = function (s, done) {
    if (endingRun === s) return false;
    if (s.mode !== 'won' || [20,25,30].indexOf(s.levelIndex) < 0) return false;
    var kind = s.levelIndex === 20 ? 'joining' : s.levelIndex === 25 ? 'farewell' : 'passage';
    if (seen['E10-L' + s.levelIndex + '-' + kind]) return false;
    var actor = pending && pending.run === s ? pending.actor : s.gen && s.gen.boss;
    pending = null;
    return begin(s, kind, 'E10-L' + s.levelIndex + '-' + kind, C[kind === 'joining' ? 'kaanT' : kind === 'farewell' ? 'farewellT' : 'passageT'],
      actor, done);
  };
  S.finish = function (skipped) {
    if (!active) return;
    var a = active; active = null;
    if(a.kind!=='entry'&&P.Companion)P.Companion.endScene(a.run);
    mark(a.id);
    if (skipButton) { skipButton.hidden = true; skipButton.style.setProperty('--hold', '0%'); }
    if (typeof document !== 'undefined') document.getElementById('phone').classList.remove('protected-scene', 'world-aftermath');
    resetInput(a.run.mode === 'play');
    if (a.ownsStory && P.UI) P.UI.showHud(a.run.mode === 'play');
    if (P.Music) P.Music.duck(!!(P.Comic && P.Comic.active()));
    if (P.Tel) P.Tel.log('scene_end', { scene_id: a.id, skipped: !!skipped, t_s: a.run.runT });
    if (a.done) a.done();
  };
  // Existing scene owner also schedules earned decisions; wall time bounds unsafe deferral.
  S.choiceReady=function(s,dt){
    if(!s.pendingLevels&&!s.pendingChests){choiceWait=0;return false;}
    return !!entry || !P.Progression.choiceCanWait(s);
  };
  S.step = function (s, dt) {
    if(entry&&!s.pendingLevels&&!s.pendingChests&&!(P.SkillsFx&&P.SkillsFx.evolutionActive())){
      var next=entry;entry=null;if(!next.e.dead)begin(s,'entry','E05-L'+s.levelIndex+'-'+next.e.bossPreset,C.entryT,next.e);
    }
    if (pending && pending.run === s && !active && !(P.BossDefeatFx && P.BossDefeatFx.running(s))) startAftermath(s);
    if (!S.running(s) || S.suspended()) return;
    if(!active.reading)active.t = Math.min(active.T, active.t + dt);
    frame(active, dt);
    active.hold = active.holding ? active.hold + dt : 0;
    if (skipButton) skipButton.style.setProperty('--hold', Math.min(100, active.hold / C.skipHold * 100) + '%');
    if (active.ownsStory && active.hold >= C.skipHold && P.Comic) P.Comic.skipPage();
    var readAt=active&&active.kind==='joining'&&active.stage?active.stage.lead+active.stage.approach:active&&active.T;
    if (active && active.ownsStory && (active.t >= readAt || active.hold >= C.skipHold) && !active.storyStarted) {
      startReading(active);
      if (active && active.hold >= C.skipHold && P.Comic) P.Comic.skipPage();
    }
    if (active && active.ownsStory && active.t >= active.T && typeof document !== 'undefined') {
      document.getElementById('phone').classList.remove('world-aftermath');
      if (skipButton) skipButton.hidden = true;
    }
    if (active && (active.hold >= C.skipHold || active.t >= active.T) && (!active.ownsStory || active.storyDone)) S.finish(active.hold >= C.skipHold);
  };
  function startAftermath(s) {
    var actor = pending.actor; pending = null;
    var kind = s.levelIndex === 20 ? 'joining' : s.levelIndex === 25 ? 'farewell' : 'passage';
    var beat = P.Story && P.Story.beat(s.levelIndex, 'end', s);
    var id = 'E10-L' + s.levelIndex + '-' + kind + '-' + (beat && beat.id || 'native');
    begin(s, kind, id, C[kind === 'joining' ? 'kaanT' : kind === 'farewell' ? 'farewellT' : 'passageT'], actor);
    endingRun = s;
    if (P.Fx && P.Fx.quiet) P.Fx.quiet();
    if (P.FireAnim) P.FireAnim.reset(s);
    if (P.Barks) P.Barks.clear();
    if (P.Comic) P.Comic.clearPops();
    if (active.repeated || !P.Story) return;
    var a = active; a.ownsStory = true; a.storyDone = false; a.storyStarted = false;
    if (P.UI) P.UI.showHud(false);
  }
  function startReading(a) {
    if(a.kind!=='joining')a.t = a.T;
    a.storyStarted = true;a.reading=true;
    if (typeof document !== 'undefined') document.getElementById('phone').classList.remove('world-aftermath');
    P.Story.play(a.run.levelIndex, 'end', function () { a.storyDone = true;a.reading=false;
      if(a.kind==='joining'&&typeof document!=='undefined')document.getElementById('phone').classList.add('world-aftermath');
    }, a.run);
  }
  function frame(a, dt) {
    var s = a.run, h = s.hero, b = a.actor, cam = P.Fx && P.Fx.cam;
    if(P.SceneActing)P.SceneActing.step(a,dt);
    if (!cam) return;
    var human = a.kind !== 'entry', closeBody = b && Math.hypot(b.x - h.x, b.y - h.y) < 5;
    var x = b && (!human || closeBody) ? (h.x + b.x) * .5 : h.x + .55;
    var y = b && (!human || closeBody) ? (h.y + b.y) * .5 : h.y + .45;
    var width = b && !human ? Math.max(10, Math.abs(b.x - h.x) + 4, (Math.abs(b.y - h.y) + 5) / (P.CFG.view.aspect * .6)) : 6.8;
    if(human&&s.companion){var k=s.companion;x=(h.x+k.x)*.5;y=(h.y+k.y)*.5;
      width=Math.max(6.8,Math.abs(h.x-k.x)+4,(Math.abs(h.y-k.y)+4)/(P.CFG.view.aspect*.6));}
    if (human && b && a.t < 1.2 && !a.repeated) { x=b.x; y=b.y; width=6.8; }
    if (a.kind !== 'entry') y += .25;
    if(P.Settings.reduceMotion)width=P.CFG.view.holdWidthM;
    var blend = P.Settings.reduceMotion ? 1 : Math.min(1, dt * 4);
    cam.x += (x - cam.x) * blend; cam.y += (y - cam.y) * blend; cam.w += (width - cam.w) * blend;
    cam.ox = cam.oy = cam.rot = 0; cam.zoom = 1;
  }
  S.background = function (state) {
    if (P.ColdOpen && P.ColdOpen.cancelHold) P.ColdOpen.cancelHold();
    if (P.Comic && P.Comic.cancelHold) P.Comic.cancelHold();
    if (active) { active.holding = false; active.hold = 0; }
    if (P.Sfx && P.Sfx.suspend) P.Sfx.suspend();
    if (!active && (state === 'play' || state === 'paused' || state === 'title' || state === 'map' || state === 'results')) return;
    held = true; resetInput(false);
  };
  S.resume = function () { held = false; resetInput(false); if (cover) cover.hidden = true; };
  S.foreground = function () {
    if (!held || typeof document === 'undefined') return;
    if (!cover) {
      cover = document.createElement('div'); cover.className = 'scene-resume'; cover.setAttribute('role', 'dialog');
      var b = document.createElement('button'); b.textContent = P.t('ui.pause.resume');
      b.onclick = function () { S.resume(); if (P.Sfx) P.Sfx.unlock(); if (P.Music) P.Music.unlock(); };
      cover.appendChild(b); document.getElementById('phone').appendChild(cover);
    }
    cover.hidden = false;
  };
  S.actor = function (e, o, unit) {
    if (!active || active.kind !== 'entry' || active.actor !== e) return 0;
    var q = Math.min(1, active.t / Math.max(.01, active.T * .7));
    o.phase = active.t * 5.4; o.stopped = q >= 1;
    o.sceneEntry = q;
    if(active.entryActor)o.scenePosition=active.entryActor;
    return 0;
  };
  S.hero = function (s, options) {
    if (!S.running(s)) return;
    var a = active, actor = a.actor, aim = actor ? Math.atan2(actor.y - s.hero.y, actor.x - s.hero.x) : Math.PI / 2;
    var humanAim = P.SceneActing && P.SceneActing.heroAim(a);
    if (humanAim !== null && humanAim !== undefined) aim = humanAim;
    if (a.kind !== 'entry' && a.t > a.T - 1.2) aim = Math.PI / 2;
    options.still = !s.hero.moving; options.noArms = true; options.backHand = null;
    options.attackId=null;options.attackProgress=0;
    if(a.kind!=='entry'){options.flash=0;options.phase=(s.hero.walk||0)*5;options.gaitGain=s.hero.moving?1:0;options.motion={};}
    options.back = Math.sin(aim) > .4; options.side = Math.abs(Math.cos(aim)) > .65;
    options.attackStance = { arm: 'rest', aim: aim, hip: 0, bend: .04, plant: 1, lean: 0, height: 0, depth: 0 };
  };
  S.air = function (R, s) {
    if (!S.running(s)) return;
    var a = active, c = R.ctx, u = R.ppm, h = s.hero;
    if (a.kind !== 'entry' && P.SceneActing) P.SceneActing.draw(R,a);
  };
  S.groundBody = function(R,s) {
    if (S.running(s) && active.kind!=='entry' && active.actor && P.BossDefeatFx) P.BossDefeatFx.rest(R,s,active.actor);
  };
  return S;
})();
