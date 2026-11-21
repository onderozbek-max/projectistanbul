# First 30 levels corrective implementation brief

**18 November 2026 · Execution partner handoff for [audit pass 8](GAMER-AUDIT-PASS8-2026-11-18.md).** The current game has many of the right systems. The work now is to make the player perceive their meaning, physicality and consequence. Read the [closure matrix](AUDIT8-PRD-CLOSURE-2026-11-18.md) and [level/asset directions](AUDIT8-LEVELS-AND-ASSETS-2026-11-18.md) as part of this brief.

Sections 1–7 close or refine the approved experiential PRD. Section 8 contains **new proposed gameplay decisions**, not already-authorized implementation requirements. Preserve the active JS prototype, one-thumb controls, automatic combat, current canon, native TR/EN voice workflow, optional monetization and first-30 boundary. No engine migration, new dependency, purchase integration or post-30 production is requested.

**Owner follow-up and recommended execution scope, 18 November:** the owner sees visible improvement in Arda's movement, questions the value of further locomotion work, considers highly detailed ordinary-zombie animation low priority, and wants bosses to move with Arda's level of bodily detail. The allocation below governs this next handoff wherever an older reference suggests equal animation investment across the roster. The [single execution prompt](IMPLEMENTATION-PROMPT-AUDIT8-2026-11-18.txt) carries this scope. This update prepares work for the implementation chat; it does not start implementation here.

## 0. Spend effort where the player will feel it

| Subject | Next-pass treatment | Completion boundary |
|---|---|---|
| Arda's ordinary running | Retain the latest intact authored strides, proportions and response. Perform a short regression check; correct only a visible seam, slide, turn or ownership defect, including one introduced by new weapon work | Good enough as this pass's working baseline. No new locomotion system, general atlas replacement or extra directional frames without a demonstrated ordinary-play defect |
| Ordinary zombies | Reuse current animation and silhouettes. Make dangerous roles distinguishable through posture, speed/commitment, tell and consequence; fix broken anatomy or hidden attack sources | Clear role and fair threat at actual phone scale. No detailed limb-animation overhaul for every crowd member |
| All ten bosses | Invest in movement, body/tool coordination, attack commitment, recovery and defeat with the same bodily credibility as Arda | Each boss looks intentional and physical in normal combat. Different mass and personality are preserved; equal credibility does not mean identical speed, frame count or agility |
| Weapon contact and physical interactions | Prioritize knife/chain/chainsaw, then audit all existing weapon/prop families; keep successful Cable feedback | Player sees what acted, where it connected and what changed. Preserve true attack/interaction rules |
| Kaan and major scene actors | Author the attention, approach, recognition and departure poses required by the existing story | The emotional change is visible in the world before a caption explains it; ordinary locomotion polish must not consume this work |

The latest [visual follow-up](CHARACTER-VISUAL-CORRECTIONS-2026-11-18.md) reports all 49 test groups passing. Preserve its corrected opening-rule portraits and six fleeing civilian identities. That is a newer implementation result, not a retroactive independent pass for the earlier audit. The separate interrupted Mom-call defect still needs repair.

**Scope choice for this round:** defer N1–N3 in section 8. Finish the existing street interactions, build payoff, encounter variety and narrative experience before adding alternative starters, a new environmental boss-counter rule or replay variants. Their proposals remain available for a later decision. All other corrective work in sections 1–7 remains in scope; this prioritization does not reduce the handoff to boss animation.

## 1. Repair truthful presentation first

| Repair | Specific result | Acceptance evidence |
|---|---|---|
| Caller identity | Canonical `anne` portrait for Mom/static interruptions; deliberate neutral visual for system/unknown speaker | Real broken/restored calls in TR/EN, no stranger fallback; registry validation covers every live speaker alias |
| Memories | Eligible viewed/earned story pages persist and can be replayed; earned thumbnail/current intention first, future collection second | Fresh L1→comic→result→Memories→replay→reload. Skip/replay grants no duplicate result. Captain variants replay the actually eligible facts |
| Mastery collection | Use the actual `P.Mastery` namespace for catalogue entries; current `M.Mastery` lookup lists zero weapon badges | Existing 17 weapons have corresponding discoverable badge entries; genuinely earned badge appears after reload; no debug-earned reward presented as normal play |
| Benefit wording | Jacket describes damage reduction, Gear describes cooldown reduction, consistent Damage/Might naming and actual practical deltas | No beneficial upgrade appears to subtract armor or lengthen cooldown. Show current→next values derived from actual formulas, with truthful rounding |
| Gear and compact build layout | Arda artwork cannot cover stats; long mod names fit; art identity matches the approved character | 390×844 and smaller supported viewport, both locales and largest text; no actionable clipping or overlap |
| Weapon icons | Clean tool identity first, rank/evolution accent second; consistent assets across Arsenal/card/HUD | Nail Gun recognizable without its label; all 17 base/18 evolved identities checked at actual display size |
| Scene cleanup | Optional prompts, loot invitations and obsolete combat effects yield during protected aftermaths | Earned L20/25/30 recordings show no chest prompt, irrelevant bark or threatening frozen area over the emotional action |

Repair the behavior, then add meaningful regression checks for the failures. Do not add screenshot-presence assertions that would pass with the wrong portrait or a frozen animation.

## 2. Improve contact and acting within the animation allocation

Use a short Arda start/run/stop/reversal and attack check to retain the latest good baseline. Establish the new acting/contact reference with Cook and Captain, plus knife, chain, chainsaw and Cable. These two bosses test different body demands: close cleaver commitment versus heavy anchor hauling. A walker/runner/heavy comparison checks ordinary-enemy role readability only. Use an empty readable floor first, then an ordinary crowd. Prevent incoming damage in a fixture without making the actor translucent. Use the real art and camera scale.

For boss movement, show a planted supporting foot, a recovering step, body weight over the support and a turn that leads into a purposeful action. A heavy boss may brace and commit sharply; a nimble boss may step around the hero's approach. Keep Arda's movement response immediate. Only repair his gait if the short check reveals a clear defect at normal speed; do not chase details visible only in enlarged slow motion.

Preserve the late visual follow-up's authored hero strides and civilian variety. For bosses or a specifically broken contact pose, use clean parts or authored frames where the current atlas cannot express the action. Keep the same visual style and existing asset workflow. A procedural rig is acceptable if its result holds up. Do not add detailed rigs to every ordinary zombie, replace Arda's working stride, or restore retired procedural district scenery.

For attacks, specify anticipation, commitment/contact, follow-through and recovery for each tool. One dominant tool owns the hands at a time; secondary automatic weapons need a consistent deployment/return convention. Never add extra grasping arms or suppress real attacks to make the pose look tidy. Aim and locomotion can differ: legs follow movement, upper body and tool communicate the actual target.

For ordinary enemies, make role visible before damage with the smallest effective change: runner commitment, heavy brace, spitter source, screamer call, crawler ground contact or courier lean. Reuse shared poses where they communicate correctly. Separate the active dangerous role from passive crowd texture. Every live role still needs a valid active recording; the seven frozen clips must be replaced even where no animation edit is needed. The reference is an internal implementation gate; continue through all ten bosses and the whole brief without an intermediate handback.

## 3. Boss encounters and earned balance

Build an encounter card for each of the ten existing bosses containing its intention, arena feature, attack families, close/far response, commitment direction, recovery opportunity, phase change and aftermath. Use the appendix's identities. Keep the latest Captain and Ticket Man mechanics.

For every boss, implement and inspect the whole physical sequence below. Reuse parts where appropriate, but each tool and signature needs a credible action. A larger sprite with colored warnings does not meet this contract.

| Moment | Required visible result |
|---|---|
| Idle and orientation | Stable scale/feet, readable tool, a posture that communicates mass and personality; attention changes before a major commitment |
| Reposition and turn | Believable steps/pivot and body follow-through. Move or turn only as the authoritative encounter permits; no sliding or decorative lunge beyond the real hit geometry |
| Anticipation | Feet/body load the actual tool and direction; danger is visible at the source as well as on the floor |
| Commitment | Shoulder, arm, hand and tool follow one continuous action; release/contact occurs at the true attack event. Preserve the actual rule for when aim locks |
| Recovery | A specific spent or resetting pose explains the opening. The player who avoided correctly has a reachable tactical opportunity |
| Hit and phase response | A bounded reaction registers a real hit without falsely promising a stagger, cancel or invulnerability. A phase changes stance/positioning in line with its actual rule |
| Defeat | Body and tool settle with weight and consistent size; obsolete threat visuals resolve; the subsequent reward or human reaction receives attention |

Cook and Captain are internal reference checks, then the contract applies to Switchkeeper, Roaster, Linekeeper, Vatman, Keeper, Bride, Fisher and Ticket Man as well. Do not require every boss to dash like Arda. Their movement should express intent and remain readable under ordinary earned builds.

**Entrance:** use the existing protected boundary. Establish the tool and its world source, then the actor's stance. A modest camera emphasis is useful only if it preserves both the actor and first escape route. Settle to the usable combat framing before control and danger resume. Reduced motion uses a stable composition/local contrast change. Do not make the whole screen brighter or zoom into an unavoidable first hit.

**During combat:** bodies prepare and commit to the same direction as their actual attacks. Heavy enemies plant/haul; nimble ones reposition and settle. Give every recovery a visible spent posture and reachable position. A successful avoidance should create a concrete choice to approach, reposition, use a prop or maintain ranged pressure. Avoid omnidirectional warning spam and constant untelegraphed turning.

**First encounters versus strong builds:** test whether an ordinary earned build sees the signature, answers it and gets a worthwhile opening. L2–4 currently need this check urgently. Strong rematch builds may shorten fights. Do not use hidden scaling against owned power, compulsory phase HP locks or blanket HP increases as the remedy.

**Specific diagnostics:** reproduce the L10 typical/struggling punish losses and inspect approach distance, collision and available recovery time. Reproduce L15's pre-boss walker deaths separately from Bride deaths. Review the L5 ranged pre-boss timeout and actual L13/L28 failed seeds. Fix the relevant rule/geometry, then rerun affected builds; do not turn every loss into a required nerf.

**Evolution:** use the existing investment/recipe assistance to make eligible committed builds pay off before a meaningful remaining encounter. Compare early, typical and unlucky offer paths. Show acquisition→first signature→useful engagement, not just acquisition→exit. Preserve uncertainty and build choice; do not guarantee every evolution every run. Keep defensive pivots viable and ensure a fast efficient player is not punished by receiving the main payoff only after the boss chest.

## 4. Give all 30 encounters different decisions

Use the all-level table to revise geometry, wave placement and action timing around the existing mechanisms. Do not replace familiar one-thumb inputs with thirty control schemes. The variation should come from **when, where and why** the action is useful.

- A hoist changes a route; a bell changes enemy attention; a cart changes the shape of a fight; a wave changes the crossing interval; an escort changes movement responsibility. Their animations and level layouts should make those differences visible.
- Where work repeats, change its consequence or reduce the repetition. Three shutters should not be three identical waits; carrying three sacks should not mean three empty walks.
- Show an eligible prop's grip, usable approach and actual footprint. When carried, show wear and valid placement locally. Wedge/cover/lure benefit must affect the pressure the player can see.
- Keep optional and required directions visually distinct. Within reach, show the precise action at the object; far away, prioritize the required destination. Fix “hit” copy where the intended action is a deliberate hold.
- Author relief after meaningful resolution. The world can remain alive without an immediate replacement crowd: water movement, loose rope, a departing tram, Paşa crossing, or Kaan waiting at the route. Quiet should carry anticipation or relationship, not an empty countdown.

Deliver ordinary-play chains for L3 lift→use→changed lane, L22 choice→L24 callback and L23 useful help→L25 farewell. Capture both outcomes and neutral. Existing generic bots do not make those choices; add bounded policies that do, and retain an ordinary route as a baseline. Human comprehension remains a separate gate.

## 5. Direct the major scenes precisely

Keep the existing factual trigger, protected clock and reward transaction. Suppressing a stale danger visual is not permission to suppress a still-active gameplay hazard in live control. Reading time holds the final protected pose; the actor clock must not run a repeated idle pantomime under a long caption. Skip returns to a coherent final state and the real next task.

Maintain a district-by-district emotional progression: escape alone, learn the streets, trust Paşa's lead, accept Kaan, reciprocate help, share a loss, choose the onward route together. For each major beat record what the player should understand before/after, what visible action changes that understanding, and which line deserves uninterrupted attention. Preserve the current Captain memory and domestic warmth of Mom's calls. Do not add exposition to compensate for missing acting. For comics, commission/choose the illustrated action actually described: the L1 shelter page needs the shopkeeper and closing shutter, rather than only a reusable Arda bust over a street. Use current scenery and consistent proportions; retain asset-failure recovery.

Persist enemy acquaintance and recent ambient-line history at campaign/session scope. Urgent tells may repeat when needed; first-sighting jokes should not reset on every level. Keep native TR/EN authoring separate. Audit each changed line against its actual trigger and who knows what; no early Kaan name, invented successful rescue or gratitude for help that never happened. Use the next unaided player session to ask why Arda is walking home, what Kaan wants, and why they choose the Bazaar; correct the unclear trigger or staging before adding a summary speech.

### L1 restaurant and first escape

Retain the current overall opening budget and order; trim decorative waiting before adding time. Compose table, Cook, stranger and usable door at consistent scale. During dinner the hands have something specific to do. At the news interruption, eyes/head lead the torso response. The diner tightens, rises and advances from a continuous world position; the stranger recoils with a planted step. Use the existing three memory panels, then gaze→hand→knife grip→lift→braced first strike→target reaction. The knife cannot appear in a hand before leaving the counter. Return to the same reachable door, with enough light/opening contrast to make the first movement intention obvious. Preserve the stranger's anonymity; do not label him as an established friend or confuse him with Kaan.

### L20 Fisher and Kaan

1. **First roughly 1.2 seconds:** rod/line and body lose tension; resolve the actual encounter's danger. Let a small balance recovery replace immediate victory posing. Suppress loot invitations and ambient jokes.
2. **Next roughly 1.6 seconds:** Kaan walks from the established safe approach. His fish is visible but lowers as he stops outside striking distance. Frame a human approach rather than an enemy entrance.
3. **Next roughly 1.7 seconds:** Arda's attention turns toward Kaan, then his shoulders ease. Give them a brief shared pause. Use the native introduction and Ataköy/Eminönü facts in their current order.
4. **Handoff:** Kaan indicates the onward direction and waits/sets off consistently with the actual route. Finish in a composition from which returning control makes sense. Do not retroactively give companion support during the Fisher fight.

A caption may occupy a reserved screen strip while the actors remain unobstructed. The full illustrated comic takes a later dedicated reading phase; do not leave its first full panel pasted over the world stage. If player and boss are far apart, direct the camera toward the meaningful human action instead of shrinking everyone to fit all anchors. Do not teleport people or force a combat relocation solely to fit a shot.

### L25 Captain farewell

1. **0–1.5 seconds of world acting:** the Captain's body settles with weight; the anchor and chain release from their current positions. Let the final impact decay. No chest invitation, score toast or triumphant sting.
2. **1.5–3 seconds:** Kaan approaches from his actual nearby position, stops short and lowers his hands/shoulders. Arda looks toward Kaan. Avoid a jaunty fish-holding portrait or another large comic panel stealing the reaction.
3. **3–5 seconds:** hold Captain, Kaan and a relevant boat/chain detail in a stable composition. Quiet water/wood/rope and the restrained motif support the scene. Keep the current small memory of the Captain's kindness; it is stronger than extra exposition.
4. **Native reading phase:** preserve neutral/current-help/stored-help selection. A small acknowledgment can reinforce a real helped state; it must not invent gratitude. Hold reading as long as needed without moving the actors off their marks.
5. **Departure:** Kaan turns to Arda, then the walking route. Arda makes room beside him. Restore the actual exit, then allow reward attention. The scene's payoff is choosing to continue together.

Use the current approximately 6–8-second acting budget alongside reading, not another unskippable movie before the dialogue. Reduced motion keeps recognition/spacing/poses; it need not preserve a moving zoom.

### L30 station and next intention

1. **First roughly 1.2 seconds:** Ticket Man and his tools settle; resolved punch/signal danger disappears. Arda and Kaan orient themselves.
2. **Next roughly 1.6 seconds:** frame the actual points and service passage. A connected light/track change makes the useful route visible; an arbitrary line ahead is insufficient.
3. **Next roughly 1.4 seconds:** Arda looks from the passage to Kaan. If the actual L29 choice has an acknowledgment, keep it brief and below Mom's call in priority.
4. **Native call/ending:** retain the established facts: family safe in Sarıyer, Ataköy apartment still useful, Dad's message still there, highway unsafe, Bazaar the next walking route. Do not imply boarding a train or disclose the future letter.
5. **Final staging:** both orient toward that real walking path. Let station sound soften and the home motif connect the intention. Then results and the first-30 replay boundary take focus; no L31 play/purchase tease.

### Scene asset requirements

Produce a shot-specific asset/pose list: Arda attention/recovery, stranger recoil, Kaan wary approach/lowered fish/recognition/quiet departure, each boss's released tool and persistent body. Use consistent character proportions and current district scenery. A neutral bust shifted across the screen is not a substitute for the stated pose. Check image-loading recovery and large native text against each composition. Preserve complete readable dialogue rather than truncating it to fit an arbitrary two-line limit.

## 6. Information, rewards and audiovisual hierarchy

**In combat:** reserve visual priority for immediate threat geometry, Arda's contact point/health state and the current required action. Show damage locally and in the truthful bar; a heal sweeps inward and marks only restored HP; a block has a different shape. Personal critical health stays steady under reduced flashing. Player frenzy uses outward energy/body confidence; horde escalation uses incoming movement/environment pressure; a boss uses a directed entrance and attack source. Do not rely on changing a red tint to amber to explain all three.

Close the owner's healing concern with an uninterrupted visible sequence: approach recognizable food/station, commit the actual use, see contact/pickup, see distress ease and exactly the gained HP segment brighten, then see the object's saved/spent state. Repeat with full HP and simultaneous damage. The zero-benefit case must not celebrate restoration. Show small repeated damage, critical entry and recovery in the same normal-speed mute review. A tooltip or large number alone cannot close this requirement. Use the existing PRD timing ranges and event deltas; do not enlarge every cue.

For dramatic contrast, review traversal, horde pressure, player frenzy, boss entry, recovery and aftermath in their actual order. Introduce pressure through visible incoming paths and actor behavior; let a resolved fight release motion, crowd noise and visual clutter. Camera emphasis belongs at safe boundaries and must settle before dangerous input resumes. Every cue must still make sense on mute; reduced motion keeps posture, shape and contrast. Preserve the existing flash budget.

Apply fade/occlusion to signs, façades and foreground illustrations, not only ordinary props. Give blood, discarded bodies, XP and decorative trails a bounded visual budget. Preserve actual dangerous projectiles and their edges under foam, fire, electricity and dialogue. A small optional invitation should never outrank the way forward.

**Between runs:** keep Attributes, Perks, Mastery, Gear and Bond distinct, but explain them at their decisions. Attributes grow from relevant actions; perks require the appropriate rank plus Cred; mastery grows from that weapon's use; Gear is equipped permanent power; Bond comes from the existing shared-play rules. Run card ranks reset. Use consistent scope labels and derive every before→after effect from actual data.

Put equipped active/ultimate choices at the top of the loadout surface. Put collection/mastery browsing behind a separate clear section; show the next mastery behavior even at rank zero. Results lead with what the player accomplished, one useful earned improvement and the next intention. Detailed tallies can expand. Memories should first show the journey already experienced, not fifty-nine locked cells. Label equipment and settings clearly instead of asking two similar icon-only controls to carry the distinction.

Current Night Shift and Daily Challenge need clear purposes, duration and expected difficulty. Recommend them after the player understands the district loop; do not push a new player from L1 toward a 12-minute double-elite session as the primary return promise. Keep optional daily rewards generous in scheduling and avoid mandatory consecutive-day pressure as the main reason to return.

**Sound:** preserve the eight prepared tracks and current motif while auditioning the actual game. Give knife a short cut/contact; chain a tension/metal snap; saw a localized sustained motor/contact texture; cable a crackle linked to target reaction; wood/metal/glass distinct material tails. Let a warning remain audible under impacts and reduce repetitive speech blips where they mask intent. Verify fight→quiet→farewell→onward route→result as a continuous mix, especially L25. Digital waveform/stream validation is not a listening verdict. Record the actual listener/device and what was changed after audition.

## 7. Implementation order and complete handback

| Order | Deliverable | Internal completion gate |
|---|---|---|
| A | Truthful portrait, archive/badge wiring, stat copy, icon and layout fixes; scene prompt cleanup | Reproduce each audit defect, then demonstrate its corrected player flow and reload behavior |
| B | Preserve Arda baseline; close health/interaction visibility; establish Cook/Captain and priority-weapon acting | Normal-speed phone-size review shows bodily intention, contact, actual restored/lost HP and a useful opening; no dependence on giant particles or explanatory captions |
| C | Complete all ten bosses and existing weapons; bounded enemy-role clarity; resolve balance warnings and evolution timing | Every required roster row has active evidence and relevant ordinary-play coverage. No ordinary-zombie fidelity overhaul; no frozen or obscured case counted as verified |
| D | All-30 spatial/pacing pass, actual choice chains, major-scene direction and progression flow | Full chronological experience retains canon and produces distinct decisions; required emotional action remains visible on mute |
| E | Integrated regression, independent-style review and available device/player checks | Evidence identifies the exact final runtime, records limitations and demonstrates the whole experience rather than isolated feature existence |

Do not hand back after A or after one impressive boss. Continue through the scoped PRD corrections without requesting routine reapproval. N1–N3 remain deferred for this round. If an outside-scope dependency or asset need blocks one item, finish independent authorized work and identify the concrete missing piece.

The next packet must include:

1. Final runtime/tool manifests; focused regressions and one final integrated suite after edits settle. Reuse existing tests; add checks tied to actual failures.
2. All-30 earned campaigns plus meaningful choice policies; weak/typical/strong boss comparisons with two genuinely different policies, including Cook; loss/timeout investigation, not only aggregate clears.
3. For each evolution, actual conditional effect, acquisition timing, affected targets and useful remaining engagement. Distinguish debug supply from natural acquisition.
4. Capture validation that asserts active gameplay over the expected interval, changing simulation time, intended actor visibility and relevant events. Reset each enemy fixture. In the current pack, Screamer reaches `cards`; the following seven clips remain at **103.0833 simulated seconds**. File duration and audio/video streams alone did not catch that. Do not hardcode an empty `frameErrors` array as exception evidence.
5. A continuous fresh first-session capture and earned L20/25/30 flows with ordinary HUD/comics, plus muted/reduced/large-text variants. Isolated canvas footage alone cannot certify DOM composition.
6. A named physical iPhone session of roughly 20 minutes covering peak crowd, boss, scene, transition and interruption; report frame-time tails and touch/readability, not only average FPS. If unavailable, leave this gate pending explicitly.
7. The existing 5–8 unfamiliar-player formative test: health change, role/attack recognition, prop tradeoff, growth scope, narrative intention and voluntary continuation. At least one full first-30 human progression is still needed. Ask what they would try next rather than whether they liked the game.
8. A closure matrix that says **functional**, **visually accepted**, **observed in earned play** and **pending** separately. No “masterpiece” or expansion approval based on green automated checks alone.

Also provide a short **before/after reel at the same phone-scale framing**, with honest build/seed/power labels, covering healed HP, critical recovery, a prop changing the fight, Cook, Captain, knife/chain/chainsaw contact, L25's emotional handoff and a useful evolution before an encounter. Include ordinary sound and mute/reduced variants where relevant. Watch the recordings yourself in order; frames obscured by upgrade cards, captions or invulnerability pulses cannot prove the intended action. Keep the full source clips available. A reference passing is permission to continue the rest of the work, not an extra owner-approval stop.

## 8. New proposals for a stronger game identity

These remain bounded proposals for a later implementation decision. They are not requirements retroactively missing from the last PRD and are **deferred from this next pass** under section 0.

The proposals remain recorded under D-116. Reconsider them after the current mechanics and first-30 presentation meet their acceptance criteria; no decision on them is needed to execute sections 0–7.

### N1 Earned starting intentions

After L5, allow an earned choice between the familiar Knife start and a contrasting Nail Gun start. After a later accepted checkpoint, a third terrain-oriented start could follow. No new currency or paid unlock; preserve early onboarding. Keep this choice separate from choosing active skill/ultimate. Show one sentence about positioning, a practical preview and the relevant recipe path.

Why: every current normal loadout starts with the knife, so the player waits for random cards before expressing a new intention. A starter choice makes “next time I will play differently” concrete. Test L6–10 at equal earned power, with a defensive fallback and viable evolution route for each start. Do not adopt it if it only changes DPS or invalidates early progression training; it must produce a different route/positioning preference.

### N2 One readable environmental boss counter

Prototype a bounded counter in one existing encounter, using current street/collision primitives. Candidate: the Captain's committed anchor catches a clearly identified breakable cargo obstacle, visibly tensions the chain and leaves his flank accessible while he frees it. Player positioning creates the opportunity; a popup does not activate it. It is optional, readable before the throw, and does not require a lucky weapon drop.

Preserve the current anchor's telegraph/true geometry and ordinary punish route. Decide explicitly whether the catch changes recovery or only opens space; do not imply extra vulnerability if the sim does not grant it. Prevent infinite trivial trapping. If the local prototype is understandable and fun, use that principle sparingly for another boss; do not build a general physics engine or add a special counter to all ten automatically.

### N3 Curated replay experiments inside existing modes

Use Night Shift/daily infrastructure for a small set of authored tactical variations after district mastery: a route with a useful movable cover, a bell diversion opportunity, or a wet-ground control opportunity with tools the player can access. Each variation needs a different useful decision and a recognizable world setup, not merely +35% enemies. Explain the experiment before entry and summarize its actual result afterward.

Avoid mandatory daily streaks, exclusive progression power and invented canonical history on replay. Keep first-clear remembered choices intact. Acceptance is a player voluntarily naming and trying a second approach; a higher session duration alone is not proof of fun.

## 9. Expansion remains gated

After the first-30 corrections and human/device evidence are assessed, the next production gate is the existing **L31–35 pilot**, using earned saves through L29–35 and the established Bazaar intention. Retain the L31–100 narrative spine. Do not propagate unresolved presentation patterns or authorize all seventy remaining levels from this audit.
