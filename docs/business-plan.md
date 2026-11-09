# Project Istanbul: Business Plan

> **Status:** v0.1 · 2026-11-08 · Owner: Onder
> **Owns:** market, platform and launch strategy, monetization model, store catalog and pricing,
> ads policy, KPIs, revenue scenarios, costs, go-to-market, company/legal, business risks.
> **Does not own:** how each system works in-game. That's [game-design.md](game-design.md) §8,
> which was designed **together with** this plan. Strategy context: [product.md](product.md).
> All prices are starting points (USD); all revenue figures are **illustrative assumptions**, not forecasts.

---

## 1. Executive Summary

- **What:** a free-to-play, story-driven survivor-like set in a zombie-overrun Istanbul
  (title proposal: *No Signal: Istanbul*, product.md §1.1). iOS first.
- **Why it can win:** the genre is huge but visually and narratively interchangeable; we
  compete on story, setting, hero animation and game feel. No strong game owns Istanbul.
- **How it makes money:** in-app purchases built into progression (a Monthly Card, a season
  pass, the Bazaar shop, currency packs, boosters, cosmetics) plus rewarded ads.
  **Power is earnable by playing; money buys speed, convenience and style.**
- **How it scales:** content packs per chapter (across Turkey) and per city (*No Signal: Athens*),
  on one engine. An Android port opens Turkey's mass market.
- **Cost to soft launch:** roughly **$8k–25k** in cash beyond the owner's time (§10), released in
  stages behind gates (§13), so money is only spent after evidence.

## 2. Positioning

| | Genre leaders (Survivor.io-style) | **Project Istanbul** |
|---|---|---|
| Setting | Generic | Real Istanbul neighborhoods, food, humor |
| Story | Minimal | Dizi-style drama, squad, cliffhangers, letters |
| Presentation | Functional | Premium hero animation, game feel, motion comics |
| Monetization | Heavy gacha, energy walls | Deterministic purchases, no paid random loot, no energy in the slice |
| Expansion | New chapters | New chapters **and** new cities (franchise format) |

## 3. Market and Audiences

| Segment | Role in the business | Platform reality | Notes |
|---|---|---|---|
| **Turkey** | Volume, word of mouth, cultural proof | Mostly Android (roughly 4 in 5 phones; verify current data); iOS users skew higher-income | Low revenue per user; lira pricing matters |
| **Turkish diaspora** (DE, NL, AT, FR, US) | Higher spend + nostalgia | Strong iOS share | German/English UI, Turkish VO |
| **Global genre fans** (US, UK, EU, KR, JP) | The largest revenue pool | iOS is the top revenue platform in these markets | Story and polish must carry without Turkish context |

**Competitive set:** Survivor.io (Habby), Archero (Habby), Vampire Survivors (mobile),
Brotato (mobile), plus the many survivor-like clones. **Lesson:** the leaders prove demand;
the clones prove that sameness doesn't win.

## 4. Platform and Launch Strategy (D-014)

| Phase | Platform | Markets | Purpose |
|---|---|---|---|
| Playtests (M1–M7) | iOS via TestFlight | Friends, Turkish and global testers | Fun, retention, feel |
| **Soft launch** (after M8) | iOS App Store | **Turkey + Netherlands** (cultural fit + a diaspora/Western-spend signal; both small) | Retention, economy, early monetization signals |
| **Global launch** | iOS | Worldwide | Revenue |
| **Android port** | Android | Turkey first, then worldwide | Turkey's mass market; required before big Turkish user acquisition |

**iOS-specific facts that shape the plan:**
- **App Store Small Business Program:** 15% commission while proceeds stay under $1M/year (otherwise 30%).
- **Apple is the merchant of record** in most regions and handles VAT/sales tax on sales.
- **App Tracking Transparency (ATT):** most users decline tracking, which lowers ad revenue and
  makes paid user acquisition harder to measure. One more reason to lean on IAP + organic growth.
- **Regional pricing:** Apple auto-equalizes prices per country; review Turkish lira prices by hand.

## 5. Monetization Model (designed into the game)

### 5.1 Principles (binding)
1. **Earnable power.** Anything that affects strength (hero levels, skills, mastery, gear) can be
   earned by playing. Money accelerates within **power caps** tied to chapter progress (game-design.md §8.15).
2. **Deterministic purchases.** Players always see exactly what they buy. **No paid random loot.**
3. **The story is never paywalled.** Chapters are free; the community gate (product.md §6) applies to everyone.
4. **Ads are opt-in.** Rewarded ads only; **no interstitials or banners in v1**.
5. **Respectful offers.** Max one pop-up offer per session, never mid-run or mid-story, no fake
   countdowns (game-design.md §8.14).
6. **Fair pace:** no spend level progresses more than **2× faster** than a non-payer (§8 KPI).

### 5.2 System-by-system monetization map
| Game system (game-design.md) | Player value | Monetization hook | Free path | Phase |
|---|---|---|---|---|
| Hero levels (§8.2) | More HP and damage | Jeton packs | Level clears, drops | Slice |
| **Survival Skills** (§8.3) | Build identity per hero | **Skill Credit bundles** (weekly cap 2) | +2 per hero level, star chests, bosses, pass | Slice |
| **Workshop mastery** (§8.4) | Permanent weapon power-ups + perks | **Hurda + Jeton packs** | Clears, star chests, pass | Slice |
| Gear + merge (§8.6) | Stats, merge goals | Bazaar Altın slots | First clears, star chests, Bazaar Jeton slots | Slice / SL |
| Pre-run boosters (§8.5) | Easier runs, impulse help | Altın (or Jeton) | Daily tasks, pass free track | SL |
| Revives / rerolls (§8.13) | Save a run | Altın **or** rewarded ad | Rewarded ads | Slice (stub) |
| Bazaar (§8.9) | Daily deals, chosen gear | Altın slots, Altın refreshes | Jeton slots, 1 ad refresh/day | SL |
| **Road Pass** (§8.10) | Season goals, exclusive outfit/cat | Premium track; tier skips | Free track | SL |
| **Monthly Card** (§8.11) | Daily Altın, **no-watch ad rewards**, +1 Bazaar slot | Subscription-like 30-day purchase | n/a (convenience) | SL |
| Cosmetics (§8.12) | Style, cats | Direct purchase or Altın | Pass and events (some) | SL |
| Offers (§8.14) | Good-value bundles at the right moment | Starter, District, Boss Helper, Squad Welcome | n/a | SL |

### 5.3 The spender ladder
| Player type | Typical share | What they buy | Design goal |
|---|---|---|---|
| Non-payers | ~96–98% | Watch rewarded ads | Fun and fair; they create word of mouth and ad revenue |
| First-time buyers | ~1–2% | **Starter Pack ($0.99)** | Make the first purchase a no-brainer |
| Regulars | ~1–2% | **Monthly Card + Road Pass** | Steady recurring revenue; the core of the business |
| Big spenders | < 0.5% | Altın packs, bundles, cosmetics | Value without pay-to-skip (power caps) |

**Target revenue mix:** IAP ~75–85%, rewarded ads ~15–25% (no interstitials keeps the ad share modest).

## 6. Store Catalog and Pricing (starting points, USD)

**Premium currency (Altın):** bigger packs give more bonus.
| SKU | Price | Altın | Bonus vs base |
|---|---|---|---|
| `altin_60` | $0.99 | 60 | base |
| `altin_330` | $4.99 | 330 | +10% |
| `altin_700` | $9.99 | 700 | +17% |
| `altin_1500` | $19.99 | 1,500 | +25% |
| `altin_4000` | $49.99 | 4,000 | +33% |
| `altin_8500` | $99.99 | 8,500 | +42% |

**Recurring and bundles:**
| SKU | Price | Contents (summary) |
|---|---|---|
| `starter_pack` | $0.99 | 100 Altın, 2,000 Jeton, an Uncommon gear item, 3× Head Start (once per account, 72 h) |
| `monthly_card` | $4.99 | 300 Altın instantly + 50 Altın/day for 30 days, no-watch ad rewards, +1 Bazaar slot, +1 reroll per run |
| `road_pass` | $7.99 / season | Premium track (outfit, cat skin, Epic gear of choice, Altın, Skill Credits) |
| `road_pass_deluxe` | $14.99 / season | Premium track + 10 tier skips + extra cosmetic |
| `district_pack` | $4.99 | Jeton, Hurda, Skill Credits, a district-themed outfit |
| `boss_helper` | $1.99 | 2× Ayran Flask, 2× Extra Reroll, Hurda |
| `squad_welcome` | $9.99 | Kaan outfit, Skill Credits, Workshop materials, Altın |
| `skill_bundle` | $2.99 | 15 Skill Credits (**max 2 per week**) |
| Cosmetics | $1.99–4.99 | Hero outfits, weapon skins, cat companions (also sold for Altın) |

**Altın sinks (reference prices):** revive 20 · Ayran Flask 15 · Head Start 10 · Extra Reroll 5 ·
Bazaar refresh 20 · skill respec 50 · pass tier skip 60.
**Turkey:** start from Apple's equalized TRY prices, then test lower price points for Starter
Pack and Monthly Card in the Turkish soft launch.

## 7. Advertising Policy

- **Rewarded ads only** (placements and caps: game-design.md §8.13); global cap 15 per day.
- **No interstitials, no banners in v1.** Revisit only with an A/B test in soft launch and a
  decision-log entry.
- Mediation (e.g., AppLovin MAX or AdMob) added in M8; ATT prompt shown after the player
  finishes Level 3 (context first), never at first launch.
- Monthly Card holders never need to watch ads; that's part of the card's value.

## 8. KPIs and Targets

| KPI | Soft-launch target | Notes |
|---|---|---|
| D1 / D7 / D30 retention | ≥ 40% / ≥ 15% / ≥ 6% | product.md §12 |
| Payer conversion (by D30) | 2–4% | Starter Pack is the main lever |
| Monthly Card attach (of payers) | ≥ 30% | The health of recurring revenue |
| Road Pass premium (of active players) | 3–6% | |
| Rewarded ads per DAU | 2–4 | Too high = the economy is too tight |
| ARPDAU (iOS, blended) | $0.08–0.20 | Wide on purpose; Turkey low, West high |
| ARPPU (monthly) | $10–25 | |
| LTV (D90) vs CPI | LTV ≥ 1.3× CPI before scaling paid UA | |
| Pace fairness | Monthly Card players 25–30% faster; no tier > 2× | game-design.md §8.16 |
| Economy | Weekly sink/faucet review per currency | `currency_flow` telemetry |

## 9. Revenue Scenarios (illustrative, month 12 after global iOS launch)

| Scenario | DAU | ARPDAU | Gross / month | Apple fee | Net to developer / month |
|---|---|---|---|---|---|
| Conservative | 5,000 | $0.08 | ~$12,000 | 15% | ~$10,200 |
| Base | 25,000 | $0.12 | ~$90,000 | 15% (until $1M/yr) | ~$76,500 |
| Upside | 100,000 | $0.18 | ~$540,000 | 15% → 30% after $1M/yr | ~$380,000–460,000 |

These depend on retention and on user acquisition, which costs money (§11). Paid UA only scales
when LTV beats CPI; otherwise growth stays organic and the conservative row is the realistic one.
Recompute this table with real soft-launch data.

## 10. Costs (first ~12 months, cash; excluding the owner's time)

| Item | Estimate |
|---|---|
| AI coding tools / model subscriptions | $150–400 / month |
| AI art and audio tools (style model, image, music, SFX) | $50–200 / month |
| Spine (2D animation) license | One-time, tens to a few hundred USD |
| Low reference test device (used iPhone 11 / SE 2nd gen) | $150–250 |
| Turkish voice actors (slice key scenes) | $1,000–3,000 |
| Music (licensing or a composer for main themes) | $1,000–5,000 |
| Playtest incentives | $300–1,000 |
| Demand test (week 10–12) | $100–300 |
| Soft-launch user acquisition | $3,000–10,000 |
| Trademark filings + legal/accounting setup | $1,500–4,000 |
| **Total to soft launch (approx.)** | **$8,000–25,000** |

## 11. Go-to-Market

1. **Build in public** from M1: TikTok/Reels devlog in Turkish and English ("I'm making a zombie
   game set in Istanbul": the knife scene is the hook).
2. **Turkish gaming creators** (YouTube/TikTok/Twitch): early access builds in M7.
3. **Community:** a Discord from the demand test onward; testers become ambassadors.
4. **App Store Optimization:** title + city, subtitle with genre keywords, Turkish and English
   screenshots showing landmarks and humor.
5. **PR angle:** "the first game to put Istanbul through a zombie apocalypse"; diaspora media in Germany.
6. **Publisher option:** after the demand test or soft launch, pitch Istanbul publishers
   (e.g., Rollic, Supersonic) to fund UA (product.md §14).
7. **Paid UA** only when LTV ≥ 1.3× CPI.

## 12. Company, Legal and Compliance

- **Employer policy and IP:** confirm outside-activity and IP rules before launch (README, Kickoff Step 1).
- **Entity:** set up a company for publishing and liability (e.g., a US LLC if you're US-based);
  publish the app under an **organization** Apple account (requires a D-U-N-S number). Get an accountant's advice.
- **Trademark:** file for the final title (US, EU, Turkey) once D-012 is decided.
- **Privacy:** App Store privacy labels; GDPR (EU), KVKK (Turkey), CCPA/CPRA (California),
  COPPA if under-13s could play (age gate; target 16+ rating). Privacy policy + terms URLs.
- **App Store rules:** all digital goods through Apple IAP; no paid random items (so no odds
  disclosure needed); subscription-like Monthly Card is a non-renewing purchase unless decided otherwise.
- **Gambling:** no casino mechanics; Turkey is strict.
- **AI assets:** commercial-rights check per tool; `art/PROVENANCE.csv`.

## 13. Spending Gates (money follows evidence)

| Gate | When | Evidence required | Unlocks spending on |
|---|---|---|---|
| G0: Engine | M0 (wk 1) | Benchmark passes on the low iPhone | Test device, tools |
| G1: Fun | M1 (wk 3) | Onder + testers want to keep playing | Art pipeline tools |
| G2: Demand | Wk 10–12 | Ad/TikTok tests show strong click-through | VO, music, district production |
| G3: Slice | M7 (wk 20) | PRD §7 metrics met | Legal setup, M8 monetization build |
| G4: Soft launch | After M8 | Retention + early monetization near §8 targets | Global launch, UA budget, Android port |

## 14. Business Risks

| Risk | Mitigation |
|---|---|
| Low spend per user in Turkey | iOS first; diaspora + global audiences; Monthly Card value pricing |
| ATT limits ads and UA measurement | IAP-led model; organic growth; SKAdNetwork |
| Genre saturation | Differentiate on story, setting, polish; don't compete on gacha depth |
| Monetization hurts retention | Principles §5.1; A/B everything in soft launch; power caps |
| Solo bandwidth | AI executor + lead review; strict scope; publisher option |
| Title/trademark conflict | Checks before locking D-012 |
| Platform policy changes | Keep IAP/ads behind interfaces (architecture.md §4.15) |

## 15. Expansion Economics

- **Chapters (Turkey):** each chapter = 100 levels from reusable parts (game-design.md §6) +
  new enemies, bosses and story; new revenue moments (District Packs, pass themes).
- **Cities (*No Signal: Athens* and others):** same engine and systems; new content pack, heroes,
  VO and art. Most code is reused, so each city costs mainly content and marketing.
- **Android:** the single biggest audience unlock for Turkey; plan it right after the iOS soft launch proves out.
