// Level layouts for generated levels 2..100 (workstream B, AUDIT-6 B2-B4). Pure sim: no DOM, no Math.random.
// Each generated level has one layout zone, chosen by its stage (journey.js `layouts`; stage 5 is the boss arena).
// Templates: plaza (open square, centre landmark, pillars), market (stall rows, alley chokepoints), chicane (shop wall
// and pier with a 2.6 m gap, alternating sides), waterfront (sea on one side), bridge (narrow deck over water), arena
// (boss cover per boss type). Route parts outside a zone are the street: the hood's block kit (levels.js layBlocks) and
// centre landmarks every 30 m. Numbers live in config-layouts.js (P.CFG.layouts).
//
// s.layout contract (set by P.Levels.build; undefined on L1):
//   walk:   { x0, x1, y0, y1 }                hero walkable rect: |x| <= view.geoHeroHalfX (G1), from 0 to the exit gate
//   zones:  [{ kind, stage, y0, y1, len }]    kind: plaza | market | chicane | waterfront | bridge | arena
//   chokes: [{ x, y, w, zone }]               gaps of w <= layouts.maxChoke m; route zones have >= layouts.minChokes
//   centre: [{ x, y, kind, recipe, ev }]      3 x 3 m centre landmarks, kind 'cm_*' (view: layouts-centre.js);
//                                             ev = ambush | loot | hack, fired by P.Layouts.trigger from a 'landmark' mark
//   slots:  [{ x, y, zone }]                  free floor spots for env props (Lane A); zone = index in zones, -1 = street
//   spawns: [{ x, y, side, kind }]            door | window | manhole spawn points (Lane A portals); side = -1 | 1
//   boss:   { type, cover } | null            arena cover for the boss stage (cover = piece kind)
// Solids are AABBs in geo.blocks: { kind, x, y, w, h, rc }. kind is lx_* (view: layouts-fx.js), cm_* (layouts-centre.js),
// bollard or tables (existing P.Props kinds). geo.zones = zones, geo.landmarks = centre.
// P.Layouts.botTarget(s) gives tools/bot.js the next chokepoint to walk through (the bot has no path planner).
P.Layouts = {};

var T = {};   // template generators: T[kind](zone, out) fill out.solids, out.chokes, out.centre

function block(kind, x, y, w, h) {
  return { kind: kind, x: x, y: y, w: w, h: h, rc: { xMin: x - w / 2, xMax: x + w / 2, yMin: y - h / 2, yMax: y + h / 2 } };
}
function solid(out, kind, x, y, w, h) { out.solids.push({ kind: kind, x: x, y: y, w: w, h: h }); }
function choke(out, x, y, w) { out.chokes.push({ x: x, y: y, w: w }); }

// A long wall or water edge cut into segments of seg m, so each block stays inside the view's draw window.
function run(out, kind, xc, w, y0, y1, seg) {
  var n = Math.ceil((y1 - y0) / seg), i, a, h;
  for (i = 0; i < n; i++) { a = y0 + i * seg; h = Math.min(seg, y1 - a); solid(out, kind, xc, a + h / 2, w, h); }
}

// ---------- templates ----------
// Plaza: pillars either side at two heights; the centre landmark sits on the axis, the gaps between pillar and landmark
// are the chokepoints.
T.plaza = function (z, out) {
  var C = P.CFG.layouts.plaza, gap = C.pillarX - C.pillarW / 2 - C.landmark / 2;
  C.pillarAt.forEach(function (f) {
    var y = z.y0 + z.len * f;
    [-1, 1].forEach(function (sd) {
      solid(out, 'lx_pillar', sd * C.pillarX, y, C.pillarW, C.pillarW);
      choke(out, sd * (C.landmark / 2 + gap / 2), y, gap);
    });
  });
  out.centre = { x: 0, y: z.y0 + z.len / 2 };
};

// Market alley: a stall frontage on each side and a centre stall that alternates sides, so the lane zigzags between
// 1.8 m gaps.
T.market = function (z, out) {
  var C = P.CFG.layouts.market, inner = C.frontX - 1.5 * C.unitW, i = 0, y, sd, gap;
  gap = inner - (C.pieceX + C.pieceW / 2);
  for (y = z.y0 + C.inset; y < z.y1 - C.inset; y += C.row, i++) {
    sd = i % 2 ? -1 : 1;
    [-1, 1].forEach(function (f) {
      solid(out, 'lx_stall', f * C.frontX, y, C.unitW, C.unitD);
      solid(out, 'lx_stall', f * (C.frontX - C.unitW), y, C.unitW, C.unitD);
    });
    solid(out, 'lx_stall', sd * C.pieceX, y, C.pieceW, C.pieceW);
    choke(out, sd * (C.pieceX + C.pieceW / 2 + gap / 2), y, gap);
  }
};

// Chicane: shop walls every `every` m, alternating sides. Each wall runs from the corridor edge to the gap; a pier on the
// far side closes the gap at the hero's reach, so the 2.6 m gap sits inside the walkable width.
T.chicane = function (z, out) {
  var C = P.CFG.layouts.chicane, n = Math.floor(z.len / C.every), i, sd, y, xe;
  for (i = 0; i < n; i++) {
    sd = i % 2 ? 1 : -1;
    y = z.y0 + C.every * (i + 0.5);
    xe = -sd * (C.pierX - C.pierW / 2 - C.gap);                  // wall end: the gap runs from here to the pier
    solid(out, 'lx_wall', (sd * C.outer + xe) / 2, y, Math.abs(sd * C.outer - xe), C.wallT);
    solid(out, 'lx_pillar', -sd * C.pierX, y, C.pierW, C.pierW);
    choke(out, -sd * (C.pierX - C.pierW / 2 - C.gap / 2), y, C.gap);
  }
};

// Waterfront: the sea fills the far side; bollards along the quay; a stall row on the land side; two moored boats
// whose gaps to the bollard line are the chokepoints.
T.waterfront = function (z, out) {
  var C = P.CFG.layouts.waterfront, sea = C.reach - C.seaX, bw = C.bollardX - C.bollardW / 2, bx = C.boatX + C.boatW / 2, y, i;
  run(out, 'lx_sea', C.seaX + sea / 2, sea, z.y0, z.y1, C.seaSeg);
  for (y = z.y0 + C.bollardEvery / 2; y < z.y1; y += C.bollardEvery) solid(out, 'bollard', C.bollardX, y, C.bollardW, C.bollardW);
  for (y = z.y0 + C.kioskEvery / 2, i = 0; y < z.y1; y += C.kioskEvery, i++) solid(out, 'lx_stall', C.kioskX, y, C.kioskW, C.kioskD);
  C.boatAt.forEach(function (f) {
    var yb = z.y0 + z.len * f;
    solid(out, 'lx_boat', C.boatX, yb, C.boatW, C.boatL);
    choke(out, (bx + bw) / 2, yb, bw - bx);
  });
};

// Bridge span: a narrow deck with water either side; posts across the deck leave 2.6 m gaps.
T.bridge = function (z, out) {
  var C = P.CFG.layouts.bridge, w = C.reach - C.deckHalf, gap = 2 * (C.postX - C.postW / 2);
  [-1, 1].forEach(function (sd) { run(out, 'lx_sea', sd * (C.deckHalf + w / 2), w, z.y0, z.y1, C.seaSeg); });
  C.postAt.forEach(function (d) {
    var y = z.y0 + d;
    [-1, 1].forEach(function (sd) { solid(out, 'bollard', sd * C.postX, y, C.postW, C.postW); });
    choke(out, 0, y, gap);
  });
};

// Boss arena: cover in two columns beside a clear centre lane, sized by the boss type (brute pillars, bloater trucks,
// spitter tables). Open by design: no chokepoints.
T.arena = function (z, out, type) {
  var C = P.CFG.layouts.arena, cv = C.cover[type] || C.cover.brute, rows = cv.n / 2, sz = P.CFG.levels.kinds[cv.kind], r, y;
  for (r = 0; r < rows; r++) {
    y = z.y0 + z.len * (r + 1) / (rows + 1);
    [-1, 1].forEach(function (sd) { solid(out, cv.kind, sd * cv.x, y, sz[0], sz[1]); });
  }
};

// ---------- planning ----------
function zoneFor(geo, kind, rng) {
  var C = P.CFG.layouts, len, a, b, y0;
  if (kind === 'arena') {
    len = geo.exitY - C.arena.pad - (geo.holdY + C.arena.pad);
    return len > 0 ? { kind: kind, y0: geo.holdY + C.arena.pad, y1: geo.exitY - C.arena.pad, len: len } : null;
  }
  len = C[kind].len; a = C.routeFrom; b = geo.holdY - C.routeGap - len;
  if (b < a) return null;
  y0 = a + rng.range(0, b - a);
  return { kind: kind, y0: y0, y1: y0 + len, len: len };
}

function pickEv(rng) {
  var list = P.CFG.layouts.centre.events, tot = 0, i, r;
  list.forEach(function (e) { tot += e.w; });
  r = rng.next() * tot;
  for (i = 0; i < list.length - 1; i++) { r -= list[i].w; if (r < 0) break; }
  return list[i].k;
}

function clashes(geo, x, y, w, h) {
  var m = P.CFG.layouts.clear;
  return geo.blocks.some(function (b) { return Math.abs(b.x - x) < (b.w + w) / 2 + m && Math.abs(b.y - y) < (b.h + h) / 2 + m; });
}

function addCentre(geo, L, x, y, hood, rng) {
  var K = P.CFG.layouts.centre, spec = hood.centre || 'tea', kind = 'cm_' + spec.replace(':', '');
  geo.blocks.push(block(kind, x, y, K.size, K.size));
  L.centre.push({ x: x, y: y, kind: kind, recipe: spec, ev: pickEv(rng) });
}

function inZone(zones, y, gap) {
  return zones.some(function (z) { return y > z.y0 - gap && y < z.y1 + gap; });
}

// Street centre landmarks: one chance every `every` m, beside the centre lane, alternating sides, never in a zone.
function streetCentres(geo, L, hood, rng) {
  var K = P.CFG.layouts.centre, lim = geo.holdY - K.holdGap, side = rng.chance(0.5) ? 1 : -1, k, y;
  for (k = 0; K.from + k * K.every < lim; k++) {
    if (!rng.chance(K.chance)) continue;
    y = K.from + k * K.every + rng.range(0, K.jitter);
    if (y > lim || inZone(L.zones, y, K.zoneGap)) continue;
    if (clashes(geo, side * K.offAxis, y, K.size, K.size)) continue;
    addCentre(geo, L, side * K.offAxis, y, hood, rng);
    side = -side;
  }
}

// Plan the stage's layout: zone solids and chokepoints go into geo.blocks, centre landmarks too. Runs before the
// street blocks (layBlocks skips zones and clashes with these). Consumes the level rng in a fixed order.
P.Layouts.plan = function (s, info, rng, geo) {
  var hood = info.hood, kind = geo.boss ? 'arena' : (hood.layouts && hood.layouts[info.stage - 1]) || 'street';
  var hx = P.CFG.view.geoHeroHalfX, L = { walk: { x0: -hx, x1: hx, y0: 0, y1: geo.exitY }, zones: [], chokes: [], centre: [], slots: [], spawns: [], boss: null };
  var out = { solids: [], chokes: [], centre: null }, z = null;
  if (kind !== 'street' && T[kind]) z = zoneFor(geo, kind, rng);
  if (z) {
    z.stage = info.stage;
    if (kind === 'arena') T.arena(z, out, hood.boss); else T[kind](z, out);
    L.zones.push(z);
    out.solids.forEach(function (sd) { geo.blocks.push(block(sd.kind, sd.x, sd.y, sd.w, sd.h)); });
    out.chokes.forEach(function (c) { L.chokes.push({ x: c.x, y: c.y, w: c.w, zone: 0 }); });
    if (out.centre) addCentre(geo, L, out.centre.x, out.centre.y, hood, rng);
  }
  if (geo.boss) L.boss = { type: hood.boss, cover: (P.CFG.layouts.arena.cover[hood.boss] || {}).n || 0 };
  streetCentres(geo, L, hood, rng);
  geo.zones = L.zones;
  geo.landmarks = L.centre;
  return L;
};

// Free floor spots for env props, after the street blocks exist (called from P.Levels.build).
P.Layouts.slots = function (s) {
  var L = s.layout, G = s.geo, K = P.CFG.layouts.slot, y, f, x;
  for (y = K.every; y < G.exitY - K.every && L.slots.length < K.max; y += K.every) {
    for (f = -1; f <= 1; f += 2) {
      x = f * K.side;
      if (freeAt(G, x, y, K.clear) && L.slots.length < K.max) L.slots.push({ x: x, y: y, zone: zoneAt(L.zones, y) });
    }
  }
};
function freeAt(G, x, y, r) {
  return !G.blocks.some(function (b) { return x > b.rc.xMin - r && x < b.rc.xMax + r && y > b.rc.yMin - r && y < b.rc.yMax + r; });
}
function zoneAt(zones, y) {
  for (var i = 0; i < zones.length; i++) if (y >= zones[i].y0 && y <= zones[i].y1) return i;
  return -1;
}

// Door, window and manhole spawn points (s.layout.spawns), after the street blocks exist. Deterministic: no rng, so a
// level always has the same points. Doors sit at the facade line on alternating sides, windows opposite and further up,
// manholes on the centre lane. A point inside a solid is skipped.
P.Layouts.spawns = function (s) {
  var L = s.layout, G = s.geo, K = P.CFG.layouts.spawn, y, sd, i = 0;
  for (y = K.from; y < G.exitY - K.endGap; y += K.every, i++) {
    sd = i % 2 ? 1 : -1;
    addSpawn(G, L, sd * K.sideX, y, sd, 'door');
    addSpawn(G, L, -sd * K.sideX, y + K.winOff, -sd, 'window');
  }
  for (y = K.from + K.manholeOff, i = 0; y < G.exitY - K.endGap; y += K.manholeEvery, i++) {
    sd = i % 2 ? 1 : -1;
    addSpawn(G, L, sd * K.manholeX, y, sd, 'manhole');
  }
};
function addSpawn(G, L, x, y, sd, kind) {
  if (freeAt(G, x, y, P.CFG.layouts.spawn.clear)) L.spawns.push({ x: x, y: y, side: sd, kind: kind });
}

// Level marks for the centre landmarks (levels.js adds them to s.gen.marks).
P.Layouts.marks = function (L) {
  return L.centre.map(function (c) { return { y: c.y, kind: 'landmark', x: c.x, ev: c.ev }; });
};

// A centre landmark's event, fired when the hero reaches it: an ambush from the side, a loot runner, or a hack terminal
// at the landmark (linked from the lane, within the terminal's reach).
P.Layouts.trigger = function (s, m) {
  // The terminal kind is one the hood has (journey.js hack); a hood with none of the centre kinds gets the full list.
  var all = P.CFG.layouts.centre.hack, own = s.gen.hood.hack || [], hk = all.filter(function (k) { return own.indexOf(k) >= 0; });
  if (!hk.length) hk = all;
  if (m.ev === 'hack') P.Hack.place(s, hk[s.rng.spawn.int(0, hk.length - 1)], m.x, m.y);
  else if (m.ev === 'ambush') P.Events.start(s, 'ambush', { x: m.x });
  else P.Events.start(s, 'loot', {});
};

// True when y lies in a layout zone (or within the zone gap), so street blocks stay out.
P.Layouts.inZone = function (geo, y) {
  return inZone(geo.zones || [], y, P.CFG.layouts.centre.zoneGap);
};

// Bot waypoint (tools/bot.js targetOf): the nearest chokepoint from `passed` m behind the hero up to `look` m ahead, or
// null. The bot has no path planner, so a chicane, market or bridge is walked gap by gap; the player steers on their own.
P.Layouts.botTarget = function (s) {
  var L = s.layout, R = P.CFG.layouts.route, h = s.hero, best = null, i, c;
  if (!L || !L.chokes.length) return null;
  for (i = 0; i < L.chokes.length; i++) {
    c = L.chokes[i];
    if (c.y < h.y - R.passed || c.y > h.y + R.look) continue;
    if (!best || c.y < best.y) best = c;
  }
  return best ? [best.x, best.y] : null;
};

// Chokepoint check for a route zone: at least minChokes gaps of maxChoke m or less. Returns problem strings.
P.Layouts.check = function (L) {
  var C = P.CFG.layouts, out = [];
  L.zones.forEach(function (z, i) {
    if (z.kind === 'arena') return;
    var n = L.chokes.filter(function (c) { return c.zone === i && c.w <= C.maxChoke; }).length;
    if (n < C.minChokes) out.push(z.kind + ' zone ' + i + ': ' + n + ' chokepoints');
  });
  return out;
};
