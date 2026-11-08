# prototype/: Playable browser prototype of Level 1 (Phase B)

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
| Title (wireframe 01) | TR/EN switch, settings, placeholder key art, working title |
| Cold open (LD 4) | Letterboxed S1-S10 with TR VO subtitles, comic panels (3 rules), TAP the fork, SWIPE (any direction; any input after 3 s), stab with hit-stop + punch + "ÇAT!", hold-to-skip 0.6 s |
| Restaurant | 2 diners (6 HP), 2nd turns 4 s later, door opens when both die |
| Segment A | Fleeing civilians, door spawns, civilian grab at y=40, scripted first card (Tea Glass / Fork L2 / Sneakers), phone call starts |
| Segment B | Simit cart (drops simits), chestnut cart (fire zone), 8-walker cluster past the gas canister + "Hit the canister!" |
| Segment C | Runners, stalled tram (roof fades), cat hiss + manhole telegraph (1.0 s) + crawler |
| Segment D | Zoom out to 13.5 m, scaffold collapse, 60 s hold with shutter progress, 3 spawn phases, spawns stop at 56 s |
| Exit | Shutter opens, step inside, "Sinyal yok." / "Anne? ...Anne!", title slam "Ataköy: 17 km", results |
| Systems | Fork + Tea Glass (all 5 levels), Sneakers / Ayran / Butter, card weights from `card_offer.gd`, XP table, crits, knockback, burn, contact + i-frames, Second Wind on the first-ever run, revive offer (stubbed, free), stars + rewards (first clear ×2) |
| UI | HUD (04), level-up (05), pause (07), settings subset (16), down/revive (09), results (08) |
| Feel | Hit flash, damage numbers (merge, cap 40), trauma shake, crit-kill hit-stop, level-up slow-mo, low-HP vignette, ink splats, segment lighting, synthesized SFX; Reduce motion turns shake/hit-stop/slow-mo/punch off |
| Telemetry | GD 10 events kept in memory; Pause → "Download telemetry (JSONL)" |

## Balance check (headless bot)
`node prototype/tools/bot.js --seeds=50` runs the same simulation code without graphics.

Latest (kiting bot, 50 seeds): clear **50/50** (40/50 without needing Second Wind) · first level-up **8.2 s** into A
(target ≤ 15 s) · level-ups **7** (target 7-8) · peak alive **38** (target ~45) · kills ~213 (doc ~160) ·
run **~2:28** (target 3:00-4:00; the bot never stops walking, humans will be slower).

## Decisions I made where the docs were silent or conflicting (please confirm)
1. **Top-down camera**, 12 m wide (13.5 m in D), camera x-clamp ±1 m so walls/facades show at the edges (LD's ±7 m clamp would show void).
2. **Fork aims at the nearest enemy in range** (LD t_attack "auto-stabs the first zombie in range") instead of pure facing (CC). It only swings when something is in range.
3. **Spawns**: door markers only. A/B use off-screen doors ahead; C adds doors behind; D also uses visible doors (with a red door flash) half the time because all D doors are on screen. Segment totals are caps, rates are ceilings.
4. **Hold timer starts at the y=200 trigger** (the 1.5 s scaffold beat is inside the 60 s). Retreat is not blocked.
5. **No Ultimate button** in L1 (LD 14 HUD list omits it; wireframe 04 shows one).
6. **HUD**: the timer and call chips are stacked in the center because one row (wireframe 04) overflows at real string lengths.
7. **Results buttons**: Retry / Main menu / Double rewards (disabled). There is no world map yet, so "Map" goes to the title.
8. **Revive** buttons work for free and are labeled as stubs. Second Wind (first-ever run) doesn't cost the no-revive star.
9. **Unspecified values I picked**: runner/crawler radius, Fork knockback 0.6 m, Tea flight 0.55 s, Fork L3 back-thrust = mirror of the front arc, magnet 8 m/s, death tips text, restaurant zombie speed/contact/XP (1.0 / 4 / 3).
10. **Barks over 40 chars** (DS 9.3) are shown as written: "Tamam. Sakin. Kafaya vur. Filmlerdeki gibi." (43) and "Kestane... yanıyor. Bu bana bir fikir verdi." (44). Writer should trim.
11. **EN subtitles for dialogue** are my translations except where LD gives EN.
12. **Hold-to-skip is always available** for the cold open (doc: after first view) to make reviewing easier.

## Files
`js/config.js` numbers · `js/strings.js` TR/EN strings + dialogue · `js/sim/*` pure simulation (no DOM; the bot runs it) ·
`js/view/*` rendering, UI, input, feel, audio, telemetry · `js/main.js` flow · `tools/bot.js` headless balance check.
