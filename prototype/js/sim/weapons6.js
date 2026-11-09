// Evolution mechanics, batch 2 (workstream W, AUDIT-6 W1). Stormshield (cable orbit zaps), Netspear (rope share),
// Lake (merging fire pools), Arcchain (chain arcs), Fireball and Carbomb helpers. Also the terrain seam: P.Weapons6.terrainHit
// turns a weapon's hit point into envHit events (kind gas | wet | car) and records the kind as seen for this run. Terrain
// evolutions are awarded only after their kind was seen (evolutionFor override below). Lane A adds terrain through
// P.Env.kindsAt(s, x, y) (an array of kinds) and wet zones as s.zones kind 'wet'; the rules read envHit events.
// Numbers come from P.CFG (config-weapons3.js, the evolved level entries and P.CFG.evoFx).
P.Weapons6 = {};
(function () {
  var TAU = Math.PI * 2;

  // ---------- terrain seam ----------
  // Kinds present at (x, y): gas (live canister prop), car (live cart prop), wet (wet zone), plus whatever lane A reports.
  P.Weapons6.terrainAt = function (s, x, y) {
    var out = [], R = P.CFG.terrainR, pr = s.props || {}, recs = s.env && s.env.recs || [], i, r;
    function near(list, r) { return (list || []).some(function (p) { return p.alive !== false && Math.hypot(p.x - x, p.y - y) - (p.r || 0) <= r; }); }
    if (near(pr.canisters, R.gas)) out.push('gas');
    if (near(pr.carts, R.car)) out.push('car');
    // Lane A records: gas cans are 'gas', parked cars (bomb or not) are 'car'. Read the live records only.
    for (i = 0; i < recs.length; i++) {
      r = recs[i];
      if (!r.alive || Math.hypot(r.x - x, r.y - y) - (r.r || 0) > (r.kind === 'gascan' ? R.gas : R.car)) continue;
      if (r.kind === 'gascan' && out.indexOf('gas') < 0) out.push('gas');
      else if (P.Env && P.Env.isCar && P.Env.isCar(r.kind) && out.indexOf('car') < 0) out.push('car');
    }
    if ((s.zones || []).some(function (z) { return z.kind === 'wet' && Math.hypot(z.x - x, z.y - y) - z.r <= R.wet; })) out.push('wet');
    if (P.Env && P.Env.kindsAt) P.Env.kindsAt(s, x, y).forEach(function (k) { if (out.indexOf(k) < 0) out.push(k); });
    return out;
  };

  // A weapon's hit at (x, y). Emits one envHit per kind (rate-limited per weapon and kind) and marks the kind seen.
  P.Weapons6.terrainHit = function (s, fam, tag, x, y) {
    var kinds = P.Weapons6.terrainAt(s, x, y), W = P.Weapons.state(s), now = s.t, E = P.CFG.evoFx.envHitEvery;
    W.seen = W.seen || {}; W.envT = W.envT || {};
    kinds.forEach(function (k) {
      var key = fam + ':' + k, last = W.envT[key];
      W.seen[key] = true;
      if (last !== undefined && now - last < E) return;
      W.envT[key] = now;
      s.events.push({ type: 'envHit', kind: k, w: fam, tag: tag, x: x, y: y, src: fam });
    });
    return kinds;
  };
  // Has this weapon family hit this terrain kind during the run (per family: "molotov on gas").
  P.Weapons6.seen = function (s, fam, kind) { var W = s.ws; return !!(W && W.seen && W.seen[fam + ':' + kind]); };

  // ---------- eligibility (overrides progression.js evolutionFor; same contract plus terrain and unlock) ----------
  // Passive evolutions need the paired passive. Terrain evolutions need the kind seen this run and the journey level.
  P.Weapons6.evoReady = function (s, id) {
    var E = P.CFG.evolutions[id], h = s.hero;
    if (!E) return false;
    if (E.terrain) return P.Weapons6.seen(s, E.from, E.terrain) && P.Weapons6.evoUnlocked(s, id);
    return (h.passives[E.passive] || 0) > 0;
  };
  // Journey unlock for terrain evolutions (?arsenal=1 debug unlocks everything).
  P.Weapons6.evoUnlocked = function (s, id) { return P.CFG.debugAllWeapons || (s.levelIndex || 1) >= (P.CFG.evolutions[id].unlock || 1); };

  P.Progression.evolutionFor = function (s) {
    var h = s.hero, max = P.CFG.maxItemLevel, evo = h.evolved || {}, owned = Object.keys(h.weapons);
    for (var i = 0; i < owned.length; i++) {
      var base = owned[i];
      if ((h.weapons[base] || 0) < max || evo[base]) continue;
      for (var id in P.CFG.evolutions) {
        var E = P.CFG.evolutions[id];
        if (E.from !== base || h.weapons[id] || !P.Weapons6.evoReady(s, id)) continue;
        return { id: 'w:' + id, item: id, next: max, evo: base, w: 0 };
      }
    }
    return null;
  };

  // Card hint: what an evolution of this base still needs (null when none, or already evolved). Lane F renders it.
  P.Weapons.evoHint = function (base, s) {
    var h = s.hero, evo = h.evolved || {}, max = P.CFG.maxItemLevel, out = [];
    if (evo[base] || !P.CFG.weapons[base] || P.CFG.weapons[base].evo) return null;
    for (var id in P.CFG.evolutions) {
      var E = P.CFG.evolutions[id];
      if (E.from !== base || h.weapons[id]) continue;
      var need = [];
      if ((h.weapons[base] || 0) < max) need.push(P.t('evo.need.level', { lv: max }));
      if (E.terrain) {
        if (!P.Weapons6.seen(s, E.from, E.terrain)) need.push(P.t('evo.need.terrain', { terrain: P.t('terrain.' + E.terrain) }));
        if (!P.Weapons6.evoUnlocked(s, id)) need.push(P.t('evo.need.unlock', { lv: E.unlock }));
      } else if (!((h.passives[E.passive] || 0) > 0)) need.push(P.t('evo.need.passive', { passive: P.t('item.' + E.passive) }));
      out.push({ id: id, name: P.t('item.' + id), need: need, ready: need.length === 0 });
    }
    if (!out.length) return null;
    return out.map(function (o) {
      return P.t('evo.hint', { evo: o.name, need: o.ready ? P.t('evo.ready') : o.need.join(', ') });
    }).join(' · ');
  };

  // ---------- burn and arcs ----------
  P.Weapons6.burnAround = function (s, x, y, r, n) {
    s.enemies.forEach(function (e) {
      if (e.dead || e.state !== 'active' || Math.hypot(e.x - x, e.y - y) - e.r > r) return;
      for (var k = 0; k < n; k++) P.Combat.addBurn(e);
    });
  };

  // Electric arcs from a struck enemy to the nearest others (arcchain). wet adds lv.wetArcs more jumps.
  P.Weapons6.arcFrom = function (s, e, lv, src, wet) {
    var n = lv.arcN + (wet ? (lv.wetArcs || 0) : 0), taken = [e], cur = e, dmg = P.Weapons.dmgFor(s, 'chain', lv.arcDmg), k, t, dx, dy, d;
    for (k = 0; k < n; k++) {
      t = P.Weapons2.nearestFree(s, cur.x, cur.y, lv.arcR, taken);
      if (!t) break;
      taken.push(t);
      dx = t.x - cur.x; dy = t.y - cur.y; d = Math.hypot(dx, dy) || 1;
      s.events.push({ type: 'arcZap', x0: cur.x, y0: cur.y, x1: t.x, y1: t.y, tag: 'electric', n: k });
      P.Combat.damageEnemy(s, t, dmg, dx / d, dy / d, 0, false, src);
      cur = t;
    }
  };

  // ---------- stormshield: an orbit arc zaps the nearest enemies every `every` seconds ----------
  function zapNearest(s, lv, n, src) {
    var h = s.hero, A = P.Mods.act(s, 'cable'), dmg = P.Weapons.dmgFor(s, 'cable', lv.dmg) * A.dmg, picks = [], k, t, dx, dy, d;
    for (k = 0; k < n; k++) {
      t = P.Weapons2.nearestFree(s, h.x, h.y, lv.zapR, picks);
      if (!t) break;
      picks.push(t);
      dx = t.x - h.x; dy = t.y - h.y; d = Math.hypot(dx, dy) || 1;
      P.Mods.hit(s, t, dmg, dx / d, dy / d, 0.1, src, A);
      if (!t.dead) P.Status.apply(t, 'stun', lv.stun, 1);
      s.events.push({ type: 'stormZap', x0: h.x, y0: h.y, x1: t.x, y1: t.y, n: k, orbitR: lv.orbitR, tag: 'electric' });
    }
    if (picks.length) P.Weapons.fired(s, 'cable', Math.atan2(picks[0].y - h.y, picks[0].x - h.x), picks.length, 'stormshield');
    return picks.length;
  }

  function updateStorm(s, dt) {
    var h = s.hero, lv = P.Weapons.level(h, 'stormshield'), W = P.Weapons.state(s);
    if (!lv || P.Weapons.variantOf(h, 'cable') !== 'stormshield') return;
    if (W.stormT === undefined) W.stormT = lv.every;
    W.stormT -= dt;
    if (W.stormT > 0) return;
    W.stormT += lv.every;
    zapNearest(s, lv, lv.zaps, 'stormshield');
  }

  // A dodge also zaps once (Nazar charm + stormshield).
  P.Weapons6.dodgeZap = function (s) {
    var h = s.hero, lv = P.Weapons.level(h, 'stormshield');
    if (!lv || P.Weapons.variantOf(h, 'cable') !== 'stormshield') return;
    zapNearest(s, lv, lv.dodgeZap, 'stormshield');
  };

  // ---------- netspear: pinned enemies are roped together; a share of the damage one takes goes to the rest ----------
  // Called when a netspear pin lands: the rope holds every live enemy within netR of the pin.
  P.Weapons6.netGroup = function (s, pin, lv, root) {
    var W = P.Weapons.state(s), members = [pin];
    s.enemies.forEach(function (o) {
      if (o === pin || o.dead || o.state !== 'active') return;
      if (Math.hypot(o.x - pin.x, o.y - pin.y) <= lv.netR) members.push(o);
    });
    if (members.length < 2) return;
    members.forEach(function (m) { m.netPrev = m.hp; });
    (W.nets = W.nets || []).push({ members: members, share: lv.netShare, t: 0, T: root + P.CFG.evoFx.netLinkT, acc: 0 });
    s.events.push({ type: 'netLink', x: pin.x, y: pin.y, n: members.length, tag: 'blade' });
  };

  // Each step: the damage a rope member took since the last check is shared (netShare) with the other members.
  function updateNets(s, dt) {
    var list = P.Weapons.state(s).nets || [], i, net, m, lost, j, share, k;
    for (i = list.length - 1; i >= 0; i--) {
      net = list[i]; net.t += dt;
      if (net.t >= net.T) { list.splice(i, 1); continue; }
      lost = net.members.map(function (e) {
        var d = e.netPrev !== undefined ? Math.max(0, e.netPrev - e.hp) : 0;
        e.netPrev = e.hp;
        return e.dead || e.state !== 'active' ? 0 : d;
      });
      for (k = 0; k < net.members.length; k++) {
        if (lost[k] <= 0) continue;
        m = net.members[k];
        for (j = 0; j < net.members.length; j++) {
          if (j === k) continue;
          var o = net.members[j];
          if (o.dead || o.state !== 'active') continue;
          share = lost[k] * net.share / ((1 + P.Combat.might(s)) * (o.armour || 1));
          P.Combat.damageEnemy(s, o, share, 0, 0, 0, false, 'netspear');
          o.netPrev = o.hp;
        }
        m.netPrev = m.hp;
      }
    }
  }

  // ---------- lake: fire pools that touch merge into one lake; enemies inside are slowed ----------
  // A pool carries lv (its level entry: lakeMerge, lakeSlow) when it is a lake pool (set in weapons2.js shatter).
  function updateLakes(s) {
    var list = P.Weapons.state(s).pools || [], i, j, a, b, K = P.CFG.evoFx;
    for (i = 0; i < list.length; i++) {
      a = list[i];
      if (!a.lv || a.lv.lakeLife === undefined) continue;
      for (j = list.length - 1; j > i; j--) {
        b = list[j];
        if (!b.lv || Math.hypot(a.x - b.x, a.y - b.y) > a.r + b.r + K.lakeMergePad) continue;
        a.r = Math.max(a.r, b.r) * (a.lv.lakeMerge || 1); a.t = Math.max(a.t, b.t); a.T = Math.max(a.T, b.T);
        a.x = (a.x + b.x) / 2; a.y = (a.y + b.y) / 2;
        s.events.push({ type: 'lakeMerge', x: a.x, y: a.y, r: a.r, tag: 'fire' });
        list.splice(j, 1);
      }
      s.enemies.forEach(function (e) {
        if (e.dead || e.state !== 'active' || Math.hypot(e.x - a.x, e.y - a.y) - e.r > a.r) return;
        P.Status.apply(e, 'slow', K.lakeSlowHold, a.lv.lakeSlow);
      });
    }
  }

  // ---------- foamstorm: a foam wall in front of Arda blocks enemy spit inside its cone for T seconds ----------
  P.Weapons6.foamWall = function (s, a, arc, range, T) {
    var h = s.hero, W = P.Weapons.state(s);
    (W.walls = W.walls || []).push({ x: h.x, y: h.y, a: a, arc: arc, range: range, t: 0, T: T });
  };
  function blockShots(s, w) {
    var cosHalf = Math.cos(w.arc * Math.PI / 360), ax = Math.cos(w.a), ay = Math.sin(w.a), i, q, dx, dy, d;
    for (i = s.enemyShots.length - 1; i >= 0; i--) {
      q = s.enemyShots[i]; dx = q.x - w.x; dy = q.y - w.y; d = Math.hypot(dx, dy);
      if (d > w.range || (d > 0.05 && (dx * ax + dy * ay) / d < cosHalf)) continue;
      s.enemyShots.splice(i, 1);
      s.events.push({ type: 'spitBlock', x: q.x, y: q.y });
    }
  }
  function updateWalls(s, dt) {
    var list = P.Weapons.state(s).walls || [], i, w;
    for (i = list.length - 1; i >= 0; i--) {
      w = list[i]; w.t += dt;
      blockShots(s, w);
      if (w.t >= w.T) list.splice(i, 1);
    }
  }

  // ---------- step ----------
  P.Weapons6.step = function (s, dt) {
    updateStorm(s, dt);
    updateNets(s, dt);
    updateLakes(s);
    updateWalls(s, dt);
  };
})();
