// Improvised weapons (v0.5 deviations, workstream A): Testere Diski (sawblade: thrown out and back, sparks where it is
// caught), Rögar Kapağı (manhole: a cover that bounces enemy to enemy), Pürmüz (torch: a flame jet, then a scorch that
// burns), Olta (hook, reel, slam), Araba Kapısı (cardoor: a shield that blocks and reflects spit, and shoves), Sapan
// (slingshot: ricocheting steel marbles; two on one enemy in one volley is a lucky shot). Each has five levels, six
// mods (P.CFG.modDefs) and a signature (P.CFG.sig). Timed landings (sparks, reflected spit) share W.landings.
// All numbers come from P.CFG.weapons.<id>. Every fire pushes the generic wfire event (P.Weapons.fired).
// The chainsaw lives in weapons5.js. Visuals: weapons-fx4.js (sawThrow, sawReturn, sawCatch, sparkBurst,
// manholeThrow, manholeBounce, torchJet, scorchSizzle, olta*, doorRaise, doorBash, doorDrop, spitReflect,
// slingPull, marbleHit).
(function () {
  var DEG = Math.PI / 180, EPS = 0.05;
  P.Weapons4 = {};

  function ws4(s) { return P.Weapons.state(s); }
  function cdSet(s, h, id, cfg, lv, A) { h.cds[id] = cfg.cooldown * (lv.cdMult || 1) * A.cd * P.Weapons.cdMult(s, A.fam); }
  function nearestWithin(s, x, y, r, taken) {
    var best = null, bd = r;
    s.enemies.forEach(function (e) {
      if (e.dead || e.state !== 'active' || (taken && taken.indexOf(e.id) >= 0)) return;
      var d = Math.hypot(e.x - x, e.y - y);
      if (d < bd) { bd = d; best = e; }
    });
    return best;
  }

  // ---------- Testere Diski: out and back; each pass hits; sparks burst where it is caught (signature: a ring of blades) ----------
  // The owned variant runs this code: sawblade, or İkiz Disk (twinsaw: two blades side by side, one volley).
  function fireSaw(s, dt) {
    var h = s.hero, id = P.Weapons.variantOf(h, 'sawblade'), cfg = P.CFG.weapons[id], lv = P.Weapons.level(h, id), W = ws4(s);
    if (!lv || !P.Weapons.ready(h, id, dt) || W.blades.length) return;
    var M = P.Mods.of(s, 'sawblade'), range = lv.range * M.range;
    var t = P.Weapons.nearestEnemy(s, h.x, h.y, range);
    if (!t) return;
    var A = P.Mods.act(s, 'sawblade'), a = Math.atan2(t.y - h.y, t.x - h.x), n = lv.blades || 1, k, ak;
    cdSet(s, h, id, cfg, lv, A);
    for (k = 0; k < n; k++) {
      ak = a + (k - (n - 1) / 2) * (lv.spread || 0);
      W.blades.push({ x: h.x, y: h.y, ox: h.x, oy: h.y, a: ak, d: 0, out: range, phase: 'out', hit: [], lv: lv, A: A,
        bend: (lv.bend || 0) * (k % 2 ? -1 : 1), speed: cfg.speed * (lv.speedMul || 1), rt: 0,
        dmg: P.Weapons.dmgFor(s, 'sawblade', lv.dmg) * A.dmg, left: cfg.hitsOut + M.pierce, sparks: lv.sparks + M.count });
    }
    s.events.push({ type: 'sawThrow', x: h.x, y: h.y, a: a, range: range });
    P.Weapons.fired(s, 'sawblade', a, n, id);
    P.Mods.announce(s, A, h.x, h.y, range);
  }

  function bladeHits(s, bl) {
    var cfg = P.CFG.weapons.sawblade;
    s.enemies.forEach(function (e) {
      if (bl.left <= 0 || e.dead || e.state !== 'active' || bl.hit.indexOf(e.id) >= 0) return;
      var dx = e.x - bl.x, dy = e.y - bl.y, d = Math.hypot(dx, dy) || EPS;
      if (d - e.r > cfg.hitR) return;
      bl.hit.push(e.id); bl.left--;
      P.Mods.hit(s, e, bl.dmg, dx / d, dy / d, cfg.hitKb, 'sawblade', bl.A);
      if (!e.dead) P.Status.apply(e, 'slow', cfg.slowT, cfg.slow);
    });
  }

  function turnBlade(s, bl) {
    bl.phase = 'back'; bl.hit = []; bl.left = P.CFG.weapons.sawblade.hitsOut + bl.A.M.pierce;
    bl.tx = bl.x; bl.ty = bl.y;
    s.events.push({ type: 'sawReturn', x: bl.x, y: bl.y });
  }

  function curveBlade(bl, x0, y0, x1, y1, q, bend) {
    var off = Math.sin(Math.PI * q) * bend;
    bl.x = x0 + (x1 - x0) * q - Math.sin(bl.a) * off;
    bl.y = y0 + (y1 - y0) * q + Math.cos(bl.a) * off;
  }

  function updateBlades(s, dt) {
    var W = ws4(s), cfg = P.CFG.weapons.sawblade, h = s.hero;
    for (var i = W.blades.length - 1; i >= 0; i--) {
      var bl = W.blades[i], step = (bl.speed || cfg.speed) * dt;
      if (bl.phase === 'out') {
        bl.d = Math.min(bl.out, bl.d + step);
        curveBlade(bl, bl.ox, bl.oy, bl.ox + Math.cos(bl.a) * bl.out, bl.oy + Math.sin(bl.a) * bl.out, bl.d / bl.out, bl.bend || 0);
        if (bl.d >= bl.out) turnBlade(s, bl);
      } else if (bl.bend) {
        bl.rt = Math.min(1, bl.rt + step * cfg.backMul / bl.out);
        curveBlade(bl, bl.tx, bl.ty, h.x, h.y, bl.rt, -bl.bend);
        if (bl.rt >= 1) { W.blades.splice(i, 1); catchBlade(s, bl); continue; }
      } else {
        var dx = h.x - bl.x, dy = h.y - bl.y, d = Math.hypot(dx, dy);
        if (d < cfg.catchR) { W.blades.splice(i, 1); catchBlade(s, bl); continue; }
        var m = Math.min(d, step * cfg.backMul);
        bl.x += dx / d * m; bl.y += dy / d * m;
      }
      bladeHits(s, bl);
    }
  }

  // Sparks: a scatter around the catch point; signature = a ring of blades around Arda.
  function catchBlade(s, bl) {
    var W = ws4(s), cfg = P.CFG.weapons.sawblade, A = bl.A, r = cfg.sparkR * A.area, n = bl.sparks, i, a, rr;
    var rng = s.rng.combat, h = s.hero, sdmg = P.Weapons.dmgFor(s, 'sawblade', bl.lv.dmg * cfg.sparkDmg) * A.dmg;
    if (A.sig) {
      n = A.sig.n;
      for (i = 0; i < n; i++) {
        a = i / n * Math.PI * 2; rr = cfg.ringR * A.area;
        W.landings.push({ kind: 'sparks', x: h.x + Math.cos(a) * rr, y: h.y + Math.sin(a) * rr, t: 0,
          T: cfg.sparkT + i * cfg.ringStagger, r: r, dmg: sdmg, kb: cfg.blastKb, A: A, src: 'sawblade' });
      }
    } else {
      for (i = 0; i < n; i++) {
        a = rng.range(0, Math.PI * 2); rr = r * Math.sqrt(rng.next());
        W.landings.push({ kind: 'sparks', x: bl.x + Math.cos(a) * rr, y: bl.y + Math.sin(a) * rr, t: 0,
          T: cfg.sparkT + i * cfg.stagger, r: r, dmg: sdmg, kb: cfg.blastKb, A: A, src: 'sawblade' });
      }
    }
    s.events.push({ type: 'sawCatch', x: bl.x, y: bl.y, n: n, tag: 'blade' });
  }

  // Timed landings: sparks blast on impact; reflected spit blasts only.
  function updateLandings(s, dt) {
    var W = ws4(s), i, q;
    for (i = W.landings.length - 1; i >= 0; i--) {
      q = W.landings[i]; q.t += dt;
      if (q.t < q.T) continue;
      W.landings.splice(i, 1);
      P.Mods.blast(s, q.x, q.y, q.r, q.dmg, q.kb, q.src, q.A);
      if (q.kind === 'reflect') continue;
      P.Mods.field(s, q.x, q.y, q.r, q.A, q.dmg, q.src);
      s.events.push({ type: 'sparkBurst', x: q.x, y: q.y, r: q.r, tag: 'blade' });
    }
  }

  // ---------- Rögar Kapağı: a cover flung like a frisbee; it bounces (levels + mods) from enemy to enemy ----------
  function fireManhole(s, dt) {
    var h = s.hero, cfg = P.CFG.weapons.manhole, lv = P.Weapons.level(h, 'manhole'), W = ws4(s);
    if (!lv || !P.Weapons.ready(h, 'manhole', dt)) return;
    var M = P.Mods.of(s, 'manhole'), t = P.Weapons.nearestEnemy(s, h.x, h.y, cfg.range);
    if (!t) return;
    var A = P.Mods.act(s, 'manhole'), n = A.sig ? A.sig.n : 1, dmg = P.Weapons.dmgFor(s, 'manhole', lv.dmg) * A.dmg;
    var taken = [t.id], a = Math.atan2(t.y - h.y, t.x - h.x);
    cdSet(s, h, 'manhole', cfg, lv, A);
    for (var k = 0; k < n; k++) {
      var tgt = k === 0 ? t : nearestWithin(s, h.x, h.y, cfg.range, taken);
      if (tgt) taken.push(tgt.id);
      W.manholes.push({ x: h.x, y: h.y, phase: 'fly', target: tgt, hit: [], left: lv.bounces + M.bounce, A: A, dmg: dmg, lv: lv,
        legX: h.x, legY: h.y, grade: h.weapons.manhole,
        delay: k * cfg.stagger, t: 0 });
    }
    s.events.push({ type: 'manholeThrow', x: h.x, y: h.y, a: a, n: n, grade: h.weapons.manhole });
    P.Weapons.fired(s, 'manhole', a, n);
    P.Mods.announce(s, A, h.x, h.y, cfg.range);
  }

  function manholeRetarget(s, mh) {
    var cfg = P.CFG.weapons.manhole, nx = nearestWithin(s, mh.x, mh.y, cfg.bounceR, mh.hit);
    mh.legX = mh.x; mh.legY = mh.y;
    if (!nx || mh.left <= 0) { mh.phase = 'back'; mh.target = null; return; }
    mh.target = nx;
  }

  function manholeHit(s, mh, e) {
    var cfg = P.CFG.weapons.manhole, dx = e.x - mh.x, dy = e.y - mh.y, d = Math.hypot(dx, dy) || 1;
    mh.hit.push(e.id); mh.left--;
    P.Mods.hit(s, e, mh.dmg, dx / d, dy / d, cfg.kb, 'manhole', mh.A);
    var crater = mh.hit.length === 1 && mh.lv && mh.lv.craterR;
    var radius = (crater || mh.lv && mh.lv.impactR || 0) * mh.A.area;
    if (radius) coverShock(s, mh, e, radius);
    s.events.push({ type: 'manholeBounce', x: e.x, y: e.y, r: radius, a: Math.atan2(dy, dx), grade: mh.grade, crater: !!crater, n: mh.hit.length, tag: 'blunt' });
    manholeRetarget(s, mh);
  }

  function coverShock(s, mh, target, radius) {
    s.enemies.forEach(function (e) {
      if (e.dead || e.state !== 'active' || e === target) return;
      var dx = e.x - target.x, dy = e.y - target.y, d = Math.hypot(dx, dy) || EPS;
      if (d - e.r > radius) return;
      if (mh.lv.impactMul) P.Mods.hit(s, e, mh.dmg * mh.lv.impactMul, dx / d, dy / d, P.CFG.weapons.manhole.kb, 'manhole', mh.A);
      else P.Weapons.shove(e, dx / d, dy / d, P.CFG.weapons.manhole.kb);
    });
  }

  function updateManholes(s, dt) {
    var W = ws4(s), cfg = P.CFG.weapons.manhole, h = s.hero;
    for (var i = W.manholes.length - 1; i >= 0; i--) {
      var mh = W.manholes[i];
      mh.t += dt;
      if (mh.t < mh.delay) continue;
      var step = cfg.speed * (mh.lv && mh.lv.speedMul || 1) * dt;
      if (mh.phase === 'fly') {
        var tg = mh.target;
        if (!tg || tg.dead || tg.state !== 'active') { manholeRetarget(s, mh); continue; }
        var dx = tg.x - mh.x, dy = tg.y - mh.y, d = Math.hypot(dx, dy) || EPS;
        if (d - tg.r <= cfg.hitR) manholeHit(s, mh, tg);
        else { var m = Math.min(d, step); mh.x += dx / d * m; mh.y += dy / d * m; }
      } else {
        var bx = h.x - mh.x, by = h.y - mh.y, bd = Math.hypot(bx, by) || EPS;
        if (bd < cfg.catchR) { W.manholes.splice(i, 1); continue; }
        var bm = Math.min(bd, step * cfg.backMul);
        mh.x += bx / bd * bm; mh.y += by / bd * bm;
      }
    }
  }

  // ---------- Pürmüz: a short flame jet in a cone (ticks), then a scorch on the ground that keeps burning ----------
  function fireTorch(s, dt) {
    var h = s.hero, id = P.Weapons.variantOf(h, 'torch'), cfg = P.CFG.weapons[id], lv = P.Weapons.level(h, id), W = ws4(s);
    if (!lv || !P.Weapons.ready(h, id, dt)) return;
    var M = P.Mods.of(s, 'torch'), t = P.Weapons.nearestEnemy(s, h.x, h.y, lv.range * M.area);
    if (!t) return;
    var A = P.Mods.act(s, 'torch'), a = Math.atan2(t.y - h.y, t.x - h.x), range = lv.range * A.area;
    var arc = A.sig ? A.sig.arc : lv.arcDeg;
    cdSet(s, h, id, cfg, lv, A);
    var ticks = A.sig ? cfg.sigTicks : lv.ticks || cfg.ticks;
    W.torches.push({ id: id, lv: lv, a: a, a0: a, A: A, range: range, arc: arc, t: 0, ticks: ticks, tickT: 0,
      activeT: (ticks - 1) * cfg.tick, sweep: A.sig ? 0 : (lv.sweep || 0) * DEG,
      done: false, dmg: P.Weapons.dmgFor(s, 'torch', lv.dmg) * A.dmg });
    s.events.push({ type: 'torchJet', x: h.x, y: h.y, a: a, range: range, arc: arc, tag: P.Weapons.tagOf(id), variant: id });
    P.Weapons.fired(s, 'torch', a, 1, id);
    P.Mods.announce(s, A, h.x, h.y, range);
  }

  function jetTick(s, bo) {
    var h = s.hero, cfg = P.CFG.weapons.torch, cosHalf = Math.cos(bo.arc / 2 * DEG), ax = Math.cos(bo.a), ay = Math.sin(bo.a);
    s.enemies.forEach(function (e) {
      if (e.dead || e.state !== 'active') return;
      var dx = e.x - h.x, dy = e.y - h.y, d = Math.hypot(dx, dy);
      if (d - e.r > bo.range || (d > EPS && (dx * ax + dy * ay) / d < cosHalf)) return;
      P.Mods.hit(s, e, bo.dmg, dx / (d || 1), dy / (d || 1), cfg.jetKb, 'torch', bo.A);
    });
  }

  // The scorch: a ground patch that sets enemies on fire while they stand in it.
  function scorch(s, bo) {
    var cfg = P.CFG.weapons.torch, sx = s.hero.x + Math.cos(bo.a) * bo.range * cfg.stainAt,
      sy = s.hero.y + Math.sin(bo.a) * bo.range * cfg.stainAt, r = cfg.stainR * bo.A.area, T = cfg.stainT * bo.A.M.life;
    bo.done = true;
    s.zones.push({ kind: 'scorch', x: sx, y: sy, r: r, t: T, T: T, hit: {}, weaponVariant: bo.A.variant });
    P.Mods.field(s, sx, sy, r, bo.A, bo.dmg, 'torch');
    s.events.push({ type: 'scorchSizzle', x: sx, y: sy, r: r, T: T, tag: 'fire' });
    if (bo.lv && bo.lv.stains > 1) forgeStain(s, bo, T);
  }

  // Forge (Ocak Ağzı): the extra scorch parts of the jet, laid along it at extraAt of the range.
  function forgeStain(s, bo, T) {
    var lv = bo.lv, h = s.hero, d = bo.range * lv.extraAt, x = h.x + Math.cos(bo.a) * d, y = h.y + Math.sin(bo.a) * d;
    var r = lv.extraR * bo.A.area;
    s.zones.push({ kind: 'scorch', x: x, y: y, r: r, t: T, T: T, hit: {}, weaponVariant: bo.A.variant });
    P.Mods.field(s, x, y, r, bo.A, bo.dmg, 'torch');
    s.events.push({ type: 'forgeStain', x: x, y: y, r: r, n: lv.stains - 1, tag: 'fire' });
  }

  function updateJets(s, dt) {
    var W = ws4(s), cfg = P.CFG.weapons.torch, i, bo;
    for (i = W.torches.length - 1; i >= 0; i--) {
      bo = W.torches[i];
      bo.t += dt; bo.tickT -= dt;
      if (bo.sweep) bo.a = bo.a0 + (Math.min(1, bo.t / bo.activeT) - 0.4) * bo.sweep;
      if (bo.ticks > 0 && bo.tickT <= 0) { bo.ticks--; bo.tickT += cfg.tick; jetTick(s, bo); }
      if (bo.ticks <= 0 && !bo.done) scorch(s, bo);
      if (bo.done && bo.t > cfg.jetT + cfg.lingerT) W.torches.splice(i, 1);
    }
  }

  // ---------- Olta: cast a hook to the nearest, it sticks, reels the target in and slams it down ----------
  function fireOlta(s, dt) {
    var h = s.hero, id = P.Weapons.variantOf(h, 'olta'), cfg = P.CFG.weapons[id], lv = P.Weapons.level(h, id), W = ws4(s);
    if (!lv || !P.Weapons.ready(h, id, dt)) return;
    var t = P.Weapons.nearestEnemy(s, h.x, h.y, cfg.range);
    if (!t) return;
    var A = P.Mods.act(s, 'olta'), n = 1 + A.M.count, taken = [];
    cdSet(s, h, id, cfg, lv, A);
    for (var k = 0; k < n; k++) {
      var tg = k === 0 ? t : nearestWithin(s, h.x, h.y, cfg.range, taken);
      if (!tg) break;
      taken.push(tg.id);
      var d = Math.hypot(tg.x - h.x, tg.y - h.y);
      W.hooks.push({ phase: 'cast', e: tg, t: 0, T: Math.max(cfg.minCastT, d / cfg.castSpeed), lv: lv, A: A,
        dmg: P.Weapons.dmgFor(s, 'olta', lv.dmg) * A.dmg, reelDist: lv.reel * A.M.reel, rt: 0, dragged: {}, swept: {} });
    }
    s.events.push({ type: 'oltaCast', x: h.x, y: h.y, tx: t.x, ty: t.y, n: n, tag: 'blade', variant: id });
    P.Weapons.fired(s, 'olta', Math.atan2(t.y - h.y, t.x - h.x), n, id);
  }

  // Hookpull (Çeki Halatı): a set hook hauls the enemies near its catch toward it and stuns them. Base olta has no haulR.
  function haul(s, hk, e) {
    var lv = hk.lv, n = 0;
    s.enemies.forEach(function (o) {
      if (o === e || o.dead || o.state !== 'active') return;
      var dx = e.x - o.x, dy = e.y - o.y, d = Math.hypot(dx, dy);
      if (d < EPS || d - o.r - e.r > lv.haulR) return;
      P.Weapons.shove(o, dx / d, dy / d, lv.haulM * P.Weapons.kbMult(s));
      P.Status.apply(o, 'stun', lv.haulStun, 1);
      n++;
    });
    if (n) P.Combat.evolutionEffect(s, hk.A.variant, 'pulled', n);
    if (n) s.events.push({ type: 'oltaHaul', x: e.x, y: e.y, r: lv.haulR, n: n, tag: 'blade' });
  }

  function updateHooks(s, dt) {
    var W = ws4(s), i, hk;
    for (i = W.hooks.length - 1; i >= 0; i--) {
      hk = W.hooks[i]; hk.t += dt;
      if (hk.phase === 'cast') castStep(s, hk);
      else if (hk.phase === 'reel') reelStep(s, hk, dt);
      else if (hk.phase === 'spin') spinStep(s, hk);
      if (hk.phase === 'slam') { slamHook(s, hk); W.hooks.splice(i, 1); }
    }
  }

  function castStep(s, hk) {
    var cfg = P.CFG.weapons.olta, e = hk.e;
    if (hk.t < hk.T) return;
    var alive = !e.dead && e.state === 'active';
    hk.phase = alive ? 'reel' : 'slam'; hk.t = 0;
    if (alive) { P.Status.apply(e, 'stun', cfg.stagger, 1); s.events.push({ type: 'oltaSet', x: e.x, y: e.y, tag: 'blade' }); }
    if (alive && hk.lv.haulR) haul(s, hk, e);
  }

  function reelStep(s, hk, dt) {
    var cfg = P.CFG.weapons.olta, e = hk.e, h = s.hero;
    if (e.dead || e.state !== 'active') { hk.phase = 'slam'; return; }
    var dx = h.x - e.x, dy = h.y - e.y, d = Math.hypot(dx, dy) || EPS, room = d - cfg.reelStop;
    var pull = Math.min(room, hk.reelDist / cfg.reelT * dt);
    if (pull > 0) {
      var x = e.x, y = e.y;
      e.x += dx / d * pull; e.y += dy / d * pull; P.World.clampWalk(e, e.r, s.props);
      hookHits(s, hk, x, y, e.x, e.y, cfg.hitR, cfg.dragMul, hk.dragged);
    }
    hk.rt += dt;
    if (hk.rt >= cfg.reelEvT) { hk.rt = 0; s.events.push({ type: 'oltaReel', x: e.x, y: e.y }); }
    if (hk.t < cfg.reelT && room > 0) return;
    hk.phase = hk.lv.spinR ? 'spin' : 'slam';
    hk.t = 0; hk.T = hk.lv.spinT; hk.a = Math.atan2(-dy, -dx); hk.startR = Math.max(cfg.reelStop, d - Math.max(0, pull));
  }

  function hookHits(s, hk, x0, y0, x1, y1, r, mul, taken) {
    s.enemies.forEach(function (e) {
      if (e === hk.e || e.dead || e.state !== 'active' || taken[e.id]) return;
      if (P.Weapons3.segDist(e.x, e.y, x0, y0, x1, y1) > e.r + r) return;
      taken[e.id] = true;
      var dx = e.x - s.hero.x, dy = e.y - s.hero.y, d = Math.hypot(dx, dy) || EPS;
      P.Mods.hit(s, e, hk.dmg * mul, dx / d, dy / d, P.CFG.weapons.olta.sigKb, 'olta', hk.A);
    });
  }

  function spinStep(s, hk) {
    var e = hk.e, h = s.hero, lv = hk.lv, q = Math.min(1, hk.t / hk.T);
    if (e.dead || e.state !== 'active') { hk.phase = 'slam'; return; }
    var a = hk.a + q * 2 * Math.PI * (lv.turns || 1), r = hk.startR + (lv.spinR * hk.A.area - hk.startR) * Math.min(1, q * 4);
    e.x = h.x + Math.cos(a) * r; e.y = h.y + Math.sin(a) * r;
    P.World.clampWalk(e, e.r, s.props);
    hookHits(s, hk, h.x, h.y, e.x, e.y, P.CFG.weapons.olta.hitR, lv.spinMul, hk.swept);
    if (q >= 1) hk.phase = 'slam';
  }

  // Slam: a blast at the hook's end. Signature "leviathan" also hits whatever lies along the line from Arda.
  function slamHook(s, hk) {
    var cfg = P.CFG.weapons.olta, e = hk.e, x = e.x, y = e.y, A = hk.A, r = cfg.slamR * A.area * (hk.lv.slamMul || 1), h = s.hero;
    P.Mods.blast(s, x, y, r, hk.dmg, cfg.slamKb * P.Weapons.kbMult(s), 'olta', A);
    if (A.sig) {
      s.enemies.forEach(function (o) {
        if (o === e || o.dead || o.state !== 'active') return;
        if (P.Weapons3.segDist(o.x, o.y, h.x, h.y, x, y) <= o.r + cfg.sigLineR) {
          P.Mods.hit(s, o, hk.dmg * cfg.sigDmg, o.x - x, o.y - y, cfg.sigKb, 'olta', A);
        }
      });
    }
    s.events.push({ type: 'oltaSlam', x: x, y: y, r: r, sig: !!A.sig, grade: hk.lv.haulR ? 6 : h.weapons.olta || 1, tag: 'blade' });
    P.Mods.announce(s, A, x, y, r);
  }

  // ---------- Araba Kapısı: the same sweeping panel drives the hit test and the animation ----------
  function fireDoor(s, dt) {
    var h = s.hero, id = P.Weapons.variantOf(h, 'cardoor'), cfg = P.CFG.weapons[id], lv = P.Weapons.level(h, id), W = ws4(s);
    if (!lv || !P.Weapons.ready(h, id, dt) || W.doors.length || W.doorTosses.length) return;
    var M = P.Mods.of(s, 'cardoor'), reach = Math.min(cfg.trigR, (lv.radius + cfg.approachSlack) * M.area);
    var t = P.Weapons.nearestEnemy(s, h.x, h.y, reach), shot = null;
    s.enemyShots.forEach(function (q) { if (!shot && Math.hypot(q.x - h.x, q.y - h.y) < cfg.trigR) shot = q; });
    var thr = t || shot;
    if (!thr) return;
    var A = P.Mods.act(s, 'cardoor'), sig = A.sig, a = Math.atan2(thr.y - h.y, thr.x - h.x);
    cdSet(s, h, id, cfg, lv, A);
    var T = (sig ? sig.T : lv.openT) * M.life, radius = lv.radius * A.area;
    var arc = sig ? Math.max(cfg.minArcDeg, lv.arcDeg) : lv.arcDeg, start = a - Math.min(cfg.startDeg, arc * 0.5) * DEG;
    W.doors.push({ id: id, lv: lv, a: a, aim: a, start: start, t: 0, T: T, A: A, arc: arc,
      radius: radius, travel: 0, swing: false, touched: {}, grade: id === 'minibus' ? 6 : h.weapons.cardoor,
      dmg: P.Weapons.dmgFor(s, 'cardoor', lv.dmg) * A.dmg });
    s.events.push({ type: 'doorRaise', x: h.x, y: h.y, a: a, radius: radius, T: T });
    P.Weapons.fired(s, 'cardoor', a, 1, id);
    P.Mods.announce(s, A, h.x, h.y, radius);
  }

  // The moving panel can still bat away a spit. Its whole sweep is never an always-on shield.
  function inDoor(u, h, x, y, slack) {
    var dx = x - h.x, dy = y - h.y, d = Math.hypot(dx, dy);
    if (d > u.radius + slack) return false;
    if (d < EPS) return true;
    var da = Math.atan2(dy, dx), diff = Math.abs(Math.atan2(Math.sin(da - u.a), Math.cos(da - u.a)));
    return diff <= P.CFG.weapons.cardoor.reflectDeg * DEG;
  }

  function reflectShots(s, u) {
    var h = s.hero, C = P.CFG.weapons.cardoor, i, q, mul;
    for (i = s.enemyShots.length - 1; i >= 0; i--) {
      q = s.enemyShots[i];
      if (!inDoor(u, h, q.x, q.y, C.reflectR)) continue;
      s.enemyShots.splice(i, 1);
      P.Combat.evolutionEffect(s, u.id, 'blocked_spit', 1);
      mul = u.A.M.reflect ? u.A.M.reflect.mul : 1;
      ws4(s).landings.push({ kind: 'reflect', x: q.x0, y: q.y0, t: 0, T: C.reflectT, r: C.reflectBlastR * u.A.area,
        dmg: u.dmg * mul, kb: C.blastKb, A: u.A, src: u.id });
      s.events.push({ type: 'spitReflect', x0: q.x0, y0: q.y0, x: q.x, y: q.y });
    }
  }

  function contactDoor(s, u, oldTravel, e) {
    if (e.dead || e.state !== 'active') return;
    var h = s.hero, cfg = P.CFG.weapons.cardoor, M = u.A.M;
    var dx = e.x - h.x, dy = e.y - h.y, d = Math.hypot(dx, dy) || EPS, previous = u.touched[e.id];
    if (d > u.radius + e.r || previous !== undefined && u.travel - previous < cfg.reHitTurns * 2 * Math.PI) return;
    var from = u.start + oldTravel, rel = Math.atan2(Math.sin(Math.atan2(dy, dx) - from), Math.cos(Math.atan2(dy, dx) - from));
    var edge = Math.asin(Math.min(1, (e.r + cfg.panelDepth) / d));
    if (rel < -edge || rel > u.travel - oldTravel + edge) return;
    u.touched[e.id] = u.travel;
    var first = !u.hitOnce; u.hitOnce = true;
    P.Status.apply(e, 'stun', cfg.stun + (M.knock || 0), 1);
    P.Weapons.shove(e, dx / d, dy / d, cfg.shove * M.push);
    P.Combat.swingLift(s, e, dx / d, dy / d, u.grade / 6);
    P.Mods.hit(s, e, u.dmg * (previous === undefined ? 1 : cfg.repeatMul), dx / d, dy / d, 0, u.id, u.A);
    s.events.push({ type: 'doorBash', x: e.x, y: e.y, a: Math.atan2(dy, dx), r: u.radius, n: 1, grade: u.grade,
      enemyId: e.id, travel: u.travel, first: first, tag: 'blunt' });
  }

  function swingDoor(s, u) {
    var cfg = P.CFG.weapons.cardoor, old = u.travel, wind = Math.min(cfg.windup, u.T * 0.25);
    if (u.t < wind) {
      var pull = u.t / wind;
      u.a = u.aim + (u.start - u.aim) * pull;
      return;
    }
    var q = Math.min(1, (u.t - wind) / Math.max(EPS, u.T - wind - cfg.recovery));
    u.travel = u.arc * DEG * q * q * (3 - 2 * q);
    u.a = u.start + u.travel; u.swing = u.travel > old;
    if (u.swing) s.enemies.forEach(function (e) { contactDoor(s, u, old, e); });
  }

  // The door's impact follows the thrown panel. Minibus retains its wider stun.
  function doorSlam(s, u) {
    var h = u.target, C = u.lv, A = u.A, r = u.landR, n = 0, K = P.CFG.weapons.cardoor.toss;
    s.enemies.forEach(function (e) {
      if (e.dead || e.state !== 'active') return;
      var dx = e.x - h.x, dy = e.y - h.y, d = Math.hypot(dx, dy) || EPS;
      if (d - e.r > r) return;
      if (C.slamStun) P.Status.apply(e, 'stun', C.slamStun, 1);
      P.Weapons.shove(e, dx / d, dy / d, (C.slamKb || K.damage) * P.Weapons.kbMult(s));
      P.Combat.swingLift(s, e, dx / d, dy / d, Math.min(1, u.grade / 6 + 0.22));
      P.Mods.hit(s, e, u.dmg * (C.slamMul || K.damage), dx / d, dy / d, 0, u.id, A);
      n++;
    });
    s.events.push({ type: 'doorDrop', x: h.x, y: h.y, tag: 'blunt', tossed: true });
    s.events.push({ type: 'doorSlam', x: h.x, y: h.y, r: r, n: n, grade: u.grade, tag: 'blunt' });
    ws4(s).doorRest = { x: h.x, y: h.y, a: u.a, id: u.id, grade: u.grade, at: s.t };
  }

  function lineUpToss(s, u, K) {
    var h = s.hero;
    u.landR = (u.lv.slamR || K.radius + K.radiusPerRank * (u.grade - 1)) * u.A.area;
    var target = P.Weapons.pickClusters(s, K.range, u.landR, 1, K.flight)[0];
    if (!target) target = { x: h.x + Math.cos(u.aim) * K.missRange, y: h.y + Math.sin(u.aim) * K.missRange };
    P.World.clampWalk(target, P.CFG.hero.radius, s.props);
    u.target = target; u.turnFrom = u.a;
  }

  function heaveDoor(s, W, u, i, K) {
    if (!u.target) lineUpToss(s, u, K);
    var h = s.hero, aim = Math.atan2(u.target.y - h.y, u.target.x - h.x);
    u.heave = Math.min(1, (u.t - u.T) / K.windup);
    u.a = u.turnFrom + Math.atan2(Math.sin(aim - u.turnFrom), Math.cos(aim - u.turnFrom)) * u.heave;
    u.swing = false;
    if (u.heave < 1) return;
    W.doors.splice(i, 1);
    u.x0 = h.x + Math.cos(u.a) * u.radius * 0.48;
    u.y0 = h.y + Math.sin(u.a) * u.radius * 0.48;
    u.t = 0; u.T = K.flight;
    W.doorTosses.push(u);
    s.events.push({ type: 'doorThrow', x: h.x, y: h.y, a: u.a, grade: u.grade });
  }

  function updateDoors(s, dt) {
    var W = ws4(s), K = P.CFG.weapons.cardoor.toss, i, u;
    for (i = W.doorTosses.length - 1; i >= 0; i--) {
      u = W.doorTosses[i]; u.t += dt;
      if (u.t >= u.T) { doorSlam(s, u); W.doorTosses.splice(i, 1); }
    }
    for (i = W.doors.length - 1; i >= 0; i--) {
      u = W.doors[i]; u.t += dt;
      if (u.t >= u.T) {
        heaveDoor(s, W, u, i, K);
        continue;
      }
      swingDoor(s, u);
      reflectShots(s, u);
    }
  }

  // ---------- Sapan: steel marbles ricochet off enemies; two on one enemy in one volley is a lucky shot (crit) ----------
  function fireSling(s, dt) {
    var h = s.hero, cfg = P.CFG.weapons.slingshot, lv = P.Weapons.level(h, 'slingshot'), W = ws4(s);
    if (!lv || !P.Weapons.ready(h, 'slingshot', dt)) return;
    var M = P.Mods.of(s, 'slingshot'), t = P.Weapons.nearestEnemy(s, h.x, h.y, cfg.seekR);
    if (!t) return;
    var A = P.Mods.act(s, 'slingshot'), n = A.sig ? A.sig.n : lv.marbles + M.count, vol = { hits: {} };
    var dmg = P.Weapons.dmgFor(s, 'slingshot', lv.dmg) * A.dmg, a = Math.atan2(t.y - h.y, t.x - h.x);
    var bounces = Math.min(cfg.maxBounce, cfg.bounces + M.bounce);
    cdSet(s, h, 'slingshot', cfg, lv, A);
    s.events.push({ type: 'slingPull', x: h.x, y: h.y, a: a, n: n, grade: h.weapons.slingshot });
    for (var k = 0; k < n; k++) {
      W.marbles.push({ x: h.x, y: h.y, phase: 'fly', target: k === 0 ? t : null, left: bounces, hit: [], A: A, dmg: dmg,
        vol: vol, delay: cfg.windup + k * cfg.spacing, t: 0, lv: lv, grade: h.weapons.slingshot, sx: h.x, sy: h.y });
    }
    P.Weapons.fired(s, 'slingshot', a, n);
    P.Mods.announce(s, A, h.x, h.y, cfg.seekR);
  }

  function marbleNext(s, p) {
    var cfg = P.CFG.weapons.slingshot, nx = nearestWithin(s, p.x, p.y, cfg.bounceR, p.hit);
    if (!nx || p.left <= 0) { p.phase = 'done'; return; }
    p.target = nx;
  }

  // The second marble of a volley to reach the same enemy crits; under the volley signature every repeat does.
  function luckyHit(p, e) {
    var n = (p.vol.hits[e.id] || 0) + 1;
    p.vol.hits[e.id] = n;
    return n === 2 || (n > 2 && !!p.A.sig);
  }

  function splitVolley(s, p, e) {
    if (!p.lv || !p.lv.split || p.vol.splitDone) return;
    var W = ws4(s), taken = p.hit.slice();
    for (var i = 0; i < p.lv.split; i++) {
      var next = nearestWithin(s, e.x, e.y, p.lv.splitRadius, taken);
      if (!next) break;
      taken.push(next.id);
      W.marbles.push({ x: e.x, y: e.y, phase: 'fly', target: next, splitShot: true, left: 1,
        hit: [e.id], A: p.A, dmg: p.dmg * p.lv.splitMul, vol: p.vol, delay: 0, t: 0, grade: p.grade, sx: e.x, sy: e.y });
    }
    if (taken.length > p.hit.length) {
      p.vol.splitDone = true;
      s.events.push({ type: 'marbleFork', x: e.x, y: e.y, r: p.lv.splitRadius, grade: p.grade });
    }
  }

  function updateMarbles(s, dt) {
    var W = ws4(s), cfg = P.CFG.weapons.slingshot, i, p, step = cfg.speed * dt;
    for (i = W.marbles.length - 1; i >= 0; i--) {
      p = W.marbles[i]; p.t += dt;
      if (p.t < p.delay) continue;
      if (!p.target || p.target.dead || p.target.state !== 'active') marbleNext(s, p);
      if (p.phase === 'done') { W.marbles.splice(i, 1); continue; }
      var e = p.target, dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || EPS;
      if (d - e.r > cfg.hitR) {
        var m = Math.min(d, step); p.x += dx / d * m; p.y += dy / d * m;
        continue;
      }
      var lucky = !p.splitShot && luckyHit(p, e);
      p.hit.push(e.id); p.left--;
      P.Mods.hit(s, e, lucky ? p.dmg * cfg.luckyMul : p.dmg, dx / d, dy / d, cfg.kb, 'slingshot', p.A);
      s.events.push({ type: 'marbleHit', x: e.x, y: e.y, a: Math.atan2(dy, dx), lucky: lucky, grade: p.grade, branch: !!p.splitShot, tag: 'blunt' });
      p.sx = e.x; p.sy = e.y;
      if (!p.splitShot) splitVolley(s, p, e);
      marbleNext(s, p);
      if (p.phase === 'done') W.marbles.splice(i, 1);
    }
  }

  P.Weapons4.step = function (s, dt) {
    fireSaw(s, dt); fireManhole(s, dt); fireTorch(s, dt); fireOlta(s, dt); fireDoor(s, dt); fireSling(s, dt);
    updateBlades(s, dt); updateManholes(s, dt); updateJets(s, dt); updateHooks(s, dt);
    updateDoors(s, dt); updateMarbles(s, dt); updateLandings(s, dt);
  };
})();
