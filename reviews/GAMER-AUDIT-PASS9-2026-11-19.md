# Player experience audit, pass 9

**19 November 2026 · First 30 Bölüms · Independent review of the executed Audit8 brief, §§0–7.**

**Verdict: meaningful progress, but not a masterpiece and not ready for expansion approval.** The implementation has closed several real defects and made the game's strongest ideas more tangible. It has not fulfilled every requirement at the level the player experiences. Two ordinary-flow UI failures remain, boss movement still lacks sufficiently specific physical acting, and the transitions between fighting, story and continuing are not consistently convincing.

The gap between technical sophistication and felt quality has narrowed. **It still exists.** The next investment should concentrate on complete, readable encounters and transitions. A further blanket feature or asset count increase will not resolve it.

Companion documents: [all 30 levels, ten bosses and complete combat roster](AUDIT9-LEVELS-AND-ASSETS-2026-11-19.md) · [requirement closure, evidence and acceptance plan](AUDIT9-CLOSURE-AND-VERIFICATION-2026-11-19.md).

## 1. What this audit actually establishes

- Played a fresh English L1 through opening, ordinary combat, Cook, defeat/revive, earned evolution, comic, results and progression; purchased an earned attribute rank, inspected Perks/Gear/Arsenal/Memories, then followed the broken replay into L2. Ordinary controls, no debug progression grants. One Second Wind and one free prototype revive were used. Tool-related idle time makes this unsuitable as a human difficulty/time benchmark.
- Independently ran the earned broad campaign: **30 clears in 35 attempts, five losses, no Second Wind/revive**. All 35 simulation result objects reproduce the supplied final broad campaign. Reviewed the other three supplied campaign policies and their losses separately.
- Independently accounted for all **50 passing test groups**. The first isolated full-suite command had one infrastructure failure because repository art-prompt dependencies were not copied. After copying those nonruntime dependencies, the affected group passed. No game/test code was changed to make it pass.
- Inspected sampled frame sequences from all 30 world actions, ten bosses, all 17 base weapons at ranks 1/3/5, all 18 evolutions, 16 enemy fixtures, earned L20/25/30 scenes, accessible health feedback and crowded/contact fixtures; reconciled source and event traces. These are **sampled recordings, not a claim of continuous normal-speed viewing of every movie**.
- This is not a complete manual 30-level playthrough, a physical-iPhone test, an audio listening review or unfamiliar-player research. It cannot establish enjoyment, retention, phone comfort or Hades parity. Those acceptance gates remain open.

The played/tested frozen runtime contains 1,125 files matching manifest `81a885795a562dd930b3428f5531548de69f03b6119ba7c2e4d19d5e587c3ce3`, based on dirty HEAD `4f5361dc0f5306a0243719a8afba9382d4c9e9d3`. Later opening-rendering, dialogue/context and comic-audio edits arrived during the audit. They are separately source-reviewed, not retrospectively included in the play/test verdict. See the [timestamped comparison](telemetry/audit9/final-runtime-check.json) and [follow-up diff](telemetry/audit9/working-tree-followup.diff).

**Scope fairness:** N1 earned alternative starting weapons, N2 a new environmental boss-counter mechanic and N3 curated replay variants were explicitly deferred in the executed prompt. Their absence is not failed implementation. They remain possible later design decisions.

## 2. The holistic experience

There is a coherent game here: Arda improvises his way through a recognizable city toward home; useful street objects create openings; Kaan changes the journey from solitary survival into a relationship. The strongest progress is that those ideas now have more real consequences. The cart can clear pressure, placement can protect a route, a trolley can hit actual enemies, and helping Kaan can earn a later acknowledgment. The player has reasons to care beyond an expanding damage number.

However, too much of the journey still has the same perceived sentence: walk up a broad lane, arrive at a required ring, hold, read a completion banner, collect another upgrade, continue. The underlying mechanisms differ more than the decisions visible to the player. Bosses interrupt that grammar mechanically, but several still communicate more through floor shapes and instructions than through their bodies. Story scenes now get an unobstructed stage, yet the people do too little on that stage, and control sometimes returns into a contradictory mood.

For the Hades northstar, the relevant quality contract is specific: action has weight and readable intention; a build changes how an encounter is approached; characters react to actual events; victory and failure alter the emotional context; menus make the next experiment understandable. This is a design target, not a measured comparison or a request to copy another game's controls.

| Dimension | Has my assessment changed? | What still prevents acceptance |
|---|---|---|
| Repetition | Some improvement: physical consequences and shorter repeated work are real | Repeated corridor/ring/banner grammar; relief is often a spawn delay rather than a perceived change in pressure; route differences can remain text-first |
| Boss identity and balance | Better silhouettes/poses, real different policy tests, repaired Keeper access, improved early attack ordering | Shared acting grammar, weak action-specific contact, some signatures disappear in short fights; first-time human learning remains unproven |
| Build payoff | Substantial functional improvement: all 18 evolutions acquired in focused earned trials and used on real targets | Natural discovery still narrow under tested policies; some payoffs late; planning is buried; contact/FX can hide the transformation |
| Emotional presentation | Major improvement: world acting precedes the dedicated comic, combat invitations yield, Kaan has new poses | Arda's damage blink persists in a scene, staging ignores walkable surfaces, reactions are minimal, L20 companionship fails at the playable handoff |
| Clarity and polish | Correct Mom portrait, clearer benefits, improved Gear and active-skill hierarchy, proper Nail Gun identity | Broken compact build layout, obstructed Memories replay, competing prompts, crowd/effect occlusion, rank-zero mastery preview still insufficient |
| Verification quality | Much stronger: source identities, active recordings, actual choice/help events, real policy differences and conditional effects | Rendered navigation/state combinations escaped tests; no complete unfamiliar-player, audible or physical-phone acceptance |
| Reason to return | A more promising foundation: permanent growth, build planning, remembered help and story continuity | No evidence yet that people voluntarily return; don't confuse completing a scripted campaign with wanting another run |

## 3. Your ten concerns, answered directly

| Your concern | Current answer | Next treatment |
|---|---|---|
| 1. Arda/zombie running; boss bodily quality | Arda's movement is visibly better and suitable as the working baseline. Detailed ordinary-zombie reanimation remains low value. Boss acting is improved but not at the same credibility | Preserve Arda. Invest in boss-specific footwork, weight, turning, tool release and recovery. No universal dash requirement |
| 2. Object and healing interaction clarity | More physical action and truthful health feedback exist; full-health food is intentionally saved. Useful world outcomes are now recorded | Make the affected space/HP change the focal result. Remove verb conflicts, remote optional invitations and generic reach gestures where they obscure causality |
| 3. Health loss/navigation cues | Damage, restored HP, block and critical state have distinct treatments; they are no longer absent | Test simultaneous cues on mute at phone scale; prioritize hero and immediate danger. A minimap is not the default remedy |
| 4. Frenzy/boss tension without sound | State treatments and entry protection exist. Cleaner aftermaths help | Strengthen contrast between pressure and release, actor behavior and local environment. Persistent full-screen brightness or repeated zoom would dilute the effect |
| 5. Bosses unlike ordinary zombies | Mechanically more distinct, and several pattern/access defects improved | Prove a first encounter lets the player recognize, answer and exploit a signature. Shorter strong-build rematches are fine. No hidden counter-scaling or blanket HP increase |
| 6. Visible enemy variety | All role fixtures now advance; role differences are present | High-priority attackers must remain identifiable in legal dense builds. Improve source/pose/contrast before adding detail to every limb |
| 7. Arda and enemy progression | Earned no-spend paths clear all 30 under several policies, including banked attribute/perk spending | Audit where failure happens, the lesson available and retry adjustment. These systematic bots do not establish novice fairness |
| 8. Monetization | The agreed optional model is intact; a free progression path is supported | Preserve it. No difficulty wall designed to force ads or currency purchases; no SDK work needed for this corrective pass |
| 9. Weapon engagement | Knife ownership, chain continuity and chainsaw grip improved; Cable remains a strong identity | Chainsaw still reads too much like a rigid projecting bar; improve bite/recoil/return. Control Cleaver/foam/fire clutter. Review the complete roster, with selective repairs |
| 10. Cutscenes as connective tissue | Real progress: protected world acting and reading now have separate space | Complete the physical emotional exchange and its playable departure. A scene that promises togetherness must not return to unexplained solo combat |

## 4. Findings and concrete closure criteria

### P9-01 · High · Earned weapon mods break the ordinary upgrade layout

**Confirmed in live play.** After Knife rank 3 with Heavy Blade, the next upgrade's compact build shows the mod one letter per line in a very narrow slot. Rank 5/Splinter Spray worsens the vertical growth and clipping. This happens at default text settings, before accessibility extremes. A central reward moment looks broken.

[Observed layout](media/R1/audit9/L1-heavy-blade-vertical.jpg) · [later clipping](media/R1/audit9/L1-upgrade-clipping.jpg). Relevant source: `prototype/css/proto.css` compact 12-column build and chip wrapping; `prototype/js/view/screens.js` `slotTags`.

**Repair:** keep the compact row for icons/counts; give selected-weapon mastery/mod details an intentional readable surface or bounded wider row. Preserve full descriptions in accessible details. Ensure the heading, three choices, reroll and build inspection can all be reached at supported sizes. Do not “fix” this by shrinking all type or hiding the currently selected build.

**Close when:** a real earned rank-3 and rank-5 build, several mods, evolved family and six populated weapon/passive slots render without vertical letter strings or unreachable controls at 390×844 and the supported minimum, TR/EN, default and largest text. Check actual visible/hittable UI, not just DOM existence.

### P9-02 · High · Memories replay opens behind the hub and leaks into the next run

**Confirmed in live play.** The first earned story appears in Memories, with a valid thumbnail and collection count. Selecting “Read Memory Again” creates the comic underneath the still-visible hub. The Skip action is covered. Returning to the map and launching L2 exposes the old L1 comic while the L2 run starts behind it.

DOM inspection found `.cm-page` at z-index 60 and `.meta-root` at 100; hit-testing returned the hub above the comic. `meta-hub.js:160` directly calls `P.Comic.page(it.n)`. The existing archive test substitutes a stub for `Comic.page`, so it proves saved eligibility/reward behavior, not a usable replay.

[Obscured replay](media/R1/audit9/memory-replay-obscured.jpg) · [stale L1 comic after L2 launch](media/R1/audit9/memory-leaks-into-L2.jpg). The L2 intro toast over that comic was observed live; the saved image was taken after the toast faded.

**Repair:** make replay an explicit presentation state with an owner and return destination. Suspend/hide the hub correctly, block launching gameplay behind it, and remove/close the comic on exit. Raising one z-index alone is insufficient lifecycle repair.

**Close when:** fresh L1 → result → Memories → actual readable replay → close/back → correct hub → reload → replay → map → L2 works. No duplicate rewards, stale overlay, input capture or advancing run behind the page. Include normal completion and hold-to-skip.

### P9-03 · High · Boss assets improved more than their continuous acting

Seven new eight-pose atlases are meaningful work; Cook, Captain and Ticket Man retain more specialized authored parts. Feet and silhouettes are more credible. Captain's chain/body relationship remains one of the strongest examples. The issue is how the poses become a physical action.

For the seven atlas bosses, `boss-acting.js` selects two walk poses, one common windup pose for every attack, a commitment pose, a common recovery and defeat. Contact/tip points are derived from frame proportions. Different attack families therefore still share much of the same body explanation. This source limitation supports the sampled impression; frame counts alone cannot quantify smoothness.

**Repair:** author action-specific timing and contact anchors. A hook loads and releases from its hand; a rod flexes and pays out; a relay is manipulated toward its cable; a weight is braced and loses tension. Feet/hips turn before a committed strike and settle afterward. Align everything with the actual aim lock, release, hit geometry and recovery. Keep scale constant and show source before floor danger.

Use the [ten-boss table](AUDIT9-LEVELS-AND-ASSETS-2026-11-19.md#2-boss-identity-and-balance) as the shot/encounter contract. Do not turn all bosses into agile runners, add decorative attacks or force arbitrary phase HP locks.

**Close when:** normal-speed, full-phone first encounter and rematch show a readable preparation → actual action → spent/recovering body → reachable response. Inspect clean contact and ordinary crowded combat. Unfamiliar players should be able to describe what the boss does differently without reading its name.

### P9-04 · High · The emotional scene and the subsequent gameplay still disagree

The old comic-over-actors obstruction is substantially repaired. Earned L20/25/30 sequences now allocate world acting before full-page reading and suppress obsolete combat invitations. This deserves credit.

Three remaining problems are concrete:

1. In earned L20 at approximately 110–114 seconds of the supplied recording, Arda is faint during the reunion. `render.js` applies the existing damage-invulnerability blink, while protected scene time retains the invulnerability state. The pulse uses real time; it is a lingering damage treatment, not necessarily a frozen alpha value.
2. `scene-acting.js` places Kaan relative to Arda with an x clamp and interpolated approach, without validating walkable marks. Sampled scenes place him on scenery/a raised landing; a Captain fixture puts him on a bollard. A human approach needs an actual usable path and grounded stop.
3. After the L20 comic, the earned recording resumes ordinary solo combat before the exit. Its trace includes seven post-boss toxic hits; Kaan's normal support starts at L21. The scene promises continuing together, then the playable transition drops that companionship. These are remaining ordinary threats, not proof that Fisher-owned attacks failed cleanup.

[L20 acting sequence](media/R1/audit9/strips/L20-world-acting.jpg) · [L20 return/exit sequence](media/R1/audit9/strips/earned-L20-en.jpg) · [L25 acting](media/R1/audit9/strips/L25-world-acting.jpg).

**Repair:** render protected actors fully readable without modifying combat invulnerability rules; choose obstacle-aware stage marks from actual actor locations; author Arda's attention/shoulder release and response. Bridge scene to exit with Kaan visibly accompanying the departure. Do not retroactively add help during Fisher. Either author the remaining threat as a deliberate shared beat or make the resolved departure genuinely safe and quiet. Preserve single settlement and skip/retry semantics.

For L25, let Kaan stop, lower his hands, remember the Captain and turn toward Arda; let Arda make space beside him. For L30, both look toward the real service route before results. Do not replace these movements with another paragraph or stock portrait.

**Close when:** earned defeat → acting → native reading → restored control → actual exit → reward feels continuous, including unfavorable boss-death position and recent damage. No disappearing companion, prop-standing, victory interruption or stranded input. Watch the whole sequence, not only its protected middle.

### P9-05 · High · Thirty mechanisms still too often feel like one task

All 30 world mechanisms have real consequences. Hoists, porters, boats, bridge work, rescue, awnings and rail equipment now move more convincingly. The remaining concern is the repeated framing: broad upward lane, required ring, hold bar, road-clear banner. “Different prop” is not sufficient variety if the player makes the same decision.

**Repair within current mechanics:** make a bell create a traversable gap through redirected attention; a hoist change which side is accessible; a screen create an observable sheltered approach; a trolley reward choosing its safe side; rescue alter who can move. Make each repeated shutter/sack change pressure or useful space, and remove redundant travel where it does neither. The per-level appendix specifies the intended decision.

Existing post-resolution relief delays new ambient spawns for about 3.6 seconds. That does not guarantee relief when the previous crowd continues chasing. Author a pocket of earned space, a readable consequence and a moment to reorient; do not simply delete all enemies or pad successful runs to a target duration.

**Close when:** reviewers can name the distinct positional/timing decision and useful consequence of adjacent levels from gameplay alone. Record orientation/decision/payoff/release, not only successful completion. Test neutral and chosen routes; retain legitimate shorter levels.

### P9-06 · High · Too many cues compete with the player's immediate concern

Health feedback is implemented. The remaining problem is priority. During L1, an optional “HIT THE CANISTER!” invitation persisted while the mandatory route lay elsewhere, and pickup invitations competed near Cook. The prop system now uses deliberate proximity/holding; the old verb does not describe that input well. In the dense multiweapon fixture, broad pale cuts, effects, rings and bodies hide Arda's feet and threatening sources.

**Repair:** let immediate damage/committed attack and hero position lead; required nearby action follows; optional props/loot yield during boss attacks, critical recovery and human aftermath. Outside reach, keep the mandatory destination primary. At reach, show the actual input locally. Separate friendly effect fills from enemy danger outlines; retain true damage geometry and source attribution. Prefer reducing decorative opacity/size/decals over adding more halos.

**Close when:** on mute, including reduced effects, a player can tell damage from healing/blocking, find Arda, see the nearest dangerous source and identify the current required action. Validate conflicts: critical health + boss + frenzy + six weapons + optional object. One isolated green ring does not prove comprehension.

### P9-07 · Medium–high · Build payoff now works, but ordinary discovery and dramatic use remain uneven

The independent broad campaign evolved in **24 of its 30 winning runs**, always to Cleaver. Across the four supplied policies, seven evolution families occurred naturally. Those policies are biased choices, so this is not proof that the other eleven cannot appear. All 18 focused earned tests acquired from actual offers/plans and affected real targets; this closes the prior “only granted showcases” weakness.

The remaining concerns are timing and intention. Broad wins L6/L26 had roughly 4.8/8.1 seconds after acquisition. In my assisted L1 play, Cleaver arrived after Cook and its reveal was quickly interrupted by the chest. These are examples, not a universal balance claim. A count of five remaining targets can still mean inconsequential cleanup.

Pause now contains a useful owned-weapon plan, but it is collapsed and located away from the upgrade decision. This helps an informed tester more reliably than a new player.

**Repair:** expose the existing plan at a relevant owned-weapon/upgrade decision; show current recipe, missing piece and what selecting the plan changes. Preserve side-upgrade/chest commitment and defensive pivots. Track acquisition → first signature hit → meaningful encounter use, not simply elapsed time or target count. Review fast, typical and unlucky eligible runs under declared policies, including failures and missed offers.

**Close when:** a new player can express a build intention, find the corresponding plan without coaching and recognize the changed behavior during useful play. Do not guarantee every evolution, add hidden power compensation or inflate enemies solely to showcase an upgrade. Alternative starting weapons remain deferred N1.

### P9-08 · Medium–high · Weapon ownership improved; contact weight and crowd readability need another selective pass

Knife hand alignment and chain continuity are visibly better. The belt/deployment convention is clearer than arbitrary extra hands. Chainsaw has a two-hand source, but the sampled strike reads as a long rigid projecting tool more than sustained bite, resistance and release. Cable's connected electrocution remains a benchmark worth preserving.

**Repair:** prioritize chainsaw housing/grip/contact/recoil, knife preparation/contact/return and chain tension/weighted end. Use target reactions tied to true impacts. Constrain pale cutting arcs and foam/fire so the hero and enemy danger survive the strongest legal build. Review every base/evolution using the appendix, but only change an asset when its identity/contact/consequence fails.

**Close when:** the base weapon is recognizable without its label, ranks visibly escalate, and evolution changes a readable action. Check clean contact plus ordinary dense combat at actual scale. No fake reach, extra limbs, silent attack suppression or giant universal hit flash.

### P9-09 · Medium · Story reading and growth still have editorial gaps

The first comic's opening text occupies most of the shopkeeper/shutter panel while the page has substantial unused space before subsequent panels appear. The player receives the sentence before getting a useful view of the action. L20's illustrated reading remains more portrait/text driven than the specific lowered-fish recognition promised by the scene. The new Captain mourning treatment is a better match to its moment.

Attributes versus Perks are clearer: prerequisite, currency and affected behavior are better separated. Gear's artwork no longer covers the actual before→after values. Preserve these improvements. Arsenal puts active choices first, but its rank-zero mastery card previews the rank-5 signature name rather than the next earned rank's practical benefit (`meta-arsenal.js:55–57`). A named move is not a behavioral explanation.

**Repair:** compose each comic around its important visible action; place captions in reserved space instead of covering the story image. Let text remain fully readable in both languages. In growth, show next rank's effect and affected weapon/action, how it differs from an attribute/perk, and which changes persist versus reset. Include a compact route back to the next run.

Dialogue delivery history now carries across runs within the app session. It is not proof of persistence after reload. Later concurrent edits improve factual/context eligibility, first-sighting delivery, call priority and mourning silence; those need a new integrated review. Do not overwrite them with an obsolete criticism or claim they have already been heard in this audit.

**Close when:** players explain one next upgrade and its in-run effect, read important story art unobscured, and receive lines that fit the actual target, signal, help and mood. Preserve native TR/EN writing and canonical family/Bazaar facts.

### P9-10 · High acceptance gate · Verification now needs whole-flow and human evidence

The evidence pack is substantially stronger: meaningful simulation events, real earned choices, genuine parked-car terrain, active role recordings and distinct Cook policies replace earlier weak proxies. All 50 groups passing is valuable. Yet it did not catch the common mod-filled layout or an actual Memories click path.

**Repair:** add targeted browser checks for rendered bounds, hit-testing and overlay lifecycle using realistic earned states. Record actual failure/console state; keep fixture grants, earned runs and supplied condition setups distinct. Maintain source hashes when edits continue during capture. A “replay function called” assertion is insufficient.

Before acceptance, complete named physical-iPhone sustained play, touch/interruption/thermal checks, human headphone and small-speaker listening, and the existing unfamiliar-player protocol. Ask players to explain and act, then observe voluntary continuation. Do not lead them toward praise or interpret frustration as desirable engagement. These are open gates, not evidence that unheard audio or untested phone performance is bad.

## 5. Is the distinctive creative direction implemented?

**Istanbul's streets as weapons: yes, meaningfully more so.** Earned traces now show real street-weapon use, offense/placement choices, the L22→L24 consequence, trolley damage and genuine car-linked effects. This is no longer merely a systems proposal. It is still under-presented: small prompts and repeated rings can make a tactical object feel like another collectible task. Show the useful group, path or protected side first, then let the player's action cause the visible change.

**Companionship through action: partially, with credible evidence.** The linked earned help trace records Arda covering Kaan in L23; the later Captain scene acknowledges that actual help. Kaan support occurs in earned later runs. These are important advances. The relationship is not yet consistently embodied at entrances, movement and exits, particularly the L20 handoff. Shared departure, visible reciprocal rescue and space made beside the other person should carry the emotion before a gratitude line does.

The best near-term “wow” moments can come from completing these existing promises: deliberately redirect a crowd with a bell and exploit the gap; turn a cart into a safe working side; see Kaan repay a dangerous moment; watch Captain's anchor lose tension and the surviving pair quietly leave together. These are authored uses/presentation of existing systems, not a demand for another large subsystem.

## 6. Recommended next work and expansion decision

1. **Repair trust failures first:** P9-01/02, scene opacity/walkable marks, contradictory L20 departure, priority/verb conflicts. Deliver complete ordinary click/play paths.
2. **Finish the physical reference, then apply it:** Cook/Captain and knife/chain/chainsaw, followed by all ten bosses and selective roster repairs. Judge source/action/contact in real combat, not a pose-count target.
3. **Author encounter rhythm:** work through all 30 appendix rows; change geometry, consequence and useful release around existing mechanics. Validate weak/typical/strong earned approaches and all loss reasons.
4. **Make intention and consequence discoverable:** surface build planning, next mastery benefit, factual street choices and reciprocal help in the moments where they matter.
5. **Close the evidence gap:** whole-flow browser regressions, exact-build recordings, a complete manual 30-level campaign, physical phone, audible review and unfamiliar-player observations. Repair the issues those reveal before expanding production.

The existing L31–100 narrative/expansion plan remains planning material, not permission to mass-produce another 70 levels. Establish reusable encounter, acting, progression and narrative-handoff standards on these 30 first. Then validate a small next-district pilot under that plan before scaling further. N1–N3 should be considered deliberately after this closure, not quietly folded into corrective scope.

There is no meaningful guarantee of “no improvement left.” The practical milestone is a coherent, reliable and distinctive slice whose important actions are understood and enjoyed by people who did not build it. This build has moved toward that milestone; the evidence does not yet support declaring it reached.
