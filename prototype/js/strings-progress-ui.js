// Progress strings (T4 part 5): the Your power strip, the Street Cred meter, the level-up banner, the results recap and the
// next-unlock line. TR and EN. Terms (one meaning each; tools/test-progress-ui.js checks the tables):
//   Bölüm N / Level N  = journey level, 1 to 100 (the map node). Never a hood, never a chapter.
//   Aşama N / Stage N  = stage inside a district, 1 to 5 (stage 5 is the boss).
//   Bölge / District   = the hood (district) number, 1 to 20. The place name of a stage is its sub-location.
//   Lv N               = in-run level (resets each run) and item level. Level-up banner: "LEVEL UP · Lv N".
//   Sokak Kredisi / Street Cred (SK / SC) = the currency from kill milestones; it pays for Street Tree perks.
// Placeholders are {name}. Loaded after strings-horde.js (P.STR must exist).
if (P.STR) {
  Object.assign(P.STR.tr, {
    // The TR strings below are owner-approved (T4 part 9); "Bölüm" is the journey level (see the header note).
    'hud.skLabel': 'Sokak Kredisi {n}, sonraki için {k} öldür',
    'lvb.title': 'SEVİYE ATLA · Lv {n}',
    'lvb.line': 'Seçildi: {name} · Lv {n}',
    'lvb.lineF': 'Seçildi: {name}',
    'prog.powerLabel': 'Gücün',
    'prog.dmg': 'hasar +{v}%',
    'prog.hp': 'can +{v}%',
    'prog.perks': '{n} yetenek',
    'prog.gainDmg': '+{v}% hasar',
    'prog.gainHp': '+{v}% can',
    'prog.levelN': 'Bölüm {n}',
    'ui.res.labelLevel': 'BÖLÜM {n} · {hood}',
    'ui.res.walk': 'Yürüyüş',
    'res.recap.head': 'KOŞU ÖZETİ',
    'res.recap.reached': 'Ulaşılan Lv {n} · {kills} öldürme · en iyi seri {streak}',
    'res.recap.sc': 'Sokak Kredisi',
    'res.recap.scVal': '+{n} · sonraki için {k} öldür',
    'res.recap.power': 'Güç',
    'res.recap.noPower': 'Yeni bölge yok',
    'res.recap.next': 'Sonraki',
    'res.recap.retry': '{unlock} (tekrar)',
    'hc.next': 'SONRAKİ: {unlock}',
  });
  Object.assign(P.STR.en, {
    'hud.skLabel': 'Street Cred {n}, {k} kills to the next',
    'lvb.title': 'LEVEL UP · Lv {n}',
    'lvb.line': 'Picked: {name} · Lv {n}',
    'lvb.lineF': 'Picked: {name}',
    'prog.powerLabel': 'Your power',
    'prog.dmg': 'damage +{v}%',
    'prog.hp': 'HP +{v}%',
    'prog.perks': '{n} perks',
    'prog.gainDmg': '+{v}% damage',
    'prog.gainHp': '+{v}% HP',
    'prog.levelN': 'Level {n}',
    'ui.res.labelLevel': 'LEVEL {n} · {hood}',
    'ui.res.walk': 'Walk',
    'res.recap.head': 'RUN RECAP',
    'res.recap.reached': 'Reached Lv {n} · {kills} kills · best streak {streak}',
    'res.recap.sc': 'Street Cred',
    'res.recap.scVal': '+{n} · {k} kills to next',
    'res.recap.power': 'Power',
    'res.recap.noPower': 'No new district',
    'res.recap.next': 'Next',
    'res.recap.retry': '{unlock} (retry)',
    'hc.next': 'NEXT: {unlock}',
  });
}
