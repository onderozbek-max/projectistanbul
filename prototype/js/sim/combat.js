// Enemies, weapons, damage, drops, props (GD 4-5, CC 2-5, DS 7). Emits events into s.events.
// Generated levels: s.diff scales enemy HP and contact damage; new behaviours live in enemies.js / bosses.js.
P.Combat = {};

// Hard ceiling (D-056, config-levels.js ceiling): returns null when the field is full. opts.boss (the boss itself) is never refused;
// opts.bossAdd (its scripted adds) may go to the higher boss ceiling. Callers must handle null.
P.Combat.spawnEnemy = function (s, type, x, y, opts) {
  var CE = P.CFG.levels.ceiling;
  if (!(opts && opts.boss) && s.enemies.length >= (opts && opts.bossAdd ? CE.boss : CE.hard)) { s.ceilingHits = (s.ceilingHits || 0) + 1; return null; }
  var d = P.CFG.enemies[type], scale = 1 + P.CFG.hpScalePerMinute * (s.runT / 60), df = s.diff;
  var hp = d.hp * (type === 'diner' ? 1 : scale) * (df ? df.hp : 1);
  var e = {
    id: s.nextId++, type: type, x: x, y: y, r: d.radius, hp: hp, maxHp: hp, speed: d.speed,
    contact: d.contact * (df ? df.dmg : 1), xp: d.xp * (df ? df.xp : 1), kbResist: d.kbResist, kbx: 0, kby: 0, kbT: 0, flash: 0,
    contactCd: 0, state: (opts && opts.state) || 'active', stateT: (opts && opts.stateT) || 0,
    burn: [], dotTick: 0, dotAcc: 0, dead: false, door: opts && opts.door, vx: 0, vy: 0, walk: 0,
    variant: s.rng.ai.int(0, 7), age: 0,
    skin: (opts && opts.skin) || null, windup: 0, swell: 0, boss: false, ai: null,
    evId: (opts && opts.ev) || 0, anchored: !!(opts && opts.anchored), lure: null, lootEv: 0,
    flyer: !!d.flyer,                                      // wave 1: flies over walls (marti); see updateEnemies
  };
  if (opts && opts.elite) {
    var el = P.CFG.elite;
    e.elite = true; e.hp *= el.hpMult; e.maxHp = e.hp; e.contact *= el.dmgMult; e.r *= el.scale; e.xp *= el.xpMult;
    e.kbResist = Math.max(e.kbResist, el.kbResist);
    s.events.push({ type: 'eliteSpawn', x: x, y: y });
  }
  if (d.armour) e.armour = d.armour;                       // v0.6: kasap armour (damage multiplier)
  if (opts && opts.affix) P.Enemies2.applyAffix(e, opts.affix);   // v0.6: hizli / zirhli / patlayan
  P.Enemies.init(s, e);
  s.enemies.push(e);
  s.peakAlive = Math.max(s.peakAlive, s.enemies.length);
  return e;
};

P.Combat.might = function (s) {
  return (s.hero.passives.gloves || 0) * P.CFG.passives.gloves.might + (s.hero.baseMight || 0);
};

// Crit adds the attribute critPct to Skills.critChance (A's). Knockback scales with knockbackPct (attributes).
// A hardhat's helmet cuts frontal damage (P.Enemies.helmetMul, enemies.js).
P.Combat.damageEnemy = function (s, e, base, dirx, diry, kb, canCrit, src) {
  if (e.dead || e.state === 'dormant') return;
  var cc = (P.Skills && P.Skills.critChance ? P.Skills.critChance(s) : P.CFG.hero.critChance) + s.fx.critPct;
  var crit = canCrit && s.rng.combat.chance(Math.min(1, cc));
  var hm = e.helmet ? P.Enemies.helmetMul(s, e) : 1;
  var am = e.armour || 1;                                   // v0.6: armour cuts every hit (kasap, zirhli)
  var bm = P.Skins.hitMul(s, e);                            // wave 1: a hamal takes less from behind (skins.js)
  var dmg = base * (1 + P.Combat.might(s)) * (crit ? P.CFG.hero.critMult : 1) * hm * am * bm;
  var heavy = P.Combat.isHeavy(src);
  e.hp -= dmg;
  e.flash = P.CFG.feel.hitFlash;
  if (heavy) P.Combat.heavyShockwave(s);            // str.3: runs before the knockback below, so the ring cannot cut this push
  if (kb > 0) {
    var k = kb * (1 + s.fx.knockbackPct) * (1 - e.kbResist), T = P.CFG.knockbackTime;
    e.kbx = dirx * 2 * k / T; e.kby = diry * 2 * k / T; e.kbT = T;
  }
  if (heavy) P.Combat.heavyHit(s, e, dirx, diry);   // str.1 extra shove, str.4 stun on armour
  if (e.boss) P.Combat.bossHit(s);                  // agg.2 Blood Rush
  s.events.push({ type: 'hit', id: e.id, x: e.x, y: e.y, dmg: dmg, crit: crit, src: src, dx: dirx, dy: diry, boss: !!e.boss, helmet: hm < 1 });
  if (e.helmet) P.Enemies.helmetHit(s, e, hm < 1);
  if (e.hp <= 0) P.Combat.killEnemy(s, e, crit, src);
};

// ---------- Street Tree perk hooks (R1-T5 step 2, D-059). Each one is a no-op unless the run learned the perk (s.perk).
// Config (P.CFG.perks) is read only inside a learned branch, so a build without config-perks.js behaves as before.
P.Combat.hasPerk = function (s, id) { return !!(s.perk && s.perk[id]); };

// The hit's src is the weapon or evolution id ('sledge', 'cluster'). Heavy is the flag on its config entry (config-weapons*.js).
P.Combat.isHeavy = function (src) {
  var cfg = src ? P.CFG.weapons[src] : null;
  return !!(cfg && cfg.heavy);
};

// str.1 Heavy Hands: a heavy hit pushes its target heavyShove metres more. str.4 Wall Breaker: it stuns an armoured enemy.
P.Combat.heavyHit = function (s, e, dirx, diry) {
  if (P.Combat.hasPerk(s, 'str.1')) P.Combat.shove(e, dirx, diry, P.CFG.perks.heavyShove, true);
  if (e.armour < 1 && P.Combat.hasPerk(s, 'str.4')) P.Status.apply(e, 'stun', P.CFG.perks.wallBreakerStun, 1);
};

// str.3 Shockwave: every shockwave.every-th heavy hit sends one instant shove ring from the hero (no damage).
P.Combat.heavyShockwave = function (s) {
  if (!P.Combat.hasPerk(s, 'str.3')) return;
  var n = (s.pk.shock || 0) + 1;
  s.pk.shock = n;
  if (n % P.CFG.perks.shockwave.every === 0) P.Perks.ring(s, s.hero.x, s.hero.y);
};

// agg.2 Blood Rush: a boss hit during frenzy extends it. Skills.extendFrenzy owns the cap per frenzy.
P.Combat.bossHit = function (s) {
  if (!P.Combat.hasPerk(s, 'agg.2') || !P.Skills || !P.Skills.extendFrenzy || !P.Skills.frenzyOn(s)) return;
  var B = P.CFG.perks.bloodRush;
  P.Skills.extendFrenzy(s, B.ext, B.capT);
};

// Shove a zombie aside (brute charge): impulse of k metres, resisted by its knockback resist. add: stack onto a push already
// running (the perk pushes), so a perk never cuts a hit's own knockback short. Stacking keeps the running push's clock.
P.Combat.shove = function (e, dx, dy, k, add) {
  var f = k * (1 - e.kbResist), T = P.CFG.knockbackTime;
  if (add && e.kbT > 0) { e.kbx += dx * 2 * f / T; e.kby += dy * 2 * f / T; return; }
  e.kbx = dx * 2 * f / T; e.kby = dy * 2 * f / T; e.kbT = T;
};

// Push the hero away from (dx, dy) by dist metres (stomp, slam), clamped to the walkable area.
P.Combat.pushHero = function (s, dx, dy, dist) {
  var h = s.hero, d = Math.hypot(dx, dy) || 1;
  h.x += dx / d * dist; h.y += dy / d * dist;
  P.World.clampHero(s, h);
};

// Kill tally for meta (s.tally) and the kill streak (tally.maxStreak). Luck raises drop chances; coinPct raises jeton.
P.Combat.tallyKill = function (s, e, src, crit) {
  var T = s.tally, k = src || 'dot', R = s.killRun || (s.killRun = { n: 0, t: -Infinity });
  T.kills++;
  if (crit) T.crits++;
  T.bySrc[k] = (T.bySrc[k] || 0) + 1;
  T.byType[e.type] = (T.byType[e.type] || 0) + 1;
  if (e.elite) T.elites++;
  if (e.boss) T.bosses++;
  if (s.t - R.t > P.CFG.ev.streakWin) R.n = 0;
  R.n++; R.t = s.t;
  if (R.n > T.maxStreak) T.maxStreak = R.n;
};

// A drop must be reachable. On generated levels the hero is kept within view.heroClampX (world.js), so a gem dropped
// beyond it (an enemy killed at the side edge) could never be collected: it sat off-screen and the bot chased it forever
// (AUDIT-7 L22 seed 10, L4 seed 4). Clamp kill drops into that band as well as the walkable area.
P.Combat.keepInReach = function (s, d) {
  P.World.clampWalk(d, 0.25, s.props);
  if (s.props.geo) { var hx = P.CFG.view.heroClampX; d.x = Math.min(Math.max(d.x, -hx), hx); }
};

P.Combat.killEnemy = function (s, e, crit, src) {
  e.dead = true;
  s.kills++;
  P.Combat.tallyKill(s, e, src, crit);
  s.events.push({ type: 'kill', id: e.id, enemy: e.type, x: e.x, y: e.y, crit: crit, variant: e.variant, dx: e.kbx, dy: e.kby,
    src: src || 'dot', elite: !!e.elite, boss: !!e.boss, skin: e.skin });
  if (e.elite) s.drops.push({ kind: 'chest', value: 1, x: e.x, y: e.y, mag: true, pop: 0.7 });
  var a = s.rng.loot.range(0, Math.PI * 2);
  s.drops.push({ kind: 'xp', value: e.xp * (1 + s.fx.xpPct), x: e.x + Math.cos(a) * 0.3, y: e.y + Math.sin(a) * 0.3, mag: false, pop: 0.25 });
  var dr = P.CFG.drops, lk = 1 + s.fx.luckPct, cm = 1 + s.fx.coinPct;
  if (s.rng.loot.chance(dr.jetonChance * lk)) s.drops.push({ kind: 'jeton', value: Math.round(s.rng.loot.int(dr.jetonMin, dr.jetonMax) * cm), x: e.x - 0.2, y: e.y, mag: false, pop: 0.25 });
  if (s.rng.loot.chance(dr.simitChance * lk)) s.drops.push({ kind: 'simit', value: dr.simitHeal, x: e.x + 0.2, y: e.y, mag: false, pop: 0.25 });
  for (var di = s.drops.length - 4 < 0 ? 0 : s.drops.length - 4; di < s.drops.length; di++) P.Combat.keepInReach(s, s.drops[di]);
  if (crit) s.events.push({ type: 'critKill' });
  if (crit && P.Combat.hasPerk(s, 'agg.3')) P.Combat.finisher(s, e);
  if (e.boss) P.Bosses.onDeath(s, e);
  if (e.type === 'bloater') P.Enemies.burst(s, e);
  P.Enemies.onDeath(s, e);                                  // screamer call cut, skin and wave 1 death hooks
  if (e.affix) P.Enemies2.onDeath(s, e);
  if (e.evId) P.Events.onKill(s, e);
};

P.Combat.updateEnemies = function (s, dt) {
  var h = s.hero, sep = P.CFG.separation, list = s.enemies, n = list.length;
  var hasStatus = !!(P.Status && P.Status.speedMul);
  for (var i = 0; i < n; i++) {
    var e = list[i];
    e.age += dt;
    e.flash = Math.max(0, e.flash - dt);
    e.contactCd = Math.max(0, e.contactCd - dt);
    if (e.state !== 'active') {
      if (e.state === 'dormant') continue;
      e.stateT -= dt;
      if (e.stateT <= 0) { e.state = 'active'; s.events.push({ type: 'enemyActive', id: e.id, enemy: e.type }); }
      continue;
    }
    var own = P.Enemies.think(s, e, dt);
    var dx = h.x - e.x, dy = h.y - e.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    var sm = (hasStatus ? P.Status.speedMul(e) : 1) * (e.buffMul || 1);   // buffMul: musician aura (skins.js)
    var vx, vy, sx = 0, sy = 0, found = 0;
    if (own) { vx = e.dvx * sm; vy = e.dvy * sm; } else { vx = dx / d * e.speed * sm; vy = dy / d * e.speed * sm; }
    var rooted = !!(P.Status && P.Status.rooted && P.Status.rooted(e));
    if (rooted) { vx = 0; vy = 0; }
    if (!rooted && !(own && e.noSep)) {
      for (var j = 0; j < n && found < sep.maxNeighbors; j++) {
        if (j === i) continue;
        var o = list[j], ox = e.x - o.x, oy = e.y - o.y, rr = e.r + o.r, d2 = ox * ox + oy * oy;
        if (d2 >= rr * rr || o.state === 'dormant') continue;
        var od = Math.sqrt(d2) || 0.01;
        sx += ox / od * (1 - od / rr); sy += oy / od * (1 - od / rr); found++;
      }
      vx += sx * sep.strength; vy += sy * sep.strength;
    }
    if (e.kbT > 0) {
      var f = e.kbT / P.CFG.knockbackTime;
      vx += e.kbx * f; vy += e.kby * f; e.kbT -= dt;
    }
    e.vx = vx; e.vy = vy; e.walk = (e.walk || 0) + Math.hypot(vx, vy) * dt;
    e.x += vx * dt; e.y += vy * dt;
    if (e.flyer) P.Enemies4.clampFly(s, e); else P.World.clampWalk(e, e.r, s.props);   // flyers pass over walls
  }
};

P.Combat.addBurn = function (e) {
  var b = P.CFG.burn;
  if (e.burn.length < b.maxStacks) e.burn.push(b.duration);
  else e.burn[0] = b.duration;
};

// Zones: fire/scorch/toxic/acid affect enemies (DoT); acid and toxic also hurt the hero (ticks, armor applies).
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
      if (zone.kind === 'scorch' && !zone.hit[e.id]) { zone.hit[e.id] = true; P.Combat.addBurn(e); }
      if (zone.kind === 'fire' || zone.kind === 'toxic' || zone.kind === 'acid') e.dotAcc += zone.dps * dt;
    }
    if (zone.heroDps) P.Enemies.zoneHero(s, zone, dt);
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
  if (s.env) P.Env.eachProp(s, fn);   // lane A: cover and env canisters take arc, blast and nail hits like props
};

P.Combat.nearestProp = function (s, range) {
  var h = s.hero, best = null, bd = range;
  P.Combat.forEachProp(s, function (p) {
    if (p.env) return;                // the knife does not auto-aim at cover; it only hits what its arc sweeps
    var d = Math.hypot(p.x - h.x, p.y - h.y) - p.r;
    if (d < bd) { bd = d; best = p; }
  });
  return best;
};

P.Combat.damageProp = function (s, p, dmg, src) {   // src: optional damage tag or weapon id (lane A cover reads it)
  if (p.env) return P.Env.hitProp(s, p, dmg, src);
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
  if (P.Combat.hasPerk(s, 'str.2')) P.Combat.blastShove(s, c.x, c.y, k.blast);
};

// str.2 Cart Shover: enemies just outside a blast (within blastShove.r metres of its edge) are pushed kb metres from its centre.
// Enemies inside the blast take its damage as before and are not pushed here.
P.Combat.blastShove = function (s, x, y, blastR) {
  var S = P.CFG.perks.blastShove, i, e, dx, dy, d;
  for (i = 0; i < s.enemies.length; i++) {
    e = s.enemies[i];
    if (e.dead || e.state !== 'active') continue;
    dx = e.x - x; dy = e.y - y; d = Math.hypot(dx, dy);
    if (d - e.r <= blastR || d - e.r > blastR + S.r) continue;
    P.Combat.shove(e, dx / d, dy / d, S.kb, true);
  }
};

// Hero damage is ignored during i-frames (hit i-frames `invuln`, dash/ult `iframes` set by E1). Returns the damage taken (0 if ignored).
P.Combat.damageHero = function (s, raw, cause) {
  var h = s.hero, hc = P.CFG.hero;
  if (h.invuln > 0 || (h.iframes || 0) > 0 || s.mode !== 'play') return 0;
  if (P.Skills && P.Skills.tryDodge && P.Skills.tryDodge(s, raw, cause)) return 0;
  if (P.Skills && P.Skills.hitReduce) raw = P.Skills.hitReduce(s, raw, cause);
  var jc = P.CFG.passives.jacket, armor = Math.min(jc.armorCap, (h.passives.jacket || 0) * jc.armorPerLevel);
  var dmg = Math.max(1, raw - armor) * (1 - s.fx.dmgTakenPct);
  h.hp -= dmg;
  s.tally.dmgTaken += dmg;
  h.sinceHit = 0;
  if (dmg >= hc.iframeHitFrac * h.maxHp) h.invuln = hc.iframeTime;
  s.events.push({ type: 'heroHit', dmg: dmg, cause: cause, hp: Math.max(0, h.hp) });
  if (h.hp <= 0) {
    h.hp = 0; s.mode = 'dead'; s.deathCause = cause;
    s.events.push({ type: 'death', cause: cause });
  }
  return dmg;
};

// grit.4 Stubborn: at or below hpFrac of max HP, healing drops (simit and the like, not XP, coins or chests) are pulled to the
// hero from pullR metres. It only moves food closer; damage and the death path are untouched, so it can never act as a revive.
P.Combat.stubbornPull = function (s, d, dist) {
  if (d.kind === 'xp' || d.kind === 'jeton' || d.kind === 'chest' || !P.Combat.hasPerk(s, 'grit.4')) return false;
  var S = P.CFG.perks.stubborn, h = s.hero;
  return h.hp <= S.hpFrac * h.maxHp && dist < S.pullR;
};

// grit.1 Thick Skin: the first melee hit that lands on the hero each run stuns its attacker (once per run, s.pk.thick).
P.Combat.thickSkin = function (s, e) {
  if (!P.Combat.hasPerk(s, 'grit.1') || s.pk.thick) return;
  s.pk.thick = true;
  P.Status.apply(e, 'stun', P.CFG.perks.thickSkin.stunT, 1);
};

// Melee contact. P.Enemies.onContact may handle the contact itself (bloater burst, brute charge hit).
P.Combat.contact = function (s) {
  var h = s.hero, hr = P.CFG.hero.radius;
  for (var i = 0; i < s.enemies.length; i++) {
    var e = s.enemies[i];
    if (e.dead || e.state !== 'active' || e.contactCd > 0) continue;
    var rr = e.r + hr;
    if ((e.x - h.x) * (e.x - h.x) + (e.y - h.y) * (e.y - h.y) > rr * rr) continue;
    if (e.ai && P.Enemies.onContact(s, e)) continue;
    e.contactCd = P.CFG.contactInterval;
    if (P.Combat.damageHero(s, e.contact, e.type) > 0) P.Combat.thickSkin(s, e);
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
    if (!d.mag && (dist < pr || (d.kind === 'chest' && dist < 6) || P.Combat.stubbornPull(s, d, dist))) d.mag = true;
    if (d.mag) {
      var step = Math.min(dist, (xc.magnetSpeed + P.Hero.speed(s)) * dt);
      d.x += dx / (dist || 1) * step; d.y += dy / (dist || 1) * step;
      dist -= step;
    }
    if (dist > xc.collectDist) continue;
    s.drops.splice(i, 1);
    if (d.kind === 'xp') { s.xpPicked++; P.Progression.addXp(s, d.value); }
    else if (d.kind === 'jeton') s.jeton += d.value;
    else if (d.kind === 'chest') s.pendingChests++;
    else h.hp = Math.min(h.maxHp, h.hp + d.value + (d.kind === 'simit' ? P.Combat.simitBonus(s) : 0));
    s.events.push({ type: 'pickup', kind: d.kind, value: d.value });
  }
};

// grit.3 Iron Stomach: each simit heals ironStomach.simitHeal more (the caller caps the total at max HP).
P.Combat.simitBonus = function (s) {
  return P.Combat.hasPerk(s, 'grit.3') ? P.CFG.perks.ironStomach.simitHeal : 0;
};

// agg.3 Finisher: a crit kill slows every enemy within finisher.r metres of the victim. Status slow takes the lost fraction,
// so speed x slowMul is slow amount 1 - slowMul. XP and drops are not touched.
P.Combat.finisher = function (s, victim) {
  var F = P.CFG.perks.finisher, i, o;
  for (i = 0; i < s.enemies.length; i++) {
    o = s.enemies[i];
    if (Math.hypot(o.x - victim.x, o.y - victim.y) <= F.r) P.Status.apply(o, 'slow', F.slowT, 1 - F.slowMul);
  }
};
