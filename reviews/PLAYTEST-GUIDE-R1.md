# Playtest guide (R1 prototype)

## Run it on your phone (same Wi-Fi)
1. On the Mac: `cd prototype && python3 -m http.server 8765 --bind 0.0.0.0`
2. On the phone (Safari): `http://<your-Mac-IP>:8765` (find the IP with `ipconfig getifaddr en0`).
3. Optional: Share, then Add to Home Screen, for full screen.
4. If the phone cannot reach the Mac (some office Wi-Fi blocks device-to-device traffic), put the Mac on the iPhone's Personal Hotspot and use the Mac's new IP.
5. Audio on iOS starts after your first tap.

## URL flags
- `?level=N` plays journey level N with no unlock check (e.g. `?level=5`, `?level=50`).
- `?meta=unlockall` unlocks all 100 levels with coins and kills for testing.
- `?lang=tr` or `?lang=en` forces the language (not saved).

## Send me your data
Pause menu, then "Telemetry indir (JSONL)" (EN: "Download telemetry (JSONL)"). On the phone it lands in Files; AirDrop it to the Mac and tell me the file name. I read `level_start`, `level_up` and `level_end` (time, HP, deaths) to compare with the bot.

## What to feel for
- Challenge: L2 to L5, do you drop below half HP? Does the L5 boss feel like a fight?
- Pacing: first level-up near 10 s, then about every 20 to 30 s.
- Progression: the Power strip, Street Cred meter, level-up banner and run recap.
- Animation: walker arm swing and lean, windup anticipation, death collapse, gem glint.
- Sound: open `prototype/tools/sfx-preview.html` first, then play with sound on.
- The full T4 checklist is in `reviews/REVIEW-R1.md` under "# T4 part 4" (human playtest checklist) and `reviews/A11Y-CHECKLIST-R1.md`.
