# NO SIGNAL — fourth player-experience audit

Date: 2026-11-17. Scope: the active JavaScript prototype, Bölüms 1–30. Audit only; no gameplay, balance, assets, or story were changed. Recommendations below are proposals for the implementation agent, not accepted design decisions.

## 1. Verdict: distinctive, increasingly capable, still not a masterpiece

**No: I would not yet describe this build as a mobile masterpiece or claim Hades-level execution.** It has enough identity to deserve a serious finishing pass: a walk home through Istanbul, improvised street weapons, tangible route obstacles, a companion who helps with actual danger, and bosses with different spatial problems. Those are foundations worth protecting. The biggest deficit is now consistency and direction across those systems.

A player can receive advice about a boss mechanic that no longer exists, use a physical melee weapon without earning melee training, see rounded or incomplete upgrade benefits, and hear essentially the same exploration music regardless of changing combat pressure. The art can depict a composed, smiling Kaan during grief. Those seams make a game feel assembled even when its individual features are impressive.

**Will people become bored? There are credible boredom risks, not proof that every player will be bored.** The risks are: long early routes relative to later ones; recurring stop-in-a-ring interactions; long boss loops without a new decision; expanding weapon choices that diffuse a build before it transforms; and repeated portrait/panel treatment at emotionally different moments. More particles, enemies, weapons, or compulsory cinematics will not reliably solve these.

**Will people want to keep going?** The journey, new districts, mechanical unlocks and Kaan provide plausible reasons. Actual voluntary replay and return intent remain unmeasured. No automated win rate establishes fun, retention, or superiority to Survivor.io. Treat this report as a concrete quality plan, not a promise that implementing a checklist guarantees a masterpiece.

### What improved, and what is still open

| Area from the previous audit | Current evidence | Closure judgment |
|---|---|---|
| L1 exit guidance | Live marker and instruction now direct the player to the exit; I reached the street | Substantially improved; retain phone onboarding check |
| Attribute → perk navigation | Live Attributes screen links to the relevant prerequisite and Train Strength links back | Implemented and useful; numerical/category gaps remain |
| Required route versus optional bonus | Current HUD and result logic distinguish them; bonus is visible on results | Implemented; do not turn optional failure into route failure |
| L3 tram as a weapon | Live sim has a switch, warning, moving tram and crowd damage | Implemented mechanically; new-player discovery still needs observation |
| Kaan reciprocal action | L23 live-threat Dash opportunity and contact validation exist; L25 has conditional acknowledgment | Implemented mechanically; evidence does not yet establish emotional impact |
| Weapon impacts and environmental weapon | New cart sequence, Car Door throw and airborne reactions exist; live weapon fixture inspected | Real improvement; pickup intent and crowded readability need work |
| Scene-specific comic acting | Raster system still maps many emotions to the same portrait; D106 explicitly leaves acting open | **Not closed** |
| Musical story motif | D106 leaves it open; gameplay still selects `run_calm` | **Not closed** |
| Physical iPhone motion, mix and performance | Implementation packets still list these as open | **Not closed** |

The implementation claim should therefore be “the selected mechanical fixes are implemented,” not “all previous quality recommendations have been proven.”

## 2. What was actually tested

Evidence lives in `reviews/telemetry/gamer-pass4/`; screenshots and the comic-fit result live in `reviews/media/R1/gamer-pass4/`.

- **120 Normal simulations:** all 30 levels × seeds 1–4, authored route rhythm, no revives, existing expected-power model; generated-level policy uses active defensive skills. **108 wins, 12 losses, no crashes or timeouts.** Four seeds per level are diagnostic samples, not a population estimate.
- **48 boss sensitivity simulations:** six district bosses × seeds 1–2 × natural build / supplemental Knife 5 + Gloves / supplemental Cleaver + Gloves / supplemental Car Door 5 + helmet. These run the real approach before changing equipment at boss spawn. They retain the rest of the build and do not heal the player. Natural cases deliberately repeat 12 baseline cases. Supplemental cases are counterfactual sensitivity tests, not naturally earned builds or isolated-weapon comparisons.
- **31 sequential campaign attempts:** a fresh in-memory save, actual Level 1 simulation, then actual result settlement and earned progression through Level 30. Seed 42; one retry at L15 uses seed 43. All 30 cleared without revives. Auto-spend ready attribute points and affordable low-tier perks; no purchased gear upgrades and no focused rerolls. About **70.4 simulated minutes**, excluding all menus, comic reading and decision time.
- **Focused runtime probes:** all 17 base weapon families against the real training calculation; generated route identity and milestone inspection for all 30 levels; boss phase/windup capture.
- **Live browser inspection:** English L1 opening/restaurant/street, cards, a failure and its results; direct-entry L5 approach and brief boss entry; progression navigation and a draft upgrade; current cart/Car Door weapon fixtures; current Captain comic fixture and TR/EN fit audit. Desktop Chrome with a requested portrait viewport is not physical iPhone testing.
- **Comic layout audit:** 2,231 rows across both languages, zero flagged fit/overlap/overflow cases. This checks layout, not acting, plot continuity or comfortable reading speed.
- **Full regression suite: 48/48 suites passed, zero failures and no reruns reported.** See the evidence README and appended review packet. The initial sandbox run could not bind local browser-test ports; it was stopped and restarted with local-server permission. That environment restriction is not a game defect.

**Limits:** I did not manually complete all 30 levels, continuously watch all six bosses, or critically listen to the audio on a phone. Tool interaction gaps leave the live simulation running; my manual deaths are not difficulty statistics. Direct-entry L5 used an underdeveloped save and one revive solely to inspect the route, so it is excluded from the balance conclusions. Weapon/comic fixtures are identified as fixtures. The campaign harness leaves `l1Cleared` false; current code uses that only for the first L1 offer, so subsequent campaign levels are unaffected. Nightmare, rematch retention, phone thermals and uninterrupted human play remain acceptance work.

Snapshot HEAD: `4f5361dc0f5306a0243719a8afba9382d4c9e9d3`. The shared checkout contains substantial pre-existing uncommitted implementation work; the audit used that working tree. Source hashes are recorded separately. Nothing was committed or pushed.

## 3. Holistic flow and motivation

### The strongest version of this game

The central promise should be: **“I survive by understanding this particular city, and the people I meet change how I get home.”** This supports distinctive moment-to-moment play and a story that belongs to the mechanics. It is stronger than a generic endless stat climb with Istanbul pictures behind it.

The current city verbs already support that promise: lure a tram, move a counterweight, help someone through a passage, brace against a wave, cover Kaan, restore station lights. The next pass should make those actions legible and consequential, then vary the circumstances in which they are used.

### Where the flow can flatten

1. **The first two districts are disproportionately long.** Winning medians are 207.7 seconds at L4 and 225.1 at L9. Many later routes take 80–140 seconds. The L9 generated route exits around 320 m, while L11 exits around 143 m. Different lengths can be intentional, but the longest traversal currently arrives before the full companion/combat vocabulary. Inspect the stretches between authored beats before reducing whole levels.
2. **New props can disguise a familiar input loop.** Many milestones still reduce to approach point → stop in ring → wait → continue. Their effects differ, which is good. Their decision structure needs more contrast: lure, choose a lane, carry while threatened, escort at your pace, time a crossing, then deliberately enjoy a short quiet stretch.
3. **Builds reset faster than their identities consistently develop.** The earned campaign finished with an evolution in only two of 31 attempts, both early (L2/L3). The policy prefers weapons over passives and does not use focused rerolls, so this is not an evolution-rate estimate for humans. It is a useful novice-policy warning: a player can keep winning while missing much of the advertised transformation payoff.
4. **The experience often explains forward motion better than why the next attempt will be different.** “Try this pairing” is weak when the player already had it. “Your knife was rank 4; one more upgrade and a chest would have evolved it” is a specific next-run intention.
5. **Emotional beats share too much staging.** A joke, a bereavement and a crucial call need different timing, body language, sound and framing. Fitting all the words does not create those differences.

### A proposed pacing contract

For each district, author an emotional sequence: orientation → teach → complicate → combine → boss/payoff. For every level, name one decision that cannot be replaced by simply walking forward. Record where it is introduced, tested and rewarded. Preserve recovery after a difficult encounter; do not interpret “always exciting” as continuous maximum density.

Measure time between meaningful decisions, involuntary waiting, repeated mandatory actions, uninterrupted combat windows, and how much time remains after a build transformation. Use the measures to locate flat stretches, then watch humans there. Do not impose an arbitrary event every few seconds.

## 4. Prioritized findings for implementation

Priority below is a **slice-quality priority**. It does not mean every item is a crash or ship-blocking software defect.

### A4-01 — P1: restore a single truthful encounter/story contract

**Confirmed:** `dialogue/{tr,en}/story-levels.js` still has L10 instructions about a guide and flag. `story/story-data.js` delivers the L10 mid line. The actual authored encounter selects `bellkeeper` / The Tower Keeper in `sim/levels.js`, with `counterweights` and `charge` in `config-bosses.js` and `sim/galata-trial.js`. The L10 ending also refers to the guide going quiet, and both languages' H02b boss bark still tells the crowd to follow the flag. L15's bouquet warning similarly needs reconciliation with the dock-cart/rope-sweep encounter.

**Confirmed:** Turkish C05 tells Arda that the family left, to collect Dad's kitchen note, and that Mom is in Sarıyer. English C05 retains the older “say you ate / no strangers” exchange. English E5c rejects going north, while the current Turkish motivation is to collect the note first. At L30 the Turkish call explains a route warning; English retains a more vague “reason we couldn't wait.” Native writing can differ in phrasing and humor, but the player's essential knowledge and motivation should not silently diverge.

**Implement:** create a small per-encounter contract containing canonical identity, actionable mechanics, known story facts before/after, relevant props and payoff. Audit every emitted line against it, including legacy mid-run lines, boss barks and results. Rewrite each language natively from the shared beat; do not translate voice lines. Update scene art and names together when a boss identity changes.

**Acceptance:** at L5/10/15/20/25/30, both-language readers can correctly state who they fought, what threatened them and why Arda continues. No emitted tutorial references a removed mechanic. A small integration check verifies beat-to-current-encounter coverage; native readthrough handles meaning.

### A4-02 — P1: fix weapon taxonomy before balancing progression

**Confirmed:** `config-stats.js` defaults an unmapped weapon to `ranged`. The newer `sawblade`, `manhole`, `torch`, `olta`, `cardoor`, `slingshot`, and `chainsaw` families all take that fallback. Not all should be melee; each needs an explicit classification. The relevant concrete mismatch is Car Door/Chainsaw physical melee combat versus “Take out zombies with melee weapons” on Strength training.

The runtime probe gives **35 Strength XP for 100 Knife kills and zero for 100 Car Door or Chainsaw kills**, with other tally inputs held constant. Street-cart kills also need an explicit progression policy rather than an accidental result of weapon-source mapping. The `heavy` perk tag is separate again: neither Car Door nor Chainsaw is currently flagged heavy. Decide that deliberately and explain it; appearance is not a reliable taxonomy.

**Implement:** make training category, attack tags, damage source and applicable perks explicit for every base/evolved family. Validate completeness instead of silently defaulting new content. Define how environmental kills train Arda. Show the relevant tags and affected perks in weapon details.

**Acceptance:** every family and evolution has an intentional category; actual recorded kills produce the documented XP; a player can tell whether Brute Force affects their equipped weapon. Test representative source aliases and environmental kills, not only the configuration list.

### A4-03 — P1: tune encounter variance with earned builds

**Confirmed:** the 48-run probe contains a 9.8-second natural L15 boss kill with two windups and a 235.2-second supplemental Car Door L5 kill with 47 windups. In the latter, phase two did not start until about 172 seconds. These are different bosses/builds, not a claim that one upgrade universally makes combat 24 times slower.

The L15 build did see both signature attack types. The problem is the tiny opportunity to learn or feel a substantial showdown, not a missing attack event. Conversely, the L5 tail repeats the opening tram/bell pattern for almost three minutes. Increasing every boss's health would make the latter worse.

**Implement:** record damage by weapon against the boss, time in range, targeting choices, exposure use, interruption/knockback, phase timing and post-boss hazards. Reproduce those exact seeds first. Use earned melee, ranged, defensive and unfocused saves. Adjust exposure, approach resources, targeting or specific weapon interactions where the trace shows the cause. Treat inflated HP as a last resort. Preserve powerful rematch clears; avoid universal rubber-band scaling that cancels earned growth.

**Acceptance:** the six boss identities remain readable across builds; first encounters contain a meaningful learn-and-respond opportunity; weak builds can recover through skill; long tails do not repeat the same solved pattern for minutes. Set encounter-specific duration bands after human observation, then track tails, not just medians. One L20 counterfactual killed the boss and subsequently died to a bloater: review the victory boundary and clearly distinguish “boss dead” from “route safe.”

### A4-04 — P1: give bosses bodies that perform their mechanics

**Confirmed in the renderer/assets:** bosses largely use idle, two walk frames, a shared attack-windup pose, attack-hit for selected states, and hurt. Additional lean, squash, charge easing and effects exist. This is animation, but it does not yet provide authored full-body performance for each signature action. `art-raster-chars.js` maps the Captain to `boss_bigbro` (gold chain, white vest, sunglasses), while Tower Keeper uses `boss_keeper`. **Ticket Man is an exception:** `SirkeciFx.bossBody` overrides the generic atlas with bespoke idle/windup/landing images from the station cast sheet. His review should focus on transitions, signal performance and locomotion, not replacing a supposedly missing identity. Several other bosses rely more on overlays than body performance to distinguish their mechanics.

**Implement:** choose one boss as the animation quality reference, then apply the same standard to all six. Author anticipation → commitment → contact → recovery → phase transition → defeat, with planted feet, weight transfer, hand/prop contact and coherent facing. Protect attack readability from hurt-pose interruption. Use the current raster art route; replace retired art completely, per the project's art rule.

The Captain needs a captain's silhouette and an anchor-pull performance. Ticket Man's existing three-pose identity needs connected punch/check/signal performance and locomotion. The fisherman needs visible casting tension and reel recovery. The bride's veil, body and moving hazards should tell the same attack story. Do not solve these with more generic rings and particles.

**Acceptance:** watching without sound, a new viewer identifies the attack's start, commitment and recovery. In a dense phone capture, the boss body remains readable; the attack lands where the warning predicted. Review real-time footage and contact-frame stills on the minimum supported iPhone. Frame count alone is not the quality criterion.

### A4-05 — P2: vary the decision, not just the prop

**Confirmed structure; boredom is a hypothesis:** all 30 have authored identities, but many share ring-based interaction. L14 has three shutter interactions, L23 three sacks to deliver, L29 a sequence of light positions. These can be tense or can become chores depending on pressure and pacing.

**Implement:** keep one clear new verb per level. Make repeated steps change the tactical situation: a shutter reroutes a pack, a carried sack creates a choice of safe versus fast path, a light reveals where the next threat is coming from. Prefer two or three deliberate encounter variants for selected replay routes over random hazard stacking. First encounters should teach reliably; remix only after comprehension.

**Acceptance:** after a district, players describe its levels by different actions, not “the one with another bar to fill.” Cut or shorten any repeated step that adds neither a decision nor a payoff. Use the level-specific review below rather than redesigning every route.

### A4-06 — P2: make an intended build reach its payoff

**Evidence:** only L2/L3 ended with an evolved weapon in the earned campaign's weapon-preferring policy. Existing recipe hints and focused reroll already help; do not add duplicate systems. Later offers can still spread a build across several low-rank weapons.

**Implement:** expose the exact missing recipe step, let the existing focus stay understandable, and explain the trade between taking a new weapon and completing the current one. Evaluate offer dilution as the arsenal expands. Validate that a deliberately pursued build transforms early enough to use its new behavior in a substantial encounter. Keep improvisational builds viable; every run need not guarantee an evolution.

**Acceptance:** test focus-aware and unfocused human choices with earned saves. Log chosen intent, recipe opportunities shown, missing passive, evolution time and combat time after evolution. A player should be able to describe what changed in their play, not merely that damage numbers grew.

### A4-07 — P1: make progression numerically truthful and understandable

**Live and source-confirmed:** the Attributes page shows only each attribute's primary effect. A draft Strength point displays **Damage +2%**, while the configured benefit is **+1.5% damage and +2% knockback**. The formatter rounds to whole percentages. A global “Training points ready” total does not explain that points are restricted to the attribute that earned them.

**Implement:** show current → proposed values at adequate precision and secondary effects in an expandable detail. Name attribute-specific readiness. Explain prerequisites separately from the Street Cred purchase cost. Add a compact relationship explanation across run upgrades, permanent attributes, perks, mastery, equipment and district power. Keep the useful attribute/perk cross-links already implemented.

**Acceptance:** without coaching, players can explain what resets, what persists, how to earn the next desired upgrade, why one plus button is disabled while another is available, and which equipped weapons benefit. Preview and actual simulation agree at the displayed precision.

### A4-08 — P1: direct the important scenes rather than decorating dialogue

**Confirmed:** comics and in-game scripted sequences already exist. Do not add a second generic cutscene system. The opening, route events and boss defeat profiles are real. The remaining gap is scene-specific acting and continuity. `comic-raster.js` gives Arda/Mom/Kaan one alternate expression for several fear/anger/hurt moods; other moods commonly use their default portrait. In the Captain farewell fixture, Kaan appears composed and smiling while recalling his dead captain.

**Implement:** prioritize L1 escape, L15 aftermath, L20 meeting, L25 farewell and L30 call. Give each a shot intention, character pose, gaze, meaningful object, transition and sound cue. For L25, Kaan handling the apron or towel, avoiding eye contact, then deciding to walk is stronger than extra exposition. Keep combat silhouettes and comic identities consistent. Let a brief silence land before rewards; allow fast replay skipping after the first view.

**Acceptance:** viewers can recognize grief, suspicion and relief with text hidden. Watch the entire boss defeat → aftermath → reward → map transition, not isolated panels. No cheerful stock pose undercuts the intended emotion, and no reward sting interrupts the crucial line.

### A4-09 — P1 quality gate: make music respond and prove the mix on a phone

**Source-confirmed, not a listening verdict:** `main.js` starts gameplay with `run_calm`, switches to `boss`, and returns to `run_calm` on boss death. `run_intense` exists in `music.js` but is not selected by these gameplay events. Eight tracks and working routing do not yet create encounter or narrative scoring. Scene-specific motif work remains open in D106.

**Implement:** use a small explicit musical state model: exploration, sustained threat, boss, aftermath, dialogue and result. Introduce hysteresis/minimum dwell so the score does not flap with enemy count. Use an existing intense track or approved material before commissioning more. Plan cue boundaries, pauses and tails; avoid abrupt resets at every small transition. Develop the recurring home/phone motif across four decisive scenes, with a different emotional resolution rather than just different volume.

**SFX:** the prepared hammer/nail cues, quieter routine deaths and Car Door/cart impact work are improvements in implementation. Blowtorch still has a synthesized fallback. Assess the total scene: danger cue first, player action second, impact third, loot/ambient chatter lower. Distinguish wood, metal, flesh and acid without making every kill a loud special event.

**Acceptance:** physical iPhone speaker and headphones, low and normal volume, dense combat, incoming call/lock/resume, music off and SFX off independently. Identify boss warnings by ear, hear soft story lines after combat, and verify that music resumes correctly. Record clipping/masking and compare before/after captures. No claim of Hades-quality music is justified by file presence or successful decode alone.

### A4-10 — P2: make failure useful and victory personally rewarding

**Live-confirmed:** after my L1 failure with Knife 4 and Work Gloves already selected, results advised “Next run, pair Döner Knife with Work Gloves.” `ui-progress.js` chooses that generic advice for every non-evolved recipe state. The run had earned attribute training, but the result emphasized zero Street Cred, no new district and zero distance; useful progress was visible only deeper in growth.

**Implement:** advice must distinguish missing weapon, missing passive, insufficient rank, waiting for a chest and already-evolved builds. Link a specific next action. Surface meaningful training/mastery gains from a loss. On a boss win, connect the reward to a visible result in the city, then show the gained capability and next destination. Preserve the neutral optional-bonus treatment.

**Acceptance:** no recommendation tells the player merely to acquire a pairing already owned. A failed run answers “what improved?” and “what will I try differently?” A boss win answers “what changed because I won?” Retry remains immediate; narrative and upgrade screens do not force a long funnel before another attempt.

### A4-11 — P2: make the excellent street-weapon idea intentional

**Confirmed:** eligible carts auto-grab when Arda stops close to one with an enemy nearby for **0.22 seconds**. Holding the cart reduces movement to **72%** and runs a three-swing/throw sequence. In the cart fixture the nearby affordance still said “Hit to break,” while the fixture instruction said to stop beside it. This is a mismatch between the shared prop affordance and the new action; confirm its ordinary-route manifestation too.

**Implement:** differentiate loot cart, explosive prop and usable street weapon before contact. Add a readable contextual pickup/commitment cue using the existing one-thumb vocabulary. Test a deliberate hold versus accidental joystick release; define cancel/escape behavior. A powerful flourish should feel chosen and should not unexpectedly replace a player's defensive response.

**Acceptance:** new players intentionally trigger it, understand why movement changed, and can still evade. Measure accidental pickups in tight passages. Verify Strength/mastery policy for street kills and that no contextual prompt instructs a conflicting action. Keep the satisfying lift/throw reactions already added.

### A4-12 — P1 acceptance gate: finish the actual mobile product experience

This is an unclosed validation gate, not a claim that a phone defect was reproduced. Desktop screenshots and simulations cannot establish touch feel, sustained frame pacing, thermal behavior, haptic quality or the audio mix.

**Implement/verify:** minimum-device profile; one-thumb reach and left/right-handed use; thumb occlusion of lower-right objectives; HUD/speech/telegraph priority during dense combat; large text; color-independent hazards; reduce-motion/reduce-flash behavior; pause/background/resume; save recovery; offline/cold asset readiness; first-launch and replay transitions. The current three active controls make one-thumb reach a real test requirement.

**Acceptance:** record frame-time distribution and worst stalls through repeated boss/route runs, not just average FPS in a quiet scene. Agree the device and frame budget before signing off. No damage or save loss during interruption. Critical warnings remain legible under effects and the player's thumb. Asset failures do not silently return retired art to ordinary play.

## 5. All 30 levels: specific review and next action

`Clear` = wins/4, Normal expected-power simulations, seeds 1–4, no revive. `Time` = median seconds among winning runs, including simulated combat/travel and excluding UI/reading time. These medians deliberately differ from some CLI summary rows, which use a different median convention and include losses. Rows are diagnostic; the recommendation is not a claim that the level is broken.

| L | Current identity | Clear / Time | Specific improvement or acceptance focus |
|---:|---|---|---|
| 1 | Restaurant escape, first street and cook | 4/4 · 137.3 | Keep fixed exit guidance. Teach the difference between a safe breakable and an explosive before the player auto-attacks one under pressure. Failure should expose earned training and the exact recipe shortfall. |
| 2 | Tram stop and Switchkeeper | 3/4 · 178.6 | One crawler death. Check shelter/track teaching and whether the mini-boss reads as a new problem after the cook. Make safe positioning visible before pressure rises. |
| 3 | Cart route plus optional weaponized tram | 4/4 · 190.5 | Strong signature candidate. Observe whether players discover luring and understand an empty sweep; do not require the optional stunt to progress. Distinguish this cart from the new handheld cart mechanic. |
| 4 | Live wires and Linekeeper | 4/4 · 207.7 | Long early route with low damage pressure in this sample. Trim uneventful lead-in, not necessarily the wire puzzle. Each cut should visibly change the safe path or enemy movement. |
| 5 | Depot crank and Vatman | 2/4 · 153.2 | First district-boss difficulty spike; both losses to Vatman. Reproduce seed 2 and the 235-second supplemental-door tail. Separate learnable tram/bell response from attrition. Pay off the opened route visibly. |
| 6 | Galata hoist | 4/4 · 117.0 | Good length contrast after L5. Make counterweight movement physically explain the passage opening; teach the spatial idea that will matter at L10. |
| 7 | Musician escort | 4/4 · 155.4 | Protect pace agency: clear “waiting for you / threatened / moving” states. Make staying to help an active protection decision rather than following a slow meter. |
| 8 | Bell diversion | 4/4 · 165.0 | Show enemies responding to sound. Replace legacy flag-focused instructional emphasis where it conflicts with the level's main verb. Let players exploit the diversion. |
| 9 | Weight and footbridge | 4/4 · 225.1 | Longest winning median. The footbridge occurs well into a roughly 320 m route. Watch the before/after stretches for repetitive travel; strengthen the release/payoff or shorten the flat portions. |
| 10 | Tower Keeper, counterweights and charge | 4/4 · 147.9 | Correct guide/flag dialogue and ending first. Natural seed boss times 32.7 vs 124.2 seconds show build sensitivity. Give the keeper a body performance tied to the suspended weights. |
| 11 | Cargo hook | 3/4 · 80.5 | Large pace compression after L9/L10; one runner death. Make hook alignment and the resulting physical route change unmistakable rather than a blink-and-miss unlock. |
| 12 | Ferry mooring | 4/4 · 137.2 | The ferry wait and two packs should have visible progress and a tactical change. Paşa's warning should reveal useful information, not just repeat a bark. |
| 13 | Tram points | 2/4 · 157.5 | One gas-canister death and one bloater death. Highest authored station pressure in this district. Inspect overlapping explosions and the recovery path while using the points; don't simply reduce all damage. |
| 14 | Three fish shutters | 4/4 · 136.5 | Prevent three copies of the same hold. Each shutter should change approach, line of sight or crowd routing; cut a step if the decision does not change. |
| 15 | Dock ramp and Bride | 4/4 · 111.3 | Natural seed 1 boss dies in 9.8 seconds; earned campaign needed its only retry here. Strong variance. Align bouquet language with actual cart/rope mechanics and let the wedding aftermath breathe. |
| 16 | Bridge rods | 4/4 · 90.4 | Introduce a changed movement problem as well as a changed background. Clearly distinguish snagging line from ordinary obstacle collision. |
| 17 | Bridge rescue | 4/4 · 93.1 | Rescue should visibly create a human consequence and explain its heal/reward. Avoid turning the person into just another proximity pickup. |
| 18 | Wind screens, lower deck, first Kaan tension | 3/4 · 99.1 | One runner death. Make screen placement/gust safety readable while Kaan speaks; do not stack an important line over a new threat's only teaching window. |
| 19 | Brace against bridge waves | 2/4 · 124.0 | Acid/toxic deaths, not wave deaths. Inspect slow/zone overlap during required bracing and whether a genuinely safe recovery position remains. Keep the wave as a crowd-clearing tool. |
| 20 | Bridge lift and Fisherman; Kaan joins | 4/4 · 135.4 | Casting/reeling is a sound distinct mechanic. Show tension, miss and punish window in the body. Verify post-kill hazards before the join scene; make two people leaving feel different from one arriving. |
| 21 | Market awning | 3/4 · 92.5 | One brute death. Let Kaan's presence be felt promptly. The awning should provide a clear spatial effect rather than another abstract use circle. |
| 22 | Push market cart | 4/4 · 97.9 | Distinguish escort-cart movement from handheld street-cart combat. Jam/blocked feedback should say what the player must do, with no invisible waiting condition. |
| 23 | Carry sacks with Kaan cover | 4/4 · 141.2 | Preserve reciprocal Dash opportunity. Test discoverability within the short window; carrying three sacks must produce evolving pressure, not three errands. Reward a successful rescue acknowledgment only when earned. |
| 24 | Market signal and crossing trolley | 4/4 · 102.4 | Make the moving trolley's danger/reward and safe lane visible. Avoid recycling the same hold input without a timing or positioning decision. |
| 25 | Market gate and Captain | 4/4 · 130.2 | Natural seed boss 56–79 seconds: not uniformly trivial. Anchor/dust interplay is promising. Give the Captain the right silhouette and Kaan a genuine farewell performance before celebratory results. |
| 26 | Station departure | 4/4 · 93.7 | Introduce the station's rule through the departing train and visible space it leaves. Retain readable warning and no surprise collision while the camera is busy. |
| 27 | Station guide | 3/4 · 84.7 | One brute death. Differentiate from the musician escort: protect a crossing or coordinate movement, rather than reuse a follow-distance test with a different costume. |
| 28 | Fuse and station clock | 3/4 · 120.3 | One brute death. The clock restarting can be a strong audiovisual payoff. This was the first earned Intelligence rank in the campaign policy: inspect training opportunities and explanations earlier in the slice. |
| 29 | Station lights sequence | 4/4 · 119.2 | A sequence can feel memorized on replay. Make each light reveal information or a changed threat; ensure dark areas don't conceal untelegraphed damage. Test color-independent readability. |
| 30 | Station points and Ticket Man; phone call | 4/4 · 116.2 | Polish Ticket Man's bespoke three-pose body/prop transitions. Resolve the TR/EN call discrepancy. End the vertical slice with a completed local arc and a concrete next destination; the 12 km remaining should be a promise, not an anticlimax. |

## 6. Boss progression, challenge and reward

All six current bosses have distinct implemented attack logic. They are not merely six identical health bars. However, **mechanic progression, visual identity and narrative identity must agree** before the sequence feels authored end to end.

| Boss | Natural seeds 1/2: boss time | Full sensitivity sample: kill-time range | Desired learning progression / payoff |
|---|---|---|---|
| L5 Vatman | 48.5 s / loss | 43.1–235.2 s | Read lane and bell; reposition, then punish. The tram line becomes passable. |
| L10 Tower Keeper | 32.7 / 124.2 s | 19.3–124.2 s | Read staggered drops, then charge/recovery; use the hoist/weight vocabulary established in the district. |
| L15 Bride | 9.8 / 51.8 s | 9.8–51.8 s | Combine moving-lane hazards and radial sweep; wedding props, body and sound share an identity. Quiet aftermath gives Paşa's companionship meaning. |
| L20 Fisherman | 43.2 / 33.8 s | 18.4–43.2 s | Manage line/net and punish a miss. Kaan's join is the substantial reward, with visible help afterward. |
| L25 Captain | 78.9 / 56.3 s | 38.4–78.9 s | Exploit anchor/dust interaction; Kaan's assistance and loss connect the encounter to a person. |
| L30 Ticket Man | 49.8 / 44.5 s | 26.2–50.6 s | Combine punch and station signals; restore passage and earn the call's concrete revelation. |

Ranges include supplemented builds and only two seeds per variant; one L20 kill was followed by a route loss. These are measured sensitivities, not recommended target ranges. Full data includes attack counts and phase changes.

A boss should reward **understanding**, not only ownership of a stronger loadout. Track whether players notice and exploit the punish window. Preserve the joy of a powerful build deleting a rematch. For a first showdown, establish the character and threat before the health bar can disappear. If a weak build takes too long, offer a readable skill-based opening or environmental opportunity rather than requiring a better account.

After victory, use one coherent sequence: final contact → distinctive defeat → short safe aftermath → relevant human/route payoff → concise reward → next intention. Existing defeat profiles already distinguish rails, bell, ribbons, tide, crates and tickets. Improve their integration with the scene rather than adding a disconnected generic victory movie.

## 7. Progression information architecture

The player needs one understandable chain, not six apparently unrelated systems.

| System | Earned/changed by | Persists? | Explain its role |
|---|---|---|---|
| Adrenaline and weapon/passive ranks | In-run XP, offers and chests | Resets each level | This run's build; recipe and next transformation |
| Attributes | Specific play actions fill that attribute's training bar; allocate its ready point | Yes | Permanent statistics and perk prerequisites |
| Street Cred / skill tree | Lifetime kill milestones; spend Cred once prerequisites are met | Yes | Selected rules/bonuses, distinct from attribute training |
| Weapon mastery | Use the weapon, according to its actual mastery rules | Yes | Familiarity with that weapon; show exact next benefit |
| Gear | Equip and upgrade with the game's currencies/materials | Yes | Account/loadout benefits, including costs and comparisons |
| District power | Clear a district | Yes | Automatic reward for journey progress |
| Kaan bond | Shared play and authored relationship events | Yes | Relationship-earned support; never presented as a bought perk |

Actual configured attribute benefits per rank:

| Attribute | Effects that the player should be able to inspect |
|---|---|
| Strength | +1.5% damage; +2% knockback |
| Pace | +1.5% move speed; 1% dash cooldown reduction |
| Aggression | 1.5% weapon cooldown reduction; +0.1 percentage point crit chance |
| Intelligence | +2% hack speed; +1% pickup; +0.5% XP |
| Charm | +2% civilian help; +1.5% coins; +1% luck |
| Grit | +1.5% max HP; 1% incoming damage reduction |

These are configuration contributions, not a promise that every final combined stat stacks linearly without caps. Display final effective values where stacking/caps matter. “Weapon speed” and “cooldown reduction” should use a consistent convention; 10% shorter cooldown is not exactly 10% more attacks per second.

**Important balance-model discrepancy:** at L30 the expected model spreads attribute ranks evenly (rank 2 each). The earned campaign ended at **Strength 6 / Pace 6 / Aggression 6 / Intelligence 1 / Charm 2 / Grit 4**, with eight purchased perks. Intelligence first reached rank 1 at L28. Policy and activity choices cause this skew, but it demonstrates why a balanced-looking expected loadout is insufficient evidence. Maintain multiple earned profiles and test opportunities to train desired stats, not just average power.

Menu priorities: keep one prominent next-play action; show a ready growth point without making upgrades mandatory; distinguish a preview from a committed purchase; preserve scroll/focus when following cross-links; explain locked content with the next actionable prerequisite. On the slice endpoint, distinguish the first 30-level experience from the full 100-level chapter shown on the map.

## 8. Component audit beyond levels

| Component | Current judgment | Concrete finishing work |
|---|---|---|
| Fighting animation | New Car Door sweep/throw and lifted reactions visibly have more character; dense fixture still piles bodies/effects around Arda | Judge silhouette and contact with effects reduced; verify hand anchoring, footwork and return to locomotion for the important attacks |
| Graphic effects | Useful semantic warnings, impact reactions and distinct defeat effects exist | Establish priority: lethal warning > hero/boss pose > actionable pickup > spectacle. Keep optional quality reduction from obscuring the rules |
| Consumables | Heal/power/currency/objective have color plus icon distinctions, actual-heal feedback and used-station states | Make capped healing understandable before a risky pickup; inspect full-health pickup behavior and whether the player can preserve useful healing |
| Healing economy | Drop healing is capped at 70 from L2; boss-arena heal is a separate uncapped 25 | A heal that restores nothing can feel dishonest despite “CAP” feedback. Explain/telegraph availability, then test L13/L19 and boss-entry attrition |
| Street props | Cart and door are a promising authored physical language | Resolve activation/tag/affordance gaps; use a small coherent set of interactions before adding more props |
| Dialogue | Turkish motivation is more concrete; humor and local objects give voice | Reconcile emitted lines with mechanics and canonical facts in both languages; control repetition and suppress low-priority barks during critical instructions |
| Plot | Going home, Dad's note, Paşa and Kaan supply continuity | Make every five-level payoff change knowledge, relationship or plan. Avoid withholding the same answer through repeated static interruptions |
| Comics | Current raster illustration and typography are present; fit audit clean | Scene-specific acting, useful wide shots, props and eyelines; avoid default bust composition for every emotional register |
| In-game cutscenes | Already present as opening, route moments and boss defeat beats | Direct five key transitions; keep control handoff clear, protect against damage while control is withheld, and respect replay skip |
| Music | State routing exists but exploration pressure is not expressed by `run_intense` | Implement cue state logic, four-scene motif and physical-phone acceptance |
| Sound effects | Prepared attack cues and differentiated impact behavior exist | Critical listening for masking, repetition, material identity and the quieter death mix; verify resume behavior |
| Results | Optional bonus is clearer and retry is direct | Contextual recipe advice, visible training/mastery progress, specific boss payoff and next-run intention |
| Accessibility | Existing options and layout checks are useful | VoiceOver focus/inert overlays, enlarged text, non-color warnings, one-thumb reach, motion/flash reductions under dense actual gameplay |
| Technical integrity | Simulations completed without crashes/timeouts; full suite separately tracked | Phone frame pacing, background/save behavior, cold-load assets and interaction reliability remain necessary |

## 9. Three “wow” moments worth finishing first

These extend current systems within the slice. Build and review one complete moment before multiplying it across the game.

**1. The city becomes your weapon — L3 tram.** The crowd follows Arda onto the rails; the player commits at the switch, hears a spatial bell, sees the lane clear, and watches the tram cut through the enemies they personally gathered. Follow the impact with a tiny quiet beat and a visible open path. A modest camera move may help, but control and the safe lane must stay readable. Reward the actual crowd interaction; do not stage fake kills. Existing implementation is the starting point, not a request to rebuild it.

**2. A friend remembers what you did — L23 to L25.** This is a proposed extension: currently L23 stores reciprocal success on the run's support state, while L25 selects its covered ending from `run.kaanCovered` in that L25 run; it does not remember the specific L23 rescue. Persist only the small authored fact needed for this callback. Kaan creates breathing room while Arda carries; Arda uses the reciprocal Dash to pull a real threat off Kaan. At L25, the remembered help changes a line and physical gesture, then Kaan's farewell uses the towel/apron as an emotional object. The payoff should be recognizable without a bond-number pop-up. Keep the missed-help route emotionally valid and mechanically completable.

**3. The city briefly listens — L28 clock to L30 call.** The restored clock gives an unmistakable sound and visible motion. At the end of L30, station noise falls away and the home motif returns under a call that conveys a new actionable fact. Arda and Kaan choose the next route together. This turns a repaired prop, a boss and a phone conversation into one remembered episode. Use a short scene with deliberate silence; no long mandatory movie.

A fourth candidate, **the cart heft/throw**, can become the recurring combat signature after activation and animation-readability work. Its value is that players can cause it, not that it happens only in a trailer.

## 10. Implementation order and acceptance packet

| Order | Work packet | Deliverable before moving on |
|---:|---|---|
| 1 | Truth and continuity: A4-01, A4-02, numerical portion of A4-07, contextual advice in A4-10 | Correct current encounter text in both languages, complete taxonomy, truthful upgrade previews, targeted integration checks |
| 2 | Balance: reproduce A4-03 extremes and L13/L19 overlaps; examine A4-06 | Side-by-side traces from earned saves, explained root causes, focused adjustments and before/after simulations |
| 3 | One boss + one scene as quality references: A4-04/A4-08 | Actual-phone real-time capture of attack anticipation/contact/recovery and Captain aftermath; art review per design system |
| 4 | Apply proven presentation standard to remaining five bosses and key scenes | Consistent identity, readable mechanics and directed defeat-to-reward transitions |
| 5 | Music, SFX and street-weapon intention: A4-09/A4-11 | Mixed phone captures of one quiet, one dense, one boss and one story scene; discoverability observation |
| 6 | Route pacing and replay variety: A4-05, level table | Cut flat stretches; selected authored variants; evidence that players make different decisions |
| 7 | Integrated acceptance: A4-12 plus voluntary replay | Full first-30 journey recordings, comprehension results, device performance and return-intent observations |

For each packet: state the player problem, exact behavior changed, files/parameters touched, deviations from intended design, evidence and what remains unproven. Follow the repository's review workflow. A passing mechanical test does not close an art, audio or emotional-impact item. A screenshot does not prove smooth animation.

### Human playtest that can support a stronger verdict

Use a small formative group of new players with varied experience, plus returning players who know the previous build. This is a qualitative discovery round, not a statistically powered retention experiment.

- Observe fresh L1–5 without coaching. Ask the player to explain their next upgrade, the boss's punish window and why Arda is going home. Record confusion before explaining anything.
- Use legitimately earned saves for targeted L9/10, L13/15, L19/20 and L23–30. Include melee-focused, ranged, defensive and unfocused histories. Do not use an unlock-all save to certify progression balance.
- Ask after each district: “Which moment do you remember?”, “Where were you waiting?”, “What would you try differently?” Let players stop. Observe whether they voluntarily start another run and what they intend to do in it.
- For bosses, ask players to predict an attack after seeing it once and identify the recovery window. Record unexplained hits, time spent repeating a solved pattern and emotional reaction to the payoff.
- For upgrades, ask players to demonstrate the path to one desired perk and explain what resets. For cart/tram/Kaan moments, observe intentional use rather than prompting the correct action.
- Have a follow-up session after a break. Measure what players remember and choose to replay; then run a broader retention study if the formative results justify it. Do not equate polite praise or a completion rate with returning demand.

The next review should be able to say **what became clearer, more expressive, more skillful and more memorable**, supported by captures and player behavior. That is the path toward the requested studio-level impression.

## 11. Source entry points and visual evidence

- [Training categories and effects](/Users/o0o02dn/Documents/istanbul/prototype/js/config-stats.js:20); [attribute display/rounding](/Users/o0o02dn/Documents/istanbul/prototype/js/meta/meta-stats.js:17).
- [Encounter selection](/Users/o0o02dn/Documents/istanbul/prototype/js/sim/levels.js:488); [current boss definitions](/Users/o0o02dn/Documents/istanbul/prototype/js/config-bosses.js:48); [emitted story beats](/Users/o0o02dn/Documents/istanbul/prototype/js/story/story-data.js:164).
- [Turkish level dialogue](/Users/o0o02dn/Documents/istanbul/prototype/js/dialogue/tr/story-levels.js:1); [English level dialogue](/Users/o0o02dn/Documents/istanbul/prototype/js/dialogue/en/story-levels.js:1).
- [Generic boss poses](/Users/o0o02dn/Documents/istanbul/prototype/js/view/art-raster-chars.js:58); [Ticket Man's dedicated override](/Users/o0o02dn/Documents/istanbul/prototype/js/view/sirkeci-fx.js:55); [comic expression selection](/Users/o0o02dn/Documents/istanbul/prototype/js/view/comic-raster.js:63).
- [Gameplay music selection](/Users/o0o02dn/Documents/istanbul/prototype/js/main.js:156); [result advice](/Users/o0o02dn/Documents/istanbul/prototype/js/view/ui-progress.js:114); [cart pickup commitment](/Users/o0o02dn/Documents/istanbul/prototype/js/sim/street-weapon.js:35).
- [Kaan reciprocal action](/Users/o0o02dn/Documents/istanbul/prototype/js/sim/kaan-support.js:60); [expected power assumptions](/Users/o0o02dn/Documents/istanbul/prototype/js/config-power.js:18).

![Live attribute draft: Strength displays +2% while the config grants +1.5%, and knockback is not listed](media/R1/gamer-pass4/growth-proof.jpg)

![Current Car Door rank-five sweep in the explicitly invulnerable 96-enemy weapon fixture](media/R1/gamer-pass4/cardoor-five.jpg)
