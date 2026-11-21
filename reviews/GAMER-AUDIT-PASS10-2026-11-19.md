# Player experience audit, pass 10

**19 November 2026 · Bölüms 1–30 · Independent review of the Audit9 implementation.**

**Revised verdict after the owner's direct play feedback: technical repairs are verified, but a substantial improvement in core game feel is not established. Not a masterpiece; hold expansion beyond30.** My initial “substantially better” assessment gave too much weight to implementation completeness and interface repairs. Several conspicuous Audit9 defects are repaired, but that does not establish the required leap in combat, animation, boss satisfaction or progression discovery. The [owner-feedback addendum](AUDIT10-OWNER-FEEL-ADDENDUM.md) supersedes the optimistic weighting in this report; the original observations and verification limits remain intact.

The difference between underlying sophistication and felt quality **remains substantial**. Source checks and sampled frames are insufficient grounds for claiming that core game feel has materially improved. The owner's direct reports identify failed perceptual outcomes in boss visibility/motion/death, weapon ownership, hurt feedback, progression discovery and scene direction. Those reports are attributed observations, not newly reproduced findings by this reviewer. Neither an audit nor a bot campaign establishes lasting enjoyment or retention.

Companion reports: [all 30 levels and asset review](AUDIT10-LEVELS-AND-ASSETS-2026-11-19.md) · [Audit9 closure and verification boundaries](AUDIT10-CLOSURE-AND-VERIFICATION-2026-11-19.md).

**Current implementation direction:** the owner's further clarification requires all-boss craft, not selective Cook/Bride/Captain acceptance. Use the [complete first30 production packet](PRD-FIRST30-EXPERIENCE-RESET-2026-11-19.md) and its roster, journey and acceptance appendices. It adds source-grounded requirements and stronger verification without claiming another completed playthrough.

## What I actually checked

- Independently played fresh English L1 through the current opening, combat, earned cards/mods, Cook, evolution, chest, exit, comic, result and permanent progression. No debug grants or selected prototype revive. Ordinary first-run assistance remained enabled; this is not an unassisted difficulty benchmark.
- Applied an earned Strength rank; followed its perk connection; inspected actual mastery rewards. Replayed the earned comic, used Back and hold-skip, reloaded during replay, and launched L2 without the old comic leaking into play.
- Made two ordinary L2 attempts, ending at 10 and 20 seconds; checked actual defeat attribution, settlement and map return. Tool gaps caused idle exposure, so these are interaction/feedback observations, **not evidence that an attentive novice would lose at those times**. I did not manually clear all 30.
- Independently ran the complete **54-group suite: zero failures**, and an earned broad campaign: **30 clears in 33 attempts, three losses, zero timeouts**. All compared simulation outcomes reproduce the supplied campaign. Additional read-only boss-entry coordinates are the only comparison qualification.
- Inspected 325 newly extracted frames across all 30 world actions, all 30 winning rendered routes, ten bosses, 17 base weapons at ranks 1/3/5, 18 evolutions, 16 enemy fixtures and L20/25/30 story chains. Added 32 closer temporal samples for Knife, Chain, Chainsaw and a suspicious Molotov capture; inspected supplied dense/health sheets and relevant source/telemetry. This is **sampled recording review**, not continuous normal-speed viewing of every film.
- Read the current English first-30 narrative and conditional branches, reconciled the native narrative changes and current implementation packet. I did not independently read every Turkish variant or listen to the soundtrack/voice/SFX.

Frozen runtime: **1,142 files**, manifest SHA256 `8b02fbff46d1bef7db62dc3c1480fead8acd0a8d5fed2479ebb66e1efba44fdc`. The played copy and workspace match this manifest; the end-of-audit comparison has no runtime differences. Most supplied films are honestly labelled source12: only the winning-L30 recap guard changes in13. Combat, scenes and audio are identical. Details and retained failures are in the verification appendix.

## The holistic experience now

The opening has a clearer chain of cause and effect: a person converts, Arda takes an actual weapon, the street becomes a problem to solve, and the shopkeeper's shutter supplies a human pause. The comic's action is now readable. Progression explains immediate benefits more successfully. Kaan's presence and the Captain's farewell have a much more coherent physical foundation. These are real gains in the player experience, not merely additional code.

The most promising identity remains **Istanbul's streets as weapons, and companionship expressed through action**. Both now exist mechanically. Operated machinery changes space; props can be carried, placed or used offensively; actual help changes a later acknowledgment. Kaan's scene approach and subsequent presence are stronger. The concern is prominence and recurrence: these moments still compete with the much more frequent loop of a wide upward lane, a required ring, a completion message and another exit arrow.

The game needs fewer interchangeable passages and more situations where the player can say, “I did that because I understood this street,” or “Kaan helped me do something I couldn't do alone.” A different object illustration does not necessarily create a different decision. A longer boss health bar does not necessarily create a more memorable opponent. A newly acquired evolution does not create a satisfying crescendo if the boss is already dead.

| Dimension | Change since Audit9 | Current judgment |
|---|---|---|
| Opening and immediate presentation | Current diner treatment and clearer comic staging retained | A stronger invitation into the game; protect these improvements |
| Progression and menus | Compact mods, inspectable effects, plan at the card decision, actual next-mastery benefits | Major improvement; a few concrete polish/state defects remain |
| Repetition | Useful side cover, bounded diversion, shorter L9, earlier finite supplies | More physical consequence; insufficient change to the repeated decision pattern |
| Boss identity | Action-specific profiles, tool anchors, supporting body treatment | Meaningful implementation progress; first encounters can still skip their identity, and continuous craft is not accepted |
| Build payoff | Better guidance and real useful evolutions across several policies | Broad policy remains 24 evolved wins, all Cleaver; my first evolution arrived after Cook and lost its reveal to a chest |
| Emotional presentation | Walkable staging, opaque actors, shared departure, current native dialogue | Old physical continuity failures can be closed in sampled evidence; emotional effectiveness still needs a person watching/playing |
| Clarity under pressure | More truthful prompts and friendly-effect protection | Still too many large words, rings, bursts and bodies competing in dense play |
| Verification | 54 passing groups, complete rendered journey and much better provenance | Strong technical evidence; no physical-phone, audible or unfamiliar-player acceptance yet |

## Findings to implement or resolve

### P10-01 · High · The reward crescendo can still arrive after its purpose and obscure itself

**Confirmed in ordinary live play.** In L1 I invested in Knife through rank5, chose Heavy Blade and Splinter Spray, and acquired Work Gloves. Cook died before Cleaver was offered. After selecting the evolution, the chest result immediately covered the evolution announcement. The saved image shows `EVOLUTION!` blurred behind the Work Gloves2 chest reward.

[Actual overlap](media/R1/audit10/L1-evolution-obscured-by-chest.jpg) · [actual evolution offer](media/R1/audit10/L1-evolution-offer.jpg).

Two issues need separate remedies:

1. **Presentation ownership:** evolution discovery, a queued chest, level-up feedback and story must have an intentional order. Display one foreground reward at a time. Finish or explicitly acknowledge the evolution reveal, then open the queued chest. Freeze reveal timing while another foreground owner is active. Do not discard the reward or duplicate settlement.
2. **Useful timing:** review actual early rank/recipe/offer budgets against the remaining encounters. L6/8/26 supply relocation does not repair this L1 outcome. Move an existing finite opportunity earlier where justified, or revise the early progression timing so deliberate investment has a fair chance to transform the *remaining* play. Do not guarantee every evolution, lengthen an already-cleared level, or manufacture a compulsory second boss.

Measure acquisition → first meaningful combat use → remaining decision, not just acquisition or one hit on cleanup. Keep failures and late outcomes in the denominator. The 170 targeted searches prove possibility, not ordinary discovery frequency. One useful first run is more valuable than another showcase that starts with the evolution supplied.

**Close when:** fresh ordinary runs can show an earned early transformation during a meaningful encounter; late rewards remain honestly labelled in analysis; evolution+chest+story collisions preserve a readable reveal, input and exactly-once rewards. Include the specific Knife5/Gloves/Cook chain above.

### P10-02 · High · Some first bosses still die before the player learns why they are special

**Live observation plus independent campaign evidence.** Cook's health fell rapidly once my ordinary Knife build reached him; the phase announcement did not produce a substantial new interaction before death. In the independent broad campaign, Cook lasted **7.03s**, used two throws and recorded no exposure events; Fisher lasted **7.87s** and used only `bridgeCast`. Keeper lasted **9.5s**, with only counterweights. These are policy-specific cases, not population averages. Zero exposure events is not proof of zero generic recovery.

The implementation's wider comparison also contains legitimate short first-power fights: weak/typical Switchkeeper approximately6.4–6.5s, typical Roaster punish5.2s. Other fights are long and some entries fail because the player arrives injured. Thus “all bosses need more HP” is the wrong diagnosis.

**Treatment:** distinguish first-encounter teaching from strong-build rematches. Make the signature action readable early, before a generic chase/contact pattern consumes the fight. Let arena approach establish the source and escape space. Ensure a first clear can involve recognizing a tell, making a response and seeing the consequence. Where necessary adjust the first action order, engagement distance, local crowd pressure or attack/recovery balance together. Preserve honest damage and the pleasure of a powerful build. Do not use hidden counter-scaling, arbitrary invulnerability phases or minimum fight timers.

For Cook, teach load → threatened lane/arc → committed attack → spent stance in a clean readable exchange. For Fisher, ensure rod tension/pay-out/reeling is visible before the net becomes competing spectacle. For Keeper, make the last falling weight and safe approach legible. Existing environmental counters on Bride should become a model of player-caused success, not merely a line of instructions.

**Close when:** first-time players can describe each boss's distinguishing action, identify their own successful response and name why a loss occurred. Record first-entry HP/build and attack families. Fast rematches may remain fast; passing a stationary supplied-health fixture is not this test.

### P10-03 · High · The new relief system improves survival space more than encounter variety

**All-30 sampled review plus source.** The hoist, ferry, rescue, bell, trolley and bridge actions have visible physical consequences. Selected work-side crates are useful. L9 has less empty travel. Retain these.

However, many new releases share the same bounded diversion: eligible nearby enemies turn toward the apparatus for3.8s within6.2m. It is a sensible relief tool, but it does not itself change what the player decides before completion. Adjacent levels still commonly ask “approach the marker; stand in the ring; leave through the newly open lane.”

**Treatment:** use the existing mechanics to differentiate decisions. The [30-level appendix](AUDIT10-LEVELS-AND-ASSETS-2026-11-19.md) specifies the next design task for each level. Prioritize these adjacent stretches:

- **L6–9:** work-side choice → escort lane → lure-and-cross timing → carry-route risk. Make those differences visible before the action, not only in the objective sentence.
- **L11–14:** cargo opens a usable flank; mooring changes pier access; traffic creates a timed crossing; shutter work changes where pressure comes from. Three successive holds should not feel identical.
- **L21–24:** shared work, cart commitment, reciprocal protection, then a trolley payoff. Let the player see how the earlier choice changes the later street.
- **L26–29:** departure opening, guided route choice, fuse/crossing timing, then illumination/lure. Avoid another four variations of waiting in a circle.

Do not add an extra task to every level. Remove redundant holds or travel when they provide no decision. Maintain short connective levels and quiet recovery. Preserve threats already committed when an apparatus resolves; show enemies turning, a lane opening or shelter becoming useful so relief is earned and intelligible.

**Close when:** with the objective text covered, a reviewer can explain the different tactical decision in adjacent levels and the consequence caused by their action. The test is not whether two different prop names appear in configuration.

### P10-04 · High · The screen still spends too much attention on simultaneous spectacle

**Observed in live play and supplied legal-six-slot stress.** Low health is no longer silent: edge treatment, HP changes and LAST BREATH exist. Healing has truthful restoration feedback. Enemy sources and friendly effects receive more protection. These must not be reported as missing features again.

The remaining problem is competition. Dense samples contain stacked SCREAM/BOOM lettering, broad fire/explosion fills, purple fields, outlines and many bodies. Reduced/muted samples are still busy. Ordinary L2 also put the large LAST BREATH banner, dialogue bubble, upgrade toast and crowd around Arda at once. A cue can be technically present while the player cannot comfortably read it.

**Treatment:** establish a strict simultaneous-presentation budget. Hero position and imminent harmful geometry get the clearest edges. Reduce/merge repeated cosmetic lettering and duplicate burst fills; move or defer nonurgent dialogue and pickup celebrations away from the active threat. Preserve the comic personality with selective emphases, not constant headline scale. Keep hostile telegraphs intact when simplifying friendly effects. Recovery/opening marks need a clearly different shape/material from hostile orange/red circles; do not rely on hue alone. Check poison-green warnings against healing-green effects on mute.

Frenzy should have a recognizable sustained state through animation rhythm, attack cadence and a bounded edge/character treatment; text can announce it once. Boss mood can use a brief protected composition change, localized lighting and a distinct entrance pose. Persistent zoom/brightness is not a substitute for contrast and must not shrink the dodge space or obscure off-screen threats.

**Close when:** default and reduced presentation let an unfamiliar player locate Arda, name the immediate danger and distinguish damage/heal/block/exposure without reading labels. Test the actual conflict case: critical HP + boss commitment + frenzy + six legal weapons + nearby optional prop.

### P10-05 · High craft priority · Boss motion has improved; it still lacks an accepted physical performance

The old claim that every atlas boss uses a single common windup is now obsolete. `BossGestures` selects action-specific preparation/late/commit poses; measured anchors connect tools; `BossJoints` separates supporting lower body from upper-body loading. Captain's anchor/haul, Fisher's line and Ticket Man's signal are more explicit. Preserve that work.

The remaining model is still economical: seven bosses reuse a small pose atlas, upper/body bands are transformed, and locomotion uses limited authored poses. Sampled scenes show more readable intent but still frequent frontal silhouettes and broadly similar braced/recovery presentations. This supports a **selective craft pass**, not a claim that I watched and rejected every animation at full speed.

Make Cook, Bride and Captain the principal acceptance shots: clear support foot, hip/shoulder lead, connected hand/tool, target-directed commitment, impact resistance and settling. Cook should feel abrupt and dangerous; Bride should pivot with rope/dress tension; Captain should load and haul heavy mass. They should not all run or dash like Arda. Verify turns, interrupted attacks, target passing behind, collision, death during commitment and reduced motion. Correct anatomical seams or foot sliding in actual motion before multiplying effects.

Knife now has a clearer sweep/return; Chain shows a held weighted path; Chainsaw has more recognizable contact/retraction. Do not restart them from zero. Chainsaw and the seven atlas bosses still need normal-speed phone-scale acceptance of weight and contact. A100ms contact sheet cannot certify smoothness. Keep Arda's accepted gait and avoid a broad ordinary-zombie rig project.

**Close when:** actual continuous recordings and physical-phone observation show believable weight without source/target disconnect, size change, foot skating or awkward reversal, under both clean and crowded conditions. This requires looking at motion, not adding frame-count assertions.

### P10-06 · Medium · A small group of ordinary interface details remains visibly or semantically unfinished

| Finding | Evidence and exact treatment |
|---|---|
| Build inspection scope text has very low contrast | Live `.build-detail` has cream `#f4ebdd`; its `.caption` inherits70% white from `.panel.build .caption`. Give this surface an explicit readable text token. [Image](media/R1/audit10/build-detail-low-contrast.jpg) |
| New card offers retain the previous scroll position | After expanding the plan, scrolling and choosing Knife2, the following mod offer opened with its title clipped above the viewport. `#scr-cards.scrollTop=74`; title top≈−26.5 CSSpx. Reset intentional offer scroll/focus on a genuinely new offer, while preserving deliberate inspection navigation. It was scrollable back into view, not unreachable. |
| Old attribute sequence survives under the hub | Failure → Give Up → Map creates `.meta-lvl` at z40 beneath the hub; accessibility still exposes “LEVEL CLEARED,” then “Spend your points,” even with zero points. Hit-testing finds the hub above it. Starting the next run clears it, so this is **not** a reproduced gameplay overlay leak. Reconcile this legacy sequence with Develop Arda; exclude hidden/inactive content from focus/AX, and do not label a loss cleared. |
| Neutral phone notice uses Arda as its speaker image | Seen during L1 exit; `story-data.js` still maps `spk.phone` to `who:'arda'`. Use a neutral phone/system treatment for “NO SIGNAL.” Keep actual Mom/Arda dialogue identities. The saved similarly named screenshot caught the later title slam, so source and live observation—not that image—support this finding. |
| Failure coaching is too generic for the point of failure | After the20s L2 loss the result recommends raising Nail Gun to rank5. That is a future build goal, not the immediate lesson. Prefer the actual cause/approach lesson first, then an optional achievable build adjustment. Keep the correctly attributed Runner/Walker cause. |

The compact mod layout, actual perk requirements, next-mastery numerical benefit and Memories ownership are now good enough to retain. These details do not justify another wholesale menu redesign.

### P10-07 · Verification defect · An accepted roster film contains a world blackout

The source12 `weapon-molotov-r3.mp4` is normal at3.0s, has a black world with HUD still visible at approximately3.5s, and returns by4.0s. [Independent temporal samples](media/R1/audit10/strips/detail-molotov-r3.jpg). This is an observed recording defect; I did **not** reproduce a live Molotov renderer failure and cannot assign its cause.

Classify it: browser compositor/capture failure, runtime rendering, or another cause. If capture-only, retain and mark the rejected segment and replace it with a valid same-source recording. If runtime, repair and add a regression matching the actual cause. A valid video/audio stream is not proof of a visually valid review artifact. Do not silently exclude it while describing all films as accepted visual evidence.

## Story, relationships, music and the reason to return

The current story is more coherent. Home is a practical destination for the scooter and Dad's map; the family is in Sarıyer. Paşa gives the solitary section a presence. Kaan's request to check his captain creates a personal reason for Eminönü; the Captain memory is specific and human. The L30 call turns the highway warning into a concrete question and motivates the Bazaar route. Preserve this canon and the independently native TR/EN writing.

The best narrative opportunity is now **delivery and remembered action**, not more exposition. Make Paşa's direction or hesitation visible when the dialogue refers to it. Let Kaan's actual approach, cover, help and shared departure be readable before explaining them. Preserve conditional Captain lines only when help really happened. Avoid stacking ordinary jokes or loot invitations across grief. A silent glance or changed stance can carry the transition; it does not need another paragraph.

The implementation has protected scene clocks, native reading, motif routing and audio recordings. I have not listened to them. Music/SFX therefore remain **unaccepted**, not “bad” and not “done.” The required listening session must cover opening-to-street, frenzy entry/exit, boss commitment, repeated hits over several minutes, Captain aftermath, comic silence and return. Check phone speaker and headphones, mute, ducking, loops, overlap, fatigue and interruption/resume. Do not commission more music until the existing transitions and mix are actually judged.

Three potentially valuable additions remain **new design proposals**, not failed Audit9 obligations: earned alternative starters, one environmental boss counter developed from existing street interactions, and curated tactical rematches. Audit9 explicitly deferred N1/N2/N3. I would prioritize earned starter choice once reward timing and first encounters are sound: let a familiar weapon support a deliberate next-run experiment. Prototype a single counter with genuine player timing and consequence before extending it across the roster. Curated rematches should change a route/enemy combination and build decision; they should not merely inflate HP or add compulsory grind.

Optional monetization remains the agreed direction. The current no-ad/no-payment earned paths are viable under the tested policies. Do not create a progression wall to force purchases, or treat repeated failure as proof of engagement. Give players satisfying stopping points and a concrete reason to choose another run.

## A finite next iteration and expansion gate

1. Repair reward presentation ownership, early reward timing, low-contrast/scroll/state details and the unexplained black capture. These have concrete reproductions.
2. Tune first-encounter teaching for Cook/Switchkeeper/Roaster/Keeper/Fisher and validate the full ten-boss power matrix. Preserve earned rematch power and classify approach damage separately.
3. Differentiate the four adjacent level stretches above through existing positional/timing choices. Remove low-value repetition; do not add thirty new tasks.
4. Complete selective boss/weapon craft and enforce crowded cue priority. Judge the result at native speed and phone scale, not from newly added code paths.
5. Run the existing external acceptance scripts with5–8 consenting unfamiliar players, including uncoached earned progression through30, plus physical-iPhone and actual listening review. Record where they hesitate, miss a consequence, misread a hit, cannot explain an upgrade, or choose to stop. Ask what they want to try next without suggesting an answer.

**Ready to expand** should mean: the known defects are closed; all30 form a coherent played journey; first bosses teach recognizable responses; representative builds have meaningful payoff; difficult losses are understandable; the people/story/exit transitions agree; phone performance and audio are accepted; unfamiliar players can explain their choices and show voluntary interest in continuing. Keep technical and human evidence separate.

That is a reachable quality gate. “No meaningful improvement remains” is not a practical release definition, and no report can guarantee a masterpiece or endless replay. This iteration is real progress toward the target. The remaining gap is concentrated enough to address deliberately rather than restarting the whole game.
