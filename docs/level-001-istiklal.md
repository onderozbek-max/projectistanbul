# Level 001: "İlk Lokma" (First Bite), İstiklal Avenue

> **Status:** v0.1 · 2026-11-08 · Owns: the full design of Level 1 (cold open, layout,
> pacing, spawns, tutorial, story beats, art, audio, telemetry, acceptance criteria).
> District context and levels 2–10: [content-catalog.md](content-catalog.md) §7.
> Systems: [game-design.md](game-design.md) · Look: [design-system.md](design-system.md).
> Numbers are starting values; tune with playtests and the bot simulator.

---

## 1. Purpose

Level 1 has four jobs, in this order:
1. **Hook in 90 seconds.** The cold open is the trailer, the tone and the first TikTok clip.
2. **Teach by doing:** move, auto-attack, collect XP, choose a card, use the environment, hold a zone.
3. **Make the player feel clever and powerful** by the end (6–8 level-ups, a gas-canister multi-kill).
4. **Plant the story:** the dropped call, the dead network, "Ataköy: 17 km".

The player **should not fail** Level 1 on a first attempt (target ≥ 95% clear, plus the
first-run Second Wind safety net from game-design.md §3).

## 2. At a Glance

| Field | Value |
|---|---|
| Type | Route (corridor + 1 hold zone) |
| Location | İstiklal Avenue, a mid-avenue block heading toward Tünel (downhill, south) |
| Time of day | Golden hour → blue hour across the level (~18:40 → 19:20 in-world) |
| Length | Corridor 14 m × 262 m, plus a restaurant room (10 × 8 m) |
| Duration | ~70 s cold open (first view) + **~3.5 min gameplay** |
| Enemies | Walker, Runner (from Segment C), Crawler (1, scripted) |
| Card pool | Döner Knife, Nail Gun, Gas Canister, Bike Chain; passives Running Shoes, Leather Jacket, Work Gloves, Energy Drink, First Aid Kit (D-017; game-design.md §5.4 superseded) |
| Expected kills / level-ups | ~160 / 7–8 |
| Win | Enter the shop through the opened shutter (exit trigger) |

## 3. World Look

### 3.1 The place
İstiklal is a long pedestrian avenue of **19th-century European-style facades**
(neoclassical and art nouveau, 4–6 floors) with shops on the ground floor, **wrought-iron
balconies**, string lights, narrow side passages, and the **red-and-cream nostalgic tram** on a
single track down the middle. The paving is grey stone with two steel rails.

In our 3/4 top-down view, the player sees the street floor plus the **lower two floors of
facades** along the left and right edges of the corridor (shopfronts, doorways, signs),
painted with slight perspective. Upper floors and sky appear only in cinematics.

### 3.2 Color script (lighting progression)
| Segment | Light | Mood |
|---|---|---|
| Restaurant | Warm interior tungsten, TV glow (blue) | Cozy → shock |
| A · Panic | Golden hour, long shadows, warm amber | Chaos in a beautiful place |
| B · Chestnut Corner | Late golden, chestnut cart embers glow | Agency, "I can fight" |
| C · Tram Track | Sunset; shop neon flickers on (pink, cyan, amber) | Tension rising |
| D · Hold | **Blue hour**; streetlights switch on one by one | Siege, peak intensity |
| Exit | Inside a shop, a single bulb | Silence, loss |

Floors stay mid-value (`stone_grey`) throughout so zombies, XP and telegraphs read clearly
(design-system.md §6).

### 3.3 Props and dressing (fictional names only)
- Shopfronts: "Lezzet Dürüm Salonu" (the restaurant), "Pera Kitap", "Çiçek Optik",
  "Beyoğlu Plak", a pastry shop, a phone repair stall. **No real brands.**
- Street furniture: chestnut/corn cart, red glass simit cart, a brass **shoe-shine box**,
  café tables with tea trays, street lamps, flower stand, balloon seller's cart, scaffolding on
  one building, manhole covers, shop shutters.
- Debris (storytelling): dropped shopping bags, a spilled shoe-shine kit, an abandoned
  bağlama, a stroller (empty, upright, no implication beyond panic), scattered simits.
- **Ambient vignettes (no gameplay):** balloons drifting up out of frame after the balloon
  seller flees; a cat on a windowsill, completely unbothered; a street musician's hat full
  of coins; a phone on the ground ringing with no one to answer.

### 3.4 Zombie look in this level
Everyday İstiklal crowd: office workers, students, shoppers, a waiter, a jogger (runner).
Desaturated (`zombie_base`), pale glowing eyes, torn but not gory clothing.

### 3.5 Avoid (guardrails)
No flags, political banners, real slogans, religious buildings in the playable area, or the
Taksim Square monument. No real brand logos or transit liveries; the tram is generic red-and-cream.
No camera flashes. No blood pools. Splats are red blood by default, or ink with the setting (D-024; design-system.md §2).

---

## 4. Cold Open (first view ~70 s; skippable on replay with a 0.6 s hold)

In-engine, letterboxed, with two interactive beats. TR is the primary VO; subtitles TR/EN.

| # | Time | Shot | Line / sound |
|---|---|---|---|
| S1 | 0–6 s | Black. Döner sizzle, street noise, a distant tram bell. | — |
| S2 | 6–14 s | Inside "Lezzet Dürüm Salonu". Arda (20, hoodie, earbuds) gets his dürüm at the window counter, takes an earbud out. | Usta: "Afiyet olsun, genç!" (Enjoy, young man!) |
| S3 | 14–22 s | Next table: two friends. One is pale, sweating, coughing; his dürüm is untouched. | Friend: "Abi, iyi misin? Yüzün bembeyaz." (Bro, you okay? You're white as a sheet.) |
| S4 | 22–30 s | The wall TV cuts to breaking news. The waiter turns the volume up. The room goes quiet. | News: "SON DAKİKA: Şehrin birçok noktasında açıklanamayan saldırılar... Vatandaşların evlerinde kalması isteniyor." (BREAKING: unexplained attacks across the city... Citizens are urged to stay home.) |
| S5 | 30–36 s | Slow-mo: the pale guy's dürüm falls to the floor. Arda's eyes follow it with real grief. | (Comedic beat, no line; a soft sad string note) |
| S6 | 36–42 s | The pale guy lunges and bites his friend's shoulder. Screams, chairs topple, people run. | Screams, crash |
| S7 | 42–52 s | Freeze → three comic panels: Arda's zombie-movie memory montage. | Arda (VO): "Kural bir: kafaya." (Rule one: the head.) · "Kural iki: asla ısırılma." (Rule two: never get bitten.) · "Kural üç... kural üç neydi?" (Rule three... what was rule three?) |
| S8 | 52–58 s | The zombie turns from his friend toward Arda. Close-up on the döner knife on the counter. **INTERACTIVE: TAP** (icon on the knife, waits indefinitely). Arda grabs it. | — |
| S9 | 58–64 s | Zombie lunges. **INTERACTIVE: SWIPE** toward the zombie (any direction accepted after 3 s of no input; we never fail here). Stab: 60 ms hit-stop, camera punch, comic "ŞAK!" lettering. Zombie drops. | SFX: "şak" |
| S10 | 64–70 s | Arda stares at the knife, then at the body. The bitten friend and another diner start twitching. Letterbox slides away: control handed over. | Arda: "...Pardon." (...Sorry.) |

## 5. Tutorial Flow (in order; one prompt at a time, ≤ 6 words + icon)

| Step ID | Where | Teaches | Prompt (TR / EN) | Completes when |
|---|---|---|---|---|
| `t_move` | Restaurant | Move | Ghost-thumb animation: "Sürükle ve yürü" / "Drag to move" | Player moves 2 m |
| `t_attack` | Restaurant | Auto-attack | None; the knife auto-swings at the first zombie in range. Bark: "Kendiliğinden mi sallıyorum?" (I'm swinging on autopilot?) [TR writer to confirm wording] | First kill by the player |
| `t_xp` | Restaurant → Segment A | Collect XP | Arrow to the first droplet outside pickup radius: "Topla" / "Collect" | First XP collected |
| `t_card` | Segment A (~15 s) | Level-up choice | Scripted cards `[Nail Gun*, Döner Knife L2, Running Shoes]`, Nail Gun highlighted (proposal; config `scriptedFirstCard` has no highlight flag): "Birini seç" / "Pick one" | Card chosen |
| `t_env` | Segment B | Interactables | When a cluster passes the gas canister: "Tüpe vur!" / "Hit the canister!" | Canister explodes (or the cluster passes) |
| `t_cat` | Segment C | Cat warning | No text. The cat hisses + a "!" above it; the manhole rattles (1.0 s telegraph) | Crawler emerges |
| `t_hold` | Segment D | Survive a hold zone | "Dayan!" / "Hold on!" + the shutter's diegetic progress | Shutter fully open |

Prompts are skipped automatically if the player already did the action. Steps log
`tutorial_step` telemetry (game-design.md §10).

---

## 6. Layout

Coordinates in meters. Corridor x ∈ [−7, +7]; the player moves **up the screen** (+y),
which is south toward Tünel in the world. Rails run at x = ±0.7 along the full length;
the tram lane is x ∈ [−1.3, +1.3].

```
 y=262  ================= (end of corridor, not reachable) =================
 y=230  [######## collapsed scaffolding: blocks the avenue ########]
        |                                                     [SHUTTER] | <- exit, right wall,
        |   SEGMENT D: HOLD ZONE (14 x 36 m)                  x=+7,y=226|    opens over 60 s
 y=194  |-------------------------------------------------------------- |
        |   SEGMENT C: TRAM TRACK                                       |
        |   [cat on sill x=-6.5,y=170]  (manhole x=-3,y=176)            |
        |            [ TRAM  x=0, y=146-158, 2.6 x 12 m ]               |
 y=124  |---------------------------------------------------------------|
        |   SEGMENT B: CHESTNUT CORNER                                  |
        |   (gas canister x=+4,y=100)   [chestnut cart x=-4,y=80]       |
        |   [simit cart x=+5,y=70]                                      |
 y=62   |---------------------------------------------------------------|
        |   SEGMENT A: PANIC  (fleeing crowd NPCs, first walkers)       |
        |   [civilian vignette: grabbed and turns at y=40]              |
 y=0    [=== restaurant door (x=-5) ===]
        RESTAURANT ROOM (separate 10 x 8 m interior; door leads to y=0)
```
- **Doorways/alleys (spawn markers, tag `door`):** every ~15 m on alternating walls.
- **Behind-spawns:** allowed only in Segments C and D, > 7 m behind the player, with a groan cue.
- **Camera:** clamps to x ∈ [−7, +7]; corridor walls are the facades.

## 7. Segment Beats and Spawns

Times are relative to segment entry. "Budget" uses enemy costs from content-catalog.md §5.

### Restaurant (~20–30 s)
- 2 zombies (bitten friend, diner) with **6 HP** (scripted easy versions), turning one at a time (second turns 4 s after the first).
- Tables and chairs are cosmetic physics-lite obstacles; one café tea tray (`int_tea_tray`) for a first "wow".
- Door to the avenue opens when both are down. Bark: "Tamam. Sakin. Kafaya vur. Filmlerdeki gibi." (Okay. Calm. Go for the head. Like the movies.)

### Segment A · Panic (y 0–62, ~45 s)
- 25–30 fleeing civilian NPCs (non-colliding silhouettes) run *past* the player toward Taksim (−y) in the first 10 s.
- Walkers: 2 at entry (ahead), then 1 every 2.0 s from `door` markers; ~16 total.
- Scripted vignette at y = 40: a fleeing civilian is grabbed by a walker and turns (becomes a walker).
- **Phone call starts** after the first card is chosen (see §9). Signal bars: 3.

### Segment B · Chestnut Corner (y 62–124, ~45 s)
- Walkers: budget 1.2/s, ~25 total.
- **Scripted cluster:** when the player reaches y = 90, 8 walkers shamble past the gas canister (spawn from the right `door` at y = 104). The `t_env` prompt fires.
- Chestnut cart at (−4, 80): breaking it creates a burning zone (enemies only). Bark on first sight: "Kestane... yanıyor. Bu bana bir fikir verdi." (Chestnuts... burning. That gives me an idea.) (Seeds the Chestnut Mortar.)
- Simit cart at (+5, 70): sparkles if player HP < 80%.

### Segment C · Tram Track (y 124–194, ~45 s)
- **Runners intro:** 2 runners at entry from ahead. Bark: "Bunlar KOŞUYOR mu?!" (These ones RUN?!)
- Mix: ~30 walkers + ~8 runners; budget 1.8/s; behind-spawns enabled.
- The stalled tram splits the avenue into two lanes (each ~5.7 m); its roof fades to 30% alpha when the player is beside it.
- **Cat beat:** at y = 165, the windowsill cat at (−6.5, 170) hisses; 1.0 s later the manhole at (−3, 176) rattles and a **crawler** emerges.
- Signal bars: 2 (call gets choppy).

### Segment D · Hold (y 194–230, 60 s)
- Entering y = 200: the scaffolding at y = 230 collapses (1.5 s beat, trauma 0.4). The avenue is blocked.
- The shopkeeper bangs on the shutter from inside: "Dayan evladım, açıyorum!" (Hold on, son, I'm opening it!). **The shutter rises slowly for 60 s; it IS the timer** (plus a thin ring timer for clarity).
- Camera zooms out to 13.5 m width.
- **Budget ramp:** 0–20 s: 1.5/s walkers · 20–40 s: 2.5/s (30% runners) · 40–55 s: 3.5/s peak (~45 on screen) · **spawning stops at 56 s** so the exit isn't a death trap.
- Gas canisters: 2 more at (−5, 210) and (+3, 218) for satisfying multi-kills.
- Music hits layer L3. Streetlights switch on one by one. Signal bars: 1 → 0 at the end.

### Exit (~10 s in-engine scene)
- Shutter fully open → glowing arrow → player enters → exit trigger.
- Inside the shop: the shopkeeper (an older man in a cardigan) pulls the shutter down behind Arda. Silence.
- Phone screen: **"Sinyal yok" / "No signal."** Arda: "Anne? ...Anne!"
- **Title slam:** game logo (title per product.md §1.1) + subtitle **"Ataköy: 17 km"**. → Results.
  If the title is *No Signal*, the phone's "No signal" text morphs straight into the logo.
  (No dizi triple zoom here; it's reserved for L10/L20/L30/L100, design-system.md §9.2.)

## 8. XP, Cards and Difficulty Tuning

- First level-up at **~10–15 s** of Segment A (restaurant XP 6 + 2 walkers = 10).
- Pacing target: a level-up every **20–30 s**; **7–8 level-ups** by the end.
- The scripted first card is the only scripted offer; afterwards normal weighting (game-design.md §5.3) over the L1 pool.
- Player damage taken in A–B should stay **< 30% HP** for an average player (bot `random_walk` should clear A–B > 99%).
- Segment D is the only real danger; bot `random_walk` clear rate target **≥ 90%**, `kite_circle` **100%**.

## 9. Story During Play: The Phone Call

A small **call widget** (top center): "Anne" + call timer + signal bars. VO with subtitles;
gameplay never pauses for it. Lines play at segment entries (after the first card is chosen).

| When | Line (TR) | EN |
|---|---|---|
| A | Arda: "Anne? Anne, duyuyor musun?" | Mom? Mom, can you hear me? |
| A | Anne: "Arda! Neredesin? Haberleri gördün mü?" | Arda! Where are you? Did you see the news? |
| A | Arda: "Gördüm... yani, yaşadım. Taksim'deyim. Eve geliyorum." | I saw it... well, I lived it. I'm in Taksim. I'm coming home. |
| B | Anne: "Metroya binme, her şey durmuş!" | Don't take the metro, everything's stopped! |
| B | Arda: "Taksi?" | Taxi? |
| B | Anne: "Trafik kilit, oğlum. Kimse kıpırdamıyor." | Traffic's gridlocked, son. Nobody's moving. |
| B | Arda (while fighting): "Yani... her zamanki gibi." | So... like always. |
| C | Anne (choppy): "Baban... diyor ki... [cızırtı] ...sakın..." | Your dad... says... [static] ...don't... |
| C | Arda: "Anne? Kesiliyorsun!" | Mom? You're breaking up! |
| D | Anne (1 bar): "...seni seviyoruz... eve gel..." | ...we love you... come home... |
| Exit | Phone: "Sinyal yok." Arda: "Anne? ...Anne!" | No signal. Mom? ...Mom! |

## 10. Audio

| Moment | Music layer | Key SFX |
|---|---|---|
| Restaurant | L0 (ambient, TV murmur) | Sizzle, TV jingle, the knife "şak" |
| A | L1 darbuka pulse | Crowd panic fading, distant car alarms, phone ringing on the ground |
| B | L2 bass + strings | Chestnut crackle, canister hiss → boom, comic "KÜT!" |
| C | L2 + tension riser | Tram creak, cat hiss, manhole rattle |
| D | L3 full | Shutter grinding up (rising pitch = progress), streetlight hum clicks |
| Exit | Music cut → silence → title stinger | Shutter slam, phone "no service" tone |

## 11. Camera

Follow with 1.5 m look-ahead; clamp to corridor walls; 13.5 m zoom-out in Segment D;
trauma-based shake caps (design-system.md §7); "Reduce motion" honored.

## 12. Telemetry and Funnel Targets

Events: `cinematic`, `tutorial_step`, `segment_reached` (`restaurant`, `seg_a`, `seg_b`,
`seg_c`, `seg_d`, `exit`), `level_up`, `card_chosen`, `death`, `level_end` (full schema:
game-design.md §10).

| Funnel step | Target |
|---|---|
| Cold open completed (first view, not skipped) | ≥ 80% |
| Reached Segment A | ≥ 98% |
| First card chosen within 20 s of Segment A | ≥ 90% |
| Reached Segment D | ≥ 97% |
| Level cleared (first attempt, incl. Second Wind) | ≥ 95% |
| Median gameplay duration | 3.0–4.0 min |
| Level-ups by the end (median) | 7–8 |

## 13. Acceptance Criteria

1. First launch → first player input ≤ 90 s, cold open included.
2. TAP and SWIPE beats wait indefinitely and can't be failed.
3. All tutorial steps fire in order, each skips if already done, and none overlaps another.
4. Spawn behavior comes **only** from `WaveScript` + level markers (no spawn code in the scene).
5. The shutter visually rises in sync with the 60 s hold timer; spawns stop at 56 s.
6. Phone call lines play at the right segments, subtitled, without pausing gameplay.
7. Bot simulator over 50 seeds: `random_walk` ≥ 90% clear, `kite_circle` 100%,
   median level-ups 7–8, first level-up ≤ 15 s into Segment A.
8. Performance: Segment D peak holds 30 fps on the Low reference device.
9. Readability screenshot at the Segment D peak passes design-system.md §6.
10. All strings via localization keys; TR and EN complete; `istanbul` → `İSTANBUL` casing correct.
11. No guardrail violations (§3.5).

## 14. Asset List for Level 1

| Category | Assets |
|---|---|
| Hero | Arda: full animation set (design-system.md §8), knife-grab and stab cinematic poses, phone-call idle |
| Enemies | Walker × 4 outfits (office, student, waiter, shopper), Runner (jogger), Crawler, scripted "pale guy" |
| NPCs | Fleeing crowd silhouettes × 8, usta (döner master), waiter, friend, shopkeeper, the cat |
| Environment | İstiklal paving + rails tileset; facade kit (6 building modules, 4 shopfronts, 2 passages); restaurant interior; collapsed scaffolding; shop interior (exit scene) |
| Props | Chestnut cart, simit cart, gas canister, café table + tea tray, chairs, shoe-shine box, balloon cart, street lamp, flower stand, manhole, shutter, generic red-and-cream tram, wall TV |
| VFX | Knife stab smear, tea glass shatter, canister explosion, chestnut embers/burn zone, blood or ink splats (D-024), ash dissolve, XP droplets, level-up burst, telegraph decal shader |
| UI | HUD (HP, XP, timer, signal bars, pause), call widget, level-up cards, tutorial prompts, results, title slam |
| Comic | 3 memory-montage panels (S7) |
| Audio | Music layers L0–L3, all SFX in §10, VO lines in §4 and §9 (TR), subtitles TR/EN |
