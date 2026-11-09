// Arsenal core (workstream E1). Shared helpers, dispatch, and the four original weapons:
// Döner Knife (arc), Nail Gun (auto-aim pierce), Gas Canister (lob AoE), Bike Chain (orbit).
// Newer weapons: weapons2.js (sledge, molotov, fireworks, finale), weapons3.js (cable, speargun,
// extinguisher, cleaver, cyclone). Evolutions remove their base weapon from hero.weapons.
P.Weapons = {};

// Cooldown multiplier: Energy Drink + meta gear (baseCdr), capped at 60% reduction (GD 4.4), then frenzy/ult.
P.Weapons.cdMult = function (s) {
  var h = s.hero, red = Math.min(P.CFG.caps.cdr, (h.passives.energy || 0) * P.CFG.passives.energy.cdr + (h.baseCdr || 0));
  return (1 - red) * P.Skills.cdScale(s);
};
P.Weapons.kbMult = function (s) { return 1 + (s.hero.passives.gloves || 0) * P.CFG.passives.gloves.knockbackPct; };
P.Weapons.dmg = function (s, base) { return base * P.Skills.powerMul(s); };
// Per-run weapon state for projectiles and timed effects (read by the view; sim-timed).
P.Weapons.state = function (s) {
  return s.ws || (s.ws = { slams: [], flasks: [], pools: [], rockets: [], finale: [], bolts: [], spears: [], sprays: [] });
};

// Cooldown tick: returns true when the weapon may fire this step.
P.Weapons.ready = function (h, id, dt) {
  h.cds = h.cds || {};
  var c = (h.cds[id] || 0) - dt;
  h.cds[id] = c;
  return c <= 0;
};

// Level entry for an owned weapon (null when not owned). Evolved weapons have one level.
P.Weapons.level = function (h, id) {
  var lvl = h.weapons[id];
  if (!lvl) return null;
  var cfg = P.CFG.weapons[id];
  return cfg.levels[Math.min(lvl, cfg.levels.length) - 1];
};

// Knockback without damage (speargun pulls, cyclone drag). Same curve as damageEnemy.
P.Weapons.shove = function (e, dx, dy, meters) {
  var T = P.CFG.knockbackTime, k = meters * (1 - e.kbResist);
  if (k <= 0) return;
  e.kbx = dx * 2 * k / T; e.kby = dy * 2 * k / T; e.kbT = T;
};

function nearestEnemy(s, x, y, maxD) {
  var best = null, bd = maxD;
  for (var i = 0; i < s.enemies.length; i++) {
    var e = s.enemies[i];
    if (e.dead || e.state !== 'active') continue;
    var d = Math.hypot(e.x - x, e.y - y) - e.r;
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}
P.Weapons.nearestEnemy = nearestEnemy;

function inArc(hx, hy, ax, ay, tx, ty, tr, range, cosHalf) {
  var dx = tx - hx, dy = ty - hy, d = Math.hypot(dx, dy);
  if (d - tr > range) return false;
  if (d < 0.05) return true;
  return (dx * ax + dy * ay) / d >= cosHalf;
}

// Best target = the enemy with the most neighbours within `blast` (ties keep the first).
function densestTarget(s, range, blast, exclude) {
  var h = s.hero, best = null, bestN = -1;
  for (var i = 0; i < s.enemies.length; i++) {
    var e = s.enemies[i];
    if (e.dead || e.state !== 'active' || Math.hypot(e.x - h.x, e.y - h.y) > range) continue;
    var skip = false;
    for (var k = 0; k < exclude.length; k++) if (Math.hypot(e.x - exclude[k].x, e.y - exclude[k].y) < blast) skip = true;
    if (skip) continue;
    var count = 0;
    for (var j = 0; j < s.enemies.length; j++) {
      var o = s.enemies[j];
      if (!o.dead && Math.abs(o.x - e.x) < blast && Math.abs(o.y - e.y) < blast) count++;
    }
    if (count > bestN) { bestN = count; best = e; }
  }
  return best;
}
P.Weapons.densest = densestTarget;

// Up to `count` lob targets (spread so clusters do not overlap). Lead point uses enemy velocity.
P.Weapons.pickClusters = function (s, range, blast, count, flight) {
  var chosen = [];
  for (var p = 0; p < count; p++) {
    var t = densestTarget(s, range, blast, chosen);
    if (!t) break;
    chosen.push({ x: t.x + t.vx * flight * 0.5, y: t.y + t.vy * flight * 0.5 });
  }
  return chosen;
};

// ---------- Döner Knife ----------
function fireKnife(s, dt) {
  var h = s.hero, cfg = P.CFG.weapons.knife, lv = P.Weapons.level(h, 'knife');
  if (!lv || !P.Weapons.ready(h, 'knife', dt)) return;
  var t = nearestEnemy(s, h.x, h.y, lv.range), tx, ty;
  if (t) { tx = t.x; ty = t.y; } else {
    var prop = P.Combat.nearestProp(s, lv.range);
    if (!prop) return;
    tx = prop.x; ty = prop.y;
  }
  var ax = tx - h.x, ay = ty - h.y, al = Math.hypot(ax, ay) || 1;
  ax /= al; ay /= al;
  h.cds.knife = cfg.cooldown * P.Weapons.cdMult(s);
  h.swingDir = (h.swingDir || 1) * -1;
  var variant = s.swings % 3;               // 0 forehand, 1 wide backhand, 2 short chop: varied arcs
  var dirs = [[ax, ay]];
  if (lv.back) dirs.push([-ax, -ay]);
  var cosHalf = Math.cos(lv.arcDeg * Math.PI / 360), kb = cfg.knockback * P.Weapons.kbMult(s), dmg = P.Weapons.dmg(s, lv.dmg);
  dirs.forEach(function (dv, k) {
    s.events.push({ type: 'swing', x: h.x, y: h.y, ax: dv[0], ay: dv[1], range: lv.range, arcDeg: lv.arcDeg,
      dir: h.swingDir, back: k > 0, variant: variant });
    for (var i = 0; i < s.enemies.length; i++) {
      var e = s.enemies[i];
      if (e.dead || e.state === 'dormant') continue;
      if (inArc(h.x, h.y, dv[0], dv[1], e.x, e.y, e.r, lv.range, cosHalf)) P.Combat.damageEnemy(s, e, dmg, dv[0], dv[1], kb, true, 'knife');
    }
    P.Combat.forEachProp(s, function (p) {
      if (inArc(h.x, h.y, dv[0], dv[1], p.x, p.y, p.r, lv.range, cosHalf)) P.Combat.damageProp(s, p, dmg);
    });
  });
  s.swings++;
}

// ---------- Nail volleys (Nail Gun, Nail Storm) ----------
P.Weapons.nailVolley = function (s, id, cfg, lv, target) {
  var h = s.hero, base = Math.atan2(target.y - h.y, target.x - h.x), n = lv.shots;
  var spread = (lv.spreadDeg || cfg.spreadDeg) * Math.PI / 180;
  var step = lv.fan ? (n > 1 ? spread / (n - 1) : 0) : spread;
  var kb = lv.kb !== undefined ? lv.kb : cfg.knockback, dmg = P.Weapons.dmg(s, lv.dmg);
  for (var i = 0; i < n; i++) {
    var j = lv.fan ? (s.rng.combat.next() - 0.5) * step * 0.6 : 0;
    var a = base + (i - (n - 1) / 2) * step + j;
    s.nails.push({ x: h.x + Math.cos(a) * 0.4, y: h.y + Math.sin(a) * 0.4, vx: Math.cos(a) * cfg.speed, vy: Math.sin(a) * cfg.speed,
      t: cfg.life, dmg: dmg, pierce: lv.pierce, hit: {}, kb: kb, id: id });
  }
  s.events.push({ type: 'nailFire', x: h.x, y: h.y, a: base, id: id, n: n });
};

function fireNailgun(s, dt) {
  var h = s.hero, cfg = P.CFG.weapons.nailgun, lv = P.Weapons.level(h, 'nailgun');
  if (!lv || !P.Weapons.ready(h, 'nailgun', dt)) return;
  var t = nearestEnemy(s, h.x, h.y, cfg.seekRange);
  if (!t) return;
  h.cds.nailgun = cfg.cooldown * lv.cdMult * P.Weapons.cdMult(s);
  P.Weapons.nailVolley(s, 'nailgun', cfg, lv, t);
}

function updateNails(s, dt) {
  for (var i = s.nails.length - 1; i >= 0; i--) {
    var n = s.nails[i];
    n.x += n.vx * dt; n.y += n.vy * dt; n.t -= dt;
    var dead = n.t <= 0 || Math.abs(n.x) > 7.2;
    for (var j = 0; j < s.enemies.length && !dead; j++) {
      var e = s.enemies[j];
      if (e.dead || e.state !== 'active' || n.hit[e.id]) continue;
      var dx = e.x - n.x, dy = e.y - n.y;
      if (dx * dx + dy * dy > (e.r + 0.12) * (e.r + 0.12)) continue;
      n.hit[e.id] = true;
      var sp = Math.hypot(n.vx, n.vy);
      P.Combat.damageEnemy(s, e, n.dmg, n.vx / sp, n.vy / sp, n.kb, true, n.id);
      n.pierce--;
      if (n.pierce < 0) dead = true;
    }
    if (dead) s.nails.splice(i, 1);
  }
}

// ---------- Gas Canister and lob helpers (Cluster reuses these) ----------
P.Weapons.throwLobs = function (s, id, cfg, lv, chosen, flight, kb) {
  var h = s.hero;
  chosen.forEach(function (c) {
    s.projs.push({ id: id, x0: h.x, y0: h.y, x1: c.x, y1: c.y, t: 0, T: flight, lv: lv, kb: kb, spin: s.rng.combat.range(0, 6) });
  });
  s.events.push({ type: 'canisterThrow', id: id, n: chosen.length, x: h.x, y: h.y });
};

function fireCanister(s, dt) {
  var h = s.hero, cfg = P.CFG.weapons.canister, lv = P.Weapons.level(h, 'canister');
  if (!lv || !P.Weapons.ready(h, 'canister', dt)) return;
  var chosen = P.Weapons.pickClusters(s, cfg.seekRange, lv.blast, lv.proj, cfg.flightTime);
  if (!chosen.length) return;
  h.cds.canister = cfg.cooldown * P.Weapons.cdMult(s);
  P.Weapons.throwLobs(s, 'canister', cfg, lv, chosen, cfg.flightTime, cfg.knockback * P.Weapons.kbMult(s));
}

// Lob landing: blast damage, optional fire zone, optional split into secondary blasts.
function landLob(s, p) {
  var lv = p.lv, dmg = P.Weapons.dmg(s, lv.dmg);
  for (var j = 0; j < s.enemies.length; j++) {
    var e = s.enemies[j], dx = e.x - p.x1, dy = e.y - p.y1, d = Math.hypot(dx, dy);
    if (d - e.r > lv.blast) continue;
    P.Combat.damageEnemy(s, e, dmg, dx / (d || 1), dy / (d || 1), p.kb, true, p.id);
  }
  P.Combat.forEachProp(s, function (pr) {
    if (Math.hypot(pr.x - p.x1, pr.y - p.y1) - pr.r <= lv.blast) P.Combat.damageProp(s, pr, dmg);
  });
  if (lv.fire) s.zones.push({ kind: 'fire', x: p.x1, y: p.y1, r: lv.blast * 0.8, t: P.CFG.weapons.canister.fireTime, T: P.CFG.weapons.canister.fireTime, dps: P.CFG.weapons.canister.fireDps });
  if (lv.subs) P.Weapons.split(s, p);
  s.events.push({ type: 'blast', x: p.x1, y: p.y1, r: lv.blast, small: true, id: p.id, src: p.id });
}

// Cluster bomb: three secondary hops that burst around the landing point.
P.Weapons.split = function (s, p) {
  var lv = p.lv, sub = { blast: lv.subBlast, dmg: lv.subDmg, subs: 0, fire: false };
  s.events.push({ type: 'clusterSplit', x: p.x1, y: p.y1, n: lv.subs });
  for (var k = 0; k < lv.subs; k++) {
    var a = k * Math.PI * 2 / lv.subs + p.spin;
    s.projs.push({ id: p.id, x0: p.x1, y0: p.y1, x1: p.x1 + Math.cos(a) * P.CFG.weapons.cluster.subR,
      y1: p.y1 + Math.sin(a) * P.CFG.weapons.cluster.subR, t: 0, T: P.CFG.weapons.cluster.subDelay, lv: sub, kb: p.kb * 0.5, spin: a });
  }
};

function updateLobs(s, dt) {
  for (var i = s.projs.length - 1; i >= 0; i--) {
    var p = s.projs[i];
    p.t += dt;
    if (p.t < p.T) continue;
    s.projs.splice(i, 1);
    landLob(s, p);
  }
}

// ---------- Bike Chain (and Cyclone via bladeHits) ----------
// Blades sit on a ring of `lv.radius`; an enemy is hit when a blade overlaps it, at most once per `gap` s.
P.Weapons.bladeHits = function (s, lv, angle, gap, kb, src, field) {
  var h = s.hero, dmg = P.Weapons.dmg(s, lv.dmg);
  for (var b = 0; b < lv.blades; b++) {
    var a = angle + b * Math.PI * 2 / lv.blades, bx = h.x + Math.cos(a) * lv.radius, by = h.y + Math.sin(a) * lv.radius;
    for (var i = 0; i < s.enemies.length; i++) {
      var e = s.enemies[i];
      if (e.dead || e.state !== 'active') continue;
      if ((e.x - bx) * (e.x - bx) + (e.y - by) * (e.y - by) > (e.r + 0.45) * (e.r + 0.45)) continue;
      if (e[field] && s.t - e[field] < gap) continue;
      e[field] = s.t;
      P.Combat.damageEnemy(s, e, dmg, -Math.sin(a), Math.cos(a), kb, true, src);
    }
  }
};

function updateChain(s, dt) {
  var h = s.hero, cfg = P.CFG.weapons.chain, lv = P.Weapons.level(h, 'chain');
  if (!lv) return;
  h.chainA = (h.chainA || 0) + lv.speed * (2 - P.Weapons.cdMult(s)) * dt;
  P.Weapons.bladeHits(s, lv, h.chainA, cfg.hitInterval, cfg.knockback * P.Weapons.kbMult(s), 'chain', 'chainT');
}

P.Weapons.step = function (s, dt) {
  fireKnife(s, dt);
  fireNailgun(s, dt);
  fireCanister(s, dt);
  updateChain(s, dt);
  updateNails(s, dt);
  updateLobs(s, dt);
  P.Weapons2.step(s, dt);
  P.Weapons3.step(s, dt);
};

P.Weapons.onAcquire = function (s, item) { s.hero.cds = s.hero.cds || {}; s.hero.cds[item] = 0.2; };
