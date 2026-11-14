# 20-weapons/wpn_extinguisher_tiers: wpn_extinguisher_tiers

| | |
|---|---|
| Batch | 20-weapons |
| Kind | weapon-tiers |
| Ask ChatGPT for | 1536 x 1024 (3 x 2 cells, L1 to L5 and an empty cell) |
| Background | flat magenta #FF00FF |
| Save as | `art/commission/in/20-weapons/wpn_extinguisher_tiers.png` |

## Attach these files to the message
- wpn_extinguisher_icon.png

## Paste this into ChatGPT

```text
Context: this is the in-world sprite of the fire extinguisher weapon in Project Istanbul, a portrait phone game in which a student walks home through a zombie-filled Istanbul. The game draws this shape on the arena at five levels (L1 to L5), and each level shows the player that the weapon is growing stronger.

Deliverable: one landscape image, 1536 x 1024 pixels, a 3 x 2 grid of six equal cells (each 512 x 512 pixels, no lines between them). Top row, left to right: L1, L2, L3. Bottom row, left to right: L4, L5, and an EMPTY sixth cell (flat magenta only). Every level is the same object at the same camera. Nothing touches a cell edge.

Subject, the object: the number of foam blobs in the cone from the hero (the hero.a, arc in degrees, range in metres), spreading out over the first moments of the spray. It is the weapon itself, drawn as a projectile or a swing, with no hand, no arm and no character. Scale: the L1 shape is the base size; the tier numbers below scale it. The glow and trail numbers are metres at arena scale, so draw them in proportion to the L1 shape.

Tier table (the game's numbers, do not change them): Size (the base shape scaled): L1 85 percent, L2 95 percent, L3 105 percent, L4 115 percent, L5 130 percent. Number of foam blobs: 6 at L1, 8 at L2, 10 at L3, 12 at L4, 15 at L5. Glow radius around the shape: L1 0.30 m, L2 0.36 m, L3 0.44 m, L4 0.52 m, L5 0.60 m. Trail behind the shape (share of the shape length): L1 30 percent, L2 40 percent, L3 50 percent, L4 60 percent, L5 70 percent. Afterimage copies: 0 at L1 to L3, 1 at L4 to L5. Shock ring: no shock ring at any level.

Colour ramp: L1 #E8F4FF (the weapon's own start colour), L3 #CFEBFF (the mid tone), L5 #FFFFFF (the top, white-hot or the weapon's own end colour); the levels in between are blends of these three.

Each level must be visibly stronger than the one before: bigger, with more foam blobs, a wider glow and a longer trail. L5 is the strongest and the most elaborate. Do not change the silhouette between levels, only its size, count, glow, trail and colour. Impact sparks are not drawn in these cells; they are a separate effect sheet.

Camera: three-quarter top-down, about 55 degrees, the same camera as the characters. Outline in near-black #14151F on the solid parts. The glow and the trail are flat, hard-edged translucent bands in the weapon's own colours, not airbrushed.

Style: Art style "Ink & Tea": bold comic-book ink outlines in near-black #14151F with the same line weight on every object and character (the outline is about 3% of the object height), flat cel shading with exactly two or three tones per colour (base, shadow, optional highlight), no airbrush, no soft gradients on objects, no textures on objects, warm amber key light from the upper left, cool blue shadow (#1B4965 at low strength) on the lower right, stylised readable object shapes, a clean outer silhouette that stays readable at phone size, the same look as the characters.

Background: one perfectly flat, uniform magenta (#FF00FF) colour over the whole image, with no gradient, no noise, no vignette and no lighting on it; nothing of that colour inside the weapon. The only glow allowed is the weapon's own, drawn as a flat, hard-edged band in the colours named above; no soft halo on the background.

Do not include: any text, letters, numbers, logos, real brand names, flags, religious symbols, gore, blood pools, exposed organs, photorealism, painterly brush texture, a watermark, a signature, a border or frame, a floor, a ground shadow, a cast shadow, a vignette, a gradient background or any background scenery.

Not present: no hand, no arm, no person, no text, no numbers, no letters, no logos, no impact sparks, no reserved colours (no #3DDCFF cyan, no #FF4D2E orange-red, no #FFD166 gold-yellow used as decoration).

Consistency: the attached file wpn_extinguisher_icon.png is the approved icon of this weapon. The in-world shape must read as the same object: same material colours, same outline weight.

Generate the image now. Do not ask me questions.
```

## Accept the image only if
- [ ] 1536 by 1024 landscape, a 3 by 2 grid: L1 L2 L3 on top, L4 L5 and an empty magenta cell at the bottom right.
- [ ] Each cell is strictly bigger and brighter than the one before, following the tier numbers (L1 to L5).
- [ ] L5 is the largest with the strongest glow, and the shock ring appears where the tier table says.
- [ ] The same object at every level: same silhouette, same material, only size, count, glow, trail and colour change.
- [ ] Flat magenta #FF00FF background, no magenta inside the shape, no grid lines, no labels, no numbers.
- [ ] No hand or arm; no text or logos anywhere; no impact sparks.
- [ ] Colour ramp from the start colour to white-hot, with the simit gold #E9A23B mid tone; no #FFD166 and no #3DDCFF.
- [ ] Matches the attached wpn_extinguisher_icon.png material colours.

## If it fails
- Reply: "Levels do not grow in order. Make L2 bigger than L1, L3 bigger than L2, and so on, as the numbers say. Keep the silhouette identical."
- Reply: "There is a hand or an arm in one of the cells. Remove it, keep everything else identical."
- Reply: "The empty sixth cell has something in it. Make it flat magenta only. Keep everything else identical."

## Notes
Source: config-weapon-tiers.js weapons.extinguisher (sil foamCone, cls chemical, live sprays, life 0.45 s). Save the sheet as wpn_extinguisher_tiers.png and crop cell 5 to wpn_extinguisher_t5.png for the evolution prompt.
