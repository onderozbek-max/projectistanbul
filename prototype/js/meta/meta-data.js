// Meta layer data (no DOM): named constants, save state, economy, gear, loadout and map geometry.
// Save key 'nsi.meta.v1'. The rest of the meta layer reads and writes state only through P.Meta.
// Economy and gear numbers follow docs/game-design.md 8.6-8.7 unless marked PROTO.
P.Meta = P.Meta || {};
(function (M) {
  var J = P.Journey, KEY = 'nsi.meta.v1', LEVELS = J.hoods.length * J.levelsPerHood;
  var num = function (x) { return Number(x) || 0; };
  var round3 = function (x) { return Math.round(x * 1000) / 1000; };

  // ---- Named constants (economy, progression, gear) ----
  M.CFG = {
    storageKey: KEY, levelCount: LEVELS, levelsPerHood: J.levelsPerHood, hoodCount: J.hoods.length,
    totalKm: J.totalKm, startWeapon: 'knife', starsMax: 3,
    coins: {
      clearBase: 40,        // clear reward = clearBase + clearPerLevel * level (GD 8.7)
      clearPerLevel: 6,
      firstClearMult: 2,    // first clear x2 (GD 8.7)
      starBonus: 10,        // PROTO: paid per star above the previous best
      lossKeep: 0.5,        // a lost run keeps half its run coins (same as the pause copy)
      debugGrant: 2000      // PROTO: P.Meta.debugUnlockAll
    },
    gear: { maxLevel: 10, costPerLevel: 20, startFraction: 0.4, maxStatPct: 0.25 }   // cost = 20 * level (GD 8.6)
  };

  // ---- Gear: four slots, two items each. Items unlock on a boss first clear (GD 8.6 "boss first-clear"). ----
  M.SLOTS = [
    { id: 'hoodie', icon: 'jacket', items: ['hoodie_sweat', 'hoodie_parka'] },
    { id: 'gloves', icon: 'gloves', items: ['gloves_work', 'gloves_leather'] },
    { id: 'sneakers', icon: 'shoes', items: ['sneak_run', 'sneak_boot'] },
    { id: 'charm', icon: 'charm', items: ['charm_nazar', 'charm_bag'] }
  ];
  // stats = value at item level 10 (fractions). unlockAt = level index whose first clear unlocks the item (0 = owned).
  M.ITEMS = {
    hoodie_sweat: { slot: 'hoodie', unlockAt: 0, stats: { maxHpPct: 0.20 } },
    hoodie_parka: { slot: 'hoodie', unlockAt: 10, stats: { maxHpPct: 0.16, cooldownPct: 0.06 } },
    gloves_work: { slot: 'gloves', unlockAt: 0, stats: { mightPct: 0.20 } },
    gloves_leather: { slot: 'gloves', unlockAt: 40, stats: { mightPct: 0.14, cooldownPct: 0.06 } },
    sneak_run: { slot: 'sneakers', unlockAt: 0, stats: { movePct: 0.18 } },
    sneak_boot: { slot: 'sneakers', unlockAt: 25, stats: { movePct: 0.12, maxHpPct: 0.05 } },
    charm_nazar: { slot: 'charm', unlockAt: 0, stats: { cooldownPct: 0.12, pickupPct: 0.08 } },
    charm_bag: { slot: 'charm', unlockAt: 60, stats: { pickupPct: 0.22 } }
  };

  // ---- Map geometry: normalised 0..1 (u = x, v = y). Hood positions come from journey.js (no overrides needed). ----
  M.HOOD_XY_OVERRIDE = {};   // { hoodId: [u, v] } if a drawing ever needs different hood coordinates
  M.GEO = {
    sea: [[0, 0.84], [0.04, 0.78], [0.09, 0.68], [0.13, 0.63], [0.18, 0.59], [0.24, 0.56], [0.3, 0.54], [0.36, 0.52],
      [0.42, 0.49], [0.5, 0.47], [0.58, 0.47], [0.66, 0.5], [0.7, 0.51], [0.8, 0.57], [0.9, 0.64], [1, 0.71], [1, 1], [0, 1]],
    horn: [[0.71, 0.335], [0.63, 0.335], [0.57, 0.34], [0.52, 0.335], [0.48, 0.305], [0.44, 0.27], [0.38, 0.24], [0.32, 0.21], [0.26, 0.18]],
    bosphorus: [[0.8, 0], [0.78, 0.12], [0.745, 0.22], [0.715, 0.31], [0.69, 0.4], [0.67, 0.5], [0.68, 0.53]],
    asia: [[0.8, 0], [1, 0], [1, 0.71], [0.9, 0.64], [0.8, 0.57], [0.7, 0.51], [0.67, 0.5], [0.69, 0.4], [0.715, 0.31], [0.745, 0.22], [0.78, 0.12]],
    walls: [[0.4, 0.245], [0.37, 0.33], [0.34, 0.4], [0.31, 0.47], [0.26, 0.53], [0.22, 0.56]],
    bridge: [[0.585, 0.31], [0.565, 0.37]],
    tower: [0.615, 0.225],
    lanes: { marmara: [[0.7, 0.575], [0.5, 0.6], [0.3, 0.64], [0.12, 0.74]] },
    glow: [[0.5, 0.4, 0.34], [0.66, 0.22, 0.22], [0.3, 0.5, 0.2]],
    smoke: [[0.44, 0.3], [0.58, 0.2], [0.3, 0.42], [0.16, 0.6], [0.74, 0.1], [0.48, 0.45], [0.22, 0.45]],
    fires: [[0.46, 0.42], [0.6, 0.27], [0.36, 0.48], [0.14, 0.62], [0.52, 0.36], [0.27, 0.55], [0.66, 0.14], [0.44, 0.27],
      [0.58, 0.44], [0.2, 0.58], [0.74, 0.3], [0.33, 0.3]],
    gulls: [[0.66, 0.2], [0.74, 0.42], [0.42, 0.62], [0.2, 0.66], [0.6, 0.46], [0.86, 0.6]],
    // [stringKey, u, v, fontPx, rotationRad, colour]
    labels: [
      ['meta.map.beyoglu', 0.67, 0.09, 30, 0, '#F4EBDD'],
      ['meta.map.fatih', 0.27, 0.36, 30, 0, '#F4EBDD'],
      ['meta.map.horn', 0.45, 0.25, 16, -0.2, '#9CC7E0'],
      ['meta.map.bosphorus', 0.79, 0.36, 15, 1.45, '#9CC7E0'],
      ['meta.map.marmara', 0.42, 0.68, 22, 0, '#9CC7E0'],
      ['meta.map.asia', 0.9, 0.3, 22, 0, '#F4EBDD']
    ]
  };

  // ---- Levels and hoods ----
  M.clampLevel = function (i) { return Math.max(1, Math.min(LEVELS, Math.round(num(i)) || 1)); };
  M.level = function (i) { return J.level(M.clampLevel(i)); };
  M.hood = function (h) { return J.hoods[Math.max(0, Math.min(J.hoods.length - 1, h))]; };
  M.hoodXY = function (h) { var hd = M.hood(h); return M.HOOD_XY_OVERRIDE[hd.id] || hd.map; };
  M.levelAt = function (h, k) { return h * J.levelsPerHood + k; };   // k = 1..levelsPerHood

  // ---- Save state ----
  var mem = null;
  function defaults() {
    return { v: 1, unlocked: 1, stars: {}, coins: 0,
      gear: { hoodie_sweat: { lvl: 1 }, gloves_work: { lvl: 1 }, sneak_run: { lvl: 1 }, charm_nazar: { lvl: 1 } },
      equipped: { hoodie: 'hoodie_sweat', gloves: 'gloves_work', sneakers: 'sneak_run', charm: 'charm_nazar' },
      pending: null };
  }
  function clampGear(l) { return Math.max(1, Math.min(M.CFG.gear.maxLevel, Math.round(num(l)) || 1)); }
  function normalize(raw) {
    var s = raw && typeof raw === 'object' ? raw : {}, out = defaults();
    out.unlocked = Math.max(1, Math.min(LEVELS, Math.round(num(s.unlocked)) || 1));
    out.coins = Math.max(0, Math.round(num(s.coins)));
    Object.keys(s.stars || {}).forEach(function (k) {
      var i = Math.round(num(k)), v = Math.round(num(s.stars[k]));
      if (i >= 1 && i <= LEVELS && v >= 1) out.stars[i] = Math.min(M.CFG.starsMax, v);
    });
    Object.keys(M.ITEMS).forEach(function (id) { if (s.gear && s.gear[id]) out.gear[id] = { lvl: clampGear(s.gear[id].lvl) }; });
    M.SLOTS.forEach(function (slot) {
      var id = s.equipped && s.equipped[slot.id];
      if (id && M.ITEMS[id] && M.ITEMS[id].slot === slot.id && out.gear[id]) out.equipped[slot.id] = id;
    });
    out.pending = s.pending && typeof s.pending === 'object' ? s.pending : null;
    return out;
  }
  function load() {
    if (!mem) {
      var raw = null;
      try { raw = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { raw = null; }
      mem = normalize(raw);
    }
    return mem;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* private mode: keep in memory */ } }

  // ---- Level progress (sequential: a level is cleared when it has stars) ----
  M.starsOf = function (i) { return load().stars[i] || 0; };
  M.isCleared = function (i) { return M.starsOf(i) > 0; };
  M.unlockedLevel = function () { return load().unlocked; };
  M.hoodCleared = function (h) {
    for (var k = 1; k <= J.levelsPerHood; k++) if (!M.isCleared(M.levelAt(h, k))) return false;
    return true;
  };
  M.currentLevel = function () {
    for (var i = 1; i <= LEVELS; i++) if (!M.isCleared(i)) return i;
    return LEVELS;
  };
  // Map view state: done = fully cleared hoods, cur = hood the token stands on, km = walked distance.
  M.snapshot = function () {
    var s = load(), n = J.hoods.length, done = 0, curDone = 0, k;
    while (done < n && M.hoodCleared(done)) done++;
    if (done < n) for (k = 1; k <= J.levelsPerHood; k++) if (M.isCleared(M.levelAt(done, k))) curDone++;
    return { done: done, cur: Math.min(done, n - 1), curDone: done >= n ? J.levelsPerHood : curDone,
      km: done > 0 ? J.hoods[done - 1].km : 0, unlocked: s.unlocked, coins: s.coins };
  };

  // ---- Rewards ----
  M.clearReward = function (i, first) {
    var c = M.CFG.coins, base = c.clearBase + c.clearPerLevel * M.clampLevel(i);
    return Math.round(first ? base * c.firstClearMult : base);
  };
  M.rewardFor = function (r, prevStars, stars) {
    var c = M.CFG.coins, won = !!r.won, first = won && !(prevStars > 0);
    var run = won ? Math.round(num(r.coins)) : Math.round(num(r.coins) * c.lossKeep);
    var clear = won ? M.clearReward(r.levelIndex, first) : 0;
    var starB = won ? Math.max(0, stars - (prevStars || 0)) * c.starBonus : 0;
    return { won: won, first: first, run: run, clear: clear, starBonus: starB, total: run + clear + starB };
  };

  // ---- Gear state and maths ----
  M.itemOwned = function (id) { return !!load().gear[id]; };
  M.itemLevel = function (id) { var g = load().gear[id]; return g ? g.lvl : 0; };
  M.itemUnlocked = function (id) { var it = M.ITEMS[id]; return !!it && (!it.unlockAt || M.isCleared(it.unlockAt)); };
  M.itemFactor = function (lvl) {
    var g = M.CFG.gear;
    return g.startFraction + (1 - g.startFraction) * (lvl - 1) / (g.maxLevel - 1);
  };
  M.itemStats = function (id, lvl) {
    var it = M.ITEMS[id], out = {}, f = M.itemFactor(lvl || 1);
    if (it) Object.keys(it.stats).forEach(function (k) { out[k] = round3(it.stats[k] * f); });
    return out;
  };
  M.upgradeCost = function (id) {
    var lvl = M.itemLevel(id);
    return lvl >= M.CFG.gear.maxLevel ? 0 : M.CFG.gear.costPerLevel * lvl;
  };
  M.upgrade = function (id) {
    var s = load(), g = s.gear[id], cost = M.upgradeCost(id);
    if (!g || g.lvl >= M.CFG.gear.maxLevel || s.coins < cost) return false;
    s.coins -= cost; g.lvl += 1; save();
    return true;
  };
  M.equippedIn = function (slot) { return load().equipped[slot]; };
  M.equip = function (id) {
    var s = load(), it = M.ITEMS[id];
    if (!it || !s.gear[id]) return false;
    s.equipped[it.slot] = id; save();
    return true;
  };
  function unlockGear(s) {
    var added = [];
    Object.keys(M.ITEMS).forEach(function (id) {
      var it = M.ITEMS[id];
      if (!s.gear[id] && it.unlockAt && (s.stars[it.unlockAt] || 0) > 0) { s.gear[id] = { lvl: 1 }; added.push(id); }
    });
    return added;
  }

  // ---- Public state API ----
  M.loadout = function () {
    var s = load(), g = { maxHpPct: 0, mightPct: 0, movePct: 0, pickupPct: 0, cooldownPct: 0 };
    M.SLOTS.forEach(function (slot) {
      var id = s.equipped[slot.id], st = id ? M.itemStats(id, s.gear[id].lvl) : {};
      Object.keys(st).forEach(function (k) { g[k] = g[k] + st[k]; });
    });
    Object.keys(g).forEach(function (k) { g[k] = round3(Math.min(M.CFG.gear.maxStatPct, g[k])); });
    return { gear: g, startWeapon: M.CFG.startWeapon };
  };
  M.progress = function () {
    var s = load(), stars = {};
    Object.keys(s.stars).forEach(function (k) { stars[k] = s.stars[k]; });
    return { unlocked: s.unlocked, stars: stars, coins: s.coins, kmWalked: M.snapshot().km };
  };
  // Called by the game after a level. Credits coins and progress, queues the return animation.
  M.onResults = function (r) {
    r = r || {};
    var s = load(), i = M.clampLevel(r.levelIndex), won = !!r.won, prev = s.stars[i] || 0;
    var stars = won ? Math.max(1, Math.min(M.CFG.starsMax, Math.round(num(r.stars)))) : 0;
    var before = M.snapshot(), rw = M.rewardFor({ levelIndex: i, won: won, coins: r.coins }, prev, stars);
    if (won) {
      if (stars > prev) s.stars[i] = stars;
      s.unlocked = Math.max(s.unlocked, Math.min(LEVELS, i + 1));
    }
    s.coins += rw.total;
    var newGear = unlockGear(s);
    s.pending = { levelIndex: i, won: won, stars: stars, reward: rw, newGear: newGear, before: before, after: M.snapshot() };
    save();
    return s.pending;
  };
  M.takePending = function () {
    var s = load(), p = s.pending;
    if (p) { s.pending = null; save(); }
    return p;
  };
  M.reset = function () {
    mem = normalize(null);
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    return M.progress();
  };
  M.debugUnlockAll = function () {
    var s = load(), i;
    for (i = 1; i <= LEVELS; i++) s.stars[i] = M.CFG.starsMax;
    s.unlocked = LEVELS;
    s.coins += M.CFG.coins.debugGrant;
    unlockGear(s);
    save();
    return M.progress();
  };
})(P.Meta);
