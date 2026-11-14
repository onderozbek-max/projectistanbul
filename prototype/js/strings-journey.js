// Lead integration strings (v0.4): journey labels, skill HUD, results flow, boss names (E2 nameKeys).
Object.assign(P.STR.tr, {
  'ui.title.proto': 'Prototip v0.8 · Eve yürüyüş: İstiklal → Ataköy',
  'ui.pause.level': '{hood} · {s}/{of} · {t}', 'ui.down.survived': '{hood} · {s}/{of} · {t} dayandın',
  'ui.pause.quit': 'Haritaya dön', 'ui.res.title': 'Haritaya dön', 'ui.res.next': 'Sonraki bölüm',
  'ui.res.progress': '{km} / {total} km yürüdün',
  'ui.hud.ult': 'Nazar patlaması', 'ui.hud.dash': 'DEPAR', 'ui.hud.dashHint': 'Hızlı kaydır: depar at',
  'ui.hud.stage': '{s}/{of}', 'ui.hud.adr': 'Adrenalin {n}', // TR owner check
  'ui.hud.journey': 'BÖLÜM {n}/{of}', // TR owner check: the journey level chip (line 1; the hood name is line 2)
  'boss.intro': 'PATRON', 'boss.rage': 'ÖFKE!',
});
Object.assign(P.STR.en, {
  'ui.title.proto': 'Prototype v0.8 · The walk home: İstiklal → Ataköy',
  'ui.pause.level': '{hood} · {s}/{of} · {t}', 'ui.down.survived': '{hood} · {s}/{of} · survived {t}',
  'ui.pause.quit': 'Back to map', 'ui.res.title': 'Back to map', 'ui.res.next': 'Next level',
  'ui.res.progress': '{km} / {total} km walked',
  'ui.hud.ult': 'Evil-eye burst', 'ui.hud.dash': 'DASH', 'ui.hud.dashHint': 'Quick flick: dash',
  'ui.hud.stage': '{s}/{of}', 'ui.hud.adr': 'Adrenaline {n}', 'ui.hud.journey': 'LEVEL {n}/{of}',
  'boss.intro': 'BOSS', 'boss.rage': 'RAGE!',
});

// Death causes of the D-060 boss archetypes (config-bosses.js): the down screen reads cause.<archetype> (check-death-causes.js).
// TR owner check: the Turkish cause names reuse the boss names (Rehber, Antikacı); the owner confirms them.
Object.assign(P.STR.tr, { 'cause.tourGuide': 'Müze Rehberi', 'cause.antiquarian': 'Antikacı' });
Object.assign(P.STR.en, { 'cause.tourGuide': 'Docent', 'cause.antiquarian': 'Antiquarian' });

// One boss-name set (AUDIT-5 D-8/H2, owner 2026-11-08): the narrative spk.b.<hood> names in strings-story.js are the
// only source. This copies them to boss.<hood> for the boss banner. Ataköy: Sayın Abim (D-039); the character's name
// stays Ahmet Abi (spk.ahmet, H1 option a). config-levels.js carries no boss names.
(function () {
  P.Journey.hoods.forEach(function (h) {
    ['tr', 'en'].forEach(function (l) { if (P.STR[l]['spk.b.' + h.id]) P.STR[l]['boss.' + h.id] = P.STR[l]['spk.b.' + h.id]; });
  });
})();
