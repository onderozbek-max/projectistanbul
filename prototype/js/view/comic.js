// Comic story presentation (workstream G v0.4; text fit and lettering workstream D v0.5). P.Comic.page: full-screen
// comic pages (blocking; the lead pauses the game). P.Comic.pop: non-blocking bust pop-in (upper band). P.Comic.call:
// Mom's phone-call card. Art and lettering: comic-art.js. Text: P.LINES through P.Story.forLine. Real-time timing.
// FIT RULE: every bubble and caption is measured before it is drawn. A panel stacks its text above the busts' heads and
// tries the largest type size first (18 px), stepping down to 12 px. If it still does not fit, the text is ellipsized
// (A.clip) and a console warning is printed. Captions stack at the top so no bubble tail crosses one.
P.Comic = (function () {
  var C = {}, A = P.ComicArt;
  var TYPE_CPS = 42, POP_W = 390, POP_H = 300, POP_TOP = 150, RING_LEN = 125.66, PX_STEPS = [18, 17, 16, 15, 14, 13, 12];
  var BUST_STEPS = [1, 0.85, 0.72, 0.6, 0.5], PX_SOFT_MIN = 14;
  var AREA = { x: 12, y: 64, w: 366, h: 704 };
  var LAYOUTS = {
    1: [[0, 0, 1, 1]],
    2: [[0, 0, 1, 0.5], [0, 0.5, 1, 0.5]],
    3: [[0, 0, 1, 0.46], [0, 0.46, 0.5, 0.54], [0.5, 0.46, 0.5, 0.54]],
    4: [[0, 0, 1, 0.34], [0, 0.34, 0.5, 0.33], [0.5, 0.34, 0.5, 0.33], [0, 0.67, 1, 0.33]],
    5: [[0, 0, 1, 0.3], [0, 0.3, 0.5, 0.35], [0.5, 0.3, 0.5, 0.35], [0, 0.65, 0.5, 0.35], [0.5, 0.65, 0.5, 0.35]]
  };
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  var book = null, bookQueue = [], pops = [], calls = [], popEl = null, popCv = null, measureCv = null;
  var loopOn = false, last = 0, slowUntil = 0;

  // Copy the lettering stacks into CSS variables so comic.css and the canvas share one font config.
  (function setCssType() {
    if (typeof document === 'undefined' || !document.documentElement) return;
    document.documentElement.style.setProperty('--cm-speech', A.TYPE.speech);
    document.documentElement.style.setProperty('--cm-title', A.TYPE.title);
  })();

  // ---------- small helpers ----------
  function now() { return performance.now(); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function easeOut(x) { return 1 - Math.pow(1 - clamp(x, 0, 1), 3); }
  function easeOutBack(x) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
  function reduced() { return !!(P.Settings && P.Settings.reduceMotion); }
  function host() { return document.getElementById('phone') || document.body; }
  function el(tag, cls, parent) { var n = document.createElement(tag); if (cls) n.className = cls; if (parent) parent.appendChild(n); return n; }
  function voiceOf(who) { return ['arda', 'anne', 'usta', 'friend'].indexOf(who) >= 0 ? who : 'other'; }
  function sfx(name, gapMs, who) { if (P.Sfx && P.Sfx.play) P.Sfx.play(name, gapMs, { voice: who ? voiceOf(who) : 'other' }); }
  function duck(on) { if (P.Music && P.Music.duck) P.Music.duck(on); }
  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
  function canvasFor(w, h, parent, cls) {
    var cv = el('canvas', cls, parent);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    var c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { cv: cv, c: c };
  }
  function meas() { if (!measureCv) measureCv = document.createElement('canvas').getContext('2d'); return measureCv; }

  // ---------- resolving lines ----------
  // src: P.LINES id or {who, mood, side, text | key}. Returns {who, mood, side, important, text, caps, tag, speaker}.
  function resolve(src, opts) {
    var o = opts || {}, s;
    if (typeof src === 'string') {
      if (!P.LINES[src]) return null;
      var line = P.line(src), pr = (P.Story && P.Story.forLine && P.Story.forLine(src)) || {};
      s = { who: pr.who || null, mood: pr.mood || 'neutral', side: pr.side, important: !!pr.important, text: line.text, speaker: line.speaker };
    } else {
      if (!src) return null;
      s = { who: src.who || null, mood: src.mood || 'neutral', side: src.side, important: !!src.important,
            text: src.text != null ? src.text : P.t(src.key), speaker: src.who ? P.t('spk.' + src.who) : '' };
    }
    if (o.mood) s.mood = o.mood;
    if (o.side) s.side = o.side;
    if (o.important != null) s.important = !!o.important;
    s.side = s.side || (s.who === 'arda' ? 'l' : 'r');
    s.caps = P.upper(s.text);                 // comic lettering: dialogue in capitals
    s.tag = P.upper(s.speaker || '');         // name tag, same lettering
    return s;
  }

  // ---------- page layout ----------
  function panelRect(n, i) {
    var f = LAYOUTS[clamp(n, 1, 5)][i], g = 6;
    return { x: AREA.x + f[0] * AREA.w + g, y: AREA.y + f[1] * AREA.h + g, w: f[2] * AREA.w - 2 * g, h: f[3] * AREA.h - 2 * g };
  }
  // Busts: ch = [who, mood, x (0..1), flip, scale]. Base sits near the bottom of the panel.
  // k scales the busts down (crowns drop) so long dialogue gets more room instead of being clipped.
  function layoutBusts(p, k) {
    p.busts = (p.data.ch || []).map(function (ch) {
      return { who: ch[0], mood: ch[1] || 'neutral', x: clamp(ch[2], 0, 1) * p.w, base: p.h * 0.97,
               h: p.h * (ch[4] || 0.6) * (k || 1), flip: !!ch[3] };
    });
  }
  function bustFor(p, who) {
    for (var i = 0; i < p.busts.length; i++) if (p.busts[i].who === who) return p.busts[i];
    return null;
  }
  // The text band: from the top of the panel down to just above the busts' crowns (crown = base - 0.96 h).
  function textBand(p) {
    var top = p.busts.length ? p.h : p.h * 0.94;
    p.busts.forEach(function (b) { top = Math.min(top, b.base - b.h * 0.96); });
    return Math.max(p.h * 0.2, top - 8);
  }
  // Wraps one text at px. Normal mode may overflow (the stack then steps the size down); cut mode ellipsizes.
  function lines(p, text, maxW, maxH, kind, px, cut) {
    return cut ? A.clip(p.c, text, maxW, Math.max(20, maxH), kind, px) : A.measure(p.c, text, maxW, kind, px);
  }
  var TIME_GAP = 0.22;
  function bubbleItem(p, d, g) {
    var s = resolve(d[1]); if (!s) return null;
    var W = p.w, shout = d[0] === 's', kind = shout ? 'shout' : d[0] === 't' ? 'thought' : 'speech', side = d[2] || s.side;
    var bw = W < 220 ? W * 0.8 : Math.min(W * 0.62, 240), inset = A.textInset(shout ? 'shout' : 'speech', bw, 0);
    var y = Math.max(g.cur.L, g.cur.R), name = s.tag, room = g.band - y - (name ? 26 : 18) - (shout ? 12 : 0);
    var f = lines(p, s.caps, inset.maxW, room, 'speech', g.px, g.cut);
    var bh = A.boxH(f.lines, f.lh, name, shout);
    var bx = side === 'l' ? W * 0.03 : W - bw - W * 0.03, bust = bustFor(p, s.who);
    var tx = bust ? bust.x : W / 2, ty = bust ? bust.base - bust.h * 0.86 : p.h * 0.9;
    g.cur.L = g.cur.R = y + bh + 8;
    return { kind: 'bubble', shape: kind, who: s.who, len: s.caps.length, lines: f.lines, px: f.px, lh: f.lh,
             x: bx, y: y, w: bw, h: bh, tx: tx, ty: ty, name: name, dur: s.caps.length / TYPE_CPS, bottom: y + bh, cut: f.cut };
  }
  function captionItem(p, d, g) {
    var s = resolve(d[1]); if (!s) return null;
    var W = p.w, y = Math.max(g.cur.L, g.cur.R), f = lines(p, s.caps, W * 0.92 - 18, g.band - y - 16, 'speech', g.px, g.cut);
    var h = f.lines.length * f.lh + 16;
    g.cur.L = g.cur.R = y + h + 6;
    return { kind: 'caption', len: s.caps.length, lines: f.lines, px: f.px, lh: f.lh, x: W * 0.04, y: y, w: W * 0.92,
             dur: s.caps.length / TYPE_CPS, bottom: y + h, cut: f.cut };
  }
  // SFX lettering shrinks until it is at most 90% of the panel width.
  function sfxItem(p, d) {
    var txt = P.upper(P.t('cm.sfx.' + d[1])), size = Math.min(p.w * 0.2, 60);
    A.setFont(p.c, 'title', size);
    while (size > 14 && p.c.measureText(txt).width > p.w * 0.9) { size -= 2; A.setFont(p.c, 'title', size); }
    return { kind: 'sfx', text: txt, x: d[2] * p.w, y: d[3] * p.h, rot: d[4] || 0, fill: d[5] === 'red' ? '#FF7A5C' : '#FFD166',
             size: size, dur: 0.3, bottom: 0 };
  }
  function letterItem(p, d, g) {
    var W = p.w, lw = W * 0.88, px = Math.min(g.px, 17), y = Math.max(g.cur.L, g.cur.R);
    var text = d[1].filter(function (id) { return P.LINES[id]; }).map(function (id) { return P.line(id).text; }).join(' ');
    var f = lines(p, text, lw - 24, g.band - y - 40, 'hand', px, g.cut), h = f.lines.length * f.lh + 40;
    g.cur.L = g.cur.R = y + h + 6;
    return { kind: 'letter', lines: f.lines, px: f.px, lh: f.lh, x: W * 0.06, y: y + 6, w: lw, rot: -1.2, dur: 0.5, len: 0,
             bottom: y + h + 6, cut: f.cut };
  }
  function layoutItem(p, d, g) {
    var k = d[0];
    if (k === 'b' || k === 's' || k === 't') return bubbleItem(p, d, g);
    if (k === 'c') return captionItem(p, d, g);
    if (k === 'x') return sfxItem(p, d);
    if (k === 'p') return { kind: 'bars', n: d[1], x: p.w - 40, y: p.h - 14, dur: 0, bottom: 0 };
    if (k === 'l') return letterItem(p, d, g);
    return null;
  }
  // Start times follow the script order, so the reveal reads in order even though captions are stacked first.
  function timeline(items) {
    var t = 0.35;
    items.slice().sort(function (a, b) { return a.src - b.src; }).forEach(function (it) {
      if (it.kind === 'bars') { it.start = 0; return; }
      it.start = t; t = it.start + it.dur + TIME_GAP;
    });
    return t;
  }
  // One stacking pass at size g.px. Captions go first (top), then bubbles, sfx, letters.
  function stack(p, defs, g) {
    var order = defs.map(function (d, i) { return i; }), items = [], ok = true;
    order.sort(function (a, b) { return (defs[a][0] === 'c' ? 0 : 1) - (defs[b][0] === 'c' ? 0 : 1) || a - b; });
    g.cur = { L: p.h * 0.035, R: p.h * 0.035 };
    order.forEach(function (i) {
      var it = layoutItem(p, defs[i], g);
      if (!it) return;
      it.src = i; items.push(it);
      if (it.bottom > g.band) ok = false;
    });
    return { ok: ok, items: items, total: timeline(items), px: g.px, cut: items.some(function (it) { return it.cut; }) };
  }
  function layoutPanel(p) {
    var defs = p.data.it || [], g = { band: 0, px: PX_STEPS[0], cut: false, cur: null }, res = null, i, r;
    // Prefer big lettering with smaller busts; only drop below 14 px at the smallest bust; clip last.
    for (var b = 0; b < BUST_STEPS.length && !res; b++) {
      layoutBusts(p, BUST_STEPS[b]); g.band = textBand(p);
      var last = b === BUST_STEPS.length - 1;
      for (i = 0; i < PX_STEPS.length && !res; i++) {
        if (!last && PX_STEPS[i] < PX_SOFT_MIN) break;
        g.px = PX_STEPS[i]; r = stack(p, defs, g); if (r.ok) res = r;
      }
    }
    if (!res) { g.px = PX_STEPS[PX_STEPS.length - 1]; g.cut = true; res = stack(p, defs, g); }
    p.items = res.items; p.total = res.total; p.px = res.px; p.cut = res.cut;
    p.T = 0; p.done = false; p.revealed = false;
  }
  function makePanel(pd, r) {
    var wrap = el('div', 'cm-panel', book.grid), art = canvasFor(r.w, r.h, wrap, 'cm-art'), bg = canvasFor(r.w, r.h, null);
    wrap.style.left = r.x + 'px'; wrap.style.top = r.y + 'px'; wrap.style.width = r.w + 'px'; wrap.style.height = r.h + 'px';
    wrap.style.setProperty('--tilt', (book.grid.childElementCount % 2 ? 0.6 : -0.7) + 'deg');
    A.scene(bg.c, r.w, r.h, pd.bg, hash(pd.bg));
    A.wash(bg.c, r.w, r.h, pd.tone);
    A.halftone(bg.c, r.w, r.h, 0.5);
    var p = { el: wrap, cv: art.cv, c: art.c, bg: bg.cv, w: r.w, h: r.h, data: pd, T: 0, done: false, revealed: false, busts: [], items: [], total: 0 };
    layoutPanel(p);
    return p;
  }

  // ---------- page drawing ----------
  function drawItem(c, it, T) {
    if (T < it.start) return;
    var k = clamp((T - it.start) * TYPE_CPS, 0, it.len || 0), n = Math.floor(k);
    if (it.kind === 'bubble') { A.bubble(c, { x: it.x, y: it.y, w: it.w, h: it.h, tx: it.tx, ty: it.ty, kind: it.shape, name: it.name, lines: A.partial(it.lines, n), px: it.px, lh: it.lh }); }
    else if (it.kind === 'caption') { A.caption(c, { x: it.x, y: it.y, w: it.w, lines: A.partial(it.lines, n), px: it.px, lh: it.lh }); }
    else if (it.kind === 'sfx') { A.sfx(c, { x: it.x, y: it.y, text: it.text, rot: it.rot, size: it.size * clamp((T - it.start) / 0.12, 0, 1) + 0.5, fill: it.fill }); }
    else if (it.kind === 'letter') { c.save(); c.globalAlpha = clamp((T - it.start) / 0.4, 0, 1); A.letter(c, it); c.restore(); }
    else if (it.kind === 'bars') { A.bars(c, it.x, it.y, it.n, 22); }
  }
  function activeText(p) {
    for (var i = 0; i < p.items.length; i++) {
      var it = p.items[i];
      if (it.kind === 'bubble' && p.T >= it.start && p.T < it.start + it.dur && it.who) return it;
    }
    return null;
  }
  function drawPanel(p) {
    var c = p.c, w = p.w, h = p.h, T = p.T, talker = activeText(p);
    c.clearRect(0, 0, w, h);
    c.drawImage(p.bg, 0, 0, w, h);
    p.busts.forEach(function (b) {
      A.bust(c, b.who, b.mood, b.x, b.base, b.h, { flip: b.flip, talk: talker && talker.who === b.who ? 0.5 + 0.5 * Math.sin(T * 16) : 0 });
    });
    if (p.data.speed) A.speed(c, w / 2, h / 2, w, h, 0.16);
    if (T < 0.35) { c.save(); c.globalAlpha = 1 - T / 0.35; A.burst(c, w / 2, h / 2, Math.min(w, h) * (0.25 + T), '#FFF1A8', 9); c.restore(); }
    p.items.forEach(function (it) { drawItem(c, it, T); });
  }
  function announce(p) {
    var parts = [];
    p.items.forEach(function (it) { if (it.lines) parts.push(it.lines.join(' ')); else if (it.text) parts.push(it.text); });
    book.sr.textContent = parts.join(' ');
  }
  function revealPanel(i) {
    var p = book.panels[i]; if (!p) return;
    p.revealed = true; p.el.classList.add('in');
    sfx(i ? 'comicPage' : 'comicPop', 70);
    announce(p);
  }
  function finishPanel(p) { p.T = p.total; p.done = true; announce(p); }

  // ---------- page flow ----------
  function labelOf(def, i) {
    if (def.hood != null && P.Journey && P.Journey.hoods[def.hood]) return (def.hood + 1) + ' / 20 · ' + P.Journey.hoods[def.hood].name;
    return P.t(def.tag || 'cm.tag.story') + ' · ' + (i + 1);
  }
  function clearGrid() { book.grid.innerHTML = ''; book.panels = []; }
  function nextPage() {
    book.pi++;
    if (book.pi >= book.list.length) return closeBook(false);
    var def = P.Story.pages[book.list[book.pi]];
    if (!def) return nextPage();
    clearGrid();
    book.label.textContent = labelOf(def, book.pi);
    book.panels = def.panels.map(function (pd, i) { return makePanel(pd, panelRect(def.panels.length, i)); });
    book.cur = 0; book.dark.style.opacity = 0; book.zoom = null;
    revealPanel(0);
  }
  function finishPage() {
    if (!book) return;
    if (book.pi + 1 < book.list.length) { nextPage(); return; }
    closeBook(false);
  }
  function advance() {
    var b = book; if (!b || b.zoom) return;
    var p = b.panels[b.cur];
    if (!p) return finishPage();
    if (!p.done) return finishPanel(p);
    if (b.cur + 1 < b.panels.length) { b.cur++; return revealPanel(b.cur); }
    if (p.data.zoom && !reduced()) return startZoom(p);
    finishPage();
  }
  function closeBook(skipped) {
    var b = book; if (!b) return;
    book = null;
    b.root.remove();
    document.removeEventListener('keydown', keyDown, true);
    duck(false);
    if (b.onDone) b.onDone(!!skipped);
    if (!book && bookQueue.length) { var q = bookQueue.shift(); openBook(q.list, q.onDone); }
  }
  function openBook(list, onDone) {
    book = { list: list, pi: -1, onDone: onDone, panels: [], cur: 0, zoom: null, holding: false, holdT: 0 };
    var root = el('div', 'cm-page' + (reduced() ? ' cm-reduce' : ''), host());
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', P.t('cm.page.label'));
    book.root = root; book.grid = el('div', 'cm-grid', root); book.dark = el('div', 'cm-dark', root);
    book.label = el('div', 'cm-tag', root); book.sr = el('div', 'cm-sr', root); book.sr.setAttribute('aria-live', 'polite');
    book.hint = el('div', 'cm-hint', root); book.hint.textContent = P.t('cm.tap');
    buildSkip(root);
    root.addEventListener('pointerup', function () { if (book && !book.holding) advance(); });
    document.addEventListener('keydown', keyDown, true);
    duck(true); sfx('hoodIntro', 300);
    nextPage(); kick();
  }
  function buildSkip(root) {
    var btn = el('button', 'cm-skip', root);
    btn.setAttribute('aria-label', P.t('ui.skip')); btn.type = 'button';
    btn.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle class="cm-ring-bg" cx="24" cy="24" r="20"></circle><circle class="cm-ring" cx="24" cy="24" r="20"></circle></svg>';
    btn.addEventListener('pointerdown', function (e) { e.stopPropagation(); if (book) { book.holding = true; book.holdT = 0; } });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
      btn.addEventListener(ev, function (e) { e.stopPropagation(); if (book) { book.holding = false; book.holdT = 0; } });
    });
    book.skip = btn; book.ring = btn.querySelector('.cm-ring');
  }
  function keyDown(e) {
    if (!book) return;
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); e.stopPropagation(); if (!e.repeat) advance(); }
  }

  // Zoom: freeze, then three quick zooms onto faces, vignette, fade to black, done.
  function startZoom(p) {
    var faces = p.busts.slice(0, 3).map(function (b) { return { x: b.x / p.w * 100, y: (b.base - b.h * 0.7) / p.h * 100 }; });
    if (!faces.length) faces = [{ x: 50, y: 40 }];
    book.zoom = { p: p, t: 0, faces: faces, step: 0.48, lead: 0.35 };
    sfx('hoodIntro', 60);
  }
  function updateZoom(dt) {
    var z = book.zoom; if (!z) return;
    z.t += dt;
    var t = z.t - z.lead, n = z.faces.length, st = z.step, cvs = z.p.cv.style;
    if (t < 0) return;
    var k = Math.floor(t / st), local = t - k * st;
    if (k < n) {
      cvs.transformOrigin = z.faces[k].x + '% ' + z.faces[k].y + '%';
      cvs.transform = local < 0.34 ? 'scale(' + (1 + 0.9 * easeOut(local / 0.34)) + ')' : 'scale(1.9)';
      if (local < 0.02 && z.lastK !== k) { z.lastK = k; sfx('comicPop', 60); }
    } else { cvs.transform = 'scale(1)'; }
    var fadeT = t - n * st;
    book.dark.style.opacity = clamp(fadeT / 0.5, 0, 1);
    if (fadeT >= 0.6) { book.zoom = null; finishPage(); }
  }

  // Per-frame page update: typing, blips, Ken Burns drift, zoom, hold-to-skip ring.
  function pageUpdate(dt) {
    var b = book; if (!b) return;
    b.panels.forEach(function (p) {
      if (!p.revealed) return;
      if (!p.done) {
        var before = p.T; p.T = Math.min(p.total, p.T + dt);
        if (p.T >= p.total) p.done = true;
        blip(p, before);
      }
      if (!reduced() && !(b.zoom && b.zoom.p === p)) p.cv.style.transform = 'scale(' + (1 + 0.035 * Math.min(1, p.T / 6)).toFixed(4) + ') translate(' + (-p.T * 0.5).toFixed(2) + 'px,0)';
      drawPanel(p);
    });
    if (!book) return;
    if (b.zoom) updateZoom(dt);
    if (!book) return;
    if (b.holding) {
      b.holdT += dt;
      b.ring.style.strokeDashoffset = (RING_LEN * (1 - clamp(b.holdT / 0.6, 0, 1))).toFixed(2);
      if (b.holdT >= 0.6) closeBook(true);
    }
  }
  function blip(p, before) {
    p.items.forEach(function (it) {
      if (it.kind !== 'bubble' && it.kind !== 'caption') return;
      var a = clamp(Math.floor((before - it.start) * TYPE_CPS), 0, it.len), b2 = clamp(Math.floor((p.T - it.start) * TYPE_CPS), 0, it.len);
      if (b2 > a && b2 > 0 && b2 < it.len) sfx('speech', 55, it.who);
    });
  }

  // ---------- pops ----------
  function ensurePop() {
    if (popEl) return;
    popEl = el('div', 'cm-pop', host());
    popCv = canvasFor(POP_W, POP_H, popEl, 'cm-pop-cv');
    popEl.style.top = POP_TOP + 'px';
  }
  // Pop geometry: the bubble hangs from the top edge; the bust's crown limits how low it may reach.
  function popGeom(important) {
    var bh = important ? 150 : 138, base = POP_H - 8, headTop = base - bh * 0.96;
    return { bh: bh, base: base, top: 22, maxH: headTop - 8 - 22 };
  }
  function popJob(s, opts, c) {
    var o = opts || {}, imp = o.important != null ? !!o.important : s.important, shout = imp || !!o.shout;
    var geo = popGeom(imp), tw = shout ? 212 * 0.76 - 24 : 188, room = geo.maxH - 24 - (shout ? 12 : 0);
    var f = A.fit(c || popCv.c, s.caps, tw, room, 'speech', 18, 12);
    return { s: s, important: imp, shout: shout, lines: f.lines, px: f.px, lh: f.lh, len: s.caps.length, T: 0, started: false,
             cut: f.cut, typeDur: s.caps.length / TYPE_CPS, holdDur: Math.max(2.2, 1.6 + 0.045 * s.caps.length) };
  }
  function popTimes(j) { var t1 = 0.28, t2 = t1 + j.typeDur, t3 = t2 + j.holdDur; return { t1: t1, t2: t2, t3: t3, t4: t3 + 0.25 }; }
  function popPose(j, tt, T, fx, sx) {
    if (T < tt.t1) { var sc = clamp(T / tt.t1, 0, 1); return { x: sx + (fx - sx) * easeOutBack(sc), a: 1, sc: sc }; }
    if (T >= tt.t3) { var o = clamp((T - tt.t3) / 0.25, 0, 1); return { x: fx + (sx - fx) * o, a: 1 - o * 0.6, sc: 1 }; }
    return { x: fx, a: 1, sc: 1 };
  }
  function popDraw(j) {
    var c = popCv.c, s = j.s, T = j.T, tt = popTimes(j), side = s.side === 'l' ? 'l' : 'r', geo = popGeom(j.important);
    var fx = side === 'l' ? 92 : POP_W - 92, sx = side === 'l' ? -90 : POP_W + 90, pose = popPose(j, tt, T, fx, sx);
    var typed = T > tt.t1 ? clamp((T - tt.t1) * TYPE_CPS, 0, j.len) : 0, talking = typed < j.len && T > tt.t1;
    c.clearRect(0, 0, POP_W, POP_H);
    c.save(); c.globalAlpha = pose.a;
    A.burst(c, pose.x, geo.base - geo.bh * 0.5, geo.bh * 0.62 * pose.sc, j.important ? '#FFD166' : '#FFF1A8', 9);
    A.bust(c, s.who || 'stranger', s.mood, pose.x, geo.base, geo.bh, { flip: side === 'r', talk: talking ? 0.5 + 0.5 * Math.sin(T * 16) : 0 });
    A.bubble(c, { x: side === 'l' ? 164 : 14, y: geo.top, w: 212, h: A.boxH(j.lines, j.lh, s.tag, j.shout), tx: pose.x,
                  ty: geo.base - geo.bh * 0.86, kind: j.shout ? 'shout' : 'speech', name: s.tag,
                  lines: A.partial(j.lines, Math.floor(typed)), px: j.px, lh: j.lh });
    c.restore();
  }
  function popUpdate(dt) {
    var j = pops[0]; if (!j) { if (popCv) popCv.c.clearRect(0, 0, POP_W, POP_H); return; }
    if (!j.started) {
      j.started = true; ensurePop(); popEl.style.display = '';
      sfx('comicPop', 60, j.s.who);
      if (j.important && !reduced()) slowUntil = now() + 1100;
    }
    var before = j.T; j.T += dt;
    var tt = popTimes(j);
    if (j.T > tt.t1 && j.T < tt.t2) {
      var a = Math.floor((before - tt.t1) * TYPE_CPS), b = Math.floor((j.T - tt.t1) * TYPE_CPS);
      if (b > a) sfx('speech', 55, j.s.who);
    }
    if (j.T >= tt.t4) { pops.shift(); popCv.c.clearRect(0, 0, POP_W, POP_H); return; }
    popDraw(j);
  }

  // ---------- calls ----------
  function callCard(rec) {
    var card = el('div', 'cm-call' + (rec.blocking ? ' cm-block' : '') + (reduced() ? ' cm-reduce' : ''), host());
    var head = el('div', 'cm-call-head', card), ctact = el('div', 'cm-contact', head), info = el('div', 'cm-call-info', head);
    ctact.appendChild(A.contact(rec.who, 'neutral', 56, dpr));
    rec.nameEl = el('div', 'cm-call-name', info); rec.nameEl.textContent = P.upper(P.t('spk.' + rec.who));
    rec.timerEl = el('div', 'cm-call-timer', info); rec.timerEl.textContent = '00:00';
    rec.barsEl = el('div', 'cm-bars', head);
    for (var i = 0; i < 4; i++) el('i', '', rec.barsEl);
    rec.art = canvasFor(AREA.w, 150, card, 'cm-call-art');
    rec.bg = canvasFor(AREA.w, 150, null);   // scenery drawn once, blitted each frame
    A.scene(rec.bg.c, AREA.w, 150, 'dusk', 11);
    rec.bg.c.fillStyle = 'rgba(20,21,31,.35)'; rec.bg.c.fillRect(0, 0, AREA.w, 150);
    rec.subEl = el('div', 'cm-call-sub', card); rec.subEl.setAttribute('aria-live', 'polite');
    rec.nosigEl = el('div', 'cm-nosig', card); rec.nosigEl.textContent = P.t('cm.nosig');
    rec.el = card; rec.nosigEl.style.display = 'none';
    card.addEventListener('pointerup', function () { if (rec.blocking && rec.phase === 'talk') rec.LT = 99; });
    sfx('phoneRing', 900, 'other');
  }
  // Bars: a number for the whole call, or an array with one value per line (dropping and recovering signal).
  function barsAt(rec, i) {
    var b = rec.bars;
    if (Array.isArray(b)) return b.length ? b[Math.min(i, b.length - 1)] : 4;
    return b == null ? 4 : b;
  }
  function setBars(rec) {
    var n = barsAt(rec, rec.li), kids = rec.barsEl.children, flick = n <= 1 && Math.floor(rec.T * 2) % 2 === 1;
    for (var i = 0; i < 4; i++) kids[i].classList.toggle('on', i < n && !flick);
  }
  function setSub(rec, speaker, text) {
    rec.subEl.innerHTML = '';
    if (!P.Settings || P.Settings.subs !== false) { var b = el('b', '', rec.subEl); b.textContent = speaker + ': '; el('span', '', rec.subEl).textContent = text; }
  }
  function startLine(rec) {
    var id = rec.lines[rec.li], s = resolve(id);
    rec.LT = 0; rec.cur = s; rec.len = s.caps.length; rec.typeDur = rec.len / TYPE_CPS;
    rec.holdDur = Math.max(2.0, 1.2 + 0.045 * rec.len);
    if (s.caps.indexOf('[') >= 0 || barsAt(rec, rec.li) === 0) rec.staticUntil = rec.T + 0.2;
    setSub(rec, s.tag, s.caps);
  }
  // Ends the call: a dropped call (last bars at 0) shows "Sinyal yok" and buzzes before it closes.
  function endCall(rec, dropped) {
    rec.phase = dropped ? 'nosig' : 'out'; rec.T = 0; rec.dropped = !!dropped;
    rec.subEl.style.display = dropped ? 'none' : '';
    rec.nosigEl.style.display = dropped ? '' : 'none';
    if (dropped) sfx('phoneBuzz', 200, 'other');
  }
  function callUpdate(dt) {
    var rec = calls[0]; if (!rec) return;
    rec.T += dt; rec.staticOn = rec.T < rec.staticUntil;
    if (rec.phase === 'ring') {
      rec.el.classList.add('cm-ringing');
      if (!rec.ringed2 && rec.T >= 1.0) { rec.ringed2 = true; sfx('phoneRing', 900, 'other'); }
      if (rec.T >= 2.0) { rec.el.classList.remove('cm-ringing'); rec.phase = 'talk'; rec.li = 0; rec.T = 0; if (rec.lines.length) startLine(rec); else endCall(rec, false); }
    } else if (rec.phase === 'talk') { stepTalk(rec, dt); }
    else if (rec.phase === 'nosig' && rec.T >= 1.6) rec.phase = 'out';
    if (rec.phase === 'out' && rec.T >= 0.6) return finishCall(rec);
    drawCall(rec); setBars(rec);
    rec.timerEl.textContent = fmt(rec.T);
  }
  function stepTalk(rec, dt) {
    rec.LT += dt;
    if (rec.LT >= rec.typeDur + rec.holdDur) {
      rec.li++;
      if (rec.li >= rec.lines.length) return endCall(rec, barsAt(rec, rec.lines.length - 1) === 0);
      startLine(rec);
    }
    if (rec.LT > 0 && rec.LT < rec.typeDur && Math.floor(rec.LT * TYPE_CPS) !== Math.floor((rec.LT - dt) * TYPE_CPS)) sfx('speech', 55, rec.cur.who);
  }
  function fmt(t) { t = Math.max(0, Math.floor(t)); return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); }
  // Call art: Arda small on the left, the caller big on the right; the speaking one talks and stays bright.
  function drawCall(rec) {
    var c = rec.art.c, cur = rec.cur || {}, talk = rec.phase === 'talk' && rec.LT < (rec.typeDur || 0);
    var ardaTalks = talk && cur.who === 'arda', callerTalks = talk && cur.who !== 'arda';
    c.clearRect(0, 0, AREA.w, 150); c.drawImage(rec.bg.cv, 0, 0, AREA.w, 150);
    A.bust(c, 'arda', ardaTalks ? cur.mood : 'neutral', 74, 146, 96,
           { alpha: ardaTalks || !talk ? 1 : 0.7, talk: ardaTalks ? 0.5 + 0.5 * Math.sin(rec.T * 16) : 0 });
    A.bust(c, rec.who, callerTalks ? cur.mood : 'neutral', 290 + (rec.phase === 'ring' ? Math.sin(rec.T * 18) * 2 : 0), 150, 140,
           { alpha: callerTalks || !talk ? 1 : 0.7, talk: callerTalks ? 0.5 + 0.5 * Math.sin(rec.T * 16) : 0 });
    if (rec.staticOn) A.static(c, AREA.w, 150, A.rng(Math.floor(rec.T * 20)), 0.55);
  }
  function finishCall(rec) {
    calls.shift(); rec.el.remove();
    if (rec.onDone) rec.onDone(!rec.dropped);
    if (calls.length) callCard(calls[0]);
  }

  // ---------- loop ----------
  function kick() { if (!loopOn) { loopOn = true; last = now(); requestAnimationFrame(frame); } }
  function frame() {
    var t = now(), dt = clamp((t - last) / 1000, 0, 0.05); last = t;
    pageUpdate(dt);
    popUpdate(dt);
    callUpdate(dt);
    if (book || pops.length || calls.length) requestAnimationFrame(frame); else loopOn = false;
  }

  // ---------- public API ----------
  // ids: one page id or an array (played in order). onDone(skipped) runs when the last page closes.
  C.page = function (ids, onDone) {
    var list = [].concat(ids || []).filter(function (id) { return P.Story && P.Story.pages[id]; });
    if (!list.length) { if (onDone) onDone(false); return; }
    if (book) { bookQueue.push({ list: list, onDone: onDone }); return; }
    openBook(list, onDone);
  };
  // line: P.LINES id or {who, mood, side, text|key, important}. opts: {mood, side, important, shout}.
  C.pop = function (line, opts) {
    var s = resolve(line, opts);
    if (!s || !s.caps) return;
    if (pops.length >= 4) pops.splice(1, 1);
    ensurePop();
    pops.push(popJob(s, opts));
    kick();
  };
  // who: caller portrait id; lineIds: P.LINES ids. opts: {bars: n | [n per line], blocking, mood}.
  C.call = function (who, lineIds, onDone, opts) {
    var o = opts || {};
    var rec = { who: who, lines: (lineIds || []).filter(function (id) { return P.LINES[id]; }), onDone: onDone,
                bars: o.bars == null ? 4 : o.bars, blocking: !!o.blocking, phase: 'ring', T: 0, LT: 0, li: 0,
                staticUntil: 0, staticOn: false, ringed2: false, typeDur: 0, holdDur: 0, len: 0, cur: null };
    calls.push(rec);
    if (calls.length === 1) callCard(rec);
    kick();
  };
  C.clearPops = function () { pops = []; if (popCv) popCv.c.clearRect(0, 0, POP_W, POP_H); if (popEl) popEl.style.display = 'none'; };
  C.timeScale = function () {
    if (reduced()) return 1;
    var t = now();
    if (t < slowUntil) return 0.35;
    var k = (t - slowUntil) / 400;
    return k >= 1 ? 1 : 0.35 + 0.65 * k;
  };
  C.active = function () { return !!(book || pops.length || calls.length); };

  // ---------- dev audit (no DOM): every page panel, every pop and call line in the current language ----------
  function popBeatIds() {
    var seen = {}, out = [], n, when, b;
    for (n = 1; n <= P.Journey.count(); n++) {
      ['start', 'mid', 'boss'].forEach(function (w) {
        b = P.Story.beat(n, w);
        if (!b) return;
        var ids = b.kind === 'pop' ? [b.line] : b.kind === 'call' ? b.lines : [];
        ids.forEach(function (id) { if (!seen[id]) { seen[id] = 1; out.push({ id: id, kind: b.kind }); } });
      });
    }
    return out;
  }
  function auditPage(rows, m) {
    Object.keys(P.Story.pages).forEach(function (id) {
      var def = P.Story.pages[id];
      def.panels.forEach(function (pd, i) {
        var r = panelRect(def.panels.length, i), fp = { w: r.w, h: r.h, c: m, data: pd };
        layoutPanel(fp);
        rows.push({ kind: 'page', id: id + ' #' + (i + 1), px: fp.px, cut: !!fp.cut });
      });
    });
  }
  function auditLine(rows, m, entry) {
    var s = resolve(entry.id), f, shout = entry.kind === 'pop' && /^H\d+b$/.test(entry.id);
    if (!s) return;
    if (entry.kind === 'call') {
      f = A.measure(m, s.caps, AREA.w - 40, 'speech', 14);
      rows.push({ kind: 'call', id: entry.id, px: 14, cut: f.lines.length > 3 });
      return;
    }
    var j = popJob(s, { important: shout }, m);
    rows.push({ kind: 'pop', id: entry.id, px: j.px, cut: !!j.cut });
  }
  C.audit = function () {
    var m = meas(), rows = [], saved = A.quiet;
    A.quiet = true; A.cuts = [];
    auditPage(rows, m);
    popBeatIds().forEach(function (e) { auditLine(rows, m, e); });
    A.quiet = saved;
    return rows;
  };
  return C;
})();
