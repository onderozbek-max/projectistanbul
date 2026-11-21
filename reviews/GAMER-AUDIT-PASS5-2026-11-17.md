# NO SIGNAL — fifth player-experience audit

Date: 2026-11-17. Scope: current JS working tree, Bölüms 1–30, plus readiness of the existing L31–100 plan and content. Audit only. Recommendations are proposals, not approved changes to canon, balance or architecture. The shared implementation work was preserved.

**Build boundary:** HEAD remained `4f5361dc0f5306a0243719a8afba9382d4c9e9d3`, with substantial uncommitted implementation work. During the audit the implementation chat began a separately requested expansion of throwable props, changing street-weapon, environment, rendering and related files. The completed simulations describe the code loaded at their start, not a certified final version of those subsequent edits. Source checkpoint hashes and detected drift are retained with the evidence. The new portable-prop expansion needs its own finished-build regression/phone pass; it was not silently included in these balance claims.

## 1. Verdict

**No, this is not yet a demonstrated mobile masterpiece. It is a substantially more coherent and distinctive prototype, with several real fixes, but uneven execution remains visible.** I would continue investing in it. I would not yet advertise Hades-level animation, stronger retention than Survivor.io, or a finished production standard across 100 levels.

The strongest idea remains excellent: a personal walk home in which understanding Istanbul's streets and helping its people becomes a survival skill. Trams, moorings, market carts, station signals and Kaan can make this feel like its own game. The latest Captain artwork and farewell scene help that identity. The revised failure recap and attribute explanations also make the game feel more considerate of the player.

The unresolved problem is **the continuity of the experience**. A player can still spend several minutes repeating a boss loop, finish a sequence before experiencing a satisfying showdown, win many levels without developing a transformed build, and encounter old-looking interface art after polished combat. The next 70 levels currently inherit an older route template and incomplete companion/progression support. More content would amplify those seams.

**Will people be bored?** Some have credible reasons to be: long early traversal, repeated stationary interaction patterns, a build that keeps adding small upgrades without changing play, and bosses that reward the same orbit for too long. This is a risk assessment, not an observed human retention result. Equally, quiet scenes and easy victory laps are not automatically boring. The goal is meaningful contrast, not constant maximal stimulation.

**What would move this closest to the ambition?** Finish a small, repeatable quality standard for encounters, animation, build decisions and emotional payoffs; prove it with uncoached phone players; then carry it through the expansion. A founder's advantage is a coherent point of view, not a high count of generated assets.

Read the companion [L31–100 readiness and proposed encounter plan](CHAPTER1-L31-L100-READINESS-2026-11-17.md) before starting Kapalıçarşı production.

## 2. Evidence and limits

Evidence: [telemetry and reproduction notes](telemetry/gamer-pass5/README.md), [all-30 summary](telemetry/gamer-pass5/level-summary.csv), [screenshots](media/R1/gamer-pass5/).

| Check | Current result | What it establishes |
|---|---|---|
| Normal simulations: L1–30 × seeds 1–4, rhythm, active skills, no revive, expected loadout | **107/120 wins; 13 losses; zero crashes/timeouts** | Repeatable difficulty diagnostics. Previous pass: 108/120. This difference is not a population-level regression estimate. |
| Boss sensitivity: 6 bosses × 2 seeds × 4 build conditions | 48 runs with original positioning policy | Reproduces long/short encounter tails; supplemental equipment is a controlled counterfactual, not an earned build. |
| Same boss matrix with optional `--punish` positioning | Another 48 runs | Isolates the effect of approaching during exposure. This is a different policy, not a balance fix. |
| Fresh earned campaign with actual L1 and result settlement | **32 attempts, all 30 cleared; retries at L15/L25; 71.5 simulated minutes** | Persistent progression under one spending/card policy. Excludes reading, menus, decision time and purchased gear. |
| Route inspection | All 30 have authored route identities; **L31–100 have no authored route milestone object** | The current expansion falls back to the legacy generator. It does not mean all future scenery/content is absent. |
| Training calculation | Knife, Car Door and Chainsaw each yield **35 Strength XP per 100 attributed kills**, other inputs held equal | The reported melee taxonomy defect is fixed. |
| Comic/bark fit | **2,237 rows; zero flagged fit/overlap/overflow cases** across TR/EN | Layout integrity in the preview, not semantic correctness, acting quality or reading comfort. Some fitted text reaches 12 px. |
| Live inspection | Fresh L1 opening, movement, upgrades, chest, loss, recap, map, attributes/tree; isolated L15/L25/L30 boss views; Captain farewell | Selected ordinary flow and current visual presentation. Boss fixtures skip approach, use expected meta and invulnerability. |
| Targeted regression checks | **8/8 passed, zero failures:** dialogue, music, progress UI, scene art, gamer route, Karaköy, Eminönü, Sirkeci | Scoped checks of the relevant systems; some loaded later concurrent edits. Not a frozen-build full-suite certificate. |
| Full regression suite | **Not certified: four suites completed; run interrupted after concurrent source changes were confirmed** | No full-suite pass is claimed. A fresh frozen-build run remains required. See the evidence README for targeted-check status. |

I did **not** manually finish all 30 levels, perform uninterrupted human sessions, critically listen to the mix on a phone, or play L31–100 as finished authored levels. Manual L1 died to a runner after 2:21; tool gaps and keyboard input make that unsuitable as a difficulty statistic. No claim of physical iPhone performance, touch comfort, audio quality or return rate is made.

The earned campaign reuses the previous probe for comparability: it favors weapons over passives, does not use focused rerolls, spends ready attributes and affordable low-tier perks, and does not purchase gear. It does not forward the new `marketCover` story flag to settlement, so it is not a test of Kaan's remembered acknowledgment. That flag was checked separately in current source and scene selection. Naturally earned and supplemental boss conditions are kept separate in the evidence.

## 3. Verification of the last audit

| Previous issue | Current verification | Judgment |
|---|---|---|
| First-30 boss identity/instructions and essential TR/EN facts | Updated encounter contract, calls and boss lines; L10 now refers to the Keeper, L15 to dock danger; family/note motivation reconciled through L30 | **Implemented within slice.** Expansion facts still diverge. |
| Missing weapon training classifications | Explicit category mapping; real training probe now gives Car Door/Chainsaw melee XP; environmental-source policy documented | **Fixed for checked cases.** Keep coverage for every new source/evolution. |
| Heavy perk versus melee category | Separated deliberately; Car Door/Chainsaw are melee but not automatically tagged Heavy | **Clarified.** A player should see affected equipped weapons from the perk itself. |
| Rounded/incomplete attribute previews | Decimal primary effects, expandable secondary effects, training versus Street Cred explanation; live navigation to prerequisites works | **Implemented.** Density and future reward pacing remain. |
| Loss recap fails to acknowledge learning | Live recap showed Strength +38.3 XP, Knife +101 mastery kills and a specific next-rank suggestion | **Fixed and useful.** It now offers a constructive reason to retry. |
| Recipe continuity | Rank-3 paired focus supports ordinary offers; lower-rank side weapon no longer displaces focus; visible early recipe card verified | **Mechanism implemented, outcome only partial.** Earned campaign still evolves only at L2/L3. |
| Captain represented by unsuitable art | Dedicated six-pose atlas, foot/grip anchors, active body renderer and load gate; live fixture shows it | **Visual identity fixed. Animation finish incomplete.** There is no dedicated walking cycle in this renderer. |
| Kaan's grief portrait and remembered rescue | New grief/steady towel portraits match scene; `kaanMarketCover` stored on successful normal L23 settlement and consulted at L25 | **Implemented.** Broader cast acting remains uneven. |
| L14 shutters do not influence ordinary crowd | First two shutters now create alternating crowd lures; configurable cadence is present | **Implemented.** Seed sample includes a new L14 toxic death; validate readability and encounter overlap rather than immediately nerfing it. |
| Accidental cart acquisition | Pickup hold increased to 0.60 s, commitment feedback and movement/dash cancellation | **Implemented in source/tests.** Needs thumb testing under pressure. |
| Full-health food consumption/visual priority | Full-health food retained; cap-aware visual treatment | **Implemented.** Make the finite healing economy understandable without a technical explanation. |
| L28 clock lacks visible consequence | Moving hand and restart cue added | **Implemented.** Use this as the minimum standard for every required interaction. |
| Flat music pressure | Calm/intense state now responds to sustained nearby threat/Frenzy with hysteresis; aftermath precedes rewards | **Implemented as a system.** No recurring story motif or verified phone listening pass yet. |
| Boss duration variance | More diagnostic traces and optional exposure-seeking bot | **Diagnosed, not closed.** Original-policy extremes still reproduce. |
| Other bosses' motion and physical-phone acceptance | Implementation record explicitly leaves them open | **Still open.** Do not mark all recommendations complete. |

The implementation has genuinely moved forward. Reopening every fixed item would be wasteful. The next work should target the remaining outcomes and the specific new seams below.

## 4. Whole-player journey

### Opening and first session

The illustrated title establishes a much stronger promise than the old generic presentation. The café exit marker helps, and the street has recognizable local identity. The opening upgrades are readable and pause the action. A recipe candidate visibly follows investment in the Knife. These should be protected.

The opening still asks the player to absorb movement, automatic attacks, XP, Adrenaline, Street Cred, three active buttons, calls, hazards, equipment ranks and a recipe. Spread explanations across success moments. Do not add another tutorial page. Show the next relevant concept, then let the player demonstrate it. The café door can still require precise lateral alignment; my keyboard overshoot is not proof of bad touch controls, but this is an obvious uncoached-phone checkpoint.

The HUD spends substantial portrait space on health, level, time, XP/Cred, route instruction, boss information and calls. Three large action buttons occupy the right combat edge. During calls, the top of the playable view is also covered. None of this alone establishes an unfair hit, but the usable combat area must be measured with a real thumb covering the controls, especially during boss lanes and dense contact combat.

### Middle of the slice

The district verbs are meaningfully better than thirty generic survival timers. However, route lengths and required decisions still have an uneven cadence. L4/L9 are among the longest winning medians before the companion is available; several later routes are nearly half as long. Look for repeated safe travel between beats, not simply a uniform duration reduction.

Kaan is the strongest mid-slice reason to continue because he can change both combat and the emotional stakes. The L23 reciprocity and L25 memory should become a design pattern: player action → visible aid → later acknowledgment. Do not turn this into a large branching dialogue system or a grind bar with no scenes behind it.

### Boss, reward, next level

Boss exposure instructions now give a more understandable answer to “when should I attack?” The new telemetry demonstrates why this matters: the same supplemental L5 defensive build falls from 235.2 s to 48.6 s when the policy deliberately approaches exposure windows. That is a strong argument for readable learning, not blanket HP reductions.

The recap now supports retry motivation. The remaining reward gap is experiential: a district victory should leave a changed place, a human response, a clear new capability or a fresh destination. A chest, currency total and another map node are insufficient for every fifth level. Existing aftermath/story timing is the right foundation; vary the actual payoff.

L30 is a slice finale but not the end of the walk. It should resolve the station situation and clarify why the next district matters. L31 must retain companion presence, recipe support, visible interaction consequences and current readability. Otherwise the player has completed the best part and is entering a longer, older game.

### Reasons to return

There are three sustainable reasons: unfinished personal curiosity, a build idea worth trying, and a challenge the player now understands. Encourage those through optional remixes, meaningful mastery and memories. Avoid mandatory daily chores or endless stat inflation as substitutes. A player who stops satisfied and returns voluntarily is a better success criterion than one who cannot find a clean stopping point.

## 5. Level-by-level review: all thirty

Times below are winning medians in seconds, seeds 1–4, expected-power bot. Four runs are diagnostic, not a calibrated target win rate. Recommendations combine current route/source inspection with the selected live observations described above; they are not claims of thirty manual clears.

| L | Route / wins / median | Player-facing assessment and next improvement |
|---|---|---|
| 1 | Restaurant escape · 4/4 · 139.9 | Strong setting and clearer exit. Test door alignment, first attack comprehension and information load with a fresh thumb player. Keep failure learning visible. |
| 2 | Tram stop · 3/4 · 185.7 | Signal/stop interaction can establish using the city. Make the tram's danger and payoff readable before another prolonged crowd segment; crawler loss merits a trace. |
| 3 | Tram crossing/cart · 4/4 · 190.5 | A useful environmental-weapon lesson. Distinguish mandatory route action, ordinary cart contact and deliberate cart wielding. Verify the longer pickup commitment does not feel sticky. |
| 4 | Live wires · 4/4 · 215.3 | Long early level with repeated stationary cuts. Vary approach and recovery space; ensure each cut changes the route visibly. Cut uneventful travel before adding enemies. |
| 5 | Depot/Vatman · 2/4 · 151.8 | First major mastery test is volatile. Teach bell/lever recovery through animation, reward a correct approach, and reproduce seed 2 before changing health. |
| 6 | Galata hoist · 4/4 · 119.7 | Welcome pace reset and new spatial premise. Counterweight movement must visibly explain the newly walkable space. |
| 7 | Musician escort · 4/4 · 162.6 | Human stakes help. Let pace, shelter and acknowledgment distinguish this from standing beside a moving progress bar. |
| 8 | Galata bell · 4/4 · 165.0 | Lure/attention is a useful decision. Communicate where the crowd will go and let a smart ring produce a satisfying bypass or chain. |
| 9 | Footbridge · 4/4 · 223.2 | Longest current winning median; seed-42 exit near 320 m. Audit travel between meaningful decisions. Preserve height/reveal, shorten repeated corridor work if humans disengage. |
| 10 | Courtyard/Keeper · 4/4 · 147.9 | Dialogue now matches encounter. Natural boss samples still range 32.7–124.2 s. Make counterweight causality and the punish window unmistakable. |
| 11 | Cargo hook · 3/4 · 80.5 | Strong concise district arrival. A runner kills one sample; ensure the first hook lesson is not competing with an unseen rush. |
| 12 | Ferry mooring · 4/4 · 137.2 | Spatial consequence matters more than hold duration. Keep rope tension, boat movement and safe deck boundary synchronized. |
| 13 | Tram points · 2/4 · 157.5 | Repeated pressure hotspot; canister/bloater deaths. Inspect combined explosion/approach choices and safe exits before blaming the interaction itself. |
| 14 | Fish shutters · 3/4 · 121.6 | New alternating lures are a real improvement. Make the selected shutter and crowd response obvious; check toxic hazards do not invalidate the demonstrated safe choice. |
| 15 | Dock ramp/Bride · 4/4 · 111.3 | Cargo lanes and rope sweep are distinct, but natural seed 1 still kills boss in 9.8 s. Give the first encounter a satisfying readable exchange; preserve fast earned rematches. |
| 16 | Bridge rods · 4/4 · 90.4 | A good short transition. Establish water/walkable deck and the rod's role through ground contact and motion. |
| 17 | Bridge rescue · 4/4 · 105.1 | Make the rescued person's relief visible; a tangible thank-you is more memorable than a counter. Avoid replaying a full explanation on retry. |
| 18 | Bridge screens · 3/4 · 99.1 | Cover should support a deliberate choice. Test whether runners and foreground geometry leave a readable escape route. |
| 19 | Bridge wave · 2/4 · 124.0 | Existing traces put losses before the brace event; do not “fix” the wave without evidence. Audit pre-wave acid/toxic pressure, then validate the brace cue on mute. |
| 20 | Bridge lift/Fisherman · 4/4 · 123.5 | Kaan's arrival is a major reward. Preserve the remaining-crowd instruction after boss death and the human joining beat after crossing. Natural boss samples 22.1–43.2 s. |
| 21 | Market awning · 3/4 · 92.5 | New companion should be noticed without a lecture. One brute loss: check whether support and danger compete for the same attention. |
| 22 | Market cart · 4/4 · 105.7 | Carrying should change movement decisions, not just slow walking. Verify cancel-before-pickup and hazard clearance on touch. |
| 23 | Market sacks/cover Kaan · 4/4 · 136.0 | Best candidate for a memorable reciprocal moment. Observe whether players notice the need, act intentionally and later recognize the acknowledgment. Missing it must not break the story. |
| 24 | Market signal · 4/4 · 103.0 | Another signal/hold risks familiarity. Emphasize timing around the trolley and a changed route, rather than another progress ring. |
| 25 | Market gate/Captain · 4/4 · 128.6 | New actor and farewell significantly improve identity. Finish locomotion, spice-sack gesture, recovery transitions and contextual sound. Natural boss samples now 49.6–62.7 s. |
| 26 | Station departure · 4/4 · 93.7 | Train departure is a strong spectacle if player timing matters. Let the view briefly reveal the consequence without removing control for a long cutscene. |
| 27 | Station guide · 3/4 · 92.2 | Differentiate this escort from L7: temporary light/shelter or route knowledge, not simply another follower. One brute loss needs spatial review. |
| 28 | Station clock · 3/4 · 126.3 | Moving clock hand repairs an important feedback gap. Ensure restart is visible without staring at tiny detail; one brute loss remains in sample. |
| 29 | Station lights · 4/4 · 119.2 | Sequential lights can become memorized checkpoints. Show a changed navigation problem as each light opens, with readable enemies on low graphics. |
| 30 | Station points/Ticket Man · 4/4 · 116.2 | Solid mechanical finale; dedicated Ticket Man art already exists. Improve body/background contrast and pose continuity. End with a specific reason to enter the bazaar. |

## 6. Remaining work, ordered by impact

### A5-01 — P1: prevent an expansion quality drop at L31

**Evidence:** `config-levels.js:108` caps authored routes at 30. The current 31–100 runtime inspection returns no `routeTrial` or `milestone` for all seventy levels. `kaan-support.js:80` requires a route trial and `support.last` is 30. `progression.js:130` gates recipe support on the same route system. All base weapon families are in the pool by L21.

**Player effect:** the companion can disappear as a visible helper, purposeful street encounters become the old route/hold pattern, and build guidance stops just as the content pool is widest. New backgrounds will not conceal that regression.

**Implement:** define L31's inherited experience contract explicitly; author 31–35 as the next five-level proof, then 36–40. Decouple “supported player experience” from an accidental slice flag where appropriate, while preserving sim/view rules. Carry Kaan, recipe continuity, current art rules, failure learning and actionable objectives through every new authored district. Do not merely raise `routePreviewThrough` to 100: those encounter definitions do not yet exist.

**Acceptance:** a sequential earned save from L29 through L35 retains the correct loadout, support behavior and remembered events; each new level has a distinct required decision and visible consequence. The companion document specifies the proposed 70-level rhythm.

### A5-02 — P1: turn boss exposure into learnable combat

The original-policy L5 seed-2 Car Door supplement still takes **235.2 s / 47 windups**. With `--punish`, the same case takes **48.6 s / 11 windups**. Natural L5 seed 2 changes from loss to a 58.8 s boss kill. Natural L15 seed 1 remains **9.8 s / 2 windups** under both policies. These are reproducible diagnostics with unchanged boss HP, not proof that one weapon is inherently bad or that the game should force fixed boss durations.

The long L5 trace records zero close-range time; the exposure-seeking trace records about 14 s close and much more effective Knife damage. The supplementary Car Door can evolve into Minibus during the fight, and the policy changes subsequent combat/upgrade outcomes. Interpret this as a positioning-policy comparison, not an isolated fixed-weapon DPS experiment.

Use the new `showdown` fields: range time, exposed damage, phase timing, per-weapon damage and damage after boss death. Put the vulnerability in the body pose, sound and ground presentation as well as the HUD. Give a new player a safe first demonstration; then combine learned attacks. If a player understands the window but cannot land attacks, inspect targeting/range and approach geometry. If the first Bride encounter evaporates, adjust its specific opening/approach resource relationship rather than making every boss a sponge.

**Acceptance:** compare earned melee, ranged, defensive and unfocused saves, novice and exposure-seeking policies, and uncoached phone players. A player should explain the attack and recovery after a loss, improve on retry, and feel stronger on a rematch. Record first-clear versus replay separately. Do not solve a short fight with a long invulnerable wait.

### A5-03 — P1: make build decisions pay off before the run ends

Recipe support is improved, but the fresh campaign still ends with evolutions only at **L2 and L3**, two of 32 attempts. The policy's weapon preference and lack of focused rerolls are important limitations. The implementation's focused fixtures show the mechanism can work; the ordinary policy shows it is still easy to win repeatedly without using it.

Track: offered relevant upgrade → chosen upgrade → paired item acquired → ready to evolve → evolution achieved → meaningful combat time remaining. Distinguish “did not understand,” “chose another plan” and “never received an opportunity.” A healthy build loop allows deliberate refusal; it should not require hidden knowledge to reach its signature payoff.

The visible first Knife fork also deserves review. `knife.A` gives +35% damage and knockback/stun; `knife.B` offers a 25% double-damage chance, about +25% expected damage before other interactions. Later B branches may justify the route, so this is **not a proof of global dominance**. At the point of choice, however, the risk/reward and future identity are poorly communicated. Show what each branch leads toward, and test both on crowd control, boss windows and survival. Give each branch a practical situation where it is preferable.

**Acceptance:** informed and uncoached players can describe their current build, pursue a transformation in several districts, and enjoy it before the exit. Require measured payoff windows, not just “an evolution event fired.” Preserve optional discovery of terrain evolutions; expose enough clues that they are discoverable without a wiki.

### A5-04 — P1: complete actor motion, not only pose coverage

The Captain atlas is good production progress. It has idle, anticipation, release, pull, recovery and defeat images with anchors. `eminonu-boss-fx.js` selects one image by state and draws it directly; walking uses the default pose. This remains a moving illustration in transitions rather than a fully acted body. The other bosses largely use generic raster walk/windup/hit selection; Ticket Man already has a dedicated body override and must not be mistaken for the old generic keeper.

For each major boss, define anticipation → commitment → contact → follow-through → recovery, plus locomotion/turn, stagger and defeat. Author the gestures specific to that mechanic: the Bride setting a cargo/rope action, the Fisherman casting/reeling, the Captain's anchor and sacks, the Ticket Man's punch/signal. Keep hands, tools, trails, collision and sound aligned. Use controlled deformation and a few essential transition frames; do not mandate an enormous atlas without proving it improves the phone image.

The live fixtures also show how much combat space is covered by buttons and upper HUD. Test body/telegraph contrast under that occlusion. Ticket Man's subdued silhouette particularly needs separation from the grey station floor. This is an art-direction/readability task, not a call for more glow everywhere.

**Acceptance:** phone-sized clips at normal speed and frame-by-frame, all attack directions, crowded and sparse, low/high quality and Reduce Motion. Viewers identify preparation and recovery without reading labels. No foot sliding, prop jumps or harm before the shown contact. Preserve the flash guardrail.

### A5-05 — P1: audit decisions per minute, not just level duration

L4 and L9 remain over 210 s in winning medians; many L11–30 routes are near 90–140 s. Several distinct props still ask for approach → stand in radius → wait. Individual hold times are short, but repeating the same input across districts can flatten the experience.

Annotate each route with its required decisions, travel, danger, relief and payoff. Remove repeated traversal that adds neither a choice nor an atmospheric beat. Alternate luring, timing, escort pacing, carrying, spatial clearing and deliberate short rest. Keep one shared visual language for “interact here”; vary what the player must understand, not the button grammar.

**Acceptance:** in a five-level block, players can recall different moments and strategies, not only different scenery. Record stalls and deaths by section; L19's pre-wave deaths must not be misattributed to the wave. Replays skip repeated explanation while retaining readable telegraphs.

### A5-06 — P1 before expansion: plan persistent rewards through L100

The earned L30 campaign ends at Strength/Pace/Aggression **6/6/6**, Intelligence **1**, Charm **2**, Grit **4**, with eight learned perks. This is a policy-specific result, but it exposes a progression shape worth designing deliberately. Intelligence/Charm should have useful, visible opportunities rather than becoming late filler or compulsory grind detours.

Kaan's bond reaches 100 around **L38–42** on uninterrupted first clears under the current formula (three-star versus two-star clears). Thresholds 75 and 100 are explicitly later-chapter stubs in `meta-bond-ui.js`. That leaves most of Chapter 1 after a capped meter with no corresponding current reward. Do not slow the meter arbitrarily or invent late power inflation. Give Chapter 1 meaningful relationship payoffs, make deferred rewards honest, and separate relationship scenes from a numerical cap if needed.

**Acceptance:** an earned L1–100 progression sheet shows when every important capability arrives, what remains interesting afterward, and what the player does to improve INT/CHA. Test a focused fighter, helper/hacker and mixed learner. No empty milestone is presented as a new usable ability.

### A5-07 — P2: remove the remaining interface/art seams

**Confirmed live/source:** `screens.js:453–464` draws the death-card killer through old `P.Sprites.person`; most causes fall back to a walker. The runner displayed after death does not resemble the actual runner. This weakens both polish and learning. Render the current enemy/attack portrait with the actual killer identity, and distinguish a boss from its adds or environmental damage.

**Confirmed presentation:** the chest reveal still uses a large procedural `S.chestShape` while surrounding item and world art is illustrated. Treat it as a specific style pass: reuse the approved chest visual and a concise reveal. Do not add a longer unskippable ceremony for ordinary stat increments.

**Clarity:** the boss bar's timer is labeled “Time left,” while it belongs to the optional boss objective; the same encounters can continue after it expires. Label it as a bonus/par challenge, separate from survival. Keep the remaining-crowd instruction after a kill. Review old sub-location labels too: the current L30 introduction still says “Station Clock” although the authored clock interaction is L28 and the finale is station points/Ticket Man.

**Acceptance:** compare combat, down screen, results, arsenal and comic representations of the same subject. No retired ordinary-play drawing returns in a secondary screen. Players correctly distinguish main completion, optional bonus and star requirements.

### A5-08 — P2: make music and sound carry place and emotion

The score now samples pressure every 0.5 s, switches after sustained danger, and waits before returning to calm. The game still has eight main music IDs and no implemented recurring home/Kaan motif. State switching is a useful foundation, not a finished musical arc. The player should recognize place, escalation, relief and a relationship through sound, not only a louder generic combat cue.

Use a small motif family with restrained variations: home/phone, shared survival, and a darker uncertainty. Bring a familiar phrase back at the Captain farewell and the apartment door. Keep district ambience and dangerous cues audible under weapons. Audit material-specific contact, repeated-cue fatigue, offscreen warnings, silence after a boss and transition timing. Generated SFX already have a bounded loader and synthesized fallback; verify what actually plays in a cold phone session.

Asset inventory: the generated SFX manifest currently contains 44 cue IDs with one recorded file per cue, plus five ambience beds. The loader supports round-robin selection, but there are no multiple recorded takes per cue in this manifest. Selective alternates for the most frequently repeated impacts are a better next investment than indiscriminately adding more sounds. This is an inventory observation, not a listening verdict.

Dialogue currently uses synthesized speech blips, as documented in `docs/audio-cue-sheet.md`; native “voice text” files do not constitute a performed spoken cast. Establish an intentional voice direction. A restrained, distinctive comic sound language can work, but the important calls/farewell need an audition for emotional timing. If selective performed lines are desired, pilot one scene before committing to full-cast production or any new service. Visual acting, writing and silence still have to carry the scene.

**Acceptance:** a recorded listening pass on phone speaker and headphones, ordinary/peak combat, music/SFX toggles, interrupt/resume and low quality. Test recognition and mix intelligibility. I have not listened critically to those conditions, so this report does not declare the current mix excellent or poor.

### A5-09 — P2: direct the emotional scenes and complete asset loading policy

Kaan's new farewell poses finally fit grief and resolve. In the same live scene, Arda's worried treatment is still a broad, open-mouth expression; the raster comic system maps several emotions onto one expressive portrait. Use subtle concern for an offer to rest, and reserve shock/shouting for actual shock. A few carefully chosen reaction poses will matter more than many interchangeable illustrations.

The Captain's explicit load gate is good. The broader comic loader treats completion of failed loads as “ready,” so missing portraits/backgrounds can produce blank/dark scene elements. Extend the coherent failure policy to essential district and story assets: preload what the next scene needs, retry or present a localized recoverable state, and never silently revive retired art. Avoid blocking the whole chapter on every optional background.

**Acceptance:** normal/cold load, one missing essential image, low graphics and language changes; inspect the first frame as well as the settled scene. Preserve the existing zero-overflow result, then test actual reading pace and emotional comprehension.

### A5-10 — P1 acceptance gate: establish actual mobile quality and desire to return

The desktop runs and automated checks cannot close the primary product question. Use the existing device capture and local telemetry workflow, with a named build and fresh saves. Start with a small formative group of uncoached mobile players, then broaden when the obvious problems are fixed. Separate fans of survivor-likes from newcomers.

Observe first movement, first hit, first upgrade, first loss, first boss retry, L20's joining beat and L30→31. Ask afterward what they wanted to do next, which build they were pursuing, which boss opening they recognized and which scene they remember. Do not coach them through the answer. Measure voluntary continuation and a later voluntary return; do not infer retention from clearing a bot route.

Record touch misses, thumb occlusion, frame-time tails/thermal behavior, audio interruptions, safe areas, suspend/resume and save recovery on the intended minimum iPhone and a newer device. Use the product's performance targets rather than declaring success from desktop FPS. No new service or dependency is required for this formative pass.

## 7. Asset and component finishing standard

| Component | Current strength | Remaining standard |
|---|---|---|
| Hero | Recognizable Arda, distinct weapon presentation, directional raster frames | Foot plant, direction changes, attack/reaction priority and prop contact at real phone size. |
| Ordinary enemies | Clearer varied silhouettes, current raster artwork | Death-screen identity parity; dense crowd recognition; dangerous elite distinguishable without color alone. |
| Bosses | Distinct encounter mechanics; Captain and Ticket Man bespoke body art | Mechanic-specific acting, motion continuity, readable recovery, meaningful first showdown. |
| Weapons | Extensive base/evolved vocabulary and environmental interactions | Branches with understandable situational value; evolution reached and enjoyed; peak effects do not bury harm. |
| Props/consumables | Cart commitment and food retention improved; routes have tangible objects | Input intent, hazard/use states, ground contact, contact sounds, consistent material language. |
| District scenery | Strong illustrated identity | Walkable versus decorative boundaries, horizon/view angle, no naked seam at water/deck/buildings, no retired fallback. |
| Cutscenes | Existing camera beats, evolution/defeat effects and illustrated pages | Short player-earned reveals; return control promptly; avoid repeating the same zoom as every climax. |
| Comics | New Kaan acting, extensive fit coverage | Scene-specific expression/eyeline; bilingual fact parity; no blank essential art after load failure. |
| Music | Threat-sensitive switching and aftermath sequencing | Story motif, district/scene contrast, actual phone listening and interruption checks. |
| SFX | Generated-file system plus material/interaction cues | Identify danger through sound; avoid fatigue/masking; verify fallback sounds fit the same palette. |
| Progression menus | Clearer relationship between training, attribute prerequisites and Street Cred | Easier scan of current benefit and next meaningful goal; contextual affected-weapon list; late-chapter reward plan. |
| Map/results | Obvious next level and helpful failure recap | A named reason for next destination; honest optional bonuses; memorable district aftermath. |
| Accessibility/mobile | Existing settings and Reduce Motion pathway | Test actual reading size, color-independent cues, one-thumb reach and occlusion on hardware. |

This is a finishing standard, not authorization to replace every asset. Reuse approved work that meets it.

## 8. The most valuable “wow” moments to pursue

1. **The city changes because I acted.** Restore the station clock/lights and briefly see the route respond; later people use the path opened. Scale the existing L28 consequence into a small recurring pattern.
2. **My companion remembers something I did.** Keep L23→25 and add two or three later callbacks with a changed action or object, not just extra text. A towel, repaired sign or shared food can carry the relationship.
3. **My build turns a danger into an opportunity.** Stage an optional, clearly telegraphed wet-ground/gas/cart interaction that lets a known weapon solve a crowd differently. Reward understanding; retain a safe alternative.
4. **A district boss changes the space.** Teach the material/route rule earlier, then let the boss exploit and finally break it. The player wins by understanding the district, not waiting for another health bar.
5. **Home feels earned.** At L100, reuse an early sound, gesture and domestic object. Let the player take a few quiet steps, put something down, and receive an actual emotional payoff before the next mystery. Do not make the apartment merely a trailer for Chapter 2.

Implement the first two with existing slice systems before commissioning a large new feature set. Surprise is strongest when the game has established a rule the player can recognize being transformed.

## 9. Implementation order and exit gates

| Order | Work packet | Deliverable / exit evidence |
|---|---|---|
| 1 | Canon and expansion inheritance | One current encounter/fact ledger; L31 retains slice behavior; corrected future radio/boss numbering; clear bond plan. |
| 2 | Boss learning and build payoff | Reproduced tails, paired policies, earned saves, readable exposure, transformation opportunity and use-time traces. |
| 3 | Motion/style reference | Finished Captain plus one contrasting boss and two contrasting weapons, phone-size clips, approved body/contact/readability standard. |
| 4 | Route cadence and UI seams | Edited L4/L9 only where evidence warrants; current killer portrait; honest bonus timer; concise coherent chest reveal. |
| 5 | Phone player validation | Uncoached flow, reading/controls/mix/performance/save checks, actual continuation/return observations. |
| 6 | L31–35, then 36–40 | Five-level authored block reviewed end-to-end with earned progression, followed by the next block only after inherited issues are resolved. |

There is no honest checklist whose completion guarantees a masterpiece. This packet gives the implementation agent a smaller set of falsifiable quality outcomes. The next review should primarily test those outcomes, not reward the number of new systems added.
