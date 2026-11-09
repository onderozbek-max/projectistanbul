# Project Istanbul: Weapons, Passives, Evolutions and Skills

> **Status:** v0.1 · 2026-11-08 · Owner: Onder · Decisions: **D-030** (arsenal, Adopted) and **D-031** (skills, Adopted)
> **Numbers source:** `prototype/js/config-weapons.js` (E1, in progress). Where this doc proposes a change,
> it says so. The code wins for numbers. This doc wins for intent.
> **Related:** [journey.md](journey.md) (unlocks by level) · [content-catalog.md](content-catalog.md) §10 (starting numbers) ·
> [wow-catalog.md](wow-catalog.md) (spikes and juice) · [design-system.md](design-system.md) §6–§7, §15 (feel and audio rules)

---

## 1. Rules for every weapon

1. **One verb per weapon.** Each weapon must change how the player moves, aims or waits. A stat bump is not enough.
2. **Four-beat animation.** Every weapon has anticipation, action, impact and follow-through (ms targets below).
   The sound and the hit land on the impact frame.
3. **Three-layer sound.** Transient (the first 20–40 ms), body (the main sound), tail (the decay or the echo).
   No white-noise bursts as the whole sound. Each cue is a short designed sound, not a filter sweep alone.
   The sound workstream (A) owns the cue sheet.
4. **Readable at phone scale.** Shape language from design-system §14: circles = area, lines = pierce, arcs = melee,
   rings = pulses, sparkles = rewards. Element colours: fire = orange, wet = cyan, foam = white-grey.
5. **Power on the player.** Every weapon has a moment that makes the player say "oh". Log it in
   [wow-catalog.md](wow-catalog.md).
6. **Guardrails.** No animal harm. No gore close-ups. No flashes faster than 3 per second. No real brands or
   transit livery. No political names. Names checked in §4 and §5.

### 1.1 Animation beat targets

| Beat | Heavy (slam, bell, evolution) | Medium (launchers, bottles) | Light (knife, chain, dart) |
|---|---|---|---|
| Anticipation | 300–500 ms | 120–180 ms | 60–100 ms |
| Action | 120–200 ms | 200–700 ms (flight) | 80–120 ms |
| Impact | hit-stop 40–60 ms, camera punch 3% over 0.12 s | none or 40 ms on crit | hit-stop 40 ms on heavy hits only |
| Follow-through | 150–800 ms | 300–800 ms | 100–200 ms |

---

## 2. Roles

| Role | What it does | Weapons (slice, v0.4) | Future |
|---|---|---|---|
| Single target | High damage on one enemy | Speargun (pin), Nail Gun | Olta |
| Crowd control | Stun, push, slow | Sledgehammer, Extinguisher, Fire Extinguisher foam | Tram Bell, Fırın Küreği |
| Area denial | Ground that stays dangerous | Molotov, Pürmüz (v0.5) | Balık Izgarası |
| Burst | Big damage in one moment | Fireworks, Canister | Kilim |
| Sustain | Damage over time or heal | Knife (cleaves), Chain (orbits) | Retired in v0.5: Simit Tepsisi, Çaycı Tepsisi |
| Chain | Hops between targets | Live Cable | — |
| Defence | Blocks or reflects | Araba Kapısı (v0.5) | Retired in v0.5: Şemsiye |
| Ricochet | Bounces off enemies | Rögar Kapağı, Sapan (v0.5) | — |
| Melee rev | Revs and sweeps in ticks | Motorlu Testere (v0.5) | — |

---

## 3. Existing four (v0.3 shipped, E1 numbers)

These are the Level 1 kit (D-017, adopted). Full numbers are in `config.js` and `config-weapons.js`.

| Weapon | Verb | Unique power | Level 1 → 5 (dmg, area) | Animation (v0.3 → v0.4 target) | Sound (v0.4 target) | Hit FX |
|---|---|---|---|---|---|---|
| **Döner Knife** (Döner Bıçağı), signature | Arc melee | Auto-aims the nearest threat. Back-slash at L3. | 14 → 30, arc 100° → 170°, range 1.8 → 2.3 m | v0.3 crescent smear. v0.4 adds 80 ms shoulder back, 40 ms hit-stop on heavy. | Air swish (HPF) + edge ping + thwack on cloth. No flesh sound. | Slash marks, tip glint |
| **Nail Gun** (Çivi Tabancası) | Auto-aim pierce | Nails pierce, 1 → 3 shots | 8 → 14, shots 1 → 3, pierce 1 → 3 | v0.3 hold, kick, tracer. v0.4 brass flick on the impact frame. | Piston pfft + tick + metal ping | Nail stuck in target |
| **Gas Canister** (Gaz Tüpü) | Lobbed burst | Lob to the densest cluster, fire at L5 | 24 → 34, blast 1.5 → 1.9 m, 1 → 3 canisters | v0.3 overhead throw and spin. v0.4 adds a 45 Hz body boom and debris rattle. | Whoosh → BUM (sub boom + rattle) | Fireball ring, scorch |
| **Bike Chain** (Bisiklet Zinciri) | Orbit | Whirls around the player. Hits on a timer per enemy. | 9 → 15, blades 1 → 3, radius 1.5 → 1.9 m | v0.3 real link chain, sparks. v0.4 adds chain rattle on each blade pass. | Chain clatter at 12 Hz tied to blade passes | Sparks |

---

## 4. Six new weapons (v0.4, E1, D-030)

Names: the code IDs stay as they are. Display names are shown here as proposals. Two need an owner decision.
Owner decision needed on **Molotov** and **Sledgehammer** names (see §12).

### 4.1 Sledgehammer · *Tamirci Çekici* (code `sledge`)

- **Role:** crowd control. Ground-slam shockwave on the densest cluster.
- **Power:** an overhead slam. A ring of force. Stun on the ring. Two slams at L4 and L5.
- **Levels (config):**

| | L1 | L2 | L3 | L4 | L5 |
|---|---|---|---|---|---|
| Damage | 30 | 40 | 48 | 56 | 72 |
| Ring radius (m) | 1.5 | 1.6 | 1.8 | 2.0 | 2.3 |
| Stun (s) | 0.5 | 0.6 | 0.7 | 0.8 | 1.0 |
| Knockback (m) | 1.2 | 1.4 | 1.6 | 1.8 | 2.2 |
| Slams | 1 | 1 | 1 | 2 | 2 |
| Cooldown × | 1.0 | 1.0 | 0.9 | 0.9 | 0.8 |

- **Animation:** anticipation 500 ms (hammer over the head, body leans back, white target ring on the ground).
  Action 120 ms (slam). Impact: ring 250 ms, paving tiles pop up, dust puffs, hit-stop 60 ms, camera punch.
  Follow-through 800 ms (dust drifts).
- **Guardrail:** the shockwave shows dust and pops paving. **No cracks, no splitting ground, no building
  collapse.** Earthquake imagery is banned (narrative.md). Keep the ring crisp, not a rumble.
- **Sound:** sub thump (50 → 38 Hz, 0.3 s), metal clang on the hammer head (1.4 kHz ring), gravel ticks.
- **Value:** the answer to brutes (80 HP, 80% knockback resist). Makes a crowd move.
- **Unlock:** L1 in config. The journey has no hood-level unlock for it (see journey §7 note 7.2).

### 4.2 Molotov · *Benzin Şişesi* (code `molotov`)

- **Role:** area denial and Burn.
- **Power:** a bottle arcs to the densest cluster and makes a fire pool. Pools burn in place.
- **Levels (config):**

| | L1 | L2 | L3 | L4 | L5 |
|---|---|---|---|---|---|
| Damage | 10 | 12 | 14 | 16 | 20 |
| Pool radius (m) | 1.3 | 1.4 | 1.6 | 1.8 | 2.1 |
| Pool life (s) | 3.5 | 4.0 | 4.5 | 5.0 | 6.0 |
| Bottles | 1 | 1 | 2 | 2 | 3 |
| Cooldown × | 1.0 | 1.0 | 1.0 | 0.9 | 0.9 |

- **Animation:** anticipation 150 ms (arm back). Action 700 ms (spinning bottle, a smoke wisp trail).
  Impact: glass pop, orange ring 200 ms, scorch. Pool: 4–6 flame tongues, each flicker 300 ms or slower.
  Follow-through: embers rise.
- **Sound:** whistle in flight (HPF noise, falling), glass tinkle + low whoosh on impact, crackle loop for the pool life.
- **Value:** kiting and zone control. Fire pools change where the horde goes.
- **Unlock:** L3 (config). Fire is not a flash. Pools do not dim the screen.
- **Naming:** the word "molotov" has a political meaning. Display name proposed: **Benzin Şişesi** (petrol bottle).
  The code ID stays `molotov`.

### 4.3 Fireworks · *Havai Fişek* (code `fireworks`)

- **Role:** burst, homing.
- **Power:** rockets home on the nearest enemies, then burst. L5 rockets rain as the Wedding Finale evolution.
- **Levels (config):**

| | L1 | L2 | L3 | L4 | L5 |
|---|---|---|---|---|---|
| Damage | 12 | 14 | 17 | 20 | 26 |
| Burst radius (m) | 0.9 | 1.0 | 1.1 | 1.2 | 1.4 |
| Rockets | 1 | 2 | 2 | 3 | 3 |
| Cooldown × | 1.0 | 1.0 | 1.0 | 1.0 | 0.85 |

- **Animation:** anticipation 120 ms (tube tip glows). Action: homing rocket with spark trail, turn 5 rad/s.
  Impact: soft coloured burst (radial glow, 400 ms, dots). Follow-through: sparks fall.
- **Flash safety:** bursts are coloured glows. **No full-screen white flash.** Max 2 bursts per second on screen.
- **Sound:** launch (sine sweep 500 → 1500 Hz, 0.35 s, with air), burst pop (noise 0.1 s + 110 Hz thump), crackle tail.
- **Value:** the homing burst. It is the wedding hype and the story link (the convoy at Karaköy).
- **Unlock:** L16 (config).

### 4.4 Live Cable · *Canlı Kablo* (code `cable`)

- **Role:** chain lightning.
- **Power:** a cable whip zaps the nearest enemy and jumps to the next one, up to 8 hops. The first enemy gets **wet**.
- **Levels (config):**

| | L1 | L2 | L3 | L4 | L5 |
|---|---|---|---|---|---|
| Damage per hop | 11 | 13 | 15 | 17 | 22 |
| Hops | 3 | 4 | 5 | 6 | 8 |
| Stun (s) | 0.25 | 0.25 | 0.3 | 0.3 | 0.35 |
| Cooldown × | 1.0 | 1.0 | 1.0 | 0.9 | 0.85 |

- **Hop range:** 3.2 m (config `jumpR`).
- **Animation:** anticipation 150 ms (cable tip lifts, sparks at the tip). Action: jagged cyan arc, 3 frames,
  120 ms. Impact: small spark ring, enemy hit flash 60 ms.
- **Flash safety:** max 6 arcs drawn per 0.5 s. Arcs fade. No full-screen flash. This is the highest-risk weapon for
  flash rate in a dense horde. Test with the flash checker before release.
- **Sound:** "zzt" (HPF noise 120 ms + 1.2 kHz square fizz with a falling pitch), +1 semitone per hop, a small "tik" on death.
- **Value:** lightning across the horde. Wet ground (Kazlıçeşme sprinklers) boosts it.
- **Unlock:** L21 (config).

### 4.5 Speargun · *Zıpkın* (code `speargun`)

- **Role:** single-target pierce and pin. Pulls the rest.
- **Power:** a harpoon flies in a line, pierces, and pins the last enemy for a set time. A pinned enemy cannot move but still attacks.
- **Levels (config):**

| | L1 | L2 | L3 | L4 | L5 |
|---|---|---|---|---|---|
| Damage | 14 | 18 | 22 | 28 | 36 |
| Pierce | 2 | 2 | 3 | 3 | 4 |
| Pin / root (s) | 1.0 | 1.2 | 1.4 | 1.6 | 2.0 |
| Cooldown × | 1.0 | 1.0 | 1.0 | 0.9 | 0.9 |

- **Range:** 7.5 m. Speed 24 m/s. Pinned enemies are pulled 0.9 m in and reel back at L4.
- **Animation:** anticipation 180 ms (rope taut). Action: harpoon line, 24 m/s. Impact: "thock", spark at the pin,
  rope from spear to target with a wobble. Follow-through: the rope drops after the pin ends.
- **Sound:** twang (string pluck 180 → 90 Hz + snap noise 50 ms), thunk (wood, 80 ms), reel (1.2 kHz ticks, 0.4 s).
- **Value:** the pin plus the sledge is a combo (see §9). A pinned zombie is an easy slam target.
- **Guardrail:** the speargun is a fishing tool used on zombies. No fish or animal is shown harmed.
- **Unlock:** L11 (config).

### 4.6 Fire Extinguisher · *Yangın Söndürücü* (code `extinguisher`)

- **Role:** crowd control. Foam slows and pushes.
- **Power:** a cone of white foam. Slows and pushes back. Foam puts out fire pools.
- **Levels (config):**

| | L1 | L2 | L3 | L4 | L5 |
|---|---|---|---|---|---|
| Damage per tick | 4 | 5 | 6 | 8 | 10 |
| Range (m) | 2.4 | 2.6 | 2.9 | 3.2 | 3.6 |
| Cone (deg) | 70 | 80 | 90 | 100 | 110 |
| Push (m) | 1.2 | 1.4 | 1.6 | 1.8 | 2.2 |
| Slow | 40% | 45% | 50% | 55% | 65% |
| Cooldown × | 1.0 | 1.0 | 1.0 | 0.9 | 0.9 |

- **Timing:** 3 ticks at 0.15 s, then a recharge. Foam stays for 1.2–2.2 s.
- **Animation:** anticipation 120 ms (handle squeeze, clack). Action: foam cone. Impact: foam blobs splash, slowed
  enemies tint grey-blue. Follow-through: foam pile fades. L4 foam sticks to walls for 3 s.
- **Sound:** pressure hiss (HPF noise, 3.2 k → 0.9 kHz sweep, 1.2 s), clack at the start, glug on the splat.
- **Value:** the panic button. It pushes a crowd off the player and puts out fire.
- **Unlock:** L6 (config).

### 4.7 Passives (new): Nazar Charm and Magnet

| Passive | Effect (config, E1) | Notes |
|---|---|---|
| **Nazar Charm** (Nazar Boncuğu) | +4% crit per level. +3% dodge per level, cap 20%. A dodge shows "NAZAR!" and an eye flash. | The eye flash counts toward the flash limit (≤ 3 per second). The eye is a folk amulet, not a religious symbol. |
| **Magnet** (Mıknatıs) | +0.6 m pickup radius per level. A vacuum pulse (base 14 m, +1.5 per level, min 6 m) pulls XP. | Pulls XP only. |

---

## 5. Future weapons (not in the slice, docs only)

The owner's list of about 12 local weapons. Three of them overlap items already in
[content-catalog.md](content-catalog.md) §2. Those are merged, not duplicated. The **döner knife** on the owner's
list is the starting knife (§3). It is replaced here by the **Fırın Küreği** (pide peel) so the list has 12 new items.
The owner can revert that.

| # | Weapon (TR / EN) | Role | Unique power | Anim (A · Ac · I · F) | Sound cue | Unlock (hood · stage) | Guardrail / note |
|---|---|---|---|---|---|---|---|
| 1 | ~~**Çaycı Tepsisi** / tea tray~~ | Retired in v0.5 (forced) | Replaced by Testere Diski (§5a #1). | — | — | — | — |
| 2 | ~~**Simit Tepsisi** / simit tray~~ | Retired in v0.5 (forced) | Replaced by Rögar Kapağı (§5a #2). Merged `wpn_simit` is retired too. | — | — | — | — |
| 3 | ~~**Cezve** / hot coffee pot~~ | Retired in v0.5 (forced) | Replaced by Pürmüz (§5a #3). | — | — | — | — |
| 4 | **Olta** / fishing rod | Pull (CC) | Hook flies 6 m, sticks, reels the target 2 m to Arda. Stagger 0.3 s. | cast · bend · set · reel | Line zzip + tak + ratchet | H11 · 2 | Hooks in zombies only. |
| 5 | **Vapur Halatı** / ferry rope | Heavy melee | Mooring rope with a bronze cleat. 270° swing. Every third swing wraps (stun 0.3 s). | wind-up · whirl · cleat hit | Rope whoosh + clunk | H18 · 1 | Not Kaan's anchor (a companion weapon). |
| 6 | ~~**Şemsiye** / umbrella~~ | Retired in v0.5 (forced) | Replaced by Araba Kapısı (§5a #4). | — | — | — | — |
| 7 | ~~**Tavla Taşları** / backgammon pieces~~ | Retired in v0.5 (forced) | Replaced by Sapan (§5a #5). | — | — | — | — |
| 8 | ~~**Kestane Mangalı** / chestnut brazier~~ | Retired in v0.5 (forced) | Replaced by Motorlu Testere (§5a #6). Merged `wpn_chestnut_mortar` is retired too. | — | — | — | — |
| 9 | **Kilim** / rolled carpet | Crush, knockback | Throws a rug 5 m. It rolls over the line (crush + stagger), then unrolls into 2 s of cover that blocks projectiles. | unroll · roll · unfurl | Fwump + carpet swish | H07 · boss chest | Carpet Golem drop. |
| 10 | **Balık Izgarası** / boat grill plate | Area, fire | Hot plate slams down. 3 s hot zone. Oil spray slows. Kaan's signature set piece. | lift · slam · sizzle | Tsssh + çıtır crackle | H05 · boss chest | Food, not harm. |
| 11 | **Tramvay Zili** / tram bell | Stun (sonic) | Rings the bell. Stun pulse 2.5 m, knockback 1.5 m. L5 pulses twice. Merges `wpn_tram_bell`. | swing · ring · rings out | Bell ding (sine 1320 Hz, 0.9 s + partials) | H01 boss chest | Generic bell. No livery. |
| 12 | **Fırın Küreği** / pide peel | Knockback | Long paddle scoops and sweeps a 2 m arc. Pushes 3 m in a line. L5 adds a flip (10 dmg). | scoop · sweep · toss | Wood shwoosh + thud | H10 · 1 | Bakery prop. |

**Merges with content-catalog:** `wpn_simit` and `wpn_chestnut_mortar` are retired in v0.5 (their slots are Rögar Kapağı and Motorlu Testere, §5a).
`wpn_tram_bell` = Tramvay Zili (#11). `wpn_tea_glass` is retired (D-017). Çaycı Tepsisi, which took its role, is retired in v0.5 too.
Also kept in content-catalog as "Later": Lahmacun Barrage (`wpn_lahmacun`), Pickle Juice (`wpn_pickle_juice`).
They are not in this list.

### 5a. v0.5 improvised kit (in the slice, workstream A)

Owner feedback (translated): the tea tray, umbrella, backgammon pieces, chestnut brazier and simit tray felt forced. Replace them with things that could really be used as weapons. Olta (#4 above) stays as it is.

| # | Weapon (TR / EN) | Role | Unique power | Anim · sound | Unlock (level) | Replaces |
|---|---|---|---|---|---|---|
| 1 | **Testere Diski** / Saw Blade (`sawblade`) | Out and back, area | Thrown 5.5–7 m, back to Arda. Sparks burst (3–5) where it is caught. Signature: a ring of 12 blades around Arda. | blade spin · sparks · swish, tink | L1 | Çaycı Tepsisi (#1) |
| 2 | **Rögar Kapağı** / Manhole Cover (`manhole`) | Ricochet | Thrown 4.5 m, bounces enemy to enemy (2–5 bounces). Mod B2 stuns each bounce 0.6 s. Signature: 5 covers at once. | disc spin · bounce ring · lob, click | L2 | Simit Tepsisi (#2) |
| 3 | **Pürmüz** / Blowtorch (`torch`) | Area denial | 2.5–3.4 m flame cone, ticks twice (four with the signature). The jet ends in a 1.1 m scorch that burns for 2 s. Signature: inferno (wider cone). | flame · scorch · burn, hiss | L1 | Cezve (#3) |
| 4 | **Araba Kapısı** / Car Door (`cardoor`) | Defence, shove | Door swings up toward the nearest threat (radius 1.4–1.8 m, arc 110–160°, open 0.8–1.1 s). Blocks and reflects spit back; enemies pressed in are stunned and shoved. Signature: a full ring wall. | door swing · spit flick · swish, doorSlam | L9 | Şemsiye (#6) |
| 5 | **Sapan** / Slingshot (`slingshot`) | Ricochet | 2–3 steel marbles per volley (seek 6 m), bounce 3 (max 5). Two marbles on one enemy in one volley is a lucky shot (x2 damage). Signature: 4-marble volley. | marble pull · tink, crit | L4 | Tavla Taşları (#7) |
| 6 | **Motorlu Testere** / Chainsaw (`chainsaw`) | Melee, rev | Revs 1.0–1.5 s, sweeps an 80–130° arc (reach 2.2 m) and bites in ticks. A rev that hits nothing stalls (+0.8 s cooldown). Signature: rampage, a full 360° spin. New mechanic (`weapons5.js`). | bar sweep · chain dashes · chain, cleaver, hiss | L6 | Kestane Mangalı (#8) |

Numbers live in `P.CFG.weapons.<id>` and `P.CFG.modDefs`. Each weapon has six mods and a signature (`P.CFG.sig`). Mastery applies to all six.

### Deviations and decisions (v0.5, workstream A)

- **Replaced:** tray, simit tray, cezve, umbrella, tavla and chestnut brazier. The six above are new. Olta is kept. Renames: `tray` to `sawblade`, `simittray` to `manhole`, `cezve` to `torch`, `semsiye` to `cardoor`, `tavla` to `slingshot`, `kestane` to `chainsaw`. Config, sim, strings, icons, signature table, unlock tables, tests, bot and docs use the new ids. Props and scenery keep their names (tavla table, kestane cart, tray hat).
- **Mod engine:** the hit-time heal is gone. The ADD key `stun` replaces it (manhole B2).
- **Manhole:** the simit-drop chance is removed (forced flavour). That changes the RNG draws in those runs.
- **Slingshot bounces:** fixed (3 plus mods, max 5) instead of a dice roll.
- **Signatures:** sawblade `bladeRing`, manhole `swarm`, torch `inferno`, cardoor `wall`, slingshot `volley`, chainsaw `rampage`.
- **Events (new):** sawThrow, sawReturn, sawCatch, sparkBurst, sawRev, sawGrind, sawStall, manholeThrow, manholeBounce, torchJet, scorchSizzle, doorRaise, doorShove, doorDrop, slingPull, marbleHit. Every fire also pushes `wfire`: `{ type: 'wfire', w, x, y, ang, lv, n }`. `w` is the family; `variant` is the owned id (evolutions). The chainsaw also sets `hero.revving` (seconds left) and `hero.revAng` while it revs.
- **Zone and state renames:** zone kind `scald` is now `scorch` (combat.js). Weapon state fields `trays`, `simits`, `boils`, `umbrellas`, `tavla`, `embers` are now `blades`, `manholes`, `torches`, `doors`, `marbles`, `landings`; the chainsaw uses `rev`.
- **Barks:** the umbrella spit line is now a car door. Each new weapon has two card barks (TR and EN).
- **Sound:** cues reuse names already in the sfx bank. No new audio.
- **Balance:** the numbers are prototype values, not balance-tested. The chainsaw and slingshot are the least tested.
- **Evolution:** the brazier was the base of `evo_chestnut_volcano`, which is not in the code. The chainsaw has no evolution yet.
- **Scope note:** `js/view/weapons-fx4.js` was rewritten for the replaced weapons (handlers and state names), beyond a rename. Flagged for the lead.

---

## 6. Passives: full list

### 6.1 In the slice

| Passive | Effect (v0.3 config) | Pairs with (evolution) |
|---|---|---|
| Running Shoes (Koşu Ayakkabısı) | +10% move speed. Speed trail when running. | Chain (Chain Cyclone) |
| Leather Jacket (Deri Ceket) | 1 flat armor per level (cap 3). +15 HP at L4. | Canister (Cluster Bomb) |
| Work Gloves (İş Eldiveni) | +12% might. +15% knockback. | Knife (Usta's Cleaver) |
| Energy Drink (Enerji İçeceği) | −8% cooldowns. | Nail Gun (Nail Storm) |
| First Aid Kit (İlk Yardım Çantası) | Heal 25 on pick. Regen 0.6 HP/s per level after 3 s without a hit. | Sledgehammer (Blacksmith's Blow), Extinguisher (Foam Storm) |
| Nazar Charm (Nazar Boncuğu) | +4% crit per level. +3% dodge per level (cap 20%). | Live Cable (Lightning Shield) |
| Magnet (Mıknatıs) | +0.6 m pickup radius per level. XP vacuum pulse. | Fireworks (Wedding Finale) |

### 6.2 Future passives (not in the slice)

| Passive | Idea | Notes |
|---|---|---|
| **Kolonya** (cologne) | Cleanses burn and slow every 15 s. +10% status resist per level. | Cologne. No flame joke. |
| **Simit Sepeti** (simit basket) | Each pickup heals 2 HP. | Heal economy. |
| **Vapur Bileti** (ferry ticket) | +8% XP per level. | Ferry in the story. |
| **Paşa's Hiss** (the cat warns) | A ring of hiss 2 s before a spawn in view. | Animal stays safe. Paşa is a companion. |
| **Kulaklık** (headphones) | Sound radar: enemies show in the dark within 4 m. | Built for Yenikapı (torch levels). |
| **Su Matarası** (water bottle) | Heal 1 HP per kill, max 5 per run. Water douses fire (steam with Molotov). | Pairs with Molotov (Steam Curtain). |

---

## 7. Evolutions

**Rule change (proposed):** the content-catalog rule "each passive pairs with exactly one weapon" cannot cover 22
weapons and 13 passives. New rule: **each weapon has one evolution. A passive can be used by more than one evolution.**
The evolution needs the weapon at L5 and the passive owned (any level). It is awarded by a boss chest (GD §5.5).

### 7.1 Approved set (E1, D-030, owner: "100%")

| Evolution (TR / EN) | Weapon + passive | Effect (E1 config) |
|---|---|---|
| **Usta Satırı** / Usta's Cleaver (`cleaver`) | Knife + Work Gloves | 360° spinning cleave, radius 2.4 m, 34 dmg, spin 1.0 s, hit gap 0.45 s. |
| **Çivi Fırtınası** / Nail Storm (`nailstorm`) | Nail Gun + Energy Drink | Fan of 9 nails over 80°, 9 dmg, pierce 2, cooldown 0.24 s. |
| **Küme Bomba** / Cluster Bomb (`cluster`) | Canister + Leather Jacket | Two canisters. Each lands and splits into 3 sub-blasts (r 1.0 m, 14 dmg) 0.3 s later. |
| **Zincir Kasırgası** / Chain Cyclone (`cyclone`) | Bike Chain + Running Shoes | 4 blades, radius 2.3 m, speed 7.0, pulls enemies in 1.8 m/s within 3.2 m. |
| **Düğün Finali** / Wedding Finale (`finale`) | Fireworks + Magnet | 9 rockets rain over an 8.8 × 12.4 m area every 3.0 s. 22 dmg, r 1.3 m. Story: the convoy's finale. |

### 7.2 Proposed set (not in E1 yet)

| Evolution (TR / EN) | Weapon + passive | Proposed effect | Needs |
|---|---|---|---|
| Demirci Vuruşu / Blacksmith's Blow | Sledgehammer + First Aid Kit | Each slam heals 1 HP per enemy hit (max 8 per slam). | slice |
| Şimşek Kalkanı / Lightning Shield | Live Cable + Nazar Charm | An arc orbits Arda and zaps adjacent enemies every 0.5 s. A dodge also fires a zap. | slice |
| Ateş Gölü / Fire Lake | Molotov + Energy Drink | Pools merge when they touch. A merged lake lasts 6 s and slows 40%. | slice |
| Zıpkın Ağı / Harpoon Net | Speargun + Work Gloves | Pinned enemies are roped together. 40% of damage to one hits the group. | slice |
| Köpük Fırtınası / Foam Storm | Extinguisher + First Aid Kit | Foam sticks to enemies. Foam blocks spit for 2 s. | slice |
| Buhar Perdesi / Steam Curtain | Molotov + Su Matarası | Each fire pool leaves steam that slows 40% and blocks spit. | later (needs future passive) |
| Kestane Volkanı / Chestnut Volcano (`evo_chestnut_volcano`, content-catalog §4) | Brazier + Ayran | Keep from content-catalog. Ayran is retired from the slice kit (D-017). Re-pair later. v0.5: the brazier is retired, so this evolution needs a new base. | later |

---

## 8. Skills: dash, ultimate, frenzy

Source: `config-weapons.js` (`C.skills`) and `sim/skills.js` (E1). The names below are the in-game names
(strings-weapons.js). Owner decision D-031: "player skill (dash/charged special): yes."

### 8.1 Feel targets

| Skill | Input | Effect | Numbers (E1) | Feel target |
|---|---|---|---|---|
| **Dash · Kaçış** (Dash) | Flick (40 px in 200 ms) on the joystick zone, or double-tap (40 px, 280 ms). Space on desktop. | Moves Arda 3.2 m in 0.16 s. | i-frames 0.3 s. Cooldown 3.5 s (Energy −8%). | Input to first movement ≤ 50 ms. Afterimage trail 4 frames at 40 ms apart, alpha 0.5 → 0. |
| **Close call · Kıl payı** (near miss) | Automatic | An enemy or telegraph passes within 0.2 m during i-frames. | "KIL PAYI!" and a slow-mo of 0.25 time-scale for 0.25 s. Once per dash. | Off under Reduce motion (show the text only). |
| **Ultimate · Nazar Patlaması** (Evil-Eye Burst) | Tap the ult button (bottom right). Auto-fire if the Auto-ult setting is on. | 2.0 s burst. 60 dmg in a screen-wide ring (push 2.5 m). Weapons power ×1.5 and cooldowns ×0.6 for 2 s. | Charge: +0.004 per kill (250 kills), +0.03 per elite. Slow-mo 0.25 at activation. | "NAZAR HAZIR!" when ready. Activation has a 0.2 s wind-up (proposal). Camera punch 3%. |
| **Frenzy · Çılgınlık** (ÇILGINLIK!) | Automatic | 6 s. Weapons attack speed +40%. | Trigger: 60 kills with kill gaps ≤ 1.5 s. | Golden edge glow at ≤ 1 Hz pulse. No flash. |
| **Nazar dodge** | Automatic (passive) | Dodges a hit. | +3% per level, cap 20%. "NAZAR!" text. | Eye flash counts toward the flash limit. |
| **Crit** | Automatic | Crit hit-stop. | 35 ms hit-stop, max 4 per second. | Reduce motion turns off hit-stop. |

### 8.2 Decisions in the skills (for the bot and the owner)

- **Ultimate charge:** 250 kills is about 1–2 charges per 500-kill run. GD §9.3 says 100 points. The code is
  right for the new 2–3 minute levels. Keep the code's value unless the bot shows the ult is too rare.
- **Frenzy threshold:** 60 kills (code) sits between the MÜTHİŞ banner (50) and the EFSANE banner (100).
  Proposal: move the frenzy trigger to 50 so the banner and the power-up are the same moment.
- **Dash damage:** the config does not give a damage value for enemies crossed. Proposal: 12 damage once per
  enemy. Owner call.
- **Ult activation wind-up (0.2 s):** proposal only. The config has none.

---

## 9. Synergy matrix and element interactions

### 9.1 Behaviour class × passive

`++` strong · `+` helps · `0` neutral

| Behaviour class (examples) | Shoes | Jacket | Gloves | Energy | Medkit | Nazar | Magnet |
|---|---|---|---|---|---|---|---|
| Arc melee (knife, cleaver) | + | + | ++ | + | + | + | 0 |
| Auto-aim pierce (nail gun, nail storm) | + | 0 | + | ++ | 0 | + | 0 |
| Lob AoE (canister, cluster, molotov) | 0 | + | + | ++ | 0 | + | 0 |
| Orbit (chain, cyclone) | ++ | 0 | + | + | + | 0 | + |
| Homing burst (fireworks, finale) | 0 | 0 | 0 | ++ | 0 | + | ++ |
| Chain zap (live cable) | 0 | 0 | 0 | + | 0 | ++ | 0 |
| Slam (sledgehammer) | 0 | + | ++ | + | ++ | 0 | 0 |
| Pin and line (speargun) | 0 | 0 | + | + | 0 | 0 | + |
| Cone push (extinguisher) | 0 | + | + | + | + | 0 | 0 |

### 9.2 Element and status interactions (proposed unless noted)

| Interaction | Result |
|---|---|
| Wet (Live Cable hit or sprinkler ground) + lightning | Lightning hops on wet enemies do more damage (proposal +15%). |
| Foam (Extinguisher) + fire pool (Molotov) | Foam puts out the pool. A counter, and a clear use for both weapons. |
| Pin (Speargun) + slam (Sledgehammer) | A pinned enemy takes +50% slam damage (proposal). |
| Canister blast + bloater | A canister blast can set off a bloater's chain burst. |
| Kilim or Fırın Küreği + traffic lane | Knocks enemies into a moving minibus (no harm to animals). |

---

## 10. Build archetypes

| Archetype | Core (weapons + passives) | Evolution | Play |
|---|---|---|---|
| **Kitchen brawler** | Knife + Gloves + Jacket | Usta's Cleaver | Stand inside the crowd and spin. |
| **Storm chaser** | Nail Gun + Energy + Shoes | Nail Storm | Keep moving, fire a wide fan. |
| **Fire bazaar** | Canister + Molotov + Extinguisher | Cluster Bomb or Fire Lake | Zone the map and push things into the fire. |
| **Live wire** | Live Cable + Nazar + Magnet | Lightning Shield | Crit and dodge, zap everything. |
| **Wedding band** | Fireworks + Magnet + Energy | Wedding Finale | Pull XP, rain rockets. |
| **Harbour hunter** | Speargun + Gloves + Shoes | Harpoon Net | Pin, pull, dash. |
| **Tank** | Sledgehammer + Medkit + Jacket | Blacksmith's Blow | Hold the middle, heal on slams. |
| **Tram lane** (future) | Tram Bell + Shoes + Medkit | (proposal) | Stun and kite. |

---

## 11. Juice budget per weapon

Every weapon has a juice tick (something satisfying) at most once a second. Heavy weapons add hit-stop; light ones do not.

| Weapon | Hit-stop | Camera shake (trauma) | Main sound | Visual tick |
|---|---|---|---|---|
| Knife | 40 ms heavy only | 0 | Swish + thwack | Slash marks |
| Nail Gun | 0 | 0 | Piston | Brass flick |
| Canister | 0 | 0.3 (explosion) | BUM | Ring + scorch |
| Chain | 0 | 0 | Clatter | Sparks |
| Sledgehammer | 60 ms | 0.25 | Clang + sub | Ring + dust |
| Molotov | 0 | 0.1 | Glass + whoosh | Fire ring |
| Fireworks | 0 | 0.05 | Pop | Coloured burst |
| Live Cable | 0 | 0 | Zzt | Spark ring |
| Speargun | 40 ms on pin | 0.05 | Twang | Rope wobble |
| Extinguisher | 0 | 0 | Hiss | Foam splat |

---

## 12. Open decisions

| # | Decision | Recommendation |
|---|---|---|
| 12.1 | **Molotov → Benzin Şişesi** (display name) | Yes. Keep the code ID. |
| 12.2 | **Sledgehammer → Tamirci Çekici** (display name) | Yes. The code comment in `weapons2.js` says "balyoz". Balyoz is also a known political trial name in Turkey. Change the comment and the string. |
| 12.3 | **Döner knife → Fırın Küreği** in the future list | Yes. The Döner Knife is the starting weapon. |
| 12.4 | **1:1 passive pairing → one evolution per weapon, passives may repeat** | Yes (7). |
| 12.5 | **Frenzy at 50 kills** (same as the MÜTHİŞ banner) | Yes (8.2). |
| 12.6 | **Ultimate charge** (250 kills, code) | Keep. Bot to confirm. |
| 12.7 | **Dash damage to enemies crossed (12)** | Owner call. |
| 12.8 | **Nazar eye flash** | Keep. Count it in the flash limit. |
