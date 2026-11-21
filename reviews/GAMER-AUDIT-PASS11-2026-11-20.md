# First30 audit11 after the experience reset

**20 November 2026. Verdict: genuine corrective implementation, incomplete player-experience acceptance, not a masterpiece and not approved for expansion.** Several requirements remain demonstrably unresolved. This review must not be described as a new manual first30 playthrough.

## Evidence and limits

Independently verified all1179 working runtime files against candidate17 manifest; zero mismatches. Candidate identity `c186ad04595f929b47767e2ce75e2bf1f39323eba96b1417c7418c13f48f739c`. [Independent check](media/R1/audit11/source-check.json).

Read implementation, coverage and balance packets; inspected current articulated boss source and finite weapon integration; independently ran `prototype/tools/run-tests.sh first30-reset experience`: both passed, zero failures. The implementation's55-group final suite and12 campaigns are supplied evidence, not rerun in full by this review.

Live Chrome: title/start, opening samples and skip, first controlled movement, restaurant exit, ordinary earned Knife2 and next rank3 mod offer. Keyboard movement operated through normal controls; no build/HP grants. The restaurant doorway required a lateral alignment correction, then worked. Tool gaps mean elapsed time is not human pacing evidence. Closed the audit tab; no reset of owner storage. No manual boss completion or full level clear claimed.

Independently inspected one supplied final earned-route frame per level across all30; extracted and inspected two early fight frames per boss across all10, plus full-size Captain and L4 inspection. The boss fixture end PNGs often show chests/comics and were not used to claim boss visibility. Inspected six priority weapon/evolution samples, supplied health sheets, L20/25/30 scene stills and a progression panel. These are sparse frame observations, not continuous film review or a complete visual inspection of all35 weapon forms/mod branches. [Level samples](media/R1/audit11/levels1.jpg), [11–20](media/R1/audit11/levels11.jpg), [21–30](media/R1/audit11/levels21.jpg), [boss samples1](media/R1/audit11/bossmotion0.jpg), [boss samples2](media/R1/audit11/bossmotion1.jpg), [weapon samples](media/R1/audit11/details0.jpg), [feedback/scenes](media/R1/audit11/details6.jpg).

No audible review, physical iPhone test, continuous-motion acceptance or unfamiliar-player study was performed. Consequently this report does not certify fluidity, satisfying fatalities, compelling audio, narrative emotion or retention. The decisive rejection is not based only on these limits: concrete outstanding defects and payoff failures follow.

## Progress that is supported

1. **Boss construction materially changed across the roster.** Current `boss-puppet.js` uses separate painted limbs, two-bone articulation and planted support logic instead of the old two-walk-cell body bands. Individual action/death work is real. It is reasonable to credit the implementation approach; it is not yet reasonable to certify the result as fluid or Hades quality from frames.
2. **Cleaver's actual orbit was replaced.** Finite committed cuts now change the damage behavior together with presentation. This addresses the root mismatch rather than decorating the orbit. Sledge/Blacksmith also have a propagated attack rather than pretending a held hammer reaches a remote target.
3. **More level actions have physical consequences.** The recorded changes at4/11/12/14/23/28/29 affect screens, docking freedom, obstruction, crossing and movement. They are more than renamed objectives. Whether adjacent levels are sufficiently distinct in a full session remains open.
4. **Reward and growth ownership received concrete work.** The live early card screens are legible and explain current ranks/recipes; the supplied perk panel distinguishes the starting knife from applicable heavy weapons. The direct ready-attribute route and serialized rewards have technical evidence. Neither proves uncoached discovery or useful evolution timing.
5. **The verification account is more candid.** It retains losses, selected histories, capture gaps and open player gates. Preserve this. Do not turn its positive technical statuses into a positive experiential verdict.

## Findings and required next actions

### P11-01 High — L4 required objective expands into a large broken panel

**Observed in final candidate17 earned footage, full-size still.** The left part reads ROAD / BLOCKED / · / REQUIRED / Cut / three live / wires to / open the / barrier, squeezed into a narrow column. The long yellow local instruction occupies the other side and clips at the right edge. The opaque panel extends from approximately y126 to271 in390×844 and obscures the approach. This fails the compact, readable in-combat information hierarchy.

[Exact evidence](media/R1/first30-reset/candidate17-journey/L04-attempt0-route-3.png).

Treat global objective and contextual action as separate intentional rows with bounded wrapping and a clear priority. Do not let a nonshrinking contextual string compress the required objective to a few characters. Preserve essential instructions; move secondary detail to inspection if necessary. Check every long objective/local-action pair at320/390, TR/EN and100/150% text, especially the new moving/carrying tasks. A screenshot matrix that only covers card/perk screens cannot close gameplay HUD layout.

### P11-02 High — Useful first-run build crescendo is still not delivered reliably

**Supplied retained numerical evidence, explicitly not independently rerun here.** Twelve campaign policies produced two useful early Nailstorms and one late Cleaver with8hits/87damage and less than8seconds left. Eight additional focused Cleaver attempts and eight public owned-plan cases found no useful L1 Cleaver. The implementation correctly calls these failed payoff cases.

Foreground serialization is a real repair; it does not close timing. The game encourages Knife investment and explains the recipe, so repeated failure to use the transformation during meaningful play weakens that invitation. Trace the actual XP/rank/passive/offer schedule relative to Cook and the remaining route. Move/reallocate the existing investment opportunity or revise recipe/offer timing coherently. Do not make a fake second boss, pad an empty route or guarantee every perfect build. Recheck representative ordinary investment paths with all misses retained. Until then, mark G03/P10-01 timing incomplete.

### P11-03 High — Boss identity remains vulnerable to ordinary build power

The [retained boss comparison](FIRST30-RESET-BALANCE-2026-11-19.md) includes typical Cook6.9s with two throws, typical Switchkeeper5.0s with one hook, typical Keeper10.3s with counterweights only, and typical Bride8.0s with one cart and one sweep. Strong-build fast kills are legitimate; these ordinary-entry cases show the original learning/identity risk remains. Typical Captain39–62s differs substantially; the whole roster does not need a blanket HP increase.

At the other extreme, Linekeeper's same listed injured build takes5.1s with punish movement versus165s evasively; typical Vatman19.1s versus123.3s. Diagnose reach, target access and repeated denial, not just HP. A long avoid-and-wait loop is not automatically challenging or engaging.

For each boss, tune first action order, engagement distance, counter/recovery access and actual damage delivery so ordinary entry produces a readable choice and consequence. Keep legal power victories. Preserve baseline-speed viability. Do not add hidden counter-scaling, minimum fight timers or forced invulnerability demonstrations.

### P11-04 High presentation — Boss bodies still need stronger separation

**Sampled visual judgment, not a claim about every frame.** The extracted quiet fight frames show several dark boss bodies/tools against similarly grey paving: Captain, Fisher, Keeper and Ticket Man are notable. Red stars, rings and lane overlays often draw attention more readily than the physical body. The Bride's pale silhouette separates more strongly. New anatomy alone has not solved the hierarchy.

Inspect the original frames at full phone scale. Strengthen local value separation, protect key body/tool edges and reduce background competition. Do not depend on a red overhead symbol, health bar or universal glow. Validate the body and threatening tool in actual crowded earned fights, grayscale and reduced settings. All ten need individual acceptance; these samples do not pass any boss's continuous movement/death quality.

### P11-05 High presentation — Large text and controls still compete with play

Final earned frames show broad FRENZY—FASTER ATTACK text crossing combat at16/21/28; L21's sampled headline is substantially cropped. L23 combines large overlapping interaction rings, optional ATM instruction, required sacks and combat. Skill controls have strong dark concentric backing and occupy prominent space while the actor and interaction detail are small.

This is evidence of continuing composition risk, not proof a transient banner permanently blocks play. Inspect the full transition and limit announcement size/duration; sustained frenzy should be recognizable from its visual state without a large sentence. Promote the relevant local action; suppress remote optional prompts. Simplify control decoration while retaining safe touch targets. Test the simultaneous critical/boss/frenzy/six-weapon case instead of approving separate isolated cues.

### P11-06 Medium — The rendered journey still looks spatially repetitive in sampled composition

Mechanical changes are stronger than before. Nevertheless the30 sampled views are dominated by upward corridors/open paving, a top required-action strip, small center actor, markers and repeated circular interactions. This is a visual/compositional assessment, not a declaration that every mechanic is identical.

Make the action landmark and consequence organize the frame: carry route, opened flank, cart trajectory, refuge, companion intervention and illuminated crossing should be the dominant readable change. Preserve brief relief at16/26 and quiet grief. Avoid adding another task to every level. Review adjacent-level decisions with objective text hidden; a different caption cannot be the main source of distinction.

### P11-07 Medium — Evidence labels contain a balance-classification contradiction

The boss table labels several losses “entry not reached” while the same row contains actual entry HP and boss attack families: for example Switchkeeper injured/evasive and Bride injured/evasive. This is a reporting issue requiring raw-trace reconciliation, not proof of a combat bug. Distinguish death before spawn/engagement from death after entry, and timeout from HP death. Do not use these labels to decide whether the approach or boss caused failure.

The all-level table also retains L23's600-second outlier. Explain its actual outcome and cause before claiming no pacing/blocking issue. L29's known308-second driver delay is not human boredom evidence and should not be silently mixed with player pacing.

## PRD acceptance disposition

| Scope | Assessment after this review |
|---|---|
| All ten bosses implemented | Roster-wide new anatomy/action work is supported; visibility, first-learning and continuous craft remain incomplete/unaccepted |
| Knife/Cleaver physical truth | Root mechanical correction supported; continuous appeal and useful early reward remain open |
| Complete arsenal craft | Coverage inventory exists; this audit sampled six priority forms, not all variants. No blanket artistic approval |
| Injury/healing/frenzy | Mechanisms strengthened; competing presentation remains. Muted uncoached recognition not established |
| Hurt sound/music | Separate injury cue and mix changes reported; not listened to, therefore no aesthetic acceptance |
| All30 level variety | Concrete mechanics changed; composition/repetition and long-objective layout need more work |
| Attribute/perk discovery | Destination and explanations improved technically; player discovery not established; no false claim of absent feature |
| Scenes/companionship | Physical staging and assets changed; sampled stills cannot prove emotional performance |
| Comics/dialogue | Latest native work preserved, with recorded L23 factual wording repair; not a new full bilingual readthrough |
| P10 small defects/black world | Technical corrections reported and focused suite passes; full reproduction set not independently rerun here |
| Device/continuous/audio/player gates | Not performed; remain open |

## Handoff recommendation

Do not commission another indiscriminate whole-game expansion of features. First close the concrete gameplay-HUD failure, useful early build payoff and per-boss ordinary/long-tail balance; finish body/scene composition and inspect continuous motion/audio with tools or people capable of perceiving them. Retain new rigs, truthful weapon geometry, meaningful environment changes and native writing. Use matched ordinary conditions to make the improvement obvious without narration.

The next review should check these exact failures, then extend the currently incomplete manual/continuous/phone coverage. This report rejects masterpiece/expansion approval without pretending to have certified every unobserved corner of the game.
