# Sound effects drop folder: generated SFX for Project Istanbul

This is where the owner's AI-generated sound effects go. The synthesized sounds for kills, blasts and impacts still sound bad on the phone. You generate real-sounding effects with an AI sound tool from the prompts in `BRIEF.md`, drop the files here, and the game plays them. Any cue without a file keeps its synthesized sound. The XP pickup family (`tink`, `coin`, `star`, `magnet`) stays synthesized.

Decision: D-063 in `docs/product.md` §17 (proposed 2026-11-13; it amends D-029 for sound effects). Music is unchanged: it stays with Suno (D-062).

## Start here

1. Read `BRIEF.md`. Do batch 1 first (12 cues).
2. For each row, paste the prompt into your sound tool, generate 4 to 6 takes, keep the best 1 to 4.
3. Save each take with the exact name below, directly in this folder (not in a subfolder).
4. Run the tool (below), then listen on the phone or in `prototype/tools/sfx-preview.html`.

## File names

- `<cue>.<ext>` is take 1, for example `splat.wav`.
- `<cue>_2.<ext>`, `<cue>_3.<ext>`, `<cue>_4.<ext>` are takes 2 to 4. (`<cue>_1.<ext>` is accepted as take 1 when `<cue>.<ext>` is not there.) Four takes at most.
- Hit kinds: `hit_body`, `hit_blade`, `hit_blunt`, `hit_pierce`, `hit_chain`. A bare `hit` is refused.
- Beds (optional): `amb_street`, `amb_waterfront`, `amb_bazaar`, `amb_wind`, `amb_night`. One file each.
- Lower and upper case must match the list exactly. `node prototype/tools/prepare-sfx.js --list` prints every valid name. `speech` is not a file name (it stays synthesized).
- Formats: `.wav`, `.mp3`, `.ogg`, `.m4a`. Any sample rate (44.1 or 48 kHz is best), mono or stereo (the tool makes it mono). Export at the highest quality your tool offers.

## Tool settings

These are for ElevenLabs text-to-sound-effects (duration, prompt influence and loop). Other tools: match the intent.

- **Duration:** the target length in `BRIEF.md`. If the tool's shortest allowed length is longer than the target, generate at its shortest. The tool trims silence at both ends, so a little extra length is fine.
- **Prompt influence:** high (about 0.7) for impacts, blasts and stings, so the tool sticks to the prompt. Lower (about 0.3 to 0.5) for beds and voices.
- **Loop:** off for every cue. On for the ambience beds only.
- **Negative prompt** (if the tool has one): `music, speech, singing, words, room echo, reverb, clipping, distortion`.
- Keep the same settings for a whole batch, so the cues match each other.

## Picking takes

Listen on headphones or the phone at game volume. Keep a take only if it passes all of these:

- [ ] **Clean transient:** the sound starts sharply on the first frame, with no slow swell.
- [ ] **No music, no voices, no words** (the voice cues are non-verbal: groans, snarls, moans).
- [ ] **No long reverb tail.** It should be gone in about a second. The tool warns above 0.8 s on the frequent cues.
- [ ] **No clipping:** no crackle, buzz or fuzz on the peaks. The tool counts clipped samples.
- [ ] **One event:** one hit, one splat, one shot, not two stacked on top of each other.
- [ ] **Distinct from the other takes** of the same cue. The tool warns when two takes are nearly identical.
- [ ] **Fits the game:** cartoon-punchy and slightly comic, not gory or realistic. If it sounds real and bloody, reject it.
- [ ] **Length near the target** (the tool prints each length).

## Running the tool

```
node prototype/tools/prepare-sfx.js --dry-run       # names and lengths only, writes nothing
node prototype/tools/prepare-sfx.js                 # writes ready/*.mp3 and ready/manifest.json
node prototype/tools/prepare-sfx.js --only=splat,hit_body
node prototype/tools/prepare-sfx.js --list          # every valid name and its loudness class
node prototype/tools/test-sfx-gen.js                # checks the tool and the game loader
```

The tool trims silence, fades the tail by 5 ms, sets each file to its loudness class (impact, hit, voice, boss, ui; beds to -26 dBFS RMS), caps the peak at -1.5 dBFS, and encodes MP3 at 128 kbps, mono, 44.1 kHz. It writes to `ready/` and rebuilds `ready/manifest.json`. Partial uploads are fine: a cue without a file keeps its synthesized sound, and a rejected file (silent, too long, wrong name) is listed and skipped while the rest are written. The exit code is 1 when anything was rejected.

Loudness inside the game: the file is first set to its class level, then the game sets it to the cue's design level (the table in `js/view/sfx-bank2.js`), so the balance of the mix stays as it was tuned.

Beds: the tool does not trim them. It blends the last 0.5 s into the start, so export each bed 0.5 s longer than the loop you want (8 to 20 s final).

`ready/` is tracked in git, like `audio/music/`, so the game and the phone build get the same files. Your source files here are git-ignored.

## Licence and provenance (before anything ships)

- Check that the sound tool's plan tier allows commercial use in a shipped game, and write the tier down. Some tools only allow commercial use on paid tiers.
- After the tool has run, record one row per file in `art/PROVENANCE.csv`:

```
node prototype/tools/sfx-provenance.js --tool="ElevenLabs text-to-sound-effects" --model="<version>" --plan="<your plan tier>" --commercial-ok
```

The helper refuses to write without `--plan` and `--commercial-ok`. Those two flags are your confirmation that the tier allows commercial use. Add `--dry-run` to see the rows first. Rows are added only for files that have none yet.

## What the game does with the files

- At start-up the game fetches `ready/manifest.json` and then the files, in the background and in idle time, short files first. Nothing plays and nothing is shown while this happens. The files are decoded into memory: the cues are capped at 15.5 MB of decoded audio (the planned set is about 15 MB), and the longest files over the cap keep their synthesized sound. One ambience bed (at most 3.8 MB) is decoded when its theme starts.
- A cue with several takes plays them in turn (1, 2, 3, 1, 2, ...). Each play is pitched up or down by up to 4%, so repeats do not sound identical. The cue's design level, peak ceiling, voice limits, ducking and priority all work as before.
- If a file is missing, fails to load, or the browser refuses to load it (for example when the HTML is opened from disk with `file://`), the synthesized sound plays. Nothing is shown and nothing is logged.

## Testing on the phone

- **A/B in the game:** add `?sfx=synth` to the URL to force the synthesized sounds. Load the URL without it to hear the generated files. The game must be served over http, the same way it is served now.
- **A/B in the preview:** open `prototype/tools/sfx-preview.html` over http. The Generated / Synth switch plays every cue both ways on the same page, and the status line says how many files are ready.

## Troubleshooting

- **Nothing changed:** check that the URL has no `?sfx=synth`, that the page is served over http and not `file://`, that `ready/manifest.json` exists, and that the cue name is in `--list`.
- **A cue still sounds synthesized:** it has no file, the file was rejected by the tool, or the cue was over the 15.5 MB cap. The tool's report says which.
- **Two takes sound the same:** regenerate one take. The tool warns when two takes are nearly identical.
