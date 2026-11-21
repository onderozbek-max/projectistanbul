// The panel geometry determines portrait sizes. Text fits above the portraits using wider balloons or a smaller font.
// When the text needs more room, each tap reveals the next group of lines in the same panel.
// The audit (L.audit) lays out every page panel, pop and call line the way the game does, then draws each line with
// the loaded font and checks its ink against the text box, the body outline and the panel. Barks use L.checkBox too.
// Stacking keeps every name tag clear of the item above, and narrows a balloon that a tail from above would cross.
// SFX lettering is placed last: inside the panel and clear of every balloon body (it shrinks to fit).
// The type size never passes the largest size at which the longest word of an item still fits its widest box (pxCap).
P.ComicLayout = (function () {
  var L = {}, A = P.ComicArt, T = P.ComicText;
  var AREA = { x: 12, y: 64, w: 366, h: 704 }, GAP = 6, TOP = 14, CPS = 42, MIN_BW = 96;
  var POP = { w: 390, h: 300, boxW: 212, top: 22 };
  var LAYOUTS = {
    actionFirst: [[0,0,1,.5],[0,.5,.5,.25],[.5,.5,.5,.25],[0,.75,1,.25]],
    1: [[0, 0, 1, 1]],
    2: [[0, 0, 1, 0.5], [0, 0.5, 1, 0.5]],
    3: [[0, 0, 1, 0.46], [0, 0.46, 0.5, 0.54], [0.5, 0.46, 0.5, 0.54]],
    4: [[0, 0, 1, 0.34], [0, 0.34, 0.5, 0.33], [0.5, 0.34, 0.5, 0.33], [0, 0.67, 1, 0.33]],
    5: [[0, 0, 1, 0.3], [0, 0.3, 0.5, 0.35], [0.5, 0.3, 0.5, 0.35], [0, 0.65, 0.5, 0.35], [0.5, 0.65, 0.5, 0.35]],
    conversation: [[0, 0, 1, 0.24], [0, 0.24, 0.5, 0.43], [0.5, 0.24, 0.5, 0.43], [0, 0.67, 1, 0.33]]
  };
  var PX_ALL = [18, 17, 16, 15, 14, 13, 12], BALLOON_WIDTHS = [false, true, 'max'];
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
            text: src.text != null ? src.text : P.t(src.key), speaker: src.speaker != null ? src.speaker : (src.who ? P.t('spk.' + src.who) : '') };
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
  L.panelRect = function (n, i, layout) {
    var f = (LAYOUTS[layout] || LAYOUTS[clamp(n, 1, 5)])[i], g = 6;
    return { x: AREA.x + f[0] * AREA.w + g, y: AREA.y + f[1] * AREA.h + g, w: f[2] * AREA.w - 2 * g, h: f[3] * AREA.h - 2 * g };
  };
  // Busts: ch = [who, mood, x (0..1), flip, scale]. Base sits near the bottom of the frame.
  function layoutBusts(p) {
    // AUDIT-6 F10: a single-panel page (the whole page) draws its busts 30% larger, so the page is not half empty.
    var fill = p.h > AREA.h * 0.9 ? 1.3 : 1;
    p.busts = (p.data.ch || []).map(function (ch) {
      return { who: ch[0], mood: ch[1] || 'neutral', x: clamp(ch[2], 0, 1) * p.w, base: p.h * 0.97,
               h: Math.min(p.w * 0.76, p.h * 0.92, p.h * (ch[4] || 0.6) * 0.72 * fill), flip: !!ch[3] };
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
  // Each item: {kind, bottom (0 when not stacked), ...}. g = {px, wide, band, tails}; y is the stack cursor.
  // A name tag rises T.tagUp above its balloon, so a named balloon's box starts that far below the cursor: the tag sits
  // in the gap under the item above and never covers it. The first item of a panel keeps its tag on the panel.
  function boxTop(s, y) { return s.tag && y > TOP ? y + T.tagUp : y; }
  function balloonAt(p, s, k, side, bw, px, top) {
    var f = T.measure(p.c, s.caps, bw - 2 * T.insets(k, s.tag).x, 'speech', px);
    return { x: side === 'l' ? p.w * 0.03 : p.w - bw - p.w * 0.03, y: top, w: bw, h: T.boxH(f.lines, f.lh, s.tag, k), f: f };
  }
  // The corridor a balloon's tail sweeps when it points down at a bust below (the geometry of ComicText's tailPath).
  // Null for thoughts, for tails that point up or sideways, and for a balloon with no bust.
  function tailCorridor(o) {
    var cx = o.x + o.w / 2, cy = o.y + o.h / 2, dx = o.tx - cx, dy = o.ty - cy, bx;
    if (o.tx == null || o.shape === 'thought' || dy <= 0 || Math.abs(dx) * o.h > Math.abs(dy) * o.w) return null;
    bx = clamp(o.tx, o.x + 24, o.x + o.w - 24);
    return { bx: bx, tx: o.tx, y0: o.y + o.h, y1: o.ty, who: o.who };
  }
  // The x span tail t covers between heights ya and yb: its edges are straight lines from the base (14 px either side of bx)
  // to the tip, so a box beside the tail only has to clear the tail where the two overlap. 3 px margin.
  function tailSpan(t, ya, yb) {
    var fa = (ya - t.y0) / (t.y1 - t.y0), fb = (yb - t.y0) / (t.y1 - t.y0);
    var lA = t.bx - 14 + (t.tx - t.bx + 14) * fa, lB = t.bx - 14 + (t.tx - t.bx + 14) * fb;
    var rA = t.bx + 14 + (t.tx - t.bx - 14) * fa, rB = t.bx + 14 + (t.tx - t.bx - 14) * fb;
    return { x0: Math.min(lA, lB) - 3, x1: Math.max(rA, rB) + 3 };
  }
  // Box a: the balloon from the stack cursor y (its name tag included) down to its bottom.
  function reach(b, y) { return { x: b.x, y: y, w: b.w, h: b.y + b.h - y }; }
  function tailHits(t, a) {
    var ya = Math.max(a.y, t.y0), yb = Math.min(a.y + a.h, t.y1), s;
    if (yb <= ya) return false;
    s = tailSpan(t, ya, yb);
    return a.x < s.x1 && a.x + a.w > s.x0;
  }
  // The first tail of ANOTHER speaker that crosses box a. A tail of the same speaker still points at the right person.
  function firstClash(tails, a, who) {
    for (var i = 0; i < tails.length; i++) if (tails[i].who !== who && tailHits(tails[i], a)) return tails[i];
    return null;
  }
  // Width a balloon on this side may keep once tail t sweeps through its room: it gives up the tail's side.
  function roomBeside(p, side, t, a) {
    var ya = Math.max(a.y, t.y0), yb = Math.min(a.y + a.h, t.y1), s = tailSpan(t, ya, yb);
    return side === 'l' ? s.x0 - p.w * 0.03 : p.w * 0.97 - s.x1;
  }
  // One balloon on one side. A strict attempt narrows it clear of the tails above (not below MIN_BW or its longest word).
  // Returns the balloon; clear is false when a tail of another speaker still crosses it.
  function fitSide(p, s, k, side, bw, need, g, y, top) {
    var b = balloonAt(p, s, k, side, bw, g.px, top), r, n;
    for (n = 0; (r = firstClash(g.tails, reach(b, y), s.who)) && n < 4; n++) {
      bw = Math.min(bw, roomBeside(p, side, r, reach(b, y)));
      if (bw < Math.max(need, MIN_BW)) break;
      b = balloonAt(p, s, k, side, bw, g.px, top);
    }
    b.clear = !firstClash(g.tails, reach(b, y), s.who);
    return b;
  }
  function bubbleItem(p, d, g, y) {
    var s = L.resolve(d[1]); if (!s) return null;
    var k = d[0] === 's' ? 'shout' : d[0] === 't' ? 'thought' : 'speech', side = d[2] || s.side;
    var bw = g.wide === 'max' ? p.w * 0.96 : p.w < 220 ? p.w * 0.8 : Math.min(p.w * (g.wide ? 0.8 : 0.62), g.wide ? 300 : 240);
    // AUDIT-6 F10: words never break. A balloon too narrow for its longest word widens to fit it (up to the panel).
    var need = T.longest(p.c, s.caps, 'speech', g.px) + 2 * T.insets(k, s.tag).x, top = boxTop(s, y), b, alt;
    if (need > bw) bw = Math.min(p.w * 0.96, need);
    // Try the other side if a tail crosses the balloon's preferred position.
    b = fitSide(p, s, k, side, bw, need, g, y, top);
    if (!b.clear) {
      alt = fitSide(p, s, k, side === 'l' ? 'r' : 'l', bw, need, g, y, top);
      if (alt.clear) b = alt;
    }
    var bust = bustFor(p, s.who), tx = bust ? bust.x : p.w / 2, ty = bust ? bust.base - bust.h * 0.86 : p.h * 0.9;
    return { kind: 'bubble', shape: k, who: s.who, caps: s.caps, len: s.caps.length, lines: b.f.lines, px: b.f.px, lh: b.f.lh,
             x: b.x, y: top, w: b.w, h: b.h, tx: tx, ty: ty, name: s.tag, dur: s.caps.length / CPS, bottom: top + b.h,
             blocked: !b.clear };
  }
  function captionItem(p, d, g, y) {
    var s = L.resolve(d[1]); if (!s) return null;
    var cw = p.w * 0.92, f = T.measure(p.c, s.caps, cw - 2 * T.insets('caption').x, 'speech', g.px);
    var h = T.boxH(f.lines, f.lh, false, 'caption');
    return { kind: 'caption', caps: s.caps, len: s.caps.length, lines: f.lines, px: f.px, lh: f.lh,
             x: p.w * 0.04, y: y, w: cw, h: h, dur: s.caps.length / CPS, bottom: y + h };
  }
  // SFX lettering: text and colour now; placeSfx sets its size and position once the balloons are stacked (not stacked).
  function sfxItem(p, d) {
    return { kind: 'sfx', text: P.upper(P.t('cm.sfx.' + d[1])), fx: d[2], fy: d[3], rot: d[4] || 0,
             fill: d[5] === 'red' ? '#FF7A5C' : '#FFD166', size: Math.min(p.w * 0.2, 60), dur: 0.3, bottom: 0 };
  }
  // Half extents (about the anchor) of the SFX box once rotated: AABB of the outline plus the drop shadow.
  function sfxBox(c, text, size, rot) {
    var m = c.measureText(text), hw = m.width / 2 + size * 0.1 + 3, hh = Math.max(m.actualBoundingBoxAscent, m.actualBoundingBoxDescent) + size * 0.1 + 3;
    var t = rot * Math.PI / 180, cs = Math.abs(Math.cos(t)), sn = Math.abs(Math.sin(t));
    return { ex: hw * cs + hh * sn, ey: hw * sn + hh * cs };
  }
  function hitsAny(rects, it) {
    return rects.some(function (r) {
      return it.x - it.box.ex < r.x + r.w && it.x + it.box.ex > r.x && it.y - it.box.ey < r.y + r.h && it.y + it.box.ey > r.y;
    });
  }
  // SFX shrinks to 90% of the panel width, then its centre is clamped so the box stays inside the panel and clear of every
  // balloon body. It shrinks (down to 14 px) until that holds. Sets it.size, it.x, it.y, it.box. False when it cannot.
  function placeSfx(p, it, rects) {
    var c = p.c, cx = it.fx * p.w, cy = it.fy * p.h;
    A.setFont(c, 'title', it.size);
    while (it.size > 14 && c.measureText(it.text).width > p.w * 0.9) { it.size -= 2; A.setFont(c, 'title', it.size); }
    for (;;) {
      A.setFont(c, 'title', it.size); c.textBaseline = 'middle';
      it.box = sfxBox(c, it.text, it.size, it.rot);
      it.x = clamp(cx, it.box.ex, p.w - it.box.ex); it.y = clamp(cy, it.box.ey, p.h - it.box.ey);
      if (!hitsAny(rects, it)) return true;
      if (it.size <= 14) return false;
      it.size -= 2;
    }
  }
  // Balloon bodies (with their name tags) that SFX must stay clear of. Tails are thin and may be crossed.
  function bodyRects(items) {
    return items.filter(function (it) { return it.kind === 'bubble' || it.kind === 'caption' || it.kind === 'letter'; }).map(function (it) {
      var tag = it.kind === 'bubble' && it.name ? T.tagUp : 0;
      return { x: it.x, y: it.y - tag, w: it.w, h: it.kind === 'letter' ? it.bottom - it.y : it.h + tag };
    });
  }
  function placeSfxs(p, items) {
    var rects = bodyRects(items), ok = true;
    items.forEach(function (it) { if (it.kind === 'sfx' && !placeSfx(p, it, rects)) ok = false; });
    return ok;
  }
  function letterText(d) {
    return typeof d[1] === 'string' ? d[1] : d[1].filter(function (id) { return P.Dialogue.has(id); }).map(function (id) { return P.Dialogue.text(id); }).join(' ');
  }
  function letterItem(p, d, g, y) {
    var W = p.w, lw = W * 0.88, px = Math.min(g.px, 17), text = letterText(d);
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
  function stack(p, defs, g) {
    var order = defs.map(function (d, i) { return i; }), items = [], ok = true, y = p.data.actionTop?p.h*p.data.actionTop+8:TOP, it, c, cross = 0;
    order.sort(function (a, b) { return (defs[a][0] === 'c' ? 0 : 1) - (defs[b][0] === 'c' ? 0 : 1) || a - b; });
    g.tails = [];   // corridors of the tails stacked so far; a later balloon may not cover one (see bubbleItem)
    order.forEach(function (i) {
      it = layoutItem(p, defs[i], g, y);
      if (!it) return;
      it.src = i; items.push(it);
      if (it.lines && it.lines.wide) ok = false;
      if (it.blocked) { cross++; ok = false; }
      if (it.kind === 'bubble') { c = tailCorridor(it); if (c) g.tails.push(c); }
      if (it.bottom > 0) {
        y = it.bottom + GAP;
        if (it.bottom > g.band || it.bottom > p.h - GAP) ok = false;
      }
    });
    if (!placeSfxs(p, items)) ok = false;
    return { ok: ok, items: items, total: timeline(items), px: g.px, cross: cross };
  }
  // Words never break, so the type size is capped where the longest word of every balloon and caption still fits the widest
  // box it can get (balloon 96% of the panel, caption 92%). Height alone let a long word spill past its box (R1 layout audit).
  function pxCap(p, defs) {
    var cap = PX_ALL[0];
    defs.forEach(function (d) {
      var k = d[0], s, kind, maxW, px;
      if (k === 'b' || k === 's' || k === 't') { s = L.resolve(d[1]); kind = k === 's' ? 'shout' : k === 't' ? 'thought' : 'speech'; maxW = p.w * 0.96; }
      else if (k === 'c') { s = L.resolve(d[1]); kind = 'caption'; maxW = p.w * 0.92; }
      if (!s) return;
      for (px = PX_ALL[0]; px > PX_ALL[PX_ALL.length - 1]; px--) {
        if (T.longest(p.c, s.caps, 'speech', px) + 2 * T.insets(kind, kind === 'caption' ? false : s.tag).x <= maxW + 0.5) break;
      }
      cap = Math.min(cap, px);
    });
    return cap;
  }
  function fitPanel(p, defs, minPx, maxPx) {
    var cap = Math.min(pxCap(p, defs), maxPx || PX_ALL[0]), band = textBand(p), px, i, r;
    for (px = cap; px >= Math.min(cap, minPx); px--) {
      for (i = 0; i < BALLOON_WIDTHS.length; i++) {
        r = stack(p, defs, { px: px, wide: BALLOON_WIDTHS[i], band: band });
        if (r.ok) return r;
      }
    }
    return r;
  }
  L.setStep = function (p, index) {
    p.step = index;
    var res = p.steps[index];
    p.items = res.items; p.total = res.total; p.px = res.px;
    p.T = 0; p.done = false;
  };
  // An unusually long line can take several steps. Keep the original speaker and split only between words.
  function splitLine(p, d, pinned) {
    var k = d[0];
    if (['b', 's', 't', 'c', 'l'].indexOf(k) < 0) return [];
    var line = k === 'l' ? { text: letterText(d) } : L.resolve(d[1]);
    if (!line) return [];
    var words = line.text.trim().split(/\s+/), steps = [], start = 0, end, text, piece, r, best;
    while (start < words.length) {
      best = null;
      for (end = start + 1; end <= words.length; end++) {
        text = words.slice(start, end).join(' ');
        piece = k === 'l' ? text : Object.assign({}, line, { text: text });
        r = fitPanel(p, [[k, piece, d[2]]].concat(pinned), 15);
        if (!r.ok) break;
        best = r;
      }
      if (!best) return [];
      steps.push(best);
      start = end - 1;
    }
    return steps;
  }
  // Signal bars describe the whole panel. The other items retain their script order across taps.
  function fitSteps(p, defs) {
    var pinned = defs.filter(function (d) { return d[0] === 'p'; });
    var content = defs.filter(function (d) { return d[0] !== 'p'; });
    var steps = [], from = 0, end, r, parts;
    do {
      for (end = content.length; end > from + 1; end--) {
        r = fitPanel(p, content.slice(from, end).concat(pinned), 15);
        if (r.ok) break;
      }
      if (end <= from + 1) r = fitPanel(p, content.slice(from, end).concat(pinned), 12);
      parts = !r.ok && end === from + 1 ? splitLine(p, content[from], pinned) : [];
      (parts.length ? parts : [r]).forEach(function (part) {
        part.from = from; part.to = end;
        steps.push(part);
      });
      from = end;
    } while (from < content.length);
    return steps;
  }
  function layoutPanel(p) {
    layoutBusts(p);
    p.steps = fitSteps(p, p.data.it || []);
    p.revealed = false;
    L.setStep(p, 0);
    return p;
  }
  L.layoutPanel = layoutPanel;

  function alignBalloonBottoms(left, right) {
    if (left.items.length !== 1 || right.items.length !== 1) return;
    var a = left.items[0], b = right.items[0];
    if (a.kind !== 'bubble' || b.kind !== 'bubble') return;
    // Align the tails' starting height above the matching portraits. Both panels fit the lower edge already.
    var bottom = Math.max(a.bottom, b.bottom);
    a.y += bottom - a.bottom; a.bottom = bottom;
    b.y += bottom - b.bottom; b.bottom = bottom;
  }

  // Match lettering for alternating speakers in the same shot when both panels fit in one step.
  function matchPanels(left, right) {
    if (!right || left.y !== right.y || left.w !== right.w || left.h !== right.h || left.steps.length !== 1 || right.steps.length !== 1 ||
        left.data.bg !== right.data.bg ||
        left.busts.length !== 1 || right.busts.length !== 1 || left.busts[0].h !== right.busts[0].h) return;
    var px = Math.min(left.px, right.px);
    var l = fitPanel(left, left.data.it || [], px, px), r = fitPanel(right, right.data.it || [], px, px);
    if (!l.ok || !r.ok) return;
    alignBalloonBottoms(l, r);
    Object.assign(left.steps[0], l); L.setStep(left, 0);
    Object.assign(right.steps[0], r); L.setStep(right, 0);
  }
  L.layoutPage = function (panels) {
    panels.forEach(layoutPanel);
    panels.forEach(function (p, i) { matchPanels(p, panels[i + 1]); });
    return panels;
  };

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
  function emptyRep() { return { lines: 0, inkOut: 0, bodyOut: 0, boxOut: 0, trunc: 0, drift: 0, tagOut: 0, stackOut: 0 }; }
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
    if (o.name && o.y - T.tagUp < -0.5) rep.boxOut++;
    if (o.tx != null && (o.tx < 0 || o.tx > bounds.w || o.ty < 0 || o.ty > bounds.h)) rep.boxOut++;
    if (joined.indexOf('…') >= 0 || norm(joined) !== norm(o.caps || '')) rep.trunc++;
    if (o.name && !T.tagFits(mc, o.name, o.w - 20)) rep.tagOut++;
    return rep;
  };
  function addRep(sum, r) {
    Object.keys(r).forEach(function (k) { sum[k] = k === 'drift' ? Math.max(sum[k] || 0, r[k]) : (sum[k] || 0) + r[k]; });
    return sum;
  }
  // A name tag must never hang on the item above it. The stack keeps it clear by construction; the audit checks it anyway.
  function stackCheck(p) {
    var n = 0;
    p.items.forEach(function (b) {
      if (b.kind !== 'bubble' || !b.name) return;
      p.items.forEach(function (a) { if (a !== b && a.bottom > 0 && a.bottom <= b.y + 1 && a.bottom > b.y - T.tagUp + 0.5) n++; });
    });
    return { stackOut: n };
  }
  // Checks every item of a laid-out panel (bubbles, captions, letters; SFX must sit inside the panel and clear of the balloons).
  function checkPanel(p) {
    var sum = emptyRep(), bounds = { w: p.w, h: p.h };
    p.items.forEach(function (it) {
      var o, r;
      if (it.kind === 'bubble' || it.kind === 'caption' || it.kind === 'letter') {
        o = { kind: it.kind === 'letter' ? 'letter' : it.kind === 'caption' ? 'caption' : it.shape, x: it.x, y: it.y, w: it.w,
              h: it.kind === 'letter' ? T.boxH(it.lines, it.lh, false, 'letter') : it.h, name: it.name || false,
              lines: it.lines, px: it.px, lh: it.lh, fk: it.kind === 'letter' ? 'hand' : 'speech', caps: it.caps,
              tx: it.tx, ty: it.ty };
        r = L.checkBox(o, bounds); addRep(sum, r);
      } else if (it.kind === 'sfx') {
        if (it.x - it.box.ex < 0 || it.x + it.box.ex > p.w || it.y - it.box.ey < 0 || it.y + it.box.ey > p.h || hitsAny(bodyRects(p.items), it)) sum.boxOut++;
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
    var fail = rep.inkOut + rep.bodyOut + rep.boxOut + rep.trunc + rep.tagOut + (rep.stackOut || 0) + (overflow ? 1 : 0) > 0;
    return { kind: kind, id: id, px: px, overlap: !!overlap, overflow: !!overflow, inkOut: rep.inkOut, bodyOut: rep.bodyOut,
             boxOut: rep.boxOut, trunc: rep.trunc, tagOut: rep.tagOut, drift: rep.drift, lines: rep.lines, fail: fail, cut: fail,
             cross: rep.cross || 0 };
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
  // truncated, a name tag hangs on the item above it, or the panel overflows. overlap is a warning: balloons cover a
  // bust's head (kept, but counted). cross counts balloons that a tail of another speaker still crosses (kept, counted).
  L.audit = function () {
    if (!A.ready) throw new Error('comic fonts not ready: call P.ComicArt.whenReady first');
    var m = measureCtx(), rows = [];
    Object.keys(P.Story.pages).sort().forEach(function (id) {
      var def = P.Story.pages[id];
      var panels = def.panels.map(function (pd, i) {
        return Object.assign(L.panelRect(def.panels.length, i, def.layout), { c: m, data: pd });
      });
      L.layoutPage(panels).forEach(function (p, i) {
        var rep = emptyRep(), px = PX_ALL[0], overflow = false;
        p.steps.forEach(function (step, j) {
          L.setStep(p, j);
          addRep(rep, checkPanel(p)); addRep(rep, stackCheck(p));
          rep.cross = (rep.cross || 0) + step.cross;
          px = Math.min(px, step.px); overflow = overflow || !step.ok;
        });
        rows.push(rowOf('page', id + ' #' + (i + 1), px, rep, false, overflow));
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
    var s = { rows: rows.length, fail: 0, overlap: 0, overflow: 0, cross: 0, page: 0, pop: 0, call: 0, minPx: 99, px: {} };
    rows.forEach(function (r) {
      if (r.fail) s.fail++;
      if (r.cross) s.cross++;
      if (r.overlap) s.overlap++;
      if (r.overflow) s.overflow++;
      s[r.kind] = (s[r.kind] || 0) + 1;
      if (r.kind !== 'call') { s.minPx = Math.min(s.minPx, r.px); s.px[r.px] = (s.px[r.px] || 0) + 1; }
    });
    return s;
  };
  return L;
})();
