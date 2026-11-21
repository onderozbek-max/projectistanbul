# First 30 levels boss and weapon production specification

Companion to the [production brief](PRD-FIRST30-EXPERIENCE-RESET-2026-11-19.md). Every named row is required. Choreography below is proposed direction, not a claim that it was newly witnessed or already implemented. Preserve actual encounter facts and native story; intentionally changed rules need config, balance and decision records.

## 1. Physical animation must be authored rather than implied

Source diagnosis: `prototype/js/view/boss-acting.js` selects two walk cells for seven atlas bosses; `boss-joints.js` transforms sole/lower-body, torso and head bands. `boss-gestures.js` adds action profiles. This supports some loading but cannot reveal a missing knee, passing foot, elbow articulation, new facing or hand regrip. `boss-defeat-fx.js` already supplies a 1.47-second transform/fade with profile fragments. More profiles or longer durations cannot by themselves satisfy this specification.

For each boss, inspect the current source art at actual display scale. Use existing approved artwork where it can express the action; author additional poses or separated limb/tool artwork where it cannot, through the existing art pipeline and available authorized tools. Do not add a paid service/dependency or revive retired procedural character/district art to avoid the task. If the required art cannot be produced with available tools, identify the exact missing asset/poses, prepare the production brief and continue other work; mark that boss's craft incomplete.

Required body behavior:

- **Locomotion:** contact, weight transfer, passing and opposite contact; pace follows distance actually moved. Idle breathing does not move planted feet. Stop/brake and restart visibly differ from walking.
- **Turning:** feet and hips redirect mass before the upper body/tool finishes. Avoid instant mirror snaps, backward sliding, full-body spinning while feet run straight, or tool crossing through the torso on reversal.
- **Attack:** anticipation → commitment → contact/release → follow-through → recovery. Each phase is connected through body mechanics; the pose cannot remain unchanged while floor warnings perform the whole attack.
- **Tools:** held tools have one consistent grip and actual source; heavy tools lead/lag with weight; ropes/chains go slack and taut according to movement. No duplicate painted-plus-overlay tool or weapon teleport between hands.
- **Contact:** momentum visibly meets resistance on real contact; misses finish differently. Tiny perpetual jitter is not weight. Large constant squash is not anatomy.
- **Scale:** normalize from body landmarks/sole/hip, not entire frame bounding box including weapons. A raised or extended tool must not shrink the actor. Shadow follows ground contact and elevation, not decorative sprite center.
- **Interruption:** target behind, wall contact, crowd collision, cancel, stun and death from any phase preserve body/tool continuity. No ghost attack after defeat or hit from an unshown pose.

A simple anatomical contact sheet can diagnose shape errors, but each completed sequence needs normal-speed motion review. Judge first at ordinary portrait scale, then zoom in for diagnosis. Slow motion helps locate a discontinuity; it does not prove fluid normal-speed performance.

## 2. Common boss encounter contract

Every boss must pass individually: conspicuous silhouette in its own arena; readable physical tell; characteristic movement; at least one distinctive tactical response; credible weapon/contact; exploitable and visible recovery; memorable specific defeat; orderly reward and onward motivation.

Before starting damage, frame the tool/source and nearby evasion space during the existing protected entrance. Use restrained camera emphasis only while staging is protected; restore normal combat visibility before attack. Local background quieting, directional light and value separation must work throughout the fight, not just the introduction. Test without boss title/health bar, in grayscale, muted and with reduced effects. These are review diagnostics, not additional settings to ship.

Bosses do not all need Arda's agility. They need comparable **intentionality and physical detail**: nimble pivots, measured shuffles, heavy hauling, sudden commitment and labored recovery should feel different.

First-entry balance asks whether a player can read a signature, respond and recognize the consequence. Weak/injured entry, typical invested entry and strong replay are different cases. Base movement and ordinary choices must permit a reasonable answer; specific speed/melee/ranged builds may exploit different advantages. No required weapon lottery, hidden HP counter-scaling, forced minimum battle duration or gratuitous invulnerability to ensure all animations play. A strong rematch can end quickly. An ordinary first boss repeatedly dying before expressing its identity requires sequence/space/damage-budget correction.

For combinations, define source, target-selection time, tracking cutoff, warning, active damage, follow-up, safe response and recovery in one attack record. Read current telegraph floors; do not shorten them to simulate agility. New phases recombine or evolve learned rules before adding overlapping danger. Keep at least one reachable response for baseline movement in intended first-entry conditions. Review crowd/approach attrition separately from boss difficulty.

Defeat starts at the factual killing blow. Preserve the last attack's pose and tool position; interrupt it into loss of support, tool resolution, body settling and changed arena. The exact length is tuned by viewing; another 1.47-second wrapper is not completion. Avoid universal confetti/gore/zoom. Rewards, dramatic text and evolution must not cover the decisive action. Repeat fights keep satisfying short punctuation without imposing a long unskippable cinematic.

**Required data repair:** current `sim/bosses.js:onDeath` replaces live mode with defeat and preserves only part of the attack state; Captain has special settled-tool handling. Preserve a small factual pre-death snapshot of action phase/time, facing and relevant tool/rope anchors before cancelling owned hazards. The view can continue that pose into the death performance without querying future sim state or resurrecting damage. A replacement death sprite that always starts from the same stance is not continuity.

**Machinery contact rule:** operating a lever/switch requires a pictured, reachable control and actual hand contact. Where the current mechanic uses a remote source, show a credible connected handheld relay/signal or deliberately revise placement/approach. Do not make a boss reach into empty space and call it apparatus operation. Preserve collision and source consistency when repositioning scenery.

## 3. All ten boss specifications

### B01 Cook at L1 (`cook`)

**Identity and entry:** apron, body and cleaver separate from warm paving and food-stall detail. Frame his physical possession of the encounter pocket; preserve familiar restaurant origin. Short purposeful pursuit must look different from a regular zombie approaching.

**Performance:** support foot → hip → shoulder → cleaver. Distinct overhead load, lateral cut and deliberate release/catch for thrown blade. Heavy steps with abrupt commitment and braking. Never let the blade orbit while the hand remains idle.

**Tactical question:** bait commitment, leave the threatened lane/arc and exploit recovery. Preserve close combo, throw and approach; distinguish their sources. Ranged builds can punish a throw; close builds can punish overcommitment. Present a signature early enough for ordinary first-entry learning without scripting invulnerable demonstrations.

**Defeat:** last blow breaks stance, supporting knee gives, cleaver meets pavement and settles, body follows. Test a kill during pursuit, throw and close commitment. The connected tool/body motion must carry satisfaction with decorative fragments disabled.

### B02 Switchkeeper at L2 (`switchkeeper`)

**Identity and entry:** hook silhouette and working switch hand separate from rails. A lateral working stance establishes control of track geometry.

**Performance:** quick grounded shuffle into position; hand reaches the switch before `switchRails`; planted hook pivot before `switchHook`. No backward sliding in idle pose or remote rail activation with unrelated arm motion.

**Tactical question:** cross the selected rail lane, then resist blindly following into the hook. Closing during switch operation differs from escaping a committed hook. Demonstrate the distinction early in ordinary builds.

**Defeat:** hook grip releases, tool contacts ground, switch hand slips and weight collapses toward the apparatus. Machinery resolves only from actual simulation state; no invented train strike for spectacle.

### B03 Roaster at L3 (`roaster`)

**Identity and entry:** warm body/tool remain legible against flames and warm scenery; show low center of mass and loaded stance.

**Performance:** heel lift and forward body push initiate charge; braking steps end it. Separate tool/chest preparation and orientation for heat release. Flames support the action rather than substitute for moving limbs.

**Tactical question:** bait a committed straight attack, move sideways, punish braking; heat makes lingering in the previous safe approach a different decision. Existing short typical-power cases are teaching probes, not a demand for a universally longer health bar.

**Defeat:** interrupted momentum, tool tilts, embers diminish and heavy body settles. A fire burst over a fading sprite does not pass.

### B04 Linekeeper at L4 (`linekeeper`)

**Identity and entry:** a nimble cable worker, distinct from Switchkeeper's broad hook motion; readable source-to-wire connections.

**Performance:** deliberate sidesteps, planted relay gesture and visible tension before cable-knot release. Show actual energized lanes as consequences of `arcRelay` and `arcKnot`; hands must manipulate the connected source.

**Tactical question:** leave the marked lane and anticipate the local knot instead of immediately returning to the same position. Mobility facilitates repositioning; range exploits denial windows; baseline speed remains viable.

**Defeat:** hand loses tension, cable slackens, local power visibly stops, body settles. Sparking effects yield to the actual slackening cable.

### B05 Vatman at L5 (`vatman`)

**Identity and entry:** first district culmination; broad planted body, lever, bell and tram form a workplace whose geometry the player understands.

**Performance:** full arm/shoulder lever operation, separate bell-hand action and heavy launch/braking for charge. Ensure each source moves before its consequence; a common crouch cannot stand for all three.

**Tactical question:** combine lane crossing, radial spacing and committed approach across the existing phases. Escalate familiar geometry without surprise unavoidable overlaps. Keep approach damage analysis separate from fight analysis.

**Defeat:** lever slips, knees buckle, cap/body settle, actual machinery winds down; final bell motion can punctuate the result visually on mute. No phantom tram collision. Quiet the interface long enough for this district finish to register.

### B06 Tower Keeper at L10 (`bellkeeper`)

**Identity and entry:** connect raised mechanism/weights to the braced body before the first landing; background tower detail must not hide the source.

**Performance:** load through arms/back/support leg, release, successive weight consequences, then visibly spent posture. Charge preparation differs from weight preparation.

**Tactical question:** watch the last falling weight, move into the reachable opening and punish. Melee benefits from timing; range benefits from safe observation. Recovery shape must not look like another hostile circle.

**Defeat:** currently pending weight action resolves or cancels consistently with simulation; pulling arm drops, stance gives and body settles with local dust. Never spawn another damaging weight as decorative death spectacle.

### B07 Bride at L15 (`dockBride`)

**Identity and entry:** readable dress/rope silhouette and dock-cart lanes. Show the rope's weighted end and source before broad effects.

**Performance:** light crossing steps, dress trailing torso, support-foot pivot, rope slack → taut → sweep → slack. Face the source lane when signaling a cart. Cart and rope actions require different body performances.

**Tactical question:** distinguish rotating threat from incoming lane; make the existing cart-created exposure visibly player-caused. Cart collision changes her balance/rope tension and gives a credible opening. It must be understandable without an instruction or telemetry log.

**Defeat:** actual sweep phase is interrupted, weight drops, rope slackens onto dock, pivot fails and dress settles. Ribbon confetti cannot replace this action.

### B08 Big Fisherman at L20 (`bigFisher`)

**Identity and entry:** rod, line and net remain distinguishable from bridge clutter and crowd; body reads as a person applying tension.

**Performance:** flex/load rod, pay line out from actual tool, plant legs/back to reel; separate spreading and releasing the net. Direction changes cannot snap the line source or teleport the hook.

**Tactical question:** lateral escape from cast, route choice around net, visible longer recovery after a missed cast. Base movement remains sufficient; speed and range offer advantages rather than admission requirements.

**Defeat:** tension releases, rod dips, line falls and body settles before Kaan recognition begins. Do not grant Kaan assistance before his actual join. Preserve the rhythm of reunion after danger.

### B09 Captain at L25 (`quayCaptain`)

**Identity and entry:** chain origin, anchor and braced body remain readable under late-game builds. Weight and practiced heavy movement define him.

**Performance:** feet brace, torso leads arm, anchor travels, chain draws taut, hips/shoulders haul and spent stance follows retrieval. Small balancing corrections and genuine mass matter more than agility or camera shake.

**Tactical question:** plan a route around committed tow and lingering spice hazards, then exploit haul/recovery. Close burst rewards approach timing; range rewards safe angles. Repetitive orbiting should not solve every phase identically.

**Defeat:** interrupt actual haul, slacken chain, settle anchor at its actual position, lower body. Then provide space for Kaan's reaction. No execution joke, victory confetti or triumphant sting over Captain Nuri's memory. This boss's satisfaction includes emotional consequence.

### B10 Ticket Man at L30 (`ticketMan`)

**Identity and entry:** station signal arm and punch tool clearly separated; rails and service passage organize the arena.

**Performance:** precise free-arm signal, planted stepping torso driving punch, feet reorienting as player changes approach. Signal the correct rail before its activation. Avoid a punch rotating magically after target commitment.

**Tactical question:** read successive safe crossings and close-range commitment; successful signal avoidance creates visible exposure. Culminate earlier spatial learning rather than add unrelated final-boss rules.

**Defeat:** signaling arm loses authority, tool grip drops, body/tool/papers settle without obscuring the pose; cleared service route becomes the focal point. Both companions orient toward it. The result remains the end of the available slice, not a promise that L31 is playable.

## 4. Weapon geometry and ownership

The arsenal must look as though Arda causes its actions. Distinguish wielded, thrown, persistent, reactive and environmental attacks. An automatically targeted weapon still needs a credible body/tool relationship. Multiple owned weapons must not create six contradictory arms or imply the hero simultaneously holds every tool; use clear authored deployment/retraction and priorities while preserving actual fire cadence and damage. If visual truth cannot coexist with current mechanics, redesign the affected mechanics explicitly and verify balance.

**Cleaver decision for this proposed pass:** replace the continuously revolving damage segment with deliberate body-led broad cuts, including a credible backhand/return when coverage calls for it. Preserve a clear power increase over Knife through actual coverage/impact/cadence, chosen through balance checks. Do not merely repaint the existing orbit. If implementation discovers this design cannot preserve viable behavior, document a coherent deliberate throw/return alternative and its actual simulation changes; never hide revolving damage behind a held sprite.

Current Cleaver source: `sim/weapons3.js` rotates a hero-to-tip damage segment; `config-weapons.js` defines the spin. Sledgehammer also needs care: current remote cluster targeting can reach farther than a held hammer. Either communicate a deliberately remote/propagated attack with a visible source or change range/mechanics. A fake visual tether cannot reconcile an impossible physical hit.

## 5. All 17 base weapons and 18 evolutions

Every base is reviewed at ranks 1, 3 and 5; every evolution separately. Unlock levels below reflect current config, not new scheduling proposals. Verify the source again when implementation starts.

| Base / unlock | Evolution coverage | Required action and contact identity |
|---|---|---|
| Döner Knife / 1 | Cleaver | Hand grip through turns; shoulder/torso-led slice; actual damaging arc; contact-specific reaction; recovery. Rear hits need a credible backhand/reposition. Cleaver is a larger committed action, not an orbiting emblem. |
| Nail Gun / 1 | Nailstorm | Muzzle faces actual fire direction, including rear targets; concise recoil and visible projectile departure; piercing crosses actual targets. High rate uses controlled grouped recoil, not perpetual body jitter. |
| Picnic Gas Can / 1 | Cluster, Car Bomb | Hand release → flight and shadow → landing/fuse → blast. Secondary clusters emerge from their real source. Car Bomb visibly ignites the actual vehicle credited by simulation; decorative nearby cars do not fake causality. |
| Bike Chain / 1 | Cyclone, Arc Chain | One grip, slack preparation, tension outward, weighted end leading, momentum on return. Reversal does not flip chain through torso. Multiple damaging heads require a credible arrangement. Electricity branches from actual contact to actual targets. |
| Sledgehammer / 1 | Blacksmith | Knees/hips/shoulders load mass; head leads strike; contact and rebound differ from knife. Resolve remote strike versus held reach honestly. Blacksmith restoration follows confirmed hit and actual healing. |
| Saw Blade / 1 | Twin Saw | Deliberate release and independent cutting trajectory, actual bounce/return. Two saws remain two readable paths. Moving Arda must not drag an already-thrown saw as if it remains attached. |
| Blowtorch / 1 | Forge | Held nozzle produces actual directional jet; boundary/contact highlights and translucent interior preserve enemies and hazards. Distinguish jet from projectile fire and pools. |
| Manhole Cover / 2 | None currently | Heavy heave, blunt travel, real rebound and redirection. Mass and impact distinguish it from Saw Blade. Do not invent an evolution for coverage symmetry. |
| Molotov / 3 | Lake, Fireball | Bottle release/break produces pool; fireball release produces a moving projectile. Lake changes actual territory. Friendly fire must not impersonate hostile danger. Resolve the suspicious black-world recording. |
| Slingshot / 4 | None currently | Band visibly loads and releases actual projectile; small precise hit response. Escalation need not become a giant explosion. |
| Chainsaw / 6 | Grinder | Two-hand relationship, local motor vibration, actual entry/contact resistance, sustained cutting and recovery on target loss. Grinder communicates sustained engagement, not decorative wheels or an opaque fan. |
| Fire Extinguisher / 6 | Foamstorm | Nozzle follows actual cone; foam comes from it. Readable slow/displacement/spit-block consequence on affected enemies. Spray cannot hide the threat it controls. |
| Fishing Rod (`olta`) / 8 | Hook Pull | Actual release/hook/catch/tension; target moves only when sim pulls it. Death/release/cancel ends connection rather than snapping rope to another enemy. |
| Car Door / 9 | Minibus | Hand meets handle; brace/heave before shove; mass follows torso. Distinguish held offense, thrown object and placed shelter. No protection implied beyond actual rules. |
| Speargun / 11 | Net Spear | Source-aligned shaft flight and hit; net links actual victims and actual shared effects. Boss stagger is not illustrated as a fake full pin or pull. |
| Fireworks / 16 | Finale | Visible launch precedes homing/barrage; actual impacts differ from harmless sparks. Merge repeated cosmetic explosions/words at density without changing real damage. |
| Live Cable / 21 | Stormshield | Preserve connected electrocution and affected-body response; branches maintain source/targets. Reactive discharge/automatic dodge differs from player Dash. No new screen flash for every branch. |

Exactly 18 current evolutions: Cleaver, Nailstorm, Cluster, Car Bomb, Cyclone, Arc Chain, Blacksmith, Lake, Fireball, Finale, Stormshield, Net Spear, Foamstorm, Twin Saw, Forge, Hook Pull, Minibus and Grinder. Count actual IDs, not just family rows. Do not award coverage to unseen variants.

Ranks alone are not behavioral coverage. Inventory each family's geometry-changing mod forks, mastery signatures and conditional triggers: rear/multiple knife strikes, additional chain heads, saw reversals, thrown-door behavior, pull variants, spit blocking and conditional environmental/reactive evolutions. Exercise each distinct geometry/trigger at least once at a legal earned/unlocked state. This need not test the Cartesian product of every combination, but default branches cannot stand in for different attacks.

## 6. Interactions and ordinary enemy roles

For breakables, health stations, pickups, carryable props, offensive objects and placed cover, show: intact/available state → local appropriate verb → actual commitment/contact → changed object → player/world consequence → settled/empty/interrupted state. The hero's body and object must meet; no psychic operation from beyond legal range. Required and optional interactions must not compete as equal giant markers.

Health station: approach, availability, real use, interruption/resumption and empty state. Breakable: contact, material break, readable dropped reward, eventual use. Carry: grip/weight, reduced capability if actually simulated, place/throw, cancellation/recovery. Car: fuse/source, time to escape, real blast chain and cleared space. Maintain current illustrated art at each stage; no sudden procedural replacement when it breaks.

The natural first30 enemy roles are Walker, Diner, Runner, Crawler, Brute, Hardhat, Spitter, Screamer, Bloater, Parkur, Çöpçü, Çaycı, Kurye and Martı. Kasap/Zehirli fixtures do not establish extra natural campaign variety. Give each natural role an identification row: silhouette, locomotion tempo, threat tell, required response and first fair introduction. Target readability rather than highly detailed crowd animation.

Priority: Runner approach versus normal shamble; Crawler ground silhouette; armored obstruction and truthful impact; ranged source before projectile; Screamer escalation source; Bloater imminent burst and residue; Parkur/Kurye approach route; hostile Martı versus ambient bird. Higher levels combine learned roles and geometry, not solely inflated HP/speed. First sightings need space to learn; urgency cues remain repeatable after novelty barks expire.

## 7. Required combat evidence

Every boss: ordinary arena visibility, every action family, start/stop/turn, target passing behind, wall/crowd interaction, clean and dense actual builds, injury/readability overlap, all death phases, reward/control return. Record first-entry HP/build and strongest legitimate replay separately.

Every base rank 1/3/5 and evolution: stationary, moving diagonal, reversal, Dash, rear target, lost target, miss, prop hit where supported, multi-hit, boss contact, mid-action kill and pause/resume. Exercise variations efficiently in one indexed continuous clip per entry rather than dozens of nearly identical files. Label impossible/not-applicable cases with the actual reason.

Use debug geometry only to diagnose actual contact, then inspect normal presentation without it. Tests may assert truthful timing/collision and lifecycle; only observed motion can support animation judgments. Leave physical-phone/listening/player acceptance open when not performed.
