# Project Istanbul: Product Decisions & Principles

> **Status:** Draft v0.3 · 2026-11-08 · Owner: Onder · v0.4 pass: journey (D-027), comic story (D-028), music (D-029), arsenal and skills (D-030, D-031), decisions D-017–D-026 adopted · v0.5 pass: D-032–D-040 added (details per workstream, see reviews/AUDIT-5-2026-11-08.md)
> **Scope:** Product, design, tech and business decisions. The story lives in
> [narrative.md](narrative.md); money lives in [business-plan.md](business-plan.md).
> This doc only references them (DRY).

---

## 1. One-liner

**A story-driven survivor-like set in a zombie-overrun Istanbul.** It plays like Survivor.io
but feels like a Turkish dizi: a squad you care about, a real route across real neighborhoods,
and cliffhangers that bring players back.

### 1.1 Title (D-012, proposed): the only place the game title is defined
Code name: **Project Istanbul**. The title must work in Turkish **and** globally, and must
franchise to other cities as `<Title>: <City>`.

| Candidate | Turkish store name | Why | Risk |
|---|---|---|---|
| **No Signal: Istanbul** (recommended) | *Sinyal Yok: İstanbul* | Built into the story (networks die, the dropped call, the signal bars on the HUD). Every Gen Z player on earth knows the panic of "no signal". Level 1's phone text can morph straight into the logo. Franchises cleanly: *No Signal: Athens* | Needs trademark/App Store checks; "no signal" is a common phrase (harder to own in search, so the city carries it) |
| **Last Stop: Istanbul** | *Son Durak: İstanbul* | Great transit pun in Turkish; fits the journey | Collides with *Last Stop* (Variable State / Annapurna, 2021) in English search |
| **Homebound: Istanbul** | *Eve Dönüş: İstanbul* | Emotional, says "journey home" | Generic; crowded in search |

**Before locking:** App Store search, trademark searches (USPTO, EUIPO, TÜRKPATENT), domain and
social handles. The App Store subtitle carries the genre keywords (e.g., "Zombie Survival RPG").

## 2. Why this, why now

- **Demand:** mobile gaming is very common among young Turks, and Istanbul is one of the
  world's mobile-game capitals (Peak, Dream Games, Rollic, Spyke...).
- **Gap:** no strong game uses Istanbul as a setting. Turkish studios build placeless global games.
- **Different from the competition:** survivor-likes look and feel interchangeable. Very
  few have characters, story or polished animation.
- **Expansion engine:** the story moves across Turkey (İzmir in Ch. 3), and the tech is
  built for other cities (Athens and others, see §13).

### The uncomfortable truth (and the fix)
Turkey has **low revenue per user** (lira depreciation, regional pricing, low ad rates).
A Turkey-only game can get lots of downloads and earn little.
**Fix: Istanbul flavor, global appeal.** Three audiences:

| Audience | Why | What they need |
|---|---|---|
| Turkish players (13–30) | Volume, word of mouth, TikTok | Local jokes, Turkish VO, recognizable streets |
| Turkish diaspora (Germany ~3M, NL, AT...) | Higher spend, nostalgia | German/English UI, the same local soul |
| Global survivor-like / zombie fans | Biggest market | Universal visual humor, story, polish |

### Platform: iOS first (D-014)
Build and launch on **iOS first** (owner's hardware and developer accounts, higher spend per
player, strong in the diaspora and global markets). Turkey itself is mostly **Android**, so an
Android port is required before any big Turkish growth push. The architecture stays
cross-platform (Godot), so the port is mostly store, SDK and device-QA work. Details:
business-plan.md §4.

## 3. Product Pillars

Every feature has to support at least one pillar. If it supports none, cut it.

1. **Local soul, universal delivery.** Real places, real food, real humor that still lands
   without subtitles.
2. **Story is the differentiator.** Characters, bonds and cliffhangers are features, not decoration.
3. **Polish where the eyes are.** Spend quality on the heroes, game feel and story scenes,
   not on zombie #347.
4. **One game, every phone.** Same gameplay on an old budget phone and a flagship; only the visuals scale.
5. **Data decides.** Release timing, difficulty and economy are tuned from live metrics
   through remote config.
6. **Solo-sized scope.** Built by one AI-assisted builder. YAGNI is policy, not advice.

---

## 4. Core Game Design

### Core loop
`Pick level → auto-attack survivor run (5–10 min) → level-up skill picks → boss →
loot & story beat → upgrade squad / weapons / vehicle → next level`

### Base genre (keep what works)
- One-thumb movement, automatic attacks, a choice of 3 random skills on each level-up.
- Short runs, a boss at the end of each hood (every 5 levels, D-027), persistent upgrades between runs.

### Our differentiators
| # | Feature | Why it matters |
|---|---|---|
| D1 | **Squad with tag-switch:** swap control between heroes mid-run; the others fight automatically | Role variety, more of every hero on screen |
| D2 | **Distinct hero roles:** tank (Kaan), speedster (Mila), versatile (Arda), ranged/support (Ada) | Reasons to invest in everyone |
| D3 | **Vehicle levels:** scooter (Ch. 2), car (Ch. 3), with a garage/upgrade meta | Pace changes; makes the "toolkit" story real |
| D4 | **Human enemies fight differently:** cover, flanking, loot theft vs. zombie swarms | Same controls, new tactics |
| D5 | **Interactive scenery:** simit carts, tea glasses, gas canisters, the döner skewer | Local flavor through gameplay |
| D6 | **Day/night cycle:** day = scavenging and humans, night = zombie horror | Variety and atmosphere |
| D7 | **Bond system:** bonds unlock combo ultimates (see narrative.md, *Romance & Branching*) | Story choices with gameplay payoff |
| D8 | **Street cats as early warning:** they hiss near zombies; collectible cosmetic cats | Shareable, globally loved, monetizable |
| D9 | **Survival resource per chapter:** none → battery charge → fuel | Each chapter feels new without new systems |

### Characters (stats summary; personalities in narrative.md)
| Hero | HP | Speed | Damage | Unique |
|---|---|---|---|---|
| Arda | Mid | Mid | Mid | Spec in any direction; hacking and crafting |
| Kaan | High | Low | High | Ground Slam; draws aggro |
| Mila | Low | Very high | Mid | Dash strikes; kiting |
| Ada | Low | Mid | Mid (ranged) | *Calm* aura slows zombies (also a story clue) |

---

## 5. Content Structure

- **Chapter = 100 levels = 20 neighbourhoods (hoods) × 5 levels, one walk from Taksim to Ataköy (17 km).** *(Decision D-027, which amends D-001's 10 districts × 10 levels)*
- Level 5 of each hood is the hood boss. A comic page closes each hood (D-028). Route, bosses and
  stage template: `journey.md`.
- **Solo-builder rule:** 100 levels are *assembled* from reusable parts, not hand-crafted
  one by one: `hood sheet × stage template × modifier (night, fog, horde, human ambush) × boss`.
  20 hood sheets, one stage template, three boss types in the slice, ~10 modifiers. Level 1 stays hand-built.
- Story beats on most levels: bust pop-ins, calls and letters. Comic pages close each hood (`story-presentation.md`).

## 6. Chapter Release & Gating Policy *(Decision D-002)*

**Intent (Onder):** unlock the next chapter once ~5% of players reach the end of the current one.
**Adopted version (with safeguards):**

1. **Production is never the gate.** Chapter N+1 is finished and tested *before* the trigger
   can fire. The gate is about pacing, not about buying build time.
2. **Count the right players.** The trigger counts *qualified active players*: reached
   level 10 **and** active in the last 28 days. Not total installs.
3. **Trigger:** the next chapter unlocks when **5% of qualified active players** have
   reached the chapter's final level, **or** when the **first 1% of finishers have waited
   21 days**, whichever comes first.
4. **Make the wait public:** an in-game community progress bar
   (*"Survivors who reached Ataköy: 3.2% / 5%"*). Unlock day becomes a marketing event.
5. **Finishers always have something to do:** the endgame (§7) is live before Chapter 1 ships.
6. **Everything is tunable:** the threshold %, the qualifying rules and the max wait live in
   remote config. They change without an app update.
7. **Know the trap:** difficulty and gear tuning set the pace, so check the actual
   level-funnel data before trusting any fixed %.

## 7. Endgame (for players waiting on the next chapter)

- **Night Shift:** an endless survival mode with weekly leaderboards.
- **Hard Mode:** replay finished districts with modifiers and better loot.
- **Weekly events:** light, playful local themes (e.g., "Simit Rush", "Ferry Panic").
  No religious holidays or political dates as event themes.
- **First Arrivals badge** for early finishers; status matters to superfans.

---

## 8. Quality & Performance *(Decision D-003)*

**Principle:** quality tiers, not lowest-common-denominator art. High-end phones get the
premium version; budget phones get a lighter one. **Gameplay is identical on every tier.**

| Scales by tier (visual only) | Never scales (gameplay) |
|---|---|
| Texture resolution, render resolution | Enemy count and spawn timing |
| VFX/particle density, post-processing, shadows | Hitboxes, speeds, damage |
| Animation detail at a distance | Level layouts, difficulty |
| Corpse persistence, decals, ambient props | Rewards and economy |

**How:**
- **Enemies are cheap by design:** GPU instancing or sprite batching, simple shaders,
  distant LOD. Enemy count is tuned so it runs on the low tier, and the visuals scale up from there.
- **Heroes get the premium budget:** full animation sets, hit reactions, personality idles.
- **Game feel is mostly free:** hit-stop, screen shake, knockback, punchy death animations, audio.
- **Auto-detect the tier on first launch,** and let players override it in settings.
- **Keep the download small:** base install < 150 MB. HD assets download after install,
  only on capable phones (iOS On-Demand Resources; Play Asset Delivery when Android comes).
- **Performance budgets:** low tier 30 fps steady on the low reference iPhone (A13 class:
  iPhone 11 / SE 2nd gen); high tier 60 fps on iPhone 15 Pro Max / 16 Pro.
  Tested on real devices, every milestone.
- **Cost to remember:** every tier multiplies QA. Ship with **3 tiers max** (Low / Mid / High).

## 9. Art, Animation & Audio Direction

- **Style:** 2D, top-down 3/4, hand-painted environments + ink-outlined characters (D-007).
  Details: design-system.md. Final direction picked from style frames (execution-plan.md M4).
- **Story presentation:** **motion comics** (animated comic panels) instead of 3D cutscenes.
  Cheap, AI-art-friendly, stylish, and they read like a dizi.
- **Signature move:** the dizi cliffhanger (freeze frame, triple zoom across faces, strings).
- **Voice:** Turkish VO for key scenes and cliffhangers first (Turkey has a strong dubbing
  culture); English/German subtitles and later VO.
- **Music:** modern beats mixed with ney, bağlama and darbuka. Check licensing on every
  AI-generated track.
- **Consistency is the hard part:** train a custom style model (e.g., Scenario) on approved
  art and generate everything through it.

## 10. Monetization

Monetization is designed **into** the game systems, not bolted on. The full plan (principles,
system-by-system hooks, store catalog, pricing, ads, KPIs, revenue model) lives in
[business-plan.md](business-plan.md); the mechanics of each system live in
[game-design.md](game-design.md) §8. Headline rules:
- **Everything that affects power is earnable by playing;** money buys speed, convenience and style.
- **No paid random loot,** no interstitial ads in v1, the story is never paywalled.
- **Retention first:** no energy system in the slice; soft launch A/B tests decide.

## 11. Architecture & Tech

- **City-as-data (open/closed principle):** every place-specific asset (districts,
  bosses, NPCs, food, landmarks, music, factions, strings) lives in a **content pack**
  (data + assets). The engine knows nothing about Istanbul. New city = new pack, no engine changes.
- **Engine: open decision (D-004).** Lean **Godot 4** (text-based scenes and scripts are
  easy for AI agents to edit). **Week-1 stress test:** 500 enemies at 30 fps on the low
  reference iPhone. If Godot fails, or its ad/IAP plugins are too immature, switch to **Unity 6**.
- **Backend:** Firebase (analytics, Crashlytics, Remote Config, A/B tests). No custom server
  for v1.
- **Payments & ads:** RevenueCat (IAP), AppLovin MAX or AdMob (mediation).
- **Save data:** local + cloud save (iCloud / Game Center first).

### Toolchain (solo AI builder)
| Need | Tool |
|---|---|
| Coding | Code Puppy / Cursor / Claude Code |
| Art | Scenario (custom style model), Midjourney, Recraft; Aseprite/Krita for cleanup |
| Animation | Spine or Rive (2D), Mixamo + Blender (if 3D) |
| Audio | Suno/Udio (music), ElevenLabs (SFX, temp VO), human VO for key scenes |
| Localization | AI translation + native reviewers (TR, EN, DE; later EL, AR) |
| Marketing | CapCut, TikTok, Instagram Reels |
| Stores | Apple Developer (owner has accounts); a Mac with Xcode for iOS builds; Google Play ($25 once) when Android comes |

## 12. Metrics & Targets

| Metric | Soft-launch target (rough casual benchmarks) |
|---|---|
| D1 / D7 / D30 retention | ≥ 40% / ≥ 15% / ≥ 6% |
| Avg. session length | 8–15 min |
| Level funnel | No single level loses > 5% of players (find and fix those levels) |
| Story-scene skip rate | < 50% (if higher, the story isn't working) |
| Bond-scene engagement | Tracked per choice; informs which pairings to invest in |
| CPI vs. LTV | LTV(D90) > 1.3 × CPI before scaling paid user acquisition |
| Crash-free sessions | ≥ 99.5% |
| Chapter gate | % of qualified active players at the final level (§6) |

## 13. Expansion Strategy

1. **Inside the story:** the route itself is the roadmap (Istanbul → İzmir → ...).
   Each chapter is a new region pack.
2. **Spin-off cities:** same engine, new content pack, new local team of heroes.
   Candidates: **Athens**, Lisbon, Naples, Marseille, Tbilisi, Beirut.
3. **Cross-border caution:** Turkish–Greek topics (coffee, baklava, "Constantinople") can be
   a playful crossover event *or* a review-bomb. Get local writers involved before launch.

---

## 14. Roadmap (solo, AI-assisted)

| Phase | Duration | Exit criteria |
|---|---|---|
| **0. Engine stress test** | Week 1 (M0) | 500 enemies at 30 fps on the low reference iPhone (D-004) |
| **1. Core prototype** | Weeks 2–3 (M1) | Gray-box run is fun for Onder + 5 testers |
| **2. Systems + Level 1** | Weeks 4–11 (M2–M4) | Level 1 fully beautiful and playable |
| **3. Demand test** | Weeks 10–12, parallel to M4's end | Key art + Level 1 footage TikTok/ads tests (~$100–300) show strong CTR, or stop before district production |
| **4. Vertical slice** | Weeks 12–20 (M5–M7) | Levels 1–30, Kaan, motion comics, external playtest |
| **5. Soft launch (TR)** | Months 5–7 | Hit the §12 retention targets; tune the economy |
| **6. Chapter 1 complete** | Months 7–10 | All 100 levels + Night Shift endgame; global launch |
| **7. Chapter 2** | Built in parallel from month 8 | Ready **before** the §6 gate can fire |

**Publisher option:** after Phase 3 or 5, pitch Istanbul publishers (Rollic, Supersonic, etc.)
to fund user acquisition. Their tests can replace your marketing budget.

## 15. Compliance & Sensitivity

- **Data privacy:** KVKK (Turkey), GDPR (EU/diaspora). If minors might play, add age gates
  and COPPA-style handling.
- **Age rating:** target 16+ (human enemies, stylized violence).
  **Risk (D-024):** red blood is now the default, and v0.4 adds grabbed civilians, collapsing scaffolds and
  boss kill-cam replays (W58). Apple's age tiers have moved to 13+ / 16+ / 18+ (confirm in App Store Connect). PEGI 16
  is likely; close-up gore could push some stores to 18. Get a formal pre-check (Apple questionnaire,
  IARC for Google Play, PEGI) before soft-launch prep, and record the answer in D-024. The ink option is not a
  rating fix on its own. Answer the questionnaires with each setting. Details: `reviews/AUDIT-3-2026-11-08.md` A-1.
- **Gambling:** no casino mechanics, no paid random loot in v1.
- **Content guardrails:** see narrative.md, *Writer Guardrails* (no real state actors,
  no earthquake imagery, no religion or politics as targets, no unlicensed brands or crests).
- **AI assets:** confirm commercial rights for every tool used; keep a provenance log.

## 16. Non-Goals for v1 (YAGNI)

No multiplayer, no PvP, no open world, no AR, no player-gender choice, no guilds/chat,
no gacha, no custom backend, no more than 3 quality tiers. Each one needs data to earn its way in.

## 17. Decision Log

| ID | Date | Decision | Rationale | Status |
|---|---|---|---|---|
| D-001 | 2026-11-08 | Chapters are 100 levels (10 districts × 10) | Clear progression, enough content runway, modular build | Adopted; **amended by D-027** (20 hoods × 5 levels, still 100 levels) |
| D-002 | 2026-11-08 | Next chapter unlocks at 5% of *qualified active* players, with a 21-day max wait | Keeps Onder's intent; fixes the denominator and protects superfans | Adopted (confirmed by Onder) |
| D-003 | 2026-11-08 | Visual quality tiers with gameplay parity; HD assets downloaded after install | Premium look on good phones without excluding budget phones | Adopted |
| D-004 | 2026-11-08 | Engine: Godot 4 if the stress test passes, else Unity 6 | AI-friendliness vs. ad-SDK maturity and enemy-count performance | Open |
| D-005 | 2026-11-08 | Story via motion comics + Turkish VO for key scenes | Dizi feel at solo-builder cost | Adopted; **amended by D-028** (static comic pages and bust pop-ins for v0.4, not animated motion comics). VO scope open (`story-presentation.md` §12.5) |
| D-006 | 2026-11-08 | Branch-and-bottleneck narrative; triangle targets the highest-bond girl | Meaningful choice at affordable scope | Adopted |
| D-007 | 2026-11-08 | 2D, top-down 3/4 view, **portrait** orientation; skeletal heroes, flipbook enemies | One-thumb play; cheapest path to premium hero animation; best low-end performance | Adopted |
| D-008 | 2026-11-08 | Content data as Godot custom Resources (`.tres`) in per-city packs | Typed, text-based (AI-editable), editor-friendly; city-as-data | Adopted |
| D-009 | 2026-11-08 | Two level types: Route (corridor + hold zones) and Arena (survive the timer) | Route sells the "walk home" journey; Arena keeps the genre core | Adopted |
| D-010 | 2026-11-08 | Enemies/projectiles as a data-oriented swarm (SoA + spatial hash + MultiMesh), no node per enemy | Only realistic path to 300+ enemies on budget phones | Adopted |
| D-011 | 2026-11-08 | Operating model: Opus = lead/reviewer, separate executor model, milestone review gates | Speed of execution plus a consistent design authority | Adopted |
| D-012 | 2026-11-08 | Game title: recommended *No Signal: Istanbul* (see §1.1); code name *Project Istanbul* | Story-native, global, franchises as `<Title>: <City>` | **Proposed** (needs trademark/store checks + Onder's pick) |
| D-013 | 2026-11-08 | Main character names: Arda, Kaan, Mila, Ada (+ Selim, Leyla, Hasan Dede) | Real Turkish names that are easy to read and say worldwide (narrative.md) | Adopted |
| D-014 | 2026-11-08 | iOS first; Android port before any big Turkish growth push | Owner hardware and accounts, higher spend per player; Turkey is Android-heavy | Adopted |
| D-015 | 2026-11-08 | Onder picks the executor model directly (bake-off dropped); the lead checks execution-plan.md §2 criteria in every review | Owner's call; swapping models is cheap because context lives in the repo | Adopted (revised) |
| D-016 | 2026-11-08 | Monetization designed into game systems: deterministic purchases, Monthly Card, Road Pass, Bazaar, rewarded ads only (business-plan.md) | Fair PvE monetization that funds the game without hurting retention or trust | Adopted |
| D-017 | 2026-11-08 | Level 1 kit replaced: Döner Knife (arc), Nail Gun (auto-aim pierce), Gas Canister (lob AoE), Bike Chain (orbit); passives Running Shoes, Leather Jacket (flat armor), Work Gloves, Energy Drink, First Aid Kit. Drops Fork / Tea Glass / Ayran / Butter / Sneakers | Owner feedback: "ayran, tereyağ, çatal are meaningless". Every item is a distinct verb or a behavior change, grounded but credible as weapons (reviews/AUDIT-2026-11-08.md P0-1) | **Adopted** (owner-directed, approved 2026-11-08). Fork references swept in the v0.4 docs pass; the history stays here |
| D-018 | 2026-11-08 | Arda's signature weapon is the Döner Knife (was the Fork). Nail Gun replaces the Slingshot to avoid colliding with Ada's Chapter 2 signature | Knife reads as a weapon and keeps the döner-shop origin; slingshot collision found in the audit | **Adopted** (owner approved) |
| D-019 | 2026-11-08 | Cold open cut from 70 s to about 28 s; no manual stab beat (Arda grabs the cook's knife, the knife auto-swings) | Doc rule says ≤45 s; a manual stab teaches the wrong verb for an auto-attack game | **Adopted** (pre-approved by owner: "not sure what you mean but I pre-approve your suggestion"; re-confirm on device) |
| D-020 | 2026-11-08 | Level 1 climax (Segment D hold) is a real threat: spawn rate 4 → 7 → 10/s, peak 100 alive | v0.1 hold was a timer with no pressure; bot: autopilot 26/30 hitless clears, naive straight-line 11/30 | **Adopted** (pre-approved by owner; re-confirm on device; numbers in prototype/js/config.js, moving to config-levels.js in E2) |
| D-021 | 2026-11-08 | Camera width 10 m in route levels, 12 m in holds (GD said 12 / 13.5) | Characters were unreadable dots at 12 m on a phone | **Adopted** (pre-approved by owner; re-confirm on device; re-check in Godot at device scale) |
| D-022 | 2026-11-08 | Preview one Elite in L1 Segment C and one mid-hold, each dropping a Mini Chest with an opening set piece (CC says first elite at L7) | First session needs reward spikes, not only level-up cards (reviews/AUDIT-2-2026-11-08.md G1) | **Adopted** (owner: "agreed with you") |
| D-023 | 2026-11-08 | Level-up triggers a shockwave that shoves nearby enemies (no damage) | Power beat plus a breather; reads as a wow moment | **Adopted** (pre-approved by owner; re-confirm on device) |
| D-024 | 2026-11-08 | Gore colour default: **red blood** (owner decision). A setting switches to DS "ink splats" | Drives the age rating (see §15 risk note: red blood may land at 16+ or 18+ on some stores) and store creative | **Adopted** (owner: "blood"). Rating pre-check still needed |
| D-025 | 2026-11-08 | XP curve exponent 1.4 → 1.6 | 11 card stops per L1 run was too many; now 9 cards + 2 chests | **Adopted** (pre-approved by owner; re-confirm on device) |
| D-026 | 2026-11-08 | Camera may pan 1.2 m beyond the walkable edge; decorative sidewalk band with street life | The street never looked like İstiklal because facades sat off-screen | **Adopted** (owner approved) |
| D-027 | 2026-11-08 | **Journey, not a flat level list.** Chapter 1 is one walk, 17 km, from Taksim to Ataköy, through 20 neighbourhoods (hoods) of 5 levels each (still 100 levels). Each hood has its own street, roster, light, boss and comic page. Level 1 stays hand-built; levels 2–100 come from one generator. Amends D-001 (10 districts → 20 hoods). Map: `journey.md` | Owner P0: "current level progression is wrong… 20 different neighborhoods… from Taksim to Ataköy". Gives the walk a visible progress bar | **Adopted** (owner-directed). Details **Proposed**: Kaan joins at L20 (journey §9.1), slice ends at Sirkeci L30 (§9.2), difficulty model (§6, §9.6), boss names (§9.7–9.8), route order (§9.4) |
| D-028 | 2026-11-08 | **Comic-style story presentation.** Comic pages (3–5 panels, tap to advance) close each hood. Bust pop-ins during play (ink burst, key-line slow-mo, at most one per 30 s). A message log with an unread dot. Mom's calls on the phone UI. Amends D-005 (static comic pages, not animated motion comics, for v0.4). Map: `story-presentation.md` | Owner P0: "story is not very immersive… comic book style illustrations". Subtitles last 2–4.5 s and barks expire | **Adopted**: comic pages, bust pop-ins, message log. **Proposed**: call mechanic and signal bars (story §5.2, owner picks A/B/C), radio, collectibles, environment notes. Art budget open (story §12.1) |
| D-029 | 2026-11-08 | **Music by the owner (Suno Pro). Code makes the SFX.** The owner composes the music with Suno Pro. The prototype ships layered, pre-rendered SFX (weapon, hit, impact, zombie voice, ambience) and a music player (`P.Music`) for the owner's tracks | Owner brief: "the owner will compose with Suno Pro and needs SFX from us". Today's audio is 85 synthesized cue definitions, 38 of them played (AUDIT-3 P0-1) | **Adopted**. Open: Suno Pro commercial licence, plan tier and provenance log before any track ships (§15; AUDIT-3 §5) |
| D-030 | 2026-11-08 | **Arsenal: 6 new weapons, 2 new passives, 5 evolutions.** New weapons: Tamirci Çekici (sledgehammer), Benzin Şişesi (molotov), Havai Fişek (fireworks), Canlı Kablo (cable), Zıpkın (speargun), Yangın Söndürücü (extinguisher). New passives: Nazar Charm, Magnet. One evolution per weapon; a passive may feed more than one evolution. Map: `weapons-skills.md` | Owner P0: "weapon types and variety… unique powers, animations, and player value". v0.3 had four weapons and no skills | **Adopted** (evolutions approved, owner: "100%"). Numbers **Proposed** (prototype values in `config-weapons.js`, in progress). Display names pending owner (weapons §12.1–12.2) |
| D-031 | 2026-11-08 | **Player skills.** Dash on swipe or double-tap (Kaçış: 3.2 m, 0.3 s i-frames, 3.5 s cooldown). Ultimate Nazar Patlaması (Evil-Eye Burst), charged by kills and elites. Frenzy (ÇILGINLIK!) at kill-streak milestones | Owner: "player skill (dash / charged special): yes". Gives the thumb a second decision and a power beat | **Adopted** (owner "yes"). Numbers **Proposed**: ult charge 250 kills, frenzy at 60 kills in code (50 proposed), dash damage (owner call). See weapons §8.2 |
| D-032 | 2026-11-08 | **Weapon mod forks and mastery.** Each weapon gets 2 forks at L3 and 2 at L5 (4 endings). Mastery ranks 1–5 come from lifetime kills. Rank-5 signature: Mangal Partisi on Piknik Tüpü (display name for Gas Canister, owner's term). | Owner point 1: weapon tree too narrow. Forks make each weapon a choice; mastery gives a long goal | **Adopted** (owner point 1). Numbers **Proposed**. Resolve conflict with GD §8.4 (Jeton as mastery spend): kill-based wins. Start with 6 forked weapons (audit-4 F-7). See reviews/AUDIT-5-2026-11-08.md |
| D-033 | 2026-11-08 | **Attributes.** Six attributes: STR (Strength), PACE, AGG (Aggression), INT (Intelligence), CHA (Charm), GRIT. Ranks 0–10, Ch1 cap 6. Practice XP per rank, plus Street Cred kill thresholds. | Owner point 5: attribute layer with a kill-count threshold | **Adopted** (owner point 5). Numbers **Proposed**. Open: A1 (retire Survival Skills for Ch1), A2 (merge Street Cred with Skill Credits, keep four currencies), A3 (kill threshold factor, bot calibrates). See docs/attributes.md |
| D-034 | 2026-11-08 | **Hacking as the INT mechanic.** Terminals are hacked in a one-thumb band. INT rank unlocks hack tiers. Hacks are the only way to use INT. | Owner point 2: Level 1 repetition; variety through events and terminals | **Adopted in direction**. Details **Proposed** (attributes.md §4; A4 hack assist default, A5 auto-hack at rank 6). |
| D-035 | 2026-11-08 | **Arda comic voice and barks.** Shaun of the Dead tone: deadpan, self-aware, talks to zombies, self-talk. 350+ lines, Turkish spine with English gloss. Never punches down. Ezan is ambient only, never a cue or a joke. ("Turkish spine with English gloss" is superseded by D-051.) | Owner point 4: Arda should be funny, with barks | **Adopted in direction** (owner point 4). Line count and bilingual gag review **Proposed** (audit-4 F-8). See docs/hoods-bible.md §1.4 |
| D-036 | 2026-11-08 | **Hood authenticity, landmarks and title cards.** Each hood gets a feel, sound, people, landmarks, five stages (time and weather) and one verified fact. Chapter 2 route proposed: hoods 21–40, Ataköy to Zekeriyaköy, about 40 km. | Owner point 6: neighbourhoods should represent the real place | **Adopted in direction** (owner point 6). Landmark list and Ch2 route **Proposed**. Street names need a map check. See docs/hoods-bible.md |
| D-037 | 2026-11-08 | **Retention scaffolding built early.** Ten systems first: versioned save, analytics funnel, remote config, seeded daily runs, data-driven content, localization parity, lifetime kills, accessibility, difficulty telemetry, crash reporting. Telemetry rows before new content (R6). | Owner ask 7: what brings players back. Retention is unmeasured (18 in-memory events, no D1/D7 identity) | **Adopted in direction**. Details **Proposed**; R1–R6 open. See docs/retention.md §8 and reviews/AUDIT-5-2026-11-08.md §4 |
| D-038 | 2026-11-08 | **Comic font.** System font stack now. OFL comic font bundle only after owner approval. | Owner point 3: text does not fit the boxes; needs a comic font | **Adopted** for the system stack. OFL bundle **pending owner approval**. Overflow fix (no silent overflow in `A.fit`, comic-art.js) is workstream D |
| D-039 | 2026-11-08 | **Sayın Abim.** The Ataköy boss title is "Sayın Abim" (EN: The Honourable Big Bro). | Owner decision | **Adopted** (owner). Story name "Ahmet Abi" stays until the owner decides (hoods-bible H1). |
| D-040 | 2026-11-08 | **Chapter 1 ends at Ataköy (L100).** Sirkeci (L30) is a build milestone for the vertical slice, not a chapter end. | Owner clarification | **Adopted** (owner). prd §1 and §4, journey §8.1 and §9.2 updated |
| D-041 | 2026-11-08 | **Power lever (AUDIT-5 F-2): the walk makes Arda stronger.** Four persistent sources, all numbers in `config-power.js`: hood rank (+1 per cleared hood), attributes (Street Cred), gear (base items come with the walk), mastery (main weapons). Enemy HP stays on the E2 curve. The x9 meta cap (audit option 2) is not used. | Owner: "I want the player stronger". Under E2, power fell below enemy HP from about L60 (audit F-2). | **DECIDED 2026-11-08** (owner). Numbers are PROTO until accepted against the bot table (attributes.md section 7.5). |
| D-042 | 2026-11-08 | **New enemies, stronger with progress.** Kasap (butcher: armour and a cleaver swing), parkur (free-runner leap), zehirli (toxic spitter). Affixes: hizli (fast), zirhli (armoured), patlayan (bursts on death). Hood schedule in `config-levels.js`. The three new types grow in route share with hood index (`newGrow` 0.1). Affix rolls use the spawn stream, so hoods before each affix start are unchanged. | Owner: "stronger new enemies emerging as progress goes on". Audit owner point 2 (variety). | **DECIDED 2026-11-08** (owner). Art and barks TR+EN shipped (journey section 5.0). |
| D-043 | 2026-11-08 | **Street Cred merged with Skill Credits; four currencies (audit A2).** Street Cred (SC) is the only attribute currency and buys attribute ranks. No fifth currency. | Audit F-5 and GD section 8.1 ("four currencies, no more"). | **DECIDED 2026-11-08** (owner accepted the audit recommendation). |
| D-044 | 2026-11-08 | **Survival Skills tree retired for Chapter 1 (audit A1).** Attributes (attributes.md) replace it. GD section 8.3 is kept for the Ch2 review. | Audit D-3 (two overlapping systems). | **DECIDED 2026-11-08** (audit recommendation applied). |
| D-045 | 2026-11-08 | **Kaan joins at L20** (the `kaan_join` page). The story beat does not move. | Owner: keep Kaan at L20 unless the audit or narrative gives a strong reason. None found. | **DECIDED 2026-11-08** (owner). |
| D-046 | 2026-11-08 | **One boss-name set (audit H2, option C).** In-game names are the narrative speaker names (`spk.b.*` in `strings-story.js`: Turkish, with the journey section 2 canon role as the English gloss). Ataköy is "Sayın Abim" (D-039). The E2 code names are retired. | Audit D-8 (three tables disagreed). | **DECIDED 2026-11-08** (owner direction plus audit H2). |
| D-047 | 2026-11-08 | **Name and fact decisions (audit H1, H3, H4, H5, H6).** H1: "Ahmet Abi" is the character, and neighbours call him "Sayın Abim". H3: Şişko Can is retired (canon name in use). H4: Chapter 2 walks the north-east route. H5: human enemies are scoped now and built after the slice. H6: postcards use high-confidence facts only. | Audit section 7 recommendations. | **DECIDED 2026-11-08** (audit recommendations applied). |
| D-048 | 2026-11-08 | **Hood facts (hoods-bible section 2) and Arda comedy reviews accepted as written.** | Owner: "accept the facts and comedy reviews". | **ACCEPTED 2026-11-08** (owner). |
| D-049 | 2026-11-09 | **Character look and cast bible.** Bust art rebuilt on charm rules (round head, big low-set eyes, short neck, always-on soft cheeks, warm shade colours, one silhouette cue per character). New busts: Kaan, Mila, Ada, Dede, Ahmet Abi (Mila and Kaan were generic faces). Backgrounds, voices and tells for every character in `characters.md`. New facts proposed there: Dede is Mom's father; Fatma Nine and Kaptan Nuri; Kaan cannot swim; Mila's mother teaches at Arda's old school and Arda gave her the red scrunchie; Usta Cemal lends the knife; Ada keeps a bottle cap from every place. | Owner: characters look unattractive; make them charming and relatable, with backgrounds; full creative freedom | **Proposed** (art in prototype v0.9; facts need owner nod, `characters.md` marks each **(new)**) |
| D-050 | 2026-11-09 | **Animation pass: stay 2D, add 2.5D cues and game feel.** No true-3D switch. Hit springs, hit-stop, camera kick, arcing blood with fake height, weapon recoil and element hit sparks, hero lean and footfall dust, wind-up and recoil on the weak weapon poses, elliptical light pools, one shadow direction, and vehicle motion (tram car and rush, scooter wheels, taxi). All view-only, tunable in `config-feel.js`; Reduce motion disables hit-stop and kick. Pre-rendered 3D sprites stay reserved for bosses and vehicles if a later spike shows a need. | Owner: borrow 2.5D tricks plus much better weapon fire, impact, walking and driving animation, instead of a true 3D build | **Proposed** (prototype v0.9; Godot port must reproduce the same dials and budgets) |
| D-051 | 2026-11-09 | **Two native scripts from shared beats.** Turkish is the master script; English is written from the beat, not translated. The device language picks the script (any `tr*` gives Turkish, anything else English); the player can override it in Settings, and `?lang=` overrides for testing. Class A (UI) and class B (rules) text is translated precisely; class C (voice) is native only. One store, `js/dialogue/` (`P.Dialogue`), replaces `P.LINES`, `P.LangText`, `P.BarkPools` and `P.FinaleLang`. A missing line is a test failure, never a fallback to the other language. Supersedes D-035's "Turkish spine with English gloss". | Owner brief 2026-11-09: jokes, idioms and slang do not survive translation, and dialogue is a differentiator | **Proposed** (BRIEF-DIALOGUE-2026-11-09; Phase 1 plumbing done, voice bibles next; Godot port loads the same data with `OS.get_locale_language()`) |
| D-052 | 2026-11-10 | **Turkish bark voice: street-mild profanity, per-line guardrail exceptions, riddle self-talk.** After the tr-A review the owner raised the Turkish profanity level to street-mild: *lan, ulan, be, ya* plus soft crude words (*götüm, Soktuğumun, ananı dananı, ebeni*); no *siktir/amına*. The owner kept two sexual riddles in `BK.self` (`#3`, `#18`) as a deliberate exception; no other sexual jokes. The owner kept a few lines that hit the writer guardrails (real politicians and celebrities, a regional word, real game and film IP, religion words used as exclamations); they are allowed one by one through `ownerExceptions` in `tools/dialogue-banned.json`, so new lines still hit the rules. `BK.self` becomes a deliberate bad-joke riddle pool (limit 100 characters, exempt from the 15 to 30% joke ratio). Third person is *annem / babam*, direct address stays *Anne / Baba*. | The owner's tr-A rewrites (`reviews/dialogue/FINDINGS-tr-A.md`) show the voice he wants: loud, spoken, street-level, with proverb twists | **Proposed** (owner answers 2026-11-10; guardrail exceptions are the owner's call and carry the owner's risk) |
| D-053 | 2026-11-10 | **English script: keep what already works, fix what does not.** The owner handed all English decisions to the agent. Batch A English was reviewed line by line against `docs/voice-en.md`: 505 lines, 16 rewrites (instruction piles, crowd-addressed lines, nonsense, flat labels). American English stays (voice-en §3), so the 14 call lines and about 40 hood and finale lines that still said Mum / mate / queue / torch / colour were converted. The Turkish owner exceptions (D-052: street-mild profanity, real names, riddle self-talk) do **not** carry over to English: English keeps voice-en §6 tiers and the guardrails. **Update 2026-11-09:** the owner then named the agent the English decision-maker ("you are the decision maker for english"). Batches A, B and C (all 1,160 English lines) are marked approved by the agent as English editor under that delegation. **No human native English reader has reviewed them**; a later human read is recommended before release. | The English was already independent and in voice; it needed targeted fixes, not a new pass | **Proposed** (`reviews/dialogue/FINDINGS-en-A.md`, `FINDINGS-en-C.md`) |
| D-054 | 2026-11-10 | **Prototype revision milestone R1.** Owner list: (1) cartoon art quality, (2) in-game animation and feel, (3) Istanbul-specific arenas, (4) cross-level skill tree and progression, (5) enemy audit and possible redesign. Added to `execution-plan.md` as R1 with tasks T0 to T6. The enemy audit goes first (read-only), then the art-direction pick, which blocks arena and animation art. | Owner: the art looks cheap, arenas feel generic, the game needs more immersion and a longer progression arc | **Proposed** (`execution-plan.md` R1) |
| D-055 | 2026-11-10 | **Enemy variety, wave 1 (R1).** Three skin behaviours on existing outfits: fisher (hook line, 2.5 m drag, no damage), musician (+15% speed for walkers within 6 m while it lives), hamal (0.5x damage from behind, a breakable crate on death); capped at 2 live per skin, 20% per eligible spawn. Two new types: marti (seagull that steals a loose XP drop and returns it on death, lost if it escapes) and cayci (tea carrier, 0.7 s ring windup, a tea puddle that slows the hero to 0.65x for 3 s). Full numbers in `content-catalog.md` §11. Open for the owner: marti is placed on H02 Galata and H04 Galata Köprüsü, which `journey.md` §5.0 keeps free of new types. | Owner decision 1 (`reviews/AUDIT-ENEMIES-2026-11-10.md` §9): agree the skin proposal (fisher, musician, hamal first) and add creative extras; wave 1 as in §10 | **Proposed** (`reviews/AUDIT-ENEMIES-2026-11-10.md` "Wave 1"; built on branch `r1/enemy-wave1`, not merged) |

## 18. Open Questions

1. Final engine choice (D-004): depends on the week-1 stress test.
2. Exact gate threshold: is 5% right once real funnel data exists?
3. Hand-painted 2D style direction (D-007 settles 2D): pick from style frames in M4.
4. Self-publish vs. publisher deal: decide after the demand test.
5. Final game title (D-012): run the §1.1 checks, then pick.
6. Journey and story (D-027, D-028): the open items in `journey.md` §9, `story-presentation.md` §12, and the
   decision list in `reviews/AUDIT-3-2026-11-08.md` §5.
