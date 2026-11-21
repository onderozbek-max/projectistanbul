# Experiential coverage · first 30 · 2026-11-18

Coverage is an inventory and evidence map. It is not an artistic approval. Source/config, supplied live fixtures, earned simulation and earned browser play are distinguished below. No art or audio was newly generated in this packet. Existing approved illustrations remain the source.

## Hero and animation ownership

`hero_arda.png` side/front/back identity feeds `ActorRig`, `HeroMotion`, `HeroAttacks`, `HeroFootwork` and `ArtRasterChars`. Eight logical directions use distance-driven alternating jointed legs, planted shoes, hip shift and chest counterrotation. Start take-up is 100 ms, settlement 140 ms, turn blend 90 ms. Dash holds a prepared stride and compresses/releases through its actual state. Hit response follows actual positive damage. Defeat crossfades to the existing down pose. These are view changes; no added braking, safe frames or suppressed attacks.

Feet follow locomotion; attack footwork can plant them for the current preparation/contact. Mission loads and deliberate street actions own both hands. Work targets use two-bone arm reach at actual anchors. A chainsaw rev retains its grip except for a brief fresh secondary release (`shownAt` delta <110 ms). Other attacks still resolve on schedule. Hand/body ownership is not proof that every join looks convincing; inspect the normal-speed footage. Frame samples at source t=1 s, 6 fps: [knife](media/R1/experiential/contact-knife-r5.png), [chain](media/R1/experiential/contact-chain-r5.png), [chainsaw](media/R1/experiential/contact-chainsaw-r5.png), [cable](media/R1/experiential/contact-cable-r5.png). They supplement normal speed and do not replace it.

[Eight-direction movement](media/R1/experiential/hero-eight-directions.webm) · [Dash, reversal, hit and defeat](media/R1/experiential/hero-dash-hit-defeat.mp4) · [Six simultaneous weapons](media/R1/experiential/multiweapon-default.mp4) · [Minimum quality/reduced motion](media/R1/experiential/multiweapon-minimum-reduced.mp4)

## Enemy roster actually observed

Observed across the four earned campaigns: 15 runtime type IDs, including the shared boss archetype ID. All four walker outfits appeared. Extra `kasap` and `zehirli` role fixtures are coverage of known artwork/behavior; they are not claimed as natural first-30 spawns.

| Runtime ID | First observed ID / regular role level | Current source binding | Acting / evidence |
|---|---:|---|---|
| `bloater` | 1 / 1 | `characters/bloater.png; bosses may use their explicit preset override` | Mass/pressure and real burst; [role clip](media/R1/experiential/enemy-bloater.webm) |
| `crawler` | 1 / 1 | `characters/crawler.png; bosses may use their explicit preset override` | Low alternating forearm pull; [role clip](media/R1/experiential/enemy-crawler.webm) |
| `diner` | 1 / 1 | `characters/diner.png; bosses may use their explicit preset override` | Living patron onset → active threat; [role clip](media/R1/experiential/enemy-diner.webm) |
| `hardhat` | 1 / 1 | `characters/hardhat.png; bosses may use their explicit preset override` | Armored posture and actual deflection; [role clip](media/R1/experiential/enemy-hardhat.webm) |
| `kasapBoss` | 1 / boss alias | `landmarks/cook-poses.webp` | Shared boss archetype; use ten-boss table; boss table below |
| `runner` | 1 / 1 | `characters/runner.png; bosses may use their explicit preset override` | Compact fast forward stride; [role clip](media/R1/experiential/enemy-runner.webm) |
| `screamer` | 1 / 1 | `characters/screamer.png; bosses may use their explicit preset override` | Planted breath and call posture; [role clip](media/R1/experiential/enemy-screamer.webm) |
| `spitter` | 1 / 1 | `characters/spitter.png; bosses may use their explicit preset override` | Range-holding gait and throat/aim preparation; [role clip](media/R1/experiential/enemy-spitter.webm) |
| `walker` | 1 / 1 | `characters/walker_<hashed outfit>.png` | Uneven shuffle; four hashed clothing variants; [role clip](media/R1/experiential/enemy-walker.webm) |
| `brute` | 2 / 21 | `characters/brute.png; bosses may use their explicit preset override` | Wide planted heavy steps/commitment; [role clip](media/R1/experiential/enemy-brute.webm) |
| `copci` | 16 / 16 | `characters/copci.png; bosses may use their explicit preset override` | Braced bin push and rolling lane; [role clip](media/R1/experiential/enemy-copci.webm) |
| `kurye` | 21 / 21 | `characters/kurye.png; bosses may use their explicit preset override` | Existing scooter lean/charge; [role clip](media/R1/experiential/enemy-kurye.webm) |
| `cayci` | 22 / 22 | `characters/cayci.png; bosses may use their explicit preset override` | Tray/lob and real slowing puddle; [role clip](media/R1/experiential/enemy-cayci.webm) |
| `marti` | 22 / 22 | `characters/marti.png; bosses may use their explicit preset override` | Existing wing/tuck/dive/recovery; [role clip](media/R1/experiential/enemy-marti.webm) |
| `parkur` | 23 / 23 | `characters/parkur.png; bosses may use their explicit preset override` | Crouch, leap and actual landing; [role clip](media/R1/experiential/enemy-parkur.webm) |

Walker counts by observed ID hash: walk_student: 9245, walk_office: 9236, walk_shopper: 9210, walk_tourist: 9213.

## All 17 base weapons

All rows retain authoritative mechanics/config and current illustrated tool identity. `FireAnim.drawHeld`, `fire-anim-held*.js`, `HeroAttacks`, `HeroFootwork`, `WeaponContactFx` and the configured `wtier` live signature bind these IDs. Only the knife trace/grip progression and saw transfer received additional changes here; other already-working distinct actions were retained. Minimum quality keeps articulation and hit geometry while reducing decorative trails/particles.

| ID / illustrated icon atlas | Physical action retained/extended | Normal-speed supplied ranks |
|---|---|---|
| `knife` · `weapons/knife.png` | Wrist-led held blade; compact hand-following edge trace and directional contact | [1](media/R1/experiential/weapon-knife-r1.webm) / [3](media/R1/experiential/weapon-knife-r3.webm) / [5](media/R1/experiential/weapon-knife-r5.webm) |
| `nailgun` · `weapons/nailgun.png` | Aimed grip, muzzle kick, emitted nails and puncture contact | [1](media/R1/experiential/weapon-nailgun-r1.webm) / [3](media/R1/experiential/weapon-nailgun-r3.webm) / [5](media/R1/experiential/weapon-nailgun-r5.webm) |
| `canister` · `weapons/canister.png` | Weighted release, flying canister, actual landing and secondary blast | [1](media/R1/experiential/weapon-canister-r1.webm) / [3](media/R1/experiential/weapon-canister-r3.webm) / [5](media/R1/experiential/weapon-canister-r5.webm) |
| `chain` · `weapons/chain.png` | Held origin, slack/taut linked curve and weighted orbital contact | [1](media/R1/experiential/weapon-chain-r1.webm) / [3](media/R1/experiential/weapon-chain-r3.webm) / [5](media/R1/experiential/weapon-chain-r5.webm) |
| `sledge` · `weapons/sledge.png` | Two-handed preparation, body compression, planted slam and grounded impact | [1](media/R1/experiential/weapon-sledge-r1.webm) / [3](media/R1/experiential/weapon-sledge-r3.webm) / [5](media/R1/experiential/weapon-sledge-r5.webm) |
| `molotov` · `weapons/molotov.png` | Held bottle release, ballistic flight, shatter and bounded burning pool | [1](media/R1/experiential/weapon-molotov-r1.webm) / [3](media/R1/experiential/weapon-molotov-r3.webm) / [5](media/R1/experiential/weapon-molotov-r5.webm) |
| `fireworks` · `weapons/fireworks.png` | Launcher origin, distinct colored trajectories and sequenced airbursts | [1](media/R1/experiential/weapon-fireworks-r1.webm) / [3](media/R1/experiential/weapon-fireworks-r3.webm) / [5](media/R1/experiential/weapon-fireworks-r5.webm) |
| `cable` · `weapons/cable.png` | Held live end, actual connection arcs and target electrocution | [1](media/R1/experiential/weapon-cable-r1.webm) / [3](media/R1/experiential/weapon-cable-r3.webm) / [5](media/R1/experiential/weapon-cable-r5.webm) |
| `speargun` · `weapons/speargun.png` | Aimed release, spear flight and actual caught-target tether | [1](media/R1/experiential/weapon-speargun-r1.webm) / [3](media/R1/experiential/weapon-speargun-r3.webm) / [5](media/R1/experiential/weapon-speargun-r5.webm) |
| `extinguisher` · `weapons/extinguisher.png` | Cylinder/nozzle grip, pressurized white cone and actual push/slow | [1](media/R1/experiential/weapon-extinguisher-r1.webm) / [3](media/R1/experiential/weapon-extinguisher-r3.webm) / [5](media/R1/experiential/weapon-extinguisher-r5.webm) |
| `sawblade` · `weapons/sawblade.png` | Launch, rotating disc and actual outbound/return contacts | [1](media/R1/experiential/weapon-sawblade-r1.webm) / [3](media/R1/experiential/weapon-sawblade-r3.webm) / [5](media/R1/experiential/weapon-sawblade-r5.webm) |
| `manhole` · `weapons/manhole.png` | Heavy disc release/orbit, thickness and metallic contact | [1](media/R1/experiential/weapon-manhole-r1.webm) / [3](media/R1/experiential/weapon-manhole-r3.webm) / [5](media/R1/experiential/weapon-manhole-r5.webm) |
| `torch` · `weapons/torch.png` | Held nozzle and directional jet/scorch matching actual ticks | [1](media/R1/experiential/weapon-torch-r1.webm) / [3](media/R1/experiential/weapon-torch-r3.webm) / [5](media/R1/experiential/weapon-torch-r5.webm) |
| `olta` · `weapons/olta.png` | Cast, hook, line tension and actual reel/haul target | [1](media/R1/experiential/weapon-olta-r1.webm) / [3](media/R1/experiential/weapon-olta-r3.webm) / [5](media/R1/experiential/weapon-olta-r5.webm) |
| `cardoor` · `weapons/cardoor.png` | Broad supported sweep, momentum and actual crowd-directed throw | [1](media/R1/experiential/weapon-cardoor-r1.webm) / [3](media/R1/experiential/weapon-cardoor-r3.webm) / [5](media/R1/experiential/weapon-cardoor-r5.webm) |
| `slingshot` · `weapons/slingshot.png` | Drawn elastic, release at fork, visible powered projectile | [1](media/R1/experiential/weapon-slingshot-r1.webm) / [3](media/R1/experiential/weapon-slingshot-r3.webm) / [5](media/R1/experiential/weapon-slingshot-r5.webm) |
| `chainsaw` · `weapons/chainsaw.png` | Held spin-up, moving teeth, biting contact and torque; brief intentional grip transfers | [1](media/R1/experiential/weapon-chainsaw-r1.webm) / [3](media/R1/experiential/weapon-chainsaw-r3.webm) / [5](media/R1/experiential/weapon-chainsaw-r5.webm) |

Full rank-specific authoritative numbers are exported in [coverage.json](telemetry/experiential/coverage.json). A larger cosmetic silhouette does not alter damage reach. Knife held length is constrained by the actual configured range; the old floating fan is replaced by a hand-following edge trace.

## All 18 evolutions

Fixture damage/target counts below come from real weapon/zone simulation against nine supplied stationary high-HP targets for seven seconds. Conditional identities also have focused cases in `test-arsenal-w.js`, `test-weapon-lab.js` and `test-env.js`. The ordinary lab clips are supplemented by six real conditional captures: [capped self-heal](media/R1/experiential/condition-blacksmith.webm), [spit interception](media/R1/experiential/condition-foamstorm.webm), [wet arcs](media/R1/experiential/condition-arcchain.webm), [near-car blast](media/R1/experiential/condition-carbomb.webm), [actual Nazar-dodge zap](media/R1/experiential/condition-stormshield.webm), and [joining fire pools](media/R1/experiential/condition-lake.webm). These show actual conditional outcomes; their perceived spectacle remains an independent-review judgment.

| ID / base + partner | Actual signature | Fixture hits / distinct targets | Natural acquisitions / payoff | Video |
|---|---|---:|---|---|
| `cleaver` / `knife` + `gloves` | Heavier spinning cut/contact geometry | 67 / 9 | 29 / 28 with hit | [clip](media/R1/experiential/evolution-cleaver.webm) |
| `nailstorm` / `nailgun` + `energy` | Emitted nail volley/spread | 436 / 5 | 6 / 6 with hit | [clip](media/R1/experiential/evolution-nailstorm.webm) |
| `cluster` / `canister` + `jacket` | Landing releases secondary charges | 92 / 9 | 4 / 4 with hit | [clip](media/R1/experiential/evolution-cluster.webm) |
| `cyclone` / `chain` + `shoes` | Held chain origin and continuous linked orbit | 6 / 5 | Not naturally acquired in these policies | [clip](media/R1/experiential/evolution-cyclone.webm) |
| `finale` / `fireworks` + `magnet` | Sequenced salvo and extra actual impacts | 22 / 9 | Not naturally acquired in these policies | [clip](media/R1/experiential/evolution-finale.webm) |
| `forge` / `torch` + `energy` | Stronger sweep plus second scorch | 63 / 6 | Not naturally acquired in these policies | [clip](media/R1/experiential/evolution-forge.webm) |
| `grinder` / `chainsaw` + `gloves` | Sustained non-stalling bite with real stacks | 78 / 7 | Not naturally acquired in these policies | [clip](media/R1/experiential/evolution-grinder.webm) |
| `hookpull` / `olta` + `magnet` | Caught enemy becomes haul focus; real pull/stun | 28 / 9 | Not naturally acquired in these policies | [clip](media/R1/experiential/evolution-hookpull.webm) |
| `minibus` / `cardoor` + `kask` | Actual evolved door drop, slam and stun | 72 / 9 | Not naturally acquired in these policies | [clip](media/R1/experiential/evolution-minibus.webm) |
| `blacksmith` / `sledge` + `medkit` | Slam and actual capped self-heal | 21 / 7 | Not naturally acquired in these policies | [clip](media/R1/experiential/evolution-blacksmith.webm) |
| `stormshield` / `cable` + `nazar` | Orbit/zap links, including actual Nazar-dodge zap (Dash is not this proc) | 26 / 2 | Not naturally acquired in these policies | [clip](media/R1/experiential/evolution-stormshield.webm) |
| `foamstorm` / `extinguisher` + `medkit` | Persistent foam; conditional spit interception | 90 / 6 | 7 / 7 with hit | [clip](media/R1/experiential/evolution-foamstorm.webm) |
| `netspear` / `speargun` + `gloves` | Actual caught-target links and shared damage | 36 / 9 | 3 / 3 with hit | [clip](media/R1/experiential/evolution-netspear.webm) |
| `lake` / `molotov` + `energy` | Joining burning pools and longer slowing area | 94 / 5 | 8 / 8 with hit | [clip](media/R1/experiential/evolution-lake.webm) |
| `twinsaw` / `sawblade` + `powerbank` | Two outbound/returning discs | 72 / 7 | 3 / 3 with hit | [clip](media/R1/experiential/evolution-twinsaw.webm) |
| `fireball` / `molotov` + `gas` | Gas discovery; enhanced impact/burn | 90 / 6 | Not naturally acquired in these policies | [clip](media/R1/experiential/evolution-fireball.webm) |
| `arcchain` / `chain` + `wet` | Chain contact arcs; actual wet-ground condition | 315 / 9 | Not naturally acquired in these policies | [clip](media/R1/experiential/evolution-arcchain.webm) |
| `carbomb` / `canister` + `car` | Actual nearby-car bonus to blast | 60 / 9 | Not naturally acquired in these policies | [clip](media/R1/experiential/evolution-carbomb.webm) |

The campaign JSONL includes offered/chosen cards and ranks, evolution time, first effect/hit, damage, control and distinct target IDs. See [natural coverage](telemetry/experiential/coverage.json), [fixture outcomes](telemetry/experiential/evolution-fixtures.json), and all four earned campaign files. A late evolution with zero hits is reported, not counted as payoff. Delayed pre-evolution projectiles keep their original variant attribution.

## Ten bosses: actual earned power, two policies

Bands are diagnostic samples, not population percentiles: struggling = broad first attempt; typical = earned melee first attempt; strong = earned terrain save after up to five later clears, replayed. Strong therefore has more permanent power but may still draft a worse temporary build. Every sample names its save origin and records the actual entry arsenal. Seed 3 throughout. Times below are boss-only seconds; a loss shows no invented completion time.

| Level / preset | Evasive: low / typical / strong | Punish: low / typical / strong | Current source and normal-speed fixture |
|---|---|---|
| 1 / `cook` | 14.4 / 14.4 / 9.1 | 14.4 / 14.4 / 9.1 | `cook-poses.webp / CookFx`; [clip](media/R1/experiential/boss-L1-cook.webm) |
| 2 / `switchkeeper` | 14.1 / 12.9 / 9.9 | 5.4 / 5.8 / 5.8 | `boss_keeper.png / Istiklal boss hooks`; [clip](media/R1/experiential/boss-L2-switchkeeper.webm) |
| 3 / `roaster` | 18.3 / 31.5 / 18.4 | 9.0 / 8.5 / 8.0 | `boss_bigbro.png / roast hooks`; [clip](media/R1/experiential/boss-L3-roaster.webm) |
| 4 / `linekeeper` | 10.0 / 10.4 / 16.9 | 5.3 / 5.0 / 10.2 | `hardhat.png / relay hooks`; [clip](media/R1/experiential/boss-L4-linekeeper.webm) |
| 5 / `vatman` | 24.1 / 41.1 / 35.9 | 13.0 / 14.8 / 25.2 | `boss_vatman.png / Vatman hooks`; [clip](media/R1/experiential/boss-L5-vatman.webm) |
| 10 / `bellkeeper` | 56.5 / 32.4 / 64.3 | lose / lose / 31.6 | `boss_keeper.png / GalataBossFx`; [clip](media/R1/experiential/boss-L10-bellkeeper.webm) |
| 15 / `dockBride` | 19.8 / 10.5 / 19.9 | 9.9 / 8.2 / 12.6 | `boss_bride.png / KarakoyBossFx`; [clip](media/R1/experiential/boss-L15-dockBride.webm) |
| 20 / `bigFisher` | 44.7 / 24.9 / 21.0 | 27.3 / 15.2 / 7.6 | `boss_kasap.png / BridgeBossFx`; [clip](media/R1/experiential/boss-L20-bigFisher.webm) |
| 25 / `quayCaptain` | 32.3 / 31.5 / 39.0 | 16.4 / 15.9 / 14.1 | `eminonu-captain.webp / EminonuBossFx`; [clip](media/R1/experiential/boss-L25-quayCaptain.webm) |
| 30 / `ticketMan` | 47.2 / 38.7 / 22.5 | 29.9 / 30.3 / 12.3 | `sirkeci-cast.webp / SirkeciFx`; [clip](media/R1/experiential/boss-L30-ticketMan.webm) |

All ten keep actual attack geometry, distinct commitments and reachable recovery rules. Entry staging is 1.75 s on first view and 0.38 s when seen; existing sim turning/telegraph time still follows. Defeat uses each current profile; Captain/Cook/Ticket Man keep their calibrated full-body pose scales. The captain walk options crash found in earned browser playback was fixed and has a direct view regression.

Vatman seed 3: typical evasive 7 windups / 41.1 s; punish 3 / 14.8 s. Ticket Man: typical evasive 9 / 38.7 s; punish 7 / 30.3 s; strong punish 3 / 12.3 s. These replace the stale orbit/two-windup claims for these samples. The two L10 punish losses remain losses, not rerun-away successes. Some L2–4 punish clears last only 5–10 s: first-encounter identity/readability remains a specific human-review concern.

## Four major sequences

| Scene | Factual trigger and staging | Lifecycle / evidence |
|---|---|---|
| L1 opening | Fresh cold-open timeline; counter knife reach, automatic grip/strike, grounded diner response and stranger retreat; original ~28 s memory/dialogue structure retained | [fresh opening](media/R1/experiential/cold-open.webm); [first movement](media/R1/experiential/first-control.webm); no supplied power |
| L20 joining | Actual Fisher defeat retained as actor anchor; safely completed defeat starts shared world staging alongside the native comic before exit travel; Kaan approaches with lowered hands and route-facing exit | [earned full-viewport playback](media/R1/experiential/earned-L20.mp4); no granted ranks/invulnerability; automated cards/navigation |
| L25 farewell | Actual Captain defeat/anchor release; Kaan lowers posture beside the body, then faces the route; current neutral/current-help/stored-help script selection retained | [earned full-viewport playback](media/R1/experiential/earned-L25.mp4); rewards settle through the existing result transaction |
| L30 passage | Actual Ticket Man defeat after route conditions; Ticket Man ceases, shared route direction and current family/Bazaar call; L31 remains unavailable | [earned full-viewport playback](media/R1/experiential/earned-L30.mp4); final outcome recorded separately |

World choreography starts at the factual defeat anchor, concurrent with the existing ending comic. Its opening caption reads over the world, then the remaining panels become available. The shared protected lock lasts until both acting and reading finish; control returns for the real exit. The result at that exit does not replay the comic or settle twice. Seen flags are marked on completion/deliberate skip. Presentation stores no story outcome or reward. Source scene phases are 5.2/6.4/5.2 s for L20/25/30; reading time remains with the current native comic. Physical phone and unfamiliar-viewer comprehension remain pending.

Living street people/dormant diners and the rescued stranger reuse the approved restaurant-patron illustration through the new jointed rig. This is an integrated reuse, not newly authored character variety. Limb seams and character variety are explicit artistic-review items.
