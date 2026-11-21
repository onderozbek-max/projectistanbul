# Audit 9: requirement closure and verification

**19 November 2026 · Companion to the [main audit](GAMER-AUDIT-PASS9-2026-11-19.md) and [level/asset appendix](AUDIT9-LEVELS-AND-ASSETS-2026-11-19.md).**

The executed authority is [IMPLEMENTATION-PROMPT-AUDIT8](IMPLEMENTATION-PROMPT-AUDIT8-2026-11-18.txt), including the revised [implementation brief](AUDIT8-IMPLEMENTATION-BRIEF-2026-11-18.md), §§0–7. N1 alternative starting weapons, N2 a new environmental boss counter and N3 curated replay variants remain deferred. This report recommends work; it does not modify game design, approve expansion, start implementation or send instructions to another chat.

“Closed” below means the stated bounded requirement is supported. It does not certify an entire subsystem as artistically final. “Partial” means real implementation exists but the requested experience or proof remains incomplete. “Open evidence” is not a confirmed defect.

## 1. Original experiential requirements

| ID | Independent current disposition | Evidence / remaining gap |
|---|---|---|
| E01 · Hero movement | **Accepted working baseline, bounded** | Arda's latest gait retained and materially better in direct play. Preserve it; repair only demonstrated integration/ownership defects. This does not certify every turn/pose on a physical phone |
| E02 · Objects/interactions | **Partial; stronger** | Physical mechanisms, carry/use/place, saved food and actual consequences supported. Generic ring grammar, optional verb/priority and contact-to-consequence clarity remain |
| E03 · Health/navigation | **Partial; implemented cues** | Distinct damage/heal/block/critical mechanisms and accessible fixture exist. Competing layers and unaided comprehension remain; no claim that an unseen/missed heal animation is absent |
| E04 · Mute dramatic states | **Partial** | Entry protection, state treatment and cleaner aftermaths work. Pressure/release contrast and simultaneous-state comprehension need acceptance |
| E05 · Boss encounters | **Partial; meaningful improvement** | Ten identities, new authored poses, true different Cook policies, corrected Keeper access and all 60 supplied comparison clears. Action-specific continuous acting and first-encounter learning still incomplete |
| E06 · Enemy roles | **Bounded implementation supported; perceptual acceptance open** | All 16 fixtures active now, with natural versus additional roles distinguished. Crowded role/source recognition is not proved by fixture clocks |
| E07 · Earned balance | **Viability supported; player balance open** | Independent 30/35 broad campaign and three supplied additional paths clear. Early deaths, short signature exposure, eligible evolution timing and human retry experience still require interpretation |
| E08 · Optional monetization | **Prototype free-path requirement supported** | Four no-ad/no-spend/no-revive campaigns clear all 30. Keep agreement; no coercive wall or production SDK work is requested |
| E09 · Weapon roster | **Functional coverage stronger; craft partial** | 17×3 base ranks, 18 evolved identities, targeted earned acquisition and conditional effects. Ownership improved; chainsaw/contact/clutter and recognizable transformations remain |
| E10 · World scenes/story | **Partial; major compositional improvement** | World acting no longer hidden by the full comic, combat invitation cleanup, Kaan poses and real help variant. Scene blink/marks/response and playable departure fail full experiential contract |
| E11 · Camera/occlusion | **Partial** | Scene priority and occlusion handling better. Dense friendly FX, some prop/actor staging, distant optional cues and emotional composition still weaken focus |
| E12 · Sound/silence | **Technical evidence present; listening open** | Routing/ducking/motif and supplied audio evidence exist. This audit did not audition headphones/speaker, impact weight, fatigue or emotional mix. Later quiet-comic edits not listened to |
| E13 · Growth/failure/return | **Improved, with confirmed regressions** | Correct benefit wording, Gear stats, active hierarchy, badge catalogue, actual killer and plan. Mod layout and Memories lifecycle fail; next-mastery explanation incomplete |
| E14 · Interruption/access/performance | **Desktop functional checks pass; device/player gates open** | 50 groups accounted for after isolated dependency repair. Browser whole-flow coverage inadequate. No named sustained iPhone, touch/thermal/audio or unfamiliar full-30 acceptance |

## 2. Prior findings P8-01–15

| Prior item | Current disposition |
|---|---|
| P8-01 · Caller identity | Mom interruption/restoration corrected in live L1. Keep neutral system/unknown handling in the registry review; do not infer all aliases correct from one Mom call |
| P8-02 · Memories and badges | Seventeen-weapon catalogue and earned story record/thumbnail repaired. **Replay remains broken in real navigation**, P9-02; storage/test closure alone was premature |
| P8-03 · Emotional composition | World-before-comic and obsolete combat cleanup improved. Arda blink, walkable marks, physical response and departure remain, P9-04 |
| P8-04 · Hero locomotion | Retained as approved working baseline. New opening diner correction is a separate source-reviewed follow-up; don't reopen a wholesale Arda reanimation project |
| P8-05 · Weapon contact | Knife/chain/held-source better; chainsaw/contact weight and dense readability remain, P9-08 |
| P8-06 · Boss acting | New poses and more distinct assets; not full closure of tool/body continuity or action-specific intention, P9-03 |
| P8-07 · Earned balance | Keeper punish access fixed, early phase ordering improved, real comparison policies. Human balance/signature exposure and pre-boss failure analysis remain |
| P8-08 · Mechanism variety | Actual physical consequences stronger. Repeated task grammar and spatial decision clarity remain, P9-05 |
| P8-09 · Streets/choice evidence | **Evidence weakness substantially closed:** actual street events, offense/cover branches, real car and earned later consequences. Uncoached discovery/presentation open |
| P8-10 · Evolution payoff | **Reachability/conditional evidence substantially closed:** all 18 targeted earned successes. Natural policy breadth, timing in meaningful combat and plan discovery remain, P9-07 |
| P8-11 · Information architecture | Labels/Gear/active hierarchy improved. New mod-layout failure, buried plan and rank-zero next-benefit gap remain, P9-01/07/09 |
| P8-12 · Dialogue/repetition | In-session first-sighting/history treatment improved; reload persistence not established. New concurrent context/factual dialogue corrections require separate integrated review |
| P8-13 · Visual hierarchy | Source cleanup/scene focus improved. Optional prompt priority, crowded hero/threat visibility and muted comprehension remain, P9-06 |
| P8-14 · Mobile/audio/humans | **Still open evidence.** Desktop checks cannot close these gates |
| P8-15 · Frozen role captures | **Specific evidence defect closed:** replaced with active recordings. Do not equate active time with accepted normal-speed role recognition |

## 3. Independent evidence and reproducibility

| Evidence | Result and limitation |
|---|---|
| Frozen source | [Snapshot](telemetry/audit9/snapshot.json): 1,125 served files match runtime manifest `81a885795a562dd930b3428f5531548de69f03b6119ba7c2e4d19d5e587c3ce3`; unchanged base HEAD `4f5361dc0f5306a0243719a8afba9382d4c9e9d3`, dirty working tree |
| Independent campaign | [35 result rows](telemetry/audit9/earned-broad-independent.jsonl); [comparison](telemetry/audit9/independent-comparison.json) against supplied `audit8-earned-broad.jsonl`: all simulation fields equal, save differences only `lastPlayed` timestamps |
| Test suite | [Full log](telemetry/audit9/full-suite.log): 49 pass, art-prompts infrastructure failure. [Affected retry](telemetry/audit9/art-prompts-recheck.log): pass after copying missing repository prompt/tracker/inventory/tool dependencies into isolated root. No code change; all 50 groups now accounted for |
| Manual flow | [Method/observations](telemetry/audit9/method-and-observations.json). Fresh English L1, one Second Wind + one prototype revive, actual earned growth, real menus and broken replay into L2. No complete manual first-30 claim |
| Visual sampling | [Frame manifest](media/R1/audit9/strips/manifest.json); reproducible [broad extraction](telemetry/audit9/make-contact-sheets.py) and [detail extraction](telemetry/audit9/make-detail-sheets.py). All roster/level coverage is sampled, not continuous video viewing |
| Source-linked supplied evidence | [Implementation index](media/R1/audit8-implementation/index.html), [verification summary](telemetry/audit8-implementation/verification-summary.json), [candidate deltas](telemetry/audit8-implementation/candidate-deltas.json). Older films retain their actual source versions; not all were captured on the final manifest |
| Later working-tree changes | [Timestamped check](telemetry/audit9/final-runtime-check.json), [captured diff](telemetry/audit9/working-tree-followup.diff). Frozen files still match. At this check, 18 runtime paths differ: four opening-rendering paths plus dialogue/context and comic-audio changes. Not independently played/tested as an integrated later build |

The opening follow-up addresses resident diner spawn opacity/scale/dust, preloading, projected depth and conversion continuity. The subsequent dialogue/context changes address factual wording, first-sighting eligibility, call/ambient competition and mourning; comic changes adjust quiet mode, page-turn cues and speech blips. Source changes are promising, but their exact new player-facing result is outside the frozen audit. The two main UI failures involve unchanged layout/hub ownership; the later comic-audio diff does not repair their lifecycle.

Reproduce tests using `prototype/tools/run-tests.sh` with the repository's required nonruntime art/tool directories available. Campaign harness/options are documented by the implementation evidence; keep its broad policy and saved-data assumptions rather than replacing them with an invulnerable observer.

### Campaign interpretation

| Profile | Attempts / clears | Losses / driver timeouts | Winning runs with evolution |
|---|---|---|---|
| Broad · independently rerun | 35 / 30 | 5 / 0 | 24; all Cleaver |
| Cover · supplied | 38 / 30 | 8 / 0 | 17 |
| Offense · supplied | 34 / 30 | 2 / 2 | 23 |
| Banked growth · supplied | 43 / 30 | 13 / 0 | 23 |

The two timeouts were driver pursuit of a destroyed prop; supplied corrected-driver reruns clear those exact seeds/saves. Do not call them game softlocks. Banked growth withholds attribute/perk spending but still has earned gear/mastery; it is not a zero-progression run. All profiles use systematic decisions, so none establishes novice difficulty.

Across 150 attempts: 120 clears, 28 deaths, two driver timeouts. Do not compare that total mechanically with an earlier cohort as a difficulty regression: policies/harness changed. Inspect causes, access and learning. Broad deaths include Switchkeeper, two L14 bloater deaths, a pre-Bride bloater death and Captain. Cover has several early crowd deaths; fixing bosses alone cannot address them.

All 18 evolution targets have focused earned successes establishing reachable, actually effective outcomes under their declared offer/plan policies. The supplied focused file retains **177 trials, including six losses**; this was not 18 universally successful single attempts. It does not establish unbiased frequency. Broad uses Cleaver, cover uses Nail Storm/Net Spear/Twin Saw, offense uses Cluster/Fire Lake/Foam Storm, and banked growth uses Cleaver. [Campaign timing summary](telemetry/audit9/campaign-summary.json) retains late/after-boss examples; meaningful encounter use needs a better definition than five remaining targets.

### Evidence cautions

- `L1-heal-selection.jpg` shows a selection/fade, not proof of the healing animation. Use the source and health sequence; unaided recognition remains pending.
- `L1-mom-restored.jpg` depicts the restored call. Correct static-Mom identity was separately observed live.
- `L1-cook-combat.jpg` is ongoing combat, not an entrance screenshot.
- `memory-leaks-into-L2.jpg` was saved after the L2 intro toast faded; the live observation established both states simultaneously.
- Boss/contact strips aid anatomy/contact assessment; they do not prove seamless temporal motion. Keep normal-speed review as acceptance.
- Proximity-to-enemy time is not an intensity metric. A nearby passive walker and an overlapping lethal attack are not equivalent.
- No audio-quality defect is inferred from lack of listening. No human return rate is inferred from bot wins.

## 4. Concrete next implementation and acceptance packet

Complete this as a bounded corrective pass. Preserve current Arda gait, ordinary-enemy scope, current district art, canon, native language workflow, free progression, sim/view separation and deferred N1–N3. Record proposed player-experience/design deviations through the existing decision process; do not silently turn this audit into production beyond L30.

| Work package | Required output | Acceptance that would close it |
|---|---|---|
| A · Ordinary UI/state trust | Responsive populated build; explicit Memories replay ownership/return; truthful verbs and next mastery benefit | Real earned rank-3/5, six-slot/evolved states; both locales/default-largest text; actual replay click/hit-test/reload/next-run chain; no duplicate settlement or advancing gameplay behind story |
| B · Emotional continuity | Opaque readable protected actors; obstacle-aware approach/marks; Arda response; L20 shared departure; coherent L25/30 exit/reward | Earned recent-damage/unfavorable-position defeat→world→comic→control→exit→result, normal and skip/retry. Actual support/help eligibility retained; no pre-Fisher companion grant |
| C · Boss and contact craft | Action-specific tool anchors and timing; real footwork/recovery; selective weapon/contact repairs | Cook/Captain reference followed through all ten bosses; isolated and crowded normal-speed phone-scale review; source/aim-lock/contact/recovery agree with sim; Arda baseline unchanged except demonstrated defect |
| D · Thirty-level rhythm/build intent | Distinct positional decisions around existing mechanisms; useful relief; plan at decision point; meaningful evolution use | All 30 annotated before/after approach→decision→consequence sequences; neutral/choice branches, early deaths and strong builds retained in evidence; no duration padding or blanket HP inflation |
| E · Device/player/audio acceptance | Named actual phone session, audible review, unfamiliar-player observations and complete manual first-30 run | See minimum protocol below; unresolved findings remain explicitly open instead of receiving a blanket “tests passed” label |

### Minimum player/device protocol

Use the existing 5–8 consenting unfamiliar-player formative protocol; this is a proposed next verification activity, not research already conducted. At least one complete uncoached first-30 run is needed, with interruption/return and failure/retry observed. Capture meaningful mistakes and abandoned intentions rather than steering the participant to the correct answer.

At natural pauses ask what hurt/healed them, what their last upgrade changed, which enemy they prioritized, why a boss opening appeared, what the street object accomplished, and why Arda/Kaan are continuing toward the Bazaar. Record whether they can demonstrate the answer in play. Check spontaneous continuation/return; do not promise retention from a tiny formative sample.

On a named physical iPhone, document OS, browser/build, orientation, text/effects settings and sustained session length. Test one-thumb reach, edge contact, lost input after interruption, audio resume, readable effects under load, heat and frame consistency. Desktop p95 values remain desktop evidence. Audio review needs actual headphones and phone-speaker listening through repeated combat, frenzy, defeat, reunion, farewell and departure.

### Handback format

Provide one exact-build manifest and a concise change/remaining-risk list mapped to P9-01–10. Include real normal-speed full-viewport recordings and targeted browser reproductions, source-labelled fixtures, all campaign attempts, complete failure reasons, relevant full-suite result and device/player/listening evidence if conducted. If a gate could not be conducted, state that plainly.

Acceptance is based on the whole experience working and communicating its meaning. **Do not expand beyond 30 or declare Hades parity/masterpiece status because all tests, asset counts or scripted clears are green.** When the slice meets these gates, validate the next-district pilot against the existing narrative plan before scaling production toward 100.
