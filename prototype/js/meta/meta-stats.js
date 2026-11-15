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
    if (field === 'critPct') return '+' + (diff * 100).toFixed(1);
    return '+' + Math.round(diff * 100) + '%';
  }
  function levelsWith(p, s, v) {
    var out = {}, i;
    for (i = 0; i < C.ids.length; i++) out[C.ids[i]] = p.attr[C.ids[i]];
    out[s] = v;
    return out;
  }
  // Preview of one more point on s: the change in that attribute's primary effect.
  function preview(p, s, v) {
    var field = C.primary[s], a = P.Stats.effects(levelsWith(p, s, v)), b = P.Stats.effects(levelsWith(p, s, v + 1));
    return t('fx.' + field, { v: fmtPct(field, (b[field] || 0) - (a[field] || 0)) });
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
    var minus = el('button', 'meta-attr-btn', row); minus.textContent = '−';
    minus.setAttribute('aria-label', t('attr.minus')); minus.disabled = !draft[s];
    minus.addEventListener('click', function () { draft[s]--; sfx('uiTap'); renderAlloc(ctx); });
    el('div', 'meta-attr-lvl', row).textContent = v + '/' + C.max;
    var plus = el('button', 'meta-attr-btn meta-attr-plus', row); plus.textContent = '+';
    plus.setAttribute('aria-label', t('attr.plus')); plus.disabled = !canPlus(p, s);
    plus.addEventListener('click', function () { draft[s] = (draft[s] || 0) + 1; sfx('uiTap'); renderAlloc(ctx); });
    el('div', 'meta-attr-fx', row).textContent = draft[s] ? preview(p, s, v) : (p.ready[s] ? t('attr.readyTag') : '');
  }
  function renderAlloc(ctx) {
    var p = stats();
    ctx.box.innerHTML = '';
    ctx.pool.textContent = t('attr.pool', { r: readyTotal(p), sc: p.sc, left: P.Stats.spendable(p) - draftTotal() });
    C.ids.forEach(function (s) { statRow(ctx, p, s); });
    if (P.Stats.spendable(p) === 0) el('div', 'meta-attr-none', ctx.box).textContent = t('attr.none');
    ctx.ok.disabled = draftTotal() === 0;
  }
  function makeAllocBox(parent) {
    var ctx = { box: el('div', 'meta-attr-list', parent), pool: el('div', 'meta-lvl-pool', parent), ok: null };
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
    session++;
    lvl.root.classList.add('meta-hidden');
    var cb = onDone; onDone = null;
    if (cb) cb();
  }
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
    panel = { root: el('section', 'meta-attr meta-hidden', host) };
    var head = el('div', 'meta-attr-head', panel.root), back = el('button', 'meta-iconbtn', head);
    back.textContent = '←'; back.setAttribute('aria-label', t('meta.back'));
    back.addEventListener('click', function () { if (opts && opts.onBack) opts.onBack(); });
    el('div', 'meta-title', head).textContent = t('attr.title');
    panel.sum = el('div', 'meta-attr-sum', panel.root);
    panel.bars = el('div', 'meta-attr-bars', panel.root);
    panel.ctx = makeAllocBox(panel.root);
    panel.ctx.ok = el('button', 'meta-btn meta-play', panel.root);
    panel.ctx.ok.textContent = t('attr.confirm');
    panel.ctx.ok.addEventListener('click', function () { if (confirmDraft()) renderPanel(); });
    el('div', 'meta-attr-note', panel.root).textContent = t('attr.panelNote');
  }
  function renderPanel() {
    var p = stats(), fx = P.Stats.effects(p.attr), keys = ['mightPct', 'movePct', 'cooldownPct', 'hackSpeedPct', 'civHelpPct', 'maxHpPct'];
    panel.sum.innerHTML = '';
    keys.forEach(function (k) { el('div', 'meta-attr-chip', panel.sum).textContent = t('fx.' + k, { v: fmtPct(k, fx[k]) }); });
    panel.bars.innerHTML = '';
    C.ids.forEach(function (s) {
      var row = el('div', 'meta-attr-bar', panel.bars);
      el('span', 'meta-attr-name', row).textContent = t('stat.' + s);
      el('span', 'meta-attr-lvl', row).textContent = P.Stats.effLevel(p, s) + '/' + C.max + ' · ' + t('attr.train', { a: Math.round(fracOf(p, s) * 100) });
    });
    renderAlloc(panel.ctx);
  }
  Attr.build = function (host, opts) { if (!panel) buildPanel(host, opts); };
  Attr.show = function () { if (panel) { P.UIMotion.panelShow(panel.root); draft = {}; renderPanel(); } };
  Attr.hide = function () { if (panel) P.UIMotion.panelHide(panel.root); draft = {}; };   // slides out (ui-motion.js)
  Attr.isOpen = function () { return !!panel && P.UIMotion.panelOpen(panel.root); };
  Attr.hero = function () { return hero; };
})(P.Meta);
