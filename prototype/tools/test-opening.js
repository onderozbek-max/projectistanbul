// Frozen cutscene residents remain visible; ordinary enemy entrances retain their spawn animation.
'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
const { loadP, ROOT } = require('./lib-load'), game = loadP();
const load = (name, globals = {}) => vm.runInNewContext(
  fs.readFileSync(ROOT + '/js/view/' + name + '.js', 'utf8'), { P: game, ...globals });
function node() {
  return { style: {}, dataset: {}, firstElementChild: { style: {} },
    classList: { add() {}, remove() {}, contains() { return false; } },
    appendChild() {}, querySelectorAll() { return []; } };
}
const nodes = {}, document = { getElementById(id) { return nodes[id] || (nodes[id] = node()); }, createElement: node };
game.Settings = { subs: false, reduceMotion: false };
game.Sfx = { play() {} }; game.Fx = { punch() {}, addTrauma() {}, onEvent() {} };
load('coldopen', { document });
game.StreetArt={current(){return true;}};load('restaurant-art');
const run = game.createSim(42), resident = run.enemies.find(e => e.dinerIndex === 0);
let completed = 0; game.ColdOpen.start(run, () => completed++);
game.ColdOpen.update(14);
const approach = game.ColdOpen.dinerPoint(resident);
assert.equal(approach.state, 'active'); assert(approach.y < resident.y);
assert.equal(resident.state, 'turning', 'Projected zombie state does not advance the frozen simulation');
for(let i=0;i<26;i++){
  const p=game.ColdOpen.dinerPoint(resident);
  assert(game.RestaurantArt.LAYOUT.tables.every(t=>Math.hypot(p.x-t.x,p.y-t.y)>.8),'The approaching customer must take the aisle, not pass through a dining table');
  game.ColdOpen.update(.1);
}
assert.equal(game.ColdOpen.dinerPoint(resident).state, 'active', 'The zombie cannot turn back into a human at the end of its approach');
game.ColdOpen.update(7.9);
assert.equal(game.ColdOpen.dinerPoint(resident).state, 'active', 'The knife strike retains the visible zombie');
assert.equal(run.t, 0); assert.equal(run.runT, 0); assert.equal(resident.age, 0);
game.ColdOpen.update(0.1); game.ColdOpen.update(0.1);
assert.equal(game.ColdOpen.dinerPoint(resident).flash, 0, 'Frozen sim time cannot hold the strike flash over the zombie for the whole outro');
game.ColdOpen.update(3.3);
assert.equal(completed, 1); assert(!game.ColdOpen.active());

let emitted = 0, observed;
game.ArtRig = { TAU: Math.PI * 2 }; game.ArtChars = {};
game.ArtEnemies = { DEFS: { kasap: {} }, def() { return { scale: 1 }; } };
game.Feel = { stopped() { return true; }, emit() { emitted++; } };
game.Sprites = { enemy(view) { observed = { alpha: view.ctx.globalAlpha, scale: view.ctx.sx }; } };
const ctx = { globalAlpha: 1, sx: 1, stack: [],
  save() { this.stack.push([this.globalAlpha, this.sx]); },
  restore() { [this.globalAlpha, this.sx] = this.stack.pop(); },
  translate() {}, rotate() {}, scale(x) { this.sx *= x; } };
const view = { ctx, ppm: 40, X(x) { return x; }, Y(y) { return -y; } };
load('art-enemies4');
for (const state of ['dormant', 'turning', 'active']) {
  // The real cutscene passes a fresh view projection of the same frozen actor each frame.
  for (let frame = 0; frame < 8; frame++) {
    const actor = Object.assign(Object.create(resident), { state });
    game.Sprites.enemy(view, actor, run.hero);
    assert.equal(observed.scale, 1, 'A seated resident never repeatedly scales in at frozen age zero');
    assert.equal(observed.alpha, 1, 'A seated resident remains opaque through conversion');
  }
}
assert.equal(emitted, 0, 'View projections cannot regenerate spawn dust over the opening actor');
const spawned = { type: 'walker', id: 7, x: 0, y: 1, r: .35, age: 0, state: 'active' };
game.Sprites.enemy(view, spawned, run.hero);
assert.equal(observed.scale, .5); assert.equal(observed.alpha, .5);
assert(emitted > 0, 'Actual new enemies retain their existing entrance effect');
console.log('PASS: opening conversion/strike, frozen clocks, resident opacity/scale/dust, ordinary spawn entrance.');
