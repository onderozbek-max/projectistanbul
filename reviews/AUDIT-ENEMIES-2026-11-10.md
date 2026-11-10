# Enemy Audit (R1-T1), 2026-11-10

Scope: every enemy, elite, affix and boss in the JS prototype (v0.9 working tree). Read-only: **no code or number was changed.**
Facts and file:line citations are in `reviews/AUDIT-ENEMIES-2026-11-10-facts.md` (gathered by reading the code and running the bot sim and the browser).
Screenshots: `reviews/media/R1/enemies/`. Items marked UNVERIFIED were read in code only.
Method for verdicts: design-system.md §6 (readability rules), game-design.md and content-catalog.md (intent), the bot sim, and what the player sees at 390×844.

## 1. Summary

The roster is mechanically sound but **generic in the two places the owner cares about: Istanbul identity and visual readability.**

1. **The 21 Istanbul skins are cosmetic only.** A skin string is passed to the sprite and never read by any sim code (`sim/combat.js:14`, `sim/events.js:106`). A "fisher" and a "waiter" fight identically.
2. **20 named bosses, 5 mechanics.** The story pages name a distinct character per hood (Carpet Golem, Pigeon Man, Fish Porter, Grill Man, Key Keeper...), but the sim has five boss archetypes (brute, bloater, spitter, taksici, kasapBoss) reused across the 20 hoods (`config-bosses.js:38-43`). Brute alone covers 6 hoods.
3. **Difficulty is number scaling.** HP is 1 + 0.03k + 0.0002k² (about x4.6 at L80), plus 8% per minute inside a run. New mechanics only come from three affixes (fast, armored, exploding) gated by hood index. Late levels become sponges, not new problems.
4. **The difficulty curve is not monotonic.** Bot sim (6 seeds, kite policy): no-death rate L10 83%, L30 **33%**, L50 **33%**, L80 **100%**. L80 is easier for the bot than L30. Small sample, but it points the same way as item 3.
5. **At phone size most zombies read as one olive-grey crowd** (`L10-crowd-20s.png`): walker, runner, spitter and crawler differ in pose and a small prop, not in color or silhouette. Rule 7 (identifiable as a black silhouette at 48 px) has not been tested; I suspect several pairs fail.
6. A handful of **bugs and doc drift** (section 5) are cheap to fix.

## 2. Verdict per enemy

| Enemy | Role | Verdict | Why and what to change |
|---|---|---|---|
| walker | Baseline swarm | **Keep** | Fine. Gets its variety from skins (see §4) |
| runner (6 HP) | Fast pressure | **Keep** | Needs a distinct silhouette/color cue (§3) |
| crawler (14 HP) | Low profile, feet-level | **Keep, fix doc** | Code HP 14, XP 4; catalog says 8 and 2. Decide which is canon |
| diner | L1 scripted | **Keep** | Tutorial only (dropped from generated levels at `sim/levels.js:60`) |
| spitter (15 HP, 0.7 s windup, keeps 5.5 m) | Ranged zone denial | **Tweak** | Its windup bypasses the shared telegraph floor (config-enemies4.js comment says every new windup is floored at 0.8 s). Decide if 0.7 s is intended and document it. Death cause hard-coded to `spitter` (`sim/enemies.js:208`) |
| brute (80 HP, 0.8 s, charge 8 m, cd 6 s) | Lane charger, mini-threat | **Keep** | Good readable telegraph (`L2-brute-charge-lane.png`). Catalog says charge 4 m, budget 6.0; code is 8 m and 8.0 |
| bloater / Dombili (24 HP, no windup, cloud 3 s) | Area denial on death | **Keep, verify** | Fun and local-flavored. Verify the pre-burst swell is readable in the browser (UNVERIFIED) |
| screamer (22 HP, 1.4 s windup) | Summoner, kill-priority | **Keep** | Counter is clear (kill before the wind-up ends). One of the four types that have a loading-screen tip |
| hardhat (42 HP, frontal x0.4) | Flank-or-weapon check | **Tweak** | Frontal armor is invisible. Add a clear shield cue, otherwise players read it as a sponge |
| kasap / butcher (150 HP, armor 0.75, 0.9 s swing) | Heavy melee | **Keep** | Ring telegraph is clear (`L2-kasap-windup-ring.png`). Never a boss add (correct) |
| parkur (16 HP, windup 0.45 s) | Leaper | **Tweak** | 0.45 s is under the design-system §6 rule 3 floor of 0.5 s if its hit is 10% of max HP or more (damage UNVERIFIED). Raise or document |
| zehirli (18 HP) | Toxic spitter | **Tweak** | Built as `Object.assign` on spitter (`config-levels.js:50`): same behavior plus a longer puddle. Kills probably report `spitter`; death screen shows the raw key `cause.toxic` (bug, §5) |
| kurye / courier (4 HP, 0.8 s tele) | Fast glass cannon | **Keep** | Distinct. Tip and death-cause strings missing |
| copci / bin man (40 HP) | Pushes bins, area control | **Keep** | The most Istanbul-feeling enemy mechanic in the roster; deserves more of this |
| Elite (HP x4, dmg x1.5, gold outline) | Mini-boss modifier | **Keep** | Doc says purple outline; code is gold. Gold is fine, fix the doc |
| Affixes fast / armored / exploding | Variety by hood index 10+ | **Keep, extend** | Only variety source after the early hoods. Add more (§4) |

## 3. Readability (design-system §6)

- **Rule 3 (telegraphs):** brute, kasap, screamer and bosses meet it. Spitter and parkur do not use the shared telegraph path.
- **Rule 7 (silhouettes at 48 px):** not tested. Proposed test: render each type as a solid black silhouette at 48 px in `tools/art-preview.html` and judge pairs (walker/runner/crawler, spitter/zehirli, hardhat/brute). The tool is broken today (`art-preview.html` does not load `config.js`, so the gallery renders blank) and omits kasap, parkur, zehirli, kurye, copci and bosses.
- **Color keying:** the world floor is mid-grey and zombies are olive-grey; the red telegraphs and gold XP pop, the enemies themselves do not separate. Proposal: one rim or accent color per behavior class (ranged, charger, summoner, armored, area) and a size class (3 sizes), so the player reads *what it does* before *who it is*.
- **Crowd overlap:** a central cluster overlaps in `L10-crowd-20s.png`. Peak alive exceeds the 140 cap (185 at L2, 159 at L50, 160 at L80 in the bot sim) likely from horde or events (UNVERIFIED), so the visual density is higher than the budget suggests.

## 4. How to make the roster Istanbul-specific (proposals, none built)

**A. Give skins a job (smallest change, biggest identity gain).** Pick 5 of the 21 skins and let each change one rule. Candidates, using characters and mechanics the story already sets up:
| Skin | Behavior idea | Why it fits |
|---|---|---|
| waiter | Carries a tray: blocks a frontal hit once, then throws it like a boomerang | Cafés in İstiklal, Kumkapı |
| fisher | Casts a line and drags Arda 2–3 m (hook already exists as a player evolution) | Galata Bridge, Samatya, Kumkapı |
| musician | Plays a loop: nearby walkers move 15% faster until it dies | H09 page: "zombie musician plays the same tune" |
| hamal (porter) | Heavy back-load: slow, armored from behind, drops a crate (cover or hazard) on death | Eminönü, Laleli |
| courier on scooter | Fast lane run, brakes with a skid telegraph | Existing kurye, extend it |
Cost: a few lines per skin in `sim/enemies*.js` driven by Def data (rule: no magic numbers in sim).

**B. One signature enemy per hood group**, e.g. a simit-cart pusher in the old city, a dolmuş driver charging along lanes in Aksaray, a grill-smoke bloater in Samatya. Start with six (one per district group), then roll out.

**C. A boss mechanic per named boss.** The level pages and objectives already describe several, so the story is ahead of the sim: ice cart to protect (Kumkapı), three keys to find (Yedikule), drum chain reaction (Zeytinburnu), school-bell waves (Bakırköy), ice-cream-bell waves (Bakırköy shore), pontoons and rope nets (Ataköy Marina). Reuse the five archetypes as shells and add one distinct rule each. Fix the journey/bossByHood mismatch first (§5).

**D. Difficulty by mechanics, not HP.** Cap HP growth (for example half the current exponent) and spend the saved difficulty on affixes and on the hood-specific rules above. Re-tune L25–L60 with the bot sim until the no-death rate declines steadily (no 100% at L80).

**E. Readability pass** (section 3) before any new enemy art, because T2 may change the art style.

## 5. Bugs, drift and housekeeping (cheap, safe to do first)

| # | Item | Where |
|---|---|---|
| B1 | Death screen shows the raw key `cause.toxic` (no such string); fallback returns the key on a miss | `screens.js:412-415`, `strings.js:122-126`, `config-levels.js:51` |
| B2 | Spitter death cause hard-coded; zehirli kills probably report `spitter` (UNVERIFIED) | `sim/enemies.js:208` |
| B3 | `tools/art-preview.html` renders blank: missing `config.js` in its script list; omits 6 enemies and bosses | `art-preview.html:50-56, 117-127` |
| B4 | Boss mismatch: `journey.js` says brute for 7 hoods (eminonu, sirkeci, kapalicarsi, laleli, yenikapi, bakirkoy, atakoysahil); `config-bosses.js bossByHood` says taksici or kasapBoss. No code reads the journey field | `journey.js`, `config-bosses.js:38-43` |
| B5 | Loading-screen tips exist for 4 of 12 enemy types | `strings-ui2.js:10-13, 23-26` |
| B6 | Peak alive above the 140 cap | `config-levels.js:95` and horde/events (UNVERIFIED) |
| B7 | Enemy definitions are split over six config files, zehirli is `Object.assign` on spitter | `config.js`, `config-levels.js`, `config-enemies3.js`, `config-enemies4.js`, `config-bosses.js` |

Doc drift to settle (decide code or doc, note under Deviations in the packet): D1 crawler HP/XP, D2 brute charge and budget, D3 spitter damage and telegraph, D4 `exploder` in the catalog but not in code, D5 elite outline color, D6 `game-design.md:231` max 300 enemies vs cap 140, D7 telegraph-floor comment vs spitter/parkur, D8 boss field mismatch.

## 6. Bot-sim table (6 seeds, kite-generic policy, expected loadout)

| Level | Clear | No-death | Median s | Deaths/run | Peak alive |
|---|---|---|---|---|---|
| L2 | 6/6 | 100% | 183 | 0.00 | 185 |
| L5 (boss) | 6/6 | 100% | 130 | 0.00 | 97 |
| L10 (boss) | 5/6 | 83% | 145 | 0.33 | 96 |
| L15 (boss) | 6/6 | 67% | 146 | 0.33 | 102 |
| L20 (boss) | 6/6 | 83% | 121 | 0.17 | 119 |
| L30 (boss) | 4/6 | 33% | 133 | 1.00 | 131 |
| L50 (boss) | 5/6 | 33% | 147 | 0.83 | 159 |
| L80 (boss) | 6/6 | 100% | 109 | 0.00 | 160 |
Caveat: 6 seeds is small and the bot's loadout grows with level; use 50 seeds (`--seeds=50`) before changing any number.

## 7. Recommended build order (owner picks)

1. **Quick fixes:** B1, B2, B3, B4, B5 and the drift decisions. About a day, no design risk.
2. **Readability pass:** silhouette test, color keying by behavior class (after the T2 art pick if art changes).
3. **Skins with jobs** (proposal A, five skins) and **hood-signature enemies** (B, six first).
4. **Boss mechanics** per named boss (C), starting with the six already described in level pages.
5. **Difficulty re-tune** (D) with a 50-seed bot run per decile of levels.

## 8. Questions for the owner

1. Which of the five skin behaviors in 4A do you want? Any you want to cut as too cute or too hard to read?
2. Is a boss-per-hood mechanic worth the scope now (4C), or only for a few major bosses (for example the ones with a Mom call or a story page)?
3. Do you accept capping HP growth (4D) as the main late-game lever, with new rules instead of bigger numbers?
4. Should the quick fixes (§5) be done on a separate branch first?
5. Spitter at 0.7 s and parkur at 0.45 s: raise to the rule, or document them as deliberate exceptions?

## Deviations

None. No number or design was changed by this audit. Every proposal above is a proposal and needs an owner decision (new entry in `docs/product.md` §17 when accepted).

## 9. Owner decisions (2026-11-10)

| # | Decision | Consequence |
|---|---|---|
| 1 | Agree with the skin proposal: fisher, musician, hamal first. More variety is wanted; the agent adds creative extras | Wave 1: three skin behaviors plus two new types (see §10). Wave 2: the rest |
| 2 | Boss mechanics: agent's recommendation | Six named bosses with a distinct rule each (the ones the level pages already describe); the other 14 keep their archetype and get a cosmetic and dialogue identity |
| 3 | Cap HP growth, spend difficulty on rules and affixes | Retune L25 to L60 with a 50-seed bot run; no number changes before the run |
| 4 | Quick fixes (§5) go first, on a separate branch | Branch `r1/enemy-fixes`. Agent call under this "yes": **code wins on numbers** (they are what the bot sim has tuned), docs are updated to match; the catalog `exploder` row becomes `bloater` |
| 5 | Spitter and parkur telegraphs | Parkur raised to 0.5 s (design-system §6 rule 3). Spitter stays at 0.7 s and is documented as a deliberate exception |
| 6 | `H14i3a` (TR) shorter wording | Done and pushed on the dialogue branch (`a94c4e0`) |
| 8, 9 | Start art-direction samples (T2) and the progression design doc (T5) | After the quick fixes land |
| 10 | Dialogue PR opened by the owner | |
| 11 | R1 files on their own branch | Branch `r1/enemy-fixes` carries the R1 plan, this audit and the fixes |

D-052, D-053 and D-054 are still **Proposed** (no answer yet).

## 10. Variety plan

Yes, the roster needs more variety than three skin behaviors. Principle: each addition changes **what the player does** (move, target, position, wait), not just numbers, and each reads at a glance.
| Wave | Item | What it changes for the player | Istanbul tie |
|---|---|---|---|
| 1 | fisher (skin) | Casts a line and drags Arda 2 to 3 m: break line of sight or dash | Galata Bridge, Samatya, Kumkapı |
| 1 | musician (skin) | Support: nearby walkers speed up while it plays: kill priority | H09 page, Kumkapı |
| 1 | hamal (skin) | Armored from behind, slow, drops a crate on death (cover or hazard): flank | Eminönü, Laleli |
| 1 | **martı / seagull thief (new type)** | Steals an XP drop and flees: chase or lose XP; reward for ranged weapons | Seagulls already fly over the streets |
| 1 | **çaycı / tea carrier (new type)** | Throws hot tea puddles that slow Arda: area denial that favors keeping moving | Tea is everywhere |
| 2 | simitçi (new support) | Drops a simit (small heal) when killed but is guarded by a pack: risk and reward | The simit tray is already Arda's shield |
| 2 | taksici honk (new type) | A horn makes nearby zombies charge: positioning and a sound cue | Taksici boss exists |
| 2 | waiter tray (skin) | Blocks one frontal hit, then throws the tray like a boomerang | Cafés in İstiklal, Kumkapı |
| 2 | courier scooter (extend kurye) | Fast lane run with a skid telegraph | Existing kurye |

Rules for all: telegraph at least 0.5 s, silhouette test at 48 px, no screen flashes over 3 per second, all numbers in Def data, strings TR and EN written natively.

## 11. Fixes done (R1, branch `r1/enemy-fixes`)

Quick fixes from section 5 and the drift list from section 7, done per section 9 decisions 4 and 5 (code wins on numbers, docs follow).

| Item | Status | What changed |
|---|---|---|
| B1 death cause `cause.toxic` | Done | Added `cause.toxic` (Zehirli bulut / Toxic cloud) and `cause.acid` (Asit birikintisi / Acid puddle) in `strings-enemies3.js`. New `tools/check-death-causes.js` fails when a sim cause lacks TR or EN text (negative-tested). |
| B2 spitter cause hard-coded | Done | `sim/enemies.js` reports `e.type`; `sim/bosses.js` spitter fan too. Checked: zehirli glob hits now report `zehirli` (4 of 4 in a probe). Zone damage (acid puddle, toxic cloud) still reports the zone kind. |
| B3 art preview blank, missing types | Done | `tools/art-preview.html` loads the config files and `comic-busts-hair/-cast`; rows added for kasap, parkur, zehirli, kurye, copci; boss cells for bloater, taksici, kasapBoss. Verified in the browser (file://); `reviews/media/R1/enemies/art-preview-fixed.png`. |
| B4 boss mismatch | Done | `journey.js` now matches `bossByHood` on the 7 hoods. Arena geometry unchanged (hash of 10 levels before and after). `check-hood-keys.js` §8 fails on a mismatch. |
| B5 tips | Done (6 new) | `tip.hardhat/kasap/parkur/zehirli/kurye/copci` in TR and EN (`strings-ui2.js`). Crawler already had `tip.crawler` in `strings.js`, not duplicated. The tips show on the down screen, keyed by death cause (`screens.js:414`); there is no loading-screen tip picker. `check-death-causes.js` §5 requires a tip per enemy type. |
| B6 peak alive above 140 | Investigated, not changed | See the report. Horde ambient spawns stop at 200 (`config-horde.js:22`), not 140; summons, boss adds, elites, events and surge arrivals have no cap check. |
| Parkur windup 0.45 to 0.5 s | Done | `config-levels.js` (E.parkur). Bot: L23 and L39 clear 19/20 to 20/20, no-death 80% to 85% and 75% to 85% (20 seeds). L2, L10, L20, L30 unchanged (parkur not in their roster). |
| Spitter 0.7 s kept | Done | `config-enemies4.js:5` comment now says which types are exempt from the 0.8 s floor (spitter, zehirli, parkur) and why. |

| Drift | Status | Change |
|---|---|---|
| D1 crawler HP/XP | Done | Catalog 8/2 to 14/4 (code). |
| D2 brute charge/budget | Done | Catalog charge 4 m to 8 m; budget 6.0 to 8.0. |
| D3 spitter | Done | Catalog row: glob 4 dmg, 0.7 s windup, exception noted. |
| D4 exploder | Done | Row renamed `bloater` with `config-levels.js` values; level table row 8 too. |
| D5 elite outline | Done | Purple to gold `#FFC93C` (catalog). |
| D6 cap 300 | Done | `game-design.md` §6 and `journey.md` state the code caps (140 route, 200 horde) and the B6 overshoot. |
| D7 telegraph floor comment | Done | `config-enemies4.js:5`. |
| D8 journey boss field | Done | `journey.js`, `journey.md` table and per-hood boss words, `config-bosses.js` comment; "three boss types" to five. |
| D9 H01 diner | Open | Journey roster and "diners turn" twist for H01; generated levels drop diners (`sim/levels.js:60`). Design question for the owner, not changed. |
| Extra | Done | Catalog tourist and fisherman rows marked "not in code" (they are outfits, not enemy defs). |

B6 (for the owner): the cap is not one number. Route budget spawns stop at 140 (`sim/levels.js:268`, `env-portal.js:47`); horde ambient and surge queue stop at 200 (`horde.js:132`, `horde.js:171`). Uncapped: summons (`enemies.js:375`), screamer calls (`enemies.js:84`), boss arena adds (`levels.js:383`), elite marks (`levels.js:357`), echo elites (`modifiers.js:83`), events (`events.js:114`), surge arrivals (`horde.js:161`), crawler emerges (`enemies.js:348`). Instrumented bot, L2, 6 seeds: 356 spawns made while over 140 alive, 348 of them from `horde.js:115`. Probe with a walking, invulnerable hero (not the bot policy): peaks 202 (L50) and 203 (L80), again mostly horde and surges. Recommendation: pick one ceiling and enforce it in one place (for example `P.Combat.spawnEnemy`, or an alive check in each spawner), with the route and horde stopping at it and summons and adds given a reserved share. The number is the owner's call; until then the docs state the real caps.
