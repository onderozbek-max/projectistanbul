// Replay modes (R1-T4 part 18): Nightmare and the Night Shift daily. Pure sim logic: reads s.runMode (set from
// loadout.mode in sim.js), config-modes.js and the level state. No settings, no clock, no DOM.
// 'normal' (or no mode): every hook returns its neutral value, so normal runs are unchanged.
// 'nightmare': the same level with s.diff multipliers (config levels.nightmare) and one hood signature, through
//   existing levers (elite marks, roster types, gate hold length).
// 'nightshift': one endless run. geo.endless keeps the gate shut (levels.js holdStage), spawn density ramps with run
//   time (spawnMul), the run ends as a win at the time cap (step), and the score is survival + kills + levels.
P.Modes = {};

P.Modes.of = function (s) { return s.runMode || 'normal'; };
P.Modes.isNightmare = function (s) { return s.runMode === 'nightmare'; };
P.Modes.isNightShift = function (s) { return s.runMode === 'nightshift'; };

// Nightmare difficulty for journey index `index`, on top of the normal difficulty `base` (levels.js difficulty).
// Each multiplier is base + lin x k (k = index - 1), so the tier grows with the route like the normal curve does.
P.Modes.nightmareDiff = function (index, base) {
  var N = P.CFG.levels.nightmare, k = index - 1, sp = N.spawn;
  return { hp: base.hp * (N.hp.base + N.hp.lin * k), dmg: base.dmg * (N.dmg.base + N.dmg.lin * k),
    spawn: Math.min(sp.cap, base.spawn * (sp.base + sp.lin * k)), xp: base.xp, heal: N.heal, bossShare: N.bossShare, bossHp: N.bossHp };
};

// Called from sim.js after P.Levels.build (generated levels) or on L1 (scripted, no s.geo). Sets s.diff, the hood
// signature and endless mode. Marks and roster are changed before the first tick, so the route stays deterministic.
P.Modes.apply = function (s) {
  if (s.runMode !== 'nightmare' && s.runMode !== 'nightshift') return;
  var base = s.diff || { hp: 1, dmg: 1, spawn: 1, xp: 1 }, G = s.geo, g = s.gen;
  s.minHpFrac = 1;   // lowest hero HP fraction this run (step below); the fourth star reads it
  if (s.runMode === 'nightshift') { if (G) G.endless = true; s.diff = base; return; }
  s.diff = P.Modes.nightmareDiff(s.levelIndex, base);
  if (!G) { s.diff.spawn = base.spawn; s.sig = signatureOf(s); return; }   // L1: spawn goes through l1Spawn (director)
  s.sig = signatureOf(s);
  var sig = s.sig;
  if (!sig || G.boss) return;   // the boss stage keeps its own pace; the signature changes route stages 1-4
  if (sig.lever === 'elite') {
    g.marks.push({ y: G.holdY * sig.v, kind: 'elite' });
    g.marks.sort(function (a, b) { return a.y - b.y; });
  } else if (sig.lever === 'roster') {
    if (g.roster.indexOf(sig.v) < 0) g.roster.push(sig.v);
  } else if (sig.lever === 'hold') {
    G.holdT *= sig.v;
    s.dir.hold.T = G.holdT;
  }
};

function signatureOf(s) {
  var sig = P.CFG.levels.nightmare.sig[s.levelInfo.hood.id];
  return sig ? { lever: sig.lever, v: sig.v } : null;
}

// Route spawn multiplier for the Night Shift ramp (1 for the other modes). levels.js spawnBudget multiplies it in.
P.Modes.spawnMul = function (s) {
  if (s.runMode !== 'nightshift') return 1;
  var R = P.CFG.nightshift.ramp;
  return Math.min(R.cap, 1 + R.perSec * s.runT);
};

// L1 (scripted) spawn multiplier for Nightmare, read by director.js runBudget (1 otherwise).
P.Modes.l1Spawn = function (s) {
  return s.runMode === 'nightmare' && !s.geo ? P.CFG.levels.nightmare.l1Spawn : 1;
};

// L1 signature 'elite': an echo of the scripted first elite, two metres to the side (director.js calls it there).
P.Modes.l1Elite = function (s, x, y) {
  if (s.runMode !== 'nightmare' || !s.sig || s.sig.lever !== 'elite' || s.geo) return;
  P.Combat.spawnEnemy(s, 'walker', x < 0 ? x + 2.2 : x - 2.2, y, { elite: true });
};

// Per tick (sim.js, after the play check): track the lowest HP fraction and end the Night Shift at the time cap.
P.Modes.step = function (s) {
  if (s.runMode !== 'nightmare' && s.runMode !== 'nightshift') return;
  var h = s.hero, f = h.hp / h.maxHp;
  if (f < s.minHpFrac) s.minHpFrac = f;
  if (s.runMode === 'nightshift' && s.mode === 'play' && s.runT >= P.CFG.nightshift.capS) {
    s.mode = 'won';
    s.nsEnd = 'clock';
    s.events.push({ type: 'win' });
  }
};

// Fourth star (Nightmare only): clear, no revive, and the lowest run HP at or above fourthHp.
P.Modes.fourthStar = function (s, won, reviveUsed) {
  return s.runMode === 'nightmare' && !!won && !reviveUsed && (s.minHpFrac || 0) >= P.CFG.levels.nightmare.fourthHp;
};

// Night Shift score: survival seconds, kills x factor, Adrenalin (levels) x factor. Local best only (meta layer).
P.Modes.nightScore = function (s) {
  var S = P.CFG.nightshift.score;
  return Math.round(s.runT * S.survive + (s.kills || 0) * S.kill + (s.level || 1) * S.level);
};
