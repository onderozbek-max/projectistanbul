# Project Istanbul: music files (prototype)

Eight tracks, one per id that `js/view/music.js` plays. The owner's Suno tracks replace the procedural placeholders under the same names. The briefs, the Suno prompts and the drop folder are in `prototype/audio/music-suno/README.md`. The conversion tool is `prototype/tools/prepare-music.js`.

> **Current files are placeholders.** The MP3s here are procedural, synthesised by `prototype/tools/render-music.js` (no samples, 128 kbps). They are not tracked in git yet. Their lengths are the old placeholder lengths (60 to 120 s loops, 68.6 s run tracks, 24 s one-shots). When a Suno take is dropped in and `prepare-music.js` runs, the placeholder is copied once to `prototype/audio/music-procedural/` and replaced.
> **Do not re-run `render-music.js` once the owner's files are here:** it overwrites them without a backup.

## 1. Files

| File | Id | Used for | Type | Length (exact) |
|---|---|---|---|---|
| `title.mp3` | `title` | Title screen | loop | 150.000 s (45 bars at 72 BPM) |
| `map.mp3` | `map` | Meta map | loop | 150.000 s (60 bars at 96 BPM) |
| `run_calm.mp3` | `run_calm` | Run music, default intensity | loop | 180.000 s (84 bars at 112 BPM) |
| `run_intense.mp3` | `run_intense` | Run music, high-intensity layer | loop | 180.000 s, same as run_calm |
| `boss.mp3` | `boss` | Boss encounters | loop | 180.000 s (96 bars at 128 BPM) |
| `comic.mp3` | `comic` | Comic panels and dialogue | loop | 120.000 s (40 bars at 80 BPM) |
| `victory.mp3` | `victory` | Level or chapter clear | one shot | 20.000 s (10 bars at 120 BPM) |
| `defeat.mp3` | `defeat` | Death or failed level | one shot | 20.000 s (6 bars at 72 BPM) |

Put the files in `prototype/audio/music/`, lower-case names. A missing file is silent, not an error, so the tracks can arrive one at a time.

## 2. How the game plays them

- `title`, `map`, `boss`: loop, one at a time.
- `run_calm` and `run_intense`: play together for a run. `intensity(0..1)` crossfades them with equal power. They must have the same length, tempo and bar grid, or they drift apart. The tool writes both at exactly 180.000 s and warns if only one is delivered.
- `comic`: loops, ducked by -9 dB under speech, and trimmed by -2 dB per track (`GAIN` in `js/view/music.js`), so it sits at the -18 LUFS of `docs/audio-cue-sheet.md`.
- `victory`, `defeat`: one shot. They never loop and stop at the end. A finished one-shot plays again on the next `play()`, but a tap does not restart it.

## 3. Format and loudness (what the tool writes)

- MP3, 192 kbps CBR, 44.1 kHz, stereo.
- Every loop and stinger is normalised to **-16 LUFS** integrated, two-pass `loudnorm`, true peak at or below -1.5 dBTP. The value is measured on the decoded MP3, and the encode can shift it by a few tenths of a dB.
- Loops are seamless. The file keeps exactly its length. Its last 1.5 s is the continuation of the music, blended into the first 1.5 s with an equal-power crossfade, corrected for how alike the two sides are (a repeating groove would otherwise swell by up to 3 dB). The wrap is then continuous. The file carries the LAME gapless header.
- Stingers keep their length and end with a 0.3 s fade-out. They are not looped.

## 4. Known limits

- The player uses HTMLAudioElement only, so it works over `file://`. Some browsers may leave a short gap at a loop point. If that is audible on a device, it is a player change and needs a decision.
- Until both run tracks are delivered, the run pair is out of step (placeholder 68.6 s against 180 s). `prepare-music.js` prints this as a note.

## 5. Tools

- `node prototype/tools/prepare-music.js`: Suno drop folder to these files (`--dry-run` checks names and lengths only).
- `node prototype/tools/render-music.js [id]`: regenerates the procedural placeholders.
- `node prototype/tools/test-music.js`: player checks and file checks (`--quick` skips the synthetic tool run).
- `prototype/tools/sfx-preview.html`: Music buttons to listen to each track.
