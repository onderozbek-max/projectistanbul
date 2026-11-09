// Meta map: procedural illustrated night Istanbul (painted once), dotted route, hood badges, Arda's token,
// drag-pan with momentum, focus tweens and a small fx layer (ferries, gulls). World is W x H css px.
// Also defines P.Meta.Anim (shared tween / WAAPI helpers for the meta layer).
P.Meta.Anim = {
  dur: function (ms) { return P.Settings && P.Settings.reduceMotion ? Math.round(ms * 0.4) : ms; },
  // onFrame(t) with t 0..1 (linear). Returns cancel().
  tween: function (ms, onFrame, onDone) {
    var t0 = -1, id = 0, off = false, total = P.Meta.Anim.dur(ms);
    function step(now) {
      if (off) return;
      if (t0 < 0) t0 = now;
      var t = total <= 0 ? 1 : Math.min(1, (now - t0) / total);
      onFrame(t);
      if (t < 1) id = requestAnimationFrame(step); else if (onDone) onDone();
    }
    id = requestAnimationFrame(step);
    return function () { off = true; cancelAnimationFrame(id); };
  },
  play: function (node, frames, ms, done, easing) {
    var fin = function () { if (node.parentNode) node.parentNode.removeChild(node); if (done) done(); };
    if (!node.animate) { setTimeout(fin, P.Meta.Anim.dur(ms)); return; }
    var a = node.animate(frames, { duration: P.Meta.Anim.dur(ms), easing: easing || 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
    a.onfinish = fin;
  },
  kick: function (node, cls, ms) {
    if (!node) return;
    node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls);
    setTimeout(function () { node.classList.remove(cls); }, P.Meta.Anim.dur(ms));
  }
};

P.Meta.Map = (function () {
  var M = P.Meta, G = M.GEO, J = P.Journey, A = M.Anim;
  var W = 960, H = 1700, VW = 390, VH = 844;
  var COL = { land: '#2A2B3D', asia: '#20233A', water: '#1E5577', sea0: '#1B4965', sea1: '#0B2436', block: '#3A3C52',
    blockD: '#1A1C2A', ink: '#14151F', paper: '#F4EBDD', stone: '#8A8F98', gold: '#E9A23B' };
  var FAMILY = "'Avenir Next Condensed', 'Barlow Condensed', 'Arial Narrow', 'Roboto Condensed', sans-serif";
  var CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke="#14151F" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var FACE = '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#F4EBDD" stroke="#14151F" stroke-width="3"/>' +
    '<path d="M9 45 Q11 30 24 29 Q37 30 39 45 Z" fill="#1B4965" stroke="#14151F" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<circle cx="24" cy="20" r="8.5" fill="#E8B88A" stroke="#14151F" stroke-width="2.5"/>' +
    '<path d="M15.5 18 Q16 9 24 9 Q32 9 32.5 18 Q28 13 24 13 Q19 13 15.5 18 Z" fill="#14151F"/>' +
    '<circle cx="21" cy="20" r="1.2" fill="#14151F"/><circle cx="27" cy="20" r="1.2" fill="#14151F"/></svg>';
  var view, world, bgc, svg, fxc, fx, tokenEl, tokPos = { x: 0, y: 0 }, onHood, markers = [], segs = [], lanes = [];
  var cam = { x: 0, y: 0 }, vel = { x: 0, y: 0 }, drag = null, trail = [], suppressUntil = 0;
  var focusAnim = null, follow = false, running = false, raf = 0, last = 0, fxRatio = 1;

  function el(tag, cls, parent) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (parent) parent.appendChild(n);
    return n;
  }
  function svgNode(tag, attrs, parent) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(n);
    return n;
  }
  function icon(id, size) { return P.Icons && P.Icons.svg ? P.Icons.svg(id, size) : ''; }
  function xy(h) { var p = M.hoodXY(h); return { x: p[0] * W, y: p[1] * H }; }
  function clampX(x) { return Math.max(VW - W, Math.min(0, x)); }
  function clampY(y) { return Math.max(VH - H, Math.min(0, y)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function viewScale() { var r = view ? view.getBoundingClientRect() : null; return r && r.width ? r.width / VW : 1; }
  // Rect of a node in phone units, relative to the overlay root (the phone is CSS-scaled).
  function rel(node) {
    var base = view.parentNode.getBoundingClientRect(), r = node.getBoundingClientRect(), s = viewScale();
    return { x: (r.left - base.left) / s, y: (r.top - base.top) / s, w: r.width / s, h: r.height / s };
  }
  function ratioFor(maxPx, w, h) {
    var s = Math.min(window.innerWidth / VW, window.innerHeight / VH) || 1;
    var r = Math.min(3, (window.devicePixelRatio || 1) * s);
    return clamp(r, 0.5, Math.sqrt(maxPx / (w * h)));
  }

  // ---- Route: Catmull-Rom through the 20 hood points, as cubic Beziers ----
  function buildRoute() {
    var pts = [], k, p0, p1, p2, p3;
    for (k = 0; k < J.hoods.length; k++) pts.push(xy(k));
    segs = [];
    for (k = 0; k < pts.length - 1; k++) {
      p0 = pts[Math.max(0, k - 1)]; p1 = pts[k]; p2 = pts[k + 1]; p3 = pts[Math.min(pts.length - 1, k + 2)];
      segs.push({ p0: p1, c1: { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
        c2: { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }, p3: p2 });
    }
  }
  function bez(s, t) {
    var u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return { x: a * s.p0.x + b * s.c1.x + c * s.c2.x + d * s.p3.x, y: a * s.p0.y + b * s.c1.y + c * s.c2.y + d * s.p3.y };
  }
  // f in segment units (0 = first hood, segs.length = last hood).
  function routeAt(f) {
    var n = segs.length, g = clamp(f, 0, n), k = Math.min(n - 1, Math.floor(g));
    return bez(segs[k], g - k);
  }
  function drawRouteSvg() {
    segs.forEach(function (s, k) {
      var d = 'M' + s.p0.x + ' ' + s.p0.y + ' C' + s.c1.x + ' ' + s.c1.y + ' ' + s.c2.x + ' ' + s.c2.y + ' ' + s.p3.x + ' ' + s.p3.y;
      svgNode('path', { d: d, 'class': 'meta-seg', 'data-k': k }, svg);
    });
  }

  // ---- Painting (once, into bgc) ----
  function rng(seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  function trace(c, poly, close) {
    c.beginPath();
    poly.forEach(function (p, i) { if (i) c.lineTo(p[0] * W, p[1] * H); else c.moveTo(p[0] * W, p[1] * H); });
    if (close) c.closePath();
  }
  function inPoly(u, v, poly) {
    var inside = false, i, j, a, b;
    for (i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      a = poly[i]; b = poly[j];
      if ((a[1] > v) !== (b[1] > v) && u < (b[0] - a[0]) * (v - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
    }
    return inside;
  }
  // Distance in px from (u, v) to a polyline.
  function distLine(u, v, poly) {
    var best = 1e9, i, ax, ay, bx, by, t;
    for (i = 0; i < poly.length - 1; i++) {
      ax = poly[i][0]; ay = poly[i][1]; bx = poly[i + 1][0] - ax; by = poly[i + 1][1] - ay;
      t = clamp(((u - ax) * bx + (v - ay) * by) / (bx * bx + by * by || 1), 0, 1);
      best = Math.min(best, Math.hypot((u - ax - bx * t) * W, (v - ay - by * t) * H));
    }
    return best;
  }
  function onWater(u, v) {
    return inPoly(u, v, G.sea) || distLine(u, v, G.horn) < 12 || distLine(u, v, G.bosphorus) < 14;
  }
  function paintBlocks(c) {
    var rnd = rng(4242), n = 0, tries = 0, u, v, d, w, h;
    while (n < 1500 && tries < 9000) {
      tries++;
      u = rnd(); v = rnd();
      d = Math.hypot((u - 0.52) * 1.2, v - 0.4);
      if (rnd() > 0.25 + 0.75 * Math.exp(-d * d * 6) || onWater(u, v)) continue;
      w = 6 + rnd() * 9; h = 5 + rnd() * 8;
      c.fillStyle = rnd() < 0.5 ? COL.block : COL.blockD;
      c.globalAlpha = 0.35 + rnd() * 0.35;
      c.fillRect(u * W, v * H, w, h);
      n++;
    }
    c.globalAlpha = 1;
  }
  function paintSmoke(c) {
    G.smoke.forEach(function (s, si) {
      for (var k = 0; k < 7; k++) {
        var age = (k / 7 + si * 0.37) % 1, x = s[0] * W + Math.sin(age * 5 + k) * 10 + age * 24,
          y = s[1] * H - age * 170, r = 10 + age * 40;
        c.fillStyle = 'rgba(70,72,84,' + ((1 - age) * 0.3).toFixed(3) + ')';
        c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
      }
    });
  }
  function paintLand(c) {
    c.fillStyle = COL.land; c.fillRect(0, 0, W, H);
    trace(c, G.asia, true); c.fillStyle = COL.asia; c.fill();
    G.glow.forEach(function (g) {
      var gr = c.createRadialGradient(g[0] * W, g[1] * H, 0, g[0] * W, g[1] * H, g[2] * W);
      gr.addColorStop(0, 'rgba(233,162,59,0.30)'); gr.addColorStop(0.5, 'rgba(215,38,61,0.10)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gr; c.fillRect(0, 0, W, H);
    });
    paintBlocks(c);
    paintSmoke(c);
  }
  function strokeInk(c, poly, w) {
    trace(c, poly);
    c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = COL.ink; c.lineWidth = w; c.stroke();
  }
  function strokeWater(c, poly, w) {
    strokeInk(c, poly, w + 6);
    trace(c, poly); c.lineCap = 'round'; c.strokeStyle = COL.water; c.lineWidth = w; c.stroke();
  }
  function paintWater(c) {
    var g = c.createLinearGradient(0, 0.47 * H, 0, H);
    g.addColorStop(0, COL.sea0); g.addColorStop(1, COL.sea1);
    trace(c, G.sea, true); c.fillStyle = g; c.fill();
    strokeInk(c, G.sea, 6);
    strokeWater(c, G.horn, 16);
    strokeWater(c, G.bosphorus, 22);
  }
  function paintLandmarks(c) {
    var b = G.bridge, tw = G.tower, x = tw[0] * W, y = tw[1] * H, k, t;
    trace(c, G.walls); c.setLineDash([12, 9]); c.lineWidth = 6; c.strokeStyle = COL.ink; c.stroke();
    c.strokeStyle = COL.stone; c.lineWidth = 3; c.stroke(); c.setLineDash([]);
    trace(c, b); c.lineCap = 'butt'; c.strokeStyle = COL.ink; c.lineWidth = 11; c.stroke();
    c.strokeStyle = COL.stone; c.lineWidth = 7; c.stroke();
    c.fillStyle = COL.gold;
    for (k = 0; k <= 6; k++) {
      t = k / 6; c.beginPath();
      c.arc(b[0][0] * W + (b[1][0] - b[0][0]) * W * t, b[0][1] * H + (b[1][1] - b[0][1]) * H * t, 2, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = COL.stone; c.strokeStyle = COL.ink; c.lineWidth = 2.5;
    c.beginPath(); c.rect(x - 7, y - 30, 14, 34); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(x - 9, y - 30); c.lineTo(x + 9, y - 30); c.lineTo(x, y - 52); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = COL.gold; c.fillRect(x - 1.5, y - 22, 3, 4);
  }
  function paintLabels(c) {
    G.labels.forEach(function (L) {
      var s = L[3], txt = P.upper(P.t(L[0]));
      c.save(); c.translate(L[1] * W, L[2] * H); c.rotate(L[4] || 0);
      c.font = 'italic 900 ' + s + 'px ' + FAMILY;
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
      c.lineWidth = s * 0.3; c.strokeStyle = COL.ink; c.strokeText(txt, 0, 0);
      c.fillStyle = L[5]; c.fillText(txt, 0, 0);
      c.restore();
    });
  }
  function paintVignette(c) {
    var vg = c.createRadialGradient(W / 2, H * 0.45, W * 0.3, W / 2, H * 0.45, H * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    c.fillStyle = vg; c.fillRect(0, 0, W, H);
  }
  function paintWorld() {
    var r = ratioFor(6.5e6, W, H), c;
    bgc.width = Math.round(W * r); bgc.height = Math.round(H * r);
    bgc.style.width = W + 'px'; bgc.style.height = H + 'px';
    c = bgc.getContext('2d');
    c.setTransform(r, 0, 0, r, 0, 0);
    paintLand(c); paintWater(c); paintLandmarks(c); paintLabels(c); paintVignette(c);
  }

  // ---- DOM: markers, home, token, fires ----
  function hoodButton(h) {
    var hd = M.hood(h), p = xy(h), b = el('button', 'meta-hood' + (h % 2 ? ' is-alt' : ''), world);
    var badge = el('span', 'meta-badge', b), dots = el('span', 'meta-dots', b), name = el('span', 'meta-name', b), k;
    for (k = 0; k < J.levelsPerHood; k++) el('i', '', dots);
    b.style.left = p.x + 'px'; b.style.top = p.y + 'px';
    b.setAttribute('data-h', h);
    b.setAttribute('aria-label', P.upper(hd.name) + ' · ' + hd.district);
    name.textContent = P.upper(hd.name);
    return b;
  }
  function buildFires(parent) {
    G.fires.forEach(function (f, i) {
      var d = el('span', 'meta-fire', parent);
      d.style.left = (f[0] * W) + 'px'; d.style.top = (f[1] * H) + 'px';
      d.style.animationDelay = (-i * 0.37) + 's';
    });
  }
  function buildHome() {
    var p = xy(J.hoods.length - 1), home = el('div', 'meta-home', world);
    home.style.left = (p.x + 30) + 'px'; home.style.top = (p.y - 12) + 'px';
    home.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 11 L12 3 L21 11 V21 H14.5 V15 H9.5 V21 H3 Z" fill="#E9A23B" stroke="#14151F" stroke-width="2" stroke-linejoin="round"/></svg>';
    el('span', 'meta-homelbl', home).textContent = P.t('spk.anne');
  }
  function buildTokenFace() {
    var face = null;
    try { face = P.Portraits && P.Portraits.canvas ? P.Portraits.canvas('arda', 'determined', 64) : null; } catch (e) { face = null; }
    if (face && face.nodeType === 1) return face;
    var s = document.createElement('div');
    s.innerHTML = FACE;
    return s.firstChild;
  }
  function buildLanes() {
    lanes = [
      { lane: laneInit(G.bosphorus), boats: [{ speed: 0.05, phase: 0.1 }, { speed: 0.04, phase: 0.9 }, { speed: 0.06, phase: 1.4 }] },
      { lane: laneInit(G.lanes.marmara), boats: [{ speed: 0.05, phase: 0.3 }, { speed: 0.035, phase: 1.2 }] }
    ];
  }
  function laneInit(poly) {
    var pts = poly.map(function (p) { return { x: p[0] * W, y: p[1] * H }; }), acc = [0], i;
    for (i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    return { pts: pts, acc: acc, total: acc[acc.length - 1] };
  }
  // u in 0..1 along the lane. Returns position and heading.
  function lanePos(ln, u) {
    var d = clamp(u, 0, 1) * ln.total, i = 1, a, b, t, seg;
    while (i < ln.acc.length - 1 && ln.acc[i] < d) i++;
    a = ln.pts[i - 1]; b = ln.pts[i];
    seg = ln.acc[i] - ln.acc[i - 1] || 1; t = (d - ln.acc[i - 1]) / seg;
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, ang: Math.atan2(b.y - a.y, b.x - a.x) };
  }

  // ---- Build and refresh ----
  // v0.5 polish: greedy name placement. Each hood name takes the first free slot (below, above, right, left)
  // that does not overlap a dot or a name already placed. Writes a dir-* class on each hood button.
  var NAME_DIRS = ['below', 'above', 'right', 'left'];
  function nameBox(p, dir, w, hgt) {
    if (dir === 'below') return { x: p.x - w / 2, y: p.y + 23, w: w, h: hgt };
    if (dir === 'above') return { x: p.x - w / 2, y: p.y - 23 - hgt, w: w, h: hgt };
    if (dir === 'right') return { x: p.x + 16, y: p.y - hgt / 2, w: w, h: hgt };
    return { x: p.x - 16 - w, y: p.y - hgt / 2, w: w, h: hgt };
  }
  function overlaps(a, b) { return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h; }
  function layoutNames() {
    var placed = [], pts = J.hoods.map(function (hd, h) { return xy(h); });
    pts.forEach(function (p) { placed.push({ x: p.x - 7, y: p.y - 7, w: 14, h: 14 }); });
    J.hoods.forEach(function (hd, h) {
      var p = pts[h], w = P.upper(hd.name).length * 7.4 + 14, hgt = 17, chosen = null, i, cand;
      for (i = 0; i < NAME_DIRS.length && !chosen; i++) {
        cand = nameBox(p, NAME_DIRS[i], w, hgt);
        if (!placed.some(function (q) { return overlaps(cand, q); })) chosen = { dir: NAME_DIRS[i], box: cand };
      }
      if (!chosen) chosen = { dir: 'below', box: nameBox(p, 'below', w, hgt) };
      placed.push(chosen.box);
      markers[h].classList.add('dir-' + chosen.dir);
    });
  }
  function build(container, handlers) {
    if (view) return;
    onHood = handlers.onHood;
    buildRoute(); buildLanes();
    view = el('div', 'meta-map', container);
    world = el('div', 'meta-world', view);
    world.style.width = W + 'px'; world.style.height = H + 'px';
    bgc = el('canvas', 'meta-bg', world);
    buildFires(world);
    svg = svgNode('svg', { 'class': 'meta-route', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }, world);
    drawRouteSvg();
    markers = J.hoods.map(function (hd, h) { return hoodButton(h); });
    layoutNames();
    buildHome();
    tokenEl = el('div', 'meta-token', world);
    tokenEl.appendChild(buildTokenFace());
    fxc = el('canvas', 'meta-fx', view);
    fxRatio = ratioFor(VW * VH * 4, VW, VH);
    fxc.width = Math.round(VW * fxRatio); fxc.height = Math.round(VH * fxRatio);
    fxc.style.width = VW + 'px'; fxc.style.height = VH + 'px';
    fx = fxc.getContext('2d');
    paintWorld();
    bindInput();
    apply();
  }
  function setToken(p) {
    tokPos = p;
    tokenEl.style.left = p.x + 'px'; tokenEl.style.top = p.y + 'px';
  }
  // v = { done, cur, curDone } from M.snapshot(). Sets badge states, dots, route progress and token.
  function refresh(v) {
    if (!view) return;
    var n = J.hoods.length;
    markers.forEach(function (b, h) {
      var st = h < v.done ? 'is-done' : (h === v.done ? 'is-cur' : 'is-locked'), badge = b.firstChild, dots = b.querySelectorAll('.meta-dots i'), k;
      b.classList.remove('is-done', 'is-cur', 'is-locked');
      b.classList.add(st);
      if (badge.getAttribute('data-s') !== st) {
        badge.setAttribute('data-s', st);
        badge.innerHTML = st === 'is-done' ? CHECK : (st === 'is-locked' ? icon('lock', 18) : String(h + 1));
      }
      for (k = 0; k < dots.length; k++) {
        dots[k].className = (st === 'is-done' || (st === 'is-cur' && k < v.curDone)) ? 'on' : '';
      }
    });
    world.querySelectorAll('.meta-seg').forEach(function (p) {
      p.classList.toggle('is-done', Number(p.getAttribute('data-k')) < v.done);
    });
    setToken(xy(Math.min(v.done, n - 1)));
  }

  // ---- Camera: drag-pan with momentum, focus tweens, follow ----
  function apply() {
    if (world) world.style.transform = 'translate3d(' + cam.x.toFixed(1) + 'px,' + cam.y.toFixed(1) + 'px,0)';
  }
  function focusTo(tx, ty, ms) {
    focusAnim = { x0: cam.x, y0: cam.y, x1: clampX(tx), y1: clampY(ty), t0: performance.now(), ms: A.dur(ms) };
    vel = { x: 0, y: 0 };
  }
  function stepFocus(now) {
    var f = focusAnim, t = f.ms <= 0 ? 1 : Math.min(1, (now - f.t0) / f.ms), e = 1 - Math.pow(1 - t, 3);
    cam.x = f.x0 + (f.x1 - f.x0) * e; cam.y = f.y0 + (f.y1 - f.y0) * e;
    if (t >= 1) focusAnim = null;
  }
  function momentum(dt) {
    if (Math.abs(vel.x) + Math.abs(vel.y) < 0.02) { vel = { x: 0, y: 0 }; return; }
    var nx = cam.x + vel.x * dt, ny = cam.y + vel.y * dt, k = Math.pow(0.92, dt / 16);
    if (nx !== clampX(nx)) vel.x = 0;
    if (ny !== clampY(ny)) vel.y = 0;
    cam.x = clampX(nx); cam.y = clampY(ny);
    vel.x *= k; vel.y *= k;
  }
  function easeToward(dt) {
    var k = 1 - Math.pow(0.0025, dt / 1000);
    cam.x += (clampX(VW / 2 - tokPos.x) - cam.x) * k;
    cam.y += (clampY(VH * 0.45 - tokPos.y) - cam.y) * k;
  }
  function focusHood(h, yFrac, instant) {
    var p = xy(h), tx = VW / 2 - p.x, ty = VH * (yFrac || 0.42) - p.y;
    if (instant) { focusAnim = null; cam.x = clampX(tx); cam.y = clampY(ty); vel = { x: 0, y: 0 }; apply(); }
    else focusTo(tx, ty, 520);
  }
  function releaseVelocity() {
    var now = performance.now(), a = trail[0], b = trail[trail.length - 1];
    if (!a || !b || now - b.t > 90 || b.t === a.t) { vel = { x: 0, y: 0 }; return; }
    var dt = Math.max(1, b.t - a.t);
    vel = { x: clamp((b.x - a.x) / dt, -2.5, 2.5), y: clamp((b.y - a.y) / dt, -2.5, 2.5) };
  }

  // ---- Input ----
  function onMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var s = viewScale(), dx = (e.clientX - drag.x) / s, dy = (e.clientY - drag.y) / s;
    drag.x = e.clientX; drag.y = e.clientY; drag.total += Math.abs(dx) + Math.abs(dy);
    if (drag.total > 8) drag.moved = true;
    cam.x = clampX(cam.x + dx); cam.y = clampY(cam.y + dy);
    trail.push({ t: performance.now(), x: cam.x, y: cam.y });
    if (trail.length > 6) trail.shift();
  }
  function onEnd(e) {
    if (!drag || (e.pointerId !== undefined && e.pointerId !== drag.id)) return;
    if (drag.moved) { suppressUntil = performance.now() + 350; releaseVelocity(); }
    drag = null;
  }
  function onClick(e) {
    if (performance.now() < suppressUntil) { e.stopPropagation(); e.preventDefault(); return; }
    var b = e.target.closest ? e.target.closest('.meta-hood') : null;
    if (b && onHood) onHood(Number(b.getAttribute('data-h')));
  }
  function bindInput() {
    view.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, total: 0, moved: false };
      trail = [{ t: performance.now(), x: cam.x, y: cam.y }];
      vel = { x: 0, y: 0 }; focusAnim = null;
    });
    view.addEventListener('pointermove', onMove);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { view.addEventListener(ev, onEnd); });
    view.addEventListener('click', onClick, true);
  }

  // ---- Fx layer (screen space): ferries and gulls ----
  function onScreen(x, y) { return x > -30 && x < VW + 30 && y > -30 && y < VH + 30; }
  function drawBoat(c, x, y, ang) {
    c.save(); c.translate(x, y); c.rotate(ang);
    c.beginPath(); c.moveTo(-9, -1); c.lineTo(9, -1); c.lineTo(6, 4); c.lineTo(-6, 4); c.closePath();
    c.fillStyle = COL.paper; c.strokeStyle = COL.ink; c.lineWidth = 1.6; c.fill(); c.stroke();
    c.fillStyle = '#D7263D'; c.fillRect(-7, 1, 14, 1.6);
    c.fillStyle = COL.paper; c.fillRect(-3, -5, 6, 4); c.strokeRect(-3, -5, 6, 4);
    c.restore();
  }
  function drawFerries(c, t, ox, oy) {
    lanes.forEach(function (ln) {
      ln.boats.forEach(function (b) {
        var raw = (t * b.speed + b.phase) % 2, u = raw > 1 ? 2 - raw : raw, p = lanePos(ln.lane, u);
        var x = p.x + ox, y = p.y + oy;
        if (onScreen(x, y)) drawBoat(c, x, y, p.ang + (raw > 1 ? Math.PI : 0));
      });
    });
  }
  function drawGulls(c, t, ox, oy) {
    G.gulls.forEach(function (g, i) {
      var x = g[0] * W + Math.sin(t * 0.3 + i) * 46 + ox, y = g[1] * H + Math.cos(t * 0.23 + i * 2) * 22 + oy;
      var w = Math.sin(t * 9 + i * 2) * 0.5;
      if (!onScreen(x, y)) return;
      c.beginPath(); c.moveTo(x - 8, y - w * 6); c.quadraticCurveTo(x - 4, y - 3, x, y); c.quadraticCurveTo(x + 4, y - 3, x + 8, y - w * 6);
      c.strokeStyle = COL.ink; c.lineWidth = 2.6; c.stroke();
      c.strokeStyle = COL.paper; c.lineWidth = 1.2; c.stroke();
    });
  }
  function drawFx(now) {
    var c = fx, t = now / 1000;
    c.setTransform(fxRatio, 0, 0, fxRatio, 0, 0);
    c.clearRect(0, 0, VW, VH);
    drawFerries(c, t, cam.x, cam.y);
    drawGulls(c, t, cam.x, cam.y);
  }

  // ---- Loop (runs only while the map is shown) ----
  function frame(now) {
    var dt = Math.min(50, now - (last || now));
    last = now;
    if (focusAnim) stepFocus(now);
    else if (!drag) momentum(dt);
    if (follow) easeToward(dt);
    apply();
    drawFx(now);
    raf = running ? requestAnimationFrame(frame) : 0;
  }
  function show() {
    running = true; last = 0;
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function hide() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0; drag = null; vel = { x: 0, y: 0 }; focusAnim = null; follow = false;
  }

  // ---- Motion on the map ----
  // Token walks the route from hood a to hood b over ms. Returns cancel().
  function walk(a, b, ms, done) {
    follow = true;
    var cancel = A.tween(ms, function (t) {
      var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setToken(routeAt(a + (b - a) * e));
    }, function () { follow = false; if (done) done(); });
    return function () { cancel(); follow = false; };
  }
  function burst(h) {
    var p = xy(h), ring = el('div', 'meta-ring', world), k, a, s;
    ring.style.left = p.x + 'px'; ring.style.top = p.y + 'px';
    A.play(ring, [{ transform: 'translate(-50%,-50%) scale(.2)', opacity: 1 },
      { transform: 'translate(-50%,-50%) scale(2.6)', opacity: 0 }], 650);
    for (k = 0; k < 10; k++) {
      a = k / 10 * 360 + (k % 2) * 12;
      s = el('div', 'meta-spark', world);
      s.style.left = p.x + 'px'; s.style.top = p.y + 'px';
      A.play(s, [{ transform: 'translate(-50%,-50%) rotate(' + a + 'deg) translateY(-14px)', opacity: 1 },
        { transform: 'translate(-50%,-50%) rotate(' + a + 'deg) translateY(-62px)', opacity: 0 }], 560);
    }
  }

  return {
    build: build, show: show, hide: hide, refresh: refresh, walk: walk, burst: burst,
    focusHood: focusHood,
    hop: function () { A.kick(tokenEl, 'is-hop', 600); },
    shake: function () { A.kick(tokenEl, 'is-shake', 500); },
    reveal: function (h) { A.kick(markers[h], 'is-reveal', 800); },
    tokenRect: function () { return rel(tokenEl); },
    markerRect: function (h) { return rel(markers[h]); },
    rel: function (node) { return rel(node); }
  };
})();
