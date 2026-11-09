// Daily challenge, streak, reward chest and welcome-back (v0.5, workstream C). Pure: no DOM.
// A daily is one seeded level of the unlocked route with 2 modifiers. The effects live here (D.MODS); the sim applies
// them from loadout.modifiers (fields: spawnMult, enemyHpMult, eliteMult, noDash, noRevive, coinMult; sim/modifiers.js).
// D.resolve maps any stored list back to these definitions by id, so a damaged save cannot add an effect.
P.Meta = P.Meta || {};
(function (M) {
  var D = M.Daily = M.Daily || {};
  D.CFG = {
    modCount: 2,
    welcomeHours: 12,                 // return after this many hours shows the welcome-back summary
    chestBase: 60, chestPerStreak: 20, chestRandom: 40,   // coins: base + perStreak * min(streak, 7) + random 0..40
    streakDays: 7                     // escalating reward cycle; day 7 adds a bonus cosmetic
  };
  D.MODS = [
    { id: 'horde', spawnMult: 1.35, nameKey: 'mod.horde.n', descKey: 'mod.horde.d' },
    { id: 'glass', enemyHpMult: 0.75, nameKey: 'mod.glass.n', descKey: 'mod.glass.d' },
    { id: 'elite', eliteMult: 2, nameKey: 'mod.elite.n', descKey: 'mod.elite.d' },
    { id: 'nodash', noDash: true, nameKey: 'mod.nodash.n', descKey: 'mod.nodash.d' },
    { id: 'coinrush', coinMult: 1.5, nameKey: 'mod.coinrush.n', descKey: 'mod.coinrush.d' },
    { id: 'iron', noRevive: true, nameKey: 'mod.iron.n', descKey: 'mod.iron.d' }
  ];

  // Local calendar day as YYYY-MM-DD (the daily resets at local midnight).
  D.dayKey = function (date) {
    var d = date || new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  };
  D.yesterday = function (day) {
    var parts = String(day).split('-').map(Number), d = new Date(parts[0], parts[1] - 1, parts[2] - 1);
    return D.dayKey(d);
  };
  // FNV-1a 32-bit hash of the day key: the same day gives the same seed on every device.
  D.seedOf = function (day) {
    var h = 2166136261, i, s = String(day);
    for (i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  };
  // mulberry32: small deterministic PRNG. Returns a function giving floats in [0, 1).
  D.rng = function (seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  // Picks `count` distinct modifiers for a seed (order matters only for display).
  D.pickMods = function (seed, count) {
    var r = D.rng(seed ^ 0x9E3779B9), pool = D.MODS.slice(), out = [], n = count || D.CFG.modCount;
    while (out.length < n && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
    return out;
  };
  // Today's plan for a given unlocked route length (levels 1..unlocked). Level index is 1-based.
  D.plan = function (day, unlocked) {
    var seed = D.seedOf(day), top = Math.max(1, unlocked | 0);
    return { day: day, seed: seed, level: 1 + (seed % top), mods: D.pickMods(seed, D.CFG.modCount) };
  };
  // Streak after a completed daily on `day`. Missing a day resets the streak to 1.
  D.streakAfter = function (streak, day) {
    var s = streak || { n: 0, last: '', best: 0 }, n;
    if (s.last === day) return { n: s.n, last: s.last, best: s.best };
    n = s.last === D.yesterday(day) ? s.n + 1 : 1;
    return { n: n, last: day, best: Math.max(s.best || 0, n) };
  };
  // Streak as shown to the player: 0 when the last completed day is older than yesterday.
  D.liveStreak = function (streak, today) {
    var s = streak || { n: 0, last: '' };
    if (!s.last) return 0;
    return (s.last === today || s.last === D.yesterday(today)) ? s.n : 0;
  };
  // Chest for a completed daily. Pure: same day and streak give the same coins.
  D.chestFor = function (streakN, day) {
    var c = D.CFG, n = Math.min(Math.max(1, streakN | 0), c.streakDays),
      r = D.rng(D.seedOf(day) ^ 0x51ED270B)();
    return { coins: c.chestBase + c.chestPerStreak * n + Math.floor(r * c.chestRandom),
      bonus: (streakN | 0) > 0 && (streakN | 0) % c.streakDays === 0 };
  };
  // Welcome-back summary, or null. `last` is the lastPlayed timestamp in ms.
  D.welcome = function (now, last, streakN) {
    var hours = last ? (now - last) / 3600000 : 0;
    if (!last || hours < D.CFG.welcomeHours) return null;
    return { hours: Math.floor(hours), days: Math.floor(hours / 24), streak: streakN | 0 };
  };
  // Daily card state: 'ready' (one attempt left today), 'done' (won, chest to claim),
  // 'claimed' (chest opened), 'used' (attempt spent and lost; back tomorrow).
  D.status = function (daily, day) {
    if (!daily || daily.day !== day || !daily.played) return 'ready';
    if (daily.won && daily.claimed) return 'claimed';
    if (daily.won) return 'done';
    return 'used';
  };
  // Stored or picked modifiers, resolved to the D.MODS definitions by id (unknown ids and extra entries are dropped).
  D.resolve = function (list) {
    var out = [];
    (Array.isArray(list) ? list : []).forEach(function (m) {
      var def = m && typeof m === 'object' ? D.MODS.filter(function (x) { return x.id === m.id; })[0] : null;
      if (def && out.length < D.CFG.modCount) out.push(Object.assign({}, def));
    });
    return out;
  };
  // Data for the sim: the resolved modifiers copied into loadout.modifiers.
  D.loadoutFields = function (plan) {
    return { modifiers: D.resolve(plan.mods), seed: plan.seed, daily: true };
  };
})(P.Meta);
