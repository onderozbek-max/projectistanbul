// Native Turkish bark pools (v0.7, workstream W2-TR). Written in Turkish, not translated from the EN pools.
// Format: P.BarkPools.tr[poolKey] = [{ t: 'line', j: 1 }]. j: 1 marks a joke. Roughly one line in four is a joke.
// Pool key = the P.LINES id without its trailing index: 'BK.fk.walker.1' -> 'BK.fk.walker'.
// Hood stages keep the stage in the key: 'BK.hd01.1' ... 'BK.hd20.5' (one pool per hood stage, as barks.js builds it).
// Chains: talkToZombie in barks.js plays zq (Arda talks) -> zr (the groan) -> zreact (Arda reacts). The engine picks
// each pool at random and does NOT pair them by index, so every zreact line fits any zq and any zr.
// Zombie groans (zr) are sounds, not words. Lines stay under 60 characters.
// Guardrails: no brands, no police/state/municipal words, no religion as a target, no body talk, no quake words,
// no animal harm, no child zombies. Benzin Şişesi is the TR display name for the molotov card.
P.BarkPools = P.BarkPools || {};
P.BarkPools.tr = P.BarkPools.tr || {};
(function (T) {
  // ---------- first kill of each enemy type ----------
  T['BK.fk.walker'] = [
    { t: 'Yürüyen. Ağır ama inatçı.' },
    { t: "Yürüyen. Yol vermiyor. İstanbul'da da böyle biri var.", j: 1 },
    { t: 'Yürüyen. Her gün aynı yere gidiyor, her gün geç kalıyor.' },
  ];
  T['BK.fk.runner'] = [
    { t: 'Koşucu! Demek kardiyo yapıyorlar şimdi.', j: 1 },
    { t: 'Koşucu! Hızlı. Çok hızlı. Kaç, kaç, kaç.' },
    { t: 'Bu hızla maraton bile kazanır, valla.' },
  ];
  T['BK.fk.crawler'] = [
    { t: 'Rögardan çıktı. Tesisatçıyı arayayım... Ah, telefon.', j: 1 },
    { t: 'Sürünen! Yerden girdi, yerden çıktı.' },
    { t: 'Sürünüyor. Ben de bazen öyle hissediyorum.' },
  ];
  T['BK.fk.diner'] = [
    { t: 'Lokantadan hesap ödemeden kalkmış. Ayıp be abi.', j: 1 },
    { t: 'Çorbası soğumuş. Kendisi de öyle olmuş.', j: 1 },
    { t: 'Lokantadaki zombi. Garsonun yüzüne bakmamış.' },
  ];
  T['BK.fk.spitter'] = [
    { t: 'Tükürmek ayıp be abi!', j: 1 },
    { t: 'Tükürükçü! Kabalık da bir silah mı şimdi?' },
    { t: 'Tükürüğü asit çıktı. Ağzını kapat abi.' },
  ];
  T['BK.fk.bloater'] = [
    { t: 'Balon gibi şişmiş. Yakına gitme, patlar.' },
    { t: 'Şişti... Yakın durma. Yakın durma.' },
    { t: 'Şişmiş ama kendine güveni tam. Balon gibi.', j: 1 },
  ];
  T['BK.fk.brute'] = [
    { t: 'Bu iri de ne? Kapı mı, adam mı?', j: 1 },
    { t: 'Bunu yenmek için bir kahve daha lazım.' },
    { t: 'İri bu. Yumruğu da sert, belli.' },
  ];
  T['BK.fk.screamer'] = [
    { t: 'Bağırıyor... Komşular uyansın diye mi?', j: 1 },
    { t: 'Çığlık atan! Kulağım hâlâ çınlıyor.' },
    { t: 'Bağıran biri. Apartmanda hep bir tane olur.' },
  ];
  T['BK.fk.hardhat'] = [
    { t: 'Baret takmış. Şantiye güvenliği yani.', j: 1 },
    { t: 'Bareti var, aklı yok. Sigortası atmış.' },
    { t: 'Baret takmış. Kafasına dikkat etmek lazım.' },
  ];
  T['BK.fk.elite'] = [
    { t: 'Elit! Bu da kim, patron mu?', j: 1 },
    { t: 'Elit zombi! Yakışıklı ama evde kimse yok.', j: 1 },
    { t: 'Büyük, pahalı görünüyor. Dikkat abi.' },
  ];
  T['BK.fk.kasap'] = [
    { t: 'Kasap. Önlüğü kanlı, ben de sinirliyim.' },
    { t: 'Buzdolabı gibi yürüyor, kin tutuyor. Yine de buzdolabı.', j: 1 },
    { t: 'Kasap! Tezgâhını da yanında getirmiş.' },
  ];
  T['BK.fk.parkur'] = [
    { t: 'Parkurcu. Zıplıyor. Ben koşuyorum. Hangimiz aptal?', j: 1 },
    { t: 'Bana zıplama! Ben bile düşmeden zıplayamam.', j: 1 },
    { t: 'Parkurcu. Duvarları bizden hızlı tırmanıyor.' },
  ];
  T['BK.fk.zehirli'] = [
    { t: 'Tükürüğü zehirli. Otogar gibi kokuyor.', j: 1 },
    { t: 'Bulut bıraktı. Nefes almak da listeye girdi.' },
    { t: 'Zehirli. Bu sefer uzaktan yaklaşıyorum.' },
  ];

  // ---------- kill streaks ----------
  T['BK.streak.10'] = [
    { t: 'On! Ben bu işi biliyorum be!' },
    { t: "On tane! Annem olsa 'yemek yedin mi' derdi.", j: 1 },
    { t: 'On! Hadi ya, bu kadar kolay mı?' },
  ];
  T['BK.streak.25'] = [
    { t: 'Yirmi beş! Bu dövüş değil, halay!', j: 1 },
    { t: 'Yirmi beş! Kafa kırmak spor sayılırsa...' },
    { t: 'Yirmi beş. Bu hız bir gün beni yorar.' },
  ];
  T['BK.streak.50'] = [
    { t: 'Elli! Bu artık bir iş, maaş bağlansın.', j: 1 },
    { t: 'Elli! Tamam, yeter. Şimdi bir çay.' },
    { t: 'Elli. Ellerim değil, bacaklarım titriyor.' },
  ];
  T['BK.streak.100'] = [
    { t: 'Yüz! Bu sayıyı bir kupaya yazdırın!', j: 1 },
    { t: 'Yüz! Dünya bunu bilsin, lütfen!' },
    { t: "Yüz! Ataköy'deki herkese duyurun, sevinsinler." },
  ];

  // ---------- boss, elite, low HP, heal ----------
  T['BK.boss'] = [
    { t: 'Patron de geldi. Mesai ücreti de yazılsın.', j: 1 },
    { t: 'Bu sefer gerçekten büyük. Yalan yok.' },
    { t: 'Kaçmak ayıp mı şimdi?' },
    { t: 'Anne, sana anlatacağım... Bitirirsem.' },
    { t: 'Pazarlık yok. Bu patron pazarlık yapmıyor.', j: 1 },
    { t: 'Tamam Arda. Çalıştın, şimdi sınav.' },
  ];
  T['BK.elite'] = [
    { t: 'Büyük olan bir şey taşıyor. Dikkat!' },
    { t: 'Elit geliyor. Bu adam pahalı görünüyor.', j: 1 },
    { t: 'Bu sefer çok iri. Sakin ol Arda.' },
    { t: 'Elit zombi. Gözüm bu adamda.' },
    { t: 'Kasları nereden çıktı? Spor salonu mu açtı?', j: 1 },
  ];
  T['BK.low'] = [
    { t: 'Can azaldı. Toparlan Arda, hadi.' },
    { t: 'Son canımla bile yürürüm.' },
    { t: 'Ölmeden önce bir simit yiyeyim.', j: 1 },
    { t: 'Kan var. Ketçap desem inanır mısın?', j: 1 },
    { t: "Anne duysa dehşete düşerdi. Yine 'yemek yedin mi' derdi." },
    { t: 'Hayatta kalmak: dikkat, sabır, biraz şans.' },
  ];
  T['BK.heal'] = [
    { t: 'Simit! Hayat kurtaran şey bu.', j: 1 },
    { t: 'Biraz daha iyiyim. Simit işe yaradı.' },
    { t: 'Şifa! Bir çayla da olurdu.' },
    { t: 'Can doldu. Şimdi toparlanayım.' },
  ];

  // ---------- level-ups ----------
  T['BK.lvlA'] = [
    { t: 'Seviye atladım. İlerliyorum, yavaş ama emin.' },
    { t: 'Seviye atladım. Dizlerim de atlasa.', j: 1 },
    { t: 'Bir seviye daha. Harçlığım da artsa.' },
  ];
  T['BK.lvlB'] = [
    { t: 'Güçleniyorum. Annem bu sefer sevinir.' },
    { t: 'Seviye! Kas yok ama bir şey oldu.' },
    { t: 'Bir seviye daha, kaslarım bile fark etti.', j: 1 },
  ];
  T['BK.lvlC'] = [
    { t: 'Neredeyse kahraman oldum. Neredeyse.', j: 1 },
    { t: 'Bu hız iyi. Bu bir hikâye olacak.' },
    { t: 'Bu hikâyenin sonunu kimse bilmiyor.' },
  ];
  T['BK.lvlD'] = [
    { t: 'Yok artık, bu kadar seviye!' },
    { t: 'Artık benden bir şey bekliyorlar galiba.' },
    { t: 'On seviye. Eve gidince kendime hediye.', j: 1 },
  ];

  // ---------- cards: weapons and passives ----------
  T['BK.card.knife'] = [
    { t: "Döner bıçağı! Usta görse 'ince kes' derdi.", j: 1 },
    { t: 'Bıçak elimde. Dürüm gibi sarıyorum ortalığı.' },
    { t: "Bu bıçağı Usta'ya geri vereceğim. Söz." },
  ];
  T['BK.card.nailgun'] = [
    { t: 'Çivi tabancası. Tamirciler bayılır.' },
    { t: 'Çivi! Dolabı bile sabitleyebilirim.' },
    { t: 'Çivi tabancası. Kiracıyken izin verilmezdi.', j: 1 },
  ];
  T['BK.card.canister'] = [
    { t: 'Gaz tüpü. Mangal yakmayı bilirim, bu fazla.', j: 1 },
    { t: 'Tüp! Piknik için değil ama işe yarar.' },
    { t: 'Gaz tüpü. Dikkatli taşı, ateş almasın.' },
  ];
  T['BK.card.chain'] = [
    { t: 'Bisiklet zinciri. Ayağa dolanmadan kullan.' },
    { t: 'Zincir hazır. Bisikletim olsa keşke.' },
    { t: 'Zincir hazır. Bisikleti de sokakta bırakmışım.', j: 1 },
  ];
  T['BK.card.sledge'] = [
    { t: 'Varyoz! Ağır ama adil.' },
    { t: 'Varyoz. Bu kapıyı kırmadan geçmem.', j: 1 },
    { t: 'Varyoz. Tadilat amcası bile hayran kalır.' },
  ];
  T['BK.card.molotov'] = [
    { t: "Benzin şişesi. Dede 'ateşle oynama' derdi.", j: 1 },
    { t: 'Şişe elimde, ateş de yakında.' },
    { t: 'Benzin şişesi. Bu sefer ateş bizden yana.' },
  ];
  T['BK.card.fireworks'] = [
    { t: 'Havai fişek! Düğünden kalmış, bol şans.', j: 1 },
    { t: 'Havai fişek. Gökyüzüne bir selam.' },
    { t: 'Havai fişek. Bu gece kimin nişanı var acaba?' },
  ];
  T['BK.card.cable'] = [
    { t: 'Canlı kablo. Ellemeden önce uyarın beni.', j: 1 },
    { t: 'Kablo çatırdıyor. Hadi ya, ne güzel.' },
    { t: 'Canlı kablo. Elektrikçi de bu saatte açık değil.' },
  ];
  T['BK.card.speargun'] = [
    { t: 'Zıpkın! Dede olsa çok sevinirdi.' },
    { t: 'Zıpkın. Balık tutmak için de olur.', j: 1 },
    { t: "Zıpkın. Uzaktan vurmak, Dede'nin öğüdü." },
  ];
  T['BK.card.extinguisher'] = [
    { t: 'Yangın tüpü. Hem silah hem sigorta.', j: 1 },
    { t: 'Yangın tüpü. Bu sefer yanan şey sönüyor.' },
    { t: 'Yangın tüpü. Son kontrol tarihi geçmemiş, umarım.', j: 1 },
  ];
  T['BK.card.sawblade'] = [
    { t: 'Testere diski. Şantiyeden aldım, fark etmedi.', j: 1 },
    { t: 'Dişleri var, kıvılcım saçıyor. Kimse laf atmaz.' },
    { t: 'Testere diski. Dönerken çok ses çıkarıyor.' },
  ];
  T['BK.card.manhole'] = [
    { t: 'Rögar kapağı. Ağır ama frizbi gibi atılıyor.', j: 1 },
    { t: 'Rögar kapağı. Sahibi gelirse özür dilerim.' },
    { t: 'Kapağı kaldırdım. Altında da bizi bekliyorlarmış.' },
  ];
  T['BK.card.torch'] = [
    { t: 'Pürmüz! Mangal için almıştım, işim değişti.', j: 1 },
    { t: 'Alev hazır. Tek sorun: ben de tutuşabilirim.' },
    { t: 'Pürmüz elimde. Dikkatli olmam lazım.' },
  ];
  T['BK.card.cardoor'] = [
    { t: 'Araba kapısı. Sahibi hâlâ arıyor olabilir.', j: 1 },
    { t: 'Kapı kalkıyor, tükürük geri gidiyor. Adil.' },
    { t: 'Araba kapısı. Park yeri bulamayan birinden kaldı.', j: 1 },
  ];
  T['BK.card.slingshot'] = [
    { t: 'Sapan! Çocukluğumun en büyük becerisi.' },
    { t: 'Bilye sekiyor, ben kaçıyorum. Plan bu.', j: 1 },
    { t: 'Sapan. Mahallenin camlarına dikkat ederdim.' },
  ];
  T['BK.card.chainsaw'] = [
    { t: 'Motorlu testere. Gaza basınca içim de titriyor.' },
    { t: 'Motor boğulursa beklerim. Motor de ben de.', j: 1 },
    { t: 'Motorlu testere! Ağaçlar bugün korkmuştur.' },
  ];
  T['BK.card.shoes'] = [
    { t: 'Koşu ayakkabısı! Nihayet.' },
    { t: 'Ayakkabılar yeni, ben de yeniyim.', j: 1 },
    { t: 'Koşu ayakkabısı. Almayı çok geciktirmişim.' },
  ];
  T['BK.card.jacket'] = [
    { t: "Deri ceket. Anne hep 'mont giy' derdi, işte.", j: 1 },
    { t: 'Ceket var, mont yok. Anne bunu da duyacak.' },
    { t: 'Deri ceket. Sıcak tutar mı bilmiyorum, havalı.' },
  ];
  T['BK.card.gloves'] = [
    { t: 'İş eldiveni. Ellerim de kahraman olsun.' },
    { t: 'Eldivenler tam. Şimdi yumruk sırası.' },
    { t: 'İş eldiveni. Mesai bitti sayılır, sanırım.', j: 1 },
  ];
  T['BK.card.energy'] = [
    { t: 'Enerji içeceği. Artık bir yaşam tarzı.', j: 1 },
    { t: 'Bir kutu daha, sonra ben de kutu olurum.' },
    { t: 'Enerji içeceği. Sabahları bunu içmeden çıkmıyorum.' },
  ];
  T['BK.card.medkit'] = [
    { t: 'İlk yardım çantası. Anne hep koyardı.' },
    { t: 'Bant, pansuman, bir de umut. Hadi bakalım.' },
    { t: 'İlk yardım çantası. Son kullanma tarihine baktım, geçmiş.', j: 1 },
  ];
  T['BK.card.nazar'] = [
    { t: 'Nazar boncuğu. Bana bakıyor, iyi ki.' },
    { t: 'Boncuk asılı, ben yürüyorum.' },
    { t: 'Boncuk var. Nazar bana değmez, umarım.' },
  ];
  T['BK.card.magnet'] = [
    { t: 'Mıknatıs. Her şey bana gelsin.' },
    { t: 'Mıknatıs! Parayı bile çekerim.', j: 1 },
    { t: 'Mıknatıs. Kaybettiğim anahtarları da bulur.' },
  ];
  T['BK.card.gen'] = [
    { t: 'Güzel seçim Arda. Pişman olma.' },
    { t: 'Bu seçimi annem onaylardı.' },
    { t: 'Yeni bir güç! İşler düzeliyor.' },
  ];

  // ---------- mods, mastery, evolutions ----------
  T['BK.mod'] = [
    { t: 'Modu taktım. Tamirci olmaya başladım.', j: 1 },
    { t: 'Bu modla bıçak daha keskin.' },
    { t: 'Mühendisin oğlu olduğumu hatırladım.' },
    { t: 'İyi mod. Kılavuzu okumadım ama.', j: 1 },
    { t: 'Ustaya selam söyleyin, modu takıyorum.' },
  ];
  T['BK.mastery'] = [
    { t: 'Bu hareketi bir videoda görmüştüm.', j: 1 },
    { t: 'Usta gibi! Ya da ustanın kedisi gibi.', j: 1 },
    { t: 'Bu hareket benim imzam olacak.' },
    { t: 'Hareket tamam. Şimdi bir de alkış.' },
  ];
  T['BK.evo.cleaver'] = [
    { t: 'Usta Satırı! Ustanın bıçağı artık bende.' },
    { t: 'Satır kadar ağır, aşçı kadar hevesliyim.', j: 1 },
    { t: 'Ustanın satırı bende. Ustaya haber verin.' },
  ];
  T['BK.evo.nailstorm'] = [
    { t: 'Çivi fırtınası! Tamirci bile bu kadar hızlı olmaz.', j: 1 },
    { t: 'Çivi fırtınası! Komşular şikâyet edecek.' },
    { t: 'Çivi yağıyor. Bu da bir tür yağmur.' },
  ];
  T['BK.evo.cluster'] = [
    { t: 'Küme bomba! Piknik değil, havai fişek gösterisi.', j: 1 },
    { t: 'Bir patlama, sonra bir patlama daha.' },
    { t: 'Patlama sırada. Sıraya girin.' },
  ];
  T['BK.evo.cyclone'] = [
    { t: 'Zincir kasırgası! Bu sefer ayağım dolanmadı.' },
    { t: 'Kasırga! Bisiklet bu kez bana uydu.' },
    { t: 'Zincir dönüyor. Düğün halayı gibi, kimse çıkamıyor.', j: 1 },
  ];
  T['BK.evo.finale'] = [
    { t: 'Düğün finali! Gelin kızmasın bari.', j: 1 },
    { t: 'Finale! Bu sefer alkış bana.' },
    { t: 'Finale. Salon bu kadar sessiz olmamıştı.' },
  ];
  T['BK.evo.gen'] = [
    { t: 'Evrimleşti! Biraz daha kötü oldu.', j: 1 },
    { t: 'Evrim tamam. Şimdi ben de evrimleşeyim.' },
    { t: 'Bu da yeni hâli. Eskisinden beter.' },
  ];

  // ---------- ultimates, dash, near miss, nazar, frenzy ----------
  T['BK.ult'] = [
    { t: 'Son hamle! Ben de buradayım.' },
    { t: 'Ultra mod! Hadi bakalım.' },
    { t: 'Mega vuruş. Artık kimse laf sokmaz.' },
    { t: 'Yıldız gibi! Bu sefer ben de kazandım.', j: 1 },
    { t: 'Bütün gücümü verdim. Sıra sende.' },
    { t: 'Son hamle bitti. Nefes al Arda.' },
  ];
  T['BK.ultr'] = [
    { t: 'Hazır! Şimdi bas bakalım.' },
    { t: 'Son hamle hazır. Biraz heyecanlandım.' },
    { t: 'Dolu enerji! Ne zaman patlatsam...', j: 1 },
  ];
  T['BK.dash'] = [
    { t: 'Fırladım! Hızlı olmak da bir kişilik.', j: 1 },
    { t: 'Fırladım, kaçtım, zaferi aldım.' },
    { t: 'Mila olsa daha hızlı koşardı.', j: 1 },
    { t: 'Sprint! Antrenörüm gurur duyardı.' },
    { t: 'Ayaklarım uçtu ama kafam yerinde.' },
  ];
  T['BK.near'] = [
    { t: 'Ooo! Saçım bile titredi.', j: 1 },
    { t: 'Tamam tamam, çok yakındı.' },
    { t: 'Bu kadar yaklaşmasa da olurdu.' },
    { t: 'Yüreğim bir yerlere düştü.' },
    { t: 'Kıl payı! Kıl payı kaçtık.' },
  ];
  T['BK.nazar'] = [
    { t: 'Nazar boncuğu bu sefer kurtardı.' },
    { t: 'Boncuk benim yerime çarptı.', j: 1 },
    { t: 'Boncuğa teşekkür ediyorum. Şaka değil.' },
  ];
  T['BK.frenzy'] = [
    { t: 'Çılgına döndüm! Dur bakalım.' },
    { t: 'Modumu açtım. Arda 2.0.', j: 1 },
    { t: 'Kan var, adrenalin var. Ben buradayım.' },
  ];

  // ---------- hacks (atm, traffic, booster, shutter, alarm, tram) ----------
  T['BK.hack.atm.start'] = [
    { t: "ATM'ye bağlanıyorum. Şifre tahmin zamanı." },
    { t: 'Şifre 1234 çalışır mı acaba?', j: 1 },
    { t: 'Doğum günümü deneyeyim. Herkes öyle yapıyor.' },
  ];
  T['BK.hack.atm.done'] = [
    { t: 'ATM açıldı. Para yok, sadece bir fiş.', j: 1 },
    { t: 'ATM açıldı. Parası yok ama bana bakıyor.' },
    { t: 'ATM açıldı. Kuyrukta kimse yok, sevindim.' },
  ];
  T['BK.hack.atm.fail'] = [
    { t: 'Yanlış şifre. Bir hak daha, sonra kilit.' },
    { t: 'ATM kilitlendi. Bankaya yazacağım.', j: 1 },
    { t: 'Yanlış şifre. Doğum günümü denedim, olmadı.' },
  ];
  T['BK.hack.traffic.start'] = [
    { t: 'Trafik ışıklarını hackliyorum. Kırmızı benim.', j: 1 },
    { t: 'Merhaba ışık. Kırmızıyı bana ver.' },
    { t: 'Trafik ışığına yalvarıyorum. Yeşil yak, lütfen.' },
  ];
  T['BK.hack.traffic.done'] = [
    { t: 'Yeşil yandı. İstanbul bile şaşırdı.', j: 1 },
    { t: 'Işıklar bizim için yanıyor. Ne kibar.' },
    { t: 'Yeşil yandı. Arkamdan korna çalan yok.' },
  ];
  T['BK.hack.traffic.fail'] = [
    { t: 'Işık bozuk. Kırmızıda bekleyip yeniden deneyeyim.' },
    { t: 'Trafik kilit. Tıpkı her sabah gibi.', j: 1 },
    { t: 'Trafik ışığı inat etti. Ben de inat ettim.' },
  ];
  T['BK.hack.booster.start'] = [
    { t: "Scooter'a bağlanıyorum. Batarya bana bakıyor." },
    { t: "Scooter'ı açıyorum. Kask yok, sorun yok.", j: 1 },
    { t: "Scooter'ı kilitten çıkarıyorum. Yasal değil, biliyorum." },
  ];
  T['BK.hack.booster.done'] = [
    { t: 'Scooter çalıştı! Kask yok ama kim takar.' },
    { t: 'Scooter hazır. Biraz hız çıkarayım.' },
    { t: 'Scooter çalıştı. Kask hâlâ yok.' },
  ];
  T['BK.hack.booster.fail'] = [
    { t: 'Scooter öldü. Yürümek yine bana kaldı.' },
    { t: 'Batarya boş. Bu da bizim kaderimiz.' },
    { t: 'Batarya boş. Benim şarjım da yüzde on.', j: 1 },
  ];
  T['BK.hack.shutter.start'] = [
    { t: 'Kepengi kaldırıyorum. Gıcırdıyor, sessiz ol.' },
    { t: 'Kepenk, kepenk... Açıl bakalım.' },
    { t: 'Kepenk kalkmak istemiyor. Esnaf da istemiyordur.', j: 1 },
  ];
  T['BK.hack.shutter.done'] = [
    { t: 'Kepenk açıldı. Gerisi zombilerin.', j: 1 },
    { t: "Kepenk açıldı. Dükkâncı 'hoş geldin' diyor." },
    { t: 'Kepenk açıldı. İçeride kimse yok, sadece koku.' },
  ];
  T['BK.hack.shutter.fail'] = [
    { t: 'Kepenk sıkıştı. Hadi ya, şimdi de bu.' },
    { t: 'Kepenk inat etti. Ben de inat ettim.' },
    { t: "Kepenk takıldı. Esnaf görse 'bakım yapmadın' derdi.", j: 1 },
  ];
  T['BK.hack.alarm.start'] = [
    { t: 'Alarmı susturuyorum. Bip, bip, bip...' },
    { t: 'Alarm çalıyor, kalbim de eşlik ediyor.' },
    { t: 'Alarm çalıyor. Komşular uyanmasın.', j: 1 },
  ];
  T['BK.hack.alarm.done'] = [
    { t: 'Alarm sustu. Ama kalbim hâlâ bağırıyor.' },
    { t: 'Sessizlik! Kulaklarım huzur buldu.' },
    { t: 'Alarm sustu. Apartman toplantısına çağrılmam.', j: 1 },
  ];
  T['BK.hack.alarm.fail'] = [
    { t: 'Alarm daha da yükseldi. Hadi kaçalım!' },
    { t: 'Yanlış tuş. Bu sefer herkes duydu.', j: 1 },
    { t: 'Alarm yükseldi. Balkona komşu çıktı.' },
  ];
  T['BK.hack.tram.start'] = [
    { t: 'Tramvayı çalıştırıyorum. Ehliyetim yok ki.', j: 1 },
    { t: "Vatman'ın kabinine bakıyorum. Hadi bakalım." },
    { t: 'Tramvayın kontağını arıyorum. Kontak yok.' },
  ];
  T['BK.hack.tram.done'] = [
    { t: 'Tramvay kalktı! Vatman burada olsa ağlardı.', j: 1 },
    { t: 'Zil çaldı, tramvay yürüdü. Muhteşem.' },
    { t: 'Tramvay kalktı. Biletim yok, kontrol de yok.' },
  ];
  T['BK.hack.tram.fail'] = [
    { t: 'Tramvay yerinden oynamadı. Raylar da yorgun.', j: 1 },
    { t: 'Kontak yok, bilet yok, umut var.' },
    { t: 'Tramvay kıpırdamadı. Raylar da bizi bırakmış.' },
  ];

  // ---------- rescues and events ----------
  T['BK.rescue'] = [
    { t: 'Yardım geliyor! Ya da bir kalabalık.', j: 1 },
    { t: 'Kurtarıyoruz! Kimse kimsenin üstüne basmasın.' },
    { t: 'Kurtarıldı. Teşekkür etmenize gerek yok.' },
    { t: 'Bir can daha. Bugün iyi gidiyor.' },
    { t: 'Kapıyı açın, ben de insanım!' },
    { t: 'Yardım ettim, şimdi bana bir simit.', j: 1 },
  ];
  T['BK.ev.ambush'] = [
    { t: 'Pusu! Herkes köşeye! Ben önce bakarım.', j: 1 },
    { t: 'Pusu kurmuşlar. Zombi bile bu kadar sabırlı değil.' },
    { t: 'Pusu! Ben kapıda, siz arkadan gelin.' },
  ];
  T['BK.ev.lootRunner'] = [
    { t: 'Ganimet koşucusu! Kaçan poşeti yakala.' },
    { t: 'Poşetli adam kaçıyor. Bir kahve için kovalarım.', j: 1 },
    { t: 'Poşetli adam kaçıyor. İçinde ne var, bakalım.' },
  ];
  T['BK.ev.rescue'] = [
    { t: 'Biri sıkışmış! Hadi, bir el ver.' },
    { t: 'Yardım çağrısı. Beni de duyan var mı?' },
    { t: 'Sıkışmış biri. Bu günlerde herkes sıkışmış.', j: 1 },
  ];
  T['BK.ev.blackout'] = [
    { t: 'Elektrikler gitti. Telefonum da zaten gitmişti.', j: 1 },
    { t: 'Karanlık! Fenerim nerede be?' },
    { t: 'Elektrik kesildi. Faturayı yine unuttum galiba.', j: 1 },
  ];
  T['BK.ev.burningCar'] = [
    { t: 'Araba yanıyor. İçinde kimse yok, değil mi?' },
    { t: 'Yanan araba! Yavaş yaklaşalım, patlamasın.' },
    { t: 'Yanan araba. Sigortası da yanmış belli.' },
  ];
  T['BK.ev.stampede'] = [
    { t: 'Sürü geliyor! Kaçın, kaçın!' },
    { t: 'Koşan kalabalık. Bu yarış değil, kaçış!', j: 1 },
    { t: 'Kalabalık koşuyor. Son otobüse yetişir gibi.' },
  ];
  T['BK.ev.barricade'] = [
    { t: 'Barikat! Biri güzel hazırlamış, saygılar.', j: 1 },
    { t: 'Masalar, sandalyeler. Ev yapımı bir kale.' },
    { t: 'Barikat kurulmuş. Burası artık kafe değil, kale.' },
  ];
  T['BK.ev.defend'] = [
    { t: 'Savunun! Herkes yerinde dursun.' },
    { t: 'Savunma zamanı! Ben duvar olurum, siz de hadi.' },
    { t: 'Savunma! Ben önde, siz arkada, çay benden.', j: 1 },
  ];

  // ---------- event endings ----------
  T['BK.evend.ambush'] = [
    { t: 'Pusu bitti. Çay içeyim, ellerim titriyor.' },
    { t: 'Pusu bitti. Bir daha kimseyi bekletmem.', j: 1 },
    { t: 'Pusu bitti. Kalbim hâlâ pusuda.' },
  ];
  T['BK.evend.lootRunner'] = [
    { t: 'Ganimet bizde. Karnım da doydu.', j: 1 },
    { t: 'Poşet bizde, kaçan adam yok.' },
    { t: 'Poşet bizde. Ben de bir şey yemeliyim.' },
  ];
  T['BK.evend.rescue'] = [
    { t: 'Kurtarma bitti. Kalbimi toparlıyorum.' },
    { t: 'Kurtulduk! Kimse ağlamasın, ben ağlıyorum.', j: 1 },
    { t: 'Kurtulduk. Şimdi bir oturmak lazım.' },
  ];
  T['BK.evend.blackout'] = [
    { t: 'Işıklar geldi. Hepimiz gözümüzü kırptık.', j: 1 },
    { t: 'Işık geldi. Kimse bana bakmıyor, iyi.' },
    { t: 'Işıklar geldi. Yüzler belli oldu, hiç hoş değil.' },
  ];
  T['BK.evend.burningCar'] = [
    { t: 'Yangın söndü. Kokusu hâlâ burada.' },
    { t: 'Araba söndü. Keşke bu kadar yanmasaydı.' },
    { t: 'Neyse ki yangın bize bulaşmadı.' },
  ];
  T['BK.evend.stampede'] = [
    { t: 'Sürü geçti. Kendimi toparlıyorum.' },
    { t: 'Koşu bitti. Bacaklarım bunu bilmiyor.', j: 1 },
    { t: 'Koşu bitti. Otobüs de kaçmış herhalde.' },
  ];
  T['BK.evend.barricade'] = [
    { t: 'Barikat tutmadı ama inat etti.', j: 1 },
    { t: 'Masalar devrildi. Sandalyeler de.' },
    { t: 'Barikat dağıldı. Tahta da gitti, ne yapalım.' },
  ];
  T['BK.evend.defend'] = [
    { t: 'Savunma bitti. Dizlerim titriyor.' },
    { t: 'Savunduk! Şimdi bir oturmak lazım.' },
    { t: 'Savunduk. Şimdi çayı kim koyacak?', j: 1 },
  ];

  // ---------- signal ----------
  T['BK.sig.lost'] = [
    { t: 'Sinyal gitti. Yine ben ve yollar.' },
    { t: 'Sinyal yok. Telefon bana bakıyor.', j: 1 },
    { t: 'Sinyal kaçtı. Anne de bekliyor, ben de.' },
    { t: 'Çubuklar sıfır. Yapacak bir şey yok.' },
  ];
  T['BK.sig.back'] = [
    { t: 'Sinyal geldi! Anne, duyuyor musun?' },
    { t: 'Sinyal geldi! Telefonum sevinç çığlığı attı.', j: 1 },
    { t: 'Sinyal var! Önce Anne, sonra ben.', j: 1 },
    { t: 'İki çubuk! Bu bir mucize sayılır.' },
  ];

  // ---------- enemy actions ----------
  T['BK.act.bruteRoar'] = [
    { t: 'Kükredi! Kapıcılar bile korkar.', j: 1 },
    { t: 'Bu bağırış kapı zili gibi değil.' },
    { t: 'Kükreme! Komşular da duydu sanırım.' },
    { t: 'Bu sesle kulağım ağrıdı.' },
  ];
  T['BK.act.bruteCharge'] = [
    { t: 'Hücum! Bu sefer kaçmak lazım.' },
    { t: 'Hızlandı! Bu da spor yapıyor galiba.', j: 1 },
    { t: 'Koş! Koş! Ben zaten koşuyorum.' },
    { t: 'Üstüme geliyor. Ayakkabılar hazır mı?' },
  ];
  T['BK.act.spit'] = [
    { t: 'Tükürük! Yere bak, yere!' },
    { t: 'Tükürük geliyor! Mont gitti bu.', j: 1 },
    { t: 'Asit yağıyor. Bir araba kapısı olsa keşke.' },
    { t: 'Yerdeki tükürük köpürdü. Uzak durun.' },
  ];
  T['BK.act.bloaterSwell'] = [
    { t: 'Şişiyor! Herkes geri!' },
    { t: 'Şişti, şişti, şişti!' },
    { t: 'Balon gibi! Ama balonlar böyle yapmaz.', j: 1 },
    { t: 'Patlamaya hazır bir herif! Yakın durma, yakın durma.' },
  ];
  T['BK.act.summon'] = [
    { t: 'Çağırdı! Arkadaşlarını davet ediyor.' },
    { t: 'Davetiye dağıttı. Ben gelmedim.', j: 1 },
    { t: 'Yeni gelenler var. Bunlar da kim?' },
    { t: 'Çağrı geldi. Bu daveti reddediyorum.' },
  ];
  T['BK.act.bossSlam'] = [
    { t: 'Yere vurdu! Ayakkabılarım zıpladı.' },
    { t: 'Vuruş! Yer benim düşmanım oldu.' },
    { t: 'Vuruş! Yer de benim gibi şaşkın.', j: 1 },
    { t: 'Toz! Görüş sıfır, kalp yüz.' },
  ];

  // ---------- idle, standing still, zombie very close ----------
  T['BK.idle'] = [
    { t: 'Ne bekliyorum ben? Dolmuş mu?', j: 1 },
    { t: 'Burada yürüyen merdiven yok. Yürüyeceğim.' },
    { t: 'Durdum, yürüyüş de durdu sanki.' },
    { t: 'Biraz nefes alayım. Sonra gideriz.' },
    { t: 'Bu sessizlik beni de yoruyor.' },
    { t: 'Kendi kendime konuşmaya başladım. Dikkat.', j: 1 },
  ];
  T['BK.still'] = [
    { t: 'Ayakkabım bile bana kızdı.', j: 1 },
    { t: 'Duruyorum, bu bir strateji.' },
    { t: 'Durmak da yürümenin bir parçası.' },
    { t: 'Kalbim koşuyor, ayaklarım dinleniyor.' },
    { t: 'Hadi, bu sefer başlıyorum. Kesin.' },
    { t: 'Yürüyüş mü, dinlenme mi? Karar veremiyorum.', j: 1 },
  ];
  T['BK.close'] = [
    { t: 'Yakın! Nefesini tutsan olmaz mı? Ayıp.', j: 1 },
    { t: 'Bu kadar yaklaşma. Kişisel alanım var.' },
    { t: 'Kokusu bile beni yavaşlatıyor.' },
    { t: 'Geri çekiliyorum, bu bir taktik.' },
    { t: 'Abi, bu mesafe benim için fazla.' },
    { t: 'Yakın ama bana ulaşamaz, bence.' },
  ];

  // ---------- talking to zombies: zq (Arda) -> zr (groan) -> zreact (Arda) ----------
  T['BK.zq'] = [
    { t: 'Pardon abi, ayağına bastım mı?', j: 1 },
    { t: 'Abi, bu kadar bakma. Utanıyorum.' },
    { t: 'Ne var? Bir şey mi söyleyeceksin?' },
    { t: 'Kusura bakma, acelem var.' },
    { t: 'Ağzın açık. Bir şey mi diyeceksin?' },
    { t: 'Abi, biraz konuş. Yoksa ben konuşurum.', j: 1 },
    { t: 'Kafa mı istiyorsun? Bugün yok.' },
    { t: 'Otur, konuşalım. Tamam, ayakta konuşalım.', j: 1 },
    { t: 'Bu saatte nereye böyle abi?' },
    { t: 'Bir öneride bulunabilir miyim? Dön.' },
    { t: 'Hesabı ben ödemem, baştan söyleyeyim.', j: 1 },
    { t: 'Adın ne? Yok mu? Hiç mi yok?', j: 1 },
    { t: 'Bu taraf kapalı abi, sen de biliyorsun.' },
    { t: 'Abi sen de mi sıraya girdin?', j: 1 },
    { t: 'Benim de kötü bir günüm oldu. Geç hadi.' },
    { t: 'Konuşmamız yarım kaldı abi, üzülme.' },
    { t: 'Bu sefer sen anlatırsın. Ben dinlerim.' },
    { t: 'Pazar günü de mi çalışıyorsun abi?', j: 1 },
    { t: 'Sen de mi yürüyorsun? Yol arkadaşı mı?' },
    { t: 'Kafanı kaldır, bir şey söyleyeceğim.' },
  ];
  T['BK.zr'] = [
    { t: 'Hıııırrr...' },
    { t: 'Öööhh.' },
    { t: 'Gırrrgh.' },
    { t: 'Hrrrgh?' },
    { t: 'Aaaaarrrgh.' },
    { t: 'Mmmhhrrh...' },
    { t: 'Ghrrrr!' },
    { t: 'Hırrrg.' },
  ];
  T['BK.zreact'] = [
    { t: 'Anladım abi. Hiç anlamadım ama, anladım.', j: 1 },
    { t: 'Tamam tamam, not aldım. Sonra konuşuruz.' },
    { t: 'Bu konuşma biraz tek taraflı oldu.', j: 1 },
    { t: 'Hmm, katılıyorum. Ne dediğini bilmiyorum ama.' },
    { t: 'Sen de yalnızsın, anlıyorum.' },
    { t: 'Güzel cevap. Kısa, öz, anlaşılmaz.', j: 1 },
    { t: 'Off, sen de sıkılmışsın belli.' },
    { t: 'Tamam, sohbet bitti. Sağ ol abi.' },
    { t: 'Bunu nasıl yorumlamam gerekiyor abi?', j: 1 },
    { t: 'Konuşmamız yarım kaldı. Yarın yine gelirim.' },
  ];

  // ---------- no signal: talking to himself (self), Mom and Dad in his head ----------
  T['BK.self'] = [
    { t: 'Tamam Arda, plan yap. Plan: yürü.' },
    { t: 'Sinyal yok, sohbet de yok. Kendimle konuşurum.' },
    { t: 'Kendi kendime konuşmak normal mi? Normal, değil mi?' },
    { t: 'Sesli düşünüyorum. Kimse duymuyor ki.' },
    { t: 'Kendimle konuşuyorum. En azından cevap veriyorum.' },
    { t: 'Sakin ol. Panik enerji yakar, yürümek de.' },
    { t: 'Dürüm yarım kaldı. Hayatım da öyle.', j: 1 },
    { t: 'Bu yürüyüş bitince kimseye anlatmayacağım.' },
    { t: "Ataköy'de çay var mı? Yoksa boşuna mı yürüyorum?", j: 1 },
    { t: 'Ayaklarım yoruldu. Yorulmuş mu, yok mu? Yoruldu.' },
    { t: 'Etrafta kimse yok. Ben varım, o da yetiyor.' },
    { t: 'Yavaş yavaş. Acele eden dürümü yakar.' },
    { t: 'Bir ayak, bir ayak, bir ayak...' },
    { t: 'Radyo olsa iyi olurdu. Ya da Anne\'nin sesi.' },
    { t: 'Şarj yüzde on iki. Telefon benden önce ölecek.', j: 1 },
    { t: 'Hep aynı sokak, hep aynı zombi. Farklı kapılar.' },
    { t: 'Adımlarımı sayıyorum. Şu an dört bin sekiz yüz.' },
    { t: 'Burası Beyoğlu mu, Fatih mi? Ben de bilmiyorum.' },
    { t: "Pardon diyorum, zombi 'hhh' diyor. Anlaşamıyoruz.", j: 1 },
    { t: 'Bu dizide ben kimim? Başrol mü, figüran mı?' },
    { t: 'Zombi filmlerinde ilk ölen hep o. Ben olmam.', j: 1 },
    { t: 'Pardon, afiyet olsun, teşekkür. Hep böyleyim.', j: 1 },
    { t: 'Kulaklığım yok. Kendi müziğimi yapıyorum.' },
    { t: "İstanbul'da trafik yok, ben yürüyorum. Rekor sayılır.", j: 1 },
    { t: 'Acaba Dede şimdi balık tutuyor mu?' },
    { t: 'Yürürken düşünüyorum, düşünürken yürüyorum.' },
    { t: 'Bir su bulsam. Şu an bir damlası bile lüks.' },
    { t: 'Bu hikâyeyi bir gün dizi yaparlar.' },
    { t: "Ev sahibi arasa 'kira?' derdi. 'Ayakta kalırsam' derim.", j: 1 },
  ];
  T['BK.mom'] = [
    { t: "Anne 'mont giy' derdi. Haklıydı, ama ısırığa işe yaramaz.", j: 1 },
    { t: "Anne 'yemek yedin mi?' derdi. Dürüm yedim, sayılır mı?", j: 1 },
    { t: "Anne bu yürüyüşü görse 'taksiye bin' derdi. Taksi de zombi.", j: 1 },
    { t: "Anne 'kulaklarını temizle' derdi. Duymak için." },
    { t: "Anne 'ayakkabını bağla' derdi. Bağlıyorum, merak etme." },
    { t: 'Anne ağlar, sonra da bana pilav koyardı.', j: 1 },
    { t: "Anne 'kapıyı kilitle' derdi. Kilit de kalmadı artık." },
    { t: 'Anne, sana dürüm gönderemem ama düşünüyorum.' },
    { t: "Anne 'yabancıyla konuşma' derdi. Yabancı yok ki." },
    { t: "Anne 'boş konuşma' derdi. Ama burada sessizlik var." },
  ];
  T['BK.dad'] = [
    { t: 'Babam bu yolu hesaplardı. Ben sadece yürüyorum.' },
    { t: "Baba 'önce ölç, sonra kes' derdi. Ben kaçıyorum.", j: 1 },
    { t: 'Baba mühendis, plan yapmam lazım. Of be.' },
    { t: 'Babamın cebinde hep kalem olurdu. Bende bıçak.', j: 1 },
    { t: 'Babam beni tamir etmeye çalışırdı. Hâlâ devam.' },
    { t: "Baba 'herkes kazanır' derdi. Zombiler hariç.", j: 1 },
    { t: 'Dede burada olsa balık tutardı. Zombiler de balık.' },
    { t: "Baba 'sabırlı ol' derdi. Olmaya çalışıyorum." },
    { t: 'Baba, kuzeyde neler gördün?' },
  ];

  // ---------- hood entry (stage 1) and landmarks (stages 2-5), 20 hoods ----------
  // H01 İstiklal
  T['BK.hd01.1'] = [
    { t: 'İstiklal. Turistler gitti, zombiler geldi.', j: 1 },
    { t: "Tünel'den çıktım, çiseliyor. Şemsiye de yok." },
    { t: 'Bu caddede hep kalabalık vardı. Şimdi bana dönüyor.' },
  ];
  T['BK.hd01.2'] = [
    { t: 'Tramvay yolu kapalı. Trafik bile durmuş.' },
    { t: 'Pasajın ağzında kestane kokusu. Kestaneci yok.' },
    { t: 'Her köşe bir kafeydi. Şimdi her köşe bir zombi.', j: 1 },
  ];
  T['BK.hd01.3'] = [
    { t: 'Sokak lambaları birer birer sönüyor. Elektrik de pes etti.', j: 1 },
    { t: 'Durakta bekleyen var. Otobüs değil, zombi bekliyor.' },
    { t: 'Lambalar söndükçe sesler yakınlaşıyor.' },
  ];
  T['BK.hd01.4'] = [
    { t: 'Tramvay telleri başımızın üstünde. Kafama düşmesin.' },
    { t: 'Yağmur hafif, teller sarkmış. Hava da kötü.' },
    { t: 'Telden kıvılcım yağıyor. Şemsiye bile işe yaramaz.', j: 1 },
  ];
  T['BK.hd01.5'] = [
    { t: "Vatman'ın tramvayı devrilmiş. Bilet kesen de yok.", j: 1 },
    { t: 'Tramvay raydan çıkmış. Sis de üstüne oturmuş.' },
    { t: "Vatman'ın koltuğu boş. Dikkat, o hâlâ burada." },
  ];
  // H02 Galata
  T['BK.hd02.1'] = [
    { t: "Galata'nın merdivenleri. Yorgunluk da var, zombi de." },
    { t: "Merdiven bitmiyor. Galata'da merdiven hiç bitmez.", j: 1 },
    { t: 'Taş basamaklar kaygan. Bu merdivende hep dikkat.' },
  ];
  T['BK.hd02.2'] = [
    { t: 'Meyhane masası kurulu, rakı yok. Bu bir tür perhiz.', j: 1 },
    { t: 'Tavla tahtası hâlâ açık. Zarlar yuvarlanmış.' },
    { t: 'Meyhanenin lambası yanıyor. Kimse içeri girmiyor.' },
  ];
  T['BK.hd02.3'] = [
    { t: 'Rehber hâlâ anlatıyor. Ben zorla dinliyorum.', j: 1 },
    { t: 'Rehberin şemsiyesi havada. Grup onu takip ediyor.' },
    { t: 'Rüzgârda rehberin sesi her yerden geliyor.' },
  ];
  T['BK.hd02.4'] = [
    { t: 'Merdivenden sel gibi iniyorlar. Fenerler de sallanıyor.' },
    { t: 'Turist grubu merdivenden iniyor. Hepsi aynı yöne.' },
    { t: 'Fener ışığında daha kalabalık görünüyorlar.' },
  ];
  T['BK.hd02.5'] = [
    { t: "Kule arkada. Anne 'çıkma' demişti, çıkmıyorum.", j: 1 },
    { t: 'Rüzgâr soğuk. Mont bile yetmiyor.' },
    { t: 'Kulenin gölgesi uzun. Burada bitirelim bu işi.' },
  ];
  // H03 Karaköy
  T['BK.hd03.1'] = [
    { t: 'Üçüncü dalga kahve kapalı. Tatlı bir ironi.', j: 1 },
    { t: 'Kafe terası boş. Sandalyeler hâlâ yerinde.' },
    { t: 'Karaköy kafeleri hep kapalı, bugün de öyle.' },
  ];
  T['BK.hd03.2'] = [
    { t: 'İskelenin tahtası kaygan. Denize düşmek çözüm değil.' },
    { t: 'Deniz rüzgârı burada hiç durmuyor.' },
    { t: 'Vapur iskelesi boş. Son vapuru kaçırdık galiba.' },
  ];
  T['BK.hd03.3'] = [
    { t: 'Düğün konvoyu geliyor. Gelinin buketinden kaçacağım.', j: 1 },
    { t: 'Kağıt fenerler sallanıyor. Düğün bitince ne olacak?' },
    { t: 'Konvoyun kornası kulağımda. Kim evleniyor, bilmiyorum.' },
  ];
  T['BK.hd03.4'] = [
    { t: 'Gaz tüpleri sıralanmış. Birinin patlamasını istemem.' },
    { t: 'Kafenin arkası gaz kokuyor. Kibrit yakmayın.' },
    { t: 'Tüpler birbirine yakın. Bu sokak zincirleme tehlike.' },
  ];
  T['BK.hd03.5'] = [
    { t: 'Kafenin lambası yanıyor. Biri beni bekliyor gibi.' },
    { t: 'Kafenin içi sıcak. Dışarısı soğuk. Bu iş böyle.' },
    { t: 'Bu sıcak ışık, bu kadar kötü bir gecede bile iyi.' },
  ];
  // H04 Galata Köprüsü
  T['BK.hd04.1'] = [
    { t: 'Balıkçılar hâlâ oltasında. Balık yok, zombi var.', j: 1 },
    { t: 'Köprünün üst katında kimse yok. Sadece oltalar.' },
    { t: 'Köprü demir, ayaklarım da. İkisi de yoruldu.' },
  ];
  T['BK.hd04.2'] = [
    { t: 'Oltalar ayağa dolanıyor. Balık benim galiba.', j: 1 },
    { t: 'Sis yükseliyor. Korkuluğa tutunup yürüyorum.' },
    { t: 'Boğazdan sis geliyor. Vapur düdüğü yok.' },
  ];
  T['BK.hd04.3'] = [
    { t: 'Sisin içinde biri bana bakıyor. Zombi mi, insan mı?' },
    { t: 'Olta iplerini kesmek lazım, yoksa çeker.' },
    { t: 'İp uzanıyor, bir ucu zombinin elinde.' },
  ];
  T['BK.hd04.4'] = [
    { t: 'Sis yükseliyor. Bu tam bir dizi sahnesi.', j: 1 },
    { t: 'Sis kalınlaşıyor. Her iki yandan geliyorlar.' },
    { t: 'Boğazdan düdük sesi. Kim çalıyor?' },
  ];
  T['BK.hd04.5'] = [
    { t: 'Köprünün ortası. Yarısı bitti, yarısı yetmez.' },
    { t: 'Alt katta balık lokantaları. Hepsi kapalı.' },
    { t: 'Alt kat sessiz. Sadece suyun sesi.' },
  ];
  // H05 Eminönü
  T['BK.hd05.1'] = [
    { t: 'Eminönü! Baharat kokusu mu, zombi kokusu mu?', j: 1 },
    { t: 'Balık-ekmek tekneleri bağlı. Kimse satmıyor.' },
    { t: 'İskele kalabalık. Vapurun düdüğü de yok.' },
  ];
  T['BK.hd05.2'] = [
    { t: 'Vapurlar düdük çalıyor. İyi yolculuklar, o zaman.', j: 1 },
    { t: 'Sumak kokusu burnumu yakıyor. Gözlerim yanıyor.' },
    { t: 'Çuvallar yere dökülmüş. Baharat yollarda.' },
  ];
  T['BK.hd05.3'] = [
    { t: 'Martılar bile benden korkuyor. Ya da simidi istiyor.', j: 1 },
    { t: 'Biber bulutu! Gözünü kapat, hemen geçer.' },
    { t: 'Biber kokusu öksürtüyor. Zombiler de öksürsün.' },
  ];
  T['BK.hd05.4'] = [
    { t: 'İskele eğiliyor. Suya kaymadan geçelim.' },
    { t: 'Güvercinler yine orada. Onlara bir şey demem.' },
    { t: 'Zemin kayıyor. Zombiler de sürükleniyor.' },
  ];
  T['BK.hd05.5'] = [
    { t: 'Balık-ekmek tekneleri. Bana bir tane? Yok artık.', j: 1 },
    { t: 'Tekne ışıkları yanıyor. Kaptan nerede?' },
    { t: 'Kaptanın kendisi de burada, bize doğru geliyor.' },
  ];
  // H06 Sirkeci
  T['BK.hd06.1'] = [
    { t: "Sirkeci'nin saati ya yanlış ya durmuş.", j: 1 },
    { t: 'Garın önü boş. Taksi de yok, taksici de.' },
    { t: 'Büyük saatin tıkırtısı duyuluyor. Ya da bana öyle geliyor.' },
  ];
  T['BK.hd06.2'] = [
    { t: 'Bankların hepsi dolu. Bu şehirde oturmak da zor.', j: 1 },
    { t: 'Bekleme salonu sessiz. Tren düdüğü yok.' },
    { t: 'Kemerlerin altında yankı var. Adımlarım yankılanıyor.' },
  ];
  T['BK.hd06.3'] = [
    { t: 'Turnike açık mı kapalı mı? İkisi de kötü.', j: 1 },
    { t: 'Floresanlar yanıp sönüyor. Gözüm dönüyor.' },
    { t: 'Turnikenin kolunu itmeden geçemiyorum.' },
  ];
  T['BK.hd06.4'] = [
    { t: "Biletçi 'bilet yok' diyor. Ben de 'zaten yok' diyorum.", j: 1 },
    { t: 'Sıra uzadıkça sıra bitmiyor. Zombiler de sıraya girdi.' },
    { t: 'Kuyruğun sonu yok. Ya da başı bize dönük.' },
  ];
  T['BK.hd06.5'] = [
    { t: "Buradan çıkarsam 'bilet' diye yakalarlar mı?" },
    { t: 'Tren tabelası hiçbir yere gitmiyor artık.' },
    { t: 'Saat durmuş. Bizim de durması gerekiyor mu?' },
  ];
  // H07 Kapalıçarşı
  T['BK.hd07.1'] = [
    { t: 'Kapalıçarşı. Pazarlık yapmadan çıkamam buradan.', j: 1 },
    { t: 'Kemerlerin altı serin. Lokumun kokusu geliyor.' },
    { t: 'Kapıdaki kepenkler yarı açık. İçerisi karanlık.' },
  ];
  T['BK.hd07.2'] = [
    { t: 'Kilimler hep bir yerden bana bakıyor.' },
    { t: 'Tezgâhlarda gümüş, kilim, bakır. Hepsi kapalı.' },
    { t: 'Çaydanlıklar hâlâ sıcak mı? Bakmaya korkuyorum.' },
  ];
  T['BK.hd07.3'] = [
    { t: 'Tezgâhın arkasında biri var. Pazarlık zamanı mı?', j: 1 },
    { t: 'Dar sokaklar, arkamda kepenk. Dönüş yok.' },
    { t: 'Labirentten çıkış yok gibi. Dikkatli yürü.' },
  ];
  T['BK.hd07.4'] = [
    { t: "Kepenkte 'açmayın' yazıyor. Yazılmış, yani gerçek.", j: 1 },
    { t: 'Tezgâhlar dar geçit yapıyor. Biri sıkışabilir.' },
    { t: 'Kepenkteki el yazısı ciddi. Ünlem bile yok.' },
  ];
  T['BK.hd07.5'] = [
    { t: 'Halı Golem! Pazarlığı o yapsın, ben kaçıyorum.', j: 1 },
    { t: 'Halılar sarılı. İçinde ne var, açmak istemiyorum.' },
    { t: 'Son fiyat abla! Son fiyat zombi için de geçerli mi?', j: 1 },
  ];
  // H08 Beyazıt
  T['BK.hd08.1'] = [
    { t: 'Beyazıt. Kitapçılar açık ama kimse okumuyor.', j: 1 },
    { t: 'Sahaflar kitap kolileri yerde. Sayfaları uçuyor.' },
    { t: 'Kitap kokusu var. Bu sokakta hep kitap vardı.' },
  ];
  T['BK.hd08.2'] = [
    { t: 'Güvercinler yine uçuyor. Hep bilgiçler.', j: 1 },
    { t: 'Meydan kalabalık. Güvercinler her yerde.' },
    { t: 'Üniversite kapısının önünde bekliyoruz.' },
  ];
  T['BK.hd08.3'] = [
    { t: "'Bugün kapalı' tabelası. Açık kalan tek şey zombi.", j: 1 },
    { t: 'Güvercinler yola yayıldı. Geçmek için izin istemem lazım.' },
    { t: 'Kuş sürüsü yolu kesiyor. Sabırla bekliyorum.' },
  ];
  T['BK.hd08.4'] = [
    { t: 'Burada öğrenciler kahve içerdi. Ben de içerdim.' },
    { t: 'Kitapçıda ateş var. Kitaplar yanıyor, ne acı.' },
    { t: 'Kitapların kokusu dumana karıştı. Çok üzücü.' },
  ];
  T['BK.hd08.5'] = [
    { t: 'Güvercinci kuşlarını hâlâ besliyor. Saygı duyuyorum.' },
    { t: 'Tek lamba yanıyor. Herkes ona doğru.' },
    { t: 'Güvercinci yem torbasını açtı. Hepsi ona geliyor.' },
  ];
  // H09 Laleli
  T['BK.hd09.1'] = [
    { t: 'Laleli! Her vitrinde bir manken, her birinde bir soru.', j: 1 },
    { t: 'Koliler yığılmış. Tezgâhlar kapalı, kepenkler indi.' },
    { t: 'Sokak lambası turuncu. Her yer de öyle.' },
  ];
  T['BK.hd09.2'] = [
    { t: 'Manken bana bakıyor. Ben de ona bakıyorum.', j: 1 },
    { t: 'Koli yığınları dar bir yol bırakmış.' },
    { t: 'Kolilerin arkasında bir şey hareket ediyor.' },
  ];
  T['BK.hd09.3'] = [
    { t: 'Kıpırdadı! Hepsi kıpırdadı!' },
    { t: 'Vitrindeki manken yavaşça dönüyor.' },
    { t: 'Üç metre, üç metre! Kimse yaklaşmasın.' },
  ];
  T['BK.hd09.4'] = [
    { t: 'Kumaş balyaları hep bir şeyleri saklıyor.' },
    { t: 'Kumaşların arkasında gölge var. Sayıyorum.' },
    { t: 'Bu sokak bitmiyor. Kumaş, kumaş, kumaş.' },
  ];
  T['BK.hd09.5'] = [
    { t: 'Toptancı! Valizin içinde ne var, merak ettim.', j: 1 },
    { t: 'Sandıklar üst üste. Biri bana fırlatacak.' },
    { t: 'Toptancı kapının arkasından çıktı. Sakin ol Arda.' },
  ];
  // H10 Aksaray
  T['BK.hd10.1'] = [
    { t: 'Dolmuşlar yolda kalmış. Hepsi yolcu bekliyor.' },
    { t: 'Durakta bekleyen var, otobüs yok.' },
    { t: 'Trafik konisi her yerde. Yol bitmez.' },
  ];
  T['BK.hd10.2'] = [
    { t: 'Dolmuş kornası! Ben binmiyorum.', j: 1 },
    { t: 'Meydan kalabalık. Hepsi arabaya binmek istiyor.' },
    { t: "Aksaray'ın meydanı, bütün yollar buradan geçer." },
  ];
  T['BK.hd10.3'] = [
    { t: 'Pide fırını yanıyor. Ekmek kokusu da bir silah.', j: 1 },
    { t: 'Dolmuşlar yavaş geçiyor. Kapılar açık.' },
    { t: 'Şerit değiştirmek bile zor. Sıkışık.' },
  ];
  T['BK.hd10.4'] = [
    { t: 'Kebap kokusu geliyor. Biri hâlâ ızgara yapıyor.' },
    { t: 'Fırının kapısı kapalı. Ocak hâlâ sıcak.' },
    { t: 'Burada biraz dinlenelim. Kimse saldırmıyor.' },
  ];
  T['BK.hd10.5'] = [
    { t: "Dolmuşçu 'atla abi' diyor. Atlamadım.", j: 1 },
    { t: 'Korna sesi duyuluyor. Sağa dönün, geçin.' },
    { t: 'Kavşak tıkalı. Dolmuşçu bile yerinden çıkamıyor.' },
  ];
  // H11 Kumkapı
  T['BK.hd11.1'] = [
    { t: 'Kumkapı! Balıklar buzda, zombiler de bekliyor.', j: 1 },
    { t: 'Restoranların ışıkları yanıyor, müzik çalıyor.' },
    { t: 'Deniz kokusu sokağa kadar geliyor.' },
  ];
  T['BK.hd11.2'] = [
    { t: 'Meze masası kurulu. Rakı yok, o yüzden dikkatliyim.', j: 1 },
    { t: 'Sis kıyıya çöküyor. Denizin sesi çok yakın.' },
    { t: 'Rıhtımda tekneler sallanıyor. Dikkat et.' },
  ];
  T['BK.hd11.3'] = [
    { t: 'Müzik hâlâ çalıyor. Kim kapatacak şu sesi?', j: 1 },
    { t: 'Buz arabası yolda. Buzlar eriyor, dikkat.' },
    { t: 'Buz sandıkları ağır. Birini düşürmek istemem.' },
  ];
  T['BK.hd11.4'] = [
    { t: 'Deniz kokusu güzel. Zombi kokusu bozuyor.' },
    { t: 'Bir saz sesi geliyor. Aynı parça, hep aynı.' },
    { t: 'Müzisyen kafasını sallıyor, hiç durmuyor.' },
  ];
  T['BK.hd11.5'] = [
    { t: 'Balık Hamalı! Balık gibi kokuyor, sandığı bırakmıyor.', j: 1 },
    { t: 'Rıhtımın sonu. Önümde deniz, arkamda zombi.' },
    { t: 'Sandık dolu. Zombi de dolu. Hiç boş yok.' },
  ];
  // H12 Yenikapı
  T['BK.hd12.1'] = [
    { t: "Yenikapı'nın altı karanlık. Fener de zayıf." },
    { t: 'Merdivenin başında biri duruyor. Hareket etmiyor.' },
    { t: 'Tünelde sesler yankılanıyor. Sessiz ol.' },
  ];
  T['BK.hd12.2'] = [
    { t: 'Yürüyen merdiven durmuş. Yürüyorum o zaman.', j: 1 },
    { t: 'Fener ışığı altı metre. Ötesi yok.' },
    { t: 'Bilet gişesi kapalı. Kapılar açık.' },
  ];
  T['BK.hd12.3'] = [
    { t: 'Telefonda bir çubuk var... Yok, yanılmışım.' },
    { t: 'Elektrikler kesildi. Her yer zifiri karanlık.' },
    { t: 'Karanlıkta sadece ayak sesleri. Benimkiler.' },
  ];
  T['BK.hd12.4'] = [
    { t: 'Tünel yankı yapıyor. Sesimi kısayım.' },
    { t: 'Merdiven sıra sıra. Her basamakta biri var.' },
    { t: 'Sıra sıra dizilmişler. Basamakları sayıyorum.' },
  ];
  T['BK.hd12.5'] = [
    { t: 'Akşam Kalabalığı! Hepsi aynı treni yakalamak istiyor.', j: 1 },
    { t: 'Peron kalabalık. Fener her yere yetmiyor.' },
    { t: 'Herkes aynı yere bakıyor. Benim yüzüme.' },
  ];
  // H13 Samatya
  T['BK.hd13.1'] = [
    { t: 'Samatya sabahı. Denize bakıyorum, zombilere değil.', j: 1 },
    { t: 'Sahil yolu serin. Gün ağarıyor.' },
    { t: 'Deniz sakin. Sadece dalgaların sesi var.' },
  ];
  T['BK.hd13.2'] = [
    { t: 'Battaniyeler yerde. Piknik yarıda kalmış.' },
    { t: 'Kırmızı kareli battaniye. Kim bıraktı?' },
    { t: 'Battaniyeye basmamaya çalışıyorum. Ayakkabım bozulmasın.' },
  ];
  T['BK.hd13.3'] = [
    { t: 'Kedi tıslıyor. Sabah kahvesi mi istiyor acaba?', j: 1 },
    { t: 'Güneş doğuyor. Zombiler de gölgeden çıkmıyor.' },
    { t: 'Kedi tıslıyor. Bir şey var demek ki.' },
  ];
  T['BK.hd13.4'] = [
    { t: 'Denize itince sürükleniyorlar. Hiç hoş değil.' },
    { t: 'Deniz duvarı yüksek. Kenarda durmayın.' },
    { t: 'Dalgalar yüksek. Dikkat, ayağım ıslanmasın.' },
  ];
  T['BK.hd13.5'] = [
    { t: 'Mangal Baba! Kömür şakaları bile kararmış.', j: 1 },
    { t: 'Mangal dumanı her yeri sardı. Nefes alamıyorum.' },
    { t: 'Duman arasından bir siluet. Ateş hâlâ yanıyor.' },
  ];
  // H14 Yedikule
  T['BK.hd14.1'] = [
    { t: 'Yedikule surları. Bu surlar bir kez tutmuştu.' },
    { t: 'Sur yolunda tek kişi yürüyebiliyor. Sıra sıra.' },
    { t: 'Sarmaşıklar her taşın arasına girmiş.' },
  ];
  T['BK.hd14.2'] = [
    { t: 'Bahçede çay masaları. Çay yok, zombi var.', j: 1 },
    { t: 'Bahçe çiçekli. Kimse sulamıyor.' },
    { t: 'Kuşlar ötüyor. Zombiler susuyor.' },
  ];
  T['BK.hd14.3'] = [
    { t: 'Anahtar lazım. Kapıcılık bu sefer bana kaldı.', j: 1 },
    { t: 'Üç anahtar. Kimde olduğunu bilmek zorundayız.' },
    { t: 'Anahtarlar dağılmış. Hangisi hangisi?' },
  ];
  T['BK.hd14.4'] = [
    { t: 'Çay masaları yolu kesiyor. Çay yok, masa bol.' },
    { t: 'Masaların arasından geçmek zor. Kenardan git.' },
    { t: 'Bahçe kapısı kilitli. Anahtarın yerini biliyoruz.' },
  ];
  T['BK.hd14.5'] = [
    { t: 'Anahtarcı! Halkası şıngırdıyor, kalbim de.' },
    { t: 'Kapı kapalı. Anahtar onda, o da bize bakıyor.' },
    { t: 'Anahtarcı kapının önünde. Bu kapıyı açmayacak.' },
  ];
  // H15 Zeytinburnu
  T['BK.hd15.1'] = [
    { t: 'Zeytinburnu. Bidonlar renkli ama kimse boyamıyor.', j: 1 },
    { t: 'Atölyeler sessiz. Makineler son kez çalışmış.' },
    { t: 'Kapı açık, içerisi kumaş kokuyor.' },
  ];
  T['BK.hd15.2'] = [
    { t: 'Konveyör bana yardım ediyor. Zorla ama yardım.', j: 1 },
    { t: 'Balyalar üst üste. Biri devrilirse sorun olur.' },
    { t: 'Bant kayıyor, ayakkabım kayıyor.' },
  ];
  T['BK.hd15.3'] = [
    { t: 'Boya kokusu başımı döndürüyor. Yeşil mi mor mu?', j: 1 },
    { t: 'Zombiler bantta hareket ediyor. Bant kendi kendine.' },
    { t: 'Bantta bir ayakkabı. Sahibi nerede?' },
  ];
  T['BK.hd15.4'] = [
    { t: 'Bidonlar patlamaya hazır. Ben de öyleyim.' },
    { t: 'Bidonlar üst üste. Bir tanesi yeter.' },
    { t: 'Bidon sırası uzun. Ateşe yaklaşmayın.' },
  ];
  T['BK.hd15.5'] = [
    { t: 'Boyacı Ustası mesaisini uzatmış. Fazla mesai var mı?', j: 1 },
    { t: 'Sis gibi boya dumanı. Usta da içinde.' },
    { t: 'Usta bağırıyor. Mesai bitmedi diyor.' },
  ];
  // H16 Kazlıçeşme
  T['BK.hd16.1'] = [
    { t: 'Kazlıçeşme. Çimler yeşil, sabah serin, zombiler ıslak.', j: 1 },
    { t: 'Sahil yolu uzun, kimse koşmuyor.' },
    { t: 'Deniz rüzgârı tuzlu. Burnumu ovuşturuyorum.' },
  ];
  T['BK.hd16.2'] = [
    { t: 'Fıskiyeler dönüyor. Hortumlar bile ayağa dolanıyor.', j: 1 },
    { t: 'Çimler ıslak. Her adımda suya basıyorum.' },
    { t: 'Bankta biri oturuyor. Başını kaldırmıyor.' },
  ];
  T['BK.hd16.3'] = [
    { t: 'Koşucular grup halinde. Ben de koşmak isterdim.', j: 1 },
    { t: 'Islak yolda elektrik çıtırdıyor. Dikkat.' },
    { t: 'Fıskiyeler yan yana. Bekle, sıra gelsin.' },
  ];
  T['BK.hd16.4'] = [
    { t: 'Bu güzel sabahta zombisiz bir kahvaltı olsa.' },
    { t: 'Koşucular paket halinde geliyor. Yan yana dur.' },
    { t: 'Dizlerim sızlıyor, deniz havası iyi geliyor.' },
  ];
  T['BK.hd16.5'] = [
    { t: 'Hortumcu! Hortum mu, silah mı? İkisi de.', j: 1 },
    { t: 'Hortumdan asit çıkıyor. Uzağa geçin.' },
    { t: 'Hortum uzanıyor. Ucunda biri var.' },
  ];
  // H17 Bakırköy Çarşı
  T['BK.hd17.1'] = [
    { t: 'Bakırköy Çarşısı. Alışveriş yok, sadece kaçış.', j: 1 },
    { t: 'Tavan camından toz huzmeleri iniyor.' },
    { t: 'Kepenkler yarı açık. Dükkânlar sessiz.' },
  ];
  T['BK.hd17.2'] = [
    { t: 'Eski lisemin yanındayım. Zil hâlâ çalıyor.' },
    { t: 'Dükkânlar kapalı. Vitrinde eski kıyafetler.' },
    { t: "Bu çarşı 90'larda da böyle pastel. Hiç değişmemiş." },
  ];
  T['BK.hd17.3'] = [
    { t: 'Okul zili çaldı. Yine geç kaldım.', j: 1 },
    { t: 'Zil çalınca zombiler dönüyor. Ne kadar disiplinli.', j: 1 },
    { t: 'Zil sesi kulağıma yapışıyor. Kapatın şunu.' },
  ];
  T['BK.hd17.4'] = [
    { t: 'Sınıfın penceresi açık. İçeride ders mi var?', j: 1 },
    { t: 'Çarşının kapıları kapanıyor. Hızlı olun!' },
    { t: 'Kepenk iniyor. Kimse kapıda kalmasın.' },
  ];
  T['BK.hd17.5'] = [
    { t: 'Müdür megafonu açtı. Kulaklık isterim.', j: 1 },
    { t: 'Müdürün kapısı kapalı. Arkasından bağırış geliyor.' },
    { t: 'Müdürün odası. Hep bu kapıda beklerdim.' },
  ];
  // H18 Bakırköy Sahil
  T['BK.hd18.1'] = [
    { t: 'Sahil yürüyüşü. Boş, sadece dondurma sesi var.', j: 1 },
    { t: 'Palmiyeler rüzgârda sallanıyor. Sakin bir sabah.' },
    { t: 'Bisiklet yolunda kimse yok. Zil de yok.' },
  ];
  T['BK.hd18.2'] = [
    { t: 'Bisiklet yolundan ters geliyorlar. Kural ihlali!', j: 1 },
    { t: 'Banklar sıra sıra, hepsi boş.' },
    { t: 'Bankta oturan biri. Dondurmasını yalıyor.' },
  ];
  T['BK.hd18.3'] = [
    { t: 'Dondurmacı zilini çalıyor. Her çalışta bir dalga.' },
    { t: 'Palmiyeler çok uzun. Mila buradan tırmanırdı.' },
    { t: 'Zil çalıyor. Ne zaman geleceğini biliyorum artık.' },
  ];
  T['BK.hd18.4'] = [
    { t: 'Deniz bize bakıyor. Biz de ona bakıyoruz.' },
    { t: 'Bisikletler devrilmiş. Pedal hâlâ dönüyor.' },
    { t: 'Bisiklet yolu kalabalık. Hepsi ters yönde.' },
  ];
  T['BK.hd18.5'] = [
    { t: 'Dondurmacı! Bir kaşık daha? Bedava mı?', j: 1 },
    { t: 'Arabanın kapağı açık. Soğuk duman çıkıyor.' },
    { t: 'Dondurmacı zilini bırakmıyor. Kafam uğulduyor.' },
  ];
  // H19 Ataköy Marina
  T['BK.hd19.1'] = [
    { t: 'Marina. Tekneler var, kaptanlar kaçmış.', j: 1 },
    { t: 'Direkler sabah ışığında parlıyor.' },
    { t: 'Yelken sesleri. Rüzgâr yok ama halatlar öter.' },
  ];
  T['BK.hd19.2'] = [
    { t: 'Tahtalar sallanıyor. Deniz tutması başladı.', j: 1 },
    { t: 'Pontonlar kayıyor. Her adım bir sürpriz.' },
    { t: 'Yüzen tahta. Dengeni koru.' },
  ];
  T['BK.hd19.3'] = [
    { t: 'Halatlar ağ gibi, zombiler balık gibi takılıyor.' },
    { t: 'Köprü dar. Biri düşerse hepimiz ıslanırız.' },
    { t: 'Pontonların altında dalga sesi. Dikkatli yürü.' },
  ];
  T['BK.hd19.4'] = [
    { t: 'Eve bir kilometre. Yanımda bir zombi daha.', j: 1 },
    { t: 'Halatlara takılan zombiler bağırıyor.' },
    { t: 'Halat ağı var. Zombiler takılınca kurtuluyoruz.' },
  ];
  T['BK.hd19.5'] = [
    { t: 'Yat sahibi! Yatı var, derdi de var galiba.', j: 1 },
    { t: 'Yatın güvertesinde biri var. Bizi görüyor.' },
    { t: 'Rıhtımdaki zincir sallanıyor. Yat sahibi geliyor.' },
  ];
  // H20 Ataköy
  T['BK.hd20.1'] = [
    { t: 'Ataköy. Bej binalar, mavi panjurlar. Evim burada.' },
    { t: 'Apartmanın kapısı tanıdık. Kapı kolu da öyle.' },
    { t: 'Lobiden kahve kokusu geliyor. Yok, yanılıyorum.' },
  ];
  T['BK.hd20.2'] = [
    { t: "Çamaşır ipleri. Anne burada da 'mont giy' derdi.", j: 1 },
    { t: 'Merdiven boşluğu uzun. Her katta bir kapı.' },
    { t: 'Kapı aralık. Balkondan ses geliyor.' },
  ];
  T['BK.hd20.3'] = [
    { t: "Fırının kokusu. Ahmet Abi'nin ekmeği sıcak mı?" },
    { t: 'Merdivenden çıkarken hep kapıcıyı selamlardım.' },
    { t: 'Bu merdivenleri her sabah koşarak inerdim.' },
  ];
  T['BK.hd20.4'] = [
    { t: "Kapıcı kulübesi kapalı. Ahmet Abi orada mı acaba?" },
    { t: 'Çamaşırlar hâlâ asılı. Kimse toplamamış.' },
    { t: 'Avlu sessiz. Kapıcının anahtarları yerde.' },
  ];
  T['BK.hd20.5'] = [
    { t: 'Ahmet Abi! Ekmek sepeti kalkan olur mu?' },
    { t: 'Ahmet Abi, bu ben, Arda.' },
    { t: 'Ahmet Abi... Ekmeği hâlâ sıcak mı?' },
  ];
  // Lane A environment barks (AUDIT-6 A2, A4, A5): native Turkish, plain first, jokes rare. Keys come from view/env-fx.js.
  T['BK.env.explode'] = [
    { t: 'Yere! Yere!' },
    { t: 'Kulaklarım çınlıyor ama hâlâ ayaktayım.' },
    { t: 'Araba gitti. Sigortacı bu akşam benimle konuşmak isteyecek.', j: 1 },
    { t: 'Bu sokağa kim tüp koymuş ya?' },
  ];
  T['BK.env.chain'] = [
    { t: 'Zincirleme! Biri bitince öteki başlıyor.' },
    { t: 'Domino gibi. Ama içinde gaz var.', j: 1 },
    { t: 'Bu sokakta kaç tane tüp var be?' },
    { t: 'Uzak dur, Arda. Uzak dur.' },
  ];
  T['BK.env.fuse'] = [
    { t: 'Araba yanıyor! Uzaklaş!' },
    { t: 'İki say, sonra koş.' },
    { t: 'Bu araba patlamaya hazırlanıyor.' },
  ];
  T['BK.env.shock'] = [
    { t: 'Kablo canlı! Suya basma.' },
    { t: 'Ayaklarım karıncalandı.' },
    { t: 'Su ile elektrik. Lise fiziği haklıymış.', j: 1 },
    { t: 'Islak zeminde durma. Durma!' },
  ];
  T['BK.env.door'] = [
    { t: 'Kapı açılıyor. Hazır ol.' },
    { t: 'Pencerede biri var.' },
    { t: 'Rögar kapağı kalkıyor.' },
    { t: 'Bu bina bana kin besliyor galiba.', j: 1 },
  ];
  T['BK.env.extinguish'] = [
    { t: 'Söndü. Bir saniye nefes alayım.' },
    { t: 'Köpük ateşi bastırdı.' },
    { t: 'Yangın tüpü bir kere işe yaradı.', j: 1 },
  ];
})(P.BarkPools.tr);

// v0.7 wave 2 (lane C): first-kill barks for the new common enemies (kurye, copci). barks.js H.kill plays BK.fk.<type> on the
// first kill of each type. Written natively in Turkish.
(function (T) {
  T['BK.fk.kurye'] = [
    { t: 'Scooter\'lı zombi! Siparişi bana getirdi sanki.', j: 1 },
    { t: 'Hızlıydı ama kâğıt gibi yırtıldı.' },
    { t: 'Kurye düştü. Bu akşam yemek soğuk kalacak.' },
  ];
  T['BK.fk.copci'] = [
    { t: 'Süpürgeli adam çöp kutusunu bana sürüyor!' },
    { t: 'Kutu yuvarlanıyor! Yoldan çekil!' },
    { t: 'Yere döküldü, sokak çöpe döndü.', j: 1 },
  ];
})(P.BarkPools.tr);

// v0.7 wave 3 (lane W): evolution barks for the new weapon evolutions, plus the two active skills (Simit Kalkanı, Çay Molası).
// Written natively in Turkish. barks.js has no skill hook yet, so the BK.skill.* pools wait for one.
(function (T) {
  // ---------- evolutions (new) ----------
  T['BK.evo.blacksmith'] = [
    { t: 'Demirci vuruşu! Her darbede biraz kendime geliyorum.' },
    { t: 'Her vuruşta bir parça can geri geliyor. Sabır işi bu.' },
    { t: 'Çekiç her inişte biraz can veriyor. Sağlık sigortası gibi.', j: 1 },
  ];
  T['BK.evo.stormshield'] = [
    { t: 'Şimşek kalkanı! Etrafımda dönüyor, yaklaşana çarpıyor.' },
    { t: 'Kaçarken bile çakıyor. Kalkan da benim gibi inatçı.' },
    { t: 'Kalkan elektrik gibi. Dokunmak için ayrı bir cesaret lazım.', j: 1 },
  ];
  T['BK.evo.foamstorm'] = [
    { t: 'Köpük fırtınası! Daha geniş, daha yapışkan bir koni.' },
    { t: 'Tükürük köpüğe takılıp düştü. Susturdum onu.' },
    { t: 'Köpük her yere yapıştı. Yaratıklar da, ben de.', j: 1 },
  ];
  T['BK.evo.netspear'] = [
    { t: 'Zıpkın ağı! Sabitlediklerim birbirine bağlandı.' },
    { t: 'Halatla bağladım. Şimdi tek tek değil, toplu uğraşırım.' },
    { t: 'Ağ çekildi, hepsi tek ipte. Okul gezisi gibi.', j: 1 },
  ];
  T['BK.evo.lake'] = [
    { t: 'Ateş gölü! Yanan birikintiler birleşti.' },
    { t: 'Alevler birbirine ulaştı. Artık yürüyerek geçemezsin.' },
    { t: 'Ateşten göl. Yüzme dersi için hiç uygun değil.', j: 1 },
  ];
  T['BK.evo.twinsaw'] = [
    { t: 'İkiz disk! İkisi yan yana uçuyor.' },
    { t: 'İki disk, yan yana. Biri sağa, biri sola.' },
    { t: 'İkisi aynı yolu açıyor. Ben de peşlerinden gidiyorum.' },
  ];
  T['BK.evo.fireball'] = [
    { t: 'Ateş topu! Gaz sonrası şişe artık topa dönüşüyor.' },
    { t: 'Şişe çarptı, sonra yuvarlandı. Hâlâ yanıyor.' },
    { t: 'Benzin şişesi bu kadar ciddi olmamalıydı.', j: 1 },
  ];
  T['BK.evo.arcchain'] = [
    { t: 'Elektrik zinciri! Zıplıyor, sıçrıyor, bulduğunu vuruyor.' },
    { t: 'Islak zeminde zincir daha uzağa gider. Ayaklarıma bak.' },
    { t: 'Zincir suya değince büyüyor. Basmadan önce iki kere bak.' },
  ];
  T['BK.evo.carbomb'] = [
    { t: 'Araba turu! Arabanın yanındaki tüp bu sefer büyük patladı.' },
    { t: 'Tüpten gelen ses bütün mahalleyi uyandırdı.' },
    { t: 'Park halindeki araba da havaya uçtu. Hafif bir tur olmadı.', j: 1 },
  ];
  T['BK.evo.forge'] = [
    { t: 'Ocak ağzı! Alev daha sıcak, yere de iz bırakıyor.' },
    { t: 'Yerde kara izler kaldı. Bu sokağı artık kimse kullanmaz.' },
    { t: 'Bu alev annemin ocağından daha sıcak. Ona söylemeyeceğim.', j: 1 },
  ];
  T['BK.evo.grinder'] = [
    { t: 'Öğütücü! Motor hiç durmuyor, dişler dönüyor.' },
    { t: 'Testere boğulmuyor artık. Her dokunuşta öğütme birikiyor.' },
    { t: 'Motor boğulmadı. Benim nefesim boğuldu, ama devam.', j: 1 },
  ];
  T['BK.evo.hookpull'] = [
    { t: 'Çeki halatı! Kanca tutunca yakındakiler de geliyor.' },
    { t: 'Kanca yapıştı. Gelsinler bakalım, hepsi bana.' },
    { t: 'Halat gerildi, yakındakiler bana doğru savruluyor.' },
  ];
  T['BK.evo.minibus'] = [
    { t: 'Minibüs kapısı! Kapanınca yakındakiler sersemliyor.' },
    { t: 'Kapı sertçe kapandı, yanımdakiler sersemledi.' },
    { t: 'Kapıyı çarptım. Dolmuşta olsa "Sıkıştık!" derlerdi.', j: 1 },
  ];

  // ---------- active skills (new) ----------
  T['BK.skill.shield'] = [
    { t: 'Simit tepsisi kalkan oldu. Üç saniye, bir darbe.' },
    { t: 'Tepsiyi kaldırdım. Darbe tepsiye geldi, bana değil.' },
    { t: 'Tepsiyi sıkı tut Arda. Üç saniye, sonra iner.' },
  ];
  T['BK.skill.tea'] = [
    { t: 'Çay molası. Bir yudum, biraz nefes, biraz can.' },
    { t: 'İnce belli bardak elimde. Kalabalık da yavaşladı.' },
    { t: 'Çay molası. Zombiler de biraz dinlendi, değil mi?', j: 1 },
  ];

  // ---------- v0.7 wave 2 (native): env breaks, side objectives, boss phases ----------
  T['BK.env.break'] = [
    { t: 'Cam kırıldı. Ayağına batmasın Arda.' },
    { t: 'Tahta çatladı. Yeni bir kısayol açıldı.' },
    { t: 'Ses geldi. Bakalım kim duydu.' },
    { t: 'Vitrin kırıldı. Bakkal bu akşam bana küsecek.', j: 1 },
  ];
  T['BK.obj.start'] = [
    { t: 'Yan görev de var. Koşarken bakarım.' },
    { t: 'Bunu da yaparsam bonus çıkar. Atlamayayım.' },
    { t: 'Ek iş çıktı. Kimse sormadı ama para veriyor.', j: 1 },
    { t: 'Yolda bir iş daha. Başım dik, gözüm açık.' },
  ];
  T['BK.obj.done'] = [
    { t: 'Oldu. Bonus cebimde.' },
    { t: 'Tamam, temiz ve hızlı.' },
    { t: 'Görev bitti. Kimse alkışlamadı. Ben alkışladım.', j: 1 },
    { t: 'Yan iş bitti. Şimdi sokağa dönüyorum.' },
  ];
  T['BK.obj.fail'] = [
    { t: 'Olmadı. Şimdi düşünme, koş.' },
    { t: 'Kaçtı. Bir dahakine daha hızlı.' },
    { t: 'Gitti, bonus da onunla. Sonra somurtacağım.', j: 1 },
  ];
  T['BK.boss.phase'] = [
    { t: 'Değişiyor! Dikkatli ol Arda, bitmedi.' },
    { t: 'İkinci nefes. Tam da ihtiyacım olan şeydi.' },
    { t: 'İkinci raund. Bana kimse söylememişti.', j: 1 },
  ];
  T['BK.ev.chest'] = [
    { t: 'Sandık! Sokağın ortasında duruyor. Kapmalıyım.' },
    { t: 'Yardım sandığı! Kalabalık gelmeden alayım.' },
    { t: 'Kaldırımda sandık mı olur? İstanbul\'da olur.', j: 1 },
  ];
  T['BK.evend.chest'] = [
    { t: 'Sandık açıldı. Fena değil.' },
    { t: 'İçindekini aldım. Yola devam.' },
    { t: 'İçinden bir çorap ve bir fener çıktı. Yine de sayılır.', j: 1 },
  ];
  T['BK.ev.pier'] = [
    { t: 'Vapur yanaştı. Herkes iskeleye birden koşuyor.' },
    { t: 'Vapur geldi. Bunlar doğrudan bize geliyor.' },
    { t: 'Sıraya girmediler. Zombiler sıra bilmez, belli ki.', j: 1 },
  ];
  T['BK.evend.pier'] = [
    { t: 'Vapur gitti. İskele yine sakin.' },
    { t: 'İskele boşaldı. Şimdilik.' },
    { t: 'Vapur kalkıyor. Kaptan bizi görmüş mü acaba?', j: 1 },
  ];
})(P.BarkPools.tr);
