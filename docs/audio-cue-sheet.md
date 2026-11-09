# Audio cue sheet (prototype v0.4)

Owner: workstream A (SOUND). Code: `prototype/js/view/sfx-bank.js` (DSP primitives, layer helpers, ambience beds), `sfx-bank2.js` (cue recipes), `sfx.js` (runtime), `music.js` (tracks).
Audition: open `prototype/tools/sfx-preview.html` (works over file://; click **Enable audio** first).

## How the sounds are made

- **Everything is synthesized in code.** No samples, no downloads. Each cue is a recipe of layers built from a small DSP library: band-passed noise with moving centre, modal synthesis (inharmonic exponentially decaying partials), Karplus-Strong plucks, pitch-dropping sine bodies, formant voices (saw source through gliding band-passes with growl AM), FM, crackle, and darbuka hits.
- **Render once, play many.** A recipe renders to a mono buffer the first time a variant is needed (or in small steps after `P.Sfx.unlock()` for variant 0). `play()` only starts a buffer source. Nothing is synthesized per hit.
- **Variants.** Each cue has 2 to 5 variants. Every variant uses its own seeded RNG (pitch ±6%, partial detune, timing and noise jitter), and the runtime avoids repeating the last variant.
- **Loudness.** Each cue is normalised to a target level on its loudest 50 ms RMS (`db` column in the code), with a per-cue peak ceiling (-1.5 dBFS, lower for crackle). Impulsive and sustained cues therefore sit at comparable loudness. Judge balance between cues, not single hits.
- **Buses.** `sfx` (combat and world), `ui` (menus, comic, map, nosignal), `voice` (vocal cues), `ambience` (beds). Each bus feeds a DynamicsCompressor then the master. Each cue has a reverb send (`r` in the code) into a generated-impulse ConvolverNode.
- **Voice limits.** Per-cue max concurrent (`max`), a default min gap (`gap`, overridable by the caller's `minGap`), a global cap of 20 voices, and priority: when 12 or more voices are active, priority 0 and 1 cues are dropped; at the cap, a new cue steals a lower-priority voice or is dropped.
- **Priority scale.** 4 = player hurt (never dropped first). 3 = boss, explosions, story stings, level fanfares. 2 = player weapons, impacts, enemy vocals. 1 = UI and frequent feedback. 0 = ambient events and pickups that fire constantly (XP, footsteps, gulls).
- **Ambience beds.** Five seamless 8 s loops (`street`, `waterfront`, `bazaar`, `wind`, `night`), crossfaded by `P.Sfx.ambience(themeId)`. Theme mapping is in `sfx.js` (`GROUP_OF`).
- **Settings.** Everything obeys the "Sound effects" toggle (`P.Settings.sound`). Music has its own switch (`P.Settings.music`).

Bus and reverb values are the defaults in `sfx.js` and the `c` / `r` fields in `sfx-bank2.js`.

## Cue table

Columns: name → when it plays → design recipe (layers) → variants → priority / limit.
"Today" means a call site already exists in `js/main.js` or a view file. Other cues are "planned" for the owning workstream.
Limit format: `P<prio> · max <concurrent> · gap <ms> · bus · reverb`.

| Cue | When it plays | Design recipe (layers) | Variants | Priority / limit |
|---|---|---|---|---|
| `click` | Non-XP pickup (today, `main.js` pickup); door open (today) | Plastic latch: three modal partials (ratios 1 / 1.52 / 2.4 at 2.1 kHz, 8 ms ring) plus a 2 ms 3.5 kHz band-passed noise tick | 4 | P1 · max 4 · gap 30 · sfx · 0.02 |
| `hurt` | Hero takes damage (today, `heroHit`) | Flesh thud (sine 170 to 55 Hz drop) plus a 520 Hz wet squelch, then Arda's "agh": a formant grunt at 230 to 150 Hz through 800 / 1250 / 2550 Hz band-passes, 15 ms later | 4 | P4 · max 2 · gap 120 · sfx · 0.06 |
| `splat` | Zombie killed (today, `kill`) | Thud (140 to 60 Hz) plus 420 Hz band-passed wet squelch and four falling bubble blops | 5 | P2 · max 6 · gap 45 · sfx · 0.06 |
| `combo` | Kill-combo milestone (today, `weapons-fx.js`) | Darbuka tek, tek (+4%), doum on the offbeat, with a bağlama pluck (660 Hz Karplus-Strong) | 4 | P2 · max 1 · gap 350 · sfx · 0.1 |
| `dash` | Arda dashes (planned, skill) | 2.8 to 0.5 kHz band-passed whoosh plus Arda's "hup!" formant burst (260 to 190 Hz, 140 ms) | 4 | P2 · max 2 · gap 150 · sfx · 0.06 |
| `nearMiss` | Projectile passes close to the hero (planned) | Doppler whoosh 3.8 to 0.9 kHz (Q 2) plus a falling sine zip 1.8 to 0.95 kHz | 4 | P2 · max 2 · gap 200 · sfx · 0.1 |
| `ultReady` | Ultimate charged (planned) | Four Karplus-Strong plucks D5 / F#5 / A5 / D6 rising 90 ms apart, then a bell shimmer at 1.76 kHz | 3 | P2 · max 1 · gap 800 · sfx · 0.1 |
| `ult` | Ultimate activated (planned) | Rising noise sweep 0.3 to 3 kHz, sub drop 70 to 35 Hz, bell at 880 Hz at 0.35 s | 3 | P3 · max 1 · gap 500 · sfx · 0.15 |
| `frenzy` | Frenzy mode starts (planned) | Accelerating tek roll (7 hits, gap 110 ms shrinking), doum at 0.66 s, growl formant underneath | 3 | P2 · max 1 · gap 900 · sfx · 0.1 |
| `evolve` | Weapon evolves (planned) | Seven rising bells (392 to 812 Hz, 50 ms apart), then a 98 Hz gong bell | 3 | P3 · max 1 · gap 800 · sfx · 0.2 |
| `crit` | Critical hit (planned) | High-passed crack (12 ms) plus a 1.9 kHz inharmonic ring plus a 230 to 90 Hz thump | 4 | P2 · max 4 · gap 40 · sfx · 0.1 |
| `swish` | Hero knife swing (today, `swing`) | Band-passed whoosh 1.3 to 3.6 kHz (Q 1.1, peak at 35%) plus a metallic edge: 2.4 kHz modal (1 / 2.76 / 5.4) at 50 ms | 4 | P2 · max 4 · gap 60 · sfx · 0.08 |
| `stab` | Knife into flesh (today, cold open) | 4.2 kHz slide tick, flesh thud 210 to 70 Hz, 480 Hz wet squelch | 4 | P2 · max 6 · gap 50 · sfx · 0.08 |
| `nail` | Nail gun fires (today, `nailFire`) | Air hiss (high-pass 3.8 kHz, 18 ms decay), mechanical clack at 12 ms (modal 2.3 kHz), thunk 260 to 90 Hz | 4 | P2 · max 4 · gap 70 · sfx · 0.08 |
| `nailStorm` | Nailstorm evolution (planned) | Six nailShots 42 ms apart with ±8 ms jitter and alternating loudness | 4 | P2 · max 2 · gap 80 · sfx · 0.08 |
| `lob` | Gas canister thrown (today, `canisterThrow`) | Whoosh 420 to 1500 Hz plus eight spinning metal clanks (620 Hz ±10%) every ~60 ms | 4 | P2 · max 3 · gap 100 · sfx · 0.08 |
| `blast` | Gas canister explodes (today, `blast`) | Sub boom 95 to 32 Hz (0.3 s decay), crackle 260/s, 900 Hz low tail (0.9 s), five debris clanks | 4 | P3 · max 3 · gap 80 · sfx · 0.14 |
| `chain` | Bike chain hits (today, `hit` src chain) | 38 Hz amplitude-flutter band-noise whirr at 2.6 kHz plus eight chain-link clinks at irregular 15 to 30 ms spacing (1.75 kHz ±20%) | 4 | P2 · max 3 · gap 60 · sfx · 0.08 |
| `cleaver` | Cleaver evolution (planned) | Heavy whoosh 0.6 to 2.6 kHz, then a blade clang on wood at 160 ms (520 Hz modal), flesh thud at 170 ms | 4 | P2 · max 2 · gap 120 · sfx · 0.1 |
| `hammer` | Blunt hammer hits (planned) | Thump 130 to 42 Hz, 900 Hz crunch noise (50 ms), bone crackle (120/s), 260 Hz wood modal | 4 | P2 · max 4 · gap 80 · sfx · 0.06 |
| `molotovThrow` | Molotov bottle thrown (planned) | Whoosh 300 to 1400 Hz (0.35 s) plus a 3 kHz bottle clink at 20 ms | 4 | P2 · max 2 · gap 120 · sfx · 0.08 |
| `molotovBurst` | Molotov lands (planned) | Glass break (3.3 kHz cluster and shards) plus whoomp 100 to 40 Hz plus fire (crackle 140/s with rumble) | 4 | P3 · max 2 · gap 200 · sfx · 0.14 |
| `burn` | Burning tick, damage over time (planned) | Fire: sparse crackle 180/s over a 220 Hz rumble, 0.5 s. Peak ceiling -6 dBFS | 4 | P1 · max 3 · gap 200 · sfx · 0.05 |
| `rocketLaunch` | Rocket ignites (planned) | Low-passed roar (380 to 900 Hz sweep, 150 ms attack), 2.5 kHz hiss, thump 90 to 35 Hz | 3 | P3 · max 1 · gap 500 · sfx · 0.18 |
| `rocketWhistle` | Rocket in flight, looped by the caller (planned) | FM whistle carrier 900 to 2100 Hz (index 0.6, 16 Hz modulator) plus 14 Hz tremolo band-noise at 3 kHz | 3 | P2 · max 1 · gap 900 · sfx · 0.1 |
| `rocketBoom` | Rocket impact (planned) | Boom layers as `blast`, 1.3 s, bigger tail and more debris | 4 | P3 · max 2 · gap 200 · sfx · 0.16 |
| `zap` | Electric arc, shock weapon (planned) | 118 Hz saw with a slow random-walk pitch wander (±5%), band-passed at 1.4 kHz, 120 ms decay, plus crackle 500/s. Peak ceiling -4 dBFS | 4 | P2 · max 3 · gap 80 · sfx · 0.1 |
| `spear` | Spear thrown (planned) | Whoosh 700 to 2400 Hz (Q 1.3) plus a 1.8 kHz metal thwip | 4 | P2 · max 3 · gap 80 · sfx · 0.08 |
| `spearPin` | Spear pins a target (planned) | 2.2 kHz metal tip tick, flesh thud (scaled), 1.2 kHz shaft ring | 4 | P2 · max 4 · gap 80 · sfx · 0.06 |
| `extinguisher` | Fire extinguisher discharges (planned) | Band-passed hiss 1.4 to 2.8 to 1.6 kHz with 14 Hz sputter and crackle 60/s. Peak ceiling -4 dBFS | 3 | P1 · max 1 · gap 300 · sfx · 0.04 |
| `cyclone` | Cyclone evolution, looped while active (planned) | 1.2 s wind: band-passed noise 400 to 1800 to 500 Hz, 6 Hz AM, plus FM whoo 160 to 260 Hz, ADSR swell | 3 | P2 · max 1 · gap 800 · sfx · 0.2 |
| `cluster` | Cluster bomb evolution (planned) | Five mini thumps (150 to 210 Hz) at random times, crackle 300/s, three small clanks | 4 | P3 · max 2 · gap 200 · sfx · 0.12 |
| `boom` | Generic explosion, scaffold collapse (today, `explode`, `scaffold`) | Sub boom 95 to 32 Hz (0.45 s decay), crackle 260/s, 900 Hz tail (1.2 s), debris clanks | 4 | P3 · max 2 · gap 150 · sfx · 0.14 |
| `slam` | Comic title slam (today, `slam`) | Sub 120 to 38 Hz plus high-passed click, 520 Hz low-passed rumble (0.35 s) and a 1.18 kHz modal shimmer | 3 | P2 · max 2 · gap 200 · ui · 0.1 |
| `shock` | Level-up shockwave (today, `shockwave`) | Whoomp 110 to 42 Hz (0.32 s decay) plus a 0.6 s upward band-passed whoosh 250 to 2200 Hz | 3 | P3 · max 2 · gap 300 · sfx · 0.12 |
| `shutter` | Roller shutter, hold starts (today, `holdStart`) | 16 slat clanks (780 Hz ±60%, irregular) over 1.1 s, plus 16 Hz AM band-noise rolling at 700 Hz | 3 | P1 · max 2 · gap 400 · sfx · 0.05 |
| `rattle` | Tin rattle after a cat hiss (today, `catHiss`) | Seven random metal clanks (600 Hz ±80%) over 0.6 s plus a 2.4 kHz scrape | 4 | P1 · max 2 · gap 200 · sfx · 0.05 |
| `nosignal` | Phone disconnect (today, `nosignal`) | Intercept tones 950, 1400, 1800 Hz (260 ms each, 300 ms apart), 425 Hz dead-line tone, 0.2 s static | 3 | P3 · max 1 · gap 700 · ui · 0.04 |
| `hiss` | Cat hiss (today, `catHiss`) | Band-passed hiss 5.2 to 6.8 to 4.3 kHz with 23 Hz flutter, plus a 2 kHz high-passed onset burst | 3 | P3 · max 1 · gap 600 · sfx · 0.04 |
| `gull` | Seagull call, ambient (today, `istanbul.js`) | FM carrier 1.25 to 1.95 to 1.1 kHz with two humps (0.11 s, 0.36 s) plus a nasal 2.3 kHz band-pass lift | 4 | P0 · max 2 · gap 1500 · sfx · 0.12 |
| `glass` | Prop breaks (today, `propBreak`) | Six-partial inharmonic cluster at 3.3 kHz (decays 5 to 50 ms), 3.5 kHz crunch, 20 random shards (2.8 to 7.3 kHz) | 4 | P2 · max 3 · gap 120 · sfx · 0.12 |
| `bell` | Tram bell, shutter opens (today, `shutterOpen`) | Bronze bell: eight inharmonic partials (0.5 / 1 / 1.19 / 1.5 / 2.0 / 2.74 / 3 / 4.07), decays 0.25 to 2.6 s, at 1.24 kHz, struck twice 0.36 s apart | 3 | P1 · max 2 · gap 300 · sfx · 0.2 |
| `doorSlam` | Door slams (planned) | Wood modes at 120 Hz (1 / 1.6 / 2.9 / 4.4), 110 to 45 Hz thump, latch click at 110 ms, low-passed room tail | 3 | P2 · max 2 · gap 200 · sfx · 0.14 |
| `chestDrop` | Wooden chest drops (today, `chestDrop`) | Wood modes at 165 Hz (1 / 1.58 / 2.42 / 3.9, 90 ms decay), 110 to 48 Hz thump, 420 Hz bang | 4 | P2 · max 2 · gap 100 · sfx · 0.1 |
| `chestShake` | Padlock rattles (today, `chestShake`) | Nine small clanks (1.3 kHz ±12%) over 0.42 s plus a 10 Hz AM hinge noise at 2.3 kHz | 4 | P2 · max 2 · gap 200 · sfx · 0.06 |
| `chestOpen` | Chest opens (today, `chestOpen`) | Creak: saw 120 to 190 to 140 Hz through a moving band-pass 450 to 800 to 400 Hz with 7 Hz AM, then eight sparkle bells (2.4 to 4.4 kHz) from 0.3 s | 3 | P2 · max 1 · gap 500 · sfx · 0.12 |
| `coin` | Coin pickup (planned) | Two coin hits: modal 2.35 kHz and 3.1 kHz (ratios 1 / 2.11 / 3.9), 45 ms apart | 4 | P0 · max 4 · gap 40 · sfx · 0.06 |
| `tink` | XP gem pickup (today, `pickup` kind xp) | Glass modal 2.9 kHz (1 / 2.02 / 3.9 / 5.4, decays 50 to 12 ms) plus a 6 kHz tick. Runtime raises pitch 3.5% per quick repeat (streak to 12) | 5 | P0 · max 4 · gap 25 · sfx · 0.06 |
| `gem` | Gem pickup, alternate timbre (planned) | Warm chime modal 1.48 kHz (1 / 2 / 3 / 4.2, first decay 90 ms) | 5 | P0 · max 4 · gap 30 · sfx · 0.08 |
| `pick` | Card or item chosen (today, screens) | Two bells at 1.05 kHz and 1.57 kHz (70 ms apart) plus a 900 Hz wood tap | 4 | P1 · max 3 · gap 60 · ui · 0.06 |
| `star` | Star earned on level end (planned) | Three Karplus-Strong plucks G5 / B5 / D6 (100 ms apart) plus a 1.57 kHz bell sparkle at 200 ms | 3 | P2 · max 2 · gap 200 · ui · 0.12 |
| `heal` | Hero heals (planned) | Three Karplus-Strong plucks C5 / E5 / G5 (80 ms steps) plus a soft 523 Hz sine pad with a 250 ms attack | 3 | P1 · max 2 · gap 300 · sfx · 0.12 |
| `magnet` | XP magnet pulls gems (planned) | Sine sweep 380 to 1500 to 1100 Hz with 30 Hz tremolo, plus band-passed "suck" noise 600 to 2000 Hz | 3 | P1 · max 1 · gap 500 · sfx · 0.05 |
| `footstep` | Hero footstep (planned, walk cycle) | Heel tick (band-pass 2 kHz, 12 ms) plus stone knock modal 540 Hz (1 / 1.9 / 3.1). Quiet by design | 5 | P0 · max 2 · gap 170 · sfx · 0.04 |
| `mapWalk` | Arda walks the map route (planned) | Footstep at 1.2× pitch, 0.6 gain | 5 | P0 · max 2 · gap 200 · ui · 0.02 |
| `elite` | Elite zombie spawns (today, `eliteSpawn`) | Formant roar (other preset, 130 to 165 to 85 Hz, growl 26 Hz) plus an 80 to 36 Hz thump | 3 | P3 · max 1 · gap 1200 · voice · 0.14 |
| `spit` | Zombie spits (planned, spitter) | FM gurgle 220 to 150 to 260 Hz, bubbles, 1.5 kHz band-passed "pff" at 80 ms | 4 | P1 · max 3 · gap 200 · sfx · 0.06 |
| `spitHit` | Acid spit lands (planned) | 1.8 kHz low-passed splat, 5.2 kHz high-passed sizzle (160 ms), three drops | 4 | P2 · max 3 · gap 120 · sfx · 0.1 |
| `bruteRoar` | Brute roars (planned) | Formant roar 88 to 118 to 96 to 70 Hz (growl 22 Hz, depth 0.8), breath band-noise 1.2 kHz, 60 to 34 Hz thump. 1.7 s | 3 | P3 · max 1 · gap 1500 · voice · 0.18 |
| `bruteStomp` | Brute stomps (planned) | Sub 85 to 28 Hz (0.3 s decay), 800 Hz crumble, seven pebble clanks | 4 | P3 · max 2 · gap 300 · sfx · 0.12 |
| `bruteCharge` | Brute charges, looped by the caller (planned) | Four accelerating stomps (0.12 to 0.72 s), 110 Hz low-passed rumble, usta growl 110 to 90 Hz | 3 | P2 · max 1 · gap 800 · sfx · 0.1 |
| `bloaterSwell` | Bloater inflates (planned) | Triangle 70 to 150 Hz with rising amplitude, nine 260 Hz bubbles, 700 Hz air band-noise | 4 | P2 · max 2 · gap 400 · sfx · 0.1 |
| `bloaterPop` | Bloater bursts (planned) | Pop thump 260 to 70 Hz, 1.4 kHz spray, 2.4 kHz high-passed hiss tail (0.35 s), six bubbles | 4 | P3 · max 2 · gap 200 · sfx · 0.1 |
| `bossIntro` | Boss enters (planned) | Saw drone 55 Hz (low-pass sweep 250 to 700 to 300 Hz), three doum, tek, doum at 1.5 s, dissonant bells 233 and 277 Hz | 3 | P3 · max 1 · gap 2000 · sfx · 0.2 |
| `bossDie` | Boss dies (planned) | Usta death groan 120 to 70 to 50 Hz (formant slide, growl 12 Hz, 2.2 s) plus collapse thump 80 to 30 Hz at 0.8 s and eight debris clanks | 3 | P3 · max 1 · gap 1500 · voice · 0.2 |
| `groan` | Zombie groan, ambient (planned) | Other-preset vocal 118 to 104 to 92 Hz with 19 Hz growl, formant glide, 0.95 s envelope | 5 | P1 · max 6 · gap 350 · voice · 0.1 |
| `snarl` | Zombie snarls (planned) | Other-preset vocal 160 to 140 to 120 Hz, growl 28 Hz at depth 0.85, high-passed breath | 4 | P2 · max 4 · gap 300 · voice · 0.08 |
| `zombieDie` | Zombie death moan (planned) | Vocal 200 to 110 to 80 Hz with decaying envelope, plus six bubbles at 0.3 s | 4 | P1 · max 4 · gap 150 · voice · 0.08 |
| `crowdScream` | Distant crowd scream (planned) | Three formant voices (260 to 520 Hz base, pitch glides, growl) staggered 0 to 0.3 s, plus a 2.2 kHz band-passed roar. 2.6 s | 3 | P2 · max 1 · gap 2000 · voice · 0.25 |
| `uiTap` | Button tap (planned, UI) | Soft wood tap 880 Hz (two partials) plus a 3.8 kHz click | 4 | P1 · max 3 · gap 40 · ui · 0.02 |
| `uiBack` | Back button (planned, UI) | Two taps 660 Hz then 470 Hz, 50 ms apart | 3 | P1 · max 3 · gap 50 · ui · 0.02 |
| `uiOpen` | Menu or panel opens (planned, UI) | Upward band-passed whoosh 500 to 1800 Hz plus 60 Hz AM paper flutter at 3.5 kHz | 3 | P1 · max 2 · gap 100 · ui · 0.04 |
| `nodeUnlock` | Map node unlocked (planned, meta) | Two lock clanks (1.45 kHz) at 0 and 120 ms, bell 1.32 kHz at 220 ms | 3 | P1 · max 2 · gap 200 · ui · 0.1 |
| `gearEquip` | Gear equipped (planned, meta) | Buckle snap (modal 1.9 kHz), cloth rustle (band-passed 1.6 kHz, 30 ms attack), metal tick at 80 ms | 3 | P1 · max 2 · gap 120 · ui · 0.05 |
| `comicPop` | Comic panel pops in (planned, story) | Upward paper whoosh 2 to 5 kHz (0.1 s) plus a soft 220 Hz thump at 60 ms | 3 | P1 · max 3 · gap 80 · ui · 0.04 |
| `comicPage` | Comic page turns (planned, story) | Paper rustle: 2.6 kHz band-noise with 42 Hz AM (0.5 s, attack 80 ms), soft 180 Hz thump at 0.36 s | 3 | P1 · max 2 · gap 300 · ui · 0.04 |
| `speech` | One character of dialogue typed (planned, story) | One 100 ms syllable: formant vowel from the speaker preset (`opts.voice`: arda, anne, usta, friend, other) with a random pitch contour, plus a 2.6 kHz consonant click | 5 per voice (5 voices) | P1 · max 2 · gap 60 · voice · 0.03 |
| `phoneRing` | Phone rings (planned, story) | Original ten-note ringtone (two passes, about 4.5 s) in soft triangle tones | 2 | P3 · max 1 · gap 2600 · sfx · 0.04 |
| `phoneBuzz` | Phone vibrates (planned, story) | Gated 170 Hz triangle buzz plus 300 Hz low-passed noise, two pulses of 0.4 s | 3 | P2 · max 1 · gap 500 · ui · 0 |
| `levelClear` | Level cleared (planned, flow) | Tek roll (8) plus doum, bağlama strum (146.8 to 440 Hz Karplus-Strong, 30 ms steps), ney note 587 Hz (1.1 s). 2.4 s | 3 | P3 · max 1 · gap 1500 · sfx · 0.16 |
| `levelFail` | Level failed (planned, flow) | Ney notes A4 to G4 to D4 (0.55 s steps) plus a 90 to 40 Hz thump at 1.1 s | 3 | P3 · max 1 · gap 1500 · sfx · 0.12 |
| `level` | Level-up fanfare (today, `levelup`) | Doum, two tek, Karplus-Strong plucks D4 / A4 / D5 / F#5 (110 ms steps) and a 587 Hz bell at 0.5 s | 3 | P3 · max 1 · gap 1000 · sfx · 0.12 |
| `hoodIntro` | Neighbourhood sting on entering a hood (planned, flow) | Doum, two tek, doum, Karplus-Strong plucks G4 / C5 / D5 / G5, tram bell 1.24 kHz at 0.9 s | 3 | P2 · max 1 · gap 1000 · ui · 0.12 |
| `finale` | Evolution or boss-finale stinger (planned, flow) | Accelerating tek roll (10), doum and a 1.17 kHz bell, four bağlama plucks, 6 kHz high-passed wash. 2.6 s | 3 | P3 · max 1 · gap 1500 · sfx · 0.22 |

## Ambience beds (`P.Sfx.ambience`)

| Group | Themes (journey.js) | Layers |
|---|---|---|
| `street` | istiklal, galata, eminonu, sirkeci, beyazit, laleli, aksaray, yedikule, bakirkoy, zeytinburnu | Pink murmur low-passed at 1.3 kHz with 3 and 7 cycle swells, 260 Hz traffic bed, two gulls and two dog barks |
| `waterfront` | karakoy, kumkapi, yenikapi, samatya, kazlicesme, sahil, marina | Surf: pink noise low-passed at 900 Hz with two wave swells, ripple hiss at 4.5 kHz, three gulls |
| `bazaar` | bazaar | Murmur band-passed at 900 Hz with 4 and 9 cycle swells, four distant metal clinks, 230 ms feedback echo |
| `wind` | bridge | Wind low-passed at 420 Hz with gusts, wire whistle (900 Hz ±250 Hz band-noise), 92 Hz cable hum, one distant gull |
| `night` | atakoy | 50 and 100 Hz building hum, muffled TV murmur, two distant dogs, one car pass (1.4 s Doppler sweep) |

Every bed is 8 s, loops seamlessly (the 0.5 s tail is crossfaded into the head), and is normalised to -26 dBFS RMS on the `ambience` bus.

## Known gaps and tuning notes

- Quality is judged by ear. The Node QA harness confirms every cue renders finite, non-silent, peak-safe audio and that every variant differs. Listening pass with the owner and lead is still required.
- Cues with a pitch wander (`zap`, the vocals) and the ambience beds are the most likely to need tuning.
- `phoneRing` is an original melody, not a copy of a known tune. The lead chooses the call rhythm.
- Loops (`rocketWhistle`, `bruteCharge`, `cyclone`) are one-shot 1 to 1.2 s buffers. Looping is the caller's job (or a later change).
- `speech` is one syllable per call. The preview's "line" button simulates a six-syllable phrase.
- Rendering runs in JS sample-domain code and is copied into AudioBuffers. It is not rendered through OfflineAudioContext, because AudioWorklet (which would need a module URL) is blocked on file://.
