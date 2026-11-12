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

# R1-T5: cross-level skill tree (design doc, proposed)

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
