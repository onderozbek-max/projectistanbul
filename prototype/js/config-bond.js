// Companion bonds (R1-T5 step 4, D-059 section 6): the Kaan bond meter, 0..100. PURE: no DOM. Also loaded by the headless bot.
// Earned by play only: it is never sold and never costs Street Cred (business-plan 5.1). In the slice only Kaan has a meter.
// Kaan joins after the L20 win (D-045). His bond is earned by clearing levels. His authored support cues are separate.
var P = (typeof globalThis !== 'undefined' ? globalThis : window).P || {};
(typeof globalThis !== 'undefined' ? globalThis : window).P = P;

P.CFG = P.CFG || {};
P.CFG.bond = {
  kaan: {
    joinLevel: 20,            // clearing this level brings Kaan in (the kaan_join story page)
    support: { first: 21, radius: 3.15, maxTargets: 4, stun: 0.8, shove: 0.95,
      windup: 0.28, duration: 1.45, bossPhase: 2, maxUses: 2, repeatAfter: 8,
      repay: { level: 23, window: 6.2, radius: 2.6, sweep: 0.82, stun: 0.9, shove: 1.45, relief: 1.35 },
      work: { radius:2.15,reach:.75,T:1.7,leave:8,side:.75,ahead:.65,cameraW:9.6,threat:'runner',threatAhead:3.6,lureT:8,edge:.8 } },
    join: 5,                  // bond points for the join itself (first clear of joinLevel only)
    win: 4,                   // a first clear of a level after joinLevel
    replay: 1,                // a repeat clear of a level already cleared
    star3: 1,                 // extra on a first clear with 3 stars
    boss: 2,                  // extra on a first clear of a boss level (bossEvery)
    bossEvery: 5,             // level index % bossEvery === 0 is a boss level (stage 5 of a hood)
    thresholds: [25, 50, 75, 100],   // 25 aura, 50 combo ultimate; 75 and 100 are stubs in the slice (chapter 3 branch)
    auraHpPct: 0.03,          // threshold 25 "Kaan's Watch": +3% max HP (two Grit ranks)
    comboUlt: 'tackle',       // threshold 50: Tackle & Stab, an ultimate in P.CFG.ults
  },
};

P.Bond = {};

// Has Kaan joined? stars is the meta save's stars map { levelIndex: 0..3 }.
P.Bond.joined = function (stars) {
  return ((stars && stars[P.CFG.bond.kaan.joinLevel]) | 0) > 0;
};

// Index of the highest threshold reached (0 = none, 1..4).
P.Bond.tier = function (value) {
  var T = P.CFG.bond.kaan.thresholds, n = 0, i;
  for (i = 0; i < T.length; i++) if (value >= T[i]) n = i + 1;
  return n;
};

// Bond points for one finished level. r: { levelIndex, won, stars, prevStars } (prevStars = stars before this run).
// Returns { gain, crossed } where crossed lists thresholds passed when the meter goes from `before` to before + gain.
P.Bond.gain = function (before, r) {
  var K = P.CFG.bond.kaan, lv = r.levelIndex | 0, first = !(r.prevStars | 0), g = 0, max = P.CFG.tree.bondMax, after, T = K.thresholds, i, crossed = [];
  if (r.won && lv >= K.joinLevel) {
    if (lv === K.joinLevel) g = first ? K.join : K.replay;
    else if (!first) g = K.replay;
    else g = K.win + ((r.stars | 0) >= 3 ? K.star3 : 0) + (lv % K.bossEvery === 0 ? K.boss : 0);
  }
  after = Math.min(max, Math.max(0, before | 0) + g);
  for (i = 0; i < T.length; i++) if ((before | 0) < T[i] && after >= T[i]) crossed.push(T[i]);
  return { gain: after - (before | 0), crossed: crossed };
};
