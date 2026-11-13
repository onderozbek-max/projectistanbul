// Meta layer data (no DOM): constants, save state, economy, gear, loadout and map geometry.
// Save v2 lives in meta-save.js ('nsi.meta.v2', migrates v1). The rest of the meta layer reads and writes
// state only through P.Meta. Economy and gear numbers follow docs/game-design.md 8.6-8.7 unless marked PROTO.
P.Meta = P.Meta || {};
(function (M) {
  var J = P.Journey, LEVELS = J.hoods.length * J.levelsPerHood;
  var num = function (x) { return Number(x) || 0; };
  var round3 = function (x) { return Math.round(x * 1000) / 1000; };

  // ---- Named constants (economy, progression, gear) ----
  M.CFG = {
    storageKey: 'nsi.meta.v3', levelCount: LEVELS, levelsPerHood: J.levelsPerHood, hoodCount: J.hoods.length,
    totalKm: J.totalKm, startWeapon: 'knife', starsMax: 3, masteryBadgeRank: 5,
    coins: {
      clearBase: 40,        // clear reward = clearBase + clearPerLevel * level (GD 8.7)
      clearPerLevel: 6,
      firstClearMult: 2,    // first clear x2 (GD 8.7)
      starBonus: 10,        // PROTO: paid per star above the previous best
      lossKeep: 0.5,        // a lost run keeps half its run coins (same as the pause copy)
      debugGrant: 2000      // PROTO: P.Meta.debugUnlockAll
    },
    gear: { maxLevel: 10, costPerLevel: 20, startFraction: 0.4, maxStatPct: 0.25 },   // cost = 20 * level (GD 8.6)
    // Ult unlock by lifetime kills, by ult index in P.CFG.ults (PROTO). Index past the list reuses the last value.
    ultKills: [0, 1500, 4000, 9000, 16000, 25000]
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
    // [stringKey, u, v, fontPx, rotationRad, colour]. Label positions chosen so no two overlap (v0.5 polish).
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

  // ---- Save state (schema in meta-save.js) ----
  var mem = null, activeRun = null;
  function load() { if (!mem) mem = M.Save.read(); return mem; }
  function save() { M.Save.write(mem); }
  M.state = function () { return load(); };
  M.save = save;

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
  // Map view state: done = fully cleared hoods, cur = hood the token stands on. km = the saved walk (the km of the last
  // cleared hood, unchanged). kmShown = km plus the share of the next hood walked (levels cleared / levelsPerHood), a
  // display value only: nothing saved or tested reads it as distance.
  M.snapshot = function () {
    var s = load(), n = J.hoods.length, done = 0, curDone = 0, k, km, next, frac;
    while (done < n && M.hoodCleared(done)) done++;
    if (done < n) for (k = 1; k <= J.levelsPerHood; k++) if (M.isCleared(M.levelAt(done, k))) curDone++;
    km = done > 0 ? J.hoods[done - 1].km : 0;
    next = done < n ? J.hoods[done].km : km;
    frac = done >= n ? 1 : curDone / J.levelsPerHood;
    return { done: done, cur: Math.min(done, n - 1), curDone: done >= n ? J.levelsPerHood : curDone,
      km: km, kmShown: km + (next - km) * frac, unlocked: s.unlocked, coins: s.coins };
  };

  // ---- Rewards ----
  M.clearReward = function (i, first) {
    var c = M.CFG.coins, base = c.clearBase + c.clearPerLevel * M.clampLevel(i);
    return Math.round(first ? base * c.firstClearMult : base);
  };
  // Objective bonus (lane P): a done objective on a win pays P.Objectives.bonusFor(level) coins.
  M.rewardFor = function (r, prevStars, stars) {
    var c = M.CFG.coins, won = !!r.won, first = won && !(prevStars > 0);
    var run = won ? Math.round(num(r.coins)) : Math.round(num(r.coins) * c.lossKeep);
    var clear = won ? M.clearReward(r.levelIndex, first) : 0;
    var starB = won ? Math.max(0, stars - (prevStars || 0)) * c.starBonus : 0;
    var objB = won && r.objective && P.Objectives ? P.Objectives.bonusFor(r.levelIndex) : 0;
    return { won: won, first: first, run: run, clear: clear, starBonus: starB, objective: objB, total: run + clear + starB + objB };
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

  // ---- Weapon mastery (A's P.Mastery supplies rank and the src mapping; lifetime kills are kept here) ----
  M.srcWeapon = function (src) {
    if (P.Mastery && P.Mastery.srcToWeapon) return P.Mastery.srcToWeapon(src) || null;
    return String(src || '').replace(/^w:/, '') || null;
  };
  M.masteryKills = function (w) { return load().mastery[w] || 0; };
  M.masteryRank = function (w, kills) {
    if (!P.Mastery || !P.Mastery.rank) return 0;
    return P.Mastery.rank(w, kills === undefined ? M.masteryKills(w) : kills) | 0;
  };
  // Lowest lifetime kill count that reaches the next rank (exponential search, then bisection).
  M.masteryNext = function (w, kills) {
    var r0 = M.masteryRank(w, kills), lo = kills, hi = Math.max(1, kills * 2), mid;
    if (!P.Mastery || !P.Mastery.rank) return null;
    while (M.masteryRank(w, hi) <= r0 && hi < 1e7) { lo = hi; hi *= 2; }
    while (hi - lo > 1) { mid = Math.floor((lo + hi) / 2); if (M.masteryRank(w, mid) > r0) hi = mid; else lo = mid; }
    return { rank: r0, next: hi, have: kills };
  };
  // Adds bySrc kills to weapon totals. Returns [{id, from, to}] for weapons whose rank went up.
  function accumulateMastery(s, bySrc) {
    var ups = {}, out = [], w, n;
    Object.keys(bySrc || {}).forEach(function (src) {
      w = M.srcWeapon(src); n = Math.round(num(bySrc[src]));
      if (!w || n <= 0) return;
      if (ups[w] === undefined) ups[w] = M.masteryRank(w, s.mastery[w] || 0);
      s.mastery[w] = (s.mastery[w] || 0) + n;
    });
    Object.keys(ups).forEach(function (id) {
      var to = M.masteryRank(id, s.mastery[id]);
      if (to > ups[id]) out.push({ id: id, from: ups[id], to: to });
      if (to >= M.CFG.masteryBadgeRank && P.Meta.Collect) P.Meta.Collect.badgeFor(s, id, to);
    });
    return out;
  }

  // ---- Ults (ids from P.CFG.ults, A's config; 'nazar' when the list is missing) ----
  M.ultIds = function () {
    var u = P.CFG && P.CFG.ults;
    if (!u) return ['nazar'];
    return Array.isArray(u) ? u.slice() : Object.keys(u);
  };
  M.ultUnlockKills = function (i) {
    var t = M.CFG.ultKills;
    return i < t.length ? t[i] : t[t.length - 1] + (i - t.length + 1) * 10000;
  };
  // A bond ult (cfg.bond = meter value) unlocks by Kaan's bond; the others by lifetime kills. needBond is set for bond ults only.
  M.ults = function () {
    var s = load(), ids = M.ultIds();
    return ids.map(function (id, i) {
      var U = (P.CFG.ults && P.CFG.ults[id]) || {}, need = M.ultUnlockKills(i);
      if (U.bond) return { id: id, index: i, need: 0, needBond: U.bond, unlocked: (s.bonds.kaan | 0) >= U.bond };
      return { id: id, index: i, need: need, unlocked: s.counters.kills >= need };
    });
  };
  M.setUlt = function (id) {
    var s = load(), hit = M.ults().filter(function (u) { return u.id === id && u.unlocked; });
    if (!hit.length) return false;
    s.heroes.arda.ult = id; save();
    return true;
  };

  // ---- Active skill (one per loadout; the sim reads loadout.active). Unlock levels: P.CFG.skills.unlockAt ----
  M.activeIds = function () { return ((P.CFG.skills && P.CFG.skills.activeList) || ['shield']).slice(); };
  M.activeUnlocked = function (id) { return M.unlockedLevel() >= (((P.CFG.skills || {}).unlockAt || {})[id] || 1); };
  M.activeId = function () {
    var id = load().heroes.arda.active, def = (P.CFG.skills && P.CFG.skills.activeDefault) || 'shield';
    return M.activeIds().indexOf(id) >= 0 && M.activeUnlocked(id) ? id : def;
  };
  M.setActive = function (id) {
    if (M.activeIds().indexOf(id) < 0 || !M.activeUnlocked(id)) return false;
    var s = load(); s.heroes.arda.active = id; save();
    return true;
  };

  // ---- Stats (attribute levels, training and allocation) ----
  M.heroStats = function (hero) { return load().heroes[hero || 'arda'].stats; };
  M.allocate = function (draft, hero) {
    var s = load(), h = s.heroes[hero || 'arda'], next = P.Stats.allocate(h.stats, draft);
    if (!next) return false;
    h.stats = next; save();
    Object.keys(draft || {}).forEach(function (k) {
      if (draft[k] > 0) tel('meta_upgrade', { type: 'attribute', id: k, cost: 0, points: draft[k], rank_after: next.attr[k] });
    });
    return true;
  };

  // ---- Telemetry (game-design 10): the meta layer reports through M.onTel(event, fields), set by view/telemetry.js (P.Tel.log).
  // Headless tools set their own. No hook, no event, and the save is identical either way. ----
  function tel(event, fields) { if (typeof M.onTel === 'function') M.onTel(event, fields); }
  function scFlow(delta, source, balance) { tel('currency_flow', { currency: 'street_cred', delta: delta, source_or_sink: source, balance_after: balance }); }

  // ---- Street Tree (D-059): learn and respec persist the hero's Street Cred and the tree together ----
  M.treeState = function () {
    var s = load(), ch = String(P.CFG.tree.chapter);
    return { learned: Object.assign({}, s.tree.learned), sc: s.heroes.arda.stats.sc | 0, ranks: Object.assign({}, s.heroes.arda.stats.attr),
      respecUsed: (s.tree.respecs[ch] | 0) >= P.CFG.tree.respecPerChapter, spent: P.Tree.spent(s.tree) };
  };
  M.treeLearn = function (id) {
    var s = load(), r = P.Tree.learn(s.heroes.arda.stats, s.tree, id), n = P.Tree.node(id);
    if (!r) return false;
    s.heroes.arda.stats = r.prog; s.tree = r.tree; save();
    tel('perk_learned', { perk_id: id, cost: n.cost, attr_rank: r.prog.attr[n.attr], sc_after: r.prog.sc });
    scFlow(-n.cost, 'perk_learned', r.prog.sc);
    return true;
  };
  // Returns the refunded Street Cred, or 0 when the chapter's free respec is used or nothing is learned.
  M.treeRespec = function () {
    var s = load(), cleared = Object.keys(s.tree.learned).length, r = P.Tree.respec(s.heroes.arda.stats, s.tree);
    if (!r) return 0;
    s.heroes.arda.stats = r.prog; s.tree = r.tree; save();
    tel('perk_respec', { refunded: r.refunded, perks_cleared: cleared, chapter: P.CFG.tree.chapter, sc_after: r.prog.sc });
    scFlow(r.refunded, 'respec_refund', r.prog.sc);
    return r.refunded;
  };

  // ---- Companion bonds (config-bond.js): Kaan only in the slice ----
  M.bondState = function () {
    var s = load(), v = s.bonds.kaan | 0;
    return { kaan: { value: v, tier: P.Bond.tier(v), joined: P.Bond.joined(s.stars), max: P.CFG.tree.bondMax } };
  };
  // Kaan's passive aura (threshold 25): the loadout carries bondHpPct, the sim adds it to max HP.
  function bondAura(s) { return P.Bond.joined(s.stars) && P.Bond.tier(s.bonds.kaan | 0) >= 1 ? P.CFG.bond.kaan.auraHpPct : 0; }

  // ---- Run options (daily modifiers etc.) ----
  // beginRun(opts) remembers opts for the next loadout(). openDaily() calls it. opts: {daily, modifiers, seed}.
  M.beginRun = function (opts) { activeRun = opts && typeof opts === 'object' ? opts : null; };
  M.endRun = function () { activeRun = null; };

  // ---- Loadout for createSim (contract: gear, startWeapon, stats, mastery, ult, hero, modifiers) ----
  // Equipped gear (capped per stat) plus the hood-rank power (config-power.js). Shared maths: meta-power.js.
  // Equipped items as [{id, lvl}]: the input of P.Power.gearWithHood (the loadout) and P.Power.gearTotal (the power readout).
  M.gearItems = function () {
    var s = load(), items = [];
    M.SLOTS.forEach(function (slot) { var id = s.equipped[slot.id]; if (id) items.push({ id: id, lvl: s.gear[id].lvl }); });
    return items;
  };
  function gearSum() { return P.Power.gearWithHood(M.gearItems(), M.snapshot().done); }
  function masteryRanks(s) {
    var out = {};
    Object.keys(s.mastery).forEach(function (w) { out[w] = M.masteryRank(w, s.mastery[w]); });
    return out;
  }
  M.loadout = function (opts) {
    var s = load(), hero = s.heroes.arda, o = opts || activeRun || {}, ults = M.ults(), ult = hero.ult, lo;
    var unlocked = ults.filter(function (u) { return u.id === ult && u.unlocked; }).length > 0;
    if (!unlocked) ult = M.ultIds()[0] || 'nazar';
    lo = { gear: gearSum(), startWeapon: M.CFG.startWeapon, stats: Object.assign({}, hero.stats.attr),
      mastery: masteryRanks(s), perks: Object.keys(s.tree.learned), bonds: { kaan: P.Bond.joined(s.stars) ? s.bonds.kaan | 0 : 0 }, bondHpPct: bondAura(s), ult: ult, active: M.activeId(), hero: 'arda', modifiers: [], l1Cleared: !!(P.Settings && P.Settings.l1Cleared) };
    if (o.daily) { lo.modifiers = M.Daily.resolve(o.modifiers); lo.seed = o.seed | 0; lo.daily = true; }
    return lo;
  };
  M.progress = function () {
    var s = load(), stars = {}, snap = M.snapshot();
    Object.keys(s.stars).forEach(function (k) { stars[k] = s.stars[k]; });
    return { unlocked: s.unlocked, stars: stars, coins: s.coins, kmWalked: snap.km, kmShown: snap.kmShown };
  };

  // ---- Results: one finished level updates every system, then the next open plays the sequence ----
  function coinBonus(s, coins) {
    var pct = P.Stats.effects({ cha: s.heroes.arda.stats.attr.cha }).coinPct || 0;
    return Math.round(coins * (1 + pct));
  }
  // Daily attempt bookkeeping: only the first finished run on today's planned daily counts (the results screen offers
  // Retry, which replays the same seed and modifiers, so a retry must not earn the streak or a chest: AUDIT-7 review).
  // The run counts as the daily when opts (or the active run) say so and the day matches the plan.
  function dailyResult(s, r, won, day) {
    if (!(r.daily || (activeRun && activeRun.daily)) || s.daily.day !== day || s.daily.ended) return null;
    s.daily.ended = true;
    s.daily.won = !!won;
    if (won && s.daily.played) s.streak = P.Meta.Daily.streakAfter(s.streak, day);
    return { won: !!won, day: day, streak: s.streak.n };
  }
  // Daily Coin rush (x1.5 in D.MODS): scales the run's reward. 1 for any other run.
  function dailyCoinMult(r) {
    if (!r.daily || !P.Modifiers || !P.Modifiers.dailyFold) return 1;
    return P.Modifiers.dailyFold(P.Meta.Daily.resolve(r.modifiers)).coinMult;
  }
  function apply(s, r, now) {
    var i = M.clampLevel(r.levelIndex), won = !!r.won, prev = s.stars[i] || 0, before = M.snapshot(), bond;
    var stars = won ? Math.max(1, Math.min(M.CFG.starsMax, Math.round(num(r.stars)))) : 0;
    var rw = M.rewardFor({ levelIndex: i, won: won, coins: r.coins, objective: !!(r.tally && r.tally.objDone) }, prev, stars), st0 = s.heroes.arda.stats;
    var st = P.Stats.applyLevel(st0, r.tally, won), day = P.Meta.Daily.dayKey(new Date(now)), ups, news, achieved, daily;
    var hoodWas = M.hoodCleared(M.level(i).hoodIndex);
    if (won) { if (stars > prev) s.stars[i] = stars; s.unlocked = Math.max(s.unlocked, Math.min(LEVELS, i + 1)); }
    if (!hoodWas && M.hoodCleared(M.level(i).hoodIndex)) s.counters.hoodsCleared += 1;   // AUDIT-7 CR-8: once per hood
    bond = P.Bond.gain(s.bonds.kaan | 0, { levelIndex: i, won: won, stars: stars, prevStars: prev });
    s.bonds.kaan = (s.bonds.kaan | 0) + bond.gain;
    rw.total = Math.round(coinBonus(s, rw.total) * dailyCoinMult(r));
    s.coins += rw.total;
    s.heroes.arda.stats = st.prog;
    if (st.gains.sc > 0) scFlow(st.gains.sc, 'level_end', st.prog.sc);
    bond.crossed.forEach(function (at) { tel('bond_threshold', { companion: 'kaan', threshold: at, value: s.bonds.kaan | 0, level_id: i }); });
    ups = accumulateMastery(s, r.tally && r.tally.bySrc);
    daily = dailyResult(s, r, won, day);
    P.Meta.Collect.bump(s, Object.assign({}, r, { won: won, levelIndex: i, daily: !!daily }));
    news = P.Meta.Collect.onLevel(s, { levelIndex: i, won: won, pageIds: r.pageIds }, M.snapshot().done);
    achieved = P.Meta.Collect.checkAchievements(s);
    var newGear = unlockGear(s);
    s.lastPlayed = now;
    return { levelIndex: i, won: won, stars: stars, reward: rw, newGear: newGear, before: before, after: M.snapshot(),
      kills: r.kills | 0, statGains: { hero: 'arda', gains: st.gains, before: st0, after: st.prog },
      masteryUps: ups, collected: news, achieved: achieved, daily: daily,
      bond: { kaan: { gain: bond.gain, value: s.bonds.kaan | 0, crossed: bond.crossed, joined: i === P.CFG.bond.kaan.joinLevel && won && !prev } } };
  }
  // Called by the game after a level. r: {levelIndex, won, stars, coins, kills, timeS, tally, daily, reviveUsed}.
  M.onResults = function (r) {
    var s = load(), now = Date.now(), p;
    r = r || {};
    p = apply(s, r, now);
    s.pending = p;
    activeRun = null;
    save();
    return p;
  };
  M.takePending = function () {
    var s = load(), p = s.pending;
    if (p) { s.pending = null; save(); }
    return p;
  };
  // Welcome-back summary once per return after 12 h. Also stamps lastPlayed.
  M.welcomeTake = function (now) {
    var s = load(), t = now || Date.now(), day = P.Meta.Daily.dayKey(new Date(t)),
      info = P.Meta.Daily.welcome(t, s.lastPlayed, P.Meta.Daily.liveStreak(s.streak, day));
    s.lastPlayed = t; save();
    return info;
  };
  // For other systems (lead, story D): unlock a collection item such as 'page:<id>' or 'letter:1'. True when new.
  M.collect = function (id) {
    var added = M.Collect.add(load(), String(id || ''));
    if (added) save();
    return added;
  };
  M.reset = function () {
    M.Save.wipe();
    mem = M.Save.defaults();
    save();
    return M.progress();
  };
  M.debugUnlockAll = function () {
    var s = load(), i;
    for (i = 1; i <= LEVELS; i++) s.stars[i] = M.CFG.starsMax;
    s.unlocked = LEVELS;
    s.coins += M.CFG.coins.debugGrant;
    s.counters.kills = Math.max(s.counters.kills, 20000);
    s.counters.hoodsCleared = J.hoods.length;   // every hood is cleared now, so the walk counter must agree (CR-8)
    unlockGear(s);
    save();
    return M.progress();
  };
})(P.Meta);
