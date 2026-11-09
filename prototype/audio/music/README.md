# Member's Mark Community: music production spec (Suno Pro)

Eight tracks for the MMC prototype. The owner produces them in Suno Pro. `js/view/music.js` plays them. This file is the brief, the prompts and the export checklist.

## 1. Files

| File | Id | Used for | Loop | Length (exact) |
|---|---|---|---|---|
| `title.mp3` | `title` | Title screen | Loop | 60.0 s (18 bars at 72 BPM) |
| `map.mp3` | `map` | Meta map, walking İstiklal to Ataköy | Loop | 120.0 s (48 bars at 96 BPM) |
| `run_calm.mp3` | `run_calm` | Run music, low intensity (default) | Loop | 120.0 s (56 bars at 112 BPM) |
| `run_intense.mp3` | `run_intense` | Run music, high intensity layer | Loop | **same as run_calm** (120.0 s) |
| `boss.mp3` | `boss` | Boss encounters | Loop | 90.0 s (48 bars at 128 BPM) |
| `comic.mp3` | `comic` | Comic panels and dialogue (game ducks it by -9 dB while speech plays) | Loop | 90.0 s (30 bars at 80 BPM) |
| `victory.mp3` | `victory` | Level or chapter clear | **One shot** | 24.0 s (12 bars at 120 BPM) |
| `defeat.mp3` | `defeat` | Death or failed level | **One shot** | 24.0 s (8 bars at 80 BPM) |

Put the files in `prototype/audio/music/`, lower-case names, no spaces. Missing files fail silently: the game stays quiet and nothing crashes, so you can deliver the tracks one at a time.

## 2. How the game uses them

- `title`: plays on the title screen.
- `map`: plays on the meta map.
- `run_calm` + `run_intense`: play together for a run. Intensity (0 to 1) crossfades them with equal power. At 0 only the calm track is audible; at 1 only the intense one is. **Both files must have the same length, tempo, key and bar grid** or they will drift apart.
- `boss`: boss encounters. The boss intro sting plays first.
- `comic`: comic panels and dialogue. The game ducks it.
- `victory` / `defeat`: play once and stop. Do not loop them.

## 3. Musical direction

- **Istanbul flavour:** blend Turkish acoustic colour (bağlama/saz, darbuka, ney, kanun, zurna, clarinet in the Roman havası style) with modern cinematic synths and hybrid trap percussion (808 kick, hats, rim clicks).
- **Modes:** Hicaz / Hijaz colour (augmented second), Kürdî / Phrygian, and Rast-leaning major for victory. Keep melodies short and singable. Do not over-ornament.
- **Vocals:** instrumental only. If you use a choir pad, use wordless "aah". No recognisable words, no real-artist references in prompts.
- **Tone:** tense, lonely, a little magical. Not gory, not comic. Zombie-overrun Istanbul is the setting, not the subject.
- **Guardrails:** no political, religious or state imagery, no real brands or club crests.
- **Mix space:** keep 1 to 3 kHz relatively clear in every track so sound effects and dialogue read well on phone speakers.

## 4. Track briefs and Suno prompts

Each prompt is under 200 characters so it fits the style field. Generate, pick the best take, then edit to the exact length (see section 5).

### 4.1 `title`
- **Purpose:** the first impression. Quiet, eerie, an invitation to go out into the city.
- **Length:** 60.0 s loop. The first 8 s can be a solo ney intro.
- **BPM / key:** 72 BPM, D minor with Hijaz colour.
- **Mood:** lonely, mysterious, inviting.
- **Arrangement:** 0 to 8 s ney phrase over kanun harmonics. 8 to 20 s a warm analog pad and a bağlama arpeggio join. 20 s on, a muted darbuka heartbeat and a sub drone. Loop back to the ney.
- **Prompt A:** `Slow cinematic title theme, 72 BPM, D minor with Hijaz colour. Solo ney opening, warm analog pad, soft kanun harmonics, muted darbuka heartbeat. Eerie but inviting. Instrumental.`
- **Prompt B:** `Dark Istanbul night theme, 72 bpm, D minor. Ney and bağlama plucks over a detuned sub-bass pad, sparse rim clicks, cinematic tension, slow build. Instrumental, no vocals.`

### 4.2 `map`
- **Purpose:** a travelogue. The route from İstiklal to Ataköy should feel like a long walk home.
- **Length:** 120.0 s loop.
- **BPM / key:** 96 BPM in 4/4 with an aksak feel (darbuka accents in a 2-2-2-3 pattern), A minor with Hicaz colour.
- **Mood:** wistful, hopeful, a little restless.
- **Arrangement:** bağlama picking and a clarinet melody (Roman havası style) over the darbuka groove. Soft bass and light hats. A rising route motif in the middle eight, then it returns to the opening theme.
- **Prompt A:** `Walking through Istanbul, travelogue instrumental, 96 bpm, A minor with Hicaz feel. Bağlama picking, darbuka with aksak 2-2-2-3 accents, clarinet melody Roman havası style. Wistful. No vocals.`
- **Prompt B:** `Cinematic Turkish road theme, 96 bpm, A Hicaz. Ney lead, kanun arpeggios, modern synth strings, soft 808, light trap hats. Nostalgic, hopeful. Instrumental.`

### 4.3 `run_calm`
- **Purpose:** the default run loop. It must sit under gameplay, so no busy melody and no big drops.
- **Length:** 120.0 s loop (56 bars at 112 BPM, 4/4).
- **BPM / key:** 112 BPM, D minor.
- **Mood:** steady, urgent, slightly hypnotic.
- **Arrangement:** darbuka pulse (doum on beats 1 and 3, tek on the off-beats), 808 sub with a bass ostinato, bağlama stabs on the off-beats, a soft synth pad. A sparse ney motif every 8 bars. Keep dynamics flat.
- **Prompt A:** `Run music, 112 bpm, D minor. Darbuka pulse, 808 sub bass ostinato, bağlama stabs on off-beats, soft synth pad, sparse ney motif. Steady, urgent, hypnotic. Instrumental.`
- **Prompt B:** `Chase theme Istanbul, 112 bpm, D minor. Hybrid trap percussion with darbuka, plucked saz riffs, dark pad, flat dynamics, no drops. Instrumental, no vocals.`

### 4.4 `run_intense`
- **Purpose:** the high-intensity version of run_calm. The game crossfades to it when the screen gets crowded.
- **Length:** **exactly the same as run_calm** (120.0 s, 56 bars at 112 BPM, same key).
- **How to make it:** write it as "the same song, bigger". Keep run_calm's chord progression and bar grid, and add the extra layers: trap hat rolls, a zurna or high clarinet lead motif, a string ostinato, an 808 roll, and a rise into bar 49. The two tracks play together during the crossfade, so keep the melody and chords identical.
- **Prompt A:** `Intense chase version, 112 bpm, D minor. Same darbuka and bağlama groove, plus zurna lead motif, trap hat rolls, string ostinato, big 808 roll. Urgent, relentless. Instrumental.`
- **Prompt B:** `Frantic Istanbul run, 112 bpm, D minor. Trap hats, darbuka pulse, zurna melody, staccato strings, deep 808 bass. Intense, no vocals.`

### 4.5 `boss`
- **Purpose:** boss encounters. Heavy, dark and tense. The telegraphs need room.
- **Length:** 90.0 s loop (48 bars at 128 BPM).
- **BPM / key:** 128 BPM, F# Phrygian.
- **Mood:** ominous, massive, a ritual feel.
- **Arrangement:** kanun tremolo, a zurna lead, a deep 808 sub, wordless choir pads, a 2-step darbuka pattern with tek accents, dissonant strings.
- **Prompt A:** `Boss battle Istanbul, 128 bpm, F# Phrygian. Kanun tremolo, zurna lead, deep 808 sub, wordless choir pads, heavy darbuka, dissonant strings. Ominous, massive. Instrumental.`
- **Prompt B:** `Final-boss ritual theme, 128 bpm, F# minor. Massive 808 hits, darbuka ostinato, zurna screams, dark synth drone, tension risers. No vocals.`

### 4.6 `comic`
- **Purpose:** under comic panels and dialogue. It must never compete with voices.
- **Length:** 90.0 s loop (30 bars at 80 BPM).
- **BPM / key:** 80 BPM, E minor.
- **Mood:** intimate, reflective, sad or calm.
- **Arrangement:** ney solo and a soft kanun over a warm pad. No drums, or a very quiet heartbeat tap. Leave 1 to 3 kHz clear.
- **Target loudness:** -18 LUFS, since the game ducks it under dialogue.
- **Prompt A:** `Intimate dialogue bed, 80 bpm, E minor. Solo ney, soft kanun, warm pad, no drums, reflective. Instrumental, very quiet.`
- **Prompt B:** `Quiet Istanbul memory theme, 80 bpm, E minor. Ney and kanun, distant synth pad, slow, sparse, gentle. Instrumental.`

### 4.7 `victory`
- **Purpose:** level or chapter clear. One shot. It ends on a held tonic chord.
- **Length:** 24.0 s, no loop. Keep the final chord ringing for about 3 s.
- **BPM / key:** 120 BPM, D major with a Turkish flavour.
- **Mood:** triumphant and warm.
- **Arrangement:** darbuka roll into a bağlama strum, a clarinet Roman havası melody, tram-bell accents, a final chord with a reverb tail.
- **Prompt A:** `Victory fanfare Istanbul, 120 bpm, D major. Darbuka roll into bağlama strum, clarinet melody Roman havası style, tram bell accents, big ending chord. Triumphant. Instrumental.`
- **Prompt B:** `Level clear celebration, 120 bpm, D major. Darbuka rolls, saz strums, bright clarinet, cinematic brass hits, final sustained chord. Instrumental.`

### 4.8 `defeat`
- **Purpose:** death or a failed level. Soft and sad. One shot.
- **Length:** 24.0 s, no loop. End on a held D minor chord with a long tail.
- **BPM / key:** 80 BPM, D minor.
- **Mood:** loss, quiet resolve.
- **Arrangement:** a falling ney phrase, a descending kanun arpeggio, a low drone, a held chord.
- **Prompt A:** `Defeat theme, 80 bpm, D minor. Falling ney phrase, descending kanun arpeggio, low drone, sad and quiet, long reverb ending. Instrumental.`
- **Prompt B:** `Fallen hero theme Istanbul, 80 bpm, D minor. Ney solo, soft strings, distant darbuka, melancholic, ends on held chord. No vocals.`

## 5. Export checklist

1. **Format:** MP3, 192 kbps CBR, 44.1 kHz, stereo.
2. **Loudness:** integrated about -14 LUFS (±1 dB), true peak no higher than -1 dBTP. `comic` is the exception at -18 LUFS. Do not master louder than the target, because the game mixes music under effects.
3. **Exact length:** make the loop length match the table. Length in seconds = bars × 4 × 60 / BPM. Examples: 56 bars at 112 BPM = 120.0 s; 48 bars at 128 BPM = 90.0 s.
4. **Seamless loops** (title, map, run_calm, run_intense, boss, comic): trim to bar lines. No fade-in or fade-out at the loop points. Check the join by playing the end straight into the start in Audacity or your DAW. The game uses HTML audio looping, which can leave a short gap on some browsers. Keep the loop points on silence-free transients to hide it.
5. **Run pair:** run_calm and run_intense must start at the same point, have the same bar count and BPM, and share the key. Put them in one Suno project so the tempo grid matches.
6. **One-shots** (victory, defeat): end cleanly on the tonic. Long tails are fine.
7. **Names:** exactly the file names in section 1, in `prototype/audio/music/`.
8. **Audition:** open `prototype/tools/sfx-preview.html` and use the Music buttons. Also check the intensity slider on run_calm and the duck checkbox for `comic`.

## 6. Known limitations

- Suno output is not sample-accurate. Trim and time-stretch in your DAW to hit the exact lengths.
- If Suno's stem split is available on your plan, export stems for later layering. v0.4 does not use stems.
- The intensity crossfade uses two parallel players. A large tempo or length mismatch will make them drift.
