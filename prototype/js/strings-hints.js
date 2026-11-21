// First-time hint callouts, consumable floaters and the hack-zone paused label (T4 part 10). Keys: hint.* (one per interaction
// type, 2 to 4 words), consume.* (text on a pickup or station), zone.* (hack zone). TR is short, natural Turkish; every TR line
// needs the owner's check (see reviews/REVIEW-R1.md, T4 part 10).
(function () {
  Object.assign(P.STR.tr, {
    'engage.fuse': 'Uzaklaş!', 'engage.sec': ' sn',
    'engage.standBreak': 'Yanında dur, kır', 'engage.standBlast': 'Fitili yakmak için yanında dur', 'engage.standFoam': 'Köpüğü açmak için yanında dur',
    'ui.call.static': 'Hat cızırdıyor…',
    'tip.cook': 'Satıra yan adım at. Aşçı yeniden doğrulmadan yaklaş ve vur.',
    'tip.vatman': 'Tramvayın geçtiği şeritten çık. Tramvay geçer geçmez vatmana yaklaş.',
    'engage.break': 'Vur ve kır', 'engage.blast': 'Patlat, sonra uzaklaş', 'engage.foam': 'Köpük için vur',
    'engage.heal': 'Yaklaş ve iyileş', 'engage.healSpent': 'Yiyecekten iyileşme limiti doldu', 'engage.chest': 'Yaklaş ve sandığı aç', 'engage.coin': 'Yaklaş ve jetonu al',
    'engage.healSaved': 'Canın dolu · Simit burada kalır',
    'engage.crate': 'Yaklaş ve görev eşyasını al', 'engage.atm': 'Jeton için halkada kal',
    'engage.cell': 'Sinyal için halkada kal', 'engage.shutter': 'Kepenk için halkada kal',
    'engage.tram': 'Tramı çağırmak için halkada kal', 'engage.traffic': 'Işığı değiştirmek için halkada kal',
    'engage.cartWeapon': 'Sürü yaklaşınca dur ve kaldır',
    'engage.car': 'Alarmı çaldırmak için halkada kal',
    'hint.heal': 'Yeşil haç: can verir',               // TR owner check
    'hint.eczane': 'Eczane: Dokun ve iyileş',           // owner approved (R1-T4 part 14: the pharmacy heal station)
    'hint.kiosk': 'Büfe: Dokun ve iyileş',              // TR owner check (R1-T4 part 17: the simit and tea kiosk heal station)
    'hint.currency': 'Jeton: topla',                    // TR owner check
    'hint.objective': 'Mavi pin: görev eşyası',         // TR owner check
    'hint.chest': 'Kutu: ödül çıkar',                   // TR owner check
    'hint.explosive': 'Vur: patlar',                    // TR owner check
    'hint.cover': 'Kır: içinden çıkar',                 // TR owner check
    'hint.link': 'Bağlanmak için halkada kal',          // TR owner check
    'hint.tram': 'Tram hattından çekil',                // TR owner check
    'hint.door': 'Kapılardan geliyorlar',               // TR owner check
    'hint.dash': 'Sıyrılmak için DEPAR',                    // TR owner check
    'hint.call': 'Anne arıyor',                         // TR owner check
    'consume.heal': '+{n} CAN',                         // TR owner check
    'consume.full': 'DOLU',                             // TR owner check
    'consume.cap': 'LİMİT',                             // TR owner check
    'consume.chest': 'ÖDÜL',                            // TR owner check
    'consume.empty': 'BOŞ',                             // TR owner check
    'zone.paused': 'DURDU',                             // TR owner check
    'zone.cell': 'TELEFON SİNYALİ · HALKADA KAL', 'zone.connecting': 'SİNYAL GÜÇLENİYOR · %{n}', 'zone.connected': 'TELEFON SİNYALİ GERİ GELDİ',
    'zone.momRestored': 'ANNEN YENİDEN HATTA',
    'zone.message': 'ANNENİN MESAJI ALINDI', 'zone.bonus': 'Bölümü bitirince bonus jeton kazanırsın.',
    'hack.signal': 'Sinyal kutusu'                      // TR owner check (label for the signal box zone; was a raw key)
  });
  Object.assign(P.STR.en, {
    'engage.fuse': 'Back away!', 'engage.sec': ' s',
    'engage.standBreak': 'Stand beside it to break', 'engage.standBlast': 'Stand beside it to light the fuse', 'engage.standFoam': 'Stand beside it to release foam',
    'ui.call.static': 'Signal breaking up…',
    'tip.cook': 'Sidestep the cleaver, then move in while the Cook is still recovering.',
    'tip.vatman': 'Step out of the tram lane. As soon as it passes, close in on the Vatman.',
    'engage.break': 'Hit to break', 'engage.blast': 'Hit to ignite, then back away', 'engage.foam': 'Hit to release foam',
    'engage.heal': 'Move closer to heal', 'engage.healSpent': 'Food healing limit reached', 'engage.chest': 'Move closer to open', 'engage.coin': 'Move closer to collect',
    'engage.healSaved': 'Full health · Simit stays here',
    'engage.crate': 'Move closer to collect', 'engage.atm': 'Stay in the ring for coins',
    'engage.cell': 'Stay in the ring for signal', 'engage.shutter': 'Stay in the ring to open the shutter',
    'engage.tram': 'Stay in the ring to call the tram', 'engage.traffic': 'Stay in the ring to change the light',
    'engage.cartWeapon': 'Stop here to lift when enemies approach',
    'engage.car': 'Stay in the ring to sound the alarm',
    'hint.heal': 'Green cross: heals you',
    'hint.eczane': 'Pharmacy: touch to heal',
    'hint.kiosk': 'Kiosk: touch to heal',
    'hint.currency': 'Coin: pick it up',
    'hint.objective': 'Blue pin: objective item',
    'hint.chest': 'Chest: grab a reward',
    'hint.explosive': 'Hit it: it explodes',
    'hint.cover': 'Break it: loot inside',
    'hint.link': 'Stay inside the ring',
    'hint.tram': 'Leave the tram lane',
    'hint.door': 'They come from doors',
    'hint.dash': 'DASH to get clear',
    'hint.call': 'Mom is calling',
    'consume.heal': '+{n} HP',
    'consume.full': 'FULL',
    'consume.cap': 'CAP',
    'consume.chest': 'REWARD',
    'consume.empty': 'EMPTY',
    'zone.paused': 'PAUSED',
    'zone.cell': 'PHONE SIGNAL · STAY IN THE RING', 'zone.connecting': 'BOOSTING PHONE SIGNAL · {n}%', 'zone.connected': 'PHONE SIGNAL RESTORED',
    'zone.momRestored': 'MOM IS BACK ON THE LINE',
    'zone.message': 'MOM’S MESSAGE RECEIVED', 'zone.bonus': 'Finish the level to collect your bonus coins.',
    'hack.signal': 'Signal box'                         // the signal box zone label; config-levels has no entry for it
  });
})();
