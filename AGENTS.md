# AGENTS.md: Instructions for Coding Agents

**Project:** *Project Istanbul* (code name; game title in `docs/product.md` §1.1), a story-driven survivor-like mobile game set in a
zombie-overrun Istanbul. Portrait, one-thumb, Godot 4, **iOS first** (Android later).
**Current goal:** the vertical slice (Chapter 1, Levels 1–30). See `docs/prd.md`.

> **ACTIVE BUILD (2026-11-14): the JS prototype in `prototype/`, plan R1 (section R1 of `docs/execution-plan.md`).**
> Read `docs/handoff-codex.md` first (state, run and test commands, rules, what exists only on this Mac). Sections marked **(Godot, paused)**
> or **`game/` only** are the long-term target: do not start M0 or touch `game/` unless the owner asks. Prototype tests: `prototype/tools/run-tests.sh`.
> The full run takes about 20 minutes: start it in the background.

## Read these first, in this order
0. `docs/handoff-codex.md`: the current state and the traps (the next steps below assume you have read it), then
   `reviews/EXPERT-REVIEW-2026-11-14.md`: the audit and the phased roadmap (Phase 0 first)
1. `docs/prd.md`: what to build and how success is measured
2. `docs/execution-plan.md`: section R1 (the prototype, **your current task**); the Godot milestones in section 4 (paused); the review protocol in section 5
3. `docs/architecture.md` (Godot): tech stack, layout, patterns, dependency rules, **Godot 3 vs 4 pitfalls**
4. `docs/game-design.md`: rules, formulas, progression, telemetry
5. `docs/content-catalog.md`: starting numbers for all content
6. `docs/design-system.md`: visual and UX rules, readability, game feel, accessibility
7. `docs/level-001-istiklal.md`: the opening level in full detail
8. `docs/narrative.md`, `docs/product.md` and `docs/business-plan.md`: story, strategy and
   monetization (context; guardrails and monetization principles are binding)
9. `design/README.md` (Godot): wireframes of every key screen + the Level 1 map. **Copy these layouts
   for all UI, even placeholder UI**, so the art pass is a reskin, not a redesign. Docs win on conflict.

## Source-of-truth rules
- **Docs own intent.** Once implemented, `game/content/**/*.tres` owns the numbers.
- Changing a number → note it under *Deviations* in your review packet.
- Changing design or architecture → add a **proposed** entry to the decision log in
  `docs/product.md` §17 and ask the lead in your packet. Don't treat it as decided.

## Tech
- Prototype (active): plain JS, ES5-style IIFEs, no build step, namespace `P`, Node 20+. Tests: `prototype/tools/run-tests.sh`.
  Balance bot: `node prototype/tools/bot.js --level=5 --seeds=8`.
- Godot (paused, `game/` only):
  - Engine: **Godot 4.x stable.** Pinned version: **4.7.2-stable** (official, `ed1daf0bf`; pinned at M0-T1).
  - Language: GDScript with **static typing everywhere**. GDExtension (C++) only if M0 says so.
  - Tests: GUT. Command: `tools/test.sh` (the Godot suite, created in M0-T2; not the prototype suite).
  - Balance: `godot --headless --path game --script res://tools/bot_sim.gd -- --level=<ID> --seeds=50`
    (`game/tools/bot_sim.gd` is not in the repo yet).

## Hard rules
Both builds:
- **Files ≤ 600 lines** (prefer ≤ 300). Functions ≤ ~40 lines. One concern per file. Files over the limit today: `docs/handoff-codex.md` section 3.
- **Localization:** no hardcoded user-facing strings; use keys. Turkish casing goes through the text utility.
- **Guardrails** (narrative.md, *Writer Guardrails*): no real state actors, earthquake
  imagery, religion/politics as targets, or real brands/club crests. No flashes over 3 per second.
- **No secrets** in the repo. No new plugins, dependencies or paid services without asking.
- **Tests green before merging to `main`.**

Prototype (`prototype/`):
- **Sim and view are separate.** `js/sim/` never reads the view, `P.Settings` or quality. Numbers live in `js/config*.js`.
- **Voice text** lives only in `js/dialogue/`, written natively per language. Never translate a voice line (D-051, proposed; the owner's direction is in `reviews/OWNER-LEDGER.md`).

Godot only (`game/`, paused):
- **Godot 4 APIs only.** Check architecture.md §8 before writing engine calls.
- **No Node per enemy or projectile.** Use the SoA swarm (architecture.md §4.2).
- **No magic numbers in `game/sim/`.** Every gameplay value comes from a Def resource.
- **Simulation never reads quality settings** (architecture.md §4.17); tests enforce it.
- **Dependency rules** (architecture.md §5) are enforced by tests; don't work around them.

## Workflow
Prototype (R1, active):
1. Take the next task from `docs/execution-plan.md` section R1 and `reviews/EXPERT-REVIEW-2026-11-14.md` section 6 (Phase 0 first).
2. Branch `r1/p<phase>.<task>-<slug>` (example: `r1/p0.1-merge-main`); commits `r1/p0.1: ...`. One task, one branch, one PR into `origin/main`.
3. Implement, then run the tests your change touches (`prototype/tools/run-tests.sh <name> ...`). Before you push, run the full suite
   (`prototype/tools/run-tests.sh`, about 20 minutes, in the background). Run `node prototype/tools/bot.js` if levels or balance change.
4. After each step, update `reviews/REVIEW-R1.md`, then **stop** and wait for the owner's feedback.

Godot (paused, `game/` only; milestones M0 to M8 in `docs/execution-plan.md` section 4):
1. Take the next task from `docs/execution-plan.md` §4 for the current milestone.
2. Branch `m<N>/t<K>-<slug>`; small commits (`m1/t5: add lob_aoe behavior`).
3. Implement, then test (unit/integration/arch/content; `tools/test.sh`) and run the bot sim if levels changed.
4. At the milestone end: write `reviews/REVIEW-M<N>.md` (template: execution-plan.md §5.2)
   with the required screenshots in `reviews/media/M<N>/`. Then **stop** and wait for feedback.
5. On feedback: follow `reviews/FEEDBACK-M<N>.md`, append a *Resolution* section, re-request review.

## Stop and ask (write into `reviews/QUESTIONS.md`) before you
add a dependency/plugin · change an architecture rule · add content outside the slice ·
touch guardrail topics · spend money · deviate from a doc in a way that changes player experience.
