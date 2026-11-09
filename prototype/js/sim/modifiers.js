// Run modifiers (lane P, P4). Pure: no DOM. P.Modifiers.forLevel(levelInfo) names the modifier of a level (or null);
// P.Modifiers.apply(s) sets s.mod = { id, moveMul, dark } and scales s.diff (spawn rate and XP per kill).
// Called once from P.Objectives.attach after the level is built, so every spawn sees the scaled rates.
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
