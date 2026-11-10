// Panel layout and fit audit (workstream D, v0.5 text-fit rewrite; split from comic.js). A panel stacks its captions
// first (top), then its balloons, SFX and paper letters, in script order, at ONE type size. The search never
// ellipsizes. In order: (1) type steps 18 -> 15 px at full busts, normal balloons; (2) balloons widen; (3) busts
// shrink at 15 px; (4) hard minimum 14 -> 12 px at the smallest busts; (5) last resort: balloons may cover the busts'
// heads (flagged as overlap). A panel that still does not fit is flagged as overflow (the audit fails it).
// The audit (L.audit) lays out every page panel, pop and call line the way the game does, then draws each line with
// the loaded font and checks its ink against the text box, the body outline and the panel. Barks use L.checkBox too.
P.ComicLayout = (function () {
  var L = {}, A = P.ComicArt, T = P.ComicText;
  var AREA = { x: 12, y: 64, w: 366, h: 704 }, GAP = 6, TOP = 14, CPS = 42, TAG_UP = 8, MIN_BW = 96, TAIL_HALF = 14;
  var POP = { w: 390, h: 300, boxW: 212, top: 22 };
  var LAYOUTS = {
    1: [[0, 0, 1, 1]],
    2: [[0, 0, 1, 0.5], [0, 0.5, 1, 0.5]],
    3: [[0, 0, 1, 0.46], [0, 0.46, 0.5, 0.54], [0.5, 0.46, 0.5, 0.54]],
    4: [[0, 0, 1, 0.34], [0, 0.34, 0.5, 0.33], [0.5, 0.34, 0.5, 0.33], [0, 0.67, 1, 0.33]],
    5: [[0, 0, 1, 0.3], [0, 0.3, 0.5, 0.35], [0.5, 0.3, 0.5, 0.35], [0, 0.65, 0.5, 0.35], [0.5, 0.65, 0.5, 0.35]]
  };
  var BUST_STEPS = [1, 0.85, 0.72, 0.6, 0.5, 0.42, 0.35], PX_ALL = [18, 17, 16, 15, 14, 13, 12];
  // The search plan, tried in order until one attempt fits (see the header comment).
  var PLAN = (function () {
    var plan = [];
    [false, true].forEach(function (wide) { [18, 17, 16, 15].forEach(function (px) { plan.push({ bust: 1, wide: wide, px: px }); }); });
    BUST_STEPS.slice(1).forEach(function (b) { plan.push({ bust: b, wide: true, px: 15 }); });
    [14, 13, 12].forEach(function (px) { BUST_STEPS.slice(3).forEach(function (b) { plan.push({ bust: b, wide: true, px: px }); }); });
    plan.push({ bust: BUST_STEPS[BUST_STEPS.length - 1], wide: true, px: 12, overlap: true });
    return plan;
  })();
  L.AREA = AREA; L.CPS = CPS; L.POP = POP;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function norm(s) { return String(s).replace(/\s+/g, ''); }

  // src: a beat id (P.Dialogue) or {who, mood, side, text | key, important}. Returns {who, mood, side, important, text, caps, tag, speaker}.
  L.resolve = function (src, opts) {
    var o = opts || {}, s, line, pr;
    if (typeof src === 'string') {
      line = P.Dialogue.get(src);
      if (!line) return null; pr = (P.Story && P.Story.forLine && P.Story.forLine(src)) || {};
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
  };

  // ---------- page geometry ----------
  L.panelRect = function (n, i) {
    var f = LAYOUTS[clamp(n, 1, 5)][i], g = 6;
    return { x: AREA.x + f[0] * AREA.w + g, y: AREA.y + f[1] * AREA.h + g, w: f[2] * AREA.w - 2 * g, h: f[3] * AREA.h - 2 * g };
  };
  // Busts: ch = [who, mood, x (0..1), flip, scale]. Base sits near the bottom; k scales them (crowns drop).
  function layoutBusts(p, k) {
    // AUDIT-6 F10: a single-panel page (the whole page) draws its busts 30% larger, so the page is not half empty.
    // The layout search still steps them down when the balloons need the room.
    var fill = p.h > AREA.h * 0.9 ? 1.3 : 1;
    p.busts = (p.data.ch || []).map(function (ch) {
      return { who: ch[0], mood: ch[1] || 'neutral', x: clamp(ch[2], 0, 1) * p.w, base: p.h * 0.97,
               h: Math.min(p.h * 0.92, p.h * (ch[4] || 0.6) * k * fill), flip: !!ch[3] };
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

  // ---------- items ----------
  // Each item: {kind, bottom (0 when not stacked), ...}. g = {px, wide, band}; y is the stack cursor.
  // R1-T0: a balloon never sits across the tail of a balloon above it. `avoid` holds the x spans of those tails; the
  // balloon takes the free span on its own side, or the other side when its own is too narrow. Returns {x, w}.
  function placeBubble(avoid, side, bw, W, need) {
    var m = W * 0.03, lo = m, hi = W - m, floor = Math.max(need, MIN_BW);
    (avoid || []).forEach(function (a) {
      var bx = side === 'l' ? lo : Math.max(lo, hi - bw);
      if (bx >= a.x1 || bx + Math.min(bw, hi - lo) <= a.x0) return;
      var left = [lo, a.x0 - 2], right = [a.x1 + 2, hi];
      var order = side === 'l' ? [left, right] : [right, left];
      for (var i = 0; i < order.length; i++) {
        if (order[i][1] - order[i][0] >= floor) { lo = order[i][0]; hi = order[i][1]; return; }
      }
    });
    bw = Math.min(bw, hi - lo);
    return { x: side === 'l' ? lo : hi - bw, w: bw };
  }
  function bubbleItem(p, d, g, y) {
    var s = L.resolve(d[1]); if (!s) return null;
    var k = d[0] === 's' ? 'shout' : d[0] === 't' ? 'thought' : 'speech', side = d[2] || s.side;
    var bw = p.w < 220 ? p.w * 0.8 : Math.min(p.w * (g.wide ? 0.8 : 0.62), g.wide ? 300 : 240);
    // AUDIT-6 F10: words never break. A balloon too narrow for its longest word widens to fit it (up to the panel).
    var ins = T.insets(k, s.tag).x, need = T.longest(p.c, s.caps, 'speech', g.px) + 2 * ins;
    if (need > bw) bw = Math.min(p.w * 0.96, need);
    if (s.tag && y > TOP) y += TAG_UP;           // the name tag hangs 11 px above the balloon: keep it off the item above
    var pl = placeBubble(g.avoid, side, bw, p.w, need); bw = pl.w;
    var f = T.measure(p.c, s.caps, bw - 2 * ins, 'speech', g.px), h = T.boxH(f.lines, f.lh, s.tag, k);
    var bx = pl.x, bust = bustFor(p, s.who);
    var tx = bust ? bust.x : p.w / 2, ty = bust ? bust.base - bust.h * 0.86 : p.h * 0.9;
    return { kind: 'bubble', shape: k, who: s.who, caps: s.caps, len: s.caps.length, lines: f.lines, px: f.px, lh: f.lh,
             x: bx, y: y, w: bw, h: h, tx: tx, ty: ty, name: s.tag, dur: s.caps.length / CPS, bottom: y + h };
  }
  function captionItem(p, d, g, y) {
    var s = L.resolve(d[1]); if (!s) return null;
    var cw = p.w * 0.92, f = T.measure(p.c, s.caps, cw - 2 * T.insets('caption').x, 'speech', g.px);
    var h = T.boxH(f.lines, f.lh, false, 'caption');
    return { kind: 'caption', caps: s.caps, len: s.caps.length, lines: f.lines, px: f.px, lh: f.lh,
             x: p.w * 0.04, y: y, w: cw, h: h, dur: s.caps.length / CPS, bottom: y + h };
  }
  // SFX lettering shrinks until it is at most 90% of the panel width (one line, not stacked).
  function sfxItem(p, d) {
    var txt = P.upper(P.t('cm.sfx.' + d[1])), size = Math.min(p.w * 0.2, 60);
    A.setFont(p.c, 'title', size);
    while (size > 14 && p.c.measureText(txt).width > p.w * 0.9) { size -= 2; A.setFont(p.c, 'title', size); }
    return { kind: 'sfx', text: txt, x: d[2] * p.w, y: d[3] * p.h, rot: d[4] || 0, fill: d[5] === 'red' ? '#FF7A5C' : '#FFD166',
             size: size, dur: 0.3, bottom: 0 };
  }
  function letterItem(p, d, g, y) {
    var W = p.w, lw = W * 0.88, px = Math.min(g.px, 17);
    var text = d[1].filter(function (id) { return P.Dialogue.has(id); }).map(function (id) { return P.Dialogue.text(id); }).join(' ');
    var f = T.measure(p.c, text, lw - 2 * T.insets('letter').x, 'hand', px), h = T.boxH(f.lines, f.lh, false, 'letter');
    return { kind: 'letter', caps: text, lines: f.lines, px: f.px, lh: f.lh, x: W * 0.06, y: y + 6, w: lw, rot: -1.2,
             dur: 0.5, len: 0, bottom: y + 6 + h };
  }
  function layoutItem(p, d, g, y) {
    var k = d[0];
    if (k === 'b' || k === 's' || k === 't') return bubbleItem(p, d, g, y);
    if (k === 'c') return captionItem(p, d, g, y);
    if (k === 'x') return sfxItem(p, d);
    if (k === 'p') return { kind: 'bars', n: d[1], x: p.w - 40, y: p.h - 14, dur: 0, bottom: 0 };
    if (k === 'l') return letterItem(p, d, g, y);
    return null;
  }
  // Start times follow the script order, so the reveal reads in order even though captions are stacked first.
  function timeline(items) {
    var t = 0.35;
    items.slice().sort(function (a, b) { return a.src - b.src; }).forEach(function (it) {
      if (it.kind === 'bars') { it.start = 0; return; }
      it.start = t; t = it.start + it.dur + 0.22;
    });
    return t;
  }
  // One stacking pass at size g.px. Captions first, then the rest in script order.
  // The x span a balloon's tail occupies on its way down to the speaker (base on the balloon edge to the tip).
  function tailSpan(it, half) {
    var base = clamp(it.tx, it.x + 24, it.x + it.w - 24);
    return { x0: Math.min(base, it.tx) - half, x1: Math.max(base, it.tx) + half };
  }
  function hasTailBelow(it) { return it.kind === 'bubble' && it.tx != null && it.ty > it.bottom; }
  function stack(p, defs, g0) {
    var order = defs.map(function (d, i) { return i; }), items = [], ok = true, y = TOP, it;
    var g = { px: g0.px, wide: g0.wide, band: g0.band, avoid: [] };
    order.sort(function (a, b) { return (defs[a][0] === 'c' ? 0 : 1) - (defs[b][0] === 'c' ? 0 : 1) || a - b; });
    order.forEach(function (i) {
      it = layoutItem(p, defs[i], g, y);
      if (!it) return;
      it.src = i; items.push(it);
      if (hasTailBelow(it)) g.avoid.push(tailSpan(it, TAIL_HALF));
      if (it.bottom > 0) {
        y = it.bottom + GAP;
        if (it.bottom > g.band || it.bottom > p.h - GAP) ok = false;
      }
    });
    return { ok: ok, items: items, total: timeline(items), px: g.px };
  }
  // Runs the plan. Sets p.items, p.total, p.px, p.busts, and the flags p.overlap / p.overflow.
  function layoutPanel(p) {
    var defs = p.data.it || [], res = null, last = null, chosen = null, i, a, r;
    for (i = 0; i < PLAN.length && !res; i++) {
      a = PLAN[i]; layoutBusts(p, a.bust);
      r = stack(p, defs, { px: a.px, wide: a.wide, band: a.overlap ? p.h - GAP : textBand(p) });
      r.overlap = !!a.overlap; last = r; chosen = a;
      if (r.ok) res = r;
    }
    res = res || last;
    layoutBusts(p, chosen.bust);
    p.items = res.items; p.total = res.total; p.px = res.px;
    p.overlap = res.overlap; p.overflow = !res.ok;
    p.T = 0; p.done = false; p.revealed = false;
    return p;
  }
  L.layoutPanel = layoutPanel;

  // ---------- pops (non-blocking bust pop-ins) ----------
  // Pop geometry: the balloon hangs from the top edge; the bust's crown limits how low it may reach.
  L.popGeom = function (important) {
    var bh = important ? 150 : 138, base = POP.h - 8, headTop = base - bh * 0.96;
    return { bh: bh, base: base, top: POP.top, headTop: headTop, band: headTop - 8 };
  };
  // Largest size whose balloon fits above the crown; else it may cover the bust (down to the canvas bottom).
  // o = {w, name, kind, top, band, bottom}. Returns {lines, px, lh, h, ok, overlap}. Never truncates.
  L.popFit = function (c, caps, o) {
    var i, f, pass, bottoms = [o.band, o.bottom];
    for (pass = 0; pass < 2; pass++) {
      for (i = 0; i < PX_ALL.length; i++) {
        f = T.measure(c, caps, o.w - 2 * T.insets(o.kind, o.name).x, 'speech', PX_ALL[i]);
        f.h = T.boxH(f.lines, f.lh, o.name, o.kind);
        if (o.top + f.h <= bottoms[pass]) return { lines: f.lines, px: f.px, lh: f.lh, h: f.h, ok: true, overlap: pass === 1 };
      }
    }
    return { lines: f.lines, px: f.px, lh: f.lh, h: f.h, ok: false, overlap: true };
  };

  // ---------- audit: ink checks ----------
  var inkCv = null, inkC = null, INK_W = 480, INK_H = 64, OX = 20, OY = 12, mCv = null;
  function measureCtx() { if (!mCv) mCv = document.createElement('canvas').getContext('2d'); return mCv; }
  // Draws one line exactly as the lettering does (same font string, top baseline) and returns its ink box relative
  // to the pen origin, plus the advance. The ink is what a reader sees, so this is the real test.
  function inkOf(font, text) {
    var c, d, x, y, x0 = INK_W, x1 = -1, y0 = INK_H, y1 = -1;
    if (!inkCv) { inkCv = document.createElement('canvas'); inkCv.width = INK_W; inkCv.height = INK_H; inkC = inkCv.getContext('2d', { willReadFrequently: true }); }
    c = inkC; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, INK_W, INK_H);
    c.font = font; c.textBaseline = 'top'; c.textAlign = 'left'; c.fillStyle = '#000';
    c.fillText(text, OX, OY);
    d = c.getImageData(0, 0, INK_W, INK_H).data;
    for (y = 0; y < INK_H; y++) for (x = 0; x < INK_W; x++) {
      if (d[(y * INK_W + x) * 4 + 3] > 80) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    var adv = c.measureText(text).width;
    if (x1 < 0) return { blank: true, adv: adv };
    return { blank: false, adv: adv, l: x0 - OX, r: x1 + 1 - OX, t: y0 - OY, b: y1 + 1 - OY, edge: x0 === 0 || x1 === INK_W - 1 };
  }
  function emptyRep() { return { lines: 0, inkOut: 0, bodyOut: 0, boxOut: 0, trunc: 0, drift: 0, tagOut: 0, tailOut: 0, stackOut: 0 }; }
  // R1-T0: no balloon sits across the tail of a balloon above it, and a name tag never hangs on the item above it.
  function checkStack(p, sum) {
    var bubs = p.items.filter(function (it) { return it.kind === 'bubble'; }), boxes = p.items.filter(function (it) { return it.bottom > 0; });
    bubs.forEach(function (a) {
      if (!hasTailBelow(a)) return;
      var sp = tailSpan(a, 8);
      bubs.forEach(function (b) { if (b !== a && b.y >= a.bottom - 1 && b.y < a.ty && b.x < sp.x1 && b.x + b.w > sp.x0) sum.tailOut++; });
    });
    boxes.forEach(function (b) {
      if (!b.name) return;
      boxes.forEach(function (a) { if (a !== b && a.bottom <= b.y + 1 && b.y - 11 < a.bottom - 0.5 && a.bottom > 0 && b.y - a.bottom < 11) sum.stackOut++; });
    });
  }
  // Checks one balloon, caption or letter. o = {kind, x, y, w, h, name, lines, px, lh, fk ('speech'|'hand'), caps, tx, ty}.
  // bounds = {w, h}: the canvas or panel the box must sit in. Returns a report of counts (all zero = fits).
  L.checkBox = function (o, bounds) {
    var rep = emptyRep(), font = A.font(o.fk || 'speech', o.px), inner = T.textBox(o.kind, o.x, o.y, o.w, o.h, o.name);
    var body = T.body(o.kind, o.x, o.y, o.w, o.h), mc = measureCtx(), joined = o.lines.join(' ');
    o.lines.forEach(function (ln, i) {
      var X = inner.x, Y = inner.y + i * o.lh, m = inkOf(font, ln);
      rep.lines++;
      if (m.blank) return;
      // Horizontal: inside the text box. Vertical: inside the body (accents may rise above the box, not out of the balloon).
      if (X + m.l < inner.x - 1.5 || X + m.r > inner.x + inner.w + 1.5 || Y + m.t < body.y + 1 || Y + m.b > body.y + body.h - 1) rep.inkOut++;
      if (m.edge) rep.inkOut++;
      if ((m.r - m.l) > m.adv + 2) rep.drift = Math.max(rep.drift, (m.r - m.l) - m.adv);
    });
    [[inner.x, inner.y], [inner.x + inner.w, inner.y], [inner.x, inner.y + inner.h], [inner.x + inner.w, inner.y + inner.h]]
      .forEach(function (pt) { if (!T.inBody(body, pt[0], pt[1])) rep.bodyOut = 1; });
    if (o.x < -0.5 || o.y < -0.5 || o.x + o.w > bounds.w + 0.5 || o.y + o.h > bounds.h + 0.5) rep.boxOut++;
    if (o.name && o.y - 11 < -0.5) rep.boxOut++;
    if (o.tx != null && (o.tx < 0 || o.tx > bounds.w || o.ty < 0 || o.ty > bounds.h)) rep.boxOut++;
    if (joined.indexOf('…') >= 0 || norm(joined) !== norm(o.caps || '')) rep.trunc++;
    if (o.name && !T.tagFits(mc, o.name, o.w - 20)) rep.tagOut++;
    return rep;
  };
  function addRep(sum, r) {
    Object.keys(r).forEach(function (k) { sum[k] = k === 'drift' ? Math.max(sum[k] || 0, r[k]) : (sum[k] || 0) + r[k]; });
    return sum;
  }
  // Checks every item of a laid-out panel (bubbles, captions, letters; SFX must sit inside the panel width).
  function checkPanel(p) {
    var sum = emptyRep(), bounds = { w: p.w, h: p.h }, mc = measureCtx();
    checkStack(p, sum);
    p.items.forEach(function (it) {
      var o, r, w;
      if (it.kind === 'bubble' || it.kind === 'caption' || it.kind === 'letter') {
        o = { kind: it.kind === 'letter' ? 'letter' : it.kind === 'caption' ? 'caption' : it.shape, x: it.x, y: it.y, w: it.w,
              h: it.kind === 'letter' ? T.boxH(it.lines, it.lh, false, 'letter') : it.h, name: it.name || false,
              lines: it.lines, px: it.px, lh: it.lh, fk: it.kind === 'letter' ? 'hand' : 'speech', caps: it.caps,
              tx: it.tx, ty: it.ty };
        r = L.checkBox(o, bounds); addRep(sum, r);
      } else if (it.kind === 'sfx') {
        A.setFont(mc, 'title', it.size); w = mc.measureText(it.text).width;
        if (it.x - w / 2 < 0 || it.x + w / 2 > p.w) sum.boxOut++;
      }
    });
    return sum;
  }
  // Pops: the balloon the game would draw for a pop line (side from the line, size from the crown band).
  function popRow(c, id, out) {
    var s = L.resolve(id), imp, geo, fit, kind, side, box;
    if (!s || !s.caps) return;
    imp = /^H\d+b$/.test(id); if (!imp) imp = s.important;
    kind = imp ? 'shout' : 'speech';
    geo = L.popGeom(imp);
    fit = L.popFit(c, s.caps, { w: POP.boxW, name: s.tag, kind: kind, top: geo.top, band: geo.band, bottom: POP.h - 8 });
    side = s.side === 'l' ? 'l' : 'r';
    box = { kind: kind, x: side === 'l' ? 164 : 14, y: geo.top, w: POP.boxW, h: fit.h, name: s.tag, lines: fit.lines, px: fit.px,
            lh: fit.lh, caps: s.caps };
    var rep = L.checkBox(box, { w: POP.w, h: POP.h });
    if (!fit.ok) rep.boxOut++;
    out.push(rowOf('pop', id, fit.px, rep, fit.overlap, !fit.ok));
  }
  function rowOf(kind, id, px, rep, overlap, overflow) {
    var fail = rep.inkOut + rep.bodyOut + rep.boxOut + rep.trunc + rep.tagOut + rep.tailOut + rep.stackOut + (overflow ? 1 : 0) > 0;
    return { kind: kind, id: id, px: px, overlap: !!overlap, overflow: !!overflow, inkOut: rep.inkOut, bodyOut: rep.bodyOut,
             boxOut: rep.boxOut, trunc: rep.trunc, tagOut: rep.tagOut, tailOut: rep.tailOut, stackOut: rep.stackOut,
             drift: rep.drift, lines: rep.lines, fail: fail, cut: fail };
  }
  // Every beat's pop and call line (same list the game plays).
  function beatLines() {
    var seen = {}, out = [], n, w, b;
    for (n = 1; n <= P.Journey.count(); n++) {
      ['start', 'mid', 'boss'].forEach(function (when) {
        b = P.Story.beat(n, when);
        if (!b) return;
        var ids = b.kind === 'pop' ? [b.line] : b.kind === 'call' ? b.lines : [];
        ids.forEach(function (id) { if (!seen[id]) { seen[id] = 1; out.push({ id: id, kind: b.kind }); } });
      });
    }
    return out;
  }
  // Dev audit (sync; needs P.ComicArt.ready). Rows per page panel, pop and call line in the current language.
  // A row fails when any line is outside its box or the panel, a body corner is outside its outline, a line is
  // truncated, or the panel overflows. overlap is a warning: balloons cover a bust's head (kept, but counted).
  L.audit = function () {
    if (!A.ready) throw new Error('comic fonts not ready: call P.ComicArt.whenReady first');
    var m = measureCtx(), rows = [];
    Object.keys(P.Story.pages).sort().forEach(function (id) {
      var def = P.Story.pages[id];
      def.panels.forEach(function (pd, i) {
        var r = L.panelRect(def.panels.length, i), p = { w: r.w, h: r.h, c: m, data: pd };
        layoutPanel(p);
        rows.push(rowOf('page', id + ' #' + (i + 1), p.px, checkPanel(p), p.overlap, p.overflow));
      });
    });
    beatLines().forEach(function (e) {
      if (e.kind === 'pop') { popRow(m, e.id, rows); return; }
      var s = L.resolve(e.id), f = T.measure(m, s.caps, 342, 'speech', 14), n = f.lines.length;
      rows.push({ kind: 'call', id: e.id, px: 14, overlap: false, overflow: false, inkOut: 0, bodyOut: 0, boxOut: 0, trunc: 0,
                  tagOut: 0, drift: 0, lines: n, fail: false, cut: false, warn: n > 4 });
    });
    return rows;
  };
  // Summary of L.audit rows: counts for the report.
  L.summary = function (rows) {
    var s = { rows: rows.length, fail: 0, overlap: 0, overflow: 0, page: 0, pop: 0, call: 0, minPx: 99, px: {} };
    rows.forEach(function (r) {
      if (r.fail) s.fail++;
      if (r.overlap) s.overlap++;
      if (r.overflow) s.overflow++;
      s[r.kind] = (s[r.kind] || 0) + 1;
      if (r.kind !== 'call') { s.minPx = Math.min(s.minPx, r.px); s.px[r.px] = (s.px[r.px] || 0) + 1; }
    });
    return s;
  };
  return L;
})();
