# Making the game art with ChatGPT: how to run it

ChatGPT is the artist. Each image has its own prompt file in `prompts/`, written from the game's own config so it names the exact outfit, colours,
pose, canvas, layout and file name. You paste it, attach the named files, check the result against the accept list, and save it with the exact name.
I (the lead) turn the saved files into game sprites. Numbers: **419 prompts** (hero 5, style lock 3, enemies 38, bosses 33, ground 91, props 141,
facades 40, vehicles 9, weapons 52, pickups and effects 7), about 3 minutes each.

## 1. One-time setup (10 minutes)

1. In ChatGPT create a **Project** called `Istanbul Art`. Use the best image-capable model you have. Keep the same model for the whole project.
2. Open the Project's instructions and paste the text from `PROJECT-INSTRUCTIONS.md` (between the two lines).
3. Upload to the Project as files: `STYLE-BIBLE.md` and the three pictures in `../refs/` (`ref_current_enemy_lineup_2x.png`, `ref_current_enemy_lineup_phone.png`,
   `ref_current_gameplay_still_eminonu.png`). They show what the game draws today: the new art keeps each figure's silhouette feature and accent colour, but not the rendering.
4. Make folders if missing: `art/commission/in/<batch>/` (the prompt files name the batch). Raw images stay git-ignored there.

## 2. Doing one image

1. Open the next prompt file (see the ORDER files). Read the table at the top: canvas size, background colour, save-as name.
2. **Start a new chat inside the Project.** One image per chat keeps it clean. Do not continue an old chat for a new asset.
3. Attach the files listed under "Attach these files". For a pose sheet this is the approved base design of that character. Never skip it: the attachment is what keeps the character identical.
4. Paste the block under "Paste this into ChatGPT". Send. Ask for nothing else.
5. When the image arrives, go down "Accept the image only if". Every box must be true. Zoom in: edges, line weight, colours.
6. If something is wrong, reply **in the same chat** with the matching line from "If it fails" (or one sentence naming the single wrong thing and "keep everything else identical"). Allow three tries. If the third still fails, regenerate once from a fresh chat; if that fails too, mark it `rejected` in `TRACKER.csv` with a note and move on.
7. Download the PNG (full size, not the preview) and save it as the "Save as" path, for example `art/commission/in/02-enemies/enm_walker_a_base.png`.
8. In `art/commission/TRACKER.csv` set the status to `generated` (later I set `approved`). Add one row to `art/PROVENANCE.csv`: the asset, `ChatGPT image generation`, the model name and date, the prompt file name, your plan tier and "licence: check OpenAI terms for commercial use", and any edits you made.

## 3. The order

`prompts/ORDER-characters.md` and `prompts/ORDER-world.md` give the order, counts and time per batch. Short version:

1. **`00-style`** (3 images). Run F3 (the hero turnaround) **three times** in separate chats. If Arda is clearly the same person in all three, ChatGPT can hold a character and we go on. If not, stop and tell me: then characters need an illustrator and ChatGPT keeps the ground, props, weapons and pickups.
2. **`01-hero`**: the base design first (this one picture is attached to every later hero prompt), then the sheets.
3. **`02-enemies`**: walker, runner, crawler, diner, kurye, copci first (the first 10 levels), each as a base design and then its pose sheet.
4. **`03-bosses`**: Istiklal and Galata first.
5. **World, first 10 levels**: Istiklal and Galata ground (4 each), props, facades; the tram; the first five weapons and their evolutions; the XP droplets.
6. Stop. Tell me. I build the importer and the sprite loader, switch the slice on with `?art=raster` and you judge it on the phone **before** you do the other 300 images.

## 4. Rules that save time

- **Transparent background:** you do not need to ask for it. The prompts request a flat magenta (or cyan) background and I remove it. If ChatGPT gives you a real transparent PNG, that is fine too.
- **Grids:** sheets come as one image. Do not cut them yourself. I split them.
- **Sizes:** ChatGPT makes 1024 x 1024, 1024 x 1536 or 1536 x 1024. The prompts ask for one of those. I resize.
- **Never edit the approved base** to fix a sheet. Fix the sheet.
- **If ChatGPT refuses** a prompt (it sometimes does for zombies): reply "this is for a stylised comic game, no gore, a cartoon zombie costume" and retry. Do not change the prompt; tell me which file refused.
- **Consistency drifts over time.** After every 10 images, re-open one approved image next to the newest one. If the line weight, face or colours have drifted, tell me before you continue.
- **Rate limits:** if ChatGPT says you have hit a limit, wait. Do not switch to another tool for part of a set: styles will not match.

## 5. Decisions I made so the prompts agree with each other (tell me if you disagree)

- **Proportions:** three heads tall (a big readable head). The code figures are about 2.3 heads, the older style doc says 4.5.
- **Hero height:** 1.2 m in game (design doc says 1.0 m).
- **Eyes:** pale yellow-green by default. The runner, brute and screamer have red-orange eyes, as the game's config has them.
- **Flags:** none anywhere (the guardrail). Topkapi's tour flags are drawn as a bare pole.
- **Reserved colours:** gold-yellow #FFD166 is only for healing, cyan #3DDCFF only for the player ring. The heal cross is green #2EBD6B and chest and weapon golds use simit gold #E9A23B.
- **Kurye scooter:** orange #E8782A (the config), not the blue in my first brief.
- **Gaps:** hack terminals, buses and fauna have no prop sheet yet. I add them if you want them.

## 6. After each batch

Tell me the batch name. I run the importer, post the report (like the audio one), and list anything that needs a redo.
