// Boss behaviours for generated stage-5 arenas (workstream E2). One boss per hood type (journey.js):
// brute (charges x3, stomp rings, summons), bloater (toxic pools, mini bloaters, belly slam),
// spitter (fan spray of 5 globs, acid rain). Numbers: P.CFG.bosses (config-levels.js).
// Every attack telegraphs >= 0.8 s (DS 6). Telegraphs carry owner = boss id and are cleared on death.
P.Bosses = {};

var SEQ = {
  brute: ['charge', 'charge', 'charge', 'stomp', 'summon'],
  bloater: ['pools', 'minis', 'slam'],
  spitter: ['fan', 'rain'],
};

function def(e) { return P.CFG.bosses[e.type]; }

// Spawn a boss. Intro: the boss stands still for `intro` seconds while the banner plays (bossIntro event).
P.Bosses.spawn = function (s, type, x, y, o) {
  var B = P.CFG.bosses[type], df = s.diff, hm = 1 + P.CFG.levels.diff.bossHoodMul * o.hoodIdx;
  var share = P.CFG.levels.diff.bossShare;            // bosses take only part of the route HP and damage growth
  var e = P.Combat.spawnEnemy(s, type, x, y, { state: 'turning', stateT: P.CFG.levels.bossIntro, skin: o.skin });
  e.boss = true; e.nameKey = o.nameKey; e.r = B.radius; e.speed = B.speed; e.kbResist = B.kbResist;
  e.contact = B.contact * (df ? 1 + (df.dmg - 1) * share : 1); e.xp = B.xp;
  e.hp = B.hp * hm * (df ? 1 + (df.hp - 1) * share : 1); e.maxHp = e.hp;
  e.ai = makeAI(e);
  s.events.push({ type: 'bossIntro', nameKey: o.nameKey, boss: type, x: x, y: y, hood: o.hoodId || null });
  return e;
};

function makeAI(e) {
  return { seq: SEQ[e.type], k: 0, needPause: false, m: 'walk', t: 0, W: 0, act: null, cd: 1.0,
    dir: { x: 0, y: 1 }, dist: 0, len: 0, spd: 0, hit: false, dmg: 0, kb: 0, shove: 0, p: { x: e.x, y: e.y }, rageOn: false,
    side: 1, strafeT: 2.5 };
}

P.Bosses.think = function (s, e, dt) {
  var a = e.ai, B = def(e);
  if (!a) return false;
  if (!a.rageOn && e.hp <= e.maxHp * B.rageAt) { a.rageOn = true; s.events.push({ type: 'bossRage', x: e.x, y: e.y, boss: e.type }); }
  a.cd = Math.max(0, a.cd - dt);
  if (a.m === 'windup') return windupStep(s, e, dt);
  if (a.m === 'charge') { chargeStep(s, e, dt); return true; }
  if (a.m === 'pause') { a.t -= dt; e.dvx = 0; e.dvy = 0; if (a.t <= 0) a.m = 'walk'; return true; }
  if (a.cd <= 0) return nextAction(s, e, a, B);
  return move(s, e, dt, B);
};

function nextAction(s, e, a, B) {
  if (a.needPause) { a.needPause = false; a.m = 'pause'; a.t = a.rageOn ? B.pause * 0.5 : B.pause; e.dvx = 0; e.dvy = 0; return true; }
  var name = a.seq[a.k % a.seq.length];
  a.k++;
  if (a.k % a.seq.length === 0) a.needPause = true;
  start(s, e, name);
  return true;
}

// Movement between attacks: brute and bloater chase; spitter keeps distance (as the spitter, boss-sized).
function move(s, e, dt, B) {
  var h = s.hero, sp = e.speed * (e.ai.rageOn && e.type === 'brute' ? P.CFG.bosses.brute.rageSpeed : 1);
  var d = P.Enemies.dist(e, h), u = P.Enemies.unit(h.x - e.x, h.y - e.y);
  if (e.type !== 'spitter') { e.dvx = u.x * sp; e.dvy = u.y * sp; return true; }
  var radial = d > B.keep + B.band ? 1 : d < B.keep - B.band ? -1 : 0;
  e.ai.strafeT -= dt;
  if (e.ai.strafeT <= 0) { e.ai.side = -e.ai.side; e.ai.strafeT = 2.5; }
  var v = P.Enemies.unit(u.x * radial - u.y * e.ai.side * 0.9, u.y * radial + u.x * e.ai.side * 0.9);
  e.dvx = v.x * sp; e.dvy = v.y * sp;
  return true;
}

// Begin an attack: pick its windup, place its telegraphs (all owned by this boss).
function start(s, e, name) {
  var a = e.ai, B = def(e), h = s.hero, rage = a.rageOn, W;
  a.m = 'windup'; a.t = 0; a.act = name; e.dvx = 0; e.dvy = 0;
  a.dir = P.Enemies.unit(h.x - e.x, h.y - e.y);
  if (name === 'charge') {
    W = rage ? B.rageWindup : B.windup;
    a.W = W; a.len = B.laneLen; a.spd = B.chargeSpeed; a.dmg = P.Enemies.dmgOf(s, e, B.chargeDmg); a.kb = B.chargeKb; a.shove = P.CFG.enemies.brute.shove;
    P.Enemies.lane(s, e.x, e.y, a.dir.x, a.dir.y, B.laneLen, B.laneW, W).owner = e.id;
    s.events.push({ type: 'bruteRoar', x: e.x, y: e.y, boss: true });
  } else if (name === 'stomp') {
    a.W = B.stomp.windup;
    addTele(s, e, { kind: 'ring', x: e.x, y: e.y, r: B.stomp.r, T: a.W, then: 'stomp', dmg: P.Enemies.dmgOf(s, e, B.stomp.dmg), kb: 2.5 });
  } else if (name === 'summon') {
    a.W = B.summon.windup;
    addTele(s, e, { kind: 'ring', x: e.x, y: e.y, r: B.summon.r, T: a.W, then: 'summon', n: B.summon.n, kind2: 'walker', skin: e.skin, col: 'summon' });
  } else if (name === 'pools') {
    a.W = B.pools.windup;
    for (var i = 0; i < B.pools.n; i++) {
      var p = spot(s, h, B.pools.span);
      addTele(s, e, { kind: 'ring', x: p.x, y: p.y, r: B.pools.r, T: a.W, then: 'toxic', T2: B.pools.t, dps: B.pools.dps, col: 'toxic' });
    }
  } else if (name === 'minis') {
    a.W = B.minis.windup;
    addTele(s, e, { kind: 'ring', x: e.x, y: e.y, r: B.minis.r, T: a.W, then: 'summon', n: B.minis.n, kind2: 'bloater', mini: true, skin: e.skin, col: 'toxic' });
  } else if (name === 'slam') {
    a.W = B.slam.windup;
    addTele(s, e, { kind: 'ring', x: e.x, y: e.y, r: B.slam.r, T: a.W, then: 'slam', dmg: P.Enemies.dmgOf(s, e, B.slam.dmg), shove: B.slam.shove, col: 'slam' });
  } else if (name === 'fan') {
    a.W = B.fan.windup;
    fanTargets(s, e, B.fan).forEach(function (t) {
      addTele(s, e, { kind: 'ring', x: t.x, y: t.y, r: B.fan.r, T: a.W, then: 'glob', src: e, o: B.fan, flight: B.fan.flight,
        dmg: P.Enemies.dmgOf(s, e, B.fan.dmg), cause: 'spitter', col: 'acid' });
    });
  } else if (name === 'rain') {
    a.W = B.rain.windup;
    for (var k = 0; k < B.rain.n; k++) {
      var q = spot(s, h, B.rain.span);
      addTele(s, e, { kind: 'ring', x: q.x, y: q.y, r: B.rain.r, T: a.W, then: 'puddle', T2: B.rain.t, dps: B.rain.dps, col: 'acid' });
    }
  }
}

// Stomp rings use the director's telegraph list (drawn as the standard hatched ring); the rest use enemyTele.
function addTele(s, e, t) {
  t.t = 0; t.owner = e.id;
  if (t.then === 'stomp') s.dir.telegraphs.push(t); else s.enemyTele.push(t);
}

function windupStep(s, e, dt) {
  var a = e.ai;
  e.dvx = 0; e.dvy = 0; a.t += dt; e.windup = P.Enemies.clamp01(a.t / a.W);
  if (a.t < a.W) return true;
  e.windup = 0;
  if (a.act === 'charge') {
    a.m = 'charge'; a.dist = 0; a.hit = false; a.px = e.x; a.py = e.y;
    a.p.x = e.x; a.p.y = e.y;
    s.events.push({ type: 'bruteCharge', x: e.x, y: e.y, dx: a.dir.x, dy: a.dir.y, boss: true });
    return true;
  }
  a.m = 'walk'; a.cd = e.ai.rageOn ? def(e).rageGap : def(e).gap;
  return true;
}

// Boss charge: straight line, shoves zombies, contact hit handled by P.Enemies.onContact (ai.m === 'charge').
function chargeStep(s, e, dt) {
  var a = e.ai, step = a.spd * dt, moved = P.Enemies.dist(a.p, e);
  a.p.x = e.x; a.p.y = e.y;
  if (a.dist >= a.len || (a.dist > 0.3 && moved < step * 0.25)) {
    a.m = 'pause'; a.t = 0.4; a.cd = a.rageOn ? def(e).rageGap : def(e).gap; e.dvx = 0; e.dvy = 0; e.noSep = false;
    return;
  }
  a.dist += step;
  e.dvx = a.dir.x * a.spd; e.dvy = a.dir.y * a.spd; e.noSep = true;
  P.Enemies.shoveAside(s, e, a);
}

// Random spot near the hero, inside the corridor and ahead of the arena entrance.
function spot(s, h, span) {
  var g = s.geo, rng = s.rng.ai;
  return {
    x: Math.min(g.xMax - 1, Math.max(g.xMin + 1, h.x + rng.range(-span / 2, span / 2))),
    y: Math.min(g.exitY - 2, Math.max(0, h.y + rng.range(-span / 4, span / 2 + 2))),
  };
}

// Five targets in a fan toward the hero, 4-8 m out (spitter boss).
function fanTargets(s, e, F) {
  var h = s.hero, base = Math.atan2(h.y - e.y, h.x - e.x), out = [];
  var r = Math.min(F.rangeMax, Math.max(F.rangeMin, P.Enemies.dist(e, h)));
  for (var i = 0; i < F.n; i++) {
    var f = F.n > 1 ? i / (F.n - 1) - 0.5 : 0, a = base + f * F.spread * Math.PI / 180;
    out.push({ x: e.x + Math.cos(a) * r, y: e.y + Math.sin(a) * r });
  }
  return out;
}

// Boss death: boss chest through the normal chest flow, clear its telegraphs, bloater boss bursts.
P.Bosses.onDeath = function (s, e) {
  s.events.push({ type: 'bossDie', x: e.x, y: e.y, nameKey: e.nameKey, boss: e.type });
  s.drops.push({ kind: 'chest', value: 1, boss: true, x: e.x, y: e.y, mag: true, pop: 0.9 });
  s.enemyTele = s.enemyTele.filter(function (t) { return t.owner !== e.id; });
  s.dir.telegraphs = s.dir.telegraphs.filter(function (t) { return t.owner !== e.id; });
};
