# Project Istanbul: Execution Plan (Vertical Slice)

> **Status:** v0.1 · 2026-11-08 · Owns: who does what, milestones, review protocol, prompt kit.
> **What to build:** [prd.md](prd.md). **How it's structured:** [architecture.md](architecture.md).

---

## 1. Operating Model

| Role | Who | Responsibilities |
|---|---|---|
| **Owner / decider** | Onder | Priorities, final calls on open decisions, plays every milestone build on a phone, recruits playtesters |
| **Lead / reviewer** | Opus | Owns the docs; reviews every milestone packet; issues revision instructions; makes architecture calls; updates docs between iterations |
| **Executor** | Coding model in an agentic harness | Implements milestones per the docs; writes tests; produces review packets; never changes design intent silently |

**Loop:** Executor builds a milestone → writes a review packet → Onder plays the build →
Lead reviews the packet + repo → feedback file → Executor revises → Lead approves → next milestone.

**Important reviewer limitation:** the lead can read code, run headless tests and the bot
simulator, and **view images**, but **cannot watch video or play the game**. Packets must
therefore include **screenshots at specified moments**, test/bot output and telemetry files.
Videos are for Onder.

## 2. Executor Requirements (model-agnostic)

Pick the executor by these criteria, not by brand:
1. **Agentic reliability:** edits files, runs shell commands, reads errors, fixes them in a loop without hand-holding.
2. **Godot 4 GDScript correctness:** zero Godot 3 APIs (architecture.md §8).
3. **Long-context discipline:** reads AGENTS.md + docs and follows them; updates docs when it deviates.
4. **Test-first habits:** writes and runs tests unprompted.
5. **Cost/speed:** a full milestone in days, not weeks.

### Selection (D-015, revised 2026-11-08)
**Onder picks the executor model directly** (no bake-off). The five criteria above become the
lead's checklist in every review. If the executor fails them repeatedly (for example, keeps
writing Godot 3 APIs or ignoring the architecture), swap the model: all context lives in the
repo, so switching costs one kickoff prompt.

## 3. Working Agreements (also in AGENTS.md)

- **Docs are the source of truth for intent;** `game/content/**/*.tres` is the source of truth for numbers once implemented.
- **Branch per task:** `m<N>/t<K>-<slug>`; small commits; message format `m1/t5: add lob_aoe behavior`.
- **Tests green before merging to `main`.** Never commit with failing tests.
- **Files ≤ 600 lines** (prefer ≤ 300). Static typing everywhere.
- **Tuning changes** (numbers) go in the packet's *Deviations* section. **Design or architecture changes** need a product.md decision-log entry, flagged as "proposed" until the lead approves.
- **Stop and ask** (write the question into the packet or `reviews/QUESTIONS.md`) before:
  adding a plugin/dependency, changing an architecture rule, adding content outside the slice,
  touching anything in the narrative guardrails, or spending money (assets, services).
- **No secrets** (keys, tokens, signing files) in the repo.

## 4. Milestones

Each task has acceptance criteria (AC). A milestone ends with a **review gate** (§5).
Durations assume one executor working steadily; compress if velocity allows.

### M0: Foundation and Engine Gate (week 1)
| Task | Description | AC |
|---|---|---|
| T1 | Create the Godot 4 project in `game/`, pin the version in AGENTS.md, folder skeleton (architecture.md §3), the 3 autoload stubs, Godot `.gitignore` entries | Project opens; headless run exits 0 |
| T2 | Install GUT; add `tools/test.sh`; one real unit test (XP table from game-design.md §4.5) | `tools/test.sh` passes |
| T3 | Benchmark scene: SoA swarm (500 walkers, separation, spatial hash), projectile pool (200), XP droplets (300), MultiMesh rendering, perf overlay, JSON results file | Headless sim benchmark prints ms/tick; scene runs on desktop |
| T4 | iOS export (Godot → Xcode project → device): run the benchmark on the **Low reference iPhone** (A13 class) **and** on the iPhone 15 Pro Max / 16 Pro | Results JSON from each device |
| T5 | Packet `reviews/REVIEW-M0.md` with numbers + recommendation for D-004 | Lead decides the engine |

### M1: First Playable, Gray Box (weeks 2–3) — **"Is it fun?" checkpoint**
| Task | Description | AC |
|---|---|---|
| T1 | `core/`: stats + modifiers + damage + caps + XP curve + card weighting, with unit tests | Values match game-design.md §4–5 tables |
| T2 | InputRouter, floating joystick, desktop controls | US-2.1 AC |
| T3 | Arda placeholder (capsule + ring), camera with look-ahead | Camera spec (game-design.md §2) |
| T4 | Swarm promoted to `sim/`: walker + runner Defs, contact damage, deaths, XP droplets, pickup radius | 300 enemies at 60 fps on desktop |
| T5 | Weapon framework + Döner Knife (D-017 kit); level-up card UI (placeholder) | US-3.1 AC |
| T6 | Arena test level (30 × 30 m), simple budget spawner, run timer, death → results stub | A complete run loop |
| T7 | Telemetry JSONL sink with core events | JSONL written and exportable |

### M2: Systems Complete (weeks 4–5)
| Task | Description | AC |
|---|---|---|
| T1 | All Resource Defs + content validator; all slice content entered as `.tres` from content-catalog.md | Validator passes; zero magic numbers in `sim/` |
| T2 | All slice weapon behaviors, passives, evolutions, status effects | Debug arena shows every item at L1 and L5, plus 4 evolutions |
| T3 | Spawn director: WaveScript, markers, patterns, modifiers, caps | US-4.3 AC |
| T4 | Enemy behaviors: crawler, brute, spitter, exploder, tourist, fisherman, elite variant | Distinct behaviors per content-catalog.md §5 |
| T5 | Boss FSM + AttackDef telegraphs; Kestaneci implemented | Telegraph rules (design-system.md §6) |
| T6 | RNG streams + InputRecorder + golden test | Same seed + inputs → identical result |
| T7 | Headless bot simulator + CSV reports | game-design.md §11 |
| T8 | Architecture tests (dependency rules, quality independence) | Tests fail on a deliberate violation |

### M3: Level 1 Complete in Gray Box (weeks 6–7)
| Task | Description | AC |
|---|---|---|
| T1 | Route level type: corridor, segments, hold zones, exit trigger | US-5.1 AC |
| T2 | Level 1 per level-001-istiklal.md (layout, markers, WaveScript, interactables); map in `design/lofi/level-001-map.svg` | level-001 §13, items 4, 5, 7 |
| T3 | In-engine cinematic sequencer with interactive beats; cold open blocked out | level-001 §4; US-1.2 AC |
| T4 | Tutorial steps, phone-call widget, barks, localization pipeline (TR/EN) | level-001 §5, §9 |
| T5 | Results screen (stars, rewards), save system v1 | US-7.3, US-11.1 AC |

### M4: Look and Feel (weeks 8–11)
| Task | Description | AC |
|---|---|---|
| T1 | **Style frames (6–10)** per `design/style-exploration.md` (can start any time before M4): Onder + lead approve. **Blocking** for all other art | Approved frames committed in `art/style-frames/` |
| T2 | Style model + asset pipeline + `art/PROVENANCE.csv` | design-system.md §12 |
| T3 | Arda's full animation set; walker/runner/crawler; Level 1 environment kit and props | level-001 §14 |
| T4 | UI kit: HUD, cards, results, call widget, settings | design-system.md §13 |
| T5 | Game-feel spec, VFX, music layers, SFX, temp VO | design-system.md §7, §14, §15 |
| T6 | Quality tiers, device detection, HD-asset delivery stub; perf pass on the Low device | US-9.1, US-9.2 AC |
| T7 | Accessibility settings | design-system.md §11 checklist |

### Demand Test Gate (owner-run, weeks 10–12, parallel to the end of M4)
Onder runs the demand test (product.md §14, Phase 3) using approved key art and Level 1
beauty footage. **M5 starts only if the demand signal is good.** The executor's job here is
limited to capturing clean footage and screenshots from the M4 build.

### M5: District 1 (weeks 12–14)
| Task | Description | AC |
|---|---|---|
| T1 | Levels 2–10 (data + maps via the district template); Vatman boss; Kestaneci polish | content-catalog.md §6–7 |
| T2 | Meta: hero levels, Survival Skills (Arda), Workshop mastery, 4 gear slots + merge, 4 currencies, star chests, power caps | game-design.md §8.1–8.7, §8.15 |
| T3 | World map with route, nodes, km progress | US-7.1 AC |
| T4 | Motion-comic player; L10 comic; dizi triple zoom | US-6.1 AC |
| T5 | Bot balance pass for L1–10 | Within game-design.md §7 bands |

### M6: Districts 2–3 and Kaan (weeks 15–18)
| Task | Description | AC |
|---|---|---|
| T1 | Levels 11–30; Tour Guide, The Bride (halay line), Big Fisherman, Kaan story fight | content-catalog.md §6–7 |
| T2 | Squad, tag-switch, companion AI, ultimates; Kaan's Survival Skills tree | game-design.md §9, §8.3 |
| T3 | Paşa early-warning behavior; L20 and L30 motion comics | narrative.md, content-catalog.md |
| T4 | Bot balance pass for L11–30 | Within §7 bands |

### M7: Slice Polish and Playtest (weeks 19–20)
| Task | Description | AC |
|---|---|---|
| T1 | Bug bash, performance, crash-free target, ads stubs, settings complete | prd.md §6 |
| T2 | Internal test builds via TestFlight | Installable by testers |
| T3 | Playtest: 10–20 external testers; telemetry + short survey | Data collected |
| T4 | Final packet with PRD §7 metrics | Go/no-go for soft-launch prep |

### M8: Soft-Launch Prep: Monetization and Live Ops (weeks 21–26, scoped in detail after M7)
| Task | Description | AC |
|---|---|---|
| T1 | Real IAP (StoreKit 2 via a Godot iOS plugin or RevenueCat) + receipt validation approach | Sandbox purchases work end to end |
| T2 | Rewarded ads SDK with mediation; App Tracking Transparency prompt; SKAdNetwork IDs | Test ads fill on device |
| T3 | Bazaar, Road Pass, Monthly Card, boosters, offers, daily tasks, login calendar | game-design.md §8.5, §8.8–8.14 |
| T4 | Remote config + A/B framework (e.g., Firebase) behind `ConfigProvider` | Prices, caps and offers tunable without a release |
| T5 | Store catalog per business-plan.md §6; App Store Connect products, privacy labels, age rating | Ready for App Review |

### R1: Prototype Revision (JS prototype v0.9 to v1.0, owner list of 2026-11-10; proposed D-054)
The vertical-slice milestones above target the Godot build. R1 covers the JS prototype in `prototype/`, which is what the owner plays today.
Workstreams are the owner's list, in the recommended order. Each task ends with a packet section in `reviews/REVIEW-R1.md` (§5.2 template) and waits for owner feedback.
| Task | Description | AC |
|---|---|---|
| T0 | **Housekeeping from the dialogue pass.** Open the PR for `dialogue/two-native-scripts` (needs `gh` re-auth). Owner decision on `H14i3a` (TR, clipped) and `H11i3a`. Fix `view/comic-layout.js`: name tag over the bubble above, Kaan tail crossing the Arda bubble (H10i2, H19i2), finale SFX cut at the bottom. Finish the in-game bark check (TR `BK.self#2`, 98 characters, priority 3, level-up overlay suppressed) | Screenshots at 390x844 in EN and TR show no overlap or clipping on H07i3, H10i2, H19i2, FINa, FINb; one bark screenshot per language |
| T1 | **Enemy audit.** Read-only report `reviews/AUDIT-ENEMIES-<date>.md`: per enemy and skin, role in the fight, silhouette and telegraph readability at phone size, overlap with other types, whether the Istanbul skins change behavior or only color, bot-sim data. Verdict per enemy: keep, tweak or redesign, with proposals (new behaviors, counters, boss tells). No code changes until the owner answers | Every enemy in `config-enemies*.js` has a verdict; number changes listed as deviations; owner picks what to build |
| T2 | **Art direction.** Cause: the cartoon art is drawn in code on a canvas (flat shapes). Produce 2 or 3 style samples for the same three subjects (Ataköy building, apartment interior, one comic panel with Arda and Kaan) and compare pipelines: authored vector or raster assets (generated, then hand-checked) against a stronger procedural style. Owner picks one; record it as a decision and update `design-system.md` and `design/style-exploration.md`. **Blocking for T3 art and T4 art** | Samples committed under `reviews/media/R1/style-samples/` at 390x844; owner pick recorded; provenance rule for any generated asset (`art/PROVENANCE.csv`, design-system.md §12) |
| T3 | **Istanbul arenas.** A one-page visual brief per hood (20): landmarks, props, ground and wall materials, signage and Turkish text, light, ambient sound idea, from the hoods bible. Then rebuild the arena kit in the chosen style, three hoods first (İstiklal, Kapalıçarşı, Ataköy), then the rest after owner review | 20 briefs in `docs/hood-visual-briefs.md`; before and after screenshots for three hoods; owner check: "could only be Istanbul" |
| T4 | **Animation and feel.** Reconcile the unfinished feel, vehicle and fire-animation work in the working tree with the owner list, then add: hit-stop and shake tuning, enemy spawn and death animation, dash and pickup effects, boss telegraphs, UI motion, bark timing. Respect design-system.md §7 (no flashes over 3 per second) and add a reduce-motion setting | Short before and after clips; frame-time p50 and p95 on the Low reference device (or the nearest available) before and after; accessibility checklist |
| T5 | **Cross-level skill tree and progression.** Design doc first (what persists between levels, costs and currencies, ties to the bond meters and the existing Survival Skills, caps, monetization guardrails of business-plan.md), as a proposed decision and a wireframe in the `design/README.md` style. Owner approves, then implement and tune with the bot sim. Can run in parallel from the start | Doc approved; tree screen matches the wireframe; bot-sim bands per game-design.md §7 for levels 1 to 30 |
| T6 | **Optional, owner picks:** first-session review (cold open, level 1, first map visit), audio audit (what exists, what is missing), performance budget for the heavier art | One short findings file each |
| T7 | **Story density (proposed 2026-11-10).** Chapter 1 has 122 distinct pop lines, no Kaan backstory and three Mila lines in 100 levels. Slice first: about 25 beats for L1–30 (Arda–Kaan bond, Mila seeds, a Captain end-page at L25, a Mom-call plant), then about 30 for L31–100 after the slice play-test. Table in `reviews/STORY-DENSITY-L1-30.md`. TR written natively by the owner (D-051). Chapters 2–3 are deferred until Chapter 1 ships | Owner approves the table; EN and TR lines pass `test-dialogue.js`; screenshots of `captain_end` in both languages; no number changes (bot sim unchanged) |

Order: T0 and T1 now; T2 next (owner pick); T3 and T4 follow the pick; T5 runs in parallel and needs only owner decisions. Risks: the art pick slips (mitigation: cap at three samples, one review round); effects hurt frame time (mitigation: budget set before T4, numbers in every packet).

## 5. Review Protocol

### 5.1 Files
```
reviews/
  REVIEW-M<N>.md          packet written by the executor
  FEEDBACK-M<N>.md        written by the lead
  QUESTIONS.md            open questions for the lead or owner (running list)
  media/M<N>/             screenshots (PNG). Videos (.mp4) are gitignored; share them separately with Onder
```

### 5.2 Packet template (`REVIEW-M<N>.md`)
```markdown
# Review Packet M<N>: <title>
## Summary            (5 bullets max: what was built)
## Commits            (`git log --oneline <from>..<to>`)
## Acceptance criteria (table: task / AC / status / evidence path)
## Tests              (command + pass/fail summary)
## Performance        (device, tier, p50/p95 frame ms, sim ms/tick, memory, peak enemies)
## Balance            (bot sim summary per changed level vs target bands)
## Telemetry          (JSONL paths + key numbers)
## Screenshots        (path + what it shows; required list per milestone below)
## Deviations         (number/design changes: what, why, doc updated?)
## Known issues
## Questions for the lead
## Proposed next steps
```
**Required screenshots** (minimum): M1: peak-density arena + card UI · M2: each evolution
active + each boss telegraph · M3: each Level 1 segment + hold-zone peak · M4: same moments as
M3 in final art, side by side with the style frames, on Low and High tiers · M5–M6: every
boss phase + world map + one motion-comic panel per comic.

### 5.3 Feedback format (`FEEDBACK-M<N>.md`)
- **Verdict:** `APPROVED` | `APPROVED WITH CHANGES` | `REVISE`.
- Items by severity: **BLOCKER** (must fix before merge), **MAJOR** (fix in this milestone),
  **MINOR** (fix when touching the area), **NIT** (optional).
- Each item: ID, file/line or doc section, problem, required action, AC to verify.
- The executor appends a **Resolution** section (item ID → commit) and requests re-review.

### 5.4 What the lead always checks
Doc adherence · Godot 3 API leaks · dependency rules · magic numbers in `sim/` · test quality ·
performance numbers · readability in screenshots · telemetry completeness · file sizes ·
guardrails (narrative.md, *Writer Guardrails*) · decision-log hygiene.

## 6. Prompt Kit

### 6.1 Kickoff prompt (executor)
```
You are the executor for "Project Istanbul" (code name; game title in docs/product.md §1.1), a mobile survivor-like set in Istanbul.
Read AGENTS.md first, then the docs in the order it lists. The docs are the source of truth.
Your job right now: milestone M<N> from docs/execution-plan.md §4, tasks T<a>–T<b>.
Rules: follow docs/architecture.md exactly (Godot 4 only, static typing, SoA swarm,
data-driven content, dependency rules). Write tests. Keep files under 600 lines.
Do not change design intent; log number changes under "Deviations" in the review packet.
Stop and write a question into reviews/QUESTIONS.md if you hit any "stop and ask" case.
When done, write reviews/REVIEW-M<N>.md using the template in execution-plan.md §5.2,
including the required screenshots. Then stop.
```

### 6.2 Revision prompt (executor)
```
Read reviews/FEEDBACK-M<N>.md. Fix every BLOCKER and MAJOR item, and MINOR items in files you
touch. For each item, reference the fixing commit in a "Resolution" section appended to
reviews/REVIEW-M<N>.md. Re-run tests, the bot simulator for changed levels, and refresh the
affected screenshots. Then stop.
```

### 6.3 Review prompt (lead, back with Opus)
```
Review milestone M<N> of Project Istanbul. Read reviews/REVIEW-M<N>.md, inspect the diff
(<from>..<to>), run tools/test.sh and the bot simulator where relevant, view the screenshots,
and write reviews/FEEDBACK-M<N>.md per execution-plan.md §5.3. Update docs if decisions changed.
```

## 7. Definition of Done (any task)

1. Meets its AC, with evidence in the packet.
2. Tests added/updated and green; architecture and content tests green.
3. No Godot 3 APIs, no magic numbers in `sim/`, files ≤ 600 lines, static types.
4. Strings localized (TR/EN keys), no baked text in images.
5. Telemetry events added where the schema requires them.
6. Docs updated if behavior or intent changed.

## 8. Timeline Summary

| Week | Milestone | Owner moment |
|---|---|---|
| 1 | M0 | Engine decision |
| 2–3 | M1 | **Onder plays the first playable** |
| 4–5 | M2 | Systems demo review |
| 6–7 | M3 | Level 1 gray box; first internal telemetry |
| 8–11 | M4 | Approve style frames (week 8); Level 1 beauty build |
| 10–12 | Demand test | **Go/no-go for district production** |
| 12–14 | M5 | District 1 + meta |
| 15–18 | M6 | Districts 2–3 + squad |
| 19–20 | M7 | External playtest → go/no-go for soft-launch prep |
| after v0.9 | R1 | Prototype revision (art, arenas, animation, progression, enemies); owner decides the order after the T1 audit and the T2 art pick |

## 9. Execution Risks

| Risk | Early signal | Response |
|---|---|---|
| Executor drifts from the docs | Packet deviations pile up, or none listed while the diff shows changes | Lead issues REVISE; tighten the kickoff prompt |
| Gold-plating | Features outside the PRD appear | Revert; the PRD non-goals are binding |
| Art bottleneck | M4-T1 slips past week 9 | Simplify the style (flatter shading); reduce the outfit count |
| Perf regressions | p95 rises between packets | Perf numbers required in every packet; bisect |
| Fun gap | M1 testers stop before 5 minutes | Iterate M1 (feel, pacing, XP) before M2; do not proceed on "fine" |
