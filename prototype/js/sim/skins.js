// Skin behaviours (R1 wave 1): fisher (hook line, sim/skins-fisher.js), musician (walkers near it speed up), hamal (rear
// armour, slow, crate on death). Numbers: P.CFG.skins (config-skins.js). Each behaviour is rolled once at spawn (init), with
// a cap on live behaviour enemies per skin. Hooks: P.Enemies.init / think / frame / onDeath (enemies.js), P.Combat.damageEnemy
// (hitMul), updateEnemies (buffMul). Generated levels only (s.gen): the sim never reads language or quality settings.
(function () {
  P.Skins = {};

  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function live(e) { return !e.dead && e.state === 'active'; }

  // Roll at spawn: the skin must be in the table, the type and hood must qualify, the cap must have room, and the chance
  // must hit. The ai stream is drawn only for an eligible spawn, so levels without these skins play exactly as before.
  P.Skins.init = function (s, e) {
    var K = e.skin && P.CFG.skins[e.skin];
    if (!K || !s.gen || K.types.indexOf(e.type) < 0 || s.gen.info.hoodIndex < K.minHood) return;
    if (countLive(s, e.skin) >= K.maxAlive || !s.rng.ai.chance(K.chance)) return;
    e.skinBeh = e.skin;
    if (e.skin === 'fisher') P.Skins.fisherInit(s, e);
    else if (e.skin === 'musician') e.buffMul = 1;
    else if (e.skin === 'hamal') e.speed *= K.speedMul;
  };

  function countLive(s, skin) {
    var n = 0;
    for (var i = 0; i < s.enemies.length; i++) if (s.enemies[i].skinBeh === skin && !s.enemies[i].dead) n++;
    return n;
  }

  // Per-enemy step (enemies.js think). Returns true only while a fisher holds still to cast; false = default chase.
  P.Skins.think = function (s, e, dt) {
    return e.skinBeh === 'fisher' ? P.Skins.fisherThink(s, e, dt) : false;
  };

  // Per-step frame (enemies.js frame, after the enemies moved): musician buffs, crates, the hook pull.
  P.Skins.frame = function (s, dt) {
    musicianFrame(s);
    crateFrame(s, dt);
    P.Skins.fisherFrame(s, dt);
  };

  // Musician: a walker inside radius of a living musician gets buffMul = speedMul (updateEnemies). Recomputed every step,
  // so the buff ends in the step the musician dies.
  function musicianFrame(s) {
    var K = P.CFG.skins.musician, list = s.enemies, ms = [], i, j, e, m;
    for (i = 0; i < list.length; i++) if (list[i].skinBeh === 'musician' && live(list[i])) ms.push(list[i]);
    for (i = 0; i < list.length; i++) {
      e = list[i];
      e.buffMul = 1;
      for (j = 0; j < ms.length; j++) {
        m = ms[j];
        if (m !== e && dist(e, m) <= K.radius) { e.buffMul = K.speedMul; break; }
      }
    }
  }

  // Hamal rear armour: the damage factor for a hit on this enemy. The hero standing in the back half-plane of its heading
  // (its velocity) takes rearMul; no heading (standing still) means full damage.
  P.Skins.hitMul = function (s, e) {
    if (e.skinBeh !== 'hamal') return 1;
    var K = P.CFG.skins.hamal, h = s.hero, sp = Math.hypot(e.vx || 0, e.vy || 0);
    if (sp < K.headMin) return 1;
    var rx = h.x - e.x, ry = h.y - e.y, d = Math.hypot(rx, ry) || 1;
    var cos = (rx * e.vx + ry * e.vy) / (d * sp);
    return cos < K.rearCos ? K.rearMul : 1;
  };

  // Death: a fisher's pending cast is withdrawn; a hamal leaves its crate.
  P.Skins.onDeath = function (s, e) {
    if (e.skinBeh === 'fisher') s.enemyTele = s.enemyTele.filter(function (t) { return t.owner !== e.id; });
    if (e.skinBeh === 'hamal') dropCrate(s, e);
  };

  // The hamal crate is a breakable cover block (P.Env.addSolid: clash-checked, path kept open). It blocks walking, and
  // expires after crateT seconds (its record is then retired).
  function dropCrate(s, e) {
    var K = P.CFG.skins.hamal, spots = [[0, 0], [0, K.crateOffset], [K.crateOffset, 0]], i, sp;
    if (!s.env || !P.Env.addSolid) return;
    if (!s.skinCrates) s.skinCrates = [];
    for (i = 0; i < spots.length; i++) {
      sp = spots[i];
      if (!P.Env.addSolid(s, K.crateKind, e.x + sp[0], e.y + sp[1], K.crateW, K.crateH)) continue;
      s.skinCrates.push({ b: s.geo.blocks[s.geo.blocks.length - 1], t: K.crateT });
      s.events.push({ type: 'crateDrop', x: e.x + sp[0], y: e.y + sp[1], w: K.crateW, h: K.crateH });
      return;
    }
  }

  function crateFrame(s, dt) {
    var L = s.skinCrates, i, c, k;
    if (!L || !L.length) return;
    for (i = L.length - 1; i >= 0; i--) {
      c = L[i];
      c.t -= dt;
      if (c.t > 0) continue;
      k = s.geo.blocks.indexOf(c.b);
      if (k >= 0) s.geo.blocks.splice(k, 1);
      if (c.b.rec) c.b.rec.alive = false;
      L.splice(i, 1);
      s.events.push({ type: 'crateGone', x: c.b.x, y: c.b.y });
    }
  }

  // Walls: a segment (ax, ay)-(bx, by) against every geo block (Liang-Barsky clip). True when nothing blocks it.
  P.Skins.losClear = function (s, ax, ay, bx, by) {
    var B = s.geo ? s.geo.blocks : [], i;
    for (i = 0; i < B.length; i++) if (segHitsBox(ax, ay, bx, by, B[i].rc)) return false;
    return true;
  };

  function segHitsBox(ax, ay, bx, by, rc) {
    var dx = bx - ax, dy = by - ay, t0 = 0, t1 = 1;
    return clipAxis(-dx, ax - rc.xMin) && clipAxis(dx, rc.xMax - ax) && clipAxis(-dy, ay - rc.yMin) && clipAxis(dy, rc.yMax - ay);
    function clipAxis(p, q) {
      var r;
      if (p === 0) return q >= 0;
      r = q / p;
      if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; }
      else { if (r < t0) return false; if (r < t1) t1 = r; }
      return true;
    }
  }

  // Blocked: no hook, no drag. Not in play (cutscene, level-up overlay), a hack in progress, or a boss still in its intro.
  P.Skins.blocked = function (s) {
    if (s.mode !== 'play') return true;
    if (s.hacks && s.hacks.some(function (x) { return x.state === 'active'; })) return true;
    return s.enemies.some(function (e) { return e.boss && !e.dead && e.state !== 'active'; });
  };
})();
