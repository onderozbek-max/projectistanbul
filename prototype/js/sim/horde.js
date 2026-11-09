// Horde director (lane H, WAVE3, AUDIT-7 G-1): on-screen density for generated levels (s.geo). P.Director.step calls
// P.Horde.step after P.Levels.step. Ambient spawns top the camera frame (plus a margin) up to a target. Surges are announced
// first (a scream, a shop alarm or a horn: a ring at the side edge, a sound and a call-out), then fodder comes in from that
// side. Boss arenas keep a stream of adds. A new enemy type's first sighting pauses the ambient spawns for a moment.
// Own rng stream (s.rng.horde), so the level's streams do not change. Numbers: config-horde.js. The sim never reads settings.
P.Horde = {};

(function (Hd) {
  var KINDS = ['scream', 'alarm', 'horn'];
  function cfg() { return P.CFG.horde; }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function rng(s) {
    return s.rng.horde || (s.rng.horde = P.makeRng((Math.imul((s.seed >>> 0) ^ 0x4F0E1D3B, 2654435761) + (s.levelIndex || 0) * 92821) >>> 0));
  }
  function state(s) {
    return s.horde || (s.horde = { budget: 0, queue: [], marks: {}, surges: 0, debutT: 0, seen: {}, spawned: 0, miss: 0 });
  }

  // The camera frame as the view draws it for generated levels (fx.js targetY, cam.w, cam.x = 0).
  function frame(s) {
    var V = P.CFG.view, w = s.dir.zoomOut ? V.holdWidthM : V.widthM, half = P.viewHalfH(w), h = s.hero, G = s.geo;
    var look = h.moving ? h.fy * V.lookAhead : 0;
    return { w: w, half: half, cy: Math.min(Math.max(h.y + look, half - 3), G.length + 2 - half) };
  }

  // Live enemies inside the frame, or within m metres above and below it (m = 0: on screen). Only the vertical margin:
  // spawns come from ahead and behind, and a side margin would double the count.
  function count(s, fr, m) {
    var n = 0, hw = fr.w / 2, hh = fr.half + m, list = s.enemies;
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      if (e.dead || e.state === 'dormant') continue;
      if (Math.abs(e.x) <= hw && Math.abs(e.y - fr.cy) <= hh) n++;
    }
    return n;
  }

  // Plain walkers and runners (horde fodder or route spawns) that the hero has left far behind are removed: no XP, no kill.
  // They would only accumulate and cost step time. Set pieces, elites, bosses and special types are never culled.
  function cullable(e) {
    return (e.fodder || e.type === 'walker' || e.type === 'runner') && !e.evId && !e.anchored && !e.elite && !e.boss &&
      !e.lure && !e.lootEv && !e.civ && !e.entrance;
  }
  function cull(s, fr) {
    var lim = fr.cy - fr.half - cfg().ctl.cullBehind, list = s.enemies;
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      if (e.y < lim && !e.dead && cullable(e)) e.dead = true;
    }
  }

  function blocked(G, x, y, r) {
    return G.blocks.some(function (b) { return x > b.rc.xMin - r && x < b.rc.xMax + r && y > b.rc.yMin - r && y < b.rc.yMax + r; });
  }

  function skin(s) {
    var sk = s.gen && s.gen.skins;
    return sk && sk.length ? sk[rng(s).int(0, sk.length - 1)] : null;
  }

  // Fodder: weak and many (config-horde.js fodder). Applied after spawnEnemy, so the level's HP curve still sets the base.
  function fodder(e) { var F = cfg().fodder; e.hp *= F.hpMul; e.maxHp = e.hp; e.xp *= F.xpMul; }

  // Daily and level modifiers scale the route's spawns (modifiers.js multiplies s.diff.spawn); the horde follows them.
  function modMul(s) {
    var base = P.Levels && P.Levels.difficulty ? P.Levels.difficulty(s.levelIndex).spawn : 1;
    return s.diff && base ? s.diff.spawn / base : 1;
  }

  // On-screen count (the probe and tests read this).
  Hd.onScreen = function (s) { return s.geo ? count(s, frame(s), 0) : 0; };

  // Target on-screen count now. 0 = no ambient spawns (arena over, gate open, not playing).
  Hd.target = function (s) {
    var H = cfg(), G = s.geo, g = s.gen, k = Math.max(0, s.levelIndex - 1), t, f, m, P3 = H.profile, mm;
    if (!G || s.mode !== 'play' || s.props.shutterOpen) return 0;
    mm = modMul(s);
    if (G.boss && g && g.arena) {                       // boss arena: adds around the boss while it lives
      if (!g.boss || g.boss.dead) return 0;
      return mm * Math.min(H.arena.cap, H.arena.base + H.arena.perLevel * k);
    }
    if (s.dir.hold.active) {                            // the finale (route levels; boss levels have no hold)
      t = clamp01(s.dir.hold.t / Math.max(1, G.holdT));
      f = H.hold.start + (1 - H.hold.start) * clamp01(t / H.hold.ramp);
      return mm * Math.min(H.hold.cap, H.hold.base + H.hold.perLevel * k) * f;
    }
    var p = clamp01(s.hero.y / Math.max(1, G.holdY));   // route (boss levels: up to the arena's approach)
    m = p < 0.5 ? P3[0] + (P3[1] - P3[0]) * (p / 0.5) : P3[1] + (P3[2] - P3[1]) * ((p - 0.5) / 0.5);
    return mm * Math.min(H.on.cap, H.on.base + H.on.perLevel * k) * m;
  };

  // Off-screen spawn spot: ahead, behind (groan cue) or at a side wall. Never in a block or past the gate.
  function spot(s, fr, R, behindShare, sideShare) {
    var H = cfg().ctl, G = s.geo, lim = G.exitY - H.exitGap, pt = null;
    for (var k = 0; k < H.tries && !pt; k++) {
      var x, y, behind = false;
      if (R.next() < sideShare) { x = (R.chance(0.5) ? 1 : -1) * H.sideX; y = fr.cy + R.range(-fr.half, fr.half); }
      else {
        x = R.range(G.xMin + 1, G.xMax - 1);
        behind = R.next() < behindShare;
        y = fr.cy + (behind ? -1 : 1) * (fr.half + R.range(H.aheadMin, H.aheadMax));
      }
      if (y < H.minY || y > lim || blocked(G, x, y, H.blockR)) continue;
      pt = { x: x, y: y, behind: behind };
    }
    return pt;
  }

  function spawnAmbient(s, fr) {
    var R = rng(s), H = cfg().ctl, hold = s.dir.hold.active || !!(s.gen && s.gen.arena), St = state(s);
    var pt = spot(s, fr, R, hold ? H.behindHold : H.behindShare, H.sideShare);
    if (!pt) { St.miss++; return false; }
    St.spawned++;
    s.routeSpawn = true;                                   // enemies3.js: an ambient spawn may come from a manhole or window
    var e = P.Combat.spawnEnemy(s, R.chance(H.runnerShare) ? 'runner' : 'walker', pt.x, pt.y, { skin: skin(s) });
    s.routeSpawn = false;
    fodder(e);
    if (pt.behind) s.events.push({ type: 'groan', x: pt.x, y: pt.y });
    return true;
  }

  // Ambient controller: rate = min(max, gain x deficit) per second, where the deficit is target x nearMul minus the
  // enemies inside the frame plus margin. Spawns stop at the horde cap. The budget caps at `burst` so a pause does not
  // release a flood.
  function ambient(s, S, fr, dt) {
    var H = cfg().ctl, target = Hd.target(s), need, rate;
    if (target <= 0) { S.budget = 0; return; }
    need = target * H.nearMul - count(s, fr, H.margin);
    if (need <= 0) { S.budget = 0; return; }
    rate = Math.min(s.dir.hold.active ? H.holdMax : H.max, H.gain * need);   // the finale gets its own spawn limit
    S.budget = Math.min(H.burst, S.budget + rate * dt);
    while (S.budget >= 1 && need >= 1 && s.enemies.length < H.cap) {
      if (!spawnAmbient(s, fr)) break;
      S.budget -= 1; need -= 1;
    }
  }

  // ---------- surges: cue, then fodder from that side ----------
  function startSurge(s, fr) {
    var H = cfg().surge, R = rng(s), side = R.chance(0.5) ? 1 : -1, kind = KINDS[R.int(0, KINDS.length - 1)];
    var x = side * (fr.w / 2 - H.cueInset), y = fr.cy + fr.half * H.cueY, n = Math.min(H.cap, H.base + H.perLevel * Math.max(0, s.levelIndex - 1));
    s.enemyTele.push({ kind: 'ring', x: x, y: y, r: H.cueR, t: 0, T: H.lead, then: 'surge', owner: 0, col: 'summon', side: side, n: n });
    s.events.push({ type: 'hordeCue', cue: kind, side: side, x: x, y: y, T: H.lead });
  }

  // Called when the cue ring resolves (enemies.js onTele): queue the fodder, spread over the spread time.
  Hd.arrive = function (s, tg) {
    var S = state(s), H = cfg().surge, i;
    for (i = 0; i < tg.n; i++) S.queue.push({ due: s.runT + H.spread * (i + 0.5) / tg.n, side: tg.side });
    S.surges++;
    s.events.push({ type: 'hordeSurge', side: tg.side, n: tg.n, x: tg.side * H.letterX, y: s.hero.y + H.letterY });
  };

  function surgeOne(s, R, fr, side) {
    var H = cfg().surge, G = s.geo, lim = G.exitY - cfg().ctl.exitGap, pt = null;
    for (var k = 0; k < cfg().ctl.tries && !pt; k++) {
      var x = side * cfg().ctl.sideX, y = fr.cy + R.range(fr.half * H.spreadY[0], fr.half * H.spreadY[1]);
      if (y > cfg().ctl.minY && y < lim && !blocked(G, x, y, cfg().ctl.blockR)) pt = { x: x, y: y };
    }
    if (!pt) return;
    var e = P.Combat.spawnEnemy(s, R.chance(H.runnerShare) ? 'runner' : 'walker', pt.x, pt.y, { skin: skin(s) });
    fodder(e);
  }

  function tickQueue(s, S, fr) {
    var R = rng(s), i;
    for (i = S.queue.length - 1; i >= 0; i--) {
      var q = S.queue[i];
      if (s.runT < q.due) continue;
      S.queue.splice(i, 1);
      if (s.enemies.length < cfg().ctl.cap) surgeOne(s, R, fr, q.side);
    }
  }

  // Surge marks: route progress (y / hold y) and the hold's start and middle. Each mark fires once.
  function marks(s, S, fr) {
    var H = cfg().surge, G = s.geo, i, key, p;
    if ((G.boss && s.gen.arena) || s.props.shutterOpen || s.mode !== 'play') return;
    if (s.dir.hold.active) {
      for (i = 0; i < H.holdAt.length; i++) {
        key = 'h' + i;
        if (!S.marks[key] && s.dir.hold.t >= H.holdAt[i] * G.holdT) { S.marks[key] = true; startSurge(s, fr); }
      }
      return;
    }
    p = s.hero.y / Math.max(1, G.holdY);
    for (i = 0; i < H.marks.length; i++) {
      key = 'r' + i;
      if (!S.marks[key] && p >= H.marks[i]) { S.marks[key] = true; startSurge(s, fr); }
    }
  }

  // ---------- first sighting ----------
  // Called from enemies.js, enemies2.js and enemies3.js for the new types on their first spawn in a run: a call-out, and
  // the ambient spawns pause for debutHold seconds so the newcomer arrives on its own.
  Hd.debut = function (s, e) {
    if (!s.geo) return;
    var S = state(s);
    if (S.seen[e.type]) return;
    S.seen[e.type] = true;
    S.debutT = cfg().debutHold;
    s.events.push({ type: 'enemyDebut', enemy: e.type, id: e.id, x: e.x, y: e.y });
  };

  // ---------- per step (director.js, generated levels) ----------
  Hd.step = function (s, dt) {
    if (!s.geo || s.mode !== 'play') return;
    var S = state(s), fr = frame(s);
    cull(s, fr);
    tickQueue(s, S, fr);
    marks(s, S, fr);
    if (S.debutT > 0) { S.debutT -= dt; return; }
    ambient(s, S, fr, dt);
  };
})(P.Horde);
