// Arda's quips (workstream D, v0.5): short comic bubbles over Arda, and talk with the zombies around him.
// Lines: strings-barks.js (ids BK.*). Wiring: P.Barks.onEvent(ev, s) for every sim event; P.Barks.update(dt, s) each
// play frame; P.Barks.draw(R, s) in world space (screen px, kept below the HUD band); P.Barks.reset() on a new run.
// Rules: at most one bark start per 8-14 s; no barks while a comic page or pop is up (P.Comic.active) or the legacy
// director bark is showing; each pool cycles before a line repeats and never repeats back to back; priority is
// boss / first kill / evolve / hood entry > streaks, cards, hacks > ambient (idle, zombie talk, talking to himself).
P.Barks = (function () {
  var B = {}, A = P.ComicArt, T = P.ComicText, L = P.ComicLayout, S = null, measureCv = null;
  var CFG = {
    gapMin: 8, gapMax: 14,                           // global gap between bark starts (s)
    ambientMin: 9, ambientMax: 16,                   // one ambient candidate every 9-16 s
    popIn: 0.2, fade: 0.3, holdBase: 1.6, holdChar: 0.045, holdMin: 2.0, holdMax: 4.2,
    topSafe: 170, maxW: 196, pxs: [15, 14, 13, 12],  // HUD band (px), bubble width (px), type sizes (largest first)
    ttl: { 1: 4, 2: 6, 3: 10 },                      // a queued candidate expires after this long (s), by priority
    cool: { act: 18, dash: 20, near: 15, close: 20, still: 25, idle: 25, self: 22, zq: 25, elite: 20, low: 60, ult: 12 }
  };
  var AMBIENT = { close: 1, zq: 1, still: 1, idle: 1, self: 1 };
  // Pools: id prefixes in P.LINES. A prefix matches ids whose rest has no dot ('BK.fk.walker.' matches 'BK.fk.walker.2').
  B.pools = { fk: 'BK.fk.', streak: 'BK.streak.', boss: 'BK.boss.', elite: 'BK.elite.', low: 'BK.low.', heal: 'BK.heal.',
    lvl: ['BK.lvlA.', 'BK.lvlB.', 'BK.lvlC.', 'BK.lvlD.'], card: 'BK.card.', mod: 'BK.mod.', mastery: 'BK.mastery.',
    evo: 'BK.evo.', ult: 'BK.ult.', ultr: 'BK.ultr.', dash: 'BK.dash.', near: 'BK.near.', nazar: 'BK.nazar.',
    frenzy: 'BK.frenzy.', hack: 'BK.hack.', ev: 'BK.ev.', evend: 'BK.evend.', rescue: 'BK.rescue.',
    sig: ['BK.sig.lost.', 'BK.sig.back.'], act: 'BK.act.', idle: 'BK.idle.', still: 'BK.still.', close: 'BK.close.',
    zq: 'BK.zq.', zr: 'BK.zr.', zreact: 'BK.zreact.', self: 'BK.self.', mom: 'BK.mom.', dad: 'BK.dad.', hood: 'BK.hd' };

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
             forced: null, evT: {}, starts: [] };
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
  // A line from a pool: every line once before any repeats, never the line shown last.
  function pick(prefix) {
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
  function cooling(cat) { return !!cat && CFG.cool[cat] !== undefined && S.cool[cat] > S.clock; }
  function cool(cat) { if (cat && CFG.cool[cat] !== undefined) S.cool[cat] = S.clock + CFG.cool[cat]; }
  function dedupe(key, win) {
    if (S.clock - (S.evT[key] === undefined ? -99 : S.evT[key]) < win) return false;
    S.evT[key] = S.clock; return true;
  }

  // ---------- queue ----------
  // steps: [{who: 'arda' | 'zombie', prefix, at (s after start), z (zombie object for replies)}]. delay: s before it may start.
  function queue(pri, cat, steps, delay) {
    if (!S.on || cooling(cat)) return;
    if (cat && S.q.some(function (c) { return c.cat === cat; })) return;
    S.q.push({ pri: pri, cat: cat, steps: steps, age: -(delay || 0), ttl: CFG.ttl[pri] });
  }
  function want(pri, cat, prefix, delay) {
    if (keysOf(prefix).length) queue(pri, cat, [{ who: 'arda', prefix: prefix, at: 0 }], delay);
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
    var id = pick(st.prefix);
    if (!id || (st.who === 'zombie' && (!st.z || st.z.dead))) return;
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
  function makeBubble(id, who) {
    var caps = P.upper(P.line(id).text), c = meas(), shout = who === 'zombie', kind = shout ? 'shout' : 'speech';
    var ins = T.insets(kind, false), f = T.fit(c, caps, CFG.maxW - 2 * ins.x, 170, 'speech', CFG.pxs);
    var textW = T.widest(c, f.lines, 'speech', f.px);
    var w = Math.max(96, textW + 2 * ins.x);
    return { id: id, who: who, lines: f.lines, px: f.px, lh: f.lh, w: Math.min(w, CFG.maxW + 40), h: T.boxH(f.lines, f.lh, false, kind),
             kind: kind, fill: shout ? '#C4F27A' : null, caps: caps, ok: f.ok,
             hold: clamp(CFG.holdBase + CFG.holdChar * caps.length, CFG.holdMin, CFG.holdMax), age: 0, z: null };
  }
  // Screen box for the bubble: above the head (or the zombie's head), kept below the HUD band and inside the screen.
  function anchor(R, s, b) {
    var p = b.who === 'zombie' ? (b.z && !b.z.dead ? b.z : null) : s.hero, a, x, y, tx, ty, lift;
    if (!p) return null;
    a = R.toScreen ? R.toScreen(p.x, p.y) : { x: R.W / 2 + R.X(p.x), y: R.H / 2 + R.Y(p.y) };
    lift = b.who === 'zombie' ? 44 : 58;
    x = clamp(a.x - b.w / 2, 8, R.W - 8 - b.w);
    y = a.y - lift - b.h; tx = a.x; ty = a.y - lift + 10;
    if (y < CFG.topSafe) { y = a.y + 14; ty = a.y - 14; }
    y = clamp(y, CFG.topSafe, R.H - b.h - 8);
    return { x: x, y: y, w: b.w, h: b.h, tx: tx, ty: ty };
  }

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
    var steps = [{ who: 'arda', prefix: B.pools.zq, at: 0 }];
    if (S.rng() < 0.45) steps.push({ who: 'zombie', prefix: B.pools.zr, at: 1.4, z: z }, { who: 'arda', prefix: B.pools.zreact, at: 3.0 });
    queue(1, 'zq', steps);
  }
  function selfTalk() {
    var r = S.rng();
    want(1, 'self', r < 0.6 ? B.pools.self : r < 0.8 ? B.pools.mom : B.pools.dad);
  }
  // One ambient candidate every 9-16 s, chosen from what is true right now.
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
    want(2, null, keysOf(pre).length ? pre : B.pools.card + 'gen.');
  };
  H.modChosen = function () { want(2, null, B.pools.mod); };
  H.masteryMove = function () { want(2, null, B.pools.mastery); };
  H.evolve = function (ev) {
    var pre = B.pools.evo + ev.to + '.';
    want(3, null, keysOf(pre).length ? pre : B.pools.evo + 'gen.', Math.max(1.2, ev.T || 2.5));
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
  H.hackStart = function (ev) { want(2, null, B.pools.hack + ev.kind + '.start.'); };
  H.hackDone = function (ev) { want(2, null, B.pools.hack + ev.kind + '.done.'); };
  H.hackFail = function (ev) { want(2, null, B.pools.hack + ev.kind + '.fail.'); };
  H.eventStart = function (ev) { want(2, null, B.pools.ev + ev.kind + '.'); };
  H.eventEnd = function (ev) { want(1, 'evend', B.pools.evend + ev.kind + '.'); };
  H.rescueStart = function () { if (dedupe('rescue', 3)) want(3, null, B.pools.rescue); };
  H.rescue = H.rescueStart;
  H.rescueDone = H.rescueStart;
  H.signalLost = function () { S.forced = false; S.sigUntil = 0; want(3, null, B.pools.sig[0]); };
  H.signalRestored = function () { S.forced = true; want(3, null, B.pools.sig[1]); };
  H.callStart = function () { S.sigUntil = S.clock + 25; };
  H.death = function () { B.clear(); };
  H.win = H.death;

  // Every sim event goes here (the lead calls this for each one). Unknown types are ignored.
  B.onEvent = function (ev, s) {
    if (!S || !S.on || !ev || !H[ev.type]) return;
    H[ev.type](ev, s || {});
  };

  // ---------- frame ----------
  B.update = function (dt, s) {
    if (!S || !S.on || !s) return;
    dt = clamp(dt, 0, 0.1);
    S.clock += dt;
    S.still = s.hero && s.hero.moving ? 0 : S.still + dt;
    S.gap = Math.max(0, S.gap - dt);
    onLevel(s);
    ambientTick(dt, s);
    ageQueue(dt);
    if (blocked(s)) { B.clear(); return; }
    if (S.bub) { S.bub.age += dt; if (S.bub.age > S.bub.hold + CFG.fade) S.bub = null; }
    if (S.act) advanceAct(dt);
    if (!S.act && !S.bub && S.gap <= 0) startNext();
  };
  // Draws the current bubble in world space. R is the renderer (R.ctx, R.toScreen, R.W, R.H, R.dpr).
  B.draw = function (R, s) {
    if (!S || !S.bub || !R || !R.ctx || !s) return;
    var b = S.bub, c = R.ctx, pos = anchor(R, s, b), grow, sc, fade, cx, cy;
    if (!pos) return;
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
  // Dev audit (sync; needs P.ComicArt.ready): every BK line laid out the way its bubble is, then drawn with the loaded
  // font and checked (ink inside the text box, inside the body outline, not truncated). Rows {kind, id, px, fail, overflow}.
  B.audit = function () {
    var rows = [];
    Object.keys(P.LINES).forEach(function (id) {
      if (id.indexOf('BK.') !== 0) return;
      var b = makeBubble(id, id.indexOf('BK.zr.') === 0 ? 'zombie' : 'arda');
      var rep = L.checkBox({ kind: b.kind, x: 0, y: 0, w: b.w, h: b.h, name: false, lines: b.lines, px: b.px, lh: b.lh, caps: b.caps },
                           { w: b.w, h: b.h });
      var fail = rep.inkOut + rep.bodyOut + rep.trunc + (b.ok ? 0 : 1) > 0;
      rows.push({ kind: 'bark', id: id, px: b.px, overflow: !b.ok, fail: fail, cut: fail });
    });
    return rows;
  };
  S = newState(1337, true);
  return B;
})();
