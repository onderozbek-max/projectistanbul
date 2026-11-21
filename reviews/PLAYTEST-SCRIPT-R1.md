# Project Istanbul first-session playtest

Use the browser build with illustrated art and local telemetry enabled. Start with five to eight people who have never played. Use a fresh browser profile or fresh site data for each tester, and allow about 20 minutes. Record the build, device model, language and whether sound was on. Ask before collecting or sharing the export. Use tester numbers in the notes.

## For the player

Open the game and play as you normally would. Stop when you would naturally stop, or when 20 minutes are up. Say out loud if something confuses you. If two songs appear to play together, say what was on screen just before you heard it. You can keep playing after a loss if you want.

At the end, use **Download telemetry (JSONL)** under **Pause** or **Settings** and give the file to the observer if you agree.

## For the observer

Let players find the controls and make upgrade decisions. Record what they do before offering help. If they need help, note where and what you told them. Pay particular attention to the restaurant exit, the first upgrade choice, any attempt to Dash or link, and what players do after the first result.

Ask these questions once they stop.

1. Where did you most want to keep going, and where did you want to stop?
2. Which attack or upgrade did you like using, and what did it do?
3. Was there a warning, control or objective you couldn’t work out?
4. Would you open this again tomorrow? What would bring you back?

Combine the exports with `node prototype/tools/playtest-report.js <exports…>` from the repo root. Record counts and the number of players who reached each step. Pair the most common problems with what the observer saw. Report where players who reached Level 5 chose to continue. Include scripted phone benchmarks alongside this report for device performance.

## Before expanding beyond Bölüm 30

Use the current illustrated build served by `python3 prototype/tools/serve.py` and a supported physical iPhone. Record the device, OS, browser, quality, language, and reduced-motion setting. Use earned power appropriate to the level and record any revive separately. Let each player finish naturally. Playtest staff can open a direct level with `?level=19&rhythm=1&seed=42` for repeatable comparisons.

- Give testers two uncoached attempts at the bosses in Bölüms 5, 15, 20, 25 and 30. After each attempt ask what exposed the boss and what they would repeat. Mark the moment they create the opening on the retry. After learning Normal, ask what they changed when they selected Nightmare.
- For the difficulty check in Bölüms 5, 13, 14, 19 and 30, record the first avoidable hit, whether the player saw its warning, and how they responded on the retry. In Karaköy watch the first bloater cluster. On the bridge watch the wave shelters and rolling bins separately.
- Compare close-range knife, ranged nail gun and area-control gas canister builds after the tutorial. Record the first intentional reroll, any recipe prerequisite they miss, how much play remains after a fork or evolution, and whether their movement or target choices change. Ask which other build they would choose if they came back.
- Record three mixed-build attacks at normal speed with the weapon release, impact, enemy reaction and recovery in frame. Ask the player which weapon fired while another attack and an enemy warning are visible. Repeat with sound muted and reduced motion. Record thumb reach, any missed taps, and the local opening, boss and crowd performance export after sustained play.
- After Bölüm 25, ask what Kaan did and what that let Arda do. Check whether the player discovered the follow-up Dash and whether the quieter scene at the quay made sense in the run they played.
- In a separate session, let a player reach the Bölüm 30 finale without briefing them on the next district. Ask where the pair is going next, why, and which action let them leave the station. Keep their save for the L31–35 handoff test once the new route is authored.
- On the lowest supported iPhone and a newer iPhone, listen to the same scenes through the speaker and headphones. Test on mute, after a lock/unlock and after an audio interruption. Record whether danger cues stay audible under weapons, whether the farewell melody is recognizable again later, and whether resuming preserves the right music and game state.
- At the end of the first session, record voluntary next runs. If the tester agrees, leave the link available without a reminder. Record later voluntary returns independently of stated intent. Keep results split by genre experience and hardware.

## Holistic first-30 follow-up

- Use two runs for each choice in L7, L12, L17, L22, L27 and L29. Watch the first without naming the alternatives. Record the action the player attempted, the actor or obstacle they expected to change, and what actually changed. Use separate fresh saves for two first-clear outcomes. Retry one failed route and relaunch each successful save before looking for its callback.
- Give players the local street object before describing it. Watch whether they discover the hold, what they do when pressure arrives, and whether they can escape with Dash. Try L14 placement, then the L23 Dash and placement routes with Kaan. Look for a safe path around every placed object. Ask what differences they could feel without the caption.
- From a result, let the player find one earned attribute rank and one eligible perk. Ask them to explain which improvement is permanent and what their current run’s rank changes. Give them one ineligible heavy-weapon pairing to inspect. Quit and reload during an independent test, then check that the prior clear or reward was settled once.
- If the player agrees, record one uninterrupted portrait sequence for each of L1–5, L11–15, L20–25 and L26–30. Mark natural stopping points and when essential warnings were obscured. Use an earned save, state the active build before each boss, and record any voluntary rematch, skips or revives. Compare both hands and repeat a warning on mute, minimum art quality, larger text and Reduce Motion.
