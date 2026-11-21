# PRD · Expressive play and player understanding · first 30 Bölüms

**Owner:** Onder Ozbek. **Creative direction:** this chat. **Execution:** implementation agent. **Date:** 2026-11-18. **Status:** owner-approved direction; detailed production requirements proposed for execution and review. This document is a specification, not a claim that the features are implemented or verified.

## 1. Product outcome and authority

Make the player feel that Arda has a body, attacks have physical consequences, Istanbul responds to their actions, danger is understandable, and the journey alternates pressure with earned relief. The first 30 levels should sustain interest through mastery, varied decisions and attachment to the characters. “Masterpiece” is the aspiration; the acceptance gates below determine whether the work is ready for review.

The owner explicitly agreed with the preceding ten-point discussion, **including rejecting mandatory spending/ad dependence for progression**, and requested this detailed PRD plus closely related factors. Implement these requirements within the active JS prototype. Preserve the one-thumb controls, automatic attacks, current visual identity, canonical story and existing successful work. No engine migration, new dependency/service, real ad/IAP integration, new currency, new playable character or production beyond L30 is part of this brief.

This PRD refines [the holistic brief](HOLISTIC-EXPERIENCE-REDESIGN-2026-11-17.md) and [pass 7](GAMER-AUDIT-PASS7-2026-11-18.md). It does not restart their implementation. The execution packet consists of four linked documents, all required:

| Document | Owns |
|---|---|
| This PRD | Feedback, interactions, state presentation, progression/economy, scope and priorities |
| [Combat direction](PRD-EXPERIENTIAL-COMBAT-2026-11-18.md) | Hero locomotion, enemy identities, all weapons/evolutions, ten bosses, balance |
| [Scene direction](PRD-EXPERIENTIAL-SCENES-2026-11-18.md) | Runtime scene contract, all-30 world beats, exact major sequences, boss entrances/exits |
| [Acceptance and delivery](PRD-EXPERIENTIAL-ACCEPTANCE-2026-11-18.md) | Work order, measurable checks, device/player protocol, evidence and completion matrix |

Later owner decisions win. Current native TR/EN dialogue and established factual knowledge win over illustrative wording in this PRD. No sample stage direction authorizes changing Dad's letter, when characters meet, or later-chapter canon. Record production design/number changes under Deviations and the proposed decision log entry; do not silently change sim rules to match an animation. Existing architectural rules remain binding.

## 2. Reconcile the work in progress before editing

The 2026-11-18 pass-7 implementation checkpoint reports corrected live recipe copy, carried variant attribution, placement precedence, closer/eight-second cover, light previews, revised Vatman/Ticket Man behavior, additional weapon/body motion, action holds, repaired narrative triggers and menu explanations. The English dialogue pass reports a further 212 revised entries and knowledge/trigger corrections. These are implementation reports, not this PRD's independent verification.

Build a short mapping of each E requirement below to **retain and verify / extend / missing** using the current source. Preserve verified repairs. In particular, do not restore old first-hit choice commitment, base-only evolution attribution, five-second cover defaults, recycled L30 lines, early Captain spoilers or stale English dialogue because an older audit described them. Do not overwrite the implementation agent's working tree or run duplicate full test suites while it is still changing the same files.

## 3. Requirement index and definition of completion

| ID | Requirement | Owner discussion | Existing work it refines |
|---|---|---|---|
| E01 | Expressive hero locomotion and response | 1 | H10; P7-06 |
| E02 | Physical, understandable object interactions | 2 | H01/H12; P7-03/04/07 |
| E03 | Damage, healing and spatial awareness | 3 | H07/H13/H16 |
| E04 | Distinct dramatic states, legible on mute | 4 | H11/H12/H14 |
| E05 | Authored, fair boss encounters | 5 | H11/H13; P7-05/06 |
| E06 | Perceptible enemy roles and escalating combinations | 6 | H04/H10/H13 |
| E07 | Earned player power and challenge progression | 7 | H05/H06/H13 |
| E08 | Optional monetization that preserves the free game | 8 | Product D-016/D-059; business-plan §5.1 |
| E09 | Every weapon has convincing action and consequence | 9 | H05/H10; P7-02/06 |
| E10 | In-world scenes connect actions, people and places | 10 | H08/H09/H14 |
| E11 | Camera, occlusion and visual-priority discipline | Adjacent | H07/H12/H16 |
| E12 | Cohesive sound, silence and contact feedback | Adjacent | H12/H16 |
| E13 | Progression, failure and return comprehension | Adjacent | H06/H07/H14; P7-09 |
| E14 | Safe interruption, accessibility and performance | Adjacent | H15/H16; P7-10 |

Every requirement needs functional evidence and player-facing evidence. “An animation exists,” “a flag is set,” “a test passed” and “the effect is larger” are not artistic acceptance. Conversely, an attractive clip does not establish correct damage, persistence or progression. The acceptance appendix defines both.

Numerical presentation timings in these documents are **initial tuning ranges**, unless explicitly identified as existing guardrails or hard functional limits. Put adopted numbers in config. Tune from normal-speed phone-size playback; explain deviations. Never extend a telegraph or freeze the simulation merely to fit a shot without treating it as a gameplay change.

## 4. E02 · Object interactions: a consistent physical language

### 4.1 Shared interaction contract

Use the current deliberate proximity/hold interaction as the foundation; the latest checkpoint reports 0.72 s. Keep moving away as cancellation. Do not introduce an interaction button for every prop. When the hero is intentionally stationary within range, select one eligible target with a stable outline/ground contact highlight. Hold progress belongs on that object's actionable part, not on an unrelated floating ring. Target changes must not cause rapid highlight flicker; show only one primary invitation.

Before input, the object must communicate its purpose by shape and context. During use, Arda looks/reaches/presses/pulls toward the actual handle or surface. At completion, synchronize pose contact, world state, effect and cue. After completion, its appearance explains whether it is depleted, broken, placed, saved for later or still usable. A skipped animation must leave exactly the same gameplay result.

Use distinct shapes as well as color: a grip/handle for lifting, a crack/impact edge for breaking, an ignition/fuse mark for volatile objects, a medical/tea service symbol for healing, a connection/lever state for mechanisms. Colors are accents, not the sole instruction. Nearby optional invitations yield to imminent damage and the required task. Preserve the currently fixed nearest-object and cancellation behavior.

### 4.2 Required object treatments

| Object | Before / during | Completion and state | Required adverse case |
|---|---|---|---|
| Wooden crate/cart/bench | Visible seams; an intentional strike reaches its near face; body braces for size | Crack at impact; short wood fragments travel away from contact; original object becomes broken or held exactly once | Walking past must not break/lift it; overlapping objects cannot both complete from one hold |
| Metal bin or fixture | Metal silhouette and grip; compact body load-up | Brief dent/tilt and material ring; readable heavy settle; loot appears at the physical source | No wooden debris or misleading explosive flash |
| Glass-bearing breakable | Visible glass panel; actual strike/contact | Controlled shard fan and emptied frame; hazard appears only if simulation creates it | No harmless-looking glass over an active damaging area |
| Gas canister/volatile car | Consistent volatile marking; ignition gesture points to fuse/source | Clearly burning fuse and expansion boundary before blast; aftermath matches destroyed collision | Cancel before commitment, dash away after ignition, chain explosion and muted/low-quality tell |
| Extinguisher fixture | Nozzle and usable pressure cue | Foam originates at nozzle and reaches the affected surface; gauge/nozzle state becomes spent | No cooling/extinguishing claim if the target was unaffected |
| Portable authored object | Grip cue; knees/arms lift visible mass; same artwork and scale used on ground and in hands | Carry, swing, Dash-drop, placement and throw connect continuously; wear stays on the object | Repeated drop/pickup cannot refill life or wear; ordinary and authored props must not promise unsupported placement |
| Placed cover/lure | Ghost footprint shows actual valid placement and approach side while held | Object lands with weight; enemies visibly react if eligible; lifetime ends in a legible break/settle state | No extra loot at expiry; no route blockage; no invisible late target commitment |
| Health food | Recognizable food and available/saved/spent cue; avoid a permanent medical glow on all food | Short inward pickup motion, actual heal response and exact HP-bar change | Full HP, partial benefit, heal cap, simultaneous damage, item left behind and revisit |
| Health station/büfe | Readable sign and stocked counter; the usable component highlights | Arda briefly reaches; service cue/stock changes; actual restorative feedback; no standing ring after depletion | Full HP does not waste it unless an explicitly approved rule says so; moving away cancels unfinished use |
| Chest | Illustrated lid/lock is the focal point | Lid opens physically, reward emerges, then existing reward UI; opened shell persists where appropriate | No new reward on replaying presentation, resume or double tap |
| Lever/rope/fuse/sack | Connected cables, rope tension or destination show what the action will affect | World action completes with collision/state; scene appendix supplies each task's physical result | No open-looking but impassable gate; no completed ring with unchanged world |

Do not reward every interaction with a full-screen celebration. Health, ordinary loot, task completion and major victory need different magnitude. Keep resource amounts readable when requested but make the primary consequence perceptible without reading them.

### 4.3 Six choices and Kaan

Complete the existing 7/12/17/22/27/29 alternatives using their existing save contract. A player sees the intended advantage before committing and a physical consequence afterward. Validate mixed actions: incidental prop contact followed by cover must retain the corrected outcome precedence. A choice pad must not silently make an irreversible narrative decision during an unavoidable dodge; either give sufficient spatial separation or a short deliberate confirmation through stationary intent, preserving one-thumb play and documenting any sim change.

Show the eight-second cover's remaining usefulness through damage/wear or another object-local state, without a permanent new HUD meter. It must protect a relevant approach during actual pressure. Light previews must reveal useful forthcoming space or threats without falsely displaying exact enemies that will not spawn. L23 repayment must show Kaan's threatened position, Arda's action and the relieved threat; do not substitute a relationship popup for that causal chain. Exact scenes and variants are in the scene appendix.

## 5. E03 · Health and navigation are understood at a glance

### 5.1 Damage

Keep the numeric health bar, but give it a recent-loss segment: current HP changes immediately; a lighter trailing segment briefly marks the loss, then resolves over roughly 0.3–0.5 s. No delayed display of the true remaining HP. Nearby hero feedback begins on the hit frame: a short body flinch/compression and directional tick where the source has a meaningful direction. Reactions must not add movement lock or disrupt automatic attacks unless an existing gameplay stun applies.

Provide restrained feedback for **every actual positive HP loss**, merging rapid small hits rather than requiring a single hit above the existing 10% threshold. Keep shield absorption, invulnerability, misses and healing distinct. Damage from a surrounding puddle or poison uses a local danger mark; do not invent an arrow toward an arbitrary attacker. For rapid hits, present the dominant recent source and preserve attribution in defeat details.

Critical health retains a subtle edge treatment and a persistent shape/state near the health display; its center remains transparent. Introduce hysteresis so healing around the threshold does not retrigger alarms repeatedly. Reduced flashing uses a steady indicator and bar-state change. Injury posture may affect shoulders/breath but must not falsely imply reduced movement speed. Healing visibly reduces distress when actual HP crosses the recovery threshold.

### 5.2 Healing

At use, show a short restorative sweep at Arda and a bright outline on the **newly restored segment** of the HP bar for approximately 0.5–0.8 s. If an unobtrusive connection from pickup to bar helps, use one short path; do not send multiple particles across combat warnings. The floating amount, where retained, equals actual HP gained, not nominal item value. A shield increase must not use the HP fill animation.

For a simultaneous hit and heal, retain both event deltas and resolve the bar to the authoritative final HP; do not animate full restoration followed by unexplained subtraction. At full health or a reached heal cap, preserve the existing saved/spent rules and visibly communicate no restoration. Never play the full successful-heal sequence for a zero-benefit event. Continuous regeneration uses a quiet sustained indicator rather than repeating pickup celebrations.

### 5.3 Navigation

Keep the current required-objective strip. During ordinary movement it should identify the action and destination; near the object it can yield space to the physical affordance. Add/finish a compact route-progress treatment only if it replaces an existing redundant cue. Show the next required landmark and meaningful exit direction, not every zombie on a minimap. Offscreen required targets use a distinct destination shape; offscreen imminent threats use a danger shape. Limit visible pointers to those that affect the next decision.

Do not add a persistent minimap to the current mostly linear first-30 layouts. If a specific existing branched route fails an unaided navigation test, first repair landmarks/markers; document the unresolved case before adding map UI. Pause provides the current task, location, build and Resume. Gameplay navigation must survive color differences, muted sound and left/right-handed HUD layout.

**E03 acceptance:** in a muted, unfamiliar-player sample, the player notices a hit, identifies deteriorating health, recognizes actual healing and can point to the next required action. Functional probes cover small repeated hits, damage-over-time, shield, zero-heal, simultaneous heal/damage and threshold oscillation. A cue existing in source is insufficient.

## 6. E04/E11 · Dramatic states, camera and visual hierarchy

### 6.1 Distinct states

| State | World/body treatment | Camera and UI | Sound and exit |
|---|---|---|---|
| Traversal / anticipation | District light; stable posture; one meaningful upcoming landmark | Stable follow and contextual destination, no constant shake | District ambience; let the player hear space |
| Horde escalation | Visible arrivals from actual entrances; background environmental disturbance; clear crowd flow | Brief framing adjustment only when it exposes a safe decision | Pressure cue rises; release when actual pressure falls |
| Player frenzy | Warm gold accents and an assertive upper-body pose; attack cadence reflects the real buff | Duration/rhythm accent at the existing combo meter; brief onset emphasis | Distinct entry, sustained layer/cue and clear decay; no false buff after expiry |
| Boss reveal | Boss enters with a physical effect on its environment; pose establishes tool and intent | One short authored reveal with enough arena context, then combat frame | Signature preparation cue; no incidental joke over entrance |
| Boss combat | Boss/contact/escape boundary separate from ordinary crowds | Fit hero, relevant attack and escape area; full bar/name retains current function | Threat cues outrank loot; relief on recovery |
| Boss phase transition | New posture and an actual changed tactical arrangement | One phase emphasis; no recurring cinematic for every attack | Distinct transition, then room for new tell |
| Critical health | Persistent danger shape and restrained red edge signal | Protect center, don't stack additional camera motion | Sparse warning if enabled; clear recovery |
| Victory / emotional aftermath | Threat effects settle; actors release tension; physical route consequence | Camera settles before reward UI; scene may follow | Pressure layer resolves; intentional silence when prescribed |

Player frenzy is a power state; a hostile horde is a pressure state. They must remain distinguishable when simultaneous. Avoid using the same red wash for both frenzy and injury. Shape, movement and posture carry information independently of palette. Spell out the actual buff in optional detail; preserve the existing name/localization unless approved otherwise.

### 6.2 Competing-event policy

Highest priority: death/critical danger and imminent attack geometry. Next: player position/HP and required input. Next: boss commitment and meaningful object consequence. Next: optional guidance and narrative. Last: loot flourishes, incidental barks and decoration. A phase cue may not hide a lethal boundary. A heal benefit must remain legible during frenzy. A phone call cannot obscure the current safe lane. Queue or suppress decorative cues rather than multiplying them.

Provide an explicit conflict fixture containing boss tell + low HP + heal + frenzy + object interaction + pending dialogue. Review it on mute, reduced motion and lowest quality. Important events retain recognizable feedback; lower-priority events can reduce to compact world-local cues. Retain all existing flash-budget rules: no more than three flashes/second, no high-frequency strobe and no new exemption for a “wow” event.

### 6.3 Camera and occlusion

Use authored reveals only at safe entry or protected transitions. During combat, show the hero, the relevant damaging extent and a usable escape region. Fit-to-threat overrides decorative zoom. Damp follow changes so ordinary directional input does not repeatedly zoom or whip the view. Reduced motion retains framing information through static composition and fades.

Foreground stalls, tall props, captions, loot and effects must not conceal the hero/contact foot or a critical tell. Use controlled occlusion fading/cutaways where existing scenery would hide gameplay; do not reveal concealed game information the player has not earned. A carried large object may obscure the upper body but not the grounded position or imminent collision. Telegraph contrast must be checked on each district floor. Never solve this solely by making every effect brighter.

## 7. E12 · Sound and silence as part of the same action

Synchronize audio with contact/release, not merely animation start. A chainsaw rev, chain tension, knife slice, wooden break, metal impact, restored health and shield block each need a distinct audible role at phone-speaker scale. Keep threat warnings above pickup chatter; limit repeated simultaneous impacts and vary samples/pitch within a coherent material identity. No permanent barrage of identical loud clicks.

Use the current eight tracks and approved cues first. Do not claim independent stems exist in mixed music files. Score transitions can use current tracks, short authored cues, ambience and intentional silence. District-specific emphasis: İstiklal transit/street enclosure; Galata vertical stone/chain resonance; Karaköy dock/wedding distance; bridge wind/water/line tension; Eminönü market/boat/chain; Sirkeci rail/clock/enclosed platform. These are sound-direction requirements, not permission for real brands, political/religious targeting or unapproved licensed recordings.

The Captain aftermath deliberately releases pressure; victory music waits until the emotional handoff completes. The home motif connects memory, farewell and departure without replacing unique scene identity. Verify cue audibility through speaker/headphones, mute equivalence, silent-switch behavior and background/resume. Haptics reinforce events only where actually supported and tested; gameplay never depends on vibration.

## 8. E13 · Progression, failure and return: make the improvement tangible

Keep the repaired Attributes/Perks structure. Each improvement states **what changes, what earns it, what it affects, what it costs, and whether it persists**. Temporary cards reset each run; practice earns attribute-specific readiness; Street Cred purchases eligible perks; mastery belongs to a weapon; gear must be equipped; Kaan's relationship is earned through play. Do not merge these mechanically simply to shorten a label.

### 8.1 Screen responsibilities and information order

Use existing screens/tabs and approved layout patterns. This is an information hierarchy refinement, not permission to add six more top-level menus. Keep primary actions in familiar thumb-reachable positions and use progressive disclosure for formulas.

| Surface | First information/action | Detail on demand; common confusion to eliminate |
|---|---|---|
| Live HUD | Current HP, immediate objective/direction, available active skill/Dash under existing controls | Temporary weapon ranks and meaningful buff state; no permanent-progression tutorial across a fight |
| Pause | Resume first; exact current task/location; health; this-run weapons/passives and recipe progress | Distinct permanent-loadout summary, concise controls, settings and message log. Never imply pausing grants a new permanent upgrade or that a locked recipe is already active |
| Level-up card | What choosing this changes now, with rank and the actual changed property | Compatible evolution path, owned/missing partner and meaningful survival alternative. Do not present a generic DPS increase if the benefit is control, coverage or a conditional effect |
| Attributes | Each attribute's current rank, practice/readiness and resulting benefit | Show which actions earn its practice. State that damage taken does not earn Grit under current rules. The action applies the ready rank to that attribute, not an unexplained global pool |
| Perks / skill-tree view | Current eligibility, specific effect, prerequisites and Street Cred cost | Show links only for actual dependencies. An ineligible perk states the missing rank/resource and a reachable way to earn it. Strength practice and heavy-attack eligibility are different rules and need separate explanations |
| Arsenal / mastery | Chosen starter; what is unlocked for the card pool; weapon-specific persistent mastery | Separate equip from unlock and mastery from temporary run rank. Use the player's actual weapon state in previews; no max-rank animation that falsely promises present power |
| Gear | Equipped item versus owned alternatives, slot and actual stat effect | Before/after comparison against the currently equipped item, with compatibility/conditional effects visible. Owning an item alone must not appear to apply it |
| Kaan / relationship | A concise record of meaningful help when relevant to the story | Progress follows actual shared play; it is not another spendable upgrade tree or a guaranteed combat buff if none exists |
| Clear/result | Earned rewards, completed objective and next destination | What persisted, what reset, one useful next upgrade/experiment. Give the major story handoff attention before sales or item grids |
| Return/map | Current district/destination and one useful next action | Resume, continue story or deliberately replay for a named goal. No repeated badges for already-read tutorial pages |

Use a consistent scope treatment: **this run / permanent / this weapon / equipped / relationship**, localized through keys rather than literal English labels in code. Text can appear in item detail; compact icons reinforce it after teaching. Do not rely on six nearly identical currencies/icons to communicate scope.

### 8.2 Concrete upgrade journey to verify

Start with a real earned save containing a ready attribute and at least one perk whose prerequisite differs. From the map, a new player should find the ready attribute, identify which play earned it, apply it, see the true before/after benefit, then understand why the eligible/ineligible perk costs Street Cred. Selecting the perk explains which equipped/available weapons it affects. Returning to a run preserves the permanent change but resets temporary card ranks. This must work without the developer explaining it.

For a conditional effect, prefer an accurate example over a misleading total: identify the qualifying attack family and show its change in the existing preview/lab if available. Do not add a separate mandatory training level. A permanent upgrade deserves a restrained confirmation and updated value; it does not need a full-screen celebration or automatic equip change. If the player cancels, nothing is spent and their navigation context remains.

On a perk detail, show compatible owned/equippable weapons and one short practical example. On applying an attribute rank, show the actual before/after effect and one accessible next action. Avoid statistically precise damage promises where conditional multipliers make them false. A weapon preview uses current rank/upgrade state, not a supplied maxed showcase. Recipe advice remains present-tense during play and retrospective on results; preserve the pass-7 fix.

### 8.3 Failure, reward and return

Defeat shows the actual final cause, significant recent contributors where available, retained rewards and **one actionable next experiment** based on this attempt. Examples of intent: cross the cast then approach during the reel; step out of the charged lane; try a survival card when abandoning a recipe would help. Never present a purchase as the sole recommended recovery. Retry is direct, preserves earned settlement exactly once and skips already-seen staging by default. Do not deliver a joke over an emotional loss or contradict an unresolved outcome.

After a break, the map or pause should recover the current destination, chosen permanent improvement and unfinished run plan without a notification cascade. Keep optional replay modes discoverable with a clear difference in play and reward. A return should offer a desired experiment or story continuation, not threaten lost rewards or a relationship penalty.

## 9. E08 · Monetization with an enjoyable independent free path

### 9.1 Owner-approved boundary

There is **no level at which ads or purchases become necessary to advance**. Do not create an abrupt enemy-stat jump, star gate, resource drought, punitive grind or hidden purchase-aware scaling to induce payment. All story progression and gameplay power remain earnable. Practice prerequisites and relationship progress cannot be bought around. No paid random loot, surprise interstitials, fake countdowns or mid-combat/mid-story offers. These reaffirm business-plan §5.1 and the owner's latest explicit agreement.

Buying convenience must not cause stronger enemies to erase its benefit. Declining an ad leaves ordinary retry/continued play intact. A paid player is also entitled to challenge; sell optional value without destroying the encounter designs. Monetization is not a substitute for weak retention or poor boss teaching.

### 9.2 Product treatment

| Placement | Proposed value | Presentation and free route |
|---|---|---|
| After first district, approximately L5 | First optional catalog introduction | Initial experiment only; show after the result/emotional scene, at most one unsolicited offer per session; dismiss immediately, do not repeat after dismissal that session |
| Rewarded result bonus | An explicitly stated additional reward | Base earned reward settles first; decline/no-fill leaves it intact; no ad before seeing the victory |
| Optional revive | One clearly described second chance under existing revive/star rules | Immediate retry remains equally reachable; never tune a boss around mandatory revival |
| Cosmetics / direct bundles | Outfit, cat styling or clearly listed goods | Exact contents visible, no randomized paid loot; no paid silhouette/tell advantage |
| Street Cred / material convenience | Bounded acceleration for eligible perks/mastery | Current prerequisites and chapter caps remain; test the zero-spend path; spending cannot replace practice or relationship action |
| Monthly card / pass | Transparent convenience and optional goals | Existing business model is design context; no new live service in this slice, no threatened story loss or misleading renewal terms |

L5 is a testable introduction hypothesis, not a mandated revenue wall or proven conversion optimum. Compare earlier/later/no-popup variants only in a future authorized experiment; do not run live A/B tests or add SDKs under this brief. Keep the slice's real monetization out of scope. Design and, where needed for usability, show clearly labeled local previews; ordinary play must not contain a fake purchasable product or a button that pretends an ad actually ran.

### 9.3 Measurement and guardrails

Measure the free/no-ad/no-revive campaign independently from optional convenience. Report failed attempts, time to useful improvements, ability to change build, and any repeated resource bottleneck. Track future conversion/revenue alongside continuation, return, decline behavior, purchase satisfaction and refunds where legitimately available. Existing revenue targets are hypotheses, not authorization to degrade the free game. No sensitive personal data is needed for these local tests.

Rewarded-ad delivery later must clearly describe the reward, require affirmative opt-in and honor refusal. The current [AdMob rewarded-ad requirements](https://support.google.com/admob/answer/7313578?hl=en) support that boundary. This document authorizes no financial transaction or integration work.

## 10. E14 · Adjacent requirements that keep the experience coherent

**Input integrity:** one-thumb motion remains responsive through attacks, hit reactions and short world beats. Holding a prop, a sack or an escort role must not create visually impossible hand occupancy. Define weapon hand ownership and permissible secondary effects explicitly; no extra arms or two incompatible carried objects rendered in the same grip. Never display an unavailable dodge/jump/duck solution.

**Interruption and state:** pause, tab/app background, lock, interrupted dialogue and relaunch cannot duplicate rewards, skip required actions or strand a cinematic. A presentation scene never owns campaign facts independently of the sim/result settlement. Restore input without a queued pre-scene Dash or attack firing unexpectedly. Exact protocol is in the scene appendix.

**Access:** mute, reduced motion/flashing, larger text and low quality must preserve actionable information. Provide shape/posture cues alongside color and sound; use the existing accessibility settings rather than add several overlapping modes. Essential touch targets honor the project's mobile sizing and safe-area rules; thumb occlusion must be reviewed on both control sides.

**Performance:** more animation is not permission to exceed character memory or sustained frame-time budgets. Use reusable rigs/atlases and authored animation where appropriate, profile peak crowds and texture transitions, and reduce decorative particles before removing body articulation or danger tells. Retain the project's low-tier 30 fps objective; name the device and report frame-time tails, not a desktop average presented as phone evidence. Current exact device baselines must be measured again after the art changes.

**Accessibility reference:** redundant visual/audio channels and non-color-only cues align with [Xbox Accessibility Guideline 103](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/103). Acceptance is this game's actual muted/accessible playback, not a claim of blanket standards certification.

## 11. Execution contract

Start with a reference slice: Arda locomotion; a walker/runner/heavy contrast; damage and heal; knife/chain/chainsaw/cable; Cook entry→combat→aftermath. Verify these together, then apply the established quality to all required rows. A successful reference is an internal checkpoint, not permission to hand back the rest unfinished. Complete the scene, combat and acceptance appendices before requesting the next audit, except for explicitly identified unavailable human/device evidence.

Continue independent work while another item needs assets, hardware or owner input. Prepare exact source-asset briefs, crop/pivot/hand/foot requirements and representative in-game views before requesting additional imagery. Use the approved art workflow and preserve current ImageGen identity. Do not introduce an external animation tool, dependency, paid service or large wholesale regeneration without the required authorization. This PRD itself is not an art-generation request.

No unsolicited chat messages to other agents, no automatic commits/pushes/merges and no post-30 production are authorized here. The owner will hand this packet to the execution chat. The final evidence packet must reconcile this PRD, H01–H18 and pass 7 by requirement ID, distinguish verified work from remaining judgment, and keep the first-30 expansion gate intact.
