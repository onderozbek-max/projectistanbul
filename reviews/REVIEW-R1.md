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
English is final. **Turkish: `H01i2a` approved by the owner; `BK.env.door` replaced with the owner's own wording:**
| Id | Was (TR) | Proposed (TR) |
|---|---|---|
| `H01i2a` (Hood 1 intro caption) | Yürüyenler, koşanlar, rögardan sürünenler. Hepsi işe geç kalmış gibi. | Yürüyenler, koşanlar, kaldırımdan sürünenler. Hepsi işe geç kalmış gibi. |
| `BK.env.door` (a door or window is about to open) | Rögar kapağı kalkıyor! | Kanalizasyon kapağı hareket ediyor. Kaçmalıyım. (owner's wording) |

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

---

# T3, part 2: authored street props (İstiklal, Kapalıçarşı, Ataköy)

The street kit each hood already places (`journey.js` `kit`) now has authored vector art instead of the grey procedural boxes. Same style as the ground: night_ink outlines, warm highlight top-left, cool shade bottom-right. Facades never show on screen (camera is 10 m wide), so the kit is where the hood's character can actually be seen.

Screenshots (`reviews/media/R1/arenas/`): `kit-istiklal.png`, `kit-hood6.png` (Kapalıçarşı), `kit-hood19.png` (Ataköy). Each is the hood's kit laid out in two columns on its own ground, both variants of each kind.

| Hood | Kit kind | Authored as |
|---|---|---|
| İstiklal | `cart` (2 variants) | simit cart with a red and cream striped canopy, simit rings under glass; chestnut roaster cart with a copper drum, embers, steam and a chestnut tray |
| İstiklal | `tables` | two café tables with check cloths, tea glasses and bentwood chairs |
| İstiklal | `bench`, `bin` | slatted wooden bench; green city bin with a gold band |
| Kapalıçarşı | `lx_stall` | jeweller counter: glass case with gold and gems under a kilim-red awning |
| Kapalıçarşı | `crates` | pile of rolled kilims with diamond patterns |
| Kapalıçarşı | `cart` | tea-tray cart: brass tray ringed with tea glasses and a samovar |
| Kapalıçarşı | `planter` | turquoise glazed pot with a flowering bush |
| Ataköy | `planter` | stucco planter box with geraniums |
| Ataköy | `bin`, `bench` | courtyard bin; Bosphorus-blue bench |
| Ataköy | `car` (2 colours) | parked hatchback facing the viewer, blue or white |

## How it works
- `tools/gen-arena-props.js` builds the SVGs from `tools/arena-props/{lib,istiklal,bazaar,atakoy}.js` and writes `art/arenas/props/*.svg` plus `js/view/arena-props-data.js`. Re-run it after editing a prop.
- `js/view/arena-props.js` draws them. `P.Props.draw` tries the authored art first when the block carries a theme, and falls back to the old procedural prop while an image decodes or when a hood has none. Hoods without authored props are unchanged.
- **Sign words are not baked into the art.** The vendor signs (`SİMİT`, `DEDE KESTANECİ`, `NAZLI KUYUMCU`, `KAHVECİ SADIK`) are written at runtime from keys in the new `js/strings-signs.js`, so they follow the language and Turkish casing.
- Sim untouched: no spawn, placement or collision change. Only the view reads the art.

## Needs your eye (Turkish owner check)
Four shop and vendor names, from `docs/hood-visual-briefs.md`: **Dede Kestaneci**, **Nazlı Kuyumcu**, **Kahveci Sadık**, **Simit**. Say if any should change.

## Not done yet
- Props the brief names that the kit does not place: kilims on arches, brass lanterns, numbered shutter terminals, laundry lines, kapıcı booth, bread crates. They need either a kit change (which shifts level generation and balance) or the overhead and dressing layer, so I want your call before touching them.
- Shopfront signs (Lale Kırtasiye, Gece Eczanesi, Yıldız Fırını, Mavi Panjur Lokantası and so on) are on facades that never show on screen. They would only matter if the camera or facade design changes.
- The other 17 hoods still use procedural props.

## Tests
`check-ids`, `check-hood-keys`, `check-objective-strings`, `test-meta` (122) pass. The game page loads with no console errors. There are no automated tests for props or themes in this repo, so the check is visual (the three screenshots).

## Deviations
1. `tools/arena-still.html` gets a `?kit=1` mode and waits for the prop images; the block draw call in `render-world.js` now passes `theme` and a variant value `v`.
2. The still tool needed a bounding box on its blocks because of someone else's uncommitted render change (ambient-occlusion padding), which is not part of this work.

---

# T3, part 3: authored street props for the other 17 hoods

Every hood now has authored art for each kind its street kit places (`journey.js` `kit`), so all 20 hoods are covered. The first three (İstiklal, Kapalıçarşı, Ataköy) stay bespoke. The other 17 come from shared parametric builders that each hood configures with its own palette and vendor, so the style stays consistent and a colour change is a one-line edit.

Screenshots (`reviews/media/R1/arenas/`): `kits-sheet-1.png` (Galata, Karaköy, Köprü, Eminönü, Sirkeci), `kits-sheet-2.png` (Beyazıt, Kumkapı, Laleli, Aksaray, Yenikapı), `kits-sheet-3.png` (Samatya, Yedikule, Kazlıçeşme, Zeytinburnu), `kits-sheet-4.png` (Bakırköy, Sahil, Marina). Each column is one hood's kit on its own ground.

| Hood | What the kit became (accent from the brief) |
|---|---|
| Galata | tavla tables with backgammon boards, shutter-green bench, ivy planter, stone post (#2E5E4E) |
| Karaköy | coral pastry stall "Vapur Pastanesi", iron quay bollards, coral check café tables, tram-stop barrier (#E07A5F) |
| Köprü (bridge) | rust mooring bollards, tackle crates, iron barrier, dark bin (#A5542B) |
| Eminönü | red corn cart, spice sacks, spice stall "Karabiber Kemal", fish-bread tables (#A8322D) |
| Sirkeci | steel-blue station benches, ticket kiosk "Bilet Gişesi", planter (#5E7A8C) |
| Beyazıt | book crates, plane trees, green bench and bin (#4F7A3A) |
| Kumkapı | wooden fishing boat, fish-on-ice crates, meze tables, iron mooring bollards |
| Laleli | carton stacks, handcart, loading truck, sodium-night bin (#8B6B4A) |
| Aksaray | cream dolmuş, yellow taxi with roof light, hazard barrier, kerb bollards (#E5C02A) |
| Yenikapı | hazard barriers, timber station benches, platform bollards (#7A5230) |
| Samatya | check café tables, dawn-pink bench and bollards, geranium planter (#A8322D, #E7A6A0) |
| Yedikule | terracotta planters, garden cart with produce, plane trees (#2E5E4E) |
| Kazlıçeşme | park benches, plane trees, bins, pale-blue path bollards (#7FB8C9) |
| Zeytinburnu | dyed bale stacks, fabric-bolt cart, delivery truck in dye teal and magenta (#2A7F80, #A8327D) |
| Bakırköy | arcade kiosk "Börekçi Nazmiye", school-green bench, planter (#4F7A62) |
| Sahil | pink and mint pastel benches, bollards and bins, palm trees (#F2B8C6, #A8D8C4) |
| Marina | white yacht with a teal stripe, brass mooring bollards, gear crates, parasol tables (#3B9C9C, #C9A227) |

## What changed in the build
- New builders: `tools/arena-props/kit-street.js`, `kit-goods.js`, `kit-vehicles.js`; the per-hood table is `tools/arena-props/hoods.js`. All under the 300-line preference.
- `gen-arena-props.js` now also **writes `js/strings-signs.js`** from the label texts, so sign words live in one place (change the text in the builder config, then re-run). Sign words total 8.
- `arena-props-data.js` is about 290 KB (82 images). It decodes at start; no per-frame cost beyond the cached draw.

## Needs your eye (Turkish owner check)
Four new names, from the brief: **Vapur Pastanesi**, **Karabiber Kemal**, **Bilet Gişesi**, **Börekçi Nazmiye**. Earlier four: Dede Kestaneci, Nazlı Kuyumcu, Kahveci Sadık, Simit.

## Notes
- Kit pieces the brief names that no hood's kit places (luggage cart, ice-cream cart, dye drums, tea-garden tables, pier bollards in Eminönü, kilims, lanterns, laundry lines) are still not done; they need a kit change, which shifts level generation and balance.
- The Aksaray dolmuş and taxi overlap in the screenshot only because the still tool spaces its rows 3.4 m apart; in the game the sim spaces blocks.
- `check-ids`, `check-hood-keys`, `check-objective-strings`, `check-death-causes` and `test-meta` (122) pass; the game page loads with no errors. No automated tests cover props.

---

# T3, part 4: authored ground for the other 17 hoods

Correction first: in the last status I told you the 17 hoods still needed props. That was wrong; their props were already done (part 3). What was missing was their **ground**. That is this slice. All 20 hoods now have authored ground and walk tiles, so ground and props are consistent everywhere.

Screenshots (`reviews/media/R1/arenas/`): `ground-sheet-1.png` (Galata, Karaköy, Köprü, Eminönü, Sirkeci), `ground-sheet-2.png` (Beyazıt, Kumkapı, Laleli, Aksaray, Yenikapı), `ground-sheet-3.png` (Samatya, Yedikule, Kazlıçeşme, Zeytinburnu), `ground-sheet-4.png` (Bakırköy, Sahil, Marina). Each column is one hood, stage 1, no blocks, so you see the floor only. Live runs with enemies on the ground: `ground-live-kazlicesme.png`, `ground-live-marina.png`, `ground-live-aksaray.png`.

| Hood | Ground | Walk strip |
|---|---|---|
| Galata | stone stair treads with a cool riser band under each | setts |
| Karaköy | quay asphalt | large quay slabs |
| Köprü | iron-bolted deck planks, rail-brown | lighter planks |
| Eminönü | worn cobble | slabs |
| Sirkeci | station floor tile, ink joints | pale platform tile |
| Beyazıt | square setts | slabs |
| Kumkapı | cobble, lifted so it stays mid value | slabs |
| Laleli | asphalt with faint carton-brown stains | tile |
| Aksaray | asphalt with dashed lane paint | slabs |
| Yenikapı | gritty site asphalt with timber-brown stains | slabs |
| Samatya | warm cobble | slabs |
| Yedikule | rough cobble with moss specks | grass |
| Zeytinburnu | cracked concrete with faint dye teal and magenta stains | slabs |
| Kazlıçeşme | lawn with soft blotches and tufts | promenade tile |
| Bakırköy | school-yard tile with cream joints | tile |
| Sahil | asphalt with a green cycle strip and pale edge lines | promenade tile |
| Marina | amber timber pontoon planks | planks |

## How it works
- Same mechanism as part 1 (`ArenaArt` plugs into the theme tile cache), so there is **no draw-code change**. Each hood uses the ground kind its theme already names (`istanbul-themes.js`) and the theme's own ground colours, lifted a little, so the hood-to-hood tint order and zone washes are as before.
- The generator is now split: `tools/arena-ground/lib.js` (stone, paving and asphalt builders moved out unchanged), `kinds.js` (planks, grass, colour helpers), `hoods.js` (the table above). `tools/gen-arena-art.js` stays the entry point; run it after editing a hood. All files are under 100 lines.
- The three hoods from part 1 are **byte-identical** after the refactor (checked by hash of the generated SVGs).
- Sim untouched.

## Honest read
- **Ground now varies by hood**: planks, cobble, lawn, lane paint and tile each read differently at a glance, and the neighbours are easy to tell apart (Eminönü cobble, then Sirkeci tile, then Beyazıt setts).
- **Readability was checked live, and it caught one problem.** Olive zombies on the first Kazlıçeşme lawn almost vanished. I darkened and cooled the lawn toward the brief's lawn green `#3F6B3A` and softened the blotches; the live shot after that is the one in the folder. Marina and Aksaray read well.
- **Still not "could only be Istanbul".** Ground plus props is better, but the overhead layer (string lights, awnings, the Galata Tower in the distance) is still the old procedural art. I expect that check to pass or fail on that layer, not on the floor.
- **Size:** `arena-art-data.js` grew from 91 KB to 628 KB (34 more tiles, plus the floor details below). It decodes at start like the props do. I trimmed stone counts to get here; if load time on a real phone is a problem I can decode per hood instead of all at once.

## Needs your eye
- Look at the four sheets and say which hoods feel wrong. The ones I would check first: Sirkeci (a regular tile grid, a bit like graph paper), Bakırköy (same), Samatya (cool blue-grey at its dawn tint).
- Same Turkish name check as part 3 (eight sign words); still open.

## Deviations
1. Aksaray's lane dashes and Sahil's cycle strip repeat every 4 m, not every 2 m like the baked tiles; the street reads less like a grating.
2. Laleli and Yenikapı use asphalt, as in `istanbul-themes.js`, not the tile the briefs mention. The code wins until you say otherwise.
3. The asphalt repair patches in the new hoods are one faint patch per tile; Ataköy keeps its two stronger ones (untouched, by choice).
4. No automated tests cover ground art; `check-ids`, `check-hood-keys`, `check-objective-strings`, `check-death-causes` and `test-meta` (122) pass, and every hood rendered with no console errors in the still tool.

## Floor details (second pass, after "do we have unique ground for each hood?")
The honest answer to that question was "partly": the 17 tiles were distinct files, but six hoods shared cobble and six shared asphalt, so they differed mostly in tint. This pass gives the weakest hoods one landmark each. Shots: the four `ground-sheet-*.png` are re-rendered; live: `ground-live-yenikapi.png`.

| Hood | Floor detail |
|---|---|
| Karaköy | two coral painted quay lines (dashed) and harbour puddles |
| Eminönü | wet patches and silver fish scales |
| Sirkeci | yellow dotted tactile guide strip |
| Beyazıt | plane leaves (green and gold) and pigeon feathers |
| Kumkapı | wet stone, melted-ice patches, red and gold lantern reflections |
| Laleli | flattened cardboard scraps and tyre marks |
| Yenikapı | yellow and ink hazard patches and timber offcuts |
| Samatya | a worn lighter path and dawn-pink petals |
| Bakırköy | chalk hopscotch, stars and circles |

- **Repeat problem, caught in the first render.** At the 4 m tile, cartons, hazard patches and hopscotch repeated like wallpaper. Karaköy, Laleli and Yenikapı are now 9.2 x 12 m (the corridor is 9.2 m wide, so nothing repeats across it), and Bakırköy is 12 x 12 m. Bigger tiles are built from the small seamless tile through an SVG pattern, so the data stays small. The stone hoods keep 4 m tiles with small, soft marks, which do not read as a pattern.
- **Nothing in the floor opens.** No manholes, grates or covers, because D-058 retired the "gate in the floor" and I did not want that read back in.
- Marks are low contrast; the live Yenikapı shot shows zombies and the hazard patches still read separately.
- Code: `tools/arena-ground/marks.js` (60 lines). The three part 1 hoods are still byte-identical.

## Not done yet
- Overhead and dressing layer (kilims, lanterns, laundry lines and so on), still behind the kit-change question from part 2.
- Phone check of the ground at real size and frame time.

---

# T3, part 5: authored overhead rigs (first slice)

The overhead layer was the last un-authored part of the arena. This slice covers the rigs that cross the lane: string lights, lanterns, bunting, laundry lines and the bazaar vault, for 13 hoods. It also fixes two rule breaks I found while reading the code (below).

Screenshots (`reviews/media/R1/arenas/`): `overhead-sheet-1.png` (İstiklal stage 2, Galata, Karaköy, Eminönü, Beyazıt), `overhead-sheet-2.png` (Kumkapı, Laleli, Samatya, Kazlıçeşme, Bakırköy), `overhead-sheet-3.png` (Marina, Ataköy, Kapalıçarşı). Each frame shows two rigs of the hood.

| Hood | Rig |
|---|---|
| İstiklal (stages 2 to 5) | warm bulbs on a wire |
| Karaköy | paper lanterns, coral and cream |
| Eminönü | amber and sumac-red bulbs |
| Beyazıt | bulbs with a plane-leaf garland |
| Kazlıçeşme | warm festoon bulbs with leaves |
| Bakırköy | school-green, cream and yellow bunting |
| Marina | teal, white and brass nautical bunting |
| Kumkapı | red and gold paper lanterns |
| Kapalıçarşı | stone vault with a blue underside, four kilims and five brass lanterns |
| Galata | laundry line: blue and green tees and towels |
| Laleli | laundry line: carton-brown and grey work clothes |
| Samatya | laundry line: blanket red and dawn pink |
| Ataköy | laundry line: white sheets and pastels |

Laundry has three arrangements per hood so neighbouring lines differ. The kilims and the brass lanterns are the first things in the arena that could only be a Kapalıçarşı.

## Two rule breaks fixed
1. **Overhangs now fade to 30% under the player and under telegraphs** (design-system 6, rule 5, "non-negotiable"). They did not fade before: laundry sat at a fixed 70% over the hero. The fade eases in about 0.15 s and works per rig. Test frame: Karaköy with the hero under a lantern string, lanterns at about 30%. The lamp rigs are unchanged (see below).
2. **Shop signs flickered at about 6 times a second**, over the "no more than 3 flashes a second" rule (design-system 11, WCAG 2.3.1). It is now about once a second, and Reduce flashes switches it off. The lamp flicker (`o.flick`) also exceeded 3 per second but no caller sets it, so nothing changed there.

## How it works
- `tools/gen-arena-overhead.js` builds the SVGs from `tools/arena-overhead/{rigs,hoods}.js` and writes `art/arenas/overhead/*.svg` and `js/view/arena-overhead-data.js` (171 KB). Re-run it after editing a rig.
- `js/view/arena-overhead.js` draws them. `genOverhead` in `istanbul.js` tries the authored rig first and falls back to the procedural one while an image decodes or when a hood has none.
- **Glows are drawn at runtime**, not baked: the bulbs and lanterns light up with a slow twinkle (about 0.5 per second; steady with Reduce motion).
- Sim untouched.

## Not done in this slice
- **Lamp rigs** (Köprü, Sirkeci, Aksaray, Sahil): the lamp posts sit at 6.4 m, off the 5 m half-frame, so only their glow shows. They need a rethink, not just art.
- **No rig at all** in Yenikapı, Yedikule and Zeytinburnu (briefs want the Marmaray ceiling and escalators, ivy, sawtooth roofs).
- **Distant landmarks** (Galata Tower, Süleymaniye and the rest) are still not in the arena; there is no distant layer, and landmarks sit at fixed world metres. This is the biggest gap for "could only be Istanbul" and needs your call on a parallax layer.
- Facades start at 6.2 m, outside the frame, so they cannot show.
- Level 1's scripted overhead (İstiklal stage 1) is unchanged.
- Frame time could not be measured: headless Chrome freezes `performance.now`. The cost is one image draw per rig plus about 16 small glow draws, but I have not measured it on a phone.

## Needs your eye
- Do the lanterns, bunting and laundry read as the right Istanbul? Kapalıçarşı and Karaköy look strongest to me; the laundry clothes are small and pale in Laleli and Samatya.
- **Ataköy's ground (part 1) now looks like wallpaper**: its repair patches repeat every 4 m, the problem I fixed in the new hoods. It was not part of this slice and I left it byte-identical; say if you want it redone.

## Deviations
1. `tools/arena-still.html` gets `&settle=1` (14 frames 80 ms apart) so eased effects reach their end state in a still.
2. The sign flicker change alters existing behaviour (rule fix, not a design change).
3. Checks: `check-ids`, `check-hood-keys`, `check-objective-strings`, `check-death-causes` and `test-meta` (122) pass; the game page loads with no console errors. There are no automated tests for overhead art.

---

# T3, part 6: Ataköy redone, and the skyline layer (first slice)

Both follow from your answers to the part 5 questions: Ataköy is "a modern neighbourhood with trees", and yes to a parallax skyline.

## Ataköy, redone
Screenshot: `reviews/media/R1/arenas/sky-sheet-1.png` (last column). The old ground (cracked asphalt with repair patches) is gone, so the part 1 "byte-identical" note no longer holds for Ataköy; İstiklal and Kapalıçarşı are still identical.
- **Ground:** clean 2 m concrete courtyard slabs (brief: "courtyard tile and concrete paths"), with soft dappled tree shade and fallen leaves (green, olive, gold), on a 12 x 12 m tile so nothing repeats like wallpaper.
- **Walk strip:** warm stucco-beige interlocking pavers in brick bond.
- **Trees:** a new `canopy` overhead rig. Street-tree canopies reach in over the lane edge from alternating sides every 18 m, and fade to 30% under the player like the other overhead art (design-system 6 rule 5).
- The laundry lines stay (the brief wants them).

## Skyline: side-edge peeks (your choice)
Screenshots: `sky-shapes.png` (the 11 silhouettes), `sky-sheet-1.png` (Galata, Eminönü, Yedikule, Marina, Ataköy in play).
- **What it is:** distant landmarks drawn as roof-level elevations at the left and right edges of the street. They scroll at 0.55 of the street's speed, so they read as far away. They fade out toward the lane and stay at about 1.7 m from each edge, so the lane centre is never covered.
- **Draw order:** under actors, telegraphs and overhead art, above the sidewalk strip. Combat readability is untouched.
- **Shapes (11):** Galata Tower, mosque with two minarets (background only, never damaged), minaret pair, station clock tower, Beyazıt fire tower, city-wall tower, factory chimney with sawtooth roof, excavation crane, yacht masts, apartment block, street tree.
- **Per hood:** Galata and İstiklal get the Galata Tower; Eminönü, Köprü and Karaköy mixes of domes, minarets and the tower; Sirkeci the clock tower; Beyazıt the fire tower; Yedikule and Samatya wall towers; Zeytinburnu and Kazlıçeşme chimneys; Yenikapı the dig crane; Marina masts; Bakırköy, Aksaray, Sahil and Ataköy apartment blocks and trees. Kapalıçarşı (indoors) has none.
- **Code:** `tools/gen-arena-sky.js`, `tools/arena-sky/{shapes,hoods}.js`, runtime `js/view/arena-sky.js` (54 lines), data `js/view/arena-sky-data.js` (37 KB). Hooked into the ground pass in `render-world.js`. Sim untouched.

## Honest read
- **At 10 m wide a landmark is a slice, not a postcard.** Each peek shows a strip about 1.7 m wide, so you see the tower's side and, as it scrolls, its cap, but never the whole building at once. It adds depth and a sense of place; it will not by itself make a frame "could only be Istanbul". The sheet shows this.
- The left-hand peeks are the same art flipped, so their light comes from the top right (a mild inconsistency at haze strength).

## Needs your eye
- Do the peeks read as far away, and are they too strong or too faint? The knobs are `K` (0.55), `ALPHA` (0.92) and `EDGE` (4.4 m) at the top of `arena-sky.js`.
- Which hoods feel wrong for their landmark? The table is `tools/arena-sky/hoods.js`.

## Not done
- No time-of-day haze tint (the skyline takes the global tint only).
- No landmark for Kapalıçarşı (indoors), and no sea or water horizon.
- Phone check of the strip width at real size, and frame time (headless Chrome cannot measure it).

## Deviations
1. `tools/arena-still.html` now waits for the overhead and skyline images too.
2. Checks: `check-ids`, `check-hood-keys`, `check-objective-strings`, `check-death-causes` and `test-meta` (122) pass; the game page loads with no console errors.

---

# T3 wrap-up: acceptance and sign-off

Parts 1 to 6 are done and pushed. This section is the one to read for the T3 decision.

## Acceptance criteria
| AC (execution-plan R1 T3) | Status | Evidence |
|---|---|---|
| 20 briefs in `docs/hood-visual-briefs.md` | Done | The file (473 lines), one brief per hood |
| Before and after screenshots for three hoods | Done, re-shot in the final state | `reviews/media/R1/arenas/t3-before-three-hoods.png` and `t3-after-three-hoods.png`: İstiklal (L2), Kapalıçarşı (L31), Ataköy (L96), live runs with enemies. "Before" turns off every authored layer (ground, props, overhead, skyline) with the still tool's `noart`, `noprops`, `noover` and `nosky` flags |
| Owner check: "could only be Istanbul" | **Waiting for you** | See my read below |
| Rest of the hoods after owner review | Done ahead of review (all 20) | Parts 3 to 6 |

## What is authored now, for all 20 hoods
Ground and walk tiles (parts 1, 4, 6), street props with sign words (parts 2 and 3), floor details (part 4), overhead rigs for 13 hoods (parts 5 and 6), and a parallax skyline of 11 silhouettes (part 6). Sim untouched throughout; all five repo checks and `test-meta` (122) pass.

## My read of "could only be Istanbul" (honest, strongest to weakest)
1. **Kapalıçarşı: yes.** Flagstone cobbles, a stone vault with kilims and brass lanterns, a jeweller counter, tea cart and a Kahveci Sadık sign. Nothing else looks like it.
2. **İstiklal: partly.** Setts, string lights, simit and chestnut carts, a minaret peek. But stage 2 opens on a pale plaza with a bare shopfront; the tram rails and the Tünel are not in that frame.
3. **Ataköy: reads as a modern Turkish estate, not specifically Istanbul.** Beige blocks with balconies, laundry lines, street trees, a parked car. That matches the brief (it is a residential estate), but a Turkish owner is the right judge of whether it says Bakırköy.
Across the other 17 hoods the weakest are the ones that share a surface type and rely on small marks (Karaköy, Laleli, Yenikapı). The skyline peeks add depth but are only a strip at 10 m width.

## Open items (all small or need your call)
- **Your Turkish check, eight sign names:** Simit, Dede Kestaneci, Nazlı Kuyumcu, Kahveci Sadık, Vapur Pastanesi, Karabiber Kemal, Bilet Gişesi, Börekçi Nazmiye.
- **Lamp rigs** (Köprü, Sirkeci, Aksaray, Sahil) and **no overhead rig** (Yenikapı, Yedikule, Zeytinburnu): the lamp posts sit off-frame; they need a rethink, not just art.
- **Brief props the kit does not place** (kilims on arches, laundry, luggage and ice-cream carts, dye drums): a kit change would shift level generation and balance, so I held off. Kilims and laundry now exist as overhead art.
- **Phone check** of ground, overhead and skyline at real size, and frame time on the Low reference device: not measured (headless Chrome freezes `performance.now`).
- Data size: art data totals about 1.2 MB (ground 680 KB, props 284 KB, overhead 187 KB, sky 37 KB). It decodes at start; per-hood decoding is an option if a phone struggles.

## Questions for the lead
1. Approve T3 as it stands, or name the hoods you want redone (the sheets are the evidence).
2. Is "kit change for the brief props" worth the balance risk, or do overhead and floor dressing carry it?
3. Skyline: keep the edge peeks at this strength, or add the faint top-edge band you passed on?

---

# T4 part 1: animation and feel (in progress)

Scope check first: the v0.9 animation pass (feel.js, vehicles.js, fire animation) was already committed in the triage, so T4 starts from the owner list: hit-stop and shake tuning, spawn and death, dash and pickup, boss telegraphs, UI motion, bark timing, reduce motion, flash safety.

## Done in this slice
| Item | Change |
|---|---|
| Hit-stop | Was two limiters (feel.js 14 and 34 ms, weapons-fx 35 ms) and a rule-breaking 14 ms stop on plain crits. Now one limiter, `P.Feel.hitStop(kind)`, at design-system.md section 7 values: **heavy 40 ms, boss 60 ms, crit kill 60 ms, max one per 0.25 s, never for swarm hits.** Two unused config keys removed. Off under Reduce motion (main.js, unchanged). |
| Reduce motion | The in-game switch now also stops CSS animation and transitions (class `reduce-motion` on `#phone`), as the OS setting already did. Before, the switch only affected canvas effects. |
| Flash safety | Carts, canisters and enemies now obey Reduce flashing (they ignored it). Carts and canisters get the same rule as enemies: one white flash per object, at most 3 in any second (`P.Sprites.propFlashOk`). Muzzle stars and impact sparks are about 12 px, far below the area that matters for the 3-per-second rule, so I left them. |
| Pickup | XP and other drops pop out on a small arc with a ground shadow while they hold; a drop flying to Arda drags a short colour streak; a small ring pings at Arda per pickup (one per 0.09 s). |
| Death | Kills release two ash wisps that rise and thin out (design-system.md section 7 dissolve). The weapon-specific fall poses already existed. |
| Boss telegraph | A ring closes on the boss's feet while an attack winds up, and a bar mark shows at full charge. Steady (no pulse), so it adds no flashing, and the shape works without colour. Ground telegraphs by attack already existed and already use per-attack colour. |

## Deviations
- **XP ease-in is not exact.** DS says the droplets arc in with a 0.25 s ease-in. The magnet speed is simulation (linear, 8 m/s plus hero speed), and changing it moves balance, so I did not touch it. The streak and ring carry the feel. If you want true ease-in, it is a sim change with a bot re-run.
- Bark timing: no change. `P.Barks` already runs the 10 to 18 s cadence and yields to the legacy director bark. Nothing to fix.

## Checks
- New `tools/test-feel.js`: hit-stop values, 0.25 s gap, at most 4 per second, Reduce motion path, unused keys gone. Passes.
- Existing: test-ceiling, test-dialogue, test-enemy-behaviors, test-env, test-horde, test-meta (122), check-ids, check-hood-keys, check-objective-strings, check-death-causes pass. The long `test-arsenal.js` was not run (over 10 min; this slice changes no sim code).
- Game page, level 1, real-time headless run with synthetic pickup, kill, boss-hit and boss-windup states: no exceptions; boss hit sets a 60 ms stop.

## Decided not to build, and what is left
- **Spawn markers for ordinary horde spawns: not built.** Ordinary spawns happen off-screen, and design-system.md section 6 puts enemies below telegraphs in the visual hierarchy; a marker per spawn is clutter with no spec behind it. What exists stays: the window, balcony and tram entrances, the 0.15 s scale-in, and the surge cue at the side edge for a real horde surge. Say so if you want edge arrows anyway.
- **Dash polish: nothing to add.** Dash already has speed lines, an afterimage ghost, camera kick, footfall dust and sound.
- **Before and after clips: not made.** A headless software-render capture is too slow to show 0.2 s effects (my filmstrip of the pickup arc caught only static frames), so I did not commit it. Judge the effects in real play on the phone.
- **Low-device frame-time numbers: still owed** (needs your phone; see the frame-time notes above).

---

# T4 part 2: UI motion

Scope: screens, HUD, cards, results, currency, toasts, button presses, the meta screens, the comic CSS and the call card, and the Settings text size. The T4 part 4 items (toast and panel exits, call card entrance and exit, comic page turns, the death beat zoom) are in this section too. The canvas effect files, `sprites.js`, `feel.js`, arena art and the sim are untouched; `main.js` only calls the zoom-origin helper before the dying class.

## Audit gaps (before)
| Gap | Where |
|---|---|
| Screens cut out at once (no exit) | `screens.js` `S.show` |
| Card deal-in step was 70 ms | `screens.js` `buildCard` |
| 17 looping animations at 0.25 to 1.8 s (card glow 1.2 s, ultimate and dash pulses, comic ringing 0.25 s) | `proto.css`, `meta.css`, `comic.css`, `objectives-hud.js` |
| Press states moved (translate), no 0.96 scale | `proto.css`, `meta.css` |
| HP damage trail 0.3 s with a 0.35 s delay (DS 0.4 s) | `proto.css` |
| No results count-up | `screens.js` rewards |
| Map travel and reveal tweens still ran under Reduce motion | `meta-map.js` |
| Gull wing beat about 1.4 Hz | `meta-map.js` |
| Chest taps ignored for about 2 s | `screens.js` chest |
| Two `@keyframes meta-pop` (level-up one set opacity 0 on the coin chip and gear slot) | `meta.css` |

## Built
- **Tokens, one set:** `css/motion.css` (new, loaded first). CSS reads them as `var(--m-*)`; JS reads the same names through `P.UIMotion.ms()` in `js/view/ui-motion.js` (new), so no duration lives in two places.

| Token | Value | Used for |
|---|---|---|
| `--m-press` | 100 ms | buttons, cards, toggles, icon buttons (scale 0.96) |
| `--m-fill` | 150 ms | meter and bar fills |
| `--m-enter` | 220 ms, ease-out | screens, sheets, panels, toasts, cards |
| `--m-exit` | 180 ms, ease-in | screen exit |
| `--m-select` | 250 ms | card select beat (pick applies after it) |
| `--m-pop` | 250 ms, overshoot | currency and Street Cred pops |
| `--m-beat` | 400 ms | stars, chest, shakes |
| `--m-slow` | 600 ms | map travel, hood reveal |
| `--m-trail` | 400 ms | HP damage trail |
| `--m-count` | 700 ms | results count-up (a tap finishes it) |
| `--m-stagger` | 40 ms | card deal-in step |
| `--m-rm` | 100 ms | Reduce motion fade, opacity only |
| `--m-loop` | 2000 ms | every loop (0.5 Hz at most) |

- **Reduce motion:** `css/motion.css` holds the rules for both switches (the OS query and `#phone.reduce-motion`). Under either, nothing moves or loops, and the only motion left is an opacity fade of 100 ms or less. The per-file reduce blocks were removed.
- **Screens:** `P.UIMotion.screen()` fades a screen out for `--m-exit` with pointer events off, so taps reach what is under it at once. Reduce hides it at once.
- **Cards and results:** deal-in stagger in 40 ms steps; `P.UIMotion.countUp()` runs the results count-up, and any tap finishes it. The pick waits for the select beat.
- **Meta:** kick timers read the tokens; map tweens are instant under Reduce; the Street Cred pop runs on change.
- **Exits (T4 part 4):** the HUD toast and the meta toast fade out over `--m-exit` (`css/motion.css` `.is-out`, `P.UIMotion.leave`) and take no taps while leaving. Meta panels (tree, Karakter, arsenal, gear, hub) use `P.UIMotion.panelShow` / `panelHide` / `panelOpen`: a panel fades and rises out for 180 ms before it hides, and a show during that exit cancels it. Under Reduce motion they hide at once.
- **Call card (T4 part 4):** the card drops 16 px into place while it fades in over `--m-enter` (`comic.js` `callCard`), and leaves upward and fades over `--m-exit` as its 0.6 s hold closes (`leaveCall`). It moves with CSS `translate`, so the ring shake keeps `transform`. No entrance or exit class under Reduce motion.
- **Comic page turns (T4 part 4):** the next page slides in from the right over `--m-enter` while the old one slides out to the left (`comic.js` `turnGrid`, `turnUpdate`). Two slides a second at most (`TURN_GAP` 0.5 s); a change inside that gap, or under Reduce motion, is instant.
- **Death beat zoom (T4 part 4):** on top of the existing desaturate, the world eases in 5% on the hero over `--m-beat` (0.4 s), around the hero's screen point. `js/view/death-beat.js` writes the origin only; it never touches time or the sim, and `main.js` calls it before the dying class. Under either Reduce switch there is no zoom.
- **Text size (DS 4):** a Settings row offers 100, 125 and 150%, saved with the other settings. `P.applySettings` sets `--ui-text` on `#phone`, and every UI font size in `css/` and in the two injected CSS strings is `calc(Npx * var(--ui-text, 1))`. Canvas art and canvas lettering (comic bubbles and pops) do not scale. Overlays scroll and centre with auto margins, the Settings list no longer shrinks, and the meta tab row scrolls sideways.
- **Tap targets (48 dp, DS 5 and 11):** the cold-open skip, mod options, hub tabs, meta tabs, meta icon and stat buttons, reroll buttons and toggles are now 48 px tall (they were 36 to 46 px).
- **Files changed:** `css/motion.css` (new), `css/proto.css`, `css/meta.css`, `css/comic.css`, `css/hood.css`, `js/view/ui-motion.js` (new), `js/view/death-beat.js` (new), `js/view/ui.js`, `js/view/settings.js`, `js/view/screens.js`, `js/view/comic.js`, `js/view/objectives-hud.js` (injected CSS), `js/view/finale-credits.js` (injected CSS), `js/meta/meta-map.js`, `meta-ui.js`, `meta-gear.js`, `meta-tree.js`, `meta-hub.js`, `meta-stats.js`, `meta-arsenal.js`, `js/strings-ui2.js`, `js/main.js` (one call), `index.html` (script and CSS order), `tools/test-ui-motion.js`.

## Decisions for the owner
- The card pick now applies after the 250 ms select beat.
- Chest: a tap during the opening beat jumps to the reveal; the next tap continues as before.
- Comic ringing shake is now a 2 s sway (was 0.25 s).
- Gull wing beat is 0.5 Hz (was about 1.4 Hz).
- Pops keep an overshoot curve; plain enters do not.
- **Text size label.** The TR label "Yazı boyutu" is written natively and marked `// TR owner check` in `strings-ui2.js`. Confirm the wording.
- **Text size scope.** Canvas lettering and comic pops stay at their size; the setting covers the UI. Confirm that is the intent.
- **Death freeze.** The 0.8 s freeze is unchanged (it was there before this pass). The zoom runs inside it. Say if you want the freeze at 0.4 s.
- **Meta tab labels** are 10 px (pre-existing). DS 4 sets a 12 pt caption minimum, so they are below it. Not changed here.

## Not built
- Exits for the meta root (`meta-ui.js`) and the level-up sheet (`meta-stats.js`): both still hide at once. The brief covered the meta panels, not these two. The test pins them as the only direct hides, so a new one fails.
- Canvas lettering and comic pops do not scale with the text size (canvas, out of scope for DS 4 as briefed).
- Street Tree node names break mid-word at 150% ("SHOCKWAVE"). Cosmetic; not fixed.
- At 150% the Settings heading scrolls away with the list; the rows scroll, the header does not stay pinned.
- Death beat freeze length and slow-motion: untouched (T4 part 1 and the sim own them).

## Checks
- `tools/test-ui-motion.js` (470 checks, passes): every CSS duration is a token or a listed literal; every keyframe is covered by the reduce override (`ui-fade` is the only one allowed); every loop is 2 s or slower; no loop runs on the screen, phone, game or page nodes; token names used in JS exist. The reduce-motion check now flags only a media query or a `#phone.reduce-motion` selector (the death zoom's `:not(.reduce-motion)` gate is an ordinary rule, not an override). New in this pass: the exits, the call card entrance and exit, page turns (TURN_GAP 0.5 s, instant under Reduce motion), the death beat (view only, wired before the dying class), the 48 px tap targets, every UI font size reading `--ui-text`, the Settings row, the saved text size, the TR and EN keys with the owner comment, and the exit helpers run in a vm sandbox with a fake clock. The checks from the earlier pass were mutation-checked on a scratch copy outside the repo; the new ones were not.
- Existing: `test-a11y-canvas.js` (72 view files), `test-feel.js`, `test-meta.js` (122), `test-dialogue.js`, `check-ids.js` pass. `node --check` is clean on the changed JS, and no changed file is over 600 lines (the largest is `screens.js` at 576).
- Headless (served over local http, level 1 and the meta screens): no page exceptions. Console shows only 404s for `favicon.ico` and the `audio/music/*.mp3` files (pre-existing; `audio/music` holds only a README). Checked: screen exit, card stagger (0, 40, 80 ms), results count-up (natural finish, tap finish, instant under Reduce), the Reduce switch, the five meta tabs, chest tap-skip, HP trail (0.4 s) and toast-in (0.22 s), all read from computed style.
- Live at 150% text size (headless browser, served over local http; the phone at 390 by 844): title, HUD, Settings (the list scrolls), meta map tabs (scroll sideways), character, tree, arsenal, hub (tabs 48 px), tasks, down (its top is no longer cut), results, the level-up cards (text wraps, reroll buttons 48 px), pause (buttons 52 px, no clipping), and the attribute panel (+ and − buttons 48 by 48 px). Fixes made on the way: card descriptions were clipped (now wrap), reroll buttons and toggles were 46 and 44 px (now 48), the Settings list shrank and cut rows (now scrolls), the meta tab row clipped "MEMORIES" (now scrolls), the down screen's top was cut (overlays scroll), and the stat buttons were 40 px (now 48).

## Could not verify
- Timing and smoothness on a device, frame time, and the real flash rate on screen.
- Touch `:active` states on iOS and Android.
- Count, fade, zoom and page-turn timings were read from computed style and sampled, not watched. The full 0.4 s death zoom and a dropped call's exit were not sampled to the end.
- 150% was checked in the headless browser only, not on a phone. 125% was not checked live (the same rules apply).
- The cold-open skip and the mod options (48 px) are checked in CSS only; they were not clicked live.

---

# T4 part 3: accessibility checklist

Canvas accessibility pass against DS §11 (flashing, text size, touch targets) and DS §7 (reduce motion). The full effect table, the allowlist rationale and the phone checklist are in `reviews/A11Y-CHECKLIST-R1.md`.

## Changes (no sim or gameplay change)
- **Flash budget:** at most 3 flash starts a second, screen-wide. Hero, enemy, prop, blast, burst and edge flashes and the low-HP heartbeat share it (`js/view/sprites.js`, `js/view/fx.js`). Crowd hits beyond 3/s get the squash and damage number only.
- **Heartbeat:** one smooth pulse per beat (1.2/s). It was more than 3 peaks a second.
- **Rates cut:** bolts from 30 and 12/s to 3/s; comic static from 20/s to 3/s; stormshield from 10/s to 3/s; blackout tear from 14/s to 3/s; overhang fade at most one flip per 0.34 s; fuse marker capped at 3 Hz.
- **Quantised:** sine flicker terms in the held-weapon, torch, flame, star and lamp code step at 3 a second, so they flash at most 1.5 times a second.
- **Reduce flashing:** steady fallbacks for the alarm, neon, weapon ring, flame jet, bolts, comic static, fuse marker, blackout tear and overhang.
- **Reduce motion:** camera kick is zeroed under the setting and otherwise scaled by the shake setting; grinder vibration, weather drift, bin and crate sway, comic zoom and boss spin are calmed.

## Checks
- New `tools/test-a11y-canvas.js`: 71 view files, 14 candidates, 4 allowlisted entries with rationale (`tools/a11y-canvas-allowlist.json`), 19 wiring checks. Passes.
- `test-feel.js`, `test-ceiling.js`, `test-enemy-behaviors.js`, `check-ids.js` pass. `node --check` clean on changed files.

## Open for the owner
- The area heuristic (about 150 by 150 px on a phone) is a team rule, not a WCAG number. The pickup ring (about 11/s) and muzzle and impact sparks depend on it.
- DS §7 says every hit flashes white. That conflicts with §11 above 3 hits a second; the budget now gives squash only beyond 3/s.
- Tap target: DS §5 and §11 say 48 dp; the brief said 44 pt. This pass uses 48 dp.
- Text size is built (T4 part 2: Settings, 100, 125 and 150%). The owner should confirm the TR label and that canvas lettering stays at its size.
- `js/view/screens.js` shakes about 9.5 times a second on the chest reveal. It is Reduce motion guarded and belongs to the UI pass.

## Could not verify
- The real flash rate on screen; that needs a 60 fps capture on a device.
- Colour-blind check by shape. Text size on a phone (150% was checked in the headless browser only; see T4 part 2).

---

# T4 part 6: animation flavor

Owner playtest: "in-game animations still feel flat, no flavor, no animation." The audit found the motion was there but too small for a phone (screen 39 px/m; hero about 48 px tall, walker about 50 px). This slice turns the amplitudes up and adds a few shapes. View only: the sim reads none of the keys changed here (checked: `feel.hitFlash`, `feel.scaffoldTrauma`, `view.heroClampX`, `view.widthM`, `view.holdWidthM`, `view.offscreenMargin` are untouched). No timing the sim owns changed; the windup duration is the sim's and stays identical.

## Before and after (every amplitude changed)

| Item | Key or code | Before | After |
|---|---|---|---|
| Walk body bob | `view.anim.bobWalk` (config.js) | 0.05 units (about 2.5 px on a walker) | 0.09 units (about 4.5 px) |
| Walk squash | `view.anim.squashWalk` | 0.04 | 0.08 |
| Walk step width | `view.anim.stepWidth` | 0.02 | 0.05 |
| Idle breath bob | `view.anim.bobIdle` | 0.012 | 0.035 |
| Idle breath squash | `view.anim.squashIdle` (new; was hard-coded 0.008 in sprites.js) | 0.008 | 0.03 |
| Walker arms | `art-rig.js` new arm mode `zswing`; walker, bloater, hardhat | static reach, 1.12 to 1.3 rad, +/-0.07 | forward reach, 1.0 rad +/-0.45 (opposite phase per arm) |
| Walker lean toward hero | `feel2.walk.lean` (new), `art-enemies4.js` | none | 0.07 rad at full lean, only while walking (not cars or scooters) |
| Walk phase per enemy | `feel2.walk.phaseStep` (new), `sprites.js` | all walkers in step | + 2.4 rad per enemy id |
| Crawler legs | `art-enemies.js` `crawlerDraw` | +/-0.03 units | +/-0.10 |
| Crawler arms | same | +/-0.05 (hand +/-0.03) | +/-0.12 (hand +/-0.07) |
| Crawler torso | same | none | +/-0.02 heave |
| Windup lean | `enemies3.feel.windupLean` (config-enemies3.js) | 0.08 rad | 0.20 rad |
| Windup squash | `enemies3.feel.windupSquash` | 8% height | 20% height, 10% wider |
| Windup back-hop | `enemies3.feel.windupBack`, `windupHop` (new) | none | 0.12 m back, 0.05 m up, at full windup |
| Ordinary spawn scale-in | `enemies3.feel.scaleIn` | 0.15 s | 0.30 s, plus 5 dust puffs rising from the ground (new `feel2.walk.spawnPuff*`) |
| Death | `art-enemies5.js` `collapseOf`, `applyPose` | one lying pose, fallen from age 0 | 0.45 s collapse: hit-back squash (0.08 s), knees buckle and fall (ease-in, to 0.30 s), settle with landing squash and bounce; contact shadow shrinks 1.0 to 0.7; weapon pose extras kept on top |
| Hero start stretch | `feel2.hero.startStretch` | 0.07 | 0.12 |
| Hero stop and hit squash | `feel2.hero.stopSquash` | 0.08 | 0.14 |
| Hero heavy hit | `feel2.hero.heavyMul` (new), `feel.js` | light and heavy hits the same | heavy (10% max HP or more) squashes 1.8 times as far and kicks 1.5 times as far |
| Hero idle fidget | `feel2.hero.fidget` (new), `feel.js` | none | every 6 to 10 s, 0.6 s: stretch 5% tall and a neck roll of 0.04 rad; only when still; off under Reduce motion |
| XP gem hover | `feel2.pickup.bob` (new), `render.js` | 0.06 m at 4 rad/s | 0.08 m at 3 rad/s |
| XP gem glint | `feel2.pickup.glint` (new), `render.js` `glint()` | none | 4-point sparkle, 0.13 m, turns 0.9 rad/s, swells on a 0.5 Hz smooth beat (alpha 0.3 to 0.8; never on/off) |
| Damage number pop | `render.js`, `view.feel.dmgPop` and `dmgPopT` (new) | 1.2 to 1.0 over the first 15% of life (about 0.1 s) | 1.5 to 1.0 over the first 0.15 s |
| Camera punch | `feel.punchZoom` (config.js) | 3% | 6%, now scaled by the shake setting (0 gives none); Reduce motion still zero |
| Hit shake (player hit trauma) | `feel.traumaPlayerHit` | 0.2 (about 0.5 px at the 0.2 trauma-squared setting) | 0.45 (up to about 2.4 px) |
| Weapon swing arc | `fx.js` `SWING_T`, `render.js` `drawFx` | 0.16 s; fills 0.16, 0.30, 0.44; stroke 4 px | 0.20 s; fills 0.24, 0.44, 0.64; stroke 5 px |

Flash budget: nothing new flashes. The glint, the pop and the swing fades are smooth. The walk, breath and fidget are geometry only. `tools/test-a11y-canvas.js` passes unchanged.

Hero walk and breath use the same `view.anim` keys as walkers, so the hero's walk bob and squash grow with the crowd's. That is intended by the request; check it on the phone.

## Visual checks (headless, 4x zoom, `reviews/media/R1/animation/`)

Filmstrips were rendered in headless Chrome from the real view scripts, with `performance.now` frozen. They show shape and timing, not motion at speed, so judge the feel on a phone.

- `t4-walk-before.png` and `t4-walk-after.png`: 8 phases of one walk cycle. The after frames show the arm swing and the lean.
- `t4-crowd-after.png`: 8 walkers at the same walk distance with different ids. Each lands on a different phase.
- `t4-windup-before.png` and `t4-windup-after.png`: 0 to 100% windup. The after frames lean back, squash and step back.
- `t4-death-before.png` and `t4-death-after.png`: the 8 collapse phases, then the settled pose for blunt, fire, electric, blade and explosion. The variants read as before.
- `t4-idle-before.png` and `t4-idle-after.png`: one breath cycle of the hero.
- `t4-fidget-after.png`: the 0.6 s fidget beat. Subtle by design (5% and 0.04 rad at phone size).
- `t4-gem-after.png`: the glint turning and swelling over 2 s.
- `t4-pop-after.png`: the damage number from 0 to 300 ms.

## Cost

`/tmp/filmstrip/cost.js` runs the real sprite code under Node with a counting stub canvas (200 enemies, steady state, 60 frames). Before: 6.9 ms per frame, 4890 canvas calls per frame. After: 6.7 ms per frame, 4890 calls per frame. No new per-frame allocation in the hot loops; the glint, the puff and the collapse shadow are per gem, per spawn or per corpse. Bake keys: walkers add one arm mode (`zswing`) to the recipe key; pose keys stay at 8 walk and 4 breath frames.

## Tests

- `tools/test-anim-flavor.js` (new): the collapse timeline (upright at 0, at rest at 0.45 s, shadow only shrinks), the fidget and the hit squash off under Reduce motion and on otherwise, the heavy-hit multiplier, the zswing arms move through the cycle, the glint pulse at most 1 Hz.
- The required list passes: check-ids, test-feel, test-a11y-canvas, test-ceiling, test-enemy-behaviors, test-env, test-horde, test-ui-motion.
- Old numbers pinned by tests: none of the changed keys were pinned by an existing test, so nothing was updated.

## Not done, and open for the owner

- Ambient street life (steam from vents and kebab spits, drifting paper, pigeons that flutter off near the hero or a zombie) was not built. It did not fit the one-hour slot next to the rest of this pass. It is the next slice if you want it.
- The walker arm swing is forward-biased (1.0 rad centre, +/-0.45) rather than the hanging `swing` mode. I kept the zombie reach and added the swing. Say if you want the hanging version.
- The hero's hit squash has no direction (the sim's `heroHit` event carries none), so there is no hit-side tilt.
- The damage pop was already at birth in the old code (it was 1.2 to 1.0 over the first 15% of life, not an end-of-life swell as I first read it). Only its size and duration changed.
- `render.js` now exports `drawDrops` (as `R.drawDrops`) so the harness can draw the gem; nothing in the game calls it.
- Not checked on a device. Frame time on a phone is still owed (see T4 part 1).

---

# T4 part 5: progression feedback

The playtest line was "I never felt level progression; it feels very flat and static." This part adds the readouts the audit asked for. View and UI only: no sim, balance or config number changed (another agent is retuning XP and difficulty). Sources: `docs/retention.md` sections 3 and 4, `docs/design-system.md` sections 4, 5, 7, 11, 13.

## What shows now
- **Your power** (`P.UIProgress.powerHtml`, `hoodNode`, `results`): damage +x% and HP +y% from hood rank, gear, attributes and the Kaan bond aura, plus the Street Tree perk count. On the level sheet, the hood card and the results. The numbers come from `P.Progress.power()`, which reads `P.Meta.loadout()`, the object the sim is created with. `tools/test-progress-ui.js` checks the sim's `baseMight` and `maxHp` against it.
- **Street Cred**: a HUD chip "SK n" with a bar to the next milestone (the aria label says kills to the next). The results recap has a row "+n · sonraki için k öldürme" that counts up with `P.UIMotion.countUp`.
- **Partial walk**: the km bar, the map card and the results walk show `kmShown` (the saved km plus the share of the next district walked, levels cleared / 5). The saved `km` is unchanged; it is still the km of the last cleared district.
- **Terms**: HUD "Lv N"; level-up banner "LEVEL UP · Lv N" (TR "SEVİYE ATLA · Lv N"); results headline "LEVEL 12 · İSTİKLAL" (TR "BÖLÜM 12 · İSTİKLAL"); the recap says "Reached Lv N" for the in-run level; a hood is a district ("BÖLGE"), never a chapter; the stage chip reads "2/5".
- **Feel**: a 1.2 s level-up banner with the new Lv and a one-line recap of the picked card. It is queued at the pick and shown in play once no overlay is up; it takes no taps. The XP bar has ticks at 25, 50 and 75% and one pop per level-up (a single pulse over `--m-pop`; none under Reduce motion). The results recap shows Lv reached, kills, best streak, Street Cred earned, power gained and the next unlock. The next unlock also shows on the map card, the level sheet and the hood card.

## Files
- New: `js/meta/meta-progress.js` (pure readouts), `js/strings-progress-ui.js` (TR and EN; every TR line carries `// TR owner check`), `js/view/ui-progress.js` (the views), `css/progress.css`, `tools/test-progress-ui.js`.
- Edited: `js/meta/meta-data.js` (`gearItems`, `kmShown`; saved km unchanged), `js/view/ui.js`, `js/view/screens.js`, `js/meta/meta-ui.js`, `js/meta/strings-meta.js`, `index.html`, `css/motion.css` (`--m-banner`, reduce-motion lists), `js/strings.js`, `js/strings-journey.js`, `js/strings-progress.js`, `js/strings-weapons2.js`, `js/strings-weapons3.js` (term fixes), `tools/test-ui-motion.js`.
- Outside the owned list, one hook each: `js/view/hood-card.js` (`bigCard` appends the power and unlock rows) and `js/main.js` (`endRun` passes `kmShown`, `streak` and the meta record; `pickCard` queues the banner).

## Tests
- `node tools/test-progress-ui.js`: 583 checks. Line limits, term collisions, owner-check tags, the ids the views read, script order and hooks; vm checks against the real sim (`P.createSim`), TR and EN strings, next unlock, Street Cred and partial km; no doubled plus sign in the strip.
- `node tools/test-ui-motion.js`: 501 checks, including the banner and pop tokens, the one-pulse rule and the banner in both reduce-motion lists.
- Full loop passes: check-ids, test-meta, test-dialogue, test-feel, test-ui-motion, test-a11y-canvas, test-tree, test-progress-ui.
- Headless: local server on `prototype/`, phone at 390x844 in the browser panel (the phone is scaled to fit it, so layout is checked in CSS pixels). Screenshots at 100% and 150% text of the results, the HUD with the SK meter and XP ticks, the level-up banner, the hood card, the level sheet and the map card. No console errors on load (one existing warning: the deprecated `apple-mobile-web-app-capable` meta tag in `index.html`).

## Found and fixed while checking
- The power strip printed "++8%" (a plus added twice). Fixed; the test checks it.
- The results recap was too tall. At 100% the results screen scrolled 164 px past the 844 px phone; at 150% it scrolled 625 px. The four result actions were below the fold. Now they pin to the bottom of the scrolling screen (`.res-actions`), so "Sonraki Bölüm" stays on screen. Street Cred is a full-width row.
- "Haritaya Dön" was invisible on the dark results screen (ghost style, dark text). It now uses the light ghost style. At 150% its label wraps to two lines; both row buttons keep one height.

## Not done, and open for the owner
- **Results still scroll.** The content is about 1,000 px at 100% and 1,470 px at 150% on an 844 px phone. Fitting it without scrolling means cutting a row. Options: drop the rewards "Öldürme" row (the recap already has kills), or move "Süre" and "Yürüyüş" into the recap. Owner decision.
- **HUD at 150% with a streak chip showing**: the XP bar narrows to about 70 px (about 180 px without the streak). It works but is tight. Option: a shorter SK label, or the streak on the second HUD row.
- **Finale wording** in `js/story/strings-finale.js` still says "BÖLÜM 1 TAMAM" and "Bölüm 2" for chapter wording (six TR uses). That file is not owned here. Owner decision: keep it as story text, or retitle it to match "Bölüm" as the journey level and "Bölge" as the district.
- **Turkish owner check**: the new TR lines (banner, strip, recap, unlock, SK chip) are tagged `// TR owner check` in `js/strings-progress-ui.js`.
- **Not verified**: the level-up cards overlay (its title now reads "LEVEL UP · Lv N") was not screenshotted. Not on a device: frame time and the 1.2 s and pop timings are token values, not observed.
- **Impact is unproven.** This is readability and feel only. Whether it moves onboarding completion, D30 retention or the 5+ activities group needs playtests and telemetry.

## Follow-ups (owner UI pass: audio sliders, results fit, HUD at 150%, Kısım)
- **Results still scroll.** Dropping the kills row (it cost 39 px) is not enough. At 100% the content is 1,001 px on an 844 px phone (157 px over). At 150% it is 1,362 px (518 px over). NEXT LEVEL stays visible and pinned at 150% (y 580 to 624 of a 717 px phone, at scroll top and at scroll bottom). The sticky actions block covers the bottom of the run recap until the screen is scrolled, at both sizes. Owner decision on the next cut: move "Süre" and "Yürüyüş" into the recap, shrink the actions block, or fold the recap.
- **HUD at 150%.** The SK meter moves to HUD row 2 at 150% (`js/view/settings.js`, `textSize >= 150`). The XP bar is 129 px with the streak chip showing. At 100% the SK meter stays in the XP line and the objective title is full. The cost: at 150% the objective title is squeezed to a stub of about 18 px. Owner decision; `js/view/objectives-hud.js` is not owned here. 125% was not measured with the meter in the XP line.
- **Streak chip.** The label cap is 112 px, so "COMBO 12/60" (109 px) is not clipped at 150%. The TR "DURDURULAMAZ!" (124 px) ellipsizes during the 1.3 s chip. Check the copy.
- **Settings sliders.** Music, Sound effects and Voice, 0 to 100 in 10% steps, saved and applied at boot. The old Sound switch migrates to Sound effects and Voice at 0 when it was off. TR labels "Müzik", "Ses efektleri" and "Ses (konuşma)" are tagged `// TR owner check`; "Ses (konuşma)" is new.
- **Finale wording.** Chapter is "Kısım" in TR: `js/story/strings-finale.js` ("KISIM 1 TAMAM", "Kısım 2 ·"), `docs/voice-tr.md` line 163. The `ui.title.proto` line in `js/strings.js` now says "Kısım 1" but is dead (`js/strings-journey.js` overrides it). Journey-level "Bölüm N" and "Bölge" are unchanged. Not owned: the comments in `js/story/finale.js` (line 2) and `js/view/finale-credits.js` (line 1) still say "Bölüm 1 tamam".
- **Tests.** The 8-test loop passes. Current counts: test-progress-ui 585 checks, test-ui-motion 530 checks (the counts in the Tests section above predate this pass).
- **Not device-tested.** Headless only, at 100% and 150%.

---

# T4 part 7: sound

Owner's report: "game sound effects are terrible Godot alerts; we need actual sound effects." Approved route: rebuild the synth. Original synthesized audio only, no samples, no downloads. D-029 holds for SFX (the code makes them). Cue list, tools and caveats: `docs/audio-cue-sheet.md` (v0.5).

## What changed
- 87 cue recipes rebuilt (`js/view/sfx-bank.js`, `sfx-bank2.js`). The tonal beeps and noise-only hiss are replaced with layered modal, glass, plucked and impact sounds. The most-heard cues come first: XP tink, coin, heal, magnet, star, UI, fanfares, chests, melee, booms, glass, shutter, bell, horn, footsteps.
- `hit` added with five kinds (body, blade, blunt, pierce, chain). Today it is only called with the default body kind. `gem` removed (no producer).
- Voices on a glottal engine: groan, snarl, zombieDie, bruteRoar, bossDie, elite, hurt, crowdScream, cat.
- Runtime (`js/view/sfx.js`): voice and rate limits, impact cap, pitch rise on rapid repeats, master limiter, ducking under boss and comic speech, and `P.Sfx.setVolume(bus, v)`.
- Music: eight procedural placeholder tracks under the IDs `music.js` expects (`audio/music/`). `js/view/music.js` gained `duckFor`.
- Tools: `tools/render-sfx.js`, `tools/qa-sfx.js`, `tools/render-music.js`, `tools/lib-sfx.js`, `tools/sfx-preview.html` (rewritten). `audio/sfx/.gitignore` keeps the WAVs out of git. `art/PROVENANCE.csv` lists the synthesized audio.

## Tests
- `node tools/qa-sfx.js` on the DSP render: 348 variants, 87 cues, 0 fails, 6 warnings (similar variants). `--masters` gives the same result.
- `node tools/test-feel.js`, `check-ids.js` and `test-ceiling.js` pass.
- Runtime run against a WebAudio stub: all 87 cues, no errors, rate caps hold.
- Music seams: after a 10 ms fade-out and 2 ms fade-in at each loop end (`loopEdges`), the WAV step within 4 samples of each loop point is 0.008 or less. Before the fix, the boss track stepped 0.18 at its loop point.

## Found while checking
- My own bug: the first loop fade-out was inverted (full gain at the last sample). The WAV seam check caught it; fixed.
- The old cue sheet labelled many cues "planned" that game code already calls. A call-site scan found every cue except `cat` in use. The sheet now follows the call sites.
- The renderer's "edge 2 s" stat measured 50 ms. Corrected to 2 s.

## Not done, and open for the owner
- **Nobody has listened to it.** Every check is numerical. Start with `level`, `levelClear`, `bell`, `ferryHorn`, `bossIntro` and `bossDie` in `tools/sfx-preview.html`.
- Settings sliders are not added (`settings.js` was off limits). Call `P.Sfx.setVolume(bus, v)`.
- Ducking depth: ambience -6 dB and music -9 dB. The brief asked for about 3 dB. Each is one constant (`DUCK_AMB` in `sfx.js`, `DUCK` in `music.js`).
- The boss music's head is 4.7 dB quieter than its tail at the loop point. Compose the end to match, or accept it.
- The music is a placeholder. D-029 assigns music to the owner's Suno workflow; the lead records the decision.
- `cat` has no call site. The hero walk cycle is not wired (`footstep` only plays for the parkour wind-up).
- Ambience layer descriptions were only partly re-checked against code (the street bed only).

---

# T4 part 4: challenge ramp and XP pacing

**Status: shipped in part.** Shipped: the L2+ XP curve, the drop-heal cap, the frenzy speed, and the XP-per-kill slope. Held back for the owner: the horde, difficulty, elite and affix levers, and simit 0.002. The owner's bot bands (L2-5) and the 15 s first level-up cannot all be met at once with the boss on L5; the measurements below show why. Method: `cd prototype && node tools/bot.js --levels=1,...,10 --seeds=8` for the table, and 32 seeds for the L2-5 validation (kiting bot, `--nododge` as a stress run). The 8-seed medians are bimodal and noisy (L3 min HP read 0% at 8 seeds and 45% at 32), so the 32-seed rows are the reference.

## What shipped (every changed key)

| File | Key | Before | After | Scope |
|---|---|---|---|---|
| js/config.js | `xp.base` | 5 | 30 | L2+ generated levels (`xp.mult` 5 and `xp.exp` 1.6 unchanged) |
| js/config.js | `xp.l1` | (none) | `{ base: 5, mult: 5, exp: 1.6 }` | L1 hand-built curve, unchanged |
| js/config.js | `P.xpNeed` | reads `P.CFG.xp` | reads `P.CFG.xp.l1` when `P.xpHand` | HUD follows the run's curve |
| js/config.js | `drops.healCap` | (none) | 70 | HP per run from drops, L2+ (`levels.rampFrom`) |
| js/config.js | `drops.simitChance` | 0.005 | 0.005 | unchanged (see held back) |
| js/config-weapons.js | `frenzy.attackSpeed` | 0.4 | 0.25 | L2+ (cooldown / 1.25, was / 1.4) |
| js/config-weapons.js | `frenzy.attackSpeedL1` | (none) | 0.4 | L1 keeps the old frenzy |
| js/config-levels.js | `levels.rampFrom` | (none) | 2 | first journey level with the cap and the frenzy speed |
| js/config-levels.js | `levels.diff.xpLin` | 0.04 | 0.05 | XP per kill slope, all generated levels |
| js/sim/combat.js | `P.Combat.dropHeal` (new); `updateDrops` | pickups healed directly | every drop heal goes through the cap (L2+) | simit pickups |
| js/sim/skills.js | `P.Skills.cdScale` | frenzy divisor from `attackSpeed` | `attackSpeed` from L2, `attackSpeedL1` on L1 | frenzy |
| js/sim/sim.js | `P.xpHand` | (none) | `idx === 1`, set per run | L1 XP curve |
| tools/bot.js | flags, metrics | — | adds `--nododge`, `--nocap`, the ramp table | observer only; clear, time and deaths identical to HEAD |

Owner levers the brief named, held back at their HEAD values: `horde.on.base` 28, `horde.on.perLevel` 0.6, `horde.hold.perLevel` 0.8, `levels.diff` `hpLin` 0.03, `dmgLin` 0.006, `spawnLin` 0.005, `levels.stages[].elites` (one window on stages 2, 3 and 4, as at HEAD), `levels.hoodExtras` (no istiklal entry), `affix.schedule` (no H01 entry), `drops.simitChance` 0.005. `ctl.cap` 200 unchanged (D-056).

No test file was changed. No test pinned an old number.

## Why the owner's levers were held back (32 seeds)

Reference for the single-lever rows: XP 40/5, simit 0.002, cap 70, frenzy 0.25, HEAD danger (runs H2 and H3): L5 clear 63% and 69%, about 66%. Clear is per level; the danger columns are the median min HP and the share of runs under 30% HP.

| Change on the reference | Level | Clear | Deaths/run | Min HP med | Under 30% | Verdict |
|---|---|---|---|---|---|---|
| Horde on 30 + 1.5/lvl, hold 1.5 | L2 / L3 / L5 | 91 / 100 / 44% | 0.78 / 0.53 / 1.41 | 0% / 0% / 0% | 84 / 72 / 91% | L5 cut about 22 points; L3 min HP to 0 |
| Difficulty hp 0.05, dmg 0.02, spawn 0.02 | L2 / L3 / L4 / L5 | 100 / 100 / 97 / 31% | 0.56 / 0.41 / 0.25 / 1.66 | 0 / 15 / 24 / 0% | 78 / 66 / 56 / 97% | L5 cut about 35 points |
| Elites 2 per stage at 0.25 / 0.65 | L2 / L3 / L4 / L5 | 100 / 97 / 97 / 53% | 0.44 / 0.31 / 0.38 / 1.31 | 12 / 33 / 15 / 0% | 75 / 47 / 53 / 94% | L5 cut about 13 points |
| Arena adds 14 or 0 (L5 only) | L5 | 63% / 69% | 1.09 / 1.03 | 0% | 91 / 88% | No effect: the L5 deaths are not the adds |

Other reference points (same bot, 32 seeds):

| Setting | L5 clear | Notes |
|---|---|---|
| XP 30/5, simit 0.005, HEAD danger (X30-32, shipped curve) | 81% | L2-4 clear 97-100% |
| XP 35/5, simit 0.005, HEAD danger (X35-32) | 72% | |
| XP 40/5, simit 0.005, HEAD danger (A32) | 59% | L2 94%, L3 100%, L4 94% |
| XP 30/5, simit 0.002, HEAD danger (Q2) | 72% | simit 0.002 costs about 9 points of L5 clear |
| XP 35/5, simit 0.002, horde owner-low (Q1) | 47% | the simit change is part of this gap |
| Full owner package at the shipped XP 30/5 (horde, difficulty, elites, H01 hardhat, simit 0.002, cap 70, frenzy 0.25; no H01 affix, see below) | 69% | L2 97%, L3 100%, L4 100%; deaths 0.38 / 0.38 / 0.53 / 1.13; median min HP 21 / 25 / 0 / 0%; under 30% 66 / 63 / 72 / 91% |

The full owner package at the shipped XP fails the L3-5 bands on min HP, under-30 share, and L4 deaths, and it cuts L5 clear to 69%. The L5 boss is the constraint: clear rate on L5 falls with XP pacing (base 30: 81%; 35: 72%; 40: 59%; HEAD base 5: 100%), and every danger lever cuts it further. Removing the adds does not help. Boss-arena tuning is the likely next lever, and it is outside this config-only pass. The H01 affix part of the owner package was not measured: the affix schedule's H01-only gate (`upto`) was reverted with the other danger edits.

## Before and after (bot, shipped config)

**Table 1. L1-10, 8 seeds each.** Before = HEAD config with the cap disabled (`before-nocap`); after = shipped config, `node tools/bot.js --levels=L --seeds=8`.

| Level | Clear | Deaths/run | Min HP med | Min HP <30% | First lv-up s | Lv-ups med (min-max) | Dmg/min | Simit heal/run |
|---|---|---|---|---|---|---|---|---|
| L1 | 100 → 100 | 0.25 → 0.25 | 57 → 57 | 38 → 38 | 12.4 → 12.4 | 8 (6-8) → 8 (6-8) | 33.5 → 33.5 | 50 → 50 |
| L2 | 100 → 88 | 0.00 → 0.25 | 81 → 40 | 0 → 38 | 5.0 → 10.8 | 11 (9-13) → 9 (2-11) | 14.5 → 33.5 | 28 → 65 |
| L3 | 100 → 100 | 0.13 → 0.63 | 70 → 0 | 13 → 88 | 5.2 → 8.3 | 13 (11-14) → 12 (10-13) | 15.6 → 51.1 | 46 → 55 |
| L4 | 100 → 100 | 0.00 → 0.13 | 85 → 26 | 0 → 63 | 5.4 → 12.6 | 13 (12-14) → 12 (11-13) | 9.3 → 21.2 | 33 → 70 |
| L5 (boss) | 100 → 75 | 0.25 → 0.75 | 49 → 4 | 25 → 88 | 5.2 → 10.5 | 9 (8-9) → 7 (4-8) | 31.1 → 84.2 | 43 → 39 |
| L6 | 100 → 100 | 0.00 → 0.38 | 60 → 29 | 0 → 63 | 5.3 → 11.2 | 10 (8-11) → 8 (6-10) | 29.5 → 56.3 | 50 → 70 |
| L7 | 100 → 100 | 0.00 → 0.13 | 62 → 34 | 25 → 38 | 5.1 → 9.0 | 12 (10-14) → 11 (8-12) | 23.7 → 29.7 | 62 → 70 |
| L8 | 100 → 100 | 0.00 → 0.38 | 66 → 30 | 0 → 63 | 4.7 → 10.2 | 12 (10-13) → 10 (7-11) | 21.4 → 51.9 | 54 → 70 |
| L9 | 100 → 100 | 0.13 → 0.50 | 75 → 37 | 13 → 50 | 5.1 → 7.7 | 19 (16-21) → 19 (16-22) | 17.7 → 24.6 | 75 → 70 |
| L10 (boss) | 88 → 88 | 0.50 → 0.63 | 57 → 15 | 38 → 75 | 4.6 → 10.8 | 10 (8-11) → 8 (6-10) | 45.0 → 56.4 | 41 → 49 |

**Table 2. L2-5, 32 seeds.** Before = HEAD config (`BASE-32`); after = shipped config (`final3-32`).

| Level | Clear | Deaths/run | Min HP med | Under 30% | First lv-up s | Lv-ups med (min-max) | Median clear s | Simit heal/run |
|---|---|---|---|---|---|---|---|---|
| L2 | 100 → 94 | 0.03 → 0.22 | 75 → 35 | 6 → 47 | 5.1 → 10.8 | 10 (9-13) → 8 (2-11) | 165 → 164 | 33 → 70 |
| L3 | 100 → 100 | 0.03 → 0.16 | 76 → 45 | 3 → 34 | 5.1 → 8.0 | 14 (11-15) → 12 (9-15) | 201 → 198 | 33 → 64 |
| L4 | 100 → 100 | 0.00 → 0.16 | 77 → 37 | 6 → 47 | 5.0 → 12.4 | 13 (12-16) → 12 (8-14) | 229 → 237 | 37 → 70 |
| L5 (boss) | 100 → 84 | 0.16 → 0.78 | 57 → 0 | 22 → 91 | 5.2 → 10.6 | 8 (6-9) → 7 (2-9) | 124 → 144 | 42 → 38 |

**Table 3. Late boss levels.** Before = HEAD config, 8 seeds; after = shipped config, 16 seeds.

| Level | Clear | Deaths/run | Lv-ups med (min-max) | First lv-up s |
|---|---|---|---|---|
| L25 | 75 → 69% | 0.75 → 1.06 | 12 (6-13) → 10 (5-12) | 4.3 → 6.0 |
| L50 | 75 → 69% | 0.50 → 0.81 | 16 (12-19) → 15 (10-26) | 3.9 → 5.6 |
| L75 | 100 → 63% | 0.25 → 1.19 | 16 (15-24) → 16 (11-21) | 3.6 → 5.3 |
| L100 | 100 → 69% | 0.50 → 1.06 | 19 (14-24) → 18 (13-21) | 3.6 → 4.7 |

With `xpLin` at 0.04 (before the change to 0.05), L75 was 25% and L100 was 50%. Turning off the 70 HP cap alone restored L75 to 63%, so the cap and the XP slope together caused the late drop. The late levels end at 15-18 median level-ups and at most 26 in one run (L50), so the 25 level-up ceiling is roughly met. Late median in-run level is about Lv 19 at L100, against Lv 20 at HEAD, so "Lv 20+ is rare" is not fully met at L100 (it was not at HEAD either).

## Owner bands vs shipped (L2-5, 32 seeds)

| Measure | Target | L2 | L3 | L4 | L5 | Status |
|---|---|---|---|---|---|---|
| Clear | ≥ 85% (owner); ≥ 95% L1-4, ≈ 90% L5 (§7) | 94% | 100% | 100% | 84% | L2 one point under §7; L5 under §7 |
| Deaths/run | 0.15-0.4 (L3-5) | 0.22 | 0.16 | 0.16 | 0.78 | L5 out |
| Median min HP | 45-65% (L3-5) | 35% | 45% | 37% | 0% | L4-5 out |
| Under 30% HP | 20-35% (L3-5) | 47% | 34% | 47% | 91% | L4-5 out |
| First lv-up | ~15 s | 10.8 | 8.0 | 12.4 | 10.6 | early |
| Lv-ups per level | 6-8 (≤ ~25 longest) | 8 | 12 | 12 | 7 | L3-4 high |
| Clear time vs before | ±15% | -1% | -1% | +4% | +16% | L5 just out |

Stress run, `--nododge` (bot does not react to shots, telegraphs, stomps or zones), 32 seeds on the final config: clear 94 / 100 / 100 / 78% on L2-5; deaths 0.25 / 0.16 / 0.19 / 0.97; median min HP 38 / 47 / 30 / 0%. With dodging (Table 2): clear 94 / 100 / 100 / 84%; deaths 0.22 / 0.16 / 0.16 / 0.78. Dodging matters most on L5 (about 6 points of clear, about 0.2 deaths per run).

## Deviations from the brief

- XP first level-up: 30/5 gives about 11 s on L2 (the target is about 15 s). 40/5 gives 15 s, but L5 clears 63-69% (not shipped).
- Lv-ups on L3-4 are 12 (target 6-8). Not fixed by the curve alone, because the level is longer and has more kills.
- Simit: 0.005 kept. 0.002 cost L5 9 points of clear, and the 70 HP cap does the healing limit instead.
- Horde, difficulty, elites, H01 hardhat, H01 affixes: held back (see table above). Journey §5.0 therefore still says no new types, elites or affixes in H01-H04, and `docs/journey.md` is unchanged.
- Frenzy 0.25 is from L2 only. L1 keeps 0.4 through `frenzy.attackSpeedL1`.
- Drop cap 70 is from L2 only, through `levels.rampFrom`.
- XP slope `levels.diff.xpLin` 0.04 → 0.05 was not on the owner list; it fixed the late boss levels (L75 25% → 63%). It also changes L2-5 slightly.

## Tests

- Owner's list (14 tools): all pass. Extra tools (check-entrances, test-bond, test-perks-combat, test-perks-move, test-perks-world, test-tel, test-arsenal-w): all pass.
- `test-arsenal` (full run takes over two minutes) and `--quick` fail in the working tree with `Cannot read properties of undefined (reading 'reduceFlash')`. The cause is unguarded `P.Settings.reduceFlash` reads in the uncommitted js/view edits from another workstream (comic.js, fx.js, weapons-fx4.js and others). The same `--quick` run passes on a clean HEAD copy (`git archive HEAD prototype`). This change does not touch those files.
- L1 is identical to HEAD on the 8-seed table (clear, deaths, min HP, first lv-up, level-ups, damage, simit heal all unchanged).
- Before the xpLin change, the repo config's 32-seed L2-5 run matched the override candidate `X30-32` exactly, which confirmed the repo config and the overrides were equivalent. Table 2 is the re-run after xpLin 0.04 → 0.05.

## Human playtest checks

1. First in-run level-up on L2 is about 11 s (target 15 s, and the owner's playtest saw 8.6 s). Check that it reads as "too early" or fine.
2. L3-4 give 12 level-ups each, against the 6-8 target. Check whether these runs feel card-heavy.
3. Simit pickup when the 70 HP cap is hit: the pickup still plays and heals nothing. Check that the feedback reads as intended.
4. Frenzy is 0.4 on L1 and 0.25 from L2. Check that the step is not jarring.
5. L5 boss: bot clear 84%, deaths 0.78. Check arena fairness with a human.
6. Late boss levels (L25-100) clear 63-69% for the bot. Check that these feel hard but fair.
7. L9 (H02) gives 19 level-ups over about six minutes. Check the card rhythm.

## Decisions for the owner

A. Held-back levers (horde, difficulty, elites, H01 hardhat and affixes, simit 0.002): approve or reject. Costs are in the table above.
B. First level-up, 30/5 (about 11 s, L5 81%) or 40/5 (about 15 s, L5 63-69%).
C. Owner floor of 85% versus §7 (≥ 95% on L1-4, ≈ 90% on L5). The shipped config is at or near §7 on L1, L3, L4, and under it on L2 (94%) and L5 (84%).
D. Journey §5.0 reversal (elites, affixes and types in H01-H04): not shipped, so `docs/journey.md` is unchanged.
E. Late Lv 20+ at L100 (median Lv 19, max Lv 22): acceptable, or lower `levels.diff.xpLin` again.

## Boss-arena pass

Brief: the kiting bot's boss fight bleeds. Shipped L5 clears 84% (32 seeds), 0.78 deaths per run, median min HP 0%, and 91% of runs dip under 30% HP. Goal for L5 and every boss level L10-L100: clear 85-90%, deaths 0.3-0.7 per run, median min HP 25-50%, and a boss stage near the design length (journey §3.1: 5:00-6:00 with the approach). L1 is unchanged. Boss-side numbers only, in config.

**Result.** Clear rate and deaths moved into band on about half the boss levels. Median min HP and stage length did not reach the band (see "Not met"). L5 now clears 94% (32 seeds) and 89% (96 seeds), with 0.53 and 0.60 deaths per run.

### Where the fight bleeds

- L5 arena damage per run, before (96 seeds): charge 33.9, adds 30.5, stomp 16.6, contact 9.7. The brute's charge hits and stomps were the largest boss-side source, so they were the first numbers changed.
- Kasap (L30, L95): the three-swing combo took 107-133 per run at dmg 16 (sweep before the change), 85-96 per run at dmg 12.
- Spitter (L65, before the change): acid rain and fan puddles (zone ticks 52 per run) plus glob impacts (34). Bloater (L45, before): pool ticks (zone 43 per run) and belly slam (21).
- Arena adds: 18-141 per run across boss levels before the pass, largest at L40-L100. Late adds are mostly roster enemies: copci crate pushes hit for 17.8 at L95. The roster is in `config-enemies4.js` (not owned here), so it was not changed.
- The hero reaches the arena at a median 49% HP on L5. The approach crowd (route horde, stage 5 approach) takes that HP, not the boss. This is why boss-side numbers cannot lift median min HP on their own.

### What changed (every changed key)

| File | Key | Before | After | Reason |
|---|---|---|---|---|
| `js/config-levels.js` | `C.bosses.brute.chargeDmg` | 18 | 12 | largest L5 arena source (charges) |
| `js/config-levels.js` | `C.bosses.brute.stomp.dmg` | 16 | 12 | stomp was 14-17 per run on L5 |
| `js/config-levels.js` | `C.bosses.brute.rageGap` | 0.5 | 0.8 | enrage cadence; brute only (taksici has its own block, no rageGap) |
| `js/config-bosses.js` | `C.bosses.kasapBoss.swing.dmg` | 16 | 12 | swing volume on L30 and L95 (107-133 per run before, 85-96 after) |
| `js/config-levels.js` | `C.bosses.spitter.rain.dps` | 3 | 2 | acid rain zone ticks (L65) |
| `js/config-levels.js` | `C.bosses.spitter.fan.puddleDps` | 3 | 2 | fan puddle ticks (L65) |
| `js/config-levels.js` | `C.bosses.bloater.pools.dps` | 3 | 2 | toxic pool ticks (L45, L20, L80, L90) |
| `js/config-horde.js` | `C.horde.arena.base` | 24 | 12 | ambient arena adds (only in boss arenas; `sim/horde.js` gates on `g.arena`) |
| `js/config-horde.js` | `C.horde.arena.perLevel` | 0.35 | 0.15 | same |
| `js/config-horde.js` | `C.horde.arena.cap` | 60 | 30 | same |
| `js/config-levels.js` | `C.levels.bossHeal` (new) | absent | `{ value: 25, ahead: 3, pop: 0.25, uncapped: true }` | one simit pickup at the arena intro |

Code, not config:

- `js/sim/bosses.js`: `P.Bosses.spawn` calls the new `arenaHeal(s)` after the intro event. It drops one simit pickup `ahead` m in front of the hero (x clamped to the view). It returns early unless `s.gen.arena`, so L1 never gets it, and `value` 0 turns it off.
- `js/sim/combat.js`: `updateDrops` sends drop heals through `P.Combat.dropHeal(s, amount, uncapped)`. This pass added the `uncapped` argument. The capped path is unchanged. The uncapped path is needed because the route spends the run-wide `drops.healCap` before the boss: the trace showed 26 HP at the intro and no heal.
- `tools/bot.js` (tooling only): `--set=key.path=value;...` overrides config for experiments, `--trace=SEED`, the boss table, arena damage by source and per 10 s, and the boss `minHP` columns.

No changes to `js/sim/levels.js`, `js/sim/horde.js`, `js/config-enemies*.js`, `js/config-weapons.js`, journey, or the strings, screens, css and audio files.

### Before and after (bot, 16 seeds per boss level, same code)

"Before" is the same code with the changed keys set back to their shipped values and `levels.bossHeal.value` 0 (`--set`). It reproduces the shipped T4 part 4 numbers on L5 (84%, 0.78) and matches an earlier run of the same setting exactly.

Median min HP is per run (whole run). Median min HP, arena is the boss-stage minimum.

| Level | Boss | Clear (16 seeds) | Deaths/run | Median min HP, run | Runs under 30% HP | Median min HP, arena | Approach / fight / walk s | Median clear s |
|---|---|---|---|---|---|---|---|---|
| L10 | brute | 88% -> 88% | 0.56 -> 0.44 | 6% -> 18% | 81% -> 69% | 6% -> 34% | 55->55 / 69->74 / 17->16 | 153 -> 151 |
| L15 | brute | 69% -> 81% | 0.88 -> 0.81 | 0% -> 0% | 75% -> 81% | 24% -> 21% | 67->67 / 65->61 / 16->16 | 145 -> 144 |
| L20 | bloater | 75% -> 81% | 0.94 -> 0.81 | 0% -> 0% | 81% -> 88% | 0% -> 14% | 64->64 / 42->39 / 20->21 | 126 -> 116 |
| L25 | taksici | 69% -> 75% | 1.06 -> 1.13 | 0% -> 0% | 88% -> 88% | 0% -> 0% | 60->60 / 79->69 / 17->15 | 144 -> 141 |
| L30 | kasapBoss | 69% -> 75% | 1.19 -> 0.81 | 0% -> 0% | 88% -> 75% | 0% -> 2% | 62->62 / 71->79 / 19->17 | 162 -> 150 |
| L35 | taksici | 81% -> 94% | 0.56 -> 0.44 | 31% -> 37% | 50% -> 50% | 35% -> 51% | 69->69 / 61->53 / 13->16 | 138 -> 147 |
| L40 | spitter | 81% -> 100% | 0.94 -> 0.44 | 0% -> 11% | 88% -> 81% | 0% -> 26% | 57->57 / 40->49 / 14->14 | 115 -> 126 |
| L45 | bloater | 50% -> 56% | 1.25 -> 1.13 | 0% -> 0% | 88% -> 94% | 0% -> 0% | 79->79 / 39->40 / 18->16 | 130 -> 132 |
| L50 | tourGuide | 69% -> 88% | 0.81 -> 0.56 | 5% -> 21% | 75% -> 63% | 17% -> 34% | 68->68 / 51->44 / 14->18 | 151 -> 160 |
| L55 | antiquarian | 69% -> 81% | 0.81 -> 0.75 | 7% -> 0% | 69% -> 63% | 7% -> 0% | 65->65 / 67->57 / 14->15 | 154 -> 147 |
| L60 | taksici | 100% -> 88% | 0.38 -> 0.31 | 35% -> 43% | 44% -> 31% | 35% -> 70% | 71->71 / 57->50 / 15->22 | 157 -> 154 |
| L65 | spitter | 38% -> 56% | 1.44 -> 1.19 | 0% -> 0% | 94% -> 75% | 0% -> 0% | 66->66 / 52->68 / 12->12 | 117 -> 132 |
| L70 | brute | 100% -> 100% | 0.19 -> 0.25 | 33% -> 45% | 50% -> 50% | 51% -> 62% | 59->59 / 50->50 / 15->13 | 137 -> 140 |
| L75 | spitter | 63% -> 88% | 1.19 -> 0.75 | 0% -> 0% | 100% -> 81% | 0% -> 0% | 60->60 / 58->49 / 12->13 | 132 -> 134 |
| L80 | bloater | 75% -> 88% | 1.00 -> 0.94 | 0% -> 0% | 81% -> 88% | 0% -> 0% | 63->63 / 52->46 / 18->15 | 130 -> 129 |
| L85 | taksici | 81% -> 81% | 0.69 -> 0.63 | 10% -> 48% | 63% -> 50% | 10% -> 49% | 60->60 / 56->47 / 20->20 | 147 -> 128 |
| L90 | bloater | 88% -> 81% | 0.88 -> 0.63 | 0% -> 7% | 88% -> 81% | 0% -> 15% | 65->65 / 51->43 / 15->14 | 131 -> 126 |
| L95 | kasapBoss | 44% -> 44% | 1.44 -> 1.38 | 0% -> 0% | 88% -> 94% | 0% -> 0% | 63->63 / 94->105 / 14->13 | 138 -> 161 |
| L100 | brute | 69% -> 88% | 1.06 -> 0.69 | 0% -> 0% | 81% -> 69% | 0% -> 17% | 66->66 / 62->51 / 12->15 | 123 -> 126 |

Arena detail (`Killed` = boss killed; `Deaths before / in arena` per run):

| Level | Killed | Deaths before / in arena | Arena min HP <30% | Boss HP at death | Boss dmg/run | Adds dmg/run |
|---|---|---|---|---|---|---|
| L10 | 88% -> 88% | 0.06/0.50 -> 0.06/0.38 | 69% -> 50% | 76% -> 56% | 55.0 -> 43.7 | 24.4 -> 19.2 |
| L15 | 69% -> 81% | 0.38/0.50 -> 0.38/0.44 | 63% -> 69% | 72% -> 44% | 38.7 -> 48.7 | 37.2 -> 39.6 |
| L20 | 75% -> 88% | 0.19/0.75 -> 0.19/0.63 | 75% -> 75% | 31% -> 52% | 80.9 -> 85.2 | 10.9 -> 11.4 |
| L25 | 75% -> 75% | 0.31/0.75 -> 0.31/0.81 | 75% -> 81% | 55% -> 27% | 85.3 -> 75.0 | 50.6 -> 49.9 |
| L30 | 69% -> 75% | 0.13/1.06 -> 0.13/0.69 | 75% -> 63% | 47% -> 64% | 146.5 -> 121.3 | 27.3 -> 25.8 |
| L35 | 81% -> 94% | 0.06/0.50 -> 0.06/0.38 | 44% -> 44% | 82% -> 84% | 60.2 -> 52.5 | 36.8 -> 38.6 |
| L40 | 81% -> 100% | 0.19/0.75 -> 0.19/0.25 | 75% -> 69% | 56% -> 69% | 121.0 -> 88.6 | 15.6 -> 14.8 |
| L45 | 56% -> 75% | 0.25/1.00 -> 0.25/0.88 | 75% -> 81% | 71% -> 80% | 84.5 -> 85.7 | 50.7 -> 43.6 |
| L50 | 69% -> 88% | 0.06/0.75 -> 0.06/0.50 | 69% -> 50% | 48% -> 50% | 123.2 -> 95.7 | 19.2 -> 24.5 |
| L55 | 69% -> 81% | 0.00/0.81 -> 0.00/0.75 | 69% -> 63% | 33% -> 59% | 133.6 -> 139.7 | 36.1 -> 25.6 |
| L60 | 100% -> 94% | 0.00/0.38 -> 0.00/0.31 | 44% -> 31% | 64% -> 61% | 72.5 -> 58.5 | 32.3 -> 33.0 |
| L65 | 44% -> 56% | 0.56/0.88 -> 0.56/0.63 | 81% -> 63% | 52% -> 49% | 93.9 -> 97.0 | 50.0 -> 39.1 |
| L70 | 100% -> 100% | 0.06/0.13 -> 0.06/0.19 | 44% -> 44% | 76% -> 56% | 64.0 -> 59.7 | 20.1 -> 20.7 |
| L75 | 69% -> 88% | 0.13/1.06 -> 0.13/0.63 | 94% -> 69% | 42% -> 42% | 120.8 -> 105.3 | 54.1 -> 43.6 |
| L80 | 88% -> 94% | 0.00/1.00 -> 0.00/0.94 | 81% -> 88% | 58% -> 13% | 142.9 -> 145.8 | 48.8 -> 35.6 |
| L85 | 81% -> 81% | 0.00/0.69 -> 0.00/0.63 | 63% -> 50% | 65% -> 67% | 66.1 -> 61.4 | 92.0 -> 82.8 |
| L90 | 88% -> 88% | 0.13/0.75 -> 0.13/0.50 | 75% -> 75% | 66% -> 50% | 107.0 -> 93.3 | 43.0 -> 41.1 |
| L95 | 44% -> 50% | 0.19/1.25 -> 0.19/1.19 | 88% -> 81% | 63% -> 48% | 158.7 -> 153.3 | 98.0 -> 95.5 |
| L100 | 69% -> 88% | 0.19/0.88 -> 0.19/0.50 | 81% -> 69% | 77% -> 88% | 55.2 -> 44.3 | 91.1 -> 75.5 |

Aggregate over the 19 boss levels: mean clear 72.5% → 80.7% (lowest level 38% → 44%); mean deaths per run 0.91 → 0.74; levels at 85-100% clear 4 → 9; levels with deaths 0.3-0.7 4 → 8; levels with median min HP 25-50% 3 → 4; levels with median min HP 0% 12 → 11.

**L5 (the boss the brief names), shipped vs now:**

| Run | Clear | Deaths/run | No-death runs | Median min HP | Runs under 30% HP | Arena min HP, median | Median clear (s) | Level-ups median |
|---|---|---|---|---|---|---|---|---|
| Before, 32 seeds | 84% | 0.78 | 38% | 0% | 91% | 11% | 144 | 7 (2-9) |
| After, 32 seeds | 94% | 0.53 | 53% | 4% | 72% | 19% | 148 | 6 (4-8) |
| Before, 96 seeds | 76% | 0.83 | 41% | 0% | 84% | 4% | 137 | 7 (2-9) |
| After, 96 seeds | 89% | 0.60 | 51% | 3% | 71% | 30% | 145 | 6 (3-9) |

First level-up is unchanged (10.5-10.6 s). L5 arena damage per run, after (96 seeds): charge 27.0, adds 25.3, stomp 12.6, contact 10.1.

L2-4 at 32 seeds are unchanged by this pass (they have no boss and no arena): 94% / 100% / 100% clear, 0.22 / 0.16 / 0.16 deaths, median min HP 35% / 45% / 37%. L1: `node tools/bot.js --levels=1 --seeds=6` is identical with and without the boss-side overrides and with `levels.bossHeal.value=0`.

### Band check

| Measure | Band | After (boss levels) | Status |
|---|---|---|---|
| Clear rate | 85-90% | 9 of 19 levels in 85-100% (was 4). Below 85: L15 81, L20 81, L25 75, L30 75, L45 56, L55 81, L65 56, L85 81, L90 81, L95 44 | partly met |
| Deaths per run | 0.3-0.7 | 8 of 19 levels (was 4). Above 0.7: L15, L20, L25, L30, L45, L55, L65, L75, L80, L95 | partly met |
| Median min HP | 25-50% | 4 of 19 levels (was 3); 11 levels at 0%; L5 4% (32 seeds) and 3% (96 seeds) | not met |
| Fight length | 5:00-6:00 incl. approach | stage about 2:00-3:00 (approach 55-79 s, fight 39-105 s, walk 12-22 s) | not met |

### Not met, and why

- **Median min HP.** About half of runs contain a death on most boss levels (no-death share 13-75% after the pass). The median run's minimum is therefore 0% on 11 levels. A 25-50% median needs deaths concentrated in fewer runs and less damage in clean runs. The hero also enters the L5 arena at 49% HP, from the approach crowd. The pass lifts the L5 arena minimum from 4% to 30% at 96 seeds, but the run median stays at 0-3%. Decide the metric definition with the owner (median per run, or the arena only) before tuning further.
- **Fight length.** The bot's boss stage is about 2:00-3:00, against the design's 5:00-6:00. Boss HP and attack cadence set the length. I did not raise boss HP, because that trades directly against the clear band; this needs a design call.
- **Late levels (L45, L65, L95).** Clear stays at 44-56%. The remaining bleed there is arena adds (copci crate pushes, roster in `config-enemies4.js`, not owned) and kasap swing volume. Single-key tests did not move these outside the noise (below).

### Tried and not kept

16-seed sweeps have about ±12 points of noise per level, so single-level differences below that are not evidence.

- `levels.bossAddRate` 1.08 → 0.8, all boss levels at 16 seeds: mean clear 81.9% (vs 80.7%), deaths 0.69 (vs 0.74), levels at 85-100% 8 (vs 9). Neutral; not kept. L5 at 96 seeds: 92%.
- `bosses.kasapBoss.summon.n` 3 → 2, 32 seeds: L30 66% (vs 81% base), L95 69% (vs 53% base). Mixed; not kept.
- `bosses.kasapBoss.gap` 0.9 → 1.1, L95 at 16 seeds: 63% (vs 44%). Not confirmed; not kept.
- `bosses.bloater.slam.dmg` 20 → 16, L45 at 16 seeds: 63% (vs 56%). Not kept.
- `bosses.spitter.fan.dmg` 6 → 5, L65 at 16 seeds: 56%, unchanged. Not kept.

### Recommendations (outside this pass)

- A mid-approach heal: a second pickup about 40 m before the arena, through `js/sim/levels.js` (not owned). This targets the 49% arrival HP directly.
- Stage-keyed approach density: the route `horde.on` also applies to the stage-5 approach, so a lower approach density needs a stage key in `config-horde.js`. That is a design change, not a tuning change.
- Arena roster: the copci crate pushes at L95 (`config-enemies4.js`) are the largest add source on late bosses.
- The metric: "median min HP 25-50%" conflicts with "deaths 0.3-0.7" unless deaths concentrate. Agree the definition first.

### Tests

- `cd prototype && for t in check-ids check-hood-keys check-objective-strings check-death-causes check-entrances test-meta test-dialogue test-enemy-behaviors test-env test-ceiling test-feel test-horde test-tree test-ui-motion test-a11y-canvas test-anim-flavor test-progress-ui; do node tools/$t.js || echo FAIL $t; done`: all pass, no FAIL lines.
- `node tools/test-arsenal.js --quick`: PASS (exit 0) in the current tree. The `reduceFlash` failure noted under "Tests" above did not reproduce.
- Not committed or pushed.

# T4 part 9 (phone feedback): UI follow-ups

Owner played on his phone and decided three things. Headless only (390x844, Chromium, the same seeded results data as the part 5 follow-up, 1,001 px at 100%). Not device-tested.

- **Voice slider removed.** Settings has Music and Sound effects. The voice bus (speech blips, zombie groans) now sits inside the sfx bus (`js/view/sfx.js`, one line in `buildGraph`), so the Sound effects slider covers them; `setVolume('voice')` still works as a trim inside it. A saved `voiceVol` is deleted at load and never written back; an old sound-off switch still sets Sound effects to 0. The `ui.set.voice` key is gone from both tables.
  - Loudness: the voice bus base gain (0.95) now multiplies the sfx bus (0.85), so speech blips and groans are about 1.4 dB quieter at 100% than before. `CATS` is unchanged; raise `CATS.voice` to about 1.12 if the old level is wanted.
- **TR strings (owner-approved).** `fin.credits.kicker` "1. Kısım Sonu", `fin.next.text` "2. Kısım · Sarıyer'e Yolculuk.", `hud.skLabel` and `res.recap.scVal` now end in "öldür". The `// TR owner check` tags are gone from every TR line in `strings-progress-ui.js`, `strings-ui2.js` and `strings.js` (kept in the other files and hoods). Stale "Bölüm 1 tamam" comments in `js/story/finale.js` and `js/view/finale-credits.js` now say "1. Kısım Sonu". `tools/test-progress-ui.js` and `tools/test-ui-motion.js` expectations updated.
- **Results fit (100% text).** The Time and Walk rows are one compact line each at the top of the recap; the separate run panel is gone. `#res-run` stays as a hidden anchor because `objectives-hud.js` inserts its panel after it (that file is not in this pass). The head, rewards, recap and objective panel now scroll in `.res-body`; the four actions are a footer under it (no sticky block, so nothing covers a line). Tightened: centre block and stars margins, panel gap 10 px, row padding 4 px, footer button top margin 0. Tap targets stay at the 52 px `.btn` minimum. The count-up and the motion tokens are unchanged.

Measured (`reviews/media/R1/results-fit/`, before and after):

| Case | Before | After |
| --- | --- | --- |
| Base result, 100%, EN and TR | 1,001 px content (157 over) | fits: no scroll, footer at y 630 to 810 |
| Base result, 150%, EN | 1,364 px | body scrolls (907 px in 548 visible); footer pinned at y 607 to 810; no overlap; last row reachable at scroll end |
| Base result, 150%, TR | not measured | body scrolls (942 in 520); footer pinned; no overlap |
| Lost level with objective panel, 100% | 900 px | fits (no DOUBLE button on a loss) |
| **Won level with objective panel, 100%** | 1,221 px | **still scrolls ~215 px (EN) and ~195 px (TR)**; footer pinned |

**Open for the owner.** The objective panel (`objectives-hud.js`, not owned here) adds 204 px (EN) on a won level, because its unlock preview lists up to four rows. With it, the won screen cannot fit 844 px at 100% without losing content. Options: (a) keep the scroll on won levels (current; the action footer stays pinned); (b) show two unlock rows, saves about 60 px, still over; (c) move the objective panel off the results screen. The owner's 1,001 px figure matches the screen without that panel, so it may not have been on the phone run.

- **Tests.** `check-ids`, `test-meta` (122), `test-dialogue`, `test-feel`, `test-tree` (165) and `test-progress-ui` (585) pass. `test-ui-motion` passes its T4 part 9 checks; its one failure is the font-size scan on `js/view/quality.js`, an untracked file from another lane. `test-a11y-canvas` fails on `js/view/istanbul-props2.js:339` (uncommitted work from another lane); neither failure comes from this pass.
- **Not done.** `tools/sfx-preview.html` still has a Voice slider (dev tool, its own page). `design/lofi/16-settings.html` (wireframe) still shows a Voice row, and `docs/audio-cue-sheet.md` lines 15 and 42 say the Settings sliders are not wired. None of these were in the owned list.
- Not committed or pushed.

# T4 part 11: tram and sidewalk legibility

Owner playtest on iPhone: the street tram did not read as a tram and turned opaque for no clear reason; sidewalk objects did not say what they were for. Headless only (390x844 at 2x, `tools/arena-still.html`, hood 0, stage 1). Not device-tested. Not committed or pushed. No sim logic, config numbers, strings or CSS changed.

**Why the tram went opaque.** The translucent band in the owner's screenshot was the idle L1 tram, not the hack telegraph (the baseline still at y=150 reproduces it exactly). `W.drawTram` in `render-world.js` faded it to 0.3 whenever Arda stood beside it, which applied the overhang rule (design-system 6.5 item 5) to a vehicle that is not an overhang. It was also drawn after the hero, so it could cover him. Now the tram is always opaque (alpha 1) and is drawn in the ground layer (`render.js`, after `EventsFx.drawGround`), so actors stand above it. The opacity rules are in the `vehicles.js` header. The hack telegraph lane is the only translucent tram element.

**Tram redraw** (`vehicles.js`). Top-down 3/4 Istanbul nostalgic tram: red body, cream roof stripe (0.3 m), window bays on both sides, bellows, windscreen with glint, headlamp, route plate, brass bell, two bogies with wheels, soft contact shadow. Live parts (pantograph, contact flash, headlamp glow) are drawn per frame; the body is a cached canvas per size (cap 12). The landmark tram (`istanbul-landmarks.js`) uses the same `paintBox`; its drawn size went from 1.8 x 9 m to 3.2 x 13.2 m. Sim rect unchanged.

**Telegraph lane** (`events-fx.js`, `tramLane`). Replaces the flat 0.3 danger rectangle with a translucent fill (0.22), hazard-stripe edges, an outline, chevrons moving at 0.8 m/s over 2.4 m (about 0.33 Hz, under the 0.5 Hz limit; static under Reduce motion), a tram icon at the entry and a countdown ring (remaining `H.rush` over `rushT`). No ghost tram. Timing unchanged: the crush still lands at hack completion and the lane shows for the 0.8 s after it.

**Sidewalk roles** (`istanbul-props.js`, one `ROLE` table read from the code). Solid: bollard, barrier, tree, car, taxi, dolmus, bus, lx_*. Breakable: bin, bench, tables, cart, planter, crates, kiosk, antique, extinguisher. Hazard: gascan, barrel, hazard. Fauna: cat, catbox, dog, pigeon, gull. Plain: gates and arches, smoke, blood, strings, lanterns, laundry, vault, lamp_row, spill, phones. Dressing (a sidewalk slot with no footprint) is 0.9 scale, 0.8 squash, 40% toward its luminance, faint outline. Sim blocks get the shared grammar: thick outline, top highlight, hatched top (solid) or lighter top with a crack (breakable), baked once per size. The role is a view decision; the sim does not read it. Consumables, eczane and hold/link zones are not changed (another lane).

**Redrawn** (`istanbul-props2.js`, `istanbul.js`). Pigeon: side profile, baked sprite, peck stops under Reduce motion (the old top-down pigeons read as penguins). Spill: dark patches (was gold dots). Shoeshine: footrests and brush. Flowers: pots with leaves, not rows of dots that read as pickups. Nazar: no pupils. Carpet, corn, pomegranate and tea moved from `istanbul.js` into the library so they share the grammar. `istanbul.js` is outside the stated ownership list; the change there is minimal (the DRAW table is gone, `l1Street` calls `P.Props.draw`, and the pigeon flock calls `P.Props.bird`).

**Legend** (`prototype/tools/prop-legend.html`, new). Every kind drawn by the game's own painters with its role tag, the sim blocks at their sim size, and the tram. It loads the game scripts, stubs `P.goreRGB` (settings.js owns it) and loads the consumables files for the eczane cell. Labels are inline English; no new strings were needed, so `js/strings-legibility.js` was not created. Loads with no console errors at 390 px.

**Before and after** (`reviews/media/R1/legibility/`, 2x crops of the stills):
- `t4-tram-before-y150.png`, `t4-tram-after-y150.png` (tram beside Arda)
- `t4-tram-before-front-y136.png`, `t4-tram-after-front-y136.png`
- `t4-pigeons-before-y136.png`, `t4-pigeons-after-y136.png` (upper flock)
- `t4-pigeons-before-low-y136.png`, `t4-pigeons-after-low-y136.png` (lower flock)
- `t4-grey-blob-before-y136.png`, `t4-grey-blob-after-y136.png`
- `t4-prop-legend-top-390.png` (legend: tram and sidewalk slots)

No before/after yet for flowers, shoeshine, nazar, tea or the cafe; they are not in these stills.

**Frame budget.** `/tmp/filmstrip/cost.js` (enemy-only, outside the repo; its stub gained a `transform` method so the current `art-rig.js` runs) reports 4510 calls per frame on the working tree against 4890 at HEAD. That scene draws no props or tram, so it does not measure this part. The per-kind counts below come from a stub-canvas harness (`/tmp/filmstrip/cost-props.js`, steady state, average per draw):

| Draw | HEAD | Now |
| --- | --- | --- |
| Tram (`Vehicles.drawCar`) | 143 | 14 |
| Pigeon (4 birds) | 44 | 16 |
| Spill | 42 | 18 |
| Dressing bin / bench / cart | 9 / 22 / 22 | 12 / 25 / 25 (transform and the baked mark) |
| Flowers, nazar, tea, shoeshine | 10 each (placeholder: drawn in `istanbul.js` at HEAD, not comparable) | 82, 61, 41, 25 (not baked yet) |

Caches: sidewalk marks cap 160, tram bodies 12, birds 240. Per bird, the draw path still builds a few small strings (sprite key, fill colour); not measured on a phone.

**Tests.** All eight pass: `check-ids`, `test-feel`, `test-a11y-canvas`, `test-ceiling`, `test-enemy-behaviors`, `test-env`, `test-horde`, `test-meta` (122 checks). `test-a11y-canvas` had a stale allowlist entry for the old pigeon peck; it is removed from `tools/a11y-canvas-allowlist.json` (the peck is now a two-pose switch at about 0.4 Hz, off under Reduce motion). This is the `istanbul-props2.js:339` failure noted under T4 part 9.

**Open.**
1. Pre-hack telegraph preview: the lane shows after the hack. A warning before the crush would change the feel, so it is a design call for the owner.
2. The telegraph lane has not been checked in a live hack state (needs a temporary harness).
3. Pigeons at true phone size and on a device are not checked (the 48 px check is still owed).
4. Flowers, nazar, tea and shoeshine draw 25 to 82 calls each and are not baked. Bake them if the phone heat pass needs it.
5. The grey patch on the cobbles at (550, 995) in the y=136 still is gone after this pass, but I have not traced it to a kind in code, so its cause is unconfirmed.
6. The marti thief's pigeon look (`config-fauna` birdLook) and the ambient bird are not aligned.
7. `restaurant-art.js` window tram left as is.
8. SVG solid blocks are not chamfered.
9. `render.js`, `events-fx.js` and `istanbul-props2.js` were also changed by other lanes during this work. Edits were applied with anchor checks; nothing was reverted.
10. Eczane and consumables art were not touched (another lane).

# T4 part 13: signature moments

Owner: "I loved the ground shaking, glitching animations. Amazing job. If you can think of such creative animation ideas feel free to test things." The ground shake and the blackout glitch are kept as they were. This pass adds eight short, cause-tied moments in the same language (view only). Every bright start takes a slot from the screen flash budget (`P.Fx.flashGo`, at most 3 starts a second). Headless only; not device-tested. Not committed or pushed. No sim, balance or other strings changed.

Files: `js/view/moments.js` (events, state and the world layer), `js/view/moments-screen.js` (the screen layer), `js/strings-moments.js`, `tools/moments-still.html` (harness). Additive hooks: `fx.js` (reset, update, onEvent), `feel.js` (world layer, under the hero), `render.js` (screen layer, last in `RenderOverlay.screen`). Every number is in `P.CFG.moments` (`config-feel.js`).

| Moment | Trigger | Starts a second (max) | Area | Guard |
| --- | --- | --- | --- | --- |
| Dash glitch: ghost pair, then a 0.14 s tear | dash | one per dash (3.5 s cooldown); tear re-rolls 3 steps/s | ghosts hero-sized; tear full width, within 120 px of the hero | Reduce motion and Reduce flashing: off |
| Ground shock: ring and an 8% lens; one kick for slams and stomps | explosion, boss slam, brute stomp | one per 0.34 s; 0.3 s life; two live at most | ring up to 2.4 m | Reduce motion: off (the kick is zeroed in `F.kick`) |
| Kill-streak ladder: ink word and ink wipe at 10, 25 and 50 | kills in the frenzy window (1.5 s) | one per mark (one dark pass, 0.34 s) | wipe 22% of the width from each edge; word up to two thirds of the width | Reduce flashing: steady word, no wipe; Reduce motion: no wipe, no pop |
| Crit halftone burst | crit kill | one per 0.34 s; 2-frame hold, then fades | 11 by 11 dots, up to 1.1 m | Reduce motion and Reduce flashing: off; budget slot |
| Near-miss ripple, red and cyan fringe | near miss (once per dash) | one per near miss; 0.6 s | ring 0.9 to 2.6 m | Reduce motion: off; under Reduce flashing the budget refuses it |
| Heavy-hit starburst (heavy weapons and bosses) | heavy or boss hit | one per 0.34 s; 2-frame hold, gone in 0.12 s | star, about 0.6 m | Reduce motion and Reduce flashing: off; budget slot |
| Level clear: simit and tulip-glass confetti, hood ribbon | win on a journey level (not L1) | 36 pieces once; ribbon spring 2 Hz, decays in about 1 s | pieces about 9 px; ribbon 150 to 200 px | Reduce motion: no pieces; ribbon static |
| Last stand: red rings on nearby enemies, grey veil | HP below 30% | rings swell at 0.5 Hz; one budget slot per 2 s cycle | up to 10 rings within 3.2 m | Reduce flashing: rings held high |

Changes made during the pass (both covered by the tests):

- The last-stand pulse first used a forced start (`flashForce`), which is never refused. A dense mix then took 4 starts in one second, and the new budget test caught it. The pulse now takes an ordinary slot per cycle and holds high on a cycle that gets none.
- The ground-shock ring is limited to one per 0.34 s (`shock.gap`), so a chain of blasts gives at most about 3 zooms a second. The lens is motion, not luminance, but it keeps the same pace as the other moments.

Verified (headless):

- Filmstrips: `reviews/media/R1/animation/t4b-{dash,streak,crit,ripple,clear,low,impact,shock,slam}.png` (2x, downscaled to 1800 px wide).
- Lens pixel diff (`tools/moments-still.html?seq=slam&nolens=1` against the default): 5,000 to 20,000 changed pixels per frame from 0.10 to 0.32 s (1 to 4% of the frame), and none at 0.05 s, which is captured one step before the event. The lens is visible but subtle. The orange ring in the sheet is the existing slam ring, not the lens.

Tests:

- `test-anim-flavor`: all pass. The moments block checks the config keys, the streak marks (10, 25 and 50 only), the frenzy reset (first mark on the 10th kill after it), the window gap, the crit and impact gaps, the dash ghosts and tear clearing within 0.3 s, Reduce flashing and Reduce motion starting nothing bright, level clear on journey levels only, the 0.5 Hz last-stand swell, one ring per shock gap, and that no moments file writes to the sim.
- `test-a11y-canvas`: all pass (83 view files, 14 candidates, 4 allowlisted, 39 wiring checks). Runtime: a dense 4 s mix of crit kills, boss hits, near misses and the last-stand pulse, through the real budget, holds to 3 starts a second, and Reduce flashing starts none. Static: each sin and cos term in the moments files is one of four config rates (all at most 3 Hz), and each Reduce flag is read where its moment starts.
- Required loop: check-ids, test-feel, test-a11y-canvas, test-anim-flavor, test-ceiling, test-enemy-behaviors, test-env, test-horde and test-ui-motion (536 checks) all exit 0.

Not built (candidates):

- Hood-card wipe in the hood colour: the hood card is DOM and CSS, outside the owned files.
- Magnet comet trail: needs a change to `drawDrops` in render.js (not owned).
- Boss intro letterbox slide: enemies-fx already has the bars and the stepped title word.
- Explosion-launch ragdoll: the canister fling already exists (sprites.js, fx.js), so nothing was added.
- Zombie hit starburst: a starburst on every zombie hit would exceed the budget. The starburst is for heavy and boss hits only.

Not verified:

- Device frame time and the real flash rate at 60 fps (headless only).
- Lens visibility on a phone (pixel diff in headless only).
- Crowd starvation: enemy hit flashes take the shared budget first, so in a crowd the crit burst is dropped, and the streak word waits up to 0.5 s before it is dropped. Owner decision: reserve a slot for moments.
- TR words `DEVAM!`, `KIRIM!` and `EFSANE!` (`// TR owner check` in `js/strings-moments.js`). The EN words are `KEEP IT UP!`, `SMASH!` and `LEGEND!`.
- Art taste: the confetti, the ribbon and the starburst colours.
- The scaffold drop shake (level event `scaffold`, `scaffoldTrauma` 0.4) is unchanged. It should be checked against the earthquake guardrail.
- Harness: the crit column in the log reads `crit=-` (a placeholder with no effect on the sheets).

Shared-file touches: `fx.js` (three hooks), `feel.js` (one draw hook), `render.js` (one line), `index.html` and `tools/arena-still.html` (script tags), and `tools/moments-still.html` (harness). Other lanes' edits were applied with anchor checks, and nothing was reverted.

- Not committed or pushed.

# T4 part 12: performance and heat

Owner report: the iPhone (DPR 3, Safari) gets warm after 5 to 10 minutes of play. Goal: cut GPU and CPU work with no visible change at tier 0 and no sim change. Stub and headless only. Device frame time and heat are not measured here; the phone test is in `reviews/PLAYTEST-GUIDE-R1.md` ("Performance and heat (T4 part 12)"). Not committed or pushed.

**What changed, in the order of the brief.**
1. **Profile.** `/tmp/perf/frame-cost.js` runs the real `P.Render.frame` and `P.UI.update` in a node vm with DOM and canvas stubs, a seeded `Math.random`, and a level-5 sim with 200 enemies. Stack mode attributes each canvas call to a category. Stub timings are relative only.
2. **DPR cap and governor.** `view.maxDpr: 2` (`config.js`); `R.dpr = min(devicePixelRatio, cap) * scale`; the world context is opaque (`alpha: false`). New `js/view/quality.js` (view only): an EMA over 2 s of the live frame interval; above 20 ms for 4 s steps down; below 13 ms for 30 s steps up. Tiers 0, 1, 2 = DPR 2, 1.5, 1.25. Tier 1: one in two of gib, blood, spark, ember, shard and dust particles; no shop-window glows. Tier 2: one in three of those particles; no rain or haze; no ground AO pads under props. `?quality=0|1|2` locks a tier; `?fps=1` shows the debug box. The sim never reads any of this (checked by `tools/test-quality.js`).
3. **Static layers cached.** The figure bake cache (`art-rig.js`) is LRU under a byte budget (`view.quality.spriteCacheMB`, 64 MB). It replaces a count-based eviction at 700 entries that re-baked about 6,600 figure layers per frame at DPR 3. Enemy recipes and joint solves are memoised (`sprites.js`). The lamp pool and the edge vignette are cached images (`render-world.js`, `render.js`). Sprite blits use one transform.
4. **Crowd cost.** Actors more than half a screen plus 48 px to the side are skipped (`render.js`). Optional particles are thinned at tiers 1 and 2 (above).
5. **Idle.** The loop runs at most 60 times a second (every second callback on 120 Hz), at 30 when a menu freezes the world (`view.quality.menuFps`), and not at all while the page is hidden (`main.js`). Pause already runs on `visibilitychange`.

**Stub numbers** (`/tmp/perf/seeded/`; level 5, 200 enemies, device DPR 3, 120 frames, seeded; the before tree is HEAD plus the other lanes' edits at the time, with this part's edits reverted, so both sides carry the same other-lane code):

| Metric | Before | After, tier 0 | Tier 1 | Tier 2 |
| --- | --- | --- | --- | --- |
| Backing store | 1170 x 2532 | 780 x 1688 | 585 x 1266 | 488 x 1055 |
| Canvas calls per frame (main context) | 8,353 | 7,918 | 7,907 | 7,898 |
| Bake calls per frame (into sprite canvases) | 6,652 | 2,030 | 962 | 934 |
| Offscreen sprite canvases created per frame | 69 | 19.6 | 9.9 | 9.6 |
| Estimated fill, Mpx per frame | 21.8 | 9.7 | 5.5 | 3.7 |
| Stub render JS / sim JS, same run | 2.6 (median of 3) | 1.65 (median of 3) | 1.70 (1 run) | 1.45 (1 run) |

- **Estimated JS per frame.** Raw stub milliseconds are not reliable on this machine: the same code ranged 13.6 to 26.6 ms on the before side and 13.0 to 16.0 ms on the after side. Normalised to the sim cost in the same run, render JS is about 35% lower. An earlier unseeded run gave 10.1 to 6.3 ms, in the same direction.
- **Per category** (stack mode, 20 frames, estimated Mpx per frame): enemies 9.13 to 4.07; ground 3.52 to 1.57; overlays 5.92 to 2.63; base 2.96 to 1.32; props 1.09 to 0.48; fx 0.98 to 0.44. Canvas calls fell only about 5% overall, because most calls come from vector props, landmarks and fx, which this part does not change.
- **Expected GPU fill.** DPR 3 to 2 cuts backing-store pixels by 55% (4/9 of the pixels remain). The stub's 21.8 to 9.7 Mpx matches. This is an estimate of pixel work, not a GPU time. Device time is what `?fps=1` on the phone confirms.
- **Memory budget trade-off.** At 64 MB the stub misses 19.6 figure layers per frame. Earlier unseeded runs gave about 11 at 96 MB and 10 at 128 MB. Safari kills canvas-heavy tabs when memory runs high, so 64 MB stays the default. The owner can tune `view.quality.spriteCacheMB` after the phone test.

**Tests.**
- `tools/test-quality.js`: all pass (83 checks). Static: the sim never references quality or the DPR cap; `quality.js` has no timers; the bake cache is LRU; the loop pauses when hidden or when a menu is open. Runtime (fake clock): governor steps, locks, DPR caps per tier, a real `render.js` in a vm, and the real `main.js` loop at 60 fps in play, 30 fps when frozen, and 0 when hidden.
- Battery, all pass on the final run: `check-ids`, `test-feel`, `test-a11y-canvas` (83 view files), `test-ceiling`, `test-enemy-behaviors`, `test-env` (117 checks), `test-horde`, `test-quality` (83 checks), `test-anim-flavor`, `test-ui-motion` (536 checks), `test-arsenal --quick`.
- During the work, `test-a11y-canvas` flagged the bird peck in `js/view/istanbul-props2.js` (another lane's uncommitted edit; not this part's files). It passes on the final run.

**Tier-0 look.** `tools/arena-still.html` at 2x, hoods 1, 7 and 18, with `blocks=0`. Before and after differ on the same things as two identical baseline renders: lamp pools (flicker), the moving arcs, the hero and the gulls. The stills are not pixel-exact, because lamps and arcs read `performance.now()`. The heatmaps show no new static difference. The `blocks=1` path of the still throws at HEAD (`b.rc` is undefined in the still's fake sim, `render-world.js` AO pads). It is not fixed here; use `blocks=0`.

**Files.** `js/config.js` (`view.maxDpr`, `view.quality`); `js/view/quality.js` (new); `js/view/render.js` (DPR cap, opaque context, particle thinning, actor cull, vignette cache); `js/view/render-world.js` (pool image; shop-glow, fog and AO gates); `js/view/sprites.js` (pose and recipe memo); `js/view/art-rig.js` (LRU bake cache, blit transform); `js/main.js` (cadence, governor feed, hidden guard, `?fps`/`?quality` wiring); `index.html` (one script tag); `tools/test-quality.js` (new); `reviews/PLAYTEST-GUIDE-R1.md` (Performance and heat). `art-rig.js`, `render-world.js` and `index.html` were not in the brief's owned list. The changes there are caches, gates and one script tag, and the sim is untouched.

**Open.**
1. Device frame time, fps and heat are confirmed only by the 10-minute Level 5 test with `?fps=1` (playtest guide). Expect about 60 fps and `dpr 2.00` on the phone.
2. `js/view/ui.js` `P.UI.update` writes about 14 DOM properties every frame with no change gating. Caching the last values would remove that. Not changed (ui.js is outside this part).
3. `css/proto.css` `.screen.overlay` applies `backdrop-filter: blur(3px) saturate(.7)` over the canvas while a menu is open. A tier class could drop it. Not changed (CSS owner).
4. Audio (`sfx.js`, `music.js`, the ambience bed) is not audited for per-frame node creation or leaks.
5. `motion.css` is not re-audited.
6. `istanbul-props*.js` and `istanbul-landmarks.js` redraw vector props every frame on generated levels. This is the largest remaining level-5 call cost. Caching needs their owners.
7. No sub-pixel snapping or distant-enemy LOD. The view has no perspective scaling, and snapping would change the look.

# T4 part 10: interaction clarity

Owner feedback from the iPhone: consumables are not obvious (the green-cross heal, and which objects can be used up), the "link - hold" hack terminal is unclear, and a first-time player gets no guidance. View only: the sim, balance, settings and `css/` are untouched, and the sim never reads any of this. Not committed or pushed.

**Link - hold (one line, for the owner's copy):** "A hack terminal: stand in its ring to link it in; the rim fills while you stay and decays when you leave." The sim decays progress when the hero is outside the ring (`sim/hack.js`), so the paused look (grey rim, "PAUSED" label) is the decaying state.

**What changed.**
1. **Consumable grammar.** `js/view/consumables.js` (new) draws each pickup class in one overlay pass after the actors (`render.js`), so no enemy hides one. Every class has a glow ring and a bobbing icon, at least 28 px across, with colour and icon shape distinct (table below). A pickup shows a burst, a floating amount, and a cue from the existing `P.Sfx` names. Icons are in `consumables-icons.js`. XP gems keep their green diamond (design system 3.2) and are outside the grammar.
2. **Eczane as a heal station.** `istanbul-props2.js` (`reg('eczane')`) draws a cream cabinet with a green cross, which pulses while usable, and a grey "EMPTY" sign when spent (`P.Consumables.stationSign`). It is **not placed in any level**: the sim has no pharmacy heal (only the ECZANE shop-sign text), so placing it would mislead the player. This needs a sim decision.
3. **Hack zone.** `js/view/consumables-zone.js` (new) replaces the old ring in `events-fx.js` `drawHack`. Four looks: idle (dashed ring), active (blue ring, rim fills, pulse), paused (grey ring, "PAUSED" label), done (completion pop). Off-screen terminals get an edge arrow.
4. **First-time hints.** `hints.js` (core: once ever per store, queue, 4 s gap), `hints-view.js` (DOM callout in `#phone`, tap to skip, never covers the hero's keep-out box, arrow to the anchor), `hints-detect.js` (what is in view), `hints-config.js` (tokens). Timers run on game time, so a pause stops them. Store key `nsi.hints.v1` (localStorage). Reduce motion: no bob, opacity-only fade. Gating: no callout starts while a scripted prompt is on screen (`tut.active`), and the explosive hint waits for the L1 canister step (`C.hintGates`, scoped to level 1). L1 scripted hints are otherwise untouched.
5. **Strings.** `js/strings-hints.js` (new): `hint.*`, `consume.*`, `zone.*`. Every TR line carries `// TR owner check`. Also added `hack.signal` ("Signal box" / "Sinyal kutusu"): the signal-box zone label was showing the raw key `hack.signal` in game, because no string existed (the label comes from the existing `EV.drawAir`). TR owner check.

**Consumable classes.**

| Class | Look (colour, shape) | Sim drop or object | Cue | Floating text |
| --- | --- | --- | --- | --- |
| heal | green `#2EBD6B`, cross | `simit` | `heal` | `+N HP`; `FULL` at full HP; `CAP` when the run's drop-heal budget is spent |
| power | gold `#FFD166`, star | `chest` (mini chest) | `star` | `REWARD` |
| currency | amber `#E9A23B`, coin | `jeton` | `coin` | `+N` |
| objective | blue `#3D8BFF`, pin | objective item (`crate`) | `pick` | burst only |
| XP | green diamond, unchanged | `xp` | unchanged (`tink`) | none |

Shield and tea are button skills and are not changed.

**Files.** `js/view/hints-config.js`, `js/view/hints.js`, `js/view/hints-detect.js`, `js/view/hints-view.js`, `js/view/consumables.js`, `js/view/consumables-icons.js`, `js/view/consumables-zone.js` (all new); `js/strings-hints.js` (new); `tools/test-hints.js` (new, 115 checks). Edited, targeted: `js/view/events-fx.js` (`drawHack`), `js/view/render.js` (three hook lines and the drop skip), `js/main.js` (three lines: consumable events, pickup cue, `P.Hints.update`), `js/view/istanbul-props2.js` (`reg('eczane')`), `index.html` (script tags).

**Tests.**
- `tools/test-hints.js`: 115 checks pass. Covers once-ever, queue spacing (4 s), persistence, tap-to-skip, Reduce motion (bob and pulse), TR/EN strings (2 to 4 words), layout (hero clearance, margins, edge mode, HUD anchors), the L1 gates, no sim writes, the grammar (classes, floaters, minimum size), zone phases and the edge arrow, and the station sign.
- Named list, all pass: `check-ids`, `test-feel`, `test-a11y-canvas` (83 view files, 39 wiring checks), `test-ceiling`, `test-enemy-behaviors`, `test-env`, `test-hints`.
- Headless stills (Chrome, 1x, a harness outside the repo that places props relative to the hero): the consumable classes, both eczane states, the four hack-zone looks, the signal-box label, and a hint callout (`Green cross: heals you`). Checked by reading the PNGs and 3x crops.

**Found, not fixed (outside this part's files, or a sim decision).**
1. **Boss-arena simit can read CAP.** The boss pickup is uncapped (`combat.js` `dropHeal(..., d.uncapped)`), but the `pickup` event (`combat.js` line 366) carries only `kind` and `value`. When the run's heal budget is spent and HP is below max, the floater says `CAP` while the heal still restores HP. Fix: add `uncapped` to the event (sim owner).
2. **Grit bonus not in the number.** `dropHeal` adds `simitBonus`, but the floater shows the base `ev.value`, so with the grit perk the amount reads low.
3. **Story overlay covers hints.** On L2 the Arda portrait and starburst draw over the DOM callout (the overlay stacks above it), so its start and arrow can be hidden for 2 s. The layout does not know about story overlays. Needs a UI-owner call (hold hints during story beats, or move the portrait).
4. **Eczane not in game.** See item 2 of the changes. Decision for the sim owner.
5. **Colour overlap.** Heal (green cross) and XP (green diamond) share a hue; shape separates them. Flagged for the art pass.
6. **Consumables draw after the hero** (an overlay pass, not design-system 6.1 depth order). Needs the owner's OK.

**Could not verify.** Device frame time and flash rate on the iPhone; hint placement on a real iPhone (headless 1x only); hint timing in wall-clock play (the 2 s and 4 s spacing is checked by `test-hints` with a fake clock); the TR wording (owner check); Reduce motion and Reduce flashing visually (checked by code path only).

Design only. No gameplay code changed. Doc: `docs/skill-tree.md`. Decision: **D-059, PROPOSED** (`docs/product.md` section 17). Wireframe: `design/lofi/11-skills.html` (the retired Survival Skills screen, repurposed).

## Summary
- **Street Tree:** six branches (one per attribute), four one-rank perks each at attribute rank 1, 2, 4, 6, costing 1 to 4 Street Cred. **Rank is the lock, Street Cred is the key.**
- **No new currency** (four stay), Survival Skills stay retired (D-044), no revive perk, no paid respec.
- Perks are utility and sidegrades, each number at most half an attribute rank, so the bot bands in game-design section 7 should not move.
- **Bond meters** are a separate play-earned layer (no currency, never sold). Slice scope: Kaan only, from L20.
- Money can only buy Street Cred, and perks sit behind practice-earned ranks, so paying cannot skip the tree.

## Findings you should know about
- **Street Cred supply is lower than the docs say.** The code curve (`450 x n^1.35`) gives about 32 SC at 50k lifetime kills; attributes.md targets about 100. The full Ch1 tree costs 60 SC, so a player fills about half. The 50k figure assumes about 500 kills per clear and needs a bot measurement.
- **Seven doc and code conflicts** are listed in `skill-tree.md` section 2.1 (Skill Credits still sold, 50 Altın respec vs no paid respec, Kaan at L30 vs L20, GRIT numbers, mastery 0-10 vs 0-5, and more). I did not edit those docs.
- **Bug found and fixed (not T5):** `W.drawProps` in `render-world.js` still read `lv.manhole` after D-058 retired it, so Level 1's prop pass threw every frame and the hero, bubbles and barks were not drawn. Removed the manhole draw; Level 1 now renders with no errors (headless run, state `play`, no page errors).

## Deviations
None to numbers. One design change is proposed (D-059) and waits for you.

## Questions for the lead
Q1 to Q7 in `docs/skill-tree.md` section 9. The two that block implementation: **Q1** (does Street Cred buy perks only, or also attribute points as today) and **Q3** (six branches of four, or the old three branches with ranks 1-3).

## Proposed next steps
After approval: config-tree.js and save migration, perk effects folded into `P.Power.expectedLoadout`, bot run on L1-30, then the screen.

---

# R1-T0: housekeeping (comic layout and bark check)

Evidence: `reviews/media/R1/T0/` (390x844, EN and TR).

| Item | Result |
|---|---|
| Name tag over the bubble above | Fixed (`comic-layout.js`, `comic-text.js`) on H07i3, H10i2, H19i2 |
| Kaan tail crossing the Arda bubble (H10i2, H19i2) | Fixed, EN and TR |
| Finale SFX cut at the bottom (FINb) | Fixed, "TAK TAK!" fully inside the panel, EN and TR |
| Bark `BK.self#2` (TR, 98 chars) | Fits the bubble at 390x844; EN also fits |
| Bark under the level-up overlay | Fixed: bubble is dropped when an overlay is up (`barks.js`), verified in both languages |
| `H14i3a` (TR) | **Owner wording applied:** "Her attığı adımda anahtarlar şıngırdıyor. Bekçinin gizlilik sıfır." ("Kapı görevlisinin" clipped 1 px, "Bekçinin" fits). Audit clean |
| `H11i3a` (TR) | **Owner wording applied:** "Dolmuşun kapısı açık, içi karanlık. Şöför \"atla koçum, yer var\" diye beni çağırıyor." Audit clean (spelling "Şöför" kept as written) |
| `FINb9` (TR) | **Owner wording applied:** "Sırada Sarıyer var. Mila da bizimle." (one line). The FINb TR overlap is gone (audit overlap 0) |

## Not fixed
- **FINb TR (resolved):** the overlap was caused by a two-line `FINb9`; the owner's one-line wording clears it. Remaining on that panel: Arda's shout tail runs under Mila's balloon (cross 1, pre-existing).
- **Pre-existing:** FINa TR (Arda's tail under Anne's balloon), `l1_outro #2`, TR `kaan_join #2`, EN `hood_kapalicarsi #2`.
- **Dialogue PR blocked:** `gh auth status` fails ("token in keyring is invalid"). Run `gh auth refresh -h gecgithub01.walmart.com`, then the PR for `dialogue/two-native-scripts` can open.

## Checks
`test-dialogue` (550 beats, TR 1169, EN 1172, same digest as baseline), `check-ids`, `check-hood-keys`, `check-objective-strings`, `check-entrances`, `check-death-causes` pass. Comic audit (TR, after the owner's three lines): fail 1 (`kaan_join #2`, pre-existing), overlap 0, cross 3 (all pre-existing). No dedicated comic layout test exists.

---

# T4 part 15: flash reserve and hint z-order

Two owner fixes, view only. No sim, balance or strings changed. Not committed or pushed. The flash rules and the owner decisions are in `reviews/A11Y-CHECKLIST-R1.md` (budget section, moment rows, owner decisions i to k).

**1. Flash reserve: two pools, still 3 starts in any 1 s window.** Hits (hero hit, edge pulse, enemy and prop flashes, blast and burst discs, the low-HP heartbeat) take at most 2 starts a window. The signature moments take one start a second as a reserve and may also take any free slot. A hit may not take the last slot while a moment is in the window or was asked and refused in the last second. So, apart from the forced heartbeat (below), a refused moment always has a moment start in the second before it, and a crowd cannot starve the moments for more than about a second. The window stays exact (a start leaves it 1 s after it). Reduce flashing still starts nothing in either pool.
- `js/view/sprites.js`: `S.flashOk(now, kind)` and `S.flashStarts(now, kind)`; `kind` is `'hit'` (default) or `'moment'`.
- `js/view/fx.js`: `flashGo(kind)`, default `'hit'`, so every existing caller is unchanged.
- `js/view/moments.js` and `js/view/moments-screen.js`: `go()` asks the `'moment'` pool. No other call sites changed.
- Known residual: `flashForce` (the heartbeat, called from `render.js`, not in this pass) is forced and counts as a hit. When two beats, a hit and a moment fall in one window, it reaches 4 starts. Fix proposed in the checklist (owner j).

**2. Hint callout z-order, and the story layer.** On L2 the Arda pop (z 50) and call card (z 55) drew over the hint (z 40), hiding its start and arrow for about 2 s. The arrow had no z-index at all.
- Callout and arrow are now z 56: above the pop and call card, below the screen overlays (58), the comic page (60) and the card pick (70). `js/view/hints-view.js`.
- A callout that would cover the pop or the call card (its box or its arrow, bob included) waits in game time, at most 6 s (`PORTRAIT_WAIT_S`, `js/view/hints.js`), then shows anyway. Other callouts may start meanwhile. The layer is read only while `P.Comic.active()`, because a pop element stays in the DOM, empty, after its beat.
- Owner decision (k): after the wait the callout can cover part of the balloon text.

**Headless check (L2).** Headless Chrome over CDP (a script in `/tmp/flash-reserve-diag`, outside the repo; the Playwright MCP browser would not launch). Local server on `prototype/`, `P.debug.playLevel(2)`, a simit drop placed in the pop band, and a long pop line. At 2 s and 4.5 s the simit callout is queued and not shown. At 7.2 s it shows at the 6 s limit: z 56 over the pop at 50, the start and arrow visible. Read: `/tmp/flash-reserve-diag/l2-hint-over-pop-after-wait.png`.

**Tests.**
- `tools/test-a11y-canvas.js`: budget basics now expect 2 hit starts, a moment taking the third slot, and a hit refused while a moment is in the window. Hits alone get 2 a window. Heartbeat forced starts count as hits. Crowd of 25 gets 2. New crowd-flood block (4 s; six enemies, a prop, a hero hit and a blast every 1/120 s, against crit kills, heavy hits and near misses): no window above 3 starts or above 2 hits, every refused moment answered within the second before, the flood saturated (3838 hit refusals, 62 moment refusals), Reduce flashing grants nothing. 42 wiring checks (3 new).
- `tools/test-anim-flavor.js`: the moments sandbox counted moment grants as hits (its `flashGo` wrapper dropped the kind), now fixed at the budget. New flood block with the dash tear as a moment ask: same totals, moments at least 4 starts in 4 s, all refused asks answered, crit, starburst and ripple all start, Reduce flashing grants nothing.
- `tools/test-hints.js`: 15 new checks (section 13). Stacking is parsed from `css/comic.css` and `css/proto.css`, and the arrow carries the z-index. Pure clash check (box, arrow, pop). Layer check (visible pop blocks, hidden pop and no beat do not). Deferral (held to 6 s, released at once when the layer leaves, a free callout may pass a held one).
- Required loop: check-ids, test-feel, test-a11y-canvas, test-anim-flavor, test-hints (137 checks), test-ui-motion (536), test-quality (84) and test-ceiling all pass.

**Owner decisions.** (i) The moment reserve has a cost on the hit side. In the flood tests the hit pool got 1 to 2 starts in 4 s, because moments may take free hit slots and the moment rate was about 2.5 a second. Keep as written, cap moments at 2 a window, or let a moment take a free hit slot only when no hit was refused in the last second. (j) Heartbeat forced (above). (k) Hint held up to 6 s, then shown over the story layer.

**Not verified.** Device frame time and the real flash rate at 60 fps (headless only). The hint on a phone. Moment and hit balance in real play; the numbers above come from synthetic floods.

---

# T4 part 14: eczane heal station

The owner-approved pharmacy heal: one use per station, sim-side and config-driven, outside `drops.healCap`. Not committed or pushed. Design rules: `docs/game-design.md` §5.8. Content row `int_eczane`: `docs/content-catalog.md` §9. The §7 band note points here.

**What it does.** A station is a street-side block on a route level. Stand within 0.9 m of its footprint, below full HP, for 0.4 s and it heals 30 HP once, then it is empty. There is no button. The heal is outside the run's simit budget. At full HP a touch does not count, so walking past at full HP does not spend it. The pickup event carries the HP actually restored, and the view reads +N from it.

**Placement rule.** At most one station per level (`perLevel: 1`), on a generated route level that meets all of these:
- level index 3 or higher, and route stage 1 to 4 (never L1 or L2, never the boss stage);
- a street-like hood: the theme is not `bazaar`, and the hood has no `boat` or `ferry` in its vehicles.

Position: side lane, 0.2 to 0.7 of the way to the hold zone, 0.6 m clearance from other blocks and the corridor wall, and the route must stay open (`P.Env.pathOpen`). The station uses its own seeded stream (`seed ^ salt + index × step`), so other levels do not move.

Placed on L3, L4, L6 to L9, L26 to L29, and the same stage pattern in later street hoods (L36 to L39, L46 to L49, L66 to L69, L71 to L74, L76 to L79, L81 to L84, L86 to L89). About 40 of 42 eligible levels got one on an 8-seed check. Not placed on: L1 and L2 (below `from`), the boss levels L5, L10 and L30, or L11 to L25. The hoods there are Karaköy, Galata Köprüsü, Eminönü, Kumkapı, Haliç, Samatya, Yenikapı and Ataköy Marina (boat or ferry), and Kapalıçarşı (bazaar). This is the largest judgement call; see the owner decisions.

**Bot balance** (`tools/bot.js`, kite-generic, 16 seeds per level, expected loadout). Before is the pre-change snapshot. "No detour" is `--noeczane`: the station is placed but the bot does not walk to it. Each cell reads clear · deaths per run · median min HP · runs under 30% HP. Uses are per run, with HP restored per run in brackets.

| Level | Before | With detour | No detour |
|---|---|---|---|
| L3 | 100% · 0.31 · 31% · 50% | 100% · 0.06 · 39% · 44% · 0.44 (12.9 HP) | 100% · 0.13 · 39% · 38% · 0.13 (3.5) |
| L4 | 100% · 0.13 · 46% · 50% | 100% · 0.13 · 45% · 44% · 0.50 (12.3) | 100% · 0.13 · 40% · 50% · 0.38 (8.5) |
| L6 | 94% · 0.50 · 6% · 63% | 94% · 0.50 · 27% · 56% · 0.56 (15.6) | 94% · 0.50 · 27% · 63% · 0.25 (6.3) |
| L7 | 100% · 0.13 · 34% · 38% | 100% · 0.13 · 43% · 25% · 0.38 (10.1) | 100% · 0.13 · 39% · 25% · 0.25 (6.3) |
| L8 | 94% · 0.63 · 0% · 75% | 100% · 0.38 · 13% · 81% · 0.31 (9.4) | 100% · 0.63 · 0% · 81% · 0.13 (3.7) |
| L9 | 100% · 0.31 · 40% · 38% | 100% · 0.38 · 38% · 44% · 0.31 (7.8) | 100% · 0.38 · 37% · 50% · 0.19 (3.2) |
| L26 | 100% · 0.88 · 0% · 100% | 100% · 0.75 · 0% · 88% · 0.50 (14.3) | 100% · 0.75 · 0% · 88% · 0.50 (14.3) |
| L27 | 63% · 0.88 · 28% · 63% | 88% · 0.63 · 19% · 63% · 0.50 (14.3) | 75% · 0.88 · 0% · 75% · 0.25 (6.8) |
| L28 | 50% · 1.13 · 0% · 100% | 75% · 0.88 · 0% · 100% · 0.38 (9.2) | 75% · 0.88 · 0% · 100% · 0.38 (9.2) |
| L29 | 75% · 0.88 · 0% · 75% | 75% · 0.63 · 7% · 88% · 0.25 (7.5) | 75% · 0.50 · 7% · 88% · 0.13 (3.8) |

Unchanged by rule, and the rows match the before run: L1 (6 seeds), L5, L10 and L30 (boss levels, no station), and L11 to L25 (no station). The bot detour fires below 50% HP, to an unused station up to 8 m ahead and 6 m behind, 0.3 m off its side, and only when no enemy is within 1.0 m.

What the table says, with the noise in mind:
- Uses: 0.25 to 0.56 per run with the detour on the ten levels that have a station, and 0.13 to 0.50 without it. HP restored: 7.5 to 15.6 per run with the detour.
- Deaths per run fall with the detour on L3 (0.31 to 0.06), L8 (0.63 to 0.38), L26 (0.88 to 0.75), L27 (0.88 to 0.63), L28 (1.13 to 0.88) and L29 (0.88 to 0.63). Without it they fall on L3 (to 0.13), L26, L28 (to 0.88) and L29 (to 0.50). L9 rises by about one death in 16 runs (0.31 to 0.38). L4, L6 and L7 are flat.
- Clear rate: L27 63% to 88% with the detour, L28 50% to 75%. Each seed is 6.25 points at 16 seeds, so these are 2 to 4 runs.
- Median min HP: L6 +21 points (6% to 27%) and L3 +8 (31% to 39%). L3 stays under the 45 to 65% band, as before. L4 is flat (46% to 45%). L5 stays at 11% (boss, no station). The other moves are within the roughly ±12 point per-level noise. L8 under 30% HP rose from 75% to 81% while its deaths fell, so the effect is not uniform.
- Median run time (`medT`, all runs including deaths, as printed): L3 196 to 197 s, L4 244 to 249, L6 132 to 136, L7 179 to 188, L8 197 to 191, L9 341 to 354, L26 176 to 179, L29 455 to 417. L27 206 to 250 s and L28 278 to 337 s are +21%, outside the §7 ±15% band. This is a survival effect: more runs reach the end, so the median run gets longer. The tool does not print a clear-only median, so this is not yet separated.

**Bugs fixed (floaters).**
1. Boss-arena simit read CAP. The view derived CAP from the run's drop-heal budget, so an uncapped boss-arena simit showed CAP once the budget was spent. The pickup event now carries `uncapped`, and CAP shows only when `capped && !uncapped`.
2. Grit bonus floater. The float showed the nominal simit value (+25) rather than the HP restored (+27 with grit). The float now reads `ev.healed`, the HP actually restored, and the grit bonus is included.

**Code.**
- `js/sim/eczane.js` (new, IIFE): `place`, `touchDist`, `streetLike`, `step`, `state`.
- `js/config-env.js`: `C.env.eczane` (heal 30, dwell 0.4 s, touch 0.9 m, from 3, stages 1 to 4, perLevel 1, placement band and clearances, vehicle and theme exclusions, seed salt and step, and the bot policy block).
- `js/sim/levels.js`: `P.Eczane.place` after `layBlocks`, before `P.Layouts.slots`, guarded like `P.Env`.
- `js/sim/sim.js`: `P.Eczane.step` after `updateDrops`.
- `js/sim/combat.js`: heal pickups carry `healed`, `uncapped` and `capped`.
- `js/sim/hack.js`: the signal-box shortcut keeps a station block.
- `js/view/consumables.js`: `eczane` is a heal pickup. `healText(ev)` reads the event. `M.stationState` wraps `P.Eczane.state`.
- `js/view/render-world.js`: block draw gets the station state. `js/view/istanbul-props2.js`: comment only.
- `js/view/hints-detect.js`, `js/view/hints.js` (order), `js/view/hints-config.js`, `js/strings-hints.js` (`hint.eczane`).
- `index.html`: loads `js/sim/eczane.js` after `env-portal.js`.
- `tools/bot.js`: `eczaneTarget`, the `--noeczane` flag, and the eczane table in the level run.
- `tools/test-eczane.js` (new). `tools/test-hints.js`: floater cases for uncapped boss, grit and eczane.

**Tests.**
- `tools/test-eczane.js`: 47 checks, all pass.
- `tools/test-hints.js`: 137 checks, all pass.
- Owner list, exit 0 each: test-a11y-canvas, test-anim-flavor, test-ceiling, test-dialogue, test-eczane, test-enemy-behaviors, test-env (117 checks), test-feel, test-hints (137), test-horde, test-meta (122), test-progress-ui, test-quality (84), test-tree (165), test-ui-motion (536).
- `test-arsenal --quick`: PASS.

**Owner decisions.**
(a) Placement scope. Stations exist only in street hoods, so L11 to L25 and the boat, ferry and bazaar hoods get none. Keep this, or allow a kiosk in the boat hoods?
(b) Full HP. A touch at full HP does not spend the station. Keep, or let a full-HP touch use it?
(c) L27 and L28 median run time, +21%, outside the ±15% band. Accept it as a survival effect, or tune the station there?
(d) L6 and L8 median min HP moved beyond the noise at 16 seeds. Re-run at 32 seeds before any tuning.
(e) The TR hint string `Eczane: dokununca can verir` is marked `// TR owner check` in `js/strings-hints.js`. It needs a native review.

**Not verified.**
- Real-play balance. These are bot numbers only (kite-generic, 16 seeds), not human rates.
- Art, floater and touch feel on a phone, and the audio cue.
- The 0.4 s dwell and 30 HP are the owner's numbers. There is no playtest behind them.
- The mid game (L11 to L25) is unchanged by design, so the eczane has no effect there.

---

# T4 part 16: pacing package and Adrenaline naming

The owner brief for R1-T4 part 16 has two parts: (A) the in-run level is renamed Adrenalin and the journey level (1 to 100) shows on the HUD; (B) pacing package P1, plus Adrenalin pace tuning with power to make up for the lost cards. Not committed or pushed. Design rules: `docs/game-design.md` §4.5 and §7; stage table `docs/journey.md` §3.1 and timing §6.4; decision D-064 in `docs/product.md`. The §7 P1 note points here.

**A. Naming and HUD.**
- In-run level: the chip shows a bolt icon and "Adrenalin n" (EN "Adrenaline n", `ui.hud.adr`). "Lv" is gone from the HUD, the level-up banner (`lvb.title`: ADRENALİN YÜKSELDİ · n / ADRENALINE UP · n), the card overlay (`ui.cards.sub`), the results recap (`res.recap.reached`: "Ulaşılan Adrenalin n") and the kolonya description. Item and gear levels keep "Lv" on purpose.
- Journey level: the top row shows "BÖLÜM n/100 · HOOD" (EN "LEVEL n/100 · HOOD", `ui.hud.journey`).
- Fit: HUD checked at 390×844 at 100% and 150% text size (chip, bolt, timer, XP bar, objective row; the card overlay wraps). The results screen at 150% was not captured.
- New TR strings are marked `// TR owner check`: `ui.hud.adr`, `ui.hud.journey`, `lvb.title`, `res.recap.reached`, `ui.cards.sub`, `desc.kolonya`.

**B. Pacing package P1.**
- Route length, boss approach and gate hold ×1.25 from `levels.rampFrom` on (`C.levels.pace`: routeMul 1.25, holdMul 1.25). Boss approach 100 → 125 m.
- Brute boss HP 1400 → 2800 (H01, H02, H03, H14, H20 only; taksici keeps its own HP).
- Adrenalin XP on L2+: round(32 + 11 × level^1.6), was 30 + 5. L1 keeps `xp.l1`.
- Power for the lost cards: two free upgrade crates per generated route level, dropped at route segments B and D (`levels.pace.crateSeg`, `crateAt` in `js/sim/levels.js`). They are pending chests, so the existing chest flow opens them. The brief said "free card at stage 3"; I read "stage" as the route segment, since in these docs stage means hood level. The lead should confirm.
- Boss pace beyond brute HP: not changed. Boss HP ×2 and gap ×1.6 on the other bosses was tried and rejected (below).

**Tuning rounds (L2–9, mean of level values).** Shipped config = R4. Lowest level is the lowest per-level clear rate.

| Round | Change | Clear | Lowest level | Deaths/run | First lv-up s | Gap s | Lv-ups | Result |
|---|---|---|---|---|---|---|---|---|
| before | pre-P1 | 97.8% | 94% | 0.28 | 9.7 | 18.3 | 10.6 | reference |
| R1 | route ×1.25, brute HP 2800, old XP | 97.0% | 88% | 0.29 | 9.9 | 20.9 | 11.8 | minutes up, gap still short |
| R2 | R1 + XP 32 + 11 × level^1.6, one crate at C | 79.9% | 56% | 0.78 | 12.1 | 31.6 | 7.8 | power collapsed; rejected |
| R3 | R2 with one crate at B | 90.9% | 75% | 0.58 | 12.1 | 30.0 | 8.1 | better, not enough |
| **R4** | **crates at B and D** | **95.5%** | **88%** | **0.34** | **12.1** | **28.6** | **8.6** | **shipped; every level ≥ 85%** |
| R5 | XP 32 + 13, three crates | 93.9% | 69% | 0.41 | 12.6 | 29.0 | 8.1 | steeper curve: no gap gain, more deaths; rejected |

R4 reproduces exactly on the shipped config (the bot is deterministic for a fixed config and seed set).

**Bot balance, before → after** (`tools/bot.js --verbose`, paired seeds, 16 seeds per level for L2–10, 8 seeds for boss levels; before = the pre-P1 snapshot). Each cell is before → after.

| Level | Clear | Deaths/run | Median min HP | First lv-up (s) | Gap (s) | Lv-ups (median) | Clear time (min) |
|---|---|---|---|---|---|---|---|
| L2 | 94 → 100% | 0.13 → 0.25 | 34 → 19% | 10.6 → 16.6 | 20.6 → 29.7 | 8 → 7 | 2.68 → 3.39 |
| L3 | 100 → 94% | 0.06 → 0.06 | 35 → 34% | 8.1 → 8.4 | 16.3 → 26.0 | 12 → 10 | 3.28 → 4.13 |
| L4 | 100 → 94% | 0.13 → 0.38 | 43 → 22% | 11.9 → 15.2 | 20.1 → 31.6 | 12 → 9 | 4.11 → 5.08 |
| L5 | 94 → 100% | 0.50 → 0.25 | 7 → 30% | 10.6 → 12.0 | 19.0 → 27.4 | 6.5 → 5.5 | 2.31 → 2.83 |
| L6 | 94 → 94% | 0.50 → 0.25 | 18 → 34% | 11.2 → 12.9 | 15.6 → 24.2 | 7.5 → 6 | 2.26 → 2.83 |
| L7 | 100 → 100% | 0.13 → 0.38 | 40 → 21% | 8.3 → 11.2 | 16.6 → 26.7 | 11 → 8.5 | 3.13 → 3.88 |
| L8 | 100 → 94% | 0.38 → 0.56 | 11 → 12% | 10.2 → 12.3 | 20.7 → 33.4 | 8.5 → 8 | 3.16 → 4.01 |
| L9 | 100 → 88% | 0.38 → 0.63 | 38 → 0% | 6.9 → 7.9 | 17.6 → 29.7 | 19.5 → 14.5 | 5.87 → 7.39 |
| L10 | 88 → 94% | 0.44 → 0.50 | 18 → 16% | 9.2 → 9.5 | 18.1 → 23.7 | 8 → 7 | 2.47 → 3.00 |
| **L2–9 mean** | **97.8 → 95.5%** | **0.28 → 0.34** | **28 → 22%** | **9.7 → 12.1** | **18.3 → 28.6** | **10.6 → 8.6** | **3.35 → 4.19** |

L2–10 mean clear time: 3.25 → 4.06 min. Chapter 1 at this speed (100 levels): about 5.4 h before, 6.8 h after; the sample is H01 to H02 only.

**Boss levels, before → after** (18 boss levels L15–L100, 8 seeds each; before = pre-P1 config, after = P1; mean of level values):

| Group | Clear | Deaths/run | Median min HP | Clear time (min) | First lv-up (s) | Gap (s) | Lv-ups |
|---|---|---|---|---|---|---|---|
| all 18 | 76.7 → 79.4% | 0.83 → 0.70 | 11.8 → 13.3% | 2.33 → 2.88 | 5.5 → 6.0 | 9.5 → 13.7 | 13.4 → 10.8 |
| non-brute 15 | 73.6 → 76.9% | 0.86 → 0.74 | 10.6 → 12.9% | 2.34 → 2.83 | 5.4 → 6.0 | 9.6 → 13.3 | 13.4 → 10.6 |
| brute 3 (L15, L70, L100) | 92.0 → 91.7% | 0.67 → 0.50 | 17.7 → 15.3% | 2.31 → 3.13 | 5.7 → 6.1 | 9.0 → 15.2 | 13.5 → 11.8 |

The first level-up on boss levels is about 6 s: the arena starts with fast kills. The 12 to 15 s target is for L2–9.

**Boss tuning tried and rejected (b2).** Boss HP ×2 and gap ×1.6 on the 15 non-brute bosses, L20 to L95, 8 seeds each, against the same levels before:

| Measure | Before | b2 |
|---|---|---|
| Clear | 73.6% | 62.7% |
| Deaths/run | 0.86 | 1.04 |
| Median min HP | 10.6% | 3.7% |
| Clear time (min) | 2.34 | 3.46 |
| Gap (s) | 9.6 | 15.3 |

It lengthens the boss stage toward the 4 to 5 min target, but costs about 11 points of clear rate. Not shipped.

**Bands.** The full table is in `docs/game-design.md` §7. Met: L2–9 clear (every level ≥ 85%, lowest 88%); first Adrenalin level-up 12.1 s; L4 and L5 deaths in the 0.15 to 0.4 band; boss deaths 0.70 in the 0.3 to 0.7 band; boss clear not regressed. Missed: gap 28.6 s (30 to 40); level-ups 8.6 per 4.2 min, about 10 at 5 min (6 to 9); minutes per level 4.06 (5.0 to 5.5); chapter 1 6.8 h (7 to 9 h); boss stage 2.9 min (4 to 5 min); boss clear 79.4% (80%, short by 0.6 pt); L3 median min HP 34% (45 to 65%, not met before or after); L9 min HP 0%.

**Code.**
- `prototype/js/config-levels.js`: `C.bosses.brute.hp` 2800; `C.levels.pace`.
- `prototype/js/config.js`: `xp` block (base 32, mult 11). The L1 curve is unchanged.
- `prototype/js/sim/levels.js`: `P.Levels.paced`, `crateAt` (called from `doMark` on route segment marks).
- `prototype/js/view/ui.js`, `prototype/index.html`, `prototype/css/proto.css`: journey chip and Adrenalin chip with the bolt icon.
- `prototype/js/strings-journey.js`, `strings-progress-ui.js` (the duplicate `lvb.line` key removed; the two lines were identical), `strings.js`, `strings-weapons2.js`.
- `prototype/tools/test-progress-ui.js`, `prototype/tools/test-ui-motion.js`: new keys and owner-check lists.
- Docs: `docs/game-design.md` §4.5 and §7; `docs/journey.md` §3.1 and §6.4; `docs/product.md` D-064.

**Tests.**
- `test-progress-ui`: 602 checks, all pass. `test-ui-motion`: 536 checks, all pass.
- Owner loop (`/tmp/pace/loop.log`): pass on check-ids, check-hood-keys, check-objective-strings, check-death-causes, check-entrances, test-meta, test-dialogue, test-enemy-behaviors, test-env, test-ceiling, test-feel, test-horde, test-tree, test-ui-motion, test-a11y-canvas, test-anim-flavor, test-progress-ui, test-hints, test-quality. `test-eczane`: FAIL, 3 checks (below).
- `test-eczane`: 3 fails, all from P1 and in files I did not touch. The placement pins (L3 seeds 1 and 3, L26 seed 1, L6 seed 3) moved with the longer route. The pharmacy and kiosk `stepSim` checks are blocked by a pending crate chest after the teleport. All three pass on the pre-P1 snapshot. The eczane owner needs to drain pending chests after the teleport and update the pins.
- `test-arsenal --quick`: EXIT 0 (`/tmp/pace/arsenal.log`).
- L1 byte-identical with the pre-P1 snapshot on 6 seeds (`/tmp/pace/S0` vs `S4`).

**Not verified.**
- Real-play feel: the Adrenalin pace, and whether two crates per level read as free upgrades to members.
- Results screen at 150% text size.
- Turkish strings: the owner check is still open.
- All balance numbers are bot numbers (kiting bot, 16 seeds per level, 8 for bosses). Per-level noise is about ±12 points at 16 seeds. They are not human rates.
- Chapter 1 timing is extrapolated from a 9-level sample.

**Owner decisions.**
(a) Crates: two per route level (segments B and D), not one "free card at stage 3". Keep, or test a single card at stage 3 (not run; one crate at B gave 90.9%)?
(b) Boss stage: non-brute bosses stay near 2.8 min. Reaching 4 to 5 min needs boss HP ×2 with gap ×1.6, which costs about 11 points of clear rate. Accept the shorter stage, or revisit the target?
(c) Adrenalin pace: 8.6 level-ups per 4.2 min (about 10 at 5 min, band 6 to 9). Accept, or cut XP further (R5 showed a steeper curve does not help the gap)?
(d) TR strings marked `// TR owner check`.

---

# T4 part 17: kiosk heal station

The second heal station, for the hoods where a pharmacy does not fit. It is the same module and the same rules as part 14 (`js/sim/eczane.js`): one station per level on L3 to L100, route stages 1 to 4, never a boss stage, healing 30 HP once, outside the drop-heal cap, after a 0.4 s touch with no button. Only the look, the placement band and the RNG stream differ.

**Placement.** A hood gets the pharmacy when it is street-like (no boat or ferry in the hood, and not the covered bazaar). Every other hood gets the kiosk (block kind `bufe`, `env.eczane.variants.kiosk` in `config-env.js`): Karaköy, Galata Köprüsü, Eminönü, Kapalıçarşı, Kumkapı, Haliç–Balat, Yenikapı, Samatya and Ataköy Marina. That is nine hoods; the other eleven get the pharmacy, so all twenty are covered. The bazaar keeps a kiosk on all four route levels. The pharmacy spots are unchanged by this part.

**Look (`js/view/istanbul-props2.js`, `js/view/consumables.js`, `js/view/consumables-icons.js`).** A wood counter with a cream top, an orange and cream striped awning with scalloped edge along its front, a three-ring simit stack on the left of the counter top, and a tea glass on its saucer on the right. The glass is drawn at twice the props scale: at 0.13 m it was about 5 px tall at phone size and did not read. The sign plate carries the awning and tea-glass icon, not the pharmacy cross, so the two stations are told apart by silhouette as well as colour. Usable: the green sign glow pulses at `consumables.stationPulseHz` = 0.5 Hz, and is steady under Reduce motion or Reduce flashing. Empty: the simits and the glass are gone, the awning and counter go grey and the sign reads EMPTY. Steam rises from the glass rim and drifts with motion on. Under Reduce motion there are two still wisps per glass, in warm grey, because white steam vanished on the cream counter.

**Hints (`js/strings-hints.js`, `js/view/hints-config.js`).** `hint.kiosk`: TR `Büfe: Dokun ve iyileş` (`// TR owner check`), EN `Kiosk: touch to heal`. `hint.eczane` is TR `Eczane: Dokun ve iyileş` (owner-approved; its owner-check comment is dropped) and EN `Pharmacy: touch to heal`. The kiosk hint follows the eczane hint in the order (`hints.js`).

**Owner decisions.** (a) The pharmacy TR line is approved. (b) The kiosk TR line `Büfe: Dokun ve iyileş` still needs the owner check.

**Art check.** Stills at 390 x 844 at 2x, through the game's own render path (`tools/arena-still.html`, `&live=1&secs=0&station=1`, plus `&empty=1` for the used state): hood 4 Eminönü (kiosk), hood 5 Sirkeci (pharmacy) and hood 12 Samatya (kiosk), usable and empty. The art was judged at phone size and in the legend sheet: the awning, the simit stack, the glass and the sign read in both states; the green glow is steady under Reduce motion. Two things were fixed on the way: the glass size and the steam colour (above).

**Tool changes (tools only).**
- `tools/arena-still.html` did not load `sim/eczane.js` or the consumables and string scripts, so it could never show a station. It now loads them (the same scripts as `index.html`, additive), and takes `&station=1` and `&empty=1` as above.
- `tools/prop-legend.html` has a heal-station section: both variants in both states, role `solid cover` at their `config-env.js` sizes. `?only=stations` shows just that section and `?reduce=1` steadies the glow. The eczane and bufe were drawn as sidewalk dressing before, because they had no size entry; they are now skipped in the dressing loop. The sheet loads `config-env.js`, `hints-config.js`, `strings.js` and `strings-hints.js` (its EMPTY label needs `P.t`).

**Bot comparison** (`node tools/bot.js --levels=3,4,6,7,8,9,11,12,13,14,16,17,18,19 --seeds=12`, with and without `--noeczane`). Both runs started together on the same sim snapshot (17:21, before the Night Shift changes to `sim/levels.js`). Deaths per run, clear rate, and station uses per run, with the detour (A) and without it (B, `--noeczane`; the stations stay and a route touch still heals):

| Level | Deaths/run A | Deaths/run B | Clear A | Clear B | Eczane uses A / B | Kiosk uses A / B |
|---|---|---|---|---|---|---|
| L3 | 0.08 | 0.08 | 92% | 92% | 0.33 / 0.08 | – |
| L4 | 0.25 | 0.33 | 92% | 92% | 0.42 / 0.17 | – |
| L6 | 0.17 | 0.17 | 100% | 100% | 0.33 / 0.08 | – |
| L7 | 0.33 | 0.25 | 100% | 100% | 0.33 / 0.08 | – |
| L8 | 0.50 | 0.58 | 92% | 92% | 0.25 / 0.08 | – |
| L9 | 0.75 | 0.83 | 92% | 83% | 0.42 / 0.25 | – |
| L11 | 0.75 | 0.75 | 83% | 83% | – | 0.33 / 0.17 |
| L12 | 1.33 | 1.33 | 58% | 58% | – | 0.50 / 0.50 |
| L13 | 1.17 | 1.42 | 67% | 50% | – | 0.50 / 0.42 |
| L14 | 1.33 | 1.42 | 50% | 50% | – | 0.50 / 0.33 |
| L16 | 0.75 | 0.83 | 83% | 83% | – | 0.50 / 0.33 |
| L17 | 1.42 | 1.42 | 42% | 50% | – | 0.58 / 0.33 |
| L18 | 1.50 | 1.58 | 42% | 42% | – | 0.58 / 0.17 |
| L19 | 1.67 | 1.75 | 25% | 17% | – | 0.42 / 0.17 |

Reading: no level has more deaths with the detour beyond noise. The largest rise is L7, +0.08 deaths per run (one death in 12 seeds). Most levels have fewer deaths with the detour. The detour is real for both variants: pharmacy uses go from 0.08 to 0.33 per run on L3, and kiosk uses on L11 to L19 are 0.33 to 0.58 with the detour and 0.17 to 0.50 without it (L12 is 0.50 either way, because the route touches it). Clear-rate moves of 8 to 17 points (L13, L17, L19) are within the noise of 12 seeds (one seed is 8 points, and the review's own noise figure is about ±12 points at 16 seeds). The bot numbers are kiting-bot numbers, not human rates.

**Tests.** `test-hints`: 164 checks pass. `test-eczane`: 81 checks passed earlier in this session, before the Night Shift edits, covering the kiosk placement, the state reads and the touch rules. At 17:30 the wider suite fails in files other agents are changing for Night Shift and Nightmare, not in this part: `sim/levels.js:281` calls `P.Modes.spawnMul`, which the test loader does not yet have (`test-env`, `test-eczane`, `test-enemy-behaviors`, `test-horde`, `test-ceiling`, `test-meta`), and `test-progress-ui` reports missing `mode.nm.*` strings. `check-ids`, `test-a11y-canvas`, `test-feel` and `test-hints` pass. Re-run the suite once the modes wiring lands.

---

# T4 part 18: Nightmare and Night Shift

Owner brief: build both replay features now, Nightmare per hood and the Night Shift daily. Not committed or pushed. Design: `docs/game-design.md` §8.17, `docs/journey.md` §3.4, `docs/retention.md` §3.7; decision D-065 in `docs/product.md` (ACCEPTED 2026-11-13).

**Unlock and rewards.** A hood's Nightmare opens when every level of that hood is cleared on Normal. Nightmare: Street Cred ×2 on the first Nightmare clear of a level (the extra is added on top of the normal grant), coins ×1.5 on every Nightmare clear, a moon per hood when all five levels have a Nightmare star, the title Gece Nöbetçisi at three moons. A fourth star: clear, no revive, lowest HP at 40% or more. Night Shift: the first run of each day pays 30 Street Cred and 60 coins, plus 10 coins per streak day (cap 7). Nothing is paid for retries.

**Numbers (config/`config-modes.js`, PROTO).** Nightmare: enemy HP ×(1.05 + 0.004k), damage ×(1.20 + 0.004k), spawn ×(1.00 + 0.002k) capped at 2.4 on the total, drop heal 0.9, boss share 0.6 (normal 0.3), boss HP ×1.3, L1 spawn ×1.10; k = journey index − 1. Signatures: one per hood through existing levers (table in `levels.nightmare.sig`). Night Shift: spawn ramp ×(1 + 0.005 × seconds) capped at ×3.0, 12-minute cap (a win), one revive, score = survival seconds + 0.5 × kills + 10 × Adrenalin level, local best, leaderboard hook `nsi.nightshift.board` (not wired).

**Save decision (owner to confirm).** The `modes` block is additive inside schema v3: no VERSION bump, KEY `nsi.meta.v3` unchanged, a missing block is the default, and every value is clamped on read. The reason is that `tools/test-tree.js` pins VERSION 3. If the owner prefers a bump, the block moves to v4 with a migration.

**Nightmare bot tables.** Kite-generic policy, 12 seeds per level, clear = win with one revive; min HP is the lowest HP fraction of the run (a death counts as 0). Targets: clear 55–75%, median min HP 15–35%.

| round | L5 clear / min HP | L12 | L30 | L50 |
|---|---|---|---|---|
| r0 (first multipliers) | 83% / 6% | 25% / 0% | 25% / 0% | 25% / 0% |
| r1 | 100% / 7% | 42% / 0% | 67% / 0% | 58% / 0% |
| r2 | 100% / 9% | 50% / 0% | 67% / 0% | 42% / 0% |
| r3 | 100% / 27% | 50% / 0% | 33% / 0% | 25% / 0% |
| r4 (shipped) | 100% / 9% | 50% / 0% | 58% / 0% | 25% / 0% |
| Normal (baseline, same bot) | 100% / 29% | 58% / 0% | 83% / 43% | 92% / 6% |

**Night Shift bot tables.** 16 seeds (day `nsbot-N`, all levels unlocked, one revive). Target: median survival 5–9 minutes with a long tail. Median is the mean of the 8th and 9th of 16 sorted survival times.

| round | ramp perSec / cap | median | runs at the 12-min cap |
|---|---|---|---|
| r0 | 0.001 / 1.9 | 12.0 min | 13 / 16 |
| r1 | 0.0025 / 2.6 | 12.0 min | 11 / 16 |
| r2 (shipped) | 0.005 / 3.0 | 10.8 min | 8 / 16 |
| r3 | 0.004 / 2.8 | 12.0 min | 10 / 16 |
| r4 | 0.007 / 3.5 | 12.0 min | 9 / 16 |

**What is missed.**
- Nightmare: the clear band is hit only on L30 (58%, r4). L5 is 100%, L12 50%, L50 25%. Median min HP is 0% on L12, L30 and L50 in every round, because most bot runs die on those levels and a death counts as 0. The Normal baseline is already above the clear band on L5, L30 and L50, and on L12 Normal is 58% with 0% min HP. So the L12 target cannot be met without moving Normal, and the bands look set for a different policy. Owner: pick targets for this bot, or change the metric (for example min HP among runs that survive).
- Night Shift: the long tail is there (8 of 16 reach the cap in r2, and 6 of 16 die between 1 and 4 minutes), but the median is 10.8 min at best. Changing the ramp in five rounds did not bring it under 10 min, so the ramp is not the main lever for this bot. Next levers to test if the target stays: route density or the stage roster on Night Shift stages, or a ramp that flattens after about six minutes.

**Bot changes.** `tools/bot.js` has `--mode=nightmare|nightshift` (targeted edits; another agent also edits this file). The Night Shift summary prints survival quartiles, the cap count and score per seed.

**Hook guards.** The `levels.js` and `director.js` calls into `P.Modes` now check that it is loaded (the same pattern as `sim.js`). Found when `test-horde` and `test-arsenal` failed: their own file lists do not include `modes.js`. With modes absent, the hooks are identity, and the Normal golden traces did not change.

**Tests.** `tools/test-modes.js`: 259 checks pass. It covers the config shape, Nightmare multipliers only in Nightmare, one signature per hood (the route changes), the unlock rule, the rewards and the moon and title, the fourth star, the Night Shift seed, plan and rotation, one paid run per day and the streak, the endless run to the cap, the additive save and damaged values, the golden Normal traces (five levels, fixed input, pinned to the pre-change tree), no clock or settings in the sim, and the wiring (telemetry, ids, string keys, owner-check tags, no `%{` placeholders, no CSS animation). Loop (`check-ids` through `test-modes`, 21 scripts): all exit 0. `test-arsenal --quick`: PASS. Same pass status as the baseline logs (`/tmp/nm/base-*.log`); the only count changes are the new files: `test-quality` 84 → 85 checks, `test-a11y-canvas` 84 → 85 view files (`view/modes-ui.js`).

**Headless UI check.** 390×844, text at 100% and 150%. Text scale was set through `P.Settings.textSize` and `P.applySettings()`; setting `--ui-text` on the root does not work, because `#phone` sets it. Checked: the map (the hood 0 moon), the level sheet toggle, the HUD moon and vignette, the results (four stars, criteria, reward rows), the hood card mode line, and the Tasks Night Shift card. Fixed in this pass: the unselected Nightmare label was cream on cream (invisible), the hood card's mode line had weak contrast, and the fourth-star string used `%{n}`, which rendered as "%40". Screenshots are in `/tmp/nm/ui`.

**Not verified.** The Night Shift in-run HUD; the moon and title rows on results (the Street Cred row was seen); reduce-motion; a real device; the leaderboard (a hook only, by design). The Turkish UI was not checked visually.

**Observed, not changed (pre-existing).**
- At the default map scroll, the İstiklal (hood 0) badge and its moon sit under the tab row.
- The HUD HP readout shows a float, "97 / 110.80000000000001" (the +10.8% HP bonus is not rounded).
- Objective chips ("Bonus missed") overlap the results title on generated levels with lantern objectives (seen on L6 in Nightmare; Normal not checked).
- At 150% text, the map's top tab row overflows on the right ("MEMORIES" is cut).

**Owner decisions.**
1. Save: an additive block inside v3 (no bump). Confirm, or move to v4.
2. Night Shift pays Street Cred. That is power-adjacent, which conflicts with the daily-reward rule (retention §3.6). Keep it, or move the daily pay to coins and cosmetics.
3. Turkish: the mode names and the seed words are marked `// TR owner check` in `strings-modes.js` (20+ lines).
4. Bot targets: pick Nightmare and Night Shift targets for this bot (the Normal baseline is already outside the Nightmare bands), or change the metric.
5. Boss hooks: Nightmare bosses take a 0.6 share and ×1.3 boss HP. Normal boss numbers are unchanged.
6. The Night Shift median target (5–9 min) is not met (10.8 min at best).

**Retune (2026-11-14, owner: no need to wait for telemetry).** Night Shift: the spawn ramp alone left easy levels unkillable and the median swung between 10 and 12 minutes. The ramp now also scales enemy HP (x(1 + 0.002 s), cap 2.5) and damage (x(1 + 0.0007 s), cap 1.8). Bot, 16 seeds: median survival 6.5 min (target 5 to 9), 5 of 16 reach the cap, p25 1.5 min. The median still flips between about 4 and 7 minutes with small changes, because the runs split into early deaths and cap runs; treat 5 to 9 as a band, not a point. Nightmare: the depth terms were too steep (L50 clear 25%, Normal 92%), so hp and damage lin are 0.002, boss share 0.45 and boss HP x1.15. Bot, 24 seeds: clear L12 42%, L30 46%, L50 42% (Normal 58, 83, 92). The old 55 to 75% clear and 15 to 35% min HP bands do not fit this bot (Normal itself misses them), so the Nightmare target is now a bot clear of 35 to 55% with the Normal baseline above it, and min HP is read on cleared runs only. 12 seeds swing 15 points either way, so use 24 or more.

**Resolution (2026-11-14, owner delegated 2 to 5).** The additive `modes` block stays in schema v3. The Night Shift now pays coins only (60 plus the streak chest), with no Street Cred (retention 3.6, D-065). The Turkish lines wait on the owner's table. The Nightmare and Night Shift bot targets (4 and 6) stay open until real telemetry arrives.

# R1-T5 step 1: tree data, save v3 and the Street Cred rule

Owner accepted the recommendations (D-059 now ACCEPTED): Q1 perks only, Q2 one free respec per chapter and never sold, Q3 six branches of four, Q5 Survival Skills stay retired, Q6 Kaan only. Q4 (perk list and TR names) and Q7 (doc conflicts) are still open. Step 1 of `docs/skill-tree.md` section 8.

## Done
| Item | Change |
|---|---|
| Tree config and logic | New `js/config-tree.js` (92 lines, pure): 24 perk ids `<attr>.<tier>`, gates at rank 1, 2, 4, 6, costs 1 to 4 (60 SC for the tree), `learn`, `respec` (refunds everything, one free use per chapter), bond helpers. No display strings and no perk effects yet |
| Save v3 | `nsi.meta.v3` adds `tree` and `bonds`. Reads v3, else v2, else v1; the older keys are kept as backups. A v2 save keeps coins, stars, attributes, SC, mastery, counters and streak |
| Street Cred rule (Q1) | `P.Stats.allocate` and `spendable` use READY points only. `scNeeded` is removed. The attribute screen's plus button follows the same rule (`meta-stats.js`, one line) |
| Tests | New `tools/test-tree.js`, 67 checks: gates, costs, rank is the lock, SC is the key, learn does not mutate, respec rules, SC cannot buy attribute points, v2 to v3 migration, damaged saves. A mutation check (one gate changed) fails as it should |

## Checks
`test-tree` (67), `test-meta`, `test-dialogue`, `test-feel`, `test-ceiling`, `test-enemy-behaviors`, `test-env`, `test-horde`, `check-ids`, `check-hood-keys`, `check-objective-strings`, `check-death-causes`, `check-entrances` pass. `bot.js --seeds=3` runs. The game page loads in a headless browser with a v3 save, no page errors. `test-arsenal.js` not run (over 10 minutes; no sim code changed).

## Deviations
- **Street Cred has no use until step 3.** Until the tree screen exists, SC accumulates and cannot be spent (it used to buy attribute points). Nothing is lost: the balance is kept and the future screen spends it. The attribute screen still shows the SC count in its pool line. If you want SC spendable sooner, step 3 can come before step 2.
- No balance numbers changed; the bot sim is not affected (perks have no effects yet).

## Known issues
- The attribute screen text `attr.pool` still lists Street Cred; the wording is yours (TR) if you want it dropped.
- `docs/attributes.md` section 3 still describes SK as an attribute gate. That is conflict (d) in Q7, not touched.

## Proposed next steps
Step 2: perk effects as Defs, folded into `P.Power.expectedLoadout`, then a bot run on L1-30 against the game-design section 7 bands. This needs Q4: do you want to keep, rewrite or replace the 24 placeholder perks first, or should I implement the placeholders and you adjust later?

---

# R1-T5 step 2: the 24 perk effects

Owner answers used: Rule 2 (the half-an-attribute-rank cap) covers **percent stat bonuses only**; **accept my swaps**; **code wins** over the docs. Three agents built disjoint file groups in parallel; the lead integrated and ran the checks.

## Done
| Item | Change |
|---|---|
| Config and plumbing | New `js/config-perks.js` (every perk number) and `js/sim/perks.js` (`s.perk` set from the loadout, shared `P.Perks.ring`). `s.pk` is the per-run perk state. `loadout.perks` comes from the save in the game and from `P.Power.expectedPerks` in the bot (Street Cred from `killsPerLevel` x cleared levels, spent down `perkOrder`) |
| Combat (9 perks) | `combat.js`: str.1 to str.4, agg.2, agg.3, grit.1, grit.3, grit.4. `P.Combat.shove` gained an optional stack argument; `damageHero` returns the damage taken |
| Movement and frenzy (6 perks) | `skills.js`, `env-zones.js`, `enemies4.js`, `view/ui.js`: pace.1 to pace.4, agg.1, agg.4, plus `P.Skills.extendFrenzy` |
| Hacks, rescues, regen (9 perks) | `hack.js`, `events-kinds.js`, `events.js`, `objectives-kinds.js`, `sim.js`, new `view/perk-mark.js`: int.1 to int.4, cha.1 to cha.4, grit.2 |
| Lead fixes | The shove ring stacks onto a push in flight (it overwrote it); Cart Shover also covers env blasts (gas canisters, bomb cars); a rescue that already brings a helper (charm gate) keeps its full 20 s under Neighbourhood; a white fading ring (`perkRing`) shows Shockwave and Last Laugh |

The tree's perks are not learned by anyone yet (no screen), so a normal player sees no change until step 3.

## Tests and balance
- New: `test-perks-combat`, `test-perks-move`, `test-perks-world`, each with a learned and a not-learned check per perk. The agents ran mutation checks (combat: 11 deliberate breakages, all caught) and **byte-identity digests with no perks learned** (combat: 45 seeded scenarios; movement: 60k steps over 10 levels and 2 seeds; world: 12 seeded runs; all identical to HEAD).
- Pass: `test-tree`, `test-meta`, `test-dialogue`, `test-feel`, `test-ceiling`, `test-enemy-behaviors`, `test-env`, `test-horde`, the five `check-*` tools.
- **Bot A/B (30 seeds, kite-generic, one revive allowed), typical player with and without perks:**

| Level | Clear, perks on / off | No-death, perks on / off | Perks owned (typical player) |
|---|---|---|---|
| L20 (H04-L5, boss) | 93% / 93% | 70% / 57% | 3 |
| L30 (H06-L5, boss) | 87% / 87% | 63% / 70% | 9 |

Within the noise at 30 seeds (about plus or minus 9 points). Game-design section 7 targets (L20 about 65%, L30 about 60%) hold. L1-L10 have no perks in the model (attribute rank under 1). The model assumes **500 kills per cleared level** for the Street Cred budget; that is an assumption to measure.

## Deviations
- Perks differ from the first placeholder list as approved (see `docs/skill-tree.md` 4.3). Hot Streak is 50, not 25 (code base is 60).
- **int.4 Backdoor (resolved, owner said yes):** the tram half first changed only how long the danger lane was painted (the sim gave `rushT` no gameplay effect). It now lengthens the crush lane x1.5 (12 m to 18 m), the painted lane follows it, and the rush time is unchanged. Test: an enemy 25% past the base lane is crushed only with the perk.
- **grit.4 Stubborn (changed, owner picked option 3):** the damage reduction is gone (a lethal hit could never be reduced, so the 10% rarely mattered and was invisible). It now pulls healing drops (simit and the like; not XP, coins or chests) to the hero from 5 m while HP is at or below 20% (base pickup radius is 1.5 m). It only moves food closer, so damage and the death path are untouched and it cannot act as a revive.
- **str.2 Cart Shover:** carts never explode in this game, so it triggers on canister and env blasts only.
- **grit.1 Thick Skin:** covers the default melee contact; brute charge and bloater contact are not covered.
- **pace.1 Quick Feet:** the slow stays off until the hero leaves that puddle or tea tile (a one-shot clear would be undone on the next frame).
- **pace.2 Slipstream:** counts distinct enemies per frame (about 0.33 m steps), so a very thin pass could be missed.
- **pace.4 Dolmus Rider:** the free dash's own cooldown is 0, so the next dash is also immediate.
- **grit.3 Iron Stomach:** does not cover the simit reward card (not a drop). Heavy weapons are those flagged `heavy:true`: canister, sledge, blacksmith, cleaver, cluster, finale.

## Known issues (view and text, not built)
- **int.2 Second Look (resolved):** a terminal that keeps its progress now shows its progress arc while idle, and the label reads `ZAYIF BAĞLANTI` (the owner's wording; EN `WEAK SIGNAL`, my wording) instead of `KESİLDİ` / `LOST`. Key `hack.weak` in `config-levels.js`, in capitals like its sibling `hack.lost`.
- No perk icons, names or descriptions yet (step 3, TR text yours).

## Also checked
- **Real game page with all 24 perks learned** (level 22, headless browser, 6 s of play, a shove ring fired): state `play`, 24 perks in the run, no page errors.
- **`test-arsenal.js --quick` passes** (the full run takes over 10 minutes and was not repeated). Running it exposed a break from my T4 work: `weapons-fx.js` calls `P.Feel.hitStop`, and the test's hand-written file list does not load `feel.js`, so it crashed. Fixed with a no-op `P.Feel` stub in the test, like its other browser-only stand-ins. T4 had skipped this test, so the break had gone unseen.

## Proposed next steps
Step 3, the Street Tree screen from the wireframe (Fight and Street pages, learn, respec, locked Bond tab), in EN and TR, with screenshots at 390x844. It needs your Turkish perk names and descriptions (24 pairs) or I draft EN and mark TR as proposed. Then step 4 (Kaan bond) and step 5 (telemetry).

---

# R1-T5 step 3: the Street Tree screen

Owner answers used: the perk text list is approved (5 rows rewritten by the owner, 19 "ok"); the Dash is **Depar** in TR; metres are written "1m". Built from `design/lofi/11-skills.html`. Screenshots (390x844, headless browser, seeded save: Strength 4, Aggression 2, Grit 1, Pace 2, Intelligence 1, Charm 3) are in `reviews/media/R1/tree/`.

## Done
| Item | Change |
|---|---|
| Screen | New `js/meta/meta-tree.js` (126 lines). Header with back, title and the Street Cred chip; page switch Fight (Strength, Aggression, Grit) and Street (Pace, Intelligence, Charm) plus a disabled **Bond · L20** tab; 3 columns x 4 tiers; detail panel with name, tier, description, requirement line and the Learn button; respec link and the "earn Street Cred by fighting" hint |
| Node states | learned (gold, tick), available (gold outline, `◆cost`), not enough Street Cred (muted outline, `◆cost`), locked by rank (dashed, dimmed, lock icon and the rank needed). Lock and cost are text on every node, never color only; each node has an `aria-label` with name and state |
| Rank source | Branch headers and "(you have N)" show the **spent** rank, the same value the gate uses. The Karakter screen shows spent plus ready points, so the two can differ by design |
| Respec | The free respec burns once per chapter, so it takes two taps: the first turns the link into "Sıfırlansın mı? 5 Sokak Tecrübesi geri gelir. Onaylamak için tekrar dokun." (any other tap cancels). Used: the link reads "Bu bölümdeki sıfırlama hakkı kullanıldı" and is disabled. Nothing learned: disabled, and it does not burn the free respec |
| Persistence | `P.Meta.treeState / treeLearn / treeRespec` in `meta-data.js`: Street Cred and the tree are written together in one save |
| Strings | `js/meta/strings-tree.js`: the 24 perk names and descriptions copied verbatim from the approved list, the 11 screen keys, and 6 new keys (below) |
| Entry point | A fifth tab, **Yetenekler / Tree**, in the map's tab strip (after Karakter). Tab font 11 to 10 px, gap 4 px and the tabs size to their label so five labels fit inside the margins |
| Karakter note | `attr.panelNote` said Street Cred "goes anywhere", which is no longer true. It now points to the Tree tab |
| Tests | `test-tree.js` (165 checks, was 67): learn persists and costs Street Cred, a rank-locked or unknown perk is refused, respec refunds, a second respec in the chapter is refused, an empty respec does not burn it, the run loadout carries the learned perks, every perk and screen key has EN and TR text and a name that fits a node. `test-meta` (122) and `test-dialogue` pass |
| Other | `Depar` rename (committed earlier); `tools/lib-load.js` skips the new view file like the other panels; wireframe node names updated to the final perk names, and Shockwave is drawn locked (Strength 3 is under its gate of 4; the old wireframe drew it available) |

## Screenshots (`reviews/media/R1/tree/`)
- `tree-en-available.png`: Fight page, EN. Killing Spree selected and available.
- `tree-tr-locked-by-rank.png`: TR, Wall Breaker selected: "Güç 6 gerekir (sende 4)", Learn disabled.
- `tree-tr-not-enough-sc.png`: TR, Shockwave selected with 0 Street Cred: rank is fine, Learn disabled, warning line.
- `tree-tr-respec-confirm.png`: TR, after learning Killing Spree (Street Cred 7 to 6) and one tap on respec.
- `tree-tr-street-respec-used.png`: TR, Street page after the respec was used (Street Cred back to 11, link disabled). Shows İyi İsim, Hızlı Parmaklar, Kedi refleksi with the correct Turkish capitals.
- `tab-strip-tr.png`: the five-tab strip.

## Proposed text (not covered by your "ok")
These are my drafts. TR is yours to rewrite.
| Key | EN | TR |
|---|---|---|
| tab.tree | Tree | Yetenekler (owner, 2026-11-12; was Ağaç) |
| tree.tier | {attr} · tier {n} | {attr} · {n}. Seviye (owner, 2026-11-12) |
| tree.short | Not enough Street Cred | Yeterli Sokak Tecrübesi yok (owner: no balance in it) |
| tree.respecConfirm | Respec? Refunds {n} Street Cred. Tap again to confirm. | Sıfırlansın mı? {n} Sokak Tecrübesi geri gelir. Onaylamak için tekrar dokun. |
| tree.bond.locked (screen-reader label of the disabled Bond tab) | Kaan joins at level 20. His perks are earned by playing together, never bought. | Kaan 20. seviyede katılır. Yetenekleri birlikte oynayarak kazanılır, satın alınmaz. |
| tree.pick (unused for now) | Tap a perk to see what it does. | Ne işe yaradığını görmek için bir yeteneğe dokun. |
| attr.panelNote (changed) | When a training bar fills, you can raise that attribute from here. Spend Street Cred to learn perks in the Tree tab. | Gelişim çubuğu dolduğunda bir özelliği buradan geliştirebilirsin. (owner) Sokak Tecrübesi ile Yetenekler sekmesinden yetenek öğrenirsin. (my wording) |

## Deviations
- **Entry point:** the wireframe has a bottom "Squad" tab with a Tree | Gear segment. The prototype has neither, so the tree is a fifth tab in the map's existing tab strip.
- **Touch targets:** nodes (64 px tall), page buttons, Learn and the respec link are 48 px or more. The map's tab strip is 32 px tall (existing, not changed by me).
- **Bond tab:** visible and disabled (no Bond page yet; step 4).
- **Cost on the node:** `◆1` is a short form of "1 Street Cred"; the full words are in the detail panel and the node's `aria-label`.
- No pulse on a newly learned node under reduced motion (the existing reduce-motion rule covers the pop animation).

## Known issues
- `tools/meta-preview.html` was already broken before this step (it loads too few scripts: `P.CFG.skills` is undefined there and the map fails to build). I added the new scripts to it but did not repair it; screenshots came from the real page (`index.html`) with `P.Meta.open()`.
- `tree.pick` is defined but not shown anywhere yet.
- `test-arsenal.js` full run (over 10 minutes) not repeated.
- Q7 (seven doc conflicts, including `attributes.md` section 3) is still open.
- Reviewing the screen on a real phone is still to do (frame time and thumb reach).

## Proposed next steps
Step 4: the Kaan bond (meter fill, the L20 join, the Bond page). Step 5: telemetry (perk learned, respec, Street Cred balance). Before that, your TR for the six proposed strings above, and a go or no-go on the two-tap respec.

---

# R1-T5 step 4: the Kaan bond and Tackle & Stab

Owner answers used: Kaan joins at **L20** (D-045); the bond fills **per level plus the join** (no Kaan body in the sim); the combo ultimate is **Kaan's tackle, then Arda's stab**. Screenshots are in `reviews/media/R1/bond/` (390x844, headless browser, seeded save).

## Done
| Item | Change |
|---|---|
| Bond rules | New `js/config-bond.js` (pure): `P.CFG.bond.kaan` (every number) and `P.Bond.joined / tier / gain`. Earned by play only; never costs Street Cred; never sold |
| Earning (slice) | The first clear of L20 joins Kaan (+5). Each first clear after it gives +4, +1 more for 3 stars, +2 more on a boss level (L25, L30). A repeat clear gives +1. A loss gives nothing. First clears of L20 to L30 add up to **49 at 2 stars** and **59 at 3 stars**, so bond 50 needs one 3-star clear or one repeat clear: the combo ultimate arrives around the end of the slice |
| Save and results | `meta-data.js`: gain is applied in `apply()` (meter in `bonds.kaan`), returned as `pending.bond.kaan` (gain, value, thresholds crossed, joined). `M.bondState()`. The loadout carries `bonds.kaan` (0 before he joins, whatever the save says) and `bondHpPct` |
| Threshold 25 | **Kaan's Watch:** +3% max HP (`auraHpPct`; two Grit ranks), added in `applyLoadout` |
| Threshold 50 | **Tackle & Stab** (`C.ults.tackle`, unlock needs bond 50 and journey level 21). Kaan charges 8 m toward the nearest active enemy in 0.6 s (else straight up), shoving and stunning 1.0 s everything in a 1.6 m lane (bosses are shoved, never stunned); then the stab hits everything within 3.5 m of where he stops for 80 damage. Same charge bar, button and slot as the other ultimates. `skills.js`: `ultTackle`, `tackleHead`, `tackleStab`. A locked or unequipped one falls back to Nazar |
| Arsenal | A bond ultimate shows "Kaan bağı 50 olunca açılır" / "Unlocks at Kaan bond 50" instead of a kill count |
| Bond page | `meta-bond-ui.js`, drawn inside the Yetenekler screen. The Bond tab is disabled ("Bağ · L20") until Kaan joins, then enabled. Kaan's meter with ticks at 25, 50, 75, a row per threshold (reached, not yet), 75 and 100 as "a later chapter", Mila and Ada as locked teasers, and "Bond fills by playing. It is never sold." No cost, no store link |
| Map toasts | After a level: "Kaan ekibe katıldı!" on the join, "Kaan bağı +4", and one more when 25 or 50 is crossed |
| View | `skills-fx.js`: the banner, a dashed lane, Kaan running along it (a green-shirt figure) and a gold ring and shake at the stab |
| Tests | New `tools/test-bond.js` (61 checks): meter maths, join, caps and thresholds, the 49 and 59 totals, save integration, the 25 aura, the 50 unlock and equip, the sim (stab, shove, stun, boss never stunned, out-of-lane untouched, fallbacks, aura HP), strings. Mutation checks: removing the stab damage or the stun makes checks fail. `test-tree` 165, `test-meta` 122, `test-perks-*`, `test-dialogue`, `test-ceiling`, `test-feel` pass |

## Screenshots (`reviews/media/R1/bond/`)
- `bond-tr-30.png`: the Bond page at bond 30 (aura reached, Tackle & Stab not yet).
- `bond-ult-locked-tr.png`: Arsenal, "Çelme & Bıçak, Kaan bağı 50 olunca açılır" (the panel was scrolled, so the title screen shows below it).
- `bond-tackle-charge.png`: L22 in play, 0.18 s into Tackle & Stab: Kaan running up the lane, enemies knocked back, the banner. The DEPAR button also fits (it was an open check).

## Proposed text (owner: "go with your recommendations", 2026-11-12, so these drafts stand; TR can still be rewritten)
| Key | EN | TR |
|---|---|---|
| ult.tackle (name, HUD) | Tackle & Stab (TACKLE) | Çelme & Bıçak (ÇELME) |
| ult.tackle.desc | Kaan charges the nearest enemy, knocking down and stunning whatever is in his way. Arda stabs where he lands. | Kaan en yakın düşmana atılır, yoluna çıkanı devirip sersemletir. Arda indiği yere bıçağı saplar. |
| bond.t25 | Kaan's Watch: +3% max HP. | Kaan Kollar: Canın %3 artar. |
| bond.t50.desc | A new ultimate. Equip it in Arsenal. | Yeni ulti. Silahlar sekmesinden seç. |
| bond.later | A later chapter / Not unlocked yet. | Sonraki bölüm / Henüz açılmadı. |
| bond.soon (Mila, Ada) | Not yet | Henüz değil |
| bond.meter | Bond {n}/{max} | Bağ {n}/{max} |
| bond.hint | Bond fills by playing. It is never sold. | Bağ oynayarak dolar. Satın alınmaz. |
| bond.joined / gain / reached | Kaan joins the squad! / Kaan bond +{n} / Kaan bond: {name} | Kaan ekibe katıldı! / Kaan bağı +{n} / Kaan bağı: {name} |
| ars.ultNeedBond | Unlocks at Kaan bond {n} | Kaan bağı {n} olunca açılır |
| tree.page.bondOn | Bond | Bağ |

## Deviations
- **No "kills near Kaan" and no dialogue choices.** Kaan has no body in the sim, and the prototype has no dialogue choices, so two of the three sources in the design doc (section 6) are not built. I also dropped the "high kill count" bonus I first described: stars and boss levels carry it.
- **Numbers are mine.** The thresholds (25, 50, 75, 100) are from the doc. The earning amounts, the +3% aura and every Tackle & Stab number are proposed. `content-catalog` lists Kaan's own ultimate as Ground Slam (3.5 m, 80 damage, stun 1 s); I took its 3.5 m and 80 for the stab.
- **Rule 2** (half an attribute rank) is for perks, so I did not apply it to the bond aura. +3% is two Grit ranks; say if you want it at the half-rank value (0.75%).
- **Bot sim not rerun.** The bot's typical loadout has no bond, so the L1 to L30 bands cannot move; the aura (+3% HP) and the new ultimate only exist for a real save after L20.
- **Doc conflict h (new, yours to decide):** `content-catalog.md` makes L30 a story fight against Kaan that ends with "Kaan joins". With him joining at L20, what happens at L30? I only fixed the one `game-design.md` row that said "after Kaan joins (L30)"; the L30 boss text and `hero_kaan` "Slice (L30)" are unchanged.
- The mid-charge screenshot was frozen by pausing the animation loop right after the cast, because a normal screenshot lands after the 0.6 s charge.

## Known issues
- No EN screenshot of the Bond page (strings are covered by `test-bond`).
- The HUD ultimate button is the same generic eye icon for every ultimate.
- Telemetry (`bond_threshold`) is step 5.
- A bond ultimate is equipped by hand in Arsenal; nothing equips it for you when it unlocks.

## Proposed next steps
Step 5: telemetry (`perk_learned`, `perk_respec`, `bond_threshold`, plus `currency_flow` for Street Cred), with an event dump from a bot run, and the final T5 packet. Owner decisions on this step (2026-11-12, "go with your recommendations"): the +3% aura stays, the proposed TR text stands, and conflict h (what L30 is once Kaan joins at L20) is parked until the T7 story-density review, since that table writes the Kaan beats for L1 to L30.

---

# R1-T5 step 5: telemetry (and the end of T5)

## Done
| Item | Change |
|---|---|
| Hook | `meta-data.js` reports through `P.Meta.onTel(event, fields)`. `main.js` points it at `P.Tel.log`, so the events go into the same in-memory log and JSONL export as the rest. No hook, no event, and the save is identical either way (tested) |
| `perk_learned` | `perk_id`, `cost`, `attr_rank`, `sc_after`. Not logged when a learn is refused |
| `perk_respec` | `refunded`, `perks_cleared`, `chapter`, `sc_after`. Not logged when refused |
| `bond_threshold` | `companion`, `threshold`, `value`, `level_id`. Once per threshold crossed, not on repeat clears |
| `currency_flow` (Street Cred) | `currency: street_cred`, `delta`, `source_or_sink` (`level_end`, `perk_learned`, `respec_refund`), `balance_after`. These are every Street Cred earn and spend, so the sum of the deltas equals the saved balance (the campaign checks it) |
| `meta_upgrade` | `type: attribute`, `id`, `cost: 0`, `points`, `rank_after`, one per attribute raised with READY points. "attribute" is not in the game-design list of types; I added it and updated the table |
| Event dump | New `node tools/bot.js --campaign=30 [--out=file.jsonl]`: the bot plays L1 to L30 **in order through the real meta layer** (the loadout comes from the save, so learned perks, bond and attributes are in play), results go through `onResults`, it spends READY points and learns the cheapest affordable perk between levels, and it respecs once at L12. L1 is scripted, so it is recorded as a win. Stars: 3 without a death, else 2. Output: `reviews/telemetry-R1-T5-campaign.jsonl` (127 events) |
| Tests | New `tools/test-tel.js` (19 checks): fields, balance matches the save, refused actions log nothing, level-end earn and bond crossings, attribute spend, and the save is identical with and without the hook. Removing the two Street Cred flows makes it fail. `test-bond`, `test-tree`, `test-meta` and a plain `bot.js --level=2` still pass. In the real page, learn, learn, respec logged 6 events through `P.Tel` |

## What the campaign showed (seed 1, one try per level, all 30 levels won)
- **Events:** 55 `currency_flow`, 42 `meta_upgrade`, 27 `perk_learned`, 1 `perk_respec`, 2 `bond_threshold` (25 at L24, 50 at L29).
- **Bond:** Kaan joins at L20; the meter is 58 at L30. With the bot's 3-star clears, Tackle & Stab unlocks one level before L30.
- **Perks:** 18 perks learned by L30 (the tree has 24; the bot ends with 0 Street Cred).
- **The 500-kills-per-level assumption is far too low for this bot.** L2 to L30: median **2,021 kills a level**, mean 2,266, range 642 to 6,779, **65,714 in total**, which is 40 Street Cred on the current curve (32 at 50,000 kills, 54 at 100,000). A real player kills less than a kiting bot, so this is an upper bound, not the answer. The Street Cred budget in `skill-tree.md` 4.4 still needs real play data (the telemetry above is what will measure it).

## Deviations and known issues
- **Coins (Jeton) and the other spends are not logged.** `currency_flow` covers Street Cred only. Coin earn at level end and the gear, mastery and merge spends (`meta_upgrade` types gear, mastery, merge) are not built. The tables in `game-design.md` and `skill-tree.md` say so.
- The campaign's stars are an approximation, and its learn order is "cheapest first", not a real player's choice.
- The campaign runs the real sim for 29 levels and takes about 10 minutes on this machine.
- The dump is not sent anywhere; events stay in memory and go out through the pause-menu export, as before.

## T5 wrap-up (cross-level skill tree and progression)
All five steps are built and tested: the data and save (step 1), the 24 perk effects (2), the Yetenekler screen (3), the Kaan bond with Tackle & Stab (4) and telemetry (5). Owner decisions are recorded in D-059. Still open on T5:
- **Q7:** seven doc conflicts (a to g) in `skill-tree.md` 2.1, plus item h (what L30 is once Kaan joins at L20, parked for the T7 review). Q7 is waiting for your yes or no.
- **Real-play data** for the Street Cred budget (see above).
- The bot bands for L1 to L30 were checked after step 2 and not rerun since; perks and the bond are not in the bot's expected loadout.
- Phone checks: frame time and thumb reach of the Yetenekler screen.
- Proposed text you have not read yet: nothing new in this step (the events have no player text).

# R1-T4 part 19: phone playtest 2 fixes and the no-art variety pass (2026-11-14)

**Telemetry read (owner file, 107 events, 2 sessions).** One full level: H01-L2 won in 258.5 s with 1902 kills and 3 stars, 9 Adrenalin level-ups at 22, 39, 55, 81, 111, 145, 199, 249 and 286 s. Frame p95 17 ms with up to 107 enemies alive; the worst sample was 39 fps and 34 ms. The next level was quit after 3 s, and a later session failed the cart objective at 9.5 s. `level_end` carries no HP or death data yet, so challenge cannot be read from it.

**Fixed.** Music and effects on iPhone (the silent switch muted Web Audio; `navigator.audioSession` playback plus a silent element fallback, any touch retries the unlock, `?fps=1` shows `aud <state>/<session> m:<track>`); the stick spawns anywhere by default; first-run map robust; fonts; streak words (one per 25 s, KIRIM is VAHŞET); telemetry persists across reloads and the export button is also in Settings; `tools/serve.py` stops Safari caching.

**Variety pass (view only, no new art files).** Arena: per-level and per-hood treatment, light drift, accumulating debris and decals, boss grade (`arena-evolve*.js`). Enemies: 16 types with distinct silhouettes and accents, 4 walker outfits, 5 distinct brute bosses (`art-enemy-look.js`, `art-enemy-bosses.js`). Weapons: 5-level tier table, 17 base and 18 evolution silhouettes, per-class impact sparks, hero halo (`weapon-tiers.js`, `weapon-sil*.js`). Tests: `test-arena-evolve`, `test-enemy-silhouettes`, `test-weapon-tiers`.

**Open.** Hoods 6, 10, 11, 13, 15 have floors darker than stone_grey (L* 33 to 40, older than this pass). Arena frame cost is about +1% to +9% p95 in a loaded headless run and is not measured on a device. Colourblind palettes are not implemented in the view, so nothing was checked. Evolution slow-mo is Level 1 only. Boss arms may clip their sprite cell.

# R1-T5 part 20: the ChatGPT art in the game, behind `?art=raster` (2026-11-14)

**How to see it.** Serve the prototype (`python3 prototype/tools/serve.py`) and open `http://<mac-ip>:8765/?art=raster&fps=1&debug=1` on the phone. Raster needs http (a `file://` page cannot fetch the manifest). Without `?art=raster` the game is unchanged and the code art draws; anything missing or still loading falls back to the code art.

**Built (view only, the sim is untouched).** `art-raster.js` (manifest and atlas loader), `art-raster-chars.js` (hero, enemies, elites, corpses, bosses), `art-raster-world.js` (ground, facades), `art-raster-items.js` (props in 17 hoods, 7 vehicles, XP gems, consumable icons, splats, card and HUD icons). Importer: `prepare-art.js` (212 files, 27.6 MiB of the 60 MiB budget, 0 rejected). Tests: art-raster 92, world 47, items 84 checks, plus the existing view suites.

**Deviations.** Ground seams: one variant per level and role as a 4x4 mirror-repeat super-tile instead of mixing variants per cell (mixing left block seams). Night paving gets a warm screen lift at bake time (hoods kapalicarsi, halic, yenikapi were median luma 72 to 94, now 109 to 123). Live weapon shapes, hit sparks and held poses stay procedural; the tier sheets only replace the weapon icon and body.

**Regenerate list (ChatGPT).** boss_vatman and boss_bigbro at 512 (upscaled now); boss attack and hurt frames are 66 to 84% of idle height, so bosses shrink on windup and hit; gnd_halic_steps (visible seam) and the feature tiles (stairs, deck, zindan, cycle lane, pontoon, rails) need a seam check; body-only weapon tiers (the baked trails swamp the silhouette at 40 px); the tram (about 2.7:1 on screen against the 4.3:1 prompt); istiklal bin, bollard and barrier props; grip anchors for held weapons; the vehicle pivots sit off-centre.

**Open.** Raster decodes to about 85 MB for characters alone, above the 64 MB sprite budget: not measured on an iPhone, test with `?fps=1`. The skin outfits (fisher, musician, hamal) lose their outfit under raster. Regular enemies have no attack frames. Boss corpses use the archetype corpse. Feature tile placements (zindan, quay, seawall, lawn, wateredge) are guesses from their names. Layout zone floors still use the SVG walk art. Pre-existing and not touched: `objectives-hud.js drawMarkers` reads `R.cam` before the first frame in a story run.

## Owner items recorded at handoff (2026-11-14)

Recorded by the handoff audit from the owner's own chat messages (times are UTC; the full text is in reviews/owner-messages-archive.md). Add the next owner item that has no other home to this section.

- **Random zoom and sprint (2026-11-09 03:03).** He said the random zooming and sprinting animation "doesn't make any sense" and makes the game feel broken. He asked for more meaningful animations and wow factors. Status: no removal recorded. The only zoom left is the death beat (line 708). Next: remove the random trigger and propose replacements for him to approve.
- **Upward shot (2026-11-09 18:22 to 18:58).** One weapon pointed up looks wrong in one direction (his screenshot). He asked whether to restart the server, and asked for a complete fix in all directions. Status: no fix and no answer to the restart question recorded. Next: fix it, check every direction with a screenshot, and answer the restart question.
- **Porter booth name (2026-11-10 20:13 and 20:16).** Turkey has no porter booth. He first wrote "güvenlik kulübesi", then chose "kapıcı kulübesi". Use "kapıcı kulübesi" for the booth. Recorded here because reviews/dialogue/tr-proposals-2.csv is git-ignored and its columns are per dialogue line, with no booth row. Next: use the name in the Ataköy booth text.
- **Ataköy closing line (2026-11-12 08:15).** He wrote: "Ataköy macerası bitti. Şimdi Sarıyer yolculuğu başlıyor. Mila ile birlikte <3". It is not in the repo and has no line ID. Finale lines are in prototype/js/story/finale-data.js and prototype/js/dialogue/tr/finale.js (not under reviews/dialogue). Next: give it a line ID and add it to the finale set.
- **Dash name (2026-11-12 17:37).** The Turkish dash word is "Depar" everywhere. The stampede event "KAÇIŞ!" is a different thing and stays. Docs were renamed on 2026-11-14 (content-catalog, weapons-skills, attributes, audit 3 note). docs/product.md D-031 is updated by another agent.
- **HUD at 150% (2026-11-13 18:45).** He accepted the shrunken objective title. Closed.
- **Several songs at once (2026-11-14 04:56).** He heard two or more songs at the same time, and the sound effects were hard to hear. prototype/js/view/music.js line 11 says one track at a time. Status: open. Next: reproduce on the phone with the Suno files.
- **Map screen after Start (2026-11-14 04:56).** Recorded in docs/handoff-codex.md section 5 as the first-run map fix. No phone check recorded.
- **Game stops responding (2026-11-14 04:56).** Recorded in docs/handoff-codex.md section 5 as the stick fix. No phone check recorded.

## Phase 0.1 · Integrate the prototype into main (2026-11-14)

- The owner approved [PR #1](https://github.com/onderozbek-max/projectistanbul/pull/1). GitHub `main` now points to merge commit `4f5361d`, with tested commit `2070211` as a parent.
- The full `prototype/tools/run-tests.sh` run passed all 36 test groups on this Mac. The first-run map check passed on retry. All 615 local-source checksums matched.
- The Chrome world-art test reproduced the known on-screen objective error at L6 and L31. It records the error as a known issue and passes. The fix remains in Phase 0.5.
- D-051, D-066 and D-067 remain proposed. Phase 0.2 is the scripted iPhone baseline with the current and new artwork. The device benchmark and silent-switch audio check are pending.

## Phase 0.2 · iPhone test links ready (2026-11-14)

- Open the [current artwork test](http://192.168.4.21:8765/?bench=1&lang=en) and then the [new artwork test](http://192.168.4.21:8765/?bench=1&lang=en&art=raster) in Safari on the same Wi-Fi as the Mac. Tap **Start test** on each page and leave it open until it finishes. After both tests, tap **Save test results** on the second page and share the file with the iPhone model and what you heard.
- Each link runs the L1 opening, L5 boss and an L6 crowd held at the 200-enemy cap. Each scene has three warm-up seconds and 60 measured seconds. A fixed seed, scripted movement and a fresh loadout make the two runs comparable. Test runs grant no progression or rewards. Backgrounding interrupts the run and offers a restart.
- The download contains both sets of results and records median and 95th-percentile frame intervals and work time, samples at the enemy cap, peaks for live and drawn enemies, quality tier, and audio state. The graphics estimate counts the main canvas, loaded raster atlases and the sprite cache. Whole-page memory is unavailable in the Safari page itself and requires a separate Web Inspector capture.
- Desktop verification passed 11 affected test groups, the strict dialogue guardrail check, and a Chrome smoke check through both shortened runs and one six-scene export. The full-length fixtures also passed in the simulator. Chrome drew all 200 enemies in both variants.
- The owner completed both runs on iPhone Safari, iOS 18.7. See the results below. New Turkish test labels are available for owner review.

## iPhone baseline and street art follow-up (2026-11-14)

Both phone runs completed with 200 enemies drawn in the crowd scene. Figures are frame intervals in milliseconds, with a larger number meaning a slower frame. [Sanitized capture](telemetry/2026-11-14-iphone-art-baseline.jsonl)

| Scene | Current artwork p50 / p95 | New artwork p50 / p95 |
|---|---:|---:|
| L1 opening | 17 / 17 | 17 / 17 |
| L5 boss | 17 / 17 | 17 / 17 |
| L6 crowd at 200 | 23 / 40 | 23 / 37 |

- At 200 enemies both versions spent most of the run at reduced visual quality. The new artwork was slightly faster in the slowest frames on this run. Both are above the proposed 16.7 ms Gate A threshold. The device model and whole-page memory were unavailable in the capture. No platform decision is implied.
- The brown patch in the second screenshot was the old code-drawn bay-window landmark over the sidewalk. In raster mode, the revised İstiklal and Galata building fronts follow the sidewalk edge with their upper storeys extending outward. The old facade billboard yields when the matching front is ready. İstiklal's legacy door shapes now fit at the base of the wall. The tram transforms its illustrated wheel line onto the track and sizes the body to its footprint.
- Phase 0.3. Rebuilt and verified all 31 character atlases. At four bytes per decoded pixel they total 21.83 MiB, down from 85.09 MiB and under the 25 MiB target. Arda, a walker and Vatman retained their proportions and outlines in the phone-size comparison. The original source checksums all matched. The visible crowd path now skips unused procedural sprite work for loaded raster art and makes fewer canvas state changes.
- Phase 0.5. Objective markers wait for the current scene's camera before projecting. Chrome coverage now fails on any previously allowlisted objective HUD exception. Both original phone runs reported a running audio context while the boss track never started. On iPhone the Start gesture now primes that track silently through Web Audio. A targeted playback test passed under simulated per-track gesture restrictions. Actual boss playback and the silent switch are pending an iPhone retest.
- First-session clarity. The Turkish and English hack prompt now tells players to stay in the ring. The link mechanic and rewards stay as specified. No balance numbers changed.
- Desktop verification. All 16 importer checks passed, including a clean rebuild of 212 assets. The full prototype run passed 35 of 37 groups. The hint check passed after shortening the English copy, and its dialogue and objective-string checks passed too. The browser's first-run map and download check passed on an isolated rerun. The strict raster world browser check passed across all six hoods without the old objective HUD exception.
- Local preview. [Updated artwork phone test](http://192.168.4.21:8765/?bench=1&art=raster). The working copy combines the capture and follow-up so the owner can see the changes on the same Wi-Fi. D-051, D-066 and D-067 retain their proposed status.

## Second iPhone capture and perspective follow-up (2026-11-14)

The owner supplied three new raster samples from iPhone Safari. The export also includes the earlier capture. [Sanitized retest](telemetry/2026-11-14-iphone-raster-retest.jsonl)

| Scene | First raster p50 / p95 (ms) | Retest p50 / p95 (ms) | Retest graphics estimate (MiB) |
|---|---:|---:|---:|
| Opening | 17 / 17 | 17 / 17 | 31.0 |
| Boss | 17 / 17 | 17 / 17 | 46.8 |
| Crowd at 200 | 23 / 37 | 26 / 39 | 61.5 |

- Peak estimated graphics memory in the crowd fell from 81.4 MiB to 61.5 MiB. The p95 frame interval still exceeds the Gate A target. Safari did not report whole-page memory. The boss track started on the retest. That build recorded the requested track and its playback flag, so the export cannot show which other songs were audible.
- The restaurant cutaway now has a paved doorway, a sign mounted on the wall and furniture with shallow sides and ground shadows. The İstiklal and Galata walls feature cropped street-level fronts and roofs within the building footprint. The tram now uses an overhead drawing aligned with the rails and retains the red body and cream roof. These are rendering changes with no changes to the room, door or track collision geometry.
- The street now uses the calm recording alone. Scene changes silence the old track before the next one fades in. The intense recording stays available as an alternate take. Benchmark audio entries now list each audible music track. D-069 records the proposed direction for owner review after a phone test.
- Phone-size Chrome captures covered the restaurant, doorway, street and tram. Chrome played the street and boss tracks in sequence. The world art, item art, benchmark, quality, canvas accessibility and dialogue test groups passed. Playback tests also covered rapid scene changes, returning from the background and simulated iPhone gesture restrictions. All 615 commission source checksums matched. The audio importer's separate synthesis check hit a temporary disk-space limit on this Mac. The phone has yet to run this revision.

## Hero arms and the restaurant corner (2026-11-14)

- The painted Arda frames already include his sleeves and hands. The renderer now places the knife, nail gun and held weapon animations at the painted grips. Grip positions are measured per frame and follow the sprite's mirroring and motion. The nail-gun flash starts at the barrel. The procedural figure still draws its own arms.
- The adjacent shop row ends in a masonry side wall across a short paved forecourt. A planter marks the part of the forecourt outside the playable sidewalk. The existing doorway and walkable area use the same coordinates as before.
- Verified the doorway from inside and outside at phone size. Captured Arda standing and firing in four directions. The character and six-district world-art checks passed in Chrome, and the quick weapon suite passed. A separate drawing smoke run exercised both painted and procedural grips. The six-district test used a smaller browser cache and skipped saving duplicate screenshots because the Mac was low on disk space.

## Restaurant and neighboring roof projection (2026-11-14)

- The paved setback separated the footprints in the previous pass, but the flat cutaway wall and the cropped neighboring facade still suggested different camera angles. The sign read as part of the cut edge and the softer facade made the join more visible.
- The first building now has visible street and end walls that meet its roof at the projected corners. The restaurant entrance uses the same direction of height, with a lintel and sign above a flush threshold. Both drawings are cached at the same backing resolution. The entrance position and walking bounds still come from the existing level.
- Reviewed the corner at phone size from inside, at the threshold and along the sidewalk. The raster world unit checks, raster browser checks, quality and canvas accessibility checks passed.

## Illustrated storefront join (2026-11-14)

- The rebuilt corner and illustrated İstiklal walls share the same roof-to-street projection. The end of the illustrated block beside the corner now turns the source artwork around a visible end wall. The sidewalk-side base stays on its original line.
- The three-window box was the old `cumba` dressing prop, a projecting bay window. Projected storefronts skip the detached prop. In the phone-size browser preview it no longer appeared over the illustration.

## Combat direction and playtest analysis (2026-11-15)

- The owner set Hades as the combat look-and-feel reference. The active execution plan now records a proposed playable weapon and boss comparison, with local playtest analysis alongside the run-outcome work. The saved iPhone exports in `reviews/telemetry/` contain scripted benchmarks, so the player behavior baseline needs ordinary runs.

## Local prototype improvements · 2026-11-15

- **Run recovery.** Wins settle before the ending and carry a saved recap that stays available until the map presents it. Recent run IDs prevent repeat callbacks from paying twice. Quitting keeps the displayed share of Jeton, while Restart discards the run's Jeton. The win screen's Hurda now goes into the player's saved balance. Save tests recovered the previous valid backup from a malformed primary record. A fresh-browser check exercised the outcome routes, a single Jeton and Hurda payout after a duplicate result event, the Continue label and chapter count, and the recap after reloading during the ending. The free playtest revive can be used once per run, with the next death settling as a loss.
- **Combat and first run.** Arda leans into the knife cut and braces away from the nail gun's recoil. The painted hands anchor both weapons. The saw remains visible during a rev while the nail gun keeps its muzzle cue. The sledgehammer follows through on the actual impact event, which drives its sound, dust and ground effect. A browser check observed the real half-second windup and synced follow-through. Vatman points toward his committed charge lane. The wet-ground arcs show which enemies the current reaches. These are a first pass using the shipped sprite frames. Dash is a button and uses the current steering direction. Crates reveal ordinary upgrades immediately, show fork effects before selection, and require a Continue tap after a fork choice. The active skill shows Ready, Active or the remaining seconds. The ultimate label reflects what the selected level actually grants. Low-health pulsing now uses the same flash limit as the other effects.
- **Playtest evidence.** The local report groups ordinary runs by build and level, deduplicates repeated downloads, and tallies choices, terminal retries, objectives and exits. It records when a page was left during an open run and counts music transitions with multiple active tracks. Its input so far is nine scripted iPhone scenes and synthetic browser runs. The first-session test script is in [PLAYTEST-SCRIPT-R1.md](PLAYTEST-SCRIPT-R1.md).
- **Readability and access.** The Level 5 bonus explains when its timer starts, then shows the clock beside boss health during the fight. The bridge objective wraps at 150% text size. Opening a weapon upgrade's details preserves the choice and closing them restores focus. Returning from Settings restores focus to the Pause menu. Nearby attack warnings and active tutorial instructions take priority over ambient speech. The color vision presets were checked on a narrow phone viewport at 150% text, including saving, focus and rendering of warning, player, XP and healing cues.
- **Permanent upgrades.** After the first clear, the map can take players directly to unspent attribute points and then to a perk their current ranks and Street Cred can afford. A first-clear fixture used the actual point allocation and perk purchase in Chrome at 150% text. Back restored focus each time and Play stayed available.
- **Difficulty.** In 12 paired runs at expected power, moving Level 9's boxes from a 4 m side offset to 2.2 m raised clears from 11 to 12 and clears without falling from 2 to 11. Both layouts completed the optional objective twice. Closer boxes lowered normal clears with basic gear from 8/8 to 6/8. Intermediate offsets of 3.0 m and 3.4 m cleared 6/8 and 5/8 with basic gear, so the build uses the original placements. On Level 17, moving the lines toward the middle went from 5 to 6 clears and lost both no-death clears. Reducing the route weight of heavier enemies from 0.40 to 0.20 gave 10/12 clears at expected power versus 5/12, with 3 clears without falling versus 2. Both mixes cleared 1/12 with basic gear. The local build uses that mix for Normal Level 17 and points to one nearby fishing line at a time. Six-seed screening gave 2/6 clears each at Levels 18, 19 and 28 and 3/6 at Level 29.
- **Verification and release.** The 615 commission checksums matched. Chrome ran the opening, boss and a 200-enemy crowd in both artwork modes and exported all six shortened runs. The new fast local suite ran in about 13 seconds. The art tool split produced byte-identical output for all 419 art prompts, both order files and the tracker. All 348 sound cue variants rendered byte-identical samples at 22,050 Hz after their source split. The prior iPhone retest reported the boss track playing and a 39 ms frame interval in the slowest 5% at 200 enemies. The next phone run needs to check the new effects, touch controls, crowd speed and the reported music overlap. The platform and TestFlight decision still needs that evidence. The provenance ledger identifies the eight imported Suno tracks and the active effects manifest, with account-level usage records pending.

The opening cleared in 12/12 automated attempts, 9 without falling, with a median of 2:35. The separate six-seed screen of Levels 2 to 30 found the largest drops on Level 23 (1/6), then Levels 14, 18, 19 and 28 (2/6 each). Level 3's cart defense and Level 7's escort went 0/6 on the optional objective. These are automated outcomes with preset equipment, so use them to choose where to observe real players. The campaign smoke check uses a scripted Level 1 reward record, then runs the remaining levels through actual settlement and spends earned ranks and perks. It moves on after a retry even if a level is still blocked. Across the full chapter it recorded 95 wins including the scripted opening, two losses at 14 and 18, and three timeouts at 43, 69 and 89. Level 100 cleared on this seed and the Street Cred ledger matched the saved balance. A repeat on the final build through Level 30 matched all 30 rows, including both losses.

The Level 28 roster trial raised expected-power clears from 4/12 to 7/12 overall, but went from 2/6 to 1/6 on the second batch and from 1/8 to 0/8 with basic gear. The Level 23 trial raised expected-power clears from 3/12 to 6/12, with 2/6 on both versions in the second batch and 0/8 on both versions with basic gear. Keep their current roster mixes pending playtests and investigate route geometry and upgrade use. The simulator now honors `--from` when running a named level so follow-up batches can start at different seeds.

Two fresh expected-power checks on the later sentinels both reached the final Level 43 segment and completed the optional boat objective. One then timed out. At Level 100 both cleared after using a revive. One death happened on the opening route and the other during the boss fight. Keep both as later pacing checks.

The Night Shift defeat screen now promises the full share it actually keeps. A browser check recorded a single 40-Jeton payout plus the first shift's 70-Jeton daily pay, with zero scrap and Normal progress untouched. The audio preparation test hit a disk-space limit while writing raw intermediate audio. Feeding the same samples directly to FFmpeg eliminated that temporary file. The full music test passed afterward, and both implementations produced byte-identical victory audio from the same source.

All 37 prototype test groups passed across the full run and isolated retries. The first-run map check passed on retry. World-art and music hit low temporary disk space in the full run. World-art passed all 50 checks after moving screenshot writes after Chrome cleanup. The full music test passed with smaller lossless inputs that exercise the same durations. The six requested art, font, quality and dialogue groups passed together. `git diff --check` and the commission checksum verification passed.

Before TestFlight, run the updated browser build on the reference iPhone, check the reported song overlap and crowd slowdown, then choose the iOS build path. Run the first-session script with new players and use their reports to prioritize the remaining Level 1–30 balance work. The art and music account records are still needed for the release provenance audit.

### 2026-11-15 · İstiklal phone playtest follow-up

- Normal İstiklal now shows the current destination and distance independently of the optional objective. Bölüm 3 passes a stopped tram, crosses the plaza and ends at the exit. The tram has one fixed solid footprint and the new shelter uses the existing footprint. The end-of-run recap explains which progress carries forward.
- The first signal cart waits for Arda before it takes damage. Its ring shows the upload, and completing it confirms the message and the coin bonus payable at the finish. A missed bonus clears its action prompt. Standalone phone terminals show progress and confirm completion. The health bar uses integers and the Dash button accepts a second touch during movement.
- Upgrades from route crates now appear on the street. Picking one up plays a short skippable opening with a reduced-motion alternative. The standard music mix was lowered so weapon and pickup cues have more room.
- The tall shapes that appeared to drift came from the scrolling skyline layer. İstiklal omits that layer and Galata Tower is fixed at one position on routes that feature it. A small music display replaces the large repeated stalls, while İstiklal benches follow the street grid. The yellow doorway warning is now drawn as a partially open dark doorway.
- Varyoz uses one held wind-up, including the second slam at higher ranks. Pürmüz has a defined nozzle and fan of curved flames. Ateş Şişesi leaves a separate pool with layered fire, and Frenzy has a steady warm tint and a faster-attacks label. Weapon details show the base cooldown at that rank. The full weapon and enemy animation pass remains open.

**Deviations**

- Normal Levels 2–5 have 24 opening spawn-budget units plus 0.9 per new metre north. The Level 5 boss adds have an 80-unit budget. Re-entering the same terminal in Normal İstiklal cannot create a second noise wave. One Level 5 deterministic reference run changed as expected.
- The Level 3 tram sits at metre 42, with the original Level 1 dimensions and room to pass on either side. Its plaza starts after the tram. The first cart has 100 HP and an eight-second upload, compared with the generic cart's 45 HP and 16 seconds.
- Ground chests open from within 1.15 m. The ordinary opening takes roughly 1.1 seconds. At the same slider setting, music gain moves from 0.50 to 0.32.

**Verification**

- Six expected-gear bot runs each yielded 5, 6, 5 and 6 clears for Levels 2–5. A follow-up on the final Level 3 cart yielded six clears without a revive, and all six completed the bonus. A separate standing test exhausted the route's local enemies, then verified that forward movement opens another group and that backtracking does not refill it.
- The phone-sized Chrome run checked the route text, integer HP, second-finger Dash, missed-bonus cleanup, signal terminal and cart completion, the ordinary chest reveal, and both max-rank hammer impacts while other weapons fired. Audio balance, pacing and combat feel still need an iPhone playthrough.
- The opening cleared in six of six automated runs, with four clears without a revive. All six art, font, quality and dialogue test groups passed together. The replay suite passed 271 checks, weapon tiers passed 838, and all 615 commission checksums matched.

**ImageGen prompts and assets**

- `prototype/assets/istiklal/istiklal_stop_shelter.png`, built-in ImageGen. “Isolated game sprite of a small vintage tram stop shelter for a stylized Istanbul action game, entire object on transparent alpha. High three-quarter orthographic camera around 55 degrees above ground, upright edges, front faces frame bottom, roof seen clearly, recognizable narrow muted blue glass panes, charcoal wrought iron posts, low dark zinc cap and warm ivory base, modest weathering. Crisp dark outlines and economical hand-painted cel shading like a comic game environment, readable in a 100px sprite. No lettering, character, scenery, paving, ground patch, cast shadow, or glow. Centered with small transparent margins.”
- `prototype/assets/galata/galata_tower_landmark.png`, built-in ImageGen. “Isolated game sprite of Istanbul's Galata Tower for a stylized action game, entire object on transparent alpha, high three-quarter near-orthographic camera, recognizable slate conical roof, observation gallery, arched windows and warm limestone cylindrical tower. Crisp dark outlines and economical hand-painted cel shading like a comic game environment, architectural silhouette readable in a 120px sprite. Single upright tower, neutral lighting. No text, sky, paving, hills, ground patch, cast shadow, or glow. Centered with small transparent margins.”

### 2026-11-15 · Weapon contact and rank pass

- All 17 base weapons have distinct contact shapes. The 18 evolutions use their own color, size and recoil settings with the related weapon's contact motion. Döner Bıçağı cuts on a diagonal, the nail gun punches a short puncture, Varyoz fractures the ground, and Olta snaps into a hooked pull. Pürmüz burns upward while Ateş Şişesi spreads along the pavement. Ranks 3 and 5 add follow-through to each shape, with recoil at a different strength and pace for each weapon.
- Knife swings and Varyoz strikes now each use a single readable trail or wind-up. Varyoz's target ring follows its actual damage footprint. Overlapping hits from the same weapon share a contact mark locally. Reduce motion keeps a steady shape and gentler recoil. Reduce flashing retains the impact outline and gates the brief bright accents.
- Phone-sized Chrome ran actual attacks for all 17 base weapons at ranks 1 and 5. Six comparisons were captured from real game frames with isolated targets. The focused tests passed for feel, animation, accessibility, weapon tiers, quality, the benchmark and the upgrade UI. The quick arsenal test passed. The tier tests exercise all 35 impact profiles and check that combat produces identical sim state with the effects on or off. Physical iPhone crowd readability and feel remain to be checked.

### 2026-11-15 · Phone weapon comparison

- The Wi-Fi prototype's `?weaponlab=1&art=raster&lang=tr` entry isolates one weapon with 96 seeded zombies and replenishes the crowd. Changing a weapon or rank restarts the same opening. All 17 base weapons can switch between ranks 1 and 5. All 18 evolutions are selectable at their fixed rank. Arda is invulnerable, and the test runs without campaign rewards or telemetry.
- The weapon-lab test compares the starting crowd for every choice and exercises real movement and hits. The input, telemetry, canvas accessibility, progression UI, weapon tier and benchmark tests passed. Phone-sized Chrome checked touch movement, rank switching, resets, and normal title boot. This is ready for the owner's physical iPhone playtest.

### 2026-11-15 · Mac playtest follow-up

- Opening the HTML file directly used the original hero, paving and frontages because the browser could not fetch the raster manifest. Ordinary previews now select the illustrated art. The art importer generates a file-preview index from the same manifest. The benchmark keeps the original artwork for its baseline measurement.
- The oversized fixture was a bookseller's stall painted from straight above. The street-stall family now uses compact, ground-anchored props where artwork is available. The illustrated shelter is used by the shelter recipe and chicane walls have more legible roof edges, window bays and plinths.
- Teal chests have a gold ground outline, a soft column of light, and a floating diamond. Guarded chests have a muted trim. The opening animation uses the same chest. Reduce motion and Reduce flashing make the ground marker steady.
- The results button reads “Map & upgrades”. Both growth pages are beside Play even with zero points to spend. An earned point or available perk highlights its button.
- The Bölüm 3 trial slows new waves around the existing tram between metres 32 and 53. Enemies already chasing Arda still participate. A side ambush and an elite runner appear after the crossing. The runner drops one chest. The existing signal cart and finale remain in the route. Link parameters `?level=3&rhythm=1`. The trial does not award campaign progress.
- Weapon reactions now follow the strike on both axes. Contact camera kicks are rate-limited within big crowd hits and scale with rank. Light attacks against bosses leave the animation running. Heavy hits retain the brief freeze. Combat animations still need a deeper authored pose pass.

**Verification**

- On Mac Chrome, the direct file rendered the illustrated hero, bookseller and weapon-card icon. The same browser exercised the ground chest and reveal, both progression pages, and the quiet section and runner encounter over the preview server.
- Six paired expected-gear Bölüm 3 seeds cleared on each route. The original cleared all six without a revive and the trial cleared five without a revive. Median times were 257s and 258s. All twelve completed the signal-cart bonus. Keep the trial optional for the owner's comparison.
- All 17 focused test groups passed, along with the commission source checksums and `git diff --check`.

### 2026-11-15 · Arda’s weapon stances

- All 17 base weapons have a body motion specific to the attack. The knife turns through the hips, the nail gun plants for a short backward kick, Varyoz lifts and drops into its slams, and Olta rises into the cast and counters with a low pull. Rank changes the reach, twisting and weight shifts. The 18 fixed-rank evolutions keep their held art and inherit the corresponding full-strength body motion.
- The painted wrists and attached weapons use the same transform. Guarded actions such as a throw stay visible while a lighter shot still fires and produces its effects. Hammer recovery starts on the real slam and the disc catch starts when a disc returns. Reduce motion softens the full-body effect.
- The seeded 96-zombie browser comparison triggered all 17 base attacks at ranks 1 and 5. Each rank-five attack had a larger peak body motion in the recorded comparison. Four comparisons were captured from the game renderer. The quick arsenal run covered 272 build paths and mixed-weapon draw passes.
- The raster and grip suite passed 141 checks. The tier suite passed 949 checks. The animation, game feel, canvas accessibility and weapon test suites also passed.

**Roadmap**

- Phase 0 supplied the benchmark and reduced atlas sizes, plus a fast local test run. The iPhone audio and crowd checks, automated GitHub checks, and the iOS build decision remain open.
- Phase 1 is active. Illustrated street art, visible chests, map progression, weapon contacts and Arda’s attack stances are playable. The Bölüm 3 pacing change is an optional trial. Early levels still need different encounter rhythms and playtests with people new to the game. The existing local telemetry export and playtest script are ready for those sessions.
- Phase 2 extends the art and pacing work across Chapter 1, Levels 1–30. Bot runs already check balance and later trouble spots. Human playthroughs are still needed to tune difficulty, validate the Turkish text and close remaining art and accessibility issues.
- TestFlight and a broader alpha follow the iOS build decision and the Chapter 1 playthrough gate.

### 2026-11-15 · Combat screen and high-rank effects

- Removed the helmet-off lettering and the elite kill word. A lethal hit clears its damage number. The old on-by-default preference is cleared once. The regular game still offers small, short-lived damage numbers as an advanced visual option. The weapon lab hides them for all runs.
- The illustrated bottle, gas can and hammer are the reference for rank five. Fourteen other base weapons now change their contact motion at rank five. The knife crosses through a second cut, the chain snaps across its links, the saw curls back through its contact, and the extinguisher leaves a rolling foam wake.
- Fourteen evolutions now use distinct body motion and contact animation. The Net Spear closes a lattice, the Twin Saw counter-rotates its two edges, and the Minibus Door uses its own panel and skid marks around the real knockdown. Usta’s Cleaver has a larger held blade and Nail Storm a visibly different launcher. Arc Chain, Car Bomb, Fire Lake and Wedding Finale guided the evolution scale.
- During a burst, one large contact leads and the remaining marks stay compact. Contact visibility now uses screen coordinates, restoring effects in the upper-left part of the view.

**Verification**

- The Chrome crowd check delivered real impacts for 17 rank-five weapons and 18 evolutions. A five-weapon build rendered six contact shapes across 505 hits. The check exercised the old damage preference on reload, lab number suppression, helmet breaks and elite kills. The tier suite checked 28 distinct revised contact paths and identical simulation traces with the view effects enabled and disabled.

### 2026-11-15 · Weapon identity through all five ranks

- Removed the universal death wisp and the puffs on physical weapons. Fire bottles, firework exhaust and canister blasts carry the brief combat smoke. Speargun launch snaps the tether, Varyoz throws paving chips, the slingshot gives a sharp recoil stroke, and the extinguisher and Foam Storm spray distinct foam cells.
- All 17 base weapons use authored impact cues for ranks two through four and a rank-five finish. The knife adds a tip glint, curved exit and hooked stroke on its way to a crosscut. Olta adds a ripple, taut line and second ripple before its full reel. Arda follows each weapon through its recovery, including the real returning disc catch.
- All 18 evolutions have a separate body motion and contact shape. Arc Chain recoils as its circuit closes. Fire Lake spreads beyond two banks. Car Bomb throws a backblast, and Wedding Finale leaves a falling canopy. Large marks lead clustered hits, with smaller contacts resolving the rest of the crowd.
- The Mac Weapon Lab exposes all five base ranks and each fixed-rank evolution. Every selection restarts with the same 96 zombies.

**Verification**

- Chrome switched ranks through the lab controls and ran all 103 weapon configurations. Smoke appeared only with canisters, rockets or lit flasks. Both foam weapons emitted foam cells. A five-weapon build drew six contact shapes across 505 hits.
- Ten focused test groups passed. The character suite checked that higher-rank recoveries change direction, that Reduce Motion softens them, and that every evolution has its own body motion.

### 2026-11-15 · Changes from the owner’s weapon playtest

- The torch uses a short blue-cored jet at first and sweeps distinct ribbons at its upper ranks. Forge carries the sweep further and leaves two scorch marks. The car door has a solid painted panel, clean window, and forward shove. The Minibus Door drives forward and drops into a stun.
- The chainsaw develops a return cut and a full-circle sweep. Grinder reverses its broad sweep and keeps its stacking hits. The extinguisher develops a rolling foam crest and stronger push. Foam Storm lays down overlapping fronts and still blocks spit.
- Fireworks burst through one, two, or three colored layers of stars with separate timings. Wedding Finale drops those bursts across the arena. Varyoz draws impact cracks through the crowd. Blacksmith uses a hot-metal strike and keeps healing per enemy hit.
- Olta reels one enemy through others at low ranks and spins the catch at rank five. Hookpull gathers enemies before a wider spin. Live Cable branches to more enemies. Stormshield keeps its protective orbit and dodge discharge. High-rank spears spread into three lines with a stronger pull at the pin. Net Spear launches two lines and binds enemies with the net.
- High-rank saw blades cut an outward and return curve. Twin Saw splits the two curves across opposite flanks. The manhole cover speeds up and knocks neighboring enemies back at the top ranks. Slingshot marbles split into two smaller shots after the first contact with nearby targets.
- The browser captures identified another death effect responsible for broad dust, smoke and grime clouds. Ordinary kills now leave the collapse and ground marks, with small sparks or embers for elemental deaths. The Weapon Lab also hides the large streak banner.

**Deviations**

- Base level rows in `config-weapons*.js` set cable jump counts and branch reach, saw travel speed and curvature, manhole splash reach, torch sweep and ticks, Olta drag and spin, door press, slingshot split, chainsaw sweep, foam push, and spear spread. The affected evolutions have their own values. Speargun, torch, Olta, slingshot and chainsaw rank-five per-hit damage was reduced to account for their wider or additional hits.

**Verification**

- Chrome exercised all 103 loadouts in the 96-zombie crowd. It checked that ordinary deaths add no clouds and that streak words stay out of the lab. A separate pass captured ranks 1, 3, and 5 for the twelve revised weapons and the ten related evolutions. Their opaque colors read over the street, including the red door and orange torch.
- Ten focused regression groups and the quick arsenal suite passed. The latter exercised 272 build paths. The level 5 and level 21 bots cleared all eight runs each with up to one revive. There is room for a full-run balance playtest of the stronger ranks.

### 2026-11-15 · Weapon Lab follow-up

- The car door has a wing mirror, framed window, handle and hinge. It braces and turns into one real bash at low ranks, alternates two swings at rank three, then aims a third ram at rank five. The Minibus Door ends with a wider stun slam. Enemy reactions and the contact sound are timed to the bash.
- The extinguisher emits a directional white plume from the nozzle, broadening into a two-sided fan and overlapping Foam Storm plumes. Live Cable and Stormshield show an outlined cartoon skeleton on each struck enemy, with larger arcs at higher ranks.
- The manhole cover is a visible gridded disc that lifts and banks between contacts, then sends out metal chips and a shock ring when it lands. The slingshot winds up, sends distinct steel shots along the actual path, and marks each ricochet. The speargun has defined metal barbs and a braided tether. Net Spear draws its binding lines between the actual linked enemies.
- Fireworks start with two colors and build to a wider four-layer burst with branching comets. Fishing rod spins begin at rank three and gain reach and turns. The nail gun shows longer steel tracers and stronger recoil marks. Saw blades gain a larger serrated edge and wake. Hammer echoes and shockwaves read from rank one and build to wider, forked strikes at rank five.
- Dedicated weapon cues replace the older, generic contact shapes for these attacks, freeing the weapon and enemy reaction to read.

**Deviations**

- Door timing and damage are per bash, including a third aimed swing at rank five. Olta gains its first full spin at rank three. Later spins get more reach and turns. Rank-five fireworks gain a larger real blast with lower damage per rocket. The higher manhole ranks gain a wider landing impact. Slingshot release follows a brief windup.

**Verification**

- Chrome ran 42 comparisons in the 96-zombie crowd, covering ranks 1, 3 and 5 of eleven weapons and nine evolutions. Captures include the third rank-five door bash, the white suppressant spray, the x-ray electrocution poses, the cover in flight, and the three spear tethers.
- Ten focused suites, the quick arsenal run across 272 build paths, the art source checksums and the whitespace check passed.
- The previous eight-seed samples cleared levels 5 and 21 eight times each. The revised level 5 sample cleared seven. Level 21 cleared six with the first door timing. A 0.38 s stagger on a landed bash brought it to seven and is the value in this build. Campaign balance still needs a playthrough with mixed builds.

### 2026-11-15 · Held door sweep and elemental attacks

- Arda grips the visible door handle throughout the swing. His stance and the trailing arcs follow the panel's angle. Enemy hits and the impact sound happen as the panel crosses them. The Minibus Door has three turns and a finishing ground slam.
- Live Cable and Stormshield briefly replace struck zombies with an opaque skeleton pose, a jagged gold outline and branching bolts. The pose holds and stretches without repeated switching. Early Varyoz hits now have a forked lightning strike and a visible hammer head at the landing point.
- The Speargun sends a gold trident through a blue-green wake. A pinned target draws a whirlpool. At rank five, three tridents spread across the crowd. Net Spear also draws connections between bound targets.
- The Manhole Cover has a distinct metal hit even at rank one. Its middle rank gets the wider bounce. Ranks four and five bank higher and crack the pavement on the first landing while knocking back surrounding enemies.

**Deviations**

- Car Door sweep angles are 130°, 195°, 300°, 515° and 900°. Swing durations progress from 0.73 to 1.47 seconds including windup and recovery. A repeat hit after approximately one turn deals 42% damage. The 0.38-second stun applies at contact.
- Manhole first-hit radius is 1.25 m at rank three, 1.68 m at rank four and 2.18 m at rank five. Rank-five direct damage is 18. Following bounces have smaller impact radii.

**Verification**

- Chrome rendered 22 comparisons in the seeded 96-zombie crowd and ran a mixed loadout. It checked the rank-five door's rotation, Live Cable replacing living actors with the skeleton pose, and the absence of smoke from the revised weapons.
- Ten focused groups passed. The quick arsenal suite exercised 272 build paths. The sweep test confirmed that rank one deals zero damage during the windup and only hits the enemy in the swing path. The commission source checksums and whitespace check passed.
- Automated campaign trials cleared level 5 in seven of eight runs and level 21 in eight of eight runs, with up to one revive. The weapon feel still needs the owner's Mac playtest.

### 2026-11-15 · Phase 1.3, Bölüm 2 tram stop

The opt-in Bölüm 2 route puts the tram's controls beside an illustrated shelter. Four crawlers advance along the tracks. Completing the link sends the tram along the rails, drops one chest on the platform, and completes the bonus objective. The player can walk on to the exit without operating the tram. The Bölüm 3 plaza trial still has its own link.

**Deviations**

- The Bölüm 2 trial uses the stop at 22 m and a 1.5 m control radius. It uses the existing link time and slows while enemies are near. The tram uses the existing width, length, and damage. The chicane starts past the tram lane. Street props and canisters keep clear of the platform.
- Ordinary Bölüm 2 uses a timer-based survival objective. Both route trials are standalone previews. Telemetry identifies the stop and crossing trials separately, including older crossing exports that used a boolean.

**Verification**

- The tram regression checks that the control completes the bonus, the tram clears the tracks, the chest drops once, and players can bypass the optional encounter. The station, chest and crawler entry points have clearance across 200 generated layouts.
- Chrome played the control sequence, confirmed the tram and chest on screen, and checked that the export recorded the trial and the completed link.
- Seven focused suites and the objective string check passed. The final eight-seed bot trial cleared 8/8 versus 7/8 on ordinary Bölüm 2, with up to one revive. Median times were 233 and 202 seconds. The trial completed the bonus in 7/8 runs. Human play is needed to tell whether the extra time feels worthwhile.

Next is a distinct encounter for Bölüm 4, followed by a first-session comparison through the İstiklal boss. Use the existing playtest script and export to check where new players stall, skip a bonus or stop playing.

### 2026-11-15 · Bölüm 2 pacing and playtest fixes

- The shelter's long edge now runs parallel to the rails. The stop's bell sounds before the tram arrives, the tram crosses the marked track more slowly, and enemies are hit at the front of the moving tram. The chest drops afterwards. The gold rectangle from the temporary tram entrance painter was removed.
- The chest screen keeps Continue in a fixed footer. Weapon forks explain that the player must choose an upgrade. The choice list scrolls if it needs more room.
- The Bölüm 2 preview gives the player time to assemble a build, a horde countdown, two pressure waves, and Makasçı at the final gate. The boss moves across the player, recovers after a hook sweep, and ignites another rail lane in the second phase. The route bar shows the current objective and when to counterattack.

**Deviations**

- The tram warning is 0.9 s, followed by a 2.2 s track sweep. The horde warning starts 63% of the way to the last gate and counts down from nine seconds. The horde runs for up to 18 seconds. Nine kills earn a chest. The second pack includes an elite runner.
- Makasçı starts at 600 base HP and switches phases at 46% HP. A hook sweep leaves 1.65 s of vulnerability. The rail attack gives at least 1.25 s of warning in either phase.
- Normal İstiklal's generated stages get 24 opening ambient enemies and 0.8 more per new metre, alongside the existing route budget. Storefront openings fire once. Bölüm 5 gets up to 26 ambient arena adds and 20 summons alongside its existing finite add budget. The Bölüm 2 preview pauses fresh ambient reinforcements when its boss fight starts.

**Verification**

- Chrome drew the rail-side shelter and checked the warning, tram movement, chest choice and visible footer at 150% text, horde countdown, boss health bar, hook opening, and rail warning. The export recorded the preview revision and each encounter phase.
- Focused tram, horde, environment, progression, accessibility, UI motion, Weapon Lab and telemetry suites passed. The new regressions cover camping, backtracking, repeat boss summons, and the safe rail lane. Source checksums passed.
- Automated runs cleared the updated Bölüm 2 preview 8/8 with up to one revive. Normal Bölüm 5 cleared 6/6 after the summon cap. Human playtests are still needed to tune the difficulty and length of each beat.

**ImageGen asset**

The built-in tool produced `prototype/assets/istiklal/istiklal_stop_shelter_railside.png`. Prompt used below.

> Use case: precise-object-edit. Asset type: isolated transparent PNG game sprite for a portrait top-down Istanbul action game. Edit target is the attached tram-stop shelter sprite. Redraw the same open-sided vintage shelter with dark steel framing, blue glass, cream pillars and a wood bench, changing only the camera and orientation. Orthographic camera around 70 degrees down from horizontal, matching a top-down road with vertical rails. Its long roof ridge and long ground footprint must run exactly vertically along the image's Y axis, from image bottom toward top, with no diagonal axis or perspective vanishing point. The glass back is on the right, the boarding opening faces left toward the tracks, and the top of the roof is the largest visible surface. Show a narrow strip of the left face and the short lower end, and keep columns upright in the projection. Roof is elongated, narrow and rectangular; its intact silhouette is entirely in frame. Keep the current cel-shaded inked architectural game-art style and gray-blue metal with warm stone. Draw a single prop isolated on real transparent alpha, with no platform, paving, tracks, signs, cast shadow, people, text or ground. Centered and tight with clean alpha margins.

### 2026-11-15 · İstiklal route and boss preview

- **Bölüm 1.** Escape the restaurant, defend the shutter, then fight Lokantacı through a three-step cleaver combo and thrown cleavers.
- **Bölüm 2.** The station bell gives the incoming crowd time to fill the tracks. The front of the tram clears each row, then the chest lands. Later a countdown leads into the two-part frenzy and Makasçı's rail and hook attacks.
- **Bölüm 3.** Take a breath at the stopped tram, fight through the plaza ambush and the signal-cart encounter, then dodge Kestaneci's charges and hot chestnut volleys.
- **Bölüm 4.** Three optional live wires let Arda shock and stun nearby zombies on the way to Elektrikçi. He moves sideways, lays horizontal bands of electricity across the street, and leaves an opening after each attack.
- **Bölüm 5.** Reach the depot and face Vatman. His tram advances through a marked lane at real travel speed. He closes in with the brake lever, bell and charges in the later phases.

**Deviations**

- The trial runs through all five Normal levels via `?level=N&rhythm=1&lang=tr`, with Next Level carrying it forward within İstiklal. The Bölüm 2 bell lasts 1.45 s. The 32 staged zombies use the game sprites and add zero XP or damage. The four original crawlers still take normal tram hits.
- The Bölüm 1 shutter defense runs for 19 s before Lokantacı appears. Base HP for Lokantacı, Kestaneci, Elektrikçi and Vatman is 300, 660, 580 and 1420 respectively. Each has a phase change and Vatman has two. His arena has five opening and four second-phase passengers, with the hostile tram telegraphed for 1.4 s before its 1.75 s pass.
- Each Bölüm 4 wire pulses in a 4.2 m radius for 52 damage and 1.1 s of stun. Elektrikçi's vulnerable window lasts 2.05 s. The route bot now aims through market gaps so its stopping distance cannot leave it stuck at a waypoint.

**Verification**

- Chrome rendered the incoming and knocked-aside crowd using the character artwork, showed the tram crossing the lane and the chest dropping, and exercised the wire pickup and all four new bosses.
- Nine focused suites passed. The encounter regression covers the shutter staying closed until the Cook dies, a cable pulsing once, the tracks staying safe until the tram arrives and the clear space to its side. Objective text, art source checksums and whitespace checks passed.
- Six automated runs per level cleared Bölüms 1 through 4 in 24 of 24 attempts and Bölüm 5 in five of six with up to one revive. The bot cut all three wires in five of six runs. Vatman was the hardest encounter and needs human tuning for opening readability and difficulty.

### 2026-11-15 · Required street milestones and character development

- The route card names the obstacle, switches to the ring instruction when in range, shows progress and confirms when the road opens. A gold marker guides Arda to the next required interaction. The bonus chip yields while that instruction is needed.
- Dialogue keeps its text in a compact strip near the active interactions, where the portrait pop would cover the ring or the actors.
- **İstiklal 1–5.** The Tünel shutter requires the Cook fight. The tram-stop crowd enters from either side and up the street during the approach and link. The tram clears it at track speed to open the road. The plaza signal cart sends a visible signal to retract the barrier once the near side is clear. Arda stops and works pliers around each live wire, then the dead circuit releases its barricade. Turning the depot crank raises the shutter before the Vatman encounter.
- **Develop Arda** is one Map entry with Attributes and Skill Tree in the same flow. The six attribute cards show their current effect, training and next perk. A perk explains its attribute rank and Street Cred cost, and returns straight to the attribute if its rank is too low. A draft survives moving between the two pages during the visit. The confirmation and learning rules still use the saved progression model.

**Candidates for the rest of the chapter**

| Levels | Neighborhood | Required encounter candidates in level order |
|---|---|---|
| 6–10 | Galata | Turn a clock repairer's hoist to clear the uphill steps. Escort a street musician who unbolts a passage. Ring the tower courtyard bell and slip through while the crowd follows the sound. Crank down the service footbridge under pressure. Open the tower courtyard grille for the boss. |
| 11–15 | Karaköy | Drag a cargo hook onto a crate blocking the quay and hoist it away. Help a deckhand throw the ferry mooring line. Redirect a stalled tram with the points lever. Open a fish-market aisle by rolling three stall shutters. Empty the dock ramp and lower a gangway into the arena. |
| 16–20 | Galata Köprüsü | Reel in snagged fishing lines to lift a row of rods off the deck. Throw a rescue line to a fisher below the railing. Close two wind screens to cross an exposed walkway. Brace the under-deck stair until the wave passes. Wind up the maintenance platform for the waterside boss fight. |
| 21–25 | Eminönü | Raise a vendor awning to reveal a side passage. Defend a handcart as it carries a load off the market steps. Move three sacks to free a jammed pivot. Turn the loading semaphore so a trolley clears the lane. Roll open the loading yard to enter the boss fight. |
| 26–30 | Sirkeci | Pull the departure lever to move a stationary service car. Follow a station guide to a locked staff passage. Restore the station clock drive and watch it trip the gate. Restore a platform light circuit while holding the concourse. Set the points and draw the guard out to the last platform. |

**Deviations**

- The trial closes the tram road 5.1 m beyond its controls, the plaza crossing 5.8 m after the cart, and the wire barrier 3.8 m before the gate encounter. Cutting a wire takes 0.75 s while stopped within its 1.45 m ring. The signal cart needs eight seconds within 2.4 m and pauses progress if a zombie reaches 1.15 m. The depot crank takes 2.4 s. The cart, wire barrier and depot shutter animate open over 0.85 s.
- Vatman has 1310 base HP and a two-second attack opening. He holds his position while the first-phase tram crosses. His bell attack leaves an opening as well.
- The later-district table is a proposal for local context, obstacles and payoffs. Those encounters still need individual layouts, animations, numerical tuning and playtests before use in the campaign.

**Verification**

- Chrome showed characters approaching the tram controls before the link, the tram sweep, the roadway release, the cart signal, the pliers at the wire and the turning depot crank. It followed a locked Strength perk to its attribute, spent a training point, then learned the perk with Street Cred. The character panels fit at 150% text.
- Required goals completed in all 18 automated runs of Bölüms 2–4. Those levels cleared 6/6 each. Bölüm 5 cleared 5/6 with up to one revive. Interaction points had clearance in a 200-seed layout sample per level. Vatman's difficulty still needs a Mac playtest.
- Focused encounter, horde, environment, progression UI, accessibility, motion, Weapon Lab, tree, dialogue, telemetry and benchmark suites passed. The string and ID checks, commissioned source checksums, and whitespace check passed.

### 2026-11-15 · Tram, wire cut and map follow-up

- Completing the link starts the tram scene. The 32 staged zombies enter from all four edges while run time, combat and movement pause. The camera frames the tracks, moves closer for contact, then returns toward Arda. The chest, road and controls become available at the end. Live enemies on the tracks can still be struck by the passing tram. The four extra approach crawlers were removed.
- Arda pulls the cable taut, leans into the pliers, snaps it, and holds the pose long enough for the two loose ends and the shock to read. The camera returns to regular framing after the snip. Reduce Motion keeps the camera steady in both scenes.
- The map gives **Arda’yı geliştir** its own light card with Arda's portrait and the ready status. Route distance is a slimmer, quieter row above it. The card opens the same Attributes and Skill Tree screens.

**Deviations**

- The crowd gathers for 3.2 s after the link, the bell sounds 0.48 s before the tram enters, and the tram sweeps for 2.2 s. The 0.85 s pullback precedes the handoff. The camera narrows the field of view by up to 12% for the sweep and 11% for wire cutting. Wire cutting takes 1.4 s, with a 0.44 s follow-through.

**Verification**

- Chrome verified the crowd is absent while the link is filling, approaches from four directions, and is cleared in focus. It checked that input and the level clock pause until the handoff. It exercised the cable close-up and Reduce Motion path, and opened character progression from the portrait card at 150% text.
- Eight focused suites passed. The map first-run regression passed 140 checks on rerun, including both languages at each phone size. The initial Turkish 448-width case stayed on the title.
- Six of six scripted runs cleared all required milestones in each of Bölüms 2 and 4. Bölüm 4 cleared in all six runs. Bölüm 2 cleared in four. One run stalled on a street prop and one lost to Makasçı after the tram scene.

### 2026-11-15 · Device-specific confirmations and Galata

- The Bölüm 2 ring calls the tram and says **Tramvay çağrıldı**. Other terminals report their outcome, such as coins dispensed, an alarm sounding or a shutter opening. The phone booster says the signal was restored. It says Mom is back on the line when the first-level conversation actually resumes.
- **Bölüm 6** raises a crate in the uphill lane. **Bölüm 7** walks a musician to a side gate. The musician waits when separated or surrounded, then unbolts the gate. **Bölüm 8** rings a bell that draws living zombies toward the square and clears the stairs.
- **Bölüm 9** has a counterweight to carry to the winch before the footbridge lowers. The deck and the gaps beside it have matching collision. **Bölüm 10** opens the courtyard grille to the Tower Keeper, whose counterweights fall one at a time onto marked spots. A third weight joins the sequence in phase two.
- Ring stations show the action while Arda works the lever or rope. The camera moves slightly closer while he stands at the controls, subject to Reduce Motion. The preview can continue through Bölüm 10 with Next Level.

**Deviations**

- The hoist, bell, bridge winch and courtyard lever require 1.9, 1.15, 1.4 and 2.2 seconds in the ring. The bridge also requires a counterweight found 5.5 m back. The guide waits for Arda within 5.8 m and stops if an enemy gets within 1.5 m. The bell leaves 2.3 s for zombies to start moving before the stairs open.
- The preview final holds in Bölüms 6–9 are 8, 12, 9 and 14 seconds. The Tower Keeper has 970 base HP and a phase change at 48%. His weights land with 0.34 s between drops. The first windup is 1.32 s before phase scaling.
- The generated hold now has its own function name. The authored restaurant hold had been shadowing the generated one in the shared script scope.

**Verification**

- Chrome verified the tram label, each Galata interaction and its release, the preview’s Next Level button, and the Tower Keeper’s first weight sequence. The phone-state regression confirms that Mom’s lines are queued only when the opening call comes back.
- All 20 seeded Galata preview runs cleared with up to one revive. All required interactions had clear floor placement in 150 layouts per level. Bölüm 9 took the longest, with a median of 290 seconds in the test sample.
- Nine focused suites passed. The checks for IDs, objective strings, commissioned art checksums and whitespace passed.

### 2026-11-15 · Karaköy quay, market and dock finale

- **Bölüm 11** requires two steps at the crane. Align the hook, then attach the sling to the crate. The crane lifts it aside and the quay opens.
- **Bölüm 12** calls the ferry. Throw the mooring line, then defend the berth while the countdown runs. Two groups enter from opposite ends of the quay. Leaving the area pauses docking. The gangway lowers after the ferry arrives.
- **Bölüm 13** sends the parked tram onto its siding. The switch moves and the barrier stays shut until the car clears the crossing.
- **Bölüm 14** raises three individual fish-stall shutters. The required marker moves to the next stall and the card counts the raised shutters.
- **Bölüm 15** requires clearing the ramp guards before lowering the gangway. The Bride circles Arda, rolls crates down marked lanes and swings a weighted mooring rope. The rope stops for a counterattack. Phase two adds a second cargo lane and a full-circle sweep.
- On these routes the gold marker and card name the required action. Roaming reinforcements are finite and tied to distance reached. Once the required objective is complete, Bölüms 11–14 open the end gate on approach.

**Deviations**

- The crane steps take 1.05 s each. The ferry ring takes 1.25 s and docking takes 9 s inside a 3.2 m area. The tram switch, market shutters and gangway lever take 1.45, 1.15 and 1.35 s. The tram takes 2.8 s to clear the crossing.
- Preview route lengths are 140, 154, 172, 188 and 155 m before the seed variation. The two roaming spawn budgets start at 32 budget and 31 enemies and grow by 1.55 budget and 1.32 enemies per metre of new progress. The route pressure drops near the required stations.
- The Bride has 990 base HP, a second phase at 49%, a 1.24 s cargo warning and a 1.28 s rope warning before phase scaling. Her counterattack window lasts two seconds. D-092 records the proposed preview design.

**Verification**

- Chrome exercised all five objectives and their release animations, and showed both of the Bride's attack cues and her counterattack window. The required stations were clear in 150 seeded layouts per bölüm.
- The route test confirms that remaining in place exhausts the roaming spawn budgets, that the dock guards gate the lever and that narrow sidesteps can avoid the moving cargo. Four bots per bölüm completed 19 of 20 runs with up to one revive. The loss was on the approach to the tram switch in Bölüm 13.
- The existing font check exposed missing inheritance on the Weapon Lab controls. The controls now inherit the game's fonts.
- Fifteen focused suites passed, including the art, fonts, quality and dialogue checks. The ID, hood key, objective string, commissioned source checksum and whitespace checks passed.

### 2026-11-15 · Galata Köprüsü fishing rail and lower pier

- **Bölüm 16** reels in snagged lines and swings the fishing rods back against the railing to reopen the bridge span.
- **Bölüm 17** throws a rescue line to a stranded fisher. The fisher moves toward the deck as Arda pulls. Stepping away pauses the haul and returning resumes it. The rescue leaves a simit by the winch.
- **Bölüm 18** closes two windbreaks, one on either side of the walkway. Gusts push Arda across the deck. The card points to the next control and shows how many screens are closed.
- **Bölüm 19** requires sheltering at the lower stairs for two wave impacts. The card counts down to the crest. The wave knocks zombies back and washes away acid and toxic patches on the stairs. It hurts Arda if he is exposed. Missing a wave leaves the passage closed for the next one.
- **Bölüm 20** lowers the maintenance platform to reach the Big Fisherman. He casts along a marked path, reels in a hooked Arda, and drops a net that slows Arda while he is inside it. After reeling in the casts he leaves a counterattack window. His second phase uses a wider net and two staggered casts.
- The bridge's roaming spawn budgets are finite and grow with new ground covered. The exit in Bölüms 16–19 opens on approach after the required objective.

**Deviations**

- Preview route lengths are 147, 160, 180, 173 and 162 m before the seed variation. The new bridge and Karaköy routes share the same pacing and gate logic with their own tuning. The bridge budgets start at 33 route budget and 30 ambient enemies, adding 1.55 and 1.3 per new metre.
- The snagged lines take 2 s, the rescue cast takes 1.25 s and the haul takes 4 s. The windbreaks take 1.2 s each and gust for 1.1 s after a 1.5 s warning. The waves have a 2.9 s warning. The platform takes 1.6 s at the lever and 2.2 s to lower.
- Bölüms 18–19 use the bridge deck layout in the preview, with the windbreaks and stairs placed between its railings.
- The Big Fisherman has 1010 base HP and a phase change at 48%. His casts and nets have 1.32 s and 1.38 s warnings before phase scaling. The second cast trails by 0.34 s. A landed net slows movement to 55% inside it for up to 2.55 s. The counterattack window lasts 2.1 s. See proposed decision D-093.

**Verification**

- Chrome exercised the five Turkish objective flows and the Fisherman's marked cast, net and recovery. Required stations had clear collision placement in 150 seeded layouts per bölüm.
- Four automated runs per bölüm cleared 19 of 20 attempts with up to one revive. The sole loss was in the Bölüm 20 arena. The test covers wave impact inside and outside the shelter, the hook pulling Arda, and movement returning to full speed outside the net.
- Fourteen focused suites passed, including the İstiklal, Galata and Karaköy routes, horde, accessibility, art items, fonts and dialogue. The ID, hood key, objective string, commissioned source checksum and whitespace checks passed.

### 2026-11-15 · Eminönü spice route and loading yard

- **Bölüm 21** pulls up the striped stall awning on the waterfront. The side passage has matching collision and a marker points through the opening on the right.
- **Bölüm 22** escorts a porter with a loaded spice cart through the market aisle. It waits if Arda falls back or zombies reach its wheels. Two small groups enter from opposite ends of the aisle.
- **Bölüm 23** carries three sacks to a marked pallet. Carrying slows Arda and each delivery updates the count. The last sack frees the gate wheel.
- **Bölüm 24** turns the loading signal. It warns before a loaded trolley crosses from the right. Stepping onto the track during the crossing can hurt Arda. The barrier opens when the trolley clears it.
- **Bölüm 25** rolls up the loading shutter to reach Kaan's Captain. The Captain casts his anchor and hauls himself down the marked path. When the anchor catches, Arda can counterattack. The Captain also throws spice sacks that spill damaging pepper clouds. His second phase throws a third sack and makes back-to-back chain lunges.

**Deviations**

- Route lengths before seed variation are 144, 158, 171, 174 and 158 m. The escort has a clear centre aisle through the market. The freight crossing uses the plaza layout. Roaming spawns remain finite and the gates for Bölüms 21–24 open on approach after their required encounter.
- The awning takes 1.5 s at the rope. The porter moves at 1.6 m/s with Arda within 3.9 m. Carrying a sack reduces move speed to 84%. The trolley has a 0.95 s warning and a 2.65 s crossing. The loading-yard crank takes 1.85 s.
- The Captain has 1060 base HP and changes phase at 47%. The anchor and spice warnings begin at 1.32 s and 1.31 s before phase scaling. The anchor recovery exposes him for 2 s. Pepper clouds last up to 3.1 s. See D-094.
- Bonus terminals on the sack route use the hero's walking width. The balance bot prioritizes an active required marker over a bonus terminal.

**Verification**

- Chrome exercised the five Eminönü objectives in Turkish, the Captain's anchor and dust attacks, and the handoff from Galata Köprüsü using **Sonraki bölüm**.
- The route checks cover 150 layouts per bölüm, clearance through the awning, cart motion and blockage, each sack delivery, trolley contact, the Captain's displacement and pepper damage. Fifteen focused suites passed. ID, hood key, localization, commissioned source checksum and whitespace checks passed.
- Nineteen of 20 seeded automated runs cleared with up to one revive per run. The four Captain runs cleared without a revive. One run died beyond the sack gate in Bölüm 23.

### 2026-11-16 · Grounded landmarks and new comic art

- Galata and Karaköy place a mosque with an attached dome, minarets and plinth. The level chooses a single street-side position clear of layout zones and leaves the landmark out when no placement fits. The artwork, depth sorting and collision footprint use the same ground position. The same placement rule applies to the other neighborhoods that used the repeating skyline.
- All 13 comic characters and 35 illustrated settings now use generated raster art, including the opening and five finale illustrations. Arda, Anne and Kaan have alternate expressions. Live dialogue, the phone card and character screens also use the refreshed portraits where they display comic art.

**Deviations**

- The landmark centers are 4.72 m from the road center and the solid footprints are 1.55 m deep. Landmark placement searches up to 28 m either side of its preferred position to leave key layouts clear. See proposed decision D-095.

**ImageGen prompts and artwork**

- [Lead cast](../prototype/assets/comic/cast-core.webp) and [supporting cast](../prototype/assets/comic/cast-support.webp). Generate waist-up transparent portraits on a 4×2 grid. Use the in-game costume colors, warm ink contours, painted cel shading and natural expressions. Give Arda his swept brown hair and red hoodie, Anne a brown bob and teal cardigan, and Kaan blond hair, sailor stripes and a red towel. Use the existing character descriptions for the remaining faces and wardrobes.
- [Neighborhoods A](../prototype/assets/comic/scenes-a.webp), [neighborhoods B](../prototype/assets/comic/scenes-b.webp), [neighborhoods C](../prototype/assets/comic/scenes-c.webp) and [finale and theater](../prototype/assets/comic/scenes-d.webp). Generate 3×3 grids of wide Istanbul graphic-novel scenes with warm cinematic lighting, readable foregrounds and no embedded lettering. Give each scene its own setting and keep the foreground open for the existing portraits and dialogue. The scene order and crops are in `prototype/js/view/comic-raster.js`.
- [Mosque](../prototype/assets/landmarks/mosque.webp) and [street structures](../prototype/assets/landmarks/structures.webp). Generate upright transparent cutouts in a slightly downward, three-quarter view. Give the mosque attached minarets and a limestone plinth with a contact shadow. Match that view for the clock tower, fire tower, gate, crane, walls, chimney, sailboat and trees. The original generation IDs are in `art/PROVENANCE.csv`.

**Verification**

- Chrome exercised the moving camera in Bölüms 6 and 11, the new phone portrait, the cast sheet and a finale panel. The regression test checks projection, visibility after passing the mosque, collision alignment and the availability of the art for every comic page.
- Thirteen focused suites passed. Eight seeded runs across Bölüms 6 and 11 cleared with up to one revive. ID, hood key, objective localization, commissioned source checksum and whitespace checks passed.

### 2026-11-16 · Comic conversation framing

- The lettering fit treated Arda's long campfire line and Kaan's short reply independently. The campfire conversation row now has 70 px more height. Side-by-side panels in the same scene try a shared portrait scale and font size, with wider balloons available for longer lines.
- Chrome measured both campfire portraits at 130 px in Turkish and English. The lettering audit found no clipping, truncation or overflow across 234 entries per language. The scene art, dialogue, font and canvas accessibility suites passed.

### 2026-11-16 · Fixed portrait framing across the comic

- Portrait size now comes from the panel geometry and authored framing. Longer text can use wider balloons. When the lettering needs more room, the next tap continues the text in the same panel. The layout preserves the speaker, script order and signal bars. The bridge introduction uses the taller conversation row from the campfire. See proposed decision D-096.
- Chrome played all 27 pages through all 96 text steps in each language and checked that the complete dialogue was shown. All 84 panels fit in Turkish and English, with zero clipped or truncated lines. Portrait heights matched across languages and when the text was removed. The scene-art regression test also feeds a long single speech balloon through the layout and checks that every word survives at the same portrait size.
- Scene art, dialogue, fonts, canvas accessibility and quality passed.

### 2026-11-16 · Sirkeci and the 30-level player audit

- Finished the Sirkeci service-car dispatch, attendant escort, clock fuse, platform-light defense and Ticket Man finale. The final fight alternates a ticket punch with visible rail warnings. The second phase adds a delayed second row. The final call and comic carry Arda and Kaan forward toward home.
- Normal play uses the revised route through Bölüm 30 and earns and saves the ordinary rewards. Explicit preview runs keep their isolated save behavior. Results point to Character Development when a training point or perk is available, and closing the map dismisses training and cancels delayed map callbacks. New players learn the first three combat inputs in stages.
- The audit identified long Galata farming loops, two early difficulty jumps, a repeated station arch obscuring an objective, a railcar collision left behind, and hard-to-see low-rank attack cues. The crane stall trace exposed a healing prompt behind a closed gate. The refreshed title features Arda and the tram, and run transitions now clear old phone dialogue. The affected implementations were revised. The full findings, weapon and level breakdowns, playback evidence and open checks are in the [player audit](PLAYER-SLICE-AUDIT-2026-11-16.md). See proposed decision D-097.

**Deviations**

- Sirkeci’s nominal lengths are 142, 156, 165, 174 and 165 m. The departure bell has 0.65 s of lead, with 12.6 m of travel over 3.15 s. The light defense uses eight in-ring seconds, with progress retained while Arda steps out. Ticket Man adds a second track row 0.46 s after the first in phase two.
- Makasçı health is 545 from 600 and recovery is 2.05 s from 1.65 s. Vatman health is 1,150 from 1,310, ticket swing damage is 19 from 23, windup is 1.58 s from 1.40 s and recovery is 2.35 s from 2 s. Galata’s moving budgets start at 36 route and 35 ambient, grow by 1.55 and 1.28 per meter and use a lower rate at closed checkpoints.
- The nail gun muzzle cue spans 0.11–0.158 s and its radius goes from 0.18 to 0.292 m. Nailstorm uses a green cue. The hammer and chainsaw get more visible held shapes and stronger stance changes. Weapon damage and firing behavior are unchanged.

**ImageGen artwork**

- [Station props](../prototype/assets/landmarks/sirkeci-station.webp). A transparent 3×2 sheet of lever, clock, fuse panel, signal light, iron gate and toolkit. Inked limestone, brass and steel in a common downward three-quarter view.
- [Service car](../prototype/assets/landmarks/sirkeci-railcar.webp). A narrow, north-facing blue and cream service car. Roof-dominant high angle, hand-inked contours, transparent exterior.
- [Attendant and Ticket Man](../prototype/assets/landmarks/sirkeci-cast.webp). A transparent 3×2 sheet. Ticket Man has idle, anticipatory punch and finishing poses. The capped attendant has idle and two walking poses. Preserve grounded feet and the game’s comic linework.

- [Title art](../prototype/assets/title/arda-istiklal.webp). Arda carries a phone on a dusk Istanbul street alongside a red tram. Warm shop light, dark inks and the original props link the key art to the new comics.

**Verification**

- The automated balance batch covers eight seeds per Sirkeci level. All 40 cleared with at most one revive per run.
- Chrome exercised 17 base weapons at ranks 1 and 5 plus 18 evolutions. All 52 settings registered hits. One mixed loadout rendered four distinct contact shapes over 509 hits.
- Chrome played all 28 comic pages in both languages. Each language showed 86 panels and used 98 text steps without clipping or overflow.
- Fresh-save Chrome cleared all 30 levels and unlocked Bölüm 31. Eight levels used a revive. The separate Mac-layout run cleared Levels 11–30. The results fixture applied a real upgrade through the menu, preserved it across reload and verified preview save isolation.
- All 45 prototype suites passed across the full run and targeted reruns. The full run initially caught an obsolete L5 trace, a stale signal-cart rendering assumption and the main file exceeding 600 lines. The three suites then passed. Commissioned source checksums, required strings, IDs, dialogue, death causes and whitespace passed.

### 2026-11-16 · Full-body combat and illustrated street services

- Arda can bend at the knees, lean into a step and shift his shoulders above grounded shoes. Each base weapon shapes this movement differently. A knife cut shifts forward, the nail gun kicks back, the hammer drops through both knees at the real impact, and the fishing rod pulls the hero back against the line. Higher ranks carry more weight through the movement. Grips follow the illustrated hands through the body motion.
- Overlapping attacks share the body. The first pose holds briefly, then a fresh attack can take over at its current phase. The chainsaw and door retain their live attack effects, a genuine hammer contact regains the body on the impact, and the render pass drops old queued cues. The Weapon Lab’s Mixed weapons button starts the selected weapon alongside four others.
- Replaced the shared pharmacy and simit-and-tea kiosk art, and illustrated six street terminals. The new props retain their original interaction position. The kiosk and pharmacy keep the used-state sign and a used terminal stays visible when its ring is gone. The shared art applies to every Bölüm that uses those services. See proposed decision D-098.

**Deviations**

- Normal pose ownership lasts at least 0.07 s and at most 0.105 s before another eligible attack can take over. Short cues expire when fewer than 0.04 s remain or they have waited over 0.24 s. The nail gun has a 0.20 s visible recoil and recovery. These timings affect presentation. Fire cadence, travel, healing and collision continue to use the same gameplay rules.

**ImageGen artwork**

- [Pharmacy](../prototype/assets/services/eczane.webp), [kiosk](../prototype/assets/services/bufe.webp) and [ATM](../prototype/assets/services/atm.webp). Commission compact Istanbul fixtures at a consistent downward angle with warm limestone, dark ink, forest green and a clear service window or screen.
- [Traffic control](../prototype/assets/services/traffic.webp), [signal relay](../prototype/assets/services/cell.webp), [shutter control](../prototype/assets/services/shutter.webp), [tram switch](../prototype/assets/services/tram.webp) and [alarm relay](../prototype/assets/services/car.webp). Use grounded steel cabinets with distinct buttons, antennae or levers and no baked text. Crop and encode each prop as a transparent WebP. Generation records are in the [art provenance](../art/PROVENANCE.csv).

**Verification**

- The Chrome Weapon Lab exercised 17 base weapons at two ranks and 18 evolutions. Each featured base weapon also drew its own body pose alongside all four backup weapons in a seeded crowd. The fight checks cover contact and body selection. A real playtest is still needed to tell how quickly a player recognizes each attack at normal speed.
- A Chrome fixture rendered every service in the Sirkeci world and checked the used ATM still drew after its interaction ended. Node checks cover mirrored grips, the surviving recoil when two attacks overlap, the actual hammer impact and reduced motion.

### 2026-11-16 · Campaign street readability and finishing impacts

The [world and combat audit](WORLD-COMBAT-AUDIT-2026-11-16.md) traces the Ataköy screenshot bugs, logs the ImageGen prop and layout fixes, and records evidence for visible consumable markers, break and blast reactions, six regular zombie deaths and one finish per district boss. See D-099 for the proposed rule and timing changes. Chrome: 24 campaign street samples, 20 boss finishes, six regular death triggers and booth fuse/collision checks. Generated layouts: 297 passable routes. Bölüm 96 bot: 7/8 clears.

### 2026-11-16 · Complete Turkish dialogue audit and revision

**Owner result:** all 1,177 existing Turkish lines reviewed (100% of the implemented corpus),
565 rewritten, 3 joke-tag-only corrections, 609 kept. All 28 comic pages read in sequence.
Natural speech, situation-based absurdity and actual responses replace disconnected jokes;
Kaan's loss and the homecoming retain their quiet beats. The opening diner no longer uses
Kaan's portrait. Existing English dialogue and pre-existing workspace work are preserved.

**Review:** [short audit and examples](TR-DIALOGUE-AUDIT-2026-11-16.md),
[all comic dialogue in reading order](TR-COMICS-READTHROUGH-2026-11-16.md).
The audit links the complete before/TR/EN/location tables; rewritten lines are drafts,
not automatically owner-approved. Proposed D-100 records the updated tone and the replacement
of the former riddle pool. No gameplay numbers, new beats or new dependencies.

**Desktop validation:** dialogue coverage and language-independent sim digest pass;
all Turkish lines fit 60/90-character limits. Real-browser layout audit: zero flags in
2,209 TR+EN checks. Five comic screenshots inspected; the letter's continuation taps retain
its full text. The scene-art test checks that the opening diner and Kaan are distinct.
Full suite: 43 suites passed; fonts, map-first-run and modes failed. The isolated map
rerun then passed 140/140; font and simulation-reference failures remain outside this pass.
Details and logs are in the short audit. The build is not green. No commit, push or merge.

**Owner check:** read the bridge meeting, Captain aftermath and campfire aloud, then play
a short Turkish run. The preview is at `http://127.0.0.1:8765/tools/comic-preview.html` on this
Mac (choose the page). Phone performance and whether players laugh are not established by
desktop text-fit tests. Stop here for feedback; do not expand to a new story phase.

### 2026-11-16 · Independent gamer audit of Bölüm 1–30

**Review packet:** [Gamer audit and implementation handoff](GAMER-AUDIT-L01-L30-2026-11-16.md).
This pass evaluates the current dirty JS prototype and preserves the existing implementation
and Turkish dialogue work. No gameplay, asset, configuration, dependency or baseline changes.

**Coverage:** a complete directly controlled L1; short browser samples across L2–30;
240 authored-route seed runs; a 30-run fresh-save campaign; 29 focused-build probes.
These are not 30 manual clears or a human retention study. Phone ergonomics, audio quality
and sustained iOS performance remain unverified. Screenshots and reproducible raw evidence
are linked from the packet.

**Findings:** competing live overlays and stale instructions; unreliable access to a chosen
build transformation; L13–14 attrition; animation needing a phone-scale quality proof;
Kaan's unembodied gameplay role; encounter staging and results motivation. Ten prioritized
tickets include evidence, implementation areas and acceptance criteria, plus a 30-level table.
First recommended bounded task: GA-01/02, combat hierarchy and navigation clarity.

**Validation:** 232/240 simulated clears, 180/240 death-free; no sweep crashes/timeouts.
Full suite: 39 pass / 7 fail. Four local-server failures were sandbox-bound; a headless mask
render failed; the font assertion and Normal traces L12-s9/L30-s4 remain unresolved.
The packet distinguishes environmental failures from behavior/reference assertions.
No commit, push or merge. Recommendations remain proposed; stop here for owner feedback.

### 2026-11-16 · Implementation after the independent gamer audit

| Audit item | Local implementation and remaining questions |
|---|---|
| GA-01/02 | Keep live dialogue outside Arda, incoming attacks, route markers and controls. Compact the phone and incidental captions, give the required action priority, and let stale banter expire. Mark the two actual exits in Bölüm 1. The closed shutter during the escape beat no longer reactivates boss instructions. The ring prompt only applies while its terminal is usable and relevant. |
| GA-03 | Test one guided choice out of three in authored Normal Bölüm 1–4. Investing in a weapon can surface a rank upgrade, its partner item, or an earned evolution. Record offers, the recipe state, choices, chest timing and time spent with the evolution. The focused knife policy reached the evolution in 8/8 runs each in Bölüm 3 and 4, with 62–134 simulated seconds left. With the guided choice in Bölüm 5, the same policy cleared 5/8 versus 8/8 with the choice disabled. Keep the existing boss-level offer rules. |
| GA-04 | Add an accurate radius warning around swelling bloaters in Bölüm 13 and 14, and a short recovery window between their direct hits. A delayed blast made the earlier probe worse and was removed. In the current eight-seed comparisons, the new spacing produced the same clear counts as the control. The active-skills policy cleared 8/8 and 7/8 with one revive available, and 4/8 and 5/8 without reviving. No global health or damage tuning. Bölüm 5 and 19 still need player observation. |
| GA-05 | Strengthen the knife crouch and recovery, hammer plant, and thrown-canister release using Arda's existing animated body. The browser Weapon Lab exercised individual ranks, evolutions and a mixed build. Real-time phone readability, audio and physical effects still need playtesting. |
| GA-06 | Kaan can intercept nearby enemies once per qualifying route after his Bölüm 20 join. The Ticket Man intercept is available during phase 2. Use three painted gameplay poses that match Kaan's comic identity. The single-character save and two-phase fight still need a separate decision for tag switching. |
| GA-07 | Mark the newly usable slope after the Galata hoist and visibly indicate shelter once the bridge wind screens close. The six-district spatial and encounter redesign remains open. |
| GA-08 | Prioritize plot above incidental barks. Let Mom's Bölüm 30 call play after combat in the cleared station as a comic beat. Keep the existing native scripts and the quiet Bölüm 25 aftermath. Broader scene direction and voice review remain open. |
| GA-09 | Lead results with the cleared stage or district and a new weapon or recipe to try when available. Keep the growth and next-level actions directly accessible. |
| GA-10 | Rerun the localhost and Chrome checks with local access. Make the first-run test wait for actual app readiness. Fix the street hint font token. Restore the pre-edit layout in memory to confirm the two changed Normal golden references came from earlier booth/layout moves. Pin the new references and keep the other four. Physical iPhone QA remains outstanding. |

**Deviations.** The early recipe option runs through Bölüm 4. The bloater recovery window
is 0.7 s in authored Normal Bölüm 13–14. Kaan's 0.28 s intercept windup, 3.15 m radius
and four-target cap live in bond configuration. No dependencies were added.

**Kaan sprite.** Built-in ImageGen, with the current Arda sprite and the cast atlas as
references. The game loads the 512 × 256 production export from the
[Kaan assist sprite sheet](../prototype/assets/companions/kaan-assist.png).

> Create a production gameplay sprite sheet for Kaan in Project Istanbul. The first attached bitmap is the game's actual Arda action sprite sheet and is a reference for scale, crisp chunky outline, restrained highlights, hand-painted comic pixel edges, body proportions and consistent shallow 3/4 overhead action camera. The second image is the cast's visual identity reference, Kaan is bottom-left: young blond Turkish man, friendly angular face, cream and dark navy horizontal striped short-sleeve shirt, red towel hanging from his left shoulder, navy work trousers and dark trainers. Render only Kaan, transformed into the same perspective and art resolution vocabulary as the Arda sheet. Exact layout: landscape 2:1 image divided into THREE equal-width side-by-side invisible columns, figure centered in each individual column with the feet aligned at the same baseline, ample truly transparent padding between, no cell lines. Three heroic unarmed full-body poses facing screen right, same height and scale: (1) running in to intercept with elbows bent and planted front foot, (2) braced low shoulder check with trailing red towel and front elbow leading, (3) upright guarded recovery hands up, red towel drops. His silhouette reads at 34 to 42 pixel screen height. Preserve his blond swept hair, navy and ivory stripes and coral red towel in all poses. No weapons, no magic marks, no FX, no ground, no shadows outside his silhouette, no text, labels, badges, or watermark. Transparent PNG with genuine alpha.

**Verification.** A browser run cleared Bölüm 1 at a 390 × 844 viewport. Browser fixtures
verified the two doorway cues, the suppressed stale prompts in Bölüm 23 and 28, Kaan's
intercept sprite and Mom's call in the cleared station.
The comic layout audit checked 240 rows each in Turkish and English with zero failures.
All four localhost-dependent suites passed after local reruns. The enemy silhouette
suite passed with Chrome access. The commissioned art source checksums matched.

Screenshots from the browser fixtures show
[the restaurant door](media/R1/gamer-fixes/01-restaurant-door.jpg),
[Kaan's interception](media/R1/gamer-fixes/23-kaan-assist.jpg), and
[the station call](media/R1/gamer-fixes/30-cleared-station-call.jpg).

### 2026-11-16 · District rhythm and boss counterplay

| Neighborhood | What the player does | How the finale uses it |
|---|---|---|
| İstiklal, 1–5 | Open the restaurant exit, call the tram, follow the signal cart and cut the wires to reach the depot. | The Vatman's moving tram clears zombies on its track. When Arda gets out of its way, he can strike the Vatman after it passes. |
| Galata, 6–10 | Open climbing routes with the hoist, escort the musician, draw the horde aside with the bell and lower the footbridge. The bell shows where the zombies are headed. The late footbridge hold is shorter. | The Bellkeeper drops counterweights in sequence and only opens up after the last weight lands. |
| Karaköy, 11–15 | Move cargo, moor the ferry, switch the tram and raise the fish-market shutters. | The Bride's moving carts hit zombies and can knock her off balance. Her rope still threatens the outer arc. |
| Galata Köprüsü, 16–20 | Secure screens and lines. On the lower stairs, brace behind one rail and cross to the other before the second wave. | The Fisherman's hook reels Arda in if it catches him. Dodging the cast gives a longer opening. |
| Eminönü, 21–25 | Keep the delivery moving, clear the stalls and move sacks to reach the Captain. | The Captain's anchor charge cuts a lane through his spice clouds. Dodge across it, then use the cleared ground to close in. |
| Sirkeci, 26–30 | Move a railcar, help the station guide, repair the clock and follow the platform's three signal lights in order. | Dodging both live rail lanes gives a window to hit the Ticket Man. A missed dodge preserves his shorter recovery. |

**Deviations.** Galata's footbridge finish hold drops from 14 to 6 seconds. The bridge
wave uses two brace points 2.96 m apart. Sirkeci's signal task replaces an 8-second
stationary hold, with 10 m between the power panel and gate to fit the route. The
Fisherman's recovery increases from 1.05 to 1.65 seconds on a missed cast.
Vatman and dock carts use their own configured crowd damage. The route revision is 11.

**Verification.** Eleven focused suites passed. Both route suites passed again after the
last bridge and Sirkeci adjustments. The view checks exercise the actual objective text
and ring drawing for the second bridge brace and next platform light. Eight-seed automated
checks covered the six finales, which each cleared 8/8 in the main sweep, and the changed
routes. Bölüm 9 cleared 8/8 and the final Bölüm 29 tuning cleared 8/8. Bölüm 19 cleared
7/8, with the remaining run dying to regular enemies. The browser screenshot check
stalled at the local browser connection. Human pacing and presentation review remain open.

### 2026-11-16 · Bölüm 19 asset follow-up

The first corrected screenshot showed the retired `pier:deck` landmark overlay. Removed it
from all bridge stage definitions and deleted its unused painter. The normal bridge and
lower-deck floor render through their existing layers.

The second screenshot showed the earlier ImageGen bollards with a second bright stroke
drawn over them by the generic collision-prop renderer. The bridge now uses lower,
weathered octagonal bollards directly, with one world anchor and uniform scaling.
The geometry, collision width and route objective are the same. If the sprite cannot
draw, solid posts retain a clear footprint without substituting the old sprite.

**Asset.** Built-in ImageGen with the Arda art as a style reference. The production
[bollard sheet](../prototype/assets/bridge/bollard-v2.png) is 640 × 213 with alpha.
The generation prompt was

> Create a small environmental game asset in the hand-painted inked illustration style of the attached Project Istanbul sprite sheet. Use that bitmap for line quality and camera only. Near-overhead 3/4 orthographic mobile game camera looking down, read even as 25 pixels. Render exactly three low historic Galata Bridge cast-iron safety posts beside one another in one landscape PNG with genuine alpha transparency. Three evenly spaced equal cells in one row, feet share a horizontal baseline. Draw each as a very squat tapered OCTAGONAL block rising from a broad octagonal bolted base, with an angled polygonal stone-gray flat top, similar to old industrial bridge guard posts. Height (top-to-bottom in projected image) only about 1.15 times width. No cylinder, no domed top, no neck, no stacked rings, no long shaft. Choose a subtle sloping shape with wide shoulders, weathered charcoal cast iron, warmer slate gray metal corners peeking through with subtle scratched off paint. One painted short diagonal stripe on the FRONT face in worn ochre or cream, not a belt around the object. Variant 1 sandstone/charcoal with soft ivory paint; variant 2 warm graphite with muted ochre paint; variant 3 paler blue-gray graphite with a small paint chip, no stripe. Different small bolts and chipped paint. Use enough larger light planes for muted brown wood underneath to contrast. Clean, refined materials, confident not thick outlines. Standalone props only, no shadows on ground, no surface or scenery, no floor, no text, no logos or borders. Each discreet, historic and firmly grounded.

**Verification.** Chromium loaded Bölüm 19 from the Mac preview. Its canvas drew the
replacement sheet at the bridge posts. The inspection showed the curb without the
old slab. The rendering regression covers loading, collision and incidental sidewalk
posts, crop bounds and all three variants. Bridge route, raster items and fonts passed.

### 2026-11-16 · Galata Köprüsü ferry and water

Bölüm 19 uses the same overhead camera as ordinary play. The rescue and lift
scenes can pan or zoom that camera. The lower-stairs wave has no camera override.
The earlier tilted screenshot could not be reproduced. A normal Bölüm 19 run
showed less than 0.2 degrees of shake over 12 sampled frames.

The blue rectangles were the original paint for the sea collision strips. The
open water outside those strips used a second look. One ImageGen water texture
now reaches the bridge edge. Street signs and sidewalk props stop at the shore.
The new ImageGen ferry sails bow-first beside the deck and leaves a wake. Its
position depends on time and the route in the world. Bridge collision and the
lower-stairs objective retain their existing geometry and rules.

**Asset prompts.** Water used no source image. The ferry used the old production
image as a style reference. Both were generated with built-in ImageGen.

> Create one square 1024x1024 hand-painted seamless tile of open sea water for an overhead Turkish comic-style mobile game, the Golden Horn in Istanbul under diffuse daylight. Camera looking straight down, no horizon, shoreline, objects, lettering or framing. Dominant desaturated deep petrol teal and cool blue slate, with smooth softly changing overlapping broken wavelets of a few different lengths. Very subdued lighter bluish highlights, a few narrow curved softly broken strokes, darker irregular water eddies, subtle readable translucent reflections. Clear sense of liquid from curved ripples, no straight parallel lines, no grid, no angle cues, no repeating streaks or bright cyan. Low contrast against enemy and character art, game environment ground texture. Shade consistent and EXACT TILEABLE at all four edges, compact organized texture for repeating across one contiguous body of water. Entire canvas is filled by the water, no transparency.

> Full single isolated traditional Istanbul Golden Horn passenger ferry game sprite for Project Istanbul. The attached original ferry art references the ship's style, cream passenger cabin with dark teal hull, small ochre-and-cream funnel, mast and bow deck. Use a different camera: genuine overhead near 3/4 orthographic action game camera with roof and decks dominant, ship axis perfectly VERTICAL and centered, pointed bow at top center (heading straight north), symmetrical port and starboard silhouette, rounded flat wide stern at bottom center. BOTH sides of hull visible symmetrically and much less sidewall than the reference. Use the bridge game's painted comic ink and warm weathered cream shell colors. Render one entire ship with ample transparent padding, upright vertical exact alignment with canvas edges, rough length-to-beam ratio 2.8 to 1. Natural crafted rail details and subtle dark outlines. No perspective diagonal or horizon, no dock, no water, no waves, no wake, no ground shadow or reflections, no people, no emblems, no letters. Genuine alpha background. Portrait PNG tall canvas.

**Verification.** Chrome loaded the Bölüm 19 route and drew the overhead ferry
with an upright canvas transform. The scene art, bridge route, quality, raster world
and raster items suites passed. The scene art regression checks both shore geometries, sprite proportions,
bow-first travel and independence from camera position.
[In-game screenshot](media/R1/bridge-art/bolum-19-ferry-and-water.jpg).

### 2026-11-16 · District art rule and Bölüms 1–30 sweep

The owner's art rule is a standing requirement in [AGENTS.md](../AGENTS.md) and
[the design system](../docs/design-system.md#121-in-game-art-review).

The sweep found legacy paths shared between districts and separate paths in
scripted scenes. The updated street renderer selects an illustration for each
bench axis, uses overhead bodies for road and rail vehicles, and keeps replaced
façades from switching to the old frontage on a failed load. The tram uses
one illustration across idle, rush and switching scenes. Karaköy's ferry comes
in along the quay. The waterfront renderer clips water and props to the shore
and keeps moored skiffs out of the ferry lane. Boat-shaped cover in the quay's
collision layout is now shown as a skiff on supports. Generic route arches
introduced by the placeholder renderer were removed.

The scene check rendered four poses from each of Bölüms 1–30, plus a second seed
at the lowest quality tier in eight levels. The poses cover the entrance,
objective, hold or boss approach and exit. The renderer traces cover the retired
water and vehicle paths and the current files for the poses. The scene-art test
covers both bench orientations, the centered tram rotation and the failed-image
footprint. This was a sampled art review. Full animation and alternate-seed
coverage remain open, as do individually illustrated replacements for the
restaurant furnishings and bespoke objective props such as Karaköy's crane and
Eminönü's awning. Playable template Bölüms 31–100 share the new renderers and
still need their own district reviews.

The final browser recheck covered Bölüms 12, 13, 18, 19, 21 and 26. Scene art,
bridge route, Karaköy route, street readability, raster world, fonts and quality
checks passed. Captures show the [Karaköy mooring](media/R1/district-art/bolum-12-mooring.jpg),
the [tram switch](media/R1/district-art/bolum-13-tram-switch.jpg) and the
[bridge rail ending at the deck](media/R1/district-art/bolum-18-deck.jpg).

**Production art.** Built-in ImageGen, with artwork saved under
[street illustrations](../prototype/assets/streets/) and sources listed in
[provenance](../art/PROVENANCE.csv). The existing overhead ferry was the style
reference for the bench views, truck, pillar, shop wall and rowboat. The approved
tram used the earlier tram illustration as its reference.

**bench**

> Create one traditional Istanbul park bench for Project Istanbul, a game sprite on transparent alpha. Shallow 3/4 overhead orthographic view looking downward, bench centered and perfectly horizontal parallel to the image edge. The bench faces the lower edge of the picture. Both ends at the same screen height, slats and back rail perfectly horizontal without any diagonal recession. Warm brown weathered wood with simple clear black ink outlines, dark cast iron frame and rounded ends. Overhead angle high enough to see a generous seat surface as well as a narrow front plane. Readable at 60 pixels wide. Reference image is entirely for art style and material shading, do not draw a boat. No ground shadow, flooring, surroundings, label, or watermark. Wide landscape format, one complete silhouette, isolated on true transparent alpha.

**rowboat**

> Create one small Istanbul wooden fishing skiff as a production in-game sprite with transparent alpha. Exactly top-down orthographic, hull centerline vertical, pointed bow at top center and transom stern at bottom. Port and starboard symmetrical, no tilt, no vanishing point. Pale worn wood inside, teal gunwales, dark navy hull edge, two straight crosswise wooden seats and a coiled rope kept inside the hull. No oars protruding from boat. Length roughly 3 times beam. Match the attached ferry game's hand-painted ink line, texture and lighting style only. No passengers, scenery, water, dock, shadows, motion lines, text or logo. Portrait PNG on genuine transparent alpha. Draw the entire individual boat with a small even margin.

**bench-lengthwise**

> Create one traditional Istanbul street bench, isolated as an in-game sprite on true transparent alpha. Designed for a north/south sidewalk axis. The wood slats run exactly vertically up the screen, its feet and two ends are on that same vertical axis, the backrest on image right and the bench faces image left. Orthographic predominantly overhead view; show the wood seat, iron arms and small hint of the legs, with no vanishing point or skew. Match the game reference's hand-painted ink, warm wood and dark cast iron palette. Readable at small size. The reference is for style only. No shadow on ground, floor, background, lettering or watermark.

**truck**

> Draw one compact muted blue-gray cab-over cargo truck for Project Istanbul. Absolutely top-down, camera sees light warm gray corrugated box roof, a pale steel blue cab above it, distinct dark windscreen and two mirrors, everything clearly aligned along a vertical center axis, front at the top, rear at the bottom. Parked on the left or right curb parallel to the road, so no tilt, no perspective taper, no sidewalls prominent. Around 2.8 times as long as wide. Match the supplied game ferry's textured ink, line weight and palette as inspiration only. Full vehicle on genuine alpha transparency, no cast shadow, asphalt, lettering, brands or labels.

**shop-wall**

> Create a single horizontally aligned run of historic Istanbul storefronts as one game sprite for Project Istanbul. Steep three-quarter top-down orthographic angle from south, seen over their roof. One modest charcoal zinc shallow roof, facing the bottom edge contiguous amber and muted burgundy cloth awnings and shop window bays, roughly six narrow bays. 6:1 wide strip of building, designed as an obstacle laid exactly from LEFT to RIGHT, roof and sill lines perfectly horizontal and perpendicular walls straight up/down, no angular perspective. Entire visible silhouette including ends, no floor or sidewalk. Muted painterly warm aged stone, dark ink edge and gently textured cedar from the reference style only. Ground contact along the entire bottom edge; no shadow ripped into sprite. no signs, lettering or logos. Genuine alpha background, no background scene.

**pillar**

> Create one short Istanbul pedestrian stone pier, a square-footprint stone bollard, as an isolated hand-drawn game sprite on actual transparent alpha. Like the in-game art reference in line, palette and subtle texture only. Steep three-quarter top-down orthographic camera, a warm gray sandstone cap and a dark aged gray pilaster wall below it. The foot is a firmly planted squat square plinth, no dramatic perspective or diagonal rotation, and the top and base align horizontally with the frame. Visually simple and readable at 48px. No lamps, symbols, environmental elements, ground, floor or cast shadow.

**tram**

> Make a video game sprite of the SAME urban electric streetcar pictured, red waist, old cream metal roof, dark squared windshield. Switch the camera to a strict overhead 90 degree orthographic view, looking exactly straight down from above. The streetcar is perfectly vertical with the FRONT at TOP and rear at bottom. The rigid rail tram body is a long straight rectangle with only SMALL corner radii like a rectangular railcar, blunt square ends, straight parallel sides, almost the same width across every row. Clean narrow black steel bumpers and one round lamp on the flat front. Roof dominates, stacked small rectangular roof vents, one black trolley pole over the center. Clear narrow visible strips of red steel cab and window edge, tiny undercarriage at ends. No boat features at all: no railing, no bow, no passenger decks, no masts, no marine elements. True 4.2:1 length-to-width, one whole rail vehicle. Match the black ink and graphic colors of the reference and draw only the tram, transparent alpha, slight transparent margin, portrait canvas, no tracks, road, pavement, shadow, labels, number or text.

### 2026-11-16 · Second independent gamer audit

[Second-pass report](GAMER-AUDIT-PASS2-2026-11-16.md) reassesses the implemented fixes,
with new browser evidence and repeated progression probes. No production changes.
Compact dialogue, navigation-state rules, early recipe support, Kaan's intercept and
new district counterplay are recognized as improvements, not reported as missing again.

Remaining findings: celebration still covers speech; a browser recipe chip exposes
`card.needRank` although source loading resolves it; build payoff falls off after the
L1–4 guidance; Nightmare omits the authored trials in six independently initialized
samples; Kaan's once-per-run assist does not yet fulfill the playable/tag-switch intent.
The report gives scoped tasks and acceptance checks. No masterpiece, retention or
Hades-parity claim is established by desktop simulations or screenshots.

The repeated seed-42 campaign cleared 30/30 with seven recovered runs and two evolutions.
Focused knife/gloves cleared 28/29 with five evolutions, up from 27/29 and two in pass one.
Detailed sweep and test status are recorded in the linked report and evidence directory.
Physical iPhone input, audio, sustained performance and uncoached repeat-play appeal remain
unverified. No commit, push or merge. Recommendations remain proposed; stop for feedback.

**Second-pass final validation:** the 240-attempt sweep completed: 230 clears, 183 death-free,
10 losses, zero crashes/timeouts. Previous sweep: 232 clears and 180 death-free. L13–14
remain hotspots; L19/L30 need human learning checks against their changed mechanics.
Gamer-route, fonts, bridge-route, Karaköy-route and Sirkeci-route all passed. This audit's
full suite was deliberately interrupted during arsenal stress to reduce contention;
its earlier arena-evolve failure was a localhost sandbox block. No full green claim.

### 2026-11-16 · Turkish narrative second pass (proposed D-103)

Owner requested a further clarity, continuity and engagement pass, explicitly allowing
necessary dialogue and comic additions. Implemented locally: **81 revised TR lines and
11 new beats**, including short post-victory comics at L10 and L15. The family calls now
advance information; Kaan has a clear shared plan and reason to stay; the campfire,
garage and arrival connect personal motives to the route. The broadcast/letter conflict
is explicit. Death and the empty home retain quiet space around the humor.

Fixed bark exchanges overwriting unread setups and rescue-start lines incorrectly
using the completion pool. New delivery regression passes and fails against the old
scheduler at the expected 1.4-second replacement. Dialogue, strict guardrail and
scene-art checks pass; language-independent sim digest stays `a2a5874e85`. Browser
layout audit: 0 flags / 2,219 rows; final preview limitations are recorded in the report.
The full suite was stopped during prolonged arsenal stress after four passes; no
full-green or pre-push clearance claim.

**Deviations:** earlier confirmation of the family destination, new connective story
facts, an explicit radio/letter disagreement, two optional-to-skip victory pages, and
view-side reading-time scheduling. No sim/balance numbers, new cast, dependencies or
new input system. Preserved concurrent L30 post-fight call and route changes.

[Full review and validation](TR-NARRATIVE-PASS2-2026-11-16.md) ·
[Current narrative in play order](TR-NARRATIVE-READTHROUGH-2026-11-16.md) ·
[Every second-pass edit](TR-NARRATIVE-PASS2-CHANGES-2026-11-16.md).

Nothing committed, pushed or merged. Wording and D-103 remain review drafts. Stop here
for owner feedback; verify the final wording on a fresh phone build before acceptance.

### 2026-11-16 · Second gamer audit implementation (proposed D-104)

This pass addresses [Astra's findings](GAMER-AUDIT-PASS2-2026-11-16.md) inside the
existing Chapter 1 slice. Bölüms 31–100 currently available via the map have
received no new district design in this pass.

- **P2-01:** The streak celebration is a 26 px badge with no wipe or entrance
  overshoot. It checks its painted rectangle against the settled bark, route
  marker, attack warnings, hero and controls on every frame. This may suppress
  the badge during a crowded moment. The streak count stays in the HUD.
- **P2-02:** Warm reload over the old local server with a study save, then a
  fresh no-cache launch, produced identical Turkish L30 card text. English,
  150% text sizing, and a deliberately removed rank key also passed. The
  capture's original mismatch did not recur on the current files. The compact
  recipe wraps and the established localized level phrase handles missing
  tables. The preferred playtest server sends no-store.
- **P2-03:** Past onboarding the player can spend one existing reroll to redraw
  with one card tied to their last weapon upgraded to rank 2 or higher. Two
  weighted choices still appear, and the normal redraw is available. Guidance
  ends when the recipe has no eligible action. Ordinary late offers keep
  their distribution. No new XP, currency, damage or passive requirements.
- **P2-04:** Nightmare keeps the authored route and boss mechanics. It changes
  each district boss's phase-one opening sequence and reverses the first
  shelter brace on L19 and the signal side order on L29. Existing warning
  timing, stats and mode rewards are preserved. Night Shift has its own route.
- **P2-05:** Kaan's protective sweep has more time on screen and now responds
  to one follow-up Dash while enemies and a shared objective are nearby. A
  small cue appears when that Dash is useful. L25's quiet scene acknowledges
  cover only if the sweep hit a threat. Playable/tag-switch Kaan is an open
  design decision. Lead review requested on the prototype behavior in D-104.
- **P2-06:** New ImageGen illustrations are anchored to the Karaköy crane and
  Eminönü awning, with their procedural moving parts retained. New restaurant
  counter, fridge, table and chair art shares the existing gameplay camera and
  foot anchors. Modern art failures use simple silhouettes where necessary.
  See the [physical phone and learning protocol](PLAYTEST-SCRIPT-R1.md).
- **P2-07:** L19's Çöpçü shows the lane its bin or crate will roll through,
  matched to that object's reach. An outline draws above crowd sprites
  during the roll. This replaces a small warning at the start position for
  the authored bridge encounter. Retest L13's bloater pressure and L19's
  shelter decisions with players. No attack speed, damage or health changes.

**Controlled build samples.** Same seed 42, expected meta power, chosen test
starter, and active skills. The bot recorded original and replacement offers,
selected ranks and forks, missing requirements, and time left after evolution.
Across L3, 5, 10, 15, 20, 25, and 30 the focused policy evolved the knife at L5
with 96 seconds remaining and the canister at L20/L25 with 51/52 seconds
remaining. None of those three evolved with ordinary offers in the matching
samples. All three evolved on L3 with either policy. Nail gun had no later
evolution in either run and the L15 nail-gun policy timed out in both. This
comparison isolates the card mechanic with a chosen starter. The campaign
gives Arda the knife and players still need to find the other weapons.

**No-revive Normal, seeds 1–8.** Clear counts without/with active skills:
L5 4/8 and 6/8, L13 3/8 and 3/8, L14 2/8 and 7/8, L19 4/8 and 4/8,
L30 5/8 and 8/8. L19's active-skill recheck after the roll cue was still 4/8.
Prior L19 failures included three rolling-object deaths. Three of the
five L13 active-skill failures were direct bloater hits. This is a cue and
learning check, not evidence for an ideal difficulty curve. Nightmare smoke
runs across L5/10/15/19/20/25/29/30 cleared 22/24 with up to one revive
before adding the L19 roll cue.

**Deviations.** Route revision 12, one optional guided reroll past onboarding,
Nightmare order tweaks, one gated follow-up sweep after 8 seconds, Kaan's
visible action 1.05 → 1.45 seconds, a conditional L25 line, and the L19 moving
hazard warning. New assets and labels are local. Shared art placement and
the movement/impact lessons still need player observation at normal speed.

**Browser and regression checks.** Chrome sampled the actual L14 and L28
renderers at seed 42 with a bark and route cue active. At 390×844 and 320×640
emulated viewports, a conflicting rectangle suppressed every sampled streak
frame from start to expiry. Free space let the badge draw again. The second
viewport used reduced motion and flashing. The L30 card check compared cold
and warm loads. Live draw tracing confirmed all five restaurant assets and
the L11/L21 fixed anchors through two movement states. Arda's current atlas
now starts decoding at manifest load so it is ready earlier.
[Restaurant](media/R1/gamer-pass2-implementation/l1-restaurant.jpg) ·
[Crane and cargo](media/R1/gamer-pass2-implementation/l11-dock-crane.jpg) ·
[Awning mid-lift](media/R1/gamer-pass2-implementation/l21-market-awning.jpg).

The focused run passed gamer-route, anim-flavor, progress-ui, modes, dialogue,
scene-art, fonts, bridge-route, Karaköy-route, Sirkeci-route and enemy-behaviors.
The raster-art suite passed on retry with localhost access. Its Node-only run
also passed all 159 checks.
Actual iPhone reach, audio, sustained performance, retry learning, and the wish
to replay remain unverified. Hold expansion until that playtest is reviewed.

### 2026-11-16 · Mila reunion continuity correction

Owner caught a missed knowledge gap: Mila named Sarıyer before Arda shared his news.
Revised two existing lines and added six native TR/EN beats plus `fin_arrive_c`, a
four-panel conversation page after the door scene. Recognition, family news and the
shared-route decision now happen in that order. Existing generated apartment art,
tap-to-advance and hold-to-skip; no combat interruption or sim change.

Dialogue, strict guardrails and scene-art checks pass; TR/EN sim digest `a2a5874e85`.
Browser preview timed out, so this new page is not visually verified. Earlier layout
audit results do not cover this follow-up. No full-suite rerun, commit, push or merge.
The concurrent `E25cover`/Captain branch is preserved and excluded from authorship claims.
See the correction section in [the narrative report](TR-NARRATIVE-PASS2-2026-11-16.md)
and the regenerated [readthrough](TR-NARRATIVE-READTHROUGH-2026-11-16.md). Stop for feedback.

### 2026-11-16 · Mac movement hotfix

Reproduced a dead zone when mouse drags start in the upper playfield. The Mac
preview applied the phone's floating-stick placement rules to mouse presses.
Primary mouse drags now steer from anywhere on the playfield. Touch starts
still use the documented lower area and handedness setting.

Input regression suite passed. Local Chrome verified arrow keys, WASD and an
upper-playfield mouse drag in Bölüms 1 and 19. The normal opening also handed
over control after holding Skip. The direct playtest link skips the opening.

### 2026-11-16 · Keep Arda visible when hit

The opening screenshot matches the full-white hero hit flash. The illustrated
hero now keeps his colors under a fading hit tint. The tint expires on the
real clock, including when play pauses. The game's hit effects budget and
Reduce flashing setting still apply.

**Deviations.** Hero-only tint starts at 36% opacity and fades over the
existing 60 ms. This is visual feedback. Movement and damage rules are unchanged.

Feel, input and fonts passed. The Node raster suite passed all 160 checks,
including the fading tint. The exact player tab was unavailable for inspection.

### 2026-11-16 · Bölüm 1 playtest fixes (proposed D-105)

- Replaced the Tünel entrance with a fixed, illustrated stone arch with an open
  passage and a localized plaque. Low graphics uses the same sprite. If the
  sprite is unavailable, the plaque stays readable and the floor stays visible.
- Restored comic portraits and full speech bubbles to Mom and Arda's live
  dialogue. The existing overlay placement protects the hero, destination and
  attack warnings. The panel follows the current scripted line.
- The call timer runs during speech. The indicator clears on silent stretches,
  starts again with the next exchange, and clears on signal loss.
- The Pause build shows all twelve item positions in three columns. Rank
  badges and mod chips stay within their tiles. Deferred icon loading updates
  only the icon, and the pause menu scrolls vertically at large text sizes.

**Verification.** Dialogue, gamer-route, scene-art, progress-ui and fonts passed.
Chrome checked the opening call, silence, the passage exchange and signal loss.
It traced the current Tünel illustration at high and low graphics and simulated
a missing sprite to confirm the legacy arch stayed out of the player build.
The pause grid fit twelve filled items with mod chips at 100% and 150% text.
At the shortest viewport the last row scrolled fully into view. These were
in-game browser fixtures. A continuous player run and physical touch testing
remain open.

[Call during play](media/R1/istiklal-playtest-fixes/mom-live.jpg) ·
[Tünel entrance](media/R1/istiklal-playtest-fixes/tunel-arch.jpg) ·
[Full pause build](media/R1/istiklal-playtest-fixes/pause-build.jpg).


## Third player experience audit — 2026-11-16

Review-only follow-up after D-103/D-104 and the latest portrait, movement and art fixes. Report: [GAMER-AUDIT-PASS3-2026-11-16.md](GAMER-AUDIT-PASS3-2026-11-16.md). Verdict: substantially stronger prototype, not yet demonstrated masterpiece or competitor parity. The next investment is coherent player-caused moments, reciprocal companionship and musical/emotional continuity, rather than additional system breadth.

Current evidence: all 30 normal levels at seed 42 with active skills/expected per-level loadouts, plus 24 Nightmare cases. Combined 51/54 clears, 36/54 without death; no reported crash/timeout. Normal L20 loses; this small sample is diagnostic, not a balance target. Short Chrome L1/L19 interaction, map/growth inspection, current TR narrative review and Captain/L30 comic preview complement source and asset inspection. No claim of thirty manual clears, critical audio listening, current physical-phone acceptance or a fresh earned campaign.

Ten valid focused suites passed. An initial invalid suite name (`dialogue-delivery`) produced MODULE_NOT_FOUND; corrected `barks-delivery` passed separately. Full suite not run; no full-green or pre-push clearance claimed. Evidence: [telemetry/gamer-pass3/README.md](telemetry/gamer-pass3/README.md); screenshots under `media/R1/gamer-pass3/`.

New concrete findings include misleading restaurant exit wording, inconsistent Street Cred terminology, and relaxed portraits weakening the Captain grief scene. The unused intense track is a documented current design limitation, not a missing asset. The report provides 15 prioritized findings, three bounded signature-experience prototypes, a 30-level improvement table, implementation stages and human acceptance gates. Prior implemented fixes are explicitly preserved.

No gameplay code, balance numbers, assets, dependencies or accepted design decisions changed. No commit, push or merge. Design changes remain proposals for the owner and implementation chat. Audit complete; awaiting owner feedback.

### 2026-11-16 · Third audit implementation (proposed D-106)

**Comprehension.** The restaurant wall opening, collision gap and arrow now share the door coordinates.
Both languages point to the marker. The growth screen consistently uses Sokak Kredisi / Street Cred
and gives one concrete action that trains each attribute. The missed-bonus HUD uses a neutral badge.
The results header shows the optional reward outcome even at a viewport where the recap scrolls.
The local telemetry records `route_clear`, `bonus_id` and `bonus_result` separately. The cue sheet
and music comments identify the eight prepared owner tracks and the 49 prepared sound effects.

**İstiklal, Bölüm 3.** After walking around the parked tram, players can use a curbside switch to sweep
the live crowd. An outlined lane shows where to lure them. The curbside ring signals the tram,
the bell warns before the vehicle arrives, and movement remains live. Only enemies actually on the
tracks count toward the payoff. Normal play can bypass the switch and carry on to the chestnut cart.
Calling an empty tram gives feedback and leaves the route to the cart available. The second level keeps its
staged teaching encounter. The local `route_beat` events record the call, actual kills and rail contact.

**Eminönü, Bölüm 23.** Kaan clears enemies from the delivery path and stays visible briefly. When a
crowd remains near him, the route strip gives Arda an optional Dash instruction. The Dash must pass
through a live threat near Kaan to shove it back. The confirmation follows the contact. The delivery
continues if the player Dashes the other way or misses the opening. The Captain’s aftermath still branches on the existing witnessed-cover condition.

**Deviations.** The live switch has a one-second nominal link, reduced by crowd pressure. The warning
lasts 1.4 seconds in normal and one second in Nightmare. The tram travels across a 13 m lane, with
1.9 seconds from entry to its far endpoint and a clearing tail. Rail contact can deal up to 18 base
damage. Kaan's return-cover window is 4.2 seconds. Both mechanics use the existing inputs and assets.
The authored route revision is 13.

**Automated play.** Seed 1 finished all thirty levels using earned progression. The following
eight-seed runs used expected per-level equipment, active skills and no revives. The bot bypassed
the optional switch in Bölüm 3. These runs are diagnostic samples.

| Bölüm | Normal clears | Nightmare clears | Follow-up |
|---|---:|---:|---|
| 3 | 8/8 | 6/8 | Both Nightmare losses near the crossing came from regular enemies |
| 13 | 3/8 | 2/8 | Three normal losses ended on a bloater hit across different points of the route |
| 14 | 7/8 | 3/8 | Three Nightmare losses ended on a bloater hit |
| 19 | 4/8 | 2/8 | Losses include toxic zombies, bloaters and one Nightmare rolling-lane hit |
| 20 | 6/8 | 2/8 | Both normal losses occurred in the Fisherman's arena, one to a bloater and one to the boss |
| 23 | 8/8 | 6/8 | Check the optional Dash under mixed weapons |
| 29 | 8/8 | 3/8 | All sixteen runs missed the optional booster bonus |

**Remaining acceptance.** Observe uncoached players choosing when to call the tram and deciding
whether to return Kaan's cover. Critical listening, the four-scene musical motif and the scene-specific
comic acting remain open. A cold Chrome start can still expose older fallback sprites before the
raster sheets finish loading. Verify the opening frame, missing assets, lowest effects settings
and sustained touch and performance on an actual iPhone before carrying these patterns beyond
the current slice. The failure counts identify playtest scenarios. They do not identify which
losses were unavoidable or establish a target clear rate.

**Portrait verification.** Chrome used a 390 × 844 playfield and seed 42. The opening exit
worked with a keyboard and an emulated touch drag at 150% text. Controlled scenarios verified
the tram warning and live sweep, both the cue and the result of returning Kaan's cover, and
passing Bölüms 18 and 29 with the optional objective missed. In both clears the results
heading and bonus status fit above the rewards. Archived the following captures.

[Restaurant exit](media/R1/gamer-pass3-implementation/restaurant-tr.jpg) ·
[Tram preview clip](media/R1/gamer-pass3-implementation/tram-preview.mp4) ·
[Tram sweep](media/R1/gamer-pass3-implementation/tram-sweep.jpg) ·
[Kaan's cover prompt](media/R1/gamer-pass3-implementation/kaan-cover.jpg) ·
[Arda returns cover](media/R1/gamer-pass3-implementation/kaan-return.jpg) ·
[Clear with a missed bonus](media/R1/gamer-pass3-implementation/clear-and-bonus-29.jpg) ·
[Attribute training](media/R1/gamer-pass3-implementation/growth.jpg).

To reproduce the live action, enter Bölüm 3 with seed 42, go around the parked tram
and lead the crowd toward the marked track before linking at the curbside ring.
In Bölüm 23 with Kaan already recruited, pick up a sack under pressure and watch for
the cue to Dash through the enemies next to him. The automated fixtures cover
a successful sweep, empty tracks and getting caught in the lane. They also cover
a successful, missed and late return Dash.

**Checks.** All 48 prototype suites passed on the final build, including the Chrome
suites. The local art-source checksum check and `git diff --check` also passed.

### 2026-11-17 · Arda artwork at launch

Cold Chrome launches could reach the first gameplay frame before the current Arda image
finished loading. The player build now waits at the title after Start if that image is
pending. The title offers a retry if the image fails or the wait exceeds six seconds.
Retry keeps the selected launch and save. Arda uses his current front pose if a directional
frame is unavailable. The old hero remains in the explicit legacy comparison mode.

The automated browser check holds Arda's image request on a cold Bölüm 1 launch and
verifies that the first render uses the current sprite. A second check simulates a missing
image on Bölüm 29 and verifies that Retry opens the intended level after the image returns.
This check targets Arda. Other character sheets, landmarks and district art still need
the same cold and missing-image review.

**Checks.** Raster character, raster world, first-run map, progress UI, UI motion and
gamer route suites passed. The export smoke test now counts the JSONL download link
activated by each tap. Browser tracing showed one export from the pause menu while
the old object-URL counter advanced twice.

### 2026-11-17 · Weapon isolation, sound routing and the simit-cart prototype (proposed D-107)

The weapon lab now lists every extra weapon equipped in Mixed Weapons mode. That
mode reproduces nails alongside the hammer and blowtorch. The solo attack regression
runs all 17 base weapons at ranks 1–5 and all 18 evolutions against the same 96-zombie
crowd. It verifies the weapon and rank emitted by the actual fire event, rejects
cross-weapon damage sources, and rejects nail fire from every other weapon family.
The isolation fixture removes environmental blasts, which have their own damage
sources. The lab panel is smaller during a run so the attacks remain in view.

Chrome decoded 44 prepared effect files without failures and selected the prepared
hammer and nail recordings from actual combat events. The blowtorch's burn cue
uses the synthesized recipe because the prepared set has no burn recording. Pages
opened from disk and the explicit synth comparison also use synthesized cues.
A prepared buffer refused by the browser now falls back on the same cue immediately.
This was a routing check. Sound quality on a phone speaker remains open.

Eligible non-explosive simit carts in authored runs can be used once. Stop beside a
cart for 0.22 seconds while a threat is nearby. Arda braces to lift it, alternates
his grip direction through three progressively wider strikes, then winds up overhead.
The cart travels to the densest nearby group and breaks on landing. The player can
move while carrying it, at 72 percent of normal walking speed. New automatic attacks
give way during the grab and wind-up. Existing projectiles continue in flight.
The final launch uses an 8 m search and a 2.55 m impact radius. Parking, trajectory,
contact and landing are all driven by the simulation, including under reduced motion.

The portrait lab verified the lift, three swings, wind-up, throw and landing in sequence.
Lab tests also cover a farther cluster winning over a nearer single zombie. A local
eight-seed automated sample completed 36 of 48 runs without revives across Bölüms
2, 3, 8, 13, 19 and 23. It was a route smoke check using the normal bot, which does
not deliberately set up a cart attack. Bench and bin versions remain outside this
first prototype while the cart's weight and readability are being evaluated.

[Portrait capture of the cart attack](media/R1/street-weapon/simit-cart.mp4)

Ten focused suites passed, including weapon lab, weapon tiers, generated sound,
environment, route, UI, street readability, accessibility and scene art.

### 2026-11-17 · Car Door follow-through and combat audio (proposed D-108)

The Car Door finishes each sweep with a short heave and a throw toward the densest
nearby group. The panel turns edge-on in flight and rebounds briefly on the paving.
Contact damage and the shock ring occur at the landing point. The Minibus Door
uses its own larger landing and stun. The sweep still deflects spit before the
wind-up for the throw.

Cart and door strikes send regular zombies out of their stance and into a short
arcing fall. Survivors get a ground-locked shadow and a landing burst. Fatal hits
carry the same flight into the death pose, with the destination clipped to valid
ground. Floor bursts are visual feedback. The thrown door's landing deals area damage.

Routine kills now use the attack's impact sound. Removed the common death splat
and the Brute death groan. The butcher finale uses a quieter impact from the
existing blunt-hit set. The browser log recorded the door's release and crash
cues with zero calls to the old death sounds during the rank-five crowd run.

**Deviations.** The door has a 0.28-second throw wind-up and 0.52-second flight.
Its landing radius starts at 1.75 m and increases by 0.13 m per rank. The original
Minibus slam radius and stun now apply at the landing point. Lift height and
duration scale with the strength of the strike.

**Checks.** Nine focused suites passed. Chrome verified three door throws with
29, 30 and 31 targets struck on landing across the recorded run. It also verified
the cart's complete sequence after the shared reaction change. With the Car Door
as the starting weapon, eight Normal seeds each cleared 8/8 in Bölüm 9, 4/8 in
Bölüm 19 and 8/8 in Bölüm 23 without revives. Physical phone mix and motion
review remain open.

[Portrait clip of the rank-five throw](media/R1/door-throw/car-door.mp4)


## Audit-only — Fourth player-experience pass (2026-11-17)

**Request.** Reassess the implemented improvements holistically and across Bölüms
1–30, bosses, progression, narrative, art/animation, audio and the mobile experience.

**Packet.** [Full fourth audit](GAMER-AUDIT-PASS4-2026-11-17.md), including
12 prioritized work packets, all 30 level reviews, six boss analyses and three
signature-moment proposals. [Reproduction and evidence](telemetry/gamer-pass4/README.md).

**Verdict.** Distinctive mechanics and clearer growth navigation; not yet a
masterpiece. Confirmed gaps include old guide/flag dialogue over the Tower Keeper
encounter, different essential plot facts in TR/EN, missing explicit training
categories for new weapon families, rounded/incomplete attribute benefits and
results advice that recommends an already-owned pairing. The Captain still uses
the big-brother atlas; Ticket Man does have a dedicated three-pose body override.
Scene-specific acting, musical motif and physical-phone acceptance remain open.

**Checks.** Full prototype suite **48/48 passed, zero failures**, exit 0; no reruns
reported. Initial sandbox port restrictions required a restart with local-server
permission and are not game failures. Normal matrix: **108/120 clean wins**, no
crash/timeout. Boss sensitivity: **48 executions** (12 deliberately repeat natural
baselines); supplemental equipment is a counterfactual, not an earned build.
Fresh earned campaign: **all 30 levels in 31 attempts**, no revive, one L15 retry;
no purchased gear upgrades or focused rerolls. Comic fit audit: **2,231 rows, zero
flagged** across TR/EN, including material beyond the narrative scope of this pass.

**Key balance evidence.** Natural L15 seed 1 killed the boss in 9.8 seconds with
two signature windups; supplemental Car Door L5 seed 2 needed 235.2 seconds and
47 windups. These are encounter-specific sensitivity cases, not global win-rate
or human-fun claims. Report includes exact seeds, policy and all-level metrics.

**Limits.** Live desktop inspection covered selected gameplay, failure/results,
growth and current combat/comic fixtures. It was not a manual completion of all
30 levels or a physical iPhone listening/motion/thermal test. Retention and
voluntary replay remain unmeasured.

**Deviations / decisions.** None implemented. Gameplay, numbers, narrative and
assets were not edited. All design changes in the packet are proposed. Existing
shared working-tree changes were preserved; no commit, push or merge.

### 2026-11-17 | Astra audit pass 4, Chapter 1

**Encounter contract.** The following beats belong to the live encounters. The browser still supports legacy comparison flags for development. Ordinary play uses the authored fights and these cues. English and Turkish share the plot facts below. Dialogue remains authored separately in each language.

| Bölüm | Fighter and actionable tell | What Arda learns or gains |
|---|---|---|
| 5 | Vatman. Step off the lit rails and get clear of the bell. Close in when he is exposed. | Mom and the family left the apartment for Sarıyer. Dad's kitchen note gives Arda a reason to go home first. |
| 10 | Tower Keeper. Dodge the counterweights and move across the charge. | The tower falls quiet and wedding music leads Arda downhill toward Karaköy. |
| 15 | Dock Bride. Find an empty lane for the carts and back away from her rope sweep. | With the wedding over, Paşa leads Arda toward the bridge. |
| 20 | Big Fisherman. Sidestep the cast and exploit the unwound line. | The gate opens when he falls, and the HUD calls out the remaining crowd. Kaan joins after the crossing. He wants to find the Captain in Eminönü. |
| 25 | Captain. Read the anchor lane, sidestep the tow, and approach during recovery. | Kaan remembers his first day with the Captain and chooses to keep walking. Successful reciprocal cover on a cleared Normal L23 adds a specific memory. |
| 30 | Ticket Man. Clear the marked tracks and punish the missed punch. | The phone call confirms Dad mapped a route in the kitchen note and that the highway is unsafe. Arda and Kaan head for the side streets. |

**Training and build choices.** All 17 base weapons and 18 evolutions have a category and an impact tag, verified by tests against the registered arsenal. Car Door, Chainsaw, and their evolutions train Strength. Wielded-cart kills earn Strength training and count toward lifetime kills. They have no weapon-specific mastery track. The wire-cut pulse, tram, and incidental blasts count toward lifetime kills, with the existing elite bonus when applicable. Brute Force still affects only the attacks configured as heavy. The weapon detail shows that rule using the same flag as damage resolution. Minibus hit events now identify the evolved weapon so attribution and mastery agree. The Attributes screen shows actual and draft bonuses with fractional precision, expandable secondary effects and a separate Street Cred cost. After a loss, results include earned practice, mastery, and a recipe action based on what was missing. A paired rank-3 build can earn one matching candidate in the ordinary three-card offer. A lower-rank side weapon does not displace that focus.

**Directed scenes and street interactions.** The new ImageGen Captain asset uses planted-foot anchors and distinct anticipation, release, pull, recovery and defeat poses. The rope begins at the illustrated hand. The game waits for this asset on L25 and reports a failed load so the retired body does not appear in ordinary play. Kaan's farewell uses two new ImageGen portraits with a held towel and an eyeline change. The repaired L28 clock has a moving second hand and an audible cue. Sustained nearby pressure brings in the existing intense music. Boss defeat fades to quiet ahead of the aftermath, and the result sting comes after the story. L14's first two fish shutters draw nearby ordinary enemies to opposite sides and name the opening. Wieldable carts use a lift icon and show commitment as a ring that clears if Arda moves away or Dashes before pickup. Food remains on the ground at full health. Food that has reached the healing budget is visually quieter and flagged near Arda. The arena heal remains available independently.

**Numbers and decisions.** The cart hold changes from 0.22 to 0.60 seconds. Music enters intense after four sustained seconds with 14 nearby threats (or Frenzy), and returns to calm after eight quiet seconds with a 12-second minimum intense dwell. The shutter distraction lasts 3.2 seconds. Boss HP, defense and damage stay at their current settings. The balance observer records damage by source, the share during exposure, distance bands, phases and damage taken after a boss dies. The unchanged seed-2 Vatman reproduction took 235.2 seconds with the supplemental Car Door and 47 windups. Changing only the bot's positioning to exploit exposure gave 48.6 seconds and 11 windups. The natural build went from a loss to a 58.8-second kill under the same comparison. The 9.8-second Bride kill still reproduces. In Bölüms 13 and 19 the four-seed sample again returned two clears each. The recorded L19 hazard deaths were before the wave brace. Their damage histories include substantial bloater, thrown-object and contact damage. These traces do not support reducing the wave or increasing all boss HP.

**Review remaining.** The Captain is the first pose reference. Remaining work includes dedicated locomotion and additional action poses for the other encounters, the Bride's first-fight pacing, wider route and story treatment, the recurring home motif, cold-load coverage across all scenery packs, and human trials with earned saves. The browser scenarios use prepared encounter checkpoints. Physical iPhone feedback, sustained frame pacing, touch and the speaker/headphone mix still require device runs.

**Evidence.** The browser replay at portrait size verified the Captain windup, pull, recovery, Kaan's farewell, the repaired clock and the exact Strength preview. Captures are in `reviews/media/R1/pass4-implementation/`. The final Captain staging brings his first anchor into range and frames the new pose below the HUD. The recipe replay used the same ten focused knife fixtures before and after the offer change. None evolved before. Four evolved afterward with 28–67 seconds of the run remaining. Two additional fixtures reached a ready recipe. This compares bot policies and build rules, and does not estimate how frequently people evolve in live play.

The browser checked 255 comic layout rows per language with zero failures. Blocking the Captain asset produced the localized load message and prevented the level from starting. Retrying after restoring the file started the level. The final Captain encounter also cleared in all four expected-loadout bot seeds with the opening-aware policy. The focused regression tests, music tests, arsenal stress test and source checksums passed.

### 2026-11-17 | Throwable spice stalls and street furniture

The Eminönü spice stall sets the limit. In Chapter 1's authored routes, portable street props may be picked up if both sides of their ground footprint are at most 1.8 m. This covers small stalls, carts, benches, bins, crates and tables. Fixed fixtures and explosive props keep their current interactions. Eligible scenery uses the blue lift cue. The existing three swings and throw use the prop's original district artwork and variant.

**Deviations.** Eligible small spice stalls use the existing 30 HP stall value for their environment record. Pickup timing, swing damage and landing damage stay at the cart values. Proposed D-110.

**Verification.** The seeded route test checks normal Eminönü stall eligibility. The weapon lab checks the pickup, three swings, throw, crowd impact, one break and cleared collision. Chrome replay verified the same painted variant on the ground, held and in flight. The two-seed balance sample completed ten runs across Bölüms 10, 20, 23, 25 and 30 with nine clears and no crashes or timeouts.

### 2026-11-17 | Fifth player-experience audit

**Combat and rewards.** Exposed bosses take a different pose and get inward chevrons at their feet. The cue survives mute and replaces the oversized weak-spot word over the fight. The Captain leans and braces through the anchor work, with the chain following the painted grip during the deformation. The boss bar identifies the optional bonus and shows when it was missed. Defeat uses the actual attacker where one is recorded, including the runner or a district boss, and shows hazards by name. Both the ground chest and its opening use the illustrated chest. The normal reward animation lasts about 0.74 s, with a separate 1.7 s beat for evolutions.

**Builds and travel.** The two Knife forks name their follow-on effects. From L6, a build with a rank-4 focused weapon can receive its missing partner in one ordinary offer. A player who declines keeps the other options and can use the existing focused reroll. The guidance carries into legacy L31 independently of authored-route flags. Card events record the guided offer, and the result records first hit, last hit and hit count for each evolution. L4 keeps its cable operations in a 270 m base route. L9 keeps the bridge crossing in a 250 m base route. Both previously inherited the 325 m stage route. Those are the gameplay-number deviations in D-111.

**Story and art.** L30’s station switches and service passage lead Arda and Kaan toward the Grand Bazaar. The later calls and apartment arrival share facts across the two native scripts. The broadcast promises a safe zone, setting up Dad’s warning. The Captain farewell uses a calmer expression for Arda. A three-note phrase recurs at the farewell, Sirkeci departure and apartment arrival. Failed essential comic art offers Retry or Read without artwork. Each Sirkeci encounter waits for its required station art, with a localized retry path. Kaan’s menu shows the two usable ability unlocks.

**Verification.** All 14 focused suites passed, along with the commissioned source checksums. At 390 × 844, Chrome showed the Captain pulling and recovering, the bonus clock, the current runner portrait and the illustrated chest. Blocking one comic image surfaced the retry controls. Restoring the image recovered the same page. Blocking station art prevented an incomplete start. Restoring it let the same level start. The final lettering audit passed 255 rows per language. Captures are in `reviews/media/R1/pass5-implementation/`. The route check cleared L4 and L9 on all four seeds. Winning medians in this sample were about 184 s and 191 s respectively. L13 remained at two clears in four expected-loadout runs.

**Build experiment.** With the shorter routes, the earlier offer policy cleared L1–30 in 35 attempts. An offer guaranteeing a missing partner from rank 3 repeatedly stopped the same campaign at L5. The retained one-time version cleared L1–30 in 33 attempts. The unfocused policy still evolved only at L3. Eighteen focused trials on L7/L15/L23 produced 11 evolutions with 42–171 s of run time remaining. Their clear counts were three of six for Knife, six of six for Nail Gun and six of six for Picnic Gas Can. These are bot policy comparisons. The late-build and return-rate decisions need human play.

**Review remaining.** The readiness brief records the expansion inheritance contract, late reward checkpoints and the plan for three earned profiles. The full L29→35 handoff depends on authored Kapalıçarşı. The Captain still needs dedicated walking and transition art, and the other bosses and contrasting weapon pairs need the same motion review. The Bride’s short first encounter and L13’s hazard overlap are open balance cases. The phone protocol covers touch, speaker/headphone mix, frame pacing, reading, suspend/resume and voluntary return. The full regression run has a separate status from the focused checks.


## Independent gamer audit — pass 5 (2026-11-17)

**Scope:** current JS slice L1–30 plus the readiness of L31–100. Audit only; no gameplay, balance, art, canonical story or architecture changed by this pass. No commit, push or merge. The shared implementation work was preserved.

**Deliverables:** [full fifth audit](GAMER-AUDIT-PASS5-2026-11-17.md), [L31–100 readiness and proposed seventy-level encounter spine](CHAPTER1-L31-L100-READINESS-2026-11-17.md), [evidence and reproduction](telemetry/gamer-pass5/README.md). The reports distinguish verified fixes, unresolved outcomes and proposed new design.

**Verdict:** materially more coherent, still not a demonstrated mobile masterpiece. First-30 taxonomy, numerical previews, failure learning, Captain identity, Kaan farewell, shutter lures, cart commitment, clock consequence and threat-sensitive music have improved. Boss learning/duration tails, ordinary build payoff, motion continuity, early route cadence, secondary-screen art and actual phone/return evidence remain open.

**Evidence:** 120 expected-power Normal runs: 107 wins / 13 losses / no crashes or timeouts. Two 48-run boss matrices separate the original policy from optional exposure-seeking positioning. Original L5 seed-2 supplemental Car Door case remains 235.2 s / 47 windups; exposure-seeking case 48.6 s / 11. Natural L15 seed 1 remains 9.8 s / 2 windups. Fresh earned campaign: 32 attempts through all 30, retries at L15/L25, 71.5 simulated minutes, only L2/L3 evolved under this weapon-preferring/no-focused-reroll policy. Current comic preview: 2,237 rows, zero flagged. Selected live ordinary L1/results/progression, three explicitly isolated boss fixtures and Captain farewell inspected; not thirty manual clears or a phone listening/retention study.

**Expansion gate:** all seventy current L31–100 runtime inspections lack authored route milestones. Kaan's visible support stops at 30 and recipe guidance is route-trial gated. Base weapon unlocks finish at 21; Kaan bond caps around L38–42 with 75/100 still later-chapter placeholders. Resolve those inheritance contracts, current TR/EN northern-forest contradiction, later call/finale knowledge, and stale boss/letter numbering before scaling. The companion report preserves current canon and proposes a distinct required decision/payoff for every level 31–100.

**Build boundary and validation:** HEAD stayed `4f5361dc0f5306a0243719a8afba9382d4c9e9d3`, with pre-existing dirty work. During the audit the implementation chat began a separately owner-requested portable-prop expansion; sixteen files diverged from the audit's source-hash checkpoint. Completed sim results apply to loaded code at process start. The full suite was started in the background, completed four suites, and was interrupted after the moving build was confirmed; no full-suite pass or failure is claimed. Targeted-check final status is recorded below and in the evidence log. A fresh complete regression and device pass on the finished stable build remains required.

**Cleanup:** temporary visual fixture preserved only in the evidence folder; served copy removed. Audit localhost server stopped; owner's server left running. No assets were generated or replaced, and no new dependency/service was added.

**Deviations / decisions:** none implemented. Recommendations are proposals for the lead/owner; use the ordinary decision workflow before changing canon or architecture. Implement the prioritized outcomes in the main report and prove L31–35 as a coherent block before multiplying the design.

**Targeted validation final:** 8/8 passed, zero failures or reruns reported: dialogue, music, progress-ui, scene-art, gamer-route, karakoy-route, eminonu-route and sirkeci-route. Raw output: `reviews/telemetry/gamer-pass5/focused-suite.txt`. This does not supersede the moving-build limitation or the outstanding complete regression/device run.

### 2026-11-17 | Bölüm 1 restaurant, simit and the Cook

The two rings were simit from a broken cart. The full-health rule deliberately saves the food. The saved simit now appears without a pickup glow and has a localized nearby explanation. If Arda takes damage, the normal pickup glow returns and the food heals as soon as he reaches it. The later run healing cap remains in force.

The restaurant has a new ImageGen terracotta floor with a tulip tile border, an illustrated serving counter, warmer lighting, and a camera that frames the whole dining room before easing toward the street. The artwork brief used a quiet central aisle, a stone threshold aligned to the street exit, and a walnut and brass counter with a working döner station. The unnamed patron in the introduction has new resting and recoiling poses in the same elevated viewpoint as Arda. The opening waits for its art. A failed load returns to the menu with a retry message.

The Cook's original windup and hit frames were 160 and 130 pixels tall against a 256-pixel idle. The new ImageGen sheet follows the Cook's comic costume and uses one foot anchor and body scale. It has two distinct walking steps, bracing and raised-cleaver poses, a contact swing, a release and a breathless recovery. The warning and impact share a ground location. The camera draws a little closer when Arda is within range. Incidental barks wait during the strikes so the body motion remains visible.

**Deviations and decisions.** The combo starts within 2.65 m. A Cook that just threw can take a short 2.75 m/s step toward Arda. The ranged cleaver leaves his hand 48% into its marked warning, followed by 0.48 s of recovery. The final combo hit uses the existing 1.3 s exposure. Boss health, damage and simit healing amounts are unchanged. D-112 records these changes for review.

**Verification.** Chrome at 390 × 844 exercised the normal cold open and hold-to-skip, the playable dining room, both cart drops before and after taking damage, and the Cook's windup, hit, exposed recovery and cleaver flight. Blocking the floor image produced the localized retry message. Restoring it and opening the level again succeeded. Thirteen focused suites and the art source checksums passed. The expected-skill balance bot cleared all six Bölüm 1 seeds, five without a down, with a median run of 141 seconds. Physical phone play remains open. [Opening still](media/R1/level-1-opening/cold-open.jpg) · [Cook windup](media/R1/level-1-opening/cook-windup.jpg)

### 2026-11-17 | Boss size across poses

Eleven boss atlases use action drawings from a separate source sheet. The game applied the source scale of the idle sheet to both, even when the figure was drawn at a different size. The importer now records an action-sheet correction for each boss, based on the character's proportions. Canvas applies it around the existing pivot. The contact sheets show the poses at one consistent magnification per boss. The Cook, Captain and Ticket Man use their authored sheets, and the Cook's authored body also carries into his defeat animation.

The view also used the remaining recovery time directly to compress and rotate the figure. The Fisherman's cast and the Bellkeeper's counterweights can leave this timer at infinity while their effects resolve. Recovery now has a bounded lean, with only small squash coming from the existing animation and hit responses. This is a presentation fix. Boss timings, hitboxes and balance are unchanged.

**Verification.** The importer rebuilt and matched all 212 assets pixel for pixel. Automated checks cover the calibration and pivot of every boss atlas pose and finite transforms during indefinite recovery. Chrome at portrait size verified normal attacks at the Vatman, Bride and Fisherman checkpoints in Bölüms 5, 15 and 20, including the Fisherman during his indefinite cast recovery. All 11 focused suites passed, with the world-art browser test passing when rerun on its own. Master source checksums passed.

### 2026-11-17 | Sixth end-to-end audit — frozen latest slice

**Packet:** [sixth player-experience audit](GAMER-AUDIT-PASS6-2026-11-17.md), [reproduction/evidence](telemetry/gamer-pass6/README.md), [30-level metrics](telemetry/gamer-pass6/level-metrics.csv), [boss-policy comparison](telemetry/gamer-pass6/boss-metrics.csv), [visuals](media/R1/gamer-pass6/).

**Verdict:** improved, but not yet a demonstrated masterpiece or ready for production expansion beyond30. Latest fifth-audit changes and subsequent restaurant/simit/Cook work were included in a frozen copy. The report explicitly closes implemented fixes and supplies a finite remaining plan: actor continuity, earned-build payoff, readable hazard/mastery decisions, opening/UI clarity, direction of existing emotional highlights, and uncoached physical-phone evidence. The existing31–100 plan is reviewed with current fixes distinguished from its stale conflict tables.

**Verified progress:** saved-food explanation, consistent dedicated Cook sheet, new restaurant art, actual runner defeat portrait, Bonus label, shorterL4/L9, meaningful evolution hit telemetry, explicit Bazaar motivation and recurring home motif. Confirmed remaining visual defect: Keeper attack/hurt body shrinks under the shared atlas scale.

**Fresh diagnostics:** normal104/120 wins (103 no-down),16 losses, zero crash/timeout; fresh earned campaign30 clears/32 attempts but one evolved run. Knife-focused campaign15 clears/23 attempts,17 evolved attempts with actual hits, blocked after threeL16 losses. L13 extended sample11/24 wins.96 boss sensitivity runs across orbit/exposure-seeking policies: the separate orbit matrix has one supplementedL5 Cleaver timeout; do not confuse it with the timeout-free normal matrix. L5 seed2 natural293.2s/58 windups orbit versus54.5s/11 exposure-seeking. Supplemental loadouts and policy limits are documented. Fresh bilingual comic fit2237 rows, zero flags.

**Full regression finished:46/48 pass, two failures after automatic reruns, exit1.** `hints` omits the new Combat.dropHealRoom dependency in its isolated VM. `quality` lacks createTextNode and deterministic readiness for the new opening-art gate; audit-only diagnostics expose its never-entered-play condition. These are test-fixture integration failures, not reproduced ordinary browser crashes or measured30fps play. All logs archived. Implementation should repair the fixtures and rerun the stable full suite before claiming all green.

**Build integrity and limits:** all1229 checkpointed prototype files unchanged in workspace and frozen snapshot. No gameplay source, numbers, assets or user saves edited; no commit/push/merge. Selected live desktop views and simulations do not equal thirty manual phone clears. Physical touch/audio/performance and voluntary-return evidence remain open. Recommendations are proposals; no design decision was silently implemented.

### 2026-11-17 | Consolidated creative direction after audit six

The owner asked for more complete feedback to reduce piecemeal iteration, particularly bosses that lack occasion, agility and expressive attacks. Added [Masterpiece direction and closure contract](MASTERPIECE-DIRECTION-AND-CLOSURE-2026-11-17.md) as the implementation entry point alongside the sixth audit's evidence. It specifies the finished experience across 36 areas, movement/attack/camera/light/audio choreography for all ten named encounters, four emotional highlights, integrated delivery order and an observable completion bar. It separates confirmed issues, creative proposals and unverified player/device questions.

**Additional findings:** L2 Switchkeeper, L3 Roaster and L4 Linekeeper needed explicit encounter direction; the first five levels each have a named finale, so ceremony must distinguish local threats from district bosses. An isolated phase-2 movement probe confirms the direct-chase branch ignores configured phase speed multipliers for Captain, Fisherman and Keeper, while Bride/Ticket Man apply them. This is a consistency issue to resolve with intent/balance, not a recommendation to blindly speed up every boss. Existing zoom, shared grade, defeat effects and directional attacks were acknowledged; the brief directs them coherently rather than requesting duplicate systems.

**Current work boundary:** implementation chat is already repairing body-scale/rendering issues; four prototype files had diverged from the frozen sixth audit at this extension's checkpoint. Those repairs were not re-certified here. Sim/config files used by the movement probe were unchanged. No gameplay source, assets, balance or saves changed by this extension; no new full-suite or physical-phone claim. [Probe and source checkpoint](telemetry/gamer-pass6-direction/).

**Deviations/decisions:** no design changes implemented. Proposed reference fights are Vatman (heavy spatial) and Bride (agile angular), followed by the complete cast and whole-run flow. A normal-speed integrated recording, earned-save checks and player/device evidence are required to close an experience; merely adding its named feature is insufficient. No message was sent to the implementation chat.

### 2026-11-17 | Holistic gameplay redesign and single implementation prompt

The owner requested a substantially more holistic and innovative brief, plus one prompt that directs the implementation chat to execute and verify the entire package. Added [Holistic experience redesign](HOLISTIC-EXPERIENCE-REDESIGN-2026-11-17.md) as the primary implementation entry point, with [one copyable prompt](IMPLEMENTATION-PROMPT-HOLISTIC-2026-11-17.txt). Earlier audit evidence and detailed boss direction remain supporting documents; their entry links now point to the expanded scope.

**Concrete gameplay proposals:** deliberate street-object acquisition with offensive versus placement/lure use; six local route opportunities with bounded, remembered consequences; reciprocal Kaan help using several useful established actions. They are connected to every level's encounter decision, build economy, story and aftermath. These are proposed additions, not features claimed to be already implemented or proven fun.

**Additional source findings:** current prop use runs an automatic sequence and requires a nearby threat; current pause renders menu/build rather than objective context; attribute-specific READY ranks can resemble a shared allocation pool; perk eligibility checks rank/Cred rather than previous-node ownership; melee training differs from heavy-weapon perk eligibility. Grit's damage-based training and scarce hack/rescue opportunities are flagged as incentive/balance risks to measure, not demonstrated human exploits. Existing elemental interactions and Kaan support/repayment are explicitly retained as foundations.

**Coverage and completion:** H01–H18 covers all 36 prior areas, with a 30-level design table, progression architecture, four directed story scenes, six playable signature moments, all ten named encounters, native-dialogue review, in-context asset/audio inventory, earned-build verification, save/interrupt/accessibility checks and future-level inheritance. The prompt authorizes one integrated implementation pass when the owner sends it; reference fights and passing tests alone are not the handoff boundary.

**Validation and limits:** document links and the complete G01–G36 crosswalk checked; main brief remains below the 600-line file limit. [Source checkpoint](telemetry/holistic-brief/source-checkpoint.json) records the inspected source at authoring completion, not a frozen new playtest. No new manual 30-level clear, listening/device study or full-suite result claimed. No gameplay, assets, saves, canon or balance changed; no external message, commit, push or merge. Physical-phone and unaided-player evidence remains explicitly separate from autonomous implementation verification.


### 2026-11-18 | Expansion plan reconciled with holistic implementation

At the owner's request, updated [the existing L31–100 plan](CHAPTER1-L31-L100-READINESS-2026-11-17.md) in place; retained its filename, all seventy encounter rows and the canonical walk home. The narrative spine remains valid. The revision now inherits the holistic brief's deliberate prop use, bounded local choices and memory, reciprocal Kaan actions, practical progression/pause architecture, complete boss acting and experience verification.

**Current-source distinctions:** closed the plan's obsolete claims about opposite radio advice, late-call/empty-apartment facts, boss numbering, letter prose, the old Kaan last-level cutoff and core recipe guidance depending on an authored route. New source has level-specific street setups, six enumerated local-choice levels and three callback mappings; these require authored expansion definitions. The newer `entryBuildThrough: 30` boundary governs several initial/invested-offer and survival-choice paths and needs an intentional earned-save comparison at L30→31. Core guidance continuity alone does not settle that policy.

**Planning changes:** explicit run-local versus persistent/memory/knowledge state; distinct first-clear street-memory versus later-qualifying Kaan-help settlement; old-save neutral outcomes; fourteen district applications; novelty/capability budgets; actual practice/perk/build/bond checkpoint evidence; a detailed L29→35 handoff matrix; all-workstream first-30 acceptance before expansion authorization. Clarified that L54 retains the owner-directed combat approach followed by a protected scene; no silent conversion into a wholly non-combat level. Existing pipe/cover/light rules are preferred before assuming new light-carrying or moving-platform technology.

**Evidence boundary:** source/doc inspection while implementation is in progress, not a fresh gameplay audit or confirmation of its completion. The implementation packet still had evidence statuses pending when inspected; source presence was distinguished from verified experience. No implementation statuses were changed. All 70 level rows, links, whitespace and the <=600-line document limit checked (369 lines at validation). No runtime content, balance, saves, assets, canonical dialogue, dependencies or future levels changed. No full suite started or interrupted, no message sent to the implementation chat, and no commit/push/merge. The completed first-30 audit remains the next expansion gate.

### 2026-11-18 | Holistic first-30 implementation checkpoint

**Playable:** [current Mac build](http://127.0.0.1:8765/). Base commit `4f5361dc0f5306a0243719a8afba9382d4c9e9d3`, branch `r1/p2.1-turkish-dialogue-audit`, with prior and current local worktree changes. [Runtime fingerprint](telemetry/holistic/checkpoint.txt)

**Implemented:** deliberate street-object handling, placement and Dash drop, six bounded local choices and saved first-clear facts, alternate Kaan repayment, route-aware pause, build-directed offers and attribute-specific application. Added illustrated memory panels, adjusted the joining/farewell/station compositions, preserved the scale correction and added direction, framing and warning cues across ten bosses. Verified and repaired the Galata bell’s frame error in Chrome. Moved authored moored boats off decks and removed the successful-load toast from active station play.

**Verified:** 48/48 regressions, local source hashes, 500/500 authored layout cases, desktop route samples for all 30, ten normal-speed staged boss samples, four story sequences and six signature moments. Earned melee, ranged and terrain campaigns each reached L30, with 90 clears in 105 attempts. Three known pressure cases cleared 7/8, 7/8 and 8/8. Separate boss stress profiles yielded 43/48 orbit wins and 45/48 wins when entering openings.

**Remaining:** the ranged simulation timed out once on the L5 approach and a supplied Cleaver orbit case still timed out. Complete choreography, natural consecutive play, full weapon-family and audio review, interruption, phone and uncoached-player acceptance remain open. The package report lists each gap and separates desktop fixtures, earned simulations and actual-play coverage. Expansion remains design-only.

**Deviations and decision:** documented under Proposed D-113. Changes include the L2/L3 route distances, carry/cover lifetimes, offer scope, clear-earned Grit, capped auto-target preference, Vatman recovery and three nearby pressure limits. [54-requirement implementation packet](HOLISTIC-IMPLEMENTATION-2026-11-17.md) · [Encounter cards](HOLISTIC-ENCOUNTERS-2026-11-17.md) · [Audio, story and progression](HOLISTIC-PROGRESSION-AND-STORY-2026-11-17.md) · [Expansion plan](CHAPTER1-L31-L100-READINESS-2026-11-17.md)


## Independent gamer audit · pass 7 · 2026-11-18

Read [GAMER-AUDIT-PASS7-2026-11-18.md](GAMER-AUDIT-PASS7-2026-11-18.md) and its [reproducible evidence](telemetry/gamer-pass7/README.md). Verdict: improved first-30 slice, not yet masterpiece or expansion-ready. No gameplay implementation changes, save changes on the user origin, commits or pushes were made by this audit.

Fresh verification: 48/48 suites; expected-power sweep 112 wins, seven defeats, one timeout across 120 attempts; earned broad 30/33, melee 30/38, ranged 30/36 and terrain 30/31. Three focused campaigns reproduce the implementation packet. The 1,233 recorded prototype hashes matched the workspace at verification.

New reproduced defects: live cards/pause use next-run result copy; evolved Netspear/Twin Saw/Foamstorm damage can leave evolution-use counters at zero; automatic prop contact commits offense even when the player subsequently places cover; L29 light selection adds no distinct circuit or wave benefit over no selection. L30 also repeats L26’s service-car line. Recorded zero-hit evolution counts must not drive balance until variant attribution is repaired.

Remaining experience closure: boss acting, L5 low-progress orbit versus L30 two-windup earned clears, visible consequences for the six local choices, level-specific world actions, chronological dialogue and full progression/reward flow. The report provides ten bounded closure items, all-30 encounter rows, ten boss finish targets and ordered acceptance. Existing H01–H18 remains the scope; no new systems or post-30 production is authorized.

Evidence limits: desktop L1 failure/result/progression loop and short direct-entry L14 sample, source/ordered-story inspection, supplied staged images/sample video and fresh simulations. No all-30 manual-clear, critical-listening, physical-iPhone or human-retention certification. Those named acceptance gaps remain open. The expansion roadmap remains a design document with the first-30 gate, then an earned 29→35 pilot.

### Pass 7 implementation checkpoint

Local JS prototype on `r1/p2.1-turkish-dialogue-audit`. [Audit](GAMER-AUDIT-PASS7-2026-11-18.md)

| Finding | Status | Change | Evidence and remaining work |
| --- | --- | --- | --- |
| P7-01 | Implemented | Upgrade and pause recipe hints show actions available in this run, including an ingredient on the current offer. Results keep their retrospective copy. | Regression covers the screen wiring. Locale copy needs normal-speed review across all offer shapes. |
| P7-02 | Implemented | Weapon actions carry the variant when fired through direct, delayed and area effects. Evolution telemetry includes first effect, applied damage and observed control separately from the family used for practice. | The audit's Netspear, Twin Saw, Foamstorm and Cleaver fixture recorded 4, 21, 11 and 6 hits. The delayed spear regression verifies the pre-swap shot cannot count for Netspear. All 18 evolved variants recorded actual contact in a controlled trial. |
| P7-03 | Implemented | Automatic swings can supply offense evidence. Placing cover takes precedence until the route opens. | Regression covers both outcomes in L12, L17 and L22 and first-clear persistence. |
| P7-04 | Partial | Cover is placed closer where geometry permits, survives eight seconds and shatters at expiry. L12 retains a second ferry line after the cover branch. L27 light previews the escort endpoint and second wave area. L29 light previews the circuit before power-on. | Route simulation and geometry coverage. Paired populated playthroughs and the complete Kaan sequence still need a player-facing review. |
| P7-05 | Partial | Vatman closes distance before ringing his bell and plants for longer on recovery. The Ticket Man enters the split-rail phase earlier and alternates his signature actions. | L5 seed 3 orbit reached phase two but still lost. Its opening-punish retest cleared in 113 s. L30 still needs a fresh earned-build playthrough after the final timing edits. |
| P7-06 | Partial | Knife contact has a clearer core and follow-through. Chain runs from Arda's grip and trails its sprocket. The car door pushes a directional impact forward. The saw remains in Arda's hands for the rev, with animated teeth and distinct defeated-zombie motion. Captain and Ticket Man have separate moving boots. | Focused animation, combat and route regressions. Full normal-speed checks for every weapon, all directional poses and all ten bosses remain open. |
| P7-07 | Partial | Stand beside a marked object to break it, light its fuse, spray foam or lift it. Moving away cancels the hold. | Regression verifies contact, cancellation and the escape window. Consecutive manual play and the broader physical-readability review across L1–30 remain open. |
| P7-08 | Implemented, playback open | No recycled mid-route lines across L21–24. L30 names the rail points. The family explains why the route map is worth going home for. The Captain's reveal stays with Kaan. Mom's live panel gets priority over incidental quips. | Dialogue and route checks. Chronological first-clear review and optional paths still need playback. |
| P7-09 | Partial | Strength perks list compatible weapons. Arsenal marks the starter and card-pool weapons. Gear distinguishes owned from equipped, and bond explains that support carries over. The Cook and Vatman have specific defeat advice. | Menu and route tests. Independent mastery, gear, bond and return-flow usability remains open. |
| P7-10 | Device review open | Existing music, SFX and accessibility paths are included in the test run. | Physical iPhone speaker/headphones, interruption, sustained performance and critical listening remain unverified. |

**Owner playtest follow-through.** The optional L1 booster briefly interrupts a live comic panel, pauses its dialogue timer and resumes the same line at completion. Skipping the ring leaves the call uninterrupted. Using the ring before Mom calls leaves the first call tied to its existing story trigger.

**Deviations.** The prop hold is 0.72 s with 0.60 m reach outside the hero radius. L1's deliberately ignited legacy canisters get the existing 1.2 s gas fuse. Placed cover expires after eight seconds and drops no additional loot when it expires. Vatman recovery extends to 1.55 s after the tram and 1.45 s after the bell. The Ticket Man changes phase at 62% health. See Proposed D-114. The audit's first-30 acceptance remains open.

**Verification.** The content checksum and targeted game, art, music and sound tests passed. Earned broad, melee, ranged and terrain campaigns reached L30 using the telemetry fix before the final boss timing and presentation edits. Foamstorm credited blocked spit in the terrain campaign. The full suite was started with local browser access. The world-art Chrome check failed while reading atlas status, so the full suite is still unverified. The browser smoke captured the opening and did not complete the interaction retest. Physical iPhone verification and the full normal-speed chapter review remain open.

### 2026-11-18 · English dialogue audit

Reviewed all 1,205 EN entries; revised 212, retained 993. Corrected story knowledge,
character motivation, family-call answers, Paşa continuity, Dad's approved letter
voice, and mismatches between hack/event triggers and spoken outcomes. Existing
Mila knowledge exchange preserved. Native English authoring; no TR rewrites.

Dialogue, strict guardrails, bark delivery and scene-art checks pass. English browser
layout audit: 1,121 rows, zero flags. Current TR/EN sim digest: `7ee009df2f`. Full suite
not rerun; no full-green merge/push claim. Global editorial advisories are documented.
No new content systems, pages, beats, balance or simulation changes. Revised lines
are drafts with approval markers removed. Nothing committed, pushed or merged.

[Audit and validation](EN-DIALOGUE-AUDIT-2026-11-18.md) ·
[Story readthrough](EN-STORY-READTHROUGH-2026-11-18.md) ·
[All changes](EN-DIALOGUE-CHANGES-2026-11-18.md). Stop for owner review.

### 2026-11-18 · Experiential quality PRD packet (documentation only)

Owner requested detailed execution direction for the ten experiential concerns plus adjacent factors, and explicitly accepted optional monetization with a viable free progression path. Created [the main PRD](PRD-EXPERIENTIAL-QUALITY-2026-11-18.md), [combat direction](PRD-EXPERIENTIAL-COMBAT-2026-11-18.md), [scene direction](PRD-EXPERIENTIAL-SCENES-2026-11-18.md), [acceptance/delivery](PRD-EXPERIENTIAL-ACCEPTANCE-2026-11-18.md), and [the implementation prompt](IMPLEMENTATION-PROMPT-EXPERIENTIAL-2026-11-18.txt).

Scope: E01–E14, all 30 world beats, ten boss treatments, 17 base weapons/18 evolutions, live enemy roles, four major story sequences, health/interactions, progression information hierarchy, sound/camera, interruption/accessibility/performance and free-path balance. Reconciles the current pass-7 checkpoint and latest native English audit; their implementation reports remain reports rather than new independent verification by this chat. Recorded owner direction and proposed production design under D-115.

No game code, assets, balance numbers or runtime state changed. No gameplay test suite was run for this documentation task, no physical-device/player acceptance claimed, and no other chat was messaged. Document validation covers links, required roster/level/requirement coverage and new-file line limits. Implementation and final experience evidence belong to the execution packet; independent first-30 review still gates expansion.

### 2026-11-18 · Experiential implementation and available acceptance

Implemented the complete E01–E14 first-30 packet locally. [Implementation matrix](EXPERIENTIAL-IMPLEMENTATION-2026-11-18.md) · [complete roster/weapon/evolution/boss coverage](EXPERIENTIAL-COVERAGE-2026-11-18.md) · [all-30 pacing](EXPERIENTIAL-PACING-2026-11-18.md) · [44 scene contracts and player walkthrough](EXPERIENTIAL-SCENES-2026-11-18.md) · [evidence and exact external checklist](EXPERIENTIAL-EVIDENCE-2026-11-18.md).

Current illustrated Arda/enemies use articulated steps, contact and transitions; physical work/carry ownership and truthful hit/heal/critical feedback were extended. Knife contact/grips and concurrent saw ownership were refined while retaining other working weapon identities. Protected boss entry and actual L20/L25/L30 defeated-body/native aftermaths share the suspended gameplay clock, safe reading/skip/background/resume and variant-specific seen history. Actual exit and existing exactly-once settlement remain authoritative. Scope on pause/results/equipped comparisons and the L30 review boundary are explicit. Latest native TR/EN, evolution firing attribution, eight-second cover and first-clear/relationship facts remain current.

**Verification:** final background full suite **49 groups, zero failures**, plus current focused scene/feedback regression, browser art-failure/retry/neutral-reading/background/reload checks, earned attribute/perk transaction and music/mute checks. Runtime (1113 files) and local-source SHA-256 checks pass; `git diff --check` passes. [Exact dirty build and manifests](telemetry/experiential/build.json). All **155 primary audiovisual files** use the same frozen runtime hash, with 17 base weapons × ranks 1/3/5, 18 evolutions, six conditional outcomes, all live roles, 30 first-action world fixtures, ten bosses, conflict/accessibility, opening, actual Dash/defeat, six simultaneous weapons and three actual first-clear earned scenes. Supplied assists, automated input and desktop-only provenance are identified. [Indexed media validation](telemetry/experiential/media-validation.json).

Four independently earned/no-spend/no-ad/no-revive campaigns: **120 clears / 136 attempts, 15 deaths and one pre-boss navigation timeout**. Four-seed supplied expected-power sweep: 109/120 wins, zero timeouts. Ten bosses × three earned samples × two policies: 30/30 evasive and 28/30 punish wins. Losses, short early boss clears and late low-payoff evolutions are retained in the raw diagnostics. These are route/balance diagnostics, not player enjoyment or retention evidence.

**Evidence correction:** the original diagnostic `saveBefore` retained a mutable state reference and serialized after rewards. It was fixed by cloning at entry, then all four campaigns were rerun: sim outcomes, entry loadouts and evolution traces are identical. L20/L25/L30 were re-recorded from genuine pre-clear saves and assert first-clear results. Earlier replay-save films and intermediate staging remain archived and are excluded from final primary evidence. A real captain-walk crash and largest-text resume font issue found during integration were fixed; obsolete fixture assumptions and recording-tool failures are documented separately.

**Adopted details/deviations:** Proposed D-115 records deliberate intent/health/presentation timings. The previously accepted L2 tram payoff remains protected after live approach/calling, an explicit retained exception to the appendix's all-live wording. Existing Stormshield procs on actual Nazar dodge, not Dash; source mechanics and truthful conditional footage were retained. No weapon damage/cooldown/boss-HP changes were made to fit presentation. No real monetization flow or SDK was added; free progression remains independently viable.

**Recommendation:** ready for a fresh independent first-30 audit; no unresolved functional blocker was found in completed checks. Artistic acceptance remains open for rig joins/contact weight, dense six-weapon occlusion near an edge, role recognition, short early bosses, repeated work verbs, late evolution payoff, civilian variety and audio fatigue. Named physical-phone sustained/touch/audio/interruption evidence and 5–8 consenting unfamiliar-player checks remain pending with an exact checklist. Desktop capture and bot wins do not substitute for those gates. This checkpoint grants no masterpiece/Hades-parity, release or expansion approval.

Nothing committed, pushed, merged, installed, purchased or sent to another chat. Godot remains paused; no production beyond L30 was authored.

### 2026-11-18 · Independent experiential audit, pass 8

**Verdict: not a masterpiece yet; first-30 artistic acceptance and expansion remain gated.** [Main player-experience audit](GAMER-AUDIT-PASS8-2026-11-18.md) · [E01–E14 closure matrix](AUDIT8-PRD-CLOSURE-2026-11-18.md) · [all-30 levels and complete weapon/boss directions](AUDIT8-LEVELS-AND-ASSETS-2026-11-18.md) · [consolidated implementation brief](AUDIT8-IMPLEMENTATION-BRIEF-2026-11-18.md).

Audited a frozen copy of the dirty build based on `4f5361dc0f5306a0243719a8afba9382d4c9e9d3`; all 1,113 runtime files matched the supplied evidence manifest. Independently reran the full suite (**49 groups, zero failures**) and broad earned campaign (**30 clears in 33 attempts, three deaths, no Second Wind**); outcomes/times match the supplied broad run. Direct fresh-English L1 play covered opening, fight, defeat/revive, first clear, story, result, attribute improvement and menus. Reviewed all-30 world-action fixtures, ten boss fixtures, all base ranks/evolutions, major scenes, conflict cases, source and the supplied wider balance data. [Evidence and limits](media/R1/audit8/README.md) · [machine-readable result](telemetry/audit8/audit-summary.json).

Confirmed defects include static Mom call using the stranger portrait, read comic pages not becoming usable Memories, zero weapon-badge catalogue entries from the wrong namespace, misleading beneficial stat labels, Gear art over stats and sign occlusion. Evolution arrived after Cook in direct play. Major aftermaths still compete with a full illustrated panel, loot prompts and obsolete threat visuals. Movement/contact, boss identity, repeated work decisions and scene acting need a coordinated craft pass. L2–4 short boss demonstrations, L10 punish losses and L15's first-attempt losses require targeted earned-build review, not a global HP increase.

**Evidence correction:** Screamer pauses on an upgrade card; the following seven enemy movies remain frozen at 103.083333 sim seconds. Their file-validity checks do not establish active animation. Current Cook “two-policy” diagnostics use the same L1 route, generic campaigns exercise no choice branches, and the street collector listens for names the runtime does not emit. These gaps are explicit in the new closure requirements.

**Late workspace reconciliation:** eight runtime edits and one new civilian atlas landed after the frozen-build checks. The 1,114-file visual-follow-up manifest matches the later workspace. Source diff and selected supplied stills support authored hero strides, six civilian identities and corrected opening-rule speaker mapping. Preserve those corrections; this audit's original gait frames no longer describe the latest stride. The separate static Mom-call defect remains. The new build was not independently replayed/full-suite tested here; the implementation's new suite was still running at inspection. [Exact scope/delta](telemetry/audit8/late-workspace-delta.json).

No physical iPhone, perceptual audio audition, unfamiliar-player sample or full manual first-30 campaign is claimed. Direct play used one explicit free prototype revive and may have triggered the first-run Second Wind; tool-input gaps preclude treating it as a human difficulty measurement. Tests/fixtures do not establish Hades parity or retention. D-116 records three new **unapproved proposals** separately from approved-PRD corrections. No runtime, asset or balance edits; no commits, push, merge or other-chat message. Audit browser tabs closed, temporary viewport reset and own server stopped; owner's server/save untouched. Documentation packet is ready for owner review and handoff.

### 2026-11-18 · Owner screenshot corrections: portraits, civilians, Arda gait

The owner caught three visual regressions after the experiential handback. Fixed the opening's second rule using `Story.forLine` instead of a hardcoded stranger portrait; actual TR/EN rendering now requests Arda for all three rules. The bearded portrait is the anonymous stranger, also legitimately used by the Galata opening, not a replacement hero.

Fleeing civilians now retain their seeded variant and use six distinct illustrated identities with four run frames each. The one restaurant-patron asset no longer represents every fleeing crowd member. Created a new atlas with built-in ImageGen using the existing hero only as a style reference; source, exact prompt, alpha and provenance are retained. Arda's lower body now uses intact authored side/front/back strides joined at the actual painted waist; the outward knee reconstruction was removed from his locomotion while attack/work grips and upper-body acting remain.

[Correction report, artwork and prompt](CHARACTER-VISUAL-CORRECTIONS-2026-11-18.md) · [new build/source identity](telemetry/visual-corrections-2026-11-18/build.json) · [seven normal-speed recordings](media/R1/visual-corrections-2026-11-18/index.json). Fresh openings and the ordinary naturally spawned L1 crowd are separated from supplied movement/weapon/lineup fixtures. The earlier experiential media remain dated frozen-build evidence, not footage of this correction.

Focused scene/art/quality/feedback checks pass, including stable six-row identity, intact lower-body pixels/waist and hand mapping. Normal-speed playback covers all eight directions, minimum quality/reduced motion, and run+knife/chainsaw/hammer. **Final integrated full suite: all 49 groups passed, zero failures.** Source/media/asset hashes and report links verified; `git diff --check` passes. No sim, native dialogue, balance, collision, dependency/service, future-level production or Git publication changed. The earlier test passes missed these visual regressions; artistic quality still needs owner/independent playback judgment. Physical phone/player gates remain open.

### 2026-11-18 · Revised audit-8 handoff after owner priorities

Owner sees visible Arda movement progress, questions the value of further locomotion work, deprioritizes highly detailed regular-zombie animation and wants comparable bodily credibility for bosses. Prepared [one execution prompt](IMPLEMENTATION-PROMPT-AUDIT8-2026-11-18.txt) and updated [the existing brief](AUDIT8-IMPLEMENTATION-BRIEF-2026-11-18.md) rather than issuing another full PRD.

Recommended allocation: retain Arda's current strides and repair only demonstrated defects; ordinary enemies get bounded role/tell clarity; all ten bosses get purposeful feet/body/tool/turn/recovery/defeat acting. Cook and Captain are internal references, not intermediate handoff gates. Health/object feedback, all weapons, earned balance/evolution timing, all-30 spatial variety, progression and exact major-scene direction remain required. Added a complete boss action contract, explicit healing/damage demonstration and a short normal-speed before/after evidence reel. N1–N3 are deferred from this round's recommended scope. Updated the owner ledger, D-116/D-117, handoff pointer and level/asset scope note so older broad animation wording does not override the current priority.

Read the latest visual-follow-up result: its implementation-run full suite has now finished at 49 groups, zero failures. That does not relabel the earlier independent audit as a test of the newer build. This turn changes documentation only; checks cover local links, coverage, consistency and file limits. No gameplay tests rerun, runtime/asset edits, new tools/services, commits, Git publication or messages to the implementation chat. The owner can forward the prepared prompt; nothing starts automatically.

### 2026-11-18 · Neighbor-aware civilians and global portrait identity guard

Owner found adjacent civilian copies and the stranger returning during the booster interruption. Fixed both shared paths. Fleeing actors receive a stable view-only appearance selected with nearby/projected runners in mind; no actor positions, movement or RNG are changed. Unknown portrait names no longer fall back to the stranger. The booster uses canonical `anne`, the existing Mom alias resolves to Anne, and popups also retain neutral identity instead of inventing a stranger. Legitimate stranger roles remain explicit.

[Correction and evidence](CROWD-PORTRAIT-GUARD-2026-11-18.md). All 407 current Arda dialogue bindings resolve to Arda. Actual source-crop regressions verify Mom and all hero moods; unknown identities stay neutral without blocking a page. Two hundred seeded opening scenarios retain stable appearances with zero adjacent copies across 93,091 near-neighbor observations. Focused experience, scene-art, quality, bark, dialogue and raster/browser groups pass; no new full-suite claim is made for this small view-only follow-up. The preceding 49-group full run remains attached to its own source snapshot.

Normal-speed browser evidence follows the ordinary L1 crowd and real booster with automated movement/card choices, no supplied actors or power. The shared guard applies across current and future level presentation paths. No new art, native script, mechanics, dependency/service, post-30 production, commit/push/merge or message to another chat.

### 2026-11-19 · Revised Audit8 implementation and integrated verification

Completed revised brief §§0–7 across the active first 30 Bölüms. [Implementation / E01–E14 and P8-01–15 matrix](AUDIT8-IMPLEMENTATION-2026-11-18.md) · [all-30 spatial/pacing/failure review](AUDIT8-PACING-2026-11-18.md) · [complete weapon, evolution, role, boss and scene coverage](AUDIT8-COVERAGE-2026-11-18.md). N1 alternative starters, N2 new environmental boss counters and N3 new replay variants remain deferred.

**Visible changes.** All ten bosses have purposeful preparation, coordinated tool/body contact, recovery and weighted defeat. Seven receive measured eight-pose atlases; Cook/Captain/Ticket Man retain grounded authored parts. Knife/chain/saw sources and hand ownership were refined; Cable and the other established identities remain. Mechanisms visibly connect to loads/landings, rescue/porter/fuse work has physical action, and meaningful resolution gets a brief release of new ambient pressure. Damage, restored health, shield and critical state remain distinct on mute. The four major sequences use visible world acting before dedicated native comic reading. Memories actually save/replay; mastery, Gear, beneficial stat labels, equipped skills, results and return hierarchy are repaired. Pause exposes an explicit owned-weapon plan using the existing recipe aid, preserving ordinary side-upgrade/chest commitment.

**Retained priorities.** Arda's latest running and neighbour-aware six-civilian assignment are byte-identical to the pre-Audit8 baseline. Ordinary-zombie work is bounded to actual lure facing and role/tell verification. Native TR/EN voice files, canonical identities, current illustrated assets, protected clock/skip/retry/settlement, eight-second cover and first-clear relationship facts are retained. Dialogue-engine recent-history handling changes; voice text does not.

**Exact source.** Frozen runtime `81a885795a562dd930b3428f5531548de69f03b6119ba7c2e4d19d5e587c3ce3`, 1,125 served files, dirty branch `r1/p2.1-turkish-dialogue-audit` at unchanged HEAD `4f5361dc0f5306a0243719a8afba9382d4c9e9d3`. [Metadata](telemetry/audit8-implementation/verified-build.json) · [source checks](telemetry/audit8-implementation/source-checks.json) · [exact staged deltas](telemetry/audit8-implementation/candidate-deltas.json). Older movies retain actual source identities. The final Main-only change fixes cold asset-await startup in the benchmark/weapon preview; simulation/art/native voice files match the final earned-play build `e538c15a99…`.

**Verification.** Final background suite: **50 groups, zero failures**. Focused health/archive/badge/contact/lifecycle/route/commitment regressions pass. Runtime/frozen-source, local-source checksums, retained gait/native voices, JS syntax, introduced file limits, report links and `git diff --check` pass. [Completion summary](telemetry/audit8-implementation/verification-summary.json). The cold preview uses real selection/rank/start buttons and advances with live input. All three desktop benchmark scenes complete without exceptions/interruption: frame p95 16.7–16.8ms; 200-visible-enemy work p95 5.9ms. Desktop measurements do not establish phone performance.

**Earned balance.** Four actual free/no-ad/no-revive all-30 profiles: 120 clears in 150 attempts, 28 losses and two audit-driver timeouts. Those exact timeout saves/seeds clear after the driver stops pursuing a destroyed object. All 60 boss policy/power comparisons clear; both Cook policies now differ. All 18 focused evolutions acquire from actual offers and affect real targets with useful remaining engagement, without granted ranks/terrain/outcomes. Actual browser recordings include L22 offense/placement→L24, linked L23 help→L25, neutral/current/stored-help endings, earned plan→Grinder, and first-session/results→Memories→replay/reload. Losses, missed offers and supplied condition fixtures remain separately labelled. Bot wins are not enjoyment evidence.

**Review evidence.** [61-second full-viewport, normal-speed before/after reel](media/R1/audit8-implementation/before-after.mp4) · [197 indexed full recordings](media/R1/audit8-implementation/index.html). Source-linked films cover 30 actions, ten bosses, 17 base weapons × ranks 1/3/5, 18 evolutions, 14 natural first-30 enemy roles plus two explicitly additional fixtures, major native scenes, default/minimum six-slot crowds and mute/text150/reduced variants. Exact ImageGen prompts/source/measurements and rejected intermediates remain in [the import ledger](../art/commission/generated/2026-11-18-audit8/IMPORT.json). Stream validity supplements active-clock/contact/frame inspection; it does not certify artistic success or listening.

**Adopted deviations.** Proposed D-118 records reachable Keeper exposure/reset, one moved Bride supply, reduced shutter/sack repetition, actual once-per-target trolley consequence, L2–4 phase-order diversity, post-resolution ambient relief, L30 points/service-path placement, collision/path-checked real roadside cars at L13/L25 and explicit run-scoped owned-weapon planning. Food carts no longer impersonate car terrain. No global boss-HP inflation, hidden scaling, alternative starter or new counter rule was added.

**Recommendation and gates.** Ready for a fresh independent first-30 audit; no functional blocker remains in completed checks. Named physical-iPhone sustained touch/interruption/performance, human headphone/speaker listening and 5–8 unfamiliar-player observations (including one uncoached first-30 playthrough) remain pending, with exact scripts in the implementation report. These block artistic/mobile/TestFlight acceptance and expansion approval. This checkpoint makes no masterpiece/Hades-parity or human-enjoyment claim. No dependency/service/SDK, Godot migration, post-L30 production, commit/push/merge or other-chat message.

### 2026-11-19 · Opening converted-diner visibility correction

Owner found the first converted diner invisible. Reproduced: frozen age-zero scene projections repeatedly triggered half-size/opacity spawn effects and regenerated dust over the actor; drawing order used his original seat, and his completed approach reverted to a human pose. Seated residents now bypass ordinary spawn effects, projected positions control their shadow/body/depth, conversion remains visible through the strike, and hit flash releases on the cutscene clock. Real new-enemy entrances and all simulation/gameplay values remain unchanged. Diner art decodes from the menu; current Arda running/civilian identities/native dialogue are retained.

[Fix, exact build and evidence](OPENING-DINER-FIX-2026-11-19.md). Five focused groups pass with zero failures, including a new regression and browser raster checks. A fresh normal-speed 31-second opening confirms zero recurring spawn dust, full actor opacity/scale, no browser errors and actual movement after control returns. Current local port 8785 serves frozen `1ef652232e…`; prior Audit8 artifacts keep their actual hashes and full-suite scope. No new full-suite/phone/artistic-acceptance claim, dependency/service or Git publication.


## 2026-11-19 — bilingual contextual narrative and comic-reading audit

Owner requested a contextual EN/TR pass, specifically questioning zombie introductions during the restaurant escape and the current comic reading sound. Implemented 157 native line revisions (84 EN / 73 TR), corrected the opening speaker and reaction, put Kaan’s L18 question/answer together, reconciled route/action claims, and added context checks for queued/live barks. Captain aftermath remains quiet.

Paper-turn sound now belongs to a page change; panel reveals use their own cue. Narration/thoughts and quiet scenes no longer produce inappropriate speech/zoom sounds. The source audit found no newer comic recording: these cues still use the synthesized bank. No new blocking pages, sim/balance change or expansion work.

[Full packet, deviations and limitations](NARRATIVE-CONTEXT-AUDIT-2026-11-19.md) · [before/after](NARRATIVE-CONTEXT-CHANGES-2026-11-19.md) · [current bilingual scene order](NARRATIVE-CONTEXT-READTHROUGH-2026-11-19.md). Proposed D-119; ready for owner review, not marked decided.

Focused bark/comic/dialogue/experience/opening/fonts/Audit8 checks pass; TR/EN sim digests match. Browser font-layout audit: 2,237 rows, zero flags. DSP checks pass for the page/pop/speech variants; generated-SFX quick runtime checks pass. Full suite started but stopped after a sandbox localhost-listener failure; no full-suite pass or merge claim. No critical listening or device sign-off. No commit/push/merge.


### 2026-11-19 · Independent player audit, pass 9

**Verdict: meaningful progress; not a masterpiece or expansion approval.** [Main audit](GAMER-AUDIT-PASS9-2026-11-19.md) · [all 30 levels, bosses and combat assets](AUDIT9-LEVELS-AND-ASSETS-2026-11-19.md) · [closure and verification](AUDIT9-CLOSURE-AND-VERIFICATION-2026-11-19.md). Executed scope is revised Audit8 §§0–7; N1–N3 remain deferred.

Played fresh L1 through earned results/progression and Memories into L2; used one Second Wind and one prototype revive, no debug progression grants. Independently reproduced all 35 broad campaign simulation results (30 clears/five losses/no revive); save differences are timestamps only. Independently accounted for all 50 passing groups: the isolated full run first missed repository art-prompt dependencies, then the affected group passed after those nonruntime files were supplied. Reviewed all-30 world actions, ten bosses, 17 base weapons at ranks 1/3/5, 18 evolutions, 16 active role fixtures and major earned scenes through sampled frames, source and telemetry. This is not a manual full-30 playthrough, continuous viewing of every movie, audio audition or phone/human acceptance.

**Confirmed ordinary-flow defects:** earned mod chips become vertical letter columns and clip upgrade layout; Memories replay renders under the hub and later leaks into the next run. Emotional staging retains Arda's damage blink, uses unvalidated relative actor marks and returns L20 to solo combat after promising companionship. Boss posing improved more than continuous action-specific acting. Mechanisms have real consequences but still often share corridor/ring/banner grammar. Plan discovery, next mastery benefit, crowded contact/threat clarity and meaningful evolution timing remain open.

**Preserve the gains:** Arda gait, correct Mom/Nail Gun identity, clearer Gear/benefits/active hierarchy, world acting before comics, real offense/placement and car outcomes, recorded Kaan-help consequences, all-18 focused earned evolution proof and repaired Keeper access. Free progression remains supported.

Audited runtime manifest `81a885795a562dd930b3428f5531548de69f03b6119ba7c2e4d19d5e587c3ce3`, 1,125 files. Later opening-rendering, dialogue/context and comic-audio changes are timestamped separately in the packet; they were not independently played/tested as the integrated newer build. Do not reintroduce an already-corrected opening defect or treat later source edits as retroactive acceptance.

No game changes, Git publication, dependency, post-L30 production or other-chat message. Next work is the prioritized corrective/acceptance packet; physical iPhone, listening, unfamiliar-player and complete manual campaign gates remain open.

### 2026-11-19 · Audit9 internal checkpoint A (owner authorized continued integration)

Audit9 requirements and all roster/level rows were mapped before runtime edits in `telemetry/audit9-implementation/coverage-initial.json`. Preserved the later diner correction, D-119 native TR/EN/context/comic-audio changes and the accepted Arda gait. The two UI defects were reproduced on immutable baseline `12e6e8a…`; 24 populated interface cases plus real Memories completion/skip/back/reload/next-run pass with explicitly supplied inventory/archive eligibility. Earned flow is a separate active browser journey.

Implemented collision-aware companion paths and local post-reading persistence, action-specific boss pose timing/contact anchors, selective knife/chain/chainsaw craft, compact inspection/upgrade planning/next mastery benefits, optional prop verbs/priority, and local route release using existing regular-enemy lure rules. D-120 is proposed, not an expansion approval. Focused regressions passed; integrated full suite and earned campaign/walkthrough checks are still running. The initial full suite caught a missing local reduced-effects guard on chainsaw vibration; its focused recheck passes. An initial supply relocation targeted the non-reward C mark; corrected to the actual D reward and retained the failed candidate data. A first recording driver confused nonblocking live dialogue with comic pages; its partial artifacts are retained under `media/R1/audit9-implementation/walkthrough-driver1`, and the corrected driver uses actual page DOM and ordinary CDP controls. These are not game softlocks or positive acceptance claims.

### 2026-11-19 · Audit9 internal checkpoint B · integrated verification

The final UI candidate fixes a demonstrated ancestor-scroll leak: selecting a perk/training item at large text could move the hidden map container. Owning panels now reveal their own selection. All 24 populated build layouts, eight growth-return cases and actual Memories completion/skip/back/reload/next-run checks pass on immutable candidate 8 (`b7af308f…`). These inventory/archive states are supplied fixtures, not earned six-slot campaigns.

Six real rendered protected-scene lifecycle fixtures pass on candidate 8: L20/L25/L30, normal native reading and reduced-motion/muted skip, actual second-tab interruption, ordinary pointer departure, real exit/result and exactly-once settlement. Companion path tests preserve the protected gameplay clock, collision, HP and pre-Fisher eligibility. The earlier departure-controller failures are retained; releasing held input across chest/cards repaired the fixture controller. The earned progressive-build rendered journey has independently cleared L20's complete reunion and subsequent departure and is continuing through the remaining levels. A second untouched-candidate-8 fresh-save rendered journey is also running; neither is an uncoached human run.

Four frozen-7 earned headless policies (simulation/config byte-identical to candidate 8) complete all 30: broad 33 attempts/3 losses, cover 35/5, offense 31/1, banked-growth 39/9; no timeouts, ads, payment or prototype revives. All losses remain in the raw records. Sixty full-route boss comparisons retain four losses with low entry HP; the separately labelled supplied-full-health control clears all 60. This separates approach attrition from boss access; it is not human fairness evidence. Actual blast source was being lost before prop damage, preventing truthful CarBomb contact attribution; forwarding that source fixes the pipeline without granting a terrain flag for proximity strikes. The exact immutable-8 earned known-seed CarBomb case records acquisition at 79.1s and meaningful effect through 144.4s. Focused offer misses remain evidence, not failures to hide.

All 69 arsenal clips, 16 role clips, all ten boss clips, 29 world-action fixtures and fresh native TR/EN opening captures are source-labelled; older films retain their original build identity. The final isolated full suite is running from a stable copied runner with all nonruntime dependencies available. Earlier infrastructure/harness failures and superseded runs remain in the logs. No phone, critical listening, continuous-motion artistic acceptance or unfamiliar-player result has been claimed. Owner-authorized integration continues; no merge, push, dependency, post-L30 production or expansion approval.

Closure remains in progress in `AUDIT9-IMPLEMENTATION-2026-11-19.md`. No commit, push, merge, dependency, service or post-L30 production change. The user explicitly requested continuing through internal milestones, so this checkpoint does not request another approval.


### 2026-11-19 · Turkish end-to-end narrative, comic art and reading audit

Audited all 1,202 authored Turkish variants and the Chapter 1 comic/call sequence, with later Chapter 1 and Chapters 2–3 outline continuity read-only. Implemented 158 Turkish text revisions plus one joke-metadata correction, preserving native voice, D-119 restraint and current Audit9 work. The scooter/map pickup gives the home detour a practical purpose; knowledge precedes reactions, Kaan's trust is earned, and action observations match their triggers. Two English wedding lines align with the shared new art.

Three versioned ImageGen assets provide restrained Arda/Mom listening expressions, interrupted-life scenery without flags, and a visible Paşa. Existing L10/L15 panel locations now follow the actual route; L30's distance caption no longer gets an unearned zoom. Reading accents follow word starts at least 150 ms apart with punctuation pauses, retaining silent thoughts, quiet grief and no skipped-text catch-up. Elite/action warnings bind to an unambiguous nearby living actor and discard stale sources. No new blocking page, gameplay/sim number, dependency or post-L30 production.

[Full audit and remaining story decisions](TR-END-TO-END-AUDIT-2026-11-19.md) · [story comparison](TR-STORY-EDITOR-2026-11-19.md) · [bark comparison with EN/placement](TR-BARK-CHANGES-2026-11-19.md) · [verification and source hashes](telemetry/tr-end-to-end-2026-11-19/verification.json). D-121 is proposed for owner review.

Focused scene-art/dialogue/barks-delivery/comic-reading/fonts/quality checks pass; UI-motion also passes. Final portrait/art-band and enemy-source checks supplement that run. No new full-suite or manual-campaign claim. Source images were visually inspected, but the browser was unavailable and sandbox/URL policy blocked preview attempts; rendered default/150% text/reduced-motion pages, phone presentation and critical speaker/headphone listening remain open. The later highway contradiction, radio trust, scooter payoff, mystery pacing and Ahmet Abi's aftermath remain explicit readiness blockers. Tests do not certify literary excellence or retention. No Git publication.

### 2026-11-19 · English end-to-end narrative and comedy pass

Reviewed all 1,205 English variants and the later story outline. Implemented **378 text revisions and 2 joke-metadata corrections** across eight native English files, using the owner's South Park / Rick and Morty direction through original satire, absurd reasoning and character friction. The shared first-30 story now establishes the scooter/map motive, answers questions in sequence, earns Kaan's trust and preserves Nuri's quiet aftermath. Warnings, upgrades and world-event reactions avoid claiming unobserved hits, outcomes, purchases or phone conversations. No new blocking page was needed.

[Main audit and later readiness findings](EN-END-TO-END-AUDIT-2026-11-19.md) · [complete before/after inventory](EN-END-TO-END-CHANGES-2026-11-19.md) · [first-30 comic/call readthrough](EN-FIRST30-READTHROUGH-2026-11-19.md) · [verification and selected-source hashes](telemetry/en-end-to-end-2026-11-19/verification.json). D-122 is proposed for owner review. Updated the English voice bible and shared narrative motive; older examples remain explicitly historical.

**Validation:** dialogue, barks-delivery, comic-reading, scene-art, fonts and quality pass on applicable final source. The first comic check caught implicit rather than explicit Sarıyer confirmation at C15c; the English answer now names Sarıyer and both affected groups pass on recheck. Initial failure evidence is retained. Coverage is 583 beats, TR 1,202 / EN 1,205 variants, identical language digest `12d2b67db8`. The remaining non-strict style note is a legitimate Turkish plural addressed to Arda and Kaan. Scoped whitespace and baseline structural checks pass.

**Deviations and limits:** native copy/metadata only in production; no sim/balance number, mechanic, timing, dependency, extra page or post-L30 production. Turkish, protected shared comic art/reading/staging code and concurrent Audit9 work are preserved. The existing shared art and sparse reading cues serve both languages. Later payoff/route/radio/agency problems remain documented; current rendered default/150% text, phone reading and critical listening remain open. No new full-suite, manual full-campaign or audience-retention acceptance; no commit/push/merge or published-preview update.

### 2026-11-19 · Audit9 internal checkpoint C · exact final candidate and evidence repair

Current immutable candidate12 is `c6a53d2de2de99abc16c203dcd17576019e8000ef5c027532af195a795e9dc64` (1,142 runtime files), served Mac-local at `http://127.0.0.1:8801/`. It retains the later diner, D-119/D-121/D-122 native text/art/reading work and accepted Arda gait. Actual source, frozen snapshot and separately copied test runtime match every manifest byte. No snapshot/runtime hardlinks to mutable workspace or test outputs are used.

The full screen/populated UI checks pass on this exact candidate: 24 build configurations, eight growth returns and actual Memories completion/skip/back/reload/next-run (36 records). All six L20/L25/L30 normal/skip, desktop-interruption, actual-pointer-departure and exactly-once-result cases pass. Final source-labelled films now use a non-resizing full-viewport recorder. Earlier post-interruption screencasts were clipped and are rejected as positive visual evidence, despite their state assertions passing. The original failed recordings/logs remain available. The recorder exposed a subpixel root/cache rendering path; candidate12 retains the regression-tested renderability guard. This was capture-induced, not a claimed physical-phone reproduction.

A remaining P8-12 requirement was reproduced: reloading repeated a recent ambient line and a living enemy's first introduction. Optional tab-session history now retains actual enemy acquaintance and independent TR/EN ambient recency; urgent warnings remain repeatable and profile reset cancels pending writes and clears history. Real reload, denied-storage, native independence and reset checks pass; canonical plot/first-clear facts are separate. No native voice line was changed for this fix.

Final12 earned headless results reproduce all four completed policies: 138 attempts, 120 clears, 18 losses, no timeouts or ad/payment/revive requirement. All 18 evolution targets have useful actual encounter contexts within 170 retained trials; the longer NailStorm and declared CarBomb cases also reproduce on final12. Sixty full-route boss comparisons retain four losses; separately supplied full-health-at-spawn controls clear 60/60. Initial positions and phase-separated damage/recovery observations are being added without changing simulation outcomes.

The final full suite, complete exact-build roster/world recaptures and fresh rendered first-30 journey continue. The first rendered attempt includes a disclosed controller detour/idle, ordinary keyboard reorientation and pointer re-anchor repair; it ultimately dies to a real walker and settles actual earned rewards. The same exact runtime/origin/profile resumes with the corrected controller, without save import, power grant or outcome injection. The controller's idle is not human pacing evidence. Older progressive-build earned completion and all failed retries remain separately labelled. Phone, actual listening, continuous-motion artistic review and consenting unfamiliar-player gates remain pending. No Git publication, new dependency/service, real monetization integration or production beyond L30.

### 2026-11-19 · Audit9 closure D · final whole-journey candidate

Final candidate `8b02fbff46d1bef7db62dc3c1480fead8acd0a8d5fed2479ebb66e1efba44fdc` (1,142 runtime files) passes all 54 groups, three affected follow-ups,36 retained UI/growth/replay cases,32 current result cases and local-source checksums. The fresh source12 earned rendered journey clears30/38, retaining8 failed attempts and the ordinary first-run Second Wind. Final13 repairs only the winning30 recap that still suggested31;1141 other served files are identical. Current earned rematches, full visible recap and return prove that affected branch; the older full journey is not relabelled. It uses disclosed assisted ordinary handlers, not imported main-campaign power/state or human/phone play. All attempts settle once; earnedL20/25/30 preserve protected clock/HP, walkable shared departures and real results. Reopening the completed profile preserves rewards and explicitly refuses31.

Complete17×3+18 weapon,ten-boss,16-role,30-world and native scene coverage is indexed. 264 positive full-viewport media files pass technical validation; the normal-speed comparison reel retains source labels and supplied/earned conditions. The shortenedL20 tail and announcement-obscured Nazar supplement remain rejected/qualified originals; complete same-source replacements are linked. Six lifecycle assertions pass; five positive scene films include actual background interruption, with theL20 English replacement uninterrupted. Frame sampling is not continuous artistic or listening approval.

Four headless earned campaigns retain138 attempts/18 deaths/0timeouts;60 full-route and60 supplied-HP boss cases distinguish approach attrition;170 evolution trials plus declared useful supplements retain failures/misses. MainL22 placed cover andL23 help are actual facts; offense/neutral and imported-earned-state continuations are separate. Accepted Arda gait, later diner/D-119/D-121/D-122 native art/context/reading fixes and unrelated dirty work remain preserved.

[Complete correction packet](AUDIT9-IMPLEMENTATION-2026-11-19.md), [source/archive/commands](AUDIT9-SOURCE-AND-EVIDENCE-2026-11-19.md), [final ledger](telemetry/audit9-implementation/coverage-final.json), [evidence browser](media/R1/audit9-implementation/index.html), [external scripts](AUDIT9-EXTERNAL-ACCEPTANCE-2026-11-19.md). Ready for fresh independent first30 review. Phone, listening, continuous-motion artistic and5–8 unfamiliar-player/uncoached-full30 gates remain pending. No masterpiece/expansion approval, production beyond30, new dependency/service/SDK, engine migration, commit/push/merge or other-chat message. D-120 remains proposed.


### 2026-11-19 · Independent player audit10 · first30 after Audit9

Reviewed exact final13 runtime `8b02fbff46d1bef7db62dc3c1480fead8acd0a8d5fed2479ebb66e1efba44fdc` in an isolated APFS clone; all1,142 served files match workspace at audit end. Independently completed54 test groups with zero failures and an earned broad campaign30/33 (three losses, zero timeouts). Simulation outcomes match supplied source12 broad data after excluding only new read-only boss-entry position observations. The first sandboxed test attempt was interrupted for localhost permission, then the full approved run completed; not a product failure.

Live fresh EnglishL1 through result/growth, actual earned Memories Back/skip/reload and cleanL2 start, plus two tool-pacedL2 losses/settlement/mastery. All30 world and earned-route recordings, ten bosses,17 bases×3,18 evolutions,16 roles and major scenes were frame-sampled;325 indexed frames plus32 closer temporal samples. No manual full30, physical-phone, continuous artistic or listening claim. No selected prototype revive; ordinary first-run assistance remained enabled.

**Verdict: real visible progress, not masterpiece/expansion approval.** Close the original compact-mod and Memories failures; acknowledge clearer next mastery/perk relations and repaired physical companion staging. Remaining priorities: late/obscured evolution reward (direct live reproduction), first-boss teaching/identity, repeated hold/exit decisions, dense signal competition and selective continuous animation acceptance. New small defects: inspection caption contrast, retained offer scroll, hidden legacy attribute sequence after loss, system phone portrait. An accepted Molotov rank3 film contains a black-world interval requiring capture-versus-runtime classification.

[Main Audit10 verdict and concrete plan](GAMER-AUDIT-PASS10-2026-11-19.md) · [all30 and asset appendix](AUDIT10-LEVELS-AND-ASSETS-2026-11-19.md) · [requirement closure/evidence/limits](AUDIT10-CLOSURE-AND-VERIFICATION-2026-11-19.md). Native narrative and other dirty work preserved. No product edit, dependency, commit, push, merge or other-chat dispatch. N1/N2/N3 remain proposals rather than failed Audit9 obligations.

### 2026-11-19 · Owner feedback supersedes Audit10's optimistic weighting

The owner's nine direct-play observations identify unmet perceptual outcomes in boss visibility, movement and defeat, weapon attachment and impact, hurt feedback, boss strategy and balance, progression discovery, and scene direction. Technical repairs remain verified; a substantial improvement in core game feel is not established. The main report's verdict is revised accordingly. These are attributed owner observations, not a new independent play or listening pass.

[Owner feedback and revised creative direction](AUDIT10-OWNER-FEEL-ADDENDUM.md) specifies player-visible acceptance criteria and a complete L1 quality benchmark before applying the standard across the first 30 levels. Preserve verified repairs and native narrative work. No masterpiece verdict or expansion approval; documentation changes only.

### 2026-11-19 · Whole-slice production brief after owner's quality-bar correction

Owner clarified Cook is one example, all bosses require detailed treatment, and earlier audits/PRDs accepted technical proxies too readily. Prepared [four-part production packet](PRD-FIRST30-EXPERIENCE-RESET-2026-11-19.md) and [single autonomous execution prompt](IMPLEMENTATION-PROMPT-FIRST30-EXPERIENCE-RESET-2026-11-19.txt). Explicit scope: all ten bosses, 17 bases at ranks1/3/5, 18 evolutions, all30 level decisions, named world scenes, feedback/audio, progression discovery, assets and retained P10 defects. L1 is an internal integration check, never a scope reduction or completion sample.

Fresh read-only source review identifies existing1.47-second generic boss defeat, seven atlas bosses' two-cell locomotion/body-band constraint, Cleaver's actual revolving damage line, incomplete pre-death action/tool state, and existing health/frenzy cues whose perceptual outcomes remain failed. Added specific asset, geometry and continuous-motion requirements rather than requesting the same features again. Cross-checked boss and weapon inventories, current progression model and native canon. No fresh play/listening/device acceptance claimed. D-123 proposed; no product code/assets, tests, dependency, commit/push/merge or other-chat dispatch. Implementation handback must distinguish implementation, technical, presentation and player evidence.


### First30 reset · internal integration checkpoint, 2026-11-20

The owner authorized the complete new four-document packet and autonomous execution through verification. Work is **in progress**, not returned for approval or marked complete. Baseline13 is retained; anatomy/tool sources for all ten bosses, truthful delayed blade/hammer contacts, route/progression/UI/feedback repairs are being integrated. See [live reset ledger](FIRST30-EXPERIENCE-RESET-IMPLEMENTATION-2026-11-19.md) for exact intermediate sources, failures, tests, balance deviations and unclosed acceptance. Accepted Arda gait, current native dialogue/comics, saves and first30 boundary remain protected. The intermediate boss films are supplied diagnostics, not ordinary earned acceptance. Full final suite, new earned30, final balance and presentation review remain required; physical-phone/unfamiliar-player/listening gates cannot be represented as passed.


## First30 experience reset · sealed candidate15,20 November · integrated checks continuing

Owner instruction: execute the complete four-document reset through acceptance; internal checkpoints are not stop/approval points. [Implementation packet](FIRST30-EXPERIENCE-RESET-IMPLEMENTATION-2026-11-19.md), [complete indexed coverage](FIRST30-RESET-COVERAGE-2026-11-19.md), [all30 decisions/transitions and S01–S09](FIRST30-RESET-JOURNEY-2026-11-19.md).

Runtime `19f59ae3c5aff7b9c4556a97e2f0503d487b7121ad239b6a9d835d5a2fdccf87`,1177 files; [manifest](telemetry/first30-reset/candidate15.json). Fresh source15 earned rendered30, full55-group suite, all ten boss/default/reduced/dense/gray cases,51 base ranks/18 evolutions/65 advanced recordings and full interface/story/interaction checks are running. Do not label pending jobs passed. Previous candidate12 and14 full suites completed0 failing, but neither replaces the final15 suite. Superseded captures retain their saves, raw failures and explicit supervisor-stop receipts.

New physical boss/Kaan parts, truthful blade/hammer/chain contacts and route consequences are integrated. Rendered inspection additionally caught and repaired pre-AI ghost boss attacks, Roaster release origin, fish lowering before arrival, hints over protected scenes, low-contrast overlapping action names and a real returned-prop registry omission that blocked regrip. These are specific repairs, not evidence of Hades parity or fun. Latest native TR/EN/choices/relationship facts and accepted lower-body gait remain; L23 wording alone now describes moving/carrying instead of breaking/opening its three sacks.

No dependency/service, paid purchase, real monetization, engine migration, post30 production, commit, push or merge. Device/listening/continuous artistic/uncoached-player gates remain pending with exact scripts in the packet. Final readiness and actual results will be appended after all independently executable verification and repairs finish.


## First30 experience reset · final local candidate17,20 November

Owner's entire four-document scope was executed locally through integrated technical verification; internal checkpoints were not handback stops. [Implementation and honest acceptance status](FIRST30-EXPERIENCE-RESET-IMPLEMENTATION-2026-11-19.md) · [321 individual requirement rows](FIRST30-RESET-COVERAGE-2026-11-19.md) · [all30 levels/29 transitions/S01–S09](FIRST30-RESET-JOURNEY-2026-11-19.md) · [all60 boss comparisons/18 evolution outcomes/30 pacing rows](FIRST30-RESET-BALANCE-2026-11-19.md) · [normal-speed indexed media](media/R1/first30-reset/index.html) · [matched before/after](media/R1/first30-reset/matched-comparison.html).

**Exact runtime:** `c186ad04595f929b47767e2ce75e2bf1f39323eba96b1417c7418c13f48f739c`,1179 files; [manifest](telemetry/first30-reset/candidate17.json). Working, immutable served and frozen tested copies match all1179 file hashes. Mac `http://127.0.0.1:8828/?lang=en`; Wi-Fi `http://192.168.4.25:8828/?lang=tr`. Git branch/head and inherited dirty work are preserved; no commit/push/merge. Original local commission checksum check passes.

Ten new anatomical/tool boss rigs and individual contact/defeat performances; truthful finite Knife/Cleaver and propagated Sledge/Blacksmith; health/state/attention/audio separation; actual growth destination/offer/reward ownership; changed consequences at4/11/12/14/23/28/29; physical current Kaan recognition/grief/departure; current illustrated market/weather materials; bounded offscreen speech; returned-prop registry and visible action-name repairs are integrated. Current native/illustrated facts, accepted Arda gait, cover duration, evolution attribution and first-clear commitments remain. Only the explicitly recorded L23 native action verbs change to match carrying.

**Verification:** final17 suite55 passed/0 failing/no rerun. All14 final diagnostic jobs resolve; three initial browser/game startup timeouts and exact unchanged serial retries remain. Final source17 all30 world actions actually open;10 boss observers;14 natural roles;51 base ranks/18 evolutions/65 geometry/mastery films, all68 mod paths;179 killable boss-phase cancellation checks; actual contact/conditional/reward/input/art regressions;30 native comic sequence/variant entries/117 stills and60 native UI records. Source15 numerical/config/sim bytes and weapon/boss/hero motion match17 exactly; its387 attempts/360 wins/27 losses and12/12 free complete30 campaigns apply with true source identity. Baseline406/360/46. All losses/fast kills/late effects and selected search denominators remain. Source15 films are not relabelled17.

**Actual rendered earned journey:** all30 cleared,35 retained records (31 wins including extra9 replay,4 losses);34 full gameplay exports plus actual earned growth/menu films. The original9 reached clear but bulk export timed out; result/raw452 JPEGs retained without invented timestamps/audio. A separate fresh earned1–9 campaign (10 records/9 wins/1 planned loss) records first-clear9 fully. Acknowledged original-chunk streaming fixes recording; menu-only growth uses DOM/audio because suspended canvas produces no motion frames. Rejected pilots and tool versions/limits remain. Level29's308-sim-second driver delay is untrimmed; it completed through ordinary input before a proposed late steering attach, whose strict29 guard rejected the call at30. No completion flag, power, save or result was supplied.

**Actual ending:** earned30 boundary, disabled31 and unchanged coins/stars/settlement on completed-result reload pass. Two earlier observer failures (missing assumed sheet node; querying P during reload initialization) are retained and corrected only in the harness. Active-run reload remains a fresh run from permanent state, not a simulation checkpoint. Sequential final desktop opening/boss/crowd p95 frame16.7ms each; work2.9/3.0/4.6ms versus baseline2.9/2.9/4.9. Prototype cap200. Graphics estimates omit separate StreetArt/puppet atlases and cannot establish total memory or phone budgets.

**Review status:** ready for a fresh independent first30 audit, not masterpiece/expansion approval. G03/P10-01 early useful L1 evolution timing remains a tuning limit (two useful Nailstorms, one late Cleaver;16 additional Cleaver/owned-plan misses). Fast one-family and long evasive boss cases remain. Direct frame samples/source/media metadata were inspected; continuous artistic motion, actual listening, physical-phone heat/input/audio focus and unfamiliar-player understanding/return are unperformed, with exact scripts in the packet. One transient L6 strict planner rejection near the right-edge tea table is retained with neighboring valid samples/visible responsive hero; no perfect-collision claim. No missing required new local art remains. No dependency/service, purchase, real ad/IAP, engine migration, post30 production or unsolicited other-chat message was added.


### 2026-11-20 · Independent audit11 of reset candidate17

[Audit11 findings and acceptance boundaries](GAMER-AUDIT-PASS11-2026-11-20.md). Verified1179 runtime hashes with zero differences; independently passed first30-reset and experience suites. Live opening/exit/earned early Knife upgrades; supplied final earned frames sampled across30 levels, two early fight frames per boss, priority weapon/health/scene/progression samples and current source/retained balance inspection. No new manual full30, continuous video, audio, phone or unfamiliar-player acceptance. Full55 and12 campaigns remain supplied evidence.

Verdict: genuine root implementation corrections, incomplete experience, no masterpiece/expansion approval. New concrete final-footage defect: L4 long contextual instruction compresses required objective into a narrow tall column. Retain early evolution timing failure, ordinary short/one-family bosses and long evasive tails; improve body/background separation and competing banners/interaction rings. Reconcile boss-loss labels claiming entry not reached despite entryHP/action data. Product unchanged; only audit artifacts/report, no commit/push/merge.


## 20 November · Owner-reported opening clones / unequal adult scale · source22

The owner's screenshot is a valid defect missed by the prior visual review. [Opening cast correction](OPENING-CAST-FIX-2026-11-20.md) records the reproduced source17 failure, new artwork/import provenance, current source identity and limits. Current sealed source `0250ab61a6e11a72234511c07eaa9211f24dfe183920c83d375cae06756d4d20`,1181 files, served at the same localhost8828 with no-cache; owner save preserved. Both customers and the bystander previously reused one illustration while using different size conventions. Now three distinct adults retain their identities through reactions/infection/death; the bystander exits through the doorway, the converted customer uses the aisle, and the fridge no longer occludes the second customer's legs. Six current matching idle/reaction identities also remove the generic shared-man fallback for stationary civilians in every district. View-owned actual displacement distinguishes stopping from cumulative walked distance, preserving frozen-clock poses and assigned identities.

Eight final focused groups pass0 failures/no rerun: opening, opening-cast, experience, art-raster, art-raster-world, art-raster-items, scene-art, quality. Full current normal-speed opening and ordinary first controls/kills pass, with actual alpha/transform body measurements, zero browser errors or resident spawn dust, and matching fallen poses. Missing either new sheet safely retains title/runT0; ordinary retry and actual hold-to-skip return enabled control. Source17's prior55/full30 remain under17 identity; no claim of a new full56/current22 campaign. Earlier bad diagnostic escaping and camera-dependent raw-pixel assertion remain as rejected logs/film; corrected world-space measurement retains actual actor-scale checks. Original artwork/alpha/prompts retained; no procedural repaint or new dependency/service. Simulation modules and gameplay tuning untouched; existing opening nudge direction follows the corrected staged attack. Latest dialogue, accepted Arda gait, progression and current boss work preserved. Frames/source inspected, no listening/continuous craft/phone/player acceptance claim. No commit/push/merge.

## Audit11 integrated correction ·20 November · verification in progress

Owner explicitly authorizes the complete first30 Audit11 packet through integrated verification; old per-step stopping instructions do not narrow it. [Current work/evidence](AUDIT11-IMPLEMENTATION-2026-11-20.md). Baseline22 is preserved; candidate7 has exact source `d6894658bca4d05d812b9771502bdc4f17bfab4e7e67ffbe41f7d65299c74627`. Required-objective wrapping, useful early finite XP scheduling, actual boss approach/phase/recovery, individual arena value separation, safe recovery cues, competing optional prompts, quiet controls and live action composition are implemented. All named roster/level/weapon/scene requirements remain in the328-row reconciliation. This entry does not claim the full suite, final all30 film or player acceptance has completed.

Retained diagnostics reproduce L23’s600s outlier: the driver chased a pickup across a closed gate while carrying the third sack. The unchanged source clears132s with unreachable-drop navigation repaired. In-fight losses receive distinct terminal classifications; no missing fight duration is relabeled absent entry. Original bad cases/pilots remain. No commit/push/merge/dependency/service/expansion approval.


## Audit11 final local first30 correction ·20 November · final9

Owner's complete Audit11 assignment executed through available integrated verification, preserving source22 opening adults, accepted Arda gait, current native D119/121/122, illustrated assets, truthful contact, cover/relationship/choice and reward/scene lifecycle. [Complete handback](AUDIT11-IMPLEMENTATION-2026-11-20.md) · [328 separate requirement stages](AUDIT11-COVERAGE-2026-11-20.md) · [exact verification](AUDIT11-VERIFICATION-2026-11-20.md) · [actual sparse inspection](AUDIT11-RENDERED-REVIEW-2026-11-20.md).

Final runtime `09d9e63b0b7805c3bd0f733a36f4e4fb464d623fe1ffc97c92c9c22d47058c57`,1181files,18 changed from frozen baseline22. Current/frozen served/full-suite copies match0 mismatches. Same Mac/save origin `http://127.0.0.1:8828/?lang=en`, no-cache. Required/context HUD rows, finite useful early investment, individual boss tell/phase/approach/recovery and arena body/tool separation, quieter attention/control treatment and bounded live work framing are integrated. Actual inspection found older friendly cosmetic-particle occlusion and oversized guide marks; final8/9 repair those without changing geometry/simulation.

Final frozen9 suite56 groups pass0 failing/exit0. Fresh exact9 earned journey:30 wins, one planned L1 death/retry, one original L3 observer interruption after real results; L3 replayed through the same actually earned profile, no import/grants/free revives. All30 entry/route/result/return and29 subsequent departures inspected in sparse original-time DOM samples. Earned ending,31 locked and no duplicate settled reward on completed-result reload pass. All69 rank/evolution forms,65 advanced films/68 branch inventory,14 natural roles,30 supplied physical actions, all10 clean/default/reduced/grayscale boss fixtures, current117 comic stills and60 UI operations are indexed. Health ambiguity rejected and repaired through quiet full-HP/real-injury assertions and14 direct production-canvas samples. Earlier failed/superseded captures remain with explicit classifications.

Numerical12-campaign comparison final360 wins/385 attempts/24 deaths/one driver timeout versus baseline360/379/18/one same timeout; no win-rate improvement claimed. Close L1 investment7 Cleavers/8 wins with six full450HP Cook contributions and one337.6, target miss retained. Selected useful earned contribution established for17/18 evolved forms; Hookpull remains unestablished. Sixty actual earned-history boss-entry cases retain strong short wins, injured deaths and Captain long tails; no blanket HP or minimum timer. L23/L29 diagnostic navigation causes reconciled without changing game rules; six later optional-navigation observer crashes retained and corrected rerun has0. Separate controlled desktop3×60s arms exit0; final p95 frames16.8/16.8/16.7ms and work2.7/3.0/5.0ms, not phone or perceived-fluidity proof.

Ready for a fresh independent first30 audit with explicit open gates: continuous craft/defeat/grip review, actual listening/fatigue, physical-iPhone controls/heat/audio interruption and unfamiliar-player discovery/emotion/return. Single-weapon signature announcement prominence, shared northbound geography and Hookpull availability remain review/tuning uncertainties. The [exact remaining scripts](AUDIT11-ACCEPTANCE-2026-11-20.md) are not fulfilled by generated films or bots. No masterpiece/Hades parity, release or expansion approval. No dependency/service/purchase/real monetization/Godot/post30 production/commit/push/merge or unsolicited other-chat message.


### Audit11 final rendered-copy follow-up · final10

Ten additional actual earned9 boss/aftermath/result sheets exposed one remaining stale player-facing description: Cleaver still claimed a continuous360 orbit. Final10 changes only two TR/EN `desc.cleaver` values to match existing finite alternating cuts. All sim/config/view/CSS/assets are byte-identical9; no mechanic or voice/story change. [Only-file difference](telemetry/audit11-implementation/source10-runtime-difference.json), [actual eight card layouts](media/R1/audit11-implementation/final10-cleaver-copy/index.json) at320/390/TR/EN/100/150 inspected and pass. Final10 complete56-group suite passes0 failing/exit0/no rerun, with [retained logs](telemetry/audit11-implementation/final10-suite-index.json). Runtime `0230642ec5e42eb26aee7eb3427a3e7837f3f263ea6f6c6f3feb99a5e028cd5f`,1181 files/19 changed from baseline22; all3×1181 working/served/test hashes match, six actual HTTP source-byte checks pass at same owner8828/save. [Final source/build/tool manifest](telemetry/audit11-implementation/handback-source-build.json).

Source9 earned30/29 departures, all actual films, numerical outcomes and controlled benchmark keep9 identities and precise copy-only applicability. No10 playthrough is invented. The complete328-row ledger names10 as final and retains the separate implementation/technical/sparse-presentation/player stages. All earlier external gates and Hookpull uncertainty remain; ready for fresh independent audit with those limits, no masterpiece/expansion claim or new authority to commit/push/merge.


## Audit12 — independent review and proposed production direction (2026-11-20)

Documentation/evidence only; no runtime edits, commit, push or expansion approval. [Audit12](GAMER-AUDIT-PASS12-2026-11-20.md), [production PRD](PRD-AUDIT12-PLAYABLE-DRAMA-2026-11-20.md), [single execution prompt](AUDIT12-IMPLEMENTATION-PROMPT-2026-11-20.md). Proposed decision D-125.

Independently verified final10 frozen runtime:1181 files, zero manifest mismatches. Independently ran current earned broad/punish campaign:30 wins,1 L20 loss,31 attempts;26 attempts with evolution use (25 Cleavers,1 Nailstorm). Several earned first-entry bosses still die in3–6 seconds. This is a policy trace, not population difficulty or retention. Live fresh-save Chrome L1 reached Cook defeat, chest, exit/result, attributes and perks with normal controls/offered cards. Sparse tool observations do not certify animation or audio; time gaps are not human pacing data. Inspected supplied final9 sheets for all10 bosses, all30 first-control samples and L11–16 transitions; final10 copy-only applicability retained.

Useful evolution/HUD/progression corrections receive credit; boss exchange budgets, repeated blockade framing, competing presentation, scene scale and deliberate replay remain obstacles. New PRD explicitly promotes bounded starter and tactical-rematch proposals instead of misclassifying earlier deferral as an implementation omission. Physical phone, listening, continuous motion and unfamiliar-player acceptance remain open. Own isolated8844 server stopped; owner8828 save/server untouched.


## Audit12 local implementation underway — 2026-11-20

The owner forwarded the complete production packet and explicitly authorized bounded starters/rematches and all first30 corrections. Work is ongoing, not accepted or complete. [Live implementation ledger](AUDIT12-IMPLEMENTATION-2026-11-20.md). Before runtime final10 matches all1181 files. Current sealed diagnostic4: `4ecf5d514161180d7875d18aa07bf1a194712cf0a35ecc118b9383759501e260` at local8840; baseline/save origin8828 remains final10. No commit/push/merge/dependency/service/post30 production.

Implemented so far: actual impact-fragment source exclusion; fixed per-boss budgets/compositions/arrival access; distinct spent/travel poses; safe earned-choice boundaries; compact combat emphasis; physical bell/fork and cart/obstruction setup; saved single starters and three bounded rematches; result experiments; native-response-before-recognition lowering; same-route station departure; optional physical Kaan loading which pauses under real pressure and credits only actual player help. Existing native prose, hero running, art and finite Cleaver stay retained. Full runtime/source and acceptance remain separate.

Integrated2 full suite exposed5 failures: two real placement/pickup clearances, HTML size, new sound inventory assertion and a fixed-damage fixture no longer lethal after rebudgeting. Integrated3 exposed a Captain approach fixture which assumed the former distant spawn. Original logs and first-failure copies are retained; affected repaired checks pass. Integrated4 full suite, actual distinct-policy/seed campaigns and fresh rendered journey are underway. Earlier --seed filenames did not change the campaign's consumed --seed-base; actual row.seed values govern, and duplicate diagnostics are explicitly qualified in seed-flag-correction.json. The interrupted integrated3 journey completed1–9; L10 was aborted, not a passed walkthrough. Physical-device, continuous-motion/listening and unfamiliar-player acceptance are not claimed.


## Audit12 integrated7 verification checkpoint — 2026-11-21

Sealed runtime `d43711bfa46b2b3ad3449fd9202f1143c39a848d4efe971f0d4b5037af683fb6`, [manifest](telemetry/first30-reset/audit12-integrated7.json), local8843. Workspace byte-check passes all1185 files. Implementation remains under integrated verification; no artistic/player acceptance or expansion approval. Owner baseline8828 untouched.

Diagnostic5: all12 actual distinct policies×seeds earned through30, all attempts retained; all30 supplied rendered world actions completed. Source5→7 changes only replay-description contrast and Bride pursuit/cart recovery. The exact retained earned Bride case reproduced115.65s/58.68s longest no-contact interval; bounded physical approach fallback to fully warned carts plus real command recovery yields53.30s/6.75s, with the same build/health budget. Focused regression passes. Hookpull now has real useful earned evidence at L23 seed23858:26 hits/21 pulls,42.17s remaining, explicit owned plan and one real reroll. This is reachability, not discoverability/fun.

Earlier source4 suite continues; redundant partial5 suite was stopped to reduce load, with its sandbox loopback EPERM and original logs retained. Final7 full suite is queued sequentially; final7 fresh rendered all30/starter/rematch journey and12 distinct campaigns are running. Current recordings and technical/sampled/motion/audio/player verdicts remain separate. All prior partial/interrupted/superseded records are retained, not reported as finished walks.


## Audit12 integrated8 physical-action checkpoint — 2026-11-21

Current sealed8: `f2aabe02129d11b47db1183d93012b8415c5a8ad30d6cc5e8a79a10e37e95e89`, local8846; all1185 workspace files independently match. Source8 changes from7 are config-bond, EminonuTrial, KarakoyBoss, Fx and Speech. Full7 suite and its80 power cases remain explicitly source7. Fresh8 first30 rendered earned campaign and12 distinct-policy/seed campaigns are running; full8 suite queued after7. All completed and partial earlier walks, including the earned7 prefix through9 and its real starter selection, are retained. No final acceptance yet.

Live S3 inspection clarified an early diagnosis: an invalid supplied test position made a path assertion fail; the actual route let Kaan finish loading, but the Walker arrived too late to interrupt it. New test uses real sack delivery plus a valid actor start. One finite offscreen Runner now arrives during the job; actual removal resumes physical work and alone earns contextual credit. Explicit walkable-target selection hardens placement. Closer live camera and optional-chatter protection make the hands/action visible, retaining control and reduced-motion behavior. Exact8 fixture passes actual blockage→weapon hit→resumption→completed loading, without auto-completing the three-sack task.

A second integration check retained the Bride counter during her new cart-command recovery: real collision can interrupt that recovery; an existing counter cannot repeat until it settles. Exact8 rendered fixture passes harmless first crossing→baited commitment→lateral escape→physical cart counter→actual exposed damage. No counter/hit/outcome flags supplied. Focused physical-action and Eminonu/bond/UI/quality checks pass.

Original quiet-role native recording failed twice (the video-only experiment also failed and was reverted). Original-time DOM/audio role recordings are separate, with native-motion acceptance explicitly unavailable rather than passed. The helper serialization error returned a circular sim; it was repaired with a void diagnostic call, not a game-state fix. All failures and source hashes remain. Continuous motion/listening, real phone and unfamiliar-player acceptance remain pending.


## Audit12 integrated10 death-boundary correction and ongoing verification

Current sealed10 local8848, runtime `3f1fe0a8485454131fef375f383ea4cb5ad2bac591f541ed8ce2153d03fc61b5`/1185files. [Implementation](AUDIT12-IMPLEMENTATION-2026-11-20.md), [all-scope ledger](AUDIT12-COVERAGE-2026-11-20.md). Actual80-case review found a real Fisher lethal-frame failure: authored bigFisher inherited the legacy Bloater burst **after bossDie**, killing an injured hero. Combat now excludes authored bosses from that generic death effect and guards duplicate kill settlement. Ordinary Bloaters retain their actual burst. Same earned-history close case loses on9 but wins on10 with no post-defeat damage; a no-invulnerability1HP rendered pair independently demonstrates the boundary. Original failed fixtures, first-run rescue observation and invalid operator test names are retained and distinguished from game bugs. Focused repaired suite passes.

Full9 completed57 groups/0 failing/no retry; full10 is running. New10 twelve-policy/seed campaigns,80 access/power cases, exact major scenes and fresh earned first30/starter/rematch journey continue. All18 useful evolved forms reproduce on10 using explicitly selected known seeds/real pre-level histories; the Car Bomb case chooses the legally earned Canister starter and an actually offered complementary weapon, then uses real terrain. Captures do not establish motion/listening/fun. Superseded9 prefix through12, its3 real Canister-policy losses and stopped13 recording/profile remain; it is not a completed30 walkthrough. Current10 input policy explicitly chooses an offered complementary weapon rather than only investing in the slow starter. No mechanic was altered to make the driver win.

All35 weapon, all10 boss and all30 world contact sheets actually inspected; continuous craft remains unaccepted, with small-tool/trail/occlusion risks recorded. All14 role active stills inspected; some independent finite route pressure and close overlap remain visible despite the original “quiet” fixture caption—qualification required. Current9 same-gull actual XP theft/return fixture passes. Complete current-source verification and report consolidation remain; no dependency/service/commit/push/merge/post30 production or owner/expansion approval.


## Audit12 candidate12 — viability correction and final verification in progress

Current sealed12 `9c692dcb9e00cc428c0837b12d8c2f4188406b8a2d911250f7da78e601969af8`, local8852. [Implementation](AUDIT12-IMPLEMENTATION-2026-11-20.md), [coverage](AUDIT12-COVERAGE-2026-11-20.md), [verification](AUDIT12-VERIFICATION-2026-11-20.md). Fixed global Canister cadence/flight/early blast after actual weak unspent character0/8 common and1/8 spacing failures: selected12-identical cases improve4/8 and6/8; Car Bomb inherits cadence/flight. Damage unchanged, no starter-specific buff or hidden scaling. All failures remain. Formatting-only11 was deliberately stopped for this repair; its partial suite is not a pass.

Final12 full57/0/no-rerun suite and exact1185×3 working/snapshot/check hashes pass. Twelve complete final numerical campaigns reach30:382 attempts/360 wins/22 losses; final80 access cases ordinary20/20,base-speed20/20,injured16/20,strong replay18/20. Six genuine losses have no post-boss damage. All18 useful earned evolutions reproduce on12, including Car Bomb13/seed3 with an offered side-investment strategy before the real first chest; prior failed known/bounded/strategy cases retained. Exact12 all18 evolution/Canister three-rank/four-branch films complete. All18 current still sheets, Canister pair and small native starter/rematch UI samples actually opened, with low-tool/trail/occlusion/motion limits recorded. No continuous video or listening acceptance.

The original fresh12 capture hit ENOSPC during3; actual real-save won3/unlocked4 was read-only confirmed.1373 original JPEGs/audio remain, but their frame timing/checkpoint was not persisted; no guessed-speed reconstruction. Same-profile continuation publicly replays already-earned3 then earns4 onward. An additional separate fresh1–3 recording closes first-entry demonstration coverage without pretending to recover the original history. One numerical cohort also had a truncated output despite process0; original retained, identical command repeated fresh, only complete replacement counted. Final current journey/rematches and controlled desktop measurements remain to complete. Owner8828 saves/Chrome untouched; no Git/dependency/service/post30 or expansion approval.


## Audit12 final14 local handback — 2026-11-20

Current `ceda328957e8353ebd051a2be8ef5cdae16034000b436b8bc375d81fea4cdff4`/1185files, [play](http://127.0.0.1:8828/?lang=en). [Implementation/all known bounds](AUDIT12-IMPLEMENTATION-2026-11-20.md), [174-row scope](AUDIT12-COVERAGE-2026-11-20.md), [verification](AUDIT12-VERIFICATION-2026-11-20.md), [indexed original-time comparison](media/R1/audit12-implementation/review.html), [remaining scripts](AUDIT12-ACCEPTANCE-2026-11-20.md).

Available local implementation and integrated verification are complete: 57 test groups pass, zero final failures, 0 reruns; twelve fresh final14 numerical campaigns reach30 in381 attempts/360 wins/21 losses. All30 rendered coverage combines the correctly labelled source12 fresh journey (all30 plus three actual tactical rematches) with exact unchanged pre26 applicability and a declared real-earned-history branch26–30 on final14 (5 wins/0 losses). This is not an unbroken fresh14 recording. The original3 capture gap and separate fresh1–3 supplement remain explicit. Final14 has its own source/HTTP checks, ending/reload/31-lock check and sequential desktop measurement. Continuous-motion craft, actual listening, physical phone and unfamiliar-player acceptance remain unperformed.

All ten bosses/all30 spatial rows/17 bases18 evolutions/61 geometry paths/14 natural roles/major+minor scenes/health/control/progression/native/earned starters/three rematches addressed. Source14 makes real26 breathing space;13 text-only relief had failed the specificS4 pressure cross-check. Actual before12/13 car-open kills96/100 versus0 on14, frenzy follows opening; live threats/normal later combat and current native prose/Arda gait remain. No hidden scaling/caps/minimum timers.

Numerical before384/360/24 vs final381/360/21. Separate80 access cases16injured/20ordinary/18strong/20base-speed wins; six real losses/no post-boss damage retained. Additional20 legal max-current-equipped comparisons20/20; useful selected18 evolution cases retain exact unchanged12 contexts, not frequency claims. Source12 original3 ENOSPC capture gap/independent fresh1–3 supplement, truncated log/exact replacement, moving-map observer failures/overwritten shared failure PNG and two13 setup failures remain documented. No fabricated continuous/listening/phone/player results. No owner save/Chrome/Git/dependency/service/payment/Godot/post30 change or expansion approval.


## Audit13 — independent Audit12 acceptance, 2026-11-21

[Full independent report](GAMER-AUDIT-PASS13-2026-11-21.md). Frozen final14 manifest ceda328957e8353ebd051a2be8ef5cdae16034000b436b8bc375d81fea4cdff4: all1185 frozen/workspace files independently matched. Focused Audit12 tests pass; independent earned broad/punish campaign clears30 in31 attempts, one loss at16 to Copci,26 useful evolutions (25 Cleaver,1 Nailstorm). Direct fresh-origin L1 was earned through Cook, reward, sanctuary, result and permanent Strength application. Supplied all30 route/ten boss samples and selected current scene/weapon/UI evidence inspected with source applicability limits; no claim of thirty manual completions, continuous motion, listening, iPhone or unfamiliar-player acceptance.

Disposition: partial, not full experience acceptance or expansion readiness. Concrete open findings: Cook tutorial/interaction/crowd foreground leaks; Cleaver/Chainsaw competing material silhouettes; insufficiently differentiated route/task presentation; Kaan action obscured by optional rings/effects; narrow static-phone bubble plus empty final-phone portrait; boss/build outliers needing meaningful-exchange review; rounded50% result contradicting failed threshold. Direct earned growth flow works and should be preserved. Existing PRD contracts remain the scope; no new runtime/design expansion commissioned here. Later live screenshots failed ENOSPC; saved earlier shots and returned browser observations are distinguished. Own8846 audit server stopped, other servers untouched. No runtime/Git mutation.


## Owner-requested Git checkpoint and storage audit — 2026-11-21

Owner explicitly authorizes committing/pushing latest code, then removing clearly unused files while preserving active code/assets. Current branch retained; no merge to main. All 1185 runtime files exactly match final14 SHA-256 manifest, whose retained full suite reports 57 groups/zero failures. Fresh full suite started before publication, with sandbox localhost EPERM run stopped and restarted with localhost access. Checkpoint includes game code/assets/tools/docs/review packets and final14 manifest/verification logs. Large generated review media/archives remain local.

Disk exhaustion blocked Git staging. A minimal prerequisite cleanup removed only rejected-incomplete-audit9-runtime-8b02fbff46d1.tar.gz (140826885 bytes): all 1123 file contents were verified SHA-256-identical inside retained complete audit9-runtime-8b02fbff46d1.tar.gz (1146 files). No original source or runtime file removed. Full audit follows remote checkpoint verification.
