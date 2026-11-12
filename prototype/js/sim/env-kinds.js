(function () {
// Environment kinds (lane A): what a breakable does when hit or broken. Cover leaves glass or wood debris (a slowing
// zone) and sometimes a simit or jeton. Gas canisters and bomb cars light a fuse (telegraph) and then blast: 60 to
// enemies in 2.2 m, 12 to the hero, a fire patch, and a chain to every canister or bomb car in reach. Extinguishers
// spray foam, put out fires and vent fuses. Numbers: P.CFG.env (config-env.js).
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

function removeBlock(s, r) {
  var B = s.geo.blocks, i = r.b ? B.indexOf(r.b) : -1;
  if (i >= 0) B.splice(i, 1);
}

// Hit: a lit fuse ignores hits (the blast is coming). A burning car (bomb) lights on its first hit, so the telegraph
// reads at once; hp still counts. Breaking runs the kind's behaviour (a lit car is not broken, it blows on its fuse).
// src: a damage tag or weapon id (W lane passes it through combat.js damageProp); missing means a plain hit.
P.Env.hitProp = function (s, r, dmg, src) {
  if (!r.alive || r.fuseT > 0) return;
  r.hp -= dmg; r.flash = P.CFG.feel.hitFlash;
  if (r.bomb) P.Env.fuse(s, r, 'hit', P.CFG.env.fuse.car);
  if (r.hp <= 0) P.Env.broke(s, r, P.Env.tagOf(src));
};

P.Env.broke = function (s, r, tag) {
  if (r.bomb || r.kind === 'gascan') { P.Env.fuse(s, r, 'hit', P.CFG.env.fuse[r.kind === 'gascan' ? 'gas' : 'car']); return; }
  if (r.kind === 'extinguisher') { spray(s, r); breakCover(s, r, tag); return; }
  breakCover(s, r, tag);
};

// Cover: leaves a slowing debris zone, drops loot, and comes out of the geometry (the hack.js splice). A blunt hit throws
// the debris wider; a fire hit leaves a small burning patch (it can light a canister next to it).
function breakCover(s, r, tag) {
  var C = P.CFG.env, E = s.env, L = C.loot, glass = C.glassKinds.indexOf(r.kind) >= 0 ? 'glass' : 'debris', drop = 'none';
  var spread = C.tagDebris[tag] || 1;
  r.alive = false; removeBlock(s, r); E.stats.breaks++;
  if (glass === 'glass') P.EnvZones.add(s, 'glass', r.x, r.y, C.glass.r * spread, C.glass.T, C.glass.slow);
  else P.EnvZones.add(s, 'debris', r.x, r.y, C.debris.r * spread, C.debris.T, C.debris.slow);
  if (tag === 'fire') s.zones.push({ kind: 'fire', x: r.x, y: r.y, r: C.burn.r, t: C.burn.T, T: C.burn.T, dps: C.burn.dps });
  if (E.rng.chance(L.simitChance)) { drop = 'simit'; P.Events.drop(s, 'simit', r.x, r.y, P.CFG.drops.simitHeal); }
  else if (E.rng.chance(L.jetonChance)) {
    drop = 'jeton';
    P.Events.drop(s, 'jeton', r.x, r.y, Math.round(E.rng.range(L.jetonMin, L.jetonMax) * (1 + s.fx.coinPct)));
  }
  s.events.push({ type: 'envBreak', kind: r.kind, x: r.x, y: r.y, mat: glass, drop: drop, tag: tag || null, spread: spread });
}

// Fuse: the shorter of the running and the new timer wins. Gas starts a hiss cloud (the telegraph and the molotov
// target); a bomb car starts its steady glow. Chain links are announced by the caller (envChain).
P.Env.fuse = function (s, r, via, T) {
  if (!r.alive || (r.fuseT > 0 && r.fuseT <= T)) return false;
  var first = !(r.fuseT > 0), gas = r.kind === 'gascan', C = P.CFG.env;
  r.fuseT = T; r.fuseMax = T; r.fuseVia = via;
  if (first) {
    s.events.push({ type: 'envFuse', kind: gas ? 'gas' : 'car', via: via, x: r.x, y: r.y, T: T });
    if (gas) {
      P.EnvZones.add(s, 'gas', r.x, r.y, C.cloud.r, T, 0, r);
      s.events.push({ type: 'envLeak', x: r.x, y: r.y, r: C.cloud.r, T: T });
    }
  }
  return true;
};

// Chain: every canister or bomb car within rad (+ margin) of (x, y) that is not already lit gets the given fuse.
P.Env.chainAt = function (s, x, y, rad, via, T) {
  var n = 0, C = P.CFG.env, R = s.env.recs;
  for (var i = 0; i < R.length; i++) {
    var r = R[i];
    if (!r.alive || !(r.bomb || r.kind === 'gascan')) continue;
    if (Math.hypot(r.x - x, r.y - y) - r.r > rad + C.chainMargin) continue;
    if (r.fuseT > 0 && r.fuseT <= T) continue;
    if (!P.Env.fuse(s, r, via, T)) continue;
    n++;
    s.events.push({ type: 'envChain', from: { x: x, y: y }, x: r.x, y: r.y, kind: r.kind === 'gascan' ? 'gas' : 'car', via: via, T: T });
  }
  if (n) s.env.stats.chains += n;
  return n;
};

// Detonate a lit record: it is gone, its cloud is spent, and the blast runs from its centre.
P.Env.detonate = function (s, r) {
  if (!r.alive) return;
  r.alive = false; r.fuseT = 0; removeBlock(s, r);
  P.EnvZones.drop(s, r);
  P.Env.blast(s, r.x, r.y, r.kind === 'gascan' ? 'gas' : 'car');
};

// The blast (gas canister, bomb car, or the hazard car in events-kinds.js): explode event (L1 visuals, sfx, shake),
// enemies and hero damage, chain to canisters and bomb cars and damage to cover in reach, then a fire patch.
P.Env.blast = function (s, x, y, from) {
  var B = P.CFG.env.blast, C = P.CFG.env, E = s.env, h = s.hero, cause = from === 'car' ? 'car' : 'canister';
  var en = 0, pr = 0, hitHero = false, i, e, dx, dy, d;
  s.events.push({ type: 'explode', x: x, y: y, r: B.r, trauma: B.trauma });
  for (i = 0; i < s.enemies.length; i++) {
    e = s.enemies[i];
    if (e.dead || e.state === 'dormant') continue;
    dx = e.x - x; dy = e.y - y; d = Math.hypot(dx, dy) || 1;
    if (d - e.r <= B.r) { P.Combat.damageEnemy(s, e, B.enemyDmg, dx / d, dy / d, B.kb, false, cause); en++; }
  }
  if (P.Combat.hasPerk(s, 'str.2')) P.Combat.blastShove(s, x, y, B.r);   // Cart Shover (str.2): enemies just outside the blast
  if (Math.hypot(h.x - x, h.y - y) - P.CFG.hero.radius <= B.r) { P.Combat.damageHero(s, B.heroDmg, cause); hitHero = true; }
  P.Env.chainAt(s, x, y, B.r, 'chain', C.fuse.chain);
  for (i = 0; i < E.recs.length; i++) {
    var r = E.recs[i];
    if (!r.alive || r.fuseT > 0) continue;
    if (dist(r, { x: x, y: y }) - r.r > B.r) continue;
    P.Env.hitProp(s, r, B.enemyDmg);
    pr++;
  }
  s.zones.push({ kind: 'fire', x: x, y: y, r: B.fireR, t: B.fireT, T: B.fireT, dps: B.fireDps });
  E.stats.blasts++;
  s.events.push({ type: 'envExplode', src: from, x: x, y: y, r: B.r, enemies: en, props: pr, hero: hitHero });
};

// Extinguisher spray: fires within reach go out, live fuses within reach are vented (no blast), foam slows the area.
function spray(s, r) {
  var C = P.CFG.env, X = C.foam.spray, Z = s.zones, R = s.env.recs, fires = 0, vented = 0, i, o;
  for (i = Z.length - 1; i >= 0; i--) {
    if (Z[i].kind === 'fire' && Math.hypot(Z[i].x - r.x, Z[i].y - r.y) <= Z[i].r + X) { Z.splice(i, 1); fires++; }
  }
  for (i = 0; i < R.length; i++) {
    o = R[i];
    if (o === r || !o.alive || !(o.fuseT > 0) || dist(o, r) > X + o.r) continue;
    P.Env.vent(s, o); vented++;
  }
  P.EnvZones.add(s, 'foam', r.x, r.y, C.foam.r, C.foam.T, C.foam.slow);
  s.env.stats.extinguish++;
  s.events.push({ type: 'envExtinguish', x: r.x, y: r.y, r: X, fires: fires, vented: vented });
}

// A vented gas canister is removed with no blast; a vented bomb car burns out and is only a car again.
P.Env.vent = function (s, o) {
  o.fuseT = 0; o.fuseVia = null;
  P.EnvZones.drop(s, o);
  if (o.kind === 'gascan') { o.alive = false; removeBlock(s, o); } else o.bomb = false;
};
})();
