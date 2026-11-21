// İstiklal preview encounters. The authored opening remains in director.js.
P.IstiklalTrial = (function () {
  var R = {};
  function cfg() { return P.CFG.levels.tramFinale; }
  R.finale = function (s) { return P.CFG.levels.istiklalFinales[s.levelIndex]; };
  function emit(s, phase) { s.events.push({ type: 'routeBeat', phase: phase, x: s.hero.x, y: s.hero.y }); }

  R.arm = function (s) {
    s.gen.frenzy = { phase: 'warning', t: 0, next: 0, enemies: [], kills: 0 };
    emit(s, 'frenzy_warning');
  };

  function pack(s, f, types) {
    var C = cfg(), h = s.hero;
    types.forEach(function (type, i) {
      var p = P.Events.farSpot(s, h.x, h.y, C.spawnMin, C.spawnMax, true);
      if (!p) return;
      var e = P.Events.spawn(s, null, type, p.x, p.y, { state: 'active', elite: f.next === C.packs.length && i === 0 });
      if (!e) return;
      e.frenzyWave = true; e.speed *= C.speedMul; e.hp *= C.hpMul; e.maxHp = e.hp;
      f.enemies.push(e);
    });
  }

  function closeWave(s, f) {
    var C = cfg();
    f.phase = 'done';
    if (f.kills >= C.chestKills) {
      var at = { x: s.hero.x, y: s.hero.y + C.chestAhead };
      P.World.clampHero(s, at);
      P.Events.drop(s, 'chest', at.x, at.y, P.CFG.ev.chest.drop);
    }
    s.events.push({ type: 'routeBeat', phase: 'frenzy_end', kills: f.kills, x: s.hero.x, y: s.hero.y });
  }

  function surge(s, f, dt) {
    var C = cfg();
    f.t += dt;
    if (f.phase === 'warning' && f.t >= C.warningT) {
      f.phase = 'active'; f.t = 0; f.next = 1;
      pack(s, f, C.packs[0]);
      emit(s, 'frenzy_start');
    } else if (f.phase === 'active') {
      if (f.next === 1 && f.t >= C.secondAt) { f.next++; pack(s, f, C.packs[1]); }
      f.kills = f.enemies.filter(function (e) { return e.dead; }).length;
      if (f.t >= C.waveT || f.next === C.packs.length && f.kills === f.enemies.length) closeWave(s, f);
    }
  }

  R.startBoss = function (s) {
    var g = s.gen, F = R.finale(s), y = g ? Math.min(s.geo.exitY - 3, s.geo.holdY + cfg().bossAhead) : F.y;
    if (g && g.arena || s.dir.trialBoss) return;
    if(F.name==='cook'){var pocket=P.CFG.bosses.cook.pocket,h=s.hero;
      y=Math.max(pocket.minY,Math.min(pocket.maxY,h.y+(h.y<216?1:-1)*pocket.lead));}
    if (g) {g.arena = true;g.next=null;g.acc=0;}
    s.dir.zoomOut = true;
    if (s.horde) s.horde.queue.length = 0;
    s.enemyTele = s.enemyTele.filter(function (warning) { return warning.then !== 'surge'; });
    var arrival=g&&P.CFG.bosses[F.name].arrival,at=arrival&&P.WalkPath.nearest(s,{x:arrival.x,y:Math.min(s.geo.exitY-3,s.hero.y+arrival.ahead)},P.CFG.bosses[F.name].radius);
    var b = P.Bosses.spawn(s, F.type, at?at.x:F.x||0, at?at.y:y, {
      nameKey: F.name === 'vatman' ? 'boss.istiklal' : 'boss.' + F.name, hoodIdx: 0, preset: F.name,
      skin: g ? g.hood.skins[0] : null
    });
    if (g) { g.boss = b; g.bossSpawned = true; }
    else s.dir.trialBoss = b;
    if (F.name === 'vatman') {
      s.events.push({ type: 'story', id: s.levelInfo.id, when: 'boss' });
      passengerPack(s, b, 5);
    }
    emit(s, 'final_boss');
  };
  function passengerPack(s, e, n) {
    var C=P.CFG.bosses.vatman.encounter;
    n=Math.min(n,Math.max(0,C.cap-s.enemies.filter(function(q){return !q.dead&&!q.boss&&Math.hypot(q.x-e.x,q.y-e.y)<P.CFG.bossCrowd.near;}).length));
    for (var i = 0; i < n; i++) {
      var a = i * Math.PI * 2 / n, p = { x: e.x + Math.cos(a) * 4, y: e.y + Math.sin(a) * 4 };
      P.World.clampWalk(p, P.CFG.enemies.walker.radius, s.props);
      P.Events.spawn(s, null, 'walker', p.x, p.y, { state: 'turning', stateT: 1.3 });
    }
  }
  R.bossPhase = function (s, e, phase) { if (e.bossPreset === 'vatman' && phase === 2) passengerPack(s, e, 4); };

  R.step = function (s, dt) {
    stepTram(s, dt);
    var f = s.gen.frenzy;
    if (!f || s.gen.arena) return;
    if (f.phase !== 'done') surge(s, f, dt);
    if (f.phase === 'done' && s.hero.y >= s.geo.holdY) R.startBoss(s);
  };

  R.wire = function (s, it) {
    var F = R.finale(s), hits = P.Events.near(s, it.x, it.y, F.pulseR);
    s.events.push({ type: 'wirePulse', x: it.x, y: it.y, r: F.pulseR });
    hits.forEach(function (e) {
      var a = Math.atan2(e.y - it.y, e.x - it.x);
      P.Status.apply(e, 'stun', F.stunT, 1);
      P.Combat.damageEnemy(s, e, F.pulseDmg, Math.cos(a), Math.sin(a), 0.25, false, 'routeWire');
    });
  };

  function attackRing(s, e, x, y, K, T, cause) {
    P.Enemies.ring(s, x, y, K.r, T, 'swing', cause === 'linekeeper' ? 'danger' : 'slam',
      { owner: e.id, cause: cause, dmg: P.Enemies.dmgOf(s, e, K.dmg), kb: 0.8 });
  }

  var attacks = {
    roast: function (s, e, a, K) {
      var h = s.hero, v = a.dir, g = s.geo, n = e.phase > 1 ? 3 : 2;
      for (var i = 0; i < n; i++) {
        var offset = (i - (n - 1) / 2) * K.spacing, f = i === 1 ? K.lead : 0;
        var x = Math.min(g.xMax - 1, Math.max(g.xMin + 1, h.x - v.y * offset + v.x * f));
        var y = Math.min(g.exitY - 1, Math.max(g.holdY - 5, h.y + v.x * offset + v.y * f));
        attackRing(s, e, x, y, K, a.W + i * 0.15, 'roaster');
        P.Enemies3.launchBlade(s, e.x, e.y, x, y, a.W + i * 0.15, 'roaster', e.id);
      }
    },
    arcRelay: function (s, e, a, K) {
      var h = s.hero, g = s.geo, n = e.phase > 1 ? 2 : 1;
      for (var i = 0; i < n; i++) {
        var sign = h.y + K.spacing > g.exitY - 0.8 ? -1 : 1, y = h.y + i * K.spacing * sign;
        var tg = P.Enemies.lane(s, g.xMin, y, 1, 0, g.xMax - g.xMin, K.w, a.W);
        tg.then = 'switchRails'; tg.owner = e.id; tg.cause = 'linekeeper';
        tg.dmg = P.Enemies.dmgOf(s, e, K.dmg); tg.life = K.sparkT;
      }
    },
    arcKnot: function (s, e, a, K) { attackRing(s, e, s.hero.x, s.hero.y, K, a.W, 'linekeeper'); },
    districtTram: function (s, e, a, K) {
      var g = s.geo, y = Math.max(g.holdY - 3, Math.min(s.hero.y - K.len / 2, g.exitY - K.len));
      var x=s.tacticalReplay===5?K.alternate[(Math.max(1,a.k)-1)%K.alternate.length]:0;
      var t = P.Enemies.lane(s, x, y, 0, 1, K.len, K.w, a.W);
      t.owner = e.id; t.then = 'districtTram'; t.dmg = P.Enemies.dmgOf(s, e, K.dmg);
    },
    vatmanBell: function (s, e, a, K) { attackRing(s, e, e.x, e.y, K, a.W, 'vatman'); },
    vatmanLever: function (s, e, a, K) {
      attackRing(s, e, e.x + a.dir.x * K.reach, e.y + a.dir.y * K.reach, K, a.W, 'vatman');
    }
  };
  var attackConfig = { roast: 'roast', arcRelay: 'relay', arcKnot: 'knot', districtTram: 'tram', vatmanBell: 'bell', vatmanLever: 'lever' };
  R.attack = function (s, e, a, B, name, tele) {
    if (!Object.prototype.hasOwnProperty.call(attackConfig, name)) return false;
    var K = B[attackConfig[name]];
    a.W = tele(K.windup * a.wm);
    attacks[name](s, e, a, K);
    return true;
  };

  R.bossTram = function (s, t) {
    var C = P.CFG.bosses.vatman.tram;
    var pass = { type: 'tramRush', x: t.x, w: t.w, y0: t.y, y1: t.y + t.len,
      sweep: C.sweep, simTime: s.t, frontLead: C.frontLead };
    s.gen.hostileTram = { pass: pass, age: 0, seen: false, damage: t.dmg, owner: t.owner, struck: {} };
    s.events.push(pass);
  };
  function stepTram(s, dt) {
    var r = s.gen.hostileTram;
    if (!r) return;
    var b = s.gen.boss, p = r.pass, h = s.hero, from = tramFront(p, r.age), radius = P.CFG.hero.radius;
    r.age += dt;
    var to = tramFront(p, r.age);
    if (!b || b.dead || b.id !== r.owner) { s.gen.hostileTram = null; return; }
    if (!r.seen && tramTouches(h, radius, p, from, to)) {
      P.Combat.damageHero(s, r.damage, 'vatman');
      r.seen = true;
    }
    var K = P.CFG.bosses.vatman.tram;
    s.enemies.forEach(function (e) {
      if (e.dead || e.boss || e.state !== 'active' || r.struck[e.id] || !tramTouches(e, e.r, p, from, to)) return;
      r.struck[e.id] = true;
      P.Combat.damageEnemy(s, e, K.crowdDmg, 0, 1, 0, false, 'tram');
    });
    if (r.age >= p.sweep) {
      s.gen.hostileTram = null;
      if (!r.seen) P.Bosses.exposeFor(s, b, K.reset);
    }
  }

  function tramTouches(a, r, p, from, to) {
    return a.y + r >= Math.max(p.y0, from) && a.y - r <= to && Math.abs(a.x - p.x) <= p.w / 2 + r;
  }
  function tramFront(p, t) { return p.y0 - p.frontLead + (p.y1 - p.y0 + p.frontLead) * Math.min(1, t / p.sweep); }
  return R;
})();
