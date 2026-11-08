// Enemies, weapons, damage, drops, props (GD 4-5, CC 2-5, DS 7). Emits events into s.events.
P.Combat = {};

P.Combat.spawnEnemy = function (s, type, x, y, opts) {
  var d = P.CFG.enemies[type], scale = 1 + P.CFG.hpScalePerMinute * (s.runT / 60);
  var hp = d.hp * (type === 'diner' ? 1 : scale);
  var e = {
    id: s.nextId++, type: type, x: x, y: y, r: d.radius, hp: hp, maxHp: hp, speed: d.speed,
    contact: d.contact, xp: d.xp, kbResist: d.kbResist, kbx: 0, kby: 0, kbT: 0, flash: 0,
    contactCd: 0, state: (opts && opts.state) || 'active', stateT: (opts && opts.stateT) || 0,
    burn: [], dotTick: 0, dotAcc: 0, dead: false, door: opts && opts.door,
  };
  s.enemies.push(e);
  s.peakAlive = Math.max(s.peakAlive, s.enemies.length);
  return e;
};

P.Combat.might = function (s) { return (s.hero.passives.butter || 0) * P.CFG.passives.butter.might; };

P.Combat.damageEnemy = function (s, e, base, dirx, diry, kb, canCrit) {
  if (e.dead || e.state === 'dormant') return;
  var crit = canCrit && s.rng.combat.chance(P.CFG.hero.critChance);
  var dmg = base * (1 + P.Combat.might(s)) * (crit ? P.CFG.hero.critMult : 1);
  e.hp -= dmg;
  e.flash = P.CFG.feel.hitFlash;
  if (kb > 0) {
    var k = kb * (1 - e.kbResist), T = P.CFG.knockbackTime;
    e.kbx = dirx * 2 * k / T; e.kby = diry * 2 * k / T; e.kbT = T;
  }
  s.events.push({ type: 'hit', id: e.id, x: e.x, y: e.y, dmg: dmg, crit: crit });
  if (e.hp <= 0) P.Combat.killEnemy(s, e, crit);
};

P.Combat.killEnemy = function (s, e, crit) {
  e.dead = true;
  s.kills++;
  s.events.push({ type: 'kill', id: e.id, enemy: e.type, x: e.x, y: e.y, crit: crit });
  var a = s.rng.loot.range(0, Math.PI * 2);
  s.drops.push({ kind: 'xp', value: e.xp, x: e.x + Math.cos(a) * 0.3, y: e.y + Math.sin(a) * 0.3, mag: false, pop: 0.25 });
  var dr = P.CFG.drops;
  if (s.rng.loot.chance(dr.jetonChance)) s.drops.push({ kind: 'jeton', value: s.rng.loot.int(dr.jetonMin, dr.jetonMax), x: e.x - 0.2, y: e.y, mag: false, pop: 0.25 });
  if (s.rng.loot.chance(dr.simitChance)) s.drops.push({ kind: 'simit', value: dr.simitHeal, x: e.x + 0.2, y: e.y, mag: false, pop: 0.25 });
  if (crit) s.events.push({ type: 'critKill' });
};

P.Combat.updateEnemies = function (s, dt) {
  var h = s.hero, sep = P.CFG.separation, list = s.enemies, n = list.length;
  for (var i = 0; i < n; i++) {
    var e = list[i];
    e.flash = Math.max(0, e.flash - dt);
    e.contactCd = Math.max(0, e.contactCd - dt);
    if (e.state !== 'active') {
      if (e.state === 'dormant') continue;
      e.stateT -= dt;
      if (e.stateT <= 0) { e.state = 'active'; s.events.push({ type: 'enemyActive', id: e.id, enemy: e.type }); }
      continue;
    }
    var dx = h.x - e.x, dy = h.y - e.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    var vx = dx / d * e.speed, vy = dy / d * e.speed, sx = 0, sy = 0, found = 0;
    for (var j = 0; j < n && found < sep.maxNeighbors; j++) {
      if (j === i) continue;
      var o = list[j], ox = e.x - o.x, oy = e.y - o.y, rr = e.r + o.r, d2 = ox * ox + oy * oy;
      if (d2 >= rr * rr || o.state === 'dormant') continue;
      var od = Math.sqrt(d2) || 0.01;
      sx += ox / od * (1 - od / rr); sy += oy / od * (1 - od / rr); found++;
    }
    vx += sx * sep.strength; vy += sy * sep.strength;
    if (e.kbT > 0) {
      var f = e.kbT / P.CFG.knockbackTime;
      vx += e.kbx * f; vy += e.kby * f; e.kbT -= dt;
    }
    e.x += vx * dt; e.y += vy * dt;
    P.World.clampWalk(e, e.r, s.props);
  }
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

function inArc(hx, hy, ax, ay, tx, ty, tr, range, cosHalf) {
  var dx = tx - hx, dy = ty - hy, d = Math.hypot(dx, dy);
  if (d - tr > range) return false;
  if (d < 0.05) return true;
  return (dx * ax + dy * ay) / d >= cosHalf;
}

P.Combat.fireFork = function (s, dt) {
  var h = s.hero, cfg = P.CFG.weapons.fork, lv = cfg.levels[h.weapons.fork - 1];
  h.cds.fork -= dt;
  if (h.cds.fork > 0) return;
  var target = nearestEnemy(s, h.x, h.y, lv.range), tx, ty;
  if (target) { tx = target.x; ty = target.y; } else {
    var prop = P.Combat.nearestProp(s, lv.range);
    if (!prop) return;
    tx = prop.x; ty = prop.y;
  }
  var ax = tx - h.x, ay = ty - h.y, al = Math.hypot(ax, ay) || 1;
  ax /= al; ay /= al;
  h.cds.fork = cfg.cooldown;
  var dirs = [[ax, ay]];
  if (lv.back) dirs.push([-ax, -ay]);
  var cosHalf = Math.cos(lv.arcDeg * Math.PI / 360);
  dirs.forEach(function (dv) {
    s.events.push({ type: 'swing', x: h.x, y: h.y, ax: dv[0], ay: dv[1], range: lv.range, arcDeg: lv.arcDeg });
    for (var i = 0; i < s.enemies.length; i++) {
      var e = s.enemies[i];
      if (e.dead || e.state === 'dormant') continue;
      if (inArc(h.x, h.y, dv[0], dv[1], e.x, e.y, e.r, lv.range, cosHalf)) {
        P.Combat.damageEnemy(s, e, lv.dmg, dv[0], dv[1], cfg.knockback, true);
      }
    }
    P.Combat.forEachProp(s, function (p) {
      if (inArc(h.x, h.y, dv[0], dv[1], p.x, p.y, p.r, lv.range, cosHalf)) P.Combat.damageProp(s, p, lv.dmg);
    });
  });
};

function densestTarget(s, range, splash, exclude) {
  var h = s.hero, best = null, bestN = -1;
  for (var i = 0; i < s.enemies.length; i++) {
    var e = s.enemies[i];
    if (e.dead || e.state !== 'active' || Math.hypot(e.x - h.x, e.y - h.y) > range) continue;
    var skip = false;
    for (var k = 0; k < exclude.length; k++) if (Math.hypot(e.x - exclude[k].x, e.y - exclude[k].y) < splash) skip = true;
    if (skip) continue;
    var count = 0;
    for (var j = 0; j < s.enemies.length; j++) {
      var o = s.enemies[j];
      if (!o.dead && Math.hypot(o.x - e.x, o.y - e.y) < splash) count++;
    }
    if (count > bestN) { bestN = count; best = e; }
  }
  return best;
}

P.Combat.fireTea = function (s, dt) {
  var h = s.hero, cfg = P.CFG.weapons.tea, lvl = h.weapons.tea;
  if (!lvl) return;
  var lv = cfg.levels[lvl - 1];
  h.cds.tea -= dt;
  if (h.cds.tea > 0) return;
  var chosen = [];
  for (var p = 0; p < lv.proj; p++) {
    var t = densestTarget(s, cfg.seekRange, lv.splash, chosen);
    if (!t) break;
    chosen.push({ x: t.x, y: t.y });
  }
  if (!chosen.length) return;
  h.cds.tea = cfg.cooldown;
  chosen.forEach(function (c) {
    s.projs.push({ x0: h.x, y0: h.y, x1: c.x, y1: c.y, t: 0, T: cfg.flightTime, lv: lv });
  });
  s.events.push({ type: 'teaThrow' });
};

P.Combat.updateProjectiles = function (s, dt) {
  var cfg = P.CFG.weapons.tea;
  for (var i = s.projs.length - 1; i >= 0; i--) {
    var p = s.projs[i];
    p.t += dt;
    if (p.t < p.T) continue;
    s.projs.splice(i, 1);
    var lv = p.lv;
    for (var j = 0; j < s.enemies.length; j++) {
      var e = s.enemies[j];
      var dx = e.x - p.x1, dy = e.y - p.y1, d = Math.hypot(dx, dy);
      if (d - e.r > lv.splash) continue;
      P.Combat.damageEnemy(s, e, lv.dmg, dx / (d || 1), dy / (d || 1), cfg.knockback, true);
      if (lv.scald) P.Combat.addBurn(e);
    }
    P.Combat.forEachProp(s, function (pr) {
      if (Math.hypot(pr.x - p.x1, pr.y - p.y1) - pr.r <= lv.splash) P.Combat.damageProp(s, pr, lv.dmg);
    });
    if (lv.scald) s.zones.push({ kind: 'scald', x: p.x1, y: p.y1, r: lv.splash, t: cfg.scaldTime, T: cfg.scaldTime, hit: {} });
    s.events.push({ type: 'teaLand', x: p.x1, y: p.y1, r: lv.splash });
  }
};

P.Combat.addBurn = function (e) {
  var b = P.CFG.burn;
  if (e.burn.length < b.maxStacks) e.burn.push(b.duration);
  else e.burn[0] = b.duration;
};

P.Combat.updateBurnAndZones = function (s, dt) {
  var b = P.CFG.burn, i, e;
  for (i = 0; i < s.enemies.length; i++) {
    e = s.enemies[i];
    if (!e.burn.length) continue;
    e.dotAcc += e.burn.length * b.dps * dt;
    e.burn = e.burn.map(function (t) { return t - dt; }).filter(function (t) { return t > 0; });
  }
  for (var z = s.zones.length - 1; z >= 0; z--) {
    var zone = s.zones[z];
    zone.t -= dt;
    for (i = 0; i < s.enemies.length; i++) {
      e = s.enemies[i];
      if (e.dead || Math.hypot(e.x - zone.x, e.y - zone.y) > zone.r + e.r) continue;
      if (zone.kind === 'scald' && !zone.hit[e.id]) { zone.hit[e.id] = true; P.Combat.addBurn(e); }
      if (zone.kind === 'fire') e.dotAcc += zone.dps * dt;
    }
    if (zone.t <= 0) s.zones.splice(z, 1);
  }
  for (i = 0; i < s.enemies.length; i++) {
    e = s.enemies[i];
    e.dotTick += dt;
    if (e.dotTick < 0.5) continue;
    e.dotTick = 0;
    if (e.dotAcc > 0 && !e.dead) { var a = e.dotAcc; e.dotAcc = 0; P.Combat.damageEnemy(s, e, a, 0, 0, 0, false); }
  }
};

P.Combat.forEachProp = function (s, fn) {
  s.props.carts.forEach(function (c) { if (c.alive) fn(c); });
  s.props.canisters.forEach(function (c) { if (c.alive) fn(c); });
};

P.Combat.nearestProp = function (s, range) {
  var h = s.hero, best = null, bd = range;
  P.Combat.forEachProp(s, function (p) {
    var d = Math.hypot(p.x - h.x, p.y - h.y) - p.r;
    if (d < bd) { bd = d; best = p; }
  });
  return best;
};

P.Combat.damageProp = function (s, p, dmg) {
  if (!p.alive) return;
  p.hp -= dmg; p.flash = P.CFG.feel.hitFlash;
  if (p.hp > 0) return;
  p.alive = false;
  var pc = P.CFG.props;
  if (p.kind === 'simit') {
    for (var i = 0; i < pc.simitDrops; i++) s.drops.push({ kind: 'simit', value: P.CFG.drops.simitHeal, x: p.x - 0.4 + i * 0.8, y: p.y - 0.6, mag: false, pop: 0.25 });
    s.events.push({ type: 'propBreak', kind: 'simit', x: p.x, y: p.y });
  } else if (p.kind === 'chestnut') {
    var cb = pc.chestnutBurn;
    s.zones.push({ kind: 'fire', x: p.x, y: p.y, r: cb.radius, t: cb.time, T: cb.time, dps: cb.dps });
    s.events.push({ type: 'propBreak', kind: 'chestnut', x: p.x, y: p.y });
  } else {
    P.Combat.explodeCanister(s, p);
  }
};

P.Combat.explodeCanister = function (s, c) {
  var k = P.CFG.props.canister, h = s.hero;
  s.events.push({ type: 'explode', x: c.x, y: c.y, r: k.blast, trauma: k.trauma });
  for (var i = 0; i < s.enemies.length; i++) {
    var e = s.enemies[i];
    var dx = e.x - c.x, dy = e.y - c.y, d = Math.hypot(dx, dy);
    if (d - e.r <= k.blast) P.Combat.damageEnemy(s, e, k.enemyDmg / (1 + P.Combat.might(s)), dx / (d || 1), dy / (d || 1), 1.0, false);
  }
  if (Math.hypot(h.x - c.x, h.y - c.y) - P.CFG.hero.radius <= k.blast) P.Combat.damageHero(s, k.playerDmg, 'canister');
  s.props.canisters.forEach(function (o) {
    if (o.alive && Math.hypot(o.x - c.x, o.y - c.y) <= k.blast) P.Combat.damageProp(s, o, k.enemyDmg);
  });
};

P.Combat.damageHero = function (s, raw, cause) {
  var h = s.hero, hc = P.CFG.hero;
  if (h.invuln > 0 || s.mode !== 'play') return;
  var dmg = Math.max(1, raw);
  h.hp -= dmg;
  if (dmg >= hc.iframeHitFrac * h.maxHp) h.invuln = hc.iframeTime;
  s.events.push({ type: 'heroHit', dmg: dmg, cause: cause, hp: Math.max(0, h.hp) });
  if (h.hp <= 0) {
    h.hp = 0; s.mode = 'dead'; s.deathCause = cause;
    s.events.push({ type: 'death', cause: cause });
  }
};

P.Combat.contact = function (s) {
  var h = s.hero, hr = P.CFG.hero.radius;
  for (var i = 0; i < s.enemies.length; i++) {
    var e = s.enemies[i];
    if (e.dead || e.state !== 'active' || e.contactCd > 0) continue;
    var rr = e.r + hr;
    if ((e.x - h.x) * (e.x - h.x) + (e.y - h.y) * (e.y - h.y) > rr * rr) continue;
    e.contactCd = P.CFG.contactInterval;
    P.Combat.damageHero(s, e.contact, e.type);
  }
};

P.Combat.removeDead = function (s) {
  if (s.enemies.some(function (e) { return e.dead; })) s.enemies = s.enemies.filter(function (e) { return !e.dead; });
};

P.Combat.updateDrops = function (s, dt) {
  var h = s.hero, xc = P.CFG.xp, pr = h.pickupRadius;
  for (var i = s.drops.length - 1; i >= 0; i--) {
    var d = s.drops[i];
    if (d.pop > 0) { d.pop -= dt; continue; }
    var dx = h.x - d.x, dy = h.y - d.y, dist = Math.hypot(dx, dy);
    if (!d.mag && dist < pr) d.mag = true;
    if (d.mag) {
      var step = Math.min(dist, (xc.magnetSpeed + P.Hero.speed(s)) * dt);
      d.x += dx / (dist || 1) * step; d.y += dy / (dist || 1) * step;
      dist -= step;
    }
    if (dist > xc.collectDist) continue;
    s.drops.splice(i, 1);
    if (d.kind === 'xp') { s.xpPicked++; P.Progression.addXp(s, d.value); }
    else if (d.kind === 'jeton') s.jeton += d.value;
    else h.hp = Math.min(h.maxHp, h.hp + d.value);
    s.events.push({ type: 'pickup', kind: d.kind, value: d.value });
  }
};
