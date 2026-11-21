// Progress strings (T4 part 5): the Your power strip, the Street Cred meter, the level-up banner, the results recap and the
// next-unlock line. TR and EN. Terms (one meaning each; tools/test-progress-ui.js checks the tables):
//   Bölüm N / Level N  = journey level, 1 to 100 (the map node). Never a hood, never a chapter.
//   Aşama N / Stage N  = stage inside a district, 1 to 5 (stage 5 is the boss).
//   Bölge / District   = the hood (district) number, 1 to 20. The place name of a stage is its sub-location.
//   Lv N               = item level only (weapon, passive, gear, mod). The in-run level is Adrenalin (EN Adrenaline), so it
//                        never reads "Lv": the HUD chip, the level-up banner and cards, and the recap say Adrenalin N.
//   Sokak Kredisi / Street Cred (SK / SC) = the currency from kill milestones; it pays for Street Tree perks.
// Placeholders are {name}. Loaded after strings-horde.js (P.STR must exist).
if (P.STR) {
  Object.assign(P.STR.tr, {
    // The TR strings below are owner-approved (T4 part 9); "Bölüm" is the journey level (see the header note). The two Adrenalin
    // rename lines (lvb.title, res.recap.reached) are marked for the owner and wait for sign-off.
    'hud.skLabel': 'Sokak Kredisi {n}, sonraki için {k} öldür',
    'lvb.title': 'ADRENALİN YÜKSELDİ · {n}', // TR owner check
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
    'res.next.weapon': 'Sonraki bölümde {name} dene.',
    'res.recipe.weapon': 'Evrim için önce {weapon} seç.',
    'res.recipe.rank': 'Bir sonraki denemede {weapon} silahını {rank}. seviyeye çıkar.',
    'res.recipe.passive': '{evo} evrimi için eksik parça {passive}. Tekrar denediğinde bu desteği seç.',
    'res.recipe.chest': 'Tarif hazırdı. Bir dahaki sefere {weapon} ve desteği hazırken sandık aç.',
    'live.recipe.weapon': 'Önce {weapon} silahını bul.',
    'live.recipe.rank': '{weapon} silahını {rank}. seviyeye çıkar.',
    'live.recipe.passive': '{evo} için {passive} desteğini bul.',
    'live.recipe.chest': '{evo} hazır. Bir sandık aç veya evrim kartını seç.',
    'live.recipe.evolved': '{evo} artık bu koşuda etkin.',
    'live.recipe.evolveNow': 'Evrimi tamamlamak için şimdi {evo} kartını seç.',
    'live.recipe.passiveNow': '{evo} için gereken {passive} bu elde. Şimdi seçebilirsin.',
    'live.recipe.weaponNow': 'Tarife başlamak için {weapon} seç.',
    'live.recipe.rankNow': '{weapon} silahını şimdi {next}. seviyeye çıkarabilirsin.',
    'res.recap.training': 'Gelişim', 'res.recap.practice': '{attr} +{n} TP', 'res.recap.mastery': 'Ustalık',
    'res.recap.masteryRank': '{weapon} · Rütbe {n}', 'res.recap.masteryKills': '{weapon} · +{n} öldürme',
    'res.districtClear': '{hood} tamamlandı.', 'res.districtStage': '{hood} · Aşama {stage}/{total} tamamlandı.',
    'res.recap.head': 'KOŞU ÖZETİ',
    'res.recap.reached': 'Ulaşılan Adrenalin {n} · {kills} öldürme · en iyi seri {streak}', // TR owner check
    'res.recap.resetWeapons': 'Silah seviyeleri her bölümde sıfırlanır. Teçhizat ve ustalık kalır.',
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
    'lvb.title': 'ADRENALINE UP · {n}',
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
    'res.next.weapon': 'Try {name} in the next level.',
    'res.recipe.weapon': 'Pick up {weapon} first to pursue this evolution.',
    'res.recipe.rank': 'Next attempt, raise {weapon} to rank {rank}.',
    'res.recipe.passive': '{passive} was the missing ingredient for {evo}. Look for it on your next run.',
    'res.recipe.chest': 'The recipe was ready. Next time, open a chest once {weapon} and its passive are ready.',
    'live.recipe.weapon': 'Find {weapon} to start this recipe.',
    'live.recipe.rank': 'Build {weapon} up to rank {rank}.',
    'live.recipe.passive': 'Look for {passive} to pair with this weapon.',
    'live.recipe.chest': '{evo} is ready. Open a chest or take its evolution card.',
    'live.recipe.evolved': '{evo} is active for this run.',
    'live.recipe.evolveNow': 'Choose {evo} now to complete the evolution.',
    'live.recipe.passiveNow': '{passive} is on offer. Take it to advance the {evo} recipe.',
    'live.recipe.weaponNow': 'Choose {weapon} to start the recipe.',
    'live.recipe.rankNow': 'You can raise {weapon} to rank {next} now.',
    'res.recap.training': 'Training', 'res.recap.practice': '{attr} +{n} XP', 'res.recap.mastery': 'Mastery',
    'res.recap.masteryRank': '{weapon} · Rank {n}', 'res.recap.masteryKills': '{weapon} · +{n} kills',
    'res.districtClear': '{hood} cleared.', 'res.districtStage': '{hood} · Stage {stage}/{total} cleared.',
    'res.recap.head': 'RUN RECAP',
    'res.recap.reached': 'Reached Adrenaline {n} · {kills} kills · best streak {streak}',
    'res.recap.resetWeapons': 'Weapon levels reset each level. Gear and mastery carry over.',
    'res.recap.sc': 'Street Cred',
    'res.recap.scVal': '+{n} · {k} kills to next',
    'res.recap.power': 'Power',
    'res.recap.noPower': 'No new district',
    'res.recap.next': 'Next',
    'res.recap.retry': '{unlock} (retry)',
    'hc.next': 'NEXT: {unlock}',
  });
}
