# Project Istanbul: Game Design (Systems)

> **Status:** v0.1 · 2026-11-08 · Owns: rules, formulas, progression, economy, telemetry.
> **Numbers for specific items/enemies/bosses:** [content-catalog.md](content-catalog.md).
> **Every number here is a STARTING VALUE.** Tune it in playtests. Once implemented,
> `game/content/**/*.tres` is the source of truth for values; update this doc in design review.

Units: distances in **meters (m)**, time in **seconds (s)**. Reference camera shows
**12 m width** in portrait (≈ 90 px/m at 1080 px width).

---

## 1. Design Goals and Feel Targets

1. **Readable chaos.** Hundreds of enemies, but the player always knows where they are,
   what will hurt them, and what they just picked up.
2. **Power fantasy curve.** Every run starts fragile and ends godlike. The knife-stabbing
   kid becomes a samovar-wielding storm.
3. **Short sessions, long arcs.** Runs are 3–8 min; the journey (world map, story, meta)
   gives a reason to come back.
4. **Local flavor in mechanics, not just art.** Weapons, enemies and interactables are
   Istanbul things that behave in fun ways.
5. **One thumb.** Everything essential works with one thumb; tag-switch and ultimate are
   optional (auto modes exist).

## 2. Controls and Camera

| Element | Spec |
|---|---|
| Orientation | Portrait, reference 1080 × 2340, safe-area aware |
| Move | Floating joystick spawns at the touch point in the lower 60% of the screen. Radius 1.1 cm physical. Dead-zone 8%. Release = stop. |
| Attack | Automatic. Weapons target per their behavior (content-catalog.md §2). |
| Facing | Last non-zero move direction (matters for the Speargun line and later directional weapons; the Döner Knife auto-aims). |
| Tag-switch | Squad portraits, bottom-left column (mirrored in left-handed mode). Unlocks in L30. |
| Ultimate | Button bottom-right; glows when charged. "Auto-ult" setting fires it automatically. |
| Pause | Top-right; always available, including in boss fights. |
| Camera | Top-down 3/4 view. Follows the player with **look-ahead 1.5 m** in the move direction, smoothing 0.15 s. Route levels clamp to corridor walls. Zooms out to 13.5 m width during hold zones and bosses (0.6 s ease). |
| Desktop dev controls | WASD/arrows = move, 1–4 = tag, Space = ult, P = pause. (Testing only.) |

## 3. Run Lifecycle

`Level select → (pre-level story) → Run → (boss) → Results → (post-level story) → World map`

- **Run start:** hero spawns with its signature weapon at L1. In-run level resets to 1 every run.
- **During the run:** kill enemies → XP drops (Adrenaline droplets) → level-up → pick 1 of 3 cards.
- **Win:** Route levels: reach the exit trigger. Arena levels: survive the timer.
  Boss levels: defeat the boss.
- **Lose:** active hero HP hits 0 and no companion can take over → Revive offer
  (1 per run: rewarded ad stub or 20 Altın) → otherwise Results (partial rewards: 50% Jeton).
- **First-run safety net:** on the player's very first L1 run, the first death triggers a free
  "Second Wind" auto-revive (full HP, 2 s invulnerability). Never again after that.

---

## 4. Stats and Formulas

### 4.1 Stats
| Stat | Meaning | Base (Arda) |
|---|---|---|
| `max_hp` | Health | 100 |
| `armor` | Flat damage reduction per hit | 0 |
| `move_speed` | m/s | 3.2 |
| `might` | % bonus to all damage | 0% |
| `area` | % bonus to weapon **radius / length** (not surface area) | 0% |
| `cooldown_reduction` | % reduction of weapon cooldowns | 0% |
| `projectile_bonus` | Extra projectiles for projectile weapons | 0 |
| `duration` | % bonus to effect durations (zones, orbits, statuses we apply) | 0% |
| `pickup_radius` | m | 1.5 |
| `luck` | % bonus to drop chances and card rarity rolls | 0% |
| `crit_chance` | % | 5% |
| `crit_damage` | Multiplier on crit | 1.5× |
| `regen` | HP/s | 0 |
| `xp_gain` | % bonus XP | 0% |

### 4.2 Modifier stacking (one order, everywhere)
```
final = (base + sum(flat)) * (1 + sum(add_pct)) * product(1 + mult_pct)
```
- `flat`: e.g., Puffer Jacket +1 armor.
- `add_pct`: most passives and gear (they add together).
- `mult_pct`: rare, explicitly labelled "multiplicative" (evolutions, ultimates).
- **Percentage stats with a 0 base** (`might`, `area`, `cooldown_reduction`, `duration`, `luck`,
  `xp_gain`, `crit_chance`) are stored as fractions and granted with **`flat`** modifiers
  (Butter +10% might = `flat 0.10`); `add_pct` on a zero base would do nothing.
- Recompute only when a modifier changes (dirty flag), never per frame.

### 4.3 Damage
```
outgoing = weapon_damage * (1 + might) * crit * (1 + target_vulnerability) * (1 - target_damage_reduction)
crit     = crit_damage if rng() < crit_chance else 1
incoming_to_player = max(1, raw - armor) * (1 - player_damage_reduction)
```
- Damage numbers round to integers **for display only**; simulation keeps floats.
- Contact damage from enemies ticks at most once per **0.5 s per enemy**.
- Player gets **0.25 s** invulnerability after any hit ≥ 10% max HP (prevents swarm melt spikes).

### 4.4 Caps
| Stat | Cap |
|---|---|
| `cooldown_reduction` | 60% |
| `move_speed` bonus | +100% |
| `area` bonus | +200% |
| `crit_chance` | 100% |
| `projectile_bonus` | +5 |
| `player_damage_reduction` | 75% |

### 4.5 XP curve (in-run)
```
xp_to_next(level) = round(5 + 5 * level^1.6)   # exponent 1.6 matches config.js xp.exp (audit D-1)
```
| Level | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 15 | 20 | 25 | 30 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| XP to next | 10 | 20 | 34 | 51 | 71 | 93 | 117 | 144 | 173 | 204 | 386 | 608 | 867 | 1159 |

**Pacing targets:** first level-up at **~15 s**; a level-up every **20–30 s** in early levels;
**6–8 level-ups in L1**, **20–25 in an 8-minute run** at L20+.

### 4.6 Enemy scaling
```
enemy_hp     = base_hp  * (1 + 0.10 * (level_index - 1)) * (1 + 0.08 * minutes_into_run)
enemy_damage = base_dmg * (1 + 0.05 * (level_index - 1))
```
- `level_index` is the global level number (1–300).
- Elites: ×4 HP, ×1.5 damage, +15% scale (content-catalog.md §5).
- Bosses use explicit HP per level (content-catalog.md §6), not this formula.
- **Shipped (v0.6):** enemy HP follows the E2 curve in `config-levels.js` (journey §6.2). The formula above is the pre-build reference. Late difficulty comes from the new types (kasap, parkur, zehirli) and the affixes (journey §5.0). The player's power comes from the lever in attributes.md §7.5.

### 4.7 Status effects
| Effect | Rule | Stacking |
|---|---|---|
| **Burn** | 3 dmg/s (scaled by might) for 3 s | Up to 3 stacks (intensity); refresh duration on new stack |
| **Slow** | −X% move speed | Strongest wins; no stacking |
| **Stun** | Cannot move/attack for X s | Refresh; bosses immune → take a 0.3 s **Stagger** instead |
| **Knockback** | Push X m away from the source over 0.15 s | Brutes and bosses resist (content-catalog.md) |
| **Vulnerable** | Takes +15% damage | Refresh |
| **Calm** (Ada, later) | −30% move speed within 2.5 m of Ada | Aura, not a stack |
| **Grabbed** (player) | Fisherman line pulls the player 1.5 m | Wiggle the joystick to cut it short (−50% pull) |

All statuses respect the **duration** stat when applied by the player.

---

## 5. Build System (in-run)

### 5.1 Slots
- **6 weapon slots** (the signature weapon occupies 1) and **6 passive slots**.
- Squad shares one build: card weapons fire **from the currently controlled hero**;
  companions use their own signature weapon only (see §9).

### 5.2 Item levels
- Weapons: L1–L5. Passives: L1–L5 (except Sesame, max L2, later).
- Each level's effect is defined per item in content-catalog.md.

### 5.3 Card offering (3 cards per level-up)
Draw without replacement, using these weights:
| Candidate | Weight |
|---|---|
| Upgrade an owned weapon | 3 |
| Upgrade an owned passive | 3 |
| New weapon (if a weapon slot is free) | 2 |
| New passive (if a passive slot is free) | 2 |
| Owned weapon at L4 whose paired passive is owned (evolution path) | +2 bonus |

Rules:
- Never offer maxed items. Never offer locked items (§5.4).
- If fewer than 3 valid candidates: fill with **Simit** (heal 30 HP) and **Jeton +20** cards.
- **Luck** adds a chance (luck% × 0.5) to show a **4th card**.
- The game is paused while the card UI is open.

### 5.4 Progressive pool unlock (onboarding)

> **Superseded (D-017, D-027):** the onboarding pool is now the D-017 kit, and the unlock schedule is in `journey.md` §7
> (`C.unlock` in `config-weapons.js`). The table below is v0.2 and is kept for the history of the pool design.
| Unlocks at level | Items added to the card pool |
|---|---|
| L1 | Döner Knife (signature), Nail Gun, Gas Canister, Bike Chain (D-017 kit) |
| L2 | Simit, Teapot |
| L3 | Seagulls, Turkish Coffee |
| L4 | Döner Skewer, Puffer Jacket |
| L6 (after beating L5 Kestaneci) | Chestnut Mortar |
| L11 (after beating L10 Vatman) | Tram Bell |
| Later chapters | Lahmacun Barrage, Pickle Juice, Pul Biber, Sesame (+ their evolutions) |

**L1 scripted first card:** `[Nail Gun, Döner Knife L2, Running Shoes]` (config `scriptedFirstCard`: `['w:nailgun', 'w:knife', 'p:shoes']`).

### 5.5 Evolutions
- Condition: weapon at **L5** + its **paired passive owned** (any level) + open a **Boss Chest**.
- The evolution replaces the weapon in the same slot; the passive stays.
- One evolution per chest; if several qualify, the chest picks the oldest-owned weapon.
- Pairs and effects: content-catalog.md §4.

### 5.6 Rerolls
- 1 free reroll per run; +1 per rewarded ad (stub), max 3 per run.
- Banish (remove an item from the run's pool): not in the slice.

### 5.7 Chests
| Chest | Source | Opens into |
|---|---|---|
| **Mini Chest (Kutu)** | Elites (100%) | 1 random upgrade (same weights as §5.3) |
| **Boss Chest** | Mini-bosses and bosses | Evolution if eligible; otherwise 1–3 upgrades (1: 60%, 2: 30%, 3: 10%; luck shifts toward 3) |

---

## 6. Level Types and District Structure

> **Superseded for Chapter 1 (D-027):** Chapter 1 is 20 hoods × 5 levels. The hood template (stages, holds, waves,
> elites, boss) is in `journey.md` §3. The district template below is kept for Chapters 2–4 until their journey pass.

| Type | Shape | Win condition | Typical length |
|---|---|---|---|
| **Route** | Corridor (12–16 m wide, 200–400 m long) with 2–3 **hold zones** where the path is blocked until a timer or objective completes | Reach the exit trigger | 3–6 min |
| **Arena** | Bounded open area (~30 × 30 m to 40 × 40 m) with props and interactables | Survive the timer | 5–8 min |
| **Boss** | Route or Arena, ending in a boss arena | Defeat the boss | 6–9 min |

**District template (10 levels):**
| Level in district | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Type | Route | Arena | Route | Arena | **Mini-boss** | Route | Arena | Route (night) | Arena (horde modifier) | **Boss** |

**Modifiers** (data-driven, combinable): `night` (reduced light radius 7 m; lit props matter),
`fog`, `horde` (spawn budget ×1.5, XP ×1.2), `ambush` (spawns from behind allowed), `rain`
(visual only in the slice).

**Spawn rules (all types):**
- Enemies spawn in a ring **just outside the camera** (+1.5 m margin), never on screen,
  except **telegraphed spawns** (crawlers from manholes, 1.0 s telegraph).
- Route levels: 70% of spawns ahead / sides, 30% behind; behind-spawns only > 7 m from the
  player, with a 0.5 s audio cue (groan) first.
- The spawn director uses a **budget per second** curve + scripted events from WaveScript
  (architecture.md §4.9). Each enemy has a budget cost (content-catalog.md §5).
- **Max simultaneous enemies (code, R1 audit B6):** route spawns stop at **140** alive (`levels.cap`, config-levels.js:95); horde spawns stop at **200** (`ctl.cap`, config-horde.js:22). Boss adds, summons, elite and event spawns have no cap check, so the peak overshoots: 185 alive at L2 in the bot (kite policy), about 200 to 203 in boss arenas. The 300 that stood here before has no basis in code. Identical on all quality tiers (gameplay parity).

## 7. Difficulty and Pacing Targets

**Sawtooth curve:** difficulty rises across a district, drops after each boss, rises again.

| Levels | Target first-attempt clear rate |
|---|---|
| 1–4 | ≥ 95% |
| 5 (mini-boss) | ≈ 90% |
| 6–9 | 85–90% |
| 10 (boss) | ≈ 70% |
| 11–19 | 75–90% (sawtooth) |
| 20 (boss) | ≈ 65% |
| 21–29 | 70–85% |
| 30 (Kaan) | ≈ 60% |

Failing should teach: Results screen shows the **cause of death** (enemy type) and one tip.
A failed level can be replayed immediately with the meta upgrades the player just earned.

---

## 8. Meta Progression and Monetization Hooks (between runs)

**Principle:** every progression system is designed together with how it makes money.
**Power is always earnable by playing;** money buys **speed, convenience and style**.
Pricing, store catalog, ads and revenue model: [business-plan.md](business-plan.md).
Each system below lists its **monetization hook** and its **phase** (Slice = vertical slice;
SL = soft-launch prep, after M7).

### 8.1 Currencies (four, no more)
| Currency | Spent on | Earned by playing | Bought with money |
|---|---|---|---|
| **Jeton** (old Istanbul transit tokens), soft | Hero levels, gear upgrades, Bazaar Jeton slots, boosters (mastery is kill-based, §8.4) | Level clears, enemy drops, daily tasks, pass | Packs (via Altın or IAP bundles) |
| **Hurda** (scrap), materials | Gear upgrades | Level clears, star chests, pass | Packs, Bazaar |
| **Street Cred** (SC; merged with Skill Credits, D-043) | Attribute ranks (attributes.md §2–3) | Lifetime kill milestones (attributes.md §3), +2 per hero level, star chests, boss first clears, pass | Bundles (capped per week, business-plan.md §5) |
| **Altın** (Grand Bazaar gold), premium | Revives, rerolls, Bazaar Altın slots, boosters, pass tier skips, packs | Star chests, boss first clears, daily tasks (small), Monthly Card | IAP |

Run-only resources (XP) never leave the run.

### 8.2 Hero levels (Slice)
- Cap per chapter progress: **L15** in the slice (rises with chapters, so money can't buy past content).
- Cost: `jeton = round(50 * level^1.5)` → L1→2: 50, L5→6: 559, L10→11: 1,581, L14→15: 2,619.
- Per level: +4% max HP, +3% might (`add_pct`), **+2 Street Cred**.
- **Hook:** Jeton packs speed up leveling.

### 8.3 Survival Skills: per-hero skill tree (retired for Chapter 1, D-044)
**Retired for Chapter 1 (audit A1, D-044).** Attributes (attributes.md) replace this tree in Ch1. The text below is kept for the Ch2 review.
- Three branches per hero: **Offense / Defense / Utility**, 5 nodes each + 1 capstone.
  Nodes have ranks 1–3. Node tier *t* (1–5) at rank *r* costs `t * r` Skill Credits.
- Branch nodes unlock in order; the capstone needs 10 points in that branch.
- **Arda examples:** *Knife Discipline* (+10% knife damage per rank), *Street Smart* (+5% XP gain
  per rank), *Thick Hoodie* (+1 armor per rank), *Lucky Find* (+5% luck per rank),
  capstone *Second Wind* (once per run: survive a lethal hit at 1 HP + 2 s invulnerability).
- **Kaan examples:** *Anchor Weight* (+15% anchor knockback per rank), *Big Guy* (+8% max HP per
  rank), capstone *Unbreakable* (Ground Slam also shields the squad for 3 s).
- Respec: free once, then 50 Altın.
- **Hook:** Street Cred bundles (weekly cap). Credits are the scarcest earnable resource, by design.

### 8.4 Weapon Mastery: the Workshop (Atölye) (Slice)
- Every card weapon has **Mastery rank 0–5**, permanent across runs (the "weapon power-ups").
- **Rank comes from lifetime kills** with that weapon (audit D-2, D-032), not from Jeton.
- Each rank: **+3% damage** and **−2% cooldown** for that weapon (`config-weapons2.js` mastery:
  `dmgPerRank` 0.03, `cdPerRank` 0.02).
- Rank 3 unlocks a third option; rank 5 is the signature (`thirdOptionRank`, `sigRank` in
  `config-weapons2.js`). Perks live in each `WeaponDef`.
- Mastery is not bought. Jeton and Hurda stay as the other sinks (gear, hero levels, Bazaar).
- Chapter 1 cap: rank 5.
- **Hook:** Hurda and Jeton packs; the Workshop is the main long-term sink.

### 8.5 Pre-run boosters (SL)
One booster per run, chosen on the level-start screen:
| Booster | Effect | Cost |
|---|---|---|
| Head Start | Start the run at run level 3 | 300 Jeton or 10 Altın |
| Extra Reroll | +2 card rerolls this run | 200 Jeton or 5 Altın |
| Ayran Flask | Free revive at 50% HP | 15 Altın |
| Magnet Start | A magnet pickup every 60 s | 250 Jeton or 8 Altın |
**Earnable:** daily tasks and the Road Pass free track. **Hook:** Altın sink, impulse value.

### 8.6 Gear (Slice; Bazaar source SL)
| Slot | Main stat | Secondary (rolled at Rare+) |
|---|---|---|
| Gloves | Might | Crit chance |
| Jacket | Max HP | Armor |
| Shoes | Move speed | Duration |
| Backpack | Pickup radius | Luck |

- **Rarities:** Common → Uncommon → Rare → Epic (Legendary later). Main stat multiplier
  1.0 / 1.6 / 2.5 / 4.0. Max upgrade level 10 / 20 / 30 / 40.
- **Merge:** 3 identical items (same item, same rarity) → 1 of the next rarity, keeping the
  highest upgrade level.
- **Upgrade cost per level:** `jeton = 20 * lvl`, `hurda = 2 + lvl`.
- **Sources:** level first-clear (guaranteed Common), star chests, boss first-clear
  (guaranteed Uncommon), **the Bazaar** (§8.9, deterministic: you see exactly what you buy).
- **No paid random gear chests.** Ever, unless a decision-log entry with legal review says otherwise.

### 8.7 Stars and rewards (Slice)
- **Stars per level:** Star 1 = clear · Star 2 = no revive used · Star 3 = end with ≥ 50% HP.
- **Star chests per district:** at 10 / 20 / 30 stars (Jeton, Hurda, Street Cred, a little Altın).
- **Level clear rewards:** `jeton = 40 + 6 * level`, `hurda = 5 + floor(level / 2)`;
  **first clear ×2**. **Double reward** via rewarded ad (§8.13).

### 8.8 Daily and weekly loops (SL)
- **Daily tasks (3/day):** e.g., "Defeat 500 zombies", "Clear 2 levels", "Evolve a weapon".
  Rewards: Jeton, Road Pass XP, small Altın on completing all three.
- **7-day login calendar** (repeats): day 7 = a booster + Street Cred.
- **Weekly event** (endgame, product.md §7) with cosmetic rewards.

### 8.9 The Bazaar: Grand Bazaar shop (SL)
- **6 slots, refreshed daily** at local midnight: 4 Jeton slots (Common/Uncommon gear, Hurda,
  boosters), 2 Altın slots (Rare/Epic gear, Street Cred bundles).
- Refresh: 1 free via rewarded ad per day, then Altın.
- Shopkeeper character with barks ("Gel abi, bakı bedava!" / "Come in, looking is free!").
- **Hook:** daily return reason + Altın sink; **deterministic** (no loot-box rules apply).

### 8.10 Road Pass (Yol Kartı): season pass (SL)
- 4-week seasons, 30 tiers, XP from daily tasks and level clears.
- **Free track:** Jeton, Hurda, Street Cred, boosters.
- **Premium track:** an exclusive hero outfit, a cat companion skin, Altın, one **Epic gear item
  of your choice** (deterministic pick from 4), extra Street Cred.
- Tier skips for Altın. Season themes follow the story (e.g., "Galata Nights").

### 8.11 Monthly Card (Aylık Kart) (SL)
30 days: instant Altın + daily Altın on login, **auto-claim rewarded-ad rewards without
watching ads**, +1 Bazaar slot, +1 free reroll per run. The best-value purchase, positioned for
the engaged non-whale majority.

### 8.12 Cosmetics (SL)
Hero outfits (e.g., Arda as a ferry captain, Kaan in a fisherman's jacket, Mila in a track
suit), weapon skins (gold-plated knife, porcelain tea tray), **cat companions** (Pasha variants:
tuxedo, calico, ginger kitten) that follow you. **Cosmetics give no stats.**

### 8.13 Rewarded ads (Slice: stubs; SL: real SDK)
| Placement | Reward | Cap |
|---|---|---|
| Revive | Full revive | 1 per run |
| Double reward | ×2 Jeton/Hurda on results | 1 per level clear |
| Reroll | +1 card reroll | 3 per run |
| Bazaar refresh | New Bazaar stock | 1 per day |
| Daily free chest | Small Jeton/Hurda/booster chest | 1 per day |
- Global cap: **15 rewarded ads per day**. **No interstitial or banner ads in v1.**
- Monthly Card holders get every reward without watching.

### 8.14 Offers (SL)
| Offer | Trigger | Rule |
|---|---|---|
| Starter Pack | After clearing L5 | Shown once; available 72 h |
| District Pack | On entering a new district | Shown once per district |
| Boss Helper | After failing the same boss twice | Max once per boss, never during a run |
| Squad Welcome | After Kaan joins (L30) | Shown once |
**Offer ethics:** max **one** pop-up offer per session, never during a run or a story scene,
no fake countdowns, every offer also reachable from the store, prices always shown in local currency.

### 8.15 Power caps (protecting the game from money)
Hero level cap, Workshop mastery cap and gear rarity availability rise with **chapter progress**.
Money speeds you up within the current cap; it never lets you skip content or trivialize the
next chapter.

**v0.6 power lever (D-041):** the walk gives a persistent power ladder: hood rank, attributes
(Street Cred), gear base items and mastery. Numbers and Ch1 caps: attributes.md §7.5.
Enemy HP stays on the E2 curve; new enemy types and affixes carry the late difficulty (journey §5.0).

### 8.16 Economy health checks (monitor in telemetry)
- A non-paying player at ~3 sessions/day reaches **L30 in 7–10 days**; a Monthly Card holder
  about **25–30% faster**; no spend level more than **2× faster** than non-payers.
- A player who 1-stars every level can afford roughly one hero level per 2 levels in L1–30.
- First Rare gear around L15–20 for a non-paying player.
- Street Cred feels scarce but never blocks: each attribute can reach its next rank in each
  district without spending money.
- Sink/faucet ratio per currency reviewed weekly in soft launch (business-plan.md §8).

---

## 9. Squad, Tag-Switch and Ultimates

### 9.1 Squad
- The squad unlocks at **L20** (Kaan joins on the `kaan_join` page, D-045). Before that, Arda is solo.
  The squad itself is not in the prototype yet.
- **Controlled hero:** moves with the joystick; card weapons fire from them.
- **Companions:** AI-controlled, follow within 3 m (leash 6 m, teleport back if > 10 m off
  screen), use their signature weapon and ultimate (auto), and have their own HP.
- **Companion down:** revive by standing within 1.5 m for 3 s, or auto-revive after 20 s.
- **Squad wipe:** if the controlled hero goes down and a companion is alive, control switches
  automatically (1 s slow-mo). If all are down → Revive offer → Results.

### 9.2 Tag-switch
- Tap a portrait to take control of that hero. **Cooldown 8 s** (shared).
- **Tag-in move:** 0.5 s invulnerability + a hero-specific burst (content-catalog.md §1).
- Tag-switching keeps the in-run build; only the "body" changes.

### 9.3 Ultimates
- Charge: 100 points. Kill +1, elite kill +10, boss hit +0.5 (max 5 per second).
- Each hero has their own charge meter; companions fire theirs automatically at 100.
- Ultimates are listed per hero in content-catalog.md §1.

### 9.4 Bonds (later chapters)
Bond meters and combo ultimates are defined in narrative.md, *Romance & Branching*.
**Not in the slice;** keep the data model ready (`BondDef` stub) and nothing more (YAGNI).

---

## 10. Telemetry Events (slice)

Written as JSONL locally (architecture.md §4.16). Every event has: `ts`, `install_id`,
`session_id`, `build`, `quality_tier`, `device_model`, `event`, `level`, `seed`.

| Event | Extra fields |
|---|---|
| `session_start` / `session_end` | `duration_s` |
| `level_start` | `level_type`, `hero_ids`, `hero_levels`, `gear_power` |
| `segment_reached` | `segment_id`, `t_s` (Route levels) |
| `level_up` | `run_level`, `t_s` |
| `card_offered` / `card_chosen` | `cards[]`, `chosen`, `rerolled` |
| `evolution` | `weapon_id`, `t_s` |
| `boss_phase` | `boss_id`, `phase`, `t_s`, `player_hp_pct` |
| `player_hit` (sampled 10%) | `source_id`, `damage`, `hp_after` |
| `death` | `cause_id`, `t_s`, `run_level`, `build[]` |
| `revive_offer` / `revive_used` | `method` |
| `level_end` | `result` (win/lose/quit), `t_s`, `stars`, `kills`, `rewards` |
| `cinematic` | `id`, `action` (complete/skip), `t_s` |
| `tutorial_step` | `step_id`, `t_s` |
| `meta_upgrade` | `type` (hero/skill/mastery/gear/merge), `id`, `cost` |
| `currency_flow` | `currency`, `delta`, `source_or_sink`, `balance_after` (every earn/spend) |
| `store_view` / `offer_shown` / `offer_result` | `placement`, `offer_id`, `result` (SL) |
| `purchase` | `sku`, `price_local`, `currency_code`, `result` (stub in the slice) |
| `booster_used` / `pass_tier` | `booster_id` / `tier`, `track` (SL) |
| `ad_stub` | `placement`, `result` |
| `perf_sample` (every 10 s) | `fps_avg`, `frame_p95_ms`, `enemies_alive`, `mem_mb` |

## 11. Balance Tooling: Headless Bot Simulator

- Runs a level headless with a fixed seed and a **bot input strategy**:
  `kite_circle` (moves in wide circles), `greedy_xp` (moves toward the nearest XP),
  `random_walk` (baseline noob).
- Card choice strategies: `random`, `greedy_damage`, `evo_seeker`.
- Command runs N seeds × strategies per level and writes `reports/balance/<level>.csv`:
  clear rate, median clear time, time to first level-up, level-ups, deaths by cause, peak enemies.
- **Use it before every review packet** for any level that changed. Target bands: §7.

## 12. Future Systems (documented, not built)

| System | Chapter | Note |
|---|---|---|
| Battery charge (scooters) | 2 | In-run resource; drains while riding; pickups refill |
| Vehicle levels & garage | 2–3 | Vehicle as a "hero" with its own stats and upgrade tree |
| Fuel | 3 | Like battery, for the car |
| Human enemies with cover/flanking | 2+ | New AI behaviors on top of the swarm system |
| Bonds & combo ultimates | 2+ | See §9.4 |
| Day/night cycle within a level | 2+ | The slice has the `night` modifier only |
