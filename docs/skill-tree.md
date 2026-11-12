# Project Istanbul: Cross-Level Skill Tree ("Street Tree")

> **Status:** v0.2 · 2026-11-12 · **Accepted** (D-059 in `product.md` §17; Q1 to Q6 answered, Q7 open) · Task: R1-T5
> **Owner brief (D-054, item 4):** "cross-level skill tree and progression". Design doc first: what persists between levels, costs and currencies, ties to bond meters and the existing Survival Skills, caps, monetization guardrails. Owner approves, then implement and tune with the bot sim.
> **Related:** [attributes.md](attributes.md) · [game-design.md](game-design.md) §7, §8 · [business-plan.md](business-plan.md) §5 · [narrative.md](narrative.md) (bond meters) · wireframe `design/lofi/11-skills.html`
> **Built (all five steps of §8):** `js/config-tree.js`, save v3, the Street Cred spend rule, `js/config-perks.js` and the 24 perk effects, the Yetenekler screen, the Kaan bond (`js/config-bond.js`, the Bond page, Tackle & Stab), and the telemetry events, with their tests.

---

## 1. Summary

- Arda already carries a lot between levels (§2). What is missing is not another stat, it is **choices with names**: things the player picks, remembers and talks about.
- Proposal: a **Street Tree** of perks that hangs off the six attributes. **Rank is the lock, Street Cred is the key.** A perk needs a minimum attribute rank (earned by practice) and costs Street Cred.
- **No new currency.** The four-currency rule (game-design §8.1) holds. Survival Skills stay retired (D-044).
- Money can only buy Street Cred, and perks are locked behind practice-earned ranks. So paying cannot skip the tree (§7).
- **Bond meters** (Arda with Kaan, Mila, Ada) are a separate, play-earned layer that never costs currency and is never sold (§6). In the slice, only Kaan (joins L20, D-045).
- Perks are sidegrades and utility, not flat stats, so the tree adds depth without raising the power budget the bot bands are tuned to (§5).

---

## 2. What persists between levels today (verified in code, 2026-11-12)

One save, `nsi.meta.v2` (`meta/meta-save.js`).

| Layer | What persists | Spend / gate | Source |
|---|---|---|---|
| Jeton | Coins | Clear reward `40 + 6 x level`, first clear x2, loss keeps 50% | `meta-data.js:14-21` |
| Attributes (6) | Rank, practice XP | READY point needs `round(60 x (L+1)^1.25)` training XP, else 1 SC per point. Code max 20, design Ch1 cap 6 (not enforced) | `config-stats.js:14-48, 186-203` |
| Street Cred | Balance | Paid at lifetime kill milestone `n`: `round(450 x n^1.35)` | `config-stats.js:48, 108-120` |
| Gear | 4 slots x 2 items | Upgrade `20 x level`, max level 10, items unlock at L10/25/40/60 | `meta-data.js:22-44` |
| Mastery | Lifetime kills per weapon | Ranks at 300 / 1.5k / 6k / 12k / 20k kills, +3% damage, -2% cooldown | `config-weapons2.js:105-107` |
| Ults and actives | Unlocks | Ults by lifetime kills 0/1.5k/4k/9k; actives by route level | `meta-data.js:199-233` |
| Hood rank | +1 per cleared hood, max 20 | Free | `config-power.js`, `meta-power.js` |
| Achievements, daily, streak | Flags, counters | 27 achievements, 4,730 Jeton total | `meta-collect.js`, `meta-daily.js` |

**Not built:** hero levels, Survival Skills, boosters, Bazaar, Road Pass, Kaan in the sim, and `currency_flow` for coins (Jeton) and for gear, mastery and merge spends.

### 2.1 Docs and code disagree (owner to confirm which wins)

| # | Conflict | My default for this proposal |
|---|---|---|
| a | `business-plan.md` §6 still sells **Skill Credits**; D-043 merged them into Street Cred | Street Cred only |
| b | `business-plan.md:127` sells a **respec for 50 Altın**; `attributes.md` §3.3 says no respec is sold for money | No paid respec (the stricter rule) |
| c | `11-skills.html` says Kaan joins at **L30**; D-045 says **L20** | L20 (**owner confirmed 2026-11-12**; `game-design.md` squad-welcome row fixed; the wireframe no longer says L30) |
| d | `attributes.md` §3 says rank needs practice **and** SK; code lets SC alone buy a point when no READY point exists | Open question Q1 |
| e | `attributes.md` §6 says GRIT is +3% HP/rank with half value after rank 5; code is 1.5% per point, no halving | Code wins until the owner says otherwise |
| f | `attributes.md:62` targets about 100 SK in Ch1; the code curve gives about **32** at 50k lifetime kills (see §4.3) | Plan on the code curve |
| g | `10-workshop.html` shows mastery 0-10 bought with Jeton; game-design §8.4 and code say 0-5, kill-based | Code and §8.4 win |
| h | `content-catalog.md` L30 is a story fight against Kaan that ends with "Kaan joins" (and `hero_kaan` is "Slice (L30)"); with the join at L20 (c), what is L30? | **Parked until the T7 story-density review (owner, 2026-11-12):** the code joins him after L20 (the `kaan_join` page); the L30 fight text is not changed |

---

## 3. Problem

1. The long arc is invisible. Attributes move slowly and show only as small numbers; nothing says "this is *my* Arda".
2. The old Survival Skills tree was the one place with named, chosen powers. D-044 retired it for Ch1 because it duplicated attributes and added a second currency.
3. The owner wants a longer, more immersive game. A tree is the standard answer, but it must not (a) add a currency, (b) double-count attribute power, (c) sell power.

Design response: **fold the tree into the attribute system instead of beside it.**

---

## 4. The Street Tree

### 4.1 Shape

- **Six branches**, one per attribute: STR, PACE, AGG, INT, CHA, GRIT.
- **Four perk nodes per branch** in Ch1, at attribute rank **1, 2, 4, 6** (the Ch1 cap). Ch2 adds a fifth node at rank 8, Ch3 a sixth at rank 10 (the caps in `attributes.md` §2).
- Each node has **one rank**. No 1-3 rank stacking: fewer numbers to balance, and each pick is a clear yes/no.
- Cost in Street Cred: **1, 2, 3, 4** for tiers 1 to 4. A full branch costs 10 SC; the whole Ch1 tree costs **60 SC**.
- Learned perks persist across levels and runs. A run does not have to "pick" them; they are always on.

### 4.2 Perk rules (the guardrail that keeps balance)

1. A perk is a **utility or sidegrade**: a new behavior, a counter, a convenience. Not a flat stat.
2. If a perk has a number, it is **at most half of one attribute rank** of the same stat (e.g. STR rank is +2% might, so a STR perk grants at most +1% might).
3. No perk raises damage, HP, or crit beyond what the attribute caps in `attributes.md` §6-7 already allow.
4. No perk replaces a paid product. In particular, **no revive or second-life perk** (the revive is sold for Altın). The old Survival Skills capstone "Second Wind" is **dropped** for this reason.
5. Every perk has an icon **and** a text label. Color is never the only cue.

### 4.3 The 24 perks (built in step 2; names are placeholders, TR names are the owner's)

Effects are as built and tested (`js/config-perks.js` holds every number; the hooks are listed in `reviews/REVIEW-R1.md`). The first
placeholder list was written from the docs; the code disagreed in several places (frenzy starts at a 60-kill streak, not 25; a hack takes
6 s; the medkit regen delay is already 3 s; there are no vendors, no vaulting and no low-HP state), so the owner approved the changes below
(2026-11-12: Rule 2 covers percent stat bonuses only; accept the swaps; code wins over the docs).

| Branch | T1 (rank 1, 1 SC) | T2 (rank 2, 2 SC) | T3 (rank 4, 3 SC) | T4 (rank 6, 4 SC) |
|---|---|---|---|---|
| STR | Heavy Hands: heavy-weapon hits shove the target 1 m extra | Cart Shover: canister and env blasts also shove enemies just outside the blast | Shockwave: every 8th heavy hit sends an instant shove ring | Wall Breaker: heavy hits stun armored enemies 0.5 s |
| PACE | Quick Feet: a dash clears any tea or puddle slow | Slipstream: a dash through 3+ enemies refunds 25% of its cooldown | Parkour: puddles and tea never slow you | Dolmus Rider: the first dash each stage has no cooldown |
| AGG | Hot Streak: frenzy starts at a 50-kill streak instead of 60 | Blood Rush: boss hits extend frenzy 0.5 s (max +4 s) | Finisher: crit kills slow enemies within 1.5 m | Last Laugh: when frenzy ends, a shove ring goes off |
| INT | Quick Fingers: your hacks are quiet (no noise wave) | Second Look: the first failed hack per run keeps its progress | Signal Boost: a cell booster marks the next terminal for 10 s | Backdoor: traffic-light stun and tram crush lane length +50% |
| CHA | Good Name: rescue hold 2.5 s to 2.0 s | Friendly Faces: escort contact HP time 4 s to 5 s | Regular: +1 free card reroll per run | Neighbourhood: every rescue brings a 10 s helper (gated rescues keep 20 s) |
| GRIT | Thick Skin: the first contact hit per run stuns the attacker 0.5 s | Tea Break: medkit regen delay 3 s to 2 s | Iron Stomach: simit heals +5 HP | Stubborn: at 20% HP or less, healing drops are pulled to you from 5 m (never a revive) |

### 4.4 Street Cred budget

Street Cred is the only tree currency, so the math is short:

- Milestone `n` arrives at `450 x n^1.35` lifetime kills. At **50,000 kills** (about 100 clears at about 500 kills each, **assumption: the bot measures the real figure**), `n` is about **32**.
- The Ch1 tree costs **60 SC**. A median player fills **about half** of it by L100. That is the point: the player picks a build.
- Rule change this needs (**Q1**): today SC also buys attribute points when no READY point exists. If both draw on the same SC, perks and ranks compete. Recommended: **SC buys perks only; attribute ranks come only from practice (READY points).** This also makes the `attributes.md` §3 "two gates" true again.
- Respec: **free once per chapter**, never sold (attributes.md §3.3). A respec refunds all SC spent on perks.

---

## 5. Caps and power budget

| Cap | Rule | Where it comes from |
|---|---|---|
| Chapter cap | Attribute rank cap per chapter limits the deepest perk: Ch1 tier 4, Ch2 tier 5, Ch3 tier 6 | attributes.md §2 |
| Per-perk magnitude | At most half of one attribute rank of that stat | §4.2 rule 2 |
| Branch ceilings | Stay under the attribute ceilings (might +15%, GRIT HP +25%, regen 1 HP/s, crit 100%, move +100%) | attributes.md §6, game-design §4.4 |
| Bot bands | L1-30 first-attempt win rates stay in game-design §7 bands (L1-4 at least 95%, L10 about 70%, L20 about 65%, L30 about 60%) | game-design §7 |
| Pace | A non-payer reaches L30 in 7-10 days; no tier more than 2x faster | game-design §8.16 |

The tree reallocates a little power into choice; it does not add a second power ladder. Implementation must feed it into `P.Power.expectedLoadout` so the bot sees it (the bot ignores `meta-save.js`).

---

## 6. Bond meters (separate layer)

From narrative.md: three bond meters, Arda with Kaan, Mila and Ada, raised by dialogue choices, fighting side by side, and gifts. They unlock combo ultimates (Kaan: *Tackle & Stab*, Mila: *Scooter Drift*, Ada: *Silent Shot*). No romance locks in Ch1-3.

| Rule | Detail |
|---|---|
| Currency | **None.** Bonds are earned by play only, never bought, never gated by Street Cred |
| Meter | 0 to 100 per companion, saved in `nsi.meta.v3` as `bonds: { kaan, mila, ada }` |
| Thresholds | 25: a small passive aura (**built:** Kaan's Watch, +3% max HP). 50: combo ultimate unlocks (**built:** Tackle & Stab). 75: second aura and 100: bond scene (stubs, shown as "a later chapter") |
| Earned by | **Built (slice):** the L20 clear (join, +5), each first clear after it (+4, +1 for 3 stars, +2 for a boss level), a repeat clear (+1). All numbers in `config-bond.js`. **Not built:** kills while the companion is near (there is no Kaan body in the sim yet), dialogue choices (the prototype has none), gifts |
| Slice scope | **Kaan only**, from L20 (D-045). Mila and Ada show as locked teasers |
| Tree link | The "Bond" page of the tree shows the companion perks next to the attribute branches. Combo ultimates are drawn from the same ult slot as today's ults, so they add choice, not a second kit |
| Paywall | Never. Business-plan §5.1: story is never paywalled |

Because the narrative doc places Kaan's *branch* at L251-280 (Ch3), only the meter and its first two thresholds are in scope for the slice. Later thresholds are stubs.

---

## 7. Monetization guardrails (binding, business-plan §5.1)

- **Earnable power.** Every perk is earnable by a non-payer through play. No perk, node or branch is exclusive to payers.
- **Rank is the lock.** Paid Street Cred bundles (max 2 per week, capped by the chapter, attributes.md A2) buy only the key. The lock, an attribute rank, is practice-gated. Money cannot skip it.
- **Deterministic.** No random perks, no gacha, no timer on perks, no fake countdown.
- **No paid respec.** One free respec per chapter; no other.
- **No revive perk** (§4.2 rule 4).
- **Story and bonds are never sold** (§6).
- **No pressure on the screen.** The tree screen shows no store link, no offer, no timer.
- **Telemetry** (game-design §10): add `perk_learned`, `perk_respec`, and `bond_threshold`, and fill in the missing `meta_upgrade` and `currency_flow` events, so the 2x pace check in §8.16 can be measured.

---

## 8. Implementation plan (after approval)

| Step | What | Check |
|---|---|---|
| 1 | `config-tree.js` (6 x 4 nodes, gates, costs). Save migration `v2` to `v3` (`tree.learned`, `bonds`). SC spend rule per Q1 | New `tools/test-tree.js`: costs, gates, respec refund, migration; `test-meta` still passes |
| 2 | Perk effects in the sim, each behind its Def; fold into `P.Power.expectedLoadout` | `test-ceiling`, `test-enemy-behaviors`; bot sim L1-30 vs §7 bands |
| 3 | Tree screen from the wireframe, in both languages | Screenshots at 390x844 in EN and TR; no hardcoded strings |
| 4 | Bond meter for Kaan, from L20 | Dialogue tests pass; one combo ult screenshot (**done**, `test-bond.js`) |
| 5 | Telemetry events | Event dump from a bot run (**done:** `node tools/bot.js --campaign=30`, sample in `reviews/telemetry-R1-T5-campaign.jsonl`; `test-tel.js`) |

Each step ends with a packet section in `reviews/REVIEW-R1.md` and waits for feedback.

Files stay at or under 600 lines; perk effects go in their own file, not into `config-stats.js`.

---

## 9. Questions for the owner

**Answered 2026-11-12 (owner accepted the recommendations):** Q1 perks only, Q2 free respec once per chapter and never sold, Q3 six branches of four, Q5 Survival Skills stay retired, Q6 Kaan only in the slice. **Q4 answered 2026-11-12:** the 24-perk list with the owner's TR names and descriptions, in `reviews/PERK-TEXT-R1-T5.md`. **Still open:** Q7.

1. **Q1: Street Cred spend rule.** Perks only (recommended), or perks and attribute points share SC as they do today?
2. **Q2: Respec.** Free once per chapter and never sold (recommended, matches attributes.md), or keep the 50 Altın respec from business-plan?
3. **Q3: Tree shape.** Six branches of four nodes, one rank each (recommended), or the old three branches (Offense, Defense, Utility) with ranks 1-3?
4. **Q4: Perk list.** *Answered:* approved (5 rows rewritten by the owner, the rest ok). Text lives in `reviews/PERK-TEXT-R1-T5.md`; the Dash is **Depar** in TR.
5. **Q5: Survival Skills.** Confirm the name stays retired and `11-skills.html` is repurposed as the Street Tree screen.
6. **Q6: Bonds.** Kaan only in the slice, with the combo ultimate at bond 50?
7. **Q7: Docs to fix.** Should I correct the seven conflicts in §2.1 once you pick a side?
