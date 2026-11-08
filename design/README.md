# design/: Low-Fidelity Design Package

Visual direction for Project Istanbul, made before any game code exists. The docs in
[`/docs`](../docs) are the source of truth; this package **shows** them.
**If a wireframe and a doc disagree, the doc wins.** Note the conflict in `reviews/QUESTIONS.md`.

## How to open
Open **`design/lofi/index.html`** in any browser. It shows all 18 screens on one board; click one
to see it full size with its annotations, and click buttons inside the phone to move between
screens like a prototype.

## What's here

| File | What it is | Used in |
|---|---|---|
| `lofi/index.html` | Board of all screens | Overview, reviews |
| `lofi/01-...18-*.html` | 18 key screens at 390 × 844 pt, each with numbered annotations linking to doc sections | Layout reference for every UI task (M1 placeholder UI, M3 HUD/results, M4 UI kit, M5 meta screens, M8 store) |
| `lofi/gameplay-peak.svg` | Level 1 Segment D at peak density: ~70 zombies, telegraphs, XP, fork arc | The **readability benchmark**: final art must be at least this readable |
| `lofi/level-001-map.svg` | Top-down Level 1 layout at 6 px/m with all props, doors, triggers and segments | Building Level 1 (M3-T2) |
| `lofi/lofi.css` | Wireframe styles with the design-system tokens | Starting values for the Godot UI theme |
| `lofi/lofi.js` | Screen list + navigation (one list drives the pager and the board) | n/a |
| `style-exploration.md` | 3 art directions, image prompts, scoring rubric, the 10 style frames to produce | M4-T1 (can start now) |

## How the executor should use it
1. **Layout, hierarchy and content**: follow the wireframes. **Exact pixels and colors**: follow
   design-system.md (wireframes are grayscale on purpose).
2. Every annotation cites the spec section it implements; read that section before building the screen.
3. Placeholder UI in M1-M3 should copy these layouts, so the M4 art pass is a reskin, not a redesign.

## Package status (each phase is complete and usable on its own)

| Phase | Deliverable | Status |
|---|---|---|
| **A** | Low-fi design package (this folder) | **Done** (2026-11-08) |
| **C** | Foundation code: Godot 4 skeleton, SoA swarm + benchmark, core rules + tests (`/game`) | Done except on-device runs (see `reviews/REVIEW-M0.md`) |
| **B** | Playable browser prototype of Level 1 (`/prototype`) | **Done** (2026-11-08), see `prototype/README.md` |
