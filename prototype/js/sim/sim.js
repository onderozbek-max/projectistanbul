// Simulation state + fixed-step update. Pure logic: no DOM, no canvas, no settings (ARCH 4.17).
// Step order follows game/tools/benchmark/bench_world.gd: hero -> director -> swarm -> weapons ->
// projectiles -> contact -> remove dead -> pickups -> regen/DoT.
P.createSim = function (seed) {
  var C = P.CFG, L = C.level;
  var s = {
    seed: seed, rng: P.makeStreams(seed), t: 0, runT: 0, mode: 'cutscene',
    hero: {
      x: L.heroStart.x, y: L.heroStart.y, hp: C.hero.maxHp, maxHp: C.hero.maxHp, fx: 0, fy: 1,
      moved: 0, invuln: 0, pickupRadius: C.hero.pickupRadius, weapons: { fork: 1 }, passives: {},
      cds: { fork: 0, tea: 0 }, moving: false,
    },
    enemies: [], nextId: 1, drops: [], projs: [], zones: [], events: [],
    props: P.World.createProps(),
    xp: 0, level: 1, pendingLevels: 0, cardPicks: 0, rerolls: C.cards.freeRerolls, levelUps: [],
    kills: 0, jeton: 0, xpPicked: 0, swings: 0, peakAlive: 0,
    reviveUsed: false, secondWindUsed: false, deathCause: null, dinersSpawned: false,
  };
  s.dir = P.Director.create();
  L.diners.forEach(function (d, i) {
    var e = P.Combat.spawnEnemy(s, 'diner', d.x, d.y, { state: 'dormant' });
    e.dinerIndex = i;
  });
  s.dinersSpawned = true;
  return s;
};

// Hand control to the player at the end of the cold open (LD 4 S10, 7).
P.startPlay = function (s) {
  s.mode = 'play';
  s.enemies.forEach(function (e) {
    if (e.type !== 'diner') return;
    var d = P.CFG.level.diners[e.dinerIndex];
    if (d.delay > 0) { e.state = 'turning'; e.stateT = d.delay; } else e.state = 'active';
  });
  P.Director.prompt(s, 't_move', 'prompt.t_move');
  s.events.push({ type: 'controlStart' });
};

P.revive = function (s, kind) {
  var h = s.hero;
  h.hp = h.maxHp;
  h.invuln = P.CFG.hero.secondWindInvuln;
  s.mode = 'play';
  if (kind === 'secondWind') s.secondWindUsed = true; else s.reviveUsed = true;
  s.events.push({ type: 'revive', kind: kind });
};

function stepHero(s, dt, input) {
  var h = s.hero, mx = input ? input.x : 0, my = input ? input.y : 0, m = Math.hypot(mx, my);
  if (m > 1) { mx /= m; my /= m; m = 1; }
  h.moving = m > 0.08;
  if (h.moving) {
    var sp = P.Hero.speed(s), ox = h.x, oy = h.y;
    h.fx = mx / m; h.fy = my / m;
    h.x += mx * sp * dt; h.y += my * sp * dt;
    P.World.clampWalk(h, P.CFG.hero.radius, s.props);
    h.moved += Math.hypot(h.x - ox, h.y - oy);
  }
  h.invuln = Math.max(0, h.invuln - dt);
  var regen = (h.passives.ayran || 0) * P.CFG.passives.ayran.regen;
  if (regen > 0) h.hp = Math.min(h.maxHp, h.hp + regen * dt);
}

P.stepSim = function (s, dt, input) {
  if (s.mode !== 'play' || s.pendingLevels > 0) return;
  s.t += dt; s.runT += dt;
  stepHero(s, dt, input);
  P.Director.step(s, dt);
  if (s.mode !== 'play') return;
  P.Combat.updateEnemies(s, dt);
  var before = s.events.length;
  P.Combat.fireFork(s, dt);
  for (var i = before; i < s.events.length; i++) if (s.events[i].type === 'swing') { s.swings++; break; }
  P.Combat.fireTea(s, dt);
  P.Combat.updateProjectiles(s, dt);
  P.Combat.contact(s);
  P.Combat.updateBurnAndZones(s, dt);
  P.Combat.removeDead(s);
  P.Combat.updateDrops(s, dt);
  s.props.carts.forEach(function (c) { c.flash = Math.max(0, c.flash - dt); });
  s.props.canisters.forEach(function (c) { c.flash = Math.max(0, c.flash - dt); });
};

P.drainEvents = function (s) {
  var ev = s.events;
  s.events = [];
  return ev;
};
