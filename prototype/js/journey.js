// Shared journey data (D-027): Arda walks home from İstiklal (Taksim) to Ataköy, 20 neighbourhoods x 5 levels.
// Pure data, no DOM. Read by sim (level generator), meta map, environment themes and story beats.
// Array order IS the walk order (v0.8, lane L): Zeytinburnu and Kazlıçeşme are swapped (Kazlıçeşme is the eastern stop,
// reached first from Yedikule), and Kumkapı sits off the coast after Beyazıt (docs/journey.md §2). D-060: Topkapı Sarayı
// (saray) and Haliç–Balat (halic) take the L46–55 slots that Laleli and Aksaray held; the hood indices are unchanged.
// enemies: behaviour types the hood introduces/uses. skins: zombie outfit variants (sprites.js).
// theme: visual archetype for render-world/istanbul (F). km: distance walked when the hood is cleared.
// vehicles: what actually moves or waits in the hood (tram = T1 stop or the İstiklal nostalgic tram, ferry = pier, marmaray =
// rail station, dolmus = minibus stop, boat = fishing or yacht boats, taxi, car = parked cars). Objectives and hack kinds read it.
// hack: terminal kinds the hood may use (sim/levels.js intersects the stage list with it; `tram` = the tram control box).
P.Journey = {
  levelsPerHood: 5,
  totalKm: 17,
  hoods: [
    { id: 'istiklal', name: 'İstiklal', district: 'Beyoğlu', km: 1.0, theme: 'istiklal', map: [0.70, 0.18],
      enemies: ['walker', 'runner', 'crawler', 'diner'], skins: ['waiter', 'tourist', 'shopper', 'student'], boss: 'brute',
      kit: ['tables', 'cart', 'bin', 'bench'], layouts: ['street', 'chicane', 'plaza', 'market', 'arena'], centre: 'tram_stop',
      vehicles: ['tram'], hack: ['atm', 'traffic', 'cell', 'shutter', 'tram'] },
    { id: 'galata', name: 'Galata', district: 'Beyoğlu', km: 1.8, theme: 'galata', map: [0.64, 0.24],
      enemies: ['walker', 'runner', 'crawler', 'spitter'], skins: ['tourist', 'musician', 'student', 'shopper'], boss: 'brute',
      kit: ['tables', 'bench', 'planter', 'bollard'], layouts: ['street', 'chicane', 'plaza', 'market', 'arena'], centre: 'tea',
      vehicles: [], hack: ['atm', 'cell'] },
    { id: 'karakoy', name: 'Karaköy', district: 'Beyoğlu', km: 2.6, theme: 'karakoy', map: [0.62, 0.30],
      enemies: ['walker', 'runner', 'spitter', 'bloater'], skins: ['barista', 'fisher', 'worker', 'tourist'], boss: 'brute',
      kit: ['lx_stall', 'bollard', 'tables', 'barrier'], layouts: ['plaza', 'waterfront', 'street', 'market', 'arena'], centre: 'booth',
      vehicles: ['tram', 'ferry'], hack: ['atm', 'traffic', 'tram'] },
    { id: 'bridge', name: 'Galata Köprüsü', district: 'Haliç', km: 3.3, theme: 'bridge', map: [0.56, 0.34],
      enemies: ['walker', 'runner', 'bloater', 'spitter'], skins: ['fisher', 'commuter', 'vendor'], boss: 'bloater',
      kit: ['bollard', 'bin', 'barrier', 'crates'], layouts: ['bridge', 'waterfront', 'chicane', 'street', 'arena'], centre: 'tea:1',
      vehicles: ['ferry', 'boat'], hack: ['atm', 'cell'] },
    { id: 'eminonu', name: 'Eminönü', district: 'Fatih', km: 4.1, theme: 'eminonu', map: [0.52, 0.38],
      enemies: ['walker', 'runner', 'crawler', 'brute', 'spitter'], skins: ['vendor', 'hamal', 'commuter', 'shopper'], boss: 'taksici',
      kit: ['cart', 'crates', 'lx_stall', 'tables'], layouts: ['waterfront', 'market', 'plaza', 'chicane', 'arena'], centre: 'pyramid',
      vehicles: ['tram', 'ferry'], hack: ['atm', 'traffic', 'tram'] },
    { id: 'sirkeci', name: 'Sirkeci', district: 'Fatih', km: 4.8, theme: 'sirkeci', map: [0.55, 0.42],
      enemies: ['walker', 'runner', 'brute', 'bloater'], skins: ['commuter', 'conductor', 'tourist'], boss: 'kasapBoss',
      kit: ['bench', 'bin', 'kiosk', 'planter'], layouts: ['plaza', 'street', 'market', 'chicane', 'arena'], centre: 'booth:1',
      vehicles: ['tram', 'marmaray'], hack: ['atm', 'shutter', 'tram'] },
    { id: 'kapalicarsi', name: 'Kapalıçarşı', district: 'Fatih', km: 5.6, theme: 'bazaar', map: [0.47, 0.42],
      enemies: ['walker', 'runner', 'crawler', 'spitter', 'brute'], skins: ['shopkeeper', 'hamal', 'tourist'], boss: 'taksici',
      kit: ['lx_stall', 'crates', 'cart', 'planter'], layouts: ['plaza', 'market', 'chicane', 'street', 'arena'], centre: 'tea:2',
      vehicles: [], hack: ['atm', 'shutter'] },
    { id: 'beyazit', name: 'Beyazıt', district: 'Fatih', km: 6.3, theme: 'beyazit', map: [0.43, 0.43],
      enemies: ['walker', 'runner', 'spitter', 'bloater'], skins: ['student', 'vendor', 'pigeonman'], boss: 'spitter',
      kit: ['crates', 'bench', 'tree', 'bin'], layouts: ['market', 'plaza', 'street', 'chicane', 'arena'], centre: 'fountain',
      vehicles: ['tram', 'dolmus'], hack: ['atm', 'traffic', 'tram'] },
    { id: 'kumkapi', name: 'Kumkapı', district: 'Fatih', km: 7.0, theme: 'kumkapi', map: [0.40, 0.505],
      enemies: ['walker', 'runner', 'bloater', 'spitter'], skins: ['waiter', 'fisher', 'musician'], boss: 'bloater',
      kit: ['lx_boat', 'crates', 'tables', 'bollard'], layouts: ['chicane', 'waterfront', 'market', 'plaza', 'arena'], centre: 'cart:1',
      vehicles: ['boat'], hack: ['atm', 'cell'] },
    { id: 'saray', name: 'Topkapı Sarayı', district: 'Fatih', km: 7.8, theme: 'saray', map: [0.39, 0.44],
      enemies: ['walker', 'runner', 'brute', 'crawler'], skins: ['conductor', 'tourist', 'vendor', 'student', 'shopper', 'granny'], boss: 'tourGuide',
      kit: ['barrier', 'kiosk', 'cart', 'bench', 'tree', 'lx_stall'], layouts: ['plaza', 'street', 'chicane', 'market', 'arena'], centre: 'gate',
      vehicles: ['tram'], hack: ['atm', 'traffic', 'tram'] },
    { id: 'halic', name: 'Haliç–Balat', district: 'Fatih', km: 8.6, theme: 'halic', map: [0.35, 0.45],
      enemies: ['walker', 'runner', 'brute', 'bloater', 'spitter'], skins: ['halici', 'shopkeeper', 'fisher', 'teyze', 'sahaf', 'barista'], boss: 'antiquarian',
      kit: ['tables', 'planter', 'crates', 'cart', 'antique'], layouts: ['waterfront', 'street', 'market', 'plaza', 'arena'], centre: 'tea',
      vehicles: ['boat'], hack: ['atm', 'cell', 'shutter'] },
    { id: 'yenikapi', name: 'Yenikapı', district: 'Fatih', km: 9.5, theme: 'yenikapi', map: [0.32, 0.53],
      enemies: ['walker', 'runner', 'crawler', 'brute', 'bloater'], skins: ['commuter', 'worker', 'conductor'], boss: 'taksici',
      kit: ['barrier', 'bench', 'bin', 'bollard'], layouts: ['street', 'plaza', 'chicane', 'market', 'arena'], centre: 'gate',
      vehicles: ['marmaray', 'ferry'], hack: ['cell', 'shutter', 'atm'] },
    { id: 'samatya', name: 'Samatya', district: 'Fatih', km: 10.3, theme: 'samatya', map: [0.27, 0.55],
      enemies: ['walker', 'runner', 'spitter', 'crawler'], skins: ['waiter', 'granny', 'fisher'], boss: 'spitter',
      kit: ['tables', 'bench', 'bollard', 'planter'], layouts: ['waterfront', 'plaza', 'market', 'chicane', 'arena'], centre: 'grill',
      vehicles: ['boat', 'dolmus'], hack: ['traffic', 'cell'] },
    { id: 'yedikule', name: 'Yedikule', district: 'Fatih', km: 11.1, theme: 'yedikule', map: [0.22, 0.56],
      enemies: ['walker', 'runner', 'brute', 'crawler', 'spitter'], skins: ['gardener', 'worker', 'granny'], boss: 'brute',
      kit: ['planter', 'cart', 'tree', 'bin'], layouts: ['chicane', 'street', 'plaza', 'market', 'arena'], centre: 'garden',
      vehicles: ['dolmus'], hack: ['atm', 'shutter', 'cell'] },
    { id: 'kazlicesme', name: 'Kazlıçeşme', district: 'Zeytinburnu', km: 12.0, theme: 'kazlicesme', map: [0.18, 0.58],
      enemies: ['walker', 'runner', 'spitter', 'bloater', 'crawler'], skins: ['jogger', 'picnicker', 'fisher'], boss: 'spitter',
      kit: ['bench', 'tree', 'bin', 'bollard'], layouts: ['waterfront', 'plaza', 'street', 'chicane', 'arena'], centre: 'garden:1',
      vehicles: ['marmaray', 'dolmus'], hack: ['cell', 'traffic'] },
    { id: 'zeytinburnu', name: 'Zeytinburnu', district: 'Zeytinburnu', km: 13.0, theme: 'zeytinburnu', map: [0.15, 0.60],
      enemies: ['walker', 'runner', 'bloater', 'brute'], skins: ['worker', 'shopper', 'student'], boss: 'bloater',
      kit: ['crates', 'cart', 'bin', 'lx_truck'], layouts: ['street', 'market', 'chicane', 'plaza', 'arena'], centre: 'drums',
      vehicles: ['tram', 'dolmus'], hack: ['car', 'traffic', 'shutter', 'tram'] },
    { id: 'bakirkoy', name: 'Bakırköy Çarşı', district: 'Bakırköy', km: 14.0, theme: 'bakirkoy', map: [0.11, 0.64],
      enemies: ['walker', 'runner', 'brute', 'spitter', 'bloater'], skins: ['shopper', 'student', 'shopkeeper'], boss: 'taksici',
      kit: ['kiosk', 'bench', 'planter', 'bin'], layouts: ['chicane', 'market', 'plaza', 'street', 'arena'], centre: 'booth:2',
      vehicles: ['marmaray', 'dolmus'], hack: ['atm', 'car', 'shutter', 'traffic'] },
    { id: 'bakirkoysahil', name: 'Bakırköy Sahil', district: 'Bakırköy', km: 15.0, theme: 'sahil', map: [0.09, 0.69],
      enemies: ['walker', 'runner', 'crawler', 'bloater', 'spitter'], skins: ['jogger', 'picnicker', 'fisher'], boss: 'bloater',
      kit: ['bench', 'bollard', 'bin', 'tree'], layouts: ['waterfront', 'street', 'plaza', 'chicane', 'arena'], centre: 'cart:2',
      vehicles: ['dolmus'], hack: ['traffic', 'cell'] },
    { id: 'atakoysahil', name: 'Ataköy Marina', district: 'Bakırköy', km: 16.2, theme: 'marina', map: [0.06, 0.73],
      enemies: ['walker', 'runner', 'brute', 'bloater', 'spitter', 'crawler'], skins: ['sailor', 'jogger', 'shopper'], boss: 'kasapBoss',
      kit: ['lx_boat', 'bollard', 'crates', 'tables'], layouts: ['waterfront', 'bridge', 'plaza', 'chicane', 'arena'], centre: 'mooring',
      vehicles: ['boat'], hack: ['cell', 'atm'] },
    { id: 'atakoy', name: 'Ataköy', district: 'Bakırköy', km: 17.0, theme: 'atakoy', map: [0.05, 0.755],
      enemies: ['walker', 'runner', 'brute', 'bloater', 'spitter', 'crawler'], skins: ['neighbor', 'granny', 'jogger', 'student'], boss: 'brute',
      kit: ['planter', 'bin', 'bench', 'car'], layouts: ['street', 'chicane', 'market', 'plaza', 'arena'], centre: 'booth:3',
      vehicles: ['dolmus', 'taxi', 'car'], hack: ['atm', 'car', 'shutter', 'traffic'] },
  ],
};

// Level index 1..100 -> { index, hood, hoodIndex (0..19), stage (1..5), id 'H01-L1', boss (stage 5) }.
P.Journey.level = function (index) {
  var J = P.Journey, hi = Math.floor((index - 1) / J.levelsPerHood), st = index - hi * J.levelsPerHood;
  var h = J.hoods[Math.max(0, Math.min(J.hoods.length - 1, hi))];
  var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
  return { index: index, hood: h, hoodIndex: hi, stage: st, id: 'H' + pad(hi + 1) + '-L' + st, boss: st === J.levelsPerHood };
};
P.Journey.count = function () { return P.Journey.hoods.length * P.Journey.levelsPerHood; };
