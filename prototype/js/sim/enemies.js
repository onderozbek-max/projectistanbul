// New enemy behaviours (workstream E2): spitter (acid globs), brute (lane charge + stomp), bloater (swell,
// toxic burst, chain). Defs in config-levels.js (P.CFG.enemies.*). Walker, runner, crawler and diner keep
// the default chase in combat.js. Telegraphs and shots live here too (drawn by enemies-fx.js).
P.Enemies = {};

function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function unit(dx, dy) { var d = Math.hypot(dx, dy) || 1; return { x: dx / d, y: dy / d }; }
function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
// Bosses take only a share of the route damage growth (config bossShare), like their HP.
function dmgMul(s, e, base) {
  var df = s.diff ? (e && e.boss ? 1 + (s.diff.dmg - 1) * P.CFG.levels.diff.bossShare : s.diff.dmg) : 1;
  return base * df * (e && e.elite ? P.CFG.elite.dmgMult : 1);
}

// ---------- spawn init ----------
P.Enemies.init = function (s, e) {
  var D = P.CFG.enemies;
  if (e.type === 'brute') e.ai = { m: 'walk', t: 0, cd: 1.5, stompCd: 0, dir: { x: 0, y: 0 }, dist: 0, hit: false, dmg: 0, kb: 0, px: e.x, py: e.y };
  else if (e.type === 'spitter') e.ai = { m: 'approach', t: 0, cd: 1.5, side: s.rng.ai.chance(0.5) ? 1 : -1, strafeT: D.spitter.strafeTime, aimX: 0, aimY: 0 };
  else if (e.type === 'bloater') e.ai = { warned: false };
};

// ---------- per-step desired velocity (called from updateEnemies) ----------
// Returns true when a behaviour set e.dvx/e.dvy (desired velocity, m/s); false -> default chase.
P.Enemies.think = function (s, e, dt) {
  e.noSep = false;
  if (e.boss) return P.Bosses.think(s, e, dt);
  if (!e.ai) return false;
  if (e.type === 'brute') return brute(s, e, dt);
  if (e.type === 'spitter') return spitter(s, e, dt);
  if (e.type === 'bloater') return bloater(s, e, dt);
  return false;
};

// Brute: walk -> windup (lane or stomp telegraph) -> charge 8 m in a straight line -> recover.
function brute(s, e, dt) {
  var a = e.ai, B = P.CFG.enemies.brute, h = s.hero, d = dist(e, h);
  a.cd = Math.max(0, a.cd - dt); a.stompCd = Math.max(0, a.stompCd - dt);
  if (a.m === 'windup') return bruteWindup(s, e, dt);
  if (a.m === 'charge') return bruteCharge(s, e, dt);
  if (a.m === 'recover') { a.t -= dt; e.dvx = 0; e.dvy = 0; if (a.t <= 0) a.m = 'walk'; return true; }
  if (d <= B.stompRange && a.stompCd <= 0) return startStomp(s, e, B);
  if (d <= B.sense && d > B.stompRange && a.cd <= 0) return startCharge(s, e, B, h);
  var u = unit(h.x - e.x, h.y - e.y);
  e.dvx = u.x * e.speed; e.dvy = u.y * e.speed;
  return true;
}

function startStomp(s, e, B) {
  var a = e.ai;
  a.m = 'windup'; a.t = 0; a.kind = 'stomp'; e.dvx = 0; e.dvy = 0;
  s.dir.telegraphs.push({ x: e.x, y: e.y, r: B.stompR, t: 0, T: B.stompWindup, then: 'stomp', dmg: dmgMul(s, e, B.stompDmg), kb: B.stompKb });
  s.events.push({ type: 'bruteRoar', x: e.x, y: e.y });
  return true;
}

function startCharge(s, e, B, h) {
  var a = e.ai, u = unit(h.x - e.x, h.y - e.y);
  a.m = 'windup'; a.t = 0; a.kind = 'charge'; a.dir = u; e.dvx = 0; e.dvy = 0;
  P.Enemies.lane(s, e.x, e.y, u.x, u.y, B.chargeDist, B.laneW, B.windup);
  s.events.push({ type: 'bruteRoar', x: e.x, y: e.y });
  return true;
}

function bruteWindup(s, e, dt) {
  var a = e.ai, B = P.CFG.enemies.brute;
  e.dvx = 0; e.dvy = 0; a.t += dt; e.windup = clamp01(a.t / B.windup);
  if (a.t < B.windup) return true;
  e.windup = 0;
  if (a.kind === 'stomp') { a.m = 'recover'; a.t = B.recover; a.stompCd = B.stompCd; return true; }
  a.m = 'charge'; a.dist = 0; a.hit = false; a.dmg = dmgMul(s, e, B.chargeDmg); a.kb = B.chargeKb;
  a.px = e.x; a.py = e.y; a.chargeSpeed = B.chargeSpeed; a.chargeDist = B.chargeDist; a.shove = B.shove;
  s.events.push({ type: 'bruteCharge', x: e.x, y: e.y, dx: a.dir.x, dy: a.dir.y });
  return bruteCharge(s, e, 0);
}

function bruteCharge(s, e, dt) {
  var a = e.ai, step = a.chargeSpeed * dt, moved = dist({ x: a.px, y: a.py }, e);
  a.px = e.x; a.py = e.y;
  var blocked = a.dist > 0.3 && moved < step * 0.25 + 1e-9 && dt > 0;
  if (a.dist >= a.chargeDist || blocked) { endCharge(s, e, a, blocked); return true; }
  a.dist += a.chargeSpeed * dt;
  e.dvx = a.dir.x * a.chargeSpeed; e.dvy = a.dir.y * a.chargeSpeed; e.noSep = true;
  shoveAside(s, e, a);
  return true;
}

function endCharge(s, e, a, blocked) {
  var B = P.CFG.enemies.brute;
  a.m = 'recover'; a.t = B.recover; a.cd = B.chargeCd; e.dvx = 0; e.dvy = 0; e.noSep = false;
  if (blocked) s.events.push({ type: 'bruteStop', x: e.x, y: e.y });
}

// A charging brute shoves zombies out of its path (Brute: "shoving other zombies aside").
function shoveAside(s, e, a) {
  for (var i = 0; i < s.enemies.length; i++) {
    var o = s.enemies[i];
    if (o === e || o.dead || o.state !== 'active' || o.boss) continue;
    var dx = o.x - e.x, dy = o.y - e.y, d = Math.hypot(dx, dy), reach = e.r + o.r + 0.4;
    if (d > reach || d < 1e-3) continue;
    P.Combat.shove(o, dx / d, dy / d, a.shove);
  }
}

// Spitter: keeps ~5.5 m, strafes, winds up 0.7 s (ring on the target), then lobs an acid glob.
function spitter(s, e, dt) {
  var a = e.ai, S = P.CFG.enemies.spitter, h = s.hero, d = dist(e, h);
  a.cd = Math.max(0, a.cd - dt); a.strafeT -= dt;
  if (a.strafeT <= 0) { a.side = -a.side; a.strafeT = S.strafeTime * s.rng.ai.range(0.7, 1.3); }
  if (a.m === 'windup') {
    e.dvx = 0; e.dvy = 0; a.t += dt; e.windup = clamp01(a.t / S.windup);
    if (a.t >= S.windup) { e.windup = 0; a.m = 'approach'; a.cd = S.cd; P.Enemies.lob(s, e, a.aimX, a.aimY, S.glob, S.flight, dmgMul(s, e, S.glob.dmg), 'spitter'); }
    return true;
  }
  if (a.cd <= 0 && d <= S.range && d >= S.minRange) {
    a.m = 'windup'; a.t = 0; a.aimX = h.x; a.aimY = h.y;
    P.Enemies.ring(s, h.x, h.y, S.glob.r, S.windup + S.flight, null, 'acid');
    s.events.push({ type: 'spitWindup', x: e.x, y: e.y });
    e.dvx = 0; e.dvy = 0; return true;
  }
  var u = unit(h.x - e.x, h.y - e.y), radial = d > S.keep + S.band ? 1 : d < S.keep - S.band ? -1 : 0;
  var vx = u.x * radial - u.y * a.side * S.strafeMul, vy = u.y * radial + u.x * a.side * S.strafeMul;
  var v = unit(vx, vy);
  e.dvx = v.x * e.speed; e.dvy = v.y * e.speed;
  return true;
}

// Bloater: drifts toward the hero and swells (e.swell 0..1); detonates on contact or death.
function bloater(s, e, dt) {
  var B = P.CFG.enemies.bloater, h = s.hero, d = dist(e, h), contactD = e.r + P.CFG.hero.radius;
  var sw = clamp01((B.swellFrom - d) / (B.swellFrom - contactD));
  e.swell = sw;
  if (sw > 0 && !e.ai.warned) { e.ai.warned = true; s.events.push({ type: 'bloaterSwell', x: e.x, y: e.y }); }
  var u = unit(h.x - e.x, h.y - e.y);
  e.dvx = u.x * e.speed; e.dvy = u.y * e.speed;
  return true;
}

// Melee contact hook (combat.js). Returns true when the contact is fully handled here.
P.Enemies.onContact = function (s, e) {
  if (e.type === 'bloater' && !e.boss) { P.Combat.killEnemy(s, e, false, 'bloater'); return true; }
  if (e.type === 'brute' && e.ai.m === 'charge') {
    if (!e.ai.hit) {
      e.ai.hit = true;
      var u = e.ai.dir;
      P.Combat.damageHero(s, e.ai.dmg, e.type);
      P.Combat.pushHero(s, u.x, u.y, e.ai.kb);
      s.events.push({ type: 'bruteHit', x: e.x, y: e.y });
    }
    return true;
  }
  return false;
};

// ---------- bloater burst: toxic cloud, damage to zombies and hero, chain via killEnemy ----------
P.Enemies.burst = function (s, e) {
  if (e.burstDone) return;
  e.burstDone = true;
  var B = P.CFG.enemies.bloater, h = s.hero, hr = P.CFG.hero.radius;
  var def = e.boss ? P.CFG.bosses.bloater.burst : e.mini ? B.mini : B;
  var cloud = e.boss ? { r: B.cloud.r * 2, t: def.cloudT, dps: B.cloud.dps, heroDps: B.cloud.heroDps } : B.cloud;
  var R = def.burstR || def.r;
  s.events.push({ type: 'bloaterPop', x: e.x, y: e.y, r: R, mini: !!e.mini, boss: !!e.boss, chainFrom: e.id });
  s.zones.push({ kind: 'toxic', x: e.x, y: e.y, r: cloud.r, t: cloud.t, T: cloud.t, dps: cloud.dps,
    heroDps: cloud.heroDps, tick: 0, hit: {} });
  for (var i = 0; i < s.enemies.length; i++) {
    var o = s.enemies[i];
    if (o === e || o.dead) continue;
    var dx = o.x - e.x, dy = o.y - e.y, d = Math.hypot(dx, dy);
    if (d - o.r <= R) P.Combat.damageEnemy(s, o, def.enemyDmg, dx / (d || 1), dy / (d || 1), B.shove, false, 'bloater');
  }
  if (dist(h, e) - hr <= R) P.Combat.damageHero(s, dmgMul(s, null, def.heroDmg), 'bloater');
};

// Acid/toxic zone ticks: the hero takes heroDps over time (every contactInterval), armor applies.
P.Enemies.zoneHero = function (s, z, dt) {
  var h = s.hero, tick = P.CFG.contactInterval;
  if (Math.hypot(h.x - z.x, h.y - z.y) > z.r + P.CFG.hero.radius) { z.tick = 0; return; }
  z.tick = (z.tick || 0) + dt;
  if (z.tick < tick) return;
  z.tick = 0;
  P.Combat.damageHero(s, z.heroDps * tick, z.kind);
};

// ---------- telegraphs, shots and hazards: per-step runtime ----------
P.Enemies.frame = function (s, dt) {
  var i, list = s.enemyTele;
  for (i = list.length - 1; i >= 0; i--) {
    var t = list[i];
    t.t += dt;
    if (t.t < t.T) continue;
    list.splice(i, 1);
    if (t.then) P.Enemies.onTele(s, t);
  }
  var sh = s.enemyShots;
  for (i = sh.length - 1; i >= 0; i--) {
    var q = sh[i];
    q.t += dt;
    var f = Math.min(1, q.t / q.dur);
    q.x = q.x0 + (q.tx - q.x0) * f; q.y = q.y0 + (q.ty - q.y0) * f;
    if (q.t >= q.dur) { sh.splice(i, 1); landGlob(s, q); }
  }
};

P.Enemies.lane = function (s, x, y, dx, dy, len, w, T) {
  var t = { kind: 'lane', x: x, y: y, dx: dx, dy: dy, len: len, w: w, t: 0, T: T, then: null, col: 'danger' };
  s.enemyTele.push(t);
  return t;
};

P.Enemies.ring = function (s, x, y, r, T, then, col, extra) {
  var t = { kind: 'ring', x: x, y: y, r: r, t: 0, T: T, then: then, col: col || 'danger' };
  if (extra) for (var k in extra) t[k] = extra[k];
  s.enemyTele.push(t);
  return t;
};

// Lob an acid glob from (x0, y0) to (tx, ty) over `dur` seconds. Lands as a puddle (zone 'acid').
P.Enemies.lob = function (s, src, tx, ty, o, dur, dmg, cause) {
  s.enemyShots.push({ x0: src.x, y0: src.y, x: src.x, y: src.y, tx: tx, ty: ty, t: 0, dur: dur, kind: 'acid',
    dmg: dmg, r: o.r, puddleT: o.puddleT, puddleDps: o.puddleDps, cause: cause || 'spitter' });
  s.events.push({ type: 'spit', x: src.x, y: src.y, tx: tx, ty: ty, dur: dur });
};

function landGlob(s, q) {
  var h = s.hero;
  P.Enemies.puddle(s, q.tx, q.ty, q.r, q.puddleT, q.puddleDps);
  s.events.push({ type: 'spitLand', x: q.tx, y: q.ty, r: q.r });
  if (dist(h, q) - P.CFG.hero.radius <= q.r) P.Combat.damageHero(s, q.dmg, q.cause);
}

// Acid puddle (enemies take DoT too; the hero takes heroDps while inside).
P.Enemies.puddle = function (s, x, y, r, T, dps) {
  s.zones.push({ kind: 'acid', x: x, y: y, r: r, t: T, T: T, dps: dps, heroDps: dps, tick: 0, hit: {} });
};

P.Enemies.toxicPool = function (s, x, y, r, T, dps) {
  s.zones.push({ kind: 'toxic', x: x, y: y, r: r, t: T, T: T, dps: dps, heroDps: dps * 0.5, tick: 0, hit: {} });
};

// Telegraph resolution. Crawlers emerge (generic levels), brutes stomp, bosses slam/summon/pool/rain.
P.Enemies.onTele = function (s, tg) {
  var h = s.hero, hr = P.CFG.hero.radius;
  if (tg.then === 'stomp') {
    s.events.push({ type: 'bruteStomp', x: tg.x, y: tg.y, r: tg.r });
    if (dist(h, tg) - hr <= tg.r) { P.Combat.damageHero(s, tg.dmg, 'brute'); P.Combat.pushHero(s, h.x - tg.x, h.y - tg.y, tg.kb); }
  } else if (tg.then === 'emerge') {
    P.Combat.spawnEnemy(s, 'crawler', tg.x, tg.y, { skin: tg.skin });
    s.events.push({ type: 'emerge', x: tg.x, y: tg.y });
  } else if (tg.then === 'puddle') {
    P.Enemies.puddle(s, tg.x, tg.y, tg.r, tg.T2, tg.dps);
    s.events.push({ type: 'spitLand', x: tg.x, y: tg.y, r: tg.r });
  } else if (tg.then === 'glob') {
    P.Enemies.lob(s, tg.src, tg.x, tg.y, tg.o, tg.flight, tg.dmg, tg.cause);
  } else if (tg.then === 'toxic') {
    P.Enemies.toxicPool(s, tg.x, tg.y, tg.r, tg.T2, tg.dps);
    s.events.push({ type: 'toxicPool', x: tg.x, y: tg.y, r: tg.r });
  } else if (tg.then === 'slam') {
    s.events.push({ type: 'bossSlam', x: tg.x, y: tg.y, r: tg.r });
    if (dist(h, tg) - hr <= tg.r) { P.Combat.damageHero(s, tg.dmg, 'bloater'); P.Combat.pushHero(s, h.x - tg.x, h.y - tg.y, tg.shove); }
  } else if (tg.then === 'summon') {
    summon(s, tg);
  }
};

// Boss adds: kind2 = zombie type; mini = mini bloaters (smaller, weaker burst).
function summon(s, tg) {
  var M = P.CFG.enemies.bloater.mini, df = s.diff ? s.diff.hp : 1;
  for (var i = 0; i < tg.n; i++) {
    var a = (i / tg.n) * Math.PI * 2 + s.rng.ai.range(0, 0.6);
    var e = P.Combat.spawnEnemy(s, tg.kind2 || 'walker', tg.x + Math.cos(a) * tg.r, tg.y + Math.sin(a) * tg.r, { skin: tg.skin });
    if (tg.mini) { e.mini = true; e.hp = M.hp * df; e.maxHp = e.hp; e.r = M.radius; }
  }
  s.events.push({ type: 'summon', x: tg.x, y: tg.y });
}

// Shared helpers for bosses.js.
P.Enemies.dist = dist;
P.Enemies.unit = unit;
P.Enemies.clamp01 = clamp01;
P.Enemies.dmgOf = dmgMul;
P.Enemies.shoveAside = shoveAside;
