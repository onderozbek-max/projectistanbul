// Level objectives (lane P). Pure: no DOM. One objective per generated level (2..100); level 1 keeps its script.
// P.Objectives.forLevel(levelInfo) -> type id (table: config-objectives.js). Stage 5 is the boss.
// P.Objectives.attach(s): after the level is built (sim.js createSim). Applies the run modifier (sim/modifiers.js) and
// sets s.obj. P.Objectives.step(s, dt): after P.Levels.step each tick (director.js). Kinds: sim/objectives-kinds.js.
// Objectives never gate the exit. Done or failed is final. s.tally.objDone = 1 when done, so meta pays the bonus on a win.
// Read-only views: status (HUD row), items (HUD markers), results (results row), botTarget (tools/bot.js).
P.Objectives = {};

P.Objectives.forLevel = function (li) {
  var C = P.CFG.objectives;
  if (!li || li.index === 1) return null;
  if (li.boss || li.stage === P.Journey.levelsPerHood) return C.bossType;
  return C.route[(li.hoodIndex + li.stage) % C.route.length];
};

P.Objectives.bonusFor = function (levelIndex) {
  var B = P.CFG.objectives.bonus;
  return B.base + B.perLevel * (levelIndex || 1);
};

P.Objectives.clock = function (t) {
  t = Math.max(0, Math.floor(t));
  return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
};

P.Objectives.attach = function (s) {
  var id, o;
  if (!s.geo) return null;
  P.Modifiers.apply(s);
  id = P.Objectives.forLevel(s.levelInfo);
  if (!id) return null;
  o = { id: id, state: 'active', t: 0, prog: 0, stage: s.levelInfo.stage };
  P.ObjKinds[id].init(s, o);
  s.obj = o;
  s.tally.objDone = 0;
  s.events.push({ type: 'objStart', id: id });
  return o;
};

// Final outcome of an objective. Idempotent: the first call wins.
P.Objectives.resolve = function (s, o, ok) {
  if (o.state !== 'active') return;
  o.state = ok ? 'done' : 'failed';
  if (ok) s.tally.objDone = 1;
  s.events.push({ type: ok ? 'objDone' : 'objFail', id: o.id });
};

P.Objectives.step = function (s, dt) {
  var o = s.obj, K;
  if (!o || o.state !== 'active') return;
  K = P.ObjKinds[o.id];
  o.t += dt;
  K.step(s, o, dt);
  if (o.state === 'active' && s.mode === 'won') P.Objectives.resolve(s, o, K.won(s, o));
};

// HUD row: { id, state, title, line, vars, frac, bonus }. Null when the level has no objective.
P.Objectives.status = function (s) {
  var o = s && s.obj, st;
  if (!o) return null;
  st = P.ObjKinds[o.id].status(s, o);
  return { id: o.id, state: o.state, title: 'obj.' + o.id + '.title', line: st.line, vars: st.vars || {}, frac: st.frac,
    hp: st.hp === undefined ? null : st.hp, bonus: P.Objectives.bonusFor(s.levelIndex) };
};

// World markers for the HUD: [{ x, y, kind, done, frac }].
P.Objectives.items = function (s) {
  var o = s && s.obj;
  return o && o.state !== 'failed' ? P.ObjKinds[o.id].items(s, o) : [];
};

// Results row: the objective, whether it was done, and the bonus it adds on a win. A run that ends while the objective
// is still live (the hero died first, or the gate never came) counts as missed.
P.Objectives.results = function (s) {
  var st = P.Objectives.status(s), state;
  if (!st) return null;
  state = st.state === 'active' ? 'failed' : st.state;
  return { id: st.id, state: state, done: state === 'done', title: st.title, line: st.line, vars: st.vars, bonus: st.bonus };
};

// Star goals (owner ask: clear, no revive, objective bonus). Each goal is { key, vars, on, hp }: string keys only, so the
// sim stays text-free. Star 3 is the objective when the level has one; level 1 has none and keeps the HP goal (hp: true
// lets the results screen add "ended at N%"). main.js passes these to P.Meta (stars) and to the results screen.
P.Objectives.goals = function (s, won) {
  var st = P.Objectives.results(s), o = s.obj, third;
  if (st) third = { key: 'obj.goal.' + st.id, vars: { par: P.Objectives.clock(o && o.par ? o.par : 0) }, on: !!st.done, hp: false };
  else third = { key: 'ui.res.starHp', vars: {}, on: s.hero.hp / s.hero.maxHp >= P.CFG.objectives.stars.hp, hp: true };
  return [
    { key: 'ui.res.starClear', vars: {}, on: !!won, hp: false },
    { key: 'ui.res.starNoRevive', vars: {}, on: !!won && !s.reviveUsed, hp: false },
    third,
  ];
};

P.Objectives.stars = function (s, won) {
  return P.Objectives.goals(s, won).map(function (g) { return g.on; });
};

// Bot waypoint [x, y] for the objective, or null (the bot keeps its route).
P.Objectives.botTarget = function (s) {
  var o = s && s.obj, K;
  if (!o || o.state !== 'active') return null;
  K = P.ObjKinds[o.id];
  return K.target ? K.target(s, o) : null;
};
