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

### Mac playtest follow-up

| Key | TR | EN | Where |
|---|---|---|---|
| ui.res.title | Harita ve gelişim | Map & upgrades | Results |
| meta.growth.attr | Arda’nın özellikleri | Arda’s attributes | Map, above Play |
| meta.growth.points | Arda · {n} puan hazır | Arda · {n} points ready | Map, when points are ready |
| meta.growth.tree | Yetenek ağacı | Skill tree | Map, above Play |
| meta.prep.perk | Yetenek ağacı · Yetenek hazır | Skill tree · Perk ready | Map, when a perk is ready |
| route.tramRespite | Tramvayın yanında soluklan | Catch your breath by the tram | Bölüm 3 pacing trial |
| route.tramGuard | Sandık için hızlı zombiyi yen | Defeat the runner for a chest | Bölüm 3 pacing trial |
| route.tramStop | Tramvay durağına ulaş | Reach the tram stop | Bölüm 2 route bar |
| obj.tramStop.title | Tramvayı çalıştır | Start the tram | Bölüm 2 optional objective |
| obj.tramStop.approach | Kumandayı bul | Find the controls | Bölüm 2 objective before arrival |
| obj.tramStop.link | Halkada kal | Stay in the ring | Bölüm 2 objective near the controls |
| obj.tramStop.goal | Duraktaki tramvayı çalıştır | Send the tram down the tracks | Bölüm 2 results goal |
| hack.tramStop | Tramvay | Tram | Bölüm 2 label over the control ring |
| obj.tramStop.incoming | Tramvay geliyor | Tram incoming | Bölüm 2 tram warning |
| route.frenzyPrep | İlerle ve silahlarını güçlendir | Move up and build your arsenal | Bölüm 2 route before the frenzy |
| route.frenzySoon | Sürü saldırısına hazır ol | Horde frenzy incoming | Bölüm 2 countdown |
| route.frenzyClear | Sürü saldırısı · Sandık için savaş | Horde frenzy · Fight for a chest | During the frenzy, before nine kills |
| route.frenzySurvive | Sürü saldırısı · Dayan | Horde frenzy · Hold out | During the frenzy, after nine kills |
| route.frenzyGate | Son kapıya ilerle | Reach the final gate | After the frenzy |
| route.seconds | {n} sn | {n}s | Frenzy and countdown clocks |
| route.counter | Makasçı açıkta · Saldır | Switchkeeper exposed · Strike | Boss recovery |
| boss.switchkeeper / cause.switchkeeper | Makasçı | The Switchkeeper | Boss banner, health bar and death cause |
| chest.choose | Devam etmek için bir geliştirme seç. | Choose an upgrade to continue. | Chest with a weapon upgrade choice |
| boss.cook / cause.cook | Lokantacı | The Cook | Bölüm 1 boss |
| boss.roaster / cause.roaster | Kestaneci | The Chestnut Seller | Bölüm 3 boss |
| boss.linekeeper / cause.linekeeper | Elektrikçi | The Electrician | Bölüm 4 boss |
| cause.vatman | Vatman | The Vatman | Bölüm 5 death cause |
| route.followCart | Sinyal arabasını geç ve kapıya ulaş | Pass the signal cart and reach the gate | Bölüm 3 route |
| route.followWires | Kabloları kes ve ilerle | Cut the wires and move up | Bölüm 4 route |
| route.depot | Tramvay deposuna ulaş | Reach the tram depot | Bölüm 5 route |
| route.clearRails | Raylardan çekil | Get off the tracks | Vatman's tram attack |
| route.opening | Patron açıkta · Saldır | Boss exposed · Strike | Boss recovery |
| obj.wire.title | Tramvay kabloları | Tram wires | Bölüm 4 objective |
| obj.wire.line | Kesilen kablo {n}/{of} | Wires cut {n}/{of} | Bölüm 4 objective counter |
| obj.wire.goal | Üç tramvay kablosunu kes | Cut all three tram wires | Bölüm 4 results |
| obj.marker.wire | Kablo | Wire | Live-wire marker |

### Required routes and developing Arda

| Keys | TR | EN | Where |
|---|---|---|---|
| milestone.required / clear | Yol kapalı · Gerekli / Yol açıldı | Road blocked · Required / Road clear | Route card |
| milestone.switch / watchTram | Halkada kal · Tramvayı çağır / Tramvay çağrıldı · Rayları izle | Stay in the ring · Call the tram / Tram called · Watch the tracks | Tram controls and the scene |
| milestone.cartCall / cartThreat | Halkada kal · Geçiş sinyalini gönder / Sinyal arabasının çevresini temizle | Stay in the ring · Send the signal / Clear the zombies around the cart | Plaza signal cart |
| milestone.wires / snip | Bariyeri açmak için üç kabloyu kes / Kabloyu kesmek için halkada dur | Cut three live wires to open the barrier / Stand still in the ring to cut the wire | Live wires |
| milestone.crank | Halkada kal · Kepenk kolunu çevir | Stay in the ring · Turn the crank | Depot crank |
| growth.title / attr / tree | Arda’yı geliştir / Özellikler / Yetenek ağacı | Develop Arda / Attributes / Skill tree | Map and progression header |
| growth.pathNext / train | {perk} · Seviye {n} gerekir / {attr} özelliğini geliştir | {perk} · Requires rank {n} / Train {attr} | Links between attributes and perks |
| zone.connected / momRestored | Telefon sinyali geri geldi / Annen yeniden hatta | Phone signal restored / Mom is back on the line | Phone booster |
| milestone.hoistUse | Halkada kal · Vinci çevir | Stay in the ring · Turn the winch | Galata 6 |
| milestone.musicianEscort | Müzisyenin yanında kal · Kapıyı o açacak | Stay with the musician · They can open the gate | Galata 7 |
| milestone.bellUse | Halkada kal · Çanı çal | Stay in the ring · Ring the bell | Galata 8 |
| milestone.footbridgeUse | Halkada kal · Karşı ağırlığı tak | Stay in the ring · Fit the counterweight | Galata 9 |
| milestone.courtyardUse / boss.galataKeeper | Halkada kal · Kapının kolunu çevir / Kule Bekçisi | Stay in the ring · Turn the gate lever / The Tower Keeper | Galata 10 |
| milestone.cargoHookUse / milestone.cargoSecureUse | Halkada kal · Kancayı sandığa hizala / Halkada kal · Halatı sandığa tak | Stay in the ring · Align the hook / Stay in the ring · Secure the sling | Karaköy 11 |
| milestone.ferryMooringUse / milestone.ferryHold | Halkada kal · Palamarı at / Vapur yanaşırken iskeleyi savun | Stay in the ring · Throw the mooring line / Defend the pier while the ferry docks | Karaköy 12 |
| milestone.tramPointsUse / milestone.opening.tramPoints | Halkada kal · Makası değiştir / Makas döndü · Tramvay yan raya geçiyor | Stay in the ring · Throw the switch / Switch thrown · Tram taking the siding | Karaköy 13 |
| milestone.fishShutters / milestone.fishShuttersUse | Balık halinde üç tezgâhın kepengini aç / Halkada kal · Tezgâhın kepengini kaldır | Raise three shutters in the fish market / Stay in the ring · Raise the stall shutter | Karaköy 14 |
| milestone.dockClear / route.brideOpening | Rampayı tutan zombileri temizle / Halat takıldı · Geline saldır | Clear the zombies guarding the ramp / Rope caught · Strike the Bride | Karaköy 15 |
| milestone.bridgeRodsUse | Halkada kal · Takılan misinaları sar | Stay in the ring · Reel in the snagged lines | Galata Köprüsü 16 |
| milestone.bridgeRescueUse / milestone.bridgeHaul | Halkada kal · Kurtarma halatını at / Balıkçıyı halatla yukarı çek | Stay in the ring · Throw the rescue line / Haul the fisher up | Galata Köprüsü 17 |
| milestone.bridgeGust | Sert rüzgâr · Siperi kapatmak için halkada kal | Strong gust · Stay in the ring to close the windbreak | Galata Köprüsü 18 |
| milestone.bridgeWaveIn / milestone.bridgeBrace | Dalga geliyor · Halkadaki sipere gir / Tutun · Dalga vurana kadar halkada kal | Wave incoming · Get behind the brace / Hold on · Stay in the ring until impact | Galata Köprüsü 19 |
| milestone.bridgeLiftUse / route.fisherOpening | Halkada kal · Platformu indir / Misina boşta · Balıkçıya saldır | Stay in the ring · Lower the platform / Line slack · Strike the Fisherman | Galata Köprüsü 20 |
| milestone.marketAwningUse / milestone.open.marketAwning | Halkada kal · Tentenin ipini çek / Sağdaki tentenin altından geç | Stay in the ring · Pull the awning rope / Go under the awning on the right | Eminönü 21 |
| milestone.marketCartMoving / milestone.marketCartClear | Baharat arabasına eşlik et / Zombiler arabayı durdurdu · Yolunu aç | Stay with the spice cart / Zombies stopped the cart · Clear its path | Eminönü 22 |
| milestone.marketSacks / milestone.marketSackCarry | Kapı çarkını sıkıştıran üç çuvalı taşı / Çuvalı işaretli palete bırak | Move the three sacks jamming the gate wheel / Drop the sack on the marked pallet | Eminönü 23 |
| milestone.marketSignalWarn / milestone.marketSignalMoving | Yük arabası geliyor · Çizginin gerisinde kal / Araba geçiyor · Raylardan uzak dur | Trolley incoming · Stay behind the line / Trolley crossing · Keep off the track | Eminönü 24 |
| milestone.marketGateUse / route.captainOpening | Halkada kal · Kepengin kolunu çevir / Çapa takıldı · Kaptana saldır | Stay in the ring · Turn the shutter crank / Anchor stuck · Strike the Captain | Eminönü 25 |

## 2026-11-16: whole Turkish dialogue revision

The owner requested a complete natural-language, comedy and comic-continuity pass.
See [the audit](TR-DIALOGUE-AUDIT-2026-11-16.md) for every changed dialogue key, its
old and new Turkish, existing English and location. Its changed keys supersede earlier
wording in this review as local drafts; UI and gameplay instruction strings here are unchanged.
