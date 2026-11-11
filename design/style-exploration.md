# Project Istanbul: Style Exploration Brief

> **Status:** v0.1 · 2026-11-08 · Input for execution-plan.md **M4-T1** (style frames).
> **Can start now,** in parallel with M0-M3: art direction doesn't depend on code.
> The visual rules that any direction must obey are in [design-system.md](../docs/design-system.md)
> (readability §6, palette §3, art direction §2). This brief explores *looks* within those rules.

> **Update 2026-11-10 (R1-T2, D-057):** the prototype look is direction **A, Ink & Tea**, built with a mixed pipeline:
> authored vector backgrounds plus the existing procedural busts. Samples: `reviews/media/R1/style-samples/`, sources: `design/style-samples/`.
> Directions B and C stay unused. The generate-then-hand-check path (paid Figma credits) was not run; the M4-T1 style frames below
> still apply when and if generated art is added.

---

## 1. Goal

Pick **one** art direction from three candidates by generating a small, comparable set of
frames, then produce the full set of 6-10 approved style frames that every later asset is
matched against (design-system.md §12).

## 2. The Three Directions

| | **A. Ink & Tea** (recommended) | **B. Beyoğlu Gouache** | **C. Neon Flat** |
|---|---|---|---|
| One-liner | Bold comic ink outlines on characters, hand-painted streets | Soft painterly gouache, thin outlines, rich warm light | Flat vector shapes, limited palette, neon nights |
| Mood | Dizi drama with comic punch | Nostalgic, cinematic, premium | Snappy, modern, arcade |
| Readability in swarms | **High** (outlines separate figures) | Medium (soft edges blur in crowds) | **High** (flat shapes) |
| AI consistency | Medium-high (outline weight must be policed) | Medium (texture drifts between generations) | **High** |
| Production cost | Medium | High | **Low** |
| Istanbul authenticity | High | **Highest** | Medium (risk of generic city) |
| Distinctiveness vs genre | **High** | High | Low-medium |
| Low-end performance | Good | Good (texture-heavy backgrounds) | **Best** |

**Why A is recommended:** it's the only one that scores high on both swarm readability and
distinctiveness, and it matches the motion-comic story format (design-system.md §9).
B is the "premium" option if A feels too cartoony; C is the fallback if AI consistency becomes the bottleneck.

## 3. The Comparison Set (9 images)

Generate the **same three frames** in each direction so the comparison is fair:

| Frame | Content | Why this frame |
|---|---|---|
| **F1 Key art** | Arda on İstiklal at dusk, fork in hand, red tram behind, zombies approaching | Title screen, store page, ad creative |
| **F2 Gameplay frame** | Top-down 3/4 view of İstiklal, ~60 zombies around the player, the composition of `design/lofi/gameplay-peak.svg` | **The readability test**. This one decides |
| **F3 Character sheet** | Arda front / side / back + 3 expressions (determined, scared, grinning) | Rigging feasibility and consistency |

**Rule for F2:** paste `gameplay-peak.svg` (exported to PNG) as a composition reference so all
three directions are judged on the exact same layout.

## 4. Prompt Templates

**Never** use living artists' names or real brands in prompts (legal + originality). Use
descriptive language only. Keep a log of every prompt in `art/PROVENANCE.csv`.

### Shared building blocks
- **Subject (Arda):** "a 20-year-old Turkish university student, short dark wavy hair, light
  stubble, red hoodie over a grey t-shirt, dark jeans, white sneakers, earbuds around his neck,
  expressive face"
- **Setting (İstiklal):** "a long pedestrian avenue in Istanbul lined with 19th-century
  European-style facades (neoclassical and art nouveau, 4-6 floors, wrought-iron balconies,
  shopfronts with fictional signs), grey stone paving with two tram rails down the middle, a
  red-and-cream vintage tram, chestnut and simit street carts"
- **Zombies:** "shambling zombies in everyday city clothes (office workers, students,
  shoppers), desaturated grey-green skin, pale glowing eyes, torn clothes, no gore"
- **Negative:** "no text, no logos, no real brand names, no flags, no religious symbols,
  no blood pools, no gore, no photorealism, no watermark"

### A. Ink & Tea
- **F1:** "[Subject] stands defiantly holding a fork like a weapon, [Setting] at golden hour
  turning to dusk, [Zombies] approaching from the background. Bold black ink outlines on
  characters, 2-3 tone cel shading, hand-painted textured background with warm amber and tram
  red accents, cool blue shadows, comic-book energy, vertical 9:19.5 composition"
- **F2:** "top-down three-quarter view game screenshot, [Setting] seen from above, a single
  hero in a red hoodie at lower center with a cyan glowing ring at his feet, about sixty
  [Zombies] surrounding him seen from above, small green glowing droplets on the ground, one
  red hatched warning circle on the ground, bold ink outlines on all characters, painted
  stone pavement at mid-value grey, readable silhouettes, mobile game, portrait 9:19.5"
- **F3:** "character turnaround sheet of [Subject]: front, side, back views and three
  expressions (determined, scared, grinning), bold black ink outlines, flat cel shading,
  neutral light grey background, consistent proportions (1:4.5 head-to-body), game character design sheet"

### B. Beyoğlu Gouache
- Same structure; replace the style sentence with: "soft gouache painting, visible brush
  texture, thin dark-brown outlines, rich warm streetlight glow, atmospheric depth,
  cinematic color grading in amber, teal and tram red".

### C. Neon Flat
- Same structure; replace the style sentence with: "flat vector illustration, bold simple
  shapes, no gradients, limited palette (tram red, simit gold, night ink, bosphorus blue,
  neon pink and cyan accents), crisp silhouettes, modern mobile game art".

## 5. Scoring Rubric (score each direction 1-5, weight in brackets)

| Criterion | Weight | Test |
|---|---|---|
| Swarm readability | 30% | On F2 shrunk to phone size: find the player in under 1 s? Telegraph obvious? |
| Distinctiveness | 20% | Put F1 next to 5 genre leaders' store screenshots: does it stand out? |
| AI consistency | 20% | Generate F3 three times: does Arda stay the same person? |
| Istanbul authenticity | 15% | Would a Turkish player recognize İstiklal instantly? |
| Production cost | 15% | How much cleanup per asset? |

Ask Onder + 3-5 target players (at least one Turkish teen, one non-Turkish genre fan) to rank
F1 and F2 blind.

## 6. After Picking a Direction: The Full Style Frames (M4-T1)

| # | Frame | Used for |
|---|---|---|
| 1 | Key art (F1, final) | Title, App Store, ads |
| 2 | Gameplay frame İstiklal (F2, final) | Readability reference for every level |
| 3 | Arda turnaround + expressions | Rigging, motion comics |
| 4 | Kaan + Mila + Ada portraits | Squad UI, comics, marketing |
| 5 | Zombie lineup (walker ×4 outfits, runner, crawler, brute, spitter, exploder) | Enemy sprite production, silhouette test at 48 px |
| 6 | Kestaneci + Vatman bosses | Boss production |
| 7 | UI sample: level-up cards + HUD over gameplay | UI kit (match `design/lofi/05-level-up.html`) |
| 8 | Motion-comic page (the "pale guy" bite) | Story production template |
| 9 | World map illustration (Taksim → Ataköy) | Map screen (match `design/lofi/02-world-map.html`) |
| 10 | Galata Bridge environment | Proves the style holds outside İstiklal |

Approved frames go in `art/style-frames/` with provenance entries. From then on, every asset
is reviewed side by side against them (design-system.md §12, step 5).
