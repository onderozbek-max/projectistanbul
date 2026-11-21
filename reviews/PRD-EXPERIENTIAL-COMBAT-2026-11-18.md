# Experiential PRD · Combat, movement and earned challenge

**Required appendix to [the main PRD](PRD-EXPERIENTIAL-QUALITY-2026-11-18.md).** Covers E01/E05/E06/E07/E09. These are production requirements, not new observations of the changing build. Preserve the current sim unless a deliberate, documented balance change is necessary. All timings below are starting points for visual tuning; existing minimum tells and collision rules win.

## 1. E01 · Make Arda feel alive without slowing the controls

### 1.1 Body and asset contract

Arda must visibly transfer weight between legs. A moving texture, a sinusoidal bob or independently wobbling boots is insufficient. At phone size, the player should read the supporting foot, the other knee moving forward, pelvis weight shift and counter-rotation of chest/shoulders. Preserve the face, outfit, proportions and comic identity of current artwork. Author real poses or use an approved articulated approach; do not smear a single torso image to imitate joints.

Build from the existing side/front/back directional art, with diagonal blending or additional poses where needed. Eight movement directions need convincing results; that does not require eight complete duplicated texture sets. Give each pose consistent ground pivot, apparent height, head volume, grip points and shadow. Validate north-facing/back views as seriously as front views. A pose change must never shrink the Cook, grow Arda, flip a held tool to the wrong hand or move the collision center.

Use eight logical gait phases: contact, down, passing and up for each foot. These are readable poses, not a requirement to play eight independent bitmaps at a fixed frame rate. Interpolate only where it preserves the art. Drive gait progression by actual distance travelled, with sensible limits; stopped actors do not run in place. Account for camera movement when checking foot sliding. Author transitions, not an instantaneous switch between two loops.

| State | Required body action | Control/transition rule |
|---|---|---|
| Idle | Small asymmetric breathing; occasional head/shoulder attention, feet grounded | Never perform a long flourish that delays the next input |
| Start | Hip/torso lean toward intent, trailing foot pushes, leading foot reaches | Visual take-up roughly 80–160 ms; world motion responds immediately under current controls |
| Run | Alternating knee/ankle action, opposite shoulder response, controlled vertical movement | Stride and apparent speed agree; avoid identical bounces across all actors |
| Stop | Lead foot catches weight, hips settle, free arm balances | Roughly 100–180 ms of visual settlement; do not add braking distance to the sim |
| Turn | Weight shifts and shoulders lead into the new heading | Blend visual orientation roughly 60–120 ms; rapid reversals must not spin or delay movement |
| Dash | Clear compression/release, extended line of action, readable landing | Start/active/recovery correspond to actual Dash state and invulnerability; no cosmetic extra safe frames |
| Hit | Brief directional upper-body recoil, maintained grounded position | Do not stun or suppress movement unless the sim actually does; no sustained rapid white flicker |
| Carry / heavy work | Hands touch the load; elbows, shoulders and gait acknowledge weight | Existing mobility rules stay truthful; sacks and portable props cannot occupy the same hands |
| Attack | Grip→preparation→contact→follow-through, appropriate to the tool | Pose priority never delays a scheduled simulated hit or hides its source |
| Defeat | Weight gives way and settles in the current location | No sliding idle body after death; result attribution and reward settlement stay unchanged |

Separate locomotion from upper-body aiming enough that a player can run sideways while automatic attacks select a target. Do not allow legs to face one direction while the whole torso snaps 180 degrees every frame between nearby targets. Stabilize visual target selection without falsifying actual attack direction. Preserve ankle/hand geometry at each body-layer join; a scarf or dust trail cannot disguise broken limbs.

### 1.2 Animation ownership under multiple weapons

Document which state owns feet, pelvis, torso and hands. A held heavy object or mission sack takes precedence where the current rules require it. For rapid automatic weapon changes, use a brief intentional grip transfer or an appropriate existing deployed/projectile origin; do not render several incompatible full arm swings simultaneously. Small shots can share an aiming pose. Major melee contacts need their own readable action. A persistent cable/orbiting device can remain physically attached while another tool strikes.

Do not solve presentation conflicts by silently skipping attacks, slowing cooldowns or showing a weapon fire from an arbitrary point. Capture the busiest valid loadout to prove that every actual hit has an understandable source. If the present rules cannot be represented coherently, propose a narrowly scoped gameplay change with before/after damage and control consequences; do not bury it inside the animation patch.

## 2. E06 · An enemy is recognizable by what it does

Retain the existing roster and diversity. First create a manifest of all enemy IDs actually spawned in L1–30, including variants. Match each to its current behavior, art and first encounter. The following role directions cover the known types; any additional live type requires the same treatment. Clothing variants can share a role, but distinct threats cannot differ only by tint.

| Enemy/role | Visible movement and intent | Attack/consequence to make legible | Player response it should teach |
|---|---|---|---|
| Walker, including clothing variants | Uneven shuffle; one dragging step, loosely delayed arms | Continuous approach and actual contact extent | Make room, herd and clear a lane |
| Diner / dormant onset | Slumped stillness, small preparatory movement before standing | Transition to active threat is physically readable | Notice a space becoming unsafe; no invisible instant lunge |
| Runner | Forward lean, compact quick strides, purposeful closing | Speed contrast comes from gait and translation | Prioritize or redirect the pursuer |
| Crawler | Low profile, alternating hands/forearms pulling the body | Head/contact location remains visible behind loot | Check the ground, do not rely only on tall silhouettes |
| Brute | Wide load-bearing stance, slower planted steps, shoulders carrying mass | Existing heavy commitment, impact and recovery remain distinct | Bait commitment, leave its reach, return |
| Hardhat / armored role | Protected area and stance visible from relevant angles | Deflection/armor reaction differs from an ordinary damaging hit | Understand the existing armor rule; never invent a rear weak point cosmetically |
| Spitter | Holds range, chest/throat preparation, head aim | Visible projectile departure and landing | Close or change lanes before the landing |
| Zehirli / toxic spitter | Distinct preparation and visibly persistent contaminated ground | Damage pool has a stable boundary and expiry | Move out and route around persistence |
| Bloater | Uneven mass and building pressure; clear death/attack preparation | Burst origin and hazardous extent match the sim | Create distance before triggering it |
| Screamer | Plants feet, draws breath and opens posture | Call and resulting pressure connect visibly | Interrupt or prioritize according to existing rules |
| Kasap | Weighted cleaver grip, shoulder lift and planted swing | Blade and own-position attack ring agree | Step out, then punish its recovery |
| Parkur | Fast approach, pronounced crouch, extended leap, absorbed landing | Launch and landing marker are visually connected | Leave the committed landing point |
| Kurye | Rider/scooter leans and aligns before the diagonal dash | Wheels, lane warning and actual cross-street path agree | Cross behind a committed charge |
| Çöpçü | Braces both hands against the bin/crate, then shoves | Object rolls from its actual hands; heavier crate reads differently | Leave the rolling lane, exploit the pusher's reset |
| Çaycı | Balances the tray, shifts grip before the lob | Tea puddle communicates slowing, not false HP damage | Avoid slow terrain when pressure approaches |
| Martı | Wing-driven hover, tuck into dive, flare on recovery | Shadow targets a real pickup; stolen XP visibly travels and returns when recovered | Decide whether to chase the thief; never confuse it with contact damage |

For first sightings, give the role a readable interval in the normal route, not a mandatory bestiary popup. Later encounters combine already understood roles. Presenting a new silhouette, new hazard and boss signature simultaneously is not teaching. Keep dangerous windups readable within a crowd; use local space, posture, silhouette separation and controlled spawn combinations before adding louder overlays.

Escalate through complementary behavior: a ranged enemy influences the lane while a runner pressures movement; a heavy commits while another threat makes the return decision interesting. Do not make every late-level enemy uniformly faster. Preserve reaction floors and a viable escape corridor. Cosmetic gait variants should not alter collision timing.

## 3. E09 · All 17 base weapons receive a physical pass

Every weapon gets an asset/animation record: equipped appearance, grip or deployment point, preparation, release/contact, follow-through, target response, sound, rank changes and reduced-effects version. Review rank 1, an intermediate rank and rank 5 at actual play scale. Show upgrade differences through reach, cadence, count or consequence only when the sim changes those properties.

| Base ID | Required action and visual cause | Required impact/recovery; reject this failure |
|---|---|---|
| `knife` | Shoulder/elbow preparation, wrist-led curved edge path; blade remains connected to the hand through the cut | A compact contact mark and directional victim reaction, then wrist recovery. Reject a floating slash fan, spinning icon or blade bigger than its real reach |
| `nailgun` | Stable grip, short kick at the muzzle, nails depart from the barrel toward actual targets | Small puncture/metal contact, readable cadence. Reject shotgun-like explosions or tracers detached from the gun |
| `canister` | Physical release into an arc; weight and rotation remain plausible | Landing, fuse where applicable and actual explosion connect; blast boundary remains readable. Reject a blast before the object arrives |
| `chain` | Hand leads a slack-to-taut flexible chain; the weighted end follows an orbit consistent with existing hits | Tension and follow-through after contact; discrete links/sprocket silhouette at close review. Reject a rigid rotating rectangle or free-floating circle with no grip |
| `sledge` | Two-handed lift, body compression and gravity-led slam | Ground contact, shoulder follow-through, victim displacement consistent with knockback. Reject effortless wrist flicks or whole-screen shake every cooldown |
| `molotov` | Bottle thrown from the hand, travels and breaks | Fire originates at the landing, persistent pool boundary agrees with damage. Reject an opaque carpet hiding enemy feet |
| `fireworks` | Visible launch origin, accelerating projectiles and authored spread | Distinct launch/airburst rhythm with controlled saturation. Reject repeated full-screen flashes or particles unrelated to hit locations |
| `cable` | Cable remains attached/held; flexible live end establishes a path to the affected enemy | Electrical response travels along actual connections, then victim recoil. Preserve this causal clarity as the reference for other tools |
| `speargun` | Aimed barrel and short firing recoil; spear follows actual trajectory | Pin/tether belongs on the hit target and lasts as long as the real state. Reject ropes to unaffected targets |
| `extinguisher` | One hand stabilizes the cylinder, the other aims hose/nozzle; pressure has body reaction | Cone originates at nozzle, target push/slow reads through foam. Reject a solid white wedge concealing danger |
| `sawblade` | Clear launch, rotation around the disc's own center, outbound/return path | Tangential contacts and sparks on real impacts; return has an understandable collection/orbit point. Reject oversized discs that hide multiple enemies |
| `manhole` | Mass is established through the existing lift/throw/orbit action; keep its origin consistent | Heavy metallic collision and recovery, with visible thickness/shadow. Do not invent a protective block if the weapon has none |
| `torch` | Grip and nozzle aim; the jet follows the actual sweep | Hot contact and persistent scorch reflect real ticks/areas. Reject a static triangular overlay or fire leaking behind the nozzle |
| `olta` | Cast, line tension, hooked target and reel form one connected action | Rod bends/pivots and the line pulls toward the true catch. Reject pulling an enemy before the hook or detaching the line from the hand |
| `cardoor` | Both hands and hips support the door's mass; broad sweep follows the current attack | Leading edge makes contact; the door settles with momentum. Distinguish carried attack from any actually placed cover; no imaginary passive invulnerability |
| `slingshot` | Draw elastic, hold aim briefly, release projectile at the fork | Elastic recoil and compact hit confirmation. Read as an improvised precision tool, not a tiny unexplained muzzle flash |
| `chainsaw` | Firm two-handed grip, distinct spin-up, continuously moving teeth, torque reacting through shoulders | Sustained contact visibly bites/resists, then releases. Preserve new held/rev work; reject orbiting the whole saw like a sawblade or repeated identical impact bursts hiding the target |

Knife, chain and chainsaw are first-priority craft fixes. Cable is the existing positive reference, not exempt from performance and mute review. Avoid blood/gore as a substitute for convincing contact. Materials, recoil, pose, sound and displacement carry the weight.

### 3.1 All 18 evolutions need a visible mechanical payoff

Keep current recipes and functional identities. The appearance should explain the benefit, not merely become larger or change color. Use current config as authority if a later valid change supersedes this inventory. Manhole and slingshot currently lack an evolution in this inventory; do not invent one just to fill a table.

| Evolution ID / source | Signature that must be readable in actual play |
|---|---|
| `cleaver` / knife | Distinct heavier blade/swing and the current evolved attack's larger or additional contact geometry; actual improved hits receive the right attribution |
| `nailstorm` / nailgun | The evolved volley's count/spread reads as emitted nails; retain muzzle/target correspondence |
| `cluster` / canister | Initial canister impact visibly releases the actual secondary charges; their landing and burst order is understandable |
| `cyclone` / chain | The evolved orbit/count creates a readable continuous chain threat, preserving tension/origin rather than an opaque circle |
| `finale` / fireworks | The actual evolved salvo builds to its extra impacts with distinct trajectories and controlled brightness |
| `blacksmith` / sledge | Slam contact connects enemy hits to the actual capped self-heal; HP feedback reports only health restored |
| `stormshield` / cable | Readable orbit and actual zap links, including the dodge-triggered zap; no shield-absorption promise beyond the real effect |
| `foamstorm` / extinguisher | Wider persistent foam and an observable spit interception when it occurs; safe space remains legible |
| `netspear` / speargun | Caught targets have physical rope connections; shared damage travels along those actual links |
| `lake` / molotov | Touching pools visibly join into the real longer-lived slowing area; its edge/expiry remains trustworthy |
| `twinsaw` / sawblade | Two distinct outbound and returning discs; count and paired paths can be seen on mute |
| `fireball` / molotov | Bottle/fireball arrival creates the actual enhanced blast and burning victims; preserve the gas-terrain discovery condition |
| `arcchain` / chain | Physical chain contact launches real arcs; wet-ground enhancement is visibly connected to wet terrain |
| `carbomb` / canister | A near-car detonation clearly involves that car and the actual enlarged blast; ordinary impacts do not falsely advertise the bonus |
| `forge` / torch | The stronger sweep and second actual scorch are distinguishable without increasing opaque coverage |
| `grinder` / chainsaw | Continuous non-stalling bite and rising contact intensity correspond to real stacks on the same target; reset visually when stacks do |
| `hookpull` / olta | The hooked catch becomes the actual haul focus; nearby victims pull toward it with truthful stun/impact feedback |
| `minibus` / cardoor | The evolved door's drop ends in the actual ground slam/stun; no literal minibus transformation unless the sim/art already implements one |

An evolution card is not the payoff. Measure acquisition time, remaining playable time, first actual hit, hit count and meaningful affected targets before exit. Preserve the pass-7 direct/delayed/area attribution repair. A base projectile fired before evolution must remain base damage even if it lands afterward. Do not satisfy evidence with zero-HP enemies or an automatic victory immediately after the choice.

## 4. E05 · Ten authored bosses, ten distinct confrontations

### 4.1 Shared combat and animation contract

Each boss needs approach/reposition, unmistakable preparation, commitment, contact, recovery, phase transition and defeat. Recovery is shown through planted feet, exposed stance/tool retrieval and a local opening at the boss; the player should not need a text label to know when to approach. Attack vectors must be expressed by the body/tool and correct geometry. Match timing to the sim, including interrupt/cancel/death behavior.

Agility means intentional positioning, direction changes, weight transfer and timely commitment. It does not mean every large boss sprints like Arda. A heavy Captain can feel capable by closing space, bracing and using the anchor; a nimble boss can change position faster while still committing to a fair direction. Before commitment, a boss may track according to its existing rules. After commitment, preserve the promised safe lane; no hidden homing or instant turn to catch a correct dodge.

Avoid two opposite failures: a passive boss that can be circled indefinitely without a useful opportunity, and a boss whose ordinary earned-build fight ends before its identity appears. First try useful approach positioning, reachable recovery, first-signature scheduling and meaningful phase combinations. Do not impose an unskippable health gate or invulnerability monologue to stretch a strong player's kill. An exceptionally strong run may legitimately dominate a familiar boss.

Every encounter must remain winnable without a specific weapon, a paid revive, a perfect evolution or an unavoidable damage trade. Counterplay may include existing Dash, movement and authored props, but never a jump/parry button the game does not have.

| Boss | Spatial/tactical identity | Animation and second-pattern direction | Opening and payoff |
|---|---|---|---|
| L1 Cook | Teach close commitment versus stepping back in; feel physically threatening without overwhelming the first run | Plant a foot, rotate shoulder/hip and carry the cleaver through its real arc. Distinguish existing ranged/secondary action through another preparatory silhouette. Stable size throughout | A clearly lowered weapon and brief recovery near Arda invites the first punish; fall releases the shutter path |
| L2 Switchkeeper | Read hook reach and rail-aligned danger, then cross the committed line | Hook shoulder draws back, line tightens, body follows. Rail attack uses a visibly different alignment; turn before commitment | Hook retrieval or switch reset leaves a reachable side; cleared rails point toward the next route |
| L3 Roaster | Distinguish a projected throw from a charge and choose movement accordingly | Throw uses arm/tool release and ballistic path; charge uses crouch/lean, push-off, braking. Never use identical windups | Missed charge or tool retrieval visibly costs effort; spent prop/cleared cart remains in the scene |
| L4 Linekeeper | Read the live band and alternate the side from which to approach | Hand/tool action connects to actual cable/relay state; live and inactive bands differ in shape as well as hue | Recovery appears at the currently usable approach, not beyond an unavoidable live band; defeated relay goes inert |
| L5 Vatman | Move between track avoidance and closing to punish; eliminate indefinite unrewarding orbit | Preserve latest closer positioning and longer plants. Tram, bell and charge have separate body cues; feet stop skating during recovery | An ordinary earned melee build can reach openings; recovery time is not consumed entirely by travel. Exit transitions to Mom's information |
| L10 Tower Keeper | Falling weights control space; approach through the area just vacated | Brace against counterweight, pull, release and absorb recoil. Weight/cable motion matches the damaging landing | Guard lowers after the committed sequence; courtyard stillness and a newly open path provide relief |
| L15 Dock Bride | Cart lanes and rope pressure ask different evasions | Cart push has grounded hands/hips; rope has slack, tension and release. Direction changes prepare the next attack visibly | Rope/cart recovery can be approached from a legible angle; quay aftermath makes the absence of danger tangible |
| L20 Big Fisher | Bait the cast, leave the net's dangerous area, close during the reel | Rod bends, line leaves the tip, net opens, reel pulls through shoulders. Caught-line state must be real and readable | Clear reel opening, physically slack gear on defeat; Kaan's entrance changes the journey |
| L25 Captain | Anchor tow controls a line while spice pressure changes the approach | Anchor mass, chain tension, planted boots and struggling pull are essential. Preserve latest brace work. Different preparation for spice | The committed tow leaves a useful punish and an intelligible endpoint; the aftermath belongs emotionally to Kaan |
| L30 Ticket Man | Punch and signal create distinct near/far problems; movement connects them | Full-body punch from a planted foot, separate signal/rail actuation pose. Preserve the earlier phase change/alternation under evaluation | Avoid alternating only safe distant signals or dying before a signature on typical builds. Earned dominance remains possible; opened points produce the walking route onward |

The scene appendix specifies the entrances and aftermaths. During live attacks, a safe escape and hero position take priority over boss portrait, camera close-up or cinematic lighting. Phase change should alter the tactical relationship of known attacks, with an intelligible cue; it is not simply a flash and faster cooldown.

### 4.2 Fairness and challenge evaluation

Use three earned power bands at each boss: struggling but plausible, typical and strong. Derive them from saved normal campaigns and observed progression; do not substitute maxed debug stats. Include unfocused early choices and imperfect evolution pursuit. Compare melee/close, ranged and terrain/control plans.

Report time to first threat, boss-only duration, attack families actually used, reachable openings, damage taken by cause, time spent only travelling and rewards afterward. A long fight is not proof of difficulty; a short fight is not automatically a defect. Inspect whether decisions mattered. Historical pass-7 Vatman orbit and two-windup L30 clears are diagnostic cases to rerun after the latest changes, not evidence that those failures still exist.

Test both an evasive player and one who attempts to punish. Evasion alone should not make a long fight feel like waiting; pressure can reposition the boss without invalidating correct movement. Failed attempts should teach a specific response. Avoid simultaneous lane closure, fresh area damage and forced objective hold that leave no meaningful exit, especially L13, L16 and L19. Validate hazard overlap against actual reachable geometry, not just spawn distance.

## 5. E07 · A campaign that increases mastery, not only numbers

| Levels | Experience to reinforce | Escalation boundary |
|---|---|---|
| 1–5 | Movement, contact, healing, one build direction, first intentional boss punish | Do not introduce all systems before the player understands the street; each boss teaches a different response |
| 6–10 | Carry/place decisions, shelter versus speed, readable world mechanisms | Add spatial choice; avoid consecutive stationary progress-ring chores |
| 11–15 | Terrain consequences, moving machinery and complementary enemy roles | Teach a hazard before mixing it with heavy area pressure; L13 must preserve an exit |
| 16–20 | Wind/water timing, rescue and deliberate returns to an objective | Differentiate displacement, damage and slow; recovery and Kaan's arrival provide relief |
| 21–25 | Cooperation and reciprocal help; locally remembered decisions | Kaan visibly changes play. Relationship comes from action, not a bought stat or a menu-only meter |
| 26–30 | Combine understood mechanics and pay off route knowledge | Vary tasks, spaces and enemy combinations; maintain the family/Bazaar intention without adding another onboarding avalanche |

Permanent progress must change the player's experience. Returning to an earlier threat should make increased competence/power perceptible. Do not secretly scale that threat to cancel the upgrade. Later content adds relationships among known threats; increasing HP alone is insufficient. Keep several viable build identities and a useful defensive pivot when a recipe is unavailable.

Produce one pacing strip per level: arrival → first decision → pressure → opportunity/recovery → objective consequence → boss/exit → reward/intention. Record actual movement/waiting/combat time from earned runs. Flag repeated patterns across neighbors and long stretches with no decision. Repair travel through layout and event placement before filling every empty second with enemies. Quiet has a purpose when it makes a new place, relationship or consequence readable.

Success means the player can describe what was different in each district and why a chosen tool/route helped. It does not require an entirely new mechanic in every level, constant escalation or unlimited novelty. Repetition becomes satisfying when it permits mastery and meaningful variation; it becomes stale when decisions and outcomes stay the same.

## 6. Required handoff for this appendix

Deliver the actual roster manifest, all 17 base/all 18 evolution animation records, ten boss cards with measured earned-build evidence, all-30 pacing strips, before/after normal-speed footage and known limitations. Mark an asset replacement as proposed/produced/integrated/observed separately. No boss or weapon is complete from a still image alone. Use [the acceptance appendix](PRD-EXPERIENTIAL-ACCEPTANCE-2026-11-18.md) for the shared checks and report format.
