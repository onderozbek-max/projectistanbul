// Raster ground tiles and facades behind ?art=raster (D-066). View only: the simulation never reads this and it never reads P.Quality.
// The manifest (assets/art/manifest.json, schema 1) holds, per hood, four paving tiles gnd_<hood>_a..d (512 px = a 4 m square), feature
// tiles gnd_<hood>_<feature> (see FEATURE), and two facade strips per hood fac_<hood>_left|night (512x768 = 8 m x 12 m, roof up).
// P.ArtRasterWorld.place(R, s, slot, sd) returns a placement {t, x0, x1, ox, sx} that render-world.js fills with its own
// fillTile(R, t, x0, x1, ya, yb, ox, sx), or null (flag off, manifest or image not ready, no tile for that slot): the caller then keeps
// the code art. Slots: 'road' (the lane, before the arena evolve treatment), 'walk' (a sidewalk, sd -1 or 1), 'facade' (a building front,
// sd), 'lawn' (a grass side, sd), 'rails' (the tram strip, centred on x = 0). Placements are cached for the current hood-level and pixel
// scale only (one slot), so a level holds at most a few canvases; they are baked through P.ArtRig.bake and count against the sprite budget.
// Seams: every paving tile is mirror-repeated. One variant per level and role (an integer hash of hood, stage and role) fills a super-tile
// of N x N cells, and cell parity flips both axes (N is even), so each neighbouring edge is the same pixel column or row, whatever the
// tile's own seam score. Mixing variants per cell was tried and left visible block seams (the joints of two variants never line up), so
// it is not used. Facades alternate a mirrored row. Features run along their authored direction and are never mixed or flipped.
P.ArtRasterWorld = (function () {
  var W = {}, A = P.ArtRaster, TILE_M = 4, N = 4, FAC_W = 3.4, FAC_H = 5.1, POOL = ['a', 'b', 'c', 'd'], GROUND = 'ground', FACADE = 'facades';
  var MISSING = 'missing', LOADING = 'loading', cur = null, LIFT_C = 'rgb(150,128,100)', LIFT_A = 0.22;
  // Feature tiles per hood. slot: 'road' (the lane), 'walk' (both sidewalks), 'shore' (the sea-side sidewalk, sd > 0), 'grass' (a grass
  // side), 'rails' (the tram strip). align 'sea': the tile's right edge sits on the sea edge (x = 7, the walk's outer edge); 'kerb' (default):
  // the tile's left edge sits on the kerb. stages: 1-based levelInfo stages the feature applies to (absent = all of them).
  var FEATURE = {
    istiklal: [{ slot: 'rails', id: 'rails' }],
    galata: [{ slot: 'road', id: 'stairs' }],
    karakoy: [{ slot: 'shore', id: 'wateredge', align: 'sea' }],
    bridge: [{ slot: 'road', id: 'deck' }],
    halic: [{ slot: 'walk', id: 'steps', stages: [2, 5] }],
    samatya: [{ slot: 'shore', id: 'seawall', align: 'sea', stages: [5] }],
    yedikule: [{ slot: 'road', id: 'zindan', stages: [2] }],
    kazlicesme: [{ slot: 'grass', id: 'lawn' }],
    zeytinburnu: [{ slot: 'shore', id: 'quay', stages: [2] }],
    bakirkoysahil: [{ slot: 'road', id: 'cyclelane' }],
    atakoysahil: [{ slot: 'road', id: 'pontoon' }]
  };

  W.enabled = function () { return !!(A && A.enabled() && A.ready(GROUND) && A.ready(FACADE)); };
  W.FEATURE = FEATURE;
  // The hood id and stage of a sim (level 1 is the scripted istiklal corridor and has levelInfo too).
  W.hoodOf = function (s) { return (s.levelInfo && s.levelInfo.hood && s.levelInfo.hood.id) || 'istiklal'; };
  W.stageOf = function (s) { return (s.levelInfo && s.levelInfo.stage) || 1; };
  // Integer hash of cell coordinates and a salt: a uint32, the same for the same input on every run.
  function h32(i, j, salt) {
    var x = Math.imul(i + 1, 0x9E3779B1) ^ Math.imul(j + 1, 0x85EBCA77) ^ Math.imul(salt + 1, 0xC2B2AE3D);
    x ^= x >>> 15; x = Math.imul(x, 0x2C1B3C6D); x ^= x >>> 12; x = Math.imul(x, 0x297A2D39); x ^= x >>> 15;
    return x >>> 0;
  }
  W.hash = h32;
  // Hood index (0..19) and the level's position along the walk (hi), as the view's time of day reads them.
  function hiOf(s) { return ((s.levelInfo && s.levelInfo.hoodIndex) || 0) + (W.stageOf(s) - 1) / 5; }
  // Night facades where the time-of-day tint is blue (istanbul-themes.js: the walk's tint from Kapalıçarşı on, or a theme's own tod).
  function nightOf(s) {
    var th = P.Themes.get(s.theme || (s.levelInfo && s.levelInfo.hood && s.levelInfo.hood.theme) || 'istiklal'), t = th.tod ? th.tod.tint : P.Themes.tint(hiOf(s));
    return t[2] > t[0];
  }
  function entry(id, cat) { return A.entry(cat || GROUND, id); }
  // Which manifest ids a hood-level draws, and how. Pure except for the manifest lookups (no images). Used by the baker and the tests.
  W.spec = function (s) {
    var hood = W.hoodOf(s), stage = W.stageOf(s), feats = FEATURE[hood] || [], hoodIdx = P.Journey ? P.Journey.hoods.map(function (h) { return h.id; }).indexOf(hood) : 0;
    var pool = POOL.map(function (v) { return 'gnd_' + hood + '_' + v; }).filter(function (id) { return !!entry(id); });
    var out = { hood: hood, stage: stage, pool: pool, roadPool: pool, seed: Math.max(0, hoodIdx) * 5 + stage,
      road: null, walk: [null, null], lawn: null, rails: null, facade: 'fac_' + hood + '_' + (nightOf(s) ? 'night' : 'left') };
    feats.forEach(function (f) {
      if (f.stages && f.stages.indexOf(stage) < 0) return;
      var ref = { id: 'gnd_' + hood + '_' + f.id, align: f.align || 'kerb' };
      if (f.slot === 'road') out.road = ref;
      else if (f.slot === 'walk') out.walk = [ref, ref];
      else if (f.slot === 'shore') out.walk[1] = ref;
      else if (f.slot === 'grass') out.lawn = ref;
      else if (f.slot === 'rails') out.rails = ref;
    });
    // The tram rails tile carries variant A's paving, so a hood with rails keeps its road on that variant (no tone step at the tram lane).
    if (out.rails) out.roadPool = pool.filter(function (id) { return id === 'gnd_' + hood + '_a'; });
    return out;
  };
  // Every manifest id a hood-level can draw, for the coverage test.
  W.idsOf = function (spec) {
    var ids = spec.pool.slice();
    [spec.road, spec.walk[0], spec.walk[1], spec.lawn, spec.rails].forEach(function (r) { if (r && ids.indexOf(r.id) < 0) ids.push(r.id); });
    ids.push(spec.facade);
    return ids;
  };
  // The paving super-tile: N x N cells of TILE_M metres, each cell drawn with its flips (W.cell).
  function cellDraw(g, r, x, y, fx, fy, w, h, ov) {
    g.save(); g.translate(x + (fx ? w : 0), y + (fy ? h : 0)); g.scale(fx ? -1 : 1, fy ? -1 : 1);
    g.drawImage(r.img, r.sx, r.sy, r.sw, r.sh, 0, 0, w + ov, h + ov); g.restore();
  }
  function prep(g) { g.imageSmoothingEnabled = true; if ('imageSmoothingQuality' in g) g.imageSmoothingQuality = 'high'; }
  // A tile record for the arena code: the baked canvas, its scale (px per metre) and its size in metres.
  function rec(e, U, w, h) { return { w: w, h: h, k: U, cv: e.cv, pat: null, art: true, raster: true, e: e }; }
  // The cell rule (pure, shared by the baker and the tests): cell (i, j) of a super-tile shows the level's variant (the hash picks it
  // from the salt) with flips i & 1 and j & 1, so the edges of neighbouring cells are the same pixels.
  W.cell = function (i, j, salt, pool) { return { v: pool[h32(0, 0, salt) % pool.length], fx: i & 1, fy: j & 1 }; };
  // Night paving: the blue time-of-day tint (istanbul-themes.js) sinks the authored stone to about 70 luma on hoods 6, 10 and 11, so
  // the baked paving gets a warm screen lift first. View only; the tint still applies over it, and the lift is uniform (no seam).
  function lift(g, m) { g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = LIFT_A; g.fillStyle = LIFT_C; g.fillRect(0, 0, m, m); g.restore(); }
  function bakeGround(P1, key, U, pool, salt, cells, nt) {
    var m = cells * TILE_M, ov = 1 / U;
    return P1.bake(key, U, [0, m, 0, m], function (g) {
      prep(g);
      for (var j = 0; j < cells; j++) for (var i = 0; i < cells; i++) {
        var c = W.cell(i, j, salt, pool);
        cellDraw(g, c.v, i * TILE_M, j * TILE_M, c.fx, c.fy, TILE_M, TILE_M, ov);
      }
      if (nt) lift(g, m);
    });
  }
  // Facade super-tile: the front, then the same front mirrored (roof up in both rows), 3.4 m wide and 10.2 m tall.
  function bakeFacade(P1, key, U, r) {
    var ov = 1 / U;
    return P1.bake(key, U, [0, FAC_W, 0, 2 * FAC_H], function (g) {
      prep(g);
      cellDraw(g, r, 0, 0, 0, 0, FAC_W, FAC_H, ov);
      cellDraw(g, r, 0, FAC_H, 1, 0, FAC_W, FAC_H, ov);
    });
  }
  function bakeSingle(P1, key, U, r, nt) {
    var ov = 1 / U;
    return P1.bake(key, U, [0, TILE_M, 0, TILE_M], function (g) { prep(g); cellDraw(g, r, 0, 0, 0, 0, TILE_M, TILE_M, ov); if (nt) lift(g, TILE_M); });
  }
  // Image lookup for one id: the rect when decoded, LOADING while it decodes (the code art draws), MISSING when the manifest has no entry.
  function need(id, cat) {
    if (!entry(id, cat)) return MISSING;
    return A.rect(cat || GROUND, id, 'tile') || LOADING;
  }
  // Builds the placements of one hood-level at pixel scale U. Returns the plan, null while images decode, or false when the manifest lacks an id.
  function buildPlan(R, s, U) {
    var sp = W.spec(s), P1 = P.ArtRig, want = W.idsOf(sp), rects = {}, state = null, i, ent = [], pre, pool, plan, fe, le, re, wk, featRec, nt = nightOf(s);
    if (!P1 || !P1.bake || !sp.pool.length) return false;
    for (i = 0; i < want.length; i++) {
      var r = need(want[i], sp.facade === want[i] ? FACADE : GROUND);
      if (r === MISSING) return false;
      if (r === LOADING) state = LOADING; else rects[want[i]] = r;
    }
    if (state) return null;
    pre = 'rw|' + sp.hood + '|' + sp.stage + '|';
    pool = sp.pool.map(function (id) { return rects[id]; });
    plan = { hood: sp.hood, stage: sp.stage, U: U, es: ent, slots: { road: null, walk: [null, null], facade: [null, null], lawn: [null, null], rails: null } };
    // Every baked canvas goes through put(): its entry is kept for the liveness check, its pattern is made once for this context.
    function put(e, w, h) { ent.push(e); var t = rec(e, U, w, h); t.pat = R.ctx.createPattern(t.cv, 'repeat'); return t; }
    // The road's origin is x = -2 so its cell lines fall on the rails tile's tile edges (the rails tile is centred on x = 0).
    if (sp.road) plan.slots.road = { t: put(bakeSingle(P1, pre + 'road', U, rects[sp.road.id], nt), TILE_M, TILE_M), x0: -4.6, x1: 4.6, ox: -2, sx: 1 };
    else plan.slots.road = { t: put(bakeGround(P1, pre + 'road', U, sp.roadPool.map(function (id) { return rects[id]; }), sp.seed, N, nt), N * TILE_M, N * TILE_M), x0: -4.6, x1: 4.6, ox: -2, sx: 1 };
    wk = null; featRec = {};
    [-1, 1].forEach(function (sd, q) {
      var ref = sp.walk[q], t, ox = sd * 4.6, sx = sd, x0 = sd * 4.6, x1 = sd * 7;
      if (ref && ref.align === 'sea' && sd > 0) { ox = 7 - TILE_M; x0 = 4.6; x1 = 7; sx = 1; }   // the water band sits at x 5.8..7
      if (ref) { featRec[ref.id] = featRec[ref.id] || put(bakeSingle(P1, pre + 'walk.' + ref.id, U, rects[ref.id], nt), TILE_M, TILE_M); t = featRec[ref.id]; }
      else { wk = wk || put(bakeGround(P1, pre + 'walk', U, pool, sp.seed + 1000, N, nt), N * TILE_M, N * TILE_M); t = wk; }
      plan.slots.walk[q] = { t: t, x0: x0, x1: x1, ox: ox, sx: sx };
    });
    fe = put(bakeFacade(P1, pre + 'facade', U, rects[sp.facade]), FAC_W, 2 * FAC_H);
    [-1, 1].forEach(function (sd, q) { plan.slots.facade[q] = { t: fe, x0: sd * 6.2, x1: sd * 9.6, ox: sd * 6.2, sx: sd }; });
    if (sp.lawn) {
      le = put(bakeSingle(P1, pre + 'lawn', U, rects[sp.lawn.id], nt), TILE_M, TILE_M);
      [-1, 1].forEach(function (sd, q) { plan.slots.lawn[q] = { t: le, x0: sd * 7, x1: sd * 16, ox: sd * 7, sx: sd }; });
    }
    if (sp.rails) {
      re = put(bakeSingle(P1, pre + 'rails', U, rects[sp.rails.id], nt), TILE_M, TILE_M);
      plan.slots.rails = { t: re, x0: -1.2, x1: 1.2, ox: -2, sx: 1 };   // the rails sit 0.5 m either side of the tile centre
    }
    return plan;
  }
  // The pixel scale of the baked tiles: device pixels per metre in steps of 4, between 16 and 48 (the cap keeps a super-tile near 0.8 MB).
  function uOf(R) { var u = Math.round((R.ppm || 32) * (R.dpr || 1) / 4) * 4; return Math.max(16, Math.min(48, u)); }
  function live(plan) { for (var i = 0; i < plan.es.length; i++) if (!plan.es[i].live) return false; return true; }
  // The placement for a slot of this level: slot is 'road', 'walk', 'facade', 'lawn' or 'rails'; sd (-1 or 1) picks a side. Null = the code art.
  W.place = function (R, s, slot, sd) {
    if (!W.enabled() || !R || !R.ctx) return null;
    var U = uOf(R), hood = W.hoodOf(s), stage = W.stageOf(s), plan = cur;
    if (!plan || plan.hood !== hood || plan.stage !== stage || plan.U !== U || !live(plan)) {
      plan = buildPlan(R, s, U);
      if (!plan) { cur = null; return null; }
      cur = plan;
    }
    var v = plan.slots[slot];
    if (v && v.t === undefined) v = v[sd > 0 ? 1 : 0];
    return v || null;
  };
  // Summary of a level's picks (debug view and tests): the hood's pool, the facade id and the road and rail features.
  W.describe = function (s) { var sp = W.spec(s); return { hood: sp.hood, stage: sp.stage, pool: sp.pool, facade: sp.facade, road: sp.road && sp.road.id, rails: sp.rails && sp.rails.id }; };
  W.night = nightOf;
  W.uOf = uOf;
  return W;
})();
