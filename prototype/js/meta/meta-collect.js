// Achievements and collection ("Hatıralar") for v0.5, workstream C. Pure logic: no DOM.
// Counters are lifetime totals kept in save.counters (bumped in afterRun). Achievements are derived from them.
// Other systems can unlock collection items with P.Meta.collect(id), e.g. 'page:<storyPageId>', 'letter:1'.
P.Meta = P.Meta || {};
(function (M) {
  var C = M.Collect = M.Collect || {};
  // type: counter (default, uses def.c), mastery (weapon kills), flawless (hood), statMax, statMin, streak,
  // collect (collection count), masteryAny (any weapon kills). coins = reward in Jeton.
  C.ACH = [
    { id: 'a_first', c: 'wins', t: 1, coins: 50 },
    { id: 'a_walk10', c: 'meters', t: 10000, coins: 100 },
    { id: 'a_walk17', c: 'hoodsCleared', t: 20, coins: 500 },
    { id: 'a_kill100', c: 'kills', t: 100, coins: 50 },
    { id: 'a_kill1k', c: 'kills', t: 1000, coins: 150 },
    { id: 'a_kill10k', c: 'kills', t: 10000, coins: 400 },
    { id: 'a_piknik1k', type: 'mastery', w: 'canister', t: 1000, coins: 200 },
    { id: 'a_knife500', type: 'mastery', w: 'knife', t: 500, coins: 120 },
    { id: 'a_hack10', c: 'hacks', t: 10, coins: 80 },
    { id: 'a_hack100', c: 'hacks', t: 100, coins: 250 },
    { id: 'a_rescue25', c: 'rescues', t: 25, coins: 100 },
    { id: 'a_rescue100', c: 'rescues', t: 100, coins: 300 },
    { id: 'a_boss1', c: 'bosses', t: 1, coins: 80 },
    { id: 'a_boss10', c: 'bosses', t: 10, coins: 250 },
    { id: 'a_streak100', c: 'maxStreak', t: 100, coins: 100 },
    { id: 'a_crit500', c: 'crits', t: 500, coins: 120 },
    { id: 'a_ult10', c: 'ults', t: 10, coins: 150 },
    { id: 'a_dash200', c: 'dashes', t: 200, coins: 100 },
    { id: 'a_elite50', c: 'eliteKills', t: 50, coins: 120 },
    { id: 'a_karakoy', type: 'flawless', h: 'karakoy', t: 5, coins: 200 },
    { id: 'a_flawless10', c: 'flawlessTotal', t: 10, coins: 150 },
    { id: 'a_stat10', type: 'statMax', t: 10, coins: 200 },
    { id: 'a_statall5', type: 'statMin', t: 5, coins: 300 },
    { id: 'a_mastery_any', type: 'masteryAny', t: 500, coins: 150 },
    { id: 'a_daily1', c: 'dailies', t: 1, coins: 60 },
    { id: 'a_daily7', type: 'streak', t: 7, coins: 300 },
    { id: 'a_collect10', type: 'collect', t: 10, coins: 150 }
  ];
  // Collection rules: which hood or level unlocks what (story pages come from P.Story.pages at runtime).
  // Gates stay on the 100-level walk (AUDIT-7 CR-8; docs/journey.md §8.4): letter 2 at the midpoint, letter 3 on the last
  // boss before home. Letter 1 is the flat at Ataköy (L100).
  C.LETTERS = [{ id: 'letter:1', level: 100 }, { id: 'letter:2', level: 190 }, { id: 'letter:3', level: 300 }];

  function heroStats(s) { var h = s.heroes && s.heroes.arda; return h && h.stats ? h.stats : null; }
  function maxAttr(s, fn) {
    var st = heroStats(s), best = null, k;
    if (!st) return 0;
    for (k in st.attr) best = best === null ? st.attr[k] : fn(best, st.attr[k]);
    return best || 0;
  }
  function anyMastery(s) {
    var m = 0, k;
    for (k in s.mastery) m = Math.max(m, s.mastery[k]);
    return m;
  }
  // Current value of an achievement's metric.
  C.value = function (s, a) {
    if (a.type === 'mastery') return (s.mastery && s.mastery[a.w]) || 0;
    if (a.type === 'masteryAny') return anyMastery(s);
    if (a.type === 'flawless') return (s.counters.flawless && s.counters.flawless[a.h]) || 0;
    if (a.type === 'statMax') return maxAttr(s, Math.max);
    if (a.type === 'statMin') return maxAttr(s, function (x, y) { return Math.min(x, y); });
    if (a.type === 'streak') return (s.streak && s.streak.best) || 0;
    if (a.type === 'collect') return C.count(s);
    return s.counters[a.c] || 0;
  };
  C.progress = function (s) {
    return C.ACH.map(function (a) {
      var v = C.value(s, a), done = !!s.achievements[a.id];
      return { id: a.id, v: Math.min(v, a.t), t: a.t, done: done, coins: a.coins,
        nameKey: 'ach.' + a.id, descKey: 'ach.' + a.id + '.d' };
    });
  };

  // ---- Collection ----
  C.count = function (s) {
    var n = 0, k;
    for (k in s.collection) if (s.collection[k]) n++;
    return n;
  };
  // Adds an item. Returns true when it was new (the caller shows a toast).
  C.add = function (s, id) {
    if (!id || s.collection[id]) return false;
    s.collection[id] = 1;
    return true;
  };
  // Catalogue for the UI: [{id, kind, n}]. Story pages come from P.Story when loaded.
  C.catalogue = function () {
    var out = [], pages = (P.Story && P.Story.pages) || {}, J = P.Journey;
    Object.keys(pages).forEach(function (id) { out.push({ id: 'page:' + id, kind: 'page', n: id }); });
    J.hoods.forEach(function (h) { out.push({ id: 'postcard:' + h.id, kind: 'postcard', n: h.id }); });
    C.LETTERS.forEach(function (l) { out.push({ id: l.id, kind: 'letter', n: l.id.split(':')[1] }); });
    (M.Mastery && M.Mastery.list ? M.Mastery.list() : []).forEach(function (w) {
      out.push({ id: 'badge:' + w, kind: 'badge', n: w });
    });
    out.push({ id: 'cos:streak7', kind: 'cosmetic', n: 'streak7' }, { id: 'cos:ferry_cap', kind: 'cosmetic', n: 'ferry_cap' });
    return out;
  };

  // Counters bumped from one finished level. r = onResults input; s is mutated.
  C.bump = function (s, r) {
    var t = r.tally || {}, c = s.counters, won = !!r.won, revived = !!(r.reviveUsed || t.revives);
    c.kills += (t.kills | 0) || (r.kills | 0) || 0;
    c.hacks += t.hacks | 0; c.rescues += t.rescues | 0; c.bosses += t.bosses | 0; c.dashes += t.dashes | 0;
    c.ults += t.ults | 0; c.crits += t.crits | 0; c.eliteKills += t.elites | 0;
    c.meters += Math.round(+t.distance || 0);
    c.maxStreak = Math.max(c.maxStreak, t.maxStreak | 0);
    c.dailies += r.daily ? (won ? 1 : 0) : 0;
    c.wins += won ? 1 : 0;
    if (won && !revived) {
      c.flawlessTotal += 1;
      var hood = M.level(r.levelIndex).hood.id;
      c.flawless[hood] = (c.flawless[hood] || 0) + 1;
    }
  };
  // Unlocks collection items caused by a finished level: hood postcards, letters, weapon badges, story pages.
  C.onLevel = function (s, r, hoodsDone) {
    var news = [], idx = M.clampLevel(r.levelIndex);
    if (r.won) {
      C.LETTERS.forEach(function (l) { if (idx === l.level && C.add(s, l.id)) news.push(l.id); });
      if (M.hoodCleared && M.hoodCleared(M.level(idx).hoodIndex)) {
        var pc = 'postcard:' + M.level(idx).hood.id;
        if (C.add(s, pc)) news.push(pc);
      }
      (r.pageIds || []).forEach(function (p) { if (C.add(s, 'page:' + p)) news.push('page:' + p); });
    }
    if (hoodsDone >= 20 && C.add(s, 'cos:ferry_cap')) news.push('cos:ferry_cap');
    return news;
  };
  // Mastery badges appear at rank 5 (weapon mastery, see meta-data.js).
  C.badgeFor = function (s, w, rank) {
    var id = 'badge:' + w;
    return rank >= 5 && C.add(s, id) ? id : null;
  };
  // Evaluates every achievement that is not done yet. Grants coins to s and returns the unlocked defs.
  C.checkAchievements = function (s) {
    var got = [];
    C.ACH.forEach(function (a) {
      if (s.achievements[a.id] || C.value(s, a) < a.t) return;
      s.achievements[a.id] = 1;
      s.coins += a.coins;
      got.push({ id: a.id, coins: a.coins });
    });
    return got;
  };
})(P.Meta);
