// Nightmare meta (R1-T4 part 18): per-hood unlock, best Nightmare stars per level, moon badges, the optional title and
// the Nightmare reward rule. State is the additive save block s.modes.nm / moon / title (meta-save.js). No DOM. The sim
// never reads this module: it only receives runMode 'nightmare' through the loadout.
// Unlock: a hood is open for Nightmare once every level of it is cleared on Normal (M.hoodCleared).
// Moon: a hood's badge is earned by clearing all its levels on Nightmare. Title: after config nightmare.titleAt moons.
P.Meta = P.Meta || {};
(function (M) {
  var MD = M.Modes = {}, J = P.Journey;
  function modes() { return M.state().modes; }

  MD.unlocked = function (h) { return M.hoodCleared(h); };
  MD.unlockedLevel = function (i) { return MD.unlocked(M.level(i).hoodIndex); };
  MD.stars = function (i) { var r = modes().nm[i]; return r ? r.stars : 0; };
  MD.cleared = function (i) { return MD.stars(i) > 0; };
  MD.hoodDone = function (h) { return hoodDoneIn(modes(), h); };
  MD.doneCount = function (h) {
    var k, n = 0;
    for (k = 1; k <= J.levelsPerHood; k++) if (MD.cleared(M.levelAt(h, k))) n++;
    return n;
  };
  MD.moon = function (h) { return !!modes().moon[h]; };
  MD.moonCount = function () { return Object.keys(modes().moon).length; };
  MD.title = function () { return !!modes().title; };

  function hoodDoneIn(m, h) {
    for (var k = 1; k <= J.levelsPerHood; k++) if (!m.nm[M.levelAt(h, k)]) return false;
    return true;
  }

  // The mode a next level opens in: Nightmare carries on only inside the same hood (its unlock already holds there).
  MD.nextMode = function (mode, prevIdx, nextIdx) {
    if (mode !== 'nightmare' || !M.level(nextIdx)) return 'normal';
    return M.level(prevIdx).hoodIndex === M.level(nextIdx).hoodIndex ? 'nightmare' : 'normal';
  };

  // Settles a Nightmare run into s (the save object, meta-data.js apply). Returns what the results screen shows:
  // first (first Nightmare clear of the level: Street Cred x2), prevStars, stars, moon and title (newly earned).
  MD.settle = function (s, i, won, stars) {
    var h = M.level(i).hoodIndex, nm = s.modes.nm, prev = nm[i] ? nm[i].stars : 0, out = { first: false, prevStars: prev, stars: 0, moon: false, title: false, hood: h };
    if (!won) return out;
    out.first = prev === 0;
    nm[i] = { stars: Math.max(prev, stars) };
    out.stars = nm[i].stars;
    if (!s.modes.moon[h] && hoodDoneIn(s.modes, h)) { s.modes.moon[h] = 1; out.moon = true; }
    if (!s.modes.title && Object.keys(s.modes.moon).length >= P.CFG.nightmare.titleAt) { s.modes.title = 1; out.title = true; }
    return out;
  };
})(P.Meta);
