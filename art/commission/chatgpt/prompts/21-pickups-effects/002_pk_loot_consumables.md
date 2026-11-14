# 21-pickups-effects/pk_loot_consumables: pk_loot_consumables

| | |
|---|---|
| Batch | 21-pickups-effects |
| Kind | pickup |
| Ask ChatGPT for | 1536 x 1024 (4 x 3 cells) |
| Background | flat magenta #FF00FF |
| Save as | `art/commission/in/21-pickups-effects/pk_loot_consumables.png` |

## Attach these files to the message
- pk_xp_droplets.png

## Paste this into ChatGPT

```text
Context: this is an effect or pickup sheet for Project Istanbul, a portrait phone game in which a student walks home through a zombie-filled Istanbul. The sheet supplies small flat pictures that the game places on the arena and on the HUD.

Deliverable: one landscape image, 1536 x 1024 pixels, Four cells per row, three rows, left to right, top to bottom: (1) heal cross, (2) power star, (3) objective pin, (4) jeton coin; (5) hurda scrap pile, (6) simit ring pickup, (7) chest closed, (8) chest open; (9) eczane heal-station sign, (10) büfe kiosk heal-station sign, (11) empty, (12) empty. Flat magenta #FF00FF background over the whole image; each cell has the same scale; nothing touches a cell edge; no grid lines, no labels, no numbers, no arrows.

Subject: Currency and loot icons, drawn as flat, outlined icons on the magenta: (1) heal cross: a green #2EBD6B plus sign with a night ink #14151F outline, the config heal icon. (2) power star: a five-point star in simit gold #E9A23B with a night ink outline. (3) objective pin: a map pin in blue #3D8BFF with a round hole. (4) jeton coin: a round coin in simit gold #E9A23B with an inner ring line (no numbers, no letters). (5) hurda scrap: a small pile of bent steel scraps in stone grey #8A8F98 and night ink. (6) simit ring: a bread ring in simit gold #E9A23B with paper cream #F4EBDD sesame dots. (7) chest closed: a small wooden chest in tea amber #B5651D with simit gold #E9A23B bands and a night ink lock, about 0.8 m wide. (8) chest open: the same chest with the lid up and a flat simit gold glint inside. (9) eczane sign: a cream plate with a green #2EBD6B cross. (10) büfe sign: a scalloped awning in tram red #D7263D and paper cream stripes over a tea glass in tea amber. (11) and (12): empty magenta cells. Sizes: each icon is about 0.8 m across at arena scale.

Camera: straight from above for the flat icons (no perspective), and three-quarter top-down for any object with height. A flat shadow tone only on the lower-right faces of an object, no cast shadow on the magenta.

Style: Art style "Ink & Tea": bold comic-book ink outlines in near-black #14151F with the same line weight on every object and character (the outline is about 3% of the object height), flat cel shading with exactly two or three tones per colour (base, shadow, optional highlight), no airbrush, no soft gradients on objects, no textures on objects, warm amber key light from the upper left, cool blue shadow (#1B4965 at low strength) on the lower right, stylised readable object shapes, a clean outer silhouette that stays readable at phone size, the same look as the characters.

Background: one perfectly flat, uniform magenta (#FF00FF) colour over the whole image, with no gradient, no noise, no vignette and no lighting on it; nothing of that colour inside the figure, and no soft glow or halo around the figure (hard clean edges, because the colour is removed afterwards).

Do not include: any text, letters, numbers, logos, real brand names, flags, religious symbols, gore, blood pools, exposed organs, photorealism, painterly brush texture, a watermark, a signature, a border or frame, a floor, a ground shadow, a cast shadow, a vignette, a gradient background or any background scenery.

Consistency: the attached file pk_xp_droplets.png is the approved look of the pickup family; match its outline weight, flat tones and icon size.

Reserved colours that must not appear as decoration: cyan #3DDCFF (the player ring), orange-red #FF4D2E (enemy warnings), gold-yellow #FFD166 (healing).

Generate the image now. Do not ask me questions.
```

## Accept the image only if
- [ ] Four columns and three rows, each icon in its own cell, the two empty cells are flat magenta.
- [ ] The heal cross is green #2EBD6B, the star and coin are simit gold #E9A23B, the objective pin is blue #3D8BFF.
- [ ] The chest is tea amber and simit gold, not #FFD166 (the reserved heal colour).
- [ ] Each icon has a near-black #14151F outline, flat tones, and no glow.
- [ ] The heal signs have no letters: the cross and the awning are symbols only.
- [ ] Flat magenta #FF00FF background, no grid lines, no labels, no numbers.

## If it fails
- Reply: "The chest is yellow-gold like the heal colour. Use tea amber and simit gold for the chest body, keep everything else identical."
- Reply: "A sign has letters on it. Remove the letters and leave the plate blank. Keep everything else identical."

## Notes
view/consumables.js classes heal (cross, #2EBD6B), power (star), currency (coin), objective (pin, #3D8BFF); view/consumables-icons.js shapes; config-feel.js chest colour #FFD166 (reserved, not used here).
