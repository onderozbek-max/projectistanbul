// Progress on screen (T4 part 5; docs/retention.md sections 3 and 4, docs/design-system.md 5, 7 and 13): the "Your power"
// strip, the Street Cred meter in the HUD, the XP bar's milestone ticks and level-up pop, the level-up banner, the results
// recap and the next-unlock line. Numbers come from P.Progress (js/meta/meta-progress.js); words from P.STR keys
// (js/strings-progress-ui.js). View only: nothing here writes to the sim or the save.
P.UIProgress = (function () {
  var V = {}, TICKS = [25, 50, 75], nodes = {}, skLabel = '', pending = null, shown = false, bannerT = 0, popT = 0;

  function $(id) { return document.getElementById(id); }
  function tr() { return P.lang === 'tr'; }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  // A percent with one decimal when it is not whole (8, 1.6). Turkish uses a comma. Values are fractions (0.016 = 1.6%).
  function pct(v) {
    var n = Math.round(v * 1000) / 10, s = n % 1 ? n.toFixed(1) : String(n);
    return tr() ? s.replace('.', ',') : s;
  }
  function km(v) { var s = (Math.round(v * 10) / 10).toFixed(1); return tr() ? s.replace('.', ',') : s; }
  // A label and a value row (the .kv style). Returns the value node, so a count-up can write into it.
  function kv(parent, k, v, wide) {
    var d = el('div', 'kv' + (wide ? ' kv-wide' : '')), val = el('span', null, v);
    d.appendChild(el('span', null, k));
    d.appendChild(val);
    parent.appendChild(d);
    return val;
  }
  function ready() { return !!(P.Progress && P.Meta && P.Journey); }

  // ---- "Your power" strip: damage and HP the walk gives, from P.Progress.power() ----
  function powerText(p) {
    return [P.t('prog.powerLabel'), P.t('prog.dmg', { v: pct(p.dmg) }), P.t('prog.hp', { v: pct(p.hp) }),
      P.t('prog.perks', { n: p.perks })].join(' · ');
  }
  // The strip as HTML, for the level sheet (meta-ui.js renders the sheet as one string).
  V.powerHtml = function () {
    return ready() ? '<p class="pw-strip">' + esc(powerText(P.Progress.power())) + '</p>' : '';
  };

  // ---- Next unlock: "Level 13 · KARAKÖY · Rıhtım Caddesi" (the boss stage adds BOSS). Map card and hood card. ----
  V.unlockText = function (info) {
    var sub = info.sub ? (tr() ? info.sub.tr : info.sub.en) : '';
    return [P.t('prog.levelN', { n: info.index }), P.upper(info.hood.name), sub, info.boss ? P.t('meta.boss') : '']
      .filter(Boolean).join(' · ');
  };
  // Hood card (view/hood-card.js): the power strip and the next unlock, under the fact line. Null when progress is not loaded.
  V.hoodNode = function (li) {
    if (!ready()) return null;
    var box = el('div', 'hc-power'), nx = P.Progress.nextAfter(li.index, true);
    box.appendChild(el('p', 'pw-strip', powerText(P.Progress.power())));
    if (nx) box.appendChild(el('div', 'hc-next', P.t('hc.next', { unlock: V.unlockText(nx) })));
    return box;
  };

  // ---- HUD: Street Cred meter (balance with this run's kills, bar toward the next milestone) ----
  V.hud = function (s) {
    if (!nodes.skLabel || !ready()) return;
    // The chip shows the icon and the number only (DS 13 currency chip); the words are the aria label (hud.skLabel below).
    var sc = P.Progress.streetCred(s.kills | 0), label = String(sc.balance);
    if (label !== skLabel) { skLabel = label; nodes.skLabel.textContent = label; }
    nodes.sk.setAttribute('aria-label', P.t('hud.skLabel', { n: sc.balance, k: sc.next }));
    nodes.skFill.style.width = (sc.frac * 100).toFixed(1) + '%';
  };

  // ---- XP bar: quarter ticks (built once) and one pop on every level-up (--m-pop, no loop; Reduce motion: none) ----
  V.levelUp = function () {
    var bar = nodes.xp;
    if (!bar || P.UIMotion.reduced()) return;
    bar.classList.remove('is-pop'); void bar.offsetWidth; bar.classList.add('is-pop');
    clearTimeout(popT);
    popT = setTimeout(function () { bar.classList.remove('is-pop'); }, P.UIMotion.ms('--m-pop'));
  };

  // ---- Level-up banner: queued when a card is picked, shown in play once no overlay is up, for --m-banner. No taps. ----
  V.queueLevelUp = function (s, card) {
    var name = P.t('item.' + card.item);
    pending = { title: P.t('lvb.title', { n: s.level }),
      line: card.id[0] === 'f' ? P.t('lvb.lineF', { name: name }) : P.t('lvb.line', { name: name, n: card.next }) };
  };
  function hideBanner() {
    var b = nodes.banner;
    shown = false; bannerT = 0;
    if (b) P.UIMotion.leave(b, 'is-out', function () { b.classList.add('hidden'); b.classList.remove('is-out'); });
  }
  function showBanner(p) {
    pending = null; shown = true;
    nodes.title.textContent = p.title; nodes.line.textContent = p.line;
    nodes.banner.classList.remove('hidden', 'is-out');
    bannerT = P.UIMotion.ms('--m-banner') / 1000;
  }
  V.tick = function (dt) {
    if (!nodes.banner) return;
    if (shown) { bannerT -= dt; if (bannerT <= 0) hideBanner(); }
    if (pending && !shown && !(P.UI && P.UI.isOverlay && P.UI.isOverlay())) showBanner(pending);
  };
  // The run ended or a new one starts: nothing from the last run is left on screen.
  V.reset = function () {
    pending = null; shown = false; bannerT = 0; skLabel = '';
    if (nodes.banner) { nodes.banner.classList.add('hidden'); nodes.banner.classList.remove('is-out'); }
  };

  // ---- Results: power strip, run recap and the walk (time, km with the part of the next district) ----
  V.results = function (r) {
    var idx = (r.hoodN - 1) * P.Journey.levelsPerHood + r.stage, label = $('res-label');
    if (label) label.textContent = P.t('ui.res.labelLevel', { n: idx, hood: P.upper(r.hood) });   // "LEVEL 12 · İSTİKLAL"
    var strip = $('res-power'), rc = $('res-recap'), run = $('res-run');
    if (!ready() || !strip || !rc || !run) return;
    var meta = r.meta || null, pw = P.Progress.power(), earned = meta && meta.statGains ? meta.statGains.gains.sc : 0;
    strip.textContent = powerText(pw);
    rc.innerHTML = '';
    rc.appendChild(el('p', 'caption res-head', P.t('res.recap.head')));
    rc.appendChild(el('p', 'res-reached', P.t('res.recap.reached', { n: r.level, kills: r.kills, streak: r.streak | 0 })));
    var scNode = kv(rc, P.t('res.recap.sc'), '', true);
    P.UIMotion.countUp(scNode, earned, function (v) { return P.t('res.recap.scVal', { n: v, k: P.Progress.streetCred(0).next }); });
    var g = meta ? P.Progress.hoodGain(meta.before.done, meta.after.done) : null;
    kv(rc, P.t('res.recap.power'), g && g.rank > 0 ? [P.t('prog.gainDmg', { v: pct(g.dmg) }), P.t('prog.gainHp', { v: pct(g.hp) })].join(' · ')
      : P.t('res.recap.noPower'));
    var nx = P.Progress.nextAfter(idx, !!r.win), nextTxt = P.t('meta.allDone');
    if (nx) nextTxt = r.win ? V.unlockText(nx) : P.t('res.recap.retry', { unlock: V.unlockText(nx) });
    kv(rc, P.t('res.recap.next'), nextTxt, true);
    run.innerHTML = '';
    kv(run, P.t('ui.res.time'), P.UI.fmt(r.time));
    kv(run, P.t('ui.res.walk'), P.t('ui.res.progress', { km: km(+r.km || 0), total: P.Journey.totalKm }));
  };

  V.init = function () {
    nodes = { sk: $('sk-meter'), skLabel: $('sk-label'), skFill: $('sk-fill'), xp: document.querySelector('.xp-bar'),
      banner: $('lvl-banner'), title: $('lvl-title'), line: $('lvl-line') };
    if (nodes.xp) TICKS.forEach(function (t) { var i = el('i', 'xp-tick'); i.style.left = t + '%'; nodes.xp.appendChild(i); });
  };
  return V;
})();
