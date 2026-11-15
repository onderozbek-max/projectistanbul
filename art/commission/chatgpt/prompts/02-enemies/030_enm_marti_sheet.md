# enm-marti-sheet: enm_marti_sheet

| | |
|---|---|
| Batch | 02-enemies |
| Kind | enemy: pose sheet (Step B) |
| Ask ChatGPT for | 1536 x 1024 pixels, landscape, 3 x 2 grid |
| Background | flat magenta #FF00FF |
| Save as | `art/commission/in/02-enemies/enm_marti_sheet.png` |

## Attach these files to the message
- enm_marti_base.png (in art/commission/in/02-enemies/): the approved base design.

## Paste this into ChatGPT

```text
Project Istanbul is a portrait, one-thumb survivor game: Arda, a 20-year-old student, walks home through a zombie-overrun Istanbul while dozens of zombies crowd the phone screen. This sheet gives the animation frames of one zombie design.

Deliverable: one image, 1536 x 1024 pixels, landscape: a grid of 3 columns and 2 rows, six equal cells of 512 x 512 pixels. Each figure is centred in its cell with at least 60 pixels of empty background around it. Cell order, left to right and top to bottom: top row (1) idle, (2) walk1, (3) walk2; bottom row (4) hit, (5) dead, (6) EMPTY. Each figure is the same zombie at the same scale, its feet (or the body on the paving) on one baseline in each row, about 70% of its cell height. No labels, numbers, arrows or grid lines.

Subject (identical in every cell): a plump white seagull in flight, long pointed wings, seen from above and a little to the side, no legs visible. Head: a small round head with a black eye. Face: a black eye (#14151F) and a short gold beak (#FFB23F). Body and clothing: no clothes: a white body (#F3F5F7), a far wing in grey-blue (#8E9BAA), a near wing in pale grey-blue (#B7C3CF) with black wingtips (#14151F), and a gold beak (#FFB23F). Accent off-white #F4F1EA on the white body and the gold beak. Silhouette feature: gull in flight, gold beak (pigeon in inland hoods).

Poses: (1) idle: both wings raised high in an upstroke, above the body. (2) walk1: wings mid-stroke, level with the body; the body stays at the same height as in idle. (3) walk2: wings down in a downstroke, below the body; the body stays at the same height. (4) hit: tumbling sideways, wings splayed wide, the beak pointing down. (5) dead: fallen bird lying on its side on the paving, wings spread loosely, beak pointing sideways (seen straight from above). (6) EMPTY: the bottom-right cell has only the flat background, no figure.

Gull wing cycle: idle is wings up, walk1 is wings mid-stroke, walk2 is wings down. The body stays in the same place in every cell.

Camera: top-down three-quarter view, about 55 degrees above the ground: the viewer sees the top of the head and shoulders, the face and the front of the torso, and the feet; the ground plane is not foreshortened.

The figure faces RIGHT of the image (profile-leaning three-quarter, the near shoulder toward the viewer). Only the dead cell is seen straight from above.

Art style "Ink & Tea": bold comic-book ink outlines in near-black #14151F with the same line weight on every character (the outline is about 3% of the figure height), flat cel shading with exactly two or three tones per colour (base, shadow, optional highlight), no airbrush, no soft gradients on figures, no textures on figures, warm amber key light from the upper left, cool blue shadow (#1B4965 at low strength) on the lower right, stylised readable proportions with a big head (about three heads tall), slightly exaggerated hands and feet, a clean outer silhouette that stays readable when the figure is 50 pixels tall.

Background: one perfectly flat, uniform magenta (#FF00FF) colour over the whole image, with no gradient, no noise, no vignette and no lighting on it; nothing of that colour inside the figure, and no soft glow or halo around the figure (hard clean edges, because the colour is removed afterwards). The flat background fills the whole sheet, including the empty margins between cells.

Do not include: any text, letters, numbers, logos, real brand names, flags, religious symbols, gore, blood pools, exposed organs, photorealism, painterly brush texture, a watermark, a signature, a border or frame, a floor, a ground shadow, a cast shadow, a vignette, a gradient background or any background scenery. No watermark, no numbers, no arrows, no labels. No ground shadow under the bird.

Consistency: the attached file enm_marti_base.png is the approved design. Every cell shows the same character: same outfit, colours, hair, face, proportions and line weight. Change only the pose. Also: ref_current_enemy_lineup_2x.png is only a rough reference; ignore its rendering.

Generate the image now. Do not ask me questions.
```

## Accept the image only if
- [ ] Six cells: idle, walk1, walk2 on top; hit, dead, an empty cell on the bottom.
- [ ] Every cell is the same zombie as the attached base: same outfit, colours, hair, accent and silhouette feature.
- [ ] Wings: idle up, walk1 mid, walk2 down; the body stays in the same place.
- [ ] Dead is collapsed flat and seen from above; hit is a clear flinch back with one arm raised.
- [ ] Every figure has the same scale; feet or body on one baseline per row; nothing touches a cell edge.
- [ ] Bold near-black outlines of one weight, flat cel shading; the background is flat magenta #FF00FF with clear gaps between cells.
- [ ] The bottom-right cell is empty (flat background only).

## If it fails
- Cells differ in outfit or colour: "Match the attached enm_marti_base.png exactly: same outfit, colours and hair in every cell. Change only the pose."
- Walk frames look the same: "Make walk2 the mirror of walk1: the right foot forward this time. Keep everything else identical."
- Figure touching a cell edge or the wrong scale: "Shrink every figure to sit inside its cell with a clear margin, all at the same scale. Keep the poses identical."

## Notes
Config feature is a gull in flight. The pigeon look is for inland hoods (P.CFG.birdLook: istiklal, kapalicarsi, beyazit, saray, yenikapi, zeytinburnu, bakirkoy). This batch makes only the gull; the pigeon is a later variant (ask the owner). No ground shadow in the art: the view draws one.
