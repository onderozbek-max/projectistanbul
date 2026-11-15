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
  var U = {}, el = {}, toastT = 0, toastOut = 0, lastHp = -1, lastSub = null, tierT = 0, tierKey = null, lastN = 0, lastLv = 0;
  var lastAdr = '', lastJl = '';   // the Adrenalin chip's label and the journey chip's first line: written only when they change
  var hudOn = false, overlayUp = false;
  var TIERS = [25, 50, 100, 200];
  var IDS = ['hud', 'hp-fill', 'hp-trail', 'hp-text', 'timer', 'call', 'call-label', 'call-time', 'bars', 'xp-fill', 'lv', 'lv-num',
    'subs', 'subs-speaker', 'subs-text', 'prompt', 'prompt-text', 'toast', 'skills', 'btn-ult', 'ult-fill', 'dash-chip',
    'dash-fill', 'dash-sec', 'lvl-chip', 'jl-num', 'jl-hood', 'streak', 'streak-label', 'streak-fill', 'boss-bar', 'boss-fill', 'boss-name'];
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
  };

  // HUD visibility = wanted by the flow (showHud) and no overlay up (setOverlay, called by Screens.show).
  U.showHud = function (on) {
    hudOn = !!on; applyVis();
    if (!on) {
      el.prompt.classList.add('hidden'); el.subs.classList.add('hidden'); el.streak.classList.add('hidden');
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

  U.update = function (s) {
    var h = s.hero, frac = h.hp / h.maxHp;
    el['hp-fill'].style.width = (frac * 100) + '%';
    if (h.hp >= lastHp) { el['hp-trail'].style.transition = 'none'; } else { el['hp-trail'].style.transition = ''; }
    el['hp-trail'].style.width = (frac * 100) + '%';
    lastHp = h.hp;
    el['hp-text'].textContent = Math.ceil(h.hp) + ' / ' + h.maxHp;
    var hold = s.dir.hold;
    el.timer.textContent = hold.active && !s.props.shutterOpen && !(s.geo && s.geo.endless)   // endless (Night Shift): no gate countdown
      ? U.fmt(Math.ceil((hold.T || P.CFG.level.holdTime) - hold.t)) + ' ' + P.t('ui.hud.hold') : U.fmt(s.runT);
    // Journey chip (A2): line 1 "BÖLÜM 7/100" (the journey level, index 1 to 100), line 2 the hood name of that level.
    var L = s.levelInfo, jl = L ? P.t('ui.hud.journey', { n: L.index, of: P.Journey.count() }) : '';
    el['lvl-chip'].classList.toggle('hidden', !L);
    if (jl !== lastJl) { lastJl = jl; el['jl-num'].textContent = jl; el['jl-hood'].textContent = L ? P.upper(L.hood.name) : ''; }
    updateSkills(s);
    if (P.UIProgress) P.UIProgress.hud(s);
    if (P.ModesUI) P.ModesUI.hud(s);   // R1-T4 part 18: HUD moon and Nightmare vignette (cached, view only)
    updateStreak(s);
    updateBoss(s);
    var call = s.dir.call;
    el.call.classList.toggle('hidden', !call.active);
    if (call.active) {
      el['call-label'].textContent = P.t('ui.hud.mom');
      el['call-time'].textContent = U.fmt(call.t);
      var bars = el.bars.children;
      for (var i = 0; i < bars.length; i++) bars[i].classList.toggle('on', i < call.bars);
    }
    el['xp-fill'].style.width = Math.min(100, s.xp / P.xpNeed(s.level) * 100) + '%';
    // Adrenalin chip (A1, the in-run level): the bolt is SVG in index.html; the label is the aria-label, the number is visible.
    var adr = P.t('ui.hud.adr', { n: s.level });
    if (adr !== lastAdr) { lastAdr = adr; el.lv.setAttribute('aria-label', adr); el['lv-num'].textContent = String(s.level); }
    if (lastLv && s.level > lastLv && P.UIProgress) P.UIProgress.levelUp();   // one pop on the XP bar per level-up
    lastLv = s.level;
    updateSubs(s);
  };

  function updateSkills(s) {
    if (!P.Skills || !P.Skills.hud) return;
    var k = P.Skills.hud(s), cd = Math.max(0, s.hero.dashCd || 0);
    el['ult-fill'].style.height = Math.round(Math.min(1, k.ult) * 100) + '%';
    el['btn-ult'].classList.toggle('ready', k.ultReady);
    el['dash-fill'].style.width = Math.round(k.dashFrac * 100) + '%';
    el['dash-chip'].classList.toggle('hidden', !!(P.Modifiers && P.Modifiers.dashBlocked && P.Modifiers.dashBlocked(s)));   // daily No dash: no chip (AUDIT-7 CR-1)
    el['dash-chip'].classList.toggle('cool', !k.dashReady);
    el['dash-chip'].classList.toggle('ready', !!k.dashReady);
    el['dash-sec'].textContent = k.dashReady ? '' : secs(Math.ceil(cd * 10) / 10);
  }
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
    el['boss-name'].textContent = bossName(b.nameKey);
    el['boss-bar'].classList.toggle('rage', !!(b.ai && b.ai.rageOn));
  }
  // The boss name comes from the narrative spk.b.<hood> set (strings-journey.js copies it to boss.<hood>).
  function bossName(key) {
    var alt = String(key || '').replace(/^boss\./, 'spk.b.');
    return P.t(alt) !== alt ? P.t(alt) : P.t(String(key || ''));
  }

  // Streak meter: kills in the current streak (a kill gap longer than the frenzy window ends it) toward the frenzy
  // threshold; while frenzy runs, the bar shows its remaining time in gold.
  function updateStreak(s) {
    var F = P.CFG.skills.frenzy, k = P.Skills && P.Skills.hud ? P.Skills.hud(s) : null, sk = s.sk || {};
    if (!k || !el.streak) return;
    var n = s.t - (sk.lastKillT === undefined ? -99 : sk.lastKillT) > F.window ? 0 : k.streak;
    if (k.frenzy) {
      el.streak.classList.remove('hidden'); el.streak.classList.add('frenzy');
      el['streak-label'].textContent = P.t('streak.frenzy');
      el['streak-fill'].style.width = Math.round(k.frenzyFrac * 100) + '%';
      return;
    }
    el.streak.classList.remove('frenzy');
    if (n < 1) { el.streak.classList.add('hidden'); lastN = 0; tierKey = null; tierT = 0; return; }
    el.streak.classList.remove('hidden');
    TIERS.forEach(function (t) { if (n >= t && lastN < t) { tierKey = 'combo.' + t; tierT = 1.3; } });
    lastN = n;
    el['streak-label'].textContent = tierT > 0 && tierKey ? P.t(tierKey) : P.t('combo.label') + ' ' + n + '/' + k.threshold;
    el['streak-fill'].style.width = Math.min(100, n / k.threshold * 100) + '%';
  }

  // L1 dialogue lines now present as comic pop-ins (P.Story.forLine picks bust, side, mood).
  function updateSubs(s) {
    var sub = s.dir.call.sub;
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
    var p = s.dir.tut.active, a, w, h;
    if (p && p.id !== 't_card' && s.mode === 'play' && el.prompt) {
      el['prompt-text'].textContent = P.t(p.key);
      el.prompt.classList.remove('hidden');
      w = el.prompt.offsetWidth; h = el.prompt.offsetHeight; a = R.toScreen(s.hero.x, s.hero.y);
      P.Speech.offer({ id: 'prompt', kind: 'tutorial', prio: P.Speech.PRIO.tutorial, w: w, h: h, ax: a.x, ay: a.y, lift: 58,
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
    clearTimeout(toastOut); toastOut = 0;   // a new toast cancels a slide-out still running
    el.toast.classList.remove('is-out');
    el.toast.innerHTML = '';
    el.toast.appendChild(document.createTextNode(text));
    if (sub) { var sm = document.createElement('small'); sm.textContent = sub; el.toast.appendChild(sm); }
    el.toast.classList.remove('hidden');
    toastT = dur || 2.5;
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
