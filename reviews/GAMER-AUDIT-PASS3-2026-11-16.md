# Third player experience audit and improvement plan

2026-11-16 · Project Istanbul / NO SIGNAL · Bölüms 1–30 · Review only

**Verdict: a substantially stronger prototype, but not yet a masterpiece.** The game now has authored district interactions, meaningful weapon modifiers, readable upgrade recipes, a clearer reason to go home, and a more credible Kaan relationship. Those are real improvements. The remaining gap is the consistency with which its mechanics, acting, sound and consequences produce a memorable experience.

**There is still a material risk of routine.** A player can experience different props and objectives while repeating essentially the same decision: move forward, circle pressure, stand near the highlighted object, choose an upgrade, continue. More enemy health, more unlocks or more effects will not solve that. The best next investment is three excellent sequences that change how the player thinks, feels and acts, followed by measured propagation across the slice.

This report does not certify parity with Hades or greater retention than Survivor.io. Those require human comparative play and return behavior. Implementing a list is not the same as achieving the intended experience. Use the acceptance gates below to decide whether a change actually improves the game.

## Evidence and limits

This pass reviewed the current shared working tree, including D-103, D-104, the restored L1 portraits and recent art/input fixes. HEAD at inspection was `4f5361dc0f5306a0243719a8afba9382d4c9e9d3`; substantial uncommitted implementation exists. Source fingerprints are in `reviews/telemetry/gamer-pass3/source-sha256.txt`.

| Evidence | Coverage | What it establishes |
|---|---|---|
| Current normal simulation | Every level 1–30, seed 42, active-skill policy, expected loadout, up to one revive | 29/30 clears; 24/30 clears without death. L20 loses after recovery. No crash or timeout reported. This is independent per-level testing, not an earned-progression campaign. |
| Current Nightmare simulation | L5, 10, 15, 19, 20, 25, 29, 30; seeds 1–3; active skills; expected power | 22/24 clears, 12/24 without death; no crashes/timeouts. Small diagnostic sample, not a target difficulty curve. |
| Current browser interaction | L1 restaurant, exit, street, cards/mods; L19 opening, skill/chest, pause/quit; map and attributes/tree | Actual movement and UI inspection. Short debug-entry samples; not 30 manual clears and not fair difficulty measurements. Tool gaps leave the hero idle. |
| Story inspection | Current TR L1–30 readthrough; Captain aftermath and L30 ending in comic preview | Narrative structure, motivation, line intent and sampled visual acting. The English script needs its own complete editorial readthrough. |
| Audio inspection | Runtime routing, music assets, prepared SFX manifest, focused tests | Eight music files with expected durations, generated SFX present, mixing priorities and state wiring. No critical listening verdict is claimed. |
| Ten focused suites | gamer-route, dialogue, barks-delivery, music, sfx-gen, env, perks-combat, progress-ui, input, scene-art | All passed. One initial command used nonexistent `dialogue-delivery`; the correct `barks-delivery` passed separately. That harness error is not a game defect. No full-suite-green claim. |

Logs and all-level results: `reviews/telemetry/gamer-pass3/`. Images: `reviews/media/R1/gamer-pass3/`. The previous two reports remain useful historical evidence, but their old balance numbers are not measurements of this build.

An emulated portrait viewport is not an iPhone. Input latency, sustained thermal performance, haptics, speaker mix, silent-switch behavior and touch ergonomics still need device testing. The handoff records an earlier raster benchmark around 37 ms p95 at 200 enemies; that is historical evidence of a performance concern, not a new measurement of current gameplay.

## What should be kept

- **The ordinary Istanbul details.** A borrowed knife, a meal interrupted, a mother asking about food, a musician finishing a song, a Captain's apron and a cat leading the way carry more identity than generic apocalypse exposition.
- **The revised motivations.** The parents have left; Dad's note provides a reason to go home. Kaan checks on his Captain before choosing to stay with Arda. Do not reintroduce ambiguity about facts merely to create mystery.
- **The current artwork direction and full L1 portraits.** The sampled street call is legible and gives Mom presence. Its scheduling and acting need refinement; removing the faces would discard an owner-requested improvement.
- **Existing environmental interactions.** Gas/fire, foam, water/electricity, moving hazards and district mechanisms already exist. Recommendations below are about staging, choice and comprehension, not pretending these features are absent.
- **Build forks, mastery and utility perks.** These already go beyond flat damage increases. The task is to make their consequences perceptible and their acquisition comprehensible.
- **The recent fixes.** Compact streak display, later focused reroll, Nightmare route retention, Kaan's later Dash follow-up, new objective prop artwork, clearer rolling-hazard lane and safer hit flash should remain.

The lesson worth borrowing from Hades is integration: combat expression, changing challenges and character relationships support the same repeat-play structure. Supergiant describes those aims together in its [Hades FAQ](https://www.supergiantgames.com/blog/hades-faq/). This is a design reference, not evidence that this prototype achieves them. Keep the one-thumb game distinct rather than importing a controller game's input complexity.

## Where routine can still emerge

| Timescale | Current strength | Remaining risk | Desired player thought |
|---|---|---|---|
| Seconds | Responsive movement, automatic attacks, Dash/shield/ultimate, readable pickup classes | Survival can collapse into steering while weapons solve the fight | “I lined them up and caused that.” |
| One encounter | Authored route mechanisms and bosses | Different devices can still feel like repeated occupancy timers | “This situation asks a different question.” |
| One run | Mods, recipe cues, reroll agency, environmental chains | An intended build may arrive late, or its change may be hard to feel | “This run plays differently because of my choices.” |
| Five levels | District art, boss and story transition | Each district can become another corridor and checkpoint | “I remember what happened here.” |
| Thirty levels | Homeward journey, family mystery, Kaan | The ending can feel like a distance update and another withheld answer | “We accomplished something, and I care what happens next.” |
| Return visit | Nightmare variants, mastery and Night Shift exist | Familiar errands, stat grinding and repeated text can outweigh discovery | “I have a tactic or possibility I want to try.” |

Constant excitement is not the target. Peaks need anticipation and relief. A quiet, safe moment that changes how the next fight feels is useful; an unexplained pause, repeated reward modal or empty trek is not.

## Priority findings

Priority P0 means repair before the next uncoached playtest. P1 means the next quality investment. P2 means consolidate after the central prototypes work. Each proposed behavior change remains a proposal for the implementation agent and owner; this audit changes no design decisions or balance numbers.

### P3-01 P0 Make the first exit instruction agree with the screen

**Confirmed in play.** `route.leave` says “Sol taraftaki kapıdan çık.” In the current restaurant view the visible exit is along the upper wall toward the middle/right of the room. Following “left” put the hero against the left wall. Moving back toward the actual marker allowed departure. This is misleading guidance, not a softlock.

Evidence: `l1-exit-guidance.png`; `prototype/js/strings-progress.js:8`; the doorway at x -6..-4 in `prototype/js/view/restaurant-art.js:9`. World-space “left side of the street” does not describe the player's immediate screen-space task.

**Change:** use a landmark or exit-marker instruction that remains true from every starting position. Make the door opening, collision gap, arrow and text one consistent target. Do not solve this by making the room less interesting.

**Acceptance:** five new players leave without coaching or more than one mistaken wall approach; verify TR and independently authored EN. Test from both sides of the room, with movement assist and larger text. A source-string assertion alone cannot validate this.

### P3-02 P1 Give repeated encounters different decisions

**Design risk grounded in the route implementation.** District-specific trials exist, but many interactions ultimately use proximity, hold progress and a gate opening. That shared implementation is sensible. Its presentation must not make every situation feel like “stand on the ring again.”

**Change:** classify each of the 30 levels by its dominant player decision: lure, intercept, time, redirect, protect, commit, escape, or recover. Adjacent levels should not require the same response merely with different scenery. Preserve existing mechanisms; change encounter staging, enemy composition and payoff first.

For example, one encounter asks where to draw a crowd; the next asks when to cross; the next asks whether to take a safe route or commit to a risky chain reaction. If both options have the same answer regardless of build and health, the apparent choice adds little.

**Acceptance:** after three adjacent levels, at least four of five pilot players describe different tactics without quoting objective labels. Record where they changed direction, waited intentionally, or used a tool for a reason. Do not count unique mechanism IDs as proof of unique play.

### P3-03 P1 Turn the existing city interactions into deliberate victories

**Existing capability, underexploited identity.** `config-env.js` and the sim already support gas ignition, foam clearing, wet electrical arcs, live cables and chain blasts. These are the strongest foundation for a distinctive survivor game.

**Change:** author one clear setup, one player decision and one unmistakable consequence. Teach it safely, test it under pressure, then allow a creative alternative. Telegraph hazards before commitment; keep friendly damage consistent and visible. Credit the initiating action, not simply the final kill source.

Prototype the tram encounter described below. Do not add another universal explosive barrel system. Make the city feel useful, dangerous and understandable.

**Acceptance:** uncoached players can explain the chain in causal order and deliberately reproduce it on a second attempt. They retain an escape path and can complete the level without taking the optional risk. A chain that happens automatically offscreen does not pass.

### P3-04 P1 Let a build change behavior before the run ends

**Improved but not proven across ordinary play.** Focused reroll now spends an existing reroll, supports an established weapon and preserves two ordinary alternatives. Keep it. The implementation's controlled starter tests show some improved evolution access; those fixtures do not establish ordinary-campaign outcomes for all weapons.

The sampled L1 knife choice moved from a percentage increase into a meaningful heavy-hit versus critical-hit fork. That is the right direction. Seventeen weapons and twelve passives already provide ample breadth; more items would increase dilution and teaching cost.

**Change:** validate three distinct playstyles first: close-range timing, line control, and area/terrain control. Give each an early behavior-changing choice, a useful intermediate state and a late payoff. Let the player see what a mod changes through a brief optional preview or immediately legible first use. Avoid locking all interesting behavior behind a completed recipe.

**Acceptance:** log intended build, offers, chosen fork, reroll use, recovery choices, time of transformation and remaining useful combat. Test earned saves, not only expected loadouts. In a pilot, players should identify a tactical difference between three builds and want to try another. A proposed tuning target is at least 30 seconds of meaningful use after a signature transformation; validate that against actual run lengths rather than guaranteeing an evolution in every short level.

### P3-05 P1 Finish the fairness investigation before increasing difficulty

**Diagnostic evidence:** in the current Nightmare sample L20 clears 3/3 but none without death; L25 and L30 both clear 3/3 without death. Normal seed 42 loses L20 after recovery while clearing L30 without death. This is a location to investigate, not statistical proof of an inverted difficulty curve. Earlier implementation measurements still identify L13 bloater pressure as a concern.

**Change:** capture L13, L14, L19 and L20 with equivalent earned power. Classify deaths into misread warning, bad commitment, intentional greed, overlapping unavoidable damage, build weakness and execution failure. Inspect the approach to an objective as well as its center. Keep mechanics that reward learning; fix threats whose safe answer cannot be perceived or performed.

**Acceptance:** a player can name the cause of death and attempt a specific correction. Their second or third attempt should show fewer repeats of that mistake. Report clean clears separately from revived clears. Add difficulty through readable combinations and variants before raw speed/health inflation. The three-seed Nightmare sample is far too small to set global rates.

### P3-06 P1 Make Kaan a relationship the player performs

**Partially resolved prior finding.** Kaan now appears for about 1.45 seconds and can perform one gated follow-up after a later Dash. L25's cover acknowledgment is conditional. Those are useful corrections; two brief assists still do not automatically create the feeling of traveling with someone.

**Change:** make one shared task reciprocal. Kaan creates a safe window; Arda deliberately uses or extends it; their coordinated action changes the route. Keep the existing movement/Dash vocabulary. No extra combat button, escort-health tax or full companion AI is needed for the first prototype.

Let a visible aftermath persist: he moves beside Arda briefly, checks the route, or reacts to what happened. Use actual witnessed actions for acknowledgments. Do not praise assistance the player never saw. A playable character or tag switch remains a separate scope decision, not a prerequisite for companionship.

**Acceptance:** at least four of five pilot players identify Kaan's contribution and describe something they did with him. His silhouette and action remain readable in a mixed build. A failed timing opportunity is recoverable; it must not become a mandatory companion-management chore.

### P3-07 P1 Match emotional acting to the revised writing

**Confirmed visual mismatch.** In the sampled Captain aftermath, Kaan recounts receiving the apron and says he cannot stay. The displayed portraits retain composed, faintly smiling expressions; Arda's face also reads relaxed. The writing expresses grief more specifically than the acting does. L30 also reuses the same Arda pose across a decision and a worried question.

Evidence: `captain-panels.png`, `l30-end-complete.png`; current comic raster/bust paths and story page definitions.

**Change:** commission a small, consistent expression/pose set for the existing cast: guarded humor, alarm, effort, exhausted relief, grief and listening. Prioritize L20, L25 and L30. Stage a hand gripping the apron, an averted gaze, Arda giving space, or the empty boat before adding another explanatory line. Use current ImageGen scene art, matching character model, lighting and scale; no retired art fallback.

**Acceptance:** viewers identify the intended emotion with the lettering hidden. A native reader then verifies that the face, pause, line and response agree. Keep the scene skippable and remember whether it was seen. More frames alone will not repair an inappropriate expression.

### P3-08 P1 Give the first thirty levels a completed emotional arc

**Narrative judgment.** The rewrite fixes the basic destination problem. L5 establishes the note, L15 establishes family safety, L20 gives Kaan a shared plan, and L25 explains why he stays. Preserve that clarity. The remaining risk is that going home for a note can feel like an extended fetch task once the family is known to be safe.

**Change:** make Arda's personal reason for honoring Dad's instruction tangible without inventing a new contradiction. A concrete remembered habit, useful piece of route knowledge, or promise can carry it. Let each call resolve one question as well as opening another. Treat signal loss as the setting's constraint, not the default way to delay every answer.

L30 currently offers the restarted clock, the motorway warning, a question about Dad and “Ataköy: 12 km.” Keep the mystery, but make the clock/route payoff something the player has caused and witnessed. The slice should close the movement from isolated survival to a chosen partnership, while opening the next question.

**Acceptance:** after L30 a player can explain what was accomplished, what changed between Arda and Kaan, where the family is, why home matters and what they are curious about next. Do not require a lore journal to understand the main journey. This plan stays within L1–30.

### P3-09 P1 Direct the music around events and relationships

**Confirmed wiring; creative gap, not a missing-file defect.** Eight prepared tracks exist: title/map 150 seconds each, calm/intense/boss 180 each, comic 120, victory/defeat 20. `run_intense` is registered but has no gameplay trigger; the music README explicitly treats it as an alternate recording. `main.js` selects calm for ordinary runs, boss on introduction, calm after boss death, then victory. Do not describe the soundtrack as unimplemented or procedural placeholders.

**Change:** first audition the existing recordings together. Define a small view-side music state machine: exploration, mounting pressure, commitment, boss, aftermath, relief. Use authored encounter events plus hysteresis, not rapid health-based toggling. Do not layer unrelated full mixes as if they were synchronized stems. If the recordings cannot transition musically, prepare compatible edits before wiring them.

Give one original motif a dramatic role: heard from the musician, recalled after the wedding, thinned after the Captain, restored in altered form at L30. Let selected quiet scenes actually become quiet. Avoid the same immediate celebratory treatment for every boss's death, especially the Captain.

**Acceptance:** critical listening on phone speaker and headphones; no abrupt restart, pumping, audible seam, competing tracks or resumed music in the wrong app state. A listener should distinguish tension, loss and relief without seeing the screen. Runtime tests must verify transitions without letting audio affect the simulation. No voice actors, paid services or new dependencies are authorized by this proposal.

### P3-10 P1 Design sound hierarchy around information and weight

**Solid technical foundation.** The current system has buses, ducking, priority limits, family rate limits and generated assets. Settings explicitly describe no voice acting; speech sounds are blips. The prepared directory contains 49 MP3 files. These facts do not establish whether the mix is enjoyable.

**Change:** review every cue in context using an event-to-sound sheet generated from current code. Give three weapon families distinct attack/release/impact/recovery identities. Separate harmless contact, actual damage, armor deflection, successful interruption and near miss. Keep rare threatening cues audible when pickups and automatic fire are dense. Use spatial direction where it helps a decision, but preserve a visual equivalent.

Audit speech-blip fatigue and its interaction with music ducking. A long text exchange should not flatten the whole soundtrack into a pulsing bed. Update the stale cue-sheet status so implementation agents do not replace owner-provided tracks by mistake.

**Acceptance:** five blind cue-identification trials for hurt, incoming danger, blocked attack, heal and cooldown readiness; repeated-play fatigue listening; silent-mode gameplay remains readable. Limit concurrent ornamental cues before lowering important warnings. Critical listening is outstanding, so this report makes no claims about timbre, clipping or emotional quality of the actual recordings.

### P3-11 P1 Raise animation quality through complete actions

**Current capability:** character walk frames, attack poses, held-weapon motion, hit response, boss telegraphs and defeat effects already exist. Raster selection includes four Arda walk poses and simpler enemy cycles; frame count is not by itself a quality verdict. The small sampled actor remains identifiable, but screenshots cannot certify motion polish.

**Change:** choose three hero actions and three boss actions. Review anticipation, release/contact, weight transfer, reaction and recovery as one continuous action at normal speed. Align the moving hand, weapon and collision result. Give heavy, light and ranged attacks different motion rhythms. Let interruption, armor and death read differently. Use the existing rendering direction rather than demanding a wholesale engine or art replacement.

**Acceptance:** record normal-speed phone clips, then inspect slow motion for contact mismatch and foot sliding. Players can predict a threat without reading text and understand a hit without watching numbers. Keep the hero visible under mixed weapons. Reduce-motion/flash settings preserve essential tells and the same simulation outcomes. Meet the existing flash guardrail; do not multiply shake and white flashes to imitate weight.

### P3-12 P2 Reduce reward friction and clarify growth

**Observed:** the L19 sample moves from an upgrade choice into a full-screen chest presenting a knife damage increase and another Continue button. The chest is understandable, but this is a pause without a new decision. The map's next-play button is prominent; growth opens into six attributes, separate training and perk requirements.

**Confirmed terminology inconsistency:** HUD/result keys use “Sokak Kredisi”; the tree describes “Sokak Tecrübesi” for the same spending concept. Resolve the intended native terminology and use it consistently. The growth screen says actions develop attributes, but the initial visible rows do not tell a new player which action to perform next.

**Change:** test a compact claim animation for repeated numerical chests; reserve the full ceremony for a new mechanic, evolution or special reward. Keep accessible detail/history and an option to inspect. Explain one next growth action in plain language, and show the consequence of the next perk. Consolidate the glossary for level/Bölüm, weapon rank, Adrenalin, training and spending points.

**Acceptance:** measure nondecision modal time separately from meaningful card decisions. A new player can explain how to unlock one desired perk without guessing. A returning player reaches the next run quickly. Do not remove all pauses: card selection and story beats are useful when they earn the interruption.

### P3-13 P2 Make consumables change a route decision

**Existing design:** simit restores health under a drop-heal budget; pharmacies/kiosks are one-use healing opportunities and do not consume at full HP. Pickups already distinguish healing, power, currency and objective roles by shape and color. Keep those strengths.

**Risk:** most drops are things to sweep up. The hidden exhaustion of a heal budget can also feel arbitrary unless the “CAP” feedback and prior information are comprehensible. A new inventory belt would add input cost to a one-thumb game.

**Change:** stage an existing healing station as a visible retreat option with a real travel cost. Show usable, full-health, exhausted and used states clearly before commitment. Test one optional environmental utility pickup that replaces a route opportunity rather than adding another button—for example, an extinguisher opportunity beside a dangerous fire route. Preserve existing weapon/prop semantics; do not overload the same icon with unrelated rules.

**Acceptance:** players distinguish the item classes and decide to leave or seek a resource intentionally. No critical sustain lies under an unreadable lethal warning. Report health gained, detour time and why a pickup gave zero; avoid encouraging players to farm damage for progression.

### P3-14 P1 Make replay respond to knowledge and prior actions

**Improved foundation:** Nightmare now preserves authored routes and includes variations; Night Shift is a separate mode. That closes the prior omission. It does not establish that a second visit is interesting.

**Change:** give a district a small set of authored alternatives that change tactics: a different safe side, altered sequence, enemy-role substitution, or a route opportunity suited to another build. Signal the variation before it punishes memory. Persist witnessed story state so characters can acknowledge a rescue, environmental tactic or failed plan without repeating the same exposition.

Failure should supply a useful clue or character response, not a new grind obligation. Keep major story revelations tied to coherent progression; do not reward intentional death as the fastest way to hear every line. Leave the player with one concrete next experiment, not several red badges.

**Acceptance:** second and third visits produce different decisions while remaining readable. Players voluntarily name a reason to replay without prompting. Measure return intent and actual voluntary return separately. Do not use punitive streak loss, expiring relationship content or forced daily attendance to manufacture retention.

### P3-15 P1 Treat presentation and performance as one quality gate

**Visual judgment:** current illustrations and comic backgrounds provide a strong foundation. Combat can still read as small figures on repeated paving, while the richer city identity lives around the playfield or between fights. New objective art is present; do not reopen already replaced crane/awning/restaurant assets as absent work.

**Change:** establish one playable landmark silhouette, material/sound character and lighting rhythm per district. Keep decorative contrast below actors and threat cues. Design different encounter compositions inside the portrait camera: bend, threshold, sheltered pocket, open crossing, then compressed space. Use actual district artwork for incidental props and transitions, including low quality and missing-asset behavior.

**Acceptance:** players identify districts from short gameplay clips without the HUD label. Verify high/low quality, large text, color alternatives, reduced effects and cold asset loads on supported phones. Record frame-time percentiles, long stalls and input-to-motion latency through a continuous run; screenshot beauty does not compensate for inconsistent input. Choose a stable supported performance target explicitly and validate it before adding expensive spectacle.

## Three signature experiences to prototype first

These are bounded proposals, not six new subsystems. Prototype each inside an existing level; retain it only if players understand, enjoy and remember it.

### The street answers back

**Scope:** L2–5 tram sequence, using current tram control, crowd behavior and environmental effects.

The player first sees a tram carve a clean path through a small crowd. Later, they choose where to lure enemies and when to commit to an existing control. The tram's arrival turns their setup into a decisive sweep and opens the route. A bell, a short camera response and a visible cleared lane connect anticipation to consequence. The player escapes through the space they created.

The payoff belongs to the player's timing, not a cutscene that automatically kills everything. Keep an ordinary safe completion path. Nightmare changes the approach or timing cue, not the fundamental meaning of the bell.

**Minimum production:** one authored encounter arrangement, one clear trigger/payoff sequence, one mix pass and one attribution event. Use current art. **Reject** if players describe it as waiting for the game to solve the fight. **Pass** if they explain their setup and attempt a different setup next time.

### Someone has your back

**Scope:** L20–25, building on current Kaan support and the Captain aftermath.

A shared task establishes the rhythm: Kaan covers a side, Arda uses the opening, then returns the favor through an existing Dash/route action. Let Kaan remain visible briefly after the action. Later, a familiar gesture or object at the Captain's boat changes the meaning of the mechanic. The aftermath uses a listening pose, a physical apron detail and a short silence before the existing line.

The emotional payoff is “we did this together,” not “a helper effect appeared.” Keep the interaction recoverable and avoid escort frustration. The conditional L25 acknowledgment must continue to reflect what actually happened.

**Minimum production:** one reciprocal encounter variation, a persistent aftermath state, two or three scene-specific poses and a sound transition. **Reject** if players fail to notice Kaan or see him as a resource meter. **Pass** if his later decision to stay feels earned.

### A city you can hear changing

**Scope:** the existing musician, wedding aftermath, Captain scene and L30 clock; no new district or character.

Introduce a short original musical phrase from a believable source in Galata. Let the player briefly help or protect the moment through an existing encounter. At the wedding, the absence or interruption of that sound changes the mood. After the Captain, leave room for the waterfront and a single familiar fragment. At L30, the clock restarting becomes a visible result of the player's route success, followed by an altered musical resolution.

This supplies recognition across many small levels without adding exposition at every gate. It also makes silence an authored event rather than a missing asset. Preserve captions and visual equivalents for players with sound off.

**Minimum production:** approved motif/edit assets, four cue points, one scene-art detail and persistent completion/witness state. **Reject** if it becomes a mandatory rhythm minigame or extra waiting. **Pass** if players recall the connection unprompted and can explain what changed emotionally.

## Additional opportunities after the prototypes pass

| Opportunity | Smallest useful version | Why it could matter | Main risk |
|---|---|---|---|
| Paşa knows a way | One optional cat-led detour with an observable route benefit and later recognition | Makes a named local presence part of play | A mandatory follow-the-cat errand becomes another timer |
| A boss remembers the tactic | One signaled rematch response to a familiar approach | Knowledge creates a new question rather than an HP wall | Punishing a player for using the tactic just taught |
| A run worth telling | Results highlight one verified causal event, such as a tram clear or Kaan cover | Helps players describe their own story | Generic praise, inaccurate attribution or more reward screens |
| Recovering the lights | A brief authored Sirkeci lighting change ends in a player-created safe lane | Strong visual transformation with mechanical meaning | Concealing danger, flashing, or a purely cosmetic blackout |
| An intentional detour | One previewed route choice: safer sustain versus faster risky reward | Builds, health and confidence alter the best answer | One option becoming universally optimal |

Do not implement all of these at once. Choose the one that strengthens a validated pillar. Each must fit the existing one-thumb controls, accessibility rules and asset/performance budget.

## Plan for every level in the slice

These are proposed emphasis and acceptance targets over existing content, not claims that each mechanic is currently missing. Preserve authored district routes and boss rules. Do not replace thirty levels wholesale.

| Bölüm | Improvement emphasis | Evidence of success |
|---|---|---|
| 1 | Correct the exit; keep the food/knife character hook; stage the first mod's visible result | Uncoached exit, first meaningful choice, Mom understood without losing the hero |
| 2 | Make tram cause and effect legible with a safe observation | Player predicts which space becomes safe |
| 3 | Ask the player to create the setup rather than repeat the demonstration | A deliberate lure or timing decision |
| 4 | Contrast the tram lesson with wire/terrain control and a legible escape | Player explains a different tactic; review the long 266-second seed-42 run |
| 5 | Pay off the taught district knowledge in the boss encounter | Victory attributed to reading and action, not only damage growth |
| 6 | Establish Galata through a different spatial rhythm and a human sound source | District recognized without its label |
| 7 | Make the musician-related moment a bounded act of help, not another generic escort wait | Player remembers whom they helped and why |
| 8 | Let the existing route offer a meaningful risk/recovery decision | Different choices at high and low health |
| 9 | Combine known threats with a changed safe answer | Retry shows learning rather than repeated circling |
| 10 | Sharpen the victory-to-wedding-music transition already added | Player wants to investigate the sound |
| 11 | Use the untouched wedding space to create anticipation before pressure | Player notices an environmental story detail |
| 12 | Stage one existing environmental chain clearly | Player intentionally uses or avoids the chain |
| 13 | Resolve bloater readability and commitment pressure | Death cause and practical counterplay understood |
| 14 | Test whether mixed threats remain answerable around the route task | No unavoidable overlap at the required commitment point |
| 15 | Let the stopped music and Paşa's direction land after victory | A short emotional release without mandatory repeated exposition |
| 16 | Make the bridge introduction change spatial attention; establish Kaan's comic voice | Player notices the new threat geometry and remembers Kaan |
| 17 | Require a different timing or positioning answer from L16 | Player can describe the difference in actions |
| 18 | Differentiate optional objectives from the required route | A failed bonus never looks like an unexplained failed mission |
| 19 | Validate the rolling lane, stairs and safe commitment under real touch | Player reads destination and escape while the crowd is present |
| 20 | Investigate current failure concentration; establish a reciprocal Kaan moment | Learned retry improves; companionship is noticed |
| 21 | Seed the Captain with a specific object/action while moving | Player understands why Kaan cares before the aftermath |
| 22 | Offer a useful build/terrain opportunity rather than merely a shorter corridor | Even a roughly 74-second seed-42 run has a remembered decision |
| 23 | Make the shared route task legible and Kaan's contribution attributable | Player can explain both roles |
| 24 | Provide anticipation and a modest chance to prepare for the boat | Preparation feels intentional, not a mandatory grind |
| 25 | Complete the Captain fight, acting and music as one authored sequence | Players recall a human detail and the choice to continue together |
| 26 | Reset attention through Sirkeci material, lighting and sound | A new place feels present in ordinary gameplay |
| 27 | Give a short level one decisive spatial or build question | Compact does not mean forgettable |
| 28 | Pay off signal/gate knowledge with a clearly caused route change | Player knows what their action changed |
| 29 | Make reversed signal order in Nightmare legible; distinguish bonus failure from route success | No confusion between “failed objective” and an opened road |
| 30 | Connect the boss, clock, partnership and onward route into a local resolution | Player names an achievement and a new question, not just “12 km left” |

## Implementation sequence and handoff

### Stage 1 Repair comprehension and protect the current gains

Fix P3-01 and the growth terminology mismatch. Inspect bonus-objective versus required-route messaging at L18/29. Update the audio inventory/status documentation. Preserve the fixed overlays, Nightmare mechanics, later reroll and conditional Kaan acknowledgment.

Relevant areas: `strings-progress.js`, progress/tree strings and UI, `route-milestones.js`, objective/results presentation, music README and cue sheet. Test the actual screen state plus localization/layout checks. Exit when an uncoached player can navigate, distinguish required tasks from bonuses and explain one growth goal.

### Stage 2 Prove the three signature experiences

Implement one bounded prototype at a time: city causality, reciprocal Kaan action, then musical/emotional continuity. Use existing route events, `sim/kaan-support.js`, view effects, dialogue/story definitions and music routing. Keep simulation determinism and view separation. Put new numbers in config; write proposed design decisions and deviations into the normal review packet.

For each prototype, capture a clean first attempt, a learned retry and one failure. Observe five unfamiliar players as a formative test, including at least two who are not experienced survivor players. Five is a cheap way to expose comprehension failures, not enough to prove retention or population-level superiority.

### Stage 3 Bring motion, sound and performance to the same standard

Finish the selected six action clips, the scene-specific acting, sound hierarchy and phone mix. Follow the existing in-game art review on actual moving scenes. Validate supported phones, including the least capable supported device, at representative crowded states. Keep one reproducible seed/capture for before-and-after comparison.

Exit only when the successful prototype still reads with a mixed build, reduced effects, large text and cold assets, and maintains the chosen stable frame target. Do not declare completion from an isolated sprite sheet or a silent desktop screenshot.

### Stage 4 Propagate patterns across the thirty levels

Use the level table to eliminate adjacent repetitions. Add only bounded variations that create a different answer. Run normal and Nightmare at earned power, with three build intentions and multiple seeds. Track clean clears, revival, first lethal source, objective commitment, active-skill use, build payoff time and nondecision interruption time.

Separate route completion from optional objectives in telemetry. In this audit L29's bonus `defend.booster` failed in all three Nightmare cases while all three levels cleared; the code explicitly permits optional objective failure. That is not evidence of a broken required gate. It is a reason to test whether the player-facing distinction is equally clear.

### Stage 5 Test desire to return and comparative quality

Recruit a broader cohort across survivor fans, action-game fans and mobile newcomers. Use fresh progression, then observe a return session with a familiar district. Counterbalance game order for any comparison with Survivor.io or Hades; compare comparable play windows and state familiarity. Do not pretend a first-time prototype run and a veteran's developed competitor save are equivalent.

Ask after play, not continuously during combat: What did you cause? What surprised you? What felt unfair? Who do you remember? What would you try next? When did you want to stop? Record actual voluntary replay and return, with consent, separately from reported enthusiasm. Review early exits and players who do not return, not only completion feedback.

Treat “more fun” as several observable outcomes: comprehension, control, meaningful choice, memorable incidents, emotional recall and voluntary return. Set release thresholds after baseline data. Do not invent a retention target from the bot results.

## Completion criteria for the implementation agent

For each ticket, include a reproducible before/after, the affected level and save state, localization review, a representative gameplay clip, relevant tests and the player behavior that changed. Keep recommendations distinguishable from accepted decisions. Preserve the dirty shared work and follow the existing branch/review workflow for later implementation.

A practical quality gate is that players can explain a death, perform a learned correction, identify a build's tactical identity, recall three specific incidents, describe why Kaan stays, and volunteer a reason to play again. A technically green build that fails those questions still needs iteration.

**Do not add more currencies, weapons, mandatory daily tasks, long mid-fight dialogue, constant camera shake or additional levels to solve this audit.** The strongest route to an exceptional game is to make its existing place, people and actions matter to one another, then prove that connection in play.

## Verification record

No game code, assets, balance values, dependencies or accepted design decisions were changed by this audit. No commit, push or merge. The report and evidence are the deliverables; implementation remains in the other chat.

Commands and interpretation are recorded in `reviews/telemetry/gamer-pass3/README.md`. Current run tables cover all thirty levels, but neither simulation nor source inspection substitutes for sustained human play. Full English editorial review, critical audio listening and current physical-phone acceptance remain open quality gates.
