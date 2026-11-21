// Campaign geometry, consequential cover, contextual instructions, and distinct defeat motions.
'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
const { loadP, ROOT } = require('./lib-load');
const game = loadP();
for (const file of ['street-invitations', 'enemy-death-motion', 'boss-defeat-profiles', 'boss-defeat-fx']) {
  vm.runInThisContext(fs.readFileSync(ROOT + '/js/view/' + file + '.js', 'utf8'), { filename: file });
}
let booths = 0, cars = 0, stations = 0;
let coverage = new Set();
for (let level = 2; level <= 100; level++) {
  for (const seed of [17, 42, 83]) {
    const s = game.createSim(seed, { levelIndex: level, tramRhythm: true });
    const label = 'Bölüm ' + level + ', seed ' + seed;
    assert(game.Env.pathOpen(s), 'Walkable route: ' + label);
    for (const b of s.geo.blocks) {
      const root = b.kind.replace(/\d+$/, '');
      if (root === 'cm_booth') {
        assert(b.rc.xMin > 3 || b.rc.xMax < -3, 'Keep the booth out of the travel lane: ' + label);
        assert.equal(b.rec.explosion, 'booth', label);
        booths++;
      }
      if (game.Env.isCar(b.kind)) {
        assert.equal(b.rec.explosion, 'car', label);
        cars++;
      }
      if (['planter', 'tree', 'cm_garden', 'cm_fountain'].includes(root)) assert(!b.rec, 'Solid landscaping: ' + label);
      if (['cm_tea', 'cm_cart', 'cm_pyramid'].includes(root)) {
        assert(b.rec && !b.rec.bomb, 'Breakable vendor or furniture: ' + label);
        coverage.add(root);
      }
      if (b.station) stations++;
    }
  }
}
assert(booths && cars && stations);
assert.equal(coverage.size, 3);
const s = game.createSim(42, { levelIndex: 96 });
const b = s.geo.blocks.find(b => b.kind === 'cm_booth3');
assert(b, 'Ataköy booth fixture');
s.hero.x = b.x > 0 ? 2 : -2; s.hero.y = b.y; s.hacks = []; s.drops = [];
const R = { W: 390, H: 844, toScreen: (x, y) => ({ x: 195 + 39 * x, y: 422 - 39 * (y - s.hero.y) }) };
assert.equal(game.StreetInvitations.target(R, s).cue[2], 'engage.blast');
game.Env.hitProp(s, b.rec, 100, 'sledge');
assert(b.rec.alive && b.rec.fuseT > 0, 'The booth telegraphs before exploding');
assert.equal(game.StreetInvitations.target(R, s).cue[2], 'engage.fuse');
assert(!s.events.some(e => e.type === 'envBreak' && e.kind === 'cm_booth3'));
game.Env.stepFuses(s, b.rec.fuseT);
assert(!s.geo.blocks.includes(b), 'The blast removes the booth collision');
assert(s.events.some(e => e.type === 'envExplode' && e.src === 'booth'), 'The view receives the correct blast type');
const atm = game.Hack.place(s, 'atm', 0, s.hero.y);
atm.state = 'active'; atm.prog = .6;
assert.equal(game.StreetInvitations.target(R, s).cue[2], 'engage.atm');
assert.equal(game.StreetInvitations.target(R, s).progress, .6);
atm.state = 'done';
assert.notEqual(game.StreetInvitations.target(R, s)?.cue[2], 'engage.atm');
const poses = ['blade', 'electric', 'fire', 'explosion', 'blunt', 'water'];
const frames = poses.map(k => game.EnemyDeathMotion.body(k, .20, 1));
assert.equal(new Set(frames.map(x => JSON.stringify(x))).size, poses.length);
for (const frame of frames) for (const n of Object.values(frame.shape)) assert(Number.isFinite(n));
const hoods = Array.from({length:20}, (_, n) => game.createSim(17, { levelIndex: n * 5 + 5 }).levelInfo.hood.id);
assert.equal(new Set(hoods.map(k => game.BossDefeatProfiles(k)[0])).size, 20);
assert.equal(game.BossDefeatProfiles('istiklal', 'cook')[0], 'split');
assert.equal(game.BossDefeatProfiles('sirkeci', 'ticketMan')[0], 'tickets');
const boss = game.Bosses.spawn(s, 'brute', 0, 90, { hoodIdx: 0, hoodId: 'galata', nameKey: 'boss.galata' });
game.Combat.killEnemy(s, boss, false, 'sledge');
const die = s.events.find(e => e.type === 'bossDie');
assert(game.BossDefeatFx.onEvent(die, s));
assert(game.BossDefeatFx.running(s));
game.BossDefeatFx.step(s, 2);
assert(!game.BossDefeatFx.running(s));
assert(s.drops.some(d => d.boss && d.kind === 'chest'), 'Boss choreography preserves the reward');
console.log('street-readability: 297 layouts, ' + booths + ' booths, ' + cars + ' parked cars, ' + stations + ' stations; six finishing reactions, 20 district finishers');
