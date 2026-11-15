# Comic screens and cutscene dialogue: patch to the dialogue phase

Scope: all 27 comic pages (84 panels), the 6 Mom calls, and the cold-open and tutorial beats
(`s2/s3/s4`, `rule1-3`, `pardon`, `callA-D`, `O1a-e`, `exit1/2`, `L01-L05` pops).
Method: every page read in EN and TR in panel order against `journey.md`, `characters.md` and the
neighbouring beats. Anything not listed below was read and kept.

## Applied in EN (19 beats, imported with `ok:1`, all dialogue checks green)

| # | Beat | Problem | Fix |
|---|------|---------|-----|
| 1 | `H01i1b` | Cook's "Don't strangle it / pay me Friday" (EN) vs "Afiyet olsun" (TR): unclear what is handed over | Knife handover: "bring it back clean" |
| 2 | `H01i3a` | Said rule two is returning the knife, which clashes with rule 2 "never get bitten" | "Rule two: no bites. And Usta wants his knife back clean." |
| 3 | `H01i3b` | 17 km stated here and again in `O1e` | Number dropped here |
| 4 | `H02i1b` | Musician "My last tune. Then you go too" read as a threat | "Let me finish this song. Then the stairs are all yours." |
| 5 | `H02i3a` | Tour guide was unexplained | Guide still giving the tour, one zombie nodding along |
| 6 | `H03i2b` | "following us" while Arda is alone until L20 | "following me" |
| 7 | `H04i2a`, `H04i3a` | Kaan and Arda meet and say "I'm human" here, then meet again at `K20b/c` | Kaan is only heard fighting ("I'll throw a fish!"), Arda reacts. K20 stays the first conversation |
| 8 | `H07i3a` | "Someone got in" while the sign says don't open | Shutter was pried up from outside |
| 9 | `H11i2a` | "Not getting on this time" with no earlier boarding | "I'm not getting on that one" |
| 10 | `H12i2a` | Whose phone? | "Phone on the floor. Last message, yesterday..." |
| 11 | `H17i1a` | A school with a principal and lockers inside a bazaar was unexplained | School cue added. Canon: Arda's old high school inside the arcade (`journey.md` 440-452) |
| 12 | `H19i2b` | Non-sequitur reply to "show me the neighborhood" | Directions plus the stale-bread shield joke |
| 13 | `CMPb` | Mila is first named at L54 with no setup | Who-she-is clause (grew up two floors above, per `characters.md` 84-86) |
| 14 | `C90c/d/e` | Mom is in Sarıyer yet says "go on home". Arda says "I'll be at your door tomorrow" | "Go on up", "two minutes and I'm in my own bed", Dad's letter on the kitchen table (plants `FINb1/b2`) |
| 15 | `C30e` | "Come home" vs "come over to Dede's" | "Come straight to Dede's" |
| 16 | `FINb8` | Mila knows about Sarıyer with no source | "My mother called yours." (first draft "Your mom" tripped the yo-mama guardrail) |

## Turkish proposals for the owner: `reviews/dialogue/tr-comics.csv` (19 rows)

Same beats as above, plus two TR-only items:

- `H18i2a`: "Üç kez geri çekerek" is confusing. Simple free-ice-cream debt version proposed.
- `callC2`: "Vallahi numara yapmıyorum bu defa" is unclear. Replaced with a line about the signal cutting out.

Fill the `verdict` column (`accept` / `rewrite` + `replacement` / `keep`) and tell me when it is done.
Nothing in TR has been changed yet, so TR and EN currently differ on these beats until you rule.

## New canon facts for the owner's nod

1. `CMPb`: Mila grew up two floors above Arda (already in `characters.md`, now said on screen).
2. `C90e`: Dad left a letter on the kitchen table (already planted by the finale beats, now foreshadowed).
3. `H17i1a`: the bazaar school is Arda's old high school (already in `journey.md`).

Corrections (2026-11-10, after owner review):
- `FINb8`: "Zekeriyaköy" was in the ORIGINAL line, not a new fact, and it is canon (Mila's parents' safe house, `narrative.md` 68, 146). My rewrite dropped it and the owner's TR replacement dropped it too. Open question for the owner: restore it?
- `CMPb`: my first EN rewrite ("you know Mila?") broke `CMPc` ("Everyone knows"). EN now mirrors the owner's TR: "Mila and I grew up together. My childhood sweetheart."
- TR: the owner's 19 replacements are imported (typo fixes only: `..`, `içerde`, a trailing comma). `H01i3a` TR still says rule two is "yine kafaya", while `rule2` and `L01s` say "ısırılma": still contradicts.

## Visual audit (54 screenshots, `reviews/media/DIALOGUE/comics/`, taken before the layout fix)

- Kaan screens: `hood_laleli` panel 2 and `hood_atakoysahil` panel 2, EN and TR. Kaan's tail runs through Arda's bubble, and Arda's name tag sits on Kaan's bubble. Fixed in `view/comic-layout.js` (unverified in a browser, see below).
- Systemic: name tags overhang the caption or bubble above by 2-7 px. Fixed by `TAG_UP`.
- `l1_outro` P2/P3, `fin_arrive_a` P3, `fin_arrive_b` P1: Mom, Phone and the map are never drawn, so the tails point at nothing. Art work (R1 T2).
- Text touching the edge: `hood_kapalicarsi` P2 EN, `hood_aksaray` P3 TR, `kaan_join` P2 TR ("BALIK-EKMEKÇİYİM").
- Never drawn: `kaan_join` P4 is empty, `hood_yedikule` has no Key Keeper, the `hood_yenikapi` phone is missing.
- TR-only confusion left for the owner: `O1b` ("Annem gelin beklerken...") and `O1d` (rule three).

## Backlog (not a text fix)

- Mila deserves an earlier mention or missed-message beat before L54. A single line in an earlier call or pop would do.
- `BK.hd18.3#1` mentions Mila in TR only.
- Comic layout bugs in `view/comic-layout.js` (stacked bubbles, tags, tails, SFX) are tracked under R1.
- Changed pages still need before/after screenshots in both languages (`reviews/media/DIALOGUE/`).
