# 21-pickups-effects/pk_xp_droplets: pk_xp_droplets

| | |
|---|---|
| Batch | 21-pickups-effects |
| Kind | pickup |
| Ask ChatGPT for | 1536 x 1024 (3 x 2 cells) |
| Background | flat magenta #FF00FF |
| Save as | `art/commission/in/21-pickups-effects/pk_xp_droplets.png` |

## Attach these files to the message
- none (this is the first image of its kind)

## Paste this into ChatGPT

```text
Context: this is an effect or pickup sheet for Project Istanbul, a portrait phone game in which a student walks home through a zombie-filled Istanbul. The sheet supplies small flat pictures that the game places on the arena and on the HUD.

Deliverable: one landscape image, 1536 x 1024 pixels, Top row, left to right: small XP droplet (green), medium XP droplet (blue), large XP droplet (violet with a sparkle). Bottom row: the same three droplets in a second pose, tilted 20 degrees (variant B). Flat magenta #FF00FF background over the whole image; each cell has the same scale; nothing touches a cell edge; no grid lines, no labels, no numbers, no arrows.

Subject: XP droplets, the arena pickups the hero collects. Each is a droplet shape (a round bottom and a point at the top), outlined in night ink #14151F, flat cel shading with a base, a darker shadow tone and one highlight. Small: green #5BD16E, about 0.4 m across. Medium: blue #3D8BFF, about 0.8 m across. Large: violet #8E7CFF, about 1.3 m across, with a four-point white sparkle on its upper-left shoulder (flat, no glow). The three sizes keep the ratio 0.4 : 0.8 : 1.3 (small to large).

Camera: straight from above for the flat icons (no perspective), and three-quarter top-down for any object with height. A flat shadow tone only on the lower-right faces of an object, no cast shadow on the magenta.

Style: Art style "Ink & Tea": bold comic-book ink outlines in near-black #14151F with the same line weight on every object and character (the outline is about 3% of the object height), flat cel shading with exactly two or three tones per colour (base, shadow, optional highlight), no airbrush, no soft gradients on objects, no textures on objects, warm amber key light from the upper left, cool blue shadow (#1B4965 at low strength) on the lower right, stylised readable object shapes, a clean outer silhouette that stays readable at phone size, the same look as the characters.

Background: one perfectly flat, uniform magenta (#FF00FF) colour over the whole image, with no gradient, no noise, no vignette and no lighting on it; nothing of that colour inside the figure, and no soft glow or halo around the figure (hard clean edges, because the colour is removed afterwards).

Do not include: any text, letters, numbers, logos, real brand names, flags, religious symbols, gore, blood pools, exposed organs, photorealism, painterly brush texture, a watermark, a signature, a border or frame, a floor, a ground shadow, a cast shadow, a vignette, a gradient background or any background scenery.

Consistency: this is the first sheet of its family, so it sets the look (outline weight, flat tones and size).

Reserved colours that must not appear as decoration: cyan #3DDCFF (the player ring), orange-red #FF4D2E (enemy warnings), gold-yellow #FFD166 (healing).

Generate the image now. Do not ask me questions.
```

## Accept the image only if
- [ ] Three sizes, clearly different: small, medium and large in that order, left to right.
- [ ] Colours: small green #5BD16E, medium blue #3D8BFF, large violet #8E7CFF with a sparkle.
- [ ] Droplet shape with a round bottom and a point at the top; outline in near-black #14151F.
- [ ] Flat tones, no gradient, no glow, no halo: the sparkle is a flat four-point star.
- [ ] Flat magenta #FF00FF background, no magenta inside the drops, no grid lines or labels.
- [ ] No text, numbers or letters.

## If it fails
- Reply: "The droplets look like balls, not droplets. Make them droplet-shaped with a point at the top. Keep everything else identical."

## Notes
config.js pickup radii r0 0.2 and r1 0.65 m; config-feel.js pickup glint size 0.13 and xp colour 124,240,142 (#7CF08E in config; the design-system token #5BD16E is used here).
