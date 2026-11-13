// Arsenal screen (v0.5, workstream C): weapon mastery ranks and progress, locked silhouettes, and the ult selector.
// Mastery rank comes from A's P.Mastery.rank (guarded: rank 0 when missing). Ults come from P.CFG.ults.
P.Meta = P.Meta || {};
(function (M) {
  var Ars = M.Arsenal = {}, root = null, grid = null, ultBox = null, activeBox = null, title = null, onBack = null;
  function el(tag, cls, parent) {
    var e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e;
  }
  function t(k, v) { return P.t(k, v); }
  function sfx(c) { if (P.Sfx && P.Sfx.play) P.Sfx.play(c); }
  function fmtNum(n) { return Math.round(n).toLocaleString(P.lang === 'tr' ? 'tr-TR' : 'en-US'); }
  // Localized name; falls back to the id when no string exists yet.
  function nameOf(prefix, id) {
    var key = prefix + id, s = t(key);
    return s === key ? id : s;
  }
  function iconOf(id, size) { return P.Icons && P.Icons.svg ? P.Icons.svg(id, size) : ''; }
  // Weapon ids: A's list when present, else the E1 arsenal list in config-weapons.js.
  Ars.weapons = function () {
    if (P.Mastery && P.Mastery.list) return P.Mastery.list().slice();
    return (P.CFG.arsenal && P.CFG.arsenal.weapons ? P.CFG.arsenal.weapons : ['knife']).slice();
  };
  // Weapon is unlocked once the route reached its unlock level (config-weapons.js C.unlock).
  Ars.unlocked = function (id) {
    var lv = P.CFG.unlock && P.CFG.unlock.weapons ? P.CFG.unlock.weapons[id] : 1;
    return (M.unlockedLevel() || 1) >= (lv || 1) || !!(P.CFG.debugAllWeapons);
  };
  Ars.unlockText = function (id) {
    var lv = (P.CFG.unlock && P.CFG.unlock.weapons ? P.CFG.unlock.weapons[id] : 1) || 1;
    return t('ars.unlockAt', { n: lv });
  };
  // Signature move text from A's P.Mastery.describeRank (string key or {key, vars}). Empty when absent.
  function signatureOf(id, rank) {
    var d, s;
    if (!P.Mastery || !P.Mastery.describeRank || rank < 1) return '';
    d = P.Mastery.describeRank(id, rank);
    if (!d) return '';
    if (typeof d === 'object') return t(d.key, d.vars);
    s = t(d);
    return s === d ? d : s;
  }
  function card(id, parent) {
    var kills = M.masteryKills(id), rank = M.masteryRank(id, kills), ok = Ars.unlocked(id);
    var c = el('div', 'meta-ars-card' + (ok ? '' : ' is-locked'), parent);
    var ic = el('div', 'meta-ars-icon', c);
    ic.innerHTML = iconOf(id, 46);
    if (!ok) { el('div', 'meta-ars-lockmark', c).textContent = '?'; el('div', 'meta-ars-lockhint', c).textContent = Ars.unlockText(id); return c; }
    el('div', 'meta-ars-name', c).textContent = nameOf('item.', id);
    el('div', 'meta-ars-rank', c).textContent = rank > 0 ? t('ars.rank', { n: rank }) : t('ars.rank0');
    var nx = M.masteryNext(id, kills), fill = el('div', 'meta-ars-fill', el('div', 'meta-ars-track', c));
    fill.style.width = (nx ? Math.min(100, Math.round(nx.have / nx.next * 100)) : 100) + '%';
    el('div', 'meta-ars-kills', c).textContent = nx ? t('ars.kills', { a: fmtNum(kills), b: fmtNum(nx.next) }) : t('ars.max');
    var sig = signatureOf(id, rank);
    if (sig) el('div', 'meta-ars-sig', c).textContent = sig;
    if (rank >= M.CFG.masteryBadgeRank) el('div', 'meta-ars-badge', c).textContent = t('ars.badge');
    return c;
  }
  function renderGrid() {
    grid.innerHTML = '';
    Ars.weapons().forEach(function (id) { card(id, grid); });
  }
  function ultCard(u) {
    var b = el('button', 'meta-ars-ult' + (u.unlocked ? '' : ' is-locked') + (M.state().heroes.arda.ult === u.id ? ' is-on' : ''), ultBox);
    b.disabled = !u.unlocked;
    el('div', 'meta-ars-name', b).textContent = nameOf('ult.', u.id);
    el('div', 'meta-ars-kills', b).textContent = u.unlocked ? t('ars.ultOn') : u.needBond ? t('ars.ultNeedBond', { n: u.needBond }) : t('ars.ultNeed', { n: fmtNum(u.need) });
    b.addEventListener('click', function () { if (M.setUlt(u.id)) { sfx('uiTap'); renderAll(); } });
  }
  function renderUlts() {
    ultBox.innerHTML = '';
    M.ults().forEach(ultCard);
  }
  // Active skill row (one per loadout): a locked skill shows its journey level, the equipped one is marked.
  function activeCard(id) {
    var on = M.activeId() === id, ok = M.activeUnlocked(id), lv = ((P.CFG.skills || {}).unlockAt || {})[id] || 1;
    var b = el('button', 'meta-ars-ult' + (ok ? '' : ' is-locked') + (on ? ' is-on' : ''), activeBox);
    b.disabled = !ok;
    el('div', 'meta-ars-name', b).textContent = nameOf('skill.', id);
    el('div', 'meta-ars-kills', b).textContent = !ok ? t('ars.unlockAt', { n: lv }) : on ? t('ars.activeOn') : t('ars.ultOn');
    b.addEventListener('click', function () { if (M.setActive(id)) { sfx('uiTap'); renderAll(); } });
  }
  function renderActives() {
    activeBox.innerHTML = '';
    M.activeIds().forEach(activeCard);
  }
  function renderAll() { renderGrid(); renderUlts(); renderActives(); }
  function build(host, opts) {
    if (root) return;
    onBack = opts && opts.onBack || null;
    root = el('section', 'meta-arsenal meta-hidden', host);
    var head = el('div', 'meta-attr-head', root), back = el('button', 'meta-iconbtn', head);
    back.textContent = '←'; back.setAttribute('aria-label', t('meta.back'));
    back.addEventListener('click', function () { if (onBack) onBack(); });
    title = el('div', 'meta-title', head); title.textContent = t('ars.title');
    el('div', 'meta-ars-help', root).textContent = t('ars.help');
    grid = el('div', 'meta-ars-grid', root);
    el('div', 'meta-ars-ulthead', root).textContent = t('ars.ultHead');
    ultBox = el('div', 'meta-ars-ults', root);
    el('div', 'meta-ars-ulthead', root).textContent = t('ars.activeHead');
    activeBox = el('div', 'meta-ars-ults', root);
  }
  Ars.build = build;
  Ars.show = function () { if (root) { P.UIMotion.panelShow(root); renderAll(); } };
  Ars.hide = function () { if (root) P.UIMotion.panelHide(root); };   // slides out (ui-motion.js)
  Ars.isOpen = function () { return !!root && P.UIMotion.panelOpen(root); };
  Ars.signatureOf = signatureOf;
})(P.Meta);
