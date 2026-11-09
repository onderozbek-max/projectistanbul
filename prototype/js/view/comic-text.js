// Comic lettering (workstream D, v0.5 text-fit rewrite). Every line is measured with the font string it is drawn with
// (P.ComicArt.font) and with no letter-spacing, so measured width equals drawn width. Nothing is ellipsized here:
// a text that does not fit is handled by the caller (P.ComicLayout steps the type down, widens or shrinks the busts).
// Balloons are rounded rectangles (speech, thought with a trail) or a rounded burst (shout). Captions and paper
// letters are rectangles. The text box is always the balloon body minus the insets from T.insets.
P.ComicText = (function () {
  var T = {}, A = P.ComicArt;
  var INK = '#14151F', PAPER = '#FFF8EC', CAPTION = '#F9D65C', THOUGHT = '#F7F0E2', SHOUT = '#FFF1A8';
  var R_BALLOON = 12, R_CAPTION = 10, SPIKE = 5, TAU = Math.PI * 2;

  function width(c, s) { return c.measureText(s).width; }
  function clampN(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // Greedy word wrap at maxW with the context's current font. Returns lines; never drops text.
  // AUDIT-6 F10: a word is never split. A word wider than maxW sits whole on its own line and lines.wide is set, so
  // the caller widens the balloon or steps the type down (no Turkish word breaks mid-word, e.g. "KUZEYDEK / İ").
  T.wrap = function (c, text, maxW) {
    var out = [], line = '';
    out.wide = false;
    String(text).split(/\s+/).forEach(function (w) {
      var test;
      if (!w) return;
      if (width(c, w) > maxW) { out.wide = true; if (line) out.push(line); out.push(w); line = ''; return; }
      test = line ? line + ' ' + w : w;
      if (!line || width(c, test) <= maxW) line = test; else { out.push(line); line = w; }
    });
    if (line) out.push(line);
    return out;
  };
  // Widest single word of text at the current font (for widening a balloon so no word has to break).
  T.longest = function (c, text, kind, px) {
    A.setFont(c, kind, px);
    return String(text).split(/\s+/).reduce(function (m, w) { return Math.max(m, w ? width(c, w) : 0); }, 0);
  };
  // Wraps at one size. Sets the font itself, so the context is always in step with the measurement.
  T.measure = function (c, text, maxW, kind, px) {
    A.setFont(c, kind, px);
    return { px: px, lh: Math.round(px * A.TYPE.lead), lines: T.wrap(c, text, maxW) };
  };
  // First size in pxs (largest first) whose lines fit maxH. If none does, the smallest comes back with ok false.
  T.fit = function (c, text, maxW, maxH, kind, pxs) {
    var f = null, i;
    for (i = 0; i < pxs.length; i++) {
      f = T.measure(c, text, maxW, kind, pxs[i]);
      f.ok = f.lines.length * f.lh <= maxH && !f.lines.wide;
      if (f.ok) break;
    }
    return f;
  };
  T.widest = function (c, lines, kind, px) {
    A.setFont(c, kind, px);
    return lines.reduce(function (m, l) { return Math.max(m, width(c, l)); }, 0);
  };
  // Typewriter slice: the first n characters of the wrapped lines.
  T.partial = function (lines, n) {
    var out = [], i;
    for (i = 0; i < lines.length && n > 0; i++) { out.push(lines[i].slice(0, n)); n -= lines[i].length + 1; }
    return out;
  };

  // ---------- geometry (shared by drawing, layout and the audit) ----------
  // Inset of the text from the box edge: x (sides), top (to the first line), bottom (below the last line).
  // A name tag takes 16 px at the top; a shout's spikes take SPIKE px on every side, so text stays inside the body.
  T.insets = function (kind, name) {
    if (kind === 'caption') return { x: 9, top: 8, bottom: 8, sp: 0 };
    if (kind === 'letter') return { x: 12, top: 12, bottom: 14, sp: 0 };
    var sp = kind === 'shout' ? SPIKE : 0;
    return { x: 12 + sp, top: (name ? 16 : 10) + sp, bottom: 8 + sp, sp: sp };
  };
  T.boxH = function (lines, lh, name, kind) {
    var i = T.insets(kind, name);
    return i.top + lines.length * lh + i.bottom;
  };
  // Inner text rectangle of a box at x, y, w, h.
  T.textBox = function (kind, x, y, w, h, name) {
    var i = T.insets(kind, name);
    return { x: x + i.x, y: y + i.top, w: w - 2 * i.x, h: h - i.top - i.bottom };
  };
  // Body outline of a box: {x, y, w, h, r}. r is the corner radius (0 for a plain rectangle).
  T.body = function (kind, x, y, w, h) {
    if (kind === 'caption') return { x: x, y: y, w: w, h: h, r: R_CAPTION };
    if (kind === 'letter') return { x: x, y: y, w: w, h: h, r: 0 };
    var sp = kind === 'shout' ? SPIKE : 0;
    return { x: x + sp, y: y + sp, w: w - 2 * sp, h: h - 2 * sp, r: R_BALLOON };
  };
  // True when point (px, py) lies inside the rounded rectangle b.
  T.inBody = function (b, px, py) {
    if (px < b.x - 0.01 || py < b.y - 0.01 || px > b.x + b.w + 0.01 || py > b.y + b.h + 0.01) return false;
    var r = Math.min(b.r, b.w / 2, b.h / 2), cx = clampN(px, b.x + r, b.x + b.w - r), cy = clampN(py, b.y + r, b.y + b.h - r);
    return (px - cx) * (px - cx) + (py - cy) * (py - cy) <= r * r + 0.01;
  };
  // Name tag fits its width at 14 px, or at 10 px at the least.
  T.tagFits = function (c, text, maxW) {
    var px = 14;
    A.setFont(c, 'title', px);
    while (px > 10 && width(c, text) + 14 > maxW) { px--; A.setFont(c, 'title', px); }
    return width(c, text) + 14 <= maxW;
  };

  // ---------- drawing ----------
  function roundPath(c, x, y, w, h, r) {
    c.beginPath();
    if (r <= 0) { c.rect(x, y, w, h); return; }
    c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  // Burst outline: the body rectangle with a spike every step; the tips reach the box edge.
  function spikePath(c, x, y, w, h) {
    var bx = x + SPIKE, by = y + SPIKE, bw = w - 2 * SPIKE, bh = h - 2 * SPIKE, first = true;
    var sides = [[bx, by, bx + bw, by, 0, -1], [bx + bw, by, bx + bw, by + bh, 1, 0],
                 [bx + bw, by + bh, bx, by + bh, 0, 1], [bx, by + bh, bx, by, -1, 0]];
    c.beginPath();
    sides.forEach(function (s) {
      var n = Math.max(2, Math.round(Math.hypot(s[2] - s[0], s[3] - s[1]) / 10)), i, t, out, px, py;
      for (i = 0; i < n; i++) {
        t = i / n; out = i % 2 ? SPIKE : 0;
        px = s[0] + (s[2] - s[0]) * t + s[4] * out; py = s[1] + (s[3] - s[1]) * t + s[5] * out;
        if (first) { c.moveTo(px, py); first = false; } else c.lineTo(px, py);
      }
    });
    c.closePath();
  }
  // Tail from the balloon edge facing the target (side edge or top/bottom edge), tip at (tx, ty).
  function tailPath(c, o) {
    var cx = o.x + o.w / 2, cy = o.y + o.h / 2, dx = o.tx - cx, dy = o.ty - cy, bw = 14, bx, by;
    if (Math.abs(dx) * o.h > Math.abs(dy) * o.w) {
      bx = dx < 0 ? o.x : o.x + o.w; by = cy + Math.max(-o.h * 0.25, Math.min(o.h * 0.25, dy * 0.4));
      c.beginPath(); c.moveTo(bx, by - bw); c.lineTo(o.tx, o.ty); c.lineTo(bx, by + bw);
    } else {
      by = dy > 0 ? o.y + o.h : o.y; bx = Math.max(o.x + 24, Math.min(o.x + o.w - 24, o.tx));
      c.beginPath(); c.moveTo(bx - bw, by); c.lineTo(o.tx, o.ty); c.lineTo(bx + bw, by);
    }
    c.closePath(); c.fill(); c.stroke();
  }
  // Thought balloons: two shrinking puffs leading toward the speaker.
  function thoughtTrail(c, o) {
    var sx = o.x + o.w * 0.3, sy = o.y + o.h;
    [[0.35, 9], [0.7, 5]].forEach(function (p) {
      var px = sx + (o.tx - sx) * p[0] * 0.3, py = sy + (o.ty - sy) * p[0] * 0.3 + 8;
      c.beginPath(); c.arc(px, py, p[1], 0, TAU); c.fill(); c.stroke();
    });
  }
  // Name tag: heavy condensed caps on ink, sitting on the top edge (y is the tag's top).
  function nameTag(c, x, y, text, maxW) {
    var px = 14;
    A.setFont(c, 'title', px);
    while (px > 10 && width(c, text) + 14 > maxW) { px--; A.setFont(c, 'title', px); }
    var tw = Math.min(maxW, width(c, text) + 14);
    c.fillStyle = INK; c.fillRect(x, y, tw, 20);
    c.fillStyle = PAPER; c.textBaseline = 'middle'; c.fillText(text, x + 7, y + 11);
  }
  // Balloon: o = {x, y, w, h, kind: speech | thought | shout, tx, ty (tail tip or trail target), name, lines, px, lh, fill}.
  T.balloon = function (c, o) {
    var k = o.kind || 'speech', tail = k !== 'thought' && o.tx != null, ins = T.insets(k, o.name);
    c.save();
    c.fillStyle = o.fill || (k === 'shout' ? SHOUT : k === 'thought' ? THOUGHT : PAPER);
    c.strokeStyle = INK; c.lineWidth = k === 'thought' ? 2.5 : 3; c.lineJoin = 'round';
    if (tail) tailPath(c, o);
    if (k === 'shout') spikePath(c, o.x, o.y, o.w, o.h); else roundPath(c, o.x, o.y, o.w, o.h, R_BALLOON);
    c.fill(); c.stroke();
    if (k === 'thought' && o.tx != null) thoughtTrail(c, o);
    if (o.name) nameTag(c, o.x + 10, o.y - 11, o.name, o.w - 20);
    c.fillStyle = INK; A.setFont(c, 'speech', o.px); c.textBaseline = 'top'; c.textAlign = 'left';
    o.lines.forEach(function (ln, i) { c.fillText(ln, o.x + ins.x, o.y + ins.top + i * o.lh); });
    c.restore();
  };
  // Yellow narration box: o = {x, y, w, lines, px, lh}. Returns its height.
  T.caption = function (c, o) {
    var h = T.boxH(o.lines, o.lh, false, 'caption');
    c.save(); c.fillStyle = CAPTION; c.strokeStyle = INK; c.lineWidth = 3;
    roundPath(c, o.x, o.y, o.w, h, R_CAPTION); c.fill(); c.stroke();
    c.fillStyle = INK; A.setFont(c, 'speech', o.px); c.textBaseline = 'top'; c.textAlign = 'left';
    o.lines.forEach(function (ln, i) { c.fillText(ln, o.x + 9, o.y + 8 + i * o.lh); });
    c.restore();
    return h;
  };
  // SFX lettering: condensed caps, ink outline and a hard drop shadow. o = {x, y, text, rot, size, fill}.
  T.sfx = function (c, o) {
    c.save(); c.translate(o.x, o.y); c.rotate((o.rot || 0) * Math.PI / 180);
    A.setFont(c, 'title', o.size); c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineJoin = 'round'; c.lineWidth = Math.max(4, o.size * 0.18); c.strokeStyle = INK;
    c.fillStyle = INK; c.fillText(o.text, 3, 3);
    c.strokeText(o.text, 0, 0);
    c.fillStyle = o.fill || '#FFD166'; c.fillText(o.text, 0, 0); c.restore();
  };
  // Paper letter: o = {x, y, w, lines, px, lh, rot}. Returns its height.
  T.letter = function (c, o) {
    var h = T.boxH(o.lines, o.lh, false, 'letter'), i;
    c.save(); c.translate(o.x, o.y); c.rotate((o.rot || 0) * Math.PI / 180);
    c.fillStyle = '#F7EFD9'; c.strokeStyle = INK; c.lineWidth = 3; c.fillRect(0, 0, o.w, h); c.strokeRect(0, 0, o.w, h);
    c.strokeStyle = 'rgba(20,21,31,.22)'; c.lineWidth = 1;
    for (i = 0; i < 6; i++) { c.beginPath(); c.moveTo(12, 14 + i * 22); c.lineTo(o.w - 12, 14 + i * 22); c.stroke(); }
    c.fillStyle = INK; A.setFont(c, 'hand', o.px); c.textBaseline = 'top'; c.textAlign = 'left';
    o.lines.forEach(function (ln, j) { c.fillText(ln, 12, 12 + j * o.lh); });
    c.restore();
    return h;
  };
  return T;
})();
