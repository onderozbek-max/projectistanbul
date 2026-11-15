# 20-weapons/wpn_evo_grinder: wpn_evo_grinder

| | |
|---|---|
| Batch | 20-weapons |
| Kind | weapon-evolution |
| Ask ChatGPT for | 1536 x 1024 (2 cells: icon and in-world sprite) |
| Background | flat magenta #FF00FF |
| Save as | `art/commission/in/20-weapons/wpn_evo_grinder.png` |

## Attach these files to the message
- wpn_chainsaw_icon.png
- wpn_chainsaw_t5.png

## Paste this into ChatGPT

```text
Context: this is the evolved form of the chainsaw bar (base weapon) called the grinding wheel in Project Istanbul, a portrait phone game in which a student walks home through a zombie-filled Istanbul. Evolving the weapon replaces the base weapon in its slot, so the player must see that the evolution is a different and bigger object.

Deliverable: one landscape image, 1536 x 1024 pixels, two equal cells side by side (each 768 x 1024 pixels, no lines between them). Left cell: the evolution's inventory icon, centred, square 512 pixels, the same icon style as the attached wpn_chainsaw_icon.png. Right cell: the in-world sprite of the evolution at its top level (L5), centred, the largest shape in this sheet. Flat magenta background over the whole image.

Subject, the evolution: a round grinder disc in amber (#FFB347) with spokes and a steel hub. The in-world shape: a spinning wheel with the number of spokes at the hero's hand, sparks off its rim. It is a different object from the base weapon, bigger, with its own silhouette; it is not a recolour of the base. No hand, no arm, no character.

Tier table of the evolution (L1 to L5; the right cell shows the L5 look): Size (the base shape scaled): L1 100 percent, L2 110 percent, L3 120 percent, L4 130 percent, L5 145 percent. Number of elements: 6 at L1, 7 at L2, 9 at L3, 10 at L4, 12 at L5. Glow radius around the shape: L1 0.30 m, L2 0.38 m, L3 0.46 m, L4 0.56 m, L5 0.66 m. Trail behind the shape (share of the shape length): L1 40 percent, L2 50 percent, L3 60 percent, L4 70 percent, L5 80 percent. Afterimage copies: 0 at L1 to L3, 1 at L4 to L5. Shock ring: a shock ring appears at L5. Colour ramp: L1 #FFB347 (the weapon's own start colour), L3 simit gold #E9A23B (the warm mid tone), L5 #FFFFFF (the top, white-hot or the weapon's own end colour); the levels in between are blends of these three.

Camera: three-quarter top-down for the sprite, about 55 degrees; a straight icon view for the left cell. Outline in near-black #14151F on the solid parts. The glow is a flat, hard-edged band in the evolution's own colours.

Style: Art style "Ink & Tea": bold comic-book ink outlines in near-black #14151F with the same line weight on every object and character (the outline is about 3% of the object height), flat cel shading with exactly two or three tones per colour (base, shadow, optional highlight), no airbrush, no soft gradients on objects, no textures on objects, warm amber key light from the upper left, cool blue shadow (#1B4965 at low strength) on the lower right, stylised readable object shapes, a clean outer silhouette that stays readable at phone size, the same look as the characters.

Background: one perfectly flat, uniform magenta (#FF00FF) colour over the whole image, with no gradient, no noise, no vignette and no lighting on it; nothing of that colour inside the weapon. The only glow allowed is the weapon's own, drawn as a flat, hard-edged band in the colours named above; no soft halo on the background.

Do not include: any text, letters, numbers, logos, real brand names, flags, religious symbols, gore, blood pools, exposed organs, photorealism, painterly brush texture, a watermark, a signature, a border or frame, a floor, a ground shadow, a cast shadow, a vignette, a gradient background or any background scenery.

Not present: no hand, no arm, no person, no text, no numbers, no letters, no logos, no impact sparks, no reserved colours (no #3DDCFF, no #FF4D2E, no #FFD166 as decoration).

Consistency: the attached file wpn_chainsaw_icon.png is the approved base icon, and the attached file wpn_chainsaw_t5.png is the approved base weapon at its top level (L5). The evolution must match their outline weight and shading and must be clearly the bigger, different object.

Generate the image now. Do not ask me questions.
```

## Accept the image only if
- [ ] 1536 by 1024, two cells side by side: the icon on the left, the in-world L5 sprite on the right.
- [ ] The evolution is clearly a different and bigger object than the attached base L5 (wpn_chainsaw_t5.png), not a recolour of it.
- [ ] The icon matches the attached base icon in outline weight, light and shading.
- [ ] Flat magenta #FF00FF background; no magenta inside the objects; no grid lines or labels.
- [ ] No hand, no arm, no text, no numbers, no logos, no impact sparks.
- [ ] Colour ramp from the start colour to white-hot with the simit gold mid tone; no #FFD166 and no #3DDCFF.

## If it fails
- Reply: "The evolution looks like the base weapon, only recoloured. Redraw the in-world sprite as the bigger, different form in the subject (grinding wheel). Keep the icon identical."
- Reply: "There is a hand or an arm. Remove it, the weapon floats alone. Keep everything else identical."

## Notes
Source: config.js evolutions.grinder (from chainsaw, passive gloves); config-weapon-tiers.js evos.grinder (sil grindWheel, cls slash).
