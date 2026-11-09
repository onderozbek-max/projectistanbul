// Neighbourhood looks for levels 2..100 (workstream F). 20 themes keyed by P.Journey hood.theme ids.
// Data: ground/walk paving, side kinds (facade|water|grass|garden|walls|tracks|site), facade style and palette,
// sidewalk prop weights (P.Props kinds), overhead rig, exit style, signs (generic Turkish trade words, no brands),
// and 5 sub-locations per hood (stage 1..5) with weather and landmark kinds. Chapter 2 hoods: P.Themes.def(id, o).
// Tiles are drawn in metres with top-left at the tile origin; render-world anchors them with a pattern matrix.
P.Themes = (function () {
  var T = {}, DEF = {}, CACHE = {}, cacheK = 0;
  var GOLD = '#E9A23B', CREAM = '#F4EBDD';
  var BELLE = ['#8E7258', '#80605F', '#64788A', '#6E7F67', '#9C8A6E'], STONE = ['#7E7668', '#6E6A60', '#8A7F6E', '#5C6266'];
  var BRICK = ['#7A4A3A', '#5E4A44', '#8A6A50', '#4B5563'], OTT = ['#8A5A3C', '#6B4A36', '#A07850', '#7A6548'];
  var CONC = ['#A59C8E', '#8F9396', '#B5AA96', '#7F8B93'], STA = ['#6B6F78', '#8A8074', '#5A5E64', '#77736B'];
  var ARC = ['#8B6A4A', '#9A7A58', '#6E5A44', '#A58A62'], APT = ['#D8CBB6', '#C9B9A0', '#B8C4C8', '#E0D4BE'];
  var WALLS = ['#7E7460', '#6E6654', '#8A8068'], MED = ['#8E5A4A', '#7A6248', '#9A7A5A', '#6E5A52'];
  var AW = { mix: ['#C0392B', '#1B4965', '#2E7D4F', GOLD], red: ['#C0392B', CREAM], navy: ['#1B4965', CREAM],
    green: ['#2E7D4F', CREAM], gold: [GOLD, '#3A2A1E'], plum: ['#7A4F8C', GOLD] };
  var PLAQUES = ['Çınar Sk.', 'Lale Sk.', 'Deniz Cd.', 'Güneş Sk.', 'Kule Sk.', 'Bahçe Sk.', 'Çarşı Sk.', 'Liman Cd.'];
  T.plaques = PLAQUES;

  // Weather keys -> screen wash [r,g,b,a] (null = none). Time of day comes from hood position (TINT below).
  var WX = { clear: null, rain: [70, 90, 115, 0.14], fog: [185, 195, 205, 0.16], fire: [255, 120, 50, 0.1],
    dawn: [255, 170, 120, 0.12], dusk: [110, 70, 130, 0.14] };

  // Sub-locations, one row per stage 1..5: "TR|EN|weather|landmark kinds|prop weight overrides".
  // Kinds: tram | arch:(glass|tunnel|metro|stone|classical|street|vault) | facade:(bay|glass|brick|wood|station|block|estate|mural|stone)
  // | tower | steps | stall:(music|lamp|carpet|textile|leather|book|fish|spice|fasil) | park:(plane|palm|bostan|coast|square|grill|sprinkler)
  // | pier:(pier|deck|boat|terminal|promenade|yachts|boardwalk) | board:(kadikoy|uskudar|aksaray|bilet) | crane | dig | overpass | minibus
  // | wall:(curtain|tower) | playground (P.Props fallback). Stage 1 of istiklal is the scripted L1 (segments in landmarks).
  var SUB = {
    istiklal: ['Taksim Girişi|Taksim Entrance|clear|tram,facade:bay', 'Pasaj Sokağı|Passage Street|dusk|arch:glass,facade:glass|cat:3,pigeon:1',
      'Tramvay Hattı|Tram Line|rain|tram,stall:music|pigeon:0', 'Tünel Ağzı|Tünel Mouth|fog|arch:tunnel,facade:bay|lamp:4',
      'Opera Meydanı|Opera Square|dawn|arch:metro,facade:glass'],
    galata: ['Galata Kulesi|Galata Tower|clear|tower,stall:music', 'Yüksek Kaldırım|High Pavement|rain|stall:music,facade:stone|music:5',
      'Kamondo Merdiveni|Kamondo Steps|fog|steps,tower', 'Büyük Hendek|Great Ditch|dusk|facade:stone,stall:music|cat:3',
      'Galata Meydanı|Galata Square|dawn|tower,steps'],
    karakoy: ['Karaköy İskelesi|Karaköy Pier|clear|pier:pier,facade:brick', 'Rıhtım Caddesi|Quay Avenue|rain|facade:brick,facade:mural',
      'Mumhane|Mumhane|fog|facade:brick|gull:3', 'Kemankeş|Kemankeş|clear|facade:mural,pier:pier', 'Kuledibi|Kuledibi|dawn|pier:pier,tower'],
    bridge: ['Köprü Başı|Bridge Head|clear|pier:deck,tower', 'Alt Kat Balıkçılar|Lower Deck Fishers|rain|pier:deck,stall:fish|rods:3',
      'Haliç Suyu|Horn Water|fog|pier:boat,tower', 'Vapur İskelesi|Ferry Pier|dusk|board:kadikoy,pier:deck',
      'Köprü Gece|Night Bridge|fire|pier:deck,board:uskudar'],
    eminonu: ['Eminönü İskelesi|Eminönü Pier|clear|board:kadikoy,pier:boat', 'Balık Ekmek|Fish Sandwich|fire|pier:boat,stall:fish',
      'Mısır Çarşısı|Spice Arcade|clear|stall:spice,board:uskudar', 'Güvercin Meydanı|Pigeon Square|dawn|park:square,board:uskudar|pigeon:6',
      'Simitçi Sokağı|Simit Lane|fog|park:plane,stall:spice|simit:3'],
    sirkeci: ['Sirkeci Garı|Sirkeci Station|clear|facade:station,park:square', 'Peron|Platform|rain|arch:classical,facade:station',
      'Banliyö Hattı|Commuter Line|fog|facade:station,board:bilet', 'Gar Kapısı|Station Gate|dusk|arch:classical,board:bilet',
      'Gar Saati|Station Clock|dawn|facade:station,park:plane'],
    bazaar: ['Kapalıçarşı Kapısı|Bazaar Gate|clear|arch:stone,stall:lamp', 'Kuyumcular|Jewellers|dusk|arch:vault,stall:lamp',
      'Halıcılar|Carpet Row|clear|stall:carpet,arch:vault', 'Sedefçiler|Mother-of-pearl|rain|arch:vault,stall:lamp|lokum:3',
      'Kahveci Kapısı|Coffee Gate|fire|arch:stone,stall:spice'],
    beyazit: ['Üniversite Kapısı|University Gate|clear|arch:classical,park:plane', 'Sahaflar|Booksellers|rain|stall:book,park:plane',
      'Kitap Sokağı|Book Lane|fog|stall:book,arch:classical', 'Çınar Altı|Under the Planes|dusk|park:plane,stall:book',
      'Beyazıt Meydanı|Beyazıt Square|dawn|arch:classical,park:square'],
    laleli: ['Laleli Caddesi|Laleli Avenue|clear|stall:textile,facade:block', 'Toptancılar|Wholesalers|rain|stall:textile,facade:block',
      'Gelinlik Sokağı|Bridal Lane|dusk|stall:textile,arch:street', 'Kumaşçılar|Fabric Row|fog|stall:textile|kumas:4',
      'Otel Sokağı|Hotel Lane|dawn|facade:block,arch:street'],
    aksaray: ['Aksaray Kavşağı|Aksaray Junction|clear|overpass,minibus', 'Dolmuş Durağı|Minibus Stop|rain|minibus,board:aksaray',
      'Üst Geçit|Overpass|fog|overpass,facade:block', 'Trafik Işıkları|Traffic Lights|dusk|minibus,facade:block',
      'Gece Aksaray|Night Aksaray|fire|overpass,board:aksaray'],
    kumkapi: ['Kumkapı Balıkçılar|Kumkapı Fishers|clear|stall:fish,stall:fasil', 'Meyhane Sokağı|Meyhane Lane|fire|stall:fasil,facade:stone',
      'Fasıl Meydanı|Fasıl Square|rain|stall:fasil,stall:fish', 'Balık Tezgahı|Fish Counter|dusk|stall:fish,facade:stone',
      'Deniz Kenarı|Sea Edge|dawn|pier:promenade,stall:fish'],
    yenikapi: ['Yenikapı Terminali|Yenikapı Terminal|clear|pier:terminal,crane', 'Kazı Alanı|Excavation|fog|dig,crane',
      'Ahşap Gemi|Timber Hulls|dusk|dig,pier:terminal', 'Vinç Hattı|Crane Line|rain|crane,dig',
      'Vapur Rıhtımı|Ferry Quay|dawn|pier:terminal,board:kadikoy'],
    samatya: ['Samatya Meydanı|Samatya Square|clear|park:plane,facade:wood', 'Ahşap Evler|Wooden Houses|rain|facade:wood,park:plane',
      'Kedi Sokağı|Cat Lane|dusk|facade:wood|cat:6', 'Kahveler|Cafés|fire|park:square,facade:wood',
      'Sahil Yolu|Shore Road|dawn|facade:wood,park:plane'],
    yedikule: ['Yedikule Surları|Yedikule Walls|clear|wall:curtain,park:bostan', 'Kule Kapısı|Tower Gate|fog|wall:tower',
      'Bostan|Kitchen Garden|rain|park:bostan,wall:curtain', 'Sur Yolu|Wall Road|dusk|wall:tower,park:bostan',
      'Bostancı Sabahı|Gardeners Dawn|dawn|park:bostan,wall:tower'],
    zeytinburnu: ['Deri Atölyesi|Leather Workshop|clear|stall:leather,facade:brick', 'Atölye Sokağı|Workshop Lane|rain|stall:leather,facade:block',
      'Blok Sıra|Block Row|fog|facade:block,stall:leather', 'Kaynakçılar|Welders|fire|facade:brick,stall:leather',
      'Sanayi Sabahı|Industrial Dawn|dawn|facade:brick,facade:block'],
    kazlicesme: ['Kıyı Parkı|Coast Park|clear|park:coast,park:palm', 'Mangal Alanı|Barbecue Area|fire|park:grill,park:coast',
      'Sprinkler Çimleri|Sprinkled Lawns|rain|park:sprinkler,park:coast', 'Piknik Alanı|Picnic Lawn|dusk|park:grill,park:sprinkler',
      'Kıyı Sabahı|Coast Dawn|dawn|park:coast,pier:promenade'],
    bakirkoy: ['Bakırköy Çarşı|Bakırköy Market|clear|arch:street,park:square', 'Yaya Caddesi|Pedestrian Street|rain|arch:street,facade:stone',
      'Eski Meydan|Old Square|dusk|park:square,arch:street', 'Pasaj|Arcade|fog|arch:glass,facade:stone',
      'Çarşı Sabahı|Market Dawn|dawn|arch:street,park:square'],
    sahil: ['Sahil Yolu|Promenade|clear|pier:promenade,park:palm', 'Deniz Duvarı|Sea Wall|rain|pier:promenade',
      'Bisiklet Yolu|Bike Path|dusk|pier:boardwalk,park:palm', 'Plaj Girişi|Beach Gate|fog|park:palm,pier:promenade',
      'Gün Doğumu|Sunrise Promenade|dawn|pier:promenade,park:palm'],
    marina: ['Marina Girişi|Marina Entrance|clear|pier:yachts,pier:boardwalk', 'Yat Limanı|Yacht Harbour|rain|pier:yachts',
      'Tahta Yol|Boardwalk|fog|pier:boardwalk,pier:yachts', 'Tekne Kulübü|Boat Club|dusk|pier:yachts,facade:estate',
      'Mavi Saat|Blue Hour|dawn|pier:yachts,facade:estate'],
    atakoy: ['Ataköy Blokları|Ataköy Blocks|clear|facade:estate,playground', 'Çamaşır Sokağı|Laundry Lane|rain|facade:estate,park:palm',
      'Oyun Parkı|Playground|dusk|playground,facade:estate', 'Otopark|Car Park|fog|facade:estate,playground|dog:3',
      'Arda’nın Binası|Arda’s Building|dawn|facade:estate']
  };
  function parseW(s) {
    if (!s) return null;
    var o = {};
    s.split(',').forEach(function (p) { var q = p.split(':'); o[q[0]] = +q[1]; });
    return o;
  }
  function mkSub(row) {
    var p = row.split('|');
    return { tr: p[0], en: p[1], wx: p[2] || 'clear', lm: (p[3] || '').split(','), pr: parseW(p[4]), _p: null, _t: null };
  }

  // Theme record. Keys not given take the defaults. Chapter 2 hoods add a theme with this same call.
  function def(id, o) {
    var d = { id: id, ground: 'cobble', gc: '#4F5058', gj: '#3B3D46', walk: 'stone', wc: '#5E6068', L: 'facade', R: 'facade',
      fac: 'belle', pal: BELLE, trim: '#E9DCC4', awn: AW.mix, sign: ['LOKANTA', 'BÜFE'], props: { cat: 1, pigeon: 1, bin: 1, lamp: 2 },
      wprops: [], overhead: 'strings', exit: 'arch', shop: 0.4, rail: false, tracks: false, lanes: false, bays: false,
      fog: false, wat: '#2C4658' };
    for (var k in o) d[k] = o[k];
    d.subs = o && o.subs ? o.subs : (SUB[id] || []).map(mkSub);
    DEF[id] = d;
    return d;
  }
  T.def = def;
  def('istiklal', { sign: ['LOKANTA', 'BÜFE', 'KURUYEMİŞ', 'SAHAF', 'PLAK', 'ÇİÇEKÇİ', 'PASTANE', 'ECZANE', 'KUYUMCU', 'BERBER'],
    props: { cafe: 3, simit: 2, misir: 2, kestane: 2, cicek: 2, dondurma: 2, cat: 2, pigeon: 3, bin: 2, bench: 1, lamp: 2, cay: 1, plaque: 1, parkmetre: 1, dish: 1, geranium: 1 },
    tracks: true });
  def('galata', { ground: 'steps', gc: '#45474F', gj: '#2F3138', wc: '#55575E', fac: 'stone', pal: STONE, trim: '#D9CFBC',
    awn: ['#3D6E9E', '#8A3B3B', GOLD], sign: ['MÜZİK', 'GİTAR', 'ENSTRÜMAN', 'PLAK', 'KAHVE', 'DÜKKAN'], overhead: 'laundry',
    props: { music: 3, cat: 2, cay: 2, cicek: 1, pigeon: 2, bin: 1, lamp: 2, dog: 1, geranium: 2, dish: 1 }, shop: 0.3 });
  def('karakoy', { ground: 'asphalt', gc: '#3F4248', gj: '#33363D', wc: '#55575E', L: 'facade', R: 'water', fac: 'brick', pal: BRICK,
    trim: '#CFC5B4', awn: AW.green, sign: ['KAHVE', 'KAVURMA', 'TASARIM', 'BAR', 'GALERİ', 'BUZ', 'ÇAY'], wprops: ['rowboat', 'buoy'],
    props: { cafe: 3, tables: 1, bollard: 2, rods: 1, balikekmek: 1, mural: 1, bags: 1, cat: 1, lamp: 1, gull: 1 }, exit: 'gate', shop: 0.35 });
  def('bridge', { ground: 'deck', gc: '#5A4E44', gj: '#3D342C', walk: 'deck', wc: '#6A5D50', L: 'water', R: 'water', rail: true,
    tracks: true, wprops: ['ferry', 'rowboat', 'buoy'], overhead: 'lamps', sign: ['BALIK', 'EKMEK', 'KAHVE', 'ÇAY'], exit: 'bridge',
    props: { fisher: 4, rods: 2, cat: 1, gull: 2, lamp: 4, bollard: 1, lifering: 1, bags: 1 }, shop: 0 });
  def('eminonu', { ground: 'cobble', gc: '#5D5246', gj: '#48403A', wc: '#6A5E50', R: 'water', fac: 'arcade', pal: ARC, trim: '#E8D6B0',
    awn: ['#B5651D', CREAM], sign: ['BAHARAT', 'KURU MEYVE', 'LOKUM', 'ÇAY', 'KUŞ YEMİ', 'BALIK EKMEK'], wprops: ['rowboat', 'ferry', 'buoy'],
    props: { simit: 2, misir: 2, midye: 2, baharat: 2, pigeon: 4, cat: 1, crates: 1, cart: 1, balikekmek: 2, lokum: 1 }, exit: 'gate', shop: 0.45 });
  def('sirkeci', { ground: 'tile', gc: '#5E6068', gj: '#4A4D55', walk: 'platform', wc: '#6F7178', R: 'tracks', fac: 'station', pal: STA,
    trim: '#C8C2B4', awn: ['#2B4C6F', '#B5651D'], sign: ['GAR', 'BİLET', 'KAHVE', 'KİOSK', 'BAGAJ'], overhead: 'lamps',
    props: { bench: 2, bin: 1, kiosk: 1, cay: 1, pigeon: 3, bags: 2, lamp: 2, planter: 1 }, exit: 'station', shop: 0.3 });
  def('bazaar', { ground: 'bazaar', gc: '#6B5A4A', gj: '#4B3F34', walk: 'bazaar', wc: '#7A6758', fac: 'arcade',
    pal: ['#7A5636', '#8B6A44', '#6A4E3A', '#9A7650'], trim: '#E9C46A', awn: ['#9E2B25', '#1B4965', GOLD],
    sign: ['HALI', 'ÇİNİ', 'KUYUMCU', 'BAHARAT', 'SEDEF', 'KAHVE'], overhead: 'vault',
    props: { hali: 2, cini: 2, baharat: 2, lokum: 2, cay: 2, samovar: 1, cat: 1, crates: 1, bags: 1 }, exit: 'gate', shop: 0.7 });
  def('beyazit', { ground: 'cobble', gc: '#5C5E62', gj: '#4A4C50', wc: '#6A6C70', fac: 'belle', pal: ['#8C8474', '#7D7A70', '#9A9080', '#6E6F72'],
    trim: '#D8CFBD', awn: AW.green, sign: ['KİTAP', 'SAHAF', 'KIRTASİYE', 'FOTOKOPİ', 'KAHVE'],
    props: { books: 4, cay: 1, cinar: 2, bench: 2, bin: 1, pigeon: 2, cat: 1, chairs: 1, tavla: 1 }, exit: 'gate', fog: true });
  def('laleli', { ground: 'asphalt', gc: '#44474E', gj: '#383B42', wc: '#55585F', fac: 'concrete', pal: CONC, trim: '#E8E2D6',
    awn: AW.plum, sign: ['TEKSTİL', 'KUMAŞ', 'TOPTAN', 'PERDE', 'GELİNLİK', 'MODA'], overhead: 'laundry',
    props: { kumas: 3, manken: 2, handtruck: 2, deri: 2, crates: 1, bin: 1, cart: 1, bags: 1, glass: 1 }, shop: 0.35, fog: true });
  def('aksaray', { ground: 'asphalt', gc: '#3A3D44', gj: '#2F3238', wc: '#5A5E66', fac: 'concrete', pal: ['#7D7F84', '#6F7478', '#8E8B84', '#66707A'],
    trim: '#D1D3D6', awn: AW.red, sign: ['MOTOR', 'OTO', 'LASTİK', 'DÖNER', 'KUAFÖR', 'MARKET', 'ECZANE'], overhead: 'lamps', lanes: true,
    props: { durak: 2, parkmetre: 2, bin: 1, shelter: 1, cart: 1, bench: 1, lamp: 3, barrel: 1, glass: 1 }, exit: 'arch', fog: true });
  def('kumkapi', { ground: 'cobble', gc: '#55504A', gj: '#403B36', wc: '#66615A', R: 'water', fac: 'belle', pal: MED, trim: '#E6D2B0',
    awn: ['#8E1F2D', CREAM, GOLD], sign: ['BALIK', 'MEYHANE', 'MEZE', 'LOKANTA', 'KAHVE'], overhead: 'lanterns', wprops: ['rowboat', 'buoy'],
    props: { meyhane: 3, music: 2, midye: 2, balikekmek: 1, lamp: 2, cat: 2, chairs: 1, bags: 1 }, shop: 0.5 });
  def('yenikapi', { ground: 'asphalt', gc: '#4B4D52', gj: '#3D3F44', wc: '#5A5C60', L: 'site', R: 'water', awn: [],
    sign: ['OTOBÜS', 'TERMİNAL', 'KAHVE', 'KİRALIK', 'İNŞAAT'], wprops: ['ferry', 'rowboat', 'buoy'], overhead: 'none', exit: 'station',
    props: { iskele: 2, hazard: 2, crates: 2, cart: 1, bin: 1, shelter: 1, pigeon: 1, cat: 1, glass: 1, barrel: 1 }, shop: 0.2 });
  def('samatya', { ground: 'cobble', gc: '#5B5044', gj: '#463C32', wc: '#6A5E50', fac: 'houses', pal: OTT, trim: '#E8D9BC',
    awn: AW.red, sign: ['FIRIN', 'KAHVE', 'KUAFÖR', 'BAKKAL', 'ÇAY'], overhead: 'laundry',
    props: { cat: 6, catbox: 2, cay: 2, cafe: 2, dog: 2, geranium: 2, bin: 1, chairs: 1, lamp: 1 }, shop: 0.5 });
  def('yedikule', { ground: 'cobble', gc: '#5A5448', gj: '#48433A', walk: 'grass', wc: '#5E6A45', L: 'walls', R: 'garden', pal: WALLS,
    trim: '#B5A98C', awn: [], sign: ['SEBZE', 'MANAV', 'BOSTAN', 'ÇİFTLİK', 'ÇAY', 'TOHUM'], overhead: 'none', fog: true,
    props: { veg: 3, cart: 2, cinar: 1, bin: 1, pigeon: 1, cat: 1, barrel: 1, glass: 1 }, exit: 'wall', shop: 0.2 });
  def('zeytinburnu', { ground: 'asphalt', gc: '#4A4742', gj: '#3D3B37', wc: '#57534D', fac: 'brick', pal: ['#7D7A74', '#6E7378', '#8A8074', '#6B6F6A'],
    trim: '#D0CCC2', awn: [], sign: ['ATÖLYE', 'TAMİR', 'DİKİM', 'OTO', 'KAYNAK', 'MOBİLYA'], overhead: 'none',
    props: { bin: 2, cart: 1, durak: 1, handtruck: 1, barrel: 1, glass: 1, bags: 1, cat: 1 }, exit: 'gate', shop: 0.3 });
  def('kazlicesme', { ground: 'grass', gc: '#58644A', gj: '#4A5640', walk: 'promenade', wc: '#8A8B84', L: 'grass', R: 'water',
    awn: [], sign: ['MANGAL', 'PİKNİK', 'DONDURMA', 'ÇAY', 'KİRALIK BİSİKLET'], wprops: ['rowboat', 'buoy', 'ferry'],
    props: { mangal: 3, cinar: 2, bench: 2, cicek: 1, dondurma: 1, cat: 1, pigeon: 2, dog: 1, palm: 1, bin: 1 }, shop: 0.2 });
  def('bakirkoy', { ground: 'tile', gc: '#6A6B70', gj: '#55565C', walk: 'tile', wc: '#7A7B80', fac: 'belle', pal: ['#8E8478', '#7D857F', '#A08E7A', '#6E7A88'],
    trim: '#EDE7DA', awn: AW.mix, sign: ['AVM', 'GİYİM', 'AYAKKABI', 'PASTANE', 'KUYUMCU', 'OPTİK', 'ECZANE'],
    props: { kiosk: 1, bench: 2, planter: 1, cicek: 2, dondurma: 2, bin: 2, lamp: 2, pigeon: 2, cat: 1, gazete: 1 }, shop: 0.6 });
  def('sahil', { ground: 'jog', gc: '#70736F', gj: '#5C5F5B', walk: 'promenade', wc: '#8A8B84', L: 'grass', R: 'water', awn: [],
    sign: ['DENİZ', 'KAFE', 'DONDURMA', 'PLAJ', 'KİRALIK', 'BİSİKLET'], wprops: ['rowboat', 'ferry', 'buoy'], overhead: 'lamps',
    props: { bench: 3, palm: 2, cinar: 1, lamp: 2, cat: 1, dog: 1, lifering: 1, bin: 1, cicek: 1, bollard: 1, gull: 2 }, exit: 'arch', shop: 0.3 });
  def('marina', { ground: 'deck', gc: '#7A6A58', gj: '#5B4E42', walk: 'deck', wc: '#8C7B66', fac: 'balcony', pal: APT, trim: CREAM,
    awn: AW.navy, sign: ['MARİNA', 'YAT', 'KAFE', 'LOKANTA', 'KİRALIK TEKNE'], R: 'water', wprops: ['yacht', 'yacht', 'rowboat', 'buoy'],
    props: { bollard: 3, lifering: 2, bench: 2, lamp: 2, cat: 1, cinar: 1, dog: 1, crates: 1, geranium: 1, gull: 1 }, exit: 'gate', shop: 0.45 });
  def('atakoy', { ground: 'asphalt', gc: '#4C4E52', gj: '#3F4145', wc: '#5E6064', L: 'facade', R: 'grass', fac: 'balcony', pal: APT,
    trim: CREAM, awn: [], sign: ['ECZANE', 'FIRIN', 'BAKKAL', 'KUAFÖR', 'MARKET', 'KAPICI'], overhead: 'laundry', bays: true,
    props: { dish: 2, geranium: 3, cat: 2, dog: 2, bench: 2, cinar: 1, bin: 2, lamp: 2, pigeon: 2 }, exit: 'home', shop: 0.5 });

  T.ids = Object.keys(DEF);
  T.get = function (id) { return DEF[id] || DEF.istiklal; };

  // ---- sub-locations ----
  function clampI(i, n) { return Math.max(0, Math.min((n || 5) - 1, i | 0)); }
  // Stage index 0..4 for a generated level: s.geo.sub (1-based number, object {index}, or "TR"/"EN" name), else stage - 1.
  T.subIndex = function (s) {
    var g = s.geo || {}, v = g.sub, li = s.levelInfo || {}, th;
    if (v && typeof v === 'object' && typeof v.index === 'number') v = v.index + 1;
    if (typeof v === 'number' && v === v) return clampI(Math.round(v) - 1);
    if (typeof v === 'string') {
      th = T.get((li.hood && li.hood.theme) || 'istiklal');
      for (var i = 0; i < th.subs.length; i++) if (th.subs[i].tr === v || th.subs[i].en === v) return i;
    }
    return clampI((li.stage || 1) - 1);
  };
  T.subOf = function (th, idx) {
    var a = th.subs || [];
    return a[clampI(idx, a.length)] || { tr: th.id, en: th.id, wx: 'clear', lm: [], pr: null };
  };
  // Prop weights for a sub: theme props with the sub's overrides applied (0 removes a kind). Cached per sub.
  T.propsFor = function (th, sub) {
    if (!sub || !sub.pr) return th.props;
    if (sub._t !== th || !sub._p) {
      var o = {}, k;
      for (k in th.props) o[k] = th.props[k];
      for (k in sub.pr) { if (sub.pr[k] > 0) o[k] = sub.pr[k]; else delete o[k]; }
      sub._p = o; sub._t = th;
    }
    return sub._p;
  };
  T.weather = function (wx) { return WX[wx] || null; };

  // ---- pre-rendered tiles ----
  function hsh(n) { var x = Math.sin(n * 91.7 + 13.1) * 43758.5453; return x - Math.floor(x); }
  function sh(hex, a) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, f = a < 0 ? 0 : 255, p = Math.abs(a);
    return 'rgb(' + Math.round(r + (f - r) * p) + ',' + Math.round(g + (f - g) * p) + ',' + Math.round(b + (f - b) * p) + ')';
  }
  function bake(w, h, k, fn) {
    var cv = document.createElement('canvas'); cv.width = Math.ceil(w * k); cv.height = Math.ceil(h * k);
    var c = cv.getContext('2d'); c.setTransform(k, 0, 0, k, 0, 0); fn(c); return cv;
  }
  // Paving grids: [cell w, cell h, row offset share, jitter]; cell sizes are snapped so tiles repeat seamlessly.
  var GRID = { cobble: [0.42, 0.28, 0.5, 0.2], stone: [0.6, 0.6, 0, 0.12], slab: [0.6, 0.6, 0.5, 0.1], tile: [0.5, 0.5, 0, 0.08],
    deck: [0.24, 2, 0, 0.14], steps: [2, 0.3, 0, 0.1], promenade: [0.6, 0.6, 0, 0.05], platform: [0.5, 0.5, 0, 0.06], bazaar: [0.6, 0.6, 0.5, 0.1] };
  function grid(c, g, base, joint, w, h) {
    var cw = w / Math.max(1, Math.round(w / g[0])), ch = h / Math.max(1, Math.round(h / g[1])), r = 0;
    c.fillStyle = base; c.fillRect(0, 0, w, h); c.strokeStyle = joint; c.lineWidth = 0.025;
    for (var y = 0; y < h - 1e-6; y += ch, r++) for (var x = -cw * g[2] * (r % 2); x < w; x += cw) {
      c.fillStyle = sh(base, (hsh(r * 13 + x * 7.3) - 0.5) * g[3] * 2);
      c.fillRect(x, y, cw, ch); c.strokeRect(x, y, cw, ch);
    }
  }
  function asphalt(c, kind, base, w, h) {
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    for (var i = 0; i < 140; i++) { c.fillStyle = sh(base, i % 3 ? -0.14 : 0.14); c.fillRect(hsh(i) * w, hsh(i + 50) * h, 0.03 + hsh(i + 9) * 0.04, 0.03); }
    c.strokeStyle = 'rgba(230,226,210,0.5)'; c.lineWidth = 0.06;
    if (kind === 'lanes') for (var y = 0; y < h; y += 1.6) { c.beginPath(); c.moveTo(w / 2, y); c.lineTo(w / 2, y + 0.9); c.stroke(); }
    if (kind === 'bays') { c.beginPath(); c.moveTo(0.15, 0); c.lineTo(0.15, h); c.moveTo(w - 0.15, 0); c.lineTo(w - 0.15, h); c.stroke(); }
    if (kind === 'jog') { c.fillStyle = '#4E7A5A'; c.fillRect(0.9, 0, 0.9, h); c.fillStyle = 'rgba(230,226,210,0.6)'; c.fillRect(0.88, 0, 0.03, h); }
  }
  function grass(c, base, w, h) {
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    for (var i = 0; i < 70; i++) { c.fillStyle = sh(base, i % 2 ? 0.12 : -0.16); c.beginPath(); c.ellipse(hsh(i) * w, hsh(i + 3) * h, 0.25 + hsh(i + 5) * 0.4, 0.2 + hsh(i + 7) * 0.3, 0, 0, Math.PI * 2); c.fill(); }
  }
  function groundTile(c, kind, base, joint, w, h) {
    if (kind === 'grass') grass(c, base, w, h);
    else if (kind === 'asphalt' || kind === 'jog' || kind === 'lanes' || kind === 'bays') asphalt(c, kind, base, w, h);
    else grid(c, GRID[kind] || GRID.stone, base, joint, w, h);
  }
  function win(c, x, y, w, h, lit, arch) {
    c.fillStyle = lit ? 'rgba(255,210,122,0.85)' : '#2A3445'; c.beginPath();
    if (arch) { c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath(); } else c.rect(x, y, w, h);
    c.fill(); c.strokeStyle = '#14151F'; c.lineWidth = 0.05; c.stroke();
  }
  function shopRow(c, th, awn) {
    var lit = function (i) { return hsh(i * 3.7 + th.id.length) < th.shop; };
    for (var i = 0; i < 2; i++) {
      var x = 1.0 + i * 1.0;
      c.fillStyle = lit(i + 2) ? 'rgba(255,200,120,0.75)' : 'rgba(40,46,60,0.92)'; c.fillRect(x, 3.1, 0.9, 2.5);
      c.strokeStyle = '#14151F'; c.lineWidth = 0.06; c.strokeRect(x, 3.1, 0.9, 2.5);
    }
    c.fillStyle = sh(th.pal[1], -0.35); c.fillRect(1.0, 2.6, 1.9, 0.4);
    if (awn) for (var k = 0; k < 6; k++) { c.fillStyle = th.awn[k % th.awn.length]; c.fillRect(0.1, 2.9 + k * 0.5, 0.75, 0.5); }
    c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 0.05; for (var q = 0; q < 6; q++) { c.beginPath(); c.moveTo(0.1, 2.9 + q * 0.5); c.lineTo(0.85, 2.9 + q * 0.5); c.stroke(); }
  }
  function facadeTile(c, th) {
    var f = th.fac, P5 = th.pal;
    c.fillStyle = P5[0]; c.fillRect(0, 0, 3.4, 6);
    if (f === 'brick' || f === 'stone') for (var y = 0; y < 6; y += 0.22) for (var x = (Math.floor(y / 0.22) % 2) * 0.3; x < 3.4; x += 0.6) {
      c.fillStyle = sh(P5[0], (hsh(x * 5 + y * 9) - 0.5) * 0.2); c.fillRect(x + 0.02, y + 0.02, 0.56, 0.18);
    }
    if (f === 'houses' || f === 'wood') for (var yy = 0; yy < 6; yy += 0.25) { c.fillStyle = sh(P5[0], (hsh(yy * 9) - 0.5) * 0.14); c.fillRect(0, yy, 3.4, 0.25); }
    var upperArch = f === 'station' || f === 'arcade';
    [1.0, 2.0].forEach(function (x, i) { win(c, x, 0.5, 0.7, 1.4, hsh(i * 9 + 1) < th.shop, upperArch); });
    if (f === 'balcony') for (var b = 0; b < 2; b++) {
      c.fillStyle = '#7A6A58'; c.fillRect(0.8, 1.9 + b * 2.1, 2.4, 0.18); c.strokeStyle = '#14151F'; c.lineWidth = 0.04;
      for (var r = 0; r < 6; r++) { c.beginPath(); c.moveTo(0.8 + r * 0.4, 1.9 + b * 2.1); c.lineTo(0.8 + r * 0.4, 1.5 + b * 2.1); c.stroke(); }
      c.fillStyle = '#4E7A4A'; c.beginPath(); c.arc(0.95 + b, 1.85 + b * 2.1, 0.12, 0, 6.3); c.fill();
    }
    c.fillStyle = th.trim; c.fillRect(0.8, 2.35, 2.6, 0.15);
    if (f === 'arcade') for (var a = 0; a < 2; a++) { c.fillStyle = '#2A1E16'; c.beginPath(); c.moveTo(1.0 + a, 5.9); c.lineTo(1.0 + a, 4.4); c.arc(1.45 + a, 4.4, 0.45, Math.PI, 0); c.lineTo(1.9 + a, 5.9); c.fill(); }
    if (f === 'brick' && th.id === 'zeytinburnu') for (var d = 0; d < 2; d++) { c.fillStyle = '#7C8187'; c.fillRect(1.0 + d * 1.0, 3.1, 0.9, 2.5); for (var rb = 0; rb < 8; rb++) { c.fillStyle = '#5C6168'; c.fillRect(1.0 + d * 1.0, 3.2 + rb * 0.3, 0.9, 0.05); } }
    if (f === 'concrete' || f === 'balcony' || f === 'belle' || f === 'stone' || f === 'houses' || f === 'station' || f === 'arcade') shopRow(c, th, th.awn.length > 0 && f !== 'concrete' && f !== 'balcony');
  }
  function sideTile(c, th, kind) {
    if (kind === 'facade') return facadeTile(c, th);
    if (kind === 'grass') return grass(c, '#4F6A46', 4, 4);
    if (kind === 'garden') {
      c.fillStyle = '#5A3E2A'; c.fillRect(0, 0, 3.4, 4);
      for (var r = 0; r < 6; r++) { c.fillStyle = '#3E2A1C'; c.fillRect(0.1, 0.1 + r * 0.66, 3.2, 0.42);
        for (var k = 0; k < 6; k++) { c.fillStyle = k % 2 ? '#3E8A4A' : '#5AA35A'; c.beginPath(); c.arc(0.4 + k * 0.5, 0.31 + r * 0.66, 0.16, 0, 6.3); c.fill(); } }
      return;
    }
    if (kind === 'walls') {
      grid(c, [0.8, 0.5, 0, 0.08], '#7E7460', '#4E4838', 3.4, 6);
      c.fillStyle = '#A39878'; for (var m = 0; m < 6; m++) c.fillRect(0, m * 1.0 + 0.1, 0.5, 0.45);
      c.fillStyle = '#2A2C31'; c.fillRect(1.3, 4.0, 0.8, 2.0); return;
    }
    if (kind === 'tracks') {
      c.fillStyle = '#4A4A4E'; c.fillRect(0, 0, 4, 1.4);
      c.fillStyle = '#5C3A1C'; for (var s = 0; s < 4; s++) c.fillRect(0, 0.1 + s * 0.35, 4, 0.2);
      c.fillStyle = '#B9BEC6'; c.fillRect(1.1, 0, 0.08, 1.4); c.fillRect(2.8, 0, 0.08, 1.4); return;
    }
    if (kind === 'site') {
      c.fillStyle = '#6E6A60'; c.fillRect(0, 0, 3.4, 4);
      c.fillStyle = '#5C7A8C'; for (var p = 0; p < 4; p++) { c.fillRect(0.2, p * 1.0 + 0.1, 3.0, 0.8); c.fillStyle = '#3A4A56'; c.fillRect(0.2, p * 1.0 + 0.5, 3.0, 0.04); c.fillStyle = '#5C7A8C'; }
      c.fillStyle = GOLD; for (var h = 0; h < 8; h++) { c.beginPath(); c.moveTo(h * 0.45, 3.9); c.lineTo(h * 0.45 + 0.2, 3.9); c.lineTo(h * 0.45 + 0.4, 4); c.lineTo(h * 0.45 + 0.2, 4); c.fill(); }
    }
  }
  var SIDE_SIZE = { facade: [3.4, 6], grass: [4, 4], garden: [3.4, 4], walls: [3.4, 6], tracks: [4, 1.4], site: [3.4, 4] };

  // Tile record: { cv, w, h, k } in metres; null for water (animated in render-world).
  T.tile = function (th, role, k) {
    if (k !== cacheK) { CACHE = {}; cacheK = k; }
    var key = th.id + '|' + role, t = CACHE[key];
    if (t !== undefined) return t;
    t = null;
    if (role === 'ground' || role === 'walk') {
      var kind = role === 'walk' ? th.walk : (th.lanes ? 'lanes' : th.bays ? 'bays' : th.ground);
      var base = role === 'ground' ? th.gc : th.wc, joint = role === 'ground' ? th.gj : sh(th.wc, -0.12);
      t = { w: 2, h: 2, cv: bake(2, 2, k, function (c) { groundTile(c, kind, base, joint, 2, 2); }) };
    } else {
      var side = role === 'L' ? th.L : th.R, sz = SIDE_SIZE[side];
      if (sz) t = { w: sz[0], h: sz[1], cv: bake(sz[0], sz[1], k, function (c) { sideTile(c, th, side); }) };
    }
    if (t) t.k = k;
    CACHE[key] = t;
    return t;
  };

  // ---- time of day: hood position (0..19, fractional) -> [r,g,b,a] tint and vignette ----
  var TINT = [[0, 255, 181, 102, 0.10], [3, 233, 162, 59, 0.10], [6, 40, 60, 110, 0.20], [9, 27, 50, 90, 0.26],
    [12, 20, 30, 70, 0.30], [15, 27, 73, 101, 0.28], [17, 60, 90, 150, 0.24], [18, 255, 180, 140, 0.16], [19, 255, 200, 110, 0.12]];
  var VIG = [[0, 27, 73, 101, 0.45], [9, 10, 16, 36, 0.55], [17, 40, 56, 96, 0.5], [19, 70, 46, 30, 0.42]];
  function lerpKey(tab, hi) {
    if (hi <= tab[0][0]) return tab[0].slice(1);
    for (var i = 1; i < tab.length; i++) if (hi <= tab[i][0]) {
      var a = tab[i - 1], b = tab[i], f = (hi - a[0]) / (b[0] - a[0]);
      return a.slice(1).map(function (v, q) { return v + (b[q + 1] - v) * f; });
    }
    return tab[tab.length - 1].slice(1);
  }
  T.tint = function (hi) { return lerpKey(TINT, hi); };
  // Time-of-day tint blended with the sub's weather wash (rain/fog/fire/dawn/dusk).
  T.tintFor = function (hi, wx) {
    var b = lerpKey(TINT, hi), w = WX[wx];
    if (!w) return b;
    return [(b[0] + w[0]) / 2, (b[1] + w[1]) / 2, (b[2] + w[2]) / 2, Math.min(0.45, b[3] + w[3])];
  };
  T.vignette = function (hi) { return lerpKey(VIG, hi); };
  return T;
})();
