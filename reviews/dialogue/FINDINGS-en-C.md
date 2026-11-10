# FINDINGS: English Batch C and English approval

Decision-maker: the agent. The owner said "you are the decision maker for english" (2026-11-09). Record: D-053 (proposed) in `docs/product.md` §17.
Method: every line was read against its beat intent and `docs/voice-en.md`, not against the Turkish.

## 1. Batch C (480 lines per language, 250 beats)

Defined in `prototype/js/dialogue/batches.js` as everything not in A or B: H07 to H20 story pages and pops, the finale (`FIN*`), the campfire (`CMP*`),
the hood barks `BK.hd07` to `hd20`, the card, evolution, skill and enemy-type barks not in A, and `BK.hack.alarm.*`. Every beat now sits in exactly one
batch (546 of 546, no duplicates). The Turkish side of C is **not reviewed yet**; `tr-C.csv` is exported and waits for the owner.

## 2. What I changed (25 lines, plus 1 mechanical group)

| Problem | Lines | Fix |
|---|---|---|
| Mechanic label with no voice | `evo.hookpull#0`, `evo.foamstorm#0`, `evo.forge#0`, `evo.grinder#1`, `skill.shield#0` | shorter, Arda reacts instead of explaining the stat |
| Same idea twice in one pool | `evo.arcchain#2`, `hd14.4#1`, `hd17.1#2`, `hd20.4#1`, `hd09.3#2`, `hd13.4#2` | new angle, joke flags unchanged |
| Flat or odd | `card.cable#0`, `card.molotov#0`, `FINa1#0` (the "Kaan would check twice" tail made no sense, dropped), `H17p1#0`, `H20p1#0`, `H20p2#0` | rewritten from the beat |
| Britishisms | `H10i2b#0`, `H10p2#0` (metres → meters), `H18p3#0` (any more → anymore) | American |
| `bro` from the minibus driver | `H11b#0`, `H11i3a#0` | "buddy" |
| Too close to the Turkish (checker's translation-pair note) | `H08b#0`, `H12p3#0`, `H19p4#0` | rewritten independently |

Kept as written: the plot facts (D-048), every `C*` call from B, and the jokes in the evolution and enemy barks (ratio is inside 15 to 30% for every pool of four or more).

## 3. Approval

All 1,160 English lines (A 505, B 175, C 480) are marked approved (`ok: 1`) through `dialogue-import.js` with a keep-all sheet, as the English editor under the owner's delegation.
**This is the agent approving its own work.** No human native English reader has seen it. Before release, someone should read `en-A.csv`, `en-B.csv`, `en-C.csv`
(re-exported with status `approved`) and mark anything they would change with `rewrite`; the importer handles it the same way.

## 4. Checks

`test-dialogue.js` PASS (strict on A, B and C: 0 over the limit, 0 pools off-ratio, 0 translationese or Britishism flags, 0 duplicates), `check-ids.js` PASS,
`check-banned.js`: guardrail 0, flag 0, 0 over the limit. English profanity: tier1 6 lines, tier2 2 lines, within voice-en §6.

## 5. Still open (as of the first pass; sections 6 and 7 below supersede this list)

- Turkish Batch C (`tr-C.csv`, 480 lines: H07 to H20 story pages, finale, campfire, barks): plot-carrying, needs the owner's line-by-line review.
- Browser capture at 390×844 in both languages (BRIEF §7); the 100-character `BK.self` bubbles are the likeliest to overflow.
- Optional: exempt `BK.zr` (zombie groans) from the joke ratio.
- (Committed on branch `dialogue/two-native-scripts`, 2026-11-10.)

## 6. Update: Turkish Batch C imported (2026-11-09)

- `tr-C.csv`: 480 rows, all `rewrite`, 479 differ from the draft, 0 over the limit. (One cell, `FINb7#0` characters/limit, was turned into the date "Jul-90" by the spreadsheet; harmless, the line is short.) Imported as written; backup of the previous Turkish files in `/tmp/tr-review/tr-backup-before-C`.
- All 1,157 Turkish and 1,160 English lines are now approved. `test-dialogue.js` PASS, `check-ids.js` PASS, guardrail 0, flags 0, 0 over the limit.
- Plot check against `docs/narrative.md` (L100 cliffhanger, Chapter 2): the Turkish finale now says Mila comes along (`FINb8` "Ben de geliyorum", `FINb9` "Bu sefer Mila da var"), which matches canon. The English did not. I rewrote English `FINb8` and `FINb9` ("I'm coming with you." / "Mila's coming.") so both scripts carry the same plot fact.
- Review-only lint flags left for the owner (not failures): `formal-plural-imperative` on sign text and crowd or news voices (`BK.hd07.4#0`, `H07i2a`, `H01b`, `H12b`, `H13i2a`), `fat-names` "Dombili" (4 lines, deliberate), `third-person-parent` "Dede'nin" (3 lines, correct usage).

## 7. Browser sweep at 390×844 (2026-11-10)

17 pages (14 hood intros H07 to H20, finale A and B, campfire) in EN and TR, 34 screenshots in `reviews/media/dialogue/<lang>-<pageId>.png`.
- **Text clipped: 1 line.** `H14i3a` TR: the first word "Anahtarcının" is wider than its caption and loses its last letter at the panel edge. Proposed fix (owner's text, not changed): "Halkası her adımda şıngırdıyor. Gizlilik sıfır, özgüven tam."
- **Touching, not clipped: 1 line.** `H11i3a` TR: "direksiyonda" reaches about 3 px from the caption border.
- **Layout (not caused by the text, same in both languages):** where two speakers stack vertically, the second name tag sits on the bottom border of the bubble above (H07i3, H10i2, H19i2, FINa, FINb). On H10i2 and H19i2 the Kaan tail also crosses the Arda bubble. The "KNOCK KNOCK!" / "TAK TAK!" SFX looks cut at the panel bottom on FINb (verify at full resolution). This is `view/comic-layout.js` work, not dialogue.
- No wrong portrait, speaker label or language seen.
- **Not done:** the in-game bark bubble check (the Turkish 98-character `BK.self` riddle). A forced bark at priority 9 is dropped by `story/barks.js` (only priorities 1 to 3 have a ttl), and the level-up overlay in level 2 covers the bubble.
