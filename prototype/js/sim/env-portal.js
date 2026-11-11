(function () {
// Spawn openings (lane A, AUDIT-6 A5): every door, window and manhole is a spawn point. As the hero approaches, an
// opening shows a telegraph ("kapı açılıyor", 0.6 s), then emits 2-4 enemies at 0.2 s intervals within 0.6 m of
// itself (never more than 1 m away). Each opening fires once per pass; a share of passes stay quiet. The door list
// comes from the L1 door config (P.CFG.level.doorsRight / doorsLeft), so the walls match the level's own doors.
// Numbers: P.CFG.env.portal.
P.EnvPortal = {};

// Openings for a generated level: doors on both walls, and a window above every other door (D-058: nothing comes up from below the ground).
P.EnvPortal.place = function (s) {
  var E = s.env, G = s.geo, C = P.CFG.env.portal, L = P.CFG.level, n = 0, doors = [], i;
  L.doorsRight.forEach(function (y2) { doors.push({ side: 1, y: y2 }); });
  L.doorsLeft.forEach(function (y2) { doors.push({ side: -1, y: y2 }); });
  var ok = function (y2) { return y2 >= C.yStart && y2 <= G.exitY - C.yEnd; };
  doors.forEach(function (d, k) {
    if (!ok(d.y)) return;
    addPortal(s, 'door', d.side * C.doorX, d.y, d.side);
    if (k % C.windowEvery === 0 && ok(d.y + C.windowDy)) addPortal(s, 'window', d.side * C.windowX, d.y + C.windowDy, d.side);
    n++;
  });
  for (i = 0; i < E.portals.length; i++) E.portals[i].id = i + 1;
};

function addPortal(s, kind, x, y, side) {
  s.env.portals.push({ kind: kind, x: x, y: y, side: side, state: 'idle', t: 0, T: 0, n: 0, k: 0, passed: false, id: 0 });
}

function activePortals(E) {
  var n = 0;
  for (var i = 0; i < E.portals.length; i++) if (E.portals[i].state !== 'idle') n++;
  return n;
}

// Enemies for one spawn: walkers, with a share of runners. Only roster types, and never past the level cap.
function pickType(s) {
  var E = s.env, C = P.CFG.env.portal, roster = s.gen ? s.gen.roster : ['walker'];
  var want = E.rng.chance(C.runnerShare) ? 'runner' : 'walker';
  return roster.indexOf(want) >= 0 ? want : 'walker';
}

// One enemy at the opening: a free spot within offset (clamped to the walls and the level), tried a few times.
function spawnOne(s, p) {
  var E = s.env, C = P.CFG.env.portal, G = s.geo, rng = E.rng, t, x, y, k, r = P.CFG.enemies.walker.radius;
  if (s.enemies.length >= P.CFG.levels.cap) return false;
  for (k = 0; k < C.tries; k++) {
    x = Math.min(Math.max(p.x + rng.range(-C.offset, C.offset), G.xMin + r), G.xMax - r);
    y = Math.min(Math.max(p.y + rng.range(-C.offset, C.offset), r), G.exitY - r);
    if (!P.Events.blocked(s, x, y)) break;
    if (k === C.tries - 1) return false;
  }
  t = pickType(s);
  // door: the opening the enemy came through. It also keeps lane C's entrance logic (enemies3.entrance) from moving
  // the spawn to a street spot ahead of the hero, and gives the door emerge fade in sprites.js.
  P.Combat.spawnEnemy(s, t, x, y, { skin: P.Events.skin(s), door: p });
  return true;
}

function openPortal(s, p) {
  var C = P.CFG.env.portal, E = s.env;
  p.state = 'open'; p.t = 0; p.T = C.telegraph; p.n = E.rng.int(C.nMin, C.nMax); p.k = 0;
  E.stats.portals++;
  s.events.push({ type: 'envPortal', kind: p.kind, id: p.id, x: p.x, y: p.y, side: p.side, T: C.telegraph });
}

// The spill: one enemy each gap seconds until n are out (or the cap stops them); then the opening goes quiet.
function spillPortal(s, p, dt) {
  var C = P.CFG.env.portal, E = s.env, got = 0;
  p.t += dt;
  while (p.k < p.n && p.t >= p.k * C.gap) {
    p.k++;
    if (spawnOne(s, p)) got++;
  }
  if (got) { E.stats.spawns += got; }
  if (p.k >= p.n) {
    p.state = 'idle'; p.passed = true;
    s.events.push({ type: 'envSpawn', kind: p.kind, id: p.id, x: p.x, y: p.y, n: p.n });
  }
}

P.EnvPortal.step = function (s, dt) {
  var E = s.env, C = P.CFG.env.portal, h = s.hero, list = E.portals, i, p;
  for (i = 0; i < list.length; i++) {
    p = list[i];
    if (p.state === 'open') {
      p.t += dt;
      if (p.t >= p.T) { p.state = 'spill'; p.t = 0; }
    } else if (p.state === 'spill') {
      spillPortal(s, p, dt);
    } else {
      if (h.y < p.y - C.behind) p.passed = false;
      if (p.passed || h.y < p.y - C.ahead || h.y > p.y + C.past || activePortals(E) >= C.maxActive) continue;
      p.passed = true;
      if (E.rng.chance(C.chance)) openPortal(s, p);
    }
  }
};
})();
