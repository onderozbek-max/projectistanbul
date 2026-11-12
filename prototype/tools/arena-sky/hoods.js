// R1-T3 skyline table: which distant landmarks each hood shows at the edges of its street (docs/hood-visual-briefs.md "Reads as
// Istanbul because" and the district's real skyline). Shapes are in shapes.js. Kapalıçarşı is indoors and has none.
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
  laleli: ['minaret', 'dome'],
  aksaray: ['minaret', 'block'],
  yenikapi: ['crane', 'dome'],
  samatya: ['minaret', 'wallTower'],
  yedikule: ['wallTower', 'wallTower', 'minaret'],
  kazlicesme: ['minaret', 'chimney'],
  zeytinburnu: ['chimney', 'chimney', 'minaret'],
  bakirkoy: ['block', 'minaret'],
  sahil: ['block', 'tree'],
  marina: ['mast', 'mast', 'block'],
  atakoy: ['block', 'tree', 'block'],
};
