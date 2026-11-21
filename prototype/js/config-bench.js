// Scripted device capture only. The live game does not use these fixtures.
P.CFG.bench = {
  seed: 20261114,
  warmupMs: 3000,
  durationMs: 60000,
  scenes: [
    { id: 'opening', level: 1, endY: 170 },
    { id: 'boss', level: 5 },
    { id: 'crowd', level: 6, startY: 30, types: ['walker', 'runner', 'crawler', 'screamer', 'hardhat'] }
  ]
};

P.CFG.weaponLab = {
  level: 3, seed: 20261115, crowd: 96, columns: 24, startY: 24,
  lane: 3.8, rowGap: 2.8, spacing: 0.39, walkHalf: 6,
  refillCount: 8, refillDelay: 0.24,
  types: ['walker', 'runner', 'walker', 'crawler', 'hardhat', 'walker', 'runner', 'spitter'],
};
