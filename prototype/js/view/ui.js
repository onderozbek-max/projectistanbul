// HUD, prompts, subtitles, toasts (design/lofi/04-run-hud.html; DS 5, 13; LD 9).
P.UI = (function () {
  var U = {}, el = {}, toastT = 0, lastHp = -1;

  U.fmt = function (t) {
    t = Math.max(0, Math.floor(t));
    return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
  };

  U.init = function () {
    ['hud', 'hp-fill', 'hp-trail', 'hp-text', 'timer', 'call', 'call-label', 'call-time', 'bars', 'xp-fill', 'lv',
     'subs', 'subs-speaker', 'subs-text', 'prompt', 'prompt-text', 'toast'].forEach(function (id) { el[id] = document.getElementById(id); });
  };

  U.applyI18n = function () {
    document.documentElement.lang = P.lang;
    document.querySelectorAll('[data-i18n]').forEach(function (n) { n.textContent = P.t(n.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (n) { n.setAttribute('aria-label', P.t(n.getAttribute('data-i18n-aria'))); });
    document.querySelectorAll('[data-lang]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-lang') === P.lang); });
  };

  U.showHud = function (on) { el.hud.classList.toggle('hidden', !on); if (!on) { el.prompt.classList.add('hidden'); el.subs.classList.add('hidden'); } };

  U.update = function (s) {
    var h = s.hero, frac = h.hp / h.maxHp;
    el['hp-fill'].style.width = (frac * 100) + '%';
    if (h.hp >= lastHp) { el['hp-trail'].style.transition = 'none'; } else { el['hp-trail'].style.transition = ''; }
    el['hp-trail'].style.width = (frac * 100) + '%';
    lastHp = h.hp;
    el['hp-text'].textContent = Math.ceil(h.hp) + ' / ' + h.maxHp;
    var hold = s.dir.hold;
    el.timer.textContent = hold.active && !s.props.shutterOpen
      ? U.fmt(Math.ceil(P.CFG.level.holdTime - hold.t)) + ' ' + P.t('ui.hud.hold') : U.fmt(s.runT);
    var call = s.dir.call;
    el.call.classList.toggle('hidden', !call.active);
    if (call.active) {
      el['call-label'].textContent = P.t('ui.hud.mom');
      el['call-time'].textContent = U.fmt(call.t);
      var bars = el.bars.children;
      for (var i = 0; i < bars.length; i++) bars[i].classList.toggle('on', i < call.bars);
    }
    el['xp-fill'].style.width = Math.min(100, s.xp / P.xpNeed(s.level) * 100) + '%';
    el.lv.textContent = 'Lv ' + s.level;
    updateSubs(s);
    updatePrompt(s);
  };

  function updateSubs(s) {
    var sub = s.dir.call.sub;
    if (!sub || !P.Settings.subs) { el.subs.classList.add('hidden'); return; }
    var l = P.line(sub.id);
    el['subs-speaker'].textContent = l.speaker + ':';
    el['subs-text'].textContent = l.text;
    el.subs.classList.remove('hidden');
  }

  function updatePrompt(s) {
    var p = s.dir.tut.active;
    if (!p || p.id === 't_card' || s.mode !== 'play') { el.prompt.classList.add('hidden'); return; }
    el['prompt-text'].textContent = P.t(p.key);
    var pt = P.Render.toScreen(s.hero.x, s.hero.y + 1.4);
    el.prompt.style.left = Math.min(330, Math.max(60, pt.x)) + 'px';
    el.prompt.style.top = Math.max(170, pt.y) + 'px';
    el.prompt.classList.remove('hidden');
  }

  U.toast = function (text, sub, dur) {
    el.toast.innerHTML = '';
    el.toast.appendChild(document.createTextNode(text));
    if (sub) { var sm = document.createElement('small'); sm.textContent = sub; el.toast.appendChild(sm); }
    el.toast.classList.remove('hidden');
    toastT = dur || 2.5;
  };

  U.tick = function (dt) {
    if (toastT > 0) { toastT -= dt; if (toastT <= 0) el.toast.classList.add('hidden'); }
  };

  return U;
})();
