// More weapons (workstream A, v0.5): Çaycı Tepsisi (boomerang tray, glasses burst on catch), Simit Tepsisi
// (bouncing frisbee), Cezve (scalding cone + stain), Olta (hook, reel, slam), Şemsiye (canopy that blocks and
// reflects spit), Tavla Taşları (ricocheting pieces, two dice set bounces, doubles crit), Kestane Mangalı (lobbed
// embers, burning patches). Each has five levels, six mods (P.CFG.modDefs) and a signature (P.CFG.sig).
// Timed landings (glasses, embers, reflected spit) share W.embers. All numbers come from P.CFG.weapons.<id>.
// Visuals: weapons-fx4.js (events named tray*, glass*, simit*, cezve*, stainSizzle, olta*, umbrella*,
// spitReflect, tavla*, ember*).
(function () {
  var DEG = Math.PI / 180, EPS = 0.05;
  P.Weapons4 = {};

  function ws4(s) { return P.Weapons.state(s); }
  function cdSet(s, h, id, cfg, lv, A) { h.cds[id] = cfg.cooldown * (lv.cdMult || 1) * A.cd * P.Weapons.cdMult(s, id); }
  function nearestWithin(s, x, y, r, taken) {
    var best = null, bd = r;
    s.enemies.forEach(function (e) {
      if (e.dead || e.state !== 'active' || (taken && taken.indexOf(e.id) >= 0)) return;
      var d = Math.hypot(e.x - x, e.y - y);
      if (d < bd) { bd = d; best = e; }
    });
    return best;
  }

  // ---------- Çaycı Tepsisi: out and back; each pass hits; glasses burst where it is caught ----------
  function fireTray(s, dt) {
    var h = s.hero, cfg = P.CFG.weapons.tray, lv = P.Weapons.level(h, 'tray'), W = ws4(s);
    if (!lv || !P.Weapons.ready(h, 'tray', dt) || W.trays.length) return;
    var M = P.Mods.of(s, 'tray'), range = lv.range * M.range;
    var t = P.Weapons.nearestEnemy(s, h.x, h.y, range);
    if (!t) return;
    var A = P.Mods.act(s, 'tray'), a = Math.atan2(t.y - h.y, t.x - h.x);
    cdSet(s, h, 'tray', cfg, lv, A);
    W.trays.push({ x: h.x, y: h.y, ox: h.x, oy: h.y, a: a, d: 0, out: range, phase: 'out', hit: [], lv: lv, A: A,
      dmg: P.Weapons.dmgFor(s, 'tray', lv.dmg) * A.dmg, left: cfg.hitsOut + M.pierce, glass: lv.glass + M.count });
    s.events.push({ type: 'trayThrow', x: h.x, y: h.y, a: a, range: range });
    P.Mods.announce(s, A, h.x, h.y, range);
  }

  function trayHits(s, tr) {
    var cfg = P.CFG.weapons.tray;
    s.enemies.forEach(function (e) {
      if (tr.left <= 0 || e.dead || e.state !== 'active' || tr.hit.indexOf(e.id) >= 0) return;
      var dx = e.x - tr.x, dy = e.y - tr.y, d = Math.hypot(dx, dy) || EPS;
      if (d - e.r > cfg.hitR) return;
      tr.hit.push(e.id); tr.left--;
      P.Mods.hit(s, e, tr.dmg, dx / d, dy / d, cfg.hitKb, 'tray', tr.A);
      if (!e.dead) P.Status.apply(e, 'slow', cfg.slowT, cfg.slow);
    });
  }

  function turnTray(s, tr) {
    tr.phase = 'back'; tr.hit = []; tr.left = P.CFG.weapons.tray.hitsOut + tr.A.M.pierce;
    s.events.push({ type: 'trayReturn', x: tr.x, y: tr.y });
  }

  function updateTrays(s, dt) {
    var W = ws4(s), cfg = P.CFG.weapons.tray, h = s.hero, step = cfg.speed * dt;
    for (var i = W.trays.length - 1; i >= 0; i--) {
      var tr = W.trays[i];
      if (tr.phase === 'out') {
        tr.d += step; tr.x = tr.ox + Math.cos(tr.a) * tr.d; tr.y = tr.oy + Math.sin(tr.a) * tr.d;
        if (tr.d >= tr.out) turnTray(s, tr);
      } else {
        var dx = h.x - tr.x, dy = h.y - tr.y, d = Math.hypot(dx, dy);
        if (d < cfg.catchR) { W.trays.splice(i, 1); catchTray(s, tr); continue; }
        var m = Math.min(d, step * cfg.backMul);
        tr.x += dx / d * m; tr.y += dy / d * m;
      }
      trayHits(s, tr);
    }
  }

  // Glasses: burst around the catch point; signature = a ring of glasses around Arda.
  function catchTray(s, tr) {
    var W = ws4(s), cfg = P.CFG.weapons.tray, A = tr.A, r = cfg.glassR * A.area, n = tr.glass, i, a, rr;
    var rng = s.rng.combat, h = s.hero, gdmg = P.Weapons.dmgFor(s, 'tray', tr.lv.dmg * cfg.glassDmg) * A.dmg;
    if (A.sig) {
      n = A.sig.n;
      for (i = 0; i < n; i++) {
        a = i / n * Math.PI * 2; rr = cfg.ringR * A.area;
        W.embers.push({ kind: 'glass', x: h.x + Math.cos(a) * rr, y: h.y + Math.sin(a) * rr, t: 0,
          T: cfg.glassT + i * cfg.ringStagger, r: r, dmg: gdmg, kb: cfg.blastKb, A: A, src: 'tray' });
      }
    } else {
      for (i = 0; i < n; i++) {
        a = rng.range(0, Math.PI * 2); rr = r * Math.sqrt(rng.next());
        W.embers.push({ kind: 'glass', x: tr.x + Math.cos(a) * rr, y: tr.y + Math.sin(a) * rr, t: 0,
          T: cfg.glassT + i * cfg.stagger, r: r, dmg: gdmg, kb: cfg.blastKb, A: A, src: 'tray' });
      }
    }
    s.events.push({ type: 'trayCatch', x: tr.x, y: tr.y, n: n });
  }

  // Timed landings: glasses and embers blast on impact; embers leave a burning patch; reflected spit blasts only.
  function updateEmbers(s, dt) {
    var W = ws4(s), i, q;
    for (i = W.embers.length - 1; i >= 0; i--) {
      q = W.embers[i]; q.t += dt;
      if (q.t < q.T) continue;
      W.embers.splice(i, 1);
      P.Mods.blast(s, q.x, q.y, q.r, q.dmg, q.kb, q.src, q.A);
      if (q.kind === 'reflect') continue;
      P.Mods.field(s, q.x, q.y, q.r, q.A, q.dmg, q.src);
      if (q.kind === 'glass') s.events.push({ type: 'glassBurst', x: q.x, y: q.y, r: q.r });
      else landEmber(s, q);
    }
  }
  function landEmber(s, q) {
    var C = P.CFG.weapons.kestane, T = C.fireT * q.A.M.life;
    s.zones.push({ kind: 'fire', x: q.x, y: q.y, r: q.r, t: T, T: T, dps: C.fireDps });
    s.events.push({ type: 'emberLand', x: q.x, y: q.y, r: q.r });
  }

  // ---------- Simit Tepsisi: a frisbee that bounces between enemies (bounces = levels + mods) ----------
  function fireSimit(s, dt) {
    var h = s.hero, cfg = P.CFG.weapons.simittray, lv = P.Weapons.level(h, 'simittray'), W = ws4(s);
    if (!lv || !P.Weapons.ready(h, 'simittray', dt)) return;
    var M = P.Mods.of(s, 'simittray'), t = P.Weapons.nearestEnemy(s, h.x, h.y, cfg.range);
    if (!t) return;
    var A = P.Mods.act(s, 'simittray'), n = A.sig ? A.sig.n : 1, dmg = P.Weapons.dmgFor(s, 'simittray', lv.dmg) * A.dmg;
    var taken = [t.id];
    cdSet(s, h, 'simittray', cfg, lv, A);
    for (var k = 0; k < n; k++) {
      var tgt = k === 0 ? t : nearestWithin(s, h.x, h.y, cfg.range, taken);
      if (tgt) taken.push(tgt.id);
      W.simits.push({ x: h.x, y: h.y, phase: 'fly', target: tgt, hit: [], left: lv.bounces + M.bounce, A: A, dmg: dmg,
        delay: k * cfg.stagger, t: 0 });
    }
    s.events.push({ type: 'simitThrow', x: h.x, y: h.y, n: n });
    P.Mods.announce(s, A, h.x, h.y, cfg.range);
  }

  function simitRetarget(s, sm) {
    var cfg = P.CFG.weapons.simittray, nx = nearestWithin(s, sm.x, sm.y, cfg.bounceR, sm.hit);
    if (!nx || sm.left <= 0) { sm.phase = 'back'; sm.target = null; return; }
    sm.target = nx;
  }

  function simitHit(s, sm, e) {
    var cfg = P.CFG.weapons.simittray, dx = e.x - sm.x, dy = e.y - sm.y, d = Math.hypot(dx, dy) || 1;
    sm.hit.push(e.id); sm.left--;
    P.Mods.hit(s, e, sm.dmg, dx / d, dy / d, cfg.kb, 'simittray', sm.A);
    if (s.rng.combat.chance(cfg.healChance)) {
      s.drops.push({ kind: 'simit', value: P.CFG.drops.simitHeal, x: e.x, y: e.y, mag: false, pop: cfg.dropPop });
    }
    s.events.push({ type: 'simitBounce', x: e.x, y: e.y, n: sm.hit.length });
    simitRetarget(s, sm);
  }

  function updateSimits(s, dt) {
    var W = ws4(s), cfg = P.CFG.weapons.simittray, h = s.hero, step = cfg.speed * dt;
    for (var i = W.simits.length - 1; i >= 0; i--) {
      var sm = W.simits[i];
      sm.t += dt;
      if (sm.t < sm.delay) continue;
      if (sm.phase === 'fly') {
        var tg = sm.target;
        if (!tg || tg.dead || tg.state !== 'active') { simitRetarget(s, sm); continue; }
        var dx = tg.x - sm.x, dy = tg.y - sm.y, d = Math.hypot(dx, dy) || EPS;
        if (d - tg.r <= cfg.hitR) simitHit(s, sm, tg);
        else { var m = Math.min(d, step); sm.x += dx / d * m; sm.y += dy / d * m; }
      } else {
        var bx = h.x - sm.x, by = h.y - sm.y, bd = Math.hypot(bx, by) || EPS;
        if (bd < cfg.catchR) { W.simits.splice(i, 1); continue; }
        var bm = Math.min(bd, step * cfg.backMul);
        sm.x += bx / bd * bm; sm.y += by / bd * bm;
      }
    }
  }

  // ---------- Cezve: a scalding pour in a cone (ticks), then a stain that burns for a while ----------
  function firePour(s, a, lv, A, range, arc) {
    var cfg = P.CFG.weapons.cezve, W = ws4(s);
    W.boils.push({ a: a, A: A, range: range, arc: arc, t: 0, ticks: A.sig ? cfg.sigTicks : cfg.ticks, tickT: 0,
      done: false, dmg: P.Weapons.dmgFor(s, 'cezve', lv.dmg) * A.dmg });
  }

  function fireCezve(s, dt) {
    var h = s.hero, cfg = P.CFG.weapons.cezve, lv = P.Weapons.level(h, 'cezve');
    if (!lv || !P.Weapons.ready(h, 'cezve', dt)) return;
    var M = P.Mods.of(s, 'cezve'), t = P.Weapons.nearestEnemy(s, h.x, h.y, lv.range * M.area);
    if (!t) return;
    var A = P.Mods.act(s, 'cezve'), a = Math.atan2(t.y - h.y, t.x - h.x), range = lv.range * A.area;
    var arc = A.sig ? A.sig.arc : lv.arcDeg;
    cdSet(s, h, 'cezve', cfg, lv, A);
    firePour(s, a, lv, A, range, arc);
    s.events.push({ type: 'cezvePour', x: h.x, y: h.y, a: a, range: range, arc: arc });
    P.Mods.announce(s, A, h.x, h.y, range);
  }

  function pourTick(s, bo) {
    var h = s.hero, cfg = P.CFG.weapons.cezve, cosHalf = Math.cos(bo.arc / 2 * DEG), ax = Math.cos(bo.a), ay = Math.sin(bo.a);
    s.enemies.forEach(function (e) {
      if (e.dead || e.state !== 'active') return;
      var dx = e.x - h.x, dy = e.y - h.y, d = Math.hypot(dx, dy);
      if (d - e.r > bo.range || (d > EPS && (dx * ax + dy * ay) / d < cosHalf)) return;
      P.Mods.hit(s, e, bo.dmg, dx / (d || 1), dy / (d || 1), cfg.pourKb, 'cezve', bo.A);
    });
  }

  function stain(s, bo) {
    var cfg = P.CFG.weapons.cezve, sx = s.hero.x + Math.cos(bo.a) * bo.range * cfg.stainAt,
      sy = s.hero.y + Math.sin(bo.a) * bo.range * cfg.stainAt, r = cfg.stainR * bo.A.area, T = cfg.stainT * bo.A.M.life;
    bo.done = true;
    s.zones.push({ kind: 'scald', x: sx, y: sy, r: r, t: T, T: T, hit: {} });
    P.Mods.field(s, sx, sy, r, bo.A, bo.dmg, 'cezve');
    s.events.push({ type: 'stainSizzle', x: sx, y: sy, r: r, T: T });
  }

  function updateBoils(s, dt) {
    var W = ws4(s), cfg = P.CFG.weapons.cezve, i, bo;
    for (i = W.boils.length - 1; i >= 0; i--) {
      bo = W.boils[i];
      bo.t += dt; bo.tickT -= dt;
      if (bo.ticks > 0 && bo.tickT <= 0) { bo.ticks--; bo.tickT += cfg.tick; pourTick(s, bo); }
      if (bo.ticks <= 0 && !bo.done) stain(s, bo);
      if (bo.done && bo.t > cfg.pourT + cfg.lingerT) W.boils.splice(i, 1);
    }
  }

  // ---------- Olta: cast a hook to the nearest, it sticks, reels the target in and slams it down ----------
  function fireOlta(s, dt) {
    var h = s.hero, cfg = P.CFG.weapons.olta, lv = P.Weapons.level(h, 'olta'), W = ws4(s);
    if (!lv || !P.Weapons.ready(h, 'olta', dt)) return;
    var t = P.Weapons.nearestEnemy(s, h.x, h.y, cfg.range);
    if (!t) return;
    var A = P.Mods.act(s, 'olta'), n = 1 + A.M.count, taken = [];
    cdSet(s, h, 'olta', cfg, lv, A);
    for (var k = 0; k < n; k++) {
      var tg = k === 0 ? t : nearestWithin(s, h.x, h.y, cfg.range, taken);
      if (!tg) break;
      taken.push(tg.id);
      var d = Math.hypot(tg.x - h.x, tg.y - h.y);
      W.hooks.push({ phase: 'cast', e: tg, t: 0, T: Math.max(cfg.minCastT, d / cfg.castSpeed), lv: lv, A: A,
        dmg: P.Weapons.dmgFor(s, 'olta', lv.dmg) * A.dmg, reelDist: lv.reel * A.M.reel, rt: 0 });
    }
    s.events.push({ type: 'oltaCast', x: h.x, y: h.y, tx: t.x, ty: t.y, n: n });
  }

  function updateHooks(s, dt) {
    var W = ws4(s), i, hk;
    for (i = W.hooks.length - 1; i >= 0; i--) {
      hk = W.hooks[i]; hk.t += dt;
      if (hk.phase === 'cast') castStep(s, hk);
      else if (hk.phase === 'reel') reelStep(s, hk, dt);
      if (hk.phase === 'slam') { slamHook(s, hk); W.hooks.splice(i, 1); }
    }
  }

  function castStep(s, hk) {
    var cfg = P.CFG.weapons.olta, e = hk.e;
    if (hk.t < hk.T) return;
    var alive = !e.dead && e.state === 'active';
    hk.phase = alive ? 'reel' : 'slam'; hk.t = 0;
    if (alive) { P.Status.apply(e, 'stun', cfg.stagger, 1); s.events.push({ type: 'oltaSet', x: e.x, y: e.y }); }
  }

  function reelStep(s, hk, dt) {
    var cfg = P.CFG.weapons.olta, e = hk.e, h = s.hero;
    if (e.dead || e.state !== 'active') { hk.phase = 'slam'; return; }
    var dx = h.x - e.x, dy = h.y - e.y, d = Math.hypot(dx, dy) || EPS, room = d - cfg.reelStop;
    var pull = Math.min(room, hk.reelDist / cfg.reelT * dt);
    if (pull > 0) { e.x += dx / d * pull; e.y += dy / d * pull; P.World.clampWalk(e, e.r, s.props); }
    hk.rt += dt;
    if (hk.rt >= cfg.reelEvT) { hk.rt = 0; s.events.push({ type: 'oltaReel', x: e.x, y: e.y }); }
    if (hk.t >= cfg.reelT || room <= 0) hk.phase = 'slam';
  }

  // Slam: a blast at the hook's end. Signature "leviathan" also hits whatever lies along the line from Arda.
  function slamHook(s, hk) {
    var cfg = P.CFG.weapons.olta, e = hk.e, x = e.x, y = e.y, A = hk.A, r = cfg.slamR * A.area, h = s.hero;
    P.Mods.blast(s, x, y, r, hk.dmg, cfg.slamKb * P.Weapons.kbMult(s), 'olta', A);
    if (A.sig) {
      s.enemies.forEach(function (o) {
        if (o === e || o.dead || o.state !== 'active') return;
        if (P.Weapons3.segDist(o.x, o.y, h.x, h.y, x, y) <= o.r + cfg.sigLineR) {
          P.Mods.hit(s, o, hk.dmg * cfg.sigDmg, o.x - x, o.y - y, cfg.sigKb, 'olta', A);
        }
      });
    }
    s.events.push({ type: 'oltaSlam', x: x, y: y, r: r, sig: !!A.sig });
    P.Mods.announce(s, A, x, y, r);
  }

  // ---------- Şemsiye: a canopy opens toward the nearest threat, shoves what presses in, reflects spit ----------
  function fireSemsiye(s, dt) {
    var h = s.hero, cfg = P.CFG.weapons.semsiye, lv = P.Weapons.level(h, 'semsiye'), W = ws4(s);
    if (!lv || !P.Weapons.ready(h, 'semsiye', dt) || W.umbrellas.length) return;
    var t = P.Weapons.nearestEnemy(s, h.x, h.y, cfg.trigR), shot = null;
    s.enemyShots.forEach(function (q) { if (!shot && Math.hypot(q.x - h.x, q.y - h.y) < cfg.trigR) shot = q; });
    var thr = t || shot;
    if (!thr) return;
    var M = P.Mods.of(s, 'semsiye'), A = P.Mods.act(s, 'semsiye'), sig = A.sig, a = Math.atan2(thr.y - h.y, thr.x - h.x);
    cdSet(s, h, 'semsiye', cfg, lv, A);
    var T = (sig ? sig.T : lv.openT) * M.life, radius = lv.radius * A.area;
    W.umbrellas.push({ a: a, t: 0, T: T, A: A, arc: sig ? cfg.fullArc : lv.arcDeg, radius: radius,
      dmg: P.Weapons.dmgFor(s, 'semsiye', lv.dmg) * A.dmg });
    s.events.push({ type: 'umbrellaOpen', x: h.x, y: h.y, a: a, radius: radius, T: T });
    P.Mods.announce(s, A, h.x, h.y, radius);
  }

  // Inside the canopy: within radius (plus slack) and inside the arc.
  function inUmbrella(u, h, x, y, slack) {
    var dx = x - h.x, dy = y - h.y, d = Math.hypot(dx, dy);
    if (d > u.radius + slack) return false;
    if (d < EPS) return true;
    var da = Math.atan2(dy, dx), diff = Math.abs(Math.atan2(Math.sin(da - u.a), Math.cos(da - u.a)));
    return diff <= u.arc / 2 * DEG;
  }

  function reflectShots(s, u) {
    var h = s.hero, C = P.CFG.weapons.semsiye, i, q, mul;
    for (i = s.enemyShots.length - 1; i >= 0; i--) {
      q = s.enemyShots[i];
      if (!inUmbrella(u, h, q.x, q.y, C.reflectR)) continue;
      s.enemyShots.splice(i, 1);
      mul = u.A.M.reflect ? u.A.M.reflect.mul : 1;
      ws4(s).embers.push({ kind: 'reflect', x: q.x0, y: q.y0, t: 0, T: C.reflectT, r: C.reflectBlastR * u.A.area,
        dmg: u.dmg * mul, kb: C.blastKb, A: u.A, src: 'semsiye' });
      s.events.push({ type: 'spitReflect', x0: q.x0, y0: q.y0, x: q.x, y: q.y });
    }
  }

  // Pressed-in enemies are stunned while in the canopy; a shove and a hit land once per touch cooldown.
  function touchUmbrella(s, u, dt) {
    var h = s.hero, C = P.CFG.weapons.semsiye, M = u.A.M;
    s.enemies.forEach(function (e) {
      if (e.dead || e.state !== 'active' || !inUmbrella(u, h, e.x, e.y, e.r)) return;
      var dx = e.x - h.x, dy = e.y - h.y, d = Math.hypot(dx, dy) || EPS;
      P.Status.apply(e, 'stun', C.stun + (M.knock || 0), 1);
      e.umbCd = Math.max(0, (e.umbCd || 0) - dt);
      if (e.umbCd > 0) return;
      e.umbCd = C.touchGap;
      P.Weapons.shove(e, dx / d, dy / d, C.shove * M.push);
      P.Mods.hit(s, e, u.dmg * C.touchDmg, dx / d, dy / d, 0, 'semsiye', u.A);
      s.events.push({ type: 'umbrellaShove', x: e.x, y: e.y, hx: h.x, hy: h.y, a: u.a, radius: u.radius, arc: u.arc });
    });
  }

  function updateUmbrellas(s, dt) {
    var W = ws4(s), i, u;
    for (i = W.umbrellas.length - 1; i >= 0; i--) {
      u = W.umbrellas[i]; u.t += dt;
      if (u.t >= u.T) { W.umbrellas.splice(i, 1); s.events.push({ type: 'umbrellaClose', x: s.hero.x, y: s.hero.y }); continue; }
      reflectShots(s, u);
      touchUmbrella(s, u, dt);
    }
  }

  // ---------- Tavla Taşları: two pieces; dice set the bounces; doubles crit (signature: every throw doubles) ----------
  function fireTavla(s, dt) {
    var h = s.hero, cfg = P.CFG.weapons.tavla, lv = P.Weapons.level(h, 'tavla'), W = ws4(s);
    if (!lv || !P.Weapons.ready(h, 'tavla', dt)) return;
    var M = P.Mods.of(s, 'tavla'), t = P.Weapons.nearestEnemy(s, h.x, h.y, cfg.seekR);
    if (!t) return;
    var A = P.Mods.act(s, 'tavla'), rng = s.rng.combat;
    var d1 = rng.int(1, cfg.dieFaces), d2 = rng.int(1, cfg.dieFaces), dbl = d1 === d2 || !!A.sig;
    var n = A.sig ? A.sig.n : lv.pieces + M.count;
    var dmg = P.Weapons.dmgFor(s, 'tavla', lv.dmg) * A.dmg * (dbl ? cfg.dblMul : 1);
    cdSet(s, h, 'tavla', cfg, lv, A);
    s.events.push({ type: 'tavlaRoll', x: h.x, y: h.y, d1: d1, d2: d2, dbl: dbl, n: n });
    for (var k = 0; k < n; k++) {
      var bounces = Math.min(cfg.maxBounce, (k % 2 ? d2 : d1) + M.bounce);
      W.tavla.push({ x: h.x, y: h.y, phase: 'fly', target: k === 0 ? t : null, left: bounces, hit: [], A: A, dmg: dmg,
        dbl: dbl, delay: k * cfg.spacing, t: 0 });
    }
    P.Mods.announce(s, A, h.x, h.y, cfg.seekR);
  }

  function tavlaNext(s, p) {
    var cfg = P.CFG.weapons.tavla, nx = nearestWithin(s, p.x, p.y, cfg.bounceR, p.hit);
    if (!nx || p.left <= 0) { p.phase = 'done'; return; }
    p.target = nx;
  }

  function updateTavla(s, dt) {
    var W = ws4(s), cfg = P.CFG.weapons.tavla, i, p, step = cfg.speed * dt;
    for (i = W.tavla.length - 1; i >= 0; i--) {
      p = W.tavla[i]; p.t += dt;
      if (p.t < p.delay) continue;
      if (!p.target || p.target.dead || p.target.state !== 'active') tavlaNext(s, p);
      if (p.phase === 'done') { W.tavla.splice(i, 1); continue; }
      var e = p.target, dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || EPS;
      if (d - e.r > cfg.hitR) {
        var m = Math.min(d, step); p.x += dx / d * m; p.y += dy / d * m;
        continue;
      }
      p.hit.push(e.id); p.left--;
      P.Mods.hit(s, e, p.dmg, dx / d, dy / d, cfg.kb, 'tavla', p.A);
      s.events.push({ type: 'tavlaHit', x: e.x, y: e.y, dbl: p.dbl });
      tavlaNext(s, p);
      if (p.phase === 'done') W.tavla.splice(i, 1);
    }
  }

  // ---------- Kestane Mangalı: lid up, embers lobbed in a fan (signature: rain over the whole reach) ----------
  function fireKestane(s, dt) {
    var h = s.hero, cfg = P.CFG.weapons.kestane, lv = P.Weapons.level(h, 'kestane'), W = ws4(s);
    if (!lv || !P.Weapons.ready(h, 'kestane', dt)) return;
    var M = P.Mods.of(s, 'kestane'), t = P.Weapons.nearestEnemy(s, h.x, h.y, cfg.range * M.area);
    if (!t) return;
    var A = P.Mods.act(s, 'kestane'), n = A.sig ? A.sig.n : lv.embers + M.count, rng = s.rng.combat;
    cdSet(s, h, 'kestane', cfg, lv, A);
    var r = cfg.fireR * A.area, dmg = P.Weapons.dmgFor(s, 'kestane', lv.dmg) * A.dmg, base = Math.atan2(t.y - h.y, t.x - h.x);
    for (var k = 0; k < n; k++) {
      var tx, ty;
      if (A.sig) {
        var q = rng.range(0, Math.PI * 2), rr = rng.range(cfg.minFrac * cfg.range, cfg.range);
        tx = h.x + Math.cos(q) * rr; ty = h.y + Math.sin(q) * rr;
      } else {
        var sp = (k - (n - 1) / 2) * cfg.spread, dd = cfg.range * rng.range(cfg.minFrac, 1);
        tx = h.x + Math.cos(base + sp) * dd; ty = h.y + Math.sin(base + sp) * dd;
      }
      W.embers.push({ kind: 'ember', x: tx, y: ty, t: -k * cfg.stagger, T: cfg.flight, r: r, dmg: dmg, kb: cfg.blastKb,
        A: A, src: 'kestane' });
    }
    s.events.push({ type: 'emberThrow', x: h.x, y: h.y, n: n, sig: !!A.sig });
    P.Mods.announce(s, A, h.x, h.y, cfg.range);
  }

  P.Weapons4.step = function (s, dt) {
    fireTray(s, dt); fireSimit(s, dt); fireCezve(s, dt); fireOlta(s, dt);
    fireSemsiye(s, dt); fireTavla(s, dt); fireKestane(s, dt);
    updateTrays(s, dt); updateSimits(s, dt); updateBoils(s, dt); updateHooks(s, dt);
    updateUmbrellas(s, dt); updateTavla(s, dt); updateEmbers(s, dt);
  };
})();
