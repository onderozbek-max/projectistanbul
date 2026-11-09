// Heavy, fire and sky weapons (workstream E1, v0.5 mods by A): Sledgehammer (tamirci çekici), Molotov (ateş şişesi),
// Fireworks (havai fişek) and Wedding Finale (the fireworks evolution). Each fires on a timer and resolves later
// (windup, flight, fall) so the view can animate anticipation -> action -> impact. Impacts go through P.Mods.blast.
// Visuals: weapons-fx2.js (events: sledgeWindup, sledgeSlam, flaskThrow, flaskShatter, poolBurn, rocketLaunch,
// rocketBurst, finaleStart).
P.Weapons2 = {};

// Area damage around a point (knockback outward). Kept for other modules; the arsenal uses P.Mods.blast.
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

// ---------- Sledgehammer: windup -> slam (ring, stun, knockback). Signature "quake" stuns longer. ----------
function queueSlam(s, x, y, lv, left, windup, A, src) {
  P.Weapons.state(s).slams.push({ x: x, y: y, t: windup, T: windup, lv: lv, left: left, A: A, first: left === lv.slams, src: src || 'sledge' });
  s.events.push({ type: 'sledgeWindup', x: s.hero.x, y: s.hero.y, tx: x, ty: y, T: windup, n: left });
}

// The owned variant runs this code: sledge, or Demirci Vuruşu (blacksmith) which also heals per enemy hit.
function fireSledge(s, dt) {
  var h = s.hero, id = P.Weapons.variantOf(h, 'sledge'), cfg = P.CFG.weapons[id], lv = P.Weapons.level(h, id);
  if (!lv || !P.Weapons.ready(h, id, dt)) return;
  var t = P.Weapons.densest(s, cfg.range, cfg.clusterR, []);
  if (!t) return;
  var A = P.Mods.act(s, 'sledge');
  h.cds[id] = cfg.cooldown * lv.cdMult * A.cd * P.Weapons.cdMult(s, 'sledge');
  queueSlam(s, t.x, t.y, lv, lv.slams, cfg.windup, A, id);
  P.Weapons.fired(s, 'sledge', Math.atan2(t.y - h.y, t.x - h.x), lv.slams, id);
}

function impactSlam(s, sl) {
  var lv = sl.lv, cfg = P.CFG.weapons.sledge, A = sl.A, r = lv.r * A.area, stun = A.sig && A.sig.stun ? A.sig.stun : lv.stun;
  var dmg = P.Weapons.dmgFor(s, 'sledge', lv.dmg) * A.dmg, h = s.hero;
  var hits = P.Mods.blast(s, sl.x, sl.y, r, dmg, lv.kb * P.Weapons.kbMult(s), sl.src, A);
  s.enemies.forEach(function (e) {
    if (!e.dead && e.state === 'active' && Math.hypot(e.x - sl.x, e.y - sl.y) - e.r <= r) P.Status.apply(e, 'stun', stun, 1);
  });
  if (lv.heal && hits > 0) {                       // Demirci Vuruşu: a little life back for every enemy the slam hits
    var heal = Math.min(lv.healMax, hits * lv.heal);
    h.hp = Math.min(h.maxHp, h.hp + heal);
    s.events.push({ type: 'healPulse', x: h.x, y: h.y, amount: heal });
  }
  s.events.push({ type: 'sledgeSlam', x: sl.x, y: sl.y, r: r, stun: stun, hits: Math.max(0, hits), n: sl.left, heavy: true,
    tag: P.Weapons.tagOf(sl.src || 'sledge') });
  if (sl.first) P.Mods.announce(s, A, sl.x, sl.y, r);
  if (sl.left > 1) {
    var nt = P.Weapons.densest(s, cfg.range, cfg.clusterR, []) || { x: sl.x, y: sl.y };
    queueSlam(s, nt.x, nt.y, lv, sl.left - 1, cfg.slamGap, A, sl.src);
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

// ---------- Molotov: arcing bottle -> fire pool that applies Burn. Signature "lake" = a long, wide pool. ----------
// The owned variant runs this code: molotov, Ateş Gölü (lake: pools merge) or Ateş Topu (fireball: bigger, burns).
function fireMolotov(s, dt) {
  var h = s.hero, id = P.Weapons.variantOf(h, 'molotov'), cfg = P.CFG.weapons[id], lv = P.Weapons.level(h, id);
  if (!lv || !P.Weapons.ready(h, id, dt)) return;
  var M = P.Mods.of(s, 'molotov'), chosen = P.Weapons.pickClusters(s, cfg.range, cfg.clusterR, lv.bottles + M.count, cfg.flight);
  if (!chosen.length) return;
  var A = P.Mods.act(s, 'molotov');
  h.cds[id] = cfg.cooldown * lv.cdMult * A.cd * P.Weapons.cdMult(s, 'molotov');
  var list = P.Weapons.state(s).flasks;
  chosen.forEach(function (c, i) {
    list.push({ x0: h.x, y0: h.y, x1: c.x, y1: c.y, t: 0, T: cfg.flight, lv: lv, spin: s.rng.combat.range(0, 6), A: A, first: i === 0,
      src: id, cfg: cfg });
  });
  s.events.push({ type: 'flaskThrow', x: h.x, y: h.y, n: chosen.length });
  P.Weapons.fired(s, 'molotov', Math.atan2(chosen[0].y - h.y, chosen[0].x - h.x), chosen.length, id);
}

function shatter(s, f) {
  var lv = f.lv, cfg = f.cfg || P.CFG.weapons.molotov, A = f.A, sig = A.sig, isLake = lv.lakeLife !== undefined;
  var rr = cfg.clusterR * 0.8 * A.area * (lv.blastMul || 1);
  var dmg = P.Weapons.dmgFor(s, 'molotov', lv.dmg) * A.dmg * (lv.dmgMul || 1);
  P.Weapons6.terrainHit(s, 'molotov', 'fire', f.x1, f.y1);
  P.Mods.blast(s, f.x1, f.y1, rr, dmg, 0.4, f.src || 'molotov', A);
  if (lv.burn) P.Weapons6.burnAround(s, f.x1, f.y1, rr, lv.burn);
  var life = (isLake ? lv.lakeLife : lv.life) * A.M.life * (sig && sig.life ? sig.life : 1);
  P.Weapons.state(s).pools.push({ x: f.x1, y: f.y1, r: lv.r * A.area, t: life, T: life, tick: cfg.burnTick, A: A, lv: isLake ? lv : null });
  s.events.push({ type: 'flaskShatter', x: f.x1, y: f.y1, r: lv.r * A.area, life: life, spin: f.spin, lake: isLake,
    tag: P.Weapons.tagOf(f.src || 'molotov') });
  if (f.first) P.Mods.announce(s, A, f.x1, f.y1, lv.r * A.area);
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

// Fire pools re-apply Burn every burnTick while enemies stand inside (Flame Tongue adds stacks).
function updatePools(s, dt) {
  var list = P.Weapons.state(s).pools, cfg = P.CFG.weapons.molotov;
  for (var i = list.length - 1; i >= 0; i--) {
    var p = list[i];
    p.t -= dt;
    if (p.t <= 0) { list.splice(i, 1); continue; }
    p.tick -= dt;
    if (p.tick > 0) continue;
    p.tick += cfg.burnTick;
    var n = 0, extra = p.A ? p.A.M.burn : 0;
    s.enemies.forEach(function (e) {
      if (e.dead || e.state !== 'active' || Math.hypot(e.x - p.x, e.y - p.y) - e.r > p.r) return;
      P.Combat.addBurn(e); n++;
      for (var k = 0; k < extra; k++) P.Combat.addBurn(e);
    });
    if (n > 0) s.events.push({ type: 'poolBurn', x: p.x, y: p.y, n: n, tag: 'fire' });
  }
}

// ---------- Fireworks: homing rockets, colourful AoE burst ----------
function fireFireworks(s, dt) {
  var h = s.hero, cfg = P.CFG.weapons.fireworks, lv = P.Weapons.level(h, 'fireworks');
  if (!lv || !P.Weapons.ready(h, 'fireworks', dt)) return;
  var M = P.Mods.of(s, 'fireworks'), want = lv.rockets + M.count, taken = [];
  for (var k = 0; k < want; k++) {
    var t = nearestFree(s, h.x, h.y, cfg.seekRange, taken);
    if (!t) break;
    taken.push(t);
  }
  if (!taken.length) return;
  var A = P.Mods.act(s, 'fireworks'), a0 = Math.atan2(taken[0].y - h.y, taken[0].x - h.x);
  h.cds.fireworks = cfg.cooldown * lv.cdMult * A.cd * P.Weapons.cdMult(s, 'fireworks');
  if (A.sig && A.sig.extra === 'rain') {          // signature: a sky rain of rockets over the screen
    var F = P.CFG.weapons.finale.levels[0];
    P.Weapons.fired(s, 'fireworks', Math.PI / 2, A.sig.n);
    castFinale(s, A.sig.n, { spanX: F.spanX, spanY: F.spanY, r: lv.r, dmg: lv.dmg }, P.CFG.weapons.finale, A);
    return;
  }
  P.Weapons.fired(s, 'fireworks', a0, taken.length);
  var list = P.Weapons.state(s).rockets, col = s.rng.combat.int(0, 5), dmg = P.Weapons.dmgFor(s, 'fireworks', lv.dmg) * A.dmg;
  taken.forEach(function (t, j) {
    var a0 = Math.atan2(t.y - h.y, t.x - h.x) + (s.rng.combat.next() - 0.5) * 0.9;
    list.push({ x: h.x, y: h.y, a: a0, tgt: t, life: cfg.life, dmg: dmg, r: lv.r * A.area, col: (col + j) % 6, trail: [], A: A, first: j === 0 });
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
    P.Mods.blast(s, r.x, r.y, r.r, r.dmg, 0.5, 'fireworks', r.A);
    if (r.first) P.Mods.announce(s, r.A, r.x, r.y, r.r);
    s.events.push({ type: 'rocketBurst', x: r.x, y: r.y, r: r.r, col: r.col, big: false, tag: 'fire' });
  }
}

// ---------- Wedding Finale: sky barrage over the screen (fireworks evolution). Signature "rain" uses it too. ----------
function fireFinale(s, dt) {
  var h = s.hero, cfg = P.CFG.weapons.finale, lv = P.Weapons.level(h, 'finale');
  if (!lv || !P.Weapons.ready(h, 'finale', dt)) return;
  var A = P.Mods.act(s, 'fireworks');
  h.cds.finale = cfg.cooldown * A.cd * P.Weapons.cdMult(s, 'fireworks');
  var n = lv.rockets;
  if (A.sig && A.sig.extra === 'rain') n = A.sig.n;
  P.Weapons.fired(s, 'fireworks', Math.PI / 2, n, 'finale');
  castFinale(s, n, lv, cfg, A);
}

// Rockets fall over the spanX x spanY zone in front of Arda; each one bursts with the family's mods.
function castFinale(s, n, lv, cfg, A) {
  var h = s.hero, list = P.Weapons.state(s).finale, rng = s.rng.combat, dmg = P.Weapons.dmgFor(s, 'fireworks', lv.dmg) * A.dmg;
  for (var i = 0; i < n; i++) {
    list.push({ x: h.x + rng.range(-lv.spanX, lv.spanX), y: h.y + rng.range(-lv.spanY * 0.4, lv.spanY),
      t: -i * cfg.gap, T: cfg.fall, dmg: dmg, r: lv.r * A.area, col: rng.int(0, 5), A: A, first: i === 0 });
  }
  s.events.push({ type: 'finaleStart', x: h.x, y: h.y, n: n, T: cfg.fall + n * cfg.gap, spanX: lv.spanX, spanY: lv.spanY });
  P.Mods.announce(s, A, h.x, h.y, 0);
}

function updateFinale(s, dt) {
  var list = P.Weapons.state(s).finale;
  for (var i = list.length - 1; i >= 0; i--) {
    var f = list[i];
    f.t += dt;
    if (f.t < f.T) continue;
    list.splice(i, 1);
    P.Mods.blast(s, f.x, f.y, f.r, f.dmg, 0.6, 'finale', f.A);
    s.events.push({ type: 'rocketBurst', x: f.x, y: f.y, r: f.r, col: f.col, big: true, heavy: true, tag: 'fire' });
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
