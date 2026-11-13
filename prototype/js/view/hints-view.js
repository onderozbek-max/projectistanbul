// Hint callout presenter (T4 part 10, view only): a small DOM pill with a tiny icon and 2 to 4 words, and a pointing arrow.
// It sits inside #phone (logical 390 x 844 px; main.js scales the phone), never covers the hero's keep-out box, and takes
// touches only on itself (a tap skips it). Off-screen anchors get an arrow on the phone edge. Styles are injected here
// (css/ belongs to the UI pass). Reduce motion: no bob; the fade is opacity only (the --m-rm length).
P.HintsView = (function () {
  var V = {}, C = P.CFG.hints, TAU = Math.PI * 2, INK = '#14151F', root = null, arrow = null, icons = {}, shown = null;
  var fadeMs = Math.round(C.fadeS * 1000), ar = C.arrowPx, AW = 2 * ar, AH = Math.round(1.2 * ar);
  // Stacking (T4 part 15): the callout and its arrow draw above the story layer, the comic pop (z 50) and the call card (z 55), and
  // below the screen overlays (58), the comic page (60) and the card pick (70). Was 40, under both, so an Arda pop hid the start and arrow.
  var Z = 56, MAXW = 200;   // MAXW: the callout's max-width (px), also the box size used for the layer check

  // Pure placement, no DOM. p: { anchor: {x, y}, hudRect: {top, bottom} (HUD anchors only), hud, box: {w, h}, hero: {x, y},
  // W, H, margin, gap, hudBottom, heroBox: {w, h}, arrow }. Returns { mode, left, top, ax, ay, rot }: the box's top-left and
  // the arrow's centre (phone px) with its rotation (deg; 0 = apex up, the apex is the direction it points).
  V.layout = function (p) {
    var a = p.anchor, w = p.box.w, h = p.box.h, m = p.margin, W = p.W, H = p.H, g = p.gap, a2 = p.arrow, hb = p.heroBox;
    var minX = m, maxX = W - m - w, minY = p.hud ? m : p.hudBottom, maxY = H - m - h, cx = W / 2, cy = H / 2;
    var inside = a.x >= 0 && a.x <= W && a.y >= 0 && a.y <= H, dx, dy, len, sc, ux, uy, ex, ey, cands, i, f, shift, hit, best = null, bestOver = Infinity, over;
    function clampX(v) { return Math.max(minX, Math.min(maxX, v)); }
    function clampY(v) { return Math.max(minY, Math.min(maxY, v)); }
    function heroHit(l, t) {
      return l < p.hero.x + hb.w / 2 && l + w > p.hero.x - hb.w / 2 && t < p.hero.y + hb.h / 2 && t + h > p.hero.y - hb.h / 2;
    }
    if (!inside && !p.hud) {   // edge mode: the arrow sits on the inset rectangle, towards the anchor; the box sits just inside it
      dx = a.x - cx; dy = a.y - cy; len = Math.hypot(dx, dy) || 1; ux = dx / len; uy = dy / len;
      sc = Math.min(Math.abs(dx) > 0 ? (cx - m) / Math.abs(dx) : Infinity, Math.abs(dy) > 0 ? (cy - m) / Math.abs(dy) : Infinity);
      ex = cx + dx * sc; ey = cy + dy * sc;
      var bcx = ex - ux * (g + a2 + (Math.abs(ux) * w + Math.abs(uy) * h) / 2), bcy = ey - uy * (g + a2 + (Math.abs(ux) * w + Math.abs(uy) * h) / 2);
      return { mode: 'edge', left: clampX(bcx - w / 2), top: clampY(bcy - h / 2), ax: ex, ay: ey, rot: Math.atan2(uy, ux) * 180 / Math.PI + 90 };
    }
    if (p.hud) {
      cands = [
        { mode: 'below', left: a.x - w / 2, top: p.hudRect.bottom + g, ax: a.x, ay: p.hudRect.bottom + g - AH / 2, rot: 0 },
        { mode: 'above', left: a.x - w / 2, top: p.hudRect.top - g - h, ax: a.x, ay: p.hudRect.top - g + AH / 2, rot: 180 }
      ];
    } else {
      cands = [
        { mode: 'above', left: a.x - w / 2, top: a.y - g - h, ax: a.x, ay: a.y - g + AH / 2, rot: 180 },
        { mode: 'below', left: a.x - w / 2, top: a.y + g, ax: a.x, ay: a.y + g - AH / 2, rot: 0 },
        { mode: 'right', left: a.x + g, top: a.y - h / 2, ax: a.x + g - AH / 2, ay: a.y, rot: -90 },
        { mode: 'left', left: a.x - g - w, top: a.y - h / 2, ax: a.x - g + AH / 2, ay: a.y, rot: 90 },
        // Last resort, for an anchor beside the hero: the box clears the hero's keep-out box above or below it, and the arrow
        // points down or up at the anchor's column.
        { mode: 'heroAbove', left: a.x - w / 2, top: p.hero.y - hb.h / 2 - g - h, ax: a.x, ay: p.hero.y - hb.h / 2 - g + AH / 2, rot: 180 },
        { mode: 'heroBelow', left: a.x - w / 2, top: p.hero.y + hb.h / 2 + g, ax: a.x, ay: p.hero.y + hb.h / 2 + g - AH / 2, rot: 0 }
      ];
    }
    // Each candidate is judged where it would really sit (clamped to the phone). The first that needs no clamp and does not
    // touch the hero wins; otherwise the least-moved one that keeps off the hero, and a hero overlap only as a last resort.
    for (i = 0; i < cands.length; i++) {
      f = fit(cands[i]);
      shift = Math.abs(f.left - cands[i].left) + Math.abs(f.top - cands[i].top);
      hit = heroHit(f.left, f.top);
      if (!hit && shift < 1) return f;
      over = shift + (hit ? 1000 : 0);
      if (over < bestOver) { bestOver = over; best = f; }
    }
    return best || fit(cands[0]);
    // A box that had to move to stay on screen keeps its arrow on the box edge facing the anchor.
    function fit(q) {
      var l = clampX(q.left), t = clampY(q.top), axp, ayp;
      if (q.mode === 'above' || q.mode === 'heroAbove') { axp = Math.max(l + ar, Math.min(l + w - ar, a.x)); ayp = t + h + AH / 2; }
      else if (q.mode === 'below' || q.mode === 'heroBelow') { axp = Math.max(l + ar, Math.min(l + w - ar, a.x)); ayp = t - AH / 2; }
      else if (q.mode === 'right') { axp = l - AH / 2; ayp = Math.max(t + ar, Math.min(t + h - ar, a.y)); }
      else if (q.mode === 'left') { axp = l + w + AH / 2; ayp = Math.max(t + ar, Math.min(t + h - ar, a.y)); }
      else { axp = q.ax; ayp = q.ay; }   // HUD boxes keep their arrow at the element
      return { mode: q.mode, left: l, top: t, ax: axp, ay: ayp, rot: q.rot };
    }
  };

  function css() {
    return '#hint-callout{position:absolute;left:0;top:0;z-index:' + Z + ';display:flex;align-items:center;gap:6px;box-sizing:border-box;' +
      'max-width:' + MAXW + 'px;padding:5px 12px 5px 6px;border:2px solid ' + INK + ';border-radius:16px;background:#FFF4DF;color:' + INK + ';' +
      'font:800 calc(14px * var(--ui-text,1))/1.15 "Avenir Next Condensed","Arial Narrow",system-ui;opacity:0;pointer-events:none;' +
      'transition:opacity ' + fadeMs + 'ms linear}' +
      '#hint-callout .hint-ico{flex:0 0 auto;width:' + C.iconPx + 'px;height:' + C.iconPx + 'px}' +
      '#hint-callout .hint-ico svg{display:block;width:100%;height:100%}' +
      '#hint-callout.on{opacity:1;pointer-events:auto}' +
      '#hint-arrow{position:absolute;left:0;top:0;z-index:' + Z + ';width:0;height:0;border-left:' + ar + 'px solid transparent;' +
      'border-right:' + ar + 'px solid transparent;border-bottom:' + AH + 'px solid ' + INK + ';transform-origin:50% 50%;' +
      'opacity:0;pointer-events:none;transition:opacity ' + fadeMs + 'ms linear}' +
      '#hint-arrow.on{opacity:1}';
  }

  function ensureDom() {
    if (root || typeof document === 'undefined') return root;
    var phone = document.getElementById('phone'), st;
    if (!phone) return null;
    st = document.createElement('style'); st.id = 'hint-css'; st.textContent = css(); document.head.appendChild(st);
    root = document.createElement('div'); root.id = 'hint-callout'; root.setAttribute('role', 'status'); root.setAttribute('aria-live', 'polite');
    root.innerHTML = '<span class="hint-ico"></span><span class="hint-txt"></span>';
    root.addEventListener('pointerdown', function (e) { e.stopPropagation(); if (P.Hints) P.Hints.skip(); });
    arrow = document.createElement('div'); arrow.id = 'hint-arrow'; arrow.setAttribute('aria-hidden', 'true');
    phone.appendChild(arrow); phone.appendChild(root);
    return root;
  }

  function iconSvg(type) {
    var k = P.CFG.hintKinds[type] || P.CFG.hintKinds.cover;
    if (!icons[type]) icons[type] = P.ConsumablesIcons.svg(k.icon, k.fill, INK);
    return icons[type];
  }

  // A HUD element in phone px (the phone is scaled by CSS, so its box gives the scale). null when it is not shown.
  function elementRect(id, phone, W) {
    var el = document.getElementById(id), er, pr, sc;
    if (!el || !el.offsetParent) return null;
    er = el.getBoundingClientRect(); pr = phone.getBoundingClientRect(); sc = (pr.width / W) || 1;
    return { x: (er.left + er.width / 2 - pr.left) / sc, y: (er.top + er.height / 2 - pr.top) / sc, top: (er.top - pr.top) / sc, bottom: (er.bottom - pr.top) / sc };
  }

  // Where the callout and its arrow go for an item (active or queued): { lay, rect } or null when its anchor is not on screen.
  // box: the callout's size in phone px. render() and the layer check both use this, so they see the same placement.
  function place(item, ctx, phone, box) {
    var rect = null, anchor;
    if (item.hud) { rect = elementRect(item.hud, phone, ctx.W); anchor = rect ? { x: rect.x, y: rect.y } : null; }
    else anchor = ctx.toScreen(item.x, item.y);
    if (!anchor) return null;
    return { rect: rect, lay: V.layout({ anchor: anchor, hud: !!item.hud, hudRect: rect, box: box, hero: ctx.heroScreen,
      W: ctx.W, H: ctx.H, margin: C.marginPx, gap: C.gapPx, hudBottom: ctx.hudBottom, heroBox: C.heroBoxPx, arrow: ar }) };
  }

  // The story layer's boxes in phone px (T4 part 15): the comic pop (a portrait with a starburst, and its balloon) and the call card.
  // Only while a story beat is up (P.Comic.active): a pop element stays in the DOM after its beat, empty. Hidden elements have no box.
  function layerBoxes(phone, W) {
    var out = [], els, i, r, pr, sc;
    if (!(P.Comic && P.Comic.active && P.Comic.active()) || !phone || !phone.querySelectorAll) return out;
    els = phone.querySelectorAll('.cm-pop, .cm-call');
    pr = phone.getBoundingClientRect(); sc = (pr.width / W) || 1;
    for (i = 0; i < els.length; i++) {
      r = els[i].getBoundingClientRect();
      if (r.width > 0 && r.height > 0) out.push({ l: (r.left - pr.left) / sc, t: (r.top - pr.top) / sc, r: (r.right - pr.left) / sc, b: (r.bottom - pr.top) / sc });
    }
    return out;
  }

  // Pure (T4 part 15): does the callout box, or its arrow (grown by the bob amplitude), touch any of the boxes? p: { lay (a layout result),
  // box: {w, h}, arrow: {w, h}, boxes: [{l, t, r, b}] }. Edges that only touch do not count.
  V.clash = function (p) {
    var l = p.lay, pad = C.bobPx, rects = [
      { l: l.left, t: l.top, r: l.left + p.box.w, b: l.top + p.box.h },
      { l: l.ax - p.arrow.w / 2 - pad, t: l.ay - p.arrow.h / 2 - pad, r: l.ax + p.arrow.w / 2 + pad, b: l.ay + p.arrow.h / 2 + pad }], i, j, a, b;
    for (i = 0; i < rects.length; i++) for (j = 0; j < p.boxes.length; j++) {
      a = rects[i]; b = p.boxes[j];
      if (a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t) return true;
    }
    return false;
  };

  // Would this queued callout cover the story layer if it started now? Placed as render() would place it (at its widest, C.maxWidthPx,
  // since the text is not measured yet), then tested against the layer's boxes. False when no story beat is up or the anchor is off screen.
  V.overlapsLayer = function (item, ctx) {
    var el = ensureDom(), phone = typeof document !== 'undefined' ? document.getElementById('phone') : null, boxes, pl, box;
    if (!el || !phone || !ctx) return false;
    boxes = layerBoxes(phone, ctx.W);
    if (!boxes.length) return false;
    box = { w: MAXW, h: el.offsetHeight || 30 };
    pl = place(item, ctx, phone, box);
    return !!pl && V.clash({ lay: pl.lay, box: box, arrow: { w: AW, h: AH }, boxes: boxes });
  };

  // Called from hints.js every frame. active: { type, x, y, hud } or null. ctx: { W, H, toScreen(x, y), heroScreen, hudBottom }.
  V.render = function (active, ctx, s) {
    var el = ensureDom(), phone, pl, lay, bob = 0, dirx, diry;
    if (!el) return;
    if (!active || !ctx) { el.classList.remove('on'); arrow.classList.remove('on'); shown = null; return; }
    phone = document.getElementById('phone');
    if (shown !== active.type) {
      el.querySelector('.hint-ico').innerHTML = iconSvg(active.type);
      el.querySelector('.hint-txt').textContent = P.t('hint.' + active.type);
      shown = active.type;
    }
    pl = place(active, ctx, phone, { w: el.offsetWidth, h: el.offsetHeight });
    if (!pl) { el.classList.remove('on'); arrow.classList.remove('on'); return; }
    lay = pl.lay;
    el.style.left = lay.left + 'px'; el.style.top = lay.top + 'px'; el.classList.add('on');
    // The arrow's apex direction is (sin rot, -cos rot); it bobs along that line, and not at all under Reduce motion.
    dirx = Math.sin(lay.rot * Math.PI / 180); diry = -Math.cos(lay.rot * Math.PI / 180);
    if (!(P.Settings && P.Settings.reduceMotion)) bob = Math.sin(TAU * C.bobHz * ((s && s.runT) || 0)) * C.bobPx;
    arrow.style.left = (lay.ax - AW / 2) + 'px'; arrow.style.top = (lay.ay - AH / 2) + 'px';
    arrow.style.transform = 'translate(' + (dirx * bob) + 'px,' + (diry * bob) + 'px) rotate(' + lay.rot + 'deg)';
    arrow.classList.add('on');
  };

  V.root = function () { return root; };
  V.zIndex = Z; V.css = css;   // read by tools/test-hints.js (the stacking is checked against css/comic.css and css/proto.css)
  if (P.Hints) P.Hints.view = V;
  return V;
})();
