# PROPOSAL D-060: Topkapı Palace and Haliç–Balat join the walk (design only, no code yet)

Status: **proposed**. Nothing in `prototype/` or the other docs has changed. On approval I implement mechanically (section 6).
Owner direction (2026-11-12): swap **Topkapı Palace** in for Laleli (L46–50) and **Haliç–Balat** in for Aksaray (L51–55); keep 20 hoods and 100 levels; restyle **Yedikule** (add Zindanlar) and **Zeytinburnu** (add a shore stage). Every Turkish string below is a **TR owner check**; I write nothing in Turkish voice (D-051).

## 1. Decisions I need from you

| # | Question | My recommendation |
|---|----------|-------------------|
| 1 | **Walk position.** You said Topkapı comes "right after Kapalıçarşı". The walk today is Kapalıçarşı (L31–35), Beyazıt (L36–40), Kumkapı (L41–45), then the Laleli slot (L46–50). | Keep the slots you approved (L46–50, L51–55). Real geography is a detour either way: the palace is east of Kapalıçarşı and Balat is up on the Golden Horn. Cover it with one line ("Arda takes the long way, the bridges are blocked"). If you want the palace truly next, I move it before Beyazıt and shift L36–45 by five. |
| 2 | **Chapter 2 name clash.** `narrative.md:155-156` has "Topkapı & Theodosian Walls" (L121–130, the land-wall district) and "Golden Horn crossing" (L131–140). | Ch1 uses **Topkapı Sarayı** (id `saray`). Ch2 keeps the land-wall Topkapı (rename it **Topkapı Surları** in docs). Ch2's Golden Horn leg moves to Fener–Eyüp so Balat is not used twice. |
| 3 | **Boss concepts** (below). | Accept, or give me your own. Names are yours to write in TR. |
| 4 | **Stage names** (sections 2 to 5). | Accept or rename. |
| 5 | **Dawn-to-dusk spread.** Yedikule and Samatya are dawn, so the palace goes late afternoon to dusk and Balat goes blue hour into night. | Accept. |

## 2. Hood H10 · Topkapı Sarayı · Fatih · km 7.8 · L46–50 · Boss: The Tour Guide

- **Reads as Istanbul because:** the outer palace gate square, plane trees, the ticket queue, and the old palace wall running along the Gülhane side. Palace is a museum, so the locals are visitors and staff.
- **Feel:** a grand stone square in golden late light. Orderly queue barriers gone wrong. Calm architecture, chaotic crowd.
- **Landmarks (background only, never damaged):** the gate tower and crenellated wall as the hood landmark; domes of the palace kitchens on the skyline.
- **Props:** queue stanchions (solid, breakable); ticket kiosks (solid); audio-guide carts (solid, breakable); plane trees (solid); stone benches (solid); souvenir stands (solid, breakable); guide's flag poles (dressing).
- **Materials:** ground `stone_grey` flagstone, wide joints, sun-warmed. Walls `paper` cream stone with `stone_grey` courses. Roofs and awnings `tea_amber`. Accent `#B5453A` tour-flag red.
- **Light:** late afternoon to dusk. Warm low sun from the gate side (left), `simit_gold`. Cool shadow under the planes, `bosphorus_blue`.
- **Zombie locals:** tourist with a camera (crawler, existing), tour group straggler with a lanyard (walker), museum attendant in a waistcoat (walker, new skin), vendor (runner, existing skin).
- **Sky shapes:** palace-kitchen domes, gate tower, plane tree. **Overhead:** bunting from the souvenir stands, one rig of tour-group flags.
- **Stages:** 1 Palace Gate Square, late afternoon, clear · 2 Gülhane Path, golden hour, fog off the park · 3 Ticket Queue, dusk, barriers funnel the lanes · 4 Outer Courtyard, dusk, rain · 5 Gate Tower, dusk, clear, boss.
  - TR names, **owner check**: Saray Kapısı Meydanı · Gülhane Yolu · Bilet Kuyruğu · Dış Avlu · Kule Kapısı.
- **Boss, The Tour Guide:** a zombie guide with an umbrella and a flag. Umbrella sweep (wide arc, telegraphed), **rally call** (a ring telegraph, then a small tour group of walkers files in), flag charge in phase 3. Reuses the kasapBoss shape: combo, throw (a thrown audio guide), summon. New tuning only, no new engine behaviour.
- **Signs (owner check):** Saray Hediyelik, Bilet Gişesi, Rehber Hasan, Çay Ocağı.
- **Arda hook (proposed, owner writes TR):** to zombies: "Please stay in line. No? Okay, fair."
- **Contrast:** Kumkapı is wet quay and lanterns; the palace is dry open stone in daylight. Haliç–Balat next is cramped colour, so keep the palace square wide and quiet-coloured.

## 3. Hood H11 · Haliç–Balat · Fatih · km 8.6 · L51–55 · Boss: The Antiquarian

- **Reads as Istanbul because:** steep lanes of narrow, brightly painted row houses on the Golden Horn shore, antique and bric-a-brac shops, cafés with mismatched chairs, laundry between the balconies, the Balat quay.
- **Landmarks (background only):** a red-brick hilltop school on the skyline (generic, no name), the Horn water and the far bank. No religious building is a set piece.
- **Props:** antique stands (solid, breakable); café chairs and tables (solid, breakable); stair rails (dressing); flower pots (solid, breakable); handcarts (solid, breakable); fishing crates on the quay (solid, breakable); street cats (fauna).
- **Materials:** ground `stone_grey` cobble, uneven, damp, with kerb steps. Walls painted plaster: `#C8553D` terracotta, `#E3B04B` ochre, `#4F8FAE` blue, `#D98BA0` faded pink. Shutters `tea_amber`. Water `bosphorus_blue`.
- **Light:** blue hour into night. Warm window light and café lamps (left), `tea_amber`. Cool wet shadow, `bosphorus_blue`. Fire only in stage 3, under 3 flashes a second.
- **Zombie locals:** antique dealer (walker), café owner (walker), fisherman (existing skin), grandmother with a shopping bag (runner, existing skin), child on a bike is **not** used.
- **Sky shapes:** hilltop school block, a minaret and a dome far across the water, a crane on the far shore. **Overhead:** laundry lines (existing rig, three arrangements), café festoon lights.
- **Stages:** 1 Haliç Shore, blue hour, clear · 2 Colour Houses, dusk, fog off the water · 3 Antique Lane, night, fire from a toppled brazier, stands block the lanes · 4 **Fatma Nine's Garage**, night, clear, the campfire rest (no combat) · 5 Balat Pier, night, rain, boss.
  - TR names, **owner check**: Haliç Kıyısı · Renkli Evler · Antikacılar Sokağı · Fatma Nine'nin Garajı · Balat İskelesi.
- **Campfire, stage 4:** this gives Kaan his missing Balat backstory (`characters.md:65-67`): his grandmother's garage with the half-painted *Fatma Nine Balık Ekmek* sign. The existing L54 campfire page (`CMPa`, mentions a closed bakery) needs a rewrite. **Your story call**, and the Turkish is yours.
- **Boss, The Antiquarian:** a dealer with a brass lamp on a chain. Lamp swing (chain arc), **thrown vase** (ring telegraph, shards), summon of "customers" in phase 2, and a frenzy of falling stock in phase 3. Reuses the kasapBoss shape, new tuning, no new engine behaviour.
- **Signs (owner check):** Antika Reşat, Balat Kahvesi, Çiçekçi Hacer, Eskici Necmi.
- **Arda hook (proposed, owner writes TR):** self-talk: "Everything here is old and expensive. I am neither."
- **Contrast:** the palace is open stone in warm light; Balat is cramped, colourful and wet at night. Yenikapı next is tiled and underground, so keep the sky and water here.

## 4. Yedikule restyle (L66–70)

- Today the docs show: 1 Wall-walk, 2 Gardens, 3 Three keys, 4 Tea garden, 5 Gatehouse. Code names differ (Surlar, Kule Kapısı, Bostan, Sur Yolu, Bostancı Sabahı). I align both.
- **Change:** stage 2 becomes **Zindanlar (Dungeons)**: vaulted stone corridor, rusted gates, torches and drip, fog. Underground feel but no combat change. Generic cells; no real prisoner, state actor or execution imagery (guardrails).
- **Art:** vault overhead rig (reuse the Kapalıçarşı vault, no kilims, torch glow), flagstone ground with wet patches (no openings in the floor, D-058), sky list unchanged.
- **Proposed stage list:** 1 Yedikule Surları · 2 **Zindanlar** · 3 Anahtarlar (the three keys) · 4 Çay Bahçesi · 5 Kule Kapısı. **Owner check**, and the stage 2 fog stays.

## 5. Zeytinburnu restyle (L76–80)

- Today: 1 Yard gate, 2 Bale stacks (rain), 3 Conveyor, 4 Drum yard, 5 Foreman's yard.
- **Change:** stage 2 becomes **Sahil Rıhtımı (Shore Pier)**: a concrete quay and fishing piers on the Marmara shore with dye-stained runoff, wet, rain. Brief line "no water" and the contrast text change; Kazlıçeşme stays the lawn coast, Zeytinburnu's shore is hard concrete and working piers.
- **Art:** wet concrete ground with rope and bollard marks, bale stacks stay in stages 1 and 5, a water band at the lane edge (visual only), sea-side sky (crane, mast).
- **Proposed stage list:** 1 Fabrika Kapısı · 2 **Sahil Rıhtımı** · 3 Konveyör · 4 Boya Avlusu · 5 Ustabaşı Avlusu. **Owner check.**

## 6. Implementation on approval (mechanical, in order)

1. Rename ids: `laleli` to `saray`, `aksaray` to `halic` (journey rows, themes, landmarks, config-levels, enemies4, objectives, bosses `bossByHood`, art-enemies, sfx, story-data HOOD_LOOK, fauna, tools tables, check-hood-keys, test-enemy-behaviors, sfx-preview).
2. New boss configs `tourGuide` and `antiquarian` (tuning from kasapBoss), boss names in `strings-story.js`.
3. Art: new ground, walk, props (about 4 kinds each), overhead rigs, sky lists for both; Yedikule vault stage and Zeytinburnu shore stage; regenerate with the four generators; review sheets in `reviews/media/R1/arenas/`.
4. Strings: stage names, hood blurbs (`hood-card.js`), meta one-liners, signs. Voice lines (about 24 per hood per language, `H10*`, `H11*`, `BK.hd10`, `BK.hd11`) and the L54 campfire: **you write these in Turkish and English**; I leave marked placeholders so `check-hood-keys` can run.
5. Docs: `journey.md`, `hoods-bible.md`, `hood-visual-briefs.md`, `narrative.md` (Ch2 rename), `wow-catalog.md`, `story-presentation.md`, `voice-*.md`, `content-catalog.md`, `audio-cue-sheet.md`.
6. Run `check-ids`, `check-hood-keys`, `check-objective-strings`, `check-death-causes`, `test-meta`, `test-enemy-behaviors`; bot sim on the swapped levels; fix before I hand back.
- **Cost estimate:** code and art about two working sessions; your Turkish voice for 2 hoods is the long pole.
