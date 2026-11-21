# Turkish story editor — 2026-11-19

Scope: the current native Turkish opening, calls, comic pages and level story pops. Implemented edits are limited to existing beats in L1–30. Read the later authored Chapter 1 script/finale and Chapters 2–3 narrative plan for continuity; no post-L30 production changes. Core dialogue was reviewed and retained. This is the story editor's contribution to the parent audit, not an independent sign-off on audio, images or a phone playthrough.

## Assessment

The story has a strong emotional basis: Arda's ordinary trip home becomes a search for his family; Kaan first looks dangerous, proves useful, then becomes someone Arda chooses to wait for. Nuri's first-day memory is the strongest early comic beat because it turns a boss into a person. The repeated meal question works when it means parental care. The two-source mystery — a comforting radio bulletin versus Dad's private warning — can sustain the larger story. These strengths should carry the humor, instead of adding a gag to every speech bubble.

The current first-30 arc is clearer after this pass, but quality and player retention cannot be established by lint or editorial confidence. The later outline still needs the continuity work listed below. Do not claim an exceptional story or zero logical flaws.

## Implemented

- **A practical reason for the home stop.** Sending Arda away from Sarıyer solely to collect paper directions was too weak. C05 now tells him to collect his already-canonical scooter as well as Dad's map; failed image transmission explains the physical map. E5 explicitly commits to home, the two items, then Sarıyer. The scooter exists in the narrative bible's Chapter 1 arrival plan, so this foreshadows existing content rather than adding a mechanic.
- **Knowledge before reaction.** At L30 Mom says Dad returned from the highway before Arda asks what he saw. Arda no longer asks which roads as if the earlier map conversation never happened. L15 says the family remains at Grandpa's rather than re-announcing arrival; the former wording was ambiguous, not necessarily a contradiction.
- **People before jokes.** The wedding comic follows Arda's hope of finding survivors: music continues, human voices do not, meals were abandoned. He hopes people escaped. The replacement scene requested by the parent has a partially cut cake, so the script no longer claims an untouched cake behind glass. Artwork source inspection and renderer checks belong to the parent audit; no rendered-page acceptance is claimed here.
- **Earned trust.** The bridge caption acknowledges Kaan now directing his fish at the zombies; it does not treat a stranger who just threatened Arda as an established friend. At the boat, Kaan actually calls for Nuri. Arda notices the lack of response and stays with Kaan instead of repeating the travel bargain. The L18 immediate question/reply and the L20 introduction remain intact.
- **Accurate moment-to-moment meaning.** L7 warns conditionally about acid instead of claiming a hit that may not have happened. L28 names the fuse as the shared power problem; it does not imply a working clock causes a gate to open. L27 names the station worker's role and asks Arda to stay nearby, matching the escort's proximity requirement in sirkeci-trial.js. The unnamed Galata musician no longer acquires an unearned name in Arda's narration.
- **Restraint.** Existing dry humor about the abandoned dürüm, fish weapon, maternal coat advice and narrow stair etiquette stays. Nuri's memory, Arda's offer to wait and Kaan's refusal to stay stay untouched. L05m is practical combat guidance, so its joke marker was removed. No new scene, beat key, branch, interruption, gameplay value or English dialogue was added by this editor.

## First-30 causal readthrough

| Span | What Arda knows / wants | Change in the relationship or question |
|---|---|---|
| L1–4 | Escape; reach home; calls establish broken transport and a highway warning. | Panic gives way to a concrete walking route. Existing D-119 diner speaker and threat-response work is preserved. |
| L5 | Family has left; collect scooter and Dad's route map, then reach Sarıyer. | Home remains necessary without pretending the family is still there. |
| L6–10 | Get through Galata; wedding music and light might mean survivors. | The next district offers a human possibility, not just another boss. |
| L11–15 | Follow that possibility; Paşa notices danger; family safety is confirmed. | The wedding's silence disappoints that hope. The cat gives the solitary walk company. |
| L16–20 | Survive the bridge and resolve a stranger's suspicion. | The bite question gets its immediate answer. Names and plans are shared after survival. Kaan wants to check his captain. |
| L21–25 | Reach Nuri's boat with Kaan. | The unanswered call becomes a loss. Kaan's memory explains the bond; Arda gives him time instead of a punchline. |
| L26–30 | Stay together, help the worker and cross the station. | Dad's firsthand highway knowledge turns the map into a question about him. The next destination is still home. |

## Later authored content — findings only, no production changes

1. **Make the home pickup visible before post-L30 production.** The canon promises Dad's toolkit and Arda's scooter, but the current finale stages the letter and Mila rather than the retrieval, and FINb9 says three people will walk. The new early scooter motive makes it especially necessary to show the scooter, its condition/charge and the collected map at arrival. A useful payoff is an action panel, not another explanatory phone call.
2. **Resolve the highway exception.** The Chapter 2 outline explicitly sends the party onto D-100 after Dad's repeated highway prohibition. A clearly motivated unavoidable crossing or a deliberate decision with consequences must precede it. It cannot read as forgotten instructions.
3. **Keep the route causal.** Several later district introductions are attractive observations without saying why this route is necessary. Before expanding, connect detours to visible blocked passages, a resource, a person or a concrete choice. Avoid turning the walk into a sightseeing list while family urgency remains unresolved.
4. **Give the mystery intermediate changes.** From the L30 suspicion to the letter at L100, many chapters repeat hazards or the forest bulletin without materially changing what Arda knows. The garage already supplies a strong personal dimension (Kaan's unfinished shop); use that model to alternate relationship developments, credible evidence and local consequences. A repeated clue is not automatically escalation.
5. **Protect Ahmet Abi's aftermath.** The later script builds a personal connection and the boss speaks in broken bread-and-door fragments. The finale immediately finds his booth empty. Before production, verify an unhurried response to his loss so that the revelation is not swallowed by the letter and Mila's arrival. Nuri's early treatment sets the audience's expectation.
6. **Preserve the corrected Mila exchange.** Mila now asks about Arda's family and hears Sarıyer before suggesting shared travel. The old apparent mind-reading is not present in the current finale; no rewrite needed. Kaan's grandmother being with cousins is also explicitly established before the garage rest.

## Validation

Final `node prototype/tools/test-dialogue.js` passed after the scooter/art wording: 583 beats, TR 1,202 lines and EN 1,205 lines, with matching seeded simulation digest `12d2b67db8`. The run reports zero over-limit lines, zero off-ratio pools and zero duplicates; one existing non-strict translationese/Britishism note remains in the shared store. Parent owns integrated lettering, image, scene and audio verification. This test does not verify timing, acting, emotional response, iPhone readability or a full campaign.

The baseline is a local snapshot at /tmp/istanbul-tr-story-editor-before-20261119. The table below records all actual changes against that snapshot, preserving pre-existing Audit9/D-119 work. English is shown verbatim for review context and was not used as a translation source or edited by this editor. After this editor completed the first pass, the parent independently adjusted English H03i1a/H03i1b to match the shared wedding artwork; the table now includes those final English lines. All other English remains untouched by this narrative pass. 16 Turkish text lines changed; 1 additional metadata-only change.

## Full before/after review table

| Key | Where | Turkish before | Turkish now | Current English, unchanged by this editor |
|---|---|---|---|---|
| `C05c` | L5 opening call · Mom | Eve uğra oğlum. Baban geçebileceğin sokakları haritada işaretledi. Mutfak masasında. | Evden scooter'ını al. Babanın haritasını da al; fotoğrafını gönderemiyorum. | Go home first. Your dad put the safe streets on a map for you. It's on the kitchen table. |
| `C05d` | L5 opening call · Arda | Tamam. Sen neredesin? | Tamam, eve uğrayıp alırım. Nereye gittiniz? | I'll get it. Where am I meeting you? |
| `C15a` | L15 opening call · Mom | Arda? Dedene vardık. İyiyiz oğlum. Sen neredesin? | Arda? Dedendeyiz, iyiyiz oğlum. Sen neredesin? | Arda? We made it to Grandpa's. Where are you now? |
| `C30c` | L30 call · Mom | Mutfaktaki notu al. Baban hangi yollardan gitmen gerektiğini yazdı. | Mutfaktaki notu al. Baban otoyoldan dönmüş. Geçebileceğin yolları yazdı. | Find Dad's note in the kitchen. He marked the roads you can still take. |
| `C30d` | L30 call · Arda | Hangi yolları? Babam nereden biliyor? | Otoyola mı gitmiş? Ne gördü orada? | Which roads? What happened out there? |
| `C30e` | L30 call · Mom | Otoyola çıkmayın. Baban o tarafı gördü. Orada... [cızırtı] | Otoyola çıkmayın, diyor. Orada gördükleri... [cızırtı] | Stay off the highway. Your dad saw what was on it. It was [static] |
| `E5c` | L5 closing comic · Arda thought | Sarıyer dedi. Önce evdeki notu alacağım. Babam bir yol düşünmüştür. | Önce eve. Scooter'ı ve haritayı alıp Sarıyer'e gideceğim. | Sarıyer. Kitchen first. Dad's note might tell me how to get there. |
| `L05m` | L5 boss guidance | Raylar parlayınca yana kaç. Vatman çanı çalınca da dibinde durma. (j: 1) | Raylar parlayınca yana kaç. Vatman çanı çalınca da dibinde durma. (j removed) | The Vatman rings before he hits. If the rails light up, get across them. |
| `L07m` | L7 midpoint | Asit ayakkabıma yapışıyor. Kuru yerden geçeyim. | Aside basarsam yavaşlarım. Kuru yerden geçeyim. | Acid puddles. You won't slip in them, but you'll slow down. |
| `H02i1a` | L6 intro · panel 1 caption | Galata merdivenleri. Sokak müzisyeni Barış, boş sokağa çalıyor. | Galata merdivenleri. Bir müzisyen, bomboş sokağa çalıyor. | Galata's stairs. A musician plays beneath the lanterns, alone. |
| `H03i1a` | L11 intro · panel 1 caption | Karaköy. Düğün salonunun kapısı kapalı. Vitrinde dokunulmamış bir pasta. | Karaköy. Düğün salonunda müzik var, insan sesi yok. Masalarda yarım kalmış tabaklar. | Karaköy. Wedding music, abandoned plates, empty chairs. |
| `H03i1b` | L11 intro · panel 1 thought | Düğün pastası. Gelin de damat da yok. Bir dilim alsam mı? | Umarım arka kapıdan çıkmışlardır. | Please tell me they found a back door. |
| `H04i3a` | L16 intro · panel 3 caption | Adam zombilere balıkla vuruyor. En azından yalnız değilim. | Balığı şimdi zombilere savuruyor. Ben de o tarafa geçebilirsem konuşuruz. | Someone out there is fighting zombies with a fish. I like him already. |
| `H05i3a` | L21 intro · panel 3 Kaan | Tekne halatını çekiştiriyor. Güvertede biri var. | Güvertede biri var. Kaptan! Biziz! | There's a light on his boat. Captain? Captain! |
| `H05i3b` | L21 intro · panel 3 Arda | Tamam. Kaptanına bakalım. Sonra birlikte yola çıkarız. | Ses vermedi. Yakından bakalım. Yanındayım. | Wait, Kaan. We'll check it together. |
| `H06p3` | L28 opening pop | Saat de kapı da aynı panoya bağlıymış. Biri çalışırsa öbürü açılır. | Saatle kapı aynı panoya bağlı. Sigortayı bulursam kapıyı açabilirim. | One fuse for the clock and the gate. Of course. |
| `H06m2` | L27 midpoint | Anahtarlar onda. Gözünden kaybolmayayım. | Görevli kapıyı açacak. Yanından ayrılmayayım. | He's got the keys. Stay where he can see me. |
