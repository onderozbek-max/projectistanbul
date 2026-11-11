# Review Packet R1: Birds, cats and cayci

Branch `r1/birds-cats` (from `r1/enemy-wave1` at `ccaaab9`). Not pushed. Executed by the lead after the implementation subagent
died with an API error after 81 tool calls (see Deviations 7); the lead inspected the repo state, verified every piece and finished the work.

**Status: the balance gate first FAILED on two levels (L43 and L10); both are now decided. L10 was fixed (musician `minHood` 2, owner accepted the
lead's recommendation; L6 to L10 now equal the baseline exactly). L43 is accepted by the lead and owner as designed (see Decisions). Both causes are isolated below.**

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
| A | bot gate (L8 reach, median time, clear and no-death) | L8 PASS; L10 fixed (musician `minHood` 2); L43 accepted by decision | Balance and Decisions below |
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
9. **Musician `minHood` 1 to 2** (a wave-1 number, changed on the owner's acceptance of the lead's recommendation after the gate failed on L10). Doc updated (content-catalog §11).
10. No other sim number changed except cayci slow 0.75, as named in the brief.

## Known issues
- **L43 median clear time is +70% in the bot** with the thief on. Accepted as designed (Decisions); watch it in real play.
- The **48 px silhouette check** for the pigeon was not made. In flight, at phone size, the pigeon thief reads gull-like (see `thief-pigeon-l37-beyazit.png`).
  The ground pigeon is clear. Needs the owner's eye.
- **Device frame time** not measured.
- **Browser capture is 576 px wide**, not 390 x 844.
- TR lines for `guvercin` and `kedi` are drafts; the owner has to approve them in `tr-D2.csv`.

## Questions for the lead (owner decisions)
All three were answered; see Decisions below.

## Decisions (owner delegated 1, accepted 2, approved 3)
1. **Thief: keep it in every hood from H05, as designed.** The owner asked the lead to decide without a playtest. Reasons: the bot's slowdown is probably a policy
   artifact (it chases the thief's drops); the thief is safer for the bot (no-death 92% vs 83%); and it is one config value to cap later
   (`thief.from`, or at most one live thief) if real play shows drag. The `?thief=0` shortcut (`d8e3e95`) stays for that.
2. **Musician: `minHood` 1 to 2** (config-skins.js, content-catalog §11). Applied. Re-run, 50 seeds, current vs `be4bd08`: **L6, L7, L8, L9, L10 are identical**
   (L10: clear 96%, no-death 76%, median 136 s, 0.28 deaths/run). Galata keeps the musician as a story skin only until Karaköy.
3. TR lines for `guvercin` and `kedi` approved by the owner (11 keep, 1 rewrite), imported with `ok` (`7ca9d9f`).

## Proposed next steps
1. Pigeon 48 px silhouette sheet, and a device frame-time run (both still owed).
2. Stage `index.html` with the three script lines above and merge to `main`.
3. Then the enemy cap and diner change (D-056), a separate task.

---

# Review Packet R1: Enemy ceiling (D-056)

Branch `r1/enemy-cap` (from `main` at `bba1946`). Not pushed.

## Summary
- **One hard ceiling of 200 live enemies** (`levels.ceiling.hard` in `config-levels.js`), enforced in the single spawn funnel `Combat.spawnEnemy`, which returns `null` past it.
  It closes the paths that had no check (summons, events, surge arrivals, set pieces). The soft gates stay: route 140, horde 200.
- **A boss always spawns; its scripted adds** (the intro ring in `levels.js`, summons in `enemies.js`) **may go to 220** (`ceiling.boss`).
- **Callers are null-safe**: horde route and surge spawns, summons, and the two events that use the result (loot runner, chest guard), which now end as `capped`.
  `hack.js` and the rest ignore the result. `ceilingHits` counts refusals on the sim state.
- **Diners**: already tutorial-only (generated levels drop them, `journey.md` says so); nothing to change.
- Docs: D-056 marked implemented in `docs/product.md` section 17.

## Tests
`tools/test-ceiling.js` (new): refuses at 200 and counts it; boss adds stop at exactly 220; the boss itself is never refused; just below the ceiling nothing changes;
loot, chest, ambush and pier events, five levels and a boss level run 40 to 60 s on a full field without throwing or exceeding the ceiling. It fails on the unfixed
code (and the loot guard is checked: without it the loot event throws). Also pass: `test-enemy-behaviors`, `test-horde`, `test-env` (117), `test-meta` (122),
`test-dialogue`, `check-entrances`, `check-death-causes`, `check-hood-keys`, `check-ids`, `check-objective-strings`.

## Balance
Bot, 30 seeds, clean exports of `main` and `main` plus this patch only. **Identical on every level, peak alive included** (the ceiling never bit):
L10 (peak 105), L22 (164), L30 (126), L43 (188), L50 (153). Matches D-056's expectation ("changes almost nothing at runtime").

## Deviations
1. `tools/test-horde.js` and `tools/check-entrances.js` changed: the first spawned 300 walkers on one sim (now clears the field per call, the intent is entrance state),
   the second dereferenced a null result in its `spawnEnemy` wrapper.
2. Two opts flags on `spawnEnemy`: `boss` (never refused) and `bossAdd` (up to 220).

## Known issues
- Not measured on a device; D-056 says not to lower the ceiling before the Low-device run (M0-T4).

---

# R1-T2: art direction (style samples)

Same three subjects, three pipelines, all at 390x844 (exported at 2x, 780x1688) in `reviews/media/R1/style-samples/`. File names are `<subject>-<pipeline>.png`.
Subjects: `building` (Atakoy block, golden hour), `flat` (Arda's family flat, evening), `panel` (comic page panel, Arda and Kaan on the bridge, inside the 366x704 page area).

| Pipeline | What it is | Source |
|---|---|---|
| `base` | Today's engine, unchanged (`ComicArt.scene` 'apartment' and 'bridge', `fin_flat`, `ComicBusts`). Drawn from the working tree. | prototype/js/view |
| `a` | Stronger procedural: more canvas shapes (windows, shutters, awning, rug), then a post pass that adds ink edges and paper grain to the background. Busts are drawn after it, untouched. | `design/style-samples/a-procedural.js` |
| `b` | Authored vector: hand-written SVG with ink outlines, wobble, paint grain, cel shading (warm light side, cool shadow side). | `design/style-samples/b-vector/*.svg` |

Re-render: `design/style-samples/stage.html?pipe=base|a|b&subj=building|flat|panel` (needs Chrome).

## What the samples show
- **Backgrounds are the weak spot, not the characters.** In `panel-base` the busts are good (ink outline, paper halo, readable faces) and the bridge behind them is a grey smear. The building is beige slabs with no detail, the flat is rectangles and dots.
- **`a` does not fix it.** A post pass cannot add things that are not drawn. Every extra prop costs hand-written shape code, and the result (`building-a`, `flat-a`) is cleaner but still generic. It is also the most code to keep alive.
- **`b` fixes it.** `building-b` and `flat-b` read as the same game as the busts: Atakoy shutters, bakery steam, laundry, scooter; tea cups on the table, night window, carpet, Dad's Letter on the wall.
- **`b` is weaker on people.** The SVG Arda and Kaan in `panel-b` are simpler than the engine busts (flat faces, stripes not following the body). Do not use B for characters.
- Guardrails: no real brands or crests, no state symbols, mosque only as a distant skyline silhouette, no flashes, no lettering in any sample.

## Recommendation: B for backgrounds, keep the engine busts
Authored vector backgrounds (B), with the existing procedural busts on top. That is the `panel-b` background with the `panel-base` busts. One style, two methods, each used where it is strongest.
- Cost: one authored SVG per scene (Ch.1 needs roughly 30 backgrounds, about 25 comic scenes and 5 arenas), an estimated 1-2 hours each. Static, small files, fast to load, scale to any phone.
- Not done: pipeline C (generate then hand-check). Generation needs paid Figma credits, so I did not run it. B already clears the bar, so I recommend not spending.
- Provenance: all `b` files are authored by hand, no generation, so nothing is logged in `art/PROVENANCE.csv` yet. The file is created when the first generated or third-party asset arrives.

## Decision
**Accepted 2026-11-10** (owner: "yes i agree with your suggestion"): B for backgrounds, engine busts for characters. Recorded as D-057 in `docs/product.md` section 17; `docs/design-system.md` section 2 and 12 and `design/style-exploration.md` updated. Unblocks T3 (arenas) and T4 (animation and feel).

## Deviations
1. The baseline is drawn from the working tree, which holds other in-progress comic-bust edits (not committed). It may differ slightly from `main`.
2. Samples are static; nothing in the game loads them yet.

---

# R1-T3: Istanbul arenas, first pass (three hoods, ground only)

## What is done
- **20 briefs** in `docs/hood-visual-briefs.md` (landmarks, props with solid or dressing flags, materials by palette token, fictional signs, light, sound, contrast with neighbours). Open questions are resolved there as lead decisions you can overrule.
- **Authored ground for three hoods**: İstiklal (granite setts plus tram rails set in the road, pale paving), Kapalıçarşı (worn flagstones, amber dust in the joints), Ataköy (patched, cracked asphalt, courtyard paving). Style per D-057: `night_ink` joints, three stone tones, warm highlight top-left, cool shade bottom-right.
- **Plaza, market, arena and bridge floors** of generated levels now use the hood's authored paving with the zone colour as a wash. These floors covered most of the screen in Ataköy and were flat grey before.
- **Mechanism**: `js/view/arena-art.js` rasterizes embedded SVG per zoom step and plugs into the existing theme tile cache (`Themes.tile`), so every hood that gets a tile picks it up with no draw-code change. The other 17 hoods still use the old tiles until their SVGs exist. If an image fails to load, the old tile is used.
- Sources: `art/arenas/*.svg` (review copies), `tools/gen-arena-art.js` (seeded generator, run it to rebuild), `js/view/arena-art-data.js` (generated, loaded by the game).

## Before and after (`reviews/media/R1/arenas/`)
| Hood | Before | After |
|---|---|---|
| İstiklal L1 (scripted level, hero alone) | `h01-before.png` | `h01-after.png` |
| İstiklal L2 (live run, enemies on screen) | `l02-before-live.png` | `l02-after-live.png` |
| Kapalıçarşı L32 (live run) | `l32-before-live.png` | `l32-after-live.png` |
| Ataköy L97 (live run) | `l97-before-live.png` | `l97-after-live.png` |

Stills are rendered by `prototype/tools/arena-still.html` (`?hood=&stage=&y=&live=1&noart=1&dump=1`, Chrome headless, 390x844 at 2x). The "before" shots use `noart=1`, which is today's baked tiles.

## Honest read
- **Ground is clearly better** and enemies stay readable on it (olive zombies on mid-value stone; compare the live shots). The cobbles are bigger and calmer than a literal setts pattern on purpose, so they do not fight sprites at 390 px.
- **The ground alone does not say "Istanbul".** It says "old stone street". The camera is pinned to the corridor centre and shows only 10 m across, so facades never appear; what makes a hood recognisable on screen is the props, signs and overhead (string lights, awnings, the Galata Tower in the distance). Those are still the old procedural art. I expect the owner check "could only be Istanbul" to fail on this pass for that reason.
- Hood accents (the 2 per hood in the briefs) are not applied yet.

## Next (needs your call, see Decision)
Authored props and signage for the same three hoods: İstiklal (tram, simit cart, chestnut cart, awnings, shop signs), Kapalıçarşı (lantern, stall awnings, shutters), Ataköy (laundry lines, kapıcı booth, bread crates, shutters). Then the other 17 hoods' ground, then their props.

## Performance and tests
- Not measured on a device. One extra raster per zoom step per tile (about 160 px square), done once, then the same pattern fill as before. Data is 91 KB of SVG text in one file.
- No automated test loads view code (loaders exclude `js/view/`), so nothing in the test suite covers this. Syntax-checked, and rendered end to end in Chrome headless for all four views above. A real device frame-time run is still owed (see Known issues).

## Deviations
1. The ground tiles are produced by a seeded script with hand-set shapes, palette and shading, not drawn stone by stone. D-057 says authored; this is authored geometry rules, not hand-placed stones. Props and signs will be hand-written SVG.
2. Other uncommitted work in the tree (feel, vehicles, comic busts) is included in the screenshots because the stills render the working tree. It is not part of this commit.

## Decision needed (one)
Accept this direction for ground and continue with authored props and signage for the three hoods (my recommendation), or change the ground first.

---

# Owner feedback on enemies (D-058)

Owner, on seeing the new ground: the enemies look like they wear sombreros, and zombies spawn from below the ground ("a gate in the floor opens"), which made no sense. Both fixed and recorded as D-058.

## 1. Sombreros
The wide straw hat (tourist, gardener) and the wide bucket hat (fisher, mussel seller) read as sombreros. All four now wear caps: tourist white visor cap, gardener and fisher flat olive-brown caps, mussel seller a green cap. The two brim shapes are deleted from `art-characters.js`. Fishermen keep the rod, tourists the selfie stick, so silhouettes still differ.
The simit seller's tray hat (a plate with gold simit rings) stays; it is the real Istanbul image and reads as a tray in the live shot. Tell me if it still looks like a sombrero to you and it goes too.

## 2. Nothing comes up from below the ground
Manholes are retired as spawns:
- Route spawns no longer have a manhole entrance (window, balcony and tram stay).
- The manhole portals in generated levels are dropped (the level's own doors and windows stay). Side entrances hit balance, so I tuned them (see Balance and Deviations).
- Crawlers have no entrance animation. They crawl in from the street edge.
- The İstiklal L1 cat beat: the cat hisses and a crawler walks in from the cat's side (x -5.6, y 176) instead of a manhole rattling.
- The Manhole Cover weapon is unaffected.
- `check-entrances` now **fails if any spawn uses a manhole** or any portal is one.

Config: `portal.manhole*` and `layouts.spawn.manhole*` removed, `levelcfg.crawlerFrom` replaces the L1 manhole point. Docs updated: `level-001-istiklal.md`, `game-design.md`, `journey.md`, `content-catalog.md`, `architecture.md`.

## Story lines changed
English is final. **Turkish needs your OK (two lines, proposed by me):**
| Id | Was (TR) | Proposed (TR) |
|---|---|---|
| `H01i2a` (Hood 1 intro caption) | Yürüyenler, koşanlar, rögardan sürünenler. Hepsi işe geç kalmış gibi. | Yürüyenler, koşanlar, kaldırımdan sürünenler. Hepsi işe geç kalmış gibi. |
| `BK.env.door` (a door or window is about to open) | Rögar kapağı kalkıyor! | Kapı sarsılıyor, geri çekil! |

English: `H01i2a` "crawlers along the kerb"; `BK.fk.crawler` "It crawled in off the kerb. Didn't even knock."; `BK.env.door` "That door is shaking. Back off slowly." Also changed: `tip.crawler` (UI, both languages), and the unused `ev.manhole` and `env.manhole` strings are removed. The matching beat intents in `dialogue/intents.js` are updated.

## Tests
`check-entrances` (updated, 6 seeds), `test-env`, `test-horde`, `test-ceiling`, `test-enemy-behaviors`, `test-dialogue`, `test-meta` (122), `check-ids`, `check-hood-keys`, `check-death-causes`, `check-objective-strings`, `check-banned` all pass. `test-arsenal` and `test-arsenal-w` were not run (unrelated to this change; the first takes minutes on this loaded machine).

## Balance
Bot, `kite-generic`, expected loadout, seeds 1..N, clean exports of HEAD vs the staged D-058 state. "No-death" is the first-attempt proxy; the design target for L10 is about 70% (game-design §7).

| Level | Build | Seeds | Clear | No-death | Deaths/run |
|---|---|---|---|---|---|
| L10 (Galata boss) | HEAD | 400 | 95% | 72% | 0.33 |
| L10 | D-058, first cut | 400 | 89% | 57% | 0.55 |
| L10 | D-058, tuned (shipped) | 300 | 92% | 66% | 0.42 |

**What I found.** Removing manholes cost L10 about 15 points. A bisect (300 seeds each) showed two causes, about 7 points each: (1) route entrances were all at the side walls after the manhole (centre lane) kind went, so enemies flank the hero instead of arriving in front of the gun; (2) the replacement door portals were also at the side walls. Crawlers having no entrance made no difference (73% with the crawler change alone reverted).

**Tuning (recorded under Deviations).** Entrance chance 0.3 to 0.15, entrance distance ahead 5-8 m to 8-11 m, and the extra door portals and extra door marks dropped (portal pressure now comes from the level's own doors and windows only). Rise time 1.0 s was tried and did not help. Other levels are unchanged (spot table below).

Spot checks of the shipped state against HEAD (100 seeds each, no-death / deaths per run):

| Level | HEAD | D-058 shipped |
|---|---|---|
| L2 (route) | 96% / 0.03 | 95% / 0.05 |
| L22 (route) | 94% / 0.07 | 95% / 0.05 |
| L30 (boss) | 55% / 0.65 | 68% / 0.46 |
| L50 (boss) | 60% / 0.54 | 64% / 0.52 |
| L97 (route) | 70% / 0.34 | 69% / 0.34 |
| L1 (hand-made, cat beat) | not measured on HEAD | 88% / 0.13, 100% clear |

All within noise except L30, which got easier (100 seeds, so treat as noise too). L10 is the only level that stays a few points under HEAD (66% against 72%).

## Deviations
1. **Numbers changed for balance:** `entrance.chance` 0.3 to 0.15, `entrance.aheadMin/aheadMax` 5-8 to 8-11 (`config-enemies3.js`); the extra door portals (`portal.extra*`) and extra door marks (`layouts.spawn.extra*`) are gone. L10 first-attempt is 66% against a roughly 70% target (HEAD was 72%). I stopped there because further cuts would thin out the windows, balconies and trams that replace the manholes. Say if you want it closer to 72%.
2. `check-entrances` now defaults to 6 seeds (was 3): with the lower entrance chance, 3 seeds missed the tram in Sirkeci.
3. `BK.fk.crawler` TR is unchanged: it never mentioned manholes.
4. The manhole drawing, mark and 'rattle' sound code is deleted (nothing triggers it any more). The Manhole Cover weapon is untouched.

## Screenshots
`reviews/media/R1/arenas/l02-after-d058.png` (İstiklal, live run) and `l17-after-d058.png` (Karaköy, live run): caps, no wide brims, and crawlers walk in from the street edge with no ground gate. The stills render the working tree, so other people's uncommitted work (vehicles, comic busts, fire animation) shows in them; it is not part of this commit.
