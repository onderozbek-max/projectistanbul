# Story density, L1–30 (proposal for owner approval, R1-T7)

Status: **PROPOSED**. No line below is in the game yet. Nothing here adds canon beyond `characters.md` and `narrative.md`
except the small flavour details flagged in §5.

## 1. Why

Chapter 1 has 213 pop moments built from 122 distinct lines, almost all hazard tips. Kaan has 44 beats and no backstory is spoken
(Balat, Fatma Nine, Captain Nuri, "can't swim", the stand). Mila has three lines in 100 levels. `narrative.md` promises banter and
bond beats every 2–4 levels; there are none. The slice (L1–30) is what testers play first, so it comes first.

## 2. Rules

- D-051: **TR is written natively by the owner from the intent column.** The EN drafts are tone references and are written natively too, never translated.
- Limits: pop and story lines 90 characters, self-barks 100. Guardrails and the EN/TR checks apply as always.
- Gameplay hints stay where a mechanic first appears. Only **repeats** are replaced.
- Payoff chain for Mila: self-barks (seed) → L30 Kaan asks "who is she?" → L54 campfire answers (`CMPb`) → L100 knock (`FINb8`).

## 3. Mechanism (for the implementation agent)

- From L21 a hood's pops cycle through four lines (`H05p1..p4`), so a level's start and mid pop repeat across the hood.
  Add a small `BOND` override map in `story-data.js` (`{ level: { start: id, mid: id } }`) that `S.beat` checks before the pool.
- New end page `captain_end` at `PAGE_END[25]`.
- `C30c`/`C30d` edited in place. New lines appended to the `BK.self` pool (batch D).
- Re-check the joke ratio (15–30%) of `BK.self` after the additions; this may need one joke added.

## 4. Beat table

Exchanges use both slots of a level (start = first speaker, mid = second), at levels where **both** slots are repeats today.

| Id | Level slot | Replaces | Speaker | Intent | EN draft (tone reference) |
|---|---|---|---|---|---|
| B22s | L22 start | Arda "Pepper cloud" (repeat) | Arda | Notices Kaan humming | "Is that a ferry horn you're humming?" |
| B22m | L22 mid | Kaan sneeze (repeat) | Kaan | Tell: hums the ferry horn when nervous | "Nerves. It's the 5:40 to Üsküdar. Don't judge me." |
| B24s | L24 start | Arda "Pier's tilting" (repeat) | Arda | Sees Kaan go pale at the pier level | "Kaan, you went pale. The pier again?" |
| B24m | L24 mid | Kaan spice sacks (repeat) | Kaan | Reveal: cannot swim | "I can't swim. The boat never needed me to. Don't tell the pier." |
| B25s | L25 start | Kaan spice sacks (repeat) | Kaan | Recognises the Captain (L25 boss) | "That's Nuri Abi's cap. That's... that's him." |
| B25m | L25 mid | Arda "Pepper cloud" (repeat) | Arda | Backs him up | "Whatever you decide, I've got your back." |
| `captain_end` | end of L25 | new page, 4 panels | Narrator, Kaan, Arda | First emotional beat. Kaan puts the Captain down. Tell: wipes hands on the towel before something sincere | P1 caption "The Captain is down. Kaan's anchor is still in the air." P2 Kaan "First day on the boat he told me: never let the sandwich go cold." P3 Arda "I'm sorry, Kaan." Kaan "Don't be. Just keep walking with me." P4 caption "He wiped his hands on the red towel. Then we walked, and neither of us said a word." |
| B27s | L27 start | Kaan luggage cart (repeat) | Kaan | Aftermath. Grandmother's rule | "Fatma Nine says: eat first, cry later. I skipped the first part." |
| B27m | L27 mid | Arda "Clock's stopped" (repeat) | Arda | Quiet kindness | "Then we find food. And a place for the second part." |
| B28s | L28 start | Arda "Clock's stopped" (repeat) | Arda | Arda's flaw: still texts Mom for everything | "Last week I texted my mom to ask where the iron plug is. I'm twenty." |
| B28m | L28 mid | Kaan "line formed" (repeat) | Kaan | Kaan matches it with a family joke | "I asked my grandmother how to boil water. She still brings it up." |
| B29s | L29 start | Kaan "line formed" (repeat) | Kaan | The dream: his own stand | "If we make it, I open my own stand. Fatma Nine's Fish Sandwich. Sign's half painted." |
| B29m | L29 mid | Arda "Turnstiles" (repeat) | Arda | Commits to getting there | "Then we make it. I'll hold the ladder." |
| C30c | L30 call, line 3 | edit | Mom | Plants Mila (pays off at `FINb8`) | "We're at Dede's in Sarıyer. Come on over. Mila's mom called, too." |
| C30d | L30 call, line 4 | edit | Arda | A beat of surprise, then on | "Mila's mom called you? Is she okay?" |
| B30m | L30 mid | Kaan luggage cart (repeat) | Kaan | Kaan notices the phone checking | "That's the fourth time you've checked your phone. Who is she?" |
| SM1–SM4 | `BK.self` pool | new barks | Arda | Mila seeds, no explanation | SM1 "Typed 'you okay?' to Mila. Deleted it. Typed it again. No signal anyway." SM2 "Mila would have run this whole route by now. Probably twice." SM3 "I gave a girl a scrunchie once. Second place, I said. Worst joke ever." SM4 "Ataköy, two floors up. If she's home. Stop it, Arda." |

Count: 12 exchange pops, 1 Kaan pop, 1 four-panel page (about 6 lines), 2 call edits, 4 barks = **about 25 beats**.
Every mechanic hint keeps its first use (pepper cloud L21m, pier L23m, turnstiles L26s, luggage cart L26m); only repeats are replaced.
Two flavour-only lines disappear completely because every level that carries them is replaced: "The clock's stopped" (L27m/L28s) and "They've formed a line" (L28m/L29s). Say so if you want either kept; I would move it to a different slot.

## 5. Flags for the owner

- Details not in `characters.md`: "5:40 to Üsküdar" (B22m), the grandmother joke about boiling water (B28m). Cut if you do not like them.
- B25s names "Nuri Abi" (canon: Kaptan Nuri). The L25 boss is called "The Captain" elsewhere.
- Art: `captain_end` wants a sad or quiet Kaan. His moods are neutral and scared today (`characters.md` proposes `smirk` and `shy`). It can ship with neutral; it will read better with a new mood.
- `SM3` tells the scrunchie story without saying she kept it. The pay-off ("she still wears it") comes when Mila appears.
- Fixed this session (not part of the 25): `K20b/K20c` (Kaan no longer knows "Arda" before they meet), `H11p4` (Kaan no longer knows Usta). TR proposals are in `reviews/dialogue/tr-proposals-2.csv`.

## 6. Order of work after approval

1. Owner approves, cuts or edits the table.
2. I write the EN lines (final) and an intent sheet for TR (`tr-density-1.csv`); the owner writes the TR natively.
3. Implementation agent adds the `BOND` map, `captain_end` page, call and bark edits. I review.
4. Bot-sim is unaffected (no number changes). Screenshots of the new page at 390x844 in both languages.
5. Then L31–100 (about 30 beats), after the slice play-test.
