# CONTENT-LENGTH-R1: how long is Chapter 1, really

Status: research and design, 2026-11-13. Only this file was written. Bot output and scripts are in /tmp/ctl (outside the repo). Build: commit b44eb39 with uncommitted work (branch r1/t2-art-direction at session start); code snapshot in section 9. Trigger: owner playtest, "in 5-10 minutes I finished the first ten levels... if we have 100 levels in the first chapter... 30 minutes to an hour".

## 0. Answers

| Question | Answer |
|---|---|
| What is a level? | One run. Journey index 1-100 (`prototype/js/journey.js:98-103`, id `H01-L1`). Chapter 1 = all 100 (`docs/business-plan.md:233`). |
| Levels per hood | 5 (`journey.js:12`). Stages 1-4 end in a gate hold; stage 5 is the boss arena. |
| Minutes per level / hood / 100 levels | Design: 3:00-6:00 per level, 20-28 min per hood, 7-9 h (`docs/journey.md:589-591`). Bot (8 hoods, 40 levels, 4 seeds, clear-only medians): 4.2 min per level, 20.9 min per hood (14.9-24.9), 6.96 h (5.0-8.3). |
| Owner's "10 levels in 5-10 min" | Not possible in this build. The 10 gate holds alone take 7.7 min. Walking alone at 3.2 m/s takes 10.6 min. Walk + hold is the floor at 18.3 min. Bot median: 32.7 min (section 3). |
| Real gaps | Boss stage: bot 2:24 mean vs design 5:00-6:00 (`docs/journey.md:89`). Nothing new after level 100 (`docs/retention.md:75`); replays pay little (section 4). |
| Does one cheap change double time? | No. Holds x1.9: +16%. Route x1.25: +13%. Brute boss HP x2: +93 s per brute boss, and only 5 of 20 hoods have one. A replay tier (Nightmare N1) is what doubles total play. |
| Recommendation | Package P1 (section 7): route x1.25 and brute boss HP x2 (config, S), Nightmare N1 pass (M), Night Shift daily (S). First pass moves from 6.96 h to 8.0 h (bot). |

## 1. Units in code and UI

| Term | Code | What the player sees | Doc term |
|---|---|---|---|
| Level | `P.Journey.level(i)`, index 1-100 (`journey.js:98-103`). One run. Telemetry `level_start` / `level_end` (`js/main.js:58,321`) | No index on the HUD | "level" = one run (`journey.md:589`) |
| Stage | `stage = index - 5*hood` (`journey.js:100`). Rows `levels.stages[0..4]` (`config-levels.js:85-91`) | HUD chip `İSTİKLAL 1/5` (`js/view/ui.js:84`; `js/strings-journey.js:8`, `'{s}/{of}'`) | "stage N = level N of the hood" (`journey.md:80`) |
| Hood | `P.Journey.hoods[0..19]` (`journey.js`): km, enemies, boss, kit | Hood name in caps in the chip. Hood card on entry, 1.5-3 s (`js/view/hood-card.js:6`) | "hood" |
| Chapter | No object in code. The 100-level journey is the chapter | none | `business-plan.md:233` |
| Lv | `s.level`, reset each run (`ui.js:98`) | "Lv N"; "LEVEL UP · Lv N" banner (`js/strings-progress-ui.js:37`) | not a journey level |
| Timers | run clock `s.runT` (`js/sim/sim.js:123`; shown by `ui.js:82`). Gate hold `hold.T - hold.t` (`ui.js:81-82`), labels DAYAN / HOLD (`js/strings.js:9,66`) | top M:SS counts up; during a stage 1-4 hold it counts down | "hold" (`journey.md:85-89`) |
| Objective row | reach: `Elapsed {t} · par {par}` (`js/strings-progress.js:52`; `js/sim/objectives-kinds.js:61`) | the M:SS pair (elapsed / par) appears in the objective row | objective |

No level time limit exists. `runT` only increments (`sim.js:123`; `js/sim/director.js:317`). `MAX_T = 600` is a bot guard (`tools/bot.js:52`), not a game rule.

How a run ends (`js/sim/levels.js`):

| Event | Rule | Early? |
|---|---|---|
| Win | gate open and hero y >= exitY + 0.6 (`winCheck`, lines 230-238) | normal |
| Gate opens | after holdT (line 205), or when the boss dies (line 225, boss stage only) | boss kill only; the walk to the gate still follows (bot: 12-28 s) |
| Objectives | never gate the exit (`js/config-objectives.js:9`) | no |
| Death, quit | one revive, then lose (`js/main.js:265-273`); quit logs `level_end` with no level_id (`main.js:331`) | lose / quit |

Sim time can only run at or below wall time: `acc += dt * timeScale * feelScale(dt)` (`main.js:361`), and `feelScale` only slows (`main.js:343-349`). There is no fast-forward.

Shortcuts (none shortens a run's clock): `?level=N` (`main.js:64-65`); `?seg=B|C|D` (L1 only; `main.js:108`); `?meta=unlockall`, `?mastery=N`, `?arsenal=1`, `?thief=0`, `?seed=N` (`main.js:3,35-38`); `?debug=1` or devTools shows the telemetry export (`js/view/screens.js:14,349`; `index.html:137`).

## 2. Actual vs design duration

### 2.1 Floors (walk at 3.2 m/s, `js/config.js:32`, plus hold)

| Stage | Length m | Hold s | Walk s | Floor s | Design target s | Target / floor |
|---|---|---|---|---|---|---|
| 1 | 170 | 40 | 53.1 | 93 | 180 | 1.9 |
| 2 | 200 | 50 | 62.5 | 113 | 210 | 1.9 |
| 3 | 230 | 60 | 71.9 | 132 | 240 | 1.8 |
| 4 | 260 | 70 | 81.3 | 151 | 270 | 1.8 |
| 5 boss | 160 | none | 50.0 | 50 + fight | 300-360 | - |

The hold starts 12 m before the gate (`levels.js:33`; `holdDepth`, `config-levels.js:92`), so the exact floor is about 4 s lower. Design targets include fights and detours; the walk alone is 93 s for stage 1.

### 2.2 Bot vs design by stage

Eight hoods sampled: İstiklal (H01), Galata (H02), Karaköy (H03), Sirkeci (H06), Kumkapı (H09), Samatya (H13), Bakırköy Çarşı (H17), Ataköy (H20). 40 levels, 4 seeds each, clear-only medians (every stage has at least 2 clears).

| Stage | Bot median s | Bot mean s | Range s | Design s | Bot mean / design | Clears (idx >= 2) |
|---|---|---|---|---|---|---|
| 1 (incl. scripted L1) | 160 | 157 | 130-182 | 180 | 0.87 | 28/28 |
| 2 | 312 | 284 | 178-451 | 210 | 1.35 | 94% |
| 3 | 321 | 308 | 188-456 | 240 | 1.28 | 91% |
| 4 | 386 | 360 | 242-487 | 270 | 1.33 | 81% |
| 5 boss | 155 | 144 | 108-160 | 300-360 | 0.40-0.48 | 84% |

Per-level clear-only medians (s). Win counts below 4 in brackets:

| Hood | S1 | S2 | S3 | S4 | Boss |
|---|---|---|---|---|---|
| H01 İstiklal | 156 | 178 | 199 | 242 | 121 (3/4) |
| H02 Galata | 133 | 193 | 188 | 397 | 157 |
| H03 Karaköy | 160 | 206 (3/4) | 283 | 274 | 152 |
| H06 Sirkeci | 182 | 200 | 456 (3/4) | 487 (3/4) | 158 (2/4) |
| H09 Kumkapı | 169 | 387 (3/4) | 398 (3/4) | 386 (2/4) | 108 (3/4) |
| H13 Samatya | 130 | 344 | 321 | 442 (2/4) | 145 (3/4) |
| H17 Bakırköy Çarşı | 182 | 451 | 325 | 380 (3/4) | 155 |
| H20 Ataköy | 145 | 312 | 295 (3/4) | 275 | 160 |

Read: stages 2-4 run 28-35% over design, and the time is combat. Stage 4 averages 5,000 kills per run (2,000-9,400). Enemy HP rises 8% per run-minute (`js/config.js:38`). The boss stage is under half its design length: approach 48-81 s, fight 48-95 s, walk after the kill 12-28 s.

### 2.3 Per hood and per 100 levels

| Basis | Per level | Per hood | 100 levels |
|---|---|---|---|
| Owner (claimed) | 0.5-1 min | 2.5-5 min | "30 min to an hour" |
| Floor (walk + hold, no fights; L1 hold 60 s) | 1.8 min | 9.0 min (+ boss fight) | 3.0 h |
| Design (`journey.md:589-591`) | 3-6 min | 20-28 min incl. map and comic | 7-9 h |
| Bot (clear-only, 8 hoods) | 4.2 min | 20.9 min (14.9-24.9) | 6.96 h (5.0-8.3) |

## 3. The "10 levels in 5-10 minutes" claim

### 3.1 Hard limits (first 10 journey levels)

| Floor or measure | s | min | Note |
|---|---|---|---|
| Gate holds only (L1 hold 60 s, `config.js:153`; stages 1-4 of two hoods, 2 x 220 s) | 460 | 7.7 | no walking |
| Walking only at 3.2 m/s | 638 | 10.6 | no holds |
| Walk + hold (the floor) | 1,098 | 18.3 | L1 assumed 170 m (scripted route, not measured) |
| Walk + hold with dash | 979 | 16.3 | about 3.9 m/s while walking: dash 3.2 m, cooldown 3.5 s (`js/config-weapons.js:145`) |
| Bot median, clear-only | 1,963 | 32.7 | section 2.2 |
| Owner's claim | 300-600 | 5-10 | - |

Five minutes is below the holds alone. Ten minutes is below walking alone. So 5-10 min for 10 journey levels is not reachable in this build by any player, unless the build differs.

### 3.2 Hypotheses

| # | Explanation | Fit | Test |
|---|---|---|---|
| H1 | He counted in-run Lv (level-ups). Bot Lv 10 comes at median 58 s (20-186 s) into a stage run. Earlier playtest first level-up at 8.6 s (`reviews/REVIEW-R1.md:1048`) | weak: Lv 10 is about 1 min in, not 5-10 min | `level_up` with run_level 10, and `level_end` t_s |
| H2 | He estimated the clock by feel. Short repeated runs feel shorter | possible | `level_end` t_s against a stopwatch |
| H3 | Build or config differs: shorter `holdT`, a faster hero, or shorter routes. `?seg` changes L1 only | possible only if walk speed or route lengths differ: at 3.2 m/s walking alone takes 10.6 min | `level_start` / `level_end` t_s and build id |
| H4 | HUD "4:38 / 5:38" is the objective row (elapsed / par). No 338 s par exists (reach 170-260 s, `config-objectives.js:41`; boss 150 s, `:56`) | cannot reproduce | screenshot and build id |

### 3.3 Telemetry the owner can export

The export is "Download telemetry (JSONL)" in the pause menu. It is visible only with devTools or `?debug=1` (`screens.js:349`, `index.html:137`). `PLAYTEST-GUIDE-R1.md:16` asks for it.

Events: `level_start` (ts, level_id; `main.js:58`), `level_up` (run_level, t_s; `main.js:153`), `level_end` (result, level_id, t_s, stars, kills; `main.js:321`; quit has no level_id, `main.js:331`), `death` (t_s, run_level; `main.js:245`), `card_offered` / `card_chosen` (ts; `main.js:188-196`).

Do not use `level` (always 1, the default in `js/view/telemetry.js:7`). `ts` is wall clock (`telemetry.js:6`); `t_s` is sim time. `build` is hard-coded `proto-0.1`.

One-liners (each was run on a synthetic file in /tmp):

```
node -e 'const L=require("fs").readFileSync(process.argv[1],"utf8").trim().split("\n").map(JSON.parse);let st=null;for(const e of L){if(e.event==="level_start")st=e;if(e.event==="level_end"&&e.result!=="quit"){console.log(e.level_id,e.result,"sim_s",e.t_s,"wall_s",((new Date(e.ts)-new Date(st.ts))/1000).toFixed(0))}}' FILE.jsonl
```
Per level: sim time vs wall time. The gap is cards, map and story.

```
node -e 'const L=require("fs").readFileSync(process.argv[1],"utf8").trim().split("\n").map(JSON.parse);const out=[];let c=null;for(const e of L){if(e.event==="level_start"){if(c)out.push(c);c={id:e.level_id,lv:[]};}else if(e.event==="level_up"&&c)c.lv.push([e.run_level,e.t_s]);}if(c)out.push(c);for(const x of out)console.log(x.id,"lv_ups",x.lv.length,"Lv10_at_s",(x.lv.find(y=>y[0]===10)||[])[1]);' FILE.jsonl
```
Level-ups per run and when Lv 10 happened. Runs with no level_end (quit) show 0.

```
node -e 'const L=require("fs").readFileSync(process.argv[1],"utf8").trim().split("\n").map(JSON.parse);let o=null;const d=[];for(const e of L){if(e.event==="card_offered")o=e;if(e.event==="card_chosen"&&o){d.push((new Date(e.ts)-new Date(o.ts))/1000);o=null;}}console.log("picks",d.length,"seconds",d.map(x=>x.toFixed(1)).join(","))' FILE.jsonl
```
Decision rule: a stage win with sim t_s below its floor (93 / 113 / 132 / 151 s for stages 1-4; 50 s plus the fight for the boss) means the build differs from this repo: stop and ask for the build id. If Lv 10 falls at 20-190 s in several runs, H1 is confirmed for those runs; it does not explain 5-10 min.

## 4. Content hours (100 levels)

| Component | Basis | Hours | Source |
|---|---|---|---|
| Route and boss, first pass (bot run time) | 6.96 h mean (5.0-8.3) | 7.0 | section 2.3 |
| Card picks | 20.6 level-ups per level (bot mean) = 2,060 picks at 2-5 s (assumed) | 1.1-2.9 (central 2.0) | `lvUps` in bot; card time is outside runT (`main.js:188-196`) |
| Map, hood card, comic, results | 20-40 s per level (assumed) | 0.6-1.1 (central 0.8) | `journey.md:590` |
| Lost attempts | bot loses 10% of runs (144 of 160 clear) | 0.5-1.0 (central 0.7) | model |
| First pass, median player (central) | 6.96 + 2.0 + 0.8 + 0.7 | 10.5 (band 9.2-12.0) | model |
| Stars: 3-star hunt | 68% of runs miss the 3-star proxy (section 9); 68 levels x 4.2 min x 1.5 tries | 7.1 today (8.2 at P1 pace; upper bound) | bot proxy |
| Street Cred | milestone n at round(450 x n^1.35) kills (`js/config-stats.js:48`). Bot 3,202 kills per level = 320,000 per 100 levels = 129 milestones. Ch1 tree costs 60 (`js/config-tree.js:11`) | not time; not binding in bot | `killsPerLevel 500` (`js/config-power.js:25`) is 6x below bot |
| Daily, gear, bond | one seeded level per day, 2 of 6 modifiers; "Iron" is a modifier, not a mode (`js/meta/meta-daily.js:2,14-20`), about 5 min per day. Gear costs 20 x level jeton, max 10 (`js/meta/meta-data.js:22`); Kaan joins after L20 (`js/config-bond.js:3`) | not measured | code |

Replays pay little today. A star pays 10 coins once, and only above the previous best (`meta-data.js:18`). Re-clearing a level earns no new reward.

The model gives about 10.5 h of first pass (band 9-12), against the design's 7-9 h, which already includes deaths and replays (`journey.md:591`); no "8-15 h core" target was found in the docs. The gap is mostly card picks and map time, which are unmeasured. The real shortfall is what comes after: no post-chapter content (`retention.md:75`).

## 5. Industry reference (unverified, from recall)

| Pattern | Typical in genre (recall, not checked) | This project |
|---|---|---|
| Run length | survivor-likes 10-30 min; mobile roguelite levels 1-3 min | 3-6 min per run (`retention.md:64`); bot 4.2 min |
| Session | mobile roguelites 10-20 min | 8-15 min target (`product.md:224`) |
| First world / chapter | about 2-6 h in mobile without energy | 7-9 h design (`journey.md:591`); bot 7.0 h route, 10.5 h with overhead |
| Post-chapter | hard or nightmare tier, endless, boss rush, mastery ranks | none planned in slice (`retention.md:75`) |
| Daily / energy | daily with one modifier; energy gating common in mobile | daily exists; no energy by design (`business-plan.md:33`) |
| First-chapter pacing | loop taught in 10-15 min; first meta unlock 20-30 min; first boss 30-45 min | first boss about 13 min in (bot, H01 stages 1-4 = 775 s) |

## 6. Options A-G with numbers

Effects (bot = measured with `--set` and paired seeds; model = arithmetic on bot numbers). Per-hood deltas are the sum of stage-mean deltas (stages 1-4 route, boss stage 5) times 20 hoods.

| Option | Change (keys and values) | Bot or model result | 100-level total (bot) | Replay hours added |
|---|---|---|---|---|
| A holds x1.9 | `levels.stages.0..3.holdT` 40/50/60/70 -> 76/95/114/133 (`config-levels.js:86-89`) | +35/+48/+56/+60 s per stage 1-4; boss unchanged; +199 s per hood (+16%) | 8.1 h | 0 |
| B power or star gate | hood N+1 needs rank or stars (`meta-data.js:351`; `config-power.js` hoodRank) | bare hero (levels 6-10, n=1 per stage): +13% per level, +103 s per hood (+8%); clears 20/20 both | 7.5 h (before the gate's replays) | one replay of all 20 hoods = 7.0 h, for players who fail the gate |
| C replay layers | 3 stars (exists); weekly boss rush (new); Endless district (new) | boss stage 144 s mean; 20 bosses = 48 min per rush | unchanged (replay) | rush 0.8 h per week; Endless open-ended |
| D Nightmare tiers | new `levels.diff` profile per tier (proxy: hpLin 0.06, hpQuad 0.0006, spawnLin 0.03, spawnCap 2.6, dmgLin 0.012) | stages 1-4 ratio 0.94-1.05; boss +38 s (ratio 1.26); L10 boss clears 4/4 -> 2/4 | 7.2 h (+3%) | +7.2 per tier |
| E variety per hood | mini-events, set-piece mini-bosses, earlier new types (`config-levels.js:129-140`, `:190-203`) | not measured (the bot does not model events) | unchanged | 0 |
| F Night Shift + seasonal | 3 linked stages per day on the daily plan (`meta-daily.js:55-58`) | 3 x 4.2 min = about 13 min per day | unchanged | 13 min per day if played daily (6.5 h per 30 days) |
| G 50 levels of 6 min | route length x2 per level, half the count | len x2: +620 s per hood (+49%); 50 levels x 6.2 min | 5.2 h (-25%) | 0 |

Qualitative (cost, risk, retention, guardrails from `business-plan.md:66-74`, section 5.1):

| Option | Cost | Risk | Retention effect (watch) | Guardrail check |
|---|---|---|---|---|
| A | S (4 numbers) | waiting in the hold; spawns stop `holdStopBefore` s before the gate (`config-levels.js:96`) | +200 s per hood, about +50 s per level | pass |
| B | M (save, gate UI, rules) | soft lock; the bot clears escort, defend and hack kinds at 0-3 of 4, so the star gate cannot be judged | a hard gate hurts D1 and D7; watch levels retried | pass only if earned, never sold (rule 1) |
| C | S (boss rush); L (Endless) | reward inflation; balance | strong for mastery players; watch 3-star rate | pass |
| D | M (profile, reward multiplier, unlock after L100) | repetition; boss clears drop | watch N1 starts within 7 days of L100 (the cliff) | pass: earned rewards only |
| E | L (art, design) | scope | strongest against repetition; watch D7 | pass |
| F | S (daily); M (seasonal) | fatigue | daily players reaching D7 (`retention.md:172`) | pass: no energy (`business-plan.md:33`) |
| G | M (layouts) | fewer "one more level" beats (`retention.md:64`) | fewer level-end beats | pass, but cuts hours: reject |

## 7. Recommended package P1

One package, four parts. Numbers are bot-measured (paired seeds) or modelled.

| # | Part | Config or code | Bot result | Cost |
|---|---|---|---|---|
| 1 | Route length x1.25 | `levels.stages.0..3.len` 170/200/230/260 -> 212/250/287/325; `levels.stages.4.len` 160 -> 200; `levels.stages.4.approach` 100 -> 125 | stage 1-4 ratio 1.16 (1.08-1.24); boss route +53 s (L5); +164 s per hood (+13%) | S |
| 2 | Brute boss HP x2 | `bosses.brute.hp` 1400 -> 2800 (`config-levels.js:59`). Brute bosses in hoods 1, 2, 3, 14, 20 only (`js/journey.js`) | +93 s on L5 (route fixed; clears 3/4 -> 4/4); +23 s per hood on average | S |
| 3 | Nightmare N1 | `levels.diff` profile (section 6, D); reward multiplier (new key); unlock on the Ch1 clear (`meta-data.js:351`) | +3% per hood on the base route; boss L10 clears 4/4 -> 2/4 | M |
| 4 | Night Shift daily | 3 linked stages on the daily plan (`meta-daily.js:55-58`) | about 13 min per day | S |

Totals (hours; overhead = card picks 2.0 + map 0.8 + lost attempts 0.7, central; star bound = 68 levels x 4.8 min x 1.5 tries = 8.2, half = 4.1; N1 pass = P1 route x 1.03 = 8.2 bot, 11.7 with overhead):

| State | First pass, bot run | First pass with overhead (band) | Two passes with overhead (P1 + N1) | + stars: half / full bound |
|---|---|---|---|---|
| Today | 6.96 | 10.5 (9.2-12.0) | - | - |
| P1 | 8.0 | 11.5 (10.2-13.0) | 23.2 | 27.3 / 31.4 |

Build order:

1. Now, no code: the owner exports two runs (his and one tester's) and runs the three one-liners (section 3.3). Settle H1-H3 before changing numbers.
2. S, 1-2 days: parts 1-2 (config only). Gates: no crash; clears of 85% or more on stages 1-4 (P1 check: 28/28 on levels 2-4 and 6-9); H02-L4 under 7 min (bot: 392 s with the P1 route, 397 s base). If telemetry shows median stage wins of 4.5 min or more, drop part 1 and keep part 2.
3. M, 2-3 weeks: part 3 (N1). The cheapest doubling in the table: one more full pass for one difficulty profile and one unlock.
4. S: part 4 (Night Shift), reusing the daily code.
5. After 2-4 weeks of data: N2, a star-based bonus, then Endless and variety (E). Not before telemetry.

Bot check for P1 (read-only; output to /tmp):

```
cd prototype && node tools/bot.js --levels=2,3,4,5,6,7,8,9,10 --seeds=4 --verbose --set='levels.stages.0.len=212;levels.stages.1.len=250;levels.stages.2.len=287;levels.stages.3.len=325;levels.stages.4.len=200;levels.stages.4.approach=125;bosses.brute.hp=2800' > /tmp/p1-check.txt
```

When shipping P1, update `journey.md:85-89` (stage table), `journey.md:589-591`, and `retention.md:168` (levels per session: 2-4 becomes about 2, at about 5 min per level).

## 8. What I could not determine

- Human speed: no human level data in the repo. Every human row is a design target or a model. Card-pick, map, hood-card and results time are outside runT and unmeasured (model: 2-5 s per pick, 20-40 s per level). Whether bot kill totals (3,202 per level) match humans is also unknown; they drive combat time and Street Cred.
- The owner's source of "5-10 min": H1-H4 are open (section 3.2). The "4:38 / 5:38" figure cannot be reproduced from this repo (H4).
- Bot objective skill: escort, defend and hack kinds clear 0-3 of 4, so the 3-star gate (option B) cannot be judged from the bot.
- Nightmare balance: the D proxy is a curve edit, not a designed tier. The bot does not dash and uses the expected meta loadout (`P.Power.expectedLoadout`), so it understates a human's dash.
- Brute boss effect on L10 is not isolated: no route-only L10 run exists. The L5 paired result (+93 s) is the only clean HP number. The bare-hero result rests on one level per stage.
- Scripted L1 walk length: the 10-level floor assumes 170 m (segments A-D not measured). Noise: 4 seeds per level; medians move 10-30% between seeds (H02-L4 ranges 350-430 s).
- Industry numbers (section 5) are from recall and unverified.

## 9. Method and code snapshot

- Read-only runs of `prototype/tools/bot.js` (`--levels`, `--verbose`, `--set`, `--bare`, `--noeczane`). Outputs: /tmp/ctl/v2 (all sweeps, 4 seeds each); /tmp/ctl/v3-noeczane (control). Not run: `--campaign`, `--nonew`, `--base`.
- Sweep groups in /tmp/ctl/v2: base (40 levels, 8 hoods, no override); hold (levels 2-10, holdT x1.9); len2 and len125 (levels 2-10); p1-boss (levels 5 and 10, route + brute HP x2); nm (levels 2-10); bare (levels 6-10). Paired comparison on the same seeds.
- Code snapshot: md5 of 11 files (bot.js, levels.js, eczane.js, config-levels.js, config.js, sim.js, combat.js, config-objectives.js, journey.js, config-weapons.js, index.html) taken at 13:10 (/tmp/ctl/code-version-1310.md5). Unchanged at the end of the sweep and at a 13:37 check. Other sessions edit the repo (30 modified files, untracked `js/sim/eczane.js` and SFX files). The numbers reflect this snapshot only.
- Eczane (part 14) is in the snapshot: the bot detours to heal stations when hurt. Control: `--noeczane` total time differs by -0.2% over 40 levels, with 28 uses in 160 runs (0.17 per run), so Eczane does not confound the numbers.
- Clear-only medians from per-run JSON (scripts in /tmp/ctl: `v2report.js`, `v2deltas.js`, `eczcmp.js`). The CLI "median s" (`tools/bot.js:382`) includes losses. Hood totals sum the five stage medians. Per-100-level projections are hood means times 20.
- Star proxies: star 1 = win; star 2 = win with no death (bot revive = used); star 3 = objective done (generated levels). Pooled over 156 runs (levels 2-100): clear 90%, no-death 54%, 3-star proxy 32% (stage 1 50%, 2 41%, 3 19%, 4 6%, 5 47%).
- The earlier sweep set is superseded and should not be cited. Floors come from `config-levels.js:85-91` and `config.js:32`.
