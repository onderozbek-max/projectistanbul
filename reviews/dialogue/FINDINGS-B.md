# FINDINGS: Batch B (hoods H02 to H06, to Sirkeci L30) and the Mom calls

Definition (`prototype/js/dialogue/batches.js`, batch `B`): story pages and pops of H02 to H06, their hood barks (`BK.hd02` to `BK.hd06`), level pops L06 to L20,
**every Mom call (`C05` to `C90`)**, the Sirkeci caption `E30` and the first Kaan meeting `K20`. I put all calls in B because the call voice is shared across
the game and the same problem (the movie cliché) repeats in every call.
175 lines per language. Review sheets: `reviews/dialogue/tr-B.csv`, `reviews/dialogue/en-B.csv` (all `draft`).
Both scripts were written from the beat intent, not from each other. I did not mark anything approved.

## 1. Turkish: 11 lines changed (the rest were already in voice)

The hood barks `hd02` to `hd06` were already reviewed in sweeps 1 and 2, and the H02 to H06 story lines are mostly good (Paşa the cat, the spitter with "tesis yönetimi
tatilde", the cake, the clock). The real problem was the **calls**: Anne said the cliché lines the bible bans ("Seni seviyoruz", "bu son arama olabilir", "Her şey yoluna
girecek", "Baban hep seni düşünüyor"). Anne's love lives inside chores, as in the voice bible.

| Line | Before | After |
|---|---|---|
| C05a | Arda! Yürüyor musun? Beni duyuyor musun? | Arda? Oğlum? Duyuyorsan bir şey söyle. Mont giydin mi? |
| C30a | Arda, bu son arama olabilir. Hat gidiyor, dinle! | Hat gidiyor, dinle. Yemek yedin mi? Hayır deme, kızarım. |
| C30c | …Gel oğlum, dikkatli ol. | …Gel oğlum. Kazağını da al, orası serin. |
| C30e | Seni seviyoruz. Eve gel oğlum... [cızırtı] | Yemek soğumadan gel oğlum... [cızırtı] ...kazak... |
| C70d | …Baban hep seni düşünüyor. | …Baban haritaya bakıp duruyor. Cetveli bırakmadı. |
| C90c | Eve git oğlum. Biz de seni bekliyoruz. | Eve git oğlum. Balkonun ışığını açık bıraktım. (sets up FINa2) |
| C90e | Seni seviyoruz. Her şey yoluna girecek. | Kahvaltıyı ben hazırlarım. Sen sadece gel. |
| H02i1b | …Sonra siz de gidin, olur mu? | …Sonra sen de git, olur mu? (formal plural; this was failing the strict test) |
| H03i3a | Şişkinler gaz tüplerinin yanında… | Dombililer gaz tüplerinin yanında. Biri patlarsa hepsi patlar. (the Dombili naming decision) |
| H04i2a | Yaklaşma! Sen... ısırıldın mı? | Yaklaşma! Ben balık çeviririm, bu iş bana göre değil! ...Isırıldın mı? (Kaan is loud and food-driven) |
| K20b | Adın Arda, değil mi? Ben Kaan. Gerçekten insan mısın? | Sen Arda'sın, değil mi? Ben Kaan, balık-ekmekçiyim! Gerçekten insan mısın?! |

Not touched: your Batch A text, the plot facts (D-048), and every other H02 to H06 line.

## 2. English: 30 lines changed

The English calls had the same cliché ("We love you. Come home", "Everything will be all right", "this might be the last call", "Dad thinks of you all the time"), and
several lines were close translations of the Turkish ones (the checker flagged `C30d`, `C50b`, `C50d`). I rewrote them independently, with different chores:
Mom lists things to do (eat, jacket, keep walking), sends him off with "wash your hands first", says Dede is already complaining, and Dad is "checking the
load-bearing walls". Also: `H04i2a` (Kaan: "I'm a fish-sandwich guy! Don't make me throw a fish!"), `K20b` (Kaan apologizes for asking if he's human),
`H06i2a` and `H06p2` (food comparisons, one Turkish word per line), `bro` → `man` (Arda's register, voice-en §2), `holiday` → `vacation`, `round` → `around`
(5 lines, 4 of them outside B).

## 3. Shared on purpose

`C90c` sets up the balcony light in both languages, because `FINa2` (the caption) says the light is on. The wording is independent.

## 4. Checks

`test-dialogue.js` PASS (strict on A and B), `check-ids.js` PASS, banned-list guardrail hits 0, flags 0, 0 over the limit, 0 duplicates, no translation-pair notes left.
I also fixed the Turkish tier-1 profanity pattern so "ya da" (= "or") no longer counts as the swear "ya" (it was failing a narrator line in the strict test).

## 5. For you

Open `tr-B.csv` and `en-B.csv`; set `verdict` to `keep`, `rewrite` + `replacement`, or `cut`, then
`node prototype/tools/dialogue-import.js --lang=tr reviews/dialogue/tr-B.csv` (and `--lang=en`). The 11 + 30 changed lines are the ones worth your time; the rest
are first drafts you may simply `keep`.

## 6. Not done

- Browser capture at 390×844 in both languages (BRIEF §7). The bubbles for `BK.self` (up to 100 characters) are the most likely to need a look.
- Batch C (H07 to H20 story pages and the finale). The bark pools for those hoods were reviewed in sweeps 1 and 2.

## 7. Imported 2026-11-10 (Turkish Batch B)

- `tr-B.csv`: 175 rows imported. You marked 161 `accept` and 14 `rewrite`. The sheet has no `proposed` column (I re-exported it with the drafts already in place), so I
  treated `accept` as `keep` (approve the current text). The 14 rewrites are all barks `hd02` to `hd06` plus `H02i2a`; all went in as you wrote them.
- `H04i2a` is approved again (your `accept` on my Kaan version).
- `BK.hd05.4#1` ("Kanatlı sıçanlar sizi") uses *sizi* for a flock of pigeons, which the formal-plural check flags. I added a per-line owner exception in
  `ownerExceptions` (it is a plural "you", not formal).
- `test-dialogue.js` PASS, `check-ids.js` PASS.
- `en-B.csv` and `en-A.csv` have no verdicts yet, so all English lines are still `draft`.
