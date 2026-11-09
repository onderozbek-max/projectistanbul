# Project Istanbul: Why Players Come Back (Retention and Build Early)

> **Status:** v0.1 · 2026-11-08 · Owner: Onder · Decisions: **D-035** (barks, Adopted), **D-037** (retention scaffolding built early, Adopted in direction; details Proposed)
> **Owner's rule (Andrew, Day 4 and the v0.4 playtest):** fix retention before acquisition. The owner's note: "on a bright side, the novel or the story was progressing, that really helped. we need to build on top of that."
> **Related:** [product.md](product.md) §12 (targets) · [game-design.md](game-design.md) §8, §10 · [story-presentation.md](story-presentation.md) · [wow-catalog.md](wow-catalog.md) · [architecture.md](architecture.md) §4 · [attributes.md](attributes.md) · [hoods-bible.md](hoods-bible.md)
> **Evidence base:** code and docs as of commit `c50a7a6`. Nothing here is measured on players yet. Every number below is a target or a proposal unless it says otherwise.

---

## 1. The short answer

1. **Players come back for the next stop.** The walk home is the spine: a km bar, a hood boss, a comic page and a map step. Each hood ends with a reason to start the next one.
2. **The story is the strongest hook we have.** The owner saw it work. Build more story per hour, earlier: barks, letters, collectibles, a "previously on" recap.
3. **Progression has to be visible and spendable.** Every reward must have a sink. Coins with no sink was AUDIT-3 R-2. Street Cred, mastery and forks must show up on screen after every level.
4. **We cannot measure retention yet.** The prototype has no session, install-day or retention events. That is the first thing to fix (§8).
5. **No energy walls, no pay-to-win, no notification spam.** These three kill the genre's retention fastest. The rules are in §7.

---

## 2. Where we are (v0.4, measured)

| Retention lever | Exists in v0.4? | Evidence | Plan |
|---|---|---|---|
| Next-level pull | Partial | Results → map → next level. Results shows stars and coins. No "next stop" line. | Map line + km bar (§4) |
| Story per hood | **Yes** | 252 story strings (`story/strings-story.js`). Comic page keys for all 20 hoods plus 6 others. Busts. Mom's call card. | Keep and expand (§5) |
| Coins with a sink | Partial | Coins buy gear upgrades (`meta-data.js:167`). Single currency. | Add SK and mastery sinks (v0.5) |
| Gear | Yes | 4 slots, merge, upgrade (`meta-gear.js`). | Keep |
| Collection | No | None | Hatıralar (v0.5 G/C) |
| Message log, unread dot | **No** | No `unread` or log code in `js/` | Story §7 (v0.5 G) |
| Arda humour | No (0 Arda quips) | `story/barks.js` is a stub; `strings-barks.js` is empty | D (v0.5) |
| Daily challenge, streak | No | None | v0.5 (C), §6 |
| Achievements | No | None | v0.5 (C), via Game Center later |
| Welcome-back recap | No | None | §5.4 |
| Notifications | No | None | §7, §8 |
| Social share | No | No share code in `js/`. | W60 share card (v0.5 C) |
| Achievements and collection | In progress | `meta/meta-collect.js` (142 lines, C): counters, achievements, collection IDs. Not yet on screen. | Hatıralar (v0.5 C) |
| Retention telemetry | **No** | 18 event names, held in memory, no session or install events (`telemetry.js`) | §8 row 2 (P0) |
| Save safety | Partial | One `localStorage` key, `v: 1`, no backup (`meta-data.js:6, 107–112`) | §8 row 1 |

**Main gap:** we have the story and the map, and nothing that tells us whether they bring players back. Fix the measurement first, then add the loops.

---

## 3. The five loops (plus the moment)

Each loop has one hook, one thing the player does, and one number to watch.

| Loop | Hook | What the player does | What exists | v0.5 plan | Watch |
|---|---|---|---|---|---|
| **Moment** (per second) | Juice and voice | Hits, kills, barks, the knife smear | Juice W01–W21 (wow-catalog). **Arda quips: none yet.** | D: 350+ barks, Shaun-of-the-Dead tone (D-035). Barks never block play. | Juice gap ≤ 1 s. Bark read rate. |
| **Session** (per run, 3–6 min) | One more level | Clears a level and taps "next" | Results, map, km bar | "Sokak Kredisi" meter in the HUD during the run. Results show the SK gained and the next stop. | % of level ends followed by a next-level tap (target ≥ 85%, proposal) |
| **Meta** (per day) | I got stronger | Spends SK, mastery, forks, gear | Gear and coins | Attributes (attributes.md), weapon mastery and forks (A, D-032), Hatıralar | % of D3 players who open the attribute screen (≥ 60%, proposal) |
| **Long-term** (weeks) | Who's next and what's next | Starts Chapter 2, Night Shift, hard modes | Chapter 1 only (100 levels) | Ch2 route (hoods-bible §4). Night Shift (product §7). Hard mode. Weekly events. | Hood completion per 100 starts |
| **Social** (occasional) | Show someone | Shares a clip, a card or a score | Nothing shipped | Share card W60, boss kill cam W58 (non-gory), polaroid W59. Game Center leaderboards for Night Shift. | Share taps per 100 level ends |
| **Habit** (daily) | Today's run | Plays the daily challenge | Nothing | Seeded daily run with one modifier. 7-day streak counts play days. Small non-power rewards. | D7 retention among daily players |

### 3.1 The moment loop

- Juice is mostly done in v0.4. The gap is voice. Arda is the voice (D-035).
- Rule: a bark never stops the run, and never shows during a level-up card or a boss telegraph peak (story-presentation §6).

### 3.2 The session loop

- A run is 3–6 min. A session (8–15 min target, product §12) is 2–3 levels.
- The one-more-level pull is the **kill-threshold meter** (attributes.md §3.1). The player sees "Sokak Kredisi 3/4" during the run. Crossing it is a small win, and the next level is one tap away.
- A hood ends on a cliffhanger line and a comic page. The comic is the reason to stop; the map step is the reason to start the next hood.

### 3.3 The meta loop

- Three meters grow at once: SK (attributes), mastery (per weapon), gear. Each one has a visible sink (§7, anti-pattern 6).
- Hatıralar (the collection) is where story rewards live: polaroids, voice notes, notes and letters (§5).

### 3.4 The long-term loop

- Chapter 1 is 7–9 hours on a first pass (journey §6.4). That is the first retention cliff: a player who finishes it has nothing new to do.
- **Chapter 2 is the next reason.** Product §6 gates it: 5% of qualified players reach the end of Chapter 1, or the first 1% wait 21 days. The wait is a retention risk. Night Shift and hard mode must be live while players wait (product §6.5).

### 3.5 The social loop

- Product §16 bans multiplayer, guilds, chat and a custom backend. That rules out friend ghosts and live leaderboards on our own server.
- **Proposal:** use Game Center for achievements and leaderboards (iOS first). Product §11 already names Game Center for save. No custom backend.
- Friend ghosts need a backend. Defer to Chapter 2 and log it as a decision.

### 3.6 The habit loop

- Daily challenge: one seeded run with one modifier (for example "night, horde ×1.5, no dash"). Same seed for everyone that day.
- Streak: counts days with at least one level played. **One free streak save per week.** No guilt copy.
- Daily rewards are cosmetics, coins or story items. **No power.** Power comes from play (business-plan §5.1, principle 1).

---

## 4. The hook ladder: seven reasons to start the next run

The player should always have one of these in view. The order is the order the player sees them.

| # | Question | Answer on screen | Where |
|---|---|---|---|
| 1 | Where am I? | "Ataköy: 1.2 km to go" on the km bar | Map and results |
| 2 | What's next? | The next stop name and its boss icon, one line | Results |
| 3 | Who's waiting? | Kaan (L20), Mila (Ch2), Ada (L150), Dad's letters | Story line on hood end |
| 4 | What did I become? | SK and mastery changes on the results screen | Results |
| 5 | What did I find? | A new collectible or a new line in the log | Results and log |
| 6 | What's new today? | Daily challenge, weekly event | Title screen |
| 7 | What's my street? | A postcard of the hood, with its local fact | Hood end |

---

## 5. Story as retention

The owner saw the story do the work. This section turns that into mechanics.

### 5.1 Episodic cliffhangers

- Hood ends with a line that points to the next hood. The map shows it.
- Dizi triple zoom only at **H01 (L5), H04 (L20), H06 (L30) and L100** (design-system §9.2). Keep it rare so it still lands.
- Chapter 2 keeps the same pattern: a cliffhanger at the end of each even hood.

### 5.2 Funny Arda

- Arda's quips are a retention device, not decoration. Players collect them. The log shows "Arda quips found: 42/350" (proposal).
- Each stage has at least one quip with a visual gag, so the joke lands without subtitles (product §3, pillar 1).
- Quip types: deadpan to the situation, talk to the zombies (they groan back), self-talk when there is no signal, weapon lines, hood lines. Tone rules in hoods-bible §1.

### 5.3 Collectibles (Hatıralar)

| Collectible | Count in Chapter 1 | Source | Story job |
|---|---|---|---|
| Polaroid | 20 (one per hood) | Hood clear, or a hidden spot | Family and friends before the zombies |
| Voice note | 14 (one per hood from H07) | Hidden in the hood | Mom, Dad, Kaan, Mila, the people of the street |
| Environment note | About 1 per hood | Read by walking close | Graffiti, door notes, signs (story-presentation §8.3) |
| Letter | 3 (L100, L190, L300) | Story beats | Dad knows more than he says |
| Quip | 350+ | Stage play | Arda's voice |

Total about **37 collectibles** (20 polaroids, 14 voice notes, 3 letters) plus environment notes and 350+ quips. Each collectible has a short caption, so the Hatıralar screen is readable without the story.

### 5.4 "Previously on" recap

- When a player returns after one or more days, the first screen is a three-line recap:
  - Where they stopped (hood and stage).
  - The last story line they saw.
  - One thing to do next.
- Data needed: last stop, last story line id, last-played date (saved). Built with the log (story §7).

### 5.5 Mom's texts (no timers)

- Mom's texts appear as the story reaches a hood. They do **not** arrive on a real-time clock. A timer that gates the story is an anti-pattern (§7).

### 5.6 Companions as hooks

- Kaan joins at L20 (proposed; journey §9.1). Mila at Chapter 2 (L101). Ada joins at L150. Each join is a "who's next" hook on the hood before.

---

## 6. Benchmarks and targets

Three kinds of number. The source is always named.

| Metric | Target | Source | Status |
|---|---|---|---|
| D1 retention | ≥ 40% | product §12 | Soft-launch target. Not measured. |
| D7 retention | ≥ 15% | product §12 | Soft-launch target. Not measured. |
| D30 retention | ≥ 6% | product §12 | Soft-launch target. Not measured. |
| Session length | 8–15 min | product §12 | Target. Run is 3–6 min. |
| Story skip rate | < 50% | product §12 | Target. Story-presentation §3.3 sets page skips. |
| Cinematic skip (first view of L1) | ≤ 20% | PRD §7 | Target. |
| Would play next level (playtest, 1–5) | ≥ 4.0 | PRD §7 | Target. R-1 test not run yet. |
| Sessions per day | 2–3 | This doc | **Proposal** |
| Levels per session | 2–4 | This doc | **Proposal** (run 3–6 min, plus results) |
| Next-level tap after results (L1–10) | ≥ 85% | This doc | **Proposal** |
| Hood completion (reach H01 L5, then H02 L1 in 7 days) | ≥ 70% | This doc | **Proposal** |
| Attribute screen opened by D3 | ≥ 60% | This doc | **Proposal** |
| Daily challenge played by D7 | ≥ 25% of D7-retained | This doc | **Proposal** |
| Notification opt-in | Track only | This doc | No target before soft launch |

**Genre references (my recall, unverified):** mobile action and roguelite games often sit around D1 25–40%, D7 8–15%, D30 3–7%. Survivor-likes tend to sit in the middle or low end. Check with a third-party benchmark (AppMagic, Sensor Tower or GameAnalytics) before the soft-launch gate. Do not quote these in store or investor material.

**Metric definitions (to lock before the first external test):**
- Install day = day 0 (first `session_start` with a new install id).
- D1, D7, D30 = active on that calendar day in the player's local time zone.
- Active = started at least one level.
- Session = from app foreground to background, split at 30 min idle.

---

## 7. Anti-patterns to avoid

| # | Pattern | Why it kills retention here | Our rule |
|---|---|---|---|
| 1 | Energy walls on day 1 | Blocks the first session, which is when players decide | No energy in the slice (product §10). Revisit only with a logged decision and A/B data. |
| 2 | Pay-to-win through progression | Breaks the trust in the walk; the Ch1 caps exist to stop it | Money speeds up within the chapter cap; it never passes it (business-plan §5.1; attributes.md §7). |
| 3 | Notification spam and guilt copy | Opt-outs are permanent | Local notifications only in v1. Max one a day. None 22:00–09:00 local. Opt-in asked after hood 1. Every notification opens something playable. No "come back or lose it" copy. |
| 4 | Fake countdowns and urgency | Breaks the offer ethics rule (game-design §8.14) | No countdowns that are not real. Offers show prices in local currency. |
| 5 | Story gated by a real-time clock | Feels like a dark pattern and fails in the Turkish market | Story unlocks on play, not on the clock. Mom's texts follow the stage. |
| 6 | Rewards you cannot spend | AUDIT-3 R-2. Players stop believing the numbers. | Every currency and meter has a sink: coins to gear, SK to attributes, kills to mastery rank. |
| 7 | Streak guilt | Players quit on the first missed day | One free streak save per week. Copy is neutral ("Streak: 5 days"). |
| 8 | Chapter wait with nothing to do | The 21-day gate is a churn point | Night Shift, hard mode and weekly events live before Chapter 2 opens (product §6.5, §7). |
| 9 | Long comic blocks at hood end | The first view cannot be skipped; it sits between the player and the next level | Comic pages 15–25 s. Skip after first view (hold 0.6 s). Tap to advance. |
| 10 | Repetition (owner's Level 1 complaint) | Players stop noticing new things | Each stage changes the objective (journey §4). Each hood adds one enemy or hazard (journey §3.3). |
| 11 | Interstitial ads | Breaks flow; banned in v1 | Rewarded only (business-plan §7). |
| 12 | Gore for shock | Raises the age rating and the store risk | Red blood stays a setting; no gore close-ups (design-system §2; AUDIT-3 A-1). |

---

## 8. Build early: systems that must exist before content piles up

The rule: a system that is cheap now and expensive later goes first. Each row says where it lives now, where the Godot plan puts it, and what is missing.

Status: **Present** (works), **Partial** (exists, not enough), **Missing**.

| # | System | Prototype now (v0.4 + v0.5 slots) | Godot plan (architecture.md) | Gap | Status | Build by |
|---|---|---|---|---|---|---|
| 1 | **Versioned save and cloud save** | One `localStorage` key `nsi.meta.v1` with `v: 1` and a `normalize()` pass (`meta-data.js:6, 107–112`). No backup, no migration chain, no cloud. | §4.14: two slots (A/B), atomic write, `schema_version`, ordered migrations. Cloud later (product §11: iCloud or Game Center). | Backup slot. Migration function `v1 → v2`. Save v2 must hold practice, SK, rank, mastery, collection and daily state. Without a backup, one bad write loses the whole meta. | Partial | **Now** (v0.5 C). Save v2 with the backup. |
| 2 | **Analytics events and funnel** | `P.Tel.log` writes 18 event names into an in-memory array (`telemetry.js`). Export only from the pause menu. Build tag hard-coded `proto-0.1`. | §4.16: JSONL to `user://telemetry/`, flushed every 5 s. Schema in GD §10. Test that every event name is in the schema. | No `session_start`, `session_end`, install day, `currency_flow`, `ad_stub`, `meta_upgrade`, `wow_spike` or `juice_gap`. Not saved across reloads. Stale build tag. Cannot compute D1, D7 or D30. | Partial | **Now** (v0.5, all workstreams). **P0.** |
| 3 | **Remote config and A/B flags** | None. Numbers are constants in `config*.js`. No first-session ad flags (AUDIT-4 M-2). | §4.15 `ConfigProvider`. product §11: Firebase Remote Config later. | No flags. Needed for the gate threshold (product §6), notification caps, daily modifiers and the 5% gate. | Missing | v0.5: interface plus a local JSON file. Backend later. |
| 4 | **Seeded runs (daily)** | `?seed=` URL parameter. No `Math.random` in `sim/` (AUDIT-4 §2, verified). | §4.10: separate RNG streams per run. Golden tests (§6). | Daily seed = hash of (date, content version). Needs the build's content version in the seed so leaderboards compare like with like. | Partial | v0.5 (C, daily challenge) |
| 5 | **Data-driven content** | JS config per topic. `journey.js` is data. Three boss-name tables and two XP exponents are in use (AUDIT-4 SOT-1, SOT-7). | §4.1: `.tres` Resources. Four `.tres` files exist in `game/content/packs/istanbul/`. | One source per content type (JSON), generated into JS and `.tres`. Barks as data (id, speaker, condition, cooldown, locale keys). | Partial | Before Chapter 2 content. Start with bosses and XP. |
| 6 | **Localization pipeline** | `strings*.js` files merged into `P.STR`, with `tr` and `en` objects (280 keys each after loading). Key parity not tested. Comic text drawn on canvas. | §4.18: `localization/strings.csv`, `text_util` for Turkish casing (`i/İ`, `ı/I`). | Key-parity test TR↔EN in CI. Length budget: Turkish +30%, German +35% (DS §10). German not started. | Partial | v0.5 (add the test). German later. |
| 7 | **Mastery and tally tracking** | `sim.kills` per run only. Passed to `P.Meta.onResults`. No lifetime kills per weapon. `mastery.js` is a stub. | §4.7: `enemy_killed(type_id, position, by_weapon_id)` is already specified on the event bus. | Lifetime kills per weapon and per hood, written at level end. Needed for mastery (A) and SK (C). | Missing | **Now** (A, C) |
| 8 | **Accessibility toggles** | `sound`, `subs`, `reduceMotion`, `dmgNumbers`, `blood`, `lang` (`settings.js:4`). | DS §11 checklist. Settings in the Services layer. | Missing: music and SFX volume, text size (100/125/150%), colour-blind palettes, haptics, left-hand HUD, auto-ultimate, flash-free option (wow-catalog §6). Canvas text ignores system text size. Store all keys now with defaults, so no migration is needed later. | Partial | v0.5 (E8 scope) |
| 9 | **Telemetry for difficulty** | `perf_sample`, `death {cause_id}`, `level_end`. Headless bot (`tools/bot.js`). | GD §11 bot. GD §10 events. | No per-stage clear funnel. No `hood` and `stage` on `level_start`. No attempt counter. No time-to-first-level-up event. Needed for the L23 and L63 outliers (AUDIT-4 B-2, B-3). | Partial | v0.5 (B) |
| 10 | **Crash reporting** | None. No `window.onerror` or promise handler in `prototype/`. | Crashlytics via Firebase (product §11). | Firebase SDK is a new dependency. AGENTS says stop and ask first. Add an interface stub now. | Missing | Stub now. SDK decision before soft launch. |
| + | Local notifications and permission timing | None | Not in architecture.md yet | Adapter in Services. Ask for permission after hood 1 clear, not at launch. | Missing | Before soft launch |
| + | "Previously on" recap data | None | Needs the message log (story §7) | Last stop, last line id, last-played date | Missing | v0.5 (G) with the log |

**Priority order:** row 2 (analytics), row 1 (save v2 with backup), row 7 (lifetime kills), row 5 (one source for content), row 8 (settings keys). These five are cheap now and expensive once content exists. Rows 3, 4, 6, 9 and 10 can follow the milestones.

**Test to add now:** one CI check that the save schema, the event list and the settings keys all match the docs. It fails the build when they drift.

---

## 9. Open decisions

| # | Decision | Recommendation |
|---|---|---|
| R1 | Game Center for achievements and leaderboards (no custom backend) | Yes. Revisit at Chapter 2. |
| R2 | Local notifications only in v1 | Yes. |
| R3 | Daily challenge: cosmetics and story items as rewards (no power) | Yes. |
| R4 | One free streak save per week | Yes. |
| R5 | Sessions and daily targets (§6, proposals) | Adopt as test targets. Confirm after the 5-person test (R-1). |
| R6 | Build the telemetry rows (§8, 1–2) before any new content | Yes. P0. |
