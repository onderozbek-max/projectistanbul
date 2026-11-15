# boss-guide-base: boss_guide_base

| | |
|---|---|
| Batch | 03-bosses |
| Kind | boss: base design (Step A) |
| Ask ChatGPT for | 1024 x 1024 pixels, square |
| Background | flat magenta #FF00FF |
| Save as | `art/commission/in/03-bosses/boss_guide_base.png` |

## Attach these files to the message
- enm_brute_base.png (in art/commission/in/02-enemies/)
- ref_current_enemy_lineup_2x.png (in art/commission/refs/): rough reference only.

## Paste this into ChatGPT

```text
Project Istanbul is a portrait, one-thumb survivor game: Arda, a 20-year-old student, walks home through a zombie-overrun Istanbul while dozens of zombies crowd the phone screen. This is the boss "Tour Guide", the big fight at the end of a district (galata). This image is its single base design.

Deliverable: one image, 1024 x 1024 pixels, square. One full-body boss, idle, centred, feet on the bottom centre, the figure about 80% of the picture height, an even margin all round, nothing touching the edge.

Subject: a huge broad brute body with the large shoulders of the brute type and a wide stance. Build: bigger and broader than an ordinary zombie of its type, with the same three-heads proportions and a larger body, never a taller head. Head: the brute head, sunk into the shoulders. Clothing: a striped shirt in paper cream #F4EBDD with bosphorus blue #1B4965 stripes and collar; trousers in slate navy #2B3346, shoes in off-white #F4F1EA; short dark brown #2A1E16 hair; a simit gold #E9A23B cap; round wire glasses. Costume and props: a gold megaphone (#E9A23B) held in the right hand at hip height; a teal lanyard badge (#2E6F7E) with a paper-white card (#F4F1EA) hanging on the chest. Accent colour simit gold #E9A23B on the gold visor cap and the gold megaphone. Silhouette feature, which must read as a solid black shape: gold visor cap, megaphone, guide lanyard.

Pose (idle): standing upright, the megaphone held at the hip in the right hand, pointing forward.

Camera: top-down three-quarter view, about 55 degrees above the ground: the viewer sees the top of the head and shoulders, the face and the front of the torso, and the feet; the ground plane is not foreshortened.

The figure faces RIGHT of the image (profile-leaning three-quarter, the near shoulder toward the viewer).

Art style "Ink & Tea": bold comic-book ink outlines in near-black #14151F with the same line weight on every character (the outline is about 3% of the figure height), flat cel shading with exactly two or three tones per colour (base, shadow, optional highlight), no airbrush, no soft gradients on figures, no textures on figures, warm amber key light from the upper left, cool blue shadow (#1B4965 at low strength) on the lower right, stylised readable proportions with a big head (about three heads tall), slightly exaggerated hands and feet, a clean outer silhouette that stays readable when the figure is 50 pixels tall.

Background: one perfectly flat, uniform magenta (#FF00FF) colour over the whole image, with no gradient, no noise, no vignette and no lighting on it; nothing of that colour inside the figure, and no soft glow or halo around the figure (hard clean edges, because the colour is removed afterwards).

Do not include: any text, letters, numbers, logos, real brand names, flags, religious symbols, gore, blood pools, exposed organs, photorealism, painterly brush texture, a watermark, a signature, a border or frame, a floor, a ground shadow, a cast shadow, a vignette, a gradient background or any background scenery. No watermark, no numbers, no arrows, no labels. No real company logos, no transit livery, no caricature of any ethnic group, no religious dress or symbols, no gore.

Consistency: the attached file enm_brute_base.png is the approved base of the zombie type this boss is built from: keep its body, outfit colours and proportions, only bigger and with the costume above. Also attached: ref_current_enemy_lineup_2x.png, a rough reference: copy the silhouette feature and the colour accents of the figure named "galata" from this reference sheet, but redraw it in the Ink & Tea style described; do not copy its rendering.

Generate the image now. Do not ask me questions.
```

## Accept the image only if
- [ ] One boss figure, idle, facing right, centred, feet on the bottom centre, about 80% of the picture height.
- [ ] Silhouette feature present and readable as a solid black shape: gold visor cap, megaphone, guide lanyard.
- [ ] Accent simit gold #E9A23B on the gold visor cap and the gold megaphone.
- [ ] Four-heads proportions with a larger body: not a taller, thinner adult.
- [ ] Bold near-black #14151F outline of one weight, flat two or three tone cel shading, no airbrush.
- [ ] Background is one flat #FF00FF magenta: no gradient, no floor, no shadow.
- [ ] No text, logos, real brands, flags, religious dress or gore.

## If it fails
- Background gradient or shadow: "Make the background one perfectly flat #FF00FF magenta with no gradient and no ground shadow. Keep everything else identical."
- Feature missing or not the same: "Keep the gold visor cap, megaphone, guide lanyard and the accent simit gold #E9A23B. Keep everything else identical."
- Caricature or gore: "Remove the caricature: keep the boss comic and respectful, no gore, no blood. Keep the pose and outfit identical."

## Notes
Tour Guide. Used in: galata (level 10 of the journey, first boss of this design). Scale: the game draws bosses about 2.2 times their zombie type; the picture is framed like every other figure, so the scale is applied in the game, not in the art. Costume from config bossCostumes (boss.galata) and the outfit boss_guide in art-enemy-look.js. Save as boss_guide_base.png in art/commission/in/03-bosses/. Sheets attach it.
