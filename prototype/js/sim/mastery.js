// Weapon mastery (pure, Node-safe) and the weapon mod engine (v0.5, workstream A).
// P.Mastery: rank from lifetime kills (meta stores the kills), rank for a run (loadout or ?mastery debug), the
// passive bonus per rank, and the damage-source map. P.Mods: composes a family's picked mods, counts actions
// (usta every Nth; signature move every Nth at rank 5) and resolves impacts: area damage, knockdown, chain
// reactions, shards, echoes, sticky drags, slow clouds, stuns. State lives in P.Weapons.state(s) (the view reads it).
// Events: masteryMove, modUsta, modShards, modChain, modStick, modEcho, modCloud.
P.Mastery = {};
P.Mods = {};

(function () {
  var SRC = { cleaver: 'knife', nailstorm: 'nailgun', cluster: 'canister', cyclone: 'chain', finale: 'fireworks' };
  var MUL = ['area', 'dmg', 'cd', 'life', 'spin', 'range', 'reel', 'push'];
  var ADD = ['knock', 'burn', 'pierce', 'count', 'bounce', 'pull', 'stun', 'root'];
  var OBJ = ['shards', 'chain', 'stick', 'echo', 'slow', 'crit', 'cloud', 'reflect'];

  // ---------- mastery (pure) ----------
  P.Mastery.srcToWeapon = function (src) {
    if (!src) return null;
    if (Object.prototype.hasOwnProperty.call(SRC, src)) return SRC[src];
    if (P.CFG.evolutions[src]) return P.CFG.evolutions[src].from;   // every evolution counts toward its base
    return P.CFG.arsenal.weapons.indexOf(src) >= 0 ? src : null;
  };
  P.Mastery.rank = function (id, kills) {
    var need = P.CFG.mastery.need, r = 0;
    for (var i = 0; i < need.length; i++) if ((kills || 0) >= need[i]) r = i + 1;
    return r;
  };
  P.Mastery.next = function (id, kills) {
    var need = P.CFG.mastery.need, r = P.Mastery.rank(id, kills);
    return { rank: r, need: r < need.length ? need[r] : need[need.length - 1], have: kills || 0 };
  };
  P.Mastery.list = function () { return P.CFG.arsenal.weapons.slice(); };
  P.Mastery.describeRank = function (id, rank) {
    return rank >= P.CFG.mastery.sigRank ? 'sig.' + id : 'mastery.rank.' + rank;
  };
  P.Mastery.roman = function (r) { return ['', 'I', 'II', 'III', 'IV', 'V'][r] || ''; };
  function clampRank(v) { return Math.max(0, Math.min(P.CFG.mastery.need.length, Math.floor(+v || 0))); }
  // Rank for this run: the loadout's rank (meta) unless the debug override is set (?mastery=N).
  P.Mastery.runRank = function (s, id) {
    var dbg = P.CFG.debugMastery;
    if (dbg !== undefined && dbg !== null) return clampRank(dbg);
    var m = (s && s.loadout && s.loadout.mastery) || {};
    return clampRank(m[id] || 0);
  };
  P.Mastery.bonus = function (s, id) {
    var r = P.Mastery.runRank(s, id), M = P.CFG.mastery;
    return { rank: r, dmg: 1 + r * M.dmgPerRank, cd: Math.max(0.5, 1 - r * M.cdPerRank) };
  };

  // ---------- mods: composition ----------
  function blank() {
    var M = { usta: false, douse: false, ids: [] }, k;
    for (k = 0; k < MUL.length; k++) M[MUL[k]] = 1;
    for (k = 0; k < ADD.length; k++) M[ADD[k]] = 0;
    for (k = 0; k < OBJ.length; k++) M[OBJ[k]] = null;
    return M;
  }
  // Composed effect of every mod the hero picked for a family (evolutions use the base family's mods).
  P.Mods.of = function (s, fam) {
    var M = blank(), picks = (s.hero.mods || {})[fam] || [];
    picks.forEach(function (id) {
      if (id === 'usta') { M.usta = true; return; }
      var d = P.CFG.modDefs[id];
      if (!d) return;
      M.ids.push(id);
      for (var k in d.fx) {
        var v = d.fx[k];
        if (MUL.indexOf(k) >= 0) M[k] *= v;
        else if (ADD.indexOf(k) >= 0) M[k] += v;
        else if (k === 'douse') M.douse = true;
        else M[k] = v;
      }
    });
    return M;
  };

  function ws(s) { return P.Weapons.state(s); }
  function arr(o, k) { return o[k] || (o[k] = []); }

  // One action of a family (cast, swing, throw, volley). Counts it; returns the multipliers for this action.
  P.Mods.act = function (s, fam) {
    var W = ws(s), counts = W.acts || (W.acts = {}), k, M = P.Mods.of(s, fam), U = P.CFG.usta, MC = P.CFG.mastery;
    counts[fam] = (counts[fam] || 0) + 1;
    k = counts[fam];
    var A = { fam: fam, n: k, M: M, area: M.area, dmg: M.dmg, cd: M.cd, sig: null, usta: false, rank: P.Mastery.runRank(s, fam) };
    if (M.usta && k % U.every === 0) { A.usta = true; A.area *= U.areaMul; A.dmg *= U.dmgMul; }
    if (A.rank >= MC.sigRank && k % MC.sigEvery === 0 && P.CFG.sig[fam]) {
      A.sig = P.CFG.sig[fam];
      A.area *= A.sig.area || 1; A.dmg *= A.sig.dmg || 1;
    }
    return A;
  };

  // Events for the action's special moments (usta doubling, signature move) at (x, y) with radius r.
  P.Mods.announce = function (s, A, x, y, r) {
    if (A.usta) s.events.push({ type: 'modUsta', weapon: A.fam, x: x, y: y });
    if (A.sig) s.events.push({ type: 'masteryMove', weapon: A.fam, x: x, y: y, r: r || 0, extra: A.sig.extra,
      slowMo: P.CFG.mastery.sigSlowMo, n: A.n });
  };

  // ---------- impacts ----------
  function hitOne(s, e, dmg, dx, dy, kb, src, M, killed) {
    var d = dmg, k = kb;
    if (M.crit && s.rng.combat.chance(M.crit.p)) d *= M.crit.mul;
    if (M.knock) { P.Status.apply(e, 'stun', M.knock, 1); k *= 1.8; }
    if (M.stun) P.Status.apply(e, 'stun', M.stun, 1);
    if (M.slow) P.Status.apply(e, 'slow', M.slow.t, M.slow.m);
    if (M.root) P.Status.apply(e, 'root', M.root, 1);
    if (M.pull) P.Weapons.shove(e, -dx, -dy, M.pull);
    for (var i = 0; i < M.burn; i++) P.Combat.addBurn(e);
    P.Combat.damageEnemy(s, e, d, dx, dy, k, true, src);
    if (e.dead && killed) killed.push(e);
  }

  // Area impact at (x, y): every active enemy and prop within r, then the mods. opts: {echo, chain, depth, noStick}.
  // Returns the number of enemies hit, or -1 when a sticky shot latched on instead of detonating.
  P.Mods.blast = function (s, x, y, r, dmg, kb, src, A, opts) {
    var M = A.M, o = opts || {}, killed = [], hits = 0;
    if (M.stick && !o.noStick && !o.chain && stickFrom(s, x, y, r, dmg, kb, src, A)) return -1;
    s.enemies.forEach(function (e) {
      if (e.dead || e.state !== 'active') return;
      var dx = e.x - x, dy = e.y - y, d = Math.hypot(dx, dy) || 0.01;
      if (d - e.r > r) return;
      hits++;
      hitOne(s, e, dmg, dx / d, dy / d, kb, src, M, killed);
    });
    P.Combat.forEachProp(s, function (p) { if (Math.hypot(p.x - x, p.y - y) - p.r <= r) P.Combat.damageProp(s, p, dmg); });
    if (M.douse) douse(s, x, y, r);
    if (M.shards) spawnShards(s, x, y, dmg, src, M.shards);
    if (M.cloud) addCloud(s, x, y, r, M.cloud);
    if (M.chain && (o.depth || 0) < P.CFG.mastery.chainMaxDepth) queueChains(s, killed, dmg, kb, src, A, o.depth || 0);
    if (M.echo && !o.echo && !o.chain) scheduleEcho(s, { kind: 'blast', x: x, y: y, r: r, dmg: dmg, kb: kb, src: src, A: A }, M.echo);
    // Area damage carries its synergy tag (fire, electric, blunt, blade, gas, water) for the environment rules (lane A).
    s.events.push({ type: 'areaHit', x: x, y: y, r: r, src: src, tag: P.Weapons.tagOf(src), hits: hits, chain: !!o.chain });
    return hits;
  };

  // Single-target hit (melee, chain, beam): knockdown, slow, crit, shards, lifesteal, echo, chain on kill.
  P.Mods.hit = function (s, e, dmg, dx, dy, kb, src, A, opts) {
    var M = A.M, o = opts || {}, killed = [];
    hitOne(s, e, dmg, dx, dy, kb, src, M, killed);
    if (M.shards) spawnShards(s, e.x, e.y, dmg, src, M.shards);
    if (M.chain && killed.length && (o.depth || 0) < P.CFG.mastery.chainMaxDepth) queueChains(s, killed, dmg, kb, src, A, o.depth || 0);
    if (M.echo && !o.echo) scheduleEcho(s, { kind: 'hit', e: e, dx: dx, dy: dy, dmg: dmg, kb: kb, src: src, A: A }, M.echo);
    return killed.length;
  };

  // Stick: the nearest enemy in r latches on, is dragged to the landing point and detonates bigger later.
  function stickFrom(s, x, y, r, dmg, kb, src, A) {
    var W = ws(s), list = arr(W, 'sticks'), best = null, bd = r + 0.01, i, e, d;
    if (list.length >= P.CFG.mastery.stickCap) return false;
    for (i = 0; i < s.enemies.length; i++) {
      e = s.enemies[i];
      if (e.dead || e.state !== 'active' || e.stuck) continue;
      d = Math.hypot(e.x - x, e.y - y) - e.r;
      if (d < bd) { bd = d; best = e; }
    }
    if (!best) return false;
    best.stuck = true;
    list.push({ e: best, x: x, y: y, t: 0, T: A.M.stick.delay, dmg: dmg, kb: kb, src: src, A: A, r: r, mult: A.M.stick.mult });
    s.events.push({ type: 'modStick', x: best.x, y: best.y, lx: x, ly: y, fam: A.fam });
    return true;
  }

  function updateSticks(s, dt) {
    var list = ws(s).sticks || [], i, q, e, dx, dy, d, st;
    for (i = list.length - 1; i >= 0; i--) {
      q = list[i]; e = q.e; q.t += dt;
      if (!e.dead && e.state === 'active') {
        dx = q.x - e.x; dy = q.y - e.y; d = Math.hypot(dx, dy);
        if (d > 0.05) { st = Math.min(d, 2.5 * dt); e.x += dx / d * st; e.y += dy / d * st; P.World.clampWalk(e, e.r, s.props); }
      }
      if (q.t < q.T && !e.dead) continue;
      list.splice(i, 1);
      e.stuck = false;
      P.Mods.blast(s, e.x, e.y, q.r * q.mult, q.dmg * q.mult, q.kb, q.src, q.A, { noStick: true, echo: true });
      s.events.push({ type: 'modStickBoom', x: e.x, y: e.y, r: q.r * q.mult, fam: q.A.fam });
    }
  }

  // Shards: small projectiles that fly out from an impact and pierce through enemies on the way.
  function spawnShards(s, x, y, dmg, src, S) {
    var list = arr(ws(s), 'shards'), C = P.CFG.mastery, n = S.n, i, a, sp, rng = s.rng.combat;
    for (i = 0; i < n && list.length < C.shardCap; i++) {
      a = i / n * Math.PI * 2 + rng.range(-0.25, 0.25); sp = C.shardSpeed * rng.range(0.7, 1.1);
      list.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, t: 0, T: C.shardLife, dmg: dmg * S.dmg,
        pierce: S.pierce, src: src, hit: [] });
    }
    s.events.push({ type: 'modShards', x: x, y: y, n: n, src: src });
  }
  function updateShards(s, dt) {
    var list = ws(s).shards || [], C = P.CFG.mastery, i, j, q, e, gone, sp;
    for (i = list.length - 1; i >= 0; i--) {
      q = list[i]; q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt; gone = q.t >= q.T;
      sp = Math.hypot(q.vx, q.vy) || 1;
      for (j = 0; j < s.enemies.length && !gone; j++) {
        e = s.enemies[j];
        if (e.dead || e.state !== 'active' || q.hit.indexOf(e.id) >= 0) continue;
        if (Math.hypot(e.x - q.x, e.y - q.y) > e.r + C.shardHitR) continue;
        q.hit.push(e.id);
        P.Combat.damageEnemy(s, e, q.dmg, q.vx / sp, q.vy / sp, 0.1, false, q.src);
        q.pierce--;
        if (q.pierce < 0) gone = true;
      }
      if (gone) list.splice(i, 1);
    }
  }

  // Chain reactions: each enemy killed by a blast or hit may explode itself (queued, capped per frame).
  function queueChains(s, killed, dmg, kb, src, A, depth) {
    var list = arr(ws(s), 'chainQ'), C = P.CFG.mastery, p = A.M.chain.p, rng = s.rng.combat;
    killed.forEach(function (e) {
      if (list.length >= C.chainCapTotal || !rng.chance(p)) return;
      list.push({ x: e.x, y: e.y, r: C.chainR * (A.M.area || 1), dmg: dmg * C.chainDmg, kb: kb * 0.5, src: src, A: A, depth: depth + 1 });
    });
  }
  function updateChain(s) {
    var list = ws(s).chainQ || [], C = P.CFG.mastery, n = 0, c;
    while (list.length && n < C.chainCapFrame) {
      c = list.shift(); n++;
      P.Mods.blast(s, c.x, c.y, c.r, c.dmg, c.kb, c.src, c.A, { chain: true, depth: c.depth });
      s.events.push({ type: 'modChain', x: c.x, y: c.y, r: c.r, depth: c.depth });
    }
  }

  // Echo: the same impact again after a delay at a fraction of its damage.
  function scheduleEcho(s, what, E) {
    var list = arr(ws(s), 'echoes');
    if (list.length >= P.CFG.mastery.echoCap) return;
    list.push({ t: 0, T: E.delay, mult: E.mult, what: what });
  }
  function updateEchoes(s, dt) {
    var list = ws(s).echoes || [], i, q, w;
    for (i = list.length - 1; i >= 0; i--) {
      q = list[i]; q.t += dt;
      if (q.t < q.T) continue;
      list.splice(i, 1);
      w = q.what;
      if (w.kind === 'blast') P.Mods.blast(s, w.x, w.y, w.r, w.dmg * q.mult, w.kb, w.src, w.A, { echo: true });
      else if (!w.e.dead && w.e.state === 'active') P.Mods.hit(s, w.e, w.dmg * q.mult, w.dx, w.dy, w.kb, w.src, w.A, { echo: true });
      s.events.push({ type: 'modEcho', x: w.kind === 'blast' ? w.x : w.e.x, y: w.kind === 'blast' ? w.y : w.e.y, fam: w.A.fam });
    }
  }

  // Slow clouds: lingering zones that slow enemies inside.
  function addCloud(s, x, y, r, C) {
    var list = arr(ws(s), 'clouds');
    if (list.length >= P.CFG.mastery.cloudCap) list.shift();
    list.push({ x: x, y: y, r: r, t: 0, T: C.t, m: C.m });
    s.events.push({ type: 'modCloud', x: x, y: y, r: r, T: C.t });
  }
  function updateClouds(s, dt) {
    var list = ws(s).clouds || [], i, q, j, e;
    for (i = list.length - 1; i >= 0; i--) {
      q = list[i]; q.t += dt;
      if (q.t >= q.T) { list.splice(i, 1); continue; }
      for (j = 0; j < s.enemies.length; j++) {
        e = s.enemies[j];
        if (!e.dead && e.state === 'active' && Math.hypot(e.x - q.x, e.y - q.y) - e.r <= q.r) P.Status.apply(e, 'slow', 0.3, q.m);
      }
    }
  }

  // Area effects without a direct blast (a stain, an ember landing): the family's cloud and shards only.
  P.Mods.field = function (s, x, y, r, A, dmg, src) {
    if (A.M.cloud) addCloud(s, x, y, r, A.M.cloud);
    if (A.M.shards) spawnShards(s, x, y, dmg, src, A.M.shards);
  };

  // Douse: fire pools and fire zones near a point go out (extinguisher, kolonya).
  function douse(s, x, y, r) {
    var W = ws(s);
    if (W.pools) W.pools = W.pools.filter(function (p) { return Math.hypot(p.x - x, p.y - y) - p.r > r; });
    s.zones = s.zones.filter(function (z) { return z.kind !== 'fire' || Math.hypot(z.x - x, z.y - y) - z.r > r; });
  }
  P.Mods.douse = douse;

  P.Mods.update = function (s, dt) {
    updateShards(s, dt); updateEchoes(s, dt); updateSticks(s, dt); updateClouds(s, dt); updateChain(s);
  };
})();
