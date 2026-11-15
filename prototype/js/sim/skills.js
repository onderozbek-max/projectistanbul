// Player skills (workstream E1 + v0.5 A): Dash (flick / double-tap / Space; powerbank shortens its cooldown),
// Ultimates chosen in meta (loadout.ult): Nazar Patlaması (charged blast), Düğün Konvoyu (cars sweep down three
// lanes), Vapur Düdüğü (a horn wave that stuns and scatters). Kill-streak Frenzy, Nazar charm (crit + dodge),
// Magnet (pickup radius + vacuum pulse), kask (less from big hits), çay (regen while still), near-miss.
// P.Status: slow / root / stun / foam on enemies. Ult events carry {id}; the sim also emits ultUsed {id}.
P.Skills = {};
P.Status = {};

function sk(s) {
  return s.sk || (s.sk = { dash: null, nearMissDone: false, ultT: 0, ultFull: false, frenzyT: 0, streak: 0,
    lastKillT: -99, snap: [], magnetT: null, pickAdd: 0, sweeps: [], still: 0,
    act: { id: null, t: 0, T: 0, cd: 0, cdT: 0, hits: 0 } });
}

// Street Tree perks (perks.js): s.perk is the learned set, s.pk the per-run state bag (perk keys, see sim.js).
function perkOn(s, id) { return !!(s.perk && s.perk[id]); }
function pkOf(s) { return s.pk || (s.pk = {}); }

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
  if (S.streak >= P.Skills.frenzyThreshold(s) && S.frenzyT <= 0) {
    S.streak = 0; S.frenzyT = K.frenzy.time; pkOf(s).frenzyAdded = 0;
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
function dashMul(s) {
  var att = s.fx && s.fx.dashCdPct ? s.fx.dashCdPct : 0;
  return (1 - (s.hero.passives.powerbank || 0) * P.CFG.passives.powerbank.dashPerLevel) * (1 - att);
}

function tryDash(s, S, input) {
  var h = s.hero, D = P.CFG.skills.dash;
  if (S.dash || h.dashCd > 0 || s.mode !== 'play') return;
  if (P.Modifiers && P.Modifiers.dashBlocked && P.Modifiers.dashBlocked(s)) return;   // daily "Depar yok" (no dash)
  var dx = input.x || 0, dy = input.y || 0, m = Math.hypot(dx, dy);
  if (m > 0.2) { dx /= m; dy /= m; } else {
    dx = h.fx; dy = h.fy; m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
  }
  S.dash = { dx: dx, dy: dy, t: 0, T: D.time, speed: D.dist / D.time };
  S.nearMissDone = false;
  h.dashCd = dashCooldown(s); h.dashCdMax = h.dashCd; h.iframes = D.iframes; h.dashing = true;
  if (perkOn(s, 'pace.1')) perkClearSlow(s);
  s.events.push({ type: 'dash', x: h.x, y: h.y, ax: dx, ay: dy, dist: D.dist, T: D.time });
}

// pace.4 Dolmus Rider: the first dash of the run (each level is one stage) has no cooldown.
function dashCooldown(s) {
  var pk = pkOf(s);
  if (perkOn(s, 'pace.4') && !pk.dolmus) { pk.dolmus = true; return 0; }
  return P.CFG.skills.dash.cooldown * dashMul(s);
}

// pace.1 Quick Feet: a dash clears the hero's slow. The puddle and tea slows that are on now stay off on that wet
// tile (pk.dryPud, pk.dryTea, see P.Skills.wetSlowOn), so the next step does not put them back.
function perkClearSlow(s) {
  var pk = pkOf(s);
  if (s.env && s.env.heroMul < 1) pk.dryPud = true;
  if (s.tea && s.tea.slowT > 0) { s.tea.slowT = 0; pk.dryTea = true; }
}

// pace.2 Slipstream: the dash has passed through slipstream.n distinct enemies. Refund once per dash.
function perkSlipstream(s, d) {
  var C = P.CFG.perks.slipstream, h = s.hero, seen = d.seen || (d.seen = {}), i, e;
  if (d.refunded) return;
  for (i = 0; i < s.enemies.length; i++) {
    e = s.enemies[i];
    if (e.dead || e.state !== 'active') continue;
    if (Math.hypot(e.x - h.x, e.y - h.y) <= e.r + P.CFG.hero.radius) seen[e.id] = true;
  }
  if (Object.keys(seen).length < C.n) return;
  d.refunded = true;
  h.dashCd = Math.max(0, (h.dashCd || 0) - C.refund * h.dashCdMax);
}

function stepDash(s, S, dt) {
  var h = s.hero, d = S.dash;
  d.t += dt;
  var adv = Math.min(dt, d.T - (d.t - dt));
  h.x += d.dx * d.speed * adv; h.y += d.dy * d.speed * adv;
  clampHero(s);
  if (perkOn(s, 'pace.2')) perkSlipstream(s, d);
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

// ---------- Ultimates: loadout.ult (meta), gated by journey level; Nazar is the fallback ----------
P.Skills.ultId = function (s) {
  var id = (s.loadout && s.loadout.ult) || 'nazar', U = P.CFG.ults[id];
  if (U && U.bond && !(s.loadout && s.loadout.bonds && (s.loadout.bonds.kaan | 0) >= U.bond)) return 'nazar';   // a bond ult needs its bond
  return U && (U.unlock || 1) <= (s.levelIndex || 1) ? id : 'nazar';
};

function viewBox(s) {
  var U = P.CFG.skills.ult, V = P.CFG.view;
  return { hw: V.widthM / 2 + U.padM, hh: P.viewHalfH(V.widthM) + U.padM };
}

function ultNazar(s) {
  var h = s.hero, U = P.CFG.skills.ult, B = viewBox(s), n = 0;
  s.enemies.forEach(function (e) {
    if (e.dead || e.state !== 'active') return;
    var dx = e.x - h.x, dy = e.y - h.y;
    if (Math.abs(dx) > B.hw || Math.abs(dy) > B.hh) return;
    var d = Math.hypot(dx, dy) || 0.01;
    n++;
    P.Combat.damageEnemy(s, e, U.damage, dx / d, dy / d, U.push, false, 'ult');
  });
  s.events.push({ type: 'ult', id: 'nazar', x: h.x, y: h.y, hw: B.hw, hh: B.hh, n: n, slowMo: U.slowMo, T: U.time });
}

// Convoy: three lanes (relative to Arda); the cars drive from the bottom of the screen up (world +y is up).
function ultConvoy(s, S) {
  var h = s.hero, C = P.CFG.ults.convoy, B = viewBox(s);
  S.sweeps.push({ kind: 'convoy', t: 0, T: C.T, x0: h.x, y0: h.y - B.hh, hh: B.hh, hit: {} });
  s.events.push({ type: 'ult', id: 'convoy', x: h.x, y: h.y, hw: B.hw, hh: B.hh, lanes: C.lanes, laneW: C.laneW,
    carLen: C.carLen, slowMo: C.slowMo, T: C.T });
}

// Horn: a ring that grows from Arda over T seconds, stunning and scattering whatever it reaches.
function ultHorn(s, S) {
  var h = s.hero, C = P.CFG.ults.horn;
  S.sweeps.push({ kind: 'horn', t: 0, T: C.T, x0: h.x, y0: h.y, hit: {} });
  s.events.push({ type: 'ult', id: 'horn', x: h.x, y: h.y, r: C.r, T: C.T, slowMo: C.slowMo });
}

// Tackle & Stab (Kaan bond 50): Kaan charges from Arda toward the nearest enemy; the sweep (stepSweeps) shoves and stuns what it
// touches, then a stab lands where he stops. The direction is fixed at the cast (the nearest active enemy, else straight up).
function ultTackle(s, S) {
  var h = s.hero, C = P.CFG.ults.tackle, best = null, bd = 1e9, dx = 0, dy = 1, d;
  s.enemies.forEach(function (e) {
    if (e.dead || e.state !== 'active') return;
    d = Math.hypot(e.x - h.x, e.y - h.y);
    if (d < bd) { bd = d; best = e; }
  });
  if (best && bd > 0.01) { dx = (best.x - h.x) / bd; dy = (best.y - h.y) / bd; }
  S.sweeps.push({ kind: 'tackle', t: 0, T: C.T, x0: h.x, y0: h.y, dx: dx, dy: dy, hit: {}, stabbed: false });
  s.events.push({ type: 'ult', id: 'tackle', x: h.x, y: h.y, dx: dx, dy: dy, dist: C.dist, T: C.T, r: C.stabR, slowMo: C.slowMo });
}

var ULT = { nazar: ultNazar, convoy: ultConvoy, horn: ultHorn, tackle: ultTackle };

function tryUlt(s, S) {
  var h = s.hero, U = P.CFG.skills.ult, id;
  if (h.ult < 1 || s.mode !== 'play') return;
  id = P.Skills.ultId(s);
  h.ult = 0; S.ultFull = false; S.ultT = U.time;
  ULT[id](s, S);
  s.events.push({ type: 'ultUsed', id: id });
}

function convoyLane(s, w, lx, car) {
  var C = P.CFG.ults.convoy;
  s.enemies.forEach(function (e) {
    if (e.dead || e.state !== 'active' || w.hit[e.id]) return;
    var dx = e.x - lx, dy = e.y - car;
    if (Math.abs(dx) > C.laneW / 2 + e.r || Math.abs(dy) > C.carLen / 2 + e.r) return;
    var d = Math.hypot(dx, dy) || 0.01;
    w.hit[e.id] = true;
    P.Combat.damageEnemy(s, e, C.dmg, dx / d, dy / d, C.push, false, 'ult');
  });
}

function hornWave(s, w, rad) {
  var C = P.CFG.ults.horn;
  s.enemies.forEach(function (e) {
    if (e.dead || e.state !== 'active' || w.hit[e.id]) return;
    var dx = e.x - w.x0, dy = e.y - w.y0, d = Math.hypot(dx, dy) || 0.01;
    if (d > rad + e.r) return;
    w.hit[e.id] = true;
    P.Combat.damageEnemy(s, e, C.dmg, dx / d, dy / d, C.push, false, 'ult');
    P.Status.apply(e, 'stun', C.stun, 1);
  });
}

// Kaan's charge: the head moves dist metres over T s; whatever it touches is shoved along the charge and stunned (bosses only shoved).
function tackleHead(s, w) {
  var C = P.CFG.ults.tackle, p = Math.min(1, w.t / w.T), hx = w.x0 + w.dx * C.dist * p, hy = w.y0 + w.dy * C.dist * p;
  s.enemies.forEach(function (e) {
    if (e.dead || e.state !== 'active' || w.hit[e.id]) return;
    if (Math.hypot(e.x - hx, e.y - hy) > C.laneW / 2 + e.r) return;
    w.hit[e.id] = true;
    P.Combat.shove(e, w.dx, w.dy, C.push, true);
    if (!e.boss) P.Status.apply(e, 'stun', C.stun, 1);
  });
  return { x: hx, y: hy };
}

// The stab where Kaan stops: damage and a push away from the landing point for every enemy within stabR.
function tackleStab(s, w, at) {
  var C = P.CFG.ults.tackle, n = 0;
  s.enemies.forEach(function (e) {
    if (e.dead || e.state !== 'active') return;
    var dx = e.x - at.x, dy = e.y - at.y, d = Math.hypot(dx, dy) || 0.01;
    if (d > C.stabR + e.r) return;
    n++;
    P.Combat.damageEnemy(s, e, C.stabDmg, dx / d, dy / d, C.stabPush, false, 'ult');
  });
  s.events.push({ type: 'tackleStab', x: at.x, y: at.y, r: C.stabR, n: n });
}

function stepSweeps(s, S, dt) {
  var C = P.CFG.ults, i, w, car;
  for (i = S.sweeps.length - 1; i >= 0; i--) {
    w = S.sweeps[i];
    w.t += dt;
    if (w.kind === 'convoy') {
      car = w.y0 + Math.min(1, w.t / w.T) * 2 * w.hh;
      C.convoy.lanes.forEach(function (lane) { convoyLane(s, w, w.x0 + lane, car); });
    } else if (w.kind === 'tackle') {
      car = tackleHead(s, w);
      if (w.t >= w.T && !w.stabbed) { w.stabbed = true; tackleStab(s, w, car); }
    } else {
      hornWave(s, w, C.horn.r * Math.min(1, w.t / w.T));
    }
    if (w.t >= w.T) S.sweeps.splice(i, 1);
  }
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

// ---------- Çay: regen while standing still ----------
function regenCay(s, S, input, dt) {
  var h = s.hero, lv = h.passives.cay || 0, C = P.CFG.passives.cay;
  var moving = !!S.dash || Math.hypot((input && input.x) || 0, (input && input.y) || 0) > C.deadzone;
  S.still = moving ? 0 : S.still + dt;
  if (lv && S.still >= C.delay) h.hp = Math.min(h.maxHp, h.hp + lv * C.regenPerLevel * dt);
}

// ---------- step ----------
function tickTimers(s, S, dt) {
  if (S.frenzyT > 0) {
    S.frenzyT -= dt;
    if (S.frenzyT <= 0) {
      S.frenzyT = 0; s.events.push({ type: 'frenzy', on: false });
      if (perkOn(s, 'agg.4')) P.Perks.ring(s, s.hero.x, s.hero.y);   // agg.4 Last Laugh
    }
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
  regenCay(s, S, input, dt);
  if (input && input.dash) tryDash(s, S, input);
  if (S.dash) stepDash(s, S, dt);
  if (input && input.skill) tryActive(s, S);
  stepActive(s, S, dt);
  if (input && input.ult) tryUlt(s, S);
  stepSweeps(s, S, dt);
  nearMiss(s, S);
};

// Damage multiplier for weapons (ultimate empowerment).
P.Skills.powerMul = function (s) { return sk(s).ultT > 0 ? P.CFG.skills.ult.powerMul : 1; };

// Cooldown multiplier for weapons (frenzy attack speed, ultimate haste). Applied in Weapons.cdMult.
P.Skills.cdScale = function (s) {
  var S = sk(s), k = 1;
  if (S.frenzyT > 0) k /= 1 + (s.levelIndex >= P.CFG.levels.rampFrom ? P.CFG.skills.frenzy.attackSpeed : P.CFG.skills.frenzy.attackSpeedL1);
  if (S.ultT > 0) k *= P.CFG.skills.ult.cdMul;
  return k;
};

P.Skills.frenzyOn = function (s) { return sk(s).frenzyT > 0; };
P.Skills.dashing = function (s) { return !!sk(s).dash; };

// Kill streak that starts frenzy: agg.1 Hot Streak lowers it (P.CFG.perks.hotStreak), otherwise the base threshold.
P.Skills.frenzyThreshold = function (s) {
  return perkOn(s, 'agg.1') ? P.CFG.perks.hotStreak.threshold : P.CFG.skills.frenzy.threshold;
};

// agg.2 Blood Rush: adds dt seconds to the ACTIVE frenzy (no-op when frenzy is off). The caller checks the perk and
// passes the extension and the cap (P.CFG.perks.bloodRush). The total added in one frenzy never exceeds capT.
P.Skills.extendFrenzy = function (s, dt, capT) {
  var S = sk(s), pk = pkOf(s), add;
  if (!(S.frenzyT > 0)) return;
  add = Math.max(0, Math.min(dt, capT - (pk.frenzyAdded || 0)));
  S.frenzyT += add;
  pk.frenzyAdded = (pk.frenzyAdded || 0) + add;
};

// Wet tiles slow the hero while it stands in one (env-zones heroWet: 'dryPud'; enemies4 frame: 'dryTea'). A dash
// clears that slow (perkClearSlow) and pace.3 Parkour removes it. The dry flag ends when the hero leaves the tile kind.
P.Skills.wetSlowOn = function (s, src, inside) {
  var pk = pkOf(s);
  if (!inside && pk[src]) pk[src] = false;
  return inside && !pk[src] && !perkOn(s, 'pace.3');
};

// Crit chance including the Nazar charm. E2: damageEnemy should roll with this value.
P.Skills.critChance = function (s) {
  var lv = s.hero.passives.nazar || 0;
  return Math.min(1, P.CFG.hero.critChance + lv * P.CFG.passives.nazar.critPerLevel);
};

// Dodge roll for an incoming hit (Nazar charm). E2: call from damageHero before applying damage.
// The Simit Kalkanı shield (active skill) is checked first: it absorbs hits until its count runs out.
P.Skills.tryDodge = function (s, raw, cause) {
  var act = sk(s).act, h = s.hero;
  if (P.Skills.shieldUp(s)) {
    act.hits--;
    if (act.hits <= 0) act.t = 0;
    s.events.push({ type: 'shieldBlock', x: h.x, y: h.y, cause: cause, raw: raw, left: Math.max(0, act.hits) });
    return true;
  }
  var lv = h.passives.nazar || 0;
  if (!lv) return false;
  var N = P.CFG.passives.nazar, p = Math.min(N.dodgeCap, lv * N.dodgePerLevel);
  if (!s.rng.combat.chance(p)) return false;
  s.events.push({ type: 'nazarDodge', x: h.x, y: h.y, cause: cause, raw: raw });
  if (P.Weapons6 && P.Weapons6.dodgeZap) P.Weapons6.dodgeZap(s);   // stormshield: a dodge also zaps
  return true;
};

// ---------- Active skills (W2): one per loadout (loadout.active). Simit Kalkanı (shield) absorbs hits for T seconds;
// Çay Molası (tea) heals over T and slows enemies near Arda. Each has a cooldown shown on the skill button.
P.Skills.activeId = function (s) {
  var id = (s.loadout && s.loadout.active) || P.CFG.skills.activeDefault;
  return P.CFG.skills.active[id] ? id : P.CFG.skills.activeDefault;
};
P.Skills.shieldUp = function (s) { var act = sk(s).act; return act.id === 'shield' && act.t > 0; };

function tryActive(s, S) {
  var id = P.Skills.activeId(s), A = P.CFG.skills.active[id], act = S.act;
  if (act.cd > 0 || act.t > 0 || s.mode !== 'play') return;
  act.id = id; act.t = A.T; act.T = A.T; act.cd = A.cooldown; act.cdT = A.cooldown; act.hits = A.absorb || 0;
  s.events.push({ type: 'skillUsed', id: id, T: A.T, x: s.hero.x, y: s.hero.y });
}

function stepActive(s, S, dt) {
  var act = S.act, h = s.hero, C, id;
  if (act.cd > 0) act.cd = Math.max(0, act.cd - dt);
  if (!(act.t > 0)) return;
  act.t = Math.max(0, act.t - dt);
  id = act.id;
  if (id === 'tea') {
    C = P.CFG.skills.active.tea;
    h.hp = Math.min(h.maxHp, h.hp + h.maxHp * C.heal * dt / C.T);
    s.enemies.forEach(function (e) {
      if (e.dead || e.state !== 'active' || Math.hypot(e.x - h.x, e.y - h.y) - e.r > C.slowR) return;
      P.Status.apply(e, 'slow', C.slowHold, C.slow);
    });
  }
  if (act.t <= 0 && id === 'shield') s.events.push({ type: 'shieldDown', x: h.x, y: h.y });
}

// Kask: big hits (raw >= minHit) lose reducePerLevel per kask level, never below minFrac of the hit.
// Combat.damageHero should call this before armour: raw = P.Skills.hitReduce(s, raw, cause).
P.Skills.hitReduce = function (s, raw, cause) {
  var lv = s.hero.passives.kask || 0, K = P.CFG.passives.kask;
  if (!lv || raw < K.minHit) return raw;
  return Math.max(raw * K.minFrac, raw - lv * K.reducePerLevel);
};

// HUD snapshot for the lead's dash / ultimate / frenzy widgets.
P.Skills.hud = function (s) {
  var S = sk(s), D = P.CFG.skills.dash, a = S.act, noDash = !!(P.Modifiers && P.Modifiers.dashBlocked && P.Modifiers.dashBlocked(s));
  return { dashFrac: noDash ? 0 : Math.max(0, 1 - (s.hero.dashCd || 0) / (s.hero.dashCdMax || D.cooldown)), dashReady: !noDash && !(s.hero.dashCd > 0),
    ult: s.hero.ult || 0, ultReady: (s.hero.ult || 0) >= 1, ultId: P.Skills.ultId(s),
    frenzy: S.frenzyT > 0, frenzyFrac: Math.min(1, S.frenzyT / P.CFG.skills.frenzy.time), threshold: P.Skills.frenzyThreshold(s),
    streak: S.streak,
    active: { id: P.Skills.activeId(s), on: a.t > 0, onFrac: a.T > 0 ? a.t / a.T : 0,
      ready: a.cd <= 0 && !(a.t > 0), cdFrac: a.cdT > 0 ? 1 - a.cd / a.cdT : 1 } };
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
