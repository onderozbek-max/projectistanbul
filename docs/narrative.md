# Project Istanbul: Narrative Bible (Chapters 1–3)

> **Status:** Draft v0.2 · 2026-11-08 · Game title: see [product.md](product.md) §1.1
> **Scope:** Story only. Product, design and tech decisions live in [product.md](product.md).
> Level numbers are global (Chapter 1 = 1–100, Chapter 2 = 101–200, Chapter 3 = 201–300).
>
> **Naming rule (D-013):** main characters get names that are real and common in Turkey **and**
> easy to read and say worldwide: short, no Turkish-only letters (ğ, ş, ı, ç, ö, ü), and
> no awkward meanings in English, German or Greek. Places and food keep their real Turkish spelling.

---

## Logline

A zombie outbreak hits Istanbul during dinner. A 20-year-old has to fight his way home
on foot, then across the city on hacked e-scooters, then across Turkey, always one step
behind a family that keeps leaving him letters. Each letter knows a little more than it should.

## Tone

- **Shaun of the Dead × Turkish dizi.** Comedy shows up most often. Heart hits harder.
  Horror hits hardest.
- **Local jokes, universal delivery.** Turks catch the extra layer; everyone else still gets
  the visual gag.
- **Every chapter ends on a dizi cliffhanger:** freeze frame, the triple dramatic zoom
  across faces, swelling strings. Players should see it coming and love it anyway.
- **Character first.** Gameplay fights are the "action scenes"; between them, people talk,
  joke, flirt and argue. That's what other games in the genre don't have.

---

## Characters

### Names at a glance (D-013)
| Character | Name | Why it works in Turkey and worldwide |
|---|---|---|
| Player hero | **Arda** | Popular Turkish name, two easy syllables everywhere ("AR-dah"); globally familiar from football |
| Best friend | **Kaan** | Common Turkish name; English speakers naturally say "Kahn", which is right and sounds strong |
| The crush | **Mila** | Owner's pick. Used in Turkey and hugely popular in Europe and the US; impossible to mispronounce |
| The mystery girl | **Ada** | Turkish for "island" (isolated, fits her). Known worldwide (Ada Lovelace: science, fitting for a lab escapee). Enables the ADA-07 twist |
| Dad / Mom / Grandpa | **Selim / Leyla / Hasan Dede** | Turkish-authentic, readable in English and German |
| The cat | **Paşa** (EN: **Pasha**) | Localized spelling per language via string keys |

### Arda (the player): 20, university student, "the versatile one"
- Lives in Ataköy with his parents. Fixed protagonist (name + voice) for v1.
- **Gameplay:** balanced stats; can spec into any direction. Unique role: *hacker/mechanic*.
  He hacks scooters, upgrades vehicles and crafts gadgets.
- **Signature weapon:** the döner knife (*Döner Bıçağı*). It gets a full evolution line
  (`weapons-skills.md` §7), ending in the legendary *Usta Satırı* (Usta's Cleaver).
- **Arc:** a kid who calls his mom for everything → the person everyone looks to.

### Kaan: 21, "the tank"
- Works the grill on a rocking *balık-ekmek* boat in Eminönü; hauls ice crates all day.
  Huge, slow, loud, loyal. Jokes constantly so nobody sees he's scared.
- **Gameplay:** high HP and damage, slow movement. Weapon: a boat anchor on a chain.
  Ability: *Ground Slam*.
- **Arc:** stranger → best friend → rival in the love triangle → the brother Arda never had
  (whichever way the triangle goes).

### Mila: 20, "the speedster"
- Arda's long-time crush from Ataköy. University sprinter. Sharp, competitive, a natural
  leader. Doesn't need saving and will tell you so.
- **Gameplay:** very fast, low HP. Dash strikes, kiting. Weapon: twin telescopic batons.
- **Goal:** reach her parents' safe house in Zekeriyaköy.
- **Arc:** "the girl Arda likes" → co-leader of the group. Has to choose between family and group.

### Ada: ~19, "the mystery"
- Rescued from a horde in Kağıthane (Chapter 2). Barely speaks. Hides a facility wristband.
  Won't even give her name at first; the group calls her "the girl".
- **Gameplay:** ranged/support (slingshot → crossbow). Passive *Calm*: nearby zombies slow
  down and hesitate. **Players should notice this before any character comments on it.**
  The mechanic is the first story clue.
- **Secret (revealed gradually):** escaped from **Kuzey Labs**, a private biotech facility in
  the northern forest. She is not infected; she is *something else*. Arda's father got her out.
- **Arc:** silent → trusted → the key to the season-wide mystery.

### Family
| Who | Role | Secret / function |
|---|---|---|
| **Dad (Selim)** | "Civil engineer". Talks to Arda only through letters + upgrade packages | Did contract work for Kuzey Labs. Each letter knows more than the last. |
| **Mom (Leyla)** | The voice on the dropped call in Level 1 | The emotional anchor; the reason Arda keeps going |
| **Dede (Hasan)** | Grandpa: retired Sarıyer fisherman, grumpy and funny | Owns the boxy 1980s sedan that becomes the Chapter 3 vehicle |

### Factions
| Faction | Debut | Who they are | How they fight |
|---|---|---|---|
| **Zombies** | Ch. 1 | The infected | Swarm, dumb, relentless |
| **Kuzgunlar** (The Ravens) | Ch. 2 | Scavenger street gang | Ambushes, steal loot and batteries |
| **Site Yönetimi** (The Management) | Ch. 2 | A gated-community management board turned petty dictatorship | Walls, rules, "aidat" (dues), private guards. Pure satire. |
| **Köprü Beyleri** (Bridge Lords) | Ch. 3 | Organized gang charging tolls at the bridges | Checkpoints, vehicles, ranged |
| **Kuzey Güvenlik** | Ch. 2 tease, Ch. 3+ | Private security of Kuzey Labs, grey uniforms | Professional, coordinated, hunting Ada |

### Recurring: the cats
Istanbul's street cats don't get infected. They hiss when zombies are near (early warning)
and walk into cutscenes at the worst possible moments. An orange tabby named **Paşa** adopts
the group in Chapter 1 and never leaves.

---

## Chapter Structure

Chapter 1 = **100 levels = 20 hoods (neighbourhoods) × 5 levels**, one walk from Taksim to Ataköy (D-027;
map in `journey.md`). Chapters 2–4 keep the district format below until they get their own journey pass.
- Chapter 1: level **5 of each hood** = the hood boss, and a comic page closes the hood (D-028).
- Chapters 2–4: Level **x5** = mini-boss · Level **x0** = district boss + a major story beat.
- Small story beats (banter, bond scenes, letters) every 2–4 levels.

---

## Chapter 1: *Eve Dönüş* (Homecoming)
**Taksim → Ataköy · on foot · Levels 1–100 · Squad: Arda (+ Kaan from L20, proposed)**

**Synopsis:** Arda is eating döner on İstiklal when a breaking-news report flickers on the
restaurant TV. Seconds later the man at the next table drops his dürüm and bites his friend.
Arda remembers every zombie movie he's ever watched and puts his döner knife through the man's skull.
He calls Mom ("I'm coming home"), then the call drops. Networks are dead, transit is dead,
traffic is gridlocked. Ataköy is 17 km away and the only way there is to walk.

| Arc (journey §8.2) | Hoods (levels) | What happens | Hood boss (stage 5) |
|---|---|---|---|
| A. İstiklal & Galata | H01–H02 (1–10) | Cold open: TV, the bite, the knife. Dropped call. Tutorial by fire. On Galata: zombie tourists with selfie sticks. | *The Vatman* (L5): a zombie tram driver in a derailed red tram. *Tour Guide* (L10). |
| B. Karaköy & the Bridge | H03–H04 (11–20) | Paşa the cat hisses at an empty alley... it isn't empty. Zombie fishermen cast lines that reel you in. **Kaan joins after the bridge boss (L20, proposed):** a misunderstanding (he thinks Arda is infected), then a team-up. | *The Bride* (L15): a zombie wedding party in a Karaköy café. *Big Fisherman* (L20). |
| C. Eminönü & Sirkeci | H05–H06 (21–30) | Spice clouds as hazards (pepper = stun). Kaan has to put down his zombified boat captain. First emotional beat. Sirkeci ends the slice at L30. | *The Captain* (L25): anchor chain sweep. *The Ticket Man* (L30, slice end). |
| D. Grand Bazaar & Beyazıt | H07–H08 (31–40) | Maze levels. Humans looting the gold shops. First hint that people are the next threat. | *The Carpet Golem* (L35). *The Pigeon Man* (L40). |
| E. Laleli & Aksaray | H09–H10 (41–50) | Mannequins everywhere (are they zombies?). First night level. **Campfire:** Arda admits his crush on Mila. Kaan teases him, then goes quiet. *(Triangle seed.)* | *The Wholesaler* (L45). *Dolmuş Driver* (L50). |
| F. Kumkapı & Yenikapı | H11–H12 (51–60) | Fish market, then the underground Marmaray station with flashlight-only levels. | *Fish Porter* (L55). *The Evening Crowd* (L60): a station-wide horde. |
| G. Samatya & Yedikule | H13–H14 (61–70) | Sunrise over the sea. The walk turns along the coast. | *The Grill Man* (L65): the barbecue horde (was "The Picnic"). *Key Keeper* (L70). |
| H. Zeytinburnu & Kazlıçeşme | H15–H16 (71–80) | The coastal road. A crackling radio mentions "safe zones" and "stay away from the north". | *Dye Foreman* (L75). *Hose Man* (L80). |
| I. Bakırköy | H17–H18 (81–90) | Outskirts, an abandoned mall, Arda's old high school. | *The Principal* (L85). *Ice-Cream Man* (L90). |
| J. Ataköy | H19–H20 (91–100) | Home. The apartment is empty. **Dad's Letter #1** + toolkit + Arda's electric scooter. The family went to Dede's in Sarıyer. Ominous line: *"Avoid the highways. And whatever the radio says about the forest up north, stay away from it."* | *Yacht Owner* (L95). *Ahmet Abi* (L100): the beloved apartment *kapıcı* who brought bread every morning. Bittersweet. |

Hood-by-hood beats and stage data: `journey.md` §5. Names: `journey.md` §9.8 ("Rush Hour" is a film title and is now The Evening Crowd).

**Cliffhanger (L100):** A knock on the door. Arda raises the knife. It's **Mila**.
Freeze. Zoom × 3.

---

## Chapter 2: *Şarj Bitmeden* (Before the Battery Dies)
**Ataköy → Sarıyer → Zekeriyaköy · e-scooters · Levels 101–200 · Squad: Arda, Kaan, Mila (+ Ada from L150)**

**Synopsis:** Mila's parents have a safe house in Zekeriyaköy, right next to Sarıyer where
Arda's family went. The three set off together. Mila and Kaan find shared e-scooters on the
street and Arda hacks them. **Battery charge becomes the new survival resource.** Zombies are
no longer the only threat. People are worse.

| Levels | District | What happens | District boss (x0) |
|---|---|---|---|
| 101–110 | **Ataköy & Bakırköy streets** | Scooter hack (Arda's skill tree unlocks). **Mila joins.** Kaan and Mila bicker instantly. | *The Scrapyard Horde* |
| 111–120 | **D-100 highway** | The world's biggest parking lot, now full of the dead. First vehicle combat levels. | *The Bendy Bus*: an articulated bus packed with zombies |
| 121–130 | **Topkapı & the Theodosian Walls** | **First human enemies:** the Kuzgunlar ambush the group and steal their batteries. | *Kuzgun Lieutenant* |
| 131–140 | **Golden Horn (Haliç) crossing** | Get the batteries back. Mila takes charge; Arda notices Kaan noticing her. | *Reis*: Kuzgunlar leader |
| 141–150 | **Kağıthane** | They save a barefoot girl from a horde. She won't speak. **Ada joins.** Players see *Calm* in action. | *The Swarm* |
| 151–160 | **Levent & Maslak** | Skyscrapers. *Site Yönetimi* controls a luxury residence and demands "aidat" to let them pass. Mila–Ada friction starts. Bond system expands to three relationships. | *The Security Chief* |
| 161–170 | **İstinye & Emirgan** | Bosphorus shore. In Emirgan Park, the girl finally says her name: **Ada**. Kaan jokes that it means "island" in Turkish, "which explains a lot". | *The Gardener* |
| 171–180 | **Yeniköy & Tarabya** | Yalı mansions. Site Yönetimi HQ. Satire peaks: a zombie apocalypse and they're still fining people for parking. | *The Yönetici* (The Manager) |
| 181–190 | **Sarıyer** | Dede's house: empty. **Dad's Letter #2**: they drove to İzmir (radio says it's safe). Left behind: upgrade pack, toolbox and **Dede's boxy 80s sedan**. Warning: *"There's a facility in the forest. If you see people in grey uniforms, run."* Ada's hands start shaking. | *The Fish Market* |
| 191–200 | **Zekeriyaköy forest** | **Mila's parents are alive.** First reunion in the game, a deliberate emotional payoff. Her mom, a doctor, treats Ada's wound and goes pale at the blood work. That night, grey-uniformed **Kuzey Güvenlik** sweep the forest with drones. They're hunting someone. Mila's parents stay to hold the house; Mila chooses the group. | *First contact: Kuzey Güvenlik squad* |

**Cliffhanger (L200):** Mila's mom pulls Arda aside: *"That girl isn't infected. She's
something else. Keep her close and keep your eyes open."* Cut to Ada, watching them.
Freeze. Zoom × 3.

---

## Chapter 3: *Yol* (The Road)
**Sarıyer → İzmir · Dede's sedan · Levels 201–300 · Squad: Arda, Kaan, Mila, Ada**

**Synopsis:** Four people, one rattling old sedan, 550 km of collapsed country. The car is
a character now: upgrade it, armor it, keep it fueled. **Fuel becomes the survival resource.**
The love triangle comes to a head, and Ada's past catches up with everyone.

| Levels | District | What happens | District boss (x0) |
|---|---|---|---|
| 201–210 | **Northern forest roads** | Escape the grey uniforms. Car upgrade system unlocks. | *The Drone Swarm* |
| 211–220 | **The Third Bridge** | *Köprü Beyleri* control the bridge and charge tolls. Kaan: "Every bridge has a toll. Some things never change." | *The Köprü Beyi* |
| 221–230 | **Anatolian-side outskirts** | Abandoned logistics hubs, fuel hunting. Ada draws a floor plan from memory and won't explain it. Her sleeve slips: the hidden wristband reads **ADA-07**. Is "Ada" her name, or her lab code? | *The Forklift* |
| 231–240 | **Gebze industrial zone** | Factories and a gang-run fuel depot. Heist-style levels. | *The Depot Boss* |
| 241–250 | **Osmangazi Bridge** | Set-piece car chase over İzmit Bay. Afterwards **Kaan confesses he has feelings for the girl Arda is closest to.** The triangle explodes. *(See Branching.)* | *Bridge Lords convoy* |
| 251–260 | **Orhangazi & Gemlik** | Olive groves, quiet roads. Rift or repair, depending on bonds. Low Kaan bond: he storms off on foot. | *The Olive Press* |
| 261–270 | **Bursa** | Home of İskender. **Callback to the opening döner:** the group's first real meal, a heart scene. Ada opens up: she was a "volunteer" at Kuzey Labs. | *The Silk Market Horde* |
| 271–280 | **Balıkesir plains** | Night drives, campfire, a bond-gated romance scene. If Kaan left, he comes back here and saves the group from Bridge Lord remnants. *(Bottleneck.)* | *The Remnants* |
| 281–290 | **Manisa approach** | A refugee convoy. The rumored İzmir "safe zone" is run by a private contractor, and Ada recognizes the logo. | *Convoy Raiders* |
| 291–300 | **İzmir** | The Kordon waterfront. **Reunion with Mom and Dede** (payoff #2). Dad isn't there; he went back north. **Dad's Letter #3** is addressed to Arda... *and Ada*. | *The Kordon Horde* |

**Cliffhanger (L300):** Ada pulls Dad's old ID badge out of the box. **Kuzey Labs.** She
speaks more than she has all game: *"I know your father. He's the one who got me out."*
Freeze. Zoom × 3. **End of Chapter 3.**

---

## Romance & Branching

**Model: branch-and-bottleneck.** Choices change scenes, banter, bond levels and combo
abilities, but the main plot always reconverges at chapter bosses. Affordable for a solo
builder, still meaningful to players.

- **Bond meters:** Arda ↔ Kaan, Arda ↔ Mila, Arda ↔ Ada. Raised by dialogue choices,
  fighting side by side, and gifts found in levels.
- **Bonds unlock gameplay:** combo ultimates (e.g., Arda + Mila *Scooter Drift*,
  Arda + Kaan *Tackle & Stab*, Arda + Ada *Silent Shot*).
- **The triangle targets your favorite:** at L241–250, Kaan confesses feelings for
  **whichever girl Arda has the highest bond with**. One scene, one variable, and it always
  feels personal.
- **Kaan's branch:** high Kaan bond → he steps aside, big-brother moment. Low bond → he leaves
  at L251–260 and returns at L271–280 (bottleneck).
- **No romance "locks" in Chapters 1–3.** Keep it unresolved; dizis run for seasons.

## Season-Long Mysteries

| Thread | Seeded | Escalates | Pays off |
|---|---|---|---|
| Dad knows more than he says | Letter #1 (L100) | Letter #2 (L190) | Badge reveal (L300) → Ch. 4 |
| Ada is "something else" | *Calm* passive (L150) | Blood test (L200), floor plan + **ADA-07** wristband (L230) | "Your father got me out" (L300) |
| Kuzey Labs | Radio "stay away from the north" (L80) | Grey uniforms (L200) | İzmir contractor logo (L290) → Ch. 4 |
| The "parents already left" pattern | L100 | L190 | **Subverted** by two real reunions (L200, L300), with one absence (Dad) that drives Ch. 4 |

## Writer Guardrails

- **No real state actors.** No police, military or government factions or symbols. Kuzey
  Labs and every faction are fictional and private.
- **No earthquake imagery.** Istanbul has real fear around "the big one". Keep destruction
  clearly zombie-movie.
- **No religion as a target**, and no real political parties, figures or ethnic conflicts.
- **No real brands or club crests** (food chains, transit liveries, football clubs) without
  a license. Generic colors and silhouettes only.
- **Landmarks are fine** (Galata, the bazaars, bridges, walls), shown with respect.
- **Food naming:** it's *döner/dürüm* in Istanbul. Never "gyro".
- **Rating target 16+** (human enemies). Violence stays stylized, no gore close-ups.

## Open Narrative Questions

1. Fixed protagonist forever, or add a female protagonist option in a later season?
2. How much does Paşa the cat matter? A cosmetic mascot, or a real story role?
3. Chapter 4 direction: back north to Kuzey Labs, or keep heading toward the Aegean/Greece
   (setting up an Athens spin-off)?
4. Voice acting scope: full Turkish VO, or VO for cliffhangers and key scenes only?
