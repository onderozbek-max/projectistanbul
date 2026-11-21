# Audit 9 · remaining device, listening and player gates

These checks have **not** been conducted by the implementation agent. No physical iPhone or unfamiliar participant was available, and the agent can inspect recorded frames and audio routing but cannot audition the mix. Desktop emulation, assisted rendered input and headless campaigns do not close these gates. No participants have been contacted.

Use the exact runtime identified in `telemetry/audit9-implementation/integrated13.json`, or create a new manifest after a repair. Preserve the tester's earned save. Record device/model, iOS version, browser or wrapper, build hash, date, settings and capture file. The localhost preview is for this Mac; a phone needs the owner's existing private-LAN serving setup. Do not represent a failed connection as a game failure.

## Connect the exact build

The verified snapshot is `/private/tmp/istanbul-audit9-integrated13-20261119`, manifest `8b02fbff46d1bef7db62dc3c1480fead8acd0a8d5fed2479ebb66e1efba44fdc`. The Mac-only preview is `http://127.0.0.1:8801/`. Do not use an older phone/LAN tab as evidence of this version.

When the owner is physically present and chooses to expose this **snapshot only** on their private LAN, use the existing Python installation, a different free port and the Mac's actual private LAN address:

```sh
python3 -m http.server 8802 --bind <MAC_PRIVATE_LAN_IP> --directory /private/tmp/istanbul-audit9-integrated13-20261119
```

Open `http://<MAC_PRIVATE_LAN_IP>:8802/` in iPhone Safari on that LAN, permit the owner's normal firewall prompt if appropriate, and record the manifest above. This LAN command has **not been executed** by the agent. It adds no dependency/service account. If LAN exposure is not desired, use the owner's existing approved USB/private testing route. Retain that origin's earned save; use a separate fresh test profile/origin rather than erasing the owner's progress.

## Continuous normal-speed visual review · pending

Use the source-labelled evidence index and full files, then verify uncertain motion live. Review at normal speed before pausing for notes:

1. Watch17 base weapons at ranks1/3/5 and18 evolutions, including clean contact and the legal six-slot crowd. Identify preparation, held source, actual release/contact, target consequence and return. Check that Arda has one credible set of limbs, chain tension belongs to its real grip and saw bite/retraction is visible. A larger effect alone does not establish rank progression.
2. Watch all ten boss commitments and weighted defeats, then their earned fights. Check planted feet/turning, hand/tool/aim continuity, real danger boundary, a readable recovery and reachable escape/punish. Do not demand every family from a strong fast rematch or infer fairness from a supplied invulnerable observer.
3. Watch14 naturally spawned enemy roles and2 explicitly additional fixtures, then the mixed crowd. Locate actual spitter/screamer/bloater sources and a usable escape before friendly decoration. Record missed/obscured cues.
4. Watch the fresh opening and full earnedL20/25/30 world→reading→control→exit→result. Repeat skip/interruption/retry variants. Check body grounding/continuity, responsive Arda, Kaan's persistence, quiet farewell and actual service-path intention. Captions must leave important action visible.
5. Review all30 actual route decisions and result/growth/return flows, including losses, unsuccessful help and missed evolutions. Note timecodes for unclear intention, repetitive work, weak release, stalled input and misleading benefit/verb.

The final recorder samples full-viewport screenshots at a target10Hz with original wall-time/audio. It never invents in-between motion, but cannot prove the quality of a60Hz micro-action. Earlier captures have their own frame cadence/source. If a fast impact is unclear in a recording, inspect the live build or make a declared higher-cadence device recording; do not mark it absent or accepted from a single sampled frame. The agent did not continuously watch these files.

## Physical iPhone · sustained ordinary play

1. Use portrait mode, a fresh local save and ordinary gameplay. Play L1 through L5 without debug grants, then continue an earned save through a dense later district. Record at least 30 continuous minutes, including menu time. Use one thumb; record reach problems rather than teaching around them.
2. In L1 check the resident diner remains visible through conversion, Arda takes the knife, the street route is understandable, and Mom loses/restores signal in the correct order. Stay at the booster; explain in your own words what changed.
3. During movement, tap Dash and both equipped skills without releasing the movement finger. Enter/leave an upgrade, chest, pause and phone call with that finger down. Verify movement resumes without a stuck or displaced stick.
4. Use TR and EN at default and 150% text. Inspect a rank-3 and rank-5 mod, an evolved weapon and a populated build. All choices, reroll, full descriptions and Back must be reachable with no horizontal letter columns.
5. During live combat, a protected boss entrance, L20 recognition, L25 farewell, L30 departure and a Memories replay: background for 15 seconds, lock for 30 seconds, and return. Protected gameplay time/HP must not advance. Live gameplay must pause safely; return must require an intentional continuation where specified. No duplicate reward, lost pointer or stale comic may persist into the next run.
6. Leave the phone in a dense legal six-weapon encounter for five minutes of active movement. Record stalls, missed touch, readability, heat, battery and operating-system warnings. Use the built-in benchmark/export for frame/work distributions on that named device. Repeat at the reduced effects/motion/flash settings. Do not use a screen recorder's frame rate as the game's frame-time measurement.
7. Finish a level, spend earned resources, inspect/equip gear, replay a collected story, return to the map, retry after a loss and launch the next eligible level. Check currency/rewards settle once. Stop at L30; no production beyond it is under acceptance here.

Acceptance: responsive one-thumb control, no lost-input or clock/settlement defect, readable feet/attack sources/escape lanes, reachable menu controls and sustained performance on the named phone. Record actual values and failures; do not fill in pass from desktop results.

For ordinary-play export, open `http://<MAC_PRIVATE_LAN_IP>:8802/?art=raster&debug=1`, play normally, then use Pause → Download telemetry (JSONL), or the same export in Settings. Keep the export private; it can include a browser user agent and random session identifiers. Run `node prototype/tools/playtest-report.js <ordinary-export.jsonl>` locally to inspect it. This is a test procedure, not an executed device result.

After ordinary play, use a separate tab at `http://<MAC_PRIVATE_LAN_IP>:8802/?bench=1&art=raster&lang=en`. Tap Start, let the three scripted scenes complete their warm-up and60 measured seconds each, then download the phone-test JSONL. Label this **scripted benchmark**, not player behavior or enjoyment. Record actual frame/work distributions, canvas size, quality changes, audible track identities and missing memory fields; unavailable memory is not zero. Preserve interruption/aborted results rather than replacing them with a clean pass.

## Actual listening · headphones and phone speaker

Listen to the normal-speed full recordings and the live phone build at a comfortable fixed volume. Repeat combat long enough to notice fatigue; a valid waveform is insufficient.

- Knife, chain, saw, hammer, flame, electric and projectile contact: can each source be recognized, and can dangerous enemy preparation be heard through a dense build?
- Ordinary combat → player frenzy → boss commitment → recovery → defeat: do changes have a beginning, useful contrast and a clean end? Does music mask contact or threat cues? Is any repeated zombie death sound tiring?
- L20: recognition and the home/companionship motif; L25: tool settling, quiet grief, native reading and shared departure; L30: Mom, family intention, service passage and return to results. Check the entire transition, including silence and resumed music.
- Mute/unmute each bus, background/resume, skip a page and finish Memories. No unwanted loop, doubled song, abrupt stale track or delayed loud catch-up should remain. Repeat on the phone speaker and headphones.

For each sequence record timecodes, perceived source, missing cue, competition/fatigue and recommended adjustment. Do not report a mix as approved merely because the audio was captured.

## 5–8 consenting unfamiliar players

Recruitment and contacting people require the owner's separate action. Include at least one complete **uncoached first-30 human run** with failure/retry, interruption/return and earned progression. The implementation agent's rendered-input walkthrough is explicitly assisted automation, not this participant.

Give only: “Try to get Arda through the city. Play as you normally would.” Do not explain rings, build recipes, boss openings or Kaan. Record confusion, failed intentions, voluntary experimentation, pauses and reasons for stopping. Allow participants to stop. Keep neutral/unsuccessful choices as evidence.

At natural pauses, ask the player to show or explain:

1. What just hurt/healed/blocked damage, including saved full-health food?
2. What did the last upgrade change? Which improvements persist after this run? What is the next useful improvement after a loss?
3. Which enemy matters next, which direction is safe, and what was the boss promising before committing?
4. Why operate this street mechanism, choose this side, carry/place/throw this object, or help Kaan? What changed afterward?
5. What did the evolution change during a meaningful encounter? Did they get time to use it? Record missed recipes as well as successes.
6. After L20, L25 and L30: who is here, what happened, where are they going next, and why? Observe whether they can move and depart without being coached.
7. Can they find progression, gear, mastery, skills, Memories and the route back to play without assistance?
8. Do they want another run/build, and why? Observe actual continuation and an optional later return; do not infer retention from a small formative sample.

Report observations by participant and build, including unsuccessful runs and abandoned intentions. Closure requires the whole journey to communicate its meaning; it does not certify a masterpiece, Hades parity or permission to expand.
