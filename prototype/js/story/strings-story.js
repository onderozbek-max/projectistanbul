// Story strings: speaker names and comic chrome (class A, UI). The voice lines (pages, pops, calls, captions) are in js/dialogue/.
// Boss names: spk.b.<hood>. Canon: narrative.md, journey.md.
(function () {
  Object.assign(P.STR.tr, {
    'spk.kaan': 'Kaan', 'spk.mila': 'Mila', 'spk.baba': 'Baba', 'spk.ahmet': 'Ahmet Abi', 'spk.stranger': 'Yabancı',
    'spk.shopkeeper': 'Esnaf', 'spk.zombie': 'Zombi', 'spk.cap': 'Anlatıcı',
    'spk.b.istiklal': 'Vatman', 'spk.b.galata': 'Tur Rehberi', 'spk.b.karakoy': 'Gelin', 'spk.b.bridge': 'Koca Balıkçı',
    'spk.b.eminonu': 'Kaptan', 'spk.b.sirkeci': 'Biletçi', 'spk.b.kapalicarsi': 'Halı Golem', 'spk.b.beyazit': 'Güvercinci',
    // TR owner check: spk.b.saray (Rehber) and spk.b.halic (Antikacı), D-060 boss names.
    'spk.b.saray': 'Müze Rehberi', 'spk.b.halic': 'Antikacı', 'spk.b.kumkapi': 'Balık Hamalı', 'spk.b.yenikapi': 'Akşam Kalabalığı',
    'spk.b.samatya': 'Mangal Baba', 'spk.b.yedikule': 'Anahtarcı', 'spk.b.zeytinburnu': 'Boyacı Ustası', 'spk.b.kazlicesme': 'Hortumcu',
    'spk.b.bakirkoy': 'Müdür', 'spk.b.bakirkoysahil': 'Dondurmacı', 'spk.b.atakoysahil': 'Yat Sahibi', 'spk.b.atakoy': 'Sayın Abim',
    'cm.tap': 'Devam için dokun', 'cm.page.label': 'Çizgi roman sayfası', 'cm.tag.story': 'HİKÂYE', 'cm.tag.l1': 'İLK LOKMA',
    'cm.nosig': 'Sinyal yok', 'cm.sfx.cat': 'ÇAT!', 'cm.sfx.buzz': 'BZZT', 'cm.sfx.tik': 'TIK TIK', 'cm.sfx.kut': 'KÜT!',
    'cm.sfx.sak': 'ŞAK!', 'cm.sfx.sangir': 'ŞANGIR!', 'cm.sfx.bum': 'BUM!', 'cm.sfx.vin': 'VIIIN!',
  });
  Object.assign(P.STR.en, {
    'spk.kaan': 'Kaan', 'spk.mila': 'Mila', 'spk.baba': 'Dad', 'spk.ahmet': 'Ahmet Abi', 'spk.stranger': 'Stranger',
    'spk.shopkeeper': 'Shopkeeper', 'spk.zombie': 'Zombie', 'spk.cap': 'Narrator',
    'spk.b.istiklal': 'The Vatman', 'spk.b.galata': 'Tour Guide', 'spk.b.karakoy': 'The Bride', 'spk.b.bridge': 'Big Fisherman',
    'spk.b.eminonu': 'The Captain', 'spk.b.sirkeci': 'The Ticket Man', 'spk.b.kapalicarsi': 'The Carpet Golem',
    'spk.b.beyazit': 'The Pigeon Man', 'spk.b.saray': 'The Docent', 'spk.b.halic': 'The Antiquarian',
    'spk.b.kumkapi': 'The Fish Porter', 'spk.b.yenikapi': 'The Evening Crowd', 'spk.b.samatya': 'The Grill Man',
    'spk.b.yedikule': 'The Key Keeper', 'spk.b.zeytinburnu': 'The Dye Foreman', 'spk.b.kazlicesme': 'The Hose Man',
    'spk.b.bakirkoy': 'The Principal', 'spk.b.bakirkoysahil': 'The Ice-Cream Man', 'spk.b.atakoysahil': 'The Yacht Owner',
    'spk.b.atakoy': 'The Honorable Big Bro',
    'cm.tap': 'Tap to continue', 'cm.page.label': 'Comic page', 'cm.tag.story': 'STORY', 'cm.tag.l1': 'FIRST BITE',
    'cm.nosig': 'No signal', 'cm.sfx.cat': 'THWACK!', 'cm.sfx.buzz': 'BZZT', 'cm.sfx.tik': 'TICK TICK', 'cm.sfx.kut': 'THUD!',
    'cm.sfx.sak': 'SNAP!', 'cm.sfx.sangir': 'CLANG!', 'cm.sfx.bum': 'BOOM!', 'cm.sfx.vin': 'VWOOSH!',
  });
})();
