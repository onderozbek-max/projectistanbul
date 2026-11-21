// HUD, prompts, subtitles, toasts (design/lofi/04-run-hud.html; DS 5, 13; LD 9).
// v0.7: the tutorial hint and the toast are arbiter candidates (speech.js), so they never cover a bark, a pop or the
// HUD. The streak meter (#streak, in the HUD) shows the kill streak toward frenzy and the frenzy timer, with the combo
// tier labels (SÜPER, MÜTHİŞ, ...) for a moment at 25, 50, 100 and 200. It replaces the old canvas combo counter.
// AUDIT-6 (lane F): overlays (cards, chest, pause, settings, down) take the HUD, the dash and nazar buttons and the
// subtitle layer off screen while they are up (F1). Every bound element has a stand-in, so a missing id never stops a
// run (F2; tools/check-ids.js catches the gap at build time). The boss bar is a DOM bar in HUD row 2, where it replaces
// the objective (F7; AUDIT-7 U1 two-row header, class #hud.boss-on). The dash
// chip shows its cooldown in seconds and a ring when ready (F9).
P.UI = (function () {
  var U = {}, el = {}, toastT = 0, toastOut = 0, toastId = 0, lastHp = -1, lastSub = null, tierT = 0, tierKey = null, lastN = 0, lastLv = 0;
  var lastAdr = '', lastJl = '';   // the Adrenalin chip's label and the journey chip's first line: written only when they change
  var hudOn = false, overlayUp = false;
  var TIERS = [25, 50, 100, 200];
  var IDS = ['hud', 'hp-fill', 'hp-trail', 'hp-text', 'timer', 'call', 'call-label', 'call-time', 'bars', 'xp-fill', 'lv', 'lv-num',
    'subs', 'subs-speaker', 'subs-text', 'prompt', 'prompt-text', 'toast', 'skills', 'btn-ult', 'ult-fill', 'ult-visible-name', 'dash-chip',
    'dash-fill', 'dash-sec', 'lvl-chip', 'jl-num', 'jl-hood', 'streak', 'streak-label', 'streak-fill', 'boss-bar', 'boss-fill', 'boss-name', 'boss-time',
    'hud-route', 'route-badge', 'route-label', 'route-distance'];
  U.IDS = IDS;
  U.missing = [];

  U.fmt = function (t) {
    t = Math.max(0, Math.floor(t));
    return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
  };

  // A missing element gets a detached stand-in: the HUD goes quiet for that piece, the run does not stop.
  function bind(id) {
    var n = document.getElementById(id);
    if (n) return n;
    U.missing.push(id);
    return document.createElement('div');
  }
  U.bootError = function (where, msg) {
    if (P.Tel && P.Tel.log) P.Tel.log('boot_error', { where: where, message: String(msg).slice(0, 200) });
    if (window.console && console.warn) console.warn('[boot_error]', where, msg);
  };

  U.init = function () {
    IDS.forEach(function (id) { el[id] = bind(id); });
    if (U.missing.length) U.bootError('ui.init', 'missing ids: ' + U.missing.join(','));
    if (P.UIProgress) P.UIProgress.init();   // Street Cred meter, XP ticks, level-up banner (ui-progress.js)
    if (P.Speech) { P.Speech.provider(offerOverlays); }
  };

  U.applyI18n = function () {
    document.documentElement.lang = P.lang;
    if (P.Dialogue) P.Dialogue.langChanged();   // open pages, pops, calls and the bark bubble switch language now
    document.querySelectorAll('[data-i18n]').forEach(function (n) { n.textContent = P.t(n.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (n) { n.setAttribute('aria-label', P.t(n.getAttribute('data-i18n-aria'))); });
    document.querySelectorAll('[data-lang]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-lang') === P.lang); });
    U.titleStart();
  };

  var titleArt = null;
  U.titleStart = function () {
    var button = document.getElementById('btn-start'), M = P.Meta;
    if (!button || !M || !M.currentLevel) return;
    var level = M.currentLevel();
    var key = level <= 1 ? 'ui.title.tap' : M.isCleared(level) ? 'ui.title.journey' : 'ui.title.continue';
    var status = document.getElementById('title-art-status');
    button.textContent = P.t(titleArt === 'failed' ? 'ui.art.retry' : key, { n: level });
    button.disabled = titleArt === 'loading';
    if (status) {
      status.classList.toggle('hidden', !titleArt);
      status.textContent = titleArt ? P.t(titleArt === 'loading' ? 'ui.art.wait' : 'ui.art.fail') : '';
    }
  };

  U.awaitHero = function (start) {
    var art = P.ArtRaster;
    if (titleArt === 'loading') return false;
    if (!art || art.heroState() === 'ready') {
      if (titleArt) { titleArt = null; U.titleStart(); }
      return true;
    }
    if (titleArt === 'failed') art.retryHero();
    var deadline = performance.now() + 6000;
    titleArt = 'loading';
    U.titleStart();
    function check() {
      var state = art.heroState();
      if (state === 'loading' && performance.now() < deadline) { setTimeout(check, 40); return; }
      titleArt = state === 'ready' ? null : 'failed';
      U.titleStart();
      if (!titleArt) start();
    }
    setTimeout(check, 0);
    return false;
  };

  // HUD visibility = wanted by the flow (showHud) and no overlay up (setOverlay, called by Screens.show).
  U.showHud = function (on) {
    hudOn = !!on; applyVis();
    if (!on) {
      el.prompt.classList.add('hidden'); el.subs.classList.add('hidden'); el.streak.classList.add('hidden');
      clearTimeout(toastOut); toastOut = 0; toastT = 0; el.toast.classList.add('hidden'); el.toast.classList.remove('is-out');
      lastSub = null; lastN = 0; lastLv = 0;
      if (P.UIProgress) P.UIProgress.reset();
    }
  };
  // The overlay flag also goes on #phone (css: story pops and the call card hide, and comic.js freezes their timers).
  U.setOverlay = function (on) {
    overlayUp = !!on; applyVis();
    var ph = document.getElementById('phone'); if (ph) ph.classList.toggle('overlay-up', overlayUp);
  };
  U.isOverlay = function () { return overlayUp; };
  function applyVis() {
    var show = hudOn && !overlayUp;
    el.hud.classList.toggle('hidden', !show); el.skills.classList.toggle('hidden', !show);
    if (overlayUp) { el.subs.classList.add('hidden'); el.prompt.classList.add('hidden'); el.toast.classList.add('hidden'); }
  }

  // Updating unchanged text invalidates layout. Speech placement needs the HUD's measured bounds on the same frame.
  function setText(id, value) { if (el[id].textContent !== value) el[id].textContent = value; }

  function updateRoute(s) {
    var G = s.geo, L = P.CFG.level, y = s.hero.y, target, id, detail;
    var crossing = P.MilestoneFx && s.mode === 'play' && P.MilestoneFx.crossingStatus(s);
    var cover = P.KaanSupportFx && P.KaanSupportFx.instruction(s);
    var hide = !crossing && !cover && (!s.levelInfo || s.levelInfo.hood.id !== 'istiklal' && !s.routeTrial || P.Modes.of(s) !== 'normal');
    el['hud-route'].classList.toggle('hidden', hide);
    if (hide) return;
    if (s.mode === 'won') {
      el['hud-route'].classList.remove('required', 'pass-open', 'pressure');
      setText('route-badge', '');
      setText('route-label', P.t('ui.res.clear'));
      setText('route-distance', '');
      return;
    }
    var choice = P.StreetWeaponFx && P.StreetWeaponFx.instruction(s);
    var milestone = crossing || (cover && { scene: true, instruction: cover }) ||
      (choice && !P.Speech.warningNear(s) && { scene: true, instruction: choice }) || P.MilestoneFx && P.MilestoneFx.status(s);
    el['hud-route'].classList.toggle('required', !!milestone && !milestone.open && !milestone.scene);
    el['hud-route'].classList.toggle('pass-open', !!milestone && milestone.open);
    setText('route-badge', milestone && !milestone.scene ? milestone.open ? P.t('milestone.clear') : s.levelInfo.hood.name : '');
    if (milestone) {
      el['hud-route'].classList.toggle('pressure', milestone.key === 'tramLive');
      setText('route-label', P.t(milestone.instruction || 'milestone.' + milestone.key));
      setText('route-distance', milestone.detail || '');
      return [el['route-label'].textContent, milestone.detail].filter(Boolean).join(' · ');
    }
    var destination = P.RunGuide && P.RunGuide.destination(s);
    if (destination) id = destination.key.slice(6);
    else if (s.props.shutterOpen) { id = s.routeTrial === 'bridge-bridgeLift' ? 'fisherExit' : 'exit'; target = G ? G.exitY : L.scaffoldY; }
    else if (s.dir.trialBoss) id = s.dir.trialBoss.exposed ? 'opening' : 'boss';
    else if (s.dir.hold.active) id = 'hold';
    else if (s.gen && s.gen.arena) {
      var b = s.gen.boss;
      id = 'boss';
      if (b && s.routeTrial) {
        if (b.bossPreset === 'dockBride') id = P.KarakoyBossFx.instruction(s, b);
        else if (b.bossPreset === 'bigFisher') id = P.BridgeBossFx.instruction(s, b);
        else if (b.bossPreset === 'quayCaptain') id = P.EminonuBossFx.instruction(s, b);
        else if (b.bossPreset === 'ticketMan') id = P.SirkeciFx.instruction(s, b);
        else if (b.bossPreset === 'vatman' && b.exposed && b.ai.act === 'districtTram') id = 'tramPassed';
        else if (b.exposed) id = s.routeTrial === 'tram-stop' ? 'counter' : 'opening';
        else if (b.bossPreset === 'bellkeeper' && s.enemyTele.some(function (t) { return t.counterweight; })) id = 'bellWeights';
        else if (s.gen.hostileTram || b.ai && b.ai.m === 'windup' && b.ai.act === 'districtTram') id = 'clearRails';
      }
    }
    else if (s.routeTrial === 'tram-stop' && s.gen.frenzy) {
      var wave = s.gen.frenzy, C = P.CFG.levels.tramFinale;
      if (wave.phase === 'warning') { id = 'frenzySoon'; detail = P.t('route.seconds', { n: Math.ceil(C.warningT - wave.t) }); }
      else if (wave.phase === 'active') {
        id = wave.kills < C.chestKills ? 'frenzyClear' : 'frenzySurvive';
        detail = P.t('route.seconds', { n: Math.ceil(C.waveT - wave.t) });
        if (id === 'frenzyClear') detail += ' · ' + wave.kills + '/' + C.chestKills;
      } else { id = 'frenzyGate'; target = G.holdY; }
    }
    else if (s.routeTrial === 'tram-stop' && y < P.CFG.levels.tramStop.y - P.CFG.levels.tramStop.r &&
      !(s.gen.tramControl && s.gen.tramControl.state === 'done')) { id = 'tramStop'; target = P.CFG.levels.tramStop.y; }
    else if (G && P.Levels.tramRespite(s)) { id = 'tramRespite'; target = P.CFG.levels.istiklalRoute.tramY + P.CFG.levels.tramRhythm.encounterAfter; }
    else if (s.gen && s.gen.tramGuard && !s.gen.tramGuard.dead && G.zones.length && y < G.zones[0].y1 - 3) id = 'tramGuard';
    else if (s.levelIndex === 3 && y < P.CFG.levels.istiklalRoute.tramY + 7) { id = 'tram'; target = P.CFG.levels.istiklalRoute.tramY + 7; }
    else if (s.levelIndex === 3 && G.zones.length && y < G.zones[0].y1 - 3) { id = 'plaza'; target = G.zones[0].y1 - 3; }
    else if (s.routeTrial === 'tram-crossing') { id = 'followCart'; target = G.holdY; }
    else if (s.routeTrial === 'live-wires') { id = 'frenzyGate'; target = G.holdY; }
    else if (s.routeTrial === 'vatman') { id = 'depot'; target = G.holdY; }
    else if (s.routeTrial === 'tram-stop') { id = 'frenzyPrep'; target = G.holdY * P.CFG.levels.tramFinale.frenzyAt; }
    else if (G) { id = G.boss ? 'arena' : 'gate'; target = G.holdY; }
    else if (!s.props.doorOpen) id = 'clear';
    else if (y < 0) id = 'leave';
    else if (y < L.segments[1].y0) { id = 'passage'; target = L.segments[1].y0; }
    else if (y < L.segments[2].y0) { id = 'tracks'; target = L.segments[2].y0; }
    else { id = 'tunel'; target = L.holdTriggerY; }
    el['hud-route'].classList.toggle('pressure', id === 'frenzySoon' || id === 'frenzyClear' || id === 'frenzySurvive');
    setText('route-label', P.t('route.' + id));
    setText('route-distance', detail || (target > y ? P.t('obj.marker.m', { n: Math.ceil(target - y) }) : ''));
    return [el['route-label'].textContent, el['route-distance'].textContent].filter(Boolean).join(' · ');
  }
  U.routeContext = updateRoute;

  U.update = function (s) {
    var h = s.hero, frac = h.hp / h.maxHp;
    document.getElementById('phone').classList.toggle('tram-scene', !!P.Hack.tramScene(s));
    if (P.Comic && P.Comic.compactPops) P.Comic.compactPops(s.mode === 'play');
    if (P.HealthFeedback) P.HealthFeedback.hud(el['hp-fill'], el['hp-trail']);
    else {
    el['hp-fill'].style.width = (frac * 100) + '%';
    if (h.hp >= lastHp) { el['hp-trail'].style.transition = 'none'; } else { el['hp-trail'].style.transition = ''; }
    el['hp-trail'].style.width = (frac * 100) + '%';
    }
    lastHp = h.hp;
    var maxHp = Math.round(h.maxHp);
    setText('hp-text', Math.max(0, Math.min(maxHp, Math.ceil(h.hp))) + ' / ' + maxHp);
    updateRoute(s);
    var hold = s.dir.hold;
    setText('timer', hold.active && !s.dir.trialBoss && !s.props.shutterOpen && !(s.geo && s.geo.endless)   // endless (Night Shift): no gate countdown
      ? U.fmt(Math.ceil((hold.T || P.CFG.level.holdTime) - hold.t)) + ' ' + P.t('ui.hud.hold') : U.fmt(s.runT));
    // Journey chip (A2): line 1 "BÖLÜM 7/100" (the journey level, index 1 to 100), line 2 the hood name of that level.
    var L = s.levelInfo, jl = L ? P.t('ui.hud.journey', { n: L.index, of: P.Journey.count() }) : '';
    el['lvl-chip'].classList.toggle('hidden', !L);
    if (jl !== lastJl) { lastJl = jl; el['jl-num'].textContent = jl; el['jl-hood'].textContent = L ? P.upper(L.hood.name) : ''; }
    var skills = P.Skills && P.Skills.hud ? P.Skills.hud(s) : null;
    updateSkills(s, skills);
    if (P.UIProgress) P.UIProgress.hud(s);
    if (P.ModesUI) P.ModesUI.hud(s);   // R1-T4 part 18: HUD moon and Nightmare vignette (cached, view only)
    updateStreak(s, skills);
    updateBoss(s);
    var call = s.dir.call, speaking = call.active && (call.boosting || call.bars > 0 && !!call.sub);
    el.call.classList.toggle('hidden', !speaking);
    if (speaking) {
      setText('call-label', P.t('ui.hud.mom'));
      setText('call-time', call.boosting ? '…' : U.fmt(call.t));
      var bars = el.bars.children;
      for (var i = 0; i < bars.length; i++) bars[i].classList.toggle('on', !call.boosting && i < call.bars);
    }
    el['xp-fill'].style.width = Math.min(100, s.xp / P.xpNeed(s.level) * 100) + '%';
    // Adrenalin chip (A1, the in-run level): the bolt is SVG in index.html; the label is the aria-label, the number is visible.
    var adr = P.t('ui.hud.adr', { n: s.level });
    if (adr !== lastAdr) { lastAdr = adr; el.lv.setAttribute('aria-label', adr); el['lv-num'].textContent = String(s.level); }
    if (lastLv && s.level > lastLv && P.UIProgress) P.UIProgress.levelUp();   // one pop on the XP bar per level-up
    lastLv = s.level;
    updateSubs(s);
  };

  U.abilityVisible = function (s, id) {
    if (P.Settings.firstRunDone || s.routeTrial !== 'restaurant-escape') return true;
    var done = s.dir.tut.done;
    if (id === 'dash') return !!(done.t_move && done.t_xp);
    if (id === 'skill') return s.cardPicks > 0;
    return s.cardPicks > 0 && !!(s.dir.reached.A || s.hero.ult >= 1);
  };
  function updateSkills(s, k) {
    if (!k) return;
    var cd = Math.max(0, s.hero.dashCd || 0), disabled = String(!k.dashReady), button = el['dash-chip'];
    var ult = el['btn-ult'], ultLabel = P.t(k.ultReady ? 'ui.hud.ult.ready' : 'ui.hud.ult.charging', { name: U.ultName(k.ultId) });
    button.style.visibility = U.abilityVisible(s, 'dash') ? '' : 'hidden';
    ult.style.visibility = U.abilityVisible(s, 'ult') ? '' : 'hidden';
    el['ult-visible-name'].style.visibility = ult.style.visibility;
    el['ult-fill'].style.height = Math.round(Math.min(1, k.ult) * 100) + '%';
    ult.classList.toggle('ready', k.ultReady);
    setText('ult-visible-name', U.ultName(k.ultId));
    if (ult.getAttribute('aria-label') !== ultLabel) ult.setAttribute('aria-label', ultLabel);
    el['dash-fill'].style.width = Math.round(k.dashFrac * 100) + '%';
    el['dash-chip'].classList.toggle('hidden', !!(P.Modifiers && P.Modifiers.dashBlocked && P.Modifiers.dashBlocked(s)));   // daily No dash: no chip (AUDIT-7 CR-1)
    el['dash-chip'].classList.toggle('cool', !k.dashReady);
    el['dash-chip'].classList.toggle('ready', !!k.dashReady);
    if (button.getAttribute('aria-disabled') !== disabled) button.setAttribute('aria-disabled', disabled);
    setText('dash-sec', k.dashReady ? '' : secs(Math.ceil(cd * 10) / 10));
  }
  U.ultName = function (id) { return P.t(id === 'nazar' || !id ? 'ult.name' : 'ult.' + id); };
  // Seconds with the locale's decimal mark ("1,2s" in Turkish).
  function secs(v) {
    var t = v.toFixed(1);
    return (P.lang === 'tr' ? t.replace('.', ',') : t) + 's';
  }

  // Boss bar (AUDIT-6 F7): the live boss as a red-orange DOM bar under the XP row. XP stays green and separate.
  function updateBoss(s) {
    var b = null, i, list = s.enemies || [];
    for (i = 0; i < list.length && !b; i++) if (list[i].boss && !list[i].dead) b = list[i];
    el['boss-bar'].classList.toggle('hidden', !b);
    el.hud.classList.toggle('boss-on', !!b);   // AUDIT-7 U1: the boss bar takes the objective's place in row 2
    if (!b) return;
    var f = b.maxHp > 0 ? Math.max(0, Math.min(1, b.hp / b.maxHp)) : 0;
    el['boss-fill'].style.width = (f * 100).toFixed(1) + '%';
    setText('boss-name', bossName(b.nameKey));
    el['boss-bar'].classList.toggle('rage', !!(b.ai && b.ai.rageOn));
    var status = s.obj && s.obj.kind === 'boss' && P.Objectives.status(s), timer = el['boss-time'];
    timer.classList.toggle('hidden', !(status && status.vars.t));
    if (status && status.vars.t) {
      var label = P.t(status.state === 'failed' ? 'obj.boss.missed' : 'obj.boss.line', status.vars);
      setText('boss-time', label);
      if (timer.getAttribute('aria-label') !== label) timer.setAttribute('aria-label', label);
    }
  }
  // The boss name comes from the narrative spk.b.<hood> set (strings-journey.js copies it to boss.<hood>).
  function bossName(key) {
    var alt = String(key || '').replace(/^boss\./, 'spk.b.');
    return P.t(alt) !== alt ? P.t(alt) : P.t(String(key || ''));
  }

  // Streak meter: kills in the current streak (a kill gap longer than the frenzy window ends it) toward the frenzy
  // threshold; while frenzy runs, the bar shows its remaining time in gold.
  function updateStreak(s, k) {
    var F = P.CFG.skills.frenzy, sk = s.sk || {};
    if (!k || !el.streak) return;
    var n = s.t - (sk.lastKillT === undefined ? -99 : sk.lastKillT) > F.window ? 0 : k.streak;
    if (k.frenzy) {
      el.streak.classList.remove('hidden'); el.streak.classList.add('frenzy');
      setText('streak-label', P.t('streak.frenzy'));
      el['streak-fill'].style.width = Math.round(k.frenzyFrac * 100) + '%';
      return;
    }
    el.streak.classList.remove('frenzy');
    if (n < 1) { el.streak.classList.add('hidden'); lastN = 0; tierKey = null; tierT = 0; return; }
    el.streak.classList.remove('hidden');
    TIERS.forEach(function (t) { if (n >= t && lastN < t) { tierKey = 'combo.' + t; tierT = 1.3; } });
    lastN = n;
    setText('streak-label', tierT > 0 && tierKey ? P.t(tierKey) : P.t('combo.label') + ' ' + n + '/' + k.threshold);
    el['streak-fill'].style.width = Math.min(100, n / k.threshold * 100) + '%';
  }

  // Keep the illustrated L1 call on the same line and timer as the director.
  function updateSubs(s) {
    var sub = s.dir.call.boosting ? { id: 'booster-static', static: true } : s.dir.call.sub;
    if (s.levelIndex === 1 && P.Comic && P.Comic.callSubtitle) {
      el.subs.classList.add('hidden');
      P.Comic.callSubtitle(sub);
      lastSub = null;
      return;
    }
    if (P.Comic && P.Story) {
      el.subs.classList.add('hidden');
      if (sub && sub.id !== lastSub && P.Dialogue.has(sub.id)) P.Comic.pop(sub.id, P.Story.forLine(sub.id) || {});
      lastSub = sub ? sub.id : null;
      return;
    }
    if (!sub || !P.Settings.subs) { el.subs.classList.add('hidden'); return; }
    var l = P.Dialogue.get(sub.id);
    if (!l) { el.subs.classList.add('hidden'); return; }
    el['subs-speaker'].textContent = l.speaker + ':';
    el['subs-text'].textContent = l.text;
    el.subs.classList.remove('hidden');
  }

  // Arbiter provider: the tutorial hint (top priority, anchored above Arda) and the toast (banner priority).
  // Nothing from the HUD layer is offered while an overlay is up.
  function offerOverlays(R, s) {
    if (!s || !R || !R.toScreen) return;
    if (overlayUp) { el.prompt.classList.add('hidden'); el.toast.classList.add('hidden'); return; }
    var p = P.RunGuide ? P.RunGuide.prompt(s) : s.dir.tut.active, a, w, h;
    if (p && p.id !== 't_card' && s.mode === 'play' && el.prompt) {
      el['prompt-text'].textContent = P.t(p.key);
      el.prompt.classList.remove('hidden');
      w = el.prompt.offsetWidth; h = el.prompt.offsetHeight; a = p.target ? R.toScreen(p.target.x, p.target.y) : R.toScreen(s.hero.x, s.hero.y);
      P.Speech.offer({ id: 'prompt', kind: 'tutorial', actionable: true, prio: P.Speech.PRIO.tutorial, w: w, h: h, ax: a.x, ay: a.y, lift: 58,
        place: function (slot) {
          el.prompt.classList.toggle('hidden', !slot);   // no free slot this frame: hidden rather than overlapping
          if (!slot) return;
          el.prompt.style.left = slot.x + 'px'; el.prompt.style.top = slot.y + 'px';
          el.prompt.classList.toggle('below', slot.n === 'below' || slot.n === 'below2');
          el.prompt.classList.toggle('noarrow', slot.n === 'left' || slot.n === 'right' || slot.n.indexOf('scan') === 0);
        } });
    } else el.prompt.classList.add('hidden');
    if (toastT > 0) {
      el.toast.classList.remove('hidden');   // measured while shown; hidden again below when no slot is free
      w = el.toast.offsetWidth; h = el.toast.offsetHeight;
      P.Speech.offer({ id: 'toast', kind: 'toast', prio: P.Speech.PRIO.toast, w: w, h: h, x: (R.W - w) / 2, y: 160, age: toastT,
        place: function (slot) {
          el.toast.classList.toggle('hidden', !slot);
          if (!slot) return;
          el.toast.style.left = (slot.x + w / 2) + 'px'; el.toast.style.top = slot.y + 'px';
        } });
    }
  }

  U.toast = function (text, sub, dur) {
    var id = ++toastId;
    clearTimeout(toastOut); toastOut = 0;   // a new toast cancels a slide-out still running
    el.toast.classList.remove('is-out');
    el.toast.innerHTML = '';
    el.toast.appendChild(document.createTextNode(text));
    if (sub) { var sm = document.createElement('small'); sm.textContent = sub; el.toast.appendChild(sm); }
    el.toast.classList.remove('hidden');
    toastT = dur || 2.5;
    return function () {
      if (id !== toastId) return;
      clearTimeout(toastOut); toastOut = 0; toastT = 0;
      el.toast.classList.add('hidden'); el.toast.classList.remove('is-out');
    };
  };

  // Time's up: the toast slides out over --m-exit, then hides (ui-motion.js U.leave; at once under Reduce motion).
  function leaveToast() {
    toastOut = P.UIMotion.leave(el.toast, 'is-out', function () { toastOut = 0; el.toast.classList.add('hidden'); });
  }

  U.tick = function (dt) {
    if (toastT > 0) { toastT -= dt; if (toastT <= 0) leaveToast(); }
    if (tierT > 0) { tierT -= dt; if (tierT <= 0) tierT = 0; }
    if (P.UIProgress) P.UIProgress.tick(dt);   // the level-up banner's timer (ui-progress.js)
  };

  return U;
})();
