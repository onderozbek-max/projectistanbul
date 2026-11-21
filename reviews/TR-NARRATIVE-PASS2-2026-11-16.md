# Turkish narrative: second pass

2026-11-16 · Local review draft · Proposed D-103 · Continuation of the Turkish dialogue audit

**Original pass: 81 existing lines revised; 11 new Turkish beats added.** The focus is comprehension,
character motivation and reasons to read the next scene. The game now has two short new
post-boss comic pages, at L10 and L15. Other additions extend existing scenes.

**Read:** [the narrative in actual play order](TR-NARRATIVE-READTHROUGH-2026-11-16.md).
**Compare:** [every second-pass change, with the prior TR and English context](TR-NARRATIVE-PASS2-CHANGES-2026-11-16.md).
The first-pass report and its comparisons remain available as history; this packet is the current draft.

### Owner correction: Mila's knowledge and reunion

The owner correctly identified a continuity error: Mila knew Arda's destination before
he told her. The earlier rewrite had removed the mothers' phone exchange without
providing another source for that knowledge. This was missed in the second pass.

Corrected in-game: `FINb7` and `FINb8` revised, **six new reunion beats** added, and a
**new four-panel `fin_arrive_c` page** follows the door scene. Recognition and relief
come first. Mila asks about his parents; Arda names Sarıyer and his plan; Mila names
Zekeriyaköy; Arda proposes the shared route; she agrees and asks him to rest. No
character assumes an unheard destination. The existing departure caption follows the
agreement. The page reuses current generated apartment artwork and the existing
tap/hold-to-skip interaction, after L100 combat. English has its own companion script.

Follow-up checks: dialogue, strict guardrails and scene-art **PASS**, with unchanged
sim digest `a2a5874e85`. The current shared workspace has 576 beats / 1,195 TR / 1,198 EN
lines, including the concurrent `E25cover` addition, which is not part of this fix.
Browser preview timed out; the new reunion page has **not** been visually verified,
and the earlier 2,219-row layout result below does not cover it. No full-suite rerun,
commit, push or merge. [Follow-up logs](media/R1/tr-narrative-pass2/mila-validation.txt).

## What improved

| Problem | In-game revision |
|---|---|
| The audience heard “Sarıyer” but Arda kept acting as if his parents might be home | L5 establishes that they left and that Dad's note is at home. L15 confirms their location and safety. The stop at Ataköy has an explicit purpose throughout |
| Calls repeatedly lost the signal without advancing the story | Each contributes a fact: the note, the family's safety, Dad's knowledge of blocked roads, Ahmet's last known errand, food for both travelers, and the balcony light |
| Kaan joined without a clear shared plan | At L20 he proposes checking his Captain's boat before accompanying Arda home. L21 introduces Nuri and their seven years together. After L25, Kaan explicitly chooses to keep walking with Arda |
| Galata and Karaköy ended without a narrative consequence | L10's new three-panel page leads toward the wedding music and the hope of finding survivors. L15's three-panel page lets the silence land, then follows Paşa toward the bridge |
| The campfire confession arrived without a question | Kaan asks who else they can check on in Arda's building. Arda mentions Mila; Kaan's teasing now answers something he just learned |
| Kaan passed his grandmother's home without addressing her whereabouts | He says she is with his cousins and offers the garage as a resting place. The half-painted sign is explicitly for his hoped-for shop |
| The public warning and Dad's warning said the same thing | The northern safe-zone announcement now conflicts clearly with Dad's letter. Arda names the contradiction. What Dad knows remains a mystery; what each source said does not |
| Late dialogue forgot the group or misplaced them | Mom includes Kaan at dinner; the L90 call correctly places them on Bakırköy's shore. Mila has her own destination, Zekeriyaköy, with a shared route through Sarıyer |
| Familiarity or danger was asserted without support | Arda remembers Usta's advice instead of Usta mysteriously speaking from the next district. Paşa remains the same cat. The bazaar door's occupant is heard rather than inferred as a certainty from a bent shutter |
| A phone voice looked like narration, or a memory belonged to the wrong person | L30 is labeled as a phone call; Mom's last line stays labeled speech. The Sirkeci memory of meeting Dad is assigned to Arda in both languages |
| Replies could replace an unread question | Zombie exchanges now wait for the preceding bubble's visible reading time. If a bubble cannot be placed or the zombie dies, the rest of that exchange is cancelled |
| A rescue-start event could celebrate success | Start and completion now select different, appropriate dialogue pools |

The humor stays in recognizable behavior: a wedding sound system outlasting phone service,
negotiating with a man still pointing a fish, and Mom making room at the table for someone
she has only just heard about. The Captain's death and empty apartment are allowed to hurt.

## Scope and pacing

- The two new pages appear **after victories**, at existing safe transitions. They use the existing tap/hold-to-skip comic UI and current ImageGen scenery and portraits. No extra mid-combat comic stop or new input is introduced.
- Existing L30 post-fight call staging and the other concurrent route/build changes are preserved.
- The shared comic beats have 11 independently authored English companion lines, not translated Turkish. The single existing EN Usta-memory line changes because its speaker changes to Arda. This is still a Turkish narrative pass, not a full second English rewrite.
- No simulation rules, combat numbers, drops, progression rewards, dependencies or new characters. Readability changes affect only view-side bark scheduling.
- New facts are limited to the connective story details above. The proposed D-103 records the early family-location clarity and the revised broadcast/letter contrast. The owner explicitly authorized new dialogue and comic content in this request.
- All changed/new wording is a review draft; previous `ok: 1` flags do not transfer. Existing prior work is preserved. Nothing is committed, pushed or merged.

## Validation

- `test-dialogue.js`: **PASS** — 569 beats, 1,188 TR lines, 1,191 EN lines. TR/EN simulation digest remains `a2a5874e85`, also unchanged from the pre-pass check.
- `check-banned.js --strict`: **PASS** — zero guardrail hits, translationese flags, duplicate lines or joke-ratio violations. Twelve contextual review matches remain; the one length advisory is the existing EN `E25a` (99 characters), outside this Turkish rewrite.
- `test-barks-delivery.js`: **PASS** — multiple complete question/reply/reaction chains, vanished speakers, unavailable bubble placement, overlay interruption and distinct rescue-start/completion pools. Running the same regression against the pre-pass scheduler **fails as expected**: a question was replaced after 1.4 seconds.
- `test-scene-art.js`: **PASS**. New pages reuse existing generated scenery; no retired/procedural asset fallback was added.
- Chrome comic preview: **0 flags across 2,219 TR+EN layout rows** (246 page/pop/call rows per language; 862 TR and 865 EN bark rows). Manually stepped through both new endings, Kaan's plan, the campfire and the L30 call. [Screenshots and layout output](media/R1/tr-narrative-pass2/) are saved. A cached localization file initially exposed the new phone-call tag as a key; loading the current assets on the fresh localhost origin resolved it.
- Browser limitation: the preview became unresponsive before the final letter/departure walkthrough. The last layout audit predates the final small wording changes to `E30b`, `C90d` and `C90e`; final source/content checks above include those changes. A fresh phone readthrough remains required.
- Full suite: **incomplete, deliberately stopped** during the prolonged arsenal stress test while other work was also running. `a11y-canvas`, `anim-flavor`, `arena-evolve` and `arsenal-w` passed before stopping. Only this task's runner and child were stopped; other jobs were left alone. This is **not** a full-green result and does not clear the pre-push requirement.
- Scoped `git diff --check`: clean. No commit, push or merge.

Evidence logs: [focused validation and regression proof](media/R1/tr-narrative-pass2/validation.txt).

## Owner readthrough

Read L5 → L15 → L20 → L25 → L30 first. At each point, it should be possible to say where
Arda is going, why, what he knows about his family, and why Kaan stays. Then read the campfire
and the arrival/letter together. The remaining question should be “what does Dad know?”,
not “what did that sentence mean?” Turkish playtesting is still needed to judge laughter,
attachment and the desire to return; desktop checks cannot establish those outcomes.
