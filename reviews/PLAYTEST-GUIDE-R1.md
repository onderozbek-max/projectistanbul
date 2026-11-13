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

## Performance and heat (T4 part 12)
The stub numbers in `reviews/REVIEW-R1.md` ("T4 part 12") are not device numbers. Frame time and heat can only be confirmed on the phone.
1. Add `?fps=1` to the URL (`http://<your-Mac-IP>:8765/?fps=1`). A small box at the bottom left shows the frame rate, the smoothed frame time (ms, EMA over 2 s), the quality tier (`t0`, `t1`, `t2`), the device-pixel ratio and the canvas size.
2. Expected on an iPhone (ProMotion, 120 Hz): about **60 fps** (the world is capped at 60) and `dpr 2.00`, canvas `780x1688`. If you see 120, or `dpr 3.00`, send me a photo: the cap did not apply.
3. Heat test: play Level 5 (`?level=5&fps=1`) for 10 minutes with the screen at the same brightness and Low Power Mode off. Note the feel of the back of the phone at 0, 5 and 10 minutes, the tier shown at the end and the lowest fps you saw. Repeat once with `?quality=0` (locks the full look, no governor) so we can compare the same play with and without the governor.
4. What the tiers do (the governor steps down only after about 4 s of frame time above 20 ms, and steps back up only after 30 s of calm):
   - `t0`: full look, DPR 2.
   - `t1`: DPR 1.5, one in two gibs, blood, sparks, embers, shards and dust; no shop-window glows.
   - `t2`: DPR 1.25, one in three of those particles; no rain or haze, and no ground shadows (AO) under props.
   - Nothing changes the fight: the sim, enemy counts, hit boxes and rewards are the same on every tier.
5. What to send: the phone model and iOS version, the minutes played, the feel at 0/5/10 minutes, the tier and fps you saw, and whether anything looked wrong (a missing gib trail, a dark patch, a blurry edge). A screenshot of the `?fps=1` box is enough.
6. Pause, cards, chests and comic pages freeze the world and draw it at 30 fps; a hidden tab draws nothing. That is expected.
