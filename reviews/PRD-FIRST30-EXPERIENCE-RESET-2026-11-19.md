# First 30 levels player experience production brief

**19 November 2026 · Prepared for the owner and implementation agent · Proposed production direction.**

The assignment is a perceptible improvement to the entire existing first-30 game: all ten bosses, all weapons and evolutions, every level, progression discovery, interaction feedback and dramatic presentation. The Cook is one example of a roster-wide failure, not the scope. A complete L1 sequence can be the first integration checkpoint; it is not an acceptance sample for the other 29 levels and not a stopping point.

This packet consolidates the independent Audit10 findings, the owner's subsequent negative play evidence and fresh source review. It is not another newly completed playthrough. The previous audit's claim of substantial core gameplay improvement is withdrawn. Verified interface repairs remain repairs; they do not establish enjoyable combat, physical animation or emotional impact.

## 1. Read and execute this complete packet

1. This document: scope, quality standard, feedback, growth and execution order.
2. [All bosses and weapons](PRD-FIRST30-COMBAT-CRAFT-2026-11-19.md): individual performance and tactical requirements.
3. [All levels and scenes](PRD-FIRST30-JOURNEY-DIRECTION-2026-11-19.md): decisions, pacing, companionship, story and assets.
4. [Acceptance and handback](PRD-FIRST30-ACCEPTANCE-2026-11-19.md): evidence, failure conditions and complete coverage.

Historical evidence remains in [Audit10](GAMER-AUDIT-PASS10-2026-11-19.md), its [level/asset appendix](AUDIT10-LEVELS-AND-ASSETS-2026-11-19.md), [verification appendix](AUDIT10-CLOSURE-AND-VERIFICATION-2026-11-19.md) and [owner addendum](AUDIT10-OWNER-FEEL-ADDENDUM.md). This packet supersedes their implementation prioritization: detailed craft work is required for **every boss**, not only Cook/Bride/Captain. It does not overwrite their evidence limitations.

## 2. What failed and what success means

| Evidence | Failure that remains | Required outcome |
|---|---|---|
| Owner play: bosses disappear into scenery | Visual hierarchy, not lack of a boss health bar | Boss body, weapon and current threat remain identifiable in normal phone-scale combat |
| Owner play plus source: crude boss motion | Seven atlas bosses select two locomotion cells; segmented body transforms cannot supply missing anatomy | Weight, foot contact, turn, attack and recovery form a continuous individual performance |
| Owner play plus source: unsatisfying defeat | A 1.47-second generic transform/fade with profile fragments already exists | The final hit interrupts a particular opponent, resolves their particular tool/action, then creates release and reward |
| Owner play plus source: orbiting Cleaver | The simulation itself sweeps a continuously rotating hero-to-tip damage line | Deliberate body-led wielding or coherent throw/return, with matching damage geometry |
| Owner play: damage goes unnoticed on mute | Existing local arcs/critical chevrons/edge pulse lose the attention contest | A player looking at combat notices injury, continuing danger and actual recovery without HUD vigilance |
| Owner play: hurt cue annoys | Actual hero hurt and diner conversion currently share a cue | Separate appropriate sound roles; repeated injury remains informative without abrasive repetition |
| Independent play and campaigns: signatures skipped | Some ordinary first-entry bosses die after one action family | Early legible signature and meaningful response; strong builds retain legitimate power |
| Independent play: late/obscured Cleaver | Transformation after Cook; chest masks the reveal | Useful earned transformations and orderly reward ownership |
| Owner play: progression buried | Information quality after opening a menu is not discovery | Earned growth is invited, understood, applied and connected to the next run |
| All30 sampled/source review | Different props can still ask the same wait-in-ring decision | Different decisions and visible consequences across adjacent levels |
| Owner play: little dramatic payoff | Scene paths and actor presence exist without sufficient acting | Action, reaction, changed relationship or changed space, then meaningful handback |

These are not solved by adding another profile, ring, outline, banner, particle system, test or telemetry event. Those may support a solution, but the outcome must be visible in ordinary play.

Use Hades as a craft aspiration: readable intent, bodily commitment, tactical response, coherent impact, authored personalities and dialogue that respects action. Preserve this game's portrait, one-thumb survivor format and Istanbul identity. No copying characters, assets, combat systems wholesale or pretending a checklist establishes parity.

## 3. Quality standard for every work item

Each item must answer four questions: **What does the player notice? What do they decide? What changes because of their action? Why does that make the next moment worth playing?**

Record status separately:

- **Implemented:** the mechanism and integration exist.
- **Technically verified:** relevant behavior, lifecycle and regression checks pass.
- **Presentation reviewed:** the actual moving/sounding experience was inspected through an available method, with method and limits stated.
- **Player validated:** a person performed the specified task without explanation; record their response and failures.

One status never automatically grants the next. A bot cannot validate felt weight, surprise, comprehension, attachment or desire to return. A still cannot validate fluid motion. An audio waveform cannot validate annoyance. An owner-reported failure remains open until the corresponding perceptual outcome is reassessed; source changes alone cannot overrule it.

Do not average away major failures. A beautiful comic cannot compensate for an unreadable boss; a fluid hero cannot compensate for floating weapons; a green test suite cannot compensate for a boring encounter. Avoid invented numerical masterpiece scores or completion percentages for unaccepted experiences.

## 4. Preserve and constrain

Work in the active JS prototype only. Preserve accepted Arda locomotion, latest current artwork, compact mod layout, Memories lifecycle repairs, native D-119/D-121/D-122 dialogue and canonical plot. Ordinary enemy work targets threat identity and actual defects, not a costly detailed rig overhaul for the entire swarm.

No production beyond L30, new mode, engine migration, dependency/service, paid purchase, real ads/IAP, commit, push or merge. No forced payment/ad wall. No stealth dynamic scaling to cancel player power. No extra mandatory tasks simply to lengthen runs. Maintain sim/view separation, deterministic inputs, config-owned numbers, localization, Turkish casing, file/function limits and flash limits.

Record intentional combat, progression and level changes as proposed decision entries and exact balance deviations. When the owner sends the execution prompt, its explicit first-30 scope authorizes the described design work; do not stop for routine choices or after each internal checkpoint. Genuine out-of-scope approvals remain separate. Continue unaffected work if one asset, tool or device is unavailable.

N1 alternate starters, N2 an additional environmental boss counter and N3 curated replay were previously deferred. They are not secretly reclassified as failed fixes. This pass makes the existing street interactions, build choices and boss counters compelling; do not substitute a new system for that work.

## 5. Shared combat presentation requirements

### F01 Hero injury, health and defense

Treat the owner-reported perceptual failure as open even though `health-feedback.js`, `fx.js` and `skills-fx.js` already draw cues. Current hurt includes a short pale directional arc; low health includes small chevrons. Reduced flash suppresses some edge treatment. Redesign their combined visibility, not merely their existence.

- At an actual damaging contact, show a compact local body/contact response distinct from Arda's attack recoil. Preserve movement and inputs; no repeated stun lock. Keep the hero silhouette visible rather than turning the whole actor into an opaque flash.
- Indicate an actual damage source when known; do not invent a direction for environmental or unattributed damage. Ensure the cue survives camera rotation/projection and target crossing.
- Communicate sustained critical danger with a bounded persistent shape/value treatment that works with sound, shake and flashes disabled. It must remain distinguishable from frenzy and poison. Recovery should visibly release it; use the current threshold hysteresis or deliberately retune and record it.
- Healing travels from the consumed object/station into a hero-local restorative action and truthful HP increase. If hurt and heal occur together, show both events without falsely implying net recovery. Full-health simit remains available with a quiet stored-for-later affordance; do not consume it for zero benefit or repeatedly nag.
- Shield/block means a prevented hit, not ordinary injury. Invulnerability means actual protection, not an aura applied during vulnerable time. Death and last-breath assistance must have clearly different outcomes.
- Test single light hit, heavy hit, repeated swarm hits, ranged source offscreen, hazard tick, heal while hurt, blocked hit, critical entry/recovery, first-run assistance and death. Cover HUD in a review exercise; injury/recovery still need to be understandable.

### F02 Mood and attention hierarchy

Priority is hero position and imminent harmful geometry, then source/action/recovery, then interaction needed now, then reward/banter/cosmetics. Implement a shared presentation policy rather than individually increasing all cues.

| State | Required visual change | Exit and competition rule |
|---|---|---|
| Ordinary street | Stable scale, readable surfaces, room for ambience | Reserve peak contrast and movement for threats |
| Frenzy | Sustained, recognizable hero/attack rhythm and bounded shape treatment; energetic without filling the screen | No repeated giant labels; critical-health information remains legible; end resolves visibly |
| Boss entrance | Protected framing and local value separation; weapon/body establish ownership of the space | Return full evasion framing before damage resumes; no cinematic crop of live hazards |
| Boss phase/combination | Body behavior and usable space change; a meaningful tactical escalation | A title alone is not a new phase; retain readable lead time and an escape option |
| Exposure/recovery | Material/shape distinct from hostile warnings; spent body supports the opportunity | Marker appears at boss feet and ends with actual vulnerability |
| Victory | Final physical action resolves, hostile spectacle releases, reward follows | No buried evolution, ongoing invisible damage, duplicate settlement or premature exit prompt |
| Grief/rest | Reduced visual chatter and incidental barks; space for character reactions | Re-entry restores control and route orientation, not a surprise hazard |

Default and reduced settings must communicate the same facts. Use shape, motion and value as well as hue. Do not equate brighter with clearer. Boss emphasis may require quieter scenery and fewer friendly fills rather than a larger glow.

Stress the actual collision of states: critical HP + boss commitment + frenzy + six legal weapons + usable nearby prop. Repeated SCREAM/BOOM text, broad flame fills and redundant bursts yield to dangerous geometry. Avoid full-screen flashes; respect the project maximum of three flashes per second across combined effects, not independently per emitter.

### F03 Audio direction

Separate `heroHit` hurt from cold-open conversion; preserve appropriate scene intent. Audit the actual rendered mix, not just cue files. Review repeated sequences, not one isolated sample.

- Injury: concise bodily/contact cue with restrained sharpness, variation and bounded retrigger/polyphony. Heavy hits and light scrapes need readable hierarchy without a chorus of identical yelps.
- Weapons: source, motion and contact layers support material identity. Misses do not play the full impact; persistent saw/cable/fire loops start and end with actual action and stop on pause/scene exit.
- Bosses: preparations have identifiable sounds, but every required fact also has a visual equivalent. Let signature tool/body sounds survive ordinary weapon noise.
- Music: ordinary build-up, frenzy, boss entry, tension release and quiet aftermath have deliberate transitions. Avoid track restart on every state flicker, abrupt stacked streams, or triumphant music drowning the Captain's grief. Reuse current owner music and the existing motif; do not commission paid replacements unasked.
- Speech/readings: danger has priority; no detached replies to unheard lines. Panel/page accents remain sparse. Respect the newer native writing and contextual triggers.
- Test phone speaker/headphones if available, mute music only, mute SFX only, all sound off, pause/resume, interruption and repeated runs. A tool that cannot listen must leave audible approval open and provide usable recordings rather than claim it heard them.

## 6. Progression that players discover and understand

### G01 One coherent invitation

At the first genuinely earned attribute rank, show a specific result action naming the ready attribute and real benefit. It opens that attribute directly; application shows before/after, saves exactly once and returns to the next-run choice. No zero-point modal, no false LEVEL CLEARED after a loss, no blinking unrelated currencies. Later reminders are contextual and dismissible, not forced menu visits after every run.

Attributes are earned ranks from relevant actions in the current system. Perks are distinct, rank-gated purchases using Street Cred. Do not accidentally redesign attributes as Street-Cred purchases. Keep run cards, permanent attribute growth, perks, mastery and gear visibly separate in persistence and purpose.

### G02 Information architecture contract

| Surface | What the player must understand without a manual |
|---|---|
| Map/home | Next playable level; one most relevant available growth action; where to return for character development |
| Attribute | What action earns it; progress to next earned rank; current effect; exact next effect; linked perk eligibility |
| Perk | Distinct behavior/bonus; attribute prerequisite; Street Cred cost; available/locked/owned; whether it affects current loadout |
| Weapon/mastery | Run rank versus lifetime mastery; exact next mastery benefit; relevant kills/progress; evolution recipe and applicable mods |
| Card choice | Current owned plan, missing recipe pieces, meaningful effect and tradeoff; selection is never auto-forced by a recommendation |
| Pause | Current HP/status/objective; inspectable current build and active effects; clear distinction from permanent growth; accessible resume/settings |
| Result | Cause of success/loss, actual rewards, earned growth, useful next action; no ad purchase presented as necessary progress |

Use small concrete numeric comparisons alongside plain language. A percentage of radius is not a percentage of area; cooldown reduction is not attack speed; armor is not health. Surface caps and conditional applicability where they affect a choice. Do not advertise a tiny gain as a new play style. If the first progression benefits are imperceptible, revise the actual early progression balance coherently and report the change rather than embellish copy.

### G03 Useful build payoff

Fix the reproduced Knife5 + Work Gloves + Cook + queued chest sequence. Give evolution discovery exclusive foreground ownership, then the queued reward, then story/exit as appropriate. Paused/covered reveals do not consume their visible time. Keep reward transactions exactly once through skip, background and reload.

In earned runs, record investment, missing ingredient access, offer, acquisition, first meaningful use and remaining encounter. One hit during cleanup is not a successful power crescendo. Diagnose the broad policy's Cleaver concentration with different plausible choices, not a bot hardcoded to obtain eighteen showcase items. Preserve uncertainty and tradeoffs; do not promise every run its perfect evolution.

Report actual post-evolution damage, kills or control contribution, the remaining meaningful encounter and whether the distinctive evolved behavior could be exploited. Late, obscured or behaviorally unused transformations remain failed payoff cases even if acquisition and hit assertions pass. Do not turn this into an arbitrary damage quota or guarantee an evolution every run.

## 7. Small defects remain part of the assignment

Close each existing P10 finding explicitly, alongside the major craft work:

1. Evolution arriving too late and reveal covered by chest: timing and ownership are separate fixes.
2. Boss signatures skipped: first-entry learning and strong rematches are separate balance cases.
3. Repeated hold/open/exit decisions: apply the all30 matrix.
4. Dense friendly effects, large lettering and competing warnings: apply F02 at actual density.
5. All-boss and all-weapon continuous physical craft: complete the combat appendix, not three examples.
6. Cream build-inspection caption contrast; new-offer retained scroll/focus; hidden legacy attribute flow/AX after defeat; neutral NO SIGNAL portrait; failure coaching that suggests unattainable rank5 rather than immediate cause/response.
7. Black-world interval in supplied Molotov-rank3 recording: reproduce and classify capture versus runtime; do not silently replace the evidence and assume it was harmless.

Also inspect near misses systematically: hitbox versus painted shape; disappearing/overlarge props; anchors/feet across frames; wrong mirror/facing; occluding foreground; required versus optional markers; missing artwork; sound loops surviving transitions; stale prompts after moving away; double-taps crossing into a new screen; safe areas/large text; save and return after defeat/skip/replay; controller release on resume. Record newly found defects with reproducible steps, not an unbounded list of hypothetical risks.

## 8. Execution order and autonomy

1. Preserve and identify the baseline. Build a coverage ledger for all ten bosses, 17 base weapons, 18 evolutions, 30 levels and named scenes. Capture representative current behavior before editing; don't spend the whole session producing exhaustive baseline films.
2. Establish actual body/tool motion and the injury/readability policy. Prototype on materially different bosses, including an atlas boss and a specialized boss, to prove the approach is not Cook-specific. Fix attack geometry if necessary.
3. Integrate a complete L1 and at least one later earned encounter. Inspect the result at normal scale. If the difference is still only apparent with an explanation, revise the implementation rather than propagate it.
4. Complete every boss and weapon row; balance legal first-entry and replay builds; apply level/scene/progression requirements across L1–30. Do not stop at the benchmark or merely create profiles for the rest.
5. Run focused checks throughout, then final full suite in the background while completing rendered journey and regression work. Diagnose failures; keep evidence of retries and losses. Finish all feasible verification and package the exact candidate.

This is one integrated assignment, with internal checkpoints rather than owner approval after each step. Hours spent are not success criteria. Continue until the packet is implemented and verified as far as the available tools permit, or a concrete external blocker prevents a specific remaining task. Missing device/player feedback does not justify leaving feasible production work unfinished. Conversely, do not invent device, audio or artistic acceptance to make the packet look complete.

The requested outcome is a significant demonstrable improvement and a candid handback. Masterpiece status and expansion remain separate decisions after play.
