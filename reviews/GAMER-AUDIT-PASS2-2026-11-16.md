# NO SIGNAL: İSTANBUL — second gamer audit

**16 November 2026 · Reassessment after implementation · Recommendations, not gameplay changes**

## Verdict

**A stronger prototype, but not yet evidence of a masterpiece, Hades parity, or superior replay appeal to Survivor.io.** The implementation addresses real problems from the first audit. The next challenge is sustaining the improvement after onboarding and across repeat play. A feature being present is not the same as that feature producing a memorable player experience.

The direction worth protecting is an authored journey through Istanbul with improvised weapons, physical counterplay and relationships that affect action. The danger is a more polished version of a routine: head north, assemble a broad build, work a control, survive a crowd, reset. Different props and bigger numbers cannot by themselves prevent that routine.

“Never bored” is not a useful acceptance test. No game can guarantee it. Aim for voluntary return because the player has a new plan, wants to master a readable challenge, or cares about a character. Give pressure a release: a quiet aftermath or a brief safe reward makes the next threat stronger. Continuous clutter, spawn pressure or interruptions would undermine the goal.

## Evidence and limits

This pass independently reread the implementation record and current source, repeated the first audit's 240-run Normal sweep and 59-run progression probe, and performed targeted live-browser samples at L3, L14, L19, L28 and L30 plus the mixed-weapon hammer lab. Browser samples were short; **this is not a second complete manual campaign clear**. Late entries retained the earlier L1-earned save and had tool delays. Their health losses are excluded from balance conclusions. The browser and simulations ran against the existing dirty working tree, not a frozen release.

The benchmark is an evaluative target, not a newly played side-by-side comparison. No recruited-player retention study, real iPhone input/thermal test, audible mix review, or normal-speed captured animation comparison was completed. Static frames cannot establish Hades-quality animation. This report therefore does not certify any of those qualities.

The first audit's full coverage table remains useful context; this report concentrates on what changed and what the change did not yet solve. Evidence is in [the pass-two telemetry folder](telemetry/gamer-pass2/README.md) and [the screenshot folder](media/R1/gamer-pass2/).

## What improved and what remains open

| First-audit concern | Current evidence | Reassessment |
|---|---|---|
| Large portraits over combat | Live samples show compact barks; L28 uses a small caption; L30 opening no longer has the large Mom call | Substantial improvement. Celebration overlap still reproduced; see P2-01. |
| Stale navigation instructions | `RunGuide` explicitly checks destination, mode, hold and terminal state; L28 sample no longer showed the old hold command | Improved. Full L1 doorway-to-victory acceptance was reported by implementation, not re-completed manually here. |
| Builds miss their payoff | Guided recipe slot through L4; behavior descriptions on new weapons; additional progression telemetry | Early payoff improved in independent probes. Support stops abruptly after L4; see P2-03. |
| L13–14 attrition | Bloater warnings and 0.7-second direct-hit spacing implemented | Better information is valuable, but this does not establish fair human challenge. Keep active-skill and no-revive comparisons. |
| Weapon acting | Knife/hammer/throw footwork added; mixed hammer lab renders the current effects and body | Better foundation. Actual phone motion, contact attribution and responsiveness remain unproven. |
| Kaan has no combat presence | A real simulated stun/shove assist and three illustrated poses now exist | Previous “dialogue only” finding is superseded. One brief automatic assist is still a limited relationship mechanic. |
| Districts feel interchangeable | Rails clear crowds, carts counter bosses, hook misses open punishment, spice lanes and signal timing implemented | Meaningful mechanical progress. Verify that players perceive and exploit these consequences; do not equate unique source modules with unique experiences. |
| Story interrupts action | Essential plot prioritized, L30 call moved after fighting, Captain aftermath retained | Better staging policy. Broader acting, retry treatment and emotional recall still need observation. |
| Results lack a next goal | District achievement/new recipe now leads when available | Good direction. Does a player choose that experiment on a voluntary replay? Still unanswered. |
| Test/device quality | Implementation reports local browser reruns and reconciled trace references | Evidence improves engineering confidence, not retention or phone feel. Current audit run status is recorded below. |

## P2-01 · P0 bug · Celebration still covers dialogue

**Direct reproduction:** L14, seed 42, Normal direct entry. During the opening crowd, the large black/yellow “DEVAM!” celebration covers the white bark. L28 also shows a large celebration across the forward combat view. The first-audit fix reduced portrait size but did not eliminate all competing overlay composition.

[Captured L14 overlap](media/R1/gamer-pass2/l14.jpg) · [L28 celebration](media/R1/gamer-pass2/l28.jpg).

**Player impact:** A congratulatory effect makes useful speech unreadable and takes attention away from enemies. This is a polish blocker with a concrete reproduction, not a demand to rewrite the UI.

**Implementation task:** Trace the actual streak renderer and its bounds against `view/speech.js`; ensure the same rectangle used for arbitration includes the painted background, entrance scale and animation overshoot. If no safe slot exists, delay or reduce the celebration. Do not reserve an arbitrary small text rectangle while drawing a much larger plate. This is a proposed diagnosis to verify, not an established root cause.

**Acceptance:** Reproduce streak + tactical bark + required marker together in L14 and L28. No overlap throughout the entrance, hold and exit frames at supported phone layouts/text sizes, including reduced motion. Verify the real renderer rather than only a synthetic arbiter candidate.

## P2-02 · P1 runtime issue · Recipe chip exposes a localization key

**Observed:** The L30 card screen displayed `card.needRank + İş Eldiveni`; the longer passive requirement was truncated. The new behavior descriptions are useful, but the exact prerequisite is the part that must be dependable.

[Captured card screen](media/R1/gamer-pass2/l30.jpg).

**Important qualification:** The current source already defines `card.needRank` in both languages in `js/strings-cards.js`. Therefore this is a **browser/runtime mismatch to reproduce**, not evidence that the implementation forgot to add the key. The local preview used Python's ordinary HTTP server, which permits caching. Cache consistency, script load/registration and resource failures must be distinguished before changing translations. Do not add a duplicate key as a speculative fix.

**Implementation task:** Compare an existing-save cached launch and a clean no-cache launch of the exact same source. Inspect loaded script versions and errors. Add a real displayed-card check for unresolved keys and complete prerequisite accessibility. Preserve the independently authored TR/EN text.

**Acceptance:** Both launches render a localized rank requirement; no `card.*` token reaches the player. The player can see the entire missing requirement without guessing from an ellipsis, with accessible details if the compact chip cannot fit it.

## P2-03 · P1 design · Carry build agency beyond the tutorial

Independent seed-42 repeated probes show that recipe guidance works early. The weapon-first fresh campaign now evolved in L2 and L3; the prior version evolved in none of its 30 runs. The focused knife/gloves policy evolved in L2, L3, L4, L20 and L25; previously only L20 and L25. Its early evolutions left approximately 102, 128 and 75 seconds of play, respectively. This is a real improvement in usable payoff.

But the guided slot is explicitly limited to L1–4. The fresh campaign had no further evolutions after L3, and the focused policy had none from L5–19 or L26–30. These policies do not strategically reroll and are not human evolution-rate estimates. They nevertheless expose a discontinuity: the onboarding teaches a dependable recipe path, then removes that support while the catalogue gets wider.

**Do not simply enable the same forced recipe everywhere.** The implementation already found its L5 focused policy performed worse with guidance enabled. Extra guidance can displace a tactically useful offer. The objective is deliberate tradeoffs, not a mandatory evolution checklist.

**Proposed task:** Compare three choices of run intent using existing weapons—close-range cleave, ranged pressure, and area control—through L3, L5, L10, L15, L20, L25 and L30. Log offered/chosen upgrades, missed prerequisites, rerolls, fork/evolution time and useful encounters remaining. Prototype a player-visible way to pursue an invested build after onboarding while retaining defensive choices and alternate branches. No extra currency or new weapon is necessary.

**Acceptance:** A player can intentionally build at least two different viable answers to the same encounter, explain why each works, and feel a behavioral payoff before the run ends. Measure whether their movement, target priorities and resource decisions differ. “Both builds cleared” alone is insufficient. Preserve the option to win without evolving.

## P2-04 · P1 replay design · Hard mode loses authored route identity

The current simulator selects `routeTrial` only when `runMode === 'normal'`. That means the new authored mechanics are not automatically the Nightmare versions of the same routes. Several new boss behaviors and Kaan's support depend on `routeTrial` too. This deserves priority because the owner specifically wants repeated play to remain interesting.

Nightmare and Night Shift already exist; do not propose building duplicate replay systems. The documented Nightmare promise is the same route, harder, with district signatures. Inspect the actual route/mode difference rather than treating extra enemy health or a longer hold as equivalent to the authored encounter.

**Proposed task:** Inventory Normal → Nightmare behavior for all six district finales and L19/L29. Decide explicitly which authored mechanics should persist and which remix should change a tactical decision. Preserve readable rules: variation should change the problem, not randomly invalidate learned telegraphs. Night Shift can remain a distinct remix format if its differences are clearly communicated.

**Acceptance:** After learning a district in Normal, a player recognizes its signature interaction in Nightmare and must make at least one changed tactical decision. The difficulty increase cannot be explained only by more health, damage or time. Run deterministic checks for both modes; any intentional departure from the documented route is a proposed decision for the owner.

## P2-05 · P1 relationship design · Kaan is an intervention, not yet a partner

`sim/kaan-support.js` now performs real combat work: it selects nearby non-boss enemies, stuns and shoves up to four, and emits an event. It triggers once on qualifying L21–29 objective commitment and in L30 phase 2. The configured visible duration is 1.05 seconds. Once `s.kaanSupport` exists, the function never starts another assist that run. This is substantially better than a portrait plus percentage bonus, but easy to experience as a brief effect rather than companionship.

The PRD's playable/tag-switch intent remains unresolved; the implementation correctly records that limitation. Do not describe this as completed tag-switch gameplay. Also avoid immediately expanding to a large squad system.

**Proposed task:** First verify that players notice the current assist, attribute it to Kaan, and understand its benefit. Then make one repeatable, readable cooperative opportunity using the existing protective role, or make the one authored assist a much more consequential shared action. Tie L25's emotional aftermath to something the player has actually done with him. Confirm the accepted L30 playable/switch scope before implementation.

**Acceptance:** Without prompting, players can say what Kaan did, what opportunity it created, and why playing alongside him differs from being alone. If they only remember a portrait or buff, the relationship gameplay has not met its purpose.

## P2-06 · P1 quality gate · Prove feel through mastery, not screenshots

The new district counterplay is the right kind of improvement: avoid the tram then punish; use traffic against the Bride; dodge a hook; exploit the cleared spice lane; read the rail sequence. The remaining question is whether those causal chains read during normal play and give the player satisfying control.

**Proposed task:** Record actual supported-iPhone play of L5, L15, L20, L25 and L30, including a first attempt and a learned retry. For three signature attacks, capture anticipation, contact/release, enemy reaction and recovery at normal speed with a mixed build. Keep current artwork throughout and follow the district art review, including incidental objective props and failed-load behavior. The implementation record still lists restaurant furnishings and bespoke crane/awning illustrations as unfinished; do not mark all district art complete.

**Acceptance:** Players can identify what exposed the boss and intentionally repeat it; the second attempt demonstrates a learned decision. Attack identity and incoming threat remain readable simultaneously. Test thumb reach, responsiveness, sound-on/muted, reduced motion, and sustained frame-time targets on a named device. A successful render or damage event does not establish satisfying motion.

## Recommended next sequence

1. Fix P2-01 and resolve P2-02's clean-versus-cached runtime discrepancy.
2. Test P2-03's post-onboarding build agency and P2-04's actual repeat-play behavior. These are the strongest candidates for preventing routine.
3. Run a short real-player learning test on two district finales before making more mechanics. Preserve the new counterplay if it is understood; improve its communication if it is missed.
4. Complete the agreed Kaan/finale scope and validate emotional recall alongside his gameplay contribution.
5. Broaden the polish pass only after the same experience works on the target phone.

For replay evaluation, let players stop. Ask afterward what they wanted to try next, then observe whether they voluntarily return and choose a different plan. Separate first-visit novelty from third-attempt mastery and next-day motivation. Retain the PRD's voluntary continuation, story/setting and blind feel-preference gates. An instructed session, bot victory, or reward claim does not prove the desire to replay.

Do not optimize for endless compulsion. A satisfying stopping point with a specific unfinished curiosity is a better quality target than overwhelming the player with constant pressure. The next run should offer a new decision, not merely postpone a reward.

## Quantitative recheck

The following results are deterministic diagnostics, not forecasts of human success or retention. The repeated sweep uses expected power and the default bot policy; it does not use active skills. The sequential probe settles real earned meta results and allocates attributes/tree upgrades; the focused probe uses expected loadouts. Both have the same limitations as the first audit.

| Controlled probe | First audit | Second pass | Interpretation |
|---|---:|---:|---|
| Fresh-save campaign, seed 42 | 30/30 clears; 7 runs with deaths; 0 evolutions | 30/30 clears; 7 runs with deaths; 2 evolutions | Early build payoff improved; the number of recovered runs did not disappear. |
| Knife/gloves focus, expected power, L2–30 seed 42 | 27/29 clears; 2 evolutions | 28/29 clears; 5 evolutions | New early guidance helps; this is one policy and seed, not a human success estimate. |
| Focused evolution locations | L20, L25 | L2, L3, L4, L20, L25 | The remaining gap is predominantly after guided onboarding. |
| Normal/Nightmare initialization, L3/14/19/23/29/30 | Not measured | All six Normal samples have route trials/milestones; all six Nightmare samples omit them | Independently confirms P2-04; not a full Nightmare playthrough. |
| Source-only TR localization | Not measured | `card.needRank` renders `5. seviye` | Browser key exposure is a runtime/version issue to reproduce, not a missing source entry. |

The focused policy's remaining loss was L18. The fresh campaign used recovery in L5, L13, L14, L15, L16, L19 and L20. These results do not justify flattening all those levels: bot behavior, earned power, build policy, readable counterplay and player learning need to be separated.


**Verification:** Focused `gamer-route`, `fonts`, `bridge-route`, `karakoy-route` and `sirkeci-route` suites all passed. The full suite was started in the background, then deliberately stopped during its long arsenal stress test to reduce resource contention with the campaign sweep. Before stopping, a11y-canvas, anim-flavor and arsenal-w passed; arena-evolve failed to bind localhost in the sandbox. This is an **incomplete full run**, not seven repeated failures and not a green merge gate. The implementation's earlier successful browser checks are separate evidence. No reference traces or tests were changed.

**Scope and deviations:** No gameplay, assets, dependencies or balance values changed. Only this report, evidence and the running review log were added. Proposed changes need the existing decision/review workflow. Source-only mode and localization diagnostics are independently verified; inferred causes and unmeasured human outcomes are labeled as such.

## Completed all-30 balance comparison

The same eight seeds per level produced **230/240 clears, 183/240 death-free runs, 10 losses, no crashes and no timeouts**. The earlier sweep was 232/240 and 180/240. This small, policy-dependent change is not a retention measure or a meaningful claim of overall improvement/regression.

**P2-07 · P1 difficulty validation:** L13 and L14 retain exactly the prior clear/clean counts; six L14 deaths are still attributed to bloaters. L19 changes from 8/8 clears to 6/8, including two bridge-wave deaths. L30 changes from 8/8 to 7/8, with three Ticket Man deaths in the sample. L15 improves from 6/8 clean to 8/8 clean. These are targeted investigations, not a reason to remove the new counterplay or globally lower difficulty. The default policy does not use active skills and may fail to understand a newly taught mechanic.

**Next test and acceptance:** Have uncoached players attempt L5, L13–14, L19 and L30 twice at appropriate earned power. Record the threat they identify, first avoidable damage, escape choice, use of Dash/shield, and the change they make on retry. Separately rerun the same seed set with active skills and without recovery. Keep challenge where learning produces control; fix unreadable warnings, unsafe objective commitments or overlapping damage that players cannot reasonably answer. Report first-attempt deaths separately from post-revive clears. Eight seeds cannot establish an ideal difficulty curve.

| Bölüm | Prior clear / clean | Current clear / clean | Current median seconds |
|---|---:|---:|---:|
| 1 | 8/8 · 8/8 | 8/8 · 8/8 | 137.3 |
| 2 | 7/8 · 5/8 | 8/8 · 6/8 | 172.1 |
| 3 | 8/8 · 7/8 | 8/8 · 7/8 | 177.7 |
| 4 | 8/8 · 7/8 | 8/8 · 6/8 | 213.6 |
| 5 | 8/8 · 4/8 | 8/8 · 4/8 | 156.8 |
| 6 | 8/8 · 6/8 | 8/8 · 6/8 | 125.5 |
| 7 | 8/8 · 8/8 | 8/8 · 8/8 | 159.7 |
| 8 | 8/8 · 7/8 | 8/8 · 7/8 | 165.4 |
| 9 | 7/8 · 7/8 | 7/8 · 7/8 | 239.5 |
| 10 | 8/8 · 7/8 | 8/8 · 7/8 | 145.2 |
| 11 | 8/8 · 7/8 | 8/8 · 7/8 | 102.7 |
| 12 | 8/8 · 5/8 | 8/8 · 5/8 | 117.2 |
| 13 | 6/8 · 3/8 | 6/8 · 3/8 | 138.6 |
| 14 | 5/8 · 2/8 | 5/8 · 2/8 | 134.3 |
| 15 | 8/8 · 6/8 | 8/8 · 8/8 | 106.4 |
| 16 | 8/8 · 6/8 | 8/8 · 6/8 | 98.7 |
| 17 | 8/8 · 6/8 | 8/8 · 6/8 | 98.1 |
| 18 | 8/8 · 6/8 | 8/8 · 6/8 | 107.8 |
| 19 | 8/8 · 3/8 | 6/8 · 4/8 | 137.6 |
| 20 | 8/8 · 5/8 | 8/8 · 6/8 | 110.9 |
| 21 | 8/8 · 4/8 | 8/8 · 4/8 | 93.9 |
| 22 | 8/8 · 8/8 | 8/8 · 8/8 | 105.9 |
| 23 | 8/8 · 6/8 | 8/8 · 6/8 | 147.9 |
| 24 | 8/8 · 7/8 | 8/8 · 7/8 | 106.8 |
| 25 | 7/8 · 5/8 | 7/8 · 5/8 | 123.7 |
| 26 | 8/8 · 5/8 | 8/8 · 5/8 | 101.7 |
| 27 | 8/8 · 8/8 | 8/8 · 8/8 | 91.9 |
| 28 | 8/8 · 8/8 | 8/8 · 8/8 | 143.8 |
| 29 | 8/8 · 8/8 | 8/8 · 8/8 | 126.2 |
| 30 | 8/8 · 6/8 | 7/8 · 5/8 | 111.4 |

Medians include failed attempts and use the conventional midpoint median. Raw results are in `telemetry/gamer-pass2/sweep.txt`; the bot prints its aggregate only at completion. No partial results are counted. Total completed simulation attempts in this pass: **299**.
