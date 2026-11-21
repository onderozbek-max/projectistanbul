# Owner ledger: what Onder asked for, and where the repo keeps it

Generated 2026-11-14 for the Codex handoff. It lists every instruction, decision, answer, preference, correction, playtest note and open question the owner typed since the project started (2026-11-08 to 2026-11-14, 176 messages). Pasted audits, telemetry and file pastes are not owner speech; they appear here only as context.

Question-box answers are included. The owner answered 22 multiple-choice questions in 10 answer blocks (2026-11-10 to 2026-11-13). The first pass missed them. They are rows tagged [QB] in sections 2 and 4, dated at the answer time, and merged into reviews/owner-messages-archive.md.

Rules for reading it:
- Later entries win. A row marked SUPERSEDED was replaced by a later message or decision.
- Paths are relative to the repo root. `D-0xx` means the decision log in `docs/product.md` section 17.
- Status values: CAPTURED (a doc holds it), IMPLEMENTED (code or assets exist), PARTIAL (some part is missing), MISSING (in no file), CONTRADICTED (the repo says something else), SUPERSEDED (replaced or historical), IN PROGRESS.
- Do not treat a "PARTIAL" or "CONTRADICTED" row as done. Check it with the owner or with the phone before you rely on it.

## 1. Working rules and preferences

**2026-11-16, follow-up:** Owner asks for another pass so every dialogue is clear, carries
the narrative and sustains dark humor/atmosphere and interest. Explicit permission to revise
in-game lines and add necessary dialogue/comic content without disrupting play. Implemented
as the local D-103 proposal; see `TR-NARRATIVE-PASS2-2026-11-16.md`.

**2026-11-16:** Owner requests a complete audit and necessary revamp of Turkish dialogue:
natural Turkish that makes sense, comedy informed by Leyla ile Mecnun / South Park /
Rick and Morty without forcing it, and coherent comic-book exchanges that build involvement.
Local revision and comparison: `TR-DIALOGUE-AUDIT-2026-11-16.md`; D-100 remains proposed.
This is a new whole-script revision request, including previously approved wording where needed.

| date | item | status | where |
|---|---|---|---|
| 2026-11-16 | Use current ImageGen art and place vehicles and scenery in the gameplay perspective across existing and future Bölüms. Retired artwork must stay out of ordinary play. | CAPTURED | docs/design-system.md §12.1; AGENTS.md |
| 2026-11-08 | "Whatever you recommend" or "I pre-approve your suggestion" delegates the call. Decide, log the decision, and say so. | CAPTURED | docs/handoff-codex.md section 4 |
| 2026-11-08 | Commit and push only when he says so. Pushing to his GitHub repo was allowed. Do not push to main or merge without asking. | CAPTURED | docs/handoff-codex.md sections 1 and 4 |
| 2026-11-08 | He plays on an iPhone and does not read code. Phone problems come as screenshots and telemetry pastes. | CAPTURED | docs/handoff-codex.md sections 1 and 4 |
| 2026-11-08 | Report plainly: what changed, what was seen, what is not verified. Do not say "works on the phone" unless he confirmed it. | CAPTURED | docs/handoff-codex.md section 4; reviews/EXPERT-REVIEW-2026-11-14.md section 7 |
| 2026-11-08 | Every phone bug gets a test that would have caught it. | CAPTURED | reviews/EXPERT-REVIEW-2026-11-14.md section 7 |
| 2026-11-08 | Keep reviews/REVIEW-R1.md as the running log. Put open decisions in reviews/QUESTIONS.md. | CAPTURED | docs/handoff-codex.md section 4 |
| 2026-11-09 | Dialogue brief: run it phase by phase, stop at each gate, do not decide the section 10 owner questions yourself, use the stated defaults and list them. | CAPTURED | reviews/BRIEF-DIALOGUE-2026-11-09.md sections 8, 10, 12 |
| 2026-11-10 | Native Turkish, not English translated. He said a translated approach was wrong if native writing was possible. Voice lines are never translated. | CAPTURED | docs/product.md D-051; docs/handoff-codex.md section 3 |
| 2026-11-10 | English dialogue: he made the agent the English decision-maker ("you are the decision maker for english"). | CAPTURED | docs/product.md D-053 (no native English reader yet) |
| 2026-11-10 | After he finishes his Turkish review, adjust the whole Turkish set to his tone and humour. | PARTIAL | tone is in docs/product.md D-052; no record of a whole-set pass. Next: after his TR review, run one whole-set tone pass (D-052 tone rules). |
| 2026-11-10 | Every comic screen and its dialogue must be approved or rewritten by him, as a patch to the previous phase. | PARTIAL | reviews/dialogue/tr-comics-full.csv (163 data rows; about 103 "keep" and 60 "rewrite" cells, 0 "approved"); the approved comic patch (branch dialogue/comics-patch, commit 4e6aad6 "all approved") was merged into the active line on 2026-11-14 (4007a47), which also brought in reviews/dialogue/FINDINGS-comics.md. Next: four merged lines need his call (reviews/QUESTIONS.md, 2026-11-14 "comics patch"). |
| 2026-11-10 | Tell him the percent of implementation done and what is left. If past 50%, he moves implementation to another agent and the AI does review and prompts. | PARTIAL | no percentage in the repo; the handoff itself is this transfer (docs/handoff-codex.md) Next: state a percent with a stated basis in docs/handoff-codex.md section 5. |
| 2026-11-10 | Stay committed to the plan. Do not forget items. | CAPTURED | reviews/EXPERT-REVIEW-2026-11-14.md section 6; docs/execution-plan.md R1 |
| 2026-11-11 | "Plain and simple, what do you need me to do?" Give one clear action list. | CAPTURED | reviews/EXPERT-REVIEW-2026-11-14.md section 7 (owner packet on one screen) |
| 2026-11-11 | Do not send him to nested files for a simple question. Decide the point yourself. Say how to test in one step. | CAPTURED | reviews/PLAYTEST-GUIDE-R1.md top rule (2026-11-14); docs/handoff-codex.md section 4 (decide the point). |
| 2026-11-12 | "I don't understand what you need from me. Be more clear." Show the decisions he must make in one short list. | CAPTURED | reviews/EXPERT-REVIEW-2026-11-14.md section 7 |
| 2026-11-12 | Wait for his go before the next step ("push, wait for my go to start step 4"; 2026-11-13 "wait for my for t4"). | CAPTURED | AGENTS.md workflow step 4 ("stop and wait for feedback"); reviews/EXPERT-REVIEW-2026-11-14.md section 6 |
| 2026-11-13 | Turkish lines: list every line that needs approval or rewrite in one table. "Everything else is approved." | CAPTURED | docs/handoff-codex.md section 4; reviews/TR-REVIEW-D060.md; reviews/TR-REVIEW-R1-T4.md |
| 2026-11-13 | Do not wait for his music before making other progress. | CAPTURED | reviews/OWNER-LEDGER.md section 1 (this row). The handoff rule is being added by another agent. |
| 2026-11-13 | Music: give him each song's name and the exact Suno prompt. He uploads all songs into one folder. | CAPTURED | prototype/audio/music-suno/README.md; docs/product.md D-062 |
| 2026-11-13 | Hades (Supergiant) is the musical north star. | CAPTURED | prototype/audio/music-suno/README.md line 5 |
| 2026-11-13 | Do not wait for telemetry before you progress; he pastes it when he can. | CAPTURED | reviews/OWNER-LEDGER.md section 1 (rule row, 2026-11-14). Same rule as the music row. |
| 2026-11-14 | ChatGPT is the artist and creates all assets. Prompts must be very specific: context and exactly what to create, in as much detail as possible. | CAPTURED | art/commission/chatgpt/ (prompts, PROJECT-INSTRUCTIONS.md, STYLE-BIBLE.md); docs/handoff-codex.md section 6. Decision D-066 is still PROPOSED (see section 2) |
| 2026-11-14 | Codex (ChatGPT app, with access to folders on this Mac) becomes the implementation agent. | CAPTURED | docs/handoff-codex.md (title and section 1); AGENTS.md (read order, item 0) |
| 2026-11-14 | Honest expert audit and phased roadmap, passed to Codex as the previous agent's review. | CAPTURED | reviews/EXPERT-REVIEW-2026-11-14.md |
| 2026-11-14 | The handoff must be lossless and fault-proof. Rewrite the handoff prompt if needed. | IN PROGRESS | this ledger; docs/handoff-codex.md section 9 (self-check questions) |
| 2026-11-08 | Pick up the Godot project in the repo and continue. | SUPERSEDED | docs/handoff-codex.md section 1 pauses Godot and the JS prototype is the active build. The pause is the lead's decision; no later owner message says it |
| 2026-11-08 | Phase words and go-aheads ("start phase b", "start phase 3", "start", "go", "yes", "continue", "carry on"). | SUPERSEDED | each applied to the step in view; no standing rule |
| 2026-11-08 | Xcode and iOS export errors pasted; he did not know the bundle ID. | SUPERSEDED | the Godot export path is paused (docs/handoff-codex.md section 1). Team ID: see the sensitive-data note at the end |
| 2026-11-08 | First build looked nothing like the image he shared: "what exactly do you need me to review?" | SUPERSEDED | historical; current review path is reviews/REVIEW-R1.md and reviews/PLAYTEST-GUIDE-R1.md |

## 2. Decisions

| date | item | status | where |
|---|---|---|---|
| 2026-11-08 | Drop ayran, tereyağ, çatal and the other meaningless level-up items. Replace the weapon kit (Döner Knife, Nail Gun, Gas Canister, Bike Chain). | IMPLEMENTED | docs/product.md D-017; no "Ayran" in prototype/js/config-weapons*.js |
| 2026-11-08 | Arda's signature weapon is the knife, not the fork. Nail Gun in, Slingshot out. | CAPTURED | docs/product.md D-018 |
| 2026-11-08 | Cold open about 28 s, no manual stab. | CAPTURED | docs/product.md D-019 |
| 2026-11-08 | Clickable district map: 17 km walk home, level nodes, gear screen, return from results (agreed). | IMPLEMENTED | docs/product.md D-027; docs/journey.md; "17 km" in prototype/js/strings.js |
| 2026-11-08 | Player skill: one-thumb dash on swipe, or a charged special (yes). Nazar Patlaması as the charged ultimate. | IMPLEMENTED | docs/product.md D-031 (still says Kaçış; another agent is updating it); prototype/js/sim/skills.js. Dash name is Depar (section 4). |
| 2026-11-08 | Weapon evolutions, for example Knife + Gloves becomes Usta's Cleaver. Not reachable in Level 1 (100%). | IMPLEMENTED | docs/product.md D-030; prototype/js/strings-weapons.js ("Usta's Cleaver") |
| 2026-11-08 | Music: he composes in Suno Pro. The code makes the sound effects. | PARTIAL | docs/product.md D-029, D-062, D-063; prototype/audio/music-suno/ and sfx-gen/ (see the phone rows) Next: close with the iPhone audio check (see the music rows). |
| 2026-11-08 | Blood (red) is the default, not ink. | CAPTURED | docs/product.md D-024 (rating pre-check still open) |
| 2026-11-08 | Elites in Level 1 (agreed). | CAPTURED | docs/product.md D-022 (Level 1 elite not re-checked in code) |
| 2026-11-08 | Level-up shockwave (pre-approved). | IMPLEMENTED | docs/product.md D-023; prototype/js/main.js |
| 2026-11-08 | New XP curve (pre-approved). | SUPERSEDED | D-025 (exponent 1.4 to 1.6) was replaced by D-061 (30 + 5 x L^1.6) and D-064 (32 + 11 x L^1.6) |
| 2026-11-08 | Camera may show the sidewalks (D-026). His text has no reply to this item. | CAPTURED | docs/product.md D-026 says "owner approved"; confirm with him |
| 2026-11-08 | Open audit items: knife signature, 28-second opening (both pre-approved). | CAPTURED | docs/product.md D-018, D-019 |
| 2026-11-08 | Should Mom's call affect gameplay? (he pre-approved the suggestion). | CAPTURED | docs/story-presentation.md section 5 (recorded 2026-11-14). The suggestion text is not in the log, so the effect is still undefined. |
| 2026-11-08 | The Ataköy boss is "SAYIN ABİM". | IMPLEMENTED | docs/product.md D-039; prototype/js/strings-journey.js; prototype/js/story/strings-story.js |
| 2026-11-08 | Chapter 1 ends at Ataköy. Sirkeci (Level 30) is a build milestone, not the chapter end. | CAPTURED | docs/product.md D-040 |
| 2026-11-08 | Chapter 1 is 100 levels in 20 neighbourhoods, from Taksim to Ataköy, each with its own street, boss and zombie types. | IMPLEMENTED | docs/product.md D-027; prototype/js/journey.js |
| 2026-11-09 | Late levels: the player gets stronger, and stronger new enemies appear as they progress. | CAPTURED | docs/product.md D-041, D-042 |
| 2026-11-09 | End-of-level progression: kill count per character, thresholds raise attributes (STR, PACE, AGG, INT, CHA, GRIT). | CAPTURED | docs/product.md D-033, D-043, D-044; docs/attributes.md |
| 2026-11-09 | Intelligence works through hacking tasks. | CAPTURED | docs/product.md D-034; prototype/js/sim/hack.js |
| 2026-11-09 | Weapon forks and mastery. Mastering Piknik Tüpü gives a big blast (rank-5 signature Mangal Partisi). | CAPTURED | docs/product.md D-032; prototype/js/strings-weapons2.js ("Piknik Tüpü") |
| 2026-11-09 | Street cred: pre-approved suggestion. Facts and comedy: ok. Kaan joins at Level 20. Boss names: pre-approved. | CAPTURED | docs/product.md D-043, D-048, D-045, D-046 |
| 2026-11-09 | Fonts: "yes you may". | CAPTURED | docs/product.md D-038 (resolved; updated by another agent). prototype/assets/fonts/ has Bangers and ComicRelief with OFL texts. |
| 2026-11-09 | Remove forced Turkish weapons (tea tray, umbrella, backgammon pieces, chestnut brazier). Keep real weapons (fireworks, fire extinguisher). | IMPLEMENTED | docs/weapons-skills.md (the four are "Retired in v0.5 (forced)"); docs/product.md D-030 (Havai Fişek, Yangın Söndürücü) |
| 2026-11-09 | Characters must look charming and attractive, with backgrounds, and be relatable. Full creative freedom. | CAPTURED | docs/product.md D-049; docs/characters.md |
| 2026-11-09 | Kaan: handsome, blond, blue eyes. No underchin beard, no stereotype look. | IMPLEMENTED | docs/characters.md lines 59 and 177; prototype/js/view/comic-busts-cast.js line 25 (gold hair). Beard removal on the bust art not checked |
| 2026-11-09 | Stay 2D, borrow 2.5D tricks, and improve firing, impact, walking and driving animation. | CAPTURED | docs/product.md D-050 (still PROPOSED) |
| 2026-11-09 | Lights out in the city: use a glitch, not a blackout. | IMPLEMENTED | prototype/js/view/events-fx.js lines 162 and 175 (blackout glitch tear, lamp dip); reviews/A11Y-CHECKLIST-R1.md lines 43-44 |
| 2026-11-09 | No seagulls indoors. | IMPLEMENTED | prototype/js/config.js line 137 ("no gulls") |
| 2026-11-09 | Two native scripts: Turkish jokes only in Turkish, English jokes only in English. | CAPTURED | docs/product.md D-051 |
| 2026-11-09 | Dad's letter ends with "Baban" (no "B" shortening). | IMPLEMENTED | prototype/js/dialogue/tr/core.js line 24 |
| 2026-11-09 | Turkish name for the bloater: "Dombili". | IMPLEMENTED | prototype/js/dialogue/tr/core.js line 6 |
| 2026-11-09 | Death screen gets a rotating Arda line. He gave one: "Biz bitti demeden bitmez." | IMPLEMENTED | prototype/js/dialogue/tr/core.js (the line is present) |
| 2026-11-10 | Seaside hoods get seagulls, inland hoods get pigeons, every hood gets stray cats (white-brown, orange, brown). | IMPLEMENTED | docs/product.md D-055 (2026-11-10 update); prototype/js/config-fauna.js (birdLook) |
| 2026-11-10 | Enemy wave 1: fisher, musician and hamal skins, plus marti (seagull thief) and cayci (tea carrier). Creative extras beyond the first three (his question). | IMPLEMENTED | docs/product.md D-055; reviews/AUDIT-ENEMIES-2026-11-10.md; prototype/js/config-enemies5.js |
| 2026-11-10 | Thief placement: "decide it yourself", then he accepted the recommendation. | IMPLEMENTED | reviews/REVIEW-R1.md lines 11-13 (no thief in H01 to H04); prototype/js/config-levels.js (thief fromHood 4) |
| 2026-11-11 | Sombrero-shaped hats are wrong for Istanbul. | IMPLEMENTED | docs/product.md D-058; reviews/REVIEW-R1.md (caps) |
| 2026-11-11 | Zombies must not come up from below the ground (no manhole spawns). | IMPLEMENTED | docs/product.md D-058 (check-entrances fails on any manhole spawn) |
| 2026-11-10 | Five-part revision list: cartoon art quality, in-game animation and feel, Istanbul-specific arenas, cross-level skill tree and progression, enemy audit. | PARTIAL | docs/product.md D-054 (milestone R1); D-057, D-059, D-066 (proposed). Still open in his 2026-11-13 and 2026-11-14 feedback. Next: owner review of D-066 (raster route, still PROPOSED) and the other four parts. |
| 2026-11-10 | Arenas and comic backgrounds are authored vector art. Characters stay procedural. | CAPTURED | docs/product.md D-057 (accepted) |
| 2026-11-10 | Street-mild Turkish profanity; two sexual riddles kept as a deliberate exception. | CAPTURED | docs/product.md D-052; open check against the 16+ target in docs/business-plan.md section 6 |
| 2026-11-11 | Accept the proposed Turkish line: "Kanalizasyon kapağı hareket ediyor. Kaçmalıyım." | IMPLEMENTED | prototype/js/dialogue/tr/barks-world.js |
| 2026-11-12 | Parallax skyline: yes. | IMPLEMENTED | prototype/js/view/arena-sky.js; reviews/REVIEW-R1.md part 6 |
| 2026-11-12 | Ataköy is a modern neighbourhood with trees. The repeating "wallpaper" ground must be fixed. | IMPLEMENTED | reviews/REVIEW-R1.md lines 551-566 (new courtyard slabs and tree shade) |
| 2026-11-12 | Laundry in Laleli and Samatya: small and pale. Reply: "ok good". | CAPTURED | reviews/REVIEW-R1.md (overhead sheets) |
| 2026-11-12 | Famous places from Kapalıçarşı to Ataköy: Topkapı Palace, Yedikule dungeons, Zeytinburnu shore, Haliç–Balat, Bakırköy shore. | IMPLEMENTED | docs/product.md D-060 (accepted 2026-11-13); docs/journey.md; docs/hoods-bible.md |
| 2026-11-12 | Second Look terminal label uses his wording "ZAYIF BAĞLANTI". | IMPLEMENTED | reviews/REVIEW-R1.md line 1857 |
| 2026-11-12 | Backdoor: "yes", lengthen the tram crush lane. | IMPLEMENTED | docs/skill-tree.md (INT row); prototype/js/sim/hack.js |
| 2026-11-12 | Stubborn (grit 4): "any suggestions", delegated. The perk is named İnatçı. | IMPLEMENTED | prototype/js/meta/strings-tree.js line 51 |
| 2026-11-12 | Perk texts he wrote (Kaba kuvvet, Kedi refleksi, Seri Katliam, İkinci Bakış, İnatçı). | IMPLEMENTED | prototype/js/meta/strings-tree.js; reviews/PERK-TEXT-R1-T5.md |
| 2026-11-14 | Streak words (DEVAM, EFSANE, VAHŞET) appear about a third as often. | IMPLEMENTED | prototype/js/view/moments.js lines 59-61 (gap throttle) |
| 2026-11-12 | Street Tree: cross-level perks. Street cred buys perks only. Ready points go only to attributes. One free respec per chapter. | CAPTURED | docs/product.md D-059; docs/skill-tree.md |
| 2026-11-12 | Q4 answer: the 24 perk texts (texts in reviews/PERK-TEXT-R1-T5.md). | CAPTURED | docs/product.md D-059; reviews/PERK-TEXT-R1-T5.md |
| 2026-11-13 | Voice slider: "do we even have voice?" Removed. | IMPLEMENTED | reviews/REVIEW-R1.md line 1211 (T4 part 9); prototype/js/view/settings.js line 46 |
| 2026-11-13 | Results screen: make the next cut now (yes). | IMPLEMENTED | prototype/js/story/strings-finale.js ("2. Kısım · Sarıyer'e Yolculuk.") |
| 2026-11-13 | HUD at 150%: he accepted the shrunken objective title. | CAPTURED | reviews/REVIEW-R1.md "Owner items recorded at handoff" (accepted 2026-11-13). |
| 2026-11-13 | Pacing: 10 levels in 5 to 10 minutes is too fast, and 100 levels in Chapter 1 end the game too soon. "Address asap." | PARTIAL | docs/product.md D-061 and D-064 (route x1.25, two crates per level); reviews/CONTENT-LENGTH-R1.md section 0. Next: rerun the bot (about 4.1 min per level against 5 to 5.5) and log the result. |
| 2026-11-13 | Challenge ramp from Level 2. He chose "Full ramp (Recommended)" in a question box on 2026-11-13 (reviews/owner-messages-archive.md). | CAPTURED | docs/product.md D-061 (horde density and difficulty held for owner decision) |
| 2026-11-14 | Boss fight length of 2.9 minutes is good. | CAPTURED | docs/product.md D-068 (added by another agent; check it is there before handoff). |
| 2026-11-13 | Adrenalin rename and pacing package P1. No separate owner brief exists in his messages; the naming was most likely the previous agent's recommendation under his "whatever you recommend" of 2026-11-13. His 2026-11-13 question "are we referring to the same language when we say a level?" is the trigger. | CAPTURED | docs/product.md D-064 |
| 2026-11-13 | Nightmare and Night Shift: build them now. | IMPLEMENTED | docs/product.md D-065; prototype/js/config-modes.js; prototype/js/strings-modes.js |
| 2026-11-13 | Hint text "Eczane: Dokun ve iyileş". | IMPLEMENTED | prototype/js/strings-hints.js |
| 2026-11-13 | Add a kiosk (he did not name the hood). | PARTIAL | kiosk props exist in prototype/js/config-levels.js and config-layouts.js; the hood is not recorded. Next: pick the hood (owner: "whatever you recommend"), place it, log it. |
| 2026-11-13 | SFX: which AI sound tool? (ChatGPT or Suno?) | CAPTURED | prototype/audio/sfx-gen/BRIEF.md (owner status, 2026-11-14). The owner made the files himself; the tool is not named in the log. |
| 2026-11-13 | SFX batch 1: is it from brief.md or a separate list? | CAPTURED | prototype/audio/sfx-gen/BRIEF.md (45 cues in four batches) |
| 2026-11-14 | Songs made in Suno, placed in prototype/audio/music-suno/. Suno cannot add the 1.5 s tail; a workaround is needed. | IMPLEMENTED | prototype/audio/music-suno/ (8 files); prototype/audio/music/ (8 mp3); prototype/tools/prepare-music.js; docs/handoff-codex.md section 7 |
| 2026-11-14 | SFX made by him, placed in prototype/audio/sfx-gen/. | PARTIAL | docs/handoff-codex.md section 5: the uiTap regeneration was rejected, so that cue is still synthesized. Next: regenerate uiTap or accept the synthesized cue. |
| 2026-11-14 | Row 28 should say "bölgeyi". Seed name: "Gece Kapısı". | IMPLEMENTED | prototype/js/strings-modes.js line 43 (bölgeyi), line 50 (Gece Kapısı) |
| 2026-11-14 | "Assets are created." | CAPTURED | art/commission/TRACKER.csv now 419 generated, 0 todo, 0 approved (2026-11-14). Visual approval is still open. |
| 2026-11-14 | Gate for "no-art fixes": "start". | SUPERSEDED | given at 2026-11-14 07:38 (message "4/ start") |
| 2026-11-14 | Music: "now I hear no music at all" after the fixes. | PARTIAL | reviews/REVIEW-R1.md T4 part 19 says the silent-switch fix is in; not verified on the phone. Next: phone check with the Suno files in prototype/audio/music/. |
| 2026-11-10 (answer 08:23) | Commit contents for dialogue/two-native-scripts: "Dialogue only, split index.html (Recommended)" [QB] | SUPERSEDED | Historical git choice. The PR is still open (docs/execution-plan.md T0). |
| 2026-11-10 (answer 20:24) | Where the comic patch goes: "New dialogue/comics-patch (Recommended)" [QB] | PARTIAL | The branch name is not in the docs. Next: list dialogue/comics-patch in docs/handoff-codex.md (cold-start trap 5). |
| 2026-11-12 (answer 09:20) | Rule 2 caps perk numbers: "Percent stat bonuses only (Recommended)" [QB] | CAPTURED | docs/skill-tree.md line 86 (2026-11-12 note). |
| 2026-11-12 (answer 09:20) | Perks marked Swap: "Accept my swaps (Recommended)" [QB] | CAPTURED | docs/skill-tree.md line 86; reviews/PERK-TEXT-R1-T5.md (status approved 2026-11-12). |
| 2026-11-12 (answer 09:20) | Placeholders vs code (frenzy at 60, not 25): "Code wins (Recommended)" [QB] | CAPTURED | docs/skill-tree.md line 86 ("code wins over the docs"); reviews/PERK-TEXT-R1-T5.md (ÇILGINLIK 60). |
| 2026-11-12 (answer 21:58) | Which level Kaan joins: "L20 (Recommended)" [QB] | PARTIAL | docs/product.md D-045 and prototype/js/config-bond.js (joinLevel 20) agree. docs/content-catalog.md still says L30 (lines 16, 171, 188). Next: align content-catalog, or confirm the L30 fight is a separate beat. |
| 2026-11-12 (answer 21:58) | Bond meter fill: "Per level + story (Recommended)" [QB] | CAPTURED | prototype/js/config-bond.js lines 3 and 11 to 17 (per cleared level, plus the join). |
| 2026-11-12 (answer 21:58) | Combo shape: "Kaan tackle, Arda stab (Recommended)" [QB] | IMPLEMENTED | prototype/js/config-bond.js line 20 (comboUlt tackle, bond 50). The tackle-and-stab shape is not written in the docs. |
| 2026-11-12 (answer 23:29) | Distant landmarks: "Side-edge peeks (Recommended)" [QB] | IMPLEMENTED | reviews/REVIEW-R1.md "Skyline: side-edge peeks" (line 571); prototype/js/view/arena-sky.js. |
| 2026-11-12 (answer 23:43) | Topkapı and Haliç–Balat enter: "Swap in for Laleli and Aksaray (Recommended)" [QB] | CAPTURED | docs/product.md D-060 (Topkapı replaces Laleli; Haliç–Balat replaces Aksaray). |
| 2026-11-12 (answer 23:43) | Yedikule and Zeytinburnu: "Yes, update briefs and art (Recommended)" [QB] | PARTIAL | Prompts exist (art/commission/chatgpt/prompts/10-ground-yedikule/). docs/hood-visual-briefs.md H14 and H16 show no revision. Next: check the H14 and H16 briefs against the answer. |
| 2026-11-13 (answer 07:19) | Chapter 5 he saw: "HUD 'Lv 5' in the level" [QB] | CAPTURED | docs/product.md D-064 (in-run level renamed Adrenalin; "Lv" removed from the HUD). |
| 2026-11-13 (answer 07:19) | Challenge package from L2: "Full ramp (Recommended)" [QB] | PARTIAL | docs/product.md D-061 still says "held for owner decision". Next: record the answer in D-061 (another agent's file) and ship it or log the hold. |
| 2026-11-13 (answer 07:19) | Real sound effects: "Rebuild the synth (Recommended)" [QB] | SUPERSEDED | Replaced by the 2026-11-13 19:58 answer "Generated SFX (Recommended)". |
| 2026-11-13 (answer 19:58) | Kill, blast and impact sounds: "Generated SFX (Recommended)" [QB] | IMPLEMENTED | prototype/audio/sfx-gen/ (owner-made files, 2026-11-14). uiTap is still synthesized (see the SFX row in section 2). |
| 2026-11-13 (answer 19:58) | Eczane heal station: "Yes, add a heal station (Recommended)" [QB] | IMPLEMENTED | reviews/REVIEW-R1.md T4 part 14 (line 1505): placed on L3, L4, L6 to L9 and later street hoods. |
| 2026-11-13 (answer 19:58) | Moments budget: "Reserve 1 of 3 (Recommended)" [QB] | IMPLEMENTED | prototype/js/view/moments.js lines 15 to 16 (one flash slot reserved each second, T4 part 15). |

## 3. Product and design feedback

| date | item | status | where |
|---|---|---|---|
| 2026-11-08 | Nothing feels "on". Low-quality interactions, menus and assets. | PARTIAL | docs/product.md D-054, D-066 (proposed); no device check. Next: device check after the animation pass; log the result in reviews/REVIEW-R1.md. |
| 2026-11-08 | Gameplay should feel like survivor.io. Animations and feel should be superior, with wow factors. | PARTIAL | docs/product.md D-050 (PROPOSED); 2026-11-13 "in-game animations still flat". Next: write a feel checklist for fire, hit and walk animation (D-050). |
| 2026-11-08 | Keep: cartoon dialogue bubbles, civilians running away from zombies. | CAPTURED | docs/product.md D-028; reviews/AUDIT-2026-11-08.md P0-6 |
| 2026-11-08 | "What are the things that keep coming down like rain?" | CAPTURED | reviews/AUDIT-2026-11-08.md lines 16-17 and P0-6 (fleeing civilians and falling tea glasses; fixed) |
| 2026-11-08 | Sound: "noises", not meaningful sounds for weapons and interactions. | PARTIAL | docs/product.md D-063; 2026-11-13 "kill, blast sounds bad"; uiTap still synthesized. Next: replace the synthesized uiTap cue; device check on kills and blasts. |
| 2026-11-08 | Characters are stick figures. Main character must stand out, and enemies need distinct styles. | PARTIAL | docs/product.md D-049 (busts, PROPOSED); D-066 (raster, PROPOSED); 2026-11-14 "all enemies look the same". Next: owner review of the raster characters (D-066) on the phone. |
| 2026-11-08 | Interaction animations: weapon fire, hit, character movement. | PARTIAL | docs/product.md D-050 (PROPOSED); 2026-11-13 "still flat". Next: device check of fire, hit and move animation; log in reviews/REVIEW-R1.md. |
| 2026-11-08 | Many more wow factors. | PARTIAL | docs/product.md D-050; no list of wow ideas is kept. Next: keep the dated wow-idea list in docs/wow-catalog.md. |
| 2026-11-08 | More local objects and assets. | PARTIAL | docs/product.md D-036, D-057; 2026-11-10 and 2026-11-14 "arena still generic". Next: owner review of the arena art (D-057, D-066). |
| 2026-11-08 | Many more weapon types and skills, each with its own power, animation and player value. | PARTIAL | docs/product.md D-030 (6 new weapons, 5 evolutions), D-032 (forks), D-031; 2026-11-14 "weapons and animations look similar". Next: add weapon sets per D-030 and log them in docs/weapons-skills.md. |
| 2026-11-08 | Progression: one flat scene to level 100 is wrong. Neighbourhoods are needed. | IMPLEMENTED | docs/product.md D-027; prototype/js/journey.js |
| 2026-11-08 | Story not immersive; players miss the chat boxes; illustrated comic characters. | PARTIAL | docs/product.md D-028, D-049, D-057. The comic is still judged "cheap" (docs/product.md D-054) Next: owner reviews the comic screens (row above); check the comic cards on the phone. |
| 2026-11-08 | Full end-to-end design, gameplay and product review. | CAPTURED | reviews/AUDIT-2026-11-08.md to AUDIT-7-2026-11-08.md; reviews/AUDIT-ENEMIES-2026-11-10.md; reviews/EXPERT-REVIEW-2026-11-14.md |
| 2026-11-09 | Independent audit he pasted: no horde (G-1); Kasap at Level 63 gives a 0% clear with no warning; five v0.7 systems broken, including daily modifiers. "Take into account if legit." | PARTIAL | reviews/AUDIT-7-2026-11-08.md section 2 (G-1, items 1 to 4). Horde density is held for owner decision (docs/product.md D-061). Modifier fix not recorded. Later reviews/AUDIT-ENEMIES-2026-11-10.md says the Kasap telegraph is clear. Next: check the daily modifiers in code (AUDIT-7 items 1 to 4) and log the result. |
| 2026-11-09 | Weapon and skill tree too narrow. Mastery must unlock big effects. | CAPTURED | docs/product.md D-030, D-032, D-059 (depth still judged thin, see 2026-11-14) |
| 2026-11-09 | Level 1 felt repetitive: same enemies, skills, weapons; no progression. Story progression helped. | PARTIAL | docs/product.md D-054, D-055, D-064; 2026-11-14 "still same". Next: device check of Level 1 after D-054, D-055 and D-064; log in reviews/REVIEW-R1.md. |
| 2026-11-09 | Keep building on the story progression. | CAPTURED | docs/product.md D-028 |
| 2026-11-09 | Comic text must fit its box; use a rounded rectangle, not an oval; use a traditional comic font. | IMPLEMENTED | prototype/js/view/comic-text.js line 4 (rounded balloons); prototype/js/view/comic-layout.js (overflow flags); fonts in prototype/assets/fonts/ |
| 2026-11-09 | Arda should be naturally funny (Shaun of the Dead). He talks to zombies and to himself when alone. | CAPTURED | docs/product.md D-035; docs/hoods-bible.md section 1.4 |
| 2026-11-09 | Arda must not force jokes. Jokes must actually be funny. | CAPTURED | docs/voice-en.md 1.2 item 6 and docs/voice-tr.md 1.2 item 6 (recorded 2026-11-14). |
| 2026-11-09 | Comic drawing: Arda's head and body look wrong (the red platform). | PARTIAL | superseded by the bust rebuild in docs/product.md D-049; no fix recorded. Next: owner review of the bust rebuild (D-049) on the phone. |
| 2026-11-09 | Text bubbles overlap each other. | PARTIAL | reviews/REVIEW-R1.md lines 1457-1458 (name tag and tail overlaps fixed on three levels); no general rule. Next: general overlap check across all comic screens. |
| 2026-11-09 | The random zoom and sprint animation feels broken. Find better animations. | CAPTURED | reviews/REVIEW-R1.md "Owner items recorded at handoff" (2026-11-14). |
| 2026-11-09 | Upward shooting animation looks wrong in one direction. He asked whether to restart the server. | CAPTURED | reviews/REVIEW-R1.md "Owner items recorded at handoff" (2026-11-14). The restart answer is still missing. |
| 2026-11-09 | Lights went out. Use a glitch if intended. | IMPLEMENTED | prototype/js/view/events-fx.js lines 162 and 175 |
| 2026-11-11 | Enemy skins and below-ground spawns were wrong. | IMPLEMENTED | docs/product.md D-058 |
| 2026-11-10 | Enemy variety and creative extras. | IMPLEMENTED | docs/product.md D-055 |
| 2026-11-10 | Comic cutscene dialogue was confusing. Review every comic screen. | PARTIAL | reviews/dialogue/tr-comics-full.csv (see section 1) Next: owner approves or rewrites each comic screen (see the row above). |
| 2026-11-10 | Do Kaan and Arda know each other? Any backstory? | IMPLEMENTED | reviews/STORY-DENSITY-L1-30.md line 61 (K20b and K20c fixed); docs/characters.md |
| 2026-11-10 | Is there enough Arda and Mila dialogue for romantic tension? | PARTIAL | docs/narrative.md ("Romance & Branching"); no decision recorded. Next: owner decision on romance scope; write it in docs/narrative.md. |
| 2026-11-10 | Is there enough dialogue for the whole story? Did he think it covered only Chapter 1? | PARTIAL | reviews/STORY-DENSITY-L1-30.md covers Levels 1 to 30 only. Next: owner decision on dialogue scope past Chapter 1 (reviews/STORY-DENSITY-L1-30.md covers Levels 1 to 30). |
| 2026-11-13 | Tram should read as a tram; sidewalk objects should show what they are; the tram went opaque. | IMPLEMENTED | reviews/REVIEW-R1.md lines 1232-1236 (T4 part 11); device check pending |
| 2026-11-13 | Consumables are not obvious (the eczane heal). Are there other consumables? | IMPLEMENTED | reviews/REVIEW-R1.md T4 part 14 (line 1505): eczane heal station placed on L3, L4, L6 to L9 and later street hoods. The part 10 "not placed" note is superseded. |
| 2026-11-13 | Link-hold hack terminal is unclear. Make the interaction clearer, not longer text. | IMPLEMENTED | reviews/REVIEW-R1.md T4 part 10 (prototype/js/view/consumables-zone.js); device check pending |
| 2026-11-13 | First-time hints (arrow to unique interactions). Keep, improve if possible. | IMPLEMENTED | reviews/REVIEW-R1.md T4 part 10 (prototype/js/view/hints.js) |
| 2026-11-13 | Sound effects: poor, except the diamond pickup. | PARTIAL | docs/product.md D-063; see the 2026-11-14 sound rows. Next: device check of the owner-made sounds; regenerate uiTap. |
| 2026-11-13 | Phone gets warm after 5 to 10 minutes. | PARTIAL | reviews/PLAYTEST-GUIDE-R1.md (heat test steps); not measured on a device. Next: measure on the phone with the heat test in reviews/PLAYTEST-GUIDE-R1.md. |
| 2026-11-13 | Ground shake and glitch animations: "amazing". Keep them, and test more creative animation ideas. | CAPTURED | prototype/js/config-feel.js; prototype/js/view/events-fx.js. No list of new ideas kept |
| 2026-11-13 | No push-back or challenge; boring. No level progression felt; animations flat, no flavour. | PARTIAL | docs/product.md D-061, D-064, D-054. Next: device playtest of the Full ramp and pacing changes. |
| 2026-11-14 | Several songs play at the same time; sound effects cannot be heard. | PARTIAL | prototype/js/view/music.js line 11 says one track at a time. Logged in REVIEW-R1 "Owner items recorded at handoff". Next: reproduce on the phone with the Suno files. |
| 2026-11-14 | Game stops responding; the character takes baby steps before it moves. | IMPLEMENTED | docs/handoff-codex.md section 5 ("stick fix"); logged in REVIEW-R1 "Owner items recorded at handoff". No phone check recorded. |
| 2026-11-14 | The map screen breaks after tapping Start. | IMPLEMENTED | docs/handoff-codex.md section 5 ("first-run map fix"); logged in REVIEW-R1 "Owner items recorded at handoff". No phone check recorded. |
| 2026-11-14 | Streak words appear too often. | IMPLEMENTED | prototype/js/view/moments.js lines 59-61 |
| 2026-11-14 | Some assets look cheap. Should he pay for a visual asset service? | CAPTURED | docs/product.md D-066 (ChatGPT as artist, PROPOSED) |
| 2026-11-14 | Enemies, weapons and arenas look alike; little progression; the game gets boring. | PARTIAL | docs/product.md D-055, D-058, D-066; reviews/EXPERT-REVIEW-2026-11-14.md Phase 1.3 ("each of L1 to L5 visibly different") Next: enemy and arena variety checks (reviews/EXPERT-REVIEW-2026-11-14.md Phase 1.3). |
| 2026-11-14 | Some menus use Arial-like fonts. | PARTIAL | prototype/js/view/comic-art.js line 13 still lists "Arial Black" in the fallback stack. Next: remove Arial Black from the fallback in prototype/js/view/comic-art.js line 13. |
| 2026-11-14 | Telemetry JSONL pastes are how he reports runs. | CAPTURED | reviews/REVIEW-R1.md part 19 (around line 2029); docs/handoff-codex.md section 8 |

## 4. Turkish and naming corrections

| date | item | status | where |
|---|---|---|---|
| 2026-11-09 | Dad's letter ends "Baban", not "B". | IMPLEMENTED | prototype/js/dialogue/tr/core.js line 24 |
| 2026-11-09 | Bloater: "Dombili". | IMPLEMENTED | prototype/js/dialogue/tr/core.js line 6 |
| 2026-11-09 | Death screen line "Biz bitti demeden bitmez." | IMPLEMENTED | prototype/js/dialogue/tr/core.js |
| 2026-11-10 | Typo "birakmış" to fix in the dialogue file. | PARTIAL | not in prototype/js; still in reviews/dialogue/tr-comics-full.csv (git-ignored). Next: fix the word in that CSV and in the dialogue source. |
| 2026-11-10 | Porter booth: "kapıcı kulübesi", not "güvenlik kulübesi". | CAPTURED | reviews/REVIEW-R1.md "Owner items recorded at handoff" (2026-11-14). tr-proposals-2.csv has no booth row and is git-ignored. |
| 2026-11-11 | "Kanalizasyon kapağı hareket ediyor. Kaçmalıyım." | IMPLEMENTED | prototype/js/dialogue/tr/barks-world.js |
| 2026-11-12 | Skill tree tab name: "Yetenekler" (not "Ağaç"). "Sokak Yetenekleri" offered. | IMPLEMENTED | reviews/REVIEW-R1.md line 1899 (tab.tree) |
| 2026-11-12 | Rage word: "Vahşet" (not "Öfke"). "Öfke" stays as the boss rage shout. | IMPLEMENTED | prototype/js/strings-moments.js (VAHŞET); docs/attributes.md line 39 |
| 2026-11-14 | "KIRIM" makes no sense. Use something like VAHŞET. | SUPERSEDED | no KIRIM in prototype/js/; reviews/REVIEW-R1.md line 1330 still lists "KIRIM!" (stale) |
| 2026-11-12 | Dash name in Turkish: "Depar" (his suggestion, with "topuk" as an option). | IMPLEMENTED | prototype/js/strings-journey.js (ui.hud.dash = DEPAR). Docs renamed to Depar on 2026-11-14 (content-catalog, weapons-skills, attributes). docs/product.md D-031 by another agent. |
| 2026-11-12 | Perk names: Kaba kuvvet, Kedi refleksi, Seri Katliam, İkinci Bakış, İnatçı. | IMPLEMENTED | prototype/js/meta/strings-tree.js |
| 2026-11-12 | Hack label "ZAYIF BAĞLANTI". | IMPLEMENTED | reviews/REVIEW-R1.md line 1857 |
| 2026-11-12 | "sende 0": "we don't need to say sende 0". | PARTIAL | prototype/js/meta/strings-tree.js line 58 still has "(sende {m})"; no record for the zero case. Next: decide the zero-case text; prototype/js/meta/strings-tree.js line 58 still shows "(sende {m})". |
| 2026-11-12 | Sentence: "Gelişim çubuğu dolduğunda bir özelliği buradan geliştirebilirsin." | IMPLEMENTED | prototype/js/meta/strings-meta2.js |
| 2026-11-13 | Topkapı stage: "Saray Kapısı". Yedikule keeps "Kule Kapısı". | IMPLEMENTED | prototype/js/view/istanbul-themes.js lines 71-75; docs/product.md D-060 |
| 2026-11-13 | Owner rewrites applied as written: H10i1a, H10i2a, H10p1, H11b, H11p1, H11p2, H11p4, hd10.1, hd10.3, hd10.4 (both), hd10.5. | IMPLEMENTED | prototype/js/dialogue/tr/story-hoods-01-10.js, story-hoods-11-20.js, barks-hoods-01-10.js |
| 2026-11-13 | H10i2b: owner wrote "Annem çocukken beni buraya getirdiğinde..." ("buraya" dropped). | PARTIAL | prototype/js/dialogue/tr/story-hoods-01-10.js line 73 drops "buraya" for the 90-character limit; reviews/TR-REVIEW-D060.md documents it. Owner not asked. Next: ask the owner if dropping "buraya" is acceptable, or shorten another word. |
| 2026-11-13 | H10p4: "this doesn't make sense in English either". | PARTIAL | reviews/TR-REVIEW-D060.md line 103 says "Closed (owner ok)" but also "New proposal, not yet approved": "Yağmur bastırdı. İçerisi kuru ama bilet yok.". Next: owner review of the new proposal (reviews/TR-REVIEW-D060.md line 103). |
| 2026-11-12 | H11i3a: owner wrote "Dolmuşun kapısı açık, içi karanlık. Şöför 'atla koçum, yer var' diye beni çağırıyor." | CONTRADICTED | being fixed by the comics-patch merge. The draft is still in prototype/js/dialogue/tr/story-hoods-11-20.js line 7; REVIEW-R1 line 1463 wrongly says applied. |
| 2026-11-12 | H14i3a: "Bekçinin gizlilik sıfır" ("bekcinin works"). | IMPLEMENTED | prototype/js/dialogue/tr/story-hoods-11-20.js line 31 |
| 2026-11-12 | FINb9: "Sırada Sarıyer var. Mila da bizimle." | IMPLEMENTED | prototype/js/story/finale-data.js; prototype/js/dialogue/tr/finale.js |
| 2026-11-12 | "Ataköy macerası bitti. Şimdi Sarıyer yolculuğu başlıyor. Mila ile birlikte <3" | CAPTURED | reviews/REVIEW-R1.md "Owner items recorded at handoff" (2026-11-14). No line ID yet. |
| 2026-11-13 | Credits and HUD strings: "1. Kısım Sonu", "2. Kısım · Sarıyer'e Yolculuk.", "Sokak Kredisi {n}, sonraki için {k} öldür", "+{n} · sonraki için {k} öldür". | IMPLEMENTED | prototype/js/story/strings-finale.js; prototype/js/strings-progress-ui.js |
| 2026-11-13 | "Eczane: Dokun ve iyileş". | IMPLEMENTED | prototype/js/strings-hints.js |
| 2026-11-14 | Seed name: "Gece Kapısı" (not the other option). | IMPLEMENTED | prototype/js/strings-modes.js line 50 |
| 2026-11-14 | Row 28: "bölgeyi". | IMPLEMENTED | prototype/js/strings-modes.js line 43 |
| 2026-11-08 | "SAYIN ABİM" (Ataköy boss title). | IMPLEMENTED | prototype/js/strings-journey.js |
| 2026-11-10 (answer 04:49) | Arda's language strength: "Raise to street-mild (Recommended)" [QB] | CAPTURED | docs/product.md D-052. |
| 2026-11-10 (answer 04:49) | Real people, brands and religion words in the rewrites: "Keep them, you accept the risk" [QB] | CAPTURED | docs/voice-tr.md 1.2 item 7 (recorded 2026-11-14). Lint still flags some words: prototype/tools/dialogue-banned.json needs an exception list. |
| 2026-11-10 (answer 04:49) | BK.self pool (23 of 24 lines turned into riddles): "Keep all as a deliberate exception" [QB] | CAPTURED | docs/voice-tr.md 1.2 item 7 (recorded 2026-11-14); docs/product.md D-052. |
| 2026-11-10 (answer 04:49) | Deliberate typos: "açiık, yandi, uğeqşmıştım, varpurlar, heralde, sfıfır" are typos to fix; "gaçayım" and "kaptim" are intentional [QB] | PARTIAL | Next: fix the six typo words in the dialogue source and the review CSVs. Keep gaçayım and kaptim. Not found in prototype/js on 2026-11-14. |
| 2026-11-12 (answer 17:37) | Dash word everywhere: "Depar (Recommended)". "KAÇIŞ!" stampede stays [QB] | IMPLEMENTED | prototype/js/strings-journey.js (DEPAR); KAÇIŞ! kept for the stampede event in prototype/js/config-levels.js line 248. Docs renamed 2026-11-14. |

## 5. Open requests and unanswered questions

| date | item | status | where |
|---|---|---|---|
| 2026-11-09 | How do the CSV dialogue files work? What do I do with them? How do I pick a version? What if I have a better one? | PARTIAL | reviews/dialogue/*.csv have "verdict" and "replacement" columns; no owner-facing instructions. Next: write a five-line owner guide for the verdict and replacement columns. |
| 2026-11-09 | Horde density (AUDIT-7 G-1), difficulty growth, second elite window: held for owner decision. | PARTIAL | docs/product.md D-061 ("Not shipped, held for owner decision") Next: owner decision on horde density (D-061); the Full ramp answer may settle it. |
| 2026-11-08 | "Not heavy assault rifles yet" (weapon scope). | CAPTURED | docs/weapons-skills.md (scope note, recorded 2026-11-14). |
| 2026-11-10 | Are 501 phrases enough for the whole game? | PARTIAL | reviews/CONTENT-LENGTH-R1.md covers chapter length, not the phrase count. Next: count phrases per chapter and compare with reviews/CONTENT-LENGTH-R1.md. |
| 2026-11-10 | Where are we, and what phases remain? (chat question) | SUPERSEDED | answered in chat; now reviews/EXPERT-REVIEW-2026-11-14.md section 6 |
| 2026-11-10 | Is this the last batch? (chat question) | SUPERSEDED | chat only |
| 2026-11-10 | Percent of implementation done; offload above 50%. | PARTIAL | no percentage in the repo. Next: same as the percent row in section 1. |
| 2026-11-10 | Do the estimates cover all five or six phases? | CAPTURED | reviews/EXPERT-REVIEW-2026-11-14.md section 6 (Phases 0 to 4) |
| 2026-11-10 | Kaan screens may be missing from the comic list. | PARTIAL | reviews/dialogue/tr-comics-full.csv (164 rows); Kaan completeness not checked. Next: check the Kaan screens against reviews/dialogue/tr-comics-full.csv. |
| 2026-11-10 | Which dialogue scope? "I didn't realize this was only for chapter 1." | PARTIAL | no record of a decision on dialogue scope. Next: owner decision on dialogue scope past Chapter 1. |
| 2026-11-11 | What is the roadmap, and where are you? | CAPTURED | reviews/EXPERT-REVIEW-2026-11-14.md section 6; docs/handoff-codex.md section 5 |
| 2026-11-11 | Did you work on the low-quality comic drawings? | PARTIAL | docs/product.md D-054 (open); 2026-11-13 still "cheap". Next: answer him with the status in D-054 and D-066. |
| 2026-11-11 | Which sequence of work is right? | CAPTURED | reviews/EXPERT-REVIEW-2026-11-14.md section 6 |
| 2026-11-12 | "What do you recommend for Q4?" | CAPTURED | docs/product.md D-059 (Q4 answered: perk texts) |
| 2026-11-12 | An English sentence "makes no sense" in Turkish (line not named). | PARTIAL | no line ID recorded. Next: ask the owner which line; no line ID yet. |
| 2026-11-12 | Remaining 17 hoods, and unique ground for each hood. | CAPTURED | reviews/REVIEW-R1.md (hood art); art/commission/chatgpt/prompts/ (gnd_<hood>_*) |
| 2026-11-13 | "Can we have a sweet-spot combination?" (pacing) | CAPTURED | reviews/QUESTIONS.md (added by another agent; verify before handoff). |
| 2026-11-13 | Voice-over: "do you want me to do voice over?" | CAPTURED | docs/story-presentation.md section 12.5 (owner note 2026-11-13, recorded 2026-11-14). |
| 2026-11-13 | "How do I record a new one and send it?" (he offered to record something; not clear what). | CAPTURED | reviews/QUESTIONS.md (added by another agent; verify before handoff). |
| 2026-11-14 | Did telemetry get recorded? Where? Was I supposed to start recording? | CAPTURED | docs/handoff-codex.md sections 2 and 8; reviews/REVIEW-R1.md part 19 |
| 2026-11-14 | The telemetry button is not visible. Restart the server? | SUPERSEDED | resolved: he attached telemetry at 2026-11-14 07:38 |
| 2026-11-14 | "Music bug, so it is normal?" | PARTIAL | docs/handoff-codex.md section 5 (iOS audio unverified) Next: answer after the phone check of parallel songs. |
| 2026-11-14 | Which assets, from where, with which prompts? | CAPTURED | art/commission/chatgpt/prompts/ (419 prompts); docs/handoff-codex.md section 6 |
| 2026-11-14 | Decisions still waiting on the owner (listed in the handoff, not in his messages): accept D-066 (raster route); confirm music on the iPhone; review reviews/TR-REVIEW-R1-T4.md; regenerate the uiTap sound. | PARTIAL | docs/handoff-codex.md section 5. D-066 is still PROPOSED although he said ChatGPT is the artist (2026-11-14) Next: owner decides D-066, the iPhone music check, the TR review and the uiTap sound. |

## Sensitive data note

- An Apple developer team ID is pasted in the owner's messages (2026-11-08) and is tracked in git in game/export_presets.cfg. It is an account identifier, not a secret, but the owner should decide whether it stays in the repo.
- Telemetry pasted on 2026-11-14 contains install and session identifiers and a device user-agent string. Do not commit those values.
- No passwords, API keys or tokens were found in the owner messages.
- reviews/owner-messages-archive.md (2026-11-14): the telemetry paste and the pasted assistant text are omitted, and marked in place. A scan of the archive found no tokens, passwords, keys or emails. The Apple team ID and the GitHub repo URL are kept as typed; the owner should decide whether they stay in the repo.

### 2026-11-18 · English dialogue audit

Owner: “can you now do the same audit for the english dialogue?”
Applied the established whole-script clarity, continuity and restrained dark-comedy brief
to native English dialogue. See `reviews/EN-DIALOGUE-AUDIT-2026-11-18.md`.

### 2026-11-18 · Experiential quality PRD and optional monetization

Owner: “i agree with you on everything you said including monetization push back you made.” Requested another detailed PRD for the implementation agent covering the ten discussed concerns and adjacent factors, with specific cutscene direction; this chat serves as creative game designer/strategist.

Captured direction: expressive hero/enemy motion; physical object interactions; clear damage/healing/navigation; visible dramatic states on mute; distinct fair bosses; legible enemy roles; earned player/enemy progression; optional monetization with a viable independent free path; engaging action for every weapon; specific in-world story transitions. No level is designated as an ad/payment dependency. The owner requested the PRD here, not gameplay changes or a message to the running implementation chat.

Delivered [the experiential PRD](PRD-EXPERIENTIAL-QUALITY-2026-11-18.md), required combat/scene/acceptance appendices and a [copy/paste implementation prompt](IMPLEMENTATION-PROMPT-EXPERIENTIAL-2026-11-18.txt). D-115 distinguishes approved direction from proposed detailed production choices. First-30 independent review and the expansion gate remain in effect.

### 2026-11-18 · Animation effort after audit 8

Owner reports visible progress in Arda's movement and asks whether additional refinement has sufficient value. He considers highly detailed regular-zombie animation low priority and says bosses should move with Arda's level of fine-grained detail. He agrees with the remaining nine-item audit responses, including the existing optional-monetization agreement. He has not sent new work to the implementation chat and asks what the next handoff should say.

Captured preference: preserve Arda's gains and prioritize detailed boss acting; keep ordinary enemies understandable without a universal animation overhaul. Creative recommendation for the next pass: treat current hero locomotion as the working baseline with targeted defect repair, retain ordinary-enemy role/tell checks, complete the full interaction/health/weapon/level/progression/story corrections, and defer the three new gameplay proposals. The baseline/deferral are recommendations in response to his question, not a claim that he explicitly signed off every detail or that the game has final artistic acceptance.

Updated [the execution brief](AUDIT8-IMPLEMENTATION-BRIEF-2026-11-18.md) and [single handoff prompt](IMPLEMENTATION-PROMPT-AUDIT8-2026-11-18.txt); D-117 records the priority. Documentation only; no runtime changes or messages to the implementation chat.


### 2026-11-19 · End-to-end Turkish narrative direction

Owner requested a complete Turkish script audit: an engaging story, causal clarity, balanced satire with **Leyla ile Mecnun and Gibi** as the current Turkish references, dialogue as a competitive advantage, compelling comic storytelling/artwork and high-quality reading effects. Creative freedom is authorized within the existing project scope. This latest Turkish reference pair supersedes the earlier Turkish South Park/Rick and Morty emphasis; it does not authorize imitation, guardrail changes or post-L30 production.

[Audit, revisions, later blockers and verification limits](TR-END-TO-END-AUDIT-2026-11-19.md). Proposed D-121 records the implemented first-30/shared-content corrections. No commit/push/merge or expansion approval is implied.

### 2026-11-19 · End-to-end English narrative direction

Owner: “now do the same audit and improvements for english. the english versions vibes are southpark, rick and morty style from comedic point of view”. This carries forward the end-to-end story, causal clarity, compelling comic dialogue/art and reading-audio brief. English is authored natively from shared scene intent, with original satire and absurd reasoning; the Turkish references remain Leyla ile Mecnun / Gibi.

[English audit, implemented revisions and verification limits](EN-END-TO-END-AUDIT-2026-11-19.md) · [complete before/after inventory](EN-END-TO-END-CHANGES-2026-11-19.md). Proposed D-122 records the first-30/shared-content pass, preserving the shared art/audio improvements and the later-production gate. No commit/push/merge is implied.


### 2026-11-20 · Execute all of Audit11

Owner supplied the complete pasted instruction, “Implement and verify the ENTIRE Audit11 across the existing first30 levels.” All seven concrete findings and affected reset/weapon/scene/interaction/progression/narrative scope are authorized for local implementation through inspection, revision and integrated verification. Routine internal milestones are not approval gates. Preserve current cast, Arda locomotion, native scripts, truthful geometry and saves; retain losses/outliers and separate technical, presentation and player validation. No beyond30 production, new dependency/service, paid purchases, engine migration, real monetization or commit/push/merge. [Implementation/evidence status](AUDIT11-IMPLEMENTATION-2026-11-20.md).
