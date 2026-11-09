// Arsenal core (workstream E1, v0.5 mods by A). Shared helpers, dispatch, and the four original weapons:
// Döner Knife (arc), Nail Gun / Nail Storm (auto-aim pierce), Gas Canister / Cluster Bomb (lob AoE),
// Bike Chain / Chain Cyclone (orbit). Every damage goes through P.Mods (mods, usta, signature moves).
// Evolutions replace their base in hero.weapons; P.Weapons.variantOf(h, base) returns the owned variant.
// Mods are keyed by the base family, so an evolution keeps the chosen mods.
P.Weapons = {};

// Cooldown multiplier: Energy Drink, Powerbank and meta gear, capped (GD 4.4), then frenzy/ult and mastery.
P.Weapons.cdMult = function (s, fam) {
  var h = s.hero, pb = P.CFG.passives.powerbank;
  var red = Math.min(P.CFG.caps.cdr, (h.passives.energy || 0) * P.CFG.passives.energy.cdr +
    (h.passives.powerbank || 0) * pb.cdPerLevel + (h.baseCdr || 0));
  var m = (1 - red) * P.Skills.cdScale(s);
  return fam ? m * P.Mastery.bonus(s, fam).cd : m;
};
P.Weapons.kbMult = function (s) { return 1 + (s.hero.passives.gloves || 0) * P.CFG.passives.gloves.knockbackPct; };
P.Weapons.dmg = function (s, base) { return base * P.Skills.powerMul(s); };
// Damage for a weapon family: base x ultimate power x mastery rank bonus (A.dmg is applied by the caller).
P.Weapons.dmgFor = function (s, fam, base) { return base * P.Skills.powerMul(s) * P.Mastery.bonus(s, fam).dmg; };
// Per-run weapon state for projectiles, timed effects and mod engine lists (read by the view; sim-timed).
P.Weapons.state = function (s) {
  return s.ws || (s.ws = { slams: [], flasks: [], pools: [], rockets: [], finale: [], bolts: [], spears: [], sprays: [],
    shards: [], echoes: [], sticks: [], clouds: [], chainQ: [], acts: {}, chainAct: null, chainBoostT: 0,
    trays: [], simits: [], tavla: [], embers: [], umbrellas: [], hooks: [], boils: [] });
};

// Cooldown tick: returns true when the weapon may fire this step.
P.Weapons.ready = function (h, id, dt) {
  h.cds = h.cds || {};
  var c = (h.cds[id] || 0) - dt;
  h.cds[id] = c;
  return c <= 0;
};

// Owned variant of a base family: the evolution when it has replaced the base, else the base id.
P.Weapons.variantOf = function (h, base) {
  var evo = h.evolved && h.evolved[base];
  return evo && h.weapons[evo] ? evo : base;
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

// ---------- Döner Knife (and the 360 sig spin) ----------
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
  var A = P.Mods.act(s, 'knife');
  h.cds.knife = cfg.cooldown * A.cd * P.Weapons.cdMult(s, 'knife');
  h.swingDir = (h.swingDir || 1) * -1;
  var variant = s.swings % 3;               // 0 forehand, 1 wide backhand, 2 short chop: varied arcs
  var dirs = [[ax, ay]], range = lv.range * A.area;
  if (lv.back) dirs.push([-ax, -ay]);
  if (A.sig && A.sig.extra === 'spin') dirs = [[ax, ay], [-ay, ax], [-ax, -ay], [ay, -ax]];
  var cosHalf = Math.cos(lv.arcDeg * Math.PI / 360), kb = cfg.knockback * P.Weapons.kbMult(s);
  var dmg = P.Weapons.dmgFor(s, 'knife', lv.dmg) * A.dmg;
  dirs.forEach(function (dv, k) {
    s.events.push({ type: 'swing', x: h.x, y: h.y, ax: dv[0], ay: dv[1], range: range, arcDeg: lv.arcDeg,
      dir: h.swingDir, back: k > 0, variant: variant, sig: !!A.sig });
    for (var i = 0; i < s.enemies.length; i++) {
      var e = s.enemies[i];
      if (e.dead || e.state === 'dormant') continue;
      if (inArc(h.x, h.y, dv[0], dv[1], e.x, e.y, e.r, range, cosHalf)) P.Mods.hit(s, e, dmg, dv[0], dv[1], kb, 'knife', A);
    }
    P.Combat.forEachProp(s, function (p) {
      if (inArc(h.x, h.y, dv[0], dv[1], p.x, p.y, p.r, range, cosHalf)) P.Combat.damageProp(s, p, dmg);
    });
  });
  P.Mods.announce(s, A, h.x, h.y, range);
  s.swings++;
}

// ---------- Nail volleys (Nail Gun, Nail Storm) ----------
// Nails carry their action (mods, usta, signature) so every hit resolves through P.Mods.hit.
P.Weapons.nailVolley = function (s, id, cfg, lv, target, A) {
  var h = s.hero, M = A.M, base = Math.atan2(target.y - h.y, target.x - h.x);
  var ring = !!(A.sig && A.sig.extra === 'ring'), n = ring ? A.sig.n : lv.shots + M.count;
  var spread = ring ? Math.PI * 2 : (lv.spreadDeg || cfg.spreadDeg) * Math.PI / 180;
  var fan = !!lv.fan || ring, step = fan ? (n > 1 ? spread / (n - 1) : 0) : spread;
  var kb = lv.kb !== undefined ? lv.kb : cfg.knockback, dmg = P.Weapons.dmgFor(s, 'nailgun', lv.dmg) * A.dmg;
  for (var i = 0; i < n; i++) {
    var j = fan && !ring ? (s.rng.combat.next() - 0.5) * step * 0.6 : 0;
    var a = base + (i - (n - 1) / 2) * step + j;
    s.nails.push({ x: h.x + Math.cos(a) * 0.4, y: h.y + Math.sin(a) * 0.4, vx: Math.cos(a) * cfg.speed, vy: Math.sin(a) * cfg.speed,
      t: cfg.life, dmg: dmg, pierce: lv.pierce + M.pierce, hit: {}, kb: kb, id: id, A: A });
  }
  s.events.push({ type: 'nailFire', x: h.x, y: h.y, a: base, id: id, n: n });
};

function fireNailgun(s, dt) {
  var h = s.hero, id = P.Weapons.variantOf(h, 'nailgun'), cfg = P.CFG.weapons[id], lv = P.Weapons.level(h, id);
  if (!lv || !P.Weapons.ready(h, id, dt)) return;
  var t = nearestEnemy(s, h.x, h.y, cfg.seekRange || P.CFG.weapons.nailgun.seekRange);
  if (!t) return;
  var A = P.Mods.act(s, 'nailgun');
  h.cds[id] = cfg.cooldown * (lv.cdMult || 1) * A.cd * P.Weapons.cdMult(s, 'nailgun');
  P.Weapons.nailVolley(s, id, cfg, lv, t, A);
  P.Mods.announce(s, A, h.x, h.y, 0);
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
      P.Mods.hit(s, e, n.dmg, n.vx / sp, n.vy / sp, n.kb, n.id, n.A);
      n.pierce--;
      if (n.pierce < 0) dead = true;
    }
    if (dead) s.nails.splice(i, 1);
  }
}

// ---------- Gas Canister / Cluster bomb: lobs land as area blasts (mods on the landing) ----------
P.Weapons.throwLobs = function (s, id, cfg, lv, chosen, flight, kb, A) {
  var h = s.hero;
  chosen.forEach(function (c, i) {
    s.projs.push({ id: id, x0: h.x, y0: h.y, x1: c.x, y1: c.y, t: 0, T: flight, lv: lv, kb: kb, A: A, first: i === 0,
      spin: s.rng.combat.range(0, 6) });
  });
  s.events.push({ type: 'canisterThrow', id: id, n: chosen.length, x: h.x, y: h.y });
};

function fireCanister(s, dt) {
  var h = s.hero, id = P.Weapons.variantOf(h, 'canister'), cfg = P.CFG.weapons[id], lv = P.Weapons.level(h, id);
  if (!lv || !P.Weapons.ready(h, id, dt)) return;
  var M = P.Mods.of(s, 'canister'), flight = cfg.flightTime || cfg.flight;
  var chosen = P.Weapons.pickClusters(s, cfg.seekRange || cfg.range, lv.blast, lv.proj + M.count, flight);
  if (!chosen.length) return;
  var A = P.Mods.act(s, 'canister');
  h.cds[id] = cfg.cooldown * (lv.cdMult || 1) * A.cd * P.Weapons.cdMult(s, 'canister');
  P.Weapons.throwLobs(s, id, cfg, lv, chosen, flight, cfg.knockback * P.Weapons.kbMult(s), A);
}

// Lob landing: area blast with mods, optional fire zone, optional split into secondary blasts.
function landLob(s, p) {
  var lv = p.lv, A = p.A, r = lv.blast * A.area, dmg = P.Weapons.dmgFor(s, 'canister', lv.dmg) * A.dmg;
  var hits = P.Mods.blast(s, p.x1, p.y1, r, dmg, p.kb, p.id, A, { noStick: !!p.sub });
  var stuck = hits < 0;
  if (lv.fire && !stuck) fireZone(s, p.x1, p.y1, r * 0.8);
  if (A.sig && A.sig.extra === 'ring' && p.first) for (var k = 0; k < 8; k++) fireZone(s, p.x1 + Math.cos(k * Math.PI / 4) * r * 0.7, p.y1 + Math.sin(k * Math.PI / 4) * r * 0.7, r * 0.3);
  if (p.first) P.Mods.announce(s, A, p.x1, p.y1, r);
  if (lv.subs && !stuck) P.Weapons.split(s, p);
  s.events.push({ type: 'blast', x: p.x1, y: p.y1, r: r, small: true, id: p.id, src: p.id, stuck: stuck });
}

function fireZone(s, x, y, r) {
  var C = P.CFG.weapons.canister;
  s.zones.push({ kind: 'fire', x: x, y: y, r: r, t: C.fireTime, T: C.fireTime, dps: C.fireDps });
}

// Cluster bomb: three secondary hops that burst around the landing point.
P.Weapons.split = function (s, p) {
  var lv = p.lv, sub = { blast: lv.subBlast, dmg: lv.subDmg, subs: 0, fire: false };
  s.events.push({ type: 'clusterSplit', x: p.x1, y: p.y1, n: lv.subs });
  for (var k = 0; k < lv.subs; k++) {
    var a = k * Math.PI * 2 / lv.subs + p.spin;
    s.projs.push({ id: p.id, x0: p.x1, y0: p.y1, x1: p.x1 + Math.cos(a) * P.CFG.weapons.cluster.subR,
      y1: p.y1 + Math.sin(a) * P.CFG.weapons.cluster.subR, t: 0, T: P.CFG.weapons.cluster.subDelay, lv: sub,
      kb: p.kb * 0.5, spin: a, A: p.A, sub: true });
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
// Blades sit on a ring of radius lv.radius x area; an enemy is hit when a blade overlaps it, at most once per `gap` s.
// The action (mods, usta, signature boost) is re-rolled at each full turn: W.chainAct.
P.Weapons.chainAct = function (s) {
  var W = P.Weapons.state(s);
  return W.chainAct || (W.chainAct = P.Mods.act(s, 'chain'));
};
P.Weapons.spinTurn = function (s) {
  var W = P.Weapons.state(s), A = (W.chainAct = P.Mods.act(s, 'chain'));
  if (A.sig) { W.chainBoostT = A.sig.T; }
  P.Mods.announce(s, A, s.hero.x, s.hero.y, 1.5);
  return A;
};
P.Weapons.bladeHits = function (s, lv, angle, gap, kb, src, field, A) {
  var h = s.hero, dmg = P.Weapons.dmgFor(s, 'chain', lv.dmg) * A.dmg, n = lv.blades + A.M.count, R = lv.radius * A.area;
  for (var b = 0; b < n; b++) {
    var a = angle + b * Math.PI * 2 / n, bx = h.x + Math.cos(a) * R, by = h.y + Math.sin(a) * R;
    for (var i = 0; i < s.enemies.length; i++) {
      var e = s.enemies[i];
      if (e.dead || e.state !== 'active') continue;
      if ((e.x - bx) * (e.x - bx) + (e.y - by) * (e.y - by) > (e.r + 0.45) * (e.r + 0.45)) continue;
      if (e[field] && s.t - e[field] < gap) continue;
      e[field] = s.t;
      P.Mods.hit(s, e, dmg, -Math.sin(a), Math.cos(a), kb, src, A);
    }
  }
};

function updateChain(s, dt) {
  var h = s.hero, cfg = P.CFG.weapons.chain, lv = P.Weapons.level(h, 'chain'), W = P.Weapons.state(s);
  if (!lv) return;
  W.chainBoostT = Math.max(0, (W.chainBoostT || 0) - dt);
  var M = P.Mods.of(s, 'chain'), boost = W.chainBoostT > 0 ? P.CFG.sig.chain.spin : 1;
  var prev = h.chainA || 0;
  h.chainA = prev + lv.speed * (2 - P.Weapons.cdMult(s)) * M.spin * boost * dt;
  if (Math.floor(h.chainA / (Math.PI * 2)) > Math.floor(prev / (Math.PI * 2))) P.Weapons.spinTurn(s);
  P.Weapons.bladeHits(s, lv, h.chainA, cfg.hitInterval, cfg.knockback * P.Weapons.kbMult(s), 'chain', 'chainT', P.Weapons.chainAct(s));
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
  if (P.Weapons4) P.Weapons4.step(s, dt);
  P.Mods.update(s, dt);
};

P.Weapons.onAcquire = function (s, item) { s.hero.cds = s.hero.cds || {}; s.hero.cds[item] = 0.2; };
