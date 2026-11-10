# FINDINGS: English Batch A (505 lines) and the English side of the dialogue

Decision-maker: the agent (the owner delegated all English decisions, 2026-11-10). Record: D-053 (proposed) in `docs/product.md` §17.
Method: each beat was read from its intent and the English bible (`docs/voice-en.md`), not from the Turkish. The Turkish lines were not used as a source.
**All English lines are `draft`.** The agent does not mark its own lines approved; the owner or a native editor does, with
`node prototype/tools/dialogue-import.js --lang=en reviews/dialogue/en-A.csv` (set `verdict` to `keep` or `rewrite`).

## 1. Verdict on the existing English

The English was already written from the beats, in American English, in the bible's voice (understatement, specific details, Mom and food, short
jokes). I kept 489 of 505 Batch A lines (97%). A pass that rewrote everything "to match the Turkish energy" would have been wrong: the two scripts are
meant to differ, and the English audience gets a drier voice on purpose (voice-en §1, §5).

## 2. What I changed in Batch A (16 lines, all within the 60-character bark limit)

| Problem | Lines | Fix |
|---|---|---|
| Instruction piles read like a tutorial | `bloaterSwell#0/#3`, `boss#3`, `ult#1` | Arda talks to himself, one beat per line |
| Addressed to a crowd that isn't there ("Everybody...") | `ev.ambush#0`, `ev.defend#0`, `evend.lootRunner#1` | one person, a small joke where it helps |
| Nonsense or filler | `ult#3` ("Star power! This time I won too."), `mom#3`, `card.medkit#2`, `fk.brute#2` | rewritten from the beat |
| Flat label with no reaction | `bossSlam#3`, `mod#1`, `fk.brute#0`, `fk.spitter#0` | reaction plus a concrete detail |
| Second joke in a 3-line pool that already had one | `evend.blackout#2` | plain line |

## 3. What I changed outside Batch A (55 lines, American English, mechanical)

Found by `node prototype/tools/check-banned.js --verbose` before the pass:
- **Mum → Mom:** 14 call lines (`C05..C90`, `E30b/c`), plus `FINa2`, `FINa4`, `hd02.5#0`, `hd20.2#1`, `evo.forge#2`.
- **queue → line** (`hd06.4#0/#2`, `H06i3a/b`, `H06p4`), **torch → flashlight** (`hd12.2#0/#1/#2`, `H12i1a`, `H12p1`), **flat → apartment** (`FINb2`, `hd20.2#2`),
  **mate → pal / man**, **Brilliant → Great / Perfect / Genius**, **bin → trash can**, **pavement → sidewalk**, **hooting → honking**,
  **colour, neighbour, metre, kilometre, grey → color, neighbor, meter, kilometer, gray**, **lift → hoist** (`H09b`).
- **Over the 90-character slot (3):** `FINa1#0` (164 to 83), `FINa5#0` (96 to 70), `FINb8#0` (120 to 79). The plot facts stay (empty booth, shoes at the door, Zekeriyaköy next door).
- **`FINb3#0` (Dad):** the old line broke Dad's card (narration, "Son,"); it is now a bare fact plus one command.
- **`FINb2#0` (Mom):** "Yes, the apartment's empty. Letter's on the table, sweetheart. Read it." The "Then we'll talk" tail was dropped to fit 90.

## 4. Decisions

1. **American English stays** (owner decision 2026-11-09, voice-en §3). The brief's British default is superseded.
2. **The Turkish exceptions do not apply to English.** Profanity stays at the voice-en §6 tiers; English keeps the guardrails (no real people, brands, regional jokes, religion).
   The English `self` pool stays as plain observations, with no riddles.
3. **No new English jokes to chase the Turkish ones.** The two scripts may differ in tone and in which beats get jokes.
4. **English stays `draft`.** If you want me to approve it, say so explicitly; I won't do it on my own.

## 5. Checks (after the changes)

`test-dialogue.js` PASS (0 over the limit, 0 off-ratio pools, 0 duplicates), `check-ids.js` PASS, banned-list guardrail hits 0, English flags 0.
The one remaining flag is Turkish: `H02i1b#0` "siz de gidin" (the street musician).

## 6. Not done

- English story captions and pops outside the lists above were read but not rewritten; they are in voice. The `H0x` / `L0x` pages for hoods 2 to 20 are still
  first-draft English; review them together with the Turkish ones in Batch B.
- No browser capture at 390×844 in either language yet (BRIEF §7).
