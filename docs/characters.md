# Project Istanbul: Cast Bible (looks, backgrounds, voices)

> **Status:** Proposed v0.1 · 2026-11-09 · Owner: Onder (creative freedom given to the writer: "100% creative freedom")
> **Scope:** Who each person is, why a player should like them, and how that shows on screen.
> Story beats stay in [narrative.md](narrative.md); gameplay roles stay there too. Where this file adds a fact the
> narrative does not state, it is marked **(new)** and logged as proposed decision D-049 in [product.md](product.md) §17.
> Art lives in `prototype/js/view/comic-busts*.js` (busts) and `art-characters.js` (in-run hero).
> Preview every bust: `prototype/tools/cast-sheet.html` (e.g. `?who=arda,mila&moods=neutral,happy&s=200`).

---

## 1. Why the old faces failed, and the charm rules that replace them

The v0.8 busts read as "sketches": a long narrow head, tiny eyes pushed together, a long neck, huge shoulders, flat hair.
Players read faces first; a face that looks like a diagram is a stranger, and strangers do not get empathy.

**Charm rules (binding for every character, every mood):**

| # | Rule | How it is built |
|---|---|---|
| 1 | **Round, slightly wide head.** Width is about 0.9 of height. Soft chin, full cheeks. | `headPts()` in `comic-busts.js`; `fw` widens, `jw` squares the jaw |
| 2 | **Big, low-set eyes with two highlights.** Eyes sit below the head's midline and far apart. This is the single biggest "cute" lever. | `eyes()`; `eyeK` per character (Ada 1.22, Arda 1.0) |
| 3 | **Short neck, head about 0.39 of bust height.** | `neck()` |
| 4 | **Soft cheeks always on.** Blush is part of the neutral face, stronger on `happy`. | `face()` |
| 5 | **Warm, saturated shade colours.** Skin shade is a warm terracotta, never grey-brown. | `skinS` per character |
| 6 | **One silhouette cue each**, readable in a cropped panel at thumbnail size (ponytail, cap, towel, beanie, bell hair). | `style`, `towel`, `cap` |
| 7 | **One colour family each**: Arda red · Mom teal · Dad powder-blue · Kaan navy-and-white + towel red · Mila gold · Ada ash-grey · Dede cream-and-navy · Ahmet Abi brown. | `topC` |
| 8 | **A flaw you can see.** Cowlick, laugh lines, crooked glasses. Perfect faces are not relatable. | per character below |
| 9 | **Hair has a shine stroke.** Cheapest way to look cared for. | `hairHi` |
| 10 | **Show the real range of Turkish looks.** Turkey is Balkan, Aegean, Black Sea, Anatolian and more: blond and blue-eyed, olive, dark, red-haired. No character is drawn to match the "traditional Middle Eastern" or "radical" caricature; facial hair is a per-person choice, never a costume. | cast review |
| 11 | **Nobody is a joke face.** Humour comes from what they say, not from drawing them ugly. Older characters stay handsome. | review rule |

Guardrails still apply (narrative.md): no real brands or crests, no religious dress as costume, no real state actors.

---

## 2. The squad

### Arda Demir · 20 · "the kid who fixes things" (player)
**Look.** Round warm face, big brown eyes, a quiff that never stays down (the cowlick is the flaw), a sheepish half-grin,
thick friendly brows. Red hoodie one size too big, backpack strap, **one earbud always in**.
**Palette.** Hoodie red `#E0323F`, tee `#262B3F`, skin `#E3B088`.
**Background.**
- Second-year computer engineering student, commutes across the city; still lives at home in Ataköy and secretly loves it.
- Learned to fix things at nine by taking apart the family rice cooker, then putting it back together with one screw "left over".
  His father's toolbox is where "hacker/mechanic" comes from.
- Every Thursday after class he eats döner on İstiklal at Usta Cemal's, who calls him *Profesör* and lets him pay on Friday.
- Watched every zombie film alone at night with the volume low so Mom would not hear. Never expected to need it.
**Wants** to get home. **Needs** to find out he can decide things without calling Mom first.
**Fear.** That without her voice he is a fraud.
**Flaw.** Overthinks until the moment passes; deflects with sarcasm under his breath.
**Relatable truth.** He still texts "Anne, ütü fişi nerede?" (Mom, where's the iron plug?) at 20.
**Tells.** Touches the earbud when stressed. The earbud plays nothing now (no signal); he keeps it in for comfort.
Hoodie was Mom's 20th-birthday gift, bought a size up "so you can grow into it". It is the one thing he has of home.
**Voice.** Dry, quick, self-deprecating. Never mean. Talks to zombies and to himself. (D-035)
**Gameplay hook.** Hacker/mechanic: his gadgets *are* the Dad's-toolbox lineage; the knife is Usta Cemal's spare **(new)**.

### Kaan Aydın · 21 · "the teddy bear with an anchor"
**Look.** Broad and soft but handsome: a **blond, sun-bleached textured crop with a swept fringe**, **blue eyes**, fair skin
a little pink from the boat sun, clean-shaven, a tiny gold stud. Navy-and-white striped tee (the boat uniform),
**red checked kitchen towel on the shoulder** (his silhouette cue). Biggest shoulders and neck in the cast.
Blond and blue-eyed is common in Turkey (Balkan and Black Sea roots, Balat's mixed neighbourhood), which is the point.
**Palette.** Hair `#E4B95C`, eyes `#3C8DE0`, stripes `#1F3E6B` on `#F4F1EA`, towel `#D7263D`.
**Background.**
- Grew up in Balat with his grandmother **Fatma Nine** **(new)** and two cousins. Started hauling ice at 14 on a *balık-ekmek*
  boat in Eminönü. The captain, **Kaptan Nuri**, is the nearest thing he had to a father.
- Dream: his own stand called *Fatma Nine Balık Ekmek*. Has the sign half-painted in his grandmother's garage.
- **Cannot swim** **(new)**. "The boat doesn't need me to swim. The boat needs me to flip fish."
- Apologises to furniture when he bumps into it. Cries at animal videos and denies it.
**Wants** to keep everyone fed and together. **Needs** to let someone look after *him*.
**Fear.** Losing the people he feeds. (This is why the Captain scene at L25 hurts.)
**Flaw.** Jokes so nobody sees he is scared; talks louder and faster the more frightened he gets.
**Relatable truth.** The funny friend who is quietly carrying the most.
**Tells.** Hums the ferry horn when nervous. Wipes his hands on the towel before saying something sincere.
**Voice.** Loud, warm, teasing ("Abi"). Food metaphors for everything.
**Arc.** Misunderstanding on the bridge (he thinks Arda is infected: Arda *is* pale and shaking, so it is fair) → brothers → rival
for Mila → whichever way the triangle goes, the brother Arda never had.

### Mila Kaya · 20 · "the one who runs toward it"
**Look.** Sleek high ponytail with a **red scrunchie** (silhouette cue), green-hazel eyes with lashes, small beauty mark by the
mouth, a half-smirk as her neutral face. Gold track jacket with white sleeve stripes.
**Palette.** Jacket `#F2B632`, hair `#1F1410` with copper highlight, scrunchie `#D7263D`.
**Background.**
- 400 m runner at the university: "the event nobody likes, which is why I do it". Mother is a PE teacher at **Arda's old high school**
  in Bakırköy **(new, pays off at L85)**.
- Grew up two floors up in the same Ataköy complex. As kids she raced Arda to the school-bus stop every day and never lost.
- The red scrunchie was a joke prize Arda gave her in 9th grade ("for second place, which is you"). She still wears it.
  Arda does not know she kept it. **(new, the quiet romance seed.)**
- National-team trials were next month. She is not thinking about that.
**Wants** to reach her parents in Zekeriyaköy. **Needs** to stay when staying is the harder thing.
**Fear.** Stopping: if she stops she has to feel it.
**Flaw.** Cannot accept help; says "I'm faster alone" and means "I'm scared".
**Relatable truth.** Competent, proud, and tired of being told she does not need anyone.
**Tells.** Bounces her heel. Tightens the scrunchie when she is deciding something big.
**Voice.** Clipped, funny, competitive. Counts things out loud. Never says "please", always says "okay, go".

### Ada · ~19 · "the one who looks at the sea"
**Look.** Ash-silver bob with blunt bangs, **very large teal eyes**, pale skin, an oversized grey hoodie with the sleeves pulled
over her hands (it hides the wristband). The softest, roundest face in the cast on purpose: she must read as safe before
she reads as mysterious.
**Palette.** Hair `#CDC3B8`, eyes `#5FCFC5`, hoodie `#9AA3AD`.
**Background.**
- Grew up inside Kuzey Labs. Has seen the sea only through a window, and a beach only in a book.
- Never ate a *simit*. Counts things when anxious (steps, tiles, seagulls). Keeps **one bottle cap from every place** as proof
  that the outside is real. **(new)**
- Paşa the cat chose her first, before anyone else did.
**Wants** to stand on a beach. **Needs** to be a person, not a project.
**Fear.** Being "returned".
**Flaw.** Does not know ordinary things, so she is silent rather than wrong.
**Relatable truth.** The new kid who watches everyone else's group chat from outside.
**Tells.** Goes very still when zombies are near (the *Calm* passive: the first clue; see narrative.md).
**Voice.** Almost none. Her first full sentence should be tiny and enormous. Example: "Is it always this loud?"

---

## 3. Family

### Leyla Demir ("Anne", Mom) · 46 · nursery-school teacher
**Look.** Soft round face, a **chestnut bob with one silver streak**, tiny gold earrings, laugh lines, a teal cardigan over a cream blouse.
**Background.** Twenty years of calming three-year-olds is why her voice stays level on a bad line. Sends Arda voice notes that are
mostly weather and food. Calls him *aslanım* (my lion). Hums while she cooks; the hum is how Arda knows the call is real.
**Relatable truth.** "Yemek yedin mi?" (Did you eat?) is how she says *I love you*, in every call, in every situation.
**Why she matters.** The dropped call at L1 is the game's emotional fuse. Her face must be the warmest in the cast.

### Selim Demir ("Baba", Dad) · 49 · civil engineer
**Look.** Round glasses, moustache, grey at the temples, powder-blue shirt, navy tie, an engineer's pencil behind the ear (drawn in letters, not busts).
**Background.** Shows love by fixing things and cannot say it out loud. Taught Arda the multimeter at eleven and called it "our thing".
Wrote Letter #1 in neat capitals. Did geotechnical surveys for Kuzey Labs and saw what he should not have. **(new detail: surveys.)**
**Relatable truth.** Every sentence he cannot say becomes a toolkit he can pack.
**Voice.** Short, exact, dry. Signs letters "B." and nothing else.

### Hasan Karadeniz ("Dede") · 74 · retired fisherman, Sarıyer
**Look.** White bushy moustache and **bushy white brows** (his emotion lives in them), flat navy cap, cream fisherman's roll-neck.
**Background.** Mom's father **(new)**, which is why the family went to him. Widower. Complains about everything and cooks for
everyone. Washes his boxy 1980s sedan every Sunday and calls her *Gelin* (the Bride). Arda's whole "Ben demiştim" (I told you so)
is inherited.
**Relatable truth.** The grandparent whose love arrives as criticism and a full plate.
**Voice.** Grumbles first, then says the kind part under his breath. He appears in Chapter 2 onward; the bust is ready.

### Paşa · "the orange tabby" · age unknown
Hisses at empty alleys (early warning). Adopts Arda at the wedding café (L15), then Ada. No bust: cats appear as comic cut-ins.

---

## 4. Chapter 1 people (the walk)

### Usta Cemal · 58 · döner master, İstiklal
**Look.** Bald with a shine on his head, huge white moustache, bushy white brows, rosy cheeks, white chef's jacket. Broadest shoulders after Kaan.
**Background.** Started as a dishwasher at twelve and built the shop himself. "Döner is patience." Calls Arda *Profesör* and lets him pay on Friday.
He is the reason the knife is in Arda's hand at L1 (it is his spare) and why the "Usta's Cleaver" evolution is named after him.
**Voice.** Booming and kind; pronounces every customer's order like a title.

### Ahmet Abi ("Sayın Abim" to the neighbours) · 63 · kapıcı, Ataköy
**Look.** A silver ring of hair around a bald crown, a big grey moustache, kind droopy eyes, an old brown cardigan.
**Background.** Doorman of the same building for 31 years. Brings bread every morning, waters the lobby plants, knows everyone's business and
keeps it. Has known Arda since he was nine. Keeps a tea-pot on a hot-plate in the booth.
**Relatable truth.** Every building has one adult who sees everything and says nothing. Fighting him is the saddest boss in the game (D-047).
**Voice.** "Evladım" (my child). Slow, tender, never rushes a sentence.

### Barış · 27 · street musician, İstiklal (H02)
Teal beanie, beard, guitar strap, plays the same seven songs. Last line before the hood falls: "My last tune. Then you go too, alright?"

### Hande · 34 · news anchor
Perfectly composed until the broadcast breaks. Appears only in the L1 cold open; her `shout` mood is the game's first scare.

### The shopkeeper (generic) and the zombie (generic)
Kept deliberately plain: the zombie is the only face that should look unwell.

---

## 5. Asset status (what exists today)

| Character | Bust (all 8 moods) | In-run sprite | Notes |
|---|---|---|---|
| Arda | yes | yes (big eyes, blush added v0.9) | comic + in-run |
| Mom, Dad, Usta, Ahmet Abi | yes | no | busts only (phone, letters, panels) |
| Kaan | **yes (new)** | no | speaks 45 lines in Chapter 1; own face now (was a generic "friend"); redesigned blond and blue-eyed, clean-shaven |
| Mila | **yes (new)** | no | previously used the "stranger" bust (a bearded man in a beanie) |
| Ada, Dede | **yes (new)** | no | Chapter 2 cast, ready early |
| Barış, news anchor, shopkeeper, zombie | yes | no | refreshed with the new head |

**Proposed next:** in-run walker-rig outfits for Kaan, Mila and Ada (art-characters.js `OUT`), plus two more moods (`smirk`, `shy`) for banter.

---

## 6. Checking a new face (30-second review)

1. Open `prototype/tools/cast-sheet.html?who=<id>&moods=neutral,happy,scared,shout&s=200`.
2. Shrink to `s=70`. Can you still tell who it is by silhouette and colour alone?
3. Does the neutral face look like someone you would want to sit next to? If not, enlarge the eyes (`eyeK`) before touching anything else.
4. Do the eyes survive `scared` and `determined` without turning into dots?
