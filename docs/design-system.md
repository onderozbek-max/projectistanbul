# Project Istanbul: Design System

> **Status:** v0.1 · 2026-11-08 · Owns: art direction, tokens, typography, HUD/UI components,
> combat readability, game feel, animation, story presentation, localization and
> accessibility rules, asset pipeline.
> UI targets **WCAG 2.2 AA**-equivalent rules wherever they apply to a game UI.

---

## 1. Design Principles

1. **Readable before pretty.** In combat, readability beats detail every time. If a VFX makes
   danger harder to see, it gets cut or dimmed.
2. **Warm city, cold dead.** Istanbul is warm (amber, tram red, simit gold, neon). The dead
   are cold and desaturated. Players should feel the contrast without thinking.
3. **Comic-book soul.** Bold ink outlines on characters, comic SFX lettering ("ÇAT!",
   "ŞANGIR!"), motion-comic story. It's stylish and hides AI-art imperfections.
4. **Premium where the eye rests.** Heroes, bosses and UI get premium polish; crowds stay cheap.
5. **One thumb, any hand.** Essential actions reachable one-handed; HUD mirrors for left-handers.

## 2. Art Direction

| Topic | Decision |
|---|---|
| Dimension | **2D**, top-down **3/4 view** (we see the ground plus the lower floors of building facades on the corridor edges) (D-007) |
| Style | Hand-painted environments with soft texture; characters with **bold ink outlines** (3–4 px at reference) and 2–3 tone cel shading |
| Pipeline (D-057) | **Backgrounds: authored vector (SVG)**, hand-drawn with `night_ink` outlines, slight wobble, paint grain and cel shading (warm light side, cool shadow side), never generated. **Characters and busts: the procedural engine** (`ComicBusts`, `ComicCast`). Samples and the comparison are in `reviews/media/R1/style-samples/`; sources in `design/style-samples/`. |
| Proportions | Heroes ~ 1 : 4.5 head-to-body (stylized, expressive faces readable at small size); zombies ~ 1 : 5, slumped |
| Hero size on screen | ~ 1.0 m tall in-world ≈ 90 px at reference (+ ground ring) |
| Lighting | Painted time of day per level (golden hour → blue hour → night); dynamic 2D lights for night modifier only (Mid/High), baked fallback (Low) |
| Gore | **No gore close-ups.** Hits produce blood splats (red by default) or dark ink splats (setting, D-024) and comic impact stars; deaths dissolve into ash-grey wisps |
| Istanbul authenticity | Real landmarks shown respectfully; fictional shop names and brands only; no flags, political banners, or graffiti with real slogans; religious buildings appear only as background architecture and are never damaged |

## 3. Color Tokens

### 3.1 Brand / world palette
| Token | Hex | Use |
|---|---|---|
| `tram_red` | `#D7263D` | Hero accent, key UI accent, the tram |
| `simit_gold` | `#E9A23B` | Rewards, highlights, warm light |
| `tea_amber` | `#B5651D` | Warm midtones, UI wood/paper accents |
| `bosphorus_blue` | `#1B4965` | Night sky, secondary UI panels |
| `night_ink` | `#14151F` | Text on light, UI backgrounds, outlines |
| `paper` | `#F4EBDD` | Letters, comic panels, light UI surfaces |
| `stone_grey` | `#8A8F98` | İstiklal paving (mid-value floor, see §6) |

### 3.2 Gameplay semantic tokens (never reuse for decoration)
| Token | Hex | Meaning | Secondary cue (colorblind) |
|---|---|---|---|
| `player_ring` | `#3DDCFF` | Player ground ring + outline | Pulsing ring shape |
| `danger` | `#FF4D2E` | Enemy telegraphs | Hatched fill + filling-edge animation |
| `xp_small` | `#5BD16E` | Small XP | Droplet shape, small |
| `xp_medium` | `#3D8BFF` | Medium XP | Droplet, medium |
| `xp_large` | `#8E7CFF` | Large XP | Droplet, large + sparkle |
| `heal` | `#FFD166` | Healing feedback | "+" icon floaters |
| `elite` | `#E040FB` | Elite outline | Crown marker above the head |
| `zombie_base` | `#7D8B6A` | Zombie skin/clothes base (desaturated) | Silhouette |
| `boss_bar` | `#FF4D2E` → `#FFC93C` | Boss HP gradient | Phase notches |

### 3.3 Rarity tokens
| Rarity | Hex | Frame shape cue |
|---|---|---|
| Common | `#B0B0B0` | Plain frame |
| Uncommon | `#4CAF50` | 1 corner pip |
| Rare | `#3D8BFF` | 2 corner pips |
| Epic | `#A259FF` | 3 pips + inner glow |
| Legendary (later) | `#FFB300` | 4 pips + animated shine |

### 3.4 Colorblind palettes
Provide token overrides for **deuteranopia, protanopia, tritanopia**. Only gameplay semantic
tokens are swapped; brand art stays. Every semantic token already has a non-color cue (table above).

### 3.5 Contrast rules
- UI text ≥ **4.5:1** against its background; large text (≥ 44 px at reference) ≥ **3:1**.
- Non-text UI parts that carry meaning (bars, icons, focus rings) ≥ **3:1**.
- Damage numbers and floaters have a 3 px `night_ink` outline (readable on any background).

## 4. Typography

Sizes are given in **iOS points (pt)** and in px at the 1080 px reference (1 pt ≈ 2.77 px there).
*Revised 2026-11-08 after wireframing: the v0.1 sizes were below iOS readability at phone scale.*

| Role | Font (candidate) | Size (pt / ref px) | Notes |
|---|---|---|---|
| Display (titles, logo lockups) | Barlow Condensed ExtraBold | 40 / 111 | All-caps allowed, but follow Turkish casing (§10) |
| H1 | Barlow Condensed Bold | 26 / 72 | |
| Title | Barlow Condensed SemiBold | 20 / 55 | |
| Body | Inter Medium | 16 / 44 | Default UI text |
| Caption (minimum) | Inter Medium | 12 / 33 | **Never smaller than 12 pt** |
| Damage numbers | Barlow Condensed Black | 14 / 18 / 22 (normal / crit / boss crit) | Outlined |
| Comic lettering (bubbles, SFX) | TBD hand-lettered font | 15+ | Must pass the glyph test |

**Glyph test (mandatory for every font):** `ĞÜŞİÖÇ ğüşıöç İstanbul ılık şoför Çatal ŞANGIR`
(+ Greek `Αθήνα` later for the Athens spin-off). A font that fails is rejected.
Text size setting scales all text by 100 / 125 / 150%; layouts must not clip at 150%.

## 5. Layout, Spacing and HUD Zones

- **Reference canvas:** 1080 × 2340 portrait (= 390 × 844 pt, iPhone 14/15 class). Respect safe
  areas (Dynamic Island ≈ 59 pt top, home indicator ≈ 34 pt bottom).
- **Wireframes:** `design/lofi/` shows every key screen at 390 × 844 pt with annotations.
- **Spacing grid:** 8 px. Common steps: 8 / 16 / 24 / 32 / 48 / 64.
- **Touch targets:** ≥ 48 dp (≈ 132 px at reference), ≥ 16 px gap between targets.
- **Corner radius:** 16 px panels, 999 px pills, 24 px cards.

### In-run HUD zones
```
+--------------------------------------+
| [HP bar]   [XP bar full width]  [||] |  top: HP, XP, run level, timer, pause
| [timer]  [signal bars]  [boss bar]   |  (signal bars = story UI in Chapter 1)
|                                      |
|              PLAYFIELD               |  nothing permanent in the middle 60%
|                                      |
|                                      |
| [Kaan]                               |  bottom-left: squad portraits (tag)
| [Arda]                        (ULT)  |  bottom-right: ultimate
|   <-- floating joystick area -->     |  lower 60% of the screen
+--------------------------------------+
```
- Left-handed mode mirrors the bottom row.
- Prompts appear **above the player**, never under the thumb.

## 6. Combat Readability Rules (non-negotiable)

1. **Visual hierarchy:** player > enemy telegraphs > enemies > pickups > player projectiles > environment.
2. **The player is always findable:** `player_ring` ground ring + outline; drawn above enemies.
3. **Telegraphs:** every enemy attack that deals ≥ 10% of player max HP is telegraphed
   ≥ **0.5 s** (normal enemies) / ≥ **0.8 s** (bosses) with a `danger` ground decal whose
   edge fills toward the moment of impact. Shape = hit area, exactly.
4. **Floor value:** environment floors sit at mid value (`stone_grey` range) so dark zombies,
   bright XP and red telegraphs all pop.
5. **No occlusion:** no prop taller than the hero inside the walkable area; overhangs (awnings,
   tram roof) fade to 30% alpha when the player or a telegraph is under them.
6. **Projectile density control:** when > 120 player projectiles/effects are on screen, player
   VFX alpha drops to 60% and secondary particles are culled. Enemies and telegraphs are never dimmed.
7. **Silhouettes:** every enemy type is identifiable as a solid black silhouette at 48 px.
8. **Damage numbers:** max 40 on screen; merge hits on the same target within 0.2 s;
   setting to turn them off.

## 7. Game Feel ("Juice") Spec

| Feedback | Spec | Applies to |
|---|---|---|
| Hit flash | Enemy sprite flashes white for **60 ms** (shader) | Every hit |
| Knockback | Per weapon/enemy data; 0.15 s ease-out | Every knockback hit |
| Hit-stop | **40 ms** freeze for heavy hits, **60 ms** for boss hits and crit kills; **never** for regular swarm hits; max one hit-stop per 0.25 s | Heavy/boss/crit |
| Screen shake | Trauma model (trauma 0–1, shake = trauma², decay 1.5/s); max offset 12 px, max rotation 1°; explosions add 0.3, player hit 0.2, boss slam 0.5 | Big events only |
| Camera punch | 3% zoom-in pulse over 0.12 s | Ultimates, evolutions, first knife stab |
| Damage numbers | Pop up 0.6 m, scale 1.2 → 1.0, fade at 0.7 s; crit = bigger + `simit_gold` | Hits |
| Death | 6–8 frame collapse → ash wisp dissolve 0.3 s; XP pops out in a small arc | Enemies |
| Pickup | XP droplets arc toward the player (0.25 s ease-in) inside `pickup_radius`; soft rising "tink" pitch while collecting in quick succession | XP |
| Level-up | 0.3 s slow-mo ramp to pause, radial burst, card UI slides up with a stagger | Level-ups |
| Low HP | Vignette pulse at < 30% HP + heartbeat SFX; **no** full-screen red flashing | Player |
| Reduce motion | Disables shake, hit-stop, slow-mo and camera punch; keeps flashes ≤ 3/s | Setting |

## 8. Animation Spec

### Heroes (premium budget)
- **Rig:** 2D skeletal (Spine or Godot Skeleton2D) + frame-by-frame overlays for smears and impacts.
- **Views:** front, back, side (side mirrored) = 3 authored views; 8-direction movement uses
  the nearest view with lean.
- **Required set per hero:** idle (with a personality fidget every 6–10 s), run, hit-react
  light/heavy, signature attack(s), tag-in, ultimate, victory, down/revive, 2 emotes
  (for motion comics and results).
- **Principles:** clear anticipation on big attacks, smear frames on fast swings,
  squash & stretch on landings; secondary motion on hair/hoodie strings/scarves.

### Enemies (cheap by design)
- Sprite flipbooks rendered through MultiMesh (architecture.md §4.2): walk 6–8 frames,
  attack 4, death 6–8. 4 directions max (left/right mirrored).
- Variety via **palette swaps + 2–3 accessory layers** (hats, bags, scarves), not new animations.

### Bosses
- Skeletal like heroes; each attack has a distinct anticipation pose readable without the telegraph.

## 9. Story Presentation

### 9.1 Motion comics (slice format: comic pages, D-028)

> The slice uses comic pages (3–5 panels over 2 screens, tap to advance; `story-presentation.md` §3). The panel rules
> below still apply. Pan and zoom per panel is optional.
- **Panels:** 1–4 per screen in portrait; panel borders 6 px `night_ink` on `paper`.
- **Camera:** pan/zoom per panel (Ken Burns) with 3–5 parallax layers.
- **Speech bubbles:** comic font, max 90 characters per bubble, tail points at the speaker.
- **SFX lettering:** big, angled, colored ("ÇAT!", "KÜT!", "ŞANGIR!", "VIIIN!").
- **Voice:** Turkish VO with subtitles (TR/EN); tap to advance; auto-advance setting;
  hold to skip (0.6 s) after the first view.
- **Length:** ≤ 45 s per scene in the slice.

### 9.2 The dizi cliffhanger (signature device)
Freeze frame → **three rapid zooms** onto 2–3 faces (0.35 s each, ease-out, slight vignette
increase) → strings stinger → cut to black → title card. Use it **only** at chapter-ending beats
and select hood ends (H01 at L5, H04 at L20, H06 at L30, and L100; `journey.md` §8.1) so it stays special.

### 9.3 Barks (in-run lines)
- Text bubble above the speaker + optional VO, max 40 characters, 2.5 s on screen.
- Global bark cooldown 20 s in this doc. The v0.3 prototype uses 14 s, and the story proposal is 12 s with a per-speaker
  cap (`story-presentation.md` §6, open). Never during level-up UI or boss telegraph peaks.

### 9.4 Dad's letters
- Full-screen paper texture, handwritten-style font (glyph test applies), slow reveal while VO
  reads; items in the package drop onto the screen at the end.

## 10. Localization Rules

- **No text baked into images** (except the logo). All strings via keys (`ui.results.title`).
- **Turkish casing:** uppercase of `i` is `İ`, lowercase of `I` is `ı`. Always use
  locale-aware casing; **never** call a locale-blind `to_upper()` on Turkish strings.
  Test string: `istanbul` → `İSTANBUL` (not `ISTANBUL`).
- **Expansion:** layouts tolerate +35% text length (German) without clipping.
- **Numbers and plurals:** locale-aware formatting; plural rules via the localization system.
- **Future RTL (Arabic):** don't hardcode left-to-right assumptions in HUD code (YAGNI on the
  feature, not on avoiding the trap).
- **Voice:** TR is the primary VO; EN subtitles at launch.

## 11. Accessibility Checklist (slice)

- [ ] Subtitles **on by default**, with speaker names; background option for contrast.
- [ ] Text size 100 / 125 / 150%; no clipping at 150%.
- [ ] Colorblind palettes (3) + non-color cues for every semantic token (§3).
- [ ] Reduce motion (§7).
- [ ] **No flashing more than 3 times per second** anywhere (WCAG 2.3.1); no camera flashes from tourists.
- [ ] Haptics toggle; haptics never carry information alone.
- [ ] Left-handed HUD mirror.
- [ ] Auto-ultimate and (when the squad exists) auto tag-switch.
- [ ] Pause anywhere, including cinematics and boss fights.
- [ ] Touch targets ≥ 48 dp; joystick size setting (S/M/L).
- [ ] Contrast rules met (§3.5).
- [ ] No time limits on tutorial prompts or menus.
- [ ] Menus use the engine's screen-reader support where available; at minimum large text + high contrast.

## 12. Asset Pipeline (AI-assisted)

1. **Style bible first:** 6–10 approved style frames (hero, zombie, environment, UI, comic panel)
   are the reference for everything else.
2. **Custom style model:** train on the approved frames (e.g., Scenario). Every generated asset
   goes through the same model and prompt template.
3. **Character sheets:** each hero/boss gets a turnaround (front/side/back) + expression sheet
   before rigging.
4. **Cleanup:** human/AI-assisted cleanup in Aseprite/Krita: consistent outline weight,
   palette snap to tokens, transparent edges.
5. **Review gate:** new assets are compared side by side with the style frames; reject on
   outline weight, palette drift, perspective mismatch.
6. **Provenance log:** `art/PROVENANCE.csv`: asset, tool, model/version, prompt ID, date,
   license notes, human edits. Required for store/legal questions.
   Hand-authored assets (the vector backgrounds of D-057) need no entry; the file is created
   when the first generated or third-party asset arrives.
7. **Naming:** `<category>_<subject>_<variant>_<state>.<ext>`, e.g.
   `enm_walker_tourist_walk.png`, `ui_card_frame_rare.png`, `vfx_tea_glass_shatter.png`.
8. **Atlases:** enemies and VFX packed into texture atlases per district; separate HD variants
   for Mid/High delivered on demand (product.md D-003).

## 13. UI Components

| Component | Key specs |
|---|---|
| **Button** | Primary (`tram_red` fill, `paper` text), Secondary (`paper` fill, `night_ink` text), Ghost (outline). States: default / pressed (scale 0.96, darker 8%) / disabled (40% opacity + no shadow) / focused (3 px `player_ring` outline) |
| **Level-up card** | 3 cards side by side (stacked vertically if text size 150%). Icon 160 px, name (Title), level pips (5), description ≤ 2 lines, badge `NEW` or `EVO ready`. Tap = select (no confirm), 0.25 s select animation |
| **HP bar** | Top-left, 360 × 28 px, segment ticks every 25 HP, recent damage shown as a trailing lighter chunk (0.4 s) |
| **XP bar** | Full width under the top bar, 16 px, run level number at the right end |
| **Boss bar** | Top center under the XP bar, name plate + phase notches |
| **Squad portrait** | 132 px circle, HP ring, cooldown sweep, ultimate glow |
| **Joystick** | Base 1.1 cm radius, knob 0.45 cm; 30% opacity when idle, 70% when active |
| **Results screen** | Stars (animated in sequence), rewards count-up, cause of death + tip on loss, buttons: Retry / Map / Double reward (ad stub) |
| **World map** | Stylized illustrated map of Istanbul; route line Taksim → Ataköy; level nodes (locked / available / 1–3 stars / boss icon); "X.X / 17 km" progress; current position = Arda token |
| **Gear tile** | Rarity frame (§3.3), item icon, level badge, merge-ready glow |
| **Currency chip** | Icon + amount; tap → source tooltip |
| **Toast** | Top center, max 1 at a time, 2.5 s |
| **Modal** | Dimmed backdrop 60%, panel max width 920 px, close button top-right (≥ 48 dp) |
| **Dialogue bubble / letter** | See §9 |

## 14. VFX Language and Tier Budgets

**Shape language:** circles = area, lines = pierce, arcs = melee, rings = pulses, rising
sparkles = rewards. **Element colors:** tea = amber, chestnut/burn = orange-red embers,
pickle = acid yellow-green, tram/electric = cyan-white sparks, seagulls = white feathers,
butter = golden glow.

| Budget (per frame, on screen) | Low | Mid | High |
|---|---|---|---|
| Particles | 300 | 800 | 2,000 |
| Dynamic 2D lights | 0 (baked) | 4 | 12 |
| Post-processing | none | bloom (cheap) | bloom + color grading + chromatic punch on ultimates |
| Decals (blood splats by default, ink with the setting; D-024) persistence | 3 s | 8 s | 15 s |
| Texture set | base | base | HD (on-demand download) |

Gameplay elements (telegraphs, hitboxes, enemy counts) are **identical on all tiers** (D-003).

## 15. Audio and Haptics

- **Music:** adaptive layers per level: L0 ambient city → L1 darbuka pulse → L2 bass + strings
  → L3 full (hold zones, bosses). Crossfades on intensity changes (2 s).
  Instrument palette: ney, bağlama, darbuka, kanun + modern synth bass and beats.
- **SFX priority (mixing):** player hurt > boss telegraph > player weapons > pickups > enemy
  ambience. Limit concurrent instances per SFX (e.g., max 6 zombie groans).
- **Signature sounds:** the tea-glass "tink/shatter", the tram bell, the Döner Knife's "şak" (air swish, edge ping, thwack on cloth).
- **Ducking:** music −8 dB under VO; SFX −4 dB under VO.
- **Haptics:** light on level-up, medium on player hit (≥ 10% HP), heavy on boss slam and
  ultimate. Never on every XP pickup.
