# Music drop folder: Suno tracks for Project Istanbul

This is where the owner's Suno exports go. `prototype/tools/prepare-music.js` reads them, checks names and lengths, makes the loops seamless, normalises loudness and writes the eight game files to `prototype/audio/music/`. Missing files are fine: a slot without a source keeps its procedural placeholder.

**Direction.** The north star for the feel is the driving, rhythmic, melancholic-heroic score of *Hades* (Supergiant): rock and folk fusion with ethnic instruments, always moving. Use it as a listening reference for energy and groove. The prompts below describe the style in plain words and name no artists or songs (Suno rejects artist names).

**Setting and tone.** A night walk from Taksim to Ataköy through a zombie-overrun city. Upbeat-dark, comic-adventure, never gory, never comic in a way that competes with the voices. Istanbul is the flavour, not a political or religious subject.

## 1. Files to save

- Save each slot as **one** file, named exactly like the table: `title.wav` (or `title.mp3`), `map.wav`, `run_calm.wav`, `run_intense.wav`, `boss.wav`, `comic.wav`, `victory.wav`, `defeat.wav`. Lower case, no spaces.
- Put the files directly in this folder. Subfolders are ignored (use `vocal-alt/` or `district-alt/` for alternates).
- If a slot has two files, the tool uses the WAV and says so.
- Audio files here are git-ignored (same as the SFX WAVs). Keep your Suno originals backed up outside the repo.

**Format.** Preferred: WAV, 44.1 kHz, stereo, 16 or 24 bit. Accepted: MP3 at 320 kbps or better, FLAC, M4A (AAC) at 256 kbps or better. A 48 kHz file works too (the tool resamples). The game gets **MP3, 192 kbps, 44.1 kHz, stereo**.

**Loudness.** Do not master loud. Export at a normal level with peaks below 0 dBFS. The tool sets every loop and stinger to **-16 LUFS integrated** (true peak at or below -1.5 dBTP). The game then trims `comic` by -2 dB, so it sits at the -18 LUFS of the cue sheet under dialogue.

**Length.** The game needs an exact length. Loops need the target **plus 1.5 s**, because the last 1.5 s is the crossfade tail. Stingers need at least the target length and are cut to it.

| File | Slot | Type | Game length (exact) | Export at least | Bars at tempo |
|---|---|---|---|---|---|
| `title.wav` | title | loop | 2:30.0 (150.000 s) | 2:31.5 | 45 bars at 72 BPM |
| `map.wav` | map | loop | 2:30.0 (150.000 s) | 2:31.5 | 60 bars at 96 BPM |
| `run_calm.wav` | run_calm | loop | 3:00.0 (180.000 s) | 3:01.5 | 84 bars at 112 BPM |
| `run_intense.wav` | run_intense | loop | 3:00.0 (180.000 s) | 3:01.5 | 84 bars at 112 BPM |
| `boss.wav` | boss | loop | 3:00.0 (180.000 s) | 3:01.5 | 96 bars at 128 BPM |
| `comic.wav` | comic | loop | 2:00.0 (120.000 s) | 2:01.5 | 40 bars at 80 BPM |
| `victory.wav` | victory | stinger, not looped | 0:20.0 (20.000 s) | 0:20.0 | 10 bars at 120 BPM |
| `defeat.wav` | defeat | stinger, not looped | 0:20.0 (20.000 s) | 0:20.0 | 6 bars at 72 BPM |

Loops: the game plays the file on repeat, and the tool makes the join seamless. Stingers: the game plays them once and stops. The tool fades the last 0.3 s.

## 2. The slots

Eight files and no extra tracks. The SFX already cover the level-up and the boss intro, so the slice needs no other music cue.

| Slot | Title (EN) | Role in the game | BPM | Key / scale | Type | Mood | Instrumentation |
|---|---|---|---|---|---|---|---|
| `title` | Gece Yürüyüşü (The Night Walk) | Title screen: first impression, an invitation out into the city | 72 | D Phrygian dominant (Hicaz colour) | loop, 2:30 | lonely, mysterious, inviting | solo ney, kanun harmonics, warm analog pad, bağlama arpeggio, muffled darbuka heartbeat, sub drone |
| `map` | Uzun Yürüyüş (The Long Walk) | Meta map: the route from Taksim to Ataköy as a long walk home | 96 | A Phrygian dominant (Hicaz) | loop, 2:30 | wistful, hopeful, a little restless | bağlama picking, darbuka in aksak 2-2-2-3, clarinet melody (Roman havası style), soft bass, light hats |
| `run_calm` | Sokak Nabzı (Street Pulse) | Run music, default intensity: under gameplay, no busy melody, no drops | 112 | D minor with Phrygian colour | loop, 3:00 | steady, urgent, hypnotic | darbuka pulse, 808 sub ostinato, bağlama stabs on the off-beats, soft synth pad, sparse ney motif, driving drum kit |
| `run_intense` | Sokak Nabzı: Ateşli (Street Pulse, Full Pack) | Run music, high intensity: the same song, bigger | 112 | D minor with Phrygian colour (same as calm) | loop, 3:00, same grid | urgent, relentless | as calm, plus zurna lead motif, trap hat rolls, string ostinato, 808 roll |
| `boss` | Kapı Kapandı (The Door Slams Shut) | Boss encounters: heavy and dark, with room for telegraphs | 128 | F# Phrygian | loop, 3:00 | ominous, massive, relentless | kanun tremolo, zurna lead, deep 808 sub, 2-step darbuka with tek accents, dark synth drone, dissonant strings |
| `comic` | Eski Fotoğraflar (Old Photographs) | Comic panels and dialogue: must never compete with voices | 80 | E minor with Hüseyni colour (Dorian lean) | loop, 2:00 | intimate, reflective, sad or calm | solo ney, soft kanun, warm analog pad, distant bağlama, no drums |
| `victory` | Tramvay Zaferi (Tram Victory) | Level or chapter clear: triumphant and warm, ends on a held tonic | 120 | D major with Rast colour (lowered third) | stinger, 0:20 | triumphant, warm | darbuka roll into bağlama strum, clarinet melody (Roman havası), tram-bell accents, final chord with reverb |
| `defeat` | Sessiz Sokak (Silent Street) | Death or failed level: soft, sad, quiet resolve | 72 | D minor | stinger, 0:20 | loss, quiet resolve | falling ney phrase, descending kanun arpeggio, low drone, distant darbuka, held chord |

Makam names (Hicaz, Rast, Hüseyni) are for the owner's ear. The prompts use Western scale names, which Suno follows more reliably.

## 3. Suno prompts

### 3.1 Short prompt (non-custom mode, under 200 characters)

Paste the prompt into the description box. Turn on **Instrumental**. The exclude line is for custom mode; in simple mode, add "no vocals" which is already in each prompt.

| Slot | Short prompt (paste as is) | Exclude styles (custom mode) |
|---|---|---|
| `title` | Eerie cinematic night theme, 72 bpm, D Phrygian dominant. Solo ney, kanun harmonics, warm analog pad, bağlama arpeggio, soft darbuka heartbeat. Lonely, inviting. Instrumental, no vocals. | vocals, singing, lyrics, choir, autotune, pop chorus, EDM drop, big riser, crowd noise, siren, sudden ending, fade-out ending |
| `map` | Long walk through Istanbul, 96 bpm, A Phrygian dominant. Bağlama picking, darbuka aksak 2-2-2-3 accents, clarinet melody Roman havası style, soft bass. Wistful, hopeful. Instrumental, no vocals. | vocals, singing, lyrics, choir, autotune, pop chorus, EDM drop, big riser, crowd noise, siren, sudden ending, fade-out ending |
| `run_calm` | Chase run music, 112 bpm, D minor, Phrygian colour. Darbuka pulse, 808 sub ostinato, bağlama stabs on the off-beats, synth pad, sparse ney, rock-folk drive. Steady, urgent. Instrumental, no vocals. | vocals, singing, lyrics, choir, autotune, pop chorus, EDM drop, big riser, crowd noise, siren, sudden ending, fade-out ending |
| `run_intense` | Same run theme, bigger: 112 bpm, D minor, Phrygian colour. Darbuka pulse, bağlama and zurna lead, trap hats, string ostinato, big 808 roll, driving drums. Urgent, relentless. Instrumental, no vocals. | vocals, singing, lyrics, choir, autotune, pop chorus, EDM drop, big riser, crowd noise, siren, sudden ending, fade-out ending |
| `boss` | Istanbul boss battle, 128 bpm, F# Phrygian. Kanun tremolo, zurna lead, deep 808 sub, heavy darbuka, dark synth drone, driving drums, dissonant strings. Ominous, massive. Instrumental, no vocals. | vocals, singing, lyrics, choir, autotune, pop chorus, EDM drop, big riser, crowd noise, siren, sudden ending, fade-out ending |
| `comic` | Intimate dialogue bed, 80 bpm, E minor. Solo ney, soft kanun, warm analog pad, distant bağlama, no drums. Reflective, sad, calm, very quiet. Instrumental, no vocals. | vocals, singing, lyrics, choir, drums, percussion, EDM drop, big riser, crowd noise, siren, sudden ending, fade-out ending |
| `victory` | Victory fanfare, Istanbul, 120 bpm, D major, Rast colour. Darbuka roll into bağlama strum, clarinet melody Roman havası style, tram bell accents, final chord. Triumphant. Instrumental, no vocals. | vocals, singing, lyrics, choir, autotune, EDM drop, crowd noise, siren, long fade-out, cheesy fanfare |
| `defeat` | Defeat theme, 72 bpm, D minor. Falling ney phrase, descending kanun arpeggio, low drone, distant darbuka, sad and quiet, ends on a held chord with a long reverb. Instrumental, no vocals. | vocals, singing, lyrics, choir, autotune, EDM drop, crowd noise, siren, long fade-out, cheesy fanfare |

### 3.2 Custom mode (longer style field and the lyrics box)

Use custom mode when you want control. Turn on **Instrumental**. Put the style text in the **Style** field and the tags below in the **Lyrics** box, with no words. Style fields are kept under 700 characters. If your Suno version's field is shorter, use 3.1.

**`title`** (loop, 2:31.5 export)
- Style: Cinematic Istanbul night theme, 72 BPM, D Phrygian dominant. Rhythmic rock-folk fusion with ethnic instruments: solo ney opening, soft kanun harmonics, bağlama arpeggio, warm analog pad, muffled darbuka heartbeat, sub-bass drone, a little electric guitar texture low in the mix. Melancholic-heroic, lonely and inviting, a walk through an empty city at night. Clean dynamics, flat energy, seamless loop.
- Lyrics box:
```
[Instrumental]

[Intro]

[Verse]

[Chorus]

[Bridge]

[Outro]
```

**`map`** (loop, 2:31.5 export)
- Style: Long travelogue walk through Istanbul, 96 BPM, A Phrygian dominant, aksak feel. Bağlama picking, darbuka with 2-2-2-3 accents, clarinet melody in Roman havası style, kanun arpeggios, soft bass, light hats. A rising route motif in the middle eight, then back to the opening theme. Rhythmic folk-rock drive, wistful and hopeful.
- Lyrics box: `[Instrumental]` then `[Intro]`, `[Verse]`, `[Chorus]`, `[Bridge]` (the middle eight), `[Outro]`, each on its own line with a blank line between.

**`run_calm`** (loop, 3:01.5 export)
- Style: Chase run music, 112 BPM, D minor with Phrygian colour. Rhythmic rock-folk fusion: darbuka pulse (doum on 1 and 3, tek on the off-beats), 808 sub-bass ostinato, bağlama stabs on the off-beats, plucked saz riffs, soft synth pad, driving drum kit, a sparse ney motif every eight bars. Steady, urgent, hypnotic. Flat dynamics, no drops, no build-ups.
- Lyrics box: `[Instrumental]`, `[Intro]`, `[Verse]`, `[Chorus]`, `[Verse]`, `[Chorus]`, `[Outro]`.

**`run_intense`** (loop, 3:01.5 export, same grid as run_calm)
- Style: The same song as the calm run, bigger. Identical chords, tempo and bar grid, 112 BPM, D minor with Phrygian colour. Add a zurna lead motif, trap hat rolls, a staccato string ostinato, a big 808 roll, extra darbuka layers and the driving drum kit. Urgent, relentless, still rhythmic.
- Lyrics box: the same tags as `run_calm`, in the same order.

**`boss`** (loop, 3:01.5 export)
- Style: Boss battle in a dark Istanbul street, 128 BPM, F# Phrygian. Heavy, ominous, massive. Kanun tremolo, zurna lead, deep 808 sub, a 2-step darbuka pattern with tek accents, dark synth drone, driving drum kit, dissonant strings, rhythmic rock-folk aggression. Keep the dynamics open so telegraph sounds can be heard: no sudden drops.
- Lyrics box: `[Instrumental]`, `[Intro]`, `[Verse]`, `[Chorus]`, `[Verse]`, `[Bridge]`, `[Outro]`.

**`comic`** (loop, 2:01.5 export)
- Style: Intimate dialogue bed, 80 BPM, E minor with a Dorian lean. Solo ney, soft kanun, warm analog pad, distant bağlama. No drums. Reflective, sad, calm, very quiet. Keep 1 to 3 kHz clear for speech.
- Lyrics box: `[Instrumental]`, `[Intro]`, `[Verse]`, `[Outro]`.

**`victory`** (stinger, 0:20 export)
- Style: Victory stinger, Istanbul, 120 BPM, D major with Rast colour (a lowered third). Triumphant and warm. Darbuka roll into a bağlama strum, clarinet melody in Roman havası style, tram-bell accents, cinematic brass hits, a final sustained chord with a reverb tail. Ends on the tonic.
- Lyrics box: `[Instrumental]`, `[Intro]`, `[Chorus]`, `[Outro]`.

**`defeat`** (stinger, 0:20 export)
- Style: Defeat stinger, 72 BPM, D minor. Sad, quiet, quiet resolve. Falling ney phrase, descending kanun arpeggio, soft strings, low drone, distant darbuka. Ends on a held D minor chord with a long reverb tail.
- Lyrics box: `[Instrumental]`, `[Intro]`, `[Verse]`, `[Outro]`.

## 4. Generating and picking

1. **Four takes per slot.** Generate four, pick by the checklist. Do not accept the first one.
2. **Checklist for loops.** (a) The first four bars already have the groove or the melody, with no slow build from silence. (b) Loudness is steady from start to end, with no swell or dip in the last two seconds against the first two. (c) No ending: no cadence, no fade, no final cymbal crash, because the tail is blended into the head. (d) No words, no breaths, no vocal sounds (unless you are making a vocal variant). (e) Key and tempo match the table.
3. **Checklist for stingers.** The first beat is clean, the final chord lands inside the 20 s, and there is nothing after it.
4. **Making a loop length.** Take the chosen take and use Extend until it runs at least 2 bars past the loop end. Then in a DAW (Audacity is free) cut from the first downbeat so the file is exactly the "export at least" length in the table, with the extra 1.5 s being the bars that follow the loop end. Do not fade the end. The tool keeps the first target seconds and blends the last 1.5 s into the head.
5. **Run pair.** Make `run_calm` first, then make `run_intense` as a cover or remix of the chosen `run_calm` take if your plan has it, so the chords and tempo stay identical. Check both together in your DAW: they must line up at the start and have the same length. The tool checks the lengths after writing.
6. **Stingers.** Export at least 20 s. The tool cuts at 20.0 s and fades for 0.3 s, so the final chord must sit inside the 20 s.

## 5. Vocal options (optional)

Instrumental is the default for every slot. The title and the boss may have a vocal alternate. Save alternates in `vocal-alt/` (the tool ignores that folder). Move one into this folder under the slot name only when you decide to ship it.

- **Title, Turkish or English, owner-written lyrics.** Style: `Melancholic-heroic Istanbul night song, 72 BPM, D Phrygian dominant, rhythmic rock-folk with ney and bağlama, a single male or female vocal, short repeated hook, lonely and inviting`. Lyrics: four lines you write, no religious, political, or real-name content.
- **Boss, wordless only.** Style: `Boss battle in a dark Istanbul street, 128 BPM, F# Phrygian, driving rhythm, wordless group shouts on the downbeats, no words`. Wordless shouts and drums keep the telegraph sounds readable.

**Guardrails for any vocal.** No prayers, ezan, religious chant, God, mosque or church wording (religion is never the target). No politics, no state or military imagery, no real people or public figures, no real brands, clubs or crests. No earthquake words ("the big one", tremor). No explicit sex or gore. The rating target is 16+. Vocals also compete with dialogue, so test them with the comic and boss SFX before shipping.

## 6. District flavour (stretch, not required for the slice)

Optional variants of `run_calm`, one per district, so the walk changes its sound. The game has no per-district music slot yet, and `music.js` plays one run pair per run, so these need a player change later. Each add-on goes into the run_calm custom style field (section 3.2), keeping its 112 BPM and D minor so a later swap stays in time. Save any variant in `district-alt/` (the tool ignores that folder).

| Hood (journey theme) | Add-on to the run_calm style field |
|---|---|
| Istiklal | Tram-bell accents, plucked saz and clarinet riff, busy street percussion. |
| Galata | Old stone reverb, low ney line, airy flute, slow pad, a little wind. |
| Bazaar (Kapalıçarşı) | Metallic percussion, hand-clap rhythm, oud and kanun melody, warm brass. |
| Haliç (Golden Horn) | Water shimmer, wide pad, shaker, ney over a slow pulse. |
| Ataköy | Open synth pads, soft hats, bağlama, sea-wind texture, calm and open. |

## 7. Licence and provenance (before anything ships)

Decision D-029 and section 15 of `docs/product.md` require a Suno Pro commercial licence check, the plan tier, and a provenance log before any track ships. Keep a `PROVENANCE.csv` in this folder with one row per delivered file: `slot, file, suno_song_id, plan, date, prompt_version, takes_considered, licence_check, notes`. Do not ship a track without that row.

## 8. Running the tool

```
node prototype/tools/prepare-music.js --dry-run     # names and lengths only, writes nothing
node prototype/tools/prepare-music.js               # writes prototype/audio/music/*.mp3
node prototype/tools/prepare-music.js --only=title,map
node prototype/tools/test-music.js                  # player and file checks
```

The first run that writes a file copies the current placeholders to `prototype/audio/music-procedural/` (once). Expect roughly 20 to 40 s per track (longer on a busy machine). It exits with code 1 if any source is rejected (too short, unreadable). A rejected file is never written, and its slot keeps its placeholder.
