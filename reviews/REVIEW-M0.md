# Review Packet M0: Foundation and Engine Gate

> **Status:** PARTIAL. T1–T3 done. T4: the Xcode project exports and builds; **the on-device runs need the owner's
> iPhones**. Desktop numbers below are a sanity check only; the D-004 call needs T4.

## Summary
- Godot **4.7.2-stable** project in `game/` (pinned in AGENTS.md), architecture §3 skeleton, 3 autoloads, GUT.
- Core rules (XP table, damage/RNG, stat block, card offer, text util) with 41 green tests incl. architecture rules.
- SoA swarm + spatial hash, projectile pool, pickup pool; separation staggered at 30 Hz (fallback ladder step 1, applied pre-emptively).
- Benchmark: headless sim runner + rendered scene (`tools/benchmark/benchmark.tscn`, MultiMesh, perf overlay, JSON results to `user://bench/`).
- iOS export preset (`game/export_presets.cfg`, Team `VXVP8KS7D6`, bundle `com.onderozbek.projectistanbul`): exports to an Xcode project that compiles (`BUILD SUCCEEDED`, unsigned check).

## Commits
```
476559e game: Godot 4.7 project, autoloads, GUT, core rules + 30 unit tests; fix XP table rounding in game-design
411eb44 game: SoA swarm, spatial hash, projectile + pickup pools, walker def, integration + architecture tests (41 green)
<this packet's commit> m0/t3-t5: rendered benchmark, separation stagger, iOS preset, REVIEW-M0
```

## Acceptance criteria
| Task | AC | Status | Evidence |
|---|---|---|---|
| T1 | Project opens; headless run exits 0; version pinned | Done | `AGENTS.md` (Tech), `game/project.godot` |
| T2 | `tools/test.sh` passes | Done | 41/41, see Tests |
| T3 | Headless sim prints ms/tick; scene runs on desktop | Done | Performance table; `reviews/media/M0/benchmark-desktop.png` |
| T4 | Results JSON from Low reference iPhone **and** 15 Pro Max / 16 Pro | **Export done; device runs pending (owner)** | Steps below |
| T5 | Packet with numbers + D-004 recommendation | Draft | This file; final after T4 |

## Tests
`tools/test.sh` → Scripts 7, Tests 41, Passing 41, ~0.7 s.

## Performance
Scenario (architecture §7): 500 walkers + separation, 200 projectiles, 300 XP droplets, 60 s at 60 Hz.

| Device | Run | Sim ms/tick p50 / p95 / p99 | Frame ms p50 / p95 | Draw calls | Static mem |
|---|---|---|---|---|---|
| MacBook (Apple M4), quiet | headless | 1.14 / **1.41** / 1.66 | n/a | n/a | n/a |
| MacBook (Apple M4), load avg ~29 | headless ×3 | 2.7–2.8 / 5.6–6.0 / 10.7–15.3 | n/a | n/a | n/a |
| MacBook (Apple M4), load avg ~29 | rendered, window, 8 s | 2.27 / **2.77** / 2.98 | 16.67 / 19.16 (vsync) | 7 | 36.9 MB |
| iPhone 11 / SE2 (A13), Low | rendered, 60 s | _T4_ | _T4_ | _T4_ | _T4_ |
| iPhone 15 Pro Max / 16 Pro, High | rendered, 60 s | _T4_ | _T4_ | _T4_ | _T4_ |

Budgets (Low tier): sim ≤ 4 ms/tick, render ≤ 14 ms, draw calls ≤ 80, memory ≤ 600 MB.
Note: the dev Mac was heavily loaded during most runs, so the spread is noise, not regression; the quiet run is the best desktop baseline.

## Balance
N/A (no levels yet).

## Telemetry
N/A for M0. Benchmark JSON files: `~/Library/Application Support/Godot/app_userdata/Project Istanbul/bench/` (desktop); on device the saved path is shown on screen at the end.

## Screenshots
- `reviews/media/M0/benchmark-desktop.png`: rendered benchmark at the end of a run (500 walkers, shots, droplets, hero + ring, results overlay), 390×844 portrait.

## Deviations
- **New tunable `SwarmConfig.separation_stagger = 2`** (`swarm_default.tres`): each enemy recomputes its separation push every 2nd tick and reuses the cached push in between. Implements architecture §4.2 "staggering" / fallback step 1 for separation, which the doc scoped to "expensive AI". Set to 1 to restore per-tick separation.
- Neighbor scratch buffer reduced from `4×max_neighbors+1` to `2×max_neighbors+1` (internal, no gameplay effect).
- `BenchStats.header()` now records the actual run length (was always 60 s).
- Removed orphan `tests/unit/test_zz_canary.gd.uid` (its script no longer exists).
- `project.godot`: enabled `textures/vram_compression/import_etc2_astc` (required by iOS export) and set `config/icon`.
- `game/export/.gdignore` + preset exclude filter so exports never get packed into the game.

## Known issues
- Rendered benchmark stays on its DONE screen unless `--shot=` is passed (intentional for on-device reading; desktop CI should use the headless runner).
- Placeholder app icon (`game/icon.png`, red hero disc + cyan ring); replace in M4.
- Harmless export warning: `application/boot_splash/fullsize` not found.
- **Godot 4.7.2 iOS template bug:** `libgodot.a` (bundled SDL joypad code) references `SDL_IsIPad` / `SDL_IsAppleTV`, which the template never compiles, so linking can fail ("Undefined symbol"). Workaround: tiny iOS plugin `game/ios/plugins/SDLStubs` (source + `build.sh` in `sdl_stubs_src/`), enabled in the preset. Verified: clean builds at iOS 15 and iOS 17 deployment targets. Remove it when an upstream template links cleanly.
- Privacy usage strings (camera/mic/photos) set to "Not used." because the template declares those keys; Xcode refuses empty values. Revisit before App Store submission.
- Xcode warnings that are safe to ignore: auto-linked framework not found (CoreAudioTypes, UIUtilities, AudioUnit), SwiftUICore client, `#pragma once in main file`.

## T4: steps for the owner
1. Export (already configured): `cd game && godot --headless --export-debug "iOS" export/ios/ProjectIstanbul.ipa` (output is gitignored).
2. Open `game/export/ios/ProjectIstanbul.xcodeproj` in Xcode. Sign in with your Apple ID (Xcode → Settings → Accounts) if you haven't. In Signing & Capabilities, tick *Automatically manage signing*, pick team VXVP8KS7D6, plug in the iPhone, select it and press Run. The first time, trust the developer profile on the phone (Settings → General → VPN & Device Management).
3. Let the benchmark run 60 s with the phone cool and plugged in; screenshot the DONE overlay.
4. Pull the JSON: Xcode → Window → Devices → app → Download Container → open the `.xcappdata` package and go to the `bench/` folder shown on the DONE overlay (on iOS `user://` maps into the app container, usually `AppData/Documents/bench/`). Drop the files in `reviews/media/M0/`.
5. Repeat on the A13 device and the 15 Pro Max / 16 Pro.

## Questions for the lead
1. OK to keep `com.onderozbek.projectistanbul` as the dev bundle id? (It can change freely until the first App Store upload.)
2. Accept `separation_stagger = 2` as the default (it's invisible at 30 Hz), or keep 1 and only stagger if A13 fails?

## Recommendation for D-004 (provisional)
**Lean Godot 4, pending the A13 run.** Desktop sim p95 is 1.4–2.8 ms against a 4 ms budget, with 7 draw calls. An A13 is roughly 2–3× slower per core than an M4, which puts the projected sim p95 at **~3–8 ms**, so it straddles the budget. Decision rule for when the T4 numbers arrive:
- A13 sim p95 ≤ 4 ms and frame p95 ≤ 33 ms → **Godot 4, pure GDScript.** Close D-004.
- Sim p95 4–8 ms → **Godot 4 + fallback step 2** (move the swarm kernel + spatial hash to GDExtension C++, ~1 week). Needs a lead OK (new build dependency).
- Sim p95 > 8 ms after step 2, or frame time dominated by rendering → step 3 (Unity 6), with a decision-log entry.

## Proposed next steps
1. Owner runs T4 (above); I fold the numbers into this packet and finalize the D-004 recommendation.
2. In parallel (doesn't depend on D-004's outcome for the design): Phase B browser prototype of Level 1 (`/prototype`), per `design/README.md`.
