// Arda's quips (workstream D, v0.5; v0.7 native pools): short comic bubbles over Arda, and talk with the zombies around him.
// Lines: native pools P.BarkPools[lang][poolKey] = [{ t: 'text', j: 1 if a joke }] (strings-barks-tr.js / -en.js), where
// poolKey is the pool prefix without its trailing dot (e.g. 'BK.fk.walker'). A missing pool falls back to the P.LINES
// pairs (strings-barks.js, ids BK.*). Wiring: P.Barks.onEvent(ev, s) for every sim event; P.Barks.update(dt, s) each
// play frame; P.Barks.offer(R, s) is an arbiter provider (P.Speech places the bubble); P.Barks.draw(R, s) draws it.
// Rules: at most one bark start per 10-19 s; no barks while a comic page or pop is up (P.Comic.active) or the legacy
// director bark is showing; each pool cycles before a line repeats and never repeats back to back; at most one joke per
// 25-40 s of play (jokes wait for the budget, other lines fill the rest); zq / zr / zreact chains pick the same index
// when the three native pools have equal length; a bark with no free slot waits and is dropped after CFG.waitMax s.
P.Barks = (function () {
  var B = {}, A = P.ComicArt, T = P.ComicText, L = P.ComicLayout, S = null, measureCv = null, uid = 0;
  var NAT = {};                                     // 'nat:<poolKey>#<i>' -> pool entry {t, j}
  var CFG = {
    gapMin: 10.4, gapMax: 18.2,                      // global gap between bark starts (s): 8-14 s before the calmer pass (+30%)
    ambientMin: 11.7, ambientMax: 20.8,              // one ambient candidate every 12-21 s
    popIn: 0.2, fade: 0.3, holdBase: 1.6, holdChar: 0.045, holdMin: 2.0, holdMax: 4.2,
    maxW: 196, pxs: [15, 14, 13, 12],               // bubble width (px), type sizes (largest first)
    ttl: { 1: 4, 2: 6, 3: 10 },                      // a queued candidate expires after this long (s), by priority
    waitMax: 1.6,                                    // a placed-out bubble is dropped after this long without a slot (s)
    jokeMin: 25, jokeMax: 40,                        // joke budget: one joke line per 25-40 s of play
    envNear: 8,                                      // an env event (B.say) gets a bark only within this many m of Arda
    sightR: 7,                                       // first sighting: an active enemy of a new type within this many m
    // Cooldowns (s) per category, +30% on v0.5 values (act 18, dash 20, near 15, close 20, still 25, idle 25, self 22,
    // zq 25, elite 20, low 60, ult 12); env and skill are new in v0.7.
    cool: { act: 23.4, dash: 26, near: 19.5, close: 26, still: 32.5, idle: 32.5, self: 28.6, zq: 32.5, elite: 26, low: 78, ult: 15.6,
      env: 20, skill: 26 }
  };
  var AMBIENT = { close: 1, zq: 1, still: 1, idle: 1, self: 1 };
  // Pools: id prefixes in P.LINES. A prefix matches ids whose rest has no dot ('BK.fk.walker.' matches 'BK.fk.walker.2').
  B.pools = { fk: 'BK.fk.', streak: 'BK.streak.', boss: 'BK.boss.', elite: 'BK.elite.', low: 'BK.low.', heal: 'BK.heal.',
    lvl: ['BK.lvlA.', 'BK.lvlB.', 'BK.lvlC.', 'BK.lvlD.'], card: 'BK.card.', mod: 'BK.mod.', mastery: 'BK.mastery.',
    evo: 'BK.evo.', ult: 'BK.ult.', ultr: 'BK.ultr.', dash: 'BK.dash.', near: 'BK.near.', nazar: 'BK.nazar.',
    frenzy: 'BK.frenzy.', hack: 'BK.hack.', ev: 'BK.ev.', evend: 'BK.evend.', rescue: 'BK.rescue.',
    sig: ['BK.sig.lost.', 'BK.sig.back.'], act: 'BK.act.', idle: 'BK.idle.', still: 'BK.still.', close: 'BK.close.',
    zq: 'BK.zq.', zr: 'BK.zr.', zreact: 'BK.zreact.', self: 'BK.self.', mom: 'BK.mom.', dad: 'BK.dad.', hood: 'BK.hd',
    skill: 'BK.skill.', obj: 'BK.obj.', bossPhase: 'BK.boss.phase.', env: 'BK.env.' };
  // Pools named after a sim kind when the kind has another name: hacks (cell, car) and events (loot, hazard).
  var HACK_POOL = { cell: 'booster', car: 'alarm' }, EV_POOL = { loot: 'lootRunner', hazard: 'burningCar' };

  // ---------- state and helpers ----------
  function mulberry(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0; var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function newState(seed, on) {
    return { on: on, rng: mulberry(seed), clock: 0, gap: 3, ambient: 6, q: [], act: null, bub: null, cool: {}, used: {},
             last: null, seen: {}, streak: 0, lastKillT: -99, armed: true, still: 0, lastLevel: -1, sigUntil: 0,
             forced: null, evT: {}, starts: [], jokeGate: 12, met: {}, hero: null };
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function easeOutBack(x) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
  function rand(a, b) { return a + (b - a) * S.rng(); }
  function meas() { if (!measureCv) measureCv = document.createElement('canvas').getContext('2d'); return measureCv; }
  var keyCache = {};
  function keysOf(prefix) {
    if (!keyCache[prefix]) {
      keyCache[prefix] = Object.keys(P.LINES).filter(function (k) {
        return k.indexOf(prefix) === 0 && k.slice(prefix.length).indexOf('.') < 0;
      }).sort();
    }
    return keyCache[prefix];
  }
  // The native pool for a prefix ('BK.fk.walker.' -> P.BarkPools[lang]['BK.fk.walker']), or null.
  function nativeList(prefix) {
    var pools = P.BarkPools && P.BarkPools[P.lang], k = prefix.replace(/\.$/, '');
    return pools && pools[k] && pools[k].length ? { key: k, list: pools[k] } : null;
  }
  function avail(prefix) { return !!nativeList(prefix) || keysOf(prefix).length > 0; }
  function jokesOpen() { return S.clock >= S.jokeGate; }

  // A native line: every entry once before any repeats, never the line shown last, jokes only inside the budget.
  // pin: a fixed index (zombie chains). Returns the key 'nat:<pool>#<i>' or null.
  function pickNative(np, pin) {
    var used = S.used[np.key] || (S.used[np.key] = {}), open = jokesOpen(), cand = [], i, k;
    function ok(i, fresh) {
      var e = np.list[i], key = 'nat:' + np.key + '#' + i;
      if (!e || !e.t || (!open && e.j) || key === S.last) return false;
      return !fresh || !used[key];
    }
    if (pin != null && ok(pin, false)) i = pin;
    else {
      for (i = 0; i < np.list.length; i++) if (ok(i, true)) cand.push(i);
      if (!cand.length) { used = S.used[np.key] = {}; for (i = 0; i < np.list.length; i++) if (ok(i, false)) cand.push(i); }
      if (!cand.length) return null;
      i = cand[Math.floor(S.rng() * cand.length)];
    }
    k = 'nat:' + np.key + '#' + i;
    used[k] = true; S.last = k; NAT[k] = np.list[i];
    return k;
  }
  // The old pick over P.LINES ids: every line once before any repeats, never the line shown last.
  function pickFallback(prefix) {
    var list = keysOf(prefix), used, free, id;
    if (!list.length) return null;
    used = S.used[prefix] || (S.used[prefix] = {});
    free = list.filter(function (k) { return !used[k] && k !== S.last; });
    if (!free.length) { used = S.used[prefix] = {}; free = list.filter(function (k) { return k !== S.last; }); }
    if (!free.length) free = list;
    id = free[Math.floor(S.rng() * free.length)];
    used[id] = true; S.last = id;
    return id;
  }
  function pick(prefix, pin) {
    var np = nativeList(prefix);
    return np ? pickNative(np, pin) : pickFallback(prefix);
  }
  function textOf(id) {
    if (id.indexOf('nat:') === 0) return NAT[id] ? NAT[id].t : '';
    return P.line(id).text;
  }
  // Zombie chain: one index for zq, zr and zreact when the three native pools match in length (else independent).
  function chainPin() {
    var a = nativeList(B.pools.zq), b = nativeList(B.pools.zr), c = nativeList(B.pools.zreact), i, cand = [];
    if (!a || !b || !c || a.list.length !== b.list.length || a.list.length !== c.list.length) return null;
    for (i = 0; i < a.list.length; i++) {
      if (jokesOpen() || !(a.list[i].j || b.list[i].j || c.list[i].j)) cand.push(i);
    }
    return cand.length ? cand[Math.floor(S.rng() * cand.length)] : null;
  }
  function cooling(cat) { return !!cat && CFG.cool[cat] !== undefined && S.cool[cat] > S.clock; }
  function cool(cat) { if (cat && CFG.cool[cat] !== undefined) S.cool[cat] = S.clock + CFG.cool[cat]; }
  function dedupe(key, win) {
    if (S.clock - (S.evT[key] === undefined ? -99 : S.evT[key]) < win) return false;
    S.evT[key] = S.clock; return true;
  }

  // ---------- queue ----------
  // steps: [{who: 'arda' | 'zombie', prefix, at (s after start), z (zombie object for replies), pin}]. delay: s before it may start.
  function queue(pri, cat, steps, delay) {
    if (!S.on || cooling(cat)) return;
    if (cat && S.q.some(function (c) { return c.cat === cat; })) return;
    S.q.push({ pri: pri, cat: cat, steps: steps, age: -(delay || 0), ttl: CFG.ttl[pri] });
  }
  function want(pri, cat, prefix, delay) {
    if (avail(prefix)) queue(pri, cat, [{ who: 'arda', prefix: prefix, at: 0 }], delay);
  }
  function ageQueue(dt) {
    S.q.forEach(function (c) { c.age += dt; });
    S.q = S.q.filter(function (c) { return c.age <= c.ttl; });
  }
  function startNext() {
    var best = -1, i, c;
    for (i = 0; i < S.q.length; i++) {
      c = S.q[i];
      if (c.age < 0 || cooling(c.cat)) continue;
      if (best < 0 || c.pri > S.q[best].pri || (c.pri === S.q[best].pri && c.age > S.q[best].age)) best = i;
    }
    if (best < 0) return;
    c = S.q.splice(best, 1)[0];
    cool(c.cat);
    S.gap = rand(CFG.gapMin, CFG.gapMax);
    S.act = { steps: c.steps, i: -1, t: 0 };
    S.starts.push(S.clock); if (S.starts.length > 200) S.starts.shift();
    advanceAct(0);
  }

  // ---------- scenes and bubbles ----------
  function advanceAct(dt) {
    var a = S.act;
    a.t += dt;
    while (a.i + 1 < a.steps.length && a.t >= a.steps[a.i + 1].at) { a.i++; showStep(a.steps[a.i]); }
    if (a.i + 1 >= a.steps.length) S.act = null;
  }
  function showStep(st) {
    if (!A.ready) return;   // lettering faces still loading: skip this bark rather than measure the wrong face
    var id = pick(st.prefix, st.pin);
    if (!id || (st.who === 'zombie' && (!st.z || st.z.dead))) return;
    if (id.indexOf('nat:') === 0 && NAT[id].j) S.jokeGate = S.clock + rand(CFG.jokeMin, CFG.jokeMax);
    var b = makeBubble(id, st.who);
    b.z = st.z || null;
    S.bub = b;
    if (P.Sfx && P.Sfx.play) {
      if (st.who === 'zombie') P.Sfx.play('groan', 150, { voice: 'other' });
      else P.Sfx.play('speech', 55, { voice: 'arda' });
    }
  }
  // Wraps the line to the bubble width (caps, speech font). Zombie replies are jagged, greenish shouts. Never truncated:
  // a long line takes smaller type steps (CFG.pxs), then the bubble simply gets taller (f.ok false = audit overflow).
  function layout(id, text, who) {
    var caps = P.upper(text), c = meas(), shout = who === 'zombie', kind = shout ? 'shout' : 'speech';
    var ins = T.insets(kind, false), f = T.fit(c, caps, CFG.maxW - 2 * ins.x, 170, 'speech', CFG.pxs);
    var textW = T.widest(c, f.lines, 'speech', f.px);
    var w = Math.max(96, textW + 2 * ins.x);
    return { id: id, who: who, lines: f.lines, px: f.px, lh: f.lh, w: Math.min(w, CFG.maxW + 40), h: T.boxH(f.lines, f.lh, false, kind),
             kind: kind, fill: shout ? '#C4F27A' : null, caps: caps, ok: f.ok,
             hold: clamp(CFG.holdBase + CFG.holdChar * caps.length, CFG.holdMin, CFG.holdMax), age: 0, z: null, placed: false, wait: 0, pos: null };
  }
  function makeBubble(id, who) { var b = layout(id, textOf(id), who); b.uid = ++uid; return b; }

  // ---------- context ----------
  function nearestZombie(s, maxD) {
    var h = s.hero, best = null;
    if (!h) return null;
    (s.enemies || []).forEach(function (e) {
      if (e.dead || e.boss || e.state === 'dormant') return;
      var d = Math.hypot(e.x - h.x, e.y - h.y);
      if (d <= maxD && (!best || d < best.d)) best = { z: e, d: d };
    });
    return best;
  }
  // No signal after level 1 unless a call (callStart) or a signalRestored event says otherwise.
  function noSignal(s) {
    if (S.clock < S.sigUntil) return false;
    if (S.forced !== null) return !S.forced;
    return (s.levelIndex || 1) > 1;
  }
  function blocked(s) {
    return !!(P.Comic && P.Comic.active && P.Comic.active()) || !!(s.dir && s.dir.barks && s.dir.barks.cur);
  }
  function onLevel(s) {
    var L = s.levelInfo, n = s.levelIndex, hh;
    if (!L || n == null || n === S.lastLevel) return;
    S.lastLevel = n; S.levelT = S.clock;
    hh = (L.hoodIndex < 9 ? '0' : '') + (L.hoodIndex + 1);
    if (L.stage === 1) want(3, null, B.pools.hood + hh + '.1', 1.5);
    else want(2, null, B.pools.hood + hh + '.' + L.stage, 3);
  }
  function talkToZombie(z) {
    var pin = chainPin(), steps = [{ who: 'arda', prefix: B.pools.zq, at: 0, pin: pin }];
    if (S.rng() < 0.45) steps.push({ who: 'zombie', prefix: B.pools.zr, at: 1.4, z: z, pin: pin }, { who: 'arda', prefix: B.pools.zreact, at: 3.0, pin: pin });
    queue(1, 'zq', steps);
  }
  // First sighting of an enemy type this run: the first active one within CFG.sightR m of Arda (entrances the event
  // covers too; S.met keeps each type to one line). One new type per frame.
  function scanSightings(s) {
    var h = s.hero, list = s.enemies || [], i, e;
    if (!h) return;
    for (i = 0; i < list.length; i++) {
      e = list[i];
      if (e.dead || e.boss || e.state !== 'active' || S.met[e.type]) continue;
      if (Math.hypot(e.x - h.x, e.y - h.y) > CFG.sightR) continue;
      S.met[e.type] = true; want(2, null, B.pools.fk + e.type + '.');
      return;
    }
  }
  function selfTalk() {
    var r = S.rng();
    want(1, 'self', r < 0.6 ? B.pools.self : r < 0.8 ? B.pools.mom : B.pools.dad);
  }
  // One ambient candidate every 12-21 s, chosen from what is true right now.
  function ambientTick(dt, s) {
    S.ambient -= dt;
    if (S.ambient > 0) return;
    S.ambient = rand(CFG.ambientMin, CFG.ambientMax);
    if (S.q.some(function (c) { return AMBIENT[c.cat]; })) return;
    var near = nearestZombie(s, 3.2), opts = [];
    if (near && near.d < 1.1) opts.push(function () { want(1, 'close', B.pools.close); });
    if (near && near.d >= 1.6 && S.rng() < 0.4) opts.push(function () { talkToZombie(near.z); });
    if (S.still > 6) opts.push(function () { want(1, 'still', B.pools.still); });
    if (S.still > 12 && S.clock - S.lastKillT > 12) opts.push(function () { want(1, 'idle', B.pools.idle); });
    if (noSignal(s)) opts.push(selfTalk);
    if (opts.length) opts[Math.floor(S.rng() * opts.length)]();
  }

  // ---------- events ----------
  var H = {};
  H.kill = function (ev) {
    var t = S.clock;
    S.streak = t - S.lastKillT <= 2.5 ? S.streak + 1 : 1;
    S.lastKillT = t;
    if (ev.enemy && !S.seen[ev.enemy]) { S.seen[ev.enemy] = true; want(3, null, B.pools.fk + ev.enemy + '.'); }
    if (ev.elite && !S.seen.elite) { S.seen.elite = true; want(2, null, B.pools.fk + 'elite.'); }
    [10, 25, 50, 100].forEach(function (n) { if (S.streak === n) want(2, null, B.pools.streak + n + '.'); });
  };
  H.heroHit = function (ev, s) {
    var mx = s.hero && s.hero.maxHp, f;
    if (!mx || ev.hp == null) return;
    f = ev.hp / mx;
    if (f <= 0.3 && S.armed) { S.armed = false; want(2, 'low', B.pools.low); }
    else if (f > 0.5) S.armed = true;
  };
  H.pickup = function (ev) { if (ev.kind === 'simit' || ev.kind === 'medkit' || ev.kind === 'heal') want(1, null, B.pools.heal); };
  H.levelup = function (ev, s) {
    var n = ev.level || s.level || 1;
    want(2, null, B.pools.lvl[n <= 3 ? 0 : n <= 6 ? 1 : n <= 9 ? 2 : 3]);
  };
  H.cardChosen = function (ev) {
    var pre = B.pools.card + ev.item + '.';
    want(2, null, avail(pre) ? pre : B.pools.card + 'gen.');
  };
  H.modChosen = function () { want(2, null, B.pools.mod); };
  H.masteryMove = function () { want(2, null, B.pools.mastery); };
  H.evolve = function (ev) {
    var pre = B.pools.evo + ev.to + '.';
    want(3, null, avail(pre) ? pre : B.pools.evo + 'gen.', Math.max(1.2, ev.T || 2.5));
  };
  H.ult = function () { if (dedupe('ult', 1)) want(2, 'ult', B.pools.ult); };
  H.ultUsed = H.ult;
  H.ultReady = function () { want(1, null, B.pools.ultr); };
  H.dash = function () { want(1, 'dash', B.pools.dash); };
  H.nearMiss = function () { want(1, 'near', B.pools.near); };
  H.nazarDodge = function () { if (dedupe('nazar', 2)) want(2, null, B.pools.nazar); };
  H.frenzy = function (ev) { if (ev.on) want(2, null, B.pools.frenzy); };
  H.bossIntro = function () { want(3, 'boss', B.pools.boss, 2.5); };
  H.eliteSpawn = function () { want(2, 'elite', B.pools.elite); };
  ['bruteRoar', 'bruteCharge', 'spit', 'bloaterSwell', 'summon', 'bossSlam'].forEach(function (t) {
    H[t] = function () { want(1, 'act', B.pools.act + t + '.'); };
  });
  function hackPool(kind) { return B.pools.hack + (HACK_POOL[kind] || kind) + '.'; }
  H.hackStart = function (ev) { want(2, null, hackPool(ev.kind) + 'start.'); };
  H.hackDone = function (ev) { want(2, null, hackPool(ev.kind) + 'done.'); };
  H.hackFail = function (ev) { want(2, null, hackPool(ev.kind) + 'fail.'); };
  H.eventStart = function (ev) { want(2, null, B.pools.ev + (EV_POOL[ev.kind] || ev.kind) + '.'); };
  H.eventEnd = function (ev) { want(1, 'evend', B.pools.evend + (EV_POOL[ev.kind] || ev.kind) + '.'); };
  // Active skills (sim skillUsed, id = shield | tea), the first sighting of each enemy type in a run (the fk pool's lines
  // read as encounters), objectives, and boss phase changes.
  H.skillUsed = function (ev) { want(2, 'skill', B.pools.skill + ev.id + '.'); };
  H.enemyEnter = function (ev) { if (ev.enemy && !S.met[ev.enemy]) { S.met[ev.enemy] = true; want(2, null, B.pools.fk + ev.enemy + '.'); } };
  H.objStart = function () { want(1, null, B.pools.obj + 'start.'); };
  H.objDone = function () { want(2, null, B.pools.obj + 'done.'); };
  H.objFail = function () { want(2, null, B.pools.obj + 'fail.'); };
  H.bossPhase = function () { want(2, null, B.pools.bossPhase); };
  H.rescueStart = function () { if (dedupe('rescue', 3)) want(3, null, B.pools.rescue); };
  H.rescue = H.rescueStart;
  H.rescueDone = H.rescueStart;
  H.signalLost = function () { S.forced = false; S.sigUntil = 0; want(3, null, B.pools.sig[0]); };
  H.signalRestored = function () { S.forced = true; want(3, null, B.pools.sig[1]); };
  H.callStart = function () { S.sigUntil = S.clock + 25; };
  H.death = function () { B.clear(); };
  H.win = H.death;

  // Every sim event goes here (main.js calls this for each one). Unknown types are ignored.
  B.onEvent = function (ev, s) {
    if (!S || !S.on || !ev || !H[ev.type]) return;
    H[ev.type](ev, s || {});
  };
  // Env events (view/env-fx.js, guarded call): one line from a pool prefix at priority pri, category cat. With x and y,
  // only when the event is within CFG.envNear m of Arda (a blast across the street is not his to comment on).
  B.say = function (prefix, pri, cat, x, y) {
    if (!S || !S.on || !S.hero) return;
    if (x != null && Math.hypot(x - S.hero.x, y - S.hero.y) > CFG.envNear) return;
    want(pri, cat || null, prefix);
  };

  // ---------- frame ----------
  B.update = function (dt, s) {
    if (!S || !S.on || !s) return;
    dt = clamp(dt, 0, 0.1);
    S.clock += dt;
    S.hero = s.hero || null;
    S.still = s.hero && s.hero.moving ? 0 : S.still + dt;
    S.gap = Math.max(0, S.gap - dt);
    onLevel(s);
    ambientTick(dt, s);
    ageQueue(dt);
    if (blocked(s)) { B.clear(); return; }
    scanSightings(s);
    if (S.bub) {
      if (S.bub.placed) S.bub.age += dt; else S.bub.wait += dt;
      if (S.bub.wait > CFG.waitMax) { S.bub = null; if (P.Speech) P.Speech.noteDrop(); }
      else if (S.bub && S.bub.placed && S.bub.age > S.bub.hold + CFG.fade) S.bub = null;
    }
    if (S.act) advanceAct(dt);
    if (!S.act && !S.bub && S.gap <= 0) startNext();
  };
  // Arbiter provider: offers the current bubble (anchored above Arda or above the zombie that groans).
  B.offer = function (R, s) {
    var b = S && S.bub, p, a, zombie;
    if (!b || !R || !R.toScreen || !s) return;
    zombie = b.who === 'zombie';
    p = zombie ? (b.z && !b.z.dead ? b.z : null) : s.hero;
    if (!p) return;
    a = R.toScreen(p.x, p.y);
    P.Speech.offer({ id: 'bark:' + b.uid, kind: zombie ? 'groan' : 'bark', prio: zombie ? P.Speech.PRIO.groan : P.Speech.PRIO.bark,
      w: b.w, h: b.h, ax: a.x, ay: a.y, lift: zombie ? 44 : 58, age: b.age, prev: b.prev,
      place: function (slot) {
        b.prev = slot ? slot.n : null; b.placed = !!slot;
        if (!slot) { b.pos = null; return; }
        var tt = P.Speech.tailTarget(slot, zombie ? 44 : 58);
        b.pos = { x: slot.x, y: slot.y, w: b.w, h: b.h, tx: tt.tx, ty: tt.ty };
      } });
  };
  // Draws the current bubble at the slot the arbiter gave it (world transform is ignored: screen px).
  B.draw = function (R, s) {
    if (!S || !S.bub || !S.bub.pos || !R || !R.ctx || !s) return;
    var b = S.bub, c = R.ctx, pos = b.pos, grow, sc, fade, cx, cy;
    grow = easeOutBack(clamp(b.age / CFG.popIn, 0, 1)); sc = 0.35 + 0.65 * grow;
    fade = b.age > b.hold ? clamp(1 - (b.age - b.hold) / CFG.fade, 0, 1) : 1;
    cx = pos.x + pos.w / 2; cy = pos.y + pos.h / 2;
    c.save(); c.setTransform(R.dpr || 1, 0, 0, R.dpr || 1, 0, 0); c.globalAlpha = fade;
    c.translate(cx, cy); c.scale(sc, sc); c.translate(-cx, -cy);
    T.balloon(c, { x: pos.x, y: pos.y, w: pos.w, h: pos.h, tx: pos.tx, ty: pos.ty, kind: b.kind, fill: b.fill,
                   lines: b.lines, px: b.px, lh: b.lh });
    c.restore();
  };
  B.clear = function () { if (S) { S.q = []; S.act = null; S.bub = null; } };
  B.reset = function (seed) { S = newState(seed || 1337, S ? S.on : true); };
  B.setEnabled = function (on) { S.on = !!on; if (!on) B.clear(); };
  B.current = function () { return S && S.bub ? { id: S.bub.id, who: S.bub.who } : null; };   // tester and audit read it
  // Dev audit (sync; needs P.ComicArt.ready): every line of the current language's native pools (and the P.LINES
  // fallback ids) laid out the way its bubble is, then checked (ink inside the text box, inside the body, not truncated).
  // Rows {kind, id, px, overflow, fail, cut}.
  B.audit = function () {
    var rows = [], pools = (P.BarkPools && P.BarkPools[P.lang]) || {};
    function row(id, text, who) {
      var b = layout(id, text, who), rep = L.checkBox({ kind: b.kind, x: 0, y: 0, w: b.w, h: b.h, name: false, lines: b.lines, px: b.px, lh: b.lh, caps: b.caps },
                                                     { w: b.w, h: b.h });
      var fail = rep.inkOut + rep.bodyOut + rep.trunc + (b.ok ? 0 : 1) > 0;
      rows.push({ kind: 'bark', id: id, px: b.px, overflow: !b.ok, fail: fail, cut: fail });
    }
    Object.keys(pools).forEach(function (k) {
      pools[k].forEach(function (e, i) { if (e && e.t) row(k + '#' + i, e.t, k === B.pools.zr.replace(/\.$/, '') ? 'zombie' : 'arda'); });
    });
    Object.keys(P.LINES).forEach(function (id) {
      if (id.indexOf('BK.') !== 0) return;
      row(id, P.line(id).text, id.indexOf(B.pools.zr) === 0 ? 'zombie' : 'arda');
    });
    return rows;
  };
  S = newState(1337, true);
  return B;
})();

if (P.Speech) P.Speech.provider(P.Barks.offer);
