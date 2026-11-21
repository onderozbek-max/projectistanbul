# First 30 levels acceptance and implementation handback

Read with the [production brief](PRD-FIRST30-EXPERIENCE-RESET-2026-11-19.md), [combat specification](PRD-FIRST30-COMBAT-CRAFT-2026-11-19.md) and [journey direction](PRD-FIRST30-JOURNEY-DIRECTION-2026-11-19.md). These rules govern completion of the whole packet. They are deliberately stricter than a feature-presence audit.

## 1. Separate evidence from verdict

Every claim names its basis: owner-reported play, independent interactive observation, implementation recording reviewed continuously, sampled frames, source inspection, simulation, automated assertion or proposed design. Do not label a recorded bot run as a human playtest, a desktop portrait viewport as an iPhone, a low-rate capture as fluid animation evidence or an audio file's existence as listening.

The current owner report is negative acceptance evidence. Do not dismiss it because a ring, death timer or animation helper exists. After implementing, show what changed in the specific experience. The reviewer must also withhold positive craft judgments when the available observation method cannot support them.

No audit can guarantee it found every issue or that the result will be a masterpiece. The useful commitment is exhaustive named scope, adversarial failure cases, explicit uncertainty and no claim stronger than evidence. The phrase “substantial gameplay improvement” requires observed, plainly visible changes in actual action, not an aggregate of code changes or unrelated comic improvements.

## 2. Coverage ledger with no sample-to-roster shortcut

Create a single indexed ledger at `reviews/FIRST30-EXPERIENCE-RESET-IMPLEMENTATION-2026-11-19.md`, with appendices if needed to keep files within project limits. Each row: requirement ID/name, source change, player-visible before/after, test/evidence link, implemented status, technical status, presentation-review status, player-validation status, remaining defect/blocker. Use actual timestamps/conditions for media. Never insert a generic green checkbox for unobserved rows.

Required inventory:

- Ten individually named bosses: L1 Cook, L2 Switchkeeper, L3 Roaster, L4 Linekeeper, L5 Vatman, L10 Keeper, L15 Bride, L20 Fisher, L25 Captain, L30 Ticket Man.
- Seventeen base weapons at ranks1/3/5 and eighteen individual evolutions, including conditional alternatives. A family row does not close all variants.
- Thirty individual levels and their transitions, plus comparison of adjacent levels and six district arcs.
- Fourteen natural enemy roles; first introductions and dense recognition. Label noncampaign fixtures separately.
- All interaction categories and their available/using/interrupted/empty/full-health states.
- S01–S09 scene requirements; S02 expands to every boss entry/defeat, not one generic scene row.
- F01–F03 feedback/mood/audio; G01–G03 progression and payoff; every P10-01–07 finding and subdefect.
- TR/EN and largest text, default/reduced presentation, touch/left-handed, pause/return/replay/save, missing-art recovery and performance.

## 3. Predeclared balance and earned-run cases

Before tuning, save the baseline source identity and a short case manifest. Use existing tools and telemetry rather than building a new analytics platform. Predeclare seeds/build policies to prevent selecting only impressive outcomes.

1. Use three predeclared ordinary full-campaign seeds per approach across four plausible earned-run approaches: close-investment, ranged-investment, broad/mixed and defensive/control (twelve earned headless journeys, with retries retained). Existing policy names may differ; document actual card choices and behavior. Do not force offers or discard failures to obtain a desired evolution. Do not call a policy “varied” if it chooses Cleaver every time. Retain all first attempts, losses, retries, assistance and revives. These automated journeys supplement, not replace, the rendered journey and actual player review.
2. For each boss, distinguish weak/injured **earned entry**, typical invested **earned entry**, and strong legal/rematch entry. Save actual entry HP, progression, weapons/ranks/mods/passives and route history. Reuse reachable earned snapshots for targeted checks; label that reuse. Synthetic supplied-health/build controls are supplemental, never substitutes for the earned route.
3. Across the predeclared cases record signature/action families, actual exposure/counter events, damage sources, escape access, time to kill and reason for death. A long battle with no meaningful choice fails just as a trivial first encounter can. No universal minimum lifetime is imposed.
4. Record evolution investment/recipe opportunity/offer/acquisition, first meaningful use, actual damage/kills/control contribution and remaining encounter. Identify whether the distinct evolved behavior was usable, not just whether a hit occurred. Keep late, obscured, missed and behaviorally unused outcomes in the denominator as failed payoff cases. Run targeted earned searches for all18 to diagnose conditional feasibility, but do not present those selected successes as natural frequency.
5. Review level entry/approach attrition separately. Do not weaken a boss solely because the preceding route delivered the player at low HP. Check collision/hazard combinations and resource timing first.

These numerical checks establish viability and uncover outliers. They do not establish novice fairness, perceived variety or retention. Don't tune exclusively to bots or invalidate valuable failures by silently changing the policy mid-comparison. Rebaseline changed sim traces only with a documented intended change, not to make tests green.

## 4. Rendered experience and artistic inspection

Produce one actual rendered fresh earned L1–30 journey on the final candidate, retaining failures/retries and ordinary reward choices. Record assists and automated inputs honestly. Show full transitions, not only winning central fights. Use isolated fixtures to cover variants not naturally encountered, with those conditions labelled.

Record normal-speed native-frame output where the environment supports it; include capture rate and actual frame-time measurements. A 10Hz capture/contact sheet cannot certify 60fps motion. Do not interpolate sparse frames to manufacture apparent fluidity. Compare a few representative before/after sequences under matched conditions and show separate ordinary earned runs after balance changes make identical traces inappropriate.

Per boss, inspect the entire entrance → movement → each attack → recovery → killing blow → aftermath/reward. Per weapon, inspect continuous movement and contact cases from the combat appendix. Per scene, inspect action/reaction order and handback. If the reviewing tool cannot watch continuous video or listen, explicitly mark the relevant artistic judgment unverified, provide accessible media and use only the evidence it can actually inspect. Do not issue a definitive fluidity/audio verdict from frames or source.

Include these deliberate failure probes:

| Case | Failure that must not survive |
|---|---|
| Boss hidden title/HP diagnostic at actual portrait scale | Character blends into arena or weapon source cannot be identified |
| Boss turn/start/stop/target-behind/wall | Foot skating, mirror snap, body-size jump, detached grip, teleporting tool |
| Death during each attack phase | Idle-pose reset, duplicate tool, ghost damage, canceled scene, reward masking impact |
| Knife/Cleaver while running/reversing/Dashing | Invisible orbit damage, blade disconnected from body, rear damage without corresponding action |
| Chain/Saw under target loss and multi-hit | Unattached loops, vibration replacing resistance, impact on a miss |
| Geometry-changing mod/signature/conditional attack | Default-branch footage falsely closes a different advanced behavior; detached extra heads or invisible rear hits |
| Critical HP + frenzy + boss + six legal weapons + prop | Lost hero, hidden harmful boundary, indistinguishable health/mood states |
| High-rate impacts + damage/frenzy/evolution emphasis | Stacked hit-stop/slow-motion creates sustained stutter, swallowed steering or an unexpectedly unsafe return to real time |
| Muted/reduced-flash, HUD concealed for review | Actual damage/heal/block/critical state cannot be distinguished |
| Healing and damage on same update; full-health food | False recovery, consumed zero-benefit item, unintelligible saved food |
| Evolved reward + chest + story + exit | Competing foregrounds, disappearing reveal, lost/duplicate reward, unsafe resume |
| First actual attribute ready/first eligible perk | Buried action, wrong destination/cost/prerequisite, misleading persistence |
| Defeat → give up → map → next run | False cleared message, hidden active UI/AX, forced zero-point allocation, stale prompt |
| New offer after long inspection scroll | Clipped heading, stale focus, accidental selection from previous screen input |
| Scene skip/background/reload/replay | Teleport, missing companion, unprotected damage, lost camera/input, duplicate settlement |
| Missing current artwork / low-size viewport | Black world, crash, retired illustration in ordinary play, unreadable recovery |
| Repeated hurt/weapon/reading audio | Harsh repetition, runaway loops, stacked music, conversion cue used as an annoying injury sound |

Fix the retained Molotov-rank3 black-world interval or establish its exact capture cause with a clean reproduction of the same conditions. Preserve the failed evidence and classification. Don't quietly remove the file and call the weapon accepted.

## 5. Technical and mobile checks

Run focused suites for touched behavior during work and the complete `prototype/tools/run-tests.sh` on the final integrated source. Start the long full suite in the background while doing independent review work; don't run it against a moving source tree. A read-only verification snapshot is acceptable. Record invocation, source identity, initial failures, retries, final counts and exit status.

Useful new tests cover actual regressions: death snapshot continuity/canceled damage, attack geometry/contact agreement, reward ownership, contextual rank invitation, hidden UI removal, scroll/focus lifecycle, conditional help and scene interruption. Avoid tests that merely assert a new profile name, frame count, duration constant or localization key exists. Preserve simulation independence from visual settings and meaningful golden-trace checks.

Test the smallest supported portrait viewport, normal/large text in both languages, safe areas, touch target sizes, left-handed control, finger occlusion, joystick acquisition/release, accidental Dash, pause/resume and scene handback. Run dense/boss performance and compare to the actual baseline. Reduce cosmetic cost before dangerous information. Existing documented reference-device budgets govern; desktop frame rates do not close device budgets.

Physical named iPhone acceptance includes sustained sessions, heat/frame pacing, audio focus/silent-switch behavior, interruption and one-thumb comfort. If unavailable overnight, mark it pending and give the owner one working local URL plus exact short steps. Do not stop unblocked production work because this external gate is unavailable.

## 6. Later player validation without coaching

The owner can immediately reject a conspicuous defect; no study is needed before fixing it. For broader validation use the existing unfamiliar-player plan, with neutral tasks and retained stops/failures. A small group is diagnostic, not a population retention estimate.

Observe whether players can locate the boss, respond to a tell, notice injury on mute, name why they died, discover an available rank, explain what a perk changes, and identify how two adjacent levels differ. Ask what they noticed before explaining the design. Do not point to the upgrade button, tell them the boss strategy or ask whether the new animation is “much better.”

For narrative, ask what changed between Arda and Kaan and what they plan next. For replay, observe voluntary desire to try another approach and actual return later; do not equate survey politeness or enforced completion with engagement. Hades parity and lasting return motivation cannot be certified overnight by the implementation agent.

## 7. Autonomous completion rules

Work through the whole packet without routine owner check-ins. Internal milestones are not permission gates or handback endpoints. Do not stop after the first visible success, a passing targeted suite or a folder of generated assets. Do not spend hours repeating an unchanged test suite to substitute for unresolved craft work.

When an implementation satisfies technical checks but still looks wrong under available inspection, revise it. When current art cannot represent a required movement, repair the asset/pose plan rather than add another glow. When a proposed mechanic conflicts with real geometry, resolve simulation and presentation together. When two requirements conflict, prefer readable truthful gameplay, preserve established story and record the concrete choice.

If an external blocker truly prevents a remaining task, state exactly which rows are blocked and why, finish everything else and provide the usable partial candidate honestly. Do not silently reduce scope, fabricate evidence, request paid/new services without approval or label the whole packet complete while major rows remain open.

## 8. Required handback

Provide a short owner-facing summary followed by linked evidence:

1. Working local build URL and exact source identity; protect the owner's existing save and other chat's work.
2. Five to eight plainly observable changes with where to see them; do not claim all ten bosses improved if any remain untouched or unreviewed.
3. Complete coverage ledger and exact unresolved rows, with implementation/technical/presentation/player status separated.
4. Indexed continuous captures of all bosses, weapon variants, major scenes and earned journey; concise matched before/after examples. Include source/seed/build/HP/capture metadata.
5. Full-suite result and meaningful new regression checks; earned balance/evolution summary with original failures retained.
6. Exact balance/design deviations, any necessary asset limits and preserved narrative decisions.
7. A short physical-phone/listening acceptance script for checks not performed. No claim of masterpiece, launch readiness or expansion approval.

The review should be able to answer **what is visibly better, across which exact content, under what actual conditions, and what still fails** without rereading implementation code or trusting a positive summary.
