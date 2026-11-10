# Enemy audit: fact sheet (R1, research only)

Scope: Istanbul zombie prototype, `/Users/o0o02dn/Documents/istanbul/prototype`. No game, doc or tool file was edited.
Paths below are relative to `prototype/js/` unless shown otherwise. `k` = global level index minus 1 (`k = L-1`).
Verdicts: VERIFIED = read in code/config and checked by grep or run. UNVERIFIED = not confirmed in this pass.

---

## 1. Roster (regular types)

Stats are base values before run-time HP growth and per-level multipliers. Run-time HP is `hp x (1 + 0.08 x runT/60)` (`config.js:36`, `sim/combat.js:6`), then `x diff.hp`. Bosses and diners are the exceptions (see notes).

| Type | HP | Speed | Contact | Radius | XP | Budget | kbRes | Telegraph / windup | Behaviour summary | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| walker | 10 | 1.2 | 5 | 0.35 | 2 | 1.0 (budgetOf) | 0 | none | Chases hero | config.js:39; config-levels.js:132 |
| runner | 6 | 2.9 | 4 | 0.32 | 3 | 1.5 (budgetOf) | 0 | none | Fast chaser | config.js:40 |
| crawler | 14 | 1.0 | 6 | 0.42 | 4 | 1.5 (budgetOf) | 0.5 | 1.0 s emerge from manhole (`levels.crawlerTelegraph`, config-levels.js:98) | Emerges from manhole telegraph; spawn at `levels.js:310` | config.js:41 |
| diner | 6 (no HP scaling, combat.js:7) | 1.0 | 4 | 0.35 | 4 | n/a | 0 | none | L1 scripted only; dormant doors `director.js:188`; generated levels drop it (`levels.js:60`) | config.js:42 |
| spitter | 15 | 1.1 | 4 | 0.42 | 4 | 3.0 | 0 | 0.7 s windup; cd 3.0 s; flight 0.9 s; keeps 5.5 m, range 9 | Glob dmg 4, r 1.0, acid puddle 3.0 s x 1.5 dps; cause hard-coded `'spitter'` at `sim/enemies.js:208` | config-levels.js:8-13 |
| brute | 80 | 0.9 | 15 | 0.5 | 10 | 8.0 | 0.8 | windup 0.8 s; charge 8 m, speed 7.5, cd 6 s, dmg 14, lane 1.6 m; stomp range 2.6, cd 5 s, dmg 14, windup 0.8 s | Stomp telegraph queued in `s.dir.telegraphs` (`sim/enemies.js:148`) | config-levels.js:14-19 |
| bloater | 24 | 0.75 | 0 | 0.5 | 5 | 3.0 | 0.3 | none (swell from `swellFrom` 3.5, field name; semantics UNVERIFIED) | Bursts on contact: hero 22, enemies 30; cloud r 1.8, 3.0 s, 4 dps / 2 hero dps; minis hp 14 | config-levels.js:20-25; `enemies.js:237-238`, `226-234` |
| screamer | 22 | 0.9 | 4 | 0.4 | 6 | 2.5 | 0.2 | 1.4 s windup; ring r 6.0; cd 9 s (first 0.5 s) | Calls 4 walkers from r 9 if alive at end of windup; killing it in windup cancels | config-levels.js:28-31 |
| hardhat | 42 | 0.95 | 8 | 0.42 | 6 | 2.2 | 0.3 | none | Frontal hit (cos >= 0.5) x0.4 damage; helmet off below helmetOffAt 0.4; turnRate 2.5 | config-levels.js:34-37 |
| kasap | 150 | 0.8 | 16 | 0.55 | 14 | 6.0 | 1.0 | swing windup 0.9 s; cd 3.0 s; swing r 2.0, dmg 18; sense 3.0 | Armour 0.75 (damage multiplier) on every hit; noAdd (never a boss add) | config-levels.js:40-43; `sim/enemies2.js:30-54` |
| parkur | 16 | 2.6 | 6 | 0.36 | 5 | 2.0 | 0.1 | windup 0.45 s (**raw, no telegraph floor**, `enemies2.js:61,70`); leap 2.6-7.0 m, cd 2.2 s, dmg 12 | Crouch ring on hero spot then leap | config-levels.js:45-48 |
| zehirli | 18 | (spitter) | (spitter) | (spitter) | 6 | 3.5 | (spitter) | (spitter) | Spitter rules, glob bursts into toxic zone 6.0 s, 4.0 dps, r 1.3 | config-levels.js:50-52 |
| kurye | 4 | 2.5 | 6 | 0.36 | 2 | 2.0 | 0 | tele 0.8 s; cd 4.0 s; dash 6 m at 7 m/s | Diagonal lane telegraph then dash | config-enemies3.js:6, 12-15 |
| copci | 40 | 0.7 | 10 | 0.5 | 8 | 4.0 | 0.6 | pushWindup 0.8 s (floored); pushCd 6 s | Pushes wheelie bin (dmg 8, speed 1.6); crate every `crateEvery`-th push; trash slick r 1.1, 6 s | config-enemies3.js:9, 12-15; config-enemies4.js:13-16 |

**Elite** (any type): HP x4, contact x1.5, radius x1.15, XP x5, kbResist >= 0.6 (`config.js:44`; applied in `sim/combat.js` spawnEnemy, lines 5-29). Outline: gold `#FFC93C` (`config.js:26`). Catalog says purple (see section 7).

**Affixes** (`config-levels.js:136-147`; roll `sim/enemies2.js:100-108`; apply `110-117`):
- `hizli`: speed x1.35. Gate: hood index >= 10 (H11+). Chance 0.10. Types walker, runner, parkur.
- `zirhli`: armour 0.7 (30% less damage). Gate: hood index >= 11. Chance 0.12. Types walker, runner, crawler.
- `patlayan`: bursts on death (blast 1.6, hero 10, enemies 18). Gate: hood index >= 15. Chance 0.10. Types walker, runner, crawler. On-death handler `enemies2.js:120-131`.

**Telegraph floor:** `telegraphMin` 0.8 s (`config-enemies4.js:5`). Applied through `tele()` in `sim/bosses.js:20` (all boss attacks) and `sim/enemies3.js:81` (copci push). NOT applied to enemies in `enemies.js` (spitter windup 0.7 s) or `enemies2.js` (kasap swing 0.9 s is above the floor; parkur windup 0.45 s is below it). VERIFIED by grep for `tele(` in `js/sim/*.js`.

---

## 2. Skins

Source: `levels.js:42` (`s.gen.skins = info.hood.skins`); `pickSkin` at `levels.js:318-321`.
Flow: `pickSkin` -> `spawnEnemy` opts.skin (`combat.js:14`) -> pass-through to telegraph/summon/boss (`bosses.js:32,136,145`; `enemies.js:84,348,375`; `env-portal.js:57`; `horde.js:56-57,115,161`; `events.js:106-113`).

**Verdict: cosmetic only.** VERIFIED: no branch in `js/sim/*.js` reads `e.skin` for behaviour (grep shows only pass-through). Skin is a string carried to the view.
- Unique skin names in journey.js hood rows: 21 (waiter, tourist, shopper, student, musician, barista, fisher, worker, commuter, vendor, hamal, conductor, shopkeeper, pigeonman, driver, granny, gardener, jogger, picnicker, sailor, neighbor).
- Art side: `view/art-characters.js:43-67` outfit table, `73-76` SKINS list; `view/art-enemies.js:50-70` hoodSkins table and `:72` skinsFor. **`E.skinsFor` and `hoodSkins` are used only by `tools/art-preview.html:168-176`**, not in gameplay. Gameplay skins come from journey.js.
- UNVERIFIED: whether every journey skin name has an outfit entry in `art-characters.js:43-67` (not checked this pass).

---

## 3. Hood usage matrix and spawn mix

Hood index: `hi = floor((L-1)/5)`; stage `= (L-1)%5 + 1`; stage 5 is the boss arena. L1 is scripted (hood 0 stage 1). Journey source: `journey.js` hood rows, lines 14-91 (id line; enemies and skins on the next line). Runtime roster: `levels.js:59-66` `rosterOf` (drops diner; adds `hoodExtras` from stage 2; adds `schedule` types from their stage).

| # | Hood (id) | Journey enemies | Skins | Extras (stage 2+, share 0.5) | Schedule (new types from stage) | Boss: journey field | Boss: runtime (`bossByHood`, `config-bosses.js:38-43`) |
|---|---|---|---|---|---|---|---|
| 1 | istiklal | walker, runner, crawler, diner | waiter, tourist, shopper, student | - | - | brute | brute |
| 2 | galata | walker, runner, crawler, spitter | tourist, musician, student, shopper | screamer | - | brute | brute |
| 3 | karakoy | walker, runner, spitter, bloater | barista, fisher, worker, tourist | hardhat | - | brute | brute |
| 4 | bridge | walker, runner, bloater, spitter | fisher, commuter, vendor | screamer | - | bloater | bloater |
| 5 | eminonu | walker, runner, crawler, brute, spitter | vendor, hamal, commuter, shopper | hardhat | parkur s3 | brute | **taksici** |
| 6 | sirkeci | walker, runner, brute, bloater | commuter, conductor, tourist | - | - | brute | **kasapBoss** |
| 7 | kapalicarsi | walker, runner, crawler, spitter, brute | shopkeeper, hamal, tourist | screamer | kasap s3 | brute | **taksici** |
| 8 | beyazit | walker, runner, spitter, bloater | student, vendor, pigeonman | - | parkur s4 | spitter | spitter |
| 9 | kumkapi | walker, runner, bloater, spitter | waiter, fisher, musician | - | kasap s4 | bloater | bloater |
| 10 | laleli | walker, runner, brute, crawler | shopper, hamal, shopkeeper | hardhat | - | brute | **kasapBoss** |
| 11 | aksaray | walker, runner, brute, bloater, spitter | commuter, driver, worker | screamer | zehirli s3 | brute | brute |
| 12 | yenikapi | walker, runner, crawler, brute, bloater | commuter, worker, conductor | hardhat | - | brute | **taksici** |
| 13 | samatya | walker, runner, spitter, crawler | waiter, granny, fisher | - | kasap s3 | spitter | spitter |
| 14 | yedikule | walker, runner, brute, crawler, spitter | gardener, worker, granny | - | zehirli s4 | brute | brute |
| 15 | kazlicesme | walker, runner, spitter, bloater, crawler | jogger, picnicker, fisher | - | parkur s3 | spitter | spitter |
| 16 | zeytinburnu | walker, runner, bloater, brute | worker, shopper, student | hardhat | zehirli s2 | bloater | bloater |
| 17 | bakirkoy | walker, runner, brute, spitter, bloater | shopper, student, shopkeeper | screamer | kasap s4 | brute | **taksici** |
| 18 | bakirkoysahil | walker, runner, crawler, bloater, spitter | jogger, picnicker, fisher | - | parkur s2 | bloater | bloater |
| 19 | atakoysahil | walker, runner, brute, bloater, spitter, crawler | sailor, jogger, shopper | - | kasap s2 | brute | **kasapBoss** |
| 20 | atakoy | walker, runner, brute, bloater, spitter, crawler | neighbor, granny, jogger, student | screamer + hardhat | parkur s2, zehirli s3, kasap s4 | brute | brute |

- **Boss mismatch:** 7 of 20 hoods (eminonu, sirkeci, kapalicarsi, laleli, yenikapi, bakirkoy, atakoysahil). Runtime uses `bossByHood` (`sim/bosses.js:23-26`). VERIFIED: no reader of the journey `boss` field found in `js/` (grep).
- **Diner:** the journey roster lists diner for H01, but generated levels never spawn it (`levels.js:60`). VERIFIED.
- **Affix gates** use the hood index (`enemies2.js:100-108`, `levels.js:313`).

### Route spawn mix (generated levels)

Spawn budget per second on a route segment (`levels.js:243`): `rate = stage.rate x segRate[seg] x diff.spawn`, then `x P.Events.spawnMul(s)` (`levels.js:260-262`, `events.js:57-61`).
- Stage rates: 1.2, 1.5, 1.7, 1.6 (stages 1-4); stage 5 is the boss arena (rate 0.9, boss adds at `bossAddRate` 1.08 x diff.spawn, `levels.js:253`).
- segRate by route quarter A..D: 0.8, 1.0, 1.2, 1.1 (config-levels.js levels block, `segRate`).
- Holds: `holdRate` 1.6 / 2.6 / 3.4 at 0 / 15 / 30 s (config-levels.js levels block, `holdRate`/`holdPhaseT`); no spawns in the last 6 s of a hold.
- Cap: `levels.cap` = 140 alive (`config-levels.js:95`; checked inside `spawnBudget`, `levels.js:260-275`).

Each budget point is spent on the picked type's cost (`costOf`, `levels.js:278-281`): walker 1.0, runner 1.5, crawler 1.5 (budgetOf) and the def budgets in section 1. A spawn happens when the accumulator covers the cost.

Route weights (`routeMix`, `levels.js:292-304`), with `share` = [0.6, 0.8, 1.0, 1.1] per segment A..D:
- walker: 1.0
- runner: 0.2 (seg A) or 0.5 (B-D)
- crawler: 0.35
- screamer, hardhat (extras): 0.5 x share
- parkur, kasap, zehirli (new types): 0.5 x share x (1 + 0.1 x hi)
- spitter, brute, bloater and any other type: newShare x share, with newShare by stage 0.25 / 0.40 / 0.55 / 0.60 / 0.20

Worked examples (VERIFIED arithmetic from the formulas above):
- L2 (H01, stage 2, seg A): roster walker, runner, crawler. Weights 1 / 0.2 / 0.35, so walker 65%, runner 13%, crawler 23%. Budget rate 1.5 x 0.8 x 1.005 = 1.21 pts/s.
- L78 (H16 zeytinburnu, stage 3, seg D): roster walker, runner, bloater, brute, hardhat, zehirli. Weights 1 / 0.5 / 0.605 / 0.605 / 0.55 / 1.375 (total 4.635): walker 22%, runner 11%, bloater 13%, brute 13%, hardhat 12%, zehirli 30%.

### Difficulty curve (VERIFIED: `levels.js:19-20`, constants `config-levels.js:79`)

`hp = 1 + 0.03k + 0.0002k^2`; `dmg = 1 + 0.006k`; `spawn = min(2.0, 1 + 0.005k)`; `xp = 1 + 0.04k`. Boss HP (section 4) uses `diff.hp` at 30% share.

| L | k | hp mult | dmg mult | spawn mult | xp mult | hood / stage |
|---|---|---|---|---|---|---|
| 1 | 0 | 1.000 | 1.000 | 1.000 | 1.00 | H01 scripted |
| 2 | 1 | 1.030 | 1.006 | 1.005 | 1.04 | H01 s2 |
| 5 | 4 | 1.123 | 1.024 | 1.020 | 1.16 | H01 s5 (boss) |
| 10 | 9 | 1.286 | 1.054 | 1.045 | 1.36 | H02 s5 (boss) |
| 15 | 14 | 1.459 | 1.084 | 1.070 | 1.56 | H03 s5 (boss) |
| 20 | 19 | 1.642 | 1.114 | 1.095 | 1.76 | H04 s5 (boss) |
| 30 | 29 | 2.038 | 1.174 | 1.145 | 2.16 | H06 s5 (boss) |
| 50 | 49 | 2.950 | 1.294 | 1.245 | 2.96 | H10 s5 (boss) |
| 80 | 79 | 4.618 | 1.474 | 1.395 | 4.16 | H16 s5 (boss) |
| 100 | 99 | 5.930 | 1.594 | 1.495 | 4.96 | H20 s5 (boss) |

The spawn cap of 2.0 is not reached within levels 1-100 (it needs k = 200). Run-time HP growth (`hpScalePerMinute` 0.08) is on top: x1.40 at 5 minutes.

### Affix and elite timing
- Elites: route marks at stage fractions 0.45 (stage 2), 0.60 (stage 3), 0.35 (stage 4) (`config-levels.js` stages block, 81-86; marks `levels.js:73`).
- Affix gates: hizli from hood 10 (H11), zirhli from hood 11 (H12), patlayan from hood 15 (H16).

---

## 4. Bosses

Boss archetype routing: `P.Bosses.archetype` returns `bossByHood[hoodId]` if set, else the type passed in (`sim/bosses.js:23-26`).
HP at spawn: `B.hp x (1 + 0.03 x hoodIdx) x (1 + (diff.hp - 1) x 0.3)` (`sim/bosses.js:29-40`). Boss HP is overwritten after `spawnEnemy`, so run-time HP growth does not apply to bosses.

| Archetype | Base HP | Speed | Contact | Key attacks | Source |
|---|---|---|---|---|---|
| brute | 1400 | 0.8 | 14 | attack set in `sim/bosses.js:122-183` (not re-read this pass; UNVERIFIED detail) | config-levels.js:57 |
| bloater | 1300 | 0.55 | 18 | slam 3.5 m (windup 1.1, dmg 20), burst r 4.0 (enemy 60, hero 22, cloud 4 s), pools, minis | config-levels.js:63 |
| spitter | 1100 | 0.7 | 14 | fan of 5 (spread 60, range 4-8 m, dmg 6, puddle 3 s), acid rain (8 globs, span 9, windup 1.0) | config-levels.js:69 |
| taksici | 1400 | 0.85 | 14 | charge (lane 8 m, speed 9.5, dmg 16), smash r 2.6 (dmg 16), summon 3 walkers; oil slick r 1.3, 5 s; weak spot 1.6 s | config-bosses.js:7-22 |
| kasapBoss | 1500 | 0.7 | 16 | 3-swing cleaver combo; apron weak spot after the combo | config-bosses.js:23-37 |

Boss HP by level (computed from the formula; VERIFIED arithmetic, not run in-game):

| Level | Hood | Runtime archetype | HP at spawn |
|---|---|---|---|
| 5 | istiklal | brute | ~1452 |
| 10 | galata | brute | ~1566 |
| 15 | karakoy | brute | ~1688 |
| 20 | bridge | bloater | ~1690 |
| 30 | sirkeci | kasapBoss | ~2262 |
| 50 | laleli | kasapBoss | ~3020 |
| 80 | zeytinburnu | bloater | ~3931 |

Boss windups are floored at `telegraphMin` 0.8 s via `tele()` (`bosses.js:20`, used `127-187`).

---

## 5. Bot sim results

Command: `node tools/bot.js --levels=2,5,10,15,20,30,50,80 --seeds=6` (ran 80.7 s). Policy `kite-generic`, loadout `expected` (`P.Power.expectedLoadout`, i.e. the expected progression at that level, not a real player). "Clear" = win with one revive allowed. Source: bot.js usage header lines 1-6.

| Level | Hood / stage | Type | Clear | No-death | Median s | Deaths/run | Level-ups | Peak alive | Objective | Crashes / timeouts |
|---|---|---|---|---|---|---|---|---|---|---|
| 2 | H01 s2 | route | 6/6 (100%) | 100% | 183 | 0.00 | 12 | 185 | survive.tram 6/6 | 0 / 0 |
| 5 | H01 s5 | boss | 6/6 (100%) | 100% | 130 | 0.00 | 9 | 97 | boss 6/6 | 0 / 0 |
| 10 | H02 s5 | boss | 5/6 (83%) | 83% | 145 | 0.33 | 9 | 96 | boss 4/6 | 0 / 0 |
| 15 | H03 s5 | boss | 6/6 (100%) | 67% | 146 | 0.33 | 11 | 102 | boss 6/6 | 0 / 0 |
| 20 | H04 s5 | boss | 6/6 (100%) | 83% | 121 | 0.17 | 12 | 119 | boss 6/6 | 0 / 0 |
| 30 | H06 s5 | boss | 4/6 (67%) | 33% | 133 | 1.00 | 12 | 131 | boss 4/6 | 0 / 0 |
| 50 | H10 s5 | boss | 5/6 (83%) | 33% | 147 | 0.83 | 15 | 159 | boss 5/6 | 0 / 0 |
| 80 | H16 s5 | boss | 6/6 (100%) | 100% | 109 | 0.00 | 15 | 160 | boss 6/6 | 0 / 0 |

Level 1 (scripted, `node tools/bot.js --seeds=6`, policy kite, 4.8 s): clear 6/6, clear without dying 4/6, median 153 s, kills 576, peak alive 116, deaths by cause `{walker: 1, runner: 1}`.

Notes:
- 6 seeds per level. Death counts are small samples; L30 and L50 are the weakest (33% no-death), and L80 is 100% no-death. The bot's no-death rate looks noisy across levels.
- Peak alive exceeds the `levels.cap` of 140 at L2 (185), L50 (159), L80 (160). The budget spawner respects the cap, so the excess comes from horde ambient or events. UNVERIFIED which path adds it.
- The `dmg x rate` column rises from x1.13 (L2) to x1.68 (L80), which is the power curve, not enemy output.

---

## 6. Readability (browser, file:// with the wibey browser)

Method: loaded the game page in the embedded browser, `P.debug.playLevel(N)`, stepped the sim with `P.stepSim`, froze the loop with `P.CFG.sim.maxStepsPerFrame = 0` (default 4, `config.js:10`, `main.js:355`), and restored it to 4 afterwards (VERIFIED).

Screenshots (all in `reviews/media/R1/enemies/`):
- `L2-crowd-20s.png`: L2 at 20 s, crowd mix.
- `L2-kasap-windup-ring.png`: kasap cleaver windup ring on the hero spot.
- `L2-brute-charge-lane.png`: brute charge lane.
- `L2-hit-flash-frame.png`: hit flash frame.
- `death-screen-cause-toxic-raw-key.png`: death screen showing the raw cause key.
- `L10-crowd-20s.png` (new this pass): H02 stage 5 at 20 s, before the boss.

Findings:
- **L10 frame at 20 s:** HUD reads `Galata 2-5`, player LV 2, timer 0:20, objective "Beat the boss", time left 2:30, HP 136/136. Sim: 25 enemies alive, types walker, spitter, crawler, runner. No elites, no boss in the list yet. The silhouettes read at this scale. Some walkers overlap in a central cluster.
- **Death-screen cause bug:** the death screen shows the raw key `cause.toxic`. No `cause.toxic` key exists in any `strings*.js` (grep). `screens.js:412-415` falls back to `P.t`, and `strings.js:122-126` returns the key on a miss. Zehirli kills use the toxic zone path (`enemies.js:272`, `combat.js:174`); exact cause source UNVERIFIED.
- **Tip coverage:** `strings-ui2.js:10-13, 23-26` has tips for bloater, brute, spitter and screamer only. Coverage for the other types was not checked (UNVERIFIED).
- **Telegraph colours:** `view/enemies-fx.js:6-7` colours; `drawLane` 82-101, `drawRing` 104-109, `drawSwell` 131-138 (code read only; contrast not measured).
- **Bloater pre-burst timing:** code read only (`enemies.js:226-234`); visual timing UNVERIFIED.
- **Tool defect:** `tools/art-preview.html` does not load `config.js` (script list 50-56), so `P.CFG` is undefined and `view/sprites.js:220` throws. The gallery renders blank. Typerows omit kasap, parkur, zehirli, kurye, copci and bosses (`art-preview.html:117-127`). Not fixed (no edits allowed).
- **Telemetry:** grep for enemy names in `js/view/telemetry.js` found none. UNVERIFIED whether enemy events are logged at all.

---

## 7. Design-doc and catalog drift

Verified this pass (code vs doc):

| # | Doc (file:line) | Says | Code (file:line) | Says | Status |
|---|---|---|---|---|---|
| D1 | docs/content-catalog.md:113 | crawler HP 8, XP 2 | config.js:41 | HP 14, XP 4 | drift |
| D2 | docs/content-catalog.md:114 | brute charge 4 m every 6 s, budget 6.0 | config-levels.js:14-19 | chargeDist 8, budget 8.0 | drift (windup 0.8 matches) |
| D3 | docs/content-catalog.md:115 | spitter projectile 6 dmg, 4 m/s, every 3 s, 0.6 s telegraph | config-levels.js:8-13 | glob dmg 4, cd 3.0, windup 0.7 | drift |
| D4 | docs/content-catalog.md:116 | exploder: 0.8 s fuse, r 2.0, 20 dmg, L8 | no def; `grep -rn exploder js/` returns 0 hits | none (bloater is the closest) | drift (doc entry with no code) |
| D5 | docs/content-catalog.md:120 | elite = purple outline | config.js:26 | gold `#FFC93C` | drift |
| D6 | docs/game-design.md:231 | max 300 simultaneous enemies | config-levels.js:95 | cap 140 | drift |
| D7 | config-enemies4.js:5 (code comment) | every new-enemy windup floored at 0.8 s | enemies.js (spitter 0.7 s), enemies2.js:61,70 (parkur 0.45 s) do not call `tele()` | floor not applied | code/comment drift |
| D8 | js/journey.js hood rows (`boss` field) vs config-bosses.js:38-43 | journey `boss` field | runtime `bossByHood` | 7 hoods differ (see section 3) | drift; the journey field has no reader in js/ |
| D9 | journey.js hood rows | diner in H01 roster | levels.js:60 drops diner | never spawned in generated levels | intended by code, not in docs (UNVERIFIED that docs mention it) |

Prior-read candidates, NOT re-verified this pass (treat as UNVERIFIED):
- docs/game-design.md:118-126: superseded formulas (sec 4.6).
- docs/game-design.md:224-231: spawn rules; "70/30 ahead/behind" vs code `spawnAhead`/`spawnBehind` (config-levels.js:96) and per-stage `behind` shares of 0.00-0.20 (config-levels.js:82-86).
- docs/content-catalog.md:128-180 (section 6 bosses, marked superseded D-027) and :184-234 (section 7 levels, superseded): still present.
- docs/design-system.md:122-137 (readability rules), :141-153 (juice), :167-170 (enemies).
- docs/hoods-bible.md:58-293 zombie locals; boss canon names vs `js/story/strings-story.js:8-24`.
- docs/journey.md:~132-160 enemy schedule and affix table, said to match code.

---

## 8. Raw observations

- Enemy definitions are spread across 6+ files (config.js, config-levels.js, config-enemies3.js, config-enemies4.js, config-bosses.js, and sim/*.js). Several numbers are overridden in code: `E.zehirli` uses `Object.assign` on spitter (config-levels.js:50); copci/kurye numbers are split between config-enemies3 and config-enemies4.
- Cause keys for enemies in `strings-enemies3.js:5-10`, `strings-enemies4.js:7,14`, and `strings-progress.js:39,82`. The spitter death cause is hard-coded `'spitter'` at `enemies.js:208`, which may also cover zehirli (UNVERIFIED).
- Armour: kasap armour 0.75 and zirhli 0.7 are applied as damage multipliers (`combat.js:37-53`, `combat.js:42-43` per earlier read). Elites get `kbResist` at least 0.6 (elite branch in `combat.js` spawnEnemy, lines 5-29).
- Boss adds use `canAdd` (noAdd on kasap, `levels.js:257`).
- Bot tool prints verbose JSON twice per run (noted earlier; deduped in our counts).
- Bot seeds: 6 per level. Runs take ~1.7 s each at 5 levels; the 8-level batch took 80.7 s.
- Two HUD labels (`LV 2` and `Galata 2-5`) can be confused: LV is the player level; `Galata 2-5` is the level id H02-L5 (level 10).
- Telegraph and damage numbers in the design docs do not match the code in D1-D7 above. Treat code values as the current source of truth, per AGENTS.md.
- Telemetry for enemy events: not found (UNVERIFIED).
