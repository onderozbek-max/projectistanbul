# Project Istanbul: Content Catalog (Vertical Slice + Planned)

> **Status:** v0.2 · 2026-11-08 (v0.4 docs pass: D-017, D-018, D-027–D-031) · Owns: starting numbers for heroes, weapons, passives,
> evolutions, enemies, bosses, pickups, interactables, and the L1–30 level list.
> **Rules that use these numbers:** [game-design.md](game-design.md).
> After implementation, `game/content/**/*.tres` is the source of truth. IDs below are the
> resource IDs (snake_case). Display names come from localization keys, not from these tables.

---

## 1. Heroes

| ID | Name | HP | Armor | Move (m/s) | Signature weapon | Tag-in move | Ultimate | Available |
|---|---|---|---|---|---|---|---|---|
| `hero_arda` | Arda | 100 | 0 | 3.2 | Döner Knife (`wpn_knife`) | **Kaçış (dash):** 3.2 m in 0.16 s, 0.3 s i-frames, 3.5 s cooldown (`skill_dash`, D-031) | **Evil-Eye Burst (Nazar Patlaması):** 2 s burst, 60 dmg ring, push 2.5 m; charged by kills and elites (`skill_ult`, D-031) | Slice (start) |
| `hero_kaan` | Kaan | 180 | 2 | 2.6 | Anchor | **Mini Slam:** r 1.5 m, 25 dmg, knockback 1 m | **Ground Slam:** r 3.5 m, 80 dmg, stun 1 s, knockback 2 m | Slice (L30) |
| `hero_mila` | Mila | 70 | 0 | 4.2 | Twin Batons | **Dash:** 3 m through enemies, 15 dmg | **Sprint Blitz:** 3 rapid dashes (35 dmg each), leaves a 40% slow trail for 3 s | Chapter 2 |
| `hero_ada` | Ada | 80 | 0 | 3.2 | Slingshot | **Calm Pulse:** r 3 m, slow 40% for 2 s | **Calm Field:** r 5 m, slow 60% for 4 s + volley of 12 bolts (20 dmg each) | Chapter 2 |

**Companion signature weapons** (scale with hero meta level, not with in-run cards):
| ID | Behavior | Damage | Cooldown | Area / range | Notes |
|---|---|---|---|---|---|
| `wpn_anchor` | `melee_spin` | 30 | 2.5 s | r 2.2 m, 360° | Knockback 1 m |
| `wpn_batons` | `melee_arc` | 6 × 2 hits | 0.5 s | 1.4 m, 90° | Fastest attack in the game |
| `wpn_slingshot` | `straight_multi` | 10 | 0.9 s | 8 m, speed 14 m/s | Pierce 2, targets nearest |

---

## 2. Card Weapons

> **v0.4 (D-017, D-018, D-030):** `wpn_fork` is now `wpn_knife`, the Döner Knife, Arda's starting weapon. The
> rows below are v0.2 data. Tea Glass is out of the slice (Çaycı Tepsisi takes its role; `weapons-skills.md` §5).
> The v0.4 slice arsenal is in §10.1. v0.5 (workstream A): the forced items are replaced by the kit in §10.5.
> `wpn_simit` and `wpn_chestnut_mortar` below are retired.

Behaviors map 1:1 to weapon strategy classes (architecture.md §4.4). Damage is base, before stats.

| ID | Name (EN / TR) | Behavior | Targeting | Dmg | CD (s) | Area / range | Proj | Pierce | Slice |
|---|---|---|---|---|---|---|---|---|---|
| `wpn_knife` | Döner Knife / Döner Bıçağı | `melee_arc` | Nearest threat (auto-aim) | 14 (L1) → 30 (L5) | see config | 1.8 m, 100° (L1) → 2.3 m, 170° (L5) | 1 | all in arc | Yes (starting weapon, D-017/D-018) |
| `wpn_tea_glass` | Tea Glass / Çay Bardağı | `lob_aoe` | Densest cluster within 6 m | 18 | 2.0 | Lob 4 m, splash r 1.2 m | 1 | AoE | Yes |
| `wpn_simit` | Simit Ricochet / Simit | `ricochet` | Nearest | 10 | 1.5 | Bounce range 3 m | 1 | 3 bounces | Yes |
| `wpn_seagulls` | Seagulls / Martılar | `orbit_dive` | Nearest within 4 m | 8 | 1.2 per gull | Orbit r 2.2 m | 2 gulls | 1 | Yes |
| `wpn_doner_skewer` | Döner Skewer / Döner Şişi | `pierce_line` | Facing | 20 | 2.2 | Line 6 m × 0.5 m | 1 | all | Yes |
| `wpn_chestnut_mortar` | Chestnut Mortar / Kestane | `cluster_lob` | Random enemy on screen | 25 + 3 × 8 | 3.5 | r 1.0 m + 3 sub-pops r 0.5 m | 1 | AoE | Yes (unlock L6) |
| `wpn_tram_bell` | Tram Bell / Tramvay Zili | `pulse` | Self-centered | 10 | 3.0 | r 2.5 m, knockback 1.5 m | — | AoE | Yes (unlock L11) |
| `wpn_lahmacun` | Lahmacun Barrage / Lahmacun | `straight_multi` | Facing + nearest | 7 | 1.0 | 9 m, speed 12 m/s | 2 | 1 | Later |
| `wpn_pickle_juice` | Pickle Juice / Turşu Suyu | `zone` | Random near enemies | 5 / 0.5 s | 4.0 | r 1.4 m, 3 s, slow 25% | 1 zone | AoE | Later |

### Level-up effects (L2 → L5)
| ID | L2 | L3 | L4 | L5 |
|---|---|---|---|---|
| `wpn_knife` | Dmg up (see config) | Back-slash | Range up (see config) | 30 dmg, arc 170° |
| `wpn_tea_glass` | +1 projectile | +25% area | +1 projectile | +10 dmg, leaves 1 s scald zone (Burn) |
| `wpn_simit` | +1 bounce | +1 projectile | +1 bounce, +4 dmg | +1 projectile |
| `wpn_seagulls` | +1 gull | +3 dmg | +1 gull | Dives knock back; 5% chance a gull "steals a simit" (heal 2) |
| `wpn_doner_skewer` | +6 dmg | +50% width | −0.4 s CD | Fires front and back |
| `wpn_chestnut_mortar` | +1 projectile | +2 sub-pops | +8 dmg | +1 projectile, sub-pops apply Burn |
| `wpn_tram_bell` | +20% radius | +6 dmg | −0.6 s CD | Pulse applies 30% slow for 2 s |
| `wpn_lahmacun` | +1 projectile | +1 pierce | +1 projectile | +1 projectile, +3 dmg |
| `wpn_pickle_juice` | +1 zone | +25% area | +1.5 s duration | +1 zone, slow 40% |

---

## 3. Passives

> **v0.4 (D-017):** Tea Glass, Ayran, Butter and Sneakers are out of the slice kit. Teapot is not in the v0.4 kit either.
> Their rows are kept for later content. The v0.4 passives are in §10.2 and `weapons-skills.md` §6.

| ID | Name (EN / TR) | Per level | Max | Pairs with (evolution) | Slice |
|---|---|---|---|---|---|
| `pas_sneakers` | Sneakers / Spor Ayakkabı | +8% move speed | 5 | Pickle Juice | Yes |
| `pas_puffer_jacket` | Puffer Jacket / Şişme Mont | +1 armor | 5 | Tram Bell | Yes |
| `pas_ayran` | Ayran | +0.3 HP/s regen | 5 | Chestnut Mortar | Yes |
| `pas_turkish_coffee` | Turkish Coffee / Türk Kahvesi | −6% cooldowns | 5 | Lahmacun Barrage | Yes |
| `pas_butter` | Butter / Tereyağı | +10% might | 5 | Döner Skewer | Yes |
| `pas_teapot` | Teapot / Demlik | +8% area | 5 | Tea Glass | Yes |
| `pas_pul_biber` | Chili Flakes / Pul Biber | +4% crit chance | 5 | Seagulls | Later |
| `pas_sesame` | Sesame / Susam | +1 projectile | **2** | Simit | Later |

**Rule:** each passive pairs with exactly one weapon (1:1), so evolutions are easy to learn.

---

## 4. Evolutions

> **v0.4 (D-030):** The slice evolution set is in §10.3. The rows below pair retired items (Tea Glass, Ayran)
> and are later-content candidates. The old rule "each passive pairs with exactly one weapon" is replaced
> (proposed, `weapons-skills.md` §7): each weapon has one evolution, and a passive may feed more than one.

| ID | From (weapon L5 + passive) | Name (EN / TR) | Effect | Slice |
|---|---|---|---|---|
| `evo_semaver_storm` | Tea Glass + Teapot | Samovar Storm / Semaver Fırtınası | Lobs 4 glasses; each leaves a 3 s boiling zone (Burn, r 1.5 m) | Yes |
| `evo_iskender_lance` | Döner Skewer + Butter | İskender Lance / İskender Mızrağı | Line 10 m × 1.0 m, fires front+back+sides, leaves a 2 s butter-burn trail; ×1.5 dmg (multiplicative) | Yes |
| `evo_chestnut_volcano` | Chestnut Mortar + Ayran | Chestnut Volcano / Kestane Volkanı | A chestnut cart erupts at the player's position every 5 s: 8 lobs + healing steam (+5 HP per eruption) | Yes (v0.4). v0.5: brazier retired, no chainsaw evolution yet |
| `evo_tram_line` | Tram Bell + Puffer Jacket | Tram Line / Tramvay Hattı | Every 6 s a ghost tram charges across the screen through the player's lane: 120 dmg, knockback 3 m; pulse continues | Yes |
| `evo_golden_simit` | Simit + Sesame | Golden Simit / Altın Simit | Infinite bounces for 4 s; splits into 2 on every 3rd bounce | Later |
| `evo_gull_frenzy` | Seagulls + Pul Biber | Gull Frenzy / Martı Sürüsü | 8 gulls, dives always crit, steal-heal chance 15% | Later |
| `evo_oven_fire` | Lahmacun + Turkish Coffee | Oven Fire / Fırın Ateşi | Rapid-fire lahmacun stream, 6 per volley, applies Burn | Later |
| `evo_pickle_trail` | Pickle Juice + Sneakers | Pickle Trail / Turşu İzi | Zones spawn along the player's path every 0.5 s while moving | Later |

---

## 5. Enemies

Speeds: hero base is 3.2 m/s; **nothing basic outruns the base hero** (runners are close).
Budget cost = cost per spawn in the spawn director's budget (game-design.md §6).

| ID | Name | HP | Speed | Contact dmg | XP | Budget | Knockback resist | Behavior | First level |
|---|---|---|---|---|---|---|---|---|---|
| `enm_walker` | Walker / Yürüyen | 10 | 1.2 | 5 | 2 | 1.0 | 0% | Shambles toward the player | L1 |
| `enm_runner` | Runner / Koşucu | 6 | 2.9 | 4 | 3 | 1.5 | 0% | Sprints toward the player | L1 (seg C) |
| `enm_crawler` | Crawler / Sürünen | 14 | 1.0 | 6 | 4 | 1.5 | 50% | Emerges from manholes (1.0 s telegraph), low silhouette | L1 (scripted) |
| `enm_brute` | Brute / İriyarı | 80 | 0.9 | 15 | 10 | 8.0 | 80% | Slow tank, shoulder-charge 8 m every 6 s (0.8 s telegraph) | L4 |
| `enm_spitter` | Spitter / Tükürükçü | 15 | 1.1 | 4 | 4 | 3.0 | 0% | Keeps about 5.5 m; acid glob 4 dmg (r 1.0 m) leaves a 3 s puddle; fires every 3 s after a 0.7 s windup. **Deliberate exception** to the 0.8 s telegraph floor (config-enemies4.js), with zehirli | L6 |
| `enm_bloater` | Bloater / Dombili | 24 | 0.75 | 0 | 5 | 3.0 | 30% | Drifts in and swells (from 3.5 m); bursts on contact or death: 22 dmg to the hero (r 2.2 m), 30 to zombies; toxic cloud r 1.8 m for 3 s (4 dps on zombies, 2 dps on the hero). Mini bloaters come from the bloater boss. | L11 |
| `enm_tourist` | Tourist / Turist | 12 | 1.3 | 5 | 2 | 1.2 | 0% | Like a walker; 30% Jeton drop chance. (Selfie stick, no camera flashes: photosensitivity). **Not in code:** tourist is an outfit (skin) only in journey.js, with no enemy def | L11 |
| `enm_fisherman` | Fisherman / Balıkçı | 25 | 1.0 | 6 | 5 | 4.0 | 20% | Casts a line every 4 s, range 5 m (0.7 s line telegraph); pulls the player 1.5 m (Grabbed). **Not in code:** fisher is an outfit (skin) only; the line cast is a proposal (R1 audit §4A) | L21 |

**Elite variant (any type):** ×4 HP, ×1.5 damage, +15% scale, gold outline `#FFC93C` (config.js `eliteOutline`, `elite` token,
plus a crown-shaped marker for colorblind players), drops a Mini Chest. First elite: L7.

**Visual rules:** each type has a unique silhouette readable at 48 px (design-system.md §6).
Zombies wear everyday Istanbul clothes; desaturated palette; no gore close-ups.

---

## 6. Bosses and Mini-Bosses

> **Superseded (D-027):** The slice has 20 stage-5 bosses, one per hood. They are in `journey.md` §2 and §5, with
> canonical names in §9.8. The names The Vatman, Tour Guide, The Bride and Big Fisherman carry over, at the hood
> slots in `journey.md` §2 (not the levels below). The L5 Kestaneci mini-boss is replaced. Kaan's story fight moves
> to L20 if `journey.md` §9.1 is approved. The rows below are v0.2 data.

All telegraphs ≥ 0.8 s for bosses. Damage values are base (scaled by nothing else).

### L5 · Kestaneci (Chestnut Vendor), mini-boss · HP 600
- **Chestnut Spray:** cone of 5 lobbed chestnuts, ground telegraph 0.8 s, 8 dmg each, leaves small burning patches (2 s).
- **Cart Charge:** line telegraph 1.0 s, charges 7 m/s for 6 m, 20 dmg.
- **Counterplay:** dodge sideways; the cart can be baited into a gas canister.
- **Reward:** Boss Chest; unlocks **Chestnut Mortar** in the card pool from L6.

### L10 · The Vatman (Tram Driver), district boss · HP 2,500
- **Phase 1 (100–60%), the tram:** Vatman rides the derailed-then-restarted red tram on the rail lane.
  - *Tram Rush:* the rail lane glows red for 1.2 s, then the tram crosses at 14 m/s: 35 dmg to the player and **kills all zombies in its path** (lure them!).
  - *Bell Shockwave:* ring telegraph 0.8 s, r 3.5 m, 12 dmg.
  - *Passenger Spill:* the doors open and 12 walkers pour out.
- **Phase 2 (60–25%), on foot:** the tram derails; Vatman fights with the brake lever.
  - *Lever Slam:* circle r 1.8 m, 0.8 s telegraph, 25 dmg.
  - *Sparks:* 3 lines of electric sparks along the rails (0.9 s telegraph), 10 dmg.
- **Phase 3 (< 25%), enraged:** +25% speed; Bell Shockwave fires twice in a row.
- **Reward:** Boss Chest; unlocks **Tram Bell** from L11; motion-comic beat.

### L15 · Tour Guide (Turist Rehberi), mini-boss · HP 2,000
- Raises a flag that **buffs tourists within 4 m (+20% speed)**, so kill-priority matters.
- *Megaphone Blast:* cone 60°, 4 m, 0.8 s telegraph, 15 dmg, knockback 1.5 m.
- Summons 2 tourist groups (8 each) every 15 s.

### L20 · The Bride (Gelin), district boss · HP 4,500
- **Phase 1:** *Bouquet Throw:* marks one zombie, which becomes an Elite after 2 s (kill it fast).
  *Veil Spin:* r 2.5 m, 0.9 s telegraph, 18 dmg.
- **Phase 2 (< 50%), the halay:** a linked **halay dance line** of 10 zombies sweeps the arena
  in a wide arc (telegraphed path 1.2 s); touching the line = 15 dmg + knockback. Break the line by killing the leader (handkerchief).
- **Reward:** Boss Chest + motion-comic beat.

### L25 · Big Fisherman (Koca Balıkçı), mini-boss · HP 3,500
- Casts **3 lines at once** (fan, 0.8 s telegraph), pull 2 m.
- *Net Throw:* circle r 2.2 m, 1.0 s telegraph, roots 1.2 s.
- Calls fisherman adds (4) every 20 s.

### L30 · Kaan, story fight · Composure 5,000 (non-lethal)
- **Phases 1–2 (vs Kaan):** he thinks Arda is infected.
  - *Anchor Swing:* 270° arc r 2.5 m, 1.0 s telegraph, 20 dmg.
  - *Anchor Throw:* line 7 m, 0.9 s telegraph, 18 dmg, then he reels it back (second hit on the way back).
  - *Ground Slam:* r 3 m, 1.2 s telegraph, 25 dmg.
  - At 50% Composure: a horde wave arrives from both bridge ends and attacks **both** of you (foreshadows teaming up).
- **At 0 Composure:** short cutscene; they realize the truth; Kaan joins.
- **Phase 3 (survive 90 s together):** a huge horde from both ends of the bridge.
  **Tag-switch tutorial** here (1 prompt, icon + 4 words).
- **Reward:** Kaan unlocked; Boss Chest; motion-comic beat; end of the slice.

---

## 7. Levels 1–30

> **Superseded (D-027):** Districts 1–3 map to hoods H01–H06 (`journey.md` §2 and §8.2). District 1 (levels 1–10) is
> H01 İstiklal and H02 Galata. District 2 (11–20) is H03 Karaköy and H04 Galata Köprüsü. District 3 (21–30) is H05
> Eminönü and H06 Sirkeci. Level 1 stays in `level-001-istiklal.md`. The L30 Kaan and Ticket Man beats move per
> `journey.md` §9.1–9.2 (open). The level list below is v0.2 data.

Template: game-design.md §6. Durations are targets for an average player.

### District 1 · İstiklal Avenue (Levels 1–10)
| L | Type | Mods | Intro | Duration | Story hook |
|---|---|---|---|---|---|
| 1 | Route | — | Walker, Runner, Crawler (scripted) | 3.5 min | Cold open, call drops (see level-001) |
| 2 | Arena | — | Simit carts | 4 min | Arda tries the phone again: no signal |
| 3 | Route | — | Gas canister combos | 4 min | Bark: "Metro's closed. Of course it is." |
| 4 | Arena | — | **Brute** | 5 min | — |
| 5 | Mini-boss | — | **Kestaneci** | 5 min | Chestnut cart becomes a weapon idea |
| 6 | Route | — | **Spitter** | 5 min | — |
| 7 | Arena | — | First **Elite** | 6 min | — |
| 8 | Route | night | **Bloater** | 5 min | Streetlights fail one by one |
| 9 | Arena | horde | — | 6 min | — |
| 10 | Boss | — | **Vatman** | 7 min | Motion comic: tram crash, Arda heads downhill to Karaköy |

### District 2 · Karaköy & Galata (Levels 11–20)
| L | Type | Mods | Intro | Duration | Story hook |
|---|---|---|---|---|---|
| 11 | Route | — | **Tourist** | 5 min | Steep streets downhill from Tünel |
| 12 | Arena | — | **Paşa the cat** (early-warning hisses) | 5 min | Paşa adopts Arda |
| 13 | Route | — | Stairs as chokepoints | 5 min | Historic stairs down to Karaköy |
| 14 | Arena | — | — | 6 min | Galata Tower square |
| 15 | Mini-boss | — | **Tour Guide** | 6 min | — |
| 16 | Route | — | — | 6 min | Karaköy café streets |
| 17 | Arena | — | — | 6 min | Waterfront by the pier |
| 18 | Route | night | — | 6 min | — |
| 19 | Arena | horde | — | 7 min | — |
| 20 | Boss | — | **The Bride** | 8 min | Motion comic: the wedding café; Arda sees the bridge |

### District 3 · Galata Bridge (Levels 21–30)
| L | Type | Mods | Intro | Duration | Story hook |
|---|---|---|---|---|---|
| 21 | Route | — | **Fisherman** | 6 min | Upper deck, fishing lines everywhere |
| 22 | Arena | — | — | 6 min | Lower-deck restaurant row |
| 23 | Route | fog | — | 6 min | Fog rolls in off the Golden Horn |
| 24 | Arena | — | — | 7 min | Mid-bridge |
| 25 | Mini-boss | — | **Big Fisherman** | 7 min | — |
| 26 | Route | night | — | 7 min | Lower deck at night |
| 27 | Arena | ambush | — | 7 min | Glimpse of a huge figure with an anchor |
| 28 | Route | night, fog | — | 7 min | — |
| 29 | Arena | horde | — | 8 min | — |
| 30 | Boss | — | **Kaan** | 9 min | Motion comic: Kaan joins; Eminönü ahead |

---

## 8. Pickups

| ID | Name | Effect | Source |
|---|---|---|---|
| `pk_xp_s` / `_m` / `_l` | Adrenaline droplet (green / blue / purple) | XP 1× / 5× / 25× | Enemy deaths. **Auto-merge:** if > 150 droplets exist, the oldest merge into larger ones (readability + perf) |
| `pk_jeton` | Jeton | +1–5 Jeton (meta) | 5% of enemies (tourists 30%) |
| `pk_simit` | Simit | Heal 25 HP | Simit carts, 0.5% of enemies |
| `pk_magnet` | Magnet / Mıknatıs | Pulls all XP on the map | ~1 per 2 min (director-placed), 10% from elites |
| `pk_chest_mini` | Mini Chest (Kutu) | 1 upgrade | Elites |
| `pk_chest_boss` | Boss Chest | Evolution or 1–3 upgrades | Bosses / mini-bosses |

## 9. Interactables (environment)

| ID | Prop | HP | When destroyed | Notes |
|---|---|---|---|---|
| `int_simit_cart` | Simit cart (red glass box) | 30 | Drops 2 Simits | Common in District 1 |
| `int_chestnut_cart` | Chestnut cart | 30 | Burning zone r 1.5 m, 5 s, 6 dmg/s to **enemies only** | Seeds the Chestnut Mortar idea |
| `int_gas_canister` | Gas canister (tüp) | 10 | Explosion r 2.5 m: 60 dmg to enemies, **15 to the player** | Risk/reward |
| `int_tea_tray` | Café table with a tea tray | 15 | 6 tea glasses burst outward, 10 dmg each | Comic SFX "ŞANGIR!" |
| `int_cafe_chairs` | Café chairs | — | Knocked aside (cosmetic, physics-lite) | Pure juice |
| `int_shutter` | Shop shutter | — | Objective door (opens on script) | Route-level exits |
| `int_manhole` | Manhole | — | Crawler spawn point (1.0 s telegraph: lid rattles) | Telegraph = audio + visual |

---

## 10. v0.4 arsenal and skills (D-017, D-030, D-031)

> **Status: prototype values, source of truth `prototype/js/config-weapons.js` (in progress).** Level tables,
> feel targets and sound and animation specs are in [weapons-skills.md](weapons-skills.md). Display names are
> proposals until the owner picks them (weapons §12). Balance is decided by the bot, not by these numbers.

### 10.1 Six new weapons (the four v0.3 weapons are in §2)

| ID | Name (EN / TR) | Behavior | Role | Unlock | L1 key numbers | Notes |
|---|---|---|---|---|---|---|
| `wpn_sledge` | Sledgehammer / Tamirci Çekici (proposed) | `periodic_slam` at the best cluster | Crowd control | L1 | 30 dmg, r 1.5 m, stun 0.5 s; 2 slams from L4 | Code comments still say "Balyoz". Retire the word (AUDIT-3 A-3). |
| `wpn_molotov` | Molotov / Benzin Şişesi (proposed) | `arc_pool` (burning pool, Burn) | Area denial | L3 | 10 dmg, pool r 1.3 m, 3.5 s; 1 bottle | Keep the code ID. Display name is the owner's call (weapons §12.1). |
| `wpn_fireworks` | Fireworks / Havai Fişek | `homing_rockets` with a burst | Burst | L16 | 12 dmg, blast r 0.9 m, 1 rocket | Max 2 bursts per second (flash rule, `wow-catalog.md` §6). |
| `wpn_cable` | Live Cable / Canlı Kablo | `chain_lightning` | Chain | L21 | 11 dmg, 3 jumps, stun 0.25 s | Max 6 arcs per 0.5 s (flash rule). |
| `wpn_speargun` | Speargun / Zıpkın | `pierce_line`, pins the last target | Single target | L11 | 14 dmg, pierce 2, root 1.0 s | Harpoon in a line. |
| `wpn_extinguisher` | Fire Extinguisher / Yangın Söndürücü | `cone_push` (foam) | Crowd control | L6 | 4 dmg, range 2.4 m, arc 70°, slow 40% for 1.2 s, push 1.2 m | Foam cone. Slows and pushes. |

### 10.2 Two new passives

| ID | Name (EN / TR) | Effect (per level) | Unlock | Notes |
|---|---|---|---|---|
| `pas_nazar` | Nazar Charm / Nazar Boncuğu | Crit +4%. Dodge +3%, cap 20%. Eye flash on dodge | L1 | The eye flash counts toward the flash limit. |
| `pas_magnet` | Magnet / Mıknatıs | Pickup radius +0.6 m. Vacuum pulse (config: base 14, +1.5 per level, min 6) | L8 | Units per `config-weapons.js`. |

### 10.3 Five evolutions (approved, owner: "100%")

Rule: each weapon has one evolution. It needs the weapon at L5 and the passive owned (any level). It is awarded by a boss chest.

| ID | Name (EN / TR) | Weapon + passive | Effect (config) |
|---|---|---|---|
| `evo_cleaver` | Usta's Cleaver / Usta Satırı | Knife + Work Gloves | 360° cleave, r 2.4 m, 34 dmg, spin 1.0 s |
| `evo_nailstorm` | Nail Storm / Çivi Fırtınası | Nail Gun + Energy Drink | Fan of 9 nails over 80°, 9 dmg, pierce 2 |
| `evo_cluster` | Cluster Bomb / Küme Bomba | Gas Canister + Leather Jacket | 2 canisters. Each splits into 3 blasts (r 1.0 m, 14 dmg) |
| `evo_cyclone` | Chain Cyclone / Zincir Kasırgası | Bike Chain + Running Shoes | 4 blades, r 2.3 m. Pulls enemies within 3.2 m |
| `evo_finale` | Wedding Finale / Düğün Finali | Fireworks + Magnet | 9 rockets every 3.0 s over 8.8 × 12.4 m. 22 dmg, r 1.3 m |

### 10.4 Skills (D-031)

| ID | Name (EN / TR) | Input | Effect (config) | Notes |
|---|---|---|---|---|
| `skill_dash` | Dash / Kaçış | Swipe flick (40 px in 200 ms) or double-tap (280 ms). Space on desktop | 3.2 m in 0.16 s, i-frames 0.3 s, cooldown 3.5 s | A near miss ("KIL PAYI!") slows time to 0.25 for 0.25 s, once per dash. |
| `skill_ult` | Evil-Eye Burst / Nazar Patlaması | Ult button (auto-fires if the setting is on) | 2.0 s burst, 60 dmg ring, push 2.5 m. Weapons ×1.5 power, cooldowns ×0.6 | Charge: +0.004 per kill, +0.03 per elite (250 kills). |
| `skill_frenzy` | Frenzy / Çılgınlık ("ÇILGINLIK!") | Automatic | 6 s, weapon attack speed +40% | Trigger: 60 kills with gaps ≤ 1.5 s. 50 proposed (weapons §8.2). |

### 10.5 v0.5 improvised kit (workstream A; replaces the forced items)

Owner feedback: the tea tray, umbrella, backgammon pieces, chestnut brazier and simit tray felt forced. Full detail and the decisions list are in `weapons-skills.md` §5a. `wpn_olta` (fishing rod) is kept.

| ID | Name (EN / TR) | Behavior | Role | Unlock | L1 key numbers | Notes |
|---|---|---|---|---|---|---|
| `wpn_sawblade` | Saw Blade / Testere Diski | Out and back, sparks where caught | Area, sustain | L1 | 12 dmg, range 5.5 m out and back, 3 sparks | Signature: ring of 12 blades around Arda. |
| `wpn_torch` | Blowtorch / Pürmüz | Flame cone jet, then a scorch zone (Burn) | Area denial | L1 | 6 dmg, cone 2.5 m / 60°; scorch r 1.1 m, 2 s | Signature: inferno (wider cone, 4 ticks). |
| `wpn_manhole` | Manhole Cover / Rögar Kapağı | Ricochet disc | Ricochet | L2 | 9 dmg, 2 bounces | Mod B2 stuns each bounce 0.6 s. Simit drop removed. Signature: 5 covers at once. |
| `wpn_slingshot` | Slingshot / Sapan | Marble volley with ricochet | Ricochet, crit | L4 | 9 dmg, 2 marbles, 3 bounces (max 5) | Two marbles on one enemy in one volley: lucky shot, x2 damage. Signature: 4-marble volley. |
| `wpn_cardoor` | Car Door / Araba Kapısı | Shield that raises and reflects spit; shove | Defence | L9 | 8 dmg, radius 1.4 m, arc 110°, open 0.8 s | Presses in: stun and shove. Signature: full ring wall. |
| `wpn_chainsaw` | Chainsaw / Motorlu Testere | Melee rev in ticks, stalls if it hits nothing | Melee | L6 | 5 dmg per tick, arc 80°, rev 1.0 s, reach 2.2 m | Stall adds 0.8 s cooldown. Signature: rampage (360° spin). New mechanic (`weapons5.js`). |

## 11. Wave 1 enemy variety (R1, branch `r1/enemy-wave1`)

Numbers are copied from the config files: skins from `js/config-skins.js` (`P.CFG.skins`), the two new types from `js/config-enemies5.js` (`P.CFG.enemies` Defs and `P.CFG.enemies5` behaviour). The spawn schedule is `C.levels.schedule` in `js/config-levels.js`. Sim: `js/sim/skins.js`, `js/sim/skins-fisher.js`, `js/sim/enemies4*.js`. Status and deviations: [reviews/AUDIT-ENEMIES-2026-11-10.md](../reviews/AUDIT-ENEMIES-2026-11-10.md) "Wave 1".

### 11.1 Skin behaviours (existing outfits that now have a job)

A skin rolls its behaviour once, at spawn, with `chance` 0.2 per eligible spawn and at most `maxAlive` 2 live behaviour zombies per skin. Eligible from `minHood` (0-based hood index). Types: walker only.

| Skin | minHood | Behavior | Key numbers | Telegraph / counter |
|---|---|---|---|---|
| Fisher / Balıkçı (`fisher`) | 2 | Casts a hook line at the hero from 6 m with line of sight. On a hit the hero is dragged 2.5 m toward the fisher over 0.25 s, no damage. Cooldown 4.5 s, first cast after 2.0 s | Telegraph 0.6 s (lane, 0.3 m wide) | Dash, a wall, leaving the line or a boss/hack/cinematic cancels the pull |
| Musician / Müzisyen (`musician`) | 1 | While it lives, walkers within 6 m move 1.15x faster (one flat buff, no stacking) | Radius 6 m, speedMul 1.15 | Faint dotted ring (view only); no telegraph |
| Hamal / Hamal (`hamal`) | 4 | Walks at 0.8x. A hit from behind (hero in the rear half-plane of its heading) does 0.5x damage. On death leaves a breakable crate (`crates`, 25 hp) that blocks walking | rearMul 0.5, rearCos 0, crateT 8.0 s, crate 1.0 x 1.0 m | Crate is a level-style box; no telegraph |

### 11.2 New enemy types

| ID | Name (EN / TR) | HP | Speed | Contact dmg | XP | Budget | Knockback resist | Behavior | First level |
|---|---|---|---|---|---|---|---|---|---|
| `enm_marti` | Seagull thief / Martı | 5 | 3.6 | 0 | 3 | 1.5 | 20% | Flies over walls, hovers within 2 m of the hero. With a loose XP drop within 4.5 m: a dive shadow (0.5 s ring) on the drop, then a dive at 9 m/s takes it. Flees at 5 m/s with the XP. Killed while carrying: the XP drops again with 6 gold. Off-screen while carrying: the XP is lost, no kill credit | Stage 2, 8 waterfront hoods (`galata`, `bridge`, `eminonu`, `kumkapi`, `samatya`, `bakirkoysahil`, `atakoysahil`, `atakoy`) |
| `enm_cayci` | Tea carrier / Çaycı | 28 | 0.9 | 6 | 6 | 3.0 | 20% | Keeps 4.5 m (band 0.8 m) from the hero. Throws from 2.5 to 5 m every 4.0 s (first after 1.5 s), after a 0.7 s windup (ground ring on the hero's spot, the telegraph). Glob 0 damage, lands as a 1.0 m puddle for 6 s. In the puddle the hero moves at 0.75x, for 3 s after the last touch | Stage 2, 6 old-city hoods (`eminonu`, `sirkeci`, `beyazit`, `kapalicarsi`, `laleli`, `aksaray`) |

Both types are added to `newTypes` (route mix weight, growing by `newGrow` 0.1 per hood index).

### 11.3 Bark beats

`BK.fk.marti` and `BK.fk.cayci` (first-sighting barks, batch D, speaker Arda, `joke` 1). EN lines approved through the dialogue import keep sheet; TR lines are drafts for owner review.

