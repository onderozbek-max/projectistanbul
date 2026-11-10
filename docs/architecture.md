# Project Istanbul: Architecture and Design Patterns

> **Status:** v0.1 · 2026-11-08 · Owns: tech stack, project layout, code patterns, dependency
> rules, testing, performance budgets, engine pitfalls.
> Engine is **Godot 4 (latest stable 4.x, pinned in AGENTS.md once chosen)**, pending the M0
> stress test (product.md D-004). Patterns are engine-agnostic; Godot specifics are marked.

---

## 1. Quality Attributes (in priority order)

1. **Performance on low-end phones:** 300 enemies, 30 fps, no hitches (prd.md §6).
2. **Content scalability:** new levels/items/cities via data, not code (open/closed).
3. **Testability:** core rules are pure and unit-tested; runs are deterministic per seed.
4. **Changeability by AI agents:** text-based scenes/resources, small files, explicit types,
   one obvious place for each concern.
5. **Gameplay parity across quality tiers:** simulation never depends on presentation settings.

## 2. Tech Stack

| Concern | Choice | Note |
|---|---|---|
| Engine | Godot 4.x (stable) | Text-based `.tscn`/`.tres`, good for AI agents. Brotato (Godot) shows survivor-likes ship on mobile with it |
| Language | GDScript with **static typing everywhere** | GDExtension (C++) only for the swarm kernel if M0 requires it (§4.2) |
| Tests | GUT (Godot 4 branch) | Headless via CLI |
| Data | Godot custom `Resource` classes saved as `.tres` | Typed, text-based, editor-inspectable (D-008) |
| Save | JSON with schema version + migrations | §4.14 |
| Analytics | Local JSONL in the slice; Firebase adapter later | §4.16 |
| Ads/IAP | Interfaces + fake implementations in the slice | §4.15 |
| Tooling | Python (uv) for report scripts in `/tools` | Balance CSV summaries, telemetry analysis |

## 3. Repository Layout

```
/                         repo root
  AGENTS.md               executor instructions (read first)
  docs/                   design docs (source of truth for intent)
  reviews/                review packets + lead feedback (see execution-plan.md §5)
  art/                    source art + PROVENANCE.csv (large sources via Git LFS)
  tools/                  python scripts (report summaries, telemetry analysis)
  reports/                generated outputs (gitignored except */SUMMARY.md)
  game/                   Godot project root (project.godot)
    autoload/             event_bus.gd, services.gd, scene_router.gd  (only these 3)
    core/                 pure rules: stats, formulas, rng streams, card_offer, xp, economy
    sim/                  run simulation: swarm, projectiles, weapons, spawn, status, heroes, bosses
    presentation/         rendering, camera, vfx, hud, ui screens, motion comics, audio
    meta/                 save, progression, gear, world map logic
    services/             telemetry, ads_stub, config, device_tier, text_util
    content/
      defs/               Resource class scripts (HeroDef, WeaponDef, ...)
      packs/istanbul/     ALL city-specific data: heroes, weapons, passives, evolutions,
                          enemies, bosses, districts, levels, waves, strings, art refs
    levels/istanbul/      level map scenes (tilemaps, markers), referenced by LevelDef
    localization/         strings.csv (TR, EN)
    tests/                unit/, integration/, arch/, golden/
    tools/                bot_sim.gd, benchmark scenes, content validators
```

## 4. Patterns

### 4.1 Data-driven content (open/closed principle)
- **Code defines behaviors; data defines content.** Adding a weapon that uses an existing
  behavior, an enemy, a level, or a whole city = new `.tres` files only.
- Core Resource classes (in `content/defs/`):
  `HeroDef`, `WeaponDef`, `WeaponLevelDef`, `PassiveDef`, `EvolutionDef`, `StatModifier`,
  `StatusEffectDef`, `EnemyDef`, `BossDef`, `BossPhaseDef`, `AttackDef`, `PickupDef`,
  `InteractableDef`, `LevelDef`, `WaveScript`, `SpawnEvent`, `ModifierDef`, `DistrictDef`,
  `CardPoolSchedule`, `LootTable`, `QualityProfile`, `BondDef` (stub only).
- **Content validator** (`tools/validate_content.gd`, runs in tests): every ID unique, every
  reference resolves, every passive pairs 1:1 with a weapon, every level has a wave script,
  numbers within sane ranges.

### 4.2 The Swarm: data-oriented enemies (the most important performance decision)
**No Node per enemy.** Enemies live in a `Swarm` object as **struct-of-arrays**:
```
positions:  PackedVector2Array      prev_positions: PackedVector2Array  (for interpolation)
velocities: PackedVector2Array      hp: PackedFloat32Array
type_ids:   PackedInt32Array        state: PackedInt32Array (bit flags: elite, stunned, burning...)
timers:     PackedFloat32Array      anim_frame: PackedFloat32Array
```
- **Update:** one tight loop per tick: steer toward target, soft separation (max 4 neighbors
  per enemy from the spatial hash), apply statuses, contact checks.
- **Collision:** custom **spatial hash** (uniform grid, cell 1.5 m, flat `PackedInt32Array`
  buckets rebuilt each tick). No physics engine bodies for enemies or projectiles.
- **Rendering (presentation):** one `MultiMeshInstance2D` per enemy atlas; per-instance
  transform + `INSTANCE_CUSTOM` (atlas frame, flash amount, tint) read by a shader.
- **Staggering:** expensive AI (e.g., spitter targeting) updates on alternating ticks per
  half of the population; cheap movement updates every tick.
- **Removal:** swap-remove (move the last element into the dead slot); stable IDs via a
  generation counter if anything needs to reference a specific enemy.
- **Fallback ladder if M0 fails (in order):**
  1. Optimize GDScript: typed locals, no allocations in loops, cache array accesses, staggering.
  2. Move the swarm kernel (update + spatial hash) to **GDExtension (C++)**; keep everything else in GDScript.
  3. Switch engine to Unity 6 (decision-log entry required).

### 4.3 Projectiles
Same SoA approach as the swarm (`ProjectilePool`), rendered via MultiMesh per atlas.
Hit tests query the swarm's spatial hash. Pierce/bounce counters live in arrays.

### 4.4 Weapons: Strategy pattern
```
WeaponDef (data)  ->  behavior_id  ->  WeaponBehavior (code, stateless strategy)
WeaponInstance    =   def + current level + runtime state (cooldown timers, orbit angle...)
```
- `WeaponBehavior.tick(instance: WeaponInstance, ctx: CombatContext, dt: float) -> void`
- Behaviors in the slice: `melee_arc`, `melee_spin`, `lob_aoe`, `ricochet`, `pierce_line`,
  `orbit_dive`, `pulse`, `straight_multi`, `zone`, `cluster_lob`, plus `screen_charge`
  (Tram Line evolution).
- **Composition over subclassing** for extras: behaviors emit generic effects
  (`spawn_zone`, `apply_status`, `heal_player`, `spawn_subprojectiles`) described in data.
  Example: İskender Lance = `pierce_line` (4 directions) + `on_hit: spawn_zone(butter_burn)`.
- Level-ups are data (`WeaponLevelDef` = list of param deltas). No `if level == 3` in code.

### 4.5 Stats and modifiers
- `StatBlock` holds base values + a list of `StatModifier {stat, kind: flat|add_pct|mult_pct, value, source}`.
- Formula and order: game-design.md §4.2; caps: §4.4. **Implemented once** in `core/stats.gd`.
- Dirty flag: recompute on add/remove; consumers read cached finals.

### 4.6 Status effects
- `StatusEffectDef` (data): id, tick interval, magnitude, duration, stacking rule
  (`refresh` | `intensity` | `strongest`), boss behavior (`immune` | `stagger`).
- On the swarm: a bitmask in `state` + per-effect parallel arrays for timers/stacks
  (only for effects in use; avoid a dictionary per enemy).
- On heroes/bosses (nodes): a small `StatusComponent`.

### 4.7 Event bus (observer)
`autoload/event_bus.gd` declares **typed signals** for cross-system events only:
`enemy_killed(type_id, position, by_weapon_id)`, `xp_collected(amount)`, `level_up(run_level)`,
`card_chosen(item_id)`, `evolution_triggered(weapon_id)`, `hero_damaged(hero_id, amount, source_id)`,
`hero_switched(from_id, to_id)`, `boss_phase_changed(boss_id, phase)`, `segment_reached(segment_id)`,
`run_ended(result)`.
- Rules: systems never reference UI directly; UI and telemetry **subscribe**. Signals are past tense.
- Hot-path events (per hit) do **not** go through the bus; aggregate per tick if needed.

### 4.8 State machines
- **Game flow (scene router):** `Boot → MainMenu → WorldMap → PreStory → Run → Results → PostStory → WorldMap`.
- **Run state:** `Intro → Playing ↔ Paused ↔ LevelUpChoice → BossIntro → Playing → Victory | Defeat → RevivePrompt`.
- **Heroes:** `Idle, Move, Attack (anim layer only), TagIn, Ultimate, Down`.
- **Bosses:** hierarchical FSM: phase states (from `BossPhaseDef`) containing attack-selection
  states; attacks defined in `AttackDef` (telegraph shape, timings, damage, effects).

### 4.9 Spawn director and wave scripts
- Inputs: `LevelDef` → `WaveScript` (timeline of `SpawnEvent {t, enemy_id, count, pattern, spawn_tag, elite}`)
  + **budget curve** (points per second, piecewise linear) + **enemy weight table per time window**
  + active `ModifierDef`s.
- Patterns: `ring_offscreen`, `line_ahead`, `cluster`, `from_points(tag)` (doorways, alleys,
  manholes placed as markers in the level scene), `both_ends` (bridge).
- Route levels: `SegmentTrigger` and `HoldZone` markers in the scene switch the director's active
  segment config; hold zones lock the corridor until timer/objective completion.
- Respects the global cap (300) and per-type caps; refunds budget when capped.
- **No spawn logic in level scenes.** Scenes only place markers.

### 4.10 Determinism and RNG streams
- One run seed → separate `RandomNumberGenerator` streams: `spawn`, `loot`, `cards`, `combat`
  (crits), `ai`. Changing loot code must not change spawn sequences.
- Same build + same device + same seed + same inputs ⇒ same run. (Cross-device float
  determinism is **not** a goal; no lockstep multiplayer.)
- Record inputs per tick in debug builds (`InputRecorder`) for bug repro and golden tests.

### 4.11 Fixed timestep
- Simulation runs in `_physics_process` at **60 Hz on every tier** (max 4 steps per frame).
- Rendering interpolates between `prev_positions` and `positions` using the physics
  interpolation fraction (manual for MultiMesh; built-in for nodes where enabled).

### 4.12 Input: command pattern
`InputRouter` turns touch/keyboard/gamepad/bot into intents: `MoveIntent(vector)`,
`TagIntent(hero_index)`, `UltIntent`, `PauseIntent`. The simulation consumes intents only.
Bots for the balance simulator implement the same interface (`BotInputProvider`).

### 4.13 Object pooling
Pools for damage numbers, VFX instances, audio players, UI toasts. Pre-warmed at level load.
No `instantiate()`/`queue_free()` in the hot loop during a run.

### 4.14 Save system
- `user://save/slot_a.json` + `slot_b.json` (alternating writes = backup). Atomic write:
  write temp → verify → rename.
- `schema_version` + ordered migration functions (`migrate_1_to_2`, ...). Never delete fields
  in place; migrate.
- Save after: level end, meta upgrade, merge, settings change. Load failure → other slot →
  fresh save with a telemetry event (never crash).

### 4.15 Services behind interfaces (adapter pattern)
`AdsService`, `IapService` (later), `AnalyticsSink`, `ConfigProvider`, `CloudSave` (later):
interface + fake/local implementation now, real SDK adapter later. Registered in
`autoload/services.gd` (a small registry, not a god object). Gameplay code depends on interfaces only.

### 4.16 Telemetry
- `Telemetry.log(event: String, fields: Dictionary)` → `AnalyticsSink`.
- Slice sink: JSONL at `user://telemetry/<date>_<session_id>.jsonl`; flushed every 5 s and on pause/quit.
- Export: settings → "Export playtest data" (share sheet); dev builds also expose `user://telemetry` through iOS file sharing (Files app / Finder).
- Event schema: game-design.md §10. A test asserts every emitted event name is in the schema.

### 4.17 Quality tiers
- `QualityProfile` resources: `low.tres`, `mid.tres`, `high.tres` (texture set, particle
  budget, lights, post-fx, decal persistence; design-system.md §14).
- `DeviceTierDetector` on first launch: GPU name + RAM heuristics + a 3 s render micro-benchmark
  in the menu; result saved; user override in settings.
- **Enforcement:** `tests/arch/test_sim_independent_of_quality.gd` fails if any file under
  `game/sim/` or `game/core/` references `QualityProfile`, `quality_tier`, or `presentation/`.

### 4.18 Localization
- **Dialogue store (D-051).** Voice text (barks, story pages, pops, calls, captions, finale, card flavour) is class C and lives only in
  the dialogue store: a shared beat table (`beats-*.js`: id, speaker, use, bubble limit, joke allowed) plus one native line set per
  language (`tr/*.js`, `en/*.js`: `beatId -> [{ t, j?, spk?, mood? }]`), data only and JSON-convertible so the Godot port loads the
  same files. API `P.Dialogue`: `line(id, opts)` (random, no repeat until exhausted, never the last, view RNG only), `get(id)` (fixed
  variant for pages, pops and calls), `pool`, `has`, `beat`, `ids`. A missing beat or language line returns null and fails
  `tools/test-dialogue.js`; there is no fallback to the other language. UI (class A) and rules text (class B) stay in `P.STR` and are
  translated precisely.
- **Locale selection.** First launch reads the device language (prototype `navigator.languages`; Godot `OS.get_locale_language()`):
  any `tr*` selects Turkish, anything else English, saved as the player's setting. Settings overrides it and switches at once
  (open pages, pops and calls re-resolve); the URL `?lang=tr|en` overrides for testing and is not saved.
- The sim never reads text or the language: call subtitle times are config (`callDur`), not a function of the line.
- **Review batches and tools (prototype, `tools/`).** `js/dialogue/batches.js` lists the beats of each writing pass (A first) and
  `intents.js` holds one English intent line per beat; both scripts are written from the intent, never from each other.
  `dialogue-export.js --lang= --batch=` writes the editor CSV, `dialogue-import.js` applies keep / rewrite / cut verdicts (the only
  thing that sets `ok: 1`), `dialogue-apply.js` writes authored lines into the data files, `dialogue-lint.js` checks an authored file
  (length, joke ratio, banned lists, duplicates, profanity caps), and `test-dialogue.js` enforces the same checks on every written
  batch (`lib-dialogue-checks.js`; later batches are counted as notes, the guardrail list must have zero hits everywhere).
- Godot translation system with `localization/strings.csv` (keys + TR + EN).
- `services/text_util.gd` provides `upper(text, locale)` / `lower(text, locale)` that handle
  Turkish `i/İ` and `ı/I` (the built-in `to_upper()` is locale-blind). Unit-tested.

### 4.19 Autoloads (keep to three)
`EventBus` (signals), `Services` (service registry), `SceneRouter` (game flow).
Everything else is a regular class or scene. No "GameManager" god object.

## 5. Dependency Rules

```
content/defs  <-  core  <-  sim  <-  presentation
                    ^        ^           |
                    |        +---- meta --+
services (interfaces) are usable by sim/meta/presentation; implementations never by core.
```
- `core/` depends only on `content/defs` (pure, RefCounted, no Nodes, no engine singletons).
- `sim/` never depends on `presentation/`, `QualityProfile`, or UI.
- `presentation/` reads sim state; it never mutates it (except through intents).
- Enforced by architecture tests (path/reference scans) in `tests/arch/`.

## 6. Testing Strategy

| Layer | What | Examples |
|---|---|---|
| Unit (`tests/unit`) | Pure rules in `core/` | XP table matches game-design.md §4.5; damage formula; modifier order; caps; card weights; merge rules; Turkish casing |
| Integration (`tests/integration`) | Systems together, headless | Spawn director produces the expected counts for a seed; each weapon behavior hits the expected targets in a fixed scenario; boss phase transitions |
| Golden (`tests/golden`) | Determinism | Recorded input + seed → same kills/XP/time ± 0 |
| Architecture (`tests/arch`) | Dependency rules | §4.17, §5 |
| Content (`tests/content`) | Data validity | Validator in §4.1 |
| Performance (`tools/`) | Budgets | Headless sim benchmark (500 enemies, ms/tick); on-device benchmark scene (fps, p95) |
| Balance (`tools/bot_sim.gd`) | Difficulty bands | game-design.md §11 |

**Commands** (documented in AGENTS.md once the project exists):
`godot --headless --path game -s addons/gut/gut_cmdln.gd -gexit` (tests),
`godot --headless --path game --script res://tools/bot_sim.gd -- --level=L001 --seeds=50` (balance).

## 7. Performance Budgets (Low tier, 33.3 ms frame)

| Budget | Target |
|---|---|
| Simulation | ≤ 4 ms per tick (≤ 8 ms per frame at 2 ticks/frame) |
| Rendering | ≤ 14 ms |
| UI + scripts outside sim | ≤ 3 ms |
| Allocations in the run loop | ~0 per frame (pools, packed arrays) |
| Draw calls | ≤ 80 |
| Memory | ≤ 600 MB |
| **M0 benchmark scene** | 500 walkers with separation + 200 projectiles + 300 XP droplets, 60 s, on the Low reference device: report p50/p95 frame time, sim ms/tick, memory |

Profile with the Godot profiler + on-device frame timing; record results in review packets.

## 8. Godot 3 → 4 Pitfalls (AI models often mix them up)

| Godot 3 (WRONG here) | Godot 4 (RIGHT) |
|---|---|
| `KinematicBody2D` | `CharacterBody2D` |
| `yield(obj, "signal")` | `await obj.signal` |
| `onready var x` | `@onready var x` |
| `export var x` | `@export var x` |
| `tool` | `@tool` |
| `connect("sig", self, "_on_sig")` | `sig.connect(_on_sig)` |
| `move_and_slide(velocity)` | set `velocity`, then `move_and_slide()` |
| `PoolVector2Array` | `PackedVector2Array` |
| `scene.instance()` | `scene.instantiate()` |
| `rand_range()` | `randf_range()` |
| `stepify()` | `snapped()` |
| `OS.get_ticks_msec()` | `Time.get_ticks_msec()` |
| `update()` (redraw) | `queue_redraw()` |
| `setget` | `var x: int: set = _set_x, get = _get_x` |
| `File` / `Directory` | `FileAccess` / `DirAccess` |
| `JSON.parse()` result object | `JSON.parse_string()` or `JSON.new().parse()` |
| `deg2rad()` | `deg_to_rad()` |
| `Tween` node | `create_tween()` |
| `VisibilityNotifier2D` | `VisibleOnScreenNotifier2D` |
| `Position2D` | `Marker2D` |
| `YSort` node | `y_sort_enabled` property |

Reviewer check: any Godot 3 API in a diff is an automatic revision request.

## 9. Coding Conventions

- **Static typing everywhere** (`var hp: float = 0.0`, typed arrays, typed function signatures).
- `snake_case` files and functions, `PascalCase` classes (`class_name` for reusable types).
- Signals are past tense (`enemy_killed`). Booleans read as questions (`is_elite`).
- **No magic numbers in `sim/`**: every gameplay number comes from a Def.
- Functions ≤ ~40 lines; files ≤ 300 lines preferred, **600 hard limit**; split by responsibility.
- Doc comments (`##`) on every public class and function: *why*, not *what*.
- One concern per file; no "utils" dumping grounds (name modules by purpose).
- Every change that alters design intent updates the owning doc + product.md decision log.
