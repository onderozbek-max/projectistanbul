# English dialogue audit — 2026-11-18

Local review draft. Owner requested the same complete audit/revision as the Turkish pass.
**1,205 English entries reviewed: 212 revised, 993 retained, across all 11 English files.**
The script was read independently against the English voice guide, scene order, shared
story facts and the actual bark/hack event triggers. No Turkish lines were used as a
translation source. Existing local route/boss/companion work was preserved.

[Read the story in play order](EN-STORY-READTHROUGH-2026-11-18.md) ·
[Every before/after change](EN-DIALOGUE-CHANGES-2026-11-18.md)

## Findings and revisions

| Issue | Revision |
|---|---|
| Kaan said everyone knew about Mila immediately after first hearing about her | His teasing now responds to Arda's admission; Arda's embarrassment carries the next caption |
| Kaan offered to walk Arda home before learning where home was | Arda names Ataköy in his introduction; Kaan then proposes checking the captain's boat |
| Paşa was introduced and named twice | One introduction, followed by recognition and consistent behavior |
| A location question received an unrelated answer | Mom explicitly confirms Sarıyer before continuing her instructions |
| Captain's death lacked a clear reason for Kaan to keep walking | His refusal to remain there leads directly to his decision to accompany Arda; shortened the overlong memory without losing the kindness |
| Narration assumed hidden facts or an unseen threat | Bazaar sounds and visible damage replace certainty about an intruder; no unsupported new antagonist |
| Dad's letter contradicted his approved voice | Practical instructions and the approved “D.” signature replace “Love you. Dad.”; the broadcast/letter contradiction is explicit |
| Radio, sunrise and homecoming lines lost track of earlier information | Consistent safe-zone reference, morning progression and family whereabouts |
| A signal repair described riding a scooter | All booster start/success/failure lines now describe restoring phone service |
| Car-alarm success described silencing the alarm | Lines now describe activating a lure, matching the simulation |
| Successful ATM and traffic hacks described the wrong effects | ATM text allows for awarded loot; traffic text acknowledges the stun and the opening to move |
| First-sighting pools also announced kills | Shared sighting/kill lines now work without assuming the enemy has died |
| Event-end text assumed a successful rescue, chase or defense | Generic endings describe the end of the event; success-specific rescue lines stay in the completion pool |
| Some barks implied unavailable actions or state | Removed jumping/ducking instructions, full-health claims after partial healing, invented drum-color rules and early knowledge of Dad's northern trip |
| Awkward idioms, vague punch lines and inconsistent American usage | Clearer physical references, natural contractions, curb/cart usage and less generic game-system narration |

## Tone and scope

Arda is frightened and observant, with dry humor as a coping habit. Kaan is warm and
specific; Mom shows care through practical questions; Dad is terse; Mila's concern
ends in action. Loss and relief can land without a compulsory joke. Retained effective
lines rather than rewriting for volume. New wording is authored in English from beat
intent, with no copied show dialogue or catchphrases.

No new pages or beats were needed: the existing English scenes, including the expanded
Mila reunion, have room for the repaired exchanges. Her knowledge still comes from
Arda before they agree on the shared route. No combat pauses, pacing-system changes,
new characters, dependencies, simulation changes or balance changes. This pass edits
only English voice data and review/voice documentation. Changed wording loses `ok: 1`;
joke labels were reassessed. Existing Turkish text and shared beat definitions remain.

## Coverage

| File | Reviewed | Revised | Retained |
|---|---:|---:|---:|
| barks-cards.js | 162 | 16 | 146 |
| barks-combat.js | 235 | 34 | 201 |
| barks-hoods-01-10.js | 150 | 21 | 129 |
| barks-hoods-11-20.js | 150 | 23 | 127 |
| barks-world.js | 168 | 53 | 115 |
| cards-flavour.js | 7 | 0 | 7 |
| core.js | 43 | 4 | 39 |
| finale.js | 21 | 7 | 14 |
| story-hoods-01-10.js | 81 | 18 | 63 |
| story-hoods-11-20.js | 82 | 13 | 69 |
| story-levels.js | 106 | 23 | 83 |

## Validation

- `test-dialogue.js`: PASS. 583 beats, 1,202 TR entries and 1,205 EN entries; identical TR/EN simulation digest `7ee009df2f`. This is the current workspace's digest, not a claim that unrelated simulation work has stayed unchanged since November 16.
- `check-banned.js --strict`: PASS. No guardrail hits or joke-ratio violations. Zero length advisories or English editorial flags remain. The global Turkish formal-plural flag is `L27SafeCover`: a survivor addresses both companions, so the plural is appropriate; Turkish files were not changed. Strict mode fails guardrail hits, so PASS alone is not a claim that all editorial advisories are resolved.
- `test-barks-delivery.js`: PASS, including readable exchanges and rescue status.
- `test-scene-art.js`: PASS.
- Isolated headless Chrome using bundled assets and the existing comic/bark audit: **1,121 English rows, zero fail/overflow/overlap/cross flags**. This checks actual browser layout; it is not a physical-phone or human pacing/readability session.
- Scoped `git diff --check`: clean. Full regression suite not rerun for this text-only pass; it remains required before a push. No commit, push or merge.

[Saved validation](media/R1/en-dialogue-audit/validation.txt) ·
[Browser layout result](media/R1/en-dialogue-audit/layout.json)

## Owner review

Read the family calls, Kaan's introduction and Captain scene, campfire, and the final
letter/reunion in sequence. Confirm the emotional tone and whether the humor lands in
play. Automated checks cannot establish laughter, attachment or return-player appeal.
Stop for owner feedback; all revised wording remains a review draft.
