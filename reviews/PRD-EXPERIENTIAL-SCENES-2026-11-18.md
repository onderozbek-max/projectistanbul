# Experiential PRD · In-world direction and narrative continuity

**Required appendix to [the main PRD](PRD-EXPERIENTIAL-QUALITY-2026-11-18.md).** Covers E02/E04/E10/E12/E14. This is a shot/action specification for the execution agent. It replaces vague requests to “add cutscenes.” Reuse and improve the existing scenes rather than stacking another cinematic layer over them.

## 1. Scene grammar and runtime ownership

Every scene connects **the player's action → a physical consequence → a character reaction → the next intention**. A camera pan or caption without that chain is decoration. Most connections happen while the player keeps moving. Larger protected scenes belong at safe boundaries and major emotional turns.

| Mode | When to use | Simulation and control | Typical treatment |
|---|---|---|---|
| LIVE | Mechanism, rescue, carry/placement, local callback, companion action | Normal danger and movement continue; no hidden invulnerability or clock pause | 1–3 s of overlapping world action; restrained framing only when the hero and danger stay visible |
| PROTECTED | Cold open, safe boss entrance, selected post-boss story | Pause all gameplay clocks together; presentation time runs separately; no attacks or new spawn advance behind the shot | Brief staging plus existing readable dialogue/comics; explicit, safe return to control |
| RESULT | Clear already established, reward settlement and story presentation pending | Use the existing canonical result transaction exactly once; scene cannot manufacture another win | Aftermath first, earned result clearly shown, then optional progression/next level |

Do not turn live tasks into protected cinematics. A lever pull that still exposes Arda is gameplay; its animation cannot falsely promise safety. Conversely, a protected boss introduction cannot leave poison ticking, bonus time expiring, projectiles arriving or companion damage resolving while input is unavailable. Include cooldowns, status durations, mission timers, hazard motion and queued level-up presentation in the interruption audit. Effects whose timing is purely visual may finish or freeze according to a documented policy; their disappearance must not erase an active hazard.

### 1.1 Required scene record

Each scene definition records: ID; actual sim/result trigger; prerequisites and character knowledge; live/protected mode; actors and world anchors; phase timings; body actions; camera; light/audio; dialogue IDs; skip/retry behavior; semantic end state; save/resume behavior; fallback; acceptance capture. Keep voice text in `js/dialogue/`, independently authored in TR and EN. Do not put translated script text in config or art.

Presentation listens to factual events. It never marks an unfinished task complete to reach its final shot. Tie a rope going slack to the real release, a gate opening to actual clearance, and a rescue response to the survivor reaching safety. For a long moving mechanism, interpolate the visual through its actual motion state and keep collision truthful; do not add a fake 1-second flourish after the path has silently become traversable.

### 1.2 Skip, repeat and interruption

Preserve the existing 0.6-second deliberate skip and current first-view policy. Repeated attempts shorten already-seen boss staging to a readable in-world readiness cue; never force the full portrait/comic again. A skip applies the correct presentation end pose and camera, releases its own control lock, and cannot duplicate loot, reset a boss, grant a clear or bypass an unfinished task. Essential destination information remains in the existing log/objective summary.

Keep committed result state and pending presentation state separate using the current save architecture. Resume a pending aftermath or safely finish its presentation; do not replay settlement. Mark a scene seen on completion or deliberate skip, not merely on entering it. If the current run is not resumable, follow the established run-recovery policy rather than inventing full mid-run saving under this brief; permanent choices/rewards must still be correct.

On app background/lock, stop scene time and audio coherently. Resume through the existing explicit resume interaction; discard stale pointer/joystick/Dash intent from before the scene. Returning camera/letterbox and control ownership complete before damaging simulation resumes. Missing artwork uses the approved current-art recovery path and readable text/neutral composition; never revive retired placeholder sprites or block forever on a failed image. Do not claim a failure fallback is artistically accepted until it is viewed.

### 1.3 Editing and pacing limits

Existing story budgets and minimum subtitle read times still apply. Do not compress a line below its reading time to hit a shot duration. World choreography below often overlaps existing dialogue and replaces static waiting; it is not additional mandatory runtime. No new bark or bust for every row. Maintain the established route/boss bust limits, call limits and suppression during telegraph peaks/card choices. Current native dialogue/knowledge fixes take precedence over stale examples in older story documents.

Keep camera continuity: establish the hero and exit in a shared frame before shifting attention. Combat camera never crops the usable escape region to enlarge the boss. Reduced motion uses stable composition and fades. Mood changes come from posture, environment, contrast and rhythm, with color as reinforcement. Restore the ordinary district palette gradually after the beat; do not wash out ground warnings.

## 2. All-30 world-action direction

These are required treatments of existing objectives, not 30 extra movies. Default mode is LIVE. Use each actual objective's duration and current geometry. “Finish” below means the corresponding sim event occurred, not that a cosmetic timer elapsed. Keep callbacks compact and do not invent branching plot.

| Level / scene ID | Trigger and staged action | Physical consequence, next intention and replay behavior |
|---|---|---|
| 1 · `E10-L01-shutter` | After the Cook's actual defeat, give his weight a grounded fall; the shutter begins its existing release. Arda's attention moves from the body to the moving threshold | Show opening clearance and the street beyond in one frame. Let the call follow its actual trigger. Full-health food remains visibly saved/available under current rules; no false healing celebration. Repeat keeps the practical opening |
| 2 · `E10-L02-tram` | At the completed call/stop action, tram warning precedes visible rail motion. Nearby crowd turns toward the approaching event before the tram reaches it | Tram, crowd response and newly usable lane are a single causal view. Retain control and a safe waiting side. Repeats keep warning/path information, omit any already-seen flourish |
| 3 · `E10-L03-cart` | On deliberate prop lift, hands reach the actual grip and legs take the load. On strike/placement, the object travels from those hands into its real outcome | Preserve the spent or placed object's illustrated identity. The cart task visibly frees the route; never dissolve the object while an unrelated progress ring completes |
| 4 · `E10-L04-cables` | For each required cable, Arda's working hand meets its anchor; tension releases into the actual pulse. The next actionable cable/lane responds | Different sides create a movement decision. Grounded cable ends and inactive relay sections make completed work persistent. Do not play the same close-up three times |
| 5 · `E10-L05-depot` | Crank turning physically drives the depot opening. In the aftermath, the tram/bell motion comes to rest before the call and downhill intention | Use a small release of sound/visual pressure. Mom's actual lines establish the family move; no duplicate revelation. Repeat keeps exit direction and log access |
| 6 · `E10-L06-hoist` | Arda works the hoist with visible grip/torso effort; cable tightens and counterweight travels. A nearby portable bench retains its choice invitation | Crossing becomes usable at the real clearance point. Let movement continue through the widening gap. No camera cut that hides an approaching enemy |
| 7 · `E10-L07-musician` | At route choice, the musician turns, looks to the chosen lane, and walks that actual path. Shelter/diversion changes nearby crowd behavior | At safety, a short glance/gesture acknowledges what actually helped. Store only a qualifying completed choice; defeat does not count as a successful escort |
| 8 · `E10-L08-bell` | Pull/actuation moves the bell; the nearby group visibly redirects in response. Show departing enemies and available passage together | The player's opportunity is the newly empty space. Sound-off players understand the link through bell movement, enemy turn and path clearance |
| 9 · `E10-L09-weight` | Hands/stance acknowledge the carried weight; setting it in its actual seat lowers or aligns the footbridge | Deck and collision settle together. L7 callback is a small environmental/character acknowledgment at arrival, never an extra stop or unexplained new reward |
| 10 · `E10-L10-courtyard` | Gate mechanism and counterweights physically connect. After Keeper defeat, the final moving weight/cable settles and guard posture disappears | Let the courtyard breathe, then suggest the Karaköy direction through existing music/story cues. Repeat omits prolonged contemplation |
| 11 · `E10-L11-cargo` | Actuation moves the hook toward its real load; cable takes tension and cargo leaves the obstructed position | Show the changed dock gap and keep actors clear of moving collision. No load passing through Arda or appearing to levitate without its hook |
| 12 · `E10-L12-mooring` | The actual ferry-line release loosens tension, rope falls from the contact point and the ferry responds within its current movement rules | Bench cover/offense consequence remains visible long enough to understand the choice. Do not invent a later returning dock scene; the local payoff is sufficient |
| 13 · `E10-L13-points` | Points lever physically shifts the rail connection before the tram uses it. Establish the lateral escape before machinery occupies the lane | Rail warning remains above acid/blast effects. Keep full control; no dialogue/camera flourish during overlapping hazards. Complete the hazard-overlap check before polishing the shot |
| 14 · `E10-L14-shutters` | Each shutter responds from its actual latch/handle; bin lure or offensive use causes visible enemy movement/displacement near that opening | Newly opened space changes the next position. Vary framing through actual geometry; do not repeat three identical frozen progress shots |
| 15 · `E10-L15-quay` | On Bride defeat, rope loses tension and the last cart settles where its sim state permits | Restore a quiet patch of quay and water; let Arda look toward the next crossing. Existing aftermath/comic carries the story without an added explanatory speech |
| 16 · `E10-L16-rods` | Work from the safe end. The disabling action bends/lowers or releases the specific active rod mechanism | Dangerous line visibly becomes inactive and the route opens. Do not celebrate at the dangerous center or imply every nearby rod is harmless if only one is disabled |
| 17 · `E10-L17-rescue` | When the player returns and completes the rescue, Arda leans/braces and the stranger rises from the real railing-side anchor | Survivor clears the edge, reaches safety and gives the actual food/reply. Cover/diversion changes the immediate behavior/reaction. Keep the skiff in water and the deck passable |
| 18 · `E10-L18-screens` | At each completed screen, cloth/rigging reacts against the wind before securing; hero uses the visible fastening point | Cloth motion and directional debris quiet on the protected side, reinforcing the actual movement-pressure change. Mute/reduced-motion preserve safe-side shape |
| 19 · `E10-L19-waves` | Water builds from the existing warning source; bracing posture faces the pressure, then releases after the wave | Show which side remained usable and prepare the next cycle without a new movie. No extra camera sway obscuring the warning; action and displacement match actual rules |
| 20 · `E10-L20-lift` | Lever/lift motion physically opens the approach. After Fisher defeat, line and net fall inactive before Kaan enters | Transition to the detailed Kaan sequence in §3.2. Enemy gear cannot remain visually active while the emotional scene runs |
| 21 · `E10-L21-awning` | Arda works the hinge/rope while Kaan visibly sweeps the eligible nearby threats aside; the cloth rises from the joint effort | Show whose action created room, then restore ordinary companion behavior. No floating “friendship” popup required and no immunity if the support failed |
| 22 · `E10-L22-market-cart` | Offensive branch: cart crosses into the actual pack with impact. Cover branch: Arda lowers it at the real crossing position and moves around its footprint | Show protection/pressure change during its finite life. Preserve successful placement precedence and first-clear choice persistence; no memory from an incidental early touch |
| 23 · `E10-L23-sacks` | Each sack transfers from the real carry pose onto the target pile. Kaan's exposed help window appears through actual threats and body attention | Successful Dash help or placed cover produces his visible recovery/acknowledgment. Missed help remains neutral; do not fabricate gratitude, block the story or punish with a relationship-loss popup |
| 24 · `E10-L24-trolley` | Signal changes, trolley begins moving, crowd/lane responds; keep the waiting side and crossing visible | L22 recall belongs before/after the danger peak, at most one short existing line/gesture. Crossing becomes safe when actual machinery clears |
| 25 · `E10-L25-quay-farewell` | Actual Captain defeat releases anchor tension, settles the chain and removes active spice danger | Use §3.3. Kaan's grief and decision need room; suppress victory fanfare, quips and upgrade promotions until the handoff finishes |
| 26 · `E10-L26-departure` | Lever visibly actuates the departure mechanism; railcar wheels start, body moves and trailing edge clears the crossing | Hero remains outside the real moving collision. Rails now lead to a usable service route; do not frame this as boarding transport or leaving Istanbul |
| 27 · `E10-L27-guide` | Shelter branch visibly changes pressure on the guide. Light branch illuminates the actual destination/next pressure area before the guide commits | Guide takes the selected viable side and reacts at safety. Contrast with L7 through light, enclosed acoustics and geometry, not another identical escort caption |
| 28 · `E10-L28-fuse` | Real fuse pickup/installation completes the electrical connection; the clock mechanism becomes active in the current useful interval | Show energized path and the next crossing opportunity together. No misleading real-world time or long wait just to admire the clock |
| 29 · `E10-L29-lights` | Light branch previews the relevant unpowered circuit; lure branch visibly draws a real group aside. Required lights then activate from their actual sequence | Distinguish optional branch benefit from the mandatory sequence. Persist the actual completed choice; do not mark all lights solved when the lure fires |
| 30 · `E10-L30-passage` | Actual points movement and Ticket Man defeat resolve their respective conditions; switch geometry and service passage show the route's completion | Use §3.4. L29 callback is brief and factual. Bazaar route follows from safety and destination; no new claim that the family is waiting in the apartment |

## 3. Four major sequences, staged beat by beat

### 3.1 L1 · A person becoming a survivor

**Current source baseline:** `prototype/js/view/coldopen.js` uses roughly 28 seconds, dinner → Cook → news → diner turns → three memory panels → automatic knife grab/strike → control. First player action is movement. Preserve this control lesson; the older document's mandatory tap/swipe is not the active implementation.

| Existing beat | Specific upgrade | Camera, sound and information |
|---|---|---|
| 0–2.5 s, dinner | Give Arda a breathing/hand-rest pose; stranger and Cook occupy grounded positions, not frozen cutouts | Establish table, counter, exit and Arda in the same illustrated restaurant. Diegetic sizzle/room sound before threat |
| 2.5–6.5 s, Cook | Small credible work gesture and head response to the interruption; tool remains in the actual hand | Favor composition over a large zoom. Keep the current native line and readable subtitle timing |
| 6.5–13 s, news | Attention changes through head/shoulder turns; use the actual news cue and reaction rather than an unrelated flash | Briefly reduce room chatter; show who noticed what. Do not add a real brand/state actor or extra exposition |
| 13–16.5 s, diner turns | Shoulders tighten, weight shifts and the diner rises/turns; the stranger recoils through a planted step | Threat advances from a world position the player can track. No size pop or teleport; restrained contact sound |
| 16.5–23.5 s, memories | Preserve three illustrated panels and the existing native rule lines; improve reading order/crop if needed | This is the comic layer's job. Do not add a second flashback movie or reread all three lines in another channel |
| 23.5–24.2 s, grab | Arda's gaze leads the hand; hand meets the knife, grip closes, knife leaves its counter anchor and shoulder sets | Keep object-to-hand continuity. The automatic grab teaches readiness without a new button |
| 24.2 s onward, strike/release | Feet brace, torso rotates, blade reaches the true target, target reacts and both settle. Stranger retreats with articulated steps | Contact sound and brief controlled emphasis occur at contact; preserve the short apology and existing hit-stop guardrails |
| End, control | Remove framing, settle to the playable camera and reveal the same reachable exit | Movement is immediately responsive. No stale press produces a Dash. An already-seen retry begins in play under the current shortcut |

The timeline is the current structure to improve, not permission to lengthen it. If the native line needs longer reading, trim decorative waiting first. Show a first-run uninterrupted capture from launch to first useful movement and a retry capture. The stranger is not Kaan. Do not introduce friendship history between them.

The Cook boss later in L1 should visually connect to this person/tool identity. His encounter cannot shrink because a combat pose uses a differently padded frame. The first actual healing and first useful punish should be as understandable as the opening knife contact; a beautiful intro does not compensate for unclear play.

### 3.2 L20 · Kaan becomes a travelling companion

**Trigger:** Fisher actually defeated and the encounter is safely resolved. **Mode:** RESULT/PROTECTED. **Purpose:** change Arda's isolation into a practical partnership. Use about 5–7 seconds of world acting overlapping the existing scene/comic, with dialogue afforded its full reading time.

1. **0–1.2 s, pressure releases:** Fisher's rod and shoulders lose tension; the line/net visibly goes slack. Remove active danger through the actual resolution, not a cosmetic fade. Water/wind returns as the fight mix falls away. Arda catches his balance rather than instantly posing for a reward.
2. **1.2–2.8 s, human entrance:** Kaan appears from an established safe bridge approach, walking with a human cadence and open/non-attacking posture. Show both characters before enlarging either. No teleport behind Arda, no weapon raised like a new boss.
3. **2.8–4.5 s, mutual assessment:** Arda turns his head then body; Kaan stops outside personal striking space. Their posture eases. Allow a brief silent recognition before the existing first dialogue/comic panel.
4. **Dialogue, facts in order:** Arda establishes his Ataköy destination before Kaan promises to help him there. Kaan's connection to the Captain/boat motivates checking Eminönü first. Use the latest approved native lines; do not manufacture extra exposition or name Paşa repeatedly.
5. **Exit pose:** Kaan turns toward the Eminönü route, then waits/sets off according to the actual transition; Arda follows willingly. Companion help starts on its eligible market routes, not retroactively during the Fisher fight.

**Acceptance:** with sound muted and dialogue then reviewed separately, viewers identify “new human ally” and the next joint intention. On retry, shorten staging; preserve factual log access. The scene never claims they knew each other in the restaurant.

### 3.3 L25 · Captain farewell and a chosen commitment

**Trigger:** actual Captain defeat, with Kaan's current/saved relationship facts resolved by existing rules. **Mode:** RESULT/PROTECTED. **Purpose:** let a place and relationship matter before the next objective. About 6–8 seconds of world acting can overlap existing farewell material; do not add eight seconds before every panel.

1. **0–1.5 s, weight:** Captain's pulling arm gives way, anchor/chain tension releases and his body settles with mass. The chain lands from its current geometry. Arda takes a recovery posture; no loot burst over the face, no victory sting yet.
2. **1.5–3 s, recognition:** Kaan moves into the shared frame from his real nearby position, stops short and lowers his shoulders/hands. Recognition belongs to him; Arda looks at Kaan rather than delivering information he cannot know. Clear optional barks and combat UI emphasis.
3. **3–5 s, silence/object:** Hold a modest stable composition including Captain, Kaan and the boat/chain. If the approved cap artwork is used, it remains a world remembrance on the boat, not a newly invented quest item. Bring back water/wood/rope ambience and the restrained farewell motif. No melodramatic strobe, camera orbit or repeated slow-motion collapse.
4. **Existing farewell/comic:** Select the correct neutral, current-help or stored-help variant from actual facts. A nod or reciprocal steadying gesture can reinforce the earned variant; it must not appear on a missed-help run. Keep the latest restrained native dialogue. Do not turn the Captain into a joke or narrate Dad's future letter.
5. **Decision to leave:** Kaan turns toward Arda, then toward the walking route. Their spacing closes slightly; the choice to continue together is visible. The next intention is helping Arda reach home. Only after this handoff may the result/reward music and progression UI take attention.

**Acceptance:** compare all supported relationship variants, a skipped scene and suspend/relaunch during the farewell. Each awards once and gives a coherent next intention. The tone survives mute; the melody enhances rather than supplies the entire emotion.

### 3.4 L30 · A completed act with a credible next destination

**Trigger:** actual win with station route conditions resolved. **Mode:** RESULT/PROTECTED. **Purpose:** reward the first-30 journey, connect station actions to the Bazaar route and preserve the larger home objective. About 5–7 seconds of world choreography overlaps existing ending dialogue/comics.

1. **0–1.2 s, cessation:** Ticket Man settles after his true defeat; signal/punch danger ends. Show Arda and Kaan regaining their bearings. Do not award victory while the boss remains visibly attacking.
2. **1.2–2.8 s, cause becomes a route:** Frame the actual points and service passage together where geometry permits. The completed mechanism visibly connects the walkable route. A station light guides attention along it; this is not a magical new exit unrelated to the task.
3. **2.8–4.2 s, shared intention:** Arda looks from the opened passage to Kaan. Briefly acknowledge L29's real light/lure outcome only if present; old saves receive neutral wording. Keep this below Mom's call in priority.
4. **Existing call, facts in order:** Family is already safe in Sarıyer; the apartment in Ataköy is empty but useful for supplies/Dad's message. The highways are dangerous; the Grand Bazaar offers the next walking route. Use the current repaired lines. Do not re-reveal the family's move or imply the heroes board a train.
5. **4.2–7 s of world staging, placed around dialogue:** Camera returns to a shared, forward-facing view; station sounds soften and the home motif briefly connects this departure to earlier memories/farewell. The opened route remains visually present behind the final intention.
6. **Result and slice boundary:** Show earned rewards clearly, with replay/build experimentation available. Keep the first-30 review gate; no playable L31 or purchase-to-continue tease under this brief. Record the next destination so future L31 starts from the same walking intention.

**Acceptance:** an uncoached viewer can explain why they go to the Bazaar, why home still matters and where the family is. The scene must not reveal the contents of the future letter, reunite Mila early or resolve the wider chapter prematurely.

## 4. Ten boss entrances and exits

Boss entrances are short world events, normally about 1.5–2.5 seconds total at a genuinely protected boundary, with any existing readable name/dialogue treatment integrated. Where a safe protected entrance cannot be established, use a LIVE entrance with no loss of control and no close camera. Retry reduces it to a brief readiness cue. No extra damage or forced player relocation is introduced solely to stage the entrance.

| Boss | Entry action and composition | Aftermath image and emotional direction |
|---|---|---|
| Cook | Heavy step into the usable lane; cleaver comes from low carry into a prepared grip. Keep Arda and lateral escape in frame | Cleaver/arm settle, body stays correctly scaled, shutter becomes the next focus. First relief, not a long funeral |
| Switchkeeper | Hand meets the switch/hook; rail alignment answers before combat begins | Tool drops out of tension; previously threatening rail direction now points through the cleared route |
| Roaster | Plant and adjust the actual hot/throwing implement, then lean into the lane | Steam/heat dissipates locally; cleared cart/prop consequence remains in view |
| Linekeeper | Touch/raise the actual relay tool; the live connection responds from that point | Cable band goes inactive from its source. Preserve the last meaningful cut state |
| Vatman | Grounded step, hand on lever/bell apparatus, tram/track presence establishes arena scale | Machinery settles; bell resonance gives way to the call/downhill intention |
| Tower Keeper | Counterweight line tightens from the Keeper's real grip/actuation | Final weight settles, courtyard sound releases, lower guard becomes stillness |
| Dock Bride | Rope hand takes slack and cart lane is visible before commitment | Rope slack and cart rest create a quiet quay; preserve distinctive silhouette without generic explosion death |
| Big Fisher | Rod rises, visible line tests the bridge space; net remains distinguishable | Slack line and empty threatened floor make room for Kaan's human entrance |
| Captain | Boots set, anchor drags into position, chain tightens through the body | Heavy release flows directly into Kaan's farewell; no simultaneous celebratory chest overlay |
| Ticket Man | Punch hand and signal apparatus are established as distinct threats; rail space remains visible | Signal danger ceases and station route resolution leads to the Bazaar decision |

An authored entrance need not be brighter. Consider a small local exposure lift on the actor, a slight background contrast reduction and stable framing, while preserving red/shape danger cues. Do not zoom so close that the first attack feels like it arrives from outside the game. Phase transitions use a brief posture/environment change tied to the actual phase event, not a separate movie that grants arbitrary invulnerability.

## 5. Dialogue, comics and actor quality checklist

- Export the actual first-30 script in trigger order after integration, separately for TR and EN. For each line record speaker, knowledge prerequisite, outcome variant and whether it was observed in ordinary play or only declared in source.
- Preserve the latest English and Turkish audits. Write any new voice line natively from the same story fact and emotional intent; never translate an existing voice line mechanically. Prefer improving staging to adding lines that explain what the player just saw.
- Give actor actions something specific to attend to: grip, ally, exit, threat, familiar object. Avoid everyone facing the camera or bobbing on a shared idle loop. Eyes/head lead large attention changes where the art supports them.
- Comic panels must use current approved illustrated scenery/portraits, coherent character proportions, clean crops, readable order and localized text outside the image. Zooming an old blurry crop does not create a cinematic asset.
- Check each important scene at actual portrait size with maximum text size, mute, reduced motion, image failure and retry. Captions may not cover the relevant hand, actor reaction or exit. Preserve reading time and speaker identity.
- Silence is deliberate, not an audio bug: maintain quiet environmental grounding, then reintroduce music at the next intention. Verify on real speakers/headphones before claiming emotional acceptance.

## 6. Narrative novelty without scope creep

Use the existing street-object choices and Kaan reciprocity as the game's distinctive authorship. The memorable payoff is a particular object/decision affecting the fight, followed by a believable human/world response. Do not add a separate collectible meter or branching plot just to announce that consequence.

Ship three demonstration chains in ordinary earned play: **L3 lift→strike/clear→physical debris**, **L22 placement/offense→L24 acknowledgment**, **L23 useful help→L25 changed farewell**. Each should be understandable without the developer narrating it. Retain neutral outcomes and first-clear persistence. These are reusable principles for later levels, not authorization to implement L31–100 now.
