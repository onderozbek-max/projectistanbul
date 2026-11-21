// Objective HUD, world markers, run-condition tints and the results row (lane P, view only).
// It reads the run through P.debug (main.js: sim, state) every frame, so it needs no hook in ui.js or main.js.
// It owns its DOM: a stylesheet, the objective row under the HUD, markers for crates, the civilian, the booster and
// terminals, night and rain tints for run modifiers, and a panel in #scr-results (objective, bonus, unlock previews;
// the star goals are drawn by screens.js from P.Objectives.goals).
P.ObjectivesHud = (function () {
  var H = {}, el = {}, marks = [], lastSim = null, startT = 0, resSim = null;
  var IN_RUN = { play: 1, storyRun: 1, exit: 1, cards: 1, chest: 1, paused: 1, down: 1 };
  var CSS = [
    '.obj-row{position:absolute;left:12px;right:12px;z-index:5;pointer-events:none;background:rgba(20,21,31,.74);color:#F4EBDD;',
    'border-radius:12px;padding:6px 10px;font:600 calc(12px * var(--ui-text, 1))/1.25 var(--body)}',
    '.obj-tag{display:inline-block;background:#E9A23B;color:#14151F;border-radius:4px;padding:0 5px;margin-right:6px;font-size:calc(10px * var(--ui-text, 1))}',
    '.obj-row.ok .obj-tag{background:#5BB37A}.obj-row.missed .obj-tag{background:#D4C9B8}',
    '.obj-line{opacity:.85;margin-left:4px}',
    '.obj-bar{height:4px;background:rgba(244,235,221,.2);border-radius:2px;margin-top:5px;overflow:hidden}',
    '.obj-fill{display:block;height:100%;width:0;background:#E9A23B;transition:width var(--m-enter) linear}',
    '.obj-row.warn .obj-fill{background:#C94A3A}',
    '.obj-mod{margin-left:6px;font-size:calc(10px * var(--ui-text, 1));opacity:.9;border:1px solid rgba(244,235,221,.5);border-radius:4px;padding:0 4px}',
    '.obj-start{animation:obj-in var(--m-beat) var(--m-ease-out)}@keyframes obj-in{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}',
    '.obj-pulse{animation:obj-pulse var(--m-loop) ease-in-out infinite}@keyframes obj-pulse{0%,100%{opacity:1}50%{opacity:.55}}',
    '.obj-layer{position:absolute;inset:0;pointer-events:none;z-index:3}',
    '.obj-mark{position:absolute;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:#14151F;',
    'color:#F4EBDD;border:2px solid #E9A23B;font:700 calc(11px * var(--ui-text, 1))/calc(18px * var(--ui-text, 1)) var(--body);text-align:center}',
    '.obj-mark.edge{border-radius:6px}.obj-mark.edge i{position:absolute;left:24px;top:0;white-space:nowrap;font-style:normal;font-size:calc(10px * var(--ui-text, 1))}',
    '.obj-dark{position:absolute;inset:0;pointer-events:none;z-index:2;background:radial-gradient(ellipse at 50% 42%,rgba(8,10,20,0) 30%,rgba(8,10,20,.55) 100%)}',
    '.obj-rain{position:absolute;inset:0;pointer-events:none;z-index:2;opacity:.25;',
    'background:repeating-linear-gradient(104deg,rgba(200,220,235,0) 0 12px,rgba(200,220,235,.7) 12px 13px,rgba(200,220,235,0) 13px 26px);',
    'animation:obj-rain var(--m-loop) linear infinite}@keyframes obj-rain{from{background-position:0 0}to{background-position:-26px 52px}}',
    '.obj-rain.still{animation:none}',
    '.obj-res{margin:8px 0;padding:10px 12px;background:rgba(20,21,31,.06);border-radius:10px;font:calc(14px * var(--ui-text, 1))/1.35 var(--body);color:#14151F}',
    '.obj-res h4{margin:0 0 4px;font-size:calc(14px * var(--ui-text, 1));letter-spacing:.06em;opacity:.7}',
    '.obj-res-summary{color:#E4DAC9;font:700 calc(13px * var(--ui-text, 1))/1.3 var(--body);margin:5px 0;overflow-wrap:anywhere}',
    '.obj-un{display:flex;gap:6px;align-items:baseline;margin-top:3px}.obj-un b{font-size:calc(14px * var(--ui-text, 1));opacity:.7;min-width:72px}',
    '.obj-un em{font-style:normal;opacity:.8;font-size:calc(14px * var(--ui-text, 1))}',
    '.hc-plan{margin-top:6px;font:600 calc(14px * var(--ui-text, 1))/1.3 var(--body);opacity:.95}',
  ].join('');

  function make(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }
  function tx(k, v) { return P.t(k, v); }
  function show(node, on) { node.style.display = on ? '' : 'none'; }
  function updateText(node, text) { if (node.textContent !== text) node.textContent = text; }
  function still() { return !!(P.Settings && P.Settings.reduceMotion); }

  // Lazy DOM build (phone must exist). Idempotent.
  function build() {
    var phone = document.getElementById('phone'), st;
    if (!phone || el.row) return !!el.row;
    st = make('style'); st.textContent = CSS; document.head.appendChild(st);
    el.row = make('div', 'obj-row'); show(el.row, false);
    el.tag = make('b', 'obj-tag'); el.title = make('span', 'obj-title'); el.line = make('span', 'obj-line');
    el.mod = make('span', 'obj-mod'); show(el.mod, false);
    el.fill = make('i', 'obj-fill');
    el.bar = make('div', 'obj-bar'); el.bar.appendChild(el.fill);
    el.row.appendChild(el.tag); el.row.appendChild(el.title); el.row.appendChild(el.mod); el.row.appendChild(el.line); el.row.appendChild(el.bar);
    el.dark = make('div', 'obj-dark'); show(el.dark, false);
    el.rain = make('div', 'obj-rain'); show(el.rain, false);
    el.layer = make('div', 'obj-layer');
    // AUDIT-7 U1: the row lives in HUD row 2 (#obj-slot, styled by proto.css); the tints and markers stay on the phone.
    phone.appendChild(el.dark); phone.appendChild(el.rain); phone.appendChild(el.layer);
    (document.getElementById('obj-slot') || phone).appendChild(el.row);
    return true;
  }

  function mark(i) {
    if (!marks[i]) { marks[i] = make('div', 'obj-mark'); el.layer.appendChild(marks[i]); }
    return marks[i];
  }

  function nextFishingLine(items, hero) {
    var next = null, best = Infinity;
    items.forEach(function (item) {
      if (item.done) return;
      var d = Math.hypot(item.x - hero.x, item.y - hero.y);
      if (d < best) { best = d; next = item; }
    });
    return next ? [next] : [];
  }

  // Markers: a priority fishing line on the bridge, or each unfinished item for other objectives.
  function drawMarkers(sim) {
    var R = P.Render;
    if (!R || !R.cam || !P.Fx || R.cam !== P.Fx.cam) {
      marks.forEach(function (node) { show(node, false); });
      return;
    }
    var items = P.Objectives.items(sim), n = 0, h = sim.hero, c;
    if (sim.obj && sim.obj.id === 'collect.cut') items = nextFishingLine(items, h);
    if (P.MilestoneFx) items = P.MilestoneFx.markers(sim, items);
    var hud = P.Speech && P.Speech.domRect && P.Speech.domRect('#hud');
    var W = 390, top = hud ? Math.max(130, hud.y + hud.h + 18) : 130, bot = 800, m = 24;
    items.forEach(function (it) {
      var p, x, y, off, d, node, ch, letter;
      if (it.done) return;
      p = R.toScreen(it.x, it.y);
      if (!p) return;
      x = p.x; y = p.y;
      off = x < m || x > W - m || y < top || y > bot;
      x = Math.max(m, Math.min(W - m, x)); y = Math.max(top, Math.min(bot, y));
      node = mark(n++);
      show(node, true);
      node.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      ch = it.label || it.kind;   // the label names the variant: Hat (cut), Panjur (gate), Araba (cart)
      letter = it.required ? '◆' : tx('obj.marker.' + ch).charAt(0);
      var cls = 'obj-mark' + (off ? ' edge' : '') + (it.required ? ' required' : ''), distance = '';
      if (off) {
        d = Math.round(Math.hypot(it.x - h.x, it.y - h.y));
        distance = tx('obj.marker.m', { n: d });
      }
      if (node.className !== cls || node.textContent !== letter + distance) {
        node.className = cls; node.textContent = letter;
        if (distance) node.appendChild(make('i', null, distance));
      }
    });
    for (c = n; c < marks.length; c++) show(marks[c], false);
  }

  function updateRow(sim, st) {
    var cls = 'obj-row';   // placed by the HUD layout (row 2); no per-frame top (AUDIT-7 U1)
    if (st.state === 'done') cls += ' ok';
    if (st.state === 'failed') cls += ' missed';
    if (st.hp !== null && st.hp < 0.35) cls += ' warn';
    if (lastSim !== sim) { lastSim = sim; startT = performance.now(); }
    if (performance.now() - startT < 2600) cls += ' obj-start';
    el.row.className = cls;
    updateText(el.tag, st.state === 'done' ? tx('obj.state.done') : st.state === 'failed' ? tx('obj.state.failed') : tx('obj.tag'));
    updateText(el.title, tx(st.title));
    updateText(el.line, st.state === 'failed' || st.state === 'done' ? '' : tx(st.line, st.vars));
    show(el.bar, st.state !== 'failed' && st.state !== 'done');
    el.fill.style.width = (Math.max(0, Math.min(1, st.frac || 0)) * 100).toFixed(1) + '%';
    show(el.row, true);
  }

  function tints(sim, state) {
    var mod = sim.mod, on = IN_RUN[state] && mod;
    show(el.dark, !!(on && mod.dark));
    show(el.rain, !!(on && mod.id === 'rain'));
    el.rain.className = 'obj-rain' + (still() ? ' still' : '');
    if (on) { updateText(el.mod, tx('hmod.' + mod.id + '.name')); show(el.mod, true); } else show(el.mod, false);
  }

  function resultBonus(host, st, won) {
    var criteria = document.getElementById('res-criteria'), old = host.querySelector('.obj-res-summary');
    if (old) old.remove();
    if (!st || !criteria) return;
    var key = !st.done ? 'obj.res.bonusNo' : won ? 'obj.res.bonusYes' : 'obj.res.bonusNeedsClear';
    var text = tx('obj.res.title') + ' · ' + tx(key, { n: st.bonus });
    criteria.after(make('p', 'obj-res-summary', text));
  }

  // Keep the optional reward by the clear result and the next unlocks below the run summary.
  function resultsPanel(sim) {
    var host = document.getElementById('scr-results'), rn, box, list;
    if (!host || resSim === sim) return;   // one panel per finished run (a retry is a new sim object)
    resSim = sim;
    var won = sim.mode === 'won';
    resultBonus(host, P.Objectives.results(sim), won);
    Array.prototype.slice.call(host.querySelectorAll('.obj-res')).forEach(function (n) { n.remove(); });
    if (!won || !P.Progress) return;
    list = P.Progress.unlockPreview(sim.levelIndex);
    if (!list.length) return;
    box = make('div', 'obj-res');
    box.appendChild(make('h4', null, tx('unlock.title') + ' · ' + tx('unlock.next')));
    list.slice(0, 4).forEach(function (u) { box.appendChild(unlockRow(u)); });
    rn = document.getElementById('res-run');
    if (rn && rn.parentNode) rn.parentNode.insertBefore(box, rn.nextSibling); else host.appendChild(box);
  }

  // String lookup with a fallback: a key without text in the current or the EN table shows the raw id.
  function known(key) {
    return !!(P.STR && ((P.STR[P.lang] && P.STR[P.lang][key]) || (P.STR.en && P.STR.en[key])));
  }

  function unlockRow(u) {
    var r = make('div', 'obj-un'), label = u.raw || (u.name && known(u.name) ? tx(u.name) : u.id);
    var desc = u.desc && known(u.desc) ? tx(u.desc) : '';
    r.appendChild(make('b', null, tx('unlock.kind.' + u.kind)));
    r.appendChild(make('span', null, label));
    if (desc) r.appendChild(make('em', null, desc));
    return r;
  }

  function pulsePrompt(sim) {
    var p = document.getElementById('prompt'), on = !!(sim.dir && sim.dir.idlePulse && !sim.dir.tut.done.t_move);
    if (p) p.classList.toggle('obj-pulse', on);
  }

  // One frame: read P.debug, then draw the row, markers, tints and the results panel.
  H.update = function () {
    var dbg = window.P && P.debug, sim = dbg && dbg.sim, state = dbg && dbg.state, st;
    if (!build() || !sim || !sim.levelInfo) return;
    if (state === 'results') { show(el.row, false); show(el.dark, false); show(el.rain, false); show(el.layer, false); resultsPanel(sim); return; }
    if (!IN_RUN[state]) { show(el.row, false); show(el.dark, false); show(el.rain, false); show(el.mod, false); el.layer.style.display = 'none'; return; }
    el.layer.style.display = '';
    tints(sim, state);
    pulsePrompt(sim);
    st = P.Objectives.status(sim);
    if (!st) { show(el.row, false); el.layer.style.display = 'none'; return; }
    if (st.state === 'failed' || st.state === 'done') show(el.mod, false);
    if (sim.milestone && !sim.milestone.open) show(el.row, false); else updateRow(sim, st);
    drawMarkers(sim);
  };

  function loop() { H.update(); requestAnimationFrame(loop); }
  if (typeof requestAnimationFrame === 'function' && typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { requestAnimationFrame(loop); });
    else requestAnimationFrame(loop);
  }
  return H;
})();
