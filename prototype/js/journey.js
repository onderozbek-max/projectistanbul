// Shared journey data (D-027): Arda walks home from İstiklal (Taksim) to Ataköy, 20 neighbourhoods x 5 levels.
// Pure data, no DOM. Read by sim (level generator), meta map, environment themes and story beats.
// enemies: behaviour types the hood introduces/uses. skins: zombie outfit variants (sprites.js).
// theme: visual archetype for render-world/istanbul (F). km: distance walked when the hood is cleared.
P.Journey = {
  levelsPerHood: 5,
  totalKm: 17,
  hoods: [
    { id: 'istiklal', name: 'İstiklal', district: 'Beyoğlu', km: 1.0, theme: 'istiklal', map: [0.70, 0.18],
      enemies: ['walker', 'runner', 'crawler', 'diner'], skins: ['waiter', 'tourist', 'shopper', 'student'], boss: 'brute' },
    { id: 'galata', name: 'Galata', district: 'Beyoğlu', km: 1.8, theme: 'galata', map: [0.64, 0.24],
      enemies: ['walker', 'runner', 'crawler', 'spitter'], skins: ['tourist', 'musician', 'student', 'shopper'], boss: 'brute' },
    { id: 'karakoy', name: 'Karaköy', district: 'Beyoğlu', km: 2.6, theme: 'karakoy', map: [0.62, 0.30],
      enemies: ['walker', 'runner', 'spitter', 'bloater'], skins: ['barista', 'fisher', 'worker', 'tourist'], boss: 'brute' },
    { id: 'bridge', name: 'Galata Köprüsü', district: 'Haliç', km: 3.3, theme: 'bridge', map: [0.56, 0.34],
      enemies: ['walker', 'runner', 'bloater', 'spitter'], skins: ['fisher', 'commuter', 'vendor'], boss: 'bloater' },
    { id: 'eminonu', name: 'Eminönü', district: 'Fatih', km: 4.1, theme: 'eminonu', map: [0.52, 0.38],
      enemies: ['walker', 'runner', 'crawler', 'brute', 'spitter'], skins: ['vendor', 'hamal', 'commuter', 'shopper'], boss: 'brute' },
    { id: 'sirkeci', name: 'Sirkeci', district: 'Fatih', km: 4.8, theme: 'sirkeci', map: [0.55, 0.42],
      enemies: ['walker', 'runner', 'brute', 'bloater'], skins: ['commuter', 'conductor', 'tourist'], boss: 'brute' },
    { id: 'kapalicarsi', name: 'Kapalıçarşı', district: 'Fatih', km: 5.6, theme: 'bazaar', map: [0.47, 0.42],
      enemies: ['walker', 'runner', 'crawler', 'spitter', 'brute'], skins: ['shopkeeper', 'hamal', 'tourist'], boss: 'brute' },
    { id: 'beyazit', name: 'Beyazıt', district: 'Fatih', km: 6.3, theme: 'beyazit', map: [0.43, 0.43],
      enemies: ['walker', 'runner', 'spitter', 'bloater'], skins: ['student', 'vendor', 'pigeonman'], boss: 'spitter' },
    { id: 'laleli', name: 'Laleli', district: 'Fatih', km: 7.0, theme: 'laleli', map: [0.39, 0.44],
      enemies: ['walker', 'runner', 'brute', 'crawler'], skins: ['shopper', 'hamal', 'shopkeeper'], boss: 'brute' },
    { id: 'aksaray', name: 'Aksaray', district: 'Fatih', km: 7.8, theme: 'aksaray', map: [0.35, 0.45],
      enemies: ['walker', 'runner', 'brute', 'bloater', 'spitter'], skins: ['commuter', 'driver', 'worker'], boss: 'brute' },
    { id: 'kumkapi', name: 'Kumkapı', district: 'Fatih', km: 8.6, theme: 'kumkapi', map: [0.38, 0.52],
      enemies: ['walker', 'runner', 'bloater', 'spitter'], skins: ['waiter', 'fisher', 'musician'], boss: 'bloater' },
    { id: 'yenikapi', name: 'Yenikapı', district: 'Fatih', km: 9.5, theme: 'yenikapi', map: [0.32, 0.53],
      enemies: ['walker', 'runner', 'crawler', 'brute', 'bloater'], skins: ['commuter', 'worker', 'conductor'], boss: 'brute' },
    { id: 'samatya', name: 'Samatya', district: 'Fatih', km: 10.3, theme: 'samatya', map: [0.27, 0.55],
      enemies: ['walker', 'runner', 'spitter', 'crawler'], skins: ['waiter', 'granny', 'fisher'], boss: 'spitter' },
    { id: 'yedikule', name: 'Yedikule', district: 'Fatih', km: 11.1, theme: 'yedikule', map: [0.22, 0.56],
      enemies: ['walker', 'runner', 'brute', 'crawler', 'spitter'], skins: ['gardener', 'worker', 'granny'], boss: 'brute' },
    { id: 'zeytinburnu', name: 'Zeytinburnu', district: 'Zeytinburnu', km: 12.0, theme: 'zeytinburnu', map: [0.18, 0.58],
      enemies: ['walker', 'runner', 'bloater', 'brute'], skins: ['worker', 'shopper', 'student'], boss: 'bloater' },
    { id: 'kazlicesme', name: 'Kazlıçeşme', district: 'Zeytinburnu', km: 13.0, theme: 'kazlicesme', map: [0.15, 0.62],
      enemies: ['walker', 'runner', 'spitter', 'bloater', 'crawler'], skins: ['jogger', 'picnicker', 'fisher'], boss: 'spitter' },
    { id: 'bakirkoy', name: 'Bakırköy Çarşı', district: 'Bakırköy', km: 14.0, theme: 'bakirkoy', map: [0.11, 0.64],
      enemies: ['walker', 'runner', 'brute', 'spitter', 'bloater'], skins: ['shopper', 'student', 'shopkeeper'], boss: 'brute' },
    { id: 'bakirkoysahil', name: 'Bakırköy Sahil', district: 'Bakırköy', km: 15.0, theme: 'sahil', map: [0.09, 0.69],
      enemies: ['walker', 'runner', 'crawler', 'bloater', 'spitter'], skins: ['jogger', 'picnicker', 'fisher'], boss: 'bloater' },
    { id: 'atakoysahil', name: 'Ataköy Marina', district: 'Bakırköy', km: 16.2, theme: 'marina', map: [0.06, 0.73],
      enemies: ['walker', 'runner', 'brute', 'bloater', 'spitter', 'crawler'], skins: ['sailor', 'jogger', 'shopper'], boss: 'brute' },
    { id: 'atakoy', name: 'Ataköy', district: 'Bakırköy', km: 17.0, theme: 'atakoy', map: [0.04, 0.79],
      enemies: ['walker', 'runner', 'brute', 'bloater', 'spitter', 'crawler'], skins: ['neighbor', 'granny', 'jogger', 'student'], boss: 'brute' },
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
