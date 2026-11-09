// Unlock previews (lane P, owner ask: "visible unlock moments between levels"). Pure data, no DOM.
// P.Progress.unlockPreview(levelIndex) lists what the NEXT level brings: new weapons and passives (config unlock table),
// enemy types that join the roster, the next boss, a new hood, and the next level's objective and modifier.
// Entry: { kind, id, name (string key), raw (plain text, hood names), desc (string key or null) }.
// objectives-hud.js draws them on the results screen. A desc key is only shown when a string exists.
P.Progress = {};

// Roster of a level (mirrors levels.js rosterOf, which is private there): hood enemies, extras, schedule.
P.Progress.rosterOf = function (li) {
  var C = P.CFG.levels, hood = li.hood, base = hood.enemies.filter(function (t) { return t !== 'diner'; });
  var ex = C.hoodExtras[hood.id] || [], out;
  if (li.stage < C.extraFrom) return base;
  out = base.concat(ex.filter(function (t) { return base.indexOf(t) < 0; }));
  C.schedule.forEach(function (sc) {
    if (sc.hood === hood.id && li.stage >= sc.from && out.indexOf(sc.type) < 0) out.push(sc.type);
  });
  return out;
};

P.Progress.unlockPreview = function (levelIndex) {
  var count = P.Journey.count(), out = [], groups = { weapons: 'weapon', passives: 'passive' }, cur, nx, before, mod, ob;
  if (!levelIndex || levelIndex >= count) return out;
  cur = P.Journey.level(levelIndex);
  nx = P.Journey.level(levelIndex + 1);
  Object.keys(groups).forEach(function (g) {
    Object.keys(P.CFG.unlock[g]).forEach(function (id) {
      if (P.CFG.unlock[g][id] === nx.index) out.push({ kind: groups[g], id: id, name: 'item.' + id, desc: 'desc.' + id });
    });
  });
  before = P.Progress.rosterOf(cur);
  P.Progress.rosterOf(nx).forEach(function (t) {
    if (before.indexOf(t) < 0) out.push({ kind: 'enemy', id: t, name: 'cause.' + t, desc: null });
  });
  if (nx.boss) out.push({ kind: 'boss', id: nx.hood.id, name: 'spk.b.' + nx.hood.id, desc: null });   // boss names: story strings
  if (nx.hoodIndex !== cur.hoodIndex) out.push({ kind: 'hood', id: nx.hood.id, raw: nx.hood.name, desc: null });
  ob = P.Objectives && P.Objectives.forLevel(nx);
  if (ob) out.push({ kind: 'objective', id: ob, name: 'obj.' + ob + '.title', desc: null });
  mod = P.Modifiers && P.Modifiers.forLevel(nx);
  if (mod) out.push({ kind: 'mod', id: mod.id, name: 'hmod.' + mod.id + '.name', desc: 'hmod.' + mod.id + '.desc' });
  return out;
};
