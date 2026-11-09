// Lead integration strings (v0.4): journey labels, skill HUD, results flow, boss names (E2 nameKeys).
Object.assign(P.STR.tr, {
  'ui.title.proto': 'Prototip v0.7 · Eve yürüyüş: İstiklal → Ataköy',
  'ui.pause.level': '{hood} {n}-{s} · {t}', 'ui.down.survived': '{hood} {n}-{s} · {t} dayandın',
  'ui.pause.quit': 'Haritaya dön', 'ui.res.title': 'Haritaya dön', 'ui.res.next': 'Sonraki seviye',
  'ui.res.labelHood': 'BÖLGE {n} · SEVİYE {s} · {hood}', 'ui.res.progress': '{km} / 17 km yürüdün',
  'ui.hud.ult': 'Nazar patlaması', 'ui.hud.dash': 'KAÇ', 'ui.hud.dashHint': 'Hızlı kaydır: kaç',
  'ui.hud.level': '{n}-{s}',
  'boss.intro': 'PATRON', 'boss.rage': 'ÖFKE!',
});
Object.assign(P.STR.en, {
  'ui.title.proto': 'Prototype v0.7 · The walk home: İstiklal → Ataköy',
  'ui.pause.level': '{hood} {n}-{s} · {t}', 'ui.down.survived': '{hood} {n}-{s} · survived {t}',
  'ui.pause.quit': 'Back to map', 'ui.res.title': 'Back to map', 'ui.res.next': 'Next level',
  'ui.res.labelHood': 'DISTRICT {n} · LEVEL {s} · {hood}', 'ui.res.progress': '{km} / 17 km walked',
  'ui.hud.ult': 'Evil-eye burst', 'ui.hud.dash': 'DASH', 'ui.hud.dashHint': 'Quick flick: dash',
  'ui.hud.level': '{n}-{s}',
  'boss.intro': 'BOSS', 'boss.rage': 'RAGE!',
});

// One boss-name set (AUDIT-5 D-8/H2, owner 2026-11-08): the narrative spk.b.<hood> names in strings-story.js are the
// only source. This copies them to boss.<hood> for the boss banner. Ataköy: Sayın Abim (D-039); the character's name
// stays Ahmet Abi (spk.ahmet, H1 option a). config-levels.js carries no boss names.
(function () {
  P.Journey.hoods.forEach(function (h) {
    ['tr', 'en'].forEach(function (l) { if (P.STR[l]['spk.b.' + h.id]) P.STR[l]['boss.' + h.id] = P.STR[l]['spk.b.' + h.id]; });
  });
})();
