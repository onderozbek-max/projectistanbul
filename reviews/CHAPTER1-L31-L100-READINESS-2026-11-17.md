# NO SIGNAL — L31–100 readiness and proposed experience plan

Created 2026-11-17; **revised 2026-11-18 after the holistic first-30 brief and inspection of the implementation in progress**. The filename stays unchanged so existing links and the implementation prompt remain valid. Read with the [holistic experience brief](HOLISTIC-EXPERIENCE-REDESIGN-2026-11-17.md), [detailed combat direction](MASTERPIECE-DIRECTION-AND-CLOSURE-2026-11-17.md) and [implementation evidence ledger](HOLISTIC-IMPLEMENTATION-2026-11-17.md).

This is a proposed expansion design and acceptance contract, **not approval to start production beyond L30, a change to canon, or certification of the nearly completed implementation**. The narrative route and seventy encounter concepts remain useful. Their mechanics, persistence, progression and verification requirements are updated below. The first-30 audit must evaluate the completed build before expansion is cleared.

## 1. Readiness verdict

**Still valid as a narrative and encounter spine; updated here as an inheritance plan. It is not yet a cleared production baseline.** Preserve the walk home, neighborhood order, garage at L54, Ahmet/home at L100 and later-letter chronology. The expansion now needs to continue deliberate improvisation, meaningful local choices, remembered consequences and readable progression, as well as the stronger combat presentation. Those are part of the game's identity, not optional decorations on later levels.

This revision inspected current source and the in-progress implementation packet. The packet still contains pending evidence rows at this checkpoint; that does not prove the code is absent. New street-placement, local-choice and memory code is present. No new full playthrough, completed-suite claim, independent listening assessment or physical-device result is asserted here. Reconcile the final handoff before clearing any gate.

### Current inheritance status — replacing obsolete open issues

| Status / source at revision | What carries forward | Remaining expansion requirement |
|---|---|---|
| `config-levels.js` still has `routePreviewThrough: 30` | Authored first-30 route vocabulary | Build authored encounters; raising this number alone cannot create L31–100 milestones, actors or geometry. |
| Legacy route/hold templates remain | Useful comparison baseline only | Do not regress to generic end waits. Old seed-42 length measurements belong to the fifth audit, not fresh measurements of this build. |
| `config-bond.js` no longer has the old last-level-30 support cutoff | The previous cutoff issue is closed in source | `kaan-support.js` still requires an authored route and supported milestone state; design where and how he acts in each future block. |
| Core recipe assistance is independent of `routeTrial` | Previous claim that all guidance stops at the route boundary is obsolete | **New boundary:** `config.js` has `entryBuildThrough: 30`. Early investment, initial offer/focus and survival-choice paths in `sim/progression.js` use that limit. Compare L30→31 intentionally; do not silently remove all help or blindly extend tutorial guarantees through 100. |
| `config-env.js` defines wedge/cover/lure roles and level-specific object setups | Deliberate carry/use/place/drop vocabulary | Author appropriate setups for future encounters, with collision/fallback validation. Current setup entries do not include future levels. |
| `sim/local-choices.js` enumerates L7/12/17/22/27/29; callbacks currently map L9←7, L24←22, L30←29 | Bounded two-approach choices and local consequences | Explicitly author new producers/consumers. Existing code does not automatically create a meaningful choice or memory in L31. |
| `meta-data.js` stores valid choice memories on first Normal wins; the Kaan market-help flag has a separate settlement condition | Concrete, already-used persistence primitives | Preserve their semantics and test old saves, retries and alternate modes. A shared memory label must not accidentally alter distinct flag rules. |
| All base families already unlock in the opening slice | Existing arsenal, forks, mastery and terrain reactions | Schedule new applications and meaningful build payoffs rather than assuming a new weapon every district. |
| Kaan's usable Chapter 1 benefits remain 25/50;75/100 are future stubs | Current honest UI and implemented benefits | Use authored relationship actions/aftermath after numerical saturation. Recalculate cap timing with final earned saves; old L38–42 estimates are not a new test result. |
| Bosses inherit broad types and repeated fifth-stage placement | Shared rendering/simulation where useful | Each finale must have its own positional question, acting and aftermath. L60 remains a deliberate horde-escape variation. |

These are bounded content/configuration dependencies to resolve, not a request for a new engine, generalized quest platform or another progression system.

## 2. Preserve the corrected canon; finish continuity in context

Native Turkish and English writing may differ in rhythm, humor and idiom. **The facts the player learns, the action required and the emotional event must agree.** Do not translate voice lines; brief both scripts from the same factual beat.

| Current status | Evidence / factual contract | What production must preserve or finish |
|---|---|---|
| Radio discrepancy corrected | Current EN `H13i2a` now advertises safety in the northern forest, matching the TR fact | Public reassurance is contradicted by Dad's later warning. Review actual emitted scenes; do not reapply the obsolete opposite-advice fix. |
| Later call facts revised | Current EN C50 covers key/Ahmet; C70 food/note/Sarıyer; C90 balcony light and food for two | Keep both native scripts aligned on knowledge, not identical phrasing. Grade timing and emotion during the new playable routes. |
| Empty-apartment framing corrected | Current EN and TR `FINa3` explicitly know nobody is home | Arrival is felt absence, shelter and discovery of the note; not another surprise that the family left. |
| Named encounter numbering corrected in narrative table | Fish Porter45; Antiquarian55; Hose Man75; Dye Foreman80; Tower Keeper10; Kaan joining20 | Use these as the content contract and check future scene/art bindings. Do not reopen the previous numbering defects. |
| Letter prose corrected | `docs/journey.md` §8.4 now explicitly places letters at 100/190/300 | No premature later letter in Chapter 1; no new revelation that undermines Dad's warning. |
| L30→Bazaar motivation already revised | Current first-30 story supplies a usable route onward | L31 visually continues that intention; it does not restart the partnership or ask why they are going home. |
| Geographic detours still need playable staging | Kumkapı41–45 and Yenikapı56–60 have palace/Balat between | Explain each detour with specific access, shelter or route information. No repeated generic locked-gate excuse. |
| Time-of-day continuity needs an authored sheet | Palace dusk, Balat night, underground darkness, Samatya dawn | Underground exit at L60 promises air/first light; L61 completes the same dawn, not a second sunrise. Match art, music and dialogue. |
| L54 scope must retain the owner's existing constraint | `docs/journey.md` H11 says combat stays on in that stage; a wholly non-combat stage is deferred; campfire script has an owner-directed rewrite | Keep an active approach followed by a protected scene. No damage while control is removed. Do not silently convert L54 into a full rest-only level or overwrite owner dialogue. |

The player's knowledge should accumulate:

| Gate | What the player already knows / what this gate adds |
|---|---|
| Before L31 | Family left; they are safe in Sarıyer; home holds food/rest and Dad's note; highways are unsafe; Kaan has joined and has personal loss. |
| L35–45 | Arda and Kaan can solve practical problems together; helping people produces local consequences; no new main-villain conspiracy is required. |
| L50 | Ahmet, the building key and home become concrete human stakes. Calls clarify, not merely withhold. |
| L54 | A real pause and reciprocal vulnerability; Kaan is a person with history, not a helper meter. Mila matters to Arda before she arrives. |
| L60 | The pair deliberately emerge from an exhausting passage; a survival accomplishment resolves here. |
| L61–70 | The radio offers apparent hope; Mom confirms the plan. The player can state why the apartment is still the destination. |
| L75–90 | Familiar places and people become personal; the end feels nearer through space and changed conversation. |
| L95–100 | The last neighborhood resolves the walk. Ahmet's loss lands; home provides a real payoff; Dad's warning creates a new question; Mila arrives as a person with agency. |

Do not introduce Ada or the Chapter 2 human-combat faction prematurely. Looting humans in the bazaar can be environmental/narrative evidence without becoming a new enemy faction. Respect the existing guardrails concerning real state actors, religion/politics, brands and earthquake imagery.

## 3. Principles to extend from the best first-30 moments

**Handoff contract after the holistic redesign.** L31 continues the same comprehensible controls, build intent, permanent progression, relationship and visual language. Core guidance continuity is already in source; the new level-30 offer-policy boundary still needs an explicit design decision. Kaan, authored prop setups and local-choice callbacks require future content definitions, not just preserved unlocks. The first acceptance sequence uses the same earned save from L29 through L35, including help/memory variants and missing historical flags. Legacy L31 is only a comparison baseline, not proof of the authored handoff.

**Persistent reward proposal.** Keep Kaan's usable Chapter 1 unlocks at 25 (health) and 50 (the joint ultimate). Treat later callbacks, relief beats and home as story events earned through play. Validate 35, 50, 54, 60, 70, 90 and 100 against the existing reward schedule as those encounters become playable. Use three earned saves. A combat-focused player mostly gains Strength and weapon mastery. A helper and hacker should see Intelligence from completed terminals and Charm from rescues, with optional opportunities visible before a detour. A mixed player should get enough opportunities to try both without clearing every optional event. For each checkpoint, record actual abilities unlocked, remaining goals, bond value, and actions taken to improve INT/CHA. Current legacy routes cannot certify the rewards or pacing of the authored chapter.

**Implementation checkpoint.** The first-30 evidence packet now records the layout sweep, Normal clears with three earned build intentions, separate boss stress cases and desktop captures. Carry the saved first-clear choice and Kaan repayment as independent facts. Keep current guides, props and warning footprints tied to actual collision. Retest the disclosed early-offer limit, repeated route pacing, minor and major boss contrast and earned-build tails before extending their parameters to the Bazaar. Start L31 with the same save, the same learned movement and the reason established at the station. [First-30 implementation evidence](HOLISTIC-IMPLEMENTATION-2026-11-17.md)

1. **One understandable required decision per short level.** Optional opportunities add depth; failure of an optional bonus does not block the route.
2. **Teach a district rule safely, complicate it, let the player exploit it.** The fifth level tests mastery of the place, not an unrelated boss pattern.
3. **Repeated inputs can remain familiar; repeated decisions should not.** A ring can mark an interaction consistently, but not every solution should be waiting in it.
4. **A strong build changes a choice.** It can clear a lane, control a rush, exploit wet ground or shorten a dangerous exchange. It should not simply erase every spatial problem.
5. **Companionship is visible action and remembered consequence.** Keep occasional reciprocal moments, not constant rescues or chatter after every kill.
6. **Relief is authored.** A safe bench, skyline, shared food or short conversation can create contrast without pretending to be a combat challenge.
7. **A loss leaves a clear hypothesis.** Show the actual cause and what the player could try. A retry should be faster to begin and free of repeated exposition.
8. **No essential rule is audio-only, color-only or hidden under a thumb.** Preserve readability on low graphics and Reduce Motion.
9. **Reward the district, not only the run.** Changed space, a human response, a memory or a new application of a skill should accompany major victories.
10. **Keep the first game's emotional promise.** The walk is about people getting home. The zombie spectacle supports it.

### 3.1 What each new district must inherit

| Holistic workstream | Expansion contract | Proof needed in each block |
|---|---|---|
| H01: street improvisation | Use the same grip, cancel, carry, Dash escape, wear, placement and lure rules. Respect actual portable footprints and art. Keep three roles unless a later, justified proposal adds another. | At least one appropriate offensive/defensive application where the place supports it; no obligatory prop quota or fourth combat button. Ignoring/breaking an optional prop cannot softlock the route. |
| H02: local choices | A readable two-approach tradeoff, a visible immediate consequence and selected short callbacks. No escalating branch tree. | One meaningful opportunity in a typical five-level block is the initial authoring budget; adjust for quiet/finale blocks. Do not repeat the same two floor pads with a different label. |
| H03: Kaan | Useful support with legible placement and bounded uses; occasional reciprocal player action; acknowledge facts that really occurred. | Show his contribution in ordinary play. Alternate covering, navigating, holding pressure and responding, instead of demanding a rescue in every district. |
| H04/H13: encounters | A distinct positional problem, role combination, readable escape and world resolution; seed variation preserves those constraints. | Every level has an encounter card; adjacent ones require different decisions. A harder level does not merely add HP, travel and a longer ring. |
| H05/H06: builds and growth | Preserve the distinction between this-run ranks, attribute practice, purchased perks, mastery, equipped gear and bond. | Accurate practical previews for future enemies/terrain; usable builds with different weaknesses; no required perk, random drop or optional rescue to finish the story. |
| H07/H14: navigation and outcomes | Pause exposes the current task and next action; results prioritize human/world outcome then actionable growth. | New milestone types supply objective-state text, recipe context, actual damage attribution and correct retry/quit retention. No fallback to an empty generic pause description. |
| H08/H09/H12: narrative and audiovisual direction | In-world setup/action/aftermath, purposeful scene acting, native scripts with shared facts, controlled music/silence. | Block readthrough in actual order; attention-safe dialogue; a district mix/transition review. A new boss does not automatically require a new cinematic or music purchase. |
| H10/H11: combat | Preserve the first-30 accepted contact/pose/targeting/framing contracts. Use contextual attack selection, readable commitment and real recovery. | Distinct boss attack sheet and normal-speed first-clear/rematch evidence. No identical chase plus renamed projectile; no arbitrary invulnerability to nullify growth. |
| H15/H16: reliability and access | Equivalent essential cues on mute/low quality/Reduced Motion; stable input and exact-once settlement. | Cold load, failed-art recovery, interruptions, saves, frame-time/memory and available device checks include each new district. Sim never changes with visual quality. |

### 3.2 State and consequence contract

Separate four kinds of state before writing new content:

1. **Run-local physical state:** carrying, wear, placement, shutters, lures, temporary cover and task progress. Reset with the run under current rules. “Carry the mechanic forward” does not mean carrying the same bench from L30 into L31.
2. **Persistent character state:** applied attributes, ready ranks/practice, Cred and purchased perks, mastery, gear, bond/unlocks. Preserve their current earn/spend/persist rules and migrations. New display wording must not silently change formulas.
3. **Remembered action facts:** stable action/outcome identifiers with explicit producer and consumer. Current street memories are written on a first Normal win; the L23 market-cover flag can be earned on a later qualifying Normal win. Preserve or explicitly revise these different contracts; do not unify them accidentally. Missing flags on old saves mean unknown/not recorded, not moral failure.
4. **Narrative knowledge:** what Arda, Kaan and the player know at each beat. This controls dialogue validity, not combat power or a secret morality score.

For every new remembered action, record: ID; trigger; required success; alternate/neutral outcome; save mode; replay/update policy; immediate consequence; later consumer; one-time reward if any; old-save default. A replay may demonstrate the other approach without overwriting first-clear history. If permanent revision is intended, specify it rather than inheriting it accidentally. No duplicate reward on relaunch or scene replay. No callback can claim the player rescued someone on a failed run.

Prefer short producer→consumer pairs within a block or the next one. Carry only a few meaningful facts to L54/L100; never combine all earlier choices into dozens of ending variants. All players can reach home and understand the ending. A small acknowledgment, altered safe approach or human gesture is sufficient. Reusing a theme such as “you covered me” does not mean teleporting the same rescued person across Istanbul.

Move future choice/setup/callback definitions into the project's existing config/content pattern where needed; keep rules in sim and presentation in view. This is a bounded extension of existing systems, not authorization for a general quest engine or new dependency. Validate definitions, callback keys and localization coverage together.

### 3.3 Novelty and pacing budget

Use one major spatial variation per district. Familiar verbs remain useful, and mastery produces surprises through combinations. Introduce at most one genuinely new rule at a time; if a row requires moving-platform physics, light carrying or another expensive subsystem, first demonstrate why existing static geometry, timed lanes or fixed light relays cannot deliver the same decision. Record the capability and asset cost before committing it across later districts.

A five-level cadence is a guide, not a template imposed on every block: arrival/reorientation, useful variation, optional tradeoff, mastery or relief, resolution. Swap positions deliberately when story needs it. L54's protected conversation, L60's moving escape and L99's restrained approach break the rhythm. Avoid making every level a prop choice plus a rescue plus a companion exchange plus a boss.

Use temporal contrast: a tense exchange earns a clear breath; a quiet passage supplies anticipation, recognition or relationship. Count action, navigation, forced waiting, menu interruption and scene time separately. Do not refill shorter successful routes with filler waves to meet a universal duration target.

## 4. Proposed seventy-level encounter spine

The following are **design briefs for approval**, not existing functionality. They reuse the current vocabulary wherever possible. Each row specifies the memorable decision and a completion/payoff cue. Exact duration, damage and counts should come from playable prototypes and earned-save tests. Do not implement a new subsystem for every row.

### L31–40: orientation, trust and controlled noise

| L | Proposed encounter decision | Payoff / production constraint |
|---|---|---|
| 31 | Bazaar orientation: use signs/light while Kaan marks a useful route | Continue L30's destination immediately. Demonstrate support and usable build guidance; optional prior-memory acknowledgment has a neutral fallback. No new control tutorial or long maze. |
| 32 | Spend a compact textile cart on offense or place it to shape a lane | Apply H01's existing wedge role, wear and Dash escape. Both choices work; no giant fixed stall masquerading as portable furniture. |
| 33 | Choose whether to risk an optional shop rescue while a safe route remains open | Visible acknowledgment now, bounded first-clear memory for a L34/35 payoff; no moral score, mandatory rescue or required future item. |
| 34 | Time a shutter crossing; use a lure or the ordinary safe interval | Recombine known rules. If L33 help occurred, a local person can point out the interval; otherwise its visual cue is equally readable. |
| 35 | Carpet Golem: read rolling carpet lanes, use an opening between commitments | Boss body and props explain lane attacks; victory opens a broad bazaar vista and resolves the local route. |
| 36 | Beyazıt arrival: navigate an open square with moving sightlines | Visual and spatial relief after the enclosed bazaar. |
| 37 | Noise draws birds/crowds; decide when to trigger a distraction | Cue noise through animation and symbols as well as sound. |
| 38 | Protect a short crossing using a movable stall/cover | Let defensive builds contribute without requiring a specific item. |
| 39 | Choose a longer quiet edge or shorter noisy center | Different risk, same progression; no separate large map branch required. |
| 40 | Pigeon Man: manipulate flock/noise lanes and punish the committed command | A distinct control problem, not the Carpet Golem with a fan projectile skin. |

Narrative: establish the pair's practical partnership. Human traces suggest a wider crisis without introducing Chapter 2's combat faction. At least one helped person's action should visibly improve the route.

### L41–50: weight, unstable ground and borrowed access

| L | Proposed encounter decision | Payoff / production constraint |
|---|---|---|
| 41 | Kumkapı unloading lane: cross between moving loads | Clear ground shadows and walkable boundaries; reuse cargo grammar with a new cadence. |
| 42 | Use a compact fish trolley offensively or preserve it as temporary cover | Existing object-role rules; same affordances as L32 but different crowd/space pressure. Both options preserve access to L43. |
| 43 | Free a netted passage while Kaan holds pressure | Reverse who enables whom; movement remains meaningful during the operation. |
| 44 | Cross a slippery/wet market route while preserving an escape lane | Telegraph conductivity/traction consistently; optional terrain-build payoff. |
| 45 | Fish Porter: reposition around carried loads and net lanes | Correct canonical level; reward opens the next passage and closes the fish-market problem. |
| 46 | Palace approach: read the queue/barrier route and use a civilian access path | No attacks on religious/state symbolism; environment supports navigation. |
| 47 | Follow a moving tour marker through a controlled crowd | Escort variation based on anticipation and shelter, not simply staying within a radius. |
| 48 | Choose when to move a barrier to redirect pressure | Reuse geometry/cover language; visually reveal the alternate lane. |
| 49 | Use courtyard space to bait a committed rush away from the exit | A short mastery setup for the Docent; no extra collection chore. |
| 50 | Docent: audio-guide/umbrella tells and a route-control phase | Distinct gesture/contact/recovery; Mom's call grounds the key, Ahmet and the home plan. |

Narrative: explain why the palace/Balat detour is useful instead of pretending this is a straight shortest path. Resolve local problems; do not stack five vague warnings from anonymous survivors.

### L51–60: shelter, intimacy and darkness

| L | Proposed encounter decision | Payoff / production constraint |
|---|---|---|
| 51 | Balat arrival: climb/turn through a legible narrow route toward the garage | Landmark and Kaan's recognition provide orientation. |
| 52 | Clear a laundry-line/doorway obstruction with a deliberate lure | Personal lived-in scenery; keep the interaction different from cutting three wires. |
| 53 | Repair/open the garage approach while choosing which side to defend | Establish the safe place through action; do not spawn enemies inside the promised shelter afterward. |
| 54 | Active final approach, then a protected Fatma Nine garage scene | Combat remains in the level under the owner's existing decision. The conversation is safe, with one meaningful object/callback; do not make the entire stage non-combat or add a timer after the payoff. |
| 55 | Antiquarian: fragile objects and lantern positioning create choices | A contrasting precise fight after rest; collateral effects readable, not random screen clutter. |
| 56 | Yenikapı entry: learn the boundary of safe illumination | Darkness changes navigation, never hides unavoidable damage. |
| 57 | Redirect fixed light relays to reveal the next path | Prefer existing station-light grammar and cover; always retain a readable fallback. A carried-light system is a separate capability proposal, not an assumed fourth object role. |
| 58 | Deliberately trigger a sound to draw pressure away from an exit | Sound has an equivalent visual cue; offer an optional build interaction. |
| 59 | Cooperate with Kaan at separated but visible route points | A brief coordination problem; no new two-character control scheme required. |
| 60 | Evening Crowd: a moving station escape with staged decisions | Break the single-boss health-bar rhythm. Resolve the escape with air/first light; the same dawn continues into L61. |

Narrative: Kaan's grandmother is already elsewhere; do not turn the garage into another “family vanished” reveal. Arda can admit his feelings about Mila. Avoid writing Kaan as romantically invested in someone he has not yet met; his quietness can carry his own grief and insecurity.

### L61–70: apparent hope and tactical confidence

| L | Proposed encounter decision | Payoff / production constraint |
|---|---|---|
| 61 | Samatya daylight: a short, confident open route after darkness | Give the player space to enjoy the current build; introduce the radio's apparent safe-zone promise. |
| 62 | Use cooking smoke/heat lanes as readable temporary hazards | No opaque damage cloud; consistent warning, active and cooling states. |
| 63 | Help someone cross a seaside route using timed cover | A human action, not another faceless rescue counter. |
| 64 | Decide when to ignite a safe environmental chain | Reward timing and spatial awareness; alternate route for builds without ignition. |
| 65 | Grill Man: control heat zones and approach during cooling | Different from the Captain's falling sacks; cooling must be acted and audible. |
| 66 | Yedikule entrance: identify the usable gate by a visible clue | Orientation without a hidden-object hunt. |
| 67 | Move between safe wall sections as a predictable danger passes | One-thumb-friendly timing and clear edge collision. |
| 68 | Secure a key/access point by luring a threat away | The key has a physical route function, not a three-item scavenger quota. |
| 69 | Choose which gate to open first to control the next wave | A compact tactical choice that sets up the boss space. |
| 70 | Key Keeper: locked/open lanes change the fight as commitments resolve | Mom's clearer call confirms family and destination; close a question instead of dropping the connection for suspense again. |

Narrative: hope should become more concrete. The radio's promise and Dad's eventual contrary warning must remain distinct facts. Repeated jokes should not erase the exhaustion or the relationship gained in the previous block.

### L71–80: systemic play and industrial pressure

| L | Proposed encounter decision | Payoff / production constraint |
|---|---|---|
| 71 | Kazlıçeşme open lawns: use dry islands between wet lanes | Spacious visual reset; establish water clearly before electricity combinations. |
| 72 | Redirect a sprinkler/hose lane to change crowd movement | Existing wet-ground behavior gains a new application. |
| 73 | Cross during a predictable interruption in the water cycle | Short timing challenge, not waiting through a long complete cycle. |
| 74 | Choose a dry safe route or a wet route with a valuable interaction | Let a terrain build shine without making it compulsory. |
| 75 | Hose Man: sweep, interruption and dry-space positioning | Correct boss for Kazlıçeşme; silhouette and hose motion explain the sweep. |
| 76 | Zeytinburnu workshop: establish conveyor/flow direction visually | First prototype timed load lanes on stable walkable geometry. Any forced platform motion requires explicit control/collision evidence before replication. |
| 77 | Break a drum chain at the useful moment | Predictable chain path and safe pocket; no invisible secondary explosion. |
| 78 | Keep an exit clear while a load moves through | Changes the player's objective from maximizing kills to preserving space. |
| 79 | Combine conveyor timing with one previously learned hazard | Mastery remix; do not introduce two new rules together. |
| 80 | Dye Foreman: manage spill lanes and interrupt a committed production cycle | Distinct from Hose Man; avoid consecutive fights experienced mainly as another puddle pattern. |

Narrative: familiarity between the pair can now be shown with few words and coordinated actions. Do not make every five-level reward another relationship-meter popup. A small callback to the garage/Captain can be enough.

### L81–90: the city becomes personal

| L | Proposed encounter decision | Payoff / production constraint |
|---|---|---|
| 81 | Bakırköy arrival: recognize Arda's old route through the shops | Specific personal landmark; this should feel closer to home, not merely another market kit. |
| 82 | Use a bell's timing to cross a school-adjacent lane | Teach the upcoming boss rule through anticipation, not text alone. |
| 83 | Optional familiar object/locker detour with a short tactical cost | Pay off Arda's history; keep the route clear if skipped. |
| 84 | Choose when to silence or exploit a crowd-attracting cue | Demonstrate confidence with the district's sound rule. |
| 85 | Principal: command cadence and wave positioning, then a vulnerable pause | Avoid a generic boss reskin; the player's learned timing matters. |
| 86 | Shore arrival: brief quiet bike-lane traversal and skyline | Relief is intentional; use a personal line or memory, not a mandatory combat quota. |
| 87 | Navigate an oncoming lane while preserving space for a civilian | Clear directionality and visible exit; no random offscreen rush. |
| 88 | Use a rolling cart as moving shelter or distraction | Reuse cart technology with a new decision; ordinary pickup remains deliberate. |
| 89 | Short pursuit/crossing with a clear destination | Build anticipation for Ataköy; do not insert another long generic hold. |
| 90 | Ice-Cream Man: moving cart rhythm and feints | Different from Principal's bell/wave pattern despite shared sound imagery; Mom's balcony-light call brings home into view. |

Narrative: the ice-cream seller and Ahmet should not be interchangeable sentimental bosses. One can be a fleeting remembered kindness; Ahmet is the personal loss prepared across calls and objects. Give each the appropriate amount of space.

### L91–100: final approach, earned homecoming

| L | Proposed encounter decision | Payoff / production constraint |
|---|---|---|
| 91 | Marina entry: read stable crossings between visibly moving pontoons | Keep cosmetic bobbing distinct from collision; do not imply a jump or balance control the game lacks. A truly moving walkable deck needs its own verified capability. Home remains visible. |
| 92 | Untangle or redirect a mooring line while controlling approach lanes | Call back to early ropes with greater confidence, not an identical minigame. |
| 93 | Kaan covers a chosen movement while Arda returns the favor | Pay off learned cooperation; missing an optional flourish never blocks progression. |
| 94 | A concise combined traversal using two familiar rules | Final skill demonstration with no new tutorial vocabulary. |
| 95 | Yacht Owner: dock ownership/chain positioning creates a moving arena problem | Distinguish from Captain/Fisherman; give a real final view of the apartment route. No premature Dad letter. |
| 96 | Ataköy arrival: use Arda's knowledge to choose the familiar entrance | The player should feel recognition and competence. |
| 97 | Clear a domestic route with a restrained environmental interaction | Use lived-in scale and objects; reduce spectacle inflation. |
| 98 | Optional neighbor/help callback along the last street | One small human payoff; no requirement to complete every side task for the ending. |
| 99 | Quiet approach punctuated by a precise, short final obstacle | Build anticipation around the balcony light and Ahmet's booth. Avoid a 90-second wave gate outside home. |
| 100 | Ahmet Abi showdown, then controlled quiet arrival and Dad's note | His actions and defeat must express the established person. Give rest, food, an object/gesture and emotional closure before Mila and the next chapter's question. |

Narrative: the apartment being empty is known. The payoff is reaching it, feeling the absence, honoring what was left, and discovering why Dad distrusts the radio. Mila must have her own objective and response. Do not reduce her arrival to a reward pose or a promotional splash screen.

### District-level applications of the new brief

These are proposed production assignments for the existing seventy rows, not fourteen new systems. Each block gets a specific identity and a bounded payoff. The memory consumers below require their own explicit definitions; none is claimed to exist in current runtime content.

| Block | Gameplay application / contrast | Human or world payoff | Boss/resolution distinction |
|---|---|---|---|
| 31–35 Kapalıçarşı | Familiar wedge/lure use in enclosed branching passages; L32 offense versus access control | L33 shop help earns an immediate response and a local L34/35 acknowledgment; neutral path works | Carpet commitment rearranges lanes; actors, cloth and recovery agree. |
| 36–40 Beyazıt | Open sightlines after enclosure; choose when noise redirects pressure | Crossing becomes visibly usable; one sparse recognition of the pair's coordination | Pigeon Man controls flock/crowd direction; defend a new angle rather than dodge another carpet-shaped projectile. |
| 41–45 Kumkapı | Weight/net/cargo timing; preserve a trolley or spend its attack | A protected working position visibly enables the L43 passage; do not make the saved prop mandatory | Fish Porter carries/commits/recovers around loads; shoulders and feet communicate mass. |
| 46–50 Palace | Fixed barriers and directed crowd flow; Kaan gives route information instead of another rescue | Access resolves the detour, then Mom's key/Ahmet facts give it personal meaning | Docent's stance and route commands create predictable approach windows. |
| 51–55 Balat | Narrow home-like spaces followed by a protected conversation after active approach | One short optional L23/earlier cooperation callback at L54, using current fact semantics and a neutral variant | Antiquarian precision and lantern/shard placement contrast with both crowd control and the preceding intimacy. |
| 56–60 Yenikapı | Light reveals decisions; fixed relays, cover and noise create a moving escape | Kaan and Arda alternate who makes the passage possible; relief is air and the start of dawn | Evening Crowd has successive spatial decisions and a readable finish, not an invisible horde HP bar. |
| 61–65 Samatya | Open space and terrain-build confidence; heat timing replaces darkness | Optional L63 help has a visible local payoff; radio hope introduces a fact without demanding another call | Grill Man cooling creates the opening; smoke never hides the mandatory tell. |
| 66–70 Yedikule | Choose gate order to shape the next approach; no key-collection quota | The selected route opens visibly; Mom confirms a useful fact about home | Key Keeper changes accessible lanes through committed actions, with a fair escape in either order. |
| 71–75 Kazlıçeşme | Dry islands versus useful wet interactions; geometry rather than a new inventory | The pair demonstrate familiar coordination with little dialogue | Hose sweep, body load and interruption define the duel; dry space stays legible. |
| 76–80 Zeytinburnu | Timed loads/material chains, then one mastered combination | Exit remains usable because of the player's timing; not just a kill count | Dye Foreman's committed cycle/interruption contrasts with Hose Man's moving sweep; avoid consecutive puddle fights. |
| 81–85 Bakırköy | Familiar streets and optional personal-object detour; a meaningful choice to linger or continue | A brief recognition of Arda's history is paid locally; no new collectible quota | Principal command cadence is learned before the finale and countered through positioning. |
| 86–90 Shore | Quiet skyline then moving shelter/approach timing | Home becomes visible; the balcony call rewards distance traveled | Ice-Cream Man uses a moving cart and committed, readable feints; no post-lock tracking or copy of Principal's cadence. |
| 91–95 Marina | Recombine mooring, lanes and reciprocal support; control assumptions remain familiar | L93 cooperation earns a short response and a clear final route home | Yacht Owner changes dock access through chain commitments; distinct from Captain's tow and Fisherman's reel. |
| 96–100 Ataköy | Recognition, restrained domestic interactions and one optional neighbor response | Home, food/rest, Dad's note and Mila pay off the walk; only a few prior facts affect acknowledgment | Ahmet's prepared personal meaning and specific physical actions carry the ending; avoid another spectacle escalation. |

Do not use every payoff as a popup. Animate the safe passage, let a person react, change the ambience, or show a purposeful shared gesture. A callback that interrupts a danger cue fails even if its text is well written.

## 5. Progression and replay plan

The expansion needs a **reward calendar**, not seventy escalating stat multipliers. Use existing systems before adding another currency or equipment layer.

| Block | Primary motivation | Secondary mechanical novelty | Reward form |
|---|---|---|
| 31–40 | Learn to navigate together | Orientation, distraction and route choice | First visible post-slice companion consequence; a build application. |
| 41–50 | Secure a usable way onward | Weight, nets, wet terrain and barriers | Access, human gratitude, a concrete home detail. |
| 51–60 | Earn shelter and trust, then escape | Coordination, light and controlled noise | Garage memory, emotional rest, arrival in daylight. |
| 61–70 | Test apparent hope | Heat timing and changing gate space | Clearer call, confidence, a remembered cooperative action. |
| 71–80 | Exploit systems deliberately | Water/electricity and material chains | Mastery expression, optional route efficiency, relationship callback. |
| 81–90 | Revisit Arda's life | Crowd command and moving shelter | Personal memory, visible homeward progress. |
| 91–100 | Bring the walk home | Combinations of learned rules | Actual homecoming, Dad's note, Mila's independent choice. |

Keep fast rematches possible. An experienced player with a coherent build should sometimes dominate a familiar boss. Replay difficulty should ask for new positioning, constraints or optional mastery rather than invisibly canceling upgrades. Existing Nightmare/remix systems can carry that role once their rules and rewards are clear; do not make them a mandatory tax on the story.

For the progression sheet, record at L1/5/10/20/30/**31/35**/40/50/**54**/60/70/80/90/100: applied attributes and earned-but-unapplied ranks, practice sources, Cred earned/spent, eligible versus purchased perks, equipped gear, mastery, recipe offers/picks, evolution time and meaningful use, bond value/usable benefits, remembered actions and the next achievable goal. Use actual earned saves as blocks become playable, not only `P.Power.expectedLoadout` or projected legacy levels.

Use three combat intentions (close-range, ranged priority, terrain/control) and vary helper/hacker participation within them. Record opportunities as well as actions: a low Intelligence rank may reflect absent terminals rather than a player preference. An objective counts as training only when its actual simulation hook grants it; changing its label to “hack” is insufficient. A low-INT/CHA path remains viable, and optional actions cannot become an undisclosed prerequisite for the main route.

**Bond recommendation:** retain usable Chapter 1 benefits at 25/50 and leave75/100 honestly deferred unless a separately accepted design changes them. Use a few remembered actions, visual support variations and authored scenes after the meter saturates. Do not stretch the numerical curve to require grinding, remove already earned trust, or display a future stub as a reward. Relationship progression and relationship arithmetic need not end at the same time.

**Build recommendation:** no compulsory new weapon family is needed for novelty. Existing mastery/forks and weapon-terrain combinations must produce different choices. A pursued evolution needs meaningful combat after acquisition; short arrival/relief levels can pay off a smaller upgrade instead of being lengthened to fit an evolution. Keep the run reset explicit: carrying build intent across levels is not carrying a rank-5 run weapon into the next run.

**L30→31 offer-policy decision:** compare final first-30 assistance with an explicitly configured post-slice policy. Preserve comprehensible focus, partner guidance and viable survival alternatives. Test ordinary unfocused play as well as deliberate recipes; inspect the initial offers, rank progression, defensive sacrifice and remaining use time. If extra entry assistance tapers, make the transition gradual and justified by earned-save evidence. A code constant ending at 30 is not a design rationale. Neither automatic total removal at 31 nor an untested blanket extension to100 is accepted by this plan.

**UI inheritance:** new content uses the same Develop Arda, attribute-specific Apply rank action, accurate perk rank/Cred gates, affected-weapon tags, Arsenal/mastery detail and objective-aware pause. New training opportunities appear in relevant explanations without adding another top-level progression screen. Replay and return prompts use the player's real remaining opportunity or build intention; no new currency, daily obligation or mandatory menu tour.

Before authoring each next block, check whether its reward calendar contains an actual useful gain or satisfying application, rather than another row of tiny percentages. Audit utility at high earned power too: control/route choices should still matter after damage increases, without secretly scaling away the player's upgrades.

## 6. Art, animation and audio production plan for one founder

Use the same reviewable contract for every district:

| Deliverable | Required content |
|---|---|
| One visual identity sheet | Landmark, materials, palette, light/time, silhouette, ground/deck/water edges and approved viewing angle. |
| One encounter sheet per level | Player decision, objective states/pause text, geometry, enemy roles, warning/escape constraints, prop use/placement, consequence, story beat and failure/retry path. |
| Choice/memory sheet per block | Producer, valid outcomes, neutral fallback, run versus persistent state, callback, replay/mode/migration semantics and exact-once reward rule. |
| Boss acting sheet | Preferred distance and purposeful movement, target/aim-lock policy, anticipation, contact/damage interval, follow-through/recovery, phase change and aftermath; prop anchors and sound cue points. |
| Scene-specific story direction | Character/player knowledge, emotional turn, eyelines/expressions, props, memory conditions, protected control transitions and native TR/EN beat briefs. |
| Audio cue sheet | District ambience, dangerous cues, combat transition, respite and motif recurrence; visual alternatives for essential cues. |
| In-game review capture | Entrance, interaction, crowd overlap, boss phase, aftermath, next-level handoff, cold/missing asset and low-tier presentation. |

Shared rigs, material effects and interface components are productive reuse. A different coat over an unchanged boss or the same hold timer behind every new prop is not enough. Spend bespoke work on the few moments players will remember, then ensure ordinary movement, contact and menus are consistent around them.

Use the accepted first-30 camera/contrast/attack-language standard, including emergency threat framing, body/tool direction and mute readability. Do not solve every new boss introduction with more zoom or brighter lighting. Preserve arena visibility and one-thumb steering; phase changes alter positioning rather than only chase speed. Strong earned builds may win quickly; first-clear identity cannot depend on forced invulnerability or a long mandatory sequence.

Do not generate seventy impressive backgrounds before validating how their perspective, anchors and collision work in play. Start with the same contact and layering rules proven in the slice. Track essential assets per scene and load them deliberately; avoid silent fallback to retired drawings. Maintain the existing dependency, localization and file-size rules.

## 7. Production gates

### Gate A — before L31–35 implementation

- Receive the final first-30 implementation packet and audit that exact build against H01–H18/G01–G36. All ten named encounters, meaningful choices, progression/pause, story scenes, assets and ordinary end-to-end flow are in scope; one polished reference boss is not sufficient.
- Close shared-system blockers that would force multiple districts to be rebuilt: interaction/cancel semantics, choice/save facts, companion support, offer policy, contact/framing, UI contracts and device-critical reliability. Keep lesser polish items explicit instead of silently converting them into blockers or declaring them done.
- Preserve the corrected canon above; complete the route/time-of-day/knowledge sheet. Record Chapter 1 bond treatment and the earned-progression checkpoint template.
- Specify future object setups, local-choice definitions/callbacks and supported milestone states. Keep source-of-truth/config ownership and sim/view boundaries; no new architecture platform is implied.
- Record a named source/build checkpoint and uncoached physical-phone baseline under the existing execution-plan gate. Missing device/player evidence remains open and is reported to the owner; desktop screenshots cannot stand in for it.
- Obtain the owner's expansion go-ahead after the first-30 audit. Updating this document and finishing code do not themselves clear that gate. Planning and first-30 verification can continue while the gate is open.

### Gate B — approve Kapalıçarşı as a five-level block

- The same earned save starts at L29, completes 30, enters 31, clears/retries through 35, receives the district payoff and sees the L36 goal. Record uninterrupted footage of the transitions as well as isolated mechanic captures.
- Every level has one distinct required decision, an observable consequence and a fair fallback for a different build.
- Kaan's behavior, actual unlocks and valid remembered facts persist. Physical props and run weapon ranks reset according to the existing run contract. No slice-only helper or objective explanation silently vanishes.
- Boss first-clear and rematch have appropriate different feelings; optional bonuses are understood.
- Required regression/balance checks and art review pass. Any missing phone or listening evidence remains explicitly open.

The first block must pass this boundary matrix before it becomes a template for the other thirteen:

| Case | Required observation |
|---|---|
| Ordinary unfocused and three earned build intentions | L31 offers remain understandable and viable; record the effect of the chosen post-slice assistance policy, not just a final clear. |
| Weak/typical/strong earned power | Passage decisions and boss identity remain legible; no compulsory specific drop/perk, long low-power stalemate or arbitrary anti-upgrade invulnerability. |
| Prior helped/not-helped and old save with no new flags | Correct callback or neutral variant; Kaan's available abilities survive; no invented rescue or retroactive penalty. |
| L32 offense/placement and broken/ignored object | Clear tactical difference, consistent grip/Dash escape, valid collision and a reachable fallback in all cases. |
| L33 rescued/skipped/failed, replay and alternate modes | Appropriate local outcome and L34/35 acknowledgment; no first-clear overwrite or duplicate rewards. |
| Pause at each new task and after an interruption | Goal, next action and this-run build recover correctly; no stuck gesture, unhandled objective type or lost essential fact. |
| Cold/failed art, mute, low quality and Reduced Motion | Current art recovery and essential threat cues work; no retired ordinary-play art, hidden damage or scene audio overlap. |
| Clear→result→growth→next level→close/relaunch | Attribute/perk/mastery/gear/bond state and currency settle exactly once; future opportunities and return context remain truthful. |

### Gate C — expand in five-level blocks; review rhythm every ten

- Do not judge a block only by whether its isolated fixtures work. Play the preceding ending through the next beginning.
- Compare consecutive blocks for repeated decision structure, not just art similarity.
- Review the preceding two levels through the next block's first level. Check accumulated menu/dialogue interruptions, repeated hold behavior and whether object/companion choices remain voluntary and useful.
- Validate TR and EN against the fact ledger and scenes as actually emitted, including legacy barks.
- Validate each memory producer→consumer, skipped/unknown outcome and existing-save migration. Keep callbacks local unless a specific longer payoff is authored.
- Track meaningful choice time, transformation use time, losses/quits by section and voluntary next-run starts.
- Inspect earned progression at each ten-level checkpoint plus 35/54. Record training opportunities and observed choices, practical perk utility, build payoff time and relationship meaning after bond saturation. Adjust causes rather than inflate a global curve.
- Review the district asset/mix inventory and normal-speed boss motion on actual available hardware. Track frame-time tails, memory pressure and interruption recovery as content accumulates; a small first-30 download does not certify the full chapter.

### Gate D — chapter-complete acceptance

- A first-time player can explain why they walked home, where the family is, what changed with Kaan, why Ahmet matters and why Dad's note creates a new question.
- Players recall several different decisions and personal moments across the whole chapter, not only the first six districts.
- They can name a build they want to try again and a challenge they understand better after losing.
- Phone controls, motion, mix, loading, interruptions and save recovery meet the product's target on real devices.
- Local actions have coherent, visible consequences without requiring every optional task, and replay does not corrupt the story or duplicate rewards. Attributes, perks and run builds remain understandable at late-game complexity.
- L100 delivers closure before opening Chapter 2. The ending remains satisfying if the player stops there for the night.

## 8. Revision record and evidence boundary

**2026-11-18 update:** retained all seventy level concepts and the canonical walk; replaced stale failure claims with current status; added the holistic-system inheritance contract, state/memory rules, novelty budget, fourteen block-level applications, late progression/offer-policy checks, current UI/animation/asset requirements and stronger production gates. Clarified L54's owner constraint and flagged light-carrying/moving-platform assumptions as capabilities to justify, not invisible implementation obligations.

Source inspection included `config-levels.js`, `config-env.js`, `config-bond.js`, `config.js`, `sim/progression.js`, `sim/street-placements.js`, `sim/local-choices.js`, `sim/kaan-support.js`, `meta/meta-data.js`, current EN/TR story/finale entries and the narrative/journey/execution-plan references. Source presence is not a claim that the player-facing experience has passed review. The implementation ledger was still in progress at inspection; this revision does not overwrite or close its statuses.

No runtime content, balance, save, canonical script, dependencies or assets changed for this update. No levels beyond 30 were implemented. Document structure/links and complete level coverage were checked; the implementation's running tests were left untouched. The next step is the completed first-30 audit, followed by an explicitly authorized, verified L31–35 block.
