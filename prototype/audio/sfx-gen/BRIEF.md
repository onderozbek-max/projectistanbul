# Sound effects brief: the first 45 cues to generate

For the owner. This is the list of sound effects to make with an AI sound tool, one row per game cue, in the order to do them. The drop-folder rules, file names and tool settings are in `README.md` in this folder. Music stays Suno (D-062; `prototype/audio/music-suno/README.md`).

**How to read the table.** *When it plays* says where the cue sounds and how often (from the code, not measured): *constant* means many per second in a crowd fight, *frequent* several times a minute, *occasional* a few times a level, *rare* once per encounter or less. *Gap ms* is the shortest time between two starts of the same cue in the game, and *at once* is how many can overlap, so the sound must hold up when it is repeated that fast. *Target s* is the length to generate (the tool trims silence and fades the tail). *Takes* is how many files to make: `<cue>.<ext>` for take 1, `<cue>_2.<ext>` to `<cue>_4.<ext>` for the others. Generate 4 to 6 takes of each prompt and keep the best ones (see README, "Picking takes").

Every prompt ends with the negative guidance: no music, no speech (or no song for stings). If your tool has a negative-prompt box, paste "music, speech, singing, room echo, reverb, clipping" there.

## Batch 1: start here (12)

Kills, impacts, the blasts, the hero's hurt and the level-up. These are the sounds the owner heard as "terrible" on the phone.

| # | Cue | When it plays, and how often | Gap ms | At once | Target s | Takes | Prompt |
|---|---|---|---|---|---|---|---|
| 1 | `hit_body` | Every weapon or tackle contact on an enemy (the body kind, the only one played today). Constant in crowd fights. | 35 | 6 | 0.30 | 4 | Punchy cartoon body hit: a fist-sized thump into soft flesh with a tiny slap on top, comic weight, single hit, short and dry, close mic, no reverb, no music, no speech. |
| 2 | `splat` | A zombie dies (every kill). Constant in crowd fights. | 45 | 6 | 0.40 | 4 | Cartoon zombie splat: a wet, slightly comic thump with a short squelch and a small spray tick, punchy and not gory, single splat, short and dry, close mic, no reverb, no music, no speech. |
| 3 | `swish` | Hero knife swing. Every swing. | 60 | 4 | 0.30 | 3 | Quick knife swing through air: a fast whoosh falling from high to low, a light metallic edge and a small whip tick at the end, cartoon-punchy, close mic, dry, no reverb, no music, no speech. |
| 4 | `nail` | Nail gun shot. Every shot while the nail gun is equipped. | 70 | 4 | 0.20 | 3 | Nail gun shot: a tiny air puff, a sharp pneumatic clack and a short thunk into wood, punchy and small, single shot, close mic, dry, no reverb, no music, no speech. |
| 5 | `hammer` | Hammer hit. Every hit. | 80 | 4 | 0.50 | 3 | Heavy hammer smash: a deep chunky thud, a short wood crack and a small rattle, cartoon-punchy and slightly comic, single hit, close mic, dry, no reverb, no music, no speech. |
| 6 | `zombieDie` | A zombie dies (its last sound, a voice). Every death. | 150 | 4 | 0.80 | 3 | Zombie death moan: a creaky falling "uh" that sinks in pitch, a breathy end and a couple of soft wet bubbles, comic not scary, non-verbal, no words, close mic, dry, no reverb, no music. |
| 7 | `groan` | Zombie groan, idle and when zombies hit. Frequent. | 350 | 6 | 0.80 | 3 | Low gravelly zombie groan, short, dry, comedic: an "oo" that opens to an "ah" and sinks, a breathy exhale at the end, non-verbal, no words, close mic, no reverb, no music. |
| 8 | `hurt` | The hero takes damage (thud and grunt). Each hit on Arda. | 120 | 2 | 0.50 | 3 | Short flesh thud followed by a breathy, rough grunt of pain that drops in pitch, cartoon-comic not screaming, non-verbal, no words, close mic, dry, no reverb, no music. |
| 9 | `blast` | Gas canister explodes. Each canister. Occasional, loud. | 80 | 3 | 0.90 | 3 | Gas canister explosion, cartoon-punchy: a deep sub boom, a sharp bang, a short rush of air and a few metal debris clanks, no fire roar, no long tail, close mic, dry, no reverb, no music, no speech. |
| 10 | `boom` | Generic explosion (the event). Occasional. | 150 | 2 | 0.90 | 3 | Cartoon explosion: a big round boom with a crisp bang on top, a short air push and a light debris tick, punchy and fun, tail under one second, close mic, dry, no reverb, no music, no speech. |
| 11 | `rocketBoom` | Rocket lands. Occasional. | 200 | 2 | 0.90 | 3 | Rocket impact explosion, cartoon-punchy: a heavy boom with a sharp crack and a short rattle of falling debris, tail about one second, close mic, dry, no reverb, no music, no speech. |
| 12 | `level` | Level-up. Several per level (7 to 12 in a three-to-four minute level). | 1000 | 1 | 1.00 | 3 | Short cheerful level-up sting: a soft drum hit, two quick rising notes on a bright bell and a small warm brass chord, comic and celebratory, not a phone alert, no vocals, no song, tail under one second. |

## Batch 2: next (12)

The rest of the combat, the boss moments and the heal.

| # | Cue | When it plays, and how often | Gap ms | At once | Target s | Takes | Prompt |
|---|---|---|---|---|---|---|---|
| 13 | `crit` | Critical hit. Frequent, in step with the crit chance. | 40 | 4 | 0.40 | 3 | Critical hit: a bright metallic click, a short high ring and a low thump with a little sparkle, cartoon-punchy, single hit, close mic, dry, no reverb, no music, no speech. |
| 14 | `cleaver` | Cleaver swing or hit. Frequent with the cleaver equipped. | 120 | 2 | 0.60 | 3 | Heavy cleaver chop: a whoosh, a bright metal edge ring, a sharp wood thunk and a short wet flesh thud, cartoon-punchy, close mic, dry, no reverb, no music, no speech. |
| 15 | `cluster` | Chain explosion (the cluster burst). Occasional. | 200 | 2 | 0.90 | 2 | Five quick small explosions in a row, cartoon style: short bangs with tiny debris clinks and a crackle, punchy, no long tail, close mic, dry, no reverb, no music, no speech. |
| 16 | `molotovBurst` | Molotov lands. Occasional. | 200 | 2 | 0.90 | 2 | Glass bottle bursts and a small fireball whumps: a sharp glass break, a soft whomp and a short crackle of fire, cartoon-comic, close mic, dry, no long reverb, no music, no speech. |
| 17 | `snarl` | Zombie snarl. Occasional, when zombies attack. | 300 | 4 | 0.70 | 3 | Zombie snarl: a short growling trill with a wet breath at the end, rough and comic, non-verbal, no words, close mic, dry, no reverb, no music. |
| 18 | `dash` | Hero dash. Each dash. | 150 | 2 | 0.40 | 3 | Quick cartoon dash: an air whoosh falling in pitch, a low thump at the start and a short breath exhale, non-verbal, close mic, dry, no reverb, no music, no speech. |
| 19 | `levelClear` | Stage clear. Once per level. | 1500 | 1 | 1.40 | 2 | Stage clear sting: a short drum roll into a bright bell and a warm brass chord that resolves, ends on a chime, triumphant and comic, not a phone alert, no vocals, no song, under 1.5 seconds. |
| 20 | `bossIntro` | Boss enters. Once per boss. | 2000 | 1 | 1.60 | 2 | Ominous boss entrance sting: a deep sub drone rising, two dissonant bell strikes, a low drum roll and a short growling roar at the end, cartoon-scary not gory, no vocals beyond the roar, no song, under 1.6 seconds. |
| 21 | `bossDie` | Boss dies. Once per boss. | 1500 | 1 | 1.40 | 2 | Boss death: a long groan that sinks in pitch, a heavy collapse thud and falling rubble clatters, cartoon-comic not gory, non-verbal, no words, close mic, no music, under 1.5 seconds. |
| 22 | `bruteRoar` | Brute roars. Occasional. The game ducks music and ambience while it plays. | 1500 | 1 | 1.00 | 2 | Big brute roar: a deep growled roar with throat grit that swells and then cuts off, cartoon-scary, non-verbal, no words, close mic, dry, short tail, no reverb, no music, no speech. |
| 23 | `levelFail` | Level failed (the "defeat" moment; there is no separate defeat cue). Once per failed level. | 1500 | 1 | 1.20 | 2 | Failure sting: three falling brass-like notes over a soft low thump, sad and comic, not harsh, no vocals, no song, under 1.3 seconds. |
| 24 | `heal` | Tea heals (skill use). Occasional. | 300 | 2 | 0.80 | 2 | Gentle healing chime: a quick rising marimba arpeggio and a soft airy shimmer at the end, warm and friendly, close mic, dry, no vocals, no song, under one second. |

## Batch 3: then (12)

Menus, the world (glass, shutters, chests, the tram bell and the ferry), the shield and the gas canister throw.

| # | Cue | When it plays, and how often | Gap ms | At once | Target s | Takes | Prompt |
|---|---|---|---|---|---|---|---|
| 25 | `uiTap` | Any tap in the meta screens (menus). Constant in menus. | 40 | 3 | 0.10 | 4 | Soft wooden UI tap: a short tock with a tiny tick, clean and friendly, very quiet, close mic, dry, no reverb, no music, no speech. |
| 26 | `chestOpen` | Chest opens (the reward screen). Once per chest. | 500 | 1 | 0.80 | 2 | Old wooden treasure chest creaks open: a long slow wood creak, a small latch click and a short sparkle of coins, cozy and comic, close mic, dry, no reverb, no music, no speech. |
| 27 | `chestDrop` | Chest drops (the reward screen). Occasional. | 100 | 2 | 0.60 | 4 | Wooden chest drops onto stone: a heavy wood knock, a short thump and a faint coin rattle, punchy, close mic, dry, no reverb, no music, no speech. |
| 28 | `glass` | A glass prop breaks in the street. Occasional. | 120 | 3 | 0.60 | 4 | Glass bottle smashes on a hard floor: a bright crunch, a short ring and a few falling shard tinks, cartoon-comic, close mic, dry, no reverb, no music, no speech. |
| 29 | `shutter` | Shutter closes (an event). Occasional. | 400 | 2 | 0.90 | 2 | Metal roller shutter slams down: short rattly clacks over a low rumble, comic and noisy, close mic, dry, no reverb, no music, no speech, under 1.2 seconds. |
| 30 | `bell` | Tram bell (events, skills and enemies). Occasional. | 300 | 2 | 1.00 | 2 | Tram bell: two bright bronze strikes with a short metallic ring, clear and cheerful, Istanbul tram feel, close mic, dry, no music, no speech, under 1.2 seconds. |
| 31 | `ferryHorn` | Ferry horn (events and skills). Rare: at most one every six seconds. | 6000 | 1 | 1.50 | 2 | Large ferry horn: a deep two-tone steamship horn with a slow onset and a short ring-off, warm and slightly nasal, outdoors but dry, no music, no speech, under 1.6 seconds. |
| 32 | `nazar` | The shield block and the nazar dodge (the "shield" cue). Occasional, while the shield is up. | 250 | 2 | 0.60 | 3 | Protective charm shimmer: a bright glass ping with a soft high shimmer, like a small glass charm chiming, short and clean, close mic, dry, no reverb tail beyond half a second, no music, no speech. |
| 33 | `uiBack` | Back button in menus. Constant in menus. | 50 | 3 | 0.20 | 3 | Two quick falling soft taps, a back button on a wooden surface, clean and light, close mic, dry, no reverb, no music, no speech. |
| 34 | `uiOpen` | A menu or panel opens. Occasional. | 100 | 2 | 0.30 | 3 | Panel opens: a short rising fabric whoosh with a soft tap at the end, clean and light, close mic, dry, no reverb, no music, no speech. |
| 35 | `spitHit` | Acid spit lands. Occasional, with spitter enemies. | 120 | 3 | 0.40 | 4 | Acid spit splatters on the ground: a low wet splat, a short sizzle and a few drips, punchy and not gory, close mic, dry, no reverb, no music, no speech. |
| 36 | `lob` | Gas canister thrown. Each throw. | 100 | 3 | 0.60 | 4 | Metal canister thrown through the air: a whoosh with eight quick spinning metal clanks, cartoon-comic, close mic, dry, no reverb, no music, no speech. |

## Batch 4: last (9)

Rare cues, and the hit kinds that the game does not play yet.

| # | Cue | When it plays, and how often | Gap ms | At once | Target s | Takes | Prompt |
|---|---|---|---|---|---|---|---|
| 37 | `footstep` | Hero footstep on cobble. **Only the parkour enemy wind-up calls it today;** the hero walk is not wired (cue sheet item 6). | 170 | 2 | 0.20 | 4 | Single footstep on old cobblestone: a soft heel tick, a small grit scrape and a stone knock, quiet and natural, close mic, dry, no reverb, no music, no voices. |
| 38 | `stab` | Knife into flesh. **Only the cold open calls it today.** | 50 | 6 | 0.25 | 4 | Knife stabbed into soft flesh: a sharp metal tick, a short wet squelch and a dull thump, cartoon-punchy and not gory, single stab, close mic, dry, no reverb, no music, no speech. |
| 39 | `hit_blade` | Blade impact. **Not played yet:** weapon code must pass `kind: 'blade'`. | 35 | 6 | 0.30 | 4 | Blade strike on a body: a quick metallic slice with a soft wet thud, cartoon-punchy, single hit, close mic, dry, no reverb, no music, no speech. |
| 40 | `hit_blunt` | Blunt impact. **Not played yet** (`kind: 'blunt'`). | 35 | 6 | 0.35 | 4 | Blunt strike on a body: a heavy dull thud with a short wood crack, cartoon-punchy and slightly comic, single hit, close mic, dry, no reverb, no music, no speech. |
| 41 | `hit_pierce` | Pierce impact. **Not played yet** (`kind: 'pierce'`). | 35 | 6 | 0.30 | 4 | Sharp pierce hit: a tight high metallic tick and a short wet punch, like a spike going into a body, cartoon-punchy, single hit, close mic, dry, no reverb, no music, no speech. |
| 42 | `hit_chain` | Chain impact. **Not played yet** (`kind: 'chain'`). | 35 | 6 | 0.35 | 4 | Bike chain whip hit: a short metallic clatter of chain links and a dull body thud, cartoon-punchy, single hit, close mic, dry, no reverb, no music, no speech. |
| 43 | `bruteStomp` | Brute stomp. Rare. | 300 | 2 | 0.80 | 2 | Giant stomp on pavement: a deep thump and a short gritty scatter of debris, cartoon-punchy, no long tail, close mic, dry, no reverb, no music, no speech. |
| 44 | `bloaterPop` | Bloater bursts. Occasional, with bloater enemies. | 200 | 2 | 0.80 | 2 | Balloon-like creature pops: a wet pop, a short spray hiss and a few bubbles, cartoon-comic and not gory, close mic, dry, no music, no speech. |
| 45 | `spearPin` | Spear tip pins a target. Occasional. | 80 | 4 | 0.35 | 4 | Spear tip pins a target: a tight tick, a short flesh thud and a brief metal ring, cartoon-punchy, single hit, close mic, dry, no reverb, no music, no speech. |

**Totals.** 45 cues, about 80 seconds of audio in all (about 15 MB decoded, within the game's 15.5 MB cap for cues). The four hit kinds in batch 4 are ready for when weapon code passes a kind. Until then they cost nothing.

## Keep: stay synthesized (do not generate)

The pickups the owner likes stay as they are: `tink` (XP), `coin`, `star`, `magnet`. Do not generate these. If a file for one appears in the folder, the game plays it instead of the synth sound.

`speech` (the comic speech blips) also stays synthesized: it is one syllable per call and a generator cannot make those reliably.

## Not in this brief (41 cues)

These keep their synthesized sound for now. They can be added later with the same rules (one row each, same prompt style). No order has been set for them yet: `bloaterSwell`, `bruteCharge`, `burn`, `cat`, `chain`, `chestShake`, `click`, `combo`, `comicPage`, `comicPop`, `crowdScream`, `cyclone`, `doorSlam`, `elite`, `evolve`, `extinguisher`, `finale`, `frenzy`, `gearEquip`, `gull`, `hiss`, `hoodIntro`, `mapWalk`, `molotovThrow`, `nailStorm`, `nearMiss`, `nodeUnlock`, `nosignal`, `phoneBuzz`, `phoneRing`, `pick`, `rattle`, `rocketLaunch`, `rocketWhistle`, `shock`, `slam`, `spear`, `spit`, `ult`, `ultReady`, `zap`.

## Ambience beds (optional, 5 files)

Loops for the walk. Each one plays under the game's ambience (`ambience` bus, normalised by the tool to -26 dBFS RMS). Make each 8 to 20 seconds and **export it 0.5 seconds longer** than you want the loop to be: the tool blends the last 0.5 s into the start, so the loop joins with no click. Set loop on in the tool if it has the option. Save as `amb_<group>.<ext>`.

| # | Bed | Setting | Prompt |
|---|---|---|---|
| B1 | `amb_street` | Istiklal, Galata, Eminönü and the old city streets | Istanbul street ambience loop: distant crowd murmur, far-off traffic and a tram in the distance, a seagull now and then, warm city feel, no clear words, no music, no close voices, seamless loop. |
| B2 | `amb_waterfront` | Karaköy, Kumkapı, Yenikapı, Sahil | Waterfront ambience loop: gentle sea surf on a stone quay, a distant ferry horn now and then, a few seagulls, light wind, no clear words, no music, seamless loop. |
| B3 | `amb_bazaar` | Kapalıçarşı | Covered market ambience loop: a soft indoor crowd murmur in an echoing room, distant metal clinks of shop wares, faint footsteps, no clear words, no music, seamless loop. |
| B4 | `amb_wind` | Galata Bridge | Bridge at night ambience loop: steady wind over a steel bridge, a faint cable hum, occasional gusts, a far-off gull, no clear words, no music, seamless loop. |
| B5 | `amb_night` | Ataköy and the quiet nights | Quiet city night ambience loop: low building hum, a distant dog bark now and then, a car passing far off, faint muffled TV through a wall, no clear words, no music, seamless loop. |

The bed prompts are optional. The game plays the synthesized bed until a file is ready, and it does not need all five.
