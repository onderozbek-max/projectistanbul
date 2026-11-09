// v0.7 enemies (lane C, AUDIT-6 C2/C3), wave 2 (C2-C3 gaps): kurye (scooter courier: a telegraphed diagonal dash across
// the street), copci (street sweeper: pushes a wheelie bin, and every second push a crate, at the hero; each rolls, shoves
// zombies, hits the hero and leaves a trash slick where it stops), spawn entrances (A5 openings rise for 0.6 s; route
// spawns may use a manhole, window, balcony or tram door; a layout's openings, if it lists any) and the boss-attack hooks
// for taksici and kasapBoss (bosses.js). Entrances and roster adds only run on generated levels (s.gen), and never in a
// boss arena (summoned adds keep their spot). Numbers: config-enemies3.js, config-enemies4.js.
P.Enemies3 = {};

(function (E3) {
  var TYPES = ['kurye', 'copci'];
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function unit(dx, dy) { var d = Math.hypot(dx, dy) || 1; return { x: dx / d, y: dy / d }; }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function cfg() { return P.CFG.enemies3; }
  function cfg4() { return P.CFG.enemies4 || {}; }
  function state(s) { return s.e3 || (s.e3 = { bins: [], blades: [] }); }

  E3.owns = function (type) { return TYPES.indexOf(type) >= 0; };

  // ---------- spawn setup ----------
  E3.init = function (s, e) {
    var K = cfg().kurye, C3 = cfg().copci;
    e.ai = e.type === 'kurye' ? { m: 'walk', cd: K.firstCd, t: 0, left: 0, dir: { x: 0, y: 0 } }
      : { m: 'walk', cd: C3.firstCd, t: 0, pushes: 0, dir: { x: 0, y: 0 } };
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

  // Copci: walks at the hero; every pushCd it winds up (ring on the spot ahead) and sends a bin (or a crate) rolling at the hero.
  function copci(s, e, dt) {
    var a = e.ai, C3 = cfg().copci, h = s.hero, d = dist(e, h);
    a.cd = Math.max(0, a.cd - dt);
    if (a.m === 'windup') {
      e.dvx = 0; e.dvy = 0; a.t += dt; e.windup = clamp01(a.t / pushT());
      if (a.t >= pushT()) { e.windup = 0; a.m = 'walk'; a.cd = C3.pushCd; spawnBin(s, e, a); }
      return true;
    }
    if (a.cd <= 0 && d <= C3.sense && d >= C3.minDist) {
      a.dir = unit(h.x - e.x, h.y - e.y); a.m = 'windup'; a.t = 0; e.dvx = 0; e.dvy = 0;
      P.Enemies.ring(s, e.x + a.dir.x * C3.reach, e.y + a.dir.y * C3.reach, C3.binR, pushT(), null, 'toxic').owner = e.id;
      s.events.push({ type: 'copciPush', id: e.id, x: e.x, y: e.y });
      return true;
    }
    return chase(e, h, e.speed);
  }

  // Telegraph floor (config-enemies4 telegraphMin): no windup is shorter than it.
  function tele(W) { var m = cfg4().telegraphMin; return m > W ? m : W; }
  function pushT() { return tele(cfg().copci.pushWindup); }

  // Every every-th push is a crate (heavier, shorter-lived); the others are wheelie bins.
  function spawnBin(s, e, a) {
    var C3 = cfg().copci, every = (cfg4().crate || {}).every || 0, n, crate, dir = a.dir;
    a.pushes = (a.pushes || 0) + 1;
    n = a.pushes;
    crate = every > 0 && n % every === 0;
    state(s).bins.push({ kind: crate ? 'crate' : 'bin', x: e.x + dir.x * C3.reach, y: e.y + dir.y * C3.reach, dx: dir.x, dy: dir.y,
      t: 0, owner: e.id, hitCd: 0 });
    s.events.push({ type: 'binRoll', id: e.id, x: e.x, y: e.y, crate: crate });
  }

  // Per-kind numbers: a bin uses the copci block, a crate its own block (config-enemies4.js).
  function binCfg(b) { return b.kind === 'crate' ? cfg4().crate : cfg().copci; }

  // Per-step runtime: rolling bins and crates (shove, hero hit, trash drop). Blades are visual only (boss throw).
  E3.frame = function (s, dt) {
    if (!s.e3) return;
    var st = s.e3, h = s.hero, hr = P.CFG.hero.radius, i, b, K;
    for (i = st.bins.length - 1; i >= 0; i--) {
      b = st.bins[i]; K = binCfg(b);
      b.t += dt; b.hitCd = Math.max(0, b.hitCd - dt);
      b.x += b.dx * K.binSpeed * dt; b.y += b.dy * K.binSpeed * dt;
      shoveZombies(s, b, K);
      if (b.hitCd <= 0 && dist(h, b) <= K.binR + hr) {
        b.hitCd = K.binHitCd;
        P.Combat.damageHero(s, P.Enemies.dmgOf(s, null, K.binDmg), 'copci');
        P.Combat.pushHero(s, h.x - b.x, h.y - b.y, K.binKb);
      }
      if (b.t >= K.binLife || Math.abs(b.x) > s.geo.xMax) { dropTrash(s, b, K); st.bins.splice(i, 1); }
    }
    for (i = st.blades.length - 1; i >= 0; i--) { st.blades[i].t += dt; if (st.blades[i].t >= st.blades[i].dur) st.blades.splice(i, 1); }
  };

  function shoveZombies(s, b, K) {
    for (var i = 0; i < s.enemies.length; i++) {
      var o = s.enemies[i];
      if (o.dead || o.state !== 'active' || o.boss || o.id === b.owner) continue;
      var dx = o.x - b.x, dy = o.y - b.y, d = Math.hypot(dx, dy);
      if (d > K.binR + o.r || d < 1e-3) continue;
      P.Combat.shove(o, dx / d, dy / d, K.binShove);
    }
  }

  function dropTrash(s, b, K) {
    var T = K.trash;
    s.zones.push({ kind: 'acid', x: b.x, y: b.y, r: T.r, t: T.t, T: T.t, dps: T.dps, heroDps: T.heroDps, tick: 0, hit: {}, trash: true });
    s.events.push({ type: 'binDrop', x: b.x, y: b.y, r: T.r, crate: b.kind === 'crate' });
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
  // Route spawns only. Boss arenas are skipped (their adds stay around the boss). An A5 opening (env-portal.js sets
  // e.door to the opening) makes the enemy rise from that opening for portalRise seconds, without moving it.
  E3.entrance = function (s, e) {
    if (!s.gen || s.gen.arena || e.boss || e.state !== 'active') return;
    if (e.door) { startEntrance(s, e, openingKind(e.door.kind), cfg4().portalRise, 0); return; }
    if (e.type === 'crawler') { startEntrance(s, e, 'manhole', cfg().entrance.crawlerT, 0); return; }
    var E = cfg().entrance, X4 = cfg4().entrance, rng = s.rng.ai, h = s.hero;
    var ahead = e.y > h.y + X4.aheadY, edge = Math.abs(e.x - h.x) > X4.edgeX;   // lateral offset from the hero, not from x = 0
    if (!ahead && !edge) return;                       // spawns in view (behind, or near the hero) keep their spot
    if (!rng.chance(E.chance)) return;
    var op = openingOf(s, h), kind, k, x, y;
    if (op) { kind = op.kind; x = op.x; y = op.y; k = { T: cfg4().portalRise, drop: 0 }; }
    else {
      kind = pickKind(rng, E); k = E.kinds[kind]; y = h.y + rng.range(E.aheadMin, E.aheadMax);
      x = kind === 'manhole' ? rng.range(-E.manholeX, E.manholeX) : (rng.chance(0.5) ? -1 : 1) * (E.sideX + rng.range(-E.sideJit, E.sideJit));
    }
    if (y > s.geo.exitY - X4.exitGap || blockedAt(s.geo, x, y, E.blockR)) return;
    e.x = x; e.y = y;
    startEntrance(s, e, kind, k.T, k.drop || 0);
  };

  function openingKind(k) { return k === 'window' || k === 'manhole' ? k : 'door'; }

  // Doors and windows from the level layout, when the layout lists them: s.layout.openings = [{ kind, x, y }] (none yet;
  // layouts.js has chokepoints, and the A5 portals cover doors and windows). The nearest opening ahead of the hero wins.
  function openingOf(s, h) {
    var list = s.layout && s.layout.openings, E = cfg().entrance, i, o, best = null;
    if (!list || !list.length) return null;
    for (i = 0; i < list.length; i++) {
      o = list[i];
      if (o.y > h.y + E.aheadMin && o.y < h.y + E.aheadMax + cfg4().openReach && (!best || o.y < best.y)) best = o;
    }
    return best;
  }

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
  // P.CFG.enemyRosterAdds is keyed by hood index (0-based); the types join the roster from stage enemyRosterFrom on.
  E3.augmentRoster = function (s) {
    var g = s.gen, hi = g && g.info ? g.info.hoodIndex : -1, adds = P.CFG.enemyRosterAdds || {};
    if (hi < 0 || g.stageIdx < (P.CFG.enemyRosterFrom || 1)) return;
    (adds[hi] || []).forEach(function (t) { if (g.roster.indexOf(t) < 0) g.roster.push(t); });
  };
  (function () {
    var build = P.Levels.build;
    P.Levels.build = function (s, index) { var r = build.apply(this, arguments); E3.augmentRoster(s); return r; };
  })();
})(P.Enemies3);
