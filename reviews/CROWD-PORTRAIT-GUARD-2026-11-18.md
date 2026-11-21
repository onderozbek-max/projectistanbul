# Adjacent crowd variety and portrait identity guard · 2026-11-18

Owner follow-up: identical civilians could flee side by side; the bearded stranger appeared again in the signal-booster call panel. This fixes the shared selection paths, rather than another single panel or level exception. No new art, simulation, native voice, story branch, mechanic, dependency/service or publication change.

## Crowd selection

The earlier direct `variant % 6` mapping allowed identical illustrations within one fleeing group. `CivilianActing.prepare` now assigns each person a stable view-only appearance while considering nearby runners and their projected approaches. First-choice variation still comes from the existing seeded variant. Reuse favors the most separated runners rather than adjacent copies. The renderer prepares the entire active cohort before drawing; individual sprites read that cached choice.

Choices are cached by actor object in a WeakMap, so a person does not change clothes when a neighbor exits, and old runs do not retain actors. Sim positions, movement, collision, group size and RNG calls remain untouched. Presentation forecast values are in `config-experience.js`: eight-second horizon, 0.5-second samples, existing 6.6 m lane edge. These are appearance-selection estimates, not new physical movement rules.

Regression: actual seeded L1 groups from **200 seeds**, observed over **16,000 snapshots** with **93,091 near-neighbor observations** (within 2.7 m horizontally and 1.7 m vertically). Zero matching appearances in those observations; each actor retained its initial appearance. Preparing the cohort left the sim actor data unchanged. This is coverage of current opening behavior, not a mathematical guarantee for an arbitrary future crowd with more tightly packed people than available designs.

[Normal opening crowd](media/R1/crowd-portrait-guard-2026-11-18/mixed-neighbor-crowd-active.png) · [normal-speed clip](media/R1/crowd-portrait-guard-2026-11-18/mixed-neighbor-crowd.mp4).

## Booster and future portrait safety

The interruption panel hardcoded `who: 'mom'`, but the illustrated cast uses `anne`. `ComicRaster` silently rendered the stranger for any unrecognized portrait identity. That is why the same man could recur despite fixing the earlier opening panel.

The live panel now uses canonical `anne`. The central portrait resolver accepts the existing Mom alias as Anne and retains the explicit `friend → stranger` alias for the actual anonymous character. **Unknown identities no longer fall back to the stranger.** They leave a neutral/text composition; missing actor art cannot silently impersonate Arda, Mom or another named person. Removed the additional unknown-speaker → stranger default from popup rendering, and made page-art readiness tolerate neutral unknown-identity composition.

This guard is shared by comic pages, popups, live calls and contact portraits across levels. Explicit legitimate stranger roles remain, including the Galata introduction. No dialogue was rewritten, and the stranger was not retconned into a named character.

All **407 current Arda dialogue bindings** resolve to Arda. Regression checks also exercise actual portrait source crops: Mom alias equals Anne; every current Arda mood differs from the stranger; unknown/null identities draw no wrong person; an unknown identity does not block readable page composition. Actual ordinary L1 booster playback observes Mom during interference and retains Arda/Mom for the conversation, with no stranger draw.

[Interrupted-call portrait](media/R1/crowd-portrait-guard-2026-11-18/signal-booster-interrupted-call.png) · [resumed call](media/R1/crowd-portrait-guard-2026-11-18/signal-booster-call-resumed.png) · [normal-speed booster sequence](media/R1/crowd-portrait-guard-2026-11-18/signal-booster-correct-portraits.mp4).

## Verification and provenance

[Current build/source manifest](telemetry/crowd-portrait-guard-2026-11-18/build.json) · [recording index](media/R1/crowd-portrait-guard-2026-11-18/index.json) · [focused checks](telemetry/crowd-portrait-guard-2026-11-18/focused.log) · [capture log](telemetry/crowd-portrait-guard-2026-11-18/capture.log).

Focused `experience`, `scene-art`, `quality`, `barks-delivery`, `dialogue` and raster/browser checks pass (six test groups). The previous full 49-group suite remains evidence of the preceding character pass; it is not relabelled as a full run of this follow-up. This change is verified by focused regressions plus the actual browser render/call sequence. Current source and artifact hashes identify the follow-up separately.

Recordings are desktop Chrome 390×844 DPR1, seed42, TR, real presentation speed and post-master audio. Fresh ordinary L1 with automated movement/card choices; no granted HP/ranks, supplied people or simulation time scaling. The recorder holds still upon reaching the actual booster ring. The cohort observer reads selected styles without assigning them. Phone/player acceptance is not inferred from these observations.

The first recorder attempt cleared its observation log after the static portrait was already cached and therefore missed that one draw. Its failed assertion is retained as a verification-tool issue; the corrected recorder keeps the full actual draw history. No game behavior was altered to satisfy it. No commit, push or merge.
