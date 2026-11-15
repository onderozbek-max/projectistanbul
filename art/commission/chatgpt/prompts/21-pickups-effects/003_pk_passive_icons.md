# 21-pickups-effects/pk_passive_icons: pk_passive_icons

| | |
|---|---|
| Batch | 21-pickups-effects |
| Kind | pickup |
| Ask ChatGPT for | 1536 x 1024 (4 x 3 cells) |
| Background | flat magenta #FF00FF |
| Save as | `art/commission/in/21-pickups-effects/pk_passive_icons.png` |

## Attach these files to the message
- pk_loot_consumables.png

## Paste this into ChatGPT

```text
Context: this is an effect or pickup sheet for Project Istanbul, a portrait phone game in which a student walks home through a zombie-filled Istanbul. The sheet supplies small flat pictures that the game places on the arena and on the HUD.

Deliverable: one landscape image, 1536 x 1024 pixels, Four cells per row, three rows, left to right, top to bottom: (1) nazar charm, (2) magnet, (3) shoes, (4) jacket; (5) gloves, (6) energy drink, (7) first-aid kit, (8) cologne bottle; (9) tea glass, (10) turkish delight box, (11) power bank, (12) helmet. Flat magenta #FF00FF background over the whole image; each cell has the same scale; nothing touches a cell edge; no grid lines, no labels, no numbers, no arrows.

Subject: Twelve passive upgrade icons, one per cell, drawn in the icon style of the attached pk_loot_consumables.png: (1) nazar charm: a blue glass eye bead in bosphorus blue #1B4965 with paper cream #F4EBDD rings and a night ink #14151F pupil. (2) magnet: a horseshoe magnet with tram red #D7263D and paper cream #F4EBDD ends. (3) shoes: a running shoe in paper cream #F4EBDD with a tram red #D7263D stripe. (4) jacket: a bomber jacket in bosphorus blue #1B4965 with a tea amber #B5651D cuff. (5) gloves: work gloves in tea amber #B5651D. (6) energy drink: a plain can in simit gold #E9A23B, no brand. (7) first-aid kit: a small case in paper cream #F4EBDD with a heal green #2EBD6B cross. (8) cologne bottle: a tea amber #B5651D glass bottle with a blank paper cream label. (9) tea glass: a tulip tea glass with tea amber tea and a simit gold rim. (10) turkish delight box: a box in paper cream with faded pink #D98BA0 cubes. (11) power bank: a night ink #14151F block with a simit gold #E9A23B bolt shape (a flat shape, not a letter). (12) helmet: a tram red #D7263D helmet. Each icon about 0.8 m across at arena scale.

Camera: straight from above for the flat icons (no perspective), and three-quarter top-down for any object with height. A flat shadow tone only on the lower-right faces of an object, no cast shadow on the magenta.

Style: Art style "Ink & Tea": bold comic-book ink outlines in near-black #14151F with the same line weight on every object and character (the outline is about 3% of the object height), flat cel shading with exactly two or three tones per colour (base, shadow, optional highlight), no airbrush, no soft gradients on objects, no textures on objects, warm amber key light from the upper left, cool blue shadow (#1B4965 at low strength) on the lower right, stylised readable object shapes, a clean outer silhouette that stays readable at phone size, the same look as the characters.

Background: one perfectly flat, uniform magenta (#FF00FF) colour over the whole image, with no gradient, no noise, no vignette and no lighting on it; nothing of that colour inside the figure, and no soft glow or halo around the figure (hard clean edges, because the colour is removed afterwards).

Do not include: any text, letters, numbers, logos, real brand names, flags, religious symbols, gore, blood pools, exposed organs, photorealism, painterly brush texture, a watermark, a signature, a border or frame, a floor, a ground shadow, a cast shadow, a vignette, a gradient background or any background scenery.

Consistency: the attached file pk_loot_consumables.png is the approved look of the pickup family; match its outline weight, flat tones and icon size.

Reserved colours that must not appear as decoration: cyan #3DDCFF (the player ring), orange-red #FF4D2E (enemy warnings), gold-yellow #FFD166 (healing).

Generate the image now. Do not ask me questions.
```

## Accept the image only if
- [ ] Twelve icons, one per cell in the order listed, the grid even and the cells equal.
- [ ] Each icon is recognisable at 256 pixels and has a near-black #14151F outline with flat tones.
- [ ] The nazar charm is the blue eye bead (no other icon uses bosphorus blue as its main colour except the jacket).
- [ ] No brand on the energy drink, no logo anywhere, no letters or numbers.
- [ ] The power bank bolt is a flat shape, not text.
- [ ] Flat magenta #FF00FF background, no grid lines, no labels.

## If it fails
- Reply: "The energy drink has a brand or letters. Make it a plain can with no lettering. Keep everything else identical."

## Notes
config.js passives list (12 ids: shoes, jacket, gloves, energy, medkit, nazar, magnet, kolonya, cay, lokum, powerbank, kask); the medkit uses the heal green.
