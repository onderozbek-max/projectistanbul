// Night Shift daily (R1-T4 part 18): one endless run per local day. The plan is pure from the day key: the seed (the
// daily FNV seed with a salt), a stage 1-4 level of an unlocked hood (the hood rotates by the seed), two modifiers
// (D.MODS without 'iron', which blocks the revive) and a two-word seed name. Score, best and streak live in the additive
// save block s.modes.ns (meta-save.js). Unlimited retries replay the same seed. No DOM.
// Leaderboard hook: config nightshift.leaderboardHook names the key a later build posts the best score to (not wired).
P.Meta = P.Meta || {};
(function (M) {
  var N = M.NightShift = {}, NS = P.CFG.nightshift, J = P.Journey, SALT = 0x4E534654;   // 'NSFT'
  function ns() { return M.state().modes.ns; }
  function num(x) { return Number(x) || 0; }

  N.seedOf = function (day) { return (M.Daily.seedOf(day) ^ SALT) >>> 0; };
  // Levels a Night Shift can run: unlocked, not L1 (scripted) and not a boss arena (the route must be endless).
  N.candidates = function (unlocked) {
    var out = [], top = Math.min(num(unlocked), M.CFG.levelCount), i;
    for (i = 2; i <= top; i++) if (M.level(i).stage < J.levelsPerHood) out.push(i);
    return out;
  };
  N.pickMods = function (seed) {
    var r = M.Daily.rng(seed ^ 0x9E3779B9), pool = M.Daily.MODS.filter(function (m) { return m.id !== 'iron'; }), out = [];
    while (out.length < NS.dayMods && pool.length) out.push(Object.assign({}, pool.splice(Math.floor(r() * pool.length), 1)[0]));
    return out;
  };
  // Seed name: an adjective and a noun from the strings tables (ns.name.a<i>, ns.name.n<i>).
  N.nameOf = function (seed) {
    return { a: seed % NS.names.adj, n: Math.floor(seed / NS.names.adj) % NS.names.noun };
  };
  N.plan = function (day, unlocked) {
    var seed = N.seedOf(day), c = N.candidates(unlocked);
    return { day: day, seed: seed, level: c.length ? c[seed % c.length] : 0, mods: N.pickMods(seed), name: N.nameOf(seed) };
  };
  // Entry card state (read only): the plan, today's best, the local best, runs today and the live streak.
  N.card = function (day) {
    var n = ns(), today = n.day === day;
    return { plan: N.plan(day, M.unlockedLevel()), dayBest: today ? n.dayBest : 0, best: n.best, runs: today ? n.runs : 0,
      streak: M.Daily.liveStreak(n.streak, day), paid: n.paid === day };
  };
  // Available once level 2 is open (the first hood's level 1 is cleared), and only if the plan has a level.
  N.open = function (day) { return N.plan(day, M.unlockedLevel()).level > 0; };
  // Launch: returns {level, opts} for onPlay, and remembers opts for the retry (M.beginRun). Null when closed.
  N.launch = function (day) {
    var p = N.plan(day, M.unlockedLevel()), opts;
    if (!p.level) return null;
    opts = { mode: 'nightshift', nightshift: true, daily: false, seed: p.seed, modifiers: p.mods };
    M.beginRun(opts);
    return { level: p.level, opts: opts };
  };

  // Settles a finished Night Shift run into s (the save object). The first run of a day pays the fixed Street Cred and
  // coins and advances the streak; every run updates the day's and the local best. Returns the results info.
  // Adjective plus noun for the entry card. An adjective listed in ns.name.poss (TR "Gece") takes the possessive noun (p<i>).
  N.seedName = function (name, t) {
    var poss = (',' + t('ns.name.poss') + ',').indexOf(',' + name.a + ',') >= 0;
    return t('ns.name.a' + name.a) + ' ' + t(poss ? 'ns.name.p' + name.n : 'ns.name.n' + name.n);
  };

  N.settle = function (s, r, now) {
    var day = M.Daily.dayKey(new Date(now)), n = s.modes.ns, score = Math.max(0, Math.round(num(r.score))), best0 = n.best, pay = null, first;
    if (n.day !== day) { n.day = day; n.dayBest = 0; }
    first = n.paid !== day;
    n.dayBest = Math.max(n.dayBest, score);
    n.best = Math.max(n.best, score);
    n.runs += 1;
    if (first) {
      n.paid = day;
      n.streak = M.Daily.streakAfter(n.streak, day);
      pay = { coins: NS.coins + NS.streakCoins * Math.min(n.streak.n, NS.streakDaysMax) };
    }
    return { score: score, first: first, pay: pay, streak: n.streak.n, dayBest: n.dayBest, best: n.best, newBest: score > best0 };
  };
})(P.Meta);
