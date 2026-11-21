# Audit12 production PRD — memorable encounters and deliberate replay

20 November 2026. Proposed creative direction for local first30 implementation. Companion: [evidence and verdict](GAMER-AUDIT-PASS12-2026-11-20.md). This is a production specification, not a description of features already observed. Forwarding the [execution prompt](AUDIT12-IMPLEMENTATION-PROMPT-2026-11-20.md) commissions this local scope. Keep decision-log proposals distinct from final owner acceptance.

## 0. Outcome, scope and priorities

**The player should remember an action they caused, an enemy they learned and a person they care about.** The visible leap must happen in ordinary play, without explanatory narration from the developer. Hades is the craft ambition; do not copy its assets/story or mistake that reference for permission to add a manual-attack control scheme.

Preserve accepted Arda locomotion, opening's distinct adult cast, current native narrative/comics, illustrated district art, finite Cleaver geometry, actual Kaan support, health event correctness, useful early evolution and repaired HUD/save/scene lifecycle. Preserve one-thumb portrait play, base-speed viability, separate simulation/view, localization, accessibility and existing monetization guardrails. No Godot migration, dependency/service purchase, post30 content, new currency, forced ad, energy gate, commit/push/merge or publication in this commission.

Work in this order, continuing autonomously through all stages:

1. **P0: correct combat damage/access budgets and presentation scheduling; author the complete L1 and L30 encounter sequences as references.** These are reference implementations, not the scope boundary. Demonstrate an ordinary player exchange before applying more cosmetics.
2. **P0: propagate individual performance, difficulty and direction to all ten bosses; repair the priority weapons and combat feedback.** All ten retain separate acceptance rows.
3. **P1: redesign the repeated spatial/task grammar across all30, stage street/companion highlights and direct major narrative scenes.** Reuse mechanics/assets where appropriate; remove redundant work.
4. **P1: earned starter selection and bounded tactical rematches, then progression/result clarity.** These promote previously deferred D-116 proposals; they were not failed Audit11 obligations. They do not excuse unfinished combat.
5. **P0 before handback: integrated ordinary-play verification and truthful evidence.** Run meaningful checks while producing work, not a large new test framework before fixing experience.

If available time/tools cannot complete the packet, keep working within the authorized task rather than stopping at a pilot. If genuinely blocked, deliver implemented work and a precise incomplete ledger. Never relabel the remaining scope optional or claim that tests certify artistic quality.

## 1. Combat design: exchange before spectacle

### C1. Fix the actual damage budget, not the number of named attacks

For every boss, record legal entry distributions from fresh campaigns: HP, effective weapon ranks/evolutions, passives, permanent modifiers, ultimate availability, crowd count and actual damage by source. Include focused melee, focused ranged, broad and defensive policies, plus weak/injured and strongest legal replay cases. Retain misses/deaths and distinguish first entry from replay.

Identify where damage is concentrated: direct attack, inherited mod, splinter/chain proc, crowd-mediated blast, ultimate, environmental contact. Test a single real hit and a dense crowd. Remove **unintended** multi-hit/proc amplification if found; do not assume it exists or silently nerf legitimate synergy. Attribute legitimate burst explicitly and budget the encounter around it.

Initial tuning envelopes for ordinary invested first entry, measured from first actionable control to lethal blow: L1–4 approximately **15–30 seconds**, L5/10/15/20/25 **25–55 seconds**, L30 **35–65 seconds**. These are diagnostic design targets, not enforced timers or guarantees. Tune from the actual traces and report deviations. A weak player taking longer is not automatically a failure, but long periods with no reachable damage opportunity are. Strong rematches may end in a few seconds; never prevent a legitimate kill to show another animation.

Adjust each boss's fixed encounter budget, move choice, engagement distance, arena access, recovery and supporting crowd together. Fixed per-level HP adjustments are allowed and recorded; **HP alone is not the change**. No reading the player's current DPS to secretly scale HP, no hard damage cap, no mandatory immunity showcase, no random required-counter weapon. Defensive play must remain viable and cannot create a 100-second chase loop with no useful access.

An ordinary first encounter should support: recognition → response → punish → changed pressure → resolution. A first miss should teach through its actual consequence. A faster build earns fewer repetitions or a skipped later escalation; it should not routinely erase the entire first exchange across the roster.

### C2. Bosses own their crowd and space

Replace indiscriminate carry-through crowd pressure with per-encounter composition. Do not teleport survivors away. Use the protected arrival to let them peel into lanes, become temporarily separated by actual scenery, or finish approaching before the first tell. Budget what remains in the arena. Begin L1's lesson with boss plus only a small, readable residual group; later introduce a deliberately relevant add role, not every unlocked role.

Later bosses can create crowd pressure intentionally: Keeper weights open/close lanes, Bride carts scatter pursuers, Fisher nets constrain routes, Captain hazards make hauling lanes costly. Each add wave must change a decision or provide a satisfying controlled clear. Suppress unrelated Screamer/tutorial barks during arrival and the first exchange; retain essential hazards and accessible help elsewhere.

Boss movement must seek a **useful attack position**, not simply chase hero coordinates. Distinguish approach, flank, range-maintaining sidestep, committed attack and recovery. Stop tracking at the authored commitment point. Avoid aim snapping through Arda, sliding after feet stop, repeating an unreachable move and fleeing so long that melee cannot engage. No universal fast dash added to every boss.

### C3. Protect decisions without turning the fight into menus

Use the existing foreground/scene ownership system, extending it instead of building a second scheduler. A boss entrance, attack commitment, evolution choice, ultimate emphasis and death cannot all demand foreground attention simultaneously.

- Settle pending pre-boss earned choices at a safe approach seam before the protected entrance; preserve offered choices, XP and rewards.
- If a new choice is earned during an attack, mark it ready unobtrusively and present it at the next safe recovery boundary. Suggested maximum normal deferral: about two seconds; if no safe seam arrives, pause consistently and show the choice. Never leave the player taking damage behind a modal. Do not defer a needed evolution until the fight ends.
- Do not stack multiple redundant reveal panels after a choice. One compact transformation cue, then let the changed attack perform. Do not create a second cinematic for every level-up.
- During live combat an ultimate needs a source/body gesture, clear impact and brief emphasis. A large icon over the boss or escape route fails, even if its animation is attractive in isolation.
- Death has priority over queued optional barks and reward flourishes. Cancel danger once the actual boss dies; preserve legitimate rewards. Show physical resolution before the chest/result takes foreground ownership.
- Check pause/resume, simultaneous death/level-up, skip, loss, retry, reduced motion and save settlement. No dropped choice, duplicate reward or changed simulation under quality settings.

### C4. Ordinary combat must reward a readable choice

The player's movement is also their aiming decision in an automatic-attack game. Inspect target selection and reacquisition for every attack family: distinguish nearest-threat sweeps, linear piercing and densest-crowd throws. Keep the committed attack's target/direction stable through its physical release; do not swivel a blade/projectile halfway through its visible commitment to improve accuracy. Reacquire promptly after a dead/lost target without endless aim thrashing. Show source/facing clearly enough that players can position to influence attacks. Do not introduce mandatory manual aiming to repair automatic targeting.

Use regular roles to create decisions rather than a single long pursuer tail. Establish one recognisable behavior before combining it with another. Keep detailed crowd animation bounded; silhouette, tempo, source and response are the priority.

| Natural role | Recognition and fair response requirement |
|---|---|
| Walker / Diner | Distinct everyday silhouette/shamble; low-pressure space to learn proximity attacks. A Diner is not a miniature boss requiring a new tutorial. |
| Runner | Lean/acceleration and committed approach make lateral movement useful; no invisible acceleration at contact. |
| Crawler | Low grounded silhouette survives blood/loot; threat does not hide entirely under Arda's shadow. |
| Brute | Mass, slow preparation and shove/contact differ from a walker. An opening rewards moving around its commitment. |
| Hardhat | Armour reads before the first hit; resisted versus successful contact looks different. Flank/control options must correspond to actual rules. |
| Spitter | Source body prepares before projectile; projectile path and residue remain visible beneath friendly fire. |
| Screamer | Preparing/escalating pose identifies the source, giving a meaningful approach/interrupt decision where supported; don't teach it over a boss entrance. |
| Bloater | Swell/rupture/residue are distinct; position and timing permit escape at baseline movement. Avoid simultaneous acid/traffic trapping every refuge. |
| Parkur | Approach uses the actual lateral/vault route; landing is readable before damage and does not teleport across cover. |
| Çöpçü | Body pushes an actual rolling bin/crate; show its path, displacement of zombies and eventual trash slick. Player can sidestep or exploit the crowd displacement. Do not draw a thrown projectile from an unrelated hand pose. |
| Çaycı | Tray preparation, tea flight and slowing puddle form one connected action. The puddle slows without dealing damage: communicate traction/movement loss distinctly from a damaging Spitter pool; do not add injury flashes to imply nonexistent damage. |
| Kurye | Directional fast approach and turn/recovery create a different answer from straight Runner pursuit; actual delivery object/vehicle follows its source. |
| Martı | The thief differs from ambient birds: attention/shadow on loose XP, dive, visible stolen pickup and fleeing path. It deals no contact damage. Player decides whether to recover the drop or continue; show actual returned XP/bonus on kill. Do not present it as another damaging dive attacker. |

For roles whose intended distinct answer is not supported by current rules, document and implement a bounded real behavior change rather than inventing a visual cue for an effect that does not exist. Compose pairs deliberately: Runner plus Spitter asks lateral escape then source prioritization; Brute plus Crawler tests spacing without hiding the low threat; Bloater plus lane hazard needs a preserved refuge. Higher levels recombine learned decisions before increasing speed/HP. Do not force every role into every level or make every ordinary enemy a complex duel.

## 2. All ten bosses: individual encounter and performance contracts

The earlier [combat-craft PRD](PRD-FIRST30-COMBAT-CRAFT-2026-11-19.md) remains the anatomy/tool-continuity baseline. The following adds spatial and decision direction; it is not permission to declare those older acting requirements complete. Each boss needs its own normal-speed authored locomotion, attack and defeat review. If separated painted limbs cannot produce a credible turn/grip/foreshortening, create the necessary approved pose/parts through the existing art pipeline. More sine motion is not a substitute.

For every attack: record source, aiming/commitment cutoff, warning, active contact geometry, follow-through and accessible recovery. The body must carry this information even without title/health bar. Use key poses at contact/load/release/recovery to make the sequence legible at phone scale, not just elaborate at 400% zoom.

| Boss | Arena and player decision | Physical performance and escalation | Specific ending and earned advantage |
|---|---|---|---|
| **Cook, L1** | Create an uncluttered counter/frontage pocket with two visible escape sides. Near approach invites three committed cleaver cuts with a readable final overreach; distant approach invites a thrown blade. Player chooses close bait versus lateral throw dodge. | Apron/head/blade separate from pavement. Plant outside foot, hips lead shoulder, blade cuts through the real arc, recoil loads the next swing. Pursuit has a lean and braking step. Throw has a real empty-hand interval/return. After first exchange, alternate close pursuit and throw according to actual distance, never an unending throw loop. | Knee gives from the factual last pose, blade scrapes/settles, body follows. Shop shutter/person becomes the next focus. Melee burst exploits the final cut's recovery; ranged uses throw recovery. Both work at base speed. |
| **Switchkeeper, L2** | Rails and side refuge form a diagonal crossing problem. Player crosses the committed rail lane, then can close on the working hand or stay outside the hook arc. | Side-step toward the apparatus, hand operates connected switch, body pivots into hook only after a visible regrip. Later signal chooses the other lane; do not just reverse a red rectangle without body intention. | Hook drops against the rail, switch hand loses purchase, body settles. Track state visibly becomes safe. Mobility reduces crossing commitment; range punishes operation; neither is mandatory. |
| **Roaster, L3** | Short L-shaped market pocket: bait a straight charge into a broad stopping zone, then move around lingering heat. Avoid a perfect circular kite path that solves both actions. | Deep load, driving foot, acceleration, braking steps and distinct hot-tool release. After the first miss, heat blocks the previous approach while leaving another reachable lane. | Momentum fails, tool tips onto safe ground, embers die down, body settles. Close attacks punish braking; ranged can use the open diagonal. No decorative blast pretending to damage. |
| **Linekeeper, L4** | Two cable lanes with visible safe connection space. Relay denies one side; knot threatens immediate return. Player waits or commits across, then attacks the worker during actual reset. | Quick lateral footwork, working hand visibly loads the cable, planted relay and knot gestures differ. Approach must bring the boss into actionable range; no indefinite retreat. | Cable loses tension from his hand, current ceases, tool/body collapse. Speed improves repositioning; ranged improves denial uptime; baseline close build still has a window. |
| **Vatman, L5** | Wider tram apron with two refuge bays. Lane sweep teaches crossing, bell asks spacing, charge asks side escape. Retain a safe route when these recombine. | Separate lever operation, bell gesture and mass-led charge; shoulder/feet must not use one generic crouch for all. A charge ends in believable braking, not an instant idle. | Lever slackens, cap/body settle, final bell visibly swings to rest. Gate/rail state changes before district reward. A strong build shortens repeat cycles; it does not need to see every move. |
| **Keeper, L10** | A courtyard with two weight landing lanes and a central approach. Last landing creates a clearly reachable opening; terrain should make “go in now” visible. | Back/arm load, hand release, connected apparatus and a spent stance. Later charge changes where the next weight sequence can be baited. | Weight ownership cancels/resolves truthfully, arm drops, body lands, dust clears to the opened gate. Range attacks while observing; melee gains a longer burst after last landing. |
| **Bride, L15** | Dock ramp and rope pivot; cart lane can be **deliberately exploited**. First show an ordinary cart crossing. Player can lure her pivot into its path or reposition a supported movable obstacle to create the existing collision counter. Normal dodge-and-damage remains valid. | Crossing step, planted pivot, weighted rope end, dress follow-through. Cart collision visibly interrupts balance and slackens rope; never just apply an invisible vulnerability multiplier. Escalation changes lane/pivot combination, not speed alone. | Actual rope phase unwinds, weight contacts dock, knees/dress settle. Player-created cart counter is visibly faster/safer than ignoring it, but not compulsory. Reuse existing counter semantics; document any new redirect collision rule. |
| **Fisher, L20** | Two bridge-side passages and a net-defined obstruction. Cast draws a line the player leaves laterally; net changes the next route. Avoid net plus crowd sealing both exits. | Rod bends from hand tension; line pays out, feet plant, back reels. A missed cast produces obvious slack and longer useful access. Later cast/net ordering tests the learned distinction. | Rod drops, line slackens, Fisher settles; then Kaan's guarded posture appears. Speed shortens exposure; precision range attacks from a clear passage; melee punishes reel. No Kaan combat grant before join. |
| **Captain, L25** | Bollards, anchor tow corridor and bounded spice patches. Player plans where to stand before commitment, then crosses the haul line or attacks during retrieval. Preserve existing anchor-stuck opening and show why it happened. | Slow mass shift, feet brace, hips drive throw, chain leads back through actual hand, hauling takes visible effort. Phase change alters route and timing; never arbitrary frantic agility. | Chain goes slack along its current path, anchor settles, knees/torso follow. Give Kaan quiet physical space. Melee exploits retrieval; range preserves safe angle. No confetti/execution joke/triumphal sting over Nuri. |
| **Ticket Man, L30** | A station junction with successive usable crossings and a clearly visible service passage. Punch threatens closing distance; signal changes the safe rail. Final sequence combines already learned crossing and commitment. | Crisp signal arm, look toward affected rail, step-led punch with fixed commitment, controlled pivot and recover. Bring player, boss and passage into a coherent composition. | Signal authority fails visibly, punch tool/papers settle, rail resolves and service route opens. Both companions orient toward the same passage before the call. Earned strong builds shorten cycles; ordinary first-entry climax should not vanish in six seconds. |

**Per-boss rejection cases:** title removed makes the boss disappear; tool appears disconnected in a turn; all attacks use one body sway; a warning comes from an unrelated pose; the only strategy is walking straight up while passive DPS deletes it; baseline melee cannot reach recovery; death is a generic fade under loot; or a fixed invulnerability period exists solely to satisfy duration targets.

### Shared presentation measurements

At 390px portrait, begin composition work with major boss bodies roughly 1.4–1.8 times Arda's visible body height (excluding tools). This is a diagnostic starting range, not a universal scale or collider prescription: nimble Bride and heavy Captain need distinct proportion. Make source art and silhouette readable before increasing size. Inspect at320px too. Keep actual foot/collision anchors stable through pose changes.

During protected entrance/aftermath, a restrained closer frame may bring the subject to readable hand/posture scale; return smoothly before combat. During combat, include hero, immediate threat and a reachable escape path. Never zoom into an attack while its danger starts outside view. Reduced motion uses the same causal order and readable placement without zoom/shake. Essential cues survive reduced effects and grayscale; they do not depend on a glow around every actor.

## 3. Turn Istanbul into a tactical place

### E1. Street setups: link existing verbs into chosen consequences

Existing grab/use/place/throw interactions are the foundation. Do not invent a second control scheme or six new context buttons. Standardize their readable states: available object → approach/grip → held/armed state → release/place direction → actual contact → changed navigable space. Indicate the applicable action locally; show only the nearest relevant optional prompt, subordinate to danger.

Implement three authored **compositions of real systems**, with plain routes still viable:

1. **L8 bell and divided crowd:** from an overlook the player can see both the bell source and fork. Ringing draws a specific nearby group along one route, leaving another usable. Player crosses the vacated side while in control. The bell does not merely produce bonus kills. On replay, approach from the other side changes where it is useful.
2. **L15 cart against rope:** use the Bride's existing cart-created opening as a player-authored counter. Establish the cart's trajectory, give room to bait the pivot, show cart/body/rope reaction, then allow immediate punish. Extend input/collision only where necessary; never play success choreography without a real counter.
3. **L22 market domino:** expose an offensive cart line and a cover placement beside the same initial pressure. A deliberate cart release knocks the front group into a real destructible stall/obstruction and opens a short flank; placing the object instead creates a protected route around it. Neither outcome gives fake terrain or auto-kills unrelated enemies. Remaining neutral route is slower/riskier but valid. Show the route consequence before any acknowledgment.

Use existing approved movable/destructible art and physics-like rules; make one bounded reusable impact rule if necessary, not arbitrary scripted explosions. Friendly/hostile danger is distinguishable. For every setup, test missed placement, interruption, offscreen impact, no eligible targets, target already destroyed, retry and save boundaries. Required progression must never depend on an optional expendable prop surviving.

### E2. All30 level direction matrix

This is a required **composition and decision pass**, not 30 mandatory new systems. Preserve the current story facts and objective logic wherever they already meet the row. Reconcile any changed action count/order with both native scripts. Review adjacent pairs with instruction text hidden. A renamed hold or recoloured floor fails. Keep map footprints feasible in the current renderer; do not fake elevation that contradicts walkability.

| L | Dominant shape/decision to stage | Required visible consequence / remove this repetition |
|---:|---|---|
| 1 | Restaurant aperture → lateral street escape → clear Cook pocket | Open doorway visible beneath frontage; compact early learning, useful evolution before/during meaningful combat; shutter sanctuary after physical defeat. |
| 2 | Rail crossing with two side refuges | Tram changes where the crowd can stand; crossing timing matters. Do not start another identical stationary defence after the payoff. |
| 3 | Signal-cart bend with a visible safe approach | Operate/position relative to crossing pressure, then Roaster commitment. Different physical decision from L2's rail crossing. |
| 4 | Alternating wire work opens an offset sheltered flank | Each of three wires changes approach geometry. Keep repaired objective wrapping. Linekeeper tests lane/knot reading rather than repeating wire holds. |
| 5 | Depot threshold opening into broad tram apron | Establish workplace and escape bays before Vatman. Replace long empty post-boss walk with short purposeful departure. |
| 6 | Switchback around lifted cargo | Hoist makes a real diagonal shortcut; player sees and walks it. No uninterrupted central corridor through the closed obstruction. |
| 7 | Small rescue pocket off the main route | Musician retreats along a clear path; player protects/uses the newly opened return lane. Give this a human focus, not another machine switch. |
| 8 | Bell overlook and bifurcated crowd path | Chosen lure changes enemy flow and allows an intentional crossing. Sound-off movement/attention tells establish the cause. |
| 9 | Short carry loop around exposed side | Weight/source/socket visible within a comprehensible route; choosing sheltered versus short exposed approach matters. Remove empty backtracking. |
| 10 | Weight courtyard | Last impact makes a reachable opening. Physical gate transition closes district; do not bury it under ultimate icon. |
| 11 | Crane loading bay opening sideways | Moving cargo reveals a usable flank and introduces one threat role fairly before combinations. |
| 12 | Pier approach and docking gap | Mooring action changes the actual access/pressure; optional safe or offensive approach is evident before commitment. |
| 13 | Traffic crossing with lateral refuges | Predictable tram/acid/blast timing; never all refuges hazardous simultaneously at baseline speed. Car fuse is visible and causally true. |
| 14 | Staggered fish-market shutters | Opening each shutter reroutes a different crowd stream or unlocks a different pocket. Avoid three equivalent circles to stand in. |
| 15 | Dock ramp, cart lane, rope pivot | Player can intentionally create the counter; victory resolves rope and dock before reward. |
| 16 | Short bridge threshold, obstructing lines | Brief orientation and release after boss, not another hold/wave peak. Preserve atmosphere and line-source clarity. |
| 17 | Railing rescue and shelter pocket | Rescued person reaches safety before food/help. At full HP saved food is visibly intentional; depleted state differs. |
| 18 | Windward and sheltered sides | First screen changes preferred side, second enables a different approach. Wind/debris has direction; stranger dialogue remains pre-join. |
| 19 | Crest, refuge, crossing | Incoming wave readable from refuge; leave on a chosen interval, then relief before reunion. |
| 20 | Dual passage and net | Cast/reel choices culminate in recognition; do not put reward overlays over Kaan lowering the fish. |
| 21 | Two-person passage with visible interceptor route | First post-join assist unmistakably enables Arda to pass. Use existing real Kaan action; no helpless escort obligation. |
| 22 | Market cart with offensive line and cover pocket | Both intentional choices create different world states; retain a neutral route. This is the replay highlight. |
| 23 | Compact triangular sack route around working Kaan | Preserve three-sack fact; each removal changes access/sightline, not three long identical trips. Arda's timely help resumes Kaan's actual work. |
| 24 | Trolley junction with readable safe side | Prior street understanding pays off in a clean crowd displacement/crossing. L22 callback only if true. |
| 25 | Quay tow lanes and bollards | Anchor decisions lead into loss. Quiet aftermath changes companion pace/posture and onward movement. |
| 26 | Short service-car aperture | Actual car departure reveals walkable space. Breathing room; no obligatory collection/grind added. |
| 27 | Guide approach with information/cover tradeoff | Light reveals a useful route or cover protects it; guide reaches a plausible destination. No giant human interaction ring. |
| 28 | Fuse carry to clock-controlled crossing | Clock rhythm visibly changes after insertion before player commits to crossing; interrupted carry recoverable. |
| 29 | Platform light and separated crowd lanes | Light/lure changes a specific group's route; primary circuit stays clear. Do not reproduce L28's hold with new text. |
| 30 | Station junction and shared service exit | Culminating readable boss exchange, companions orient and depart, call provides Bazaar motive, honest end of slice. |

For every five-level district, include at least one changing-direction encounter, one short relief section and one recognisable landmark payoff. These are composition requirements, not extra objectives. Do not force a fork into every level; alternation itself prevents routine. Review the amount of walking after the decisive event; retain only travel that delivers a new view, useful pickup decision or narrative transition.

## 4. Five directed highlights: shot-by-shot execution

Durations are starting editorial budgets, not automated pass thresholds. Control remains live through decisive player actions. Protected animation cannot secretly take damage or collect/consume resources. All skips/repeats return to the same factual outcome, with position and reward settlement preserved.

### S1. L1: the first earned victory

1. Approach: pending pre-boss choice settles; foreground barks fall quiet. Preserve enough visible street to orient.
2. Arrival, roughly 1–2 seconds protected: Cook steps into the pocket, weight lands, hand regrips cleaver. Frame body, tool and two exit sides. Small name treatment at an edge; no giant middle-of-screen title.
3. Handback: camera settles before a real tell. Player sees the whole load/commit/recovery; first attack follows distance-based intent. Regular pursuers do not hide the feet/tool.
4. Evolution, if earned: safe-boundary choice, compact reveal near hero; first heavy cut has visible body/contact contrast. No fictional free kill for the reveal.
5. Defeat, roughly 1–1.8 seconds: actual lethal pose loses support, cleaver scrapes, body settles. Brief impact emphasis optional/reduced-motion safe; no repeated flash.
6. Release: shopkeeper/shutter makes shelter visible, arrow sits beyond the opening. Chest appears without covering the body resolution. Exit transitions into existing comic; no redundant new exposition page.

### S2. L15: “I turned her own dock against her”

1. Establish the moving cart, its lane and rope pivot during protected entry.
2. First ordinary cart shows predictable motion; the player retains a safe alternative.
3. Player baits the pivot into the cart line or uses supported redirect placement. Show cart travel, contact, body rotation and rope slack as one connected event.
4. During real exposure, do not interrupt with a loot modal or unrelated bark. The player can close and actually deal burst damage.
5. A failed setup continues the fair fight; no automatic rescue or fake counter. A successful one may receive one brief contextual native reaction after danger, not a banner explaining invisible causality.
6. Defeat resolves rope/dress and clears ramp. Repeat play shortens only the introduction, not physical consequence.

### S3. L20–23: trust through action

1. L20 Fisher settles; Kaan holds fish defensively and faces Arda. Arda's answer precedes the lowering hand/relaxed shoulders. Preserve exact native story.
2. Kaan turns toward the shared route, steps aside to make room; Arda joins. Bodies do not snap to starting points. Protected focus is close enough to see the guarded-to-relaxed change.
3. L21 introduce a visible threat approaching the required passage. Kaan looks, moves, plants and performs his existing real shove/stun. Hold hero/threat/companion in frame while the player moves through the opening. Avoid mandatory damage to trigger the beat.
4. Later show readiness through attention/stance toward a relevant flank. Existing dash-linked support can be used deliberately; no new giant “assist” meter/button. If unused, he follows normally.
5. L23 Kaan's actual work is interrupted by a clearly visible threat. Arda's action removes it and work resumes. Optional contextual acknowledgment requires that factual event. No gratitude for damage the player never dealt.

### S4. L25–26: victory with a cost

1. Anchor/chain settle from the real lethal frame; danger ends. Suppress celebratory jingle, combat bark, level-up reveal and coin shower foreground.
2. Kaan approaches from his real position, slows and stops short of Nuri. Let hands/head/shoulder posture change before the memory line. Arda turns toward him and leaves space instead of facing camera.
3. A protected closer composition makes the two bodies and settled tool legible. Use the existing short melody sparingly; mute mode gets the same stillness, gaze and spatial separation. Do not add another explanation of grief.
4. After the player's reading pace, Kaan initiates departure; Arda accompanies him. Return rewards in an orderly result sequence after the emotional beat.
5. L26 begins quieter: service car moves, passage opens, they walk through. No immediate frenzy headline or unrelated joke to cancel the preceding feeling. Existing enemy pressure remains low enough for the pause to register.

### S5. L30: a chapter ending rather than another cleared rectangle

1. Approach presents the junction, signal source and locked service exit as one place.
2. Protected entry frames Ticket Man's authority gesture; control returns before punch/crossing test. Stage the complete ordinary exchange under C1/C2.
3. Defeat resolves signal/tool; current rail danger cancels/finishes consistently. Passage light/opening becomes the next focal point.
4. Kaan notices the route; Arda follows his gaze, then both move toward it. The player's next controlled movement continues that direction without camera reset.
5. Existing call: Dad's information/highway warning motivates Bazaar. Keep native lines and reveal order; no battle joke or reward interrupt.
6. Slice result celebrates completed chapter and offers an available rematch/build experiment. Do not advertise playable L31. End with an honest next-story hook, not an inaccessible button.

Minor scenes L7/17/27 use the same cause/reaction discipline with shorter live acting. Every scene gets explicit actor positions, prop contacts, focus, handback, interrupt/skip/repeat and missing-art behavior. “Actor reached waypoint” is insufficient.

## 5. Weapons, damage and sensory hierarchy

### W1. Complete arsenal craft, not six showcase weapons

Cover **17 bases and18 evolutions**, plus geometry-changing mods/mastery. Reuse the existing full inventory and [family specifications](PRD-FIRST30-COMBAT-CRAFT-2026-11-19.md#5-all-17-base-weapons-and-18-evolutions). Do not generate another redundant inventory. Each entry needs a visible release/contact/recovery and truthful relation to its source.

Prioritize the owner's rejected families first:

- **Knife/Cleaver:** maintain finite body-led cuts. Consistent hand grip through reversals, believable blade thickness/perspective, elbow/shoulder/hip sequence, brief readable recovery. Enlarge meaningful strike silhouette without an absurd floating knife. Attack arcs and actual damage agree; rank/mod changes must not resurrect orbiting geometry. A rear hit needs a real backhand/turn, not torso teleport.
- **Chainsaw/Grinder:** supported two-hand or explicitly braced grip, motor vibration confined to tool, forward pressure at contact, short material spray at victims, drag/recoil when contact ends. Teeth travel around the bar; the whole bar must not spin like a propeller. Show contact resistance without immobilizing Arda arbitrarily.
- **Bike Chain/Cyclone/Arc Chain:** weighted end leads the curve; grip stays attached, slack gathers on reversal, chain tightens at extension. Distinguish actual controlled sweep from a detached orbiting UI icon. Electrical contacts connect actual targets. Preserve intended damage coverage or change it explicitly with balance checks.
- **Sledge/Blacksmith:** body load, actual ground/contact source and propagated effect explain remote hits. A painted hammer hovering over a distant enemy fails. Healing comes from the factual successful action.
- **Cable/Stormshield:** preserve successful electrocution identity; branch count/opacity must let enemies and danger remain visible. Do not flatten this strong asset into generic flashes.

For the rest, enforce distinct action families: Nail Gun/Nailstorm source/recoil/pierce; Canister/Cluster/Car Bomb release/fuse/real vehicle chain; Cover heavy flight/bounce; Molotov/Lake/Fireball bottle versus territory versus projectile; Slingshot band release; Saw/Twin Saw independent trajectories; Torch/Forge attached nozzle and bounded flame; Extinguisher/Foamstorm aimed cone and actual affected victims; Fishing Rod/Hook Pull flex/line/tension/recovery; Door/Minibus handle/brace/throw or actual placed cover; Speargun/Net Spear shaft/net connections; Fireworks/Finale launch before barrage. All35 entries remain in the handback ledger.

Avoid simultaneous six-arm fiction. Establish presentation priority for the currently committed held action; secondary attacks use credible quick deployment/projectile origin without changing actual simulation cadence invisibly. If mechanics cannot be truthfully drawn, explicitly revise the affected rule and validate its gameplay consequence.

### W2. Damage/heal/block need to be understood in peripheral vision

Preserve the existing health-event distinctions. Test light hit, heavy hit, repeated hits, offscreen hit, hazard damage, blocked hit, health gain, full-health saved food and critical recovery while the player attends to the world.

Use a readable brief hero silhouette/contact response plus directional cue, with HUD trailing loss as confirmation. Critical state persists as restrained edge/body treatment; healing travels from real source to hero and highlights only actual restored HP. Shield has a different shape/material. Do not use injury red for friendly power. Avoid strobing, cumulative camera shake, repeated full-screen pulses and flinching that steals player control. Reduced motion retains shape/value feedback.

For saved full-health food, local availability icon and an intact idle state explain why it remains. At injury, actual consumption visibly changes both item and hero; at empty station, depleted art/local state makes repeat approach understandable. Never consume scarce healing at full HP just to show an animation.

### W3. Sound and music are directed, not just enabled

Use current asset pipeline; do not claim listening acceptance from code. Rework the hurt cue if still objectionable: distinguish a short light contact from a heavier impact/body response, cap repeat rate, avoid a sharp recurring squeal, and leave room for important enemy tells. Give weapon families material identities (metal slice, chain tension, saw motor/contact, cable crack) at restrained volume.

Mix priority: imminent threat and injury information; player contact; environment; optional rewards/barks. Duck dense weapon cosmetics around a boss tell, never mute the tell. Boss arrival shifts arrangement/ambience; recovery briefly reduces pressure; defeat resolves differently by boss. Captain grief is not a victory sting. L26 gets air/space; L30 call remains intelligible. Preserve the existing melody connection without looping it over every reward.

Sound-off play must still reveal state and consequence. Music cannot be the only frenzy cue. Add restrained change in body/trail tempo and local atmosphere; keep hostile geometry colour/shape stable. No universal saturation blast to label every state special. Review at normal and low volume with a real listening method/person; otherwise mark sound judgment unverified.

## 6. Build agency, progression and reasons to return

### R1. Earned starter choice — new scope, promoted from deferred N1

After clearing L5, expose a small starter selector in the existing Arsenal/pre-run entry: Knife plus **Nail Gun and Picnic Gas Can**, using existing unlocked bases. Unlock these choices through the district clear, not paid currency, rare RNG or a lengthy additional grind. Later unlocked bases can remain run finds until deliberately balanced as starters; do not expose every weapon immediately.

One chosen rank1 base **replaces** the starting Knife in eligible normal runs/rematches. First-ever L1 opening keeps its canonical knife acquisition; explain that constraint where relevant. Preserve permanent mastery applicability and normal rank resets. Current sim initializes Knife then adds a requested alternative: explicitly correct that path for this mechanic, or it will accidentally grant two starting weapons.

Selector presents action promise and tradeoff: close sweeping punish; linear piercing distance; delayed cluster-area throw. Include one truthful short preview with real attack geometry in an existing safe display context. Show saved selection before launch, allow cancel, validate legal unlock on load/save migration, retain sensible Knife fallback for old saves. No silent auto-selection from a recommendation.

Balance starts at equal opportunity, not identical DPS: small crowds, single target, moving/rear target, first boss, weak/no meta bonuses. Each must survive reasonably without requiring an early perfect offer. Preserve choice randomness and recipe aid; no universal guaranteed evolution. Include explicit Hook Pull acquisition/use tracing where the earlier bounded search failed; make an intentional alternative path feasible without claiming all recipes must occur every run.

### R2. Curated tactical rematches — new scope, promoted from N3

Use existing replay surfaces/modes. After a district clear, offer one clearly described optional variation alongside its available rematch. No new currency or separate daily obligation. Start with three authored variants:

- **L5 alternate tram routing:** the signalled lane sequence differs, preserving full tells and safe bays. This tests crossing decisions rather than merely more HP.
- **L15 reversed cart approach:** different cart entry/ramp arrangement, honestly established before control; the same rope/counter principles apply.
- **L25 shifted mooring lane:** reposition the relevant bollard/tow approach and safe spice pocket within valid arena geometry. Preserve Nuri's story and a respectful shortened repeat aftermath.

Player can preview the one changed rule and return to standard replay. State is deterministic/retryable; reward settlement remains bounded by existing rules with no repeat first-clear farming. Preserve Night Shift/Nightmare; don't relabel them absent or replace their established contracts. Reconcile this variation with their configs explicitly, avoiding stacked modifiers that erase the promised safe route.

Completion offers a specific next experiment based on factual unlocks/build: “try a ranged start against the tram routing,” for example, not generic “raise rank5” regardless of the last run. Native localized copy belongs in the correct source. No false personalized recommendation for a weapon the player cannot select.

### R3. Make progression cause and scope visible

Keep Develop Arda's direct result entry and separate Attributes/Perks. Improve hierarchy around four concrete questions: what changed this run; what remains next run; what can I apply now; what new action can I aim for next?

Attributes: show applied rank, ready points, exact current→next effect and training action. Perks: show required attribute rank, Street Cred cost, applicable weapon family, actual behavior and a nearby achievable example. Run cards: show current-rank change plus recipe contribution. Mastery: permanent weapon-specific progress; do not imply its rank carries the run weapon level. Gear: permanent equipped effect and honest comparison.

Do not sell a +1.5% gain as a cinematic power spike. A small rank gets concise acknowledgment. First behavior-changing perk or starter gets a useful preview/next-run cue. Show prerequisites beside the desired perk instead of requiring a player to infer them from locked-grid colours. Preserve free/clear respec rules; do not add paid correction for an unclear choice.

Result: one primary onward action, one attainable experiment, concise retained reward/growth summary; detailed ledger expandable. Keep ready-growth action prominent without making repeated rank application an unskippable intermission. On loss, name the actual cause and one relevant adjustment, including positioning where applicable. Do not default to grinding or buying power.

### R4. Companion continuity and narrative replay

Use existing factual help/memory state to vary a small number of contextual responses and actions, not a new branching epic. Kaan can recall a real L22/23 assist at an appropriate quiet point; no acknowledgment if it did not occur. Repeat encounters should not replay first-meeting surprise as if amnesia were canon. Preserve native TR and EN independently, character voice, Paşa continuity and family/Bazaar motive. Read in trigger order, not alphabetic key order.

Comics supply perspective; world acting supplies cause. Review speaker/portrait, gaze, costume/tool continuity, text/bubble order, reveal timing, skip/replay and missing-art behavior. Preserve improved current art; replace only demonstrably deficient panels/assets. Remove empty portrait-shaped boxes when the speaker is a device or offscreen source; use an intentional layout. Do not add exposition to explain an unreadable action that should be visible.

## 7. Definition of done and handback

### Three independent verdicts

Every requirement gets **implemented / presentation inspected / player accepted** as separate fields. Use not tested/blocked/rejected honestly. Tests cannot turn the latter two green. Owner rejection of boss feel/visible change remains open until a new observable candidate addresses it. No self-awarded masterpiece label.

### Minimum integrated verification

1. Retain exact before runtime/source identity and ordinary earned recordings; produce one exact after candidate and live URL with cache/source identity. Preserve owner saves; isolated fresh-save origin for campaign testing.
2. Run affected tests during changes and full prototype suite in background before handback, following repository commands. No retry-to-green hiding. Verify localization, saves, quality-independent sim and scene/reward lifecycle.
3. Earn all30 in order on the candidate with normal unlocks/meta application. Report all attempts, builds, deaths/timeouts and actual evolution contribution. Repeat multiple seed sets/policies for balance. Bots establish reachability/distributions, never human fun.
4. All ten bosses: ordinary first entry, injured entry, legal strong replay, base-speed close and ranged access; inspect actual body/tool through approach, reversal, every attack, miss, recovery and lethal interruption. Record crowd damage separately. One attack name in a log is not an exchange acceptance.
5. All30: compare adjacent decisions and district pacing. Confirm actual changed geometry, optional-route viability, short relief and physical scene handback. Retain failure paths: used/destroyed props, interrupted carry, declined assist, no counter, muted/reduced settings.
6. Complete weapon inventory remains17+18, with geometry-changing branches; inspect contact/ownership while moving, reversing, dashing and crowded. A transformation modal or idle frame does not count as observing a weapon.
7. Fresh-save L1→result→growth→L2 and L20→21, L25→26, L29→30→ending; TR/EN, 320/390, large text, left-hand layout where supported, muted/reduced motion. Include interruption stacking and mobile browser background/resume; retain physical-device gate if no device available.
8. Perceptual evidence: paired normal-speed ordinary-play clips around the same encounter/power conditions, with honest seed/build differences. Clearly separate generated footage from actually viewed footage. If tools cannot perceive continuous motion/audio, do not claim they did; prepare a short indexed owner reel and keep those acceptance fields open. Do not use invulnerable/no-weapon showcases as difficulty proof.
9. Unfamiliar-player check, when available: without coaching, can they identify the boss threat, explain a counter/recovery, notice damage/healing on mute, find/apply growth, choose a different next-run plan and recall what Kaan did? Record actual observations and voluntary replay/return, not invented percentages. This is not permission to stop implementation early waiting for research.

### Handback artifacts

- One concise implementation report mapping **C1–C4, all10 boss rows, E1/E2 all30 rows, S1–S5, W1–W3, R1–R4** to code, visible change and evidence, plus inherited open requirements. Do not bury unresolved items in hundreds of “pass” entries.
- Before/after balance table with distributions and outliers, damage-source diagnosis, first-entry versus replay; config deviations and their reasons.
- A short comparison reel/index containing L1, another early boss, L15 counter, L21/23 cooperation, L25 grief and L30 climax. Use native speed; caption the actual build and whether earned. Separate unviewed captures from perceptual review.
- Exact URL, candidate hash, run commands, tests and remaining phone/audio/player acceptance. Explain in plain terms what will look or play differently in the first five minutes.
- Update review/handoff/decision log with proposed design changes and honest status. No expansion approval. No claim that there is no meaningful improvement left.

**Final acceptance question:** can an uncoached player describe a different plan, see their action change the street, read and beat a characteristic boss, and remember a moment with another person? If the answer is only that more systems exist and tests pass, this PRD has not achieved its purpose.
