# Audit13 — independent acceptance of the Audit12 implementation

21 November 2026. Scope: first30, Audit12 production PRD and inherited unresolved experience requirements. Audit only; no runtime edits, new design commission, Git mutation or expansion approval.

## Verdict

**Not fully implemented to the requested player-experience standard. Not a masterpiece sign-off.** There are verifiable changes to combat budgets, earned starter choice, tactical rematches, scene scheduling, street consequences and progression. However, ordinary play still exposes failures in the very areas the brief prioritized: the first boss lesson competes with unrelated teaching and a large pursuing crowd; weapon silhouettes can still look detached or multiplied; important companion actions are visually subordinate to rings/effects; device dialogue has two visible layout defects; and the all30 spatial/pacing pass has not established a consistently distinct experience.

This is not a claim that nothing changed. It is also not acceptance of the implementation report's sentence that actual crowd movement gives the Cook exchange room: my ordinary earned L1 encounter contradicts that as a reliable outcome. Several features are technically present without meeting their presentation contract. The appropriate next work is completing those contracts, not another expansion of the feature list.

## Evidence and boundaries

- Audited final14 runtime: `ceda328957e8353ebd051a2be8ef5cdae16034000b436b8bc375d81fea4cdff4`. Independently compared all1185 manifest files against both frozen candidate and working runtime: zero mismatches. [Independent source check](media/R1/audit13/source-check.json).
- Independently ran `node prototype/tools/test-audit12.js`: pass. Covers real fragment contact, survivor continuity, starter migration/choice boundaries, all30 initialization and cart/counter material behavior. [Log](media/R1/audit13/focused-tests.log). This is not a rerun of the entire suite. The implementation supplies57 passing groups/zero reruns in its [verification packet](AUDIT12-VERIFICATION-2026-11-20.md).
- Independently ran the earned first30 broad/punish campaign against frozen14: **31 attempts,30 wins,1 loss**, at L16 to Çöpçü. No paid revive or supplied build. **26 runs with useful evolutions:25 Cleaver,1 Nailstorm.** [Whole records](media/R1/audit13/earned-campaign.jsonl), [summary](media/R1/audit13/campaign-summary.json). This policy is comparable to Audit12's independent broad run, but changed outcomes/offers produce different builds. It is not a controlled identical-build damage experiment or human retention study.
- Direct browser play on an isolated fresh origin8846: earned L1, selected real cards/mods, evolved Cleaver, fought and defeated Cook, received chest, entered sanctuary, reached results, followed the growth CTA and applied Strength. No debug grants. Input was intermittent desktop keyboard/tool control, including pauses for inspection; it cannot establish human reaction difficulty or continuous animation quality. Opening and end comic were skipped during this pass; no claim to have reread every panel.
- Inspected supplied all30 route samples, ten boss attack/contact sheets, selected full-size scene/weapon/UI evidence, and exact14 quiet-L26 comparison. Overview sheets created in [audit13 media](media/R1/audit13). These are **sampled composition**, not thirty manual completions or continuous viewing. All30 route sheets are source12; the implementation explicitly documents unchanged pre26 applicability and a separate real-earned-history final14 suffix. I did not silently relabel them an unbroken final14 recording. L26's old overview is superseded for relief timing by the exact14 comparison.
- No actual audio listening, physical iPhone play, thermal/input validation, unfamiliar-player study or measured voluntary return was performed. No assertion of fluidity, emotional impact, Hades parity or addiction follows from these checks.
- Two independent live screenshots saved before disk pressure. Further Cook/ending screenshot saves failed with `ENOSPC`; those observations remain visible in this chat's returned browser frames but are **not** claimed as saved files. No project evidence was deleted. Audit text and campaign output saved successfully. The audit's own8846 server was stopped; owner/implementation servers were left alone.

## Findings requiring completion

### A13-01 · P1 · The Cook lesson still loses foreground ownership

**Contract:** C2, C3, S1, inherited boss readability. This is a shared-system problem to check across all ten bosses, not permission to repair only Cook.

**Observed:** At L1 HUD1:54, with Cook's health bar still full and the HUD saying “The Cook is exposed · Strike,” the world also presented “Screamer. If it starts, the whole block comes running” and “GREEN CROSS: HEALS YOU.” Numerous ordinary enemies, pickups and interaction markers remained between hero and boss. At2:04 a new First Aid card acknowledgment sat over the boss-bar region; a dense pursuing tail, Screamer effect and Cleaver silhouettes competed with the exchange. Two earned card choices occurred during this fight. Pausing those choices was safe; safe pausing alone does not make the fight coherent.

**Source explains the risk:** L1's finite Screamer beat is still scheduled at hold18 in `prototype/js/config.js`; `sim/events-kinds.js` queues `barkScreamer` through `P.Director.bark`. L1 `sim/director.js` owns its own bark queue and advances it without a boss-lesson boundary. Shared `P.Barks` suppression is not sufficient for this separate path. `sim/bosses.js:peelCrowd` only redirects survivors within9m at spawn for5.5s. That preserves enemies correctly, but is not a sustained spatial separation or a cap on the whole pursuing crowd. The cap on new encounter arrivals is not a cap on all survivors in view.

**Required completion:** Route L1 Director barks/tutorial prompts and generic interaction prompts through the same encounter attention policy as other foreground content. Stage the Screamer lesson before the Cook lesson or after its first exchange. Preserve crucial damage/hazard information. Let surviving enemies reach actual side/back space before control returns, and keep the approach physically separated long enough for the initial response/punish. Do not teleport/delete enemies or add an arbitrary immunity timer. Subsequent adds must contribute an intended decision. Reduce post-card acknowledgment to a compact non-occluding confirmation.

**Acceptance:** Earn L1 with both a slower close build that brings a large tail and a faster ranged build. From entry through the first punish, boss body/tool, warning and reachable escape are visible together; unrelated teaching is absent. Repeat equivalent checks for all ten bosses with real surviving crowds. Record actual controls and complete exchange, not a no-weapons empty-arena fixture. Preserve XP/choices/rewards and fair damage.

### A13-02 · P1 · Weapon presentation still suggests multiple detached implements

**Contract:** W1; the owner's explicit Knife/Cleaver/Chainsaw/Chain complaint.

**Observed:** In ordinary earned Cleaver play, multiple large blade-like silhouettes coexist at different positions around Arda. Current source12 Cleaver contact samples also show a large pale trailing blade separate from the held leading blade. It can read as a second floating weapon. The supplied Chainsaw rank3/5 contact sheets show several parallel bar/trail contours that read like a rake or fan, obscuring the actual toothed bar. Chain samples now show an attached curve and weighted endpoint, which is a concrete improvement, but higher-rank multi-directional deployment still needs a credible body/hand hierarchy.

These observations do **not** establish that the simulation reverted to orbiting Cleaver damage. Source/tests retain finite cuts and corrected hit attribution. The defect is the visible interpretation: truthful collision is necessary but not sufficient.

**Required completion:** Keep one dominant solid held blade/bar at any instant. Distinguish afterimage from material using shorter lifetime, lower value/opacity, simplified tapered arc rather than another fully outlined painted object, and attachment-consistent history through movement/reversal. Keep active contact clearer than cosmetic trails. Chainsaw should show one supported bar with teeth/contact resistance; confine vibration to the tool. Check all multi-held combinations so secondary deployment cannot read as extra arms. Do not solve this by increasing every flash or weapon size.

**Acceptance:** Current normal-speed movement/reversal/dash/crowd clips for all17 bases/18 evolutions and geometry-changing branches. Priority close review of Cleaver, Chainsaw/Grinder and Chain variants at normal phone scale. Still frames should identify the active implement; continuous viewing must establish grip, release, momentum and recovery. The latter remains unverified here, not passed by a source change.

### A13-03 · P1 · Distinct level decisions are still inconsistently presented

**Contract:** E1/E2 all30; district pacing and removal of repetitive task grammar.

**Observed:** Physical changes exist: cargo/obstructions, bell choices, cart collision, changed shutters and other route facts. Nevertheless, sampled ordinary L6–9, L11–14, L21–24 and L27–29 repeatedly return to broad paved lanes, similar pursuit tails, HUD instructions, circular work markers and an exit arrow. The new `config-drama-space.js` mostly composes crates/bins around existing work; that can add a useful flank, but cannot by itself demonstrate the requested dominant spatial identity. L4 still presents three cable work steps. L23's sack/work payoff is followed by another large “stay in the ring for coins” affordance and70m exit direction in supplied ordinary footage.

The supplied twelve-campaign pacing analysis still reports about20.9s after Vatman's defeat and20.1s after Keeper's, and substantial post-opening combat/travel in L7–9/L23/L28. Those nonboss durations are **not all empty walking**; do not mislabel them. They are places where the authored payoff can lose prominence to another similar stretch. Exact14 L26 relief is a real improvement: the car approach now has space before pressure resumes. Preserve it.

**Required completion:** Finish the existing all30 composition brief, especially adjacent-level contrast. Make the physical problem and its consequence visible before requiring the instruction strip to explain them: blocked diagonal versus open crossing, sheltered carry side versus exposed short route, specific crowd diversion versus generic following. Remove redundant work after a level's main payoff where it adds no new decision. Give5/10 a visibly purposeful short departure. Do not add30 new mechanics, more labels or a minimap to conceal ambiguous geometry.

**Acceptance:** For each adjacent pair, show the playable approach, changed collision/crowd route and onward handback with objective text hidden for review. Then verify ordinary text-on play. A reviewer must be able to describe the different action and consequence. Preserve neutral routes and already-destroyed/missed optional props. All30 initialization passing is not this acceptance check.

### A13-04 · P1 · Companionship still competes with stronger visual systems

**Contract:** S3/S4/S5 and R4; “companionship through action.”

**Observed:** Kaan's actual intervention/work and factual help state are implemented. Supplied earned L21 samples contain very large weapon shapes, a working circle, crowd effects and UI around the two people. L23 samples show several large ATM/work rings, prompts and combat effects in the same composition as the work/resumption. The current evidence makes it easier to notice circles and projectiles than to identify who saw a threat, intervened and enabled whom. The implementation's own qualification acknowledges this occlusion.

L25 quiet body/native-memory sequence and L30 family/Bazaar continuation are staged and coherent in the inspected samples. They deserve implementation credit. Their emotional acting is not accepted merely because the trigger order is correct, and the comic cannot substitute for the required world action.

**Required completion:** During the real L21 intercept and L23 work interruption, locally subordinate optional interaction rings, reward labels, oversized friendly effects and unrelated barks. Frame Arda, Kaan, the specific threat and newly usable route together. Show look/plant/contact/release and actual work resumption; retain player control and real threat geometry. Keep quiet L25/26 and the causal L30 handback. Do not add a gratitude line to explain an invisible event.

**Acceptance:** An uncoached observer can point to what Kaan did and what Arda enabled in both muted and audible play. Before that research, the implementation can still reject its own composition if optional rings or friendly weapons cover the relevant hands/contact/route. Inspect default, reduced effects and small viewport, not only isolated scene fixtures.

### A13-05 · P2 · Device dialogue has two ordinary-play defects

**Contract:** R4 explicitly required an intentional device/offscreen layout and removal of empty portrait boxes.

**Observed:** L1 at0:41–0:45 displays “Phone · Waiting for signal / Signal breaking up…” in a narrow vertical strip with words split. At the2:37 exit, “PHONE / NO SIGNAL” displays beside an empty gray portrait box. Both occur in ordinary first-clear play, not an art-failure fixture.

**Source:** `css/audit9.css:52` hides `.cm-l1-static .cm-l1-portrait`, but `css/comic.css:81` retains the two-column `70px minmax(0,1fr)` grid. The remaining bubble auto-places into the narrow first column. `view/comic.js:callSubtitle` treats static state separately from a resolved device speaker; the nonstatic `spk.phone` exit can still request a null contact portrait.

**Required completion:** Use a genuine single-column device layout for static and resolved device/offscreen speech; remove portrait sizing and the person-directed bubble tail where inappropriate. Preserve normal speaker portraits. Check TR/EN at320/390 and150% text, including live signal loss, restoration and final no-signal line.

![Ordinary signal-loss dialogue collapses into the portrait column](media/R1/audit13/live-signal-bubble.jpg)

### A13-06 · P1 review gate · Encounter budgets improved; consistent learning is not established

**Contract:** C1, all ten individual encounter contracts, baseline viability and strong-build payoff.

The change is measurable. The table below is the independently repeated broad/punish campaign, boss-spawn→lethal simulation seconds, **not** the PRD's first-actionable-control timer. All are first attempts in the respective campaign. Before/after histories can diverge; compare the larger supplied distributions as well.

| Boss | Previous independent run | Current independent run | Current interpretation |
|---|---:|---:|---|
| Cook1 | 3.87 | 8.42 | Longer, still short with earned Nailstorm; four logged attack starts do not prove four understood exchanges. Separate manual Cleaver fight lasted substantially longer and exposed crowd/teaching problems. |
| Switchkeeper2 | 4.35 | 19.80 | Rails/hook receive time; needs readable crossing/grip in ordinary motion. |
| Roaster3 | 9.40 | 19.35 | Charge/roast sequence has room; inspect stopping zone and source visibility during actual movement. |
| Linekeeper4 | 3.38 | 31.30 | Access/repetition changed materially. Supplied separate earned first-entry can still finish6.13s; do not call every short case a replay. |
| Vatman5 | 38.05 | 65.75 | Fifteen attack starts; this run had no evolution. Check whether extra cycles teach or repeat before increasing HP again. |
| Keeper10 | 5.43 | 19.22 | Clear increase; another supplied first-entry ends5.48s with Nailstorm. Weight/recovery experience must survive ordinary entry variation. |
| Bride15 | 10.90 | 15.95 | Actual counter exists; current run logs four attack starts. Supplied weak/strong losses also concentrate here. Needs counter discovery and hazard fairness review, not a blanket buff. |
| Fisher20 | 7.70 after loss | 42.47 | This after run is first-attempt win; prior successful value followed a death, so not a clean matched first-entry comparison. Cast/net loop has time. |
| Captain25 | 18.78 | 36.78 | Haul/spice sequence lasts; bracing, tool continuity and grief still need continuous acceptance. |
| Ticket Man30 | 6.27 | 34.73 | A substantial numerical correction; seven attack starts and phase transition. Does not by itself prove climax quality. |

The supplied final14 twelve-campaign table shows most medians rising, but outliers remain: Cook5.3–71.3s and Ticket Man29.1–100.9s on first-attempt wins, with a Ticket retry144.8s. Canister weak-entry tests improved to4/8 common-policy and6/8 spacing-policy wins, versus8/8 for the other two starters in the cited comparable checks. These are bot cases, not human success targets, but they merit examination.

**Required completion:** Review each extreme's damage sources, entry resources, actual reachable punish and meaningful responses. Separate rewarding legitimate burst from a fight erased before recognition. Separate a weak build from prolonged inaccessible targets. Preserve strong-build payoff; do not enforce minimum fight length, silently scale HP to DPS or require a specific starter. For Canister, establish a fair ordinary plan without a lucky early offer; make its actual tradeoff clear. No universal HP increase.

The same broad policy still produced25 Cleaver and1 Nailstorm useful evolutions. That does not prove players cannot build differently: the implementation now supplies selected useful traces for all18, including Hook Pull. It does show that selected reachability and starter availability do not establish naturally varied choices or replay motivation. Measure the next plan people actually choose.

### A13-07 · P2 · Result precision contradicts a reward criterion

**Observed:** The L1 result crossed out “End ≥50% HP” while showing “ended at50%.” HUD had displayed54/108. `main.js:settleRun` evaluates the exact health ratio but reports `Math.round(...*100)`; HUD uses a rounded-up HP display. A just-under-threshold result can therefore look qualified while failing.

**Required completion:** Preserve exact scoring, but show enough precision or a truthful “below50%” explanation at the boundary. Check just below/exactly/just above threshold. Do not change the reward rule accidentally. The earned Strength CTA and its permanent/no-Street-Cred confirmation worked well; preserve that flow.

### A13-08 · Acceptance gap · Recorded evidence is not motion, listening or player approval

The implementation now documents provenance and limitations far more accurately: final14 is distinct from12; failed captures/runs are retained; selected evolution reachability is not frequency; desktop measurements are not iPhone proof; generated films are not claimed to have been heard or watched continuously. Retain this honesty.

However, the requested normal-speed all-boss/body/tool/defeat, full-arsenal craft, sound fatigue, phone and unfamiliar-player checks remain open. This is a required verification gap, not evidence those qualities necessarily fail. Several local visual failures above can be fixed without waiting for people. After those fixes, use the existing short indexed reel and [acceptance script](AUDIT12-ACCEPTANCE-2026-11-20.md), not another enormous evidence framework. Keep implemented/presentation-inspected/player-accepted separate. Do not report the whole brief complete while the requested experience is rejected or untested.

## Requirement disposition

“Implemented” below is functional/source/test evidence, not artistic acceptance. Supplied evidence is distinguished from independent checks above.

| Requirement | Functional status | Experience acceptance |
|---|---|---|
| C1 damage budgets/access | Corrected self-fragment re-hit, actual Manhole sector/contact, fixed boss budgets and approach/recoveries; independent campaign confirms change. | Partial; A13-06. No minimum-timer requirement. |
| C2 crowd/space | Per-boss caps, no intro adds, survivor redirection exist. | Rejected as consistently delivered in L1; A13-01. Check all bosses. |
| C3 foreground/choices | Safe choice deferral and compact evolution flow exist; earned live choices paused safely and Cleaver returned to combat without a second full evolution modal. | Partial: unrelated teaching and post-choice banner still compete. |
| C4 targeting/14 roles | Actual differentiated roles and committed weapon rules retained; targeted source/coverage checks. | No all-role perceptual sign-off; crowd composition still hides differentiation. |
| Ten boss performance rows | Individual performance/AI/recovery/death code and supplied sheets exist for all ten, not just Cook. | No all-roster fluidity/weight/defeat satisfaction pass; composition failures and pending continuous review. |
| E1 bell/cart/domino | Real lure, cart interruption, material destruction/cover and neutral paths; focused tests and supplied factual fixtures. | Partial: natural discovery/causality under normal clutter not established. |
| E2 all30 | All30 initialize/clear; local physical changes documented and route samples inspected. | Partial: A13-03. No claim every level now feels fresh. |
| S1 opening→Cook→sanctuary | Ordinary live path completed; earned evolution, boss, chest, sanctuary and result work. | Partial: A13-01/02/05; entrance/defeat continuous craft not certified. |
| S2 Bride counter | Real contact/exposure and valid no-counter route supplied; test passes. | Deliberate discovery and satisfying reaction remain unaccepted. |
| S3 trust/help | Real Kaan action, interrupted work/resumption and truthful memory. | Partial: A13-04. |
| S4 loss/relief | Quiet farewell sequence and actual final14 L26 arrival suppression/handback. | Local improvement supported; uninterrupted emotional experience not accepted. Optional chest/upgrade still interrupts relief. |
| S5 chapter ending | Signal resolution, shared route, native call/Bazaar motive and31 lock in supplied evidence. | Coherent sampled sequence; full continuous climax/acting unaccepted. |
| W1 complete arsenal |17+18 inventory/branches retained with actual geometry; selected all18 useful evolutions supplied. | Priority visible defects remain; A13-02. Not all35 independently watched in motion. |
| W2 health/interactions | Real injury/heal/block/saved-food fixtures supplied; live injury/critical bracket treatment visible. | Cannot claim muted uncoached recognition. Full-health food behavior has technical evidence, not a new manual full-health interaction test here. |
| W3 sound/music | Threat mix/caps/ducking and existing music ownership changes. | Unverified listening. No claim the owner's disliked hurt sound is now pleasing. |
| R1 starter | After5 unlocks exactly one saved rank1 Knife/Nail/Canister, Normal-only, save/cancel/fallback and real simulation preview. Independent focused tests pass; supplied large-text layout inspected. | Functional implementation accepted; natural discovery and Canister fairness remain open. |
| R2 rematches | Optional5/15/25 deterministic tactical differences and mode boundaries implemented; actual supplied replay histories. | Functional evidence accepted; voluntary replay not measured. |
| R3 growth/results | Direct earned Strength CTA, exact benefit, permanent application and no Street Cred spent verified live. | Strongest directly verified UX success; A13-07 and result density remain. |
| R4 native continuity/device layout | Canonical prose/knowledge/help facts retained. | Device layout fails explicitly; A13-05. Recall/attachment unmeasured. |
| Integrated verification | Source identity, focused check and independent30 completion verified; larger supplied suite/cohorts transparently labelled. | Incomplete for motion/audio/iPhone/uncoached acceptance. |

## All30 spatial follow-through

These rows identify where to complete or verify the **existing** E2 direction. They are not thirty newly proven bugs. All levels were independently cleared by the campaign; visual review here is sampled source12 composition plus exact14 relief evidence, not manual full-length play of each.

| Level | Keep / finish the specified experience |
|---:|---|
|1| Keep earned evolution and growth handoff. Finish readable doorway/clear boss pocket, attention ownership and device layout. |
|2| Preserve real rail crossing; demonstrate both refuge sides and working-hand punish without generic pursuit obscuring them. |
|3| Make the bend/stopping zone distinguishable from2; keep source/body in view during charge/roast. |
|4| Three wires must visibly change three approaches; avoid three equivalent stops and late prompt congestion. |
|5| Broad apron/refuge is functional; review long no-evolution fight and roughly21s departure. |
|6| Cargo must read as a switchback and newly usable diagonal, not scenery beside a central route. |
|7| Put rescued musician and return lane ahead of the long following combat/travel stretch in attention. |
|8| Preserve real two-sided bell choice; show which specific crowd vacates which route on mute. |
|9| Make short exposed versus sheltered carry visible; ensure repeated travel has a decision. |
|10| Reachable final-weight opening exists; verify ordinary fast-entry learning and purposeful short departure. |
|11| Sideways cargo/flank should dominate the crane-loading view, with one readable new threat. |
|12| Show mooring's actual access change before the next generic onward instruction. |
|13| Preserve traffic/acid/blast refuge checks; no all-refuges-hot overlap under baseline movement. No new independent multi-seed hazard proof claimed here. |
|14| Each shutter needs a distinct crowd/access consequence; repeated action alone is insufficient. |
|15| Give the ordinary cart trajectory room to teach the optional rope counter; examine both fast wins and concentrated losses. |
|16| Keep bridge threshold shorter and calmer after Bride; independent campaign loss to Çöpçü is retained, not automatically a balance bug. |
|17| Rescue→safety→actual help/food must remain visually connected, including full-health saved state. |
|18| Windward/sheltered choice should be apparent in world direction; preserve pre-join narrative facts. |
|19| Refuge and chosen departure interval must differ from another hold circle; leave space before reunion. |
|20| Preserve net/cast distinction and factual recognition order; actually inspect lowered fish/body change at phone scale. |
|21| Real Kaan intercept needs local visual priority; A13-04. |
|22| Preserve actual offense/cover/neutral choices; frame material consequence and opened route in ordinary crowds. |
|23| Preserve three-sack truth and real work resumption; suppress optional rings/effects around the human payoff and review long onward segment. |
|24| Make trolley displacement a learned street-action payoff rather than another marker activation. |
|25| Preserve anchor/bollard distinction and respectful quiet aftermath; accept weight/chain continuity only after motion review. |
|26| Preserve exact14 car-opening relief. Review optional chest interruption and resumed pressure as one emotional sequence. |
|27| Guide/shelter action should read as a person helping, not another equivalent collect/open instruction. |
|28| Keep fuse/clock crossing causal; review long post-opening segment and late repeated work. |
|29| Distinguish light/lure lanes in the world and make the final approach intentional. |
|30| Preserve longer playable exchange and coherent family/Bazaar ending. Frame signal, escape and companions together before accepting the climax. |

## Answers to the owner's ten recurring concerns

1. **Arda/boss movement:** preserve accepted Arda locomotion. Boss-specific code changed, but fine-grained fluidity across all ten is not accepted by this audit. Small contact sheets cannot settle it.
2. **Object/health interactions:** actual causal rules improved/retained; full-health food no longer needs to be consumed to demonstrate life. Competition among prompts/rings still weakens clarity.
3. **Damage awareness/navigation:** live critical body/edge treatment exists, so “only the HUD changes” is no longer literally accurate. Whether it is noticed on mute remains untested. Route presentation still depends heavily on text; adding a map would not repair that root cause.
4. **Frenzy/boss tension:** distinct states/foreground mechanisms exist. The Cook's competing tutorial and crowd show tension is not reliably directed. Protect highs, lows and readable threats instead of adding another universal colour flash.
5. **Boss distinction/challenge:** measurable duration/access changes, not yet consistent characteristic lessons. Do not treat a longer fight as a better fight.
6. **Zombie variety:** roles are real. Differentiated perception in dense ordinary compositions remains open; avoid expensive gait detail for every walker before fixing hierarchy.
7. **Power balance:** independent first30 is viable; damage bugs and budgets changed. Outlier builds/access and the starter comparison need targeted review. Never force a monetization wall.
8. **Monetization:** supplied/independent progression uses no forced ads/spend. No new live monetization integration accepted or required by this packet.
9. **Weapons:** finite truthful attacks are present, but Cleaver/Chainsaw visual ownership remains a concrete open issue. Chain connection improved; momentum is not accepted from stills.
10. **Cutscenes/companionship:** protected scene structure, native story and real cooperation exist. Their visual prominence and continuous acting remain short of acceptance; L21/23 are priority examples, not the only scope.

## Next implementation handback

Complete A13-01 through07 against the existing PRD, with shared fixes checked across affected bosses/levels. Preserve the accepted growth path, native story, real environmental consequences, corrected hit attribution and quiet26. Do not add post30 content, new progression systems or more cinematic labels as a substitute.

Hand back one exact candidate with a concise disposition for each finding: changed code, what the player now sees, ordinary earned evidence and remaining limitations. Include a slower earned Cook approach with its real survivor tail, current priority-weapon reversals, L21/23 cause-and-effect, both device lines, boundary reward result, and the boss timing outliers. Keep complete all30/mode/save/localization checks appropriate to changed scope. Retain the independent human/device/audio gates, and do not turn “recorded” into “accepted.”

**Expansion remains unapproved.** The remaining work is not hundreds of hypothetical polish ideas: it includes specific visible failures of the current commission plus explicit unperformed quality checks. Resolve and verify those before commissioning another broad redesign.
