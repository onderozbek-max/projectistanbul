# First 30 Bölüms — holistic experience redesign and implementation brief

2026-11-17. Requested by the owner after the sixth audit and its creative-direction extension. **Proposed design, source-informed audit, and integrated acceptance contract.** No gameplay was changed by this document. This is the entry point for the next implementation pass.

## 1. Verdict, scope and evidence

**The current evidence does not establish a masterpiece. The biggest remaining opportunity is player agency, followed by coherence and physicality.** More attractive effects will not by themselves change a run whose dominant decisions are circling, accepting upgrades, and waiting in an interaction zone. Conversely, adding many disconnected mechanics will make an already complex game harder to understand.

The desired identity is: **I survive by understanding Istanbul, improvising with its objects, and looking after people who remember what I did.** The city should affect tactics; tactics should affect a small number of human outcomes; those outcomes should make the journey home personal. This connects combat, level design, progression and story instead of treating them as separate quality checklists.

This brief adds concrete gameplay and interface design to the [sixth audit](GAMER-AUDIT-PASS6-2026-11-17.md) and [36-area creative direction](MASTERPIECE-DIRECTION-AND-CLOSURE-2026-11-17.md). Those documents remain supporting evidence and detailed animation direction. This document takes precedence for the integrated scope where the earlier direction favored polish alone. Already verified fixes must remain closed unless they regress.

Evidence boundaries:

- **Observed previously:** selected normal desktop play, portrait UI, asset/animation fixtures and story scenes recorded in pass six; the owner's direct experience of ordinary-feeling bosses.
- **Measured previously:** frozen-build campaign and balance diagnostics, including one evolution in the unfocused 30-clear campaign, the L5 boss-policy tail and L13 hazard failures. These are diagnostics, not human retention measurements.
- **Source-confirmed in this extension:** street-prop automatic sequence; elemental reactions; Kaan support/repayment; attribute training and perk gates; current pause composition. Source references are below.
- **Proposed:** new interactions, opportunity layouts, memory callbacks, revised screen hierarchy and target pacing. They require implementation and comparison, not retrospective claims that players already enjoyed them.
- **Unverified:** physical-phone motion/audio/touch comfort, ordinary-player comprehension and voluntary return. No new 30-level manual playthrough or listening study was performed for this extension. The implementation workspace is moving; reconcile newer fixes before acting on old defects.

There is no honest promise of finding every possible flaw or making everyone play forever. The practical goal is to remove known blockers, deliver distinctive choices and moments, and supply enough evidence that the next audit evaluates a substantially improved connected game.

## 2. The high-level redesign

| Timescale | Player question | Required response from the game |
|---|---|---|
| Moment to moment | Where can I move, and what is about to hit me? | Responsive movement, legible threats, convincing contact and a visible escape. |
| A combat exchange | What can I make happen here? | Bait an attack, reposition a prop, exploit terrain, or protect someone; the resulting change is visible. |
| A level | What is different about this place? | One central spatial problem, one meaningful variation, and a resolution in the world. |
| A build | What kind of survivor am I becoming? | A behavior the player can name and use, with understandable tradeoffs and a useful payoff window. |
| A district | What did we achieve, and what did it cost? | A distinctive showdown, changed place or relationship, and an intelligible next destination. |
| A return session | What was I doing, and what do I want to try? | Quick orientation and an optional concrete experiment, without requiring a tour of currencies and menus. |

Three connected additions form the gameplay leap: **deliberate street improvisation**, **small route opportunities with remembered consequences**, and **reciprocal companion play integrated with those opportunities**. They reuse current props, route milestones, lure/status systems and Kaan support. They do not require another currency, open-world physics, a new control scheme, or an exponentially branching plot.

Distinctiveness comes from their combination. “I wedged a market cart to protect Kaan; he held the crowd while I finished; later he remembered” is more memorable than “I unlocked another +2%.” Do not implement every level as that same sequence: the level table below separates instruction, variation, mastery and relief.

## 3. Newly explicit audit findings

| ID | Evidence / problem | Player consequence | Required response |
|---|---|---|---|
| F01 | `sim/street-weapon.js` gathers only while stationary near a threat, then automatically lifts, swings through all configured arcs, hefts and throws. | A spectacular action can remain largely automatic; the player cannot prepare with it in a quiet moment or choose to preserve cover. | H01: deliberate commitment and a bounded choice between weapon use and placement. |
| F02 | `sim/env-rules.js` and `config-env.js` already support gas ignition, wet-tile reactions, foam, cables and debris. | Adding the same systems again would increase complexity without increasing discovery or agency. | Author readable setups and useful choices around the existing reactions. |
| F03 | `sim/kaan-support.js` already covers shared tasks, follows later dashes and recognizes repayment. | Another generic companion proc would duplicate functionality. The existing contribution can still pass unnoticed. | H03: stage recognizable reciprocal actions and connect them to player choices and aftermath. |
| F04 | `view/screens.js:showPause` and the pause markup present level/time, resume/settings/restart/quit, and build slots. They do not render the current objective or its next physical action. | Returning from an interruption asks the player to reconstruct the task from memory. | H07: make pause an orientation and build-understanding screen. |
| F05 | `config-stats.js`: training produces attribute-specific READY points; Street Cred buys perks separately. `meta-stats.js` still presents plus/minus allocation rows and a summed ready count. | A familiar allocation presentation can suggest a shared pool that does not exist. This is a comprehension risk, not proof every player is confused. | H06: attribute-specific “Apply rank” actions and explicit earn/effect/unlock relationships. |
| F06 | `config-tree.js:canLearn` checks attribute rank and Cred, not ownership of previous perks. `meta-tree.js` lays out tiers in branches. | Connecting nodes like a conventional prerequisite tree would imply false dependencies. | Preserve actual rules and show rank thresholds, independent purchases and costs accurately. |
| F07 | Grit training includes damage received; Intelligence principally trains through hacks; Charisma through rescues/events. | Training can incentivize taking damage or make some branches depend heavily on authored opportunity supply. This is a balance/incentive risk to measure. | Audit earned rank trajectories, intentional-damage farming and opportunity counts; revise incentives where evidence supports it. |
| F08 | Heavy Hands acts on weapons with `heavy:true`; Strength training categorizes melee kills separately. | “Melee” and “heavy” are not interchangeable. A player can train a branch with a weapon its first perk does not help. | Every perk names affected owned/equipped items; explain training category versus effect tags. |
| F09 | Earlier audit: strong environmental variety still often asks for stationary dwell; non-focused evolution payoff is scarce. | Surface variety can conceal repeated decision-making and weak build anticipation. | H02/H04/H05: vary the actual positioning question and make build intent reliable enough to plan around. |
| F10 | Existing route scenery, HUD calls, combat speech and large effects can compete at phone scale. | Players may miss the very mechanics and story the game invested in. | A single attention policy, with presentation budgets and threat priority across all systems. |

## 4. H01 — Street improvisation: an actual tactical verb

**Keep:** current portable-prop art, contact-driven strikes, swept collision, breakage, enemy responses and training hooks. **Change:** acquiring a useful prop should create a short tactical opportunity, not immediately run a nearly identical noninteractive combo for every object.

### Interaction contract

1. Authored eligible objects have a consistent small grip/foot-position cue at useful range. Ordinary decorative tables do not all shout for attention. Show this cue only for the nearest eligible candidate.
2. Move into its grip position and settle to commit. Retain the current 0.60-second commitment as the initial tuning baseline, make progress visible, and cancel immediately on movement away or Dash. Do not enlarge the accidental-pickup area. An authored object can be picked up before a threat arrives; nearby-enemy existence must not be the only eligibility signal.
3. While carried, normal movement and emergency Dash remain available. Provide a guaranteed escape from carrying even when no placement footprint is nearby: the proposed default is that Dash safely drops the object at the departure position and performs its ordinary evasion. Teach this once; never secretly convert Dash into an aimed throw. A hit or interrupted animation cannot strand the player in a holding state. Tune carry penalty by object; do not punish use so heavily that ignoring the mechanic is always superior.
4. Use the object as a temporary automatic weapon when enemies enter its readable reach. Preserve the current ordinary-weapon suppression while `streetHolding` is active unless a tested, documented design change justifies otherwise. Advance wear on meaningful contact, with a finite configured lifetime to prevent indefinite carrying; idle air swings must not consume the entire payoff. Show the useful state on the object itself, not a new permanent HUD meter. A dropped object retains its wear and remaining lifetime; repeated pickup cannot reset its power or farm training.
5. At an authored placement footprint, settling briefly places the object as temporary cover or a wedge. The footprint previews the physical result and has a movement-cancelable progress cue. Start with a proposed 0.35-second placement dwell and tune on touch. No combat radial menu or extra permanent button.
6. The existing final throw can remain the offensive endpoint, but its trigger, landing preview and destination must be understandable. Do not silently retarget behind the camera. Placement and attack cannot both consume one object in the same simulation step.

Limit the first implementation to **three physical roles**, mapped to a small subset of current eligible props. Other props can retain their existing behavior until brought up to the same contract; their cues must not promise unsupported placement.

| Role | Offensive use | Alternative use | Tradeoff / visual truth |
|---|---|---|---|
| Cart or compact crate | Short directional shove/throw through a crowd lane | Wedge an authored shutter or shelter edge | Giving up the attack buys breathing room; wheels/crate footprint and collision agree. |
| Bench or small table | Broad, weighty crowd-clearing sweep | Temporary cover at an authored marked shelter position | Useful against a specific approach, vulnerable from elsewhere; do not show an impossible lift of a huge fixture. |
| Bin or light street object | Faster, smaller disruption; recognizable material response | Noise lure at an authored alarm/lure point | Redirects eligible ordinary enemies briefly; bosses and immune roles visibly follow their own rules. |

Reuse existing lure/cover/status behavior. This is not freeform construction: placement sites are authored, path-checked and limited. No permanent blockage, required-quest prop destruction, bottomless lure loop, environmental damage farming or unlimited reward source. Required progress always has a baseline route even if the object breaks or is ignored.

**Authored introduction:** L3 teaches one offensive use with enough space to notice grip→weight→contact. L6 shows that preserving an object as cover can be valuable. L14 introduces the lure alternative using the existing shutter ecology. L22/L23 combine the learned choice with Kaan. Later appearances remix those roles rather than add more controls.

**Acceptance:** from normal movement, a player can intentionally pick up, abort, fight with and place the object; a non-interested player can walk past. Every use has a visible tactical consequence. Verify near a boss, at full health, during Dash, on pause/resume, at the camera edge and with simultaneous prop destruction. Benchmark unassisted completion and damage, not just an impressive sandbox animation. Record each proposed timing/damage change under Deviations.

## 5. H02 — Local opportunities and “the street remembers”

The campaign needs decisions with consequences, but not a second campaign hidden in branching dialogue. Introduce **six bounded opportunity arrangements** inside existing routes, using current people, props and objectives. Replace low-value waiting/travel; do not append six chores.

An opportunity has two readable approaches, a visible immediate tradeoff, a short consequence, and sometimes one later acknowledgment. Choosing through position preserves one-thumb play. The player should see the safer/slower or exposed/more-useful route before committing. This is not a secret morality score; neither choice should quietly make the campaign unwinnable or remove essential story.

| Level | Proposed opportunity | Immediate consequence | Small remembered consequence |
|---|---|---|---|
| 7 | Escort along a sheltered edge, or clear an exposed direct passage | Different crowd approach and escort movement, not just different timer length | L9 environmental/music acknowledgment consistent with whether the person reached safety; do not invent a rescue if they did not. |
| 12 | Preserve a mooring-side safe pocket, or use the movable prop to clear the crowded lane | Defense versus a faster positional opening | A later dock approach visibly retains the chosen configuration where geography makes sense; otherwise use a brief local aftermath, not teleporting props. |
| 17 | Use cover to establish a rescue foothold, or draw the threat away and return | Two valid ways to create rescue space | A named, restrained reaction after safety; an optional later supply/help acknowledgment using existing reward types. |
| 22 | Keep a market cart as a weapon, or place it to protect the crossing | Offensive strength versus a safer working position | Kaan can refer to the action at the next quiet beat if he was present and saw it. |
| 27 | Guide through an illuminated exposed lane, or restore a sheltered passage | Threat visibility versus initial exposure/work | The guide visibly recognizes the player's assistance; the consequence is paid before the slice ends. |
| 29 | Arrange station light/lure interaction to reveal threats or redirect a group | Information versus crowd control, with a route available in either state | L30 approach/ambient line acknowledges the resolved station state without changing essential boss rules. |

These are proposed layouts, not claims that these options already exist. Adapt their geometry to the authored map while preserving the decision and current canon. Do not require all six to create extra dialogue panels. A changed light, open shelter, person waving or distant music can carry a consequence better than a textbox.

Persist a small explicit set of facts, not a general narrative graph. Define when each fact is set, whether it is run-local or campaign-first-clear, which scene reads it, and how replay behaves. Replays must not farm a one-time reward or overwrite an established story fact inconsistently. Failure before completion cannot mark a person rescued. Missing optional help uses a neutral coherent line, never a chastising retention trick.

**Acceptance:** demonstrate both approaches, failure/retry and save/relaunch for every arrangement. A player can explain what they chose and see the result without opening a journal. No extra mandatory level duration solely to display a callback. At least three consequences should be understandable with dialogue muted/skipped.

## 6. H03 — Kaan as a relationship the player enacts

The current cover, dash-follow and L23 repayment mechanics are the foundation. Make their states and intent clear rather than adding a duplicate support power.

- L20 joining: the scene establishes why Kaan accompanies Arda. The next playable situation proves his usefulness before presenting bond arithmetic.
- L21: one clean shared action. Kaan takes a readable position, gestures toward the threat, intervenes, and settles. Do not make him appear as an unexplained effect from offscreen.
- L22: the player's cart/cover choice changes where the pair can operate. Kaan uses the selected safe position rather than walking through geometry.
- L23: his opening intervention leaves a readable reciprocal opportunity. The player can draw a threat away, use the existing Dash repayment, or protect the position with H01 cover. Register equivalent useful actions through explicit rules; reward the action once. Do not require one invisible special gesture.
- L24: a short callback in a genuinely safe moment establishes that he noticed. No callback if the action did not occur.
- L25: the Captain scene pays off Kaan as a person. Let Arda's posture/response reflect established help with a small variant, preserving the same canonical loss and onward journey.
- L26–30: Kaan remains visibly useful in appropriate tasks; he does not become a passive portrait after his showcase level. His help is bounded so the hero still makes the decisive move.

No new bond currency, compulsory affection purchase, companion micromanagement button, or rescue interaction that immobilizes the hero through an unreadable lethal overlap. Bond UI explains the benefits actually implemented now; future milestones are not presented as usable powers.

**Acceptance:** an observer can point to what each person did during L23, and a player can name why Kaan is useful. Verify helped/not-helped, missed opportunity, low/high existing bond, companion reposition and interrupted scene paths. Telemetry must distinguish an offered opportunity from successful player repayment.

## 7. H04 — Level design and encounter composition

Stop treating enemy count, route length and ring duration as the only pacing controls. Each level needs an encounter card: **central decision; geometry; enemy roles; relevant object; lesson; variation; resolution; quiet beat**. Reusing controls is good; repeating an identical tactical answer is not.

Use complementary roles deliberately: a lane-denying enemy plus a flanker creates a repositioning problem; a dangerous priority target behind a crowd creates a targeting problem; a telegraphed environmental hazard plus cover creates a timing problem. Do not combine every role simultaneously. Schedule mandatory first lessons with space for one recognizable response; later combinations test that learning.

Refine the existing encounter/spawn systems with authored constraints, not a new opaque adaptive-difficulty layer. Give each combat section an allowed pressure combination and escape topology. Seeded variation may change entry side, eligible prop position or one role composition; it must preserve essential cues, required objects and a reachable exit. No unannounced mid-run difficulty rubber-banding.

A hold task needs at least one active spatial decision: work while exposed, move to safety and lose a little time, redirect a crowd, create cover, or open a different approach. Once its world action visibly completes, end the wait. If a repeated hold cannot justify its time through choices, shorten or replace it. Do not remove every quiet section; quiet with anticipation or character meaning is different from empty walking.

### Required first-30 design pass

All rows are change/acceptance direction; reconcile current fixes first. Boss choreography is specified further in H11 and the prior direction document.

| L | Central decision and freshness | Concrete finish / verification |
|---|---|---|
| 1 | Read a committed attack, evade, use the opening | Restaurant→street continuity; food states; teach movement before stacked HUD concepts; Cook is a personal local threat. |
| 2 | Read rail/lane control and cross deliberately | Switchkeeper hook/command visibly differ; diagnose long route tail before cutting space; compact aftermath. |
| 3 | Choose and commit to a street-object attack | First H01 offensive lesson; walking beside a cart never forces a pickup; Roaster's body reinforces the lesson. |
| 4 | Change a hazardous route through wire interaction | Each cut changes the viable path or threat pattern; no three identical stationary repetitions; Linekeeper moves with purpose. |
| 5 | Bait the Vatman, use a reachable punish window | First major district occasion; approach resources and boss policy diagnosed separately; no endless orbit stalemate. |
| 6 | Solve a hoist/counterweight space problem | Short relief after L5; introduce preserve-versus-use cover choice; show physical clearance, not only a filled meter. |
| 7 | Choose how to escort through pressure | H02 sheltered/exposed choice; follower response and safety acknowledgment; distance and visibility remain clear. |
| 8 | Redirect a crowd with the bell | Player sees the crowd change direction; surviving the new approach tests the rule; leave useful time for build payoff. |
| 9 | Cross with an intentional moment of exposure | Keep shortened travel; bridge reveal and previous rescue echo supply anticipation and continuity. |
| 10 | Read counterweight timing and Keeper recovery | Body scale/feet/tool consistency after current repairs; victory changes courtyard sound and space. |
| 11 | Use the cargo hook to create an opening | A concise arrival, not another long escalation; hook contact and crowd displacement are causally connected. |
| 12 | Preserve safety or clear the mooring lane | H02 dock opportunity; rope tension, boat movement and walkable collision agree. |
| 13 | Read and change tram points under bounded pressure | Repair overlap through timing/geometry; separate toxic, blast and tram claims on the same escape; test known failing seeds. |
| 14 | Manipulate shutters/lures to redirect pressure | H01 lure choice; opening one side visibly changes crowd behavior; no universal safe camping strategy. |
| 15 | Read agile angular pressure, punish commitment | Bride's rope/cart interactions and body agree; a first clear shows her identity without arbitrary invulnerability. |
| 16 | Position around fishing-rod threats | Diagnose focused-build losses versus expected-power wins; teach priority/range instead of assuming more DPS. |
| 17 | Establish rescue space and return deliberately | Two H02 approaches; safe foothold; clear return/haul state; resolve bot tail separately from human usability. |
| 18 | Use screens to shape an approach | Short, legible cover application; distinguish safe side and flank vulnerability on low quality and mute. |
| 19 | Anticipate the wave and choose when to brace | Approach attrition and wave fairness tested separately; readable warning remains outside thumb/HUD obstruction. |
| 20 | Bait a cast, then exploit the reel recovery | Fisherman's rod and body sell the line; strong builds still feel strong; Kaan joining receives the primary reward beat. |
| 21 | Recognize a partner's contribution | Clean Kaan cover demonstration; modest threat composition; no tutorial wall or abrupt new menu tour. |
| 22 | Spend the cart on offense or protection | H01/H02 meaningful choice; carrying alters routing; Kaan and object collision remain coherent. |
| 23 | Return help while managing a task | H03 reciprocity using established verbs; action acknowledged visibly; no single hidden qualifying gesture. |
| 24 | Time a market signal to create passage | Trolley/crowd consequence clearly differs from L8 bell; quiet callback follows the action, not its danger. |
| 25 | Use Captain's commitment to change the fight | Anchor tow, dust clearing and recovery form one problem; farewell owns the emotional tone before loot. |
| 26 | Cause the station departure under readable pressure | Review brute/bloater approach losses; train motion follows the action; reset tone after the farewell. |
| 27 | Choose a guiding route with different exposure | H02 light/shelter choice; guide has readable intention; no repetition of L7 with a different portrait. |
| 28 | Manipulate clock timing rather than simply wait | World rhythm visibly changes; show the next useful interval; music/animation timing supports the lesson. |
| 29 | Choose visibility versus redirection | H02 station-light/lure choice; darkness never conceals mandatory telegraphs; carry a comprehensible state into L30. |
| 30 | Combine signal reading and bodily evasion | Ticket Man phase changes the positional problem; station departure and Bazaar intention resolve the slice. |

**Acceptance:** each row has an ordinary-play capture and a written statement of the decision actually offered. Adjacent levels cannot all be summarized as “stand in a circle until the same wave finishes.” Compare consecutive play, not only isolated attractive screenshots. Preserve different lengths: L11/L18 can be brisk while a major duel has room to breathe.

## 8. H05 — Builds that change what the player does

A large arsenal is not enough if normal players rarely experience its defining transformation. The earlier unfocused campaign's one evolution and focused campaign's survival problems require a complete build-economy review, not another isolated pity rule.

Use three test intentions across earned saves: **close-range crowd control**, **ranged priority damage**, **area/terrain control**. They are diagnostic archetypes, not new mandatory classes or currencies. For each, specify its strength, exposed weakness, useful object interaction and memorable payoff. Compare weapon behavior in actual combat at phone size: reach, targeting, cadence, knockback, terrain reaction and evolution must be visibly distinguishable.

- Keep existing focus/reroll and recipe assistance. Make the player's current intended recipe visible in the card choice and pause detail; do not add another overlapping “focus” resource.
- Cards should show the immediate change, behavior identity, and any applicable recipe step. Quantitative preview derives from current simulation rules. “More damage” alone is inadequate for a sidegrade whose real benefit is coverage or control.
- Offer a viable survival alternative when pursuing a narrow offensive recipe. Do not secretly guarantee every desired card, or make focus universally mandatory. Audit bad-luck tails and unavailable prerequisites separately.
- For a deliberately pursued feasible evolution, target a meaningful playable window: initially test payoff before the final third of suitable longer runs, or enough time for at least two substantive exchanges. Short arrival levels need a smaller satisfying upgrade, not artificial padding to fit a full recipe.
- Evolution presentation demonstrates its changed attack immediately in a safe readable exchange; it cannot be only a name banner, brighter trail, or power increase arriving after the last meaningful enemy.
- Remove false choices: an item that loses in almost every relevant context needs a role, a change or removal from that offer pool. Preserve tradeoffs; do not balance all weapons to identical behavior and DPS.
- Evaluate whether ordinary auto-targeting wastes a clear boss opening on a trivial nearby add. If reproduced, use a brief, range-valid exposed-target preference with stable switching and no firing through invalid geometry. Do not add a targeting button merely to solve a selection rule.

**Acceptance:** three earned profiles complete the first 30 or produce actionable failure evidence; record recipe opportunities, picks, survival sacrifices, evolution time, meaningful hits and remaining encounters. Supplemental/maxed debug builds are a separate stress test. Show before/after clips for each currently available base/evolved family, including contrasting close/ranged/control pairs. Total damage alone does not establish build identity.

## 9. H06 — Progression architecture a player can explain

Retain **Develop Arda** as the entry point. Consolidate the explanation around two primary pages, **Attributes** and **Perks**, with weapon mastery reached from the Arsenal and bond reached through Kaan. “Street Tree” can remain flavor, but the interface must teach the real rules.

| System | Earn / spend | Changes | Persists? | Player-facing distinction |
|---|---|---|---|---|
| Run weapon/passive ranks | Run XP, choices and chests | Current attack/build | Resets when this run ends | “This run.” A starting weapon is not a permanently owned rank-5 weapon. |
| Attributes | Practice in that attribute; apply its own earned rank | Permanent numerical capabilities; unlock perk eligibility | Yes | “Practice makes this attribute stronger.” There is no shared freely assignable rank pool. |
| Perks | Meet attribute rank; spend Street Cred | Specific permanent behavior/utility | Yes | “Rank unlocks eligibility; Cred buys the ability.” Eligible is not purchased. |
| Weapon mastery | Use the applicable weapon; show actual current rules | That weapon's persistent benefits | Yes | Distinct from both current-run rank and character Strength. |
| Gear | Existing ownership/equip/upgrade rules | Equipped persistent modifiers | Yes | Owned, equipped and upgraded are separate states. |
| Kaan bond | Existing relationship/actions | Implemented shared benefits | Yes | Trust is not Street Cred, and locked future content is not a current power. |

### Attributes screen

Each row shows: name and plain-language role; applied rank; current effect; practice progress; how to train; attribute-specific earned rank when available; next relevant perk threshold. Replace the misleading shared-allocation feel with **Apply Strength rank** or equivalent localized action. Batch applying ready ranks may remain optional, with a preview. Do not silently auto-apply and change save semantics without recording the design change.

Show a concrete current→next effect using the actual formula and current equipment where meaningful. Separate cooldown reduction from attack speed and critical percentage points from relative percent. If no meaningful rounded weapon damage change occurs, show the accurate underlying bonus instead of implying an extra whole damage point. The current secondary-effect disclosure can stay; no six-paragraph glossary on every row.

Practice points already earned for Strength cannot be diverted to Pace. Say that once, contextually, and reinforce it by presentation. A summed “ready” badge can advertise available actions but must not look like a spendable shared wallet.

### Perks screen

Group by attribute. Show current rank on a clear rank track, with thresholds at the real configured gates. Do not draw prerequisite arrows between perks unless those dependencies actually exist. Show two separate requirements: **rank met?** and **Cred available?** A purchase changes the node from eligible to learned. “Train attribute” and “Earn Cred” links retain the selected perk and return context.

Each detail answers: what changes during play; what currently owned/equipped weapons it affects; what it does not affect when that distinction matters; cost; eligibility; whether already active. For Heavy Hands, explicitly derive the affected list from `heavy:true`, not the melee-training category. Explain the category mismatch in relevant detail rather than pretending all melee is heavy.

After purchase, offer a tiny replayable demonstration or current-build example in the existing training/lab surface. It is optional, immediately skippable, and uses the real effect. Avoid preview animations promising stronger knockback/range than the game delivers.

### Incentives and progression pace

Measure all six applied/ready ranks and Cred over earned L1–30 campaigns. Count authored opportunities for hack/rescue training. Review whether Grit's damage-received component makes deliberate harm attractive; prefer successful survival, meaningful defense or bounded encounter credit if that exploit is reproduced. Do not secretly reward idle farming or require replaying a specific level to access a basic branch. Log formula changes and migrations.

**Acceptance:** in an unaided task, a tester identifies what resets, earns/applies one attribute rank, buys one eligible perk, explains why another is locked, and names the resulting combat difference. They can distinguish melee training, heavy-weapon eligibility, mastery and run rank. Automated checks verify the UI's examples against the real modifiers; they do not prove comprehension.

## 10. H07 — HUD, pause, upgrade and results information architecture

**During combat:** prioritize lethal threat, hero/action state, immediate objective, then reward/ambient information. Keep one concise objective sentence with an in-world target cue. At an active task, show its state (“return to the rescue position,” “wait for the opening,” “carry to cover”) rather than only its name and completion percentage. Numbers on the route/bonus/adrenaline bars must not imply the same kind of progress.

Introduce active actions as needed. Dash, Shield and the ultimate need visible names during learning, legible ready/cooldown feedback and consistent placement. Preserve one-thumb movement and handedness. Do not add H01–H03 buttons to an already crowded combat layout. Cancel pointer state on overlays/backgrounding and make resume safe against stale held input.

**Pause primary view:** Resume first; district/level and one-line current objective; the next physical action; current health and relevant danger/task state. Below it, “This run” build with the focused recipe and next requirement. Expand an item for practical stats/tags. Permanent bonuses are a compact disclosure, labeled persistent. Settings/restart/leave are lower priority; restart/leave clearly explain what is retained. No accidental destructive tap beside Resume.

**Upgrade choice:** one clear decision, three readable cards, a short immediate effect and optional detail. Art must identify the tool before its trail. Show an affected-weapon or recipe badge only when relevant. Preserve choice context after opening detail. Avoid stacking a chest, evolution, dialogue and milestone popup on the same frame; define presentation order and resume once.

**Results:** first the world/person outcome, then the useful earned progress, then the next intention. Consolidate rewards into one inspectable result rather than forcing successive screens for coins, practice, mastery, bond and unlocks. Offer Continue, Retry when applicable, and Develop Arda when there is an actionable improvement. The next-level objective belongs here or on the map, not the L1 arrival card.

**Return after a break:** one sentence of current destination and one concrete next action. Optional recent-story recall and build intent should be accessible without blocking Play. No compulsory recap carousel or daily-reward detour.

**Acceptance:** phone-sized screenshots plus task completion for first arrival, busy combat, paused rescue, paused boss, upgrade detail, attribute purchase, defeat, district victory and returning save. Test TR/EN, larger text where supported, low quality, reduced motion, mute and left/right thumb occlusion. Count mandatory taps from victory to next playable movement and remove redundant ones.

## 11. H08/H09 — Opening, narrative and dialogue as part of play

### H08: opening and first-session flow

Keep the current recognizable restaurant and shortened opening budget. Turn the existing three memory/rule cards into visual beats with purposeful expression/prop/composition; do not add a longer movie. Arrival should tell the player where they are and what to do now. Avoid presenting trivia, next-level promises and power percentages before first movement.

The initial sequence should establish: an ordinary personal moment interrupted; why Arda moves; a readable first danger; one successful action; a glimpse of the city as a usable environment; the Cook's committed attack and recovery; a human reason to continue. Teach one concept at a time at the point it matters. Preserve skip/retry state and never force a returning player through the full introduction to retry a failed lesson.

### H09: story and voice

Review **all reachable first-30 narrative in actual play order**, including calls, arrival text, barks, retries, alternate opportunity outcomes, comics and result messages. Fit tests are already useful but do not evaluate voice, repetition, fact order or emotional placement.

Maintain a compact knowledge ledger: what Arda knows, what Kaan knows, what the player knows, why they are going to the next place, and which line/action changes that. Preserve the revised family/home/Bazaar facts and the approved native TR/EN work. Do not resurrect obsolete audit contradictions or reveal later letters early.

For every line, identify its job: reveal character, convey a necessary fact, provoke a decision, land humor, or change the emotional temperature. Cut or rewrite interchangeable encouragement and repeated exposition. A joke needs a setup the player actually heard; its reply must cancel when that setup was interrupted. A factual instruction displaced by combat should reappear safely or remain accessible through the objective, never vanish with a disposable bark.

Give Arda and Kaan distinct intentions and speech rhythms; use current approved characterization rather than adding catchphrases to every line. Humor can release tension but must leave room for the Captain's loss. Local detail should work through people, objects and behavior; players unfamiliar with Istanbul should not need a glossary to understand the emotional stakes.

Direct four existing major scenes: restaurant interruption, Kaan joining, Captain farewell, station departure. Each needs a change of gaze/posture, a meaningful object, a deliberate silence, and a visible change of intention. Comics need purposeful shot variation and expressions, not adjacent identical busts. In-game action should motivate entry into the panel and return from it. Hold sound/loot celebrations when they would break the scene's tone.

**Acceptance:** publish an actual-play-order readthrough with fact flags and trigger conditions. Review every new branch alongside the default path. Verify skip, death/retry, scene interruption and already-seen behavior; essential knowledge remains coherent. Cutscenes must not leave damaging threats active while player control is removed. Supply normal-speed clips of the four scenes with their preceding and following gameplay. Native TR and EN convey the same facts without literal line-by-line translation.

## 12. H10/H11 — Physical combat, bosses and the camera

### H10: all combat, not just bosses

Audit hero movement, turns, starts/stops, Dash, hit reaction, knockback, street-object lift/carry/contact/release, every weapon family, ordinary enemy attacks, deaths and companion actions. A weapon glow cannot substitute for a convincing grip, anticipation and contact. Use shared anchors and finite transition progress; maintain body volume, feet, tool attachment and collision alignment across poses.

Differentiate fast light strikes, planted heavy attacks, recoil-driven ranged fire and area/terrain effects. Prioritize the actual attack shape over decorative trails. Screen shake, hit-stop, flash and sound should reinforce the same contact, remain capped and respect Reduced Motion. Non-lethal hits and lethal hits should not produce identical full-screen spectacles.

Enemies need readable intention and response: turning, preparation, commitment and recovery where appropriate. Crowd motion must not make all enemies slide as one texture. Despawn cleanup, ragdoll substitutes, death debris and loot should not conceal the next danger. Review at actual phone scale before investing in unseen atlas detail.

### H11: complete boss direction

Implement the complete ten-encounter specification in the prior direction document: Cook, Switchkeeper, Roaster, Linekeeper, Vatman, Tower Keeper, Bride, Fisherman, Captain and Ticket Man. Vatman and Bride are useful contrasting references, **not the end of the task**.

Each encounter owns: preferred distance; purposeful movement; body-led anticipation; aim lock; attack travel/contact; interruption policy; follow-through; visible recovery; safe response; punish opportunity; phase development; aftermath. Heavy bosses need convincing mass, agile bosses need purposeful steps and pivots. Raising chase speed alone does neither.

Attack selection should respond to legible context with bounded sequence variation and repetition limits. Avoid blindly random attacks, perfect prediction, offscreen sniping or hidden tracking after aim lock. Preserve readable environmental axes such as rails and dock lanes; show body/tool direction for diagonal and vertical attacks instead of rotating a perspective-painted body like a token.

Treat camera, light and music as one encounter presentation. A short controlled reveal can signal occasion; gameplay framing must contain hero, relevant boss action, threat boundary and escape area. Fit-to-threat takes priority over zoom. Distinguish district atmospheres through controlled contrast and emphasis; a brighter overlay is not automatically better. No additional flash budget or stronger global red wash simply to make bosses “epic.”

Give phase changes a different positional question or interaction, not only faster attacks and more HP. Preserve earned strong-build wins. Do not make a seven-second high-power clear last a minute through arbitrary invulnerability; ensure the first encounter communicates identity through approach/reveal and a fair initial exchange. Separately diagnose weak-build stalemates, add distraction and inaccessible openings.

**Acceptance:** all ten normal-speed encounter clips show approach, movement, all meaningful attacks, phase development, victory and aftermath. Test eight approach directions, both facings, low/high earned power, deliberate opening use and ordinary orbit policy. Record entry HP, boss-only duration, attacks encountered, exposure opportunities and actual damage during them. Confirm current shared-atlas repairs before reporting old shrinking defects as still open.

## 13. H12 — Art, sound and cinematic asset finish

Create a first-30 asset usage inventory: asset/variant, actual screen or level, states, phone-size readability, source/provenance, load behavior and review result. Review **reachable assets in context**, not just a contact sheet: props against their floor; weapons against the crowd; comic text over actual art; menu icons at touch size. Distinguish a missing review from a passed one.

Check inconsistent perspective, scale, lighting direction, outline weight, palette, alpha fringes, repetitive silhouettes, cropped tools, sliding feet, mismatched expressions, obvious recycled compositions and noisy backgrounds behind danger. Critical interactables need an affordance and state change: intact/usable, selected, carrying/working, used, broken. Food needs saved/usable/spent states that remain understandable at full health or healing cap. A protected story prop must not look like an ordinary breakable loot box.

Use current approved ImageGen art in ordinary play. Never reintroduce retired art as a normal fallback for a replaced asset. Missing-asset recovery should retry or show an honest loading/recovery state consistent with repository rules. Generate/prepare only required assets using the approved pipeline; integrate and judge them in game before multiplying variants. Do not regenerate a whole cast merely to report a large asset count.

Review the existing eight music tracks and SFX system by listening through complete transitions, not by inspecting file existence. Establish each district's ambience, a pressure layer/cue, a major-encounter signature and the correct release. Where only a mixed track exists, use available transitions/volume/arrangement intelligently; do not claim independently mixable stems exist. Reuse the home motif with specific emotional association. Silence around the Captain can be more effective than another large cue.

SFX priority: imminent threat and consequential contact over loot ticks and decorative ambience. Distinguish metal/wood/cloth/food and light/heavy impacts where audible on a phone. Prevent identical rapid samples becoming abrasive; cap voices and loudness, preserve attack cues during dense combat, and check loops/clicks/phase-transition seams. Verify contact/SFX sync, mute equivalence and audio restoration after backgrounding. Haptics are optional where supported; do not claim iOS web haptic behavior without testing it.

**Acceptance:** inventory with in-context evidence, plus listening notes for speaker/headphone paths on devices actually available. Review quiet→pressure→boss→story→reward and interruption/resume. Unheard audio is labeled unverified, not “cinematic.” No missing critical action is accepted because its static image looks good.

## 14. H13/H14 — Fair balance, rewards and voluntary replay

### H13: balance and fairness

Recheck known L13 hazard overlaps, L19 approach/brace, L26 arrival pressure, L16 focused-build failures, L2/L5/L17 tails and boss burst/stalemate cases. Use current source, fresh earned saves and reproducible seeds; do not balance solely around an idealized bot or maxed loadout. Separate human control issues, bot targeting faults, insufficient build tools and genuinely unfair geometry.

For each mandatory damage source, verify warning→commitment→damage alignment, available response time and safe-space connectivity. Track offscreen threat, damage chains, overlapping controls and interruption interactions. If no safe response exists in a teaching encounter, fix scheduling/geometry rather than tell the player to acquire more permanent power. If a smart strategy dominates every encounter, add an intelligible counter-context, not a hidden punishment for success.

Boss challenge should develop through spatial demands and combinations. Persistent growth should increase competence and options without making every subsequent boss the same harmless health bar. Compare bottom/middle/top **earned** power distributions and reasonable build mistakes. Numbers, warning timings and new rewards belong in config with deviation notes; record the reasoning behind changed curves.

### H14: reward, failure and replay

Pay off an action in three ways when appropriate: immediate physical effect, visible world/person outcome, and understandable progression. Do not require all three as popups. A district clear should be remembered as “we opened the crossing / Kaan joined / the Captain was lost,” not only as a chest total.

Defeat should identify what happened, what progress remains, and one credible next experiment. Avoid generic advice that contradicts the actual attacker or build. Make Retry fast and preserve learned skips. Explain quit/restart retention accurately and prevent duplicate clear/reward credit after resume or retries.

Use existing replay modes rather than adding another menu tab. Curate a few combinations that change decisions: limited cover, alternate approach roles, a terrain opportunity, a different meaningful build focus. Modifiers must not invalidate telegraphs or require unavailable unlocks. Replaying can reveal another local opportunity or mastery route; the main story remains coherent and optional content remains optional.

Let return motivation come from unfinished curiosity, attachment and a desired experiment. Show one optional concrete prompt such as an available build plan or unexplored approach using actual save state. Avoid mandatory daily chores, streak anxiety, fake urgency, inflated currencies or “come back” interruptions during play. Review monetization surfaces against current business guardrails; do not add or redesign purchases as part of this pass.

**Acceptance:** earned weak/typical/strong profiles, full result/retry/relaunch checks, visible first-clear payoff, and replay comparisons with the same save and comparable seeds. Measure voluntary continuation/return with real people when available; bot clears and self-reported enthusiasm from the builder are not retention evidence.

## 15. Six memorable moments to produce as playable sequences

These are concrete targets for a capture reel, not six noninteractive trailers. Each clip includes setup, player decision, action and aftermath.

| Moment | What the player causes | Why it can be memorable | Guard against |
|---|---|---|---|
| L3: the street becomes a weapon | A deliberate lift and heavy strike open a jammed crowd lane | A recognizable everyday object changes from scenery into agency | Automatic pickup, implausible weight, camera hiding the next danger |
| L8: the bell changes the city | Ringing redirects a crowd and creates a route the player uses | A large world response follows a simple understandable action | A sound cue with no readable crowd/path consequence |
| L14: a trap made from the street | Prop/lure choice pulls pressure to one side; the player takes the other | The player feels clever, not merely stronger | A compulsory scripted solution or an endless safe farming exploit |
| L23: “I have your back” | Kaan creates an opening; the player protects his exposed position | A relationship is expressed through shared action | Invisible qualification, a proc doing all the work, text over lethal danger |
| L25: the fight turns quiet | A readable anchor encounter ends with recognition and farewell | Physical spectacle and emotional restraint reinforce each other | Victory jingles, confetti and shop rewards interrupting grief |
| L30: a route onward | Mastery of signals and evasion opens departure; the pair choose the Bazaar | The slice ends with accomplishment and a credible next intention | Another generic chest followed by an unexplained map jump |

## 16. H15/H16 — Reliability, access and scope discipline

**H15:** verify clean install, existing-save migration, retry, exit/re-enter, pause during every interaction state, background/audio suspension, scene skip, delayed/missing artwork, multiple queued rewards and interrupted completion. Keep simulation deterministic and independent of graphics/settings. Ensure a cosmetic animation cannot block combat or corrupt a save. Reproduce first-six-audit test fixture issues on current source before claiming they remain; repair contracts rather than deleting tests.

**H16:** measure sustained performance on actual available target hardware: frame-time distribution and stalls, enemy/effect load, image memory pressure, audio continuity and thermal degradation. Desktop emulation is a useful layout test, not a physical iPhone certification. Essential tells and rules survive low quality, reduced motion and mute. Check small portrait layouts, safe areas, readable text and handedness throughout, not only on the title screen.

Do not add dependencies, paid services, a new engine/wrapper, general-purpose physics, a new currency or implemented levels 31–100. Preserve current dirty work and owner changes. Follow file/function size, localization, art provenance, narrative guardrail and flash-budget rules. Design changes remain recorded as proposed decisions according to the repo's workflow, with this owner-requested bundle as their implementation authorization when the prompt is supplied.

## 17. H17 — Expansion inheritance, design only

Keep production expansion beyond 30 gated. Update the existing 31–100 plan to inherit this experience architecture, without implementing those levels:

- Each five-level district has a new spatial/decision theme, familiar verbs reused differently, a human beat and a meaningful resolution. It is not five new obligatory systems or five cosmetic reskins.
- Extend object roles and opportunity templates through authored contexts. State the production cost and asset needs before adding another role.
- Maintain the current knowledge ledger, Kaan's continuing role, home/Bazaar motivation and later-letter reveal timing. Distinguish known family facts from the unresolved mystery.
- Chart build, mastery, perk and bond payoffs through 100; expose and solve long empty progression stretches on paper before content production. Do not promise future powers in current UI.
- Alternate pressure, mastery, intimacy and surprise. Preserve replay choices without multiplying canonical branches or requiring one hundred bespoke cinematics.
- Carry forward the same encounter, accessibility, device, save and evidence contracts. More content is not proof that the first 30 were ready.

## 18. H18 — Delivery plan and complete verification

This is **one integrated production pass**. Reference examples establish quality; they do not close the rest of the brief. Implement internally in dependency order and keep progressing across workstreams before requesting the next audit.

| Stage | Work | Exit evidence |
|---|---|---|
| A: reconcile and baseline | Inspect latest work, preserve fixes, map H01–H18 and previous G01–G36 to concrete tasks, identify current failures | Stable source checkpoint, current status, traceability ledger; no stale bug reimplementation |
| B: playable reference | H01 at L3/L6, H02 at L7, H03 at L23, one revised progression/pause path; Vatman/Bride motion references | Ordinary-play comparison of decisions, control and readability; revise weak references before copying |
| C: integrate the slice | Complete six opportunities, object roles, all 30 encounter cards, all ten bosses, allreachable weapon/asset review, full UI flow | Connected runs and asset/scene evidence; no prototype-only feature or forgotten level |
| D: story and mix | Whole first 30 readthrough, four directed scenes, callbacks, district audio transitions, result pacing | Native-language checks, coherent scene paths, actually reviewed audiovisual evidence |
| E: balance and reliability | Earned profiles, known tail/overlap cases, current full tests, save/interrupt paths, available device checks | Archived logs tied to the same final build; explicit failures/limits |
| F: internal experience audit | First session, middle sequence, Kaan/Captain arc, finale, retry and return played in context | Fix remaining reproducible problems; complete handoff packet |

Maintain one ledger with: requirement ID; original evidence; chosen change; files/levels affected; dependencies; numeric/design deviations; automated result; normal-speed evidence; final status. Use **verified**, **implemented but not experientially verified**, or **blocked with reason**. A narrower equivalent solution must demonstrate the same player outcome and explain why; quietly omitting a requirement is not an equivalent solution.

### Required verification coverage

1. Start the repository full regression in the background on a stable completed build; run appropriate focused tests during development. Archive final output and distinguish retries. Do not mark all green while the suite is running. Re-run affected checks after fixes, then the required final complete gate.
2. Run all 30 through the real campaign progression with at least three earned build intentions; separately run fixed-seed expected-power balance diagnostics and weak/strong boss stress cases. No supplied loadout or debug skip may be reported as an earned clear.
3. Interactively inspect ordinary play in every level, including its unique mechanic and aftermath. A driven fixture is useful for states otherwise hard to reach, but label it. Review consecutive L1–5, L11–15, L20–25 and L26–30 for flow, interruption load and cumulative repetition. Automated footage without player-like input does not replace interactive review.
4. Capture all ten bosses and four major scenes at normal speed. Review each base/evolved weapon and all newly changed critical interactables in their actual context. Include at least one crowded worst-case frame and reduced-motion/low-quality comparison.
5. Test the complete navigation loop: fresh launch→opening→combat→choice→pause→resume→defeat/retry→win→growth→next level→close→return. Exercise each persistence boundary and each new opportunity's two outcomes.
6. Use a short unaided human protocol when testers are available: explain current goal; use a prop intentionally; explain one perk purchase; identify a boss punish window; recall a person/action; choose voluntarily whether to continue. Record confusion and observed behavior, not leading satisfaction questions. Five to eight varied testers are a formative target, not statistical retention proof. Do not fabricate or recruit/contact people without authorization.
7. If physical-phone access or independent players are unavailable, finish all autonomous work, package an immediately runnable device/tester checklist and mark those acceptance rows open. Do not substitute “Chrome verified” for physical touch/audio/performance. Missing external evidence prevents a masterpiece/release claim, not completion of unrelated implementation work.

### Handoff packet

Deliver: playable local URL; exact build/source checkpoint; implementation summary organized by player outcomes; completed H/G ledger; all 30 encounter cards; ten-boss attack/recovery table; progression before/after examples; actual-play-order narrative with branch facts; asset and audio review inventory; before/after normal-speed clips; full regression and earned-campaign evidence; remaining defects and unverified device/player questions; updated expansion inheritance plan. Append the concrete results to `reviews/REVIEW-R1.md`.

The final assessment must distinguish **features implemented**, **experience personally verified**, and **external evidence still needed**. “All tests pass” is not the final experience verdict. The implementation agent should return because this integrated package is complete and inspectable, not because it added the first boss animation or wrote another plan.

### Scope crosswalk

| This brief | Prior 36-area contract retained |
|---|---|
| H01–H04: objects, opportunities, companion, levels | G01, G04, G10, G11, G15, G16, G19, G23 |
| H05–H07: builds, growth, information architecture | G03, G05, G17, G18, G20, G21, G29 |
| H08–H09: opening and story | G02, G23, G24, G25 |
| H10–H12: combat, bosses, audiovisual assets | G06, G07, G08, G09, G12, G13, G14, G26, G27, G28 |
| H13–H14: balance, rewards, failure and replay | G11, G16, G21, G22, G31, G32, G33 |
| H15–H18: reliability, access, expansion and closure | G30, G34, G35, G36; integrated verification of every other row |

No gameplay, balance values, canonical text, assets, saves or engine architecture were changed while authoring this brief. No new full-suite or physical-device result is claimed.
