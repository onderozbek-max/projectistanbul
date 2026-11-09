// Chapter 1 arrival, Turkish (native, not translated): the walk into Ataköy, the comic (FINa*, FINb*) and the
// "Bölüm 1 tamam" card (fin.*). Line format: [speaker key, text]; speakers match strings-story.js (spk.arda, spk.anne,
// spk.baba, spk.mila, spk.cap). The EN file has the same ids. Loaded by finale-data.js, which merges both into P.LINES / P.STR.
P.FinaleLang = P.FinaleLang || {};
P.FinaleLang.tr = {
  lines: {
    FINa1: ["spk.cap", "Ataköy. Bej cepheler, mavi panjurlar, ipte kuruyan çamaşırlar. Ahmet Abi'nin kulübesi boş. Ekmek sepeti de. Kaan görse sepetin dibine kadar bakardı."],
    FINa2: ["spk.cap", "Üçüncü kat. Balkonun ışığı yanıyor. Anne geç kaldığımda hep böyle yapardı."],
    FINa3: ["spk.arda", "Kimse yok. Ama ışık yanıyor."],
    FINa4: ["spk.arda", "Anne? Duyuyor musun? Apartmanın önündeyim."],
    FINa5: ["spk.anne", "Oğlum! Sesin çok net. Ayakkabılarını kapıda çıkar, halıya basma."],
    FINb1: ["spk.cap", "Mutfak masasında, iki kurumuş bardağın arasında bir zarf. Babamın el yazısı."],
    FINb2: ["spk.anne", "Ev boş, biliyorum. Mektup masada oğlum. Oku, sonra konuşuruz."],
    FINb3: ["spk.baba", "Oğlum, Anne ve Dede Sarıyer'de, Dede'nin evinde. Otoyollardan uzak dur."],
    FINb4: ["spk.baba", "Radyo kuzeydeki orman hakkında ne derse desin, oradan uzak dur."],
    FINb5: ["spk.baba", "Seni seviyorum. Baban."],
    FINb6: ["spk.cap", "Kapı çalındı."],
    FINb7: ["spk.arda", "Kim o?!"],
    FINb8: ["spk.mila", "Arda! Sarıyer'e gidiyorsun, değil mi? Ailemin güvenli evi Zekeriyaköy'de, Sarıyer'in hemen yanında. Ben de oraya gidiyorum."],
    FINb9: ["spk.cap", "Ataköy'de yürüyüş bitti. Sarıyer'e yol şimdi başlıyor."]
  },
  ui: {
    'cm.tag.arrival': 'EVE VARIŞ',
    'cm.sfx.tak': 'TAK TAK!',
    'fin.approach.title': 'ATAKÖY',
    'fin.approach.km': '{a} / {b} km',
    'fin.approach.hint': 'Kapıya doğru yürü',
    'fin.approach.hintTouch': 'Sürükleyerek yürü',
    'fin.credits.kicker': 'BÖLÜM 1 TAMAM',
    'fin.credits.title': 'EVE DÖNÜŞ',
    'fin.credits.route': 'Taksim → Ataköy · 17 km · 100 bölüm',
    'fin.stat.km': 'yürüyüş',
    'fin.stat.levels': 'bölüm',
    'fin.stat.hoods': 'mahalle',
    'fin.stat.kills': 'zombi (toplam)',
    'fin.stat.bosses': 'mahalle patronu',
    'fin.stat.runKills': 'zombi (bu bölüm)',
    'fin.stat.runTime': 'süre (bu bölüm)',
    'fin.next.kicker': 'SONRAKİ',
    'fin.next.text': 'Bölüm 2 · Şarj Bitmeden: Mila ile Sarıyer ve Zekeriyaköy\'ye.',
    'fin.credits.note': 'Prototip · Project Istanbul. Ses, müzik ve metinler taslak.',
    'fin.credits.go': 'Devam',
    'fin.credits.hint': 'Sonuçlara geçmek için dokun'
  }
};
