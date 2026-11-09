// Heavy, fire and sky weapons (workstream E1): Sledgehammer (balyoz), Molotov, Fireworks (havai fişek)
// and Wedding Finale (the fireworks evolution). Each fires on a timer and resolves later (windup,
// flight, fall) so the view can animate anticipation -> action -> impact. Visuals: weapons-fx2.js.
P.Weapons2 = {};

// Area damage around a point (knockback outward). Returns how many enemies were hit.
P.Weapons2.aoe = function (s, x, y, r, dmg, kb, src) {
  var hits = 0;
  s.enemies.forEach(function (e) {
    if (e.dead || e.state !== 'active') return;
    var dx = e.x - x, dy = e.y - y, d = Math.hypot(dx, dy) || 0.01;
    if (d - e.r > r) return;
    hits++;
    P.Combat.damageEnemy(s, e, dmg, dx / d, dy / d, kb, true, src);
  });
  P.Combat.forEachProp(s, function (p) { if (Math.hypot(p.x - x, p.y - y) - p.r <= r) P.Combat.damageProp(s, p, dmg); });
  return hits;
};

// Nearest active enemy within range that is not in `taken`.
function nearestFree(s, x, y, range, taken) {
  var best = null, bd = range;
  s.enemies.forEach(function (e) {
    if (e.dead || e.state !== 'active' || taken.indexOf(e) >= 0) return;
    var d = Math.hypot(e.x - x, e.y - y);
    if (d < bd) { bd = d; best = e; }
  });
  return best;
}
P.Weapons2.nearestFree = nearestFree;

// ---------- Sledgehammer: windup -> slam (ring, stun, knockback) ----------
function queueSlam(s, x, y, lv, left, windup) {
  P.Weapons.state(s).slams.push({ x: x, y: y, t: windup, T: windup, lv: lv, left: left });
  s.events.push({ type: 'sledgeWindup', x: s.hero.x, y: s.hero.y, tx: x, ty: y, T: windup, n: left });
}

function fireSledge(s, dt) {
  var h = s.hero, cfg = P.CFG.weapons.sledge, lv = P.Weapons.level(h, 'sledge');
  if (!lv || !P.Weapons.ready(h, 'sledge', dt)) return;
  var t = P.Weapons.densest(s, cfg.range, cfg.clusterR, []);
  if (!t) return;
  h.cds.sledge = cfg.cooldown * lv.cdMult * P.Weapons.cdMult(s);
  queueSlam(s, t.x, t.y, lv, lv.slams, cfg.windup);
}

function impactSlam(s, sl) {
  var lv = sl.lv, cfg = P.CFG.weapons.sledge;
  var hits = P.Weapons2.aoe(s, sl.x, sl.y, lv.r, P.Weapons.dmg(s, lv.dmg), lv.kb * P.Weapons.kbMult(s), 'sledge');
  s.enemies.forEach(function (e) {
    if (!e.dead && e.state === 'active' && Math.hypot(e.x - sl.x, e.y - sl.y) - e.r <= lv.r) P.Status.apply(e, 'stun', lv.stun, 1);
  });
  s.events.push({ type: 'sledgeSlam', x: sl.x, y: sl.y, r: lv.r, stun: lv.stun, hits: hits, n: sl.left, heavy: true });
  if (sl.left > 1) {
    var nt = P.Weapons.densest(s, cfg.range, cfg.clusterR, []) || { x: sl.x, y: sl.y };
    queueSlam(s, nt.x, nt.y, lv, sl.left - 1, cfg.slamGap);
  }
}

function updateSlams(s, dt) {
  var list = P.Weapons.state(s).slams;
  for (var i = list.length - 1; i >= 0; i--) {
    var sl = list[i];
    sl.t -= dt;
    if (sl.t > 0) continue;
    list.splice(i, 1);
    impactSlam(s, sl);
  }
}

// ---------- Molotov: arcing bottle -> fire pool that applies Burn ----------
function fireMolotov(s, dt) {
  var h = s.hero, cfg = P.CFG.weapons.molotov, lv = P.Weapons.level(h, 'molotov');
  if (!lv || !P.Weapons.ready(h, 'molotov', dt)) return;
  var chosen = P.Weapons.pickClusters(s, cfg.range, cfg.clusterR, lv.bottles, cfg.flight);
  if (!chosen.length) return;
  h.cds.molotov = cfg.cooldown * lv.cdMult * P.Weapons.cdMult(s);
  var list = P.Weapons.state(s).flasks;
  chosen.forEach(function (c) {
    list.push({ x0: h.x, y0: h.y, x1: c.x, y1: c.y, t: 0, T: cfg.flight, lv: lv, spin: s.rng.combat.range(0, 6) });
  });
  s.events.push({ type: 'flaskThrow', x: h.x, y: h.y, n: chosen.length });
}

function shatter(s, f) {
  var lv = f.lv, cfg = P.CFG.weapons.molotov;
  P.Weapons2.aoe(s, f.x1, f.y1, cfg.clusterR * 0.8, P.Weapons.dmg(s, lv.dmg), 0.4, 'molotov');
  P.Weapons.state(s).pools.push({ x: f.x1, y: f.y1, r: lv.r, t: lv.life, T: lv.life, tick: cfg.burnTick });
  s.events.push({ type: 'flaskShatter', x: f.x1, y: f.y1, r: lv.r, life: lv.life, spin: f.spin });
}

function updateFlasks(s, dt) {
  var list = P.Weapons.state(s).flasks;
  for (var i = list.length - 1; i >= 0; i--) {
    var f = list[i];
    f.t += dt;
    if (f.t < f.T) continue;
    list.splice(i, 1);
    shatter(s, f);
  }
}

// Fire pools re-apply Burn every burnTick while enemies stand inside.
function updatePools(s, dt) {
  var list = P.Weapons.state(s).pools, cfg = P.CFG.weapons.molotov;
  for (var i = list.length - 1; i >= 0; i--) {
    var p = list[i];
    p.t -= dt;
    if (p.t <= 0) { list.splice(i, 1); continue; }
    p.tick -= dt;
    if (p.tick > 0) continue;
    p.tick += cfg.burnTick;
    var n = 0;
    s.enemies.forEach(function (e) {
      if (e.dead || e.state !== 'active' || Math.hypot(e.x - p.x, e.y - p.y) - e.r > p.r) return;
      P.Combat.addBurn(e); n++;
    });
    if (n > 0) s.events.push({ type: 'poolBurn', x: p.x, y: p.y, n: n });
  }
}

// ---------- Fireworks: homing rockets, colourful AoE burst ----------
function fireFireworks(s, dt) {
  var h = s.hero, cfg = P.CFG.weapons.fireworks, lv = P.Weapons.level(h, 'fireworks');
  if (!lv || !P.Weapons.ready(h, 'fireworks', dt)) return;
  var taken = [];
  for (var k = 0; k < lv.rockets; k++) {
    var t = nearestFree(s, h.x, h.y, cfg.seekRange, taken);
    if (!t) break;
    taken.push(t);
  }
  if (!taken.length) return;
  h.cds.fireworks = cfg.cooldown * lv.cdMult * P.Weapons.cdMult(s);
  var list = P.Weapons.state(s).rockets, col = s.rng.combat.int(0, 5), dmg = P.Weapons.dmg(s, lv.dmg);
  taken.forEach(function (t, j) {
    var a0 = Math.atan2(t.y - h.y, t.x - h.x) + (s.rng.combat.next() - 0.5) * 0.9;
    list.push({ x: h.x, y: h.y, a: a0, tgt: t, life: cfg.life, dmg: dmg, r: lv.r, col: (col + j) % 6, trail: [] });
  });
  s.events.push({ type: 'rocketLaunch', x: h.x, y: h.y, n: taken.length });
}

function wrapAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function touchesEnemy(s, r) {
  for (var i = 0; i < s.enemies.length; i++) {
    var e = s.enemies[i];
    if (!e.dead && e.state === 'active' && Math.hypot(e.x - r.x, e.y - r.y) < e.r + 0.3) return true;
  }
  return false;
}

function updateRockets(s, dt) {
  var list = P.Weapons.state(s).rockets, cfg = P.CFG.weapons.fireworks;
  for (var i = list.length - 1; i >= 0; i--) {
    var r = list[i];
    r.life -= dt;
    if (!r.tgt || r.tgt.dead || r.tgt.state !== 'active') r.tgt = nearestFree(s, r.x, r.y, 6, []);
    var want = r.tgt ? Math.atan2(r.tgt.y - r.y, r.tgt.x - r.x) : r.a, turn = cfg.turn * dt;
    r.a += Math.max(-turn, Math.min(turn, wrapAngle(want - r.a)));
    r.trail.push({ x: r.x, y: r.y });
    if (r.trail.length > 7) r.trail.shift();
    r.x += Math.cos(r.a) * cfg.speed * dt;
    r.y += Math.sin(r.a) * cfg.speed * dt;
    if (r.life > 0 && !touchesEnemy(s, r)) continue;
    list.splice(i, 1);
    P.Weapons2.aoe(s, r.x, r.y, r.r, r.dmg, 0.5, 'fireworks');
    s.events.push({ type: 'rocketBurst', x: r.x, y: r.y, r: r.r, col: r.col, big: false });
  }
}

// ---------- Wedding Finale: sky barrage over the screen (fireworks evolution) ----------
function fireFinale(s, dt) {
  var h = s.hero, cfg = P.CFG.weapons.finale, lv = P.Weapons.level(h, 'finale');
  if (!lv || !P.Weapons.ready(h, 'finale', dt)) return;
  h.cds.finale = cfg.cooldown * P.Weapons.cdMult(s);
  var list = P.Weapons.state(s).finale, rng = s.rng.combat, dmg = P.Weapons.dmg(s, lv.dmg);
  for (var i = 0; i < lv.rockets; i++) {
    list.push({ x: h.x + rng.range(-lv.spanX, lv.spanX), y: h.y + rng.range(-lv.spanY * 0.4, lv.spanY),
      t: -i * cfg.gap, T: cfg.fall, dmg: dmg, r: lv.r, col: rng.int(0, 5) });
  }
  s.events.push({ type: 'finaleStart', x: h.x, y: h.y, n: lv.rockets, T: cfg.fall + lv.rockets * cfg.gap });
}

function updateFinale(s, dt) {
  var list = P.Weapons.state(s).finale;
  for (var i = list.length - 1; i >= 0; i--) {
    var f = list[i];
    f.t += dt;
    if (f.t < f.T) continue;
    list.splice(i, 1);
    P.Weapons2.aoe(s, f.x, f.y, f.r, f.dmg, 0.6, 'finale');
    s.events.push({ type: 'rocketBurst', x: f.x, y: f.y, r: f.r, col: f.col, big: true, heavy: true });
  }
}

P.Weapons2.step = function (s, dt) {
  fireSledge(s, dt);
  fireMolotov(s, dt);
  fireFireworks(s, dt);
  fireFinale(s, dt);
  updateSlams(s, dt);
  updateFlasks(s, dt);
  updatePools(s, dt);
  updateRockets(s, dt);
  updateFinale(s, dt);
};
