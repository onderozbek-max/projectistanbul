# 21-pickups-effects/fx_dust_smoke: fx_dust_smoke

| | |
|---|---|
| Batch | 21-pickups-effects |
| Kind | effect |
| Ask ChatGPT for | 1536 x 1024 (3 x 2 cells) |
| Background | flat magenta #FF00FF |
| Save as | `art/commission/in/21-pickups-effects/fx_dust_smoke.png` |

## Attach these files to the message
- none (this is the first image of its kind)

## Paste this into ChatGPT

```text
Context: this is an effect or pickup sheet for Project Istanbul, a portrait phone game in which a student walks home through a zombie-filled Istanbul. The sheet supplies small flat pictures that the game places on the arena and on the HUD.

Deliverable: one landscape image, 1536 x 1024 pixels, Six cells in a 3 x 2 grid: top row dust puff A, dust puff B, smoke wisp A; bottom row smoke wisp B, ash wisp A, ash wisp B. Flat magenta #FF00FF background over the whole image; each cell has the same scale; nothing touches a cell edge; no grid lines, no labels, no numbers, no arrows.

Subject: Six flat effect shapes on the magenta, each about 0.6 m across at arena scale: dust puffs (paper cream #F4EBDD and stone grey #8A8F98, two flat cloud-like circles, no outline), smoke wisps (stone grey #8A8F98 with a paler edge, flat curling shapes, no outline), ash wisps (the death dissolve, stone grey #8A8F98 at a low value, rising thin curls, flat). No fire, no sparks, no glow.

Camera: straight from above for the flat icons (no perspective), and three-quarter top-down for any object with height. A flat shadow tone only on the lower-right faces of an object, no cast shadow on the magenta.

Style: Art style "Ink & Tea": bold comic-book ink outlines in near-black #14151F with the same line weight on every object and character (the outline is about 3% of the object height), flat cel shading with exactly two or three tones per colour (base, shadow, optional highlight), no airbrush, no soft gradients on objects, no textures on objects, warm amber key light from the upper left, cool blue shadow (#1B4965 at low strength) on the lower right, stylised readable object shapes, a clean outer silhouette that stays readable at phone size, the same look as the characters.

Background: one perfectly flat, uniform magenta (#FF00FF) colour over the whole image, with no gradient, no noise, no vignette and no lighting on it; nothing of that colour inside the figure, and no soft glow or halo around the figure (hard clean edges, because the colour is removed afterwards).

Do not include: any text, letters, numbers, logos, real brand names, flags, religious symbols, gore, blood pools, exposed organs, photorealism, painterly brush texture, a watermark, a signature, a border or frame, a floor, a ground shadow, a cast shadow, a vignette, a gradient background or any background scenery.

Consistency: this is the first sheet of its family, so it sets the look (outline weight, flat tones and size).

Reserved colours that must not appear as decoration: cyan #3DDCFF (the player ring), orange-red #FF4D2E (enemy warnings), gold-yellow #FFD166 (healing).

Generate the image now. Do not ask me questions.
```

## Accept the image only if
- [ ] Six shapes in the stated order: two dust puffs, two smoke wisps, two ash wisps.
- [ ] Flat fills with no outline and no gradient; the shapes are soft-edged only by flat stepping.
- [ ] Colours: paper cream #F4EBDD and stone grey #8A8F98 only.
- [ ] No fire, no sparks, no glow.
- [ ] Flat magenta background, no text.

## If it fails
- Reply: "The wisps have a gradient or an airbrushed edge. Make them flat with a paler edge. Keep everything else identical."

## Notes
design-system section 2 (deaths dissolve into ash-grey wisps); config.js wisp alpha 0.38 (the game sets the alpha in code).
