# Project Istanbul: Story Presentation

> **Status:** v0.1 · 2026-11-08 · Owner: Onder · Decision: **D-028** (comic story presentation, Adopted for the core;
> the phone, radio and collectibles are Proposed, see §8)
> **Story canon:** [narrative.md](narrative.md) (characters, arcs, ending). This doc does not change canon.
> **Structure:** [journey.md](journey.md) (hoods, stages). **Lines and beats:** `prototype/js/strings.js`, `story/`.
> **Look:** [design-system.md](design-system.md) §9 (motion comics, cliffhanger, barks). This doc replaces the bark rules in §9.3 where it says so.

---

## 1. The problem (owner P0-9)

The owner played v0.3 and said: "the story is not very immersive, the player might miss the chatboxes. It should be more
clear and immersive. Maybe we need illustrations of the main characters in the comic style, emerging and interacting
throughout the game?"

What is wrong today, from `director.js`, `ui.js` and `strings.js`:

| Issue | Fact | Effect |
|---|---|---|
| Subtitles vanish | One subtitle line on the HUD. Shown 2.2–4.5 s (by length). Hidden when subtitles are off. | Players miss the line. Nothing is logged. |
| Barks expire | Bark shows 2.5 s. Cooldown 14 s. Queue drops a bark after 10 s. | In a busy fight the bark is gone before it is read. |
| The call is decoration | Signal bars drop at beats, and nothing else changes (P0-8, open). | The call reads as a sound effect, not a story. |
| Little story | About 30 lines in `strings.js`. Three cliffhanger beats in the design, none in the build. | Nothing to come back for. |
| No faces | No character art in the run. | Nobody is recognisable as a character. |

**The fix in one line:** every line lands in two places. It shows on screen in a big, readable form, and it goes to a
message log the player can open at any time. Characters appear as comic busts in the run. The story has pages between hoods.

---

## 2. The system at a glance

| Layer | Where | What it is | Length | Skippable? |
|---|---|---|---|---|
| **Comic pages** | Between hoods (after stage 5 and before the map) | 3–5 panels, tap to advance | 15–25 s per page | Yes, after the first view (hold 0.6 s) |
| **Bust pop-ins** | In the run | A comic bust slides in from a screen edge with a speech bubble | 2.5–6 s per bust | Tap to dismiss. Not blocking. |
| **Calls** | In the run | Mom's phone call as a phone UI with signal bars | ≤ 25 s | Decline with the red button. Logged. |
| **Barks** | In the run | Short bubble above the speaker | 2.5 s min | Not needed. Logged. |
| **Messages** | Phone icon (pause menu and results) | A log of every line, texts, voice notes | Read any time | Always there |
| **Environment notes** | In the hood | Graffiti, door notes, signs, abandoned scenes | Read by walking near | Optional |
| **Collectibles** | In the hood | Polaroids and voice notes | One each per hood | Optional |
| **Map narration** | Map screen | One reactive line per hood, based on the result | 1 line | Optional |

---

## 3. Comic pages between hoods

### 3.1 Format

- **3–5 panels** per page (3 for most hoods, 5 for story hoods: H01, H04, H05, H06, H10, H17, H20).
- Shown on **2 screens**, with 2–3 panels per screen (design-system §9.1 allows up to 4 per screen).
- **Tap to advance.** Auto-advance (setting) is 4 s per panel.
- **Ken Burns:** pan and zoom per panel (3–5%), up to 3 parallax layers.
- **Text is not baked into the art.** Bubbles, SFX lettering and captions are separate layers, in TR and EN (DS §10).
- **Max 60 words per page** in Turkish (about 45 in English). Turkish runs about 20–30% longer. Design bubbles for Turkish.
- **Speaker tails** point at the speaker. Max 2 bubbles per panel.
- **Panel border:** 6 px night ink on paper (DS §9.1).
- **Flashes:** none. Cuts are cuts. The dizi triple zoom is the only fast move, and only at cliffhangers (DS §9.2).

### 3.2 Where and how often

| Where | Pages | Panels |
|---|---|---|
| Hoods 1–6 (the slice) | 6 pages | 5 each on story hoods, 3 elsewhere |
| Hoods 7–20 | 14 pages | 3 each, 5 on H10, H17, H20 |
| Total Chapter 1 | 20 pages | About 80 panels |

**Art cost:** the slice needs about 24 panels. The full chapter needs about 80. This is the largest art line in
the story. Budget it in the art plan (open item 9.5 in AUDIT-3).

### 3.3 Skipping

- First view of a page: cannot skip (the page plays through, tap to advance).
- Second and later views: hold 0.6 s to skip the whole page.
- Story-skip rate is a telemetry target (product §12: < 50%). If it goes over, the pages are too long.

---

## 4. In-run bust pop-ins

### 4.1 What a bust is

A **bust** is a comic-style head and shoulders portrait of a character. It has one of 8 moods (neutral, shouting, scared,
smiling, sad, determined, sick, surprised). Busts come from workstream B (`P.Portraits`). A bust is for story only. It is not an enemy.

### 4.2 How it plays

| Step | Spec |
|---|---|
| Entry | Slides in from the left or right screen edge in 0.25 s (ease-out). Side matches the speaker's side. |
| Position | Top 36% of the screen only. Never over the joystick zone (lower 60%, GD §2) and never over the player ring. |
| Size | Bust about 28% of screen height. Bubble up to 60 characters in Turkish, 2 lines. |
| Speaker cue | Ink burst behind the speaker's head for 0.2 s (black and white ink shape, not a flash). |
| Key lines | Slow-mo at 0.5 time-scale for 1.2 s. Only on lines tagged `key` (about 1 per stage). |
| Sound | A short tag (phone tick for Mom, stone thud for a boss, ink "şak" for a knife line). Sound workstream owns the cue. |
| Exit | Tap anywhere in the top 36% to dismiss. Or auto-exit after the read time. |
| Read time | `max(3.0 s, characters × 0.07 s)`, capped at 6 s. |
| Queue | One bust on screen at a time. Priority: story > call > bark. The queue is 10 s. Items that expire go to the message log. |
| Reduce motion | Fade instead of slide. No slow-mo. No ink burst motion. Text stays. |

### 4.3 Pacing (bust)

- Max **1 bust per 30 s** of play.
- Max **3 busts per run** on route levels. Max **5** on boss levels (intro and phase changes).
- Never during the level-up card screen, the evolution cutscene or a boss telegraph peak.

### 4.4 What the bust is not

- It does not stop the run. The timer keeps moving, except key-line slow-mo.
- It does not carry the only copy of a fact. The same line is in the log.

---

## 5. Mom's calls as a phone UI

### 5.1 The UI

- A **phone panel** slides down from the top 25% of the screen. It shows Mom's bust (mood: worried, then calm), call timer, and **signal bars** (3 → 0).
- The phone panel shows the call's subtitle lines below it, with a text line per beat.
- **Decline:** the red button ends the call. The call goes to the log as "missed".
- **Length:** a call is at most 25 s. Lines inside the call are paced by the read-time rule (§4.2).
- **Drop:** when signal reaches 0, the call cuts with "[cızırtı]" (static), and the panel closes. The last line is logged.

### 5.2 Signal bars: the open decision (P0-8)

Today the bars are decoration. Three options:

| Option | Mechanic | Good | Risk |
|---|---|---|---|
| **A. Bars are reroll tokens** | Each bar is one free card reroll for the run (up to 3). | Clear value. Used on level-up choice, where players need help. | Adds to an existing currency (GD §5.6). |
| **B. Bars show the map pin** | Full bars reveal Mom's last known spot on the map for the hood. | Ties the call to the journey. Strong for the story. | Less direct power. |
| **C. Bars are story only** | Calls are story, with no mechanic. Keep the bars as a visual. | Simplest. | This is the status quo that the owner said was not enough. |

**Recommendation:** option A for Chapter 1, and option B from Chapter 2 when the phone's role grows. Owner decides (open item 9.6).

### 5.3 Call beats (Chapter 1)

| Hood · stage | Call | Lines (TR, from strings.js) |
|---|---|---|
| H01 · 1 | Opening call (in the restaurant to Taksim) | "Anne? Anne, duyuyor musun?" |
| H01 · 4 | Call cuts at the tram | "Baban... diyor ki... [cızırtı]..." |
| H03 · 2 | Mom: don't go over the bridge | "Köprüye yaklaşma." (new) |
| H04 · 4 | Call drops in the fog | "Anne? Kesiliyorsun!" |
| H06 · 5 | Mom's last clear call (slice end) | "...seni seviyoruz... eve gel..." |
| H10 · 4 | Text from Mom at the campfire (no signal, so a text): asks about Mila | "Mila nasıl?" (new) |
| H20 · 1 | Mom's voice in Dad's letter (letter, not a call) | Letter #1 |

Calls become rarer after H06 (no signal). Texts and voice notes replace them (§8).

---

## 6. Barks over characters

Barks are the short bubbles over a speaker's head. They are the lightest layer.

| Rule | Value | Note |
|---|---|---|
| Max length | 40 characters (DS §9.3) | Turkish is longer. Keep the TR line short. |
| Show time | 2.5 s minimum, read-time rule | Same formula as busts. |
| Global cooldown | **12 s** (proposal). DS §9.3 says 20 s. v0.3 uses 14 s. | Update DS §9.3 when the proposal is adopted. |
| Per-speaker cooldown | 30 s (proposal) | Stops one character from talking all the time. |
| Queue expiry | 10 s, then the bark goes to the log | Never silently lost. |
| Priority | Bust > call > bark | Busts can interrupt a bark. |
| Forbidden | Barks during the level-up card screen, the evolution cutscene and the boss's telegraph peak | DS §9.3 rule kept. |

Barks in v0.3 that exceed 40 characters (prototype README decision 10) need trimming before the next build.

---

## 7. The message log (the fix for "missed chatboxes")

A phone icon in the HUD (pause and results screens too) opens the **log**. It holds the last 50 lines of:

- calls (with "missed" tags)
- busts and barks (with the speaker's name)
- texts and voice notes
- radio lines (when §8 is built)

**Unread dot:** a red dot on the icon after each new line. It clears when the log is opened. This is a standard inbox pattern, so players read it without a tutorial.

**Why it matters:** a player who misses a line can still read it. A deaf or distracted player has the same story. The
log is also where the pacing data comes from (`story_bust_shown`, `read_s`, `skipped`; see wow-catalog §7).

---

## 8. Better ideas (beyond the owner's suggestion)

Each idea below is **Proposed**. Pick the ones that fit the budget.

### 8.1 Arda's phone as the story device

| Element | How it works | Story use |
|---|---|---|
| **Signal bars** | Top of the phone UI (§5.2). | Tension. |
| **Battery** | A thin bar. Ch1: no effect on play (visual only). Ch2: the battery becomes the scooter resource (narrative.md). | Sets up Ch2 without a new system now. |
| **Texts** | Arrive at the start of a stage, from Mom, Mila or Kaan. Delivered late if the signal is out. Dad writes letters only (narrative.md). | Mila's "Neredesin?" (Where are you?) arrives at the bridge. |
| **Voice notes** | Mom's recordings. Collectible, one per hood from H07 on. | Her voice without a call. |
| **Map pin** | Mom's last known spot. Shows "Sarıyer" across the water at the north edge of the map. | "Stay away from the north" becomes a visible thing. |

### 8.2 Neighbourhood radio

- A radio plays in shops, cars and cafés. Short broadcasts (15–25 s) from a **fictional** station.
- Content: traffic (no real roads), weather, "stay home" messages, a song (from the owner's soundtrack later, see D-029).
- Guardrail: no real broadcaster names, no real news, no political content. Fictional voices only.
- Gives the "safe zones" radio line in H13 a home: the radio says it, the map shows it.

### 8.3 Environmental storytelling

| Type | Example | Place |
|---|---|---|
| Graffiti | A fictional tag: "Kedilere su koyun" (put water out for the cats) | H02 stairs |
| Door note | "Kapıyı açmayın" (do not open the door) | H07 shutter |
| Sign | "Bugün kapalı" (closed today) | H08 |
| Abandoned scene | A half-eaten simit, a set table with two plates | H13 blankets |
| School notice | Class timetable on the wall | H17 |
| Departure board | "Sarıyer: iptal" (cancelled) | H06 |
| Kapıcı note | A handwritten list of tenants | H20 |

Notes are read by walking close. They show as a small icon, and go to the log.

### 8.4 Collectible polaroids and voice notes

- **One polaroid per hood** (20 in Chapter 1), with a short caption. Shows the hood, a photo of Arda and his family or friends from before, or a tiny detail.
- **One hidden voice note** per hood on H07 onward (Mom, Dad, Kaan, Mila, the busker).
- Collected on the map. Shown in an album.
- Polaroids are a social item too (wow-catalog W59).

### 8.5 Companions met along the way

- Non-combat survivors (a musician, a dolmuş driver, a kapıcı). One line each. One gift each (a key, a map note, a piece of info).
- They do not join. Only Kaan (L20) and Mila (Ch2) join.
- Minor characters only. No new main character in Ch1 (canon).

### 8.6 Reactive narration on the map

- After each level, the map gives one line based on the result. Examples:
  - "No revive. You didn't stop."
  - "Three minutes in a bad street. You made it."
  - "Death: runner. Next time, back off."
- One line per hood. Written for each of the three outcomes. About 60 lines for the slice.

---

## 9. Per-hood story beats

The table keeps the canon beat from narrative.md and the journey (journey.md §5). "Comic" is the end page.
"Bust" is a stage 3 or 4 bust line (TR, short). "Env" is an environment note.

| Hood | Comic (end page) | Bust | Call / text | Env note | Collectible | Canon beat |
|---|---|---|---|---|---|---|
| H01 İstiklal | 5 panels: the bite, the knife, the dropped call, the tram crash | "Kural üç... neydi?" (Rule three... what was it?) | Opening call (existing) | "Afiyet olsun" on the menu board | Polaroid: Arda and Mom at the shop | The Vatman. Arda heads downhill. |
| H02 Galata | 3 panels: busker's last note | "Hepiniz yürüyün!" (Everybody keep walking!, the guide) | Text from Mom: "Kuleye çıkma." (Don't go up the tower.) | "Kedilere su koyun" on the stairs | Voice note: the busker | Tour Guide. Tourists with selfie sticks. |
| H03 Karaköy | 5 panels: wedding café, Paşa adopts Arda | "Bu kediyi bırakmam." (I'm not leaving this cat.) | Mom: "Köprüye yaklaşma." (new) | Wedding invitation (fictional names) | Polaroid: a wedding | The Bride. Paşa joins. Sight of the bridge. |
| H04 Galata Köprüsü | 5 panels: Kaan's misunderstanding and team-up | Kaan: "Dur! Enfekte misin?" (Stop! Are you infected?) | Mila's delayed text: "Neredesin?" | Fishing rods, tangled lines | Voice note: Mom, on the bridge | Big Fisherman. Kaan joins (L20). |
| H05 Eminönü | 5 panels: Kaan puts down his captain | Kaan: "Kaptan... bizi bırakmadı." (The captain didn't leave us.) | No signal | Captain's cap on the boat | Polaroid: the crew | The Captain. Kaan's beat. |
| H06 Sirkeci | 3 panels: the railway clock stops | "Biletsiz geçilmez." (No ticket, no entry.) | Mom's last clear call | Departure board: "Sarıyer: iptal" | Polaroid: the station at dawn | The Ticket Man. Slice end. Cliffhanger (triple zoom). |
| H07 Kapalıçarşı | 3 panels: shutters, looters' hints | Shopkeeper: "Kapıyı açmayın!" (Don't open the door!) | Text from Mom (short) | Note on the shutter | Voice note: shopkeeper | The Carpet Golem. First human threat hinted. |
| H08 Beyazıt | 3 panels: pigeons over the square | "Güvercinler..." (The pigeons...) | Mila: "Gelirsen haber ver." (Let me know if you come.) | "Bugün kapalı" sign | Polaroid: students | The Pigeon Man feeds the birds. |
| H09 Laleli | 3 panels: mannequins in the window | Arda: "Bunlar zombi mi?" (Are these zombies?) | Text: Kaan joking | Cartons with a note | Voice note: a hamal | The Wholesaler. "Are they zombies?" |
| H10 Aksaray | 5 panels: campfire, crush admitted | Arda: "Mila'yı seviyorum." (I like Mila.) | Mom: "Mila nasıl?" (How's Mila?) | Bakery with the oven lit | Polaroid: Arda and Mila (before) | Dolmuş Driver. Triangle seed. Kaan goes quiet. |
| H11 Kumkapı | 3 panels: the quay, the last meze | Porter: "Buz, buz!" (Ice, ice!) | No signal | Crates on ice | Voice note: Mom's old song | The Fish Porter. |
| H12 Yenikapı | 3 panels: the tunnel and the cut | Arda: "Sinyal yok." (No signal.) | Call drops mid-line | Dead phone on the tiles | Voice note: a commuter's message | The Evening Crowd. The line goes dark. |
| H13 Samatya | 3 panels: the sea at dawn | Radio: "Güvenli bölgeler..." (Safe zones...) | Radio | Abandoned picnic | Polaroid: a picnic | The Grill Man. Safe zones and the north. |
| H14 Yedikule | 3 panels: walls and gardens | Arda: "Bu duvarlar hep ayakta." (These walls are still standing.) | None | Note on the gate: "Anahtarı bahçıvana verin." | Keys | The Key Keeper. |
| H15 Zeytinburnu | 3 panels: the last shift | Foreman: "Vardiya bitmedi." (The shift isn't over.) | None | Time card | Voice note: a worker | The Dye Foreman. |
| H16 Kazlıçeşme | 3 panels: calm morning | "Sulama mı?" (Sprinklers?) | Text from Mila: "İyi misin?" (Are you okay?) | Running shoes | Polaroid: a jogger | The Hose Man. |
| H17 Bakırköy Çarşı | 5 panels: old school, old class | Principal: "Herkes sıraya!" (Everyone line up!) | None | School photo, class list | Polaroid: the class | The Principal. Arda's old school. |
| H18 Bakırköy Sahil | 3 panels: the ice-cream man | "Bir dondurma?" (One ice cream?) | None | The bell | Voice note: the ice-cream man | The Ice-Cream Man. |
| H19 Ataköy Marina | 3 panels: the marina, home is close | Arda: "Ev yakın." (Home is close.) | Mom's text: "Dede'ye gittik." (We went to Dede's.) | Boat names (fictional) | Polaroid: the marina | The Yacht Owner. |
| H20 Ataköy | 5 panels: home, Dad's letter #1, the knock | Ahmet Abi: "Ekmeğini al evladım." (Take your bread, son.) | Mom: "Dede'ye gittik, Sarıyer." | Apartment, shoes by the door | Polaroid: family | Ahmet Abi. Letter #1. Mila at the door (L100 cliffhanger, triple zoom). |

**Canon check:** all characters, arcs and the ending are from narrative.md. The H06 slice end and the H20 cliffhanger
are the two cliffhanger beats in the slice and at the end of Chapter 1. Chapter 2 starts at L101 as written.

---

## 10. Pacing rules (summary)

| Rule | Value |
|---|---|
| Story time per hood | ≤ 90 s in play, plus one comic page (15–25 s) |
| Busts | Max 1 per 30 s. Max 3 per route run. Max 5 per boss run. |
| Calls | Max 2 per hood. Max 25 s each. |
| Barks | Min 12 s global gap. Min 30 s per speaker. |
| Text per panel | 2 bubbles max. |
| Text per page | 60 words max (TR). |
| Skip | Pages: hold 0.6 s after the first view. Calls: decline. Busts: tap. |
| Read time | `max(2.5 s, chars × 0.07 s)` for barks and calls. `max(3.0 s, chars × 0.07 s)`, max 6 s for busts. |
| Log | Every line. Never lost. |

---

## 11. Localization notes

- **Turkish first.** Turkish runs 20–30% longer than English. Size bubbles and pages to Turkish. Check EN fits.
- **Casing:** use `P.upper()` (Turkish I/İ rules). Test "İstiklal", "Kapalıçarşı", "Kumkapı", "Yenikapı", "Bakırköy".
- **Diacritics:** ğ, ş, ı, İ, ç, ö, ü must render in every font and in the comic lettering (glyph test, DS §4).
- **Text in art:** none, except the logo (DS §10). Panel text is a layer.
- **Speaker names:** strings keys (`spk.*`). "Anne" = "Mom" in EN. "Usta" = "Cook" in EN today. Check the EN name for Ahmet Abi ("Ahmet Abi" or "Ahmet"). Keep the Turkish form in both languages if it reads well.
- **Sound words:** "ŞAK!", "ÇAT!", "DÜM!", "KÜT!" are lettering, not voice. Each is a layer with its own EN form ("SNIP!", "BONK!", "BOOM!").
- **Jokes:** local jokes stay local, with a visual gag that works in EN (narrative tone rule).
- **German (later):** plan for 30% longer text than EN.
- **Subtitles:** on by default. Font size scales to 150% (DS §4).
- **Dates and times:** none in Chapter 1 except the clock in H06 (no real time shown).

---

## 12. Open items (for the owner)

| # | Item | Recommendation |
|---|---|---|
| 12.1 | Comic pages at every hood (20 pages, about 80 panels) | Yes for the slice (6 pages). Chapter 1 full set after the slice. |
| 12.2 | Bust art (8 moods per character) | B owns it. Start with Arda and Mom. Kaan at H04. |
| 12.3 | Signal bars: option A, B or C (§5.2) | A for Ch1. |
| 12.4 | Bark cooldown 12 s (DS says 20 s) | Yes. Update DS §9.3. |
| 12.5 | Voice acting for busts | Owner. Narrative open Q4. Start with key lines only. |
| 12.6 | Message log and unread dot | Yes. Needed for the owner's P0-9. |
| 12.7 | Polaroids and voice notes (20 + hidden) | Proposed. Art and VO cost. |
