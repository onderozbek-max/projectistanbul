# BRIEF: Dialogue overhaul: two native scripts, one dialogue system (end to end)

**For:** the implementation agent. **From:** lead, 2026-11-09. **Baseline:** prototype v0.7 (`cda14b3`). The build is moving
in parallel (D-049 character bible, D-050 animation pass were added today), so **re-verify every file:line and count in §2 at
the current HEAD before Phase 1**, and report any differences.
**Read with:** `AGENTS.md`, `docs/narrative.md` (Tone, Characters, Writer Guardrails), `docs/hoods-bible.md`,
`docs/story-presentation.md`, `docs/product.md` D-035 / D-036 / D-046 / D-048, `reviews/AUDIT-7-2026-11-08.md` (T0-7, T1-7, T3-8).

---

## 1. Why (owner requirement)
- The game ships in **Turkish and English**. It launches to **Turkish players first**, and must still read well for a global audience.
- The voice is **Shaun of the Dead**: smart, funny, sarcastic, deadpan. **Dialogue is one of the game's main differentiators.**
- Jokes, idioms and slang don't survive translation. So **each language gets its own native script**, written from shared story
  beats, never translated line by line. **The phone's language picks the script** (the player can override it).
- This amends D-035 ("Turkish spine with English gloss"). Record the new decision under the **next free D-number** (D-051 at time
  of writing; D-049 and D-050 are taken). Wording in §9.

## 2. What exists today (facts; verify before you change anything)
Voice text runs through **four stacked mechanisms**, so the truth for any line is unclear:

| Mechanism | Where | Size | Problem |
|---|---|---|---|
| `P.LINES` paired `id: [speaker, TR, EN]` | `story/strings-story.js` (story pages, pops, Mom's calls, captions), `story/strings-barks.js` (legacy barks), `strings.js` (L1) | 262 + 493 + 26 entries | One line per beat in both languages; EN is forced into TR's beat and length |
| `P.LangText[lang][id]` patch layer | `story/story-lang-tr.js`, `story-lang-en.js`, applied by `story/lang-apply.js` | 11 TR, 39 EN | Overwrites P.LINES columns at load; only the "worst" lines were rewritten |
| `P.BarkPools[lang][poolKey]` native pools | `story/strings-barks-tr.js` / `-en.js`, read by `story/barks.js` | 856 TR, 850 EN lines | Good model, but files are about 1,425 lines (over the 600 rule); **missing pools silently fall back to paired P.LINES** (`barks.js:2-3, 95-107`) |
| `P.FinaleLang[lang]` | `story/finale-lang-tr.js` / `-en.js` + `finale-data.js` | 14 + 14 | Native, but a fourth format, and still paired by id |

Also:
- **Card text** mixes the joke and the rules in one string: `desc.torch` = "Mangal için almıştım, işim değişti. Kısa bir alev konisi…" (`strings-weapons2.js:12`).
- **Language selection:** `view/settings.js:9` defaults `lang: 'tr'` for everyone. **The device language is never read.**
- **Turkish casing:** `P.upper` (`strings.js:162`) uses `toLocaleUpperCase('tr-TR')`, and `view/ui.js:44` sets `<html lang>`. **Keep both** (the CSS uppercase rules depend on it).
- **Quality:** TR lines are grammatical but often read as translated. Examples from the native pools:
  - "Konveyör bana yardım ediyor. Zorla ama yardım." (nobody says *konveyör*; it's *yürüyen bant*)
  - "Canlı kablo. Ellemeden önce uyarın beni." (formal plural *uyarın* is wrong for Arda's register; no punchline)
  - "Tramvay yerinden oynamadı. Raylar da yorgun." (a calque, not a joke)

  Weak EN lines exist too: "It's coming at me. Shoes ready?"
- **Godot:** there is no localization system yet, so this design defines the format the port will use.

## 3. Target design

### 3.1 Three classes of text, three rules
| Class | Examples | Rule | Store |
|---|---|---|---|
| **A. UI / system** | buttons, labels, settings, menus, units | Precise translation, consistent terms | `P.STR[lang]` (unchanged) |
| **B. Rules text** | card effects, objective text, tutorial instructions, death-screen tips, stat names | Precise, short, translated from one meaning; **no jokes** | `P.STR[lang]` (split out of the mixed `desc.*` strings) |
| **C. Voice** | every character line: barks, story pages, pops, Mom's calls, captions, finale, card **flavour** lines, hood intro lines, boss lines, death-screen flavour | **Native per language, written from a shared beat. Never translated** | the new dialogue store (§3.2) |

### 3.2 One dialogue store
- **Shared beat table** (`js/dialogue/beats-*.js`, data only). Each beat has:
  - id, trigger or where it is used, speaker(s), panel/slot if it's a comic
  - **intent** (one line: what the moment must do, e.g. "Mom's first call: relief turning into nagging, she mustn't sound scared")
  - mood, and **max characters per language** (TR is usually longer; derive the limit from the slot, not from the other language)
  - joke allowed: yes or no
- **Per-language lines** (`js/dialogue/tr/*.js`, `js/dialogue/en/*.js`, data only): `beatId → [{ spk, t, j, mood? }]`.
  - A beat can have **a different number of variants in each language**. TR can have 6 jokes where EN has 3 straight lines, or the reverse.
  - Comic pages keep a shared **panel structure** (the art is fixed). Each language fills a panel's bubbles independently: same
    speaker and art meaning, its own words, and the bubble count can vary within the panel's limit.
- **One API** (`js/dialogue/dialogue.js`):
  - `P.Dialogue.pool(beatId)` and `P.Dialogue.line(beatId, opts)`: no-repeat-until-exhausted, never the last line, seeded from the
    **view** RNG (dialogue must never touch sim RNG or sim state).
  - Used by `barks.js`, `story-data.js`, `comic*.js`, `finale*.js`, `P.Speech`, call pops, card flavour and death flavour.
- **Delete afterwards:**
  - the paired voice entries in `P.LINES`
  - `P.LangText` and `lang-apply.js`
  - the bark fallback to P.LINES
  - `P.FinaleLang` as a separate format
  - `strings-barks.js` (legacy)

  **A missing beat line is a test failure, never a silent fallback to the other language.**
- **Data-only, JSON-convertible files** (no logic) so the Godot port and the AUDIT-7 T5-1 single source can load the same content.
  Every file ≤ 600 lines; split by category and hood group (e.g. `tr/barks-combat.js`, `tr/barks-hoods-01-05.js`, `tr/story-h01-h05.js`).
- Keep `P.Speech` as the only bubble arbiter, and keep `P.Indoor` rules.

### 3.3 Language selection
- First launch: read `navigator.languages`. Any `tr*` gives **TR**; anything else gives **EN**. Save it as the player's setting.
- Settings override (the existing TR | EN control) switches instantly, including comic pages and open pops.
- The URL `?lang=tr|en` overrides for testing. Document the Godot equivalent (`OS.get_locale_language()`) in `docs/architecture.md`.

## 4. How to write (this matters more than the plumbing)

### 4.1 Process rules
1. **Write each language from the beat's intent, not from the other language.** When writing TR, don't open the EN line, and the
   reverse. If two lines end up as translations of each other, rewrite one of them.
2. **Turkish is the master script** (launch market). Write and polish TR first for each batch, then EN.
3. **English keeps an Istanbul flavour:** natural English with some Turkish words where context makes them clear (abi, çay, simit,
   dolmuş, Anne/"Mum"). It must never read as a tourist phrasebook.
4. Plot, facts and beats don't change. Hood facts are accepted as written (D-048). Places must be plausible (no tram in Samatya;
   AUDIT-7 T1-7).
5. A **joke ratio of about 25% of lines per pool, never over 30%**. Plain lines carry character. Jokes must come from Arda's
   situation, not from random wordplay.
6. **Never punch down.** Guardrails from `docs/narrative.md` and `AGENTS.md`: no state actors; no religion or politics as a target
   (the ezan is ambient only, D-035); no ethnic or regional jokes; no earthquake talk; no body-shaming; no brands; animals never
   harmed; no child zombies; rating 16+.

### 4.2 Voice bibles (write these first; the owner approves them before mass writing)
- `docs/voice-tr.md`, **written in Turkish**, and `docs/voice-en.md`. Each one has:
  - **A character sheet per speaker** (Arda, Anne, Baba, Kaan, Mila, Ada, Ahmet Abi, strangers and shopkeepers, the narrator caption,
    each boss): register, verbal habits, what they'd never say, 3 good example lines, 2 bad ones with the reason.
  - **Comedy devices that work in this language.**
    - TR: deadpan understatement (*soğukkanlı kara mizah*), exaggeration (*abartı*), twisted proverbs and idioms (*atasözü bozma*),
      everyday Istanbul complaints (traffic, rent and the landlord, dolmuş, the neighbour, the kapıcı), mock-formality, self-talk.
    - EN: British understatement and bathos (Shaun of the Dead), dry asides, polite absurdity.
  - **A register guide for Arda in TR:** a 20-year-old Istanbullu student, spoken Istanbul Turkish, *sen* to friends, natural
    colloquial forms where they read well on screen. Profanity level: **owner decision, see §10**.
  - **A banned and translationese list,** checked by tests:
    - TR: *konveyör* → *yürüyen bant*; formal plural to friends; calques of English idioms; dated internet slang; forced English words.
    - EN: Americanisms if British English is chosen (§10); phrasebook Turkish.
  - **Tone references for the writers** (not used in the game): *Shaun of the Dead* (understatement under pressure), *Leyla ile Mecnun*
    (absurd deadpan Turkish comedy), *Avrupa Yakası* (everyday Istanbul banter). Don't quote them and don't name them in the game.

### 4.3 Priority order (polish where players spend their first hour)
- **Batch A, first session:** the cold open, all L1 lines, the first barks of each kind, Mom's first call, the first comic page, the
  L5 boss lines, card flavour for the starter weapons, the death screen. **100% polished in both languages.**
- **Batch B, slice:** hoods H02–H06 (to Sirkeci, L30).
- **Batch C:** H07–H20 and the finale.

## 5. Human review gate
- `tools/dialogue-export.js --lang=tr --batch=A` writes `reviews/dialogue/tr-A.csv` with these columns: id, beat intent, speaker, line,
  joke flag, characters/limit, status, editor note. EN gets its own file. (`barks.js:394` already has a dev audit you can reuse.)
- `tools/dialogue-import.js` applies the editor's verdicts (keep / rewrite with replacement / cut) back into the data files.
- Every line starts as `status: draft`. **The agent never marks its own lines approved.** Only the owner or a native editor does,
  through the import tool. Draft lines still ship in the prototype.

## 6. Automated checks (new `tools/test-dialogue.js`, added to the regression commands)
1. Every beat that a trigger can fire has **≥ 1 line in TR and ≥ 1 in EN**. No orphan lines. No unknown speaker keys.
2. No class-C text left in `P.LINES` or `P.STR`; no `P.LangText`; no fallback path in `barks.js`.
3. Length per beat and language is within the beat's limit. Comic panels pass a fit check with `P.ComicText` measurement (stub
   canvas in node, or the browser capture in §7).
4. Joke ratio per pool: TR and EN each between 15% and 30% (pools with fewer than 4 lines are exempt).
5. Banned lists: guardrail words (both languages) and translationese (per language) produce zero hits.
6. **Translation-pair detector:** for beats with a single line in both languages, flag pairs whose word-by-word gloss is near
   identical (a simple heuristic is fine). Flags go to review; they aren't failures.
7. No duplicate line text within one language; no English words in TR lines except a whitelist (OK, GPS…).
8. `check-ids.js`, `test-arsenal.js --quick`, `test-env.js` and the L1 bot ≥ 28/30 still pass (dialogue must not change the sim; the
   replay hash is identical with TR and with EN).

## 7. Browser verification (390×844, both languages)
Extend `reviews/media/AUDIT-7/capture-v07.py`, or add a `?lang=` pass to it. For TR and EN, capture: the cold open, the L1 restaurant,
the first bark, Mom's first call, the first comic page, the L5 boss pop, a level-up card, the death screen and the finale page.
- Pass when nothing overflows or clips, there are no overlapping bubbles, and every line reads as written for that language.
- Save to `reviews/media/DIALOGUE/`.

## 8. Phases and gates (stop at each gate and report)
| Phase | Work | Gate |
|---|---|---|
| **1. Plumbing (no rewrites)** | Build the store, the API, locale detection and the split of class-B from class-C text. Migrate today's text **as is** (each language's current best line, overrides applied). Remove the four old mechanisms. List every bark pool key that was relying on the fallback | §6 checks 1–2, 8 pass; the game plays identically in TR and EN; the capture shows no regressions |
| **2. Voice bibles** | `docs/voice-tr.md`, `docs/voice-en.md` (§4.2) with 3 example rewrites per main character | **Owner approves** both bibles before Phase 3 |
| **3. Batch A** | Rewrite Batch A natively, TR first and then EN; export CSVs | §6 all pass; capture in both languages; CSVs delivered for review |
| **4. Batch B, then C** | Same process, one hood group per pass | §6 passes after each pass; CSVs per pass |

## 9. Docs to update
- `docs/product.md`: add the next free D-number (D-051 at time of writing): "Two native scripts from shared beats. Turkish is the master. English is written from the beat,
  not translated. The device language picks the script; the player can override it. Class A/B text is translated precisely;
  class C is native only." Mark D-035's "Turkish spine with English gloss" as superseded by it.
- `docs/narrative.md`: link both voice bibles from Tone.
- `docs/story-presentation.md`: the bubble count per panel can vary by language.
- `AGENTS.md`: a new hard rule: "Voice text lives only in `js/dialogue/`, written natively per language from the beat table. Never
  translate a voice line."
- `docs/architecture.md`: the dialogue store, the API and the locale rules (prototype and Godot).

## 10. Owner decisions (ask; don't decide)
1. **Profanity level in TR and EN** (e.g. *lan*, *ya*, mild English swearing) at the 16+ target. Default until answered: none
   beyond *ya* and "bloody".
2. **British or American English.** The current EN already uses "Mum" (British, which fits Shaun of the Dead). Default: British.
3. **A native Turkish comedy editor:** who reviews the TR CSVs (the owner, or a freelance writer)?
4. **Card flavour lines:** keep one short flavour line per card (fits AUDIT-7 T3-8), or show it only on long-press.

## 11. Out of scope and rules
- No plot or beat changes, no new story systems, no voice-over work. Follow the AUDIT-7 system freeze: the dialogue store
  *replaces* four mechanisms, it doesn't add one.
- The sim stays untouched and deterministic. Dialogue uses view RNG only.
- WAVE2-BRIEF rules still apply: `P.Speech` arbitration, `P.Indoor`, no camera motion without a visible cause.
- Commit per phase with clear messages. Don't commit draft CSVs that contain editor PII.

## 12. Report back (per phase, ≤ 250 words + file paths)
What you did; the §6 check output; capture paths; any pool keys or beats with coverage gaps; open questions; for Phases 3–4, the
number of lines written per language and the joke ratio per pool.
