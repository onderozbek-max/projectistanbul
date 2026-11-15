// Progress readouts (T4 part 5; docs/retention.md sections 3 and 4). PURE: no DOM, loaded by the game and by
// tools/test-progress-ui.js. Every number is read from the function the sim or the meta layer already uses: P.Power
// (meta-power.js) for hood rank and gear, P.Stats (config-stats.js) for attributes and Street Cred milestones, and
// P.Meta.loadout (meta-data.js) for what the sim is given. This file only adds sums and differences; no formula lives here.
P.Progress = P.Progress || {};
(function (G) {
  var M = P.Meta, Pw = P.Power, St = P.Stats;

  // Arda's power as the sim applies it (sim.js applyLoadout). dmg is the mightPct the sim multiplies each hit by (1 + dmg);
  // hp is the maxHpPct the sim adds to the base max HP (plus Kaan's bond aura). Parts: hood rank, gear (capped per stat),
  // attributes (str for damage, grit for HP) and the bond aura. perks = Street Tree perks the run starts with.
  G.power = function () {
    var lo = M.loadout(), done = M.snapshot().done, hood = Pw.hoodFx(done), gear = Pw.gearTotal(M.gearItems()),
      attr = St.effects(lo.stats), bond = lo.bondHpPct || 0;
    return {
      rank: Pw.rankOf(done), dmg: lo.gear.mightPct + attr.mightPct, hp: lo.gear.maxHpPct + attr.maxHpPct + bond,
      parts: { hood: { dmg: hood.mightPct, hp: hood.maxHpPct }, gear: { dmg: gear.mightPct, hp: gear.maxHpPct },
        attr: { dmg: attr.mightPct, hp: attr.maxHpPct }, bond: { hp: bond } },
      perks: (lo.perks || []).length
    };
  };

  // Street Cred for the walk: the saved balance plus what this run's kills have earned (milestones: P.Stats.scAt), and the
  // kills still needed for the next milestone (P.Stats.scKills). runKills is 0 on the map and after a run is saved.
  G.streetCred = function (runKills) {
    var st = M.heroStats(), base = st.kills | 0, total = base + Math.max(0, runKills | 0), n = St.scAt(total),
      lo = St.scKills(n), hi = St.scKills(n + 1), earned = n - St.scAt(base);
    return { balance: (st.sc | 0) + earned, earned: earned, total: total, next: hi - total, frac: (total - lo) / ((hi - lo) || 1) };
  };

  // A journey level for display: its number (1..100), hood, district number, stage (1..5), boss flag and the stage's place
  // name (P.Themes, view code; null where it is not loaded).
  G.levelInfo = function (i) {
    var L = M.level(i), th = P.Themes && P.Themes.get ? P.Themes.get(L.hood.theme) : null;
    return { index: L.index, hood: L.hood, hoodN: L.hoodIndex + 1, stage: L.stage, boss: L.boss,
      sub: th && P.Themes.subOf ? P.Themes.subOf(th, L.stage - 1) : null };
  };
  // The level after level i when it is won, or level i again after a loss. null past the last level.
  G.nextAfter = function (i, won) {
    var n = won ? i + 1 : i;
    return n > M.CFG.levelCount ? null : G.levelInfo(n);
  };

  // Hood rank power gained between two snapshots (done = fully cleared hoods), from P.Power.hoodFx and rankOf.
  G.hoodGain = function (doneBefore, doneAfter) {
    var a = Pw.hoodFx(doneBefore), b = Pw.hoodFx(doneAfter);
    return { dmg: b.mightPct - a.mightPct, hp: b.maxHpPct - a.maxHpPct, rank: Pw.rankOf(doneAfter) - Pw.rankOf(doneBefore) };
  };
})(P.Progress);
