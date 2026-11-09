// Hub screens (v0.5, workstream C): Görevler (daily challenge, streak, achievements), Hatıralar (collection),
// the welcome-back summary and the reward toasts played on the next map open.
P.Meta = P.Meta || {};
(function (M) {
  var Hub = M.Hub = {}, root = null, tabs = null, body = null, tab = 'daily', onBack = null;
  function el(tag, cls, parent) {
    var e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e;
  }
  function t(k, v) { return P.t(k, v); }
  function sfx(c) { if (P.Sfx && P.Sfx.play) P.Sfx.play(c); }
  function fmtNum(n) { return Math.round(n).toLocaleString(P.lang === 'tr' ? 'tr-TR' : 'en-US'); }
  function today() { return M.Daily.dayKey(new Date()); }
  function nameOf(prefix, id) { var key = prefix + id, s = t(key); return s === key ? id : s; }
  function hoodName(id) { var h = P.Journey.hoods.filter(function (x) { return x.id === id; })[0]; return h ? h.name : id; }

  // Today's daily plan, created on first use each local day. Resets the attempt and keeps the streak.
  M.dailyStart = function () {
    var s = M.state(), day = today(), plan;
    if (s.daily.day !== day) {
      plan = M.Daily.plan(day, M.unlockedLevel());
      s.daily = { day: day, seed: plan.seed, level: plan.level, mods: plan.mods, played: false, won: false, claimed: false };
      M.save();
    }
    return s.daily;
  };
  // Today's launch: {level, opts} with opts = {daily, modifiers, seed}, or null when already played.
  // meta-ui.js turns this into M.openDaily(), which closes the map and calls onPlay(level, opts).
  M.dailyLaunch = function () {
    var s = M.state(), d = M.dailyStart(), opts;
    if (M.Daily.status(d, today()) !== 'ready') return null;
    d.played = true; M.save();   // one attempt per day: spent at launch, so quitting does not refund it
    opts = M.Daily.loadoutFields({ mods: d.mods, seed: d.seed });
    M.beginRun(opts);
    return { level: d.level, opts: opts, state: s };
  };
  // Opens the chest for a won daily. Returns {coins, bonus} or null when nothing to claim.
  M.dailyClaim = function () {
    var s = M.state(), d = s.daily, chest;
    if (M.Daily.status(d, today()) !== 'done') return null;
    chest = M.Daily.chestFor(s.streak.n, d.day);
    s.coins += chest.coins;
    if (chest.bonus) M.Collect.add(s, 'cos:streak7');
    d.claimed = true; M.save();
    return chest;
  };
  // Welcome-back: returns the summary once per return after 12 h, else null. Call from the map open.
  Hub.welcomeInfo = function () { return M.welcomeTake(Date.now()); };

  // ---- Görevler ----
  function dailyCard(parent) {
    var s = M.state(), d = M.dailyStart(), st = M.Daily.status(d, today()), c = el('section', 'meta-hub-card meta-daily', parent);
    el('div', 'meta-hub-head', c).textContent = t('hub.dailyHead');
    el('div', 'meta-daily-level', c).textContent = t('hub.dailyLevel', { n: d.level });
    var mods = el('div', 'meta-daily-mods', c);
    (d.mods || []).forEach(function (m) {
      var r = el('div', 'meta-daily-mod', mods);
      el('div', 'meta-daily-modname', r).textContent = nameOf('mod.', m.id + '.n');
      el('div', 'meta-daily-moddesc', r).textContent = t(m.descKey || 'mod.' + m.id + '.d');
    });
    var btn = el('button', 'meta-btn meta-play', c), key = { ready: 'hub.dailyPlay', done: 'hub.dailyChest',
      claimed: 'hub.dailyClaimed', used: 'hub.dailyUsed' }[st];
    btn.textContent = t(key); btn.disabled = st === 'claimed' || st === 'used';
    btn.addEventListener('click', function () {
      if (st === 'ready' && M.openDaily) { sfx('uiTap'); M.openDaily(); }
      if (st === 'done') { var ch = M.dailyClaim(); if (ch) { sfx('nodeUnlock'); renderBody(); } }
    });
    el('div', 'meta-daily-streak', c).textContent = t('hub.streak', { n: M.Daily.liveStreak(s.streak, today()) });
    streakPips(c, M.Daily.liveStreak(s.streak, today()));
    return c;
  }
  // Seven pips for the escalating cycle; the last one carries the bonus cosmetic.
  function streakPips(parent, n) {
    var row = el('div', 'meta-streak', parent), i, k = M.Daily.CFG.streakDays, cur = n % k;
    for (i = 1; i <= k; i++) {
      var on = i <= cur || (n > 0 && cur === 0), p = el('div', 'meta-streak-pip' + (on ? ' is-on' : '') + (i === k ? ' is-bonus' : ''), row);
      p.textContent = String(i);
    }
    el('div', 'meta-streak-note', parent).textContent = t('hub.streakNote', { n: k });
  }
  function achRow(a, parent) {
    var r = el('div', 'meta-ach' + (a.done ? ' is-done' : ''), parent);
    el('div', 'meta-ach-name', r).textContent = t(a.nameKey);
    el('div', 'meta-ach-desc', r).textContent = t(a.descKey, { n: fmtNum(a.t) });
    var fill = el('div', 'meta-ach-fill', el('div', 'meta-ach-track', r));
    fill.style.width = Math.min(100, Math.round(a.v / a.t * 100)) + '%';
    el('div', 'meta-ach-reward', r).textContent = a.done ? t('hub.achDone') : t('hub.achReward', { n: a.coins });
  }
  function achievementList(parent) {
    var s = M.state(), list = M.Collect.progress(s), done = list.filter(function (a) { return a.done; }).length;
    el('div', 'meta-hub-head', parent).textContent = t('hub.achHead', { a: done, b: list.length });
    list.forEach(function (a) { achRow(a, parent); });
  }
  function renderDaily() {
    dailyCard(body);
    achievementList(body);
  }

  // ---- Hatıralar ----
  function itemName(it) {
    if (it.kind === 'page') return t('col.page', { n: it.n });
    if (it.kind === 'postcard') return t('col.postcard', { h: hoodName(it.n) });
    if (it.kind === 'letter') return t('col.letter', { n: it.n });
    if (it.kind === 'cosmetic') return t('col.cos.' + it.n);
    return t('col.badge', { w: nameOf('item.', it.n) });
  }
  function renderCollection() {
    var s = M.state(), cat = M.Collect.catalogue(), got = cat.filter(function (it) { return !!s.collection[it.id]; }).length;
    el('div', 'meta-hub-head', body).textContent = t('hub.collHead', { a: got, b: cat.length });
    var grid = el('div', 'meta-coll-grid', body);
    cat.forEach(function (it) {
      var on = !!s.collection[it.id], c = el('div', 'meta-coll-item' + (on ? ' is-on' : ''), grid);
      el('div', 'meta-coll-kind', c).textContent = t('col.kind.' + it.kind);
      el('div', 'meta-coll-name', c).textContent = on ? itemName(it) : t('col.locked');
    });
  }

  // ---- Shell ----
  function renderBody() {
    body.innerHTML = '';
    if (tab === 'daily') renderDaily(); else renderCollection();
    tabs.forEach(function (b) { b.classList.toggle('is-on', b.dataset.tab === tab); });
  }
  Hub.build = function (host, opts) {
    if (root) return;
    onBack = opts && opts.onBack || null;
    root = el('section', 'meta-hub meta-hidden', host);
    var head = el('div', 'meta-attr-head', root), back = el('button', 'meta-iconbtn', head);
    back.textContent = '←'; back.setAttribute('aria-label', t('meta.back'));
    back.addEventListener('click', function () { if (onBack) onBack(); });
    el('div', 'meta-title', head).textContent = t('hub.title');
    tabs = ['daily', 'coll'].map(function (k) {
      var b = el('button', 'meta-hub-tab', root); b.dataset.tab = k; b.textContent = t('hub.tab.' + k);
      b.addEventListener('click', function () { tab = k; sfx('uiTap'); renderBody(); });
      return b;
    });
    body = el('div', 'meta-hub-body', root);
  };
  Hub.show = function (k) { if (root) { if (k) tab = k; root.classList.remove('meta-hidden'); renderBody(); } };
  Hub.hide = function () { if (root) root.classList.add('meta-hidden'); };
  Hub.isOpen = function () { return !!root && !root.classList.contains('meta-hidden'); };

  // ---- Welcome-back summary (one overlay, Devam closes) ----
  Hub.welcome = function (host, info, done) {
    var w = el('div', 'meta-welcome', host), card = el('div', 'meta-welcome-card', w);
    el('div', 'meta-welcome-title', card).textContent = t('wel.title');
    el('div', 'meta-welcome-body', card).textContent = t('wel.body', { d: info.days || 1, n: info.streak });
    var s = M.state();
    if (M.Daily.status(s.daily, today()) === 'ready') el('div', 'meta-welcome-daily', card).textContent = t('wel.daily');
    var b = el('button', 'meta-btn meta-play', card); b.textContent = t('wel.btn');
    b.addEventListener('click', function () { w.remove(); if (done) done(); });
  };

  // ---- Reward toasts, shown in order: mastery ranks, achievements, new collection items ----
  function toast(host, text, done) {
    var n = el('div', 'meta-toast', host); n.textContent = text;
    sfx('star');
    setTimeout(function () { n.remove(); done(); }, 1500);
  }
  function collectionName(id) {
    var it = M.Collect.catalogue().filter(function (x) { return x.id === id; })[0];
    return it ? itemName(it) : id;
  }
  // Toast lines from the pending result (mastery ranks, achievements, collection, daily), shown in order.
  Hub.toastLines = function (p) {
    var lines = [];
    (p.masteryUps || []).forEach(function (u) { lines.push(t('toast.mastery', { name: nameOf('item.', u.id), n: u.to })); });
    (p.achieved || []).forEach(function (a) { lines.push(t('toast.ach', { name: t('ach.' + a.id), n: a.coins })); });
    (p.collected || []).forEach(function (id) { lines.push(t('toast.col', { name: collectionName(id) })); });
    if (p.daily && p.daily.won) lines.push(t('toast.daily', { n: p.daily.streak }));
    return lines;
  };
  Hub.toasts = function (host, p, done) {
    var lines = Hub.toastLines(p);
    (function next(i) {
      if (i >= lines.length) return done();
      toast(host, lines[i], function () { next(i + 1); });
    })(0);
  };
})(P.Meta);
