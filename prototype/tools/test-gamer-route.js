// Regression checks for the audit fixes that cross simulation and presentation.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { loadP, ROOT } = require('./lib-load');
const game = loadP();
for (const moduleName of ['run-guide', 'speech', 'ui-progress']) {
  vm.runInThisContext(fs.readFileSync(ROOT + '/js/view/' + moduleName + '.js', 'utf8'), { filename: moduleName });
}
const first = game.createSim(42, { tramRhythm: true });
game.startPlay(first);
first.props.doorOpen = true;
for (const x of [-9, -3]) {
  first.hero.x = x;
  const dest = game.RunGuide.destination(first);
  assert.equal(dest.x, (game.CFG.level.door.xMin + game.CFG.level.door.xMax) / 2);
  assert.equal(dest.key, 'route.leave');
}
first.hero.y = 220;
first.props.shutterOpen = true;
first.dir.tut.active = { id: 't_hold' };
assert.equal(game.RunGuide.destination(first).key, 'route.sideExit');
assert.equal(game.RunGuide.prompt(first), null);
first.mode = 'won';
first.props.shutterOpen = false;
assert.equal(game.RunGuide.destination(first), null);
assert.equal(game.RunGuide.prompt(first), null);

const opening = game.createSim(42, { tramRhythm: true });
game.startPlay(opening);
const cart = opening.props.carts.find(prop => prop.kind === 'simit');
opening.hero.x = cart.x;
opening.hero.y = cart.y - .6;
game.Combat.damageProp(opening, cart, cart.hp);
const simit = () => opening.drops.filter(drop => drop.kind === 'simit');
game.Combat.updateDrops(opening, .3);
game.Combat.updateDrops(opening, .1);
assert.equal(simit().length, 2, 'Food is available for later while Arda has full health');
opening.hero.hp -= 10;
game.Combat.updateDrops(opening, .1);
assert.equal(opening.hero.hp, opening.hero.maxHp);
assert.equal(simit().length, 1, 'Healing consumes just one simit');

game.IstiklalTrial.startBoss(opening);
const cook = opening.dir.trialBoss;
const cookToss = game.CFG.bosses.cook.throw;
cook.ai.cd = 0;
opening.hero.x = cook.x + 4;
opening.hero.y = cook.y;
game.Bosses.think(opening, cook, 0);
assert.equal(cook.ai.act, 'throw', 'The Cook uses the cleaver toss from outside swing range');
game.Bosses.think(opening, cook, cook.ai.W * (cookToss.releaseAt - .01));
assert.equal(opening.e3?.blades.length || 0, 0, 'The cleaver stays in hand during anticipation');
game.Bosses.think(opening, cook, cook.ai.W * .02);
assert.equal(opening.e3.blades[0].kind, 'cook');
game.Bosses.think(opening, cook, cook.ai.W * .1);
assert.equal(opening.e3.blades.length, 1, 'The throw releases exactly one cleaver');

const street = game.CFG.env.streetWeapon;
function localRun(level) {
  const s = game.createSim(42, { levelIndex: level, tramRhythm: true });
  game.startPlay(s); s.enemies.length = 0;
  return s;
}
for (const level of [7, 27, 29]) {
  for (const slot of [0, 1]) {
    const s = localRun(level), pad = game.LocalChoices.pads(s)[slot];
    assert(pad, 'Both approaches have walkable positions in L' + level);
    Object.assign(s.hero, { x: pad.x, y: pad.y });
    game.LocalChoices.step(s, game.CFG.experience.choiceHold);
    assert.equal(s.localChoice, pad.id);
    assert.equal(game.LocalChoices.record(s), null, 'An attempt before reaching safety is not a remembered success');
    s.milestone.open = true;
    assert.equal(game.LocalChoices.record(s), pad.id);
  }
}
for (const level of [3, 6, 12, 14, 17, 22, 23]) {
  const s = localRun(level), prop = s.env.recs.find(r => r.street);
  assert(prop, 'The authored object is present in L' + level);
  Object.assign(s.hero, { x: prop.x, y: prop.b.rc.yMin - game.CFG.hero.radius, moving: true });
  game.StreetWeapon.step(s, street.hold);
  assert(!s.streetGrab && !s.streetWeapon, 'Walking past an object never lifts it');
  s.hero.moving = false;
  game.StreetWeapon.step(s, street.hold);
  game.StreetWeapon.step(s, street.lift);
  assert(s.streetWeapon && s.streetWeapon.phase === 'carry' && !prop.alive);
  game.StreetWeapon.step(s, .5);
  assert.equal(prop.street.wear, 0, 'A quiet moment does not consume a swing');
  const budget = prop.street.remaining;
  game.StreetWeapon.dashDrop(s, 0, 1);
  assert(!s.streetWeapon && !s.hero.streetHolding && prop.alive);
  assert.equal(prop.street.remaining, budget, 'Escape does not refill wear or time');
  if (!s.streetSite) continue;
  s.t += street.regripT;
  Object.assign(s.hero, { x: prop.x, y: prop.b.rc.yMin - game.CFG.hero.radius });
  game.StreetWeapon.step(s, street.hold); game.StreetWeapon.step(s, street.lift);
  assert(s.streetWeapon);
  const site = s.streetSite;
  Object.assign(s.hero, { x: site.x, y: site.gripY });
  game.StreetWeapon.step(s, street.placementT);
  assert(site.used && prop.alive && !s.hero.streetHolding && game.Env.pathOpen(s), 'Placement must appear and keep an open route in L' + level);
  if ([12, 17, 22].includes(level)) assert.equal(s.localChoice, 'place');
}

game.Meta.reset();
const settlement = { levelIndex: 7, outcome: 'lose', won: false, localChoice: 'direct', mode: 'normal' };
game.Meta.onResults({ ...settlement, runId: 'choice-lose' });
assert.equal(game.Meta.loadout().streetMemories[7], undefined, 'Loss never establishes an escort outcome');
game.Meta.onResults({ ...settlement, runId: 'choice-clear', outcome: 'win', won: true, stars: 2 });
assert.equal(game.Meta.loadout().streetMemories[7], 'direct');
game.Meta.onResults({ ...settlement, runId: 'choice-replay', outcome: 'win', won: true, stars: 3, localChoice: 'shelter' });
assert.equal(game.Meta.loadout().streetMemories[7], 'direct', 'Replay preserves the first-clear fact');
game.Meta.reset();

const clock = game.createSim(42, { levelIndex: 28, tramRhythm: true });
game.startPlay(clock);
const terminal = game.Hack.place(clock, 'atm', 1, clock.hero.y);
clock.dir.tut.active = { id: 't_hack', target: terminal };
assert.equal(game.RunGuide.prompt(clock), null, 'Walking past the terminal must not show a hold instruction');
terminal.state = 'active';
clock.hero.x = terminal.x;
assert.equal(game.RunGuide.prompt(clock).target, terminal);
terminal.state = 'done';
assert.equal(game.RunGuide.prompt(clock), null);

let chosenSlot, other;
game.Speech.provider(() => {
  game.Speech.offer({ id: 'required', kind: 'tutorial', prio: 5, actionable: true, w: 180, h: 40,
    x: 110, y: 360, place: slot => { chosenSlot = slot; } });
  game.Speech.offer({ id: 'optional', kind: 'invitation', prio: 2, actionable: true, w: 100, h: 40,
    x: 195, y: 440, place: slot => { other = slot; } });
});
const r = { W: 390, H: 844, ppm: 40, toScreen: (x, y) => ({ x: 195 + x * 40, y: 390 - y * 40 }) };
game.Speech.resolve(r, { hero: { x: 0, y: 0 }, enemyTele: [{ x: 0, y: 0, r: 2 }] });
assert(chosenSlot && (chosenSlot.y + chosenSlot.h <= 303 || chosenSlot.y >= 477), 'Required text leaves the warning circle clear');
assert.equal(other, null, 'A secondary action does not compete with the required prompt');

for (const level of [1, 3, 4]) {
  for (const weapon of ['knife', 'nailgun', 'canister']) {
    const s = game.createSim(22, { levelIndex: level, tramRhythm: true });
    game.startPlay(s);
    game.Progression.debugGrant(s, { weapons: { [weapon]: 1 } });
    for (let rank = 2; rank <= 7; rank++) {
      const cards = game.Progression.makeOffer(s).cards;
      assert.equal(cards.length, 3);
      assert.equal(new Set(cards.map(c => c.id)).size, 3);
      const pick = rank === 2 ? game.Progression.cardFor(s, 'w:' + weapon) : cards.find(c => c.recipe);
      assert(pick, `Recipe route missing for ${weapon} at pick ${rank}`);
      assert(pick.next <= game.CFG.maxItemLevel);
      s.pendingLevels++;
      game.Progression.choose(s, pick);
    }
    assert.equal(game.Progression.buildState(s).status, 'evolved');
  }
}

const karakoy = game.createSim(3, { levelIndex: 14, tramRhythm: true });
game.startPlay(karakoy);
const bloater = game.Combat.spawnEnemy(karakoy, 'bloater', karakoy.hero.x, karakoy.hero.y, {});
const hp = karakoy.hero.hp;
game.Combat.killEnemy(karakoy, bloater, false, 'knife');
const firstHitHP = karakoy.hero.hp;
assert(karakoy.events.some(e => e.type === 'bloaterPop') && firstHitHP < hp, 'The first in-range blast still hits');
function burstAtHero() {
  const enemy = game.Combat.spawnEnemy(karakoy, 'bloater', karakoy.hero.x, karakoy.hero.y, {});
  game.Combat.killEnemy(karakoy, enemy, false, 'knife');
}
burstAtHero();
assert.equal(karakoy.hero.hp, firstHitHP, 'Overlapping bursts give the player a recovery window');
karakoy.hero.invuln = 0;
karakoy.t += .3;
burstAtHero();
assert.equal(karakoy.hero.hp, firstHitHP, 'Protection lasts beyond ordinary hit invulnerability');
karakoy.t += game.CFG.levels.bloaterPressure.recovery + .01;
burstAtHero();
assert(karakoy.hero.hp < firstHitHP, 'Later bursts still hit');

const market = game.createSim(3, { levelIndex: 23, tramRhythm: true, loadout: { kaanJoined: true } });
game.startPlay(market);
market.milestone.carry = market.milestone.sacks[0];
game.Combat.spawnEnemy(market, 'walker', market.hero.x + 1, market.hero.y, { state: 'active' });
game.KaanSupport.step(market);
assert(market.kaanSupport && !market.kaanSupport.hit);
market.t += game.CFG.bond.kaan.support.windup;
game.Companion.step(market,game.CFG.bond.kaan.support.windup);
game.KaanSupport.step(market);
game.KaanSupport.step(market);
assert.equal(market.events.filter(e => e.type === 'kaanSupport' && e.count === 1).length, 1);
assert.equal(game.Story.beat(25, 'end', market).id, 'captain_end_covered');
assert.equal(game.Story.beat(25, 'end').id, 'captain_end');

for (const attempt of ['cover', 'miss', 'late']) {
  const s = game.createSim(3, { levelIndex: 23, tramRhythm: true, loadout: { kaanJoined: true } });
  game.startPlay(s);
  s.milestone.carry = s.milestone.sacks[0];
  game.Combat.spawnEnemy(s, 'walker', s.hero.x + 1.55, s.hero.y, {});
  game.KaanSupport.step(s);
  const K = game.CFG.bond.kaan.support, a = s.kaanSupport;
  s.t += K.windup;
  game.Companion.step(s,K.windup);
  game.KaanSupport.step(s);
  assert(game.KaanSupport.canRepay(s));
  const step = 1 / game.CFG.sim.hz;
  if (attempt === 'late') s.t = a.repayUntil + step;
  for (let i = 0; i < 30; i++) {
    s.t += step;
    game.Skills.step(s, step, { dash: i === 0, x: attempt === 'miss' ? -1 : 1, y: 0 });
  }
  const beats = s.events.filter(e => e.phase === 'kaan_covered_by_arda');
  assert.equal(beats.length, attempt === 'cover' ? 1 : 0, attempt);
  assert.equal(!!s.kaanRepay, attempt === 'cover', attempt);
  assert.equal(s.kaanSupport.uses, 1, 'Returning cover is separate from Kaan’s later follow-up');
  assert(!s.milestone.open, 'The shared route still depends on delivering the sacks');
}
assert.equal(game.Story.beat(25, 'end', {}).id, 'captain_end');
game.Meta.onResults({ levelIndex: 23, won: false, marketCover: true });
assert.equal(game.Story.beat(25, 'end', {}).id, 'captain_end');
game.Meta.onResults({ levelIndex: 23, won: true, marketCover: true });
assert(game.Meta.Save.read().flags.kaanMarketCover);
assert.equal(game.Story.beat(25, 'end', {}).id, 'captain_end_market');

const station = game.createSim(19, { levelIndex: 30, tramRhythm: true, loadout: { kaanJoined: true } });
game.startPlay(station);
game.Combat.spawnEnemy(station, 'walker', station.hero.x + 1, station.hero.y, { state: 'active' });
station.gen.boss = { phase: 1 };
game.KaanSupport.step(station);
assert(!station.kaanSupport, 'Kaan waits for Ticket Man’s final phase');
station.gen.boss.phase = 2;
game.KaanSupport.step(station);
assert(station.kaanSupport);
assert.notEqual(game.Story.beat(30, 'start').kind, 'call');
assert.deepEqual(game.Story.beat(30, 'end').id, ['l30_call', 'l30_end']);

const ally = game.CFG.bond.kaan.support;
market.t = market.kaanSupport.start + ally.repeatAfter;
assert(game.KaanSupport.canFollow(market), 'The player can see when Dash will call for cover');
game.KaanSupport.step(market);
assert.equal(market.kaanSupport.uses, 1, 'The second intervention requires a new Dash');
market.sk.dash = {};
game.KaanSupport.step(market);
assert.equal(market.kaanSupport.uses, 2);
market.t += ally.windup + .01;
game.Companion.step(market,ally.windup+.01);
game.KaanSupport.step(market);
assert(market.events.some(e => e.type === 'kaanSupport' && e.followDash && e.count > 0));
market.t += ally.repeatAfter;
market.sk.dash = {};
game.KaanSupport.step(market);
assert.equal(market.kaanSupport.uses, 2);

const encounters = [
  [5, 'vatman', 'boss.istiklal', 'L05m', 'H01b', 'l5_end'],
  [10, 'bellkeeper', 'boss.galataKeeper', 'L10m', 'H02b', 'l10_end'],
  [15, 'dockBride', 'boss.karakoy', 'L15m', 'H03b', 'l15_end'],
  [20, 'bigFisher', 'boss.bridge', 'L20m', 'H04b', 'kaan_join'],
  [25, 'quayCaptain', 'boss.eminonu', 'L25m', 'H05b', 'captain_end'],
  [30, 'ticketMan', 'boss.sirkeci', 'H06m5', 'H06b', ['l30_call', 'l30_end']],
];
for (const [levelIndex, preset, title, cue, bark, ending] of encounters) {
  const normal = game.createSim(17, { levelIndex, tramRhythm: true });
  const nightmare = game.createSim(17, { levelIndex, tramRhythm: true, loadout: { mode: 'nightmare' } });
  assert.equal(nightmare.routeTrial, normal.routeTrial);
  assert.equal(nightmare.milestone.kind, normal.milestone.kind);
  const spawn = s => {
    game.startPlay(s);
    s.gen.marks = [{ kind: 'mid', y: s.hero.y }, { kind: 'arena', y: s.hero.y }];
    game.Levels.step(s, 0);
    return s.gen.boss;
  };
  const a = spawn(normal), b = spawn(nightmare);
  assert.equal(a.bossPreset, preset);
  assert.equal(a.nameKey, title);
  const story = normal.events.filter(event => event.type === 'story' && ['mid', 'boss'].includes(event.when))
    .map(event => game.Story.beat(event.id, event.when));
  assert.deepEqual(story.map(beat => beat.line), [cue, bark]);
  assert.deepEqual(game.Story.beat(levelIndex, 'end').id, ending);
  for (const lang of ['tr', 'en']) {
    assert.equal(game.STR[lang][game.Dialogue.beat(bark).spk], game.STR[lang][title]);
    assert(game.DLG[lang][cue][0].t.length > 0);
    assert(game.DLG[lang][bark][0].t.length > 0);
  }
  assert.equal(b.bossPreset, a.bossPreset);
  assert.notEqual(b.ai.seq[0], a.ai.seq[0]);
  assert.deepEqual([...b.ai.seq].sort(), [...a.ai.seq].sort());
}

const combatSources = game.Tally.create();
const fight = { tally: combatSources, t: 0 };
for (const src of ['knife', 'w:cardoor', 'chainsaw', 'grinder', 'minibus', 'streetCart', 'torch', 'nailstorm', 'canister_env', 'tram']) {
  for (let k = 0; k < 100; k++) game.Combat.tallyKill(fight, { type: 'walker' }, src, false);
}
assert.equal(game.Stats.trainingFromTally(combatSources, false).str, 210);
assert.equal(game.Stats.categoryOf('tram'), null);
for (const id of [...game.CFG.arsenal.weapons, ...Object.keys(game.CFG.evolutions)]) {
  assert(['melee', 'ranged', 'gadget'].includes(game.Stats.categoryOf(id)), id + ' needs a training category');
  assert(game.CFG.tagNames.includes(game.CFG.tags[id]), id + ' needs an impact tag');
}
const recap = game.Meta.onResults({ levelIndex: 5, won: false, kills: combatSources.kills, tally: combatSources });
assert.equal(recap.masteryKills.cardoor, 200);
assert.equal(recap.masteryKills.chainsaw, 200);
assert.equal(recap.masteryKills.streetCart, undefined);
assert.equal(recap.statGains.gains.kills, 1000);
const recipe = { weapon: 'knife', passive: 'gloves', evo: 'cleaver' };
for (const lang of ['en', 'tr']) {
  game.lang = lang;
  const advice = (rank, paired, status) => game.UIProgress.recipeAdvice({ ...recipe, rank, paired, status });
  assert(advice(0, false, 'rank_low').includes(game.t('item.knife')));
  assert(!advice(4, true, 'rank_low').includes(game.t('item.gloves')));
  assert(advice(5, false, 'passive_missing').includes(game.t('item.gloves')));
  assert(advice(5, true, 'ready').includes(game.t('item.knife')));
  assert.equal(advice(5, true, 'evolved'), '');
}
for (const levelIndex of [19, 29]) {
  const normal = game.createSim(42, { levelIndex, tramRhythm: true });
  const nightmare = game.createSim(42, { levelIndex, tramRhythm: true, loadout: { mode: 'nightmare' } });
  const first = s => levelIndex === 19 ? s.milestone.braces[0] : s.milestone.lights.steps[0];
  assert.equal(first(nightmare).y, first(normal).y);
  assert.equal(first(nightmare).x, -first(normal).x);
  assert.equal(game.createSim(42, { levelIndex, tramRhythm: true, loadout: { mode: 'nightshift' } }).routeTrial, undefined);
}

for (const kind of ['bin', 'crate']) {
  const s = game.createSim(42, { levelIndex: 19, tramRhythm: true });
  const enemy = game.Combat.spawnEnemy(s, 'copci', 0, s.hero.y + 4, { state: 'active' });
  enemy.ai.cd = 0;
  enemy.ai.pushes = kind === 'crate' ? game.CFG.enemies4.crate.every - 1 : 0;
  game.Enemies3.think(s, enemy, 0);
  const warning = s.enemyTele.find(t => t.owner === enemy.id);
  const body = kind === 'bin' ? game.CFG.enemies3.copci : game.CFG.enemies4.crate;
  assert.equal(warning.kind, 'lane');
  assert.equal(warning.w, body.binR * 2);
  game.Enemies3.think(s, enemy, warning.T + .01);
  const rolled = s.e3.bins[0];
  assert.equal(rolled.kind, kind);
  assert.equal(warning.x, rolled.x);
  assert.equal(warning.y, rolled.y);
}

for (const weapon of ['knife', 'nailgun', 'canister']) {
  const s = game.createSim(11, { levelIndex: 15, tramRhythm: true });
  s.recipeFocus = weapon;
  s.cardPicks = 2;
  s.hero.weapons[weapon] = 4;
  const normal = game.Progression.makeOffer(s).cards;
  assert.equal(normal.length, 3);
  assert.deepEqual(normal.filter(c => c.recipe).map(c => c.item), [game.Progression.buildState(s).passive], 'One ordinary slot offers the missing partner at rank 4');
  const partner = game.Progression.buildState(s).passive;
  assert(!game.Progression.makeOffer(s).cards.some(c => c.recipe && c.item === partner),
    'A declined partner is not promoted on every future draw');
  const focus = game.Progression.rerollFocus(s);
  assert.equal(focus, weapon);
  s.rerolls--;
  const cards = game.Progression.makeOffer(s, focus).cards;
  assert.equal(cards.length, 3);
  assert.equal(cards.filter(c => c.recipe).length, 1);
  assert.equal(cards.find(c => c.recipe).item, game.Progression.buildState(s).passive);
  assert.equal(game.Progression.rerollFocus(s), null);
  s.hero.passives[game.Progression.buildState(s).passive] = 1;
  const supported = game.Progression.makeOffer(s).cards.find(c => c.recipe);
  assert(supported && supported.item === weapon && supported.next === 5);
  const other = weapon === 'knife' ? 'nailgun' : 'knife';
  s.hero.weapons[other] = 1;
  game.Progression.choose(s, game.Progression.cardFor(s, 'w:' + other));
  assert.equal(s.recipeFocus, weapon, 'A lower rank side weapon cannot steal the focused build');
}

const chestBuild = game.createSim(16, { levelIndex: 18, tramRhythm: true });
chestBuild.pendingLevels = 1;
game.Progression.choose(chestBuild, game.Progression.cardFor(chestBuild, 'w:speargun'));
chestBuild.pendingChests = 1;
game.Progression.openChest(chestBuild, game.Progression.cardFor(chestBuild, 'w:knife'));
assert.equal(game.Progression.buildState(chestBuild).weapon, 'speargun', 'An automatic chest upgrade cannot override the player’s first choice');

const aimRun = localRun(15);
aimRun.geo.blocks = [];
const aimHero = aimRun.hero;
const openBoss = { x: aimHero.x, y: aimHero.y + 2.5, r: .9, state: 'active', exposed: true };
const add = { x: aimHero.x + .8, y: aimHero.y + 1.37, r: .25, state: 'active' };
aimRun.gen.boss = openBoss;
aimRun.enemies = [openBoss, add];
const aim = reach => game.Weapons.nearestEnemy(aimRun, aimHero.x, aimHero.y, reach);
assert.equal(aim(3), openBoss, 'A similarly close and exposed boss gets the opening');
assert.equal(aim(1.5), add, 'An exposed boss must be inside the attack’s range');
aimRun.geo.blocks.push({ rc: { xMin: aimHero.x - .3, xMax: aimHero.x + .3, yMin: aimHero.y + .9, yMax: aimHero.y + 1.3 } });
assert.equal(aim(3), add, 'A solid prop blocks opening preference');
aimRun.geo.blocks = [];
add.y = aimHero.y + .15;
assert.equal(aim(3), add, 'A close threat still takes priority');

const later = game.createSim(11, { levelIndex: 31, tramRhythm: true });
assert.equal(later.routeTrial, undefined, 'The legacy preview has no authored encounter yet');
later.recipeFocus = 'knife'; later.hero.weapons.knife = 4; later.cardPicks = 2;
assert(game.Progression.makeOffer(later).cards.some(c => c.recipe), 'Recipe guidance crosses L30 independently of authored encounters');

const down = game.createSim(42, { levelIndex: 3, tramRhythm: true });
game.startPlay(down);
const attacker = game.Combat.spawnEnemy(down, 'runner', 0, 3, { state: 'active' });
down.hero.invuln = 0;
game.Combat.damageHero(down, down.hero.maxHp * 2, 'runner', attacker);
assert.equal(down.deathActor.id, attacker.id);
assert.equal(down.deathActor.type, 'runner');
assert.notEqual(down.deathActor, attacker, 'The recap snapshots the actor rather than retaining the moving enemy');

const use = game.createSim(42, { levelIndex: 7, tramRhythm: true });
game.startPlay(use);
use.runT = 14;
game.Progression.evolve(use, { evo: 'knife', item: 'cleaver' });
const foe = game.Combat.spawnEnemy(use, 'walker', 0, 3, { state: 'active' });
use.runT = 20;
game.Combat.damageEnemy(use, foe, 1, 0, 1, 0, false, 'cleaver');
use.runT = 24;
game.Combat.damageEnemy(use, foe, 1, 0, 1, 0, false, 'knife');
assert.deepEqual(use.evolutionUse.cleaver, { acquired_s: 14, first_hit_s: 20, last_hit_s: 20, hits: 1, first_effect_s: 20, last_effect_s: 20,
  acquired_phase: 'route', first_attack_s: null, damage: 1, control: {}, first_effect: 'damage',
  encounters: { route: 1 }, first_encounter_s: 20, first_encounter: 'route' });
console.log('gamer-route: navigation, build agency, bloater spacing, Kaan cooperation and authored Nightmare remixes');

// A steady approach deliberately uses a prop; moving away or using a terminal cancels it.
const hold = game.CFG.env.propIntent.hold;
const interact = localRun(1);
const food = interact.props.carts.find(p => p.kind === 'simit');
Object.assign(interact.hero, { x: food.x, y: food.y - food.r, moving: false });
game.Combat.propIntent(interact, hold * .5);
assert(food.alive && interact.propIntent.prop === food);
interact.hero.moving = true;
game.Combat.propIntent(interact, hold);
assert(food.alive && !interact.propIntent);
interact.hero.moving = false;
game.Combat.propIntent(interact, hold);
assert(!food.alive && interact.drops.some(d => d.kind === 'simit'));
const gas = interact.props.canisters[0];
Object.assign(interact.hero, { x: gas.x, y: gas.y });
game.Combat.propIntent(interact, hold);
assert(gas.alive && gas.fuseT > 0, 'Deliberate contact on an explosive gives time to escape');
interact.hero.x += 8;
game.Combat.propIntent(interact, gas.fuseMax + .01);
assert(!gas.alive && interact.events.some(ev => ev.type === 'explode'));

const phone = localRun(1);
const booster = game.Hack.place(phone, 'cell', phone.hero.x, phone.hero.y);
const call = phone.dir.call;
call.active = true; call.bars = 3; call.sub = { id: 'callA1', t: 2.2 }; call.queue = ['callA2'];
game.Hack.step(phone, .1);
assert(call.boosting);
const beforeStatic = call.sub.t;
game.Director.step(phone, .25);
assert.equal(call.sub.t, beforeStatic, 'The current panel waits while the connection breaks up');
phone.hero.x += 3 * booster.r;
game.Hack.step(phone, .1);
assert(!call.boosting);
game.Director.step(phone, .25);
assert(call.sub.t < beforeStatic, 'Leaving the ring resumes the panel without finishing the boost');
phone.hero.x = booster.x;
game.Hack.step(phone, 2 * game.CFG.hack.T);
assert.equal(booster.state, 'done');
assert(!call.boosting && call.bars === game.CFG.hack.cell.bars);
assert.equal(call.sub.id, 'callA1');
assert.deepEqual(call.queue, ['callA2']);
game.Director.step(phone, .25);
assert(call.sub.t < beforeStatic);
const skipped = localRun(1);
const silentBooster = game.Hack.place(skipped, 'cell', skipped.hero.x + 8, skipped.hero.y);
game.Hack.step(skipped, .2);
assert(!skipped.dir.call.boosting && silentBooster.prog === 0);
silentBooster.x = skipped.hero.x;
game.Hack.step(skipped, 2 * game.CFG.hack.T);
assert(!skipped.dir.call.active && !skipped.dir.call.queue.length, 'A booster used early does not start an unrequested call');

for (const level of [12, 17, 22]) {
  const s = localRun(level), prop = s.streetSite.prop;
  game.LocalChoices.prop(s, prop, 'offense');
  assert.equal(s.localChoice, undefined);
  game.LocalChoices.prop(s, prop, 'place');
  game.LocalChoices.resolve(s);
  s.milestone.open = true;
  assert.equal(game.LocalChoices.record(s), 'place');
  const committed = localRun(level);
  game.LocalChoices.prop(committed, committed.streetSite.prop, 'offense');
  game.LocalChoices.resolve(committed);
  committed.milestone.open = true;
  assert.equal(game.LocalChoices.record(committed), 'offense');
}

// A shot that was fired before a swap still trains the weapon family but cannot count as an evolved hit.
const delayed = localRun(12);
delayed.hero.weapons = { speargun: 5 };
const baseShot = game.Mods.act(delayed, 'speargun');
game.Progression.evolve(delayed, { evo: 'speargun', item: 'netspear' });
const dummy = game.Combat.spawnEnemy(delayed, 'walker', 0, 10, { state: 'active' });
dummy.maxHp = dummy.hp = 1000;
game.Mods.hit(delayed, dummy, 8, 0, 0, 0, 'speargun', baseShot);
assert.equal(delayed.evolutionUse.netspear.hits, 0);
game.Mods.hit(delayed, dummy, 8, 0, 0, 0, 'speargun', game.Mods.act(delayed, 'speargun'));
assert.equal(delayed.evolutionUse.netspear.hits, 1);
assert.equal(delayed.events.findLast(ev => ev.type === 'hit').weaponVariant, 'netspear');

for (const [item, recipe] of Object.entries(game.CFG.evolutions)) {
  const s = localRun(12), positions = [[1, 0], [.8, .45], [-1, .5], [0, 1.4], [1.6, .5], [0, -1.6], [-1.75, 0], [1.9, -.3], [0, 2.65]];
  s.hero.weapons = { [recipe.from]: 5 };
  s.hero.x = 0; s.hero.y = 10; s.geo.blocks.length = 0;
  game.Progression.evolve(s, { evo: recipe.from, item });
  for (const [x, y] of positions) {
    const target = game.Combat.spawnEnemy(s, 'walker', x, y + 10, { state: 'active' });
    target.hp = target.maxHp = 100000;
  }
  const dt = 1 / 60;
  for (let i = 0; i < 420; i++) {
    s.t += dt; s.runT += dt;
    game.Weapons.step(s, dt);
    game.Combat.updateBurnAndZones(s, dt);
  }
  const used = s.evolutionUse[item];
  assert(used.hits > 0 && used.damage > 0 && used.first_effect_s >= 0, item + ' credits live weapon effects');
}
