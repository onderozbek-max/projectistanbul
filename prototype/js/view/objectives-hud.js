// Objective HUD, world markers, run-condition tints and the results row (lane P, view only).
// It reads the run through P.debug (main.js: sim, state) every frame, so it needs no hook in ui.js or main.js.
// It owns its DOM: a stylesheet, the objective row under the HUD, markers for crates, the civilian, the booster and
// terminals, night and rain tints for run modifiers, and a panel in #scr-results (objective, bonus, unlock previews;
// the star goals are drawn by screens.js from P.Objectives.goals).
// Telemetry: one 'objective' event per level when its outcome is final.
P.ObjectivesHud = (function () {
  var H = {}, el = {}, marks = [], lastSim = null, startT = 0, reported = null, resSim = null;
  var IN_RUN = { play: 1, storyRun: 1, exit: 1, cards: 1, chest: 1, paused: 1, down: 1 };
  var CSS = [
    '.obj-row{position:absolute;left:12px;right:12px;z-index:5;pointer-events:none;background:rgba(20,21,31,.74);color:#F4EBDD;',
    'border-radius:12px;padding:6px 10px;font:600 calc(12px * var(--ui-text, 1))/1.25 var(--body)}',
    '.obj-tag{display:inline-block;background:#E9A23B;color:#14151F;border-radius:4px;padding:0 5px;margin-right:6px;font-size:calc(10px * var(--ui-text, 1))}',
    '.obj-row.ok .obj-tag{background:#5BB37A}.obj-row.bad .obj-tag{background:#C94A3A}',
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
    '.obj-chips{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}',
    '.obj-chip{border-radius:999px;padding:2px 8px;font-size:calc(14px * var(--ui-text, 1));background:rgba(20,21,31,.12)}',
    '.obj-chip.on{background:#E9A23B;color:#14151F}',
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

  // Markers: each unfinished item on screen sits at its point. Off screen, it sticks to the nearest edge with its distance.
  function drawMarkers(sim) {
    var items = P.Objectives.items(sim), n = 0, h = sim.hero, c;
    var W = 390, top = 130, bot = 800, m = 24;
    items.forEach(function (it) {
      var p, x, y, off, d, node, ch, letter;
      if (it.done) return;
      p = P.Render && P.Render.toScreen ? P.Render.toScreen(it.x, it.y) : null;
      if (!p) return;
      x = p.x; y = p.y;
      off = x < m || x > W - m || y < top || y > bot;
      x = Math.max(m, Math.min(W - m, x)); y = Math.max(top, Math.min(bot, y));
      node = mark(n++);
      node.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      ch = it.label || it.kind;   // the label names the variant: Hat (cut), Panjur (gate), Araba (cart)
      letter = tx('obj.marker.' + ch).charAt(0);
      node.textContent = letter;
      node.className = 'obj-mark' + (off ? ' edge' : '');
      if (off) {
        d = Math.round(Math.hypot(it.x - h.x, it.y - h.y));
        node.innerHTML = '';
        node.appendChild(document.createTextNode(letter));
        node.appendChild(make('i', null, tx('obj.marker.m', { n: d })));
      }
    });
    for (c = n; c < marks.length; c++) marks[c].style.transform = 'translate(-999px,-999px)';
  }

  function updateRow(sim, st) {
    var cls = 'obj-row';   // placed by the HUD layout (row 2); no per-frame top (AUDIT-7 U1)
    if (st.state === 'done') cls += ' ok';
    if (st.state === 'failed') cls += ' bad';
    if (st.hp !== null && st.hp < 0.35) cls += ' warn';
    if (lastSim !== sim) { lastSim = sim; startT = performance.now(); reported = null; }
    if (performance.now() - startT < 2600) cls += ' obj-start';
    el.row.className = cls;
    el.tag.textContent = st.state === 'done' ? tx('obj.state.done') : st.state === 'failed' ? tx('obj.state.failed') : tx('obj.tag');
    el.title.textContent = tx(st.title);
    el.line.textContent = tx(st.line, st.vars);
    el.fill.style.width = (Math.max(0, Math.min(1, st.frac || 0)) * 100).toFixed(1) + '%';
    show(el.row, true);
  }

  function tints(sim, state) {
    var mod = sim.mod, on = IN_RUN[state] && mod;
    show(el.dark, !!(on && mod.dark));
    show(el.rain, !!(on && mod.id === 'rain'));
    el.rain.className = 'obj-rain' + (still() ? ' still' : '');
    if (on) { el.mod.textContent = tx('hmod.' + mod.id + '.name'); show(el.mod, true); } else show(el.mod, false);
  }

  function telemetry(sim, st) {
    var key = sim.seed + ':' + sim.levelIndex + ':' + st.state;
    if (st.state === 'active' || reported === key || !P.Tel) return;
    reported = key;
    P.Tel.log('objective', { level_id: sim.levelInfo.id, objective: st.id, result: st.state, t_s: +sim.runT.toFixed(1) });
  }

  // Results panel (under the star criteria that screens.js draws): the objective, its bonus, and what the next level brings.
  function resultsPanel(sim, state) {
    var host = document.getElementById('scr-results'), rn, box, st, won, list;
    if (!host || resSim === sim) return;   // one panel per finished run (a retry is a new sim object)
    resSim = sim;
    won = sim.mode === 'won';
    st = P.Objectives.results(sim);
    box = make('div', 'obj-res');
    box.appendChild(make('h4', null, tx('obj.res.title')));
    if (st) {
      box.appendChild(make('div', null, tx(st.title) + ' · ' + tx(st.line, st.vars)));
      box.appendChild(chipRow([[st.done ? tx('obj.res.bonusYes', { n: st.bonus }) : tx('obj.res.bonusNo'), st.done]]));
    } else box.appendChild(make('div', null, tx('obj.res.none')));
    if (won && P.Progress) {
      list = P.Progress.unlockPreview(sim.levelIndex);
      box.appendChild(make('h4', null, tx('unlock.title') + ' · ' + tx('unlock.next')));
      if (!list.length) box.appendChild(make('div', null, tx('unlock.none')));
      list.slice(0, 4).forEach(function (u) { box.appendChild(unlockRow(u)); });
    }
    rn = document.getElementById('res-run');
    Array.prototype.slice.call(host.querySelectorAll('.obj-res')).forEach(function (n) { n.parentNode.removeChild(n); });
    if (rn && rn.parentNode) rn.parentNode.insertBefore(box, rn.nextSibling); else host.appendChild(box);
  }

  // Chip row: [label, on] pairs. "on" chips are the goals that were met.
  function chipRow(pairs) {
    var row = make('div', 'obj-chips');
    pairs.forEach(function (p) { row.appendChild(make('span', 'obj-chip' + (p[1] ? ' on' : ''), p[0])); });
    return row;
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
    if (state === 'results') { show(el.row, false); show(el.dark, false); show(el.rain, false); resultsPanel(sim, state); return; }
    if (!IN_RUN[state]) { show(el.row, false); show(el.dark, false); show(el.rain, false); show(el.mod, false); el.layer.style.display = 'none'; return; }
    el.layer.style.display = '';
    tints(sim, state);
    pulsePrompt(sim);
    st = P.Objectives.status(sim);
    if (!st) { show(el.row, false); el.layer.style.display = 'none'; return; }
    updateRow(sim, st);
    telemetry(sim, st);
    drawMarkers(sim);
  };

  function loop() { H.update(); requestAnimationFrame(loop); }
  if (typeof requestAnimationFrame === 'function' && typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { requestAnimationFrame(loop); });
    else requestAnimationFrame(loop);
  }
  return H;
})();
