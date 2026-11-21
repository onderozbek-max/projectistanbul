# NO SIGNAL first 30 levels independent player audit

**Pass 8 · 18 November 2026 · For Onder and the implementation agent.**

**Verdict: not yet a masterpiece, and not ready to expand production beyond Level 30.** The prototype is substantially more coherent and technically dependable. It still falls short in the things a player feels most often: bodily movement, contact, encounter variety, readable spectacle and the delivery of emotional scenes. Several requirements are implemented as systems but remain incomplete as experiences. Two newly confirmed story/UI defects also escaped the green tests.

Hades is a useful creative standard for readable action, distinct encounters and attachment to characters. It is not a checklist that can be satisfied by adding a zoom, another effect or more dialogue. This game needs its own strong identity: **improvising with Istanbul's streets while two people try to get home**. Its strongest ingredients already support that direction. The next pass should finish and connect those ingredients.

Read this verdict with the [requirement closure matrix](AUDIT8-PRD-CLOSURE-2026-11-18.md), [all-level and asset review](AUDIT8-LEVELS-AND-ASSETS-2026-11-18.md) and [consolidated implementation brief](AUDIT8-IMPLEMENTATION-BRIEF-2026-11-18.md). The brief separates repairs to the approved PRD from new design proposals.

## 1. What was verified

The audited build is the dirty local prototype based on `4f5361dc0f5306a0243719a8afba9382d4c9e9d3`. A separate frozen copy was used for play and tests. All **1,113 frozen runtime files** match the implementation evidence manifest. The owner's `8765` server and save were not used for the playthrough. The live workspace subsequently advanced; the late-change reconciliation below distinguishes those edits from the fully audited build.

| Evidence | What it establishes |
|---|---|
| Fresh English L1 played from opening through Cook, exit, comic, results and permanent upgrade; pause, Gear, Arsenal, Tasks and Memories inspected | Direct observations of the actual first-session flow and visible defects. One explicit free playtest revive was used. A first-run Second Wind may also have fired; it was not separately observed. Tool-input gaps make this run unsuitable as a human difficulty measurement. |
| Independent full suite on the frozen copy | **49 groups passed, 0 failing.** An earlier sandbox-only attempt could not bind a test server; the authorized rerun completed. |
| Independent broad campaign from earned progression | **All 30 levels cleared in 33 attempts, 3 deaths, no Second Wind used.** Outcomes and simulated times matched the implementation campaign exactly. This is bot evidence, not player retention evidence. |
| All 30 world-action fixtures; ten boss fixtures; all 17 weapons at ranks 1/3/5 and 18 evolution frame sequences; sixteen enemy recordings; conditional evolution and conflict cases; major-scene captures | Presentation coverage across the slice. Seven enemy recordings prove to be frozen after an upgrade pause, so that coverage is rejected. Frame inspection and selected playback do not equal a continuous human playthrough of every level or every clip. |
| Reanalysis of four earned campaigns, boss comparisons, expected-power sweep, scripts and runtime bindings | Cross-build consistency, balance warnings, missing coverage and PRD implementation detail. Most of these diagnostic runs were supplied by the implementation agent; the broad campaign and full suite were independently rerun. |
| Current major story/call text, scene triggers and dialogue-reset logic | Narrative continuity and delivery assessment. This is not a new line edit of every TR/EN entry or a claim to have heard voiced performances. |

No physical iPhone, uncoached player session, perceptual audio audition or full manual 30-level campaign was completed in this audit. Those remain material acceptance gates. The verdict below does **not** depend only on those missing gates: the directly visible defects already justify withholding artistic acceptance. [Raw audit summary](telemetry/audit8/audit-summary.json) · [test log](telemetry/audit8/full-suite.log) · [independent campaign](telemetry/audit8/earned-broad-independent.jsonl) · [capture notes](media/R1/audit8/README.md).

### Late workspace reconciliation

After the frozen-build checks, a [separate visual-correction follow-up](CHARACTER-VISUAL-CORRECTIONS-2026-11-18.md) changed eight runtime files and added one civilian atlas. Its **1,114-file manifest matches the later workspace**. I inspected the source diff and selected supplied stills; I did not replay or independently run the full suite on that later build. Its implementation-run full suite was still incomplete at this inspection. [Exact delta](telemetry/audit8/late-workspace-delta.json).

| Later change | Audit treatment |
|---|---|
| Arda uses four authored stride frames and a preserved lower-body silhouette | Directly addresses the earlier knee/idle-crop problem. Do not rebuild or reject this improvement based on the old gait strip. Current normal-speed turning, arm/attack integration and phone-scale weight still need acceptance; P8-04 is qualified accordingly |
| Six authored fleeing civilian identities replace the single patron | Variety is visible in the supplied natural-crowd still; preserve it. This does not establish all rescue/guide acting or sustained animation quality |
| Opening rules now resolve the speaker through story metadata | Supplied EN still shows Arda in all three panels and source uses the canonical resolver. This repairs the separate opening-rule portrait problem. **P8-01 is the static Mom call in `comic.js`, which remains unchanged** |

The source files behind the collection, stat/UI, scene-composition, balance and reward-timing findings were not part of this late change. No newer media is silently counted as independent frozen-build play, and no old frame is presented as proof that the newer stride still has the same defect.

## 2. The player journey

**Opening.** The restaurant, local objects and comic illustrations establish a distinctive place. The staging remains too distant: small actors, weak attention changes and a difficult-to-read doorway reduce the impact of the first transformation and escape. Good illustration quality is not consistently carried into the moving world.

**Learning and fighting.** Automatic combat and one-thumb movement are approachable. Recipe help makes a committed build more understandable. But the player spends much of the journey moving through similarly framed streets toward another work circle. Different task names and moving props do not always create different decisions. Bosses introduce new rules, yet several early ones can die before those rules become memorable.

**Reward.** The chest artwork, actual attacker on defeat and explicit run/permanent scope are improvements. In my L1 run, however, the Cleaver evolution arrived from the chest **after the Cook died**. I then walked it to the exit without getting a meaningful fight with it. The build had a readable promise and an anticlimactic payoff.

**Story.** The walk home, Paşa, Kaan's suspicion becoming companionship, the Captain's kindness and the family call form a coherent emotional spine. The writing is stronger than its staging. A farewell is weakened when a giant comic panel, frozen threat effects and a chest prompt compete with the people. Returning to a Memories screen full of locked placeholders after reading a comic further disconnects story from progression.

**Return motivation.** The player has reasons to continue: another district, weapon unlocks, the family question and Kaan. Reasons to replay a familiar level are weaker. Every normal loadout still starts with the knife; much permanent progression is numerical; current replay menus foreground counters and daily modifiers. The game needs more visible opportunities to try a different tactic, and a stronger record of what the player changed in the world.

**Narrative craft.** The Captain's memory—dropping a tray, receiving a mop, being expected back the next day—is worth preserving because it characterizes kindness through a small action. Arda offering to wait and Kaan choosing to accompany him create a real emotional change. The scene needs space for those reactions; extra lore would dilute them. Mom's ordinary concern about food similarly gives the journey a personal reason beyond distance. Repeated calls should change what Arda understands or intends, while allowing that domestic warmth to recur. The current L30 route clarification does that more effectively than an unexplained new destination.

Across the districts, make the dramatic progression tangible: **escape alone → begin reading the city → follow Paşa toward possible shelter → distrust, then accept Kaan → reciprocate help and share a loss → choose the next route together**. Several transitions are currently narrated over generic standing actors. The next pass must show the event being described: the shopkeeper actually pulling a shutter, Paşa finding a path, Kaan lowering his fish, the pair making room beside each other. Do not explain an action in a caption while depicting a different stock pose. Incidental jokes can return after tension releases; they should not interrupt a warning, first human recognition or the Captain's farewell.

## 3. Improvements that should be retained

- Deliberate interaction intent, cancellation, finite cover and factual choice persistence are meaningful foundations. Do not revert to incidental contact deciding the player's history.
- Damage and healing now have separate event-driven feedback, a recent-loss segment and critical-state hysteresis. Full-health food has an explicit saved state. These require better perceptual testing, not deletion.
- The Cook's historical shrinking defect was **not reproduced in the normal fight I observed**. Maintain scale invariants while improving poses; do not reopen an old bug merely because an earlier audit mentioned it.
- Boss openings appear near the actor, and Captain/Ticket Man have more specific attack logic. Preserve those rules while making their intention and weight visible.
- Pause states the task; attributes show how to earn their own ranks; perks distinguish prerequisites from currency. Brute Force correctly explains that the starting knife is not a heavy weapon.
- L30's current lines explain the Bazaar route while retaining Ataköy, the family in Sarıyer and the future message at home. Do not reintroduce earlier chronology errors.
- Scene protection, shared clocks, retry shortening, asset recovery and reward settlement have substantial regression coverage. Retain those guarantees during the artistic pass.
- All four supplied campaign profiles progress without ads or purchases. Keep the free route and optional monetization agreement.

## 4. Findings requiring closure

### P8-01 Incorrect caller portrait

**P1 · directly observed and source-confirmed.** A broken call labels the speaker “Mom” but shows the bearded stranger. `view/comic.js` creates the static line with `who: 'mom'`; the canonical portrait identity is `anne`, so the renderer falls back to the stranger. This is an identity failure during the central emotional relationship. The subsequently saved still shows the restored call with the correct portrait; it is not photographic evidence of the interrupted state. [Subtitle source](../prototype/js/view/comic.js) · [portrait fallback](../prototype/js/view/comic-raster.js) · [capture notes](media/R1/audit8/README.md).

Use the canonical actor mapping for interrupted calls. Test every displayed speaker ID, including phone/static/system lines, against the current portrait registry. Unknown speakers should produce an intentional neutral treatment, never silently impersonate another character. Verify actual TR/EN rendering, not only string resolution.

### P8-02 Viewed story does not become a usable memory

**P1 · observed, with missing wiring in source.** After L1's ending comic, Memories showed **0/59** and rows of `COMIC PAGE ???`. The collection settlement accepts `pageIds`, but the runtime search found no producer passing them or calling `Meta.collect` for viewed pages. The collection UI also renders text cells without a replay action. [Screenshot](media/R1/audit8/memories-empty-after-first-clear.jpg) · [collection logic](../prototype/js/meta/meta-collect.js) · [collection view](../prototype/js/meta/meta-hub.js).

Record eligible seen pages through the existing settlement/seen-state contract and make them replayable without rewards. Keep first-clear facts and alternate relationship variants truthful. Show an earned thumbnail and a one-sentence current intention before future locks. Merely making the counter say 1/59 would leave the experience unfinished.

A related catalogue defect is independently reproduced in the non-UI runtime: there are **17 weapons but zero mastery badges in the collection catalogue**, because the catalogue reads `M.Mastery` while the actual namespace is `P.Mastery`. Repair this binding as part of the same reward/collection flow. [Probe](telemetry/audit8/collection-probe.json).

### P8-03 Emotional scenes still compete with combat and comics

**P1 · visible in earned and supplied captures; source-confirmed.** The new protected world phase exists, but `.world-aftermath` hides every comic panel except the **entire first illustrated panel**. At L25 that panel occupies much of the top half of the screen. The earned farewell capture also shows “Chest: grab a reward” over the action. L20 retains conspicuous combat-area effects around the fallen Fisherman. Kaan's scene position is calculated relative to Arda rather than consistently continuing from his real approach. [Earned Captain frame](media/R1/experiential/earned-L25-world-caption.png) · [scene strip](media/R1/audit8/major-25.jpg) · [scene flow](../prototype/js/view/scene-flow.js) · [comic styles](../prototype/css/comic.css).

Stage the people first. Suppress optional loot/task prompts and obsolete combat effects during protected aftermaths. Give captions a reserved strip; let the full comic own a later phase. Show an actual recognition, pause and decision to leave. The [implementation brief](AUDIT8-IMPLEMENTATION-BRIEF-2026-11-18.md) specifies the shots and handoffs. A zoom alone cannot repair competing focal points.

### P8-04 Locomotion needs acceptance on the corrected stride

**P1 presentation gate · baseline deficiency partly addressed by a late correction.** In the fully audited build, the rig bends legs and moves hips/chest, but ordinary running retains the arms inside an idle upper-body crop; separately solved arms are used for work targets. Turning between front/back/side changes the underlying drawing abruptly. The later follow-up now uses authored stride frames and preserves the complete painted lower body. Source and its supplied frame detail support that correction; a new continuous player-flow/normal-speed acceptance is still required before judging the latest gait. [Latest rig](../prototype/js/view/actor-rig.js) · [hero binding](../prototype/js/view/art-raster-chars.js) · [follow-up details](CHARACTER-VISUAL-CORRECTIONS-2026-11-18.md).

Accept coordinated foot contact, opposing arm swing, shoulder rotation and turning poses at normal phone scale, including attack transitions. Preserve the new authored strides wherever they meet that standard; clean parts or additional frames are needed only where a real defect remains. Keep movement response immediate. The original eight-direction fixture uses finite invulnerability and therefore pulses opacity; it is unsuitable as the latest anatomy reference. Do not mistake its transparency for a normal-play rendering defect.

### P8-05 Weapon effects do not consistently communicate a physical tool

**P1 · direct L1 observation plus full roster frame review.** Cable's electrocution has a readable, distinctive consequence. Knife, chain, saw and several small projectile tools are much less coherent. Thin held forms disappear; large evolved forms can resemble separate clip-art rotating around Arda. Crowded fixtures hide the hand/contact point almost completely. The supplied rank-3 chainsaw still is an especially clear visibility failure, although its 84-enemy fixture is a stress case rather than an ordinary early encounter.

The Nail Gun upgrade card uses a tier-effect cell that reads like a pink fan rather than the gun. A clean gun icon exists. Arsenal, upgrade cards, Gear and world tools also use visibly different icon/art treatments. [First upgrade](media/R1/audit8/L1-first-upgrade.jpg) · [weapon frames](media/R1/audit8/weapons-low-1.jpg) · [live/card binding](../prototype/js/view/art-raster-items.js).

Use a recognizable tool as the primary identity in every menu; rank/evolution effects are secondary. Finish the hand→tool→target sequence for every roster row, with source silhouette, contact response and recovery. Keep hit geometry truthful and retain the actual attack when presentation must be simplified. The asset appendix gives individual directions.

### P8-06 Bosses need authored identities in space and motion

**P1 · presentation judgment supported by ten fixture sequences and normal Cook play.** Most bosses still occupy a familiar flat street with a large sprite and floor warnings. Several share the Keeper body; Linekeeper uses the normal hardhat body. Source-specific windups help, but a tilted/cropped torso is often doing work that needs a distinctive planted pose, step, reach or haul. Different code patterns do not consistently become different characters to fight.

Give each boss a recognizable arena relationship and a visible intention before its floor warning. Use specific movement: Cook closes into cleaver range; Keeper controls weight lanes; Bride pivots around rope/cart lanes; Captain pulls his own mass; Ticket Man alternates punch distance with signal control. Agile does not mean every heavy enemy skates or dashes. Strong bodies can be slow to prepare and fast to commit. See the ten-boss table in the asset appendix.

### P8-07 Challenge is uneven, not uniformly too easy

**P1 · diagnostic evidence.** In the typical earned-power seed-3 comparison, punish-seeking L2/L3/L4 fights last **5.85/8.52/4.95 seconds**, each showing only one attack family. The same comparison loses at L10 for typical and struggling punish policies. All four campaign profiles lose their first L15 attempt; broad, melee and terrain die to ordinary walkers before the Bride, while ranged reaches the boss. This requires separate encounter and boss investigations. [Boss comparison](telemetry/experiential/boss-punish.jsonl) · [audit summary](telemetry/audit8/audit-summary.json).

Do not raise every boss's HP. Make a typical first encounter demonstrate its signature and a usable answer, with strong rematch builds still allowed to win fast. Inspect L10's closing/punish route and L15's entry crowd/spawn timing with ordinary earned saves. The Cook's “two-policy” comparison is not independent: `runL1` uses its own route and does not consult the generated-level punish policy. Repair the evidence claim before relying on it.

### P8-08 Different mechanisms often produce the same decision

**P1 · all-30 fixture and pacing review.** Hoists, shutters, rods, screens, fuses and points have real consequences. Too often the decision remains “stand in the marked place until it finishes.” Narrow differences in scenery and prop movement cannot carry thirty encounters. The world-contact sheets show the recurring flat lane, small mechanism and work ring. [L6–10](media/R1/audit8/world-6-10.jpg) · [L26–30](media/R1/audit8/world-26-30.jpg).

Make district geometry and pressure change the decision: switchback stairs, dock approaches, bridge sides, market cover and rail crossings. Use a deliberate action once, then let the player exploit its result. Alternate pursuit, positioning, escort, timing, controlled combat and purposeful relief. The all-level appendix supplies a concrete next pass without inventing thirty new systems.

### P8-09 Street improvisation and choices remain under-demonstrated

**P1 for player understanding; evidence gap for campaign acceptance.** The six choice implementations and callbacks exist. Their floor pads and small labels remain weaker than the idea. Work gestures often reach generically toward mechanisms, and many props do not make the tradeoff visible before commitment. In L1, a large optional canister pointer competed with forward progress and said “hit” while the deliberate-use rule is proximity/hold.

None of the four earned campaign traces contains a `routeBeat` whose phase starts `choice_`. This does not prove players ignore choices: the bots do not exercise them. In addition, the audit collector looks for `streetPlace`/`streetImpact` while actual street actions emit `streetWeapon` with a beat. The campaigns therefore cannot certify the central improvisation loop. Capture the real L3 action chain, L22→24 choice and L23→25 reciprocal help in earned play; show both alternatives and the neutral route.

### P8-10 Evolution payoff still arrives too late

**P1 · independently reproduced.** My knife investment paid off after the Cook. Across the four supplied campaigns, 60 evolutions cover seven of the 18 variants; 59 record at least one hit. That is a large improvement over the earlier single evolution, but “one hit before exit” is not an emotionally sufficient payoff. A melee L15 Cleaver has about 3.2 seconds left and no hit; an L30 Cleaver has about 8.6 seconds and one hit. These are diagnostics, not a requirement to evolve every run.

Place the payoff before a meaningful encounter for a committed eligible build. A late post-boss evolution should not be the default reward architecture. Track meaningful engagement after acquisition, target reactions and the next decision it changes. Do not pad an already-finished level with an arbitrary horde merely to satisfy a telemetry threshold.

### P8-11 Progression is clearer but still visually and semantically inconsistent

**P1 for misleading information; P2 for navigation.** Leather Jacket displays “-1 Armor”; Gear displays “Cooldown +5%” and an upgrade to 6%, although the benefit is reduction. Arda's large Gear illustration overlaps summary stats. That chibi rendering also clashes with the comic portraits and world proportions. The run's Heavy Blade label wraps poorly in its compact build area. [Jacket and build row](media/R1/audit8/L1-armor-negative-copy.jpg) · [Gear](media/R1/audit8/gear-overlap-and-art.jpg).

Arsenal places active skill/ultimate choices below seventeen weapon entries. At zero mastery it shows progress toward 300 kills without the next signature benefit. Tasks mixes two daily modes, achievements and Memories; the same collection is separately linked from the map. The first-clear result puts important unlock detail below a large recap. These screens explain more than before but ask the player to assemble the meaning.

Use player-outcome wording, consistent scope chips and a small number of clear destinations. Present the next actionable improvement and its practical effect first. Preserve the formulas and earned prerequisites. Do not merge attributes, perks and mastery merely to simplify the labels.

### P8-12 Dialogue repeats introductions across runs

**P2 · source-confirmed repetition risk, also visible in isolated captures.** `Barks.reset` resets sightings and calls `Dialogue.reset`; the latter clears used/last-line history. A new level can reintroduce familiar walkers or cats and restart line selection. The fixture recordings exaggerate this because they start fresh, but the reset is also part of normal `startPlay`.

Persist acquaintance with enemy roles and recent ambient lines at the appropriate campaign/session scope. Keep urgent combat information repeatable, but do not introduce the same cat as a discovery every level. Let dialogue evolve from shock to competence and, after L20, from monologue to occasional shared observation. Preserve the native scripts and factual callbacks; improve trigger relevance before adding hundreds more jokes.

### P8-13 Visual hierarchy breaks under competing information

**P1 · direct and fixture observations.** A foreground shop sign covered Arda's head/body in L1 despite the new prop occlusion rule. Optional invitations, barks, pickups, weapon effects and threat rings compete for the same area. In the L27 conflict capture, a large first-sighting bubble dominates a critical-health combat view. [Sign occlusion](media/R1/audit8/L1-sign-occlusion.jpg) · [conflict strips](media/R1/audit8/conflicts.jpg).

Apply occlusion rules to every relevant scenery layer, including signs and façades. Protect Arda's feet, immediate threat geometry and boss attack source. Use distinct shape/motion for personal critical health, player frenzy and enemy pressure; global red/amber grading alone is inadequate. Reduce low-priority invitations and dialogue at danger peaks. Keep essentials readable on mute and reduced effects.

### P8-14 Sound and mobile feel are not artistically accepted yet

**Acceptance gate, not a claim that the music sounds bad.** Eight tracks, event cues, ducking, post-master recordings and the farewell/home motif are present. The source and digital capture checks cannot establish weight, emotional timing, loop fatigue or phone-speaker intelligibility. No perceptual listening result is claimed here.

Audition the exact in-game transitions and contact families on headphones and a phone. Give district ambience, warnings and the Captain's silence explicit priorities. Validate sustained iPhone touch/performance, including background/resume and the busiest legal build. These are finite acceptance tasks, not reasons to postpone the confirmed repairs.

### P8-15 Part of the enemy evidence records a frozen game

**P1 acceptance gap · independently confirmed in media, metadata and capture source.** The Screamer capture reaches an upgrade card. The following seven files—Bloater, Kasap, Parkur, Çöpçü, Çaycı, Kurye and Martı—remain in `cards` at exactly **103.083333 simulated seconds** with the same cumulative 25 events. Their canvas videos keep recording the frozen world while the full screenshot shows the card overlay. These files do not verify the named enemy's animation or behavior. This does not prove the implementation of those enemies is absent. [Kurye screenshot](media/R1/experiential/enemy-kurye.png) · [capture loop](../prototype/tools/capture-experience.cjs) · [recorded audit result](telemetry/audit8/audit-summary.json).

Reset each fixture and validate active simulation, intended visible actor, time progression and the relevant action/death events. Validate every recorded state transition; media-file validity is not gameplay validity. The same capture code writes `frameErrors: []` literally, so that field is not evidence that no rendering exception occurred. Use actual error collection where that claim is needed. Correct the coverage matrix and re-record before artistic acceptance.

## 5. The largest creative opportunities

1. **A street that becomes the player's weapon.** Finish the existing lift/use/place grammar, then make a few authored combinations change encounter space: a trolley clears a previously dangerous lane; cover changes an approach; a boss's committed movement opens a flank. Let the result be visible without a popup. Reuse a small, consistent vocabulary instead of adding an interaction minigame to each level.
2. **Different intentions before the run.** A proposed earned starter choice after the first district would let the player choose close-range knife play or a contrasting ranged plan. Currently `Meta.CFG.startWeapon` is fixed to `knife`. This is a new design proposal, not an unimplemented requirement of the previous PRD. It needs balance and progression review before adoption.
3. **Companionship expressed through action.** The strongest potential “wow” is realizing Kaan helped with the danger the player was watching, then seeing the player return that help and the farewell acknowledge it. Keep the existing factual relationship system; improve staging, timing and visibility instead of adding a friendship meter celebration.
4. **A place transformed after victory.** The same rails, ropes, shutters and lights that created danger become a readable onward route. Release the soundscape and composition for a few purposeful seconds. This gives victory an identity beyond coins and a health bar disappearing.
5. **Replay with a hypothesis.** The result should suggest a specific experiment supported by the player's owned tools and observed outcome. Existing Night Shift/daily systems can host curated variations after the core slice works. Extra modes, streak pressure and larger enemy counts cannot substitute for that desire.

## 6. Expansion decision

The [L31–100 plan](CHAPTER1-L31-L100-READINESS-2026-11-17.md) remains useful as a narrative and encounter spine. Its first-30 inheritance gate is still open. Do not replicate the current work-circle template, asset inconsistency and generic scene composition across another seventy levels.

Close the confirmed defects, establish and propagate the combat/scene quality bar, exercise the meaningful choice/build loops, and complete the finite human/device checks. Then review the limited L31–35 pilot with the same earned save through L29–35. A green suite and a long feature list are valuable progress; they are not evidence of Hades-level player experience or a guarantee of retention.
