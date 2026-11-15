# 21-pickups-effects/fx_hit_sparks: fx_hit_sparks

| | |
|---|---|
| Batch | 21-pickups-effects |
| Kind | effect |
| Ask ChatGPT for | 1536 x 1024 (3 x 2 cells) |
| Background | flat magenta #FF00FF |
| Save as | `art/commission/in/21-pickups-effects/fx_hit_sparks.png` |

## Attach these files to the message
- none (this is the first image of its kind)

## Paste this into ChatGPT

```text
Context: this is an effect or pickup sheet for Project Istanbul, a portrait phone game in which a student walks home through a zombie-filled Istanbul. The sheet supplies small flat pictures that the game places on the arena and on the HUD.

Deliverable: one landscape image, 1536 x 1024 pixels, Six cells in a 3 x 2 grid, left to right, top to bottom: (1) slash crescent, (2) pierce spike, (3) blunt chip, (4) fire ember, (5) chemical bubble, (6) electric zig. Flat magenta #FF00FF background over the whole image; each cell has the same scale; nothing touches a cell edge; no grid lines, no labels, no numbers, no arrows.

Subject: Six hit-spark shapes, one per damage class, each a single flat shape on the magenta (no outline needed, flat fill with one lighter core), about 0.3 m across at arena scale. (slash) crescent: a flat thin crescent arc of three strokes in #FFFFFF; (pierce) spike: a flat four-point thin spike in #FFF0BE; (blunt) chip: a flat small angular chip with three facets in #B0A69C; (fire) ember: a flat teardrop ember with a bright core in #FF8C28; (chemical) bubble: a flat open ring bubble with a highlight dot in #E2F6FF; (electric) zig: a flat zigzag bolt in two runs in #BEF8FF. The electric zig is pale ice, not the reserved cyan #3DDCFF.

Camera: straight from above for the flat icons (no perspective), and three-quarter top-down for any object with height. A flat shadow tone only on the lower-right faces of an object, no cast shadow on the magenta.

Style: Art style "Ink & Tea": bold comic-book ink outlines in near-black #14151F with the same line weight on every object and character (the outline is about 3% of the object height), flat cel shading with exactly two or three tones per colour (base, shadow, optional highlight), no airbrush, no soft gradients on objects, no textures on objects, warm amber key light from the upper left, cool blue shadow (#1B4965 at low strength) on the lower right, stylised readable object shapes, a clean outer silhouette that stays readable at phone size, the same look as the characters.

Background: one perfectly flat, uniform magenta (#FF00FF) colour over the whole image, with no gradient, no noise, no vignette and no lighting on it; nothing of that colour inside the figure, and no soft glow or halo around the figure (hard clean edges, because the colour is removed afterwards).

Do not include: any text, letters, numbers, logos, real brand names, flags, religious symbols, gore, blood pools, exposed organs, photorealism, painterly brush texture, a watermark, a signature, a border or frame, a floor, a ground shadow, a cast shadow, a vignette, a gradient background or any background scenery.

Consistency: this is the first sheet of its family, so it sets the look (outline weight, flat tones and size).

Reserved colours that must not appear as decoration: cyan #3DDCFF (the player ring), orange-red #FF4D2E (enemy warnings), gold-yellow #FFD166 (healing).

Generate the image now. Do not ask me questions.
```

## Accept the image only if
- [ ] Six shapes in the stated order, one per cell, same size in each cell.
- [ ] Each shape matches its name: crescent, spike, chip, ember, bubble, zigzag.
- [ ] Colours: slash white #FFFFFF, pierce #FFF0BE, blunt #B0A69C, fire #FF8C28, chemical #E2F6FF, electric #BEF8FF.
- [ ] Flat fills, no glow, no halo, no gradient.
- [ ] Flat magenta background, no magenta inside the shapes, no text.

## If it fails
- Reply: "A shape has a glow or a gradient. Make it flat with one lighter core. Keep everything else identical."

## Notes
config-weapon-tiers.js wtier.impact (shape, col per class). The cable weapon ramp uses the reserved #3DDCFF; the electric spark here is #BEF8FF, because the reserved cyan is not used for sparks.
