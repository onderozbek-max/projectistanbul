// First-time hint callouts, consumable floaters and the hack-zone paused label (T4 part 10). Keys: hint.* (one per interaction
// type, 2 to 4 words), consume.* (text on a pickup or station), zone.* (hack zone). TR is short, natural Turkish; every TR line
// needs the owner's check (see reviews/REVIEW-R1.md, T4 part 10).
(function () {
  Object.assign(P.STR.tr, {
    'hint.heal': 'Yeşil haç: can verir',               // TR owner check
    'hint.currency': 'Jeton: topla',                    // TR owner check
    'hint.objective': 'Mavi pin: görev eşyası',         // TR owner check
    'hint.chest': 'Kutu: ödül çıkar',                   // TR owner check
    'hint.explosive': 'Vur: patlar',                    // TR owner check
    'hint.cover': 'Kır: içinden çıkar',                 // TR owner check
    'hint.link': 'Halkada basılı tut',                  // TR owner check
    'hint.tram': 'Tram hattından çekil',                // TR owner check
    'hint.door': 'Kapılardan geliyorlar',               // TR owner check
    'hint.dash': 'Kaçmak için DASH',                    // TR owner check
    'hint.call': 'Anne arıyor',                         // TR owner check
    'consume.heal': '+{n} CAN',                         // TR owner check
    'consume.full': 'DOLU',                             // TR owner check
    'consume.cap': 'LİMİT',                             // TR owner check
    'consume.chest': 'ÖDÜL',                            // TR owner check
    'consume.empty': 'BOŞ',                             // TR owner check
    'zone.paused': 'DURDU',                             // TR owner check
    'hack.signal': 'Sinyal kutusu'                      // TR owner check (label for the signal box zone; was a raw key)
  });
  Object.assign(P.STR.en, {
    'hint.heal': 'Green cross: heals you',
    'hint.currency': 'Coin: pick it up',
    'hint.objective': 'Blue pin: objective item',
    'hint.chest': 'Chest: grab a reward',
    'hint.explosive': 'Hit it: it explodes',
    'hint.cover': 'Break it: loot inside',
    'hint.link': 'Hold in the ring',
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
    'hack.signal': 'Signal box'                         // the signal box zone label; config-levels has no entry for it
  });
})();
