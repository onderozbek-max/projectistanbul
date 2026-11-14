// Arena evolution, decals and dressing (view only; see arena-evolve.js for the treatment and the light). Persistent ground marks
// (blood, scorch, rubble from breakables) are collected from the view's particle list and the sim's breakable records, and litter,
// overturned bins and wet sheen are planned once per level from the seed. Everything that sits on the ground is painted into
// cached world bands (a few canvases, LRU), so a frame costs a handful of drawImage calls. Dressing escalates with the ratchet (a
// value that never falls: route progress, segment A..D and horde density), and the counts are capped by quality tier (quality.js).
(function () {
  var E = P.ArenaEvolve, TAU = Math.PI * 2, LV = new WeakMap(), POOL = null;
  var hash = E.hash, clamp = E.clamp, cfg = function () { return P.CFG.arenaEvolve; };

  function tierOf() { return P.Quality && typeof P.Quality.tier === 'number' ? clamp(P.Quality.tier, 0, 2) : 0; }
  function capOf(name) { return cfg().cap[name][tierOf()]; }
  function newState() {
    return { ratchet: 0, decals: [], plan: null, seenP: new WeakSet(), seenR: new WeakSet(), bands: new Map(), lastR: -1, lastTier: -1, lampsOn: [] };
  }
  function stateOf(s) {
    var key = s.props || s, st = LV.get(key);
    if (!st) { st = newState(); LV.set(key, st); }
    return st;
  }

  // ---------- the plan: where litter, bins, lamps and sheen go, fixed for the level (seeded, clear of solid blocks) ----------
  function freeAt(blocks, x, y, pad) {
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i].rc;
      if (x > b.xMin - pad && x < b.xMax + pad && y > b.yMin - pad && y < b.yMax + pad) return false;
    }
    return true;
  }
  function buildPlan(s) {
    var c = cfg(), w = E.where(s), tr = E.treatment(w.h, w.L), G = s.geo, D = c.dress, bl = (G && G.blocks) || [], dress = [], lamps = [], i, x, y, side;
    var endY = G && G.exitY > 0 ? G.exitY - 2 : P.CFG.level.corridor.yMax - 2;
    var seed = ((s.seed | 0) % 9973) * 0.013 + (s.levelIndex || 1) * 1.37 + 0.5;
    function R(i, salt) { return hash(seed + i * 12.9898 + salt * 78.233); }
    for (i = 0; i < D.litter; i++) {
      x = (R(i, 1) * 2 - 1) * 6.4; y = 1 + R(i, 2) * endY;
      if (!freeAt(bl, x, y, 0.2)) continue;
      dress.push({ kind: 'litter', k: c.litter[(Math.floor(R(i, 3) * c.litter.length) + tr.litter) % c.litter.length], x: x, y: y,
        a: R(i, 4) * TAU, s: 1.3 + 0.7 * R(i, 5), n: 3 + Math.floor(R(i, 25) * 3),
        t: clamp(0.4 * (y / endY) + 0.12 * R(i, 6), 0.02, 0.95), on: false });   // threshold follows the route: the mess builds up behind the walk
    }
    for (i = 0; i < D.bins; i++) {
      side = R(i, 7) < 0.5 ? -1 : 1; x = side * (5.2 + 1.2 * R(i, 8)); y = 1 + R(i, 9) * endY;
      if (!freeAt(bl, x, y, 0.3)) continue;
      dress.push({ kind: 'bin', x: x, y: y, a: (R(i, 10) < 0.5 ? 0 : Math.PI / 2) + (R(i, 11) - 0.5) * 0.5, s: 0.9 + 0.3 * R(i, 12),
        t: 0.3 + 0.62 * R(i, 13), on: false });
    }
    if (tr.sheen) for (i = 0; i < D.sheen; i++) {
      dress.push({ kind: 'sheen', x: (R(i, 15) * 2 - 1) * 4, y: 1 + R(i, 16) * endY, a: (R(i, 17) - 0.5) * 0.4, s: 0.8 + 0.6 * R(i, 18),
        t: 0.1 + 0.8 * R(i, 19), on: false });
    }
    dress.sort(function (p, q) { return p.t - q.t; });
    for (i = 0; i < D.lamps; i++) {
      side = R(i, 20) < 0.5 ? -1 : 1; x = side * (6.2 + 0.6 * R(i, 21)); y = 1 + R(i, 22) * endY;
      if (!freeAt(bl, x, y, 0.3)) continue;
      lamps.push({ kind: 'lamp', x: x, y: y, t: 0.45 + 0.5 * R(i, 23), ph: R(i, 24) * TAU, on: false });
    }
    lamps.sort(function (p, q) { return p.t - q.t; });
    return { dress: dress, lamps: lamps };
  }

  // ---------- reveal: the ratchet decides which items are on; the tier caps how many (a prefix, in threshold order) ----------
  function markRange(st, y0, y1) {
    var B = cfg().band, i0 = Math.floor(y0 / B.h), i1 = Math.floor(y1 / B.h);
    st.bands.forEach(function (b) { if (b.idx >= i0 && b.idx <= i1) b.dirty = true; });
  }
  function relevel(st, tier) {
    var c = cfg(), R = st.ratchet, n = 0, cap = c.cap.dressing[tier], lim = c.cap.lamps[tier];
    st.plan.dress.forEach(function (it) {
      var want = n < cap && it.t <= R;
      if (want) n++;
      if (want !== it.on) {
        it.on = want;
        if (want) paintIntoBands(st, it.y - 1.2, it.y + 1.2, function (c) { paintItem(c, it); });   // a heap appears: paint it in
        else markRange(st, it.y - 1.2, it.y + 1.2);                                                  // one goes: the band is rebuilt
      }
    });
    n = 0; st.lampsOn = [];
    st.plan.lamps.forEach(function (it) {
      var want = n < lim && it.t <= R;
      if (want) { n++; st.lampsOn.push(it); }
      it.on = want;
    });
    st.lastR = R; st.lastTier = tier;
  }

  // ---------- decals: blood and scorch from the view's particles, rubble from breakables that die ----------
  function matOf(kind) {
    var k = String(kind || '');
    if (/glass|window|shop/.test(k)) return 'glass';
    if (/crate|bench|table|cart|barrel|chair|wood|pallet|tree|plank/.test(k)) return 'wood';
    if (/car|taxi|dolmus|bus|truck|bin|gas|can|barrier|kiosk|lamp|pole|sign|hazard/.test(k)) return 'metal';
    return 'stone';
  }
  // Adds one persistent decal (kind blood | scorch | rubble). The oldest goes when the tier's cap is full.
  E.addDecal = function (s, kind, x, y, r, seed, a, m) {
    var st = stateOf(s), d = { kind: kind, x: x, y: y, r: clamp(r || 0.3, 0.05, 1.6), seed: seed || 0, a: a || 0, m: m || 'stone' };
    st.decals.push(d);
    trimDecals(st);
    paintIntoBands(st, d.y - d.r - 0.6, d.y + d.r + 0.6, function (c) { paintDecal(c, d); });
    return d;
  };
  function trimDecals(st) {
    var cap = capOf('decal'), old;
    while (st.decals.length > cap) { old = st.decals.shift(); markRange(st, old.y - old.r - 0.6, old.y + old.r + 0.6); }
  }
  function syncDecals(s, st) {
    var fx = (P.Fx && P.Fx.parts) || [], recs = (s.env && s.env.recs) || [], props = s.props || {}, i, p, r, bloodOk = !(P.Settings && P.Settings.blood === false);
    for (i = 0; i < fx.length; i++) {
      p = fx[i];
      if (!p || (p.kind !== 'splat' && p.kind !== 'scorch') || st.seenP.has(p)) continue;
      st.seenP.add(p);
      if (p.kind === 'scorch') E.addDecal(s, 'scorch', p.x, p.y, p.r, p.seed, 0);
      else if (bloodOk) E.addDecal(s, 'blood', p.x, p.y, p.r, p.seed, p.a);
    }
    for (i = 0; i < recs.length; i++) {
      r = recs[i];
      if (r.alive === false && !st.seenR.has(r)) { st.seenR.add(r); E.addDecal(s, 'rubble', r.x, r.y, Math.min(0.9, 0.3 + 0.4 * (r.r || 0.3)), hash(i * 3.3 + r.x), 0, matOf(r.kind)); }
    }
    [[props.carts, 'wood'], [props.canisters, 'metal']].forEach(function (pair) {
      (pair[0] || []).forEach(function (k) {
        if (k.alive !== false || st.seenR.has(k)) return;
        st.seenR.add(k); E.addDecal(s, 'rubble', k.x, k.y, 0.6, hash(k.x * 7.1 + k.y), 0, pair[1]);
      });
    });
  }

  // ---------- painting (world units, through the band transform) ----------
  var MAT = { stone: ['#8A8F98', '#6E737B', '#A7ACB3'], wood: ['#5C3A1C', '#8A5A34', '#3E2716'],
    glass: ['rgba(190,225,240,0.75)', 'rgba(230,246,252,0.85)'], metal: ['#4A4E55', '#6C727B', '#2A2C31'] };
  function ell(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot || 0, 0, TAU); }
  function chunk(c, x, y, a, w, h, fill) {
    c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = fill; c.fillRect(-w / 2, -h / 2, w, h);
    c.strokeStyle = 'rgba(20,21,31,0.55)'; c.lineWidth = 0.025; c.strokeRect(-w / 2, -h / 2, w, h); c.restore();
  }
  function paintDecal(c, d) {
    var j, cols, n, x, y, w, h;
    if (d.kind === 'blood') {
      c.fillStyle = 'rgba(' + P.goreRGB(0) + ',0.5)'; ell(c, d.x, d.y, d.r, d.r * 0.55, d.a); c.fill();
      for (j = 0; j < 3; j++) { c.beginPath(); c.arc(d.x + Math.cos(d.a + j * 2.1) * d.r * 1.3, d.y + Math.sin(d.a + j * 2.1) * d.r * 0.7, d.r * (0.14 + 0.1 * hash(d.seed * 100 + j)), 0, TAU); c.fill(); }
    } else if (d.kind === 'scorch') {
      c.fillStyle = 'rgba(20,21,31,0.30)'; ell(c, d.x, d.y, d.r, d.r * 0.8, 0); c.fill();
      c.fillStyle = 'rgba(20,21,31,0.14)'; ell(c, d.x, d.y, d.r * 0.55, d.r * 0.45, d.a); c.fill();
    } else if (d.kind === 'rubble') {
      cols = MAT[d.m] || MAT.stone; n = 4 + Math.floor(hash(d.seed * 1000 + 5) * 3);
      for (j = 0; j < n; j++) {
        x = d.x + (hash(d.seed * 997 + j * 3.1) - 0.5) * 2 * d.r; y = d.y + (hash(d.seed * 991 + j * 5.7) - 0.5) * 1.4 * d.r;
        w = 0.10 + 0.14 * hash(j * 7.7 + d.seed); h = 0.08 + 0.10 * hash(j * 2.3 + d.seed);
        chunk(c, x, y, hash(j + d.seed * 13) * Math.PI, w, h, cols[j % cols.length]);
      }
    }
  }
  var LIT = {
    paper: function (c, s) { chunk(c, 0, 0, 0.4, 0.22 * s, 0.16 * s, '#E8E1D2'); chunk(c, 0.05, 0.02, -0.5, 0.14 * s, 0.1 * s, '#CFC6B4'); },
    cup: function (c, s) { c.beginPath(); c.arc(0, 0, 0.09 * s, 0, TAU); c.fillStyle = '#F4EBDD'; c.fill(); c.strokeStyle = 'rgba(20,21,31,0.55)'; c.lineWidth = 0.02; c.stroke(); c.beginPath(); c.arc(0, 0, 0.04 * s, 0, TAU); c.fillStyle = '#B7B0A0'; c.fill(); },
    can: function (c, s) { c.beginPath(); c.ellipse(0, 0, 0.05 * s, 0.09 * s, 0.3, 0, TAU); c.fillStyle = '#9AA0A8'; c.fill(); c.strokeStyle = 'rgba(20,21,31,0.55)'; c.lineWidth = 0.02; c.stroke(); },
    bag: function (c, s) { c.beginPath(); c.ellipse(0, 0, 0.16 * s, 0.1 * s, 0.6, 0, TAU); c.fillStyle = '#3A3F46'; c.fill(); c.strokeStyle = 'rgba(230,236,240,0.3)'; c.lineWidth = 0.02; c.beginPath(); c.moveTo(-0.1 * s, -0.03); c.lineTo(0.08 * s, 0.04); c.stroke(); },
    cig: function (c, s) { for (var i = 0; i < 3; i++) chunk(c, i * 0.09 * s, i * 0.03, 0.2 * i, 0.06 * s, 0.012, '#EDE7DA'); chunk(c, -0.12 * s, 0.04, 0, 0.03, 0.03, '#7A5A3A'); },
    peel: function (c, s) { c.beginPath(); c.ellipse(0, 0, 0.14 * s, 0.08 * s, 0.9, 0, TAU); c.fillStyle = '#8A6A48'; c.fill(); },
    bottle: function (c, s) { chunk(c, 0, 0, 0.7, 0.07 * s, 0.2 * s, '#5E4A2E'); chunk(c, 0.02, -0.12 * s, 0.7, 0.04, 0.04, '#2A2C31'); },
    rag: function (c, s) { chunk(c, 0, 0, 0.3, 0.2 * s, 0.1 * s, '#5C6B5E'); chunk(c, 0.1 * s, 0.05, 1.1, 0.12 * s, 0.08 * s, '#7F8A80'); },
    fish: function (c, s) { c.strokeStyle = '#D9D3C4'; c.lineWidth = 0.025; for (var i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(-0.12 * s, i * 0.02); c.lineTo(0.12 * s, i * 0.02 + 0.02); c.stroke(); } c.beginPath(); c.arc(0.14 * s, 0, 0.03, 0, TAU); c.fillStyle = '#D9D3C4'; c.fill(); },
    leaf: function (c, s) { c.beginPath(); c.ellipse(0, 0, 0.12 * s, 0.06 * s, 0.4, 0, TAU); c.fillStyle = '#6B7F5A'; c.fill(); }
  };
  function paintItem(c, it) {
    var s = it.s || 1, j;
    if (it.kind === 'litter') {   // a small heap: 2 to 4 pieces of one kind, scattered within half a metre (readable at phone scale)
      for (j = 0; j < (it.n || 1); j++) {
        c.save(); c.translate(it.x + (hash(it.a * 3.7 + j * 5.3) - 0.5), it.y + (hash(it.a * 1.9 + j * 7.1) - 0.5)); c.rotate(it.a + j * 1.3);
        (LIT[it.k] || LIT.paper)(c, s); c.restore();
      }
      return;
    }
    c.save(); c.translate(it.x, it.y); c.rotate(it.a || 0);
    if (it.kind === 'bin') {   // overturned: a lying bin with its lid off and a little spill
      c.fillStyle = '#3F4A44'; c.fillRect(-0.31 * s, -0.17 * s, 0.62 * s, 0.34 * s);
      c.strokeStyle = 'rgba(20,21,31,0.85)'; c.lineWidth = 0.03; c.strokeRect(-0.31 * s, -0.17 * s, 0.62 * s, 0.34 * s);
      chunk(c, 0.36 * s, 0, 0.2, 0.1, 0.22, '#2A322E');
      chunk(c, 0.5 * s, -0.2, 0.7, 0.12, 0.1, '#E8E1D2'); chunk(c, 0.62 * s, 0.14, 1.9, 0.1, 0.08, '#CFC6B4');
    } else if (it.kind === 'sheen') {
      c.strokeStyle = 'rgba(236,244,250,0.12)'; c.lineWidth = 0.05; c.beginPath(); c.moveTo(-0.45 * s, 0); c.lineTo(0.45 * s, -0.2 * s); c.stroke();
    }
    c.restore();
  }

  // ---------- the band cache: world bands of cfg.band.h metres, rasterised at kd px a metre (quantised) ----------
  function rasterK(R) {
    var B = cfg().band, k = Math.round(R.ppm * (R.dpr || 1) / 4) * 4;
    return clamp(k, B.kMin, B.kMax);
  }
  function bandFor(st, idx, kd) {
    var key = kd + '|' + idx, b = st.bands.get(key), B = cfg().band;
    if (b) { st.bands.delete(key); st.bands.set(key, b); return b; }
    b = { idx: idx, kd: kd, cv: document.createElement('canvas'), dirty: true, n: 0 };
    st.bands.set(key, b);
    while (st.bands.size > B.maxBands) st.bands.delete(st.bands.keys().next().value);
    return b;
  }
  function near(y, pad, y0, y1) { return y + pad > y0 && y - pad < y1; }
  function bake(st, b, kd) {
    var B = cfg().band, y0 = b.idx * B.h, y1 = y0 + B.h, x0 = -B.w / 2, c, n = 0;
    b.cv.width = Math.round(B.w * kd); b.cv.height = Math.round(B.h * kd);
    c = b.cv.getContext('2d');
    c.setTransform(kd, 0, 0, -kd, -x0 * kd, y1 * kd);          // world (x, y) to band pixels ((x - x0) kd, (y1 - y) kd)
    st.decals.forEach(function (d) { if (near(d.y, d.r + 0.6, y0, y1)) { paintDecal(c, d); n++; } });
    st.plan.dress.forEach(function (it) { if (it.on && near(it.y, 1.2, y0, y1)) { paintItem(c, it); n++; } });
    b.n = n; b.dirty = false;
  }

  // Paints one new item into the clean bands it overlaps, without a full rebake (a decal or a heap that appears). A dirty or
  // missing band is baked in full later, so nothing is lost; removals still dirty the band (markRange).
  function paintIntoBands(st, y0, y1, fn) {
    var B = cfg().band, x0 = -B.w / 2;
    st.bands.forEach(function (b) {
      var by0 = b.idx * B.h, by1 = by0 + B.h, c;
      if (b.dirty || by1 < y0 || by0 > y1) return;
      c = b.cv.getContext('2d');
      c.save(); c.setTransform(b.kd, 0, 0, -b.kd, -x0 * b.kd, by1 * b.kd);
      fn(c); b.n++;
      c.restore();
    });
  }

  // ---------- hooks: ground (render.js, under the telegraphs), lamps (render.js, after the world lights) ----------
  E.drawGround = function (R, s) {
    var B = cfg().band, st, cy = R.cam.y, half = P.viewHalfH(R.cam.w) + 3, kd, i, b, c = R.ctx;
    if (!E.enabled()) return;
    st = stateOf(s);
    if (!st.plan) st.plan = buildPlan(s);
    st.ratchet = Math.max(st.ratchet, E.ratchetTarget(s));
    syncDecals(s, st);
    trimDecals(st);
    if (st.ratchet !== st.lastR || tierOf() !== st.lastTier) relevel(st, tierOf());
    kd = rasterK(R);
    var rebuilt = 0, smooth = c.imageSmoothingEnabled;   // at most two full rebakes a frame; a band still dirty draws its last state
    c.imageSmoothingEnabled = false;   // the band raster is within a few percent of the device scale: a plain blit (cheaper, same look)
    for (i = Math.floor((cy - half) / B.h); i <= Math.floor((cy + half) / B.h); i++) {
      b = bandFor(st, i, kd);
      if (b.dirty && rebuilt < 2) { bake(st, b, kd); rebuilt++; }
      if (b.n > 0) c.drawImage(b.cv, R.X(-B.w / 2), R.Y((i + 1) * B.h), B.w * R.ppm, B.h * R.ppm);
    }
    c.imageSmoothingEnabled = smooth;
  };
  function pool() {
    if (POOL) return POOL;
    var cv = document.createElement('canvas'), g2 = cv.getContext('2d'), g;
    cv.width = cv.height = 64;
    g = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,186,108,0.5)'); g.addColorStop(0.5, 'rgba(255,160,80,0.14)'); g.addColorStop(1, 'rgba(255,190,110,0)');
    g2.fillStyle = g; g2.fillRect(0, 0, 64, 64);
    return (POOL = cv);
  }
  E.drawLights = function (R, s) {
    var c = cfg(), st, cy = R.cam.y, half = P.viewHalfH(R.cam.w) + 3, ctx = R.ctx, rm, now, gain, sq, i, it, f, a, r = 2.4, end;
    if (!E.enabled()) return;
    st = LV.get(s.props || s);
    if (!st || !st.lampsOn.length) return;
    rm = E.reduced(); now = performance.now() / 1000;
    end = E.treatment(E.where(s).h, E.where(s).L).end;
    gain = 1 + (end[4] - 1) * E.ease(E.progress(s));
    sq = P.CFG.feel2 && P.CFG.feel2.light ? P.CFG.feel2.light.squash : 0.6;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (i = 0; i < st.lampsOn.length; i++) {
      it = st.lampsOn[i];
      if (Math.abs(it.y - cy) > half + r) continue;
      // Flicker: a slow wobble of the pool's alpha (about c.flicker.hz). Under Reduce motion the lamp holds still at its mid level.
      f = rm ? 1 - 0.5 * c.flicker.amp : 1 - 0.5 * c.flicker.amp * (1 + Math.sin(now * TAU * c.flicker.hz + it.ph));
      a = Math.min(0.5, 0.34 * gain) * f;   // capped before the flicker, so the wobble never sits against a clamp
      ctx.globalAlpha = a;
      ctx.save(); ctx.translate(R.X(it.x), R.Y(it.y)); ctx.scale(1, sq);
      ctx.drawImage(pool(), -r * R.ppm, -r * R.ppm, 2 * r * R.ppm, 2 * r * R.ppm); ctx.restore();
    }
    ctx.restore();
  };

  // Counts for the test and the telemetry: decals and dressing on, lamps on, bands kept and the ratchet.
  E.stats = function (s) {
    var st = LV.get(s.props || s), dress = 0, lamps = 0;
    if (!st || !st.plan) return { decals: st ? st.decals.length : 0, dressing: 0, lamps: 0, bands: st ? st.bands.size : 0, ratchet: st ? st.ratchet : 0, cap: capOf('decal') };
    st.plan.dress.forEach(function (it) { if (it.on) dress++; });
    lamps = st.lampsOn.length;
    return { decals: st.decals.length, dressing: dress, lamps: lamps, bands: st.bands.size, ratchet: st.ratchet, cap: capOf('decal') };
  };
  E.plan = function (s) { var st = stateOf(s); if (!st.plan) st.plan = buildPlan(s); return st.plan; };
  E.setRatchet = function (s, v) { var st = stateOf(s); st.ratchet = Math.max(st.ratchet, v); };
})();
