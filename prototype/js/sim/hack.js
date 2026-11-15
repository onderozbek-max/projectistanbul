// Hacking (v0.5, workstream B). Terminals: ATM, traffic light, signal booster, electric shutter, car alarm, tram box.
// Stand in the zone to link in: progress fills at (1 + hackSpeedPct) (INT), slowed by zombies near the terminal,
// and decays when you leave. Hacking makes noise: a small wave spawns and nearby zombies are lured to the box.
// Outcomes: atm coins, traffic stun wave, cell booster signalRestored (L1: Mom's call), shutter chest and shortcut,
// car alarm lure (blows up with enough zombies around), tram box lane surge (crush). Tuning: P.CFG.hack.
// Events: hackStart, hackProgress (throttled), hackDone {kind}, hackFail, hackNoise, plus the outcome events.
P.Hack = {};

P.Hack.place = function (s, kind, x, y) {
  var H = { id: s.ev.nextId++, kind: kind, x: x, y: y, r: P.CFG.hack.r, prog: 0, state: 'idle', t: 0, slow: 1,
    near: 0, alarm: 0, rush: 0, tickT: 0, doneT: 0 };
  s.hacks.push(H);
  if (s.dir && !s.dir.tut.done.t_hack) P.Director.prompt(s, 't_hack', 'prompt.hack', H);
  return H;
};

// Bonus outcomes when INT is past the threshold (hackSpeedPct from attributes).
P.Hack.bonus = function (s) { return s.fx.hackSpeedPct >= P.CFG.hack.bonusAt; };

P.Hack.step = function (s, dt) {
  var list = s.hacks, h = s.hero, act = null, i, t;
  for (i = 0; i < list.length; i++) {
    t = list[i];
    if (t.state === 'done') t.doneT += dt;
    if (t.alarm > 0) carAlarm(s, t, dt);
    if (t.rush > 0) t.rush = Math.max(0, t.rush - dt);
    if (t.state !== 'done' && Math.hypot(h.x - t.x, h.y - t.y) <= t.r && !act) act = t;
  }
  for (i = 0; i < list.length; i++) {
    t = list[i];
    if (t.state === 'active' && t !== act) decay(s, t, dt);
  }
  if (act) advance(s, act, dt);
  s.hacks = list.filter(function (x) {
    return x.state !== 'done' || x.doneT < P.CFG.hack.fadeT || x.alarm > 0 || x.rush > 0;
  });
  if (s.pk.mark) markExpire(s);
};

// Progress while the hero is inside the zone.
function advance(s, H, dt) {
  var C = P.CFG.hack, n = P.Events.near(s, H.x, H.y, C.slowR).length;
  if (H.state !== 'active') startHack(s, H);
  H.near = n;
  H.slow = Math.max(C.slowMin, 1 / (1 + C.slowPer * n));
  H.prog = Math.min(1, H.prog + dt * (1 + s.fx.hackSpeedPct) * H.slow / C.T);
  H.tickT += dt;
  if (H.tickT >= C.tick) {
    H.tickT = 0;
    s.events.push({ type: 'hackProgress', id: H.id, kind: H.kind, x: H.x, y: H.y, frac: H.prog, slow: H.slow, near: n });
  }
  if (H.prog >= 1) finish(s, H);
}

function decay(s, H, dt) {
  H.near = 0;
  if (s.perk['int.2'] && !s.pk.look) { s.pk.look = 1; fail(s, H, true); return; }   // Second Look (int.2): once per run
  H.prog = Math.max(0, H.prog - dt * P.CFG.hack.decay / P.CFG.hack.T);
  if (H.prog > 0) return;
  fail(s, H, false);
}

function fail(s, H, kept) {
  var ev = { type: 'hackFail', id: H.id, kind: H.kind, x: H.x, y: H.y, reason: 'left' };
  H.state = 'idle';
  if (kept) ev.kept = true;
  s.events.push(ev);
}

function startHack(s, H) {
  H.state = 'active'; H.tickT = 0;
  s.events.push({ type: 'hackStart', id: H.id, kind: H.kind, x: H.x, y: H.y });
  if (!s.perk['int.1']) noiseWave(s, H);   // Quick Fingers (int.1): a quiet hack spawns nobody and lures nobody
  if (s.levelIndex === 1) P.Director.bark(s, 'barkHack');
}

// Hacking makes noise: a small wave spawns and nearby zombies are lured to the box.
function noiseWave(s, H) {
  var N = P.CFG.hack.noise;
  for (var i = 0; i < N.wave; i++) {
    var p = P.Events.farSpot(s, H.x, H.y, N.spawnMin, N.spawnMax, false);
    if (p) P.Events.spawn(s, null, 'walker', p.x, p.y, {});
  }
  P.Events.near(s, H.x, H.y, N.lureR).forEach(function (e) {
    if (!e.boss) e.lure = { x: H.x, y: H.y, t: N.lureT };
  });
  s.events.push({ type: 'hackNoise', id: H.id, x: H.x, y: H.y, n: N.wave });
}

function finish(s, H) {
  H.state = 'done'; H.prog = 1; H.doneT = 0;
  if (s.dir) P.Director.complete(s, 't_hack');
  s.tally.hacks++;
  s.events.push({ type: 'hackDone', id: H.id, kind: H.kind, x: H.x, y: H.y, bonus: P.Hack.bonus(s) });
  var OUT = OUTCOMES[H.kind];
  if (OUT) OUT(s, H, P.Hack.bonus(s));
}

// ---------- outcomes ----------
var OUTCOMES = {
  atm: function (s, H, bonus) {
    var A = P.CFG.hack.atm;
    P.Events.coins(s, H.x, H.y, A.coins + (bonus ? A.bonus : 0), A.coinV);
  },
  traffic: function (s, H, bonus) {
    var T = P.CFG.hack.traffic, stun = (T.stunT + (bonus ? T.bonusT : 0)) * backdoor(s);
    P.Events.near(s, H.x, H.y, T.r).forEach(function (e) { if (P.Status && P.Status.apply) P.Status.apply(e, 'stun', stun); });
    s.events.push({ type: 'stunWave', id: H.id, x: H.x, y: H.y, r: T.r, T: stun });
  },
  cell: function (s, H) {
    s.events.push({ type: 'signalRestored', id: H.id, source: 'hack', x: H.x, y: H.y });
    P.Director.onSignal(s);
    if (s.perk['int.3']) markNext(s, H);   // Signal Boost (int.3)
  },
  shutter: function (s, H, bonus) {
    var S = P.CFG.hack.shutter, n = S.chest + (bonus ? 1 : 0);
    for (var i = 0; i < n; i++) P.Events.drop(s, 'chest', H.x + i * S.spread, H.y, P.CFG.ev.chest.drop, S.pop);
    var b = nearestBlock(s, H, S.shortR);
    if (b) {
      s.geo.blocks.splice(s.geo.blocks.indexOf(b), 1);
      s.events.push({ type: 'shortcut', id: H.id, x: b.x, y: b.y });
    }
  },
  car: function (s, H) {
    var A = P.CFG.hack.car;
    H.alarm = A.lureT;
    P.Events.near(s, H.x, H.y, A.lureR).forEach(function (e) {
      if (!e.boss) e.lure = { x: H.x, y: H.y, t: A.lureT };
    });
    s.events.push({ type: 'carAlarm', id: H.id, x: H.x, y: H.y, T: A.lureT });
  },
  tram: function (s, H) {
    var T = P.CFG.hack.tram, x0 = H.x - T.w / 2, x1 = H.x + T.w / 2, y0 = H.y - T.back, y1 = H.y + T.len * backdoor(s);
    H.rush = T.rushT; H.lane = T.len * backdoor(s);
    s.events.push({ type: 'tramRush', id: H.id, x: H.x, y0: y0, y1: y1, w: T.w });
    for (var i = 0; i < s.enemies.length; i++) {
      var e = s.enemies[i];
      if (e.dead || e.boss || e.x < x0 || e.x > x1 || e.y < y0 || e.y > y1) continue;
      P.Combat.damageEnemy(s, e, T.dmg, 0, 1, T.kb, false, 'tram');
    }
  },
};

// Car alarm: the car blows up when it ends if enough zombies are next to it.
function carAlarm(s, H, dt) {
  var A = P.CFG.hack.car;
  H.alarm = Math.max(0, H.alarm - dt);
  if (H.alarm > 0) return;
  var n = P.Events.near(s, H.x, H.y, A.nearR).length;
  if (n >= A.minLured) P.EventKinds.blast(s, H.x, H.y, P.CFG.ev.car);
  else s.events.push({ type: 'carQuiet', id: H.id, x: H.x, y: H.y, n: n });
}

function nearestBlock(s, H, r) {
  if (!s.geo) return null;
  var best = null, bd = r;
  s.geo.blocks.forEach(function (b) {
    if (b.station) return;   // an eczane station is not cover for the signal box's shortcut (R1-T4 part 14)
    var d = Math.hypot(b.x - H.x, b.y - H.y);
    if (d < bd) { bd = d; best = b; }
  });
  return best;
}

// ---------- Street Tree perks (R1-T5). Each hook runs only when its perk is learned (s.perk). ----------
// Backdoor (int.4): multiplier on the traffic stun and on the length of the tram crush lane. Not the ATM payout.
function backdoor(s) { return s.perk['int.4'] ? P.CFG.perks.backdoor.mul : 1; }

// Signal Boost (int.3): the next terminal in list order (wrapping round) that is not done gets the mark.
function markNext(s, H) {
  var list = s.hacks, n = list.length, at = list.indexOf(H), k, t;
  for (k = 1; k < n; k++) {
    t = list[(at + k) % n];
    if (t.state !== 'done') { s.pk.mark = { id: t.id, until: s.t + P.CFG.perks.signalBoost.markT }; return; }
  }
}

// The mark ends when its terminal is hacked or gone, or when its time runs out.
function markExpire(s) {
  var m = s.pk.mark, t = s.hacks.filter(function (x) { return x.id === m.id; })[0];
  if (!t || t.state === 'done' || s.t >= m.until) delete s.pk.mark;
}
