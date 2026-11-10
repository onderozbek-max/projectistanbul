# FINDINGS: tr-A review (502 lines) and what it means for the rest of the dialogue

Source: `reviews/dialogue/tr-A.csv`, completed 2026-11-09.

## 0. Status (2026-11-10, after your answers)

| Done | Detail |
|---|---|
| Imported | 311 keep + 179 rewrite into `js/dialogue/tr/*` (all marked approved). 6 typo fixes applied (açiık, yandi, uğeqşmıştım, varpurlar, heralde, sfıfır). gaçayım, kaptim and the rest left as written. |
| On hold | **12 rows, not imported** (original text still in the game): `reviews/dialogue/tr-A-hold.csv`. 7 over the 60-char limit, `near#3` (siktir), `self#3` and `self#18` (sexual riddles), and 2 duplicates (`fk.diner#2`, `L02m#0`). Each has a proposed alternative; mark `verdict` = `rewrite` plus `replacement` to use yours. |
| Profanity | Street-mild (D-052, proposed in `docs/product.md` §17). Banned-list tiers extended (*göt\*, soktuğ\*, ebeni\*, ananı* in tier 1; elongated *siktir* in tier 2). `ananı` removed from the slur rule. |
| Guardrails | Kept as you decided. 5 lines needed a per-line exception (`ownerExceptions` in `tools/dialogue-banned.json`); the rest (Kılıçdar, Ekrem başkan, İlhan Şeşen, Kadir İnanır, Pikaçu, Wolverine, Skyrim, Mario Kart, Allahım) are not matched by any rule today. New lines still hit the rules. |
| Self pool | `BK.self`: limit 100, exempt from the 15 to 30% joke ratio (`ratio: "exempt"` in `beats-barks.js`). Length limits now come from the beat table, not a fixed 60. |
| Checks | `node tools/test-dialogue.js` PASS, `tools/check-ids.js` PASS, banned-list guardrail hits 0. |
| Sweep sheet | `reviews/dialogue/tr-sweep-1.csv`: 58 proposals out of the 655 unreviewed TR lines (see §5). |
| Import tool | `dialogue-import.js` now accepts `verdict = accept` to take the `proposed` column. |

Not done, deliberately: the 3 EN lines over their limit (`FINa1`, `FINa5`, `FINb8`) and the EN side generally. The EN pass starts when you approve the TR voice.

## 1. Numbers

| | Count |
|---|---|
| Lines reviewed | 502 (171 beats) |
| keep | 311 (62%) |
| rewrite | 191 (38%) |
| cut | 0 |
| Rewrites that were flagged `joke` before | 85 |
| Rewrites over their character limit | 13 |
| Duplicate final texts | 2 pairs |
| Lines not yet reviewed (TR) | 655 in 375 beats (420 are `BK.*` barks, the rest story, calls, comic, finale) |

Rewrites cluster in a few pools: `self` (23 of 24 lines replaced), `evend.*` (about 20), `fk.*` enemy-reaction barks (about 16),
`lvl*` (9), `mom`/`dad` (10, mostly one fix), `hack.*` (14).

## 2. What your edits say about the voice (derived rules)

These are read from the diffs, not invented. Sorted by how often they show up.

1. **Spoken, emotional, a bit loud, not dry.** The original lines lean on understatement ("Elit geliyor. Bu adam pahalı görünüyor.").
   Your rewrites reach for an exclamation or a mutter instead ("Hay ananı dananı! O ney lannn?!", "Yuh artık ama bunlar koşuyor arkadaşşş.",
   "Coştum anam."). Arda reacts in the moment; he doesn't write the caption afterwards.
2. **Stretched vowels and consonants are a feature.** *pöfffff, topuukkkkk, Yürrrüüü, Hassssiktir, pesss, dombilisiiiii, sfıfır sfıfır sfıfır.*
   They read as sound, which suits a bark bubble.
3. **Idiom, proverb and song twisting is the favourite joke device** (matches the brief's *atasözü bozma*):
   "Bir dürümü bin kişi ister bir kişi alır", "Sakla samanı oysun gözünü", "Yorgan gitti görev bitti", "Kime niyet kime kısmet",
   "Ayaklarıma kara sular indi", "Gel de gör ebeninkini", "Yandı gülüm kestaneler", "Yürrrüüü taş arabası".
4. **Internet and street register, not "tidy colloquial":** *kanka, minnoş, manita, heralde, bezevenk, abazan, mikik, ulan, la, yeminimi bozdum.*
   Your keeps are mostly the mild register (*abi, be, ya, lan*), so the two tiers are living side by side.
5. **Arda names his parents the way a person does.** Third person: **annem / babam / anneme**. Direct address stays **Anne / Baba**.
   You fixed this in ~15 lines (`mom#0..#9`, `dad#7`, `low#4`, `card.jacket#0`, `card.medkit#0`, `sig.lost#2`, `O1b#0`, ...). The original
   data was consistently wrong, so the sweep and a lint rule should fix it everywhere.
6. **Cut the explanatory second sentence.** `boss#5` ("...Şimdi sınav." gone), `ev.defend#1` ("Duvar da korkuyor." gone),
   `card.cardoor#2` ("Adil." gone), `i1b#0` (the technique tip gone). When the second beat only labels the joke, drop it.
7. **Add a human, wanting, slightly lonely Arda** (the girl / manita / "güzel bir kız olabilir" lines, "kimsenin haberi yok",
   "Annem... bir mantı açar"). Food and mum stay; "pretty girl" is new.
8. **Self-talk (`BK.self`) became a bad-joke pool.** 23 of 24 lines are now riddles in "X nedir? Y." form (*Mikrodalga, Washington,
   Mario Kart, Skyrim, Vedat Milord, Tartar Ramazan, ...*). Many are well-known circulating Turkish jokes, not Arda-specific.
9. **Plain polish edits**: `Ama` → `Gerçi`, `abi` → `kardeşim`, `Keşke`/`Hala` additions. These are small and not tone shifts.

## 3. Decisions (answered 2026-11-10; kept for the record)

### 3.1 Profanity level (BRIEF §10.1 was still on the default: "none beyond *ya* and bloody")
Your rewrites go beyond that default. Current count in the rewrites:
- **Strong or sexual:** `götüme/götümüzü/Götümden` (`card.nazar#1`, `ev.stampede#1`, `near#0`), `Hassssiktir` (`near#3`),
  `Soktuğumun` (`fk.bloater#2`, `hack.shutter.fail#2`), `ananı dananı` (`elite#3`), `ebeni` (`boss#4`, `evend.defend#1`, `ultr#2`),
  `Ana avrat düz gitmek` (`self#2`), `Mikrodalga` (`self#3`), `Misafirpervert` (`self#18`), `külotlu çorap` (`evend.chest#2`), `ne kodun la` (`zq#6`).
- **Mild (already allowed):** `lan, ulan, be, ya` and the like.

The banned-word checker (`tools/dialogue-banned.json`) has tiers 1 to 3 for this, but its regexes miss elongated or inflected forms
(*Hassssiktir*, *Soktuğumun*, *götümüzü*), so today none of this is caught.

### 3.2 Guardrail conflicts (AGENTS.md + narrative.md Writer Guardrails, BRIEF §4.1.6)
| Rule | Lines in your rewrites |
|---|---|
| Politics / real persons as a joke target | `fk.walker#0` "Kılıçdar gibi"; `barkBlackout#0` "Ekrem basgan nerdesin"; `ev.chest#2` "Seçim zamanı da değil oysa ki"; `self#21` İlhan Şeşen; `self#22` Kadir İnanır |
| Ethnic / regional | `self#8` "Karadenizli"; `fk.screamer#0` "merzifon eşeği" (regional, plus animal) |
| Religion as oath or joke | `obj.fail#2` "Hay allahım"; `callC2#0` "Vallahi"; `hack.tram.fail#1` "cennet"; `card.nazar#1` "Kem gözler götüme" (nazar plus the vulgar tail) |
| Real brands / IP | `lvlC#0` Wolverine; `ultr#2` Pikaçu; `self#8` Skyrim; `self#16` Mario Kart; `fk.crawler#1` "Diego" and `fk.brute#2` "Yarmagül" (I can't tell if these are real references; please confirm) |
| Body-shaming | `evend.blackout#2` "Zombiler... çirkin değiller" (the checker flags it; it is about zombies, so probably fine, but your call) |
| Rating 16+ | the sexual jokes in 3.1 |

`hack.tram.fail#1` and `callC2#0` are probably fine in practice (*cennet* = "paradise" as a figure of speech; *Vallahi* is a very common
filler), but the checker will flag them, so you either allow them in the banned list or I reword them.

### 3.3 The `self` pool as riddles
- 6 of the 23 riddles are over the 60-character bark limit (up to 98). Riddle format needs question and answer in one bubble.
- All 24 lines are jokes. The brief's rule is 15 to 30% jokes per pool and "jokes come from Arda's situation, not random wordplay" (§4.1.5).
- Several are not Arda-specific and several are well-known circulating jokes. If they ship, check they aren't lifted from a single
  source.

Options: (a) keep as a deliberate exception, raise the limit for `BK.self` to ~100 and exempt it from the ratio; (b) keep the best 6 to 8
as a rare "riddle" mini-pool and rewrite the rest as situational self-talk in the same loud voice; (c) revert to the originals.

### 3.4 Deliberate misspellings
`gaçayım`, `kaptim`, `açiık`, `yandi`, `uğeqşmıştım`, `varpurlar`, `heralde`, `sfıfır`. Are these on purpose (typed, "fat finger" comedy)
or accidents to fix? If on purpose, I will not touch them and the lint rule will not flag them.

## 4. Mechanical problems I'll fix on import (no taste involved), once you say go

- **13 lines over 60 characters:** `ev.rescue#2` (70), `ev.stampede#1` (65), `evend.chest#2` (61), `evend.lootRunner#0` (64), `hack.atm.start#1` (61),
  `hd01.1#0` (61), `lvlC#0` (66), `self#2/#4/#15/#18/#21/#22` (67 to 98). I'll propose a trimmed version of each in a new sheet, not apply it.
- **2 duplicate texts:** "Kime niyet kime kısmet." (`fk.diner#2` and `flav.torch#0`), "Bir dürümü bin kişi ister bir kişi alır." (`self#11` and `L02m#0`).
- **Joke flags** stay as exported. 85 of the rewrites were jokes before; after rewriting, some are no longer jokes and some non-jokes became
  jokes. Joke ratio per pool will change; I'll recompute it after import and list the pools outside 15 to 30%.
- The 3rd-person Anne/Baba fix applies to the whole store, not only Batch A (see §5).

## 5. Proposed plan for the remaining 655 TR lines

1. You answer §3.
2. I import the 191 rewrites (+ my approved trims) with `dialogue-import.js`, status stays `draft`.
3. Lint rules, all as `flag` or `review` unless you say otherwise:
   - third-person `Anne|Baba|Dede` + lowercase verb → suggest `annem|babam|dedem`;
   - the §3.2 words as `guardrail` (extend the existing lists: politicians' names, `Pikaçu|Wolverine|Skyrim|Mario`, `Karadenizli`);
   - elongated profanity forms for the tiers (`s+i+k+t+i+r`, `soktuğ`, `götü`);
   - length check on the **replacement** column in the export.
4. I write a **sweep sheet** (`reviews/dialogue/tr-sweep-1.csv`, columns `proposed` and `why` added) for the 655 lines: the same keep/rewrite
   logic you used, **only proposals**; your `keep` lines are never touched, and nothing is applied until you mark it.
   - First pass targets: the 285 `hd02` to `hd20` hood barks (many are place facts with no punch: *"Rüzgâr soğuk. Mont bile yetmiyor."*),
     the `card.*` and `evo.*` barks (they describe the mechanic more than they react), and the `fk.*` enemy barks.
   - I will keep the rule that 15 to 30% of a pool are jokes.
   - Story, call and finale lines get the same treatment but are listed separately because they carry plot.

## 6. Open questions from the previous session (answered)

- **Which phase are we in?** Per BRIEF §8: Phase 3 (Batch A) is done and delivered for review (this file). Phase 4 (Batch B hoods H02 to H06, then
  Batch C H07 to H20 and finale) is next. The bark pools for H02 to H20 already have draft lines; the sweep above is the review of them.
- **"Batch B" mismatch:** the earlier "26 missing card barks" are `BK.card.*` and `BK.evo.*` beats outside `batches.js` Batch A. The brief's Batch B
  is hoods H02 to H06. They overlap only by name; I'll use the brief's definition and list the card and evo barks separately.
- **Other process running?** No background job of mine was running at the time of this check.

## 7. The sweep sheet (`tr-sweep-1.csv`): what it covers and what it doesn't

58 proposals. I only proposed a change where I can name the problem:
- **Third person Anne / Baba / Dede** → annem / babam / dedem (8): `card.molotov#0`, `card.speargun#0/#2`, `hd02.5#0`, `hd20.2#0`, `C15b#0`, `FINa2#0`, `FINb3#0`.
- **Calques from the banned list** (6): *konveyör* (`hd16.2#0`, `H16p2#0`), *enfekte* (`H04i2a#0`, `L18s#0`, `L18m#0`), *kişisel alan* (`H10i2b#0`).
- **Formal plural to himself or a friend** (9): *uyarın, verin, girin, dönün, geçin, durmayın, yaklaşmayın, kapatın, olun*.
- **Duplicates between the bark and story stores** (4): `hd05.3#1`, `hd10.3#0`, `hd12.1#2`, `hd15.4#1`.
- **Over the limit** (2): `FINa1#0` (148/90), `FINb8#0` (123/90).
- **The other 29:** flat place-fact barks that only describe the setting, and `card.*` / `evo.*` / `fk.*` lines that read like a label, rewritten toward your spoken, slightly loud voice.

Not touched: everything that carries plot (calls `C*`, `E30*`, `CMP*`, `K20*`, most `FIN*`, the `L*` and `H*` captions), and lines I'd keep as they are. That is
about 600 lines; if you want a harder pass over them in your register, say which pools (the hood barks `hd02..hd20` are the best candidates, since only
about 1 in 3 reacts instead of describing).

To apply: open `tr-sweep-1.csv`, set `verdict` to `accept` (use my text), `rewrite` + `replacement` (your text), `keep` or `cut`, then run
`node prototype/tools/dialogue-import.js --lang=tr reviews/dialogue/tr-sweep-1.csv`. I will not import it myself.

## 8. Sweep 2 and the hood barks (`tr-sweep-2.csv`, 28 proposals)

I read all 285 hood barks (`hd02` to `hd20`) line by line before proposing anything. They are in better shape than I assumed: most already react
(Arda's doubts, the place gags, the mom/mont callbacks), so a blanket "louder" rewrite would have overwritten good lines. I proposed only what is flat,
ungrammatical or duplicated: 24 hood lines. Sheets 1 and 2 together: 86 proposals, no banned-list hits, no duplicates against the store, all within limits.

**One thing in your Batch A keeps:** `dad#1`, `#4`, `#6`, `#8` still say "Baba" / "Dede" in the third person, while you fixed `dad#7` and the mom pool to
*babam / annem*. I did not touch them (they are your keeps); sheet 2 proposes the one-word fix for each. Same for `hd03.4#1` ("Kibrit yakmayın"), which I
missed in sheet 1.

**New lint rules (`review` level in `tools/dialogue-banned.json`, reported by `check-banned.js`, never failing the tests):**
- `formal-plural-imperative`: *yakmayın, verin, dönün, ...* (15 hits today, several are legitimate shouts, signs or announcements: the editor decides).
- `third-person-parent`: *Anne / Baba / Dede* followed by a word or a suffix (15 hits today, 11 of them fixed by sheets 1 and 2).

**Proposed next, in this order:**
1. You go through `tr-A-hold.csv`, `tr-sweep-1.csv`, `tr-sweep-2.csv` (about 15 minutes; `accept` is one word per row).
2. I import what you marked, rerun the checks, and report joke ratio per pool.
3. Then the English side of Batch A (the EN CSV is `en-A.csv`), written from the beats and the voice rules above, plus the 3 over-limit EN lines.
4. Batch B/C TR (story captions and calls) only after that, because they carry plot and need your eye line by line.

## 9. Imported 2026-11-10 (second round)

- `tr-A-hold.csv`: 12 rows imported (5 accepted, 7 your replacements). You kept `self#3` and `self#18` as written (the two sexual riddles), so D-052 now says so.
  `near#3` took my "Hay ananı!" version.
- `tr-sweep-1.csv`: 58 rows imported (52 accepted, 6 your replacements).
- Checks after import: `test-dialogue.js` PASS (0 duplicates, 0 off-ratio pools, only the 3 EN over-limit lines remain), `check-ids.js` PASS.
- `tr-sweep-2.csv` is still waiting for your verdicts.

## 10. Imported 2026-11-10 (third round)

- `tr-sweep-2.csv`: 28 rows imported (all accepted). `dad#1/#4/#6/#8` now say babam / dedem.
- Checks: `test-dialogue.js` PASS, `check-ids.js` PASS, guardrail hits 0, 0 duplicates. 584 of 1157 TR lines are approved (Batch A plus the sweep rows).
- Remaining lint reports (review level, not failures): 5 formal-plural-imperative and 3 third-person-parent, all in shouts, signs or story lines for the editor.
- Still open: the 3 EN lines over their limit, the whole EN side of Batch A, and the TR story captions and calls.
