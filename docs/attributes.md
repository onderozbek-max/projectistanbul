# Project Istanbul: Attributes (Character Progression)

> **Status:** v0.1 · 2026-11-08 · Owner: Onder · Decision: **D-033** (Adopted: six attributes and the kill-threshold layer, owner point 5; numbers **Proposed**)
> **Owner's brief (v0.4 playtest):** "we can give each selected player a kill count and depending on a threshold at the end of each level the player might be eligible to increase some attributes… strength, pace, aggression, intelligence (hacking tasks?), charm etc."
> **Related:** [game-design.md](game-design.md) §4 (stats and caps), §8 (meta) · [weapons-skills.md](weapons-skills.md) · [retention.md](retention.md) · [business-plan.md](business-plan.md) §5 (monetization rules)
> **Code:** `prototype/js/config-stats.js` is a **stub** at the time of writing (workstream C). This doc proposes its shape in §9.

---

## 1. The idea in one paragraph

Arda gets better at things he does. Two numbers drive it. **Practice** (learn-by-doing XP per attribute) comes from what the player actually does: melee hits, dashes, hacks, rescues. **Street Cred (SK)** is a currency earned at the end of each level when the run's kill count clears a threshold. A rank goes up only when both are met: enough practice in that attribute, and enough SK to pay for the rank. So playing the way you like matters, and so does how well you did.

Attributes are **not** the main source of power. Mods, mastery, gear and hero levels carry more. Attributes are the build flavour and the utility layer (hacking, charm, pace). See §7.

---

## 2. The six attributes

**v0.6 note:** code max is 20 (`P.CFG.stats.max`). The Ch1 cap of 6 is a design cap, held by the expected progression rate in section 7.5. Code does not enforce it.

| # | Attribute (EN / TR) | Short | What it is in play | Ch1 max rank |
|---|---|---|---|---|
| 1 | **Strength** / Güç | STR | Heavy hits, melee, knockback | 6 |
| 2 | **Pace** / Çeviklik | PACE | Moving, dashing, dodging | 6 |
| 3 | **Aggression** / Öfke | AGG | Crits, kill streaks, frenzy | 6 |
| 4 | **Intelligence** / Zekâ | INT | Hacking tasks (§4). Hacks are the only way to use it. | 6 |
| 5 | **Charm** / Karizma | CHA | Rescues, civilians, vendors (§5) | 6 |
| 6 | **Grit** / Dayanıklılık | GRIT | HP, regen, taking hits and surviving | 6 |

Ranks run **0–10**. The chapter cap limits the max rank:

| Chapter | Max rank per attribute | Why |
|---|---|---|
| 1 (L1–100) | 6 | Keeps Chapter 1 from being solved by stats. Matches the power caps in §7. |
| 2 (L101–200) | 8 | Cap rises with chapter progress (business-plan §5.1). |
| 3 (L201–300) | 10 | Full range. |

Names: TR names are the owner's words. EN names follow the owner's brief. "Aggression" is the EN for Öfke.

---

## 3. How ranks are earned

**v0.6 (D-043):** Street Cred is the only attribute currency. Milestone n is reached at round(450 x n^1.35) lifetime kills (config-stats.js `sc`). Audit A3 (0.6 x median threshold) is not built: the milestones are lifetime, not per level. Training XP for each READY point is round(60 x (L+1)^1.25) (config-stats.js `need`).

Two gates. **Both** must be open to buy a rank.

| Gate | Source | Rule |
|---|---|---|
| **Practice** | Learn-by-doing XP, per attribute, lifetime (kept across runs) | Rank *r* needs **100 × r** practice XP in that attribute. Rank 6 needs 600. |
| **Street Cred** | End of each level | Rank *r* costs **r SK**. Rank 1 costs 1, rank 6 costs 6. |

### 3.1 Street Cred (SK): the kill threshold

- Each run counts kills (the sim already tracks `sim.kills`).
- Each level has a **kill threshold T**. T is set from the bot's median kills for that level, times **0.6** (proposal). The bot calibrates it.
- At level end:
  - Kills ≥ T → **+1 SK** (eligible).
  - Boss kill (stage 5) → **+1 SK**. Max 2 SK per level.
- The results screen shows the kill count, the threshold and the SK gained. The player sees the threshold, so there is no hidden math.
- **Design target:** about **100 SK over Chapter 1**. All six attributes at rank 6 cost **126 SK** (6 × 21). The gap is the point: the player has to choose which attributes to max.
- Allocation happens on the results screen after the level. It is never forced in a run.

### 3.2 Practice XP (learn by doing)

| Attribute | Practice source (proposal) |
|---|---|
| STR | 1 XP per 50 melee or heavy damage. +10 per slam that hits 3+ enemies. |
| PACE | 1 XP per 10 m moved in combat (10+ enemies within 6 m). +5 per dash that crosses 3+ enemies. +3 per dodge. |
| AGG | 1 XP per kill inside a combo (streak ≥ 25, gaps ≤ 1.5 s). +10 per frenzy. |
| INT | +10 per hack won. +3 per hack lost (you learn from failing). +5 per shortcut opened. |
| CHA | +20 per civilian rescued. +5 per vendor visit. |
| GRIT | 1 XP per 10 damage taken and survived. +20 each time HP drops below 20% and recovers. |

**Expected pace (to verify with the bot):** 600 XP is about 6 focused runs for one attribute. A player who mixes styles fills all six slowly. That is intended: the first build takes a few hours.

### 3.3 Respec

- Free respec **once per chapter**. Afterwards no respec in that chapter.
- No respec is sold for money. (Business-plan §5.1: money may speed things up, not change the rules.)

---

## 4. Intelligence and hacking (D-034)

Intelligence is Arda's role: he is the hacker and mechanic (narrative.md). The owner asked how INT should matter. Hacking is the answer.

### 4.1 The terminals

| Terminal | Tier (INT rank to unlock) | Success | Failure | Story role |
|---|---|---|---|---|
| **ATM** (coins) | 1 | Spits coins: +25 run coins, plus a small XP drop | Alarm: 6 walkers spawn within 8 m | Money on the run. Dad's "civil engineer" side. |
| **Traffic light** | 1 | All zombies within 6 m stop for 2 s (stun) | No effect | Street fighting. |
| **Car alarm** | 1 | Lure: every zombie within 12 m walks to the car for 6 s | The car stays quiet (no effect) | The kite tool. |
| **Cell booster** | 2 | **Signal back for 20 s.** Mom's call plays (a phone beat, not a power) and gives one hint for the next stage | No call | The only way to talk to Mom mid-run. A payoff for the no-signal story. |
| **Shutter shortcut** | 2 | The hold shutter opens 20 s early (skip the hold's tail) | The shutter stays shut for the normal hold | Trade-off: less XP, less time under pressure. |
| **Tram crush** | 3 | Hacks the tram. It crashes through the horde on the rail lane (one-off spectacle, no livery) | Tram stays put | Set piece in H01 and the Ch2 tram levels. |

Rules:
- Max **one terminal per stage**, max **two per hood** (no hacking spam).
- Never during a boss telegraph peak or the level-up card screen.
- A failed hack costs time, not HP. (The only penalty is the terminal's own failure effect, which is never lethal.)

### 4.2 One-thumb hacking

- Walk to the terminal. A glowing ring appears on the ground. Stand in it for 0.5 s.
- A **hack panel** appears in the top 36% of the screen (DS §5: nothing under the thumb). It is a ring with a sweeping tick and a green band.
- **One tap** when the tick is in the band. Tier 1 uses one tap. Tier 2 uses two taps (second band). Tier 3 uses three.
- INT ranks widen the band by 4% per rank.
- Run keeps going while the panel is open. The ring slows to 0.4× only under **Hack assist** (a setting, §4.4).
- At **INT 6**, one terminal per stage auto-hacks if the player has stood in the ring for 2 s. This is a convenience for the rank, not a free win.
- No tap in the lower 60% of the screen. The joystick stays where it is.

### 4.3 Accessibility for hacking

- **Hack assist** setting: slows the tick to 0.4×, widens the band to 2×, and shows a text cue ("Dokun!") in addition to the ring.
- Every hack has a text label and a sound cue (DS §11 and wow-catalog §5). Colour is never the only cue.
- No flashing in the panel (wow-catalog §6).

### 4.4 Telemetry (add to game-design §10)

`hack_start {terminal, tier, int_rank}`, `hack_result {terminal, success, taps, t_s}`, `attr_xp {attr, source, amount}`, `sk_earned {level, kills, threshold, amount}`, `attr_rank_up {attr, rank, chapter}`.

---

## 5. Charm: rescues, civilians and vendors (D-033)

Charm is Arda's way with people. The brief asked for civilians and prices. There is no shop in a run, so "prices" becomes **vendor deals**: a stall offers a freebie you can take if your charm is high enough. That keeps the local flavour (pazarlık, haggling) with one tap.

| Rank | Effect (proposal) |
|---|---|
| 1 | A rescued civilian (escort objective O6) follows and fights for **10 s** after the rescue. |
| 2 | Vendor stalls (simit, çay) offer a **free pick**: choose 1 of 2 items (a heal, or a card reroll). |
| 3 | Rescued civilians last **+2 s per rank** above 1 (rank 6 = 20 s). |
| 4 | A vendor deal also gives a card reroll. |
| 5 | Rescued civilians drop a simit (+5 HP) when they fall. |
| 6 | Vendors show one free extra card on the level-up screen, once per stage. |

- CHA does **not** copy Ada's *Calm* aura (narrative.md). Calm is a story clue and must stay unique. Keep CHA to people and deals.
- No romance or dialogue choices are gated by CHA in Chapter 1 (narrative: no romance locks in Ch1–3). CHA affects play only.

---

## 6. The other four: effects

| Attribute | Effect per rank (ranks 1–5) | Effect per rank (ranks 6–10, half value) | Ch1 max (rank 6) | Cap (GD §4.4 respected) |
|---|---|---|---|---|
| **STR** | +2% might | +1% might | +11% might, +5% knockback per rank | Might from STR ≤ +15% (Ch3) |
| **PACE** | +1.5% move speed; −4% dash cooldown | +0.75% move; −2% dash cooldown | +8% move, −22% dash cooldown | Move speed bonus total ≤ +100% (GD). Dash cooldown ≥ −30% |
| **AGG** | +1% crit chance; +0.4 s frenzy duration | +0.5% crit; +0.2 s frenzy | +5.5% crit, +2.2 s frenzy | Crit chance ≤ 100% (GD). Frenzy ≤ +4 s |
| **GRIT** | +3% max HP; +0.1 HP/s regen after 4 s without a hit | +1.5% HP; +0.05 HP/s regen | +16.5% HP, +0.55 HP/s regen | Max HP bonus from GRIT ≤ +25%. Regen ≤ 1 HP/s |

- **Diminishing returns:** ranks 6–10 are half value. Rank 10 in Ch3 is still a real choice.
- **INT** and **CHA** have no damage numbers. Their effects are in §4 and §5.

---

## 7. Power budget (balance guardrail)

**Status (2026-11-08):** sections 7.1 to 7.4 are the pre-build proposal. The shipped lever and its bot results are in section 7.5.

This is the table that stops stacking from breaking the game. It uses the numbers the other workstreams are building: mods (A), mastery (A), attributes (C), gear (C), hero levels (GD §8.2).

### 7.1 Meta power (between runs), damage multiplier

| Source | L1 | L30 | L60 | L100 | Rule behind it |
|---|---|---|---|---|---|
| Hero levels (+3% might per level, Ch1 cap L15) | ×1.00 | ×1.45 | ×1.45 | ×1.45 | GD §8.2, §8.15 |
| Weapon mastery (main weapon, ~50% of damage; rank 3 → 5 by L100) | ×1.00 | ×1.06 | ×1.08 | ×1.10 | Mastery is kill-gated, so the average player is at rank 2–3 by L30 (assumption) |
| Weapon forks (A: L3 and L5 forks; 1–3 forked weapons) | ×1.00 | ×1.10 | ×1.15 | ×1.20 | Assumes ~+10% per fork, effective (assumption) |
| Attributes (STR rank 3 → 6, AGG rank 3 → 6) | ×1.00 | ×1.08 | ×1.13 | ×1.14 | §6 numbers, crit counted as expected damage |
| Gear (gloves might; Rare max in Ch1, upgrade lvl 10) | ×1.00 | ×1.10 | ×1.15 | ×1.18 | GD §8.6. Epic waits for Ch2 (GD §8.15) |
| **Meta total** | **×1.00** | **×2.01** | **×2.34** | **×2.57** | |

### 7.2 Run power and the enemy curve

| Row | L1 | L30 | L60 | L100 | Note |
|---|---|---|---|---|---|
| In-run build at run end (cards, evolutions) | ×2.5 | ×2.5 | ×2.5 | ×2.5 | **Assumption.** Resets each run (GD §3). The bot must measure it. |
| **Total power** (meta × in-run) | ×2.5 | ×5.0 | ×5.9 | ×6.4 | |
| Enemy HP, E2 curve (`1 + 0.035k + 0.0009k²`) | ×1.00 | ×2.77 | ×6.20 | ×13.29 | journey §6.2 |
| Enemy HP, hood curve (stage 4; `(1 + 0.08(h−1)) × 1.15`) | ×1.00 | ×1.61 | ×2.16 | ×2.90 | journey §6.2 proposal. Stage 5 is set by boss HP. |
| **Power ÷ enemy HP, E2** | 2.5 | **1.8** | **0.9** | **0.5** | Below 1.0 = the player cannot out-power the enemy |
| **Power ÷ enemy HP, hood** | 2.5 | 3.1 | 2.7 | 2.2 | Far above 1.0 = too easy |

### 7.3 What the table says

1. **The bot's wall at L50–100 is real, not only a bot artifact.** Under E2, power divided by enemy HP falls below 1.0 by about L60. That matches the bot (L75 10%, L100 0%).
2. **The hood curve is too easy with these caps.** Power stays 2–3× enemy HP.
3. **The fair band is a guess.** A starting target of about **1.5–2.0** (power ÷ enemy HP at stage 4) would need enemy HP near **×2.9 at L30, ×3.3 at L60 and ×3.7 at L100**. That is much flatter than E2.
4. **The lever is either the enemy curve or the meta cap.** Either lower enemy HP growth, or raise the meta cap to about **×9 by L100** under E2 (that breaks the Ch1 caps below). The owner and lead decide this in journey §9.6 with these numbers.

**Guardrails (proposal, enforced in config):**

| Stack | Ch1 hard cap |
|---|---|
| Hero levels | L15 (GD §8.2) |
| Weapon mastery | Rank 5 per weapon. Main-weapon bonus ≤ +20%. |
| Weapon forks | Max 2 forked weapons per run at L5. (Forks are behaviour, not raw damage.) |
| Attributes | Rank 6 each (§2). Total numeric power from attributes ≤ ×1.15. |
| Gear | Rare max in Ch1. Upgrade lvl 10. |
| Meta total | ≤ ×2.6 at L100 (the table above). Any change to a row updates the table. |

### 7.5 Shipped power lever (v0.6, D-041)

**Status: PROTO.** Numbers live in `prototype/js/config-power.js` (`P.CFG.power`). The real game (`P.Meta.loadout`) and the bot (`P.Power.expectedLoadout`) read the same functions in `js/meta/meta-power.js`, so the bot tests what a typical player gets. Sections 7.1 to 7.4 are the pre-build proposal and are kept for reference.

**Rules (expected player at level N, from hoods cleared before N's hood):**

| Source | Rule (config key) | Per unit | Cap |
|---|---|---|---|
| Hood rank | +1 per cleared hood (`hoodRank`) | might +1.6%, max HP +1.4%, cooldown -0.4% per rank | 20 |
| Attributes | round(0.3 x hoods cleared) on all six (`expect.attrPerHood`) | one rank = config-stats.js `need` | code 20; Ch1 design cap 6 |
| Gear | 1 + round(0.6 x hoods cleared) on the owned slot items (`expect.gearPerHood`) | meta-data.js ITEMS | gear.maxLevel 10 |
| Mastery | floor(0.2 x hoods cleared) on knife and nailgun (`expect.masteryPerHood`) | 3% damage and -2% cooldown per rank (config-weapons2.js) | 5 |

The real player gets hood rank from stars (`M.snapshot().done`). Attributes, gear and mastery are earned by play, and the expected rule is the bot's stand-in for that.

**Bot table (6 seeds, expected loadout, shipped numbers).** `dmg x` is the meta-only factor (1 + might) / (1 - cooldown). It excludes mastery and in-run power.

| Level | Hood rank | Attr (mean) | Knife mastery | Might | Max HP | Cooldown | dmg x | Clear | No-death |
|---|---|---|---|---|---|---|---|---|---|
| L2 | 0 | 0.0 | 0 | +8% | +8% | 5% | x1.13 | 6/6 | 100% |
| L5 | 0 | 0.0 | 0 | +8% | +8% | 5% | x1.13 | 6/6 | 100% |
| L10 | 1 | 0.0 | 0 | +11% | +11% | 6% | x1.18 | 6/6 | 83% |
| L25 | 4 | 1.0 | 0 | +17% | +14% | 11% | x1.32 | 6/6 | 17% |
| L50 | 9 | 3.0 | 1 | +25% | +28% | 21% | x1.58 | 5/6 | 67% |
| L75 | 14 | 4.0 | 2 | +36% | +39% | 17% | x1.63 | 6/6 | 33% |
| L100 | 19 | 6.0 | 3 | +44% | +48% | 20% | x1.80 | 3/6 | 17% |

Cooldown dips at L75 because a gear slot switches item there (the slot picks its last unlocked item). Check this is intended before the numbers are accepted.

**Guardrails (replace the section 7.4 rows where they differ):** attributes stay at or under rank 6 in the expected model at L100 (the Ch1 cap); mastery at or under rank 5; gear at or under level 10 with Rare max in Ch1. Meta damage at L100 is about x1.8 (meta only), against the proposal's x2.57 meta total. The gap is intentional: the enemies carry the late difficulty (D-042), and the E2 curve is unchanged.

**Enemy growth (not part of the lever):** E2 HP curve unchanged (journey section 6.2). New types kasap, parkur and zehirli, and the hizli, zirhli and patlayan affixes, add the late pressure (journey section 5.0).

**Tuning history (12 seeds, expected loadout):** first pass (might 0.025, HP 0.02, attr 0.4, gear 0.8, mastery 0.25) cleared every level almost always, so it was too strong. Second pass (attr 0.3, gear 0.6, mastery 0.2, might 0.02, HP 0.015, cdr 0.005) cleared L100 at 10/12. Shipped values (might 0.016, HP 0.014, cdr 0.004) plus newGrow 0.1 for the new types gave L25 12/12, L50 11/12, L75 11/12, L100 7/12.

---

## 8. Interaction with the rest of the build

| Attribute | Gear | Mastery | Mods (A) | Passives and evolutions | Notes |
|---|---|---|---|---|---|
| STR | Gloves (might) | Knife, Cleaver, Sledgehammer | Knife arc and slam forks | Work Gloves (+12% might). Knockback stacks with the gloves but is capped. | Melee build |
| PACE | Shoes (speed) | Chain, Cyclone | Dash (Kaçış) forks | Running Shoes (+10% speed). Cap the total. | Kite build |
| AGG | Gloves (crit) | Nail Gun, Nail Storm | Frenzy length | Nazar Charm (crit) | Frenzy build |
| INT | Backpack (pickup, luck) | None (hacks are the build) | None | Magnet (XP vacuum) should also pull ATM coins (assumption: coins are pickups) | Hack build |
| CHA | Jacket (HP) | None (people first) | None | First Aid Kit (heal) fits the simit deal | Friends build |
| GRIT | Jacket (HP) | Extinguisher | None | First Aid Kit, Leather Jacket (armour) | Tank build |

**Overlap check:** CHA and Ada's *Calm* both touch crowds. Keep Calm unique (no CHA copy of it). INT and the Magnet both pull things; the hack is a tap, the Magnet is passive.

---

## 9. Config shape (for workstream C)

`config-stats.js` is a stub. Proposed shape (pure data, no DOM):

```
P.Stats = {
  ids: ['str', 'pace', 'agg', 'int', 'cha', 'grit'],
  chapterCap: { 1: 6, 2: 8, 3: 10 },
  practice: { perRank: 100, sources: { str: [...], pace: [...], ... } },
  streetCred: { costPerRank: 'rank', thresholdFactor: 0.6, bossBonus: 1, maxPerLevel: 2 },
  effects: { str: { perRank: [0.02, 0.01], unit: 'might' }, ... },   // half value after rank 5
  hack: { tiers: { 1: 1, 2: 2, 3: 3 }, unlockRank: { 1: 1, 2: 3, 3: 5 }, bandPerRank: 0.04 },
  charm: { rescueFollowS: { base: 10, perRankAbove1: 2 } },
};
P.Stats.effects(stats) -> { might, moveSpeed, dashCdMul, critChance, frenzyS, maxHpMul, regenHps, ... }
```

Rules for the code:
- No magic numbers in `sim/` (AGENTS). Every number above comes from this data.
- The sim reads attribute ranks as integers. Practice and SK live in the meta layer.
- Save v2 must store `practice` and `rank` per attribute, plus SK balance and the respec flag (retention.md §8).

---

## 10. Telemetry, tests and open items

**Tests to add (when built):** practice gate and SK cost on rank-up; chapter cap enforced; respec once per chapter; hack tier unlock by INT rank; band width scales with rank; effects never exceed §6 caps; `sim/` does not read attribute *names* outside `P.Stats.effects`.

**Open decisions for the owner (also in the audit):**

| # | Decision | Recommendation |
|---|---|---|
| A1 | **Survival Skills tree (GD §8.3) vs attributes.** Both are per-hero builds. | Retire the three-branch Survival Skills tree for Chapter 1. Attributes replace it. Keep the node ideas as attribute perks later. |
| A2 | **Street Cred vs Skill Credits.** GD §8.1 says "four currencies, no more". Attributes add a fifth. Business-plan sells Skill Credit bundles. | Merge: Street Cred *is* the attribute currency and replaces Skill Credits. Keeps four currencies. Sold bundles may speed SK up, but cannot pass the chapter cap. |
| A3 | Kill threshold factor (0.6 × median) | Bot calibrates. |
| A4 | Hack assist default | On for the first hack (first time only), off after. |
| A5 | INT auto-hack at rank 6 | Yes, as a convenience. It costs the hack's reward multiplier. |

**Open items:** the bot does not model meta power yet (AUDIT-4 B-1). Until it does, the numbers in §7 are estimates. Hack panel layout is untested on device.
