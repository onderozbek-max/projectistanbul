// R1-T3 skyline table: which distant landmarks each hood shows at the edges of its street (docs/hood-visual-briefs.md "Reads as
// Istanbul because" and the district's real skyline). Shapes are in shapes.js. Kapalıçarşı is indoors and has none.
// D-060: 'hood.sN' keys (N = 1-based stage) replace the hood list on that stage (arena-sky.js stageId).
'use strict';
module.exports = {
  istiklal: ['galata', 'minaret'],
  galata: ['galata', 'galata', 'minaret'],
  karakoy: ['galata', 'minaret', 'dome'],
  bridge: ['dome', 'minaret', 'galata'],
  eminonu: ['dome', 'minaret', 'dome'],
  sirkeci: ['clock', 'dome'],
  beyazit: ['firetower', 'dome'],
  kumkapi: ['minaret', 'dome'],
  saray: ['kitchens', 'gate', 'tree', 'kitchens'],
  halic: ['hillschool', 'minaret', 'dome', 'crane', 'hillschool'],
  yenikapi: ['crane', 'dome'],
  samatya: ['minaret', 'wallTower'],
  yedikule: ['wallTower', 'wallTower', 'minaret'],
  kazlicesme: ['minaret', 'chimney'],
  zeytinburnu: ['chimney', 'chimney', 'minaret'],
  'zeytinburnu.s2': ['crane', 'mast', 'crane', 'mast'],   // D-060 Sahil Rıhtımı: sea-side sky, cranes and masts
  bakirkoy: ['block', 'minaret'],
  sahil: ['block', 'tree'],
  marina: ['mast', 'mast', 'block'],
  atakoy: ['block', 'tree', 'block'],
};
