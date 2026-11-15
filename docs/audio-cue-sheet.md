# Audio cue sheet (prototype v0.5)

Owner: workstream A (SOUND). Code: `prototype/js/view/sfx-bank.js` (DSP primitives, layer helpers, ambience beds), `sfx-bank2.js` (cue recipes), `sfx.js` (runtime mix), `sfx-gen.js` (loader for the owner's generated files, D-063), `music.js` (music player).
Audition: open `prototype/tools/sfx-preview.html` (works over file://; click **Enable audio** first). Over http it also has a Generated / Synth switch.
Tools: `prototype/tools/render-sfx.js`, `prototype/tools/qa-sfx.js`, `prototype/tools/render-music.js`, `prototype/tools/prepare-music.js`, `prototype/tools/prepare-sfx.js` (see Tools below).

**Status: nobody has listened to this yet.** Every check in this sheet is numerical (QA harness, loudness, seams). The owner and lead need a listening pass before any of it is called done.

## What changed in v0.5

- **Rebuilt the most-heard cues** (earlier versions read as tonal beeps or noise-only hiss): XP `tink`, `coin`, `heal`, `magnet`, `star`, UI taps and menus, level and clear fanfares, chests, `dash`, melee `swish` / `stab` / `nail` / `cleaver` / `hammer`, `splat`, the booms, `glass`, `shutter`, the tram `bell`, the ferry horn, footsteps.
- **`hit` added.** Impact cue with five kinds (`body`, `blade`, `blunt`, `pierce`, `chain`). Each kind has its own click, body thump, crack or ring, and wet layer. Only one call site exists today (`skills-fx.js`, default kind `body`); the other kinds are ready for weapon hits.
- **`gem` removed.** It had no producer. Add it back when a rare-gem event exists.
- **Voices rebuilt** on a glottal engine (Rosenberg pulses with jitter, shimmer, creak, growl, drive, breath and formants): `groan`, `snarl`, `zombieDie`, `bruteRoar`, `bossDie`, `elite`, `hurt`, `crowdScream`. `cat` was rebuilt too but has no call site yet.
- **Mix:** voice and rate limits for crowds, a ducking pass under boss and comic speech, a master limiter, and `P.Sfx.setVolume(bus, v)` for volume control. The Settings sliders were not added (see Open items).
- **Music:** eight tracks (`audio/music/`), one per ID that `music.js` expects. Procedural placeholders for now; the owner's Suno tracks replace them through `prototype/tools/prepare-music.js` (D-062, proposed).

## Ground rules

- **No samples, no downloads.** Every synthesized SFX is made in code (`sfx-bank*.js`). The music is synthesized by `tools/render-music.js` as a placeholder. The one exception is the owner's AI-generated SFX files (D-063, see Generated SFX below), which replace the synthesized sound cue by cue. No other third-party audio is used anywhere.
- **D-029 ("code makes the SFX") holds for the synthesized SFX.** D-063 (proposed 2026-11-13) amends it for the generated cues: the kill, blast and impact sounds come from an AI sound tool, made from the prompts in `prototype/audio/sfx-gen/BRIEF.md`. For music, D-029 assigns the tracks to the owner's Suno workflow. The eight tracks here are procedural placeholders under the same IDs, so the owner's tracks can replace them without code changes. Recorded as D-062 (proposed 2026-11-13, owner approved the plan): the owner's files go in `prototype/audio/music-suno/`.

## How the sounds are made

- Pure sample-domain JavaScript, shared by the browser and Node. `sfx-bank.js` holds the primitives and layer helpers, `sfx-bank2.js` the recipes, and `sfx.js` runs at play time only. The tools load the same two bank files in a `vm` sandbox, so the QA and the masters come from the game's own code.
- **Modal synthesis:** glass rings are inharmonic partials with a beating twin (+0.35%). Karplus-Strong plucks have a DC blocker.
- **Band-limited saws** come from a cached 4096-entry wavetable. Used for brass, horn, zap, magnet, the chest creak and the boss drone.
- **Voices:** glottal source (Rosenberg pulses, jitter, shimmer, creak, growl AM, tanh drive, radiation tilt), aspiration noise low-passed at 2.6 kHz, and parallel band-pass formants with Q = F/B. Presets: `arda`, `anne`, `usta`, `friend`, `other`.
- **Layered impacts:** a snap transient, a body thump with a pitch drop, a crack, a wet AM squelch, and a ring. `boom` adds a brown-noise air blast.
- **Levels:** each cue has a design level (`db`: loudest 50 ms RMS) and a peak ceiling (`pk`, default -1.5 dBFS). Judge balance between cues, not single hits.
- **Variants:** 2 to 5 per cue, each with its own seeded RNG (pitch, partial detune, timing and noise jitter). The runtime avoids repeating the last variant.
- **Ambience beds:** five 8 s loops (`street`, `waterfront`, `bazaar`, `wind`, `night`). Each has a 0.5 s crossfade tail folded into the head, and is normalised to -26 dBFS RMS with a -4 dBFS peak ceiling.

## Runtime mix (`sfx.js`)

- **Buses:** `sfx` (combat and world), `ui`, `voice`, `ambience`, plus `music` and `master` for `setVolume`. Each cue has a reverb send (`r`) into a generated-impulse convolver. A DynamicsCompressor on the master acts as the limiter (threshold -4 dB, ratio 12).
- **Voice limits:** per-cue max concurrent (`max`) and a default minimum gap (`gap`, which callers can override). Global cap of 20 voices. When 12 or more are busy, priority 0 and 1 cues are dropped. At the cap, a new cue steals a lower-priority voice or is dropped.
- **Priority scale:** 4 = player hurt (never dropped first). 3 = boss, explosions, level and story stings. 2 = weapons, impacts, enemy vocals. 1 = UI and frequent feedback. 0 = constant pickups and ambient events (XP, footsteps, gulls).
- **Rate limits:** per cue, a maximum number of starts in a 100 ms window (for example `hit` 4, `tink` 6, `coin` 5). Across the impact family, at most 8 starts per 100 ms.
- **Pitch on rapid repeats:** `hit`, `splat`, `stab`, `tink`, `coin`, `nail` and `click` rise 2.5% per recent repeat (counted over 100 ms, up to four, so at most +10%).
- **Ducking:** `bossIntro` (2.4 s), `bossDie` (2.2 s), `bruteRoar` (1.7 s) and `speech` (0.35 s, re-triggered by each syllable) call `duck(sec)`. During a duck, ambience drops to -6 dB (`DUCK_AMB` = 0.5), priority 0 to 2 SFX start at -3 dB (`DUCK_MID` = 0.708), and music drops to -9 dB (`P.Music.duckFor`, `DUCK` = 0.355 in `music.js`). The brief asked for about 3 dB on ambience and music; the implemented depths are deeper than that. Both are constants, so one line each if the owner wants 3 dB.
- **Volume:** `P.Sfx.setVolume(bus, v)` with bus `sfx`, `ui`, `voice`, `ambience`, `music` or `master`. Settings is not touched; the Settings sliders need to call this.
- Everything obeys the "Sound effects" toggle (`P.Settings.sound`). Music has its own switch (`P.Settings.music`).
- **Generated files (`sfx-gen.js`, D-063):** when a cue has files in `prototype/audio/sfx-gen/ready/`, `P.Sfx` plays them in place of the synthesized recipe. Start-up fetches `manifest.json` and then the files, in idle time, short files first. Nothing plays or shows while this loads.
- **Round robin and jitter:** a cue with several takes plays them in turn (1, 2, 3, 1, ...). Each play is pitched up or down by up to 4%, so repeats do not sound identical.
- **Levels:** each file is set to its class level (impact, hit, voice, boss, ui; beds to -26 dBFS RMS) and then to the cue's design level from the table, so the balance tuned here holds. The peak ceiling, voice limits, ducking and priority are unchanged.
- **Memory:** generated cues are capped at 15.5 MB of decoded audio (a 48 kHz mono float32 estimate). A file over the cap keeps its synthesized sound. One ambience bed (at most 20 s, about 3.8 MB) decodes when its theme starts, and only the last one is kept. The total stays under 20 MB.
- **Fallback:** a missing, failed or unloadable file plays the synthesized recipe, with nothing logged or shown. The loader stays off on `file://` (the browser blocks the fetch) and with `?sfx=synth`, which forces the synthesized sounds for A/B.
- **Decode and unlock:** decoding needs no user gesture, so it starts at boot, using an offline context until the game's live context exists. Playback still waits for the existing iOS unlock (`P.Sfx.unlock`). Not checked on an iPhone yet.

## Generated SFX (D-063, proposed 2026-11-13)

The owner found the synthesized kill, blast and impact sounds poor on the phone (only the XP `tink` was judged pleasant). The owner generates those cues with an AI sound tool and drops the files in `prototype/audio/sfx-gen/`. Full prompts: `prototype/audio/sfx-gen/BRIEF.md`. Owner steps: `prototype/audio/sfx-gen/README.md`.

- **Scope:** the tool accepts 90 cue names (`--list` prints them, including the five hit kinds). Batches 1 to 4 in `BRIEF.md` cover 45 of them (12, 12, 12 and 9 cues), each with a take count and an exact prompt. The XP pickups `tink`, `coin`, `star` and `magnet` stay synthesized by decision. The other 41 get a brief in a later round. `speech` is not a file name and stays synthesized.
- **Batch 1 (12):** `hit_body`, `splat`, `swish`, `nail`, `hammer`, `zombieDie`, `groan`, `hurt`, `blast`, `boom`, `rocketBoom`, `level`.
- **Hit kinds:** only `hit_body` is played today, because the call site uses the default kind. The other four hit files stay dormant until weapon calls pass `kind` (see Open items).
- **Beds (optional):** five ambience loops (`amb_street`, `amb_waterfront`, `amb_bazaar`, `amb_wind`, `amb_night`), 8 to 20 s. The tool blends the last 0.5 s into the start, so each bed is exported 0.5 s longer than its loop.
- **Music** is unchanged and stays with Suno (D-062).
- **Tools:** `prepare-sfx.js` (ffmpeg, mirrors `prepare-music.js`) writes `ready/*.mp3` and `ready/manifest.json`; partial uploads are fine. `sfx-provenance.js` adds rows to `art/PROVENANCE.csv` and refuses without `--tool`, `--plan` and `--commercial-ok`. `test-sfx-gen.js` checks the brief against the bank, runs the loader in a sandbox, and runs the tool on synthetic files in the OS temp folder.
- **Status:** the loader, the tool and the tests are built. No owner file exists yet, so nothing generated has been heard in the game.

## Tools

- `node prototype/tools/render-sfx.js` renders every variant (348 files) to `prototype/audio/sfx/` as 44.1 kHz, 16-bit mono WAV, and writes `manifest.json` (cue, variant, design level, peak, LUFS, true peak). Options: `--no-master` (raw DSP output), `--only=tink,hit`, `--out=DIR`. Output is deterministic.
  - Mastering is an ffmpeg `alimiter` (ceiling about -1.5 dBFS) and PCM conversion. `loudnorm` runs in **measure-only** mode (`print_format=json`, not applied). A LUFS target would rebalance cues against their design levels: a gas-canister blast measured about -27 LUFS against a -15 dB design level, and a true-peak cap stops impulsive cues reaching a LUFS target.
  - The WAVs are git-ignored (`audio/sfx/.gitignore`). `manifest.json` is tracked. To get the WAVs, run `render-sfx.js`.
- `node prototype/tools/qa-sfx.js` runs QA on the DSP render. `--masters` checks the WAVs in `audio/sfx/`. `--only=NAME`, `--quiet`. It fails on NaN or Inf, clipped samples, silence, a duration over the limit, or identical variants (correlation above 0.995). It warns on DC offset, very quiet cues and similar variants (correlation 0.98 to 0.995). Writes `reports/sfx-qa.json` (git-ignored).
  - Last run (DSP render and masters): 348 variants, 87 cues, **0 fails**, 6 warnings: similar variants in `hit_body` (0 and 1), `stab` (1 and 2), `hammer` (1 and 2), and `chestDrop` (1, 2 and 3).
  - Masters peak between -16.4 and -2.8 dBFS.
- `node prototype/tools/render-music.js [id]` renders the eight tracks to `prototype/audio/music/*.mp3` (libmp3lame, 128 kbps). Loudness is set by ebur128 iteration to each track's target, and the loop seam is checked on the decoded MP3. Requires ffmpeg. About 60 s for all eight.
- `node prototype/tools/prepare-music.js [--dry-run] [--only=id,id] [--src=DIR] [--dst=DIR]` turns the owner's Suno files in `prototype/audio/music-suno/` into `prototype/audio/music/<id>.mp3` (see Music below). `node prototype/tools/test-music.js` checks the player's slot manifest and the files.
- `node prototype/tools/prepare-sfx.js [--dry-run] [--list] [--only=name,name] [--src=DIR] [--dst=DIR]` turns the owner's files in `prototype/audio/sfx-gen/` into `ready/*.mp3` and `ready/manifest.json`. It trims silence, sets each file to its loudness class, caps the peak at -1.5 dBFS, and rejects silent, over-long or misnamed files (listed, the rest are written). Exit code 1 when anything is rejected. Requires ffmpeg.
- `node prototype/tools/sfx-provenance.js --tool=... --plan=... --commercial-ok [--dry-run] [--csv=...] [--manifest=...]` adds one `art/PROVENANCE.csv` row per generated file that has none. It refuses without `--plan` and `--commercial-ok`, which confirm the tool's plan tier allows commercial use.
- `node prototype/tools/test-sfx-gen.js [--quick]` checks the brief against the bank, the loader in a vm sandbox, and the prepare tool on synthetic ffmpeg files (`--quick` skips the ffmpeg part). A warm full run takes about 10 s here. The first run after a cold start took about 4.5 minutes, because each ffmpeg and ffprobe launch was slow.
- `prototype/tools/sfx-preview.html`: category filters, variant stepper, a combat-second playback, the level-up sequence, the boss intro with ducking, a hit-kind selector, the ambience beds, the music tracks, a two-second duck test, volume sliders for each bus, and a Generated / Synth switch with a status line (files ready, loading, failed, over cap). The switch is live over http and shows "files off" over `file://`.

## Cue table

Columns: cue → where it is called from (first two call-site files; "none yet" means no call site) → what it sounds like and when → variants → priority · max concurrent · minimum gap (ms) · bus · reverb send · design level (dB, loudest 50 ms RMS). Status was checked against the call sites in `prototype/js`, not the old labels.

| Cue | Played from | Sound and when | Variants | P · max · gap · bus · reverb · design level |
|---|---|---|---|---|
| `click` | `main.js` | Non-XP pickup and door open. Plastic latch: 2.1 kHz modal tick, 3.4 kHz click, small thump. | 4 | P1 · max 4 · gap 30 · sfx · 0.02 · -22 dB |
| `hurt` | `main.js`, `coldopen.js` | Hero takes damage. Flesh thud, then Arda's breathy, rough "agh" with a falling pitch. | 4 | P4 · max 2 · gap 120 · sfx · 0.06 · -14 dB |
| `splat` | `main.js`, `enemies-fx.js` | Zombie killed. Wet thump, AM squelch at 420 Hz, spray tick, four falling bubble blops. | 5 | P2 · max 6 · gap 45 · sfx · 0.06 · -18 dB |
| `hit` | `skills-fx.js` | Impact on an enemy, per weapon class (kinds: body = tackle/stab hit, blade, blunt, pierce, chain). Click, body thump, crack or ring, wet layer per kind. | 4 × 5 kinds | P2 · max 6 · gap 35 · sfx · 0.06 · -17 dB |
| `combo` | `weapons-fx.js` | Kill-combo milestone. Darbuka tek, tek, doum and a bağlama pluck. | 4 | P2 · max 1 · gap 350 · sfx · 0.1 · -16 dB |
| `dash` | `skills-fx.js` | Arda dashes. Air whoosh 2.8 to 0.5 kHz, low thump, breathy "hup". | 4 | P2 · max 2 · gap 150 · sfx · 0.06 · -17 dB |
| `nearMiss` | `skills-fx.js` | Projectile passes close. Doppler whoosh and a falling zip. | 4 | P2 · max 2 · gap 200 · sfx · 0.1 · -19 dB |
| `ultReady` | `skills-fx.js` | Ultimate charged. Four plucks rising, glass shimmer at 1.76 kHz. | 3 | P2 · max 1 · gap 800 · sfx · 0.1 · -17 dB |
| `ult` | `skills-fx.js` | Ultimate activated. Rising whoosh, sub drop, brass hit, bell. | 3 | P3 · max 1 · gap 500 · sfx · 0.15 · -15 dB |
| `frenzy` | `skills-fx.js` | Frenzy starts. Tek roll with a growl vocal underneath. | 3 | P2 · max 1 · gap 900 · sfx · 0.1 · -15 dB |
| `evolve` | `skills-fx.js` | Weapon evolves. Seven glass rings rising, then a gong bell. | 3 | P3 · max 1 · gap 800 · sfx · 0.2 · -15 dB |
| `crit` | `weapons-fx4.js`, `weapons-fx.js` | Critical hit. Bright click, 1.9 kHz ring, low thump. | 4 | P2 · max 4 · gap 40 · sfx · 0.1 · -16 dB |
| `swish` | `enemies-fx-w1.js` | Hero knife swing. Air swish 1.3 to 3.6 kHz, metallic edge, whip tick. | 4 | P2 · max 4 · gap 60 · sfx · 0.08 · -17 dB |
| `stab` | `coldopen.js` | Knife into flesh. Edge tick, flesh thump, wet squelch. | 4 | P2 · max 6 · gap 50 · sfx · 0.08 · -17 dB |
| `nail` | `weapons-fx.js` | Nail gun fires. Air puff, pneumatic clack, thunk into wood. | 4 | P2 · max 4 · gap 70 · sfx · 0.08 · -16 dB |
| `nailStorm` | `weapons-fx.js` | Nailstorm evolution. Six nail shots with jitter and alternating loudness. | 4 | P2 · max 2 · gap 80 · sfx · 0.08 · -17 dB |
| `lob` | `events-fx.js`, `weapons-fx4.js` | Gas canister thrown. Whoosh and eight spinning metal clanks. | 4 | P2 · max 3 · gap 100 · sfx · 0.08 · -17 dB |
| `blast` | `weapons-fx.js` | Gas canister explodes. Sub boom, bang, brown-noise air blast, grit, debris clanks. | 4 | P3 · max 3 · gap 80 · sfx · 0.14 · -15 dB |
| `chain` | `weapons-fx4.js`, `weapons-fx.js` | Bike chain hits. Whirr and irregular chain-link clinks. | 4 | P2 · max 3 · gap 60 · sfx · 0.08 · -18 dB |
| `cleaver` | `weapons-fx4.js`, `enemies-fx.js` | Cleaver evolution. Heavy whoosh, blade ring and wood thunk at 160 ms, flesh thud. | 4 | P2 · max 2 · gap 120 · sfx · 0.1 · -15 dB |
| `hammer` | `weapons-fx2.js`, `enemies-fx.js` | Blunt hammer hits. Heavy body, crunch, crack, wood knock. | 4 | P2 · max 4 · gap 80 · sfx · 0.06 · -14 dB |
| `molotovThrow` | `weapons-fx2.js` | Molotov thrown. Whoosh and a bottle clink at 20 ms. | 4 | P2 · max 2 · gap 120 · sfx · 0.08 · -17 dB |
| `molotovBurst` | `weapons-fx2.js` | Molotov lands. Glass break, whomp, fire crackle. | 4 | P3 · max 2 · gap 200 · sfx · 0.14 · -14 dB |
| `burn` | `weapons-fx4.js`, `weapons-fx2.js` | Burning tick, damage over time. Sparse crackle over a rumble. Peak ceiling -6 dBFS. | 4 | P1 · max 3 · gap 200 · sfx · 0.05 · -22 dB · pk -6 |
| `rocketLaunch` | `weapons-fx2.js` | Rocket launch. Low rumble with a rising low-pass sweep. | 3 | P3 · max 1 · gap 500 · sfx · 0.18 · -14 dB |
| `rocketWhistle` | `weapons-fx2.js` | Rocket flight. FM whistle with AM hiss. | 3 | P2 · max 1 · gap 900 · sfx · 0.1 · -19 dB |
| `rocketBoom` | `weapons-fx2.js` | Rocket impact. Boom with a longer tail. | 4 | P3 · max 2 · gap 200 · sfx · 0.16 · -14 dB |
| `zap` | `weapons-fx4.js`, `weapons-fx3.js` | Cable arc. Band-limited saw buzz with electrical crackle. | 4 | P2 · max 3 · gap 80 · sfx · 0.1 · -17 dB · pk -4 |
| `spear` | `weapons-fx3.js` | Spear fired. Whoosh and tip modal. | 4 | P2 · max 3 · gap 80 · sfx · 0.08 · -18 dB |
| `spearPin` | `weapons-fx3.js` | Spear pins a target. Tick, flesh thud, ring. | 4 | P2 · max 4 · gap 80 · sfx · 0.06 · -16 dB |
| `extinguisher` | `weapons-fx3.js` | Extinguisher spray. AM hiss with crackle. | 3 | P1 · max 1 · gap 300 · sfx · 0.04 · -17 dB · pk -4 |
| `cyclone` | `weapons-fx3.js` | Cyclone evolution. Wind band with a low FM whoo. | 3 | P2 · max 1 · gap 800 · sfx · 0.2 · -18 dB |
| `cluster` | `weapons-fx.js` | Cluster explosion. Five thumps, crackle, clanks. | 4 | P3 · max 2 · gap 200 · sfx · 0.12 · -14 dB |
| `boom` | `main.js` | Explosion. Sub boom, bang, air blast, debris. | 4 | P3 · max 2 · gap 150 · sfx · 0.14 · -14 dB |
| `slam` | `main.js` | Comic title slam. Sub, click, low rumble, 1.18 kHz shimmer. | 3 | P2 · max 2 · gap 200 · ui · 0.1 · -14 dB |
| `shock` | `main.js`, `events-fx.js` | Level-up shockwave. Whomp and rising whoosh. | 3 | P3 · max 2 · gap 300 · sfx · 0.12 · -14 dB |
| `shutter` | `main.js`, `events-fx.js` | Shutter closes. Slat clacks over a rumble. | 3 | P1 · max 2 · gap 400 · sfx · 0.05 · -16 dB |
| `rattle` | `main.js`, `enemies-fx-w1.js` | Rattle, scattered clanks. | 4 | P1 · max 2 · gap 200 · sfx · 0.05 · -18 dB |
| `nosignal` | `main.js` | Story no-signal sting. Saturated tones over static. | 3 | P3 · max 1 · gap 700 · ui · 0.04 · -18 dB |
| `hiss` | `main.js`, `events-fx.js` | Cat hiss. Band-passed hiss with flutter. | 3 | P3 · max 1 · gap 600 · sfx · 0.04 · -19 dB |
| `gull` | `istanbul.js` | Seagull call, ambient. FM call with a nasal lift. | 4 | P0 · max 2 · gap 1500 · sfx · 0.12 · -20 dB |
| `glass` | `main.js`, `env-fx.js` | Glass prop breaks. Crunch, ring, falling shard tinks. | 4 | P2 · max 3 · gap 120 · sfx · 0.12 · -17 dB |
| `bell` | `main.js`, `events-fx.js` | Tram bell. Two strikes, inharmonic bronze partials. | 3 | P1 · max 2 · gap 300 · sfx · 0.2 · -18 dB |
| `doorSlam` | `main.js`, `weapons-fx4.js` | Door slams. Wood modes, thump, latch. | 3 | P2 · max 2 · gap 200 · sfx · 0.14 · -15 dB |
| `chestDrop` | `screens.js` | Chest drops. Wood knock and thump. | 4 | P2 · max 2 · gap 100 · sfx · 0.1 · -15 dB |
| `chestShake` | `events-fx.js`, `screens.js` | Chest shakes. Coin rattle. | 4 | P2 · max 2 · gap 200 · sfx · 0.06 · -17 dB |
| `chestOpen` | `screens.js` | Chest opens. Wood creak (band-limited saw through a moving band-pass) and glass sparkles. | 3 | P2 · max 1 · gap 500 · sfx · 0.12 · -16 dB |
| `coin` | `meta-ui.js`, `meta-gear.js` | Coin pickup. Plate ring with a bounce. | 4 | P0 · max 4 · gap 40 · sfx · 0.06 · -21 dB |
| `tink` | `main.js`, `events-fx.js` | XP pickup, the most frequent cue. Tea-glass tink: click and glass ring with a beating pair. The runtime raises the pitch on streaks. | 5 | P0 · max 4 · gap 25 · sfx · 0.06 · -21 dB |
| `pick` | `screens.js` | Card or item picked. Two glass rings and a tap. | 4 | P1 · max 3 · gap 60 · ui · 0.06 · -19 dB |
| `star` | `main.js`, `meta-ui.js` | Star collectible. Rising glockenspiel run and a shimmer. | 3 | P2 · max 2 · gap 200 · ui · 0.12 · -18 dB |
| `heal` | `skills-fx.js`, `barks.js` | Tea heals. Marimba arpeggio, triangle pad, airy sparkle. | 3 | P1 · max 2 · gap 300 · sfx · 0.12 · -19 dB |
| `magnet` | `skills-fx.js`, `progression.js` | XP magnet pulls. Rising whirr through a sweeping low-pass, arrival tick. | 3 | P1 · max 1 · gap 500 · sfx · 0.05 · -22 dB |
| `footstep` | `enemies-fx.js` | Hero footstep. Heel tick, grit and a stone knock. Quiet by design. | 5 | P0 · max 2 · gap 170 · sfx · 0.04 · -24 dB |
| `mapWalk` | `meta-ui.js` | Map walk step. Footstep at lower level. | 5 | P0 · max 2 · gap 200 · ui · 0.02 · -25 dB |
| `elite` | `main.js` | Elite spawns. Rough low grunt with growl, throat drive and a thump. | 3 | P3 · max 1 · gap 1200 · voice · 0.14 · -14 dB |
| `spit` | `enemies-fx-w1.js`, `enemies-fx.js` | Zombie spits. FM gurgle, bubbles, a "pff". | 4 | P1 · max 3 · gap 200 · sfx · 0.06 · -18 dB |
| `spitHit` | `weapons-fx4.js`, `enemies-fx.js` | Acid spit lands. Low splat, sizzle and drops. | 4 | P2 · max 3 · gap 120 · sfx · 0.1 · -17 dB |
| `bruteRoar` | `enemies-fx.js` | Brute roars. Growled roar with throat drive. Ducks ambience and music. | 3 | P3 · max 1 · gap 1500 · voice · 0.18 · -13 dB |
| `bruteStomp` | `enemies-fx.js` | Brute stomp. Thump and scattered debris. | 4 | P3 · max 2 · gap 300 · sfx · 0.12 · -14 dB |
| `bruteCharge` | `enemies-fx.js` | Brute charges. Stomps and a growl vocal. | 3 | P2 · max 1 · gap 800 · sfx · 0.1 · -16 dB |
| `bloaterSwell` | `enemies-fx.js` | Bloater swells. Rising triangle tone, bubbles, hiss. | 4 | P2 · max 2 · gap 400 · sfx · 0.1 · -17 dB |
| `bloaterPop` | `enemies-fx.js` | Bloater bursts. Pop thump, spray, hiss tail, bubbles. | 4 | P3 · max 2 · gap 200 · sfx · 0.1 · -15 dB |
| `bossIntro` | `enemies-fx.js` | Boss enters. Band-limited saw drone with a sub, doum rolls, two dissonant bells. Ducks ambience and music. | 3 | P3 · max 1 · gap 2000 · sfx · 0.2 · -13 dB |
| `bossDie` | `enemies-fx.js` | Boss dies. Long groan with throat drive and debris. Ducks ambience and music. | 3 | P3 · max 1 · gap 1500 · voice · 0.2 · -13 dB |
| `groan` | `events-fx.js`, `enemies-fx.js` | Zombie groan. Rough "oo" that opens to "ah" and sinks, exhale breath, creaky end. | 5 | P1 · max 6 · gap 350 · voice · 0.1 · -19 dB |
| `snarl` | `enemies-fx.js` | Zombie snarls. Growled trill with breath. | 4 | P2 · max 4 · gap 300 · voice · 0.08 · -16 dB |
| `zombieDie` | `enemies-fx.js` | Zombie dies. Falling creaky "uh" with breath, then bubbles. | 4 | P1 · max 4 · gap 150 · voice · 0.08 · -18 dB |
| `cat` | **none yet** | Cat. "Mi-ow" with the vowel gliding from ee to ah. | 4 | P2 · max 2 · gap 200 · voice · 0.1 · -18 dB |
| `hoodIntro` | `hood-card.js`, `comic.js` | Neighbourhood intro. Doum, tek, plucks, bell. | 3 | P2 · max 1 · gap 1000 · ui · 0.12 · -16 dB |
| `uiTap` | `meta-tree.js` | UI tap. Wood tock with a tick. | 4 | P1 · max 3 · gap 40 · ui · 0.02 · -23 dB |
| `uiBack` | `meta-ui.js` | UI back. Two falling taps. | 3 | P1 · max 3 · gap 50 · ui · 0.02 · -24 dB |
| `uiOpen` | `meta-ui.js` | Menu or panel opens. Rising fabric whoosh and a tap. | 3 | P1 · max 2 · gap 100 · ui · 0.04 · -23 dB |
| `nodeUnlock` | `meta-tree.js`, `meta-ui.js` | Map node unlocks. Clanks and a glass bell. | 3 | P1 · max 2 · gap 200 · ui · 0.1 · -19 dB |
| `gearEquip` | `meta-gear.js` | Gear equipped. Buckle snap and a rustle. | 3 | P1 · max 2 · gap 120 · ui · 0.05 · -21 dB |
| `comicPop` | `comic.js` | Comic balloon pops in. Whoosh and thump. | 3 | P1 · max 3 · gap 80 · ui · 0.04 · -23 dB |
| `comicPage` | `comic.js` | Comic page turns. Paper flutter. | 3 | P1 · max 2 · gap 300 · ui · 0.04 · -22 dB |
| `speech` | `comic.js` | Comic speech blip. One syllable per call; opts.voice picks arda, anne, usta, friend or other. Ducks music and SFX while it plays. | 5 × 5 voices | P1 · max 2 · gap 60 · voice · 0.03 · -21 dB |
| `phoneRing` | `comic.js` | Phone rings. Original ten-note ringtone in two passes, about 4.5 s. | 2 | P3 · max 1 · gap 2600 · sfx · 0.04 · -17 dB |
| `phoneBuzz` | `events-fx.js`, `comic.js` | Phone vibrates. Gated triangle buzz over low noise. | 3 | P2 · max 1 · gap 500 · ui · 0 · -20 dB |
| `levelClear` | `main.js` | Stage clear. Darbuka roll, brass chord (D Rast), bell shimmer, ney tail. | 3 | P3 · max 1 · gap 1500 · sfx · 0.16 · -14 dB |
| `levelFail` | `main.js` | Level failed. Three falling brass notes over a sub thump. | 3 | P3 · max 1 · gap 1500 · sfx · 0.12 · -14 dB |
| `level` | `main.js`, `meta-stats.js` | Level up. Doum, two teks, brass fanfare D-G-A, bell. | 3 | P3 · max 1 · gap 1000 · sfx · 0.12 · -15 dB |
| `crowdScream` | `events-fx.js`, `enemies-fx.js` | Distant crowd scream. Three high voices, staggered, with a roar. 2.6 s. | 3 | P2 · max 1 · gap 2000 · voice · 0.25 · -19 dB |
| `finale` | `weapons-fx4.js`, `weapons-fx2.js` | Evolution finisher. Roll, rising bell, brass chord, high wash. | 3 | P3 · max 1 · gap 1500 · sfx · 0.22 · -13 dB |
| `nazar` | `skills-fx.js` | Nazar charm dodge. Glass shimmer at 1.57 kHz. | 3 | P2 · max 2 · gap 250 · sfx · 0.2 · -17 dB |
| `ferryHorn` | `events-fx.js`, `skills-fx.js` | Ferry horn. Two detuned band-limited saws with a nasal formant. Slow onset. | 2 | P0 · max 1 · gap 6000 · sfx · 0.3 · -20 dB |

## Ambience beds (`P.Sfx.ambience`)

| Group | Themes (journey.js) | Layers |
|---|---|---|
| `street` | istiklal, galata, eminonu, sirkeci, beyazit, saray, halic, yedikule, bakirkoy, zeytinburnu | Pink murmur low-passed at 1.3 kHz with 3 and 7 cycle swells, 260 Hz traffic bed, two gulls and two dog barks |
| `waterfront` | karakoy, kumkapi, yenikapi, samatya, kazlicesme, sahil, marina | Surf: pink noise low-passed at 900 Hz with two wave swells, ripple hiss at 4.5 kHz, three gulls |
| `bazaar` | bazaar | Murmur band-passed at 900 Hz with 4 and 9 cycle swells, four distant metal clinks, 230 ms feedback echo |
| `wind` | bridge | Wind low-passed at 420 Hz with gusts, wire whistle (900 Hz ±250 Hz band-noise), 92 Hz cable hum, one distant gull |
| `night` | atakoy | 50 and 100 Hz building hum, muffled TV murmur, two distant dogs, one car pass (1.4 s Doppler sweep) |

Layer descriptions carry over from v0.4. Only the `street` bed was re-checked against the code; the other four still need that check. Each bed is 8 s with a 0.5 s crossfade tail, normalised to -26 dBFS RMS (-4 dBFS peak ceiling).

## Music (`prototype/audio/music/`: owner Suno tracks, procedural placeholders until they arrive)

Eight tracks, one per ID that `music.js` plays. The owner's Suno exports go in `prototype/audio/music-suno/` (briefs, prompts and the drop-folder rules are in its README). `prototype/tools/prepare-music.js` turns them into `prototype/audio/music/<id>.mp3`: MP3 192 kbps, 44.1 kHz, stereo, -16 LUFS integrated (two-pass `loudnorm`, true peak at or below -1.5 dBTP), exact length. A slot with no source keeps its placeholder. The first write copies the placeholders once to `prototype/audio/music-procedural/`. Partial uploads are fine. Decision: D-062 (proposed 2026-11-13; owner approved the plan).

| Slot | ID used by `music.js` | Tempo · bars | Length | Type | Level | Notes |
|---|---|---|---|---|---|---|
| Title | `title` | 72 BPM · 45 | 150 s (2:30) | loop | -16 LUFS | Title screen |
| Map | `map` | 96 BPM · 60 | 150 s (2:30) | loop | -16 LUFS | Meta map |
| Run, calm | `run_calm` | 112 BPM · 84 | 180 s (3:00) | loop | -16 LUFS | Run pair: same length, grid and key as `run_intense` |
| Run, intense | `run_intense` | 112 BPM · 84 | 180 s (3:00) | loop | -16 LUFS | Layer, crossfaded by `intensity()` |
| Boss | `boss` | 128 BPM · 96 | 180 s (3:00) | loop | -16 LUFS | Boss encounters |
| Comic | `comic` | 80 BPM · 40 | 120 s (2:00) | loop | -16 LUFS, trimmed -2 dB in `music.js` (-18 effective) | Ducked -9 dB under speech |
| Victory | `victory` | 120 BPM · 10 | 20 s | stinger, one shot | -16 LUFS | Not looped; 0.3 s fade-out |
| Defeat | `defeat` | 72 BPM · 6 | 20 s | stinger, one shot | -16 LUFS | Not looped; 0.3 s fade-out |

**Seams (prepared files).** Loops keep exactly their length. The source's last 1.5 s (the continuation of the music) is blended into the first 1.5 s with an equal-power crossfade, corrected for head-tail correlation (plain equal power would swell by up to +3 dB when the tail repeats the head). The tool reports, per loop, the crossfade level and the wrap step against the typical sample step (a ratio near 1 is a clean join). The `music.js` changes: per-track trim (`GAIN`), a finished one-shot replays on `play()` but not on a tap, and a track still fading out is not rewound when it is played again.

**Placeholders (procedural, `render-music.js`).** Still in `prototype/audio/music/` until the Suno tracks arrive. The numbers below are from the previous pass (decoded MP3, 128 kbps). The loop-seam fix (`loopEdges`: 10 ms fade-out, 2 ms fade-in) applies to them.

| Track | ID used by `music.js` | Tempo · bars | Length | Loop | Target | Join (decoded MP3) | 2 s level step (head minus tail) |
|---|---|---|---|---|---|---|---|
| Title | `title` | 72 BPM · 18 | 60.0 s | yes | -16 LUFS | 0.021 | -0.1 dB |
| Map | `map` | 96 BPM · 24 | 60.0 s | yes | -16 LUFS | 0.009 | +1.2 dB |
| Run, calm | `run_calm` | 112 BPM · 32 | 68.6 s | yes | -16 LUFS | 0.007 | -0.6 dB |
| Run, intense | `run_intense` | 112 BPM · 32 | 68.6 s | yes | -16 LUFS | 0.010 | +0.3 dB |
| Boss | `boss` | 128 BPM · 48 | 90.0 s | yes | -16 LUFS | 0.029 | **-4.7 dB** |
| Comic | `comic` | 80 BPM · 30 | 90.0 s | yes | -18 LUFS | 0.020 | -1.9 dB |
| Victory | `victory` | 120 BPM · 12 | 24.0 s | one-shot, 1.5 s fade | -15 LUFS | n/a | n/a |
| Defeat | `defeat` | 80 BPM · 8 | 24.0 s | one-shot, 1.5 s fade | -15 LUFS | n/a | n/a |

**Loop seams.** The WAV seam was the first thing to check. Before the fix, the boss track jumped 0.18 at its loop point and title 0.06 on the decoded MP3. The fix is a 10 ms cosine fade-out at each loop end and a 2 ms fade-in at each start (`loopEdges` in `render-music.js`). After it, the WAV step within 4 samples of the seam is 0.008 or less on all six loops, against a median sample step of 0.002 to 0.007. The loop now has a short dip once per cycle instead of a click. The cause of the original step was not traced; the fade covers it and does not remove it.

**Known music issues (placeholders; recheck the Suno tracks with the tool's numbers):**
- **Boss** loops from a quiet head to a loud tail (4.7 dB in the 2 s windows). The listener will hear that level change at each loop point. The fix is compositional: end the track at the head's level, or accept it.
- **Map and comic** have hot seam regions (seam RMS +4.2 dB and +5.8 dB against the track average), which I have not traced. Likely a downbeat transient at sample 0, but that is a guess.
- The MP3 join is a few times the median sample step. That is encoder residue, not a discontinuity, but it is not sample-exact.
- None of this has been listened to. The Suno tracks have not been listened to yet either: the tool's numbers are checks, not a listening pass.

## Known gaps and open items

**Gaps:**
- **Quality is by numbers, not by ear.** The QA harness shows every cue renders finite, non-silent, peak-safe, and that every variant differs. It does not show that anything sounds good.
- **Expect a synthetic character.** Voices, brass, the ferry horn, the bells and the music are all synthesized. The highest-risk cues for the "terrible Godot alerts" complaint are `level`, `levelClear`, `bell`, `ferryHorn`, `bossIntro` and `bossDie`; listen to those first.
- **`cat`** has a recipe but no call site.
- **`footstep`** is called only for the parkour enemy wind-up. The hero walk cycle is not wired.
- **`hit`** runs with the default `body` kind today. The other four kinds (`blade`, `blunt`, `pierce`, `chain`) are ready for weapon calls to pass as `kind`.
- **Loops:** `rocketWhistle`, `bruteCharge` and `cyclone` are one-shot buffers of 1 to 1.2 s. The caller loops them.
- **`speech`** is one syllable per call. The preview's "line" button simulates a six-syllable phrase.
- **Rendering** runs in JavaScript sample-domain code and is copied into AudioBuffers. It is not rendered through OfflineAudioContext, because AudioWorklet (which would need a module URL) is blocked on file://.

**Open items (owner and lead):**
1. **Listening pass** with the owner through `prototype/tools/sfx-preview.html`, starting with the cues listed above.
2. **Settings sliders:** add them in `settings.js` (not touched in this work) and call `P.Sfx.setVolume(bus, v)` for `sfx`, `ui`, `voice`, `ambience` and `music`.
3. **Ducking depths:** confirm -6 dB ambience and -9 dB music, or set 3 dB as the brief asked (`DUCK_AMB` in `sfx.js`, `DUCK` in `music.js`).
4. **Music decision:** recorded as D-062 (proposed) in `docs/product.md` §17: the procedural tracks are placeholders for the owner's Suno tracks. Still open: the Suno licence, plan tier and provenance log before any track ships (D-029, §15), and whether the owner keeps any procedural track.
5. **Boss track:** resolve the 4.7 dB head-to-tail step (compose the end to the head level, or accept it).
6. **Wiring:** pass `kind` on weapon `hit` calls; wire the hero walk cycle to `footstep`; give `cat` a call site.
7. **Comic speech ducking:** already in place. `comic.js` plays the `speech` cue on each syllable, and `speech` ducks through `duck(0.35)`. No change needed.
8. **Gem:** add back when a rare-gem event exists.
9. **Generated SFX (D-063, proposed):** the owner generates batch 1 (12 cues) first, then batches 2 to 4, and listens on the phone with the `?sfx=synth` A/B. Confirm the route, and that the XP pickup family stays synthesized. The 41 cues without a brief need a later round.
10. **Sound-tool licence:** write the plan tier down and run `sfx-provenance.js` with `--plan` and `--commercial-ok` before any generated file ships.
11. **iOS decode:** buffers decoded by the offline context and played on the live context are not checked on a device. A playback that throws drops the file and plays the synthesized sound. A playback that is silent without an error is not caught, so it needs the device check.

Runtime was exercised against a WebAudio stub: all 87 cues played without errors, and the per-cue rate caps held.

## Files

- Code: `prototype/js/view/sfx-bank.js`, `sfx-bank2.js`, `sfx.js`, `sfx-gen.js`, `music.js`
- Tools: `prototype/tools/render-sfx.js`, `qa-sfx.js`, `render-music.js`, `prepare-music.js`, `test-music.js`, `prepare-sfx.js`, `sfx-provenance.js`, `test-sfx-gen.js`, `lib-sfx.js`, `sfx-preview.html`
- Generated SFX: `prototype/audio/sfx-gen/` (`BRIEF.md`, `README.md`, `.gitignore`; the owner's source takes are git-ignored, `ready/` is tracked), provenance rows in `art/PROVENANCE.csv`
- Output: `prototype/audio/sfx/` (WAVs git-ignored, `manifest.json` tracked), `prototype/audio/music/` (MP3 and README)
- QA report: `reports/sfx-qa.json` (git-ignored)
