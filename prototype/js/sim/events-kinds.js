// Level event kinds (v0.5, workstream B). Each kind: start(s, ev, o), step(s, ev, dt), optional onKill(s, ev, e).
// ambush / pier: a telegraphed horde from a side street. loot: a simit-tray runner to catch. rescue: trappers
// around a cage, then hold by it to free the civilian (gift; a helper at high charm). blackout: lights out
// (spawn rate up, glowing eyes). hazard: a burning car (fuse, blast) or a gas leak. stampede: fleeing civilians
// push the hero and the zombies. barricade: smash it to pass (generated levels). chest: a guarded chest box.
// defend: hold a zone while waves come. set: one telegraphed special spawn (shop door, balcony, screamer).
// Tuning lives in P.CFG.ev (config-levels.js). Registry and lifecycle: events.js.
P.EventKinds = {};
var EK = P.EventKinds;
var cfg = function (k) { return P.CFG.ev[k]; };

function sideOf(s, o) {
  if (o && o.x !== undefined) return o.x < 0 ? -1 : 1;
  return s.rng.spawn.chance(0.5) ? 1 : -1;
}

function unit(dx, dy) {
  var d = Math.hypot(dx, dy) || 1;
  return { x: dx / d, y: dy / d };
}

// ---------- ambush / pier: horde from a side street, telegraphed by an arrow ----------
function hordeKind(key) {
  return {
    start: function (s, ev, o) {
      var A = cfg(key), h = s.hero;
      ev.side = sideOf(s, o); ev.T = cfg('telegraphT'); ev.n = o.n || A.n; ev.types = o.types || ['walker'];
      ev.x = ev.side * A.x;
      ev.y = P.Events.clampY(s, h.y + A.lead + s.rng.spawn.range(-A.jit, A.jit));
    },
    step: function (s, ev) {
      if (ev.t < ev.T) return;
      var A = cfg(key);
      for (var i = 0; i < ev.n; i++) {
        var y = P.Events.clampY(s, ev.y + (i - ev.n / 2) * A.spacing);
        P.Events.spawn(s, ev, ev.types[i % ev.types.length], ev.x, y, {});
      }
      s.events.push({ type: 'ambush', x: ev.x, y: ev.y, side: ev.side, kind: key });
      P.Events.end(s, ev, 'done');
    },
  };
}
EK.ambush = hordeKind('ambush');
EK.pier = hordeKind('pier');

// ---------- loot runner: flees ahead of the hero with a simit tray; catch it for jeton and a chest ----------
EK.loot = {
  start: function (s, ev) {
    var L = cfg('loot'), rng = s.rng.spawn, h = s.hero;
    ev.x = (rng.chance(0.5) ? -1 : 1) * rng.range(L.xMin, L.xMax);
    ev.y = P.Events.clampY(s, h.y + L.spawnAhead);
    var e = P.Events.spawn(s, ev, 'walker', ev.x, ev.y, { state: 'active' });
    e.hp = L.hp * (s.diff ? s.diff.hp : 1); e.maxHp = e.hp; e.speed = L.speed; e.lootEv = ev.id;
    ev.e = e; ev.T = L.life;
    P.Director.bark(s, 'barkLoot');
  },
  step: function (s, ev) {
    if (ev.t < ev.T) return;
    var e = ev.e;
    if (e && !e.dead) { e.dead = true; e.lootEv = 0; s.events.push({ type: 'lootEscape', x: e.x, y: e.y }); }
    P.Events.end(s, ev, 'escaped');
  },
  // Flee: away from the hero with a sideways wobble (enemies.js calls this for lootEv enemies).
  think: function (s, e) {
    var L = cfg('loot'), h = s.hero, dx = e.x - h.x, dy = e.y - h.y, d = Math.hypot(dx, dy) || 1;
    var w = Math.sin(e.age * L.wobbleRate) * L.runAway;
    var u = unit(dx / d - dy / d * w, dy / d + dx / d * w);
    e.dvx = u.x * e.speed; e.dvy = u.y * e.speed;
    return true;
  },
  onKill: function (s, ev, e) {
    var L = cfg('loot');
    P.Events.drop(s, 'jeton', e.x, e.y, Math.round(L.jeton * (1 + s.fx.coinPct)));
    P.Events.drop(s, 'chest', e.x, e.y, cfg('chest').drop, cfg('chest').pop);
    s.events.push({ type: 'lootCaught', x: e.x, y: e.y });
    P.Events.end(s, ev, 'caught');
  },
};

// ---------- rescue: trappers around a cage; clear them, then hold by the cage to free the civilian ----------
EK.rescue = {
  start: function (s, ev) {
    var R = cfg('rescue'), rng = s.rng.spawn, h = s.hero;
    ev.x = P.Events.clampX(s, rng.range(-R.xRange, R.xRange));
    ev.y = P.Events.clampY(s, h.y + R.ahead);
    ev.hold = 0; ev.left = R.trappers; ev.T = R.timeout; ev.in = false;
    for (var i = 0; i < R.trappers; i++) {
      var a = i / R.trappers * Math.PI * 2 + rng.range(0, R.angJit);
      P.Events.spawn(s, ev, 'walker', P.Events.clampX(s, ev.x + Math.cos(a) * R.ringR),
        P.Events.clampY(s, ev.y + Math.sin(a) * R.ringR), {});
    }
  },
  step: function (s, ev, dt) {
    var R = cfg('rescue'), h = s.hero;
    ev.left = P.Events.countTagged(s, ev.id);
    ev.in = Math.hypot(h.x - ev.x, h.y - ev.y) <= R.holdR;
    ev.hold = ev.in && ev.left === 0 ? ev.hold + dt : Math.max(0, ev.hold - dt);
    if (ev.hold >= R.holdT) { freed(s, ev); return; }
    if (ev.t >= ev.T) {
      s.events.push({ type: 'civDied', id: ev.id, x: ev.x, y: ev.y });
      P.Events.end(s, ev, 'failed');
    }
  },
};

// The gift: jeton and a simit; civHelpPct (charm) raises the jeton and brings a helper for helperT seconds.
function freed(s, ev) {
  var R = cfg('rescue'), f = s.fx, val = Math.round(R.jeton * (1 + f.coinPct) * (1 + f.civHelpPct));
  var helper = f.civHelpPct >= R.helperMin;
  P.Events.drop(s, 'jeton', ev.x, ev.y, val);
  P.Events.drop(s, 'simit', ev.x + R.simitDx, ev.y, R.heal);
  if (helper) P.Events.addHelper(s, ev.x, ev.y);
  s.tally.rescues++;
  s.events.push({ type: 'rescueDone', id: ev.id, x: ev.x, y: ev.y, jeton: val, helper: helper });
  P.Events.end(s, ev, 'freed');
}

// ---------- blackout: lights out for T seconds (spawn rate up; enemies in view get glowing eyes) ----------
EK.blackout = {
  start: function (s, ev, o) {
    var B = cfg('blackout');
    ev.T = o.T || B.T; ev.mul = B.spawnMul; ev.glowR = B.glowR;
    s.events.push({ type: 'blackoutStart', id: ev.id, x: s.hero.x, y: s.hero.y, T: ev.T });
  },
  step: function (s, ev) {
    if (ev.t < ev.T) return;
    s.events.push({ type: 'blackoutEnd', id: ev.id });
    P.Events.end(s, ev, 'done');
  },
};

// ---------- hazard: a burning car (fuse, then blast) or a gas leak (a toxic cloud for a while) ----------
EK.hazard = {
  start: function (s, ev, o) {
    var H = cfg('car'), Z = cfg('hazard'), rng = s.rng.spawn, h = s.hero;
    ev.sub = o.sub || (rng.chance(0.5) ? 'car' : 'gas');
    ev.x = P.Events.clampX(s, rng.range(-Z.xRange, Z.xRange));
    ev.y = P.Events.clampY(s, h.y + Z.ahead);
    if (ev.sub === 'car') {
      ev.T = H.fuse;
      s.events.push({ type: 'carFuse', id: ev.id, x: ev.x, y: ev.y, T: H.fuse });
      return;
    }
    var G = cfg('gas');
    ev.T = G.t;
    s.zones.push({ kind: 'toxic', x: ev.x, y: ev.y, r: G.r, t: G.t, T: G.t, dps: G.dps, heroDps: G.heroDps, tick: 0, hit: {} });
    s.events.push({ type: 'gasLeak', id: ev.id, x: ev.x, y: ev.y, r: G.r, T: G.t });
  },
  step: function (s, ev) {
    if (ev.t < ev.T) return;
    if (ev.sub === 'car') { EK.blast(s, ev.x, ev.y, cfg('car')); P.Events.end(s, ev, 'blast'); return; }
    P.Events.end(s, ev, 'done');
  },
};

// Blast (car fuse, car alarm): explosion event (F and sfx), enemies in range take enemyDmg, the hero heroDmg, a fire patch.
EK.blast = function (s, x, y, B) {
  s.events.push({ type: 'explode', x: x, y: y, r: B.blastR, trauma: B.trauma });
  s.zones.push({ kind: 'fire', x: x, y: y, r: B.fireR, t: B.fireT, T: B.fireT, dps: B.fireDps });
  for (var i = 0; i < s.enemies.length; i++) {
    var e = s.enemies[i], dx = e.x - x, dy = e.y - y, d = Math.hypot(dx, dy) || 1;
    if (d - e.r <= B.blastR) P.Combat.damageEnemy(s, e, B.enemyDmg, dx / d, dy / d, B.kb, false, 'blast');
  }
  var h = s.hero;
  if (Math.hypot(h.x - x, h.y - y) - P.CFG.hero.radius <= B.blastR) P.Combat.damageHero(s, B.heroDmg, 'car');
  if (s.env && P.Env) P.Env.chainAt(s, x, y, B.blastR, 'chain', P.CFG.env.fuse.chain);   // lane A: this blast lights canisters and bomb cars
};

// ---------- stampede: fleeing civilians cross the street; they push the hero, and shove zombies out of the way ----------
EK.stampede = {
  start: function (s, ev, o) {
    var S = cfg('stampede'), rng = s.rng.spawn, h = s.hero;
    ev.dir = sideOf(s, o); ev.T = S.T; ev.civs = [];
    ev.y = P.Events.clampY(s, h.y + S.yAhead);
    ev.x = -ev.dir * S.lane;
    for (var i = 0; i < S.n; i++) {
      ev.civs.push({ x: ev.x + rng.range(-0.5, 0.5), y: ev.y + rng.range(-S.yJit, S.yJit),
        vx: ev.dir * S.speed * rng.range(1 - S.vJit, 1 + S.vJit), variant: rng.int(0, 7), walk: rng.range(0, 3) });
    }
    s.events.push({ type: 'stampedeStart', id: ev.id, x: ev.x, y: ev.y, dir: ev.dir });
  },
  step: function (s, ev, dt) {
    var S = cfg('stampede'), h = s.hero, hr = P.CFG.hero.radius;
    ev.civs.forEach(function (c) {
      c.x += c.vx * dt; c.walk += Math.abs(c.vx) * dt;
      P.World.pushOutCircle(h, hr, c.x, c.y, S.pushR);
      shoveNear(s, c, S);
    });
    P.World.clampHero(s, h);
    if (ev.t >= ev.T) P.Events.end(s, ev, 'done');
  },
};

function shoveNear(s, c, S) {
  for (var i = 0; i < s.enemies.length; i++) {
    var e = s.enemies[i], dx = e.x - c.x, dy = e.y - c.y, d = Math.hypot(dx, dy);
    if (e.dead || e.boss || d > S.pushR + e.r || d < 1e-3) continue;
    P.Combat.shove(e, dx / d, dy / d, S.shove);
  }
}

// ---------- barricade (generated levels): a breakable wall across the lane with one gap; smash it by standing next to it ----------
EK.barricade = {
  start: function (s, ev) {
    var B = cfg('barricade'), G = s.geo, h = s.hero;
    if (!G) { P.Events.end(s, ev, 'skipped'); return; }   // L1 has no blocks
    ev.x = B.cx; ev.y = Math.min(G.exitY - B.exitGap, h.y + B.ahead);
    var rc = { xMin: ev.x - B.w / 2, xMax: ev.x + B.w / 2, yMin: ev.y - B.h / 2, yMax: ev.y + B.h / 2 };
    ev.blk = { kind: 'barricade', x: ev.x, y: ev.y, w: B.w, h: B.h, rc: rc };
    G.blocks.push(ev.blk);
    ev.prog = 0;
    s.events.push({ type: 'barricadeStart', id: ev.id, x: ev.x, y: ev.y, w: B.w });
  },
  step: function (s, ev, dt) {
    var B = cfg('barricade'), h = s.hero, rc = ev.blk.rc;
    var cx = Math.min(Math.max(h.x, rc.xMin), rc.xMax), cy = Math.min(Math.max(h.y, rc.yMin), rc.yMax);
    var near = Math.hypot(h.x - cx, h.y - cy) <= B.holdR;
    ev.near = near;
    ev.prog = near ? ev.prog + dt : Math.max(0, ev.prog - dt * B.decay);
    if (ev.prog < B.breakT) return;
    var i = s.geo.blocks.indexOf(ev.blk);
    if (i >= 0) s.geo.blocks.splice(i, 1);
    s.events.push({ type: 'barricadeBroken', id: ev.id, x: ev.x, y: ev.y });
    P.Events.end(s, ev, 'smashed');
  },
};

// ---------- chest: a chest box guarded by an elite; the guard's death drops the box's chest ----------
EK.chest = {
  start: function (s, ev, o) {
    var C = cfg('chest'), rng = s.rng.spawn, h = s.hero;
    ev.x = P.Events.clampX(s, rng.range(-C.xRange, C.xRange));
    ev.y = P.Events.clampY(s, h.y + C.ahead);
    ev.guard = P.Events.spawn(s, ev, o.type || 'walker', ev.x, ev.y + C.guardDist, { elite: true });
    s.events.push({ type: 'chestGuard', id: ev.id, x: ev.x, y: ev.y, enemy: ev.guard.type });
  },
  step: function () {},
  onKill: function (s, ev) {
    P.Events.drop(s, 'chest', ev.x, ev.y, cfg('chest').drop, cfg('chest').pop);
    P.Events.end(s, ev, 'guarded');
  },
};

// ---------- defend point: stand in the zone until the bar fills; waves come every few seconds ----------
EK.defend = {
  start: function (s, ev) {
    var D = cfg('defend'), rng = s.rng.spawn, h = s.hero;
    ev.x = P.Events.clampX(s, rng.range(-D.xRange, D.xRange));
    ev.y = P.Events.clampY(s, h.y + D.ahead);
    ev.prog = 0; ev.nextWave = 0; ev.inside = false; ev.r = D.r; ev.T = D.expire;
  },
  step: function (s, ev, dt) {
    var D = cfg('defend'), h = s.hero;
    ev.inside = Math.hypot(h.x - ev.x, h.y - ev.y) <= D.r;
    ev.prog = ev.inside ? Math.min(1, ev.prog + dt / D.T) : Math.max(0, ev.prog - dt * D.decay / D.T);
    if (ev.prog >= 1) {
      P.Events.drop(s, 'jeton', ev.x, ev.y, Math.round(D.jeton * (1 + s.fx.coinPct)));
      P.Events.drop(s, 'chest', ev.x + D.chestDx, ev.y, cfg('chest').drop, cfg('chest').pop);
      s.events.push({ type: 'defendHeld', id: ev.id, x: ev.x, y: ev.y });
      P.Events.end(s, ev, 'held');
      return;
    }
    if (ev.t >= D.expire) { P.Events.end(s, ev, 'expired'); return; }
    ev.nextWave -= dt;
    if (ev.nextWave <= 0) { ev.nextWave = D.every; defendWave(s, ev, D); }
  },
};

function defendWave(s, ev, D) {
  for (var i = 0; i < D.n; i++) {
    var p = P.Events.farSpot(s, ev.x, ev.y, D.ringR * 0.9, D.ringR * 1.2, true);
    if (p) P.Events.spawn(s, ev, 'walker', p.x, p.y, {});
  }
}

// ---------- set piece: one special enemy after a telegraph (shop door, balcony, screamer) ----------
var SET_BARK = { bloater: 'barkBloater', spitter: 'barkSpitter', screamer: 'barkScreamer' };
EK.set = {
  start: function (s, ev, o) {
    ev.type = o.type; ev.T = cfg('set').telegraphT; ev.anchored = !!o.anchored; ev.label = o.label || o.type;
    ev.x = P.Events.clampX(s, o.x); ev.y = P.Events.clampY(s, o.y);
    if (SET_BARK[o.type]) P.Director.bark(s, SET_BARK[o.type]);
  },
  step: function (s, ev) {
    if (ev.t < ev.T) return;
    s.events.push({ type: 'doorBurst', x: ev.x, y: ev.y });
    P.Events.spawn(s, ev, ev.type, ev.x, ev.y, { anchored: ev.anchored });
    P.Events.end(s, ev, 'spawned');
  },
};
