// Meta gear screen (design/lofi/12-gear.html): four slots around Arda, stat summary, browse/equip/upgrade.
// All numbers and rules live in meta-data.js (P.Meta.upgrade, equip, itemStats, loadout).
P.Meta.Gear = (function () {
  var M = P.Meta, J = P.Journey, A = M.Anim;
  var root, head, coinEl, stage, bust, slotBtn = {}, sumEl, detEl, detName, detSlot, detPips, detStats, detHint, detAct, detToast;
  var onBack = null, onChange = null, sel = 'hoodie', shown = {}, toastTimer = 0;
  var POS = { hoodie: 'tl', gloves: 'tr', sneakers: 'bl', charm: 'br' };
  var STAT_KEYS = ['maxHpPct', 'mightPct', 'movePct', 'pickupPct', 'cooldownPct'];
  var BACK = '<svg viewBox="0 0 24 24"><path d="M15 5 L8 12 L15 19" fill="none" stroke="#14151F" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CHEV = '<svg viewBox="0 0 24 24"><path d="M9 5 L16 12 L9 19" fill="none" stroke="#14151F" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var NAZAR = '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17" fill="#1B4965" stroke="#14151F" stroke-width="2.5"/>' +
    '<circle cx="24" cy="24" r="9" fill="#F4EBDD" stroke="#14151F" stroke-width="2"/><circle cx="24" cy="24" r="4" fill="#14151F"/></svg>';
  var BUST = '<svg viewBox="0 0 160 190"><ellipse cx="80" cy="181" rx="62" ry="8" fill="#000" opacity=".35"/>' +
    '<path d="M22 186 C24 130 42 112 80 112 C118 112 136 130 138 186 Z" fill="#1B4965" stroke="#14151F" stroke-width="4" stroke-linejoin="round"/>' +
    '<path d="M56 116 Q80 132 104 116 L104 128 Q80 142 56 128 Z" fill="#14151F" opacity=".35"/>' +
    '<rect x="70" y="96" width="20" height="22" fill="#D9A07A" stroke="#14151F" stroke-width="3"/>' +
    '<ellipse cx="80" cy="66" rx="32" ry="36" fill="#E8B88A" stroke="#14151F" stroke-width="4"/>' +
    '<path d="M46 62 Q44 26 80 24 Q118 26 114 62 Q106 40 80 42 Q56 40 46 62 Z" fill="#14151F"/>' +
    '<circle cx="68" cy="68" r="3.4" fill="#14151F"/><circle cx="92" cy="68" r="3.4" fill="#14151F"/>' +
    '<path d="M70 84 Q80 92 90 84" stroke="#14151F" stroke-width="3" fill="none" stroke-linecap="round"/></svg>';

  function el(tag, cls, parent) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (parent) parent.appendChild(n);
    return n;
  }
  function t(k, v) { return P.t(k, v); }
  function icon(id, size) { return P.Icons && P.Icons.svg ? P.Icons.svg(id, size) : ''; }
  function sfx(c) { if (P.Sfx && P.Sfx.play) P.Sfx.play(c); }
  function pct(v) { return Math.round(v * 100) + '%'; }
  function slotOf(id) { for (var i = 0; i < M.SLOTS.length; i++) if (M.SLOTS[i].id === id) return M.SLOTS[i]; return M.SLOTS[0]; }
  function slotIcon(slot, size) { return slot.id === 'charm' ? NAZAR : icon(slot.icon, size); }
  // Item shown in the detail panel (browse, may be locked); defaults to the equipped one.
  function shownItem(slot) { return shown[slot.id] || M.equippedIn(slot.id); }
  function unlockHood(id) {
    var lv = J.level(M.ITEMS[id].unlockAt);
    return P.upper(lv.hood.name);
  }

  // ---- Build ----
  function build(container, opts) {
    if (root) return;
    onBack = opts.onBack; onChange = opts.onChange;
    root = el('section', 'meta-gear meta-hidden', container);
    buildHead();
    stage = el('div', 'meta-gstage', root);
    bust = el('div', 'meta-bust', stage);
    bust.innerHTML = BUST;
    M.SLOTS.forEach(function (slot) { slotBtn[slot.id] = buildSlot(slot); });
    sumEl = el('div', 'meta-gsum', root);
    buildDetail();
    render();
  }
  function buildHead() {
    head = el('div', 'meta-gh', root);
    var back = el('button', 'meta-iconbtn', head);
    back.innerHTML = BACK; back.setAttribute('aria-label', t('meta.back'));
    back.addEventListener('click', function () { if (onBack) onBack(); });
    el('h2', 'meta-gh-title', head).textContent = t('meta.gear.title');
    var chip = el('div', 'meta-chip meta-coinchip', head);
    chip.innerHTML = icon('jeton', 20);
    coinEl = el('span', 'meta-coinval', chip);
  }
  function buildSlot(slot) {
    var b = el('button', 'meta-slot meta-slot-' + POS[slot.id], stage);
    b.setAttribute('data-slot', slot.id);
    b.innerHTML = '<span class="meta-sl-ico"></span><span class="meta-sl-name"></span>' +
      '<span class="meta-sl-lv"></span><span class="meta-sl-val"></span>';
    b.querySelector('.meta-sl-ico').innerHTML = slotIcon(slot, 40);
    b.addEventListener('click', function () { selectSlot(slot.id); });
    return b;
  }
  function buildDetail() {
    detEl = el('div', 'meta-gdet', root);
    var top = el('div', 'meta-gd-top', detEl), prev = el('button', 'meta-arrow', top);
    var mid = el('div', 'meta-gd-name', top), next = el('button', 'meta-arrow', top);
    prev.innerHTML = BACK; next.innerHTML = CHEV;
    prev.setAttribute('aria-label', t('meta.gear.prev')); next.setAttribute('aria-label', t('meta.gear.next'));
    prev.addEventListener('click', function () { browse(-1); });
    next.addEventListener('click', function () { browse(1); });
    detSlot = el('span', 'meta-gd-slot', mid); detName = el('b', 'meta-gd-item', mid);
    detPips = el('div', 'meta-pips', detEl);
    for (var k = 0; k < M.CFG.gear.maxLevel; k++) el('i', '', detPips);
    detStats = el('div', 'meta-gd-stats', detEl);
    detHint = el('p', 'meta-gd-hint', detEl);
    detAct = el('button', 'meta-btn meta-gd-act', detEl);
    detAct.addEventListener('click', act);
    detToast = el('p', 'meta-gd-toast', detEl);
  }

  // ---- Render ----
  function render() {
    if (!root) return;
    coinEl.textContent = M.snapshot().coins.toLocaleString(P.lang === 'tr' ? 'tr-TR' : 'en-US');
    M.SLOTS.forEach(renderSlot);
    renderSummary();
    renderDetail();
  }
  function renderSlot(slot) {
    var b = slotBtn[slot.id], id = M.equippedIn(slot.id), lvl = M.itemLevel(id), st = M.itemStats(id, lvl), key = Object.keys(st)[0];
    b.classList.toggle('is-sel', slot.id === sel);
    b.classList.toggle('is-max', lvl >= M.CFG.gear.maxLevel);
    b.querySelector('.meta-sl-name').textContent = t('meta.item.' + id);
    b.querySelector('.meta-sl-lv').textContent = t('meta.gear.lvl', { n: lvl, max: M.CFG.gear.maxLevel });
    b.querySelector('.meta-sl-val').textContent = key ? t('meta.stat.' + key) + ' +' + pct(st[key]) : '';
  }
  function renderSummary() {
    var g = M.loadout().gear;
    sumEl.innerHTML = STAT_KEYS.filter(function (k) { return g[k] > 0; }).map(function (k) {
      return '<span class="meta-sum-chip">' + t('meta.stat.' + k) + ' <b>+' + pct(g[k]) + '</b></span>';
    }).join('');
  }
  function renderDetail() {
    var slot = slotOf(sel), id = shownItem(slot), it = M.ITEMS[id], lvl = M.itemLevel(id), max = M.CFG.gear.maxLevel;
    var owned = M.itemOwned(id), equipped = M.equippedIn(slot.id) === id, coins = M.snapshot().coins, cost = M.upgradeCost(id);
    detSlot.textContent = t('meta.slot.' + slot.id);
    detName.textContent = t('meta.item.' + id);
    Array.prototype.forEach.call(detPips.children, function (p, k) { p.className = k < (owned ? lvl : 0) ? 'on' : ''; });
    renderStatRows(id, lvl, owned);
    detHint.textContent = owned ? '' : t('meta.gear.unlockHint', { hood: unlockHood(id) });
    detAct.disabled = !owned || (equipped && lvl >= max);
    detAct.classList.toggle('is-need', owned && equipped && lvl < max && coins < cost);
    detAct.textContent = !owned ? t('meta.gear.locked') : !equipped ? t('meta.gear.equip') :
      lvl >= max ? t('meta.gear.max') : t('meta.gear.upgrade', { n: cost });
  }
  // Stat preview: current value -> next level (owned items only). Locked items show their level-1 values.
  function renderStatRows(id, lvl, owned) {
    var max = M.CFG.gear.maxLevel, keys = Object.keys(M.ITEMS[id].stats), cur = M.itemStats(id, Math.max(1, lvl));
    var nxt = M.itemStats(id, Math.min(max, lvl + 1));
    detStats.innerHTML = keys.map(function (k) {
      var to = !owned || lvl >= max ? '' : '<i>→</i><b class="is-next">' + pct(nxt[k]) + '</b>';
      return '<div class="meta-gd-row"><span>' + t('meta.stat.' + k) + '</span><b>' + pct(cur[k]) + '</b>' + to + '</div>';
    }).join('');
    detStats.classList.toggle('is-locked', !owned);
  }

  // ---- Actions ----
  function selectSlot(id) {
    sel = id; sfx('uiTap');
    render();
  }
  function browse(dir) {
    var slot = slotOf(sel), list = slot.items, cur = list.indexOf(shownItem(slot)), n = list.length;
    shown[slot.id] = list[(cur + dir + n) % n];
    sfx('uiTap'); render();
  }
  function act() {
    var slot = slotOf(sel), id = shownItem(slot), max = M.CFG.gear.maxLevel;
    if (!M.itemOwned(id)) return;
    if (M.equippedIn(slot.id) !== id) {
      M.equip(id); sfx('gearEquip'); feedback(slot.id, t('meta.gear.equipped'));
    } else if (M.itemLevel(id) < max) {
      if (M.upgrade(id)) { sfx('coin'); sfx('gearEquip'); feedback(slot.id, t('meta.gear.done')); }
      else { A.kick(detAct, 'is-shake', P.UIMotion.ms('--m-beat')); sfx('uiBack'); flash(t('meta.gear.need')); }
    } else return;
    render();
    if (onChange) onChange();
  }
  // Satisfying feedback: slot pops, bust bounces, toast line.
  function feedback(slotId, msg) {
    A.kick(slotBtn[slotId], 'is-pop', P.UIMotion.ms('--m-beat'));
    A.kick(bust, 'is-bounce', P.UIMotion.ms('--m-beat'));
    A.kick(coinEl.parentNode, 'is-pop', P.UIMotion.ms('--m-pop'));
    flash(msg);
  }
  function flash(msg) {
    detToast.textContent = msg;
    A.kick(detToast, 'is-in', 1600);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { detToast.textContent = ''; }, A.dur(1600));
  }

  function show() {
    if (!root) return;
    P.UIMotion.panelShow(root);
    shown = {};
    render();
    A.kick(bust, 'is-bounce', P.UIMotion.ms('--m-beat'));
  }
  function hide() { if (root) P.UIMotion.panelHide(root); }   // slides out (ui-motion.js)
  function isShown() { return !!root && P.UIMotion.panelOpen(root); }

  return { build: build, show: show, hide: hide, render: render, isShown: isShown };
})();
