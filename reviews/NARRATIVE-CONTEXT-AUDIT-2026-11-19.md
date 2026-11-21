# Bilingual narrative context audit — 2026-11-19

**Result:** corrected the first-30 prototype's dialogue placement, continuity and reading cues. **157 native lines revised: 84 English, 73 Turkish.** The opening no longer allows casual zombie introductions. No new blocking comic screens, gameplay balance changes, dependencies or audio recordings were added.

The audit follows the live cold open, director, story resolver, comic panels, bark scheduler and event producers. It checks who speaks, what they know, what has actually happened, and what the player is doing when a line can appear. It is a source/sequence audit with targeted browser and behavior checks, not a claim that every possible playthrough has been watched.

Scope: active Levels 1–30, both languages, the shared ambient/event pools they can select, conditional rescue/farewell variants and comic reading audio. The previously discussed Mila reunion was also checked as an existing archived draft; no post-30 gameplay was added or unlocked. Later district scripts are not certified by this pass.

- [Current bilingual scene readthrough](NARRATIVE-CONTEXT-READTHROUGH-2026-11-19.md)
- [Every native line revision, before/after](NARRATIVE-CONTEXT-CHANGES-2026-11-19.md)

## Findings and corrections

| Placement | Context failure | Correction |
|---|---|---|
| Restaurant transformation | “Are you okay?” belonged to the generic friend speaker although Arda approaches the turning diner. | `s3` belongs to Arda. Concern turns into “stay back” in both native scripts. |
| Immediately after the opening strike | The apology described a wrong doorway that the current scene does not show. | Short reflexive apology and warning, matching the visible defensive strike. |
| First escape | Ambient selection could invite a zombie to talk or ask its name six seconds into play. | No ambient chatter or district arrival bark during L1; optional randomized jokes suppressed there. Existing authored dialogue and tutorial remain. |
| Later street encounters | Casual conversation ignored injury, crowds, bosses and target movement. Queued observations could become false before being shown. | Banter only from L6, with an isolated ordinary walker and breathing room; context is rechecked while queued and throughout the exchange. Introductions, invented prior conversations and leisurely invitations rewritten as nervous attempts to get past. |
| First sighting/first kill | The same encounter warning could trigger after killing the only enemy of that type, or from a distant entrance. Some variants claimed an attack had already landed. | Living nearby sightings own warnings; killing no longer announces a live threat. Rewrite tea, trash-can, screamer and helmet observations where needed. |
| Phone dialogue | Incidental barks could compete with queued director phone speech. EN Arda skipped Mom's food question. TR L15 answered the Sarıyer question with an unexplained “he crossed it out.” | Director speech/queue owns the channel. EN answers briefly before reporting the attack. TR confirms Sarıyer, names Dad's map and establishes the food before Arda replies. |
| L2/L3 route | Arda recalled Usta's advice from an unplayed intro; EN claimed to have eaten chestnuts without a pickup. | A present-tense grip reminder and a smell/hunger observation. |
| L16/L17 route/rescue | Optional fireworks were treated as acquired; fishing line was already around Arda's ankle at entry; a rescue variant claimed a water extraction. | Conditional pickup/tangle language and a rescue acknowledgment that matches the actual cover action. |
| L18 bridge | Kaan's bite question at entry and Arda's answer at midpoint were separated by gameplay. | Both pops now queue consecutively at entry; the old midpoint repeat is removed. Same two speakers and native lines. |
| L21 boat comic | Kaan's English speech said “Kaan breaks into a run,” narrating himself in third person. | He calls toward the light on the captain's boat; Arda answers him directly. |
| L22–24 district barks | Old atmosphere pools described dust, a tilting pier and zombies sliding into water irrespective of current cart/sack/beacon tasks. | Entry observations point to the actual obstacle and intended action, without claiming success. |
| L25 farewell / L26 arrival | Random chatter could resume after the farewell; the next district immediately returned to a complaint about queues. | Bark silence lasts through the remainder of the captain's run. The next arrival keeps Arda attentive to Kaan; Kaan's rail warning is protective in both languages. |
| L27 guide / L28–29 station | Midpoint text assumed the guide had already walked in darkness; entry pools described gate/light states not established by the player. | Guide-key reminder; clock, power and platform lines describe what still needs doing. |
| Event lifecycle | `eventEnd` for an ambush/pier is emitted when its enemies spawn. Chest lifecycle ends when the reward drops, not when opened. Rescue failure could pick a reassuring end line. | These lifecycle endings no longer select completion chatter. Actual `rescueDone` still speaks. Capped/skipped/failed events do not claim success. |
| Hazard/item/prop pools | Gas leaks selected burning-car lines; generic heal lines named simit even for medkits; zero healing could announce recovery; generic broken props named glass/wood/shop windows. | Gas is excluded from the car pool; recovery requires positive restored HP and fits medical pickups; shared break/fuse lines avoid unverified materials. Loot-runner lines correctly describe its simit tray. |
| Family and possessions | Random lines invented a dürüm in Arda's bag, a fixed battery percentage, an exact step count or a specific closed door. | Memories, intentions and observations that do not require untracked inventory/world state. |
| Mila draft | Needed to verify the previously reported premature Sarıyer knowledge had not returned. | Retained: she asks about his parents, Arda states Sarıyer, then they agree to travel together. Regression checks preserve that ordering. |

## Scene continuity review

| Section | Narrative handoff checked |
|---|---|
| Cold open / L1 | Dinner → news → diner turns → defensive knife grab → escape → Mom's interrupted call → shelter → route home. |
| L2–5 | Escape tactics and transit obstacles; Mom establishes the empty apartment/map/Sarıyer before the tram aftermath recalls the plan. |
| L6–10 | Galata's stairs and tower threat; defeat gives way to wedding music and a reason to continue downhill. |
| L11–15 | Paşa is named on entry before later references; wedding pursuit ends at the quay and Paşa leads toward the bridge. |
| L16–20 | Unknown fish-wielding survivor → bite challenge/answer → joint survival → names exchanged → agreement to check his captain. |
| L21–25 | Kaan's seven-year connection precedes the boat encounter; cart/sacks/beacon actions lead to the captain; farewell and earned variants keep grief intact. |
| L26–30 | Kaan remains present; service passage/guide/clock/lights/points lead to the boss; Mom's warning follows the fight; apartment remains the immediate destination, Sarıyer the next leg. |
| Archived arrival draft | Dad's letter is read before the forest discrepancy; Mila hears family news before agreeing on the shared destination. No expansion work. |

The mystery remains in what Dad knows, rather than in unclear pronouns or missing conversations. Humor remains in character habits, fear and earned relief. Existing L10/L15 connective comics and the Mila news-exchange page are retained. More screens would not fix the identified scheduling defects.

## Comic reading sound: what is actually current

`comic.js` requests `comicPage`, `comicPop` and `speech`. The generated-asset route is `sfx-gen.js` → `audio/sfx-gen/ready/manifest.json`; there is **no prepared comicPage/comicPop replacement** in that manifest or source drop folder. Speech is explicitly excluded from generated replacements and remains the per-character synthesized blip. The legacy `audio/sfx/manifest.json` describes exports; it is not evidence that a newer recording is playing.

The current recipes are in `prototype/js/view/sfx-ui-cues.js`: 0.5 s paper flutter for page turns, 0.14 s pop for reveals, 0.1 s synthesized speech syllables. No new recording was found, generated or imported.

Corrected presentation:

1. `comicPage` plays on an actual page transition. Previously every panel after the first played it, while a real page transition played `comicPop`.
2. Panel reveals use `comicPop` without a second simultaneous page cue.
3. Narration and thought bubbles are silent; thought bubbles also stop driving talking-mouth animation.
4. Quiet pages suppress speech blips and zoom stingers too. The captain's farewell and L30 pages retain their explicitly authored entrance motifs/ring.

Technical DSP checks: 3 page variants, 3 pop variants and 25 speech variants, **zero failures/warnings**. This does not establish subjective listening quality or iPhone loudness. Audio routing was verified from source and exercised through the real comic controller with an SFX spy; no claim of a listening audition.

## Delivery changes / deviations for review

Proposed D-119 records this authorized implementation for review. No sim values or combat rules changed. New presentation-only eligibility settings in the existing bark CFG:

- Zombie banter begins at L6; health must exceed 50%; no hit in the preceding 8 seconds; no live boss.
- Only one live enemy within 5 m, an ordinary active walker 1.6–3.2 m away. No elite or loot runner. Replies remain bound to that same target.
- Quiet self-talk/stillness requires no active nearby ordinary enemy within 5 m; movement cancels a stale stillness remark. Existing reading durations and global joke/cooldown budgets remain.
- L1 suppresses ambient chatter and randomized jokes; authored dark humor remains.
- The L25 boss-death event silences optional barks until the next run reset, including the walk to the exit.
- L18's existing answer moves from midpoint to the entry queue. No new pause, comic page or gameplay lock.

## Validation and limits

- `run-tests.sh barks-delivery comic-reading dialogue experience opening fonts audit8`: passing on the final code.
- `test-sfx-gen.js --quick`: passes; intentionally skips importer/ffmpeg fixture tests.
- `qa-sfx.js --only=comicPage|comicPop|speech --quiet`: all pass (run individually).
- Dialogue store: **583 beats, TR 1,202 lines, EN 1,205 lines**; seeded sim digest **TR = EN `12d2b67db8`**. Existing diagnostic note: one non-strict Britishism/translationese flag; no strict failures.
- Browser preview, actual bundled fonts: **2,237 layout rows, zero flags** (TR 255 story/call/pop + 862 bark rows; EN 255 + 865). Visually checked the Eminönü exchange in both languages. Final subsequent edits were small copy/eligibility/thought-animation corrections, validated by the focused checks; this is not an all-scenes visual playthrough.
- New behavior coverage: eligible chains still complete; dead/distant/crowded/unread speakers cancel replies; opening, boss, hurt, phone and grief contexts reject casual banter in both languages; event endings cannot claim victory; medkits only announce actual healing; consecutive Kaan/Arda exchange; page versus panel sounds; narration/thought/quiet-page silence including zooms; opening speaker; Mila destination handoff.
- Full suite was started in the background. `arena-evolve` failed because the sandbox denied its localhost listener; the full run was stopped, so **no full-suite pass or merge readiness is claimed**. A separately authorized localhost-only server allowed the focused browser review above.
- Existing unrelated workspace edits were preserved. Nothing committed, pushed or merged. No physical-device or new-player comprehension sign-off.

Evidence: `reviews/media/R1/narrative-context-2026-11-19/`.
