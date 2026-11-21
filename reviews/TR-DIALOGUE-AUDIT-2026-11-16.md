# Turkish dialogue audit and revision

**Follow-up:** [The second narrative pass](TR-NARRATIVE-PASS2-2026-11-16.md) contains the current draft, new comic content and its validation. This report preserves the first-pass findings.

2026-11-16 · Local review draft · Branch `r1/p2.1-turkish-dialogue-audit` · Proposed D-100

**Your concern was justified.** The script had understandable individual jokes but inconsistent character voices,
broken exchanges, repeated explanations and lines that contradicted the game. The revamp is implemented locally:
**1,177 Turkish lines read; 565 rewritten, 3 joke tags corrected without changing wording, 609 kept.**
All 558 existing beats and all 28 existing comic pages were included. This is the implemented Chapter 1 material,
Levels 1–100, with priority on the active 1–30 slice; it does not create Chapters 2–3.

The working voice is a frightened Istanbul student finding absurdity in what is happening, with Kaan answering back.
Leyla ile Mecnun, South Park and Rick and Morty inform the comic mechanisms, not copied lines or borrowed characters.
The Captain, Ahmet Abi and the empty apartment get space without compulsory punchlines.

**Start here:** [Read the comics in panel order](TR-COMICS-READTHROUGH-2026-11-16.md).
For changes, the complete review tables show **key, old Turkish, current Turkish, existing English, location and reason**:
[Story and calls](TR-DIALOGUE-REVIEW-2026-11-16-story.md) ·
[Combat and upgrades](TR-DIALOGUE-REVIEW-2026-11-16-combat.md) ·
[World and neighborhoods](TR-DIALOGUE-REVIEW-2026-11-16-world.md).
Reply with a key and your wording, or “restore”; no CSV editing needed.

## The writing change in a few lines

| Moment | Current Turkish | Purpose |
|---|---|---|
| Arda's promise to be home early | Eve erken gelirim dedim. Saat vermemiş olmam iyi olmuş. | A small, recognizably human dodge after a frightening escape |
| Topkapı's guide | Rehber bayrağı kaldırdı. Kaan, sakın soru sorma. Tur uzar. | Everyday tour etiquette applied to an absurd situation, after Kaan joins |
| Signal booster | Şu kutuyu açarsam annem yine mont sorabilecek. | The joke expresses why fixing the phone matters |
| Talking to a zombie | Abi, sarılacak kadar tanışmadık. | Nervous politeness instead of a translated “personal space” joke |
| Self-talk | Korku filmi izlerken ne çok akıl veriyormuşum. | Arda's film knowledge fails to make him brave |
| Captain aftermath, Arda | İstersen biraz oturalım, Kaan. Beklerim. | Care through an offer rather than a speech |
| Captain aftermath, Kaan | Yok abi. Senin evine varalım. Hadi. | Kaan chooses to keep going; no joke interrupts him |

## Findings and resolutions

| Finding | Examples before the pass | Resolution |
|---|---|---|
| Survival rules contradicted each other | `H01i3a` made rule two “yine kafaya”; `rule2` said “ısırılma”; a death line invented another rule one | One consistent set: head, no bites, keep moving. Death humor no longer renumbers it |
| Speech sounded written for a punchline | `O1b` used “Lakin … bir şerh düşmedim”; `H10p3` compared barriers to sticky baklava without a clear image | Short, spoken phrasing and an observable situation |
| Conversation did not progress | `callB2` answered an unasked taxi question; `callC2` joked over Dad's incomplete warning; `C30` mixed a failing line with “çok net” | Replies now follow the previous line and the changing signal |
| Return-home motivation became unclear | Sarıyer was named early; late calls still implied that the family would be waiting at Ataköy | C70 explicitly asks Arda to collect Dad's note at home; C90 follows through with food and the letter |
| Characters knew things too early or forgot them | Generic `BK.dad#5` knew Dad's northern secret; Paşa was named again after the intro; Kaan wondered if his Captain was among sailors long after L25 | Remove ungated foreknowledge, keep the cat's name consistent, make the later Captain resemblance a memory |
| Opening visually cast Kaan too early | `spk.friend` and the `friend` portrait alias used Kaan | The unnamed diner uses the existing stranger portrait in story mapping, raster and procedural fallbacks; L20 remains their meeting |
| A first sighting could announce a death | `BK.fk.bloater`, `kurye`, etc. are used both for sightings and first kills | Encounter wording works at either trigger; enemy types no longer get each other's names |
| Text contradicted an interaction | Booster barks described a scooter; alarm success said it stopped; ATM success said there was no money | Booster restores phone signal; alarm lures enemies; ATM dispenses coins. Corresponding shared intent notes corrected |
| Generic outcomes asserted specific rewards or success | Healing always said simit; generic event-end lines claimed rescue, loot and extinguishing; skill text promised fixed seconds | Use pickup-neutral healing and result-neutral event endings; remove unsupported reward and duration claims |
| Comedy could ignore its own cooldown | Many obvious jokes had no `j` tag; almost all `BK.self` variants were disconnected riddles | Rebuild self-talk with 6 contextual jokes and 18 ordinary thoughts; mark actual punchlines so the existing cooldown can apply |
| Emotional scenes undercut themselves | Finale opened with Kaan licking a basket; Dad made a traffic joke and directly declared love despite his voice guide | Quiet arrival, practical care, concise letter ending “Baban.”; retain Mila's decisive arrival |
| Caption voice wandered | Panoramas ended with “roller değişti,” a moral or a second joke explaining the first | Captions carry place, sound, transition or a private observation; dialogue carries the exchange |

## Scope and preservation

- No new beats, variants, characters, gameplay numbers, story triggers or dependencies. Existing material after L30 was edited under the owner's whole-dialogue request, without adding later content.
- English files are byte-for-byte unchanged from the pre-audit working-tree snapshot. EN columns are the existing independent script, not translations. Some English interactions still contain the old booster/alarm/ATM mismatch; that is a separate English pass.
- Prior uncommitted route, art, audio and simulation work remains in place. Review counts compare with the working tree at task start, not `main`, which lacks some of that work.
- Rewritten lines lose `ok: 1`; the old owner's approval is not silently attached to new wording. Every original line is preserved in the comparison tables.
- Six stale per-line lint exceptions were removed because their original text was replaced. No guardrail patterns were relaxed. The historical shared `BK.self` exception still exists; the new Turkish pool independently satisfies the normal 60-character limit and 25% joke ratio.
- D-100 and the dated addition to `docs/voice-tr.md` record the proposed direction. This review supersedes older Turkish review tables only for the keys changed here.

## Validation

- `node prototype/tools/test-dialogue.js`: PASS, 558 beats, TR 1,177 / EN 1,180 lines. Seeded simulation digest remains `a2a5874e85` in both languages, matching the pre-edit baseline.
- Every Turkish line is within the ordinary limit: 60 characters for barks/card flavor, 90 for other lines. The remaining checker note is **existing EN `E25a` at 99 characters**, not Turkish.
- Real browser lettering audit: **0 flags across 2,209 TR+EN rows**. Turkish: 86 comic panels, 127 pops, 28 call lines and 862 bark variants. No reported overflow, overlap or crossed tails. Shortened `L09m` after the first browser audit caught a fit failure missed by character counting.
- Visually inspected Kaan's meeting, the Captain aftermath, the campfire, Dad's letter and Mila's reveal at the preview's 390×844 phone canvas. Letter and finale continuation taps preserve the whole text.
- Final `test-dialogue`, `check-banned --strict` and `test-scene-art`: PASS. Additional snapshot checks preserve every key, variant count, speaker and mood; all TR text is NFC; changed lines are drafts; English is unchanged. `git diff --check` passes for this pass's tracked files.
- Full `prototype/tools/run-tests.sh`: **43 suites passed, 3 failed**, after the runner's automatic retries. The failures were `fonts` (undefined `CM Kalam` in the separately modified `street-invitations.js:91`), `map-first-run` (TR 448px remained on the title screen) and `modes` (two normal-mode simulation reference hashes, L12-s9 and L30-s4). This pass does not edit those files, UI strings or simulation rules.
- A further isolated `test-map-first-run` run passed **140 checks, 0 failed**. Treat the earlier map result as an intermittent failure, not proof it is fixed. Font and simulation-reference failures remain outside this dialogue pass; **the overall build is not green and must not merge on this evidence**. [Full-suite log](media/R1/tr-dialogue-audit/full-suite.txt) · [isolated map rerun](media/R1/tr-dialogue-audit/map-recheck.txt) · [layout audit](media/R1/tr-dialogue-audit/layout-audit.txt).

## What still needs human judgment

The script review is complete; whether a line earns a laugh needs Turkish playtesters. This is desktop validation,
not an iPhone playtest. Read Kaan's meeting and the campfire aloud, then play a short run without skipping dialogue.
Watch for lines that make you pause to decipher them, jokes you predict too early, and callbacks repeated too close together.

The existing art also limits acting: the Captain scene still uses a fairly neutral Kaan pose, and some backgrounds
stand in for several places. Text revision alone does not supply shot-specific expressions or new illustrations.
Those observations are recorded rather than claiming the entire visual presentation has been rebuilt.

## Screenshots

The screenshots are desktop captures of the existing comic preview with this script. Their surrounding controls
are development tools, not part of the game UI.

![Kaan's introduction](media/R1/tr-dialogue-audit/kaan-join-tr.jpg)
![Captain aftermath](media/R1/tr-dialogue-audit/captain-tr.jpg)
![Campfire exchange](media/R1/tr-dialogue-audit/campfire-tr.jpg)
![Dad's letter](media/R1/tr-dialogue-audit/letter-tr.jpg)
![Mila's arrival](media/R1/tr-dialogue-audit/mila-tr.jpg)
