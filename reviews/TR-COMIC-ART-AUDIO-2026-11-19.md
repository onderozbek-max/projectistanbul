# Turkish narrative audit: comic art and reading audio

Date: 2026-11-19. Independent audit of the working tree during the Turkish end-to-end pass and concurrent Audit 9 integration. This records the inspected baseline and recommendations; it does not certify later fixes. Runtime ownership remains with the integrating agent.

## Judgment and evidence boundary

The current comics have recognizable characters, strong Istanbul locations and a clear visual identity. Their largest weakness is sequential storytelling: most panels place a familiar portrait over an empty location while the text carries the action. The shelter illustration and Kaan's dedicated farewell poses demonstrate a stronger approach already present in the game. Those pictures communicate an event or a feeling before their captions are read.

The artwork is not yet sufficient to substantiate an exceptional comic-book experience throughout Levels 1–30. This is an editorial judgment grounded in the mismatches below, not a claim that every scene requires a new illustration. Preserve current ImageGen art and fix the few pictures carrying the most narrative responsibility first.

I visually inspected the actual local rasters: `assets/comic/scenes-a.webp`, `scenes-b.webp`, `scenes-d.webp`, `cast-core.webp`, `cast-support.webp`, `kaan-farewell.webp`, `shelter-action.png`; also `assets/landmarks/kaan-scenes-audit8.png`, `helper-roles-audit8.png`, and `assets/art/props/karakoy.png`. Paths in this report are relative to `prototype/` unless otherwise specified. This pass did not provide a fresh full ordinary-input mobile comic walkthrough or a human audio audition.

Reviewed source: `js/story/story-data.js`, `js/view/comic-raster.js`, `comic.js`, `comic-layout.js`, `comic-art.js`, `sfx.js`, `sfx-ui-cues.js`, `sfx-gen.js`, native Turkish story files, and the D-119/context audit and Audit 9 implementation notes. Previous lettering/DSP checks establish useful technical properties but cannot establish artistic impact or listening comfort.

## Prioritized findings

### P1 — Picture and expression can contradict the scene

**Proven expression mapping; editorial impact.** `js/view/comic-raster.js:11–14,51–54` provides only one expressive portrait each for Arda, Anne and Kaan. `scared`, `worried`, `shout`, `hurt` and `angry` all select it; `sad` and `determined` fall through to the default. The inspected expressive images are open-mouth alarm, while the defaults generally smile. Therefore the authored `sad`/`determined` distinction is not visible. `captain_end` explicitly uses worried Arda, who looks panicked beside grieving Kaan. The L30 phone warning and internal question also use worried Arda. Kaan's `grief` and `steady` images are much better matched.

Minimum correction: provide restrained Arda and Anne expressions, wire distinct somber/concerned/resolved moods, and apply them to the farewell and phone sequence. Do not globally map sadness to the existing alarm portrait. Preserve Kaan's dedicated farewell art. Acceptance requires viewing these actual panels with their text at portrait-phone size.

**Proven scene mismatch.** `js/story/story-data.js:108–116` uses a café interior for G10c, although Arda has only noticed light in the street; L15 aftermath uses the Eminönü quay twice while the text describes the wedding site and following Paşa toward the bridge. This weakens the geographic sequence even though each sentence is understandable.

Minimum existing-art correction: use `street` for G10c, and a Karaköy-compatible `yard`/`street` for the first two L15 panels before the existing `bridge` establishing shot. This addresses location continuity, but does not magically illustrate the chairs or cat.

### P1 — A prohibited real flag remains in a current comic source

**Visually proven.** `assets/comic/scenes-a.webp`, upper-left `istiklal` tile, contains hanging Turkish flags. `js/view/coldopen.js:70` selects the `istiklal` scene for an opening panel. The repository handoff explicitly lists flags among the visual guardrails (`docs/handoff-codex.md:88`). The active raster must be corrected; text-only banned-word tests cannot detect this.

Minimum correction: edit this current ImageGen atlas while preserving tile geometry, location identity and the other cells. Do not substitute retired/procedural artwork. Inspect the resulting tile and its cold-open crop.

### P2 — Important narrated actions and characters are absent from the picture

**Proven asset/content coverage; artistic impact.** The following statements describe visible objects or action that the mapped scene does not depict:

| Sequence | Current visual | Missing narrative information | Minimum direction |
| --- | --- | --- | --- |
| Galata intro, H02i1–i3 | Tower/stairs, empty street, busts | Barış playing music; acid on a stair; hoist/chain threat | Keep one establishing view; prioritize one close detail that makes the danger legible rather than adding more scenic panels. |
| Karaköy intro, H03i1 | Open-looking café interior | Closed wedding salon and untouched cake in its window | A wedding-window illustration is needed if this precise visual claim stays. Existing `shopwin` is a tailor's display, not a cake window. |
| Karaköy intro/departure, H03i2, E15b–c | Arda and empty street/quay/bridge | Paşa, the first companion and the person Arda is addressing | Add a consistent raster Paşa and compose a clear look/follow action. A caption alone introduces the name but does not supply the character visually. |
| Bridge intro/join, H04i2–i3, K20b/f/d | Kaan's waist-up portrait over bridge | Fish used as weapon, then lowered after trust is established | Existing `assets/landmarks/kaan-scenes-audit8.png` offers full-body fish-carrying poses; an action insert can reuse it after crop/style/phone-layout review. |
| Sirkeci intro/end, H06i1–i3, E30a | Pristine, empty hall/tunnel | Stranded carriage, zombie queue, Ticket Man blocking a door, opened service passage | Preserve the location but give the critical obstacle/payoff a legible detail, preferably reusing current station/railcar assets where their perspective permits. |

There is no Paşa entry in `comic-raster.js`'s cast and no cat raster was found in the current asset-name inventory or inspected Karaköy prop sheet. `comic-art.js:294` has an old procedural cat silhouette and `fauna-art.js` draws procedural animals. Enabling those would not satisfy the current-art requirement.

The existing Kaan action sheet is a four-column/two-row atlas. Row 1 column 3 has a conversational hand gesture while carrying the fish; row 2 column 1 bows his head; row 2 column 2 looks alert; row 2 column 3 points ahead. These are usable candidates, not already integrated comic art. The full-body proportions differ from the comic busts, so it needs an intentional insert rather than an indiscriminate bust replacement.

### P2 — The sound timing is current, but quality is not yet auditioned

**Proven routing improvement already present.** D-119 correctly distinguishes a real page transition (`comicPage`) from a panel reveal (`comicPop`). Narration and thoughts do not chatter; quiet farewell/L30 pages suppress speech and zoom sounds. Preserve those fixes. `tools/test-comic-reading.js` exercises this behavior with a stubbed renderer and cue collector; it does not listen to a waveform.

**Proven source status.** The current generated-ready manifest `audio/sfx-gen/ready/manifest.json` contains neither `comicPage` nor `comicPop`. `sfx-gen.js:28` deliberately excludes speech from generated replacement. These three sounds currently resolve to the runtime recipes in `js/view/sfx-ui-cues.js`. The separate `audio/sfx/manifest.json` lists rendered synthesized assets; its existence does not establish that a newly recorded/generated reading sound is playing.

| Cue | Current recipe | Audit implication |
| --- | --- | --- |
| `comicPage` | 0.5-second modulated filtered noise plus a soft low thump; 3 variants; design level −22 dB | Semantically page-like, but frequency balance and tactile quality require listening. “Up to date” means correctly routed current recipe, not newly supplied premium audio. |
| `comicPop` | 0.14-second high-frequency whoosh plus thump; 3 variants; −23 dB | Short enough for panel entrance; assess repeated reveals for brightness/fatigue. |
| `speech` | 0.1-second synthetic formant syllable; 5 variants for each of 5 presets; −21 dB | Readable identity hints are possible, but this is nonverbal synthetic chatter, not acting. |
| `hoodIntro` | 1.8-second percussion/pluck/bell flourish; −16 dB | Used on ordinary comic opening and again for dramatic zoom; repeated flourishes can compete with low-key humor. |
| `homeMotif` / `farewellMotif` | Short related plucked phrases; −26/−28 dB | Restrained authored placement supports emotional contrast; preserve it. |

**Proven scheduling concern; unproven fatigue.** `comic.js:269–275,312–332,399–427` requests speech whenever the visible character count changes. Whitespace and punctuation do not create breathing room. Requests use a 55 ms minimum gap; `sfx.js:175` takes that supplied gap directly, overriding the recipe's default 60 ms. The 100 ms syllable and two-voice admission limit permit overlapping chatter. The exact realized rate depends on frame cadence/admission; no precise listening-rate measurement was performed here.

Minimum correction: schedule bounded, word/syllable-like accents with punctuation pauses; keep the full sentence typing unchanged. Cue-count/timing tests should cover pages, calls and live pops, including rapid completion and quiet pages. Then audition a sustained conversation, not just isolated files. Reducing synthetic cue density can improve reading space without a paid service, dependency or new recording.

`sfx.js:28,154–165,198–199` also renews ambience/music ducking on every accepted speech cue. Its first syllable may start at full level while subsequent mid-priority cues start ducked by 3 dB. This is source behavior, not proof of audible pumping; include it in the listening check.

## First-30 pacing and visual hook review

| Page/sequence | What works | What to improve |
| --- | --- | --- |
| L1 shelter/outro | Dedicated action shows Usta lowering the shutter, danger outside and Arda sheltering. The concurrent `actionFirst`/`actionTop:.66` protects its art. Map then destination establish a concrete journey. | Keep the body/action visible; do not bury the shutter interaction behind busts or balloons. Match “closed behind me” to the illustrated moment of closure; it is a sequence, not a literal frozen final state. |
| L5 tram/radio | Silence after the boss and a fragmented broadcast can enlarge the world. | The image remains an intact empty tram; radio source is represented as a news portrait. Ensure presentation reads as heard broadcast, not a reporter physically joining Arda. |
| L10 Galata to Karaköy | Wedding music offers a motivated hope-driven next destination. | End on an unresolved source of light/music, not an already-entered café. A generic dramatic face zoom is weaker than a specific new visual clue. |
| L15 Paşa to bridge | The first small relationship can make continued play emotionally meaningful. | The cat is absent. One clear look-back/follow picture would earn more investment than an added paragraph. Keep the wedding aftermath in Karaköy. |
| L20 Kaan joins | Fish threat turning into an agreement is a good visual comedy mechanism; narrator marks transition to two travelers. | Show the fish changing position. Maintain the bridge until the agreement is made, then use the quay as a clearly subsequent movement. |
| L25 captain farewell | Existing grief/steady poses, cloth continuity and silence are the strongest emotional comic sequence. | Replace Arda's alarm expression with attentive stillness. Do not add a gag or a flourish to make this “more entertaining.” |
| L30 warning/departure | Dropped call, concrete instruction, father mystery and a destination give the chapter a forward question. | The final caption-only road panel has `zoom:true` (`story-data.js:138`); the controller defaults to zooming the empty panel center. Remove this unnecessary zoom or reserve the emphasis for a meaningful image. Keep Mom's warning visually restrained. |

To make the comics a reason to continue, vary the final beat: sometimes a new visual question (wedding light), sometimes a relationship changing (Kaan lowers the fish), sometimes an emotional commitment (leaving the captain), sometimes a precise unresolved fact (what Father saw). A repeated close-up flourish cannot supply all four. The absurdity should emerge from a readable physical situation; generic screaming portraits make quiet Turkish deadpan harder to land.

## Minimum acceptance pass

1. View corrected L1, H03, L15, L20, L25 and L30 at actual phone dimensions in Turkish. Confirm identities, eyelines, referenced props, passage of place/time and unobscured action. Check all farewell branches.
2. Confirm quiet lines choose restrained portraits and no unknown mood silently resolves to a happy face when that changes meaning.
3. Retain lettering-fit and reading-cue regressions, but do not equate zero overlap flags with a successful comic.
4. Audition page turns, repeated reveals, a full Arda/Anne call, a longer Arda/Kaan conversation and the silent farewell on headphones and a phone speaker. Listen to cues with the music/ambience mix and when quickly completing text. Record listener observations separately from DSP output.
5. Recheck the active atlas and its opening crop for the flag correction. The no-retired-art rule still applies to asset failures and ordinary play.

The initial audit changed only this report. It intentionally leaves listening and any unimplemented art coverage open rather than claiming proof the inspection did not provide.

## Follow-up implementation: sparse reading accents

The integrating agent authorized a targeted runtime correction after this audit. `prototype/js/view/comic.js` now uses one shared word-onset scheduler for page speech, illustrated pops and phone calls. Accepted accents are at least 150 ms apart; clauses pause sound for 160 ms and sentence punctuation for 280 ms. These audio pauses do not slow or change text, panel advancement or gameplay. Turkish letters including uppercase dotted İ are recognized. Bracketed signal directions do not chatter. A tap that completes text never schedules the skipped words afterward.

Narration, thoughts, quiet pages and compact live pops retain their existing silence. Voice identities, synthesized recipes, gains and all music/ambience routing remain unchanged. The runtime remains 600 lines and needs no new file, index insertion, dependency or asset. This is a scheduling improvement; no listening-quality claim is made.

`node prototype/tools/test-comic-reading.js` passes with expanded controller-level coverage for sparse long-word accents, Turkish word starts, sentence/clause pauses, punctuation/static silence, page/pop/call spacing, caller/reply voice identity, quiet presentation and rapid completion without catch-up. The renderer and sound output are stubbed, so this test proves timing/placement rather than visual quality or perceived sound.

Related focused results: `comic-reading`, `dialogue`, and `ui-motion` passed; the latter reports 536 checks. The wrapper invocation also mistakenly requested nonexistent target `story`, producing `MODULE_NOT_FOUND` and a nonzero wrapper exit. That command-name error is not a failing repository test. Full-suite integration remains the parent task's responsibility.
