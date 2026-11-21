# Audit12 balance evidence

Four actual card investment policies × three seed bases42/149/20261119 on each source. Same effective input/card-choice policy (later optional diagnostic flags disabled); actual retries and earned permanent growth retained. No ads/spend/supplied revives, power grants, minimum fight timer or adaptive boss scaling. Separate in-memory histories are not identical builds once earlier results diverge. Durations are headless sim boss-spawn-to-lethal, not protected-scene/camera/first-human-action times. Bots do not establish enjoyment.

Before: 384 attempts, 360 wins, 24 failures. After: 381 attempts, 360 wins, 21 failures. Every one of24 campaigns actually reached30. Failed attempts are in the raw files and JSON summary.

| Boss | Before first-attempt wins: median (range), s | After first-attempt wins: median (range), s | After first-entry deaths / entries | After retry wins: median (range), s |
|---|---:|---:|---:|---:|
| L1 Cook | 3.9 (0.8–28.9) | 16.3 (5.3–71.3) | 0/12 | no wins |
| L2 Switchkeeper | 4.6 (2.8–9.9) | 19.7 (8.2–27.6) | 0/12 | no wins |
| L3 Roaster | 9.8 (3.1–16.6) | 24.1 (6.2–48.5) | 0/12 | no wins |
| L4 Linekeeper | 7.2 (1.9–47.1) | 18.0 (3.9–58.6) | 0/12 | no wins |
| L5 Vatman | 19.3 (4.6–38.0) | 30.1 (9.8–65.9) | 1/12 | 69.7 (69.7–69.7) |
| L10 Keeper | 16.0 (3.6–31.8) | 29.4 (15.6–60.5) | 0/12 | no wins |
| L15 Bride | 18.6 (7.2–31.6) | 32.8 (19.1–64.0) | 4/12 | 53.3 (9.9–60.5) |
| L20 Fisher | 22.1 (7.3–34.8) | 31.5 (22.0–75.4) | 1/12 | 28.1 (28.1–28.1) |
| L25 Captain | 29.8 (10.3–45.5) | 50.4 (21.7–67.0) | 1/12 | 44.2 (44.2–44.2) |
| L30 Ticket Man | 26.7 (6.3–33.3) | 63.1 (29.1–100.9) | 1/12 | 144.8 (144.8–144.8) |

Fixed diagnostic envelopes are not timers. First-attempt wins include different lawful entry ranks/HP/permanent growth, not one uniform “ordinary” build. Faster wins and weak-build outliers remain. Death durations are excluded from win medians and retained separately; a short fatal attempt is never a fast clear. Full per-source attribution, entry builds, outliers and all failures: [JSON](telemetry/audit12-implementation/final-balance.json). Baseline10 lacks boss hit/source metadata, so its whole-run damage is not claimed as boss damage.

## Access/power cases

| Band | Cases | Wins | Deaths | Timeouts |
|---|---:|---:|---:|---:|
| injured-earned | 20 | 16 | 4 | 0 |
| ordinary-earned | 20 | 20 | 0 | 0 |
| strong-replay | 20 | 18 | 2 | 0 |
| base-speed-control | 20 | 20 | 0 | 0 |

“Injured”/“ordinary” select real pre-level permanent histories; run equipment/HP at the later boss entry is earned again, not forced to match the source sample. Strong replay uses the real post30 permanent state and reacquires run ranks normally. Base-speed control explicitly normalizes permanent movement and Shoes speed only; it is a supplied access counterfactual, never ordinary earned-power proof. Both close and ranged actual choice policies remain. No-contact intervals measure this controller’s decisions; by themselves they do not prove a recovery is unreachable.

## Weak-entry starter and useful evolution follow-ups

A separate legitimately earned through5 character with unspent attributes/perks was tested on L5 replay and first6, four real seed bases. Original Canister won0/8 under the common controller and1/8 with explicitly declared3.4m spacing. Candidate12-identical global tuning improves4/8 and6/8 respectively, with all losses retained. Knife/Nailgun each won8/8 in the original comparable cases. These are selected controller cases, not population win rates or an assertion that all three starters are equally forgiving. [Full matrix](telemetry/audit12-implementation/canister-viability-summary.json).

On final12 weak-character eligible L1 replay, Canister and Nailgun each win4/4. Knife originally wins3/4; the remaining case times out at full health while its controller chases deliberately saved full-health food. Actual ordinary directional input and a real offered weapon choice exit that same retained state; a separately declared food-aware controller completes the fourth. This is a controller limitation, not a hero movement lock: [proof](telemetry/audit12-implementation/optional-food-controller-proof.json). Neither retry is substituted silently for the original timeout.

All18 useful final12 evolution cases win with actual contribution and at least8s of remaining encounter; [selected runs and provenance](telemetry/audit12-implementation/integrated12-evolution-evidence.json). Car Bomb requires a deliberate first-chest investment strategy and real car context; the many failed known-seed/search cases remain. This is useful reachability, not natural discovery or recipe frequency.

Six final power-case losses remain: four injured (Canister hazard in Bride, ordinary Bloater before Bride, Fisher, Vatman), two strong replay (Bride). No failure contains damage after its defeated boss. First-entry Linekeeper3.9s and long weak Cook71.3s/Ticket retry144.8s remain outside a single ideal envelope; they are not clipped/capped or hidden. Useful recoveries have real contact diagnostics, but bodily weight, exchange meaning and difficulty need human acceptance.

One original numerical output was truncated by disk pressure despite exit0; [retained incomplete copy](telemetry/audit12-implementation/incomplete-ENOSPC-cohorts/retention-index.json). Its fresh identical-command12 rerun reaches30; only that complete replacement is in the final382 attempts. All original attempt/loss data are retained, with no duplicate denominator.

The rendered current12 journey also retains legitimate fast first-entry clears that the small numerical-policy cohort does not sample identically: L4 in6.13s with earned rank5 Nailgun plus rank2 Knife, and L10 in5.48s with earned Nailstorm and Fishing Rod. These are actual fresh-history investments, not supplied strong-replay fixtures. They are not claimed to satisfy meaningful-exchange acceptance merely because other policies take longer. Cook in the same journey takes16.07s, Switchkeeper16.37s, replayed3 Roaster17.95s and Vatman54.0s. Human review must decide whether strong early investment still permits sufficient recognition; no minimum timer or adaptive HP was added to force an answer.

An additional maximum-equipped earned-spending comparison uses36 real public gear upgrades, debiting3600 of13727 actually earned Jeton, leaving10127. All four existing equipped items reach10, with other permanent facts unchanged. Ten bosses×close/ranged policies produce20/20 wins,0 losses,0 timeouts, separately from the final80. [Actual transactions](telemetry/audit12-implementation/integrated12-max-spent-provenance.json), [all outcomes/builds](telemetry/audit12-implementation/integrated12-max-spent-summary.json). This is legal earned power with available purchases; it is not an absolute maximum across infinite farming/all possible gear and perk combinations. Fast wins remain legitimate, no hidden scaling or forced showcase.


## Final14 actual source and quiet26 change

Final14 `ceda328957e8353ebd051a2be8ef5cdae16034000b436b8bc375d81fea4cdff4` has twelve fresh whole campaigns above. Source14 changes L26 arrival pacing through the real service-car aperture; it is not sim-identical12. All other level/boss/weapon rules remain. The80 power cases and18 useful selected evolution cases keep their actual12 hash: they occur on boss levels or13/23/28, where the new L26 condition never executes, with legally retained earned histories. Extra20 maximum-current-equipped earned-purchase cases are likewise separate and applicable; they are not counted into80. Original12 distributions/appended qualifications remain archived byte-for-byte in [source12 archive](telemetry/audit12-implementation/source12-before14/retention-index.json).

A declared same-earned-pre26 rendered comparison observes0 kills before the actual car opening versus96 before12/100 speech-only13, with first frenzy after opening on14. Existing enemies remain live and later normal pressure resumes; no forced pause, invulnerability, kill/XP/reward grant, damage cap or minimum fight timer. [Actual before/speech-only/physical-relief samples](media/R1/audit12-implementation/integrated14-relief-review/index.json). This is a real breathing interval, not player/emotional acceptance.
