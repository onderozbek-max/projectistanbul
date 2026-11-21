# Experiential evidence and remaining gates · 2026-11-18

## Build and source identity

Local no-cache preview: [review build](http://127.0.0.1:8775/?level=1&seed=42&lang=en). This is a Mac-hosted development build; the server must remain running. Phone access requires the Mac's LAN address and same-network access. No deployment or public service was added.

[Build manifest](telemetry/experiential/build.json) · [runtime SHA-256 list](telemetry/experiential/source-build.sha256) · [verification tool hashes](telemetry/experiential/tools.sha256) · [media validation](telemetry/experiential/media-validation.json) · [final checks](telemetry/experiential/final-checks.json) · [still hashes](telemetry/experiential/stills.sha256) · [source-art checksum log](telemetry/experiential/local-sources.log).

Source is the dirty local checkout on `r1/p2.1-turkish-dialogue-audit`, base `4f5361dc0f5306a0243719a8afba9382d4c9e9d3`. The runtime list covers 1113 files (runtime, assets and audio; excludes Markdown and tools). A separate final tool manifest identifies the diagnostics. No new image/audio asset was imported: the current approved ImageGen illustrations and eight prepared music tracks were reused. Current-source character retry does not draw retired bodies while waiting.

Every primary indexed capture was regenerated against the same frozen final runtime hash, including component rosters. The earlier epoch-A and intermediate aftermath captures are history under `before-world-framing/`; the initially recorded replay-save sequences are history under `replay-before-save-snapshot-fix/`. Neither is included in the final evidence index. This is a coherent build, with separately dated sessions rather than a fabricated single playthrough.

A diagnostic snapshot bug was found and corrected: `Meta.state()` returns a mutable object, so the original `saveBefore` was serialized after settlement. All four campaigns were rerun with cloned pre-clear snapshots. Their entry loadouts, sim events, outcomes, timings and evolution metrics are identical; only the snapshot and saved timestamp differ. Final L20/L25/L30 recordings use the corrected pre-clear saves and assert a real first-clear result. [Snapshot verification](telemetry/experiential/snapshot-verification.json) preserves the correction; original raw records remain archived.

## Indexed normal-speed evidence

[Combined index](media/R1/experiential/index.json) · [weapon index](media/R1/experiential/index-weapons.json) · [world index](media/R1/experiential/index-world.json) · [boss index](media/R1/experiential/index-bosses.json) · [actor index](media/R1/experiential/index-actors.json) · [earned scenes](media/R1/experiential/index-earned.json) · [accessibility/ownership/reload additions](media/R1/experiential/index-additions.json).

All recordings are desktop Chrome headless at 390×844, DPR 1, actual presentation speed, seed 42 unless the record says otherwise. This is not physical iPhone evidence. Each record includes locale/settings, quality where available, power origin, input policy and supplied assists. The combined index has 157 records: **155 audiovisual files** and two direct lifecycle/reload checks; media validation confirms both video and audio streams, positive packet/container duration and hashes. Streaming WebM may omit a finalized duration header; its last video packet supplies the measured duration.

| Set | Coverage and actual condition | What it establishes / limit |
|---|---|---|
| 51 base clips | 17 IDs × ranks 1/3/5; supplied lab rank/crowd, invulnerable hero, no XP | Reproducible current physical action at different actual ranks; not earned acquisition or human enjoyment |
| 18 evolution clips | Supplied evolution and real live seeded crowd | Actual effects at targets. Six supplemental cases show actual capped healing, blocked spit, wet-chain arcs, near-car blasts, real Nazar-dodge zap and joining fire pools. Stormshield does not proc from Dash |
| 30 world clips | Supplied starting position at first required action; no ambient horde/player weapons; actual target policy; L1 supplied lethal hit | The current action/anchor/consequence in view. Does not replace an ordinary all-30 journey or cover every substep/choice branch |
| 10 boss clips | Real arena helper/trigger, supplied invulnerability/no attacks/no ambient horde | Motion, first preparation and attack identity. Earned time/policy tables separately retain wins and losses |
| Hero/role clips | Eight real keyboard directions/settlement; one supplied live enemy at a time | Eight-direction gait, then actual Dash/reversal/hit/defeat and a legal six-weapon crowded loadout at default/minimum quality. `kasap` and `zehirli` are extra known-role fixtures, not natural first-30 spawns |
| Opening/first control | Fresh browser save, current original cold-open timeline, first real movement | No supplied power; does not establish a physical thumb or unfamiliar-player reaction |
| Conflict clips | L3/light and L27/dark, critical HP + positive heal + frenzy + threat ring + object + queued dialogue, min quality, max text, both sides/reduced variants | Priority/layout fixture; combined flash-budget correctness also has focused tests. Actual phone exposure/comfort remains pending |
| Major-story accessibility/failure MP4 | All three major aftermaths in TR and EN, text150, mute, reduced motion/flash, minimum quality; real blocked current-art requests → explicit neutral reading or Retry | Supplied boss defeat through real damage/trigger, protected reading and actual restored input. Not earned power/play or physical-device evidence |
| Earned L20/25/30 MP4 | Actual first-clear simulations from independently earned broad-campaign saves; ordinary loadout/cards, automated navigation; no granted rank or invulnerability | Real boss→aftermath→native comic→continued exit→result. Exact first-clear outcome, music tracks and settlement snapshot are in the earned index |

WebM recordings use `game.captureStream` plus the real post-master audio. They show the world canvas; DOM HUD/comics are represented by accompanying full-viewport PNGs. Earned MP4s record the entire viewport at original CDP frame timestamps plus actual post-master audio. Capture startup can differ by under 250 ms; it is not sample-accurate synchronization. No slow-motion footage is presented as normal speed.

## Progression and lifecycle checks

[Browser check outcomes](telemetry/experiential/browser-checks.json) · [earned ready-rank save](telemetry/experiential/earned-upgrade-save.json).

- [Earned readiness](media/R1/experiential/upgrade-ready-en.png), [applied rank](media/R1/experiential/upgrade-applied-en.png), [perk context](media/R1/experiential/perk-context-en.png), [Turkish maximum-text view](media/R1/experiential/upgrade-ready-tr.png), [pause scope](media/R1/experiential/pause-scope-en.png), [explicit scene resume](media/R1/experiential/scene-resume-en.png).
- The final fixture replays real L1→L2 progression from reset, withholds rank allocation/perk purchases, and stops when actual earned readiness and SC are present. It grants neither resource; the raw result, including any defeat, is retained. The final browser outcomes record Strength 0→1 and earned SC 1→0 for `str.1`. No resource was supplied. The defeat capture also retains the explicit free playtest-revive description and the ordinary free end/retry option; no real ad/payment flow exists to dismiss or callback.
- [Current comic failure notice](media/R1/experiential/comic-current-art-failure.png), [neutral readable composition](media/R1/experiential/comic-current-art-neutral-reading.png) and [recovered current illustrations](media/R1/experiential/comic-current-art-recovered.png) were visually inspected. Native TR/EN speaker/reading order remains current; no retired portrait was used.
- A deliberately blocked current enemy atlas request recovered after the bounded retry. This was a transient failure fixture, not proof every permanent asset outage looks artistically acceptable.
- Protected background snapshot includes simulation/run clocks, HP, cooldowns, skill state, task and pending rewards. They remain unchanged while suspended; held keys are discarded. The final scene regression also holds gameplay after world acting ends until native reading completes.
- Actual page reload during protected L25 native reading returns to the existing title/map boundary with pre-clear permanent state, no invented win and no seen mark for the incomplete scene. This is permanent-state recovery, not a new mid-simulation resume system. [Before](media/R1/experiential/scene-reload-before.png) / [after](media/R1/experiential/scene-reload-after.png).
- Rapid boss→comic→run requests left at most one audible music track. Mute/unmute was checked. Runtime track count and a recording are not artistic listening approval.

## Quantitative diagnostics

[Campaign summary](telemetry/experiential/campaign-summary.json) · [all-30 pacing](EXPERIENTIAL-PACING-2026-11-18.md) · [evolution investment and offers](telemetry/experiential/evolution-investment.json).

| Profile | Attempts / clears / deaths / timeouts | Baseline |
|---|---|---|
| Broad | 33 / 30 / 3 / 0 | Own earned rewards, unfocused cards |
| Melee | 37 / 30 / 7 / 0 | Own earned rewards; knife intent |
| Ranged | 35 / 30 / 4 / 1 | Own earned rewards; nailgun intent; one pre-boss shelter navigation timeout |
| Terrain/control | 31 / 30 / 1 / 0 | Own earned rewards; canister intent |

No ordinary revive or scripted first-run Second Wind was used. The latter remains a distinct available rule, not silently counted as a no-revive win. No ads, paid currency or supplied max gear. Purchases use eligible earned resources. The four-seed expected-power sweep is separately labelled supplied expected power: 109 wins, 11 losses, zero timeouts. Sixty boss comparisons use saved earned loadouts, seed 3; 30/30 evasive wins and 28/30 punish wins. These are diagnostic policies, not a human win-rate forecast.

Every evolution acquisition records rank/card/partner opportunities, first effect/hit, targets, damage/control and remaining play time. Eighteen real weapon/zone fixtures hit live high-HP targets. Recipe/terrain-specific cases retain their focused tests. Zero-hit or near-exit evolutions remain visible in the data.

## Desktop performance diagnostic

[Final measured records](telemetry/experiential/desktop-benchmark.json): three separate 60-second samples, current raster art, desktop Chrome 390×844 DPR1. Opening/boss/crowd frame median and p95 are 16.7 ms. Main-work p95 is 2.7 / 2.8 / 11.2 ms; the crowd reaches the actual 200-enemy cap. Reported JS heap peaks are 77.2 / 51.7 / 73.9 MB; estimated graphics peaks are 28.0 / 40.1 / 49.6 MB. Graphics values are estimates, not measured total process/GPU memory. No browser exceptions were recorded. These short desktop samples establish neither sustained phone performance nor thermal stability.

## Test records and corrections

[Full suite](telemetry/experiential/full-suite.log) · [earlier integrated green](telemetry/experiential/full-suite-before-final-framing.log) · [initial integrated failures](telemetry/experiential/full-suite-first-integrated.log).

The final integrated run passed **49 test groups, zero failures**. The focused scene/feedback regression was also rerun after the final verification additions. Runtime and local-source checksum checks passed; `git diff --check` is clean.

The first integrated pass found an actual captain walk missing-options error through browser playback, a resume font that ignored largest text, stale retired-art/phone assumptions in fixtures, a hard-coded old visibility-handler pattern and a world-art browser race. The captain error and font were fixed; tests now exercise the real captain view, active-call prerequisite, neutral current-source recovery and art readiness. Tests beyond L30 use direct data/static coverage rather than opening gated player production. Browser resource/startup and capture-harness failures were kept separate from gameplay failures.

One earlier capture batch stalled under memory pressure. Its completed recordings were recovered, the two recording trees were stopped, and the final batch was serialized with fresh browser profiles per weapon/evolution. The helper now bounds Chrome requests and retries its startup endpoint. The actor harness's repeated global `const` and the supplied boss fixture's missing name were corrected. These are verification-tool fixes; no player mechanic was changed to make a recording pass.

## What remains open

**Known unresolved functional defects:** none found in completed checks; this is not a guarantee of absence. **Artistic/experience judgments:** joint crop seams and weight, low-rank hand→tool→target readability and dense six-weapon occlusion near the lane edge, role recognition on mute, very short early bosses, repeated work/hold verbs, late evolution payoff, reused civilian variety and phone audio fatigue. These are independent audit targets, not silently accepted tradeoffs. **Unavailable evidence:** named physical iPhone sustained/touch/audio checks and unfamiliar-player comprehension/voluntary return. **Retained design deviation:** protected L2 tram payoff after live approach/calling. No expansion approval follows from a green suite.

## Exact remaining physical-device checklist

No physical device evidence was established. The local CoreDevice discovery command timed out during service initialization; it did not prove that no phone was connected. [Discovery log](telemetry/experiential/device-discovery.log). Use the exact hashed local build and a named supported iPhone, then another target class if available. Record model, OS/browser, viewport, settings, power/thermal state and save origin.

1. Play roughly 20 minutes continuously: opening, peak crowd, multiweapon loadout, boss, major scene and district transition. Record first/last median and p95/p99 frame time, long-frame clusters, input response and observable heat/memory symptoms. Keep the low-tier 30 fps objective. Do not substitute a desktop average.
2. Test real left/right thumb play, notch/home-indicator safe areas and largest text. Verify actionable buttons are reachable and the hero/escape floor remains visible.
3. Mute; then reduced motion/flash and minimum quality. Identify hit/heal/block/critical/frenzy/boss commitment and mechanism consequence from shape/body/world action.
4. Background/lock in entry, halfway through each major scene, at a card/chest and in ordinary combat. Resume explicitly; verify no damage/time loss behind a protected scene, stale Dash, duplicate reward or skipped task. Relaunch follows current supported run recovery.
5. Phone speaker and headphones at modest volume: knife, chain, saw, electricity, wood/metal/glass, heal/shield, machine/boss warnings; repeat rapidly for fatigue/masking. Audition L20/L25/L30 fight→quiet→native story→next intention. Confirm silent/audio unlock behavior and no stacked songs.

## Exact remaining uncoached-player checklist

Recruit 5–8 consenting people unfamiliar with implementation. Do not coach controls, build rules or story. Use no unnecessary personal identifiers. At least one person needs genuine first-30 progression for holistic pacing; mark earned-save jumps accurately for late-story sessions.

- After food/station/damage: ask what changed and how they noticed.
- After first boss/death: ask the safe close-in moment and one concrete different response next try.
- After prop choice: ask why they used/placed it and what it changed.
- On mute: distinguish personal critical state, frenzy empowerment and enemy/boss danger.
- From a real ready-rank/eligible-perk save: find/apply the rank, explain its practice source/benefit, then distinguish SC/prerequisite from run ranks, starter and mastery.
- After L20/L25/L30: explain who Kaan/Captain are, where the family is, why home matters and why the Bazaar is the next walking route. Test neutral/current-help/stored-help facts without priming.
- At a natural stop: ask what they would try next and where they felt waiting/repetition; observe voluntary continuation and later return only with consent.

About four of five correct explanations is an initial repair trigger, not a universal quality/retention certification. Every repeated misunderstanding, inaccessible action or unfair-looking death needs investigation before expansion.
