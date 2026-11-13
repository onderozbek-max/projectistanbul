// Boss behaviours for generated stage-5 arenas (workstream E2, lane C v0.7). Archetypes: brute (charges x3, stomp rings,
// summons), bloater (toxic pools, mini bloaters, belly slam), spitter (fan spray of 5 globs, acid rain), and the lane C
// additions: taksici (taxi: charges leave an oil slick; a charge that hits a wall stalls it and opens a weak spot) and
// kasapBoss (butcher: a three-swing cleaver combo with an apron weak spot after it, a thrown cleaver, a frenzy phase).
// The additions have three phases (P.CFG.bosses[id].phases). Hood -> archetype: P.CFG.bossByHood (config-bosses.js).
// Numbers: P.CFG.bosses (config-levels.js and config-bosses.js). Every attack telegraphs >= 0.8 s (DS 6). Telegraphs
// carry owner = boss id and are cleared on death.
P.Bosses = {};

var SEQ = {
  brute: ['charge', 'charge', 'charge', 'stomp', 'summon'],
  bloater: ['pools', 'minis', 'slam'],
  spitter: ['fan', 'rain'],
};

function def(e) { return P.CFG.bosses[e.type]; }

// Telegraph floor (AUDIT-6 C4, DS 6): every boss attack's windup is at least config-enemies4 telegraphMin, after the phase
// multiplier. Shorter windups (phase 2-3 mults, the kasap's quick swings, the brute's rage windup) stop at the floor.
function tele(W) { var m = P.CFG.enemies4 ? P.CFG.enemies4.telegraphMin : 0; return m > W ? m : W; }

// Archetype for a hood: the bossByHood table wins over the hood's own boss type (journey.js).
P.Bosses.archetype = function (hoodId, type) {
  var t = P.CFG.bossByHood && hoodId ? P.CFG.bossByHood[hoodId] : null;
  return t && P.CFG.bosses[t] ? t : type;
};

// Spawn a boss. Intro: the boss stands still for `intro` seconds while the banner plays (bossIntro event).
P.Bosses.spawn = function (s, type, x, y, o) {
  var arch = P.Bosses.archetype(o.hoodId, type), B = P.CFG.bosses[arch], df = s.diff, hm = 1 + P.CFG.levels.diff.bossHoodMul * o.hoodIdx;
  var share = P.CFG.levels.diff.bossShare;            // bosses take only part of the route HP and damage growth
  var e = P.Combat.spawnEnemy(s, B.base || arch, x, y, { state: 'turning', stateT: P.CFG.levels.bossIntro, skin: o.skin, boss: true });
  e.type = arch; e.boss = true; e.nameKey = o.nameKey; e.r = B.radius; e.speed = B.speed; e.kbResist = B.kbResist;
  e.contact = B.contact * (df ? 1 + (df.dmg - 1) * share : 1); e.xp = B.xp;
  e.hp = B.hp * hm * (df ? 1 + (df.hp - 1) * share : 1); e.maxHp = e.hp;
  e.armour = B.armour || 1; e.exposed = false; e.phase = 1;
  e.ai = makeAI(e);
  s.events.push({ type: 'bossIntro', nameKey: o.nameKey, boss: arch, x: x, y: y, hood: o.hoodId || null });
  return e;
};

function makeAI(e) {
  var B = P.CFG.bosses[e.type];
  return { seq: B.phases ? B.phases[0].seq : SEQ[e.type], k: 0, needPause: false, m: 'walk', t: 0, W: 0, act: null, cd: 1.0,
    dir: { x: 0, y: 1 }, dist: 0, len: 0, spd: 0, hit: false, dmg: 0, kb: 0, shove: 0, p: { x: e.x, y: e.y }, rageOn: false,
    side: 1, strafeT: 2.5, combo: 0, exposeT: 0, wm: 1, gapMul: 1, spdMul: 1 };
}

P.Bosses.think = function (s, e, dt) {
  var a = e.ai, B = def(e);
  if (!a) return false;
  updatePhase(s, e, a, B);
  a.cd = Math.max(0, a.cd - dt);
  if (a.exposeT > 0) { a.exposeT -= dt; if (a.exposeT <= 0) unexpose(e, B); }
  if (a.m === 'windup') return windupStep(s, e, dt);
  if (a.m === 'charge') { chargeStep(s, e, dt); return true; }
  if (a.m === 'pause' || a.m === 'stall' || a.m === 'recover') {
    a.t -= dt; e.dvx = 0; e.dvy = 0;
    if (a.t <= 0) { if (a.m === 'recover') startSwing(s, e, a, B); else a.m = 'walk'; }
    return true;
  }
  if (a.cd <= 0) return nextAction(s, e, a, B);
  return move(s, e, dt, B);
};

// Classic archetypes rage once at rageAt (phase 2). The additions switch phase at phaseAt (HP share) and pause once.
function updatePhase(s, e, a, B) {
  var p;
  if (!B.phases) {
    if (!a.rageOn && e.hp <= e.maxHp * B.rageAt) {
      a.rageOn = true; e.phase = 2;
      s.events.push({ type: 'bossRage', x: e.x, y: e.y, boss: e.type });
      s.events.push(phaseEv(e, 2));
    }
    return;
  }
  p = phaseOf(e, B);
  if (p === e.phase) return;
  e.phase = p;
  a.seq = B.phases[p - 1].seq; a.k = 0; a.wm = B.phases[p - 1].wm; a.gapMul = B.phases[p - 1].gapMul; a.spdMul = B.phases[p - 1].spdMul;
  a.needPause = true;
  s.events.push(phaseEv(e, p));
}

function phaseOf(e, B) {
  var f = e.hp / e.maxHp, p = 1, i;
  for (i = 0; i < B.phaseAt.length; i++) if (f <= B.phaseAt[i]) p = i + 2;
  return p;
}

function phaseEv(e, p) { return { type: 'bossPhase', id: e.id, x: e.x, y: e.y, boss: e.type, phase: p, nameKey: e.nameKey }; }

function gapOf(a, B) { return (a.rageOn ? B.rageGap : B.gap) * a.gapMul; }

// Weak spot: the boss takes full damage (exposedArmour) for exposeT seconds.
function expose(e, B) { e.exposed = true; e.armour = B.exposedArmour; e.ai.exposeT = B.exposeT; }
function unexpose(e, B) { e.exposed = false; e.armour = B.armour || 1; }

function nextAction(s, e, a, B) {
  if (a.needPause) { a.needPause = false; a.m = 'pause'; a.t = a.rageOn ? B.pause * 0.5 : B.pause; e.dvx = 0; e.dvy = 0; return true; }
  var name = a.seq[a.k % a.seq.length];
  a.k++;
  if (a.k % a.seq.length === 0) a.needPause = true;
  start(s, e, name);
  return true;
}

// Movement between attacks: brute, bloater and the additions chase; spitter keeps distance (as the spitter, boss-sized).
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
    W = tele((rage ? B.rageWindup : B.windup) * a.wm);
    a.W = W; a.len = B.laneLen; a.spd = B.chargeSpeed * a.spdMul; a.dmg = P.Enemies.dmgOf(s, e, B.chargeDmg); a.kb = B.chargeKb; a.shove = P.CFG.enemies.brute.shove;
    P.Enemies.lane(s, e.x, e.y, a.dir.x, a.dir.y, B.laneLen, B.laneW, W).owner = e.id;
    s.events.push({ type: 'bruteRoar', x: e.x, y: e.y, boss: true });
  } else if (name === 'stomp') {
    a.W = tele(B.stomp.windup);
    addTele(s, e, { kind: 'ring', x: e.x, y: e.y, r: B.stomp.r, T: a.W, then: 'stomp', dmg: P.Enemies.dmgOf(s, e, B.stomp.dmg), kb: 2.5 });
  } else if (name === 'summon' || name === 'rally') {  // rally calls: walkers file in; 'rally' is the Docent's phase 3 call (own def)
    var CALL = name === 'rally' ? B.rally : B.summon;
    a.W = tele(CALL.windup);
    addTele(s, e, { kind: 'ring', x: e.x, y: e.y, r: CALL.r, T: a.W, then: 'summon', n: CALL.n, kind2: 'walker', skin: e.skin, col: 'summon' });
  } else if (name === 'pools') {
    a.W = tele(B.pools.windup);
    for (var i = 0; i < B.pools.n; i++) {
      var p = spot(s, h, B.pools.span);
      addTele(s, e, { kind: 'ring', x: p.x, y: p.y, r: B.pools.r, T: a.W, then: 'toxic', T2: B.pools.t, dps: B.pools.dps, col: 'toxic' });
    }
  } else if (name === 'minis') {
    a.W = tele(B.minis.windup);
    addTele(s, e, { kind: 'ring', x: e.x, y: e.y, r: B.minis.r, T: a.W, then: 'summon', n: B.minis.n, kind2: 'bloater', mini: true, skin: e.skin, col: 'toxic' });
  } else if (name === 'slam') {
    a.W = tele(B.slam.windup);
    addTele(s, e, { kind: 'ring', x: e.x, y: e.y, r: B.slam.r, T: a.W, then: 'slam', dmg: P.Enemies.dmgOf(s, e, B.slam.dmg), shove: B.slam.shove, col: 'slam' });
  } else if (name === 'fan') {
    a.W = tele(B.fan.windup);
    fanTargets(s, e, B.fan).forEach(function (t) {
      addTele(s, e, { kind: 'ring', x: t.x, y: t.y, r: B.fan.r, T: a.W, then: 'glob', src: e, o: B.fan, flight: B.fan.flight,
        dmg: P.Enemies.dmgOf(s, e, B.fan.dmg), cause: e.type, col: 'acid' });
    });
  } else if (name === 'rain') {
    a.W = tele(B.rain.windup);
    for (var k = 0; k < B.rain.n; k++) {
      var q = spot(s, h, B.rain.span);
      addTele(s, e, { kind: 'ring', x: q.x, y: q.y, r: B.rain.r, T: a.W, then: 'puddle', T2: B.rain.t, dps: B.rain.dps, col: 'acid' });
    }
  } else if (name === 'smash') {                       // taksici: hood smash on the spot ahead of the car
    a.W = tele(B.smash.windup * a.wm);
    addTele(s, e, { kind: 'ring', x: e.x + a.dir.x * B.smash.reach, y: e.y + a.dir.y * B.smash.reach, r: B.smash.r, T: a.W,
      then: 'smash', dmg: P.Enemies.dmgOf(s, e, B.smash.dmg), kb: B.smash.shove, cause: e.type, col: 'slam' });
  } else if (name === 'combo') {                       // kasapBoss: three swings, one after another
    a.combo = 3; startSwing(s, e, a, B);
  } else if (name === 'throw') {                       // kasapBoss: the cleaver lands on the hero's spot
    a.W = tele(B.throw.windup * a.wm);
    addTele(s, e, { kind: 'ring', x: h.x, y: h.y, r: B.throw.r, T: a.W, then: 'swing', dmg: P.Enemies.dmgOf(s, e, B.throw.dmg),
      kb: 0.6, cause: e.type, col: 'danger' });
    P.Enemies3.launchBlade(s, e.x, e.y, h.x, h.y, a.W, e.type);   // the boss type keys the flying object's sprite (view only)
    s.events.push({ type: 'bossWindup', id: e.id, x: e.x, y: e.y, boss: e.type });
  } else if (name === 'frenzy') {                      // kasapBoss: four small swings on the hero's area
    a.W = tele(B.frenzy.windup * a.wm);
    for (var n = 0; n < B.frenzy.n; n++) {
      var f = spot(s, h, B.frenzy.span);
      addTele(s, e, { kind: 'ring', x: f.x, y: f.y, r: B.frenzy.r, T: a.W, then: 'swing', dmg: P.Enemies.dmgOf(s, e, B.frenzy.dmg),
        kb: 0.4, cause: e.type, col: 'slam' });
    }
  }
  // AUDIT-7 telegraphs: every windup has a sound cue at its start (charge, combo and throw cue themselves above).
  if (name !== 'charge' && name !== 'throw' && name !== 'combo') s.events.push({ type: 'bossWindup', id: e.id, x: e.x, y: e.y, boss: e.type, act: name, T: a.W });
}

// One swing of the kasapBoss combo: a ring on the spot in front of the boss. Swings chain from the recover state.
function startSwing(s, e, a, B) {
  var i = 3 - a.combo, h = s.hero, W = tele(B.swing.windup[i] * a.wm), dir = P.Enemies.unit(h.x - e.x, h.y - e.y);
  a.combo--; a.m = 'windup'; a.t = 0; a.W = W; a.act = 'combo'; a.dir = dir; e.dvx = 0; e.dvy = 0;
  addTele(s, e, { kind: 'ring', x: e.x + dir.x * B.swing.reach, y: e.y + dir.y * B.swing.reach, r: B.swing.r, T: W,
    then: 'swing', dmg: P.Enemies.dmgOf(s, e, B.swing.dmg), kb: B.swing.kb, cause: e.type, col: 'slam' });
  s.events.push({ type: 'bossWindup', id: e.id, x: e.x, y: e.y, boss: e.type });
}

// Stomp rings use the director's telegraph list (drawn as the standard hatched ring); the rest use enemyTele.
function addTele(s, e, t) {
  t.t = 0; t.owner = e.id;
  if (t.then === 'stomp') s.dir.telegraphs.push(t); else s.enemyTele.push(t);
}

function windupStep(s, e, dt) {
  var a = e.ai, B = def(e);
  e.dvx = 0; e.dvy = 0; a.t += dt; e.windup = P.Enemies.clamp01(a.t / a.W);
  if (a.t < a.W) return true;
  e.windup = 0;
  if (a.act === 'charge') {
    a.m = 'charge'; a.dist = 0; a.hit = false; a.px = e.x; a.py = e.y;
    a.p.x = e.x; a.p.y = e.y;
    s.events.push({ type: 'bruteCharge', x: e.x, y: e.y, dx: a.dir.x, dy: a.dir.y, boss: true });
    return true;
  }
  if (a.act === 'combo' && a.combo > 0) { a.m = 'recover'; a.t = B.swing.recover; return true; }
  if (a.act === 'combo') expose(e, B);                 // the last swing opens the apron: weak spot
  a.m = 'walk'; a.cd = gapOf(a, B);
  return true;
}

// Boss charge: straight line, shoves zombies, contact hit handled by P.Enemies.onContact (ai.m === 'charge').
// A charge that stops against a block or wall ends blocked: archetypes with a stall (taksici) are stalled and exposed.
function chargeStep(s, e, dt) {
  var a = e.ai, step = a.spd * dt, moved = P.Enemies.dist(a.p, e);
  a.p.x = e.x; a.p.y = e.y;
  var blocked = a.dist > 0.3 && moved < step * 0.25;
  if (a.dist >= a.len || blocked) { endCharge(s, e, a, blocked); return; }
  a.dist += step;
  e.dvx = a.dir.x * a.spd; e.dvy = a.dir.y * a.spd; e.noSep = true;
  P.Enemies.shoveAside(s, e, a);
}

function endCharge(s, e, a, blocked) {
  var B = def(e);
  e.dvx = 0; e.dvy = 0; e.noSep = false;
  a.cd = gapOf(a, B);
  if (B.oil) s.zones.push({ kind: 'acid', x: e.x, y: e.y, r: B.oil.r, t: B.oil.t, T: B.oil.t, dps: B.oil.dps, heroDps: B.oil.heroDps, tick: 0, hit: {}, oil: true });
  if (blocked && B.stall) {
    a.m = 'stall'; a.t = B.stall.T; expose(e, B);
    s.events.push({ type: 'bossStall', id: e.id, x: e.x, y: e.y, boss: e.type });
    return;
  }
  a.m = 'pause'; a.t = 0.4;
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
