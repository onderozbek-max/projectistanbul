(function () {
// Environment core (lane A, AUDIT-6 A1-A5). Breakable cover, gas canisters, burning explosive cars, extinguishers,
// wet tiles and glass, live cables, door / window / manhole spawns, and weapon x terrain rules. State is s.env and
// exists on generated levels only (s.geo), so the scripted L1 beats are untouched. Every number is in P.CFG.env.
// Modules: env-kinds.js (cover, canisters, cars, extinguishers, blasts), env-zones.js (wet tiles, glass, foam,
// gas clouds, cable zaps), env-rules.js (molotov, lob and arc rules), env-portal.js (door, window, manhole spawns).
// Events (s.events, read by the view, barks and bot): envBreak, envFuse, envLeak, envChain, envExplode, envIgnite,
// envArc, envShock, envPuddle, envExtinguish, envPortal, envSpawn, envHit. Blasts also push the L1 'explode'.
P.Env = {};

function newState(s) {
  var C = P.CFG.env;
  return {
    t: 0, puddleT: C.puddle.every, recs: [], zones: [], cables: [], portals: [], arcs: [], heroMul: 1,
    rng: P.makeRng(((s.seed >>> 0) ^ C.seedSalt) + (s.levelIndex || 1) * C.seedStep),
    stats: { breaks: 0, blasts: 0, chains: 0, ignites: 0, arcs: 0, zaps: 0, puddles: 0, spawns: 0, portals: 0, extinguish: 0 },
  };
}

function isCar(kind) { return kind === 'car' || kind === 'taxi' || kind === 'dolmus'; }
P.Env.isCar = isCar;

// Attach a breakable record to an existing block (levels.js kinds with hp). Cars have a share of bombs.
function adopt(s, b, kind) {
  var E = s.env, C = P.CFG.env, hp = C.hp[kind];
  var rec = { env: true, alive: true, kind: kind, b: b, x: b.x, y: b.y, r: Math.min(b.w, b.h) / 2 + C.recPad,
    hp: hp, max: hp, bomb: isCar(kind) && E.rng.chance(C.bombShare), fuseT: 0, fuseMax: 0, fuseVia: null, flash: 0, dashed: null };
  E.recs.push(rec); b.rec = rec;
  return rec;
}
P.Env.adopt = adopt;

// Solid env props (gas canisters, extinguishers): side lane only, clash-checked, and the level must stay passable.
function addSolid(s, kind, x, y, w, h) {
  var G = s.geo, C = P.CFG.env, i, b;
  for (i = 0; i < G.blocks.length; i++) {
    b = G.blocks[i];
    if (Math.abs(b.x - x) < (b.w + w) / 2 + C.clashGap && Math.abs(b.y - y) < (b.h + h) / 2 + C.clashGap) return false;
  }
  if (Math.abs(x) + w / 2 > G.xMax - C.edgeGap) return false;
  b = { kind: kind, x: x, y: y, w: w, h: h, rc: { xMin: x - w / 2, xMax: x + w / 2, yMin: y - h / 2, yMax: y + h / 2 } };
  G.blocks.push(b);
  if (!P.Env.pathOpen(s)) { G.blocks.pop(); return false; }
  if (C.hp[kind] !== undefined) adopt(s, b, kind);
  return true;
}

function placeSolids(s, kind, S) {
  var E = s.env, G = s.geo, C = P.CFG.env, y, x, side;
  for (y = S.every; y < G.exitY - C.endGap; y += S.every) {
    if (!E.rng.chance(S.chance)) continue;
    side = E.rng.chance(C.sideChance) ? 1 : -1;
    x = side * E.rng.range(C.sideMin, G.xMax - S.w / 2 - C.edgeGap);
    addSolid(s, kind, x, y + E.rng.range(-C.jitter, C.jitter), S.w, S.h);
  }
}

// Level placement (generated levels). Idempotent: a second call (B's generator and the sim hook) does nothing.
P.Env.place = function (s, info) {
  if (!s.geo || s.env) return s.env || null;
  var E = (s.env = newState(s)), C = P.CFG.env;
  s.geo.blocks.slice().forEach(function (b) { if (C.hp[b.kind] !== undefined) adopt(s, b, b.kind); });
  placeSolids(s, 'gascan', C.gas);
  placeSolids(s, 'extinguisher', C.extinguisher);
  P.EnvPortal.place(s);
  P.EnvZones.placeCable(s);
  E.info = info ? { hood: info.hood && info.hood.id, stage: info.stage } : null;
  return E;
};

// Path test: a grid flood fill from the start to the exit gate. Placement must keep it open (AUDIT-6 A1 accept).
// A cell centre is open when the hero's circle fits: inside the walls and clear of every block rectangle.
function cellOpen(G, R, x, y) {
  if (x < G.xMin + R || x > G.xMax - R || y < R) return false;
  for (var m = 0; m < G.blocks.length; m++) {
    var rc = G.blocks[m].rc;
    if (x > rc.xMin - R && x < rc.xMax + R && y > rc.yMin - R && y < rc.yMax + R) return false;
  }
  return true;
}

P.Env.pathOpen = function (s) {
  var G = s.geo, C = P.CFG.env, R = P.CFG.hero.radius, cell = C.pathCell;
  var nx = Math.ceil((G.xMax - G.xMin) / cell) + 1, ny = Math.ceil(G.exitY / cell) + 2, n = nx * ny;
  var seen = new Uint8Array(n), q = new Int32Array(n), head = 0, tail = 0, k, i, j, c, cx, cy, d;
  var goalY = G.exitY - R - cell, DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  var start = Math.round(C.pathStartY / cell) * nx + Math.round((0 - G.xMin) / cell);
  seen[start] = 1; q[tail++] = start;
  while (head < tail) {
    k = q[head++]; i = k % nx; j = (k - i) / nx;
    if (j * cell >= goalY) return true;
    for (d = 0; d < DIRS.length; d++) {
      cx = i + DIRS[d][0]; cy = j + DIRS[d][1];
      if (cx < 0 || cy < 0 || cx >= nx || cy >= ny) continue;
      c = cy * nx + cx;
      if (seen[c] || !cellOpen(G, R, G.xMin + cx * cell, cy * cell)) continue;
      seen[c] = 1; q[tail++] = c;
    }
  }
  return false;
};

// Combat hook: the props that weapons and blasts can hit (alive breakable records). Used by P.Combat.forEachProp.
P.Env.eachProp = function (s, fn) {
  var R = s.env.recs;
  for (var i = 0; i < R.length; i++) if (R[i].alive) fn(R[i]);
};

// Hero speed multiplier from wet tiles (read by stepHero before the env step, so last tick's value).
P.Env.heroMul = function (s) { return s.env ? s.env.heroMul : 1; };

// Event scan: rules react to this tick's events (molotov landings, canister blasts). Each event is handled once.
function scan(s) {
  var ev = s.events, i, e;
  for (i = 0; i < ev.length; i++) {
    e = ev[i];
    if (e.envSeen) continue;
    e.envSeen = true;
    if (e.type === 'flaskShatter') P.EnvRules.molotov(s, e);
    else if (e.type === 'blast' && e.small) P.EnvRules.lob(s, e);
  }
}

// Fires heat gas canisters and bomb cars; a lit fuse counts down and detonates.
function stepFuses(s, dt) {
  var R = s.env.recs, i, r;
  for (i = 0; i < R.length; i++) {
    r = R[i];
    if (!r.alive) continue;
    if (r.flash > 0) r.flash = Math.max(0, r.flash - dt);
    if (r.fuseT > 0) {
      r.fuseT -= dt;
      if (r.fuseT <= 0) P.Env.detonate(s, r);
    } else if (r.kind === 'gascan' || r.bomb) {
      if (fireNear(s, r)) P.Env.fuse(s, r, 'fire', P.CFG.env.fuse.fire);
    }
  }
}

function fireNear(s, r) {
  var Z = s.zones;
  for (var i = 0; i < Z.length; i++) {
    if (Z[i].kind === 'fire' && Math.hypot(Z[i].x - r.x, Z[i].y - r.y) <= Z[i].r + r.r) return true;
  }
  return false;
}

// Dash contact (skills.js sets s.sk.dash and hero.dashing): cover in the path takes dashDmg once per dash.
function stepDash(s) {
  var h = s.hero, dash = s.sk && s.sk.dash, R = s.env.recs, i, r;
  if (!dash || !h.dashing) return;
  for (i = 0; i < R.length; i++) {
    r = R[i];
    if (!r.alive || r.fuseT > 0 || r.dashed === dash) continue;
    if (Math.hypot(r.x - h.x, r.y - h.y) - r.r > P.CFG.hero.radius) continue;
    r.dashed = dash;
    P.Env.hitProp(s, r, P.CFG.env.dashDmg);
  }
}

function prune(s) {
  var E = s.env;
  if (E.recs.some(function (r) { return !r.alive; })) E.recs = E.recs.filter(function (r) { return r.alive; });
}

P.Env.step = function (s, dt) {
  if (!s.env) return;
  s.env.t += dt;
  scan(s);
  P.EnvRules.arcs(s, dt);
  stepFuses(s, dt);
  stepDash(s);
  P.EnvZones.step(s, dt);
  P.EnvPortal.step(s, dt);
  prune(s);
};

P.Env.stepFuses = stepFuses;
P.Env.stepDash = stepDash;
})();
