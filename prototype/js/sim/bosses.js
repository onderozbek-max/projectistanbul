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

function def(e) { return P.CFG.bosses[e.bossPreset || e.type]; }

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
  var arch = o.archetype || P.Bosses.archetype(o.hoodId, type), B = P.CFG.bosses[o.preset || arch], df = s.diff, hm = 1 + P.CFG.levels.diff.bossHoodMul * o.hoodIdx;
  var share = (df && df.bossShare) || P.CFG.levels.diff.bossShare;   // bosses take only part of the route HP and damage growth (Nightmare: its own share, R1-T4 part 18)
  var e = P.Combat.spawnEnemy(s, B.base || arch, x, y, { state: 'turning', stateT: P.CFG.levels.bossIntro, skin: o.skin, boss: true });
  e.type = arch; e.boss = true; e.nameKey = o.nameKey; e.r = B.radius; e.speed = B.speed; e.kbResist = B.kbResist;
  e.contact = B.contact * (df ? 1 + (df.dmg - 1) * share : 1); e.xp = B.xp;
  e.hp = B.hp * hm * (df ? 1 + (df.hp - 1) * share : 1) * (df && df.bossHp || 1); e.maxHp = e.hp;   // bossHp: Nightmare boss multiplier (1 otherwise)
  e.armour = B.armour || 1; e.exposed = false; e.phase = 1;
  if (o.preset) e.bossPreset = o.preset;
  e.ai = makeAI(e);
  // Authored entrances already suspend the shared gameplay clock. Do not add a second helpless spawn interval.
  if(B.firstGap!==undefined){e.state='active';e.stateT=0;}
  if (s.runMode === 'nightmare' && s.routeTrial && o.preset && e.ai.seq.length > 1) {
    e.ai.seq = e.ai.seq.slice(1).concat(e.ai.seq[0]);
  }
  s.events.push({ type: 'bossIntro', nameKey: o.nameKey, boss: arch, x: x, y: y, hood: o.hoodId || null });
  peelCrowd(s, e, B);
  arenaHeal(s);
  return e;
};

// Survivors walk to the edges, retaining HP, drops and collision. Nothing is despawned/teleported.
function peelCrowd(s, boss, B) {
  if (!B.encounter) return;
  var K=P.CFG.bossCrowd,near=s.enemies.filter(function(e){return e!==boss&&!e.dead&&P.Enemies.dist(e,boss)<K.peelRadius;});
  near.sort(function(a,b){return P.Enemies.dist(a,s.hero)-P.Enemies.dist(b,s.hero);});
  near.forEach(function(e,i){
    if(i<B.encounter.cap&&e.type==='walker')return;
    var at={x:(e.x>=boss.x?1:-1)*K.side,y:boss.y-K.back};
    P.World.clampWalk(at,e.r,s.props);e.lure={x:at.x,y:at.y,t:K.peelT};
  });
}

// Boss-arena pass: one simit pickup just ahead of the hero at the intro (levels.bossHeal), so the fight starts after the approach's
// damage has been partly undone. Generated arenas only (s.gen.arena). With uncapped (config) it is outside drops.healCap (combat.js).
function arenaHeal(s) {
  var H = P.CFG.levels.bossHeal, h = s.hero, V = P.CFG.view;
  if (!H || !(H.value > 0) || !s.gen || !s.gen.arena) return;
  var x = Math.max(-V.heroClampX, Math.min(V.heroClampX, h.x));
  s.drops.push({ kind: 'simit', value: H.value, x: x, y: h.y + H.ahead, mag: false, pop: H.pop, uncapped: !!H.uncapped });
}

function makeAI(e) {
  var B = def(e);
  return { seq: B.phases ? B.phases[0].seq : SEQ[e.type], k: 0, needPause: false, m: 'walk', t: 0, W: 0, act: null,
    cd: B.firstGap === undefined ? 1.0 : B.firstGap,
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
  if (a.m === 'cookStep') {
    if (a.cd > 0 && P.Enemies.dist(e, s.hero) > B.swing.approach) {
      e.dvx = a.dir.x * B.swing.stepSpeed; e.dvy = a.dir.y * B.swing.stepSpeed;
      return true;
    }
    a.m = 'walk'; a.act = null; a.cd = 0;
  }
  if (a.m === 'captainTow') return true;
  if (a.m === 'charge') { chargeStep(s, e, dt); return true; }
  if (a.m === 'pause' || a.m === 'stall' || a.m === 'recover' || a.m === 'switchRecover') {
    a.t -= dt; e.dvx = 0; e.dvy = 0;
    if (a.t <= 0) { if (a.m === 'recover') startSwing(s, e, a, B); else a.m = 'walk'; }
    return true;
  }
  // Walk the first anchor into range so the warning and the hand that throws it are both visible.
  if (e.bossPreset === 'quayCaptain' && e.phase === 1 && a.k === 0 &&
      P.Enemies.dist(e, s.hero) > B.anchor.reach) return move(s, e, dt, B);
  if (a.cd <= 0) return nextAction(s, e, a, B, dt);
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
  a.seq = B.phases[p - 1].seq;
  // Continue after the real current action: HP transitions must not repeatedly restart the same signature.
  a.k = a.act ? (a.seq.indexOf(a.act) + 1) % a.seq.length : 0;
  if(a.act&&a.seq.some(function(act){return act!==a.act;}))
    while(a.seq[a.k%a.seq.length]===a.act)a.k++;
  a.wm = B.phases[p - 1].wm; a.gapMul = B.phases[p - 1].gapMul; a.spdMul = B.phases[p - 1].spdMul;
  a.needPause = true;
  s.events.push(phaseEv(e, p));
  if (e.bossPreset && P.IstiklalTrial) P.IstiklalTrial.bossPhase(s, e, p);
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

function nextAction(s, e, a, B, dt) {
  if (a.needPause) { a.needPause = false; a.m = 'pause'; a.t = a.rageOn ? B.pause * 0.5 : B.pause; e.dvx = 0; e.dvy = 0; return true; }
  var name = a.seq[a.k % a.seq.length];
  // The cable worker must physically approach between relays. Back-to-back remote casts otherwise never walk.
  if(B.attackApproach&&P.Enemies.dist(e,s.hero)>B.attackApproach)return move(s,e,dt,B);
  if(name==='ticketPunch'&&P.Enemies.dist(e,s.hero)>B.punch.reach+B.punch.r*.55)return move(s,e,dt,B);
  if(name==='ropeSweep'&&P.Enemies.dist(e,s.hero)>B.rope.approach){
    a.ropePursuit=(a.ropePursuit||0)+dt;
    if(a.ropePursuit<B.rope.pursueT)return move(s,e,dt,B);
    // A missed approach becomes a dock command, not an empty remote rope or endless chase.
    name='dockCarts';a.k=a.seq.indexOf(name);
  }
  a.ropePursuit=0;
  if (name === 'vatmanBell' && P.Enemies.dist(e, s.hero) > B.bell.approach) return move(s, e, dt, B);
  if (e.bossPreset === 'cook' && name === 'combo' && P.Enemies.dist(e, s.hero) > B.swing.approach) {
    // Take a short, purposeful step after throwing. A player at long range can still bait the toss.
    if (a.act !== 'throw') name = 'throw';
    else {
      a.m = 'cookStep'; a.dir = P.Enemies.unit(s.hero.x - e.x, s.hero.y - e.y); a.cd = B.pursueT;
      return true;
    }
  }
  a.k++;
  if (a.k % a.seq.length === 0) a.needPause = true;
  if (name === 'summon' && P.Levels.earlyNormal(s) &&
    (s.gen.summoned || 0) >= P.CFG.levels.istiklalRoute.bossSummons) name = 'stomp';
  start(s, e, name);
  return true;
}

// Movement between attacks: brute, bloater and the additions chase; spitter keeps distance (as the spitter, boss-sized).
function move(s, e, dt, B) {
  var h = s.hero, a = e.ai, stage = P.CFG.bossDirection[e.bossPreset];
  var sp = e.speed * a.spdMul * (a.rageOn && e.type === 'brute' ? P.CFG.bosses.brute.rageSpeed : 1);
  var d = P.Enemies.dist(e, h), u = P.Enemies.unit(h.x - e.x, h.y - e.y);
  if ((e.bossPreset === 'linekeeper' || e.bossPreset === 'vatman' || e.bossPreset === 'bellkeeper') && e.exposed) { e.dvx = 0; e.dvy = 0; return true; }
  var radial = !B.keep || d > B.keep + B.band ? 1 : d < B.keep - B.band ? -1 : 0;
  var flank = B.keep ? stage && stage.flank || .9 : stage && stage.flank || 0;
  a.strafeT -= dt;
  if (a.strafeT <= 0) { a.side = -a.side; a.strafeT = B.sideT || 2.5; }
  var v = P.Enemies.unit(u.x * radial - u.y * a.side * flank, u.y * radial + u.x * a.side * flank);
  var ease = stage ? 1 - Math.exp(-dt / stage.settle) : 1;
  e.dvx = (e.dvx || 0) + (v.x * sp - (e.dvx || 0)) * ease;
  e.dvy = (e.dvy || 0) + (v.y * sp - (e.dvy || 0)) * ease;
  return true;
}

// Begin an attack: pick its windup, place its telegraphs (all owned by this boss).
function start(s, e, name) {
  var a = e.ai, B = def(e), h = s.hero, rage = a.rageOn, W;
  a.m = 'windup'; a.t = 0; a.act = name; e.dvx = 0; e.dvy = 0;
  a.dir = P.Enemies.unit(h.x - e.x, h.y - e.y);
  if ((P.GalataTrial && P.GalataTrial.attack(s, e, a, B, name, tele)) ||
      (P.KarakoyBoss && P.KarakoyBoss.attack(s, e, a, name, tele)) ||
      (P.BridgeBoss && P.BridgeBoss.attack(s, e, a, name, tele)) ||
      (P.EminonuBoss && P.EminonuBoss.attack(s, e, a, name, tele)) ||
      (P.SirkeciBoss && P.SirkeciBoss.attack(s, e, a, name, tele)) ||
      (P.IstiklalTrial && P.IstiklalTrial.attack(s, e, a, B, name, tele))) {
    // The district encounters prepare their own lanes and impact points.
  } else if (name === 'switchHook') {
    a.W = tele(B.hook.windup * a.wm);
    addTele(s, e, { kind: 'ring', x: e.x + a.dir.x * B.hook.reach, y: e.y + a.dir.y * B.hook.reach,
      r: B.hook.r, T: a.W, then: 'swing', dmg: P.Enemies.dmgOf(s, e, B.hook.dmg), kb: B.hook.kb, cause: 'switchkeeper', col: 'slam' });
  } else if (name === 'switchRails') {
    startRails(s, e, a, B.rails);
  } else if (name === 'charge') {
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
      kb: 0.6, cause: e.bossPreset || e.type, col: 'danger' });
    if (e.bossPreset === 'cook') a.cookToss = { x: h.x, y: h.y, released: false };
    else P.Enemies3.launchBlade(s, e.x, e.y, h.x, h.y, a.W, e.type);
    s.events.push({ type: 'bossWindup', id: e.id, x: e.x, y: e.y, boss: e.type, act: 'throw', T: a.W });
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

function startRails(s, e, a, R) {
  a.W = tele(R.windup * a.wm);
  var y = Math.max(s.geo.holdY - 6, s.hero.y - R.len * 0.52);
  var lane = Math.max(-1, Math.min(1, Math.round(s.hero.x / R.spacing)));
  var lanes = e.phase > 1 ? [lane, lane === 0 ? a.side : 0] : [lane];
  lanes.forEach(function (l) {
    var tg = P.Enemies.lane(s, l * R.spacing, y, 0, 1, Math.min(R.len, s.geo.exitY - y), R.w, a.W);
    tg.owner = e.id; tg.then = 'switchRails'; tg.dmg = P.Enemies.dmgOf(s, e, R.dmg); tg.life = R.sparkT;
  });
}

P.Bosses.hitRails = function (s, tg) {
  var h = s.hero, r = P.CFG.hero.radius;
  var dx = h.x - tg.x, dy = h.y - tg.y, f = dx * tg.dx + dy * tg.dy, side = dy * tg.dx - dx * tg.dy;
  var hit = f >= -r && f <= tg.len + r && Math.abs(side) <= tg.w / 2 + r;
  if (hit) {
    P.Combat.damageHero(s, tg.dmg, tg.cause || 'switchkeeper');
  }
  if (tg.cause === 'ticketMan') P.SirkeciBoss.railResolved(s, tg, hit);
  s.events.push({ type: 'bossRail', x: tg.x, y: tg.y, dx: tg.dx, dy: tg.dy, len: tg.len, w: tg.w, T: tg.life });
};

// One swing of the kasapBoss combo: a ring on the spot in front of the boss. Swings chain from the recover state.
function startSwing(s, e, a, B) {
  var i = 3 - a.combo, h = s.hero, W = tele(B.swing.windup[i] * a.wm), dir = P.Enemies.unit(h.x - e.x, h.y - e.y);
  a.combo--; a.m = 'windup'; a.t = 0; a.W = W; a.act = 'combo'; a.dir = dir; e.dvx = 0; e.dvy = 0;
  addTele(s, e, { kind: 'ring', x: e.x + dir.x * B.swing.reach, y: e.y + dir.y * B.swing.reach, r: B.swing.r, T: W,
    then: 'swing', dmg: P.Enemies.dmgOf(s, e, B.swing.dmg), kb: B.swing.kb, cause: e.bossPreset || e.type, col: 'slam' });
  s.events.push({ type: 'bossWindup', id: e.id, x: e.x, y: e.y, boss: e.type, act: 'combo', T: W });
}

// Stomp rings use the director's telegraph list (drawn as the standard hatched ring); the rest use enemyTele.
function addTele(s, e, t) {
  t.t = 0; t.owner = e.id;
  if (t.then === 'stomp') s.dir.telegraphs.push(t); else s.enemyTele.push(t);
}

function windupStep(s, e, dt) {
  var a = e.ai, B = def(e);
  e.dvx = 0; e.dvy = 0; a.t += dt; e.windup = P.Enemies.clamp01(a.t / a.W);
  if (e.bossPreset === 'cook' && a.act === 'throw' && a.cookToss && !a.cookToss.released && e.windup >= B.throw.releaseAt) {
    a.cookToss.released = true;
    P.Enemies3.launchBlade(s, e.x, e.y, a.cookToss.x, a.cookToss.y, Math.max(dt, a.W - a.t), 'cook',e.id);
    s.events.push({ type: 'cookRelease', x: e.x, y: e.y });
  }
  if (a.t < a.W) return true;
  e.windup = 0;
  if (a.act === 'charge') {
    a.m = 'charge'; a.dist = 0; a.hit = false; a.px = e.x; a.py = e.y;
    a.p.x = e.x; a.p.y = e.y;
    s.events.push({ type: 'bruteCharge', x: e.x, y: e.y, dx: a.dir.x, dy: a.dir.y, boss: true });
    return true;
  }
  if (a.act === 'combo' && a.combo > 0) { a.m = 'recover'; a.t = B.swing.recover; return true; }
  if (e.bossPreset === 'cook') {
    if (a.act === 'combo') P.Bosses.exposeFor(s, e, B.exposeT);
    else {
      a.m = 'pause'; a.t = B.throw.recover; a.cd = Math.max(B.throw.recover,gapOf(a,B));
      expose(e,B);
      s.events.push({type:'bossStall',id:e.id,x:e.x,y:e.y,boss:e.type});
    }
    return true;
  }
  if (a.act === 'switchHook') {
    a.m = 'switchRecover'; a.t = B.hook.reset; a.cd = B.exposeT;
    expose(e, B);
    s.events.push({ type: 'bossStall', id: e.id, x: e.x, y: e.y, boss: e.type });
    return true;
  }
  if (a.act === 'switchRails') { a.m = 'switchRecover'; a.t = B.rails.reset; a.cd = B.rails.gap || gapOf(a, B); return true; }
  if (a.act === 'districtTram') { a.m = 'switchRecover'; a.t = B.tram.sweep; a.cd = a.t; return true; }
  if (a.act === 'ropeSweep') { a.m = 'switchRecover'; a.t = B.rope.T; a.cd = a.t; return true; }
  if (a.act === 'dockCarts') { P.Bosses.exposeFor(s,e,B.carts.reset); return true; }
  if (a.act === 'bridgeCast') { a.m = 'switchRecover'; a.t = Infinity; return true; }
  if (a.act === 'captainAnchor') { P.EminonuBoss.launch(e); return true; }
  if (a.act === 'ticketPunch' || a.act === 'stationSignal') { P.SirkeciBoss.recover(s, e, a); return true; }
  if (a.act === 'counterweights') { a.m = 'switchRecover'; a.t = Infinity; return true; }
  var recovery = a.act === 'arcRelay' ? B.relay : a.act === 'arcKnot' ? B.knot :
    a.act === 'vatmanLever' ? B.lever : a.act === 'vatmanBell' ? B.bell : null;
  if (recovery) {
    a.m = 'switchRecover'; a.t = recovery.reset; a.cd = B.exposeT; expose(e, B);
    s.events.push({ type: 'bossStall', id: e.id, x: e.x, y: e.y, boss: e.type });
    return true;
  }
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
  if (B.stall && (blocked || B.stall.coast)) {
    a.m = 'stall'; a.t = blocked ? B.stall.T : B.stall.coast; expose(e, B);
    if(e.bossPreset==='vatman')a.cd=Math.max(a.cd,a.t);
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

P.Bosses.exposeFor = function (s, e, reset) {
  var a = e.ai, B = def(e);
  a.m = 'switchRecover'; a.t = reset; a.cd = B.exposeT;
  expose(e, B);
  s.events.push({ type: 'bossStall', id: e.id, x: e.x, y: e.y, boss: e.type });
};

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
  s.events.push({ type: 'bossDie', x: e.x, y: e.y, nameKey: e.nameKey, boss: e.type,
    body: { id: e.id, x: e.x, y: e.y, r: e.r, state: 'active', boss: true, type: e.type, bossPreset: e.bossPreset,
      nameKey: e.nameKey, kbx: e.kbx, skin: e.skin, variant: e.variant, walk: e.walk, age:e.age, deathPose:P.BossDeathState.capture(e),
      settledTool:e.captainTow?{kind:'anchor',x:e.captainTow.tx,y:e.captainTow.ty,released:e.captainTow.phase!=='aim'}:null,
      ai: { m: 'defeat', act:e.ai.act,dir:{x:e.ai.dir.x,y:e.ai.dir.y} } } });
  s.drops.push({ kind: 'chest', value: 1, boss: true, x: e.x, y: e.y, mag: true, pop: 0.9 });
  s.enemyTele = s.enemyTele.filter(function (t) { return t.owner !== e.id; });
  s.dir.telegraphs = s.dir.telegraphs.filter(function (t) { return t.owner !== e.id; });
  // Defeat resolves owned encounter machinery now, before the protected view suspends its clock.
  e.bridgeCast = e.bridgeNet = e.captainTow = e.captainDust = null;
  e.dockRope=null;e.dockCarts=[];
  if(s.e3)s.e3.blades=s.e3.blades.filter(function(b){return b.owner!==e.id;});
};
