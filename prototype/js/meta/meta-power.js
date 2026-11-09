// Power model (workstream D, AUDIT-5 F-2). PURE: no DOM, no localStorage. Loaded by the game (after meta-data.js)
// and by tools/bot.js. Numbers live in js/config-power.js. The real loadout (P.Meta.loadout) and the bot's expected
// loadout (P.Power.expectedLoadout) are built by the same functions, so the bot tests what a real player gets.
P.Power = P.Power || {};
(function (W) {
  var C = P.CFG.power, J = P.Journey, M = P.Meta;
  var clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };
  var r3 = function (v) { return Math.round(v * 1000) / 1000; };

  // Hood rank from cleared hoods (0..max). Hood rank power is added on top of gear (gear keeps its cap).
  W.rankOf = function (hoodsDone) { return clamp(Math.floor(+hoodsDone || 0), 0, C.hoodRank.max); };
  W.hoodFx = function (hoodsDone) {
    var H = C.hoodRank, n = W.rankOf(hoodsDone);
    return { mightPct: r3(H.mightPct * n), maxHpPct: r3(H.maxHpPct * n), cooldownPct: r3(H.cooldownPct * n) };
  };

  // Gear totals from [{id, lvl}] (meta-data.js ITEMS and factor). Each stat is capped at gear.maxStatPct.
  W.gearTotal = function (items) {
    var g = { maxHpPct: 0, mightPct: 0, movePct: 0, pickupPct: 0, cooldownPct: 0 };
    (items || []).forEach(function (it) {
      var st = it && it.id ? M.itemStats(it.id, it.lvl) : {};
      Object.keys(st).forEach(function (k) { g[k] = g[k] + st[k]; });
    });
    Object.keys(g).forEach(function (k) { g[k] = r3(Math.min(M.CFG.gear.maxStatPct, g[k])); });
    return g;
  };

  // Gear plus hood rank, for a loadout. Hood rank adds on top of the gear cap (it is not gear).
  W.gearWithHood = function (items, hoodsDone) {
    var g = W.gearTotal(items), h = W.hoodFx(hoodsDone);
    Object.keys(h).forEach(function (k) { g[k] = r3((g[k] || 0) + h[k]); });
    return g;
  };

  // Hoods fully cleared before journey level `index` (1-based). Levels are sequential, so this is its hood index.
  W.hoodsBefore = function (index) { return Math.floor((clamp(Math.round(+index) || 1, 1, J.hoods.length * J.levelsPerHood) - 1) / J.levelsPerHood); };

  // The typical player at level `index`: every number follows hoods cleared, and the rule for each is in config.
  W.expectedLoadout = function (index) {
    var E = C.expect, done = W.hoodsBefore(index), lvl = clamp(Math.round(1 + E.gearPerHood * done), 1, M.CFG.gear.maxLevel);
    var attr = clamp(Math.round(E.attrPerHood * done), 0, E.attrMax), stats = {}, mastery = {}, items = [], lo;
    var mr = clamp(Math.floor(E.masteryPerHood * done), 0, (P.CFG.mastery && P.CFG.mastery.need ? P.CFG.mastery.need.length : 5));
    ['str', 'pace', 'agg', 'int', 'cha', 'grit'].forEach(function (s) { stats[s] = attr; });
    E.masteryWeapons.forEach(function (w) { mastery[w] = mr; });
    M.SLOTS.forEach(function (slot) {
      var owned = slot.items.filter(function (id) { var it = M.ITEMS[id]; return it && (!it.unlockAt || it.unlockAt <= index - 1); });
      if (owned.length) items.push({ id: owned[owned.length - 1], lvl: lvl });
    });
    lo = { gear: W.gearWithHood(items, done), startWeapon: M.CFG.startWeapon, stats: stats, mastery: mastery, ult: E.ult, hero: 'arda', modifiers: [] };
    return lo;
  };

  // One-line summary for the bot table: hood rank, mean attribute rank, gear level, main mastery rank, total power.
  W.summary = function (index) {
    var lo = W.expectedLoadout(index), st = lo.stats, avg = (st.str + st.pace + st.agg + st.int + st.cha + st.grit) / 6;
    var g = lo.gear, mult = (1 + g.mightPct) / (1 - Math.min(0.5, g.cooldownPct));   // damage x fire rate (meta only)
    return { rank: W.hoodsBefore(index), attr: Math.round(avg * 10) / 10, mastery: lo.mastery.knife || 0,
      might: g.mightPct, hp: g.maxHpPct, cdr: g.cooldownPct, mult: Math.round(mult * 100) / 100 };
  };
})(P.Power);
