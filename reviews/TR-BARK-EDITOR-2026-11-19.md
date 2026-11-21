# Turkish bark and item-flavour narrative audit — 2026-11-19

## Scope and method

Read every Turkish combat, world-event, weapon/item, shared ambient, district and flavour pool (all 100 level slots). Matched shared observations to `story/barks.js`, event lifecycle, terminal outcomes, environmental effects, enemy behaviours, current actor definitions and weapon/evolution mechanics. Read `docs/voice-tr.md`, the narrative guardrails and the district/stage descriptions in `docs/journey.md`.

Production edits are limited to shared lines and district pools H01–H06 (L1–30). H07–H20 were audited read-only. No English line, beat key, pool length, simulation event producer, configuration number or gameplay mechanic changed. A bounded follow-up in `story/barks.js` adds source validation to elite/action warnings; existing timing, joke budgets and protected-scene rules are unchanged. Changed lines have their previous `ok: 1` review approval removed. Existing joke flags are preserved, so the D119 joke budget, opening restraint and protected grief delivery remain intact.

The direction is original spoken Turkish: an anxious student trying to negotiate ordinary habits through an abnormal situation. The useful influence of the requested shows is literal-minded social reasoning and small, uncomfortable observations, not quoted catchphrases or a punchline in every bubble.

## Findings resolved

- **Action versus reward:** card selection/evolution does not prove an enemy was hit, a road cleared, a car exploded or a projectile reflected. Rewrote those claims as intent or capability. The fireball is a thrown bottle that bursts and burns, not a rolling projectile. The revised fire/arc evolution lines describe their actual effect instead of implying those weapon effects directly hurt Arda.
- **Event identity:** barricades are route obstacles, not friendly shelters. Stampedes are escaping civilians, not a pursuing zombie horde. The loot runner carries a simit tray, not a bag. A pier event spawns a horde and does not itself guarantee a ferry arrived.
- **Actual outcomes:** traffic/shutter hacks can succeed without a nearby target or removable route block. Foam discharge can occur without a fire to extinguish. Removed claims of an observed stun, newly opened road, or extinguished fire from generic variants. Terminal failure follows leaving the link area, so it should not invent a jammed shutter or a specific traffic-light colour.
- **Character knowledge:** signal restoration is not an answered phone call and does not guarantee one signal bar. Lost-signal text no longer assumes Mom was speaking. Shared self-talk no longer commits Arda to staying home after collecting Dad's note.
- **Readable tactics:** hardhat copy describes flanking the frontal protection, not a nonexistent body-part aiming system. First-sighting lines no longer require a prior enemy blow. Near-miss copy no longer asserts trousers were torn. Dash and ultimate activation no longer claim a clear escape route. Brute wind-up no longer borrows the screamer's crowd-lure effect; spit launch does not assert that acid has already landed, and a ground slam is not described as a travelling damage wave.
- **Voice:** removed kill-count boasting, stale borrowed catchphrases and disconnected jokes. Kept fear, pride at small successes, a student's comparisons, the family's habits, and the knife-return promise. Fixed the pigeon joke's inverted debt logic. Item-flavour text no longer invents an unearned construction-site visit or a past barbecue purchase.
- **Locality:** bridge fog and boat sounds are attributed to the Haliç. The Sirkeci repair joke now acknowledges the onward Sarıyer destination without changing the immediate home/note mission.

## Later-script audit — no production edits

These remain review findings for later-content readiness, not claims that L31–100 is ready to ship.

| Beat | Context issue | Required later follow-through |
| --- | --- | --- |
| `BK.hd14.2` (all 3 variants, L67) | Tea garden, flowers and birds belong to the retired stage description. D-060 places stage 2 underground in Zindanlar with vaults, torches, gates and dripping water. | Rewrite all three variants for the dungeon; retain the tea-garden observations for stage 4 only if its art and trigger support them. |
| `BK.hd16.2` (all 3 variants, L77) | Conveyor and bale-stack observations conflict with D-060 Sahil Rıhtımı. Conveyors belong to stage 3; bale stacks are stages 1 and 5. | Replace with the rainy concrete quay, fishing piers and shoreline. Verify the replacement scenery before accepting the dialogue. |
| `BK.hd13.3#1` (L63) | “Güneş doğdu” commits to sunrise during a stage documented as pre-dawn; the sunrise is reserved for stage 5. | Move the wording to gathering light or validate a deliberate revised time-of-day sequence. |
| `BK.hd07.4#0` (L34) | “Kesin açacağım, film kuralı” states knowingly reckless intent solely to make a genre joke. It weakens the frightened but resourceful Arda. | Give opening the warning-marked shutter a concrete survival reason, or have Arda decide against it; let the unease do the work. |
| `BK.hd11.3#1` (L53) | “Yan yanayım” means being alongside somebody, not turning sideways to squeeze past stands. | Use a natural physical description such as “Yan döndüm, yine geçemiyorum” when this draft is activated. |
| `BK.hd12.4#2` (L59) | Exact twelve-step/twelve-zombie count is unsupported by a level-entry trigger; escort-stage context also needs a complete narrative decision before release. | Remove the exact count unless the finished level stages it. Confirm who is being escorted and what Arda can see. |
| `BK.hd13.4#0` (L64) | Arda suddenly asserts he cannot swim. It is new character information embedded in a random variant. | Decide whether it is canon before relying on it; otherwise describe the current sea-wall danger. |
| `BK.hd19.3#1` (L93) | “Biri düşerse hepimiz ıslanırız” claims a shared consequence without a linked-platform mechanic or staged physical chain. | Ground the fear in the unstable pontoon, or show the physical chain that causes it. |
| H07–H20 boss/action variants | Hood barks are offered on level entry; many later variants describe an already swung weapon, a raised umbrella, falling stock, or a captain/principal presently looking at Arda. The later art/encounter implementation has not been verified here. | At implementation, stage those actions before delivery or use an arrival observation. Do not infer first30-quality gating merely from a stored script. |

Keep the late family material small and specific. Ahmet Abi's bread, keys and familiar greeting already carry more feeling than another joke or a bigger threat. Preserve that contrast when reviewing L96–100. The later one-liners do not justify adding more bubbles to a busy fight.

## Source-bound delivery fix — verified

The remaining elite/action source gap is closed in `prototype/js/story/barks.js`. A warning is queued only when its event origin identifies exactly one living, active actor of the appropriate kind within the existing 7 m sighting radius. Matching uses the actor's existing physical footprint, allowing normal movement between emission and delivery without a new tuning constant. Unattributable, ambiguous and remote events stay silent. The selected actor object remains attached to both the queue and live bubble; death, dormancy, removal, replacement or leaving sighting range cancels the observation. The shared lob event no longer makes a çaycı's tea or toxic sprayer trigger the acid-spit pool.

The simulation producers, first-level joke exclusion, phone protection, Captain farewell silence, bubble timing and existing cooldowns are unchanged. This source validity check does not introduce a new combat mechanic. Source reactions retain their existing event lifetime. Final production file: **469 lines**; focused delivery test: **196 lines** (both below the 600-line cap).

## Verification

- `node prototype/tools/test-dialogue.js` — PASS: 583 beats, TR 1,202 lines, EN 1,205 lines; language-independent simulation digest `12d2b67db8`; length, coverage, duplicates, reviewed style and joke-pool checks pass.
- `node prototype/tools/test-barks-delivery.js` — PASS after the final source-binding fix: readable exchanges, cancelled orphan replies, rescue status; opening, danger, phone, grief, event-outcome and encounter-context regressions in EN/TR. All seven warning types now have positive source-delivery cases, movement-within-body cases, queued and live cancellation cases, and remote, missing, ambiguous and inappropriate-source cases. An offscreen source entering later cannot resurrect its old warning.
- Final focused runtime/content command exited 0; captured stdout: `/tmp/istanbul-bark-final-2026-11-19.log`.
- Snapshot comparison confirms unchanged pool lengths, no H07–H20 text changes, and no carried `ok: 1` approval on edited lines.
- The tests check structure and known delivery contexts. They do not prove literary excellence or eliminate every future combination of live gameplay states. This pass is a text/trigger audit; it does not claim a new visual/audio review.

## Revision inventory

142 line revisions across 5 files. Baseline is the working-copy snapshot at `/tmp/istanbul-tr-bark-editor-1795129496`, not Git HEAD (which contains unrelated work).

| File | Changed lines |
| --- | ---: |
| `barks-cards.js` | 46 |
| `barks-combat.js` | 40 |
| `barks-hoods-01-10.js` | 6 |
| `barks-world.js` | 48 |
| `cards-flavour.js` | 2 |

Variant indices below are zero-based. Eight evolution variants received a second voice pass to retain Arda's intention, uncertainty and physical effort without mechanical terms such as “isabet” or “hasar”.

| Beat / variant | Before | After |
| --- | --- | --- |
| `BK.card.cardoor#2` | Kapı kalktı, tükürük geri gitti. | Kapıyı önüme tutarsam tükürüğü geri çevirebilirim. |
| `BK.card.fireworks#0` | Havai fişek! Düğünden artmış, damat duymasın. | Havai fişek! Kutlama kısmını sonra düşünürüm. |
| `BK.card.knife#2` | Elime de bıçak yakıştı. | Sapını kavra. Usta da böyle tutuyordu. |
| `BK.card.medkit#1` | Sargı bezi var. Şu yarayı kapatayım. | Sargı bezi var. El altında dursun. |
| `BK.card.nazar#1` | Kem gözler götüme. | Boncuğa da güvendim. Çevrem iyice genişledi. |
| `BK.card.shoes#1` | Yeni ayakkabılar. Bu yürüyüş artık daha havalı. | Ayakkabı koşmaya hazır. Bir tek ben kaldım. |
| `BK.card.sledge#1` | Kapı kilitliyse sorun değil. Kapı yok artık. | Anahtarı unutsam da kapı dert değil artık. |
| `BK.card.slingshot#1` | Bilye sekti, ben kaçtım. Strateji dersinden AA. | Sapan da var. Çocukluğum benden daha hazırlıklıymış. |
| `BK.card.torch#1` | Alevin tek sorunu: ben de tutuşabilirim. | Alevi kalabalığa doğru tut. Önünü aç. |
| `BK.evo.arcchain#2` | Su birikintisine basma Arda. Kendi kendini kızartma. | Zincirin elektriği yakındakilere de sıçrayabilir. |
| `BK.evo.blacksmith#0` | Çekiç vurdukça toparlanıyorum. Devam et. | Vurdukça ben de toparlanacağım. Boşa savurma Arda. |
| `BK.evo.blacksmith#1` | Vuruşlar iyi geliyor. Gücüm yerine geliyor. | Varyozu sağlam tut. Vuruşlar beni de toparlayacak. |
| `BK.evo.blacksmith#2` | Çekiç vurdukça can geliyor. Bağımlılık yapar mı bu? | Çekiç iyi geliyormuş. Anneme bunu nasıl anlatayım? |
| `BK.evo.carbomb#0` | Tüp patladı, araba uçtu. Kasko bunu karşılamaz. | Tüpü arabaya atarsam kasko işi biraz uzar. |
| `BK.evo.carbomb#1` | Patlama bütün sokağa yayıldı. Uzak durayım. | Tüp arabaya yakın düşsün. Ben biraz geride durayım. |
| `BK.evo.carbomb#2` | Araba da patladı. Yolu kontrol edeyim. | Tüpü araçların yanına düşürmem lazım. |
| `BK.evo.cleaver#2` | Satır yolu açıyor. Arkasından ilerle. | Satırla kalabalığı yarabilirim. Arada sıkışma. |
| `BK.evo.cluster#2` | Dağıldılar! Arayı açabilirim. | Fişekler parçalanacak. Kalabalığa doğru tut. |
| `BK.evo.finale#1` | Fişekler arka arkaya patlıyor. Yolu açtı! | Peş peşe fişek atabilirim. Şimdi yerini seç. |
| `BK.evo.finale#2` | Hepsi birden ateşlendi. Kenara çekil. | Fişekler hazır. Kalabalığı buradan dağıtmayı deneyeyim. |
| `BK.evo.fireball#0` | Ateş topu yuvarlanıyor. Önünde durmayayım. | Şişe artık daha geniş bir alanı yakacak. |
| `BK.evo.fireball#1` | Çarptı ama sönmedi. Yanarak ilerliyor. | Ateş topu çarptığı yeri yakar. Kalabalığa atayım. |
| `BK.evo.fireball#2` | Bu şişe büyüdü de top oldu. Gözlerim doldu. | Şişe küçücük. İçindeki sorun büyümüş. |
| `BK.evo.foamstorm#0` | Köpük her yerde. Annem olsa yerleri de sil derdi. | Bu kadar köpükle annem bütün evi silerdi. |
| `BK.evo.foamstorm#1` | Tükürük köpüğe takılıyor. Arkasında durayım. | Köpüğü önüme sıkayım. Tükürüğü o karşılasın. |
| `BK.evo.foamstorm#2` | Köpük yayıldı. Önümdeki ateşi de bastırıyor. | Köpüğü genişçe yayayım. Alev de tükürük de geçmesin. |
| `BK.evo.forge#0` | Alev yerde iz bırakıyor. Basacağım yere bakayım. | Alev yerde de kalacak. Yolu böyle tutabilirim. |
| `BK.evo.forge#1` | Yerdeki alevler sönmedi. Kenarından geç. | Pürmüz daha geniş alanı yakabilir. Önümü açayım. |
| `BK.evo.hookpull#1` | Kanca yapıştı. Gelin bakalım, hep beraber. | Kancayla yakındakileri de bir araya çekebilirim. |
| `BK.evo.hookpull#2` | Hepsi bana geliyor. Ömrümde bu kadar ilgi görmedim. | Halatla kalabalık topluyorum. Davetiye masrafı yok. |
| `BK.evo.lake#0` | Alevler birleşiyor. Yolu kaplamadan geçeyim. | Alevler birleşirse kalabalığı yavaşlatabilir. |
| `BK.evo.lake#1` | Yerde koca bir ateş birikintisi oluştu. | Şişeleri yakın atayım. Ateşler birleşsin. |
| `BK.evo.minibus#0` | Kapıyı vurunca sersemliyorlar. Şimdi geçebilirim. | Kapıyı yere vurayım. Sersemledikleri anda geçerim. |
| `BK.evo.minibus#1` | Darbe etrafıma yayıldı. Önüm açıldı. | Kapı ne ağırmış. Yere vurunca dibindekiler durur. |
| `BK.evo.netspear#0` | Zıpkın ağı açıldı. Birbirlerine takılıyorlar. | İpleri dolaştırmadan at Arda. Birbirlerine takılsınlar. |
| `BK.evo.netspear#1` | İpler hepsini bir arada tutuyor. | Birine vurunca öbürü de sarsılacak. İp iyi fikirmiş. |
| `BK.evo.stormshield#1` | Kalkan elektrik saçıyor. Yaklaşamıyorlar. | Elektrik yakındakilere sıçrar. Yine de mesafeyi koru. |
| `BK.evo.twinsaw#2` | Diskler yolu açıyor, ben arkadan. Lider benim, sözde. | İki disk de geri dönecek. Aralarını boş bırakayım. |
| `BK.lvlB#2` | Kimsenin seviyesine herkes karışamaz. | Keşke dersler de böyle ilerleseydi. Bu kısmı hariç. |
| `BK.lvlD#2` | Bu kadar seviyeye annem artık bir mantı açar. | Güçlendim. Annem yine poşeti iki elle tut der. |
| `BK.mastery#0` | Bu hareketi bir videoda görmüştüm. | Videoda kolay görünüyordu. Zor yerlerini kesmişler. |
| `BK.mastery#2` | Bu hareket artık benim imzam. | Bu sefer hareketi kontrol edebildim. |
| `BK.mastery#3` | Hareket tamam. Alkış yok mu? | Nasıl yaptığımı aklımda tutayım. |
| `BK.mod#0` | Modu taktım. Tamirci olmaya başladım. | Taktım. Artan vida yoksa başarılı sayıyorum. |
| `BK.mod#4` | Usta'ya selam, modu taktım. | Parça tamam. Şimdi kullanmayı öğreneyim. |
| `BK.fk.guvercin#1` | Simit atıp beslerdim bunları. Şimdi borcunu tahsil ediyor. | Ben bunları besledim. Şimdi benden alacaklılar. |
| `BK.act.bossSlam#0` | Yere vurdu! Dalga üstüme geliyor! | Yere vurdu! Aynı yerde beklemeyeyim. |
| `BK.act.bossSlam#1` | Yere vurdu. Kapı çalsa da açmazdım zaten. | Yeri dövüyor. Yer bir şey yapmadı abi. |
| `BK.act.bossSlam#2` | Toz duman! Hiçbir şey görmüyorum! | Darbe çok sert! Dibinde kalma. |
| `BK.act.bossSlam#3` | Bir daha vuracak. Arayı açmam lazım! | Yeniden vurursa burada kalmayayım. |
| `BK.act.bruteCharge#1` | Bu kadar acele etme abi, aynı yere gidiyoruz! | Abi, ben seni çağırmadım! Yavaş! |
| `BK.act.bruteRoar#3` | Bağırınca öbürleri de dönüyor. Uzaklaşayım. | Bağırdı. Hamle yapacak, alan bırak. |
| `BK.act.spit#2` | Asit! Yer köpürüyor, bastığın yere dikkat. | Asit geliyor! Önünden çekil. |
| `BK.act.spit#3` | Yerde asit gölü var. Basmasam iyi olur. | Düştüğü yere basmayayım. Asit yerde kalıyor. |
| `BK.act.summon#2` | Yeni gelenler var, kapıda sıra oluşmuş. | Yenileri geliyor. Çevrilmeden uzaklaşayım. |
| `BK.dash#0` | Aradan çıktım! Devam et Arda. | Devam et Arda. Durup arkana bakma. |
| `BK.dash#2` | Sıyrıldım! Arkamı kapatmadan uzaklaşayım. | Bir hamle daha. Sıkışmadan uzaklaş. |
| `BK.dash#3` | Açıklığa çıktım. Şimdi nefes al. | Nefes al. Gideceğin yere bak. |
| `BK.elite#0` | Zırhlı olan geliyor! Önünde durmayayım. | İri olana alan bırak. Önünde sıkışma. |
| `BK.elite#3` | O ne lan?! Bütün yolu kapattı! | O ne lan?! Yaklaşmadan yer açmam lazım! |
| `BK.elite#4` | Yanından geçecek yer bırakmamış. | İri olanla dar yerde karşılaşmayayım. |
| `BK.fk.brute#2` | Vurduğu yere bak. Yakından yemeyeyim bunu. | Kollarına bak. Bir vursa toparlanamam. |
| `BK.fk.crawler#2` | Kaldırımın dibinde bir tane var. | Yerden sürünüyor. Ayağıma dolanmasın. |
| `BK.fk.diner#0` | Lokantadan hesap ödemeden kalkmış. Ayıp be kardeşim. | Elinde tabak var. Beni servis sanmasın. |
| `BK.fk.diner#2` | Önlüğü hâlâ üstünde. Yüzüne bakamıyorum. | Tabak hâlâ elinde. Yüzüne bakamıyorum. |
| `BK.fk.elite#1` | Bunun zırhı kalın. Açığını bulmam lazım. | Diğerlerinden daha sağlam. Açığını bulmam lazım. |
| `BK.fk.hardhat#1` | Baret başını koruyor. Açık yerine vurayım. | Baretli olanın karşısında durma. Yanına geç. |
| `BK.fk.hardhat#2` | Baretin kapatmadığı yere vurayım. | Baret önden koruyor. Arkasına dolanabilirim. |
| `BK.fk.runner#0` | Kaçan kovalanır yeğenim. | Koşarak geliyor. Rica etsem yürür mü acaba? |
| `BK.fk.spitter#2` | Ağzını açınca yana kaç. Üstüme tükürüyor! | Ağzını açarsa yana kaç. Önünde bekleme. |
| `BK.low#0` | Can azaldı. Toparlan Arda, hadi. | Dizlerim tutmuyor. Toparlan Arda, hadi. |
| `BK.low#2` | Son canımla bile yürürüm. | Az kaldı diye diye geldim. Biraz daha dayan. |
| `BK.mom#5` | Annem 'kapıyı kilitle' derdi. Kilit de kalmadı artık. | Annem 'kapıyı kilitle' derdi. Keşke hepsi o kadar olsa. |
| `BK.near#0` | Pantolondan aldı. Anneme açıklaması daha kolay. | Az daha pantolon da gidiyordu. Anneme ne derdim? |
| `BK.self#4` | Eve varınca hiçbir şey yapmayacağım. Büyük planım bu. | Bir sandalyeye otursam yeter. Beklentim bu kadar düştü. |
| `BK.self#14` | Hangi yoldan geldim? Dönüşte hatırlamam lazım. | Geldiğim yolu aklımda tutayım. Aynı yere dönmeyeyim. |
| `BK.self#18` | Dükkânın camında kendimi gördüm. Bir an tanıyamadım. | Yüzüm ne hâldedir acaba? Annem hemen anlar. |
| `BK.streak.10#0` | On! Isınmaya yeni başladım. | On tane. Elim titriyor ama durmadım. |
| `BK.streak.10#1` | On tane! Bu iş sandığımdan kolaymış. | On oldu. Sıradaki nereden gelecek? |
| `BK.streak.25#0` | Yirmi beş! Bu dövüş değil, halay! | Yirmi beş. Sayıyorum diye sakin sanmasınlar. |
| `BK.streak.50#0` | Hakladığım zombi sayısı elli, bu alemde kral belli! | Elli. Saymayı bıraksam da onlar gelmeyi bırakmıyor. |
| `BK.ult#1` | Açıldılar. Aradan geçeyim! | Şimdi açıklık ara. Sıkışıp kalma! |
| `BK.ult#2` | Önüm boşaldı. Durma Arda! | Tamam, kullandım. Önüne bak Arda! |
| `BK.ult#5` | Vurdum! Uzaklaş şimdi. | Hadi! Bununla bir yol açmam lazım. |
| `BK.zq#5` | Dişlerini gösterme, yol göster. Yol da olur. | Önce ben geçeyim abi. Isırılacak hâlim yok. |
| `BK.zreact#1` | Tamam tamam, not aldım. Sonra konuşuruz. | Tamam, duydum. Ben şimdi uzaklaşayım. |
| `BK.hd02.4#1` | Turist grubu iniyor. Ulan kaç kişisiniz?! | Merdivenden kalabalık geliyor. Kaç kişi var orada? |
| `BK.hd04.2#1` | Sis yükseliyor. Korkuluğa tutunup yürüyorum. | Sis yükseliyor. Korkuluğu gözden kaybetmeyeyim. |
| `BK.hd04.2#2` | Boğazdan sis geliyor. Vapur düdüğü yok. | Haliç'ten sis geliyor. Vapur düdüğü yok. |
| `BK.hd04.4#2` | Boğazdan düdük sesi. Kim çalıyor? | Haliç'ten düdük sesi. Bir vapur mu var? |
| `BK.hd05.5#2` | Kaptanın kendisi de burada, bize doğru geliyor. | Kaptan burada olabilir. Kaan, yavaş gel. |
| `BK.hd06.3#2` | Eve gidebilmek için garı da tamir edeceğiz galiba. | Sarıyer'e gideceğiz diye garı da tamir ediyoruz. |
| `BK.env.break#3` | Bir şey kırdım. Umarım depozitosu yoktur. | Kırıldı. Depozitoyu benden istemesinler de. |
| `BK.env.chain#2` | Bu sokakta kaç tüp var be? | Biri öbürünü tutuşturuyor. Arada kalma! |
| `BK.env.door#0` | Kapı açılıyor. Hazır ol. | Binadan çıkıyorlar. Duvarın dibinde kalma. |
| `BK.env.door#1` | Pencerede biri var. | İçeriden biri çıktı! Mesafeyi koru. |
| `BK.env.door#2` | İçeriden ses geliyor. Kapının önünden çekil. | Binanın içi de doluymuş. Yaklaşma. |
| `BK.env.explode#3` | Bu sokağa kim tüp koymuş be? | Patlayan şeyin yanına gitme. Daha bitmemiş olabilir. |
| `BK.env.extinguish#0` | Söndü. Bir saniye nefes alayım. | Köpük yayıldı. İçinden geçen yavaşlar. |
| `BK.env.extinguish#1` | Köpük ateşi bastırdı. | Köpük ateşi bastırabilir. Yayıldığı yere bak. |
| `BK.env.extinguish#2` | Yangın tüpü ömründe bir kez işe yaradı. | Yangın tüpü görev başında. Bir tek o işini biliyor. |
| `BK.env.shock#1` | Ayaklarım karıncalandı. | Zeminde elektrik var. Ayağımı oraya basmayayım. |
| `BK.ev.barricade#0` | Barikat! Biri güzel hazırlamış, saygılar. | Barikatı sağlam yapmışlar. Ben yanlış tarafta kalmışım. |
| `BK.ev.barricade#1` | Masalar, sandalyeler. Ev yapımı bir kale. | Barikat yolu kesiyor. Bir geçit açmam lazım. |
| `BK.ev.barricade#2` | Burası artık kafe değil, kale. | Burada sıkışmayayım. Barikatın kenarına bak. |
| `BK.ev.blackout#0` | Elektrik gitti. Telefonum çoktan gitmişti. | Elektrik gitti. Korkacak şeyi kendim bulacağım artık. |
| `BK.ev.defend#0` | Burayı tutacağız! Yerinden kımıldama. | Bu alanı tutmam lazım. Çevrilmeden dayan. |
| `BK.ev.pier#0` | Vapur yanaştı. İskele zombi dolu! | İskeleden geliyorlar! Yolunu kapatmalarına izin verme. |
| `BK.ev.pier#1` | Vapur geldi, hepsi bize doğru geliyor anneciğim! | İskeleden kalabalık geliyor. Kenarda kalmayayım. |
| `BK.ev.pier#2` | Sıraya girmediler. Yurdumun zombisi bile aynı. | İskele yine dolu. Bu sefer boşalmasını bekleyemem. |
| `BK.ev.stampede#0` | Bütün sokak geliyor! Kaç Arda! | İnsanlar kaçıyor! Önlerine çıkma Arda. |
| `BK.ev.stampede#1` | Bu kadar kişi beni doğum günümde bile aramadı! | Onlar da kaçıyor. Yol sorulacak kimse kalmadı. |
| `BK.evend.barricade#0` | Mobilyaya bu kadar güvenmemeyi öğrendim. | Yol açıldı. Mobilyayla tartışmamız burada bitti. |
| `BK.evend.lootRunner#0` | Poşet peşinde de koştum. Bugün eksik kalmasın. | Simit tepsisinin peşine de düştüm. Bugün tam oldu. |
| `BK.evend.stampede#0` | Arkamdan hâlâ gelen var mı? | Geçtiler. Arkalarından ne geliyor, ona bak. |
| `BK.evend.stampede#1` | Spora yazılmadım diye üzülüyordum bir de. | Herkes bir yere kaçıyor. Kimsenin adresi belli değil. |
| `BK.evend.stampede#2` | Biraz yavaşlayayım. Nefesim kalmadı. | İnsanlar uzaklaştı. Ben de yoluma bakayım. |
| `BK.hack.alarm.done#0` | Alarm çalıştı! Sese doğru gidiyorlar. | Alarm çalıyor! Sese çekilirlerse buradan geçerim. |
| `BK.hack.alarm.done#1` | Arabaya toplandılar. Ben uzaklaşayım. | Alarm çalıştı. Toplanmadan uzaklaşayım. |
| `BK.hack.booster.done#2` | Bir çubuk sinyal. Şu an bir çubuk altından kıymetli. | Sinyal var. Annemin azarını bile dinlerim şu an. |
| `BK.hack.booster.fail#1` | Hâlâ sinyal yok. Tamamlayamadım. | Güçlendiriciyi açamadım. Bağlantı yarım kaldı. |
| `BK.hack.booster.start#2` | Güçlendiriciyi açmam lazım. Telefon hâlâ çekmiyor. | Güçlendiriciyi açayım. Sinyale ihtiyacım var. |
| `BK.hack.shutter.done#0` | Kepenkler açılsın şenlik başlasın. | Açıldı. Bugün bir şey de önüme engel çıkarmadı. |
| `BK.hack.shutter.done#1` | Kepenk açıldı. İçeri bakabilirim. | Bağlantı tamam. Kutunun yanına bakayım. |
| `BK.hack.shutter.done#2` | Yol açıldı! Buradan geçeyim. | Çalıştı! Ne açıldı, bir kontrol edeyim. |
| `BK.hack.shutter.fail#0` | Kepenk sıkıştı. Hadi ya, şimdi de bu. | Uzaklaştım, bağlantı kesildi. Geri dönmem lazım. |
| `BK.hack.shutter.fail#1` | Kepenk inat etti. Ben de inat ettim. | Tamamlanmadan ayrıldım. Yeniden bağlanayım. |
| `BK.hack.traffic.done#0` | Işık yandı. Zombiler bile benden çok dinliyor bunu. | Kutuya söz geçirdim. Kendime geçiremiyorum daha. |
| `BK.hack.traffic.done#2` | Açıldı! Duraksadılar, fırsat bu. | Çalıştı! Şimdi geçecek bir açıklık bulayım. |
| `BK.hack.traffic.fail#0` | Işık bozuk. Kırmızıda bekleyip yeniden deneyeceğim. | Bağlantı yarım kaldı. Kutunun yanına döneyim. |
| `BK.hack.traffic.fail#2` | Hâlâ kırmızı. İstanbul'a kimse söz geçiremiyor. | Bitiremedim. Şu bağlantıya yeniden bakmam lazım. |
| `BK.hack.tram.done#1` | Hareket etti! Rayların önünden çekil. | Tramvay devrede! Raylardan uzak dur. |
| `BK.hack.tram.done#2` | Tramvay yolu açıyor. Kenarda bekleyeyim. | Tramvay geçene kadar kenarda bekle. |
| `BK.hack.tram.fail#1` | Bağlantı kesildi. Tramvay hâlâ duruyor. | Bağlantı koptu. Kontrolü açamadım. |
| `BK.obj.done#1` | Tamam, temiz ve hızlı. | Tamamlandı. Bir de etrafıma bakayım. |
| `BK.obj.fail#1` | Ulan yaa ucu ucuna kaçtı. | Bu olmadı. Burada takılıp kalmayayım. |
| `BK.rescue#3` | Bir can daha. Bugün iyi gidiyor. | Bir kişi daha kurtuldu. Boşuna gelmemişim. |
| `BK.sig.back#0` | Sinyal geldi! Anne, duyuyor musun? | Sinyal geldi! Annemi aramayı deneyeyim. |
| `BK.sig.back#2` | Bir çubuk! Bu bir mucize. | Telefon çekiyor. Hâlâ ulaşma şansım var. |
| `BK.sig.lost#2` | Yine kesildi. Annem seslendiğimi duydu mu acaba? | Yine sinyal yok. Annem ararsa bana da ulaşamaz. |
| `flav.sawblade#0` | Şantiyeden kaptım. Elime de ne güzel yakıştı. | Testere diski. Sapı yok. Güven duygusu da yok. |
| `flav.torch#0` | Mangal için almıştım. Plan biraz büyüdü. | Bununla mangal yakılırdı. Daha sakin bir gün olsa. |
