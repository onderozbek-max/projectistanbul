// Journey level generator (workstream E2): levels 2..100 from P.Journey (journey.js). P.Levels.build sets
// s.geo (corridor, AABB blocks, landmarks), s.diff (difficulty multipliers), s.gen (route marks, spawns,
// hold, boss state). P.Levels.step runs each tick (called from P.Director.step for generated levels).
// Route: segments A-D spawn from the hood roster; stages 1-4 end in a hold at the exit gate; stage 5 is a
// boss arena (boss + adds). Win: gate open and the hero past it -> s.mode 'won' (same as L1).
P.Levels = {};

var SEG_IDS = ['A', 'B', 'C', 'D'];

P.Levels.stage = function (index) { return P.CFG.levels.stages[P.Journey.level(index).stage - 1]; };

// Difficulty multipliers for global index k = index-1: gentle early, steeper late (config diff).
P.Levels.difficulty = function (index) {
  var k = index - 1, D = P.CFG.levels.diff;
  return { hp: 1 + D.hpLin * k + D.hpQuad * k * k, dmg: 1 + D.dmgLin * k, spawn: Math.min(D.spawnCap, 1 + D.spawnLin * k),
    xp: 1 + D.xpLin * k };   // XP per kill grows with the index so the hero's power keeps pace with hp
};

function levelRng(s, index) {
  s.rng.level = P.makeRng((Math.imul((s.seed >>> 0) ^ 0x9E3779B9, 2654435761) + index * 40503) >>> 0);
  return s.rng.level;
}

// ---------- build ----------
P.Levels.build = function (s, index) {
  var info = P.Journey.level(index), st = P.Levels.stage(index), G0 = P.CFG.level.corridor, C = P.CFG.levels;
  var rng = levelRng(s, index), boss = !!st.boss;
  var exitY = Math.round(st.len + rng.range(-6, 6));
  var holdY = boss ? st.approach : exitY - C.holdDepth;
  var geo = { xMin: G0.xMin, xMax: G0.xMax, length: exitY + 4, exitY: exitY, holdY: holdY,
    holdT: boss ? 0 : st.holdT, boss: boss, blocks: [], landmarks: [] };
  s.geo = geo;
  s.diff = P.Levels.difficulty(index);
  s.props = { carts: [], canisters: [], doorOpen: true, shutter: 0, shutterOpen: false, scaffoldDown: false, geo: geo };
  s.hero.x = 0; s.hero.y = 2;
  s.dir.hold.T = geo.holdT;
  s.gen = { info: info, st: st, stageIdx: info.stage, hood: info.hood, roster: rosterOf(info.hood), skins: info.hood.skins,
    marks: [], mi: 0, seg: 'A', acc: 0, next: null, arena: false, bossSpawned: false, boss: null, won: false, midDone: false, t: 0 };
  layBlocks(geo, rng);
  layLandmarks(geo, rng);
  s.gen.marks = makeMarks(st, holdY, boss);
  civilians(s);
  s.events.push({ type: 'segment', id: 'A' });
  s.events.push({ type: 'story', id: info.id, when: 'start' });
  return s;
};

function rosterOf(hood) { return hood.enemies.filter(function (t) { return t !== 'diner'; }); }

// Route marks by distance (sorted): route quarters, mid story beat, elites, ambush, intro, hold or arena.
function makeMarks(st, end, boss) {
  var marks = [], i;
  for (i = 1; i < 4; i++) marks.push({ y: end * i / 4, kind: 'seg', id: SEG_IDS[i] });
  marks.push({ y: end * 0.5, kind: 'mid' });
  if (st.intro) marks.push({ y: end * 0.35, kind: 'intro' });
  (st.elites || []).forEach(function (f) { marks.push({ y: end * f, kind: 'elite' }); });
  if (st.ambush) marks.push({ y: end * 0.55, kind: 'ambush' });
  marks.push(boss ? { y: end, kind: 'arena' } : { y: end, kind: 'hold' });
  marks.sort(function (a, b) { return a.y - b.y; });
  return marks;
}


// Corridor blocks: sides only (inner edge >= sideMin) so the centre lane stays open for pathing.
function layBlocks(geo, rng) {
  var B = P.CFG.levels.block, K = P.CFG.levels.kinds, y = B.startClear, end = geo.exitY - 6;
  var wide = P.CFG.levels.wideKinds, small = P.CFG.levels.smallKinds;
  while (y < end) {
    [-1, 1].forEach(function (side) {
      if (!rng.chance(B.sideChance)) return;
      var kind = rng.chance(0.7) ? wide[rng.int(0, wide.length - 1)] : small[rng.int(0, small.length - 1)];
      var w = K[kind][0], h = K[kind][1];
      var x = side * (B.sideMin + w / 2 + rng.range(0, 0.8)), by = y + rng.range(-1, 1);
      if (Math.abs(x) + w / 2 > geo.xMax - 0.5) return;
      addBlock(geo, kind, x, by, w, h);
    });
    y += B.slot + rng.range(0, 6);
  }
}

function addBlock(geo, kind, x, y, w, h) {
  var clash = geo.blocks.some(function (b) {
    return Math.abs(b.x - x) < (b.w + w) / 2 + 0.6 && Math.abs(b.y - y) < (b.h + h) / 2 + 0.6;
  });
  if (clash) return;
  geo.blocks.push({ kind: kind, x: x, y: y, w: w, h: h,
    rc: { xMin: x - w / 2, xMax: x + w / 2, yMin: y - h / 2, yMax: y + h / 2 } });
}

function layLandmarks(geo, rng) {
  var L = P.CFG.levels.landmarks, y = 12;
  while (y < geo.exitY - 4) {
    geo.landmarks.push({ kind: L[rng.int(0, L.length - 1)], y: y, side: rng.chance(0.5) ? 1 : -1 });
    y += rng.range(14, 24);
  }
  geo.landmarks.push({ kind: 'gate', y: geo.exitY, side: 0 });
  if (geo.boss) geo.landmarks.push({ kind: 'arena', y: geo.holdY, side: 0 });
}

// A few fleeing civilians at the start (generic version of the L1 panic crowd).
function civilians(s) {
  var C = P.CFG.levels.civilians, rng = s.rng.spawn;
  for (var g = 0; g < C.groups; g++) {
    var gx = rng.range(-5, 5), gy = 9 + g * 6, delay = g * 0.9;
    for (var i = 0; i < C.perGroup; i++) {
      s.dir.civilians.push({ x: gx + rng.range(-1, 1), y: gy + rng.range(-0.8, 0.8), life: C.life + delay, delay: delay,
        sp: C.fleeSpeed * rng.range(0.85, 1.15), drift: rng.range(-1.2, 1.2), variant: rng.int(0, 7),
        walk: rng.range(0, 3), scream: i === 0 ? 1.6 : 0 });
    }
  }
}

// ---------- per tick ----------
P.Levels.step = function (s, dt) {
  var g = s.gen, G = s.geo;
  if (g.won) return;
  g.t += dt;
  processMarks(s);
  if (G.boss) bossStage(s, dt); else holdStage(s, dt);
  P.Director.decor(s, dt);
  winCheck(s);
};

function processMarks(s) {
  var g = s.gen, h = s.hero;
  while (g.mi < g.marks.length && h.y >= g.marks[g.mi].y) doMark(s, g.marks[g.mi++]);
}

function doMark(s, m) {
  var g = s.gen;
  if (m.kind === 'seg') { g.seg = m.id; s.events.push({ type: 'segment', id: m.id }); }
  else if (m.kind === 'mid') { g.midDone = true; s.events.push({ type: 'story', id: g.info.id, when: 'mid' }); }
  else if (m.kind === 'intro') introGroup(s);
  else if (m.kind === 'elite') eliteAt(s);
  else if (m.kind === 'ambush') ambush(s);
  else if (m.kind === 'hold') startHold(s);
  else if (m.kind === 'arena') startArena(s);
}

function holdStage(s, dt) {
  var G = s.geo, hold = s.dir.hold;
  if (hold.active) {
    hold.t += dt;
    s.props.shutter = Math.min(1, hold.t / G.holdT);
    if (hold.t >= G.holdT && !s.props.shutterOpen) openGate(s);
    if (!s.props.shutterOpen && hold.t < G.holdT - P.CFG.levels.holdStopBefore) spawnHold(s, dt);
  } else if (s.hero.y < G.holdY) spawnRoute(s, dt);
}

function startHold(s) {
  var hold = s.dir.hold;
  if (hold.active || s.props.shutterOpen) return;
  hold.active = true; hold.t = 0; hold.T = s.geo.holdT;
  s.dir.zoomOut = true;
  s.events.push({ type: 'holdStart' });
}

function openGate(s) {
  s.props.shutterOpen = true; s.props.shutter = 1; s.dir.hold.active = false;
  s.events.push({ type: 'shutterOpen' });
}

function bossStage(s, dt) {
  var g = s.gen;
  if (g.boss && g.boss.dead && !s.props.shutterOpen) openGate(s);
  if (!g.arena) spawnRoute(s, dt);
  else if (g.boss && !g.boss.dead && !s.props.shutterOpen) spawnAdds(s, dt);
}

function winCheck(s) {
  var g = s.gen, G = s.geo, h = s.hero;
  if (s.props.shutterOpen && h.y >= G.exitY + 0.6 && s.mode === 'play') {
    g.won = true;
    s.mode = 'won';
    s.events.push({ type: 'story', id: g.info.id, when: 'end' });
    s.events.push({ type: 'win' });
  }
}

// ---------- spawning ----------
function segIndex(g) { return SEG_IDS.indexOf(g.seg); }

function spawnRoute(s, dt) {
  var g = s.gen, C = P.CFG.levels, seg = Math.max(0, segIndex(g));
  spawnBudget(s, dt, g.st.rate * C.segRate[seg] * s.diff.spawn, routeMix(s, seg), g.st.behind);
}

function spawnHold(s, dt) {
  var g = s.gen, C = P.CFG.levels, t = s.dir.hold.t, ph = t < C.holdPhaseT[0] ? 0 : t < C.holdPhaseT[1] ? 1 : 2;
  spawnBudget(s, dt, g.st.rate * C.holdRate[ph] * s.diff.spawn, routeMix(s, 3), 0.5);
}

function spawnAdds(s, dt) {
  var g = s.gen, C = P.CFG.levels;
  spawnBudget(s, dt, g.st.rate * C.bossAddRate * s.diff.spawn, routeMix(s, 3), 0.2);
}

// Budget spawner (like L1 runBudget): accumulate budget/s, spawn the picked type when affordable.
function spawnBudget(s, dt, rate, mix, behind) {
  var g = s.gen, guard = 0;
  if (rate <= 0) return;
  if (!g.next) g.next = pickType(s, mix);
  var cost = costOf(g.next);
  g.acc = Math.min(g.acc + rate * dt, cost + 1);
  while (g.acc >= cost && guard++ < 3) {
    if (s.enemies.length >= P.CFG.levels.cap) break;
    if (!spawnOne(s, g.next, behind)) break;
    g.acc -= cost;
    g.next = pickType(s, mix); cost = costOf(g.next);
  }
}

function costOf(type) {
  var d = P.CFG.enemies[type];
  return d && d.budget !== undefined ? d.budget : (P.CFG.budgetOf[type] || 1);
}

function pickType(s, mix) {
  var tot = 0, i, r;
  for (i = 0; i < mix.length; i++) tot += mix[i].w;
  r = s.rng.spawn.next() * tot;
  for (i = 0; i < mix.length; i++) { r -= mix[i].w; if (r < 0) return mix[i].type; }
  return mix[0].type;
}

// Route mix for a segment: walkers and runners, the hood's specials scale up through the route.
function routeMix(s, seg) {
  var st = s.gen.st, share = [0.6, 0.8, 1.0, 1.1][seg];
  return s.gen.roster.map(function (t) {
    var w;
    if (t === 'walker') w = 1;
    else if (t === 'runner') w = seg === 0 ? 0.2 : 0.5;
    else if (t === 'crawler') w = 0.35;
    else w = st.newShare * share;
    return { type: t, w: w };
  });
}

function spawnOne(s, type, behindShare) {
  var pos = spotFor(s, s.rng.spawn.chance(behindShare || 0));
  if (!pos) return false;
  if (type === 'crawler') {
    s.dir.telegraphs.push({ x: pos.x, y: pos.y, r: 0.8, t: 0, T: P.CFG.levels.crawlerTelegraph, then: 'emerge', skin: pickSkin(s) });
    return true;
  }
  P.Combat.spawnEnemy(s, type, pos.x, pos.y, { skin: pickSkin(s) });
  if (pos.behind) s.events.push({ type: 'groan', x: pos.x, y: pos.y });
  return true;
}

function pickSkin(s) {
  var sk = s.gen.skins;
  return sk[s.rng.spawn.int(0, sk.length - 1)];
}

// Spawn spot outside the view: ahead (or behind, groan cue), else at the side walls. Never beyond the gate.
function spotFor(s, behind) {
  var h = s.hero, G = s.geo, C = P.CFG.levels, rng = s.rng.spawn, limit = G.exitY - 1.5;
  var half = P.viewHalfH(s.dir.zoomOut ? P.CFG.view.holdWidthM : P.CFG.view.widthM) + P.CFG.view.offscreenMargin;
  for (var k = 0; k < 6; k++) {
    var pick = k < 4 ? (behind ? 'behind' : 'ahead') : 'side', x, y;
    if (pick === 'side') { x = (rng.chance(0.5) ? 1 : -1) * C.sideX; y = h.y + rng.range(-6, 6); }
    else {
      x = rng.range(G.xMin + 1, G.xMax - 1);
      y = pick === 'ahead' ? h.y + half + rng.range(C.spawnAhead.gap, C.spawnAhead.depth)
        : h.y - half - rng.range(C.spawnBehind.gap, C.spawnBehind.depth);
    }
    if (y < 0.5 || y > limit || blockedAt(G, x, y, 0.5)) continue;
    return { x: x, y: y, behind: pick === 'behind' };
  }
  return null;
}

function blockedAt(G, x, y, r) {
  return G.blocks.some(function (b) {
    return x > b.rc.xMin - r && x < b.rc.xMax + r && y > b.rc.yMin - r && y < b.rc.yMax + r;
  });
}

// ---------- scripted beats ----------
function introGroup(s) {
  var type = s.gen.roster.filter(function (t) { return t === 'spitter' || t === 'bloater' || t === 'brute'; })[0]
    || s.gen.roster.filter(function (t) { return t === 'crawler'; })[0] || 'walker';
  for (var i = 0; i < P.CFG.levels.introCount; i++) spawnOne(s, type, 0);
}

function eliteAt(s) {
  var h = s.hero, rng = s.rng.spawn, type = s.gen.roster.indexOf('spitter') >= 0 ? 'spitter' : 'walker';
  var x = rng.range(-3, 3), y = Math.min(s.geo.exitY - 2, h.y + P.CFG.levels.eliteLead);
  P.Combat.spawnEnemy(s, type, x, y, { elite: true, skin: pickSkin(s) });
}

function ambush(s) {
  var A = P.CFG.levels.ambush, h = s.hero, rng = s.rng.spawn, n = A.walkers + A.runners;
  for (var i = 0; i < n; i++) {
    var type = i < A.walkers ? 'walker' : 'runner', side = i % 2 ? 1 : -1;
    var y = Math.min(s.geo.exitY - 2, h.y + rng.range(A.yMin, A.yMax));
    P.Combat.spawnEnemy(s, type, side * A.x, y, { skin: pickSkin(s) });
  }
  s.events.push({ type: 'ambush', x: 0, y: h.y });
}

// Boss arena: boss ahead of the hero (intro banner via bossIntro), adds around it, story 'boss' beat.
function startArena(s) {
  var g = s.gen, h = s.hero, hood = g.hood, C = P.CFG.levels;
  g.arena = true;
  s.dir.zoomOut = true;
  var y = Math.min(s.geo.exitY - 4, h.y + C.arenaBossAhead);
  g.boss = P.Bosses.spawn(s, hood.boss, 0, y, { nameKey: 'boss.' + hood.id, hoodIdx: g.info.hoodIndex,
    skin: hood.skins[0], hoodId: hood.id });
  g.bossSpawned = true;
  s.events.push({ type: 'story', id: g.info.id, when: 'boss' });
  for (var i = 0; i < C.bossAddStart; i++) {
    var a = (i / C.bossAddStart) * Math.PI * 2, type = g.roster[i % g.roster.length];
    P.Combat.spawnEnemy(s, type === 'crawler' ? 'walker' : type, g.boss.x + Math.cos(a) * 4.5, g.boss.y + Math.sin(a) * 4.5, { skin: pickSkin(s), state: 'turning', stateT: C.bossIntro });
  }
}
