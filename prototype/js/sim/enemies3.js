// v0.7 enemies (lane C, AUDIT-6 C2/C3): kurye (scooter courier: a telegraphed diagonal dash across the street), copci
// (street sweeper: pushes a wheelie bin at the hero; the bin shoves zombies, hits the hero and leaves a trash slick),
// spawn entrances (manhole, window, balcony, tram door) and the boss-attack hooks for taksici and kasapBoss (bosses.js).
// Entrances and roster adds only run on generated levels (s.gen), so the L1 tutorial is unchanged. Numbers: config-enemies3.js.
P.Enemies3 = {};

(function (E3) {
  var TYPES = ['kurye', 'copci'];
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function unit(dx, dy) { var d = Math.hypot(dx, dy) || 1; return { x: dx / d, y: dy / d }; }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function cfg() { return P.CFG.enemies3; }
  function state(s) { return s.e3 || (s.e3 = { bins: [], blades: [] }); }

  E3.owns = function (type) { return TYPES.indexOf(type) >= 0; };

  // ---------- spawn setup ----------
  E3.init = function (s, e) {
    var K = cfg().kurye, C3 = cfg().copci;
    e.ai = e.type === 'kurye' ? { m: 'walk', cd: K.firstCd, t: 0, left: 0, dir: { x: 0, y: 0 } }
      : { m: 'walk', cd: C3.firstCd, t: 0, dir: { x: 0, y: 0 } };
  };

  E3.think = function (s, e, dt) { return e.type === 'kurye' ? kurye(s, e, dt) : copci(s, e, dt); };

  function chase(e, h, speed) {
    var u = unit(h.x - e.x, h.y - e.y);
    e.dvx = u.x * speed; e.dvy = u.y * speed;
    return true;
  }

  // Kurye: walks at the hero; within sense it telegraphs a diagonal lane across the street (0.8 s), then dashes along it.
  function kurye(s, e, dt) {
    var a = e.ai, K = cfg().kurye, h = s.hero, d = dist(e, h);
    a.cd = Math.max(0, a.cd - dt);
    if (a.m === 'tele') {
      e.dvx = 0; e.dvy = 0; a.t += dt;
      if (a.t >= K.tele) { a.m = 'dash'; a.left = K.dashLen; e.noSep = true; s.events.push({ type: 'kuryeDash', id: e.id, x: e.x, y: e.y }); }
      return true;
    }
    if (a.m === 'dash') {
      a.left -= K.dashSpeed * dt;
      if (a.left <= 0) { a.m = 'walk'; a.cd = K.cd; e.noSep = false; e.dvx = 0; e.dvy = 0; return true; }
      e.dvx = a.dir.x * K.dashSpeed; e.dvy = a.dir.y * K.dashSpeed;
      return true;
    }
    if (a.cd <= 0 && d <= K.sense && d >= K.minDash) {
      var side = e.x >= 0 ? -1 : 1, fy = h.y >= e.y ? 1 : -1;     // cross toward the other side, along the chase
      a.dir = unit(side * K.cross, fy * K.forward);
      a.m = 'tele'; a.t = 0; e.dvx = 0; e.dvy = 0;
      P.Enemies.lane(s, e.x, e.y, a.dir.x, a.dir.y, K.dashLen, K.laneW, K.tele).owner = e.id;
      return true;
    }
    return chase(e, h, e.speed);
  }

  // Copci: walks at the hero; every pushCd it winds up (ring on the spot ahead) and sends a bin rolling at the hero.
  function copci(s, e, dt) {
    var a = e.ai, C3 = cfg().copci, h = s.hero, d = dist(e, h);
    a.cd = Math.max(0, a.cd - dt);
    if (a.m === 'windup') {
      e.dvx = 0; e.dvy = 0; a.t += dt; e.windup = clamp01(a.t / C3.pushWindup);
      if (a.t >= C3.pushWindup) { e.windup = 0; a.m = 'walk'; a.cd = C3.pushCd; spawnBin(s, e, a.dir); }
      return true;
    }
    if (a.cd <= 0 && d <= C3.sense && d >= C3.minDist) {
      a.dir = unit(h.x - e.x, h.y - e.y); a.m = 'windup'; a.t = 0; e.dvx = 0; e.dvy = 0;
      P.Enemies.ring(s, e.x + a.dir.x * C3.reach, e.y + a.dir.y * C3.reach, C3.binR, C3.pushWindup, null, 'toxic').owner = e.id;
      s.events.push({ type: 'copciPush', id: e.id, x: e.x, y: e.y });
      return true;
    }
    return chase(e, h, e.speed);
  }

  function spawnBin(s, e, dir) {
    var C3 = cfg().copci;
    state(s).bins.push({ x: e.x + dir.x * C3.reach, y: e.y + dir.y * C3.reach, dx: dir.x, dy: dir.y, t: 0, owner: e.id, hitCd: 0 });
    s.events.push({ type: 'binRoll', id: e.id, x: e.x, y: e.y });
  }

  // Per-step runtime: rolling bins (shove, hero hit, trash drop). Blades are visual only (boss throw).
  E3.frame = function (s, dt) {
    if (!s.e3) return;
    var st = s.e3, C3 = cfg().copci, h = s.hero, hr = P.CFG.hero.radius, i, b;
    for (i = st.bins.length - 1; i >= 0; i--) {
      b = st.bins[i];
      b.t += dt; b.hitCd = Math.max(0, b.hitCd - dt);
      b.x += b.dx * C3.binSpeed * dt; b.y += b.dy * C3.binSpeed * dt;
      shoveZombies(s, b);
      if (b.hitCd <= 0 && dist(h, b) <= C3.binR + hr) {
        b.hitCd = C3.binHitCd;
        P.Combat.damageHero(s, P.Enemies.dmgOf(s, null, C3.binDmg), 'copci');
        P.Combat.pushHero(s, h.x - b.x, h.y - b.y, C3.binKb);
      }
      if (b.t >= C3.binLife || Math.abs(b.x) > s.geo.xMax) { dropTrash(s, b); st.bins.splice(i, 1); }
    }
    for (i = st.blades.length - 1; i >= 0; i--) { st.blades[i].t += dt; if (st.blades[i].t >= st.blades[i].dur) st.blades.splice(i, 1); }
  };

  function shoveZombies(s, b) {
    var C3 = cfg().copci;
    for (var i = 0; i < s.enemies.length; i++) {
      var o = s.enemies[i];
      if (o.dead || o.state !== 'active' || o.boss || o.id === b.owner) continue;
      var dx = o.x - b.x, dy = o.y - b.y, d = Math.hypot(dx, dy);
      if (d > C3.binR + o.r || d < 1e-3) continue;
      P.Combat.shove(o, dx / d, dy / d, C3.binShove);
    }
  }

  function dropTrash(s, b) {
    var T = cfg().copci.trash;
    s.zones.push({ kind: 'acid', x: b.x, y: b.y, r: T.r, t: T.t, T: T.t, dps: T.dps, heroDps: T.heroDps, tick: 0, hit: {}, trash: true });
    s.events.push({ type: 'binDrop', x: b.x, y: b.y, r: T.r });
  }

  // Thrown cleaver (kasapBoss): a visual blade from the boss to the spot, flying for the telegraph time.
  E3.launchBlade = function (s, x0, y0, x1, y1, dur) {
    state(s).blades.push({ x0: x0, y0: y0, x1: x1, y1: y1, dur: dur, t: 0 });
  };

  // Telegraph resolution for the boss swings and smashes (bosses.js). Returns true when handled here.
  E3.onTele = function (s, tg) {
    if (tg.then !== 'swing' && tg.then !== 'smash') return false;
    var h = s.hero, hr = P.CFG.hero.radius;
    s.events.push({ type: tg.then === 'smash' ? 'bossSmash' : 'bossSwing', x: tg.x, y: tg.y, r: tg.r, boss: tg.cause });
    if (dist(h, tg) - hr <= tg.r) {
      P.Combat.damageHero(s, tg.dmg, tg.cause);
      P.Combat.pushHero(s, h.x - tg.x, h.y - tg.y, tg.kb || tg.shove || 0);
    }
    return true;
  };

  // ---------- spawn entrances (called for every spawn from enemies.js init, before the enemy is pushed) ----------
  E3.entrance = function (s, e) {
    if (!s.gen || e.boss || e.door || e.state !== 'active') return;
    var E = cfg().entrance, rng = s.rng.ai;
    if (e.type === 'crawler') { startEntrance(s, e, 'manhole', E.crawlerT, 0); return; }
    var h = s.hero, ahead = e.y > h.y + 3, edge = Math.abs(e.x) > 4;
    if (!ahead && !edge) return;                       // spawns in view (behind, or near the hero) keep their spot
    if (!rng.chance(E.chance)) return;
    var kind = pickKind(rng, E), k = E.kinds[kind], x, y = h.y + rng.range(E.aheadMin, E.aheadMax);
    x = kind === 'manhole' ? rng.range(-E.manholeX, E.manholeX) : (rng.chance(0.5) ? -1 : 1) * (E.sideX + rng.range(-E.sideJit, E.sideJit));
    if (y > s.geo.exitY - 2 || blockedAt(s.geo, x, y, E.blockR)) return;
    e.x = x; e.y = y;
    startEntrance(s, e, kind, k.T, k.drop || 0);
  };

  function pickKind(rng, E) {
    var keys = Object.keys(E.kinds), tot = 0, i, r;
    for (i = 0; i < keys.length; i++) tot += E.kinds[keys[i]].w;
    r = rng.next() * tot;
    for (i = 0; i < keys.length; i++) { r -= E.kinds[keys[i]].w; if (r < 0) return keys[i]; }
    return keys[0];
  }

  function startEntrance(s, e, kind, T, drop) {
    e.state = 'rising'; e.stateT = T;
    e.entrance = { kind: kind, T: T, drop: drop };
    s.events.push({ type: 'enemyEnter', kind: kind, id: e.id, enemy: e.type, x: e.x, y: e.y });
  }

  function blockedAt(G, x, y, r) {
    return G.blocks.some(function (b) { return x > b.rc.xMin - r && x < b.rc.xMax + r && y > b.rc.yMin - r && y < b.rc.yMax + r; });
  }

  // ---------- roster adds (generated levels): wraps the build, levels.js stays unchanged ----------
  E3.augmentRoster = function (s) {
    var g = s.gen, hood = g && g.info && g.info.hood;
    if (!hood || g.stageIdx < P.CFG.enemyRosterFrom) return;
    (P.CFG.enemyRosterAdds[hood.id] || []).forEach(function (t) { if (g.roster.indexOf(t) < 0) g.roster.push(t); });
  };
  (function () {
    var build = P.Levels.build;
    P.Levels.build = function (s, index) { var r = build.apply(this, arguments); E3.augmentRoster(s); return r; };
  })();
})(P.Enemies3);
