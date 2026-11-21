// The test driver supplies inputs to the real sim. Fixture changes are scoped to its fresh run.
P.BenchScenes = (function () {
  var C = P.CFG.bench, cap = P.CFG.levels.ceiling.hard;

  function fillCrowd(s, scene) {
    while (s.enemies.length < cap) {
      var cell = (s.nextId - 1) % cap, column = cell % 20, row = Math.floor(cell / 20);
      var type = scene.types[(column + row) % scene.types.length];
      if (!P.Combat.spawnEnemy(s, type, (column - 9.5) * 0.39, scene.startY + (row - 4.5) * 0.8)) break;
    }
  }

  function setup(s, scene) {
    s.hero.invuln = Infinity;
    if (scene.id === 'boss') {
      s.hero.y = s.geo.holdY;
      s.gen.mi = s.gen.marks.findIndex(function (mark) { return mark.kind === 'arena'; });
    }
    if (scene.id === 'crowd') {
      s.hero.y = scene.startY;
      fillCrowd(s, scene);
    }
  }

  function input(s, scene) {
    if (scene.id === 'opening') {
      return { x: 0.22 * Math.sin(s.runT), y: s.hero.y < scene.endY ? 1 : 0 };
    }
    var phase = s.runT * 0.8, cy = scene.id === 'boss' ? s.geo.holdY + 1 : scene.startY;
    return { x: 1.4 * Math.sin(phase) - s.hero.x, y: cy + Math.cos(phase) - s.hero.y };
  }

  function step(s, dt, scene) {
    P.stepSim(s, dt, input(s, scene));
    while (s.pendingLevels > 0) P.Progression.choose(s, P.Progression.makeOffer(s).cards[0]);
    while (s.pendingChests > 0) P.Progression.openChest(s, P.Progression.chestReward(s));
    if (scene.id === 'crowd') fillCrowd(s, scene);
  }

  return { config: C, cap: cap, setup: setup, step: step };
})();
