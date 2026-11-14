# Expert review and roadmap: Project Istanbul, 2026-11-14

From the previous implementation agent (Wibey Desktop, Claude), which built most of the R1 prototype, to the next one (Codex) and the owner.
This is an honest audit, including my own mistakes. Read it after `docs/handoff-codex.md`. It recommends; decisions stay with the owner and are logged
in `docs/product.md` section 17 as proposed until he accepts them.

## 1. Verdict in one paragraph

The project has a strong engineering spine (a deterministic sim with golden traces, config-driven numbers, native-language dialogue, guardrail checks, an
art and audio pipeline the owner can feed himself) and a lot of content. But it has been **optimising breadth on top of unmeasured foundations**. In 7 days
and 108 commits, **not one frame-time or memory number has been taken on an iPhone**, the game is "fun" only by the account of one player (the owner, who
last called it boring and samey) and a bot, and the "prototype" has quietly become the real game (43k lines of JS) while the Godot build it was meant to
inform sits frozen at M0. The next month should be about **ground truth, convergence and the first 15 minutes**, not more systems.

## 2. Evidence (measured today)

| Fact | Number |
|---|---|
| Prototype JS | 254 files, 43,375 lines (view 23.0k, sim 8.0k, dialogue 4.3k, meta 3.4k), 254 `<script>` tags, no bundler, one global namespace |
| Tests | 36 Node test files (9.3k lines), full run about 20 min, 5 Chrome tests flake under load, **no CI** |
| Docs | 108,550 words in `docs/`; `reviews/REVIEW-R1.md` 2,037 lines; 27 files in `reviews/` |
| Git | 108 commits since 2026-11-08; branch `r1/t2-art-direction` 48 commits ahead of `main` (main last moved 2026-11-10); no PR |
| Device data | **None.** Godot M0-T4 device runs "pending (owner)" since 2026-11-08; the prototype has never been profiled on an iPhone |
| Raster art | Characters decode to about 85 MB (budget 64 MB). The hero source is 320 px tall; on screen he is about 39 CSS px (117 device px at 3x), so atlases are about 2.7x too large per side, about 7x in memory |
| Balance | Bot: Normal about 4.1 min a level (target 5 to 5.5), about 2,000 kills a level (design assumed 500). Human data: one session, one full level (4.3 min, 1,902 kills) |
| Rule breaks | Over 600 lines: `view/sfx-bank2.js` 678, `view/istanbul-props2.js` 627, `view/sfx-bank.js` 609; `view/screens.js` 597 |
| Open questions | `reviews/QUESTIONS.md` has three items open since 2026-11-08 (doc conflicts: simit heal 25 vs 30, door y, "Second Wind" defined twice, hit-stop ms) |

## 3. What is good: keep it

1. **Sim and view separation with golden traces** (`test-modes`). This is the project's best asset: it makes view work safe and is the parity test for any port.
2. **Numbers in config, text in string tables, voice lines written natively per language** (D-051). Do not regress this.
3. **The asset loop the owner runs himself:** prompts generated from config (`gen-art-prompts-*.js`, 419 prompts), importer with budget and checks (`prepare-art.js`), music and SFX prep. It scales without an artist on payroll.
4. **The bot** (`tools/bot.js`) as a regression guard and the **telemetry export** the owner can paste.
5. **Guardrail checks** in code (`check-banned.js`, the prompt test) and the flash budget.
6. **The owner's phone playtest loop.** It found every real bug this week (music overlap, silent-switch mute, the dead stick zone, the broken first-run map). Keep it at the centre.

## 4. Findings

### Critical

**C1. Nothing is measured on the target device.** iOS first is the strategy, yet every performance and audio claim is from headless desktop Chrome. Raster
art is over the memory budget on paper, and iOS Safari kills tabs on memory without warning. The engine decision (D-004) was meant to rest on M0-T4 device
numbers that were never taken.
*Action:* a device baseline before any new feature (Phase 0.2). Make it zero-effort for the owner: one URL that runs a scripted 60 s capture and puts p50
and p95 frame ms, memory, peak enemies and audio state into the telemetry export.

**C2. Platform drift.** The JS build is now the product in all but name, and each week of features raises the cost of a Godot port. Running both
paths "for later" is the worst option.
*Action:* a decision gate (Gate A, proposed D-067) at the end of Phase 0, with data from C1:
- (a) **Ship the JS build in a native wrapper** (WKWebView, for example Capacitor) if it holds 60 fps (p95 under 16.7 ms) at the 200-enemy cap with raster art on an iPhone 11-class device. Then the Godot work becomes optional. This adds a dependency, so it is a stop-and-ask item.
- (b) **Freeze prototype features and port to Godot** if it cannot, using the prototype as the spec and the golden traces as parity tests, sim first.
- My recommendation: measure first; I expect (a) to be viable for the slice and much cheaper. It is the owner's call.

**C3. Fun is unvalidated, and scope keeps growing.** The slice goal is Levels 1 to 30, but the build carries 100 levels, 20 hoods, 19 enemy designs, 11
bosses, 17 weapons, two replay modes, a skill tree, a bond system, dailies and achievements. The only human verdict is the owner's: "boring, everything looks
similar, no visible progression." The answer this week was another additive variety pass, not a cut.
*Action:* freeze new systems. Make Levels 1 to 5 excellent for a **new** player, then test with 5 to 8 people who are not the owner (Phase 1).

### Major

**M1. Four art systems.** Code-drawn canvas art, hand-wired SVG atlases (Galata, Bridge, Saray), SVG layout floors, and the new raster atlases behind a
flag. Every visual feature costs two to four times and looks inconsistent. *Action:* once the device check passes, make raster the default per hood, retire
the code art per category (keep it only as the missing-asset fallback), port the hand-wired hoods to the importer, and downscale atlases in `prepare-art.js`
to what the screen needs (target 25 MB decoded or less for characters).

**M2. Balance tuned to a bot.** The bot kills about four times the designed count and finishes faster than target; Nightmare and Night Shift medians move with
the seed sample. *Action:* tune from human telemetry. Add HP over time, deaths with cause, level-up picks and quit point to telemetry. Keep the bot as a
regression guard, not the target.

**M3. Tests that are many but shallow and slow.** Many tests are structure or string checks. Loaders use hand-picked file lists, so a new dependency breaks
them silently (`test-perks-world` broke when `events-fx.js` started calling `ConsumablesZone`, and no one noticed until a full run). No CI. *Action:* a
fast tier (2 minutes or less) on every commit and the full tier on merge, in GitHub Actions (ask first: it adds a service); one shared loader that reads
`index.html` order instead of hand lists; behaviour tests over grep tests for new work.

**M4. Branch and release hygiene.** One branch named for T2 carries T4, T5 and the art work, 48 commits, unmerged, so `main` is four days stale.
*Action:* full suite, a PR, merge with the owner's OK. From then on one task means one branch and one PR.

**M5. Prototype architecture under strain.** 254 global script tags with load-order coupling. Features are layered by interception (wrapping another file's
hook, guarded early returns inside `sprites.js` and `render.js`) rather than through registries. Boot cost of 254 requests on iOS is unmeasured. *Action:*
split the four oversized files; introduce small explicit registries (draw layers, art providers) instead of wrappers; if Gate A picks the wrapper, add a
concatenation build step for the phone (ask first).

**M6. Documentation the owner cannot use.** 108k words of docs and a 2,000-line review packet for a director who does not read code. Docs drift from
reality (AGENTS.md did not mention the prototype until today). Questions from day one are still open. *Action:* a one-screen owner packet per step (what
changed, what to test on the phone with the URL and three steps, decisions needed), with detail in an appendix. Close or archive stale questions.
Keep `docs/handoff-codex.md` true as the single current-state page.

**M7. iOS audio has regressed twice.** "Fixed" overlap became silence. The current fix is unverified on a device. *Action:* verify on the phone with the
silent switch on and off before any other audio work, and add a device checklist line to every audio change.

**M8. Accessibility and UI debt.** The design system requires colourblind-safe palettes; none exist. Known UI bugs: the Istiklal badge under the tab row,
the HUD HP float, objective chips over the results title, the map tab row overflowing at 150% text. *Action:* Phase 2.

### Minor

- `objectives-hud.js drawMarkers` reads `R.cam` before the first frame in a story run (throws).
- Asset licensing: every ChatGPT, Suno and AI-SFX asset needs a complete `art/PROVENANCE.csv` row (tool, plan tier, date, prompt file). Check commercial terms for each tool at the plan tier used **before any public build**. Raw sources exist only on one Mac: back them up.
- Raster gaps: skin outfits (fisher, musician, hamal) lost under raster; bosses shrink on attack and hurt frames; the regenerate list in REVIEW-R1 part 20.
- Telemetry has no session or retention events (needed for a D1 proxy).
- The Turkish review table `reviews/TR-REVIEW-R1-T4.md` is still open.

## 5. My own failure modes (so you do not repeat them)

1. **I called things fixed that were only verified on desktop.** Music overlap and then silence on iOS came back from the owner's phone. Label every claim "device-verified" or "desktop-only".
2. **I committed once with a failing test** (a flake, but I did not know that when I committed) and often ran only a subset. Use `tools/run-tests.sh` before every commit you push.
3. **I answered requests additively.** "It feels samey" got a variety system instead of a cut and a focus. Ask what to remove first.
4. **I wrote packets for agents, not for the owner.** Thorough, but unreadable for him.
5. **I let the branch drift** across tasks instead of merging per task.
6. **I ran parallel sub-agents on overlapping files** (`render.js`). It worked, but only because of tiny hunks and luck. Give each worker disjoint files.

## 6. Roadmap

Each phase ends with an owner gate. Dates assume one agent working daily with the owner playtesting every 2 or 3 days.

### Phase 0: ground truth (3 to 5 days)
| # | Task | Done when |
|---|---|---|
| 0.1 | Full suite, PR `r1/t2-art-direction` into `main`, merge with the owner's OK | `main` holds the work; suite green |
| 0.2 | Device capture mode (`?bench=1`: scripted 60 s at L1, the L5 boss and a 200-enemy level, flag off and `?art=raster`), results in the telemetry export | The owner pastes one JSONL with p50/p95 frame ms, memory, audio state |
| 0.3 | Atlas downscale in `prepare-art.js` to on-screen need | Characters 25 MB decoded or less; screenshots unchanged at phone size |
| 0.4 | Fast test tier, shared index-order loader, CI (ask first) | Fast tier at most 2 min; CI green on the PR |
| 0.5 | Split the four oversized files; fix the `objectives-hud` crash; verify iOS audio | No file over 600 lines; audio confirmed on the phone |
| **Gate A** | **Platform decision (D-067) from the 0.2 data** | Owner picks (a) wrapper or (b) Godot port |

### Phase 1: the first 15 minutes (1 to 2 weeks)
| # | Task | Done when |
|---|---|---|
| 1.1 | Raster default for Istiklal and Galata; regenerate list for those two hoods first | No code-art characters or floors in L1 to L10 |
| 1.2 | Weapon visuals per tier on the new art (body-only tier sheets) | Tier 1 vs tier 5 obvious at phone size |
| 1.3 | Each of L1 to L5 visibly different: one new enemy or weapon moment and one arena change per level | Owner agrees "no longer samey" |
| 1.4 | Telemetry: HP over time, deaths and cause, level-up picks, quit point, session events | Fields in the export; test-tel covers them |
| 1.5 | External playtest: 5 to 8 people, a one-page script, telemetry collected | A findings page with the top 5 problems |
| **Gate B** | **Is it fun for strangers?** | Most testers want to continue after L5; median L1 time in band; top problems known |

### Phase 2: the slice, Levels 1 to 30 (2 to 3 weeks)
- Raster art for the Chapter 1 hoods; retire their code art.
- Balance L1 to 30 from human telemetry; the bot bands re-based on it.
- Close the Turkish review; colourblind palettes; the UI bug list.
- Nightmare and Night Shift: tune from data or move out of the slice.
- **Feature freeze outside the slice:** no new modes, systems or hoods.
- **Gate C:** the owner plays L1 to 30 on the phone end to end with no blocker.

### Phase 3: platform path (per Gate A)
- (a) Wrapper: bundle step, offline assets, wrapper project, TestFlight build, crash reporting (each new service is a stop-and-ask item).
- (b) Godot port: the prototype is the spec; port the sim first with golden traces as parity tests, then the view per category against the raster atlases.
- **Gate D:** a TestFlight build installs and runs L1 to 30 at budget on an iPhone 11-class device.

### Phase 4: soft test (2 weeks)
- 20 to 50 TestFlight players; D1 and D7, session length, crash rate, where people quit.
- Monetization only after a retention signal, inside `docs/business-plan.md`'s guardrails.

## 7. How Codex should work with this owner

- **One task, one branch, one PR to `main`.** The owner approves merges.
- **Owner packet: one screen.** What changed; the phone URL and three steps to test; decisions needed. Detail goes in a REVIEW appendix.
- **Label every claim** "device-verified" or "desktop-only".
- **Before adding anything, ask:** does this make Levels 1 to 5 better for a new player? If not, park it in `reviews/QUESTIONS.md`.
- **Prefer cutting to adding** when the feedback is "boring" or "confusing".
- **Each phone bug gets a test** that would have caught it.
- **Keep `docs/handoff-codex.md` true** after every task. It is the single current-state page.

## 8. Stop doing

- New systems, modes or hoods before Gate B.
- Bot-only balance decisions.
- Merging-later branches that carry several tasks.
- Long review packets as the owner's main read.
- Code-art polish for anything that has a raster asset coming.
