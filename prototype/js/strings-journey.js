// Lead integration strings (v0.4): journey labels, skill HUD, results flow, boss names (E2 nameKeys).
Object.assign(P.STR.tr, {
  'ui.title.proto': 'Prototip v0.5 · Eve yürüyüş: İstiklal → Ataköy',
  'ui.pause.level': '{hood} {n}-{s} · {t}', 'ui.down.survived': '{hood} {n}-{s} · {t} dayandın',
  'ui.pause.quit': 'Haritaya dön', 'ui.res.title': 'Haritaya dön', 'ui.res.next': 'Sonraki seviye',
  'ui.res.labelHood': 'BÖLGE {n} · SEVİYE {s} · {hood}', 'ui.res.progress': '{km} / 17 km yürüdün',
  'ui.hud.ult': 'Nazar patlaması', 'ui.hud.dash': 'ATIL', 'ui.hud.dashHint': 'Hızlı kaydır: atıl',
  'ui.hud.level': '{n}-{s}',
  'boss.intro': 'PATRON', 'boss.rage': 'ÖFKE!',
});
Object.assign(P.STR.en, {
  'ui.title.proto': 'Prototype v0.5 · The walk home: İstiklal → Ataköy',
  'ui.pause.level': '{hood} {n}-{s} · {t}', 'ui.down.survived': '{hood} {n}-{s} · survived {t}',
  'ui.pause.quit': 'Back to map', 'ui.res.title': 'Back to map', 'ui.res.next': 'Next level',
  'ui.res.labelHood': 'DISTRICT {n} · LEVEL {s} · {hood}', 'ui.res.progress': '{km} / 17 km walked',
  'ui.hud.ult': 'Evil-eye burst', 'ui.hud.dash': 'DASH', 'ui.hud.dashHint': 'Quick flick: dash',
  'ui.hud.level': '{n}-{s}',
  'boss.intro': 'BOSS', 'boss.rage': 'RAGE!',
});

// One boss-name set (owner 2026-11-09): narrative canon spk.b.* names also drive the boss banner (boss.*).
// Ataköy boss is Sayın Abim (owner decision).
(function () {
  P.STR.tr['spk.b.atakoy'] = 'Sayın Abim'; P.STR.en['spk.b.atakoy'] = 'The Honourable Big Bro';
  P.Journey.hoods.forEach(function (h) {
    ['tr', 'en'].forEach(function (l) { if (P.STR[l]['spk.b.' + h.id]) P.STR[l]['boss.' + h.id] = P.STR[l]['spk.b.' + h.id]; });
  });
})();
