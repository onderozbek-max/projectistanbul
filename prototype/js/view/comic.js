// Comic story presentation (workstream G v0.4; lettering and fit v0.5). P.Comic.page: full-screen comic pages (blocking;
// the lead pauses the game). P.Comic.pop: non-blocking bust pop-in (upper band). P.Comic.call: Mom's phone-call card.
// Art: comic-art.js. Lettering: comic-text.js. Panel layout, fit search and audit: comic-layout.js. Text: P.Dialogue beats through
// P.Story.forLine. Nothing here truncates text: the layout fits it (see comic-layout.js). Pages, pops and calls wait
// until the lettering faces are ready (A.whenReady), so layout and drawing always use the same font.
P.Comic = (function () {
  var C = {}, A = P.ComicArt, TX = P.ComicText, L = P.ComicLayout;
  var TYPE_CPS = L.CPS, POP = L.POP, POP_W = POP.w, POP_H = POP.h, POP_TOP = 150, RING_LEN = 125.66, AREA = L.AREA;
  var OUT_HOLD = 0.6, TURN_GAP = 0.5;   // a call's hold after it ends (s); least time between two page slides (s): two a second at most
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  var book = null, bookQueue = [], pops = [], calls = [], popEl = null, popCv = null;
  var loopOn = false, last = 0;

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
  function voiceOf(who) { if (who === 'kaan') return 'friend'; return ['arda', 'anne', 'usta', 'friend'].indexOf(who) >= 0 ? who : 'other'; }
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
  function resolve(src, opts) { return L.resolve(src, opts); }

  // ---------- page drawing ----------
  function makePanel(pd, r) {
    var wrap = el('div', 'cm-panel', book.grid), art = canvasFor(r.w, r.h, wrap, 'cm-art'), bg = canvasFor(r.w, r.h, null);
    wrap.style.left = r.x + 'px'; wrap.style.top = r.y + 'px'; wrap.style.width = r.w + 'px'; wrap.style.height = r.h + 'px';
    wrap.style.setProperty('--tilt', (book.grid.childElementCount % 2 ? 0.6 : -0.7) + 'deg');
    A.scene(bg.c, r.w, r.h, pd.bg, hash(pd.bg));
    A.wash(bg.c, r.w, r.h, pd.tone);
    A.halftone(bg.c, r.w, r.h, 0.5);
    var p = { el: wrap, cv: art.cv, c: art.c, bg: bg.cv, w: r.w, h: r.h, data: pd, T: 0, done: false, revealed: false, busts: [], items: [], total: 0 };
    L.layoutPanel(p);
    return p;
  }
  function drawItem(c, it, t) {
    if (t < it.start) return;
    var k = clamp((t - it.start) * TYPE_CPS, 0, it.len || 0), n = Math.floor(k);
    if (it.kind === 'bubble') TX.balloon(c, { x: it.x, y: it.y, w: it.w, h: it.h, tx: it.tx, ty: it.ty, kind: it.shape, name: it.name, lines: TX.partial(it.lines, n), px: it.px, lh: it.lh });
    else if (it.kind === 'caption') TX.caption(c, { x: it.x, y: it.y, w: it.w, lines: TX.partial(it.lines, n), px: it.px, lh: it.lh });
    else if (it.kind === 'sfx') TX.sfx(c, { x: it.x, y: it.y, text: it.text, rot: it.rot, size: it.size * clamp((t - it.start) / 0.12, 0, 1) + 0.5, fill: it.fill });
    else if (it.kind === 'letter') { c.save(); c.globalAlpha = clamp((t - it.start) / 0.4, 0, 1); TX.letter(c, it); c.restore(); }
    else if (it.kind === 'bars') A.bars(c, it.x, it.y, it.n, 22);
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
  // Page turn (T4 part 4, JS-driven): the grid of the page that leaves slides off to the left while the next one slides in
  // from the right, over --m-enter (turnUpdate, run by pageUpdate). Under Reduce motion, or within TURN_GAP of the last slide,
  // the page changes at once, so a run of quick taps never makes more than two slides a second.
  function turnGrid() {
    var old = book.grid, fresh = el('div', 'cm-grid', null);
    if (book.turn) { book.turn.el.remove(); book.turn = null; }   // a slide still running gives way to this one
    if (old && old.parentNode) old.parentNode.insertBefore(fresh, old.nextSibling); else book.root.appendChild(fresh);
    book.grid = fresh; book.panels = [];
    if (!old || !old.childElementCount || reduced() || book.turnIn > 0) { if (old) old.remove(); return; }
    book.turn = { el: old, t: 0 }; book.turnIn = TURN_GAP;
    fresh.style.transform = 'translate3d(100%,0,0)';
  }
  function turnUpdate(dt) {
    var tn = book.turn, span = P.UIMotion.ms('--m-enter') / 1000, k = 1;
    tn.t += dt;
    if (span > 0) k = clamp(tn.t / span, 0, 1);
    tn.el.style.transform = 'translate3d(' + (-100 * k * k).toFixed(2) + '%,0,0)';
    book.grid.style.transform = 'translate3d(' + (100 * (1 - easeOut(k))).toFixed(2) + '%,0,0)';
    if (k >= 1) { tn.el.remove(); book.turn = null; book.grid.style.transform = ''; }
  }
  function nextPage() {
    book.pi++;
    if (book.pi >= book.list.length) return closeBook(false);
    var def = P.Story.pages[book.list[book.pi]];
    if (!def) return nextPage();
    turnGrid();
    book.label.textContent = labelOf(def, book.pi);
    book.panels = def.panels.map(function (pd, i) { return makePanel(pd, L.panelRect(def.panels.length, i)); });
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
    book = { list: list, pi: -1, onDone: onDone, panels: [], cur: 0, zoom: null, holding: false, holdT: 0, turn: null, turnIn: 0 };
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
    if (b.turn) turnUpdate(dt);
    if (b.turnIn > 0) b.turnIn -= dt;
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
  // Pop job: the balloon is fitted once (never truncated) against the crown band; see L.popFit.
  function popJob(s, opts, c) {
    var o = opts || {}, imp = o.important != null ? !!o.important : s.important, shout = imp || !!o.shout, kind = shout ? 'shout' : 'speech';
    var geo = L.popGeom(imp), fit = L.popFit(c || popCv.c, s.caps, { w: POP.boxW, name: s.tag, kind: kind, top: geo.top, band: geo.band, bottom: POP_H - 8 });
    return { s: s, important: imp, shout: shout, kind: kind, lines: fit.lines, px: fit.px, lh: fit.lh, h: fit.h, len: s.caps.length,
             T: 0, started: false, overflow: !fit.ok, overlap: fit.overlap, typeDur: s.caps.length / TYPE_CPS,
             holdDur: Math.max(2.2, 1.6 + 0.045 * s.caps.length) };
  }
  function popTimes(j) { var t1 = 0.28, t2 = t1 + j.typeDur, t3 = t2 + j.holdDur; return { t1: t1, t2: t2, t3: t3, t4: t3 + 0.25 }; }
  function popPose(j, tt, T, fx, sx) {
    if (T < tt.t1) { var sc = clamp(T / tt.t1, 0, 1); return { x: sx + (fx - sx) * easeOutBack(sc), a: 1, sc: sc }; }
    if (T >= tt.t3) { var o = clamp((T - tt.t3) / 0.25, 0, 1); return { x: fx + (sx - fx) * o, a: 1 - o * 0.6, sc: 1 }; }
    return { x: fx, a: 1, sc: 1 };
  }
  function popDraw(j) {
    var c = popCv.c, s = j.s, T = j.T, tt = popTimes(j), side = s.side === 'l' ? 'l' : 'r', geo = L.popGeom(j.important);
    var fx = side === 'l' ? 92 : POP_W - 92, sx = side === 'l' ? -90 : POP_W + 90, pose = popPose(j, tt, T, fx, sx);
    var typed = T > tt.t1 ? clamp((T - tt.t1) * TYPE_CPS, 0, j.len) : 0, talking = typed < j.len && T > tt.t1;
    c.clearRect(0, 0, POP_W, POP_H);
    c.save(); c.globalAlpha = pose.a;
    A.burst(c, pose.x, geo.base - geo.bh * 0.5, geo.bh * 0.62 * pose.sc, j.important ? '#FFD166' : '#FFF1A8', 9);
    A.bust(c, s.who || 'stranger', s.mood, pose.x, geo.base, geo.bh, { flip: side === 'r', talk: talking ? 0.5 + 0.5 * Math.sin(T * 16) : 0 });
    TX.balloon(c, { x: side === 'l' ? 164 : 14, y: geo.top, w: POP.boxW, h: j.h, tx: pose.x, ty: geo.base - geo.bh * 0.86,
                    kind: j.kind, name: s.tag, lines: TX.partial(j.lines, Math.floor(typed)), px: j.px, lh: j.lh });
    c.restore();
  }
  function popUpdate(dt) {
    var j = pops[0]; if (!j) { if (popCv) popCv.c.clearRect(0, 0, POP_W, POP_H); return; }
    // AUDIT-6 F6: one call-or-pop at a time in the top band. A pop waits (hidden, not advancing) while a call is open.
    if (calls.length) { if (popEl) popEl.style.display = 'none'; return; }
    if (!j.started) { j.started = true; sfx('comicPop', 60, j.s.who); }
    ensurePop(); popEl.style.display = '';
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
    var card = el('div', 'cm-call cm-compact' + (rec.blocking ? ' cm-block' : '') + (reduced() ? ' cm-reduce' : ' is-enter-from'), host());
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
    void card.offsetHeight; card.classList.remove('is-enter-from');   // entrance: from the offset state to rest (comic.css)
    sfx('phoneRing', 900, 'other');
  }
  // Bars: a number for the whole call, or an array with one value per line (dropping and recovering signal).
  function barsAt(rec, i) {
    var b = rec.bars;
    if (Array.isArray(b)) return b.length ? b[Math.min(i, b.length - 1)] : 4;
    return b == null ? 4 : b;
  }
  function setBars(rec) {
    var n = barsAt(rec, rec.li), kids = rec.barsEl.children, flick = n <= 1 && !reduced() && Math.floor(rec.T * 2) % 2 === 1;   // one bar blinks at 1 Hz; steady under Reduce motion
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
  // AUDIT-6 F6: the call is a strip directly under the HUD (its boss bar included), so it never covers the HUD or a boss.
  // The top band in play: under the HUD and the objective row (when shown). Null when neither is on screen.
  function topBand() {
    var hud = P.Speech && P.Speech.domRect ? P.Speech.domRect('#hud') : null;
    var obj = P.Speech && P.Speech.domRect ? P.Speech.domRect('.obj-row') : null;
    if (!hud && !obj) return null;
    var y = hud ? hud.y + hud.h : 0;
    if (obj && obj.y + obj.h > y) y = obj.y + obj.h;
    return y + 6;
  }
  function placeCall(rec) {
    var y = topBand();
    rec.el.style.top = (y == null ? 12 : y) + 'px';
  }
  function callUpdate(dt) {
    var rec = calls[0]; if (!rec) return;
    rec.T += dt; rec.staticOn = rec.T < rec.staticUntil; placeCall(rec);
    if (rec.phase === 'ring') {
      rec.el.classList.add('cm-ringing');
      if (!rec.ringed2 && rec.T >= 1.0) { rec.ringed2 = true; sfx('phoneRing', 900, 'other'); }
      if (rec.T >= 2.0) { rec.el.classList.remove('cm-ringing'); rec.phase = 'talk'; rec.li = 0; rec.T = 0; if (rec.lines.length) startLine(rec); else endCall(rec, false); }
    } else if (rec.phase === 'talk') { stepTalk(rec, dt); }
    else if (rec.phase === 'nosig' && rec.T >= 1.6) { rec.phase = 'out'; rec.T = 0; }   // the hold after a drop starts now
    if (rec.phase === 'out') leaveCall(rec);
    if (rec.phase === 'out' && rec.T >= OUT_HOLD) return finishCall(rec);
    drawCall(rec); setBars(rec);
    rec.timerEl.textContent = fmt(rec.T);
  }
  // Exit (T4 part 4): the card slides up and fades over --m-exit, ending as its hold closes (OUT_HOLD). Not under Reduce motion.
  function leaveCall(rec) {
    if (rec.leaving || reduced() || rec.T < OUT_HOLD - P.UIMotion.ms('--m-exit') / 1000) return;
    rec.leaving = true; rec.el.classList.add('is-leaving');
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
    A.bust(c, rec.who, callerTalks ? cur.mood : 'neutral', 290 + (rec.phase === 'ring' && !reduced() ? Math.sin(rec.T * 18) * 2 : 0), 150, 140,
           { alpha: callerTalks || !talk ? 1 : 0.7, talk: callerTalks ? 0.5 + 0.5 * Math.sin(rec.T * 16) : 0 });
    // Call static re-rolls 3 times a second (it was 20: a strobe over the whole call box); held still under Reduce flashing.
    if (rec.staticOn) A.static(c, AREA.w, 150, A.rng((P.Settings && P.Settings.reduceFlash) ? 0 : Math.floor(rec.T * 3)), 0.55);
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
    // AUDIT-6 F6: while a menu is up (cards, pause, settings, chest, down) pops and calls wait; their timers freeze.
    var held = !!(P.UI && P.UI.isOverlay && P.UI.isOverlay());
    pageUpdate(dt);
    if (!held) { popUpdate(dt); callUpdate(dt); }
    if (book || pops.length || calls.length) requestAnimationFrame(frame); else loopOn = false;
  }

  // ---------- language switch (D-051): the open page, pops and call re-resolve their lines in the new language ----------
  function relangBook() {
    var def = P.Story.pages[book.list[book.pi]], old = book.panels, cur = book.cur;
    if (!def || book.zoom) return;
    clearGrid();
    book.panels = def.panels.map(function (pd, i) {
      var p = makePanel(pd, L.panelRect(def.panels.length, i)), o = old[i];
      if (o && o.revealed) { p.revealed = true; p.el.classList.add('in'); p.done = !!o.done; p.T = o.done ? p.total : Math.min(o.T, p.total); }
      return p;
    });
    book.label.textContent = labelOf(def, book.pi);
    book.hint.textContent = P.t('cm.tap'); book.root.setAttribute('aria-label', P.t('cm.page.label'));
    if (book.panels[cur]) announce(book.panels[cur]);
  }
  C.relang = function () {
    if (!A.ready) return;
    pops = pops.map(function (j) {
      var s = j.src != null ? resolve(j.src, j.opts) : null, n;
      if (!s || !s.caps) return j;
      n = popJob(s, j.opts); n.src = j.src; n.opts = j.opts; n.T = j.T; n.started = j.started;
      return n;
    });
    calls.forEach(function (rec) {
      if (!rec.el) return;
      rec.nameEl.textContent = P.upper(P.t('spk.' + rec.who)); rec.nosigEl.textContent = P.t('cm.nosig');
      if (rec.phase === 'talk' && rec.cur) { var lt = rec.LT; startLine(rec); rec.LT = Math.min(lt, rec.typeDur + rec.holdDur - 0.01); }
    });
    if (book) relangBook();
  };

  // ---------- public API ----------
  // ids: one page id or an array (played in order). onDone(skipped) runs when the last page closes.
  C.page = function (ids, onDone) {
    var list = [].concat(ids || []).filter(function (id) { return P.Story && P.Story.pages[id]; });
    if (!list.length) { if (onDone) onDone(false); return; }
    if (!A.ready) { A.whenReady(function () { C.page(ids, onDone); }); return; }
    if (book) { bookQueue.push({ list: list, onDone: onDone }); return; }
    openBook(list, onDone);
  };
  // line: a beat id (P.Dialogue) or {who, mood, side, text|key, important}. opts: {mood, side, important, shout}.
  C.pop = function (line, opts) {
    if (!A.ready) { A.whenReady(function () { C.pop(line, opts); }); return; }
    var s = resolve(line, opts);
    if (!s || !s.caps) return;
    if (pops.length >= 4) pops.splice(1, 1);
    ensurePop();
    var j = popJob(s, opts); j.src = line; j.opts = opts;
    pops.push(j);
    kick();
  };
  // who: caller portrait id; lineIds: beat ids. opts: {bars: n | [n per line], blocking, mood}.
  C.call = function (who, lineIds, onDone, opts) {
    var o = opts || {};
    var rec = { who: who, lines: (lineIds || []).filter(function (id) { return P.Dialogue.has(id); }), onDone: onDone,
                bars: o.bars == null ? 4 : o.bars, blocking: !!o.blocking, phase: 'ring', T: 0, LT: 0, li: 0,
                staticUntil: 0, staticOn: false, ringed2: false, typeDur: 0, holdDur: 0, len: 0, cur: null };
    calls.push(rec);
    if (calls.length === 1) callCard(rec);
    kick();
  };
  C.clearPops = function () { pops = []; if (popCv) popCv.c.clearRect(0, 0, POP_W, POP_H); if (popEl) popEl.style.display = 'none'; };
  // v0.7: story pops no longer slow the game (the slow-mo had no visible cause). Kept so main.js can call it.
  C.timeScale = function () { return 1; };
  // Arbiter provider (speech.js): the pop and the call card are fixed obstacles; other bubbles go around them.
  C.speechOffers = function () {
    var r;
    if (P.UI && P.UI.isOverlay && P.UI.isOverlay()) return;   // menus own the screen: nothing is offered (AUDIT-6 F6)
    if (pops.length && pops[0].started && popEl && !calls.length) {
      // The balloon sits under the HUD: the streak meter can add a row, so the top follows the HUD's bottom edge.
      var band = topBand();
      popEl.style.top = Math.max(POP_TOP, band == null ? 0 : band) + 'px';
      r = P.Speech.domRect('.cm-pop');
      if (r) P.Speech.offer({ id: 'pop', kind: 'pop', prio: P.Speech.PRIO.pop, fixed: true, rect: r });
    }
    if (calls.length && calls[0].el) {
      r = P.Speech.domRect('.cm-call');
      if (r) P.Speech.offer({ id: 'call', kind: 'pop', prio: P.Speech.PRIO.pop, fixed: true, rect: r });
    }
  };
  if (P.Speech) P.Speech.provider(C.speechOffers);
  C.active = function () { return !!(book || pops.length || calls.length); };
  // Dev audit: every page panel, pop and call line in the current language (needs fonts ready; see comic-layout.js).
  C.audit = function () { return L.audit(); };
  return C;
})();
