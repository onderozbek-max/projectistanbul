// Level 1 weapons (v0.2 kit): Döner Knife (arc), Nail Gun (auto-aim pierce), Gas Canister (lob AoE),
// Bike Chain (orbit). Passive hooks: gloves (might, knockback), energy (cooldown).
P.Weapons = {};

P.Weapons.cdMult = function (s) { return 1 - (s.hero.passives.energy || 0) * P.CFG.passives.energy.cdr; };
P.Weapons.kbMult = function (s) { return 1 + (s.hero.passives.gloves || 0) * P.CFG.passives.gloves.knockbackPct; };

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

// ---------- Döner Knife ----------
function fireKnife(s, dt) {
  var h = s.hero, cfg = P.CFG.weapons.knife, lv = cfg.levels[h.weapons.knife - 1];
  h.cds.knife -= dt;
  if (h.cds.knife > 0) return;
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
  var dirs = [[ax, ay]];
  if (lv.back) dirs.push([-ax, -ay]);
  var cosHalf = Math.cos(lv.arcDeg * Math.PI / 360), kb = cfg.knockback * P.Weapons.kbMult(s);
  dirs.forEach(function (dv, k) {
    s.events.push({ type: 'swing', x: h.x, y: h.y, ax: dv[0], ay: dv[1], range: lv.range, arcDeg: lv.arcDeg, dir: h.swingDir, back: k > 0 });
    for (var i = 0; i < s.enemies.length; i++) {
      var e = s.enemies[i];
      if (e.dead || e.state === 'dormant') continue;
      if (inArc(h.x, h.y, dv[0], dv[1], e.x, e.y, e.r, lv.range, cosHalf)) P.Combat.damageEnemy(s, e, lv.dmg, dv[0], dv[1], kb, true, 'knife');
    }
    P.Combat.forEachProp(s, function (p) {
      if (inArc(h.x, h.y, dv[0], dv[1], p.x, p.y, p.r, lv.range, cosHalf)) P.Combat.damageProp(s, p, lv.dmg);
    });
  });
  s.swings++;
}

// ---------- Nail Gun ----------
function fireNailgun(s, dt) {
  var h = s.hero, cfg = P.CFG.weapons.nailgun, lvl = h.weapons.nailgun;
  if (!lvl) return;
  var lv = cfg.levels[lvl - 1];
  h.cds.nailgun -= dt;
  if (h.cds.nailgun > 0) return;
  var t = nearestEnemy(s, h.x, h.y, cfg.seekRange);
  if (!t) return;
  h.cds.nailgun = cfg.cooldown * lv.cdMult * P.Weapons.cdMult(s);
  var base = Math.atan2(t.y - h.y, t.x - h.x), spread = cfg.spreadDeg * Math.PI / 180;
  for (var i = 0; i < lv.shots; i++) {
    var a = base + (i - (lv.shots - 1) / 2) * spread;
    s.nails.push({ x: h.x + Math.cos(a) * 0.4, y: h.y + Math.sin(a) * 0.4, vx: Math.cos(a) * cfg.speed, vy: Math.sin(a) * cfg.speed,
                   t: cfg.life, dmg: lv.dmg, pierce: lv.pierce, hit: {} });
  }
  s.events.push({ type: 'nailFire', x: h.x, y: h.y, a: base });
}

function updateNails(s, dt) {
  var cfg = P.CFG.weapons.nailgun, kb = cfg.knockback * P.Weapons.kbMult(s);
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
      P.Combat.damageEnemy(s, e, n.dmg, n.vx / sp, n.vy / sp, kb, true, 'nailgun');
      n.pierce--;
      if (n.pierce < 0) dead = true;
    }
    if (dead) s.nails.splice(i, 1);
  }
}

// ---------- Gas Canister ----------
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

function fireCanister(s, dt) {
  var h = s.hero, cfg = P.CFG.weapons.canister, lvl = h.weapons.canister;
  if (!lvl) return;
  var lv = cfg.levels[lvl - 1];
  h.cds.canister -= dt;
  if (h.cds.canister > 0) return;
  var chosen = [];
  for (var p = 0; p < lv.proj; p++) {
    var t = densestTarget(s, cfg.seekRange, lv.blast, chosen);
    if (!t) break;
    chosen.push({ x: t.x + t.vx * cfg.flightTime * 0.5, y: t.y + t.vy * cfg.flightTime * 0.5 });
  }
  if (!chosen.length) return;
  h.cds.canister = cfg.cooldown * P.Weapons.cdMult(s);
  chosen.forEach(function (c) { s.projs.push({ x0: h.x, y0: h.y, x1: c.x, y1: c.y, t: 0, T: cfg.flightTime, lv: lv, spin: Math.random() * 6 }); });
  s.events.push({ type: 'canisterThrow' });
}

function updateLobs(s, dt) {
  var cfg = P.CFG.weapons.canister, kb = cfg.knockback * P.Weapons.kbMult(s);
  for (var i = s.projs.length - 1; i >= 0; i--) {
    var p = s.projs[i];
    p.t += dt;
    if (p.t < p.T) continue;
    s.projs.splice(i, 1);
    var lv = p.lv;
    for (var j = 0; j < s.enemies.length; j++) {
      var e = s.enemies[j], dx = e.x - p.x1, dy = e.y - p.y1, d = Math.hypot(dx, dy);
      if (d - e.r > lv.blast) continue;
      P.Combat.damageEnemy(s, e, lv.dmg, dx / (d || 1), dy / (d || 1), kb, true, 'canister');
    }
    P.Combat.forEachProp(s, function (pr) {
      if (Math.hypot(pr.x - p.x1, pr.y - p.y1) - pr.r <= lv.blast) P.Combat.damageProp(s, pr, lv.dmg);
    });
    if (lv.fire) s.zones.push({ kind: 'fire', x: p.x1, y: p.y1, r: lv.blast * 0.8, t: cfg.fireTime, T: cfg.fireTime, dps: cfg.fireDps });
    s.events.push({ type: 'blast', x: p.x1, y: p.y1, r: lv.blast, small: true });
  }
}

// ---------- Bike Chain ----------
function updateChain(s, dt) {
  var h = s.hero, cfg = P.CFG.weapons.chain, lvl = h.weapons.chain;
  if (!lvl) return;
  var lv = cfg.levels[lvl - 1], kb = cfg.knockback * P.Weapons.kbMult(s);
  h.chainA = (h.chainA || 0) + lv.speed * (2 - P.Weapons.cdMult(s)) * dt;
  for (var b = 0; b < lv.blades; b++) {
    var a = h.chainA + b * Math.PI * 2 / lv.blades, bx = h.x + Math.cos(a) * lv.radius, by = h.y + Math.sin(a) * lv.radius;
    for (var i = 0; i < s.enemies.length; i++) {
      var e = s.enemies[i];
      if (e.dead || e.state !== 'active') continue;
      if ((e.x - bx) * (e.x - bx) + (e.y - by) * (e.y - by) > (e.r + 0.45) * (e.r + 0.45)) continue;
      if (e.chainT && s.t - e.chainT < cfg.hitInterval) continue;
      e.chainT = s.t;
      P.Combat.damageEnemy(s, e, lv.dmg, -Math.sin(a), Math.cos(a), kb, true, 'chain');
    }
  }
}

P.Weapons.step = function (s, dt) {
  fireKnife(s, dt);
  fireNailgun(s, dt);
  fireCanister(s, dt);
  updateChain(s, dt);
  updateNails(s, dt);
  updateLobs(s, dt);
};

P.Weapons.onAcquire = function (s, item) {
  if (s.hero.cds[item] !== undefined) s.hero.cds[item] = 0.2;
};
