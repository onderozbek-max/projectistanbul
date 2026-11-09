# Code review: prototype v0.7 (`cda14b3`), for AUDIT-7 rev 2

Reviewer: code-reviewer sub-agent (read-only), 2026-11-08. Lead spot-checked CR-1, CR-2, CR-4 and CR-5 against the code, and
re-ran `entrance-check.js` and `settings-check.js` from this folder; both reproduce.
Repro scripts: `reviews/media/AUDIT-7/cr-scripts/` (paths are relative to the repo). Run them with `node <script>`.

## Verdict
**REQUEST CHANGES.** v0.7 is deterministic, had no soft-lock in 198 unlimited-HP runs over L2–L100 (192 wins, 6 timeouts,
all from the bot's defend-level bug, every boss killed), and its tests pass. But the daily modifiers are not wired, spawn
entrances move set-piece enemies, and CR-3 to CR-5 can lose choices or progress, or break startup. Fix CR-1 to CR-5 and the
bot fallback (CR-7) before tuning balance. Build the separation grid (CR-6) before raising enemy counts toward 200–300.

## Items from the v0.4 review
| # | Item | v0.7 | Where |
|---|---|---|---|
| 4a | O(n²) separation | Still present | `sim/combat.js:125-131` (cost grows 3.7× when the count doubles) |
| 4b | O(n²) `densestTarget` | Still present (0.28 ms/step for all weapons at 300) | `sim/weapons.js:88-115`, `weapons2.js:44,68,89` |
| 4c | Cold open writes sim | Still present | `view/coldopen.js:40,48`; no other view/story writes found |
| 4d | Card/reroll race | Still present | `view/screens.js:93-96,184-192`, `main.js:188-216` |
| 4e | Settings crashes on non-object JSON | Still present (narrower) | `view/settings.js:13,24` |
| 4f | SFX warm-up only renders variant 0 | Present (documented) | `view/sfx.js:166-168` |
| 4g | `S.snap` copy and kill credit lag | Still present | `sim/skills.js:41-48` |
| 4h | Particle cap | **Fixed** | `view/fx.js:101`, `partsMax: 500` |

## Findings
| # | Sev | Conf | Where | Issue → failure | Fix |
|---|---|---|---|---|---|
| CR-1 | Important | 95 | `meta/meta-data.js:267`, `meta/meta-daily.js:3,14-19`, `sim/modifiers.js:16-21` | Daily modifiers `spawnMult`, `enemyHpMult`, `eliteMult`, `noDash`, `noRevive` and `coinMult` are copied into run options, but nothing reads them. "Horde" and "Iron (no revive)" play like a normal run; `s.diff` is unchanged and revive is still offered | Apply in `P.Modifiers.apply` (scale `s.diff`), block dash in `Skills.tryDash` and revive in `main.js`, apply coins in `meta-data.js`; add a test |
| CR-2 | Important | 90 | `sim/enemies3.js:151-170` (called from `sim/enemies.js:28`) | Entrance relocation is meant for route spawns only but can't tell them apart: 30% of active enemies spawned ahead or to the side are moved 5–8 m. Over 40 seeds: 77/240 rescue trappers, 15/40 balcony snipers and 14/40 chest guards. A balcony sniper that can't move ends up planted mid-street | Opt in with `opts.entrance` (Director route spawns), or skip `evId`, `anchored` and `guard` |
| CR-3 | Important | 85 | `view/screens.js:93-96,192`, `main.js:211-216`, `sim/progression.js:163` | Reroll stays enabled during the 320 ms lock after a card tap; the old card is applied after the reroll. `choose()` doesn't validate against the current offer | Disable Reroll while locked, or clear the timer in `showCards`; reject cards not in `offer.cards` |
| CR-4 | Important | 90 | `view/settings.js:13,24` | Stored `null`, a number or a string, with OS reduced motion on → `'reduceMotion' in data` throws; `P.applySettings` and `P.lang` never exist, so startup breaks | `if (!data \|\| typeof data !== 'object' \|\| Array.isArray(data)) data = {};` |
| CR-5 | Important | 95 | `meta/meta-save.js:47` | Reads `src.flawless` instead of `src.counters.flawless`, so per-district flawless counts are wiped on every load ("a_karakoy" only works within one session) | `f = (src.counters && src.counters.flawless) \|\| src.flawless \|\| {}` |
| CR-6 | Important (perf) | 90 | `sim/combat.js:125-131` | At 300 enemies, 2.54 ms/step average, worst step 10.52 ms; separation 2.06 ms (desktop, Node 26). At 150: 0.74–0.78 ms average, worst step 2.1–2.25 ms | A grid with 1 m cells, preallocated, 3×3 queries; reuse it for `densestTarget` |
| CR-7 | Important (tooling) | 85 | `tools/bot.js:135-136` | `if (ob) return ob` sends the bot back to defend boosters behind it, so it shuttles until timeout. L9 timed out 2/2; L47, 69, 77 and 81 timed out 1/2 even with unlimited HP | Follow `ob` only if it is ahead or within a few metres behind |
| CR-8 | Minor | 90 | `meta/meta-collect.js:12,39` | `hoodsCleared` is never incremented ("a_walk17" can't be earned); letters 2 and 3 unlock at levels 190 and 300 of 100 | Increment on the first clear of each hood; move the letters into L1–100 |
| CR-9 | Minor | 95 | `view/coldopen.js:40,48` | View writes enemy position and state | Sim hooks `P.Enemies.stagger` / `P.Enemies.turn` |
| CR-10 | Minor | 80 | `sim/skills.js:41-48` | A full list copy every step; same-step spawn kills give no ult or frenzy credit | Credit from `Combat.killEnemy` |
| CR-11 | Minor | 75 | sim-only events | No listener: `kasapWindup`, `kasapSwing`, `parkurLeap`, `parkurLand`, `objPickup`, `binRoll`, `lootEscape`, `hackProgress`, `envPuddle`, `sledgeWindup` | Add effect and sound handlers |
| CR-12 | Minor | 80 | `view/render.js:198-213` | About 600 closures per frame at 300 enemies (filter, closures, sort) | Reuse a depth buffer of indices |
| CR-13 | Minor | 95 | `tools/test-arsenal-w.js` | Running it alone does nothing (exports only) | A `require.main` guard, or drop it from the command lists |

## Checks with no problems found
- Determinism: L12, 25, 50, 63, 75 and 100 identical after 90 s, also with two games interleaved (`determinism.js`).
- No `Math.random`, `Date.now`, `performance.now` or `new Date` in sim, configs, `journey.js`, `story/`, `meta-power.js` or `meta-unlocks.js`. The daily uses the date only in meta to pick the seed.
- Old or bad saves (`5`, `"x"`, `[]`, v1 objects with bad field types) load without crashing (`meta-check.js`).
- `P.Env.place` can't run twice; the sim never writes to the config.
- Tests: `test-arsenal.js --quick` PASS (24 s); `test-env.js` 116/116; `check-ids.js` PASS. TR/EN keys 978/979 (`barkBloater` EN only).

## Commands
```
node reviews/media/AUDIT-7/cr-scripts/bench.js 300 25 10      # N alive, level, seconds; HP refilled, all weapons at L5
node reviews/media/AUDIT-7/cr-scripts/entrance-check.js       # CR-2
node reviews/media/AUDIT-7/cr-scripts/meta-check.js           # CR-1, CR-5, CR-8
node reviews/media/AUDIT-7/cr-scripts/settings-check.js       # CR-4
node reviews/media/AUDIT-7/cr-scripts/determinism.js
node reviews/media/AUDIT-7/cr-scripts/strings-check.js
```
Unlimited-HP soak (5 m 41 s): copy `prototype/tools/bot.js`, insert `s.hero.hp = s.hero.maxHp;` before `st.last = genInput(s, st);`,
then run `--levels=2..100 --seeds=2`.
