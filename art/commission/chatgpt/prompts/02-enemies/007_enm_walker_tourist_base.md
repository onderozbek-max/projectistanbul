# enm-walker_tourist-base: enm_walker_tourist_base

| | |
|---|---|
| Batch | 02-enemies |
| Kind | enemy: base design (Step A) |
| Ask ChatGPT for | 1024 x 1024 pixels, square |
| Background | flat magenta #FF00FF |
| Save as | `art/commission/in/02-enemies/enm_walker_tourist_base.png` |

## Attach these files to the message
- ref_current_enemy_lineup_2x.png (in art/commission/refs/): rough reference only, for the silhouette feature and accents.

## Paste this into ChatGPT

```text
Project Istanbul is a portrait, one-thumb survivor game: Arda, a 20-year-old student, walks home through a zombie-overrun Istanbul while dozens of zombies crowd the phone screen. This is the enemy design "walker, tourist outfit" (walker: four outfits (briefcase, backpack, two bags, sun hat with camera)), one of the zombies that crowd the screen. This image is its single base design; later pose sheets copy it.

Deliverable: one image, 1024 x 1024 pixels, square. One full-body zombie, idle, centred, feet on the bottom centre, about 80% of the picture height, an even margin all round, nothing touching the edge.

Subject: average build, hunched, shambling. Head: head tilted to one side. Face: slack open mouth, pale glowing eyes (#E4F0A8 with a black pupil). Clothing: a short-sleeved t-shirt in teal #2FA59A; trousers in khaki #8B7355, shoes in light grey #EDEDED; short brown #6B4A2E hair. Accent colour teal #2FA59A on the teal t-shirt and the teal band of the sun hat. Silhouette feature, which must read as a solid black shape at 48 px: walker: four outfits (briefcase, backpack, two bags, sun hat with camera). Extra: a paper sun hat (paper cream #F4EBDD) with a teal band, a small camera (body #2A2D38, lens #8A8F98) on a strap at the chest.

Pose (idle): hunched, head tilted, arms hanging forward with loose hands.

Camera: top-down three-quarter view, about 55 degrees above the ground: the viewer sees the top of the head and shoulders, the face and the front of the torso, and the feet; the ground plane is not foreshortened.

The figure faces RIGHT of the image (profile-leaning three-quarter, the near shoulder toward the viewer).

Art style "Ink & Tea": bold comic-book ink outlines in near-black #14151F with the same line weight on every character (the outline is about 3% of the figure height), flat cel shading with exactly two or three tones per colour (base, shadow, optional highlight), no airbrush, no soft gradients on figures, no textures on figures, warm amber key light from the upper left, cool blue shadow (#1B4965 at low strength) on the lower right, stylised readable proportions with a big head (about three heads tall), slightly exaggerated hands and feet, a clean outer silhouette that stays readable when the figure is 50 pixels tall.

Background: one perfectly flat, uniform magenta (#FF00FF) colour over the whole image, with no gradient, no noise, no vignette and no lighting on it; nothing of that colour inside the figure, and no soft glow or halo around the figure (hard clean edges, because the colour is removed afterwards).

Do not include: any text, letters, numbers, logos, real brand names, flags, religious symbols, gore, blood pools, exposed organs, photorealism, painterly brush texture, a watermark, a signature, a border or frame, a floor, a ground shadow, a cast shadow, a vignette, a gradient background or any background scenery. No watermark, no numbers, no arrows, no labels.

Consistency: the attached file ref_current_enemy_lineup_2x.png is a rough design reference only. Copy the silhouette feature and the colour accents of the figure named "walker v3" from this reference sheet, but redraw it in the Ink & Tea style described; do not copy its rendering.

Generate the image now. Do not ask me questions.
```

## Accept the image only if
- [ ] The silhouette feature is present and reads as a solid black shape: walker: four outfits (briefcase, backpack, two bags, sun hat with camera).
- [ ] The accent colour teal #2FA59A is on the teal t-shirt and the teal band of the sun hat, and nowhere else as a big area.
- [ ] Outfit and colours match the lineup figure named "walker v3" (same garments, not its rendering).
- [ ] Bold near-black #14151F outline of one weight, flat two or three tone cel shading.
- [ ] Pale glowing eyes (no red or orange eyes); desaturated olive skin; no gore, no blood pools.
- [ ] One figure, idle, facing right, centred, feet on the bottom centre, about 80% of the picture height.
- [ ] Background is one flat #FF00FF magenta: no gradient, no floor, no shadow.

## If it fails
- Background gradient or shadow: "Make the background one perfectly flat #FF00FF magenta with no gradient and no ground shadow. Keep everything else identical."
- Wrong silhouette feature or accent: "Keep the walker: four outfits (briefcase, backpack, two bags, sun hat with camera) silhouette and make the accent teal #2FA59A on the teal t-shirt and the teal band of the sun hat. Keep everything else identical."
- Photographic or airbrushed look: "Redo in flat cel shading with bold near-black #14151F outlines and no airbrush. Keep the pose and the outfit identical."

## Notes
DESIGN CHOICE: config gives the walker one accent (#1F4E79, the office suit). It stays on the office outfit; the student, shopper and tourist use their own outfit colour as the accent (named in the prompt). Save the chosen image as enm_walker_tourist_base.png in art/commission/in/02-enemies/. Sheet 8 attaches it.
