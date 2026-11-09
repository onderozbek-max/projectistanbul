// Lane A strings: environment labels (telegraphs, chains) and death causes for environment kills (TR + EN).
// Keys: env.* (world labels drawn by view/env-fx.js), cause.* (death screen, read by screens.js).
Object.assign(P.STR.tr, {
  'env.door': 'KAPI AÇILIYOR', 'env.window': 'PENCERE AÇILIYOR', 'env.manhole': 'KAPAK KALKIYOR',
  'env.leak': 'GAZ KAÇIYOR', 'env.fuse': 'YANIYOR!', 'env.wet': 'ISLAK ZEMİN', 'env.live': 'KABLO CANLI',
  'env.ignite': 'ALEV!', 'env.chain': 'ZİNCİR!', 'env.extinguish': 'SÖNDÜRÜLDÜ', 'env.break': 'KIRILDI',
  'cause.car': 'Yanan araba', 'cause.shock': 'Elektrik çarpması',
});
Object.assign(P.STR.en, {
  'env.door': 'DOOR OPENING', 'env.window': 'WINDOW OPENING', 'env.manhole': 'MANHOLE LIFTING',
  'env.leak': 'GAS LEAK', 'env.fuse': 'BURNING!', 'env.wet': 'WET GROUND', 'env.live': 'LIVE WIRE',
  'env.ignite': 'FIRE!', 'env.chain': 'CHAIN!', 'env.extinguish': 'PUT OUT', 'env.break': 'SMASHED',
  'cause.car': 'Burning car', 'cause.shock': 'Electrocuted',
});
