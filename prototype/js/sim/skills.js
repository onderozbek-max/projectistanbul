// Player skills (workstream E1): Dash (flick / double-tap / Space), Ultimate "Nazar Patlaması" (charged by
// kills), kill-streak Frenzy, Nazar charm (crit + dodge), Magnet (pickup radius + vacuum pulse), near-miss.
// P.Status: slow / root / stun / foam on enemies. E2 calls Skills.init, Skills.step and Status.step;
// E2 also reads Status.speedMul / Status.rooted and calls Skills.critChance / Skills.tryDodge (see report).
P.Skills = {};
P.Status = {};

function sk(s) {
  return s.sk || (s.sk = { dash: null, nearMissDone: false, ultT: 0, ultFull: false, frenzyT: 0, streak: 0,
    lastKillT: -99, snap: [], magnetT: null, pickAdd: 0 });
}

P.Skills.init = function (s) {
  var h = s.hero;
  h.dashCd = 0; h.iframes = 0; h.ult = 0; h.dashing = false;
  s.sk = null;
  sk(s);
};

function clampHero(s) {
  if (P.World.clampHero) P.World.clampHero(s, s.hero);
  else P.World.clampWalk(s.hero, P.CFG.hero.radius, s.props);
}

// ---------- kill tracking: enemies that were alive last step and are dead now ----------
function onKill(s, S, e) {
  var K = P.CFG.skills, h = s.hero;
  h.ult = Math.min(1, h.ult + (e.elite ? K.ult.perElite : K.ult.perKill));
  if (h.ult >= 1 && !S.ultFull) { S.ultFull = true; s.events.push({ type: 'ultReady' }); }
  if (s.t - S.lastKillT > K.frenzy.window) S.streak = 0;
  S.streak++;
  S.lastKillT = s.t;
  if (S.streak >= K.frenzy.threshold && S.frenzyT <= 0) {
    S.streak = 0; S.frenzyT = K.frenzy.time;
    s.events.push({ type: 'frenzy', on: true, t: K.frenzy.time });
  }
}

function tickKills(s, S) {
  var snap = S.snap;
  for (var i = 0; i < snap.length; i++) {
    var e = snap[i];
    if (e.dead && !e.counted) { e.counted = true; onKill(s, S, e); }
  }
  S.snap = s.enemies.slice();
}

// ---------- Dash ----------
function tryDash(s, S, input) {
  var h = s.hero, D = P.CFG.skills.dash;
  if (S.dash || h.dashCd > 0 || s.mode !== 'play') return;
  var dx = input.x || 0, dy = input.y || 0, m = Math.hypot(dx, dy);
  if (m > 0.2) { dx /= m; dy /= m; } else {
    dx = h.fx; dy = h.fy; m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
  }
  S.dash = { dx: dx, dy: dy, t: 0, T: D.time, speed: D.dist / D.time };
  S.nearMissDone = false;
  h.dashCd = D.cooldown; h.iframes = D.iframes; h.dashing = true;
  s.events.push({ type: 'dash', x: h.x, y: h.y, ax: dx, ay: dy, dist: D.dist, T: D.time });
}

function stepDash(s, S, dt) {
  var h = s.hero, d = S.dash;
  d.t += dt;
  var adv = Math.min(dt, d.T - (d.t - dt));
  h.x += d.dx * d.speed * adv; h.y += d.dy * d.speed * adv;
  clampHero(s);
  if (d.t >= d.T) { S.dash = null; h.dashing = false; }
}

// Near miss: an enemy inside contact range while i-frames are active (once per dash).
function nearMiss(s, S) {
  var h = s.hero, D = P.CFG.skills.dash;
  if (S.nearMissDone || !(h.iframes > 0)) return;
  for (var i = 0; i < s.enemies.length; i++) {
    var e = s.enemies[i];
    if (e.dead || e.state !== 'active') continue;
    if (Math.hypot(e.x - h.x, e.y - h.y) <= e.r + P.CFG.hero.radius + D.nearMissR) {
      S.nearMissDone = true;
      s.events.push({ type: 'nearMiss', x: h.x, y: h.y, slowMo: D.nearSlowMo });
      return;
    }
  }
}

// ---------- Ultimate ----------
function tryUlt(s, S) {
  var h = s.hero, U = P.CFG.skills.ult, V = P.CFG.view;
  if (h.ult < 1 || s.mode !== 'play') return;
  h.ult = 0; S.ultFull = false; S.ultT = U.time;
  var hw = V.widthM / 2 + U.padM, hh = P.viewHalfH(V.widthM) + U.padM, n = 0;
  s.enemies.forEach(function (e) {
    if (e.dead || e.state !== 'active') return;
    var dx = e.x - h.x, dy = e.y - h.y;
    if (Math.abs(dx) > hw || Math.abs(dy) > hh) return;
    var d = Math.hypot(dx, dy) || 0.01;
    n++;
    P.Combat.damageEnemy(s, e, U.damage, dx / d, dy / d, U.push, false, 'ult');
  });
  s.events.push({ type: 'ult', x: h.x, y: h.y, hw: hw, hh: hh, n: n, slowMo: U.slowMo, T: U.time });
}

// ---------- Magnet: pickup radius + vacuum pulse ----------
function magnetInterval(lv) {
  var M = P.CFG.passives.magnet;
  return Math.max(M.pulseMin, M.pulseBase - M.pulsePerLevel * (lv - 1));
}

P.Skills.magnetInterval = magnetInterval;

function magnet(s, S, dt) {
  var h = s.hero, lv = h.passives.magnet || 0, M = P.CFG.passives.magnet;
  var add = lv * M.radiusPerLevel;
  h.pickupRadius = h.pickupRadius - S.pickAdd + add;
  S.pickAdd = add;
  if (!lv) { S.magnetT = null; return; }
  if (S.magnetT === null) S.magnetT = magnetInterval(lv);
  S.magnetT -= dt;
  if (S.magnetT > 0) return;
  S.magnetT = magnetInterval(lv);
  s.drops.forEach(function (d) { d.mag = true; });
  s.events.push({ type: 'vacuum', x: h.x, y: h.y, r: h.pickupRadius, n: s.drops.length });
}

// ---------- step ----------
function tickTimers(s, S, dt) {
  if (S.frenzyT > 0) {
    S.frenzyT -= dt;
    if (S.frenzyT <= 0) { S.frenzyT = 0; s.events.push({ type: 'frenzy', on: false }); }
  }
  if (S.ultT > 0) S.ultT = Math.max(0, S.ultT - dt);
}

P.Skills.step = function (s, dt, input) {
  var h = s.hero, S = sk(s);
  h.dashCd = Math.max(0, (h.dashCd || 0) - dt);
  h.iframes = Math.max(0, (h.iframes || 0) - dt);
  h.ult = h.ult || 0;
  tickKills(s, S);
  tickTimers(s, S, dt);
  magnet(s, S, dt);
  if (input && input.dash) tryDash(s, S, input);
  if (S.dash) stepDash(s, S, dt);
  if (input && input.ult) tryUlt(s, S);
  nearMiss(s, S);
};

// Damage multiplier for weapons (ultimate empowerment).
P.Skills.powerMul = function (s) { return sk(s).ultT > 0 ? P.CFG.skills.ult.powerMul : 1; };

// Cooldown multiplier for weapons (frenzy attack speed, ultimate haste). Applied in Weapons.cdMult.
P.Skills.cdScale = function (s) {
  var S = sk(s), k = 1;
  if (S.frenzyT > 0) k /= 1 + P.CFG.skills.frenzy.attackSpeed;
  if (S.ultT > 0) k *= P.CFG.skills.ult.cdMul;
  return k;
};

P.Skills.frenzyOn = function (s) { return sk(s).frenzyT > 0; };
P.Skills.dashing = function (s) { return !!sk(s).dash; };

// Crit chance including the Nazar charm. E2: damageEnemy should roll with this value.
P.Skills.critChance = function (s) {
  var lv = s.hero.passives.nazar || 0;
  return Math.min(1, P.CFG.hero.critChance + lv * P.CFG.passives.nazar.critPerLevel);
};

// Dodge roll for an incoming hit (Nazar charm). E2: call from damageHero before applying damage.
P.Skills.tryDodge = function (s, raw, cause) {
  var lv = s.hero.passives.nazar || 0;
  if (!lv) return false;
  var N = P.CFG.passives.nazar, p = Math.min(N.dodgeCap, lv * N.dodgePerLevel);
  if (!s.rng.combat.chance(p)) return false;
  s.events.push({ type: 'nazarDodge', x: s.hero.x, y: s.hero.y, cause: cause, raw: raw });
  return true;
};

// HUD snapshot for the lead's dash / ultimate / frenzy widgets.
P.Skills.hud = function (s) {
  var S = sk(s), D = P.CFG.skills.dash;
  return { dashFrac: Math.max(0, 1 - (s.hero.dashCd || 0) / D.cooldown), dashReady: !(s.hero.dashCd > 0),
    ult: s.hero.ult || 0, ultReady: (s.hero.ult || 0) >= 1, frenzy: S.frenzyT > 0, frenzyFrac: S.frenzyT / P.CFG.skills.frenzy.time,
    streak: S.streak };
};

// ---------- P.Status: applied by weapons; E2 uses speedMul / rooted in enemy movement ----------
P.Status.apply = function (e, kind, dur, mag) {
  if (!e || e.dead) return;
  var st = e.st || (e.st = {});
  if (kind === 'slow') {
    if (!st.slow || st.slow.t <= 0 || mag >= st.slow.m) st.slow = { m: mag, t: dur };
    else st.slow.t = Math.max(st.slow.t, dur);
  } else if (kind === 'root') {
    st.root = Math.max(st.root || 0, dur);
  } else if (kind === 'stun') {
    if (e.boss || e.immune) st.root = Math.max(st.root || 0, P.CFG.status.staggerBoss);
    else st.stun = Math.max(st.stun || 0, dur);
  } else if (kind === 'foam') {
    st.foam = Math.max(st.foam || 0, dur);
  }
};

P.Status.step = function (s, dt) {
  s.enemies.forEach(function (e) {
    var st = e.st;
    if (!st) return;
    if (st.root > 0) st.root = Math.max(0, st.root - dt);
    if (st.stun > 0) st.stun = Math.max(0, st.stun - dt);
    if (st.foam > 0) st.foam = Math.max(0, st.foam - dt);
    if (st.slow && st.slow.t > 0) { st.slow.t -= dt; if (st.slow.t <= 0) st.slow = null; }
  });
};

P.Status.speedMul = function (e) {
  var sl = e.st && e.st.slow;
  return sl && sl.t > 0 ? 1 - sl.m : 1;
};

P.Status.rooted = function (e) {
  var st = e.st;
  return !!st && (st.root > 0 || st.stun > 0);
};
