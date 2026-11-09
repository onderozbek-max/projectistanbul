# Project Istanbul: PRD, Vertical Slice (Levels 1–30, a build milestone inside Chapter 1)

> **Status:** v0.1 · 2026-11-08 · Owner: Onder · Reviewer: Opus (lead) · Executor: TBD
> **Strategy and decisions:** [product.md](product.md) · **Story:** [narrative.md](narrative.md)
> **Systems:** [game-design.md](game-design.md) · **Content numbers:** [content-catalog.md](content-catalog.md)
> **Look & feel:** [design-system.md](design-system.md) · **Code:** [architecture.md](architecture.md)
> **Opening level:** [level-001-istiklal.md](level-001-istiklal.md) · **Plan:** [execution-plan.md](execution-plan.md)

This PRD defines **what the vertical slice must do** and **how we'll know it works**.
It does not repeat strategy, story or numbers; it links to the doc that owns them.

---

## 1. Summary

Build the vertical slice, Levels 1–30 = hoods 1–6 (İstiklal → Sirkeci). It is a build milestone inside Chapter 1, which ends at Ataköy, L100 (D-040). Ship the slice as a
**playable, polished, testable mobile build** for iOS (Android port later, product.md D-014). The slice has to prove three things:

1. **The core is fun.** The survivor-like loop holds players for multiple sessions.
2. **The differentiators land.** Story beats, local setting, hero animation quality and
   game feel are noticeably above genre standard.
3. **The foundation scales.** Data-driven content, gameplay-parity quality tiers and
   telemetry are in place, so levels 31–100 are production work, not reinvention.

## 2. Goals and Non-Goals

### Goals (slice)
| ID | Goal | Measured by |
|---|---|---|
| G1 | Fun, sticky core loop | Playtest: ≥ 70% of testers voluntarily play past L10; "would keep playing" ≥ 4/5 |
| G2 | Story and setting feel distinct | Playtest: ≥ 60% name the story or Istanbul setting as a top reason they liked it |
| G3 | Above-genre polish | Side-by-side blind preference vs. a genre leader on hero animation and game feel ≥ 50% |
| G4 | Runs on budget phones | Low tier: 30 fps steady at peak enemy count on the low reference iPhone |
| G5 | Ready to scale | A new level can be added with **data only** (no code) in ≤ 2 hours |

### Non-goals (slice)
Real ads or IAP SDKs (stubs only), cloud save, store, energy system, Chapters 2+,
Mila/Ada as playable heroes, PvP, guilds, live events, Remote Config backend
(local config file only), localization beyond TR + EN. See also product.md §16.

## 3. Target Users (personas)

| Persona | Profile | Needs from the slice |
|---|---|---|
| **Ece, 17, Kadıköy** | High-schooler, plays on her sister's hand-me-down iPhone 11 during the commute, lives on TikTok (her Android friends arrive with the port) | Instantly recognizable Istanbul, jokes she can share, runs smoothly on an old phone |
| **Mert, 24, Berlin** | Turkish diaspora, iPhone, plays survivor-likes, nostalgic about Istanbul | Polished feel, Turkish VO and humor, German/English UI later |
| **Jake, 29, Ohio** | Genre fan, has played the big survivor-likes, wants something new | Build depth, game feel, a story worth following, no language barrier |

---

## 4. Scope

### Content in the slice
| Category | In slice | Source of truth |
|---|---|---|
| Levels | **1–30** = hoods 1–6, one walk from Taksim to Sirkeci (D-027; was 3 districts × 10). Build milestone only; Chapter 1 ends at Ataköy, L100 (D-040). | journey.md §2, §8; content-catalog.md §7 (v0.2, superseded) |
| Heroes | **Arda** (playable), **Kaan** (joins at L20 on the bridge, proposed in journey §9.1; tag-switch enabled in L30 phase 3) | content-catalog.md §1; journey.md §9.1 |
| Card weapons | **Döner Knife** (signature, D-018) + Nail Gun, Gas Canister, Bike Chain (D-017 kit) + six new weapons (D-030) | weapons-skills.md §3–§4; content-catalog.md §2, §10.1 |
| Passives | Running Shoes, Leather Jacket, Work Gloves, Energy Drink, First Aid Kit (D-017) + Nazar Charm, Magnet (D-030) | weapons-skills.md §6.1 |
| Evolutions | Five approved (D-030): Usta's Cleaver, Nail Storm, Cluster Bomb, Chain Cyclone, Wedding Finale | weapons-skills.md §7.1; content-catalog.md §10.3 |
| Enemies | Walker, Runner, Crawler, Brute, Spitter, Exploder, Tourist, Fisherman (+ Elite variants) | content-catalog.md §5 |
| Bosses | Stage-5 boss of each hood H01–H06: The Vatman (L5), Tour Guide (L10), The Bride (L15), Big Fisherman (L20), The Captain (L25), The Ticket Man (L30) | journey.md §2, §5 |
| Story | Level 1 cold open (in-engine); comic pages after each hood boss (D-028); bust pop-ins; Mom's calls; banter barks | story-presentation.md, narrative.md, level-001 |
| Meta | Hero levels, Survival Skills (Arda + Kaan), Workshop weapon mastery (cap M5), 4 gear slots + merge, 4 currencies, stars, world route map | game-design.md §8.1–8.7 |

### Feature scope (epics)
E1 Cold open & onboarding · E2 Core combat · E3 Build system (cards, evolutions) ·
E4 Enemies, spawning & bosses · E5 Level types (Route, Arena) · E6 Story presentation ·
E7 Meta progression & world map · E8 Settings & accessibility · E9 Quality tiers & performance ·
E10 Telemetry & balance tooling · E11 Save/load · E12 Monetization stubs

---

## 5. User Stories and Acceptance Criteria

Format: *As a [persona], I want [X], so that [Y].* **AC** = acceptance criteria (testable).

### E1: Cold open & onboarding
- **US-1.1** As a new player, I want to be playing within 90 seconds of first launch, so
  that I'm hooked before I get bored.
  **AC:** first launch → first player input ≤ 90 s (including the cold-open cinematic);
  no account creation, no permissions prompt before L1 ends.
- **US-1.2** As a new player, I want the first stab to be *my* action, so that the opening feels earned.
  **AC:** the cinematic pauses for the Tap (grab knife) and Swipe (stab) prompts and waits
  indefinitely (no time-out fail); the stab triggers hit-stop, the comic SFX "ŞAK!" and camera punch.
- **US-1.3** As a new player, I want to learn by playing, not by reading.
  **AC:** max 1 tutorial prompt on screen at a time; every prompt is ≤ 6 words + icon;
  L1 teaches move, auto-attack, XP pickup, level-up card, interactable, and holding a zone,
  in that order (see level-001 §5).
- **US-1.4** As a returning player, I want to skip what I've seen.
  **AC:** cinematics are skippable after the first view; skip needs a hold (0.6 s) to
  prevent accidental skips.

### E2: Core combat
- **US-2.1** As a player, I want one-thumb control.
  **AC:** floating joystick appears where the thumb lands in the lower 60% of the screen;
  dead-zone 8% of joystick radius; release = stop (no drift); attacks are automatic.
- **US-2.2** As a player, I want hits to feel powerful.
  **AC:** game-feel spec from design-system.md §7 implemented (hit flash, knockback,
  damage numbers, hit-stop rules, screen-shake caps); "Reduce motion" disables shake and slow-mo.
- **US-2.3** As a player, I want to always see myself and the danger.
  **AC:** readability rules from design-system.md §6 pass the screenshot review at peak density
  (player outline + ground ring always visible; enemy telegraphs ≥ 0.5 s, bosses ≥ 0.8 s).

### E3: Build system
- **US-3.1** As a player, I want meaningful choices at every level-up.
  **AC:** 3 cards per level-up using the weighting rules in game-design.md §5; never offers
  maxed items; 1 free reroll per run; game is paused while choosing.
- **US-3.2** As a player, I want to discover evolutions.
  **AC:** when a weapon is L5 and its paired passive is owned, its card shows an "EVO ready"
  hint; the next boss chest evolves it with a dedicated reveal (≤ 2.5 s, skippable).
- **US-3.3** As a new player, I don't want to be overwhelmed by options.
  **AC:** the card pool unlocks progressively per game-design.md §5.4.

### E4: Enemies, spawning & bosses
- **US-4.1** As a player, I want enemy variety that changes how I move.
  **AC:** each enemy archetype in the slice has a distinct silhouette, a distinct behavior
  and a first-appearance level per content-catalog.md §5.
- **US-4.2** As a player, I want bosses to be memorable, readable fights.
  **AC:** each boss has ≥ 2 phases, every attack is telegraphed per design-system.md §6,
  and the HP bar shows name and phase markers.
- **US-4.3** As the designer, I want spawns driven by data.
  **AC:** spawn director reads WaveScript resources (architecture.md §4.9); no spawn logic
  hard-coded in level scenes.

### E5: Level types
- **US-5.1** As a player, I want levels that feel like a journey.
  **AC:** **Route** levels (corridor + hold zones, like L1) and **Arena** levels (survive
  the timer in a bounded area) both work; each hood mixes them per journey.md §3 (replaces the district template in game-design.md §6).
- **US-5.2** As the designer, I want to add a level without code.
  **AC:** a LevelDef resource (map, wave script, modifiers, boss, rewards, story hooks) is
  enough to make a new playable level; verified by adding a test level in ≤ 2 h.

### E6: Story presentation
- **US-6.1** As a player, I want story scenes that look like a dizi on my phone.
  **AC:** motion-comic player supports panels, pan/zoom, parallax layers, speech bubbles,
  VO with subtitles, tap-to-advance, auto-advance, and the "dizi triple zoom" cliffhanger
  (design-system.md §9).
- **US-6.2** As a player, I want characters to talk during fights.
  **AC:** bark system plays short context lines (first level-up, low HP, boss phase, Kaan
  joins) with a cooldown of ≥ 20 s between barks.

### E7: Meta progression & world map
- **US-7.1** As a player, I want to see how far I've walked across Istanbul.
  **AC:** world map shows the Taksim → Ataköy route with level nodes, the current position,
  and "X.X / 17 km" progress; tapping a node shows stars and the replay option.
- **US-7.2** As a player, I want to get stronger between runs.
  **AC:** hero levels, Survival Skills trees, Workshop mastery and 4 gear slots with merge
  (3 identical → next rarity) per game-design.md §8.2–8.6; all costs are data-driven;
  every earn/spend logs `currency_flow`.
- **US-7.3** As a player, I want rewards for doing well.
  **AC:** 3 stars per level (clear / no revive / ≥ 50% HP at end); star chests per hood.

### E8: Settings & accessibility
- **US-8.1** As any player, I want the game to adapt to me.
  **AC:** settings for music/SFX/voice volume, subtitles (on by default), text size
  (100/125/150%), colorblind palettes (3), reduce motion, haptics, left-handed HUD mirror,
  auto-ultimate, quality tier override, language (TR/EN). Full checklist: design-system.md §11.

### E9: Quality tiers & performance
- **US-9.1** As a budget-phone player, I want the same game as everyone else, just less fancy.
  **AC:** 3 tiers (Low/Mid/High) auto-detected at first launch and overridable; an automated
  test asserts that simulation code never reads the quality profile (architecture.md §4.17).
- **US-9.2** As any player, I want a smooth game and a small download.
  **AC:** budgets in §6 below are met on the reference devices.

### E10: Telemetry & balance tooling
- **US-10.1** As the PM/reviewer, I want every playtest to produce data.
  **AC:** telemetry events in game-design.md §10 are written as JSONL to a local file,
  exportable from the settings screen (share sheet) and, in dev builds, from the app's Files folder (file sharing enabled).
- **US-10.2** As the designer, I want to balance without playing 500 runs by hand.
  **AC:** a headless bot simulator runs N seeds per level with 3 bot strategies and writes
  a CSV report (clear rate, time to first level-up, level-ups, deaths by cause).

### E11: Save/load
- **US-11.1** As a player, I never want to lose progress.
  **AC:** versioned local save with migrations; saves after every level, purchase, upgrade
  and setting change; corrupted save → fallback to backup slot, never a crash.

### E12: Monetization stubs (real store, ads and passes come in soft-launch prep)
- **US-12.1** As the PM, I want monetization touchpoints testable without real SDKs.
  **AC:** every rewarded-ad placement in game-design.md §8.13 calls an `AdsService` interface
  with a fake implementation (3 s placeholder); a fake `IapService` can grant a test bundle;
  results are logged to telemetry.
- **US-12.2** As the PM, I want the economy ready for monetization.
  **AC:** all four currencies exist with sinks and faucets per game-design.md §8.1; power caps
  per §8.15 are enforced; the bot simulator reports currency earned per level.

---

## 6. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Platforms | **iOS 16+** first (iPhone XS/XR and newer). Android 10+ in the port phase. Portrait only. |
| Reference devices | **Low:** iPhone 11 or iPhone SE (2nd gen), A13 class; buy a used one for testing. **Mid:** iPhone 13. **High:** iPhone 15 Pro Max / iPhone 16 Pro (owner's devices). |
| Frame rate | Low: 30 fps steady (p95 frame time ≤ 36 ms) at 300 on-screen enemies. Mid/High: 60 fps (p95 ≤ 18 ms). |
| Simulation | Fixed 60 Hz on all tiers; identical results for identical seed + inputs. |
| Load times | Cold start to main menu ≤ 6 s (Low); level load ≤ 3 s (Low). |
| Install size | Base ≤ 150 MB; HD assets as on-demand download for Mid/High. |
| Memory | ≤ 600 MB (Low), ≤ 1 GB (High). |
| Battery/thermal | 20-minute session must not trigger thermal throttling on Mid devices (verified by playtest). |
| Stability | Crash-free sessions ≥ 99.5% in playtests. |
| Accessibility | UI text contrast ≥ 4.5:1 (≥ 3:1 large), no flashes > 3 per second, touch targets ≥ 48 dp. |
| Localization | All strings keyed; TR + EN complete; Turkish casing rules respected (design-system.md §10). |
| Privacy | No personal data collected in the slice; telemetry uses a random install ID only. |

## 7. Success Metrics (slice playtest, 10–20 external testers)

| Metric | Target |
|---|---|
| L1 completion | ≥ 95% |
| Reach L10 in first session | ≥ 50% |
| Median first-session length | ≥ 12 min |
| Voluntary return next day (D1, playtest group) | ≥ 50% |
| Cinematic skip rate (first view of L1) | ≤ 20% |
| "Would keep playing" (1–5) | ≥ 4.0 |
| Average first-attempt clear rate per level | Within the bands of game-design.md §7 |

## 8. Release Criteria for the Slice (go/no-go for soft-launch prep)

1. All P0 stories (E1–E5, E7, E9, E10, E11) meet their AC.
2. Performance budgets met on the Low reference device.
3. Playtest metrics in §7 met, or deviations explained with a fix plan.
4. Zero known crashers, zero blocker bugs.
5. Lead review (Opus) signs off on the review packet for M7 (execution-plan.md §4).

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Engine can't push 300–500 enemies on low-end | Med | High | M0 stress test before anything else; SoA swarm + MultiMesh; fallback ladder (architecture.md §4.2) |
| AI art inconsistency | High | High | Style model + reference sheets + review checkpoints (design-system.md §12) |
| Core loop "fine but not fun" | Med | High | First playable at M1 (~week 3); iterate before art spend |
| Scope creep | High | Med | Non-goals list; every addition needs a decision-log entry |
| Executor writes Godot 3 code | High | Med | Pitfalls table in architecture.md §8; review checks |
| Story scenes get skipped | Med | Med | Short scenes (≤ 45 s), barks during gameplay, skip-rate telemetry |
| Turkish humor misses for global players | Med | Med | Visual-first jokes; EN playtesters in every round |

## 10. Open Questions

1. Final engine (D-004), decided at the end of M0.
2. Hand-painted 2D style direction, picked from style frames in M4.
3. Turkish VO: hire voice actors for the slice, or temporary AI VO until the demand test?
4. Playtest recruitment channel for Turkey (Discord, university clubs, TikTok call-out)?
