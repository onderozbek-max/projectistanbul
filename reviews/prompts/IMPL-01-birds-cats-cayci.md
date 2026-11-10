# IMPL-01: birds by geography, ambient cats, cayci retune (R1 wave 1 follow-up)

You are the implementation agent. The lead (Claude, English decision-maker) reviews your packet; the owner (Onder) reviews Turkish text and
playtests. Work only on this task, then write the packet and **stop**.

## Read first (in this order)
1. `AGENTS.md` (hard rules; for the JS prototype the size rules still apply: files <= 600 lines, functions <= ~40 lines, no magic numbers
   in `prototype/js/sim/`, every gameplay value from `config-*.js`).
2. `reviews/AUDIT-ENEMIES-2026-11-10.md` sections 9 to 13 (owner decisions, wave 1, owner answers). Section 13 is your spec.
3. `docs/journey.md` section 5.0 (which hoods get new enemy types) and the hood list; `docs/content-catalog.md` section 11.
4. `prototype/js/config-enemies5.js`, `config-skins.js`, `config-levels.js` (roster near line 125), `sim/enemies4-marti.js`,
   `sim/enemies4-cayci.js`, `view/art-enemies6.js`, `view/enemies-fx-w1.js`, `tools/test-enemy-behaviors.js`.

## Branch and hygiene
- Start from the commit the lead names in the hand-off message. Create `r1/birds-cats`. Small commits (`r1/birds: ...`). Never push, never touch `main`.
- Run `git status` first. The tree may hold other people's uncommitted work (art, feel, fire animation, vehicles, comic busts, css, `config.js`,
  `director.js`, meta strings, `view/*`). **Never `git add -A` or `git add .`.** Stage only files you created or deliberately changed.
- `prototype/index.html` holds uncommitted script tags from others. Add the tags your new files need in the working tree, do not stage the
  file, and list the exact lines in your packet.
- Do not edit `reviews/dialogue/*.csv` that the lead or owner created. Do not approve Turkish lines (`ok:1` is the owner's mark).

## Task A: cayci slow 0.65 to 0.75, then re-measure
1. Change the cayci slow multiplier 0.65 to 0.75 in `config-enemies5.js` (and `docs/content-catalog.md` section 11, and the test that asserts 0.65).
2. Baseline: the commit before wave 1 is `be4bd08`. Export it to a scratch folder (`git archive be4bd08 | tar -x -C <dir>`; worktrees are blocked here)
   and run `node tools/bot.js --levels=8,43 --seeds=50` there. Run the same on your branch. Use `--policy` defaults.
3. Gate: L8 par-time (reach) objective met in at least 75% of runs (was 19 of 20 before wave 1); no level's median clear time more than 25% above its
   `be4bd08` median; clears and no-death rate not worse than 10 points. Also report L2, L10, L13, L22, L30 (50 seeds) for regressions.
4. If the gate fails: soften the fisher drag next (2.5 m to 1.8 m, config value) and re-measure. If it still fails, **stop and report**; do not tune further.
   The bot is a poor judge of feel; a human playtest decides final values.

## Task B: the thief bird, one behaviour, two looks, placed by geography
- Behaviour stays the wave-1 `marti` (steals XP, returns XP plus gold on death). Add a **pigeon (güvercin) look**; the existing look is the **seagull (martı)**.
  Same stats, same sim. The look is chosen per hood by geography and must not change any sim number or the sim digest.
- Seaside hoods (seagull): Galata, Galata Köprüsü, Karaköy, Eminönü, Sirkeci, Kumkapı, Yenikapı, Samatya, Yedikule, Kazlıçeşme, Bakırköy Sahil,
  Ataköy Marina, Ataköy. Inland (pigeon): İstiklal, Kapalıçarşı, Beyazıt, Laleli, Aksaray, Zeytinburnu, Bakırköy Çarşı.
  Verify the list against the hood notes in `docs/journey.md` and report anything you change.
- **No enemy thieves in H01 to H04** (`journey.md` section 5.0). The thief starts at H05 (Eminönü) and applies to every later hood. This replaces
  the explicit marti list in `config-levels.js` (it currently places marti on Galata and Galata Köprüsü, which breaks section 5.0). The audit text
  "starts at hood index 2" contradicts section 5.0; follow section 5.0 and say so in the packet.
- Pigeon art: grey-blue body, iridescent neck patch, small head. It must read at phone size next to the seagull and against the ground colours
  of the inland hoods. Do the 48 px silhouette check and attach it. Dive ring and flee states are unchanged.

## Task C: ambient fauna in every hood, cosmetic only
- **Ambient birds** (seagulls in seaside hoods, pigeons inland) in all 20 hoods, including H01 to H04: view-only, flutter and take off when the hero
  or an enemy comes close. Never an enemy there.
- **Ambient cats** in every hood, three coats: white-and-brown mixed, orange, brown. One to three per level at fixed spots; idle, sit, tail flick,
  slow walk, trot away when the hero comes within about 3 m. **Cats are never enemies, never damage, never block movement.**
  The named orange tabby Paşa (story, L12) stays unique; ambient cats are anonymous strays.
- Stretch (descope with a note if it costs more than half a day): a cat stands up and hisses toward an approaching elite or boss within about 10 m.
  No gameplay effect.
- Hard constraints: ambient fauna is **view-only**. No entities in the sim state, no sim RNG draws (use a separate view RNG seeded from the
  level seed so screenshots are reproducible), no change to the sim digest, no cost to the swarm. Respect the reduce-motion setting and the
  "no flashes over 3 per second" rule. Frame-time: report p50/p95 before and after on a heavy level.

## Task D: dialogue (batch D)
- New beats: `BK.fk.guvercin` (first time a pigeon thief is seen) and `BK.fk.kedi` (first cat in view). 3 lines each per language, bark limit 60 characters.
  Add them to `beats-*.js`, `intents.js`, `batches.js` (batch D) and the per-language data files. Never translate: write EN and TR natively from the intent.
- English is American. Turkish may use street-mild language (D-052). Guardrails: no real brands, religion, state actors.
- Write the Turkish lines as **drafts without `ok`** (use `tools/dialogue-apply.js`) and list them in `reviews/dialogue/tr-D2.csv` in the same format as
  `tr-D.csv` so the owner can approve them. Run `tools/dialogue-lint.js`, `check-banned.js`, `test-dialogue.js`, `check-ids.js`.

## Task E: docs
- `docs/journey.md` section 5.0: one line on the ambient-fauna exception and a small seaside/inland table.
- `docs/content-catalog.md` section 11: cayci slow 0.75, bird looks, ambient fauna (no numbers needed for fauna).
- `reviews/AUDIT-ENEMIES-2026-11-10.md` section 12: mark deviation 1 (marti on Galata and Galata Köprüsü) resolved and point to your packet.

## Tests and checks (all must pass; run them yourself)
- Extend `tools/test-enemy-behaviors.js`: look chosen by hood geography; no thief in H01 to H04; thief present from H05; the two looks give identical
  sim results (digest) for the same seed; cayci slow is 0.75.
- Add a check that ambient fauna never touches sim state (digest equal with fauna on and off).
- Run: `test-enemy-behaviors`, `test-horde`, `test-dialogue`, `test-meta`, `check-death-causes`, `check-entrances`, `check-hood-keys`, `check-ids`,
  `check-objective-strings`. Run `test-arsenal` once at the end (it takes several minutes).

## Screenshots (390x844, in `reviews/media/R1/birds-cats/`)
Open the Browser Preview panel first. Required: seagull thief in Eminönü, pigeon thief in Beyazıt or Kapalıçarşı, one image per cat coat, ambient birds in
H01, a hissing cat if you built the stretch. If the preview will not open, say so in the packet instead of improvising.

## Packet and stop
Write a new section "Birds, cats and cayci" in `reviews/REVIEW-R1.md` using the template in `docs/execution-plan.md` section 5.2: summary, commits,
acceptance table, tests, bot table (50 seeds, before and after, same seeds), frame-time numbers, screenshots, **Deviations** (every number or design
change), known issues, questions for the lead. Then stop and wait for review.

## Stop and ask (write to `reviews/QUESTIONS.md`) before you
add a dependency or plugin, change an architecture rule, change a sim number other than the two named here, touch guardrail topics, or add content
outside this task.
