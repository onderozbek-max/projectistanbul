// Chapter 1 arrival flow (L100 win). Replaces the one-line 'end' page for level 100 only: the approach to the apartment
// (view/finale-approach.js), the comic pages fin_arrive_a and fin_arrive_b (story/finale-data.js), then the "Bölüm 1 tamam"
// card with run stats (view/finale-credits.js). Then done() runs, which main.js uses to open the normal results screen.
// main.js calls P.Finale.start from finishWin() and P.Finale.tick from its frame loop (both guarded). Debug: play level 100,
// then push {type: 'win'} into P.debug.sim.events (see the report) or call P.Finale.start(100, P.debug.sim, function () {}).
P.Finale = (function () {
  var F = P.Finale || {}, FINAL_LEVEL = 100;
  F.PAGES = F.PAGES || ['fin_arrive_a', 'fin_arrive_b'];
  F.wants = function (levelIndex) {
    return levelIndex === FINAL_LEVEL && !!P.FinaleApproach && !!P.Story && !!P.Comic;
  };
  // done() runs once, after the credits card. Returns false (and does nothing) for other levels.
  F.start = function (levelIndex, sim, done) {
    if (!F.wants(levelIndex)) return false;
    F.sim = sim; F.done = done || function () {};
    P.Sfx && P.Sfx.play && P.Sfx.play('hoodIntro');
    P.FinaleApproach.start(function () {
      P.Comic.page(F.PAGES, function () { showCredits(); });
    });
    return true;
  };
  // Frame hook from main.js: only the approach needs a per-frame update.
  F.tick = function (dt) { if (P.FinaleApproach) P.FinaleApproach.update(dt); };
  F.active = function () { return !!(P.FinaleApproach && P.FinaleApproach.active()); };

  // Chapter stats for the card: the journey's walk, the career counters, and this level's kills and time.
  function stats() {
    var J = P.Journey, n = J.hoods ? J.hoods.length : 20, last = J.hoods && J.hoods[n - 1];
    var st = P.Meta && P.Meta.state ? P.Meta.state() : null, c = (st && st.counters) || {}, sim = F.sim || {};
    return {
      km: (last && last.km) || 17.0, levels: J.count ? J.count() : 100, hoods: n,
      kills: c.kills | 0, bosses: c.bosses | 0,
      runKills: sim.kills | 0, runTime: sim.runT || 0
    };
  }
  function showCredits() {
    if (!P.FinaleCredits) { finish(); return; }
    P.FinaleCredits.show(stats(), finish);
  }
  function finish() {
    var d = F.done; F.done = null; F.sim = null;
    if (d) d(true);
  }
  return F;
})();
