# Review Packet R1: Birds, cats and cayci

Branch `r1/birds-cats` (from `r1/enemy-wave1` at `ccaaab9`). Not pushed. Executed by the lead after the implementation subagent
died with an API error after 81 tool calls (see Deviations 7); the lead inspected the repo state, verified every piece and finished the work.

**Status: the balance gate FAILED on two levels (L43 and L10). I stopped tuning, as the brief says. Both causes are isolated below.
A human playtest and an owner decision are needed before this merges.**

## Summary
- **Cayci slow 0.65 to 0.75** (`config-enemies5.js`, `docs/content-catalog.md` §11, test).
- **The thief (marti) has two looks by geography**: seagull in 12 seaside hoods, pigeon in 8 inland hoods (`config-fauna.js` `birdLook`).
  Same behaviour, same stats, same sim digest. **No enemy thief in H01 to H04**; it starts at H05 and applies to every later hood from stage 2
  (`thief: { type: 'marti', fromHood: 4, from: 2 }` replaces the explicit list that put it on Galata and Köprüsü).
- **Ambient fauna in all 20 hoods**, view only: 1 to 3 cats (mixed, orange, brown) and 2 to 4 birds per level at fixed spots from a view-only RNG.
  Cats sit, flick, walk, trot away within 3 m, and **stand and hiss at an elite or boss within 10 m** (stretch, built). Birds peck and take off within 2.5 m.
  Reduce-motion: no trot, walk or flight. Never in the sim state, never an enemy, never damage.
- **Batch D beats** `BK.fk.guvercin` and `BK.fk.kedi`, 3 lines each. EN approved by the lead, TR drafts without `ok` in `reviews/dialogue/tr-D2.csv`.
- **Docs follow the code**: journey §5.0 (ambient-fauna exception, seaside/inland table), content-catalog §11 and §11.4, AUDIT-ENEMIES deviation 1 resolved.

## Commits
```
307e9cb r1/birds: fix the on-screen cull (R.X and R.Y are centre-relative)
30c3861 r1/birds: keep ambient animals inside the camera view
8c9fcae r1/birds: docs follow the code (thief by geography from H05, ambient fauna, audit deviation resolved)
1e9a65e r1/birds: first-sighting beats BK.fk.guvercin and BK.fk.kedi (batch D)
228eb7d r1/birds: ambient cats and birds in every hood (view only), pigeon look for the thief, tests
88025b9 r1/birds: thief from H05 in every later hood, none in H01 to H04
5c26e19 r1/birds: cayci slow 0.65 to 0.75 (audit 13 answer 2)
```
Plus one commit for `tools/bench-fauna.js`, the screenshots and this packet.
**`prototype/index.html` is NOT staged** (it holds other people's script tags). The lines this branch needs, to add when it is staged:
`js/config-fauna.js` (line 199, after `config-enemies5.js`), `js/view/fauna-art.js` (316) and `js/view/fauna.js` (317).

## Acceptance criteria
| Task | AC | Status | Evidence |
|---|---|---|---|
| A | cayci slow 0.75 in config, docs and test | PASS | `config-enemies5.js`, content-catalog §11, `test-enemy-behaviors` |
| A | bot gate (L8 reach, median time, clear and no-death) | **FAIL (L43, L10)** | Balance below |
| B | look by hood geography; every hood in exactly one list | PASS | `test-enemy-behaviors` section 9 |
| B | no thief in H01 to H04, thief from H05 | PASS | same |
| B | the two looks give the same sim digest | PASS | same (pigeon vs seagull override) |
| B | pigeon reads at phone size | PARTIAL | screenshots; the 48 px silhouette sheet was **not made** (Known issues) |
| C | ambient birds in all 20 hoods incl. H01 to H04, cats in every hood, three coats | PASS | `test-enemy-behaviors` section 10; screenshots |
| C | view only: digest equal with fauna on and off; no sim RNG | PASS | same; `fauna.js` uses its own `mulberry` |
| C | never an enemy, never blocks movement | PASS | same; animals are not in `s.enemies` |
| C | reduce-motion respected | PASS | test: no trot, walk or flight |
| C | stretch: hiss at elite or boss within 10 m | PASS | test + `cat-hiss-elite.png` |
| C | frame time p50/p95 | PARTIAL | JS cost measured, device frame time **not** measured (Performance) |
| D | beats, 3 lines each, limits, lint | PASS | `test-dialogue`, `dialogue-lint`, `check-banned` |
| E | docs | PASS | journey §5.0, content-catalog §11 and §11.4, AUDIT-ENEMIES |

## Tests
All run on the final tree, all pass:
`test-enemy-behaviors` (extended: look by geography, thief placement, digest equality, fauna placement, **fauna inside the camera view**,
**every animal in view is drawn**, reduce-motion, shy, hiss) · `test-horde` · `test-dialogue` · `test-meta` (122 checks) · `check-death-causes` ·
`check-entrances` · `check-hood-keys` · `check-ids` · `check-objective-strings` · `dialogue-lint` · `check-banned` (report only) · `test-arsenal` (run once at the end): PASS.

Two regression tests were added for bugs found late (see Deviations 5 and 6). Both were checked against the unfixed code and fail there
(167 of 394 spots off camera; 397 of 397 animals culled).

## Performance
Not measured on a device. The browser preview ran on a loaded desktop, so a frame-time number from it would mean nothing.
What I measured instead, with `node tools/bench-fauna.js` (JS cost of `Fauna.update` + `Fauna.props` per frame, stub canvas, 1800 frames):

| level | fauna p50 | fauna p95 | note |
|---|---|---|---|
| L43 (Kumkapı, heavy) | 0.007 ms | 0.018 ms | 47 enemies alive at the end |
| L22 (Eminönü) | 0.022 ms | 0.085 ms | 41 enemies alive at the end |

That is under 0.5% of a 16.7 ms frame, before GPU draw cost (a handful of small sprites). The sim is untouched (digest equal), so sim ms/tick is unchanged.
A real p50/p95 on the iPhone is still owed.

## Balance
Bot, 50 seeds, expected loadout, default policy. Baseline = `be4bd08` exported to `/tmp/tr-review/base`; current = this branch. Same seeds.

| level | clear base to now | no-death base to now | median s base to now | deaths/run | verdict |
|---|---|---|---|---|---|
| L2 | 98% to 98% | 94% to 94% | 168 to 168 | 0.04 to 0.04 | identical |
| **L8** | 98% to 100% | 92% to 90% | 199 to 200 | 0.10 to 0.10 | **gate met**: reach 48/50 = 96% (was 46/50), need 75% |
| **L10** | 96% to 94% | **76% to 62%** | 136 to 143 | 0.28 to 0.40 | **FAIL: no-death -14 points (limit 10)** |
| L13 | 98% to 100% | 84% to 88% | 271 to 284 | 0.18 to 0.12 | ok |
| L22 | 94% to 98% | 86% to 94% | 230 to 239 | 0.20 to 0.08 | ok |
| L30 | 74% to 80% | 48% to 48% | 143 to 157 | 0.78 to 0.72 | ok |
| **L43** | 98% to 92% | 92% to 90% | **238 to 405 (+70%)** | 0.10 to 0.14 | **FAIL: median time +70% (limit 25%)** |

**Cause of the L43 failure: the thief.** Bisect on L43 (24 seeds, config overrides, same code):

| variant | median s | no-death | lvl-ups |
|---|---|---|---|
| current | 405 | 92% | 32 |
| all three skins off | 402 | 88% | 30 |
| fisher off / musician off / hamal off | 414 / 416 / 405 | 83% / 88% / 92% | 32 / 31 / 32 |
| **fisher drag 1.8 m (the brief's lever)** | **422** | 92% | 32 |
| **thief off** | **254** | 83% | 26 |
| thief off and skins off | 246 | 83% | 24 |

L43 had no thief in the baseline (it was placed only on Galata and Köprüsü). With the thief on, the bot's median clear time rises about 60%, its
level-ups rise from 26 to 32 (the thief returns XP plus gold) and its no-death rate rises from 83% to 92%. So the bot clears more slowly but
more safely. **My hypothesis (not verified): the generic bot policy chases the thief's returned drops and the thief's flight, which costs
time, not lives.** Softening the fisher does nothing here, so I stopped, as the brief requires.

**Cause of the L10 failure: the wave-1 musician buff, not this branch.** L10 has no thief and no fisher. With the musician off, 50 seeds:
clear 100%, no-death 74% (baseline 76%), deaths/run 0.26 (baseline 0.28). Musician on: 62% and 0.40. L10 is the Galata boss; the musician
phases in at hood 1. The fisher cannot help there either.

Candidate fixes for the musician, L10, 50 seeds (diagnostic only, nothing applied):

| variant | clear | no-death | deaths/run |
|---|---|---|---|
| baseline `be4bd08` | 96% | 76% | 0.28 |
| current (`minHood` 1, `speedMul` 1.15) | 94% | 62% | 0.40 |
| `speedMul` 1.10 | 100% | 60% | 0.40 |
| `maxAlive` 1 | 98% | 66% | 0.36 |
| **`minHood` 2** (no musician in Galata) | 96% | **76%** | 0.28 |

Only `minHood` 2 restores the baseline. Softening the speed buff or the cap does not. Cost: Galata loses its street musician until a later hood.

## Telemetry
None for this task.

## Screenshots
`reviews/media/R1/birds-cats/` (captured from the browser preview; the panel renders at 288 x 563 CSS px, so these are 576 px wide, not 390 x 844):

| file | shows |
|---|---|
| `thief-seagull-l22-eminonu.png` | seagull thief in Eminönü (L22), rain, gulls in flight, a cat top left |
| `thief-pigeon-l37-beyazit.png` | pigeon thief in Beyazıt (L37), light blue-grey wings with a dark tip bar and a small gold dot; reads gull-like in flight at this size |
| `pigeon-h01-istiklal.png` | ambient pigeon pecking in H01 İstiklal |
| `cat-mixed-h01.png` | white-and-brown cat, H01 |
| `cat-orange-h01.png` | orange cat walking, H01 (with a pigeon at the top) |
| `cat-brown-kumkapi-kedi-bark.png` | brown cat in Kumkapı and the first-sighting bark "If the cat hisses, something's coming. Trust the cat." |
| `cat-hiss-elite.png` | the same cat standing (state `stand`, hiss timer 2) with an elite 6 m away |

## Deviations
1. **Yenikapı is a pigeon hood, not a seagull hood.** The brief listed it as seaside; `journey.md` calls it an underground metro hood. Doc updated (§5.0 table).
2. **The thief starts at H05 (hood index 4), not hood index 2.** The audit text contradicted journey §5.0; §5.0 wins. Config `thief.fromHood: 4`.
3. **`sideMax` 4.3 m (new view dial, `config-fauna.js`).** The camera shows 10 m of the 14 m corridor, so cats drawn from the full corridor could sit off camera.
4. **`BK.fk.guvercin` and `BK.fk.kedi` live in `barks-cards.js`** (with the other `fk` beats), not in a new file.
5. **Bug found late, fixed (30c3861):** 167 of 394 animal spots were outside the camera view. Regression test added.
6. **Bug found late, fixed (307e9cb):** `onScreen` in `view/fauna.js` assumed a top-left origin, but `R.X` and `R.Y` are centre-relative, so every animal in the left
   half and the top half of the screen was culled and never drawn. Found only by playing the level in the browser; no unit test could see it. Regression test added.
7. **The implementation subagent died** (API error, 81 tool calls, with the bot runs and some edits half done). The lead did not trust its report: re-read the diff,
   re-ran every check, re-ran the bot gate and finished the fixes. The commits above are verified work.
8. **`tools/bench-fauna.js` is new** (not requested): it is how the Performance numbers were produced.
9. No sim number changed except cayci slow 0.75, as named in the brief.

## Known issues
- **Balance gate fails on L43 and L10** (Balance). Neither is caused by the fisher drag, so the brief's lever does not apply.
- The **48 px silhouette check** for the pigeon was not made. In flight, at phone size, the pigeon thief reads gull-like (see `thief-pigeon-l37-beyazit.png`).
  The ground pigeon is clear. Needs the owner's eye.
- **Device frame time** not measured.
- **Browser capture is 576 px wide**, not 390 x 844.
- TR lines for `guvercin` and `kedi` are drafts; the owner has to approve them in `tr-D2.csv`.

## Questions for the lead (owner decisions)
1. **Thief placement vs the bot (L43).** Keep the thief in every hood from H05 (the design) and accept that the bot reads it as 60% slower but safer, then judge it in a
   human playtest? Or reduce it: at most one live thief, or start at stage 3? I recommend a playtest first: the bot policy, not the player, is the likely cause.
2. **Musician buff (L10).** It costs 14 points of no-death on the Galata boss. Options: `minHood` 1 to 2, `speedMul` 1.15 to 1.10, or accept. This is wave-1 content,
   outside this task, so I changed nothing.
3. Approve or rewrite the 6 TR lines in `reviews/dialogue/tr-D2.csv`.

## Update after review
- TR lines for `guvercin` and `kedi` approved by the owner (11 keep, 1 rewrite), imported with `ok` (`7ca9d9f`). Question 3 is closed.
- `?thief=0` review shortcut added (`d8e3e95`) and an A/B playtest sheet written: `reviews/PLAYTEST-thief.md`. Question 1 is open until that is played.

## Proposed next steps
1. Owner playtest of L22, L37 and L43 (thief), `reviews/PLAYTEST-thief.md`; decide question 1. Question 2: lead recommends `minHood` 2 for the musician.
2. Pigeon 48 px silhouette sheet, and a device frame-time run.
3. Stage `index.html` with the three script lines above and merge once the gate is decided.
4. Then the enemy cap and diner change (D-056), a separate task.
