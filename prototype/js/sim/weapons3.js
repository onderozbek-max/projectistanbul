// Shock, pull and evolution weapons (workstream E1, v0.5 mods by A): Live Cable (chain lightning), Speargun
// (pierce + pin + pull), Fire Extinguisher (cone foam: slow + push, douses fire), and the two melee evolutions
// Usta's Cleaver (360 spinning cleave, knife mods) and Chain Cyclone (wide chain that drags enemies in, chain mods).
// Hits resolve through P.Mods.hit with the action of the family. Visuals: weapons-fx3.js.
P.Weapons3 = {};

function segDist(px, py, ax, ay, bx, by) {
  var dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  var t = l2 > 0 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)) : 0;
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}
P.Weapons3.segDist = segDist;

// ---------- Live Cable: chain lightning, jumps to the nearest unhit enemy. Signature "storm" = long reach. ----------
function fireCable(s, dt) {
  var h = s.hero, cfg = P.CFG.weapons.cable, lv = P.Weapons.level(h, 'cable');
  if (!lv || !P.Weapons.ready(h, 'cable', dt)) return;
  var M = P.Mods.of(s, 'cable'), reach = cfg.range * M.range;
  var first = P.Weapons.nearestEnemy(s, h.x, h.y, reach);
  if (!first) return;
  var A = P.Mods.act(s, 'cable'), sig = A.sig;
  h.cds.cable = cfg.cooldown * lv.cdMult * A.cd * P.Weapons.cdMult(s, 'cable');
  var dmg = P.Weapons.dmgFor(s, 'cable', lv.dmg) * A.dmg, taken = [], cur = { x: h.x, y: h.y }, target = first;
  var jumps = sig ? sig.jumps : lv.jumps + M.count, jumpR = sig ? sig.range : cfg.jumpR * M.range;
  for (var j = 0; j < jumps && target; j++) {
    taken.push(target);
    var dx = target.x - cur.x, dy = target.y - cur.y, d = Math.hypot(dx, dy) || 1;
    P.Weapons.state(s).bolts.push({ x0: cur.x, y0: cur.y, x1: target.x, y1: target.y, t: 0, T: cfg.boltLife, seed: s.rng.combat.range(0, 1000) });
    s.events.push({ type: 'cableArc', x0: cur.x, y0: cur.y, x1: target.x, y1: target.y, n: j });
    P.Mods.hit(s, target, dmg, dx / d, dy / d, 0.2 * P.Weapons.kbMult(s), 'cable', A);
    if (!target.dead) P.Status.apply(target, 'stun', lv.stun, 1);
    cur = target;
    target = P.Weapons2.nearestFree(s, cur.x, cur.y, jumpR, taken);
  }
  s.events.push({ type: 'cableZap', x: h.x, y: h.y, n: taken.length });
  P.Mods.announce(s, A, h.x, h.y, reach);
}

// ---------- Speargun: a harpoon that flies along a line, pierces, pins the last, pulls the rest ----------
// Twin spear (count) fans two; signature "triple" fires three. Each spear carries its action.
function fireSpear(s, dt) {
  var h = s.hero, cfg = P.CFG.weapons.speargun, lv = P.Weapons.level(h, 'speargun');
  if (!lv || !P.Weapons.ready(h, 'speargun', dt)) return;
  var t = P.Weapons.nearestEnemy(s, h.x, h.y, cfg.range);
  if (!t) return;
  var A = P.Mods.act(s, 'speargun'), M = A.M;
  h.cds.speargun = cfg.cooldown * lv.cdMult * A.cd * P.Weapons.cdMult(s, 'speargun');
  var a0 = Math.atan2(t.y - h.y, t.x - h.x), n = A.sig ? 3 : 1 + M.count, spread = A.sig ? 0.2 : 0.14;
  for (var k = 0; k < n; k++) {
    var a = a0 + (k - (n - 1) / 2) * spread;
    P.Weapons.state(s).spears.push({ px: h.x, py: h.y, x: h.x, y: h.y, dx: Math.cos(a), dy: Math.sin(a), a: a, dist: 0,
      lv: lv, left: lv.pierce + M.pierce, hits: [], last: null, phase: 'fly', t: 0, T: 0.6, A: A,
      dmg: P.Weapons.dmgFor(s, 'speargun', lv.dmg) * A.dmg, root: lv.root + M.root, primary: k === 0 });
  }
  s.events.push({ type: 'spearFire', x: h.x, y: h.y, a: a0 });
  P.Mods.announce(s, A, h.x, h.y, cfg.range);
}

function spearHitCheck(s, sp) {
  var cfg = P.CFG.weapons.speargun;
  for (var i = 0; i < s.enemies.length && sp.left > 0; i++) {
    var e = s.enemies[i];
    if (e.dead || e.state !== 'active' || sp.hits.indexOf(e) >= 0) continue;
    if (segDist(e.x, e.y, sp.px, sp.py, sp.x, sp.y) > e.r + cfg.hitR) continue;
    sp.hits.push(e); sp.last = e; sp.left--;
    P.Mods.hit(s, e, sp.dmg, sp.dx, sp.dy, 0.2, 'speargun', sp.A);
    s.events.push({ type: 'spearHit', x: e.x, y: e.y, n: sp.hits.length });
  }
}

function stickSpear(s, sp) {
  var cfg = P.CFG.weapons.speargun, h = s.hero;
  sp.phase = 'stuck'; sp.t = 0; sp.T = sp.root + 0.4;
  sp.hits.forEach(function (e) {
    if (e !== sp.last && !e.dead) P.Weapons.shove(e, (h.x - e.x) / (Math.hypot(h.x - e.x, h.y - e.y) || 1), (h.y - e.y) / (Math.hypot(h.x - e.x, h.y - e.y) || 1), cfg.pullM);
  });
  if (!sp.last || sp.last.dead || !sp.primary) return;
  var pin = sp.last;
  P.Status.apply(pin, 'root', sp.root, 1);
  s.enemies.forEach(function (o) {
    if (o === pin || o.dead || o.state !== 'active' || Math.hypot(o.x - pin.x, o.y - pin.y) > 1.8) return;
    var d = Math.hypot(o.x - pin.x, o.y - pin.y) || 1;
    P.Weapons.shove(o, (pin.x - o.x) / d, (pin.y - o.y) / d, cfg.pinPullM);
  });
  s.events.push({ type: 'spearPin', x: pin.x, y: pin.y, id: pin.id, root: sp.root });
}

function updateSpears(s, dt) {
  var list = P.Weapons.state(s).spears, cfg = P.CFG.weapons.speargun;
  for (var i = list.length - 1; i >= 0; i--) {
    var sp = list[i];
    sp.t += dt;
    if (sp.phase === 'fly') {
      var step = Math.min(cfg.speed * dt, cfg.range - sp.dist);
      sp.px = sp.x; sp.py = sp.y;
      sp.x += sp.dx * step; sp.y += sp.dy * step; sp.dist += step;
      spearHitCheck(s, sp);
      if (sp.left <= 0 || sp.dist >= cfg.range - 1e-6) stickSpear(s, sp);
    }
    if (sp.phase === 'stuck' && sp.t >= sp.T) list.splice(i, 1);
  }
}

// ---------- Fire Extinguisher: a cone that sprays three times, slows and pushes back. Usta/echo repeat the spray. ----------
function fireExtinguisher(s, dt) {
  var h = s.hero, cfg = P.CFG.weapons.extinguisher, lv = P.Weapons.level(h, 'extinguisher');
  if (!lv || !P.Weapons.ready(h, 'extinguisher', dt)) return;
  var M = P.Mods.of(s, 'extinguisher'), range = lv.range * M.area;
  var t = P.Weapons.nearestEnemy(s, h.x, h.y, range);
  if (!t) return;
  var A = P.Mods.act(s, 'extinguisher'), sig = A.sig;
  h.cds.extinguisher = cfg.cooldown * lv.cdMult * A.cd * P.Weapons.cdMult(s, 'extinguisher');
  var a = Math.atan2(t.y - h.y, t.x - h.x), arc = sig ? sig.arc : lv.arcDeg;
  spray(s, a, lv, A, range, arc, 0);
  if (M.echo) spray(s, a, lv, A, range, arc, M.echo.delay);
  s.events.push({ type: 'extSpray', x: h.x, y: h.y, a: a, range: range, arc: arc, n: cfg.ticks });
  P.Mods.announce(s, A, h.x, h.y, range);
}

function spray(s, a, lv, A, range, arc, wait) {
  var M = A.M, sl = M.slow || { m: 0, t: 0 };
  var slow = { m: Math.max(lv.slow, sl.m), t: Math.max(lv.slowT, sl.t) };
  P.Weapons.state(s).sprays.push({ a: a, lv: lv, A: A, range: range, arc: arc, wait: wait, left: P.CFG.weapons.extinguisher.ticks,
    tickT: 0, t: 0, T: P.CFG.weapons.extinguisher.ticks * P.CFG.weapons.extinguisher.tickGap + 0.2 + wait,
    push: lv.push * M.push * (A.sig ? A.sig.push : 1), slow: slow, dmg: P.Weapons.dmgFor(s, 'extinguisher', lv.dmg) * A.dmg });
}

function sprayTick(s, sp) {
  var h = s.hero, cfg = P.CFG.weapons.extinguisher, cosHalf = Math.cos(sp.arc * Math.PI / 360);
  var ax = Math.cos(sp.a), ay = Math.sin(sp.a), push = sp.push / cfg.ticks;
  s.enemies.forEach(function (e) {
    if (e.dead || e.state !== 'active') return;
    var dx = e.x - h.x, dy = e.y - h.y, d = Math.hypot(dx, dy);
    if (d - e.r > sp.range || (d > 0.05 && (dx * ax + dy * ay) / d < cosHalf)) return;
    P.Mods.hit(s, e, sp.dmg, dx / (d || 1), dy / (d || 1), 0, 'extinguisher', sp.A);
    if (e.dead) return;
    P.Weapons.shove(e, dx / (d || 1), dy / (d || 1), push);
    P.Status.apply(e, 'slow', sp.slow.t, sp.slow.m);
    P.Status.apply(e, 'foam', cfg.foamT, 1);
  });
  if (sp.A.M.douse) P.Mods.douse(s, h.x + ax * sp.range * 0.5, h.y + ay * sp.range * 0.5, sp.range * 0.5);
  s.events.push({ type: 'extTick', x: h.x, y: h.y, a: sp.a, range: sp.range, arc: sp.arc });
}

function updateSprays(s, dt) {
  var list = P.Weapons.state(s).sprays, gap = P.CFG.weapons.extinguisher.tickGap;
  for (var i = list.length - 1; i >= 0; i--) {
    var sp = list[i];
    if (sp.wait > 0) { sp.wait -= dt; continue; }
    sp.t += dt; sp.tickT -= dt;
    if (sp.left > 0 && sp.tickT <= 0) { sp.left--; sp.tickT += gap; sprayTick(s, sp); }
    if (sp.t >= sp.T) list.splice(i, 1);
  }
}

// ---------- Live cable visuals decay (sim-timed so replays are identical) ----------
function updateBolts(s, dt) {
  var list = P.Weapons.state(s).bolts;
  for (var i = list.length - 1; i >= 0; i--) { list[i].t += dt; if (list[i].t >= list[i].T) list.splice(i, 1); }
}

// ---------- Usta's Cleaver: a spinning blade sweeps 360 degrees (knife family mods; action per turn) ----------
function updateCleaver(s, dt) {
  var h = s.hero, lv = P.Weapons.level(h, 'cleaver'), W = P.Weapons.state(s);
  if (!lv) return;
  var cfg = P.CFG.weapons.cleaver, prev = h.cleaA || 0, turn = Math.PI * 2 / lv.spinT;
  h.cleaA = prev + turn * dt;
  if (Math.floor(h.cleaA / (Math.PI * 2)) > Math.floor(prev / (Math.PI * 2))) {
    s.events.push({ type: 'cleaverSpin', x: h.x, y: h.y });
    W.cleaverAct = P.Mods.act(s, 'knife');
    P.Mods.announce(s, W.cleaverAct, h.x, h.y, lv.radius);
  }
  var A = W.cleaverAct || (W.cleaverAct = P.Mods.act(s, 'knife'));
  var tx = h.x + Math.cos(h.cleaA) * lv.radius * A.area, ty = h.y + Math.sin(h.cleaA) * lv.radius * A.area;
  var kb = 0.4 * P.Weapons.kbMult(s), dmg = P.Weapons.dmgFor(s, 'knife', lv.dmg) * A.dmg;
  for (var i = 0; i < s.enemies.length; i++) {
    var e = s.enemies[i];
    if (e.dead || e.state !== 'active') continue;
    var d = segDist(e.x, e.y, h.x, h.y, tx, ty);
    if (d > e.r + 0.3) continue;
    if (e.cleaT && s.t - e.cleaT < cfg.hitGap) continue;
    e.cleaT = s.t;
    var ex = e.x - tx, ey = e.y - ty, el = Math.hypot(ex, ey) || 1;
    P.Mods.hit(s, e, dmg, ex / el, ey / el, kb, 'cleaver', A);
    s.events.push({ type: 'cleaverChop', x: e.x, y: e.y, a: Math.atan2(ey, ex) });
  }
}

// ---------- Chain Cyclone: a wider, faster chain that drags enemies toward the hero (chain family mods) ----------
function updateCyclone(s, dt) {
  var h = s.hero, lv = P.Weapons.level(h, 'cyclone');
  if (!lv) return;
  var cfg = P.CFG.weapons.cyclone, prev = h.cycA || 0, W = P.Weapons.state(s);
  var M = P.Mods.of(s, 'chain'), boost = W.chainBoostT > 0 ? P.CFG.sig.chain.spin : 1;
  h.cycA = prev + lv.speed * (2 - P.Weapons.cdMult(s)) * M.spin * boost * dt;
  if (Math.floor(h.cycA / (Math.PI * 2)) > Math.floor(prev / (Math.PI * 2))) {
    s.events.push({ type: 'cyclone', x: h.x, y: h.y });
    P.Weapons.spinTurn(s);
  }
  P.Weapons.bladeHits(s, lv, h.cycA, cfg.hitInterval, lv.kb * P.Weapons.kbMult(s), 'cyclone', 'cycT', P.Weapons.chainAct(s));
  s.enemies.forEach(function (e) {
    if (e.dead || e.state !== 'active' || P.Status.rooted(e)) return;
    var dx = h.x - e.x, dy = h.y - e.y, d = Math.hypot(dx, dy);
    if (d > lv.pullR || d < 0.6) return;
    var step = Math.min(d - 0.6, lv.pullSpeed * dt);
    e.x += dx / d * step; e.y += dy / d * step;
    P.World.clampWalk(e, e.r, s.props);
  });
}

P.Weapons3.step = function (s, dt) {
  fireCable(s, dt);
  fireSpear(s, dt);
  fireExtinguisher(s, dt);
  updateSpears(s, dt);
  updateSprays(s, dt);
  updateBolts(s, dt);
  updateCleaver(s, dt);
  updateCyclone(s, dt);
};
