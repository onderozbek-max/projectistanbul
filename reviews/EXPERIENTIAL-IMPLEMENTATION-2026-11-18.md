# Experiential quality implementation · 2026-11-18

**Latest owner follow-up:** three visual regressions in this snapshot were caught during play: a wrong opening portrait, repeated civilians and an awkward hero gait. See [the correction and fresh playback evidence](CHARACTER-VISUAL-CORRECTIONS-2026-11-18.md). The original 155 films/manifest below remain historical evidence of their frozen runtime, not silently relabelled current footage. Technical passes did not establish artistic acceptance.

Active JS prototype, first 30 Bölüms. Branch `r1/p2.1-turkish-dialogue-audit`, base `4f5361dc0f5306a0243719a8afba9382d4c9e9d3`, with substantial pre-existing local changes preserved. The exact tested state is the [runtime/build manifest](telemetry/experiential/build.json) and [source hashes](telemetry/experiential/source-build.sha256), not the Git SHA alone.

**Implementation and available desktop acceptance are complete.** The frozen runtime passed all 49 test groups with zero failures; the E01–E14 inventory and final recordings below cover the whole first-30 slice. Physical-phone and unfamiliar-player acceptance remain open. Nothing was committed, pushed, merged, installed, purchased or integrated with an ad/payment service. No production beyond L30 was authored.

## Reconciliation before implementation

Read AGENTS, handoff, the four experiential PRDs, current REVIEW-R1, H01–H18, pass 7, latest English audit/readthrough and Turkish narrative pass 2. Current source won over historical defect descriptions. This packet extends the working implementation rather than restoring old dialogue or older mechanics.

| Requirement | Initial disposition | Retained baseline / required extension |
|---|---|---|
| E01 | Extend | Current directional identity/attack footwork; add articulated locomotion and transitions. |
| E02 | Extend | Deliberate hold, finite wear, placement precedence and eight-second cover; add physical reach and stable ownership. |
| E03 | Extend | Exact HP/saved-food rules; extend small-hit, recent-loss, real-heal and critical feedback. |
| E04 | Extend | Real frenzy/horde/boss states and speech priority; refine simultaneous-state readability. |
| E05 | Extend | Latest Vatman recovery/approach and Ticket Man phases; add truthful entry/aftermath and full roster evidence. |
| E06 | Extend | Actual AI/roster; inventory natural spawns and articulate distinct role movement/preparation. |
| E07 | Retain and verify | Earned progression, defensive pivots, missing-partner offers; measure four free campaigns/all-30 pacing. |
| E08 | Retain and verify | No real transactions/ads; preserve the independent free route and honest optional catalog state. |
| E09 | Extend | All 17/18 mechanics, saw rev, flexible chain, contact and firing-variant attribution; refine knife/grip ownership. |
| E10 | Extend | Current native scripts/illustrations/route actions; add factual protected scene lifecycle and grounded major aftermaths. |
| E11 | Extend | Existing danger geometry/speech arbitration; improve actor framing and tall-object occlusion. |
| E12 | Extend | Eight approved music tracks and existing material/contact cues; integrate quiet story/audio interruption. |
| E13 | Extend | Attribute-specific practice, perks, mastery and recipes; improve equipped comparison and scope at pause/result. |
| E14 | Extend | Existing recovery/idempotent settlement; unify protected clocks, background/skip/input and accessible composition. |

Latest native voice remains untouched: English audit **1205 lines** and Turkish current **1202 lines**. The current signal booster only repairs an active interrupted call; it does not invent Mom before the call starts. The old Galata fixture was corrected accordingly. Evolution attribution, first-clear choices, useful/stored Kaan help and eight-second placed cover remain current.

## E01–E14 implementation and evidence

Status describes the evidence actually available, not an artistic certification. Each linked inventory contains the complete required roster rather than a reference-slice-only handback.

| ID | Implemented behavior / main source | Values and functional verification | Player-facing evidence / remaining limit | Status |
|---|---|---|---|---|
| E01 | [Jointed rig](../prototype/js/view/actor-rig.js), [hero motion](../prototype/js/view/hero-motion.js): alternating legs, foot contact, knees/hips/chest, start/stop/turn, actual Dash and down pose | 100 ms take-up, 140 ms settle, 90 ms turn; IK length/Dash/settlement regressions | [Hero/ownership inventory](EXPERIENTIAL-COVERAGE-2026-11-18.md#hero-and-animation-ownership); eight-direction, actual Dash/hit/defeat and six-weapon clips. Crop joins and perceived weight need independent review | Verified in fixture; device/player evidence pending |
| E02 | [Interaction acting](../prototype/js/view/interaction-acting.js), street actions, task grips, growing local wear | 0.72 s prop hold, 0.60 m reach, 0.12 s target hysteresis, 0.18 s hit cancel; choices 0.38 s; eight-second cover retained. Full/partial food and carry/placement regressions | [All-30 actions](EXPERIENTIAL-PACING-2026-11-18.md); current tools/loads bind to actual reach. Clips are supplied first-action fixtures, not all-30 human walkthroughs | Verified in fixture; observed in earned simulation |
| E03 | [Health feedback](../prototype/js/view/health-feedback.js): immediate true fill, recent loss, local/directional hit, real restored segment, shield and critical shape | Trail hold 0.12 s / decay 0.38 s; heal 0.65 s; hit 0.38 s; critical enter 25% / leave 36%. Small hits, unknown direction, overkill, block, cap and heal+damage tests | [Conflict clips](EXPERIENTIAL-EVIDENCE-2026-11-18.md); unfamiliar-player recognition still unmeasured | Verified in fixture; device/player evidence pending |
| E04 | Existing state cues retained; death cancels obsolete boss-phase quips; protected beats hold incidental dialogue | Actual frenzy/boss/hit states; no fake empowerment or hidden damage. Reduced-flash global budget retained | Busy dark/light, mute-readable shape/body cases indexed; distinguishing them without coaching remains a player gate | Verified in fixture; device/player evidence pending |
| E05 | [Scene lifecycle](../prototype/js/view/scene-flow.js), calibrated Cook/Captain/Ticket Man and jointed boss footwork | Entry 1.75 s, repeat 0.38 s; ten bosses × three earned samples × two policies; real captain-walk crash regression | [Ten-boss table](EXPERIENTIAL-COVERAGE-2026-11-18.md#ten-bosses-actual-earned-power-two-policies). L2–4 short punish clears and L10 punish losses explicitly retained | Observed in earned simulation/play; player evidence pending |
| E06 | [Enemy acting](../prototype/js/view/enemy-acting.js), living civilian rig, current scooter/gull frames | 15 observed type IDs; all four walker outfits; no AI timing/collision change | [Actual roster](EXPERIENTIAL-COVERAGE-2026-11-18.md#enemy-roster-actually-observed). Known extra-role fixtures labelled. Human role recognition not established | Verified in fixture; observed in earned simulation |
| E07 | Current earned campaign/build systems retained; healing-station bot policy stops when actually in range | Four campaigns: 120 clears in 136 attempts, 15 deaths, one navigation timeout; zero revives/ads/spend. Four-seed sweep 109/120 wins, zero timeouts | [All-30 pacing](EXPERIENTIAL-PACING-2026-11-18.md) and acquisition/offer logs; late low-payoff evolutions and repeated holds are named concerns | Observed in earned simulation; player evidence pending |
| E08 | No real monetization UI/SDK added; the existing free playtest revive and direct free retry remain explicit | All four earned campaigns use ordinary rewards/eligible purchases. No purchase-aware enemy scaling added | [Optional timing/catalog design](PRD-EXPERIENTIAL-QUALITY-2026-11-18.md#9-e08--monetization-with-an-enjoyable-independent-free-path) remains design context. No fake ad/product flow, purchase gate or unsolicited offer was added | Observed in earned simulation; product experiment pending |
| E09 | Knife constrained hand-following trace; saw rev plus brief fresh transfer; other working identities retained | All 17 base ranks 1/3/5 and 18 evolved IDs; real direct/delayed/area attribution and seven-second live-target diagnostics | [Weapon/evolution matrices](EXPERIENTIAL-COVERAGE-2026-11-18.md#all-17-base-weapons). Actual films are primary; hit assertions alone do not establish satisfying contact | Verified in fixture; observed natural subset; player evidence pending |
| E10 | All route actors retained/extended; fresh opening; actual defeat starts L20/25/30 world acting/native comic at the body, then returns control for exit | World phases 5.2 / 6.4 / 5.2 s overlap first native caption. Full shared clock remains frozen through reading. Variant-specific seen IDs; no reward/fact manufactured by view | [Four scenes](EXPERIENTIAL-COVERAGE-2026-11-18.md#four-major-sequences), [44 explicit scene contracts and walkthrough](EXPERIENTIAL-SCENES-2026-11-18.md); current TR/EN exports. Earned recordings distinguish actual clears from supplied aftermath fixtures | Observed in earned play; device/player evidence pending |
| E11 | Scene frame fits actors vertically/horizontally and reserves caption space; tall-prop occlusion is 48% near hero feet | Scene camera owns only presentation; ordinary live geometry/controls retained | Minimum-quality/large-text/both-thumb conflict captures; exact phone safe areas remain pending | Verified in fixture; device evidence pending |
| E12 | Existing contact/material families and quieter music retained; farewell uses current comic bed; post-master capture and background suspend | Repeated boss→comic→run transition has at most one audible music track; mute preserved; actual audio recorded | Digital recording and runtime track count are not phone-speaker/headphone artistic audition. That listening gate remains explicit | Verified in fixture; device/player evidence pending |
| E13 | [Scope UI](../prototype/js/view/experience-ui.js); real equipped-vs-selected comparison; current illustrated Arda in gear; first-30 replay boundary | Earned no-spend ready-rank/SC save: real apply increments one attribute/decrements its readiness, eligible perk spends actual SC; pause permanent/run labels | [Upgrade screenshots/checks](EXPERIENTIAL-EVIDENCE-2026-11-18.md); user comprehension of practice/perks/mastery still needs uncoached testing | Verified in fixture from earned save; player evidence pending |
| E14 | Protected reading/acting owns one lock; safe 0.6 s skip, variant-specific repeats, explicit background resume, no stale keys/Dash, current-source retry | Scene time and gameplay time separate; completion/skip marks seen; actual result transaction unchanged. Largest-text resume font fixed. TR/EN max-text major scenes and actual illustration-failure/read-neutral/retry are captured. Final suite/checks linked below | Desktop layout/capture is identified as desktop. No named physical-phone sustained session or unfamiliar-player study was available | Verified in fixture; device/player evidence pending |

## H01–H18 and pass-7 continuity

| Prior requirement | Current treatment |
|---|---|
| H01 deliberate improvisation | Retain offensive/place intent, finite wear and cover; extend stable candidate, cancellation and physical work. |
| H02 local outcomes | Retain six bounded branches, placement precedence, first-clear persistence and factual callbacks. |
| H03 Kaan reciprocity | Retain actual help eligibility; isolate its actor during aftermath; variant-specific farewell presentation cannot invent gratitude. |
| H04 encounter composition | Retain all-30 authored routes and bounded spawns; inventory actual roles and review pacing instead of adding uniform speed/HP. |
| H05 build agency | Retain early direction, defensive pivots, recipes and delayed-shot attribution; report actual investment/payoff tails. |
| H06 attributes/perks | Retain separate readiness and SC rules; verify a real earned apply/perk journey. |
| H07 information hierarchy | Extend true HP history, pause/result scope and equipped comparisons; preserve current objective/recipe advice. |
| H08 opening | Extend current ~28 s illustrated cold-open physical staging; keep first useful input as movement. |
| H09 voice/canon | Latest native TR/EN and knowledge order retained; no translated voice or future branch introduced. |
| H10 combat | Extend whole-body movement/contact/ownership; all base/evolved IDs inventoried. |
| H11 bosses | Latest Vatman/Ticket Man retained; complete ten-boss samples and true safe lifecycle. |
| H12 assets/audio | Approved raster identity retained; living civilians reuse approved patron; failed sources retry without retired drawings. |
| H13 fair balance | Earned power/policy comparisons plus geometric overlap probes, with defeats and timeout retained. |
| H14 reward/return | Existing exactly-once settlement and next experiment retained; aftermath cannot award another clear. |
| H15 reliability | Protected scene/background/skip/shared-clock fixes; existing supported run recovery retained. |
| H16 accessibility | Largest text, reduced motion/flash, min quality and both-thumb fixtures; physical gate pending. |
| H17 expansion inheritance | Design/readiness gate retained. L31 is unavailable in active player flow. No remaining-70 production. |
| H18 complete delivery | This matrix, complete inventories, campaign records, indexed recordings, provenance and exact external checklist. |

Pass 7: P7-02/06 weapon identity/articulation extended; P7-03/04/07 interaction intent/physicality retained and extended; P7-05 latest boss repairs measured; P7-09 present-tense recipe/progression retained; P7-10 interruption/accessibility/performance checked to available evidence. Full voice audit authority stays with the later native passes.

## Tests, balance and provenance

- [Evidence index and test outcomes](EXPERIENTIAL-EVIDENCE-2026-11-18.md), [coverage](EXPERIENTIAL-COVERAGE-2026-11-18.md), [all-30 pacing](EXPERIENTIAL-PACING-2026-11-18.md).
- [Full suite log](telemetry/experiential/full-suite.log); focused `experience`, art-raster, gamer-route, quality, UI motion, input and dialogue checks. A previously failing assertion/fixture is not reported as green until rerun.
- [Campaign summary](telemetry/experiential/campaign-summary.json); four raw `earned-*.jsonl` files; [boss evasive](telemetry/experiential/boss-evasive.jsonl), [boss punish](telemetry/experiential/boss-punish.jsonl), [sweep](telemetry/experiential/route-sweep.jsonl), [overlap paths](telemetry/experiential/overlap-reachability.json), [evolution outcomes](telemetry/experiential/evolution-fixtures.json).
- [Source/build](telemetry/experiential/build.json), runtime checksum, verification-tool checksum and final media index identify the dirty build. Every primary indexed capture identifies the same final runtime SHA. Superseded intermediate scenes and the initially mislabelled replay-save captures are retained separately as history, excluded from final evidence.

## Adopted changes and deviations

Presentation/config values are listed in the E table and `config-experience.js`; Proposed D-115 records them for review. No weapon damage/HP/attack cooldowns or boss health values were changed to fit animation. Current task holds, eight-second cover, mastery/recipe eligibility, first-clear commitment and evolving-projectile attribution remain authoritative.

Gameplay-facing refinements: a route-choice pad requires 0.38 s stationary intent; healing-station progress requires deliberate stillness and cancels on a recent real hit; prop targeting has 0.12 s hysteresis and 0.18 s hit cancellation. A mission weight/sack and portable prop cannot own the same hands. An already-full heal no longer emits a false heal sound/burst. Positive capped healing amounts and pre-hit HP are exposed for truthful feedback, without changing healing/damage formulas.

Protected scenes freeze the shared simulation, including the old L1 exit-enemy update. Live route actions keep control/danger. **L2 retained exception:** approach/calling remain live, but the previously owner-accepted crowd/tram payoff is protected. This differs from the appendix’s literal live-control wording and is explicitly recorded for review. Major native aftermaths now begin beside the actually defeated boss; this is a presentation trigger correction. Actual exit conditions and exactly-once settlement are unchanged. Seen keys distinguish native outcome variants, and a later exit cannot replay an already shown aftermath. A dying boss clears obsolete phase quips.

**Source reconciliation:** Stormshield’s conditional zap is caused by a real Nazar dodge, not Dash. The focused clip records actual dodges without Dash input; mechanics were preserved rather than altered to match an earlier shorthand.

The active flow stops at L30 even for old saves/links with a higher unlock. Existing later content remains data/design context. Replays and normal earned progression remain available without a transaction.

## Limitations and readiness

**Ready for a fresh independent first-30 audit.** No unresolved functional blocker was found in the completed suite, focused browser lifecycle checks, earned campaigns or corrected first-clear scene recordings. This is an audit recommendation, not experience acceptance, release approval, expansion approval or a claim of masterpiece/Hades parity.

**Outstanding acceptance gates:** physical-phone performance/touch/audio/interruption and 5–8 unfamiliar-player comprehension/voluntary continuation. Artistic review must specifically assess the concerns below; technical passes cannot waive an experience blocker. The exact remaining external checklist is in [the evidence appendix](EXPERIENTIAL-EVIDENCE-2026-11-18.md).

Artistic judgments remain open: cropped rig joins at normal phone size, low-rank contact weight in crowds, readable role preparation/death for every natural type, very short early boss clears, repeated actuation tasks, and conditional evolution spectacle. The deliberately dense six-weapon/high-HP stress fixture can heavily obscure Arda near the lane edge; danger/contact readability in ordinary phone play is an explicit audit focus, not an accepted tradeoff. The generic living-person rig reuses one approved illustration; it is not newly authored civilian variety. Actual audio recordings are available; artistic listening on phone speaker/headphones is still required.

No physical iPhone session or consenting unfamiliar-player sample was accessible. Exact remaining checks, including a sustained approximately 20-minute named-device run and 5–8 uncoached players, are in the evidence appendix. Automated wins establish available routes/reward continuity, not enjoyment, retention or voluntary return.
