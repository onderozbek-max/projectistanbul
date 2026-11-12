// Meta save schema v3 (v0.5 workstream C; v3 adds the Street Tree and bond meters, R1-T5 D-059). No DOM: storage is injected for tests.
// Migrates 'nsi.meta.v2' and 'nsi.meta.v1' without loss and keeps the older keys as backups (never deleted by migration).
// Shape: { v:3, tree:{learned:{id:1}, respecs:{chapter:n}}, bonds:{kaan, mila, ada}, unlocked, stars, coins, gear, equipped, pending, heroes:{arda:{stats, ult}},
//   mastery:{weaponId:kills}, counters:{...}, collection:{id:1}, achievements:{id:1},
//   daily:{day, seed, level, mods, played, won, claimed, ended}, streak:{n, last, best}, flags:{}, lastPlayed }
P.Meta = P.Meta || {};
(function (M) {
  var KEY = 'nsi.meta.v3', KEY_V2 = 'nsi.meta.v2', KEY_V1 = 'nsi.meta.v1', VERSION = 3;
  var num = function (x) { return Number(x) || 0; };
  var COUNTERS = ['kills', 'hacks', 'rescues', 'bosses', 'wins', 'dashes', 'ults', 'crits', 'maxStreak', 'meters',
    'flawlessTotal', 'hoodsCleared', 'dailies', 'eliteKills'];
  M.Save = { KEY: KEY, KEY_V2: KEY_V2, KEY_V1: KEY_V1, VERSION: VERSION, COUNTERS: COUNTERS, HEROES: ['arda'] };

  // Fresh save. Level, gear and economy defaults match v1 (see meta-data.js for the numbers).
  M.Save.defaults = function () {
    var s = { v: VERSION, unlocked: 1, stars: {}, coins: 0,
      gear: { hoodie_sweat: { lvl: 1 }, gloves_work: { lvl: 1 }, sneak_run: { lvl: 1 }, charm_nazar: { lvl: 1 } },
      equipped: { hoodie: 'hoodie_sweat', gloves: 'gloves_work', sneakers: 'sneak_run', charm: 'charm_nazar' },
      pending: null, heroes: {}, mastery: {}, counters: {}, collection: {}, achievements: {},
      daily: { day: '', seed: 0, level: 0, mods: [], played: false, won: false, claimed: false },
      streak: { n: 0, last: '', best: 0 }, flags: {}, lastPlayed: 0,
      tree: P.Tree.newState(), bonds: P.Tree.newBonds() };
    M.Save.HEROES.forEach(function (h) { s.heroes[h] = { stats: P.Stats.newProgress(), ult: 'nazar' }; });
    COUNTERS.forEach(function (c) { s.counters[c] = 0; });
    s.counters.flawless = {};
    return s;
  };

  function normalizeGear(src, out) {
    Object.keys(M.ITEMS || {}).forEach(function (id) {
      if (src.gear && src.gear[id]) out.gear[id] = { lvl: Math.max(1, Math.min(M.CFG.gear.maxLevel, Math.round(num(src.gear[id].lvl)) || 1)) };
    });
    (M.SLOTS || []).forEach(function (slot) {
      var id = src.equipped && src.equipped[slot.id];
      if (id && M.ITEMS[id] && M.ITEMS[id].slot === slot.id && out.gear[id]) out.equipped[slot.id] = id;
    });
  }
  function normalizeLevels(src, out) {
    var cap = M.CFG && M.CFG.levelCount ? M.CFG.levelCount : 100;
    out.unlocked = Math.max(1, Math.min(cap, Math.round(num(src.unlocked)) || 1));
    out.coins = Math.max(0, Math.round(num(src.coins)));
    Object.keys(src.stars || {}).forEach(function (k) {
      var i = Math.round(num(k)), v = Math.round(num(src.stars[k]));
      if (i >= 1 && i <= cap && v >= 1) out.stars[i] = Math.min(M.CFG.starsMax || 3, v);
    });
  }
  // Per-hood flawless counts live in counters.flawless (where the game writes them). A top-level flawless is read only
  // as a fallback for older saves; reading just the top level wiped the counts on every load (AUDIT-7 CR-5).
  function normalizeCounters(src) {
    var out = {}, f = (src.counters && src.counters.flawless) || src.flawless || {};
    COUNTERS.forEach(function (c) { out[c] = Math.max(0, Math.round(num(src.counters && src.counters[c]))); });
    out.flawless = {};
    Object.keys(f).forEach(function (h) { out.flawless[h] = Math.max(0, Math.round(num(f[h]))); });
    return out;
  }
  function normalizeMap(src) {
    var out = {};
    Object.keys(src || {}).forEach(function (k) { out[k] = Math.max(0, Math.round(num(src[k]))); });
    return out;
  }
  function normalizeHeroes(src) {
    var out = {};
    M.Save.HEROES.forEach(function (h) {
      var raw = (src.heroes && src.heroes[h]) || {}, ult = raw.ult || 'nazar';
      out[h] = { stats: P.Stats.normalize(raw.stats), ult: String(ult), active: String(raw.active || P.CFG.skills.activeDefault || 'shield') };
    });
    return out;
  }
  function normalizeDaily(src) {
    var d = src.daily || {}, mods = M.Daily && M.Daily.resolve ? M.Daily.resolve(d.mods) : [];
    return { day: String(d.day || ''), seed: Math.max(0, Math.round(num(d.seed))), level: Math.max(0, Math.round(num(d.level))),
      mods: mods, played: !!d.played, won: !!d.won, claimed: !!d.claimed, ended: !!d.ended };
  }
  function normalizeStreak(src) {
    var s = src.streak || {};
    return { n: Math.max(0, Math.round(num(s.n))), last: String(s.last || ''), best: Math.max(0, Math.round(num(s.best))) };
  }
  // Sanitize any stored object into a valid v3 save. Unknown fields are dropped; older saves gain the new fields.
  M.Save.normalize = function (raw) {
    var src = raw && typeof raw === 'object' ? raw : {}, out = M.Save.defaults();
    normalizeLevels(src, out);
    normalizeGear(src, out);
    out.pending = src.pending && typeof src.pending === 'object' ? src.pending : null;
    out.heroes = normalizeHeroes(src);
    out.mastery = normalizeMap(src.mastery);
    out.counters = normalizeCounters(src);
    out.collection = normalizeMap(src.collection);
    out.achievements = normalizeMap(src.achievements);
    out.daily = normalizeDaily(src);
    out.streak = normalizeStreak(src);
    out.flags = src.flags && typeof src.flags === 'object' ? src.flags : {};
    out.lastPlayed = Math.max(0, num(src.lastPlayed));
    out.tree = P.Tree.normalize(src.tree);
    out.bonds = P.Tree.normalizeBonds(src.bonds);
    return out;
  };
  // v1 or v2 -> v3 (and v3 -> v3 pass-through). Returns a new object; `from` records the source version.
  M.Save.migrate = function (raw, now) {
    var from = raw && typeof raw === 'object' && raw.v ? Number(raw.v) || 1 : 1;
    var s = M.Save.normalize(raw);
    s.v = VERSION;
    if (from < VERSION) s.lastPlayed = s.lastPlayed || (now || 0);
    s.migratedFrom = from < VERSION ? from : undefined;
    return s;
  };
  // Storage access. `store` defaults to localStorage (missing in node tests and private mode).
  M.Save.read = function (store, now) {
    var st = store || (typeof localStorage !== 'undefined' ? localStorage : null), v3 = null, v2 = null, v1 = null;
    if (!st) return M.Save.defaults();
    try { v3 = JSON.parse(st.getItem(KEY) || 'null'); } catch (e) { v3 = null; }
    if (v3) return M.Save.migrate(v3, now);
    try { v2 = JSON.parse(st.getItem(KEY_V2) || 'null'); } catch (e) { v2 = null; }
    if (v2) return M.Save.migrate(v2, now);
    try { v1 = JSON.parse(st.getItem(KEY_V1) || 'null'); } catch (e) { v1 = null; }
    return M.Save.migrate(v1, now);
  };
  M.Save.write = function (state, store) {
    var st = store || (typeof localStorage !== 'undefined' ? localStorage : null);
    try { if (st) st.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode: keep in memory */ }
  };
  M.Save.wipe = function (store) {
    var st = store || (typeof localStorage !== 'undefined' ? localStorage : null);
    try { if (st) { st.removeItem(KEY); st.removeItem(KEY_V2); st.removeItem(KEY_V1); } } catch (e) { /* ignore */ }
  };
})(P.Meta);
