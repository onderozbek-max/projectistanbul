// Device-capture fixtures use the live simulation. The telemetry lifecycle uses a controlled frame clock.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadP, ROOT } = require('./lib-load');
const game = loadP();
const read = (name) => fs.readFileSync(path.join(ROOT, 'js/view', name + '.js'), 'utf8');
vm.runInThisContext(read('benchmark-scenes'), { filename: 'benchmark-scenes.js' });
const scenes = game.BenchScenes;
const duration = scenes.config.durationMs + scenes.config.warmupMs;
assert.equal(scenes.config.durationMs, 60000);

function simulate(scene) {
  const sim = game.createSim(scenes.config.seed, { levelIndex: scene.level });
  scenes.setup(sim, scene);
  game.startPlay(sim);
  const dt = 1 / game.CFG.sim.hz;
  for (let tick = 0; tick < Math.ceil(duration / 1000 / dt); tick++) {
    scenes.step(sim, dt, scene);
    game.drainEvents(sim);
    if (scene.id === 'crowd') assert.equal(sim.enemies.length, 200);
  }
  assert.equal(sim.mode, 'play', scene.id);
  assert.ok(sim.runT >= duration / 1000 - dt, scene.id);
  if (scene.id === 'opening') assert.ok(sim.hero.y > 55 && sim.kills > 0);
  if (scene.id === 'boss') assert.ok(sim.gen.bossSpawned && !sim.gen.boss.dead);
  return sim;
}

function createPage(raster, store) {
  const nodes = new Map(), listeners = {};
  let exportBlob;
  function element() {
    return { classList: { add() {}, remove() {}, toggle() {} }, focus() {}, addEventListener(type, fn) { this[type] = fn; } };
  }
  const document = {
    body: { appendChild() {} }, addEventListener() {},
    getElementById(id) { if (!nodes.has(id)) nodes.set(id, element()); return nodes.get(id); },
    createElement() { return { click() {}, remove() {} }; },
  };
  const context = vm.createContext({
    document, Blob, navigator: { userAgent: 'test' }, location: { search: '?bench=1' },
    URL: { createObjectURL(blob) { exportBlob = blob; return 'blob:test'; } },
    window: { addEventListener(type, fn) { listeners[type] = fn; } },
    localStorage: { getItem: (k) => store.get(k), setItem: (k, v) => store.set(k, v) },
    performance: {}, setTimeout: () => 1, clearTimeout() {},
    P: {
      BenchScenes: scenes, t: game.t, Settings: {}, Quality: { tier: 0 },
      ArtRaster: { enabled: () => raster, status: () => ({ enabled: raster }), estimatedBytes: () => raster ? 1000 : 0 },
      ArtRig: { cacheBytes: () => 10000 },
      Render: { canvas: { width: 780, height: 1688 } }, Music: { current: () => 'run_calm', playing: () => true, audibleTracks: () => ['run_calm'] },
      Sfx: { audioStatus: () => 'running/playback' },
    },
  });
  ['telemetry', 'benchmark'].forEach((name) => vm.runInContext(read(name), context, { filename: name + '.js' }));
  const { Bench, Tel } = context.P, visited = [];
  Bench.mount(Bench.start, (scene) => visited.push(scene.id), () => visited.push('stop'));
  return { Bench, Tel, visited, flush: () => listeners.pagehide({ persisted: false }),
    start: () => document.getElementById('bench-start').click(),
    result: () => { document.getElementById('bench-export').click(); return exportBlob.text(); } };
}

async function main() {
  const sims = scenes.config.scenes.map(simulate), store = new Map();
  const current = createPage(false, store);
  current.start();
  current.Bench.interrupt('hidden');
  current.start();
  [current, null].forEach((existing) => {
    const page = existing || createPage(true, store);
    page.start();
    page.Tel.log('level_start', {});
    sims.forEach((s, i) => {
      const start = 100000 * i;
      for (let ms = 0; ms <= duration; ms += 20) page.Bench.observe(start + ms, 20, 7, s, s.enemies.length);
    });
    assert.deepEqual(page.visited.slice(-4), ['opening', 'boss', 'crowd', 'stop']);
    page.flush();
  });
  const exported = (await createPage(true, store).result()).trim().split('\n').map(JSON.parse);
  const results = exported.filter((e) => e.event === 'bench_result');
  assert.equal(results.length, 6);
  assert.equal(exported.filter((e) => e.event === 'bench_interrupted').length, 1);
  assert.ok(results.every((e) => e.elapsed_ms === 60000 && e.frame_ms.count === 3000 && e.frame_ms.p95 === 20 && e.work_ms.p50 === 7));
  assert.ok(results.every((e) => e.memory.page_bytes === null && e.memory.js_heap_peak_bytes === null && e.audio[0].playing && e.audio[0].audible.join() === 'run_calm'));
  assert.equal(results[3].memory.estimated_graphics_peak_bytes - results[0].memory.estimated_graphics_peak_bytes, 1000);
  assert.ok(results.filter((e) => e.scene === 'crowd').every((e) => e.peak_enemies === 200 && e.cap_frame_ms.count === 3000));
  assert.deepEqual([...new Set(results.map((e) => e.art))], ['current', 'raster']);
  assert.ok(exported.every((e) => e.event.startsWith('bench_')));
  console.log('benchmark: all three scenes, interruption, frame samples and combined export passed');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
