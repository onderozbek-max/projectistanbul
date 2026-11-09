(function () {
// Environment zones (lane A): wet tiles (puddles), glass and debris slicks, extinguisher foam, gas clouds from fuses,
// and live cables that zap every puddle they reach. Zones live in s.env.zones. Wet tiles slow the hero (heroMul,
// read by stepHero) and enemies (P.Status slow); cables shock enemies (stun and damage) and the hero in a linked
// puddle. Numbers: P.CFG.env (puddle, glass, debris, foam, cable, cloud).
P.EnvZones = {};

function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

// Distance from (px, py) to the segment (ax, ay)-(bx, by).
function segDist(px, py, ax, ay, bx, by) {
  var dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1;
  var t = Math.min(1, Math.max(0, ((px - ax) * dx + (py - ay) * dy) / L2));
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

P.EnvZones.add = function (s, kind, x, y, r, T, slow, rec) {
  var z = { kind: kind, x: x, y: y, r: r, t: T, T: T, slow: slow || 0, rec: rec || null, gas: kind === 'gas', arcT: 0, live: 0 };
  s.env.zones.push(z);
  return z;
};

// Remove the clouds that belong to one record (detonated or vented).
P.EnvZones.drop = function (s, r) {
  s.env.zones = s.env.zones.filter(function (z) { return z.rec !== r; });
};

P.EnvZones.placeCable = function (s) {
  var E = s.env, C = P.CFG.env.cable, G = s.geo;
  if (!E.rng.chance(C.chance)) return;
  E.cables.push({ x: E.rng.range(-C.xMax, C.xMax), y: G.exitY * E.rng.range(C.y0, C.y1), len: C.len, zapT: C.every, arcing: false });
};

function linked(z, c, C) {
  return segDist(z.x, z.y, c.x - c.len / 2, c.y, c.x + c.len / 2, c.y) <= C.reach + z.r;
}

// A zap: every puddle the cable reaches shocks what stands in it. Quiet when nothing is linked.
function zap(s, c) {
  var C = P.CFG.env.cable, E = s.env, h = s.hero, Z = E.zones, hits = 0, heroHit = false, found = false, i, j, z, e;
  for (i = 0; i < Z.length; i++) {
    z = Z[i];
    if (z.kind !== 'puddle' || !linked(z, c, C)) continue;
    found = true; z.live = C.show;
    for (j = 0; j < s.enemies.length; j++) {
      e = s.enemies[j];
      if (e.dead || e.state !== 'active' || dist(e, z) > z.r + e.r) continue;
      P.Combat.damageEnemy(s, e, C.dmg, 0, 0, 0, false, 'shock');
      P.Status.apply(e, 'stun', C.stun, 1);
      hits++;
    }
    if (Math.hypot(h.x - z.x, h.y - z.y) <= z.r + P.CFG.hero.radius) { P.Combat.damageHero(s, C.heroDmg, 'shock'); heroHit = true; }
  }
  if (!found) return;
  E.stats.zaps++;
  s.events.push({ type: 'envShock', x: c.x, y: c.y, r: C.reach, n: hits, hero: heroHit });
}

function stepCables(s, dt) {
  var C = P.CFG.env.cable, cables = s.env.cables;
  for (var i = 0; i < cables.length; i++) {
    var c = cables[i];
    c.zapT -= dt;
    c.arcing = c.zapT <= C.telegraph;
    if (c.zapT <= 0) { c.zapT = C.every; zap(s, c); }
  }
}

function spawnPuddle(s) {
  var C = P.CFG.env.puddle, E = s.env, h = s.hero, x, y, c, a, rad, n = 0;
  E.zones.forEach(function (z) { if (z.kind === 'puddle') n++; });
  if (n >= C.max) return;
  if (E.cables.length && E.rng.chance(C.nearCable)) {
    c = E.cables[E.rng.int(0, E.cables.length - 1)];
    x = c.x + E.rng.range(-c.len / 2, c.len / 2); y = c.y + E.rng.range(-1, 1);
  } else {
    a = E.rng.range(0, Math.PI * 2); rad = E.rng.range(C.rMin, C.rMax);
    x = h.x + Math.cos(a) * rad; y = h.y + Math.sin(a) * rad;
  }
  x = P.Events.clampX(s, x); y = P.Events.clampY(s, y);
  if (P.Events.blocked(s, x, y)) return;
  P.EnvZones.add(s, 'puddle', x, y, C.r, C.T, C.enemySlow);
  E.stats.puddles++;
  s.events.push({ type: 'envPuddle', x: x, y: y, r: C.r, T: C.T });
}

function stepPuddles(s, dt) {
  var C = P.CFG.env.puddle, E = s.env;
  E.puddleT -= dt;
  if (E.puddleT > 0) return;
  E.puddleT = C.every;
  spawnPuddle(s);
}

// Each tick: enemies inside a slow zone keep the slow (refreshed, so it ends soon after they leave).
function slowEnemies(s) {
  var Z = s.env.zones, hold = P.CFG.env.slowHold, i, j, e, z, any = false;
  for (i = 0; i < Z.length; i++) if (Z[i].slow > 0) { any = true; break; }
  if (!any) return;
  for (j = 0; j < s.enemies.length; j++) {
    e = s.enemies[j];
    if (e.dead || e.state !== 'active') continue;
    for (i = 0; i < Z.length; i++) {
      z = Z[i];
      if (z.slow > 0 && dist(e, z) <= z.r + e.r) P.Status.apply(e, 'slow', hold, z.slow);
    }
  }
}

function heroWet(s) {
  var E = s.env, Z = E.zones, h = s.hero, C = P.CFG.env.puddle, m = 1;
  for (var i = 0; i < Z.length; i++) {
    if (Z[i].kind === 'puddle' && Math.hypot(h.x - Z[i].x, h.y - Z[i].y) <= Z[i].r) { m = 1 - C.heroSlow; break; }
  }
  E.heroMul = m;
}

P.EnvZones.step = function (s, dt) {
  var Z = s.env.zones;
  for (var i = Z.length - 1; i >= 0; i--) {
    var z = Z[i];
    z.t -= dt;
    if (z.live > 0) z.live = Math.max(0, z.live - dt);
    if (z.arcT > 0) z.arcT = Math.max(0, z.arcT - dt);
    if (z.t <= 0) Z.splice(i, 1);
  }
  stepPuddles(s, dt);
  stepCables(s, dt);
  slowEnemies(s);
  heroWet(s);
};
})();
