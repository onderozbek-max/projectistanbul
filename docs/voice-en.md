# Voice Bible (EN): Project Istanbul

> **Status:** Approved v0.2 (owner, 2026-11-09) · 2026-11-09 · BRIEF-DIALOGUE Phase 2 · **Phase 3 writes to this bible.**
> **Scope:** class C text only: character voice (barks, story pages, pops, Mom's calls, captions, finale, card flavor, boss lines).
> UI (class A) and rules text (class B) are translated precisely and are not governed here.
> **Sibling:** [voice-tr.md](voice-tr.md), written in Turkish. **The English script is not a translation of the Turkish one.** Both are written from the
> same *beat* (what the moment has to do). Do not open the other language while writing a line.
> **Decision:** D-051 ([product.md](product.md) §17). Who each person is: [characters.md](characters.md). Plot: [narrative.md](narrative.md).
> **Dialect: American English** (owner direction, 2026-11-09). This replaces the brief's British default; see §3.

---

## 1. What the voice is

**Shaun of the Dead, in an American mouth.** Dry, funny, sarcastic, deadpan. The world is ending and Arda is worried that Mom will find out he skipped dinner.
The joke is the **situation**, not the wordplay: a scared kid hiding his fear behind a small sentence.

1. Arda is scared and covers it with a joke. The joke is his armor, not a lecture.
2. Plain lines carry the character; jokes are seasoning. **About 25% of the lines in a pool are jokes, never over 30%.**
3. Jokes come from Arda's **situation** (hunger, Mom, no signal, a dead phone, a ruined commute), not from random wordplay.
4. Istanbul stays in the English: the food, the titles, the places. It reads like a smart kid who lives there, never like a phrasebook.

### 1.1 Numbers (tests enforce these)
| Slot | Limit | Note |
|---|---|---|
| Bark (Arda's bubble) | **60 characters** | English runs shorter than Turkish; the limit comes from the bubble, not from the other language |
| Pop and subtitle | **90 characters** | Comic pages use the panel limit |
| Card flavor | **60 characters** | Never explains the rule; the rule is class B |
| Joke ratio per pool | **15–30%** | pools under 4 lines are exempt |

### 1.2 Writing rules (summary; details in BRIEF §4.1)
1. **Write from the beat's intent, not from Turkish.** If two lines turn out to be translations of each other, rewrite one.
2. Turkish is written first; English second, without looking at it.
3. Plot, facts and beats don't change. Hood facts stand as written (D-048). Places stay plausible (no tram in Samatya).
4. **Never punch down.** No regional, ethnic, religious or political targets; no body-shaming or poverty jokes. The ezan is ambient only (D-035). No real state actors,
   parties, people, brands or clubs. No earthquake talk. No child zombies. Animals are never harmed. Rating 16+.
5. End on the funny word. Don't explain the joke after it.

---

## 2. Arda's English (register guide)

A 20-year-old college student from Istanbul who grew up on American shows and says it the way a smart kid would: **casual, quick, a little tired**.

| Do | Don't |
|---|---|
| contractions, fragments, a trailing thought ("Plan: walk.") | stiff full sentences ("I must proceed to the next location.") |
| "okay", "man", "yeah", "honestly", "kind of", "I mean" | "dude", "bro", "totally" stacked up: US teen cosplay |
| "buddy", "pal", "sir", "man" to zombies: mock politeness | "sir/madam" to a zombie with no joke behind it |
| food, Mom, bills, no signal, the commute | fortune-cookie lines ("Survival is attention, patience and a bit of luck.") |
| anticlimax: "Big plan. Plan: walk." | speeches; exclamation marks as volume |
| movie references **without brands** ("Always works in movies.") | brands, celebrities, clubs, real show names |
| one ellipsis per line, at most | ellipsis and exclamation piles |

**Turkish words in English lines.** Allowed when they are food, places, titles or forms of address, and when the meaning is clear from the line or the scene:
*abi, usta, dede, simit, dürüm, döner, çay, dolmuş, kapıcı (once, with "doorman" nearby)*. **One per line, never glossed in parentheses, never italicized.**
Place names use real Turkish spelling (Beyoğlu, Sarıyer). *Kaan calls Arda "abi"; Arda says "man". Mom is "Mom" and Dad is "Dad" (not "Anne", not "Baba").*

**Profanity:** see §6 (owner direction: allowed; level proposed there).
**Casing:** comic lettering is uppercase; write sentence case and let `P.upper` do it.

---

## 3. American, not British

The current English leans British ("Mum", "mate", "colour", "Honourable"). It becomes American. A starter conversion table (the banned list in §7 enforces it):

| British (replace) | American |
|---|---|
| Mum | **Mom** (the speaker tag `spk.anne` becomes "Mom") |
| mate | man, pal, buddy |
| bloody | damn, freaking; or cut it |
| flat | apartment |
| lorry | truck |
| rubbish | trash |
| queue | line |
| torch | flashlight (the weapon stays *blowtorch*) |
| pavement, lift, car park | sidewalk, elevator, parking lot |
| jumper, trainers | sweater, sneakers |
| council | city |
| whilst, reckon, cheers (thanks), brilliant (praise) | while, figure, thanks, great |
| colour, neighbour, armour, favourite, honourable | color, neighbor, armor, favorite, honorable |
| football (the sport) | soccer (and no club names anyway) |
| petrol, boot, mobile | gas, trunk, phone |

---

## 4. Character sheets

> Each card: **register**, **habits**, **never**, **3 good lines** (current or proposed), **2 bad lines** with the reason.
> Lines marked *(proposed)* don't exist in the game yet; they show the tone for Phase 3.

### Arda Demir · 20 · the player
**Register.** §2. Dry, quick, self-mocking, never mean. Talks to himself and to zombies.
**Habits.** Jokes when scared. Calls zombies "buddy" or "pal". Brings up Mom, food, movies. Touches the earbud (it plays nothing; it comforts him).
**Never.** Hero speeches. Stiff formality. Punching down: the target is Arda or the situation. A zombie can be teased for its manners, never for its body or its money. No cursing at Mom.
**Good**
1. "Rule two: never get bitten. Whoever wrote that got bitten." *(L01 pop: rule plus a twist)*
2. "Thinking out loud. Nobody's listening, so fine." *(BK.self: plain, carries the character)*
3. "Dad always had a pencil. I've got a knife." *(BK.dad: tiny, true)*
**Bad**
1. "Survival is attention, patience and a bit of luck." → a poster, not Arda; no joke, no situation.
2. "It's coming at me. Shoes ready?" → no clear meaning; the second sentence is filler.

### Mom (Leyla Demir) · 46 · nursery-school teacher
**Register.** Calm, clear, short. Twenty years of three-year-olds: her voice stays level on a bad line. **Love hidden inside instructions.**
"Honey", "sweetie", **"my lion"** (*aslanım*, used once, early, so it carries). "**Did you eat?**" is her "I love you", in every call.
**Habits.** Hides fear by asking questions. Hides in small chores (jackets, shoes, the carpet). Hums while she cooks.
**Never.** Crying out of panic, "we're going to die", swearing, long emotional speeches. She never *says* she's scared; the player notices.
**Good**
1. "Take your shoes off at the door. Don't you dare walk on the carpet." *(FINa5: love as a rug rule)*
2. "Don't take the metro, everything's stopped!" *(callB1: order, no fear)*
3. "The letter's on the table, sweetheart. Read it. Then we'll talk." *(FINb2 reshaped: calm, firm)*
**Bad**
1. "...we love you... come home..." → movie cliché. Mom says it with "did you eat?" or a chore.
2. "Arda! Where are you? Did you see the news?" → pure plot questions; no voice, no chore, nothing only she would say.

### Dad (Selim Demir) · 49 · civil engineer
**Register.** Short, exact, dry, like a telegram. Numbers, measurements, imperatives. **Instructions instead of feelings;** the love is in the instruction.
Signs letters with one initial: **"D."** (Turkish signs "Baban.", spelled out: nobody shortens *Baba* to "B.").
**Habits.** Pencil, tape measure, "measure twice, cut once." Never jokes; dry facts land funny in the wrong place.
**Never.** "I love you." Long sentences. Explanations. Starting a letter with "Son," and a speech.
**Good**
1. "Stay off the highways." *(FINb3, last line: one command)*
2. "Unplug it first, then touch it. D." *(proposed: love as a safety rule)*
3. "Eat. Sleep. D." *(proposed: a letter's last line)*
**Bad**
1. "Love you. Dad." → the letter signs with an initial and never says the feeling (see §9, open question 1).
2. "Son, Mum and Dede are in Sarıyer, at Dede's place." → narration; Dad hands over the fact bare.

### Kaan Aydın · 21 · "the teddy bear with an anchor"
**Register.** Loud, warm, teasing. Calls Arda "**abi**" (sometimes "man"). Explains everything with **food**. The more scared he is, the louder and faster he gets.
**Habits.** Hums the ferry horn. Wipes his hands on the towel before saying something sincere. Apologizes to furniture.
**Never.** Cruelty, even as a joke about Arda's looks. Cold, clipped, Mila-style speech. "Dude" (that's not him).
**Good**
1. "Ah-choo... Still alive. Bless me, then." *(H05p3)*
2. "Everyone knows, man. Now you've said it out loud." *(CMPc: teasing)*
3. "My captain's boat is still tied up here. He'd never leave it." *(H05i2a: heavy and plain)*
**Bad**
1. "Arda, right? I'm Kaan. Are you really human?" → a polite introduction; scared Kaan shouts, he doesn't introduce himself.
2. "Stop! Don't come closer! Are you... infected?" → correct but generic; no Kaan in it (no food, no volume problem).

### Mila Kaya · 20 · "the one who runs toward it"
**Register.** Clipped, dry, competitive. **Counts out loud** ("one, two, three"). Never says "please"; says "okay, go". "I'm faster alone" means "I'm scared".
**Habits.** Bounces her heel. Tightens the scrunchie when she decides something big. Ends lines with a command.
**Never.** Begging, complaining, long explanations, "save me". "Please" and "would you mind".
**Good** *(she has one line in the game so far; these are proposed)*
1. "I'm faster alone. Go, I'll catch up. ...Stop looking at me like that."
2. "I'll count to three. One. Two. Move."
3. "Second-place prize. Yeah. I kept it. It's a hair tie, okay?"
**Bad**
1. "Arda! You're heading to Sarıyer, right? My parents' safe house is in Zekeriyaköy, right next to it. I'm going there too." → three sentences of exposition; Mila is short and counts.
2. "Could you please help me?" → Mila doesn't ask, she orders.

### Ada · ~19 · "the one who looks at the sea"
**Register.** Almost silent. Short, plain, completely literal; asks questions about ordinary things because nobody told her. Counts (steps, tiles, seagulls).
**Habits.** Keeps a bottle cap from every place. Goes very still when zombies are near (*Calm*).
**Never.** Jokes, slang, swearing, long sentences. Ada is **not written as funny**: if a funny moment happens, the player smiles with her, never at her.
**Good** *(proposed)*
1. "Is it always this loud out here?"
2. "Forty steps to the corner. Seven seagulls. Counting helps."
3. "It has a hole in it. On purpose?"
**Bad**
1. "Oh my God, this is amazing! Best day ever!" → Ada has no exclamation marks and no slang.
2. "Zombies! I'm scared, save me!" → Ada never says she's scared; she goes quiet.

### Ahmet Abi ("Sayın Abim") · 63 · doorman, Ataköy
**Register.** Slow, soft, never hurried. "**Son**", "**kiddo**". An old Istanbul doorman's speech: weather, bread, tea.
**Habits.** Pauses mid-sentence with "..." and waits. Keeps the bread warm. Knows everyone's business and doesn't say it.
**Never.** Shouting, getting hard, preaching, religious formulas (religion stays outside the joke). Even as a boss he doesn't speak with malice; he speaks with sorrow (D-047).
**Good**
1. "Take some bread, my boy. Then forgive me." *(H20b: one sentence is enough)*
2. "The bakery smell... Ahmet Abi was always here. He'd say 'Son, wear a jacket.'" *(H20i2a: Arda's memory)*
3. "You're late, kiddo. Tea's on, bread's warm. Wipe your feet." *(proposed)*
**Bad**
1. "Hang on, son, I'm opening up! The shutter's a bit stubborn." → that's the **shopkeeper's** bark: more energy, more exclamation than Ahmet Abi's slow rhythm.
2. "I forgive you. Go!" → Ahmet Abi never passes a verdict; he says "kiddo" and waits.

### Usta Cemal · 58 · döner master, İstiklal
**Register.** Booming and kind; reads every order out like a title. Calls Arda "**Professor**" and "young man". "Döner is patience."
**Habits.** Twists a saying with love. Lets Arda pay on Friday.
**Never.** Looks down on anyone, scolds a customer, names a brand.
**Good**
1. "Rush a dürüm, it burns. Not on my grill." *(L02m)*
2. "Enjoy! Don't grip it so hard. Let the weight do the work." *(H01i1b)*
3. "Take your time, young man. The dürüm isn't going anywhere." *(s2, reshaped)*
**Bad**
1. "We're closed. Go." → Usta turns nobody away.
2. "The customer is always right." → a poster slogan; Usta bends sayings, he doesn't read them off the wall.

### Hasan Karadeniz ("Dede") · 74 · retired fisherman, Sarıyer *(Chapter 2 on; the voice is ready now)*
**Register.** Grumbles first, then says the kind part under his breath. Mom's father. Says "**I told you so**" and calls the sedan "**the Bride**" (*Gelin*).
**Habits.** Complains about everything and cooks for everyone. Washes the car on Sundays.
**Never.** Says the love flat out. Swearing beyond "damn it".
**Good** *(proposed)*
1. "I told you so. ...Sit down before it gets cold."
2. "This car is forty years old and you're twenty. One of you needs work. Not the car."
3. "Don't touch the Bride. ...Fine. Here's the key."
**Bad**
1. "Grandson, I love you so much." → Dede loves by complaining.
2. "Well done, kiddo! So proud!" → praise comes inside a complaint, quietly.

### Barış, Hande, shopkeepers and strangers
- **Barış** (27, street musician, İstiklal): soft, slow like his guitar. "My last tune. Then you go too, alright?" *(H02i1b)*. Never: forced jokes.
- **Hande** (34, news anchor): flawless broadcast voice (**BREAKING**, flat facts) until it cracks; her `shout` mood is the game's first scare. No real outlet or political phrasing.
- **Shopkeeper** (generic): quick, neighborly, few exclamation marks. "kid", "pal".
- **Stranger** (generic): plain, short; no name, no joke.
- **Phone**: only "No signal." One flat line.

### Narrator caption (spk.cap)
**Register.** Arda's **inner voice**: short observational fragments ("Third floor. The balcony light is on."). Sets place and time; rarely jokes, and when it does the joke is **understatement**.
**Never.** Epic tone, lectures, explaining. At most two sentences.
**Good:** "Someone knocks on the door." · "Tomorrow we walk again." · "Kaan went quiet for a while. Then he threw a log on the fire."
**Bad:** "Life's cruel realities faced him once again." → purple prose; not short, not Arda.

### Zombies
Zombies **don't use words**: consonant piles and moans ("Hhhnnrrgh."). The zombie isn't the joke; **Arda's reply** is. The only exception is bosses (below).

### Bosses (hood-end pops; one attitude each, 2–3 short sentences)
| Boss | Voice | Never |
|---|---|---|
| The Vatman (İstiklal) | announcement voice, by-the-book: "Line's closed!" | a real operator or agency |
| Tour Guide (Galata) | microphone cheer, flag, "Folks, this way!" | jokes about tourists or foreigners |
| The Bride (Karaköy) | sweet and creepy, bouquet | marriage or women jokes |
| Big Fisherman (Bridge) | slow, patient, rod metaphors | weight jokes |
| The Captain (Eminönü) | fatherly, gives orders; the warmth that hurts Kaan | crude language |
| The Ticket Man (Sirkeci) | bureaucratic, "Ticket?" | a real transit agency |
| The Carpet Golem (Grand Bazaar) | shopkeeper politeness, "Come, look" | haggling stereotypes |
| The Pigeon Man (Beyazıt) | bird-chirpy, affectionate | harm to animals |
| The Fish Porter (Kumkapı) | huge, few words, a worker | mockery |
| The Docent (Topkapı Sarayı, TR owner check; D-060) | to be rewritten by owner (was: fast sales patter, numbers, for The Wholesaler) | to be rewritten by owner (was: ethnic trade clichés) |
| The Antiquarian (Haliç–Balat, TR owner check; D-060) | to be rewritten by owner (was: shouting, "One more seat, bro!", for The Dolmuş Driver) | to be rewritten by owner (was: a real route or driver slang) |
| The Evening Crowd (Yenikapı) | not one voice: a chorus; repetition | speaking as one person |
| The Grill Man (Samatya) | warm host, dangerous hospitality | religious or regional imagery |
| The Key Keeper (Yedikule) | mysterious, short, "Mine." | legend, religion |
| The Hose Man (Kazlıçeşme) | hums, repeats | pollution jokes |
| The Dye Foreman (Zeytinburnu) | shift boss, orders: "Shift's not over!" | mocking workers |
| The Principal (Bakırköy) | strict but kind, the bell | a real school; mocking students |
| The Ice-Cream Man (Bakırköy shore) | spoiled sweetness, "free" | a regional vendor stereotype |
| The Yacht Owner (Ataköy shore) | spoiled, "This dock is mine!" | class mockery |
| The Honorable Big Bro (Ataköy) | Ahmet Abi: sorrow, softness (see his card) | malice |

---

## 5. Comedy devices that work in English

| Device | What it does | Example | Watch out |
|---|---|---|---|
| **Understatement and bathos** | name a catastrophe in a small voice | "Power's out. Cool. Cool cool cool. Their eyes are glowing." | don't add the feeling afterward |
| **Flat honesty** | say the obvious thing plainly (the South Park / Rick and Morty cadence) | "It's a fight, not a first date." | one per pool; no catchphrases |
| **Specific over generic** | the odd detail is the joke | "Half a dürüm in my bag. That's my whole life." | a detail Arda would actually have |
| **Polite absurdity** | formal manners in an unformal disaster | "Sorry, pal. Did I step on your foot?" | no "sir/madam" without a joke |
| **List with a bad third** | two reasonable items, then the wrong one | "Mom would ask if I ate. Did I eat? Define eat." | keep lists short |
| **Mom guilt** | fear turned into a chore | "Mom would ask if I'm wearing a jacket. Technically, yes." | don't mock her; Arda is the joke |
| **Self-aware movie talk** | Arda knows the genre, brand-free | "Head shot. Like in the movies. Always works in movies." | no titles, no actors |
| **Anticlimax** | a big setup, a tiny landing | "Big plan. Plan: walk." | the small thing must be a real thing |

**Doesn't work:** jokes built on a Turkish idiom translated word for word, wordplay for its own sake, fortune-cookie lines, explained jokes, the same frame three times in a row (e.g. "Mom would say..." ×3), a stutter gag more than once per pool.

---

## 6. Profanity (PROPOSED: owner approval needed)

**Owner direction (2026-11-09):** swearing is **allowed**; the audience likes South Park and Rick and Morty. Rating target **16+** (PEGI 16 / App Store 17+).
This **changes** the brief's default ("nothing beyond *ya* and bloody"). The tiers and caps below are proposals.

| Tier | Words (examples) | Rule |
|---|---|---|
| **1 free** | damn, hell, crap, ass, jerk, idiot, dumbass | in a fright or a flat reaction; at most one per line |
| **2 sparing** | shit, bullshit, asshole, pissed | at most one per pool; about **3%** of all lines |
| **3 the peak** | "fuck" | a handful in the whole game, only at a real peak (Arda, Kaan or Mila), never in a pool's first line |
| **4 banned** | slurs of any kind, mother-based insults, religious oaths ("Jesus", "goddamn"), sexual violence, anything aimed at a group | never; the banned list (tests) catches it |

- **Swears:** Arda (1–3, under pressure), Kaan (1–2, loud, with food and animals), Mila (1–2, dry and short), Barış (1).
- **Never swear:** Mom, Dad, Ada, Ahmet Abi, Usta Cemal (at most "damn it"), Dede (at most "damn it"), the narrator, Hande.
- **A curse adds punch, it isn't the joke:** if the line isn't funny with the curse removed, rewrite it.
- About **one line in six** at most may contain any profanity; tier 2 no more than once in twenty-five lines.

---

## 7. Banned and translationese lists (checked by tests)

Machine-readable list: **[tools/dialogue-banned.json](../prototype/tools/dialogue-banned.json)** (proposed, subject to owner approval). `node prototype/tools/check-banned.js` runs it today (report only; `--strict` fails on guardrail hits); Phase 3 wires it into `tools/test-dialogue.js`:
**guardrail words must produce zero hits;** translationese and Britishisms are **flags** that go to the editor.

**EN:**
| Don't write | Write | Why |
|---|---|---|
| Mum, mate, bloody, flat, lorry, rubbish, queue, council | Mom, man/pal, damn, apartment, truck, trash, line, city | American English (§3) |
| "(abi means big brother)" or any parenthetical gloss | let the scene explain it | phrasebook voice |
| two or more Turkish words in one line | one, at most | reads like a tour guide |
| "Took it without asking the council." | "Took it without asking the city." | British / Turkish-calque |
| "Honourable Big Bro" | "Honorable Big Bro" | spelling |
| "Survival is attention, patience and a bit of luck." | a situation, not a slogan | fortune cookie |
| "Hello, my friend!" | "Hey, pal." | stock "foreigner" Turkish |

**Duplicates:** the same text twice in one language is an error.
**Turkish whitelist for EN lines:** *abi, usta, dede, simit, dürüm, döner, çay, dolmuş, kapıcı, Paşa/Pasha, nazar*, plus place and person names.

---

## 8. Three example rewrites per main character

> Each line is rewritten in English from the **same beat intent** as the Turkish one, but **independently**: jokes differ on purpose. Turkish: [voice-tr.md](voice-tr.md) §8.
> **Now** = the English line in the game today ("(new)" = the beat doesn't exist yet). **Proposed** = in this bible's voice.
> All are **drafts**; only the owner or a native editor can mark a line approved.

### Arda
| Beat and intent | Now | Proposed |
|---|---|---|
| `BK.close`: a zombie is too close; Arda retreats in mock politeness | "Don't come so close. I've got personal space." | "Buddy, it's a fight, not a first date. Back up." |
| `barkBlackout`: the lights die, the eyes glow; Arda deadpan | "Power's gone... their eyes are glowing." | "Power's out. Cool. Cool cool cool. Their eyes are glowing." |
| `BK.low`: health is low; Arda bargains with his own legs and snacks | "Survival is attention, patience and a bit of luck." | "Ten percent health. I've started negotiating with my legs." |

### Mom
| Beat and intent | Now | Proposed |
|---|---|---|
| `callB3`: first call; relief turns into nagging, no fear | "Traffic's gridlocked, son. Nobody's moving." | "Everything's stopped out here, sweetie. Eat something. Don't talk to strangers." |
| `callA2`: opening; she hides fear behind questions | "Arda! Where are you? Did you see the news?" | "Arda. Arda, baby, talk to me. Say anything. Say you ate." |
| `callD1`: last words before the line drops; small and domestic | "...we love you... come home..." | "...did you take a jacket... [static] ...come home..." |

### Dad
| Beat and intent | Now | Proposed |
|---|---|---|
| `FINb5`: the letter's end; love as an instruction | "Love you. Dad." | "Eat. Sleep. D." |
| `FINb3`: where the family is, one rule | "Son, Mum and Dede are in Sarıyer, at Dede's place. Keep off the highways." | "Your mother and Dede are at Dede's place in Sarıyer. Stay off the highways. Everything else is a detour." |
| `FINb4`: the one warning, no explanation | "Whatever the radio says about the forest up north, stay away from it." | "If the radio mentions the forest up north, turn it off. That's an instruction, not advice." |

### Kaan
| Beat and intent | Now | Proposed |
|---|---|---|
| `L18s`: first meeting; scared and loud | "Stop! Don't come closer! Are you... infected?" | "Back off! I flip fish for a living, I'm not built for this! ...Are you bit?" |
| `CMPc`: Arda admitted the crush; Kaan teases | "Everyone knows, man. Now you've admitted it." | "Man, the seagulls knew. The seagulls had a pool going." |
| `H06p2`: a smart idea, in food terms | "Luggage cart! Push it at the gate, zombies can't get through." | "Luggage cart! Wedge it in the gate. Packed tighter than a dürüm, nothing gets through." |

### Mila
| Beat and intent | Now | Proposed |
|---|---|---|
| `FINb8`: she shows up at the door; no hello, takes charge, counts | "Arda! You're heading to Sarıyer, right? My parents' safe house is in Zekeriyaköy, right next to it. I'm going there too." | "Arda. You're going to Sarıyer. My parents are in Zekeriyaköy, right next door. Okay, go. One, two..." |
| (new) she refuses help | — | "I'm faster alone. Go, I'll catch up. ...Stop looking at me like that." |
| (new) the scrunchie seed: Arda mentions the old prize | — | "Second-place prize. Yeah. I kept it. It's a hair tie, okay?" |

### Ada
| Beat and intent | Now | Proposed |
|---|---|---|
| (new) her first full sentence; tiny and enormous | — | "Is it always this loud out here?" |
| (new) she calms herself by counting | — | "Forty steps to the corner. Seven seagulls. Counting helps." |
| (new) her first simit | — | "It has a hole in it. On purpose?" |

### Ahmet Abi
| Beat and intent | Now | Proposed |
|---|---|---|
| `H20b`: boss; warm bread, sorrow | "Take some bread, my boy. Then forgive me." | "I kept your bread, kiddo. Still warm. Don't be scared... come here." |
| (new) lobby welcome | — | "You're late, kiddo. Tea's on, bread's warm. Wipe your feet." |
| (new) a farewell before the fight | — | "Go on, son. I never did lock that door... I'm sorry." |

---

## 9. Owner decisions (2026-11-09; Phase 3 writes to these)
1. **Dad's letter: DECIDED.** No "love you", an instruction instead: "Eat. Sleep. D." (Turkish signs "Baban.", spelled out.)
2. **Profanity level (§6): APPROVED** as proposed (tiers and the 3% cap).
3. **"Fat" names: DECIDED.** "Bloated Waiter" in English; the Turkish name is **Dombili**.
4. **American English: DECIDED.** "Mom" in the speaker tag and in lines, spellings per §3; the Turkish keeps "Anne".
5. **Mila and Ada new beats: APPROVED** (refusing help, the scrunchie, the first simit, counting).
6. **The banned list: APPROVED** (`tools/dialogue-banned.json`).
