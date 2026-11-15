# enm-kasap-base: enm_kasap_base

| | |
|---|---|
| Batch | 02-enemies |
| Kind | enemy: base design (Step A) |
| Ask ChatGPT for | 1024 x 1024 pixels, square |
| Background | flat magenta #FF00FF |
| Save as | `art/commission/in/02-enemies/enm_kasap_base.png` |

## Attach these files to the message
- ref_current_enemy_lineup_2x.png (in art/commission/refs/): rough reference only, for the silhouette feature and accents.

## Paste this into ChatGPT

```text
Project Istanbul is a portrait, one-thumb survivor game: Arda, a 20-year-old student, walks home through a zombie-overrun Istanbul while dozens of zombies crowd the phone screen. This is the enemy design "kasap" (cream apron, cleaver held out, slow wall), one of the zombies that crowd the screen. This image is its single base design; later pose sheets copy it.

Deliverable: one image, 1024 x 1024 pixels, square. One full-body zombie, idle, centred, feet on the bottom centre, about 80% of the picture height, an even margin all round, nothing touching the edge.

Subject: broad and heavy, a big belly, slow. Head: broad head, heavy jowls. Face: angry brows, mouth closed, pale glowing eyes (#E4F0A8 with a black pupil). Clothing: a shirt in brick brown #7A4A3A with a clean cream #EDE6D6 apron tied at the waist; trousers in dark taupe #3E3A35, shoes in charcoal #2A2A2A; a bald head with a fringe of stone grey #8A8F98 hair at the sides. Props: a steel cleaver (blade #D9DEE5, handle #6B4A2E) held out in the right hand at waist height, blade forward. Accent colour cream #EDE6D6 on the cream apron (#EDE6D6), clean with no stains. Silhouette feature, which must read as a solid black shape at 48 px: cream apron, cleaver held out, slow wall.

Pose (idle): slow wall stance, the cleaver held out in front at waist height.

Camera: top-down three-quarter view, about 55 degrees above the ground: the viewer sees the top of the head and shoulders, the face and the front of the torso, and the feet; the ground plane is not foreshortened.

The figure faces RIGHT of the image (profile-leaning three-quarter, the near shoulder toward the viewer).

Art style "Ink & Tea": bold comic-book ink outlines in near-black #14151F with the same line weight on every character (the outline is about 3% of the figure height), flat cel shading with exactly two or three tones per colour (base, shadow, optional highlight), no airbrush, no soft gradients on figures, no textures on figures, warm amber key light from the upper left, cool blue shadow (#1B4965 at low strength) on the lower right, stylised readable proportions with a big head (about three heads tall), slightly exaggerated hands and feet, a clean outer silhouette that stays readable when the figure is 50 pixels tall.

Background: one perfectly flat, uniform magenta (#FF00FF) colour over the whole image, with no gradient, no noise, no vignette and no lighting on it; nothing of that colour inside the figure, and no soft glow or halo around the figure (hard clean edges, because the colour is removed afterwards).

Do not include: any text, letters, numbers, logos, real brand names, flags, religious symbols, gore, blood pools, exposed organs, photorealism, painterly brush texture, a watermark, a signature, a border or frame, a floor, a ground shadow, a cast shadow, a vignette, a gradient background or any background scenery. No watermark, no numbers, no arrows, no labels.

Consistency: the attached file ref_current_enemy_lineup_2x.png is a rough design reference only. Copy the silhouette feature and the colour accents of the figure named "kasap" from this reference sheet, but redraw it in the Ink & Tea style described; do not copy its rendering.

Generate the image now. Do not ask me questions.
```

## Accept the image only if
- [ ] The silhouette feature is present and reads as a solid black shape: cream apron, cleaver held out, slow wall.
- [ ] The accent colour cream #EDE6D6 is on the cream apron (#EDE6D6), clean with no stains, and nowhere else as a big area.
- [ ] Outfit and colours match the lineup figure named "kasap" (same garments, not its rendering).
- [ ] Bold near-black #14151F outline of one weight, flat two or three tone cel shading.
- [ ] Pale glowing eyes (no red or orange eyes); desaturated olive skin; no gore, no blood pools.
- [ ] One figure, idle, facing right, centred, feet on the bottom centre, about 80% of the picture height.
- [ ] Background is one flat #FF00FF magenta: no gradient, no floor, no shadow.

## If it fails
- Background gradient or shadow: "Make the background one perfectly flat #FF00FF magenta with no gradient and no ground shadow. Keep everything else identical."
- Wrong silhouette feature or accent: "Keep the cream apron, cleaver held out, slow wall silhouette and make the accent cream #EDE6D6 on the cream apron (#EDE6D6), clean with no stains. Keep everything else identical."
- Photographic or airbrushed look: "Redo in flat cel shading with bold near-black #14151F outlines and no airbrush. Keep the pose and the outfit identical."

## Notes
DESIGN CHOICE: the view draws dark blood stains on the apron (art-enemies3.js). They are dropped to keep to the no-gore rule. Save the chosen image as enm_kasap_base.png in art/commission/in/02-enemies/. Sheet 36 attaches it.
