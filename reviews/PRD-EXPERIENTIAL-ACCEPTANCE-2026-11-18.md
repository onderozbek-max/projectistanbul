# Experiential PRD · Acceptance and implementation handoff

**Required appendix to [the main PRD](PRD-EXPERIENTIAL-QUALITY-2026-11-18.md).** A completed checklist demonstrates a substantially better, reviewable game. It cannot prove that every player will return, that no improvement remains or that “masterpiece” is an objective certification.

## 1. Work order: finish the experience, not only a showcase

| Stage | Work | Internal gate before moving on |
|---|---|---|
| A · Reconcile | Read handoff, current implementation notes, latest native dialogue audits, H01–H18, pass 7 and this packet. Inventory current assets/behaviors and map each requirement to retain/extend/missing | No stale bug reintroduced, no duplicate system planned, baseline/capture provenance recorded |
| B · Establish craft | Arda locomotion; walker/runner/heavy contrast; damage/heal; knife/chain/chainsaw/cable; Cook entrance/fight/aftermath; one deliberate prop action | Convincing normal-speed phone-size reference; responsive controls; no mismatch between view and sim |
| C · Apply consistently | All live enemy roles, all 17 base weapons, all 18 evolutions, all ten bosses; earned-power/hazard tuning; feedback conflict priority | No unreviewed roster row silently omitted; minimum-quality/mute variants remain legible |
| D · Connect the journey | All-30 live world beats, major scenes, local choices/Kaan callbacks, progression/pause/results, sound transitions | Full TR/EN chronological continuity, safe skip/retry/interruption, clear next intention |
| E · Verify and deliver | Focused regressions, one final full suite, deterministic campaign diagnostics, visual/audio/device evidence, uncoached comprehension evidence where available | Evidence matrix and known limitations complete; no unsupported “all verified” claim |

These are work stages within one authorized handoff, not five requests for the owner to approve routine progress. The reference slice is not the finished deliverable. Keep working on independent items when hardware, a new asset or a player session is unavailable. Follow existing approval rules only for genuinely new dependencies/services, paid work or out-of-scope design; prepare the concrete proposal first. Do not use those possibilities as a reason to stop ordinary authorized implementation.

Do not edit another agent's in-progress files blindly. Establish the current working state before starting this packet. No duplicate full test runs while the active implementation is changing the same files. No commits, pushes, merges, ad SDK integrations or post-30 production are requested by this packet.

## 2. Completion matrix and evidence provenance

Create `reviews/EXPERIENTIAL-IMPLEMENTATION-2026-11-18.md`, with linked inventories/captures rather than one oversized file. Every E01–E14 row records: implemented behavior; relevant files; adopted config values/deviations; functional check; player-facing check; evidence link; remaining limit; status. Status vocabulary: **not started / implemented, unverified / verified in fixture / observed in earned play / device/player evidence pending / blocked with reason**. A fixture passing does not imply earned play or human acceptance.

Attach submatrices for all 30 level beats, ten bosses, 17 base weapons, 18 evolutions and every enemy actually spawned in the slice. For each asset record source identity and in-game binding, not only a folder of beautiful unused images. A row can use existing work if it meets the current requirement; link the evidence and explain that it was retained.

Capture provenance includes date, source revision plus dirty-file manifest/hashes, build URL/version, device/browser, viewport/device scale, locale, quality/accessibility settings, seed, mode, save/power origin, supplied debug assists and input policy. The repo is frequently dirty: a Git SHA alone cannot identify the tested build. Freeze a review snapshot or equivalent manifest after edits settle. Do not present recordings from different intermediate builds as one coherent final verification.

Use ordinary footage at normal speed as primary evidence; add slow motion or frame strips for anatomy/contact review. Label supplied/maxed/debug cases clearly. A supplied fixture is useful for coverage, but at least representative critical scenes/bosses must be observed from earned play. Do not infer an asset loaded correctly from a test stub or an image-load success flag.

## 3. Functional regression checks

Extend meaningful existing tests instead of duplicating implementation line by line. Run tests touched by each change, then `prototype/tools/run-tests.sh` once on the final integrated state in the background, as the project requires. Run the balance tooling where sim/balance changed. If a subsequent fix affects tested behavior, rerun the relevant checks and required final checks; do not reuse an earlier green run as proof of a later build.

| Area | Required cases | Failure that blocks closure |
|---|---|---|
| Interaction ownership | Two nearby eligible props; approach/hold/move cancellation; carry with a task object; invalid placement; hit during hold | Wrong target commits, hands duplicate objects, cancellation consumes the prop, visual placement differs from actual solid |
| Food/healing | Full HP, partial HP, near-cap heal, saved food, station empty, heal+damage same update, revive boundary | False heal amount/success, wasted/duplicated item, stuck invitation, HP feedback lies about the final state |
| Damage feedback | Small repeated hits, large hit, shield absorption, invulnerability, poison/area tick, unknown/non-directional source | Critical state absent, fake damage from a block, false incoming arrow or permanent overlay after recovery |
| Weapon correctness | Base/evolved direct, delayed and area hits; pre-evolution projectile landing later; multiweapon and carried-object states | Misattributed evolved damage, visible hits outside true shape, dropped attacks to hide animation conflict |
| Boss safety | Each attack family, phase boundary, interrupt/death, near-edge camera, weak/strong builds | No usable escape, unreadable commitment, pose/scale jump, unreachable advertised opening |
| Choices and relationship | Both branches, placement precedence, offensive commitment at correct outcome, loss/quit, first/repeat qualifying win, missing old-save fact | Rewritten history, gratitude for failed help, local choice replacing Kaan fact, replay farming a one-time result |
| Scene lifecycle | Entry, halfway skip, end skip, app hide/resume, reload at supported checkpoint, image failure, queued card/call | Duplicate settlement, frozen input, damage during protected loss of control, skipped task, missing essential next intention |
| Localization/UI | TR and EN, Turkish casing, largest text, both thumb sides, safe areas, long recipe/attribute descriptions | Clipped actionable text, untranslated new voice, misidentified speaker, combat covered by unrelated UI |
| Audio | Repeated transition, boss→farewell→result, mute/unmute, hidden page, resume, failed asset | Multiple music tracks unintentionally stack, stale fight loop over grief, lost mute state or blocking audio error |
| Free path | No spend/ad/revive baseline; offer dismissal/unavailability; existing reward callback repeated if a local stub exists | Progress requires monetization, earned reward depends on ad completion, duplicate bonus or punished refusal |

For scene lifecycle work, use the existing save/run-recovery contract; this brief does not require a new general-purpose resumable simulation. Where monetization is only a preview, verify the preview/unavailable state and ordinary free route. Do not build a real ad/payment integration to satisfy a test row.

## 4. Visual and audio craft checks

### 4.1 Movement and contact

Capture Arda starting, stopping, turning through all eight directions, rapid reversal, run+attack, Dash, hit while moving, carry, work and defeat. Use normal camera scale and a crowded scene as well as an isolated floor. Inspect planted feet, knees, hips, chest, grip anchors, ground shadow and size consistency. Compare front/back/side; one attractive facing is insufficient.

For every live enemy role, capture movement, first preparation, committed action, recovery and death. Ask whether behavior is identifiable on mute and without its name label. Clothing variants need not have separate mechanics, but attack roles need visible distinctions.

For each base weapon, capture low/intermediate/high ranks; each evolution, capture its signature **actually affecting** a target or relevant hazard. Build a short indexed reel rather than hundreds of unlabeled clips. For knife, chain, chainsaw and cable include frame-by-frame hand→tool→target review. For the busiest legal loadout, inspect concurrent ownership and danger visibility. Articulated movement remains enabled on the minimum supported quality; decorative trails/particles can reduce.

### 4.2 Information and tension on mute

Capture: small hit, large hit, shield block, critical HP entry/exit, positive heal, capped heal, full-HP food, frenzy start/end, boss entrance/phase/opening, mechanism completion and ally help. First watch without sound and without reading labels. A reviewer must distinguish actual benefit, harm, protection, enemy intent and player empowerment from shape/body/world cues. Text/audio then reinforce detail.

Run the combined conflict case: boss telegraph + low HP + healing + frenzy + available object + queued dialogue. Critical floor geometry and Arda's contact point remain visible; heal and HP state remain truthful; lower-priority celebration/dialogue yields. Test on dark/light district floors, reduced motion, minimum quality and largest subtitles. No more than three flashes/second, including overlapping sources; do not assess each effect in isolation and ignore their sum.

### 4.3 Sound and music

Audition contact/impact families on a phone speaker and headphones: knife, chain, saw, electricity, wood, metal, glass, heal, shield, boss warnings and machinery. Confirm timing with the visible contact; test several rapid repetitions for fatigue/masking. Keep useful dynamic contrast at modest volume. Compare fight→quiet→story→next intention transitions, especially L20/L25/L30. Report desktop-only listening as desktop-only.

Do not mark a cue accepted from its filename, waveform or existence. If audio generation/recording requires owner review under the current workflow, prepare exact cue briefs, durations, layering and reference context; continue other work. Voice acting is not a prerequisite for every new world beat. Existing captions and physical acting must carry the meaning.

## 5. Balance and campaign checks

Use current repository tools and deterministic fixtures; avoid creating a second balance engine. Record actual parameters and comparable before/after samples. Separate simulation correctness from a human's ability to see/react to it.

1. **All-30 normal-route sweep:** use multiple deterministic seeds per level, including earlier failure/long-tail seeds. A four-seed initial sweep is a diagnostic starting point, not statistical confidence. Inspect losses/timeouts and extreme travel times rather than automatically requiring every plausible weak run to win.
2. **Earned campaign continuity:** run broad/unfocused, melee, ranged and terrain/control profiles using their own accrued rewards and purchases eligible from those rewards. No paid currency, ads or supplied max gear. Preserve the distinction between a scripted first-run free Second Wind and ordinary revives; explicitly report either. Do not describe a revived campaign as a no-revive campaign.
3. **Boss matrix:** all ten bosses, three plausible earned-power bands, at least evasive and punish-seeking policies. Start with diagnostic seeds and expand only when variance/failures warrant it. Include the known L5 orbit/punish comparison and L30 ordinary earned-build signature count. Strong builds can clear quickly; typical first encounters should make their identity perceptible.
4. **Overlap stress:** L13 rail+acid/blast, L16 rod approach, L19 wave pressure, plus any changed geometry. Confirm a reachable escape and clear warning with actual hero speed and collision. Bot wins alone cannot establish fairness.
5. **Evolution payoff:** per campaign report rank investment, missing ingredient offers, acquired evolution, time to first evolved hit, affected targets and playable time after acquisition. All 18 signatures need fixture coverage; representative natural acquisitions need earned-play evidence. Do not force every player to evolve every run.
6. **Pacing:** for every level mark its first decision, meaningful pressure changes, time spent only travelling/waiting, reward and next intention. Compare neighboring levels. Flag repeated hold tasks, repeated enemy compositions and long empty approaches; a purposeful quiet story beat is not automatically dead time.

When tuning, report both the benefit and cost: a longer recovery may help melee and trivialize ranged; more closing movement may improve orbit pressure and make a telegraph unfair near a wall. Change one coherent behavior at a time, then compare affected builds. Do not use player spending or failures to secretly alter enemy stats.

## 6. Physical mobile and uncoached player gates

### 6.1 Device session

Use an available named iPhone representative of the project's lower supported target, then another target class if available. Record actual model, OS/browser, settings and thermal conditions. Desktop emulation establishes layout, not sustained phone performance or touch comfort.

Play at least a roughly 20-minute sustained session including peak crowd, multiple weapons, a boss, major scene and district transition. Record frame-time median and tail percentiles, long-frame clusters, memory/texture pressure where measurable and input response. Compare first and last portions for thermal deterioration. Maintain the existing low-tier 30 fps objective; a 60 fps desktop average does not satisfy it. If precise memory/thermal instrumentation is unavailable, say so and include observable symptoms instead of fabricated metrics.

Test both thumb sides, notch/home-indicator safe areas, incoming background/lock interruptions, audio start/resume, silent behavior, reduced motion, minimum quality and largest text. Reduced decoration must preserve movement articulation, threat geometry, heal/damage feedback and essential narrative facts.

If no physical phone is accessible, finish desktop/automated work and mark this gate explicitly pending. Do not endlessly wait, invent device evidence or mark the whole packet “fully verified.” Provide one concise phone checklist and the exact build for the owner/tester.

### 6.2 Formative uncoached playtest

Use an initial 5–8 consenting players unfamiliar with the implementation. This is a qualitative defect-finding sample, not a reliable retention forecast. Do not coach them through interactions or explain the story in advance. Capture observations with permission, avoid unnecessary personal identifiers, and ask short questions after relevant moments rather than during a dodge.

| Observe | Ask afterward | Initial acceptance signal |
|---|---|---|
| First food/station and meaningful damage | “What changed? How did you notice?” | Most players identify actual health benefit/loss without being directed to the bar; investigate every repeated miss |
| First boss opening and death/retry | “What could you do differently? When was it safe to get close?” | Players identify a concrete response rather than only “get stronger/pay” |
| First prop choice | “Why did you use/place that? What did it change?” | They connect object action to a useful local result |
| Frenzy/boss/critical HP on mute | “What changed in the situation?” | They distinguish empowerment, enemy danger and personal critical state |
| Attributes, perks, mastery and run cards | “What stays after this run? What makes this improvement available?” | They can explain temporary versus permanent and practice versus spending without reciting jargon |
| L20, L25 and L30 story | “Who is this person? Why are you going there next?” | Companion/family/destination facts are coherent; no repeated canon misunderstanding |
| End of a session | “What would you try next? Was any part waiting or doing the same thing again?” | Specific desired experiment/story continuation, with identifiable boredom points logged |

Use roughly four out of five correct explanations as an initial repair trigger for a small group, not a universal benchmark or proof of success. Split late-story sessions around earned saves plus an accurate account of what each tester has actually seen; do not claim they experienced the entire journey if they only watched a finale. At least one genuine first-30 human progression remains necessary for a holistic pacing judgment.

Observe voluntary continuation at a natural stopping point and, if participants agree, a later return session. Do not pressure them to keep playing, offer progression-linked compensation or mistake politeness for desire. The useful output is where decisions, emotion or clarity broke down. Real launch retention requires later authorized measurement on a much larger audience.

## 7. Closure gates and final delivery

**Functional blockers:** crash/softlock, input loss, false damage/heal state, unfair unavoidable required hazard, reward duplication/loss, broken choice persistence, canonical contradiction, missing required assets without recovery, or free progression depending on monetization. These block handback as complete.

**Experience blockers:** any priority weapon still looks disconnected from the hand; boss motion lacks readable commitment/recovery; repeated scale pops; enemy roles cannot be distinguished; key interactions cannot be understood; mandatory scenes routinely interrupt danger or repeat on retry; first-30 pacing remains dominated by identical tasks; progression choices mislead. A technical green suite does not waive these.

**Evidence limits:** missing phone/player evidence must remain explicit, with a concrete test plan. A small visible imperfection may be an accepted production tradeoff only when named and assessed; do not bury unfinished whole roster categories under “polish.” The next independent audit makes the quality judgment.

Deliver:

- The E01–E14 matrix plus complete roster/level/scene submatrices, with links to before/after evidence and retained work.
- Exact tested build provenance, focused/full test results, campaign/boss/evolution diagnostics and all adopted balance/presentation deviations.
- A concise walkthrough from launch through L30, with interaction, story and progression checkpoints; explicitly label fixture jumps and unobserved spans.
- Known limitations separated into functional defects, artistic judgments, unavailable device/player evidence and optional future ideas.
- Updated `reviews/REVIEW-R1.md`, and only the necessary source-of-truth/proposed decision updates. Keep docs accurate rather than duplicating incompatible instructions.
- A clear recommendation: ready for independent first-30 audit, or not ready with specific remaining blockers. No “masterpiece,” “Hades parity” or “100 levels approved” claim based solely on this agent's test completion.

The [expansion readiness plan](CHAPTER1-L31-L100-READINESS-2026-11-17.md) remains gated: settle the first-30 quality and evidence requirements, independently review them, then validate the limited next-district pilot. This packet does not authorize building all remaining 70 levels.
