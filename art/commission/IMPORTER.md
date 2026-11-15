# Art importer

`prototype/tools/prepare-art.js` turns the commissioned PNGs under `art/commission/in/` into the runtime assets in `prototype/assets/art/`. It writes `manifest.json` (what the game reads) and prints a report. The importer is pure Node 18+ with no npm packages. The only external tool is `ffmpeg` on PATH, used for JPEG encoding and JPEG decoding in the tests.

## Running it

```
node prototype/tools/prepare-art.js                       build everything (cache-aware)
node prototype/tools/prepare-art.js --list                list units, their batch and source count; no output
node prototype/tools/prepare-art.js --dry-run             plan and report without writing files
node prototype/tools/prepare-art.js --only=03-bosses      rebuild selected batches or unit ids (comma separated)
node prototype/tools/prepare-art.js --force               ignore the cache and rebuild everything
node prototype/tools/prepare-art.js --dst=DIR             write somewhere other than prototype/assets/art
node prototype/tools/prepare-art.js --sheets=DIR          also write character contact sheets (PNG) to DIR
node prototype/tools/test-prepare-art.js                  tests (synthetic, plus checks on the built output)
node prototype/tools/test-prepare-art.js --full           also rebuild into a temp dir and compare every hash (about 2 min)
```

Exit code 1 means at least one source was rejected. The report names it and the reason. Rejected units are not written, and the manifest marks them `rejected` in `sources`. Warnings do not change the exit code.

Reruns are idempotent. The cache is `prototype/assets/art/.cache.json`, which is git-ignored by `prototype/assets/art/.gitignore`. A unit is rebuilt only when its source sha256 or the recipe changes. The recipe is the sha256 of `prepare-art.js`, `lib-art-image.js` and the constants in `C`. Editing either script therefore rebuilds everything. Outputs that a rebuild no longer produces are removed.

## Output layout

```
prototype/assets/art/
  manifest.json          index for the game (schema 1)
  .cache.json            build cache (git-ignored)
  .gitignore
  characters/<id>.png    one atlas per entity: hero, enemies, bosses
  ground/<hood>/<variant>.jpg   512 x 512 seamless tiles
  facades/<hood>/<variant>.jpg
  props/<hood>.png       one atlas per hood (bridge, galata and saray are hand-wired, see below)
  weapons/<base>.png     icons, five tiers and evolution sheets
  pickups/*.png, effects/*.png, vehicles/*.png
```

Atlases are PNG. Each frame sits in a shelf-packed atlas with a 2 px transparent gutter, edge-bled so that filtering does not pick up the matte colour. Ground and facade tiles are JPEG (ffmpeg mjpeg, `-q:v 3`, bit-exact flags). Left and right mirroring is done at runtime, not here.

## Manifest schema

Top level: `schema` (1), `tool`, `recipe` (first 16 hex digits of the recipe hash), `root`, `inventory` (the asset inventory file, its repository head and audit date), `conventions` (pivot, anchor, scale, facing and encoding rules, as text), then one object per category, keyed by id:

`characters`, `ground`, `facades`, `props`, `weapons`, `pickups`, `effects`, `vehicles`, plus:

- `sources`: one row per prompt output in the inventory, with `status` (`used`, `skipped` for style references and similar, `rejected`, or `not-built`), `unit`, `via` and `reason`.
- `files`: every output file with `bytes`, `sha256`, `encoding` (`png8`, `png32` or `jpg`) and, for PNG, `colourError` when the palette was measured.
- `budget`: `limitBytes` (60 MiB), `goalBytes` (30 to 40 MiB), `totalBytes` (sum of the output files, excluding manifest and cache) and `categoryBytes`.

A rect is `{x, y, w, h, px, py, anchor}`. `x, y, w, h` is the content rectangle in atlas pixels; the gutter lies outside it. `px, py` is the pivot relative to the rect's top-left corner. `anchor` says how the pivot was chosen.

### Characters

```
"hero_arda": {
  "kind": "hero", "atlas": "characters/hero_arda.png", "scale": 0.8355,
  "srcHeightPx": 383, "heightPx": 320, "facing": "right",
  "views": { "side":  { "facing": "right", "frames": { "idle": { "x": 643, "y": 554, "w": 124, "h": 320, "px": 38, "py": 320, "anchor": "feet" } } },
             "front": { "facing": "down",  "frames": { ... } }, "back": { "facing": "up", "frames": { ... } } },
  "poses": { "hurt": { ... }, "down": { ... }, "victory": { ... } }
}
"walker_office": {
  "kind": "enemy", "atlas": "characters/walker_office.png", "scale": 0.6938, "heightPx": 256,
  "flying": false, "frames": { "idle": { "x": 2, "y": 2, "w": 143, "h": 256, "px": 54.8, "py": 256, "anchor": "feet" }, "walk1": { ... } }
}
```

The hero has `views` (side, front, back) with walk frames `walk1` to `walk4`, plus `poses`. Enemies and bosses have a flat `frames` map by role (`idle`, `walk1`, ...). Units with a `group` also carry `group` and `outfit`.

### Ground and facades

```
"gnd_atakoy_a": { "id": "gnd_atakoy_a", "hood": "atakoy", "variant": "a", "feature": null,
  "file": "ground/atakoy/a.jpg", "w": 512, "h": 512, "seamScore": 0.03, "lstar": 54.6,
  "flags": ["seamless"], "source": "art/commission/in/10-ground-atakoy/gnd_atakoy_a.png" }
"fac_atakoy_left": { "id": "fac_atakoy_left", "hood": "atakoy", "variant": "left",
  "file": "facades/atakoy/left.jpg", "w": 512, "h": 768, "source": "..." }
```

`seamScore` is the mean wrap-edge difference divided by the mean neighbouring-pixel difference, on luma. Under 0.3 the tile is `seamless` (opposite edges identical in luma, so the repeat has no seam). Above 2.0 it is `seam-poor`. `feature` is set for rails, stairs and shore bands, which are placed at transitions and are not meant to repeat. `lstar` is the mean CIE L* (target band 30 to 75).

### Props

```
"props/atakoysahil.png": { "handwired": false, "atlas": "props/atakoysahil.png", "scale": 0.5, "cellPx": 256,
  "items": { "mooredboat": { "slot4": "alt90", "hints": ["footprint"],
    "cells": { "a": { "x": 721, "y": 2, "w": 200, "h": 198, "px": 38, "py": 198, "anchor": "feet" }, "b": { ... } } } } }
```

Each prop item has `slot4` (how the fourth cell is produced: `broken` or `alt90`), `hints` from the prop roles list (for example `solid`, `footprint`, `overhead`, `flat`, `canopy`, `ground`) and `cells` (`a`, `b`, `c` and `broken` or `alt90`). Hood entries with `handwired: true` (bridge, galata, saray) contain only the `items` list. Their atlases were made by hand and are not emitted here.

### Weapons, pickups, effects, vehicles

```
"knife": { "atlas": "weapons/knife.png", "scale": { "icon": 0.25, "tier": 0.5, "evo": 0.25 },
  "icon": { "x": 2, "y": 2, "w": 205, "h": 202, "px": 102.5, "py": 101, "anchor": "centre" },
  "tiers": { "l1": { ... }, "l2": { ... }, "l3": { ... }, "l4": { ... }, "l5": { ... } },
  "evolutions": { "cleaver": { "icon": { ... }, "world": { ... } } } }
"pk_xp_droplets": { "atlas": "pickups/pk_xp_droplets.png", "scale": 0.5,
  "cells": { "xp_small_a": { "x": 2, "y": 800, "w": 75, "h": 102, "px": 33, "py": 38, "anchor": "centre" } } }
"tram_red": { "atlas": "vehicles/tram_red.png", "scale": 0.5,
  "frame": { "x": 2, "y": 2, "w": 615, "h": 373, "px": 73.8, "py": 373, "anchor": "bottom" },
  "metres": { "wide": 2.8, "long": 12, "high": 3 }, "source": "art/commission/in/13-vehicles/veh_tram_red-v2.png" }
```

`metres` comes from the world spec in the prompt, when it has one.

## Pivots, scales and facing

- **Feet** (characters, props): the bottom centre of the lowest `max(3, round(0.03 × height))` rows of opaque pixels (alpha at least 128), placed on the bottom edge of the figure. Used for anything that stands on the ground.
- **Body** (dead, down, flying characters): the centre of the figure's alpha box.
- **Bottom** (vehicles): bottom centre of the vehicle.
- **Centre** (weapons, pickups, effects): the centre of the source cell, mapped through the crop.
- **Scale** is atlas pixels per source pixel. Each character has one scale for all its frames, chosen so that its idle frame is `heightPx` tall: 256 for enemies, 320 for the hero, 512 for bosses. Props, facades, ground, vehicles and sprites use fixed scales in the constants (0.5, or 0.25 for icons and evolutions). Check `srcHeightPx × scale ≈ heightPx` to confirm.
- **Facing**: side views face right. Mirror at runtime for left. The hero front view faces the camera (`down`), and the back view faces away (`up`).

## Keying and colour

Matte colours are magenta `#FF00FF` (default) and cyan `#00FFFF` (`bloater`, `parkur`, `boss_bride`, `boss_bloater`, all sheets, because they wear magenta or pink). The matte is the border-connected region within tolerance 44 (Euclidean RGB). Enclosed pockets of exact matte colour (tolerance 20, capped at 35% of the sheet) are cleared too. Edge pixels are unmixed (`p = aF + (1 − a)M`), and a final despill pass removes key tint from opaque pixels next to transparency. Pink, purple and green clothing is not affected, because it sits outside the matte tolerance.

Downscaling is area-averaged with premultiplied alpha, so transparent colour does not leak into edges.

## Encoding

Each PNG atlas is either `png8` (a 256-colour palette, median cut with three Lloyd iterations, alpha in tRNS) or `png32` (RGBA). A palette is used when `colourError.over8` is at most `paletteMaxOver8` (0.12). `colourError` is measured on alpha at least 128 pixels: `over8` is the share with an error above 8 levels in any channel, and `p99` and `max` are the 99th percentile and the maximum. Every character atlas in the current build is `png8` (over8 0.016 to 0.082). Props, weapons, pickups, effects and vehicles are `png8` where the gate passes. The rest stay `png32`. To force RGBA everywhere, set `paletteMaxOver8` to 0.

## Reading the report

The report prints the number of prompt outputs, units built, reused and rejected, the size per category (MiB), then per-category checks. Lines beginning `flagged` are ground tiles that failed a threshold. Lines beginning `warnings` are per unit, with the unit id first. Common warnings:

- `scale ... enlarges the source`: the source is smaller than the target height, so the atlas is upscaled and lines soften. Regenerate the source at the target size.
- `seam score ...`: the wrap edge differs from its neighbours. Poor seams show as a line when tiles repeat. Regenerate the tile or move it to a feature slot.
- `mean L* ... outside`: the tile is too dark or too bright for the palette.
- `enclosed matte region(s) too large to clear, kept`: an exact-matte hole inside the figure was larger than the cap, so it stays opaque. The generator leaked the matte colour into the figure.
- `rejected`: the source failed a hard check (wrong size, no figure, bad alpha). Its status is `rejected` in `sources`, and the exit code is 1.

## Current known issues

- Bosses `boss_vatman` and `boss_bigbro` are upscaled (1.25 and 1.18). Their idle frames are 408 and 434 px, not the 512 px target. Regenerate at 512 px.
- Ground tiles `gnd_halic_a`, `_b`, `_c`, `_d`, `_steps` and `gnd_istiklal_a`, `_b`, `_d` have poor wrap seams (2.2 to 3.8). Regenerate or use as features.
- `gnd_karakoy_wateredge` is a shore-band feature. The high seam score is expected.
- Hand-wired hoods (bridge, galata, saray) are listed in `props` with `handwired: true`, but no atlas is written for them.
- Total output is about 27.6 MiB, under the 30 MiB goal. Storing the hero RGBA would add about 1.1 MiB.
