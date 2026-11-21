// Behaviour regression: players must finish one bubble before a reply replaces it.
// Uses the real dialogue picker and bark scheduler; only canvas layout/placement is stubbed.
'use strict';
const assert = require('assert'), fs = require('fs'), vm = require('vm'), path = require('path');
const { loadP } = require('./lib-load');
const P = loadP();
P.ComicArt = { ready: true };
P.ComicText = {
  insets: () => ({ x: 8 }),
  fit: (c, s) => ({ lines: [s], px: 15, lh: 18, ok: true }),
  widest: () => 160,
  boxH: () => 64
};
P.ComicLayout = {};
let overlay = false, canPlace = true;
global.document = { createElement: () => ({ getContext: () => ({}) }) };
P.UI = { isOverlay: () => overlay };
P.Comic = { active: () => false };
P.Speech = {
  PRIO: { groan: 1, bark: 1 }, provider: () => {}, noteDrop: () => {},
  offer: o => o.place(canPlace ? { n: 0, x: 0, y: 0 } : null),
  tailTarget: () => ({ tx: 0, ty: 0 })
};
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '../js/story/barks.js'), 'utf8'));
const render = { toScreen: () => ({ x: 100, y: 100 }) };

function setup(seed, zombie = true) {
  overlay = false; canPlace = true; P.lang = 'tr'; P.Barks.reset(seed);
  const z = { x: 1.8, y: 0, type: 'walker', state: 'active', dead: false };
  const sim = { hero: { x: 0, y: 0, moving: true, hp: 100, maxHp: 100 }, levelIndex: 6, enemies: zombie ? [z] : [] };
  return { sim, z, clock: 0, events: [], last: null };
}
function step(run) {
  run.clock += 0.1;
  P.Barks.update(0.1, run.sim); P.Barks.offer(render, run.sim);
  const cur = P.Barks.current(), id = cur && cur.id;
  if (id && id !== run.last) run.events.push({ id, t: run.clock });
  run.last = id;
}
function advance(run, seconds) { for (let i = 0; i < seconds * 10; i++) step(run); }
function isQuestion(e) { return e && e.id.startsWith('BK.zq#'); }
let chainCase = null, completed = 0;
for (let seed = 1; seed <= 20 && completed < 5; seed++) {
  const run = setup(seed); advance(run, 160);
  for (let i = 1; i < run.events.length; i++) {
    const prev = run.events[i - 1], cur = run.events[i];
    if (!cur.id.startsWith('BK.zr#')) continue;
    assert.ok(isQuestion(prev), 'A zombie reply must follow Arda, not another event');
    assert.ok(cur.t - prev.t >= 2.25, 'The question was replaced too soon: ' + (cur.t - prev.t));
    const reaction = run.events[i + 1];
    if (reaction && reaction.id.startsWith('BK.zreact#')) {
      assert.ok(reaction.t - cur.t >= 2.25, 'The response was replaced too soon: ' + (reaction.t - cur.t));
      completed++; chainCase = chainCase || { seed, at: prev.t };
    }
  }
}
assert.ok(completed >= 5, 'Exercise several complete live exchanges');

function interruptQuestion(kind) {
  const run = setup(chainCase.seed);
  while (run.clock + 0.05 < chainCase.at) step(run);
  assert.ok(isQuestion(run.events.at(-1)), 'Reach a live question');
  const count = run.events.length;
  if (kind === 'dead') run.z.dead = true;
  if (kind === 'placement') canPlace = false;
  if (kind === 'overlay') overlay = true;
  if (kind === 'distance') run.z.x = 20;
  if (kind === 'crowd') run.sim.enemies.push({ x: 2, y: 0, type: 'runner', state: 'active' });
  if (kind === 'hit') P.Barks.onEvent({ type: 'heroHit', hp: 90 }, run.sim);
  if (kind === 'phone') run.sim.dir = { call: { sub: { id: 'callA2' }, queue: [] } };
  advance(run, 12);
  assert.ok(!run.events.slice(count).some(e => /^BK\.(zr|zreact)#/.test(e.id)),
    kind + ': do not deliver replies to a dead speaker or unread question');
}
['dead', 'placement', 'overlay', 'distance', 'crowd', 'phone'].forEach(interruptQuestion);
// A hit abandons this chain; after eight seconds an entirely new one may eventually begin.
{
  const run = setup(chainCase.seed);
  while (run.clock + 0.05 < chainCase.at) step(run);
  const count = run.events.length;
  P.Barks.onEvent({ type: 'heroHit', hp: 90 }, run.sim); advance(run, 7);
  assert.ok(!run.events.slice(count).some(e => /^BK\.(zq|zr|zreact)#/.test(e.id)));
}

for (const [event, prefix] of [['rescueStart', 'BK.ev.rescue#'], ['rescueDone', 'BK.rescue#']]) {
  const run = setup(81, false);
  P.Barks.onEvent({ type: event }, run.sim); advance(run, 4);
  assert.ok(run.events.some(e => e.id.startsWith(prefix)), event + ' must match the actual outcome');
}
console.log('PASS: readable exchanges, cancelled orphan replies, and accurate rescue status');

for (const lang of ['en', 'tr']) {
  for (const scenario of ['opening', 'boss', 'hurt', 'phone', 'farewell', 'runner', 'crowd']) {
    const run = setup(9); P.lang = lang;
    if (scenario === 'opening') run.sim.levelIndex = 1;
    if (scenario === 'boss') run.sim.gen = { boss: { dead: false } };
    if (scenario === 'hurt') run.sim.hero.hp = 40;
    if (scenario === 'phone') run.sim.dir = { call: { active: true, sub: { id: 'callA1' }, queue: [] } };
    if (scenario === 'farewell') { run.sim.levelIndex = 25; P.Barks.onEvent({ type: 'bossDie' }, run.sim); }
    if (scenario === 'runner') run.z.type = 'runner';
    if (scenario === 'crowd') run.sim.enemies.push({ x: 2, y: 0, type: 'walker', state: 'active' });
    advance(run, 180);
    assert.ok(!run.events.some(isQuestion), lang + ': no casual conversation during ' + scenario);
    if (scenario === 'phone' || scenario === 'farewell') assert.strictEqual(run.events.length, 0);
  }
  for (const kind of ['ambush', 'pier', 'chest', 'rescue', 'hazard']) {
    const run = setup(81, false); P.lang = lang;
    P.Barks.onEvent({ type: 'eventEnd', kind, result: 'done' }, run.sim); advance(run, 5);
    assert.ok(!run.events.some(e => e.id.startsWith('BK.evend.')), lang + ': lifecycle end is not victory: ' + kind);
  }
  {
    const run = setup(81, false); P.lang = lang;
    P.Barks.onEvent({ type: 'eventStart', kind: 'hazard', sub: 'gas' }, run.sim); advance(run, 5);
    assert.ok(!run.events.some(e => e.id.startsWith('BK.ev.burningCar')), 'Gas is not a burning car');
  }
  {
    const run = setup(81, false); P.lang = lang;
    P.Barks.onEvent({ type: 'kill', enemy: 'spitter' }, run.sim); advance(run, 5);
    assert.ok(!run.events.some(e => e.id.startsWith('BK.fk.')), 'No encounter warning for a corpse');
  }
  for (const healed of [0, 5]) {
    const run = setup(81, false); P.lang = lang;
    P.Barks.onEvent({ type: 'pickup', kind: 'medkit', healed }, run.sim); advance(run, 4);
    assert.equal(run.events.some(e => e.id.startsWith('BK.heal#')), healed > 0, 'Only real healing gets a recovery line');
  }
}
console.log('PASS: EN/TR opening, danger, phone, grief, event outcomes and encounter context');

// Use real actor records and the real spawn/lob events. Other fixtures reproduce the existing
// action-event shape (origin coordinates, no enemy id); no scheduler internals are exposed.
const warningTypes = ['eliteSpawn', 'bruteRoar', 'bruteCharge', 'spit', 'bloaterSwell', 'summon', 'bossSlam'];
function warningRun(type, lang) {
  const run = setup(461, false), s = P.createSim(461);
  s.levelIndex = 6; s.levelInfo = null; s.enemies = []; s.events = [];
  Object.assign(s.hero, { x: 0, y: 0, moving: true, hp: 100, maxHp: 100 });
  s.dir.call.active = false; s.dir.call.sub = null; s.dir.call.queue = [];
  s.dir.barks.cur = null;
  const kind = type === 'eliteSpawn' ? 'walker' : type === 'spit' ? 'spitter' : type === 'bloaterSwell' ? 'bloater' : 'brute';
  const z = P.Combat.spawnEnemy(s, kind, 2, 0, { elite: type === 'eliteSpawn' });
  z.boss = type === 'summon' || type === 'bossSlam';
  if (type === 'spit') P.Enemies.lob(s, z, 0, 0, { r: 1, puddleT: 1, puddleDps: 1 }, 0.5, 1);
  const ev = s.events.find(e => e.type === type) || { type, x: z.x, y: z.y };
  run.sim = s; run.z = z;
  // Let the initial type sighting finish, then reset the bark clock. Action warnings must be
  // tested as actions, not accidentally pre-empted by the higher-priority first-sighting pool.
  P.Barks.onEvent({ type: 'enemyEnter' }, s); advance(run, 7); P.Barks.reset(461);
  run.clock = 0; run.events = []; run.last = null; P.lang = lang;
  run.warning = ev; run.prefix = type === 'eliteSpawn' ? 'BK.elite#' : 'BK.act.' + type + '#';
  return run;
}
function invalidateSource(run, kind) {
  if (kind === 'dead') run.z.dead = true;
  if (kind === 'distance') run.z.x = 20;
  if (kind === 'inactive') run.z.state = 'dormant';
  if (kind === 'removed') run.sim.enemies = [];
  if (kind === 'replaced') run.sim.enemies = [Object.assign({}, run.z, { id: run.z.id + 100 })];
}
for (const lang of ['en', 'tr']) {
  for (const type of warningTypes) {
    const positive = warningRun(type, lang);
    P.Barks.onEvent(positive.warning, positive.sim); advance(positive, 3.2);
    assert.ok(P.Barks.current()?.id.startsWith(positive.prefix), lang + ': visible living source delivers ' + type);
    const moved = warningRun(type, lang); moved.z.x += moved.z.r * 0.5;
    P.Barks.onEvent(moved.warning, moved.sim); advance(moved, 3.2);
    assert.ok(P.Barks.current()?.id.startsWith(moved.prefix), 'Movement within the source body keeps ' + type + ' attributable');
    for (const kind of ['dead', 'distance', 'inactive', 'removed', 'replaced']) {
      const queued = warningRun(type, lang);
      P.Barks.onEvent(queued.warning, queued.sim); invalidateSource(queued, kind); advance(queued, 5);
      assert.ok(!queued.events.some(e => e.id.startsWith(queued.prefix)), lang + ': queued ' + type + ' loses ' + kind + ' source');
      const live = warningRun(type, lang);
      P.Barks.onEvent(live.warning, live.sim); advance(live, 3.2);
      assert.ok(P.Barks.current()?.id.startsWith(live.prefix), 'Reach live ' + type + ' before invalidating');
      invalidateSource(live, kind); step(live);
      assert.ok(!P.Barks.current()?.id.startsWith(live.prefix), lang + ': live ' + type + ' loses ' + kind + ' source');
    }
    for (const kind of ['remoteOrigin', 'remoteSource', 'noOrigin', 'ambiguous', 'wrongType', 'phone', 'farewell']) {
      const run = warningRun(type, lang), ev = Object.assign({}, run.warning);
      if (kind === 'remoteOrigin') ev.x = 30;
      if (kind === 'remoteSource') ev.x = run.z.x = 20;
      if (kind === 'noOrigin') { delete ev.x; delete ev.y; }
      if (kind === 'ambiguous') run.sim.enemies.push(Object.assign({}, run.z, { id: run.z.id + 1 }));
      if (kind === 'wrongType') { run.z.type = 'cayci'; run.z.boss = false; run.z.elite = false; }
      if (kind === 'phone') run.sim.dir.call.sub = { id: 'callA1' };
      if (kind === 'farewell') { run.sim.levelIndex = 25; P.Barks.onEvent({ type: 'bossDie' }, run.sim); }
      P.Barks.onEvent(ev, run.sim);
      if (kind === 'remoteSource') run.z.x = 2; // Coming into view later must not revive an unseen warning.
      advance(run, 5);
      assert.ok(!run.events.some(e => e.id.startsWith(run.prefix)), lang + ': no ' + type + ' from ' + kind);
    }
  }
  const opening = warningRun('bruteRoar', lang); opening.sim.levelIndex = 1;
  P.Barks.onEvent(opening.warning, opening.sim); advance(opening, 3.2);
  const id = P.Barks.current()?.id, parts = id && id.split('#');
  assert.ok(parts && !P.DLG[lang][parts[0]][Number(parts[1])].j, lang + ': opening warning never selects a joke');
}
console.log('PASS: EN/TR elite/action warnings bind to living nearby sources; stale, remote and ambiguous sources stay silent');

// The actual joined-companion departure after Nuri keeps optional celebration quiet, while
// genuine observed enemy actions still warn the player and the next district can speak again.
for (const lang of ['en', 'tr']) {
  const run = setup(91, false); P.lang = lang;
  run.sim.levelIndex = 26; run.sim.loadout = { kaanJoined: true };
  for (let i = 0; i < 50; i++) P.Barks.onEvent({ type: 'kill', enemy: 'walker' }, run.sim);
  P.Barks.onEvent({ type: 'frenzy' }, run.sim);
  advance(run, 80);
  assert.equal(run.events.length, 0, lang + ': no kill quips, frenzy jokes or ambient banter after Nuri');
  const warning = warningRun('bruteRoar', lang);
  warning.sim.levelIndex = 26; warning.sim.loadout = { kaanJoined: true };
  P.Barks.onEvent(warning.warning, warning.sim); advance(warning, 3.2);
  const line = P.Barks.current()?.id?.split('#');
  assert.ok(line && line[0] === 'BK.act.bruteRoar', lang + ': retain true nearby threat warning');
  assert.ok(!P.DLG[lang][line[0]][Number(line[1])].j, lang + ': threat warning stays serious');
  const next = setup(81, false); P.lang = lang;
  next.sim.levelIndex = 27; next.sim.loadout = { kaanJoined: true };
  P.Barks.onEvent({ type: 'rescueDone' }, next.sim); advance(next, 4);
  assert.ok(next.events.some(e => e.id.startsWith('BK.rescue#')), lang + ': ordinary speech resumes outside the departure');
}
console.log('PASS: quiet joined-companion L26 departure retains factual non-joke threat warnings; L27 speech resumes');
