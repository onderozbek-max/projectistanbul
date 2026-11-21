# NO SIGNAL — sixth player-experience audit

Date: 2026-11-17 (Pacific). Scope: Bölüms 1–30, latest fifth-audit fixes **and** the subsequent restaurant, simit and Cook work; continuity of the proposed 31–100 chapter. Audit only. Recommendations below are proposals, not implemented changes to design, balance or canon.

**Current implementation entry point:** [the holistic experience redesign](HOLISTIC-EXPERIENCE-REDESIGN-2026-11-17.md) expands this audit into concrete gameplay, local choices, companion reciprocity, progression/pause architecture and a complete delivery contract. The [consolidated direction](MASTERPIECE-DIRECTION-AND-CLOSURE-2026-11-17.md) retains detailed choreography for all ten named encounters and the 36-area coverage register. This report remains the frozen evidence, not a claim that subsequent implementation repairs are still broken.

## 1. Verdict and expansion decision

**Not yet a masterpiece, and not yet ready to expand production beyond 30.** This is a distinctive, increasingly coherent game with a credible identity. The latest work improves the opening's setting, the Cook's physical consistency, the clarity of defeat, early travel time and the motivation for the next district. Those improvements count; this report does not reopen them as if nothing changed.

The remaining gap is the consistency of the experience. The new Cook is followed by a Tower Keeper who visibly becomes a smaller person in attack poses. A player can progress through the whole campaign with almost no evolved weapon, while a deliberate evolution policy encounters a different survival bottleneck. Some route seeds produce overlapping attrition rather than a clean mistake a player can learn from. The story now explains the journey better, but its presentation still alternates between attractive illustrations, repeated portraits and plain text cards.

**My holistic judgment:** the game has enough mechanics and content for a strong first chapter slice. It needs a finishing pass and human validation more than another system. Its strongest promise is “I learned to use this city, helped someone, and got closer to home.” Build the memorable moments around that promise.

**Could it feel routine? Yes.** The risk is the repeated decision pattern—walk upward, stop in a ring, collect small upgrades, orbit a boss, read a panel—even when each location looks different. Existing authored routes already contain alternatives to that pattern. The next work should make their consequences legible and emotionally satisfying, rather than adding a new minigame to every level. Relief and quiet are valuable; constant pressure is not the same thing as excitement.

“More addictive than Survivor.io,” “Hades-quality” and “players will always return” are not established by this audit. These are ambitions, not measured outcomes. No finite review can prove there is literally no meaningful improvement left. A useful stopping rule is a stable quality bar, no unresolved material defects, and uncoached players who understand the game, enjoy its choices and voluntarily want another session. Section 10 defines that bar without an endless feature wishlist.

## 2. Evidence boundary

This pass used a **frozen copy of the current prototype**, including the latest L1 changes, at `/private/tmp/istanbul-pass6/prototype`. HEAD was `4f5361dc0f5306a0243719a8afba9382d4c9e9d3`; substantial existing uncommitted work was included. The [source manifest](telemetry/gamer-pass6/source-hashes.json) hashes 1,229 files. Checks found no changes to those files in the workspace or snapshot during the audit. The owner's server on 8765 and gameplay files were not modified. An audit-only browser fixture lived in the temporary copy, served separately on 8774.

| Evidence | Result | Limits |
|---|---|---|
| Normal L1–30, seeds 1–4, expected power, rhythm and active skills, no purchased revive | **104/120 wins, 16 losses, no crash/timeout** | 103 wins without a down; L1's automatic recovery still occurred once. Four seeds are diagnostics, not human win rates. |
| Fresh earned campaign, unfocused weapon-preferring policy | **30 clears / 32 attempts; 68.8 simulated minutes; one evolved run, L3** | No purchased gear or focused rerolls. Time excludes menus, reading and card deliberation. |
| Fresh earned campaign, Knife focus plus focused rerolls | **15 clears / 23 attempts, stopped after three L16 losses; 17 attempts evolved** | Every recorded evolution hit enemies. One narrow policy, not evidence that all focused builds fail. |
| Boss sensitivity, 6 bosses × 2 seeds × 4 conditions, two positioning policies | **96 executions: orbit42 wins/5 losses/1 timeout; exposure-seeking43 wins/5 losses** | Three conditions grant extra equipment at boss spawn. They are controlled sensitivity cases, not earned progression. |
| Additional hazard checks | L13 **11/24 wins**; detailed traces of L13/17/19/25/26 | Some seeds duplicate the normal matrix; do not count them as independent samples. |
| Live desktop inspection | Fresh opening, ordinary L1 movement/cards/loss, Cook and Keeper/Captain combat fixtures, map/attributes/tree, L30 comic | Not thirty uninterrupted manual clears. Fixtures are invulnerable and skip the approach; they cannot establish normal boss balance. |
| Current TR/EN comic and bark fit | **2,237 rows, zero flagged overlap/overflow/fit failures** | Minimum fitted text still reaches 12 px; fit is not phone reading comfort or literary quality. |
| Audio inspection | All eight prepared music files present with expected lengths; generated SFX manifest and motif/mix routing inspected | No critical listening or physical-phone audio verdict. |
| Complete regression suite | See final validation update below and [raw log](telemetry/gamer-pass6/full-suite.txt) | **46/48 passed; hints and quality failed on both attempts.** These are fixture integration failures; do not claim all green. |

[Reproduction and raw evidence](telemetry/gamer-pass6/README.md) · [all thirty metrics](telemetry/gamer-pass6/level-metrics.csv) · [screenshots and atlas comparison](media/R1/gamer-pass6/).

The earned-campaign observer settles results through real meta code, spends ready attribute points and buys affordable lower-tier perks. It does not forward the newer `marketCover` story flag, and its loadout records retain `l1Cleared:false`; therefore it is a combat/progression comparison, not a complete frontend or memory test. Direct L1 interaction included long tool gaps and keyboard input; its deaths are **not** used to diagnose L1 difficulty. Desktop timing under the full test workload is not a phone performance benchmark.

## 3. Verification of reported fixes

| Claimed change | What this pass establishes | Status |
|---|---|---|
| Full-health simit appears broken | Nearby “Full health · Simit stays here” observed; saved state loses pickup glow. Current gamer-route regression retains both drops at full HP and consumes one after damage. | **User-facing explanation and behavior fixed in checked paths.** Keep real-phone comprehension check. |
| First boss shrinks | Cook now uses a dedicated eight-pose sheet and shared foot/body scale; live fixture shows consistent body size through the sampled attack states. | **Cook-specific defect addressed.** Other boss assets remain inconsistent. |
| Better restaurant opening | Illustrated tile floor/counter/patron, warm lighting and camera composition are active. | **Implemented.** Text-only memory cards and the handoff still weaken the sequence. |
| Boss exposure at feet | Ground-level cue is implemented; Bonus label visible in live bosses. | **Implemented.** Recognizing and exploiting it without coaching remains unproven. |
| Captain braces/pulls | Renderer now applies lean/flex in the corresponding states; dedicated Captain art is active. | **Improved.** Walking still relies on the idle pose; pose coverage is not finished acting. |
| Bonus timer | Live Keeper/Captain timer says Bonus. | **Closed.** Do not keep treating this as an unexplained hard failure timer. |
| Actual attacker on defeat | Ordinary L1 runner death showed runner portrait and relevant advice. | **Closed for observed case.** Preserve source attribution coverage. |
| Illustrated chest | Current chest renderer uses the illustrated artwork; gamer-route checks pass in the full run. | **Code/test verified this pass.** No new chest-opening live sequence recorded. |
| Shorter L4/L9 | Winning medians now **180.4 / 185.3 s**, versus **215.3 / 223.2 s** in pass 5's same four-seed comparison. | **Material improvement.** Preserve changed geometry. |
| Rank-4 missing evolution item | Offer logic exists; focused campaign evolves repeatedly and records actual hits. | **Mechanism verified; ordinary payoff remains incomplete.** |
| Evolution hit telemetry | Focused records include acquired/first-hit/last-hit times and nonzero hits on all 17 evolved attempts. | **Implemented and useful.** Add decision/outcome interpretation, not another redundant counter. |
| L30 explains Grand Bazaar | Live comic explicitly chooses Grand Bazaar to avoid the highway. | **Closed.** Better staging is a separate polish issue. |
| Missing comic/Sirkeci artwork recovery | Current scene-art/Sirkeci test coverage checks the recovery paths; see final suite status. | **Automated verification**, not a fresh browser network-block experiment. |
| Recurring melody | Three-note motif is wired into Captain farewell, L30 departure and home, with a farewell variation. | **Implemented.** Musical effectiveness still needs listening. |
| Expansion recipe/support boundary | Recipe assistance no longer depends on `routeTrial`; hard support end at 30 removed. | **Partial closure.** Kaan's runtime step still requires an authored `routeTrial`, absent from legacy L31–100. |
| Later TR/EN factual divergence | H13 safe-zone radio, C50/70/90 and FINa3 now share the relevant facts; planning references were updated. | **Do not reissue the old contradiction list as current bugs.** Update the stale opening tables in the readiness report. |

## 4. Whole journey: what keeps the player moving, and what gets in the way

**First minute.** The restaurant now looks like a place with an identity, not an empty tutorial room. Protect the recognizable floor, counter, threshold and local atmosphere. The roughly 27.4-second opening is already deliberately shortened; do not restore the retired long interactive sequence. Its weakest part is the seven-second, three-card memory/rules section: `coldopen.js` creates text-only divs. An illustrated dramatic scene suddenly becomes a set of cream text boxes. Use the existing three beats as visual memories, with a held expression, a meaningful object and a clear return to the room. Keep the total length at or below the present budget.

Immediately afterward, a neighborhood postcard adds trivia, power percentages and a **NEXT Level2** row before the player has played L1. `ui-progress.js:53` calls `nextAfter(li.index,true)` on the arrival card. That is a genuine information-architecture mismatch. Show the place and immediate objective here; reserve next-level planning for results. Let the tension of the restaurant flow into the first movement.

**Learning combat.** Upgrades pause the action and the early Knife recipe is understandable. But three ability buttons, two progression meters, route instructions, phone dialogue and collectible hints arrive very close together. The Shield button visually says only “Ready,” and the ultimate is an eye icon. Their accessibility labels are clearer than their visible onboarding. Briefly name and demonstrate each action when it first becomes useful; do not add another permanent tutorial panel. Keep the current speech-priority protections and inspect whether large nonessential bubbles still cover the place the player must read.

**Middle districts.** The route verbs are substantially more differentiated than a generic survival timer. Yet “stand here while a ring fills” remains the shared input. It is successful when the player sees a boat move, a crowd redirect or a rescue become safe; it is routine when only the ring changes. Emphasize the existing world consequence and vary the danger around it. The revised L4/L9 lengths help. Do not flatten all levels to the same duration.

**Builds and permanent growth.** “Develop Arda” is a clear entry point. Attributes explain their training actions; prerequisites link back to the relevant attribute. Keep that work. The remaining friction is relating a rule to my current build: “Heavy weapons” in Brute Force does not name affected equipment in that panel. Show affected equipped weapons there, using the existing tag data. Do not add another taxonomy page. Keep training, Street Cred and in-run upgrades clearly separated. At full health, saved food is now a resource I can plan around; it should not look like a failed button.

**Boss/reward/next.** A boss should test the district rule, expose a useful opening, then leave a changed place or human response. Captain/Kaan and the station transition are moving toward that standard. The weak link remains body motion and the variability in how much of the fight an ordinary build experiences. A bonus timer or more HP will not solve that. Let stronger replays be fast; ensure first encounters communicate their defining exchange.

**Returning tomorrow.** The plausible reasons are a build experiment, an understood challenge and concern for Arda/Kaan. More currencies, chores or randomized modifiers are not needed to establish those reasons. A satisfying stopping point is compatible with wanting another session. Retention remains an unmeasured product question, not something to infer from a bot clearing 100 nodes.

## 5. All thirty levels

Winning medians below use the ordinary mathematical median of **winning** runs, seeds1–4. The bot's printed summary can use a different population/order statistic; use the CSV for comparisons. These are policy diagnostics, not recommended human clear-rate targets. The design notes combine source inspection and selected live views; they are not a claim of manual playthrough of every row.

| L | Encounter | Wins / median seconds | Audit decision and specific acceptance |
|---|---|---|---|
| 1 | Restaurant, exit, Cook | 4/4 · 138.8 | Keep new setting and Cook. Fix arrival-card “next” context; illustrate existing memory beats; teach active buttons progressively. New player can distinguish saved simit from broken pickup. |
| 2 | Tram stop | 3/4 · 178.8 | Preserve city's first useful rule. One winning tail reaches318.5s: inspect interaction/travel/detour trace before shortening geometry. Player can explain why the stop matters. |
| 3 | Crossing/cart | 4/4 · 180.6 | Good opportunity for intentional environmental mastery. Touch check must distinguish walking beside a cart, committing to lift and canceling. Avoid accidental carry blocking escape. |
| 4 | Live wires | 4/4 · 180.4 | Travel fix accepted. Each cut should alter the visible route/threat; no further blanket shortening. Verify second/third cuts create different approaches rather than repeat a wait. |
| 5 | Depot/Vatman | 2/4 · 259.6 | Large tail: winning 377.7s. Separate approach HP and boss range policy. First recovery must be visible at body/ground level; a learned retry should be appreciably better. |
| 6 | Galata hoist | 3/4 · 122.7 | Good pace reset. Counterweight/clearance should visibly resolve the obstruction. Inspect new loss before proposing balance changes. |
| 7 | Musician escort | 4/4 · 152.9 | Keep human stakes. Escort should respond visibly to shelter/progress, then acknowledge safety. Confirm player watches the person, not just their meter. |
| 8 | Bell | 4/4 · 161.7 | Make the redirected crowd the payoff. Focused evolution sample arrives with only16.4s of run left; measure useful combat window before moving XP. |
| 9 | Footbridge | 4/4 · 185.3 | Travel fix accepted. Preserve reveal and dangerous crossing. Do not add filler waves to replace removed empty travel. |
| 10 | Courtyard/Keeper | 4/4 · 148.9 | **Confirmed body-scale discontinuity.** Fix shared-scale poses; ground cue and counterweight must remain visible under HUD. Boss survival diagnostics must include entry HP. |
| 11 | Cargo hook | 4/4 · 84.4 | Concise arrival is welcome. Protect the first readable hook consequence; don't lengthen solely to fit an evolution. |
| 12 | Ferry mooring | 4/4 · 143.8 | Rope tension, boat motion and walkable boundary must agree. Check movement still matters during work and no extra finish delay follows visible clearance. |
| 13 | Tram points | 2/4 · 169.4; extended11/24 | **Priority hazard review.** Losses span early/mid/late route, not just the terminal. Trace safe-lane connectivity, blast chains and toxic occupancy; keep one readable escape at lesson moments. |
| 14 | Fish shutters | 3/4 · 113.2 | Alternating lures are useful. Focused campaign loses twice here before clearing: test crowd-control sacrifice, not just raw DPS. A shutter's lure and resulting safe side should be obvious. |
| 15 | Dock ramp/Bride | 4/4 · 118.1 | Natural exposure-seeking fight14.9–31.1s; prior9.8s result is not current. Supplemental cases10.8–33.7s. Review first-clear signature exchange and action-specific body art. |
| 16 | Bridge rods | 4/4 · 90.3 | Expected-power success masks focused earned-save losses: three failures block that campaign. Compare earned defense/crowd coverage before changing difficulty. |
| 17 | Bridge rescue | 4/4 · 164.7 | Max258.6s is a diagnostic tail. Trace has rescue haul81.7% while bot sits outside the ring at closed gate. Current player status distinguishes return/haul; fix or explain bot priorities before calling this human boredom. Keep visible rescue/thanks. |
| 18 | Bridge screens | 4/4 · 93.0 | Useful short cover lesson. Verify screen closure changes the safe route clearly at low graphics and under thumb occlusion. |
| 19 | Bridge wave | 2/4 · 130.7 | Current seed3 dies to acid before brace; seed4 dies to bridgeWave after mixed attrition. Prior claim “both before wave” is obsolete. Test approach and brace separately, including mute. |
| 20 | Lift/Fisherman/Kaan | 4/4 · 116.1 | Emotional hinge. Natural targeted boss16.3–23.2s; supplemented seed2 can finish7.3s/one windup. Preserve learned fast wins but ensure first-clear cast/reel identity is communicated. Joining must feel like the reward. |
| 21 | Market awning | 3/4 · 81.4 | Kaan should visibly help once in a readable situation, without a wall of explanation. Check the arrival threat doesn't hide his contribution. |
| 22 | Market cart | 4/4 · 97.1 | Carrying should change routing/position, not merely impose a speed penalty. Phone cancel/commit test is more valuable than more cart variants. |
| 23 | Sacks/cover Kaan | 4/4 · 133.7 | Strongest existing memorable-action candidate. Uncoached player notices, chooses to help, sees immediate relief and later recognizes the L25 callback. Missing optional aid must remain coherent. |
| 24 | Market signal | 4/4 · 101.9 | A familiar signal needs a distinct consequence: trolley timing and newly clear path. Avoid another generic completion flash. |
| 25 | Captain | 2/4 · 131.5 | Targeted policy wins both natural cases,40.5/30.5s. This favors teaching exposure over a blanket HP nerf. Finish locomotion/recovery and protect the farewell's quiet. |
| 26 | Station departure | 2/4 · 92.6 | Two current losses are brute/bloater before completion. Review arrival space and first lesson overlap. Train departure should visibly result from the player's action. |
| 27 | Station guide | 3/4 · 123.2 | Distinguish this escort through light/shelter/route knowledge. Confirm follower and destination remain readable through station clutter. |
| 28 | Station clock | 4/4 · 130.8 | Clock feedback is implemented. Verify change reads without watching tiny hands; don't add another explanation if the moving mechanism works. |
| 29 | Station lights | 3/4 · 99.1 | Each light should change navigability or threat recognition. Test minimum quality/brightness and source of the single failed seed. |
| 30 | Points/Ticket Man | 4/4 · 121.4 | Natural targeted boss20.1–33.1s. Protect distinct track/punch mechanics; check body-floor contrast and movement finish. Bazaar motivation is now clear. End with earned relief and a concrete next place. |

No isolated four-seed loss justifies a global nerf. L13's larger sample and repeated cross-pass pressure signal justify a deeper encounter investigation now. L5/L17 long tails need decision tracing, not automatic shortening.

## 6. Implementation work, ordered by impact

### A6-01 · P1 · Finish boss body continuity across the slice

**Observed:** the Keeper's standing frame is256px high, windup186, contact152 and hurt177, drawn with one entity scale in `view/art-raster-chars.js:141`. Different pose heights alone are legitimate; here the head/torso also visibly become smaller, confirmed in live combat and the [same-scale atlas comparison](media/R1/gamer-pass6/boss-atlas-review.jpg). The Cook's old atlas had the same class of defect, but the new Cook bypasses it. The fix must cover the active cast, not only the first complaint.

**Work:** lock an anatomical reference scale and foot/grip anchors for each active boss; review idle→walk→anticipation→contact→recovery→hurt→defeat as a strip at actual phone size. Correct the Keeper first. Review Vatman, Bride and Fisherman assets without blindly stretching every crouch to idle height. The contact sheet includes `boss_bigbro` as an additional inventory check, not a claim that every first-30 boss uses it. Keep dedicated Cook/Captain/Ticket Man overrides. Add only transition poses/deformation needed to convey weight. Captain needs an actual locomotion solution, not a sliding idle illustration.

**Acceptance:** one normal-speed and one slowed comparison per active boss, both facings; head/body mass stays coherent, feet stay planted where intended, tool contact/trail/SFX matches damage commitment, and recovery reads without HUD text. Check death separately. Review Knife, one ranged weapon and one heavy weapon against the same contact standard before expanding it across the arsenal. More particles do not count as closing this issue.

### A6-02 · P1 · Prove that build planning produces a fun, survivable payoff

**Observed:** unfocused campaign clears all 30 with one evolution; deliberate Knife policy evolves in 17/23 attempts but stalls at L16. This is a meaningful improvement over “the assistance exists only in a test”: every recorded evolution actually hits. It is also evidence that “increase evolution frequency” alone is not the whole answer. Focus can sacrifice area coverage/defense. L8's focused payoff has 16.4s left; several others have substantial useful time.

**Work:** compare earned melee, ranged and defensive plans plus an unfocused policy. Record offer→choice→partner→rank5→evolution→first hit→last meaningful encounter; include deaths, rejected defensive offers and unmet recipe steps. In the card UI, show the current plan and next missing step compactly, and explain the practical branch identity. Preserve the freedom to choose a broad build. Show equipped weapon names affected by Heavy/melee perks using existing tags. Do not force an evolution every run or grant max gear to demonstrate success.

**Acceptance:** an uncoached player can state what they are building and how to finish it; several distinct earned plans reach a satisfying combat payoff in early, middle and late districts; a focused loss supplies a useful survival adjustment. Compare first-clear saves and replay saves separately. A damage event alone is not proof of a memorable transformation; observe whether the player notices and uses the new behavior.

### A6-03 · P1 · Separate fair encounter pressure from opaque attrition

**Observed:** L13 clears 11/24; seven final blows are bloaters, three toxic, two acid and one walker. Final blow is not total cause: seed2's acid last hit follows substantial contact damage. L19 now includes an actual wave death. L26 has two early brute/bloater losses. L10 targeted seed2 enters the arena at only 5.7% HP, so its eight-second death cannot diagnose the boss in isolation.

**Work:** record threat overlap and usable escape space at failure: warning start, reachable safe lane, crowd body blocking, persistent zone lifetime, compulsory interaction state, HP on entry and healing opportunity. Review L13 seeds2/3/5/22 plus a clean success; L19 seeds3/4; L26 seeds2/4. Adjust spawn composition, timing, lane clearance or warning hierarchy where a required lesson competes with unavoidable pressure. Keep skillful danger and meaningful mistakes. Test route and arena separately, then together.

**Acceptance:** no required lesson is obscured by simultaneous unintroduced threats; each tested failure can be explained from visible information; an informed retry can improve without needing a lucky heal. Use a larger seed batch after changes and uncoached phone observations. Do not tune to an arbitrary bot win percentage.

### A6-04 · P1 · Make boss mastery legible and robust to stronger builds

**Observed:** current exposure-seeking natural fights range14.9–54.5s among winning samples. There are still short supplemented first-fight sensitivity cases (L20 seed2,7.3s/one windup), while ordinary L5 has a377.7s total-run tail. The same frozen build reproduces **L5 seed2 natural: orbit293.2s/58 windups → exposure-seeking54.5s/11**. The supplemented Cleaver case times out after 544.2s of boss time/110 windups with zero close-range time; exposure-seeking clears it in 40.2s/8 windups. Subsequent cards differ between policies (the successful Cleaver run also obtains Nailgun), so this is a behavioral comparison, not a fixed-loadout DPS experiment. See both raw matrices in evidence. Do not carry forward pass5's exact durations as current facts.

**Work:** use the existing range/exposed-damage/phase telemetry to identify whether long fights are failed learning, targeting/range, approach geometry, or insufficient damage. Demonstrate the first opening through a committed body motion and a reachable safe approach. For short fights, make the signature exchange readable during entry/first commitment and preserve fast earned rematches. Avoid artificial invulnerability, global HP inflation or compulsory waiting. Boss phase changes should change the player's spatial decision, not merely a bar color.

**Acceptance:** a novice can describe the tell after one loss; exploiting it improves their retry; first-clear weak/strong saves both see the fight's identity; mastery saves can defeat it quickly. Reward with the existing environmental aftermath and human response before menus. The player should know why the next boss is a different challenge.

### A6-05 · P2, required for presentation bar · Finish the opening and reduce competing information

**Work:** illustrate the existing memory beats rather than add exposition; retain the current short opening and skip behavior. Replace the arrival card's NEXT2 row with current-place/current-objective context. Introduce visible Shield/ultimate names at first useful opportunity. Keep one actionable instruction dominant; defer nonessential jokes/trivia during threats and emotional scenes. Preserve safe-area space for boss feet/lanes while a real thumb covers controls. Small card artwork should show the weapon silhouette before its pink trail/effect; review Knife/Nailgun/Torch at delivered card size.

**Acceptance:** fresh players move intentionally, understand autoattack and saved simit, and use at least one active ability without coaching; they do not interpret the arrival card as a skipped level. Both languages, large text, Reduce Motion and low graphics retain readable threats. Do not solve this by shrinking all text or hiding necessary status.

### A6-06 · P2 · Make the existing emotional highlights feel authored

**Observed:** L30 has attractive station/tunnel art and now coherent motivation, but adjacent panels reuse Arda's same portrait/expression. Opening memory panels contain no illustration. The Captain farewell has more specific acting and should be the reference.

**Work:** finish four existing moments: restaurant interruption, Kaan's joining, Captain farewell, station departure. Use a change of gaze/posture, a meaningful prop, a held silence and one environmental consequence. Match the home motif's arrangement to each moment. Keep jokes out of the immediate grief beat. Give L17's rescued person and L23's reciprocity a visible response within their current scenes. Avoid extending dialogue or adding a new narrative branch system merely to make it seem richer.

**Acceptance:** players can recall a person/action, not just a location; each scene changes what Arda/Kaan feels or intends; retry/skip preserves essential facts; no ordinary retired-art fallback appears after a replaced illustration. Text fit is already clean—this is direction and acting, not another rewrite of every line.

### A6-07 · P1 · Close validation before claiming completion

The frozen full suite found `test-hints.js` failing twice because its VM loads `consumables.js` without `P.Combat`, while `healState` now calls `P.Combat.dropHealRoom`. Update the isolated test dependency/stub contract and keep assertions for saved/ready/spent food. Do not suppress the test or weaken real healing behavior to satisfy it. This is distinct from a browser crash: ordinary game script loading supplies Combat.

For L17's tail, the player status has haul/return states and `RouteMilestones.target` still returns the rescue point. The trace shows the bot repeatedly leaving it; drop/heal/repulsion priorities need investigation. Do not report a proven broken human objective. Add the chosen target/reason to diagnostic output, verify the rescue can complete with direct valid input, then repair the policy if appropriate.

The second failure is `test-quality.js`: its fake DOM lacks `document.createTextNode`, reached through the new opening-art wait toast. An audit-only diagnostic supplying that method reveals the fixture still never reaches play because its fake images do not complete the art gate; its subsequent30fps/menu-state failures are not a measured gameplay performance defect. Update fake DOM and deterministic art readiness, while preserving separate coverage for blocked/retried artwork.

Run the complete 48-suite regression on a stable build and archive its logs. Then perform the bounded physical-phone evaluation in section10. These are closure tasks, not optional evidence to substitute with more screenshot fixtures.

## 7. Component-level finish ledger

| Component | Current assessment | Next check/action |
|---|---|---|
| Scenery/props | Current illustrated restaurant and district art establish place; technical art tests cover loading/atlas integrity. | Actual gameplay-sized review of required mechanisms; don't mix retired procedural stand-ins into replaced ordinary scenery. This pass did not manually inspect every image file. |
| Hero/enemy motion | Cook improvement is real; shared pose switching elsewhere still produces uneven physicality. | Contact/foot/turn audit, then actual-phone motion review. Priority on visible actions over more atlas counts. |
| Weapon effects | Functional breadth is substantial; card art can be dominated by trails, and more effects can hide threat shape. | Compare silhouette, held tool, contact and resulting behavior for each family at low/high quality. Keep enemy tells above cosmetic density. |
| Consumables | Full-HP simit retention now communicates intent; cap-spent state is a separate rule. | Test saved→hurt→pickup, capped→arena-exempt heal, and touch proximity; message must remain secondary to danger. |
| Music | Eight prepared MP3s, calm/intense response, outcome ordering and recurring motif exist. | Listen on phone speaker/headphones through quiet→pressure→boss→farewell→reward. One shared boss track across the slice risks sameness; first try existing motif/ambience arrangement before commissioning six tracks. No acoustic quality verdict claimed here. |
| SFX |44 generated cue entries plus synthesized recipes, voice limits, ducking and limiter; motif is synthesized. | Check threat-versus-impact hierarchy, dense-hit fatigue, anchor/cleaver contact sync, mute equivalence and interruption recovery. File presence is not mix quality. |
| Dialogue | Shared facts have improved; fit audit clean. Calls and ambient jokes can still compete with combat attention. | Preserve native TR/EN writing. Review factual ledger, speaker voice and emotional timing independently; do not translate all lines or add more chatter. |
| Comics/cutscenes | In-engine cold open and staged comic sequences already exist. This is not a missing-system problem. | More specific acting/visual consequence in the four highlights; don't call static portraits “finished cinematic animation.” |
| Menus/progression | Develop Arda, training actions, current bonuses and prerequisite links work clearly. | Show affected equipment in perk detail; test unaided attribute→perk→run loop. Arrival “next” context is misplaced. Reduce background bleed if it impairs reading on phone. |
| Rewards/retry | Actual killer and practice/mastery feedback make defeat more constructive. | Verify one clear retry hypothesis, fast restart, no repeated full exposition, and a meaningful district aftermath before currency totals. |
| Accessibility | Existing bilingual fit, reduced-motion and priority systems are valuable. | Physical thumb occlusion, text comfort, mute, color-independent tells, pause/background/resume and input cancellation. Desktop canvas correctness does not establish these. |
| Performance/save | Simulation and tests provide technical confidence; frozen snapshot prevents moving-target claims. | Physical iPhone sustained run, frame-time tails, heat, audio resume, incoming interruption, save/relaunch and completion rewards exactly once. No phone performance certification in this report. |

## 8. The best “wow” work now

These are **ways to finish existing moments**, not five new systems to build before the next audit.

1. **The city is my weapon.** A deliberate tram/cart/mooring action visibly changes the crowd and opens the route. Give the existing cause→motion→impact→aftermath one coherent visual/sound beat. The memorable part is “I caused that,” not screen shake.
2. **My build just became a different way to play.** Preserve movement through an evolution reveal; let its first meaningful attack clearly demonstrate reach, control or terrain interaction. The next encounter should offer an opportunity to use it, not immediately end the run.
3. **Kaan remembers what I did.** Complete L23's cover action and L25's existing acknowledgment as one recognizable chain. A prop/gesture can connect them without a new branch menu.
4. **The city briefly goes quiet.** After the Captain, hold the emotional image and motif long enough to register before the reward interface. At the station, reveal the usable passage and the next destination. Contrast makes spectacle memorable.
5. **I beat the boss because I learned it.** A clearly committed attack, a satisfying punish and a visible change to the place deliver more lasting pride than an arbitrary larger loot burst.

Optional challenge remixes can strengthen replay later. They should reuse learned rules with deliberate constraints and a visible reward, not replace unfinished normal-play clarity or add daily obligations.

## 9. L31–100: continuity review and constraints

The [existing seventy-level spine](CHAPTER1-L31-L100-READINESS-2026-11-17.md) remains the starting brief. Its opening “current conflicts” tables are stale in several places after implementation; update them to distinguish closed facts from remaining work. The newer handoff/reward paragraphs in that document are useful and should be retained.

**Current runtime boundary:** all 70 levels beyond 30 still lack authored route milestone objects. That is unfinished content, not a defect in the implemented slice. Recipe assistance is now independent of that boundary. Kaan's hard level30 cutoff was removed, but `kaan-support.js:80` still requires `routeTrial`, so the legacy31 runtime is not proof of continuity. Do not simply raise the preview limit to100.

| Block | Narrative/experience contract |
|---|---|
| 31–40, Bazaar/Beyazıt | Deliver the promised alternative to the highway. Re-establish Kaan through useful action. Teach navigation/noise/shutter decisions, then change the spatial question for each boss. |
| 41–50, Kumkapı/Palace | Explain the detour with a practical route benefit. Loads/nets/barriers vary movement; C50 makes the key/Ahmet/home concrete. Keep Fish Porter at45 and the Docent at50. |
| 51–60, Balat/Yenikapı | Build toward the canonical L54 rest and reciprocal vulnerability, then a contrasting precise fight and an exhausting passage that actually resolves. Do not turn the rest into another mandatory hold defense. |
| 61–70, Samatya/Yedikule | Radio offers hope; later facts can challenge it. C70 reinforces food, note, home-first plan. Renew curiosity through information and action, not repeated vague warnings. |
| 71–90, approach to home | Familiar places become personal; show progress through space, changing light and conversation. Preserve Hose Man75/Dye Foreman80 and the balcony-light promise. |
| 91–100, Ataköy | Pay off the walk, Ahmet, the apartment, Dad's warning and Mila's arrival in the intended order. Do not move Chapter2/3 letters or factions forward merely to manufacture a cliffhanger. |

Keep a shared-facts ledger per call/scene: what each character knows, what the player knows, why the next detour is useful, what changed, and time of day. Both languages brief from it independently. The repaired H13/C50/C70/C90/FINa3 lines should remain repaired.

For every five-level production block: one rule introduced clearly, one application altered, one reciprocal or relief beat where appropriate, one mastery encounter, one resolved local consequence. This is a quality checklist, **not** a requirement to repeat an identical five-level rhythm twenty times. The proposed L60 horde and L54 rest are useful breaks in that structure.

Before approving31–35, run the same earned save through29→35: retained build help, Kaan support, rememberedL23 flag, exact reward settlement, current art on cold load, readable loss advice, and a different required decision in every new level. Test combat-focused, helper/hacker and mixed progression at35/50/54/60/70/90/100 as those blocks exist. The expansion cannot rely on a new weapon every district: all 17 base families are already unlocked by21. Payoffs must include new applications, mastery and relationships. Keep usable bond rewards honest; no visible empty75/100 promises.

## 10. Finite acceptance gate and next iteration

**Implementation order:** A6-07 test closure → A6-01 body continuity → A6-03 encounter-pressure diagnostics and A6-04 mastery → A6-02 earned build payoff → A6-05/06 opening, clarity and emotional finish. Reuse the evidence cases rather than change every subsystem at once. Preserve the fixes already closed above.

Use the existing [phone playtest script](PLAYTEST-SCRIPT-R1.md), with these specific unanswered questions. A practical first round is5–8 uncoached players on physical iPhones, mixing survivor-like familiarity; this is a formative study, not a statistically reliable retention estimate. Use fresh saves for the opening, then earned checkpoint saves for middle/late slice comparisons. Observe rather than explain.

- Can they move, recognize autoattack, understand saved food, use an active ability and locate upgrades without assistance?
- Can they state their current build plan, its next step and the difference between training/Street Cred/run upgrades?
- After losing to a boss or hazard, can they identify a visible mistake and make a useful retry adjustment?
- Can they recall two different district decisions and a character moment, rather than only “more zombies”?
- Where do they disengage, skip, stop choosing thoughtfully or ask whether anything new happens? Record exact level/beat and reason.
- Do they choose another run when freely offered a stopping point? Invite a later voluntary session and ask why they returned or did not. Do not coerce another run or treat a tiny sample as a retention benchmark.
- Does a sustained phone session remain responsive/readable with the real thumb, low graphics, Reduce Motion, muted audio, background/resume and save/relaunch?

**Ready to expand** means: full regression green; confirmed body-scale defects gone; targeted pressure/mastery/build cases explained and resolved; first-session misunderstandings removed; no material device failure; and uncoached players demonstrate understanding, enjoyment and a credible desire to continue. The phone evidence may reveal one more focused correction. It should not automatically trigger another sprawling feature list.

**Masterpiece** remains an audience judgment earned over time. I can eventually recommend “this slice meets the agreed quality bar; build the next block.” I will not relabel unresolved defects or absent player evidence as excellence just because many implementation rounds have been completed.

## 11. Final validation update

**Completed: 46 passed, 2 failed, exit1.** `hints` and `quality` both failed their automatic rerun. Full raw logs are archived under `telemetry/gamer-pass6/suite-logs/`; see `hints-failure.txt`, `quality-failure.txt` and the two explicitly labeled quality diagnostics. All art, dialogue, music, route, progress UI, sim, meta, tree and weapon suites otherwise passed. No gameplay code was changed to make a test pass.

The ordinary120-run matrix has no crash/timeout. The separate supplemented boss sensitivity matrix has **one orbit-policy timeout**, reported above; do not collapse those two statements. All1,229 checkpointed prototype files remained unchanged in both workspace and snapshot. Physical iPhone validation, critical audio listening and voluntary-return evidence remain open.
