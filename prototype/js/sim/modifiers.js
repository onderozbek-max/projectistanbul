// Run modifiers (lane P, P4). Pure: no DOM. P.Modifiers.forLevel(levelInfo) names the modifier of a level (or null);
// P.Modifiers.apply(s) sets s.mod = { id, moveMul, dark } and scales s.diff (spawn rate and XP per kill).
// Called once from P.Objectives.attach after the level is built, so every spawn sees the scaled rates.
//
// Daily modifiers (AUDIT-7 CR-1): meta-daily.js puts their effect fields in loadout.modifiers (ids already resolved to
// the config list). P.Modifiers.applyDaily(s), called from createSim, folds them into s.dailyMods and applies them:
// enemy HP through s.diff.hp (L1 gets a neutral s.diff for this), route spawns through s.diff.spawn (generated levels)
// or P.Modifiers.spawnScale (L1 director), elites as extra marks (generated) or P.Modifiers.echoElites (L1 script),
// no dash (P.Skills.tryDash) and no revive (P.revive, main.js). The coin reward is scaled in meta (meta-data.js).
// Unknown ids and bad numbers are ignored; multipliers are clamped (config-modifiers.js daily).
P.Modifiers = {};

P.Modifiers.forLevel = function (li) {
  var C = P.CFG.modifiers, R = C.rules, i;
  if (!li || li.index === 1 || li.boss) return null;
  for (i = 0; i < R.length; i++) {
    if (R[i].stage === li.stage && li.hoodIndex % R[i].every === R[i].rem) return { id: R[i].id, def: C.defs[R[i].id] };
  }
  return null;
};

P.Modifiers.apply = function (s) {
  var m = P.Modifiers.forLevel(s.levelInfo);
  s.mod = m ? { id: m.id, moveMul: m.def.moveMul, dark: m.def.dark } : null;
  if (m && s.diff) { s.diff.spawn *= m.def.spawnMul; s.diff.xp *= m.def.xpMul; }
  return s.mod;
};

// ---------- daily modifiers ----------
function dailyNum(x) {
  var c = P.CFG.modifiers.daily;
  return typeof x === 'number' && isFinite(x) ? Math.max(c.clampMin, Math.min(c.clampMax, x)) : 1;
}

// Folds a loadout.modifiers list into one set of effects. Entries without a string id are skipped.
P.Modifiers.dailyFold = function (list) {
  var out = { ids: [], spawnMult: 1, enemyHpMult: 1, eliteMult: 1, coinMult: 1, noDash: false, noRevive: false };
  (Array.isArray(list) ? list : []).forEach(function (m) {
    if (!m || typeof m !== 'object' || typeof m.id !== 'string') return;
    out.ids.push(m.id);
    out.spawnMult *= dailyNum(m.spawnMult);
    out.enemyHpMult *= dailyNum(m.enemyHpMult);
    out.eliteMult *= dailyNum(m.eliteMult);
    out.coinMult *= dailyNum(m.coinMult);
    if (m.noDash === true) out.noDash = true;
    if (m.noRevive === true) out.noRevive = true;
  });
  return out;
};

// Extra elites per route elite: eliteMult 2 gives one more ("elites are twice as common").
function eliteExtra(mult) { return Math.max(0, Math.round(mult) - 1); }

// Generated levels: every elite mark is repeated (extra) times, eliteGapM apart up the route.
function addEliteMarks(s, extra) {
  var g = s.gen, gap = P.CFG.modifiers.daily.eliteGapM, add = [], i, k;
  if (!g || extra < 1) return;
  for (k = 0; k < g.marks.length; k++) {
    if (g.marks[k].kind !== 'elite') continue;
    for (i = 1; i <= extra; i++) add.push({ y: g.marks[k].y + i * gap, kind: 'elite' });
  }
  g.marks = g.marks.concat(add).sort(function (a, b) { return a.y - b.y; });
}

// Called from createSim once the level is built. Sets s.dailyMods (null when the run has no daily modifiers).
P.Modifiers.applyDaily = function (s) {
  var d = P.Modifiers.dailyFold(s.loadout && s.loadout.modifiers);
  s.dailyMods = d.ids.length ? d : null;
  if (!s.dailyMods) return null;
  if (!s.diff) s.diff = { hp: 1, dmg: 1, spawn: 1, xp: 1 };   // L1 has no generated difficulty; its enemies still get the HP mult
  s.diff.hp *= d.enemyHpMult;
  if (s.geo) { s.diff.spawn *= d.spawnMult; addEliteMarks(s, eliteExtra(d.eliteMult)); }
  return s.dailyMods;
};

// Route spawn scale for the L1 director (generated levels already carry it in s.diff.spawn).
P.Modifiers.spawnScale = function (s) { return !s.geo && s.dailyMods ? s.dailyMods.spawnMult : 1; };

// L1 script: each scripted elite (director.js) brings its extra elites beside it, on the corridor.
P.Modifiers.echoElites = function (s, x, y) {
  var n = s.dailyMods ? eliteExtra(s.dailyMods.eliteMult) : 0, C = P.CFG.modifiers.daily, c = P.CFG.level.corridor, i;
  for (i = 0; i < n; i++) {
    P.Combat.spawnEnemy(s, 'walker', Math.max(c.xMin, Math.min(c.xMax, x + (i % 2 ? -1 : 1) * C.echoSideM)), y + C.echoAheadM * (i + 1), { elite: true });
  }
};

P.Modifiers.reviveBlocked = function (s) { return !!(s && s.dailyMods && s.dailyMods.noRevive); };
P.Modifiers.dashBlocked = function (s) { return !!(s && s.dailyMods && s.dailyMods.noDash); };
