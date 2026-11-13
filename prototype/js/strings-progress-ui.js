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
    'hud.skLabel': 'Sokak Kredisi {n}, sonraki için {k} öldürme', // TR owner check
    'lvb.title': 'SEVİYE ATLA · Lv {n}', // TR owner check: level-up banner title
    'lvb.line': 'Seçildi: {name} · Lv {n}', // TR owner check
    'lvb.lineF': 'Seçildi: {name}', // TR owner check
    'prog.powerLabel': 'Gücün', // TR owner check: "your power" strip label
    'prog.dmg': 'hasar +{v}%', // TR owner check
    'prog.hp': 'can +{v}%', // TR owner check
    'prog.perks': '{n} yetenek', // TR owner check: Street Tree perks
    'prog.gainDmg': '+{v}% hasar', // TR owner check
    'prog.gainHp': '+{v}% can', // TR owner check
    'prog.levelN': 'Bölüm {n}', // TR owner check: journey level, see the header note on Bölüm
    'ui.res.labelLevel': 'BÖLÜM {n} · {hood}', // TR owner check
    'ui.res.walk': 'Yürüyüş', // TR owner check
    'res.recap.head': 'KOŞU ÖZETİ', // TR owner check
    'res.recap.reached': 'Ulaşılan Lv {n} · {kills} öldürme · en iyi seri {streak}', // TR owner check
    'res.recap.sc': 'Sokak Kredisi', // TR owner check
    'res.recap.scVal': '+{n} · sonraki için {k} öldürme', // TR owner check
    'res.recap.power': 'Güç', // TR owner check
    'res.recap.noPower': 'Yeni bölge yok', // TR owner check
    'res.recap.next': 'Sonraki', // TR owner check
    'res.recap.retry': '{unlock} (tekrar)', // TR owner check
    'hc.next': 'SONRAKİ: {unlock}', // TR owner check: hood card, the next unlock
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
