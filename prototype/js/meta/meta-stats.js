// Attribute level-up (v0.5, workstream C): the end-of-level comic page with training bars and "+1 GÜÇ!" pops,
// the points allocation step, and the Karakter panel (same rows, reachable from the map).
// Math lives in config-stats.js (P.Stats). This file only draws and calls P.Meta.allocate.
P.Meta = P.Meta || {};
(function (M) {
  var C = P.CFG.stats, Attr = M.Attr = {}, hero = 'arda', session = 0, onDone = null;
  var lvl = null, panel = null, bars = {}, draft = {};
  function el(tag, cls, parent) {
    var e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e;
  }
  function t(k, v) { return P.t(k, v); }
  function sfx(c) { if (P.Sfx && P.Sfx.play) P.Sfx.play(c); }
  function reduced() { return !!(P.Settings && P.Settings.reduceMotion); }
  function wait(ms) { return reduced() ? 0 : ms; }
  function schedule(my, ms, fn) { setTimeout(function () { if (my === session) fn(); }, wait(ms)); }
  function stats() { return M.heroStats(hero); }
  function fmtPct(field, diff) {
    var value = (Math.round(diff * 1000) / 10).toLocaleString(P.lang, { maximumFractionDigits: 1 });
    return '+' + value + (field === 'critPct' ? '' : '%');
  }
  function levelsWith(p, s, v) {
    var out = {}, i;
    for (i = 0; i < C.ids.length; i++) out[C.ids[i]] = p.attr[C.ids[i]];
    out[s] = v;
    return out;
  }
  function preview(p, s, v, field) {
    var actual = p.attr[s], a = P.Stats.effects(p.attr), b = P.Stats.effects(levelsWith(p, s, v));
    var value = fmtPct(field, a[field]);
    if (v !== actual) value += ' → ' + fmtPct(field, b[field]);
    return t('fx.' + field, { v: value });
  }
  function draftTotal() { var n = 0, k; for (k in draft) n += draft[k]; return n; }
  function readyTotal(p) { var n = 0, s; for (s in p.ready) n += p.ready[s]; return n; }
  function canPlus(p, s) {
    var next = Object.assign({}, draft);
    if (p.attr[s] + (draft[s] || 0) >= C.max) return false;
    next[s] = (draft[s] || 0) + 1;
    return next[s] <= (p.ready[s] | 0);
  }
  function statRow(ctx, p, s) {
    var row = el('div', 'meta-attr-row', ctx.box), v = p.attr[s] + (draft[s] || 0);
    row.dataset.stat = s;
    el('div', 'meta-attr-name', row).textContent = t('stat.' + s);
    if (ctx.onPage) { individualRank(ctx, row, p, s); return; }
    var minus = el('button', 'meta-attr-btn', row); minus.textContent = '−';
    minus.setAttribute('aria-label', t('attr.minus') + ' ' + t('stat.' + s)); minus.disabled = !draft[s];
    minus.addEventListener('click', function () { draft[s]--; sfx('uiTap'); renderAlloc(ctx); });
    el('div', 'meta-attr-lvl', row).textContent = v + '/' + C.max;
    var plus = el('button', 'meta-attr-btn meta-attr-plus', row); plus.textContent = '+';
    plus.setAttribute('aria-label', t('attr.plus') + ' ' + t('stat.' + s)); plus.disabled = !canPlus(p, s);
    plus.addEventListener('click', function () { draft[s] = (draft[s] || 0) + 1; sfx('uiTap'); renderAlloc(ctx); });
    el('div', 'meta-attr-fx', row).textContent = draft[s] ? preview(p, s, v, C.primary[s]) : (p.ready[s] ? t('attr.readyTag') : '');
  }
  function individualRank(ctx, row, p, s) {
    row.classList.add('growth-individual');
    var ready = p.ready[s] > 0 && p.attr[s] < C.max;
    el('div', 'meta-attr-lvl', row).textContent = p.attr[s] + '/' + C.max;
    if (ready) {
      var b = el('button', 'growth-path-link growth-apply', row);
      b.textContent = t('growth.applyOne', { attr: t('stat.' + s) });
      b.addEventListener('click', function () {
        if(b.disabled)return;b.disabled=true;var spend = {}; spend[s] = 1;
        var before=preview(p,s,p.attr[s],C.primary[s]);
        if (M.allocate(spend, hero)) {ctx.applied={id:s,before:before};sfx('nodeUnlock');renderAlloc(ctx);}else b.disabled=false;
      });
    }
    drawPath(ctx, row, p, s, p.attr[s] + (ready ? 1 : 0));
    if(ctx.applied&&ctx.applied.id===s)el('p','growth-applied',row).textContent=t('reset.growth.applied',
      {attr:t('stat.'+s),before:ctx.applied.before,after:preview(p,s,p.attr[s],C.primary[s])});
  }
  function drawEffects(ctx, info, p, s, v, field) {
    var detail = el('details', 'growth-stat-detail', info);
    detail.open = !!ctx.details[s];
    detail.addEventListener('toggle', function () { ctx.details[s] = detail.open; });
    el('summary', null, detail).textContent = t('growth.effects');
    Object.keys(C.perLevel[s]).filter(function (effect) { return effect !== field; }).forEach(function (effect) {
      el('div', null, detail).textContent = preview(p, s, v, effect);
    });
  }
  function drawPath(ctx, row, p, s, v) {
    var info = el('div', 'growth-path', row), actual = p.attr[s], field = C.primary[s];
    var pct = Math.round(Math.min(1, fracOf(p, s)) * 100);
    el('span', 'growth-stat-effect', info).textContent = preview(p, s, v, field);
    var left = p.ready[s] - (draft[s] || 0);
    if (left > 0) el('span', 'growth-stat-ready', info).textContent = t('growth.attributeReady', { attr: t('stat.' + s), n: left });
    var track = el('div', 'growth-track', info);
    track.setAttribute('role', 'progressbar'); track.setAttribute('aria-label', t('stat.' + s)); track.setAttribute('aria-valuenow', pct);
    el('i', null, track).style.width = pct + '%';
    el('span', 'growth-training', info).textContent = t('growth.practice.' + s);
    drawEffects(ctx, info, p, s, v, field);
    var id = M.TreeUI.nextIn(s);
    if (!id) { el('span', 'growth-stat-effect', info).textContent = t('growth.pathComplete'); return; }
    var n = P.Tree.node(id), b = el('button', 'growth-path-link', info);
    b.textContent = t(actual >= n.gate ? 'growth.pathReady' : 'growth.pathNext', { perk: t('tree.' + id + '.name'), n: n.gate }) +
      ' · ' + t('growth.perkCost', { n: n.cost });
    b.addEventListener('click', function () { ctx.onPage('tree', id); });
  }
  function renderAlloc(ctx) {
    var p = stats();
    ctx.box.innerHTML = '';
    ctx.pool.textContent = ctx.onPage ? t('growth.ready', { n: P.Stats.spendable(p) - draftTotal() }) :
      t('attr.pool', { r: readyTotal(p), sc: p.sc, left: P.Stats.spendable(p) - draftTotal() });
    C.ids.forEach(function (s) { statRow(ctx, p, s); });
    if (!ctx.onPage && P.Stats.spendable(p) === 0) el('div', 'meta-attr-none', ctx.box).textContent = t('attr.none');
    ctx.ok.disabled = draftTotal() === 0;
    if (ctx.onPage) ctx.ok.hidden = ctx.ok.disabled;
  }
  function makeAllocBox(parent) {
    var ctx = { box: el('div', 'meta-attr-list', parent), pool: el('div', 'meta-lvl-pool', parent), ok: null, details: {} };
    return ctx;
  }
  // Confirms the draft. Returns true when the allocation was applied.
  function confirmDraft() {
    var ok = draftTotal() > 0 && M.allocate(draft, hero);
    if (ok) { sfx('nodeUnlock'); draft = {}; }
    return ok;
  }

  // ---- Level-up comic page ----
  function barRow(s, parent) {
    var row = el('div', 'meta-lvl-bar', parent), head = el('div', 'meta-lvl-barhead', row);
    el('span', 'meta-lvl-name', head).textContent = t('stat.' + s);
    bars[s] = { lvl: el('span', 'meta-lvl-val', head), fill: el('div', 'meta-lvl-fill', el('div', 'meta-lvl-track', row)),
      pop: el('div', 'meta-lvl-pop', row) };
  }
  function setBar(s, frac, eff) {
    var b = bars[s];
    b.fill.style.width = (Math.max(0, Math.min(1, frac)) * 100).toFixed(1) + '%';
    b.lvl.textContent = eff + '/' + C.max;
  }
  function fracOf(prog, s) { return prog.train[s] / P.Stats.need(prog, s); }
  function popText(s) { return t('attr.pop', { s: P.upper(t('stat.' + s)) }); }
  function animateBar(s, g, my, next) {
    var pops = g.gains.ready[s] | 0, step = 0, eff0 = P.Stats.effLevel(g.before, s);
    setBar(s, fracOf(g.before, s), eff0);
    function run() {
      if (step < pops) {
        step++;
        schedule(my, 260, function () {
          setBar(s, 1, eff0 + step);
          var pop = bars[s].pop;
          pop.textContent = popText(s); pop.classList.remove('is-on'); void pop.offsetWidth; pop.classList.add('is-on');
          sfx('star');
          schedule(my, 320, function () { setBar(s, 0, eff0 + step); run(); });
        });
        return;
      }
      schedule(my, 240, function () { setBar(s, fracOf(g.after, s), P.Stats.effLevel(g.after, s)); next(); });
    }
    run();
  }
  function runBars(g, my, next) {
    var list = C.ids.filter(function (s) { return g.gains.xp[s] > 0 || g.gains.ready[s] > 0; }), i = 0;
    function one() { if (i >= list.length) return next(); animateBar(list[i++], g, my, one); }
    one();
  }
  function buildLevelUp() {
    lvl = { root: el('div', 'meta-lvl meta-hidden', document.getElementById('phone') || document.body) };
    var page = el('div', 'meta-lvl-page', lvl.root), head = el('div', 'meta-lvl-head', page);
    el('div', 'meta-lvl-kicker', head).textContent = t('attr.lvlup');
    el('div', 'meta-lvl-sub', head).textContent = t('attr.sub');
    var bust = el('div', 'meta-lvl-bust', page);
    if (P.Portraits && P.Portraits.canvas) bust.appendChild(P.Portraits.canvas(hero, 'happy', 120));
    var list = el('div', 'meta-lvl-bars', page);
    C.ids.forEach(function (s) { barRow(s, list); });
    lvl.step2 = el('section', 'meta-lvl-alloc', lvl.root);
    el('div', 'meta-lvl-allochead', lvl.step2).textContent = t('attr.allocHead');
    lvl.ctx = makeAllocBox(lvl.step2);
    var foot = el('div', 'meta-lvl-foot', lvl.step2);
    var later = el('button', 'meta-btn', foot); later.textContent = t('attr.later');
    later.addEventListener('click', function () { draft = {}; closeSeq(); });
    lvl.ctx.ok = el('button', 'meta-btn meta-play', foot); lvl.ctx.ok.textContent = t('attr.confirm');
    lvl.ctx.ok.addEventListener('click', function () { if (confirmDraft()) closeSeq(); });
  }
  function closeSeq() {
    var cb = onDone;
    Attr.cancelSequence();
    if (cb) cb();
  }
  Attr.cancelSequence = function () {
    session++;
    onDone = null;
    if (lvl) {lvl.root.remove();lvl=null;bars={};}
  };
  function showStep2(my) {
    if (my !== session) return;
    lvl.root.dataset.step = 'alloc';
    lvl.step2.classList.add('is-on');
    draft = {};
    renderAlloc(lvl.ctx);
  }
  function hasChange(g) {
    return C.ids.some(function (s) { return g.gains.xp[s] > 0 || g.gains.ready[s] > 0; }) || g.gains.sc > 0;
  }
  // Plays the level-up for a finished level, then calls done(). Skips when nothing changed.
  Attr.sequence = function (p, done) {
    var g = p && p.statGains, my = ++session;
    if (!lvl) buildLevelUp();
    onDone = done || null;
    if (!g || !g.gains || !hasChange(g)) { var cb = onDone; onDone = null; if (cb) cb(); return; }
    lvl.root.classList.remove('meta-hidden');
    lvl.step2.classList.remove('is-on');
    lvl.root.dataset.step = 'bars';
    C.ids.forEach(function (s) { setBar(s, fracOf(g.before, s), P.Stats.effLevel(g.before, s)); bars[s].pop.textContent = ''; });
    sfx('level');
    runBars(g, my, function () { schedule(my, 400, function () { showStep2(my); }); });
  };

  // ---- Karakter panel (map button) ----
  function buildPanel(host, opts) {
    panel = { root: el('section', 'meta-attr growth-page meta-hidden', host) };
    var top = el('div', 'growth-header', panel.root);
    var head = el('div', 'meta-attr-head', top), back = el('button', 'meta-iconbtn', head);
    back.textContent = '←'; back.setAttribute('aria-label', t('meta.back'));
    back.addEventListener('click', function () { if (opts && opts.onBack) opts.onBack(); });
    el('div', 'meta-title', head).textContent = t('growth.title');
    M.growthNavigation(top, 'attr', opts.onPage);
    el('div', 'meta-attr-note growth-explain', panel.root).textContent = t('growth.attrHint');
    var guide = el('details', 'meta-attr-note growth-explain', panel.root);
    el('summary', null, guide).textContent = t('growth.guide');
    el('p', null, guide).textContent = t('growth.reset');
    el('p', null, guide).textContent = t('growth.persist');
    panel.ctx = makeAllocBox(panel.root);
    panel.ctx.onPage = opts.onPage;
    panel.root.insertBefore(panel.ctx.pool, panel.ctx.box);
    panel.ctx.ok = el('button', 'meta-btn meta-play growth-save', panel.root);
    panel.ctx.ok.textContent = t('attr.confirm');
    panel.ctx.ok.addEventListener('click', function () { if (confirmDraft()) renderPanel(); });
  }
  function renderPanel() {
    renderAlloc(panel.ctx);
  }
  Attr.build = function (host, opts) { if (!panel) buildPanel(host, opts); };
  Attr.show = function (stat, keepDraft) {
    if (!panel) return;
    P.UIMotion.panelShow(panel.root);
    if (!keepDraft) draft = {};
    renderPanel();
    var row = stat && panel.ctx.box.querySelector('[data-stat="' + stat + '"]');
    if (!row) return;
    row.classList.add('growth-focus');
    P.UIMotion.revealWithin(panel.root,row,true);
    var focus = row.querySelector('.meta-attr-plus:not(:disabled),.growth-path-link');
    if (focus) focus.focus({ preventScroll: true });
  };
  Attr.hide = function (keepDraft) { if (panel) P.UIMotion.panelHide(panel.root); if (!keepDraft) draft = {}; };
  Attr.isOpen = function () { return !!panel && P.UIMotion.panelOpen(panel.root); };
  Attr.hero = function () { return hero; };
})(P.Meta);
