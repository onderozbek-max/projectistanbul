# NO SIGNAL — consolidated creative direction and completion contract

2026-11-17. Owner request: reduce piecemeal review/implementation cycles and address the entire experience, including why bosses still feel ordinary. This is an **audit extension and proposed production brief**, not implemented gameplay or a claim that every possible issue has been discovered.

**Read the newer [holistic experience redesign](HOLISTIC-EXPERIENCE-REDESIGN-2026-11-17.md) first.** It adds concrete gameplay decisions, local consequences and progression/pause architecture, and governs the expanded implementation scope. This document remains the detailed ten-encounter choreography and 36-area coverage contract, alongside the [sixth audit's frozen evidence](GAMER-AUDIT-PASS6-2026-11-17.md). Do not revive closed defects. The [31–100 encounter spine](CHAPTER1-L31-L100-READINESS-2026-11-17.md) remains a future design brief. No expansion is implemented here.

## 1. What was missing from the previous feedback

The sixth audit was substantial verification and diagnosis. It was **not a sufficiently complete specification of the desired finished experience**. “Improve boss movement” leaves too much to interpretation. An agent can add a pose, pass a test and still deliver a stiff fight. “Add a motif” can produce three notes without an emotionally directed scene. “Add more variety” can multiply content while the player repeats the same decision.

The missing layer is coordinated direction: what the player notices, decides, does, feels and remembers, and how the body, camera, light, sound, mechanics and reward support that moment together. This document supplies that layer and a completion contract. Implementation should resolve a whole player experience before marking its component tickets done.

The quality ambition is appropriate. Studio size and the tools used are not player benefits. The player should notice confidence, coherence, responsiveness and personality. The strongest identity is **a personal journey home in which knowing the streets and helping people becomes a survival skill**. Prioritize that over copying another game's surface effects.

A compelling game can support years of voluntary return, but nobody can guarantee endless enjoyment or commercial success. The target is repeated satisfying decisions, learning, surprise and attachment, with a clear stopping point and a reason to return. A complete checklist is necessary production discipline; it is not sufficient evidence of fun.

## 2. Evidence labels and current boundary

- **Observed:** seen in the sixth audit's live desktop sessions/assets or reported directly by the owner. Includes owner feedback that boss fights lack occasion, agility and expressive attacks.
- **Code-confirmed:** a current implementation fact; it may explain a symptom without proving the player's reaction.
- **Proposed:** a concrete creative/design solution for implementation and comparison, not a newly discovered bug.
- **Unverified:** needs actual motion/audio/touch/player evidence. Mark it open rather than invent a verdict.

The implementation chat is already repairing atlas body scale and the recovery-transform issue. At this extension's checkpoint, four prototype files had changed from the sixth audit: `tools/prepare-art.js`, `tools/lib-art-frames.js`, `js/view/art-raster-chars.js`, `js/view/art-raster.js`. Treat body-scale defects as **under repair, not re-certified failures of the new work**. The movement probe below uses unchanged sim/config files. No complete suite was rerun against this moving implementation; the prior frozen result remains 46/48, not a verdict on later edits.

**Additional coverage correction:** the first five levels each have a named finale: Cook1, Switchkeeper2, Roaster3, Linekeeper4, Vatman5 (`config-levels.js:216`). The sixth audit covered those levels in simulation but gave insufficient separate creative treatment to2–4. The slice's presentation review must cover **ten named encounters**, not merely Cook plus the six district bosses.

## 3. What “finished” should feel like

| Timescale | Desired player experience | Failure signal |
|---|---|---|
| Every second | My movement is responsive; I can read the important danger; hits have a clear cause and weight. | Sliding actors, missed input, clutter, damage from something I could not see. |
| Every exchange | I recognize an intention, choose a response and feel the consequence. | Circling works forever; all danger is an interchangeable red shape. |
| Every level | This place asks something specific of me and visibly changes when I succeed. | New background, same waiting task and identical exit ritual. |
| Every district | I learn a rule, use it creatively, face a distinctive showdown and receive a human/spatial payoff. | Another health bar followed by another chest. |
| Every session | My build or understanding improves; the story goes somewhere; I leave with a concrete next intention. | Small percentages, vague teasers, too many reward screens. |
| Return visit | I remember what I was doing, can resume quickly and have a tempting experiment or challenge. | Homework, forgotten currencies, compulsory recap or dependence on a streak. |

The standard is a connected sequence, not six independently attractive screenshots.

## 4. Bosses: root causes, not just extra effects

### 4.1 Existing features must be acknowledged

**Code-confirmed:** zoom, camera punch, boss grade/vignette, defeat effects, phase sequencing, recovery vulnerability and multiple spatial attack shapes already exist. The Cook even has a proximity camera adjustment (`cook-fx.js:7`). `arena-evolve.js` applies a shared boss grade; its config uses a1.2s ramp, a red color overlay at0.10 alpha and vignette0.22. Generated-level finisher focus explicitly suppresses its horizontal pan/zoom (`fx.js`, focus branch). Captain has a special vertical framing adjustment.

Therefore “add zoom and color” is too vague. The task is to **direct the existing systems consistently, ensure they are actually visible, and protect combat readability**. First compare the current effect in motion; don't stack another overlay on top of it.

### 4.2 Movement lacks differentiated intention

**Code-confirmed:** ordinary boss movement is mostly direct chase, or a distance-band chase/retreat with timed alternating strafe (`bosses.js:move`). Warning, pause and recovery frequently set velocity to zero. The Captain has a distinctive anchor tow, but walking still animates the idle image through lean/squash. Ticket Man's renderer selects three body images and uses a small bounce during locomotion. Generic bosses share walk/windup/hurt/contact choices, with exposed state using the hurt image.

These choices can make a large actor feel like a token that slides, freezes and emits a hazard. More speed alone will produce a faster token.

**New code-confirmed inconsistency:** the non-`keep` movement branch returns before multiplying by phase `spdMul`. The phase2 probe records Captain1.08m/s despite1.12 multiplier, Fisherman1.16 despite1.14, Keeper1.05 despite1.07. Bride/Ticket Man do apply their phase multiplier. [Probe output](telemetry/gamer-pass6-direction/motion-probe.json). Decide whether the intended phase change includes chase speed; make configuration and behavior agree, then rebalance. This small numerical correction is not the animation solution.

**Proposed movement contract:** each encounter owns a posture, preferred distance, purposeful reposition, committed attack movement, deceleration and recovery. Heavy characters can be slow and still feel alive. Agile characters should make readable steps/lunges around a purpose, not random zigzags. Preserve the hero's responsive control and the one-thumb premise.

### 4.3 The apparent attack-vector problem has two parts

**Code-confirmed:** directional attacks already use a hero-relative vector; the Bride has angular rope sweeps, Fisherman aimed casts, Captain aimed tow, and Ticket Man horizontal signal bands plus aimed punches. Some world attacks should remain aligned with rails or dock lanes. Rotating a train arbitrarily would weaken the place's logic.

The limitation is often the **visible body vocabulary**: a sideways painting can deliver an upward/diagonal hit while the weapon/hand does not sell that direction. Also, two patterns repeated in a fixed sequence can become predictable even when their math supports360 degrees.

**Proposed:** match facing, shoulders, hand grip, tool tip, trail and hit region for eight tested target directions. Author a small front/three-quarter/back set where needed, using compatible mirrors; do not demand eight full atlases for every actor. Do not rotate a perspective-painted body like a flat board. Aiming may follow the player during an explicitly readable preparation stage, then locks; committed attacks must not secretly turn to catch a successful dodge.

### 4.4 Choreograph each attack as a complete sentence

For every attack, create one record with: trigger/context; chosen target; aim-lock time; anticipation; travel/contact; damage interval; interruption rule; follow-through; recovery; safe response; punish opportunity; cue/art/SFX IDs. Values belong in config; gameplay stays in sim. The view consumes the same intention/timing facts rather than guessing from unrelated timers.

Required visible sequence:

1. **Intention:** stance, gaze and tool placement say what is about to happen.
2. **Commitment:** weight transfers; target direction locks at a readable point.
3. **Action:** acceleration, step, cast or swing carries the body through the attack.
4. **Contact:** damage, weapon tip, dust/impact sound and brief appropriate hit feedback agree.
5. **Follow-through:** momentum finishes; clothing/rope/tool settles.
6. **Recovery:** a distinct exhausted/reloading/unbalanced pose makes the opportunity visible.

Keep existing telegraph minima unless deliberately revising and recording the design. Decorative easing cannot move the visible impact away from the damage event. Reduced Motion removes camera flourishes, not the essential pose that communicates the attack.

**Acceptance:** review at normal speed, slow motion and actual phone size, both facings and eight approach directions. The action remains understandable on mute and without reading a HUD sentence. No anatomical resizing, grip snapping, moonwalking, abrupt pose reset, infinities used as animation progress, or long held attack frame masquerading as recovery.

### 4.5 Presentation grammar: occasion without obstructing play

**Proposed entrance:** for a major district boss, use a short authored reveal within its existing intro budget: settle the foreground crowd, a recognizable silhouette/gesture, a district sound, the boss's name, then an unmistakable return of control. The boss should do something that explains its relationship to the place. First encounter receives the full short beat; retries use a compact recognition cue. Early named finales get lighter treatment so Vatman remains an escalation.

**Camera:** use hero, boss, imminent attack footprint and usable escape space to define the required frame, accounting for HUD and thumb occlusion. A modest introductory push-in—start by comparing roughly5–8% for a safe beat—is a proposal, not a blanket combat setting. Ease back before a long-range attack. In live combat, prioritize keeping danger and escape visible; zoom out when necessary. Do not recenter under an ongoing drag in a way that makes steering feel different. A settled two-character composition is more valuable than constant camera breathing. Avoid routine camera rotation in portrait play.

**Lighting/color:** create district-specific contrast, not a universal brightness increase. Separate boss silhouette and ground hazard from scenery; subtly reduce decorative background competition and use a local rim/ground-light cue where appropriate. Keep existing semantic danger colors stable. The current full-screen red grade is a candidate for replacement/refinement, not an additional layer to retain automatically. Verify bright outdoor, dim station, grayscale/color-accessible and minimum-quality views. No repeated flashing or exposure pumping.

**Sound:** a recognizable entrance accent, body preparation, contact and recovery each have a purpose. Duck incidental chatter/pickup noise around the tell. Preserve room for ordinary combat between accents. Shared music can be supported by district ambience and a short motif arrangement before making six new tracks. Actual listening is still required.

**Defeat:** one final physical action, an environmental release, a short breath, then character response/reward. Existing defeat profiles are a starting point. Do not show the same celebratory confetti rhythm over Kaan's grief. Remove live damage threats before an unskippable emotional close-up; the owner must not lose health while the director takes control.

### 4.6 Pattern design: dynamic, learnable, fair

Keep a recognizable first exchange. Later choose among a small compatible set using distance, occupied lanes, last action and recovery—not unseen knowledge of the next input. Use deterministic selection and bounded repetition. Each variation must have a tell; random ordering alone is not depth. Phases should change a spatial relationship, not only speed, color and pattern count.

Test close, far, clockwise orbit, counterclockwise orbit, corner, diagonal crossing, intentional bait, weak earned build and strong replay build. Neither one permanent orbit nor constant forced sprinting should be the universal answer. A safe recovery must be physically reachable by the weapon/build that the lesson expects. Auto-targeting should not make the opening feel wasted: `nearestEnemy` currently picks nearest valid enemy without exposure priority. Inspect add diversion at missed windows before introducing any soft priority; avoid a new manual targeting control unless the one-thumb design truly needs it.

No adaptive cheating, compulsory long invulnerability, global HP inflation or more simultaneous adds to disguise weak choreography. If an excellent build deletes a replay boss, that can be satisfying. First-clear presentation and later mechanical mastery are separate acceptance cases.

## 5. Ten encounter direction cards

These are **proposed direction using current mechanics**, not ten mandatory new combat systems. Preserve canon and the existing first 30 identities. Add mechanics only where a readable existing exchange cannot meet the stated decision.

| L / encounter | Physical personality and decision | Staging, phase development and payoff |
|---|---|---|
| 1 Cook | Broad planted body, short purposeful approach, clear cleaver shoulder preparation and follow-through. Teach “leave the committed hit, approach the recovery.” | Keep new art/camera. First throw and combo must feel related to his arms and feet. Short personal confrontation, not a giant chapter-boss ceremony. Preserve saved-food comprehension. |
| 2 Switchkeeper | Deliberate hook reach and rail command; a pivot/weight shift should distinguish close attack from lane control. | Compact named-threat cue. Read a lane then approach the hook miss. No full cinematic reward ritual immediately after Cook. Test shared Keeper atlas mapping after scale repair. |
| 3 Roaster | Weighty forward burst contrasted with a braced roasting/throw gesture; no generic sideways sliding. | Make the environmental/cart lesson matter during this confrontation. Distinguish “avoid the projected zone” from “bait the body.” A short local obstacle resolved, not another identical boss banner. |
| 4 Linekeeper | Nimble lateral footwork around a wiring task; relay and knot gestures look different. | Early wires teach the encounter's spatial vocabulary. Phase adds a different crossing problem. Current hardhat-derived body needs an unmistakable named-threat silhouette/tool treatment at phone size. |
| 5 Vatman | Heavy authority: plants to command tram/bell, commits bodily to charge/lever, visibly struggles after a miss. | First major district reveal. Teach a reachable punish window and avoid the293s orbit tail. Phase changes where it is safe to stand, not simply how much faster he chases. Departure opens/changes the route and earns the call. |
| 10 Tower Keeper | Mass and counterweight: pulls, braces, lunges, decelerates. Distinct rope/tool gesture before weight fall. | Correct anatomy first. Let the tower mechanism explain danger; pair arena-scale framing with a readable body opening. Bell/courtyard becomes quiet on victory. |
| 15 Dock Bride | Most visibly agile of this group: readable lateral steps, pivot into rope sweep, committed release rather than teleports. | Dock carts stay aligned with dock lanes; rope changes angular pressure. Let smart positioning turn an existing cart opportunity into advantage. Phase recombines lane and sweep without trapping every escape. Portrait/art must show the action, not just a bouquet pose. |
| 20 Big Fisherman | Braced cast, rod bend, visible load and reel; deliberate weight shifts along the bridge. | Compare failed cast recovery and caught-line struggle visually. Nets change footwork, not just a hidden speed stat. Keep geometry clear near bridge edges. Kaan's arrival is the emotional reward after the conflict, not lost behind loot. |
| 25 Captain | Heavy grounded steps, shoulder-driven anchor throw, body pulled by taut chain, skid and breathless reset. | Spice clouds and tow should form one readable positional problem; his existing tow can clear dust. Make that cause visible. Signature sound/gesture, restrained grade; farewell receives silence and character acting rather than victory noise. |
| 30 Ticket Man | Precise steps and a definite planted punch; signal command comes from an arm/tool gesture distinct from melee. | Finish the currently three-pose body performance. Track bands test learned movement, missed punch invites approach. Frame both track threat and boss. Station passage physically opens, then the already-correct Bazaar motivation lands. |

**First-five cadence decision:** keep these finale identities initially, but differentiate local threats from major bosses in reveal length, UI weight, attack complexity and reward pacing. If uncoached players still report “a boss after every short corridor,” compare a reduced-ceremony version before cutting encounters. No automatic removal of approved content is proposed here.

## 6. Whole-game coverage register

This register is deliberately broader than the boss example. “Validate” means an unanswered risk, not a claimed defect. Each row has an observable closure condition. Rows already passing should be retained, not rebuilt.

| ID / area | Current issue or open risk | Direction and closure condition |
|---|---|---|
| G01 Identity | Distinct city/story can disappear behind generic combat/UI. | Each district has a recognizable place, useful local interaction and human reason to cross it. A player describes this game's appeal without naming its inspirations. |
| G02 Cold start | Attractive restaurant gives way to text-only memory/rule cards. | Illustrate existing beats, preserve the current short budget/skip. First input follows dramatic action naturally; no extra lore wall. |
| G03 Handoff | Arrival postcard says NEXT2 beforeL1 is played; trivia breaks urgency. | Arrival explains “where/what now”; results explains “what next.” Player never thinks a level was skipped. |
| G04 Input | One-thumb promise competes with three actives; keyboard cannot establish ergonomics. | Keep movement while using an ability comfortably; explicit initial ability names; test left/right hands, canceled touch and overlay return. No extra combat buttons for new boss mechanics. |
| G05 Autoattack intent | Nearest-target selection can divert a punish from the boss; visual aiming can disagree with intent. | Instrument missed openings and demonstrate aiming behavior through motion/brief feedback. If needed, use bounded target preference that preserves nearby defense and player predictability. |
| G06 Collision | Actor art, props and effect footprints can imply different boundaries. | Feet/ground shadow and actual collision agree at visible scale. Show blocked routes clearly. Test corners, ropes, water, carried objects and diagonal dash. |
| G07 Movement craft | Chase/stop patterns, sliding bodies and direction-limited poses. | Ten encounter cards plus hero/enemy locomotion checks; planted steps, readable turn and finite transitions. Faster is not the acceptance criterion. |
| G08 Hit feel | Lots of available effects do not guarantee a coherent impact. | Match contact, recoil, enemy response, sound and limited hit-stop. Heavy/fast/ranged impacts are distinguishable. Chain effects cannot hide a lethal tell. |
| G09 Threat hierarchy | HUD, speech, loot and effects compete with arena information. | Required threat→hero/action→objective→reward→ambient detail. Queue incidental text. Inspect worst-case phone frame, not an empty arena. |
| G10 Enemy ecology | Variety in names can still reduce to a larger crowd chasing. | Spawn complementary roles with an intentional escape; show approach direction. Repetition varies through role combinations, not arbitrary HP/stat escalation. |
| G11 Hazard fairness | L13 recurring pressure; L19 andL26 unresolved overlap. | Use existing trace cases; every mandatory lesson has a readable route out. Death recap explains cumulative damage as well as final attacker when needed. |
| G12 Boss occasion | Common mood/UI and repeated local finales reduce significance. | Three tiers of intensity: local named threat, major district duel, emotional climax. Distinct reveal/action/aftermath; quiet creates contrast. |
| G13 Camera | Ad hoc per-actor adjustments, generated finisher restrictions, risk of zoom hiding escape. | Shared framing policy with encounter requests and clear priority; state transitions smooth and input stable. Threat fitting wins over decorative push-in. |
| G14 Lighting | Shared red overlay can flatten district differences and semantic contrast. | Stage actors and danger through selective contrast. Compare neutral/current/refined grade on device; keep whichever reads and feels best. |
| G15 Route decisions | Many authored consequences share a hold-ring input. | Give each required action a visible world result and different positional question. Keep familiarity of controls; remove waits whose outcome is already obvious. |
| G16 Pacing | Long tails, repeated escalation and menu interruptions can flatten excitement. | Track travel/choice/action/relief time separately. Preserve shorterL4/L9; diagnoseL2/L5/L17 tails. Do not refill quiet travel with filler enemies. |
| G17 Build identity | Unfocused clear path rarely evolves; focused path can sacrifice survival. | Earned melee/ranged/control profiles with clear plans and useful payoff windows. Strong choices change behavior, not merely displayed percentages. |
| G18 Upgrade choice | Branch benefit/future identity and “Heavy” applicability may be opaque. | One practical benefit, affected equipment and next recipe step in relevant detail. No confusing taxonomy tutorial or universally obvious best pick. |
| G19 Consumables | Full-health food fixed, cap-spent state still needs comprehension; cart pickup may be accidental on touch. | Saved/ready/spent states distinct; explain only nearby/relevant. Test deliberate carry/cancel and heal after damage without a lecture. |
| G20 Permanent growth | Training, mastery, perks, gear and bond compete for understanding. | A single clear next improvement from results; each detail says how to earn it, what changes, and what persists. Bought/unlocked/equipped states are visibly different. |
| G21 Reward rhythm | Currency/chest/node can dominate a more meaningful success. | Major clear visibly changes a place or relationship. Present one primary payoff before optional detail; no serial mandatory taps for every subsystem. |
| G22 Failure/retry | Actual attacker is fixed; one wrong build or long replay intro can still discourage. | Accurate cause, retained progress, one useful next experiment, quick retry; skip already-seen exposition safely. Failure feels recoverable without a mandatory purchase. |
| G23 Character attachment | Useful Kaan mechanics can be less memorable than a meter. | ExistingL23→L25 reciprocity lands visibly; joining/farewell carry distinct acting. Companion contribution is legible but does not steal the player's agency. |
| G24 Dialogue | Fit passes; jokes/calls can arrive at the wrong emotional/mechanical moment. | Native TR/EN facts aligned; each line does character, information or humor work. Suppress repetitive/ill-timed barks; don't add lines just to increase variety. |
| G25 Cinematics/comics | Reused portrait expressions and text cards undermine polished art. | Four highlight scenes receive intentional gaze, posture, prop and composition changes; environmental action connects gameplay to panels. No extra long movies needed. |
| G26 Music | Eight tracks, dynamic switching and motif exist; perceived sameness/mix unverified. | Critical listening for transitions, tonal fit and repetition; arrange existing stems/cues only where files support it. A motif needs emotional association, not merely repeated notes. |
| G27 SFX/haptics | Technical voice limits and assets don't prove clarity or physical satisfaction. | Tell/impact/pickup hierarchy, synchronized contact, restrained tactile response where supported. Speaker, headphones, mute and interruption pass. No unsupported iPhone haptic claim. |
| G28 Art consistency | High-quality individual images can disagree in angle, scale, light or ink weight. | One in-game contact-sheet review across actor/prop/ground/comic/icon use. Fix crops, pivots and composition before regenerating assets. No retired ordinary-play fallbacks. |
| G29 UI/navigation | Progression now clearer; visual density, tiny detail and background bleed remain candidates. | Fresh player completes results→upgrade→equip→next run and back navigation unaided; large text remains legible; locked content explains the next attainable action. |
| G30 Accessibility | Technical fit/motion toggles do not prove usable threats. | Equivalent essential tells on mute, reduced motion, low quality and color-accessible view; inspect minimum readable sizes and safe areas. No tiny text as overflow fix. |
| G31 Replay | Daily/Night Shift/Nightmare already exist; more modes are not the missing foundation. | Each visible mode says what plays differently, expected commitment and reward. Replays test mastery or a build experiment. Keep story continuation primary for new players. |
| G32 Return motivation | Streaks and daily rewards exist; voluntary return is unmeasured. | Quick “where I was/what I planned” resume; optional experiment or story hook. Validate return reasons, not only sessions started or streak preservation. |
| G33 Economy | Too many rewards can become chores; build enjoyment must not depend on grind. | Earned-save path supports reasonable experimentation and understandable costs. Audit sinks/unlocks as the chapter expands; no silent paywall inserted to repair retention. |
| G34 Reliability | Full suite had two fixture integration failures; current edits underway. | Stable build, full regression green, no duplicate reward on retry/resume, robust failed-art recovery and save relaunch. A test report does not replace device acceptance. |
| G35 Performance | Desktop verification cannot certify sustained mobile animation. | Baseline and dense fight on target phone, frame-time tails/heat/load time/audio resume. Budget effects; preserve threat clarity when quality falls. |
| G36 Expansion | Legacy31–100 lacks authored milestones; repaired recipe boundary doesn't prove Kaan continuity. | Same earned save29→35 retains skills, support, memories and presentation. Expand only from a proven five-level block and shared factual ledger. |

## 7. Make ordinary combat worthy of replay

Bosses cannot carry a survivor-like if the minutes between them are unsatisfying. Review the basic loop with all cinematic effects disabled first: movement, weapon targeting, crowd response, XP collection, build choice and traversal must remain satisfying. Then restore presentation and verify that it clarifies rather than hides the loop.

**Give builds different jobs.** A melee plan rewards entering an opening and managing knockback; a ranged plan rewards line and distance; a control/environment plan rewards manipulating space. These roles should emerge from existing weapons/terrain, not a new class system. Review each family for one distinctive behavior, one cost and one useful synergy. A bigger trail without a different practical use is not sufficient progression. Strong broad builds are valid; evolution is not a compulsory success condition.

**Make enemy combinations ask questions.** A blocker and a ranged threat can require a different route from fast pursuers. Introduce roles legibly before stacking them. Account for encounter geometry and carried props. If a selected combination has no usable response at the player's current movement/ability state, reschedule it rather than hiding the unfairness with extra healing.

**Protect player intention.** A cart lift, heal pickup, dash or card selection must feel deliberate. At a boss opening, a nearby trash enemy should not unpredictably consume the only meaningful attack. If the system prioritizes it, the rule must be understandable and a reasonable reposition possible. Do not add a manual aim button simply because autoattack has not been tuned.

**Offer meaningful excess power.** Let a successful build clear a dangerous lane spectacularly or finish a familiar foe fast. Preserve a positional question in first encounters without scaling every enemy to cancel the player's growth. Do not make every level harder in raw numbers; relief and competence are rewards.

**Measure decisions and attention.** Add instrumentation only for unresolved questions: chosen target/reason, duration of no meaningful progress, build plan/offer acceptance, hazard overlap, damage during a recovery opportunity, interruption/quit point. Do not generate a giant telemetry backlog with no decision it serves.

## 8. Dramatic and emotional direction

Finish the existing four highlights as complete sequences:

| Sequence | Required emotional turn | Visual/playable expression | Payoff to preserve |
|---|---|---|---|
| Restaurant | Ordinary familiarity becomes immediate danger. | Specific patron reaction, threat in the room, a decisive knife action, illustrated memory fragments, then direct playable escape. | Player knows who they are and what to do without a lore lecture. |
| Kaan joins | Solitary survival becomes partnership. | Kaan visibly helps or is helped, exchanges a specific human reaction, then walks into the same journey. | His later support feels like this person, not a purchased passive. |
| Captain farewell | Victory has a personal cost. | Held towel/gaze, an environmental stillness, quiet motif, then a deliberate decision to continue. | PreserveL23 memory variants; avoid gag/loot noise over grief. |
| Station departure | A local struggle resolves; the route home continues. | Physical passage reveal, shared orientation toward it, varied portrait/action composition and restrained musical return. | The already-correct Bazaar/highway motivation remains clear. |

Dialogue should not repeatedly explain an action the animation already made obvious. Conversely, do not remove the one line that explains why the apartment matters or why the route detours. Review story by player knowledge, not just per-file string quality. A clear destination plus changing relationships is more compelling than endlessly withheld information.

For return visits, remind the player of the last meaningful intention in a short contextual line/card that can be dismissed. Do not replay a lengthy compulsory recap. This is a proposed use of existing story/meta presentation, not a new narrative system requirement.

## 9. Reduce the number of implementation/review cycles

### One coherent work queue

Keep the sixth audit's concrete defects and this document's direction in one acceptance ledger. Map each implementation task to one or moreG IDs and an encounter card. Closed items stay closed unless a changed dependency or new evidence reopens them. “Looks better” and “added animation” are not completion states.

**Recommended delivery sequence:**

1. **Stabilize:** finish current body-scale/render safety work and repair test fixtures. Record exact build hashes and pending device checks.
2. **Build two reference fights:** use Vatman for a heavy spatial boss and Bride for an agile angular boss. Deliver movement, attack body, framing, lighting, sound, readable recovery and aftermath together. Include their approaches and rewards, not only isolated arenas. This is internal integration work; it need not pause for owner approval between every pose.
3. **Apply the demonstrated standard to all ten named encounters:** retain each identity and different ceremony tier. Cook/Captain/Ticket Man overrides are part of the same review, not exemptions. Verify the full approach→fight→reward flow.
4. **Complete the normal-run/progression loop:** resolve target/hazard/build issues andG02–G05/G15–G22; finish the four emotional highlights. Test earned saves, not maxed debug builds.
5. **Run the complete acceptance packet once the build is stable:** automated suites, representative recordings, two languages/settings, physical-phone sessions and uncoached comprehension/replay observation. Consolidate remaining failures into one short closure list.

This is not permission to implement new paid dependencies, change platform or expand the slice. Proposed gameplay changes follow the existing decision/deviation records. View-only improvements must remain view-only. Camera state must not influence sim difficulty; time-control changes require explicit deterministic gameplay handling.

### Mandatory implementation handoff packet

For every named encounter, supply one row containing actual asset/renderer path, attacks, movement rules, camera/light/audio treatment, phases, earned-save tests, known limits and completion state. Include a normal-speed recording of the whole exchange, plus slowed contact review. A screenshot cannot demonstrate agility. Show both weak first-clear and strong replay examples for major bosses; include successful and failed punish opportunities.

For the whole slice supply: first-session recording; a middle-district run; a late run; one failed-run→upgrade→retry flow; the four highlight scenes; fresh-save and earned-save progression summary; regression results; phone observations. Use a small representative matrix with deliberate worst cases, not dozens of redundant renders.

**Do not mark an experience done when:** code exists but is unreachable; an effect only works in a preview; the pose list is complete but bodies slide; attack telegraphs work but contact is visually elsewhere; text fits only after becoming too small; the evolution fires after meaningful combat ends; the boss is “challenging” only because the opening is unreachable; the reward is invisible behind a popup; or tests pass while the phone remains untested.

### Independent coverage without endless expansion of scope

Use three separate review passes within the same delivery: functional correctness; normal-speed experiential review; uncoached player observation. Reviewers can be the implementation agent's own deliberate passes plus the owner/player group; this does not require new agents or external services. Combining all three into one “tests passed” checkbox is the source of repeated surprises.

Not every stylistic preference blocks expansion. Block on broken understanding/control, unfair damage, incoherent core acting, missing build/payoff, unstable device behavior or a repeated boredom signal. Treat minor decorative preferences as polish backlog after the standard is met. This prevents the masterpiece ambition from becoming a moving finish line.

## 10. Definition of done for the first 30

**Technical:** stable full regression green, meaningful art-failure recovery, save/reward integrity, no known material crash or input failure. Physical-phone performance and resume/audio behavior are measured, not inferred.

**Combat craft:** ten named encounters meet anatomy/contact/facing/footwork standards; major bosses feel different through action and place; camera/lighting protect information; no universal orbit dominates every duel; strong builds still feel strong.

**Progression:** an uncoached player understands what persists, how to improve and what they are building. More than one earned build style is viable and reaches a noticeable payoff before play ends. Defeat supplies a useful next experiment.

**Pacing/story:** players can recall different district decisions, understand the route and care about at least one character moment. Quiet beats feel earned; rewards do not erase them. Arrival/finale transitions are coherent and retries respect time.

**Player evidence:** use the existing phone script with 5–8 uncoached players as a formative round, mixing genre familiarity. Observe moments of confusion, rote input, frustration and delight. Offer a free stopping point; record whether they choose another run and why. Invite a later return without pressure. This is directional evidence, not a statistically valid retention or “beats Survivor.io” claim.

**Expansion:** only then implement31–35 and prove continuity with the same earned save. Preserve the existing 70-level narrative spine and variation/relief principles. A completed slice is a reproducible production standard, not merely the best-looking opening level.

I can recommend that the slice is ready against this bar. “Masterpiece” and market success will ultimately be earned from players. The purpose of this brief is to remove vague implementation targets and prevent avoidable piecemeal fixes—not to promise that a document can guarantee that judgment.

## 11. Evidence added in this extension

- Current source review: `sim/bosses.js`, the four district boss modules, İstiklal finale wiring, `config-bosses.js`, `view/fx.js`, arena grade/config, Cook/Captain/Ticket Man renderers, generic atlas pose selection, targeting, touch input and replay-mode entry logic.
- [Phase movement probe](telemetry/gamer-pass6-direction/motion-probe.json): isolated desired movement in phase2; no gameplay mutation persisted. It is not a full collision/movement or player balance test.
- Sixth audit screenshots, two boss policy matrices (96 executions total), thirty-level metrics, campaign records and full regression logs remain the empirical baseline.
- This extension did not record a new physical-phone session, listen to the mix, manually replay all 30 or certify the implementation edits currently in progress. No gameplay files/assets were changed by this audit extension.
