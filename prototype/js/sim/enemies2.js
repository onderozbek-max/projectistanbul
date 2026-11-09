// v0.6 enemies (workstream D): kasap (butcher, armour and cleaver swing), parkur (free-runner leap) and the
// affixes hizli / zirhli / patlayan rolled on generated-level spawns. Defs in config-levels.js (P.CFG.enemies.*,
// P.CFG.affix). The zehirli (toxic spitter) reuses the spitter behaviour in enemies.js (its def sets glob.zone).
// Telegraphs use the existing ring kind (enemies-fx.js draws it), so this file needs no new view code.
P.Enemies2 = {};

(function (E2) {
  var TYPES = ['kasap', 'parkur'];
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function unit(dx, dy) { var d = Math.hypot(dx, dy) || 1; return { x: dx / d, y: dy / d }; }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  E2.owns = function (type) { return TYPES.indexOf(type) >= 0; };

  // Spawn-time setup: AI state and the armour multiplier (combat.js reads e.armour in damageEnemy).
  E2.init = function (s, e) {
    if (e.type === 'kasap') e.ai = { m: 'walk', cd: 1.0, t: 0 };
    else if (e.type === 'parkur') e.ai = { m: 'walk', cd: 0.8, t: 0, tx: 0, ty: 0 };
  };

  // Desired velocity for the two types (enemies.js think() calls this first). Returns true when it set e.dvx/e.dvy.
  E2.think = function (s, e, dt) {
    if (e.type === 'kasap') return kasap(s, e, dt);
    if (e.type === 'parkur') return parkur(s, e, dt);
    return false;
  };

  // ---------- kasap: walk in; within sense, wind up a cleaver ring on its own spot, then swing ----------
  function kasap(s, e, dt) {
    var a = e.ai, S = P.CFG.enemies.kasap, h = s.hero, d = dist(e, h), hr = P.CFG.hero.radius;
    a.cd = Math.max(0, a.cd - dt);
    if (a.m === 'windup') {
      e.dvx = 0; e.dvy = 0; a.t += dt; e.windup = clamp01(a.t / S.swingWindup);
      if (a.t < S.swingWindup) return true;
      e.windup = 0; a.m = 'walk'; a.cd = S.swingCd;
      if (dist(h, e) - hr <= S.swingR) {
        P.Combat.damageHero(s, P.Enemies.dmgOf(s, e, S.swingDmg), 'kasap');
        P.Combat.pushHero(s, h.x - e.x, h.y - e.y, S.swingKb);
      }
      s.events.push({ type: 'kasapSwing', x: e.x, y: e.y, r: S.swingR });
      return true;
    }
    if (a.cd <= 0 && d <= S.sense) {
      a.m = 'windup'; a.t = 0; e.dvx = 0; e.dvy = 0;
      s.enemyTele.push({ kind: 'ring', x: e.x, y: e.y, r: S.swingR, t: 0, T: S.swingWindup, then: null, owner: e.id, src: e, col: 'slam' });
      s.events.push({ type: 'kasapWindup', id: e.id, x: e.x, y: e.y });
      e.dvx = 0; e.dvy = 0;
      return true;
    }
    var u = unit(h.x - e.x, h.y - e.y);
    e.dvx = u.x * e.speed; e.dvy = u.y * e.speed;
    return true;
  }

  // ---------- parkur: run at the hero; in leap range, crouch on a ring at the hero's spot, then fly there ----------
  function parkur(s, e, dt) {
    var a = e.ai, S = P.CFG.enemies.parkur, h = s.hero, d = dist(e, h);
    a.cd = Math.max(0, a.cd - dt);
    if (a.m === 'windup') {
      e.dvx = 0; e.dvy = 0; a.t += dt; e.windup = clamp01(a.t / S.windup);
      if (a.t < S.windup) return true;
      e.windup = 0; a.m = 'leap'; a.t = 0; e.noSep = true;
      s.events.push({ type: 'parkurLeap', id: e.id, x: e.x, y: e.y });
      return leap(s, e, dt, S);
    }
    if (a.m === 'leap') return leap(s, e, dt, S);
    if (a.cd <= 0 && d >= S.leapMin && d <= S.leapMax) {
      a.m = 'windup'; a.t = 0; a.tx = h.x; a.ty = h.y; e.dvx = 0; e.dvy = 0;
      s.enemyTele.push({ kind: 'ring', x: h.x, y: h.y, r: S.leapR, t: 0, T: S.windup, then: null, owner: e.id, src: e, col: 'danger' });
      return true;
    }
    var u = unit(h.x - e.x, h.y - e.y);
    e.dvx = u.x * e.speed; e.dvy = u.y * e.speed;
    return true;
  }

  // Flight: velocity aims at the captured spot and lands after leapT. Landing hits the hero if it stayed in the ring.
  function leap(s, e, dt, S) {
    var a = e.ai, h = s.hero, left = S.leapT - a.t, hr = P.CFG.hero.radius;
    a.t += dt;
    e.noSep = true;
    if (a.t < S.leapT) {
      var step = Math.max(dt, left);
      e.dvx = (a.tx - e.x) / step; e.dvy = (a.ty - e.y) / step;
      return true;
    }
    e.noSep = false; e.dvx = 0; e.dvy = 0; a.m = 'walk'; a.cd = S.leapCd;
    if (dist(h, { x: a.tx, y: a.ty }) - hr <= S.leapR) {
      P.Combat.damageHero(s, P.Enemies.dmgOf(s, e, S.leapDmg), 'parkur');
      P.Combat.pushHero(s, h.x - a.tx, h.y - a.ty, S.leapKb);
    }
    s.events.push({ type: 'parkurLand', id: e.id, x: a.tx, y: a.ty, r: S.leapR });
    return true;
  }

  // ---------- affixes ----------
  // Roll one affix for a generated-level spawn (spawn stream, so the roll is deterministic and early hoods are untouched).
  E2.roll = function (s, type, hoodIdx) {
    var sch = P.CFG.affix.schedule, i, a;
    for (i = 0; i < sch.length; i++) {
      a = sch[i];
      if (hoodIdx < a.from || a.types.indexOf(type) < 0) continue;
      if (s.rng.spawn.chance(a.chance)) return a.id;
    }
    return null;
  };

  E2.applyAffix = function (e, id) {
    var A = P.CFG.affix.list[id];
    if (!A) return;
    e.affix = id;
    if (A.speedMul) e.speed *= A.speedMul;
    if (A.armour) e.armour = A.armour;
    if (A.kbResist) e.kbResist = Math.min(1, e.kbResist + A.kbResist);
  };

  // Death hook (combat.js killEnemy): a volatile zombie bursts. Hurts nearby zombies and the hero when close.
  E2.onDeath = function (s, e) {
    if (e.affix !== 'patlayan' || e.patlayanDone) return;
    e.patlayanDone = true;
    var A = P.CFG.affix.list.patlayan, h = s.hero, hr = P.CFG.hero.radius;
    s.events.push({ type: 'bloaterPop', x: e.x, y: e.y, r: A.blastR, mini: true, boss: false, chainFrom: e.id });
    for (var i = 0; i < s.enemies.length; i++) {
      var o = s.enemies[i], dx = o.x - e.x, dy = o.y - e.y, d = Math.hypot(dx, dy);
      if (o === e || o.dead) continue;
      if (d - o.r <= A.blastR) P.Combat.damageEnemy(s, o, A.enemyDmg, dx / (d || 1), dy / (d || 1), 0.6, false, 'patlayan');
    }
    if (dist(h, e) - hr <= A.blastR) P.Combat.damageHero(s, P.Enemies.dmgOf(s, e, A.heroDmg), 'patlayan');
  };
})(P.Enemies2);
