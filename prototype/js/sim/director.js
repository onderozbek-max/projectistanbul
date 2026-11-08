// Level 1 director: segments, spawns, scripted beats, tutorial, phone call, barks (LD 5-9, GD 6).
P.Director = {};

P.Director.create = function () {
  return {
    seg: 'restaurant', reached: { restaurant: true }, spawned: { A: 0, B: 0, C: 0, D: 0 }, acc: 0,
    flags: {}, hold: { active: false, t: 0 }, zoomOut: false,
    tut: { done: {}, active: null, queue: [] },
    call: { active: false, t: 0, bars: 3, queue: [], sub: null },
    barks: { queue: [], cd: 0, cur: null },
    civilians: [], telegraphs: [], bubbles: [],
  };
};

// ---------- tutorial prompts (one at a time, LD 5) ----------
P.Director.prompt = function (s, id, key, target) {
  var T = s.dir.tut;
  if (T.done[id] || (T.active && T.active.id === id) || T.queue.some(function (q) { return q.id === id; })) return;
  var p = { id: id, key: key, target: target || null };
  if (!T.active) T.active = p; else T.queue.push(p);
};

P.Director.complete = function (s, id) {
  var T = s.dir.tut;
  if (T.done[id]) return;
  T.done[id] = true;
  if (T.active && T.active.id === id) T.active = T.queue.shift() || null;
  else T.queue = T.queue.filter(function (q) { return q.id !== id; });
  s.events.push({ type: 'tutorial', id: id });
};

// ---------- subtitles (phone call) and barks ----------
P.Director.say = function (s, ids) {
  ids.forEach(function (id) { s.dir.call.queue.push(id); });
};

P.Director.bark = function (s, id, who) {
  s.dir.barks.queue.push({ id: id, who: who || 'hero', age: 0 });
};

function updateTalk(s, dt) {
  var c = s.dir.call, b = s.dir.barks, cfg = P.CFG.bark;
  if (c.active) c.t += dt;
  if (c.sub) { c.sub.t -= dt; if (c.sub.t <= 0) c.sub = null; }
  if (!c.sub && c.queue.length) {
    var id = c.queue.shift(), len = P.LINES[id][1].length;
    c.sub = { id: id, t: Math.min(4.5, Math.max(2.2, len * 0.065)) };
  }
  b.cd = Math.max(0, b.cd - dt);
  if (b.cur) { b.cur.t -= dt; if (b.cur.t <= 0) b.cur = null; }
  b.queue.forEach(function (q) { q.age += dt; });
  b.queue = b.queue.filter(function (q) { return q.age < cfg.queueExpire; });
  if (!b.cur && b.cd <= 0 && b.queue.length) {
    b.cur = b.queue.shift(); b.cur.t = cfg.show; b.cd = cfg.cooldown;
    s.events.push({ type: 'bark', id: b.cur.id });
  }
}

// ---------- spawning (doors only, LD 13) ----------
function spawnPoint(s, opts) {
  var h = s.hero, sp = P.CFG.level.spawns, v = P.CFG.view;
  var half = P.viewHalfH(s.dir.zoomOut ? v.holdWidthM : v.widthM) + v.offscreenMargin;
  var ahead = [], behind = [], visible = [], rng = s.rng.spawn;
  P.World.doors().forEach(function (d) {
    var dy = d.y - h.y;
    if (dy > half && dy < half + sp.maxAheadM) ahead.push(d);
    else if (dy < -half && dy > -half - sp.maxBehindM) behind.push(d);
    else if (Math.abs(dy) <= half) visible.push(d);
  });
  var list = opts.behind ? ahead.concat(behind) : ahead, d = null, burst = false;
  if (opts.visibleShare && visible.length && rng.chance(opts.visibleShare)) { d = rng.pick(visible); burst = true; }
  else if (list.length) d = rng.pick(list);
  else if (opts.allowVisible && visible.length) { d = rng.pick(visible); burst = true; }
  if (!d) return null;
  return { x: d.side * 6.5, y: d.y + rng.range(-0.8, 0.8), door: d, burst: burst };
}

function spawnAt(s, type, opts) {
  if (s.enemies.length >= P.CFG.level.spawns.globalCap) return false;
  var pt = spawnPoint(s, opts || {});
  if (!pt) return false;
  P.Combat.spawnEnemy(s, type, pt.x, pt.y, { door: pt.door });
  if (pt.burst) s.events.push({ type: 'doorBurst', x: pt.door.x, y: pt.door.y });
  return true;
}

function runBudget(s, dt, seg, rate, total, pickType, opts) {
  var d = s.dir;
  if (d.spawned[seg] >= total) return;
  d.acc = Math.min(d.acc + rate * dt, 3);
  while (d.acc >= 1 && d.spawned[seg] < total) {
    if (!spawnAt(s, pickType(), opts)) break;
    d.acc -= 1; d.spawned[seg]++;
  }
}

function spawning(s, dt) {
  var d = s.dir, sp = P.CFG.level.spawns, rng = s.rng.spawn;
  if (d.seg === 'A') runBudget(s, dt, 'A', sp.A.rate, sp.A.total, function () { return 'walker'; }, {});
  else if (d.seg === 'B') runBudget(s, dt, 'B', sp.B.rate, sp.B.total, function () { return 'walker'; }, {});
  else if (d.seg === 'C') runBudget(s, dt, 'C', sp.C.rate, sp.C.total, function () {
    return rng.chance(sp.C.runnerShare) ? 'runner' : 'walker';
  }, { behind: sp.C.behind });
  else if (d.seg === 'D' && d.hold.active && d.hold.t < P.CFG.level.spawnStopAt) {
    var ph = sp.D.phases.filter(function (p) { return d.hold.t < p.until; })[0];
    if (ph) runBudget(s, dt, 'D', ph.rate, 1e9, function () { return rng.chance(ph.runner) ? 'runner' : 'walker'; },
      { behind: true, allowVisible: true, visibleShare: sp.D.visibleDoorShare });
  }
}

// ---------- segments and scripted beats ----------
function enterSegment(s, id) {
  var d = s.dir, sp = P.CFG.level.spawns, L = P.CFG.level, i;
  d.reached[id] = true; d.seg = id; d.acc = 0;
  s.events.push({ type: 'segment', id: id });
  if (id === 'A') {
    var cv = L.civilians;
    for (var g = 0; g < cv.groups; g++) {
      var gx = s.rng.ai.range(-5, 5), gy = 9 + g * 5, delay = g * 0.9;
      for (i = 0; i < cv.perGroup; i++) {
        d.civilians.push({ x: gx + s.rng.ai.range(-1, 1), y: gy + s.rng.ai.range(-0.8, 0.8), life: cv.life + delay, delay: delay,
          sp: cv.fleeSpeed * s.rng.ai.range(0.85, 1.15), drift: s.rng.ai.range(-1.2, 1.2), variant: s.rng.ai.int(0, 7),
          walk: s.rng.ai.range(0, 3), scream: i === 0 ? 1.6 : 0 });
      }
    }
    for (i = 0; i < sp.A.initial; i++) if (spawnAt(s, 'walker', { allowVisible: true })) d.spawned.A++;
  } else if (id === 'B') {
    if (d.call.active) P.Director.say(s, ['callB1', 'callB2', 'callB3', 'callB4']);
  } else if (id === 'C') {
    for (i = 0; i < sp.C.initialRunners; i++) if (spawnAt(s, 'runner', { allowVisible: true })) d.spawned.C++;
    if (d.call.active) { d.call.bars = 2; P.Director.say(s, ['callC1', 'callC2']); }
    P.Director.bark(s, 'barkRunners');
  } else if (id === 'D') {
    d.zoomOut = true;
  }
}

function scripted(s, dt) {
  var d = s.dir, h = s.hero, L = P.CFG.level, f = d.flags;
  if (!s.props.doorOpen && s.dinersSpawned && !s.enemies.some(function (e) { return e.type === 'diner'; })) {
    s.props.doorOpen = true;
    s.events.push({ type: 'doorOpen' });
    P.Director.bark(s, 'barkDoor');
  }
  if (!f.grab && h.y >= L.grabY) {
    f.grab = true;
    var g = P.Combat.spawnEnemy(s, 'walker', 2.5, L.grabY + 10, { state: 'turning', stateT: 1.2 });
    g.civ = true;
    s.events.push({ type: 'grab', x: g.x, y: g.y });
  }
  if (!f.chestnut && h.y >= L.chestnutBarkY) { f.chestnut = true; P.Director.bark(s, 'barkChestnut'); }
  if (!f.cluster && h.y >= L.clusterY) {
    f.cluster = true;
    for (var i = 0; i < L.clusterCount; i++) {
      P.Combat.spawnEnemy(s, 'walker', 6.2 - (i % 3) * 0.6, L.clusterDoorY + (Math.floor(i / 3) - 1) * 0.7, {});
    }
  }
  var can = s.props.canisters[0];
  if (!d.tut.done.t_env) {
    if (!can.alive || h.y > 120) P.Director.complete(s, 't_env');
    else if (h.y > 80 && s.enemies.filter(function (e) { return Math.hypot(e.x - can.x, e.y - can.y) < 3; }).length >= 3) {
      P.Director.prompt(s, 't_env', 'prompt.t_env', { x: can.x, y: can.y });
    }
  }
  if (!f.cat && h.y >= L.catTriggerY) {
    f.cat = true;
    d.bubbles.push({ x: L.cat.x, y: L.cat.y, text: '!', t: 1.8 });
    d.telegraphs.push({ x: L.manhole.x, y: L.manhole.y, r: 0.8, t: 0, T: L.crawlerTelegraph, then: 'crawler' });
    s.events.push({ type: 'catHiss' });
  }
  var EL = L.elites;
  if (!f.elite1 && h.y >= EL.firstY - 11) {
    f.elite1 = true;
    P.Combat.spawnEnemy(s, 'walker', EL.firstX, EL.firstY, { elite: true });
    P.Director.bark(s, 'barkElite');
  }
  if (!d.hold.active && h.y >= L.holdTriggerY) startHold(s);
  if (d.hold.active) updateHold(s, dt);
}

function startHold(s) {
  var d = s.dir;
  d.hold.active = true; d.hold.t = 0;
  s.props.scaffoldDown = true;
  s.events.push({ type: 'scaffold', trauma: P.CFG.feel.scaffoldTrauma });
  s.events.push({ type: 'holdStart' });
  P.Director.bark(s, 'barkShop', 'shop');
  P.Director.prompt(s, 't_hold', 'prompt.t_hold');
  if (d.call.active) { d.call.bars = 1; P.Director.say(s, ['callD1']); }
}

function updateHold(s, dt) {
  var d = s.dir, L = P.CFG.level;
  d.hold.t += dt;
  if (!d.flags.elite2 && d.hold.t >= L.elites.holdT) {
    d.flags.elite2 = true;
    P.Combat.spawnEnemy(s, 'walker', Math.max(-5.5, Math.min(5.5, s.hero.x + 3)), s.hero.y > 216 ? s.hero.y - 7 : s.hero.y + 7, { elite: true });
  }
  s.props.shutter = Math.min(1, d.hold.t / L.holdTime);
  if (s.props.shutter >= 1 && !s.props.shutterOpen) {
    s.props.shutterOpen = true;
    d.call.bars = 0;
    P.Director.complete(s, 't_hold');
    P.Director.prompt(s, 'exit', 'prompt.exit', { x: 7.6, y: (L.shutter.yMin + L.shutter.yMax) / 2 });
    s.events.push({ type: 'shutterOpen' });
  }
  if (s.props.shutterOpen && P.World.inShutter(s.hero)) {
    P.Director.complete(s, 'exit');
    s.mode = 'won';
    s.events.push({ type: 'win' });
  }
}

function tutorialChecks(s) {
  var d = s.dir, h = s.hero;
  if (!d.tut.done.t_move && h.moved >= 2) P.Director.complete(s, 't_move');
  if (!d.flags.attackBark && s.swings > 0) { d.flags.attackBark = true; P.Director.bark(s, 'barkAttack'); }
  if (!d.tut.done.t_attack && s.kills > 0) P.Director.complete(s, 't_attack');
  if (!d.tut.done.t_xp) {
    if (s.xpPicked > 0) P.Director.complete(s, 't_xp');
    else {
      var far = s.drops.filter(function (x) { return x.kind === 'xp' && Math.hypot(x.x - h.x, x.y - h.y) > h.pickupRadius; })[0];
      if (far) P.Director.prompt(s, 't_xp', 'prompt.t_xp', far);
    }
  }
  if (!d.tut.done.t_card && s.cardPicks > 0) {
    P.Director.complete(s, 't_card');
    d.call.active = true; d.call.bars = 3;
    P.Director.say(s, ['callA1', 'callA2', 'callA3']);
    s.events.push({ type: 'callStart' });
  }
}

function updateDecor(s, dt) {
  var d = s.dir;
  d.civilians.forEach(function (c) {
    c.life -= dt;
    if (c.delay > 0) { c.delay -= dt; c.scared = false; return; }
    c.scared = true;
    var away = c.x - s.hero.x, push = Math.abs(away) < 2.2 && Math.abs(c.y - s.hero.y) < 3 ? Math.sign(away || 1) * 3 : 0;
    c.x = Math.max(-6.6, Math.min(6.6, c.x + (c.drift + push) * dt)); c.y -= c.sp * dt; c.walk += c.sp * dt;
    c.scream = Math.max(0, c.scream - dt);
  });
  d.civilians = d.civilians.filter(function (c) { return c.life > 0 && c.y > -0.5; });
  d.bubbles.forEach(function (b) { b.t -= dt; });
  d.bubbles = d.bubbles.filter(function (b) { return b.t > 0; });
  for (var i = d.telegraphs.length - 1; i >= 0; i--) {
    var tg = d.telegraphs[i];
    tg.t += dt;
    if (tg.t < tg.T) continue;
    d.telegraphs.splice(i, 1);
    if (tg.then === 'crawler') {
      P.Combat.spawnEnemy(s, 'crawler', tg.x, tg.y, {});
      P.Director.complete(s, 't_cat');
      s.events.push({ type: 'crawler' });
    }
  }
}

P.Director.step = function (s, dt) {
  var segs = P.CFG.level.segments, h = s.hero, d = s.dir;
  for (var i = 0; i < segs.length; i++) if (!d.reached[segs[i].id] && h.y >= segs[i].y0) enterSegment(s, segs[i].id);
  scripted(s, dt);
  spawning(s, dt);
  tutorialChecks(s);
  updateTalk(s, dt);
  updateDecor(s, dt);
};
