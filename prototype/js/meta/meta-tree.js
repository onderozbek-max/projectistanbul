// Street Tree screen (R1-T5 step 3, D-059): perks hung off the six attributes, in two pages (Fight, Street) plus a locked Bond tab.
// Rank is the lock, Street Cred is the key. Rules live in config-tree.js (P.Tree); learn and respec persist through P.Meta.treeLearn / treeRespec.
// This file only draws. Shown from the tab strip in meta-ui.js. Wireframe: design/lofi/11-skills.html.
P.Meta = P.Meta || {};
(function (M) {
  var T = M.TreeUI = {}, PAGES = { fight: ['str', 'agg', 'grit'], street: ['pace', 'int', 'cha'] };
  var panel = null, page = 'fight', sel = null, confirming = false, lastLearned = null;
  var LOCK = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor"/>' +
    '<path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
  function el(tag, cls, parent) {
    var e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e;
  }
  function t(k, v) { return P.t(k, v); }
  function sfx(c) { if (P.Sfx && P.Sfx.play) P.Sfx.play(c); }
  function rankOf(st, attr) { return P.Stats.clampLevel(st.ranks[attr]); }   // spent ranks only: the gate ignores unspent READY points
  function progOf(st) { return { attr: st.ranks, sc: st.sc }; }
  function why(st, id) { return P.Tree.canLearn(progOf(st), { learned: st.learned }, id); }
  function stateOf(st, id) {
    if (st.learned[id]) return 'learned';
    var w = why(st, id).why;
    return w === '' ? 'available' : w === 'sc' ? 'short' : 'locked';
  }
  function needsText(st, n) {
    return t('tree.needs', { attr: t('stat.' + n.attr), n: n.gate, m: rankOf(st, n.attr), c: n.cost });
  }
  function firstPick(st) {
    var ids = PAGES[page], i, tier;
    for (tier = 1; tier <= P.CFG.tree.tiers.length; tier++) for (i = 0; i < ids.length; i++) {
      if (stateOf(st, ids[i] + '.' + tier) === 'available') return ids[i] + '.' + tier;
    }
    return ids[0] + '.1';
  }
  function nodeFace(btn, st, n, state) {
    el('span', 'meta-tree-name', btn).textContent = P.upper(t('tree.' + n.id + '.name'));
    var em = el('em', 'meta-tree-em', btn);
    if (state === 'learned') em.textContent = '✓';
    else if (state === 'locked') em.innerHTML = LOCK + '<span>' + n.gate + '</span>';
    else em.textContent = '◆' + n.cost;
  }
  function drawNode(st, id) {
    var n = P.Tree.node(id), state = stateOf(st, id), btn = el('button', 'meta-tree-node is-' + state, panel.grid);
    btn.dataset.perk = id;
    if (id === sel) btn.classList.add('is-sel');
    if (id === lastLearned) btn.classList.add('is-pop');
    btn.setAttribute('aria-pressed', id === sel ? 'true' : 'false');
    btn.setAttribute('aria-label', t('tree.' + id + '.name') + ', ' + (state === 'learned' ? t('tree.learned') : needsText(st, n)));
    nodeFace(btn, st, n, state);
    btn.addEventListener('click', function () { sel = id; confirming = false; sfx('uiTap'); render(); });
  }
  function drawGrid(st) {
    var ids = PAGES[page], tier, i;
    panel.grid.innerHTML = '';
    ids.forEach(function (a) { el('span', 'meta-tree-headcell', panel.grid).textContent = t('stat.' + a) + ' ' + rankOf(st, a); });
    for (tier = 1; tier <= P.CFG.tree.tiers.length; tier++) for (i = 0; i < ids.length; i++) drawNode(st, ids[i] + '.' + tier);
  }
  function drawDetail(st) {
    var d = panel.detail, n = P.Tree.node(sel), state = stateOf(st, sel);
    d.innerHTML = '';
    var top = el('div', 'meta-tree-dtop', d);
    el('span', 'meta-tree-dname', top).textContent = t('tree.' + sel + '.name');
    el('span', 'meta-tree-dcap', top).textContent = t('tree.tier', { attr: t('stat.' + n.attr), n: n.tier });
    el('p', 'meta-tree-ddesc', d).textContent = t('tree.' + sel + '.desc');
    if (state !== 'learned') el('p', 'meta-tree-dneeds', d).textContent = needsText(st, n);
    if (state === 'short') el('p', 'meta-tree-dneeds is-warn', d).textContent = t('tree.short', { sc: st.sc });
    var btn = el('button', 'meta-btn meta-tree-learn', d);
    btn.textContent = state === 'learned' ? t('tree.learned') : t('tree.learn', { c: n.cost });
    btn.disabled = state !== 'available';
    btn.addEventListener('click', function () { learn(sel); });
  }
  function drawFoot(st) {
    var f = panel.foot, b, noteText;
    f.innerHTML = '';
    b = el('button', 'meta-tree-respec', f);
    if (st.respecUsed) { b.textContent = t('tree.respecUsed'); b.disabled = true; }
    else if (st.spent === 0) { b.textContent = t('tree.respec'); b.disabled = true; }
    else if (confirming) { b.textContent = t('tree.respecConfirm', { n: st.spent }); b.classList.add('is-confirm'); }
    else b.textContent = t('tree.respec');
    b.addEventListener('click', respec);
    noteText = el('span', 'meta-tree-hint', f);
    noteText.textContent = t('tree.hint');
  }
  function learn(id) {
    if (!M.treeLearn(id)) return;
    lastLearned = id; confirming = false; sfx('nodeUnlock'); render();
  }
  function respec() {
    if (!confirming) { confirming = true; sfx('uiTap'); render(); return; }
    confirming = false; lastLearned = null;
    if (M.treeRespec() > 0) sfx('uiBack');
    render();
  }
  function drawPages(joined) {
    panel.pages.innerHTML = '';
    ['fight', 'street'].forEach(function (p) {
      var b = el('button', 'meta-tree-page' + (p === page ? ' is-on' : ''), panel.pages);
      b.textContent = t('tree.page.' + p); b.dataset.page = p;
      b.addEventListener('click', function () { page = p; sel = null; confirming = false; sfx('uiTap'); render(); });
    });
    var bond = el('button', 'meta-tree-page' + (joined ? (page === 'bond' ? ' is-on' : '') : ' is-locked'), panel.pages);
    bond.dataset.page = 'bond';
    bond.textContent = t(joined ? 'tree.page.bondOn' : 'tree.page.bond');
    if (!joined) { bond.disabled = true; bond.setAttribute('aria-label', t('tree.bond.locked')); return; }
    bond.addEventListener('click', function () { page = 'bond'; confirming = false; sfx('uiTap'); render(); });
  }
  function render() {
    var st = M.treeState(), kaan = M.bondState().kaan, onBond = page === 'bond' && kaan.joined;
    if (page === 'bond' && !kaan.joined) page = 'fight';
    panel.sc.textContent = t('tree.sc', { n: st.sc });
    drawPages(kaan.joined);
    [panel.grid, panel.detail, panel.foot].forEach(function (n) { n.classList.toggle('meta-hidden', onBond); });
    panel.bond.classList.toggle('meta-hidden', !onBond);
    if (onBond) { M.BondUI.draw(panel.bond, kaan); return; }
    if (!sel || PAGES[page].indexOf(sel.split('.')[0]) < 0) sel = firstPick(st);
    drawGrid(st); drawDetail(st); drawFoot(st);
    lastLearned = null;
  }
  function build(host, opts) {
    panel = { root: el('section', 'meta-tree meta-hidden', host) };
    var head = el('div', 'meta-attr-head', panel.root), back = el('button', 'meta-iconbtn', head);
    back.textContent = '←'; back.setAttribute('aria-label', t('meta.back'));
    back.addEventListener('click', function () { if (opts && opts.onBack) opts.onBack(); });
    el('div', 'meta-title', head).textContent = t('tree.title');
    panel.sc = el('span', 'meta-tree-sc', head);
    panel.pages = el('div', 'meta-tree-pages', panel.root);
    panel.grid = el('div', 'meta-tree-grid', panel.root);
    panel.bond = el('div', 'meta-bond meta-hidden', panel.root);
    panel.detail = el('div', 'meta-tree-detail', panel.root);
    panel.foot = el('div', 'meta-tree-foot', panel.root);
  }
  T.build = function (host, opts) { if (!panel) build(host, opts); };
  T.show = function () { if (panel) { confirming = false; sel = null; panel.root.classList.remove('meta-hidden'); render(); } };
  T.hide = function () { if (panel) panel.root.classList.add('meta-hidden'); confirming = false; };
  T.isOpen = function () { return !!panel && !panel.root.classList.contains('meta-hidden'); };
  T.showBond = function () { if (panel) { page = 'bond'; render(); } };
  T.select = function (id) { if (panel && P.Tree.node(id)) { page = PAGES.fight.indexOf(id.split('.')[0]) >= 0 ? 'fight' : 'street'; sel = id; render(); } };
})(P.Meta);
