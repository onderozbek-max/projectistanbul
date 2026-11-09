# Project Istanbul: Wow Catalog

> **Status:** v0.1 · 2026-11-08 · Owner: Onder · Feeds: D-030 (arsenal), D-027 (journey), D-028 (story presentation)
> **Why this doc exists:** the owner's P0-4 said "we don't have too many wow factors". Survivor-likes win on
> juice density (something happens every second) and on spikes (a few big moments per run). This catalog is the
> list, the targets and the status. The audit ([AUDIT-3](../reviews/AUDIT-3-2026-11-08.md)) counts against it.
> **Related:** [weapons-skills.md](weapons-skills.md) · [journey.md](journey.md) · [story-presentation.md](story-presentation.md) ·
> [design-system.md](design-system.md) §6–§7, §14–§15

---

## 1. Targets

| Target | Number | Measured by |
|---|---|---|
| **Juice density** | Something satisfying happens at least once every 1 s during a fight. | Telemetry `juice_gap` (max gap between juice ticks) and playtest clips. |
| **Spikes per run** | 4–6 per run (route level of about 3–4 min). | Telemetry `wow_spike` counter per level. |
| **Spectacle per hood** | 1 or 2 per hood (stage 3 or 4, and boss). | Playtest notes. |
| **Surprise per hood** | 1 per hood (usually stage 2–4). | Playtest notes. |
| **Social per hood** | 1 per hood. | Share-card taps (telemetry). |
| **Catalog size** | 40+ entries. Current: 61. | This doc. |

### 1.1 Types

| Type | Meaning | Example |
|---|---|---|
| **Juice** | Small, frequent feedback. Feels good on every hit. | Knife smear, hit flash. |
| **Spike** | A big, rare beat that changes the fight for a few seconds. | Level-up shockwave, evolution. |
| **Spectacle** | A set piece in the world. Looks big. Changes nothing in the rules. | Fog on the bridge. |
| **Surprise** | Something the player did not expect. | Mannequin wake, diner turn. |
| **Social** | Something a player wants to show someone. | Kill cam, hood postcard. |

### 1.2 Status codes

- **v0.3 shipped:** in prototype v0.3 today.
- **v0.4 (letter):** building in v0.4. The letter is the workstream (A sound, B characters, C meta, E1 arsenal, E2 levels, F environment, G story).
- **proposed:** new idea, not yet assigned.

---

## 2. Catalog

### 2.1 Juice (J)

| ID | Moment | Type | Trigger | Frequency target | Status | Notes |
|---|---|---|---|---|---|---|
| W01 | Knife crescent smear with slash marks | Juice | Knife swing | Every swing (~1.3/s) | v0.3 shipped | Core read of the signature weapon. |
| W02 | Knife back-slash | Juice | Knife at L3+ | On L3+ swings | v0.3 shipped | A second arc behind Arda. |
| W03 | Nail tracer and impact ping | Juice | Nail shot and hit | Every shot | v0.3 shipped | |
| W04 | Brass flick on nail impact | Juice | Nail hit | Every hit | v0.4 (E1) | Sound and sparkle on the impact frame. |
| W05 | Canister arc, target ring, blast | Juice | Canister land | About 0.4/s in a fight | v0.3 shipped | |
| W06 | Chain whirl with sparks | Juice | Chain hit | Continuous | v0.3 shipped | |
| W07 | Chain rattle on each blade pass | Juice | Blade passes an enemy | 12 Hz while in contact | v0.4 (A) | Sound tied to the blade. |
| W08 | Hit flash, knockback, merged damage numbers | Juice | Every hit | Every hit | v0.3 shipped | Numbers merge within 0.2 s (DS §6). |
| W09 | Death collapse and fling | Juice | Death | Every kill | v0.3 shipped | Blast kills fling the body. |
| W10 | XP tink streak (pitch rises) | Juice | XP pickups | Every pickup | v0.3 shipped | Streak resets after 0.4 s. |
| W11 | Dash afterimage trail | Juice | Dash | Every dash | v0.4 (E1) | 4 frames, 40 ms apart. |
| W12 | Sledgehammer dust puffs and paving pops | Juice | Slam | Every slam | v0.4 (E1, F) | No cracks (guardrail). |
| W13 | Molotov flame tongues in the pool | Juice | Pool active | Continuous | v0.4 (E1) | Flicker under 3 Hz. |
| W14 | Live cable zzt arcs | Juice | Each hop | Up to 8 per cast | v0.4 (E1, A) | Max 6 arcs per 0.5 s. |
| W15 | Speargun rope wobble | Juice | Pin | Every pin | v0.4 (E1) | |
| W16 | Foam splat | Juice | Extinguisher tick | 3 per cast | v0.4 (E1) | |
| W17 | Hero run squash and step dust | Juice | Walk cycle | Continuous | v0.4 (B) | 8-frame walk (B). |
| W18 | Enemy squash on heavy hits | Juice | Heavy hit | Brutes, slams | v0.4 (B) | 60 ms squash. |
| W19 | Gulls shadow and cry | Juice | Gull in view | Ambient | v0.3 shipped | Gulls on İstiklal and bridge. |
| W20 | Pigeons scatter on approach | Juice | Arda within 3 m | Ambient | v0.3 shipped | Never harmed. |
| W21 | Cat hiss with "!" bubble | Juice | Cat trigger (warning) | Once per stage | v0.3 shipped | Early warning (the cat is Paşa). |

### 2.2 Spikes (S)

| ID | Moment | Type | Trigger | Frequency target | Status | Notes |
|---|---|---|---|---|---|---|
| W22 | Elite with crown, and the Mini Chest opening | Spike | Elite spawn, then death | 2 per run | v0.3 shipped | Chest flies in, shakes, rays. |
| W23 | Level-up shockwave | Spike | Level-up | About 9 per run | v0.3 shipped | Gold ring, pushes the horde back. |
| W24 | Combo banners: SÜPER, MÜTHİŞ, EFSANE, DURDURULAMAZ | Spike | Combo 25 / 50 / 100 / 200 | 1–3 per run | v0.3 shipped | Turkish first. Banner is text, not flash. |
| W25 | Crit-kill hit-stop | Spike | Crit kill | Up to 4 per second | v0.3 shipped | 35 ms (E1 config). Off under Reduce motion. |
| W26 | Frenzy: ÇILGINLIK! | Spike | 60 kills with gaps ≤ 1.5 s | 0–2 per run | v0.4 (E1) | Golden edge glow. Proposal: trigger at 50 (see weapons-skills §8.2). |
| W27 | Evil-Eye Burst (ultimate) | Spike | Ult tap, charge full | 1–2 per 500-kill run | v0.4 (E1) | Screen ring with 60 dmg. Camera punch. |
| W28 | Evolution cutscene | Spike | Boss chest opens with an evolution | 1 per 2 hoods | v0.4 (E1) | 1.6 s, skippable. |
| W29 | Wedding Finale rockets rain | Spike | Finale evolution fires | Every 3 s while owned | v0.4 (E1) | Colour, not white flash. |
| W30 | Double slam | Spike | Sledgehammer at L4+ | Every cooldown | v0.4 (E1) | Second slam 0.45 s later. |
| W31 | Boss intro with ferry horn | Spike | Stage 5 arena entry | 1 per hood | proposed (E2 banner exists) | Horn, banner, name. 1.6 s. |
| W32 | Tram Rush across the rail lane | Spike | Vatman phase 1 | Once per fight | proposed (E2 boss kit) | 1.2 s red lane telegraph, then a 14 m/s charge. |
| W33 | Halay dance line | Spike | The Bride below 50% | Once per fight | proposed | Linked line of 10. Kill the leader. |
| W34 | Pigeon flock covers the screen | Spike | Pigeon Man boss | Once per fight | proposed | Flock covers 4 s. Birds scatter, never harmed. |
| W35 | Dye drum chain explosion | Spike | Bloater bursts into drums | Once per stage 4 | proposed | Chain across the yard. |
| W36 | Tilting pier slides enemies into the sea | Spike | Pier tilt (every 6 s) | Every tilt | proposed | No animal harm. Zombies only. |
| W37 | Chain zap on wet enemies | Spike | Live cable hop onto a wet enemy | Often in Kazlıçeşme | proposed | Bright cyan outline, not flash. |

### 2.3 Spectacle (P)

| ID | Moment | Type | Trigger | Frequency target | Status | Notes |
|---|---|---|---|---|---|---|
| W38 | Overhead string lights shatter in a line | Spectacle | Sledgehammer ring or cable hit crosses a light string | 1 per hood (stage 3) | proposed (F) | Bulbs pop with a small click. |
| W39 | Seagull steals a simit | Spectacle | A gull dives at a simit cart | 1 per hood | proposed (F, E2) | The simit flies. The vendor shouts "Hey!" (no harm). |
| W40 | Tram bell stuns in a ring | Spectacle | Tramvay Zili fires | Per use | future (weapons-skills #11) | Concentric rings, no flash. |
| W41 | Fog rolls off the Golden Horn | Spectacle | Bridge stage 4 | 1 per hood (bridge) | proposed (F) | Fog is slow, not flashing. |
| W42 | Sunrise over the Marmara | Spectacle | Samatya stage 3 | 1 per hood | proposed (F) | Light shift over 60 s. |
| W43 | Streetlamps fail one by one | Spectacle | İstiklal stage 3 | 1 per hood | proposed (F) | Lamp goes dark and stays dark (no flicker). |
| W44 | Ice-cream bell as spawn warning | Spectacle | Bakırköy Sahil stage 3 | Before each spawn | proposed (A, F) | Audio cue with a visual ring. |
| W45 | Dolmuş horn and lane charge | Spectacle | Aksaray boss | Per charge | proposed (E2 boss kit) | Horn telegraph. |
| W46 | Balık-ekmek grill sizzle and flip | Spectacle | Captain boss arena | Per attack | proposed | Kaan's grill. No harm to animals. |
| W47 | Ferry horn on the quay | Spectacle | Eminönü stage 1 | Once per hood | proposed (A) | Sound-led. |
| W48 | Mannequins wake | Spectacle | Laleli stage 3 | Each mannequin once | proposed (E2, F) | Shape change, not a flash. |
| W49 | Turnstile gate slams shut | Spectacle | Sirkeci stage 3 | Each gate | proposed (F, E2) | Gate closes on a zombie. |

### 2.4 Surprise (U)

| ID | Moment | Type | Trigger | Frequency target | Status | Notes |
|---|---|---|---|---|---|---|
| W50 | Diner turns | Surprise | Diner stage | Hood 1 | v0.3 shipped | A human turns after 2.5 s. |
| W51 | Civilian grabbed at the door | Surprise | Arda at the grab point | Once per run | v0.3 shipped | |
| W52 | Neighbour's door opens | Surprise | Ataköy stage 4 | Per door | proposed (E2) | The door-spawn rule from L1 comes back at the end. |
| W53 | Radio "SON DAKİKA" breaks in | Surprise | Hood 3 stage 2 | Once per hood | proposed (G) | Narration over gameplay. Fictional station. |
| W54 | Dad's letter reveals more | Surprise | Ataköy | Once | proposed (G) | Letter in the lobby. |
| W55 | Ahmet Abi lifts the bread basket | Surprise | Ataköy boss | Once | proposed (E2) | Bittersweet beat. |
| W56 | Key ring jangles and a gate opens | Surprise | Yedikule key pickup | Per key | proposed (E2) | Gate opens with a clank. |
| W57 | Kapıcı booth light turns on | Surprise | Ataköy stage 1 | Once | proposed (F) | A small beat of life. |

### 2.5 Social (C)

| ID | Moment | Type | Trigger | Frequency target | Status | Notes |
|---|---|---|---|---|---|---|
| W58 | Boss kill cam (last 3 s) | Social | Boss death | 1 per hood | proposed | Replay is shareable. |
| W59 | Hood postcard (polaroid) | Social | Hood clear | 1 per hood | proposed (G, C) | Collectible. Shows the hood and a line of text. |
| W60 | Share card: "Ataköy: 17 km" | Social | Results screen | Per level | proposed (C) | Shows progress on the map. No ads on the card. |
| W61 | Paşa selfie pose | Social | Cat companion on the results screen | Cosmetic, later | proposed (SL) | Companion. Never harmed. |

---

## 3. A spike plan for one run

A typical route level (3–4 min) should have 4–6 spikes. Example:

| Time | Spike | ID |
|---|---|---|
| 0:10 | First level-up shockwave | W23 |
| 0:45 | Elite and Mini Chest | W22 |
| 1:20 | Combo 50 banner | W24 |
| 1:50 | Frenzy | W26 |
| 2:20 | Evil-Eye Burst ready | W27 |
| 2:50 | Boss intro (stage 5 only) or shutter opens (route) | W31 or O3 |

Between spikes, juice every second and one spectacle per hood.

---

## 4. Build order (by workstream)

| Workstream | Entries it owns (v0.4) |
|---|---|
| E1 arsenal | W04, W11, W13, W15, W16, W22–W30 |
| E2 levels and bosses | W31–W34, W39, W45, W48, W52, W55, W56 |
| F environment | W12 (art side), W19, W38, W41–W44, W49, W57 |
| G story | W53, W54, W59 |
| A sound | W07, W14, W44, W47 |
| B characters | W17, W18 |
| C meta | W60 (share card), W59 (postcard, art side) |

---

## 5. Accessibility

- **Reduce motion** (existing setting) turns off camera shake, hit-stop, slow-mo and camera punch. Banners, rings and colour stay.
  Near-miss and Evil-Eye slow-mo are off too. Keep the text.
- **Subtitles** stay on by default for story lines. Key sound cues (ferry horn, bell, boss roar) get a short text tag in the log (story-presentation §6).
- **Colour is never the only signal.** Elite: crown marker. Wet: dotted outline. Fire: shape and motion. Foam: texture.
- **Audio cues have a visual pair** (bell ring, horn, shutter). Visual cues have a sound pair. Colour-blind palettes (3 types, design-system §3.4) must not hide telegraphs.
- **Haptics** are optional (design-system §15). None are required for a wow to land.
- **Text size** scales the banners. Banner text must stay on screen at 150% (design-system §4).

---

## 6. Flash safety

| Rule | Limit | Applies to |
|---|---|---|
| Full-screen flashes | No more than 3 per second. Prefer 1 per 2 s. | Fireworks bursts, Evil-Eye Burst, lightning, explosions, Nazar eye flash, boss rage, level-up flash. |
| Flash area | A flash that covers more than a quarter of the screen counts as full-screen. | All |
| Red | No full-screen red flashing (design-system §5, low HP rule). | Low-HP vignette, boss rage |
| White | No full-screen white flash. Use colour rings and glows. | Fireworks, lightning, canister blast |
| Flicker | Lamps, fluorescents and fog move under 3 Hz. | Sirkeci, Yenikapı, İstiklal lamps |
| Arcs | Max 6 cable arcs per 0.5 s on screen. | Live Cable |
| Bursts | Max 2 fireworks bursts per second on screen. | Fireworks, finale |
| Hit flash | A single-sprite white flash (60 ms, design-system §7) is allowed. It is not full-screen. | Enemies |

**Test:** capture a frame sequence on device at 60 fps for each new weapon and each boss, and count the flashes
per second with a flash checker (add to M7 playtest). Record the result in the review packet.

**Store listing:** add the photosensitivity line when the game ships. Settings should include a "Flash-free" option
that turns off the highest-risk items above (fireworks bursts, lightning arcs, Evil-Eye pulse).

---

## 7. Measurement

New telemetry for the catalog (add to game-design.md §10 when built):

| Event | Fields | Used for |
|---|---|---|
| `wow_spike` | `id`, `t_s`, `level` | Spikes per run |
| `juice_gap` | `max_gap_ms`, `level` | Juice density |
| `skill_used` | `skill` (dash, ult, frenzy), `t_s` | Skill use |
| `story_bust_shown` | `id`, `read_s`, `skipped` | Bust readability |
| `flash_limit_hit` | `id`, `count_per_s` | Flash safety tuning |
