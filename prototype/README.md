# prototype/: Playable browser prototype of Level 1 (Phase B, v0.3)

> **v0.3 (2026-11-08):** distinct animation per weapon (`js/view/weapons-fx.js`), İstiklal street life
> (`js/view/istanbul.js`), Elite + Mini Chest set piece, level-up shockwave, kill combos, blood/ink setting,
> XP curve 1.6. See `reviews/AUDIT-2-2026-11-08.md` and decisions D-022 to D-026.

> **v0.2 (2026-11-08):** rebuilt after the owner playtest and `reviews/AUDIT-2026-11-08.md`. New weapon kit,
> sprite characters, night street, comic-ink UI, 28 s cold open, real climax. Proposed decisions D-017 to D-021
> in `docs/product.md` §17.

A throwaway, playable version of **Level 1 (İstiklal)** built straight from the docs and the lo-fi
wireframes, so the team can feel the opening level before the Godot build gets there (M1-M3).
Plain HTML + Canvas + JavaScript. No dependencies, no build step, no network.

**Not the game's code.** The Godot project in `/game` is the real build. This prototype exists to test
flow, pacing, tutorial order, readability and UI layout. Numbers live in `js/config.js` with doc citations.

## How to play
- **Laptop:** open `prototype/index.html` in Chrome or Safari (double-click works). Or serve it:
  `cd prototype && python3 -m http.server 8765` then open http://127.0.0.1:8765
- **iPhone (same Wi-Fi):** serve as above with `--bind 0.0.0.0`, then open `http://<your-Mac-IP>:8765` in Safari.
  Add to Home Screen for full-screen.
- **Controls:** touch/drag in the lower 60% of the screen (floating joystick), or WASD/arrows. P/Esc pauses.
  Attacks are automatic.

**Review shortcuts** (append to the URL): `?skipintro=1` (straight to the restaurant fight) ·
`?seg=B` / `?seg=C` / `?seg=D` (jump to a segment with a typical build) · `?seed=123` (repeatable run).

## What's in it (LD = docs/level-001-istiklal.md)
| Beat | Built |
|---|---|
| Title (wireframe 01) | TR/EN switch, settings, sprite key art (horde, tram, Arda with the knife), working title |
| Cold open (LD 4, cut per D-019) | About 28 s: dinner, news, diner turns, 3 rules comic, Arda grabs the cook's döner knife, auto strike with hit-stop + punch + "ŞAK!". No input beat. Hold-to-skip 0.6 s |
| Restaurant | 2 diners (6 HP), 2nd turns 2.5 s later, door opens when both die |
| Segment A | Fleeing civilians, door spawns, civilian grab at y=40, scripted first card (Nail Gun / Döner Knife L2 / Running Shoes), phone call starts |
| Segment B | Simit cart (drops simits), chestnut cart (fire zone), 8-walker cluster past the gas canister + "Hit the canister!" |
| Segment C | Runners, stalled tram (roof fades), cat hiss + manhole telegraph (1.0 s) + crawler |
| Segment D | Zoom out to 12 m, scaffold collapse, 60 s hold with shutter progress, spawn phases 4 → 7 → 10/s (peak ~100), spawns stop at 56 s |
| Exit | Shutter opens, step inside, "Sinyal yok." / "Anne? ...Anne!", title slam "Ataköy: 17 km", results |
| Systems | Weapons: Döner Knife (arc, backstab at L3), Nail Gun (auto-aim, pierce), Gas Canister (lobbed AoE, fire at L5), Bike Chain (orbit). Passives: Running Shoes, Leather Jacket (flat armor), Work Gloves (damage + shove), Energy Drink (cooldown), First Aid Kit (heal on pick + regen when not hit). Cards show before→after stats. card weights from `card_offer.gd`, XP table, crits, knockback, burn, contact + i-frames, Second Wind on the first-ever run, revive offer (stubbed, free), stars + rewards (first clear ×2) |
| UI | Comic-ink style: HUD (04), level-up (05, stacked icon cards), pause (07), settings subset (16), down/revive (09), results (08). SVG icons in `js/view/icons.js` |
| Feel | Sprite figures with walk cycles and variants (`js/view/sprites.js`), death collapse, gibs/blood along the hit direction, knife crescents, nail tracers, canister arcs + target rings, blast flash + scorch, cobblestone night street with shopfronts and lamp light. Hit flash, damage numbers (merge, cap 40), trauma shake, crit-kill hit-stop, level-up slow-mo, low-HP vignette, ink splats, segment lighting, synthesized SFX; Reduce motion turns shake/hit-stop/slow-mo/punch off |
| Telemetry | GD 10 events kept in memory; Pause → "Download telemetry (JSONL)" |

## Balance check (headless bot)
`node prototype/tools/bot.js --seeds=50` runs the same simulation code without graphics.

Latest v0.3 (30 seeds): kiting bot clears **30/30**, **26/30** without dying · naive straight-line bot **27/30**, **14/30**
without dying · first level-up **7.5 s** into A · level-ups **9** + **2 chests** · peak alive **~100** · kills ~536 · run ~2:38.

## Decisions I made where the docs were silent or conflicting (please confirm)
1. **Top-down camera**, 10 m wide (12 m in D; D-021), camera x-clamp ±1 m so walls/facades show at the edges (LD's ±7 m clamp would show void).
2. **Knife aims at the nearest enemy in range** (LD t_attack "auto-stabs the first zombie in range") instead of pure facing (CC). It only swings when something is in range.
3. **Spawns**: door markers only. A/B use off-screen doors ahead; C adds doors behind; D also uses visible doors (with a red door flash) half the time because all D doors are on screen. Segment totals are caps, rates are ceilings.
4. **Hold timer starts at the y=200 trigger** (the 1.5 s scaffold beat is inside the 60 s). Retreat is not blocked.
5. **No Ultimate button** in L1 (LD 14 HUD list omits it; wireframe 04 shows one).
6. **HUD**: the timer and call chips are stacked in the center because one row (wireframe 04) overflows at real string lengths.
7. **Results buttons**: Retry / Main menu / Double rewards (disabled). There is no world map yet, so "Map" goes to the title.
8. **Revive** buttons work for free and are labeled as stubs. Second Wind (first-ever run) doesn't cost the no-revive star.
9. **Unspecified values I picked**: runner/crawler radius, knife knockback 0.6 m, canister flight 0.6 s, knife L3 backstab = mirror of the front arc, magnet 8 m/s, death tips text, restaurant zombie speed/contact/XP (1.0 / 4 / 3).
10. **Barks over 40 chars** (DS 9.3) are shown as written: "Tamam. Sakin. Kafaya vur. Filmlerdeki gibi." (43) and "Kestane... yanıyor. Bu bana bir fikir verdi." (44). Writer should trim.
11. **EN subtitles for dialogue** are my translations except where LD gives EN.
12. **Hold-to-skip is always available** for the cold open (doc: after first view) to make reviewing easier.

## Files
`js/config.js` numbers · `js/strings.js` TR/EN strings + dialogue · `js/sim/*` pure simulation (no DOM; the bot runs it) ·
`js/view/*` rendering (sprites, icons, world), UI, input, feel, audio, telemetry · `js/main.js` flow · `tools/bot.js` headless balance check.
