// Meta overlay: map shell (top bar, km bar, next-level card), level sheet, return animation, public API.
// open() plays any pending return first. A level tap closes the overlay and calls onPlay(levelIndex).
// Tapping during the return skips to the final state.
(function () {
  var M = P.Meta, J = P.Journey, Map = M.Map, Gear = M.Gear, A = M.Anim;
  var root, coinChip, coinVal, kmTxt, kmFill, nextHead, nextLine, playBtn, bottom, sheet, banner, flyLayer, toastLayer, gearHost;
  var tabsEl = null, panelOpen = null;
  var onPlay = null, opened = false, sheetHood = -1, selLevel = 1, session = 0, busy = false, active = null, announced = false;
  var selMode = 'normal';   // R1-T4 part 18: the level sheet's mode toggle ('normal' or 'nightmare'); reset when the sheet opens
  var cancels = [], shownCoins = 0;
  var COLOR = { walker: '#8A8F98', runner: '#FF6B3D', crawler: '#5BD16E', spitter: '#3DDCFF', brute: '#B5651D', bloater: '#E040FB', diner: '#FFD166' };
  var GLYPH = {
    walker: '<circle cx="10" cy="6" r="4"/><rect x="6" y="11" width="8" height="7" rx="2.5"/>',
    runner: '<path d="M10 3 L16 17 L4 17 Z"/>',
    crawler: '<ellipse cx="10" cy="12" rx="8" ry="4.5"/><circle cx="16" cy="9" r="2.6"/>',
    spitter: '<circle cx="10" cy="11" r="6"/><path d="M10 2 L13 6 L7 6 Z"/>',
    brute: '<rect x="3" y="3" width="14" height="14" rx="3"/>',
    bloater: '<circle cx="10" cy="10" r="8"/>',
    diner: '<circle cx="10" cy="7" r="4"/><path d="M4 18 Q4 12 10 12 Q16 12 16 18 Z"/>'
  };
  var COG = '<svg viewBox="0 0 24 24"><g fill="#F4EBDD" stroke="#14151F" stroke-width="1.6" stroke-linejoin="round">' +
    [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) {
      return '<rect x="10.2" y="1.5" width="3.6" height="5" rx="1" transform="rotate(' + a + ' 12 12)"/>';
    }).join('') + '<circle cx="12" cy="12" r="7"/></g><circle cx="12" cy="12" r="2.8" fill="#14151F"/></svg>';
  var CLOSE = '<svg viewBox="0 0 24 24"><path d="M6 6 L18 18 M18 6 L6 18" stroke="#F4EBDD" stroke-width="3.5" stroke-linecap="round"/></svg>';

  function el(tag, cls, parent) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (parent) parent.appendChild(n);
    return n;
  }
  function t(k, v) { return P.t(k, v); }
  function icon(id, size) { return P.Icons && P.Icons.svg ? P.Icons.svg(id, size) : ''; }
  function sfx(c, gap) { if (P.Sfx && P.Sfx.play) P.Sfx.play(c, gap); }
  function music(c) { if (P.Music && P.Music.play) P.Music.play(c); }
  function fmtNum(n) { return Math.round(n).toLocaleString(P.lang === 'tr' ? 'tr-TR' : 'en-US'); }
  function fmtKm(v) { var s = (Math.round(v * 10) / 10).toFixed(1); return P.lang === 'tr' ? s.replace('.', ',') : s; }
  function schedule(my, ms, fn) { setTimeout(function () { if (my === session) fn(); }, A.dur(ms)); }
  function glyph(type) {
    return '<svg viewBox="0 0 20 20" aria-hidden="true"><g fill="' + COLOR[type] + '" stroke="#14151F" stroke-width="1.6" stroke-linejoin="round">' +
      GLYPH[type] + '</g></svg>';
  }

  // ---- Build ----
  function ensureRoot() {
    if (root) return;
    root = el('div', 'meta-root meta-hidden', document.getElementById('phone') || document.body);
    Map.build(root, { onHood: openSheet });
    buildTop();
    buildTabs();
    buildBottom();
    sheet = el('section', 'meta-sheet', root);
    sheet.addEventListener('click', onSheetClick);
    banner = el('div', 'meta-banner', root);
    banner.addEventListener('click', skip);
    toastLayer = el('div', 'meta-toasts', root);
    flyLayer = el('div', 'meta-fly', root);
    gearHost = el('div', 'meta-gearhost', root);
    Gear.build(gearHost, { onBack: hideGear, onChange: function () { renderCoins(M.snapshot().coins); } });
    buildPanels();
  }
  // v0.5 tab strip under the top bar: Karakter, Silahlar, Görevler, Hatıralar.
  function buildTabs() {
    tabsEl = el('div', 'meta-tabs', root);
    [['attr', 'tab.attr', function () { showPanel('attr'); }], ['tree', 'tab.tree', function () { showPanel('tree'); }],
      ['ars', 'tab.ars', function () { showPanel('ars'); }],
      ['daily', 'tab.daily', function () { showPanel('hub', 'daily'); }], ['coll', 'tab.coll', function () { showPanel('hub', 'coll'); }]
    ].forEach(function (d) {
      var b = el('button', 'meta-tab', tabsEl);
      b.textContent = t(d[1]); b.setAttribute('data-tab', d[0]); b.addEventListener('click', d[2]);
    });
  }
  function buildPanels() {
    if (M.Attr) M.Attr.build(root, { onBack: hidePanel });
    if (M.TreeUI) M.TreeUI.build(root, { onBack: hidePanel });
    if (M.Arsenal) M.Arsenal.build(root, { onBack: hidePanel });
    if (M.Hub) M.Hub.build(root, { onBack: hidePanel });
  }
  // Panels replace the map while open. name: 'attr' | 'tree' | 'ars' | 'hub' (hub tab: 'daily' | 'coll').
  function showPanel(name, hubTab) {
    sfx('uiOpen'); Map.hide(); bottom.classList.add('is-hidden'); tabsEl.classList.add('is-hidden');
    panelOpen = name;
    if (name === 'attr') M.Attr.show();
    else if (name === 'tree') M.TreeUI.show();
    else if (name === 'ars') M.Arsenal.show();
    else M.Hub.show(hubTab);
  }
  function hidePanel() {
    if (!panelOpen) return;
    if (M.Attr) M.Attr.hide();
    if (M.TreeUI) M.TreeUI.hide();
    if (M.Arsenal) M.Arsenal.hide();
    if (M.Hub) M.Hub.hide();
    panelOpen = null; sfx('uiBack');
    tabsEl.classList.remove('is-hidden'); bottom.classList.remove('is-hidden');
    Map.show(); renderAll(M.snapshot());
  }
  function buildTop() {
    var top = el('div', 'meta-top', root), g, s;
    coinChip = el('div', 'meta-chip meta-coinchip', top);
    coinChip.innerHTML = icon('jeton', 22);
    coinVal = el('span', 'meta-coinval', coinChip);
    coinChip.setAttribute('aria-label', t('meta.coins'));
    el('div', 'meta-title', top).textContent = t('meta.title');
    g = el('button', 'meta-iconbtn', top);
    g.innerHTML = icon('gear', 26); g.setAttribute('aria-label', t('meta.gearBtn'));
    g.addEventListener('click', showGear);
    s = el('button', 'meta-iconbtn', top);
    s.innerHTML = COG; s.setAttribute('aria-label', t('meta.settingsBtn'));
    s.addEventListener('click', onSettings);
  }
  function buildBottom() {
    bottom = el('div', 'meta-bottom', root);
    var km = el('div', 'meta-kmcard', bottom);
    kmTxt = el('div', 'meta-kmtxt', km);
    kmFill = el('div', 'meta-kmfill', el('div', 'meta-kmbar', km));
    var nx = el('div', 'meta-next', bottom);
    nextHead = el('div', 'meta-nexthead', nx); nextHead.textContent = t('meta.next');
    nextLine = el('div', 'meta-nextline', nx);
    playBtn = el('button', 'meta-btn meta-play', nx);
    playBtn.addEventListener('click', function () { startLevel(M.currentLevel()); });
  }

  // ---- Render ----
  function renderCoins(n) { coinVal.textContent = fmtNum(n); }
  function setKm(v) {
    kmTxt.textContent = t('meta.km', { a: fmtKm(v), b: fmtKm(J.totalKm) });
    kmFill.style.width = (v / J.totalKm * 100).toFixed(2) + '%';
  }
  // Journey complete (every hood done): there is no next level, so the card says so and the play button is hidden.
  // The line and the button never disagree (AUDIT-6 F8).
  function renderBottom(v) {
    var lv = M.level(M.currentLevel()), done = v.done >= J.hoods.length;
    setKm(v.kmShown);
    nextHead.textContent = t(done ? 'meta.doneHead' : 'meta.next');
    nextLine.textContent = done ? t('meta.allDone') : P.UIProgress.unlockText(P.Progress.levelInfo(lv.index));
    playBtn.classList.toggle('hidden', done);
    if (!done) playBtn.textContent = t('meta.playLevel', { L: lv.index });
  }
  function renderAll(v) {
    renderCoins(v.coins); renderBottom(v); Map.refresh(v);
    if (sheetHood >= 0) renderSheet();
  }

  // ---- Level sheet ----
  function defaultLevel(h) {
    var unl = M.unlockedLevel(), k, i;
    for (k = 1; k <= J.levelsPerHood; k++) {
      i = M.levelAt(h, k);
      if (i <= unl && !M.isCleared(i)) return i;
    }
    return M.levelAt(h, 1);
  }
  function sheetHead(hd) {
    return '<div class="meta-sh-head"><div><p class="meta-cap">' + t('meta.district', { n: sheetHood + 1, d: hd.district }) +
      '</p><h2 class="meta-sh-title">' + P.upper(hd.name) + '</h2></div>' +
      '<button class="meta-iconbtn meta-sh-x" data-act="close" aria-label="' + t('meta.close') + '">' + CLOSE + '</button></div>';
  }
  function sheetEnemies(hd) {
    return '<p class="meta-cap">' + t('meta.enemies') + '</p><div class="meta-echips">' + hd.enemies.map(function (e) {
      return '<span class="meta-echip">' + glyph(e) + '<span>' + t('meta.enemy.' + e) + '</span></span>';
    }).join('') + '</div>';
  }
  function starRow(i, st) {
    if (st === 'is-locked') return '';
    var s = M.starsOf(i), out = '', k;
    for (k = 1; k <= M.CFG.starsMax; k++) out += '<i class="' + (k <= s ? 'on' : '') + '">' + icon('star', 12) + '</i>';
    return '<span class="meta-nstars">' + out + '</span>';
  }
  function sheetNodes(h) {
    var cur = M.currentLevel(), unl = M.unlockedLevel(), out = '', k, i, st, boss, cls, inner;
    for (k = 1; k <= J.levelsPerHood; k++) {
      i = M.levelAt(h, k);
      boss = k === J.levelsPerHood;
      st = i > unl ? 'is-locked' : (M.isCleared(i) ? 'is-done' : 'is-open');
      cls = 'meta-node ' + st + (boss ? ' is-boss' : '') + (i === selLevel ? ' is-sel' : '') + (i === cur ? ' is-cur' : '');
      inner = st === 'is-locked' ? icon('lock', 20) : (boss ? icon('skull', 26) : '<b>' + k + '</b>');
      out += '<button class="' + cls + '" data-lv="' + i + '" aria-label="' + t('meta.stage', { n: k }) + '">' +
        inner + starRow(i, st) + (boss ? '<em>' + t('meta.boss') + '</em>' : '') + '</button>';
    }
    return '<p class="meta-cap">' + t('meta.levels') + '</p><div class="meta-nodes">' + out + '</div>';
  }
  // Normal / Nightmare toggle (R1-T4 part 18): 48 px buttons. Nightmare is locked until the hood is cleared on Normal.
  function modeToggle(h) {
    if (!M.Modes.unlocked(h)) return '<p class="meta-mode-hint">' + t('mode.toggle.hint') + '</p>';
    var nm = selMode === 'nightmare';
    return '<div class="meta-modes" role="group" aria-label="' + t('mode.toggle.aria') + '">' +
      '<button class="meta-mode' + (nm ? '' : ' is-on') + '" data-mode="normal" aria-pressed="' + (nm ? 'false' : 'true') + '">' + t('mode.toggle.normal') + '</button>' +
      '<button class="meta-mode meta-mode-nm' + (nm ? ' is-on' : '') + '" data-mode="nightmare" aria-pressed="' + (nm ? 'true' : 'false') + '">' +
      t('mode.toggle.nm') + (M.Modes.moon(h) ? '<i class="meta-moon-mk" aria-hidden="true"></i>' : '') + '</button></div>';
  }
  function sheetDetail() {
    var i = selLevel, lv = M.level(i), first = !M.isCleared(i), locked = i > M.unlockedLevel(), k, nm = nightmareFor(i);
    var crit = '', reward = t(first ? 'meta.rewardFirst' : 'meta.reward1', { n: M.clearReward(i, first) });
    for (k = 1; k <= M.CFG.starsMax; k++) crit += '<li class="' + (M.starsOf(i) >= k ? 'on' : '') + '">' + t('meta.star' + k) + '</li>';
    if (nm) crit += '<li class="' + (M.Modes.stars(i) >= 4 ? 'on' : '') + '">' + t('res.star4', { n: Math.round(P.CFG.levels.nightmare.fourthHp * 100) }) + '</li>';
    return '<div class="meta-sh-detail"><div class="meta-sh-lvl">' + t('meta.stage', { n: lv.stage }) +
      (lv.boss ? ' · ' + t('meta.boss') : '') + '</div>' + modeToggle(sheetHood) + '<ul class="meta-crit">' + crit + '</ul>' +
      '<p class="meta-reward"><span>' + t('meta.reward') + '</span> ' + reward + '</p>' + P.UIProgress.powerHtml() + '</div>' +
      '<button class="meta-btn meta-play" data-act="play"' + (locked ? ' disabled' : '') + '>' +
      (locked ? t('meta.locked') : nm ? t('mode.nm.play', { L: lv.index }) : t('meta.playLevel', { L: lv.index })) + '</button>';
  }
  function renderSheet() {
    var hd = M.hood(sheetHood);
    sheet.innerHTML = '<div class="meta-grip"></div>' + sheetHead(hd) +
      '<p class="meta-flavour">' + t('meta.hood.' + hd.id) + '</p>' + sheetEnemies(hd) + sheetNodes(sheetHood) + sheetDetail();
  }
  function openSheet(h) {
    if (busy) { skip(); return; }
    sheetHood = h; selLevel = defaultLevel(h); selMode = 'normal'; sfx('uiOpen');
    renderSheet();
    sheet.classList.add('is-open');
    bottom.classList.add('is-hidden');
    Map.focusHood(h, 0.2, false);
  }
  function closeSheet() {
    if (sheetHood < 0) return;
    sheetHood = -1; sfx('uiBack');
    sheet.classList.remove('is-open');
    bottom.classList.remove('is-hidden');
  }
  function pickLevel(i) {
    if (i > M.unlockedLevel()) { sfx('uiBack'); A.kick(sheet, 'is-shake', P.UIMotion.ms('--m-beat')); toast(t('meta.lockedHint')); return; }
    selLevel = i; sfx('uiTap'); renderSheet();
  }
  function onSheetClick(e) {
    var b = e.target.closest ? e.target.closest('[data-lv],[data-act],[data-mode]') : null;
    if (!b) return;
    if (b.hasAttribute('data-lv')) pickLevel(Number(b.getAttribute('data-lv')));
    else if (b.hasAttribute('data-mode')) setMode(b.getAttribute('data-mode'));
    else if (b.getAttribute('data-act') === 'close') closeSheet();
    else if (b.getAttribute('data-act') === 'play') startLevel(selLevel);
  }
  function setMode(m) {
    if (m === 'nightmare' && !M.Modes.unlocked(sheetHood)) { sfx('uiBack'); toast(t('mode.toggle.hint')); return; }
    if (m === selMode) return;
    selMode = m; sfx('uiTap'); renderSheet();
  }
  // Nightmare applies to a level of the open sheet's hood only (the toggle is per hood).
  function nightmareFor(i) {
    return selMode === 'nightmare' && sheetHood >= 0 && M.level(i).hoodIndex === sheetHood && M.Modes.unlocked(sheetHood);
  }
  function startLevel(i) {
    if (busy) { skip(); return; }
    if (i > M.unlockedLevel()) { sfx('uiBack'); toast(t('meta.lockedHint')); return; }
    var nm = nightmareFor(i);
    sfx('uiTap');
    close();
    if (typeof onPlay === 'function') onPlay(i, nm ? { mode: 'nightmare' } : undefined);
  }

  // ---- Toasts and banner ----
  function toast(text) {
    if (!toastLayer) return;
    var d = el('div', 'meta-toast', toastLayer);
    d.textContent = text;
    setTimeout(function () {
      d.classList.add('is-out');
      setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, P.UIMotion.ms('--m-exit'));
    }, A.dur(2100));
  }
  function showBanner(p) {
    var r = p.reward, won = p.won, stars = won ? p.stars : 0, st = '', sub = '', k;
    for (k = 1; k <= M.CFG.starsMax; k++) {
      st += '<i class="' + (k <= stars ? 'on' : '') + '" style="animation-delay:' + (0.2 + k * 0.18) + 's">' + icon('star', 40) + '</i>';
    }
    if (won && r.first) sub = t('meta.ret.first');
    else if (!won) sub = t('meta.ret.lostNote');
    banner.innerHTML = '<div class="meta-ban-card ' + (won ? 'is-won' : 'is-lost') + '"><p class="meta-ban-title">' +
      t(won ? 'meta.ret.won' : 'meta.ret.lost') + '</p><div class="meta-ban-stars">' + st + '</div><p class="meta-ban-coins">' +
      t('meta.reward1', { n: r.total }) + '</p><p class="meta-ban-sub">' + sub + '</p></div>';
    banner.classList.add('is-in');
    if (tabsEl) tabsEl.classList.add('is-hidden');
    for (k = 1; k <= stars; k++) schedule(session, 200 + k * 180, function () { sfx('star'); });
  }
  function hideBanner() {
    if (banner) banner.classList.remove('is-in');
    if (tabsEl && !panelOpen && opened) tabsEl.classList.remove('is-hidden');
  }

  // ---- Return animation: banner, token walk, km tick, unlock burst, coins fly, toasts ----
  function tweenKm(a, b, ms) {
    return A.tween(ms, function (k) { setKm(a + (b - a) * (1 - Math.pow(1 - k, 2))); }, function () { setKm(b); });
  }
  function walkStep(p, my) {
    var b0 = p.before, b1 = p.after, moved = b1.cur !== b0.cur;
    sfx('mapWalk');
    if (moved) {
      cancels.push(Map.walk(b0.cur, b1.cur, 1400, function () { arrive(p, my); }));
      cancels.push(tweenKm(b0.kmShown, b1.kmShown, 1400));
    } else {
      Map.hop();
      cancels.push(tweenKm(b0.kmShown, b1.kmShown, 600));
      schedule(my, 620, function () { arrive(p, my); });
    }
  }
  function loseStep(p, my) {
    Map.shake(); sfx('uiBack');
    schedule(my, 500, function () { flyCoins(p, my); });
  }
  function arrive(p, my) {
    if (my !== session) return;
    if (p.after.cur !== p.before.cur) Map.reveal(p.after.cur);
    Map.refresh(p.after);
    Map.burst(p.after.cur);
    sfx('nodeUnlock');
    schedule(my, 260, function () { flyCoins(p, my); });
  }
  function spawnCoin(a, b, per, my) {
    if (my !== session) return;
    var c = el('div', 'meta-coin', flyLayer), ax = a.x + a.w / 2, ay = a.y + a.h / 2, dx = b.x + b.w / 2 - ax, dy = b.y + b.h / 2 - ay;
    var jx = (Math.random() - 0.5) * 60;
    c.style.left = (ax - 9) + 'px'; c.style.top = (ay - 9) + 'px';
    A.play(c, [{ transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: 'translate(' + (dx * 0.5 + jx) + 'px,' + (dy * 0.5 - 70) + 'px) scale(1.1)', opacity: 1, offset: 0.5 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.5)', opacity: 0.4 }], 620, function () {
      if (my !== session) return;
      shownCoins += per;
      renderCoins(Math.round(shownCoins));
      sfx('coin', 50);
      A.kick(coinChip, 'is-pop', P.UIMotion.ms('--m-pop'));
    }, 'cubic-bezier(.4,0,.6,1)');
  }
  function flyCoins(p, my) {
    var gain = p.reward.total, n = Math.max(3, Math.min(12, Math.round(gain / 15))), per = gain / n;
    var from = Map.tokenRect(), to = Map.rel(coinChip), k;
    for (k = 0; k < n; k++) schedule(my, k * 70, function () { spawnCoin(from, to, per, my); });
    schedule(my, n * 70 + 700, function () { finish(p); });
  }
  function announce(p) {
    if (announced) return;
    announced = true;
    var b0 = p.before, b1 = p.after, n = J.hoods.length;
    if (p.won) {
      if (b1.cur !== b0.cur) toast(t('meta.ret.hood', { hood: P.upper(M.hood(b1.cur).name) }));
      else if (b1.unlocked > b0.unlocked) toast(t('meta.ret.level'));
      if (b1.done >= n && b0.done < n) toast(t('meta.allDone'));
    }
    (p.newGear || []).forEach(function (id) { toast(t('meta.ret.gear', { item: t('meta.item.' + id) })); });
    bondToasts(p.bond && p.bond.kaan);
  }
  // Kaan's bond after a level: the join, the points earned and any threshold crossed (25: aura, 50: Tackle & Stab).
  function bondToasts(k) {
    if (!k || k.gain <= 0) return;
    toast(t(k.joined ? 'bond.joined' : 'bond.gain', { n: k.gain }));
    k.crossed.forEach(function (at) { if (at === 25 || at === 50) toast(t('bond.reached', { name: t('bond.t' + at + '.name') })); });
  }
  function cancelAll() {
    cancels.forEach(function (c) { c(); });
    cancels = [];
  }
  function finish(p) {
    cancelAll();
    busy = false; active = null;
    renderCoins(p.after.coins); renderBottom(p.after); setKm(p.after.kmShown);
    Map.refresh(p.after); Map.focusHood(p.after.cur, 0.42, false);
    hideBanner(); flyLayer.innerHTML = '';
    announce(p);
  }
  // Tap during the return: jump to the final state (timers are invalidated by the session bump).
  function skip() {
    if (!busy || !active) return;
    var p = active;
    session++;
    finish(p);
  }
  function playReturn(p) {
    var my = ++session, b0 = p.before;
    busy = true; active = p; announced = false; flyLayer.innerHTML = '';
    renderCoins(b0.coins); shownCoins = b0.coins; setKm(b0.kmShown);
    Map.refresh(b0); Map.focusHood(b0.cur, 0.42, true);
    showBanner(p);
    schedule(my, 1250, function () {
      hideBanner();
      if (p.won) walkStep(p, my); else loseStep(p, my);
    });
  }

  // ---- Shell actions ----
  function showGear() { sfx('uiOpen'); Map.hide(); Gear.show(); }
  function hideGear() {
    Gear.hide(); sfx('uiBack');
    if (opened) { Map.show(); renderCoins(M.snapshot().coins); }
  }
  function onSettings() {
    sfx('uiTap');
    if (typeof M.onSettings === 'function') M.onSettings();
  }
  function cancelReturn() {
    session++;
    cancelAll();
    busy = false; active = null;
    if (flyLayer) flyLayer.innerHTML = '';
    hideBanner();
  }

  // ---- Public API ----
  // Map open plays, in order: welcome-back (once per 12 h), attribute level-up, reward toasts, map walk.
  function resumeMap(p) {
    var v = M.snapshot();
    if (p && p.before && p.after) { playReturn(p); return; }
    renderAll(v);
    Map.focusHood(v.cur, 0.42, true);
  }
  function playToasts(p) {
    if (!p || !M.Hub) { resumeMap(p); return; }
    M.Hub.toasts(toastLayer, p, function () { resumeMap(p); });
  }
  function afterWelcome(p) {
    if (p && p.statGains && M.Attr) M.Attr.sequence(p, function () { playToasts(p); });
    else playToasts(p);
  }
  function open(cb) {
    if (typeof cb === 'function') onPlay = cb;
    ensureRoot();
    M.endRun();
    root.classList.remove('meta-hidden');
    opened = true; sheetHood = -1; panelOpen = null;
    sheet.classList.remove('is-open'); bottom.classList.remove('is-hidden'); tabsEl.classList.remove('is-hidden');
    toastLayer.innerHTML = '';
    music('map'); sfx('uiOpen');
    Map.show();
    var p = M.takePending(), w = M.Hub ? M.Hub.welcomeInfo() : null;
    if (w) { M.Hub.welcome(root, w, function () { afterWelcome(p); }); return; }
    afterWelcome(p);
  }
  function close() {
    if (!opened) return;
    cancelReturn();
    opened = false;
    root.classList.add('meta-hidden');
    toastLayer.innerHTML = '';
    sheetHood = -1; sheet.classList.remove('is-open'); bottom.classList.remove('is-hidden');
    Map.hide(); Gear.hide();
    if (M.Attr) M.Attr.hide();
    if (M.TreeUI) M.TreeUI.hide();
    if (M.Arsenal) M.Arsenal.hide();
    if (M.Hub) M.Hub.hide();
    panelOpen = null;
    Array.prototype.forEach.call(root.querySelectorAll('.meta-welcome'), function (n) { n.parentNode.removeChild(n); });
  }
  // Starts today's daily: the attempt is spent at launch, then the map calls onPlay(level, {daily, modifiers, seed}).
  // Night Shift entry (the hub's Görevler card): closes the map and plays today's shift (meta-nightshift.js launch).
  M.openNightShift = function () {
    var L = M.NightShift.launch(M.Daily.dayKey(new Date()));
    if (!L) { toast(t('ns.card.closed')); return false; }
    sfx('uiTap'); close();
    if (typeof onPlay === 'function') onPlay(L.level, L.opts);
    return true;
  };
  M.openDaily = function () {
    var L = M.dailyLaunch ? M.dailyLaunch() : null;
    if (!L) { toast(t('hub.dailyUsed')); return false; }
    sfx('uiTap'); close();
    if (typeof onPlay === 'function') onPlay(L.level, L.opts);
    return true;
  };
  M.open = open;
  M.close = close;
  M.isOpen = function () { return opened; };
})();
