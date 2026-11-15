# Turkish review: Nightmare, Night Shift, Adrenalin and the kiosk hint (R1-T4 parts 17 and 18)

Write your change next to a row, or write "ok". Anything left as is stays in the game and keeps its `// TR owner check` tag.
Terms I used: **Bölüm** = journey level, **Bölge** = district, **Adrenalin** = the in-run level, **Sokak Kredisi** = Street Cred (as in your HUD line).

## A. Nightmare

| # | Key | Current Turkish | English | Where |
|---|---|---|---|---|
| 1 | mode.nm.name | Kâbus | Nightmare | mode name |
| 2 | mode.nm.play | Kâbus · {L} oyna | Nightmare · play {L} | start button |
| 3 | mode.toggle.nm | Kâbus | Nightmare | Normal/Nightmare switch |
| 4 | mode.toggle.hint | Kâbus, bölgenin tüm bölümleri Normal'de bitince açılır. | Nightmare opens when every level of the district is cleared on Normal. | locked switch |
| 5 | mode.toggle.aria | Oyun modu | Game mode | screen reader |
| 6 | mode.hud | Kâbus | Nightmare | HUD tag |
| 7 | mode.title | Gece Nöbetçisi | Night Watch (title) | title at 3 moons |
| 8 | mode.moon | Ay rozeti | Moon badge | badge name |
| 9 | mode.moonHint | Bölgenin beş bölümünü Kâbus'ta bitir: ay rozeti. | Clear all five levels of the district on Nightmare: moon badge. | map hint |
| 10 | mode.moonAria | Kâbus ay rozeti | Nightmare moon badge | screen reader |
| 11 | res.star4 | Kâbus: hasarsız ve en düşük can {n}% veya üstü | Nightmare: no revive and lowest HP at {n}% or more | 4th star line |
| 12 | res.nm.cred | Sokak Kredisi | Street Cred | results row |
| 13 | res.nm.credV | x{n} | x{n} | results row value |
| 14 | res.nm.moon | Ay rozeti | Moon badge | results row |
| 15 | res.nm.moonV | kazanıldı | earned | results row value |
| 16 | res.nm.title | Ünvan | Title | results row |
| 17 | toast.moon | Ay rozeti kazanıldı: {h} | Moon badge earned: {h} | toast |
| 18 | toast.title | Ünvan açıldı: {t} | Title unlocked: {t} | toast |

Row 11: "hasarsız" means "no damage taken", but the rule is "no revive and lowest HP at 40% or more". Suggest: **Kâbus: dirilmeden bitir, can en az {n}%**.

## B. Night Shift (Gece Vardiyası)

| # | Key | Current Turkish | English | Where |
|---|---|---|---|---|
| 19 | ns.card.head | GECE VARDİYASI | NIGHT SHIFT | entry card title |
| 20 | ns.card.seed | Vardiya: {name} | Shift: {name} | today's seeded name |
| 21 | ns.card.rota | Rota: {hood} | Route: {hood} | first district of the route |
| 22 | ns.card.mods | Günün kuralları | Today's rules | the two daily modifiers |
| 23 | ns.card.best | Bugün en iyi: {n} | Best today: {n} | |
| 24 | ns.card.bestNone | Bugün henüz tur yok | No run yet today | |
| 25 | ns.card.streak | Gün serisi: {n} | Day streak: {n} | |
| 26 | ns.card.play | Vardiyaya başla | Start the shift | button |
| 27 | ns.card.again | Yeniden dene | Try again | button |
| 28 | ns.card.closed | İlk bölgeyi bitir, vardiya açılsın. | Clear the first district to open the shift. | locked card |
| 29 | ns.card.desc | Tek tur, 12 dakika. Ölünce bir kez dirilirsin. Skor: hayatta kalma, öldürme ve Adrenalin. | One run, 12 minutes. One revive if you fall. Score: survival, kills and Adrenaline. | card body |
| 30 | ns.card.pay | Günün ilk turu: +{k} jeton | First run of the day: +{k} coins | card (coins only now) |
| 31 | ui.ns.done | VARDİYA TAMAM | SHIFT COMPLETE | results banner (12 minutes reached) |
| 32 | ui.ns.over | VARDİYA BİTTİ | SHIFT OVER | results banner (died) |
| 33 | res.ns.score | Skor | Score | |
| 34 | res.ns.time | Süre | Time | |
| 35 | res.ns.best | En iyi (bu cihaz) | Best (this device) | |
| 36 | res.ns.today | Bugün en iyi | Best today | |
| 37 | res.ns.streak | Gün serisi | Day streak | |
| 38 | res.ns.pay | Günün ilk turu | First run of the day | |
| 39 | res.ns.payV | +{k} jeton | +{k} coins | |

Row 29: "Bölge" is the district; the route is a string of districts. Row 28 says "ilk bölgeyi" for the first district; tell me if you want "ilk bölümü" (first level) instead.

## C. Night Shift seed names ("Vardiya: Sessiz Liman")

The name is one adjective plus one noun from the day's seed, so every pair has to read well.

| Adjective | Sessiz, Kırmızı, Islak, Son, Gece, Soğuk, Uzun, Sisli |
|---|---|
| Noun | Liman, Kepenk, Sokak, Vapur, Çarşı, Köprü, Fener, Kapı |

Owner decided (2026-11-14): "Gece" takes the possessive noun, so it reads "Gece Kapısı" (Gece Limanı, Gece Kepeği, Gece Sokağı, Gece Vapuru, Gece Çarşısı, Gece Köprüsü, Gece Feneri). The other adjectives keep the bare noun. Row 28 stays "bölgeyi" (owner confirmed).

## D. Adrenalin and the journey chip

| # | Key | Current Turkish | English | Where |
|---|---|---|---|---|
| 40 | ui.hud.adr | Adrenalin {n} | Adrenaline {n} | HUD chip |
| 41 | ui.hud.journey | BÖLÜM {n}/{of} | LEVEL {n}/{of} | journey chip, line 1 |
| 42 | lvb.title | ADRENALİN YÜKSELDİ · {n} | ADRENALINE UP · {n} | |
| 43 | res.recap.reached | Ulaşılan Adrenalin {n} · {kills} öldürme · en iyi seri {streak} | Reached Adrenaline {n} · {kills} kills · best streak {streak} | results recap |
| 44 | ui.cards.sub | Adrenalin {n} · oyun durdu | Adrenaline {n} · game paused | card screen |

## E. Kiosk heal station

| # | Key | Current Turkish | English |
|---|---|---|---|
| 45 | hint.kiosk | Büfe: Dokun ve iyileş | Kiosk: touch to heal |

## F. Added after the phone playtest (2026-11-14)

| # | Key | Current Turkish | English | Where |
|---|---|---|---|---|
| 46 | mo.streak25 | VAHŞET! | SMASH! | kill-streak word at 25 kills (was KIRIM, your suggestion) |
| 47 | mo.streak10 | DEVAM! | KEEP IT UP! | kill-streak word at 10 kills |
| 48 | mo.streak50 | EFSANE! | LEGEND! | kill-streak word at 50 kills |
| 49 | ui.set.joyA | Her yer | Anywhere | Settings, joystick side (new default) |
