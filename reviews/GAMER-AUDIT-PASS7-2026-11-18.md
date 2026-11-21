# First-30 audit · pass 7 · 2026-11-18

**Verdict: materially better, still not a masterpiece, and not ready to expand production beyond 30.** The slice has a recognizable identity, functioning progression, stronger interaction rules and a coherent destination. Its remaining problems concern the experience those systems produce: choices can misrepresent player intent, several encounters still share the same visible grammar, boss acting remains uneven, and the chapter finale can end before it develops. One new telemetry defect also invalidates part of the previous build-payoff assessment.

This is a bounded closure review of [H01–H18](HOLISTIC-EXPERIENCE-REDESIGN-2026-11-17.md), not authorization for another layer of systems. Finish the existing interactions, encounters, story and presentation before adding content. “Masterpiece” is an artistic judgment; the useful production gate is a consistently excellent, comprehensible, tested slice that people voluntarily want to replay.

## 1. What this audit actually establishes

- Reviewed the completed implementation packet and its partial/open declarations against the holistic brief, source and current game. The packet itself does **not** claim complete experiential closure.
- Froze the current prototype, art and supporting documents at `/private/tmp/istanbul-pass7-20261118`. HEAD is `4f5361dc0f5306a0243719a8afba9382d4c9e9d3`, with the existing uncommitted implementation included. Fingerprints, rather than HEAD alone, identify the reviewed build. All 1,233 recorded prototype file hashes still matched the workspace at verification.
- Used desktop Chrome at a 390×844 viewport, on an isolated localhost origin and disposable save. Played L1 from its opening through dying to the Cook and reaching results; selected upgrades and a survival card; inspected pause; applied earned Strength; followed its link to Brute Force. Made a short direct-entry L14 attempt. Those tool-paced runs are useful for readability and interaction, **not** reliable measures of human difficulty. Direct-entry L14 had the early save's power, not an earned L14 loadout.
- Independently ran the complete prototype regression: **48 suites passed, zero failures**. Browser-dependent tests required a rerun outside the restrictive socket sandbox; the initial infrastructure failure is retained separately and is not counted as a game failure.
- Independently ran 120 expected-power simulations across all 30 levels, four seeds each, active skills and route rhythm enabled, no revive: **112 clears, seven defeats, one timeout, no crashes**.
- Independently reproduced three earned, focused 30-level campaigns and added an unfocused earned campaign. No currency, rank or weapon grants in those campaigns. Additional boss and interaction diagnostics are explicitly controlled fixtures.
- Reviewed all 30 supplied objective views, the ordered first-30 story export against trigger code, selected comic compositions, the supplied final-boss recording and relevant renderer/animation code. Implementation recordings use staged encounters; their evidence limitations remain in force.
- **Not established:** 30 consecutive manual clears; an uncoached player's comprehension or voluntary return; physical iPhone performance, touch ergonomics or interruptions; critical listening to the complete soundtrack and mix; every frame of every weapon and boss. Desktop video-only recordings and automated tests cannot certify those things.

Evidence and exact commands: [pass-7 evidence index](telemetry/gamer-pass7/README.md). Current live build: [localhost:8765](http://127.0.0.1:8765/). This audit changed review artifacts only.

## 2. Holistic experience: what works, what still threatens enjoyment

The strongest direction is **making a journey through a particular city with objects and people that matter**. The restaurant, tram, market objects, Paşa, Kaan, the Captain and the station give this game more identity than an abstract survivor arena. Keep that focus.

The immediate improvements are real. The pause screen foregrounds the current required task. Upgrade choices describe behavior, show recipe relationships and offer a consequential survival alternative. Applying earned Strength and reaching the related perk is understandable; Brute Force now explicitly says the starting knife is not heavy. Authored objects have deliberate pickup, retained wear, finite carry time and a Dash escape. The first boss's throw has an actual release point. The home/Bazaar story connection is present. Software reliability is stronger.

The risk is that the player's experience remains **walk toward a marker, stop in a ring, clear pressure, collect cards, repeat**, even when the code calls each task something different. The 30 objective images show frequent straight corridors, similar framing, small task objects and dominant yellow rings. There are genuine mechanical exceptions—escort, wind, waves, carries, trams—but their world presentation needs to communicate those differences before the player reads a sentence.

The six local choices are a good answer to that problem only if they produce understandable alternatives. At present, a collision with an enemy can decide a remembered choice automatically; one light branch adds no distinct practical benefit; and several defensive placements are far enough from their named task that their usefulness needs to be demonstrated. More branches would multiply this weakness.

The dramatic curve is also uneven. Vatman can sustain a very long, low-progress orbit, whereas Ticket Man can deliver just one punch and one signal before the earned build finishes the level. Difficulty should create a change of plan or a moment of mastery. A long health bar and a short finale do not deliver that consistently.

The chapter's emotional spine is understandable, but repeated spice jokes, a stale L30 opening line and recurrent family exposition weaken momentum. The Captain's memory is specific and human; that standard should guide edits. The main opportunity is better timing, physical staging and consequences, not more dialogue.

## 3. Findings and required closure

Priority here describes first-30 readiness. P1 blocks sign-off; P2 is concrete polish or design closure to include in this same pass. “Observed” means directly seen or reproduced; “risk” is a design judgment requiring a player-facing demonstration.

### P7-01 · P1 · Live build guidance incorrectly tells the player to wait for another run

**Observed in ordinary L1 play.** On the active upgrade screen and pause screen, the recipe guidance says Work Gloves *was* the missing ingredient and to find it “on your next run.” This remains visible when Work Gloves is one of the current selectable cards. Earlier, it says to raise the knife “Next attempt” during the present attempt.

The contradiction undermines the new information architecture at exactly the moment it should help a player plan. Both locales share the result-oriented wording.

**Cause:** `prototype/js/view/screens.js:346` and `:386` call `UIProgress.recipeAdvice`; `prototype/js/view/ui-progress.js:107` always selects `res.recipe.*`; `prototype/js/strings-progress-ui.js:29` and `:62` contain retrospective text.

**Required:** give live cards/pause present-tense next actions, and results retrospective advice. When the ingredient is on the current offer, make the action immediate and specific. Preserve the three-card decision; do not add another explanation modal. Cover missing weapon, low rank, missing passive, ready-for-chest and already-evolved states in TR and EN.

**Acceptance:** an ordinary current run never tells the player its recipe opportunity belongs to the next run. [Current offer screenshot](media/R1/gamer-pass7/current-offer-next-run.jpg); [pause screenshot](media/R1/gamer-pass7/pause-next-run.jpg).

### P7-02 · P1 · Evolution-use telemetry misses real damage

**Reproduced, not a theoretical concern.** The normal evolution swap followed by five seconds of actual weapon simulation against a controlled target produced:

| Evolution | Actual damage | Recorded hit source | `evolutionUse` hits |
|---|---:|---|---:|
| Netspear | 88 | `speargun` · 4 hits | 0 |
| Twin Saw | 232.4 | `sawblade` · 21 hits | 0 |
| Foamstorm | 88 | `extinguisher` · 11 hits | 0 |
| Cleaver, comparison | 204 | `cleaver` · 6 hits | 6 |

`prototype/js/sim/combat.js:53` looks up `evolutionUse[src]`. Several evolved weapon paths retain their base-family source when calling `Mods.hit` in `weapons3.js` and `weapons4.js`. Netspear's shared-damage effect can use the evolved source while its direct spear hits do not.

**Implication:** zero-hit campaign records are not proof of unused evolutions. The previous hit-based ranged/control conclusions are lower bounds, not trustworthy complete payoff measurements. Do not rebalance weapons to compensate for missing telemetry.

**Required:** preserve both family attribution for mastery/training and actual variant attribution for evolution use. Carry the firing variant on projectiles, areas, echoes and delayed effects; resolving only from the currently owned weapon at impact can misattribute an old projectile after an evolution. Record non-damage control benefit where relevant, including blocked spit and meaningful displacement. Do not change training categories accidentally.

**Acceptance:** every available evolved family registers known real contact/control correctly; base and delayed pre-evolution attacks remain distinguishable. Rerun the same earned profiles after this correction and report acquisition, useful first effect, remaining encounters and zero-benefit causes. [Reproduction](telemetry/gamer-pass7/evolution-attribution.cjs), [results](telemetry/gamer-pass7/evolution-attribution.jsonl).

### P7-03 · P1 · Automatic contact can choose the player's remembered approach

**Reproduced in L12, L17 and L22.** Pick up the authored object, allow its automatic swing to hit one enemy, then carry and place it successfully. The recorded choice remains `offense`. In L17, aftercare is `L17SafeLure` even though cover was subsequently placed.

`street-weapon.js:102` commits on first contact; `local-choices.js:8` refuses subsequent changes; placement still succeeds. This is especially problematic for a one-thumb automatic weapon: the player can be transporting cover while the game silently decides their approach.

**Required:** define and visibly communicate the commitment point. Prefer deriving the resolved choice from the completed useful action at the task; preserve incidental contact as combat history rather than automatically treating it as the exclusive narrative decision. If a choice truly becomes irreversible earlier, its cue and subsequent affordances must make that understandable. Keep first-clear persistence, failure neutrality and replay protections.

**Acceptance:** cover after incidental contact, offense-only, abandoned carry, Dash-drop/regrip, failed rescue, retry and save/relaunch all produce truthful outcomes. No retrospective line describes a mutually exclusive action the visible world contradicts. [Probe](telemetry/gamer-pass7/choice-probe.cjs), [output](telemetry/gamer-pass7/choice-probe.jsonl).

### P7-04 · P1 · Some choices have labels without a sufficiently distinct payoff

**L29 observed:** choosing `lit` and choosing neither pad produce the same illuminated circuit, required steps and initial wave. The `lure` branch changes three of four wave enemies' targets in the seeded probe. The extra `lit` rendering in `sirkeci-fx.js` is conditional on `m.guide`; L29 has `m.lights`, not a guide. The information-versus-control tradeoff from H02 is unfinished.

**L27 source/design gap:** shelter diverts nearby enemies and slows the escort; the light branch adds a glow and normal speed. That is weaker than the intended meaningful information benefit. Demonstrate what a player can perceive earlier because they chose light.

**Placement risk:** five-second cover is often separated from the task. Across 50 seeds, median placement-to-primary-task distance is 7.64 m in L6, 4.98 m in L12, 7.06 m in L17 and 1.91 m in L22. These distances do not prove cover is useless—an approach screen can matter—but the intended protection needs to exist during the actual pressured action. L23's pallet distance likewise does not prove repayment impossible; its first sack can be closer. Do not report that as an unreachable mechanic without a route-specific test.

**Required:** finish the existing six opportunities. Give L29 light an actual readable information advantage and lure an actual positional cost/benefit; keep both viable. Stage cover where it visibly protects the promised approach or task, for a useful duration. Show placement expiry/breakage so the object does not simply stop existing without an understandable state change. Complete L12's local physical aftermath or geographically valid later acknowledgment. Keep three consequences readable with dialogue skipped, as originally requested.

**Acceptance:** matched, populated, ordinary-build demonstrations of both branches of 7/12/17/22/27/29; an observer can explain the tradeoff before commitment and identify the consequence afterward. A record flag, a ring color and a callback sentence alone are insufficient.

### P7-05 · P1 · Boss pacing spans prolonged stagnation and an underdeveloped finale

**Fresh L5 seed 3:** the normal orbit policy timed out at 600 seconds. Boss engagement occupied about 529 seconds, with **110 windups**, no phase transition and only 11 knife hits. The same seed with the existing punish policy cleared the whole level in 114 seconds, with five boss windups. This proves an effective answer exists. It does not prove an uncoached player will recognize or safely reach it.

Separately, the earned ranged campaign repeats the known pre-boss L5 navigation timeout. Keep that route-policy issue separate from the boss orbit issue; a path existing in a graph does not prove touch navigation is obvious, and a bot timeout alone does not prove a player softlock.

**Fresh L30 earned broad and melee:** each records just two windups—one punch, one signal—before the clear. Boss-spawn-to-level-result is only about 17–19 seconds, including any remaining exit time. Melee receives Cleaver 8.5 seconds before the run ends and records one hit. The phase flag changes, but that does not establish a developed final encounter.

**Required:** make the first few Vatman cycles teach the approach physically: a reachable reset position, clear planted recovery, target priority that honors deliberate approach, and a visible response to a successful punish. Inspect why repeated safe orbit produces so little progress. For L30, tune the existing approach, phase sequencing, recovery and earned-power envelope so the finale develops its identity while still rewarding a powerful build. Avoid blanket HP inflation, artificial invulnerability padding or invalidating earned upgrades.

**Acceptance:** weak/typical/strong earned builds and two policies per major boss; full live encounters with incidental pressure, from entry through aftermath. Show both signature actions and a meaningful phase change on typical first-clear builds. Strong builds may win quickly, but the player should see and understand what they overcame. [Orbit/punish evidence](telemetry/gamer-pass7/README.md).

### P7-06 · P1 · Acting quality remains below the promised standard

Camera framing, grading, fixed body scale, foot-level openings and movement settling are useful fixes. They do not by themselves create articulated movement or convincing weight transfer.

**Concrete remaining source evidence:** Ticket Man selects three body images—default, punch anticipation and punch landing—and gives the default image a vertical sine bounce during movement (`prototype/js/view/sirkeci-fx.js:90`). Captain's walking uses the default pose with whole-body lean/compression (`prototype/js/view/eminonu-boss-fx.js:35`). The chain's grip alignment is improved; that repair should be retained. These are still limited locomotion/acting vocabularies for a late-chapter showcase.

**Required:** complete the existing H10/H11 acting pass, using appropriately authored poses or articulated parts. Make planted support, center-of-mass travel, directional intent, tool attachment, contact, overshoot and recovery read together. Do not make every boss as fast as Arda; a heavy antagonist can be compelling through deliberate redirection and commitment. Treat full-body bobbing as secondary motion, not the walk itself.

The remaining weapon pass must include every currently available base/evolved family in action. The live knife upgrade icon foregrounds a pink slash more than the actual knife; the brief explicitly asks for the tool to be recognizable before its trail. Inspect card icon, held tool and damage effect together. Do not solve obscured anatomy by adding larger flashes.

**Acceptance:** all ten complete bosses, both facings and representative oblique approaches; all current weapon families; eight-direction hero/object contact checks; crowded normal-speed and reduced-motion/low-quality footage. Sampled invulnerable clips without adds are useful diagnosis, not final combat acceptance.

### P7-07 · P1 · Level objectives need stronger physical readability and variation

The objective views establish distinct props and several different rules, but the recurring ring/corridor composition dominates. The player too often has to read the HUD to discover what the world interaction means.

**Required:** perform the level-by-level pass below on existing content. For each task, make the usable part, force/direction, work state and resulting route change legible. Place the relevant enemy roles to create a different positioning problem. End a completed action when the world action completes. Remove redundant dwell, repeated wording and empty approach distance where they add neither anticipation nor choice.

Protect quiet beats. A safe view across the water, a person acknowledging help or a brief pause after the Captain is useful pacing. Filling every lull with another pack or popup would flatten the chapter further.

**Acceptance:** five-level blocks played consecutively. Record what the player actually does differently in adjacent levels, where they hesitate, and when they have no meaningful decision. Before approving a block, a player can identify its landmark interaction from the world action with the objective text temporarily hidden during review. Restore ordinary HUD guidance in the shipped game.

### P7-08 · P2 · Story triggers still repeat stale lines and weaken the journey

**Confirmed in ordered script and trigger code:** L21 mid repeats as L22 start; L22 mid repeats as L23 start; L23 mid repeats as L24 start; the spice-sack line returns at L24 mid and L25 start. `story-data.js:181` and `:184` cycle four neighborhood lines across the five-level block.

L30 starts with “That service car is parked across the only way through,” reused from L26, even though L30's authored task is setting the points. This is a concrete continuity error. The later scene correctly explains the Grand Bazaar detour.

**Required:** bind lines to present action and established facts, not modulo stage arithmetic. Make each repeat carry a changed meaning or remove it. Keep the Captain's specific first-day memory; let Kaan's loss breathe before rewards. Review whether the early narrator's statement that the Captain has turned intentionally creates dramatic irony or unnecessarily spends the reveal before Kaan reaches him.

The family calls repeatedly send Arda home for the note and food while the family is elsewhere. Strengthen the practical/emotional reason to take that risky route at the first relevant call, then advance information in later calls. The existing father's marked routes and highway danger provide the material; no new subplot is necessary.

Write TR and EN voice naturally and independently under the existing localization rules. Review skipped dialogue, interrupted barks and missing optional help as actual playback paths. During live L1, a phone portrait and incidental quip competed for the combat field; include that combination in the presentation-priority pass.

**Acceptance:** chronological first-clear playback, including all four major scenes and optional variants. Each line has a job; no stale instruction describes the previous level's object; no unearned memory is asserted. The player can explain Arda's current goal, why Kaan stays and why the Bazaar is next.

### P7-09 · P2 · Progression and return flow need completion, not another progression system

The live Attributes→Perks path is substantially clearer. Strength's separate practice, rank application, prerequisite link and heavy-weapon exception work. Keep this structure. [Observed perk screen](media/R1/gamer-pass7/perk-prerequisite.jpg).

Remaining closure: use the same clarity for mastery, gear and bond; show what is owned, equipped, usable now and persistent. A perk that affects only a subset of weapons needs that subset available at its point of purchase. Keep the difference between **attribute practice/ranks**, **Street Cred/perks**, and **temporary run cards** explicit without requiring an encyclopedia. Surface a relevant next experiment after defeat, not a generic instruction to keep moving. The Cook defeat identified the attacker but its generic tip did little to teach the missed opening.

Review results→rank/perk→equip→next run and relaunch after a break with an unfamiliar player. Check return/back behavior, affordability, what carries over and what resets, and whether the next level remains the obvious primary action. A successful simulation cannot establish that the player understood why they became stronger.

**Acceptance:** unaided completion of those tasks, correct explanation of one current build and one permanent upgrade, and a coherent return to the unfinished story. Do not add currencies, skill pages or daily-pressure systems to create motivation.

### P7-10 · P1 · Audiovisual and mobile acceptance remain unverified

The runtime has eight prepared music tracks, dynamic switching, ducking, contextual cues and a returning motif. The music/SFX suites passed. This audit did not hear a complete live chapter mix, and the supplied videos contain no audio. I cannot certify musical identity, masking, fatigue, contact sync or the emotional quality of transitions from file existence and source code.

Likewise, desktop portrait Chrome does not certify one-thumb play, safe areas, physical speaker balance, interruptions, sustained frame pacing or thermal behavior on iPhone. The implementation packet correctly leaves these open.

**Required:** complete the existing device/listening protocol on available named hardware. Review quiet→pressure→boss→story→reward and retry/resume. Threats and meaningful contact must remain audible over loot and ambience; district signatures and the farewell motif need to be recognizable in context. Use existing arrangements intelligently; do not assume mixed MP3s provide independently mixable stems.

**Acceptance:** device/OS/build identified; sound-on speaker and headphone notes; mute/reduced-motion/large-text/low-quality equivalence; background/lock/relaunch and reward idempotency; sustained dense-scene frame-time evidence. Record concrete defects and corrections. Do not label unheard audio “cinematic,” or a viewport emulation an iPhone playtest.

## 4. All 30 levels: finite encounter closure

The figures below are **expected-power bot clears out of four**, followed by median successful run seconds. They are diagnostic samples, not target human win rates. Visual judgments use the supplied staged objective views; experiential tasks listed here remain to be verified in ordinary consecutive play. No level is marked manually cleared by this audit.

| L | Clears; median s | Required focus for this closure pass |
|---|---|---|
| 1 | 4/4; 121.5 | Preserve the illustrated opening. Finish Cook legibility amid adds; make the first intentional punish readable. Fix live recipe copy. Verify saved/usable food at full health, hurt and healing cap through touch. |
| 2 | 4/4; 139.7 | The tram should visibly create the crossing; show safe standing space before and after it. Shortened geometry alone has not proved better cumulative pacing. |
| 3 | 3/4; 150.6 | Introduce a satisfying object pickup/contact without a spontaneous commitment. Preserve a clear path to the tram task; inspect the early runner loss. |
| 4 | 4/4; 187.5 | Three cable cuts need distinct safe approaches and obvious physical change. Avoid three identical meter fills. |
| 5 | 2/4; 204.0 | Highest immediate combat-priority review: orbit stagnation, readable punish entry, and separate pre-boss navigation case. Preserve the useful family-call turn. |
| 6 | 3/4; 112.8 | Hoist movement must visibly clear the route. Prove that the bench placement protects a useful position rather than a point already left behind; inspect canister death clarity. |
| 7 | 4/4; 160.1 | Show sheltered/direct lane consequences on the actual escort and nearby crowd. The guide should not disappear behind a choice label. |
| 8 | 4/4; 164.6 | Make bell→crowd turn→open side one readable causal sequence with time to exploit it. Retain a payoff window for the build. |
| 9 | 4/4; 194.6 | Long-tail travel still deserves a consecutive-play review. Show the carried weight changing the bridge; deliver L7's acknowledgment safely. |
| 10 | 4/4; 140.3 | Counterweight/tool/body timing, useful recovery and a quiet transition. An animation sample is not proof of the full weak-build fight. |
| 11 | 4/4; 93.0 | Keep a short arrival level. Cargo position, collision and open dock boundary should agree. Avoid padding for an evolution. |
| 12 | 4/4; 97.8 | Fix contact→cover memory; make shelter useful near the mooring; show rope/ferry/collision change as one event and finish local aftermath. |
| 13 | 4/4; 172.1 | The four-seed baseline is improved, but earned ranged still loses. Review simultaneous rail, acid, blast and large-enemy escape space under actual pressure. |
| 14 | 3/4; 114.8 | Bin lure should pull a visible pack to the chosen side while the player exploits the shutter lane. Confirm ordinary pickup versus authored placement cues. |
| 15 | 4/4; 113.5 | Repeated earned-profile losses make this a priority despite baseline clears. Separate cart lanes, rope reach and contact silhouettes; reward the earned win with a clean transition. |
| 16 | 4/4; 87.9 | Preserve the short arrival. Fishing-line warning, safe distance and removable obstruction must agree. The unfocused earned attempt still lost here. |
| 17 | 4/4; 104.0 | Fix recorded approach/aftercare. Cover or distraction must create a visible rescue foothold, with an obvious return anchor and survivor response. |
| 18 | 3/4; 93.2 | Two windbreaks should change pressure and safe movement visibly. Keep gust direction readable on mute and reduced motion. |
| 19 | 4/4; 138.8 | Review the first wave's safe side and simultaneous hazards; each brace should change the next positional problem. Do not equate four clears with complete fairness. |
| 20 | 4/4; 128.2 | Make cast, empty reel and punish a physical exchange. Capture real earned fight→Kaan joining without skipping aftermath. |
| 21 | 3/4; 108.4 | Stage one unmistakable shared task: Kaan's position, sweep, consequence and settle. Replace recycled spice exposition; inspect brute approach pressure. |
| 22 | 4/4; 97.5 | Placement is usefully close in the geometry probe. Finish truthful choice commitment and demonstrate why preserving the cart changes the working position. |
| 23 | 4/4; 137.9 | Demonstrate Dash repayment, prop repayment and missed opportunity from a naturally reached sack task. Avoid fixtures that manufacture Kaan and the cover beside each other. |
| 24 | 3/4; 110.6 | Visible trolley movement must explain the opening. Place the callback outside the dangerous signal interval. Replace repeated pier/spice lines. |
| 25 | 4/4; 104.7 | Preserve the corrected chain grip. Finish Captain locomotion/pull/recovery and the farewell's physical staging; give Kaan time before result UI. |
| 26 | 4/4; 92.5 | Moving railcar and collision should clearly release the crossing. Inspect earned melee loss and preserve the nearby-heavy cap's readable escape space. |
| 27 | 4/4; 101.5 | Light must offer useful information, not just warm color; compare its exposed route against shelter. Distinguish this escort from L7 through visibility and geometry. |
| 28 | 4/4; 161.7 | Fuse→clock→usable interval should be legible in the world. The Dad/clock memory is a good concise emotional beat; retain it in safe timing. |
| 29 | 4/4; 122.8 | Finish the light/lure tradeoff and truthful L30 memory. Both routes currently illuminate the circuit. Fix evolution attribution before judging apparent zero-use builds. |
| 30 | 4/4; 102.7 | Replace stale service-car line. Finish Ticket Man acting and earned-build climax pacing. Deliver a coherent full farewell/call/Bazaar transition and earned reward. |

## 5. Boss acting checklist within the existing designs

These are finishing targets, not ten new boss designs. Review with ordinary incidental enemies and the actual available view. The shared camera must keep both action and escape information readable; zoom/brightness alone is not closure.

| Boss | Finish the distinctive physical exchange |
|---|---|
| Cook · 1 | Planted cleaver anticipation, the existing timed release, body recovery and a visibly reachable close punish. Preserve calibrated size across states. |
| Switchkeeper · 2 | Distinguish hook reach/return from rail command through torso, hands and feet, not only ground warnings. |
| Roaster · 3 | Show aim, release recoil, charge acceleration and the stop as connected actions. |
| Linekeeper · 4 | Give the named encounter enough silhouette/gesture identity beyond the reused hardhat body; read lateral commitment and reset. |
| Vatman · 5 | Make tram/bell/charge sequencing spatially understandable, with a planted, reachable opening and a response to successful punishment. |
| Tower Keeper · 10 | Keep hands, rope/weight trajectory and impact connected; show actual recovery after the counterweight commitment. |
| Dock Bride · 15 | Align hand/rope/contact in both directions, distinguish cart corridor and swung reach, and preserve space to react amid a crowd. |
| Big Fisherman · 20 | Cast extension, empty catch, tension/reel and recovery must be visible, with nets distinct from character bodies and other warnings. |
| Captain · 25 | Preserve hand-aligned chain; add convincing steps and weight transfer through throw, brace, tow and release. Carry the defeat into Kaan's loss. |
| Ticket Man · 30 | Replace default-image bouncing as locomotion; articulate directional punch and signal command, then let the finale develop on earned builds. |

## 6. Build and progression evidence, with corrected limits

| Earned policy | Clears / attempts | Defeats / timeouts | Attempts acquiring an evolution | Attempts with recorded evolved hits |
|---|---:|---:|---:|---:|
| Unfocused | 30 / 33 | 3 / 0 | 6 | 6 |
| Melee intent | 30 / 38 | 8 / 0 | 25 | 25 |
| Ranged intent | 30 / 36 | 5 / 1 | 13 | 7* |
| Terrain intent | 30 / 31 | 1 / 0 | 17 | 9* |

*Hit counts are affected by P7-02 and are incomplete. Acquisition counts remain valid. The focused campaigns reproduce the implementation packet. An initial incorrectly configured family-policy run was discarded from comparative conclusions and is retained under `misconfigured-*` for transparency.

This is evidence that the game supports an earned path through 30 and that a deliberate melee plan can pay off much more often than the earlier audit. It does not establish three equally satisfying play styles. Finish attribution, then judge the actual action differences: priority targeting, reach, crowd displacement, terrain setup, vulnerability while committing and control benefit. For short arrival levels, a useful smaller upgrade can be enough; longer levels and the finale need room to enjoy a pursued transformation.

## 7. Implementation order and readiness gate

1. **Correct the truth shown to the player and the reviewer:** P7-01, P7-02, P7-03 and the stale L30 line. Add focused regressions that reproduce these defects rather than merely assert that flags exist.
2. **Finish the six choices and relationship sequence:** P7-04, L12 aftermath, L21→25 Kaan demonstration and truthful persistence. Show their consequences in populated combat before adding presentation polish around them.
3. **Finish the playable encounters and acting:** P7-05/06/07, all 30 encounter cards and ten boss rows. Prioritize L1, L5, L13–15 and L30. Review weak and strong earned builds; protect the readability budget when improving effects.
4. **Complete story, progression and reward flow:** P7-08/09, four major scenes, chronological voices, current-session advice, understandable upgrade/equip/return paths.
5. **Run complete acceptance on the finished checkpoint:** focused tests, full suite, corrected earned campaigns, first-30 consecutive play, live audio and named-device validation. Record the same source fingerprints for tests and captures. Finish the currently open H01–H18 evidence instead of resetting the brief.

The next handoff should contain a row for every P7 item: exact behavior changed, evidence, remaining limitation and accepted/deferred status. Separate ordinary play, earned bot runs, supplied debug fixtures, source inspection and human feedback. Mark a demonstrated artistic shortfall separately from an untested capability. If a phone or listener is unavailable, complete all independent work and name that specific remaining dependency.

**Expansion decision:** keep the [L31–100 plan](CHAPTER1-L31-L100-READINESS-2026-11-17.md) as the design roadmap. Production remains at 1–30 until the above first-30 closure and player/device evidence support approval. Then implement and verify 31–35 with an earned 29→35 save before multiplying the pattern through 100. This pass adds no new future mechanic or narrative canon.

The goal of the next iteration is demonstrable quality: decisions that belong to the player, distinctive physical encounters, a chapter that builds to its ending, and a clear reason to choose another run. That is the remaining work before calling this slice ready to scale.
