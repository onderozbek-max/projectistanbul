> **2026-11-14 note:** Importer now exists: prototype/tools/prepare-art.js (art/commission/IMPORTER.md); runtime behind ?art=raster. Statements below that the importer is absent are out of date.

# Project Istanbul art implementation handoff

This handoff covers the Ink & Tea assets produced for Chapter 1, Taksim to Ataköy. The game is a portrait, one-thumb, iOS-first survivor game. The browser prototype contains the full 100-level journey. The Godot checkout has a smaller implementation scope and currently defaults to its benchmark scene.

## Where to find the files

The canonical game repository is `/Users/o0o02dn/Documents/istanbul`. All paths below and all path fields in [asset-inventory.json](asset-inventory.json) resolve from that directory. The inventory lists every asset by exact filename and SHA-256, with its prompt, actual dimensions and alpha, intended key colour, nominal cell rectangles, and known derivatives. For world art, it also carries the prompt’s scale and placement notes where available.

| Path from game repo | Contents |
|---|---|
| `art/commission/chatgpt/STYLE-BIBLE.md` and `PROJECT-INSTRUCTIONS.md` in the same directory | Ink & Tea look, camera, silhouettes, colour and keying conventions |
| `art/commission/chatgpt/prompts/<batch>/*.md` | One source prompt per expected PNG. Header gives the filename, dimensions and background. The body gives cell order, dimensions in metres where applicable, named references and acceptance criteria. |
| `art/commission/in/<batch>/*.png` | Canonical source art. Every expected prompt output exists at its specified path. |
| `art/commission/ready/` | 176 existing keyed, individual frames for bosses and three prop batches |
| `prototype/assets/{galata,bridge,saray}/` | 22 alpha atlases used by browser prototype code. Preserve each atlas’s matching crop, pivot and scale values. |
| `art/commission/refs/` | Three legacy reference images: `ref_current_enemy_lineup_2x.png`, `ref_current_enemy_lineup_phone.png`, `ref_current_gameplay_still_eminonu.png` |
| `art/commission/TRACKER.csv` and `art/PROVENANCE.csv` | Owner notes, some version choices, and partial provenance. File inventory is more current than tracker status. |
| `/Users/o0o02dn/Documents/ChatGPT/istanbul art` | Codex art workspace with the initial walker, staging copies and QA previews. Use the repository’s commission tree for production inputs. |

On November 14, 2026, the local checkout at `a46d904` plus working-tree changes held **419 expected PNGs across 67 prompt folders**. All 419 decoded and matched their requested canvas dimensions. There were 57 additional PNGs under `in`: 38 transparent derivatives, 11 corrected sources, four bridge texture previews, three F3 reruns and one prototype walker. At audit the tracker still listed 395 rows as `todo` and 24 as `generated`. Presence and readability establish file delivery. Visual approval, pivots, seams and runtime placement need their own checks.

The art production began with a one-off walker style test and progressed through separate batch chats, with independent folders run in parallel. The folder mapping was always `chatgpt/prompts/<batch>` to `in/<batch>`. Base art supplied the pose-sheet reference. A district’s ground A supplied material and colour reference for its other ground, props and façades. Weapons used the base icon and tier 5 as evolution references. The repository also contains procedural raster and postprocessed files, so use the provenance rows where present to identify the method for a specific image. The PNGs under `in` are generally Git-ignored, and the prepared files and prototype atlases were untracked at audit. An agent on a separate checkout needs the working-tree files or a copy matching the inventory checksums.

## Which version to import

1. Use the existing prototype atlas with its loader when reproducing the Galata, Bridge or Saray prototype prop presentation. For Godot, the same atlases can be input if their crop rectangles, pivots, world scale and passes are carried across.
2. Use already-keyed frames for bosses and the prepared prop batches listed below. Use the transparent derivatives for the matching pickups/effects, Kumkapı prop sheets and Ataköy Marina prop frames.
3. For all nine vehicles, start with `in/13-vehicles/veh_<id>-v2.png`. They have standardized magenta, corrected accents and revised framing. The RGBA channel is fully opaque, so key them before use. For Beyazıt façades, use `fac_beyazit_left-v2.png` and `fac_beyazit_night-v2.png`. These are opaque with horizontal edge corrections.
4. For the remaining art, use the exact canonical PNG listed in the inventory. `F1.png` is the key-art reference, `F2.png` is the gameplay/readability mockup and `F3.png` is Arda’s turnaround reference. The three additional `F3_run*.png` images are alternate reference trials. `in/02-enemies/walker-v0-ink-and-tea.png` is the initial style test with a variable magenta matte. The actual office walker source is `enm_walker_office_base.png` plus its sheet.
5. Leave comparison contacts, seam guides, tiling previews and duplicate staging files out of runtime packaging. Bridge uses the five `gnd_bridge_*.png` tiles. The four `bridge_textures_*preview*.png` files are QA composites.

### Alpha and crop rules

- Most isolated sources use `#FF00FF`. Use `#00FFFF` for both base and sheet files for `enm_bloater` and `enm_parkur`, and all three source PNGs each for `boss_bride` and `boss_bloater`. Cyan key is distinct from the player-ring colour `#3DDCFF`. Preserve intentional pink, purple and green clothing and effects.
- The 419 canonical PNGs are all opaque by pixel content, including sources stored as RGBA. For new keyed assets, sample the actual matte, remove near-key edge contamination, and preserve real gaps in the sprite without erasing similar foreground colours. Verify against light and dark backgrounds. The transparent sheets under `21-pickups-effects-transparent` can still have magenta RGB under zero alpha. Account for that when packing, filtering or building mipmaps.
- The inventory’s rectangles describe intended cells, in source pixels as `[x,y,width,height]`, zero-based coordinates, with row-major cell numbering starting at 1. Crop within each cell, inspect the real artwork, and record a ground-contact pivot plus world scale. Use consistent scale and contact position within a character’s sequence. Independent fit-to-box sizing creates visible jitter. Side characters face right. Mirror the texture around the pivot for left. Front/back Arda face down/up screen.
- Ground and façade sources are full opaque pictures. Preserve their image edges and test seams as repeated textures. Keying and tight sprite trims apply to cutouts. Pixel-equal extreme edges can still leave a visible pattern jump. Compare both repeated copies and transitions between different tiles at world scale.
- Target roughly 48–50 px silhouette height for a normal enemy on a phone. The style spec is a 55° three-quarter camera for characters, bold `#14151F` outlines, warm upper-left light, cool lower-right shading, flat tone blocks and about three heads tall. Boss source framing is normalized like other characters. Existing design notes describe ~2.2× relative boss scale and ~140 px phone height as separate guides, so keep the current renderer’s per-type scale and verify on device. Reserve cyan `#3DDCFF` for the player ring, orange-red `#FF4D2E` for warnings, gold-yellow `#FFD166` for healing and magenta-violet `#E040FB` for elite markers.

## Character assets

| Batch | Source count | Import map |
|---|---:|---|
| `00-style` | 3 | `F1.png`, `F2.png`, `F3.png`. Art references. |
| `01-hero` | 5 | `hero_arda_base.png` is the identity master. `hero_arda_{side,front,back}_sheet.png` are 1536×1024, 3×2, 512-pixel cells. Top row idle, walk1, walk2. Bottom row walk3, walk4, empty. `hero_arda_hurt_down_victory_sheet.png` is 1536×1024 with one row of three 512×1024 cells in that order. This yields 18 runtime poses. |
| `02-enemies` | 38 | 19 designs, each `enm_<id>_base.png` plus `enm_<id>_sheet.png`. The 1536×1024 sheets are 3×2, 512-pixel cells. Top row idle, walk1, walk2. Bottom row hit, dead, unused. The bloater actually has an additional pose in cell 6. Omit it from the five-frame runtime map. |
| `03-bosses` | 33 | 11 designs, each `boss_<id>_base.png`, `_sheet1.png`, `_sheet2.png`. Sheet 1 is a 3×1 strip of 512×1024 cells for idle and two walk frames. Sheet 2 is a 2×2 grid of 768×512 cells for windup, attack, hurt and dead. The extracted 1024×1024 RGBA files in `ready/03-bosses` already use `_idle`, `_walk1`, `_walk2`, `_attack_windup`, `_attack_hit`, `_hurt`, `_dead`. Each of the 11 sets also has a `_base` reference. |

Enemy art IDs are `walker_office`, `walker_student`, `walker_shopper`, `walker_tourist`, `runner`, `crawler`, `diner`, `spitter`, `screamer`, `bloater`, `hardhat`, `copci`, `kurye`, `brute`, `marti`, `cayci`, `parkur`, `kasap`, `zehirli`. The four walker outfits share gameplay ID `walker`. The prototype selects office/student/shopper/tourist by `Math.imul((id | 0) + 1, 0x9E3779B1) >>> 30` in `prototype/js/view/art-enemy-look.js`. `marti` is a flying gull and uses the same nominal five cell slots. The cape-like or low poses need their own contact/flight anchor. Ground shadows and elite/status overlays belong to render passes. Keep timing, attack telegraphs and collision with the simulation.

Arda’s production reference has a short dark quiff, red hoodie, grey shirt collar, dark jeans, white sneakers, earbuds and empty hands. F1 is illustrative key art. Hold identity to the base and turnaround rather than key-art poses. The hurt and victory cells face right. Inspect the actual down-cell silhouette before choosing a pivot for it.

### Boss lookup and district routing

Look up the district by `hood.id` in `prototype/js/journey.js`. Use `boss.<hood>` costume mappings before archetype fallbacks. Two different bosses have “guide” in their descriptions. `boss_guide` is the Galata costume of the brute. The Saray `tourGuide` archetype uses `boss_docent`.

Each district has source folders `10-ground-<hood>`, `11-props-<hood>`, `12-facades-<hood>`. The IDs can differ from procedural view themes, such as `kapalicarsi` vs `bazaar`, `bakirkoysahil` vs `sahil`, and `atakoysahil` vs `marina`.

| Levels | Hood ID | Boss archetype → asset prefix | Special ground suffix |
|---|---|---|---|
| 1–5 | `istiklal` | brute → `boss_vatman` | rails |
| 6–10 | `galata` | brute → `boss_guide` | stairs |
| 11–15 | `karakoy` | brute → `boss_bride` | wateredge |
| 16–20 | `bridge` | bloater → `boss_bloater` | deck |
| 21–25 | `eminonu` | taksici → `boss_taksici` | |
| 26–30 | `sirkeci` | kasapBoss → `boss_kasap` | |
| 31–35 | `kapalicarsi` | taksici → `boss_taksici` | |
| 36–40 | `beyazit` | spitter → `boss_spitter` | |
| 41–45 | `kumkapi` | bloater → `boss_bloater` | |
| 46–50 | `saray` | tourGuide → `boss_docent` | |
| 51–55 | `halic` | antiquarian → `boss_antiquarian` | steps |
| 56–60 | `yenikapi` | taksici → `boss_taksici` | |
| 61–65 | `samatya` | spitter → `boss_spitter` | seawall |
| 66–70 | `yedikule` | brute → `boss_keeper` | zindan |
| 71–75 | `kazlicesme` | spitter → `boss_spitter` | lawn |
| 76–80 | `zeytinburnu` | bloater → `boss_bloater` | quay |
| 81–85 | `bakirkoy` | taksici → `boss_taksici` | |
| 86–90 | `bakirkoysahil` | bloater → `boss_bloater` | cyclelane |
| 91–95 | `atakoysahil` | kasapBoss → `boss_kasap` | pontoon |
| 96–100 | `atakoy` | brute → `boss_bigbro` | |

## Arena assets

- **91 ground textures.** `gnd_<hood>_{a,b,c,d}.png` are the four paving variants per district. The 11 special IDs above use `gnd_<hood>_<feature>.png`. All source tiles are 1024×1024 top-down. Read each prompt’s metre scale and orientation. For example, the İstiklal base and bridge deck call for 256 source px/m. Keep rails, stairs, deck seams and shore bands aligned to the authored geometry. The Samatya seawall source already has the coping band on the right. Place it at a shoreline transition. Preserve the existing SVG/canvas role fallback in `prototype/js/view/arena-art.js` and `istanbul-themes.js`, including stage-specific `hood.sN` lookup.
- **141 prop sheets.** `prop_<hood>_<id>.png` sheets have four 512×512 cells. Slots 1–3 are intact variations A/B/C. Slot 4 is an authored broken state for 62 sheets and an authored alternate 90° view for 79. The inventory has the role per sheet. The prompt notes give which assets are solid, decorative or overhead and their dimensions. Use scene/config footprints for collision. Render grounded props relative to their footprint and canopy/string art in the overhead pass with clearance and visibility fade. Reuse the existing prop variant seed and break state. High cover, objectives and signs have their own gameplay/readability rules.
- **40 façade textures.** `fac_<hood>_left.png` and `fac_<hood>_night.png` are 1024×1536 opaque wall strips, with roof up, foot down and horizontal repetition. Select night versus left/day by the scene’s lighting. Size and orient them as the per-hood prompt specifies. Keep ground contact aligned, existing overlays separate and landmarks respectful and unnamed in the artwork.

### Preprocessed prop files

| Location under `art/commission` | Use |
|---|---|
| `ready/11-props-eminonu` | 28 individual 512×512 RGBA frames. `_a_intact`, `_b_intact`, `_c_intact`, plus `_a_broken` or `_a_angle2`. |
| `ready/11-props-kapalicarsi` | 28 individual 512×512 RGBA frames. `_a`, `_b`, `_c`, plus `_broken` or `_rot90`. |
| `ready/11-props-zeytinburnu` | 32 individual 512×512 RGBA frames. Same suffix rules as Kapalıçarşı. |
| `in/11-props-atakoysahil/transparent` | 24 individual 512×512 RGBA frames. A/B/C plus `_broken` or `_angle`. |
| `in/11-props-kumkapi/prop_kumkapi_*_transparent.png` | Seven keyed 1024×1024 sheets. Split using the original 2×2 cell map. |

### Prototype prop atlases and anchors

- **Galata** uses seven 256×256 files under `prototype/assets/galata/`: `stairrail`, `flowerpot`, `tavlatable`, `bench`, `planter`, `bollard`, `balconylantern` plus `.png`. `prototype/js/view/galata-props.js` uses four 128 px cells, a 102 px art frame and 13 px gutters. Its `specs` table has width, depth, height, breakability and the lantern’s 2.5 m clearance. Keep collider geometry in the existing ground-plane records. The loader supports the fourth frame as turned or broken according to the prop.
- **Galata Bridge** uses seven 1024×1024 files under `prototype/assets/bridge/`: `rodholder`, `fishingline`, `bollard`, `stairbarrier`, `tacklecrate`, `bin`, `lanternstring` plus `.png`. `prototype/js/view/bridge-props.js` defines exact tight crops and anchors in `FRAMES`. Its block IDs are `bollard`, `bin`, `crates` → tacklecrate, and `barrier` → stairbarrier. It handles rotated barriers and broken bin/crates. Rod holders are seated at the deck edge on L16. L17 renders lines centered on `collect.cut` interaction points and overhead lantern strings with per-frame scale and fade. Carry these anchors when porting the visuals.
- **Saray** is wired into the prototype’s `?art=raster` review path after all eight 512×512 atlases load. The source folder is `in/11-props-saray` and the prototype uses `prototype/assets/saray/`. Runtime mapping is `barrier` → stanchion, `kiosk` → ticketkiosk, `cart` → audioguidecart, `tree` → planetree, `bench` → stonebench, `lx_stall` → souvenirstand, plus bare `flagpole` and `bunting`. Use the `art` and `cells` tables in `prototype/js/view/saray-props.js` for per-frame dimensions, scale and anchors. It splits tree trunk and canopy into separate passes, puts canopy/bunting at 2.5 m clearance, and uses the fourth bench frame for its alternate orientation. The review flag also changes authored Saray footprints and cover in `prototype/js/config-levels.js` and the level/environment code. Treat those review-mode gameplay changes as separate decisions from porting the textures.

## Vehicles, weapons, pickups and effects

- **Nine vehicles.** `veh_{tram_red,taksici_yellow,dolmus,car_parked,scooter_kurye,ferry,boat_fishing,boat_yacht,truck_delivery}-v2.png` under `in/13-vehicles`. Key and trim as single objects. The tram is 1536×1024. The others are 1024×1024. Read dimensions and anchors from the prompt and scene config. The taxi boss animation and courier enemy already include vehicles. Use those character frames as composite sprites.
- **52 weapon sources.** `in/20-weapons/wpn_<id>_icon.png` is a single HUD icon, intended for 256 px export. `wpn_<id>_tiers.png` is a 1536×1024, 3×2 source sheet containing five in-world art tiers in order L1, L2, L3, L4, L5, empty. Keep L2 and L4 as the delivered images. `wpn_evo_<id>.png` is a 1536×1024 sheet split into two 768×1024 cells: inventory icon left, world visual right. Use `prototype/js/config-weapons*.js` and the existing `prototype/js/view/weapon-tiers.js` and `weapons-fx*.js` to select the correct state, rotation, scale, and draw pass. Some sheets illustrate whole effect shapes or trails. Compare against existing procedural effects to avoid drawing them twice. Evolution prompt references such as `wpn_knife_t5.png` mean a crop of cell 5, which the corresponding source sheet already contains.
- **Base weapon IDs.** `knife`, `nailgun`, `canister`, `chain`, `sledge`, `molotov`, `fireworks`, `cable`, `speargun`, `extinguisher`, `sawblade`, `manhole`, `torch`, `olta`, `cardoor`, `slingshot`, `chainsaw`.
- **Evolution art by source weapon.** Knife → cleaver, nailgun → nailstorm, canister → cluster or carbomb, chain → cyclone or arcchain, sledge → blacksmith, molotov → lake or fireball, fireworks → finale, cable → stormshield, speargun → netspear, extinguisher → foamstorm, sawblade → twinsaw, torch → forge, olta → hookpull, cardoor → minibus, chainsaw → grinder. Resolve the actual evolution ID from the game’s existing rules.
- **Seven pickup/effect sheets.** Start with `in/21-pickups-effects-transparent/<filename>.png`. The original keyed sheets with equal filenames are under `in/21-pickups-effects`. All are 1536×1024. `pk_xp_droplets` is 3×2 with small green, medium blue, large violet across each row, A above B. `pk_loot_consumables` is 4×3 with heal, power, objective pin, jeton, hurda, simit, closed chest, open chest, eczane heal-station sign, büfe heal-station sign, empty, empty. `pk_passive_icons` is 4×3 in ID order `nazar magnet shoes jacket gloves energy medkit kolonya cay lokum powerbank kask`.
- **Effect cell order.** `fx_hit_sparks` is slash, pierce, blunt, fire, chemical, electric. `fx_blood_splats` is small A/B, medium A/B, large A/B. `fx_dust_smoke` is dust A/B, smoke A/B, ash A/B. `fx_rubble_chips` is wood A/B, stone A/B, plaster A/B. All use 3×2 grids in row-major order. Leave existing effect timing, thresholds, pickup state, collider dimensions and gameplay values in code/data.

## Godot implementation boundary and verification

- Open `game/project.godot` within the actual game repository. The Godot resource root `res://` is `game/`. Prepare or copy runtime-selected files into that resource root before loading them by res path. The commission source tree lives outside it.
- `game/presentation/swarm_renderer.gd` currently creates a procedural disc texture and supplies per-instance XY transforms for a MultiMesh. Follow the atlas renderer in `docs/architecture.md` §4.2 with frame/flash/tint instance data and stable pivots. Keep the existing SoA/instanced design. Bind using runtime IDs, animation state and hood, with renderer-level fallback on missing textures. Read fresh `AGENTS.md` and content resources for implementation constraints.
- The prototype’s existing Galata, Bridge and Saray loaders are concrete references. The proposed repository-wide `tools/prepare-art.js` and commission manifest in D-066 were absent in this checkout. The JSON delivered here is an audit and crop guide. It does not contain measured local pivots or represent a loader already added to the game. Existing arena SVGs are under `art/arenas`, rendered in the prototype via `arena-art-data.js`.
- Validate keyed borders and atlases at actual phone scale. Check Arda’s four-frame gait, the enemy two-contact loop and hit/dead states, boss windup versus attack timing, props at their footpoints, broken art against cover state, overhead fade, seams and special tile transitions. Keep warning overlays, pickups and Arda readable with 60–200 enemies on screen. Run a representative route through L1–10, then check the Bridge L16/L17 prop behavior and the L46–50 Saray review art if those areas are in the target build.
- This handoff verifies exact files, path mappings, image decoding, dimensions, and a contact sheet of hero, enemy, weapon-tier and pickup/effect sources. It does not certify visual approval of all 419 assets, pixel-clean edges everywhere, current Git packaging, full provenance, or installation into Godot.
