// Strings for the replay tiers (R1-T4 part 18): Nightmare (Kâbus, per hood) and the Night Shift daily (Gece Vardiyası).
// TR primary, EN second. {placeholders} are filled by P.t(key, vars). Turkish lines marked "TR owner check" wait for the
// owner's sign-off on the names and the seed words (the mode names are proposals).
Object.assign(P.STR.tr, {
  'mode.nm.name': 'Kâbus', // TR owner check
  'mode.nm.line': 'Mod: {m}',
  'mode.nm.play': 'Kâbus · {L} oyna', // TR owner check
  'mode.toggle.normal': 'Normal',
  'mode.toggle.nm': 'Kâbus', // TR owner check
  'mode.toggle.hint': 'Kâbus, bölgenin tüm bölümleri Normal\'de bitince açılır.', // TR owner check
  'mode.toggle.aria': 'Oyun modu', // TR owner check
  'mode.hud': 'Kâbus', // TR owner check
  'mode.title': 'Gece Nöbetçisi', // TR owner check
  'mode.moon': 'Ay rozeti', // TR owner check
  'mode.moonHint': 'Bölgenin beş bölümünü Kâbus\'ta bitir: ay rozeti.', // TR owner check
  'mode.moonAria': 'Kâbus ay rozeti', // TR owner check
  'res.star4': 'Kâbus: hasarsız ve en düşük can {n}% veya üstü', // TR owner check
  'res.nm.cred': 'Sokak Kredisi', // TR owner check
  'res.nm.credV': 'x{n}', // TR owner check
  'res.nm.moon': 'Ay rozeti', // TR owner check
  'res.nm.moonV': 'kazanıldı', // TR owner check
  'res.nm.title': 'Ünvan', // TR owner check
  'res.ns.score': 'Skor', // TR owner check
  'res.ns.time': 'Süre', // TR owner check
  'res.ns.best': 'En iyi (bu cihaz)', // TR owner check
  'res.ns.today': 'Bugün en iyi', // TR owner check
  'res.ns.streak': 'Gün serisi', // TR owner check
  'res.ns.pay': 'Günün ilk turu', // TR owner check
  'res.ns.payV': '+{k} jeton', // TR owner check
  'ui.ns.done': 'VARDİYA TAMAM', // TR owner check
  'ui.ns.over': 'VARDİYA BİTTİ', // TR owner check
  'toast.moon': 'Ay rozeti kazanıldı: {h}', // TR owner check
  'toast.title': 'Ünvan açıldı: {t}', // TR owner check
  'ns.card.head': 'GECE VARDİYASI', // TR owner check
  'ns.card.seed': 'Vardiya: {name}', // TR owner check
  'ns.card.rota': 'Rota: {hood}', // TR owner check
  'ns.card.mods': 'Günün kuralları', // TR owner check
  'ns.card.best': 'Bugün en iyi: {n}', // TR owner check
  'ns.card.bestNone': 'Bugün henüz tur yok', // TR owner check
  'ns.card.streak': 'Gün serisi: {n}', // TR owner check
  'ns.card.play': 'Vardiyaya başla', // TR owner check
  'ns.card.again': 'Yeniden dene', // TR owner check
  'ns.card.closed': 'İlk bölgeyi bitir, vardiya açılsın.', // TR owner check
  'ns.card.desc': 'Tek tur, 12 dakika. Ölünce bir kez dirilirsin. Skor: hayatta kalma, öldürme ve Adrenalin.', // TR owner check
  'ns.card.pay': 'Günün ilk turu: +{k} jeton', // TR owner check
  'ns.name.a0': 'Sessiz', 'ns.name.a1': 'Kırmızı', 'ns.name.a2': 'Islak', 'ns.name.a3': 'Son', // TR owner check
  'ns.name.a4': 'Gece', 'ns.name.a5': 'Soğuk', 'ns.name.a6': 'Uzun', 'ns.name.a7': 'Sisli', // TR owner check
  'ns.name.n0': 'Liman', 'ns.name.n1': 'Kepenk', 'ns.name.n2': 'Sokak', 'ns.name.n3': 'Vapur', // TR owner check
  'ns.name.n4': 'Çarşı', 'ns.name.n5': 'Köprü', 'ns.name.n6': 'Fener', 'ns.name.n7': 'Kapı', // TR owner check
  // "Gece" is a noun, so the compound takes the possessive noun (Gece Kapısı). poss lists the adjective indexes that do; p<i> is the possessive noun.
  'ns.name.poss': '4', 'ns.name.p0': 'Limanı', 'ns.name.p1': 'Kepeği', 'ns.name.p2': 'Sokağı', 'ns.name.p3': 'Vapuru', // TR owner check
  'ns.name.p4': 'Çarşısı', 'ns.name.p5': 'Köprüsü', 'ns.name.p6': 'Feneri', 'ns.name.p7': 'Kapısı', // TR owner check
});
Object.assign(P.STR.en, {
  'mode.nm.name': 'Nightmare',
  'mode.nm.line': 'Mode: {m}',
  'mode.nm.play': 'Nightmare · play {L}',
  'mode.toggle.normal': 'Normal',
  'mode.toggle.nm': 'Nightmare',
  'mode.toggle.hint': 'Nightmare opens when every level of the district is cleared on Normal.',
  'mode.toggle.aria': 'Game mode',
  'mode.hud': 'Nightmare',
  'mode.title': 'Night Watch',
  'mode.moon': 'Moon badge',
  'mode.moonHint': 'Clear all five levels of the district on Nightmare: moon badge.',
  'mode.moonAria': 'Nightmare moon badge',
  'res.star4': 'Nightmare: no revive and lowest HP at {n}% or more',
  'res.nm.cred': 'Street Cred',
  'res.nm.credV': 'x{n}',
  'res.nm.moon': 'Moon badge',
  'res.nm.moonV': 'earned',
  'res.nm.title': 'Title',
  'res.ns.score': 'Score',
  'res.ns.time': 'Time',
  'res.ns.best': 'Best (this device)',
  'res.ns.today': 'Best today',
  'res.ns.streak': 'Day streak',
  'res.ns.pay': 'First run of the day',
  'res.ns.payV': '+{k} coins',
  'ui.ns.done': 'SHIFT COMPLETE',
  'ui.ns.over': 'SHIFT OVER',
  'toast.moon': 'Moon badge earned: {h}',
  'toast.title': 'Title unlocked: {t}',
  'ns.card.head': 'NIGHT SHIFT',
  'ns.card.seed': 'Shift: {name}',
  'ns.card.rota': 'Route: {hood}',
  'ns.card.mods': 'Today\'s rules',
  'ns.card.best': 'Best today: {n}',
  'ns.card.bestNone': 'No run yet today',
  'ns.card.streak': 'Day streak: {n}',
  'ns.card.play': 'Start the shift',
  'ns.card.again': 'Try again',
  'ns.card.closed': 'Clear the first district to open the shift.',
  'ns.card.desc': 'One run, 12 minutes. One revive if you fall. Score: survival, kills and Adrenaline.',
  'ns.card.pay': 'First run of the day: +{k} coins',
  'ns.name.a0': 'Quiet', 'ns.name.a1': 'Red', 'ns.name.a2': 'Wet', 'ns.name.a3': 'Last',
  'ns.name.a4': 'Night', 'ns.name.a5': 'Cold', 'ns.name.a6': 'Long', 'ns.name.a7': 'Foggy',
  'ns.name.n0': 'Harbour', 'ns.name.n1': 'Shutter', 'ns.name.n2': 'Street', 'ns.name.n3': 'Ferry',
  'ns.name.n4': 'Bazaar', 'ns.name.n5': 'Bridge', 'ns.name.n6': 'Lantern', 'ns.name.n7': 'Gate',
  'ns.name.poss': '-', 'ns.name.p0': 'Harbour', 'ns.name.p1': 'Shutter', 'ns.name.p2': 'Street', 'ns.name.p3': 'Ferry',
  'ns.name.p4': 'Bazaar', 'ns.name.p5': 'Bridge', 'ns.name.p6': 'Lantern', 'ns.name.p7': 'Gate',
});
