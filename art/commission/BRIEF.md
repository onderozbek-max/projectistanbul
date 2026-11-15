# Art commission brief (R1, D-066 proposed)

> **Update 2026-11-14:** the owner chose **ChatGPT as the artist for all assets**. The working plan, prompts and checklists are in `art/commission/chatgpt/`
> (start with its `README.md`). The tables below (sections 2 and 5) stay as the technical spec; sections 1 and 4 are superseded by the ChatGPT route.

For the owner. This is the art version of `prototype/audio/sfx-gen/BRIEF.md`: what to get, from where, with which prompts, and where to put the files.
Nothing here is built yet: I write the importer (`tools/prepare-art.js`) and the raster sprite loader when the first files land.

**Why.** The phone playtest said the assets look cheap, enemies look alike and the arena never changes. The cause is the pipeline: everything is
drawn by code (canvas figures, SVG tiles), which tops out at clean flat vector. Illustrated, shaded art needs an image model or an illustrator.

## 0. The plan in five steps

| Step | What | Who | Output |
|---|---|---|---|
| 0 | **Style lock.** Make the 3 comparison frames in 2 tools, pick one tool. | You | `art/commission/in/00-style/` |
| 1 | **Batch 1, the first 10 levels** (hero, 6 enemies, 2 districts of ground and props, 5 weapons). | You (tool) or an illustrator | `art/commission/in/01-slice/` |
| 2 | I build the importer and the raster loader, and switch the slice on with `?art=raster`. Code art stays as the fallback. | Me | a playable build to judge |
| 3 | You judge it on the phone. If the look holds, order batches 2 to 5. | You | go or no-go |
| 4 | Batches 2 to 5: rest of enemies, bosses, the other 18 districts, weapon tiers, UI. | You | the full set |

Do not order everything at once. Step 3 is the cheap way to find out whether generated art survives 60 zombies on a phone.

## 1. Which tool and what to buy (from memory, not browsed: check each plan's current terms)

| Asset kind | Best route | Why |
|---|---|---|
| Ground tiles, props, weapon icons, UI icons, VFX stills | **Any image model**: ChatGPT image generation, Midjourney, Adobe Firefly, Leonardo, Scenario | One picture each, so consistency across files matters less. |
| Characters (hero, enemies) | **Scenario** (train a style model on your approved frames) or **an illustrator** | The same character must look identical across frames and views. Plain prompting drifts. |
| Hero Arda and the 7 boss designs | **An illustrator or animator** (Fiverr, Upwork, ArtStation). Ask for quotes. | The face of the game. Worth paying a human who can hold one design across 15+ frames. |
| Cleanup (outline weight, transparent edges, palette) | Krita or Aseprite, or I do it with the importer | See section 6. |

Licensing: confirm **commercial use** on your plan tier, and prefer a tool that states what it was trained on (Firefly says so). Log every asset in
`art/PROVENANCE.csv` (same columns as the audio rows: asset, tool, model or version, prompt id, date, licence notes, human edits).

**Pass or fail test before paying for anything.** Generate the hero turnaround (F3 below) three times in the same tool. If it is the same
person all three times, the tool can do characters. If not, hire an illustrator for characters and use the tool for the rest.

## 2. What the game can use (technical spec)

The game draws on a phone canvas. A figure about 1.2 m tall is roughly 50 CSS px tall, so about 100 to 150 device px. Bosses are about 3.5 m (about 140 CSS px). Ask for twice that so the art stays sharp.

| Spec | Value |
|---|---|
| Format | PNG, 8-bit RGBA. Transparent background if the tool can do it. Otherwise a **flat #FF00FF (magenta) background, no floor, no shadow**: I key it out. |
| View | Top-down three-quarter (camera about 55 degrees above), full body, **feet at the bottom centre**, the figure facing **right**. I mirror it for left. |
| Size | Enemies 512 x 512. Hero 512 x 512. Bosses 1024 x 1024. Figure fills about 80% of the height, never touching the edge. |
| Outline | Bold ink outline, `#14151F`, even weight on every character, with nothing but the outline darker than the fills. |
| Shading | Flat cel shading, 2 to 3 tones, warm light from the upper left, cool shadow. No soft airbrush, no gradients on the figure. |
| Silhouette | Each enemy type must read as a solid black shape at 48 px and differ from every other type. |
| Palette | Stay inside the tokens in `docs/design-system.md` section 3 (tram red, simit gold, tea amber, bosphorus blue, night ink, paper, stone grey). Zombie skin and clothes: `#7D8B6A` family, but each type gets its **own colour accent** (see the roster). |
| Text | No text, logos, real brands, flags, religious symbols or gore in any asset. |
| Naming | `<category>_<subject>_<variant>_<state>.png`, for example `enm_walker_a_walk1.png`. |

**Frames per character (kept cheap on purpose).** The game animates with bob, squash and sway, so enemies need only a few frames:

| Character | Frames |
|---|---|
| Each enemy | `idle`, `walk1`, `walk2`, `hit` (stagger), `dead` (collapsed). 5 images. |
| Hero Arda | 3 views (front, back, side) x (`idle`, `walk1` to `walk4`) = 15, plus `hurt`, `down`, `victory`. 18 images. |
| Boss | `idle`, `walk1`, `walk2`, `attack_windup`, `attack_hit`, `hurt`, `dead`. 7 images. |
| Ground tile | Seamless, 512 x 512, 4 variants per district. |
| Prop | One image each, 3 variants, in its intact and broken state when it is breakable. |
| Weapon | Icon 256 x 256, plus the in-world sprite at tiers 1, 3 and 5 and the evolution form. 5 images per weapon. |

## 3. The master style block (paste at the start of every prompt)

> Bold black ink outlines with even line weight, flat cel shading with two to three tones, warm amber light from the upper left with cool blue shadows,
> comic-book energy, clean readable silhouette, top-down three-quarter game art for a phone, stylised and slightly exaggerated proportions.

**Negative block (paste at the end, or into the negative-prompt field):**

> no text, no letters, no logos, no real brand names, no flags, no religious symbols, no gore, no blood pools, no photorealism, no watermark, no floor, no cast shadow, no background scenery.

**Never use a living artist's name in a prompt.**

**Character background line (add for every character):**

> full body, standing on a plain flat magenta (#FF00FF) background, feet at the bottom centre, facing right.

## 4. Step 0: the style lock (three frames, in two tools)

Use the prompt templates already in `design/style-exploration.md` sections 3 and 4 (direction A, Ink & Tea). Make these three, in each of the two tools you want to test:

| Frame | Prompt (after the master block) |
|---|---|
| F1 key art | "a 20-year-old Turkish university student, short dark wavy hair, light stubble, red hoodie over a grey t-shirt, dark jeans, white sneakers, earbuds around his neck, holding a fork like a weapon, standing on a long pedestrian avenue lined with neoclassical facades at golden hour turning to dusk, a red-and-cream vintage tram behind him, shambling zombies in everyday city clothes with grey-green skin approaching, vertical 9:19.5 composition" |
| F2 gameplay frame | "top-down three-quarter view game screenshot of a wide pedestrian avenue seen from above, grey stone paving with two tram rails in the middle, one hero in a red hoodie at lower centre with a cyan glowing ring at his feet, about sixty shambling grey-green zombies around him seen from above, small green glowing droplets on the ground, one red hatched warning circle on the ground, readable silhouettes, portrait 9:19.5". Use `design/lofi/gameplay-peak.svg` (exported to PNG) as the composition reference if the tool takes an image. |
| F3 hero turnaround | "character turnaround sheet of a 20-year-old Turkish university student, short dark wavy hair, light stubble, red hoodie over a grey t-shirt, dark jeans, white sneakers, earbuds around his neck: front, side and back views, and three expressions (determined, scared, grinning), neutral light grey background, consistent proportions" |

Run F3 three times in each tool (the pass or fail test above). Put the winners in `art/commission/in/00-style/` as `F1.png`, `F2.png`, `F3_run1.png` to `F3_run3.png`, and tell me which tool you picked. I review the frames against the readability rules (find the hero in under one second on F2 shrunk to phone size).

## 5. Batch 1: the first 10 levels (Istiklal and Galata)

Folder: `art/commission/in/01-slice/`. Each prompt is **[master style block] + the line below + [character background line, for characters] + [negative block]**.

### 5.1 Hero (Arda)
Attach the approved F3 sheet as a reference in every prompt (character or style reference, depending on the tool).

| File | Line |
|---|---|
| `hero_arda_side_idle`, `_walk1` to `_walk4` | "Arda, side view, standing idle" / "mid-stride walking, left foot forward" and so on for the four walk phases, same outfit and proportions as the reference sheet |
| `hero_arda_front_*`, `hero_arda_back_*` | the same for the front view (facing the camera, down-screen) and back view (facing away, up-screen) |
| `hero_arda_hurt`, `_down`, `_victory` | "flinching from a hit" / "collapsed on the ground" / "arms raised, grinning" |

### 5.2 Six enemies (give each its own colour accent so they read at a glance)

| Id | Role | Silhouette and accent | Line |
|---|---|---|---|
| walker | melee swarm | average build, hunched, **olive green**, office clothes | "a shambling zombie in office clothes, torn shirt and loose tie, desaturated grey-green skin, pale glowing eyes, arms hanging forward" |
| runner | fast melee | lean, forward-leaning, **yellow-orange** tracksuit | "a thin sprinting zombie in a yellow-orange tracksuit, leaning far forward, mouth open" |
| crawler | low, from the street edge | very low and wide, **dusty brown** | "a zombie crawling on its elbows, torso low to the ground, torn brown coat, dragging its legs" |
| diner | civilian who turns | upright, **tram red** apron | "a zombie waiter in a tram red apron holding a tea tray, one arm stiff" |
| kurye | scooter dasher | wide on a small scooter, **bosphorus blue** | "a zombie courier riding a small blue delivery scooter with a crooked box, leaning forward" |
| copci | tank, pushes bins | broad and short, **simit gold** hi-vis vest | "a heavy zombie street sweeper in a gold hi-vis vest pushing a green wheelie bin like a shield, very wide shoulders" |

Each enemy: `enm_<id>_a_idle`, `_walk1`, `_walk2`, `_hit`, `_dead`. Generate each frame from the same base image (image-to-image) if the tool allows.

### 5.3 Ground and props (Istiklal and Galata)

Ground tiles are **seamless and flat from above**, mid-value grey so zombies, green XP and red telegraphs pop. No shadows from props baked in.

| File | Line |
|---|---|
| `gnd_istiklal_a` to `_d` | "seamless top-down grey stone paving, night ink joints, subtle wear, mid-value grey (#8A8F98), no objects, tileable" |
| `gnd_istiklal_rails` | "two parallel tram rails running vertically through the centre of a stone paving tile, seamless top-down" |
| `gnd_galata_a` to `_d` | "seamless top-down steep cobblestone street, warm grey cobbles with night ink joints, amber lantern glow on the right edge, mid-value, tileable" |
| `prop_istiklal_simitcart_a/b/c` and `_broken` | "a wooden simit street cart with a glass case and red wheels, three-quarter top-down view, sesame bread rings stacked inside" and a broken version |
| `prop_istiklal_chestnutcart_*`, `_bench_*`, `_bin_*`, `_cafetable_*` | the same pattern for a chestnut cart with steam, a park bench, a street bin, a pavement cafe table with two chairs |
| `prop_galata_tavlatable_*`, `_planter_*`, `_bollard_*`, `_bench_*` | a backgammon (tavla) table with a board, a stone planter with flowers, a stone bollard, a wooden bench |
| `veh_tram_red` | "a vintage red-and-cream Istanbul tram seen from above at a three-quarter angle, no text, no livery, long rectangular roof" (the one non-character PNG on a magenta background) |

### 5.4 Five weapons (icons and in-world sprites)

Weapons: knife, nailgun, canister, chain, sledge. Tiers 1, 3 and 5 should look **visibly stronger** each time: more glow, bigger, more elaborate.

| File | Line |
|---|---|
| `wpn_knife_icon` | "a game item icon of a kitchen knife, bold outline, centred, plain flat magenta background" |
| `wpn_knife_t1`, `_t3`, `_t5`, `_evo` | "a thrown kitchen knife seen from above" (t1 plain steel) / "...with a gold edge and a faint trail" (t3) / "...glowing white-gold, long trail, small sparks" (t5) / "...the evolved form, a big glowing blade" |
| `wpn_nailgun_*`, `wpn_canister_*`, `wpn_chain_*`, `wpn_sledge_*` | the same pattern for nails, a gas canister, a chain, a sledgehammer |

Weapons are drawn as in-world sprites and effects, not held in the hero's hands. Keep the hero's hands empty or neutral in every hero frame.

## 6. What I do when files arrive

1. **`tools/prepare-art.js`** (to build, like `prepare-sfx.js`): key out magenta, trim, centre the feet at the bottom, resize to the sizes above, check outline weight and palette drift, check each enemy silhouette at 48 px against the others, write `ready/` plus a manifest, and print a report like the audio one.
2. **Raster sprite loader** in the view layer: loads the manifest, bakes frames into the existing sprite cache (the 64 MB LRU), mirrors for facing, keeps bob and squash. The code art stays as the fallback, so a missing frame never breaks a level.
3. **A flag**, `?art=raster`, to compare the old and new look on the phone side by side.
4. **Provenance** rows in `art/PROVENANCE.csv`.

## 7. Open points for you

1. **D-057** says backgrounds are authored vector and "no generation". This plan reopens that for ground and props. I added **D-066 (proposed)** to the decision log. Say accept or change.
2. Budget and tool plan: you decide. I would not buy a Scenario plan before the pass or fail test passes in a cheaper tool.
3. Turkish signage: shops have names in `docs/hood-visual-briefs.md`. This batch avoids text in the art, so signs stay a code overlay.

## 8. After batch 1: the later batches (not yet ordered)

| Batch | Contents |
|---|---|
| 2 | The other 10 enemies (marti, cayci, spitter, zehirli, bloater, screamer, hardhat, kasap, parkur and brute), plus affix looks done by code |
| 3 | The 7 boss designs (brute, bloater, spitter, taksici, kasapBoss, tourGuide, antiquarian), 7 frames each |
| 4 | Ground and props for the other 18 districts (`docs/hood-visual-briefs.md` has each brief) |
| 5 | Weapon tiers for the other 12 base weapons and the 18 evolutions, UI icons, XP droplets, hit effects |
