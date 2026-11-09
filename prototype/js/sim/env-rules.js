(function () {
// Weapon x terrain rules (lane A, AUDIT-6 A3). Each rule reads existing weapon events or projectile positions, so the
// weapon files stay untouched. (1) A molotov landing in a gas cloud ignites it: a fireball, 40 burn per enemy, and any
// canister in the cloud blows at once. (2) A chain or sawblade crossing a wet tile arcs 6 damage to the three nearest
// enemies every 0.3 s. (3) A canister landing next to an explosive car lights its fuse. Every rule emits envHit
// {rule} so weapon evolutions (W1) can react. Numbers: P.CFG.env.rules.
P.EnvRules = {};

function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

// Gas cloud for a molotov: a canister's cloud (env) or a hazard gas leak (events-kinds.js, its toxic zone at the event).
function gasTarget(s, e) {
  var E = s.env, i, ev, z, k;
  for (i = 0; i < E.zones.length; i++) {
    z = E.zones[i];
    if (z.gas && dist(z, e) <= z.r) return { zone: z, env: true };
  }
  for (k = 0; k < s.ev.list.length; k++) {
    ev = s.ev.list[k];
    if (ev.done || ev.kind !== 'hazard' || ev.sub !== 'gas') continue;
    for (i = 0; i < s.zones.length; i++) {
      z = s.zones[i];
      if (z.kind === 'toxic' && z.x === ev.x && z.y === ev.y && dist(z, e) <= z.r) return { zone: z, ev: ev, env: false };
    }
  }
  return null;
}

P.EnvRules.molotov = function (s, e) {
  var R = P.CFG.env.rules.ignite, hit = gasTarget(s, e), list, i;
  if (!hit) return;
  if (hit.env) { list = s.env.zones; i = list.indexOf(hit.zone); if (i >= 0) list.splice(i, 1); }
  else { list = s.zones; i = list.indexOf(hit.zone); if (i >= 0) list.splice(i, 1); P.Events.end(s, hit.ev, 'ignited'); }
  P.EnvRules.ignite(s, hit.zone.x, hit.zone.y);
};

// The fireball: fire patch, burn per enemy in reach, and the canisters in the cloud blow at once (ignite fuse).
P.EnvRules.ignite = function (s, x, y) {
  var R = P.CFG.env.rules.ignite, C = P.CFG.env, n = 0, i, e;
  s.zones.push({ kind: 'fire', x: x, y: y, r: R.r, t: R.T, T: R.T, dps: C.blast.fireDps });
  for (i = 0; i < s.enemies.length; i++) {
    e = s.enemies[i];
    if (e.dead || e.state !== 'active' || dist(e, { x: x, y: y }) - e.r > R.r) continue;
    e.dotAcc += R.burn; n++;
  }
  P.Env.chainAt(s, x, y, R.r, 'ignite', C.fuse.ignite);
  s.env.stats.ignites++;
  s.events.push({ type: 'envIgnite', x: x, y: y, r: R.r, n: n });
  s.events.push({ type: 'envHit', rule: 'ignite', x: x, y: y });
};

// A canister lands (weapon 'blast' event, small). Explosive cars within reach light their fuse; gas canisters in the
// landing burst catch fire from the blast (short chain fuse).
P.EnvRules.lob = function (s, e) {
  var R = P.CFG.env.rules.lob, C = P.CFG.env, reach = (e.r || 0) + R.r, n = 0, recs = s.env.recs, i, r;
  if (R.ids.indexOf(e.id) < 0) return;
  for (i = 0; i < recs.length; i++) {
    r = recs[i];
    if (!r.alive || dist(r, e) - r.r > reach) continue;
    if (r.bomb && r.fuseT <= 0 && P.Env.fuse(s, r, 'canister', C.fuse.car)) n++;
    else if (r.kind === 'gascan' && P.Env.fuse(s, r, 'canister', C.fuse.chain)) n++;
  }
  if (n) s.events.push({ type: 'envHit', rule: 'lob', x: e.x, y: e.y, n: n });
};

// Blade points that can cross a puddle: the chain orbit (from hero.chainA and the owned level) and sawblades in flight.
function bladePoints(s) {
  var h = s.hero, out = [], lv, n, b, a, W = P.Weapons.state(s), i;
  var id = P.Weapons.variantOf(h, 'chain');
  lv = h.weapons[id] ? P.Weapons.level(h, id) : null;
  if (lv && lv.blades) {
    n = lv.blades;
    for (b = 0; b < n; b++) {
      a = (h.chainA || 0) + b * Math.PI * 2 / n;
      out.push({ x: h.x + Math.cos(a) * lv.radius, y: h.y + Math.sin(a) * lv.radius, src: 'chain' });
    }
  }
  for (i = 0; i < W.blades.length; i++) out.push({ x: W.blades[i].x, y: W.blades[i].y, src: 'sawblade' });
  return out;
}

function wetAt(s, p) {
  var Z = s.env.zones;
  for (var i = 0; i < Z.length; i++) if (Z[i].kind === 'puddle' && dist(Z[i], p) <= Z[i].r) return Z[i];
  return null;
}

function nearest(s, p, n, range) {
  var list = [], i, e, d;
  for (i = 0; i < s.enemies.length; i++) {
    e = s.enemies[i];
    if (e.dead || e.state !== 'active') continue;
    d = dist(e, p);
    if (d - e.r <= range) list.push({ e: e, d: d });
  }
  list.sort(function (a, b) { return a.d - b.d; });
  return list.slice(0, n).map(function (o) { return o.e; });
}

P.EnvRules.arcs = function (s, dt) {
  var E = s.env, R = P.CFG.env.rules.arc, i, p, z, targets, j, t, dx, dy, d;
  for (i = E.arcs.length - 1; i >= 0; i--) { E.arcs[i].t -= dt; if (E.arcs[i].t <= 0) E.arcs.splice(i, 1); }
  if (!E.zones.some(function (z) { return z.kind === 'puddle'; })) return;
  var pts = bladePoints(s);
  for (i = 0; i < pts.length; i++) {
    p = pts[i];
    z = wetAt(s, p);
    if (!z || z.arcT > 0) continue;
    targets = nearest(s, p, R.n, R.range);
    if (!targets.length) continue;
    z.arcT = R.every;
    for (j = 0; j < targets.length; j++) {
      t = targets[j]; dx = t.x - p.x; dy = t.y - p.y; d = Math.hypot(dx, dy) || 1;
      P.Combat.damageEnemy(s, t, R.dmg, dx / d, dy / d, 0, false, 'arc');
      E.arcs.push({ x0: p.x, y0: p.y, x1: t.x, y1: t.y, t: R.show, T: R.show });
    }
    E.stats.arcs++;
    s.events.push({ type: 'envArc', x: p.x, y: p.y, n: targets.length, src: p.src });
    s.events.push({ type: 'envHit', rule: 'arc', x: p.x, y: p.y, n: targets.length });
  }
};
})();
